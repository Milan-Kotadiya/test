import { UpdateGameTimerPlayer } from '../../Bull/GameTimerQueue';
import { StopLobbyWaitingTimer, StartLobbyWaitingTimer } from '../../Bull/LobbyTimerQueue';
import { GameBasic } from '../../Interface';
import { Table } from '../Constructors/TableConstructor';
import {
  GetEmptyTable,
  GetEmptyTableEntryfee,
  SetEmptyTable,
  SetEmptyTableEntryfee,
  SetTable,
  getTable,
} from '../RedisFunctions/RedisAll';
import { StartGame } from './StartGame';

const IsFull = async (LAST: Table, Options: GameBasic, UserId: string) => {
  try {
    const FRESHTABLE: Table = await getTable(LAST.id);

    if (Options.isMinPlayerModeOn === true) {
      if (FRESHTABLE.Players.length === Options.MinPlayerToStartGame) {
        await StopLobbyWaitingTimer(FRESHTABLE.id);
        await UpdateGameTimerPlayer(FRESHTABLE.id, FRESHTABLE.Players.length);
        await StartGame(FRESHTABLE.id, Options.GameTime, Options.PlayersPerTable, Options.RemacthWaitTime);
      }
      if (FRESHTABLE.Players.length === Options.PlayersPerTable) {
        await UpdateGameTimerPlayer(FRESHTABLE.id, FRESHTABLE.Players.length);
        // Remove This Table From Empty Table List
        if (FRESHTABLE.EntryFee) {
          let EmptyTableFee: {
            Tableid: string;
            EntryFee: number;
          }[] = await GetEmptyTableEntryfee();
          const index = EmptyTableFee.findIndex((x) => x.Tableid === FRESHTABLE.id);
          if (index >= 0) {
            EmptyTableFee = EmptyTableFee.splice(index, 1);
            await SetEmptyTableEntryfee(EmptyTableFee);
          }
        }
        if (!FRESHTABLE.EntryFee) {
          // Remove This Table From Empty Table List
          let EmptyTable: any = await GetEmptyTable();
          const FindIndex = EmptyTable.indexOf(FRESHTABLE.id);
          if (FindIndex >= 0) {
            EmptyTable.splice(FindIndex, 1);
            EmptyTable = EmptyTable;
            await SetEmptyTable(EmptyTable);
          }
        }
      }

      if (
        FRESHTABLE.Players.length > Options.MinPlayerToStartGame &&
        FRESHTABLE.Players.length < Options.PlayersPerTable
      ) {
        await UpdateGameTimerPlayer(FRESHTABLE.id, FRESHTABLE.Players.length);
      }

      if (FRESHTABLE.Players.length < Options.MinPlayerToStartGame) {
        await StartLobbyWaitingTimer(FRESHTABLE.id, Options.LobbyWaitTime, UserId);
      }
    } else {
      if (FRESHTABLE.Players.length === Options.PlayersPerTable) {
        // Stop Waiting Timer
        await StopLobbyWaitingTimer(FRESHTABLE.id);

        if (FRESHTABLE.EntryFee) {
          let EmptyTableFee: {
            Tableid: string;
            EntryFee: number;
          }[] = await GetEmptyTableEntryfee();
          const index = EmptyTableFee.findIndex((x) => x.Tableid === FRESHTABLE.id);
          if (index >= 0) {
            EmptyTableFee = EmptyTableFee.splice(index, 1);
            await SetEmptyTableEntryfee(EmptyTableFee);
          }
        }
        if (!FRESHTABLE.EntryFee) {
          // Remove This Table From Empty Table List
          let EmptyTable: any = await GetEmptyTable();
          const FindIndex = EmptyTable.indexOf(FRESHTABLE.id);
          if (FindIndex >= 0) {
            EmptyTable.splice(FindIndex, 1);
            EmptyTable = EmptyTable;
            await SetEmptyTable(EmptyTable);
          }
        }

        // Start Game For This Table
        await StartGame(FRESHTABLE.id, Options.GameTime, Options.PlayersPerTable, Options.RemacthWaitTime);
      } else {
        // Start Waiting Timer
        await StartLobbyWaitingTimer(FRESHTABLE.id, Options.LobbyWaitTime, UserId);
      }
    }
  } catch (error: any) {
    // Error
  }
};

export const SitInTable = async (TableId: string, UserId: string, Options: GameBasic) => {
  try {
    let TableLAST: Table = await getTable(TableId);
    if (TableLAST) {
      if (TableLAST.Players.includes(UserId)) {
        await IsFull(TableLAST, Options, UserId);
      } else {
        if (TableLAST.Players.length < Options.PlayersPerTable) {
          TableLAST.Players.push(UserId);
          TableLAST = TableLAST;
          await SetTable(TableLAST);
          await IsFull(TableLAST, Options, UserId);
        }
      }
    }
  } catch (error: any) {
    // Error
  }
};
