import { consume, initInput } from "./input";
import { initOptional, isSome } from "./types";
const testInput = `line1
line2
line3
line4`;
test("consume input", () => {
  let input = initInput(testInput);
  let output = "";
  let cur = initOptional("");
  while (isSome(cur)) {
    output += cur.value;
    const { newInput, value } = consume(input);
    cur = value;
    input = newInput;
  }
  expect(output).toBe(testInput + "\n");
});
