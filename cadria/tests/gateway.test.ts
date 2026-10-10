// # gateway.test — http surface tests for the cadria gateway (task 9-3-c2),
// runnable with the node built-in runner:
//   node --test tests/gateway.test.ts
// Every suite rides hono's app.request pattern over an in-memory
// GenerationStore stub — proving the gateway leans on the storage seam
// contract only, never on sqlite/generation.ts. The wav fixture synthesizes a
// 4-second song the same way tests/audiopipeline.test.ts does (tone +
// wavBytes helpers, no binary files on disk).

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Hono } from "hono";
import { createGateway, type AnalysisRecord, type GenerationRecord, type GenerationStore } from "../gateway.ts";

const SAMPLE_RATE = 48000;

// ---- fixture: steady 120bpm kick spine under saw intro, hats, triad, pad ----

function tone(track: Float32Array, sampleRate: number, startMs: number, durationMs: number, hz: number, gain = 0.6, kind: "sine" | "saw" = "sine"): void {
  const start = Math.round((startMs / 1000) * sampleRate);
  const length = Math.round((durationMs / 1000) * sampleRate);
  for (let i = 0; i < length && start + i < track.length; i++) {
    const phase = (hz * i) / sampleRate;
    const value = kind === "saw" ? 2 * (phase - Math.floor(phase + 0.5)) : Math.sin(2 * Math.PI * phase);
    const fade = i < length * 0.1 ? i / (length * 0.1) : i > length * 0.85 ? (length - i) / (length * 0.15) : 1;
    track[start + i] += gain * value * fade;
  }
}

function songFixture(): Float32Array {
  const track = new Float32Array(4 * SAMPLE_RATE);
  for (let t = 0; t < 4000; t += 500) tone(track, SAMPLE_RATE, t, 120, 60, 0.7);
  tone(track, SAMPLE_RATE, 0, 1000, 110, 0.5, "saw");
  for (const hz of [261.63, 329.63, 392.0]) tone(track, SAMPLE_RATE, 2000, 1000, hz, 0.4);
  for (const [i, hz] of [220, 196, 174.61].entries()) tone(track, SAMPLE_RATE, 2000 + i * 120, 1000 - i * 120, hz, 0.45 - i * 0.12);
  return track;
}

/** wraps pcm into a minimal 16-bit mono wav byte buffer (RIFF header). */
function wavBytes(samples: Float32Array, sampleRate: number): Uint8Array<ArrayBuffer> {
  const pcm = new Int16Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    pcm[i] = Math.round(clamped * 32767);
  }
  const bytes = new Uint8Array(44 + pcm.length * 2);
  const view = new DataView(bytes.buffer);
  const text = (offset: number, value: string): void => {
    for (let i = 0; i < value.length; i++) view.setUint8(offset + i, value.charCodeAt(i));
  };
  text(0, "RIFF");
  view.setUint32(4, 36 + pcm.length * 2, true);
  text(8, "WAVE");
  text(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  text(36, "data");
  view.setUint32(40, pcm.length * 2, true);
  bytes.set(new Uint8Array(pcm.buffer), 44);
  return bytes;
}

// ---- seam stub: the in-memory GenerationStore the gateway is coded against ----

function stubStore(): GenerationStore & { generations: GenerationRecord[]; analyses: AnalysisRecord[] } {
  const generations: GenerationRecord[] = [];
  const analyses: AnalysisRecord[] = [];
  return {
    generations,
    analyses,
    saveGeneration(record) {
      const at = generations.findIndex((row) => row.id === record.id);
      if (at >= 0) generations.splice(at, 1);
      generations.unshift(record);
      return { ok: true };
    },
    getGeneration(id) {
      return generations.find((row) => row.id === id) ?? null;
    },
    listGenerations(limit) {
      return generations.slice(0, Math.max(0, Math.floor(limit)));
    },
    deleteGeneration(id) {
      const at = generations.findIndex((row) => row.id === id);
      return at >= 0 ? (generations.splice(at, 1), true) : false;
    },
    saveAnalysis(record) {
      const at = analyses.findIndex((row) => row.id === record.id);
      if (at >= 0) analyses.splice(at, 1);
      analyses.unshift(record);
      return { ok: true };
    },
    getAnalysis(id) {
      return analyses.find((row) => row.id === id) ?? null;
    },
    listAnalyses(limit) {
      return analyses.slice(0, Math.max(0, Math.floor(limit)));
    },
  };
}

const jsonPost = (path: string, body: unknown | string): RequestInit => ({
  method: "POST",
  headers: { "content-type": "application/json" },
  body: typeof body === "string" ? body : JSON.stringify(body),
});

describe("gateway routes", () => {
  const store = stubStore();
  const app: Hono = createGateway(store);
  let analysisId = "";
  let projectId = "";

  it("answers health with ok + service", async () => {
    const response = await app.request("/api/health");
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true, service: "cadria-gateway" });
  });

  it("analyzes wav bytes over application/octet-stream and persists the record", async () => {
    const response = await app.request("/api/analyze", {
      method: "POST",
      headers: { "content-type": "application/octet-stream" },
      body: wavBytes(songFixture(), SAMPLE_RATE),
    });
    assert.equal(response.status, 201);
    const payload = (await response.json()) as { analysisId: string; report: { schemaVersion: number; source: { kind: string } } };
    assert.match(payload.analysisId, /^ana-[0-9a-f]{8}$/);
    assert.equal(payload.report.schemaVersion, 1);
    assert.equal(payload.report.source.kind, "wav");
    analysisId = payload.analysisId;
    const stored = store.getAnalysis(analysisId);
    assert.ok(stored, "the store received the analysis record");
    assert.equal(stored?.sourceKind, "wav");
    assert.ok(stored?.reportJson.includes("descriptor"));
  });

  it("analyzes pcm samples over json too", async () => {
    const samples = songFixture();
    const response = await app.request("/api/analyze", jsonPost("/api/analyze", {
      samplesBase64: Buffer.from(samples.buffer).toString("base64"),
      sampleRate: SAMPLE_RATE,
    }));
    assert.equal(response.status, 201);
    const payload = (await response.json()) as { report: { source: { kind: string } } };
    assert.equal(payload.report.source.kind, "pcm");
    assert.ok(store.analyses.length >= 2);
  });

  it("generates a project from an analysisId", async () => {
    const response = await app.request("/api/generate", jsonPost("/api/generate", { analysisId }));
    assert.equal(response.status, 201);
    const payload = (await response.json()) as { projectId: string; project: { version: number; seed: string; style: string }; digest: string };
    assert.match(payload.projectId, /^gen-[0-9a-z]{8}-[0-9a-f]{8}$/);
    assert.equal(payload.project.version, 1);
    assert.ok(payload.project.seed.length > 0);
    assert.match(payload.digest, /^[0-9a-f]{8}$/);
    projectId = payload.projectId;
    const stored = store.getGeneration(projectId);
    assert.ok(stored, "the store received the generation record");
    assert.equal(stored?.style, payload.project.style);
  });

  it("generates from a bare descriptor with a named style", async () => {
    const report = JSON.parse(store.getAnalysis(analysisId)?.reportJson ?? "null") as { descriptor: unknown };
    const response = await app.request("/api/generate", jsonPost("/api/generate", { descriptor: report.descriptor, style: "nocturn" }));
    assert.equal(response.status, 201);
    const payload = (await response.json()) as { project: { style: string; canvas: { width: number; height: number } } };
    assert.equal(payload.project.style, "nocturn");
    assert.equal(payload.project.canvas.width, 1080);
  });

  it("renders the stored project as byte-deterministic svg", async () => {
    const first = await app.request(`/api/render/${projectId}`);
    assert.equal(first.status, 200);
    assert.ok((first.headers.get("content-type") ?? "").startsWith("image/svg+xml"));
    const svg = await first.text();
    assert.ok(svg.startsWith("<svg") || svg.startsWith("<?xml"), `svg head: ${svg.slice(0, 40)}`);
    const second = await app.request(`/api/render/${projectId}`);
    assert.equal(second.status, 200);
    assert.equal(await second.text(), svg, "two render requests must be byte-equal");
  });

  it("lists projects as metadata without the heavy json fields", async () => {
    const response = await app.request("/api/projects");
    assert.equal(response.status, 200);
    const payload = (await response.json()) as { projects: Record<string, unknown>[]; count: number };
    assert.ok(payload.projects.length >= 2);
    assert.equal(payload.count, payload.projects.length);
    const row = payload.projects[0];
    for (const key of ["id", "seed", "style", "bpm", "keyTonic", "keyMode", "key", "durationMs", "createdAt"]) {
      assert.ok(key in row, `metadata carries ${key}`);
    }
    for (const heavy of ["descriptorJson", "projectJson", "svgDigest"]) {
      assert.ok(!(heavy in row), `metadata must not carry ${heavy}`);
    }
    assert.ok(typeof row.bpm === "number" && typeof row.key === "string" && row.key.includes(" "));
  });

  it("lists analyses as metadata without reportJson", async () => {
    const response = await app.request("/api/analyses");
    assert.equal(response.status, 200);
    const payload = (await response.json()) as { analyses: Record<string, unknown>[]; count: number };
    assert.ok(payload.analyses.length >= 1);
    const row = payload.analyses[0];
    for (const key of ["id", "sourceKind", "sampleRate", "durationMs", "bpm", "keyName", "createdAt"]) {
      assert.ok(key in row, `metadata carries ${key}`);
    }
    assert.ok(!("reportJson" in row), "metadata must not carry reportJson");
  });

  it("clamps the list limit into 1-200, defaulting when unreadable", async () => {
    for (let i = store.generations.length; i < 205; i++) {
      store.generations.push({
        id: `gen-filler${String(i).padStart(3, "0")}-aaaaaaaa`, seed: "filler", style: "opaline", bpm: 120,
        keyTonic: 0, keyMode: "major", durationMs: 4000, descriptorJson: "{}", projectJson: "{}", svgDigest: "00000000",
        createdAt: "2026-01-01T00:00:00.000Z",
      });
    }
    const high = (await (await app.request("/api/projects?limit=500")).json()) as { projects: unknown[] };
    assert.equal(high.projects.length, 200, "limit folds down to the 200 ceiling");
    const zero = (await (await app.request("/api/projects?limit=0")).json()) as { projects: unknown[] };
    assert.equal(zero.projects.length, 1, "limit folds up to the 1 floor");
    const unreadable = (await (await app.request("/api/projects?limit=abc")).json()) as { projects: unknown[] };
    assert.equal(unreadable.projects.length, 50, "unreadable limit takes the default 50");
  });
});

describe("gateway error mapping", () => {
  it("answers 404 gateway-unknown-project for an unknown render id", async () => {
    const response = await createGateway(stubStore()).request("/api/render/gen-deadbeef-00000000");
    assert.equal(response.status, 404);
    const payload = (await response.json()) as { ok: boolean; code: string };
    assert.equal(payload.ok, false);
    assert.equal(payload.code, "gateway-unknown-project");
  });

  it("answers 404 gateway-unknown-analysis for a dead analysisId", async () => {
    const response = await createGateway(stubStore()).request("/api/generate", jsonPost("/api/generate", { analysisId: "ana-00000000" }));
    assert.equal(response.status, 404);
    const payload = (await response.json()) as { code: string };
    assert.equal(payload.code, "gateway-unknown-analysis");
  });

  it("maps a malformed json body to gateway-bad-json", async () => {
    const response = await createGateway(stubStore()).request("/api/generate", jsonPost("/api/generate", "{not json"));
    assert.equal(response.status, 400);
    const payload = (await response.json()) as { code: string };
    assert.equal(payload.code, "gateway-bad-json");
  });

  it("maps a body with no source to gateway-no-source", async () => {
    const response = await createGateway(stubStore()).request("/api/generate", jsonPost("/api/generate", {}));
    assert.equal(response.status, 400);
    const payload = (await response.json()) as { code: string };
    assert.equal(payload.code, "gateway-no-source");
  });

  it("rejects an unknown style name with style-unknown", async () => {
    const response = await createGateway(stubStore()).request("/api/generate", jsonPost("/api/generate", { descriptor: { version: 1, seed: "x", vector: [], scalar: {} }, style: "nonexistent" }));
    assert.equal(response.status, 400);
    const payload = (await response.json()) as { code: string };
    assert.equal(payload.code, "style-unknown");
  });

  it("maps oversized bodies to 413 gateway-payload-too-large", async () => {
    const response = await createGateway(stubStore()).request("/api/analyze", {
      method: "POST",
      headers: { "content-type": "application/octet-stream" },
      body: new ArrayBuffer(8 * 1024 * 1024 + 1), // one byte past MAX_BODY_BYTES
    });
    assert.equal(response.status, 413);
    const payload = (await response.json()) as { code: string };
    assert.equal(payload.code, "gateway-payload-too-large");
  });

  it("maps a refusing store write to 502 { ok: false, gateway-store-error }", async () => {
    const base = stubStore();
    const app = createGateway({
      ...base,
      saveGeneration: () => ({ ok: false, error: "sqlite locked" }),
    });
    const analyzed = await app.request("/api/analyze", {
      method: "POST",
      headers: { "content-type": "application/octet-stream" },
      body: wavBytes(songFixture(), SAMPLE_RATE),
    });
    const { analysisId } = (await analyzed.json()) as { analysisId: string };
    const response = await app.request("/api/generate", jsonPost("/api/generate", { analysisId }));
    assert.equal(response.status, 502);
    const payload = (await response.json()) as { ok: boolean; code: string; error: string };
    assert.equal(payload.ok, false);
    assert.equal(payload.code, "gateway-store-error");
    assert.equal(payload.error, "sqlite locked");
  });

  it("maps empty wav bytes onto the pipeline error taxonomy", async () => {
    const response = await createGateway(stubStore()).request("/api/analyze", {
      method: "POST",
      headers: { "content-type": "application/octet-stream" },
      body: new Uint8Array(0),
    });
    assert.equal(response.status, 400);
    const payload = (await response.json()) as { code: string };
    assert.equal(payload.code, "pipeline-empty-samples");
  });
});
