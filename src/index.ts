import { Model } from './Constructor/Model';
import { GameBasic } from './Interface';

const Greeter = (name: string) => `Hello ${name}`;
export { Greeter, Model };

const REDIS = {
  Host: '127.0.0.1',
  Port: '6379',
  Password: '',
  DBNumber: '11',
};
const HTTPS = {
  Port: '5000',
  CertPath: '', //Provide Here Certificate Path For Production Purpose
  KeyPath: '', //Provide Here Key Path For Production Purpose
};
const GameBasicInfo: GameBasic = {
  GameTime: 3, //Game Time (In Minutes , typeOf Number)
  LobbyWaitTime: 5, //How Many Seconds, Player Wait in lobby For Another Player TO Join Table (In second, typeOf Number)
  PlayersPerTable: 4, // How Many Player's Need On Table TO Start Game (typeOf Number)
  isMinPlayerModeOn: false, //If game Is For 4 Players But we can start if Two Player Join then, Value of isMinPlayerModeOn = true
  MinPlayerToStartGame: 2, // if isMinPlayerModeOn = true then number of Player reuire to start game, else make it 0
  RemacthWaitTime: 60, //After Game Over After How Many Seconds Need To Check Rematch Response (Which Is sent By Player) (In second, typeOf Number),
  isTableWithEntryFee: false, // IF Table is based On entryFee Like Table For 500 Coins, 300 Coins Then (true) else (false) (typeOf boolean)
  ReconnectWithin: 30, //If Player DisConnet During Game Then Within Howmany Second Player Can ReConnect In Game (In second, typeOf Number)
};
const isLocal = true; //For Production, isLocal = false

const SERVER = new Model(isLocal, REDIS, HTTPS, GameBasicInfo);

const GLobalIO = SERVER.SocketIO;

SERVER.GameTimerSays((TimerDetails) => {
  console.log(TimerDetails);
});

// SERVER.GameTimer.on('GameTimer', async (Data) => {
//   console.log(Data);
// }); //

GLobalIO.on('connection', async (socket) => {
  await SERVER.Login('Milan1234', 'Milan@1234', socket, (error, data) => {
    if (error) {
      // Send Error To Client Like This
      SERVER.SendToRequester(socket.id, 'LOGIN', error.message, 'Login is Fail!!!');
    } else {
      // Send Response To Client Like This
      if (data.Rejoin === true) {
        console.log('Login Data Rejoin', data);
        SERVER.SendToRequester(socket.id, 'LOGIN', data.UserData, 'Login Sucessfull!!!');
        //Get Table Info
        SERVER.GetTable(data.TableId, (error, Tabledata) => {
          if (error) {
            console.log('Login Data Rejoin get Table Error', error.message);

            // Send Error To Client Like This
            SERVER.SendToRequester(socket.id, 'REJOIN', error.message, 'REJOIN is Fail!!!');
          } else {
            //Send Table Data
            SERVER.SendToRequester(socket.id, 'REJOIN', Tabledata, 'REJOIN Sucessfull!!!');
          }
        });
      }
      if (data.Rejoin === false) {
        console.log('Login Data Create Table', data.UserData.UserId);

        SERVER.SendToRequester(socket.id, 'LOGIN', data.UserData, 'Login Sucessfull!!!');
        //Create Table
        SERVER.CreateTable(data.UserData.UserId, (error, TableID) => {
          if (error) {
            console.log(error.message, 'Error Message');
          } else {
            console.log(TableID, 'TableId');
          }
        });
      }
    }
  });

  console.log(`Socket Connected, ${socket.id}`); //

  socket.on('disconnect', (reason) => {
    console.log('socket disconnected : ' + socket.id, reason);
  });
});
