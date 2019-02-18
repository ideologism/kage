"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var result_1 = require("./result");
function isSome(optional) {
    return optional !== "None";
}
function initOptional(t) {
    return t === undefined ? "None" : { value: t };
}
exports.initOptional = initOptional;
var Lexer = /** @class */ (function () {
    function Lexer(lexerFn, label) {
        if (label === void 0) { label = ""; }
        this.lexerFn = lexerFn;
        this.label = label;
    }
    Lexer.of = function (lexerFn, label) {
        if (label === void 0) { label = ""; }
        return new Lexer(lexerFn, label);
    };
    Lexer.return = function (origin) {
        return Lexer.of(function (input) {
            return result_1.initResult({ value: origin, remaining: input });
        });
    };
    Lexer.choice = function (parsers) {
        return parsers.reduce(function (acc, cur) {
            return acc.or(cur);
        });
    };
    Lexer.lift2 = function (f) {
        return function (lexerT) {
            return function (lexerS) {
                return lexerS.apply(lexerT.apply(Lexer.return(f)));
            };
        };
    };
    Lexer.sequence = function (lexerList) {
        if (lexerList.length === 0) {
            return Lexer.return([]);
        }
        function cons(first) {
            return function (rest) {
                return __spread([first], rest);
            };
        }
        var consL = Lexer.lift2(cons);
        var _a = __read(lexerList), first = _a[0], rest = _a.slice(1);
        return consL(first)(Lexer.sequence(rest));
    };
    Lexer.scanZeroOrMore = function (lexer) {
        return function (str) {
            var result = lexer.execute(str).handle({
                failure: function (_) { return result_1.initResult({ value: [], remaining: str }); },
                success: function (_a) {
                    var value = _a.value, remaining = _a.remaining;
                    return Lexer.scanZeroOrMore(lexer)(remaining).success(function (_a) {
                        var sequenceValue = _a.value, sequenceRemaining = _a.remaining;
                        return result_1.initResult({
                            remaining: sequenceRemaining,
                            value: __spread([value], sequenceValue)
                        });
                    });
                }
            });
            return result;
        };
    };
    Lexer.startWith = function (lexerStart, lexerRest) {
        return lexerStart.then(lexerRest).map(function (_a) {
            var _b = __read(_a, 2), _ = _b[0], rest = _b[1];
            return rest;
        });
    };
    // execute lexer
    Lexer.prototype.execute = function (input) {
        return this.lexerFn(input);
    };
    // Helper function
    Lexer.prototype.bind = function (f) {
        var _this = this;
        return Lexer.of(function (str) {
            return _this.execute(str).handle({
                failure: function (result) { return result_1.initResult(result); },
                success: function (_a) {
                    var value = _a.value, remaining = _a.remaining;
                    return f(value).execute(remaining);
                }
            });
        }, this.label);
    };
    Lexer.prototype.map = function (transform) {
        return this.bind(function (t) { return Lexer.return(transform(t)); });
    };
    Lexer.prototype.apply = function (lexer) {
        var _this = this;
        return lexer.bind(function (transform) {
            return _this.bind(function (x) { return Lexer.return(transform(x)); });
        });
    };
    //
    Lexer.prototype.then = function (lexer) {
        return this.bind(function (t) {
            return lexer.bind(function (s) { return Lexer.return([t, s]); });
        });
    };
    Lexer.prototype.or = function (lexer) {
        var _this = this;
        var lexerFn = (function (str) {
            return _this.execute(str).handle({
                failure: function () {
                    return lexer.execute(str).handle({
                        failure: function (result) { return result_1.initResult(result); },
                        success: function (result) { return result_1.initResult(result); }
                    });
                },
                success: function (result) { return result_1.initResult(result); }
            });
        });
        return Lexer.of(lexerFn);
    };
    Lexer.prototype.many = function () {
        var _this = this;
        return Lexer.of(function (str) {
            return Lexer.scanZeroOrMore(_this)(str);
        });
    };
    Lexer.prototype.many1 = function () {
        var _this = this;
        return this.bind(function (first) { return _this.many().bind(function (rest) { return Lexer.return(__spread([first], rest)); }); });
    };
    Lexer.prototype.optional = function () {
        var optionalNone = Lexer.return(initOptional());
        var optionalSome = this.map(initOptional);
        return optionalNone.or(optionalSome);
    };
    Lexer.prototype.endWith = function (lexerEnd) {
        return this.then(lexerEnd).map(function (_a) {
            var _b = __read(_a, 2), first = _b[0], _ = _b[1];
            return first;
        });
    };
    Lexer.prototype.between = function (left, right) {
        return Lexer.startWith(left, this.endWith(right));
    };
    Lexer.prototype.sepBy1 = function (sep) {
        return this.then(Lexer.startWith(sep, this).many()).map(function (_a) {
            var _b = __read(_a, 2), first = _b[0], second = _b[1];
            return __spread([first], second);
        });
    };
    Lexer.prototype.sepBy = function (sep) {
        return this.sepBy1(sep).or(Lexer.return([]));
    };
    return Lexer;
}());
exports.Lexer = Lexer;
