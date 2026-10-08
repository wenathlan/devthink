/** Style: DevThink calculator logic — the pure evaluation core of the native
 * calculator app. The tokenizer and the recursive-descent evaluator own the
 * whole arithmetic surface: + − × ÷, postfix percent (one percent divides the
 * value before it by one hundred), parentheses, unary minus and decimals over
 * IEEE doubles, with no rounding beyond the display formatter the page uses.
 * The keyboard map and the key-append state machine ride the same module so
 * the Sol page stays a thin mount: it feeds expression strings and key actions
 * in and renders the answers out. The module never touches the DOM, the
 * network or the visitor machine. */

/** the four binary operators the display shows, the tokenizer accepts and the evaluator applies. */
export type CalculatorOperator = "+" | "−" | "×" | "÷";

/** one scanned unit of an expression: a number, a binary operator, a group or the postfix percent. */
export type CalculatorToken =
  | { kind: "number"; value: number }
  | { kind: "operator"; value: CalculatorOperator }
  | { kind: "lparen" }
  | { kind: "rparen" }
  | { kind: "percent" };

/** raised for any expression the calculator refuses to evaluate. */
export class CalculatorError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "CalculatorError";
  }
}

/** one key press the calculator understands, shared by the on-screen keypad and the keyboard map. */
export type CalculatorKeyAction =
  | { kind: "digit"; digit: string }
  | { kind: "decimal" }
  | { kind: "operator"; value: CalculatorOperator }
  | { kind: "percent" }
  | { kind: "lparen" }
  | { kind: "rparen" }
  | { kind: "equals" }
  | { kind: "clear" }
  | { kind: "backspace" };

/** Scans an expression into tokens: digits and decimals ride together, the
 * ASCII spellings the keyboard produces (- * / x) fold into the display
 * spellings (− × ÷), and whitespace stays invisible. Anything else refuses. */
export function tokenizeCalculator(expression: string): CalculatorToken[] {
  const tokens: CalculatorToken[] = [];
  let at = 0;
  while (at < expression.length) {
    const char = expression.charAt(at);
    if (char === " " || char === "\t" || char === "\n" || char === "\r") {
      at += 1;
      continue;
    }
    if (/[0-9.]/.test(char)) {
      const match = expression.slice(at).match(/^(\d+(?:\.\d*)?|\.\d+)/);
      if (!match) throw new CalculatorError("a decimal point stands where digits were expected");
      const text = match[1];
      tokens.push({ kind: "number", value: Number(text) });
      at += text.length;
      continue;
    }
    if (char === "+") {
      tokens.push({ kind: "operator", value: "+" });
      at += 1;
      continue;
    }
    if (char === "-" || char === "−") {
      tokens.push({ kind: "operator", value: "−" });
      at += 1;
      continue;
    }
    if (char === "*" || char === "×" || char === "x" || char === "X") {
      tokens.push({ kind: "operator", value: "×" });
      at += 1;
      continue;
    }
    if (char === "/" || char === "÷") {
      tokens.push({ kind: "operator", value: "÷" });
      at += 1;
      continue;
    }
    if (char === "(") {
      tokens.push({ kind: "lparen" });
      at += 1;
      continue;
    }
    if (char === ")") {
      tokens.push({ kind: "rparen" });
      at += 1;
      continue;
    }
    if (char === "%") {
      tokens.push({ kind: "percent" });
      at += 1;
      continue;
    }
    throw new CalculatorError(`the expression carries a character the calculator does not know: ${char}`);
  }
  return tokens;
}

type TokenCursor = { at: number };

/** sum level: + and −, left to right. */
function parseSum(tokens: CalculatorToken[], cursor: TokenCursor): number {
  let value = parseProduct(tokens, cursor);
  for (;;) {
    const token = tokens[cursor.at];
    if (token && token.kind === "operator" && (token.value === "+" || token.value === "−")) {
      cursor.at += 1;
      const right = parseProduct(tokens, cursor);
      value = token.value === "+" ? value + right : value - right;
      continue;
    }
    return value;
  }
}

/** product level: × and ÷ bind tighter; a division by zero refuses with an honest answer. */
function parseProduct(tokens: CalculatorToken[], cursor: TokenCursor): number {
  let value = parseUnary(tokens, cursor);
  for (;;) {
    const token = tokens[cursor.at];
    if (token && token.kind === "operator" && (token.value === "×" || token.value === "÷")) {
      cursor.at += 1;
      const right = parseUnary(tokens, cursor);
      if (token.value === "÷" && right === 0) throw new CalculatorError("a division by zero has no answer");
      value = token.value === "×" ? value * right : value / right;
      continue;
    }
    return value;
  }
}

/** unary level: a minus sign negates what follows it, once per sign. */
function parseUnary(tokens: CalculatorToken[], cursor: TokenCursor): number {
  const token = tokens[cursor.at];
  if (token && token.kind === "operator" && token.value === "−") {
    cursor.at += 1;
    return -parseUnary(tokens, cursor);
  }
  return parsePostfix(tokens, cursor);
}

/** postfix level: each percent divides the value before it by one hundred. */
function parsePostfix(tokens: CalculatorToken[], cursor: TokenCursor): number {
  let value = parsePrimary(tokens, cursor);
  for (;;) {
    const token = tokens[cursor.at];
    if (token && token.kind === "percent") {
      value /= 100;
      cursor.at += 1;
      continue;
    }
    return value;
  }
}

/** primary level: a number or a parenthesized group. */
function parsePrimary(tokens: CalculatorToken[], cursor: TokenCursor): number {
  const token = tokens[cursor.at];
  if (!token) throw new CalculatorError("the expression ends where a number was expected");
  if (token.kind === "number") {
    cursor.at += 1;
    return token.value;
  }
  if (token.kind === "lparen") {
    cursor.at += 1;
    const value = parseSum(tokens, cursor);
    const closing = tokens[cursor.at];
    if (closing?.kind !== "rparen") throw new CalculatorError("a group opens and never closes");
    cursor.at += 1;
    return value;
  }
  throw new CalculatorError("the expression carries an operator where a number was expected");
}

/** Evaluates one expression with the honest precedence ladder: parentheses,
 * then postfix percent, then unary minus, then × ÷, then + −, left to right. */
export function evaluateExpression(expression: string): number {
  const tokens = tokenizeCalculator(expression);
  if (tokens.length === 0) throw new CalculatorError("the expression is empty");
  const cursor: TokenCursor = { at: 0 };
  const value = parseSum(tokens, cursor);
  if (cursor.at < tokens.length) {
    const tail = tokens[cursor.at];
    if (tail && tail.kind === "rparen") throw new CalculatorError("a closing parenthesis has no opening one");
    throw new CalculatorError("the expression carries a number where an operator was expected");
  }
  return value;
}

/** Formats one answer for the display and the history: twelve significant
 * digits keep the honest precision of the double while trimming the binary
 * noise (0.1 + 0.2 answers 0.3), and infinities answer in words. */
export function formatCalculator(value: number): string {
  if (Number.isNaN(value)) return "not a number";
  if (!Number.isFinite(value)) return value > 0 ? "overflow" : "-overflow";
  return String(Number(value.toPrecision(12)));
}

/** Maps one physical keyboard key onto the key action it stands for: the
 * keyboard spellings fold into the display spellings, Enter answers, Escape
 * clears and Backspace steps back. Unknown keys answer null. */
export function mapKeyboardKey(key: string): CalculatorKeyAction | null {
  if (/^[0-9]$/.test(key)) return { kind: "digit", digit: key };
  switch (key) {
    case ".":
    case ",":
      return { kind: "decimal" };
    case "+":
      return { kind: "operator", value: "+" };
    case "-":
      return { kind: "operator", value: "−" };
    case "*":
    case "x":
    case "X":
      return { kind: "operator", value: "×" };
    case "/":
      return { kind: "operator", value: "÷" };
    case "%":
      return { kind: "percent" };
    case "(":
      return { kind: "lparen" };
    case ")":
      return { kind: "rparen" };
    case "Enter":
    case "=":
      return { kind: "equals" };
    case "Escape":
      return { kind: "clear" };
    case "Backspace":
      return { kind: "backspace" };
    default:
      return null;
  }
}

/** Applies one key action to the expression the display carries: digits ride
 * the trailing number, an operator replaces a binary one but rides as the
 * unary sign beside another operator, a group after a value multiplies it and
 * a group never closes on an operator. The state machine refuses what would
 * tokenize badly instead of storing it. */
export function applyKey(expression: string, action: CalculatorKeyAction): string {
  switch (action.kind) {
    case "digit": {
      if (/[)%]$/.test(expression)) return `${expression}×${action.digit}`;
      return expression + action.digit;
    }
    case "decimal": {
      const trailing = expression.match(/(\d+\.?\d*)$/);
      if (trailing) {
        const number = trailing[1];
        if (number.includes(".")) return expression;
        return `${expression}.`;
      }
      if (/[0-9)%]$/.test(expression)) return `${expression}×0.`;
      return `${expression}0.`;
    }
    case "operator": {
      if (!expression || expression.endsWith("(")) {
        return action.value === "−" ? `${expression}−` : expression;
      }
      const run = expression.match(/[+−×÷]+$/);
      if (run) {
        const text = run[0];
        const start = expression.length - text.length;
        const before = start > 0 ? expression.charAt(start - 1) : "";
        const unary = start === 0 || before === "(" || /[+−×÷]/.test(before);
        if (action.value === "−") {
          if (text.endsWith("−")) return expression;
          return `${expression}−`;
        }
        if (unary) return expression;
        return `${expression.slice(0, start)}${action.value}`;
      }
      return `${expression}${action.value}`;
    }
    case "percent": {
      if (/[0-9)%]$/.test(expression)) return `${expression}%`;
      return expression;
    }
    case "lparen": {
      if (/[0-9)%]$/.test(expression)) return `${expression}×(`;
      return `${expression}(`;
    }
    case "rparen": {
      const open = (expression.match(/\(/g) ?? []).length;
      const closed = (expression.match(/\)/g) ?? []).length;
      if (open <= closed) return expression;
      if (/[+−×÷(]$/.test(expression)) return expression;
      return `${expression})`;
    }
    case "clear":
      return "";
    case "backspace":
      return expression.slice(0, -1);
    case "equals":
      return expression;
  }
}

/** The memory cell helpers behind the MC, MR, M+ and M− keys: the cell itself
 * stays in the page state, the arithmetic stays pure here. */
export function memoryAdd(stored: number, value: number): number {
  return stored + value;
}

/** Subtracts one value from the memory cell (the M− key). */
export function memorySubtract(stored: number, value: number): number {
  return stored - value;
}

/** Clears the memory cell (the MC key): the cell answers zero. */
export function memoryClear(): number {
  return 0;
}

/** Builds the expression that carries the recalled memory (the MR key): the
 * stored value rides as text where a value is expected, and after a value it
 * multiplies the expression, so a recall never fuses two numbers together. */
export function memoryRecallExpression(expression: string, stored: number): string {
  const value = formatCalculator(stored);
  if (/[0-9)%]$/.test(expression)) return `${expression}×${value}`;
  return `${expression}${value}`;
}
