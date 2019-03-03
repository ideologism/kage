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
var Failure = /** @class */ (function (_super) {
    __extends(Failure, _super);
    function Failure(failure) {
        var _this = _super.call(this) || this;
        _this.value = failure;
        return _this;
    }
    Failure.prototype.failure = function (handler) {
        return handler(this.value);
    };
    Failure.prototype.success = function (handler) {
        return handler();
    };
    Failure.prototype.cata = function (x) {
        return x.failure(this.value);
    };
    return Failure;
}(result_1.Result));
exports.Failure = Failure;
