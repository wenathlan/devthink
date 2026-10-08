// # calculator.test — the pure calculator core: precedence, parentheses, the
// unary minus, the postfix percent, decimals, the honest refusals, the display
// formatter, the keyboard map, the key-append state machine and the memory
// cell helpers.
import { describe, expect, it } from "vitest";
import {
  CalculatorError,
  applyKey,
  evaluateExpression,
  formatCalculator,
  mapKeyboardKey,
  memoryAdd,
  memoryClear,
  memoryRecallExpression,
  memorySubtract,
} from "../calculator.logic.js";

describe("calculator evaluation", () => {
  it("applies the precedence ladder: × ÷ bind tighter than + −", () => {
    expect(evaluateExpression("2+3×4")).toBe(14);
    expect(evaluateExpression("2×3+4")).toBe(10);
    expect(evaluateExpression("10−4÷2")).toBe(8);
    expect(evaluateExpression("2+3×4−6÷3")).toBe(12);
  });

  it("evaluates left to right inside one level", () => {
    expect(evaluateExpression("8÷4÷2")).toBe(1);
    expect(evaluateExpression("10−3−2")).toBe(5);
  });

  it("parentheses group ahead of every operator", () => {
    expect(evaluateExpression("(2+3)×4")).toBe(20);
    expect(evaluateExpression("2×(3+4)")).toBe(14);
    expect(evaluateExpression("((2))")).toBe(2);
    expect(evaluateExpression("(2+3)×(4−1)")).toBe(15);
  });

  it("carries the unary minus into every position", () => {
    expect(evaluateExpression("−5+3")).toBe(-2);
    expect(evaluateExpression("2×−3")).toBe(-6);
    expect(evaluateExpression("−(2+3)")).toBe(-5);
    expect(evaluateExpression("−−5")).toBe(5);
    expect(evaluateExpression("5×−(1+1)")).toBe(-10);
  });

  it("accepts decimals and trims no honest precision", () => {
    expect(evaluateExpression("3.14×2")).toBe(6.28);
    expect(evaluateExpression(".5+0.5")).toBe(1);
    expect(evaluateExpression("0.1+0.2")).toBeCloseTo(0.3, 12);
  });

  it("answers the postfix percent as one hundredth of the value before it", () => {
    expect(evaluateExpression("50%")).toBe(0.5);
    expect(evaluateExpression("200+10%")).toBe(200.1);
    expect(evaluateExpression("(2+3)%")).toBe(0.05);
    expect(evaluateExpression("50%%")).toBe(0.005);
  });

  it("refuses a division by zero with an honest answer", () => {
    expect(() => evaluateExpression("5÷0")).toThrow(CalculatorError);
    expect(() => evaluateExpression("5÷(3−3)")).toThrow(CalculatorError);
  });

  it("refuses incomplete and malformed expressions", () => {
    expect(() => evaluateExpression("")).toThrow(CalculatorError);
    expect(() => evaluateExpression("2+")).toThrow(CalculatorError);
    expect(() => evaluateExpression("(2+3")).toThrow(CalculatorError);
    expect(() => evaluateExpression("2)")).toThrow(CalculatorError);
    expect(() => evaluateExpression("2 3")).toThrow(CalculatorError);
    expect(() => evaluateExpression("abc")).toThrow(CalculatorError);
    expect(() => evaluateExpression("×3")).toThrow(CalculatorError);
  });
});

describe("calculator display formatting", () => {
  it("trims the binary noise without losing honest precision", () => {
    expect(formatCalculator(0.1 + 0.2)).toBe("0.3");
    expect(formatCalculator(14)).toBe("14");
    expect(formatCalculator(-2.5)).toBe("-2.5");
    expect(formatCalculator(6.28)).toBe("6.28");
  });

  it("answers overflow and NaN in words", () => {
    expect(formatCalculator(Number.NaN)).toBe("not a number");
    expect(formatCalculator(Number.POSITIVE_INFINITY)).toBe("overflow");
    expect(formatCalculator(Number.NEGATIVE_INFINITY)).toBe("-overflow");
  });
});

describe("calculator keyboard map", () => {
  it("maps digits, operators and the decimal spellings", () => {
    expect(mapKeyboardKey("7")).toEqual({ kind: "digit", digit: "7" });
    expect(mapKeyboardKey(".")).toEqual({ kind: "decimal" });
    expect(mapKeyboardKey(",")).toEqual({ kind: "decimal" });
    expect(mapKeyboardKey("+")).toEqual({ kind: "operator", value: "+" });
    expect(mapKeyboardKey("-")).toEqual({ kind: "operator", value: "−" });
    expect(mapKeyboardKey("*")).toEqual({ kind: "operator", value: "×" });
    expect(mapKeyboardKey("/")).toEqual({ kind: "operator", value: "÷" });
    expect(mapKeyboardKey("%")).toEqual({ kind: "percent" });
  });

  it("maps groups, the answer key, clear and backspace", () => {
    expect(mapKeyboardKey("(")).toEqual({ kind: "lparen" });
    expect(mapKeyboardKey(")")).toEqual({ kind: "rparen" });
    expect(mapKeyboardKey("Enter")).toEqual({ kind: "equals" });
    expect(mapKeyboardKey("=")).toEqual({ kind: "equals" });
    expect(mapKeyboardKey("Escape")).toEqual({ kind: "clear" });
    expect(mapKeyboardKey("Backspace")).toEqual({ kind: "backspace" });
  });

  it("answers null for keys the calculator does not own", () => {
    expect(mapKeyboardKey("q")).toBeNull();
    expect(mapKeyboardKey("Shift")).toBeNull();
    expect(mapKeyboardKey("F5")).toBeNull();
  });
});

describe("calculator key state machine", () => {
  it("rides digits onto the trailing number and multiplies after a group", () => {
    expect(applyKey("", { kind: "digit", digit: "5" })).toBe("5");
    expect(applyKey("12", { kind: "digit", digit: "3" })).toBe("123");
    expect(applyKey("(2)", { kind: "digit", digit: "3" })).toBe("(2)×3");
    expect(applyKey("5%", { kind: "digit", digit: "2" })).toBe("5%×2");
  });

  it("keeps one decimal point per number and starts one with a zero", () => {
    expect(applyKey("", { kind: "decimal" })).toBe("0.");
    expect(applyKey("5", { kind: "decimal" })).toBe("5.");
    expect(applyKey("5.", { kind: "decimal" })).toBe("5.");
    expect(applyKey("5.2", { kind: "decimal" })).toBe("5.2");
    expect(applyKey("5+", { kind: "decimal" })).toBe("5+0.");
    expect(applyKey("(2)", { kind: "decimal" })).toBe("(2)×0.");
  });

  it("replaces a binary operator and rides the minus as the unary sign", () => {
    expect(applyKey("5+3", { kind: "operator", value: "×" })).toBe("5+3×");
    expect(applyKey("5+", { kind: "operator", value: "×" })).toBe("5×");
    expect(applyKey("5×", { kind: "operator", value: "−" })).toBe("5×−");
    expect(applyKey("5×−", { kind: "operator", value: "−" })).toBe("5×−");
    expect(applyKey("", { kind: "operator", value: "−" })).toBe("−");
    expect(applyKey("", { kind: "operator", value: "+" })).toBe("");
    expect(applyKey("(", { kind: "operator", value: "−" })).toBe("(−");
    expect(applyKey("5×−", { kind: "operator", value: "+" })).toBe("5+");
    expect(applyKey("−5", { kind: "operator", value: "+" })).toBe("−5+");
  });

  it("opens groups with an implicit product and closes them honestly", () => {
    expect(applyKey("2", { kind: "lparen" })).toBe("2×(");
    expect(applyKey("(", { kind: "lparen" })).toBe("((");
    expect(applyKey("(2", { kind: "rparen" })).toBe("(2)");
    expect(applyKey("(2)", { kind: "rparen" })).toBe("(2)");
    expect(applyKey("(2+", { kind: "rparen" })).toBe("(2+");
    expect(applyKey("2", { kind: "rparen" })).toBe("2");
  });

  it("appends the percent only after a value", () => {
    expect(applyKey("5", { kind: "percent" })).toBe("5%");
    expect(applyKey("5%", { kind: "percent" })).toBe("5%%");
    expect(applyKey("5+", { kind: "percent" })).toBe("5+");
  });

  it("clears, steps back and leaves the answer to the evaluator", () => {
    expect(applyKey("5+3", { kind: "backspace" })).toBe("5+");
    expect(applyKey("5+3", { kind: "clear" })).toBe("");
    expect(applyKey("5+3", { kind: "equals" })).toBe("5+3");
  });

  it("drives a full expression from the keyboard map to the evaluator", () => {
    let expression = "";
    for (const key of ["2", "+", "3", "*", "4", "Enter"]) {
      const action = mapKeyboardKey(key);
      if (!action) throw new Error(`the keyboard map dropped ${key}`);
      if (action.kind === "equals") {
        expect(evaluateExpression(expression)).toBe(14);
      } else {
        expression = applyKey(expression, action);
      }
    }
    expect(expression).toBe("2+3×4");
  });
});

describe("calculator memory cell", () => {
  it("adds, subtracts and answers the cell arithmetic the keys stand for", () => {
    expect(memoryAdd(0, 5)).toBe(5);
    expect(memoryAdd(5, 2.5)).toBe(7.5);
    expect(memorySubtract(7.5, 10)).toBe(-2.5);
    expect(memorySubtract(0, 0.5)).toBe(-0.5);
    expect(memoryClear()).toBe(0);
  });

  it("recalls the memory where a value is expected and multiplies after one", () => {
    expect(memoryRecallExpression("", 7)).toBe("7");
    expect(memoryRecallExpression("5+", 7)).toBe("5+7");
    expect(memoryRecallExpression("5×(", 7)).toBe("5×(7");
    expect(memoryRecallExpression("5", 7)).toBe("5×7");
    expect(memoryRecallExpression("(2)", 7)).toBe("(2)×7");
    expect(memoryRecallExpression("5%", 7)).toBe("5%×7");
    expect(evaluateExpression(memoryRecallExpression("5+", -7))).toBe(-2);
  });
});
