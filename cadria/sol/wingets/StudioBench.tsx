/**
 * StudioBench.tsx — the composite winget of the studio remount (the
 * detailed engine wave): the whole generation bench the retired page
 * carried, rebuilt as ONE mount so the page anchor stays the thin face the
 * construction law pins on it. The bench wires the existing wingets — the
 * source rail, the stage art, the readout, the export row, the controls
 * pane and the visualize panel — onto the REAL engine seats, never a
 * rewritten one:
 *
 * - the source lane answers the real analysis chain: a picked/dropped file
 *   rides the dual decode path (`fileSource` — wav bytes natively,
 *   compressed through AudioContext), a fixture chip the pure synthesis
 *   (`fixtureSource`), then `analyzeSource` (analyzePcm over the wave-1
 *   orchestrator) fuses the descriptor and `styleForDescriptor` preselects
 *   the style;
 * - the generation folds through `generateStudioProject` (the
 *   style-biased buildImageProject chain) and the stage art breathes the
 *   descriptor's own beat grid through renderKeyframePerturbation;
 * - the export row ships the svg master, the png rasterization and the
 *   dual-mode gallery handoff (the gateway probe answering within its
 *   800 ms budget, the in-memory session record otherwise);
 * - the visualize panel below runs the image→mesh pipeline client-side and
 *   mounts the real 3d viewport of the versawase engine.
 *
 * The arming beat rides the face prop: the first paint before the engine
 * seats land (the style table and the fixture rail the bench reads) the
 * route answers the construction face it wore — the debonair arming
 * semantics. Zero hardcoded rows: every number is the engine's own, every
 * word rides the label store.
 */

import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type AnalysisReport, PipelineError } from "@wenathlan/debonair/audio";
import { type ImageProject, ProjectError } from "../../image.ts";
import { renderSvg, renderThumbnailSignature } from "../../image.ts";
import { imageStyles, type StyleSpec, styleForDescriptor } from "../../image.ts";
import type { DemoFixtureId } from "../../introfixtures.ts";
import { label } from "../../labels.ts";
import { generateStudioProject, reseededSeed, type SessionSave, type StudioGeneration } from "../../studio.ts";
import { analyzeSource, fileSource, fixtureSource, type StudioSource } from "../../studio.ts";
import { ControlsPane } from "./StudioControls.tsx";
import { ExportRow } from "./StudioExportrow.tsx";
import { PipelineBench } from "./StudioPipeline.tsx";
import { Readout } from "./StudioReadout.tsx";
import { SourceRail } from "./StudioSourcerail.tsx";
import { StageArt } from "./StudioStageart.tsx";
import { VisualizePanel } from "./StudioVisualizepanel.tsx";

/** the staged beat before the synchronous compute lands — skipped under reduced motion. */
const STAGE_MS = 240;

/** the props of the bench mount. */
type StudioBenchProps = {
  /** the face the route answers while the bench arms (the first paint
   * before the engine seats land — the honest arming state). */
  face: ReactNode;
};

/** the analyze status line, per lifecycle stage (the copy law). */
function analyzeLine(
  status: "idle" | "reading" | "ready" | "error",
  source: StudioSource | null,
  note: string | null,
): string {
  if (status === "idle") return label("studio.analyzeIdle");
  if (status === "reading")
    return source ? label("studio.analyzeReading").replace("{name}", source.name) : label("studio.analyzeReadingGeneric");
  if (status === "error") return note ?? label("studio.analyzeRefused");
  return label("studio.analyzed");
}

/** the analyze failure message: pipeline codes first, then the raw traceable message. */
function analyzeMessage(error: unknown): string {
  if (error instanceof PipelineError) {
    if (error.code === "pipeline-too-short") return label("studio.errorTooShort");
    if (error.code === "pipeline-empty-samples") return label("studio.errorEmpty");
    if (error.code === "pipeline-unsupported-sample-rate") return label("studio.errorRate");
    return error.message;
  }
  return error instanceof Error ? error.message : label("studio.analyzeRefused");
}

/** the generation failure message: project codes first, then the raw message. */
function generateMessage(error: unknown): string {
  if (error instanceof ProjectError)
    return label("studio.projectRefused").replace("{code}", error.code).replace("{message}", error.message);
  return error instanceof Error ? error.message : label("studio.generateRefused");
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
 * StudioBench — the generation bench over the real engine seats.
 *
 * @param props the arming face of the route.
 * @returns the bench element, or the arming face before the seats land.
 */
export function StudioBench({ face }: StudioBenchProps) {
  const [seated, setSeated] = useState(false);
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

  // the arming beat: the engine seats land on the mount effect (the style
  // table and the fixture rail the bench reads answer) — the first paint
  // answers the face the route wore, the same arming semantics the debonair
  // studio remount carries
  useEffect(() => {
    setSeated(true);
  }, []);

  // the two timers the bench owns: cleared on unmount
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
        setAnalyzeNote(error instanceof Error ? error.message : label("studio.fixtureError"));
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
          setAnalyzeNote(error instanceof Error ? error.message : label("studio.sourceError"));
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
    setGenStatus(label("studio.genStatus"));
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
          label("studio.genReady")
            .replace("{signature}", renderThumbnailSignature(next.frame.commands))
            .replace("{id}", next.project.id),
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

  // the arming beat: the engine seats have not landed yet — the route
  // answers the face it wore (never a premature desk pretending to ship)
  if (!seated) return <>{face}</>;

  const gridStyle = {
    display: "grid",
    gap: "var(--space-6, 24px)",
    alignItems: "start",
    gridTemplateColumns: wide ? "minmax(0, 264px) minmax(0, 1fr) minmax(0, 316px)" : "minmax(0, 1fr)",
  } as const;
  const paneHeadStyle = { margin: "0 0 10px" } as const;

  return (
    <>
      <div style={gridStyle}>
        <SourceRail
          disabled={analyzeStatus === "reading"}
          source={source}
          activeFixture={activeFixture}
          onFixture={onFixture}
          onFile={onFile}
        />

        <section aria-label={label("studio.stageAria")} style={{ minWidth: 0 }}>
          <p className="mono-label" style={paneHeadStyle}>
            {label("studio.stage")}
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
                ? label("studio.stageCaption")
                    .replace("{source}", source?.name ?? label("studio.stageSourceFallback"))
                    .replace("{style}", generation.project.style)
                    .replace("{seed}", generation.project.seed)
                : label("studio.stageCaptionEmpty")
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

      {/* the visualize block back on the route: the image→mesh pipeline
          plus the real 3d viewport, rendering locally in the page canvas */}
      <div style={{ marginTop: 26 }}>
        <VisualizePanel />
      </div>

      {/* the transcode pipeline bench: the 24-stage walk over the gateway's
          node lane — the probe, the plan and the stage records all answer
          from the engine itself, the catalog read riding the same client */}
      <div style={{ marginTop: 26 }}>
        <PipelineBench />
      </div>
    </>
  );
}

export default StudioBench;
