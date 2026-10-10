// # imageexport.test — the export/integration layer contract AND the wave-2
// end-to-end. Runnable with the node built-in runner (no deps, no install):
//   node --test tests/imageexport.test.ts
// The fixture is a fully documented 32-dim AudioDescriptor (every value pinned
// to its audiofeatures.ts DIM_ORDER position), and the integration chain runs
// exactly what wave 2 shipped: synthPalette (b1) → compositionGrid /
// compositionBlocks + rhythmScatter (b2) → synthTexture (b3) → synthMotion
// (b4) → exportBundle (b8). b5 imagestyles (styleForDescriptor), b6 imageproject
// (buildImageProject) and b7 imagerender (renderSvg) had not landed when this
// suite was written — toExportProject stands in for buildImageProject at the
// documented structural contract (see imageexport.ts header). Every assertion
// is deterministic: no randomness, no clock, same inputs → same digests.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AudioDescriptor } from "../audioattributes.ts";
import { compositionBlocks, compositionGrid, rhythmScatter } from "../synthcomposition.ts";
import { synthMotion } from "../synthmotion.ts";
import { synthPalette } from "../synthpalette.ts";
import { synthTexture } from "../synthtexture.ts";
import {
  ANIMATION_FPS,
  ExportError,
  MANIFEST_FRAME_CAP,
  PNG_COMPRESS_FACTOR,
  PNG_SIZE_LADDER,
  buildAnimationManifest,
  buildSvgArtifact,
  exportBundle,
  exportPlan,
  fnv1aHex,
  perturbFrame,
  thumbnailSignature,
  toExportProject,
} from "../imageexport.ts";
import type { ExportProject } from "../imageexport.ts";

// ---- the documented 32-dim fixture (values per DIM_ORDER position) ----
// 0-6 spectral: centroid .42, spread .38, rolloff .55, flatness .18, flux .35,
//   fluxVariance .28, brightness .60 — a bright, tonal, moving mix.
// 7-11 rhythm: tempo .50 (bpm pinned via scalar), pulseConfidence .82,
//   onsetDensity .42 (→ 3.36 onsets/s), grooveRegularity .71, swing .58.
// 12-15 harmony: tonalCenter .75 (tonic 8 = g#), keyStrength .64,
//   harmonicChange .40, dissonance .22 — a strong minor-leaning key.
// 16-21 timbre: noisiness .34, warmth .61, timbreBrightness .58, textureSlope
//   .45, zeroCrossings .11, contrast .52 — warm mid mix, bold dynamics.
// 22-27 energy/structure: punch .66, duration .35, peakMass .72, repetition
//   .42, narrativeContour .75 (arch), sectionDensity .60 — punchy arch build.
// 28-31 cross: brightnessPulse .30, energyDrive .68, bandTilt .40,
//   moodShadow .35 — energetic drive, mild minor depth.
const FIXTURE_VECTOR: number[] = [
  0.42, 0.38, 0.55, 0.18, 0.35, 0.28, 0.60,
  0.50, 0.82, 0.42, 0.71, 0.58,
  0.75, 0.64, 0.40, 0.22,
  0.34, 0.61, 0.58, 0.45, 0.11, 0.52,
  0.66, 0.35, 0.72, 0.42, 0.75, 0.60,
  0.30, 0.68, 0.40, 0.35,
];

/** the fused fixture descriptor: 32 dims above, bpm 120 → 500 ms motion loop. */
function fixture(): AudioDescriptor {
  return { version: 1, seed: "b7e5a1c93d204f68", vector: [...FIXTURE_VECTOR], scalar: { bpm: 120, downbeat: 4 } };
}

/** runs the shipped wave-2 chain (b1 → b4) and hands the stack to b8's seam. */
function chainProject(id = "e2e-loop"): ExportProject {
  const d = fixture();
  const blocks = rhythmScatter(d, compositionBlocks(d, compositionGrid(d)));
  return toExportProject(id, {
    descriptor: d,
    palette: synthPalette(d), // b1 imagestyles/styleForDescriptor lands upstream of this
    blocks, // b2 compositionBlocks + rhythmScatter
    texture: synthTexture(d), // b3
    motion: synthMotion(d, blocks.map((b) => b.role)), // b4
  });
}

/** asserts fn throws ExportError and answers its taxonomy code. */
function codeOf(fn: () => unknown): string {
  try {
    fn();
  } catch (e) {
    assert.ok(e instanceof ExportError, `expected ExportError, got ${String(e)}`);
    return (e as ExportError).code;
  }
  assert.fail("expected ExportError, nothing thrown");
  return "";
}

const HEX8 = /^[0-9a-f]{8}$/;

describe("wave-2 fixture + chain", () => {
  it("fixture is a documented 32-dim descriptor", () => {
    const d = fixture();
    assert.equal(d.vector.length, 32);
    for (const v of d.vector) assert.ok(Number.isFinite(v) && v >= 0 && v <= 1, `dim out of range: ${v}`);
    assert.match(d.seed, /^[0-9a-f]{16}$/);
    assert.equal(d.scalar.bpm, 120);
  });

  it("the full wave-2 chain runs deterministically end to end", () => {
    const a = chainProject();
    const b = chainProject();
    assert.deepStrictEqual(a.palette, b.palette);
    assert.deepStrictEqual(a.blocks, b.blocks);
    assert.deepStrictEqual(a.texture, b.texture);
    assert.deepStrictEqual(a.motion, b.motion);
    const roles = new Set(a.blocks.map((x) => x.role));
    for (const role of roles) assert.ok(["hero", "cadre", "field", "edge"].includes(role));
    assert.ok(a.blocks.length >= 5); // hero + ring + fill from a 6-col grid
    for (const x of a.blocks) {
      for (const v of [x.rect.x, x.rect.y, x.rect.w, x.rect.h]) assert.ok(v >= 0 && v <= 1);
    }
    assert.equal(a.motion.loopMs, 500); // 120 bpm → one beat per 500 ms
  });
});

describe("exportPlan", () => {
  it("svg plan measures the real master and leaves timing null", () => {
    const p = chainProject();
    const plan = exportPlan(p, { format: "svg" });
    assert.equal(plan.format, "svg");
    assert.equal(plan.width, 1080);
    assert.equal(plan.height, 1080);
    assert.equal(plan.fps, null);
    assert.equal(plan.loopMs, null);
    assert.equal(plan.frames, null);
    assert.ok(plan.qualityNote.length > 0);
    assert.equal(plan.estimatedBytes, buildSvgArtifact(p, { width: 1080, height: 1080 }).bytes.length);
    assert.ok(plan.estimatedBytes > 0);
  });

  it("png plan locks to the documented ladder and models RGBA deflate", () => {
    const p = chainProject();
    for (const rung of PNG_SIZE_LADDER) {
      const plan = exportPlan(p, { format: "png", width: rung.width });
      assert.equal(plan.width, rung.width);
      assert.equal(plan.height, rung.height);
      assert.equal(plan.estimatedBytes, Math.ceil(rung.width * rung.height * 4 * PNG_COMPRESS_FACTOR));
      assert.equal(plan.fps, null);
    }
    assert.equal(codeOf(() => exportPlan(p, { format: "png", width: 720 })), "export-size");
    assert.equal(codeOf(() => exportPlan(p, { format: "png", width: 1440, height: 2160 })), "export-size");
  });

  it("webm/gif require loopMs > 0 — export-loop-required", () => {
    const p = chainProject();
    assert.equal(codeOf(() => exportPlan(p, { format: "webm", fps: 30 })), "export-loop-required");
    assert.equal(codeOf(() => exportPlan(p, { format: "webm", fps: 30, loopMs: 0 })), "export-loop-required");
    assert.equal(codeOf(() => exportPlan(p, { format: "gif", fps: 30, loopMs: -5 })), "export-loop-required");
    const plan = exportPlan(p, { format: "webm", fps: 30, loopMs: 500 });
    assert.equal(plan.loopMs, 500);
    assert.equal(plan.fps, 30);
    assert.equal(plan.frames, 15); // round(500·30/1000)
    assert.ok(plan.estimatedBytes > 0);
  });

  it("animation fps rungs are exactly 24/30/60 — export-format", () => {
    const p = chainProject();
    assert.deepStrictEqual([...ANIMATION_FPS], [24, 30, 60]);
    assert.equal(codeOf(() => exportPlan(p, { format: "webm", fps: 25, loopMs: 500 })), "export-format");
    assert.equal(codeOf(() => exportPlan(p, { format: "gif", fps: 60.5, loopMs: 500 })), "export-format");
    assert.equal(codeOf(() => exportPlan(p, { format: "webm", fps: 12, loopMs: 500 })), "export-format");
    assert.equal(exportPlan(p, { format: "webm", loopMs: 500 }).fps, 30); // documented default
    assert.equal(exportPlan(p, { format: "webm", fps: 24, loopMs: 500 }).fps, 24);
  });

  it("unknown formats and wild sizes refuse", () => {
    const p = chainProject();
    assert.equal(codeOf(() => exportPlan(p, { format: "jpeg" as never })), "export-format");
    assert.equal(codeOf(() => exportPlan(p, { format: "mp4" as never })), "export-format");
    assert.equal(codeOf(() => exportPlan(p, { format: "svg", width: 32 })), "export-size");
    assert.equal(codeOf(() => exportPlan(p, { format: "svg", width: 8192 })), "export-size");
    assert.equal(codeOf(() => exportPlan(p, { format: "webm", width: 8192, fps: 30, loopMs: 500 })), "export-size");
    assert.equal(codeOf(() => exportPlan(p, { format: "svg", width: 800.5 })), "export-size");
  });

  it("plans are deterministic and estimates finite + positive for every format", () => {
    const p = chainProject();
    for (const format of ["svg", "png", "webm", "gif"] as const) {
      const options = { format, width: 1080, fps: 30, loopMs: 500 } as const;
      const a = exportPlan(p, options);
      const b = exportPlan(p, options);
      assert.deepStrictEqual(a, b, `${format} plan drifted`);
      assert.ok(Number.isFinite(a.estimatedBytes) && a.estimatedBytes > 0);
      assert.ok(a.width > 0 && a.height > 0);
    }
  });
});

describe("svg master artifact", () => {
  it("svg artifact: filename, well-formed bytes, fnv1a digest", () => {
    const p = chainProject();
    const a = buildSvgArtifact(p);
    assert.equal(a.filename, "e2e-loop.svg");
    assert.ok(a.bytes.startsWith('<svg xmlns="http://www.w3.org/2000/svg"'));
    assert.ok(a.bytes.endsWith("</svg>"));
    assert.equal(a.digest, fnv1aHex(a.bytes));
    assert.match(a.digest, HEX8);
    assert.ok(!a.bytes.includes("NaN") && !a.bytes.includes("undefined"));
    const rects = a.bytes.split("<rect").length - 1;
    assert.ok(rects >= p.blocks.length + 1); // every block + the surface ground
    assert.ok(a.bytes.includes(p.palette.surface) && a.bytes.includes(p.palette.anchor));
  });

  it("svg artifact is byte-stable across runs and size-aware", () => {
    const p = chainProject();
    assert.deepStrictEqual(buildSvgArtifact(p), buildSvgArtifact(chainProject()));
    const small = buildSvgArtifact(p, { width: 512, height: 384 });
    assert.deepStrictEqual(small, buildSvgArtifact(p, { width: 512, height: 384 }));
    assert.ok(small.bytes.startsWith('<svg xmlns="http://www.w3.org/2000/svg" width="512" height="384"'));
    assert.notEqual(small.bytes, buildSvgArtifact(p).bytes);
  });

  it("export-empty: blank id, unreadable palette, empty cast", () => {
    const p = chainProject();
    assert.equal(codeOf(() => toExportProject("", { descriptor: fixture() })), "export-empty");
    assert.equal(codeOf(() => buildSvgArtifact({ ...p, blocks: [] })), "export-empty");
    const bad = { ...p, palette: { anchor: 1 } } as unknown as ExportProject;
    assert.equal(codeOf(() => buildSvgArtifact(bad)), "export-empty");
  });
});

describe("animation manifest + frame signatures", () => {
  it("webm manifest: 15 even frames, sorted, strictly inside the loop", () => {
    const p = chainProject();
    const plan = exportPlan(p, { format: "webm", fps: 30, loopMs: 500 });
    const m = buildAnimationManifest(p, plan);
    assert.equal(m.fps, 30);
    assert.equal(m.loopMs, 500);
    assert.ok(m.frames.length <= MANIFEST_FRAME_CAP);
    assert.equal(m.frames.length, 15);
    m.frames.forEach((f, i) => {
      assert.equal(f.index, i);
      assert.match(f.signature, HEX8);
      assert.ok(f.tMs >= 0 && f.tMs < 500);
    });
    for (let i = 1; i < m.frames.length; i += 1) assert.ok(m.frames[i].tMs > m.frames[i - 1].tMs);
    assert.equal(new Set(m.frames.map((f) => f.signature)).size, m.frames.length);
  });

  it("manifest caps at exactly 128 frames for long loops", () => {
    const p = chainProject();
    const plan = exportPlan(p, { format: "gif", fps: 60, loopMs: 60000 });
    assert.equal(plan.frames, MANIFEST_FRAME_CAP);
    const m = buildAnimationManifest(p, plan);
    assert.equal(m.frames.length, MANIFEST_FRAME_CAP);
    for (let i = 1; i < m.frames.length; i += 1) assert.ok(m.frames[i].tMs > m.frames[i - 1].tMs);
    assert.ok(m.frames[m.frames.length - 1].tMs < 60000);
  });

  it("manifest refuses static plans and loopless plans", () => {
    const p = chainProject();
    const svgPlan = exportPlan(p, { format: "svg" });
    assert.equal(codeOf(() => buildAnimationManifest(p, svgPlan)), "export-format");
    const webmPlan = exportPlan(p, { format: "webm", fps: 30, loopMs: 500 });
    assert.equal(codeOf(() => buildAnimationManifest(p, { ...webmPlan, loopMs: 0 })), "export-loop-required");
  });

  it("perturbFrame: deterministic, resting camera at phase 0, riding the loop", () => {
    const p = chainProject();
    const p0 = perturbFrame(p, 0);
    assert.equal(p0.phase, 0);
    assert.equal(p0.dx, 0);
    assert.equal(p0.dy, 0);
    assert.equal(p0.rotate, 0);
    assert.ok(Number.isFinite(p0.scale) && p0.scale > 0);
    const pm = perturbFrame(p, 250);
    assert.deepStrictEqual(perturbFrame(p, 250), pm); // deterministic
    assert.equal(pm.phase, 0.5);
    // arch contour (0.75) → drift {x:9, y:-5, rotation:1}, half-loop phase
    assert.equal(pm.dx, 4.5);
    assert.equal(pm.dy, -2.5);
    assert.equal(pm.rotate, 0.5);
    assert.ok(pm.scale > 1 && pm.scale < 1.2); // beat breath inside the documented band
  });

  it("thumbnailSignature: stable, 8-hex, sensitive to time and viewport", () => {
    const p = chainProject();
    const s0 = thumbnailSignature(p, 0);
    assert.equal(s0, thumbnailSignature(p, 0));
    assert.match(s0, HEX8);
    assert.notEqual(thumbnailSignature(p, 250), s0);
    assert.notEqual(thumbnailSignature(p, 0, 512, 384), s0);
  });
});

describe("exportBundle — the wave-2 end-to-end", () => {
  const opts = { format: ["svg", "png", "webm"] as const, width: 1080, fps: 30, loopMs: 500 };

  it("E2E bundle: one svg master always ships plus each requested format", () => {
    const b = exportBundle(chainProject(), opts);
    assert.deepStrictEqual(b.artifacts.map((a) => a.kind), ["svg", "png", "webm"]);
    assert.deepStrictEqual(b.artifacts.map((a) => a.filename), ["e2e-loop.svg", "e2e-loop.png", "e2e-loop.webm"]);
    const digests = new Set<string>();
    for (const a of b.artifacts) {
      assert.match(a.digest, HEX8);
      digests.add(a.digest);
    }
    assert.equal(digests.size, 3); // pairwise distinct
    assert.equal(b.plan.format, "svg"); // primary = first requested
    assert.equal(b.plan.width, 1080);
    assert.ok(b.plan.estimatedBytes > 0);
  });

  it("digests are stable across two independent full-chain runs", () => {
    const a = exportBundle(chainProject(), opts);
    const b = exportBundle(chainProject(), opts);
    assert.deepStrictEqual(a.artifacts, b.artifacts);
    assert.deepStrictEqual(a.plan, b.plan);
  });

  it("png-only request still ships the svg master; primary plan is png", () => {
    const p = chainProject();
    const b = exportBundle(p, { format: "png", width: 1440 });
    assert.deepStrictEqual(b.artifacts.map((a) => a.kind), ["svg", "png"]);
    assert.equal(b.plan.format, "png");
    assert.equal(b.plan.width, 1440);
    assert.equal(b.plan.height, 1440);
    assert.equal(b.artifacts[0].digest, buildSvgArtifact(p, { width: 1440, height: 1440 }).digest);
  });

  it("gif artifact rides the documented frame arithmetic", () => {
    const p = chainProject();
    const b = exportBundle(p, { format: "gif", fps: 24, loopMs: 375 });
    assert.deepStrictEqual(b.artifacts.map((a) => a.kind), ["svg", "gif"]);
    assert.equal(b.plan.frames, 9); // round(375·24/1000)
    assert.ok(b.artifacts[1].digest !== b.artifacts[0].digest);
  });

  it("bundle refuses bad entries and empty requests", () => {
    const p = chainProject();
    assert.equal(codeOf(() => exportBundle(p, { format: ["svg", "mp4"] as never })), "export-format");
    assert.equal(codeOf(() => exportBundle(p, { format: [] })), "export-format");
    assert.equal(codeOf(() => exportBundle(p, {} as never)), "export-format");
  });

  it("ExportError carries its taxonomy code, name and message", () => {
    try {
      exportPlan(chainProject(), { format: "jpeg" as never });
      assert.fail("expected throw");
    } catch (e) {
      assert.ok(e instanceof ExportError && e instanceof Error);
      assert.equal((e as ExportError).code, "export-format");
      assert.equal(e.name, "ExportError");
      assert.ok(e.message.length > 0);
    }
  });

  it("toExportProject derives and sanitizes damaged or missing pieces", () => {
    const d = fixture();
    const full = chainProject();
    assert.deepStrictEqual(full.palette, synthPalette(d));
    assert.deepStrictEqual(full.blocks, rhythmScatter(d, compositionBlocks(d, compositionGrid(d))));
    assert.ok(full.texture.grainOpacity <= full.texture.grainDensity + 0.2); // documented coupling
    assert.equal(full.motion.loopMs, 500);
    // damaged palette → re-derived from the descriptor, bit-for-bit
    const healed = toExportProject("e2e-loop", { descriptor: d, palette: { anchor: 1 } as never });
    assert.deepStrictEqual(healed.palette, synthPalette(d));
    // everything missing → every layer still derivable
    const bare = toExportProject("bare", { descriptor: d });
    assert.deepStrictEqual(bare.palette, synthPalette(d));
    assert.ok(bare.blocks.length >= 1);
    assert.ok(Number.isFinite(bare.texture.glazeLayers) && bare.texture.glazeLayers >= 1);
    assert.ok(bare.motion.loopMs > 0);
  });
});
