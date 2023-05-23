# Introduction

### Installation

      // with npm
      npm install gamemilanmodel

### How to use

      import { Game } from "gamemilanmodel";

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
            isTurnTimer: false, (typeOf boolean)
            TurnTime: 30, (In second, typeOf Number)
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

      const IO = CHESS.IO;
      IO.on("connection", async (socket) => {
      console.log(`Socket Connected, ${socket.id}`);

      socket.on("SIGNUP", async (EventData) => {
            const { UserId, UserName, Password } = EventData; // UserId Shoud be Unique,
            // if GameBasicInfo.isTableWithEntryFee =  false, no need to Add Total Coins
                  await CHESS.SIGNUP(
                        { UserId: UserId, UserName: UserName, Password: Password },
                        socket,
                        (error, data) => {
                        if (error) {
                        console.log(error.message);
                        } else console.log(data);
                  });
            // if GameBasicInfo.isTableWithEntryFee =  true, Add coins As a Total Coins
            const {coins} = EventData;
                  CHESS.SIGNUP(
                  { UserId: UserId, UserName: UserName, Password: Password },
                  socket,
                  (error, data) => {
                  if (error) {
                        console.log(error.message);
                  } else console.log(data);
                  },
                  coins,
                  );
            });

            socket.on("Login", async (EventData) => {
                  const { UserId, Password } = EventData; // UserId Shoud be Unique
                  await CHESS.Login(UserId, Password, socket, (error, data) => {
                        if (error) {
                        console.log(error.message);
                        } else console.log(data);
                  });
            });

            socket.on("Join_Table", async (EventData) => {
            const { UserId } = socket.handshake.auth.UserDetails;

            //if GameBasicInfo.isTableWithEntryFee =  false, entryFee igonre
                  await CHESS.CreateTable(UserId, (error, table) => {
                        if (error) {
                        console.log(error.message);
                        } else {
                        console.log(table);
                        }
                  });
            //if GameBasicInfo.isTableWithEntryFee =  true, entryFee Add
            const { EntryFee } = EventData; // EntryFee Shoud Be in number, Like 500, 300 as a coins;
                  await CHESS.CreateTable(
                        UserId,
                        (error, table) => {
                        if (error) {
                        console.log(error.message);
                        } else {
                        console.log(table);
                        }
                        },
                        EntryFee
                  );
            });

            socket.on("ReMatch", async (EventData) => {
            const { Response } = EventData; // Response Shoud Be boolean = If Agree then True;
                  await CHESS.ReMatch(Response, socket, (result) => {
                        console.log(result);
                  });
            });

            // Send response to Client Like This
            socket.on("Login", async (EventData) => {
            const { UserId, Password } = EventData; // UserId Shoud be Unique
                  await CHESS.Login(UserId, Password, socket, (error, data) => {
                        if (error) {
                        CHESS.EventSender.SendEventToUserByUserId(
                        UserId,
                        "Login_Error",
                        error,
                        "Login Is Fail"
                        );
                        } else {
                        CHESS.EventSender.SendEventToUserByUserId(
                        UserId,
                        "Login_Error",
                        data,
                        "Login Is Succesfull"
                        );
                        }
                  });
            });

            // Send Response Or Any Event To Table
            CHESS.EventSender.EventToTable("TableId", "EventName", "EventData");

            socket.on("disconnect", (reason) => {
                  console.log("socket disconnected : " + socket.id, reason);
                  });
            });


            // To Get USER DATA :
                  const key = `USER:${UserId}`;
                  let User = await CHESS.RedisClients.Redis.get(key);
                  User = JSON.parse(User);

            // To Get Table Details:
                  const key = `Table:${Tableid}`;
                  let TableData = await CHESS.RedisClients.Redis.get(key);
                  TableData = JSON.parse(TableData);

### Manage Game Flow

            CHESS.GameTimer.LobbyTimer((LobbyData) => {
                  // LobbyData = {
                  //   LobbyTableID: 'XYZ';
                  //   UserId: 'USERID';
                  //   MSG: 'Lobby Time Over For User Id : USERID, Can't Start Game Player Not Found';
                  //   }
                  console.log(LobbyData, "LobbyData");
                  // Send Create table Event Again After Some Time
            });
            CHESS.GameTimer.GameStarted((GameStartedData) => {
                  // GameStartedData = {
                  //   TableID: 'XYZ',
                  //   MSG: 'Game  Started For Table Id : 'XYZ'',
                  //   }
                  console.log(GameStartedData, "GameStarted");
                  // Start Game By Table Details (add Your Own Logic According To Game)
            });
            CHESS.GameTimer.GameTimeOver((GameTimeOverData) => {
                  // GameTimeOverData = {
                  //   TableID: 'XYZ';
                  //   MSG: 'Game Time Over For Table Id : 'XYZ'';
                  //   }
                  console.log(GameTimeOverData, "GameTimeOver");
                  // Get Table and Check Score and do Further Process (add Your Own Logic According To Game)
            });

            CHESS.GameTimer.RematchTimeOver((RematchTimeData) => {
                  //   RematchTimeData = {
                  //     TableID: 'XYZ';
                  //     ReMatchResponse: {id: string,
                  //   True: ['USERID'],
                  //   False: ['USERID'],
                  // };
                  //     MSG: "All Player Denied For Rematch";
                  // }
                  console.log(RematchTimeData, "RematchTimeOver");
            });

            CHESS.GameTimer.TurnChange((TurnChangeData) => {
                  //   TurnChangeData =  {
                  //     TableID: 'XYZ';
                  //     MSG: 'Please Change Turn For TableId';
                  // }
                  console.log(TurnChangeData, "TurnChange");
                  // Get Table Details and Do Change Turn (add Your Own Logic According To Game)
            });

### Socket IO

      const IO = CHESS.IO;
      IO.on("connection", (socket: Socket) => {
        console.log(`Socket Connected, ${socket.id}`);

        socket.onAny(async (event, eventData) => {
          console.log(`got event ${event} and Data is ${JSON.stringify(eventData)}`);
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
