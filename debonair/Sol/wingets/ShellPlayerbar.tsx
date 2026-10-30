/**
 * Playerbar.tsx — the loose component of the shell chrome: the bottom bar
 * the suno.com grammar lends the family — cover, title, artist line, the
 * seek lane with the live clock and the play/pause/next keys — fed by the
 * one shared transport of playerbus.ts. The shelf is a grammar union: the
 * generated takes and the ingested references ride the same bar, the row
 * shape deciding the identity line (the genre line or the reference line).
 * The bar is chrome: it wears the
 * acrylic (rgb(32 32 32 / 75%) + saturate(3) blur(20px), always paired with
 * -webkit-), never the app accent; its CTA (the running play key) is the one
 * bar surface the windows accent may fill. Every number is the engine's: the
 * clock and the lane ride the same rAF snapshots the studio reads.
 */

import { NextRegular, PauseRegular, PlayFilled } from "@fluentui/react-icons";
import { type CSSProperties, useEffect, useState } from "react";
import { Link } from "wouter";
import { formatClock } from "../../dawview.ts";
import { label, labelfill } from "../../labels.ts";
import {
  type BusTake,
  busPause,
  busPlay,
  busSeek,
  busSelect,
  busSubscribe,
  isReferenceTake,
  type PlayerSnapshot,
} from "../../playerbus.ts";
import { CoverArt } from "./HomeCoverart.tsx";

/**
 * Playerbar — the fixed bottom bar of the application window.
 *
 * @returns the bar element, or null before the shelf arms.
 */
export function Playerbar() {
  const [view, setView] = useState<PlayerSnapshot | null>(null);

  useEffect(() => busSubscribe(setView), []);

  if (!view || view.takes.length === 0) return null;
  const current: BusTake | undefined = view.takes[view.index];
  if (!current) return null;
  const progress = view.duration > 0 ? Math.min(100, (view.position / view.duration) * 100) : 0;
  // the row shape decides by kind: a generated take answers the genre line,
  // a rendered wav answers the render line, an ingested reference answers
  // the blob line — the same bar either way
  const artist = isReferenceTake(current)
    ? labelfill(current.origin === "render" ? "shell.playerbar.renderLine" : "shell.playerbar.referenceLine", {
        mime: current.source.mime.replace("audio/", ""),
        clock: formatClock(view.duration),
      })
    : `${current.genreLabel} · ${current.keyLabel} · ${current.bpm} bpm`;
  const openHref = isReferenceTake(current) ? "/ingest" : "/studio";
  const openTitle = isReferenceTake(current)
    ? labelfill("shell.playerbar.openBenchTitle", { name: current.name })
    : labelfill("shell.playerbar.openTitle", { name: current.name });

  return (
    <aside
      className="playerbar"
      aria-label={label("shell.playerbar.aria")}
      data-playing={view.playing ? "true" : undefined}
    >
      <Link className="pbar-identity" href={openHref} title={openTitle}>
        <span className="pbar-cover" aria-hidden="true">
          <CoverArt name={current.name} />
        </span>
        <span className="pbar-main">
          <span className="pbar-title">{current.name}</span>
          <span className="pbar-artist">{artist}</span>
        </span>
      </Link>
      <div className="pbar-transport">
        <div className="pbar-lane">
          <input
            className="pbar-seek"
            type="range"
            min={0}
            max={view.duration}
            step={0.1}
            value={Math.min(view.position, view.duration)}
            onChange={(event) => busSeek(Number(event.currentTarget.value))}
            aria-label={labelfill("shell.playerbar.seekAria", { name: current.name })}
            style={{ "--p": `${progress}%` } as CSSProperties}
          />
          <span className="pbar-clock">{formatClock(view.position)}</span>
        </div>
      </div>
      <div className="pbar-keys">
        <button
          type="button"
          className={`pkey${view.playing ? " pkey--cta" : ""}`}
          aria-label={view.playing ? label("shell.playerbar.pause") : label("shell.playerbar.play")}
          aria-pressed={view.playing}
          title={
            view.notice || (view.playing ? label("shell.playerbar.pauseTitle") : label("shell.playerbar.playTitle"))
          }
          onClick={() => {
            if (view.playing) busPause();
            else {
              busSelect(current.id);
              busPlay(view.position);
            }
          }}
        >
          {view.playing ? (
            <PauseRegular fontSize={16} aria-hidden="true" />
          ) : (
            <PlayFilled fontSize={16} aria-hidden="true" />
          )}
        </button>
        <button
          type="button"
          className="pkey"
          aria-label={label("shell.playerbar.next")}
          title={label("shell.playerbar.next")}
          onClick={() => busSelect()}
        >
          <NextRegular fontSize={16} aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}

export default Playerbar;
