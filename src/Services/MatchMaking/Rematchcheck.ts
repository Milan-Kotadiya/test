import { REMATCH } from '../../Interface';
import { EventToTable } from '../CallBack/EventToTable';
import { Table } from '../Constructors/TableConstructor';
import { DeleteReMatchResponse, GetReMatchResponse, getTable } from '../RedisFunctions/RedisAll';
import { ClearGame } from './ClearGameData';
import { StartGame } from './StartGame';

export const RematchCheck = async (TableId: string, NumberOfTablePlayer: number) => {
  try {
    let Table: Table = await getTable(TableId);
    let ReMatchResponse: REMATCH = await GetReMatchResponse(TableId);
    if (!ReMatchResponse) {
      //Can't Restart Game All Players Denied
      let EventData = {
        TableId: TableId,
        RematchData: {},
        MSG: `Can't Restart Game All Players Denied`,
      };
      //Send Response TO Every Player
      await EventToTable(TableId, 'Rematch_Game', EventData);
      // Delete Game Data
      await ClearGame(TableId);
    }

    if (ReMatchResponse && ReMatchResponse.True.length === NumberOfTablePlayer) {
      //Can't Restart Game All Players Denied
      let EventData = {
        TableId: TableId,
        RematchData: {},
        MSG: `Game ReStarted`,
      };
      //Remove Rematch Response From Database
      await DeleteReMatchResponse(TableId);
      //Send Response TO Every Player
      await EventToTable(TableId, 'Rematch_Game', EventData);
      //Start Game
      // await StartGame(TableId);
    }
    if (ReMatchResponse && ReMatchResponse.True.length !== NumberOfTablePlayer) {
      //Can't Restart Game SomeOne Denied
      let EventData = {
        TableId: TableId,
        RematchData: ReMatchResponse,
        MSG: `Can't Restart Game SomeOne Denied`,
      };
      //Send Response TO Every Player
      await EventToTable(TableId, 'Rematch_Game', EventData);
      // Delete Game Data
      await ClearGame(TableId);
    }
  } catch (error: any) {}
};
