import Bull from 'bull';
import { Game } from '../Services/Constructors/GameConstructor';
import { GetTGP, AddTGP } from '../Services/RedisFunctions/RedisAll';

const GameTimerQueue = new Bull('game-timer-queue');

GameTimerQueue.process(async function (job, done) {
  let TGP: Game = await GetTGP(job.data.Tableid);
  TGP.GameOverReason = `Game Time Over`;
  await AddTGP(TGP);
  // Emitter.emit(Constant.Socket.GAMEOVER, job.data.Tableid);
  done();
});
GameTimerQueue.on('completed', function (job, result) {
  // Logger.info(`Game Over Timer Work Completed, For TableId :: ${job.id} `);
});
GameTimerQueue.on('failed', (job, err) => {
  // Logger.info(
  //   `Game Over Timer Work failed For TableId :: ${
  //     job.id
  //   }, Error is :: ${JSON.stringify(err.message)}`
  // );
});

export const StartGameTimer = async (Tableid: string, GameTime: number) => {
  try {
    let isAvailabe = await GameTimerQueue.getJob(Tableid);
    if (isAvailabe) {
      return;
    }

    if (!isAvailabe) {
      await GameTimerQueue.add(
        { Tableid: Tableid },
        { delay: GameTime * 60 * 1000, jobId: Tableid, removeOnComplete: true },
      );

      return;
    }
  } catch (error: any) {
    // Logger.error(
    //   `Error At StartGameTimer For TableId :: ${Tableid}, Error :: ${error.message}`
    // );
  }
};

export const StopGameTimer = async (Tableid: string) => {
  try {
    let JOB = await GameTimerQueue.getJob(Tableid);
    if (JOB) {
      JOB.remove();
    }

    if (!JOB) {
      // Logger.error(
      //   `Error At Manual Removal StopGameTimer For TableId :: ${Tableid}, Error :: JOB Not Found`
      // );
    }
  } catch (error: any) {
    // Logger.error(
    //   `Error At StopGameTimer For TableId :: ${Tableid}, Error :: ${error.message}`
    // );
  }
};
