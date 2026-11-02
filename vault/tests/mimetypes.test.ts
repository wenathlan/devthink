// # mimetypes.test — the mimetypes pillar of the vault, runnable with the
// house vitest suite:
//   bunx vitest run tests/mimetypes.test.ts
// The pillar's laws: the registry corpus is real (the counts the pillar
// announces — the types above three thousand, the whole entry count above
// six thousand: every type row plus every extension mapping), the family
// law rows answer (.ts rides video/mp2t, .tsx rides application/typescript
// — the argan gateway precedent), the serving index resolves collisions by
// the corpus order (the first family claiming an extension keeps it), and
// an unknown extension answers undefined so the internal root serves the
// honest octet-stream default, never a guess.
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  contentTypeFor,
  extensionOf,
  extensionsFor,
  MIME_ENTRY_COUNT,
  MIME_EXTENSION_COUNT,
  MIME_FAMILIES,
  MIME_TYPE_COUNT,
  MIMETYPES,
  mimeTypeFor,
  mimeTypeRow,
} from "../mimetypes.ts";

describe("the registry counts (the pillar's own numbers)", () => {
  it("carries the media type count above three thousand", () => {
    assert.ok(MIME_TYPE_COUNT > 3000, `the corpus carries ${MIME_TYPE_COUNT} types`);
    assert.equal(MIMETYPES.length, MIME_TYPE_COUNT);
  });

  it("carries the extension mappings above two thousand", () => {
    assert.ok(MIME_EXTENSION_COUNT > 2000, `the corpus carries ${MIME_EXTENSION_COUNT} extension mappings`);
  });

  it("announces the whole entry count above six thousand (rows plus mappings)", () => {
    assert.equal(MIME_ENTRY_COUNT, MIME_TYPE_COUNT + MIME_EXTENSION_COUNT);
    assert.ok(MIME_ENTRY_COUNT > 6000, `the pillar serves ${MIME_ENTRY_COUNT} entries`);
  });

  it("keeps the corpus honest: no duplicate type, every row lowercase, every family real", () => {
    const seen = new Set<string>();
    for (const row of MIMETYPES) {
      assert.equal(row.type, row.type.toLowerCase(), `${row.type} stays lowercase`);
      assert.ok(!seen.has(row.type), `the type ${row.type} answers once`);
      seen.add(row.type);
      assert.equal(row.family, row.type.split("/")[0], `${row.type} carries its own family`);
      for (const extension of row.extensions) {
        assert.equal(extension, extension.toLowerCase(), `the extension ${extension} stays lowercase`);
      }
    }
  });
});

describe("the family law rows and the serving index", () => {
  it("answers the law rows the family precedent pins", () => {
    assert.equal(mimeTypeFor("ts"), "video/mp2t");
    assert.equal(mimeTypeFor(".tsx"), "application/typescript");
    assert.equal(mimeTypeFor("html"), "text/html");
    assert.equal(mimeTypeFor("css"), "text/css");
    assert.equal(mimeTypeFor("js"), "text/javascript");
    assert.equal(mimeTypeFor("json"), "application/json");
    assert.equal(mimeTypeFor("svg"), "image/svg+xml");
    assert.equal(mimeTypeFor("wasm"), "application/wasm");
    assert.equal(mimeTypeFor("woff2"), "font/woff2");
    assert.equal(mimeTypeFor("webmanifest"), "application/manifest+json");
  });

  it("resolves collisions by the corpus order — the first family claiming an extension keeps it", () => {
    // .mts is claimed by application/typescript (application family first),
    // video/mp2t and model/vnd.mts after — the collision law answers.
    assert.equal(mimeTypeFor("mts"), "application/typescript");
    const claimants = MIMETYPES.filter((row) => row.extensions.includes("mts")).map((row) => row.type);
    assert.ok(claimants.length > 1, "the collision is real");
    assert.equal(claimants.indexOf(mimeTypeFor("mts") ?? ""), 0);
  });

  it("answers undefined for an unknown extension — the honest octet-stream lane", () => {
    assert.equal(mimeTypeFor("zzzznope"), undefined);
    assert.equal(mimeTypeFor(""), undefined);
    assert.equal(contentTypeFor("/a/b/zzzznope"), "application/octet-stream");
  });

  it("reads the extension off a path, case-insensitive, and answers the content type", () => {
    assert.equal(extensionOf("/docs/page.TS"), "ts");
    assert.equal(extensionOf("/no/ext"), "");
    assert.equal(extensionOf("/dotted./name"), "");
    assert.equal(contentTypeFor("/docs/page.ts"), "video/mp2t");
    assert.equal(contentTypeFor("/docs/app.tsx"), "application/typescript");
    assert.equal(contentTypeFor("/index.html"), "text/html");
    assert.equal(contentTypeFor("/archive.tar.gz"), "application/gzip");
  });
});

describe("the catalog lookup lane", () => {
  it("answers the extensions of a type and its row", () => {
    assert.deepEqual(extensionsFor("video/mp2t"), ["ts", "m2t", "m2ts", "mts"]);
    assert.ok((extensionsFor("text/html") ?? []).includes("htm"));
    assert.equal(mimeTypeRow("video/mp2t")?.family, "video");
    assert.equal(extensionsFor("no/such-type"), undefined);
    assert.equal(mimeTypeRow("no/such-type"), undefined);
  });

  it("carries the canonical families in the collision order", () => {
    assert.equal(MIME_FAMILIES[0], "application");
    for (const family of ["video", "audio", "image", "font", "model", "chemical", "message", "multipart", "text"]) {
      assert.ok(MIME_FAMILIES.includes(family), `the family ${family} rides the corpus`);
    }
  });
});
