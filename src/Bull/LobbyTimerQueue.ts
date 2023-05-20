import Bull from 'bull';
import {
  AddUser,
  DeleteTable,
  GetEmptyTable,
  GetEmptyTableEntryfee,
  GetUser,
  SetEmptyTable,
  SetEmptyTableEntryfee,
  getTable,
} from '../Services/RedisFunctions/RedisAll';
import { Table } from '../Services/Constructors/TableConstructor';
import { Player } from '../Services/Constructors/PlayerConstructor';
import Emitter from '../Connections/Emitter';

const LobbyTimerQueue = new Bull('lobby-timer-queue');

const LobbyTimerQueueWork = async (Tableid: string) => {
  try {
    const Tablel: Table = await getTable(Tableid);
    if (!Table) {
      // Logger.error(
      //   `Table Not Found At LobbyTimerQueueWork To Remove Player For TableId :: ${Tableid}`
      // );
    }
    const PlayerArray = Tablel.Players;
    for (const playerId of PlayerArray) {
      let Playerl: Player = await GetUser(playerId);
      Playerl.TableId = '';
      Playerl = Playerl;
      await AddUser(Playerl.UserId, Playerl);
    }
    // Delete Table
    await DeleteTable(Tableid);
    if(Tablel.EntryFee){
            // Remove This Table From Empty Table List
            const EmptyTable : {
              Tableid: string;
              EntryFee: number;
          } [] = await GetEmptyTableEntryfee();
          const index = EmptyTable.findIndex(x => x.Tableid === Tablel.id);
            EmptyTable.splice(index, 1);
            await SetEmptyTableEntryfee(EmptyTable)

    }else{
      // Remove This Table From Empty Table List
      const EmptyTable: any = await GetEmptyTable();
      EmptyTable.splice(EmptyTable.indexOf(Tablel.id), 1);
      await SetEmptyTable(EmptyTable);
    }
   
  } catch (error: any) {
    // Logger.error(
    //   `Error At LobbyTimerQueueWork For TableId :: ${Tableid}, Error :: ${error.message}`
    // );
  }
};

LobbyTimerQueue.process(async (job, done) => {
  await LobbyTimerQueueWork(job.data.Tableid);
  done();
});
LobbyTimerQueue.on('completed', (job, result) => {
  Emitter.emit('GameTimer', {
    TimerTitle: 'LobbyTimer',
    TimerData: {
      LobbyTableID: job.id,
      ForUserId: job.data.UserId,
      MSG: `Joining Table For UserId :: ${job.data.UserId} has Been Stopped, Lobby Time Over`,
    },
  });
  // Logger.info(`Lobby Waiting Timer Work Completed For TableId :: ${job.id}`);
});
LobbyTimerQueue.on('failed', (job, err) => {
  // Logger.info(
  //   `Lobby Waiting Timer Work Failed For TableId :: ${
  //     job.id
  //   }, Eroor :: ${JSON.stringify(err.message)}`
  // );
});

export const StartLobbyWaitingTimer = async (Tableid: string, LobbyWaitTime: number, UserID: string) => {
  try {
    const isAvailabe = await LobbyTimerQueue.getJob(Tableid);

    if (!isAvailabe) {
      await LobbyTimerQueue.add(
        { Tableid, UserId: UserID },
        { delay: LobbyWaitTime * 1000, jobId: Tableid, removeOnComplete: true },
      );
    }
  } catch (error: any) {
    // Logger.error(
    //   `Error At StartLobbyWaitingTimer For TableId :: ${Tableid}, Error :: ${error.message}`
    // );
  }
};

export const StopLobbyWaitingTimer = async (Tableid: string) => {
  try {
    const JOB = await LobbyTimerQueue.getJob(Tableid);
    if (JOB) {
      JOB.remove();
    }

    if (!JOB) {
      // Logger.error(
      //   `Error At StopLobbyWaitingTimer For TableId :: ${Tableid}, Error :: JOB Not Found`
      // );
    }
  } catch (error: any) {
    // Logger.error(
    //   `Error At StopLobbyWaitingTimer For TableId :: ${Tableid}, Error :: ${error.message}`
    // );
  }
};
