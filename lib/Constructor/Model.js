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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Model = void 0;
const Redis_1 = require("../Connections/Redis");
const RedisAll_1 = require("../Services/RedisFunctions/RedisAll");
const Http_1 = require("../Connections/Http");
const Https_1 = require("../Connections/Https");
const Redlock_1 = require("../Connections/Redlock");
const Socket_1 = require("../Connections/Socket");
const Express_1 = __importDefault(require("../Connections/Express"));
const PlayerConstructor_1 = require("../Services/Constructors/PlayerConstructor");
const ComparePassword_1 = require("../Services/Validation/ComparePassword");
const GeneratePassword_1 = require("../Services/Validation/GeneratePassword");
class ModelOptions {
    constructor(options) {
        this.options = {
            GameTime: 3,
            LobbyWaitTime: 5,
            PlayersPerTable: 4,
            isMinPlayerModeOn: false,
            MinPlayerToStartGame: 2,
            RemacthWaitTime: 60,
            isTableWithEntryFee: false,
            ReconnectWithin: 30,
        };
        this.options = options;
    }
}
class Model extends ModelOptions {
    constructor(isLocal, Redis, HTTPS, gameBasics) {
        super(gameBasics);
        try {
            if (isLocal === true) {
                Promise.all([
                    (0, Http_1.HttpConnection)(HTTPS),
                    (0, Redis_1.RedisConnection)(Redis),
                    (0, Socket_1.SocketConnection)(isLocal),
                    (0, Redlock_1.RedLockConnection)(Redis),
                ]);
            }
            if (isLocal === false) {
                Promise.all([
                    (0, Https_1.HttpsConnection)(HTTPS),
                    (0, Redis_1.RedisConnection)(Redis),
                    (0, Socket_1.SocketConnection)(isLocal),
                    (0, Redlock_1.RedLockConnection)(Redis),
                ]);
            }
        }
        catch (e) {
            // Logger.error(`Eroor At Index.ts : ${e.message}`);
        }
        this.SocketIO = Socket_1.io;
        this.Redlock = Redlock_1.redLock;
        this.ExpressApp = Express_1.default;
        this.RedisClients = {
            Redis: Redis_1.redisClient,
            pubClient: Redis_1.pubClient,
            subClient: Redis_1.subClient,
        };
    }
    Login(UserID, Password, socket, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const Player = yield (0, RedisAll_1.GetUser)(UserID);
                if (Player) {
                    const Compare = yield (0, ComparePassword_1.comparePassword)(Password, Player.Password, Player.Salt);
                    if (Compare) {
                        if (Player.TableId && Player.TableId !== '') {
                            // Rejoin
                            callback(null, { Rejoin: true, TableId: Player.TableId });
                        }
                        else {
                            // TODO
                            console.log(this.options);
                            if (this.options.isTableWithEntryFee === false) {
                                // Normal Empty Table
                            }
                            else {
                            }
                            callback(null, { Rejoin: false, TableId: 'TableId' });
                        }
                    }
                    else {
                        callback({ error: true, message: 'Password is Invalid' }, null);
                    }
                }
                else {
                    callback({ error: true, message: 'UserID is Invalid' }, null);
                }
            }
            catch (error) {
                callback({
                    error: true,
                    message: error.message,
                }, null);
            }
        });
    }
    // Send to Clien
    SendToRequester(SendTo, EventName, EventDetails, Message) {
        try {
            Socket_1.io.to(SendTo).emit(EventName, JSON.stringify({
                EventDetails: EventDetails,
                Message: Message,
            }));
        }
        catch (error) {
            // Logger.error(`Error At CallBack: ${error.message}`);
        }
    }
    // SignUP
    SIGNUP(SignUpData, socket, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const Invalid = yield (0, RedisAll_1.GetUser)(SignUpData.UserId);
                if (Invalid) {
                    callback({
                        error: true,
                        message: 'User Already Registered!!!',
                    }, null);
                }
                else {
                    // let HasPassword
                    const HashPass = (0, GeneratePassword_1.genPassword)(SignUpData.Password);
                    const RedisUser = new PlayerConstructor_1.Player(SignUpData.UserId, SignUpData.UserName, HashPass.hash, HashPass.salt, socket.id);
                    // Saving in Redis
                    yield (0, RedisAll_1.AddUser)(RedisUser.UserId, RedisUser);
                    const Get = yield (0, RedisAll_1.GetUser)(RedisUser.UserId);
                    if (Get) {
                        // save data in Socket;
                        socket.handshake.auth.UserDetails = {
                            UserId: RedisUser.UserId,
                            TableId: RedisUser.TableId,
                        };
                        callback(null, Get);
                    }
                }
            }
            catch (error) {
                callback({
                    error: true,
                    message: error.message,
                }, null);
            }
        });
    }
}
exports.Model = Model;
//# sourceMappingURL=Model.js.map