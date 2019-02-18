declare type Char = string;
declare type Optional<T> = Some<T> | None;
declare type Result<T> = Success<T> | Failure;
declare type Parser<T> = (str: string) => Result<T>;
declare type Tuple<L, R> = [L, R];
interface RecTuple<T> extends Tuple<T | RecTuple<T>, T> {
}
interface Success<T> {
    value: T;
    remaining: string;
}
interface Failure {
    message: string;
}
interface Some<T> {
    value: T;
}
declare type None = "None";
declare function isSuccess<T>(result: Result<T>): result is Success<T>;
declare function isSome<T>(optional: Optional<T>): optional is Some<T>;
declare function initOptional<T>(t?: T): Optional<T>;
declare function pChar(char: Char): Parser<Char>;
declare function then<T, S>(parserA: Parser<T>, parserB: Parser<S>): Parser<Tuple<T, S>>;
declare function or<T, S>(parserA: Parser<T>, parserB: Parser<S>): Parser<T | S>;
declare function choice<T>(parsers: Array<Parser<T>>): Parser<T>;
declare function anyOf(chars: string[]): Parser<string>;
declare function mapP<T, S>(transform: (arg: T) => S): (p: Parser<T>) => Parser<S>;
declare function returnP<T>(origin: T): Parser<T>;
declare function apply<T, S>(parserF: Parser<(t: T) => S>): (parserT: Parser<T>) => Parser<S>;
declare function lift2<T, S, U>(f: (t: T) => (s: S) => U): (parserT: Parser<T>) => (parserS: Parser<S>) => Parser<U>;
declare function sequence<T>(parserList: Array<Parser<T>>): Parser<T[]>;
declare function pString(str: string): Parser<string>;
declare function pStringOld(str: string): Parser<RecTuple<string>>;
declare function parseZeroOrMore<T>(parser: Parser<T>): (str: string) => Success<T[]>;
declare function many<T>(parser: Parser<T>): Parser<T[]>;
declare function many1<T>(parser: Parser<T>): Parser<T[]>;
declare function opt<T>(parser: Parser<T>): Parser<Optional<T>>;
declare function pInt(str: string): Result<number>;
declare function startWith<T, S>(parserFirst: Parser<T>, parserSecond: Parser<S>): Parser<S>;
declare function endWith<T, S>(parserFirst: Parser<T>, parserSecond: Parser<S>): Parser<T>;
declare function between<T, S, U>(parser: Parser<T>): (left: Parser<S>, right: Parser<U>) => Parser<T>;
declare function sepBy1<T, S>(parser: Parser<T>, sep: Parser<S>): Parser<T[]>;
declare function sepBy<T, S>(parser: Parser<T>, sep: Parser<S>): Parser<never[] | T[]>;
declare function bindP<T, S>(f: (x: T) => Parser<S>): (parser: Parser<T>) => Parser<S>;
