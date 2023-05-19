import { Player } from '../Constructors/PlayerConstructor';
import { Table } from '../Constructors/TableConstructor';
import {
  AddUser,
  DeletePGP,
  DeleteReMatchResponse,
  DeleteTGP,
  DeleteTable,
  GetUser,
  getTable,
} from '../RedisFunctions/RedisAll';

export const ClearGame = async (TableId: string) => {
  try {
    let Table: Table = await getTable(TableId);

    //Delete TGP
    await DeleteTGP(TableId);

    //Delete Table
    await DeleteTable(TableId);

    //Delete PGP'S And Remove Table Id From Player
    for (let PI = 0; PI < Table.Players.length; PI++) {
      const PlayerID = Table.Players[PI];
      //Remove Table Id From Player
      let PlayerNew: Player = await GetUser(PlayerID);
      PlayerNew.TableId = '';
      await AddUser(PlayerNew.UserId, PlayerNew);
      //Delete PGP
      await DeletePGP(PlayerID);
    }
    //Delete Rematch
    await DeleteReMatchResponse(TableId);
  } catch (error: any) {
    // Logger.error(
    //   `Error At ClearGame For ::${TableId} , Error is :: ${error.message}`
    // );
  }
};
