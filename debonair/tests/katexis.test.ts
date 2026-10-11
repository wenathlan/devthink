// # katexis.test — the pure helper contract of the katexis engine root,
// runnable with vitest:
//   pnpm vitest run tests/katexis.test.ts
// Every test watches the promises the helpers make: the tone maps stay
// total (every status answers a tone, every tone answers its class
// suffix), the mastering spec rides the documented loudness targets, the
// fader readout always spells one decimal with the dB unit, the track name
// keeps the first four words with the trailing punctuation trimmed, and
// the filter answers every row untouched on an empty query. The random
// draws only face their documented bounds (six-digit seed, 2:00-3:59).
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  deriveSeed,
  estimateDuration,
  filterTracks,
  formatDb,
  genreByLabel,
  MASTERING,
  PROMPT_MAX_LENGTH,
  statusTone,
  toneClass,
  type LibraryTrackRow,
} from "../katexis.ts";

describe("katexis tones", () => {
  it("maps every library status to a badge tone", () => {
    assert.equal(statusTone("ready"), "success");
    assert.equal(statusTone("rendering"), "warning");
    assert.equal(statusTone("draft"), "info");
  });
  it("answers the class suffix per tone and empty for the default", () => {
    assert.equal(toneClass("default"), "");
    assert.equal(toneClass("success"), " success");
    assert.equal(toneClass("error"), " error");
    assert.equal(toneClass("warning"), " warning");
    assert.equal(toneClass("info"), " info");
  });
});

describe("katexis spec", () => {
  it("pins the mastering targets the engine documents", () => {
    assert.equal(MASTERING.sampleRateHz, 48000);
    assert.equal(MASTERING.truePeakDbtp, -1);
    assert.equal(MASTERING.loudnessStandard, "BS.1770-4");
    assert.deepEqual(MASTERING.platformTargetsLufs, { spotify: -14, apple: -16, beatport: -9 });
    assert.equal(PROMPT_MAX_LENGTH, 280);
  });
});

describe("katexis helpers", () => {
  it("formats fader readouts with one decimal and the unit", () => {
    assert.equal(formatDb(-4), "-4.0 dB");
    assert.equal(formatDb(-12.25), "-12.3 dB");
    assert.equal(formatDb(0), "0.0 dB");
  });
  it("draws the seed inside the six-digit band", () => {
    for (let i = 0; i < 200; i++) {
      const seed = deriveSeed();
      assert.ok(seed >= 100000 && seed <= 999999);
      assert.equal(Number.isInteger(seed), true);
    }
  });
  it("keeps the estimate inside the 2:00-3:59 band", () => {
    for (let i = 0; i < 200; i++) {
      const estimate = estimateDuration();
      assert.match(estimate, /^[23]:\d{2}$/);
    }
  });
  it("builds the track name from the first four words, punctuation trimmed", () => {
    assert.equal(trackNameFromPrompt("  midnight   harbor run. longer tail "), "Midnight harbor run. longer");
    assert.equal(trackNameFromPrompt("deep, dark; brassy!"), "Deep, dark; brassy");
    assert.equal(trackNameFromPrompt("solo"), "Solo");
  });
  it("finds a genre by its exact label", () => {
    const genres = [{ id: "techno", label: "Techno" }, { id: "jazz", label: "Jazz" }];
    assert.deepEqual(genreByLabel(genres, "Jazz"), { id: "jazz", label: "Jazz" });
    assert.equal(genreByLabel(genres, "jazz"), undefined);
    assert.equal(genreByLabel(genres, "Ambient"), undefined);
  });
  it("filters rows over name, genre and status, empty query copies all", () => {
    const rows: LibraryTrackRow[] = [
      { name: "Midnight Harbor", genre: "Techno", status: "ready", duration: "2:40" },
      { name: "Brass Dusk", genre: "Jazz", status: "draft", duration: "3:05" },
    ];
    assert.equal(filterTracks(rows, "").length, 2);
    assert.deepEqual(filterTracks(rows, ""), rows);
    assert.equal(filterTracks(rows, "techno").length, 1);
    assert.equal(filterTracks(rows, "READY").length, 2);
    assert.equal(filterTracks(rows, "harbor")[0]?.name, "Midnight Harbor");
    assert.equal(filterTracks(rows, "nope").length, 0);
  });
});
