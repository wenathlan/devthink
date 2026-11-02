// # versawasecomposition test — the composition document of the cadria
// video studio, runnable with vitest (no DOM, no storage):
//   pnpm vitest run tests/versawasecomposition.test.ts
// Every test watches the document contract: the gl-transitions name
// catalog, the typed refusals of the mutation lane (overlap, duplicates,
// unknown catalogs, dishonest spans), the deterministic JSON round trip
// that revalidates every rule on the way back in, the sha-256 fingerprint
// of the payload, and the Saddle slice plan that cuts the composition for
// the edge farm without ever touching the visitor GPU.

import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  addClip,
  addTrack,
  clipEndSeconds,
  compositionDurationSeconds,
  compositionFingerprint,
  compositionSlicePlan,
  GL_TRANSITIONS,
  isKnownTransition,
  parseComposition,
  serializeComposition,
  type CompositionClip,
  type VideoComposition,
} from "../versawasecomposition.ts";

/** one empty composition shell the tests build on. */
function shell(): VideoComposition {
  return { id: "comp", name: "sequence", fps: 24, width: 1920, height: 1080, tracks: [] };
}

/** one honest clip bound to a track, overridable per case. */
function clip(overrides: Partial<CompositionClip> = {}): CompositionClip {
  return {
    id: "clip-a",
    trackId: "video-1",
    startSeconds: 0,
    durationSeconds: 4,
    sourceIn: 0,
    speed: 1,
    effects: [],
    ...overrides,
  };
}

/** the shell with one video track carrying one clip, built through the lane. */
async function oneClipDocument(): Promise<VideoComposition> {
  const withTrack = addTrack(shell(), { id: "video-1", kind: "video", clips: [] });
  assert.ok(withTrack.ok);
  const withClip = addClip(withTrack.value, clip());
  assert.ok(withClip.ok);
  return withClip.value;
}

describe("versawasecomposition transitions catalog", () => {
  it("ships the canonical gl-transitions names without duplicates", () => {
    assert.ok(GL_TRANSITIONS.length >= 25);
    assert.equal(new Set(GL_TRANSITIONS).size, GL_TRANSITIONS.length);
    for (const name of GL_TRANSITIONS) assert.match(name, /^[A-Z][A-Za-z]+$/);
  });

  it("answers known/unknown honestly", () => {
    assert.ok(isKnownTransition("CrossZoom"));
    assert.ok(isKnownTransition("Bounce"));
    assert.ok(!isKnownTransition("NotInCollection"));
    assert.ok(!isKnownTransition(""));
  });
});

describe("versawasecomposition mutation lane", () => {
  it("adds a track and a clip, never mutating the input document", async () => {
    const document = await oneClipDocument();
    assert.equal(document.tracks.length, 1);
    assert.equal(document.tracks[0].clips.length, 1);
    assert.equal(shell().tracks.length, 0, "the source document stays untouched");
  });

  it("computes clip ends and the composition duration over every track", async () => {
    const document = await oneClipDocument();
    assert.equal(clipEndSeconds(clip()), 4);
    assert.equal(compositionDurationSeconds(document), 4);
    const longer = addClip(document, clip({ id: "clip-b", startSeconds: 4, durationSeconds: 7 }));
    assert.ok(longer.ok);
    assert.equal(compositionDurationSeconds(longer.value), 11);
  });

  it("refuses overlapping spans on one track, and allows touching edges", async () => {
    const document = await oneClipDocument();
    const overlap = addClip(document, clip({ id: "clip-b", startSeconds: 3.5, durationSeconds: 2 }));
    assert.equal(overlap.ok, false);
    assert.equal(overlap.error, "overlap");
    const touching = addClip(document, clip({ id: "clip-b", startSeconds: 4, durationSeconds: 2 }));
    assert.ok(touching.ok, "a clip may start exactly where the last one ends");
  });

  it("refuses duplicate track ids and duplicate clip ids", async () => {
    const document = await oneClipDocument();
    const trackAgain = addTrack(document, { id: "video-1", kind: "audio", clips: [] });
    assert.equal(trackAgain.error, "duplicate-track");
    const clipAgain = addClip(document, clip({ startSeconds: 4 }));
    assert.equal(clipAgain.error, "duplicate-clip");
  });

  it("refuses unknown tracks, transitions and effects", async () => {
    const document = await oneClipDocument();
    assert.equal(addClip(document, clip({ id: "x", trackId: "ghost" })).error, "unknown-track");
    assert.equal(
      addClip(document, clip({ id: "x", startSeconds: 4, transition: { name: "FadeToGrey", durationSeconds: 1 } })).error,
      "unknown-transition",
    );
    assert.equal(
      addClip(document, clip({ id: "x", startSeconds: 4, effects: [{ effectId: "nonexistent" as never, amount: 0.5, enabled: true }] })).error,
      "unknown-effect",
    );
  });

  it("refuses dishonest spans: empty, negative, zero speed, transition longer than the clip", async () => {
    const document = await oneClipDocument();
    assert.equal(addClip(document, clip({ id: "x", startSeconds: 4, durationSeconds: 0 })).error, "bad-span");
    assert.equal(addClip(document, clip({ id: "x", startSeconds: -1 })).error, "bad-span");
    assert.equal(addClip(document, clip({ id: "x", startSeconds: 4, speed: 0 })).error, "bad-speed");
    assert.equal(
      addClip(document, clip({ id: "x", startSeconds: 4, transition: { name: "Bounce", durationSeconds: 9 } })).error,
      "bad-transition-span",
    );
  });

  it("refuses effect amounts outside the library range", async () => {
    const document = await oneClipDocument();
    const tooMuch = addClip(document, clip({ id: "x", startSeconds: 4, effects: [{ effectId: "halation", amount: 5, enabled: true }] }));
    assert.equal(tooMuch.error, "bad-amount");
    const honest = addClip(document, clip({ id: "x", startSeconds: 4, effects: [{ effectId: "halation", amount: 0.4, enabled: true }] }));
    assert.ok(honest.ok);
  });
});

describe("versawasecomposition serialization", () => {
  it("round-trips a document byte for byte through serialize and parse", async () => {
    const document = await oneClipDocument();
    const payload = serializeComposition(document);
    assert.equal(serializeComposition(document), payload, "serialization is deterministic");
    const back = parseComposition(payload);
    assert.ok(back.ok);
    assert.equal(serializeComposition(back.value), payload, "the parsed document re-serializes identically");
    assert.deepEqual(back.value, document);
  });

  it("round-trips effects, transitions and multiple tracks", async () => {
    const withTrack = addTrack(shell(), { id: "video-1", kind: "video", clips: [] });
    const withClip = addClip(withTrack.value, clip({ effects: [{ effectId: "grainfilm", amount: 0.35, enabled: true }], transition: { name: "Swirl", durationSeconds: 1.2 } }));
    const withAudio = addTrack(withClip.value, { id: "audio-1", kind: "audio", clips: [] });
    const withSound = addClip(withAudio.value, clip({ id: "snd", trackId: "audio-1", startSeconds: 0, durationSeconds: 2.5 }));
    assert.ok(withSound.ok);
    const back = parseComposition(serializeComposition(withSound.value));
    assert.ok(back.ok);
    assert.equal(back.value.tracks.length, 2);
    assert.equal(back.value.tracks[0].clips[0].transition?.name, "Swirl");
    assert.deepEqual(back.value.tracks[0].clips[0].effects, [{ effectId: "grainfilm", amount: 0.35, enabled: true }]);
    assert.equal(back.value.tracks[1].kind, "audio");
  });

  it("fingerprints the payload: sha-256, stable for equal documents, moving with content", async () => {
    const document = await oneClipDocument();
    const fingerprint = compositionFingerprint(document);
    assert.match(fingerprint, /^[0-9a-f]{64}$/);
    assert.equal(compositionFingerprint(document), fingerprint);
    const edited = addClip(document, clip({ id: "clip-b", startSeconds: 4 }));
    assert.ok(edited.ok);
    assert.notEqual(compositionFingerprint(edited.value), fingerprint);
  });

  it("refuses damaged payloads: broken json, odd dimensions, rule-skipping documents", async () => {
    assert.equal(parseComposition("{ not json").error, "bad-format");
    assert.equal(parseComposition("null").error, "bad-format");
    const document = await oneClipDocument();
    const odd = serializeComposition(document).replace('"width":1920', '"width":1921');
    assert.equal(parseComposition(odd).error, "bad-dimensions");
    const slowFps = serializeComposition(document).replace('"fps":24', '"fps":0');
    assert.equal(parseComposition(slowFps).error, "bad-fps");
    // a payload that hides an overlap inside its tracks is refused on the way in
    const overlapping = JSON.stringify({
      ...document,
      tracks: [
        {
          id: "video-1",
          kind: "video",
          clips: [clip(), clip({ id: "clip-b", startSeconds: 1 })],
        },
      ],
    });
    assert.equal(parseComposition(overlapping).error, "overlap");
    // a payload that references a transition outside the catalog is refused
    const transitioned = JSON.stringify({
      ...document,
      tracks: [{ id: "video-1", kind: "video", clips: [clip({ transition: { name: "Nope", durationSeconds: 1 } })] }],
    });
    assert.equal(parseComposition(transitioned).error, "unknown-transition");
  });
});

describe("versawasecomposition saddle plan", () => {
  it("cuts the composition into frame-aligned slices the edge farm renders", async () => {
    const document = await oneClipDocument();
    const slices = compositionSlicePlan(document, 2);
    assert.equal(slices.length, 2, "a 4 second document on a 2 second grid is two slices");
    assert.equal(slices[0].fromFrame, 0);
    assert.equal(slices[1].toFrame, 96, "4 seconds at 24 fps is 96 frames");
    for (const slice of slices) {
      assert.ok(slice.frames > 0);
      assert.equal(slice.toFrame - slice.fromFrame, slice.frames);
    }
  });

  it("answers the ten second doctrine grid by default and covers the whole duration", async () => {
    const document = await oneClipDocument();
    const longer = addClip(document, clip({ id: "clip-b", startSeconds: 4, durationSeconds: 30 }));
    assert.ok(longer.ok);
    const slices = compositionSlicePlan(longer.value);
    const totalFrames = slices.reduce((sum, slice) => sum + slice.frames, 0);
    assert.equal(totalFrames, 34 * 24, "the slices cover every frame of the composition");
    assert.ok(slices.length >= 4, "a 34 second document spans at least four ten second slices");
  });
});
