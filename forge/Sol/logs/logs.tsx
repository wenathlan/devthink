/**
 * logs page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it mounts the page and is consumed only by the theme anchor (Sol/Sol.tsx).
 *
 * Logs — the live tail of a run, replayed deterministically: one integer
 * seed unrolls the whole line stream (runstream.ts), the player walks it
 * on a timer, prefers-reduced-motion renders the full stream at once. The
 * stream says what it is: a seeded replay of a run on the saddle engine
 * boundary — never a live floor tail. Clocks, census and outcome are
 * tabular and pinned by the tests.
 */

import { Pause, Play, RotateCcw, Terminal } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  formatLogTime,
  linesWithin,
  logCensus,
  logDuration,
  logOutcome,
  logText,
  runLogLines,
} from "../../runstream.ts";
import { EmptyState } from "../shell/EmptyState";

/** the seed of the replayed run (shown on the page, pinned by the tests) */
export const LOG_SEED = 421337;
/** the replay cadence: the wall clock multiplier over the run clock */
const PLAY_MS = 120;

/** the seeds the page offers as one-click replays (stable, memorable) */
const PRESET_SEEDS: readonly number[] = [421337, 90012, 5124, 77031];

/** The logs page: the deterministic replay of one run. */
export default function Logs() {
  const [seed, setSeed] = useState(LOG_SEED);
  const [playing, setPlaying] = useState(true);
  const [clock, setClock] = useState(0);
  const timer = useRef<number | null>(null);

  const lines = useMemo(() => runLogLines(seed), [seed]);
  const duration = useMemo(() => logDuration(lines), [lines]);
  const visible = useMemo(() => linesWithin(lines, clock), [lines, clock]);
  const outcome = useMemo(() => logOutcome(lines), [lines]);
  const census = useMemo(() => logCensus(visible), [visible]);
  const done = clock >= duration;

  /** the replay clock: one interval tick advances the run clock; reduced
   * motion never starts the timer (the full stream renders at once). */
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setClock(duration);
      return;
    }
    if (!playing) return;
    timer.current = window.setInterval(() => {
      setClock((value) => Math.min(duration, value + 180));
    }, PLAY_MS);
    return () => {
      if (timer.current !== null) window.clearInterval(timer.current);
    };
  }, [playing, duration]);

  /** restarts the replay from zero on the current seed */
  function replay() {
    setClock(0);
    setPlaying(true);
  }

  return (
    <main className="shell fl-page">
      <header className="pagehead">
        <p className="pagehead__eyebrow">logs · the run evidence</p>
        <h1 className="pagehead__title">Logs ao vivo — a seeded replay</h1>
        <p className="pagehead__lede">
          One run of the floor, replayed line by line from seed {seed} — the same seed always answers the same stream,
          in the browser and in the tests. Outcome and evidence stay beside the runner.
        </p>
        <div className="pagehead__actions">
          <button
            type="button"
            className="btn"
            onClick={() => (done ? replay() : setPlaying((value) => !value))}
            aria-pressed={playing && !done}
          >
            {done ? (
              <RotateCcw size={14} aria-hidden="true" />
            ) : playing ? (
              <Pause size={14} aria-hidden="true" />
            ) : (
              <Play size={14} aria-hidden="true" />
            )}
            {done ? "replay the run" : playing ? "pause the tail" : "resume the tail"}
          </button>
          <button type="button" className="btn secondary" onClick={replay}>
            <RotateCcw size={14} aria-hidden="true" />
            restart from zero
          </button>
        </div>
      </header>

      <section className="fl-console" aria-label="the replay controls">
        <div className="fl-console__seeds">
          <p className="fl-console__head">
            <Terminal size={13} aria-hidden="true" />
            seeds
          </p>
          <div className="fl-seedrow">
            {PRESET_SEEDS.map((preset) => (
              <button
                key={preset}
                type="button"
                className="fl-seed"
                aria-pressed={preset === seed}
                onClick={() => {
                  setSeed(preset);
                  setClock(0);
                  setPlaying(true);
                }}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
        <dl className="fl-console__facts">
          <div className="fl-fact">
            <dt>run clock</dt>
            <dd>
              {formatLogTime(clock)} / {formatLogTime(duration)}
            </dd>
          </div>
          <div className="fl-fact">
            <dt>lines</dt>
            <dd>
              {visible.length} / {lines.length}
            </dd>
          </div>
          <div className="fl-fact">
            <dt>census</dt>
            <dd>
              {census.info} info · {census.warn} warn · {census.error} error
            </dd>
          </div>
          <div className="fl-fact">
            <dt>outcome</dt>
            <dd data-outcome={outcome}>{outcome}</dd>
          </div>
        </dl>
      </section>

      {lines.length === 0 ? (
        <EmptyState
          icon={Terminal}
          title="no stream for this seed"
          line="The replay engine answered nothing — pick one of the preset seeds to roll a run."
        />
      ) : (
        <section className="fl-stream" aria-label="the log stream" aria-live="polite">
          <div className="fl-stream__head" aria-hidden="true">
            <span>clock</span>
            <span>level</span>
            <span>line</span>
          </div>
          <ol className="fl-stream__lines">
            {visible.map((line) => (
              <li key={`${line.t}-${line.text}`} className="fl-line" data-level={line.level}>
                <span className="fl-line__clock">{formatLogTime(line.t)}</span>
                <span className="fl-line__level">{line.level}</span>
                <span className="fl-line__text">{line.text}</span>
              </li>
            ))}
          </ol>
          <p className="fl-stream__cursor" data-done={done ? "true" : "false"}>
            {done ? "— end of stream — outcome reported over https" : "— tailing —"}
          </p>
        </section>
      )}

      <p className="fr-footnote">
        the copyable form of the stream rides the same engine: logText(seed) — {logText(lines).split("\n").length} lines
        total for seed {seed}.
      </p>
    </main>
  );
}
