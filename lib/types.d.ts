import { Result, Success } from "./result";
declare type LexerFn<T> = (str: string) => Result<T>;
declare type Optional<T> = Some<T> | None;
declare type Tuple<L, R> = [L, R];
interface Some<T> {
    value: T;
}
declare type None = "None";
export declare function initOptional<T>(t?: T): Optional<T>;
export declare class Lexer<T> {
    static of<T>(lexerFn: LexerFn<T>, label?: string): Lexer<T>;
    static return<T>(origin: T): Lexer<T>;
    static choice<T>(parsers: Array<Lexer<T>>): Lexer<T>;
    static lift2<T, S, U>(f: (t: T) => (s: S) => U): (lexerT: Lexer<T>) => (lexerS: Lexer<S>) => Lexer<U>;
    static sequence<T>(lexerList: Array<Lexer<T>>): Lexer<T[]>;
    static scanZeroOrMore<T>(lexer: Lexer<T>): (str: string) => Success<T[]>;
    static startWith<T, S>(lexerStart: Lexer<T>, lexerRest: Lexer<S>): Lexer<S>;
    private lexerFn;
    private label;
    constructor(lexerFn: LexerFn<T>, label?: string);
    execute(input: string): Result<T>;
    bind<S>(f: (x: T) => Lexer<S>): Lexer<S>;
    map<S>(transform: (arg: T) => S): Lexer<S>;
    apply<S>(lexer: Lexer<(t: T) => S>): Lexer<S>;
    then<S>(lexer: Lexer<S>): Lexer<Tuple<T, S>>;
    or<S>(lexer: Lexer<S>): Lexer<T | S>;
    many(): Lexer<T[]>;
    many1(): Lexer<T[]>;
    optional(): Lexer<Optional<T>>;
    endWith<S>(lexerEnd: Lexer<S>): Lexer<T>;
    between<S, U>(left: Lexer<S>, right: Lexer<U>): Lexer<T>;
    sepBy1<S>(sep: Lexer<S>): Lexer<T[]>;
    sepBy<S>(sep: Lexer<S>): Lexer<T[]>;
}
export {};
