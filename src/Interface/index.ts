import { Game } from '../Services/Constructors/GameConstructor';
import { Player } from '../Services/Constructors/PlayerConstructor';
import { TableInterface } from './RedisInterface';
import { REMATCH } from './RematchDataInterface';

export interface REDISConnection {
  Host: string;
  Port: string;
  Password: string;
  DBNumber: string;
}

export interface HTTPSConnection {
  Port: string;
  CertPath: string;
  KeyPath: string;
}
export interface RedisFunctionList {
  SetKey: (Key: string, KeyData: any) => Promise<any>;
  GetKey: (Key: string) => Promise<any>;
  DeleteKey: (Key: string) => Promise<void>;
  AddUser: (USERDATA: Player) => Promise<void>;
  GetUser: (UserId: string) => Promise<any>;
  DeleteUser: (UserId: string) => Promise<void>;
  GetEmptyTable: () => Promise<any>;
  SetEmptyTable: (TableData: any) => Promise<void>;
  SetTable: (TableData: TableInterface) => Promise<void>;
  getTable: (Tableid: string) => Promise<any>;
  DeleteTable: (Tableid: string) => Promise<void>;
  AddTGP: (GAME: Game) => Promise<void>;
  GetTGP: (Gameid: string) => Promise<any>;
  DeleteTGP: (Gameid: string) => Promise<void>;
  GetReMatchResponse: (Gameid: string) => Promise<any>;
  SetReMatchResponse: (Gameid: string, ReMatchResponse: REMATCH) => Promise<void>;
  DeleteReMatchResponse: (Gameid: string) => Promise<void>;
  AddPGP: (USERDATA: any) => Promise<void>;
  GetPGP: (UserId: string) => Promise<any>;
  DeletePGP: (UserId: string) => Promise<void>;
}
