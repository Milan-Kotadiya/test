"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Model = exports.Greeter = void 0;
const Model_1 = require("./Constructor/Model");
Object.defineProperty(exports, "Model", { enumerable: true, get: function () { return Model_1.Model; } });
const Greeter = (name) => `Hello ${name}`;
exports.Greeter = Greeter;
// import { Game } from './services/game.service';
// process.on('uncaughtException', function (err) {
//   console.log(err.message);
// });
// export const Greet = () => 'Hello world!';
// export { Game };
//# sourceMappingURL=index.js.map