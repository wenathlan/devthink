// # takeexporter.ts — the bounce desk of the studio page (root logic, moved
// from Sol/studio/exporter.ts): the studio's export actions ride this file,
// and every one of them is a REAL render — the wav and the stems go through
// renderTakeOffline (the same VoiceBank the desk plays, the same faders, the
// same glue), the midi goes through the pure smf writer over the validated
// role tracks, the manifest rides the stems engine's schema v1. No fake
// progress, no placeholder downloads: a button answers with the bytes it
// names, or with the refusal line.
// NON-GOALS: no state, no storage, no zip archives (one download per file —
// the browser owns the save dialog), no limiting (the studio bounce rides
// the desk's own graph so what the visitor hears is what exports; the
// −1 dBTP true-peak ceiling is the server render lane's close —
// renderworker.ts rides limiter.ts — the honest split the desk's own
// header documents; the loudness engine judges the bounce afterwards).

import type { TakePlan } from "./arranger.ts";
import { buildTracksFromSchedule, validateMidi, writeMidi } from "./midiwriter.ts";
import { planStems, stemsManifest } from "./stems.ts";
import type { TakeSchedule } from "./takeevents.ts";
import { writeWav16, writeWav24 } from "./wavwriter.ts";
import { renderTakeOffline } from "./audioengine.ts";

/** The export actions the desk offers. */
export type ExportKind = "wav16" | "wav24" | "midi" | "stems";

/** One file the export hands to the browser's save dialog. */
export interface ExportFile {
  /** The file name the download carries. */
  name: string;
  /** The bytes, typed for the browser (the audio and the manifest). */
  blob: Blob;
  /** The human line the toast answers with. */
  label: string;
}

/** The human names the export buttons ride. */
export const EXPORT_LABELS: Record<ExportKind, string> = {
  wav16: "wav 16",
  wav24: "wav 24",
  midi: "midi",
  stems: "stems",
};

/** The blob part the encoders hand over (a private copy, TS 5.9-safe). */
function blobPart(bytes: Uint8Array): ArrayBuffer {
  return bytes.slice().buffer as ArrayBuffer;
}

/**
 * Bounces one export of the take. Every kind renders on demand — a wav is a
 * full offline bounce, a stem set is one bounce per voiced role, the midi is
 * pure bytes of the validated tracks.
 *
 * @param kind the export action.
 * @param plan the plan the take answers to (naming and mastering rate).
 * @param schedule the schedule to bounce (the desk's edited one rides in).
 * @returns the files the action produced (stems carry one per voiced role plus the manifest).
 * @throws Error with the refusal line when the render or the encode fails.
 */
export async function exportTake(kind: ExportKind, plan: TakePlan, schedule: TakeSchedule): Promise<ExportFile[]> {
  if (kind === "midi") {
    const tracks = buildTracksFromSchedule(schedule, plan, plan.bpm);
    const problems = validateMidi(tracks);
    if (problems.length > 0) throw new Error(`the midi refused this take: ${problems[0].message}`);
    const bytes = writeMidi(tracks, 480, plan.bpm);
    return [
      {
        name: `${plan.id}.mid`,
        blob: new Blob([blobPart(bytes)], { type: "audio/midi" }),
        label: "smf format 1, four role tracks",
      },
    ];
  }

  if (kind === "stems") {
    const stems = planStems(schedule, plan);
    const files: ExportFile[] = [];
    for (const stem of stems) {
      if (stem.events.length === 0) continue;
      const buffer = await renderTakeOffline(plan, schedule, { roles: [stem.role] });
      const mono = mixToMono(buffer);
      files.push({
        name: stem.file,
        blob: new Blob([blobPart(writeWav16([mono], buffer.sampleRate))], { type: "audio/wav" }),
        label: `${stem.role} · ${stem.events.length} events`,
      });
    }
    const manifest = stemsManifest({ plan, stems });
    files.push({
      name: `${plan.id}-stems.json`,
      blob: new Blob([JSON.stringify(manifest, null, 2)], { type: "application/json" }),
      label: "manifest schema v1",
    });
    if (files.length <= 1) throw new Error("every role is silent — there is nothing to bounce");
    return files;
  }

  // the full-mix wavs: one offline bounce, two channels, the desk's graph
  const buffer = await renderTakeOffline(plan, schedule);
  const channels = [buffer.getChannelData(0), buffer.getChannelData(1)];
  const bytes = kind === "wav24" ? writeWav24(channels, buffer.sampleRate) : writeWav16(channels, buffer.sampleRate);
  return [
    {
      name: `${plan.id}.wav`,
      blob: new Blob([blobPart(bytes)], { type: "audio/wav" }),
      label: `${buffer.sampleRate / 1000} kHz · ${formatSeconds(buffer.duration)} · ${kind === "wav24" ? "24" : "16"}-bit`,
    },
  ];
}

/**
 * Hands one file to the browser (the anchor click the save dialog answers).
 *
 * @param file the export file.
 */
export function downloadFile(file: ExportFile): void {
  const url = URL.createObjectURL(file.blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = file.name;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/** Averages the bounce's channels into the mono bus a stem rides. */
function mixToMono(buffer: AudioBuffer): Float32Array {
  const out = new Float32Array(buffer.length);
  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
    const data = buffer.getChannelData(channel);
    for (let index = 0; index < out.length; index++) out[index] += data[index] / buffer.numberOfChannels;
  }
  return out;
}

/** The m:ss.t clock the toast labels ride (the dawview law, kept local). */
function formatSeconds(seconds: number): string {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const rest = safe - minutes * 60;
  return `${minutes}:${rest.toFixed(1).padStart(4, "0")}`;
}
