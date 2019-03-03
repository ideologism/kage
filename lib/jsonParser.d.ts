import { Parser } from "./parser";
export declare const jsonNull: Parser<null>;
export declare const jsonBool: Parser<boolean>;
export declare const unescapedChar: Parser<string>;
export declare const escapedChar: Parser<any>;
export declare const jsonString: Parser<string>;
export declare const jsonNumber: Parser<number>;
export declare const jsonArray: Parser<any[]>;
