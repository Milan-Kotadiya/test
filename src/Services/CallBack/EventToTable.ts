import { GetUser, getTable } from '../RedisFunctions/RedisAll';
import { io } from '../../Connections/Socket';
import { Table } from '../Constructors/TableConstructor';
import { Player } from '../Constructors/PlayerConstructor';

export const EventToTable = async (TableId: string, EventName: string, SendData: any) => {
  try {
    const TableL: Table = await getTable(TableId);
    if (!TableL) {
      // Logger.error(`Table Not Found At EventToTable For TableId :: ${TableId}`);
    }
    const PlayerArray = TableL.Players;
    for (const playerId of PlayerArray) {
      const PlayerGetted: Player = await GetUser(playerId);
      const socketid = PlayerGetted.soketId;
      io.to(socketid).emit(
        'RES',
        JSON.stringify({
          EventName,
          EventDetails: SendData,
        }),
      );
    }
    // Logger.info(
    //   `RES SEND ====> ROOMID:: ${TableId}, EVENTNAME :: ${EventName},EVENTDETAILS :: ${JSON.stringify(SendData)}`,
    // );
  } catch (error: any) {
    // Logger.error(`Error At EventToTable: For ::${TableId} , Error is :: ${error.message}`);
  }
};

// Send to Clien

export const SendBySocketId = (SocketId: string, EventName: string, EventDetails: any, Message: any) => {
  try {
    io.to(SocketId).emit(
      EventName,
      JSON.stringify({
        EventDetails,
        Message,
      }),
    );
  } catch (error: any) {
    // Logger.error(`Error At CallBack: ${error.message}`);
  }
};
// Send to User By UserId
export const SendEventToUserByUserId = async (
  UserId: string,
  EventName: string,
  EventDetails: any,
  Message: string,
) => {
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
};
