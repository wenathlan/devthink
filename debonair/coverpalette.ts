// # coverpalette — the cover plate palette owner of the audio app: the
// derivation rides the cadria palette engine through the published library
// specifier ("@wenathlan/cadria/synthpalette"), the ownership law the family
// carries — the palette mapping law (the tonic-anchored hue, the noise-washed
// support field, the energy-tracked accents, the AA-guarded ink) is cadria's
// alone, never duplicated here; the audio contract (the fused descriptor the
// palette folds) is debonair's own. Two lanes answer: the pure stats lane
// (coverPaletteFromStats — the caller owns the five summaries) and the pcm
// lane (coverPaletteFromPcm — the bench derives the palette of the very
// bytes it ingested, one extra analysis pass at the pipeline's own analysis
// rate). Every entry is total: a refused pipeline (the too-short slice)
// answers the cadria engine's own fallback rung, never a throw, and the same
// pcm always answers the same palette bit-for-bit — the determinism the
// cover plate law carries over the name hash it replaces when real audio
// stands behind the plate.

import { FALLBACK_PALETTE, type Palette, synthPalette } from "@wenathlan/cadria/synthpalette";
import type { DescriptorStats } from "./audioattributes.ts";
import { fuseDescriptor } from "./audiofeatures.ts";
import { analyzePcm } from "./audiopipeline.ts";

/**
 * Derives the cover palette of an analyzed clip from its five stat blocks —
 * the pure lane: the stats fuse into the descriptor the way the pipeline
 * fuses them and the cadria engine folds the descriptor into the palette.
 *
 * @param stats the five-stat bundle (spectral, rhythm, harmonic, timbre,
 * structure) of the clip.
 * @returns the palette the cover plate renders (the fallback rung when the
 * stats are damaged — the cadria engine's own total law).
 */
export function coverPaletteFromStats(stats: DescriptorStats): Palette {
  return synthPalette(fuseDescriptor(stats));
}

/**
 * Derives the cover palette of decoded mono pcm — the bench lane: one extra
 * analysis pass at the pipeline's own analysis rate answers the fused
 * descriptor, the cadria engine folds it into the palette. A refused
 * pipeline (the slice under the one-second floor) answers the fallback rung
 * so the ingest never fails on the palette seat.
 *
 * @param mono the decoded mono pcm of the ingested track.
 * @param sampleRate the sample rate of the pcm.
 * @returns the palette the cover plate renders (the fallback rung when the
 * pipeline refuses the slice).
 */
export function coverPaletteFromPcm(mono: Float32Array, sampleRate: number): Palette {
  try {
    return synthPalette(analyzePcm(mono, sampleRate).descriptor);
  } catch {
    return FALLBACK_PALETTE;
  }
}

/**
 * The accent hexes the cover plate renders: the anchor leads (the hero
 * color of the clip) and the engine accents follow (two to four pops whose
 * count tracks the energy the descriptor carried).
 *
 * @param palette the palette the derivation answered.
 * @returns the anchor followed by the accents.
 */
export function plateAccents(palette: Palette): readonly string[] {
  return [palette.anchor, ...palette.accents];
}
