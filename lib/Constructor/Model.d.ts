import { HTTPSConnection, REDISConnection, RedisFunctionList } from '../Interface';
import express from 'express';
import { Server } from 'socket.io';
import { RedisClientType } from 'redis';
export declare class Model {
    RedisFunction: RedisFunctionList;
    SocketIO: Server;
    Redlock: any;
    RedisClients: {
        Redis: RedisClientType;
        pubClient: RedisClientType;
        subClient: RedisClientType;
    };
    ExpressApp: express.Application;
    constructor(isLocal: boolean, Redis: REDISConnection, HTTPS: HTTPSConnection);
}
