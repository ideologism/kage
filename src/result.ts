import { Input, IPosition } from "./input";

type ResultValue<T> = SuccessValue<T> | FailureValue;
export function isSuccessValue<T>(
  result: ResultValue<T>
): result is SuccessValue<T> {
  return "value" in result;
}

export abstract class Result<T> {
  public static of<T>(result: ResultValue<T>) {
    return isSuccessValue(result)
      ? new Success(result)
      : new Failure<T>(result);
  }
  public abstract value: SuccessValue<T> | FailureValue;
  public isSuccess(): this is Success<T> {
    return isSuccessValue(this.value);
  }
  public abstract cata<S>(x: {
    failure: FailureHandler<S>;
    success: SuccessHandler<T, S>;
  }): S;
}

export interface SuccessValue<T> {
  value: T;
  newInput: Input;
}
export type SuccessHandler<T, S> = (_: SuccessValue<T>) => S;
export type OptionalSuccessHandler<T, S> = (_?: SuccessValue<T>) => S;
export class Success<T> extends Result<T> {
  public value: SuccessValue<T>;
  constructor(success: SuccessValue<T>) {
    super();
    this.value = success;
  }
  public success<S>(handler: SuccessHandler<T, S>): S {
    return handler(this.value);
  }
  public failure<S>(handler: OptionalFailureHandler<S>): S {
    return handler();
  }
  public cata<S>(x: { failure?: any; success: SuccessHandler<T, S> }): S {
    return x.success(this.value);
  }
}

export interface FailureValue {
  tag: string;
  error: string;
  position: IPosition;
}
export type FailureHandler<T> = (_: FailureValue) => T;
export type OptionalFailureHandler<T> = (_?: FailureValue) => T;
export class Failure<T> extends Result<T> {
  public value: FailureValue;
  constructor(failure: FailureValue) {
    super();
    this.value = failure;
  }
  public failure<S>(handler: FailureHandler<S>): S {
    return handler(this.value);
  }
  public success<S>(handler: OptionalSuccessHandler<T, S>): S {
    return handler();
  }
  public cata<S>(x: { failure: FailureHandler<S>; success?: any }): S {
    return x.failure(this.value);
  }
}
