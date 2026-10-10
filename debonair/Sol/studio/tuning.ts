// # tuning — the midi-to-hertz helper of the studio transport (Sol layer):
// the single conversion every synth recipe reads. Twelve-tone equal
// temperament, A4 = 440 Hz. Pure and side-effect free.

/** The A4 reference of the studio (Hz). */
export const CONCERT_PITCH = 440;

/** The midi note number A4 answers to. */
export const A4_MIDI = 69;

/**
 * Converts a midi note number to its frequency.
 *
 * @param midi the note number (fractional bends allowed).
 * @returns the frequency in Hz.
 */
export function midiToHz(midi: number): number {
  return CONCERT_PITCH * 2 ** ((midi - A4_MIDI) / 12);
}
