/**
 * player page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

import { ArrowLeftRegular } from "@fluentui/react-icons";
// # Player — the artwork viewer (design doctrine pass): one ?id= off the url
// renders the gateway's stored frame large; without an id the page falls
// back to the in-session demo — the REAL engine chain over the built-in
// fixtures, computed fresh, nothing stored. the demo frame plays its motion
// loop: one keyframe of synthMotion per beat through
// renderKeyframePerturbation (reduced motion — the os media query or the
// settings session override — holds the static frame). the side rail reads
// the analysis back: bpm, key, shape, seed. prev/next walk the source list;
// the gateway serves frames as svg only, so gateway frames say so and stay
// static — the honest note, never a simulated loop.
// the anchor renders BARE: the one Shell chrome lives in Sol/Sol.tsx.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { type AnalysisReport, analyzePcm, reportDigest } from "../../audiopipeline.ts";
import {
  fetchGatewayRender,
  GatewayClientError,
  type GatewayProject,
  listGatewayProjects,
} from "../../gatewayclient.ts";
import { type RenderFrame, renderCommands, renderKeyframePerturbation, renderSvg } from "../../imagerender.ts";
import { type DemoFixtureId, demoFixtures } from "../../introfixtures.ts";
import { label } from "../../labels.ts";
import { compositionBlocks, rhythmScatter } from "../../synthcomposition.ts";
import { type MotionSpec, synthMotion } from "../../synthmotion.ts";
import { synthPalette } from "../../synthpalette.ts";
import { synthTexture } from "../../synthtexture.ts";
import {
  attachdecode,
  type DecodeSession,
  type DecodeSnapshot,
  disposedecode,
  opendecode,
  pausedecode,
  playdecode,
  polldecode,
  ratelabel,
  stepdecode,
  timecodelabel,
} from "../../videodecode.ts";

/** the demo canvas the in-session fallback renders at (px). */
const DEMO_CANVAS = 640;

/** the fixture order the demo fallback walks. */
const FIXTURE_ORDER: readonly DemoFixtureId[] = ["glass", "static", "pulse"];

/** rescales an engine svg to its panel and hides it from the a11y tree (the wrapper carries the label). */
function fitArtSvg(svg: string): string {
  return svg.replace("<svg ", '<svg aria-hidden="true" style="width:100%;height:auto;display:block" ');
}

/** the engine svg mounted into the frame panel — the ONE documented injection
 * point of the theme (the serializer's own deterministic output, no user input). */
function ArtFrame({ svg }: { svg: string }) {
  return (
    // biome-ignore lint/security/noDangerouslySetInnerHtml: engine serializer output (deterministic IR, hex-guarded colors, no user input) — the documented injection point, as on the intro demo
    <div style={{ width: "100%", lineHeight: 0 }} dangerouslySetInnerHTML={{ __html: fitArtSvg(svg) }} />
  );
}

/** the reduce check every js-driven beat consults: the settings session override beside the os media query. */
function motionHeld(): boolean {
  return (
    document.documentElement.dataset.reduceMotion === "true" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** the key name the rail reads back (the same pitch table reportDigest uses). */
const NOTE_NAMES: readonly string[] = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"];

function keyName(report: AnalysisReport): string {
  const tonic = Math.min(11, Math.max(0, Math.round(report.harmonic.key.tonic)));
  return `${NOTE_NAMES[tonic]} ${report.harmonic.key.mode}`;
}

/** the real chain over one fixture: analyze → render commands → motion spec. */
function computeDemo(fixtureId: DemoFixtureId): { report: AnalysisReport; frame: RenderFrame; motion: MotionSpec } {
  const fixture = demoFixtures().find((entry) => entry.id === fixtureId);
  if (!fixture) throw new Error(`no such fixture: ${fixtureId}`);
  const report = analyzePcm(fixture.samples, fixture.sampleRate, 1);
  const descriptor = report.descriptor;
  const frame = renderCommands({
    seed: descriptor.seed,
    palette: synthPalette(descriptor),
    blocks: rhythmScatter(descriptor, compositionBlocks(descriptor)),
    texture: synthTexture(descriptor),
    canvas: { width: DEMO_CANVAS, height: DEMO_CANVAS },
  });
  return { report, frame, motion: synthMotion(descriptor) };
}

/** the source the viewer holds. */
type Source =
  | { kind: "demo"; fixture: DemoFixtureId; report: AnalysisReport; frame: RenderFrame; motion: MotionSpec }
  | { kind: "gateway"; id: string; svg: string; record: GatewayProject; ids: readonly string[] }
  | { kind: "video"; name: string; session: DecodeSession };

/** one beat: the base commands perturbed by the beat's keyframe (never mutating). */
function beatCommands(frame: RenderFrame, motion: MotionSpec, beat: number): RenderFrame["commands"] {
  if (motion.keyframes.length === 0) return frame.commands;
  const keyframe = motion.keyframes[beat % motion.keyframes.length];
  return renderKeyframePerturbation(frame.commands, keyframe, motion.pulseScale);
}

export default function Player() {
  const search = useSearch();
  const [, navigate] = useLocation();
  const requestedId = useMemo(() => new URLSearchParams(search).get("id"), [search]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [source, setSource] = useState<Source | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [fixture, setFixture] = useState<DemoFixtureId>("pulse");
  const [playing, setPlaying] = useState(true);
  const [beat, setBeat] = useState(0);
  const [_reload, setReload] = useState(0);
  const computeTimer = useRef<number | null>(null);
  const [videoSnap, setVideoSnap] = useState<DecodeSnapshot | null>(null);
  const [videoNote, setVideoNote] = useState<string | null>(null);
  const frameHolder = useRef<HTMLDivElement | null>(null);

  /** opens a local file as a frame-accurate decode session; refusals land in the note, never a throw. */
  const loadVideo = useCallback(async (file: File) => {
    setVideoNote(null);
    setVideoSnap(null);
    const opened = await opendecode(file, { muted: false });
    if (!opened.ok) {
      setVideoNote(
        label("player.decoderRefused").replace("{name}", file.name).replace("{detail}", opened.issue.detail),
      );
      return;
    }
    setSource({ kind: "video", name: file.name, session: opened.value });
    setMessage(null);
    setStatus("ready");
  }, []);

  /** loads the source: the gateway render for an id, the in-session demo otherwise. */
  useEffect(() => {
    let live = true;
    if (computeTimer.current !== null) window.clearTimeout(computeTimer.current);
    setStatus("loading");
    setSource(null);
    setMessage(null);
    setBeat(0);
    if (requestedId) {
      listGatewayProjects(200)
        .then(async (rows) => {
          if (!live) return;
          const record = rows.find((row) => row.id === requestedId);
          if (!record) throw new Error(`this render is not in the gateway's list — ${requestedId}`);
          const svg = await fetchGatewayRender(requestedId);
          if (!live) return;
          setSource({ kind: "gateway", id: requestedId, svg, record, ids: rows.map((row) => row.id) });
          setStatus("ready");
        })
        .catch((error: unknown) => {
          if (!live) return;
          const offline = error instanceof GatewayClientError && error.status === 0;
          setMessage(
            offline
              ? label("player.offlineError")
              : error instanceof Error
                ? error.message
                : label("player.refusedError"),
          );
          setStatus("error");
        });
    } else {
      // the session fallback: the real engine chain over the built-in fixtures — computed fresh, nothing stored
      computeTimer.current = window.setTimeout(
        () => {
          computeTimer.current = null;
          if (!live) return;
          try {
            const demo = computeDemo(fixture);
            setSource({ kind: "demo", fixture, ...demo });
            setStatus("ready");
          } catch (error) {
            setMessage(error instanceof Error ? error.message : label("player.demoRefused"));
            setStatus("error");
          }
        },
        motionHeld() ? 0 : 120,
      );
    }
    return () => {
      live = false;
      if (computeTimer.current !== null) {
        window.clearTimeout(computeTimer.current);
        computeTimer.current = null;
      }
    };
  }, [requestedId, fixture]);

  /** the beat clock: one keyframe per loop under play; reduced motion never starts it. */
  useEffect(() => {
    if (source?.kind !== "demo" || !playing || motionHeld()) return;
    if (source.motion.keyframes.length === 0) return;
    const timer = window.setInterval(
      () => setBeat((value) => value + 1),
      Math.max(120, Math.round(source.motion.loopMs)),
    );
    return () => window.clearInterval(timer);
  }, [source, playing]);

  /** the video arm: attach the session's element into the frame holder; leaving the source releases the whole session. */
  useEffect(() => {
    if (source?.kind !== "video") return;
    const holder = frameHolder.current;
    if (holder) attachdecode(source.session, holder);
    return () => {
      disposedecode(source.session);
    };
  }, [source]);

  /** the video clock: one poll per beat of the UI (100 ms) — the element stays the only truth. */
  useEffect(() => {
    if (source?.kind !== "video") return;
    let live = true;
    const tick = () => {
      if (live) setVideoSnap(polldecode(source.session));
    };
    tick();
    const timer = window.setInterval(tick, 100);
    return () => {
      live = false;
      window.clearInterval(timer);
    };
  }, [source]);

  /** the frame the panel paints: the gateway svg as-is, the demo frame re-serialized per beat. */
  const activeBeat = motionHeld() ? 0 : beat;
  const demoSvg = useMemo(() => {
    if (source?.kind !== "demo") return null;
    return renderSvg({ ...source.frame, commands: beatCommands(source.frame, source.motion, activeBeat) });
  }, [source, activeBeat]);
  const frameSvg = source?.kind === "gateway" ? source.svg : demoSvg;
  const frameLabel = !source
    ? label("player.frameAriaNone")
    : source.kind === "gateway"
      ? label("player.frameAriaGateway").replace("{id}", source.id)
      : source.kind === "video"
        ? label("player.frameAriaVideo").replace("{name}", source.name)
        : label("player.frameAriaDemo").replace("{fixture}", source.fixture);

  /** prev/next: the gateway list for stored frames, the fixture order for the demo. */
  const step = useCallback(
    (delta: number) => {
      if (source?.kind === "video") {
        stepdecode(source.session, delta);
        setVideoSnap(polldecode(source.session));
        return;
      }
      if (source?.kind === "gateway") {
        const at = source.ids.indexOf(source.id);
        const next = source.ids[(at + delta + source.ids.length) % source.ids.length];
        if (next && next !== source.id) navigate(`/player?id=${encodeURIComponent(next)}`);
        return;
      }
      const at = FIXTURE_ORDER.indexOf(fixture);
      setFixture(FIXTURE_ORDER[(at + delta + FIXTURE_ORDER.length) % FIXTURE_ORDER.length] ?? "pulse");
      setPlaying(true);
    },
    [source, fixture, navigate],
  );

  /** the rail rows, straight off the source's own readouts. */
  const readout: ReadonlyArray<readonly [string, string]> = useMemo(() => {
    if (!source) return [];
    if (source.kind === "video") {
      const snap = videoSnap ?? polldecode(source.session);
      return [
        [label("player.rail.engine"), label("player.engine.videodecode")],
        [label("player.rail.source"), source.name],
        [label("player.rail.rate"), label("player.engine.rateFps").replace("{rate}", ratelabel(source.session))],
        [label("player.rail.frames"), snap.frames > 0 ? String(snap.frames) : "—"],
        [
          label("player.rail.duration"),
          snap.durationTicks > 0 ? timecodelabel(source.session, snap.durationTicks) : "—",
        ],
        [label("player.rail.position"), timecodelabel(source.session, snap.ticks)],
      ];
    }
    if (source.kind === "demo") {
      const report = source.report;
      return [
        [label("player.rail.engine"), label("player.engine.demo")],
        [label("player.rail.bpm"), String(Math.round(report.rhythm.bpm))],
        [label("player.rail.key"), keyName(report)],
        [label("player.rail.shape"), report.structure.narrativeShape],
        [label("player.rail.seed"), report.descriptor.seed],
        [
          label("player.rail.duration"),
          label("player.engine.durationMs").replace("{n}", String(Math.round(report.source.durationMs))),
        ],
        [
          label("player.rail.loop"),
          label("player.engine.loopLine")
            .replace("{n}", String(source.motion.keyframes.length))
            .replace("{ms}", String(Math.round(source.motion.loopMs))),
        ],
      ];
    }
    return [
      [label("player.rail.engine"), label("player.engine.gateway")],
      [label("player.rail.style"), source.record.style],
      [label("player.rail.bpm"), String(source.record.bpm)],
      [label("player.rail.key"), source.record.key],
      [label("player.rail.shape"), label("player.engine.shapeUnserved")],
      [label("player.rail.seed"), source.record.seed],
      [
        label("player.rail.duration"),
        label("player.engine.durationS").replace(
          "{n}",
          String(Math.max(0, Math.round(source.record.durationMs / 1000))),
        ),
      ],
    ];
  }, [source, videoSnap]);

  return (
    <div className="stage-rail">
      <section className="stage-col" aria-labelledby="player-h">
        <p className="mono-label reveal" style={{ margin: "0 0 10px" }}>
          {label("player.eyebrow")}
        </p>
        <div className="row row--wrap reveal" style={{ justifyContent: "space-between", gap: 14 }}>
          <h1
            id="player-h"
            style={{ margin: 0, fontSize: "clamp(1.9rem, 4vw, 2.8rem)", fontWeight: 800, letterSpacing: "-0.02em" }}
          >
            {label("player.title")}
          </h1>
          <label className="btn btn--ghost" style={{ minHeight: 40, cursor: "pointer" }}>
            {label("player.loadVideo")}
            <input
              type="file"
              accept="video/*"
              style={{ display: "none" }}
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) void loadVideo(file);
              }}
            />
          </label>
          <Link href="/gallery" className="mono-label" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <ArrowLeftRegular fontSize={13} aria-hidden="true" /> {label("player.back")}
          </Link>
        </div>

        {status === "loading" && (
          <div className="stage-rail" role="status" aria-busy="true" style={{ marginTop: 22 }}>
            <div className="stage-col">
              <div className="cdr-skel pf-frame pf-frame--skel" aria-hidden="true" />
              <div className="cdr-skel" style={{ maxWidth: 560, height: 10 }} aria-hidden="true" />
            </div>
            <aside className="rail-col" aria-hidden="true">
              <div className="rail-card" style={{ display: "grid", gap: 10 }}>
                <span className="cdr-skel" style={{ width: "38%", height: 10 }} />
                <span className="cdr-skel" style={{ width: "84%", height: 9 }} />
                <span className="cdr-skel" style={{ width: "70%", height: 9 }} />
                <span className="cdr-skel" style={{ width: "52%", height: 9 }} />
              </div>
            </aside>
            <span className="sr-only">{label("player.readingSr")}</span>
          </div>
        )}
        {status === "error" && (
          <div style={{ marginTop: 22 }}>
            <p role="alert" style={{ color: "var(--err)", margin: "0 0 14px" }}>
              {message}
            </p>
            <div className="row" style={{ gap: 10 }}>
              <button
                type="button"
                className="btn btn--ghost"
                style={{ minHeight: 40 }}
                onClick={() => setReload((value) => value + 1)}
              >
                {label("player.retry")}
              </button>
              <Link className="btn btn--quiet" style={{ minHeight: 40 }} href="/gallery">
                {label("player.back")}
              </Link>
            </div>
          </div>
        )}

        {status === "ready" && source && (
          <>
            {/* THE FRAME — the one hero object, square like the engine's canvas */}
            <div
              className="pf-frame reveal"
              role="img"
              aria-label={frameLabel}
              style={{
                position: "relative",
                maxWidth: 560,
                marginTop: 22,
                aspectRatio: "1 / 1",
                display: "grid",
                placeItems: "center",
                padding: 12,
                overflow: "hidden",
              }}
            >
              {source.kind === "video" ? (
                <div
                  ref={frameHolder}
                  style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", lineHeight: 0 }}
                />
              ) : frameSvg ? (
                <ArtFrame svg={frameSvg} />
              ) : (
                <p className="mono-label" style={{ margin: 0 }}>
                  {label("player.noFrame")}
                </p>
              )}
              <span className="mono-label" style={{ position: "absolute", top: 10, left: 14 }}>
                {source.kind === "gateway"
                  ? label("player.frameTag.gateway")
                  : source.kind === "video"
                    ? label("player.frameTag.video")
                    : label("player.frameTag.demo")}
              </span>
            </div>

            {/* TRANSPORT — the beat loop for the demo source, prev/next for both */}
            <fieldset className="transport reveal" aria-label={label("player.transportAria")} style={{ maxWidth: 560 }}>
              <button
                type="button"
                className="tkey"
                aria-label={source.kind === "video" ? label("player.prevFrame") : label("player.prevArt")}
                onClick={() => step(-1)}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
                  <path d="M18 6 L9 12 L18 18 Z" />
                  <rect x="5" y="6" width="2.4" height="12" rx="1" />
                </svg>
              </button>
              {source.kind === "demo" && (
                <button
                  type="button"
                  className="tkey"
                  aria-pressed={playing}
                  aria-label={playing ? label("player.pauseLoop") : label("player.playLoop")}
                  onClick={() => setPlaying((value) => !value)}
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
              )}
              {source.kind === "video" && (
                <button
                  type="button"
                  className="tkey"
                  aria-pressed={videoSnap?.state === "playing"}
                  aria-label={videoSnap?.state === "playing" ? label("player.pauseVideo") : label("player.playVideo")}
                  onClick={() => {
                    const snap = polldecode(source.session);
                    if (snap.state === "playing") pausedecode(source.session);
                    else void playdecode(source.session);
                    setVideoSnap(polldecode(source.session));
                  }}
                >
                  {videoSnap?.state === "playing" ? (
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
              )}
              <button
                type="button"
                className="tkey"
                aria-label={source.kind === "video" ? label("player.nextFrame") : label("player.nextArt")}
                onClick={() => step(1)}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
                  <path d="M6 6 L15 12 L6 18 Z" />
                  <rect x="16.6" y="6" width="2.4" height="12" rx="1" />
                </svg>
              </button>
              <span className="pf-tc">
                {source.kind === "video"
                  ? videoSnap
                    ? `${timecodelabel(source.session, videoSnap.ticks)} · ${ratelabel(source.session)} fps`
                    : label("player.readingMedia")
                  : source.kind === "demo"
                    ? label("player.beat").replace("{ms}", String(Math.round(source.motion.loopMs)))
                    : label("player.gatewayCount").replace("{n}", String(source.ids.length))}
              </span>
              {source.kind === "gateway" && (
                <span className="mono-label" style={{ marginLeft: "auto", textAlign: "right" }}>
                  {label("player.staticNote")}
                </span>
              )}
            </fieldset>
            {videoNote && (
              <p role="status" className="mono-label" style={{ marginTop: 12, color: "var(--err)" }}>
                {videoNote}
              </p>
            )}
          </>
        )}
      </section>

      {/* READOUT RAIL — bpm / key / shape / seed straight off the source */}
      <aside className="rail-col" aria-label={label("player.rail.analysis")}>
        <div className="rail-card reveal" style={{ padding: 18 }}>
          <p className="mono-label" style={{ margin: "0 0 10px" }}>
            {label("player.rail.analysis")}
          </p>
          {readout.map(([rowLabel, value]) => (
            <div key={rowLabel} className="rail-kv">
              <span>{rowLabel}</span>
              <strong style={{ overflowWrap: "anywhere" }}>{value}</strong>
            </div>
          ))}
          <div
            className={`rail-kv${(source?.kind === "demo" && playing) || videoSnap?.state === "playing" ? " is-live" : ""}`}
          >
            <span>
              {(source?.kind === "demo" && playing) || videoSnap?.state === "playing" ? (
                <span className="live-dot" aria-hidden="true" />
              ) : null}
              {label("player.rail.state")}
            </span>
            <strong>
              {source?.kind === "video"
                ? (videoSnap?.state ?? label("player.rail.stateLoading"))
                : source?.kind === "demo"
                  ? playing
                    ? label("player.rail.statePlaying")
                    : label("player.rail.statePaused")
                  : label("player.rail.stateStatic")}
            </strong>
          </div>
        </div>
        {source?.kind === "demo" && (
          <div className="rail-card reveal" style={{ padding: 18 }}>
            <p className="mono-label" style={{ margin: "0 0 10px" }}>
              {label("player.rail.digest")}
            </p>
            <p className="mono-label" style={{ margin: 0, lineHeight: 1.7, overflowWrap: "anywhere" }}>
              {reportDigest(source.report)}
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
