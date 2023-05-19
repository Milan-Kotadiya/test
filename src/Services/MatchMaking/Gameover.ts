import { GetTGP, getTable } from '../RedisFunctions/RedisAll';
import { Game } from '../Constructors/GameConstructor';
import { Table } from '../Constructors/TableConstructor';
import { StopGameTimer } from '../../Bull/GameTimerQueue';
import { EventToTable } from '../CallBack/EventToTable';

export const GameOver = async (TableId: string) => {
  try {
    // const TableLAST: Table = await getTable(TableId);
    // Get Table Game Play
    const LASTGame: Game = await GetTGP(TableId);
    if (LASTGame.GameOverReason !== 'Game Time Over') {
      // Stop Game Timer
      await StopGameTimer(TableId);
    }

    // Send Response to Players
    if (LASTGame.isWinner === true) {
      const EventData = {
        TableId,
        Winner: LASTGame.winner,
        MSG: LASTGame.GameOverReason,
      };
      await EventToTable(TableId, 'Game_Over', EventData);
    }
    if (LASTGame.isWinner === false) {
      const EventData = {
        TableId,
        Winner: 'Not Found',
        MSG: LASTGame.GameOverReason,
      };
      await EventToTable(TableId, 'Game_Over', EventData);
    }

    // TODO Rematch Timer Start
    // await StartRematchTimer(TableId);
  } catch (error: any) {
    // Error
  }
};
