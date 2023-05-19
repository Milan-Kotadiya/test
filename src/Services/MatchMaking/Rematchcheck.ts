import { REMATCH } from '../../Interface';
import { Table } from '../Constructors/TableConstructor';
import { DeleteReMatchResponse, GetReMatchResponse, getTable } from '../RedisFunctions/RedisAll';

export const RematchCheck = async (TableId: string, NumberOfTablePlayer: number) => {
  try {
    // let Table: Table = await getTable(TableId);
    const ReMatchResponse: REMATCH = await GetReMatchResponse(TableId);
    if (!ReMatchResponse) {
      // Can't Restart Game All Players Denied
      const EventData = {
        TableId,
        RematchData: {},
        MSG: `Can't Restart Game All Players Denied`,
      };
    }

    if (ReMatchResponse && ReMatchResponse.True.length === NumberOfTablePlayer) {
      // Can't Restart Game All Players Denied
      const EventData = {
        TableId,
        RematchData: {},
        MSG: `Game ReStarted`,
      };
      // Remove Rematch Response From Database
      await DeleteReMatchResponse(TableId);
      // Start Game
      // await StartGame(TableId);
    }
    if (ReMatchResponse && ReMatchResponse.True.length !== NumberOfTablePlayer) {
      // Can't Restart Game SomeOne Denied
    }
  } catch (error: any) {
    // Error
  }
};
