/**
 * calculatordisplay.tsx — the display of the native calculator: the small
 * expression line above the big answer line, the memory flag and the honest
 * error line, exactly one surface the keyboard and the keypad both feed.
 * Loose component of the calculator page.
 */

/** CalculatorDisplay — the answer surface of the instrument. */
export function CalculatorDisplay({
  expression,
  answer,
  error,
  memory }: {
  expression: string;
  answer: string | null;
  error: string | null;
  memory: number;
}) {
  return (
    <div className="dtw-calc__display" aria-live="polite">
      {memory !== 0 ? <span className="dtw-calc__flag">M</span> : null}
      <div className="dtw-calc__expression">{answer ? expression : "\u00a0"}</div>
      <div className="dtw-calc__value">{answer ?? (expression || "0")}</div>
      {error ? (
        <div className="dtw-calc__error" role="alert">
          {error}
        </div>
      ) : null}
    </div>
  );
}
