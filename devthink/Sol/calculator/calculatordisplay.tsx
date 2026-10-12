/**
 * calculatordisplay.tsx — the display of the native calculator: the small
 * expression line above the big answer line, the memory flag and the honest
 * error line, exactly one surface the keyboard and the keypad both feed.
 */

/** Style: DevThink Terminal Atelier — the windows standard display, identity
 * by content: tabular numerals, right aligned, one memory flag, one error. */
export function CalculatorDisplay({
  expression,
  answer,
  error,
  memory,
}: {
  expression: string;
  answer: string | null;
  error: string | null;
  memory: number;
}) {
  return (
    <div className="calculator-display" aria-live="polite">
      {memory !== 0 ? <span className="calculator-display__memory">m</span> : null}
      <div className="calculator-display__expression">{answer ? expression : "\u00a0"}</div>
      <div className="calculator-display__value">{answer ?? (expression || "0")}</div>
      {error ? (
        <div className="calculator-display__error" role="alert">
          {error}
        </div>
      ) : null}
    </div>
  );
}
