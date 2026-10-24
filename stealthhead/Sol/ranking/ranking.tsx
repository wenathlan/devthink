/**
 * ranking page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

import { TrophyRegular as Trophy } from "@fluentui/react-icons";
// Ranking.tsx — the LADDER LEDGER (campaign v3 · r3-stealthhead): the podium
// keeps its three tiles (the leader raised, display-face rank numerals) and
// the ladder breaks into the asymmetric 1.6fr/1fr scoreboard — the dominant
// table (tabular figures, mono lowercase headers, signal leader wash) beside
// the season rail with the real ladder facts and the elo preview. Rows come
// from the root ranking logic (typed DB accessor over HTTPS with the
// in-memory seed fallback); the component carries no data.
import { useEffect, useMemo, useState } from "react";
import { assignpositions, listranking, type RankingEntry, winrate } from "../../ranking.ts";
import { type KBand, ratingdelta } from "../../rankingladder.ts";
import { labelfill, label } from "../../labels";
import { observeReveals } from "../../reveal";

/** the season k bands the preview renders with — a season tunes its ladder
 * by passing its own table (the score is the rating the bands speak in);
 * these are the documented defaults of the page. */
const SEASONKBANDS: KBand[] = [
  { minrating: 0, maxrating: 40000, k: 480 },
  { minrating: 40000, maxrating: Number.POSITIVE_INFINITY, k: 240 },
];

/** the rest of the season ladder config (ceiling, floor and scale). */
const SEASONLADDER = { maxdelta: 750, floorrating: 0, scale: 10000 };

/**
 * the ranking page.
 *
 * @returns the ranking element.
 */
export default function Ranking() {
  const [entries, setEntries] = useState<RankingEntry[] | null>(null);

  useEffect(() => {
    observeReveals();
    let live = true;
    listranking()
      .then((rows) => {
        if (live) setEntries(rows);
      })
      .catch(() => {
        if (live) setEntries([]);
      });
    return () => {
      live = false;
    };
  }, []);

  const ladder = useMemo(() => (entries ? assignpositions(entries) : null), [entries]);

  return (
    <>
      <header className="pagehead halftone grain">
        <p className="eyebrow">{label("ranking.eyebrow")}</p>
        <h1>{label("ranking.title")}</h1>
        <p>{label("ranking.lede")}</p>
      </header>
      {ladder === null ? (
        <div className="loadingrows" aria-busy="true">
          <div className="skeleton" />
          <div className="skeleton" />
          <div className="skeleton" />
        </div>
      ) : (
        <>
          <div className="podium">
            {ladder.slice(0, 3).map((entry) => (
              <article key={entry.id} className="glass glass-hover card podiumcard reveal">
                <span className="position">#{entry.position}</span>
                <div className="podiumplayer">{entry.player}</div>
                <div style={{ fontSize: "0.82rem", color: "var(--sol-muted)" }}>
                  {labelfill("ranking.card.squad", { squad: entry.squad, region: entry.region })}
                </div>
                <div className="stat">
                  <span className="statlabel">{label("ranking.card.scoreLabel")}</span>
                  <span className="statvalue">{entry.score}</span>
                </div>
              </article>
            ))}
          </div>
          {ladder.length >= 2 ? (
            <p className="mono rankrail__preview">
              {labelfill("ranking.preview", {
                player: ladder[1].player,
                delta: String(
                  ratingdelta(ladder[0].score, ladder[1].score, "win", { ...SEASONLADDER, ktable: SEASONKBANDS }),
                ),
              })}
            </p>
          ) : null}
          <div className="rankbody">
            <div className="tablewrap reveal">
              <table className="table ladder scoreboard">
                <thead>
                  <tr>
                    <th scope="col">{label("ranking.table.rank")}</th>
                    <th scope="col">{label("ranking.table.player")}</th>
                    <th scope="col">{label("ranking.table.squad")}</th>
                    <th scope="col">{label("ranking.table.region")}</th>
                    <th scope="col">{label("ranking.table.season")}</th>
                    <th scope="col">{label("ranking.table.score")}</th>
                    <th scope="col">{label("ranking.table.wins")}</th>
                    <th scope="col">{label("ranking.table.matches")}</th>
                    <th scope="col">{label("ranking.table.winrate")}</th>
                    <th scope="col">{label("ranking.table.kd")}</th>
                  </tr>
                </thead>
                <tbody>
                  {ladder.map((entry) => (
                    <tr key={entry.id}>
                      <td>#{entry.position}</td>
                      <td>
                        {entry.position === 1 ? (
                          <Trophy fontSize={13} aria-label={label("ranking.row.leaderAria")} />
                        ) : null}{" "}
                        {entry.player}
                      </td>
                      <td>{entry.squad}</td>
                      <td>{entry.region}</td>
                      <td>{entry.season}</td>
                      <td>{entry.score}</td>
                      <td>{entry.wins}</td>
                      <td>{entry.matches}</td>
                      <td>{labelfill("ranking.row.winrate", { rate: String(winrate(entry)) })}</td>
                      <td>{entry.kd.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <aside className="rankrail" aria-label={label("ranking.rail.aria")}>
              <div className="rankrail__block">
                <p className="eyebrow">{label("ranking.rail.facts")}</p>
                <div className="rankrail__rows">
                  <span>
                    <b>{label("ranking.rail.rows")}</b> {ladder.length}
                  </span>
                  <span>
                    <b>{label("ranking.rail.season")}</b> {ladder[0]?.season ?? "—"}
                  </span>
                  <span>
                    <b>{label("ranking.rail.regions")}</b> {new Set(ladder.map((entry) => entry.region)).size}
                  </span>
                  <span>
                    <b>{label("ranking.rail.squads")}</b> {new Set(ladder.map((entry) => entry.squad)).size}
                  </span>
                  <span>
                    <b>{label("ranking.rail.leader")}</b> {ladder[0]?.player ?? "—"}
                  </span>
                </div>
              </div>
              <div className="rankrail__block">
                <p className="eyebrow">{label("ranking.rail.answers")}</p>
                <p className="rankrail__note">{label("ranking.rail.note")}</p>
              </div>
            </aside>
          </div>
        </>
      )}
    </>
  );
}
