/**
 * demo.tsx — the demo strip of the intro: the REAL product working inline.
 * Three synthetic fixtures are synthesized in code (fixtures.ts), fed to the
 * genuine analysis chain (analyzePcm over the wave-1 orchestrator), summarized
 * through reportDigest, then rendered by the genuine render layer
 * (renderCommands + renderSvg over the wave-2 synth lanes) — the deterministic
 * SVG is injected into the bench panel. No mock images, no upload, no network,
 * no storage: the same fixture always answers the same report and the same
 * frame. The one JS-driven beat (the "reading" stage) is skipped outright
 * under prefers-reduced-motion.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { type AnalysisReport, analyzePcm, reportDigest } from "../../audiopipeline.ts";
import { renderCommands, renderSvg, renderThumbnailSignature } from "../../imagerender.ts";
import { compositionBlocks, rhythmScatter } from "../../synthcomposition.ts";
import { synthPalette } from "../../synthpalette.ts";
import { synthTexture } from "../../synthtexture.ts";
import { type DemoFixtureId, demoFixtures } from "./fixtures.ts";

/** the cue the intro hero's "hear to see" cta sends: which fixture to run. */
export type DemoCue = { id: DemoFixtureId; nonce: number };

/** the demo bench canvas in px (the render layer clamps and centers it). */
const CANVAS = 520;
/** how long the "reading" stage holds before the compute lands (ms). */
const READING_MS = 420;
/** the identity rose of the campaign, straight from the token foundation. */
const ROSE = "var(--rose-500, #f472b6)";
/** quiet secondary text: the page ink, softened (theme-proof). */
const MUTED = "color-mix(in srgb, currentColor 64%, transparent)";
/** the hairline the page draws beside the contract's own. */
const HAIR = "1px solid color-mix(in srgb, currentColor 18%, transparent)";

/** one finished demo run: the digest line, the render signature, the svg. */
type DemoResult = { fixture: string; digest: string; signature: string; svg: string };

/** the lifecycle of one demo run. */
type DemoStatus = "idle" | "reading" | "ready" | "error";

/** rescales the generated svg to its panel and hides it from the a11y tree (the wrapper carries the label). */
function fitArtSvg(svg: string): string {
  return svg.replace("<svg ", '<svg aria-hidden="true" style="width:100%;height:auto;display:block" ');
}

/** the honest status line of the readout, per lifecycle stage. */
function statusLine(status: DemoStatus, message: string | null): string {
  if (status === "idle") return "idle — pick a fixture; the chain answers in under a second.";
  if (status === "reading") return "reading spectrum · rhythm · tonality · timbre · structure…";
  if (status === "error") return message ?? "the engine refused this slice.";
  return "rendered from the fused descriptor — run it again: same audio, same image.";
}

/** The demo strip: fixture chips, the analysis readout and the rendered frame. */
export function DemoStrip({ cue }: { cue: DemoCue | null }) {
  const fixtures = demoFixtures();
  const [status, setStatus] = useState<DemoStatus>("idle");
  const [active, setActive] = useState<DemoFixtureId | null>(null);
  const [result, setResult] = useState<DemoResult | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    // the one timer the component owns: cleared on unmount and before every run
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, []);

  /** runs the real chain over one fixture: analyze → digest → render → inject. */
  const run = useCallback((id: DemoFixtureId) => {
    const fixture = demoFixtures().find((entry) => entry.id === id);
    if (!fixture) return;
    if (timer.current !== null) window.clearTimeout(timer.current);
    setActive(id);
    setMessage(null);
    setStatus("reading");
    const compute = (): void => {
      timer.current = null;
      try {
        const report: AnalysisReport = analyzePcm(fixture.samples, fixture.sampleRate);
        const descriptor = report.descriptor;
        const frame = renderCommands({
          seed: descriptor.seed,
          palette: synthPalette(descriptor),
          blocks: rhythmScatter(descriptor, compositionBlocks(descriptor)),
          texture: synthTexture(descriptor),
          canvas: { width: CANVAS, height: CANVAS },
        });
        setResult({
          fixture: fixture.name,
          digest: reportDigest(report),
          signature: renderThumbnailSignature(frame.commands),
          svg: fitArtSvg(renderSvg(frame)),
        });
        setStatus("ready");
      } catch (error) {
        setResult(null);
        setMessage(error instanceof Error ? error.message : "the engine refused this slice.");
        setStatus("error");
      }
    };
    // the reduced-motion guard: no staged beat, the compute lands at once
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    timer.current = window.setTimeout(compute, reduced ? 0 : READING_MS);
  }, []);

  useEffect(() => {
    // the hero cta cues a fixture run from outside the strip
    if (cue) run(cue.id);
  }, [cue, run]);

  const sectionStyle = {
    width: "100%",
    maxWidth: 1080,
    margin: "0 auto",
    padding: "26px 24px 84px",
    boxSizing: "border-box",
    scrollMarginTop: 88,
  } as const;
  const benchStyle = {
    marginTop: 28,
    borderRadius: 8,
    border: HAIR,
    padding: "18px 20px 22px",
    display: "flex",
    flexDirection: "column",
    gap: 18,
    background: "color-mix(in srgb, currentColor 3%, transparent)",
  } as const;
  const gridStyle = { display: "flex", flexWrap: "wrap", gap: 22, alignItems: "stretch" } as const;
  const readoutStyle = {
    flex: "1 1 260px",
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 9,
    justifyContent: "center",
  } as const;
  const artStyle = {
    flex: "1 1 300px",
    minWidth: 0,
    maxWidth: CANVAS,
    borderRadius: 6,
    border: HAIR,
    overflow: "hidden",
    aspectRatio: "1 / 1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    background: "color-mix(in srgb, currentColor 4%, transparent)",
  } as const;

  return (
    <section id="intro-demo" aria-labelledby="intro-demo-h" style={sectionStyle}>
      <header style={{ maxWidth: "62ch" }}>
        <p className="mono-label reveal" style={{ margin: "0 0 10px" }}>
          the engine, live
        </p>
        <h2
          id="intro-demo-h"
          className="reveal"
          style={{
            margin: "0 0 10px",
            fontSize: "clamp(1.45rem, 2.6vw, 1.9rem)",
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
            fontWeight: 600,
          }}
        >
          pick a fixture. hear to see.
        </h2>
        <p className="reveal" style={{ margin: 0, color: MUTED, lineHeight: 1.6 }}>
          three synthetic fixtures are synthesized in code — no upload, no network. the real chain reads the slice, the
          readout reports what it heard, and the render layer draws the frame the audio describes.
        </p>
      </header>

      <div className="surface reveal" style={benchStyle}>
        <fieldset
          aria-label="built-in synthetic fixtures"
          style={{ border: "none", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", gap: 8 }}
        >
          {fixtures.map((fixture) => (
            <button
              key={fixture.id}
              type="button"
              className="chip"
              title={fixture.detail}
              aria-pressed={active === fixture.id ? "true" : "false"}
              disabled={status === "reading"}
              onClick={() => run(fixture.id)}
              style={active === fixture.id ? { borderColor: ROSE, color: ROSE, borderRadius: 6 } : { borderRadius: 6 }}
            >
              {fixture.name} · {fixture.detail}
            </button>
          ))}
        </fieldset>

        <div style={gridStyle}>
          <div style={readoutStyle}>
            <p className="mono-label" style={{ margin: 0 }}>
              analysis
            </p>
            <p role="status" aria-live="polite" style={{ margin: 0, color: MUTED, lineHeight: 1.55 }}>
              {statusLine(status, message)}
            </p>
            {result && (
              <>
                <p className="mono-label" style={{ margin: 0 }}>
                  {result.digest}
                </p>
                <p className="mono-label" style={{ margin: 0 }}>
                  sig {result.signature} · {CANVAS}×{CANVAS} px · deterministic
                </p>
              </>
            )}
            {status === "error" && (
              <p role="alert" style={{ margin: 0, color: "var(--sol-error, #ff7b8e)", lineHeight: 1.55 }}>
                {message}
              </p>
            )}
          </div>

          <div
            style={artStyle}
            role="img"
            aria-label={
              result
                ? `deterministic artwork rendered from the ${result.fixture} fixture`
                : "the rendered frame lands here"
            }
          >
            {result ? (
              // biome-ignore lint/security/noDangerouslySetInnerHtml: the svg is the engine's own deterministic serializer output (internal IR, hex-guarded colors, no user input, no network) — the documented injection point of the render layer
              <div style={{ width: "100%", lineHeight: 0 }} dangerouslySetInnerHTML={{ __html: result.svg }} />
            ) : (
              <p className="mono-label" style={{ margin: 0, color: MUTED }}>
                the frame lands here
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default DemoStrip;
