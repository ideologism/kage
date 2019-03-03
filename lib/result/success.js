"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var result_1 = require("./result");
var Success = /** @class */ (function (_super) {
    __extends(Success, _super);
    function Success(success) {
        var _this = _super.call(this) || this;
        _this.value = success;
        return _this;
    }
    Success.prototype.success = function (handler) {
        return handler(this.value);
    };
    Success.prototype.failure = function (handler) {
        return handler();
    };
    Success.prototype.cata = function (x) {
        return x.success(this.value);
    };
    return Success;
}(result_1.Result));
exports.Success = Success;
