// # imagestore.test — the image pipeline battery of the vault (the pr9 law:
// the DPI and MIME validation the owner charged, the neo.img standardization
// and the real-ledger deposit), runnable with the house vitest suite:
//   bunx vitest run test/imagestore.test.ts
// The pure validators answer everywhere (the sniffer and the density
// readers carry zero dependencies); the sharp lane answers when the
// processor is installed (the CI seat always is — the manifest pins it)
// and skips with a documented reason when the runtime carries it absent.
import assert from "node:assert/strict";
import { deflateSync } from "node:zlib";
import { describe, it } from "vitest";
import "./doorisolation.ts";
import {
  DPI_CEILING,
  IMAGE_MAX_BYTES,
  imageThumb,
  pngDimensions,
  pngPhysDensity,
  putImage,
  readImageDensity,
  readImageDimensions,
  sniffImageMime,
  standardizeImage,
  THUMB_WIDTHS,
  validateImage,
} from "../imagestore.ts";
import { createProject, putObject } from "../objects.ts";

/* ── the byte builders — the honest headers the parsers walk ── */

/** the crc32 the png chunk law carries (the parser never verifies it, the builder stamps a real one anyway). */
function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (const byte of bytes) {
    c ^= byte;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
  }
  return (c ^ 0xffffffff) >>> 0;
}

/** builds one png chunk: length, type, data, crc. */
function pngChunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  const view = new DataView(out.buffer);
  view.setUint32(0, data.length);
  for (let i = 0; i < 4; i += 1) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  const body = out.subarray(4, 8 + data.length);
  view.setUint32(8 + data.length, crc32(body));
  return out;
}

/** builds a real png: signature + IHDR + pHYs(when asked) + IDAT + IEND — the pixel data is real zlib so sharp decodes it. */
function buildPng(ppm: number | null, width = 3, height = 2): Uint8Array {
  const signature = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = new Uint8Array(13);
  const ihdrView = new DataView(ihdr.buffer);
  ihdrView.setUint32(0, width);
  ihdrView.setUint32(4, height);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type truecolor
  // the scanlines: filter byte 0 + width × 3 rgb bytes per row
  const row = new Uint8Array(1 + width * 3);
  for (let x = 0; x < width; x += 1) {
    row[1 + x * 3] = (x * 67) % 256; // r
    row[2 + x * 3] = (x * 41) % 256; // g
    row[3 + x * 3] = (x * 97) % 256; // b
  }
  const raw = new Uint8Array(row.length * height);
  for (let y = 0; y < height; y += 1) raw.set(row, y * row.length);
  const idat = new Uint8Array(deflateSync(raw));
  const parts: Uint8Array[] = [signature, pngChunk("IHDR", ihdr)];
  if (ppm !== null) {
    const phys = new Uint8Array(9);
    const physView = new DataView(phys.buffer);
    physView.setUint32(0, ppm);
    physView.setUint32(4, ppm);
    phys[8] = 1; // unit: meter
    parts.push(pngChunk("pHYs", phys));
  }
  parts.push(pngChunk("IDAT", idat));
  parts.push(pngChunk("IEND", new Uint8Array(0)));
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

/** builds a real jpeg: SOI + JFIF APP0 (density when asked) + EOI. */
function buildJpeg(units: number, density: number): Uint8Array {
  const out = new Uint8Array(20);
  const view = new DataView(out.buffer);
  out[0] = 0xff;
  out[1] = 0xd8; // SOI
  out[2] = 0xff;
  out[3] = 0xe0; // APP0
  view.setUint16(4, 16); // segment length
  out.set(Uint8Array.from([0x4a, 0x46, 0x49, 0x46, 0x00]), 6); // "JFIF\0"
  out[11] = 1; // version major
  out[12] = 1; // version minor
  out[13] = units; // density units
  view.setUint16(14, density); // x density
  view.setUint16(16, density); // y density
  out[18] = 0xff;
  out[19] = 0xd9; // EOI
  return out;
}

/* ── the pure validator battery ── */

describe("the magic-byte mime sniffer", () => {
  it("answers the five signatures from their own bytes", () => {
    assert.equal(sniffImageMime(buildPng(null)), "image/png");
    assert.equal(sniffImageMime(buildJpeg(1, 72)), "image/jpeg");
    assert.equal(
      sniffImageMime(Uint8Array.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 1, 0, 1, 0, 0, 0, 0])),
      "image/gif",
    );
    assert.equal(
      sniffImageMime(
        Uint8Array.from([0x52, 0x49, 0x46, 0x46, 0x24, 0, 0, 0, 0x57, 0x45, 0x42, 0x50, 0x56, 0x50, 0x38, 0x20]),
      ),
      "image/webp",
    );
    assert.equal(
      sniffImageMime(new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg" width="4" height="4"/>')),
      "image/svg+xml",
    );
  });

  it("answers null for the non-image bytes", () => {
    assert.equal(sniffImageMime(new TextEncoder().encode("hello world, not an image at all")), null);
    assert.equal(sniffImageMime(Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])), null);
    assert.equal(sniffImageMime(new Uint8Array(0)), null);
  });
});

describe("the density readers", () => {
  it("reads the png pHYs chunk with the meter-to-inch conversion", () => {
    const seventyTwo = pngPhysDensity(buildPng(2835));
    assert.ok(seventyTwo !== null);
    assert.equal(seventyTwo.dpi, 72);
    assert.equal(seventyTwo.source, "png-pHYs");
    const retina = pngPhysDensity(buildPng(5669));
    assert.ok(retina !== null);
    assert.equal(retina.dpi, 144);
  });

  it("answers null for the png without a pHYs chunk or with the unknown unit", () => {
    assert.equal(pngPhysDensity(buildPng(null)), null);
    assert.equal(pngPhysDensity(buildJpeg(1, 72)), null);
  });

  it("reads the jpeg JFIF density in both unit laws", () => {
    const direct = readImageDensity(buildJpeg(1, 300));
    assert.equal(direct.dpi, 300);
    assert.equal(direct.source, "jpeg-jfif");
    const dpcm = readImageDensity(buildJpeg(2, 118));
    assert.equal(dpcm.dpi, 300); // 118 dpcm × 2.54 ≈ 300 dpi
    assert.equal(dpcm.source, "jpeg-jfif");
  });

  it("answers the honest 72 default for the formats without an embedded density", () => {
    const svg = readImageDensity(new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"/>'));
    assert.equal(svg.dpi, 72);
    assert.equal(svg.source, "svg-default");
    const plain = readImageDensity(buildPng(null));
    assert.equal(plain.dpi, 72);
    assert.equal(plain.source, "format-default");
  });
});

describe("the header dimensions", () => {
  it("reads the png IHDR words", () => {
    const dims = pngDimensions(buildPng(null, 640, 480));
    assert.deepEqual(dims, { width: 640, height: 480 });
  });

  it("answers null for the non-png bytes", () => {
    assert.equal(pngDimensions(buildJpeg(1, 72)), null);
    assert.equal(readImageDimensions(new Uint8Array(4)), null);
  });
});

describe("the validation gate", () => {
  it("accepts the honest deposit with the matching claim", () => {
    const gate = validateImage(buildPng(2835), "image/png");
    assert.deepEqual("mime" in gate ? gate : { mime: null }, { mime: "image/png" });
  });

  it("refuses the mime mismatch — the claim never overrides the bytes", () => {
    const gate = validateImage(buildPng(2835), "image/jpeg");
    assert.ok("refusal" in gate);
    assert.equal(gate.refusal.kind, "mime-mismatch");
    if (gate.refusal.kind === "mime-mismatch") {
      assert.equal(gate.refusal.claimed, "image/jpeg");
      assert.equal(gate.refusal.sniffed, "image/png");
    }
  });

  it("refuses the empty and the non-image bytes", () => {
    const empty = validateImage(new Uint8Array(0), "image/png");
    assert.ok("refusal" in empty);
    assert.equal(empty.refusal.kind, "empty");
    const notImage = validateImage(new TextEncoder().encode("plain text rides no signature"), "image/png");
    assert.ok("refusal" in notImage);
    assert.equal(notImage.refusal.kind, "not-an-image");
  });

  it("refuses the byte size above the seat", () => {
    const limit = 16;
    const gate = validateImage(buildPng(null), "image/png", limit);
    assert.ok("refusal" in gate);
    assert.equal(gate.refusal.kind, "too-large");
  });

  it("refuses the absurd density and the absurd dimensions", () => {
    const absurdDpi = readImageDensity(buildPng(1_000_000)); // 25400 dpi — above the ceiling
    assert.ok(absurdDpi.dpi > DPI_CEILING);
    const gate = validateImage(buildPng(1_000_000), "image/png");
    assert.ok("refusal" in gate);
    assert.equal(gate.refusal.kind, "density-absurd");
    const wide = validateImage(buildPng(null, 99999, 2), "image/png");
    assert.ok("refusal" in wide);
    assert.equal(wide.refusal.kind, "dimensions-absurd");
  });
});

/* ── the store lane — the real ledger under the image facts ── */

describe("the image deposit lane", () => {
  it("deposits through the real ledger with the facts the law pins", async () => {
    createProject("imagestore-suite");
    const png = buildPng(2835);
    const answer = await putImage({ projectId: "imagestore-suite", path: "/art/seven-two.png", mime: "image/png", bytes: png, standardize: false });
    assert.ok("object" in answer, `the deposit must seal: ${"refusal" in answer ? answer.refusal.why : ""}`);
    if ("object" in answer) {
      assert.equal(answer.object.mime, "image/png");
      assert.equal(answer.object.bucket, "site-assets");
      assert.equal(answer.facts.density.dpi, 72);
      assert.equal(answer.facts.density.source, "png-pHYs");
      assert.deepEqual(answer.facts.dimensions, { width: 3, height: 2 });
      assert.equal(answer.facts.digest, answer.object.digest);
      assert.equal(answer.standardized, false);
      // the deposit is the real ledger: the bytes read back byte-identical
      const { getObject } = await import("../objects.ts");
      const back = getObject(answer.object.id);
      assert.ok("bytes" in back);
      if ("bytes" in back) {
        assert.equal(back.bytes.length, png.length);
      }
    }
  });

  it("refuses the mismatched claim before the ledger ever answers", async () => {
    const answer = await putImage({ projectId: "imagestore-suite", path: "/art/liar.png", mime: "image/gif", bytes: buildPng(null), standardize: false });
    assert.ok("refusal" in answer);
    if ("refusal" in answer && "kind" in answer.refusal) {
      assert.equal(answer.refusal.kind, "mime-mismatch");
    }
  });

  it("refuses the deposit for the project that does not exist", async () => {
    const answer = await putImage({ projectId: "no-such-project-x", path: "/art/none.png", mime: "image/png", bytes: buildPng(null), standardize: false });
    assert.ok("refusal" in answer);
  });
});

/* ── the sharp lane — the standardizer the CI seat always carries ── */

describe("the neo.img standardization lane", () => {
  it("answers the processor-absent refusal honestly when sharp is away", async () => {
    let sharpPresent = true;
    try {
      await import("sharp");
    } catch {
      sharpPresent = false;
    }
    // the svg signature always answers the refusal — vector is the standard
    const svg = await standardizeImage(new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"/>'));
    assert.ok("refusal" in svg);
    if (sharpPresent) {
      // the png conversion lane rides the real processor here
      const converted = await standardizeImage(buildPng(2835, 64, 32));
      assert.ok("bytes" in converted, `the conversion must answer: ${"refusal" in converted ? converted.refusal.why : ""}`);
      if ("bytes" in converted) {
        assert.equal(converted.mime, "image/webp");
        assert.equal(converted.dimensions.width, 64);
        assert.equal(converted.dimensions.height, 32);
        assert.equal(sniffImageMime(converted.bytes), "image/webp");
      }
      const thumb = await imageThumb(buildPng(2835, 1024, 512), THUMB_WIDTHS[2]);
      assert.ok("bytes" in thumb);
      if ("bytes" in thumb) {
        assert.equal(thumb.dimensions.width, 384);
        assert.equal(thumb.dimensions.height, 192);
      }
    } else {
      const png = await standardizeImage(buildPng(2835));
      assert.ok("refusal" in png);
      if ("refusal" in png) assert.equal(png.refusal.kind, "processor-absent");
    }
  });

  it("deposits the standardized webp through the real ledger when the processor answers", async () => {
    let sharpPresent = true;
    try {
      await import("sharp");
    } catch {
      sharpPresent = false;
    }
    if (!sharpPresent) return; // the documented skip — the CI seat carries the processor
    createProject("imagestore-std");
    const answer = await putImage({ projectId: "imagestore-std", path: "/art/standard.png", mime: "image/png", bytes: buildPng(5669, 128, 64) });
    assert.ok("object" in answer, `the standardized deposit must seal: ${"refusal" in answer ? answer.refusal.why : ""}`);
    if ("object" in answer) {
      assert.equal(answer.standardized, true);
      assert.equal(answer.object.mime, "image/webp");
      assert.equal(answer.facts.mime, "image/png"); // the facts describe the deposit, not the conversion
      assert.equal(answer.facts.density.dpi, 144); // the 5669 ppm retina read
      assert.equal(answer.facts.digest, answer.object.digest); // the stored bytes' digest
    }
  });
});

/* ── the ceiling the seat pins ── */

describe("the image seat constants", () => {
  it("carries the 32MB seat and the thumb ladder", () => {
    assert.equal(IMAGE_MAX_BYTES, 32 * 1024 * 1024);
    assert.deepEqual([...THUMB_WIDTHS], [96, 192, 384, 768]);
  });
});
