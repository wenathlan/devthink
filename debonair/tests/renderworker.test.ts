// # renderworker.test — the render lane of the generation pipeline (the
// waves PV4.002 and PV4.003): a composed plan (the composer over a
// synthetic trap profile — the same corpus shape tests/composer.test.ts
// rides) renders offline into real wav bytes — the wavwriter's own parse
// reads the header back, the duration matches the bars*bpm law with the
// release tail, the drum hits land exactly where the lanes say (the rms
// energy at the kick steps against the resting steps, the surgical plans
// answering the strong law: the gaps between the hits are true silence),
// and the determinism holds (the same plan and seed answer the same
// bytes, a fresh seed answers a fresh take). the render_jobs ledger walks
// the ingest_jobs law (the row round trip, the patch merge, the owner
// filter, the in-place migration of the site's own queue shape, the
// minted pointers exact beyond the js number floor), the tracks table
// grows the pointer chain, and the job walk rides the temp sqlite end to
// end: queued → rendering → done with the wav in the store, the track row
// landed with the pointers, and the honest failure codes (empty-plan,
// render-failed, store-failed, bad-plan, not-found, conflict) answering
// their lanes. runnable with vitest:
//   pnpm vitest run tests/renderworker.test.ts
import assert from "node:assert/strict";
import Database from "better-sqlite3";
import { describe, it } from "vitest";
import { RENDER_TAIL_S } from "../audioengine.ts";
import { mintid } from "../bigintids.ts";
import { composeFromProfile } from "../composer.ts";
import { MASTERING, trackNameFromPrompt } from "../katexis.ts";
import { LANE_STEPS, serializePattern, validatePatternProject } from "../patternenums.ts";
import { type GenreProfile, segmentVector } from "../patternminer.ts";
import {
  getrenderjob,
  getrendertrack,
  listrenderjobs,
  migraterenderjobsschema,
  migratetrackschema,
  putrenderjob,
  putrendertrack,
  renderjobseat,
  rendertrackseat,
  updaterenderjob,
} from "../renderjobs.ts";
import {
  RENDER_PHASES,
  RENDER_SAMPLE_RATE,
  type RenderBlobStore,
  type RenderJobPatch,
  type RenderJobRow,
  type RenderJobSeat,
  type RenderStorePut,
  renderPlan,
  startRenderJob,
} from "../renderworker.ts";
import { HEADER_LAYOUT, wavInfo } from "../wavwriter.ts";

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

/** The centroid through the miner's own normalization law (the same seats,
 * the same clamps — the profile's center is the mean of its references). */
function centroidOf(bands: [number, number, number], chroma: number[]): number[] {
  return segmentVector({
    s: 0,
    rms: 0.28,
    peak: 0.9,
    zcr: 0.055,
    cent: 600,
    flat: 0.055,
    beat: 0.14,
    onsets: 2,
    bands,
    note: "",
    chroma,
  });
}

/** The percussive trap corpus profile: a busy onset curve (the quarter grid
 * peaks), the low band dominant, 140 bpm references in A minor, mastered
 * to -9 — the same synthetic corpus tests/composer.test.ts rides. */
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
    centroid: centroidOf([0.55, 0.26, 0.19], TRAP_CHROMA),
    chromaProfile: TRAP_CHROMA,
    updatedAt: "2026-05-01T00:00:00.000Z",
  };
}

/** The composed plan the render lane rides — the composer's own answer for
 * the trap corpus (deterministic: the same prompt, profile and salt always
 * answer the same serializePattern bytes). */
const PLAN = composeFromProfile("dark trap, hard 808s, 140 bpm", percussiveProfile());

/** A silent sixteen-step lane (the surgical plans' off seats). */
const SILENT_LANE: readonly number[] = new Array<number>(LANE_STEPS).fill(0);

/** The hand-built surgical plan: two bars at 120 bpm, nothing but the kick
 * lane at steps 0 and 8 — the isolate the energy law reads. */
function kickOnlyPlan() {
  return {
    schema: "debonair.pattern/1" as const,
    bpm: 120,
    root: 0,
    scale: "major" as const,
    bars: 2,
    mood: "surgical",
    prompt: "",
    drums: {
      kick: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      snare: [...SILENT_LANE],
      hat: [...SILENT_LANE],
      clap: [...SILENT_LANE],
    },
    notes: [],
    embedding: new Array<number>(32).fill(0),
  };
}

/** The hand-built hat isolate: two bars at 120 bpm, nothing but the hat
 * lane at the odd steps 2, 6, 10, 14 — the seeded noise lane's law. */
function hatOnlyPlan() {
  const plan = kickOnlyPlan();
  return {
    ...plan,
    drums: {
      ...plan.drums,
      hat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
    },
  };
}

/** The silent plan: every lane off, no notes — the empty-plan isolate. */
function silentPlan() {
  const plan = kickOnlyPlan();
  return {
    ...plan,
    drums: { kick: [...SILENT_LANE], snare: [...SILENT_LANE], hat: [...SILENT_LANE], clap: [...SILENT_LANE] },
  };
}

/** The in-memory blob store double — the seam's own law: the put answers
 * the pointer (the store-computed digest is the double's stand-in; the
 * lane never reads it back). */
class MemoryStore implements RenderBlobStore {
  /** The landed blobs by pointer id (the walk's assertions read them). */
  readonly blobs = new Map<string, Uint8Array>();

  async put(data: Uint8Array, kind: string): Promise<RenderStorePut> {
    const id = mintid();
    this.blobs.set(id, data);
    return { ok: true, pointer: { id, bytes: data.length, sha256: digestOf(data), kind } };
  }
}

/** The store double's digest — an fnv-1a over the bytes expanded to the
 * 64-hex shape (the real store computes the sha256 itself; the seam only
 * carries it). */
function digestOf(bytes: Uint8Array): string {
  let hash = 0x811c9dc5;
  for (const byte of bytes) {
    hash ^= byte;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0").repeat(8);
}

/** The refusing store — the error branch of the seam. */
class RefusingStore implements RenderBlobStore {
  async put(): Promise<RenderStorePut> {
    return { ok: false, code: "too-large", message: "the bytes pass the cap" };
  }
}

/** The throwing store — the hostile lane the guard translates. */
class ThrowingStore implements RenderBlobStore {
  async put(): Promise<RenderStorePut> {
    throw new Error("the lane is offline");
  }
}

/** Decodes the writer's own pcm16 payload back into float samples — the
 * inverse of the quantizer (the full-scale codes the format table pins). */
function pcmOf(bytes: Uint8Array): Float32Array {
  const info = wavInfo(bytes);
  assert.equal(info.channels, 1, "the bounce is mono");
  assert.equal(info.bitDepth, 16, "the bounce is pcm 16");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const pcm = new Float32Array(info.frames);
  for (let frame = 0; frame < info.frames; frame++) {
    pcm[frame] = view.getInt16(HEADER_LAYOUT.pcmPayloadOffset + frame * 2, true) / 32767;
  }
  return pcm;
}

/** The rms of one window of the pcm (seconds on the render rate). */
function rmsOf(pcm: Float32Array, from: number, to: number): number {
  const start = Math.max(0, Math.floor(from * RENDER_SAMPLE_RATE));
  const end = Math.min(pcm.length, Math.ceil(to * RENDER_SAMPLE_RATE));
  if (end <= start) return 0;
  let sum = 0;
  for (let i = start; i < end; i++) sum += pcm[i] * pcm[i];
  return Math.sqrt(sum / (end - start));
}

/** The one-pole lowband isolate (the honest spectral seat: everything
 * under the cutoff rides, the hats and snares stay out). */
function lowOf(pcm: Float32Array, hz: number): Float32Array {
  const alpha = 1 - Math.exp((-2 * Math.PI * hz) / RENDER_SAMPLE_RATE);
  const out = new Float32Array(pcm.length);
  let y = 0;
  for (let i = 0; i < pcm.length; i++) {
    y += alpha * (pcm[i] - y);
    out[i] = y;
  }
  return out;
}

/** The mean of a list; zero when empty. */
function meanOf(values: readonly number[]): number {
  if (values.length === 0) return 0;
  let sum = 0;
  for (const value of values) sum += value;
  return sum / values.length;
}

/** One queued ledger row the walk registers (the canonical plan json the
 * composer serialized, the deterministic clock the finishes stamp). */
function queuedRow(planJson: string, owner = mintid()): RenderJobRow {
  return {
    id: mintid(),
    owner_id: owner,
    state: "queued",
    phase: null,
    fraction: 0,
    error: null,
    plan_json: planJson,
    wav_pointer: null,
    track_pointer: null,
    created_at: "2026-06-01T00:00:00.000Z",
    finished_at: null,
  };
}

// ---------------------------------------------------------------------------
// the composed plan renders (the real chain)
// ---------------------------------------------------------------------------

describe("the composed plan renders through the engine recipes", () => {
  it("answers the pointer, the wav header law and the duration law", async () => {
    assert.ok(validatePatternProject(PLAN).ok, "the chain starts from a valid plan");
    const store = new MemoryStore();
    const result = await renderPlan(PLAN, "seed-one", store);
    assert.ok(result.ok, "the composed plan renders");
    assert.ok(result.bytes.length > 0, "the wav bytes are non-empty");
    // the wavwriter's own parse reads the header back
    const info = wavInfo(result.bytes);
    assert.equal(info.sampleRate, MASTERING.sampleRateHz, "the house rate the mastering spec pins");
    assert.equal(info.channels, 1, "the offline bounce is mono — the graph carries no stereo spread");
    assert.equal(info.bitDepth, 16, "the reference's wav law: pcm 16");
    assert.equal(info.isFloat, false, "the integer lane");
    // the bars*bpm law with the release tail the offline bounce adds
    const expectedFrames = Math.ceil((PLAN.bars * (240 / PLAN.bpm) + RENDER_TAIL_S) * RENDER_SAMPLE_RATE);
    assert.equal(info.frames, expectedFrames, "the frames match the bars*bpm law plus the tail");
    assert.equal(result.bytes.length, HEADER_LAYOUT.pcmPayloadOffset + expectedFrames * 2, "the writer's own layout");
    assert.ok(
      Math.abs(result.durationSeconds - expectedFrames / RENDER_SAMPLE_RATE) < 1e-9,
      "the duration answers the frame count",
    );
    // the store saw the audio/wav kind and the same bytes
    assert.equal(result.wavPointer.kind, "audio/wav");
    assert.equal(result.wavPointer.bytes, result.bytes.length);
    assert.deepEqual(store.blobs.get(result.wavPointer.id), result.bytes, "the store holds the same bytes");
  });

  it("lands the drum energy where the kick lanes say (the rms law)", async () => {
    const result = await renderPlan(PLAN, "seed-one", new MemoryStore());
    assert.ok(result.ok);
    assert.ok(
      PLAN.drums.kick.reduce((a, b) => a + b, 0) > 0,
      "the trap corpus answers a lane with kick hits (the fixture's own law)",
    );
    const pcm = pcmOf(result.bytes);
    const stepSeconds = 60 / (PLAN.bpm * 4);
    const low = lowOf(pcm, 250);
    const onsets: number[] = [];
    const rests: number[] = [];
    for (let bar = 0; bar < PLAN.bars; bar++) {
      for (let step = 0; step < LANE_STEPS; step++) {
        const t = (bar * LANE_STEPS + step) * stepSeconds;
        if (PLAN.drums.kick[step] === 1) onsets.push(t);
        else if (step % 2 === 1) rests.push(t);
      }
    }
    assert.ok(onsets.length > 0, "the plan carries kick onsets");
    assert.ok(rests.length > 0, "the plan carries resting steps");
    // the low band carries the kick dive (and the bass locked to it); the
    // resting odd steps carry the pad bed and the hat ticks — the observed
    // band across the trap corpus sits near 2.1, the floor keeps the margin
    const onsetEnergy = meanOf(onsets.map((t) => rmsOf(low, t, t + 0.08)));
    const restEnergy = meanOf(rests.map((t) => rmsOf(low, t, t + 0.08)));
    assert.ok(
      onsetEnergy > restEnergy * 1.5,
      `the low-band energy at the kick steps (${onsetEnergy.toFixed(4)}) must clear the resting steps (${restEnergy.toFixed(4)}) by half again`,
    );
  });

  it("answers the same bytes for the same plan and seed (the seeded law)", async () => {
    const first = await renderPlan(PLAN, "seed-one", new MemoryStore());
    const second = await renderPlan(PLAN, "seed-one", new MemoryStore());
    const third = await renderPlan(PLAN, "seed-one", new MemoryStore());
    assert.ok(first.ok && second.ok && third.ok);
    assert.deepEqual(second.bytes, first.bytes, "two fresh lanes answer the same bytes");
    assert.deepEqual(third.bytes, first.bytes, "the third run stays byte-stable");
    assert.ok(
      first.wavPointer.id !== second.wavPointer.id,
      "the pointers ride the store's own mint — the bytes are the identity",
    );
  });

  it("answers fresh bytes for a fresh seed (the take lane)", async () => {
    const first = await renderPlan(PLAN, "seed-one", new MemoryStore());
    const second = await renderPlan(PLAN, "seed-two", new MemoryStore());
    assert.ok(first.ok && second.ok);
    assert.notDeepEqual(second.bytes, first.bytes, "the seeded noise rides the take identity");
  });
});

// ---------------------------------------------------------------------------
// the surgical plans (the hand-built law — the isolate seats)
// ---------------------------------------------------------------------------

describe("the surgical plans answer the strong energy law", () => {
  it("lands the kick exactly at the lane steps and nowhere else", async () => {
    const plan = kickOnlyPlan();
    assert.ok(validatePatternProject(plan).ok, "the hand-built plan answers the contract");
    const result = await renderPlan(plan, "surgical", new MemoryStore());
    assert.ok(result.ok);
    const info = wavInfo(result.bytes);
    const expectedFrames = Math.ceil((2 * (240 / 120) + RENDER_TAIL_S) * RENDER_SAMPLE_RATE);
    assert.equal(info.frames, expectedFrames, "two bars at 120 bpm plus the tail");
    const pcm = pcmOf(result.bytes);
    // the kick lane hits steps 0 and 8 of each bar: onsets at 0, 1, 2 and 3
    // seconds (the sixteenth grid at 0.125 s); the gaps between the hits
    // are true silence — the recipe stops at 0.36 s
    for (const onset of [0, 1, 2, 3]) {
      const hit = rmsOf(pcm, onset, onset + 0.1);
      const gap = rmsOf(pcm, onset + 0.5, onset + 0.9);
      assert.ok(hit > 0.05, `the window after the kick onset ${onset} s carries the dive (rms ${hit.toFixed(5)})`);
      assert.ok(gap < 1e-6, `the window past the kick tail ${onset} s is silence (rms ${gap})`);
    }
  });

  it("lands the hat ticks at the lane steps (the seeded noise lane)", async () => {
    const plan = hatOnlyPlan();
    assert.ok(validatePatternProject(plan).ok);
    const result = await renderPlan(plan, "surgical", new MemoryStore());
    assert.ok(result.ok);
    const pcm = pcmOf(result.bytes);
    // the hat lane hits steps 2, 6, 10, 14: onsets at every half second
    for (const onset of [0.25, 0.75, 1.25, 1.75]) {
      const hit = rmsOf(pcm, onset, onset + 0.04);
      const gap = rmsOf(pcm, onset + 0.15, onset + 0.24);
      assert.ok(hit > 0.005, `the hat tick at ${onset} s answers energy (rms ${hit.toFixed(5)})`);
      assert.ok(gap < 1e-6, `the window past the hat decay ${onset} s is silence (rms ${gap})`);
    }
  });
});

// ---------------------------------------------------------------------------
// the typed error codes
// ---------------------------------------------------------------------------

describe("the typed error codes", () => {
  it("refuses the silent plan (empty-plan)", async () => {
    const result = await renderPlan(silentPlan(), "seed-one", new MemoryStore());
    assert.ok(!result.ok);
    assert.equal(result.code, "empty-plan");
    assert.ok(result.message.includes("nothing to render"));
  });

  it("refuses a plan off the contract (render-failed)", async () => {
    const broken = { schema: "debonair.pattern/2" } as unknown as Parameters<typeof renderPlan>[0];
    const result = await renderPlan(broken, "seed-one", new MemoryStore());
    assert.ok(!result.ok);
    assert.equal(result.code, "render-failed");
    assert.ok(result.message.includes("bad-schema"), "the validator's own reason rides the message");
  });

  it("translates the refusing store (store-failed)", async () => {
    const result = await renderPlan(PLAN, "seed-one", new RefusingStore());
    assert.ok(!result.ok);
    assert.equal(result.code, "store-failed");
    assert.ok(result.message.includes("too-large"), "the store's own code rides the message");
  });

  it("translates the throwing store (store-failed, never a throw)", async () => {
    const result = await renderPlan(PLAN, "seed-one", new ThrowingStore());
    assert.ok(!result.ok);
    assert.equal(result.code, "store-failed");
    assert.ok(result.message.includes("offline"));
  });
});

// ---------------------------------------------------------------------------
// the render_jobs ledger (the ingest_jobs walk law)
// ---------------------------------------------------------------------------

describe("the render_jobs ledger", () => {
  it("round trips every walk column", () => {
    const temp = new Database(":memory:");
    const row = queuedRow(serializePattern(PLAN));
    putrenderjob(row, temp);
    assert.deepEqual(getrenderjob(row.id, temp), row, "every column reads back");
  });

  it("patches the mutable columns and keeps the omitted ones standing", () => {
    const temp = new Database(":memory:");
    const row = queuedRow(serializePattern(PLAN));
    putrenderjob(row, temp);
    const patched = updaterenderjob(row.id, { phase: "render", fraction: 0.5 }, temp);
    assert.equal(patched, true, "a standing row patches");
    const after = getrenderjob(row.id, temp);
    assert.ok(after);
    assert.equal(after.phase, "render");
    assert.equal(after.fraction, 0.5);
    assert.equal(after.state, "queued", "the state the patch omitted keeps its standing value");
    assert.equal(after.error, null, "the error the patch omitted keeps its standing value");
    assert.equal(updaterenderjob(mintid(), { phase: "store" }, temp), false, "a missing id changes nothing");
  });

  it("lists newest first with the owner filter", () => {
    const temp = new Database(":memory:");
    const owner = mintid();
    const mine = queuedRow(serializePattern(PLAN), owner);
    const other = queuedRow(serializePattern(PLAN), mintid());
    putrenderjob(mine, temp);
    putrenderjob(other, temp);
    const byOwner = listrenderjobs(owner, temp);
    assert.equal(byOwner.length, 1);
    assert.equal(byOwner[0]?.id, mine.id);
    const every = listrenderjobs(undefined, temp);
    assert.equal(every.length, 2);
  });

  it("reads the minted id exact beyond the js number floor (the cast law)", () => {
    const temp = new Database(":memory:");
    const row = queuedRow(serializePattern(PLAN));
    row.id = "9007199254740993"; // 2^53 + 1 — beyond the floor
    putrenderjob(row, temp);
    const back = getrenderjob("9007199254740993", temp);
    assert.ok(back);
    assert.equal(back.id, "9007199254740993", "the pointer stays exact");
    assert.notEqual(back.id, "9007199254740992");
  });

  it("upgrades the site's own queue shape in place without losing a row", () => {
    const temp = new Database(":memory:");
    temp.exec(`
      CREATE TABLE render_jobs (
        id        INTEGER PRIMARY KEY AUTOINCREMENT,
        trackId   INTEGER,
        projectId INTEGER,
        prompt    TEXT NOT NULL DEFAULT '',
        genre     TEXT NOT NULL DEFAULT '',
        seed      INTEGER NOT NULL DEFAULT 0,
        duration  TEXT NOT NULL DEFAULT '',
        status    TEXT NOT NULL DEFAULT 'queued',
        seconds   INTEGER NOT NULL DEFAULT 0,
        createdAt TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);
    temp
      .prepare("INSERT INTO render_jobs (trackId, prompt, genre, status, seconds) VALUES (?, ?, ?, ?, ?)")
      .run(1, "old queue row", "trap", "queued", 120);
    migraterenderjobsschema(temp);
    const counted = temp.prepare("SELECT COUNT(*) AS total FROM render_jobs").get() as { total: number };
    assert.equal(counted.total, 1, "no row is lost to the migration");
    const columns = (temp.pragma("table_info(render_jobs)") as { name: string }[]).map((column) => column.name);
    for (const law of [
      "owner_id",
      "state",
      "phase",
      "fraction",
      "error",
      "plan_json",
      "wav_pointer",
      "created_at",
      "finished_at",
    ]) {
      assert.ok(columns.includes(law), `the upgraded table carries ${law}`);
    }
    const planted = temp.prepare("SELECT prompt, state, plan_json FROM render_jobs WHERE trackId = 1").get() as {
      prompt: string;
      state: string;
      plan_json: string;
    };
    assert.equal(planted.prompt, "old queue row", "the pre-law data survives untouched");
    assert.equal(planted.state, "queued", "the law's fill");
    assert.equal(planted.plan_json, "");
    // idempotent — a second migration changes nothing
    migraterenderjobsschema(temp);
    assert.equal((temp.prepare("SELECT COUNT(*) AS total FROM render_jobs").get() as { total: number }).total, 1);
    // the upgraded integer-id table still carries the ledger law: a minted
    // pointer binds and reads back exact through the cast
    const row = queuedRow(serializePattern(PLAN));
    putrenderjob(row, temp);
    assert.equal(getrenderjob(row.id, temp)?.id, row.id);
  });

  it("lands the ledger shape on a fresh handle (the create path)", () => {
    const temp = new Database(":memory:");
    migraterenderjobsschema(temp);
    const columns = (temp.pragma("table_info(render_jobs)") as { name: string }[]).map((column) => column.name);
    assert.deepEqual(columns, [
      "id",
      "owner_id",
      "state",
      "phase",
      "fraction",
      "error",
      "plan_json",
      "wav_pointer",
      "track_pointer",
      "created_at",
      "finished_at",
    ]);
  });
});

// ---------------------------------------------------------------------------
// the tracks pointer chain
// ---------------------------------------------------------------------------

describe("the tracks pointer chain", () => {
  it("stamps and reads back the rendered track row", () => {
    const temp = new Database(":memory:");
    const row = {
      id: mintid(),
      ownerId: mintid(),
      name: "Dark trap hard",
      genre: "trap dark",
      seconds: 9,
      status: "ready",
      wavPointer: mintid(),
      visibility: "private" as const,
      createdAt: "2026-06-01T00:00:00.000Z",
    };
    const answer = putrendertrack(row, temp);
    assert.ok(answer.ok);
    assert.deepEqual(getrendertrack(row.id, temp), row, "every column reads back, the pointers exact");
  });

  it("reads the wav pointer exact beyond the js number floor", () => {
    const temp = new Database(":memory:");
    const row = {
      id: mintid(),
      ownerId: mintid(),
      name: "floor take",
      genre: "trap",
      seconds: 8,
      status: "ready",
      wavPointer: "9007199254740993",
      visibility: "private" as const,
      createdAt: "2026-06-01T00:00:00.000Z",
    };
    assert.ok(putrendertrack(row, temp).ok);
    const back = getrendertrack(row.id, temp);
    assert.ok(back);
    assert.equal(back.wavPointer, "9007199254740993", "a number-coerced read would round past the floor");
  });

  it("answers the mint law's typed refusals", () => {
    const temp = new Database(":memory:");
    const good = {
      id: mintid(),
      ownerId: mintid(),
      name: "refusal take",
      genre: "trap",
      seconds: 8,
      status: "ready",
      wavPointer: mintid(),
      visibility: "private" as const,
      createdAt: "2026-06-01T00:00:00.000Z",
    };
    const refusalOf = (patch: Partial<typeof good>): string => {
      const answer = putrendertrack({ ...good, ...patch }, temp);
      assert.ok(!answer.ok, "the mint law refuses the shape");
      return answer.code;
    };
    assert.equal(refusalOf({ ownerId: "abc" }), "bad-owner");
    assert.equal(refusalOf({ ownerId: "0" }), "bad-owner");
    assert.equal(refusalOf({ wavPointer: "12.5" }), "bad-pointer");
    assert.equal(refusalOf({ wavPointer: "18446744073709551616" }), "bad-pointer");
    assert.equal(refusalOf({ id: "nope" }), "bad-pointer");
    assert.equal(refusalOf({ visibility: "public" }), "bad-visibility");
  });

  it("upgrades the site's own tracks table in place without losing a row", () => {
    const temp = new Database(":memory:");
    temp.exec(`
      CREATE TABLE tracks (
        id        INTEGER PRIMARY KEY AUTOINCREMENT,
        name      TEXT NOT NULL,
        genre     TEXT NOT NULL,
        seconds   INTEGER NOT NULL DEFAULT 0,
        status    TEXT NOT NULL DEFAULT 'draft',
        createdAt TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);
    temp
      .prepare("INSERT INTO tracks (name, genre, seconds, status) VALUES (?, ?, ?, ?)")
      .run("Old Take", "House", 222, "ready");
    migratetrackschema(temp);
    const counted = temp.prepare("SELECT COUNT(*) AS total FROM tracks").get() as { total: number };
    assert.equal(counted.total, 1, "no row is lost to the migration");
    const columns = (temp.pragma("table_info(tracks)") as { name: string }[]).map((column) => column.name);
    assert.ok(columns.includes("owner_id"), "the owner pointer lands");
    assert.ok(columns.includes("wav_pointer"), "the wav address lands");
    const planted = temp.prepare("SELECT name, CAST(owner_id AS TEXT) AS owner_id FROM tracks").get() as {
      name: string;
      owner_id: string;
    };
    assert.equal(planted.name, "Old Take", "the pre-law data survives");
    assert.equal(planted.owner_id, "0", "the pre-identity epoch marker the migration fills");
    migratetrackschema(temp);
    assert.equal((temp.prepare("SELECT COUNT(*) AS total FROM tracks").get() as { total: number }).total, 1);
  });
});

// ---------------------------------------------------------------------------
// the job walk (queued → rendering → done on the temp sqlite)
// ---------------------------------------------------------------------------

describe("the job walk", () => {
  /** One environment over a fresh temp database and a fresh store (the
   * deterministic clock the finishes stamp). */
  function env() {
    const temp = new Database(":memory:");
    const store = new MemoryStore();
    return {
      temp,
      store,
      value: {
        store,
        jobs: renderjobseat(temp),
        tracks: rendertrackseat(temp),
        now: () => "2026-06-01T00:00:01.000Z",
      },
    };
  }

  it("walks queued → rendering → done with the wav, the pointers and the track row", async () => {
    const lane = env();
    const row = queuedRow(serializePattern(PLAN));
    putrenderjob(row, lane.temp);
    const run = await startRenderJob(lane.value, row.id);
    assert.ok(run.ok, "the walk lands");
    assert.equal(run.state, "done");
    assert.ok(run.bytes > 0);
    assert.ok(run.durationSeconds > 0);
    assert.ok(run.trackId, "the track row lands with the pointers");
    // the ledger row landed done with the wav pointer
    const landed = getrenderjob(row.id, lane.temp);
    assert.ok(landed);
    assert.equal(landed.state, "done");
    assert.equal(landed.phase, "store", "the last completed phase");
    assert.equal(landed.fraction, 1);
    assert.equal(landed.wav_pointer, run.wavPointer);
    assert.equal(landed.error, null);
    assert.equal(landed.finished_at, "2026-06-01T00:00:01.000Z");
    // the store holds the wav the pointer names
    const stored = lane.store.blobs.get(run.wavPointer);
    assert.ok(stored);
    assert.equal(stored.length, run.bytes);
    // the track row landed with the owner pointer, the wav address and the
    // house naming law
    const track = getrendertrack(run.trackId ?? "", lane.temp);
    assert.ok(track);
    assert.equal(track.ownerId, row.owner_id, "the owner pointer rides the chain");
    assert.equal(track.wavPointer, run.wavPointer, "the wav address rides the chain");
    assert.equal(track.name, trackNameFromPrompt(PLAN.prompt), "the prompt's first words, the house law");
    assert.equal(track.genre, PLAN.mood, "the genre line is the plan's mood label");
    assert.equal(track.status, "ready");
    assert.equal(track.seconds, Math.round(run.durationSeconds));
    // the walk is one-shot — a re-run refuses
    const again = await startRenderJob(lane.value, row.id);
    assert.ok(!again.ok);
    assert.equal(again.code, "conflict");
  });

  it("rides the pure lane store-only when the track seat is absent", async () => {
    const lane = env();
    const row = queuedRow(serializePattern(PLAN));
    putrenderjob(row, lane.temp);
    const run = await startRenderJob({ ...lane.value, tracks: null }, row.id);
    assert.ok(run.ok);
    assert.equal(run.trackId, null, "no track seat, no track row");
    const landed = getrenderjob(row.id, lane.temp);
    assert.ok(landed);
    assert.equal(landed.state, "done");
    assert.equal(landed.wav_pointer, run.wavPointer);
  });

  it("patches the phases in the law order (the progress walk)", async () => {
    const lane = env();
    const patches: RenderJobPatch[] = [];
    const base: RenderJobSeat = renderjobseat(lane.temp);
    const recording: RenderJobSeat = {
      putjob: (r) => base.putjob(r),
      getjob: (id) => base.getjob(id),
      updatejob: (id, patch) => {
        patches.push(patch);
        base.updatejob(id, patch);
      },
      listjobs: (ownerId) => base.listjobs(ownerId),
    };
    const row = queuedRow(serializePattern(PLAN));
    putrenderjob(row, lane.temp);
    const run = await startRenderJob({ ...lane.value, jobs: recording }, row.id);
    assert.ok(run.ok);
    // the walk: the rendering state first, then one patch per completed
    // phase (the ascending fractions), the done stamp last
    assert.equal(patches[0]?.state, "rendering");
    const phasePatches = patches.slice(1, 1 + RENDER_PHASES.length);
    assert.deepEqual(
      phasePatches.map((patch) => patch.phase),
      [...RENDER_PHASES],
      "every phase lands in the law order",
    );
    for (const [index, patch] of phasePatches.entries()) {
      assert.ok(Math.abs((patch.fraction ?? 0) - (index + 1) / RENDER_PHASES.length) < 1e-9);
    }
    const done = patches[patches.length - 1];
    assert.equal(done?.state, "done");
    assert.equal(done?.wav_pointer, run.wavPointer);
  });

  it("lands the honest failure when the store refuses (the failed walk)", async () => {
    const lane = env();
    const row = queuedRow(serializePattern(PLAN));
    putrenderjob(row, lane.temp);
    const refusing = { ...lane.value, store: new RefusingStore() };
    const run = await startRenderJob(refusing, row.id);
    assert.ok(!run.ok);
    assert.equal(run.code, "store-failed");
    const landed = getrenderjob(row.id, lane.temp);
    assert.ok(landed);
    assert.equal(landed.state, "failed");
    assert.ok(landed.error?.startsWith("store-failed: "), "the honest code rides the error");
    assert.equal(landed.finished_at, "2026-06-01T00:00:01.000Z");
    assert.equal(landed.wav_pointer, null, "no pointer for a failed take");
    const again = await startRenderJob(refusing, row.id);
    assert.ok(!again.ok);
    assert.equal(again.code, "conflict", "a landed job never re-runs");
  });

  it("lands the bad-plan failure when the queued payload breaks the contract", async () => {
    const lane = env();
    const row = queuedRow("this is not the pattern json");
    putrenderjob(row, lane.temp);
    const run = await startRenderJob(lane.value, row.id);
    assert.ok(!run.ok);
    assert.equal(run.code, "bad-plan");
    const landed = getrenderjob(row.id, lane.temp);
    assert.ok(landed);
    assert.equal(landed.state, "failed");
    assert.ok(landed.error?.startsWith("bad-plan: "));
  });

  it("answers not-found for an unknown job", async () => {
    const lane = env();
    const run = await startRenderJob(lane.value, mintid());
    assert.ok(!run.ok);
    assert.equal(run.code, "not-found");
  });
});
