// # fingerprint.test — the audio identity domain: the constellation is
// deterministic, the landmarks fold into stable 32-bit hashes, the db
// answers the right track by votes and stays null on an empty index.
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { FingerprintDB, fingerprintOf, landmarksOf, peaksOfFrame } from "../fingerprint.ts";
import { frameSpectrum } from "../spectrum.ts";

/** Builds a deterministic tone mixture the tests analyze. */
function tone(seedHz: number, seconds: number, sampleRate = 44100): number[] {
  const out: number[] = [];
  for (let i = 0; i < seconds * sampleRate; i++) {
    const t = i / sampleRate;
    out.push(0.5 * Math.sin(2 * Math.PI * seedHz * t) + 0.25 * Math.sin(2 * Math.PI * (seedHz * 2) * t));
  }
  return out;
}

describe("fingerprint — constellation", () => {
  it("picks at most one peak per band and keeps them in-band", () => {
    const sine = tone(220, 0.1);
    const frame = frameSpectrum(sine.slice(0, 4096));
    const peaks = peaksOfFrame(frame, 0);
    assert.ok(peaks.length >= 1 && peaks.length <= 5);
    for (const peak of peaks) assert.ok(peak.bin > 0 && peak.bin < frame.magnitudes.length);
  });

  it("answers identical landmarks for identical audio", () => {
    const a = fingerprintOf(tone(330, 0.5), 44100);
    const b = fingerprintOf(tone(330, 0.5), 44100);
    assert.deepEqual(a, b);
  });

  it("folds pair lags into the hash without collisions on distinct pairs", () => {
    const landmarks = landmarksOf([
      { frame: 0, bin: 10 },
      { frame: 4, bin: 40 },
      { frame: 8, bin: 90 },
    ]);
    const hashes = new Set(landmarks.map((l) => l.hash));
    assert.equal(hashes.size, landmarks.length);
  });
});

describe("fingerprint — FingerprintDB", () => {
  it("identifies the registered track by votes", () => {
    const db = new FingerprintDB();
    const track = fingerprintOf(tone(294, 0.6), 44100);
    db.add("track-a", track);
    const match = db.search(fingerprintOf(tone(294, 0.6), 44100));
    assert.equal(match.trackId, "track-a");
    assert.ok(match.score > 0);
  });

  it("answers a null track on an empty db", () => {
    const db = new FingerprintDB();
    const match = db.search(fingerprintOf(tone(294, 0.4), 44100));
    assert.equal(match.trackId, null);
    assert.equal(match.score, 0);
  });
});
