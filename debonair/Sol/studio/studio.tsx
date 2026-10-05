/**
 * studio page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// # Studio — sub-anchor of the studio page: transport bar, arrangement timeline and
// mixer, every row served by the data layer. A visual slice of the DAW — no audio
// context is created here.
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Shell, type NavLink } from "../shell/Shell";
import { listMixerStrips, listReadouts, listTimelineTracks } from "../../catalog.ts";
import { formatDb } from "../../katexis.ts";
import type { MixerStripRow, ReadoutRow, TimelineTrack } from "../../katexis.ts";
import { effectiveGainDb, graphFromStrips, patchChannel, type MixerGraph } from "../../mixer.graph.ts";
import { useToast } from "../toast/Toast";

const FOOTER_LINKS: readonly NavLink[] = [
  { label: "Generate", href: "/generate" },
  { label: "Library", href: "/library" },
  { label: "Settings", href: "/settings" },
];

export default function Studio() {
  const toast = useToast();
  const [tracks, setTracks] = useState<readonly TimelineTrack[]>([]);
  const [strips, setStrips] = useState<readonly MixerStripRow[]>([]);
  const [readouts, setReadouts] = useState<readonly ReadoutRow[]>([]);
  const [faders, setFaders] = useState<Record<string, number>>({});
  const [mutes, setMutes] = useState<Record<string, boolean>>({});

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
    toast.show("Studio demo is visual — the katexis audio engine is not wired to this mock", "info");
  };

  const stop = (): void => {
    toast.show("Transport stopped — nothing was playing (demo)", "info");
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
      <p className="eyebrow reveal">studio · katexis engine</p>
      <h1 className="reveal page-title">Studio</h1>
      <p className="reveal lede" style={{ maxWidth: 620 }}>
        A visual slice of the DAW: four track groups on the timeline, a mixer with per-channel faders and the transport. Every pixel obeys the sol theme — the audio itself ships with the <code>katexis</code> engine, not with this mock.
      </p>

      {/* TRANSPORT */}
      <section className="transport reveal" aria-label="Transport bar">
        <div className="group">
          <button className="btn" type="button" aria-label="Play" onClick={play}>
            <svg className="svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="6 3 20 12 6 21 6 3" />
            </svg>
            Play
          </button>
          <button className="btn secondary" type="button" aria-label="Stop" onClick={stop}>
            <svg className="svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="5" y="5" width="14" height="14" rx="2" />
            </svg>
            Stop
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

      {/* TIMELINE */}
      <section className="daw reveal" aria-label="Arrangement timeline">
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

        {/* MIXER */}
        <section className="mixer" aria-label="Mixer">
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
                <div className="meter" role="img" aria-label={`${strip.name} level meter at ${strip.meterPercent} percent`}>
                  <i style={{ "--m": `${strip.meterPercent}%` } as CSSProperties} />
                </div>
                <input
                  type="range"
                  min={-24}
                  max={0}
                  step={0.5}
                  value={faders[strip.name] ?? strip.faderDb}
                  onChange={(event) => setFader(strip.name, Number(event.target.value))}
                  aria-label={`${strip.name} volume fader`}
                />
                <p className="db">{effective === Number.NEGATIVE_INFINITY ? "muted" : formatDb(effective)}</p>
              </div>
            );
          })}
        </section>
      </section>

      <section className="glass card reveal mt-18" style={{ maxWidth: 640 }}>
        <h2 className="card-h">Demo scope</h2>
        <p className="flush">
          The timeline, mixer and transport are static renders — no audio context is created on this page. Generation, playback and export arrive with the <code>katexis</code> engine integration (F-DBN-006, F-DBN-014).
        </p>
      </section>
    </Shell>
  );
}
