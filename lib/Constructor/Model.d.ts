import { GameBasic, HTTPSConnection, REDISConnection, SIGNUPUSERdata } from '../Interface';
import express from 'express';
import { Server, Socket } from 'socket.io';
import { RedisClientType } from 'redis';
declare class ModelOptions {
    options: GameBasic;
    constructor(options: GameBasic);
}
export declare class Model extends ModelOptions {
    SocketIO: Server;
    Redlock: any;
    RedisClients: {
        Redis: RedisClientType;
        pubClient: RedisClientType;
        subClient: RedisClientType;
    };
    ExpressApp: express.Application;
    constructor(isLocal: boolean, Redis: REDISConnection, HTTPS: HTTPSConnection, gameBasics: GameBasic);
    Login(UserID: string, Password: string, socket: Socket, callback: (error: {
        error: boolean;
        message: string;
    }, login: {
        Rejoin: boolean;
        TableId: string;
    }) => void): Promise<void>;
    SendToRequester(SendTo: string, EventName: string, EventDetails: any, Message: any): void;
    SIGNUP(SignUpData: SIGNUPUSERdata, socket: Socket, callback: (error: {
        error: boolean;
        message: string;
    }, data: any) => void): Promise<void>;
}
export {};
