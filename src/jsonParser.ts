import { createParserForwardedToRef } from "./helper";
import { initInput } from "./input";
import { Parser } from "./parser";
import { isSome } from "./types";

export const jsonNull = Parser.parseString("null")
  .map(_ => null)
  .setLabel("null");
export const jsonBool = Parser.parseString("true")
  .or(Parser.parseString("false"))
  .map(x => (x === "true" ? true : false));
export const unescapedChar = Parser.satisfy(
  x => x !== "\\" && x !== '"',
  "char"
);
export const escapedChar = Parser.choice(
  [
    // (stringToMatch, resultChar)
    ['\\"', '"'], // quote
    ["\\\\", "\\"], // reverse solidus
    ["\\/", "/"], // solidus
    ["\\b", "\b"], // backspace
    ["\\f", "\f"], // formfeed
    ["\\n", "\n"], // newline
    ["\\r", "\r"], // cr
    ["\\t", "\t"] // tab
  ].map(([x, y]) => Parser.parseString(x).map(_ => y))
).setLabel("escaped char");
// TODO: support unicode string
const quotation = Parser.parseString('"');
export const jsonString = unescapedChar
  .or(escapedChar)
  .many()
  .between(quotation, quotation)
  .map(x => x.join(""));

const scanMinusSign = Parser.parseString("-");
const scanMinusOrPlusSign = Parser.anyOf(["-", "+"]);
const scanZero = Parser.parseString("0");
const scanOneToNine = Parser.anyOf(
  Array(9)
    .fill(0)
    .map((n, i) => i + 1 + "")
).setLabel("digit");
const scanDigits = scanZero.or(scanOneToNine);
const scanPoint = Parser.parseString(".");
const scanSpace = Parser.parseString(" ");
const scanE = Parser.anyOf(["e", "E"]);
export const jsonNumber = scanMinusSign
  .optional()
  .then(scanOneToNine.then(scanDigits.many()).or(scanZero))
  .then(scanPoint.then(scanDigits.many1()).optional())
  .then(
    scanE
      .then(scanMinusOrPlusSign)
      .then(scanDigits)
      .optional()
  )
  .map(([[[minusSign, integerPart], decimalPart], exponentPart]) => {
    const intergerValue =
      typeof integerPart === "string"
        ? 0
        : integerPart[0] + integerPart[1].join("");
    const decimalValue = isSome(decimalPart)
      ? decimalPart.value[0] + decimalPart.value[1].join("")
      : "";
    const exponentValue = isSome(exponentPart)
      ? exponentPart.value[0].join("") + exponentPart.value[1]
      : "";
    const value = Number(intergerValue + decimalValue + exponentValue);
    return isSome(minusSign) ? -value : value;
  });

const leftBracket = Parser.parseString("[").then(scanSpace.many());
const rightBracket = Parser.parseString("]").then(scanSpace.many());
const comma = Parser.parseString(",").then(scanSpace.many());
const {
  parser: jsonValueParser,
  ref: jsonValueRef
} = createParserForwardedToRef();
const jsonValue: Parser<any> = jsonValueParser
  .then(scanSpace.many())
  .map(([value, _]) => {
    return value;
  });
export const jsonArray = Parser.startWith(leftBracket, jsonValue.sepBy(comma))
  .endWith(rightBracket)
  .setLabel("Array");

const leftBrace = Parser.parseString("{");
const rightBrace = Parser.parseString("}");
const colon = Parser.parseString(":");
const key = jsonString;
const value = jsonValue;
const keyValue = key.endWith(colon).then(value);
const keyValues = keyValue.sepBy(comma);
const jsonObject = keyValues.between(leftBrace, rightBrace).map(x =>
  x.reduce((cur: any, [key, value]) => {
    cur[key] = value;
    return cur;
  }, {})
);
jsonValueRef.parser = Parser.choice([
  jsonNull,
  jsonBool,
  jsonNumber,
  jsonString,
  jsonArray,
  jsonObject
]);

const example1 =
  '{"widget":{"debug":"on","window":{"title":"SampleKonfabulatorWidget","name":"main_window","width":500,"height":500},"image":{"src":"Images/Sun.png","name":"sun1","hOffset":250,"vOffset":250,"alignment":"center"},"text":{"data":"ClickHere","size":36,"style":"bold","name":"text1","hOffset":250,"vOffset":100,"alignment":"center","onMouseUp":"sun1.opacity=(sun1.opacity/100)*90;"}}}';

jsonObject.execute(initInput(example1));
