"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var input_1 = require("./input");
var jsonParser_1 = require("./jsonParser");
var result_1 = require("./result");
function parseResult(result) {
    if (result_1.isResultSuccess(result)) {
        var value = result.value, remaining = result.remaining;
        return value;
    }
    else {
        var error = result.error, tag = result.tag, position = result.position;
        return { error: error, tag: tag, position: position };
    }
}
exports.parseResult = parseResult;
function runLexer(lexer, str) {
    return parseResult(lexer.execute(input_1.initInput(str)));
}
test("parse jsonNull", function () {
    expect(runLexer(jsonParser_1.jsonNull, "null")).toBe(null);
    expect(runLexer(jsonParser_1.jsonNull, "nulp")).toEqual({
        error: "p",
        position: { line: 0, column: 3 },
        tag: "null"
    });
});
test("parse jsonBool", function () {
    expect(runLexer(jsonParser_1.jsonBool, "true")).toBe(true);
    expect(runLexer(jsonParser_1.jsonBool, "false")).toBe(false);
});
test("parse unescapedChar", function () {
    expect(runLexer(jsonParser_1.unescapedChar, "a")).toEqual("a");
    expect(runLexer(jsonParser_1.unescapedChar, "\\")).toEqual({
        error: "\\",
        position: { column: 0, line: 0 },
        tag: "char"
    });
});
test("parse escapedChar", function () {
    expect(runLexer(jsonParser_1.escapedChar, "\\n")).toEqual("\n");
});
test("parse jsonString", function () {
    expect(runLexer(jsonParser_1.jsonString, '"12345lkjlkjk"')).toEqual("12345lkjlkjk");
});
test("parse jsonNumber", function () {
    expect(runLexer(jsonParser_1.jsonNumber, "1234")).toEqual(1234);
    expect(runLexer(jsonParser_1.jsonNumber, "1234.12")).toEqual(1234.12);
    expect(runLexer(jsonParser_1.jsonNumber, "0.12")).toEqual(0.12);
    // expect(runLexer(jsonNumber, "0.")).toEqual({
    //   error: ".",
    //   position: { column: 1, line: 0 },
    //   tag: " "
    // });
    // expect(runLexer(jsonNumber, "01.12")).toEqual({
    //   error: "1",
    //   position: { column: 1, line: 0 },
    //   tag: " "
    // });
    expect(runLexer(jsonParser_1.jsonNumber, "0.12e+2")).toEqual(12);
});
test("parse jsonArray", function () {
    expect(runLexer(jsonParser_1.jsonArray, '["a","b","c"]')).toEqual(['a', 'b', 'c']);
});
