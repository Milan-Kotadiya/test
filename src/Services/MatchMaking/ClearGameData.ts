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
    const TableLSAT: Table = await getTable(TableId);

    // Delete TGP
    await DeleteTGP(TableId);

    // Delete Table
    await DeleteTable(TableId);

    // Delete PGP'S And Remove Table Id From Player
    const PlayerArray = TableLSAT.Players;

    for (const playerId of PlayerArray) {
      // Remove Table Id From Player
      let PlayerNew: Player = await GetUser(playerId);
      PlayerNew.TableId = '';
      PlayerNew = PlayerNew;
      await AddUser(PlayerNew.UserId, PlayerNew);
      // Delete PGP
      await DeletePGP(playerId);
    }
    // Delete Rematch
    await DeleteReMatchResponse(TableId);
  } catch (error: any) {
    // Logger.error(
    //   `Error At ClearGame For ::${TableId} , Error is :: ${error.message}`
    // );
  }
};
