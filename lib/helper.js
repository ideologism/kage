"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var parser_1 = require("./parser");
function createParserForwardedToRef() {
    var dummyParser = parser_1.Parser.of(function (_) {
        throw new Error("unfixed forwarded Parser");
    }, "unknown");
    var ParserRef = { parser: dummyParser };
    var wrapperParser = parser_1.Parser.of(function (input) { return ParserRef.parser.execute(input); });
    return { parser: wrapperParser, ref: ParserRef };
}
exports.createParserForwardedToRef = createParserForwardedToRef;
