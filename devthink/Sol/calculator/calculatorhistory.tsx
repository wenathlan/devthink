/**
 * calculatorhistory.tsx — the history rail of the native calculator: the
 * last answers the display produced, newest first, rendered as a bare
 * annotated column beside the instrument (hairline-left rail, mono head,
 * one hairline per row — no card-in-card), with an honest empty state while
 * the keypad has not answered anything yet.
 */

/** Style: DevThink Terminal Atelier — the windows standard history column,
 * identity by content: one line per answer, the newest one on top, tabular
 * numerals throughout. */
import { History } from "lucide-react";

/** one answered line of the history: the expression, the answer and the id
 * that keeps the list keys honest when the same line answers twice. */
export type CalculatorHistoryRow = { id: string; line: string };

const MONO = "var(--font-mono, var(--dt-mono))";

const railStyle = { display: "grid", gap: 12, alignContent: "start", minWidth: 0 } as const;
const headStyle = { display: "flex", alignItems: "baseline", gap: 8 } as const;
const headTitleStyle = {
  margin: 0,
  color: "var(--dt-text)",
  font: `600 12px ${MONO}`,
  letterSpacing: ".08em",
} as const;
const countStyle = { color: "var(--dt-faint)", font: `500 10px ${MONO}`, fontVariantNumeric: "tabular-nums" } as const;
const emptyStyle = { margin: 0, fontSize: 13, lineHeight: 1.7, color: "var(--dt-muted)", maxWidth: "42ch" } as const;

export function CalculatorHistory({ rows }: { rows: CalculatorHistoryRow[] }) {
  return (
    <section className="calculator-rail" style={railStyle} aria-label="history">
      <header style={headStyle}>
        <History size={14} aria-hidden="true" style={{ color: "var(--dt-blue)" }} />
        <h2 style={headTitleStyle}>history</h2>
        {rows.length ? <span style={countStyle}>{String(rows.length).padStart(2, "0")}</span> : null}
      </header>
      {rows.length ? (
        <ol className="calculator-history">
          {rows.map((row) => (
            <li key={row.id}>{row.line}</li>
          ))}
        </ol>
      ) : (
        <p style={emptyStyle}>
          The keypad has not answered anything yet, so the history stays empty until the first expression answers.
        </p>
      )}
    </section>
  );
}
