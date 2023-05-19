import { RedisConnection, pubClient, redisClient, subClient } from '../Connections/Redis';
import { GameBasic, HTTPSConnection, REDISConnection, SIGNUPUSERdata } from '../Interface';
import {
  GetUser,
  AddUser,
  getTable,
  GetEmptyTable,
  SetEmptyTable,
  SetTable,
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

class ModelOptions {
  options: GameBasic = {
    GameTime: 3, //Game Time (In Minutes , typeOf Number)
    LobbyWaitTime: 5, //How Many Seconds, Player Wait in lobby For Another Player TO Join Table (In second, typeOf Number)
    PlayersPerTable: 4, // How Many Player's Need On Table TO Start Game (typeOf Number)
    isMinPlayerModeOn: false, //If game Is For 4 Players But we can start if Two Player Join then, Value of isMinPlayerModeOn = true
    MinPlayerToStartGame: 2, // if isMinPlayerModeOn = true then number of Player reuire to start game, else make it 0
    RemacthWaitTime: 60, //After Game Over After How Many Seconds Need To Check Rematch Response (Which Is sent By Player) (In second, typeOf Number),
    isTableWithEntryFee: false, // IF Table is based On entryFee Like Table For 500 Coins, 300 Coins Then (true) else (false) (typeOf boolean)
    ReconnectWithin: 30,
  };

  constructor(options: GameBasic) {
    this.options = options;
  }
}

export class Model extends ModelOptions {
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

  GameTimerSays(callback: (Data: { TimerTitle: boolean; TimerData: any }) => void) {
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
      const Player: Player = await GetUser(UserID);

      if (Player) {
        const Compare = await comparePassword(Password, Player.Password, Player.Salt);
        if (Compare) {
          if (Player.TableId && Player.TableId !== '') {
            socket.handshake.auth.UserDetails = {
              UserId: Player.UserId,
              TableId: Player.TableId,
            };
            // Rejoin
            callback(null, { Rejoin: true, TableId: Player.TableId, UserData: Player });
          } else {
            socket.handshake.auth.UserDetails = {
              UserId: Player.UserId,
              TableId: '',
            };
            callback(null, { Rejoin: false, TableId: null, UserData: Player });
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
          EventDetails: EventDetails,
          Message: Message,
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
      const Table = await getTable(TableId);
      if (Table) {
        callback(null, Table);
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

  // Get Table
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
      const Player: Player = await GetUser(Userid);

      if (this.options.isTableWithEntryFee === true) {
        if (EntryFee) {
          // Create Table With Entry Fee
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
          let NewEmptyTable = new mongoose.Types.ObjectId().toString();
          EmptyTable.push(NewEmptyTable);
          let UpdateEmptyTable = await SetEmptyTable(EmptyTable);
          // Add in a new table
          Player.TableId = NewEmptyTable;
          let UpdateUser = await AddUser(Player.UserId, Player);
          const CreateTable = new Table(NewEmptyTable, Player.UserId, this.options.GameTime);
          await SetTable(CreateTable);
          if (this.options.isMinPlayerModeOn === true) {
            let AddInTable = await SitInTable(
              CreateTable.id,
              Player.UserId,
              this.options.MinPlayerToStartGame,
              this.options.LobbyWaitTime,
              this.options.GameTime,
            );
          } else {
            let AddInTable = await SitInTable(
              CreateTable.id,
              Player.UserId,
              this.options.PlayersPerTable,
              this.options.LobbyWaitTime,
              this.options.GameTime,
            );
          }
          callback(null, CreateTable);
        }

        if (EmptyTable && EmptyTable.length > 0) {
          let NewEmptyTable = EmptyTable[0];
          // Add in a table
          Player.TableId = NewEmptyTable;
          let UpdateUser = await AddUser(Player.UserId, Player);

          const CreateTable = new Table(NewEmptyTable, Player.UserId, this.options.GameTime);
          await SetTable(CreateTable);
          if (this.options.isMinPlayerModeOn === true) {
            let AddInTable = await SitInTable(
              CreateTable.id,
              Player.UserId,
              this.options.MinPlayerToStartGame,
              this.options.LobbyWaitTime,
              this.options.GameTime,
            );
          } else {
            let AddInTable = await SitInTable(
              CreateTable.id,
              Player.UserId,
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
}
