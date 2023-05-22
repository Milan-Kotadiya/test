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
exports.Game = void 0;
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
const mongoose_1 = __importDefault(require("mongoose"));
const TableConstructor_1 = require("../Services/Constructors/TableConstructor");
const SitInTable_1 = require("../Services/MatchMaking/SitInTable");
const GameBasicClass_1 = require("./GameBasicClass");
const ReMatch_1 = require("../Services/MatchMaking/ReMatch");
const TimerAll_1 = require("../Bull/TimerAll");
class Game extends GameBasicClass_1.ModelOptions {
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
        this.IO = Socket_1.io;
        this.Redlock = Redlock_1.redLock;
        this.ExpressApp = Express_1.default;
        this.RedisClients = {
            Redis: Redis_1.redisClient,
            pubClient: Redis_1.pubClient,
            subClient: Redis_1.subClient,
        };
        this.GameTimer = TimerAll_1.TimerAll;
    }
    ReMatch(Response, socket, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const Return = yield (0, ReMatch_1.Rematch)(Response, socket);
            if (Return.error === true) {
                callback({ Status: 'Fail', message: Return.msg });
            }
            if (Return.error === false) {
                callback({ Status: 'Success', message: Return.msg });
            }
        });
    }
    Login(UserID, Password, socket, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const PlayerL = yield (0, RedisAll_1.GetUser)(UserID);
                if (PlayerL) {
                    const Compare = yield (0, ComparePassword_1.comparePassword)(Password, PlayerL.Password, PlayerL.Salt);
                    if (Compare) {
                        if (PlayerL.TableId && PlayerL.TableId !== '') {
                            socket.handshake.auth.UserDetails = {
                                UserId: PlayerL.UserId,
                                TableId: PlayerL.TableId,
                            };
                            // Rejoin
                            callback(null, { Rejoin: true, TableId: PlayerL.TableId, UserData: PlayerL });
                        }
                        else {
                            socket.handshake.auth.UserDetails = {
                                UserId: PlayerL.UserId,
                                TableId: '',
                            };
                            callback(null, { Rejoin: false, TableId: null, UserData: PlayerL });
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
                EventDetails,
                Message,
            }));
        }
        catch (error) {
            // Logger.error(`Error At CallBack: ${error.message}`);
        }
    }
    // SignUP
    SIGNUP(SignUpData, socket, callback, Coins) {
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
                    if (this.options.isTableWithEntryFee === false) {
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
                    else {
                        if (Coins) {
                            const HashPass = (0, GeneratePassword_1.genPassword)(SignUpData.Password);
                            const RedisUser = new PlayerConstructor_1.Player(SignUpData.UserId, SignUpData.UserName, HashPass.hash, HashPass.salt, socket.id, Coins);
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
                        else {
                            callback({
                                error: true,
                                message: 'Players Current Coins Require For Entry Fee!!!',
                            }, null);
                        }
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
    // Create Table
    CreateTable(Userid, callback, EntryFee) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let PlayerTL = yield (0, RedisAll_1.GetUser)(Userid);
                if (this.options.isTableWithEntryFee === true) {
                    if (EntryFee) {
                        //  Create Table With Entry Fee
                        const EmptyTable = yield (0, RedisAll_1.GetEmptyTableEntryfee)();
                        if (EmptyTable && EmptyTable.length === 0) {
                            const NewEmptyTable = new mongoose_1.default.Types.ObjectId().toString();
                            EmptyTable.push({ Tableid: NewEmptyTable, EntryFee });
                            yield (0, RedisAll_1.SetEmptyTableEntryfee)(EmptyTable);
                            PlayerTL.TableId = NewEmptyTable;
                            PlayerTL = PlayerTL;
                            yield (0, RedisAll_1.AddUser)(PlayerTL.UserId, PlayerTL);
                            const CreateTable = new TableConstructor_1.Table(NewEmptyTable, PlayerTL.UserId, this.options, EntryFee);
                            yield (0, RedisAll_1.SetTable)(CreateTable);
                            if (this.options.isMinPlayerModeOn === true) {
                                yield (0, SitInTable_1.SitInTable)(CreateTable.id, PlayerTL.UserId, this.options);
                            }
                            else {
                                yield (0, SitInTable_1.SitInTable)(CreateTable.id, PlayerTL.UserId, this.options);
                            }
                            callback(null, CreateTable);
                        }
                        else {
                            const NewEmptyTable = EmptyTable[0].Tableid;
                            PlayerTL.TableId = NewEmptyTable;
                            PlayerTL = PlayerTL;
                            yield (0, RedisAll_1.AddUser)(PlayerTL.UserId, PlayerTL);
                            if (this.options.isMinPlayerModeOn === true) {
                                yield (0, SitInTable_1.SitInTable)(NewEmptyTable, PlayerTL.UserId, this.options);
                            }
                            else {
                                yield (0, SitInTable_1.SitInTable)(NewEmptyTable, PlayerTL.UserId, this.options);
                            }
                            const TableLAST = yield (0, RedisAll_1.getTable)(NewEmptyTable);
                            callback(null, TableLAST);
                        }
                    }
                    else {
                        callback({
                            error: true,
                            message: 'Entry Fee Is Required TO Join Table',
                        }, null);
                    }
                }
                else {
                    const EmptyTable = yield (0, RedisAll_1.GetEmptyTable)();
                    if (EmptyTable && EmptyTable.length === 0) {
                        // Create a new table
                        const NewEmptyTable = new mongoose_1.default.Types.ObjectId().toString();
                        EmptyTable.push(NewEmptyTable);
                        yield (0, RedisAll_1.SetEmptyTable)(EmptyTable);
                        // Add in a new table
                        PlayerTL.TableId = NewEmptyTable;
                        PlayerTL = PlayerTL;
                        yield (0, RedisAll_1.AddUser)(PlayerTL.UserId, PlayerTL);
                        const CreateTable = new TableConstructor_1.Table(NewEmptyTable, PlayerTL.UserId, this.options);
                        yield (0, RedisAll_1.SetTable)(CreateTable);
                        if (this.options.isMinPlayerModeOn === true) {
                            yield (0, SitInTable_1.SitInTable)(CreateTable.id, PlayerTL.UserId, this.options);
                        }
                        else {
                            yield (0, SitInTable_1.SitInTable)(CreateTable.id, PlayerTL.UserId, this.options);
                        }
                        callback(null, CreateTable);
                    }
                    if (EmptyTable && EmptyTable.length > 0) {
                        const NewEmptyTable = EmptyTable[0];
                        // Add in a table
                        PlayerTL.TableId = NewEmptyTable;
                        PlayerTL = PlayerTL;
                        yield (0, RedisAll_1.AddUser)(PlayerTL.UserId, PlayerTL);
                        if (this.options.isMinPlayerModeOn === true) {
                            yield (0, SitInTable_1.SitInTable)(NewEmptyTable, PlayerTL.UserId, this.options);
                        }
                        else {
                            yield (0, SitInTable_1.SitInTable)(NewEmptyTable, PlayerTL.UserId, this.options);
                        }
                        const TableLASTN = yield (0, RedisAll_1.getTable)(NewEmptyTable);
                        callback(null, TableLASTN);
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
    // Send to User By UserId
    SendEventToUser(UserId, EventName, EventDetails, Message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const PlayerLAST = yield (0, RedisAll_1.GetUser)(UserId);
                Socket_1.io.to(PlayerLAST.soketId).emit(EventName, JSON.stringify({
                    EventDetails,
                    Message,
                }));
            }
            catch (error) {
                // Logger.error(`Error At CallBack: ${error.message}`);
            }
        });
    }
}
exports.Game = Game;
//# sourceMappingURL=Model.js.map