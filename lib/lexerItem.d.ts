declare type Result<T> = Success<T> | Failure;
declare type Parser<T> = (str: string) => Result<T>;
declare type Tuple<L, R> = [L, R];
interface Success<T> {
    value: T;
    remaining: string;
}
interface Failure {
    message: string;
}
export declare class Lexer<T> {
    static of<T>(parser: Parser<T>): Lexer<T>;
    static return<T>(origin: T): Lexer<T>;
    private parser;
    constructor(parser: Parser<T>);
    bind<S>(f: (x: T) => Parser<S>): Parser<S>;
    map<S>(transform: (arg: T) => S): Parser<S>;
    apply<S, U>(parser: Parser<S>): Parser<U>;
    then<S>(parserB: Parser<S>): Parser<Tuple<T, S>>;
    or<S>(parserB: Parser<S>): Parser<T | S>;
}
export {};
