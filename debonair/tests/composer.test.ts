// # composer.test — the prompt-to-plan brain of the generation lane: every
// test watches the laws the composer answers — the prompt spec (the three
// genre lanes, the pt/en keyword tolerance, the explicit pins, the seeded
// default), the profile laws (the onset-curve drum mapping with the
// percussive corpus answering denser lanes than the quiet and harmonic
// ones, the bass locked to the kick, every note diatonic to the chosen
// scale walking the theory tables, the validators ok before every return),
// the similarity law (the plain prompt clears the documented floor against
// the profile centroid, a contradictory prompt drops the cosine honestly
// and the wholesale contradiction breaks the floor with the report saying
// so), the determinism (the same prompt, profile and salt answer identical
// serializePattern bytes, a fresh salt answers fresh bytes), the reference
// ranking (the near reference ranks first, the miner's tie law) and the
// typed error codes. runnable with vitest:
//   pnpm vitest run tests/composer.test.ts
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import type { AudioReport } from "../analyze.ts";
import {
  COMPOSER_ERROR_CODES,
  ComposerError,
  composeFromProfile,
  composeSimilar,
  compositionSimilarity,
  DEFAULT_BARS,
  parseComposerPrompt,
  SIMILARITY_FLOOR,
} from "../composer.ts";
import { GENRES } from "../genrematrix.ts";
import type { IngestDocument, IngestSegment } from "../ingest.ts";
import { SCALE_STEPS } from "../musictheory.ts";
import {
  EMBEDDING_DIM,
  LANE_STEPS,
  PATTERN_LIMITS,
  PATTERN_SCALES,
  PATTERN_VOICES,
  serializePattern,
  validatePatternProject,
} from "../patternenums.ts";
import { type GenreProfile, type IngestDocumentWithId, segmentVector } from "../patternminer.ts";

// ---------------------------------------------------------------------------
// the fixtures (the honest corpora: the values the analyzed references answer)
// ---------------------------------------------------------------------------

/** A chroma fixture topped by the given pitch classes (the loop vocabulary
 * of a corpus — the tonic dominant, the chord roots elevated). */
function chromaOf(top: Record<number, number>, fill = 0.02): number[] {
  const chroma = new Array<number>(12).fill(fill);
  for (const [key, value] of Object.entries(top)) chroma[Number(key)] = value;
  return chroma;
}

/** The tonal mass of the trap corpus: the A tonic dominant, the VI/VII
 * chord roots (F, G) elevated, the minor vocabulary spread. */
const TRAP_CHROMA = chromaOf({ 9: 0.32, 5: 0.15, 7: 0.15, 0: 0.1, 4: 0.08, 2: 0.07, 11: 0.05 });

/** The tonal mass of the ambient corpus: the C tonic dominant, the I-IV-V
 * vocabulary spread. */
const AMBIENT_CHROMA = chromaOf({ 0: 0.32, 7: 0.15, 5: 0.12, 4: 0.09, 2: 0.08, 9: 0.07, 11: 0.05 }, 0.03);

/** The centroid through the miner's own normalization law (the same seats,
 * the same clamps — the profile's center is the mean of its references). */
function centroidOf(patch: {
  rms: number;
  peak: number;
  zcr: number;
  cent: number;
  flat: number;
  beat: number;
  onsets: number;
  bands: [number, number, number];
  chroma: number[];
}): number[] {
  return segmentVector({
    s: 0,
    rms: patch.rms,
    peak: patch.peak,
    zcr: patch.zcr,
    cent: patch.cent,
    flat: patch.flat,
    beat: patch.beat,
    onsets: patch.onsets,
    bands: patch.bands,
    note: "",
    chroma: patch.chroma,
  });
}

/** The percussive trap corpus profile: a busy onset curve (the quarter grid
 * peaks), the low band dominant, 140 bpm references in A minor, mastered
 * to -9. */
function percussiveProfile(): GenreProfile {
  return {
    schema: "debonair.profile/1",
    genre: "trap",
    referenceIds: ["ref-p1", "ref-p2"],
    trainedOn: 2,
    bpm: { min: 138, median: 140, max: 144, histogram: [0, 0, 0, 0, 2, 0, 0, 0] },
    keyPool: [{ name: "A minor", weight: 0.75 }],
    onsetDensity: [1, 0.3, 0.55, 0.3, 1, 0.3, 0.55, 0.3, 1, 0.3, 0.55, 0.3, 1, 0.3, 0.55, 0.3],
    bandBalance: { low: 0.55, mid: 0.26, high: 0.19 },
    loudness: { target: -9, min: -9.5, max: -8.5 },
    centroid: centroidOf({
      rms: 0.28,
      peak: 0.9,
      zcr: 0.055,
      cent: 600,
      flat: 0.055,
      beat: 0.14,
      onsets: 2,
      bands: [0.55, 0.26, 0.19],
      chroma: TRAP_CHROMA,
    }),
    chromaProfile: TRAP_CHROMA,
    updatedAt: "2026-05-01T00:00:00.000Z",
  };
}

/** The quiet trap corpus profile: the same genre and tonal mass, the onset
 * curve quiet — the isolate the curve-mapping law reads (only the curve and
 * the density seats move). */
function quietProfile(): GenreProfile {
  return {
    ...percussiveProfile(),
    referenceIds: ["ref-q1", "ref-q2"],
    onsetDensity: [0.25, 0.05, 0.15, 0.05, 0.25, 0.05, 0.15, 0.05, 0.25, 0.05, 0.15, 0.05, 0.25, 0.05, 0.15, 0.05],
    bandBalance: { low: 0.42, mid: 0.34, high: 0.24 },
    centroid: centroidOf({
      rms: 0.21,
      peak: 0.75,
      zcr: 0.028,
      cent: 550,
      flat: 0.06,
      beat: 0.07,
      onsets: 0.9,
      bands: [0.42, 0.34, 0.24],
      chroma: TRAP_CHROMA,
    }),
  };
}

/** The high-band trap corpus profile: the same percussion, the high band
 * dominant — the voice-tilt isolate (the bright fold answers the lead). */
function highProfile(): GenreProfile {
  const base = percussiveProfile();
  return {
    ...base,
    referenceIds: ["ref-t1", "ref-t2"],
    bandBalance: { low: 0.15, mid: 0.3, high: 0.55 },
    centroid: centroidOf({
      rms: 0.28,
      peak: 0.9,
      zcr: 0.07,
      cent: 900,
      flat: 0.055,
      beat: 0.14,
      onsets: 2,
      bands: [0.15, 0.3, 0.55],
      chroma: TRAP_CHROMA,
    }),
  };
}

/** The harmonic ambient corpus profile: a slow curve, the mid band dominant,
 * 70 bpm references in C major, sitting at -16. */
function harmonicProfile(): GenreProfile {
  return {
    schema: "debonair.profile/1",
    genre: "ambient",
    referenceIds: ["ref-h1", "ref-h2"],
    trainedOn: 2,
    bpm: { min: 66, median: 70, max: 76, histogram: [2, 0, 0, 0, 0, 0, 0, 0] },
    keyPool: [{ name: "C major", weight: 0.75 }],
    onsetDensity: [0.35, 0.15, 0.35, 0.15, 0.35, 0.15, 0.35, 0.15, 0.35, 0.15, 0.35, 0.15, 0.35, 0.15, 0.35, 0.15],
    bandBalance: { low: 0.22, mid: 0.62, high: 0.16 },
    loudness: { target: -16, min: -17, max: -15 },
    centroid: centroidOf({
      rms: 0.19,
      peak: 0.5,
      zcr: 0.006,
      cent: 1200,
      flat: 0.05,
      beat: 0.08,
      onsets: 0.35,
      bands: [0.22, 0.62, 0.16],
      chroma: AMBIENT_CHROMA,
    }),
    chromaProfile: AMBIENT_CHROMA,
    updatedAt: "2026-05-02T00:00:00.000Z",
  };
}

/** The profile with one or more dotted paths replaced or removed. */
function withProfile(profile: GenreProfile, patches: readonly (readonly [string, unknown])[]): Record<string, unknown> {
  const root = JSON.parse(JSON.stringify(profile)) as Record<string, unknown>;
  for (const [path, value] of patches) {
    const keys = path.split(".");
    let cursor = root;
    for (const key of keys.slice(0, -1)) cursor = (cursor[key] ?? {}) as Record<string, unknown>;
    const last = keys[keys.length - 1] as string;
    if (value === undefined) delete cursor[last];
    else cursor[last] = value;
  }
  return root;
}

/** A synthetic reference document: the mix report carries the corpus
 * scalars, the segments carry the per-second vectors (the fields the
 * ranking reads). */
function referenceOf(
  id: string,
  patch: {
    bpm: number;
    tonic: number;
    mode: "major" | "minor";
    integrated: number;
    segment: Partial<IngestSegment>;
  },
): IngestDocumentWithId {
  const segments: IngestSegment[] = [];
  for (let s = 0; s < 16; s++) {
    segments.push({
      rms: 0.2,
      peak: 0.5,
      zcr: 0.02,
      cent: 1000,
      flat: 0.1,
      beat: 0.05,
      onsets: 1,
      bands: [0.34, 0.33, 0.33],
      note: "",
      chroma: new Array<number>(12).fill(0),
      ...patch.segment,
      s,
    });
  }
  const report: AudioReport = {
    sampleRate: 8000,
    durationSeconds: 0,
    rhythm: { bpm: patch.bpm, onsetStrength: 0 },
    key: { tonic: patch.tonic, tonicName: "", mode: patch.mode },
    loudness: { integrated: patch.integrated },
    spectrum: { bands: [0, 0, 0, 0, 0, 0, 0], centroidHz: 0 },
    structure: [],
    fingerprintHashes: 0,
  };
  const doc: IngestDocument = {
    schema: "debonair.ingest/1",
    name: `reference ${id}`,
    ingestedAt: "2026-05-01T00:00:00.000Z",
    sampleRate: 8000,
    durationSeconds: segments.length,
    mix: report,
    segments,
    pcmhash: 0,
    stems: [],
  };
  return { ...doc, id };
}

/** A reference shaped like the percussive corpus (the same per-second
 * values the profile centers on — the profile is the mean of its
 * references). */
function trapReference(id: string): IngestDocumentWithId {
  return referenceOf(id, {
    bpm: 140,
    tonic: 9,
    mode: "minor",
    integrated: -9,
    segment: {
      rms: 0.28,
      peak: 0.9,
      zcr: 0.055,
      cent: 600,
      flat: 0.055,
      beat: 0.14,
      onsets: 2,
      bands: [0.55, 0.26, 0.19],
      chroma: TRAP_CHROMA,
    },
  });
}

/** A reference shaped like the harmonic corpus. */
function ambientReference(id: string): IngestDocumentWithId {
  return referenceOf(id, {
    bpm: 70,
    tonic: 0,
    mode: "major",
    integrated: -16,
    segment: {
      rms: 0.19,
      peak: 0.5,
      zcr: 0.006,
      cent: 1200,
      flat: 0.05,
      beat: 0.08,
      onsets: 0.35,
      bands: [0.22, 0.62, 0.16],
      chroma: AMBIENT_CHROMA,
    },
  });
}

/** The total hits of a plan's four lanes. */
function totalHits(plan: { drums: { kick: number[]; snare: number[]; hat: number[]; clap: number[] } }): number {
  return (
    plan.drums.kick.reduce((a, b) => a + b, 0) +
    plan.drums.snare.reduce((a, b) => a + b, 0) +
    plan.drums.hat.reduce((a, b) => a + b, 0) +
    plan.drums.clap.reduce((a, b) => a + b, 0)
  );
}

/** The mean over a fixed salt list — the deterministic density read. */
function meanOverSalts(
  lanes: (plan: { drums: { kick: number[]; snare: number[]; hat: number[]; clap: number[] } }) => number,
  prompt: string,
  profile: GenreProfile,
  salts: readonly string[],
): number {
  let sum = 0;
  for (const salt of salts) sum += lanes(composeFromProfile(prompt, profile, salt));
  return sum / salts.length;
}

/** The scale's pitch classes, counted from the root. */
function scalePcsOf(root: number, scale: string): Set<number> {
  return new Set(
    (PATTERN_SCALES[scale as keyof typeof PATTERN_SCALES] ?? []).map((iv) => (((root + iv) % 12) + 12) % 12),
  );
}

// ---------------------------------------------------------------------------
// the prompt spec
// ---------------------------------------------------------------------------

describe("the prompt spec — the genre lanes", () => {
  it("answers each genre keyword with its genre (the pt/en tolerance)", () => {
    const lanes: readonly (readonly [string, string])[] = [
      ["dark trap beat", "trap"],
      ["uk drill slide", "drill"],
      ["lofi chill study tape", "lofi"],
      ["house groove club", "house"],
      ["melodic techno warehouse", "techno"],
      ["drum and bass liquid", "dnb"],
      ["hip hop boom bap", "hiphop"],
      ["r&b soul slow", "rnb"],
      ["hyperpop glitch", "hyperpop"],
      ["edm festival drop", "edm"],
      ["pop radio bright", "pop"],
      ["afrobeats log drum", "afrobeats"],
      ["jazz rhodes swing", "jazz"],
      ["ambien etereo sonho", "ambient"],
      ["rude trap metal hats", "rude-trap"],
    ];
    for (const [prompt, genre] of lanes) {
      assert.equal(parseComposerPrompt(prompt).genre, genre, `the prompt "${prompt}" must answer ${genre}`);
      assert.equal(parseComposerPrompt(prompt).genreExplicit, true);
    }
  });

  it("folds the reference's style keywords onto the matrix keys", () => {
    assert.equal(parseComposerPrompt("phonk cowbell memphis").genre, "rude-trap");
    assert.equal(parseComposerPrompt("synthwave night drive").genre, "pop");
    assert.equal(parseComposerPrompt("boom bap dusty vinyl").genre, "hiphop");
  });

  it("keeps the explicit genre words over the timbre match (the discipline)", () => {
    // "slow" alone would tie r&b into ambient's slow-shimmer through the
    // timbre tags — the explicit words run first
    assert.equal(parseComposerPrompt("r&b soul slow").genre, "rnb");
    assert.equal(parseComposerPrompt("r&b soul slow").root, null);
    // the word count picks rude-trap (two words) over trap (one)
    assert.equal(parseComposerPrompt("rude trap night").genre, "rude-trap");
    assert.equal(parseComposerPrompt("dark trap night").genre, "trap");
  });

  it("answers the seeded default for a prompt with no hit — deterministic", () => {
    const once = parseComposerPrompt("qqzz wumpus");
    assert.deepEqual(parseComposerPrompt("qqzz wumpus"), once);
    assert.ok(GENRES.some((genre) => genre.id === once.genre));
    assert.equal(once.genreExplicit, false);
    assert.equal(once.bpm, null);
    assert.equal(once.root, null);
    assert.equal(once.scale, null);
    assert.equal(once.bars, DEFAULT_BARS);
    assert.equal(once.seed, "qqzz wumpus");
  });
});

describe("the prompt spec — the pins", () => {
  it("reads the explicit bpm (the pt spelling included) and clamps to the contract band", () => {
    assert.equal(parseComposerPrompt("trap 90 bpm").bpm, 90);
    assert.equal(parseComposerPrompt("trap 140 batidas").bpm, 140);
    assert.equal(parseComposerPrompt("trap 300 bpm").bpm, PATTERN_LIMITS.bpmMax);
    assert.equal(parseComposerPrompt("trap 10 bpm").bpm, PATTERN_LIMITS.bpmMin);
    assert.equal(parseComposerPrompt("trap 140").bpm, null);
  });

  it("reads the lone note name with the accidental (the reference's law)", () => {
    assert.equal(parseComposerPrompt("dark trap in d").root, 2);
    assert.equal(parseComposerPrompt("dark trap in f#").root, 6);
    assert.equal(parseComposerPrompt("dark trap in eb").root, 3);
    assert.equal(parseComposerPrompt("dark trap, hard 808 night").root, null);
  });

  it("reads the scale word onto the forty-eight (the substring guard included)", () => {
    assert.equal(parseComposerPrompt("dorian trap").scale, "dorian");
    assert.equal(parseComposerPrompt("mixolydian pop").scale, "mixolydian");
    assert.equal(parseComposerPrompt("harmonic minor trap").scale, "harmonic-minor");
    assert.equal(parseComposerPrompt("hijaz phonk").scale, "hijaz");
    assert.equal(parseComposerPrompt("dark minor trap").scale, "natural-minor");
    assert.equal(parseComposerPrompt("bright major pop").scale, "major");
    assert.equal(parseComposerPrompt("dark trap, hard 808 night").scale, null);
  });

  it("reads the bars pin and clamps to the contract band", () => {
    assert.equal(parseComposerPrompt("trap 8 bars").bars, 8);
    assert.equal(parseComposerPrompt("trap 8 compassos").bars, 8);
    assert.equal(parseComposerPrompt("trap 200 bars").bars, PATTERN_LIMITS.barsMax);
    assert.equal(parseComposerPrompt("trap").bars, DEFAULT_BARS);
  });

  it("moves the intensity with the hard and soft words (the seeded jitter bounded)", () => {
    const hard = parseComposerPrompt("hard aggressive drill night");
    const soft = parseComposerPrompt("soft calm chill drill");
    assert.ok(hard.intensity > soft.intensity);
    assert.ok(hard.intensity <= 1 && soft.intensity >= 0);
    assert.deepEqual(parseComposerPrompt("hard aggressive drill night"), hard);
  });
});

// ---------------------------------------------------------------------------
// the profile-driven plan
// ---------------------------------------------------------------------------

describe("the profile-driven plan — the laws", () => {
  const salts = ["s1", "s2", "s3", "s4", "s5", "s6"];

  it("answers a denser drum lane for a percussive corpus than a harmonic one", () => {
    const percussive = meanOverSalts(totalHits, "dark trap, hard 808 night", percussiveProfile(), salts);
    const harmonic = meanOverSalts(totalHits, "ambient dream, slow pads", harmonicProfile(), salts);
    assert.ok(
      percussive > harmonic + 5,
      `the percussive corpus must answer the denser grid (${percussive} vs ${harmonic})`,
    );
  });

  it("maps the onset curve onto the lanes (the busy curve pushes the hats and the kicks)", () => {
    const busyHats = meanOverSalts(
      (plan) => plan.drums.hat.reduce((a, b) => a + b, 0),
      "dark trap, hard 808 night",
      percussiveProfile(),
      salts,
    );
    const quietHats = meanOverSalts(
      (plan) => plan.drums.hat.reduce((a, b) => a + b, 0),
      "dark trap, hard 808 night",
      quietProfile(),
      salts,
    );
    const busyKicks = meanOverSalts(
      (plan) => plan.drums.kick.reduce((a, b) => a + b, 0),
      "dark trap, hard 808 night",
      percussiveProfile(),
      salts,
    );
    const quietKicks = meanOverSalts(
      (plan) => plan.drums.kick.reduce((a, b) => a + b, 0),
      "dark trap, hard 808 night",
      quietProfile(),
      salts,
    );
    assert.ok(busyHats > quietHats, `the busy curve must push the hat density (${busyHats} vs ${quietHats})`);
    assert.ok(busyKicks > quietKicks, `the curve's peaks must push the kick steps (${busyKicks} vs ${quietKicks})`);
  });

  it("locks the bass to the kick (every bass note sits on a kick step, in the chord root register)", () => {
    for (const [prompt, profile] of [
      ["dark trap, hard 808 night", percussiveProfile()],
      ["ambient dream, slow pads", harmonicProfile()],
    ] as const) {
      const plan = composeFromProfile(prompt, profile, "demo");
      const bass = plan.notes.filter((note) => note.voice === "bass");
      assert.ok(bass.length > 0);
      for (const note of bass) {
        assert.equal(
          plan.drums.kick[((note.step % LANE_STEPS) + LANE_STEPS) % LANE_STEPS],
          1,
          `the bass note at step ${note.step} must sit on a kick step`,
        );
        assert.ok(note.pitch >= 24 && note.pitch <= 47, "the bass lives in the basement register");
      }
    }
  });

  it("answers every note diatonic to the chosen scale (walking the theory tables)", () => {
    // the one-source-of-truth law first: the kernel seats reuse the kernel
    assert.equal(PATTERN_SCALES["natural-minor"], SCALE_STEPS["natural-minor"]);
    const lanes: readonly (readonly [string, GenreProfile])[] = [
      ["dark trap, hard 808 night", percussiveProfile()],
      ["ambient dream, slow pads", harmonicProfile()],
      ["hijaz phonk in d#", percussiveProfile()],
      ["dorian lofi chill", quietProfile()],
    ];
    for (const [prompt, profile] of lanes) {
      const plan = composeFromProfile(prompt, profile, "demo");
      const pcs = scalePcsOf(plan.root, plan.scale);
      assert.equal(pcs.size, (PATTERN_SCALES[plan.scale] ?? []).length);
      for (const note of plan.notes) {
        assert.ok(
          pcs.has(((Math.round(note.pitch) % 12) + 12) % 12),
          `the note ${note.pitch} (voice ${note.voice}) must be diatonic to ${plan.scale} on root ${plan.root}`,
        );
      }
    }
  });

  it("lets the prompt pins win over the profile and the profile drive the unpinned seats", () => {
    const pinned = composeFromProfile("dark trap 90 bpm in d, hijaz, 8 bars", percussiveProfile(), "demo");
    assert.equal(pinned.bpm, 90);
    assert.equal(pinned.root, 2);
    assert.equal(pinned.scale, "hijaz");
    assert.equal(pinned.bars, 8);
    // the profile lane: the pool top answers the root, the genre bias the
    // scale, the histogram the tempo inside the corpus band
    const plain = composeFromProfile("dark trap, hard 808 night", percussiveProfile(), "demo");
    assert.equal(plain.root, 9);
    assert.equal(plain.scale, "natural-minor");
    assert.ok(plain.bpm >= 138 && plain.bpm <= 144, `the sampled tempo must sit inside the corpus band (${plain.bpm})`);
    const ambient = composeFromProfile("ambient dream, slow pads", harmonicProfile(), "demo");
    assert.equal(ambient.root, 0);
    assert.equal(ambient.scale, "lydian");
  });

  it("tilts the lead voice with the band balance (the low-heavy warm fold, the high-heavy bright fold)", () => {
    const leadVoicesOf = (plan: { notes: { voice: string }[] }) => [
      ...new Set(plan.notes.filter((note) => note.voice !== "bass" && note.voice !== "pad").map((note) => note.voice)),
    ];
    const warm = composeFromProfile("dark trap, hard 808 night", percussiveProfile(), "demo");
    assert.deepEqual(leadVoicesOf(warm), ["keys"]);
    const bright = composeFromProfile("dark trap, hard 808 night", highProfile(), "demo");
    assert.deepEqual(leadVoicesOf(bright), ["lead"]);
    // every voice stays inside the contract vocabulary
    for (const note of warm.notes) assert.ok(PATTERN_VOICES.includes(note.voice as (typeof PATTERN_VOICES)[number]));
  });

  it("answers plans that pass the project validator on every lane", () => {
    const lanes: readonly (readonly [string, GenreProfile])[] = [
      ["dark trap, hard 808 night", percussiveProfile()],
      ["dark trap, hard 808 night", quietProfile()],
      ["ambient dream, slow pads", harmonicProfile()],
      ["hijaz phonk in d#", percussiveProfile()],
      ["dark trap 90 bpm in d, hijaz, 8 bars", percussiveProfile()],
    ];
    for (const [prompt, profile] of lanes) {
      const plan = composeFromProfile(prompt, profile, "demo");
      const result = validatePatternProject(plan);
      assert.equal(result.ok, true, `the plan for "${prompt}" must validate (${result.ok ? "" : result.message})`);
      assert.equal(result.ok ? result.doc.scale : "", plan.scale);
      assert.equal(result.ok ? result.doc.bars : 0, plan.bars);
    }
  });

  it("writes the honest thirty-two-dim embedding inside the reference clamp", () => {
    const plan = composeFromProfile("dark trap, hard 808 night", percussiveProfile(), "demo");
    assert.equal(plan.embedding.length, EMBEDDING_DIM);
    assert.ok(plan.embedding.some((seat) => seat > 0));
    for (const seat of plan.embedding) assert.ok(seat >= 0 && seat <= 1.5);
  });
});

// ---------------------------------------------------------------------------
// the similarity law
// ---------------------------------------------------------------------------

describe("the similarity law — the floor and the honest drops", () => {
  it("clears the documented floor for a plain prompt on every matched lane", () => {
    const lanes: readonly (readonly [string, GenreProfile])[] = [
      ["dark trap, hard 808 night", percussiveProfile()],
      ["dark trap, hard 808 night", quietProfile()],
      ["ambient dream, slow pads", harmonicProfile()],
    ];
    for (const [prompt, profile] of lanes) {
      const plan = composeFromProfile(prompt, profile, "demo");
      const similarity = compositionSimilarity(plan, profile);
      assert.ok(
        similarity >= SIMILARITY_FLOOR,
        `the plain prompt "${prompt}" must clear the floor (${similarity} < ${SIMILARITY_FLOOR})`,
      );
    }
  });

  it("drops the similarity honestly when the prompt pins a root away from the corpus", () => {
    const profile = percussiveProfile();
    const plain = composeFromProfile("dark trap, hard 808 night", profile, "demo");
    const pinned = composeFromProfile("dark trap in d#, hard 808 night", profile, "demo");
    const plainScore = compositionSimilarity(plain, profile);
    const pinnedScore = compositionSimilarity(pinned, profile);
    assert.ok(pinnedScore < plainScore, `the tritone pin must drop the cosine (${pinnedScore} vs ${plainScore})`);
    // the report says so: the forced list names the pin
    const report = composeSimilar("dark trap in d#, hard 808 night", profile, [], "demo");
    assert.deepEqual(report.forced, ["root"]);
    assert.equal(report.similarity, pinnedScore);
  });

  it("breaks the floor when the prompt forces the shape wholesale away — the report says so", () => {
    const profile = percussiveProfile();
    const report = composeSimilar("ambient dream in c, slow pads", profile, [trapReference("ref-1")], "demo");
    assert.ok(
      report.similarity < SIMILARITY_FLOOR,
      `the wholesale contradiction must break the floor (${report.similarity})`,
    );
    assert.equal(report.nearCentroid, false);
    assert.ok(report.forced.includes("genre"));
    assert.ok(report.forced.includes("root"));
    // the prompt wins: the plan answers the ambient genre the prompt named
    assert.equal(report.plan.bpm, 144);
    assert.equal(report.plan.root, 0);
  });
});

// ---------------------------------------------------------------------------
// the determinism
// ---------------------------------------------------------------------------

describe("the determinism — the same seat answers the same bytes", () => {
  const prompt = "dark trap, hard 808 night";
  const profile = percussiveProfile();

  it("answers byte-identical serializePattern output for the same prompt, profile and salt", () => {
    const once = serializePattern(composeFromProfile(prompt, profile, "demo"));
    const again = serializePattern(composeFromProfile(prompt, profile, "demo"));
    assert.equal(again, once);
    // the parsed spec and the similarity ride the same law
    assert.deepEqual(parseComposerPrompt(prompt), parseComposerPrompt(prompt));
    assert.equal(
      compositionSimilarity(composeFromProfile(prompt, profile, "demo"), profile),
      compositionSimilarity(composeFromProfile(prompt, profile, "demo"), profile),
    );
  });

  it("answers different bytes for a different salt (the fresh-take law)", () => {
    const once = serializePattern(composeFromProfile(prompt, profile, "demo"));
    const fresh = serializePattern(composeFromProfile(prompt, profile, "fresh"));
    assert.notEqual(fresh, once);
  });

  it("answers different plans for a different profile over the same prompt", () => {
    const percussive = serializePattern(composeFromProfile(prompt, percussiveProfile(), "demo"));
    const harmonic = serializePattern(composeFromProfile("ambient dream, slow pads", harmonicProfile(), "demo"));
    assert.notEqual(harmonic, percussive);
  });
});

// ---------------------------------------------------------------------------
// the reference ranking
// ---------------------------------------------------------------------------

describe("the reference ranking — the miner's similarity on the composed plan", () => {
  it("ranks the near reference first with the cross-corpus reference behind", () => {
    const profile = percussiveProfile();
    const references = [ambientReference("ref-ambient"), trapReference("ref-trap")];
    const report = composeSimilar("dark trap, hard 808 night", profile, references, "demo");
    assert.equal(report.hits.length, 2);
    assert.equal(report.hits[0]?.id, "ref-trap");
    const top = report.hits[0];
    const cross = report.hits[1];
    assert.ok(top && cross);
    assert.ok(
      top.score > cross.score + 0.1,
      `the near reference must outrank the cross one (${top.score} vs ${cross.score})`,
    );
    // the near reference's score rides the profile centroid seat
    assert.ok(top.score >= SIMILARITY_FLOOR);
    // the ranked plan is the same plan the profile lane composes
    assert.equal(
      serializePattern(report.plan),
      serializePattern(composeFromProfile("dark trap, hard 808 night", profile, "demo")),
    );
  });

  it("breaks score ties by id ascending (the miner's tie law)", () => {
    const profile = percussiveProfile();
    const references = [trapReference("ref-z"), trapReference("ref-a")];
    const report = composeSimilar("dark trap, hard 808 night", profile, references, "demo");
    assert.deepEqual(
      report.hits.map((hit) => hit.id),
      ["ref-a", "ref-z"],
    );
    assert.equal(report.hits[0]?.score, report.hits[1]?.score);
  });
});

// ---------------------------------------------------------------------------
// the typed errors
// ---------------------------------------------------------------------------

describe("the typed errors — the honest codes", () => {
  const prompt = "dark trap, hard 808 night";

  it("answers empty-profile for a profile no references fed", () => {
    const empty = withProfile(percussiveProfile(), [["trainedOn", 0]]) as unknown as GenreProfile;
    assert.throws(
      () => composeFromProfile(prompt, empty, "demo"),
      (error: unknown): boolean => error instanceof ComposerError && error.code === "empty-profile",
    );
    const noIds = withProfile(percussiveProfile(), [["referenceIds", []]]) as unknown as GenreProfile;
    assert.throws(
      () => composeFromProfile(prompt, noIds, "demo"),
      (error: unknown): boolean => error instanceof ComposerError && error.code === "empty-profile",
    );
  });

  it("answers no-profile for an absent or broken profile document", () => {
    assert.throws(
      () => composeFromProfile(prompt, null as unknown as GenreProfile, "demo"),
      (error: unknown): boolean => error instanceof ComposerError && error.code === "no-profile",
    );
    assert.throws(
      () => composeFromProfile(prompt, 42 as unknown as GenreProfile, "demo"),
      (error: unknown): boolean => error instanceof ComposerError && error.code === "no-profile",
    );
    const broken = withProfile(percussiveProfile(), [["bpm.histogram", [1, 2]]]) as unknown as GenreProfile;
    assert.throws(
      () => composeFromProfile(prompt, broken, "demo"),
      (error: unknown): boolean => error instanceof ComposerError && error.code === "no-profile",
    );
  });

  it("answers bad-genre for a profile keyed outside the fifteen", () => {
    const stranger = withProfile(percussiveProfile(), [["genre", "math-rock"]]) as unknown as GenreProfile;
    assert.throws(
      () => composeFromProfile(prompt, stranger, "demo"),
      (error: unknown): boolean => error instanceof ComposerError && error.code === "bad-genre",
    );
  });

  it("propagates the codes through composeSimilar and pins the codes table", () => {
    assert.deepEqual(COMPOSER_ERROR_CODES, ["no-profile", "bad-genre", "empty-profile", "invalid-plan"]);
    assert.throws(
      () => composeSimilar(prompt, null as unknown as GenreProfile, [], "demo"),
      (error: unknown): boolean => error instanceof ComposerError && error.code === "no-profile",
    );
  });
});
