// # audiopipeline — the wave-1 orchestrator of the cadria audio half: one
// sample slice in, one deterministic AnalysisReport out. The pipeline chains
// the six analysis modules in the documented order (decode → stft →
// spectrum → rhythm → tonality → timbre → structure → descriptor) and
// never lets the interface pull it: every consumer reads the report shape
// exported here. Deterministic end to end — the wall-clock timings are the
// only fields excluded from equality, and they ride in their own subobject.

import type { AudioDescriptor, DescriptorStats, StructureStats } from "./audioattributes.ts";
import { type AudioFrames, decodeWav, downmix, resample } from "./audiodecode.ts";
import { audioSeed, fuseDescriptor } from "./audiofeatures.ts";
import { stft } from "./audiofft.ts";
import { rhythmStats } from "./audiorhythm.ts";
import { bandEnergies, summarizeSpectrum } from "./audiospectrum.ts";
import { analyzeStructure, type StructureStats as RawStructureStats } from "./audiostructure.ts";
import { timbreStats } from "./audiotimbre.ts";
import { chromagram, harmonicStats } from "./audiotonality.ts";

/** error raised when the pipeline refuses a slice: stable `code` field. */
export class PipelineError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "PipelineError";
    this.code = code;
  }
}

/** pipeline options: the analysis sample rate dominates the cost curve. */
export type PipelineOptions = { analysisSampleRate?: number };

/** the source metadata the report records beside the analysis. */
export type ReportSource = { kind: "wav" | "pcm"; sampleRate: number; channels: number; durationMs: number };

/** the full wave-1 answer: source, five stat blocks, descriptor, timings. */
export type AnalysisReport = {
  schemaVersion: 1;
  source: ReportSource;
  spectrum: ReturnType<typeof summarizeSpectrum>;
  rhythm: ReturnType<typeof rhythmStats>;
  harmonic: ReturnType<typeof harmonicStats>;
  timbre: ReturnType<typeof timbreStats>;
  structure: StructureStats;
  descriptor: AudioDescriptor;
  timings: { decodeMs: number; analysisMs: number };
};

/** the minimum slice the pipeline accepts: one second keeps every block honest. */
const MIN_DURATION_MS = 1000;

/** wraps raw structure stats into the canonical shared shape (sectionCount added). */
function canonicalStructure(raw: RawStructureStats): StructureStats {
  return {
    durationMs: raw.durationMs,
    peakSectionMs: raw.peakSectionMs,
    repetitionIndex: raw.repetitionIndex,
    narrativeShape: raw.narrativeShape,
    sectionCount: raw.sections.length,
  };
}

/**
 * analyzePcm — the full analysis chain over one interleaved sample buffer:
 * downmix/resample through the decode layer, stft for the spectrum summary
 * and the chromagram, the rhythm facade for tempo/onsets/swing, timbre over
 * the resampled slice, structure over the per-frame band energies, then the
 * descriptor fusion seeded from the pcm hash. Throws PipelineError for an
 * empty slice (`pipeline-empty-samples`), a slice shorter than one second
 * (`pipeline-too-short`) or a non-finite sample rate
 * (`pipeline-unsupported-sample-rate`).
 */
export function analyzePcm(
  samples: Float32Array,
  sampleRate: number,
  channels = 1,
  options: PipelineOptions = {},
): AnalysisReport {
  if (!Number.isFinite(sampleRate) || sampleRate <= 0)
    throw new PipelineError(
      "pipeline-unsupported-sample-rate",
      `audiopipeline: sampleRate must be finite > 0, got ${sampleRate}`,
    );
  if (!(samples instanceof Float32Array) || samples.length === 0)
    throw new PipelineError("pipeline-empty-samples", "audiopipeline: the sample slice is empty");
  const started = Date.now();
  const analysisRate = options.analysisSampleRate ?? 22050;
  const frames: AudioFrames = { sampleRate, channels, length: Math.floor(samples.length / channels), samples };
  const mono = channels === 1 ? frames : downmix(frames);
  const working = mono.sampleRate === analysisRate ? mono : resample(mono, analysisRate);
  const decodeMs = Date.now() - started;
  const durationMs = (working.length / working.sampleRate) * 1000;
  if (durationMs < MIN_DURATION_MS) {
    throw new PipelineError(
      "pipeline-too-short",
      `audiopipeline: the slice must run at least ${MIN_DURATION_MS} ms, got ${Math.round(durationMs)} ms`,
    );
  }
  const analysisStarted = Date.now();
  const size = 2048;
  const hop = 512;
  const magnitudeFrames = stft(working.samples, { size, hop });
  const spectrum = summarizeSpectrum(magnitudeFrames, working.sampleRate);
  const rhythm = rhythmStats(working.samples, working.sampleRate);
  const chroma = chromagram(magnitudeFrames, working.sampleRate, hop, size);
  const harmonic = harmonicStats(chroma, working.sampleRate, { hop });
  const timbre = timbreStats(working.samples, working.sampleRate, { size, hop });
  const bandFrames = magnitudeFrames.map((frame) => bandEnergies(frame, working.sampleRate));
  const frameRate = working.sampleRate / hop;
  const structure = canonicalStructure(analyzeStructure(bandFrames, frameRate));
  const stats: DescriptorStats = { spectral: spectrum, rhythm, harmonic, timbre, structure };
  const descriptor = fuseDescriptor(stats, audioSeed(working.samples));
  const analysisMs = Date.now() - analysisStarted;
  return {
    schemaVersion: 1,
    source: { kind: "pcm", sampleRate: working.sampleRate, channels: 1, durationMs },
    spectrum,
    rhythm,
    harmonic,
    timbre,
    structure,
    descriptor,
    timings: { decodeMs, analysisMs },
  };
}

/**
 * analyzeWavBytes — decode a wav container then hand the pcm to analyzePcm:
 * the decode options mirror the pipeline (mono, analysis sample rate), the
 * source kind records `wav` and decode errors surface as AudioDecodeError
 * from the decode layer untouched.
 */
export function analyzeWavBytes(bytes: Uint8Array, options: PipelineOptions = {}): AnalysisReport {
  if (!(bytes instanceof Uint8Array) || bytes.length === 0)
    throw new PipelineError("pipeline-empty-samples", "audiopipeline: the wav bytes are empty");
  const started = Date.now();
  const analysisRate = options.analysisSampleRate ?? 22050;
  const decoded = decodeWav(bytes, { targetSampleRate: analysisRate, mono: true });
  const decodeMs = Date.now() - started;
  const report = analyzePcm(decoded.samples, decoded.sampleRate, 1, options);
  return {
    ...report,
    source: { ...report.source, kind: "wav", sampleRate: decoded.sampleRate },
    timings: { ...report.timings, decodeMs },
  };
}

/** reportDigest — one lowercase line the studio UI can log: bpm, key, shape, seed. */
export function reportDigest(report: AnalysisReport): string {
  const { rhythm, harmonic, structure, descriptor } = report;
  const mode = harmonic.key.mode;
  const tonic = Math.round(harmonic.key.tonic);
  const keyName = `${["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"][tonic] ?? "?"} ${mode}`;
  return `bpm ${Math.round(rhythm.bpm)} · ${keyName} · ${structure.narrativeShape} · ${structure.sectionCount} sections · ${Math.round(report.source.durationMs)} ms · seed ${descriptor.seed}`;
}
