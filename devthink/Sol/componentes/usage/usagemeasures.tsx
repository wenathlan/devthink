/**
 * usagemeasures.tsx — the measures of the usage ledger: the message count
 * as the one dominant figure and the remaining durable counts as hairline
 * rows with their real values. Loose component of the usage page.
 */
import {DatabaseRegular, PulseRegular, TabRegular} from "@fluentui/react-icons";
import { osText } from "../../oslabels.ts";

/** one durable measure the ledger answers with. */
export type Usage = {
  workspaces: number;
  sessions: number;
  tabs: number;
  messages: number;
  providers: number;
  paired: boolean;
};

export function UsageMeasures({ usage, paired }: { usage: Usage; paired: boolean }) {
  const measures = [
    { id: "usage-projects", label: osText("usage.measure.projects"), value: usage.workspaces, icon: DatabaseRegular },
    { id: "usage-sessions", label: osText("usage.measure.sessions"), value: usage.sessions, icon: PulseRegular },
    { id: "usage-tabs", label: osText("usage.measure.tabs"), value: usage.tabs, icon: TabRegular },
  ];
  return (
    <>
      <p className="dtw-console__note">
        <span>{paired ? osText("usage.note.paired") : osText("usage.note.local")}</span>
        <span>{osText("usage.note.honest")}</span>
      </p>
      <section className="dtw-card dtw-usage__hero">
        <span className="dtw-usage__figlabel">{osText("usage.figlabel")}</span>
        <strong className="dtw-usage__figure">{usage.messages}</strong>
      </section>
      <section className="dtw-card">
        <ul className="dtw-usage__rows">
          {measures.map(({ id, label, value, icon: Icon }) => (
            <li key={id} id={id} className="dtw-usage__row">
              <Icon fontSize={16} aria-hidden="true" />
              <span className="dtw-usage__label">{label}</span>
              <strong className="dtw-usage__value">{value}</strong>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
