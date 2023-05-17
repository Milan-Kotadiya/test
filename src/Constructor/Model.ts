import { RedisConnection, pubClient, redisClient, subClient } from '../Connections/Redis';
import { HTTPSConnection, REDISConnection, RedisFunctionList } from '../Interface';
import { RedisFunctions } from '../Services/RedisFunctions/RedisAll';
import { HttpConnection } from '../Connections/Http';
import { HttpsConnection } from '../Connections/Https';
import { RedLockConnection, redLock } from '../Connections/Redlock';
import { SocketConnection, io } from '../Connections/Socket';
import app from '../Connections/Express';
import express from 'express';
import { Server } from 'socket.io';
import { RedisClientType } from 'redis';

export class Model {
  RedisFunction: RedisFunctionList;
  SocketIO: Server;
  Redlock: any;
  RedisClients: {
    Redis: RedisClientType;
    pubClient: RedisClientType;
    subClient: RedisClientType;
  };
  ExpressApp: express.Application;
  constructor(isLocal: boolean, Redis: REDISConnection, HTTPS: HTTPSConnection) {
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

    this.RedisFunction = RedisFunctions;
    this.SocketIO = io;
    this.Redlock = redLock;
    this.ExpressApp = app;
    this.RedisClients = {
      Redis: redisClient,
      pubClient,
      subClient,
    };
  }
}
