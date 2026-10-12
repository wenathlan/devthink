/**
 * export-row.tsx — the export + gallery-handoff row under the stage: download
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

import { Check, Download, Image, Save } from "lucide-react";
import { useCallback, useState } from "react";
import { type AnalysisReport, reportDigest } from "../../audiopipeline.ts";
import type { ImageProject } from "../../imageproject.ts";
import { downloadBlob, pngFromSvg, pngSupported, probeGateway, type SessionSave, saveToGateway } from "./generate.ts";

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
      setNote(`downloaded ${project.id}.svg`);
    } catch (error) {
      setNote(`svg download failed: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  }, [svg, project]);

  /** the png raster: OffscreenCanvas path or the documented graceful no-op. */
  const onPng = useCallback(async () => {
    if (!svg || !project) return;
    try {
      const blob = await pngFromSvg(svg, project.canvas.width, project.canvas.height);
      if (!blob) {
        setNote("png export needs OffscreenCanvas support — this browser falls back to the svg master.");
        return;
      }
      downloadBlob(`${project.id}.png`, blob, "image/png");
      setNote(`downloaded ${project.id}.png (${project.canvas.width}×${project.canvas.height})`);
    } catch (error) {
      setNote(`png export failed: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  }, [svg, project]);

  /** copies the reportDigest line. */
  const onCopy = useCallback(async () => {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(reportDigest(report));
      setCopied(true);
      setNote("digest copied to the clipboard");
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setNote("the clipboard refused the write — select the digest line instead.");
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
        setNote(`saved to the gallery gateway as ${id}`);
      } else {
        setLastMode("local");
        onRecordSave(project, "local", project.id);
        setNote("gateway unreachable — the project is kept as a local session record.");
      }
    } catch (error) {
      setLastMode("local");
      onRecordSave(project, "local", project.id);
      setNote(
        `gateway save failed (${error instanceof Error ? error.message : "unknown error"}) — kept as a local session record.`,
      );
    } finally {
      setSaving(false);
    }
  }, [project, report, saving, styleName, seed, onRecordSave]);

  const ready = svg !== null && project !== null;

  return (
    <section aria-label="export and gallery handoff" style={{ marginTop: 22, minWidth: 0 }}>
      <p className="mono-label" style={{ margin: "0 0 8px" }}>
        export
      </p>
      <div className="row row--wrap" style={{ gap: 8 }}>
        <button type="button" className="btn secondary" disabled={!ready} onClick={onSvg}>
          <Download size={14} strokeWidth={1.7} aria-hidden="true" />
          svg
        </button>
        <button
          type="button"
          className="btn secondary"
          disabled={!ready || !pngReady}
          title={
            pngReady
              ? `png ${project?.canvas.width ?? 0}×${project?.canvas.height ?? 0}`
              : "png export needs OffscreenCanvas support"
          }
          onClick={onPng}
        >
          <Image size={14} strokeWidth={1.7} aria-hidden="true" />
          png
        </button>
        <button type="button" className="btn secondary" disabled={!report} onClick={onCopy}>
          {copied ? <Check size={14} strokeWidth={2} aria-hidden="true" /> : null}
          copy digest
        </button>
        <button
          type="button"
          className="btn"
          disabled={!ready || saving}
          aria-busy={saving ? "true" : undefined}
          onClick={onSave}
        >
          <Save size={14} strokeWidth={1.7} aria-hidden="true" />
          save to gallery
        </button>
        {lastMode === "local" && <span className="badge">local session · in-memory</span>}
      </div>

      <p role="status" aria-live="polite" style={{ margin: "10px 0 0", fontSize: "0.82rem", color: "var(--ink-2)" }}>
        {note ??
          (report && !ready
            ? "generate a frame to unlock the export row."
            : "the svg master is the always-shipped artifact; png rides OffscreenCanvas when present.")}
      </p>

      {session.length > 0 && (
        <div style={{ marginTop: 14, borderTop: "1px solid var(--line)" }}>
          <p className="mono-label" style={{ margin: "10px 0 4px" }}>
            session saves ({session.length})
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
                {item.id} · {item.style} · bpm {item.bpm}
              </span>
              <span
                className="mono-label"
                style={{ flex: "none", color: item.mode === "gateway" ? "var(--ok)" : "var(--ink-3)" }}
              >
                {item.mode}
              </span>
            </div>
          ))}
        </div>
      )}

      <p style={{ margin: "10px 0 0", fontSize: "0.72rem", color: "var(--ink-3)", lineHeight: 1.5 }}>
        dual mode: when /api/health answers within 800 ms the save persists in the gallery gateway; otherwise the record
        stays in this page's memory for the session only — nothing is written to storage.
      </p>
    </section>
  );
}

export default ExportRow;
