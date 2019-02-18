import { consume, initInput, Input } from "./input";
import {
  Failure,
  initResult,
  isSuccess,
  printResult,
  Result,
  Success
} from "./result";
import { initOptional, isSome, None, Optional, Some, Tuple } from "./types";
type LexerFn<T> = (input: Input) => Result<T>;
type Char = string;
export class Lexer<T> {
  public static of<T>(lexerFn: LexerFn<T>, label: string = "") {
    return new Lexer(lexerFn, label);
  }
  public static return<T>(origin: T) {
    return Lexer.of((input: Input) =>
      initResult({ value: origin, remaining: input })
    );
  }
  public static anyOf(chars: string[]): Lexer<string> {
    return Lexer.choice(chars.map(char => pChar(char)));
  }
  public static choice(parsers: Array<Lexer<any>>): Lexer<any> {
    return parsers.reduce((acc: Lexer<any>, cur: Lexer<any>) => {
      return acc.or(cur);
    });
  }
  public static lift2<T, S, U>(f: (t: T) => (s: S) => U) {
    return (lexerT: Lexer<T>) => {
      return (lexerS: Lexer<S>) => {
        return lexerS.apply(lexerT.apply(Lexer.return(f)));
      };
    };
  }
  public static sequence<T>(lexerList: Array<Lexer<T>>): Lexer<T[]> {
    if (lexerList.length === 0) {
      return Lexer.return([] as T[]);
    }
    function cons(first: T) {
      return (rest: T[]) => {
        return [first, ...rest];
      };
    }
    const consL = Lexer.lift2(cons);
    const [firstL, ...restL] = lexerList;
    return consL(firstL)(Lexer.sequence(restL));
  }
  public static scanZeroOrMore<T>(lexer: Lexer<T>) {
    return (input: Input): Success<T[]> => {
      const result = lexer.execute(input).handle({
        failure: _ => initResult({ value: [], remaining: input }),
        success: ({ value, remaining }) => {
          return Lexer.scanZeroOrMore(lexer)(remaining).success(
            ({ value: sequenceValue, remaining: sequenceRemaining }) => {
              return initResult({
                remaining: sequenceRemaining,
                value: [value, ...sequenceValue]
              }) as Success<T[]>;
            }
          );
        }
      });
      return result;
    };
  }
  public static startWith<T, S>(lexerStart: Lexer<T>, lexerRest: Lexer<S>) {
    return lexerStart.then(lexerRest).map(([_, rest]: [T, S]) => rest);
  }
  public ref?: { parser: Lexer<any> };
  private lexerFn: LexerFn<T>;
  private label: string;
  constructor(lexerFn: LexerFn<T>, label: string = "") {
    this.lexerFn = lexerFn;
    this.label = label;
  }
  public setLabel(label: string) {
    this.label = label;
    return this;
  }
  // execute lexer
  public execute(input: Input): Result<T> {
    const result = this.lexerFn(input);
    if (isSuccess(result)) {
      return result;
    }
    return { ...result, tag: this.label || result.tag };
  }
  // Helper function
  public bind<S>(f: (x: T) => Lexer<S>): Lexer<S> {
    return Lexer.of((input: Input) => {
      return this.execute(input).handle({
        failure: result => initResult(result),
        success: ({ value, remaining }) => {
          return f(value).execute(remaining);
        }
      });
    }, this.label);
  }
  public map<S>(transform: (arg: T) => S): Lexer<S> {
    return this.bind((t: T) => Lexer.return(transform(t)));
  }
  public apply<S>(lexer: Lexer<(t: T) => S>): Lexer<S> {
    return lexer.bind((transform: (t: T) => S) =>
      this.bind((x: T) => Lexer.return(transform(x)))
    );
  }
  //
  public then<S>(lexer: Lexer<S>): Lexer<Tuple<T, S>> {
    return this.bind((t: T) =>
      lexer.bind((s: S) => Lexer.return([t, s] as Tuple<T, S>))
    );
  }
  public or<S>(lexer: Lexer<S>): Lexer<T | S> {
    const lexerFn = ((input: Input) => {
      return this.execute(input).handle({
        failure: () => {
          return lexer.execute(input).handle({
            failure: result => initResult(result),
            success: result => initResult(result)
          });
        },
        success: result => initResult(result)
      });
    }) as LexerFn<T | S>;
    return Lexer.of(lexerFn);
  }
  public many(): Lexer<T[]> {
    return Lexer.of((input: Input) => {
      return Lexer.scanZeroOrMore(this)(input);
    });
  }
  public many1(): Lexer<T[]> {
    return this.bind((first: T) =>
      this.many().bind((rest: T[]) => Lexer.return([first, ...rest]))
    );
  }
  public optional(): Lexer<Optional<T>> {
    const optionalNone = Lexer.return(initOptional() as Optional<T>);
    const optionalSome = this.map(initOptional);
    return optionalSome.or(optionalNone);
  }
  public endWith<S>(lexerEnd: Lexer<S>): Lexer<T> {
    return this.then(lexerEnd).map(([first, _]) => first);
  }
  public between<S, U>(left: Lexer<S>, right: Lexer<U>) {
    return Lexer.startWith(left, this.endWith(right));
  }
  public sepBy1<S>(sep: Lexer<S>): Lexer<T[]> {
    return this.then(Lexer.startWith(sep, this).many()).map(
      ([first, second]) => [first, ...second]
    );
  }
  public sepBy<S>(sep: Lexer<S>): Lexer<T[]> {
    return this.sepBy1(sep).or(Lexer.return([] as T[]));
  }
}

export function satisfy(
  predicate: (x: string) => boolean,
  label: string = ""
): Lexer<string> {
  return Lexer.of((input: Input) => {
    const { newInput, value } = consume(input);
    const char = value;
    if (!isSome(char)) {
      return initResult({
        error: "No More Input",
        position: input.position,
        tag: label
      }) as Failure<string>;
    } else {
      if (predicate(char.value)) {
        return initResult({ value: char.value, remaining: newInput });
      }
      return initResult({
        error: char.value,
        position: input.position,
        tag: label
      }) as Failure<string>;
    }
  }, label);
}

function pChar(char: Char): Lexer<Char> {
  const predicate = (str: string) => !!str && char === str;
  return satisfy(predicate, char);
}

function pInt(str: string) {
  const input = initInput(str);
  const digitScanner = Lexer.anyOf(
    Array(10)
      .fill(0)
      .map((n, i) => i + "")
  ).setLabel("digit");
  const digitsScanner = pChar("-")
    .optional()
    .then(digitScanner.many1())
    .setLabel("digits");
  const mapMinus = (x: [Optional<string>, string[]]) => {
    const hasMinus = x[0];
    const value = Number(x[1].join(""));
    return isSome(hasMinus) ? -value : value;
  };
  return digitsScanner.map(mapMinus).execute(input);
}

export function pString(str: string): Lexer<string> {
  return Lexer.sequence(str.split("").map(char => pChar(char))).map(x =>
    x.join("")
  );
}
