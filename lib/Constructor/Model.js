"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Model = void 0;
var MINUS = function (a, b) {
    return a - b;
};
var SUM = function (a, b) {
    return a + b;
};
var MUL = function (a, b) {
    return a * b;
};
var DIV = function (a, b) {
    return a / b;
};
var Model = /** @class */ (function () {
    function Model() {
        this.MINUS = MINUS;
        this.SUM = SUM;
        this.MUL = MUL;
        this.DIV = DIV;
    }
    return Model;
}());
exports.Model = Model;
