// # runstream — the deterministic log stream of the forge (root layer,
// pure logic). The logs the /logs page replays: a run produces its line
// stream from ONE integer seed (mulberry32) — the same seed always replays
// the same run, in node and in the browser, so the stream is testable line
// by line. The stream is honest about being a replay: the surface says
// "seeded replay of a run on the saddle engine boundary", never a live
// tail of a real floor.

/** the levels a log line can carry. */
export type LogLevel = "info" | "warn" | "error";

/** one line of the run log: the offset (ms) into the run and its text. */
export interface LogLine {
  /** ms offset from the run start (tabular clock rendering belongs to the view) */
  t: number;
  level: LogLevel;
  text: string;
}

/** the outcome a run log answers. */
export type RunOutcome = "success" | "failed";

/** mulberry32 — the small deterministic prng of the family engines. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** the boot lines every run opens with (the mount phase of the floor). */
function bootLines(mode: string): LogLine[] {
  return [
    { t: 0, level: "info", text: `floor: accepting run on the ${mode} boundary` },
    { t: 120, level: "info", text: "mount sandbox full-virtual — ok" },
    { t: 240, level: "info", text: "restore working set (clone .tzst) — ok" },
  ];
}

/** replays the run log of one seed: boot, the seeded build steps (with
 * warns and at most one error), then the outcome report. Deterministic —
 * the same seed answers the same lines, forever. */
export function runLogLines(seed: number, steps = 5): LogLine[] {
  const rand = mulberry32(seed);
  const modes = ["full-virtual", "runner", "node-packages", "docker", "ghcr"] as const;
  const mode = modes[Math.floor(rand() * modes.length)] as (typeof modes)[number];
  const lines: LogLine[] = bootLines(mode);
  let t = 240;
  const failingStep = rand() < 0.25 ? Math.floor(rand() * steps) : -1;
  for (let i = 0; i < steps; i++) {
    const dur = 400 + Math.floor(rand() * 1800);
    t += dur;
    const label = `step ${String(i + 1).padStart(2, "0")}`;
    if (i === failingStep) {
      lines.push({ t, level: "error", text: `${label}: command exited 1 — the step failed` });
      t += 120;
      lines.push({ t, level: "info", text: "outcome: failed — evidence kept beside the runner" });
      return lines;
    }
    lines.push({ t, level: "info", text: `${label}: ok in ${dur} ms` });
    if (rand() < 0.22) {
      t += 60;
      lines.push({ t, level: "warn", text: `${label}: deprecation notice from the toolchain (kept)` });
    }
  }
  t += 300;
  lines.push({ t, level: "info", text: "pack run log — ok" });
  lines.push({ t, level: "info", text: "outcome: success — reported over https" });
  return lines;
}

/** the outcome the log answers: failed when an error line exists. */
export function logOutcome(lines: readonly LogLine[]): RunOutcome {
  return lines.some((line) => line.level === "error") ? "failed" : "success";
}

/** the prefix of the stream visible at `ms` into the run (the live tail of
 * the replay — pure, so the page can render it on a timer). */
export function linesWithin(lines: readonly LogLine[], ms: number): LogLine[] {
  return lines.filter((line) => line.t <= ms);
}

/** the total duration of the run (the last line's offset). */
export function logDuration(lines: readonly LogLine[]): number {
  return lines.reduce((max, line) => Math.max(max, line.t), 0);
}

/** the tabular clock of the log view: mm:ss.mmm, always the same width. */
export function formatLogTime(ms: number): string {
  const total = Math.max(0, Math.floor(ms));
  const m = Math.floor(total / 60_000);
  const s = Math.floor((total % 60_000) / 1000);
  const msec = total % 1000;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(msec).padStart(3, "0")}`;
}

/** the plain text of the stream (the copyable form the page offers). */
export function logText(lines: readonly LogLine[]): string {
  return lines.map((line) => `${formatLogTime(line.t)} ${line.level.padEnd(5)} ${line.text}`).join("\n");
}

/** the per-level census of a stream (the one glance summary). */
export function logCensus(lines: readonly LogLine[]): Readonly<Record<LogLevel, number>> {
  const census: Record<LogLevel, number> = { info: 0, warn: 0, error: 0 };
  for (const line of lines) census[line.level] += 1;
  return census;
}
