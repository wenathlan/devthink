/**
 * exportrow.tsx — the export + gallery-handoff row under the stage, self
 * contained on the silk law (panel-silk surface, the neutral actions on
 * silk-btn, the accent save on .btn): download
 * the svg master via a blob URL, rasterize a png through OffscreenCanvas when
 * the browser has it (graceful no-op otherwise), copy the reportDigest, and
 * save to the gallery in the documented dual mode:
 *   gateway — /api/health answered { ok: true } within the 800 ms
 *             AbortController budget → POST /api/generate persists the
 *             project server-side;
 *   local   — the probe failed → the project is recorded in this page's
 *             in-memory session list only (never browser storage) and a quiet
 *             "local session" badge says so.
 * Both modes append a SessionSave row so the session shows exactly what
 * happened and where each record lives.
 */

import { ArrowDownloadRegular, CheckmarkRegular, ImageRegular, SaveRegular } from "@fluentui/react-icons";
import { useCallback, useState } from "react";
import { type AnalysisReport, reportDigest } from "../../audiopipeline.ts";
import type { ImageProject } from "../../imageproject.ts";
import { label } from "../../labels.ts";
import {
  downloadBlob,
  pngFromSvg,
  pngSupported,
  probeGateway,
  type SessionSave,
  saveToGateway,
} from "../../studiogenerate.ts";

type ExportRowProps = {
  svg: string | null;
  project: ImageProject | null;
  report: AnalysisReport | null;
  styleName: string;
  seed: string;
  session: readonly SessionSave[];
  onRecordSave: (project: ImageProject, mode: "gateway" | "local", id: string) => void;
};

/** The export row: downloads, digest copy, dual-mode gallery handoff, session list. */
export function ExportRow({ svg, project, report, styleName, seed, session, onRecordSave }: ExportRowProps) {
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [lastMode, setLastMode] = useState<"gateway" | "local" | null>(null);
  const pngReady = pngSupported();

  /** the svg master download (blob URL + anchor click). */
  const onSvg = useCallback(() => {
    if (!svg || !project) return;
    try {
      downloadBlob(`${project.id}.svg`, svg, "image/svg+xml;charset=utf-8");
      setNote(label("studio.export.downloadedSvg").replace("{name}", `${project.id}.svg`));
    } catch (error) {
      setNote(
        label("studio.export.svgFailed").replace(
          "{message}",
          error instanceof Error ? error.message : label("studio.export.unknownError"),
        ),
      );
    }
  }, [svg, project]);

  /** the png raster: OffscreenCanvas path or the documented graceful no-op. */
  const onPng = useCallback(async () => {
    if (!svg || !project) return;
    try {
      const blob = await pngFromSvg(svg, project.canvas.width, project.canvas.height);
      if (!blob) {
        setNote(label("studio.export.pngFallback"));
        return;
      }
      downloadBlob(`${project.id}.png`, blob, "image/png");
      setNote(
        label("studio.export.downloadedPng")
          .replace("{name}", `${project.id}.png`)
          .replace("{w}", String(project.canvas.width))
          .replace("{h}", String(project.canvas.height)),
      );
    } catch (error) {
      setNote(
        label("studio.export.pngFailed").replace(
          "{message}",
          error instanceof Error ? error.message : label("studio.export.unknownError"),
        ),
      );
    }
  }, [svg, project]);

  /** copies the reportDigest line. */
  const onCopy = useCallback(async () => {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(reportDigest(report));
      setCopied(true);
      setNote(label("studio.export.digestCopied"));
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setNote(label("studio.export.clipboardRefused"));
    }
  }, [report]);

  /** the dual-mode save: gateway when healthy within 800 ms, local session otherwise. */
  const onSave = useCallback(async () => {
    if (!project || !report || saving) return;
    setSaving(true);
    setNote(null);
    try {
      const healthy = await probeGateway(800);
      if (healthy) {
        const id = await saveToGateway(report, styleName, seed);
        setLastMode("gateway");
        onRecordSave(project, "gateway", id);
        setNote(label("studio.export.savedGateway").replace("{id}", id));
      } else {
        setLastMode("local");
        onRecordSave(project, "local", project.id);
        setNote(label("studio.export.savedLocal"));
      }
    } catch (error) {
      setLastMode("local");
      onRecordSave(project, "local", project.id);
      setNote(
        label("studio.export.saveFailed").replace(
          "{message}",
          error instanceof Error ? error.message : label("studio.export.unknownError"),
        ),
      );
    } finally {
      setSaving(false);
    }
  }, [project, report, saving, styleName, seed, onRecordSave]);

  const ready = svg !== null && project !== null;

  return (
    <section aria-label={label("studio.export.paneAria")} className="panel-silk" style={{ marginTop: 22, minWidth: 0 }}>
      <p className="mono-label" style={{ margin: "0 0 8px" }}>
        {label("studio.export.head")}
      </p>
      <div className="row row--wrap" style={{ gap: 8 }}>
        <button type="button" className="silk-btn" disabled={!ready} onClick={onSvg}>
          <ArrowDownloadRegular fontSize={14} aria-hidden="true" />
          {label("studio.export.svg")}
        </button>
        <button
          type="button"
          className="silk-btn"
          disabled={!ready || !pngReady}
          data-tip={
            pngReady
              ? label("studio.export.pngTipReady")
                  .replace("{w}", String(project?.canvas.width ?? 0))
                  .replace("{h}", String(project?.canvas.height ?? 0))
              : label("studio.export.pngTipUnsupported")
          }
          onClick={onPng}
        >
          <ImageRegular fontSize={14} aria-hidden="true" />
          {label("studio.export.png")}
        </button>
        <button type="button" className={copied ? "silk-btn success" : "silk-btn"} disabled={!report} onClick={onCopy}>
          {copied ? <CheckmarkRegular fontSize={14} aria-hidden="true" /> : null}
          {label("studio.export.copyDigest")}
        </button>
        <button
          type="button"
          className="btn"
          disabled={!ready || saving}
          aria-busy={saving ? "true" : undefined}
          onClick={onSave}
        >
          <SaveRegular fontSize={14} aria-hidden="true" />
          {label("studio.export.saveGallery")}
        </button>
        {lastMode === "local" && <span className="badge">{label("studio.export.localBadge")}</span>}
      </div>

      <p role="status" aria-live="polite" style={{ margin: "10px 0 0", fontSize: "0.82rem", color: "var(--ink-2)" }}>
        {note ?? (report && !ready ? label("studio.export.unlock") : label("studio.export.defaultNote"))}
      </p>

      {session.length > 0 && (
        <div style={{ marginTop: 14, borderTop: "1px solid var(--line)" }}>
          <p className="mono-label" style={{ margin: "10px 0 4px" }}>
            {label("studio.export.sessionSaves").replace("{n}", String(session.length))}
          </p>
          {session.map((item) => (
            <div
              key={`${item.id} ${item.at}`}
              className="row"
              style={{
                justifyContent: "space-between",
                gap: 10,
                padding: "4px 0",
                borderBottom: "1px solid var(--line)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.7rem",
                  color: "var(--ink-2)",
                  fontVariantNumeric: "tabular-nums",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {label("studio.export.sessionLine")
                  .replace("{id}", item.id)
                  .replace("{style}", item.style)
                  .replace("{bpm}", String(item.bpm))}
              </span>
              <span
                className="mono-label"
                style={{ flex: "none", color: item.mode === "gateway" ? "var(--ok)" : "var(--ink-3)" }}
              >
                {item.mode === "gateway" ? label("studio.export.modeGateway") : label("studio.export.modeLocal")}
              </span>
            </div>
          ))}
        </div>
      )}

      <p style={{ margin: "10px 0 0", fontSize: "0.72rem", color: "var(--ink-3)", lineHeight: 1.5 }}>
        {label("studio.export.dualMode")}
      </p>
    </section>
  );
}

export default ExportRow;
