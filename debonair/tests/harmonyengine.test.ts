// # harmonyengine.test — honest unit tests for the progression grammar
// (progression sets, seeded generator, tension curve, cadence detection,
// reharmonisation passes), runnable with the vitest runner:
//   pnpm test
// The only randomness is the engine's own mulberry32 driven by fixed seeds.
import { describe, expect, it } from "vitest";
import {
  type Chord,
  type Key,
  PROGRESSION_IDS,
  PROGRESSION_SETS,
  detectCadence,
  generateProgression,
  hashSeed,
  mulberry32,
  pickProgression,
  reharmonizeDiatonic,
  reharmonizeRelative,
  tensionOf,
} from "../harmonyengine.ts";
import { chordSymbol, parseChord, parseRoman, scalePcs } from "../musictheory.ts";

const C = { tonic: 0, mode: "major" } as const;
const Am = { tonic: 9, mode: "aeolian" } as const;
const chord = (token: string): Chord => parseChord(token)!;

describe("seeded randomness", () => {
  it("folds a seed string into one uint32, deterministically", () => {
    expect(hashSeed("42")).toBe(hashSeed("42"));
    expect(hashSeed("42")).not.toBe(hashSeed("43"));
    expect(hashSeed(""), "the FNV offset basis").toBe(0x811c9dc5);
    expect(Number.isInteger(hashSeed("katexis")) && hashSeed("katexis") >= 0).toBe(true);
  });

  it("runs the same mulberry32 sequence for the same seed", () => {
    const a = mulberry32(hashSeed("seed"));
    const b = mulberry32(hashSeed("seed"));
    const c = mulberry32(hashSeed("other"));
    const first = [a(), a(), a()];
    expect(first).toEqual([b(), b(), b()]);
    expect(first.every((v) => v >= 0 && v < 1)).toBe(true);
    expect(first).not.toEqual([c(), c(), c()]);
  });
});

describe("progression sets", () => {
  it("documents the nine style families", () => {
    expect([...PROGRESSION_IDS].sort()).toEqual(
      ["ambient", "dnb", "drill", "house", "jazz", "lofi", "pop", "techno", "trap"].sort(),
    );
    for (const id of PROGRESSION_IDS) {
      const spec = PROGRESSION_SETS[id];
      expect(spec.mode === "major" || spec.mode === "minor", `${id} names a mode`).toBe(true);
      expect(spec.loops.length >= 2, `${id} carries loops`).toBe(true);
      expect(spec.moods.length >= 2, `${id} carries moods`).toBe(true);
    }
  });

  it("parses every numeral of every loop in the set's home mode", () => {
    for (const id of PROGRESSION_IDS) {
      const spec = PROGRESSION_SETS[id];
      const key: Key = spec.mode === "major" ? { tonic: 0, mode: "major" } : { tonic: 9, mode: "aeolian" };
      for (const loop of spec.loops) {
        for (const token of loop.split("-")) {
          const parsed = parseRoman(token, key);
          expect(parsed, `${id}: ${token} parses`).toBeTruthy();
          if (!/^[b#]/.test(token))
            expect(scalePcs(key).includes(parsed!.root), `${id}: ${token} roots inside the scale`).toBe(true);
        }
      }
    }
  });
});

describe("progression generator", () => {
  it("plays the same chords for the same seed, key and mood", () => {
    const a = generateProgression({ seed: "demo", key: C, mood: "bright radio", bars: 8 });
    const b = generateProgression({ seed: "demo", key: C, mood: "bright radio", bars: 8 });
    expect(a).toEqual(b);
    expect(a.map((e) => e.symbol), "the pop set cycles I-V-vi-IV").toEqual(["C", "G", "Am", "F", "C", "G", "Am", "F"]);
  });

  it("varies with the seed and honours the bar count", () => {
    const symbols = (seed: string) => generateProgression({ seed, key: C, mood: "bright", bars: 4 }).map((e) => e.symbol);
    const variants = new Set(["one", "two", "three", "four"].map(symbols));
    expect(variants.size > 1, "different seeds move the pick").toBe(true);
    const nine = generateProgression({ seed: "demo", key: C, mood: "bright", bars: 9 });
    expect(nine.length).toBe(9);
    expect(nine.map((e) => e.bar)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    expect(nine[8].symbol, "the loop wraps onto the ninth bar").toBe(nine[0].symbol);
  });

  it("routes moods to the documented sets", () => {
    const trapKey = pickProgression(Am, "dark hard 808 night", mulberry32(1));
    expect(PROGRESSION_IDS.find((id) => PROGRESSION_SETS[id] === trapKey)).toBe("trap");
    const lofiKey = pickProgression(C, "chill study tape", mulberry32(1));
    expect(PROGRESSION_IDS.find((id) => PROGRESSION_SETS[id] === lofiKey)).toBe("lofi");
    const fallback = pickProgression(Am, "", mulberry32(1));
    expect(fallback.mode, "a minor key with no mood still lands on a minor-mode set").toBe("minor");
  });

  it("keeps every tension inside the unit band", () => {
    for (const seed of ["a", "b", "c", "d"]) {
      const events = generateProgression({ seed, key: Am, mood: "dark", bars: 8 });
      for (const event of events) {
        expect(Number.isFinite(event.tension)).toBe(true);
        expect(event.tension >= 0 && event.tension <= 1, `tension ${event.tension}`).toBe(true);
      }
    }
  });
});

describe("tension curve", () => {
  it("weights the functional degrees and quality extensions", () => {
    expect(tensionOf(chord("C"), C), "the tonic rests").toBeLessThan(0.2);
    expect(tensionOf(chord("G7"), C), "the dominant pulls").toBeGreaterThan(tensionOf(chord("C"), C));
    expect(tensionOf(chord("G7"), C), "the seventh bites").toBeGreaterThan(tensionOf(chord("G"), C));
    expect(tensionOf(chord("Bdim7"), C), "alterations never relax the degree").toBeGreaterThanOrEqual(tensionOf(chord("Bdim"), C));
    expect(tensionOf(chord("Cmaj7"), C), "maj7 softens").toBeLessThan(tensionOf(chord("C"), C) + 1e-9);
    expect(tensionOf(chord("Db7"), C), "a chromatic root sits at 0.7 plus the seventh").toBeCloseTo(0.75, 9);
    expect(tensionOf(chord("G7"), Am), "the same chord weighs by its degree in the key: VII in minor, V in major").toBeGreaterThan(tensionOf(chord("G7"), C));
  });
});

describe("cadence detection", () => {
  it("answers the documented table", () => {
    expect(detectCadence([chord("G7"), chord("C")], C)).toBe("perfect");
    expect(detectCadence([chord("G"), chord("C")], C)).toBe("authentic");
    expect(detectCadence([chord("F"), chord("C")], C)).toBe("plagal");
    expect(detectCadence([chord("Dm"), chord("G")], C)).toBe("half");
    expect(detectCadence([chord("G"), chord("Am")], C)).toBe("deceptive");
    expect(detectCadence([chord("Dm"), chord("E")], Am), "iv -> V in a minor key").toBe("phrygian");
    expect(detectCadence([chord("C"), chord("Dm"), chord("G")], C), "only the last pair counts").toBe("half");
  });

  it("answers none for short, chromatic or non-cadential pairs", () => {
    expect(detectCadence([chord("C")], C)).toBe("none");
    expect(detectCadence([chord("Db"), chord("C")], C), "chromatic roots stay silent").toBe("none");
    expect(detectCadence([chord("C"), chord("Dm")], C)).toBe("none");
    expect(detectCadence([chord("Dm"), chord("G"), chord("Am")], Am), "vii-less minor pairs").toBe("none");
  });
});

describe("reharmonisation passes", () => {
  it("substitutes along the documented third relations, seeded", () => {
    const base = [chord("C"), chord("Dm"), chord("G"), chord("F"), chord("Db7")];
    expect(
      reharmonizeDiatonic(base, C, mulberry32(7), 0).map(chordSymbol),
      "probability 0 keeps everything",
    ).toEqual(["C", "Dm", "G", "F", "C#7"]);
    const all = reharmonizeDiatonic(base, C, mulberry32(1), 1).map(chordSymbol);
    expect(all, "probability 1 swaps every diatonic partner, chromatic roots stay").toEqual(["Am", "F", "Em", "Dm", "C#7"]);
    const once = reharmonizeDiatonic(base, C, mulberry32(11), 0.5);
    const again = reharmonizeDiatonic(base, C, mulberry32(11), 0.5);
    expect(once, "the same rng seed replays the same pass").toEqual(again);
  });

  it("swaps a major key to its relative minor, notes untouched", () => {
    const loop = [chord("C"), chord("G"), chord("Am"), chord("F")];
    const swap = reharmonizeRelative(loop, C);
    expect(swap.key).toEqual({ tonic: 9, mode: "aeolian" });
    expect(swap.numerals).toEqual(["III", "VII", "i", "VI"]);
    for (let i = 0; i < loop.length; i++) {
      const back = parseRoman(swap.numerals[i]!, swap.key)!;
      expect(chordSymbol(back), "every chord keeps its notes").toBe(chordSymbol(loop[i]));
    }
  });

  it("swaps a minor key back to its relative major", () => {
    const swap = reharmonizeRelative([chord("Am"), chord("F")], Am);
    expect(swap.key).toEqual({ tonic: 0, mode: "major" });
    expect(swap.numerals).toEqual(["vi", "IV"]);
  });
});
