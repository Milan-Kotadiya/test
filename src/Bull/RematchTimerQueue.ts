import Bull from 'bull';
import Emitter from '../Connections/Emitter';

const RematchTimerQueue = new Bull('Rematch-timer-queue');

RematchTimerQueue.process(async function (job, done) {
  // await RematchCheck(job.data.Tableid);
  done();
});
RematchTimerQueue.on('completed', function (job, result) {
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
    let isAvailabe = await RematchTimerQueue.getJob(Tableid);
    if (isAvailabe) {
      return;
    }

    if (!isAvailabe) {
      await RematchTimerQueue.add(
        { Tableid: Tableid },
        { delay: RematchTime * 1000, jobId: Tableid, removeOnComplete: true },
      );

      return;
    }
  } catch (error: any) {
    // Logger.error(
    //   `Error At Start RematchTimer For TableId :: ${Tableid}, Error :: ${error.message}`
    // );
  }
};

export const StopRematchTimer = async (Tableid: string) => {
  try {
    let JOB = await RematchTimerQueue.getJob(Tableid);
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
