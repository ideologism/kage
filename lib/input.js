"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("./types");
function initInput(str) {
    return { position: { line: 0, column: 0 }, lines: str.split("\n") };
}
exports.initInput = initInput;
function curChar(input) {
    var _a = input.position, line = _a.line, column = _a.column;
    if (line > input.lines.length - 1) {
        return types_1.initOptional();
    }
    return types_1.initOptional(input.lines[line][column]);
}
function consume(input) {
    var _a = input.position, line = _a.line, column = _a.column;
    var position = __assign({}, input.position);
    if (line > input.lines.length - 1) {
        return { newInput: input, value: curChar(input) };
    }
    column++;
    if (column > input.lines[line].length - 1) {
        line++;
        column = 0;
    }
    position.line = line;
    position.column = column;
    return { newInput: { position: position, lines: input.lines }, value: curChar(input) };
}
exports.consume = consume;
