/**
 * chime.ts — the opt-in intro sound. The doctrine: sound plays ONLY when the
 * visitor turned it on (localStorage dt.intro.sound === "on"); the default is
 * mute, which keeps the first paint autoplay-safe — no AudioContext is even
 * created for the silent majority. The bell is a two-partial WebAudio strike
 * with an exponential decay, assembled on the fly (no asset, no fetch).
 */

/** the localStorage key of the intro sound opt-in */
export const INTRO_SOUND_KEY = "dt.intro.sound";

/**
 * Reads the sound opt-in. Storage failures answer mute.
 *
 * @returns true only when the visitor explicitly turned the intro sound on.
 */
export function introSoundEnabled(): boolean {
  try {
    return window.localStorage.getItem(INTRO_SOUND_KEY) === "on";
  } catch {
    return false;
  }
}

/**
 * Rings the intro bell: a soft two-partial strike (E5 over B5) with a 1.1s
 * exponential decay. Every failure stays silent — the chime is decorative.
 */
export function playIntroChime(): void {
  if (!introSoundEnabled()) return;
  try {
    const Ctor = window.AudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    const start = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, start);
    master.gain.exponentialRampToValueAtTime(0.16, start + 0.02);
    master.gain.exponentialRampToValueAtTime(0.0001, start + 1.1);
    master.connect(ctx.destination);
    for (const [frequency, level] of [
      [659.25, 1],
      [987.77, 0.4],
    ] as const) {
      const osc = ctx.createOscillator();
      const partial = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = frequency;
      partial.gain.value = level;
      osc.connect(partial);
      partial.connect(master);
      osc.start(start);
      osc.stop(start + 1.2);
    }
    window.setTimeout(() => void ctx.close().catch(() => undefined), 1400);
  } catch {
    /* the chime is decorative: any failure stays silent */
  }
}
