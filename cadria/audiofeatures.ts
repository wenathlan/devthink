// # audiofeatures — the fusion layer of the cadria audio wave: it folds the
// five analysis summaries (spectrum, rhythm, tonality, timbre, structure —
// the shared shapes of audioattributes.ts) into one deterministic
// AudioDescriptor — a 32-dim vector clamped 0-1 in a fixed documented order
// plus a 16-hex fnv-1a seed — so the image-mapping wave can drive generation
// from audio without touching dsp. Pure and total: damaged input (NaN,
// missing fields, short arrays) is coerced, never thrown, and the same stats
// or the same pcm always answer the same descriptor bit-for-bit. The seed
// prefers raw pcm (audioSeed — stride-sampled fnv-1a over the float32 bit
// patterns, ≤8192 words) and falls back to the stats themselves
// (audioSeedFromStats) when pcm is unavailable. Fixed vector order (position
// is the contract): 0-6 spectral (centroid, spread, rolloff, flatness, flux,
// flux variance, brightness) · 7-11 rhythm (tempo, pulse confidence, onset
// density, regularity, swing) · 12-15 tonal (tonic class, key strength,
// harmonic change, dissonance) · 16-21 timbre (noisiness, warmth, timbre
// brightness, texture slope, zero crossings, dynamics contrast) · 22-27
// energy/structure (crest punch, duration, peak mass, repetition, narrative
// contour, section density) · 28-31 cross (brightness×pulse, flux×onset
// drive, band tilt low-vs-high, mood shadow = minor key strength).
// Exports: DESCRIPTOR_DIMS, DIM_ORDER, NARRATIVE_CONTOUR, clamp01, normalize01, zcurve, fuseDescriptor, audioSeed, audioSeedFromStats, descriptorSummary.

import type {
  AudioDescriptor,
  DescriptorStats,
  HarmonicStats,
  NarrativeShape,
  RhythmStats,
  SpectralSummary,
  StructureStats,
  TimbreStats,
} from "./audioattributes.ts";

/** the vector holds exactly this many dims — the mapping wave reads by index. */
export const DESCRIPTOR_DIMS = 32;

/** dim names by position — position i of the vector is DIM_ORDER[i]. */
export const DIM_ORDER: readonly string[] = [
  "spectralCentroid",
  "spectralSpread",
  "rolloff",
  "flatness",
  "flux",
  "fluxVariance",
  "brightness",
  "tempo",
  "pulseConfidence",
  "onsetDensity",
  "grooveRegularity",
  "swing",
  "tonalCenter",
  "keyStrength",
  "harmonicChange",
  "dissonance",
  "noisiness",
  "warmth",
  "timbreBrightness",
  "textureSlope",
  "zeroCrossings",
  "contrast",
  "punch",
  "duration",
  "peakMass",
  "repetition",
  "narrativeContour",
  "sectionDensity",
  "brightnessPulse",
  "energyDrive",
  "bandTilt",
  "moodShadow",
];

/** narrative shapes → 0-1 contour weight (how much energy climbs to the tail). */
export const NARRATIVE_CONTOUR: Record<NarrativeShape, number> = {
  arch: 0.75,
  rise: 1,
  fall: 0.25,
  wave: 0.5,
  flat: 0,
};

/** pitch-class names, tonic 0 = c (summary text only). */
const TONIC_NAMES = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"];

/** fnv-1a offset basis (32-bit) shared by both seed lanes. */
const FNV_BASIS = 0x811c9dc5;

/** fnv-1a prime (32-bit) — imul keeps every fold inside int32 land. */
const FNV_PRIME = 0x01000193;

/** at most this many pcm words enter the seed hash (stride grows instead). */
const SEED_SAMPLE_CAP = 8192;

/** clamps x into 0-1; non-finite answers 0 — total, never NaN. */
export function clamp01(x: number): number {
  if (!Number.isFinite(x)) return 0;
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

/** linear map of x from [lo, hi] into 0-1, clamped; damaged bounds answer 0. */
export function normalize01(x: number, lo: number, hi: number): number {
  if (!Number.isFinite(x) || !Number.isFinite(lo) || !Number.isFinite(hi) || hi <= lo) return 0;
  return clamp01((x - lo) / (hi - lo));
}

/** logistic squash around `center` with `spread` — a smooth monotonic 0-1
 *  curve for unbounded quantities (tempo) that avoids hard clamp edges. */
export function zcurve(x: number, center: number, spread: number): number {
  if (!Number.isFinite(x) || !Number.isFinite(center) || !Number.isFinite(spread) || spread <= 0) return 0;
  return clamp01(1 / (1 + Math.exp(-(x - center) / spread)));
}

/** one fnv-1a byte fold over a 32-bit lane. */
function fold(lane: number, byte: number): number {
  return Math.imul((lane ^ (byte & 0xff)) >>> 0, FNV_PRIME) >>> 0;
}

/** renders one 32-bit lane as 8 lowercase hex digits. */
function hex8(lane: number): string {
  return (lane >>> 0).toString(16).padStart(8, "0");
}

/** loose view of a possibly damaged stat object: every field unknown/absent. */
type Loose<T> = { [K in keyof T]?: unknown };

function view<T>(o: unknown): Loose<T> {
  return o !== null && typeof o === "object" ? (o as Loose<T>) : {};
}

/** total number read: finite numbers pass, everything else answers 0. */
function num(x: unknown): number {
  return typeof x === "number" && Number.isFinite(x) ? x : 0;
}

/** total array-slot read for the fixed-length stat arrays. */
function slot(a: unknown, i: number): number {
  if (!Array.isArray(a)) return 0;
  return num((a as unknown[])[i]);
}

/** seed serializer: finite numbers print verbatim, damaged values print "?" —
 *  the same stats always yield the same string, so the same seed. */
function fmt(x: unknown): string {
  return typeof x === "number" && Number.isFinite(x) ? String(x) : "?";
}

/** fixed-count list print for the chroma/band arrays. */
function fmtlist(a: unknown, count: number): string {
  if (!Array.isArray(a)) return "?";
  const list = a as unknown[];
  return Array.from({ length: count }, (_, i) => fmt(list[i])).join(",");
}

/**
 * deterministic 64-bit-ish audio fingerprint: two fnv-1a lanes over at most
 * 8192 stride-sampled float32 words (low lane folds the bytes little-endian,
 * high lane big-endian), with the word count folded in first so even
 * silences of different lengths diverge. Same pcm → same seed, always.
 */
export function audioSeed(pcm: Float32Array): string {
  const data = pcm instanceof Float32Array ? pcm : new Float32Array(0);
  const words = data.byteLength >> 2;
  let low = FNV_BASIS;
  let high = FNV_BASIS;
  low = fold(fold(fold(fold(low, words & 0xff), (words >>> 8) & 0xff), (words >>> 16) & 0xff), (words >>> 24) & 0xff);
  high = fold(fold(fold(fold(high, (words >>> 24) & 0xff), (words >>> 16) & 0xff), (words >>> 8) & 0xff), words & 0xff);
  if (words > 0) {
    const stride = Math.max(1, Math.ceil(words / SEED_SAMPLE_CAP));
    const bytes = new DataView(data.buffer, data.byteOffset, words * 4);
    for (let w = 0; w < words; w += stride) {
      const bits = bytes.getUint32(w * 4, true);
      low = fold(fold(fold(fold(low, bits & 0xff), (bits >>> 8) & 0xff), (bits >>> 16) & 0xff), (bits >>> 24) & 0xff);
      high = fold(fold(fold(fold(high, (bits >>> 24) & 0xff), (bits >>> 16) & 0xff), (bits >>> 8) & 0xff), bits & 0xff);
    }
  }
  return hex8(low) + hex8(high);
}

/**
 * stats fallback of the seed: folds a canonical pipe-string of every stat
 * field in fixed order (fnv-1a, two lanes — low over low bytes, high over
 * high bytes). Stable for identical stats, different for different stats.
 */
export function audioSeedFromStats(stats: DescriptorStats): string {
  const box = view<DescriptorStats>(stats);
  const sp = view<SpectralSummary>(box.spectral);
  const rh = view<RhythmStats>(box.rhythm);
  const ha = view<HarmonicStats>(box.harmonic);
  const ti = view<TimbreStats>(box.timbre);
  const st = view<StructureStats>(box.structure);
  const sw = view<RhythmStats["swing"]>(rh.swing);
  const dy = view<TimbreStats["dynamics"]>(ti.dynamics);
  const key = view<HarmonicStats["key"]>(ha.key);
  const line = [
    "cadria-audio-descriptor-v1",
    fmt(sp.centroidMean),
    fmt(sp.centroidStd),
    fmt(sp.rolloffMean),
    fmt(sp.flatnessMean),
    fmt(sp.flatnessStd),
    fmt(sp.fluxMean),
    fmt(sp.fluxStd),
    fmt(sp.brightnessIndex),
    fmtlist(sp.bandBalance, 7),
    fmt(rh.bpm),
    fmt(rh.confidence),
    fmt(rh.onsetsPerSecond),
    fmt(rh.regularityIndex),
    fmt(sw.ratio),
    sw.swung === true ? "1" : "0",
    fmt(rh.downbeatPeriodBeats),
    fmt(key.tonic),
    key.mode === "minor" ? "minor" : "major",
    fmt(key.strength),
    fmtlist(ha.chromaEnergy, 12),
    fmt(ha.harmonicChangeRate),
    fmt(ha.dissonanceIndex),
    fmt(ti.noisiness),
    fmt(ti.warmth),
    fmt(dy.rangeDb),
    fmt(dy.crestFactor),
    fmt(ti.brightness),
    fmt(ti.slopeMean),
    fmt(ti.zcrMean),
    fmt(st.durationMs),
    fmt(st.peakSectionMs),
    fmt(st.repetitionIndex),
    typeof st.narrativeShape === "string" ? st.narrativeShape : "?",
    fmt(st.sectionCount),
  ].join("|");
  let low = FNV_BASIS;
  let high = FNV_BASIS;
  for (let i = 0; i < line.length; i += 1) {
    const code = line.charCodeAt(i);
    low = fold(low, code & 0xff);
    high = fold(high, (code >>> 8) & 0xff);
  }
  return hex8(low) + hex8(high);
}

/**
 * folds the five stat summaries into the image-ready descriptor. The vector
 * order is the contract documented at the top of this file; every raw value
 * travels through an explicit range and the final guard re-clamps each dim
 * into 0-1, so no NaN or out-of-range number can ever escape. `seedOverride`
 * (e.g. audioSeed(pcm)) wins when the raw audio is at hand; otherwise the
 * descriptor seeds from the stats themselves. The answer is frozen — the
 * contract is immutable once fused.
 */
export function fuseDescriptor(stats: DescriptorStats, seedOverride?: string): AudioDescriptor {
  const box = view<DescriptorStats>(stats);
  const sp = view<SpectralSummary>(box.spectral);
  const rh = view<RhythmStats>(box.rhythm);
  const ha = view<HarmonicStats>(box.harmonic);
  const ti = view<TimbreStats>(box.timbre);
  const st = view<StructureStats>(box.structure);
  const sw = view<RhythmStats["swing"]>(rh.swing);
  const dy = view<TimbreStats["dynamics"]>(ti.dynamics);
  const key = view<HarmonicStats["key"]>(ha.key);
  const rawShape = st.narrativeShape;
  const shape: NarrativeShape =
    typeof rawShape === "string" && rawShape in NARRATIVE_CONTOUR ? (rawShape as NarrativeShape) : "flat";
  const confidence = clamp01(num(rh.confidence));
  const brightness = clamp01(num(sp.brightnessIndex));
  const fluxMean = num(sp.fluxMean);
  const onsets = num(rh.onsetsPerSecond);
  const lowAvg = (slot(sp.bandBalance, 0) + slot(sp.bandBalance, 1)) / 2;
  const highAvg = (slot(sp.bandBalance, 5) + slot(sp.bandBalance, 6)) / 2;
  const vector: number[] = [
    // dims 0-6 · spectral shape
    normalize01(num(sp.centroidMean), 0, 8000),
    normalize01(num(sp.centroidStd), 0, 4000),
    normalize01(num(sp.rolloffMean), 0, 12000),
    normalize01(num(sp.flatnessMean), 0, 0.5),
    normalize01(fluxMean, 0, 0.3),
    normalize01(num(sp.fluxStd), 0, 0.2),
    brightness,
    // dims 7-11 · rhythm pulse
    zcurve(num(rh.bpm), 110, 40),
    confidence,
    normalize01(onsets, 0, 8),
    clamp01(num(rh.regularityIndex)),
    normalize01(num(sw.ratio), 0.5, 0.75),
    // dims 12-15 · tonal field
    clamp01(num(key.tonic) / 11),
    clamp01(num(key.strength)),
    clamp01(num(ha.harmonicChangeRate)),
    clamp01(num(ha.dissonanceIndex)),
    // dims 16-21 · timbre color
    clamp01(num(ti.noisiness)),
    clamp01(num(ti.warmth)),
    clamp01(num(ti.brightness)),
    normalize01(num(ti.slopeMean), -12, 0),
    normalize01(num(ti.zcrMean), 0, 0.5),
    normalize01(num(dy.rangeDb), 0, 60),
    // dims 22-27 · energy & structure
    normalize01(num(dy.crestFactor), 0, 20),
    normalize01(num(st.durationMs), 0, 360000),
    normalize01(num(st.peakSectionMs), 0, 60000),
    clamp01(num(st.repetitionIndex)),
    NARRATIVE_CONTOUR[shape],
    normalize01(num(st.sectionCount), 0, 12),
    // dims 28-31 · cross features
    clamp01(brightness * confidence),
    clamp01((fluxMean * onsets) / 2.4),
    clamp01((lowAvg - highAvg + 1) / 2),
    clamp01(num(key.strength) * (key.mode === "minor" ? 1 : 0)),
  ];
  if (vector.length !== DESCRIPTOR_DIMS) throw new Error("descriptor vector must hold exactly 32 dims");
  const guarded = vector.map(clamp01);
  const vectorMean = guarded.reduce((sum, v) => sum + v, 0) / DESCRIPTOR_DIMS;
  const chroma = Array.isArray(ha.chromaEnergy)
    ? (ha.chromaEnergy as unknown[]).reduce<number>((m, v) => Math.max(m, num(v)), 0)
    : 0;
  const scalar: Record<string, number> = {
    bpm: num(rh.bpm),
    confidence,
    centroidHz: num(sp.centroidMean),
    rolloffHz: num(sp.rolloffMean),
    flatness: clamp01(num(sp.flatnessMean)),
    brightness,
    noisiness: clamp01(num(ti.noisiness)),
    warmth: clamp01(num(ti.warmth)),
    contrastDb: num(dy.rangeDb),
    crest: num(dy.crestFactor),
    durationMs: num(st.durationMs),
    peakMs: num(st.peakSectionMs),
    repetition: clamp01(num(st.repetitionIndex)),
    sections: num(st.sectionCount),
    contour: NARRATIVE_CONTOUR[shape],
    tonic: num(key.tonic),
    minor: key.mode === "minor" ? 1 : 0,
    keyStrength: clamp01(num(key.strength)),
    harmonicChange: clamp01(num(ha.harmonicChangeRate)),
    dissonance: clamp01(num(ha.dissonanceIndex)),
    swingRatio: num(sw.ratio),
    swung: sw.swung === true ? 1 : 0,
    downbeat: num(rh.downbeatPeriodBeats),
    chromaPeak: clamp01(chroma),
    vectorMean,
  };
  const seed = typeof seedOverride === "string" && seedOverride.length > 0 ? seedOverride : audioSeedFromStats(stats);
  const descriptor: AudioDescriptor = {
    version: 1,
    seed,
    vector: Object.freeze(guarded) as unknown as number[],
    scalar,
  };
  Object.freeze(scalar);
  Object.freeze(descriptor);
  return descriptor;
}

/**
 * human-readable lowercase block of "what the audio says" for the studio
 * ui: one line per family (pulse, key, spectrum, timbre, form) built from
 * the named scalars — never throws on a damaged descriptor.
 */
export function descriptorSummary(d: AudioDescriptor): string {
  const s: Record<string, unknown> = (d?.scalar ?? {}) as Record<string, unknown>;
  const g = (k: string): number => num(s[k]);
  const tonic = TONIC_NAMES[Math.min(11, Math.max(0, Math.round(g("tonic"))))] ?? "c";
  const mode = g("minor") >= 0.5 ? "minor" : "major";
  const shapes = Object.keys(NARRATIVE_CONTOUR) as NarrativeShape[];
  const shape = shapes.find((k) => NARRATIVE_CONTOUR[k] === g("contour")) ?? "flat";
  return [
    `audio descriptor v1 · seed ${typeof d?.seed === "string" ? d.seed : "unknown"}`,
    `tempo ${g("bpm").toFixed(1)} bpm · pulse confidence ${g("confidence").toFixed(2)} · swing ${g("swingRatio").toFixed(2)} · downbeat every ${g("downbeat").toFixed(1)} beats`,
    `key ${tonic} ${mode} (strength ${g("keyStrength").toFixed(2)}) · harmonic change ${g("harmonicChange").toFixed(2)} · dissonance ${g("dissonance").toFixed(2)}`,
    `spectral centroid ${g("centroidHz").toFixed(0)} hz · rolloff ${g("rolloffHz").toFixed(0)} hz · brightness ${g("brightness").toFixed(2)} · flatness ${g("flatness").toFixed(2)}`,
    `timbre noisiness ${g("noisiness").toFixed(2)} · warmth ${g("warmth").toFixed(2)} · contrast ${g("contrastDb").toFixed(1)} db · crest ${g("crest").toFixed(1)}`,
    `structure ${g("durationMs").toFixed(0)} ms · peak section ${g("peakMs").toFixed(0)} ms · ${g("sections").toFixed(0)} sections · ${shape} contour · repetition ${g("repetition").toFixed(2)}`,
  ].join("\n");
}
