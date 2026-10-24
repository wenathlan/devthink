/**
 * ingest page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file.
 */

// # Ingest — the decomposition bench of the katexis engine (the owner's first
// demonstrative step): one real track goes in, the parametrized ingest
// document goes out and lands in the library db for the pattern miner to
// pre-train the composer. The flow reads exactly like the engine speaks:
// decode (file → mono pcm over decodeAudioData), separate (the hpss pass
// splits harmonic and percussive stems, mix-conserving), analyze (the shared
// chain reports the mix and each stem), segment (one vector frame per
// second — centroid, flatness, chroma, bands, onsets), store (the gateway
// first, the offline mirror when the platform is away). Every stage yields
// to the paint between steps, so the bench shows the engine working instead
// of freezing. The shelf below lists what the library already holds and
// drops what it must not keep.

import {
  ArrowDownloadRegular,
  ArrowUploadRegular,
  CheckmarkRegular,
  CopyRegular,
  DataUsageRegular,
  DeleteRegular,
  MusicNote2Regular,
} from "@fluentui/react-icons";
import { type ChangeEvent, type DragEvent, useEffect, useRef, useState } from "react";
import { formatClock } from "../../dawview.ts";
import { type IngestDocument, ingestPcm } from "../../ingest.ts";
import { droppingest, type IngestRecord, listingests, saveingest } from "../../ingeststore.ts";
import { label, labelfill, type LabelKey } from "../../labels.ts";
import { Shell } from "../shell/Shell.tsx";
import { useToast } from "../toast/Toast.tsx";

/** The decode/analysis phases the bench walks through, in order (the ids
 * ride the state machine; the label and detail keys answer the label store). */
const PHASES: readonly { id: BenchPhase; labelKey: LabelKey; detailKey: LabelKey }[] = [
  { id: "idle", labelKey: "ingest.phase.waiting", detailKey: "ingest.phase.waitingDetail" },
  { id: "decode", labelKey: "ingest.phase.decode", detailKey: "ingest.phase.decodeDetail" },
  { id: "separate", labelKey: "ingest.phase.separate", detailKey: "ingest.phase.separateDetail" },
  { id: "analyze", labelKey: "ingest.phase.analyze", detailKey: "ingest.phase.analyzeDetail" },
  { id: "segment", labelKey: "ingest.phase.segment", detailKey: "ingest.phase.segmentDetail" },
  { id: "ready", labelKey: "ingest.phase.ready", detailKey: "ingest.phase.readyDetail" },
  { id: "error", labelKey: "ingest.phase.error", detailKey: "ingest.phase.errorDetail" },
];

type BenchPhase = "idle" | "decode" | "separate" | "analyze" | "segment" | "ready" | "error";

/** Yields to the paint loop so a phase label lands on screen before the
 * heavy synchronous work of the next one blocks the main thread. */
const tick = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 30));

/** Reads one audio file into mono float pcm (all channels averaged). */
async function decodeMono(file: File): Promise<{ mono: Float32Array; sampleRate: number }> {
  const bytes = await file.arrayBuffer();
  const ctx = new OfflineAudioContext(1, 1, 44100);
  const buffer = await ctx.decodeAudioData(bytes);
  const channels = buffer.numberOfChannels;
  const mono = new Float32Array(buffer.length);
  for (let ch = 0; ch < channels; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < data.length; i++) mono[i] += data[i] / channels;
  }
  return { mono, sampleRate: buffer.sampleRate };
}

/** The stem card the bench shows one analyzed stem in. */
function StemCard({
  title,
  icon,
  rms,
  peak,
  onsets,
  seconds,
  hash,
}: {
  title: string;
  icon: React.ReactNode;
  rms: number;
  peak: number;
  onsets: number;
  seconds: number;
  hash: number;
}) {
  return (
    <article className="ing-card">
      <p className="ing-card-head">
        {icon}
        {title}
      </p>
      <dl className="ing-dl">
        <div>
          <dt>{label("ingest.card.rms")}</dt>
          <dd>{rms.toFixed(4)}</dd>
        </div>
        <div>
          <dt>{label("ingest.card.peak")}</dt>
          <dd>{peak.toFixed(4)}</dd>
        </div>
        <div>
          <dt>{label("ingest.card.onsets")}</dt>
          <dd>{onsets}</dd>
        </div>
        <div>
          <dt>{label("ingest.card.frames")}</dt>
          <dd>{seconds}</dd>
        </div>
        <div>
          <dt>{label("ingest.card.hash")}</dt>
          <dd>
            <code>{(hash >>> 0).toString(16)}</code>
          </dd>
        </div>
      </dl>
    </article>
  );
}

/** The ingest surface: the bench, the document preview and the shelf. */
function IngestSurface() {
  const toast = useToast();
  const [phase, setPhase] = useState<BenchPhase>("idle");
  const [fileName, setFileName] = useState("");
  const [doc, setDoc] = useState<IngestDocument | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<"db" | "offline" | null>(null);
  const [drag, setDrag] = useState(false);
  const [records, setRecords] = useState<readonly IngestRecord[]>([]);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadShelf = (): void => {
    listingests().then((rows) => setRecords(rows));
  };
  useEffect(loadShelf, []);

  /** The bench flow: each phase yields to the paint, the document assembles
   * once and the shelf reloads after a save. */
  const ingest = async (file: File): Promise<void> => {
    setDoc(null);
    setSaved(null);
    setFileName(file.name.replace(/\.[^.]+$/, ""));
    try {
      setPhase("decode");
      await tick();
      const { mono, sampleRate } = await decodeMono(file);
      setPhase("separate");
      await tick();
      setPhase("analyze");
      await tick();
      setPhase("segment");
      await tick();
      const document = ingestPcm(mono, sampleRate, { name: file.name.replace(/\.[^.]+$/, "") });
      setDoc(document);
      setPhase("ready");
      toast.show(
        labelfill("ingest.toast.decomposed", {
          seconds: document.durationSeconds.toFixed(1),
          frames: String(document.segments.length),
        }),
      );
    } catch (error) {
      setPhase("error");
      toast.show(error instanceof Error ? error.message : label("ingest.phase.errorDetail"), "error");
    }
  };

  const onInput = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) void ingest(file);
    event.target.value = "";
  };

  const onDrop = (event: DragEvent): void => {
    event.preventDefault();
    setDrag(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void ingest(file);
  };

  const copyJson = async (): Promise<void> => {
    if (!doc) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(doc, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.show(label("ingest.toast.clipboard"), "error");
    }
  };

  const downloadJson = (): void => {
    if (!doc) return;
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.name || "ingest"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const save = async (): Promise<void> => {
    if (!doc) return;
    setSaving(true);
    const record = await saveingest(doc);
    setSaving(false);
    if (!record) {
      toast.show(label("ingest.toast.storeRefused"), "error");
      return;
    }
    setSaved(record.where);
    toast.show(record.where === "db" ? label("ingest.toast.storedDb") : label("ingest.toast.storedOffline"), "success");
    loadShelf();
  };

  const drop = async (id: string): Promise<void> => {
    await droppingest(id);
    toast.show(label("ingest.toast.dropped"));
    loadShelf();
  };

  const phaseRow = PHASES.find((p) => p.id === phase) ?? PHASES[0];
  const jsonPreview = doc ? JSON.stringify(doc, null, 2) : "";

  return (
    <Shell>
      {/* BENCH — the dropzone stage: the noir floor, the brass light, the
          five-phase meter the engine walks while the file decomposes */}
      <section className="ing-hero halftone grain" aria-labelledby="ing-h">
        <div className="hero-light breathe" aria-hidden="true" />
        <h1 id="ing-h" className="hero-h reveal">
          {label("ingest.hero.title")}
        </h1>
        <p className="hero-lede reveal">
          {label("ingest.hero.ledeLead")}
          <code>katexis</code>
          {label("ingest.hero.ledeTail")}
        </p>
        <button
          type="button"
          className={`ing-drop${drag ? " is-drag" : ""}`}
          aria-label={label("ingest.drop.aria")}
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
        >
          <ArrowUploadRegular fontSize={28} aria-hidden="true" />
          <p className="ing-drop-title">{label("ingest.drop.title")}</p>
          <p className="ing-drop-sub">{fileName ? fileName : label("ingest.drop.sub")}</p>
          <input ref={inputRef} type="file" accept="audio/*" hidden onChange={onInput} />
        </button>
        <ol className="ing-meter" aria-label={label("ingest.meter.aria")}>
          {PHASES.filter((p) => p.id !== "idle" && p.id !== "error").map((p, index) => {
            const order = PHASES.findIndex((x) => x.id === phase);
            const state = phase === "error" ? "idle" : p.id === phase ? "live" : index < order ? "done" : "idle";
            return (
              <li key={p.id} className={`ing-step is-${state}`} data-label={label(p.labelKey)}>
                <span className="ing-step-dot" aria-hidden="true" />
                <span className="ing-step-label">{label(p.labelKey)}</span>
                <span className="ing-step-detail">{label(p.detailKey)}</span>
              </li>
            );
          })}
          {phase === "error" ? (
            <li className="ing-step is-live">
              <span className="ing-step-dot" aria-hidden="true" />
              <span className="ing-step-label">{label(phaseRow.labelKey)}</span>
              <span className="ing-step-detail">{label(phaseRow.detailKey)}</span>
            </li>
          ) : null}
        </ol>
      </section>

      {/* DOCUMENT — the mix and the stems, the json preview and the store keys */}
      {doc ? (
        <section className="shell section" aria-labelledby="doc-h">
          <div className="section-head">
            <p className="eyebrow">{label("ingest.doc.eyebrow")}</p>
            <h2 id="doc-h" className="h2-xl">
              {doc.name}{" "}
              <span className="ing-dim">
                {labelfill("ingest.doc.meta", {
                  clock: formatClock(doc.durationSeconds),
                  khz: String(doc.sampleRate / 1000),
                  schema: String(doc.schema),
                })}
              </span>
            </h2>
          </div>
          <div className="ing-cards">
            <StemCard
              title="mix"
              icon={<DataUsageRegular fontSize={16} aria-hidden="true" />}
              rms={doc.stems.reduce((sum, s) => sum + s.rms, 0) / doc.stems.length}
              peak={Math.max(...doc.stems.map((s) => s.peak))}
              onsets={doc.segments.reduce((sum, seg) => sum + seg.onsets, 0)}
              seconds={doc.segments.length}
              hash={doc.pcmhash}
            />
            {doc.stems.map((stem) => (
              <StemCard
                key={stem.role}
                title={stem.role}
                icon={<MusicNote2Regular fontSize={16} aria-hidden="true" />}
                rms={stem.rms}
                peak={stem.peak}
                onsets={stem.onsetsSeconds.length}
                seconds={stem.segments.length}
                hash={stem.pcmhash}
              />
            ))}
          </div>
          <div className="ing-actions">
            <button className="btn primary" type="button" onClick={() => void save()} disabled={saving}>
              <DataUsageRegular fontSize={15} aria-hidden="true" />
              {saving ? label("ingest.action.storing") : label("ingest.action.store")}
            </button>
            <button className="btn secondary" type="button" onClick={() => void copyJson()}>
              {copied ? (
                <CheckmarkRegular fontSize={15} aria-hidden="true" />
              ) : (
                <CopyRegular fontSize={15} aria-hidden="true" />
              )}
              {label("ingest.action.copy")}
            </button>
            <button className="btn secondary" type="button" onClick={downloadJson}>
              <ArrowDownloadRegular fontSize={15} aria-hidden="true" />
              {label("ingest.action.download")}
            </button>
            {saved ? (
              <span className={`badge${saved === "db" ? " default" : ""}`}>
                {saved === "db" ? label("ingest.saved.db") : label("ingest.saved.offline")}
              </span>
            ) : null}
          </div>
          <pre className="ing-json">
            {jsonPreview.slice(0, 6000)}
            {jsonPreview.length > 6000
              ? `\n${labelfill("ingest.json.truncated", { size: (jsonPreview.length / 1000).toFixed(0) })}`
              : ""}
          </pre>
        </section>
      ) : null}

      {/* SHELF — what the library already holds, spotify-row grammar */}
      <section className="shell section" aria-labelledby="shelf-h">
        <div className="section-head">
          <p className="eyebrow">{label("ingest.shelf.eyebrow")}</p>
          <h2 id="shelf-h" className="h2-xl">
            {label("ingest.shelf.title")}
          </h2>
        </div>
        {records.length === 0 ? (
          <p className="rail-foot">{label("ingest.shelf.empty")}</p>
        ) : (
          <div className="ing-shelf">
            {records.map((record) => (
              <article key={record.id} className="ing-row">
                <div className="ing-row-main">
                  <p className="ing-row-name">{record.doc.name}</p>
                  <p className="ing-row-meta">
                    {labelfill("ingest.row.meta", {
                      clock: formatClock(record.doc.durationSeconds),
                      frames: String(record.doc.segments.length),
                      roles: record.doc.stems.map((s) => s.role).join(" + "),
                      date: new Date(record.doc.ingestedAt).toLocaleDateString(),
                    })}
                  </p>
                </div>
                <span className={`badge${record.where === "db" ? " default" : ""}`}>
                  {record.where === "db" ? label("ingest.row.badgeDb") : label("ingest.row.badgeMirror")}
                </span>
                <button
                  className="ing-row-key"
                  type="button"
                  aria-label={labelfill("ingest.row.dropAria", { name: record.doc.name })}
                  onClick={() => void drop(record.id)}
                >
                  <DeleteRegular fontSize={15} aria-hidden="true" />
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </Shell>
  );
}

/**
 * The ingest page anchor.
 *
 * @returns the ingest bench element.
 */
export default function Ingest() {
  return <IngestSurface />;
}
