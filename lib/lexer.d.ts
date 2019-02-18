import { Input } from "./input";
import { Result, Success } from "./result";
import { Optional, Tuple } from "./types";
declare type LexerFn<T> = (input: Input) => Result<T>;
export declare class Lexer<T> {
    static of<T>(lexerFn: LexerFn<T>, label?: string): Lexer<T>;
    static return<T>(origin: T): Lexer<T>;
    static anyOf(chars: string[]): Lexer<string>;
    static choice(parsers: Array<Lexer<any>>): Lexer<any>;
    static lift2<T, S, U>(f: (t: T) => (s: S) => U): (lexerT: Lexer<T>) => (lexerS: Lexer<S>) => Lexer<U>;
    static sequence<T>(lexerList: Array<Lexer<T>>): Lexer<T[]>;
    static scanZeroOrMore<T>(lexer: Lexer<T>): (input: Input) => Success<T[]>;
    static startWith<T, S>(lexerStart: Lexer<T>, lexerRest: Lexer<S>): Lexer<S>;
    ref?: {
        parser: Lexer<any>;
    };
    private lexerFn;
    private label;
    constructor(lexerFn: LexerFn<T>, label?: string);
    setLabel(label: string): this;
    execute(input: Input): Result<T>;
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
export declare function satisfy(predicate: (x: string) => boolean, label?: string): Lexer<string>;
export declare function pString(str: string): Lexer<string>;
export {};
