/**
 * player page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

import { ArrowLeft } from "lucide-react";
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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { type AnalysisReport, analyzePcm, reportDigest } from "../../audiopipeline.ts";
import { type RenderFrame, renderCommands, renderKeyframePerturbation, renderSvg } from "../../imagerender.ts";
import { compositionBlocks, rhythmScatter } from "../../synthcomposition.ts";
import { type MotionSpec, synthMotion } from "../../synthmotion.ts";
import { synthPalette } from "../../synthpalette.ts";
import { synthTexture } from "../../synthtexture.ts";
import { type DemoFixtureId, demoFixtures } from "../intro/fixtures.ts";
import {
  fetchGatewayRender,
  GatewayClientError,
  type GatewayProject,
  listGatewayProjects,
} from "../shell/gatewayclient.ts";
import { Shell } from "../shell/Shell.tsx";

/** the demo canvas the in-session fallback renders at (px). */
const DEMO_CANVAS = 640;

/** the fixture order the demo fallback walks. */
const FIXTURE_ORDER: readonly DemoFixtureId[] = ["glass", "static", "pulse"];

/** rescales an engine svg to its panel and hides it from the a11y tree (the wrapper carries the label). */
function fitArtSvg(svg: string): string {
  return svg.replace("<svg ", '<svg aria-hidden="true" style="width:100%;height:auto;display:block" ');
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
  | { kind: "gateway"; id: string; svg: string; record: GatewayProject; ids: readonly string[] };

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
              ? "gateway offline — the stored frame can't be fetched."
              : error instanceof Error
                ? error.message
                : "the gateway refused this render.",
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
            setMessage(error instanceof Error ? error.message : "the engine refused this slice.");
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

  /** the frame the panel paints: the gateway svg as-is, the demo frame re-serialized per beat. */
  const activeBeat = motionHeld() ? 0 : beat;
  const demoSvg = useMemo(() => {
    if (source?.kind !== "demo") return null;
    return renderSvg({ ...source.frame, commands: beatCommands(source.frame, source.motion, activeBeat) });
  }, [source, activeBeat]);
  const frameSvg = source?.kind === "gateway" ? source.svg : demoSvg;
  const frameLabel = !source
    ? "no frame loaded"
    : source.kind === "gateway"
      ? `stored render ${source.id} from the gateway`
      : `deterministic artwork rendered in-session from the ${source.fixture} fixture`;

  /** prev/next: the gateway list for stored frames, the fixture order for the demo. */
  const step = useCallback(
    (delta: number) => {
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
    if (source.kind === "demo") {
      const report = source.report;
      return [
        ["engine", "versawase · in-session demo"],
        ["bpm", String(Math.round(report.rhythm.bpm))],
        ["key", keyName(report)],
        ["shape", report.structure.narrativeShape],
        ["seed", report.descriptor.seed],
        ["duration", `${Math.round(report.source.durationMs)} ms`],
        ["loop", `${source.motion.keyframes.length} keyframes · ${Math.round(source.motion.loopMs)} ms / beat`],
      ];
    }
    return [
      ["engine", "gateway render"],
      ["style", source.record.style],
      ["bpm", String(source.record.bpm)],
      ["key", source.record.key],
      ["shape", "— not served"],
      ["seed", source.record.seed],
      ["duration", `${Math.max(0, Math.round(source.record.durationMs / 1000))} s`],
    ];
  }, [source]);

  return (
    <Shell>
      <div className="stage-rail">
        <section className="stage-col" aria-labelledby="player-h">
          <p className="mono-label reveal" style={{ margin: "0 0 10px" }}>
            cadria · player
          </p>
          <div className="row row--wrap reveal" style={{ justifyContent: "space-between", gap: 14 }}>
            <h1
              id="player-h"
              style={{ margin: 0, fontSize: "clamp(1.9rem, 4vw, 2.8rem)", fontWeight: 800, letterSpacing: "-0.02em" }}
            >
              the artwork viewer
            </h1>
            <Link
              href="/gallery"
              className="mono-label"
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <ArrowLeft size={13} aria-hidden="true" /> back to gallery
            </Link>
          </div>

          {status === "loading" && (
            <p className="mono-label" role="status" style={{ marginTop: 22 }}>
              reading the source…
            </p>
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
                  retry
                </button>
                <Link className="btn btn--quiet" style={{ minHeight: 40 }} href="/gallery">
                  back to gallery
                </Link>
              </div>
            </div>
          )}

          {status === "ready" && source && (
            <>
              {/* THE FRAME — the one hero object, square like the engine's canvas */}
              <div
                className="reveal"
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
                  border: "1px solid var(--line)",
                  borderRadius: "var(--radius-lg)",
                  background: "var(--surface-1)",
                  overflow: "hidden",
                }}
              >
                {frameSvg ? (
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: engine serializer output (deterministic IR, hex-guarded colors, no user input) — the documented injection point, as on the intro demo
                  <div
                    style={{ width: "100%", lineHeight: 0 }}
                    dangerouslySetInnerHTML={{ __html: fitArtSvg(frameSvg) }}
                  />
                ) : (
                  <p className="mono-label" style={{ margin: 0 }}>
                    no frame
                  </p>
                )}
                <span className="mono-label" style={{ position: "absolute", top: 10, left: 14 }}>
                  {source.kind === "gateway" ? "gateway frame" : "in-session demo · deterministic"}
                </span>
              </div>

              {/* TRANSPORT — the beat loop for the demo source, prev/next for both */}
              <fieldset className="transport reveal" aria-label="viewer transport" style={{ maxWidth: 560 }}>
                <button type="button" className="tkey" aria-label="previous artwork" onClick={() => step(-1)}>
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
                    aria-label={playing ? "pause the motion loop" : "play the motion loop"}
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
                <button type="button" className="tkey" aria-label="next artwork" onClick={() => step(1)}>
                  <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
                    <path d="M6 6 L15 12 L6 18 Z" />
                    <rect x="16.6" y="6" width="2.4" height="12" rx="1" />
                  </svg>
                </button>
                <span className="pf-tc">
                  {source.kind === "demo"
                    ? `${Math.round(source.motion.loopMs)} ms / beat`
                    : `${source.ids.length} in the gateway list`}
                </span>
                {source.kind === "gateway" && (
                  <span className="mono-label" style={{ marginLeft: "auto", textAlign: "right" }}>
                    static — the gateway serves the frame, not the project json
                  </span>
                )}
              </fieldset>
            </>
          )}
        </section>

        {/* READOUT RAIL — bpm / key / shape / seed straight off the source */}
        <aside className="rail-col" aria-label="analysis readout">
          <div className="rail-card reveal" style={{ padding: 18 }}>
            <p className="mono-label" style={{ margin: "0 0 10px" }}>
              analysis
            </p>
            {readout.map(([label, value]) => (
              <div key={label} className="rail-kv">
                <span>{label}</span>
                <strong style={{ overflowWrap: "anywhere" }}>{value}</strong>
              </div>
            ))}
            <div className={`rail-kv${source?.kind === "demo" && playing ? " is-live" : ""}`}>
              <span>
                {source?.kind === "demo" && playing ? <span className="live-dot" aria-hidden="true" /> : null}state
              </span>
              <strong>{source?.kind === "demo" ? (playing ? "playing" : "paused") : "static frame"}</strong>
            </div>
          </div>
          {source?.kind === "demo" && (
            <div className="rail-card reveal" style={{ padding: 18 }}>
              <p className="mono-label" style={{ margin: "0 0 10px" }}>
                digest
              </p>
              <p className="mono-label" style={{ margin: 0, lineHeight: 1.7, overflowWrap: "anywhere" }}>
                {reportDigest(source.report)}
              </p>
            </div>
          )}
        </aside>
      </div>
    </Shell>
  );
}
