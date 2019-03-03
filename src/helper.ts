import { Parser } from "./parser";
export function createParserForwardedToRef<T>() {
  const dummyParser: Parser<T> = Parser.of(_ => {
    throw new Error("unfixed forwarded Parser");
  }, "unknown");
  const ParserRef = { parser: dummyParser };
  const wrapperParser = Parser.of(input => ParserRef.parser.execute(input));
  return { parser: wrapperParser, ref: ParserRef };
}
