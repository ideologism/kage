import { Input, IPosition } from "./input";
export declare type Result<T> = Success<T> | Failure<T>;
export declare type ResultEnum<T> = ResultSuccess<T> | ResultFailure;
export declare function isSuccess<T>(result: Result<T>): result is Success<T>;
export declare function isResultSuccess<T>(result: ResultEnum<T>): result is ResultSuccess<T>;
export interface ResultSuccess<T> {
    value: T;
    remaining: Input;
}
export interface ResultFailure {
    tag: string;
    error: string;
    position: IPosition;
}
export interface Success<T> extends SuccessStatic<T>, ResultSuccess<T> {
    handle: ResultCallback<T>;
}
export interface Failure<T> extends FailureStatic, ResultFailure {
    handle: ResultCallback<T>;
}
interface SuccessStatic<T> {
    success: (x: SuccessCallback<T>) => any;
}
interface FailureStatic {
    failure: (x: FailureCallback) => any;
}
export interface ResultHandler<T> {
    success: SuccessCallback<T>;
    failure: FailureCallback;
}
export declare type ResultCallback<T> = (x: ResultHandler<T>) => any;
export declare type SuccessCallback<T> = (x: ResultSuccess<T>) => any;
export declare type FailureCallback = (x: ResultFailure) => any;
export declare function initResult<T>(result: ResultEnum<T>): Result<T>;
export declare function printResult<T>(result: ResultEnum<T>): void;
export {};
