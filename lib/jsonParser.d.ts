import { Lexer } from "./lexer";
export declare const jsonNull: Lexer<null>;
export declare const jsonBool: Lexer<boolean>;
export declare const unescapedChar: Lexer<string>;
export declare const escapedChar: Lexer<any>;
export declare const jsonString: Lexer<string>;
export declare const jsonNumber: Lexer<number>;
export declare const jsonArray: Lexer<any[]>;
