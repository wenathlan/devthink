// # mimetypes.test — honest unit tests for the gateway media type catalog, runnable
// with the vitest runner:
//   pnpm test
// The suite pins the owner law of wave 2-a: three thousand mimetypes on the internal
// api surface (3217 rows, every family the gateway answers for), the canonical pins of
// the extension lookup (.ts answers video/mp2t, .tsx answers application/typescript),
// the one-row-per-extension collision law and the catalog accessor that serves the
// catalog offline.
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { listMimetypes } from "../catalog.ts";
import {
  extensionsForType,
  findMimeType,
  MIMETYPES,
  MIMETYPE_COUNT,
  mimeFamilyOf,
  mimeTypeForExtension,
  mimetypesByFamily,
} from "../mimetypes.ts";

/** The families the law names (the type tree the catalog must cover). */
const LAW_FAMILIES: readonly string[] = [
  "text", "image", "audio", "video", "application", "font", "model", "chemical",
  "message", "multipart",
];

describe("mimetype catalog scale (the three-thousand law)", () => {
  it("answers 3217 media types — past the three thousand line", () => {
    assert.equal(MIMETYPE_COUNT, 3217);
    assert.ok(MIMETYPE_COUNT >= 3000, "the catalog must clear three thousand");
  });

  it("carries one row per media type", () => {
    const seen = new Set<string>();
    for (const row of MIMETYPES) {
      assert.ok(!seen.has(row.type), `the type ${row.type} rides twice`);
      seen.add(row.type);
    }
    assert.equal(seen.size, MIMETYPE_COUNT);
  });

  it("covers every family of the owner law", () => {
    const families = new Set(MIMETYPES.map((row) => row.family as string));
    for (const family of LAW_FAMILIES) {
      assert.ok(families.has(family), `the catalog must cover ${family}`);
    }
    assert.equal(families.size, 10);
  });

  it("answers the family of every row from the type tree before the slash", () => {
    for (const row of MIMETYPES) {
      assert.equal(row.family, row.type.split("/")[0]);
    }
  });
});

describe("mimetype canonical pins (the extension lookup law)", () => {
  it("answers .ts with video/mp2t and .tsx with application/typescript", () => {
    assert.equal(mimeTypeForExtension("ts")?.type, "video/mp2t");
    assert.equal(mimeTypeForExtension(".tsx")?.type, "application/typescript");
    assert.equal(mimeTypeForExtension("TS")?.type, "video/mp2t");
    assert.equal(mimeTypeForExtension(".TSX")?.type, "application/typescript");
  });

  it("answers the everyday extensions of the web family", () => {
    assert.equal(mimeTypeForExtension("html")?.type, "text/html");
    assert.equal(mimeTypeForExtension(".css")?.type, "text/css");
    assert.equal(mimeTypeForExtension("js")?.type, "application/javascript");
    assert.equal(mimeTypeForExtension("json")?.type, "application/json");
    assert.equal(mimeTypeForExtension("svg")?.type, "image/svg+xml");
    assert.equal(mimeTypeForExtension("md")?.type, "text/markdown");
    assert.equal(mimeTypeForExtension("wasm")?.type, "application/wasm");
  });

  it("resolves types case-insensitively and answers unknowns with undefined", () => {
    assert.equal(findMimeType("VIDEO/MP2T")?.family, "video");
    assert.equal(findMimeType(" application/typescript ")?.extensions.includes("tsx"), true);
    assert.equal(mimeFamilyOf("font/woff2"), "font");
    assert.equal(findMimeType("video/mp3t"), undefined);
    assert.equal(mimeTypeForExtension("nope"), undefined);
    assert.equal(mimeTypeForExtension(""), undefined);
  });

  it("lists the extensions of one type and the rows of one family", () => {
    assert.deepEqual(extensionsForType("video/mp2t"), ["ts"]);
    assert.deepEqual(extensionsForType("font/woff"), ["woff"]);
    assert.equal(extensionsForType("video/mp3t").length, 0);
    assert.equal(mimetypesByFamily("font").length, 6);
    assert.ok(mimetypesByFamily("text").every((row) => row.family === "text"));
  });

  it("keeps every extension on exactly one row (the collision law)", () => {
    const claimed = new Map<string, string>();
    for (const row of MIMETYPES) {
      for (const extension of row.extensions) {
        const owner = claimed.get(extension);
        assert.ok(owner === undefined, `.${extension} rides both ${owner} and ${row.type}`);
        claimed.set(extension, row.type);
      }
    }
    assert.ok(claimed.size > 1500, "the catalog maps a dense extension set");
    assert.equal(claimed.get("ts"), "video/mp2t");
    assert.equal(claimed.get("tsx"), "application/typescript");
  });
});

describe("mimetype catalog on the catalog surface", () => {
  it("serves the catalog through the typed accessor offline (the registry seed)", async () => {
    const rows = await listMimetypes();
    assert.equal(rows.length, MIMETYPE_COUNT);
    assert.ok(rows.some((row) => row.type === "video/mp2t"));
  });
});
