/**
 * match page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

import { Crosshair, RefreshCw } from "lucide-react";
/**
 * Match.tsx — the match page of the stealhead Sol theme: the lobby board
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
import { nextactions } from "../../matchrules.ts";
import { observeReveals } from "../../reveal";
import { toast } from "../toast/Toast";

/** one lobby card: rounds plus the ranked seats of the match. */
function LobbyCard({ lobby }: { lobby: MatchLobby }) {
  const [seats, setSeats] = useState<MatchPlayer[] | null>(null);
  const counts = roundcounts(lobby);
  const current = currentround(lobby);
  const actions = nextactions(lobby);

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
          <Crosshair size={16} aria-hidden="true" />
          <h3>{lobby.title}</h3>
          <span
            className={`badge ${lobby.state === "live" ? "error" : lobby.state === "open" ? "success" : ""}`}
            title={
              lobby.state === "live"
                ? "the match is running now"
                : lobby.state === "open"
                  ? "seats are open"
                  : "the lobby is closed"
            }
          >
            {lobby.state === "live" ? <span className="dot" aria-hidden="true" /> : null}
            {lobby.state}
          </span>
        </div>
        <p className="mono matchboard__meta">
          {lobby.region} · capacity {lobby.capacity} · rounds {counts.scored} scored / {counts.live} live /{" "}
          {counts.pending} pending
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
          <table className="table">
            <caption className="sr-only" style={{ display: "none" }}>
              seats of {lobby.title}
            </caption>
            <thead>
              <tr>
                <th scope="col">seat</th>
                <th scope="col">handle</th>
                <th scope="col">squad</th>
                <th scope="col">score</th>
                <th scope="col">ping</th>
              </tr>
            </thead>
            <tbody>
              {seats === null ? (
                <tr>
                  <td colSpan={5}>
                    <span className="skeleton">loading seats</span>
                  </td>
                </tr>
              ) : (
                seats.map((seat, index) => (
                  <tr key={seat.id}>
                    <td>#{index + 1}</td>
                    <td>{seat.handle}</td>
                    <td>{seat.squad}</td>
                    <td>{seat.score}</td>
                    <td>{seat.ping} ms</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <aside className="matchboard__rail">
        <div className="matchstat matchstat--live">
          <p className="eyebrow">{current ? "live round" : "round table"}</p>
          <h4 className="matchstat__map">{current ? current.map : "settled"}</h4>
          <p className="matchstat__mode">
            {current ? `${current.mode} · r${current.index}` : "every round of this lobby is scored."}
          </p>
        </div>
        <div className="matchstat">
          <p className="eyebrow">round ledger</p>
          <div className="matchstat__rows">
            <span>
              <b>scored</b> {counts.scored}
            </span>
            <span>
              <b>live</b> {counts.live}
            </span>
            <span>
              <b>pending</b> {counts.pending}
            </span>
            <span>
              <b>capacity</b> {lobby.capacity}
            </span>
            <span>
              <b>region</b> {lobby.region}
            </span>
          </div>
        </div>
        <div className="matchstat matchstat--next">
          <p className="eyebrow">next actions</p>
          <p className="matchstat__next">{actions.length > 0 ? actions.join(" · ") : "none — the lobby is settled"}</p>
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
        toast("lobby board refreshed from the site DB", "success");
      })
      .catch(() => {
        setLobbies([]);
        toast("the site DB did not answer; the seed stays on", "error");
      });
  };

  return (
    <>
      <header className="pagehead halftone grain">
        <p className="eyebrow">stealhead · match</p>
        <h1>match lobby and round table</h1>
        <p>
          Every running match of the platform: lobbies with their round tables and the live seat leaderboard. Rows are
          served by the site DB over HTTPS — the interface stores nothing on your machine.
        </p>
        <div className="toolbar">
          <button
            type="button"
            className="btn secondary small"
            title="refetch the lobby rows from the site db over https"
            onClick={reload}
          >
            <RefreshCw size={14} aria-hidden="true" />
            refresh the board
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
          <p style={{ margin: 0 }}>No match is seated right now. The board answers as soon as the DB serves one.</p>
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
