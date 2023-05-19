import { EventToTable } from '../CallBack/EventToTable';
import { GetTGP, getTable } from '../RedisFunctions/RedisAll';
import { Game } from '../Constructors/GameConstructor';
import { Table } from '../Constructors/TableConstructor';

export const GameOver = async (TableId: string) => {
  try {
    let Table: Table = await getTable(TableId);
    // Get Table Game Play
    let Game: Game = await GetTGP(TableId);
    if (Game.GameOverReason !== 'Game Time Over') {
      // Stop Game Timer
      // await StopGameTimer(TableId);
    }

    if (!Game) {
    }
    // Send Response to Players
    if (Game.isWinner === true) {
      let EventData = {
        TableId: TableId,
        Winner: Game.winner,
        MSG: Game.GameOverReason,
      };
      await EventToTable(TableId, 'Game_Over', EventData);
    }
    if (Game.isWinner === false) {
      let EventData = {
        TableId: TableId,
        Winner: 'Not Found',
        MSG: Game.GameOverReason,
      };
      await EventToTable(TableId, 'Game_Over', EventData);
    }

    // Rematch Timer Start
    // await StartRematchTimer(TableId);
  } catch (error: any) {}
};
