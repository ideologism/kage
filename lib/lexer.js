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
function isSuccess(result) {
    return "value" in result;
}
function isSome(optional) {
    return optional !== "None";
}
function initOptional(t) {
    return t === undefined ? "None" : { value: t };
}
function pChar(char) {
    return function (str) {
        if (!!str && char === str[0]) {
            return { value: char, remaining: str.substring(1) };
        }
        return { message: "Expecting " + char + " Got " + str[0] + "\"" };
    };
}
function then(parserA, parserB) {
    return bindP(function (t) { return (bindP(function (s) { return returnP([t, s]); })(parserB)); })(parserA);
}
function or(parserA, parserB) {
    return function (str) {
        var resultA = parserA(str);
        if (isSuccess(resultA)) {
            return resultA;
        }
        var resultB = parserB(str);
        if (isSuccess(resultB)) {
            return resultB;
        }
        var message = resultB.message;
        return { message: message };
    };
}
function choice(parsers) {
    return parsers.reduce(function (acc, cur) {
        return or(acc, cur);
    });
}
function anyOf(chars) {
    return choice(chars.map(function (char) { return pChar(char); }));
}
function mapP(transform) {
    return bindP(function (t) { return returnP(transform(t)); });
}
function returnP(origin) {
    return function (input) {
        return { value: origin, remaining: input };
    };
}
function apply(parserF) {
    return function (parserT) {
        return bindP(function (f) { return bindP(function (x) { return returnP(f(x)); })(parserT); })(parserF);
        // parserF.bindP(parserT.bindP)
    };
}
function lift2(f) {
    return function (parserT) {
        return function (parserS) {
            return apply(apply(returnP(f))(parserT))(parserS);
        };
    };
}
function sequence(parserList) {
    if (parserList.length === 0) {
        return returnP([]);
    }
    function cons(first) {
        return function (rest) {
            return __spread([first], rest);
        };
    }
    var consP = lift2(cons);
    var _a = __read(parserList), first = _a[0], rest = _a.slice(1);
    return consP(first)(sequence(rest));
}
function pString(str) {
    return mapP(function (x) { return x.join(""); })(sequence(__spread(str).map(function (char) { return pChar(char); })));
}
function pStringOld(str) {
    return __spread(str).map(function (char) { return pChar(char); })
        .reduce(function (acc, cur, i) {
        if (i < 2) {
            return acc;
        }
        return then(acc, cur);
    }, then(pChar(str[0]), pChar(str[1])));
}
function parseZeroOrMore(parser) {
    return function (str) {
        var result = parser(str);
        if (!isSuccess(result)) {
            return { value: [], remaining: str };
        }
        var value = result.value, remaining = result.remaining;
        var _a = parseZeroOrMore(parser)(remaining), sequenceValue = _a.value, sequenceRemaining = _a.remaining;
        return { value: __spread([value], sequenceValue), remaining: sequenceRemaining };
    };
}
function many(parser) {
    return function (str) {
        return parseZeroOrMore(parser)(str);
    };
}
function many1(parser) {
    return bindP(function (first) { return bindP(function (rest) { return returnP(__spread([first], rest)); })(many(parser)); })(parser);
}
function opt(parser) {
    var optionalNone = returnP(initOptional());
    var optionalSome = mapP(initOptional)(parser);
    return or(optionalSome, optionalNone);
}
function pInt(str) {
    var digitParser = anyOf(Array(10)
        .fill(0)
        .map(function (n, i) { return i + ""; }));
    var digitsParser = then(opt(pChar("-")), many1(digitParser));
    var mapMinus = function (x) {
        var hasMinus = x[0];
        var value = Number(x[1].join(""));
        return isSome(hasMinus) ? -value : value;
    };
    return mapP(mapMinus)(digitsParser)(str);
}
function startWith(parserFirst, parserSecond) {
    return mapP(function (_a) {
        var _b = __read(_a, 2), _ = _b[0], second = _b[1];
        return second;
    })(then(parserFirst, parserSecond));
}
function endWith(parserFirst, parserSecond) {
    return mapP(function (_a) {
        var _b = __read(_a, 2), first = _b[0], _ = _b[1];
        return first;
    })(then(parserFirst, parserSecond));
}
function between(parser) {
    return function (left, right) {
        return endWith(startWith(left, parser), right);
    };
}
function sepBy1(parser, sep) {
    return mapP(function (_a) {
        var _b = __read(_a, 2), first = _b[0], second = _b[1];
        return __spread([first], second);
    })(then(parser, many(startWith(sep, parser))));
}
function sepBy(parser, sep) {
    return or(sepBy1(parser, sep), returnP([]));
}
function bindP(f) {
    return function (parser) {
        return function (str) {
            var result = parser(str);
            if (isSuccess(result)) {
                var value = result.value, remaining = result.remaining;
                return f(value)(remaining);
            }
            return result;
        };
    };
}
console.log(pInt("1234"));
