import { GetUser, getTable } from '../RedisFunctions/RedisAll';
import { io } from '../../Connections/Socket';
import { Table } from '../Constructors/TableConstructor';

export const EventToTable = async (TableId: string, EventName: string, SendData: any) => {
  try {
    const TableL: Table = await getTable(TableId);
    if (!TableL) {
      // Logger.error(`Table Not Found At EventToTable For TableId :: ${TableId}`);
    }
    const PlayerArray = TableL.Players;
    for (const playerId of PlayerArray) {
      const Player: any = await GetUser(playerId);
      const socketid = Player.soketId;
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
    return;
  } catch (error: any) {
    // Logger.error(`Error At EventToTable: For ::${TableId} , Error is :: ${error.message}`);
  }
};
