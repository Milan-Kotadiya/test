import { StartGameTimer } from '../../Bull/GameTimerQueue';
import Emitter from '../../Connections/Emitter';
import { Table } from '../Constructors/TableConstructor';
import { getTable } from '../RedisFunctions/RedisAll';
import { CollectEntryFee } from './CollectFees';

export const StartGame = async (TableId: string, GameTime: number) => {
  try {
    const TableLSAT: Table = await getTable(TableId);
    // Start Game Timer
    await StartGameTimer(TableId, GameTime);
    // Collect Entry Fees
    if (TableLSAT.EntryFee) {
      await CollectEntryFee(TableId);
    }
    // Start Game Process
    Emitter.emit('GameTimer', {
      TimerTitle: 'GameCreated',
      TimerData: {
        GameId: TableId,
        MSG: `GameCreated  for TableId :: ${TableId}`,
      },
    });
  } catch (error: any) {
    // Error
  }
};
