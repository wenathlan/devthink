/**
 * calculatorhistory.tsx — the history card of the native calculator: the
 * last answers the display produced, newest first, one hairline row per
 * answer with the honest count and the empty state while the keypad has
 * not answered anything yet. Loose component of the calculator page.
 */
import { HistoryRegular } from "@fluentui/react-icons";

/** one answered line of the history: the expression, the answer and the id
 * that keeps the list keys honest when the same line answers twice. */
export type CalculatorHistoryRow = { id: string; line: string };

export function CalculatorHistory({ rows }: { rows: CalculatorHistoryRow[] }) {
  return (
    <section className="dtw-card" aria-label="History">
      <h2 className="dtw-cardtitle">
        <HistoryRegular fontSize={15} aria-hidden="true" />
        History
        {rows.length ? <span className="dtw-navrow__count">{rows.length}</span> : null}
      </h2>
      {rows.length ? (
        <ul className="dtw-calc__rows">
          {rows.map((row) => (
            <li key={row.id} className="dtw-calc__row">
              {row.line}
            </li>
          ))}
        </ul>
      ) : (
        <p className="dtw-copy">Nothing yet</p>
      )}
    </section>
  );
}
