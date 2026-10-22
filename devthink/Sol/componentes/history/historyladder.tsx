/**
 * historyladder.tsx — the rung ladder of the history app: hairline rows
 * with the version numerals, the latest badge, the stamp and the note, with
 * the real chain facts closing the card. Loose component of the history
 * page.
 */
import {HistoryRegular} from "@fluentui/react-icons";
import type { Rung } from "../../../catalog.ts";

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
        Milestones
        <span className="dtw-navrow__count">{rows.length}</span>
      </h2>
      {rows.length === 0 ? (
        <p className="dtw-copy">{loaded ? "No rungs stamped yet" : "Loading the ladder"}</p>
      ) : (
        <>
          <ul className="dtw-history__rows">
            {rows.map((rung) => (
              <li key={rung.version} className="dtw-history__row" data-latest={rung.latest ? "true" : undefined}>
                <div className="dtw-history__body">
                  <h3>
                    {rung.version}
                    {rung.latest ? <span className="dtw-history__badge">Latest</span> : null}
                  </h3>
                  <p>{rung.note}</p>
                </div>
                <time className="dtw-history__stamp">{rung.stamp}</time>
              </li>
            ))}
          </ul>
          <div className="dtw-history__facts">
            <span>
              Rungs stamped <b>{rows.length}</b>
            </span>
            <span>
              Latest <b>{latest}</b>
            </span>
            <span>
              Chain{" "}
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
