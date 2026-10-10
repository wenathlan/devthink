// # genrematrix.test — honest unit tests for the style dictionary (the
// fifteen entries, their bpm windows and loudness targets, the family,
// progression and scale references, the seeded bpm pick, the free-text
// genre match and the whole-matrix validation), runnable with the vitest
// runner:
//   pnpm test
// Every fixture is the matrix table itself — no randomness beyond the
// engine's mulberry32 driven by fixed seeds.
import { describe, expect, it } from "vitest";
import { PROGRESSION_IDS } from "../harmonyengine.ts";
import { GENRES, genreById, matchGenre, pickBpm, validateMatrix } from "../genrematrix.ts";
import { FAMILY_NAMES } from "../rhythmgrammar.ts";
import { SCALE_NAMES } from "../musictheory.ts";

describe("the matrix table", () => {
  it("holds the fifteen documented genres", () => {
    expect(GENRES.length).toBe(15);
  });

  it("carries unique lowercase ids", () => {
    const ids = GENRES.map((genre) => genre.id);
    expect(new Set(ids).size).toBe(15);
    for (const id of ids) {
      expect(id.length > 0).toBe(true);
      expect(id, `${id} stays lowercase`).toBe(id.toLowerCase());
      expect(/^[a-z][a-z0-9-]*$/.test(id), `${id} is a stable token`).toBe(true);
    }
  });

  it("references real rhythmgrammar families", () => {
    for (const genre of GENRES)
      expect(FAMILY_NAMES.includes(genre.pattern), `${genre.id} -> ${genre.pattern}`).toBe(true);
  });

  it("references real progression sets, known scales and a legal swing", () => {
    for (const genre of GENRES) {
      expect(PROGRESSION_IDS.includes(genre.progressions), `${genre.id} -> ${genre.progressions}`).toBe(true);
      expect(genre.scales.length > 0, `${genre.id} biases a scale`).toBe(true);
      for (const scale of genre.scales) expect(SCALE_NAMES.includes(scale), `${genre.id}: ${scale}`).toBe(true);
      expect(genre.swing >= 0.5 && genre.swing <= 0.75, `${genre.id} swing ${genre.swing}`).toBe(true);
    }
  });

  it("keeps every bpm window inside the 40-220 band with a default inside it", () => {
    for (const genre of GENRES) {
      expect(genre.bpmin < genre.bpmax, `${genre.id} window opens`).toBe(true);
      expect(genre.bpmin >= 40 && genre.bpmax <= 220, `${genre.id} window [${genre.bpmin}, ${genre.bpmax}]`).toBe(true);
      expect(genre.bpm >= genre.bpmin && genre.bpm <= genre.bpmax, `${genre.id} default bpm ${genre.bpm}`).toBe(true);
    }
  });

  it("masters inside the documented loudness band", () => {
    for (const genre of GENRES) {
      expect(Number.isFinite(genre.lufs), `${genre.id} lufs is a number`).toBe(true);
      expect(genre.lufs >= -16 && genre.lufs <= -6, `${genre.id} lufs ${genre.lufs}`).toBe(true);
    }
    expect(genreById("ambient")?.lufs).toBe(-16);
    expect(genreById("hyperpop")?.lufs).toBe(-7);
  });

  it("tags non-empty timbre hints on every genre", () => {
    for (const genre of GENRES) {
      expect(genre.timbre.length > 0, `${genre.id} carries timbre`).toBe(true);
      for (const tag of genre.timbre) expect(tag.length > 0, `${genre.id}: "${tag}"`).toBe(true);
    }
  });
});

describe("lookups", () => {
  it("answers genreById with the entry or nothing", () => {
    expect(genreById("trap")).toBe(GENRES[0]);
    expect(genreById("trap")?.label).toBe("Trap");
    expect(genreById("rude-trap")?.pattern).toBe("trap");
    expect(genreById("no-such-genre")).toBeUndefined();
  });
});

describe("seeded bpm pick", () => {
  it("replays the same bpm for the same seed, always inside the window", () => {
    for (const genre of GENRES) {
      expect(pickBpm(genre, "demo")).toBe(pickBpm(genre, "demo"));
      const bpm = pickBpm(genre, "seed-a");
      expect(Number.isInteger(bpm), `${genre.id} picks an integer`).toBe(true);
      expect(bpm >= genre.bpmin && bpm <= genre.bpmax, `${genre.id} bpm ${bpm}`).toBe(true);
    }
  });

  it("varies with the seed while staying inside the window", () => {
    const trap = GENRES[0];
    const picks = new Set(["one", "two", "three", "four", "five"].map((seed) => pickBpm(trap, seed)));
    expect(picks.size > 1, "different seeds move the pick").toBe(true);
    for (const bpm of picks) expect(bpm >= trap.bpmin && bpm <= trap.bpmax).toBe(true);
  });
});

describe("free-text match", () => {
  it("matches by label, alias and timbre tags", () => {
    expect(matchGenre("Trap")?.id).toBe("trap");
    expect(matchGenre("Drum & Bass")?.id).toBe("dnb");
    expect(matchGenre("lo-fi")?.id).toBe("lofi");
    expect(matchGenre("808 sub")?.id).toBe("trap");
  });

  it("scores free text and answers nothing on a miss", () => {
    expect(matchGenre("make me a drill beat")?.id).toBe("drill");
    expect(matchGenre("hyperpop glitch")?.id).toBe("hyperpop");
    expect(matchGenre("zzz qqq wibble")).toBeUndefined();
    expect(matchGenre("")).toBeUndefined();
  });
});

describe("matrix validation", () => {
  it("clears the matrix against the sibling tables", () => {
    expect(validateMatrix()).toEqual([]);
  });
});
