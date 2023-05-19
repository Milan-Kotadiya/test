import Bull from 'bull';
import { Player } from '../Services/Constructors/PlayerConstructor';
import { AddTGP, AddUser, GetTGP, GetUser } from '../Services/RedisFunctions/RedisAll';
import { Game } from '../Services/Constructors/GameConstructor';
import Emitter from '../Connections/Emitter';

const DisconnectTimerQueue = new Bull('disconnect-timer-queue');

interface JobData {
  Tableid: string;
  PlayerId: string;
}

const DisconnectTimerWork = async (JOBDATA: JobData) => {
  try {
    let PLAYER: Player = await GetUser(JOBDATA.PlayerId);
    if (PLAYER.GameDetails.isDisconneted === true) {
      //  UPdate Player Status
      PLAYER.TableId = '';
      PLAYER.GameDetails.isDisconneted = false;
      PLAYER.GameDetails.DisconnectedAt = '';
      PLAYER = PLAYER;
      await AddUser(PLAYER.UserId, PLAYER);
      let TGP: Game = await GetTGP(JOBDATA.Tableid);
      let Players = TGP.Players;
      Players = Players.splice(Players.indexOf(JOBDATA.PlayerId), 1);
      if (Players.length === 1) {
        // TGP Update
        TGP.isWinner = true;
        TGP.winner = Players[0];
        TGP.GameOverReason = `Opponent :: ${JOBDATA.PlayerId}, Left The Game`;
        TGP = TGP;
        await AddTGP(TGP);

        // Game Over
        Emitter.emit('GameTimer', {
          TimerTitle: 'AllPlayerLeft',
          TimerData: {
            TableID: JOBDATA.Tableid,
            Winner: JOBDATA.PlayerId,
            MSG: `All Player Left The Game, Winner:: ${JOBDATA.PlayerId}, And Game Id :: ${JOBDATA.Tableid}`,
          },
        });
      } else {
        await AddTGP(TGP);
      }
    }
  } catch (error: any) {
    // Logger.error(`Eroor At DisconnectTimerWork : ${error.message}`);
  }
};

DisconnectTimerQueue.process(async (job, done) => {
  await DisconnectTimerWork(job.data);
  done();
});
DisconnectTimerQueue.on('completed', (job, result) => {
  Emitter.emit('GameTimer', {
    TimerTitle: 'DisconnectTimer',
    TimerData: {
      TableID: job.data.Tableid,
      ForUserId: job.id,
      MSG: `User Removed From Game Userid :: ${job.id}, And Game Id :: ${job.data.Tableid}`,
    },
  });
});
DisconnectTimerQueue.on('failed', (job, err) => {
  // Logger.info(
  //   `DisconnectTimerQueue For PlayerId ${job.id} failed ${JSON.stringify(
  //     err.message
  //   )}`
  // );
});

export const StartDisconnectTimer = async (PlayerId: string, Tableid: string, DisconnectTime: number) => {
  try {
    // Logger.info(
    //   `User Disconnected Userid :: ${PlayerId}, And He Was In Game, Game Id :: ${Tableid}`
    // );
    const isAvailabe = await DisconnectTimerQueue.getJob(Tableid);

    if (!isAvailabe) {
      await DisconnectTimerQueue.add(
        { Tableid, PlayerId },
        { delay: DisconnectTime * 1000, jobId: PlayerId, removeOnComplete: true },
      );
    }
  } catch (error: any) {
    // Logger.error(
    //   `Error At StartGameTimer For PlayerId :: ${PlayerId}, Error :: ${error.message}`
    // );
  }
};

export const StopDisconnectTimer = async (PlayerId: string) => {
  try {
    const JOB = await DisconnectTimerQueue.getJob(PlayerId);
    if (JOB) {
      JOB.remove();
    }

    if (!JOB) {
      // Logger.error(
      //   `Error At StopDisconnectTimer For PlayerId :: ${PlayerId}, Error :: JOB Not Found`
      // );
    }
  } catch (error: any) {
    // Logger.error(
    //   `Error At StopDisconnectTimer For PlayerId :: ${PlayerId}, Error :: ${error.message}`
    // );
  }
};
