"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = exports.Greeter = void 0;
const Model_1 = require("./Constructor/Model");
Object.defineProperty(exports, "Game", { enumerable: true, get: function () { return Model_1.Game; } });
const Greeter = (name) => `Hello ${name}`;
exports.Greeter = Greeter;
// const REDIS = {
//     Host: "127.0.0.1",
//     Port: "6379",
//     Password: "",
//     DBNumber: "11",
// };
// const HTTPS = {
//     Port: "5000",
//     CertPath: "", 
//     KeyPath: "", 
// };
// const GameBasicInfo = {
//     GameTime: 3, // Game Time (In Minutes , typeOf Number)
//     LobbyWaitTime: 30,
//     isMinPlayerModeOn:false, 
//     MinPlayerToStartGame : 0, // How Many Second Player Wait in lobby For Another Player TO Join Table (In second, typeOf Number)
//     PlayersPerTable: 2, // How Many Player's Need On Table TO Start Game (typeOf Number)
//     RemacthWaitTime: 60, // After Game Over After How Many Seconds Need To Check Rematch Response (Which Is sent By Player) (In second, typeOf Number),
//     isTableWithEntryFee: true, // IF Table is based On entryFee Like Table For 500 Coins, 300 Coins Then (true) else (false) (typeOf boolean)
//     ReconnectWithin: 30, // If Player DisConnet During Game Then Within Howmany Second Player Can ReConnect In Game (In second, typeOf Number)
// };
// const isLocal = true;
// const CHESS = new Game(isLocal, REDIS, HTTPS , GameBasicInfo);
// const IO = CHESS.SocketIO;
// const redisClient = CHESS.RedisClients.Redis
// const Test = async () => {
// }
// // Test();
// CHESS.GameTimerSays(async (TimerDetails) => {
//     console.log(TimerDetails);
//     });
// IO.on("connection", (socket: Socket) => {
//     console.log(`Socket Connected, ${socket.id}`);
//     // CHESS.SIGNUP({UserId:'Milan1234',UserName: 'Milan',Password:'Milan@1234'},socket,(error,data)=>{
//     //     if(error) {
//     //         console.log(error.message)
//     //     }else(
//     //         console.log(data)
//     //     )
//     // },5000)
//     // CHESS.SIGNUP({UserId:'Vijay1234',UserName: 'Vijay',Password:'Vijay@1234'},socket,(error,data)=>{
//     //     if(error) {
//     //         console.log(error.message)
//     //     }else(
//     //         console.log(data)
//     //     )
//     // },50000)
//     // CHESS.Login('Milan1234','Milan@1234',socket,(error,data)=>{
//     //         if(error) {
//     //             console.log(error.message)
//     //         }else(
//     //             console.log(data)
//     //         )
//     //     })
//     // CHESS.CreateTable('Milan1234',(error,table)=>{
//     //     if (error){
//     //         console.log(error.message)
//     //     }else{
//     //         console.log(table,'create table')
//     //     }
//     // })
//     // CHESS.CreateTable('Milan1234',(error,table)=>{
//     //     if (error){
//     //         console.log(error.message)
//     //     }else{
//     //         console.log(table,'create table')
//     //     }
//     // },500)
//     CHESS.CreateTable('Vijay1234',(error,table)=>{
//         if (error){
//             console.log(error.message)
//         }else{
//             console.log(table,'create table')
//         }
//     },500)
//     // socket.onAny(async (event, eventData) => {
//     //   console.log(`got event ${event} and Data is ${JSON.stringify(eventData)}`);
//     //   if (event === "Signup") {
//     //     await RedisFunctions.SetKey(event, eventData);
//     //     const Data = await RedisFunctions.GetKey(event);
//     //     console.log(`Getted Data From Redis :: ${JSON.stringify(Data)}`);
//     //   }
//     // });
//     socket.on("disconnect", (reason) => {
//       console.log("socket disconnected : " + socket.id, reason);
//     });
//   });
//# sourceMappingURL=index.js.map