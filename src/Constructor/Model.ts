import { RedisConnection, pubClient, redisClient, subClient } from '../Connections/Redis';
import { GameBasic, HTTPSConnection, REDISConnection, REMATCH } from '../Interface';
import {
  GetUser,
  AddUser,
  getTable,
  GetEmptyTable,
  SetEmptyTable,
  SetTable,
  GetEmptyTableEntryfee,
  SetEmptyTableEntryfee,
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
import { ModelOptions } from './GameBasicClass';
import { Rematch } from '../Services/MatchMaking/ReMatch';
import { TimerAll } from '../Bull/TimerAll';

export class Game extends ModelOptions {
  IO: Server;
  Redlock: any;
  RedisClients: {
    Redis: RedisClientType;
    pubClient: RedisClientType;
    subClient: RedisClientType;
  };
  ExpressApp: express.Application;
  GameTimer: {
    LobbyTimer: (callback: (Data: {
      LobbyTableID: string;
      UserId: string;
      MSG: string;
  }) => void) => void;
  GameStarted: (callback: (Data: {
    TableID: string;
    MSG: string;
}) => void) => void;
GameTimeOver: (callback: (Data: {
  TableID: string;
  MSG: string;
}) => void) => void;
RematchTimeOver: (callback: (Data: {
  TableID: string;
  ReMatchResponse: any;
  MSG: string;
}) => void) => void
  };
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

    this.IO = io;
    this.Redlock = redLock;
    this.ExpressApp = app;
    this.RedisClients = {
      Redis: redisClient,
      pubClient,
      subClient,
    };
    this.GameTimer = TimerAll;
  }


  async ReMatch(
    Response: boolean,
    socket: Socket,
    callback: (result: { Status: 'Success' | 'Fail'; message: string }) => void,
  ) {
    const Return: { error: boolean; msg: string } = await Rematch(Response, socket);
    if (Return.error === true) {
      callback({ Status: 'Fail', message: Return.msg });
    }
    if (Return.error === false) {
      callback({ Status: 'Success', message: Return.msg });
    }
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
    SignUpData: {
      UserId: string;
      UserName: string;
      Password: string;
    },
    socket: Socket,
    callback: (
      error: {
        error: boolean;
        message: string;
      },
      data: any,
    ) => void,
    Coins?: number,
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
        if (this.options.isTableWithEntryFee === false) {
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
        } else {
          if (Coins) {
            const HashPass = genPassword(SignUpData.Password);

            const RedisUser = new Player(
              SignUpData.UserId,
              SignUpData.UserName,
              HashPass.hash,
              HashPass.salt,
              socket.id,
              Coins,
            );
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
          } else {
            callback(
              {
                error: true,
                message: 'Players Current Coins Require For Entry Fee!!!',
              },
              null,
            );
          }
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
          //  Create Table With Entry Fee
          const EmptyTable: {
            Tableid: string;
            EntryFee: number;
          }[] = await GetEmptyTableEntryfee();
          if (EmptyTable && EmptyTable.length === 0) {
            const NewEmptyTable: string = new mongoose.Types.ObjectId().toString();
            EmptyTable.push({ Tableid: NewEmptyTable, EntryFee });
            await SetEmptyTableEntryfee(EmptyTable);
            PlayerTL.TableId = NewEmptyTable;
            PlayerTL = PlayerTL;
            await AddUser(PlayerTL.UserId, PlayerTL);
            const CreateTable = new Table(NewEmptyTable, PlayerTL.UserId, this.options, EntryFee);
            await SetTable(CreateTable);
            if (this.options.isMinPlayerModeOn === true) {
              await SitInTable(CreateTable.id, PlayerTL.UserId, this.options);
            } else {
              await SitInTable(CreateTable.id, PlayerTL.UserId, this.options);
            }
            callback(null, CreateTable);
          } else {
            const NewEmptyTable = EmptyTable[0].Tableid;
            PlayerTL.TableId = NewEmptyTable;
            PlayerTL = PlayerTL;
            await AddUser(PlayerTL.UserId, PlayerTL);
            if (this.options.isMinPlayerModeOn === true) {
              await SitInTable(NewEmptyTable, PlayerTL.UserId, this.options);
            } else {
              await SitInTable(NewEmptyTable, PlayerTL.UserId, this.options);
            }
            const TableLAST: Table = await getTable(NewEmptyTable);
            callback(null, TableLAST);
          }
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
        const EmptyTable: string[] = await GetEmptyTable();
        if (EmptyTable && EmptyTable.length === 0) {
          // Create a new table
          const NewEmptyTable: string = new mongoose.Types.ObjectId().toString();
          EmptyTable.push(NewEmptyTable);
          await SetEmptyTable(EmptyTable);
          // Add in a new table
          PlayerTL.TableId = NewEmptyTable;
          PlayerTL = PlayerTL;
          await AddUser(PlayerTL.UserId, PlayerTL);
          const CreateTable = new Table(NewEmptyTable, PlayerTL.UserId, this.options);
          await SetTable(CreateTable);
          if (this.options.isMinPlayerModeOn === true) {
            await SitInTable(CreateTable.id, PlayerTL.UserId, this.options);
          } else {
            await SitInTable(CreateTable.id, PlayerTL.UserId, this.options);
          }
          callback(null, CreateTable);
        }

        if (EmptyTable && EmptyTable.length > 0) {
          const NewEmptyTable = EmptyTable[0];
          // Add in a table
          PlayerTL.TableId = NewEmptyTable;
          PlayerTL = PlayerTL;
          await AddUser(PlayerTL.UserId, PlayerTL);
          if (this.options.isMinPlayerModeOn === true) {
            await SitInTable(NewEmptyTable, PlayerTL.UserId, this.options);
          } else {
            await SitInTable(NewEmptyTable, PlayerTL.UserId, this.options);
          }
          const TableLASTN: Table = await getTable(NewEmptyTable);
          callback(null, TableLASTN);
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
