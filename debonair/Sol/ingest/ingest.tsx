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
// pre-train the composer. The bench answers the server law (the pipeline
// waves PV1.007 + PV1.008): the drop posts the upload route, the meter
// reads the polled job row — the same six phases the worker walks, decode,
// separate, analyze, segment, store, row — and the document renders from
// the shelf when the walk lands done, so the visitor's machine never runs
// the pipeline (zero dsp on the default path; the play keys stream the
// stored wavs through the shared bus, the manifest names the stems). The
// local pipeline stays behind the explicit "run on this device" key — the
// honest opt-in the pipeline law demands: decode (file → mono pcm over
// decodeAudioData), separate (the hpss pass), analyze, segment, the wavs
// land in the session blob lane and the document saves to the library
// store. Every upload carries the owner stamp of the identity seat (the
// same law the onboarding flags ride), the shelf merges the gateway rows
// with the offline mirror, and the system ia lane grows the reference
// library with the service identity — the same route, no human.

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
  SpeakerMuteRegular,
} from "@fluentui/react-icons";
import { type ChangeEvent, type DragEvent, useEffect, useRef, useState } from "react";
import { type BlobPointer, gatewayblobstore, sessionblobstore } from "../../blobstore.ts";
import { formatClock } from "../../dawview.ts";
import type { IngestJobValue } from "../../gatewayapi.ts";
import { separate } from "../../hpss.ts";
import { decompose, type IngestDocument } from "../../ingest.ts";
import {
  deleteDocument,
  fetchDocument,
  fetchShelf,
  ingestorigin,
  ownerid,
  pollJob,
  uploadIngest,
} from "../../ingestclient.ts";
import { droppingest, type IngestRecord, listingests, saveingest } from "../../ingeststore.ts";
import {
  INGEST_STEMS_SCHEMA_VERSION,
  type IngestJobPhase,
  type IngestStampRow,
  type IngestStemsManifest,
  PIPELINE_PHASES,
} from "../../ingestworker.ts";
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
import { Shell } from "../shell/Shell.tsx";
import { useToast } from "../toast/Toast.tsx";

/** The decode/analysis phases the device walk steps through, in order (the
 * ids ride the state machine; the label and detail keys answer the label
 * store). */
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

/** The server phases the meter mirrors — the worker's own law order (the
 * bench, the job route and the worker speak the same names). */
const SERVER_STEP_KEYS: Record<IngestJobPhase, { labelKey: LabelKey; detailKey: LabelKey }> = {
  decode: { labelKey: "ingest.phase.decode", detailKey: "ingest.phase.decodeDetail" },
  separate: { labelKey: "ingest.phase.separate", detailKey: "ingest.phase.separateDetail" },
  analyze: { labelKey: "ingest.phase.analyze", detailKey: "ingest.phase.analyzeDetail" },
  segment: { labelKey: "ingest.phase.segment", detailKey: "ingest.phase.segmentDetail" },
  store: { labelKey: "ingest.phase.store", detailKey: "ingest.phase.storeDetail" },
  row: { labelKey: "ingest.phase.row", detailKey: "ingest.phase.rowDetail" },
};

/** One rendered meter step: the phase id, the copy keys and the walk state. */
interface MeterStep {
  id: string;
  labelKey: LabelKey;
  detailKey: LabelKey;
  state: "idle" | "live" | "done";
}

/** The poll interval of the server walk (ms) — a sane window between the
 * job row reads (the phases land in order, the meter follows). */
const POLL_MS = 700;

/** Yields to the paint loop so a phase label lands on screen before the
 * heavy synchronous work of the next one blocks the main thread. */
const tick = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 30));

/** One pause of the poll loop that an abort ends early (a fresh drop or
 * the unmount retires the walk without another row read). */
function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        resolve();
      },
      { once: true },
    );
  });
}

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

/** The session blob lane the device walk's wavs ride: the offline seat the
 * playerbus seam reads before the gateway (the same law the ingest mirror
 * answers). */
const blobs = sessionblobstore();

/** Encodes one pcm lane to a wav and stores it under a fresh blob pointer
 * (null when the lane refused the bytes — the play keys stay absent). */
async function storeWav(pcm: Float32Array, sampleRate: number): Promise<BlobPointer | null> {
  try {
    const answer = await blobs.put(writeWav16([pcm], sampleRate), "audio/wav");
    return answer.ok ? answer.pointer : null;
  } catch {
    return null;
  }
}

/** One audition row: the stem label and its reference take. */
interface StemAudition {
  stem: "harmonic" | "percussive";
  take: ReferenceTake;
}

/** The reference takes of one decomposition: the stored mix the bar plays
 * and the stem takes the audition solos (each a blob pointer). */
interface ReferenceAudio {
  mix: ReferenceTake;
  stems: StemAudition[];
}

/** Builds the reference takes of the device walk: the mix and both stems
 * encode to wavs and land in the session blob lane, each pointer becoming
 * one reference take the shared bus plays. Null answers when any lane
 * refused its bytes. */
async function buildReferenceAudio(
  name: string,
  mono: Float32Array,
  harmonic: Float32Array,
  percussive: Float32Array,
  sampleRate: number,
): Promise<ReferenceAudio | null> {
  const [mix, harmonicPointer, percussivePointer] = await Promise.all([
    storeWav(mono, sampleRate),
    storeWav(harmonic, sampleRate),
    storeWav(percussive, sampleRate),
  ]);
  if (!mix || !harmonicPointer || !percussivePointer) return null;
  const durationSeconds = mono.length / sampleRate;
  const takeOf = (pointer: BlobPointer, display: string, takeId: string): ReferenceTake => ({
    kind: "reference",
    id: takeId,
    name: display,
    source: { blobId: pointer.id, mime: "audio/wav", name: display, durationSeconds },
  });
  return {
    mix: takeOf(mix, name, `reference-${mix.id}`),
    stems: [
      { stem: "harmonic", take: takeOf(harmonicPointer, `${name} harmonic`, `reference-${harmonicPointer.id}`) },
      {
        stem: "percussive",
        take: takeOf(percussivePointer, `${name} percussive`, `reference-${percussivePointer.id}`),
      },
    ],
  };
}

/**
 * Builds the reference takes of one landed server walk: the mix streams
 * from the row's own mix pointer and the stems ride the manifest the walk
 * stored — the shared bus resolves them through the session mirror first,
 * the gateway blob lane after (the same law the device wavs ride). a
 * manifest that refuses answers the mix alone (the audition stays hidden,
 * the play key still answers) — never a throw, the walk already landed.
 *
 * @param origin the gateway origin.
 * @param row the stamped row the document read answered.
 * @returns the mix take and the stem takes (empty when the manifest refused).
 */
async function serverAudio(origin: string, row: IngestStampRow): Promise<ReferenceAudio> {
  const durationSeconds = row.durationSeconds;
  const takeOf = (blobId: string, display: string): ReferenceTake => ({
    kind: "reference",
    id: `reference-${blobId}`,
    name: display,
    source: { blobId, mime: "audio/wav", name: display, durationSeconds },
  });
  const mix = takeOf(row.mixPointer, row.name);
  const lane = gatewayblobstore(origin);
  const got = await lane.get(row.stemsPointer);
  if (!got.ok || got.data === null) return { mix, stems: [] };
  let parsed: Partial<IngestStemsManifest>;
  try {
    parsed = JSON.parse(new TextDecoder().decode(got.data)) as Partial<IngestStemsManifest>;
  } catch {
    return { mix, stems: [] };
  }
  if (parsed.schema !== INGEST_STEMS_SCHEMA_VERSION || !Array.isArray(parsed.stems)) {
    return { mix, stems: [] };
  }
  const stems: StemAudition[] = [];
  for (const stem of parsed.stems) {
    if (stem && typeof stem.pointer?.id === "string" && (stem.role === "harmonic" || stem.role === "percussive")) {
      stems.push({ stem: stem.role, take: takeOf(stem.pointer.id, `${row.name} ${stem.role}`) });
    }
  }
  return { mix, stems };
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

/**
 * The server meter steps of one job row: the last completed phase marks
 * the done steps, the phase after it rides live, a queued job stays idle
 * and a landed walk closes every step (a failed walk answers the error
 * row — the steps fold to idle, the honest reading of a walk that stopped).
 *
 * @param job the polled row (null before the first answer).
 * @param failure the lane failure line (null while the walk rides).
 * @returns the six steps in the law order.
 */
function serverMeter(job: IngestJobValue | null, failure: string | null): MeterStep[] {
  if (job === null || failure !== null || job.state === "failed") {
    return PIPELINE_PHASES.map((id) => ({ id, ...SERVER_STEP_KEYS[id], state: "idle" as const }));
  }
  if (job.state === "done") {
    return PIPELINE_PHASES.map((id) => ({ id, ...SERVER_STEP_KEYS[id], state: "done" as const }));
  }
  // the wire phase rides the worker's own vocabulary (the lockstep law);
  // an unknown name answers no completed step — the meter stays honest
  const completed = job.phase === null ? 0 : PIPELINE_PHASES.indexOf(job.phase as IngestJobPhase) + 1;
  const live = job.state === "queued" ? null : completed;
  return PIPELINE_PHASES.map((id, index) => ({
    id,
    ...SERVER_STEP_KEYS[id],
    state: index < completed ? ("done" as const) : index === live ? ("live" as const) : ("idle" as const),
  }));
}

/**
 * The device meter steps of the local walk (the PV0 bench law, unchanged).
 *
 * @param phase the device walk phase.
 * @returns the five steps in the law order.
 */
function deviceMeter(phase: BenchPhase): MeterStep[] {
  const order = PHASES.findIndex((x) => x.id === phase);
  return PHASES.filter((p) => p.id !== "idle" && p.id !== "error").map((p, index) => ({
    id: p.id,
    labelKey: p.labelKey,
    detailKey: p.detailKey,
    state: phase === "error" ? "idle" : p.id === phase ? "live" : index < order ? "done" : "idle",
  }));
}

/** The ingest surface: the bench, the document preview and the shelf. */
function IngestSurface() {
  const toast = useToast();
  /** The lane key: the server walk by default, the device walk behind the
   * explicit opt-in (the pipeline law — the visitor machine never runs the
   * pipeline unless it asks). */
  const [lane, setLane] = useState<"server" | "device">("server");
  const [phase, setPhase] = useState<BenchPhase>("idle");
  const [job, setJob] = useState<IngestJobValue | null>(null);
  const [laneFailure, setLaneFailure] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [doc, setDoc] = useState<IngestDocument | null>(null);
  const [audio, setAudio] = useState<ReferenceAudio | null>(null);
  /** Which lane produced the rendered document (the store key is the device
   * lane's own — the server row lands through the walk). */
  const [sourceLane, setSourceLane] = useState<"server" | "device" | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<"db" | "offline" | null>(null);
  const [drag, setDrag] = useState(false);
  const [records, setRecords] = useState<readonly IngestRecord[]>([]);
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<PlayerSnapshot | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  /** The abort key of the riding server walk — a fresh drop or the unmount
   * retires it (the poll loop and the pause both answer it). */
  const walkRef = useRef<AbortController | null>(null);

  /** The shelf merges the gateway rows (the owner's private lane plus the
   * vitrine) with the offline mirror — db wins by id, so a row that landed
   * while offline resurfaces when the gateway answers again. */
  const loadShelf = (): void => {
    const origin = ingestorigin();
    const server = origin ? fetchShelf(origin, ownerid()) : Promise.resolve(null);
    void Promise.all([listingests(), server]).then(([mirror, answer]) => {
      const merged = new Map<string, IngestRecord>();
      for (const record of mirror) merged.set(record.id, record);
      if (answer?.ok) {
        for (const row of answer.data) merged.set(row.id, { id: row.id, where: "db", doc: row.document });
      }
      setRecords([...merged.values()]);
    });
  };
  useEffect(loadShelf, []);
  // the shared bus answers the live transport state: the play keys wear the
  // sounding take, exactly the snapshot the shell bar renders
  useEffect(() => busSubscribe(setView), []);
  // the riding walk retires with the surface (a poll never outlives the page)
  useEffect(() => () => walkRef.current?.abort(), []);
  const soundingId = view?.playing ? (view.takes[view.index]?.id ?? "") : "";

  /** The device walk: each phase yields to the paint, the document assembles
   * once, the wavs land in the blob lane and the shelf reloads after a
   * save. The one hpss pass feeds the analysis and the stored bytes both. */
  const ingestDevice = async (file: File): Promise<void> => {
    setDoc(null);
    setAudio(null);
    setSaved(null);
    setJob(null);
    setLaneFailure(null);
    setSourceLane("device");
    setFileName(file.name.replace(/\.[^.]+$/, ""));
    try {
      setPhase("decode");
      await tick();
      const { mono, sampleRate } = await decodeMono(file);
      setPhase("separate");
      await tick();
      const stems = separate(mono);
      setPhase("analyze");
      await tick();
      setPhase("segment");
      await tick();
      const name = file.name.replace(/\.[^.]+$/, "");
      const { doc: document, harmonic, percussive } = decompose(mono, stems, sampleRate, { name });
      const takes = await buildReferenceAudio(name, mono, harmonic, percussive, sampleRate);
      setDoc(document);
      setAudio(takes);
      if (takes) saveReferenceTake(takes.mix);
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

  /** The server walk landed: the stamped row renders (the same cards), the
   * play keys stream the stored wavs through the shared bus and the shelf
   * reloads — zero dsp on this machine, the walk did it all. */
  const land = async (row: IngestJobValue, origin: string): Promise<void> => {
    if (row.documentId === null) {
      const message = "the job landed done without a document id";
      setLaneFailure(message);
      toast.show(labelfill("ingest.toast.laneRefused", { message }), "error");
      return;
    }
    const answer = await fetchDocument(row.documentId, origin);
    if (!answer.ok) {
      setLaneFailure(answer.error.message);
      toast.show(labelfill("ingest.toast.laneRefused", { message: answer.error.message }), "error");
      return;
    }
    const stamped = answer.data;
    setDoc(stamped.document);
    setSaved("db");
    const takes = await serverAudio(origin, stamped);
    setAudio(takes);
    saveReferenceTake(takes.mix);
    toast.show(
      labelfill("ingest.toast.serverLanded", {
        name: stamped.name,
        frames: String(stamped.document.segments.length),
      }),
      "success",
    );
    loadShelf();
  };

  /** The server walk: the drop posts the upload (the owner stamp of the
   * identity seat rides the body), then the poll reads the job row until
   * the walk lands done — the meter mirrors the server phases, the abort
   * key retires the walk on a fresh drop or the unmount. */
  const ingestServer = async (file: File): Promise<void> => {
    const origin = ingestorigin();
    setDoc(null);
    setAudio(null);
    setSaved(null);
    setJob(null);
    setPhase("idle");
    setLaneFailure(null);
    setSourceLane("server");
    setFileName(file.name.replace(/\.[^.]+$/, ""));
    const bytes = new Uint8Array(await file.arrayBuffer());
    const upload = await uploadIngest({
      bytes,
      name: file.name,
      ownerId: ownerid(),
      kind: "upload",
      visibility: "private",
      origin,
    });
    if (!upload.ok) {
      setLaneFailure(upload.error.message);
      toast.show(labelfill("ingest.toast.laneRefused", { message: upload.error.message }), "error");
      return;
    }
    const controller = new AbortController();
    walkRef.current?.abort();
    walkRef.current = controller;
    for (;;) {
      if (controller.signal.aborted) return;
      const answer = await pollJob(upload.data.jobId, origin);
      if (!answer.ok) {
        if (!controller.signal.aborted) {
          setLaneFailure(answer.error.message);
          toast.show(labelfill("ingest.toast.laneRefused", { message: answer.error.message }), "error");
        }
        return;
      }
      setJob(answer.data);
      if (answer.data.state === "done") {
        await land(answer.data, origin);
        return;
      }
      if (answer.data.state === "failed") {
        const message = answer.data.error ?? "the walk failed";
        setLaneFailure(message);
        toast.show(labelfill("ingest.toast.jobFailed", { message }), "error");
        return;
      }
      await sleep(POLL_MS, controller.signal);
    }
  };

  /** The bench dispatch: the lane key decides which walk rides. */
  const ingest = async (file: File): Promise<void> => (lane === "device" ? ingestDevice(file) : ingestServer(file));

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

  /** The lane key retires the riding walk and resets the bench — the next
   * drop rides the new lane. */
  const onLaneToggle = (): void => {
    walkRef.current?.abort();
    setLane((current) => (current === "server" ? "device" : "server"));
    setDoc(null);
    setAudio(null);
    setSaved(null);
    setJob(null);
    setPhase("idle");
    setLaneFailure(null);
    setFileName("");
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

  /** Presses one reference take through the shared bus: the bar carries it
   * (the same transport the generated takes ride), the key toggles in place. */
  const playTake = (take: ReferenceTake): void => {
    if (soundingId === take.id) busPause();
    else {
      busFeature(take);
      busPlay(0);
    }
  };

  const steps = lane === "server" ? serverMeter(job, laneFailure) : deviceMeter(phase);
  const failureText =
    job !== null && job.state === "failed"
      ? (job.error ?? label("ingest.phase.errorDetail"))
      : laneFailure !== null
        ? laneFailure
        : phase === "error"
          ? label("ingest.phase.errorDetail")
          : null;
  const jsonPreview = doc ? JSON.stringify(doc, null, 2) : "";

  return (
    <Shell>
      {/* BENCH — the dropzone stage: the noir floor, the brass light, the
          meter walks the phases of the riding lane */}
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
        {/* THE LANE ROW — the identity line (the owner stamp every upload
            carries) beside the explicit run-on-device key: the server walk
            is the default, the local pipeline only on the honest opt-in */}
        <div className="ing-lane">
          <p className="ing-lane-identity">
            {labelfill(lane === "device" ? "ingest.identity.device" : "ingest.identity.server", {
              owner: ownerid(),
            })}
          </p>
          <span className="ing-lane-device">
            <span className="ing-lane-device-text">{label("ingest.lane.device")}</span>
            <label className="toggle">
              <input
                type="checkbox"
                checked={lane === "device"}
                onChange={onLaneToggle}
                aria-label={label("ingest.lane.deviceAria")}
              />
              <span className="track" />
            </label>
          </span>
        </div>
        <p className="ing-lane-hint">{label("ingest.lane.deviceHint")}</p>
        <ol className="ing-meter" aria-label={label("ingest.meter.aria")}>
          {steps.map((step) => (
            <li key={step.id} className={`ing-step is-${step.state}`} data-label={label(step.labelKey)}>
              <span className="ing-step-dot" aria-hidden="true" />
              <span className="ing-step-label">{label(step.labelKey)}</span>
              <span className="ing-step-detail">{label(step.detailKey)}</span>
            </li>
          ))}
          {failureText !== null ? (
            <li className="ing-step is-live">
              <span className="ing-step-dot" aria-hidden="true" />
              <span className="ing-step-label">{label("ingest.phase.error")}</span>
              <span className="ing-step-detail">{failureText}</span>
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
          {/* THE AUDITION — the stems the walk stored, soloed one bus lane at a
              time: the solo key presses a stem through the shared playerbus, the
              other rides muted (the honest one-lane law — nothing fakes
              layering), and the mix key above answers the conserved sum */}
          {audio && audio.stems.length > 0 ? (
            <div className="ing-audition">
              <p className="ing-audition-head">
                <MusicNote2Regular fontSize={14} aria-hidden="true" />
                {label("ingest.audition.eyebrow")}
              </p>
              <p className="ing-audition-hint">{label("ingest.audition.hint")}</p>
              <ul className="ing-audition-list">
                {audio.stems.map(({ stem, take }) => {
                  const soloed = soundingId === take.id;
                  return (
                    <li key={take.id} className="ing-audition-row" data-soloed={soloed || undefined}>
                      <span className="ing-audition-name">{stem}</span>
                      <span className={`ing-audition-state${soloed ? " is-solo" : ""}`}>
                        {soloed ? label("ingest.audition.solo") : label("ingest.audition.muted")}
                      </span>
                      <button
                        className="ing-audition-key"
                        type="button"
                        aria-pressed={soloed}
                        aria-label={labelfill("ingest.audition.soloAria", { stem })}
                        title={labelfill("ingest.audition.soloAria", { stem })}
                        onClick={() => playTake(take)}
                      >
                        {soloed ? (
                          <PauseRegular fontSize={14} aria-hidden="true" />
                        ) : (
                          <PlayFilled fontSize={14} aria-hidden="true" />
                        )}
                      </button>
                      <button
                        className="ing-audition-key"
                        type="button"
                        aria-pressed={!soloed}
                        aria-label={labelfill("ingest.audition.muteAria", { stem })}
                        title={labelfill("ingest.audition.muteAria", { stem })}
                        onClick={() => {
                          if (soloed) busPause();
                        }}
                      >
                        <SpeakerMuteRegular fontSize={14} aria-hidden="true" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
          <div className="ing-actions">
            {audio ? (
              <button
                className="btn primary"
                type="button"
                aria-pressed={soundingId === audio.mix.id}
                aria-label={labelfill("ingest.action.playAria", { name: doc.name })}
                onClick={() => playTake(audio.mix)}
              >
                {soundingId === audio.mix.id ? (
                  <PauseRegular fontSize={15} aria-hidden="true" />
                ) : (
                  <PlayFilled fontSize={15} aria-hidden="true" />
                )}
                {soundingId === audio.mix.id ? label("ingest.action.pause") : label("ingest.action.play")}
              </button>
            ) : null}
            {sourceLane === "device" ? (
              <button className="btn primary" type="button" onClick={() => void save()} disabled={saving}>
                <DataUsageRegular fontSize={15} aria-hidden="true" />
                {saving ? label("ingest.action.storing") : label("ingest.action.store")}
              </button>
            ) : null}
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
        {/* THE IA LANE LINE — the system reference library grows through the
            same route with the service identity, no human in the loop */}
        <p className="rail-foot ing-ialine">{label("ingest.shelf.iaLine")}</p>
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
