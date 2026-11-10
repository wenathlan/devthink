/**
 * IngestSurface.tsx — the composite winget of the ingest remount (the
 * detailed engine wave): the decomposition bench the retired page carried,
 * rebuilt as ONE mount so the page anchor stays the thin face the
 * construction law pins on it. The bench owns the real engine lanes the old
 * face rode:
 *
 * - the drop decodes through the browser's own AudioContext (any format
 *   the host decodes — file → mono pcm), then hands the pcm to the
 *   engine's end-to-end walk (`separate` + `decompose` — the hpss stems,
 *   the analyzers, the per-second vector frames, one parametrized
 *   document, the same bytes `ingestPcm` would answer);
 * - the document summary reads the header the engine answers — the
 *   clock, the bpm, the key, the loudness, the frame count, the stems and
 *   the pcm hash — never a number the bench invented;
 * - the mix plays through the shared bus: the mono pcm encodes to a wav
 *   (`writeWav16`) and lands in the session blob lane the playerbus seam
 *   reads, so the bar below carries what the bench just decomposed;
 * - the store key rides `saveingest` (the gateway first, the offline
 *   mirror after — the record says where it landed) and the shelf merges
 *   the gateway rows with the mirror (`listingests` + `fetchShelf` under
 *   the owner stamp of the identity seat), the drop key retiring a row
 *   through both lanes;
 * - the refusals land as notes (the refused state carrying the engine's
 *   own message), never a throw.
 *
 * The arming beat rides the face prop: while the shelf read loads (the
 * first read of the route) the route answers the construction face it
 * wore. Every word rides the label store; the meter walks the engine's
 * own phase vocabulary.
 */

import {
  ArrowDownloadRegular,
  ArrowUploadRegular,
  CheckmarkRegular,
  CopyRegular,
  DataUsageRegular,
  DeleteRegular,
  MusicNote2Regular,
  PauseRegular,
  PlayFilled,
} from "@fluentui/react-icons";
import { type ChangeEvent, type DragEvent, type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { type BlobPointer, sessionblobstore } from "../../blobstore.ts";
import { formatClock } from "../../dawview.ts";
import {
  decompose,
  deleteDocument,
  droppingest,
  fetchShelf,
  type IngestDocument,
  type IngestRecord,
  ingestorigin,
  listingests,
  ownerid,
  saveingest,
} from "../../ingest.ts";
import { type StemPair, separate } from "../../kathesis.ts";
import { type LabelKey, label, labelfill } from "../../labels.ts";
import {
  busFeature,
  busPause,
  busPlay,
  busSubscribe,
  type PlayerSnapshot,
  type ReferenceTake,
  saveReferenceTake,
} from "../../playerbus.ts";
import { writeWav16 } from "../../wavwriter.ts";
import { useToast } from "../toast/Toast.tsx";

/** The bench phases the device walk steps through, in order (the ids ride
 * the state machine; the label and detail keys answer the label store). */
const PHASES: readonly { id: BenchPhase; labelKey: LabelKey; detailKey: LabelKey }[] = [
  { id: "idle", labelKey: "ingest.phase.waiting", detailKey: "ingest.phase.waitingDetail" },
  { id: "decode", labelKey: "ingest.phase.decode", detailKey: "ingest.phase.decodeDetail" },
  { id: "separate", labelKey: "ingest.phase.separate", detailKey: "ingest.phase.separateDetail" },
  { id: "analyze", labelKey: "ingest.phase.analyze", detailKey: "ingest.phase.analyzeDetail" },
  { id: "segment", labelKey: "ingest.phase.segment", detailKey: "ingest.phase.segmentDetail" },
  { id: "ready", labelKey: "ingest.phase.ready", detailKey: "ingest.phase.readyDetail" },
  { id: "refused", labelKey: "ingest.phase.error", detailKey: "ingest.phase.errorDetail" },
];

type BenchPhase = "idle" | "decode" | "separate" | "analyze" | "segment" | "ready" | "refused";

/** One rendered meter step: the phase id, the copy keys and the walk state. */
interface MeterStep {
  id: string;
  labelKey: LabelKey;
  detailKey: LabelKey;
  state: "idle" | "live" | "done";
}

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

/** The session blob lane the bench's mix wav rides: the offline seat the
 * playerbus seam reads before the gateway (the same law the ingest mirror
 * answers). */
const blobs = sessionblobstore();

/** Encodes the mix pcm to a wav and stores it under a fresh blob pointer
 * (null when the lane refused the bytes — the play key stays absent). */
async function storeWav(pcm: Float32Array, sampleRate: number): Promise<BlobPointer | null> {
  try {
    const answer = await blobs.put(writeWav16([pcm], sampleRate), "audio/wav");
    return answer.ok ? answer.pointer : null;
  } catch {
    return null;
  }
}

/**
 * The device meter steps of the local walk: the done steps trail the live
 * one, a refused walk folds the meter to idle (the honest reading of a
 * walk that stopped).
 *
 * @param phase the device walk phase.
 * @returns the five steps in the law order.
 */
function deviceMeter(phase: BenchPhase): MeterStep[] {
  const order = PHASES.findIndex((x) => x.id === phase);
  return PHASES.filter((p) => p.id !== "idle" && p.id !== "refused").map((p, index) => ({
    id: p.id,
    labelKey: p.labelKey,
    detailKey: p.detailKey,
    state: phase === "refused" ? "idle" : p.id === phase ? "live" : index < order ? "done" : "idle",
  }));
}

/** the props of the ingest surface mount. */
type IngestSurfaceProps = {
  /** the face the route answers while the shelf read arms (the first read
   * of the route — the honest arming state, never a fake shelf row). */
  face: ReactNode;
};

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
  icon: ReactNode;
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

/**
 * IngestSurface — the decomposition bench over the real ingest engine.
 *
 * @param props the arming face of the route.
 * @returns the bench element, or the arming face while the shelf arms.
 */
export function IngestSurface({ face }: IngestSurfaceProps) {
  const toast = useToast();
  const [phase, setPhase] = useState<BenchPhase>("idle");
  const [fileName, setFileName] = useState("");
  const [doc, setDoc] = useState<IngestDocument | null>(null);
  const [refusal, setRefusal] = useState<string | null>(null);
  const [mixTake, setMixTake] = useState<ReferenceTake | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<"db" | "offline" | null>(null);
  const [drag, setDrag] = useState(false);
  const [shelfLoad, setShelfLoad] = useState<"loading" | "ready">("loading");
  const [records, setRecords] = useState<readonly IngestRecord[]>([]);
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<PlayerSnapshot | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /** The shelf merges the gateway rows (the owner's private lane plus the
   * vitrine) with the offline mirror — db wins by id, so a row that landed
   * while offline resurfaces when the gateway answers again. */
  const loadShelf = useCallback((): void => {
    const origin = ingestorigin();
    const server = origin ? fetchShelf(origin, ownerid()) : Promise.resolve(null);
    void Promise.all([listingests(), server]).then(([mirror, answer]) => {
      const merged = new Map<string, IngestRecord>();
      for (const record of mirror) merged.set(record.id, record);
      if (answer?.ok) {
        for (const row of answer.data) merged.set(row.id, { id: row.id, where: "db", doc: row.document });
      }
      setRecords([...merged.values()]);
      setShelfLoad("ready");
    });
  }, []);

  // the shelf read arms the bench — the arming beat of the route
  useEffect(() => {
    loadShelf();
  }, [loadShelf]);

  // the shared bus answers the live transport state: the play key wears the
  // sounding take, exactly the snapshot the shell bar renders
  useEffect(() => busSubscribe(setView), []);
  const soundingId = view?.playing ? (view.takes[view.index]?.id ?? "") : "";

  /** The device walk: each phase yields to the paint, the document assembles
   * once (the one hpss pass feeds the analysis and the stored bytes both),
   * the mix wav lands in the session blob lane and the play key answers. */
  const ingest = async (file: File): Promise<void> => {
    setDoc(null);
    setMixTake(null);
    setSaved(null);
    setRefusal(null);
    setPhase("decode");
    setFileName(file.name.replace(/\.[^.]+$/, ""));
    try {
      const { mono, sampleRate } = await decodeMono(file);
      setPhase("separate");
      await tick();
      const stems: StemPair = separate(mono);
      setPhase("analyze");
      await tick();
      setPhase("segment");
      await tick();
      const name = file.name.replace(/\.[^.]+$/, "");
      const { doc: document } = decompose(mono, stems, sampleRate, { name });
      const pointer = await storeWav(mono, sampleRate);
      const take: ReferenceTake | null = pointer
        ? {
            kind: "reference",
            id: `reference-${pointer.id}`,
            name,
            origin: "bench",
            source: { blobId: pointer.id, mime: "audio/wav", name, durationSeconds: document.durationSeconds },
          }
        : null;
      setDoc(document);
      setMixTake(take);
      if (take) saveReferenceTake(take);
      setPhase("ready");
      toast.show(
        labelfill("ingest.toast.decomposed", {
          seconds: document.durationSeconds.toFixed(1),
          frames: String(document.segments.length),
        }),
        "success",
      );
    } catch (error) {
      setPhase("refused");
      const message = error instanceof Error ? error.message : label("ingest.phase.errorDetail");
      setRefusal(message);
      toast.show(labelfill("ingest.bench.refused", { message }), "error");
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

  /** presses the stored mix through the shared bus — the bar carries it. */
  const playMix = (): void => {
    if (!mixTake) return;
    if (soundingId === mixTake.id) busPause();
    else {
      busFeature(mixTake);
      busPlay(0);
    }
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

  /** stores the document — the gateway first, the offline mirror after. */
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

  /** retires one shelf row through both lanes (the gateway delete and the
   * mirror drop), the honest refusal surfaced as a note. */
  const drop = async (id: string): Promise<void> => {
    const origin = ingestorigin();
    let refused: string | null = null;
    if (origin) {
      const answer = await deleteDocument(id, origin);
      if (!answer.ok) refused = answer.error.message;
    }
    await droppingest(id);
    if (refused !== null) toast.show(labelfill("ingest.toast.dropRefused", { message: refused }), "error");
    else toast.show(label("ingest.toast.dropped"));
    loadShelf();
  };

  // the arming beat: the shelf read rides — the route answers the face it
  // wore until the ingest records lane answers, never a bench pretending
  // a shelf it never read
  if (shelfLoad === "loading") return <>{face}</>;

  const steps = deviceMeter(phase);
  const jsonPreview = doc ? JSON.stringify(doc, null, 2) : "";

  return (
    <>
      {/* BENCH — the dropzone stage: the noir floor, the brass light, the
          meter walks the phases of the engine's own walk */}
      <section className="ing-hero halftone grain" aria-labelledby="ing-h">
        <div className="hero-light breathe" aria-hidden="true" />
        <h1 id="ing-h" className="hero-h reveal">
          {label("ingest.hero.title")}
        </h1>
        <p className="hero-lede reveal">
          {label("ingest.hero.ledeLead")}
          <code>studio</code>
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
          {steps.map((step) => (
            <li key={step.id} className={`ing-step is-${step.state}`} data-label={label(step.labelKey)}>
              <span className="ing-step-dot" aria-hidden="true" />
              <span className="ing-step-label">{label(step.labelKey)}</span>
              <span className="ing-step-detail">{label(step.detailKey)}</span>
            </li>
          ))}
          {refusal !== null ? (
            <li className="ing-step is-live">
              <span className="ing-step-dot" aria-hidden="true" />
              <span className="ing-step-label">{label("ingest.phase.error")}</span>
              <span className="ing-step-detail">{labelfill("ingest.bench.refused", { message: refusal })}</span>
            </li>
          ) : null}
        </ol>
      </section>

      {/* DOCUMENT — the summary the engine's own header answers, the mix
          play key, the store/copy/download keys and the json preview */}
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
            <p className="rail-foot">
              {labelfill("ingest.doc.summary", {
                bpm: String(Math.round(doc.mix.rhythm.bpm)),
                key: `${doc.mix.key.tonicName} ${doc.mix.key.mode}`,
                lufs: doc.mix.loudness.integrated.toFixed(1),
                frames: String(doc.segments.length),
                stems: String(doc.stems.length),
              })}
            </p>
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
            {mixTake ? (
              <button
                className="btn primary"
                type="button"
                aria-pressed={soundingId === mixTake.id}
                aria-label={labelfill("ingest.action.playAria", { name: doc.name })}
                onClick={playMix}
              >
                {soundingId === mixTake.id ? (
                  <PauseRegular fontSize={15} aria-hidden="true" />
                ) : (
                  <PlayFilled fontSize={15} aria-hidden="true" />
                )}
                {soundingId === mixTake.id ? label("ingest.action.pause") : label("ingest.action.play")}
              </button>
            ) : null}
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

      {/* SHELF — what the library already holds, spotify-row grammar: the
          gateway rows merged with the offline mirror, the honest empty
          state while nothing landed (the seed law: no document the seed
          ever faked) */}
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
        {/* THE IA LANE LINE — the system reference library grows through the
            same route with the service identity, no human in the loop */}
        <p className="rail-foot ing-ialine">{label("ingest.shelf.iaLine")}</p>
      </section>
    </>
  );
}

export default IngestSurface;
