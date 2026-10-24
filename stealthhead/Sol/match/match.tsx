/**
 * match page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// Match.tsx — the SCOREBOARD LEDGER (campaign v3 · r3-stealthhead): every lobby
// is one dominant round-feed column beside the map rail (1.6fr/1fr), the seat
// table reads as a scoreboard (display-face rank numerals, tabular figures),
// the live lobby carries the pinging live dot and the round ledger rides a
// hairline progress meter. All rows still come from the root match logic.

import { TargetRegular as Crosshair, ArrowClockwiseRegular as RefreshCw } from "@fluentui/react-icons";
/**
 * Match.tsx — the match page of the stealthhead Sol theme: the lobby board
 * with the round table of every match and the live seat leaderboard. all
 * rows come from the root match logic (typed DB accessor over HTTPS with
 * the in-memory seed fallback); the component carries no data.
 */
import { useEffect, useState } from "react";
import {
  currentround,
  listmatches,
  listmatchplayers,
  type MatchLobby,
  type MatchPlayer,
  orderlobbies,
  roundcounts,
  seatleaderboard,
} from "../../match.ts";
import { nextactions, progressof } from "../../matchrules.ts";
import { labelfill, label } from "../../labels";
import { observeReveals } from "../../reveal";
import { toast } from "../toast/Toast.tsx";

/** one lobby card: rounds plus the ranked seats of the match. */
function LobbyCard({ lobby }: { lobby: MatchLobby }) {
  const [seats, setSeats] = useState<MatchPlayer[] | null>(null);
  const counts = roundcounts(lobby);
  const current = currentround(lobby);
  const actions = nextactions(lobby);
  const progress = progressof(lobby);

  useEffect(() => {
    let live = true;
    listmatchplayers(lobby.id)
      .then((rows) => {
        if (live) setSeats(seatleaderboard(rows));
      })
      .catch(() => {
        if (live) setSeats([]);
      });
    return () => {
      live = false;
    };
  }, [lobby.id]);

  return (
    <article className="glass glass-hover matchboard reveal">
      <div className="matchboard__feed">
        <div className="lobbyhead">
          <Crosshair fontSize={16} aria-hidden="true" />
          <h3>{lobby.title}</h3>
          <span
            className={`badge ${lobby.state === "live" ? "error" : lobby.state === "open" ? "success" : ""}`}
            data-tip={
              lobby.state === "live"
                ? label("match.state.tipLive")
                : lobby.state === "open"
                  ? label("match.state.tipOpen")
                  : label("match.state.tipClosed")
            }
          >
            {lobby.state === "live" ? <span className="dot livedot" aria-hidden="true" /> : null}
            {lobby.state}
          </span>
        </div>
        <p className="mono matchboard__meta">
          {labelfill("match.lobby.meta", {
            region: lobby.region,
            capacity: String(lobby.capacity),
            scored: String(counts.scored),
            live: String(counts.live),
            pending: String(counts.pending),
          })}
        </p>
        <ul className="roundlist">
          {lobby.rounds.map((round) => (
            <li key={round.id}>
              <span className="roundindex">r{round.index}</span>
              <span className="roundmap">{round.map}</span>
              <span
                className={`badge ${round.state === "live" ? "error" : round.state === "scored" ? "success" : "info"}`}
              >
                {round.state}
              </span>
              <span className="roundmode">{round.mode}</span>
            </li>
          ))}
        </ul>
        <div className="tablewrap">
          <table className="table scoreboard">
            <caption className="sr-only" style={{ display: "none" }}>
              {labelfill("match.seats.caption", { title: lobby.title })}
            </caption>
            <thead>
              <tr>
                <th scope="col">{label("match.table.seat")}</th>
                <th scope="col">{label("match.table.handle")}</th>
                <th scope="col">{label("match.table.squad")}</th>
                <th scope="col">{label("match.table.score")}</th>
                <th scope="col">{label("match.table.ping")}</th>
              </tr>
            </thead>
            <tbody>
              {seats === null ? (
                <tr>
                  <td colSpan={5}>
                    <span className="skeleton">{label("match.seats.loading")}</span>
                  </td>
                </tr>
              ) : (
                seats.map((seat, index) => (
                  <tr key={seat.id}>
                    <td>#{index + 1}</td>
                    <td>{seat.handle}</td>
                    <td>{seat.squad}</td>
                    <td>{seat.score}</td>
                    <td>{labelfill("match.row.ping", { ping: String(seat.ping) })}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <aside className="matchboard__rail">
        <div className="matchstat matchstat--live">
          <p className="eyebrow">{current ? label("match.rail.liveRound") : label("match.rail.roundTable")}</p>
          <h4 className="matchstat__map">{current ? current.map : label("match.rail.settled")}</h4>
          <p className="matchstat__mode">
            {current
              ? labelfill("match.rail.mode", { mode: current.mode, index: String(current.index) })
              : label("match.rail.settledNote")}
          </p>
        </div>
        <div className="matchstat">
          <p className="eyebrow">{label("match.rail.ledger")}</p>
          <div className="matchstat__rows">
            <span>
              <b>{label("match.ledger.scored")}</b> {counts.scored}
            </span>
            <span>
              <b>{label("match.ledger.live")}</b> {counts.live}
            </span>
            <span>
              <b>{label("match.ledger.pending")}</b> {counts.pending}
            </span>
            <span>
              <b>{label("match.ledger.capacity")}</b> {lobby.capacity}
            </span>
            <span>
              <b>{label("match.ledger.region")}</b> {lobby.region}
            </span>
          </div>
          <div className="shmeter shmeter--rail" role="img" aria-label={labelfill("match.rail.progressAria", { progress: String(progress) })}>
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="matchstat matchstat--next">
          <p className="eyebrow">{label("match.rail.next")}</p>
          <p className="matchstat__next">{actions.length > 0 ? actions.join(" · ") : label("match.rail.none")}</p>
        </div>
      </aside>
    </article>
  );
}

/**
 * the match page.
 *
 * @returns the match element.
 */
export default function Match() {
  const [lobbies, setLobbies] = useState<MatchLobby[] | null>(null);

  useEffect(() => {
    observeReveals();
    let live = true;
    listmatches()
      .then((rows) => {
        if (live) setLobbies(orderlobbies(rows));
      })
      .catch(() => {
        if (live) setLobbies([]);
      });
    return () => {
      live = false;
    };
  }, []);

  const reload = () => {
    setLobbies(null);
    listmatches()
      .then((rows) => {
        setLobbies(orderlobbies(rows));
        toast(label("match.toast.refreshed"), "success");
      })
      .catch(() => {
        setLobbies([]);
        toast(label("match.toast.failed"), "error");
      });
  };

  return (
    <>
      <header className="pagehead halftone grain">
        <p className="eyebrow">{label("match.eyebrow")}</p>
        <h1>{label("match.title")}</h1>
        <p>{label("match.lede")}</p>
        <div className="toolbar">
          <button
            type="button"
            className="btn secondary small"
            data-tip={label("match.refresh.tip")}
            onClick={reload}
          >
            <RefreshCw fontSize={14} aria-hidden="true" />
            {label("match.refresh")}
          </button>
        </div>
      </header>
      {lobbies === null ? (
        <div className="loadingrows" aria-busy="true">
          <div className="skeleton" />
          <div className="skeleton" />
          <div className="skeleton" />
        </div>
      ) : lobbies.length === 0 ? (
        <div className="glass card">
          <p style={{ margin: 0 }}>{label("match.empty")}</p>
        </div>
      ) : (
        <div className="lobbygrid">
          {lobbies.map((lobby) => (
            <LobbyCard key={lobby.id} lobby={lobby} />
          ))}
        </div>
      )}
    </>
  );
}
