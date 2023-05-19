import { Player } from '../Constructors/PlayerConstructor';
import { Table } from '../Constructors/TableConstructor';
import { AddUser, GetUser, getTable } from '../RedisFunctions/RedisAll';

export const CollectEntryFee = async (TableId: string) => {
  try {
    const TableLAST: Table = await getTable(TableId);
    const PlayerArray = TableLAST.Players;

    for (const playerId of PlayerArray) {
      let PLAYER: Player = await GetUser(playerId);
      PLAYER.chips = PLAYER.chips - TableLAST.EntryFee;
      PLAYER = PLAYER;
      await AddUser(PLAYER.UserId, PLAYER);
    }
  } catch (error: any) {
    // Logger.error(
    //   `Error At CollectEntryFee For Table::${TableId} , Error is :: ${error.message}`
    // );
  }
};
