// # arranger.test — the composer of the katexis engine: every test watches
// the contract the DAW surfaces ride — the plan is deterministic (same
// prompt+seed, same take), the genre resolves from the matrix, the bpm stays
// inside the genre band, the chord timeline covers the bars, the clips sit
// on their roles without overlap, the desk carries a master and the
// validator answers empty for a sound plan.
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  planTake,
  RACK_LANES,
  resolveGenre,
  SECTION_PLAN,
  stepSecondsOf,
  TOTAL_BARS,
  takeId,
  validatePlan,
} from "../debonair/arranger.ts";
import { GENRES } from "../debonair/genrematrix.ts";
import { clipsOverlap, totalDuration } from "../debonair/timelinemodel.ts";

describe("arranger — planTake", () => {
  const plan = planTake({ prompt: "midnight techno, dark sub bass, hypnotic arp", seed: "demo-1" });

  it("is deterministic: same prompt and seed rebuild the exact take", () => {
    const again = planTake({ prompt: "midnight techno, dark sub bass, hypnotic arp", seed: "demo-1" });
    assert.deepEqual(JSON.parse(JSON.stringify(again)), JSON.parse(JSON.stringify(plan)));
  });

  it("carries the prompt name, the id and the seed back on the plan", () => {
    assert.equal(plan.name, "Midnight techno, dark sub");
    assert.equal(plan.seed, "demo-1");
    assert.equal(plan.id, takeId("demo-1", "midnight techno, dark sub bass, hypnotic arp"));
  });

  it("resolves the genre from the matrix and keeps the bpm inside its band", () => {
    const genre = GENRES.find((entry) => entry.id === plan.genreId);
    assert.ok(genre);
    assert.equal(plan.genreLabel, genre.label);
    assert.ok(plan.bpm >= genre.bpmin && plan.bpm <= genre.bpmax);
    assert.equal(plan.pattern, genre.pattern);
    assert.equal(plan.lufsTarget, genre.lufs);
  });

  it("honours a pinned genre over the prompt match", () => {
    const pinned = planTake({ prompt: "midnight techno", seed: "demo-1", genreId: "lofi" });
    assert.equal(pinned.genreId, "lofi");
  });

  it("covers the sixteen bars with chords, one per bar", () => {
    assert.equal(TOTAL_BARS, 16);
    assert.equal(plan.bars, 16);
    assert.equal(plan.chords.length, 16);
    for (const bar of plan.chords) assert.ok(bar.symbol.length > 0);
  });

  it("splits the sections over the section plan and sums back to the bars", () => {
    const sum = SECTION_PLAN.reduce((total, section) => total + section.bars, 0);
    assert.equal(sum, plan.bars);
    assert.equal(plan.sections.length, SECTION_PLAN.length);
  });

  it("places non-overlapping clips on the four roles", () => {
    const roles = new Set(plan.clips.map((clip) => clip.track));
    assert.deepEqual([...roles].sort(), ["bass", "drums", "keys", "lead"]);
    for (let left = 0; left < plan.clips.length; left++) {
      for (let right = left + 1; right < plan.clips.length; right++) {
        assert.equal(clipsOverlap(plan.clips[left], plan.clips[right]), false);
      }
    }
    assert.ok(totalDuration(plan.clips) <= plan.durationSeconds + 1e-6);
  });

  it("opens the desk with the four role strips plus the master", () => {
    const names = plan.strips.map((strip) => strip.name);
    assert.deepEqual(names, ["drums", "bass", "keys", "lead", "master"]);
    assert.ok(plan.strips.some((strip) => strip.master));
  });

  it("carries a sixteen-step grid with every rack lane and swing offsets", () => {
    assert.equal(plan.grid.steps, 16);
    for (const lane of RACK_LANES) assert.equal(plan.grid.lanes[lane].length, 16);
    assert.equal(plan.offsets.length, 16);
    assert.equal(stepSecondsOf(plan), 60 / plan.bpm / 4);
  });

  it("validates clean: the sound plan answers no problems", () => {
    assert.deepEqual(validatePlan(plan), []);
  });

  it("flags a broken plan (duration tampered)", () => {
    const broken = { ...plan, durationSeconds: 1 };
    assert.ok(validatePlan(broken).length > 0);
  });

  it("never fails for a short prompt (the fallback genre catches it)", () => {
    const tiny = planTake({ prompt: "go", seed: "s" });
    assert.ok(GENRES.some((genre) => genre.id === tiny.genreId));
    assert.deepEqual(validatePlan(tiny), []);
  });
});

describe("arranger — resolveGenre", () => {
  it("matches a prompt that names the genre", () => {
    assert.equal(resolveGenre("hard drill night")?.id, "drill");
  });

  it("pins the genre id when asked", () => {
    assert.equal(resolveGenre("anything", "ambient")?.id, "ambient");
  });

  it("falls back into the matrix for a prompt with no hit", () => {
    const genre = resolveGenre("qqzz wumpus");
    assert.ok(GENRES.some((entry) => entry.id === genre.id));
  });
});
