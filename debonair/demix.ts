// # demix — the four-stem demix of the katexis engine (root layer, the
// wave the stem planner always stopped short of): one mono signal in,
// the four stems the remix market rides out — vocals, drums, bass,
// other — every one of them real pcm, the whole walk through the
// existing dsp lanes, zero new kernels. The separation law is the honest
// one the node-side lanes own: one shared stft (hpss — the same centered
// framing every analysis lane reads), the classical median-filter hpss
// masks (the harmonic ridge against the percussive broadband, the soft
// wiener pair that always sums to one) and the band-split refinements on
// top of the harmonic mask: the bass band mask (the raised-cosine
// crossover at 250 hz, the sub-bass seat a bass stem owns), the vocal
// formant band mask (the 300..3400 hz band with the soft skirts, the
// seat a sung or spoken voice rides) and the complement both leave (the
// instrumental other stem). The conservation law is the whole point and
// the test pins it: the four masks sum to one for every frame and bin
// (drums + harmonic = 1 from the wiener pair, bass + vocals + other = the
// harmonic share by construction), the four stems carry the ORIGINAL
// phases, so the istft pair of any subset and the sum of all four answers
// the input within float tolerance — the demix never invents and never
// loses energy.
// The honest limits, documented never hidden: a four-stem demix without
// a trained model routes by the seats the signal itself declares — the
// percussive transient seat (every kick and snare hit), the sustained
// low band (the sub-bass), the sustained vocal formant band (a voice
// alone in that band answers the vocals stem; a pad inside the same
// band answers it too, the band law cannot tell a voice from a pad —
// the trained-separator wave owns that answer, this lane owns the
// honest spectral routing). Every stem renders to real pcm bytes (the
// mono float32 lanes every consumer rides) and to the wav the export
// seam writes (wavwriter, mono pcm 16 at the mastering law). Pure and
// deterministic: the same input always answers the same stems,
// bit-for-bit, node and browser alike — zero storage, zero audio
// context, zero network.

import { type Stft, istft, masksOf, medianFilter, stft, HARMONIC_KERNEL, PERCUSSIVE_KERNEL } from "./hpss.ts";
import { encodeWav } from "./wavwriter.ts";

/** The machine readable failure codes of the demix contract. */
export type DemixErrorCode = "empty-signal" | "bad-rate";

/** The typed demix failure, traceable to a machine code. */
export class DemixError extends Error {
  /** Machine readable failure code. */
  readonly code: DemixErrorCode;

  constructor(code: DemixErrorCode, message?: string) {
    super(message ?? `demix ${code}`);
    this.name = "DemixError";
    this.code = code;
  }
}

/** The canonical stem names of the four-stem demix, the answer's order. */
export const DEMIX_STEM_NAMES = ["vocals", "drums", "bass", "other"] as const;

/** One stem name of the four-stem demix. */
export type DemixStemName = (typeof DEMIX_STEM_NAMES)[number];

/** The bass crossover seat: the band mask rides the raised-cosine ramp
 * between these edges — 200 hz flat below, 300 hz flat above (the classic
 * sub-bass seat, the ingest three-band split's own low edge is 250). */
export const DEMIX_BASS_HZ: readonly [number, number] = [200, 300];

/** The vocal formant band: the band mask rides the raised-cosine skirts
 * between these edges — 200..300 hz rising, 3400..4400 hz falling (the
 * F1..F3 span of the human voice, the formant lane's own register). */
export const DEMIX_VOCAL_HZ: readonly [number, number, number, number] = [200, 300, 3400, 4400];

/**
 * The raised-cosine ramp between two edges: 0 at the low edge, 1 at the
 * high edge, the cosine skirt between — the soft crossover every band
 * mask rides (a hard edge would ring the istft, the mask law keeps the
 * transition smooth).
 *
 * @param value the position to read.
 * @param low the edge where the ramp answers 0.
 * @param high the edge where the ramp answers 1.
 * @returns the ramp 0..1, clamped outside the edges.
 */
function rampOf(value: number, low: number, high: number): number {
  if (value <= low) return 0;
  if (value >= high) return 1;
  const seat = (value - low) / (high - low);
  return 0.5 - 0.5 * Math.cos(Math.PI * seat);
}

/**
 * The bass band mask of one bin: 1 through the sub-bass, the cosine ramp
 * out through the crossover, 0 above it.
 *
 * @param hz the bin frequency.
 * @returns the mask 0..1.
 */
function bassMaskOf(hz: number): number {
  return 1 - rampOf(hz, DEMIX_BASS_HZ[0], DEMIX_BASS_HZ[1]);
}

/**
 * The vocal formant band mask of one bin: the soft skirts in and out of
 * the 300..3400 hz band (the voice's own register, the formant lane's
 * seats).
 *
 * @param hz the bin frequency.
 * @returns the mask 0..1.
 */
function vocalMaskOf(hz: number): number {
  const [riseLow, riseHigh, fallLow, fallHigh] = DEMIX_VOCAL_HZ;
  const rise = rampOf(hz, riseLow, riseHigh);
  const fall = 1 - rampOf(hz, fallLow, fallHigh);
  return Math.min(rise, fall);
}

/** One separated stem: the name, the pcm and the honest energy facts. */
export interface DemixStem {
  /** The stem name (one of DEMIX_STEM_NAMES). */
  name: DemixStemName;
  /** The stem pcm, the input's own length, the original phases riding. */
  pcm: Float32Array;
  /** The stem's peak (0..1+). */
  peak: number;
  /** The stem's rms. */
  rms: number;
}

/** The four-stem answer: one stem per name, in the canonical order. */
export interface DemixResult {
  /** The vocals stem (the harmonic energy of the vocal formant band). */
  vocals: DemixStem;
  /** The drums stem (the percussive mask — every transient). */
  drums: DemixStem;
  /** The bass stem (the harmonic energy under the 250 hz crossover). */
  bass: DemixStem;
  /** The other stem (the harmonic energy the voice and the bass do not own). */
  other: DemixStem;
  /** The sample rate the masks and the stems rode (the caller's own). */
  sampleRate: number;
  /** The stems in the canonical order (the zip the export seam rides). */
  stems: readonly DemixStem[];
}

/** The rms of a pcm block. */
function rmsOf(pcm: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < pcm.length; i++) sum += pcm[i] * pcm[i];
  return Math.sqrt(sum / Math.max(1, pcm.length));
}

/** The peak of a pcm block. */
function peakOf(pcm: Float32Array): number {
  let peak = 0;
  for (let i = 0; i < pcm.length; i++) {
    const value = Math.abs(pcm[i] ?? 0);
    if (value > peak) peak = value;
  }
  return peak;
}

/** One stem of the answer, built from its mask matrix over the shared stft. */
function stemOf(name: DemixStemName, spectra: Stft, mask: readonly Float32Array[], length: number): DemixStem {
  const full = istft(spectra, mask);
  const pcm = Float32Array.from(full.subarray(spectra.pre, spectra.pre + length));
  return { name, pcm, peak: peakOf(pcm), rms: rmsOf(pcm) };
}

/**
 * Builds the four band-refined masks over one hpss mask pair: the
 * percussive mask answers the drums untouched; the harmonic share splits
 * three ways — the bass band under the crossover, the vocal formant band
 * above it, the complement to the other stem. The four masks sum to one
 * for every frame and bin (the wiener pair already sums to one, the
 * three-way split of the harmonic share sums to the harmonic share by
 * construction): the conservation law the stems carry.
 *
 * @param spectra the shared stft of the input.
 * @param harmonic the harmonic wiener mask (per frame, per bin).
 * @param percussive the percussive wiener mask.
 * @param sampleRate the rate the bin frequencies read.
 * @returns the four masks in the canonical order.
 */
function demixMasks(
  spectra: Stft,
  harmonic: readonly Float32Array[],
  percussive: readonly Float32Array[],
  sampleRate: number,
): {
  vocals: Float32Array[];
  drums: Float32Array[];
  bass: Float32Array[];
  other: Float32Array[];
} {
  const bins = spectra.mag[0]?.length ?? 0;
  const binHz = sampleRate / spectra.size;
  const bassBand = new Float64Array(bins);
  const vocalBand = new Float64Array(bins);
  for (let b = 0; b < bins; b++) {
    bassBand[b] = bassMaskOf(b * binHz);
    vocalBand[b] = vocalMaskOf(b * binHz);
  }
  const vocals: Float32Array[] = [];
  const drums: Float32Array[] = [];
  const bass: Float32Array[] = [];
  const other: Float32Array[] = [];
  for (let f = 0; f < spectra.frames; f++) {
    const h = harmonic[f] ?? new Float32Array(bins);
    const p = percussive[f] ?? new Float32Array(bins);
    const v = new Float32Array(bins);
    const d = new Float32Array(bins);
    const b = new Float32Array(bins);
    const o = new Float32Array(bins);
    for (let k = 0; k < bins; k++) {
      const bassSeat = bassBand[k] ?? 0;
      const vocalSeat = vocalBand[k] ?? 0;
      // the harmonic share splits three ways: the bass band first, the
      // vocal band over the complement, the rest to the other stem — the
      // three seats sum to the harmonic share exactly
      d[k] = p[k] ?? 0;
      b[k] = (h[k] ?? 0) * bassSeat;
      const aboveBass = (h[k] ?? 0) * (1 - bassSeat);
      v[k] = aboveBass * vocalSeat;
      o[k] = aboveBass * (1 - vocalSeat);
    }
    vocals.push(v);
    drums.push(d);
    bass.push(b);
    other.push(o);
  }
  return { vocals, drums, bass, other };
}

/**
 * Demixes one mono signal into the four stems — vocals, drums, bass,
 * other — through the existing dsp lanes: the shared hpss stft, the
 * median-filter wiener pair, the band-split refinement of the harmonic
 * share, one istft per stem over the original phases. Deterministic and
 * conserving: the four stems sum back to the input within float
 * tolerance (the conservation law the tests pin), the same input always
 * answers the same stems.
 *
 * @param mono the input samples (any level).
 * @param sampleRate the input's sample rate (the band masks read hz).
 * @returns the four stems in the canonical order, each the input's length.
 * @throws DemixError empty-signal when nothing rides the input, bad-rate
 *   when the rate is not a positive finite number.
 */
export function demix(mono: Float32Array, sampleRate: number): DemixResult {
  if (!(mono.length > 0)) throw new DemixError("empty-signal", "the demix needs samples — nothing rides the input");
  if (!Number.isFinite(sampleRate) || sampleRate <= 0)
    throw new DemixError("bad-rate", `the sample rate ${String(sampleRate)} is not a usable hz`);
  const spectra = stft(mono);
  const harmonicMag = medianFilter(spectra.mag, HARMONIC_KERNEL, "time");
  const percussiveMag = medianFilter(spectra.mag, PERCUSSIVE_KERNEL, "freq");
  const pair = masksOf(harmonicMag, percussiveMag);
  const masks = demixMasks(spectra, pair.harmonic, pair.percussive, sampleRate);
  const vocals = stemOf("vocals", spectra, masks.vocals, mono.length);
  const drums = stemOf("drums", spectra, masks.drums, mono.length);
  const bass = stemOf("bass", spectra, masks.bass, mono.length);
  const other = stemOf("other", spectra, masks.other, mono.length);
  return {
    vocals,
    drums,
    bass,
    other,
    sampleRate,
    stems: [vocals, drums, bass, other],
  };
}

/** One stem's wav answer: the file name and the bytes. */
export interface DemixWav {
  /** The stem name. */
  name: DemixStemName;
  /** The wav file name ("<name>.wav"). */
  file: string;
  /** The encoded wav bytes (mono pcm 16 at the input's rate). */
  bytes: Uint8Array;
}

/**
 * Renders every stem to its wav bytes — the export seam of the demix: one
 * mono pcm 16 wav per stem (wavwriter's own encoder, the mastering law's
 * depth), the stems in the canonical order, the file names the stem
 * carries. The bytes are real: the same encode the bounce lane rides.
 *
 * @param mono the input samples.
 * @param sampleRate the input's sample rate.
 * @returns one wav per stem, in the canonical order.
 * @throws DemixError the demix's own codes, plus the wav writer's typed
 *   refusal (WavError) when the encode refuses the bounce.
 */
export function demixToWavs(mono: Float32Array, sampleRate: number): DemixWav[] {
  const result = demix(mono, sampleRate);
  return result.stems.map((stem) => ({
    name: stem.name,
    file: `${stem.name}.wav`,
    bytes: encodeWav([stem.pcm], { sampleRate, bitDepth: 16 }),
  }));
}
