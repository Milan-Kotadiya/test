import { StopLobbyWaitingTimer, StartLobbyWaitingTimer } from '../../Bull/LobbyTimerQueue';
import { GameBasic } from '../../Interface';
import { Table } from '../Constructors/TableConstructor';
import { GetEmptyTable, SetEmptyTable, SetTable, getTable } from '../RedisFunctions/RedisAll';
import { CollectEntryFee } from './CollectFees';
import { StartGame } from './StartGame';

const IsFull = async (
  TableLAST: Table,
  NumberOfTablePlayer: number,
  LobbyTime: number,
  UserId: string,
  GameTime: number,
) => {
  try {
    if (TableLAST.Players.length === NumberOfTablePlayer) {
      // Stop Waiting Timer
      await StopLobbyWaitingTimer(TableLAST.id);

      // Remove This Table From Empty Table List
      let EmptyTable: any = await GetEmptyTable();
      const FindIndex = EmptyTable.indexOf(TableLAST);
      EmptyTable.splice(FindIndex, 1);
      EmptyTable = EmptyTable;
      await SetEmptyTable(EmptyTable);

      // Start Game For This Table
      await StartGame(TableLAST.id, GameTime);
    } else {
      // Start Waiting Timer
      await StartLobbyWaitingTimer(TableLAST.id, LobbyTime, UserId);
    }
  } catch (error: any) {
    // Error
  }
};

export const SitInTable = async (
  TableId: string,
  UserId: string,
  NumberOfTablePlayer: number,
  LobbyTime: number,
  GameTime: number,
) => {
  try {
    let TableLAST: Table = await getTable(TableId);
    if (TableLAST) {
      if (TableLAST.Players.includes(UserId)) {
        await IsFull(TableLAST, NumberOfTablePlayer, LobbyTime, UserId, GameTime);
      } else {
        if (TableLAST.Players.length < NumberOfTablePlayer) {
          TableLAST.Players.push(UserId);
          TableLAST = TableLAST;
          await SetTable(TableLAST);
          await IsFull(TableLAST, NumberOfTablePlayer, LobbyTime, UserId, GameTime);
        }
      }
    }
  } catch (error: any) {
    // Error
  }
};
