// # patternenums.test — the pattern vocabulary and the payload contract: the
// enum tables pin their sizes and shapes (the forty-eight scales, the twelve
// roots, the voices, the lanes, the genres, the codes), the validators
// answer ok on the honest documents and every machine code on its broken
// one, the clamps hold (vel, dur, the lane binarization, the 0..1 frame
// fields), the canonical serializer answers the same bytes for the same
// document whatever key order it arrives in, the round trip returns the
// document, and the llm bridge teaches every token the tables carry and
// surfaces the honest codes when the model drifts. runnable with vitest:
//   pnpm test
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { GENRES } from "../genrematrix.ts";
import { NOTE_NAMES as INGEST_NOTE_NAMES } from "../ingest.ts";
import { SCALE_STEPS } from "../musictheory.ts";
import {
  BAND_LABELS,
  CHROMA_DIM,
  DRUM_LANE_KEYS,
  EMBEDDING_DIM,
  EVENT_KINDS,
  LANE_STEPS,
  NOTE_NAMES,
  PATTERN_ERROR_CODES,
  PATTERN_GENRE_KEYS,
  PATTERN_LIMITS,
  PATTERN_PROJECT_ERROR_CODES,
  PATTERN_SCALE_ALIASES,
  PATTERN_SCALE_NAMES,
  PATTERN_SCALES,
  PATTERN_SCHEMA_VERSION,
  PATTERN_TIMELINE_ERROR_CODES,
  PATTERN_VOICES,
  PatternError,
  type PatternProject,
  type PatternTimeline,
  parsePattern,
  patternFromLlm,
  patternNoteName,
  patternNoteToPc,
  patternPromptHint,
  patternScaleIntervals,
  serializePattern,
  TIMELINE_SCHEMA_VERSION,
  TIMELINE_SOURCES,
  TRANSIENT_LABELS,
  validatePatternProject,
  validatePatternTimeline,
} from "../patternenums.ts";

/** The embedding fixture: thirty-two two-decimal numbers (canonical already). */
function embeddingFixture(): number[] {
  return Array.from({ length: EMBEDDING_DIM }, (_, i) => ((i * 7) % 100) / 100);
}

/** A valid project document, fresh every call (the tests mutate it). */
function projectFixture(): PatternProject {
  return {
    schema: PATTERN_SCHEMA_VERSION,
    bpm: 140,
    root: 9,
    scale: "harmonic-minor",
    bars: 4,
    mood: "dark trap",
    prompt: "808 sub and dark bells",
    drums: {
      kick: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      hat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
      clap: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    },
    notes: [
      { step: 0, pitch: 33, vel: 0.9, dur: 4, voice: "bass" },
      { step: 0, pitch: 69, vel: 0.8, dur: 2, voice: "pluck" },
      { step: 4, pitch: 72, vel: 0.65, dur: 1, voice: "bell" },
    ],
    embedding: embeddingFixture(),
  };
}

/** A valid timeline document, fresh every call (the tests mutate it). */
function timelineFixture(): PatternTimeline {
  return {
    schema: TIMELINE_SCHEMA_VERSION,
    source: "import",
    bpm: 120,
    seconds: 2,
    embedding: embeddingFixture(),
    frames: [
      {
        s: 0,
        rms: 0.5,
        centroid: 812.5,
        flux: 0.2,
        chroma: [0.1, 0.05, 0, 0, 0.3, 0, 0, 0.05, 0.2, 0.1, 0.1, 0.1],
        embedding: embeddingFixture(),
        events: [
          { kind: "transient", note: "kick", onset: 0, velocity: 0.9, confidence: 0.8 },
          { kind: "note", note: "a3", pitch: 57, hz: 220, onset: 0.5, velocity: 0.6, confidence: 0.7 },
        ],
        tags: ["ritmico"],
      },
      {
        s: 1,
        rms: 0.25,
        centroid: 640,
        flux: 0.05,
        chroma: new Array<number>(CHROMA_DIM).fill(0),
        embedding: embeddingFixture(),
        events: [],
        tags: [],
      },
    ],
  };
}

/** Deep-copies a fixture and sets (or deletes, on undefined) one dotted path. */
function withPath(root: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
  const keys = path.split(".");
  let cursor = root;
  for (const key of keys.slice(0, -1)) {
    cursor = (cursor[key] ?? {}) as Record<string, unknown>;
  }
  const last = keys[keys.length - 1] as string;
  if (value === undefined) delete cursor[last];
  else cursor[last] = value;
  return root;
}

/** A deep-fresh project fixture with one dotted path replaced or removed. */
function withProject(path: string, value: unknown): Record<string, unknown> {
  return withPath(JSON.parse(JSON.stringify(projectFixture())) as Record<string, unknown>, path, value);
}

/** A deep-fresh timeline fixture with one dotted path replaced or removed. */
function withTimeline(path: string, value: unknown): Record<string, unknown> {
  return withPath(JSON.parse(JSON.stringify(timelineFixture())) as Record<string, unknown>, path, value);
}

/** The machine code a broken project payload answers (the test fails on an ok). */
function projectCodeOf(value: unknown): string {
  const result = validatePatternProject(value);
  if (result.ok) throw new Error("the broken project payload must not pass");
  return result.code;
}

/** The machine code a broken timeline payload answers (the test fails on an ok). */
function timelineCodeOf(value: unknown): string {
  const result = validatePatternTimeline(value);
  if (result.ok) throw new Error("the broken timeline payload must not pass");
  return result.code;
}

describe("the enum tables", () => {
  it("pins the two schema literals", () => {
    assert.equal(PATTERN_SCHEMA_VERSION, "debonair.pattern/1");
    assert.equal(TIMELINE_SCHEMA_VERSION, "debonair.timeline/1");
  });

  it("carries the twelve lowercase note names the ingest vocabulary pins", () => {
    assert.equal(NOTE_NAMES.length, 12);
    assert.deepEqual(NOTE_NAMES, INGEST_NOTE_NAMES);
    assert.equal(patternNoteName(0), "c");
    assert.equal(patternNoteName(9), "a");
    assert.equal(patternNoteName(11), "b");
  });

  it("parses every note name onto its pitch class and rejects the rest", () => {
    for (let pc = 0; pc < 12; pc++) {
      assert.equal(patternNoteToPc(NOTE_NAMES[pc] as string), pc);
      assert.equal(patternNoteToPc((NOTE_NAMES[pc] as string).toUpperCase()), pc);
    }
    assert.equal(patternNoteToPc("zzz"), null);
    assert.equal(patternNoteToPc(""), null);
  });

  it("holds the forty-eight scales, each an ascending set inside the octave", () => {
    assert.equal(PATTERN_SCALE_NAMES.length, 48);
    assert.equal(new Set(PATTERN_SCALE_NAMES).size, 48);
    for (const name of PATTERN_SCALE_NAMES) {
      const steps = PATTERN_SCALES[name];
      assert.ok(steps.length >= 5, `${name} carries at least five degrees`);
      assert.equal(steps[0], 0, `${name} starts at the root`);
      for (let i = 1; i < steps.length; i++) {
        assert.ok(steps[i] > steps[i - 1], `${name} ascends at ${i}`);
        assert.ok(steps[i] < 12, `${name} stays inside the octave`);
      }
    }
  });

  it("reuses the theory kernel sets for the scales it already owns", () => {
    assert.deepEqual(PATTERN_SCALES.major, SCALE_STEPS.major);
    assert.deepEqual(PATTERN_SCALES["natural-minor"], SCALE_STEPS["natural-minor"]);
    assert.deepEqual(PATTERN_SCALES["harmonic-minor"], SCALE_STEPS["harmonic-minor"]);
    assert.deepEqual(PATTERN_SCALES["melodic-minor"], SCALE_STEPS["melodic-minor"]);
    assert.deepEqual(PATTERN_SCALES.dorian, SCALE_STEPS.dorian);
    assert.deepEqual(PATTERN_SCALES["pentatonic-minor"], SCALE_STEPS["pentatonic-minor"]);
    assert.deepEqual(PATTERN_SCALES.blues, SCALE_STEPS.blues);
  });

  it("covers every scale the genre matrix biases", () => {
    for (const genre of GENRES) {
      for (const scale of genre.scales) {
        assert.ok((PATTERN_SCALE_NAMES as readonly string[]).includes(scale), `${genre.id} biases ${scale}`);
      }
    }
  });

  it("folds the reference spellings onto the canonical names", () => {
    for (const [alias, canonical] of Object.entries(PATTERN_SCALE_ALIASES)) {
      const result = validatePatternProject({ ...projectFixture(), scale: alias });
      assert.equal(result.ok, true, `${alias} parses`);
      if (result.ok) assert.equal(result.doc.scale, canonical);
    }
    assert.equal(PATTERN_SCALE_ALIASES.minor, "natural-minor");
    assert.equal(PATTERN_SCALE_ALIASES.aeolian, "natural-minor");
  });

  it("throws the honest code on a scale outside the library", () => {
    for (const name of ["dorian-flat-five", "toString", "constructor"]) {
      assert.throws(
        () => patternScaleIntervals(name),
        (error: unknown) => error instanceof PatternError && error.code === "unknown-scale",
      );
    }
  });

  it("carries the eight voices, four lanes, three bands and the event tables", () => {
    assert.equal(PATTERN_VOICES.length, 8);
    assert.equal(new Set(PATTERN_VOICES).size, 8);
    assert.deepEqual(DRUM_LANE_KEYS, ["kick", "snare", "hat", "clap"]);
    assert.equal(LANE_STEPS, 16);
    assert.deepEqual(BAND_LABELS, ["low", "mid", "high"]);
    assert.deepEqual(EVENT_KINDS, ["note", "transient"]);
    assert.deepEqual(TRANSIENT_LABELS, ["kick", "hat", "hit"]);
    assert.deepEqual(TIMELINE_SOURCES, ["import", "generated", "variation"]);
    assert.equal(EMBEDDING_DIM, 32);
    assert.equal(CHROMA_DIM, 12);
  });

  it("rides the fifteen genre keys of the style dictionary", () => {
    assert.equal(PATTERN_GENRE_KEYS.length, 15);
    assert.equal(new Set(PATTERN_GENRE_KEYS).size, 15);
    assert.deepEqual(
      PATTERN_GENRE_KEYS,
      GENRES.map((genre) => genre.id),
    );
  });

  it("answers the full codes table with the nine project codes inside", () => {
    assert.equal(PATTERN_PROJECT_ERROR_CODES.length, 9);
    assert.equal(PATTERN_TIMELINE_ERROR_CODES.length, 7);
    for (const code of PATTERN_PROJECT_ERROR_CODES) assert.ok(PATTERN_ERROR_CODES.includes(code));
    for (const code of PATTERN_TIMELINE_ERROR_CODES) assert.ok(PATTERN_ERROR_CODES.includes(code));
    assert.equal(new Set(PATTERN_ERROR_CODES).size, PATTERN_ERROR_CODES.length);
  });
});

describe("the project validator", () => {
  it("answers ok with the same document when it is honest", () => {
    const result = validatePatternProject(projectFixture());
    assert.equal(result.ok, true);
    if (result.ok) assert.deepEqual(result.doc, projectFixture());
  });

  it("answers bad-schema on a foreign literal, a non-object or a missing schema", () => {
    assert.equal(projectCodeOf(withProject("schema", "vector-one/project@5.0")), "bad-schema");
    assert.equal(projectCodeOf(withProject("schema", undefined)), "bad-schema");
    assert.equal(projectCodeOf(42), "bad-schema");
    assert.equal(projectCodeOf([1, 2]), "bad-schema");
  });

  it("answers bad-bpm outside 40..240, missing or non-numeric", () => {
    assert.equal(projectCodeOf(withProject("bpm", 300)), "bad-bpm");
    assert.equal(projectCodeOf(withProject("bpm", "140")), "bad-bpm");
    assert.equal(projectCodeOf(withProject("bpm", undefined)), "bad-bpm");
  });

  it("answers bad-root outside 0..11, fractional or unparseable", () => {
    assert.equal(projectCodeOf(withProject("root", 12)), "bad-root");
    assert.equal(projectCodeOf(withProject("root", -1)), "bad-root");
    assert.equal(projectCodeOf(withProject("root", 4.5)), "bad-root");
    assert.equal(projectCodeOf(withProject("root", "h8")), "bad-root");
  });

  it("answers unknown-scale on a name outside the library", () => {
    assert.equal(projectCodeOf(withProject("scale", "super-lydian")), "unknown-scale");
    assert.equal(projectCodeOf(withProject("scale", undefined)), "unknown-scale");
    assert.equal(projectCodeOf(withProject("scale", "constructor")), "unknown-scale");
  });

  it("answers bad-bars outside 1..128 or fractional", () => {
    assert.equal(projectCodeOf(withProject("bars", 0)), "bad-bars");
    assert.equal(projectCodeOf(withProject("bars", 200)), "bad-bars");
    assert.equal(projectCodeOf(withProject("bars", 2.5)), "bad-bars");
  });

  it("answers bad-lane on a short, non-numeric or missing lane", () => {
    assert.equal(projectCodeOf(withProject("drums.hat", [1, 0, 1])), "bad-lane");
    assert.equal(projectCodeOf(withProject("drums.kick", ["x", ...new Array<number>(15).fill(0)])), "bad-lane");
    assert.equal(projectCodeOf(withProject("drums.clap", undefined)), "bad-lane");
    assert.equal(projectCodeOf(withProject("drums", undefined)), "bad-lane");
  });

  it("answers bad-note on a broken note event", () => {
    const note = (patch: Record<string, unknown>): unknown[] => [
      { step: 0, pitch: 60, vel: 0.8, dur: 2, ...patch, voice: "lead" },
    ];
    assert.equal(projectCodeOf(withProject("notes", 42)), "bad-note");
    assert.equal(projectCodeOf(withProject("notes", ["nope"])), "bad-note");
    assert.equal(projectCodeOf(withProject("notes", note({ step: -1 }))), "bad-note");
    assert.equal(projectCodeOf(withProject("notes", note({ step: 1.5 }))), "bad-note");
    assert.equal(projectCodeOf(withProject("notes", note({ pitch: 200 }))), "bad-note");
    assert.equal(projectCodeOf(withProject("notes", note({ pitch: "60" }))), "bad-note");
    assert.equal(projectCodeOf(withProject("notes", note({ vel: "loud" }))), "bad-note");
    assert.equal(projectCodeOf(withProject("notes", note({ dur: undefined }))), "bad-note");
  });

  it("answers unknown-voice on a voice outside the eight", () => {
    assert.equal(
      projectCodeOf(withProject("notes", [{ step: 0, pitch: 60, vel: 0.8, dur: 2, voice: "saw" }])),
      "unknown-voice",
    );
    assert.equal(
      projectCodeOf(withProject("notes", [{ step: 0, pitch: 60, vel: 0.8, dur: 2, voice: 7 }])),
      "unknown-voice",
    );
  });

  it("answers bad-embedding on a malformed vector", () => {
    assert.equal(projectCodeOf(withProject("embedding", [0.1, 0.2])), "bad-embedding");
    assert.equal(projectCodeOf(withProject("embedding", "zeros")), "bad-embedding");
    const withNaN = embeddingFixture();
    withNaN[3] = Number.NaN;
    assert.equal(projectCodeOf(withProject("embedding", withNaN)), "bad-embedding");
  });
});

describe("the timeline validator", () => {
  it("answers ok with the same document when it is honest", () => {
    const result = validatePatternTimeline(timelineFixture());
    assert.equal(result.ok, true);
    if (result.ok) assert.deepEqual(result.doc, timelineFixture());
  });

  it("answers bad-schema on a foreign literal or a non-object", () => {
    assert.equal(timelineCodeOf(withTimeline("schema", "debonair.pattern/1")), "bad-schema");
    assert.equal(timelineCodeOf(withTimeline("schema", "vector-one/timeline@5.0")), "bad-schema");
    assert.equal(timelineCodeOf("nope"), "bad-schema");
  });

  it("answers bad-source on an unknown or missing source", () => {
    assert.equal(timelineCodeOf(withTimeline("source", "bootleg")), "bad-source");
    assert.equal(timelineCodeOf(withTimeline("source", undefined)), "bad-source");
  });

  it("answers bad-bpm outside 30..300 or non-numeric", () => {
    assert.equal(timelineCodeOf(withTimeline("bpm", 500)), "bad-bpm");
    assert.equal(timelineCodeOf(withTimeline("bpm", "120")), "bad-bpm");
  });

  it("answers bad-seconds on a negative or non-numeric duration", () => {
    assert.equal(timelineCodeOf(withTimeline("seconds", -1)), "bad-seconds");
    assert.equal(timelineCodeOf(withTimeline("seconds", null)), "bad-seconds");
  });

  it("answers bad-embedding on a short song vector", () => {
    assert.equal(timelineCodeOf(withTimeline("embedding", [0.1, 0.2])), "bad-embedding");
  });

  it("answers bad-frame on a broken frame", () => {
    assert.equal(timelineCodeOf(withTimeline("frames", undefined)), "bad-frame");
    assert.equal(timelineCodeOf(withTimeline("frames.0", 42)), "bad-frame");
    assert.equal(timelineCodeOf(withTimeline("frames.0.s", -1)), "bad-frame");
    assert.equal(timelineCodeOf(withTimeline("frames.0.s", 0.5)), "bad-frame");
    assert.equal(timelineCodeOf(withTimeline("frames.0.rms", "loud")), "bad-frame");
    assert.equal(timelineCodeOf(withTimeline("frames.0.chroma", [0.1, 0.2])), "bad-frame");
    assert.equal(timelineCodeOf(withTimeline("frames.0.embedding", [1, 2, 3])), "bad-frame");
  });

  it("answers bad-event on a broken event", () => {
    const event = (patch: Record<string, unknown>): unknown => ({
      kind: "note",
      onset: 0,
      velocity: 0.5,
      confidence: 0.5,
      ...patch,
    });
    assert.equal(timelineCodeOf(withTimeline("frames.0.events", [event({ kind: "chord" })])), "bad-event");
    assert.equal(
      timelineCodeOf(withTimeline("frames.0.events", [event({ kind: "transient", note: "snare" })])),
      "bad-event",
    );
    assert.equal(timelineCodeOf(withTimeline("frames.0.events", [event({ onset: undefined })])), "bad-event");
    assert.equal(timelineCodeOf(withTimeline("frames.0.events", [event({ pitch: 200 })])), "bad-event");
    assert.equal(timelineCodeOf(withTimeline("frames.0.events", ["nope"])), "bad-event");
  });
});

describe("the clamping laws", () => {
  it("clamps the note vel and dur into their bands", () => {
    const doc = {
      ...projectFixture(),
      notes: [
        { step: 0, pitch: 60, vel: 2, dur: 32, voice: "lead" },
        { step: 1, pitch: 61, vel: -0.5, dur: 0.01, voice: "lead" },
      ],
    };
    const result = validatePatternProject(doc);
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.doc.notes[0]?.vel, 1);
      assert.equal(result.doc.notes[0]?.dur, 16);
      assert.equal(result.doc.notes[1]?.vel, 0);
      assert.equal(result.doc.notes[1]?.dur, PATTERN_LIMITS.durMin);
    }
  });

  it("binarizes the lane steps at the threshold", () => {
    const kick = Array.from({ length: LANE_STEPS }, (_, i) => (i % 2 === 0 ? 0.9 : 0.2));
    const result = validatePatternProject({ ...projectFixture(), drums: { ...projectFixture().drums, kick } });
    assert.equal(result.ok, true);
    if (result.ok) {
      for (let i = 0; i < LANE_STEPS; i++) {
        assert.equal(result.doc.drums.kick[i], i % 2 === 0 ? 1 : 0);
      }
    }
  });

  it("defaults the voice, the notes, the embedding and the free text", () => {
    const stripped = withProject("notes", undefined);
    delete stripped.embedding;
    delete stripped.prompt;
    delete stripped.mood;
    const empty = validatePatternProject(stripped);
    assert.equal(empty.ok, true, "a document without notes, embedding and free text still parses");
    if (empty.ok) {
      assert.deepEqual(empty.doc.notes, []);
      assert.equal(empty.doc.embedding.length, EMBEDDING_DIM);
      assert.ok(empty.doc.embedding.every((v) => v === 0));
      assert.equal(empty.doc.prompt, "");
      assert.equal(empty.doc.mood, "");
    }
    const seeded = validatePatternProject(withProject("notes", [{ step: 0, pitch: 60, vel: 0.5, dur: 1 }]));
    assert.equal(seeded.ok, true);
    if (seeded.ok) assert.equal(seeded.doc.notes[0]?.voice, "pluck");
  });

  it("parses the root from a note name and keeps the edges 0..11 legal", () => {
    const result = validatePatternProject({ ...projectFixture(), root: "a", scale: "harmonic_minor" });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.doc.root, 9);
      assert.equal(result.doc.scale, "harmonic-minor");
    }
    for (const root of [0, 11]) {
      const edge = validatePatternProject({ ...projectFixture(), root });
      assert.equal(edge.ok, true, `root ${root} passes`);
    }
  });

  it("clamps the timeline frame fields into their bands", () => {
    const frames = timelineFixture().frames;
    const doc = {
      ...timelineFixture(),
      frames: [
        { ...frames[0], rms: 1.5, centroid: -20, flux: -0.4 },
        { ...frames[1], events: [{ kind: "transient", onset: -0.2, velocity: 2, confidence: -1 }] },
      ],
    };
    const result = validatePatternTimeline(doc);
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.doc.frames[0]?.rms, 1);
      assert.equal(result.doc.frames[0]?.centroid, 0);
      assert.equal(result.doc.frames[0]?.flux, 0);
      const event = result.doc.frames[1]?.events[0];
      assert.equal(event?.onset, 0);
      assert.equal(event?.velocity, 1);
      assert.equal(event?.confidence, 0);
      assert.equal(event?.note, "hit");
    }
  });

  it("drops non-string tags and defaults the frame embedding", () => {
    const frame = { ...timelineFixture().frames[0], tags: ["ritmico", 42, null] };
    delete (frame as Record<string, unknown>).embedding;
    const result = validatePatternTimeline({ ...timelineFixture(), frames: [frame] });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.deepEqual(result.doc.frames[0]?.tags, ["ritmico"]);
      assert.ok(result.doc.frames[0]?.embedding.every((v) => v === 0));
    }
  });
});

describe("the canonical serialization", () => {
  it("answers the same bytes twice, whatever key order the input carries", () => {
    const doc = projectFixture();
    const once = serializePattern(doc);
    assert.equal(serializePattern(doc), once);
    const scrambled: Record<string, unknown> = {};
    const source = doc as unknown as Record<string, unknown>;
    for (const key of ["embedding", "notes", "drums", "prompt", "mood", "bars", "scale", "root", "bpm", "schema"]) {
      scrambled[key] = source[key];
    }
    assert.equal(serializePattern(scrambled as unknown as PatternProject), once);
  });

  it("writes the contract key order and the four lanes in grid order", () => {
    const once = serializePattern(projectFixture());
    assert.ok(once.startsWith('{"schema":"debonair.pattern/1","bpm":140,"root":9,"scale":"harmonic-minor","bars":4,'));
    assert.ok(once.includes('"step":0,"pitch":33,"vel":0.9,"dur":4,"voice":"bass"'));
    for (const key of DRUM_LANE_KEYS) {
      const next = DRUM_LANE_KEYS[DRUM_LANE_KEYS.indexOf(key) + 1];
      if (next !== undefined) assert.ok(once.indexOf(`"${key}":`) < once.indexOf(`"${next}":`));
    }
  });

  it("rounds every number to four decimals", () => {
    const doc = {
      ...projectFixture(),
      notes: [{ step: 0, pitch: 60.123456, vel: 0.123456, dur: 2, voice: "lead" }],
    };
    const json = serializePattern(doc as unknown as PatternProject);
    assert.ok(json.includes('"pitch":60.1235'));
    assert.ok(json.includes('"vel":0.1235'));
    const back = parsePattern(json);
    assert.equal(back.ok, true);
    if (back.ok && back.doc.schema === PATTERN_SCHEMA_VERSION) {
      assert.equal(back.doc.notes[0]?.pitch, 60.1235);
      assert.equal(back.doc.notes[0]?.vel, 0.1235);
    }
  });

  it("round-trips the project: parse(serialize(doc)) returns the document", () => {
    const doc = projectFixture();
    const back = parsePattern(serializePattern(doc));
    assert.equal(back.ok, true);
    if (back.ok) {
      assert.deepEqual(back.doc, doc);
      assert.equal(serializePattern(back.doc), serializePattern(doc));
    }
  });

  it("round-trips the timeline the same way, optional fields included", () => {
    const doc = timelineFixture();
    const back = parsePattern(serializePattern(doc));
    assert.equal(back.ok, true);
    if (back.ok) {
      assert.deepEqual(back.doc, doc);
      assert.equal(serializePattern(back.doc), serializePattern(doc));
      const note = (back.doc as PatternTimeline).frames[0]?.events[1];
      assert.equal(note?.note, "a3");
      assert.equal(note?.hz, 220);
    }
  });

  it("answers bad-schema on a json that is not a pattern document", () => {
    for (const json of ['{"schema":"debonair.ingest/1"}', "{not json", "[1,2]"]) {
      const result = parsePattern(json);
      assert.equal(result.ok, false);
      if (!result.ok) assert.equal(result.code, "bad-schema");
    }
  });

  it("throws the typed error when serialization meets a broken document", () => {
    assert.throws(
      () => serializePattern(withProject("drums", undefined) as unknown as PatternProject),
      (error: unknown) => {
        assert.ok(error instanceof PatternError);
        assert.equal(error.code, "bad-lane");
        return true;
      },
    );
  });
});

describe("the llm bridge", () => {
  it("teaches every voice, lane and genre from the tables", () => {
    const hint = patternPromptHint();
    assert.ok(hint.includes(PATTERN_SCHEMA_VERSION));
    for (const voice of PATTERN_VOICES) assert.ok(hint.includes(voice), `the hint names the ${voice} voice`);
    for (const key of DRUM_LANE_KEYS) assert.ok(hint.includes(key), `the hint names the ${key} lane`);
    for (const genre of PATTERN_GENRE_KEYS) assert.ok(hint.includes(genre), `the hint names the ${genre} genre`);
    for (const note of NOTE_NAMES) assert.ok(hint.includes(note), `the hint names the ${note} root`);
  });

  it("teaches the forty-eight scales and the limits, zero hardcoded genre text", () => {
    const hint = patternPromptHint();
    for (const scale of PATTERN_SCALE_NAMES) assert.ok(hint.includes(scale), `the hint names ${scale}`);
    assert.ok(hint.includes(`${PATTERN_LIMITS.bpmMin}..${PATTERN_LIMITS.bpmMax}`));
    assert.ok(hint.includes(`${PATTERN_LIMITS.durMin}..${PATTERN_LIMITS.durMax}`));
    assert.equal(hint.includes("made-up-genre"), false);
  });

  it("pins the document at hand when one is passed", () => {
    const hint = patternPromptHint(projectFixture());
    assert.ok(hint.includes("bpm 140"));
    assert.ok(hint.includes("root 9 (a)"));
    assert.ok(hint.includes("scale harmonic-minor"));
    assert.ok(hint.includes("bars 4"));
    assert.ok(hint.includes('mood "dark trap"'));
  });

  it("accepts an honest model answer and answers the clamped document", () => {
    const result = patternFromLlm(JSON.stringify(projectFixture()));
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.doc.schema, PATTERN_SCHEMA_VERSION);
      assert.equal(result.doc.root, 9);
    }
  });

  it("answers bad-schema on unparsable json, a foreign schema or a timeline answer", () => {
    for (const json of ["{not json", "42", JSON.stringify(timelineFixture())]) {
      const result = patternFromLlm(json);
      assert.equal(result.ok, false);
      if (!result.ok) assert.equal(result.code, "bad-schema");
    }
  });

  it("surfaces the validator codes verbatim when the model drifts", () => {
    const drifted = patternFromLlm(
      JSON.stringify({ ...projectFixture(), notes: [{ step: 0, pitch: 60, vel: 0.8, dur: 2, voice: "saw" }] }),
    );
    assert.equal(drifted.ok, false);
    if (!drifted.ok) assert.equal(drifted.code, "unknown-voice");
  });
});
