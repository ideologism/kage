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
var input_1 = require("./input");
var result_1 = require("./result");
var types_1 = require("./types");
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
    Lexer.anyOf = function (chars) {
        return Lexer.choice(chars.map(function (char) { return pChar(char); }));
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
        var _a = __read(lexerList), firstL = _a[0], restL = _a.slice(1);
        return consL(firstL)(Lexer.sequence(restL));
    };
    Lexer.scanZeroOrMore = function (lexer) {
        return function (input) {
            var result = lexer.execute(input).handle({
                failure: function (_) { return result_1.initResult({ value: [], remaining: input }); },
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
    Lexer.prototype.setLabel = function (label) {
        this.label = label;
        return this;
    };
    // execute lexer
    Lexer.prototype.execute = function (input) {
        var result = this.lexerFn(input);
        if (result_1.isSuccess(result)) {
            return result;
        }
        return __assign({}, result, { tag: this.label || result.tag });
    };
    // Helper function
    Lexer.prototype.bind = function (f) {
        var _this = this;
        return Lexer.of(function (input) {
            return _this.execute(input).handle({
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
        var lexerFn = (function (input) {
            return _this.execute(input).handle({
                failure: function () {
                    return lexer.execute(input).handle({
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
        return Lexer.of(function (input) {
            return Lexer.scanZeroOrMore(_this)(input);
        });
    };
    Lexer.prototype.many1 = function () {
        var _this = this;
        return this.bind(function (first) {
            return _this.many().bind(function (rest) { return Lexer.return(__spread([first], rest)); });
        });
    };
    Lexer.prototype.optional = function () {
        var optionalNone = Lexer.return(types_1.initOptional());
        var optionalSome = this.map(types_1.initOptional);
        return optionalSome.or(optionalNone);
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
function satisfy(predicate, label) {
    if (label === void 0) { label = ""; }
    return Lexer.of(function (input) {
        var _a = input_1.consume(input), newInput = _a.newInput, value = _a.value;
        var char = value;
        if (!types_1.isSome(char)) {
            return result_1.initResult({
                error: "No More Input",
                position: input.position,
                tag: label
            });
        }
        else {
            if (predicate(char.value)) {
                return result_1.initResult({ value: char.value, remaining: newInput });
            }
            return result_1.initResult({
                error: char.value,
                position: input.position,
                tag: label
            });
        }
    }, label);
}
exports.satisfy = satisfy;
function pChar(char) {
    var predicate = function (str) { return !!str && char === str; };
    return satisfy(predicate, char);
}
function pInt(str) {
    var input = input_1.initInput(str);
    var digitScanner = Lexer.anyOf(Array(10)
        .fill(0)
        .map(function (n, i) { return i + ""; })).setLabel("digit");
    var digitsScanner = pChar("-")
        .optional()
        .then(digitScanner.many1())
        .setLabel("digits");
    var mapMinus = function (x) {
        var hasMinus = x[0];
        var value = Number(x[1].join(""));
        return types_1.isSome(hasMinus) ? -value : value;
    };
    return digitsScanner.map(mapMinus).execute(input);
}
function pString(str) {
    return Lexer.sequence(str.split("").map(function (char) { return pChar(char); })).map(function (x) {
        return x.join("");
    });
}
exports.pString = pString;
