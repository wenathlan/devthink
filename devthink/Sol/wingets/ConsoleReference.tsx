/**
 * reference.tsx — the command reference of the console: the registry
 * the cli and the command palette share as hairline rows, one entry per
 * command with its usage and flags, the global flags and the exit codes
 * closing the card. Loose component of the console page.
 */

import { WindowConsoleRegular } from "@fluentui/react-icons";
import { catalogcommands, exitclasses, globalflags } from "../../commandcatalog.ts";

export function ConsoleReference({ running, onrun }: { running: boolean; onrun: (id: string) => void }) {
  return (
    <section className="dtw-card">
      <h2 className="dtw-cardtitle">
        <WindowConsoleRegular fontSize={15} aria-hidden="true" />
        Command reference
        <span className="dtw-navrow__count">{catalogcommands.length}</span>
      </h2>
      <p className="dtw-copy">
        Every command with its usage and flags. Enter runs one entry in the terminal.
      </p>
      <ul className="dtw-console__refs">
        {catalogcommands.map((command) => (
          <li key={command.id}>
            <button type="button" className="dtw-console__refrun" onClick={() => onrun(command.id)} disabled={!running}>
              <strong>{command.id}</strong>
              <span>{command.label}</span>
            </button>
            <div className="dtw-console__refdetail">
              <code>{command.usage}</code>
              {command.flags.map((flag) => (
                <span key={flag.flag}>
                  <code>{flag.value ? `${flag.flag} ${flag.value}` : flag.flag}</code> {flag.note}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>
      <h3 className="dtw-console__subhead">Global flags</h3>
      <ul className="dtw-rows">
        {globalflags.map((flag) => (
          <li key={flag.flag} className="dtw-row">
            <code>{flag.value ? `${flag.flag} ${flag.value}` : flag.flag}</code>
            <span>{flag.note}</span>
          </li>
        ))}
      </ul>
      <h3 className="dtw-console__subhead">Exit codes</h3>
      <ul className="dtw-rows">
        {exitclasses.map((entry) => (
          <li key={entry.exitclass} className="dtw-row">
            <code>{entry.exitclass}</code>
            <span>{entry.code}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
