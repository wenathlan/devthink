// # audiodecode.test — honest unit tests for the pcm decode layer, runnable with
// the node built-in runner (no install, no dependencies):
//   node --test tests/audiodecode.test.ts
// Every fixture is synthesized below: riff/wave bytes built by hand (sine, stereo,
// odd chunk orders, float32, truncated tails) — no binary files on disk.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AudioDecodeError,
  type AudioFrames,
  decodeWav,
  downmix,
  fromAudioBufferLike,
  normalizePeak,
  resample,
  wavinfo,
} from "../audiodecode.ts";

/** little-endian u16 / u32 byte arrays. */
const le16 = (value: number): number[] => [value & 0xff, (value >>> 8) & 0xff];
const le32 = (value: number): number[] => [
  value & 0xff,
  (value >>> 8) & 0xff,
  (value >>> 16) & 0xff,
  (value >>> 24) & 0xff,
];

/** the ascii bytes of a chunk id. */
const ascii = (text: string): number[] => [...text].map((char) => char.charCodeAt(0));

/** one riff chunk: id, size, body, pad byte when the body is odd-sized. */
const chunk = (id: string, body: number[]): number[] => [
  ...ascii(id),
  ...le32(body.length),
  ...body,
  ...(body.length & 1 ? [0] : []),
];

/** a fmt chunk body (tag 1 = pcm, 3 = ieee float, 0xfffe = extensible). */
const fmt = (channels: number, sampleRate: number, bits: number, tag = 1): number[] => {
  const align = channels * (bits >> 3);
  return [
    ...le16(tag),
    ...le16(channels),
    ...le32(sampleRate),
    ...le32(sampleRate * align),
    ...le16(align),
    ...le16(bits),
  ];
};

/** a full riff/wave file from its chunks. */
const wav = (...chunks: number[][]): Uint8Array => {
  const body = [...ascii("WAVE"), ...chunks.flat()];
  return Uint8Array.from([...ascii("RIFF"), ...le32(4 + body.length), ...body]);
};

/** signed little-endian integer sample payloads. */
const pcm16 = (values: number[]): number[] => values.flatMap((value) => le16(value < 0 ? value + 65536 : value));
const pcm24 = (values: number[]): number[] =>
  values.flatMap((value) => [value & 0xff, (value >> 8) & 0xff, (value >> 16) & 0xff]);
const pcm32 = (values: number[]): number[] => values.flatMap((value) => le32(value < 0 ? value + 4294967296 : value));

/** float32 little-endian samples. */
const f32 = (values: number[]): number[] => {
  const view = new DataView(new ArrayBuffer(4));
  return values.flatMap((value) => {
    view.setFloat32(0, value, true);
    return [...new Uint8Array(view.buffer)];
  });
};

/** a deterministic sine in sample values. */
const sine = (frames: number, frequency: number, rate: number, amplitude = 0.8): number[] =>
  Array.from({ length: frames }, (_, index) => amplitude * Math.sin((2 * Math.PI * frequency * index) / rate));

/** pcm16 sine rounded into the container — the workhorse mono fixture (0.1 s at 48000). */
const quantize = (values: number[], span: number): number[] => values.map((value) => Math.round(value * span));
const sineFile = (): Uint8Array =>
  wav(chunk("fmt ", fmt(1, 48000, 16)), chunk("data", pcm16(quantize(sine(4800, 440, 48000), 32767))));

/** stereo interleaver for two sample arrays. */
const zip = (left: number[], right: number[]): number[] =>
  left.flatMap((value, index) => [...le16(value), ...le16(right[index])]);

/** builds AudioFrames by hand for the pure dsp helpers. */
const framesOf = (sampleRate: number, samples: number[]): AudioFrames => ({
  sampleRate,
  channels: 1,
  length: samples.length,
  samples: Float32Array.from(samples),
});

/** runs a thunk and answers its AudioDecodeError code (or "no-throw"). */
const codeOf = (run: () => unknown): string => {
  try {
    run();
  } catch (error) {
    return error instanceof AudioDecodeError ? error.code : "";
  }
  return "no-throw";
};

describe("audiodecode wav walk", () => {
  it("answers the header without decoding samples", () => {
    const info = wavinfo(wav(chunk("fmt ", fmt(2, 44100, 16)), chunk("data", pcm16([0, 0, 0, 0]))));
    assert.deepEqual(
      [info.sampleRate, info.channels, info.bitDepth, info.isFloat, info.frames],
      [44100, 2, 16, false, 2],
    );
    assert.equal(info.durationSeconds, 2 / 44100);
  });

  it("decodes 8-bit pcm centered at 128", () => {
    const bytes = wav(chunk("fmt ", fmt(1, 8000, 8)), chunk("data", [128, 255, 0, 64]));
    assert.deepEqual([...decodeWav(bytes, { targetSampleRate: 8000 }).samples], [0, 127 / 128, -1, -0.5]);
  });

  it("decodes 16-bit pcm including negative full scale", () => {
    const bytes = wav(chunk("fmt ", fmt(1, 8000, 16)), chunk("data", pcm16([0, 16384, -32768, 32767])));
    assert.deepEqual([...decodeWav(bytes, { targetSampleRate: 8000 }).samples], [0, 0.5, -1, 32767 / 32768]);
  });

  it("decodes 24-bit pcm with sign extension", () => {
    const bytes = wav(chunk("fmt ", fmt(1, 8000, 24)), chunk("data", pcm24([0, 8388607, -8388608, 4194304])));
    assert.deepEqual([...decodeWav(bytes, { targetSampleRate: 8000 }).samples], [0, 8388607 / 8388608, -1, 0.5]);
  });

  it("decodes 32-bit pcm", () => {
    const samples = [
      ...decodeWav(
        wav(chunk("fmt ", fmt(1, 8000, 32)), chunk("data", pcm32([0, 2147483647, -2147483648, 1073741824]))),
        { targetSampleRate: 8000 },
      ).samples,
    ];
    assert.ok(Math.abs(samples[1] - 2147483647 / 2147483648) < 1e-6); // float32 storage rounds onto full scale
    assert.deepEqual([samples[0], samples[2], samples[3]], [0, -1, 0.5]);
  });

  it("decodes ieee float32 and keeps over-range values", () => {
    const bytes = wav(chunk("fmt ", fmt(1, 8000, 32, 3)), chunk("data", f32([0, 0.25, -0.5, 2])));
    assert.deepEqual([...decodeWav(bytes, { targetSampleRate: 8000 }).samples], [0, 0.25, -0.5, 2]);
    assert.equal(wavinfo(bytes).isFloat, true);
  });

  it("reads wave-format-extensible by its subformat guid", () => {
    const body = [
      ...fmt(1, 48000, 24),
      ...le16(22),
      ...le16(24),
      ...le32(3),
      ...[1, 0, 0, 0, 0, 0, 16, 0, 128, 0, 0, 170, 0, 56, 155, 113],
    ];
    const bytes = wav(chunk("fmt ", body), chunk("data", pcm24([0, 8388607, -8388608])));
    const frames = decodeWav(bytes, { targetSampleRate: 48000 });
    assert.equal(frames.length, 3);
    assert.equal(frames.samples[2], -1);
  });

  it("walks chunks in any order and eats pad bytes", () => {
    const data = chunk("data", pcm16(quantize(sine(48, 440, 48000), 32767)));
    const bytes = wav(chunk("JUNK", [1, 2, 3]), data, chunk("LIST", [1, 2, 3, 4, 5]), chunk("fmt ", fmt(1, 48000, 16)));
    const frames = decodeWav(bytes, { targetSampleRate: 48000 });
    assert.deepEqual([frames.length, frames.sampleRate], [48, 48000]);
  });

  it("keeps interleaved channel order when mono is off", () => {
    const bytes = wav(chunk("fmt ", fmt(2, 48000, 16)), chunk("data", pcm16([8192, -8192, 4096, -4096])));
    const frames = decodeWav(bytes, { targetSampleRate: 48000, mono: false });
    assert.deepEqual([frames.channels, frames.length], [2, 2]);
    assert.deepEqual([...frames.samples], [0.25, -0.25, 0.125, -0.125]);
  });

  it("decodes deterministically — same bytes, same frames", () => {
    const bytes = sineFile();
    assert.deepEqual([...decodeWav(bytes).samples], [...decodeWav(bytes).samples]);
    assert.equal(decodeWav(bytes).length, 4800);
  });
});

describe("audiodecode downmix", () => {
  it("averages two different sines into one mono channel", () => {
    const bytes = wav(
      chunk("fmt ", fmt(2, 48000, 16)),
      chunk("data", zip(quantize(sine(64, 440, 48000), 16384), quantize(sine(64, 880, 48000), 8192))),
    );
    const stereo = decodeWav(bytes, { mono: false });
    const mono = decodeWav(bytes, { mono: true });
    assert.equal(mono.channels, 1);
    assert.equal(mono.length, 64);
    const average = (index: number): number => (stereo.samples[2 * index] + stereo.samples[2 * index + 1]) / 2;
    assert.deepEqual(
      [...mono.samples],
      Array.from({ length: 64 }, (_, index) => average(index)),
    );
  });

  it("averaging identical channels keeps the sine bit-exact", () => {
    const wave = quantize(sine(48, 440, 48000), 16384);
    const stereo = wav(chunk("fmt ", fmt(2, 48000, 16)), chunk("data", zip(wave, wave)));
    const mono = wav(chunk("fmt ", fmt(1, 48000, 16)), chunk("data", pcm16(wave)));
    assert.deepEqual([...decodeWav(stereo).samples], [...decodeWav(mono).samples]);
  });

  it("clips only when a float source already passes full scale", () => {
    assert.deepEqual(
      [...downmix({ sampleRate: 8000, channels: 2, length: 1, samples: Float32Array.from([2, -3]) }).samples],
      [-0.5],
    );
    assert.deepEqual(
      [...downmix({ sampleRate: 8000, channels: 2, length: 1, samples: Float32Array.from([2, 3]) }).samples],
      [1],
    );
    const mono = framesOf(8000, [0.5]);
    assert.equal(downmix(mono), mono);
  });
});

describe("audiodecode resample", () => {
  it("keeps the same object when the rates match", () => {
    const source = framesOf(48000, [0, 0.5, -0.5, 1]);
    assert.equal(resample(source, 48000), source);
    const decoded = decodeWav(sineFile());
    assert.equal(decoded.sampleRate, 48000);
    assert.equal(decoded.length, 4800);
  });

  it("downsamples by an exact ratio picking every other sample", () => {
    const half = resample(framesOf(48000, [0, 0.5, 1, 0.5, 0, -0.5]), 24000);
    assert.equal(half.sampleRate, 24000);
    assert.equal(half.length, 3);
    assert.deepEqual([...half.samples], [0, 1, 0]);
  });

  it("interpolates halfway points when upsampling and holds the tail", () => {
    const up = resample(framesOf(1000, [0, 1]), 2000);
    assert.equal(up.length, 4);
    assert.deepEqual([...up.samples], [0, 0.5, 1, 1]);
  });

  it("resamples inside decodeWav with ratio length math", () => {
    const frames = decodeWav(sineFile(), { targetSampleRate: 22050 });
    assert.equal(frames.sampleRate, 22050);
    assert.equal(frames.length, 2205); // floor(4800 * 22050 / 48000)
  });

  it("resamples stereo per channel without bleeding", () => {
    const source: AudioFrames = {
      sampleRate: 48000,
      channels: 2,
      length: 4,
      samples: Float32Array.from([0, 1, 0.5, 0.25, 1, 0, 0.25, 0.5]),
    };
    const half = resample(source, 24000);
    assert.equal(half.channels, 2);
    assert.deepEqual([...half.samples], [0, 1, 1, 0]);
  });

  it("clamps duration at the source rate before resampling", () => {
    const bytes = wav(chunk("fmt ", fmt(1, 24000, 16)), chunk("data", pcm16(quantize(sine(2400, 440, 24000), 32767))));
    const head = decodeWav(bytes, { maxDurationSeconds: 0.03125 }); // 2^-5 s → 750 source frames → 1500 at 48000
    assert.equal(head.length, 1500);
    const full = decodeWav(bytes);
    // the body matches sample for sample; only the clamped tail differs, because
    // the head holds its last source sample where the full file interpolates on
    assert.deepEqual([...head.samples.slice(0, 1499)], [...full.samples.slice(0, 1499)]);
    assert.equal(head.samples[1499], full.samples[1498]);
    assert.equal(decodeWav(bytes, { maxDurationSeconds: 0.00001 }).length, 0); // below one frame
  });
});

describe("audiodecode normalize", () => {
  it("lifts the loudest sample to the ceiling and bounds the rest", () => {
    const normalized = normalizePeak(framesOf(8000, [0.1, -0.2, 0.25, 0]), 0.98);
    assert.ok(Math.abs(normalized.samples[2] - 0.98) < 1e-6 && Math.abs(normalized.samples[1] + 0.784) < 1e-6); // float32 lands
    assert.ok([...normalized.samples].every((sample) => Math.abs(sample) <= 0.98 + 1e-6));
  });

  it("attenuates hot input and leaves silence or matched peaks untouched", () => {
    const hot = normalizePeak(framesOf(8000, [1, -1, 0]));
    assert.ok(Math.abs(hot.samples[0] - 0.98) < 1e-6 && Math.abs(hot.samples[1] + 0.98) < 1e-6 && hot.samples[2] === 0);
    const silence = framesOf(8000, [0, 0, 0]);
    assert.equal(normalizePeak(silence), silence);
    const full = framesOf(8000, [1, -0.5, 0]);
    assert.equal(normalizePeak(full, 1), full); // peak already on the ceiling → same object
  });
});

describe("audiodecode errors", () => {
  it("rejects non-riff bytes, non-wave riff containers and undersized files", () => {
    assert.equal(
      codeOf(() => decodeWav(Uint8Array.from([...ascii("OggS"), ...new Array<number>(20).fill(0)]))),
      "wav-not-riff",
    );
    assert.equal(
      codeOf(() => decodeWav(Uint8Array.from([...ascii("RIFF"), ...le32(4), ...ascii("ACON")]))),
      "wav-not-wave",
    );
    assert.equal(
      codeOf(() => decodeWav(new Uint8Array(11))),
      "wav-too-small",
    );
  });

  it("rejects truncation at the payload and at a chunk header", () => {
    const bytes = sineFile();
    assert.equal(
      codeOf(() => decodeWav(bytes.slice(0, bytes.byteLength - 40))),
      "wav-truncated",
    );
    const header = Uint8Array.from([...ascii("RIFF"), ...le32(100), ...ascii("WAVE"), ...ascii("fmt "), ...le32(999)]);
    assert.equal(
      codeOf(() => decodeWav(header)),
      "wav-truncated",
    );
  });

  it("rejects empty data and missing chunks", () => {
    assert.equal(
      codeOf(() => decodeWav(wav(chunk("fmt ", fmt(1, 48000, 16)), chunk("data", [])))),
      "wav-empty-data",
    );
    assert.equal(
      codeOf(() => decodeWav(wav(chunk("data", pcm16([0, 0]))))),
      "wav-missing-fmt",
    );
    assert.equal(
      codeOf(() => decodeWav(wav(chunk("fmt ", fmt(1, 48000, 16))))),
      "wav-missing-data",
    );
  });

  it("rejects unsupported format tags and bit depths", () => {
    assert.equal(
      codeOf(() => decodeWav(wav(chunk("fmt ", fmt(1, 48000, 16, 6)), chunk("data", [0, 0])))),
      "wav-unsupported-format",
    );
    assert.equal(
      codeOf(() => decodeWav(wav(chunk("fmt ", fmt(1, 48000, 12)), chunk("data", [0, 0])))),
      "wav-unsupported-bit-depth",
    );
    assert.equal(
      codeOf(() => decodeWav(wav(chunk("fmt ", fmt(1, 48000, 64, 3)), chunk("data", f32([0, 1]))))),
      "wav-unsupported-bit-depth",
    );
  });

  it("rejects decode options that make no sense", () => {
    assert.equal(
      codeOf(() => decodeWav(sineFile(), { targetSampleRate: 0 })),
      "decode-bad-target-rate",
    );
    assert.equal(
      codeOf(() => decodeWav(sineFile(), { maxDurationSeconds: -1 })),
      "decode-bad-max-duration",
    );
    assert.equal(
      codeOf(() => resample(framesOf(8000, [1]), Number.NaN)),
      "decode-bad-target-rate",
    );
    assert.equal(
      codeOf(() => normalizePeak(framesOf(8000, [1]), 0)),
      "decode-bad-ceiling",
    );
  });
});

describe("audiodecode browser bridge", () => {
  it("maps channel arrays onto the interleaved contract with a copy", () => {
    const left = Float32Array.from([0.5, 0.25]);
    const right = Float32Array.from([-0.5, -0.25]);
    const frames = fromAudioBufferLike({ sampleRate: 44100, channelData: [left, right] });
    assert.equal(frames.sampleRate, 44100);
    assert.equal(frames.channels, 2);
    assert.equal(frames.length, 2);
    assert.deepEqual([...frames.samples], [0.5, -0.5, 0.25, -0.25]);
    left[0] = 9; // the browser hands out live views — the contract copied its bytes
    assert.equal(frames.samples[0], 0.5);
  });

  it("runs the whole downstream chain on a browser buffer", () => {
    const frames = fromAudioBufferLike({ sampleRate: 48000, channelData: [Float32Array.from(sine(4800, 440, 48000))] });
    const chain = normalizePeak(resample(downmix(frames), 24000));
    assert.equal(chain.sampleRate, 24000);
    assert.equal(chain.channels, 1);
    assert.equal(chain.length, 2400);
    assert.ok(Math.abs(Math.max(...[...chain.samples].map(Math.abs)) - 0.98) < 1e-6);
  });

  it("rejects browser buffers that make no audio", () => {
    assert.equal(
      codeOf(() => fromAudioBufferLike({ sampleRate: 0, channelData: [Float32Array.of(0)] })),
      "decode-bad-sample-rate",
    );
    assert.equal(
      codeOf(() => fromAudioBufferLike({ sampleRate: 48000, channelData: [] })),
      "decode-no-channels",
    );
    assert.equal(
      codeOf(() =>
        fromAudioBufferLike({ sampleRate: 48000, channelData: [Float32Array.of(0), Float32Array.of(1, 2)] }),
      ),
      "decode-uneven-channels",
    );
  });
});
