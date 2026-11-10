/**
 * StudioPipeline.tsx — the transcode pipeline bench of the studio remount
 * (the detailed engine wave): the 24-stage walk of the transcode engine,
 * mounted through the gateway's node lane the same way the gallery reads
 * its rows. The bench owns no engine copy:
 *
 * - the catalog (the 30 modes, the p1..p7 preset ladder, the 24 stage
 *   table, the toolchain versions) reads off GET /api/pipeline — the
 *   engine's own tables, never a hardcoded row;
 * - the probe derives from the input name server-side (probefromname), the
 *   plan folds the bench's ladder through the engine's own planner
 *   (buildTranscodePlan — "the caller owns the table": the ladder is this
 *   surface's own material, the same law the stock slate bin answers), and
 *   the walk answers the REAL stage records — skip rules, gpu flags, the
 *   ffmpeg argv the gpu stages synthesize and the sealed passage frames
 *   the channel pushes at stage 20;
 * - the encoder row answers createoptimal (the vendor policy) and the
 *   output profile follows the engine's own recommendations
 *   (recommendpreset, evenDimension, the probe's own facts).
 *
 * The honest states answer the lifecycle: reading rides the sr status,
 * offline offers the retry (the walk needs the node lane — never a faked
 * stage), refused surfaces the gateway's own error codes. Every word rides
 * the label store; the engine's own strings (mode notes, stage names,
 * encoder reasons) render as data, the way the gallery renders styles.
 */

import { WifiOffRegular } from "@fluentui/react-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchPipelineCatalog,
  type GatewayClientError,
  type PipelineCatalog,
  type PipelineRun,
  runGatewayPipeline,
} from "../../gateway.ts";
import { label } from "../../labels.ts";
import type { TranscodeRung } from "../../transcode.ts";
import { EmptyState } from "./ShellEmptystate.tsx";

/** the input the probe derives from — the engine's own demo derivation path
 * (the same name its battery walks; editing the name re-derives the probe). */
const DEFAULT_INPUT = "/data/in/demo_4k_hdr10plus_interlaced.mp4";

/** the demo mode of the pool orchestrator (the catalog's own note names it). */
const DEFAULT_MODE = "hevc_hdr_to_av1_sdr_tonemap";

/** the ladder the bench ships (the engine's law: "the caller owns the table —
 * zero hardcode here" — this surface is the caller, the same material law
 * the stock slate bin of the editor answers). */
const LADDER: readonly TranscodeRung[] = [
  { id: "2160p", height: 2160, videoCodec: "av01", audioCodec: "opus", videoBitrate: "16M", audioBitrate: "256K" },
  { id: "1080p", height: 1080, videoCodec: "av01", audioCodec: "opus", videoBitrate: "8M", audioBitrate: "192K", fps: 60 },
  { id: "720p", height: 720, videoCodec: "avc1", audioCodec: "mp4a", videoBitrate: "4M", audioBitrate: "128K" },
  { id: "480p", height: 480, videoCodec: "avc1", audioCodec: "mp4a", videoBitrate: "2M", audioBitrate: "96K" },
];

/** the codecs the output profile carries (the engine's own union). */
const CODECS: readonly ("h264" | "hevc" | "av1")[] = ["av1", "hevc", "h264"];

/** the lifecycle of the catalog read. */
type CatalogState = "reading" | "online" | "offline";

/** the lifecycle of one walk. */
type RunState = "idle" | "running" | "ready" | "error";

/** one megabyte round for the size lines (the honest ~ spelling). */
const mb = (bytes: number): string => String(Math.max(1, Math.round(bytes / 1_000_000)));

/**
 * PipelineBench — the 24-stage transcode walk over the gateway lane.
 *
 * @returns the bench element with its honest catalog states.
 */
export function PipelineBench() {
  const [catalog, setCatalog] = useState<PipelineCatalog | null>(null);
  const [catalogState, setCatalogState] = useState<CatalogState>("reading");
  const [inputpath, setInputpath] = useState<string>(DEFAULT_INPUT);
  const [mode, setMode] = useState<string>(DEFAULT_MODE);
  const [codec, setCodec] = useState<"h264" | "hevc" | "av1">("av1");
  const [runState, setRunState] = useState<RunState>("idle");
  const [run, setRun] = useState<PipelineRun | null>(null);
  const [runError, setRunError] = useState<string | null>(null);

  /** loads the engine's own tables; failure lands in the honest offline state. */
  const loadCatalog = useCallback((live: () => boolean): void => {
    setCatalogState("reading");
    fetchPipelineCatalog()
      .then((tables) => {
        if (!live()) return;
        setCatalog(tables);
        setCatalogState("online");
      })
      .catch(() => {
        if (live()) setCatalogState("offline");
      });
  }, []);

  useEffect(() => {
    let live = true;
    loadCatalog(() => live);
    return () => {
      live = false;
    };
  }, [loadCatalog]);

  /** runs one walk: the 24 stages over the deterministic probe. */
  const onRun = useCallback(() => {
    if (runState === "running") return;
    setRunState("running");
    setRunError(null);
    runGatewayPipeline({ inputpath, mode: mode as PipelineRun["mode"], videocodec: codec, ladder: LADDER })
      .then((answer) => {
        setRun(answer);
        setRunState("ready");
      })
      .catch((error: unknown) => {
        setRun(null);
        const status = (error as GatewayClientError).status ?? 0;
        const detail = error instanceof Error ? error.message : "";
        setRunError(
          status === 0
            ? label("studio.pipeline.offlineTitle")
            : label("studio.pipeline.refused").replace("{message}", detail),
        );
        setRunState("error");
      });
  }, [runState, inputpath, mode, codec]);

  const modeNote = useMemo(() => catalog?.modes.find((row) => row.mode === mode)?.note ?? "", [catalog, mode]);
  const versions = catalog?.versions;
  /** the first real failure of the walk (fail-fast stops there) — null when every stage answered. */
  const failure = useMemo(
    () => run?.result.metrics.find((record) => !record.success && !record.skipped) ?? null,
    [run],
  );

  return (
    <section className="panel-silk card-gap" aria-label={label("studio.pipeline.paneAria")}>
      <p className="mono-label" style={{ margin: "0 0 8px" }}>
        {label("studio.pipeline.head")}
      </p>
      <p className="p-sm" style={{ marginTop: 0 }}>
        {label("studio.pipeline.lede")}
      </p>

      {catalogState === "reading" && (
        <p role="status" aria-live="polite" className="p-sm" style={{ color: "var(--ink-2)" }}>
          {label("studio.pipeline.readingSr")}
        </p>
      )}
      {catalogState === "offline" && (
        <EmptyState
          icon={WifiOffRegular}
          title={label("studio.pipeline.offlineTitle")}
          line={label("studio.pipeline.offlineLine")}
          action={
            <button type="button" className="btn btn--ghost" style={{ minHeight: 40 }} onClick={() => loadCatalog(() => true)}>
              {label("studio.pipeline.retry")}
            </button>
          }
        />
      )}

      {catalogState === "online" && catalog && (
        <>
          <div className="grid cols-3" style={{ marginTop: 14 }}>
            <div className="field">
              <label htmlFor="pipeline-input">{label("studio.pipeline.input")}</label>
              <input
                id="pipeline-input"
                type="text"
                className="input"
                value={inputpath}
                spellCheck={false}
                aria-label={label("studio.pipeline.inputAria")}
                onChange={(event) => setInputpath(event.currentTarget.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="pipeline-mode">{label("studio.pipeline.mode")}</label>
              <select
                id="pipeline-mode"
                className="input"
                value={mode}
                aria-label={label("studio.pipeline.modeAria")}
                onChange={(event) => setMode(event.currentTarget.value)}
              >
                {catalog.modes.map((row) => (
                  <option key={row.mode} value={row.mode}>
                    {row.mode}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="pipeline-codec">{label("studio.pipeline.codec")}</label>
              <select
                id="pipeline-codec"
                className="input"
                value={codec}
                aria-label={label("studio.pipeline.codecAria")}
                onChange={(event) => {
                  const next = event.currentTarget.value;
                  if (next === "h264" || next === "hevc" || next === "av1") setCodec(next);
                }}
              >
                {CODECS.map((entry) => (
                  <option key={entry} value={entry}>
                    {entry}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {modeNote && (
            <p className="mono-label" style={{ margin: "0 0 12px" }}>
              {modeNote}
            </p>
          )}

          <div className="btn-row" style={{ marginTop: 4 }}>
            <button
              type="button"
              className="btn"
              style={{ minHeight: 40 }}
              aria-busy={runState === "running"}
              disabled={runState === "running"}
              onClick={onRun}
            >
              {label("studio.pipeline.run")}
            </button>
            {versions && (
              <span className="mono-label" style={{ alignSelf: "center", marginLeft: "auto", textAlign: "right" }}>
                {label("studio.pipeline.versions")
                  .replace("{ffmpeg}", String(versions.ffmpeg))
                  .replace("{nvenc}", String(versions.nvencSdk))
                  .replace("{cuda}", String(versions.cuda))
                  .replace("{stages}", String(versions.stages))
                  .replace("{modes}", String(versions.modes))}
              </span>
            )}
          </div>

          <p role="status" aria-live="polite" className="p-sm" style={{ margin: "10px 0 0", color: "var(--ink-2)" }}>
            {runState === "running" ? label("studio.pipeline.running") : ""}
            {runState === "error" && runError ? runError : ""}
          </p>

          {run && (
            <div className="stack" style={{ marginTop: 16 }}>
              {/* PROBE — the engine's own derivation from the input name */}
              <div>
                <p className="mono-label" style={{ margin: "0 0 6px", color: "var(--accent)" }}>
                  {label("studio.pipeline.probeHead")}
                </p>
                <div className="row row--wrap" style={{ gap: "6px 18px" }}>
                  {run.probe.video && (
                    <span className="mono-label">
                      {label("studio.pipeline.probeVideo")
                        .replace("{codec}", run.probe.video.codec)
                        .replace("{w}", String(run.probe.video.width))
                        .replace("{h}", String(run.probe.video.height))
                        .replace("{fps}", String(run.probe.video.fps))
                        .replace("{depth}", String(run.probe.video.bitdepth))
                        .replace(
                          "{hdr}",
                          run.probe.video.hdr ? label("studio.pipeline.probeVideoHdr") : "",
                        )
                        .replace(
                          "{interlaced}",
                          run.probe.video.interlaced ? label("studio.pipeline.probeVideoInterlaced") : "",
                        )}
                    </span>
                  )}
                  {run.probe.audio.map((track, index) => (
                    <span key={`${track.codec}-${index}`} className="mono-label">
                      {label("studio.pipeline.probeAudio")
                        .replace("{codec}", track.codec)
                        .replace("{rate}", String(track.samplerate))
                        .replace("{ch}", String(track.channels))}
                    </span>
                  ))}
                  <span className="mono-label">
                    {label("studio.pipeline.probeDuration").replace("{s}", String(Math.round(run.probe.durationsec)))}
                  </span>
                  <span className="mono-label">
                    {label("studio.pipeline.probeWorkingSet").replace(
                      "{mb}",
                      String(Math.round(run.probe.estimatedworkingsetmb)),
                    )}
                  </span>
                </div>
              </div>

              {/* PLAN — the ladder folded through the engine's own planner */}
              <div>
                <p className="mono-label" style={{ margin: "0 0 6px", color: "var(--accent)" }}>
                  {label("studio.pipeline.planHead")}
                </p>
                {run.plan.variants.map((variant) => (
                  <div key={variant.rung.id} className="rail-kv">
                    <span>{variant.rung.id}</span>
                    <strong>
                      {label("studio.pipeline.planRow")
                        .replace("{id}", variant.rung.id)
                        .replace("{w}", String(variant.width))
                        .replace("{h}", String(variant.height))
                        .replace("{fps}", String(variant.fps))
                        .replace("{codec}", variant.rung.videoCodec)
                        .replace("{container}", variant.container)
                        .replace("{mb}", mb(variant.estimatedBytes))}
                    </strong>
                  </div>
                ))}
                <div className="rail-kv">
                  <span>{label("studio.pipeline.planTotal").replace("{mb}", mb(run.plan.estimatedBytes))}</span>
                  <strong>
                    {label("studio.pipeline.summary")
                      .replace("{n}", String(run.result.metrics.length))
                      .replace("{skipped}", String(run.result.metrics.filter((row) => row.skipped).length))
                      .replace("{frames}", String(run.result.passageframes))}
                  </strong>
                </div>
              </div>

              {/* ENCODER — the createoptimal policy over the job and probe */}
              <div>
                <p className="mono-label" style={{ margin: "0 0 6px", color: "var(--accent)" }}>
                  {label("studio.pipeline.encoderHead")}
                </p>
                <div className="rail-kv">
                  <span>
                    {run.result.success
                      ? label("studio.pipeline.success")
                      : label("studio.pipeline.failed")
                          .replace("{stage}", failure?.stage ?? "—")
                          .replace("{error}", failure?.error ?? "")}
                  </span>
                  <strong>
                    {label("studio.pipeline.encoderRow")
                      .replace("{vendor}", run.encoder.vendor)
                      .replace("{preset}", run.encoder.preset)
                      .replace("{instances}", String(run.encoder.maxinstances))}
                  </strong>
                </div>
                <p className="mono-label" style={{ margin: "6px 0 0", lineHeight: 1.6 }}>
                  {run.encoder.reason}
                </p>
              </div>

              {/* STAGES — the actual walk records, 24 rows */}
              <div>
                <p className="mono-label" style={{ margin: "0 0 6px", color: "var(--accent)" }}>
                  {label("studio.pipeline.stagesHead")
                    .replace("{n}", String(run.result.metrics.length))
                    .replace("{total}", String(catalog.stages.length))}
                </p>
                <ul
                  style={{
                    listStyle: "none",
                    margin: 0,
                    padding: 0,
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(236px, 1fr))",
                    gap: 6,
                  }}
                >
                  {run.result.metrics.map((record) => (
                    <li
                      key={record.stage}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "5px 8px",
                        border: "1px solid var(--line)",
                        borderRadius: "var(--win-radius-ctl)",
                        minHeight: 30,
                      }}
                      aria-label={`${record.stage} — ${
                        record.skipped
                          ? label("studio.pipeline.stageSkipped")
                          : record.success
                            ? label("studio.pipeline.stageDone")
                            : label("studio.pipeline.stageFailed")
                      }`}
                    >
                      <span className="mono-label" style={{ margin: 0, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {record.stage}
                      </span>
                      {record.gpurequired && (
                        <span className="mono-label" style={{ margin: 0, color: "var(--rose-500)" }}>
                          {label("studio.pipeline.stageGpu")}
                        </span>
                      )}
                      <span
                        className="mono-label"
                        style={{
                          margin: 0,
                          color: record.skipped
                            ? "var(--ink-3)"
                            : record.success
                              ? "var(--ok)"
                              : "var(--err)",
                        }}
                      >
                        {record.skipped
                          ? label("studio.pipeline.stageSkipped")
                          : record.success
                            ? label("studio.pipeline.stageDone")
                            : label("studio.pipeline.stageFailed")}
                      </span>
                    </li>
                  ))}
                </ul>
                {run.result.metrics
                  .filter((record) => !record.success && !record.skipped)
                  .map((record) => (
                    <p key={`err-${record.stage}`} role="alert" className="mono-label" style={{ margin: "6px 0 0", color: "var(--err)" }}>
                      {record.stage}: {record.error}
                    </p>
                  ))}
              </div>

              {/* FFMPEG PREVIEW — the argv the gpu stages really synthesize */}
              {run.result.ffmpegpreview.length > 0 && (
                <div>
                  <p className="mono-label" style={{ margin: "0 0 6px", color: "var(--accent)" }}>
                    {label("studio.pipeline.ffmpegHead")}
                  </p>
                  <p className="mono-label" style={{ margin: "0 0 6px" }}>
                    {label("studio.pipeline.ffmpegLine")}
                  </p>
                  <div
                    style={{
                      maxHeight: 200,
                      overflow: "auto",
                      border: "1px solid var(--line)",
                      borderRadius: "var(--win-radius-ctl)",
                      padding: "10px 12px",
                      background: "var(--surface-2)",
                    }}
                  >
                    {run.result.ffmpegpreview.map((line, index) => (
                      <p key={`ff-${index}`} className="mono-label" style={{ margin: "0 0 8px", lineHeight: 1.7, overflowWrap: "anywhere" }}>
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default PipelineBench;
