import { IPosition } from "../input";
import { Result } from "./result";
import { OptionalSuccessHandler, SuccessHandler } from "./success";
export interface FailureValue {
    tag: string;
    error: string;
    position: IPosition;
}
export declare type FailureHandler<T> = (_: FailureValue) => T;
export declare type OptionalFailureHandler<T> = (_?: FailureValue) => T;
export declare class Failure<T> extends Result<T> {
    value: FailureValue;
    constructor(failure: FailureValue);
    failure<S>(handler: FailureHandler<S>): S;
    success<S>(handler: OptionalSuccessHandler<T, S>): S;
    cata<S>(x: {
        failure: FailureHandler<S>;
        success: SuccessHandler<T, S>;
    }): S;
}
