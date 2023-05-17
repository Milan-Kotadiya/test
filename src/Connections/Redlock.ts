import Redlock from 'redlock';
import Redis from 'ioredis';
import { REDISConnection } from '../Interface';

let redLock: any;

const RedLockConnection = async (RedisData: REDISConnection) => {
  try {
    // const CONFIG = Config();

    const redisDetails: any = {
      host: RedisData.Host,
      port: Number(RedisData.Port),
      password: RedisData.Password,
      db: Number(RedisData.DBNumber),
    };

    const redisClient = new Redis(redisDetails);

    redLock = new Redlock([redisClient as any], {
      driftFactor: 0.01,
      retryCount: -1,
      retryDelay: 25,
      retryJitter: 20,
      // automaticExtensionThreshold: 500
    });

    redLock.on('error', (e: any) => {
      // Logger.error(`RedLockConnection Error :  ${e.message}`);
    });
    // Logger.info('RedLock Connected !');
  } catch (e: any) {
    // Logger.error(`Error At RedLockConnection :  ${e.message}`);
  }
};

export { RedLockConnection, redLock };
