"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isSome(optional) {
    return optional !== "None";
}
exports.isSome = isSome;
function initOptional(t) {
    return t === undefined || t === null ? "None" : { value: t };
}
exports.initOptional = initOptional;
