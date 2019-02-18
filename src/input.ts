import { initOptional, Optional } from "./types";
export interface IPosition {
  line: number;
  column: number;
}
export interface Input {
  position: IPosition;
  lines: string[];
}
export function initInput(str: string): Input {
  return { position: { line: 0, column: 0 }, lines: str.split("\n") };
}
function curChar(input: Input): Optional<string> {
  const { line, column } = input.position;
  if (line > input.lines.length - 1) {
    return initOptional();
  }
  return initOptional(input.lines[line][column]);
}
export function consume(input: Input) {
  let { line, column } = input.position;
  const position = {...input.position}
  if (line > input.lines.length - 1) {
    return { newInput: input, value: curChar(input)};
  }
  column++;
  if (column > input.lines[line].length - 1) {
    line++;
    column = 0;
  }
  position.line = line;
  position.column = column;
  return { newInput: {position, lines: input.lines}, value: curChar(input) }
}