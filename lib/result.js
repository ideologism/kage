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
function isResultSuccess(result) {
    return "value" in result;
}
function initResult(result) {
    var resultCallback = function (handler) {
        return isResultSuccess(result) ? handler.success(result) : handler.failure(result);
    };
    if (isSuccess(result)) {
        var successCallback = function (handler) {
            return handler(result);
        };
        return __assign({}, result, { success: successCallback, handle: resultCallback });
    }
    var failureCallback = function (handler) {
        return handler(result);
    };
    return __assign({}, result, { failure: failureCallback, handle: resultCallback });
}
exports.initResult = initResult;
