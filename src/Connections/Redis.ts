import { createClient, RedisClientOptions } from 'redis';
import { REDISConnection } from '../Interface';

let redisClient: any;
let pubClient: any;
let subClient: any;

const RedisConnection = async (REDIS: REDISConnection) => {
  try {
    const redisOptions: RedisClientOptions = {
      socket: {
        host: REDIS.Host,
        port: Number(REDIS.Port),
      },
      password: REDIS.Password,
      database: Number(REDIS.DBNumber),
    };

    const pubRedisOptions: RedisClientOptions = {
      socket: {
        host: REDIS.Host,
        port: Number(REDIS.Port),
      },
      password: REDIS.Password,
      database: Number(REDIS.DBNumber),
    };

    redisClient = createClient(redisOptions);

    pubClient = createClient(pubRedisOptions);

    subClient = pubClient.duplicate();

    await redisClient.connect();
    await pubClient.connect();

    redisClient.on('connect', () => {
      // Logger.info(`RedisConnection Successful!!`);
    });

    redisClient.on('error', (error: any) => {
      // Logger.info(` Eroor At RedisConnection : ${e.message}`);
    });
  } catch (e: any) {
    // Logger.error(` Eroor At RedisConnection : ${e.message}`);
  }
};

export { RedisConnection, redisClient, pubClient, subClient };
