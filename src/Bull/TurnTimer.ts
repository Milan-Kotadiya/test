import Bull from 'bull';
import Emitter from '../Connections/Emitter';
import { Table } from '../Services/Constructors/TableConstructor';
import { getTable } from '../Services/RedisFunctions/RedisAll';

const TurnTimerQueue = new Bull('turn-timer-queue');

const TurnTimerWork = async (Tableid: string) => {
  const CurrentTable: Table = await getTable(Tableid);
  if (CurrentTable) {
    Emitter.emit('GameTimer', {
      TimerTitle: 'TurnChange',
      TimerData: {
        TableID: Tableid,
        MSG: `Please Change Turn For TableId`,
      },
    });
  } else {
    // TODO Fixme
    // await StopTurnTimer(Tableid);
  }
};

TurnTimerQueue.process(async (job, done) => {
  await TurnTimerWork(job.data.Tableid);
  done();
});

TurnTimerQueue.on('completed', (job, result) => {
  // console.log(`Timer Work Completed For TableId :: `, job.data);
});
TurnTimerQueue.on('failed', (job, err) => {
  // console.log(`Timer Work failed For TableId :: ${job.data}`);
});

export const StartTurnTimer = async (Tableid: string, TurnTime: number, gameTime: number) => {
  try {
    const Repeat = (gameTime * 60) / TurnTime;
    const options: Bull.JobOptions = {
      delay: 0,
      repeat: {
        every: TurnTime * 1000,
        limit: Repeat,
      },
      removeOnComplete: true,
    };
    await TurnTimerQueue.add({ Tableid }, options);
  } catch (error: any) {
    // Logger.error(
    //   `Error At Start RematchTimer For TableId :: ${Tableid}, Error :: ${error.message}`
    // );
  }
};
