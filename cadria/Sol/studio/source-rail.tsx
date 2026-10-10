/**
 * source-rail.tsx — the LEFT pane of the generation studio: the upload
 * dropzone (a real button + a hidden file input, fully keyboard operable —
 * drag is a bonus, never the only path) and the three built-in fixtures
 * reused from the intro demo, plus the compact meta rows of the active
 * source. Presentation only: the decode/analyze work lives in source.ts and
 * the anchor owns the state.
 */

import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { type DemoFixtureId, demoFixtures } from "../intro/fixtures.ts";
import type { StudioSource } from "./source.ts";

/** the input's accept list — wav rides the native path, the rest web audio. */
const ACCEPT = ".wav,.mp3,.ogg,.flac,.m4a,audio/*";

type SourceRailProps = {
  /** disables picking while a read is in flight */
  disabled: boolean;
  source: StudioSource | null;
  activeFixture: DemoFixtureId | null;
  onFixture: (id: DemoFixtureId) => void;
  onFile: (file: File) => void;
};

/** one compact meta row of the active source (mono label, tabular value). */
function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="row"
      style={{
        justifyContent: "space-between",
        gap: 10,
        padding: "6px 0",
        borderBottom: "1px solid var(--line)",
        minHeight: 0,
      }}
    >
      <span className="mono-label" style={{ flex: "none" }}>
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.72rem",
          color: "var(--ink)",
          fontVariantNumeric: "tabular-nums",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </span>
    </div>
  );
}

/** human file size for the meta rows. */
function sizeLine(bytes: number): string {
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} mb`;
  return `${Math.max(1, Math.round(bytes / 1024))} kb`;
}

/** The source rail: dropzone, fixture chips, source meta. */
export function SourceRail({ disabled, source, activeFixture, onFixture, onFile }: SourceRailProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fixtures = demoFixtures();

  /** the keyboard/pointer path into the file picker. */
  const browse = (): void => {
    if (disabled) return;
    inputRef.current?.click();
  };

  return (
    <aside aria-label="audio source" style={{ minWidth: 0 }}>
      <p className="mono-label" style={{ margin: "0 0 10px" }}>
        source
      </p>

      <button
        type="button"
        className="btn btn--ghost"
        onClick={browse}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          if (disabled) return;
          const file = event.dataTransfer.files?.[0];
          if (file) onFile(file);
        }}
        disabled={disabled}
        style={{
          width: "100%",
          flexDirection: "column",
          gap: 6,
          padding: "18px 12px",
          borderStyle: "dashed",
          borderColor: dragOver ? "var(--accent)" : undefined,
          color: dragOver ? "var(--accent)" : undefined,
        }}
      >
        <Upload size={18} strokeWidth={1.7} aria-hidden="true" />
        <span>drop audio here — or press to browse</span>
        <span style={{ fontSize: "0.7rem", fontWeight: 500, color: "var(--ink-3)" }}>
          wav decodes natively · mp3/ogg/flac/m4a via web audio
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        hidden
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          if (file) onFile(file);
          event.currentTarget.value = "";
        }}
      />

      <fieldset
        aria-label="built-in synthetic fixtures"
        style={{ border: 0, margin: "14px 0 0", padding: 0, display: "grid", gap: 6 }}
      >
        {fixtures.map((fixture) => {
          const active = activeFixture === fixture.id;
          return (
            <button
              key={fixture.id}
              type="button"
              className="chip"
              title={fixture.detail}
              aria-pressed={active ? "true" : "false"}
              disabled={disabled}
              onClick={() => onFixture(fixture.id)}
              style={{
                justifyContent: "space-between",
                gap: 10,
                minHeight: 44,
                padding: "0 12px",
                borderRadius: "var(--radius-md)",
                borderColor: active ? "var(--accent)" : undefined,
                color: active ? "var(--accent)" : undefined,
              }}
            >
              <span>{fixture.name}</span>
              <span style={{ color: "var(--ink-3)" }}>{fixture.detail}</span>
            </button>
          );
        })}
      </fieldset>

      {source && (
        <div style={{ marginTop: 14, borderTop: "1px solid var(--line-strong)" }}>
          <MetaRow label="name" value={source.name} />
          <MetaRow label="path" value={source.detail} />
          <MetaRow label="rate" value={`${source.sampleRate} hz`} />
          <MetaRow label="channels" value={String(source.channels)} />
          <MetaRow label="length" value={`${(source.durationMs / 1000).toFixed(2)} s`} />
          <MetaRow label="bytes" value={sizeLine(source.sizeBytes)} />
        </div>
      )}
    </aside>
  );
}

export default SourceRail;
