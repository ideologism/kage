import { initInput } from "./input";
import { Lexer, pString, satisfy } from "./lexer";
import { isSome } from "./types";
import { printResult, initResult } from "./result";

export const jsonNull = pString("null")
  .map(_ => null)
  .setLabel("null");
export const jsonBool = pString("true")
  .or(pString("false"))
  .map(x => (x === "true" ? true : false));
export const unescapedChar = satisfy(x => x !== "\\" && x !== '"', "char");
export const escapedChar = Lexer.choice(
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
  ].map(([x, y]) => pString(x).map(_ => y))
).setLabel("escaped char");
// TODO: support unicode string
const quotation = pString('"');
export const jsonString = unescapedChar
  .or(escapedChar)
  .many()
  .between(quotation, quotation)
  .map(x => x.join(""));

const scanMinusSign = pString("-");
const scanMinusOrPlusSign = Lexer.anyOf(["-", "+"]);
const scanZero = pString("0");
const scanOneToNine = Lexer.anyOf(
  Array(9)
    .fill(0)
    .map((n, i) => i + 1 + "")
).setLabel("digit");
const scanDigits = scanZero.or(scanOneToNine);
const scanPoint = pString(".");
const scanSpace = pString(" ");
const scanE = Lexer.anyOf(["e", "E"]);
// [[[minusSign: Optional<string>, integerPart: string | [string, string[]]], decimalPart: Optional<[string, string[]]>], exponentPart: Optional<[[string, string], string]>]
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

const leftBracket = pString("[").then(scanSpace.many());
const rightBracket = pString("]").then(scanSpace.many());
const comma = pString(",").then(scanSpace.many());
const {
  lexer: jsonValueLexer,
  ref: jsonValueRef
} = createLexerForwardedToRef();
const jsonValue: Lexer<any> = jsonValueLexer
  .then(scanSpace.many())
  .map(([value, _]) => {
    return value;
  });
export const jsonArray = Lexer.startWith(leftBracket, jsonValue.sepBy(comma))
  .endWith(rightBracket)
  .setLabel("Array");

const leftBrace = pString("{");
const rightBrace = pString("}");
const colon = pString(":");
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
// helper
function createLexerForwardedToRef<T>() {
  const dummyLexer: Lexer<T> = Lexer.of(_ => {
    throw new Error("unfixed forwarded lexer");
  }, "unknown");
  const LexerRef = { lexer: dummyLexer };
  const wrapperLexer = Lexer.of(input => LexerRef.lexer.execute(input));
  return { lexer: wrapperLexer, ref: LexerRef };
}
jsonValueRef.lexer = Lexer.choice([
  jsonNull,
  jsonBool,
  jsonNumber,
  jsonString,
  jsonArray,
  jsonObject
]);

const example1 = '{"widget":{"debug":"on","window":{"title":"SampleKonfabulatorWidget","name":"main_window","width":500,"height":500},"image":{"src":"Images/Sun.png","name":"sun1","hOffset":250,"vOffset":250,"alignment":"center"},"text":{"data":"ClickHere","size":36,"style":"bold","name":"text1","hOffset":250,"vOffset":100,"alignment":"center","onMouseUp":"sun1.opacity=(sun1.opacity/100)*90;"}}}'

printResult(jsonObject.execute(initInput(example1)));
