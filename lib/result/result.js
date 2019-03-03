"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var failure_1 = require("./failure");
var success_1 = require("./success");
function isSuccessValue(result) {
    return "value" in result;
}
exports.isSuccessValue = isSuccessValue;
var Result = /** @class */ (function () {
    function Result() {
    }
    Result.of = function (result) {
        return isSuccessValue(result)
            ? new success_1.Success(result)
            : new failure_1.Failure(result);
    };
    Result.prototype.isSuccess = function () {
        return isSuccessValue(this.value);
    };
    return Result;
}());
exports.Result = Result;
