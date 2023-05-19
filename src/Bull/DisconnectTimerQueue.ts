import Bull from 'bull';
import { Player } from '../Services/Constructors/PlayerConstructor';
import { AddTGP, AddUser, GetTGP, GetUser } from '../Services/RedisFunctions/RedisAll';
import { Game } from '../Services/Constructors/GameConstructor';

const DisconnectTimerQueue = new Bull('disconnect-timer-queue');

interface JobData {
  Tableid: string;
  PlayerId: string;
}

const DisconnectTimerWork = async (JobData: JobData) => {
  try {
    let PLAYER: Player = await GetUser(JobData.PlayerId);
    if (PLAYER.GameDetails.isDisconneted === true) {
      //UPdate Player Status
      PLAYER.TableId = '';
      PLAYER.GameDetails.isDisconneted = false;
      PLAYER.GameDetails.DisconnectedAt = '';
      await AddUser(PLAYER.UserId, PLAYER);
      let TGP: Game = await GetTGP(JobData.Tableid);
      let Players = TGP.Players;
      Players.splice(Players.indexOf(JobData.PlayerId), 1);
      if (Players.length === 1) {
        //TGP Update
        TGP.isWinner = true;
        TGP.winner = Players[0];
        TGP.GameOverReason = `Opponent :: ${JobData.PlayerId}, Left The Game`;
        await AddTGP(TGP);

        //Game Over
        // await GameOver(JobData.Tableid);
        return;
      } else {
        await AddTGP(TGP);
        return;
      }
    }
  } catch (error: any) {
    // Logger.error(`Eroor At DisconnectTimerWork : ${error.message}`);
  }
};

DisconnectTimerQueue.process(async function (job, done) {
  await DisconnectTimerWork(job.data);
  done();
});
DisconnectTimerQueue.on('completed', function (job, result) {
  // Logger.info(
  //   `User Removed From Game Userid :: ${job.id}, And Game Id :: ${job.data.Tableid}`
  // );
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
    let isAvailabe = await DisconnectTimerQueue.getJob(Tableid);
    if (isAvailabe) {
      return;
    }

    if (!isAvailabe) {
      await DisconnectTimerQueue.add(
        { Tableid: Tableid, PlayerId: PlayerId },
        { delay: DisconnectTime * 1000, jobId: PlayerId, removeOnComplete: true },
      );

      return;
    }
  } catch (error: any) {
    // Logger.error(
    //   `Error At StartGameTimer For PlayerId :: ${PlayerId}, Error :: ${error.message}`
    // );
  }
};

export const StopDisconnectTimer = async (PlayerId: string) => {
  try {
    let JOB = await DisconnectTimerQueue.getJob(PlayerId);
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
