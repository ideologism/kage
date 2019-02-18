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
var input_1 = require("./input");
var lexer_1 = require("./lexer");
var types_1 = require("./types");
var result_1 = require("./result");
exports.jsonNull = lexer_1.pString("null")
    .map(function (_) { return null; })
    .setLabel("null");
exports.jsonBool = lexer_1.pString("true")
    .or(lexer_1.pString("false"))
    .map(function (x) { return (x === "true" ? true : false); });
exports.unescapedChar = lexer_1.satisfy(function (x) { return x !== "\\" && x !== '"'; }, "char");
exports.escapedChar = lexer_1.Lexer.choice([
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
    return lexer_1.pString(x).map(function (_) { return y; });
})).setLabel("escaped char");
// TODO: support unicode string
var quotation = lexer_1.pString('"');
exports.jsonString = exports.unescapedChar
    .or(exports.escapedChar)
    .many()
    .between(quotation, quotation)
    .map(function (x) { return x.join(""); });
var scanMinusSign = lexer_1.pString("-");
var scanMinusOrPlusSign = lexer_1.Lexer.anyOf(["-", "+"]);
var scanZero = lexer_1.pString("0");
var scanOneToNine = lexer_1.Lexer.anyOf(Array(9)
    .fill(0)
    .map(function (n, i) { return i + 1 + ""; })).setLabel("digit");
var scanDigits = scanZero.or(scanOneToNine);
var scanPoint = lexer_1.pString(".");
var scanSpace = lexer_1.pString(" ");
var scanE = lexer_1.Lexer.anyOf(["e", "E"]);
// [[[minusSign: Optional<string>, integerPart: string | [string, string[]]], decimalPart: Optional<[string, string[]]>], exponentPart: Optional<[[string, string], string]>]
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
var leftBracket = lexer_1.pString("[").then(scanSpace.many());
var rightBracket = lexer_1.pString("]").then(scanSpace.many());
var comma = lexer_1.pString(",").then(scanSpace.many());
var _a = createParserForwardedToRef(), parser = _a.parser, ref = _a.ref;
var jsonValue = parser
    .then(scanSpace.many())
    .map(function (_a) {
    var _b = __read(_a, 2), value = _b[0], _ = _b[1];
    return value;
});
exports.jsonArray = lexer_1.Lexer.startWith(leftBracket, jsonValue.sepBy(comma))
    .endWith(rightBracket)
    .setLabel("Array");
// helper
function createParserForwardedToRef() {
    var dummyParser = lexer_1.Lexer.of(function (_) {
        throw new Error("unfixed forwarded parser");
    }, "unknown");
    var parserRef = { parser: dummyParser };
    var wrapperParser = lexer_1.Lexer.of(function (input) { return parserRef.parser.execute(input); });
    return { parser: wrapperParser, ref: parserRef };
}
ref.parser = lexer_1.Lexer.choice([exports.jsonNull, exports.jsonBool, exports.jsonNumber, exports.jsonString, exports.jsonArray]);
result_1.printResult(exports.jsonArray.execute(input_1.initInput('[[],[],1,2,3]')));
