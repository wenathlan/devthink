/**
 * ladder.tsx — the rung ladder of the history app: hairline rows
 * with the version numerals, the latest badge, the stamp and the note, with
 * the real chain facts closing the card. Loose component of the history
 * page.
 */
import {HistoryRegular} from "@fluentui/react-icons";
import type { Rung } from "../../catalog";
import { osText } from "../../oslabels.ts";

export function HistoryLadder({
  rows,
  loaded,
  latest,
  oldest }: {
  rows: readonly Rung[];
  loaded: boolean;
  latest: string;
  oldest: string;
}) {
  return (
    <section className="dtw-card">
      <h2 className="dtw-cardtitle">
        <HistoryRegular fontSize={15} aria-hidden="true" />
        {osText("history.ladder.milestones")}
        <span className="dtw-navrow__count">{rows.length}</span>
      </h2>
      {rows.length === 0 ? (
        <p className="dtw-copy">{loaded ? osText("history.ladder.empty") : osText("history.ladder.loading")}</p>
      ) : (
        <>
          <ul className="dtw-history__rows">
            {rows.map((rung) => (
              <li key={rung.version} className="dtw-history__row" data-latest={rung.latest ? "true" : undefined}>
                <div className="dtw-history__body">
                  <h3>
                    {rung.version}
                    {rung.latest ? <span className="dtw-history__badge">{osText("history.ladder.latest")}</span> : null}
                  </h3>
                  <p>{rung.note}</p>
                </div>
                <time className="dtw-history__stamp">{rung.stamp}</time>
              </li>
            ))}
          </ul>
          <div className="dtw-history__facts">
            <span>
              {osText("history.facts.rungs")} <b>{rows.length}</b>
            </span>
            <span>
              {osText("history.ladder.latest")} <b>{latest}</b>
            </span>
            <span>
              {osText("history.facts.chain")}{" "}
              <b>
                {oldest} to {latest}
              </b>
            </span>
          </div>
        </>
      )}
    </section>
  );
}
