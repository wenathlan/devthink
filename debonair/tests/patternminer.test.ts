// # patternminer.test — the pattern miner and the genre profile contract:
// the tables pin their sizes and shapes (the fifteen genre keys, the
// twenty-four key names, the twenty-two seats, the codes), the segment
// vector law clamps the way the reference embedding clamped, the miner
// answers separable profiles for two genres' synthetic sets (the bpm
// medians apart, the band balance apart), the determinism holds (the same
// set twice — and any permutation — answers identical serializeProfile
// bytes), the empty set answers the honest error, the similarity rank
// answers the query's nearest references with the tie law, the validators
// answer ok on the honest profile and every machine code on its broken
// one, the canonical serializer answers the same bytes whatever key order
// the input carries, and the genre_profiles row seat round trips on a temp
// sqlite with the json faithful. runnable with vitest:
//   pnpm vitest run tests/patternminer.test.ts
import assert from "node:assert/strict";
import Database from "better-sqlite3";
import { describe, it } from "vitest";
import type { AudioReport } from "../analyze.ts";
import { GENRES } from "../genrematrix.ts";
import type { IngestDocument, IngestSegment } from "../ingest.ts";
import { listGenreProfiles, migrategenreschema, saveGenreProfile } from "../ingestdb.ts";
import {
  BPM_BUCKETS,
  CHROMA_BINS,
  type GenreProfile,
  type IngestDocumentWithId,
  KEY_POOL_NAMES,
  mineGenre,
  ONSET_CURVE_BINS,
  PROFILE_ERROR_CODES,
  PROFILE_GENRE_KEYS,
  PROFILE_SCHEMA_VERSION,
  ProfileError,
  type ProfileErrorCode,
  SEGMENT_DIM,
  segmentVector,
  serializeProfile,
  similarityRank,
  validateGenreProfile,
} from "../patternminer.ts";

// ---------------------------------------------------------------------------
// the fixtures (the honest construction: the fields the miner reads)
// ---------------------------------------------------------------------------

/** A chroma fixture peaked on one pitch class: the tonic bin 0.55, the
 * other eleven 0.05 — the distributions sum 1.1, so the tonic's share
 * lands exactly 0.5 (the dyadic-friendly law the exact asserts ride). */
function chromaPeakedAt(pc: number): number[] {
  const chroma = new Array<number>(12).fill(0.05);
  chroma[pc] = 0.55;
  return chroma;
}

/** One synthetic segment: the patch overrides the fields the miner reads,
 * the defaults ride the mid-band territory. */
function segmentOf(s: number, patch: Partial<IngestSegment> = {}): IngestSegment {
  return {
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
    ...patch,
    s,
  };
}

/** One synthetic mix report: the patch carries the fields the miner reads
 * (bpm, key, loudness), the rest rides fixed zeros. */
function reportOf(patch: { bpm: number; tonic: number; mode: "major" | "minor"; integrated: number }): AudioReport {
  return {
    sampleRate: 8000,
    durationSeconds: 0,
    rhythm: { bpm: patch.bpm, onsetStrength: 0 },
    key: { tonic: patch.tonic, tonicName: "", mode: patch.mode },
    loudness: { integrated: patch.integrated },
    spectrum: { bands: [0, 0, 0, 0, 0, 0, 0], centroidHz: 0 },
    structure: [],
    fingerprintHashes: 0,
  };
}

/** The patch docOf reads: the report scalars, the per-second curve, the
 * length and the instant. */
interface DocPatch {
  bpm: number;
  tonic: number;
  mode: "major" | "minor";
  integrated: number;
  seconds?: number;
  segmentAt?: (s: number) => Partial<IngestSegment>;
  ingestedAt?: string;
}

/** One synthetic document: the mix report and the mix segments carry the
 * genre's numbers (the fields the miner reads), the stems ride empty (the
 * separation layer is not the profile's read). */
function docOf(id: string, patch: DocPatch): IngestDocumentWithId {
  const seconds = patch.seconds ?? 32;
  const segments: IngestSegment[] = [];
  for (let s = 0; s < seconds; s++) segments.push(segmentOf(s, patch.segmentAt?.(s) ?? {}));
  return {
    id,
    schema: "debonair.ingest/1",
    name: `synthetic ${id}`,
    ingestedAt: patch.ingestedAt ?? "2026-02-01T00:00:00.000Z",
    sampleRate: 8000,
    durationSeconds: seconds,
    mix: reportOf({ bpm: patch.bpm, tonic: patch.tonic, mode: patch.mode, integrated: patch.integrated }),
    segments,
    pcmhash: 0,
    stems: [],
  };
}

/** A percussive-heavy trap reference: fast onsets (a four-onset downbeat
 * inside a 4/4 cycle, single onsets between), the low band heavy, the
 * tonal mass on a (pc 9), 140 bpm, minor, mastered to -9 lufs. */
function trapRef(id: string, ingestedAt = "2026-02-01T00:00:00.000Z"): IngestDocumentWithId {
  return docOf(id, {
    bpm: 140,
    tonic: 9,
    mode: "minor",
    integrated: -9,
    seconds: 32,
    ingestedAt,
    segmentAt: (s) => ({
      rms: 0.3,
      peak: 0.9,
      zcr: 0.05,
      cent: 700,
      flat: 0.05,
      beat: 0.12,
      onsets: s % 4 === 0 ? 4 : 1,
      bands: [0.7, 0.2, 0.1],
      chroma: chromaPeakedAt(9),
    }),
  });
}

/** A harmonic ambient reference: slow curves (an onset a second), the mid
 * band heavy, the tonal mass on c (pc 0), 70 bpm, major, sitting at -16. */
function ambientRef(id: string, ingestedAt = "2026-04-01T00:00:00.000Z"): IngestDocumentWithId {
  return docOf(id, {
    bpm: 70,
    tonic: 0,
    mode: "major",
    integrated: -16,
    seconds: 32,
    ingestedAt,
    segmentAt: () => ({
      rms: 0.15,
      peak: 0.4,
      zcr: 0.005,
      cent: 1600,
      flat: 0.2,
      beat: 0.01,
      onsets: 1,
      bands: [0.2, 0.5, 0.3],
      chroma: chromaPeakedAt(0),
    }),
  });
}

/** The trap profile fixture: two references, the freshest march 2026. */
function trapProfile(): GenreProfile {
  return mineGenre([trapRef("r-1", "2026-02-01T00:00:00.000Z"), trapRef("r-2", "2026-03-01T00:00:00.000Z")], "trap");
}

/** The ambient profile fixture: two references, the freshest may 2026. */
function ambientProfile(): GenreProfile {
  return mineGenre(
    [ambientRef("r-8", "2026-04-01T00:00:00.000Z"), ambientRef("r-9", "2026-05-01T00:00:00.000Z")],
    "ambient",
  );
}

/** A deep-fresh profile fixture with one or more dotted paths replaced or
 * removed (undefined removes, the patternenums law). */
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

/** The machine code a broken profile answers (the test fails on an ok). */
function profileCodeOf(value: unknown): ProfileErrorCode {
  const result = validateGenreProfile(value);
  if (result.ok) throw new Error("the broken profile must not pass");
  return result.code;
}

// ---------------------------------------------------------------------------
// the tables and the vector law
// ---------------------------------------------------------------------------

describe("the contract tables", () => {
  it("pins the schema literal, the fifteen genre keys and the key vocabulary", () => {
    assert.equal(PROFILE_SCHEMA_VERSION, "debonair.profile/1");
    assert.equal(PROFILE_GENRE_KEYS.length, 15);
    assert.equal(new Set(PROFILE_GENRE_KEYS).size, 15);
    assert.deepEqual(
      PROFILE_GENRE_KEYS,
      GENRES.map((genre) => genre.id),
    );
    assert.equal(KEY_POOL_NAMES.length, 24);
    assert.ok(KEY_POOL_NAMES.includes("A minor"));
    assert.ok(KEY_POOL_NAMES.includes("C major"));
    assert.equal(KEY_POOL_NAMES.includes("H minor"), false);
  });

  it("pins the seat and bin counts and the error codes", () => {
    assert.equal(SEGMENT_DIM, 22);
    assert.equal(CHROMA_BINS, 12);
    assert.equal(ONSET_CURVE_BINS, 16);
    assert.equal(BPM_BUCKETS, 8);
    assert.equal(PROFILE_ERROR_CODES.length, 8);
    assert.equal(new Set(PROFILE_ERROR_CODES).size, 8);
  });

  it("answers the reference clamps on the segment vector law", () => {
    // the capped seats: every gain overshoots 1, the caps fold them back
    const capped = segmentVector(
      segmentOf(0, {
        rms: 1,
        peak: 2,
        zcr: 0.5,
        cent: 16000,
        flat: 0.9,
        beat: 0.5,
        onsets: 9,
        bands: [0.5, 0.3, 0.2],
        chroma: chromaPeakedAt(9),
      }),
    );
    assert.deepEqual(
      capped,
      [1, 1, 1, 1, 1, 1, 1, 0.5, 0.3, 0.2, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.55, 0.05, 0.05],
    );
    // the mid seats: the exact gains the reference layout clamps with
    const mid = segmentVector(
      segmentOf(1, {
        rms: 0.25,
        peak: 0.9,
        zcr: 0.0078125,
        cent: 1000,
        flat: 0.05,
        beat: 0.02,
        onsets: 2,
        bands: [0.7, 0.2, 0.1],
      }),
    );
    assert.equal(mid[0], 0.6); // rms 0.25 by 2.4
    assert.equal(mid[1], 0.9); // the peak in its natural band
    assert.equal(mid[2], 0.0625); // zcr by 8
    assert.equal(mid[3], 0.125); // cent 1000 over 8000
    assert.equal(mid[4], 0.1); // flat 0.05 by 2
    assert.equal(mid[5], 0.08); // beat 0.02 by 4
    assert.equal(mid[6], 0.5); // onsets 2 over 4
    assert.deepEqual(mid.slice(7), [0.7, 0.2, 0.1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  });
});

// ---------------------------------------------------------------------------
// the miner
// ---------------------------------------------------------------------------

describe("the miner", () => {
  it("answers separable profiles for two genres' synthetic sets", () => {
    const trap = trapProfile();
    const ambient = ambientProfile();
    // the identity and the audit chain
    assert.equal(trap.genre, "trap");
    assert.equal(trap.trainedOn, 2);
    assert.deepEqual(trap.referenceIds, ["r-1", "r-2"]);
    assert.equal(ambient.genre, "ambient");
    // the bpm medians apart, the histograms answer the buckets
    assert.equal(trap.bpm.min, 140);
    assert.equal(trap.bpm.median, 140);
    assert.equal(trap.bpm.max, 140);
    assert.deepEqual(trap.bpm.histogram, [0, 0, 0, 0, 2, 0, 0, 0]);
    assert.equal(ambient.bpm.median, 70);
    assert.deepEqual(ambient.bpm.histogram, [2, 0, 0, 0, 0, 0, 0, 0]);
    assert.ok(trap.bpm.median > ambient.bpm.median + 30);
    // the band balance apart
    assert.deepEqual(trap.bandBalance, { low: 0.7, mid: 0.2, high: 0.1 });
    assert.deepEqual(ambient.bandBalance, { low: 0.2, mid: 0.5, high: 0.3 });
    assert.ok(trap.bandBalance.low > ambient.bandBalance.low + 0.4);
    assert.ok(trap.bandBalance.high < ambient.bandBalance.high - 0.1);
    // the loudness targets apart
    assert.deepEqual(trap.loudness, { target: -9, min: -9, max: -9 });
    assert.deepEqual(ambient.loudness, { target: -16, min: -16, max: -16 });
    // the key pools answer their names, the weights blend the votes with
    // the tonic chroma mass (the share 1 and the mass 0.5, the even mean)
    assert.deepEqual(trap.keyPool, [{ name: "A minor", weight: 0.75 }]);
    assert.deepEqual(ambient.keyPool, [{ name: "C major", weight: 0.75 }]);
    // the chroma profile: the tonic bin reads the distribution mean
    assert.equal(trap.chromaProfile[9], 0.5);
    assert.equal(ambient.chromaProfile[0], 0.5);
    assert.ok(trap.chromaProfile.reduce((sum, bin) => sum + bin, 0) > 0.99);
    // the onset curves answer their shapes: the busiest second reads 1,
    // the sixteen-bin resample carries the 4/4 alternation
    assert.deepEqual(
      trap.onsetDensity,
      [0.625, 0.25, 0.625, 0.25, 0.625, 0.25, 0.625, 0.25, 0.625, 0.25, 0.625, 0.25, 0.625, 0.25, 0.625, 0.25],
    );
    assert.ok(ambient.onsetDensity.every((bin) => bin === 1));
    // the centroid: the mean normalized segment vector, the cosine seat
    assert.equal(trap.centroid.length, 22);
    assert.equal(trap.centroid[0], 0.72); // rms 0.3 by 2.4, the mean rounded
    assert.equal(trap.centroid[3], 0.0875); // cent 700 over 8000
    assert.equal(trap.centroid[6], 0.4375); // the onsets mean over the cycle
    // the audit stamp: the freshest reference instant
    assert.equal(trap.updatedAt, "2026-03-01T00:00:00.000Z");
  });

  it("answers byte-identical profiles for the same set — and any permutation", () => {
    const once = serializeProfile(trapProfile());
    assert.equal(serializeProfile(trapProfile()), once);
    const shuffled = serializeProfile(
      mineGenre([trapRef("r-2", "2026-03-01T00:00:00.000Z"), trapRef("r-1", "2026-02-01T00:00:00.000Z")], "trap"),
    );
    assert.equal(shuffled, once);
    // another genre over the same set answers different bytes
    const drill = serializeProfile(
      mineGenre([trapRef("r-1", "2026-02-01T00:00:00.000Z"), trapRef("r-2", "2026-03-01T00:00:00.000Z")], "drill"),
    );
    assert.notEqual(drill, once);
  });

  it("answers the honest errors — the empty set and the broken key", () => {
    assert.throws(
      () => mineGenre([], "trap"),
      (error: unknown): boolean => error instanceof ProfileError && error.code === "empty-set",
    );
    assert.throws(
      () => mineGenre([trapRef("r-1")], "math-rock"),
      (error: unknown): boolean => error instanceof ProfileError && error.code === "bad-genre",
    );
    // the genre check runs before the empty check
    assert.throws(
      () => mineGenre([], "math-rock"),
      (error: unknown): boolean => error instanceof ProfileError && error.code === "bad-genre",
    );
  });
});

// ---------------------------------------------------------------------------
// the similarity rank
// ---------------------------------------------------------------------------

describe("the similarity rank", () => {
  /** The shared reference set: two trap, two ambient, the ids out of order. */
  const references: IngestDocumentWithId[] = [ambientRef("r-9"), trapRef("r-2"), ambientRef("r-8"), trapRef("r-1")];

  it("answers the query's nearest references first — the top beats the cross-genre score", () => {
    const hits = similarityRank(trapRef("q-none"), references);
    assert.deepEqual(
      hits.map((hit) => hit.id),
      ["r-1", "r-2", "r-8", "r-9"],
    );
    const [top, second] = hits;
    assert.ok(top && second);
    assert.equal(top.id, "r-1");
    assert.equal(top.score, 1);
    assert.equal(second.id, "r-2");
    assert.equal(second.score, top.score);
    const cross = hits.find((hit) => hit.id === "r-8");
    assert.ok(cross);
    assert.ok(top.score > (cross?.score ?? 0) + 0.1);
  });

  it("breaks ties by id ascending — a zero query ranks pure id order", () => {
    const silent: IngestDocument = docOf("q-silent", {
      bpm: 120,
      tonic: 0,
      mode: "major",
      integrated: -10,
      seconds: 8,
      segmentAt: () => ({
        rms: 0,
        peak: 0,
        zcr: 0,
        cent: 0,
        flat: 0,
        beat: 0,
        onsets: 0,
        bands: [0, 0, 0],
        chroma: new Array<number>(12).fill(0),
      }),
    });
    const hits = similarityRank(silent, references);
    assert.deepEqual(
      hits.map((hit) => hit.id),
      ["r-1", "r-2", "r-8", "r-9"],
    );
    assert.ok(hits.every((hit) => hit.score === 0));
  });

  it("answers the same ranking twice — deterministic", () => {
    assert.deepEqual(similarityRank(trapRef("q-none"), references), similarityRank(trapRef("q-none"), references));
  });
});

// ---------------------------------------------------------------------------
// the profile validator
// ---------------------------------------------------------------------------

describe("the profile validator", () => {
  it("answers ok with the same document when it is honest", () => {
    const profile = trapProfile();
    const result = validateGenreProfile(profile);
    assert.equal(result.ok, true);
    if (result.ok) assert.deepEqual(result.doc, profile);
  });

  it("answers bad-schema on a foreign literal, a non-object or a missing schema", () => {
    assert.equal(profileCodeOf(withProfile(trapProfile(), [["schema", "debonair.profile/2"]])), "bad-schema");
    assert.equal(profileCodeOf(withProfile(trapProfile(), [["schema", undefined]])), "bad-schema");
    assert.equal(profileCodeOf(42), "bad-schema");
    assert.equal(profileCodeOf([1, 2]), "bad-schema");
  });

  it("answers bad-genre on a key outside the fifteen", () => {
    assert.equal(profileCodeOf(withProfile(trapProfile(), [["genre", "math-rock"]])), "bad-genre");
    assert.equal(profileCodeOf(withProfile(trapProfile(), [["genre", undefined]])), "bad-genre");
    assert.equal(profileCodeOf(withProfile(trapProfile(), [["genre", 7]])), "bad-genre");
  });

  it("answers bad-histogram on a short, non-numeric or NaN histogram", () => {
    assert.equal(profileCodeOf(withProfile(trapProfile(), [["bpm.histogram", [1, 2]]])), "bad-histogram");
    assert.equal(profileCodeOf(withProfile(trapProfile(), [["bpm.histogram", 42]])), "bad-histogram");
    const withNaN = trapProfile();
    withNaN.bpm.histogram[0] = Number.NaN;
    assert.equal(profileCodeOf(withNaN), "bad-histogram");
  });

  it("answers bad-keypool on a broken pool", () => {
    assert.equal(profileCodeOf(withProfile(trapProfile(), [["keyPool", 42]])), "bad-keypool");
    assert.equal(profileCodeOf(withProfile(trapProfile(), [["keyPool", ["nope"]]])), "bad-keypool");
    assert.equal(
      profileCodeOf(withProfile(trapProfile(), [["keyPool", [{ name: "H minor", weight: 0.5 }]]])),
      "bad-keypool",
    );
    assert.equal(profileCodeOf(withProfile(trapProfile(), [["keyPool", [{ name: "A minor" }]]])), "bad-keypool");
    assert.equal(
      profileCodeOf(withProfile(trapProfile(), [["keyPool", [{ name: "A minor", weight: "x" }]]])),
      "bad-keypool",
    );
  });

  it("answers bad-curve on a broken onset curve", () => {
    assert.equal(profileCodeOf(withProfile(trapProfile(), [["onsetDensity", [0.5]]])), "bad-curve");
    assert.equal(profileCodeOf(withProfile(trapProfile(), [["onsetDensity", 42]])), "bad-curve");
    const withNaN = trapProfile();
    withNaN.onsetDensity[7] = Number.NaN;
    assert.equal(profileCodeOf(withNaN), "bad-curve");
  });

  it("answers bad-bands on a broken band balance", () => {
    assert.equal(profileCodeOf(withProfile(trapProfile(), [["bandBalance", { low: 0.5 }]])), "bad-bands");
    assert.equal(profileCodeOf(withProfile(trapProfile(), [["bandBalance", 42]])), "bad-bands");
    assert.equal(
      profileCodeOf(withProfile(trapProfile(), [["bandBalance", { low: "x", mid: 0, high: 0 }]])),
      "bad-bands",
    );
  });

  it("answers bad-chroma on a broken chroma profile", () => {
    assert.equal(profileCodeOf(withProfile(trapProfile(), [["chromaProfile", [0.1, 0.2]]])), "bad-chroma");
    assert.equal(profileCodeOf(withProfile(trapProfile(), [["chromaProfile", 42]])), "bad-chroma");
    const withNaN = trapProfile();
    withNaN.chromaProfile[3] = Number.NaN;
    assert.equal(profileCodeOf(withNaN), "bad-chroma");
  });

  it("defaults the absent coded shapes to their empty forms", () => {
    const stripped = withProfile(trapProfile(), [
      ["keyPool", undefined],
      ["bpm.histogram", undefined],
      ["bandBalance", undefined],
      ["onsetDensity", undefined],
      ["chromaProfile", undefined],
    ]);
    const result = validateGenreProfile(stripped);
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.deepEqual(result.doc.keyPool, []);
      assert.deepEqual(result.doc.bpm.histogram, [0, 0, 0, 0, 0, 0, 0, 0]);
      assert.deepEqual(result.doc.bandBalance, { low: 0, mid: 0, high: 0 });
      assert.deepEqual(result.doc.onsetDensity, new Array<number>(ONSET_CURVE_BINS).fill(0));
      assert.deepEqual(result.doc.chromaProfile, new Array<number>(CHROMA_BINS).fill(0));
    }
  });

  it("clamps the tolerant tier and never rejects it", () => {
    const doc = withProfile(trapProfile(), [
      ["trainedOn", 2.5],
      ["referenceIds", [7, "r-2", null, "r-1"]],
      ["bpm.min", 999],
      ["bpm.median", "fast"],
      ["loudness.target", -70],
      ["loudness.max", 5],
      ["centroid", [1, 2, 3]],
      ["updatedAt", 42],
    ]);
    const result = validateGenreProfile(doc);
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.doc.trainedOn, 3);
      assert.deepEqual(result.doc.referenceIds, ["r-2", "r-1"]);
      assert.equal(result.doc.bpm.min, 300);
      assert.equal(result.doc.bpm.median, 0);
      assert.equal(result.doc.loudness.target, -60);
      assert.equal(result.doc.loudness.max, 0);
      assert.deepEqual(result.doc.centroid, new Array<number>(SEGMENT_DIM).fill(0));
      assert.equal(result.doc.updatedAt, "");
    }
  });
});

// ---------------------------------------------------------------------------
// the canonical serialization
// ---------------------------------------------------------------------------

describe("the canonical serialization", () => {
  it("answers the same bytes twice, whatever key order the input carries", () => {
    const profile = trapProfile();
    const once = serializeProfile(profile);
    assert.equal(serializeProfile(profile), once);
    const scrambled: Record<string, unknown> = {};
    const source = profile as unknown as Record<string, unknown>;
    for (const key of [
      "updatedAt",
      "chromaProfile",
      "centroid",
      "loudness",
      "bandBalance",
      "onsetDensity",
      "keyPool",
      "bpm",
      "trainedOn",
      "referenceIds",
      "genre",
      "schema",
    ]) {
      scrambled[key] = source[key];
    }
    assert.equal(serializeProfile(scrambled as unknown as GenreProfile), once);
  });

  it("writes the contract key order and rounds every number to four decimals", () => {
    const json = serializeProfile(trapProfile());
    assert.ok(
      json.startsWith('{"schema":"debonair.profile/1","genre":"trap","referenceIds":["r-1","r-2"],"trainedOn":2,'),
    );
    assert.ok(json.includes('"bandBalance":{"low":0.7,"mid":0.2,"high":0.1}'));
    assert.ok(json.includes('"loudness":{"target":-9,"min":-9,"max":-9}'));
    assert.ok(json.includes('"onsetDensity":[0.625,0.25,0.625,0.25,'));
    const drifted = withProfile(trapProfile(), [["keyPool.0.weight", 0.67896]]);
    assert.ok(serializeProfile(drifted as unknown as GenreProfile).includes('"weight":0.679'));
  });

  it("round-trips the profile: validate(serialize) returns the document", () => {
    const profile = trapProfile();
    const back = validateGenreProfile(JSON.parse(serializeProfile(profile)));
    assert.equal(back.ok, true);
    if (back.ok) {
      assert.deepEqual(back.doc, profile);
      assert.equal(serializeProfile(back.doc), serializeProfile(profile));
    }
  });

  it("throws the typed error when serialization meets a broken profile", () => {
    assert.throws(
      () => serializeProfile(withProfile(trapProfile(), [["onsetDensity", [0.5]]]) as unknown as GenreProfile),
      (error: unknown): boolean => {
        assert.ok(error instanceof ProfileError);
        assert.equal(error.code, "bad-curve");
        return true;
      },
    );
  });
});

// ---------------------------------------------------------------------------
// the genre profile db seat
// ---------------------------------------------------------------------------

describe("the genre profile db seat", () => {
  it("round trips on a temp sqlite: save then list, the json faithful", () => {
    const temp = new Database(":memory:");
    const trap = trapProfile();
    const ambient = ambientProfile();
    assert.equal(saveGenreProfile(trap, temp), 1);
    assert.equal(saveGenreProfile(ambient, temp), 2);
    const rows = listGenreProfiles(temp);
    assert.equal(rows.length, 2);
    const [newest, older] = rows;
    assert.ok(newest && older);
    assert.equal(newest.id, 2);
    assert.equal(newest.genre, "ambient");
    assert.deepEqual(JSON.parse(newest.reference_ids), ambient.referenceIds);
    assert.equal(newest.profile_json, serializeProfile(ambient));
    assert.ok(typeof newest.created_at === "string" && newest.created_at.length > 0);
    assert.equal(older.genre, "trap");
    assert.equal(older.profile_json, serializeProfile(trap));
    assert.deepEqual(JSON.parse(older.reference_ids), ["r-1", "r-2"]);
    temp.close();
  });

  it("refuses a broken profile through the typed error — no row lands", () => {
    const temp = new Database(":memory:");
    const broken = withProfile(trapProfile(), [["genre", "math-rock"]]) as unknown as GenreProfile;
    assert.throws(
      () => saveGenreProfile(broken, temp),
      (error: unknown): boolean => error instanceof ProfileError && error.code === "bad-genre",
    );
    assert.deepEqual(listGenreProfiles(temp), []);
    temp.close();
  });

  it("lands the five columns and stays idempotent on a second migrate", () => {
    const temp = new Database(":memory:");
    migrategenreschema(temp);
    migrategenreschema(temp);
    const columns = (temp.pragma("table_info(genre_profiles)") as { name: string }[]).map((column) => column.name);
    assert.deepEqual(columns, ["id", "genre", "reference_ids", "profile_json", "created_at"]);
    assert.equal(saveGenreProfile(trapProfile(), temp), 1);
    assert.equal(listGenreProfiles(temp).length, 1);
    temp.close();
  });
});
