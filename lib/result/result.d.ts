import { Failure, FailureHandler, FailureValue } from "./failure";
import { Success, SuccessHandler, SuccessValue } from "./success";
declare type ResultValue<T> = SuccessValue<T> | FailureValue;
export declare function isSuccessValue<T>(result: ResultValue<T>): result is SuccessValue<T>;
export declare abstract class Result<T> {
    static of<T>(result: ResultValue<T>): Success<T> | Failure<T>;
    abstract value: SuccessValue<T> | FailureValue;
    isSuccess(): this is Success<T>;
    abstract cata<S>(x: {
        failure: FailureHandler<S>;
        success: SuccessHandler<T, S>;
    }): S;
}
export {};
