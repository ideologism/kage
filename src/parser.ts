import { consume, initInput, Input } from "./input";
import { Failure, Result, Success } from "./result";
import { initOptional, isSome, None, Optional, Some, Tuple } from "./types";

type ParserFn<T> = (input: Input) => Result<T>;
type Char = string;

export class Parser<T> {
  public static of<T>(parserFn: ParserFn<T>, label: string = "") {
    return new Parser(parserFn, label);
  }
  public static return<T>(origin: T) {
    return Parser.of((input: Input) =>
      Result.of({ value: origin, newInput: input })
    );
  }
  public static parseString(str: string) {
    return Parser.sequence(str.split("").map(char => pChar(char))).map(x =>
      x.join("")
    );
  }
  public static satisfy(
    predicate: (x: string) => boolean,
    label: string = ""
  ): Parser<string> {
    return Parser.of((input: Input) => {
      const { newInput, value } = consume(input);
      const char = value;
      if (!isSome(char)) {
        return Result.of({
          error: "No More Input",
          position: input.position,
          tag: label
        }) as Failure<string>;
      } else {
        if (predicate(char.value)) {
          return Result.of({ value: char.value, newInput });
        }
        return Result.of({
          error: char.value,
          position: input.position,
          tag: label
        }) as Failure<string>;
      }
    }, label);
  }
  public static anyOf(chars: string[]): Parser<string> {
    return Parser.choice(chars.map(char => Parser.parseString(char)));
  }
  public static choice(parsers: Array<Parser<any>>): Parser<any>;
  public static choice<T>(parsers: Array<Parser<T>>): Parser<T>;
  public static choice(parsers: Array<Parser<any>>): Parser<any> {
    return parsers.reduce((acc: Parser<any>, cur: Parser<any>) => {
      return acc.or(cur);
    });
  }
  public static lift2<T, S, U>(f: (t: T) => (s: S) => U) {
    return (parserT: Parser<T>) => {
      return (parserS: Parser<S>) => {
        return parserS.apply(parserT.apply(Parser.return(f)));
      };
    };
  }
  public static sequence<T>(parserList: Array<Parser<T>>): Parser<T[]> {
    if (parserList.length === 0) {
      return Parser.return([] as T[]);
    }
    function cons(first: T) {
      return (rest: T[]) => {
        return [first, ...rest];
      };
    }
    const consL = Parser.lift2(cons);
    const [firstL, ...restL] = parserList;
    return consL(firstL)(Parser.sequence(restL));
  }
  public static scanZeroOrMore<T>(parser: Parser<T>) {
    return (input: Input): Success<T[]> => {
      return parser.execute(input).cata({
        failure: _ => Result.of({ value: [], newInput: input }) as Success<T[]>,
        success: ({ value, newInput }) => {
          return Parser.scanZeroOrMore(parser)(newInput).success(
            ({ value: nextValue, newInput: nextNewInput }) => {
              return Result.of({
                newInput: nextNewInput,
                value: [value, ...nextValue]
              }) as Success<T[]>;
            }
          );
        }
      });
    };
  }
  public static startWith<T, S>(parserStart: Parser<T>, parserRest: Parser<S>) {
    return parserStart.then(parserRest).map(([_, rest]: [T, S]) => rest);
  }
  private ParserFn: ParserFn<T>;
  private label: string;
  constructor(parserFn: ParserFn<T>, label: string = "") {
    this.ParserFn = parserFn;
    this.label = label;
  }
  public setLabel(label: string) {
    this.label = label;
    return this;
  }
  // execute Parser
  public execute(input: Input): Result<T> {
    const result = this.ParserFn(input);
    if (result.isSuccess()) {
      return result;
    }
    return Result.of({
      ...result.value,
      tag: this.label || (result as Failure<T>).value.tag
    });
  }
  // Helper function
  public bind<S>(f: (x: T) => Parser<S>): Parser<S> {
    return Parser.of((input: Input) => {
      return this.execute(input).cata({
        failure: result => Result.of(result),
        success: ({ value, newInput }) => {
          return f(value).execute(newInput);
        }
      });
    }, this.label);
  }
  public map<S>(transform: (arg: T) => S): Parser<S> {
    return this.bind((t: T) => Parser.return(transform(t)));
  }
  public apply<S>(parser: Parser<(t: T) => S>): Parser<S> {
    return parser.bind((transform: (t: T) => S) =>
      this.bind((x: T) => Parser.return(transform(x)))
    );
  }
  //
  public then<S>(parser: Parser<S>): Parser<Tuple<T, S>> {
    return this.bind((t: T) =>
      parser.bind((s: S) => Parser.return([t, s] as Tuple<T, S>))
    );
  }
  public or<S>(parser: Parser<S>): Parser<T | S> {
    const parserFn = ((input: Input) => {
      return this.execute(input).cata({
        failure: _ => {
          return parser.execute(input).cata({
            failure: result => Result.of(result),
            success: result => Result.of(result)
          });
        },
        success: result => Result.of(result)
      });
    }) as ParserFn<T | S>;
    return Parser.of(parserFn);
  }
  public many(): Parser<T[]> {
    return Parser.of((input: Input) => {
      return Parser.scanZeroOrMore(this)(input);
    });
  }
  public many1(): Parser<T[]> {
    return this.bind((first: T) =>
      this.many().bind((rest: T[]) => Parser.return([first, ...rest]))
    );
  }
  public optional(): Parser<Optional<T>> {
    const optionalNone = Parser.return(initOptional() as Optional<T>);
    const optionalSome = this.map(initOptional);
    return optionalSome.or(optionalNone);
  }
  public endWith<S>(parserEnd: Parser<S>): Parser<T> {
    return this.then(parserEnd).map(([first, _]) => first);
  }
  public between<S, U>(left: Parser<S>, right: Parser<U>) {
    return Parser.startWith(left, this.endWith(right));
  }
  public sepBy1<S>(sep: Parser<S>): Parser<T[]> {
    return this.then(Parser.startWith(sep, this).many()).map(
      ([first, second]) => [first, ...second]
    );
  }
  public sepBy<S>(sep: Parser<S>): Parser<T[]> {
    return this.sepBy1(sep).or(Parser.return([] as T[]));
  }
  public repeat(times: number): Parser<T[]> {
    return Parser.sequence(Array(times).fill(this));
  }
}

function pChar(char: Char): Parser<Char> {
  const predicate = (str: string) => !!str && char === str;
  return Parser.satisfy(predicate, char);
}
