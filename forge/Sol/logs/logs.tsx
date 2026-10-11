/**
 * logs page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it mounts the page and is consumed only by the theme anchor (Sol/Sol.tsx).
 *
 * Logs — the seeded replay console of the forge, the third real platform
 * page: the console replays the lines the runner floor answered across the
 * ticks of a seed. The replay derives every line from the fleet rehearsal
 * (fleet.ts through logreplay.ts) and the copy says so — no live tail
 * claim, no invented streams. Every clock is tabular; every level carries
 * its color and its text.
 */

import { ListTree, ScrollText, TriangleAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { seedFleet } from "../../fleet.ts";
import { logreplay, REPLAY_SEEDS, replaycount } from "../../logreplay.ts";
import { EmptyState } from "../shell/EmptyState";

/** the fleet size of the replay (the same floor the runs page shows) */
const FLEET_SIZE = 8;
/** the lines the console keeps in view */
const REPLAY_KEEP = 40;

/** the readable label of a level */
const LEVEL_LABEL: Readonly<Record<"info" | "warn" | "error", string>> = {
  info: "info",
  warn: "warn",
  error: "error",
};

/** The logs page: the seeded replay console of the floor. */
export default function Logs() {
  const [seed, setSeed] = useState(REPLAY_SEEDS[0]);
  const [tick, setTick] = useState(12);
  const fleet = useMemo(() => seedFleet(seed, FLEET_SIZE), [seed]);
  const lines = useMemo(() => logreplay(fleet, seed, tick, REPLAY_KEEP), [fleet, seed, tick]);
  const counts = useMemo(() => replaycount(lines), [lines]);

  return (
    <main className="shell fl-page">
      <header className="pagehead">
        <p className="pagehead__eyebrow">logs · the seeded replay</p>
        <h1 className="pagehead__title">Console replay</h1>
        <p className="pagehead__lede">
          The console replays the lines the runner floor answered across the ticks of seed {seed}. The replay derives
          every line from the fleet rehearsal — nothing here claims a live tail.
        </p>
        <div className="pagehead__actions">
          <button type="button" className="btn" onClick={() => setTick((value) => value + 1)}>
            <ScrollText size={14} aria-hidden="true" />
            advance the replay
          </button>
        </div>
      </header>

      <section className="fl-console" aria-label="the replay console">
        <fieldset className="fl-seedrow">
          <legend className="fl-console__head">
            <ListTree size={12} aria-hidden="true" />
            the floor console — the replay seed
          </legend>
          {REPLAY_SEEDS.map((value) => (
            <button
              key={value}
              type="button"
              className="fl-seed"
              aria-pressed={value === seed}
              onClick={() => {
                setSeed(value);
                setTick(12);
              }}
            >
              seed {value}
            </button>
          ))}
        </fieldset>
        <dl className="fl-console__facts">
          <div className="fl-fact">
            <dt>lines</dt>
            <dd>{lines.length}</dd>
          </div>
          <div className="fl-fact">
            <dt>info</dt>
            <dd data-outcome="success">{counts.info}</dd>
          </div>
          <div className="fl-fact">
            <dt>warn</dt>
            <dd>{counts.warn}</dd>
          </div>
          <div className="fl-fact">
            <dt>error</dt>
            <dd data-outcome="failed">{counts.error}</dd>
          </div>
        </dl>

        {lines.length ? (
          <div className="fl-stream">
            <ol className="fl-stream__lines">
              {lines.map((line) => (
                <li key={`${line.clock} ${line.text}`} className="fl-line" data-level={line.level}>
                  <span className="fl-line__clock">{line.clock}</span>
                  <span className="fl-line__level">{LEVEL_LABEL[line.level]}</span>
                  <span className="fl-line__text">{line.text}</span>
                </li>
              ))}
            </ol>
            <p className="fl-stream__cursor">
              <TriangleAlert size={11} aria-hidden="true" /> the replay holds at tick {tick} — advance to extend it
            </p>
          </div>
        ) : (
          <EmptyState
            icon={ScrollText}
            title="the replay answered no lines yet"
            line="The seed produced no runner lines at this tick — advance the replay or pick another seed to extend the console."
          />
        )}
      </section>
    </main>
  );
}
