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
var Parser = /** @class */ (function () {
    function Parser(parserFn, label) {
        if (label === void 0) { label = ""; }
        this.ParserFn = parserFn;
        this.label = label;
    }
    Parser.of = function (parserFn, label) {
        if (label === void 0) { label = ""; }
        return new Parser(parserFn, label);
    };
    Parser.return = function (origin) {
        return Parser.of(function (input) {
            return result_1.Result.of({ value: origin, newInput: input });
        });
    };
    Parser.parseString = function (str) {
        return Parser.sequence(str.split("").map(function (char) { return pChar(char); })).map(function (x) {
            return x.join("");
        });
    };
    Parser.satisfy = function (predicate, label) {
        if (label === void 0) { label = ""; }
        return Parser.of(function (input) {
            var _a = input_1.consume(input), newInput = _a.newInput, value = _a.value;
            var char = value;
            if (!types_1.isSome(char)) {
                return result_1.Result.of({
                    error: "No More Input",
                    position: input.position,
                    tag: label
                });
            }
            else {
                if (predicate(char.value)) {
                    return result_1.Result.of({ value: char.value, newInput: newInput });
                }
                return result_1.Result.of({
                    error: char.value,
                    position: input.position,
                    tag: label
                });
            }
        }, label);
    };
    Parser.anyOf = function (chars) {
        return Parser.choice(chars.map(function (char) { return Parser.parseString(char); }));
    };
    Parser.choice = function (parsers) {
        return parsers.reduce(function (acc, cur) {
            return acc.or(cur);
        });
    };
    Parser.lift2 = function (f) {
        return function (parserT) {
            return function (parserS) {
                return parserS.apply(parserT.apply(Parser.return(f)));
            };
        };
    };
    Parser.sequence = function (parserList) {
        if (parserList.length === 0) {
            return Parser.return([]);
        }
        function cons(first) {
            return function (rest) {
                return __spread([first], rest);
            };
        }
        var consL = Parser.lift2(cons);
        var _a = __read(parserList), firstL = _a[0], restL = _a.slice(1);
        return consL(firstL)(Parser.sequence(restL));
    };
    Parser.scanZeroOrMore = function (parser) {
        return function (input) {
            return parser.execute(input).cata({
                failure: function (_) { return result_1.Result.of({ value: [], newInput: input }); },
                success: function (_a) {
                    var value = _a.value, newInput = _a.newInput;
                    return Parser.scanZeroOrMore(parser)(newInput).success(function (_a) {
                        var nextValue = _a.value, nextNewInput = _a.newInput;
                        return result_1.Result.of({
                            newInput: nextNewInput,
                            value: __spread([value], nextValue)
                        });
                    });
                }
            });
        };
    };
    Parser.startWith = function (parserStart, parserRest) {
        return parserStart.then(parserRest).map(function (_a) {
            var _b = __read(_a, 2), _ = _b[0], rest = _b[1];
            return rest;
        });
    };
    Parser.prototype.setLabel = function (label) {
        this.label = label;
        return this;
    };
    // execute Parser
    Parser.prototype.execute = function (input) {
        var result = this.ParserFn(input);
        if (result.isSuccess()) {
            return result;
        }
        return result_1.Result.of(__assign({}, result.value, { tag: this.label || result.value.tag }));
    };
    // Helper function
    Parser.prototype.bind = function (f) {
        var _this = this;
        return Parser.of(function (input) {
            return _this.execute(input).cata({
                failure: function (result) { return result_1.Result.of(result); },
                success: function (_a) {
                    var value = _a.value, newInput = _a.newInput;
                    return f(value).execute(newInput);
                }
            });
        }, this.label);
    };
    Parser.prototype.map = function (transform) {
        return this.bind(function (t) { return Parser.return(transform(t)); });
    };
    Parser.prototype.apply = function (parser) {
        var _this = this;
        return parser.bind(function (transform) {
            return _this.bind(function (x) { return Parser.return(transform(x)); });
        });
    };
    //
    Parser.prototype.then = function (parser) {
        return this.bind(function (t) {
            return parser.bind(function (s) { return Parser.return([t, s]); });
        });
    };
    Parser.prototype.or = function (parser) {
        var _this = this;
        var parserFn = (function (input) {
            return _this.execute(input).cata({
                failure: function (_) {
                    return parser.execute(input).cata({
                        failure: function (result) { return result_1.Result.of(result); },
                        success: function (result) { return result_1.Result.of(result); }
                    });
                },
                success: function (result) { return result_1.Result.of(result); }
            });
        });
        return Parser.of(parserFn);
    };
    Parser.prototype.many = function () {
        var _this = this;
        return Parser.of(function (input) {
            return Parser.scanZeroOrMore(_this)(input);
        });
    };
    Parser.prototype.many1 = function () {
        var _this = this;
        return this.bind(function (first) {
            return _this.many().bind(function (rest) { return Parser.return(__spread([first], rest)); });
        });
    };
    Parser.prototype.optional = function () {
        var optionalNone = Parser.return(types_1.initOptional());
        var optionalSome = this.map(types_1.initOptional);
        return optionalSome.or(optionalNone);
    };
    Parser.prototype.endWith = function (parserEnd) {
        return this.then(parserEnd).map(function (_a) {
            var _b = __read(_a, 2), first = _b[0], _ = _b[1];
            return first;
        });
    };
    Parser.prototype.between = function (left, right) {
        return Parser.startWith(left, this.endWith(right));
    };
    Parser.prototype.sepBy1 = function (sep) {
        return this.then(Parser.startWith(sep, this).many()).map(function (_a) {
            var _b = __read(_a, 2), first = _b[0], second = _b[1];
            return __spread([first], second);
        });
    };
    Parser.prototype.sepBy = function (sep) {
        return this.sepBy1(sep).or(Parser.return([]));
    };
    Parser.prototype.repeat = function (times) {
        return Parser.sequence(Array(times).fill(this));
    };
    return Parser;
}());
exports.Parser = Parser;
function pChar(char) {
    var predicate = function (str) { return !!str && char === str; };
    return Parser.satisfy(predicate, char);
}
