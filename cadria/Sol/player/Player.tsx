// # Player — sub-anchor of the player page: the big frame with a live mock timeline,
// the real fullscreen API, and the format table from the data layer.
import { useEffect, useRef, useState } from "react";
import { Shell, type NavLink } from "../Shell";
import { listPlayerFormats } from "../../catalog.ts";
import { formatTimecode, playerDemo } from "../../versawase.ts";
import type { PlayerFormat } from "../../versawase.ts";
import { useToast } from "../toast";

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
      <p className="eyebrow reveal">iukka player · pwa</p>
      <h1 className="reveal page-title">Player</h1>
      <p className="reveal lede" style={{ maxWidth: 620 }}>
        One frame for every format. cadria inherits the iukka universal player — 24 media extensions,
        file handlers, Web Share Target and an installable manifest with 11 icons. Press play: the
        timeline below is a live mock, the fullscreen button is real.
      </p>

      {/* BIG FRAME */}
      <div className="reveal frame-wrap">
        <div
          className={`player-frame${playing ? " playing" : ""}`}
          id="frame"
          ref={frameRef}
        >
          <div className="pf-top" aria-hidden="true">
            <span className="pf-tc">hls · 1080p60</span>
            <span className="badge">preview</span>
          </div>
          <button className="pf-play" type="button" aria-label={playing ? "Pause preview" : "Play preview"} onClick={togglePlaying}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5z" /></svg>
          </button>
          <div className="pf-controls">
            <button
              className="pf-btn"
              type="button"
              aria-label={playing ? "Pause preview" : "Play preview"}
              aria-pressed={playing}
              onClick={togglePlaying}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="7 4 20 12 7 20 7 4" fill="currentColor" stroke="none" /></svg>
            </button>
            <span className="pf-bar" aria-hidden="true">
              <span className="pf-fill" style={{ width: `${percent}%` }} />
              <span className="pf-knob" style={{ left: `${percent}%` }} />
            </span>
            <span className="pf-tc" style={{ minWidth: 92, textAlign: "center" }}>{timecode}</span>
            <span className="pf-vol">
              <button className="pf-btn" type="button" aria-label="Mute volume" onClick={toggleMute}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
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
              <span className="pf-tc" style={{ minWidth: 38 }}>{volume}%</span>
            </span>
            <button className="pf-btn" type="button" aria-label="Toggle fullscreen" onClick={toggleFullscreen}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
                <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
              </svg>
            </button>
          </div>
        </div>
        <p style={{ marginTop: 12, fontSize: "0.85rem", color: "var(--sol-faint)" }}>
          Mock controls: the knob walks a 161-second timeline, volume is cosmetic, fullscreen is the real API.
        </p>
      </div>

      {/* FORMATS */}
      <section className="section section-frame" aria-labelledby="fmt-h">
        <div className="section-head">
          <p className="eyebrow reveal">supported formats</p>
          <h2 id="fmt-h" className="reveal h2-xl">
            Engines from the real manifest
          </h2>
          <p className="reveal">
            The player ships its decoders declared in <code>iukka/json/manifest.txt</code> and <code>iukka/json/package.txt</code> — 24 handled extensions, from broadcast streams to spreadsheets.
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
                      <span className={`badge${format.tone === "default" ? "" : ` ${format.tone}`}`}>{format.engine}</span>
                    </td>
                    <td>{format.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="reveal" style={{ marginTop: 14, fontSize: "0.85rem", color: "var(--sol-faint)" }}>
          Installed as a PWA, cadria also registers a <code>web+iukka</code> protocol handler and a
          POST multipart share target for video, audio and image — F-CAD-001..008, all shipped.
        </p>
      </section>
    </Shell>
  );
}
