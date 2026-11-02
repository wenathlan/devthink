// # reconpayload.test — the contract law of the recon document (the wave
// 16a battery): the frozen counts pinned (76 header seats, 66 layer seats,
// 4 correlations, 82 distinct parameters, the shared 64), the key law
// (strict camelCase, no underscore, no hyphen, no Total suffix, no
// duplicates), the text whitelist (a string outside the seven seats never
// passes, a dictionary seat never accepts a foreign value), the
// bidirectional dictionaries (every table round-trips its names and ids),
// the clamp law (every normalized seat folds into 0..1), the duplicate-key
// scanner (the raw json a silent JSON.parse would collapse into a lie), and
// the canonical serializer (the same document always answers the same
// bytes, whatever key order it arrived with). runnable with vitest:
// pnpm vitest run tests/reconpayload.test.ts
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  type ReconDocument,
  RECON_CORRELATION_KEYS,
  RECON_ENCODINGS,
  RECON_ERROR_CODES,
  RECON_FAMILIES,
  RECON_FRAME_KEYS,
  RECON_HEADER_KEYS,
  RECON_INSTRUMENTS,
  RECON_LAYERS,
  RECON_MIME_TYPES,
  RECON_NORMALIZED_FRAME_KEYS,
  RECON_PARAM_COUNTS,
  RECON_ROOT_NAMES,
  RECON_SCALE_NAMES,
  RECON_TEXT_KEYS,
  RECON_TIME_SIGNATURES,
  ReconError,
  parseRecon,
  reconFamilyId,
  reconFamilyName,
  reconHasDuplicateKeys,
  reconIdOf,
  reconInstrumentId,
  reconInstrumentName,
  reconLayerId,
  reconLayerName,
  reconNameOf,
  reconRootId,
  reconRootName,
  reconScaleId,
  reconScaleName,
  serializeRecon,
  validateRecon,
} from "../reconpayload.ts";

/** Builds one minimal but complete recon document from the frozen seat
 * lists — every numeric seat a legal value, the text seats inside their
 * dictionaries, one frame with both layers. The fixture the law tests ride. */
function lawDoc(): ReconDocument {
  const header = {} as Record<string, unknown>;
  for (const key of RECON_HEADER_KEYS) header[key] = 0;
  header.schema = "debonair.recon/3";
  header.name = "law take";
  header.mimeType = "audio/wav";
  header.encoding = "pcm16";
  header.timeSignature = "4/4";
  header.instrumentName = "mix";
  header.instrumentFamily = "vocal";
  header.sampleRate = 44100;
  header.durationSeconds = 2;
  header.bpmMedian = 120;
  header.mostUsedScaleId = 27;
  header.mostUsedKeyId = 9;
  const frame = {} as Record<string, unknown>;
  for (const key of RECON_FRAME_KEYS) frame[key] = 0;
  frame.s = 0;
  frame.rms = 0.5;
  frame.bpm = 120;
  frame.scaleRoot = 9;
  frame.scaleType = 27;
  frame.chroma9 = 1;
  frame.layers = [
    { layerId: 0, spectralPeaks: [440, 1], midiNotes: [69, 0, 0.5] },
    { layerId: 1, spectralPeaks: [220, 0.75], midiNotes: [] },
  ];
  return {
    header: header as unknown as ReconDocument["header"],
    frames: [frame as unknown as ReconDocument["frames"][number]],
    correlations: {
      tempoFluctuationIndex: 0.25,
      spectralTransitionConfidence: 0.5,
      harmonicDistortionStateHash: 3735928559,
      pitchTrajectorySlope: -1.5,
    },
  };
}

/** Reads a nested value of the parsed document by path (the honest probe). */
function seatOf(doc: unknown, path: string[]): unknown {
  let current = doc;
  for (const key of path) current = (current as Record<string, unknown>)[key];
  return current;
}

describe("the frozen counts (the 82-law pinned)", () => {
  it("seats exactly 76 header, 66 layer and 4 correlation parameters", () => {
    assert.equal(RECON_HEADER_KEYS.length, 76);
    assert.equal(RECON_FRAME_KEYS.length, 66);
    assert.equal(RECON_CORRELATION_KEYS.length, 4);
    assert.equal(RECON_PARAM_COUNTS.header, 76);
    assert.equal(RECON_PARAM_COUNTS.frame, 66);
    assert.equal(RECON_PARAM_COUNTS.correlations, 4);
    assert.equal(RECON_PARAM_COUNTS.distinct, 82);
    assert.equal(RECON_PARAM_COUNTS.historicalMax, 170);
  });

  it("shares exactly 64 analytic keys between header and frame (the symmetric inheritance)", () => {
    const shared = RECON_HEADER_KEYS.filter((key) => RECON_FRAME_KEYS.includes(key));
    assert.equal(shared.length, 64);
    const union = new Set([...RECON_HEADER_KEYS, ...RECON_FRAME_KEYS, ...RECON_CORRELATION_KEYS]);
    assert.equal(union.size, 82);
  });

  it("keeps every seat list free of duplicates and camelCase-lawful", () => {
    const law = /^[a-z][a-zA-Z0-9]*$/;
    for (const list of [RECON_HEADER_KEYS, RECON_FRAME_KEYS, RECON_CORRELATION_KEYS]) {
      assert.equal(new Set(list).size, list.length, "no seat repeats");
      for (const key of list) {
        assert.match(key, law, `the seat "${key}" is camelCase`);
        assert.ok(!key.includes("_"), `the seat "${key}" carries no underscore`);
        assert.ok(!key.includes("-"), `the seat "${key}" carries no hyphen`);
        assert.ok(!key.endsWith("Total"), `the seat "${key}" carries no Total suffix`);
      }
    }
  });

  it("names the four correlations exactly as the spec freezes them", () => {
    assert.deepEqual(RECON_CORRELATION_KEYS, [
      "tempoFluctuationIndex",
      "spectralTransitionConfidence",
      "harmonicDistortionStateHash",
      "pitchTrajectorySlope",
    ]);
  });
});

describe("the bidirectional dictionaries (text ↔ number)", () => {
  const tables: [string, readonly string[]][] = [
    ["the 48 scales", RECON_SCALE_NAMES],
    ["the 12 roots", RECON_ROOT_NAMES],
    ["the instruments", RECON_INSTRUMENTS],
    ["the families", RECON_FAMILIES],
    ["the time signatures", RECON_TIME_SIGNATURES],
    ["the encodings", RECON_ENCODINGS],
    ["the mime types", RECON_MIME_TYPES],
    ["the layers", RECON_LAYERS],
  ];

  it("round-trips every name of every table through its numeric twin", () => {
    for (const [label, table] of tables) {
      for (const [id, name] of table.entries()) {
        assert.equal(reconIdOf(table, name), id, `${label}: "${name}" seats ${id}`);
        assert.equal(reconNameOf(table, id), name, `${label}: ${id} answers "${name}"`);
      }
      assert.equal(reconIdOf(table, "not-in-the-table"), -1, `${label}: a foreign name refuses`);
      assert.equal(reconNameOf(table, table.length), "", `${label}: a foreign id refuses`);
    }
  });

  it("maps the forty-eight pattern scales onto 0..47 with the spec's example", () => {
    assert.equal(RECON_SCALE_NAMES.length, 48);
    assert.equal(reconScaleId("phrygian-dom"), RECON_SCALE_NAMES.indexOf("phrygian-dom"));
    assert.equal(reconScaleName(reconScaleId("phrygian-dom")), "phrygian-dom");
    assert.equal(reconScaleId("major"), 0);
    assert.equal(reconRootId("a"), 9);
    assert.equal(reconRootName(9), "a");
    assert.equal(reconInstrumentId("mix"), 0);
    assert.equal(reconInstrumentName(0), "mix");
    assert.equal(reconFamilyId("vocal"), RECON_FAMILIES.indexOf("vocal"));
    assert.equal(reconFamilyName(reconFamilyId("bass")), "bass");
    assert.equal(reconLayerId("harmonic"), 0);
    assert.equal(reconLayerName(1), "percussive");
  });

  it("covers every text seat of the whitelist with a dictionary or the free name", () => {
    assert.deepEqual(RECON_TEXT_KEYS, [
      "schema",
      "name",
      "mimeType",
      "encoding",
      "timeSignature",
      "instrumentName",
      "instrumentFamily",
    ]);
    const doc = lawDoc();
    const result = validateRecon(doc);
    assert.ok(result.ok, "the fixture with every text seat inside its dictionary validates");
  });
});

describe("the validator (the machine codes)", () => {
  it("accepts the lawful fixture and answers the clamped document", () => {
    const result = validateRecon(lawDoc());
    assert.ok(result.ok);
    assert.equal(result.doc.header.mostUsedScaleId, 27);
    assert.equal(result.doc.frames[0].scaleType, 27);
  });

  it("rejects a wrong schema literal (bad-schema)", () => {
    const doc = lawDoc();
    doc.header.schema = "debonair.recon/2";
    const result = validateRecon(doc);
    assert.ok(!result.ok);
    assert.equal(result.code, "bad-schema");
  });

  it("rejects a string outside the text whitelist (bad-text)", () => {
    const doc = lawDoc();
    (doc.frames[0] as unknown as Record<string, unknown>).rms = "0.5";
    let result = validateRecon(doc);
    assert.ok(!result.ok);
    assert.equal(result.code, "bad-text");
    const docTwo = lawDoc();
    (docTwo.header as unknown as Record<string, unknown>).centroid = "440 hz";
    result = validateRecon(docTwo);
    assert.ok(!result.ok);
    assert.equal(result.code, "bad-text");
  });

  it("rejects a dictionary seat holding a foreign value (bad-dictionary)", () => {
    for (const [seat, value] of [
      ["mimeType", "audio/mpeg"],
      ["encoding", "pcm8"],
      ["timeSignature", "5/8"],
      ["instrumentName", "sitar"],
      ["instrumentFamily", "strings"],
    ] as const) {
      const doc = lawDoc();
      (doc.header as unknown as Record<string, unknown>)[seat] = value;
      const result = validateRecon(doc);
      assert.ok(!result.ok, `the ${seat} "${value}" must refuse`);
      assert.equal(result.code, "bad-dictionary");
    }
  });

  it("rejects a malformed free name (bad-text)", () => {
    for (const bad of ["", "x".repeat(121), "line\nbreak"]) {
      const doc = lawDoc();
      doc.header.name = bad;
      const result = validateRecon(doc);
      assert.ok(!result.ok, `the name "${bad.slice(0, 12)}" must refuse`);
      assert.equal(result.code, "bad-text");
    }
  });

  it("rejects underscore, hyphen and Total keys (bad-key-name)", () => {
    for (const [block, key] of [
      ["frames", "scale_root"],
      ["frames", "peak-hz0"],
      ["frames", "rmsTotal"],
      ["header", "spectral_flatness"],
      ["header", "bpm-median"],
    ] as const) {
      const doc = lawDoc();
      const target = block === "frames" ? doc.frames[0] : doc.header;
      (target as unknown as Record<string, unknown>)[key] = 1;
      const result = validateRecon(doc);
      assert.ok(!result.ok, `the key "${key}" must refuse`);
      assert.equal(result.code, "bad-key-name");
    }
  });

  it("rejects unknown keys and missing seats (bad-key)", () => {
    const extra = lawDoc();
    (extra.frames[0] as unknown as Record<string, unknown>).groove = 1;
    let result = validateRecon(extra);
    assert.ok(!result.ok);
    assert.equal(result.code, "bad-key");
    const missing = lawDoc();
    delete (missing.header as unknown as Record<string, unknown>).pcmhash;
    result = validateRecon(missing);
    assert.ok(!result.ok);
    assert.equal(result.code, "bad-key");
  });

  it("rejects non-finite seats and out-of-range ids (bad-number)", () => {
    const doc = lawDoc();
    doc.header.mostUsedScaleId = 48;
    let result = validateRecon(doc);
    assert.ok(!result.ok);
    assert.equal(result.code, "bad-number");
    const docTwo = lawDoc();
    docTwo.frames[0].scaleRoot = 12;
    result = validateRecon(docTwo);
    assert.ok(!result.ok);
    assert.equal(result.code, "bad-number");
    const docThree = lawDoc();
    docThree.correlations.harmonicDistortionStateHash = 1.5;
    result = validateRecon(docThree);
    assert.ok(!result.ok);
    assert.equal(result.code, "bad-number");
  });

  it("rejects a frame seating a foreign second (bad-frame)", () => {
    const doc = lawDoc();
    doc.frames[0].s = 1;
    const result = validateRecon(doc);
    assert.ok(!result.ok);
    assert.equal(result.code, "bad-frame");
  });

  it("rejects a broken layer lane (bad-layer)", () => {
    const notes = lawDoc();
    notes.frames[0].layers = [
      { layerId: 1, spectralPeaks: [], midiNotes: [69, 0, 0.5] },
    ];
    let result = validateRecon(notes);
    assert.ok(!result.ok, "the percussive layer carries no notes");
    assert.equal(result.code, "bad-layer");
    const odd = lawDoc();
    odd.frames[0].layers = [{ layerId: 0, spectralPeaks: [440], midiNotes: [] }];
    result = validateRecon(odd);
    assert.ok(!result.ok, "the peaks must pair hz with magnitude");
    assert.equal(result.code, "bad-layer");
    const unsorted = lawDoc();
    unsorted.frames[0].layers = [
      { layerId: 1, spectralPeaks: [], midiNotes: [] },
      { layerId: 0, spectralPeaks: [], midiNotes: [] },
    ];
    result = validateRecon(unsorted);
    assert.ok(!result.ok, "the layers must ascend by layerId");
    assert.equal(result.code, "bad-layer");
  });

  it("clamps every normalized seat into 0..1 (the clamp law)", () => {
    const doc = lawDoc();
    doc.frames[0].rms = 2.5;
    doc.frames[0].flatness = -0.7;
    doc.frames[0].chroma9 = 1.7;
    doc.frames[0].peakMag0 = 4;
    const result = validateRecon(doc);
    assert.ok(result.ok);
    assert.equal(result.doc.frames[0].rms, 1);
    assert.equal(result.doc.frames[0].flatness, 0);
    assert.equal(result.doc.frames[0].chroma9, 1);
    assert.equal(result.doc.frames[0].peakMag0, 1);
    for (const seat of RECON_NORMALIZED_FRAME_KEYS) {
      assert.ok(RECON_FRAME_KEYS.includes(seat), `the normalized seat "${seat}" is a frame seat`);
    }
  });

  it("answers every machine code of the contract table", () => {
    assert.deepEqual(RECON_ERROR_CODES, [
      "bad-schema",
      "duplicate-key",
      "bad-key-name",
      "bad-key",
      "bad-text",
      "bad-dictionary",
      "bad-number",
      "bad-header",
      "bad-frame",
      "bad-correlation",
      "bad-layer",
    ]);
  });
});

describe("the duplicate-key scanner (the raw json law)", () => {
  it("flags a repeated key JSON.parse would silently collapse", () => {
    assert.ok(reconHasDuplicateKeys('{"a":1,"a":2}'));
    assert.ok(reconHasDuplicateKeys('{"a":1,"b":{"a":1,"a":2}}'));
    assert.ok(reconHasDuplicateKeys('{"layers":[{"layerId":0,"layerId":1}]}'));
  });

  it("passes lawful json, whatever the nesting and the string values", () => {
    assert.ok(!reconHasDuplicateKeys('{"a":1,"b":2}'));
    assert.ok(!reconHasDuplicateKeys('{"a":1,"b":{"a":2}}'));
    assert.ok(!reconHasDuplicateKeys('{"name":"a:b","c":[1,2,3]}'));
    assert.ok(!reconHasDuplicateKeys('{"name":"quote \\" and : colon","x":1}'));
  });

  it("refuses a serialized document carrying a duplicated seat (duplicate-key)", () => {
    const json = serializeRecon(lawDoc());
    const duplicated = json.replace('"name":"law take"', '"name":"law take","name":"law take"');
    assert.notEqual(duplicated, json, "the injection must land");
    const result = parseRecon(duplicated);
    assert.ok(!result.ok);
    assert.equal(result.code, "duplicate-key");
  });
});

describe("the canonical serializer (the determinism law)", () => {
  it("answers the same bytes for the same document, run after run", () => {
    const first = serializeRecon(lawDoc());
    const second = serializeRecon(lawDoc());
    assert.equal(first, second);
  });

  it("answers the same bytes whatever key order the document arrived with", () => {
    const canonical = serializeRecon(lawDoc());
    const shuffled = JSON.parse(canonical, (key, value) =>
      typeof value === "object" && value !== null && !Array.isArray(value)
        ? Object.fromEntries(Object.entries(value).reverse())
        : value,
    );
    const round = JSON.parse(canonical);
    const result = validateRecon(shuffled);
    assert.ok(result.ok, "the shuffled document still validates");
    assert.equal(serializeRecon(result.doc), serializeRecon(round));
    assert.equal(serializeRecon(shuffled), canonical);
  });

  it("round-trips through parse and serialize without losing a seat", () => {
    const doc = lawDoc();
    const json = serializeRecon(doc);
    const parsed = parseRecon(json);
    assert.ok(parsed.ok);
    assert.equal(serializeRecon(parsed.doc), json);
    assert.equal(seatOf(parsed.doc, ["header", "mostUsedScaleId"]), 27);
    assert.equal(seatOf(parsed.doc, ["correlations", "harmonicDistortionStateHash"]), 3735928559);
    assert.deepEqual(seatOf(parsed.doc, ["frames", 0, "layers", 0, "midiNotes"]), [69, 0, 0.5]);
  });

  it("rounds every float to four decimals in the canonical bytes", () => {
    const doc = lawDoc();
    doc.frames[0].centroid = 440.123456;
    const json = serializeRecon(doc);
    assert.ok(json.includes('"centroid":440.1235'), "the canonical number law rounds to four decimals");
  });

  it("throws the typed error honestly when the document breaks", () => {
    const doc = lawDoc();
    doc.header.mimeType = "audio/mpeg";
    assert.throws(
      () => serializeRecon(doc),
      (error: unknown): boolean => error instanceof ReconError && error.code === "bad-dictionary",
      "the serializer surfaces the machine code",
    );
  });
});
