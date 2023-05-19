import { StartGameTimer } from '../../Bull/GameTimerQueue';
import { EventToTable } from '../CallBack/EventToTable';
import { CollectEntryFee } from './CollectFees';

export const StartGame = async (TableId: string, GameTime: number) => {
  try {
    // Sending Event TO Client Join Table
    await EventToTable(TableId, 'Join Table', { TableId: TableId });
    // Start Game Timer
    await StartGameTimer(TableId, GameTime);
    // Collect Entry Fees
    await CollectEntryFee(TableId);
    // Start Game Process
  } catch (error: any) {}
};
