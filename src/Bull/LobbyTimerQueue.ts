import Bull from 'bull';
import {
  AddUser,
  DeleteTable,
  GetEmptyTable,
  GetUser,
  SetEmptyTable,
  getTable,
} from '../Services/RedisFunctions/RedisAll';
import { Table } from '../Services/Constructors/TableConstructor';
import { Player } from '../Services/Constructors/PlayerConstructor';
import Emitter from '../Connections/Emitter';

const LobbyTimerQueue = new Bull('lobby-timer-queue');

const LobbyTimerQueueWork = async (Tableid: string) => {
  try {
    let Table: Table = await getTable(Tableid);
    if (!Table) {
      // Logger.error(
      //   `Table Not Found At LobbyTimerQueueWork To Remove Player For TableId :: ${Tableid}`
      // );
    }
    let PlayerArray = Table.Players;
    for (let index = 0; index < PlayerArray.length; index++) {
      const PlayerId = PlayerArray[index];
      let Player: Player = await GetUser(PlayerId);
      Player.TableId = '';
      await AddUser(Player.UserId, Player);
    }
    //Delete Table
    await DeleteTable(Tableid);
    //Remove This Table From Empty Table List
    let EmptyTable: any = await GetEmptyTable();
    let FindIndex = EmptyTable.indexOf(Table);
    EmptyTable.splice(FindIndex, 1);
    await SetEmptyTable(EmptyTable);

    // Create Emmiter
  } catch (error: any) {
    // Logger.error(
    //   `Error At LobbyTimerQueueWork For TableId :: ${Tableid}, Error :: ${error.message}`
    // );
  }
};

LobbyTimerQueue.process(async function (job, done) {
  await LobbyTimerQueueWork(job.data.Tableid);
  done();
});
LobbyTimerQueue.on('completed', function (job, result) {
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
    let isAvailabe = await LobbyTimerQueue.getJob(Tableid);

    if (!isAvailabe) {
      await LobbyTimerQueue.add(
        { Tableid: Tableid, UserId: UserID },
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
    let JOB = await LobbyTimerQueue.getJob(Tableid);
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
