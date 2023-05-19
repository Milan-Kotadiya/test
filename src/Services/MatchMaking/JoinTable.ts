import mongoose from 'mongoose';
import { AddUser, GetEmptyTable, GetPGP, GetTGP, GetUser, SetEmptyTable, getTable } from '../RedisFunctions/RedisAll';
import { SitInTable } from './SitInTable';
import { Player } from '../Constructors/PlayerConstructor';
import { Table } from '../Constructors/TableConstructor';

export const JoinTable = async (USERID: string) => {
  try {
    let User: Player = await GetUser(USERID);
    if (!User) {
    }
    // Check is he In Table?
    if (User.TableId) {
      // Stop USER-RECONNECT Timer
      // await StopDisconnectTimer(User.soketId);
      User.GameDetails.isDisconneted = false;
      await AddUser(User.soketId, User);
      // Rematch Case
      let Table: Table = await getTable(User.TableId);
    }
    //Get TGP, PGP and Send Event To Client
    const TGP = await GetTGP(User.TableId);
    const PGP = await GetPGP(USERID);

    //He is Not In Table
    if (!User.TableId) {
      let EmptyTable: any = await GetEmptyTable();
      if (EmptyTable && EmptyTable.length === 0) {
        //Create a new table
        let NewEmptyTable = new mongoose.Types.ObjectId().toString();
        EmptyTable.push(NewEmptyTable);
        let UpdateEmptyTable = await SetEmptyTable(EmptyTable);
        //Add in a new table
        User.TableId = NewEmptyTable;
        let UpdateUser = await AddUser(User.UserId, User);
        // let AddInTable = await SitInTable(NewEmptyTable, USERID);
        //Send To Client
        return NewEmptyTable;
      }

      if (EmptyTable && EmptyTable.length > 0) {
        let NewEmptyTable = EmptyTable[0];
        //Add in a table
        User.TableId = NewEmptyTable;
        //Set Table
        let UpdateUser = await AddUser(User.UserId, User);
        // let AddInTable = await SitInTable(NewEmptyTable, USERID);
        return NewEmptyTable;
      }
    }
  } catch (error: any) {
    // Logger.error(
    //   `Error At Join Table: For ::${USERID} , Error is :: ${error.message}`
    // );
  }
};
