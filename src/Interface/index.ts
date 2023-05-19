import { Socket } from 'socket.io';
import { Game } from '../Services/Constructors/GameConstructor';
import { Player } from '../Services/Constructors/PlayerConstructor';

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

export interface GameBasic {
  GameTime: number;
  LobbyWaitTime: number;
  PlayersPerTable: number;
  RemacthWaitTime: number;
  isTableWithEntryFee: boolean;
  ReconnectWithin: number;
  isMinPlayerModeOn: boolean;
  MinPlayerToStartGame: number;
}

export interface EmitDataInterface {
  ReqData: any;
  Socket: Socket;
}
export interface REQDataInterface {
  EventName: string;
  EventDetails: any;
}

export interface REMATCH {
  id: string;
  True: string[];
  False: string[];
}

export interface REMATCHREQdata {
  TableId: string;
  UserID: string;
  Response: boolean;
}

export interface SIGNUPUSERdata {
  UserId: string;
  UserName: string;
  Password: string;
}

export interface GameFlowFunctionsList {
  SIGNUP: (
    SignUpData: SIGNUPUSERdata,
    socket: Socket,
    callback: (
      error: {
        error: boolean;
        message: string;
      },
      data: any,
    ) => void,
  ) => Promise<void>;
  SendToRequester: (SendTo: string, EventName: string, EventDetails: any, Message: any) => void;
}
