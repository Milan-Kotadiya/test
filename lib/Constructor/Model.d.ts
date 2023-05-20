/// <reference types="node" />
import { GameBasic, HTTPSConnection, REDISConnection, SIGNUPUSERdata } from '../Interface';
import express from 'express';
import { Server, Socket } from 'socket.io';
import { RedisClientType } from 'redis';
import { Player } from '../Services/Constructors/PlayerConstructor';
import { Table } from '../Services/Constructors/TableConstructor';
import EventEmitter from 'events';
import { ModelOptions } from './GameBasicClass';
export declare class Game extends ModelOptions {
    SocketIO: Server;
    Redlock: any;
    RedisClients: {
        Redis: RedisClientType;
        pubClient: RedisClientType;
        subClient: RedisClientType;
    };
    ExpressApp: express.Application;
    GameTimer: EventEmitter;
    constructor(isLocal: boolean, Redis: REDISConnection, HTTPS: HTTPSConnection, gameBasics: GameBasic);
    GameTimerSays(callback: (Data: {
        TimerTitle: string;
        TimerData: any;
    }) => void): void;
    Login(UserID: string, Password: string, socket: Socket, callback: (error: {
        error: boolean;
        message: string;
    }, login: {
        Rejoin: boolean;
        TableId: string;
        UserData: Player;
    }) => void): Promise<void>;
    SendToRequester(SendTo: string, EventName: string, EventDetails: any, Message: any): void;
    SIGNUP(SignUpData: SIGNUPUSERdata, socket: Socket, callback: (error: {
        error: boolean;
        message: string;
    }, data: any) => void, Coins?: number): Promise<void>;
    GetTable(TableId: string, callback: (error: {
        error: boolean;
        message: string;
    }, Tabledata: any) => void): Promise<void>;
    CreateTable(Userid: string, callback: (error: {
        error: boolean;
        message: string;
    }, Table: Table) => void, EntryFee?: number): Promise<void>;
    SendEventToUser(UserId: string, EventName: string, EventDetails: any, Message: string): Promise<void>;
}
