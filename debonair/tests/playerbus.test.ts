// # playerbus.test — the playback proof (wave PV2.002-006): the reference
// take shape (a blob pointer riding the same grammar the generated plans
// ride), the seam contract (bytes answered, mime honored — the fetch seam
// sees the source, the decode seam sees the fetched bytes and the mime the
// lane answered), the honest typed error codes (blob-missing,
// unsupported-mime, decode-failed — never a throw, even when a seam breaks),
// the bus surface parity (the reference answers the same states the
// generated take answers: play, pause, seek, duration, notice), the session
// reference shelf (store, dedupe, drop, the parse guard) and the default
// lanes (the session mirror, the gateway url law — the origin plus
// /api/v1/blob/:id, never a hardcoded domain — and the host decoder
// honesty). The transport rides a fake AudioContext and a fake window so
// the play path runs in node without a browser. runnable with vitest:
// pnpm vitest run tests/playerbus.test.ts
import assert from "node:assert/strict";
import { afterAll, afterEach, beforeAll, describe, it, vi } from "vitest";
import { planTake } from "../arranger.ts";
import { mintid } from "../bigintids.ts";
import { sessionblobstore } from "../blobstore.ts";
import {
  busFeature,
  busPause,
  busPlay,
  busReferenceSeams,
  busSeek,
  busSelect,
  busSetReferenceSeams,
  busSubscribe,
  type DecodedReference,
  durationOfTake,
  type FetchBytesAnswer,
  isReferenceTake,
  loadReferenceRecords,
  type PlayerSnapshot,
  REFERENCE_STORE_KEY,
  type ReferenceSeams,
  type ReferenceSource,
  type ReferenceTake,
  referenceMimePlayable,
  removeReferenceTake,
  resolveReferenceAudio,
  saveReferenceTake,
} from "../playerbus.ts";
import { memoryStorage } from "../takestore.ts";
import { HEADER_LAYOUT, writeWav16 } from "../wavwriter.ts";

// ---- the fake host: a window with a session storage and an AudioContext ----

/** The rAF callbacks the fake window captured (the tests flush them by hand). */
const frames: FrameRequestCallback[] = [];

/** The last buffer offset a fake source started at (the seek law proof). */
let startedOffset = 0;

/** The fake audio context: the exact surface ReferenceTransport rides. */
class FakeAudioContext {
  /** the clock the tests advance (the playhead reads it) */
  currentTime = 0;
  /** the singleton handle the tests reach */
  static instance: FakeAudioContext | null = null;
  readonly destination = {} as AudioNode;

  constructor() {
    FakeAudioContext.instance = this;
  }

  resume(): Promise<void> {
    return Promise.resolve();
  }

  createBuffer(channels: number, length: number, sampleRate: number): AudioBuffer {
    const lanes: Float32Array[] = [];
    for (let ch = 0; ch < channels; ch++) lanes.push(new Float32Array(length));
    return {
      numberOfChannels: channels,
      length,
      sampleRate,
      duration: length / sampleRate,
      getChannelData: (ch: number) => lanes[ch],
      copyToChannel: (source: Float32Array, ch: number) => {
        lanes[ch].set(source.subarray(0, Math.min(source.length, lanes[ch].length)));
      },
    } as unknown as AudioBuffer;
  }

  createBufferSource(): AudioBufferSourceNode {
    return {
      buffer: null,
      loop: false,
      connect: () => {},
      disconnect: () => {},
      start: (_when: number, offset: number) => {
        startedOffset = offset;
      },
      stop: () => {},
    } as unknown as AudioBufferSourceNode;
  }
}

/** The window the bus rides in node (a working session storage included). */
const windowStub = {
  requestAnimationFrame: (callback: FrameRequestCallback): number => {
    frames.push(callback);
    return frames.length;
  },
  cancelAnimationFrame: () => {},
  sessionStorage: memoryStorage(),
};

const hadWindow = "window" in globalThis;
const hadContext = "AudioContext" in globalThis;
const realWindow = (globalThis as { window?: unknown }).window;
const realContext = (globalThis as { AudioContext?: unknown }).AudioContext;

beforeAll(() => {
  (globalThis as { window?: unknown }).window = windowStub;
  (globalThis as { AudioContext?: unknown }).AudioContext = FakeAudioContext;
});

afterAll(() => {
  if (hadWindow) (globalThis as { window?: unknown }).window = realWindow;
  else delete (globalThis as { window?: unknown }).window;
  if (hadContext) (globalThis as { AudioContext?: unknown }).AudioContext = realContext;
  else delete (globalThis as { AudioContext?: unknown }).AudioContext;
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  busSetReferenceSeams(null);
});

/** Flushes every captured rAF frame (the playhead clock advances one tick). */
function rideFrames(): void {
  const pending = [...frames];
  frames.length = 0;
  for (const frame of pending) frame(performance.now());
}

/** Lets the resolve promises of one play press settle. */
async function settle(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
  rideFrames();
}

// ---- the fixtures ---------------------------------------------------------------

/** Builds one reference take fixture (the blob pointer shape the bench mints). */
function referenceTake(id: string, name = "proof track", durationSeconds = 3): ReferenceTake {
  return {
    kind: "reference",
    id,
    name,
    source: { blobId: mintid(), mime: "audio/wav", name, durationSeconds },
  };
}

/** The decoded-audio fixture the decode seam answers. */
function decodedFixture(durationSeconds = 3, sampleRate = 8000): DecodedReference {
  return { channels: [new Float32Array(durationSeconds * sampleRate)], sampleRate, durationSeconds };
}

/** A deterministic mono pcm fixture (a quiet sine, 3 seconds at 8 khz). */
function pcmFixture(): Float32Array {
  const sampleRate = 8000;
  const pcm = new Float32Array(sampleRate * 3);
  for (let i = 0; i < pcm.length; i++) pcm[i] = 0.4 * Math.sin((2 * Math.PI * 220 * i) / sampleRate);
  return pcm;
}

/** The pcm16 decode seam double: the same math the browser decoder answers
 * for a 16-bit wav (the round trip is exact up to the quantization). */
const pcm16Decode: ReferenceSeams["decodeAudio"] = async (bytes, mime) => {
  assert.equal(mime, "audio/wav");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const offset = HEADER_LAYOUT.pcmPayloadOffset;
  const samples = Math.floor((bytes.byteLength - offset) / 2);
  const channel = new Float32Array(samples);
  for (let i = 0; i < samples; i++) channel[i] = view.getInt16(offset + i * 2, true) / 32767;
  return { ok: true, audio: { channels: [channel], sampleRate: 8000, durationSeconds: samples / 8000 } };
};

/** The seam pair that answers anything (the happy path the parity tests ride). */
function happySeams(audio: DecodedReference): ReferenceSeams {
  return {
    fetchBytes: async () => ({ ok: true, bytes: new Uint8Array([1, 2, 3]), mime: "audio/wav" }),
    decodeAudio: async () => ({ ok: true, audio }),
  };
}

/** The snapshot the bus last emitted (the view the bar renders). */
let latest: PlayerSnapshot | null = null;
busSubscribe((view) => {
  latest = view;
});

// ---- the reference take shape ---------------------------------------------------

describe("the reference take shape", () => {
  it("carries the blob pointer and answers the discriminant and the clock", () => {
    const take = referenceTake("reference-1");
    assert.equal(isReferenceTake(take), true);
    assert.equal(take.source.mime, "audio/wav");
    assert.match(take.source.blobId, /^[1-9]\d{0,19}$/);
    assert.equal(durationOfTake(take), take.source.durationSeconds);
    const plan = planTake({ prompt: "midnight techno", seed: "s1" });
    assert.equal(isReferenceTake(plan), false);
    assert.equal(durationOfTake(plan), plan.durationSeconds);
  });

  it("keeps the session shelf key on the takestore discipline", () => {
    assert.equal(REFERENCE_STORE_KEY, "debonair.references");
  });
});

// ---- the mime law ----------------------------------------------------------------

describe("the mime law of the reference lane", () => {
  it("accepts bare audio mimes and refuses everything else", () => {
    assert.equal(referenceMimePlayable("audio/wav"), true);
    assert.equal(referenceMimePlayable("audio/mpeg"), true);
    assert.equal(referenceMimePlayable("audio/flac"), true);
    assert.equal(referenceMimePlayable("AUDIO/WAV"), true);
    assert.equal(referenceMimePlayable("audio/wav; codecs=1"), false, "parameters never ride");
    assert.equal(referenceMimePlayable("video/mp4"), false);
    assert.equal(referenceMimePlayable("audio"), false);
    assert.equal(referenceMimePlayable("application/json"), false);
    assert.equal(referenceMimePlayable(""), false);
    assert.equal(referenceMimePlayable("  audio/wav  "), true, "surrounding space is trimmed");
  });
});

// ---- the seam contract -------------------------------------------------------------

describe("the seam contract", () => {
  it("answers the bytes and honors the mime the fetch lane declared", async () => {
    const source: ReferenceSource = {
      blobId: mintid(),
      mime: "audio/wav",
      name: "wired",
      durationSeconds: 4,
    };
    const bytes = new Uint8Array([9, 8, 7, 6]);
    const seenDecode: { bytes: Uint8Array; mime: string }[] = [];
    const seams: ReferenceSeams = {
      fetchBytes: async (asked) => {
        assert.equal(asked, source, "the fetch seam sees the very source pointer");
        return { ok: true, bytes, mime: "audio/mpeg" };
      },
      decodeAudio: async (given, mime) => {
        seenDecode.push({ bytes: given, mime });
        return { ok: true, audio: decodedFixture() };
      },
    };
    const answer = await resolveReferenceAudio(source, seams);
    assert.equal(answer.ok, true);
    assert.equal(seenDecode.length, 1);
    assert.deepEqual([...seenDecode[0].bytes], [...bytes], "the decode seam sees the fetched bytes");
    assert.equal(seenDecode[0].mime, "audio/mpeg", "the fetched mime wins over the pointer's");
  });

  it("maps a throwing seam to the typed code — never a crash", async () => {
    const source: ReferenceSource = { blobId: mintid(), mime: "audio/wav", name: "x", durationSeconds: 1 };
    const fetchThrow = await resolveReferenceAudio(source, {
      fetchBytes: () => Promise.reject(new Error("wire cut")),
      decodeAudio: async () => ({ ok: true, audio: decodedFixture() }),
    });
    assert.deepEqual(fetchThrow, { ok: false, code: "blob-missing", message: fetchThrow.ok ? "" : fetchThrow.message });
    assert.match(fetchThrow.ok ? "" : fetchThrow.message, /wire cut/);
    const decodeThrow = await resolveReferenceAudio(source, {
      fetchBytes: async () => ({ ok: true, bytes: new Uint8Array([1]), mime: "audio/wav" }),
      decodeAudio: () => Promise.reject(new Error("decoder exploded")),
    });
    assert.equal(decodeThrow.ok, false);
    assert.equal(decodeThrow.ok ? "" : decodeThrow.code, "decode-failed");
    assert.match(decodeThrow.ok ? "" : decodeThrow.message, /decoder exploded/);
  });
});

// ---- the honest typed error codes ----------------------------------------------------

describe("the typed error codes of the reference lane", () => {
  const source: ReferenceSource = { blobId: mintid(), mime: "audio/wav", name: "gone", durationSeconds: 2 };

  it("answers blob-missing when no lane holds the blob, before any decode", async () => {
    let decoded = 0;
    const answer = await resolveReferenceAudio(source, {
      fetchBytes: async () => ({ ok: false, code: "blob-missing", message: "no blob answers" }),
      decodeAudio: async () => {
        decoded += 1;
        return { ok: true, audio: decodedFixture() };
      },
    });
    assert.deepEqual(answer, { ok: false, code: "blob-missing", message: "no blob answers" });
    assert.equal(decoded, 0, "the decoder never runs on a missing blob");
  });

  it("answers unsupported-mime for a foreign mime, before any decode", async () => {
    let decoded = 0;
    const answer = await resolveReferenceAudio(source, {
      fetchBytes: async () => ({ ok: true, bytes: new Uint8Array([1]), mime: "application/json" }),
      decodeAudio: async () => {
        decoded += 1;
        return { ok: true, audio: decodedFixture() };
      },
    });
    assert.equal(answer.ok, false);
    assert.equal(answer.ok ? "" : answer.code, "unsupported-mime");
    assert.equal(decoded, 0);
  });

  it("answers decode-failed when the decoder refuses the bytes", async () => {
    const answer = await resolveReferenceAudio(source, {
      fetchBytes: async () => ({ ok: true, bytes: new Uint8Array([1, 2]), mime: "audio/wav" }),
      decodeAudio: async () => ({ ok: false, code: "decode-failed", message: "not audio" }),
    });
    assert.deepEqual(answer, { ok: false, code: "decode-failed", message: "not audio" });
  });

  it("surfaces the typed code through the bus snapshot (the notice the bar renders)", async () => {
    const take = referenceTake("reference-err");
    busSetReferenceSeams({
      fetchBytes: async () => ({ ok: false, code: "blob-missing", message: "the blob left with the session" }),
      decodeAudio: async () => ({ ok: true, audio: decodedFixture() }),
    });
    busFeature(take);
    busPlay(0);
    await settle();
    assert.ok(latest);
    assert.equal(latest.playing, false);
    assert.equal(latest.notice, "the blob left with the session");
    assert.equal(latest.noticeCode, "blob-missing");
    assert.equal(latest.duration, take.source.durationSeconds, "the shelf still answers the clock");
  });
});

// ---- the default lanes ---------------------------------------------------------------

describe("the default fetch lane", () => {
  it("answers the stored wav through the session mirror (bytes and mime exact)", async () => {
    const pcm = pcmFixture();
    const pointer = await sessionblobstore().put(writeWav16([pcm], 8000), "audio/wav");
    assert.equal(pointer.ok, true);
    if (!pointer.ok) return;
    const source: ReferenceSource = {
      blobId: pointer.pointer.id,
      mime: "audio/wav",
      name: "mirror take",
      durationSeconds: 3,
    };
    const answer: FetchBytesAnswer = await busReferenceSeams().fetchBytes(source);
    assert.equal(answer.ok, true);
    if (answer.ok) {
      assert.equal(answer.bytes.byteLength, pointer.pointer.bytes);
      assert.equal(answer.mime, "audio/wav");
    }
  });

  it("rides the gateway url law when the mirror holds nothing", async () => {
    const pcm = pcmFixture();
    const wav = writeWav16([pcm], 8000);
    const calls: string[] = [];
    const realFetch = globalThis.fetch;
    globalThis.fetch = (async (input: RequestInfo | URL): Promise<Response> => {
      calls.push(typeof input === "string" ? input : input.url);
      return new Response(wav, { status: 200, headers: { "content-type": "audio/wav" } });
    }) as typeof fetch;
    vi.stubEnv("VITE_DEBONAIR_URL", "https://gateway.example.com");
    try {
      const source: ReferenceSource = { blobId: mintid(), mime: "audio/wav", name: "remote", durationSeconds: 3 };
      const answer = await busReferenceSeams().fetchBytes(source);
      assert.equal(answer.ok, true);
      assert.equal(calls.length, 1);
      assert.equal(
        calls[0],
        `https://gateway.example.com/api/v1/blob/${source.blobId}`,
        "the origin plus the blob route, never a hardcoded domain",
      );
      if (answer.ok) {
        assert.equal(answer.bytes.byteLength, wav.byteLength);
        assert.equal(answer.mime, "audio/wav");
      }
    } finally {
      globalThis.fetch = realFetch;
    }
  });

  it("answers blob-missing when no lane is configured at all", async () => {
    vi.stubEnv("VITE_DEBONAIR_URL", "");
    const source: ReferenceSource = { blobId: mintid(), mime: "audio/wav", name: "void", durationSeconds: 1 };
    const answer = await busReferenceSeams().fetchBytes(source);
    assert.equal(answer.ok, false);
    assert.equal(answer.ok ? "" : answer.code, "blob-missing");
  });
});

describe("the default decode lane", () => {
  it("answers the honest typed failure on a host without a decoder", async () => {
    const answer = await busReferenceSeams().decodeAudio(new Uint8Array([1, 2]), "audio/wav");
    assert.equal(answer.ok, false);
    assert.equal(answer.ok ? "" : answer.code, "decode-failed");
  });
});

// ---- the wav round trip (store → stream → decode equals the source samples) -----------

describe("the wav round trip", () => {
  it("decodes the stored wav back to the source samples through the seam", async () => {
    const pcm = pcmFixture();
    const stored = await sessionblobstore().put(writeWav16([pcm], 8000), "audio/wav");
    assert.equal(stored.ok, true);
    if (!stored.ok) return;
    const source: ReferenceSource = {
      blobId: stored.pointer.id,
      mime: "audio/wav",
      name: "round trip",
      durationSeconds: 3,
    };
    const answer = await resolveReferenceAudio(source, {
      fetchBytes: busReferenceSeams().fetchBytes,
      decodeAudio: pcm16Decode,
    });
    assert.equal(answer.ok, true);
    if (!answer.ok) return;
    assert.equal(answer.audio.durationSeconds, 3);
    assert.equal(answer.audio.sampleRate, 8000);
    assert.equal(answer.audio.channels[0].length, pcm.length);
    for (let i = 0; i < pcm.length; i++) {
      assert.ok(
        Math.abs(answer.audio.channels[0][i] - pcm[i]) <= 1 / 32767,
        `sample ${i} round trips inside the pcm16 quantization`,
      );
    }
  });
});

// ---- the bus surface parity -------------------------------------------------------------

describe("the bus surface parity", () => {
  it("plays, pauses and seeks a reference through the same states a plan answers", async () => {
    const audio = decodedFixture(3, 8000);
    busSetReferenceSeams(happySeams(audio));
    const take = referenceTake("reference-parity", "parity track", 3);
    busFeature(take);
    assert.ok(latest);
    assert.equal(latest.takes[latest.index]?.id, take.id);
    assert.equal(isReferenceTake(latest.takes[latest.index]), true);
    busPlay(0);
    await settle();
    assert.ok(latest);
    assert.equal(latest.playing, true, "the reference plays through the bus");
    assert.equal(latest.duration, 3, "the snapshot answers the source clock");
    assert.equal(latest.notice, "");
    assert.equal(latest.noticeCode, "");
    // the playhead rides the transport clock (the fake context advances)
    assert.ok(FakeAudioContext.instance);
    FakeAudioContext.instance.currentTime = 1.56;
    rideFrames();
    assert.ok(latest);
    assert.ok(latest.position >= 1.4 && latest.position <= 1.6, `the clock rides the context (got ${latest.position})`);
    // pause freezes the playhead
    busPause();
    assert.ok(latest);
    assert.equal(latest.playing, false);
    const frozen = latest.position;
    FakeAudioContext.instance.currentTime = 2.5;
    rideFrames();
    assert.equal(latest.position, frozen, "the paused playhead does not move");
    // seek clamps to the source duration and restarts the loaded lane
    busSeek(2);
    assert.ok(latest);
    assert.equal(latest.position, 2);
    busPlay(2);
    await settle();
    assert.ok(latest);
    assert.equal(latest.playing, true);
    assert.equal(startedOffset, 2, "the loaded lane restarts at the seek offset without a refetch");
  });

  it("features a reference beside the generated takes and selects it by id", () => {
    busPause(); // deterministic: a paused bus answers the select with a plain emit
    const plan = planTake({ prompt: "parity plan", seed: "p1" });
    const take = referenceTake("reference-select");
    busFeature(plan);
    busFeature(take);
    assert.ok(latest);
    assert.equal(latest.takes[latest.index]?.id, take.id);
    busSelect(plan.id);
    assert.ok(latest);
    assert.equal(latest.takes[latest.index]?.id, plan.id);
    assert.equal(isReferenceTake(latest.takes[latest.index]), false);
    busSelect(take.id);
    assert.ok(latest);
    assert.equal(latest.takes[latest.index]?.id, take.id);
    assert.equal(latest.duration, take.source.durationSeconds);
  });
});

// ---- the session reference shelf ----------------------------------------------------------

describe("the session reference shelf", () => {
  it("stores, dedupes and drops reference takes", () => {
    const storage = memoryStorage();
    const take = referenceTake("reference-shelf");
    const again = { ...take, source: { ...take.source } };
    saveReferenceTake(take, storage);
    const records = saveReferenceTake(again, storage);
    assert.equal(records.length, 1, "the same take id replaces its record");
    assert.equal(records[0].take.id, take.id);
    const loaded = loadReferenceRecords(storage);
    assert.equal(loaded.length, 1);
    assert.equal(loaded[0].take.source.blobId, take.source.blobId);
    const rest = removeReferenceTake(take.id, storage);
    assert.equal(rest.length, 0);
    assert.equal(loadReferenceRecords(storage).length, 0);
  });

  it("orders the shelf newest first", () => {
    const storage = memoryStorage();
    const early = referenceTake("reference-early");
    saveReferenceTake(early, storage);
    const late = referenceTake("reference-late");
    saveReferenceTake(late, storage);
    const loaded = loadReferenceRecords(storage);
    assert.equal(loaded.length, 2);
    assert.equal(loaded[0].take.id, late.id);
    assert.equal(loaded[1].take.id, early.id);
  });

  it("drops broken and foreign documents without blocking the shelf", () => {
    const storage = memoryStorage();
    assert.equal(loadReferenceRecords(storage).length, 0);
    storage.setItem(REFERENCE_STORE_KEY, "{not json");
    assert.equal(loadReferenceRecords(storage).length, 0);
    storage.setItem(
      REFERENCE_STORE_KEY,
      JSON.stringify([
        { take: { kind: "reference", id: "x" }, savedAt: "2026-01-01T00:00:00.000Z" },
        { nope: true },
        {
          take: {
            kind: "reference",
            id: "keep",
            name: "keep",
            source: { blobId: "123", mime: "audio/wav", name: "keep", durationSeconds: 2 },
          },
          savedAt: "2026-01-01T00:00:00.000Z",
        },
      ]),
    );
    const loaded = loadReferenceRecords(storage);
    assert.equal(loaded.length, 1);
    assert.equal(loaded[0].take.id, "keep");
  });

  it("rides the live bus shelf beside the generated takes", () => {
    const storage = memoryStorage();
    const take = referenceTake("reference-live");
    saveReferenceTake(take, storage);
    assert.ok(latest);
    const onShelf = latest.takes.find((held) => held.id === take.id);
    assert.ok(onShelf, "the stored reference rides the bus shelf");
    assert.equal(isReferenceTake(onShelf), true);
    removeReferenceTake(take.id, storage);
    assert.ok(latest);
    assert.equal(
      latest.takes.find((held) => held.id === take.id),
      undefined,
      "the drop leaves the shelf",
    );
  });
});
