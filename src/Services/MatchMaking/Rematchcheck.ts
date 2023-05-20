import Emitter from '../../Connections/Emitter';
import { REMATCH } from '../../Interface';
import { Table } from '../Constructors/TableConstructor';
import { DeleteReMatchResponse, GetReMatchResponse, getTable } from '../RedisFunctions/RedisAll';

export const RematchCheck = async (TableId: string, NumberOfTablePlayer: number) => {
  try {
    // let Table: Table = await getTable(TableId);
    const ReMatchResponse: REMATCH = await GetReMatchResponse(TableId);
    if (!ReMatchResponse) {
      // Can't Restart Game All Players Denied
      Emitter.emit('GameTimer', {
        TimerTitle: 'RematchTimer',
        TimerData: {
          TableId: TableId,
          ReMatchResponse: {},
          MSG: `Can't Restart Game All Players Denied`,
        },
      });
    }

    if (ReMatchResponse && ReMatchResponse.True.length === NumberOfTablePlayer) {
      // Remove Rematch Response From Database
      await DeleteReMatchResponse(TableId);
      // Start Game
      Emitter.emit('GameTimer', {
        TimerTitle: 'RematchTimer',
        TimerData: {
          TableId: TableId,
          ReMatchResponse,
          MSG: `Rematch Started All Player Want to Play Game Again`,
        },
      });
    }
    if (ReMatchResponse && ReMatchResponse.True.length !== NumberOfTablePlayer) {
      // Can't Restart Game SomeOne Denied
      Emitter.emit('GameTimer', {
        TimerTitle: 'RematchTimer',
        TimerData: {
          TableId: TableId,
          ReMatchResponse, 
          MSG: `Rematch Started All Player Want to Play Game Again`,
        },
      });
    }
  } catch (error: any) {
    // Error
  }
};
