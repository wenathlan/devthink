// # audioattributes — the shared descriptor contract of the cadria audio
// wave: the five analysis summaries every sibling module reports
// (audiospectrum, audiorhythm, audiotonality, audiotimbre, audiostructure)
// and the fused AudioDescriptor the image-mapping wave consumes. This file
// is the canonical home of those types — siblings re-declare nothing and
// loosely built sibling objects still fuse, because the fusion layer
// (audiofeatures.ts) reads these shapes defensively. Plain numbers in
// documented units, no enums, no classes, no dependencies.

/** key quality — the two modes the tonal wave reports. */
export type KeyMode = "major" | "minor";

/** energy storyline of a clip over time. */
export type NarrativeShape = "arch" | "rise" | "fall" | "wave" | "flat";

/** spectrum summary over the whole clip — hz where noted, energies 0-1. */
export interface SpectralSummary {
  centroidMean: number; // mean spectral centroid, hz (0 … ~8000)
  centroidStd: number; // spread of the centroid over time, hz
  rolloffMean: number; // mean 85% rolloff frequency, hz
  flatnessMean: number; // mean flatness, 0 = tonal … 1 = noiselike
  flatnessStd: number; // spread of flatness over time
  fluxMean: number; // mean spectral flux (frame-to-frame change)
  fluxStd: number; // spread of flux over time
  bandBalance: number[]; // seven log-band energies 0-1, low → high
  brightnessIndex: number; // overall brightness weight, 0-1
}

/** pulse summary — tempo, trust and groove of the beat grid. */
export interface RhythmStats {
  bpm: number; // beats per minute, 0 … ~300
  confidence: number; // pulse trust, 0-1
  onsetsPerSecond: number; // onset density, 0 … ~8
  regularityIndex: number; // how even the pulse grid is, 0-1
  swing: { ratio: number; swung: boolean }; // beat-pair split, 0.5 straight → 0.75 triplet
  downbeatPeriodBeats: number; // beats per downbeat cycle (4 = 4/4)
}

/** tonal summary — key, chroma mass and how fast harmony moves. */
export interface HarmonicStats {
  key: {
    tonic: number; // pitch class 0 = c … 11 = b
    mode: KeyMode; // major or minor
    strength: number; // key confidence, 0-1
  };
  chromaEnergy: number[]; // twelve pitch-class energies 0-1, c first
  harmonicChangeRate: number; // chord-change speed, 0-1
  dissonanceIndex: number; // roughness weight, 0-1
}

/** timbre summary — texture, warmth and loudness envelope of the mix. */
export interface TimbreStats {
  noisiness: number; // noiselike vs pure weight, 0-1
  warmth: number; // low-mid body weight, 0-1
  dynamics: {
    rangeDb: number; // loud-soft span, db (0 … ~60)
    crestFactor: number; // peak/rms ratio, linear (0 … ~20)
  };
  brightness: number; // high-frequency weight, 0-1
  slopeMean: number; // mean spectral slope, db/octave (~-12 … 0)
  zcrMean: number; // mean zero-crossing rate, 0-0.5
}

/** form summary — length, sections and the energy storyline. */
export interface StructureStats {
  durationMs: number; // whole-clip length in milliseconds
  peakSectionMs: number; // length of the loudest section, ms
  repetitionIndex: number; // how self-similar the clip is, 0-1
  narrativeShape: NarrativeShape; // energy storyline over time
  sectionCount: number; // detected sections, 0 … ~12
}

/** the five-stat bundle the fusion layer folds into one descriptor. */
export interface DescriptorStats {
  spectral: SpectralSummary;
  rhythm: RhythmStats;
  harmonic: HarmonicStats;
  timbre: TimbreStats;
  structure: StructureStats;
}

/**
 * fused, image-ready view of one clip: a deterministic seed plus a 32-dim
 * 0-1 vector in the fixed order documented at the top of audiofeatures.ts
 * (dims 0-6 spectral, 7-11 rhythm, 12-15 tonal, 16-21 timbre, 22-27
 * energy/structure, 28-31 cross features) and named scalar conveniences for
 * quick reads (bpm, centroidHz, rolloffHz, brightness, contrastDb, crest,
 * durationMs, peakMs, sections, tonic, minor, keyStrength, swingRatio, …).
 */
export interface AudioDescriptor {
  /** contract revision — frozen at 1; bumps only with the mapping wave. */
  version: 1;
  /** 16-hex fnv-1a fingerprint: pcm bits when available, stats otherwise. */
  seed: string;
  /** exactly 32 dims, each clamped 0-1 — position is the contract. */
  vector: number[];
  /** named numbers the studio ui can read without dim arithmetic. */
  scalar: Record<string, number>;
}
