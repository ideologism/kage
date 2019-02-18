import { ResultEnum } from "./result";
export declare function parseResult<T>(result: ResultEnum<T>): T | {
    error: string;
    tag: string;
    position: import("./input").IPosition;
};
