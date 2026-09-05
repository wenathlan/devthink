/**
 * engine — universal gateway engine
 * one file one responsibility — the generic request pipeline for all versions
 * 0 to 100 correlated logics grouped in this one file
 *
 * consumes a gatewayconfig produces all 7 route handlers
 * supports any llm any baseurl any api key via configuration
 * v1 zai sdk v2 babel v3 nvidia v4 opencode kilo v5 openrouter are all
 * just config objects feeding this single engine
 *
 * pipeline per request:
 *   1 paused check → 503 fallback
 *   2 model resolution — requested or default or meta rotation pick
 *   3 auth resolution — 12 methods db env inline ephemeral
 *   4 body building — sampling params per policy thinking param per config
 *   5 execution — retry backoff rotation timeout circuit breaker
 *   6 streaming — byte passthrough sse parsing heartbeat discard masking
 *   7 persistence — savemsg with version specific fields
 *   8 response building — chat completion anthropic message response formats
 */

import {
  buildauthheaders,
  extractrequestid,
  extractsessionid,
  resolvekeys,
} from "./gateway-auth.js";
import { getsessionmessages, savemsg } from "./database";
import { makechunk, makefinalchunk, makestreamresponse } from "./gateway-http.js";
import type {
  gatewayconfig,
  modeldef,
  resolvedkey,
  sessionstate,
  thinkinglevel,
  upstreamdef,
  versionhandlers,
} from "./types";
import {
  autofrequencypenalty,
  auton,
  autopresencepenalty,
  autoseed,
  autotemp,
  autothinking,
  autotopp,
  clamp,
  corsheaders,
  defaultmaxtokens,
  esttokens,
  genid,
  handlecors,
  jsonheaders,
  randombase36,
  safejsonparse,
  safestringify,
  securerandom,
  truncatemessages,
} from "./utils";

// ---------------------------------------------------------------------------
// defaults — universal fallbacks when config omits values
// ---------------------------------------------------------------------------

/** default thinking budgets — 7 level canonical map */
const defaultbudgets: Record<thinkinglevel, number> = {
  none: 0,
  minimal: 1400,
  low: 5500,
  medium: 17000,
  high: 68000,
  xhigh: 68000,
  max: 68000,
};

/** default retryable statuses — 429 rate limit plus transient 5xx */
const defaultretrystatuses = [429, 502, 503, 504];

/** default rotate statuses — nvidia style gateway errors */
const defaultrotatestatuses = [529, 404, 410];

/** default fallback statuses — v4 cross-provider swap set */
const defaultfallbackstatuses = [404, 429, 500, 502, 503, 529];

// ---------------------------------------------------------------------------
// session state — in-memory rotation tracking per version
// ---------------------------------------------------------------------------

/** in-memory session store — one map per version instance */
function createsessionstore() {
  const sessions = new Map<string, sessionstate>();
  return {
    get(sessionid: string): sessionstate {
      let s = sessions.get(sessionid);
      if (!s) {
        s = { messagecount: 0, rotationindex: 0, model: "" };
        sessions.set(sessionid, s);
      }
      return s;
    },
    bump(sessionid: string): sessionstate {
      const s = this.get(sessionid);
      s.messagecount += 1;
      return s;
    },
  };
}

// ---------------------------------------------------------------------------
// zai sdk transport — singleton for keyless sdk auth
// ---------------------------------------------------------------------------

/** zai sdk lazy singleton — only imported when transport demands it */
let zaipromise: Promise<unknown> | null = null;
async function getzai() {
  if (!zaipromise) {
    const mod = await import("z-ai-web-dev-sdk");
    const ZAI =
      (mod as { default?: { create: () => Promise<unknown> } }).default ??
      (mod as unknown as { create: () => Promise<unknown> });
    zaipromise = ZAI.create();
  }
  return zaipromise;
}

/** call the zai sdk chat completions with messages and options */
async function zaisdkcall(
  messages: unknown[],
  opts: { thinking?: unknown; max_tokens?: number; temperature?: number; stream?: boolean },
): Promise<{ content: string; reasoning?: string | undefined }> {
  const zai = (await getzai()) as {
    chat: {
      completions: {
        create: (p: Record<string, unknown>) => Promise<{
          choices?: Array<{ message?: { content?: string; reasoning_content?: string } }>;
        }>;
      };
    };
  };
  const res = await zai.chat.completions.create({
    messages: messages as never,
    ...(opts.thinking !== undefined ? { thinking: opts.thinking } : {}),
    ...(opts.max_tokens !== undefined ? { max_tokens: opts.max_tokens } : {}),
    ...(opts.temperature !== undefined ? { temperature: opts.temperature } : {}),
    stream: opts.stream ?? false,
  });
  const choice = res.choices?.[0]?.message;
  return {
    content: choice?.content ?? "",
    reasoning: choice?.reasoning_content,
  };
}

// ---------------------------------------------------------------------------
// model resolution
// ---------------------------------------------------------------------------

/** find a model by id in the catalog — returns undefined when unknown */
function findmodel(cfg: gatewayconfig, id: string): modeldef | undefined {
  return cfg.models.find((m) => m.id === id);
}

/** resolve the model for a request — meta rotation individual or default */
function resolvemodel(
  cfg: gatewayconfig,
  requested: string | undefined,
  session: sessionstate,
  globalcounter: { n: number },
): {
  model: modeldef | undefined;
  modelid: string;
  display: string;
  ismeta: boolean;
  rotationindex: number;
} {
  const metaid = cfg.metamodel.id;
  const rotationmodels = cfg.rotation?.models ?? [];
  const ismetarequest = requested === metaid || requested === undefined || requested === "";

  // meta model with rotation — pick from the rotation pool
  if (ismetarequest && rotationmodels.length > 0 && cfg.rotation?.mode !== "none") {
    const everyn = cfg.rotation?.everynmessages ?? 6;
    let idx: number;
    if (cfg.rotation?.mode === "perrequest") {
      idx = globalcounter.n % rotationmodels.length;
      globalcounter.n += 1;
    } else {
      // persession — rotate every n messages
      idx = Math.floor(session.messagecount / everyn) % rotationmodels.length;
      if (cfg.rotation?.staggernewsessions && session.messagecount === 0) {
        idx = (idx + globalcounter.n) % rotationmodels.length;
        globalcounter.n += 1;
      }
    }
    const modelid = rotationmodels[idx] ?? rotationmodels[0];
    const model = findmodel(cfg, modelid);
    session.model = modelid;
    session.rotationindex = idx;
    return {
      model,
      modelid,
      display: cfg.metamodel.alwaysdisplay ? metaid : modelid,
      ismeta: true,
      rotationindex: idx,
    };
  }

  // individual model request
  if (requested && !ismetarequest) {
    const model = findmodel(cfg, requested);
    if (model) {
      return {
        model,
        modelid: requested,
        display: cfg.metamodel.alwaysdisplay ? metaid : requested,
        ismeta: false,
        rotationindex: -1,
      };
    }
  }

  // default model fallback
  const defaultid = cfg.defaultmodel ?? rotationmodels[0] ?? cfg.models[0]?.id ?? metaid;
  const model = findmodel(cfg, defaultid);
  return {
    model,
    modelid: defaultid,
    display: cfg.metamodel.alwaysdisplay ? metaid : defaultid,
    ismeta: defaultid === metaid,
    rotationindex: -1,
  };
}

/** compute the fusion context — sum of model contexts or explicit override */
function fusioncontext(cfg: gatewayconfig, modelsonly?: modeldef[]): number {
  if (cfg.metamodel.contextoverride !== undefined) return cfg.metamodel.contextoverride;
  const pool = modelsonly ?? cfg.models;
  return pool.reduce((sum, m) => sum + m.context, 0);
}

// ---------------------------------------------------------------------------
// auth resolution — delegates to authentication.ts with config
// ---------------------------------------------------------------------------

/** resolve a key for the request — returns null when keyless */
async function resolveauth(cfg: gatewayconfig, _req?: Request): Promise<resolvedkey | null> {
  const auth = cfg.auth;
  if (auth.mode === "anonymous" || auth.mode === "none" || auth.mode === "keylesssdk") {
    return null;
  }
  const keys = await resolvekeys(auth);
  if (keys.length === 0) {
    if (auth.required) {
      return null;
    }
    return null;
  }
  // round robin across keys
  const idx = resolveauth.cursor % keys.length;
  resolveauth.cursor = (resolveauth.cursor + 1) % Math.max(keys.length, 1);
  return keys[idx];
}
resolveauth.cursor = 0;

/** build upstream headers from auth config plus resolved key */
function buildheaders(
  cfg: gatewayconfig,
  key: resolvedkey | null,
  stream: boolean,
): Record<string, string> {
  const auth = cfg.auth;
  const headers: Record<string, string> = {
    "content-type": "application/json",
    ...(cfg.headers?.useragent ? { "user-agent": cfg.headers.useragent } : {}),
    ...(auth.extraheaders ?? {}),
  };
  if (stream) headers["accept"] = "text/event-stream";
  if (key) {
    Object.assign(headers, buildauthheaders(auth, key.key));
  }
  return headers;
}

// ---------------------------------------------------------------------------
// body building
// ---------------------------------------------------------------------------

/** build the upstream request body per config policy
 * model is optional: callers without a resolved model fall back to
 * cfg.defaultmodel then the meta id for the model id mapping */
function buildbody(
  cfg: gatewayconfig,
  body: Record<string, unknown>,
  model?: modeldef,
  overridemodel?: string,
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...body };
  const modelid = overridemodel ?? model?.id ?? cfg.defaultmodel ?? cfg.metamodel.id;

  // model id — map to upstream id when configured
  const upstreamid = model?.upstream ?? modelid;
  out["model"] = upstreamid;

  // remove gateway-only fields
  delete out["apiKey"];
  delete out["api_key"];
  delete out["token"];

  // thinking param — chattemplatekwargs or thinking object
  const thinkinglevel = autothinking(body["thinking"] ?? body["reasoning_effort"]);
  const budgets = cfg.thinking?.budgets ?? defaultbudgets;
  const budget = budgets[thinkinglevel] ?? 0;

  if (cfg.thinking?.param === "chattemplatekwargs" || model?.chattemplatekwargs) {
    // nvidia style — merge model kwargs
    const kwargs = model?.chattemplatekwargs ?? { enable_thinking: thinkinglevel !== "none" };
    out["chat_template_kwargs"] = { ...kwargs };
    delete out["thinking"];
    delete out["reasoning_effort"];
  } else {
    // zai openai style — thinking object
    if (body["thinking"] !== undefined || thinkinglevel !== "none") {
      out["thinking"] =
        thinkinglevel === "none" ? { type: "disabled" } : { type: "enabled", budget };
    }
    delete out["reasoning_effort"];
  }

  // sampling params — omit-unspecified policy strips defaults
  const policy = cfg.bodybuild?.optionalparamspolicy ?? "always";
  const userfields: Record<string, unknown> = {};
  const paramnames = [
    "temperature",
    "top_p",
    "n",
    "frequency_penalty",
    "presence_penalty",
    "seed",
    "stop",
    "max_tokens",
  ];
  for (const p of paramnames) {
    if (body[p] !== undefined) userfields[p] = body[p];
  }

  if (policy === "omit-unspecified") {
    // nvidia pattern — only include what the user set
    if (userfields["temperature"] !== undefined)
      out["temperature"] = autotemp(userfields["temperature"]);
    if (userfields["top_p"] !== undefined) out["top_p"] = autotopp(userfields["top_p"]);
    if (userfields["n"] !== undefined) out["n"] = auton(userfields["n"]);
    if (userfields["frequency_penalty"] !== undefined)
      out["frequency_penalty"] = autofrequencypenalty(userfields["frequency_penalty"]);
    if (userfields["presence_penalty"] !== undefined)
      out["presence_penalty"] = autopresencepenalty(userfields["presence_penalty"]);
    if (userfields["seed"] !== undefined) out["seed"] = autoseed(userfields["seed"]);
    if (userfields["stop"] !== undefined) out["stop"] = userfields["stop"];
  } else {
    out["temperature"] = autotemp(userfields["temperature"]);
    out["top_p"] = autotopp(userfields["top_p"]);
    out["n"] = auton(userfields["n"]);
    out["frequency_penalty"] = autofrequencypenalty(userfields["frequency_penalty"]);
    out["presence_penalty"] = autopresencepenalty(userfields["presence_penalty"]);
    if (userfields["seed"] !== undefined) out["seed"] = autoseed(userfields["seed"]);
    if (userfields["stop"] !== undefined) out["stop"] = userfields["stop"];
  }

  // max tokens — clamp per config
  const clampmax = cfg.bodybuild?.clampmaxtokens ?? true;
  const clampceiling = cfg.defaults?.maxtokensclamp ?? 98304;
  const modelmax = model?.maxoutput ?? clampceiling;
  if (clampmax) {
    out["max_tokens"] = clamp(
      Number(body["max_tokens"] ?? defaultmaxtokens),
      1,
      Math.min(modelmax, clampceiling),
    );
  } else {
    out["max_tokens"] = Number(body["max_tokens"] ?? defaultmaxtokens);
  }

  return out;
}

// ---------------------------------------------------------------------------
// history reconstruction — shared by v3 v4 pattern
// ---------------------------------------------------------------------------

/** reconstruct message history from db when context restoresessionhistory */
async function reconstructhistory(
  cfg: gatewayconfig,
  sessionid: string,
  incoming: unknown[],
): Promise<unknown[]> {
  if (!cfg.context?.restoresessionhistory || !sessionid) return incoming;
  try {
    const limit = cfg.context?.historylimit ?? 1000;
    const past = (await getsessionmessages(sessionid, limit)) as Array<Record<string, unknown>>;
    const history: unknown[] = [];
    for (const row of past) {
      if (row.role === "user" || row.role === "assistant") {
        const role = row.role as string;
        const content = String(row.content ?? row.completion ?? "");
        if (content) history.push({ role, content });
      }
    }
    // dedup prefix — incoming messages that repeat history
    const incomingjson = incoming.map((m) => safestringify(m));
    const _deduped: unknown[] = [];
    let skip = 0;
    for (let i = 0; i < Math.min(history.length, incomingjson.length); i++) {
      const h = safestringify({
        role: (history[i] as { role: string }).role,
        content: (history[i] as { content: string }).content,
      });
      if (h === incomingjson[i]) skip = i + 1;
      else break;
    }
    const merged = [...history.slice(skip), ...incoming];
    return merged;
  } catch {
    return incoming;
  }
}

/** truncate messages to fit the per-call context */
function fitcontext(
  cfg: gatewayconfig,
  messages: unknown[],
  model: modeldef | undefined,
): unknown[] {
  if (!cfg.context) return messages;
  const percall = model?.context ?? cfg.context?.percallfallback ?? 1048576;
  const margin = cfg.context?.truncatemargin ?? 4096;
  return truncatemessages(messages, percall - margin);
}

// ---------------------------------------------------------------------------
// execution — fetch with retry backoff rotation timeout
// ---------------------------------------------------------------------------

/** sleep helper */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** compute backoff with jitter */
function backoffms(cfg: gatewayconfig, attempt: number): number {
  const retry = cfg.retry ?? {};
  const base = retry.backoffbasems ?? 400;
  const cap = retry.backoffcapms ?? 8000;
  const jitter = retry.jitter ?? 0.2;
  const raw = Math.min(cap, base * 2 ** attempt);
  const j = raw * (1 - jitter + securerandom() * jitter * 2);
  return Math.round(j);
}

/** classify a status against the retry rotate fallback sets
 * the rotate set only comes from an explicit rotation config: the old
 * implicit default (any maxretries turned on rotate-on-529-404-410) stole
 * 404 and 410 from the fallback classification a user configured
 * explicitly — rotation is declared, never inferred from retry settings */
function classifystatus(
  cfg: gatewayconfig,
  status: number,
): "retry" | "rotate" | "fallback" | "fail" {
  const retryset = new Set(cfg.retry?.statuses ?? defaultretrystatuses);
  const rotateset = new Set(cfg.rotation?.rotateonstatus ?? []);
  const fallbackset = new Set(
    cfg.retry?.fallbackstatuses ??
      (cfg.retry?.fallback === "crossprovider" ? defaultfallbackstatuses : []),
  );
  const nonretryable = new Set(cfg.retry?.nonretryable ?? [400]);
  if (nonretryable.has(status)) return "fail";
  if (retryset.has(status)) return "retry";
  if (rotateset.has(status)) return "rotate";
  if (fallbackset.has(status)) return "fallback";
  if (status >= 500) return "retry";
  return "fail";
}

/** execute an upstream call with the full retry rotation timeout pipeline */
async function executefetch(
  cfg: gatewayconfig,
  upstream: upstreamdef,
  url: string,
  headers: Record<string, string>,
  body: Record<string, unknown>,
  stream: boolean,
  session: sessionstate,
): Promise<Response> {
  const retry = cfg.retry ?? {};
  const maxretries = retry.maxretries ?? 0;
  const maxrotations = cfg.rotation?.maxmodelrotations ?? 1;
  const timeoutms = cfg.timeout?.modelswitchintervalms ?? cfg.timeout?.requestms ?? 300000;
  const streamtimeout = cfg.timeout?.streamms ?? 2147483647;
  const rotationmodels = cfg.rotation?.models ?? [];

  let lastresponse: Response | null = null;
  let lasterror: unknown = null;

  for (let rotation = 0; rotation < maxrotations; rotation++) {
    // rotate model on subsequent attempts
    const attempturl = url;
    let attemptbody = body;
    if (rotation > 0 && rotationmodels.length > 0) {
      const idx = (session.rotationindex + rotation) % rotationmodels.length;
      const nextmodel = rotationmodels[idx];
      const model = findmodel(cfg, nextmodel);
      if (model) {
        attemptbody = { ...body, model: model.upstream ?? nextmodel };
        session.model = nextmodel;
        session.rotationindex = idx;
      }
    }

    for (let attempt = 0; attempt <= maxretries; attempt++) {
      // per-attempt timeout via abort controller on headers
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), stream ? streamtimeout : timeoutms);
      try {
        const key = await resolveauth(cfg);
        const finalheaders = { ...headers, ...(key ? buildauthheaders(cfg.auth, key.key) : {}) };
        const res = await fetch(attempturl, {
          method: "POST",
          headers: finalheaders,
          body: safestringify(attemptbody),
          signal: controller.signal,
        });
        clearTimeout(timer);

        if (res.ok) return res;

        const action = classifystatus(cfg, res.status);
        if (action === "retry" && attempt < maxretries) {
          await sleep(backoffms(cfg, attempt));
          continue;
        }
        if (action === "rotate" || action === "fallback") {
          lastresponse = res;
          break; // break retry loop — try next rotation
        }
        return res; // fail — pass through the error
      } catch (err) {
        clearTimeout(timer);
        lasterror = err;
        const aborted = err instanceof Error && err.name === "AbortError";
        if (aborted && cfg.rotation?.rotateontimeout) {
          break; // timeout — rotate model
        }
        if (attempt < maxretries) {
          await sleep(backoffms(cfg, attempt));
          continue;
        }
        if (rotation + 1 < maxrotations) break;
      }
    }
    // cross-provider fallback when configured
    if (cfg.retry?.fallback === "crossprovider" && upstream.fallback) {
      const fb = cfg.upstreams.find((u) => u.name === upstream.fallback);
      if (fb) {
        try {
          const key = await resolveauth(cfg);
          const finalheaders = { ...headers, ...(key ? buildauthheaders(cfg.auth, key.key) : {}) };
          const res = await fetch(fb.baseurl + (fb.endpoints?.chat ?? "/chat/completions"), {
            method: "POST",
            headers: finalheaders,
            body: safestringify(attemptbody),
            signal: AbortSignal.timeout(cfg.timeout?.requestms ?? 300000),
          });
          if (res.ok) return res;
          lastresponse = res;
        } catch (err) {
          lasterror = err;
        }
      }
    }
  }

  if (lastresponse) return lastresponse;
  return new Response(
    safestringify({
      error: lasterror instanceof Error ? lasterror.message : "upstream request failed",
      object: "error",
    }),
    { status: 502, headers: jsonheaders() },
  );
}

// ---------------------------------------------------------------------------
// response builders
// ---------------------------------------------------------------------------

/** build a standard chat completion response */
function chatcompletion(
  cfg: gatewayconfig,
  id: string,
  model: string,
  content: string,
  reasoning: string | undefined,
  usage: Record<string, unknown>,
): Record<string, unknown> {
  return {
    id,
    object: "chat.completion",
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content,
          ...(reasoning ? { reasoning_content: reasoning } : {}),
        },
        finish_reason: "stop",
      },
    ],
    usage,
    provider: cfg.providername,
  };
}

// ---------------------------------------------------------------------------
// info keys models payload generators
// ---------------------------------------------------------------------------

/** generate the version info payload from config */
function makeinfopayload(cfg: gatewayconfig): Record<string, unknown> {
  const modelcount = cfg.models.length;
  return {
    version: cfg.id,
    name: cfg.name ?? cfg.id,
    provider: cfg.providername,
    paused: cfg.paused ?? false,
    upstream: cfg.upstreams[0]?.baseurl ?? "",
    upstreams: cfg.upstreams.map((u) => ({ name: u.name, baseurl: u.baseurl })),
    auth: {
      mode: cfg.auth.mode,
      required: cfg.auth.required ?? false,
      ...(cfg.auth.envvar ? { envvar: cfg.auth.envvar } : {}),
      ...(cfg.auth.signupurl ? { signup: cfg.auth.signupurl } : {}),
    },
    models: modelcount,
    ...(cfg.rotation
      ? {
          rotation: {
            mode: cfg.rotation.mode,
            models: cfg.rotation.models.length,
            everynmessages: cfg.rotation.everynmessages ?? 6,
          },
        }
      : {}),
    ...(cfg.retry?.maxretries
      ? {
          retry: {
            maxretries: cfg.retry.maxretries,
            backoffbasems: cfg.retry.backoffbasems ?? 400,
            backoffcapms: cfg.retry.backoffcapms ?? 8000,
            statuses: cfg.retry.statuses ?? defaultretrystatuses,
          },
        }
      : {}),
    ...(cfg.timeout?.modelswitchintervalms
      ? { modeltimeoutms: cfg.timeout.modelswitchintervalms }
      : {}),
    fusioncontext: fusioncontext(cfg),
    metamodel: {
      id: cfg.metamodel.id,
      context: cfg.metamodel.contextoverride ?? fusioncontext(cfg),
      maxoutput: cfg.metamodel.maxoutput ?? 32768,
      ...(cfg.metamodel.pattern ? { pattern: cfg.metamodel.pattern } : {}),
    },
    routes: [
      "chat/completions",
      "completions",
      "messages",
      "responses",
      "embeddings",
      "keys",
      "models",
    ],
    ...(cfg.note ? { note: cfg.note } : {}),
  };
}

// ---------------------------------------------------------------------------
// engine — createversion produces all 7 handlers
// ---------------------------------------------------------------------------

/**
 * createversion — the universal engine entry
 * consumes one gatewayconfig produces all 7 route handlers
 * every behavior is config driven — nothing hardcoded
 */
export function createversion(cfg: gatewayconfig): versionhandlers {
  const sessions = createsessionstore();
  const globalcounter = { n: 0 };
  const metaid = cfg.metamodel.id;

  // ---------------------------------------------------------------------
  // invalidbody — 400 for malformed request bodies (openai semantics:
  // malformed json or a missing empty messages array answers 400 before
  // any upstream call — the old flow forwarded the empty request and
  // surfaced a confusing upstream error far from the real cause)
  // ---------------------------------------------------------------------
  function invalidbody(message: string): Response {
    return new Response(
      safestringify({ error: message, code: "invalid_request", object: "error" }),
      { status: 400, headers: jsonheaders() },
    );
  }

  /** parse and validate a request body — null when the body is not a json
   * object (numbers strings arrays and bare null all reject: gateway post
   * routes consume objects) */
  async function parsebody(req: Request): Promise<Record<string, unknown> | null> {
    const raw = await req.text();
    const parsed = safejsonparse(raw);
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    return parsed as Record<string, unknown>;
  }

  // ---------------------------------------------------------------------
  // handleinfo — get routes return the version descriptor
  // ---------------------------------------------------------------------
  async function handleinfo(req: Request): Promise<Response> {
    const cors = handlecors(req);
    if (cors) return cors;
    return new Response(safestringify(makeinfopayload(cfg)), { headers: jsonheaders() });
  }

  // ---------------------------------------------------------------------
  // handlekeys — key status endpoint
  // ---------------------------------------------------------------------
  async function handlekeys(req: Request): Promise<Response> {
    const cors = handlecors(req);
    if (cors) return cors;
    const auth = cfg.auth;
    const keycount =
      auth.keysources?.includes("env") && auth.envvar
        ? (process.env[auth.envvar] ?? "").split(auth.envseparator ?? ",").filter(Boolean).length
        : 0;
    return new Response(
      safestringify({
        authmode: auth.mode,
        required: auth.required ?? false,
        ...(auth.envvar ? { envvar: auth.envvar, envkeycount: keycount } : {}),
        ...(auth.signupurl ? { signup: auth.signupurl } : {}),
        ...(auth.keyurl
          ? { keyurl: auth.keyurl, keyexpiryminutes: auth.keyexpiryminutes ?? 60 }
          : {}),
        provider: cfg.providername,
        upstream: cfg.upstreams[0]?.baseurl ?? "",
        models: cfg.models.map((m) => m.id),
        version: cfg.id,
      }),
      { headers: jsonheaders() },
    );
  }

  // ---------------------------------------------------------------------
  // handlemodels — post models returns the catalog
  // ---------------------------------------------------------------------
  async function handlemodels(req: Request): Promise<Response> {
    const cors = handlecors(req);
    if (cors) return cors;
    const models = cfg.models.map((m) => ({
      id: m.id,
      object: "model",
      created: cfg.metamodel.listedcreated ?? 1700000000,
      owned_by: cfg.providername,
      permission: [],
      root: m.id,
      parent: null,
      max_context_length: m.context,
      max_output_tokens: m.maxoutput,
      supports_thinking: m.reasoning ?? true,
      supports_streaming: true,
      supports_tools: true,
      supports_vision: m.vision ?? false,
      ...(m.free !== undefined ? { free: m.free } : {}),
      ...(m.rank ? { rank: m.rank } : {}),
    }));
    // meta model first in the list
    const metaentry = {
      id: metaid,
      object: "model",
      created: cfg.metamodel.listedcreated ?? 1700000000,
      owned_by: metaid,
      permission: [],
      root: metaid,
      parent: null,
      max_context_length: cfg.metamodel.contextoverride ?? fusioncontext(cfg),
      max_output_tokens: cfg.metamodel.maxoutput ?? 32768,
      supports_thinking: true,
      supports_streaming: true,
      supports_tools: true,
      supports_vision: false,
      description: cfg.metamodel.pattern ?? `${metaid} meta model over ${cfg.providername}`,
      meta: {
        provider: cfg.providername,
        ...(cfg.rotation?.models.length ? { rotationbackends: cfg.rotation.models } : {}),
      },
    };
    return new Response(safestringify({ object: "list", data: [metaentry, ...models] }), {
      headers: jsonheaders(),
    });
  }

  // ---------------------------------------------------------------------
  // paused check — shared by all post routes
  // ---------------------------------------------------------------------
  function pausedresponse(): Response | null {
    if (!cfg.paused) return null;
    const routes = cfg.routes ?? {};
    return new Response(
      safestringify({
        error: routes.pausedmessage ?? `${cfg.id} is paused`,
        fallback: routes.fallbackroute,
        status: routes.pausedstatus ?? 503,
        object: "error",
      }),
      { status: routes.pausedstatus ?? 503, headers: jsonheaders() },
    );
  }

  // ---------------------------------------------------------------------
  // handlechatcompletions — the main chat route
  // ---------------------------------------------------------------------
  async function handlechatcompletions(req: Request): Promise<Response> {
    const cors = handlecors(req);
    if (cors) return cors;
    const paused = pausedresponse();
    if (paused) return paused;

    const startedat = Date.now();
    try {
      const body = await parsebody(req);
      if (body === null) return invalidbody("request body is not valid json");
      const incoming = Array.isArray(body["messages"]) ? body["messages"] : [];
      if (incoming.length === 0) return invalidbody("messages must be a non-empty array");
      const stream = body["stream"] === true;
      const sessionid = extractsessionid(req, body) || `s_${Date.now()}_${randombase36(6)}`;
      const requestid = extractrequestid(req) || genid("req");
      const session = sessions.bump(sessionid);

      // resolve model
      const resolved = resolvemodel(
        cfg,
        body["model"] as string | undefined,
        session,
        globalcounter,
      );
      const displaymodel = resolved.display || metaid;

      // reconstruct history when configured
      const history = await reconstructhistory(cfg, sessionid, incoming);
      const fitted = fitcontext(cfg, history, resolved.model);

      // ------------------------------------------------------------------
      // zai sdk transport — 2-calls thinking pattern
      // ------------------------------------------------------------------
      if (cfg.transport?.type === "zai-sdk") {
        return await executezaisdk(cfg, body, fitted, resolved, displaymodel, stream, {
          sessionid,
          requestid,
          startedat,
        });
      }

      // ------------------------------------------------------------------
      // fetch transport — standard pipeline
      // ------------------------------------------------------------------
      const upstream = cfg.upstreams[0];
      if (!upstream) {
        return new Response(safestringify({ error: "no upstream configured", object: "error" }), {
          status: 500,
          headers: jsonheaders(),
        });
      }

      // auth check
      const auth = cfg.auth;
      if (
        auth.required &&
        auth.mode !== "keylesssdk" &&
        auth.mode !== "anonymous" &&
        auth.mode !== "none"
      ) {
        const keys = await resolvekeys(auth);
        if (keys.length === 0) {
          return new Response(
            safestringify({
              error: auth.envvar
                ? `${cfg.providername} api key required — set ${auth.envvar} env var${auth.signupurl ? ` or signup at ${auth.signupurl}` : ""}`
                : "api key required",
              code: "key_required",
              ...(auth.signupurl ? { signup: auth.signupurl } : {}),
            }),
            { status: 401, headers: jsonheaders() },
          );
        }
      }

      // build body
      const upstreambody = buildbody(
        cfg,
        { ...body, messages: fitted, model: resolved.modelid },
        resolved.model,
      );

      // execute
      const url = upstream.baseurl + (upstream.endpoints?.chat ?? "/chat/completions");
      const headers = buildheaders(cfg, null, stream);
      const upstreamresponse = await executefetch(
        cfg,
        upstream,
        url,
        headers,
        upstreambody,
        stream,
        session,
      );

      if (!upstreamresponse.ok && !stream) {
        const errtext = await upstreamresponse.text().catch(() => "");
        await persist(cfg, {
          sessionid,
          requestid,
          route: "chat/completions",
          model: displaymodel,
          modelvariant: resolved.modelid,
          status: "error",
          httpstatus: upstreamresponse.status,
          error: errtext.slice(0, 500),
          stream,
          startedat,
          rotationindex: resolved.rotationindex,
          messagenumber: session.messagecount,
        });
        return new Response(
          errtext || safestringify({ error: "upstream error", status: upstreamresponse.status }),
          {
            status: upstreamresponse.status,
            headers: jsonheaders(),
          },
        );
      }

      if (stream) {
        // stream — byte passthrough with masking and keepalive
        await persist(cfg, {
          sessionid,
          requestid,
          route: "chat/completions",
          model: displaymodel,
          modelvariant: resolved.modelid,
          status: "completed",
          stream,
          streammode: "bytepassthrough",
          startedat,
          rotationindex: resolved.rotationindex,
          messagenumber: session.messagecount,
          contextshared: resolved.ismeta,
        });
        return makestreamresponse(upstreamresponse, {
          mask: cfg.metamodel.maskupstreammodel ? metaid : null,
          onfinal: (tracked) => {
            void persist(cfg, {
              sessionid,
              requestid,
              route: "chat/completions",
              model: displaymodel,
              modelvariant: resolved.modelid,
              status: "completed",
              stream,
              startedat,
              content: tracked.content?.slice(0, 2000),
              reasoningcontent: tracked.reasoning?.slice(0, 2000),
              totaltokens: tracked.totaltokens,
              rotationindex: resolved.rotationindex,
              messagenumber: session.messagecount,
            });
          },
        });
      }

      // non stream — parse and rebuild with display model
      const data = (await safejsonparse(await upstreamresponse.text())) as Record<string, unknown>;
      const choices = (data?.["choices"] as Array<Record<string, unknown>> | undefined) ?? [];
      const choice = choices[0]?.["message"] as Record<string, unknown> | undefined;
      const content = String(choice?.["content"] ?? "");
      const reasoning = String(choice?.["reasoning_content"] ?? choice?.["reasoning"] ?? "");
      const usage = (data?.["usage"] as Record<string, unknown>) ?? {
        prompt_tokens: esttokens(safestringify(fitted)),
        completion_tokens: Math.ceil(content.length / 4),
        total_tokens: esttokens(safestringify(fitted)) + Math.ceil(content.length / 4),
      };
      const responseid = String(data?.["id"] ?? genid());
      const payload = chatcompletion(
        cfg,
        responseid,
        displaymodel,
        content,
        reasoning || undefined,
        usage,
      );

      await persist(cfg, {
        sessionid,
        requestid,
        route: "chat/completions",
        model: displaymodel,
        modelvariant: resolved.modelid,
        status: "completed",
        stream,
        startedat,
        content: String(content).slice(0, 2000),
        reasoningcontent: String(reasoning).slice(0, 2000),
        prompttokens: Number(usage["prompt_tokens"] ?? 0),
        completiontokens: Number(usage["completion_tokens"] ?? 0),
        totaltokens: Number(usage["total_tokens"] ?? 0),
        rotationindex: resolved.rotationindex,
        messagenumber: session.messagecount,
        contextshared: resolved.ismeta,
      });
      return new Response(safestringify(payload), { headers: jsonheaders() });
    } catch (err) {
      return new Response(
        safestringify({
          error: err instanceof Error ? err.message : "internal error",
          object: "error",
        }),
        {
          status: 500,
          headers: jsonheaders(),
        },
      );
    }
  }

  // ---------------------------------------------------------------------
  // zai sdk execution — 2-calls thinking pattern with fresh response guarantee
  // ---------------------------------------------------------------------
  async function executezaisdk(
    cfg: gatewayconfig,
    body: Record<string, unknown>,
    messages: unknown[],
    resolved: { model: modeldef | undefined; modelid: string; display: string; ismeta: boolean },
    displaymodel: string,
    stream: boolean,
    meta: { sessionid: string; requestid: string; startedat: number },
  ): Promise<Response> {
    const budgets = cfg.thinking?.budgets ?? defaultbudgets;
    const level = autothinking(body["thinking"] ?? body["reasoning_effort"]);
    const thinkingbudget = budgets[level] ?? 0;
    const responsemax = Number(body["max_tokens"] ?? cfg.metamodel.maxoutput ?? 32768);
    const threshold = cfg.thinking?.twocalls?.threshold ?? 98304;
    const twocalls = thinkingbudget + responsemax > threshold || level !== "none";

    try {
      if (twocalls) {
        // call 1 — thinking enabled non stream
        const call1 = await zaisdkcall(messages, {
          thinking: { type: "enabled", budget: thinkingbudget },
          max_tokens: Math.min(thinkingbudget, threshold),
        });
        const reasoning = call1.reasoning ?? "";

        if (stream) {
          // stream path — emit reasoning deltas then content
          const content = call1.content ?? "";
          const sametext = reasoning === content;
          let finalcontent = content;
          if (sametext && cfg.thinking?.twocalls?.freshresponseguarantee !== false) {
            // thinking equals response — force call 2 with original messages for a fresh response
            const call2 = await zaisdkcall(messages, {
              thinking: { type: "disabled" },
              max_tokens: Math.min(responsemax, threshold),
            });
            finalcontent = call2.content ?? content;
          }
          const id = genid();
          const encoder = new TextEncoder();
          const readable = new ReadableStream({
            async start(controller) {
              try {
                // emit reasoning deltas in 50 char chunks
                for (let i = 0; i < reasoning.length; i += 50) {
                  const piece = reasoning.slice(i, i + 50);
                  controller.enqueue(
                    encoder.encode(
                      `data: ${safestringify(makechunk(id, displaymodel, "", piece))}\n\n`,
                    ),
                  );
                }
                // emit content deltas in 50 char chunks
                for (let i = 0; i < finalcontent.length; i += 50) {
                  const piece = finalcontent.slice(i, i + 50);
                  controller.enqueue(
                    encoder.encode(
                      `data: ${safestringify(makechunk(id, displaymodel, piece))}\n\n`,
                    ),
                  );
                }
                controller.enqueue(
                  encoder.encode(
                    `data: ${safestringify(makefinalchunk(id, displaymodel, "stop"))}\n\n`,
                  ),
                );
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                controller.close();
              } catch {
                try {
                  controller.close();
                } catch {
                  /* already closed */
                }
              }
            },
          });
          await persist(cfg, {
            ...meta,
            route: "chat/completions",
            model: displaymodel,
            modelvariant: resolved.modelid,
            status: "completed",
            stream: true,
            streammode: "twocalls",
            content: finalcontent.slice(0, 2000),
            reasoningcontent: reasoning.slice(0, 2000),
            twocalls: true,
            thinkingbudget,
          });
          return new Response(readable, {
            headers: { ...corsheaders, "content-type": "text/event-stream" },
          });
        }

        // non stream path
        const sametext = reasoning === call1.content;
        let content = call1.content ?? "";
        if (sametext && cfg.thinking?.twocalls?.freshresponseguarantee !== false) {
          const call2 = await zaisdkcall(messages, {
            thinking: { type: "disabled" },
            max_tokens: Math.min(responsemax, threshold),
          });
          content = call2.content ?? content;
        }
        const id = genid();
        const payload = chatcompletion(cfg, id, displaymodel, content, reasoning || undefined, {
          prompt_tokens: esttokens(safestringify(messages)),
          completion_tokens: Math.ceil((content.length + reasoning.length) / 4),
          total_tokens:
            esttokens(safestringify(messages)) + Math.ceil((content.length + reasoning.length) / 4),
        });
        await persist(cfg, {
          ...meta,
          route: "chat/completions",
          model: displaymodel,
          modelvariant: resolved.modelid,
          status: "completed",
          stream: false,
          content: content.slice(0, 2000),
          reasoningcontent: reasoning.slice(0, 2000),
          twocalls: true,
          thinkingbudget,
          totaltokens: Number(
            payload["usage"] ? (payload["usage"] as Record<string, unknown>)["total_tokens"] : 0,
          ),
        });
        return new Response(safestringify(payload), { headers: jsonheaders() });
      }

      // single call — no thinking
      const result = await zaisdkcall(messages, { max_tokens: responsemax });
      const id = genid();
      const payload = chatcompletion(
        cfg,
        id,
        displaymodel,
        result.content,
        result.reasoning || undefined,
        {
          prompt_tokens: esttokens(safestringify(messages)),
          completion_tokens: Math.ceil(result.content.length / 4),
          total_tokens: esttokens(safestringify(messages)) + Math.ceil(result.content.length / 4),
        },
      );
      await persist(cfg, {
        ...meta,
        route: "chat/completions",
        model: displaymodel,
        modelvariant: resolved.modelid,
        status: "completed",
        stream: false,
        content: result.content.slice(0, 2000),
        reasoningcontent: (result.reasoning ?? "").slice(0, 2000),
      });
      return new Response(safestringify(payload), { headers: jsonheaders() });
    } catch (err) {
      return new Response(
        safestringify({
          error: err instanceof Error ? err.message : "zai sdk call failed",
          object: "error",
        }),
        {
          status: 500,
          headers: jsonheaders(),
        },
      );
    }
  }

  // ---------------------------------------------------------------------
  // handlecompletions — legacy completions route
  // ---------------------------------------------------------------------
  async function handlecompletions(req: Request): Promise<Response> {
    const cors = handlecors(req);
    if (cors) return cors;
    const paused = pausedresponse();
    if (paused) return paused;
    try {
      const body = await parsebody(req);
      if (body === null) return invalidbody("request body is not valid json");
      const prompt = body["prompt"];
      if (typeof prompt !== "string" && !Array.isArray(prompt)) {
        return invalidbody("prompt must be a string or an array of strings");
      }
      if (prompt.length === 0) return invalidbody("prompt must not be empty");
      const sessionid = extractsessionid(req, body) || `s_${Date.now()}`;
      const session = sessions.bump(sessionid);
      const resolved = resolvemodel(
        cfg,
        body["model"] as string | undefined,
        session,
        globalcounter,
      );

      // convert prompt to messages
      const messages =
        typeof prompt === "string"
          ? [{ role: "user", content: prompt }]
          : Array.isArray(prompt)
            ? prompt.map((p) => ({ role: "user", content: p }))
            : [];

      if (cfg.transport?.type === "zai-sdk") {
        const result = await zaisdkcall(messages, {
          max_tokens: Number(body["max_tokens"] ?? defaultmaxtokens),
        });
        const payload = {
          id: genid(),
          object: "text_completion",
          created: Math.floor(Date.now() / 1000),
          model: resolved.display,
          choices: [{ index: 0, text: result.content, finish_reason: "stop" }],
          usage: {
            prompt_tokens: esttokens(safestringify(messages)),
            completion_tokens: Math.ceil(result.content.length / 4),
          },
          provider: cfg.providername,
        };
        await persist(cfg, {
          sessionid,
          requestid: genid("req"),
          route: "completions",
          model: resolved.display,
          status: "completed",
          startedat: Date.now(),
        });
        return new Response(safestringify(payload), { headers: jsonheaders() });
      }

      const upstream = cfg.upstreams[0];
      const upstreambody = buildbody(
        cfg,
        { ...body, messages, model: resolved.modelid },
        resolved.model,
      );
      delete upstreambody["prompt"];
      const url = upstream.baseurl + (upstream.endpoints?.completions ?? "/chat/completions");
      const headers = buildheaders(cfg, null, body["stream"] === true);
      const res = await executefetch(
        cfg,
        upstream,
        url,
        headers,
        upstreambody,
        body["stream"] === true,
        session,
      );

      if (body["stream"] === true && res.ok) {
        return makestreamresponse(res, { mask: cfg.metamodel.maskupstreammodel ? metaid : null });
      }
      const data = (await safejsonparse(await res.text())) as Record<string, unknown>;
      // adapt chat completion to text completion
      const choices = (data?.["choices"] as Array<Record<string, unknown>> | undefined) ?? [];
      const choice = choices[0]?.["message"] as Record<string, unknown> | undefined;
      const payload = {
        id: data?.["id"] ?? genid(),
        object: "text_completion",
        created: data?.["created"] ?? Math.floor(Date.now() / 1000),
        model: resolved.display,
        choices: [{ index: 0, text: String(choice?.["content"] ?? ""), finish_reason: "stop" }],
        usage: (data?.["usage"] as Record<string, unknown>) ?? {},
        provider: cfg.providername,
      };
      await persist(cfg, {
        sessionid,
        requestid: genid("req"),
        route: "completions",
        model: resolved.display,
        status: "completed",
        startedat: Date.now(),
      });
      return new Response(safestringify(payload), { headers: jsonheaders() });
    } catch (err) {
      return new Response(
        safestringify({ error: err instanceof Error ? err.message : "internal error" }),
        { status: 500, headers: jsonheaders() },
      );
    }
  }

  // ---------------------------------------------------------------------
  // handlemessages — anthropic messages format
  // ---------------------------------------------------------------------
  async function handlemessages(req: Request): Promise<Response> {
    const cors = handlecors(req);
    if (cors) return cors;
    const paused = pausedresponse();
    if (paused) return paused;
    try {
      const body = await parsebody(req);
      if (body === null) return invalidbody("request body is not valid json");
      const sessionid = extractsessionid(req, body) || `s_${Date.now()}`;
      const session = sessions.bump(sessionid);
      const resolved = resolvemodel(
        cfg,
        body["model"] as string | undefined,
        session,
        globalcounter,
      );

      // convert anthropic format to openai
      const anthropicmessages = Array.isArray(body["messages"]) ? body["messages"] : [];
      if (anthropicmessages.length === 0) {
        return invalidbody("messages must be a non-empty array");
      }
      const messages = anthropicmessages.map((m: Record<string, unknown>) => ({
        role: m["role"] === "assistant" ? "assistant" : "user",
        content:
          typeof m["content"] === "string"
            ? m["content"]
            : Array.isArray(m["content"])
              ? (m["content"] as Array<Record<string, unknown>>)
                  .map((c) => c["text"] ?? "")
                  .join("\n")
              : "",
      }));
      if (body["system"]) messages.unshift({ role: "system", content: String(body["system"]) });

      if (cfg.transport?.type === "zai-sdk") {
        const result = await zaisdkcall(messages, {
          max_tokens: Number(body["max_tokens"] ?? 4096),
        });
        const payload = {
          id: `msg_${genid("")}`,
          type: "message",
          role: "assistant",
          model: resolved.display,
          content: [{ type: "text", text: result.content }],
          ...(result.reasoning ? { reasoning_content: result.reasoning } : {}),
          stop_reason: "end_turn",
          usage: {
            input_tokens: esttokens(safestringify(messages)),
            output_tokens: Math.ceil(result.content.length / 4),
          },
        };
        await persist(cfg, {
          sessionid,
          requestid: genid("req"),
          route: "messages",
          model: resolved.display,
          status: "completed",
          startedat: Date.now(),
        });
        return new Response(safestringify(payload), { headers: jsonheaders() });
      }

      const upstream = cfg.upstreams[0];
      const upstreambody = buildbody(
        cfg,
        { ...body, messages, model: resolved.modelid, max_tokens: body["max_tokens"] ?? 4096 },
        resolved.model,
      );
      const url = upstream.baseurl + (upstream.endpoints?.chat ?? "/chat/completions");
      const headers = buildheaders(cfg, null, body["stream"] === true);
      const res = await executefetch(
        cfg,
        upstream,
        url,
        headers,
        upstreambody,
        body["stream"] === true,
        session,
      );

      if (body["stream"] === true && res.ok) {
        return makestreamresponse(res, { mask: cfg.metamodel.maskupstreammodel ? metaid : null });
      }
      const data = (await safejsonparse(await res.text())) as Record<string, unknown>;
      const choices = (data?.["choices"] as Array<Record<string, unknown>> | undefined) ?? [];
      const choice = choices[0]?.["message"] as Record<string, unknown> | undefined;
      const payload = {
        id: `msg_${data?.["id"] ?? genid("")}`,
        type: "message",
        role: "assistant",
        model: resolved.display,
        content: [{ type: "text", text: String(choice?.["content"] ?? "") }],
        ...(choice?.["reasoning_content"]
          ? { reasoning_content: choice["reasoning_content"] }
          : {}),
        stop_reason: "end_turn",
        usage: {
          input_tokens: Number(
            (data?.["usage"] as Record<string, unknown>)?.["prompt_tokens"] ?? 0,
          ),
          output_tokens: Number(
            (data?.["usage"] as Record<string, unknown>)?.["completion_tokens"] ?? 0,
          ),
        },
      };
      await persist(cfg, {
        sessionid,
        requestid: genid("req"),
        route: "messages",
        model: resolved.display,
        status: "completed",
        startedat: Date.now(),
      });
      return new Response(safestringify(payload), { headers: jsonheaders() });
    } catch (err) {
      return new Response(
        safestringify({ error: err instanceof Error ? err.message : "internal error" }),
        { status: 500, headers: jsonheaders() },
      );
    }
  }

  // ---------------------------------------------------------------------
  // handleresponses — openai responses format
  // ---------------------------------------------------------------------
  async function handleresponses(req: Request): Promise<Response> {
    const cors = handlecors(req);
    if (cors) return cors;
    const paused = pausedresponse();
    if (paused) return paused;
    try {
      const body = await parsebody(req);
      if (body === null) return invalidbody("request body is not valid json");
      const sessionid = extractsessionid(req, body) || `s_${Date.now()}`;
      const session = sessions.bump(sessionid);
      const resolved = resolvemodel(
        cfg,
        body["model"] as string | undefined,
        session,
        globalcounter,
      );

      // responses format — input can be string or structured
      const input = body["input"] ?? body["messages"];
      if (typeof input !== "string" && !Array.isArray(input)) {
        return invalidbody("input must be a string or an array");
      }
      if (Array.isArray(input) && input.length === 0) {
        return invalidbody("input must not be empty");
      }
      const messages =
        typeof input === "string"
          ? [{ role: "user", content: input }]
          : Array.isArray(input)
            ? input
            : [];

      if (cfg.transport?.type === "zai-sdk") {
        const result = await zaisdkcall(messages, {
          max_tokens: Number(body["max_output_tokens"] ?? 4096),
        });
        const responseid = `resp_${genid("")}`;
        const payload = {
          id: responseid,
          object: "response",
          created_at: Math.floor(Date.now() / 1000),
          model: resolved.display,
          status: "completed",
          output: [
            {
              type: "message",
              id: `msg_${genid("")}`,
              role: "assistant",
              content: [
                {
                  type: "output_text",
                  text: result.content,
                  ...(result.reasoning ? { reasoning: result.reasoning } : {}),
                },
              ],
            },
          ],
          usage: {
            input_tokens: esttokens(safestringify(messages)),
            output_tokens: Math.ceil(result.content.length / 4),
          },
        };
        await persist(cfg, {
          sessionid,
          requestid: genid("req"),
          route: "responses",
          model: resolved.display,
          status: "completed",
          startedat: Date.now(),
        });
        return new Response(safestringify(payload), { headers: jsonheaders() });
      }

      const upstream = cfg.upstreams[0];
      const upstreambody = buildbody(
        cfg,
        { ...body, messages, model: resolved.modelid },
        resolved.model,
      );
      const url = upstream.baseurl + (upstream.endpoints?.chat ?? "/chat/completions");
      const headers = buildheaders(cfg, null, body["stream"] === true);
      const res = await executefetch(
        cfg,
        upstream,
        url,
        headers,
        upstreambody,
        body["stream"] === true,
        session,
      );
      const data = (await safejsonparse(await res.text())) as Record<string, unknown>;
      const choices = (data?.["choices"] as Array<Record<string, unknown>> | undefined) ?? [];
      const choice = choices[0]?.["message"] as Record<string, unknown> | undefined;
      const payload = {
        id: `resp_${data?.["id"] ?? genid("")}`,
        object: "response",
        created_at: data?.["created"] ?? Math.floor(Date.now() / 1000),
        model: resolved.display,
        status: "completed",
        output: [
          {
            type: "message",
            id: `msg_${genid("")}`,
            role: "assistant",
            content: [{ type: "output_text", text: String(choice?.["content"] ?? "") }],
          },
        ],
        usage: (data?.["usage"] as Record<string, unknown>) ?? {},
      };
      await persist(cfg, {
        sessionid,
        requestid: genid("req"),
        route: "responses",
        model: resolved.display,
        status: "completed",
        startedat: Date.now(),
      });
      return new Response(safestringify(payload), { headers: jsonheaders() });
    } catch (err) {
      return new Response(
        safestringify({ error: err instanceof Error ? err.message : "internal error" }),
        { status: 500, headers: jsonheaders() },
      );
    }
  }

  // ---------------------------------------------------------------------
  // handleembeddings — embeddings route
  // ---------------------------------------------------------------------
  async function handleembeddings(req: Request): Promise<Response> {
    const cors = handlecors(req);
    if (cors) return cors;
    const paused = pausedresponse();
    if (paused) return paused;
    const routes = cfg.routes ?? {};
    if (routes.embeddings === "disabled" || cfg.transport?.type === "zai-sdk") {
      return new Response(
        safestringify({
          error: routes.embeddingsmessage ?? `${cfg.providername} has no embeddings endpoint`,
          code: "embeddings_unavailable",
          ...(routes.fallbackroute ? { fallback: routes.fallbackroute } : {}),
        }),
        { status: 501, headers: jsonheaders() },
      );
    }
    try {
      const body = ((await safejsonparse(await req.text())) ?? {}) as Record<string, unknown>;
      const upstream = cfg.upstreams.find((u) => u.endpoints?.embeddings) ?? cfg.upstreams[0];
      const url = upstream.baseurl + (upstream.endpoints?.embeddings ?? "/embeddings");
      const headers = buildheaders(cfg, null, false);
      const key = await resolveauth(cfg);
      if (key) Object.assign(headers, buildauthheaders(cfg.auth, key.key));
      const res = await fetch(url, {
        method: "POST",
        headers,
        body: safestringify({ ...body, model: body["model"] ?? cfg.defaultmodel }),
        signal: AbortSignal.timeout(cfg.timeout?.requestms ?? 300000),
      });
      const text = await res.text();
      return new Response(text, { status: res.status, headers: jsonheaders() });
    } catch (err) {
      return new Response(
        safestringify({ error: err instanceof Error ? err.message : "internal error" }),
        { status: 500, headers: jsonheaders() },
      );
    }
  }

  return {
    handleinfo,
    handlekeys,
    handlemodels,
    handlechatcompletions,
    handlecompletions,
    handlemessages,
    handleresponses,
    handleembeddings,
  };
}

// ---------------------------------------------------------------------------
// persistence — universal savemsg wrapper
// ---------------------------------------------------------------------------

/** persist a message with version metadata — never throws
 * handlers capture startedat as epoch millis; the schema column is a
 * DateTime — a raw number fails validation and the create silently
 * no-ops (the exact failure the real-consumer run caught: zero rows for
 * every request). the wrapper coerces once, at the single choke point. */
async function persist(cfg: gatewayconfig, fields: Record<string, unknown>): Promise<void> {
  try {
    await savemsg({
      ...fields,
      ...(fields["startedat"] !== undefined
        ? { startedat: new Date(Number(fields["startedat"])) }
        : {}),
      provider: cfg.providername,
      version: cfg.id,
      endpoint: cfg.upstreams[0]?.name ?? cfg.providername,
    });
  } catch {
    // never throw on db errors
  }
}

/** export internals for testing and advanced usage */
export const engineinternals = {
  resolvemodel,
  findmodel,
  fusioncontext,
  buildbody,
  classifystatus,
  backoffms,
  reconstructhistory,
  fitcontext,
  defaultbudgets,
  defaultretrystatuses,
  defaultrotatestatuses,
  defaultfallbackstatuses,
};
