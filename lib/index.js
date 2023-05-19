"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Model = exports.Greeter = void 0;
const Model_1 = require("./Constructor/Model");
Object.defineProperty(exports, "Model", { enumerable: true, get: function () { return Model_1.Model; } });
const Greeter = (name) => `Hello ${name}`;
exports.Greeter = Greeter;
const REDIS = {
    Host: '127.0.0.1',
    Port: '6379',
    Password: '',
    DBNumber: '11',
};
const HTTPS = {
    Port: '5000',
    CertPath: '',
    KeyPath: '', //Provide Here Key Path For Production Purpose
};
const GameBasicInfo = {
    GameTime: 3,
    LobbyWaitTime: 5,
    PlayersPerTable: 4,
    isMinPlayerModeOn: false,
    MinPlayerToStartGame: 2,
    RemacthWaitTime: 60,
    isTableWithEntryFee: false,
    ReconnectWithin: 30, //If Player DisConnet During Game Then Within Howmany Second Player Can ReConnect In Game (In second, typeOf Number)
};
const isLocal = true; //For Production, isLocal = false
const SERVER = new Model_1.Model(isLocal, REDIS, HTTPS, GameBasicInfo);
const GLobalIO = SERVER.SocketIO;
SERVER.GameTimerSays((TimerDetails) => {
    console.log(TimerDetails);
});
// SERVER.GameTimer.on('GameTimer', async (Data) => {
//   console.log(Data);
// }); //
GLobalIO.on('connection', (socket) => __awaiter(void 0, void 0, void 0, function* () {
    yield SERVER.Login('Milan1234', 'Milan@1234', socket, (error, data) => {
        if (error) {
            // Send Error To Client Like This
            SERVER.SendToRequester(socket.id, 'LOGIN', error.message, 'Login is Fail!!!');
        }
        else {
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
                    }
                    else {
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
                    }
                    else {
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
}));
//# sourceMappingURL=index.js.map