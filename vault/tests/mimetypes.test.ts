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
import { existsSync, readFileSync } from "node:fs";
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

/* the saddle golden table — the family's own mime lane (saddle/mime.types, the
 * nginx-format registry the monorepo ships beside the sandbox engine). The
 * golden-table law: every type row and every extension mapping it carries
 * rides the vault corpus too — the family tables never fork. The battery runs
 * in the monorepo form (the sibling table landed beside vault); the published
 * package ships without the sibling, so the battery answers skipped there and
 * the monorepo ci carries the law. */
const GOLDEN_TABLE = new URL("../../saddle/mime.types", import.meta.url);
const GOLDEN_LANDED = existsSync(GOLDEN_TABLE);

/** Parses one nginx-format mime table: type then space-separated extensions,
 * trailing semicolon stripped, comments and blanks dropped. */
function goldenRows(text: string): { type: string; extensions: string[] }[] {
  const rows: { type: string; extensions: string[] }[] = [];
  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim().replace(/;$/, "");
    if (line.length === 0 || line.startsWith("#")) continue;
    const fields = line.split(/\s+/).filter(Boolean);
    if (fields.length === 0) continue;
    rows.push({ type: fields[0].toLowerCase(), extensions: fields.slice(1).map((e) => e.toLowerCase()) });
  }
  return rows;
}

describe("the saddle golden table (the family mime lane, one table, zero fork)", () => {
  const rows = GOLDEN_LANDED ? goldenRows(readFileSync(GOLDEN_TABLE, "utf8")) : [];

  it("lands in the monorepo and parses a real registry, never an empty read", () => {
    assert.ok(GOLDEN_LANDED, "the saddle golden table landed beside vault (the monorepo form)");
    assert.ok(rows.length > 2000, `the golden table carries ${rows.length} type rows`);
  });

  it("carries every golden type row in the vault corpus", (ctx) => {
    const missing: string[] = [];
    for (const row of rows) {
      if (mimeTypeRow(row.type) === undefined) missing.push(row.type);
    }
    ctx.expect(missing).toEqual([]);
  });

  it("claims every golden extension mapping (the collision law answers the claimant)", (ctx) => {
    const missing: string[] = [];
    for (const row of rows) {
      for (const extension of row.extensions) {
        if (mimeTypeFor(extension) === undefined) missing.push(`${extension} -> ${row.type}`);
      }
    }
    ctx.expect(missing).toEqual([]);
  });

  it("answers the golden multi-part lanes the nginx names carry", () => {
    assert.equal(mimeTypeFor("cwl.json"), "application/cwl+json");
    assert.equal(mimeTypeFor("sarif.json"), "application/sarif+json");
    assert.equal(mimeTypeFor("spdx.json"), "application/spdx+json");
    assert.equal(mimeTypeFor("tm.json"), "application/tm+json");
    assert.equal(mimeTypeFor("tm.jsonld"), "application/tm+json");
    assert.equal(mimeTypeFor("gpkg.tar"), "application/vnd.gentoo.gpkg");
    assert.equal(mimeTypeFor("1905.1"), "application/vnd.ieee.1905");
    assert.equal(mimeTypeFor("syft.json"), "application/vnd.syft+json");
    assert.equal(mimeTypeFor("msd"), "application/vnd.fdsn.mseed");
    assert.equal(mimeTypeFor("pcf.z"), "application/x-font-pcf");
    assert.equal(mimeTypeFor("mpv"), "video/x-matroska");
  });

  it("carries the golden inode rows (the filesystem pseudo-family)", () => {
    const inodeTypes = [
      "inode/blockdevice",
      "inode/chardevice",
      "inode/directory",
      "inode/directory-locked",
      "inode/fifo",
      "inode/socket",
    ];
    for (const type of inodeTypes) {
      assert.equal(mimeTypeRow(type)?.family, "inode", `the row ${type} rides the inode family`);
    }
    assert.ok(MIME_FAMILIES.includes("inode"), "the inode family rides the catalog");
  });
});
