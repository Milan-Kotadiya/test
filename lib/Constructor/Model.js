"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Model = void 0;
const MINUS = (a, b) => {
    return a - b;
};
const SUM = (a, b) => {
    return a + b;
};
const MUL = (a, b) => {
    return a * b;
};
const DIV = (a, b) => {
    return a / b;
};
class Model {
    constructor() {
        this.MINUS = MINUS;
        this.SUM = SUM;
        this.MUL = MUL;
        this.DIV = DIV;
    }
}
exports.Model = Model;
//# sourceMappingURL=Model.js.map