/**
 * ranking page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

/**
 * Ranking.tsx — the ranking page of the stealhead Sol theme: the season
 * podium and the full ladder table. rows come from the root ranking
 * logic (typed DB accessor over HTTPS with the in-memory seed fallback);
 * the component carries no data.
 */
import { useEffect, useMemo, useState } from "react";
import { Trophy } from "lucide-react";
import { assignpositions, listranking, winrate, type RankingEntry } from "../../ranking.ts";
import { observeReveals } from "../../reveal";

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
      <header className="pagehead">
        <p className="eyebrow">ranking</p>
        <h1>the competitive ladder</h1>
        <p>
          The season ladder of the platform, sorted and positioned by the root ranking logic. The rows live in the site
          DB and reach this table over HTTPS — your machine stores nothing.
        </p>
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
                  squad {entry.squad} · {entry.region}
                </div>
                <div className="stat">
                  <span className="statlabel">season score</span>
                  <span className="statvalue">{entry.score}</span>
                </div>
              </article>
            ))}
          </div>
          <div className="tablewrap reveal">
            <table className="table ladder">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">player</th>
                  <th scope="col">squad</th>
                  <th scope="col">region</th>
                  <th scope="col">season</th>
                  <th scope="col">score</th>
                  <th scope="col">wins</th>
                  <th scope="col">matches</th>
                  <th scope="col">win rate</th>
                  <th scope="col">k/d</th>
                </tr>
              </thead>
              <tbody>
                {ladder.map((entry) => (
                  <tr key={entry.id}>
                    <td>#{entry.position}</td>
                    <td>
                      {entry.position === 1 ? <Trophy size={13} aria-label="season leader" /> : null} {entry.player}
                    </td>
                    <td>{entry.squad}</td>
                    <td>{entry.region}</td>
                    <td>{entry.season}</td>
                    <td>{entry.score}</td>
                    <td>{entry.wins}</td>
                    <td>{entry.matches}</td>
                    <td>{winrate(entry)}%</td>
                    <td>{entry.kd.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
