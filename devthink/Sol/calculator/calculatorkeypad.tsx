/**
 * calculatorkeypad.tsx — the keypad of the native calculator: the memory
 * strip (MC, MR, M+, M−) above the standard four column grid, every key
 * answering with the key action the pure logic module understands. Loose
 * component of the calculator page.
 */
import type { CalculatorKeyAction } from "../../calculator";

/** one kind of memory key the strip answers with. */
export type CalculatorMemoryKey = "mc" | "mr" | "m+" | "m-";

type KeypadCell = { label: string; action: CalculatorKeyAction; muted?: boolean; aria?: string };

const KEYPAD_ROWS: KeypadCell[][] = [
  [
    { label: "C", action: { kind: "clear" }, muted: true },
    { label: "(", action: { kind: "lparen" }, muted: true },
    { label: ")", action: { kind: "rparen" }, muted: true },
    { label: "\u232b", action: { kind: "backspace" }, muted: true, aria: "backspace" },
  ],
  [
    { label: "7", action: { kind: "digit", digit: "7" } },
    { label: "8", action: { kind: "digit", digit: "8" } },
    { label: "9", action: { kind: "digit", digit: "9" } },
    { label: "÷", action: { kind: "operator", value: "÷" } },
  ],
  [
    { label: "4", action: { kind: "digit", digit: "4" } },
    { label: "5", action: { kind: "digit", digit: "5" } },
    { label: "6", action: { kind: "digit", digit: "6" } },
    { label: "×", action: { kind: "operator", value: "×" } },
  ],
  [
    { label: "1", action: { kind: "digit", digit: "1" } },
    { label: "2", action: { kind: "digit", digit: "2" } },
    { label: "3", action: { kind: "digit", digit: "3" } },
    { label: "−", action: { kind: "operator", value: "−" } },
  ],
  [
    { label: "%", action: { kind: "percent" } },
    { label: "0", action: { kind: "digit", digit: "0" } },
    { label: ".", action: { kind: "decimal" } },
    { label: "+", action: { kind: "operator", value: "+" } },
  ],
];

const MEMORY_KEYS: { label: string; kind: CalculatorMemoryKey; aria: string }[] = [
  { label: "MC", kind: "mc", aria: "memory clear" },
  { label: "MR", kind: "mr", aria: "memory recall" },
  { label: "M+", kind: "m+", aria: "memory add" },
  { label: "M−", kind: "m-", aria: "memory subtract" },
];

export function CalculatorKeypad({
  onkey,
  onmemory }: {
  onkey: (action: CalculatorKeyAction) => void;
  onmemory: (key: CalculatorMemoryKey) => void;
}) {
  return (
    <div className="dtw-calc__keys">
      {MEMORY_KEYS.map((key) => (
        <button
          key={key.kind}
          type="button"
          className="dtw-calc__key dtw-calc__key--memory"
          aria-label={key.aria}
          onClick={() => onmemory(key.kind)}
        >
          {key.label}
        </button>
      ))}
      {KEYPAD_ROWS.flat().map((cell) => (
        <button
          key={cell.label}
          type="button"
          className={cell.muted ? "dtw-calc__key dtw-calc__key--muted" : "dtw-calc__key"}
          aria-label={cell.aria ?? (cell.action.kind === "digit" ? `digit ${cell.label}` : cell.label)}
          onClick={() => onkey(cell.action)}
        >
          {cell.label}
        </button>
      ))}
      <button
        type="button"
        className="dtw-calc__key dtw-calc__key--equals"
        aria-label="equals"
        onClick={() => onkey({ kind: "equals" })}
      >
        =
      </button>
    </div>
  );
}
