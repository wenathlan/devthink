/**
 * studio.tsx — the STUDIO anchor of the theme (the platform's core page):
 * the audio→image generation workflow as three compact panes over the
 * generation engine — LEFT the source rail (upload dropzone + the three
 * built-in intro fixtures), CENTER the stage (analyze readout + rendered
 * artwork breathing on its rAF beat + the export row), RIGHT the controls
 * (style picker, canvas presets, seed, generate). The flow wires the real
 * chain end to end: pick/drop audio → the dual decode path (wav bytes →
 * decodeWav, compressed → AudioContext, browser-guarded) → analyzePcm →
 * reportDigest + the five stat blocks → styleForDescriptor preselect →
 * buildImageProject chain → renderSvg with the motion pulse under
 * prefers-reduced-motion. Persistence is dual-mode: /api/health within
 * 800 ms → the gateway saves the project, else the page keeps an in-memory
 * session record — nothing touches browser storage.
 *
 * The previous anchor-ledger page (parts.tsx, visualize-panel.tsx beside
 * this file) is retired from the route but NOT deleted — the house rule
 * "nada se apaga" keeps those code paths on disk and exported; the
 * generation studio simply no longer mounts them.
 */

// the legacy anchor visuals stay public beside the page (nothing is turned off)
export * from "./parts.tsx";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type AnalysisReport, PipelineError } from "../../audiopipeline.ts";
import { type ImageProject, ProjectError } from "../../imageproject.ts";
import { renderSvg, renderThumbnailSignature } from "../../imagerender.ts";
import { imageStyles, type StyleSpec, styleForDescriptor } from "../../imagestyles.ts";
import type { DemoFixtureId } from "../intro/fixtures.ts";
import { type NavLink, Shell } from "../shell/Shell.tsx";
import ControlsPane from "./controls-pane.tsx";
import ExportRow from "./export-row.tsx";
import { generateStudioProject, reseededSeed, type SessionSave, type StudioGeneration } from "./generate.ts";
import Readout from "./readout.tsx";
import { analyzeSource, fileSource, fixtureSource, type StudioSource } from "./source.ts";
import SourceRail from "./source-rail.tsx";
import StageArt from "./stage-art.tsx";

const FOOTER_LINKS: readonly NavLink[] = [
  { label: "Player", href: "/player" },
  { label: "Studio", href: "/studio" },
  { label: "Gallery", href: "/gallery" },
  { label: "Settings", href: "/settings" },
];

/** the staged beat before the synchronous compute lands — skipped under reduced motion. */
const STAGE_MS = 240;

/** the analyze status line, per lifecycle stage. */
function analyzeLine(
  status: "idle" | "reading" | "ready" | "error",
  source: StudioSource | null,
  note: string | null,
): string {
  if (status === "idle")
    return "idle — drop an audio file or pick a built-in fixture; the chain answers in under a second.";
  if (status === "reading")
    return source
      ? `reading ${source.name} · spectrum · rhythm · tonality · timbre · structure…`
      : "reading the source…";
  if (status === "error") return note ?? "the analysis refused this source.";
  return "analyzed — the descriptor is fused; tune the controls and generate.";
}

/** the analyze failure message: pipeline codes first, then the raw traceable message. */
function analyzeMessage(error: unknown): string {
  if (error instanceof PipelineError) {
    if (error.code === "pipeline-too-short")
      return "the slice is shorter than one second — the pipeline needs at least 1 s of audio.";
    if (error.code === "pipeline-empty-samples") return "the source carries no readable samples.";
    if (error.code === "pipeline-unsupported-sample-rate")
      return "the source's sample rate is not usable — try re-exporting the file.";
    return error.message;
  }
  return error instanceof Error ? error.message : "the analysis refused this source.";
}

/** the generation failure message: project codes first, then the raw message. */
function generateMessage(error: unknown): string {
  if (error instanceof ProjectError) return `the project layer refused the fold (${error.code}): ${error.message}`;
  return error instanceof Error ? error.message : "the generation refused this descriptor.";
}

/** the wide-viewport probe behind the three-pane grid (collapses to one column below 1120px). */
function useWidePane(): boolean {
  const [wide, setWide] = useState<boolean>(() =>
    typeof window === "undefined" ? false : window.matchMedia("(min-width: 1120px)").matches,
  );
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1120px)");
    const onChange = (event: MediaQueryListEvent): void => setWide(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return wide;
}

/**
 * The generation studio: three panes, one workflow — analyze → style →
 * generate → export/save.
 *
 * @returns the studio element.
 */
export default function Studio() {
  const [source, setSource] = useState<StudioSource | null>(null);
  const [activeFixture, setActiveFixture] = useState<DemoFixtureId | null>(null);
  const [analyzeStatus, setAnalyzeStatus] = useState<"idle" | "reading" | "ready" | "error">("idle");
  const [analyzeNote, setAnalyzeNote] = useState<string | null>(null);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [styleName, setStyleName] = useState<string>("opaline");
  const [size, setSize] = useState<number>(1080);
  const [seed, setSeed] = useState<string>("");
  const [seedNonce, setSeedNonce] = useState<number>(0);
  const [generating, setGenerating] = useState<boolean>(false);
  const [genStatus, setGenStatus] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);
  const [generation, setGeneration] = useState<StudioGeneration | null>(null);
  const [session, setSession] = useState<readonly SessionSave[]>([]);
  const analyzeTimer = useRef<number | null>(null);
  const generateTimer = useRef<number | null>(null);
  const styles = useMemo(() => imageStyles(), []);
  const wide = useWidePane();

  // the two timers the page owns: cleared on unmount
  useEffect(() => {
    return () => {
      if (analyzeTimer.current !== null) window.clearTimeout(analyzeTimer.current);
      if (generateTimer.current !== null) window.clearTimeout(generateTimer.current);
    };
  }, []);

  const selectedStyle: StyleSpec | null = useMemo(
    () => styles.find((style) => style.name === styleName) ?? null,
    [styles, styleName],
  );

  const masterSvg = useMemo(() => (generation ? renderSvg(generation.frame) : null), [generation]);

  /** runs the genuine chain over one source: staged beat (skipped reduced) → analyze → preselect. */
  const runAnalyze = useCallback((next: StudioSource, fixtureId: DemoFixtureId | null) => {
    if (analyzeTimer.current !== null) window.clearTimeout(analyzeTimer.current);
    setSource(next);
    setActiveFixture(fixtureId);
    setReport(null);
    setGeneration(null);
    setGenStatus(null);
    setGenError(null);
    setAnalyzeNote(null);
    setAnalyzeStatus("reading");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const compute = (): void => {
      analyzeTimer.current = null;
      try {
        const nextReport = analyzeSource(next);
        setReport(nextReport);
        setStyleName(styleForDescriptor(nextReport.descriptor).name); // the documented preselect
        setSeed(nextReport.descriptor.seed);
        setSeedNonce(0);
        setAnalyzeStatus("ready");
      } catch (error) {
        setReport(null);
        setAnalyzeStatus("error");
        setAnalyzeNote(analyzeMessage(error));
      }
    };
    analyzeTimer.current = window.setTimeout(compute, reduced ? 0 : STAGE_MS);
  }, []);

  /** a fixture chip: pure synthesis, then the chain. */
  const onFixture = useCallback(
    (id: DemoFixtureId) => {
      try {
        runAnalyze(fixtureSource(id), id);
      } catch (error) {
        setAnalyzeStatus("error");
        setAnalyzeNote(error instanceof Error ? error.message : "the fixture could not be built.");
      }
    },
    [runAnalyze],
  );

  /** a picked/dropped file: decode (async, dual path), then the chain. */
  const onFile = useCallback(
    (file: File) => {
      setAnalyzeStatus("reading");
      setAnalyzeNote(null);
      setSource(null);
      setActiveFixture(null);
      fileSource(file)
        .then((next) => {
          setAnalyzeNote(null);
          runAnalyze(next, null);
        })
        .catch((error: unknown) => {
          setSource(null);
          setReport(null);
          setAnalyzeStatus("error");
          setAnalyzeNote(error instanceof Error ? error.message : "the source could not be read.");
        });
    },
    [runAnalyze],
  );

  /** the generation run: staged beat (skipped reduced) → fold → build → compile. */
  const onGenerate = useCallback(() => {
    if (!report || generating) return;
    if (generateTimer.current !== null) window.clearTimeout(generateTimer.current);
    setGenerating(true);
    setGenError(null);
    setGenStatus("folding style · palette · blocks · texture · motion…");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const compute = (): void => {
      generateTimer.current = null;
      try {
        const next = generateStudioProject(report.descriptor, {
          styleName,
          width: size,
          height: size,
          seed: seed.trim() || report.descriptor.seed,
        });
        setGeneration(next);
        setGenStatus(
          `rendered · sig ${renderThumbnailSignature(next.frame.commands)} · ${next.project.id} · deterministic`,
        );
        setGenerating(false);
      } catch (error) {
        setGeneration(null);
        setGenStatus(null);
        setGenError(generateMessage(error));
        setGenerating(false);
      }
    };
    generateTimer.current = window.setTimeout(compute, reduced ? 0 : STAGE_MS);
  }, [report, generating, styleName, size, seed]);

  /** the deterministic reseed: a nonce folds into the base seed, the field follows. */
  const onReseed = useCallback(() => {
    const next = seedNonce + 1;
    setSeedNonce(next);
    setSeed(reseededSeed(report?.descriptor.seed ?? "", next));
  }, [report, seedNonce]);

  /** one gallery save lands here from either mode of the dual handoff. */
  const onRecordSave = useCallback((project: ImageProject, mode: "gateway" | "local", id: string) => {
    setSession((current) =>
      [
        {
          id,
          mode,
          style: project.style,
          seed: project.seed,
          bpm: Math.round(project.audio.bpm),
          at: new Date().toISOString(),
        },
        ...current,
      ].slice(0, 8),
    );
  }, []);

  const gridStyle = {
    display: "grid",
    gap: "var(--space-6, 24px)",
    alignItems: "start",
    gridTemplateColumns: wide ? "minmax(0, 264px) minmax(0, 1fr) minmax(0, 316px)" : "minmax(0, 1fr)",
  } as const;
  const paneHeadStyle = { margin: "0 0 10px" } as const;

  return (
    <Shell cta={{ label: "View gallery", href: "/gallery" }} footerLinks={FOOTER_LINKS} domain="cadria.devthink.pro">
      <header className="reveal" style={{ maxWidth: "68ch", marginBottom: 26 }}>
        <p className="eyebrow" style={{ margin: "0 0 8px" }}>
          cadria · studio
        </p>
        <h1 className="page-title" style={{ fontSize: "clamp(1.9rem, 4vw, 2.75rem)", margin: "0 0 10px" }}>
          generation studio
        </h1>
        <p className="lede-tight" style={{ margin: 0, lineHeight: 1.6 }}>
          audio in, artwork out — the real chain, live: analyze the source, let the fused descriptor pick a style,
          generate the deterministic frame and breathe it on the beat. exports ship the svg master; saves ride the
          gateway when it answers, the session memory when it doesn't.
        </p>
      </header>

      <div style={gridStyle}>
        <SourceRail
          disabled={analyzeStatus === "reading"}
          source={source}
          activeFixture={activeFixture}
          onFixture={onFixture}
          onFile={onFile}
        />

        <section aria-label="generation stage" style={{ minWidth: 0 }}>
          <p className="mono-label" style={paneHeadStyle}>
            stage
          </p>
          <p
            role="status"
            aria-live="polite"
            style={{ margin: "0 0 14px", fontSize: "0.86rem", color: "var(--ink-2)", lineHeight: 1.55 }}
          >
            {analyzeLine(analyzeStatus, source, analyzeNote)}
          </p>
          <StageArt
            frame={generation?.frame ?? null}
            motion={generation?.motion ?? null}
            caption={
              generation
                ? `deterministic artwork rendered from ${source?.name ?? "the source"} · style ${generation.project.style} · seed ${generation.project.seed}`
                : "the rendered frame lands here"
            }
          />
          {report && <Readout report={report} />}
          <ExportRow
            svg={masterSvg}
            project={generation?.project ?? null}
            report={report}
            styleName={styleName}
            seed={seed}
            session={session}
            onRecordSave={onRecordSave}
          />
        </section>

        <ControlsPane
          styles={styles}
          selected={selectedStyle}
          styleName={styleName}
          onStyle={setStyleName}
          size={size}
          onSize={setSize}
          seed={seed}
          onSeed={setSeed}
          onReseed={onReseed}
          onGenerate={onGenerate}
          canGenerate={report !== null}
          generating={generating}
          status={genStatus}
          error={genError}
        />
      </div>
    </Shell>
  );
}
