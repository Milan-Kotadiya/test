import { RedisConnection, pubClient, redisClient, subClient } from '../Connections/Redis';
import { GameBasic, HTTPSConnection, REDISConnection, REMATCH, SIGNUPUSERdata } from '../Interface';
import {
  GetUser,
  AddUser,
  getTable,
  GetEmptyTable,
  SetEmptyTable,
  SetTable,
  GetReMatchResponse,
  DeleteReMatchResponse,
} from '../Services/RedisFunctions/RedisAll';
import { HttpConnection } from '../Connections/Http';
import { HttpsConnection } from '../Connections/Https';
import { RedLockConnection, redLock } from '../Connections/Redlock';
import { SocketConnection, io } from '../Connections/Socket';
import app from '../Connections/Express';
import express from 'express';
import { Server, Socket } from 'socket.io';
import { RedisClientType } from 'redis';
import { Player } from '../Services/Constructors/PlayerConstructor';
import { comparePassword } from '../Services/Validation/ComparePassword';
import { genPassword } from '../Services/Validation/GeneratePassword';
import mongoose from 'mongoose';
import { Table } from '../Services/Constructors/TableConstructor';
import { SitInTable } from '../Services/MatchMaking/SitInTable';
import EventEmitter from 'events';
import Emitter from '../Connections/Emitter';
import { ModelOptions } from './GameBasicClass';

export class Game extends ModelOptions {
  SocketIO: Server;
  Redlock: any;
  RedisClients: {
    Redis: RedisClientType;
    pubClient: RedisClientType;
    subClient: RedisClientType;
  };
  ExpressApp: express.Application;
  GameTimer: EventEmitter;
  constructor(isLocal: boolean, Redis: REDISConnection, HTTPS: HTTPSConnection, gameBasics: GameBasic) {
    super(gameBasics);
    try {
      if (isLocal === true) {
        Promise.all([
          HttpConnection(HTTPS),
          RedisConnection(Redis),
          SocketConnection(isLocal),
          RedLockConnection(Redis),
        ]);
      }
      if (isLocal === false) {
        Promise.all([
          HttpsConnection(HTTPS),
          RedisConnection(Redis),
          SocketConnection(isLocal),
          RedLockConnection(Redis),
        ]);
      }
    } catch (e: any) {
      // Logger.error(`Eroor At Index.ts : ${e.message}`);
    }

    this.SocketIO = io;
    this.Redlock = redLock;
    this.ExpressApp = app;
    this.RedisClients = {
      Redis: redisClient,
      pubClient,
      subClient,
    };
    this.GameTimer = Emitter;
  }

  GameTimerSays(callback: (Data: { TimerTitle: string; TimerData: any }) => void) {
    Emitter.on('GameTimer', async (Data) => {
      callback(Data);
    });
  }

  async Login(
    UserID: string,
    Password: string,
    socket: Socket,
    callback: (
      error: {
        error: boolean;
        message: string;
      },
      login: {
        Rejoin: boolean;
        TableId: string;
        UserData: Player;
      },
    ) => void,
  ): Promise<void> {
    try {
      const PlayerL: Player = await GetUser(UserID);

      if (PlayerL) {
        const Compare = await comparePassword(Password, PlayerL.Password, PlayerL.Salt);
        if (Compare) {
          if (PlayerL.TableId && PlayerL.TableId !== '') {
            socket.handshake.auth.UserDetails = {
              UserId: PlayerL.UserId,
              TableId: PlayerL.TableId,
            };
            // Rejoin
            callback(null, { Rejoin: true, TableId: PlayerL.TableId, UserData: PlayerL });
          } else {
            socket.handshake.auth.UserDetails = {
              UserId: PlayerL.UserId,
              TableId: '',
            };
            callback(null, { Rejoin: false, TableId: null, UserData: PlayerL });
          }
        } else {
          callback({ error: true, message: 'Password is Invalid' }, null);
        }
      } else {
        callback({ error: true, message: 'UserID is Invalid' }, null);
      }
    } catch (error: any) {
      callback(
        {
          error: true,
          message: error.message,
        },
        null,
      );
    }
  }

  // Send to Clien

  SendToRequester(SendTo: string, EventName: string, EventDetails: any, Message: any) {
    try {
      io.to(SendTo).emit(
        EventName,
        JSON.stringify({
          EventDetails,
          Message,
        }),
      );
    } catch (error: any) {
      // Logger.error(`Error At CallBack: ${error.message}`);
    }
  }

  // SignUP

  async SIGNUP(
    SignUpData: SIGNUPUSERdata,
    socket: Socket,
    callback: (
      error: {
        error: boolean;
        message: string;
      },
      data: any,
    ) => void,
  ): Promise<void> {
    try {
      const Invalid = await GetUser(SignUpData.UserId);
      if (Invalid) {
        callback(
          {
            error: true,
            message: 'User Already Registered!!!',
          },
          null,
        );
      } else {
        // let HasPassword
        const HashPass = genPassword(SignUpData.Password);

        const RedisUser = new Player(SignUpData.UserId, SignUpData.UserName, HashPass.hash, HashPass.salt, socket.id);
        // Saving in Redis
        await AddUser(RedisUser.UserId, RedisUser);
        const Get = await GetUser(RedisUser.UserId);
        if (Get) {
          // save data in Socket;
          socket.handshake.auth.UserDetails = {
            UserId: RedisUser.UserId,
            TableId: RedisUser.TableId,
          };
          callback(null, Get);
        }
      }
    } catch (error: any) {
      callback(
        {
          error: true,
          message: error.message,
        },
        null,
      );
    }
  }

  // Get Table
  async GetTable(
    TableId: string,
    callback: (
      error: {
        error: boolean;
        message: string;
      },
      Tabledata: any,
    ) => void,
  ): Promise<void> {
    try {
      const TableL = await getTable(TableId);
      if (TableL) {
        callback(null, TableL);
      } else {
        callback(
          {
            error: true,
            message: `Table Not Found For TableId :: ${TableId}`,
          },
          null,
        );
      }
    } catch (error: any) {
      callback(
        {
          error: true,
          message: error.message,
        },
        null,
      );
    }
  }

  // Create Table
  async CreateTable(
    Userid: string,
    callback: (
      error: {
        error: boolean;
        message: string;
      },
      Table: Table,
    ) => void,
    EntryFee?: number,
  ): Promise<void> {
    try {
      let PlayerTL: Player = await GetUser(Userid);

      if (this.options.isTableWithEntryFee === true) {
        if (EntryFee) {
          // TODO Create Table With Entry Fee
        } else {
          callback(
            {
              error: true,
              message: 'Entry Fee Is Required TO Join Table',
            },
            null,
          );
        }
      } else {
        let EmptyTable: any = await GetEmptyTable();
        if (EmptyTable && EmptyTable.length === 0) {
          // Create a new table
          const NewEmptyTable = new mongoose.Types.ObjectId().toString();
          EmptyTable = EmptyTable.push(NewEmptyTable);
          await SetEmptyTable(EmptyTable);
          // Add in a new table
          PlayerTL.TableId = NewEmptyTable;
          PlayerTL = PlayerTL;
          await AddUser(PlayerTL.UserId, PlayerTL);
          const CreateTable = new Table(NewEmptyTable, PlayerTL.UserId, this.options.GameTime);
          await SetTable(CreateTable);
          if (this.options.isMinPlayerModeOn === true) {
            await SitInTable(
              CreateTable.id,
              PlayerTL.UserId,
              this.options.MinPlayerToStartGame,
              this.options.LobbyWaitTime,
              this.options.GameTime,
            );
          } else {
            await SitInTable(
              CreateTable.id,
              PlayerTL.UserId,
              this.options.PlayersPerTable,
              this.options.LobbyWaitTime,
              this.options.GameTime,
            );
          }
          callback(null, CreateTable);
        }

        if (EmptyTable && EmptyTable.length > 0) {
          const NewEmptyTable = EmptyTable[0];
          // Add in a table
          PlayerTL.TableId = NewEmptyTable;
          PlayerTL = PlayerTL;
          await AddUser(PlayerTL.UserId, PlayerTL);

          const CreateTable = new Table(NewEmptyTable, PlayerTL.UserId, this.options.GameTime);
          await SetTable(CreateTable);
          if (this.options.isMinPlayerModeOn === true) {
            await SitInTable(
              CreateTable.id,
              PlayerTL.UserId,
              this.options.MinPlayerToStartGame,
              this.options.LobbyWaitTime,
              this.options.GameTime,
            );
          } else {
            await SitInTable(
              CreateTable.id,
              PlayerTL.UserId,
              this.options.PlayersPerTable,
              this.options.LobbyWaitTime,
              this.options.GameTime,
            );
          }
          callback(null, CreateTable);
        }
      }
    } catch (error: any) {
      callback(
        {
          error: true,
          message: error.message,
        },
        null,
      );
    }
  }

  // Send to User By UserId
  async SendEventToUser(UserId: string, EventName: string, EventDetails: any, Message: string) {
    try {
      const PlayerLAST: Player = await GetUser(UserId);

      io.to(PlayerLAST.soketId).emit(
        EventName,
        JSON.stringify({
          EventDetails,
          Message,
        }),
      );
    } catch (error: any) {
      // Logger.error(`Error At CallBack: ${error.message}`);
    }
  }
}
