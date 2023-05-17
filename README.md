# Introduction

##### Typescript

import { Model } from "gamemilanmodel";
import { Socket } from "socket.io";
try {
const REDIS = {
Host: "127.0.0.1",
Port: "6379",
Password: "",
DBNumber: "11",
};

      const HTTPS = {
        Port: "5000",
        CertPath: "",
        KeyPath: "",
      };
      const isLocal = true;

      const SERVER = new Model(isLocal, REDIS, HTTPS);

### Socket IO

      const RedisFunctions = SERVER.RedisFunction;
      const GLobalIO = SERVER.SocketIO;
      GLobalIO.on("connection", (socket: Socket) => {
        console.log(`Socket Connected, ${socket.id}`);

        socket.onAny(async (event, eventData) => {
          console.log(`got event ${event} and Data is ${JSON.stringify(eventData)}`);
          if (event === "Signup") {
            await RedisFunctions.SetKey(event, eventData);
            const Data = await RedisFunctions.GetKey(event);
            console.log(`Getted Data From Redis :: ${JSON.stringify(Data)}`);
          }
        });

        socket.on("disconnect", (reason) => {
          console.log("socket disconnected : " + socket.id, reason);
        });
      });

## Express App

const app = SERVER.ExpressApp;

app.get('/123', (req, resp) => {
resp.send('321');
});

## Redis

const RedisClients = SERVER.RedisClients;

const Redis = RedisClients.Redis;
let Key = 'CarInfo';
let Keydata = {
CarName: 'Ford',
CarColour: 'Black',
};

let SaveKey = await Redis.set(Key, JSON.stringify(Keydata));

# Pub - Sub

const PubClient = RedisClients.pubClient;
const SubClient = RedisClients.subClient;
const listener = (message, channel) => console.log(message, channel);
await SubClient.subscribe('check', listener);
await PubClient.publish('Greeting', 'Hello World');

# RedLock

const redlock = SERVER.Redlock;
let lock = await redlock.acquire(['a'], 5000);
//Do Something Here ....
await lock.release();

} catch (error:any) {
console.log(`error msg :: ${error.message}`);
}
