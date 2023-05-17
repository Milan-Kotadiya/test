import { Socket } from "socket.io";

export interface EmitDataInterface {
  ReqData: any;
  Socket: Socket;
}
export interface REQDataInterface {
  EventName: string;
  EventDetails: any;
}
