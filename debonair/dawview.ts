// # dawview — the pure view math of the DAW surfaces (root layer): the clock
// readout, the clip geometry the playlist draws, the fader mapping between
// dB and the handle position, the meter math between an analyser level and
// the VU percent, and the playhead percent. The studio consumes these
// through the components; the tests pin the numbers. Zero DOM, zero audio —
// every input and output is a plain number or string.

/** Formats seconds as the DAW clock "m:ss.t" (tabular-nums feed). */
export function formatClock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00.0";
  const safe = Math.min(seconds, 359999);
  const minutes = Math.floor(safe / 60);
  const rest = safe - minutes * 60;
  const whole = Math.floor(rest);
  const tenths = Math.floor((rest - whole) * 10);
  return `${minutes}:${String(whole).padStart(2, "0")}.${tenths}`;
}

/** One clip's percent geometry inside the timeline (left and width, 0..100). */
export function clipStyle(start: number, duration: number, total: number): { left: number; width: number } {
  if (total <= 0) return { left: 0, width: 0 };
  const left = Math.max(0, Math.min(100, (start / total) * 100));
  const width = Math.max(0, Math.min(100 - left, (duration / total) * 100));
  return { left, width };
}

/** The fader travel the DAW desk uses: −60 dB at the foot, +6 dB at the top. */
export const FADER_MIN_DB = -60;
export const FADER_MAX_DB = 6;

/** Clamps a fader value into the travel. */
export function clampFader(db: number): number {
  return Math.min(FADER_MAX_DB, Math.max(FADER_MIN_DB, db));
}

/** Maps a dB fader value to the handle position, 0 (foot) .. 1 (top). */
export function faderToUnit(db: number): number {
  return (clampFader(db) - FADER_MIN_DB) / (FADER_MAX_DB - FADER_MIN_DB);
}

/** Maps a handle position (0..1) back to dB, snapped to 0.5 dB steps. */
export function unitToFader(unit: number): number {
  const clamped = Math.min(1, Math.max(0, unit));
  const db = FADER_MIN_DB + clamped * (FADER_MAX_DB - FADER_MIN_DB);
  return Math.round(db * 2) / 2;
}

/** The −60..+6 dB fader steps a keyboard walk moves per press. */
export const FADER_STEP_DB = 0.5;

/** The VU percent of an analyser level: a dBFS reading into 0..100, −48 dB floor. */
export function levelToPercent(dbfs: number): number {
  if (!Number.isFinite(dbfs) || dbfs <= -48) return 0;
  return Math.min(100, Math.max(0, ((dbfs + 48) / 48) * 100));
}

/** The playhead percent of an instant inside the take (0..100). */
export function playheadPercent(time: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, (time / total) * 100));
}

/** Formats a dB gain the strips read ("−4.0", "−∞"). */
export function formatGain(db: number): string {
  return db === Number.NEGATIVE_INFINITY ? "−∞" : db.toFixed(1);
}
