// # gateway — the cadria SERVER API layer (task 9-3-c2): one hono app over the
// wave-1 analysis and wave-2 image waves. Routes: GET /api/health → { ok, service } ·
// POST /api/analyze — wav bytes on application/octet-stream, or json { samplesBase64
// (float32 LE interleaved), sampleRate, channels? } → analyzeWavBytes/analyzePcm →
// 201 { analysisId, report } · POST /api/generate — { analysisId } | { report } |
// { descriptor, style?, seed? } → styleForDescriptor/styleByName → synthPalette +
// compositionBlocks + rhythmScatter + synthTexture + synthMotion → buildImageProject →
// 201 { projectId, project, digest } · GET /api/render/:id — byte-deterministic
// image/svg+xml · GET /api/projects?limit= + /api/analyses?limit= — metadata lists,
// limit clamped 1-200 (default 50). Every 4xx/5xx answers { ok: false, error, code }:
// gateway-payload-too-large (413, > MAX_BODY_BYTES) · gateway-bad-json ·
// gateway-missing-samples / gateway-bad-sample-rate / gateway-no-source /
// gateway-missing-descriptor (400) · gateway-unknown-analysis / gateway-unknown-project
// (404) · gateway-store-error (502) · gateway-corrupt-analysis / gateway-corrupt-project
// (500, stored json unparseable); pipeline-* map to 400 (too-short → 422) and
// wav-*/decode-*/project-*/style-unknown pass through on 400.
// Deterministic ids, no crypto.random: `ana-${fnv1a8(reportJson)}` and
// `gen-${seedPrefix8}-${fnv1a8(projectJson)}` — 8-hex fnv-1a (the imageproject/
// imagestyles hash family) over the exact serialized payload that gets stored.
// STORAGE SEAM: the record/store contract below is the interface the db agent
// implements as generationStore() in generation.ts — never imported statically:
// defaultGateway() resolves it via `await import("./generation.ts")` inside
// try/catch and degrades to memoryStore() when the module or its sqlite layer is
// absent, so importing gateway.ts never hard-crashes; tests inject their own store
// via createGateway(store). Serve entry serveGateway() reads PORT/HOST env
// (defaults 8787 / 0.0.0.0 — the only port/host literals; a `import.meta.main`
// guard is not portable under hono/node, so callers invoke serveGateway directly).

import { serve } from "@hono/node-server";
import { type Context, Hono } from "hono";
import type { AudioDescriptor } from "./audioattributes.ts";
import { AudioDecodeError } from "./audiodecode.ts";
import { type AnalysisReport, analyzePcm, analyzeWavBytes, PipelineError } from "./audiopipeline.ts";
import { buildImageProject, type ImageProject, ProjectError, parseProject, serializeProject } from "./imageproject.ts";
import { renderCommands, renderSvg } from "./imagerender.ts";
import { styleByName, styleForDescriptor } from "./imagestyles.ts";
import { compositionBlocks, rhythmScatter } from "./synthcomposition.ts";
import { synthMotion } from "./synthmotion.ts";
import { synthPalette } from "./synthpalette.ts";
import { synthTexture } from "./synthtexture.ts";

// ---- storage seam contract (mirrors the generation.ts interface verbatim; runs before it lands) ----

export type GenerationRecord = {
  id: string;
  seed: string;
  style: string;
  bpm: number;
  keyTonic: number;
  keyMode: string;
  durationMs: number;
  descriptorJson: string;
  projectJson: string;
  svgDigest: string;
  createdAt: string;
};
export type AnalysisRecord = {
  id: string;
  sourceKind: string;
  sampleRate: number;
  durationMs: number;
  bpm: number;
  keyName: string;
  reportJson: string;
  createdAt: string;
};
export interface GenerationStore {
  saveGeneration(record: GenerationRecord): { ok: true } | { ok: false; error: string };
  getGeneration(id: string): GenerationRecord | null;
  listGenerations(limit: number): GenerationRecord[];
  deleteGeneration(id: string): boolean;
  saveAnalysis(record: AnalysisRecord): { ok: true } | { ok: false; error: string };
  getAnalysis(id: string): AnalysisRecord | null;
  listAnalyses(limit: number): AnalysisRecord[];
}

/** the error type the gateway raises itself: status + stable code, mapped by onError. */
export class GatewayError extends Error {
  readonly status: number;
  readonly code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "GatewayError";
    this.status = status;
    this.code = code;
  }
}

/** body ceiling 8MB (~3-minute 48kHz mono wav); serve defaults are the only port/host literals. */
export const MAX_BODY_BYTES = 8 * 1024 * 1024;
export const DEFAULT_PORT = 8787;
export const DEFAULT_HOST = "0.0.0.0";
const DEFAULT_LIST_LIMIT = 50,
  LIST_LIMIT_MIN = 1,
  LIST_LIMIT_MAX = 200;
const PITCH_CLASSES = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"];

// ---- deterministic helpers (fnv-1a family, both bytes per char) ----

const FNV_BASIS = 0x811c9dc5,
  FNV_PRIME = 0x01000193;

function fnv1a(text: string): number {
  let lane = FNV_BASIS;
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    lane = Math.imul((lane ^ (code & 0xff)) >>> 0, FNV_PRIME) >>> 0;
    lane = Math.imul((lane ^ ((code >>> 8) & 0xff)) >>> 0, FNV_PRIME) >>> 0;
  }
  return lane >>> 0;
}

const hex8 = (lane: number): string => (lane >>> 0).toString(16).padStart(8, "0");

/** first 8 alphanumerics of the seed, zero-padded — the human part of gen ids. */
function seedPrefix8(seed: string): string {
  const folded = typeof seed === "string" ? seed.toLowerCase().replace(/[^a-z0-9]+/g, "") : "";
  return (folded.length > 0 ? folded : "seed").slice(0, 8).padEnd(8, "0");
}

const pitchName = (tonic: number): string => PITCH_CLASSES[Math.min(11, Math.max(0, Math.round(tonic)))];

/** total scalar read off a descriptor: finite passes, everything else answers 0. */
function scalarNum(descriptor: AudioDescriptor, key: string): number {
  const scalar = (descriptor as { scalar?: unknown })?.scalar;
  const value = scalar !== null && typeof scalar === "object" ? (scalar as Record<string, unknown>)[key] : undefined;
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

// ---- request plumbing: body limit, json gate, list clamp, error envelope ----

function errorResponse(status: number, code: string, message: string): Response {
  return new Response(JSON.stringify({ ok: false, error: message, code }), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

/** reads the request body once, refusing anything past MAX_BODY_BYTES (declared or actual). */
async function readBodyBytes(c: Context): Promise<Uint8Array> {
  const declared = Number(c.req.header("content-length"));
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES)
    throw new GatewayError(
      413,
      "gateway-payload-too-large",
      `gateway: body declares ${declared} bytes over the ${MAX_BODY_BYTES} limit`,
    );
  const buffer = await c.req.arrayBuffer();
  if (buffer.byteLength > MAX_BODY_BYTES)
    throw new GatewayError(
      413,
      "gateway-payload-too-large",
      `gateway: body is ${buffer.byteLength} bytes over the ${MAX_BODY_BYTES} limit`,
    );
  return new Uint8Array(buffer);
}

/** json body gate: parse failures and non-object payloads answer gateway-bad-json. */
function parseJsonObject(text: string): Record<string, unknown> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    throw new GatewayError(400, "gateway-bad-json", `gateway: body is not valid json: ${(error as Error).message}`);
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed))
    throw new GatewayError(400, "gateway-bad-json", "gateway: body must be a json object");
  return parsed as Record<string, unknown>;
}

/** list clamp: numeric limits fold into 1-200, anything unreadable takes the default. */
function clampLimit(raw: string | undefined): number {
  const asked = Number(raw);
  if (!Number.isFinite(asked)) return DEFAULT_LIST_LIMIT;
  return Math.min(LIST_LIMIT_MAX, Math.max(LIST_LIMIT_MIN, Math.floor(asked)));
}

// ---- generate body resolution: analysisId | report | descriptor ----

function resolveDescriptor(body: Record<string, unknown>, store: GenerationStore): AudioDescriptor {
  if (typeof body.analysisId === "string" && body.analysisId.length > 0) {
    const record = store.getAnalysis(body.analysisId);
    if (!record) throw new GatewayError(404, "gateway-unknown-analysis", `gateway: no analysis ${body.analysisId}`);
    let report: unknown;
    try {
      report = JSON.parse(record.reportJson);
    } catch (error) {
      throw new GatewayError(
        500,
        "gateway-corrupt-analysis",
        `gateway: stored analysis ${record.id} is unparseable: ${(error as Error).message}`,
      );
    }
    const descriptor = (report as { descriptor?: unknown } | null)?.descriptor;
    if (descriptor === null || typeof descriptor !== "object")
      throw new GatewayError(500, "gateway-corrupt-analysis", "gateway: stored analysis carries no descriptor");
    return descriptor as AudioDescriptor;
  }
  if (body.report !== null && typeof body.report === "object" && !Array.isArray(body.report)) {
    const descriptor = (body.report as { descriptor?: unknown }).descriptor;
    if (descriptor === null || typeof descriptor !== "object")
      throw new GatewayError(400, "gateway-missing-descriptor", "gateway: report body carries no descriptor object");
    return descriptor as AudioDescriptor;
  }
  if (body.descriptor !== null && typeof body.descriptor === "object" && !Array.isArray(body.descriptor))
    return body.descriptor as AudioDescriptor;
  throw new GatewayError(
    400,
    "gateway-no-source",
    "gateway: generate needs { analysisId }, { report } or { descriptor }",
  );
}

// ---- degraded fallback store: keeps the default gateway alive when the
// generation.ts/sqlite seam is absent (newest-first, id-replacing writes) ----
export function memoryStore(): GenerationStore {
  const generations: GenerationRecord[] = [];
  const analyses: AnalysisRecord[] = [];
  const put = <T extends { id: string }>(table: T[], record: T): { ok: true } | { ok: false; error: string } => {
    if (record === null || typeof record !== "object" || typeof record.id !== "string" || record.id.length === 0)
      return { ok: false, error: "memory store: record needs a non-empty string id" };
    const at = table.findIndex((row) => row.id === record.id);
    if (at >= 0) table.splice(at, 1);
    table.unshift(record);
    return { ok: true };
  };
  const take = <T extends { id: string }>(table: T[], id: string): T | null =>
    table.find((row) => row.id === id) ?? null;
  const trim = (limit: number): number => Math.max(0, Math.floor(limit));
  return {
    saveGeneration: (record) => put(generations, record),
    getGeneration: (id) => take(generations, id),
    listGenerations: (limit) => generations.slice(0, trim(limit)),
    deleteGeneration: (id) => {
      const at = generations.findIndex((row) => row.id === id);
      if (at >= 0) {
        generations.splice(at, 1);
        return true;
      }
      return false;
    },
    saveAnalysis: (record) => put(analyses, record),
    getAnalysis: (id) => take(analyses, id),
    listAnalyses: (limit) => analyses.slice(0, trim(limit)),
  };
}

/** createGateway — the hono app over any GenerationStore: handlers throw typed errors, onError maps them. */
export function createGateway(store: GenerationStore): Hono {
  const app = new Hono();
  app.onError((error, c) => {
    if (error instanceof GatewayError) return errorResponse(error.status, error.code, error.message);
    if (error instanceof PipelineError)
      return errorResponse(error.code === "pipeline-too-short" ? 422 : 400, error.code, error.message);
    if (error instanceof AudioDecodeError) return errorResponse(400, error.code, error.message);
    if (error instanceof ProjectError) return errorResponse(400, error.code, error.message);
    if ((error as { code?: string } | null)?.code === "style-unknown")
      return errorResponse(400, "style-unknown", (error as Error).message);
    console.error(`gateway: unhandled ${c.req.method} ${c.req.path}:`, error);
    return errorResponse(500, "gateway-internal", error instanceof Error ? error.message : "unknown gateway failure");
  });

  app.get("/api/health", (c) => c.json({ ok: true, service: "cadria-gateway" }));

  app.post("/api/analyze", async (c) => {
    const bytes = await readBodyBytes(c);
    let report: AnalysisReport;
    if ((c.req.header("content-type") ?? "").toLowerCase().includes("application/json")) {
      const body = parseJsonObject(new TextDecoder().decode(bytes));
      if (typeof body.samplesBase64 !== "string" || body.samplesBase64.length === 0)
        throw new GatewayError(
          400,
          "gateway-missing-samples",
          "gateway: json analyze needs samplesBase64 (float32 LE interleaved)",
        );
      if (typeof body.sampleRate !== "number" || !Number.isFinite(body.sampleRate) || body.sampleRate <= 0)
        throw new GatewayError(400, "gateway-bad-sample-rate", "gateway: json analyze needs a finite sampleRate > 0");
      const raw = Buffer.from(body.samplesBase64, "base64");
      const samples = new Float32Array(raw.buffer.slice(raw.byteOffset, raw.byteOffset + (raw.byteLength & ~3)));
      const channels =
        typeof body.channels === "number" && Number.isFinite(body.channels)
          ? Math.max(1, Math.floor(body.channels))
          : 1;
      report = analyzePcm(samples, body.sampleRate, channels);
    } else {
      report = analyzeWavBytes(bytes);
    }
    const reportJson = JSON.stringify(report);
    const record: AnalysisRecord = {
      id: `ana-${hex8(fnv1a(reportJson))}`,
      sourceKind: report.source.kind,
      sampleRate: report.source.sampleRate,
      durationMs: Math.round(report.source.durationMs),
      bpm: Math.round(report.rhythm.bpm),
      keyName: `${pitchName(report.harmonic.key.tonic)} ${report.harmonic.key.mode}`,
      reportJson,
      createdAt: new Date().toISOString(),
    };
    const saved = store.saveAnalysis(record);
    if (!saved.ok) throw new GatewayError(502, "gateway-store-error", saved.error);
    return c.json({ analysisId: record.id, report }, 201);
  });

  app.post("/api/generate", async (c) => {
    const body = parseJsonObject(new TextDecoder().decode(await readBodyBytes(c)));
    const descriptor = resolveDescriptor(body, store);
    const style =
      typeof body.style === "string" && body.style.trim().length > 0
        ? styleByName(body.style)
        : styleForDescriptor(descriptor);
    // wave-2 chain per mission: the style names the project; the four specs are
    // descriptor-driven per their module contracts (applyStyleBias stays a render-wave
    // concern — the ImageProject carries no bias block).
    const project = buildImageProject({
      descriptor,
      seed: typeof body.seed === "string" && body.seed.length > 0 ? body.seed : undefined,
      style: style.name,
      palette: synthPalette(descriptor),
      blocks: rhythmScatter(descriptor, compositionBlocks(descriptor)),
      texture: synthTexture(descriptor),
      motion: synthMotion(descriptor),
    });
    const projectJson = serializeProject(project);
    const svgDigest = hex8(fnv1a(renderSvg(renderCommands(project))));
    const id = `gen-${seedPrefix8(project.seed)}-${hex8(fnv1a(projectJson))}`;
    const record: GenerationRecord = {
      id,
      seed: project.seed,
      style: project.style,
      bpm: Math.max(0, Math.round(scalarNum(descriptor, "bpm"))),
      keyTonic: Math.min(11, Math.max(0, Math.round(scalarNum(descriptor, "tonic")))),
      keyMode: scalarNum(descriptor, "minor") >= 0.5 ? "minor" : "major",
      durationMs: Math.max(0, Math.round(scalarNum(descriptor, "durationMs"))),
      descriptorJson: JSON.stringify(descriptor),
      projectJson,
      svgDigest,
      createdAt: project.createdAt,
    };
    const saved = store.saveGeneration(record);
    if (!saved.ok) throw new GatewayError(502, "gateway-store-error", saved.error);
    return c.json({ projectId: id, project, digest: svgDigest }, 201);
  });

  app.get("/api/render/:id", (c) => {
    const record = store.getGeneration(c.req.param("id"));
    if (!record) throw new GatewayError(404, "gateway-unknown-project", `gateway: no generation ${c.req.param("id")}`);
    let project: ImageProject;
    try {
      project = parseProject(record.projectJson);
    } catch (error) {
      throw new GatewayError(
        500,
        "gateway-corrupt-project",
        `gateway: stored project ${record.id} failed to parse: ${(error as Error).message}`,
      );
    }
    return c.body(renderSvg(renderCommands(project)), 200, { "content-type": "image/svg+xml; charset=utf-8" });
  });

  app.get("/api/projects", (c) => {
    const projects = store.listGenerations(clampLimit(c.req.query("limit"))).map((record) => ({
      id: record.id,
      seed: record.seed,
      style: record.style,
      bpm: record.bpm,
      keyTonic: record.keyTonic,
      keyMode: record.keyMode,
      key: `${pitchName(record.keyTonic)} ${record.keyMode}`,
      durationMs: record.durationMs,
      createdAt: record.createdAt,
    }));
    return c.json({ projects, count: projects.length });
  });

  app.get("/api/analyses", (c) => {
    const analyses = store.listAnalyses(clampLimit(c.req.query("limit"))).map((record) => ({
      id: record.id,
      sourceKind: record.sourceKind,
      sampleRate: record.sampleRate,
      durationMs: record.durationMs,
      bpm: record.bpm,
      keyName: record.keyName,
      createdAt: record.createdAt,
    }));
    return c.json({ analyses, count: analyses.length });
  });

  return app;
}

// ---- default wiring + serve entry ----

/** defaultGateway — lazily resolves the real store: dynamic import of generation.ts
 * (the db agent's sqlite generationStore) inside try/catch, degrading to memoryStore()
 * when the module or its sqlite layer is absent. Never rejects, never hard-crashes. */
export async function defaultGateway(): Promise<Hono> {
  try {
    const mod = (await import("./generation.ts")) as Partial<{ generationStore: () => GenerationStore }>;
    if (typeof mod.generationStore !== "function") throw new Error("generation.ts did not export generationStore()");
    return createGateway(mod.generationStore());
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.warn(`gateway: generation store unavailable (${reason}) — degraded in-memory store active`);
    return createGateway(memoryStore());
  }
}

/** lazily wired default app — the guarded `createGateway(generationStore())` export. */
export const app: Promise<Hono> = defaultGateway();

/** PORT/HOST env reads — the documented defaults live in DEFAULT_PORT/DEFAULT_HOST. */
const envPort = (): number => {
  const raw = Number(process.env.PORT);
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : DEFAULT_PORT;
};
const envHost = (): string =>
  typeof process.env.HOST === "string" && process.env.HOST.length > 0 ? process.env.HOST : DEFAULT_HOST;

/** serveGateway — the node entry: boots the default app over @hono/node-server.
 * Port/host come from the arguments (programmatic use) falling back to PORT/HOST env. */
export async function serveGateway(
  port: number = envPort(),
  hostname: string = envHost(),
): Promise<ReturnType<typeof serve>> {
  const application = await app;
  return serve({ fetch: application.fetch, port, hostname }, (info) => {
    console.log(`cadria-gateway listening on http://${info.address}:${info.port}`);
  });
}
