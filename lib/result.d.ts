export declare type Result<T> = Success<T> | Failure<T>;
export declare type ResultEnum<T> = ResultSuccess<T> | ResultFailure;
export interface ResultSuccess<T> {
    value: T;
    remaining: string;
}
export interface ResultFailure {
    title: string;
    message: string;
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
export {};
