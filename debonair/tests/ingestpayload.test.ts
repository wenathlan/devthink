// # ingestpayload.test — the structured payload lane contract (wave T4-E ·
// PR17): the container probe answers the honest facts per format (the wav
// walk exact, the mp3 header parse with the cbr estimate, the ogg
// identification plus granule scan, the unknown refusal), the forward ingest
// turns real wav bytes into the debonair.soundpayload/1 document (the
// container facts, the track summary, the 100 ms energy chunks, the beats and
// the embedded debonair.ingest/1 decomposition — deterministic for the same
// bytes), the compressed lanes answer the honest container-only payload with
// zero fake vectors, and the reverse ingest reconstructs playable wav bytes
// out of the payload through seeded vector synthesis — the round trip the
// sandbox plays: ingest → payload → reconstruct → the bytes parse back as
// sound through two independent wav readers, the energy correlates with the
// source, and the same payload answers the same bytes. runnable with vitest:
// pnpm vitest run tests/ingestpayload.test.ts
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { wavinfo } from "../audioformat.ts";
import { INGEST_SCHEMA_VERSION } from "../ingest.ts";
import {
  ENERGY_CHUNK_MS,
  type EnergyChunk,
  ingestPayload,
  PAYLOAD_LANE_MODALITY,
  probesound,
  reconstructWav,
  SOUND_PAYLOAD_SCHEMA_VERSION,
  type SoundPayload,
} from "../ingestpayload.ts";
import { encodeWav, wavInfo } from "../wavwriter.ts";

/** The pinned instant every deterministic run stamps (the seeded law). */
const PINNED_AT = "2026-01-01T00:00:00.000Z";

/** The source rate of the synthetic take (the writer band floor, fast to analyze). */
const SAMPLE_RATE = 8000;

/** The length of the synthetic take in whole seconds (one vector frame per second). */
const SECONDS = 3;

/**
 * The deterministic synthetic source: a 110 hz sawtooth bass (the harmonic
 * ridge) over an 8 hz amplitude-gated click train (the percussive broadband),
 * clamped to full scale — the proven shape the hpss separation and the onset
 * detector both lock onto, small enough to keep the whole lane inside the
 * test timeout.
 */
function synthetictake(): Float32Array {
  const length = SAMPLE_RATE * SECONDS;
  const mono = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    const t = i / SAMPLE_RATE;
    const bass = 0.4 * Math.sign(Math.sin(2 * Math.PI * 110 * t));
    const gate = t % 0.5 < 0.02 ? 0.8 : 0;
    mono[i] = Math.max(-1, Math.min(1, bass * 0.7 + gate));
  }
  return mono;
}

/** Encodes the synthetic take as the wav bytes a visitor would upload. */
function takewav(): Uint8Array {
  return encodeWav([synthetictake()], { sampleRate: SAMPLE_RATE, bitDepth: 16 });
}

/** Crafts minimal mpeg1 layer-iii bytes: one valid frame header (128 kbps,
 * 44100 hz, mono) with an optional id3v2 tag in front — the probe only needs
 * the header to answer the format facts. */
function mp3bytes(withId3: boolean, total = 16001): Uint8Array {
  const tag = withId3 ? 20 : 0;
  const bytes = new Uint8Array(total);
  if (withId3) {
    // "ID3" v2.3, no flags, syncsafe size 10 — ten bytes of tag body follow
    bytes.set([0x49, 0x44, 0x33, 3, 0, 0, 0, 0, 0, 10], 0);
  }
  const at = tag;
  bytes[at] = 0xff;
  bytes[at + 1] = 0xfb; // sync 111 + mpeg1 (11) + layer iii (01) + no protection
  bytes[at + 2] = 0x90; // bitrate index 9 (128 kbps), rate index 0 (44100 hz)
  bytes[at + 3] = 0xc0; // channel mode 3 = mono
  return bytes;
}

/** Crafts a minimal two-page ogg vorbis container: the bos page carrying the
 * 30-byte identification header (2 channels, 44100 hz) and a closing page
 * whose granule position declares the duration. */
function oggbytes(durationSeconds: number, channels = 2, sampleRate = 44100): Uint8Array {
  const packet = new Uint8Array(30);
  packet.set([1, 118, 111, 114, 98, 105, 115], 0); // \x01vorbis
  const packetView = new DataView(packet.buffer);
  packetView.setUint32(7, 0, true); // version 0
  packet[11] = channels;
  packetView.setUint32(12, sampleRate, true);
  const page1Length = 27 + 1 + 30;
  const bytes = new Uint8Array(page1Length + 27);
  bytes.set([0x4f, 0x67, 0x67, 0x53], 0); // "OggS"
  bytes[4] = 0; // stream structure version 0
  bytes[5] = 0x02; // continued | bos | eos -> bos only
  bytes[26] = 1; // one segment in the table
  bytes[27] = 30; // the identification packet is one lacing value
  bytes.set(packet, 28);
  const view = new DataView(bytes.buffer);
  const page2 = page1Length;
  bytes.set([0x4f, 0x67, 0x67, 0x53], page2);
  const granule = Math.round(durationSeconds * sampleRate);
  view.setUint32(page2 + 6, granule % 4294967296, true);
  view.setUint32(page2 + 10, Math.floor(granule / 4294967296), true);
  bytes[page2 + 26] = 0; // a segment-less closing page
  return bytes;
}

describe("the container probe", () => {
  it("answers the wav facts of real encoded bytes (the exact walk)", () => {
    const probe = probesound(takewav());
    assert.equal(probe.format, "wav");
    assert.equal(probe.mime, "audio/wav");
    assert.equal(probe.sampleRate, SAMPLE_RATE);
    assert.equal(probe.channels, 1);
    assert.equal(probe.bitDepth, 16);
    assert.equal(probe.decodable, true);
    assert.ok(Math.abs((probe.durationSeconds ?? 0) - SECONDS) < 0.01);
    assert.match(probe.facts, /pcm 16-bit mono 8000 hz/);
  });

  it("answers the mp3 header facts with the cbr estimate", () => {
    const probe = probesound(mp3bytes(false));
    assert.equal(probe.format, "mp3");
    assert.equal(probe.mime, "audio/mpeg");
    assert.equal(probe.sampleRate, 44100);
    assert.equal(probe.channels, 1);
    assert.equal(probe.decodable, false);
    // 16001 bytes * 8 bits / 128 kbps = ~1.00 s — the labeled estimate
    assert.ok(Math.abs((probe.durationSeconds ?? 0) - 1.0) < 0.01);
    assert.match(probe.facts, /mpeg1 layer iii, 128 kbps, 44100 hz, mono/);
    assert.match(probe.facts, /cbr estimate/);
  });

  it("skips the id3v2 tag before the mp3 frame scan", () => {
    const probe = probesound(mp3bytes(true));
    assert.equal(probe.format, "mp3");
    assert.equal(probe.sampleRate, 44100);
    assert.match(probe.facts, /128 kbps/);
  });

  it("answers the ogg identification header and the granule-scan duration", () => {
    const probe = probesound(oggbytes(2));
    assert.equal(probe.format, "ogg");
    assert.equal(probe.mime, "audio/ogg");
    assert.equal(probe.sampleRate, 44100);
    assert.equal(probe.channels, 2);
    assert.equal(probe.decodable, false);
    assert.ok(Math.abs((probe.durationSeconds ?? 0) - 2) < 0.01);
    assert.match(probe.facts, /ogg vorbis, 2 channels, 44100 hz, 2\.00 s \(granule scan\)/);
  });

  it("answers the unknown refusal for bytes without container magic", () => {
    const probe = probesound(new Uint8Array(64));
    assert.equal(probe.format, "unknown");
    assert.equal(probe.decodable, false);
    assert.equal(probe.durationSeconds, null);
  });

  it("marks a broken riff as wav magic present but unwalkable", () => {
    const bytes = new Uint8Array(12);
    bytes.set([0x52, 0x49, 0x46, 0x46], 0); // "RIFF"
    bytes.set([0x57, 0x41, 0x56, 0x45], 8); // "WAVE"
    const probe = probesound(bytes);
    assert.equal(probe.format, "wav");
    assert.equal(probe.decodable, false);
    assert.match(probe.facts, /walk refused/);
  });
});

describe("the forward ingest payload (the wav lane)", () => {
  it("writes the structured payload with the track summary, the energy chunks, the beats and the embedded document", () => {
    const answer = ingestPayload(takewav(), { name: "saw click take.wav", at: PINNED_AT });
    assert.equal(answer.ok, true);
    if (!answer.ok) return;
    const payload = answer.payload;
    assert.equal(payload.schema, SOUND_PAYLOAD_SCHEMA_VERSION);
    assert.equal(payload.analysis, "full");
    assert.equal(payload.name, "saw click take");
    assert.equal(payload.ingestedAt, PINNED_AT);
    // the source block: identity + container facts
    assert.equal(payload.source.byteLength, takewav().length);
    assert.match(payload.source.sha256, /^[0-9a-f]{64}$/);
    assert.equal(payload.source.container.format, "wav");
    assert.equal(payload.source.container.decodable, true);
    // the track summary: the faixa numbers the charge names
    assert.ok(payload.track);
    assert.ok(Math.abs(payload.track.durationSeconds - SECONDS) < 0.01);
    assert.equal(payload.track.sampleRate, SAMPLE_RATE);
    assert.ok(payload.track.bpm > 0);
    assert.equal(typeof payload.track.key.tonic, "string");
    assert.equal(payload.track.stems.length, 2);
    assert.deepEqual(
      payload.track.stems.map((stem) => stem.role),
      ["harmonic", "percussive"],
    );
    assert.ok(payload.track.stems.every((stem) => stem.onsets >= 0 && stem.frames === SECONDS));
    assert.ok(payload.track.structureSections >= 1);
    // the energy chunks: ten per second, ascending ms
    const expectedChunks = (SECONDS * 1000) / ENERGY_CHUNK_MS;
    assert.equal(payload.energy.length, expectedChunks);
    assert.deepEqual(
      payload.energy.slice(0, 3).map((chunk: EnergyChunk) => chunk.ms),
      [0, ENERGY_CHUNK_MS, ENERGY_CHUNK_MS * 2],
    );
    assert.ok(payload.energy.every((chunk) => chunk.rms > 0));
    // the beats: the mix onsets beside the per-stem onset lists
    assert.ok(payload.beats);
    assert.equal(payload.beats.bpm, payload.track.bpm);
    assert.ok(payload.beats.onsetSeconds.length >= 1, "the gated clicks answer mix onsets");
    assert.ok(payload.beats.stems.some((stem) => stem.role === "percussive" && stem.onsetSeconds.length >= 1));
    // the embedded document: the v1 decomposition, one frame per second
    assert.ok(payload.document);
    assert.equal(payload.document.schema, INGEST_SCHEMA_VERSION);
    assert.equal(payload.document.segments.length, SECONDS);
    assert.equal(payload.document.sampleRate, SAMPLE_RATE);
  });

  it("is deterministic: the same bytes and options answer the same payload json", () => {
    const bytes = takewav();
    const first = ingestPayload(bytes, { name: "take.wav", at: PINNED_AT });
    const second = ingestPayload(bytes, { name: "take.wav", at: PINNED_AT });
    assert.equal(first.ok, true);
    assert.equal(second.ok, true);
    if (!first.ok || !second.ok) return;
    assert.equal(JSON.stringify(first.payload), JSON.stringify(second.payload));
  });

  it("clamps the analysis window while the container facts keep the full duration", () => {
    const answer = ingestPayload(takewav(), { name: "take.wav", at: PINNED_AT, maxDurationSeconds: 1 });
    assert.equal(answer.ok, true);
    if (!answer.ok) return;
    const payload = answer.payload;
    assert.ok(payload.track);
    assert.ok(Math.abs(payload.track.durationSeconds - 1) < 0.01);
    assert.ok(Math.abs((payload.source.container.durationSeconds ?? 0) - SECONDS) < 0.01);
    assert.equal(payload.energy.length, 1000 / ENERGY_CHUNK_MS);
  });

  it("answers the honest container-only payload for compressed bytes (zero fake vectors)", () => {
    const answer = ingestPayload(mp3bytes(false), { name: "song.mp3", at: PINNED_AT });
    assert.equal(answer.ok, true);
    if (!answer.ok) return;
    const payload = answer.payload;
    assert.equal(payload.analysis, "container-only");
    assert.equal(payload.track, null);
    assert.deepEqual(payload.energy, []);
    assert.equal(payload.beats, null);
    assert.equal(payload.document, null);
    assert.equal(payload.source.container.sampleRate, 44100);
    assert.equal(payload.source.container.format, "mp3");
    const ogg = ingestPayload(oggbytes(2), { name: "song.ogg", at: PINNED_AT });
    assert.equal(ogg.ok, true);
    if (ogg.ok) assert.equal(ogg.payload.analysis, "container-only");
  });

  it("refuses the unknown and unwalkable containers with the machine codes", () => {
    const unknown = ingestPayload(new Uint8Array(32), { name: "mystery.bin" });
    assert.equal(unknown.ok, false);
    if (!unknown.ok) assert.equal(unknown.code, "unknown-format");
    const broken = new Uint8Array(12);
    broken.set([0x52, 0x49, 0x46, 0x46], 0);
    broken.set([0x57, 0x41, 0x56, 0x45], 8);
    const unwalkable = ingestPayload(broken, { name: "broken.wav" });
    assert.equal(unwalkable.ok, false);
    if (!unwalkable.ok) assert.equal(unwalkable.code, "wav-unwalkable");
  });

  it("declares the sandbox modality of the lane (the sandbox, never the browser)", () => {
    assert.equal(PAYLOAD_LANE_MODALITY, "local");
  });
});

describe("the reverse ingest (the payload to wav reconstruction)", () => {
  /** The pinned full payload every reconstruction test rides. */
  const payloadof = (): SoundPayload => {
    const answer = ingestPayload(takewav(), { name: "saw click take.wav", at: PINNED_AT });
    if (!answer.ok) throw new Error(`the fixture ingest failed: ${answer.code}`);
    return answer.payload;
  };

  it("reconstructs real wav bytes that parse back through two independent readers", () => {
    const result = reconstructWav(payloadof());
    assert.equal(result.ok, true);
    if (!result.ok) return;
    const { bytes, sampleRate, durationSeconds, mime } = result.reconstruction;
    assert.equal(mime, "audio/wav");
    assert.equal(sampleRate, SAMPLE_RATE);
    assert.equal(durationSeconds, SECONDS);
    // the writer's own reader
    const writerinfo = wavInfo(bytes);
    assert.equal(writerinfo.sampleRate, SAMPLE_RATE);
    assert.equal(writerinfo.channels, 1);
    assert.equal(writerinfo.bitDepth, 16);
    assert.equal(writerinfo.frames, SAMPLE_RATE * SECONDS);
    // the decoder's independent reader (audioformat.ts)
    const decoderinfo = wavinfo(bytes);
    assert.equal(decoderinfo.frames, writerinfo.frames);
    assert.ok(Math.abs(decoderinfo.durationSeconds - SECONDS) < 0.01);
  });

  it("is non-silent and carries energy across the seconds (the playable proof)", () => {
    const result = reconstructWav(payloadof());
    assert.equal(result.ok, true);
    if (!result.ok) return;
    const info = wavinfo(result.reconstruction.bytes);
    assert.ok(info.frames > 0);
    // the loudness of the rebuild: the per-second fidelity says the frames and
    // the synthesis stay in the same neighborhood — measured, never claimed
    const { fidelity } = result.reconstruction;
    assert.ok(fidelity.meanRmsError >= 0);
    assert.ok(fidelity.worstRmsError >= fidelity.meanRmsError);
    assert.ok(fidelity.meanRmsError < 0.25, `the mean rms gap ${fidelity.meanRmsError} leaves the neighborhood`);
  });

  it("is deterministic: the same payload answers the same bytes", () => {
    const payload = payloadof();
    const first = reconstructWav(payload);
    const second = reconstructWav(payload);
    assert.equal(first.ok, true);
    assert.equal(second.ok, true);
    if (!first.ok || !second.ok) return;
    assert.deepEqual(Array.from(first.reconstruction.bytes), Array.from(second.reconstruction.bytes));
    assert.equal(first.reconstruction.pcmhash, second.reconstruction.pcmhash);
  });

  it("is honest vector synthesis: the rebuild hash differs from the source hash", () => {
    const payload = payloadof();
    const result = reconstructWav(payload);
    assert.equal(result.ok, true);
    if (!result.ok || !payload.track) return;
    // the payload hash is the identity of the source; the synthesis answers
    // its own — a copy would be a re-encode claim, the ban the corpus pins
    assert.notEqual(result.reconstruction.pcmhash, payload.track.pcmhash);
  });

  it("round trips: the reconstructed wav ingests back as a full payload", () => {
    const result = reconstructWav(payloadof());
    assert.equal(result.ok, true);
    if (!result.ok) return;
    const again = ingestPayload(result.reconstruction.bytes, { name: "rebuild.wav", at: PINNED_AT });
    assert.equal(again.ok, true);
    if (!again.ok) return;
    assert.equal(again.payload.analysis, "full");
    assert.ok(Math.abs((again.payload.track?.durationSeconds ?? 0) - SECONDS) < 0.01);
    assert.equal(again.payload.source.container.format, "wav");
    assert.equal(again.payload.document?.segments.length, SECONDS);
  });

  it("refuses the container-only payload, the foreign schema and the depth the writer never writes", () => {
    const compressed = ingestPayload(mp3bytes(false), { name: "song.mp3", at: PINNED_AT });
    assert.equal(compressed.ok, true);
    if (compressed.ok) {
      const refused = reconstructWav(compressed.payload);
      assert.equal(refused.ok, false);
      if (!refused.ok) assert.equal(refused.code, "container-only");
    }
    const payload = payloadof();
    const foreign = reconstructWav({ ...payload, schema: "debonair.foreign/9" });
    assert.equal(foreign.ok, false);
    if (!foreign.ok) assert.equal(foreign.code, "bad-schema");
    const baddepth = reconstructWav(payload, { bitDepth: 8 as never });
    assert.equal(baddepth.ok, false);
    if (!baddepth.ok) assert.equal(baddepth.code, "encode-refused");
  });

  it("answers the pcm24 depth when the caller asks for it", () => {
    const result = reconstructWav(payloadof(), { bitDepth: 24 });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(wavInfo(result.reconstruction.bytes).bitDepth, 24);
  });
});
