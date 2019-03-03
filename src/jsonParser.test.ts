import { initInput } from "./input";
import {
  escapedChar,
  jsonArray,
  jsonBool,
  jsonNull,
  jsonNumber,
  jsonString,
  unescapedChar
} from "./jsonParser";
import { Parser } from "./parser";
import { isSuccessValue, Result } from "./result";

export function parseResult<T>(result: Result<T>) {
  return isSuccessValue(result.value) ? result.value.value : result.value;
}
function runParser<T>(parser: Parser<T>, str: string) {
  return parseResult(parser.execute(initInput(str)));
}
test("parse jsonNull", () => {
  expect(runParser(jsonNull, "null")).toBe(null);
  expect(runParser(jsonNull, "nulp")).toEqual({
    error: "p",
    position: { line: 0, column: 3 },
    tag: "null"
  });
});

test("parse jsonBool", () => {
  expect(runParser(jsonBool, "true")).toBe(true);
  expect(runParser(jsonBool, "false")).toBe(false);
});

test("parse unescapedChar", () => {
  expect(runParser(unescapedChar, "a")).toEqual("a");
  expect(runParser(unescapedChar, "\\")).toEqual({
    error: "\\",
    position: { column: 0, line: 0 },
    tag: "char"
  });
});

test("parse escapedChar", () => {
  expect(runParser(escapedChar, "\\n")).toEqual("\n");
});
test("parse jsonString", () => {
  expect(runParser(jsonString, '"12345lkjlkjk"')).toEqual("12345lkjlkjk");
});
test("parse jsonNumber", () => {
  expect(runParser(jsonNumber, "1234")).toEqual(1234);
  expect(runParser(jsonNumber, "1234.12")).toEqual(1234.12);
  expect(runParser(jsonNumber, "0.12")).toEqual(0.12);
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
  expect(runParser(jsonNumber, "0.12e+2")).toEqual(12);
});
test("parse jsonArray", () => {
  expect(runParser(jsonArray, "[[],[],1,2,3]")).toEqual([[], [], 1, 2, 3]);
});
