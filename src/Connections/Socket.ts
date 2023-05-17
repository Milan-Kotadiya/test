import { createAdapter } from '@socket.io/redis-adapter';
import { Server, Socket } from 'socket.io';
import { httpsServer } from './Https';
import { httpServer } from './Http';
import { pubClient, subClient } from './Redis';

let io: any;

const SocketConnection = (isLocal: boolean) => {
  try {
    const server = isLocal ? httpServer : httpsServer;

    io = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    io.adapter(createAdapter(pubClient, subClient));

    io.on('connection', async (socket: Socket) => {
      // Logger.info(`Socket Connected : ${socket.id}`);

      socket.onAny((eventName: any, data: any) => {
        // Logger.info(`Socket On Any Called, Event Name : ${eventName} And DATA is ${JSON.stringify(data)}`);
      });

      socket.on('disconnect', async (reason: any) => {
        // Logger.info(`Socket Disconnect : ${socket.id} Reason: ${reason}`);
        await socket.disconnect();
      });
    });
  } catch (e: any) {
    // Logger.error(`Error At SocketConnection :  ${e.message}`);
  }
};
export { SocketConnection, io };
