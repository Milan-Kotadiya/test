import Bull from 'bull';
import { GetTGP, AddTGP } from '../Services/RedisFunctions/RedisAll';
import Emitter from '../Connections/Emitter';
import { StartRematchTimer } from './RematchTimerQueue';

const GameTimerQueue = new Bull('game-timer-queue');

GameTimerQueue.process(async (job, done) => {
  await StartRematchTimer(job.data.Tableid, job.data.Rematchtime ,job.data.Players)
  done();
});
GameTimerQueue.on('completed', async (job, result) => {
  Emitter.emit('GameTimer', {
    TimerTitle: 'GameTimeOver',
    TimerData: {
      GameId: job.id,
      MSG: `Game Time Over for TableId :: ${job.id}`,
    },
  });
  // Logger.info(`Game Over Timer Work Completed, For TableId :: ${job.id} `);
});
GameTimerQueue.on('failed', (job, err) => {
  // Logger.info(
  //   `Game Over Timer Work failed For TableId :: ${
  //     job.id
  //   }, Error is :: ${JSON.stringify(err.message)}`
  // );
});

export const StartGameTimer = async (Tableid: string, GameTime: number,NumberOfTablePlayer:number, Time: number) => {
  try {
    const isAvailabe = await GameTimerQueue.getJob(Tableid);

    if (!isAvailabe) {
      await GameTimerQueue.add({ Tableid , Players: NumberOfTablePlayer ,Rematchtime: Time}, { delay: GameTime * 60 * 1000, jobId: Tableid, removeOnComplete: true });
    }
  } catch (error: any) {
    // Logger.error(
    //   `Error At StartGameTimer For TableId :: ${Tableid}, Error :: ${error.message}`
    // );
  }
};

export const StopGameTimer = async (Tableid: string) => {
  try {
    const JOB = await GameTimerQueue.getJob(Tableid);
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
