import { initInput } from "./input";
import {
  escapedChar,
  jsonBool,
  jsonNull,
  jsonString,
  unescapedChar,
  jsonNumber,
  jsonArray
} from "./jsonParser";
import { Lexer, pString } from "./lexer";
import { isResultSuccess, ResultEnum } from "./result";

export function parseResult<T>(result: ResultEnum<T>) {
  if (isResultSuccess(result)) {
    const { value, remaining } = result;
    return value;
  } else {
    const { error, tag, position } = result;
    return { error, tag, position };
  }
}
function runLexer<T>(lexer: Lexer<T>, str: string) {
  return parseResult(lexer.execute(initInput(str)));
}
test("parse jsonNull", () => {
  expect(runLexer(jsonNull, "null")).toBe(null);
  expect(runLexer(jsonNull, "nulp")).toEqual({
    error: "p",
    position: { line: 0, column: 3 },
    tag: "null"
  });
});

test("parse jsonBool", () => {
  expect(runLexer(jsonBool, "true")).toBe(true);
  expect(runLexer(jsonBool, "false")).toBe(false);
});

test("parse unescapedChar", () => {
  expect(runLexer(unescapedChar, "a")).toEqual("a");
  expect(runLexer(unescapedChar, "\\")).toEqual({
    error: "\\",
    position: { column: 0, line: 0 },
    tag: "char"
  });
});

test("parse escapedChar", () => {
  expect(runLexer(escapedChar, "\\n")).toEqual("\n");
});
test("parse jsonString", () => {
  expect(runLexer(jsonString, '"12345lkjlkjk"')).toEqual("12345lkjlkjk");
});
test("parse jsonNumber", () => {
  expect(runLexer(jsonNumber, "1234")).toEqual(1234);
  expect(runLexer(jsonNumber, "1234.12")).toEqual(1234.12);
  expect(runLexer(jsonNumber, "0.12")).toEqual(0.12);
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
  expect(runLexer(jsonNumber, "0.12e+2")).toEqual(12);
});
test("parse jsonArray", () => {
  expect(runLexer(jsonArray, '[[],[],1,2,3]')).toEqual([[],[],1,2,3]);
});
