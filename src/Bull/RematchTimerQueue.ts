import Bull from 'bull';
import { RematchCheck } from '../Services/MatchMaking/Rematchcheck';

const RematchTimerQueue = new Bull('Rematch-timer-queue');

RematchTimerQueue.process(async (job, done) => {
  // await RematchCheck(job.data.Tableid);
  done();
});
RematchTimerQueue.on('completed', (job, result) => {
  // Logger.info(`Game Rematch Timer Work Completed, For TableId :: ${job.id}`);
});
RematchTimerQueue.on('failed', (job, err) => {
  // Logger.info(
  //   `Game Rematch Timer Work failed, For TableId :: ${
  //     job.id
  //   }, Error :: ${JSON.stringify(err.message)}`
  // );
});

export const StartRematchTimer = async (Tableid: string, RematchTime: number) => {
  try {
    const isAvailabe = await RematchTimerQueue.getJob(Tableid);

    if (!isAvailabe) {
      await RematchTimerQueue.add({ Tableid }, { delay: RematchTime * 1000, jobId: Tableid, removeOnComplete: true });
    }
  } catch (error: any) {
    // Logger.error(
    //   `Error At Start RematchTimer For TableId :: ${Tableid}, Error :: ${error.message}`
    // );
  }
};

export const StopRematchTimer = async (Tableid: string) => {
  try {
    const JOB = await RematchTimerQueue.getJob(Tableid);
    if (JOB) {
      JOB.remove();
    }

    if (!JOB) {
      // Logger.error(
      //   `Error At Stop RematchTimer For TableId :: ${Tableid}, Error :: JOB Not Found`
      // );
    }
  } catch (error: any) {
    // Logger.error(
    //   `Error At Stop RematchTimer For TableId :: ${Tableid}, Error :: ${error.message}`
    // );
  }
};
