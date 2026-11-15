/**
 * intelligence.ts — the AI planning, provenance, retrieval and metrics
 * domain of the devthink family (the saddle ownership law, wave a,
 * actions 108-112: the intelligence domain moved out of the saddle
 * engine — the master virtualization engine keeps only the
 * virtualization modalities, and every workload feature that is not
 * sandbox/vm/runner/vgpu/vcpu/ports/hardware-virtual rides its new
 * owner; devthink answers the intelligence lane).
 *
 * This file is the v2.0.0 grand-merge consolidation of the former nested
 * folders of the repository (ai) into the single
 * root-level domain file: one optimized TypeScript file per correlated
 * domain, ordinal sections, JSDoc on every block, intra-domain imports
 * dissolved. Every capability of every source file is preserved here;
 * the pure re-export barrels (none in this domain) folded their surface
 * into this file directly. Zero runtime imports: the domain stays
 * browser-pure (the crypto.subtle digest the rag manifest hashes ride
 * degrades to the deterministic byte fallback under hosts without it).
 */

/* ════════════════════════════════════════════════════════════════════ */
/* Section 1: ai/provenance.ts — context provenance links retrieved chunks to source, query and transformation metadata. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * context provenance links retrieved chunks to source, query and transformation metadata.
 */

/** one retrieved chunk a provenance record carries (the loose input form:
 * every field answers a sensible default the record normalizes). */
export interface provenancechunkinput {
  id?: string | number;
  contenthash?: string;
  score?: number;
  headingpath?: string;
  tokencount?: number;
  citation?: string;
}

/** the provenance call shape: a source or a source url names the record,
 * the chunks and the metadata ride beside them. */
export interface provenanceinput {
  source?: string;
  sourceurl?: string;
  documentid?: string;
  query?: string;
  retrievedat?: number;
  chunks?: provenancechunkinput[];
  metadata?: Record<string, unknown>;
}

/** the serializable retrieval record provenance answers (the normalized
 * form the merge lane and the context readers consume). */
export interface provenancerecord {
  version: number;
  source: string;
  sourceurl?: string;
  documentid?: string;
  query?: string;
  retrievedat: number;
  chunks: Array<{ id: string; contenthash?: string; score?: number; headingpath?: string; tokencount?: number; citation?: string }>;
  metadata: Record<string, unknown>;
}

/** Creates a serializable retrieval record for an agent context result. */
export function provenance(input: provenanceinput = {}) {
  if (!input.source && !input.sourceurl) throw new TypeError("provenance requires a source");
  return { version: 1, source: (input.source ?? input.sourceurl) as string, sourceurl: input.sourceurl, documentid: input.documentid, query: input.query, retrievedat: Number(input.retrievedat ?? Date.now()), chunks: Array.isArray(input.chunks) ? input.chunks.map((chunk: any, index: any) => ({ id: String(chunk.id ?? index), contenthash: chunk.contenthash, score: chunk.score === undefined ? undefined : Number(chunk.score), headingpath: chunk.headingpath, tokencount: chunk.tokencount, citation: chunk.citation ?? input.sourceurl })) : [], metadata: { ...(input.metadata ?? {}) } } satisfies provenancerecord;
}

/** Merges provenance records while deduplicating chunk identifiers. */
export function mergeprovenance(records: provenancerecord[] = []) {
  const valid = records.filter(Boolean);
  const chunks: any[] = [];
  const seen = new Set();
  for (const record of valid) for (const chunk of record.chunks ?? []) { const key = `${record.documentid ?? record.source}:${chunk.id}`; if (seen.has(key)) continue; seen.add(key); chunks.push({ ...chunk, source: record.source, documentid: record.documentid }); }
  return { version: 1, sources: [...new Set(valid.map((record: any) => record.source))], chunks, mergedat: Date.now() };
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 2: ai/tokens.ts — token helpers use configurable model ratios and never require a provider tokenizer. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * token helpers use configurable model ratios and never require a provider tokenizer.
 */
const ratios = Object.freeze({ default: 4, gpt: 3.5, claude: 3.2, gemini: 3.5 });

export function estimatetokens(text: any, model = "default") { const ratio = (ratios as Record<string, number>)[model] ?? ratios.default; return Math.ceil(String(text ?? "").length / ratio); }
export function fitscontext(text: any, context: any, model = "default") { return estimatetokens(text, model) <= context; }
export function tokenbudget(text: any, options: Record<string, any> = {}) { const tokens = estimatetokens(text, options.model); return { tokens, context: options.context ?? null, fits: options.context == null ? true : tokens <= options.context, remaining: options.context == null ? null : Math.max(0, options.context - tokens) }; }
export function settokenratios(values: Record<string, any> = {}) { Object.assign(ratios, values); return { ...ratios }; }

/* ════════════════════════════════════════════════════════════════════ */
/* Section 3: ai/chunk.ts — markdown chunking preserves heading paths and uses paragraph boundaries before hard cuts. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * markdown chunking preserves heading paths and uses paragraph boundaries before hard cuts.
 */

export function chunkmarkdown(markdown: any, options: Record<string, any> = {}) {
  const maxtokens = options.maxtokens ?? 512;
  const overlap = options.overlaptokens ?? 50;
  const lines = String(markdown ?? "").split(/\r?\n/);
  const chunks: any[] = [];
  let headingpath: any[] = [];
  let buffer: string[] = [];
  function flush() { if (!buffer.length) return; const content = buffer.join("\n").trim(); if (content) chunks.push({ content, headingpath: [...headingpath], tokencount: estimatetokens(content, options.model) }); buffer = []; }
  for (const line of lines) {
    const heading = line.match(/^(#{1,6})[ \t]+(\S.*)$/);
    if (heading) { flush(); const level = heading[1].length; headingpath = headingpath.slice(0, level - 1); headingpath[level - 1] = heading[2].trim(); buffer.push(line); continue; }
    buffer.push(line);
    if (estimatetokens(buffer.join("\n"), options.model) > maxtokens) { const last: any = buffer.pop(); flush(); const overlaptext = buffer.slice(-overlap).join("\n"); buffer = overlaptext ? [overlaptext, last] : [last]; }
  }
  flush();
  return chunks.map((chunk: any, index: any) => ({ ...chunk, id: `chunk${index}` }));
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 4: ai/rag.ts — rag manifests connect chunks to embedding stores without forcing a vendor client. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * rag manifests connect chunks to embedding stores without forcing a vendor client.
 */
export async function ragmanifest(input: Record<string, any> = {}) {
  const chunks = input.chunks ?? [];
  const unique = [];
  const hashes = new Set();
  for (const chunk of chunks) { const hash = await hashtext(chunk.content); if (hashes.has(hash)) continue; hashes.add(hash); unique.push({ ...chunk, contenthash: hash, documentid: hash.slice(0, 16), metadata: { ...(input.metadata ?? {}), ...(chunk.metadata ?? {}) } }); }
  return { documentid: (await hashtext(input.source ?? unique.map((chunk: any) => chunk.content).join("\n"))).slice(0, 16), source: input.source, chunks: unique, embeddingmodel: input.embeddingmodel, embeddingdimensions: input.embeddingdimensions, createdat: Date.now() };
}

export function vectorrecord(chunk: any, vector: any, options: Record<string, any> = {}) { return { id: `${chunk.documentid}-${chunk.id}`, vector, metadata: { headingpath: chunk.headingpath, contenthash: chunk.contenthash, sourceurl: options.sourceurl, tokencount: chunk.tokencount, contenttype: options.contenttype ?? "text", language: options.language ?? "en", embeddingmodel: options.embeddingmodel, embeddingdimensions: vector?.length } }; }

async function hashtext(text: any) { const bytes = new TextEncoder().encode(String(text)); if (globalThis.crypto?.subtle) { const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes); return [...new Uint8Array(digest)].map((value: any) => value.toString(16).padStart(2, "0")).join(""); } return Array.from(bytes).map((value: any) => value.toString(16).padStart(2, "0")).join("").slice(0, 64).padEnd(64, "0"); }

/* ════════════════════════════════════════════════════════════════════ */
/* Section 5: ai/llmstxt.ts — llms text generation creates compact absolute links for agent consumption. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * llms text generation creates compact absolute links for agent consumption.
 */
export function llmstxt(options: Record<string, any> = {}) {
  const title = options.title ?? "devthink";
  const description = options.description ?? "the reasoning workspace of the devthink family";
  const pages = (options.pages ?? []).filter((page: any) => page?.url && /^https:\/\//.test(page.url)).slice(0, options.limit ?? 100);
  const lines = [`# ${title}`, `> ${description}`, "", "## pages", "", ...pages.map((page: any) => `- [${page.title ?? page.url}](${page.url}): ${(page.description ?? "").slice(0, 100)}`)];
  return `${lines.join("\n")}\n`;
}

export function llmsfull(options: Record<string, any> = {}) { return (options.pages ?? []).filter((page: any) => page?.url && /^https:\/\//.test(page.url)).map((page: any) => `# ${page.title ?? page.url}\n\nsource: ${page.url}\n\n${page.content ?? ""}`).join("\n\n---\n\n"); }

/* ════════════════════════════════════════════════════════════════════ */
/* Section 6: ai/metrics.ts — metrics keeps low-cardinality counters and durations without requiring a telemetry vendor. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * metrics keeps low-cardinality counters and durations without requiring a telemetry vendor.
 */

/** Creates an in-memory metric collector with bounded names and labels. */
export function metricstore(options: Record<string, any> = {}) {
  const maxnames = Number(options.maxnames ?? 256);
  const values = new Map();
  const durations = new Map();
  function key(name: any, labels: Record<string, any> = {}) { const sorted = Object.entries(labels).slice(0, 8).sort(([left], [right]) => left.localeCompare(right)); return `${String(name)}|${JSON.stringify(sorted)}`; }
  function count(name: any, amount = 1, labels: Record<string, any> = {}) { if (values.size >= maxnames && !values.has(key(name, labels))) throw new Error("metric cardinality limit reached"); const metric = key(name, labels); values.set(metric, (values.get(metric) ?? 0) + Number(amount)); return values.get(metric); }
  function observe(name: any, milliseconds: any, labels: Record<string, any> = {}) { const metric = key(name, labels); const list = durations.get(metric) ?? []; if (list.length < 1000) list.push(Number(milliseconds)); durations.set(metric, list); return Number(milliseconds); }
  function snapshot() { return { counters: Object.fromEntries(values), durations: Object.fromEntries([...durations].map(([name, list]) => [name, { count: list.length, total: list.reduce((sum: any, value: any) => sum + value, 0), max: Math.max(0, ...list) }])) }; }
  function reset() { values.clear(); durations.clear(); }
  return { count, observe, snapshot, reset };
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 7: the model intelligence ranking — smart-first routing. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * the model intelligence ranking — the single source of truth for the
 * devthink meta-model's smart-first routing (the gateway port law, 2.0.184):
 * the meta-model must ALWAYS call the smartest backends first, in order,
 * rotating every 6 messages per session; on any upstream error (429/503/…)
 * the fallback walks the pool in the same intelligence order.
 *
 * Sources (researched 2026-11-13, artificialanalysis.ai):
 *  - Artificial Analysis Intelligence Index v5.0.1 (current scale, ~0–70)
 *    https://artificialanalysis.ai/models — primary metric
 *  - Artificial Analysis Progress Index v1 (÷ 10) — fallback for models
 *    deprecated on the current index (GLM-4.x, Kimi K2, DeepSeek V3.x,
 *    Qwen3, Gemini 2.5, Llama 3.x, o3, GPT-5 …)
 *    https://artificialanalysis.ai/evaluations/artificial-analysis-progress-index
 *  - Family estimates (marked "est") — models with no AA coverage, placed
 *    by family/size relative to scored siblings (muse-glimmer, laguna,
 *    nemotron lightning/bolt/nano-omni, glm fast/turbo/air variants…).
 *
 * Example comparison (the owner's reference):
 *  https://artificialanalysis.ai/models/comparisons/claude-fable-5-2-vs-gemini-4-carbon
 */

/** how many of the smartest backends the devthink rotation walks */
export const smartpoolsize = 10;

/**
 * family scores — matched as substrings of the normalized model id, longest
 * key first (so "glm-5.3-flash" wins over "glm-5.3"). every entry carries its
 * source: aa = intelligence index v5.0.1, pi = progress index v1 ÷ 10,
 * est = family estimate.
 */
const familytable: Array<[string, number]> = [
  // ---- 2026 frontier (aa intelligence index v5.0.1) ----
  ["kimi-k3.1", 46], // aa — #1 open weights
  ["kimi-k3", 32], // aa (max) / pi 319.9
  ["deepseek-v4.1", 33], // aa
  ["deepseek-v4", 23], // aa
  ["glm-5.3-fast", 30], // est — fast variant of glm-5.3 (aa 32) / flash 28
  ["glm-5.3-flash", 28], // aa
  ["glm-5.3-air", 22], // est — air (light) variant
  ["glm-5.3", 32], // aa — #3 open weights
  ["glm-5.2", 30], // pi 302.5
  ["glm-5.1", 29], // pi 286.5
  ["glm-5v", 24], // est — vision variant of glm-5
  ["glm-5-turbo", 25], // est — turbo variant of glm-5
  ["glm-5", 28], // pi 280.9
  ["glm-4.7-flash", 23], // pi 227.5
  ["glm-4.7", 27], // pi 268.0
  ["glm-4.6", 24], // pi 243.1
  ["glm-4.5-air", 21], // pi 214.9
  ["glm-4.5", 23], // pi 227.5
  ["glm-4-plus", 22], // est — 4.x plus tier
  ["glm-4-flash", 12], // est — 4.x flash tier
  ["glm-4", 20], // est — 4.x base
  // ---- minimax / stepfun (aa v5.0.1) ----
  ["minimax-m3.1-flash", 29], // aa
  ["minimax-m3.1", 29], // aa
  ["minimax-m3", 27], // est — m3 generation
  ["minimax-m2", 24], // est
  ["minimax-m1", 20], // est
  ["minimax", 20], // est — older generations
  ["step-5", 29], // aa (step 5 preview)
  ["step-3", 18], // est
  // ---- mistral (aa v5.0.1) ----
  ["mistral-large-4", 26], // aa (high)
  ["mistral-medium-3.5", 5], // aa
  ["mistral-small-4", 4], // aa
  ["mistral-small-3", 12], // est
  ["mistral-nemo", 10], // est
  ["mistral", 12], // est — unspecified mistral
  ["ministral", 8], // est
  ["mixtral", 12], // est
  // ---- nvidia nemotron (aa v5.0.1 + family est) ----
  ["nemotron-3.5-super-vl", 14], // aa
  ["nemotron-3-ultra", 12], // aa (550b-a55b reasoning)
  ["nemotron-3.5-lightning", 8], // est — fast moe tier
  ["nemotron-3.5-bolt", 6], // est — edge tier
  ["nemotron-3-nano-omni", 5], // est — nano omni (aa nano 4b = 2)
  ["nemotron-nano-9b", 20], // pi 196.1
  ["nemotron-super-49b", 21], // pi (v1.5 215.3 / v1 188.5)
  ["nemotron-3-nano", 2], // aa (nano 4b)
  ["nemotron-3", 10], // est — unspecified nemotron 3
  // ---- google gemma (aa v5.0.1 + pi) ----
  ["gemma-4-31b", 4], // aa
  ["gemma-4", 4], // aa
  ["gemma-3-27b", 16], // pi 160.1
  ["gemma-3", 15], // est
  ["gemma-2", 10], // est
  // ---- meta muse / llama ----
  ["muse-wonder", 44], // aa
  ["muse-ember", 36], // aa
  ["muse-spark", 14], // est — muse spark (contributor) tier, under glimmer
  ["muse-glimmer", 18], // est — muse mid tier
  ["muse", 30], // est — unspecified muse
  ["llama-3.2-90b-vision", 16], // est — pi llama-3.3-70b 163.2
  ["llama-3.3-70b", 16], // pi 163.2
  ["llama-3.1-70b", 15], // pi 151.3
  ["llama-3.1-8b", 8], // est
  ["llama-3.2", 14], // est — 3.2 vision family
  ["llama-3.3", 16], // pi
  ["llama-4-maverick", 22], // est
  ["llama-4-scout", 19], // est
  ["llama-4", 21], // est
  ["llama-3", 14], // est
  // ---- poolside (no aa coverage — code-model family est) ----
  ["laguna", 10], // est
  // ---- moonshot kimi (pi ÷ 10 for pre-k3) ----
  ["kimi-k2-thinking", 26], // pi 264.7 — nov/2025 open-weights leader
  ["kimi-k2.6", 28], // pi 284.4
  ["kimi-k2.5", 27], // pi 270.5
  ["kimi-k2", 21], // pi 211.5
  // ---- deepseek (pi ÷ 10 for pre-v4) ----
  ["deepseek-v3.2", 26], // pi 264.9
  ["deepseek-v3.1-terminus", 25], // pi 247.9
  ["deepseek-v3.1", 23], // pi 233.7
  ["deepseek-r1-0528", 23], // pi 230.8
  ["deepseek-r1", 21], // pi 208.7
  ["deepseek-v3", 21], // est — v3 base
  ["deepseek-coder", 18], // est
  // ---- alibaba qwen (pi ÷ 10 + est) ----
  ["qwen3-max", 27], // pi 265.1
  ["qwen3-235b", 24], // pi 237.5 (2507 refresh)
  ["qwen3-coder", 20], // pi 197.5 (480b a35b)
  ["qwq", 20], // pi 201.9
  ["qwen3-32b", 19], // est
  ["qwen3-30b", 18], // est — a3b moe
  ["qwen3-14b", 17], // est
  ["qwen3-8b", 15], // est
  ["qwen3-4b", 12], // est
  ["qwen3", 19], // est — unspecified qwen3
  ["qwen2.5-coder", 16], // est
  ["qwen2.5-72b", 16], // est
  ["qwen2.5", 14], // est
  // ---- openai (aa v5.0.1 + pi) ----
  ["gpt-oss-120b", 4], // aa v5.0.1 (pi 239.8 — deprecated scale)
  ["gpt-oss-20b", 2], // est
  ["gpt-5", 27], // pi 270.7
  ["gpt-4.1", 20], // pi 198.7
  ["o3-mini", 22], // pi 220.0 (scale anchor)
  ["o4-mini", 24], // est
  ["o3", 26], // pi 258.3
  // ---- google gemini (pi ÷ 10 + aa) ----
  ["gemini-3.8-flash", 31], // aa
  ["gemini-3.5-flash-lite", 12], // aa
  ["gemini-2.5-pro", 25], // pi 245.4
  ["gemini-2.5-flash-lite", 10], // est
  ["gemini-2.5-flash", 23], // pi 226.1
  ["gemini-2.5", 23], // est — unspecified 2.5
  // ---- xai grok (aa + pi) ----
  ["grok-4.7", 35], // aa
  ["grok-4.5", 31], // pi 312.3
  ["grok-4", 25], // est
  // ---- microsoft phi ----
  ["phi-4", 17], // est
  ["phi-3.5", 8], // est
  ["phi-3", 5], // est — 2024 small model
  // ---- the 2026 free-lane families the v4/v5 catalogs ride (est) ----
  ["hy3", 17], // est — tencent hunyuan 3
  ["inkling-small", 13], // est — thinkingmachines small tier
  ["inkling", 20], // est — thinkingmachines base
  ["ling-3.0-flash", 12], // est — inclusionai ling flash
  ["ling", 14], // est — unspecified ling
  ["north-mini-code", 11], // est — cohere north mini
  ["north", 15], // est — cohere north family
  ["lfm-2.5", 9], // est — liquid foundation small
  ["lfm", 10], // est — liquid foundation family
  ["dots-3", 12], // est — dots studio preview tier
  ["dots", 13], // est — dots studio family
  // ---- misc ----
  ["command-r-plus", 14], // est
  ["yi-1.5-34b", 12], // est
];

/** family table pre-sorted by key length (longest first — specificity wins) */
const sortedfamilies = [...familytable].sort((a, b) => b[0].length - a[0].length);

/**
 * normalize a model id for scoring: lowercase, strip the openrouter `:free`
 * suffix, the provider prefix (`z-ai/`, `nvidia/`, `meta/`…), the
 * `-instruct`/`-it` suffixes and 4-digit date versions (`0528`, `2507`…).
 */
export function normalizeid(id: string): string {
  let s = id.toLowerCase().trim();
  s = s.replace(/:free$/, "");
  s = s.replace(/^[^/]+\//, "");
  s = s.replace(/-instruct$/, "");
  s = s.replace(/-it$/, "");
  s = s.replace(/-\d{4}$/, "");
  return s;
}

/** intelligence score of a model id — 0 when no family matches (unknown models sink to the pool tail) */
export function intelligencescore(id: string): number {
  const n = normalizeid(id);
  for (const [key, score] of sortedfamilies) {
    if (n.includes(key)) return score;
  }
  return 0;
}

/** sort model ids by intelligence (desc), ties broken alphabetically — deterministic */
export function sortids(ids: string[]): string[] {
  return [...ids].sort((a, b) => intelligencescore(b) - intelligencescore(a) || a.localeCompare(b));
}

/** sort model objects ({ id }) by intelligence (desc), ties broken alphabetically — deterministic, non-mutating */
export function sortbyscore<T extends { id: string }>(models: T[]): T[] {
  return [...models].sort((a, b) => intelligencescore(b.id) - intelligencescore(a.id) || a.id.localeCompare(b.id));
}

/** the single smartest id of a set (multimodal routing picks the most intelligent capable backend) */
export function smartestid(ids: string[]): string {
  return sortids(ids)[0] ?? "";
}

/** the smart-first rotation pool of a catalog: the top {@link smartpoolsize} ids by intelligence, meta ids excluded */
export function smartpool(ids: string[]): string[] {
  return sortids(ids.filter((id) => !id.includes("devthink"))).slice(0, smartpoolsize);
}
