"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var input_1 = require("./input");
var types_1 = require("./types");
var testInput = "line1\nline2\nline3\nline4";
test("consume input", function () {
    var input = input_1.initInput(testInput);
    var output = "";
    var cur = types_1.initOptional("");
    while (types_1.isSome(cur)) {
        output += cur.value;
        var _a = input_1.consume(input), newInput = _a.newInput, value = _a.value;
        cur = value;
        input = newInput;
    }
    expect(output).toBe("line1line2line3line4");
});
