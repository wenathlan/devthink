/**
 * studio page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// # Studio — the DAW (campaign v3 · r3-debonair): the FL Studio-grade console —
// the transport bar with play/stop/arm keys and the tabular-nums readouts, the
// playlist lanes over the served timeline (hairline seams, brass clip blocks),
// the channel rack (a 16-step gate row per track group, deterministic from the
// name, gold cells under the 2.4 s playhead sweep) and the vertical mixer
// strips with VU meters and ring-glow faders. Machined panels separated by
// 1px hairlines — the audio itself ships with the katexis engine, not with
// this mock.
import { type CSSProperties, useEffect, useMemo, useState } from "react";
import { listMixerStrips, listReadouts, listTimelineTracks } from "../../catalog.ts";
import type { MixerStripRow, ReadoutRow, TimelineTrack } from "../../katexis.ts";
import { formatDb } from "../../katexis.ts";
import { effectiveGainDb, graphFromStrips, type MixerGraph, patchChannel } from "../../mixergraph.ts";
import { type NavLink, Shell } from "../shell/Shell";
import { useToast } from "../toast/Toast";

const FOOTER_LINKS: readonly NavLink[] = [
  { label: "Generate", href: "/generate" },
  { label: "Library", href: "/library" },
  { label: "Settings", href: "/settings" },
];

/** steps per rack row */
const RACK_STEPS = 16;

/**
 * Gates one 16-step rack row from the track name: the same integer walk the
 * library sparkbar uses, so the pattern is deterministic presentation — a
 * downbeat always fires, the rest is the name's hash. No audio is implied.
 *
 * @param name the rack row name.
 * @returns the 16 gated cells of the row (step number, gate, downbeat flag).
 */
function rackSteps(name: string): { no: number; on: boolean; down: boolean }[] {
  let hash = 13;
  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 31 + name.charCodeAt(index)) % 9973;
  }
  const cells: { no: number; on: boolean; down: boolean }[] = [];
  for (let index = 0; index < RACK_STEPS; index += 1) {
    hash = (hash * 137 + 71) % 9973;
    cells.push({ no: index + 1, on: index % 4 === 0 || hash % 100 < 38, down: index % 4 === 0 });
  }
  return cells;
}

export default function Studio() {
  const toast = useToast();
  const [tracks, setTracks] = useState<readonly TimelineTrack[]>([]);
  const [strips, setStrips] = useState<readonly MixerStripRow[]>([]);
  const [readouts, setReadouts] = useState<readonly ReadoutRow[]>([]);
  const [faders, setFaders] = useState<Record<string, number>>({});
  const [mutes, setMutes] = useState<Record<string, boolean>>({});
  const [playing, setPlaying] = useState(false);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    let live = true;
    listTimelineTracks().then((rows) => {
      if (live) setTracks(rows);
    });
    listMixerStrips().then((rows) => {
      if (live) {
        setStrips(rows);
        setFaders(Object.fromEntries(rows.map((strip) => [strip.name, strip.faderDb])));
      }
    });
    listReadouts().then((rows) => {
      if (live) setReadouts(rows);
    });
    return () => {
      live = false;
    };
  }, []);

  const play = (): void => {
    setPlaying(true);
    toast.show("Studio demo is visual — the katexis audio engine is not wired to this mock", "info");
  };

  const stop = (): void => {
    setPlaying(false);
    toast.show("Transport stopped — nothing was playing (demo)", "info");
  };

  /** arms the record key (visual state only — the demo writes no audio) */
  const arm = (): void => {
    setArmed((value) => !value);
  };

  const setFader = (name: string, value: number): void => {
    setFaders((current) => ({ ...current, [name]: value }));
  };

  const toggleMute = (name: string): void => {
    setMutes((current) => ({ ...current, [name]: !current[name] }));
  };

  // the mixing graph state: the served strips become the desk, the page
  // faders and mutes ride on top, and the readout answers the effective gain
  // per strip (fader chained into the master bus, solo/mute rules applied).
  const desk = useMemo<MixerGraph | null>(() => {
    if (strips.length === 0) return null;
    try {
      const graph = graphFromStrips(strips);
      return graph.channels.reduce(
        (current, channel) =>
          patchChannel(current, channel.id, {
            gaindb: faders[channel.id] ?? channel.gaindb,
            mute: mutes[channel.id] ?? channel.mute,
          }),
        graph,
      );
    } catch {
      return null;
    }
  }, [strips, faders, mutes]);

  return (
    <Shell
      name="debonair"
      contained
      cta={{ label: "Generate a track", href: "/generate" }}
      footerLinks={FOOTER_LINKS}
      domain="devthink.pro"
    >
      <p className="eyebrow reveal">debonair · studio</p>
      <h1 className="reveal page-title">Studio</h1>
      <p className="reveal lede" style={{ maxWidth: 620 }}>
        The console: transport, playlist lanes, channel rack and the vertical mixer — machined panels, hairline seams,
        brass meters. The audio ships with the <code>katexis</code> engine, not with this mock.
      </p>

      {/* TRANSPORT — the keys and the tabular readouts */}
      <section className="transport rack-panel reveal" aria-label="Transport bar">
        <div className="group">
          <button className="tkey" type="button" aria-label="Play" aria-pressed={playing} onClick={play}>
            <svg
              className="svg"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polygon points="6 3 20 12 6 21 6 3" />
            </svg>
            Play
          </button>
          <button className="tkey" type="button" aria-label="Stop" onClick={stop}>
            <svg
              className="svg"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="5" y="5" width="14" height="14" rx="2" />
            </svg>
            Stop
          </button>
          <button className="tkey tkey--rec" type="button" aria-label="Arm record" aria-pressed={armed} onClick={arm}>
            <span className="rec-dot" aria-hidden="true" />
            Arm
          </button>
        </div>
        <div className="readouts">
          {readouts.map((readout) => (
            <div key={readout.label} className="readout">
              <span className="lbl">{readout.label}</span>
              <span className="val">{readout.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* the asymmetric stage: the playlist rides wide, the mixer stacks as a
          rail — never a uniform card grid */}
      <div className="stage-asym">
        <section className="daw rack-panel reveal" aria-label="Arrangement playlist">
          <div className="tl-scroll">
            <div className="tl-inner">
              <div className="tl-ruler" aria-hidden="true">
                <span />
                <div className="lane">
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                  <span>5</span>
                  <span>6</span>
                  <span>7</span>
                  <span>8</span>
                </div>
              </div>
              <div className="tl-canvas">
                {tracks.map((track) => (
                  <div key={track.name} className="tl-row">
                    <div className="tl-label">
                      <b>{track.name}</b>
                      <small>{track.sound}</small>
                    </div>
                    <div className="tl-lane">
                      {track.clips.map((clip) => (
                        <span
                          key={`${track.name}-${clip.label}`}
                          className={`clip ${track.colorClass}`}
                          style={{ left: `${clip.leftPercent}%`, width: `${clip.widthPercent}%` }}
                        >
                          {clip.label}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="playhead" aria-hidden="true" />
              </div>
            </div>
          </div>
        </section>

        {/* MIXER — vertical strips: fader, VU, mute key, dB readout */}
        <section className="mixer reveal" aria-label="Mixer">
          {strips.map((strip) => {
            const muted = mutes[strip.name] ?? false;
            const effective = desk ? effectiveGainDb(desk, strip.name) : (faders[strip.name] ?? strip.faderDb);
            return (
              <div key={strip.name} className={`strip${strip.master ? " master" : ""}`}>
                <h3>{strip.name}</h3>
                <button
                  type="button"
                  className={`btn small ${muted ? "danger" : "secondary"}`}
                  aria-pressed={muted}
                  aria-label={`${strip.name} mute`}
                  onClick={() => toggleMute(strip.name)}
                >
                  {muted ? "muted" : "mute"}
                </button>
                <div className="strip-stage">
                  <div className="fader-box">
                    <input
                      className="fader"
                      type="range"
                      min={-24}
                      max={0}
                      step={0.5}
                      value={faders[strip.name] ?? strip.faderDb}
                      onChange={(event) => setFader(strip.name, Number(event.target.value))}
                      aria-label={`${strip.name} volume fader`}
                    />
                  </div>
                  <div
                    className="vu"
                    role="img"
                    aria-label={`${strip.name} level meter at ${strip.meterPercent} percent`}
                  >
                    <i style={{ "--m": `${strip.meterPercent}%` } as CSSProperties} />
                  </div>
                </div>
                <p className="db">{effective === Number.NEGATIVE_INFINITY ? "muted" : formatDb(effective)}</p>
              </div>
            );
          })}
        </section>
      </div>

      {/* CHANNEL RACK — rows × 16 steps, gold cells, playhead sweep */}
      <section className="rack rack-panel reveal" aria-label="Channel rack">
        <header className="rack-head">
          <h2 className="rack-title">channel rack</h2>
          <span className="rack-meta">16 steps per row · 2.4 s sweep</span>
        </header>
        <div>
          {tracks.map((track) => (
            <div key={track.name} className="rack-row">
              <span className="rack-name">{track.name}</span>
              <div className="rack-cells" aria-hidden="true">
                {rackSteps(track.name).map((cell) => (
                  <span
                    key={`step-${cell.no}`}
                    className={cell.on ? "step on" : "step"}
                    data-beat={cell.down ? "true" : undefined}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rack-panel scope-note reveal" style={{ maxWidth: 640 }}>
        <h2 className="card-h">Demo scope</h2>
        <p className="flush">
          The transport, playlist, rack and mixer are static renders — no audio context is created on this page. The
          rack gates are drawn from the track names, one deterministic pattern per row. Generation, playback and export
          arrive with the <code>katexis</code> engine integration (F-DBN-006, F-DBN-014).
        </p>
      </section>
    </Shell>
  );
}
