"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isSuccess(result) {
    return "value" in result;
}
function isSome(optional) {
    return optional !== "None";
}
function initOptional(t) {
    return t === undefined ? "None" : { value: t };
}
var Lexer = /** @class */ (function () {
    function Lexer(parser) {
        this.parser = parser;
    }
    Lexer.of = function (parser) {
        return new Lexer(parser);
    };
    Lexer.return = function (origin) {
        return Lexer.of(function (input) { return ({ value: origin, remaining: input }); });
    };
    // Helper Method
    Lexer.prototype.bind = function (f) {
        var _this = this;
        return function (str) {
            var result = _this.parser(str);
            if (isSuccess(result)) {
                var value = result.value, remaining = result.remaining;
                return f(value)(remaining);
            }
            return result;
        };
    };
    Lexer.prototype.map = function (transform) {
        return this.bind(function (t) { return returnP(transform(t)); });
    };
    Lexer.prototype.apply = function (parser) {
        return this.bind((function (f) {
            return Lexer.of(parser).bind(function (x) { return returnP(f(x)); });
        }));
    };
    Lexer.prototype.then = function (parserB) {
        return this.bind(function (t) {
            return Lexer.of(parserB).bind(function (s) { return returnP([t, s]); });
        });
    };
    Lexer.prototype.or = function (parserB) {
        var _this = this;
        return function (str) {
            var resultA = _this.parser(str);
            if (isSuccess(resultA)) {
                return resultA;
            }
            var resultB = parserB(str);
            if (isSuccess(resultB)) {
                return resultB;
            }
            return resultB;
        };
    };
    return Lexer;
}());
exports.Lexer = Lexer;
