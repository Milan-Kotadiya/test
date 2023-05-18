import { RedisConnection, pubClient, redisClient, subClient } from '../Connections/Redis';
import { GameBasic, HTTPSConnection, REDISConnection, SIGNUPUSERdata } from '../Interface';
import { GetUser, AddUser } from '../Services/RedisFunctions/RedisAll';
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
      },
    ) => void,
  ): Promise<void> {
    try {
      const Player: Player = await GetUser(UserID);

      if (Player) {
        const Compare = await comparePassword(Password, Player.Password, Player.Salt);
        if (Compare) {
          if (Player.TableId && Player.TableId !== '') {
            // Rejoin
            callback(null, { Rejoin: true, TableId: Player.TableId });
          } else {
            // TODO
            console.log(this.options);
            if (this.options.isTableWithEntryFee === false) {
              // Normal Empty Table
            } else {
            }

            callback(null, { Rejoin: false, TableId: 'TableId' });
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
}
