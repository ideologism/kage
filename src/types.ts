export type Optional<T> = Some<T> | None;
export interface Some<T> {
  value: T;
}
export type None = "None";
export function isSome<T>(optional: Optional<T>): optional is Some<T> {
  return optional !== "None";
}
export type Tuple<L, R> = [L, R];
export interface RecTuple<T> extends Tuple<T | RecTuple<T>, T> {}
export function initOptional<T>(t?: T): Optional<T> {
  return t === undefined || t === null ? "None" : { value: t };
}
