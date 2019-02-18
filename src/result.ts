import { Input, IPosition } from "./input";
export type Result<T> = Success<T> | Failure<T>;
export type ResultEnum<T> = ResultSuccess<T> | ResultFailure;
export function isSuccess<T>(result: Result<T>): result is Success<T> {
  return "value" in result;
}
export function isResultSuccess<T>(result: ResultEnum<T>): result is ResultSuccess<T> {
  return "value" in result;
}
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
export type ResultCallback<T> = (x: ResultHandler<T>) => any;
export type SuccessCallback<T> = (x: ResultSuccess<T>) => any;
export type FailureCallback = (x: ResultFailure) => any;

export function initResult<T>(result: ResultEnum<T>): Result<T> {
  const resultCallback = (handler: ResultHandler<T>) => {
    return isResultSuccess(result)
      ? handler.success(result)
      : handler.failure(result);
  };
  if (isResultSuccess(result)) {
    const successCallback = (handler: SuccessCallback<T>) => {
      return handler(result);
    };
    return { ...result, success: successCallback, handle: resultCallback };
  }
  const failureCallback = (handler: FailureCallback) => {
    return handler(result);
  };
  return { ...result, failure: failureCallback, handle: resultCallback };
}
export function printResult<T>(result: ResultEnum<T>) {
  if (isResultSuccess(result)) {
    const { value, remaining } = result;
    console.log(JSON.stringify(value, null, 2));
  } else {
    const {
      error,
      tag,
      position: { line, column }
    } = result;
    console.log(
      `line: ${line} column: ${column} Error parsing ${tag}, Unexpected ${error}`
    );
  }
}
