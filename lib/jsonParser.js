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
Object.defineProperty(exports, "__esModule", { value: true });
var helper_1 = require("./helper");
var input_1 = require("./input");
var parser_1 = require("./parser");
var types_1 = require("./types");
exports.jsonNull = parser_1.Parser.parseString("null")
    .map(function (_) { return null; })
    .setLabel("null");
exports.jsonBool = parser_1.Parser.parseString("true")
    .or(parser_1.Parser.parseString("false"))
    .map(function (x) { return (x === "true" ? true : false); });
exports.unescapedChar = parser_1.Parser.satisfy(function (x) { return x !== "\\" && x !== '"'; }, "char");
exports.escapedChar = parser_1.Parser.choice([
    // (stringToMatch, resultChar)
    ['\\"', '"'],
    ["\\\\", "\\"],
    ["\\/", "/"],
    ["\\b", "\b"],
    ["\\f", "\f"],
    ["\\n", "\n"],
    ["\\r", "\r"],
    ["\\t", "\t"] // tab
].map(function (_a) {
    var _b = __read(_a, 2), x = _b[0], y = _b[1];
    return parser_1.Parser.parseString(x).map(function (_) { return y; });
})).setLabel("escaped char");
// TODO: support unicode string
var quotation = parser_1.Parser.parseString('"');
exports.jsonString = exports.unescapedChar
    .or(exports.escapedChar)
    .many()
    .between(quotation, quotation)
    .map(function (x) { return x.join(""); });
var scanMinusSign = parser_1.Parser.parseString("-");
var scanMinusOrPlusSign = parser_1.Parser.anyOf(["-", "+"]);
var scanZero = parser_1.Parser.parseString("0");
var scanOneToNine = parser_1.Parser.anyOf(Array(9)
    .fill(0)
    .map(function (n, i) { return i + 1 + ""; })).setLabel("digit");
var scanDigits = scanZero.or(scanOneToNine);
var scanPoint = parser_1.Parser.parseString(".");
var scanSpace = parser_1.Parser.parseString(" ");
var scanE = parser_1.Parser.anyOf(["e", "E"]);
exports.jsonNumber = scanMinusSign
    .optional()
    .then(scanOneToNine.then(scanDigits.many()).or(scanZero))
    .then(scanPoint.then(scanDigits.many1()).optional())
    .then(scanE
    .then(scanMinusOrPlusSign)
    .then(scanDigits)
    .optional())
    .map(function (_a) {
    var _b = __read(_a, 2), _c = __read(_b[0], 2), _d = __read(_c[0], 2), minusSign = _d[0], integerPart = _d[1], decimalPart = _c[1], exponentPart = _b[1];
    var intergerValue = typeof integerPart === "string"
        ? 0
        : integerPart[0] + integerPart[1].join("");
    var decimalValue = types_1.isSome(decimalPart)
        ? decimalPart.value[0] + decimalPart.value[1].join("")
        : "";
    var exponentValue = types_1.isSome(exponentPart)
        ? exponentPart.value[0].join("") + exponentPart.value[1]
        : "";
    var value = Number(intergerValue + decimalValue + exponentValue);
    return types_1.isSome(minusSign) ? -value : value;
});
var leftBracket = parser_1.Parser.parseString("[").then(scanSpace.many());
var rightBracket = parser_1.Parser.parseString("]").then(scanSpace.many());
var comma = parser_1.Parser.parseString(",").then(scanSpace.many());
var _a = helper_1.createParserForwardedToRef(), jsonValueParser = _a.parser, jsonValueRef = _a.ref;
var jsonValue = jsonValueParser
    .then(scanSpace.many())
    .map(function (_a) {
    var _b = __read(_a, 2), value = _b[0], _ = _b[1];
    return value;
});
exports.jsonArray = parser_1.Parser.startWith(leftBracket, jsonValue.sepBy(comma))
    .endWith(rightBracket)
    .setLabel("Array");
var leftBrace = parser_1.Parser.parseString("{");
var rightBrace = parser_1.Parser.parseString("}");
var colon = parser_1.Parser.parseString(":");
var key = exports.jsonString;
var value = jsonValue;
var keyValue = key.endWith(colon).then(value);
var keyValues = keyValue.sepBy(comma);
var jsonObject = keyValues.between(leftBrace, rightBrace).map(function (x) {
    return x.reduce(function (cur, _a) {
        var _b = __read(_a, 2), key = _b[0], value = _b[1];
        cur[key] = value;
        return cur;
    }, {});
});
jsonValueRef.parser = parser_1.Parser.choice([
    exports.jsonNull,
    exports.jsonBool,
    exports.jsonNumber,
    exports.jsonString,
    exports.jsonArray,
    jsonObject
]);
var example1 = '{"widget":{"debug":"on","window":{"title":"SampleKonfabulatorWidget","name":"main_window","width":500,"height":500},"image":{"src":"Images/Sun.png","name":"sun1","hOffset":250,"vOffset":250,"alignment":"center"},"text":{"data":"ClickHere","size":36,"style":"bold","name":"text1","hOffset":250,"vOffset":100,"alignment":"center","onMouseUp":"sun1.opacity=(sun1.opacity/100)*90;"}}}';
jsonObject.execute(input_1.initInput(example1));
