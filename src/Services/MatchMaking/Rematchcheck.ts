import Emitter from '../../Connections/Emitter';
import { REMATCH } from '../../Interface';
import { Player } from '../Constructors/PlayerConstructor';
import { Table } from '../Constructors/TableConstructor';
import {
  AddUser,
  DeleteReMatchResponse,
  DeleteTable,
  GetEmptyTable,
  GetEmptyTableEntryfee,
  GetReMatchResponse,
  GetUser,
  SetEmptyTable,
  SetEmptyTableEntryfee,
  SetTable,
  getTable,
} from '../RedisFunctions/RedisAll';
import { StartGame } from './StartGame';

export const RematchCheck = async (TableId: string, NumberOfTablePlayer: number, RematchTime: number) => {
  try {
    const TableSTART: Table = await getTable(TableId);
    if (TableSTART.EntryFee) {
      let EmptyTableFee: {
        Tableid: string;
        EntryFee: number;
      }[] = await GetEmptyTableEntryfee();
      const index = EmptyTableFee.findIndex((x) => x.Tableid === TableSTART.id);
      if (index >= 0) {
        EmptyTableFee.splice(index, 1);
        EmptyTableFee = EmptyTableFee;
        await SetEmptyTableEntryfee(EmptyTableFee);
      }
    }
    if (!TableSTART.EntryFee) {
      // Remove This Table From Empty Table List
      let EmptyTable: any = await GetEmptyTable();
      const FindIndex = EmptyTable.indexOf(TableSTART.id);
      if (FindIndex >= 0) {
        EmptyTable.splice(FindIndex, 1);
        EmptyTable = EmptyTable;
        await SetEmptyTable(EmptyTable);
      }
    }
    const ReMatchResponse: REMATCH = await GetReMatchResponse(TableId);
    if (!ReMatchResponse) {
      const LastTablePlayer: Table = await getTable(TableId);
      const PlayerArray = LastTablePlayer.Players;
      for (const playerId of PlayerArray) {
        let PLAYER: Player = await GetUser(playerId);
        PLAYER.TableId = '';
        PLAYER = PLAYER;
        await AddUser(PLAYER.UserId, PLAYER);
      }
      // Delete Table
      await DeleteTable(TableId);
      // Can't Restart Game All Players Denied
      Emitter.emit('GameTimer', {
        TimerTitle: 'RematchTimer',
        TimerData: {
          TableId,
          ReMatchResponse: {},
          MSG: `Can't Restart Game All Players Denied`,
        },
      });
    }

    if (ReMatchResponse && ReMatchResponse.True.length === NumberOfTablePlayer) {
      // Update Table
      let LastTable: Table = await getTable(TableId);
      const Minute = (new Date(LastTable.EndAt).getTime() - new Date(LastTable.CreatedAt).getTime()) / 60000;
      LastTable.CreatedAt = new Date().toString();
      LastTable.EndAt = new Date(new Date().getTime() + Minute * 60 * 1000).toString();
      LastTable = LastTable;
      await SetTable(LastTable);

      // Game Start
      StartGame(TableId, Minute, NumberOfTablePlayer, RematchTime);
      // Remove Rematch Response From Database
      await DeleteReMatchResponse(TableId);
      // Start Game
      Emitter.emit('GameTimer', {
        TimerTitle: 'RematchTimer',
        TimerData: {
          TableId,
          ReMatchResponse,
          MSG: `Rematch Started All Player Want to Play Game Again`,
        },
      });
    }
    if (ReMatchResponse && ReMatchResponse.True.length !== NumberOfTablePlayer) {
      const LastTablePls: Table = await getTable(TableId);
      const PlayerArray = LastTablePls.Players;
      for (const playerId of PlayerArray) {
        let PLAYER: Player = await GetUser(playerId);
        PLAYER.TableId = '';
        PLAYER = PLAYER;
        await AddUser(PLAYER.UserId, PLAYER);
      }

      // Delete Table
      await DeleteTable(TableId);
      // Remove Rematch Response From Database
      await DeleteReMatchResponse(TableId);
      Emitter.emit('GameTimer', {
        TimerTitle: 'RematchTimer',
        TimerData: {
          TableId,
          ReMatchResponse,
          MSG: `Can't Restart Game SomeOne Denied, Agreed Player : ${ReMatchResponse.True.length}, Total Player : ${NumberOfTablePlayer}`,
        },
      });
    }
  } catch (error: any) {
    // Error
  }
};
