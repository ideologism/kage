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
const {parser, ref} = createParserForwardedToRef()
const jsonValue = parser
  .then(scanSpace.many())
  .map(([value, _]) => {
    return value;
  });
export const jsonArray: Lexer<any[]> = Lexer.startWith(
  leftBracket,
  jsonValue.sepBy(comma)
)
  .endWith(rightBracket)
  .setLabel("Array");
  // helper
function createParserForwardedToRef<T>() {
  const dummyParser: Lexer<T> = Lexer.of(_ => {
    throw new Error("unfixed forwarded parser");
  }, "unknown");
  const parserRef = { parser: dummyParser };
  const wrapperParser = Lexer.of(input => parserRef.parser.execute(input));
  return {parser: wrapperParser, ref: parserRef};
}
ref.parser = Lexer.choice([jsonNull, jsonBool, jsonNumber, jsonString, jsonArray]);
printResult(jsonArray.execute(initInput('[[],[],1,2,3]')))
