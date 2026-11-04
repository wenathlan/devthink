/**
 * keypad.tsx — the keypad of the native calculator: the memory
 * strip (MC, MR, M+, M−) above the standard four column grid, every key
 * answering with the key action the pure logic module understands. The key
 * tables ride the label store now (osCalcKeys / osCalcMemoryKeys — the
 * data lane law): the winget renders the rows the store serves, it never
 * restates a glyph, an action or an aria name. Loose component of the
 * calculator page.
 */
import type { CalculatorKeyAction } from "../../calculator";
import { type OsCalcMemoryKey, osCalcKeys, osCalcMemoryKeys, osText } from "../../oslabels.ts";

export function CalculatorKeypad({
  onkey,
  onmemory }: {
  onkey: (action: CalculatorKeyAction) => void;
  onmemory: (key: OsCalcMemoryKey) => void;
}) {
  return (
    <div className="dtw-calc__keys">
      {osCalcMemoryKeys().map((key) => (
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
      {osCalcKeys().flat().map((cell) => (
        <button
          key={cell.label}
          type="button"
          className={
            cell.equals
              ? "dtw-calc__key dtw-calc__key--equals"
              : cell.muted
                ? "dtw-calc__key dtw-calc__key--muted"
                : "dtw-calc__key"
          }
          aria-label={cell.aria ?? (cell.action.kind === "digit" ? osText("calc.key.digit").replace("{key}", cell.label) : cell.label)}
          onClick={() => onkey(cell.action)}
        >
          {cell.label}
        </button>
      ))}
    </div>
  );
}
