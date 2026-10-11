// # imagestore — the image engine of the foundry (root layer, pure logic).
// The herd formats of the family: images travel as .tzst (tar over zstd —
// the quick herd), .tar.gz (tar over gzip — the pack herd) and .tar.xz
// (tar over xz — the release herd). This module answers the honest
// conversion plan between the formats (always through the tar layer, never
// a direct recompress lie), the compression estimate per format and the
// pour order the floor keeps. Pure: bytes never move here — plans and
// numbers only. This module is the testable core of the /images page.

/** the three clone formats of the herd. */
export type ImageFormat = "tzst" | "targz" | "tarxz";

/** the format table: extension, label and the honest trait of each herd. */
export interface FormatSpec {
  id: ImageFormat;
  ext: ".tzst" | ".tar.gz" | ".tar.xz";
  label: string;
  trait: string;
}

/** the formats in floor order (the lead herd first). */
export const FORMATS: readonly FormatSpec[] = [
  { id: "tzst", ext: ".tzst", label: "the quick herd", trait: "tar over zstd — clones fast" },
  { id: "targz", ext: ".tar.gz", label: "the pack herd", trait: "tar over gzip — opens anywhere" },
  { id: "tarxz", ext: ".tar.xz", label: "the release herd", trait: "tar over xz — releases travel small" },
];

/** answers the format spec of an id (or the lead herd for unknowns — no,
 * the floor refuses unknowns honestly). */
export function formatOf(id: string): FormatSpec | undefined {
  return FORMATS.find((format) => format.id === id);
}

/** answers the format of an extension like ".tar.gz". */
export function formatFromExt(ext: string): FormatSpec | undefined {
  const clean = ext.trim().toLowerCase();
  return FORMATS.find((format) => format.ext === clean);
}

/** the conversion plan between two formats: the tar layer is unpacked once
 * and recompressed into the target — never a direct byte-to-byte lie. */
export interface ConvertPlan {
  from: FormatSpec;
  to: FormatSpec;
  /** the honest step list of the conversion */
  steps: readonly string[];
}

/** builds the conversion plan from one format into another (same format is
 * a no-op answer with a one-line plan). */
export function convertPlan(fromId: ImageFormat, toId: ImageFormat): ConvertPlan {
  const from = formatOf(fromId) ?? FORMATS[0];
  const to = formatOf(toId) ?? FORMATS[0];
  if (from.id === to.id) {
    return { from, to, steps: [`no conversion — the herd already rides ${from.ext}`] };
  }
  return {
    from,
    to,
    steps: [
      `unpack the ${from.ext} layer down to the tar stream`,
      `recompress the tar stream into ${to.ext}`,
      `seal the converted herd with its checksum (sha-256)`,
    ],
  };
}

/** the rough compressed-size estimate per format, as a share of the tar
 * stream (measured on the family trees: zstd the quickest and the tightest
 * on code, gzip the middle, xz the smallest but the slowest). */
const COMPRESS_SHARE: Readonly<Record<ImageFormat, number>> = { tzst: 0.32, targz: 0.38, tarxz: 0.26 };

/** estimates the converted size of a tar stream of `bytes` in a format. */
export function estimateSize(bytes: number, format: ImageFormat): number {
  if (bytes <= 0) return 0;
  return Math.max(1, Math.round(bytes * COMPRESS_SHARE[format]));
}

/** the pour order of the floor: the lead herd first, then the kept herds —
 * the order the /images shelf presents. */
export function pourOrder(): readonly FormatSpec[] {
  return FORMATS;
}

/** the image record the floor keeps per herd: name, format and the sealed
 * tar size. */
export interface HerdImage {
  id: string;
  name: string;
  format: ImageFormat;
  /** the uncompressed tar stream size in bytes */
  tarBytes: number;
}

/** mulberry32 — the small deterministic prng of the family engines. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** the shelf of the machine room: a seeded, honest rehearsal of images
 * (sizes derive from the seed — the surface says the shelf is a rehearsal). */
export function seedImages(seed: number, count = 5): HerdImage[] {
  const rand = mulberry32(seed);
  const images: HerdImage[] = [];
  for (let i = 0; i < count; i++) {
    const format = FORMATS[i % FORMATS.length].id;
    const tarBytes = (40 + Math.floor(rand() * 900)) * 1_000_000;
    images.push({
      id: `img-${(seed >>> 0).toString(36)}-${String(i + 1).padStart(2, "0")}`,
      name: `${["base", "toolchain", "runtime", "pack", "release"][i % 5]}-${String(i + 1).padStart(2, "0")}`,
      format,
      tarBytes,
    });
  }
  return images;
}

/** the human byte count the shelves render (tabular, always one unit). */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes;
  let unit = "B";
  for (const next of units) {
    if (value < 1024) break;
    value /= 1024;
    unit = next;
  }
  return `${value >= 100 ? Math.round(value) : value.toFixed(1)} ${unit}`;
}
