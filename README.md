# Introduction

### Installation

      // with npm
      npm install gamemilanmodel

### How to use

      import { Game } from "gamemilanmodel";
      import { Socket } from "socket.io";
      const REDIS = {
            Host: "127.0.0.1",
            Port: "6379",
            Password: "",
            DBNumber: "11",
      };
      const HTTPS = {
            Port: "5000",
            CertPath: "", //Provide Here Certificate Path For Production Purpose
            KeyPath: "", //Provide Here Key Path For Production Purpose
      };
      const GameBasicInfo = {
            GameTime: 3, //Game Time (In Minutes , typeOf Number)
            LobbyWaitTime: 5, //How Many Second Player Wait in lobby For Another Player TO Join Table (In second, typeOf Number)
            isMinPlayerModeOn: true, // PlayersPerTable = 4, if we want to Start Game When 2 Player Availabe Then , True (typeOf boolean)
            MinPlayerToStartGame: 2, // Minimum Player Number Require to Start Game (typeOf Number)
            PlayersPerTable: 6, // How Many Player's Need On Table TO Start Game (typeOf Number)
            RemacthWaitTime: 60, //After Game Over After How Many Seconds Need To Check Rematch Response (Which Is sent By Player) (In second, typeOf Number),
            isTableWithEntryFee: false, // IF Table is based On entryFee Like Table For 500 Coins, 300 Coins Then (true) else (false) (typeOf boolean)
            ReconnectWithin: 30, //If Player DisConnet During Game Then Within Howmany Second Player Can ReConnect In Game (In second, typeOf Number)
      };

      const isLocal = true; //For Production, isLocal = false

      const CHESS = new Game(isLocal, REDIS, HTTPS , GameBasicInfo);

### Hot Feature Of This Package - Gameflow

      const Gameflow = CHESS.GameFlow;
      const GLobalIO = CHESS.SocketIO;
      GLobalIO.on('connection', (socket) => {
            socket.on('REQ', async (Data) => {
            if (Data.EventName === 'SIGNUP') {
                  // Do Signup and save User data in Redis Database
                  await Gameflow.SIGNUP(Data.EventDetails, socket, (error, data) => {
                  if (data) {
                  // Send Response To Client Like This
                  Gameflow.SendToRequester(socket.id, 'Suggestion', data, 'SignUp Sucessfull!!!');
                  }
                  if (error) {
                  // Send Error To Client Like This
                  Gameflow.SendToRequester(socket.id, 'Suggestion', error.message, 'SignUp is Fail!!!');
                  }
                  });
            }

            if (Data.EventName === 'Login') {
              await CHESS.Login(USERID, PASSWORD, socket, (error, data) => {
                  if (error) {
                        // Send Error To Client Like This
                        CHESS.SendToRequester(socket.id, 'LOGIN', error.message, 'Login is Fail!!!');
                  } else {
                        // Send Response To Client Like This
                        if (data.Rejoin === true) {
                        CHESS.SendToRequester(socket.id, 'LOGIN', data.UserData, 'Login Sucessfull!!!');
                        //Get Table Info
                        CHESS.GetTable(data.TableId, (error, Tabledata) => {
                        if (error) {
                              // Send Error To Client Like This
                              CHESS.SendToRequester(socket.id, 'REJOIN', error.message, 'REJOIN is Fail!!!');
                        } else {
                              //Send Table Data
                              CHESS.SendToRequester(socket.id, 'REJOIN', Tabledata, 'REJOIN Sucessfull!!!');
                        }
                        });
                        }
                        if (data.Rejoin === false) {
                        CHESS.SendToRequester(socket.id, 'LOGIN', data.UserData, 'Login Sucessfull!!!');
                        //Create Table
                        CHESS.CreateTable(data.UserData.UserId, (error, Table) => {
                        if (error) {
                              CHESS.SendToRequester(socket.id, 'LOGIN', error.message, 'Joining Table Process is Fail!!!');
                        } else {
                              CHESS.SendToRequester(socket.id, 'LOGIN', Table, 'Joining Table Process Sucessfull!!!');
                        }
                        });
                        }
                        }
                  });

                  }

            });

            socket.on('disconnect', (reason) => {
                  console.log('socket disconnected : ' + socket.id, reason);
            });
      });

### Manage Game Flow

            CHESS.LobbyTimer((LobbyData) => {
              console.log(LobbyData);
            });

            CHESS.GameStarted((GameData) => {
             console.log(GameData);
            });
             CHESS.GameTimeOver((GameData) => {
              console.log(GameData);
             });

            CHESS.RematchTimeOver((GameData) => {
            console.log(GameData);
            });

### Socket IO

      const RedisFunctions = CHESS.RedisFunction;
      const GLobalIO = CHESS.SocketIO;
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

### Express App

        const app = CHESS.ExpressApp;

        app.get('/123', (req, resp) => {
        resp.send('321');
        });

### Redis

        const Redis = CHESS.RedisClients.Redis;
        let Key = 'CarInfo';
        let Keydata = {
        CarName: 'Ford',
        CarColour: 'Black',
        };

        let SaveKey = await Redis.set(Key, JSON.stringify(Keydata));

### Pub - Sub

        const PubClient = CHESS.RedisClients.pubClient;
        const SubClient = CHESS.RedisClients.subClient;

        const listener = (message, channel) => console.log(message, channel);
        await SubClient.subscribe('check', listener);
        await PubClient.publish('Greeting', 'Hello World');

### RedLock

        const redlock = CHESS.Redlock;

        let lock = await redlock.acquire(['a'], 5000);
        //Do Something Here ....
        await lock.release();
