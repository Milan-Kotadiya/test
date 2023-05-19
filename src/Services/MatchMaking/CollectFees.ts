import { Player } from '../Constructors/PlayerConstructor';
import { Table } from '../Constructors/TableConstructor';
import { AddUser, GetUser, getTable } from '../RedisFunctions/RedisAll';

export const CollectEntryFee = async (TableId: string) => {
  try {
    let Table: Table = await getTable(TableId);
    for (let PI = 0; PI < Table.Players.length; PI++) {
      const PlayerID = Table.Players[PI];
      let PLAYER: Player = await GetUser(PlayerID);
      PLAYER.chips = PLAYER.chips - Table.EntryFee;
      await AddUser(PLAYER.UserId, PLAYER);
    }
  } catch (error: any) {
    // Logger.error(
    //   `Error At CollectEntryFee For Table::${TableId} , Error is :: ${error.message}`
    // );
  }
};
