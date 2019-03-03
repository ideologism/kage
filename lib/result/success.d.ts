import { Input } from "../input";
import { FailureHandler, OptionalFailureHandler } from "./failure";
import { Result } from "./result";
export interface SuccessValue<T> {
    value: T;
    newInput: Input;
}
export declare type SuccessHandler<T, S> = (_: SuccessValue<T>) => S;
export declare type OptionalSuccessHandler<T, S> = (_?: SuccessValue<T>) => S;
export declare class Success<T> extends Result<T> {
    value: SuccessValue<T>;
    constructor(success: SuccessValue<T>);
    success<S>(handler: SuccessHandler<T, S>): S;
    failure<S>(handler: OptionalFailureHandler<S>): S;
    cata<S>(x: {
        failure: FailureHandler<S>;
        success: SuccessHandler<T, S>;
    }): S;
}
