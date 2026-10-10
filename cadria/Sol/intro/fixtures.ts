/**
 * fixtures.ts — the built-in synthetic fixtures of the intro demo: three
 * short mono slices synthesized straight into Float32Array in code (the
 * tests/audiopipeline.test.ts fixture approach — no binary files, no
 * network, no storage), deterministic to the last sample: every oscillator
 * is pure math and the noise wall runs the shared imageproject mulberry32
 * lane. The demo feeds them to the real analyzePcm → render chain, so the
 * same fixture always answers the same report and the same artwork.
 */

import { rngFromSeed } from "../../imageproject.ts";

/** the id of a built-in demo fixture. */
export type DemoFixtureId = "glass" | "static" | "pulse";

/** one demo fixture: the synthesized slice plus the copy the chip shows. */
export type DemoFixture = {
  id: DemoFixtureId;
  name: string;
  detail: string;
  sampleRate: number;
  samples: Float32Array;
};

/** fixture sample rate (48 kHz keeps the groove clicks crisp). */
const SR = 48000;
/** every fixture runs ~3.2 s: safely above the pipeline's 1 s floor, quick to analyze. */
const SECONDS = 3.2;
/** one pass of sample count. */
const N = Math.round(SR * SECONDS);

/** hard-limits a sample into the [-1, 1] window (stacked voices may sum past it). */
function clamp1(value: number): number {
  return Math.max(-1, Math.min(1, value));
}

/**
 * glass — a sine pad: six pure partials on one a-major-ish stack with slow
 * per-partial shimmer and long attack/release. Reads as a warm tonal bed.
 */
function glass(): Float32Array {
  const out = new Float32Array(N);
  const partials: ReadonlyArray<readonly [number, number]> = [
    [110.0, 0.3],
    [164.81, 0.22],
    [220.0, 0.24],
    [277.18, 0.14],
    [329.63, 0.16],
    [110.7, 0.08],
  ];
  for (const [hz, gain] of partials) {
    const lfoHz = 0.11 + (hz % 7) * 0.03;
    for (let i = 0; i < N; i += 1) {
      const t = i / SR;
      const attack = Math.min(1, t / 1.0);
      const release = Math.min(1, (SECONDS - t) / 0.6);
      const shimmer = 0.78 + 0.22 * Math.sin(2 * Math.PI * lfoHz * t + hz);
      out[i] += gain * attack * release * shimmer * Math.sin(2 * Math.PI * hz * t);
    }
  }
  for (let i = 0; i < N; i += 1) out[i] = clamp1(out[i]);
  return out;
}

/**
 * static — a noise wall: seeded white noise through a gentle one-pole
 * lowpass, constant level. Atonal, dense, bright — the spectrum-only case.
 */
function staticWall(): Float32Array {
  const out = new Float32Array(N);
  const rng = rngFromSeed("cadria::demo::static");
  let lowpassed = 0;
  for (let i = 0; i < N; i += 1) {
    const raw = rng() * 2 - 1;
    lowpassed += 0.24 * (raw - lowpassed);
    out[i] = clamp1(0.55 * (0.42 * lowpassed + 0.58 * raw));
  }
  return out;
}

/**
 * pulse — a click groove: a 120 bpm kick spine with pitch-drop decay,
 * offbeat hats and two tonal blips, so the rhythm and tonality lanes both
 * have something honest to read.
 */
function pulse(): Float32Array {
  const out = new Float32Array(N);
  const add = (startMs: number, durMs: number, voice: (t: number) => number): void => {
    const start = Math.round((startMs / 1000) * SR);
    const length = Math.round((durMs / 1000) * SR);
    for (let i = 0; i < length && start + i < N; i += 1) out[start + i] += voice(i / SR);
  };
  const kicks = Math.floor(SECONDS * 2);
  for (let k = 0; k < kicks; k += 1) {
    const t0 = k * 500;
    add(t0, 160, (t) => 0.85 * Math.exp(-t * 34) * Math.sin(2 * Math.PI * (54 + 40 * Math.exp(-t * 26)) * t));
    add(
      t0 + 250,
      40,
      (t) => 0.16 * Math.exp(-t * 130) * (((k * 7919) % 97) / 97 - 0.5 + (Math.sin(t * 9000) > 0 ? 0.5 : -0.5)),
    );
    if (k % 2 === 0) add(t0, 300, (t) => 0.3 * Math.exp(-t * 9) * Math.sin(2 * Math.PI * (k === 0 ? 220 : 261.63) * t));
    if (k % 4 === 3) add(t0 + 380, 120, (t) => 0.3 * Math.exp(-t * 22) * Math.sin(2 * Math.PI * 587.33 * t));
  }
  for (let i = 0; i < N; i += 1) out[i] = clamp1(out[i]);
  return out;
}

/** builds the three fixtures in order (pure synthesis, ~2 MB total). */
function buildFixtures(): readonly DemoFixture[] {
  return [
    { id: "glass", name: "glass", detail: "sine pad", sampleRate: SR, samples: glass() },
    { id: "static", name: "static", detail: "noise wall", sampleRate: SR, samples: staticWall() },
    { id: "pulse", name: "pulse", detail: "click groove", sampleRate: SR, samples: pulse() },
  ];
}

/** the module cache — synthesis runs once per session, on first demand. */
let cache: readonly DemoFixture[] | null = null;

/**
 * demoFixtures — the three built-in fixtures of the demo strip (lazily
 * synthesized once, then returned as the same frozen list).
 *
 * @returns the fixture list in chip order.
 */
export function demoFixtures(): readonly DemoFixture[] {
  cache ??= buildFixtures();
  return cache;
}
