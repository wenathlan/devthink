/**
 * calculator.history.tsx — the history list of the native calculator: the
 * last answers the display produced, newest first, with an honest empty
 * state while the keypad has not answered anything yet.
 */

/** Style: DevThink Terminal Atelier — the windows standard history column,
 * identity by content: one line per answer, the newest one on top. */
import { History } from "lucide-react";

/** one answered line of the history: the expression, the answer and the id
 * that keeps the list keys honest when the same line answers twice. */
export type CalculatorHistoryRow = { id: string; line: string };

export function CalculatorHistory({ rows }: { rows: CalculatorHistoryRow[] }) {
  return (
    <section className="control-note" style={{ display: "grid", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <History size={15} style={{ color: "var(--dt-blue)" }} />
        <h2 style={{ margin: 0, fontSize: 15, color: "var(--dt-text)" }}>history</h2>
      </div>
      {rows.length ? (
        <ol className="calculator-history">
          {rows.map((row) => (
            <li key={row.id}>{row.line}</li>
          ))}
        </ol>
      ) : (
        <p style={{ margin: 0 }}>
          The keypad has not answered anything yet, so the history stays empty until the first expression answers.
        </p>
      )}
    </section>
  );
}
