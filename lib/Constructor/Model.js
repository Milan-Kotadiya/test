"use strict";
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
class Model {
    constructor(isLocal, Redis, HTTPS) {
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
        this.RedisFunction = RedisAll_1.RedisFunctions;
        this.SocketIO = Socket_1.io;
        this.Redlock = Redlock_1.redLock;
        this.ExpressApp = Express_1.default;
        this.RedisClients = {
            Redis: Redis_1.redisClient,
            pubClient: Redis_1.pubClient,
            subClient: Redis_1.subClient,
        };
    }
}
exports.Model = Model;
//# sourceMappingURL=Model.js.map