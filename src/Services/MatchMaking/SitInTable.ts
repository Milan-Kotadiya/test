import { StopLobbyWaitingTimer, StartLobbyWaitingTimer } from '../../Bull/LobbyTimerQueue';
import { Table } from '../Constructors/TableConstructor';
import { GetEmptyTable, SetEmptyTable, SetTable, getTable } from '../RedisFunctions/RedisAll';
import { StartGame } from './StartGame';

const IsFull = async (
  Table: Table,
  NumberOfTablePlayer: number,
  LobbyTime: number,
  UserId: string,
  GameTime: number,
) => {
  try {
    if (Table.Players.length === NumberOfTablePlayer) {
      //Stop Waiting Timer
      await StopLobbyWaitingTimer(Table.id);

      //Remove This Table From Empty Table List
      let EmptyTable: any = await GetEmptyTable();
      const FindIndex = EmptyTable.indexOf(Table);
      EmptyTable.splice(FindIndex, 1);
      await SetEmptyTable(EmptyTable);

      //Start Game For This Table
      await StartGame(Table.id, GameTime);
    } else {
      //Start Waiting Timer
      await StartLobbyWaitingTimer(Table.id, LobbyTime, UserId);
    }
  } catch (error: any) {}
};

export const SitInTable = async (
  TableId: string,
  UserId: string,
  NumberOfTablePlayer: number,
  LobbyTime: number,
  GameTime: number,
) => {
  try {
    let Table: Table = await getTable(TableId);
    if (Table) {
      if (Table.Players.includes(UserId)) {
        await IsFull(Table, NumberOfTablePlayer, LobbyTime, UserId, GameTime);
      } else {
        if (Table.Players.length < NumberOfTablePlayer) {
          Table.Players.push(UserId);
          await SetTable(Table);
          await IsFull(Table, NumberOfTablePlayer, LobbyTime, UserId, GameTime);
        }
      }
    }
  } catch (error: any) {}
};
