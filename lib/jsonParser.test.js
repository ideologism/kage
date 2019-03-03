"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var input_1 = require("./input");
var jsonParser_1 = require("./jsonParser");
var result_1 = require("./result");
function parseResult(result) {
    return result_1.isSuccessValue(result.value) ? result.value.value : result.value;
}
exports.parseResult = parseResult;
function runParser(parser, str) {
    return parseResult(parser.execute(input_1.initInput(str)));
}
test("parse jsonNull", function () {
    expect(runParser(jsonParser_1.jsonNull, "null")).toBe(null);
    expect(runParser(jsonParser_1.jsonNull, "nulp")).toEqual({
        error: "p",
        position: { line: 0, column: 3 },
        tag: "null"
    });
});
test("parse jsonBool", function () {
    expect(runParser(jsonParser_1.jsonBool, "true")).toBe(true);
    expect(runParser(jsonParser_1.jsonBool, "false")).toBe(false);
});
test("parse unescapedChar", function () {
    expect(runParser(jsonParser_1.unescapedChar, "a")).toEqual("a");
    expect(runParser(jsonParser_1.unescapedChar, "\\")).toEqual({
        error: "\\",
        position: { column: 0, line: 0 },
        tag: "char"
    });
});
test("parse escapedChar", function () {
    expect(runParser(jsonParser_1.escapedChar, "\\n")).toEqual("\n");
});
test("parse jsonString", function () {
    expect(runParser(jsonParser_1.jsonString, '"12345lkjlkjk"')).toEqual("12345lkjlkjk");
});
test("parse jsonNumber", function () {
    expect(runParser(jsonParser_1.jsonNumber, "1234")).toEqual(1234);
    expect(runParser(jsonParser_1.jsonNumber, "1234.12")).toEqual(1234.12);
    expect(runParser(jsonParser_1.jsonNumber, "0.12")).toEqual(0.12);
    // expect(runParser(jsonNumber, "0.")).toEqual({
    //   error: ".",
    //   position: { column: 1, line: 0 },
    //   tag: " "
    // });
    // expect(runParser(jsonNumber, "01.12")).toEqual({
    //   error: "1",
    //   position: { column: 1, line: 0 },
    //   tag: " "
    // });
    expect(runParser(jsonParser_1.jsonNumber, "0.12e+2")).toEqual(12);
});
test("parse jsonArray", function () {
    expect(runParser(jsonParser_1.jsonArray, "[[],[],1,2,3]")).toEqual([[], [], 1, 2, 3]);
});
