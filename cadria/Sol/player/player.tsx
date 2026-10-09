/**
 * player page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// # Player — the cinema instrument (campaign v3 · r3-cadria): the frame stays
// the dominant object with its halftone edge and film grain, and the transport
// lives on a machined rail below — rack keys with the .press scale, the
// progress bar with the ring-glow thumb and the tabular timecode — while the
// session reads back as hairline queue rows with the live-dot on now-playing.
// The timeline is the served mock (versawase defaults), the fullscreen button
// is the real API, and the format table stays.
import { useEffect, useRef, useState } from "react";
import { listPlayerFormats } from "../../catalog.ts";
import type { PlayerFormat } from "../../versawase.ts";
import { formatTimecode, playerDemo } from "../../versawase.ts";
import { type NavLink, Shell } from "../shell/Shell";
import { useToast } from "../toast/Toast";

const FOOTER_LINKS: readonly NavLink[] = [
  { label: "Player", href: "/player" },
  { label: "Studio", href: "/studio" },
  { label: "Gallery", href: "/gallery" },
  { label: "Settings", href: "/settings" },
];

const DEMO = playerDemo();

export default function Player() {
  const toast = useToast();
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [seconds, setSeconds] = useState(DEMO.startSeconds);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(DEMO.volumePercent);
  const [formats, setFormats] = useState<readonly PlayerFormat[]>([]);

  useEffect(() => {
    let live = true;
    listPlayerFormats().then((rows) => {
      if (live) setFormats(rows);
    });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setSeconds((current) => {
        const next = current + 1;
        if (next >= DEMO.durationSeconds) {
          setPlaying(false);
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [playing]);

  const togglePlaying = (): void => {
    setPlaying((current) => !current);
  };

  const toggleMute = (): void => {
    const next = volume === 0 ? DEMO.volumePercent : 0;
    setVolume(next);
    toast.show(next === 0 ? "Volume muted" : "Volume restored", "success");
  };

  const toggleFullscreen = (): void => {
    const frame = frameRef.current;
    if (!frame) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
      return;
    }
    frame.requestFullscreen?.().catch(() => toast.show("Fullscreen blocked by the browser", "error"));
  };

  const percent = (seconds / DEMO.durationSeconds) * 100;
  const timecode = `${formatTimecode(seconds)} / ${formatTimecode(DEMO.durationSeconds)}`;

  return (
    <Shell name="cadria" contained footerLinks={FOOTER_LINKS} domain="cadria.devthink.pro">
      <div className="stage-rail">
        <section className="stage-col">
          <p className="eyebrow reveal">cadria · player</p>
          <h1 className="reveal page-title">Player</h1>
          <p className="reveal lede">
            One frame for every format. cadria inherits the iukka universal player — 24 media extensions, file handlers,
            Web Share Target and an installable manifest with 11 icons. Press play: the timeline below is a live mock,
            the fullscreen button is real.
          </p>

          {/* THE FRAME — the one hero object of the window, transport machined below */}
          <div className="reveal frame-wrap halftone">
            <div className={`player-frame grain${playing ? " playing" : ""}`} id="frame" ref={frameRef}>
              <div className="pf-top" aria-hidden="true">
                <span className="pf-tc">hls · 1080p60</span>
                <span className="badge">preview</span>
              </div>
              <button
                className="pf-play"
                type="button"
                aria-label={playing ? "Pause preview" : "Play preview"}
                onClick={togglePlaying}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M7 4.5v15l13-7.5z" />
                </svg>
              </button>
            </div>

            {/* THE TRANSPORT RAIL — machined keys, ring-glow progress, tabular readouts */}
            <fieldset className="transport" aria-label="Transport controls">
              <button
                className="tkey"
                type="button"
                aria-label={playing ? "Pause preview" : "Play preview"}
                aria-pressed={playing}
                onClick={togglePlaying}
              >
                {playing ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
                    <rect x="6" y="4" width="4.4" height="16" rx="1.2" />
                    <rect x="13.6" y="4" width="4.4" height="16" rx="1.2" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
                    <polygon points="7 4 20 12 7 20 7 4" />
                  </svg>
                )}
              </button>
              <span className="pf-bar" aria-hidden="true">
                <span className="pf-fill" style={{ width: `${percent}%` }} />
                <span className="pf-knob" style={{ left: `${percent}%` }} />
              </span>
              <span className="pf-tc" style={{ minWidth: 92, textAlign: "center" }}>
                {timecode}
              </span>
              <span className="pf-vol">
                <button className="tkey tkey--ghost" type="button" aria-label="Mute volume" onClick={toggleMute}>
                  <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" fill="none" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                </button>
                <label className="pf-tc sr-only" htmlFor="vol">
                  Volume
                </label>
                <input
                  id="vol"
                  type="range"
                  min={0}
                  max={100}
                  value={volume}
                  onChange={(event) => setVolume(Number(event.target.value))}
                />
                <span className="pf-tc" style={{ minWidth: 38 }}>
                  {volume}%
                </span>
              </span>
              <button
                className="tkey tkey--ghost"
                type="button"
                aria-label="Toggle fullscreen"
                onClick={toggleFullscreen}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                  <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
                  <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                  <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
                </svg>
              </button>
            </fieldset>
            <p className="rail-note" style={{ marginTop: 12 }}>
              Mock controls: the knob walks a 161-second timeline, volume is cosmetic, fullscreen is the real API.
            </p>
          </div>
        </section>

        {/* SESSION RAIL — the readouts as hairline queue rows, the live-dot on now-playing */}
        <aside className="rail-col" aria-label="Player session">
          <div className="glass card rail-card reveal">
            <p className="eyebrow">now playing</p>
            <div className="rail-kv">
              <span>engine</span>
              <strong>hls · 1080p60</strong>
            </div>
            <div className="rail-kv">
              <span>timecode</span>
              <strong>{timecode}</strong>
            </div>
            <div className={`rail-kv${playing ? " is-live" : ""}`}>
              <span>{playing ? <span className="live-dot" aria-hidden="true" /> : null}state</span>
              <strong>{playing ? "playing" : "paused"}</strong>
            </div>
            <div className="rail-kv">
              <span>volume</span>
              <strong>{volume}%</strong>
            </div>
          </div>
          <div className="glass card rail-card reveal">
            <p className="eyebrow">session facts</p>
            <div className="rail-kv">
              <span>extensions</span>
              <strong>24 handled</strong>
            </div>
            <div className="rail-kv">
              <span>protocol</span>
              <strong>web+iukka</strong>
            </div>
            <div className="rail-kv">
              <span>share target</span>
              <strong>POST multipart</strong>
            </div>
            <div className="rail-kv">
              <span>fullscreen</span>
              <strong>real api</strong>
            </div>
          </div>
        </aside>
      </div>

      {/* FORMATS */}
      <section className="section section-frame" aria-labelledby="fmt-h">
        <div className="section-head">
          <p className="eyebrow reveal">supported formats</p>
          <h2 id="fmt-h" className="reveal h2-xl">
            Engines from the real manifest
          </h2>
          <p className="reveal">
            The player ships its decoders declared in <code>iukka/json/manifest.txt</code> and{" "}
            <code>iukka/json/package.txt</code> — 24 handled extensions, from broadcast streams to spreadsheets.
          </p>
        </div>
        <div className="glass card reveal" style={{ padding: 10 }}>
          <div className="scroll-x">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Format</th>
                  <th scope="col">Media</th>
                  <th scope="col">Engine</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {formats.map((format) => (
                  <tr key={format.format}>
                    <td>
                      <strong className="ink-strong">{format.format}</strong>
                    </td>
                    <td>{format.media}</td>
                    <td>
                      <span className={`badge${format.tone === "default" ? "" : ` ${format.tone}`}`}>
                        {format.engine}
                      </span>
                    </td>
                    <td>{format.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="reveal" style={{ marginTop: 14, fontSize: "0.85rem", color: "var(--sol-faint)" }}>
          Installed as a PWA, cadria also registers a <code>web+iukka</code> protocol handler and a POST multipart share
          target for video, audio and image — F-CAD-001..008, all shipped.
        </p>
      </section>
    </Shell>
  );
}
