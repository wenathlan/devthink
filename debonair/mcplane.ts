// # mcplane — the mcp automation lane of the debonair engine (root layer,
// wave PV6.004): the automation surface an external agent drives — the
// same gateway lanes the browser bench rides, under the agent's own
// identity. the tool list mirrors the family mcp contract
// (devthink/docs/mcpserver.md): every tool name carries its domain
// prefix (debonair.*) so colliding base names stay unambiguous, every
// tool maps its inputs to a json schema of typed properties with the
// required list, carries its version, its risk class and its consent
// requirement in the metadata, and every call answers a typed result —
// never a throw. the seven tools walk the whole pipeline: ingest_reference
// (the ialane post — the reference library grows without a human),
// mine_profile (the genre profile job), compose_plan (the composer over
// the freshest profile — the same pure library call the generate page
// rides), compose_plan_ai (the family ai gateway seat — the model answer
// parses onto the same pattern document), render_track (the render job
// queue and its walk), publish_track
// (the vitrine flip under the owner law) and list_vitrine (the public
// surface). the agent identity rides the caller's agentId when the
// automation carries its own; absent one, the lane mints one per lane
// build — the same column law every owner stamp rides (the minted
// decimal form, the owner column of every row the tools land). the lane
// is opt-in: it answers nothing until the deploy configures the gateway
// origin under the house https law — an unconfigured or unlawful origin
// answers the not-configured refusal on every call, and the catalog
// stays the published contract the driver reads. zero dependencies, zero
// consumer data.

import { mintid } from "./bigintids.ts";
import { composeFromProfile } from "./composer.ts";
import type { GatewayProfileRow } from "./gatewayapi.ts";
import { fetchProfile, listVitrine, mineProfile, pollRenderJob, publishTrack, queueRender } from "./generateclient.ts";
import { GENRES, matchGenre } from "./genrematrix.ts";
import type { IngestClientCode, IngestClientDeps, IngestClientResult } from "./ingestclient.ts";
import { pollJob, uploadIngest } from "./ingestclient.ts";
import { composeWithLlm, type LlmLaneCode } from "./llmlane.ts";
import { hostallowed } from "./onboardingstate.ts";
import type { PatternProject } from "./patternenums.ts";
import { validatePatternProject } from "./patternenums.ts";
import type { RenderTrackRow } from "./renderworker.ts";

/** @section catalog — the tool list (the family mcp contract) */

/** The domain prefix every tool name carries (the collision law of the
 * family catalog: a bare name resolves only when exactly one tool of the
 * catalog carries it). */
export const MCP_DOMAIN = "debonair";

/** The seven tool names of the lane (the namespaced catalog). */
export const MCP_TOOL_NAMES: readonly string[] = [
  "debonair.ingest_reference",
  "debonair.mine_profile",
  "debonair.compose_plan",
  "debonair.compose_plan_ai",
  "debonair.render_track",
  "debonair.publish_track",
  "debonair.list_vitrine",
];

/** One typed property of a tool's input schema (the family law: string,
 * number, boolean, object or array, each with a plain language
 * description). */
export interface McpToolProperty {
  /** The json schema type of the property. */
  type: "string" | "number" | "boolean" | "object" | "array";
  /** The plain language description (the openapi style field layout). */
  description: string;
}

/** One tool of the catalog — the name, the version, the description, the
 * json schema inputs, the risk class and the consent requirement (the
 * metadata contract the tools/list answer carries). */
export interface McpToolDef {
  /** The namespaced tool name ("debonair.ingest_reference"). */
  name: string;
  /** The tool's own version beside the catalog's (compatibility checks). */
  version: number;
  /** The plain language description (states the side effects and the
   * consent class). */
  description: string;
  /** The risk class: read tools answer facts, write tools land rows. */
  risk: "read" | "write";
  /** The consent requirement in plain language (the caller must hold the
   * reviewed grant before the tool runs). */
  consent: string;
  /** The json schema inputs: typed properties and the required list. */
  inputs: {
    type: "object";
    properties: Record<string, McpToolProperty>;
    required: readonly string[];
  };
}

/** The tool catalog of the debonair lane — the published contract the
 * mcp driver reads (tools/list). */
export function toolcatalog(): readonly McpToolDef[] {
  return [
    {
      name: "debonair.ingest_reference",
      version: 1,
      description:
        "uploads one reference wav to the debonair library through the same ingest route the visitor bench rides: the agent identity stamps the owner column, the kind is reference and the visibility is the public vitrine. side effects: lands an ingest job row and, once the walk runs, a document row with its blobs. consent: the reviewed ingest grant of the deploy.",
      risk: "write",
      consent: "the reviewed ingest grant — the reference lands on the public vitrine under the agent identity",
      inputs: {
        type: "object",
        properties: {
          name: { type: "string", description: "the display name of the source (the library groups by it)" },
          genre: {
            type: "string",
            description: "the genre key of the style dictionary (one of the fifteen the pattern miner groups by)",
          },
          bytes: { type: "string", description: "the source wav bytes as standard padded base64" },
        },
        required: ["name", "genre", "bytes"],
      },
    },
    {
      name: "debonair.mine_profile",
      version: 1,
      description:
        "queues the genre profile mine of the debonair miner lane and answers once the walk lands: the references of the genre feed the profile document (a genre with no references fails honestly). side effects: lands a job row on the shared ledger and a genre_profiles row. consent: the reviewed mine grant of the deploy.",
      risk: "write",
      consent: "the reviewed mine grant — the profile row lands from the genre's public references",
      inputs: {
        type: "object",
        properties: {
          genre: { type: "string", description: "the genre key to profile (one of the fifteen)" },
        },
        required: ["genre"],
      },
    },
    {
      name: "debonair.compose_plan",
      version: 1,
      description:
        "composes one pattern plan from a free-text prompt against the freshest profile of the genre (the same pure composer the generate page rides — no side effects, no job: the plan answers in the call). the genre resolves from the prompt when the caller names none.",
      risk: "read",
      consent: "none — the composition is a pure read over the public profile",
      inputs: {
        type: "object",
        properties: {
          prompt: { type: "string", description: "the free-text prompt (the composer reads its pins)" },
          genre: {
            type: "string",
            description: "the genre key to compose against (defaults to the prompt's own match)",
          },
          salt: { type: "string", description: "the fresh-take salt (empty answers the canonical take)" },
        },
        required: ["prompt"],
      },
    },
    {
      name: "debonair.compose_plan_ai",
      version: 1,
      description:
        "composes one pattern plan through the family ai gateway: the free-text prompt and the enum-table instruction walk the chat completions lane and the model answer parses onto the same debonair.pattern/1 document the deterministic composer answers (no side effects, no job — the plan answers in the call; a model that answers no parsable pattern fails honestly with the bad-model refusal, never a silent fallback).",
      risk: "read",
      consent: "none — the composition is a pure read over the family gateway seat",
      inputs: {
        type: "object",
        properties: {
          prompt: { type: "string", description: "the free-text prompt of the request (the model reads it beside the instruction)" },
          model: { type: "string", description: "the model name to ask for (defaults to the family meta model)" },
        },
        required: ["prompt"],
      },
    },
    {
      name: "debonair.render_track",
      version: 1,
      description:
        "queues one render job (a composed plan or a prompt composed against the genre profile) and answers once the walk lands: the wav lands in the blob store and the track row lands with the owner pointer and the wav address. side effects: lands a render job row, a blob and a track row. consent: the reviewed render grant of the deploy.",
      risk: "write",
      consent: "the reviewed render grant — the take lands under the agent identity",
      inputs: {
        type: "object",
        properties: {
          plan: { type: "object", description: "the composed debonair.pattern/1 project (wins over the prompt)" },
          prompt: { type: "string", description: "the free-text prompt to compose when no plan rides" },
          genre: { type: "string", description: "the genre key the prompt composes against (defaults to the match)" },
          salt: { type: "string", description: "the fresh-take salt of the composition" },
        },
        required: [],
      },
    },
    {
      name: "debonair.publish_track",
      version: 1,
      description:
        "flips one rendered track onto the public vitrine under the owner law: the track must answer to the agent identity (a foreign track refuses). side effects: flips the track row's status to published. consent: the reviewed publish grant of the deploy.",
      risk: "write",
      consent: "the reviewed publish grant — the vitrine is the owner's move",
      inputs: {
        type: "object",
        properties: {
          trackId: { type: "string", description: "the track row id the render walk stamped" },
        },
        required: ["trackId"],
      },
    },
    {
      name: "debonair.list_vitrine",
      version: 1,
      description:
        "answers the public vitrine surface of the generate lane: the published track rows beside the freshest genre profiles (the vitrine documents ride the shelf route).",
      risk: "read",
      consent: "none — the vitrine is the public surface",
      inputs: { type: "object", properties: {}, required: [] },
    },
  ];
}

/** @section lane — the configured automation surface (opt-in) */

/** The lane configuration — the deploy's opt-in: the gateway origin under
 * the house https law, the agent identity when the automation carries
 * its own, the injected client seams and the poll rhythm the walk-waiting
 * tools ride. */
export interface McpLaneConfig {
  /** The gateway origin (https, a public host — the same origin the
   * browser lanes ride). */
  origin: string;
  /** The agent's own owner id (the minted decimal form); the lane mints
   * one per lane build when the caller carries none. */
  agentId?: string;
  /** The injected client seams (the tests hand doubles). */
  deps?: IngestClientDeps;
  /** The poll interval of the walk-waiting tools (default 500 ms). */
  pollIntervalMs?: number;
  /** The poll deadline of the walk-waiting tools (default 120 s — a walk
   * that never lands answers the honest failure). */
  pollDeadlineMs?: number;
}

/** The built lane — the resolved origin, the agent identity and the poll
 * rhythm (the identity is minted once per lane build, the same column
 * law every owner stamp rides). */
export interface McpAgentLane {
  /** The gateway origin. */
  origin: string;
  /** The agent identity (the owner stamp every write carries). */
  agentId: string;
  /** The injected client seams. */
  deps: IngestClientDeps;
  /** The poll interval of the walk-waiting tools. */
  pollIntervalMs: number;
  /** The poll deadline of the walk-waiting tools. */
  pollDeadlineMs: number;
}

/** The default poll interval of the walk-waiting tools. */
export const MCP_POLL_INTERVAL_MS = 500;

/** The default poll deadline of the walk-waiting tools. */
export const MCP_POLL_DEADLINE_MS = 120_000;

/**
 * Builds the mcp lane — the opt-in gate: the config must carry a gateway
 * origin that passes the house https law (https only, public hosts), and
 * the agent identity resolves to the caller's own or a fresh mint. an
 * absent config or an unlawful origin answers null — the lane refuses to
 * answer anything until the deploy configures it (never a silent open).
 *
 * @param config the lane configuration (null when the deploy carries none).
 * @returns the built lane, or null when the lane stays closed.
 */
export function mcplane(config: McpLaneConfig | null | undefined): McpAgentLane | null {
  if (config === null || config === undefined) return null;
  const origin = config.origin.trim().replace(/\/+$/, "");
  if (origin.length === 0 || !hostallowed(origin)) return null;
  return {
    origin,
    agentId: config.agentId ?? mintid(),
    deps: config.deps ?? {},
    pollIntervalMs: config.pollIntervalMs ?? MCP_POLL_INTERVAL_MS,
    pollDeadlineMs: config.pollDeadlineMs ?? MCP_POLL_DEADLINE_MS,
  };
}

/** @section results — the typed answer of every tool call */

/** The machine codes the lane answers: the opt-in refusal first (the lane
 * only answers when configured), the dispatch law next (an unknown tool,
 * arguments that fail the input schema), the wire lanes (the gateway
 * refused the call) and the walk law last (a job that landed failed). */
export type McpToolErrorCode =
  | "not-configured" // the lane answers nothing until the deploy configures it
  | "unknown-tool" // the name is not one of the six
  | "bad-args" // the arguments failed the tool's input schema
  | "lane-refused" // the gateway lane refused (the client's own code rides)
  | "job-failed"; // the queued walk landed failed (the honest error rides)

/** One typed tool failure — the code, the readable message and the wire
 * lane's own code and status when a client call refused. */
export interface McpToolError {
  code: McpToolErrorCode;
  message: string;
  /** The gateway client's own machine code (present on lane-refused). */
  lane?: { code: IngestClientCode; status: number | null };
}

/** The typed answer of one tool call — never a throw. */
export type McpToolResult<T> = { ok: true; tool: string; result: T } | ({ ok: false; tool: string } & McpToolError);

/** The failure branch builder. */
function toolfail<T>(
  tool: string,
  code: McpToolErrorCode,
  message: string,
  lane?: McpToolError["lane"],
): McpToolResult<T> {
  return { ok: false, tool, code, message, ...(lane === undefined ? {} : { lane }) };
}

/** Translates one client refusal onto the lane-refused branch. */
function lanefail<T>(
  tool: string,
  refused: { error: { code: IngestClientCode | LlmLaneCode; message: string; status: number | null } },
): McpToolResult<T> {
  return toolfail(tool, "lane-refused", refused.error.message, {
    code: refused.error.code,
    status: refused.error.status,
  });
}

/** @section args — the input schema guards */

/** Reads one required string argument off the tool args. */
function argstring(args: Record<string, unknown>, name: string): string | null {
  const value = args[name];
  return typeof value === "string" && value.length > 0 ? value : null;
}

/** Reads one optional string argument off the tool args (null when
 * absent, undefined-cast when the field carries a foreign type). */
function argoptstring(args: Record<string, unknown>, name: string): string | null | undefined {
  const value = args[name];
  if (value === undefined) return null;
  return typeof value === "string" ? value : undefined;
}

/** The standard base64 alphabet (the strict decode lane — the same
 * hand-rolled discipline the gateway's own decoder rides). */
const B64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/** The alphabet lookup table — built once per process. */
const B64_TABLE: Record<string, number> = {};
for (let index = 0; index < B64_ALPHABET.length; index++) {
  B64_TABLE[B64_ALPHABET[index]] = index;
}

/**
 * Decodes strict base64 — the ingest tool's bytes lane (deterministic,
 * pure, the mirror of the gateway's own decoder: the length folds to
 * four, only the alphabet rides, the "=" pads only the tail).
 *
 * @param text the base64 text.
 * @returns the decoded bytes, or null when the text is not honest base64.
 */
function decodebase64(text: string): Uint8Array | null {
  if (text.length % 4 !== 0) return null;
  let pads = 0;
  if (text.endsWith("==")) pads = 2;
  else if (text.endsWith("=")) pads = 1;
  const chars = text.length - pads;
  const tail = chars % 4;
  if (tail === 1) return null;
  const bytes = Math.floor(chars / 4) * 3 + (tail === 2 ? 1 : tail === 3 ? 2 : 0);
  const out = new Uint8Array(bytes);
  let cursor = 0;
  let buffer = 0;
  let bits = 0;
  for (let index = 0; index < chars; index++) {
    const value = B64_TABLE[text[index]];
    if (value === undefined) return null;
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out[cursor++] = (buffer >> bits) & 0xff;
    }
  }
  return out;
}

/** The genre keys of the style dictionary (the fifteen the miner groups
 * by — the same seat the ialane validates against). */
const GENRE_KEYS: readonly string[] = GENRES.map((genre) => genre.id);

/** @section tools — the six seats of the lane */

/** The ingest_reference answer — the reference record (the job to watch,
 * the genre, the identity that stamped it). */
export interface IngestReferenceResult {
  jobId: string;
  genre: string;
  name: string;
  serviceId: string;
  kind: "reference";
  visibility: "vitrine";
}

/**
 * debonair.ingest_reference — posts one reference through the same upload
 * route the visitor bench rides: the agent identity stamps the owner
 * column, the kind is "reference", the visibility is the vitrine (the
 * public shelf the pattern miner reads). the genre validates against the
 * style dictionary before any byte leaves the host.
 *
 * @param lane the built lane.
 * @param args the tool arguments (name, genre, bytes — base64).
 * @returns the reference record, or the typed refusal.
 */
export async function mcpIngestReference(
  lane: McpAgentLane | null,
  args: Record<string, unknown>,
): Promise<McpToolResult<IngestReferenceResult>> {
  const tool = "debonair.ingest_reference";
  if (lane === null)
    return toolfail(
      tool,
      "not-configured",
      "the mcp lane answers nothing until the deploy configures the gateway origin",
    );
  const name = argstring(args, "name");
  const genre = argstring(args, "genre");
  const bytestext = argstring(args, "bytes");
  if (name === null || genre === null || bytestext === null) {
    return toolfail(tool, "bad-args", "the tool needs the name, the genre and the bytes (standard padded base64)");
  }
  if (!GENRE_KEYS.includes(genre)) {
    return toolfail(
      tool,
      "bad-args",
      `the genre ${JSON.stringify(genre)} is off the style dictionary — the lane carries one of the fifteen`,
    );
  }
  const bytes = decodebase64(bytestext);
  if (bytes === null || bytes.length === 0) {
    return toolfail(tool, "bad-args", "the bytes field is not honest base64 (or carries no bytes)");
  }
  const answer = await uploadIngest(
    {
      bytes,
      name,
      ownerId: lane.agentId,
      kind: "reference",
      visibility: "vitrine",
      origin: lane.origin,
    },
    lane.deps,
  );
  if (!answer.ok) return lanefail(tool, answer);
  return {
    ok: true,
    tool,
    result: {
      jobId: answer.data.jobId,
      genre,
      name,
      serviceId: lane.agentId,
      kind: "reference",
      visibility: "vitrine",
    },
  };
}

/** One walk row the poll loop reads (the shared shape of both ledgers). */
interface WalkRow {
  state: string;
  error: string | null;
}

/**
 * Polls one queued walk until it lands — the shared wait of the
 * mine and render tools: the poll function answers the walk row, the
 * loop sleeps the lane's interval until the state leaves the riding
 * lanes or the deadline passes (a walk that never lands answers the
 * honest timeout failure, never a hang).
 */
async function waitforwalk<T extends WalkRow>(
  lane: McpAgentLane,
  poll: () => Promise<IngestClientResult<T>>,
  tool: string,
): Promise<McpToolResult<T>> {
  const deadline = Date.now() + lane.pollDeadlineMs;
  for (;;) {
    const answer = await poll();
    if (!answer.ok) return lanefail(tool, answer);
    if (answer.data.state === "done") return { ok: true, tool, result: answer.data };
    if (answer.data.state === "failed") {
      return toolfail(tool, "job-failed", answer.data.error ?? "the walk landed failed");
    }
    if (Date.now() >= deadline) {
      return toolfail(tool, "job-failed", `the walk kept riding past ${lane.pollDeadlineMs} ms`);
    }
    await new Promise((resolve) => setTimeout(resolve, lane.pollIntervalMs));
  }
}

/** The mine_profile answer — the profile row the walk landed. */
export interface MineProfileResult {
  jobId: string;
  profileId: string;
  genre: string;
  ownerId: string;
}

/**
 * debonair.mine_profile — queues the genre profile mine and answers once
 * the walk lands: the references of the genre feed the profile document
 * (the shared ingest ledger carries the walk; the document_id column
 * stamps the profile row id). a genre with no references fails honestly.
 *
 * @param lane the built lane.
 * @param args the tool arguments (genre).
 * @returns the landed profile row id, or the typed refusal.
 */
export async function mcpMineProfile(
  lane: McpAgentLane | null,
  args: Record<string, unknown>,
): Promise<McpToolResult<MineProfileResult>> {
  const tool = "debonair.mine_profile";
  if (lane === null)
    return toolfail(
      tool,
      "not-configured",
      "the mcp lane answers nothing until the deploy configures the gateway origin",
    );
  const genre = argstring(args, "genre");
  if (genre === null) return toolfail(tool, "bad-args", "the tool needs the genre key (one of the fifteen)");
  if (!GENRE_KEYS.includes(genre)) {
    return toolfail(
      tool,
      "bad-args",
      `the genre ${JSON.stringify(genre)} is off the style dictionary — the lane carries one of the fifteen`,
    );
  }
  const queued = await mineProfile(genre, lane.agentId, lane.origin, lane.deps);
  if (!queued.ok) return lanefail(tool, queued);
  const walk = await waitforwalk(lane, () => pollJob(queued.data.jobId, lane.origin, lane.deps), tool);
  if (!walk.ok) return walk;
  return {
    ok: true,
    tool,
    result: {
      jobId: queued.data.jobId,
      profileId: walk.result.documentId ?? "",
      genre,
      ownerId: lane.agentId,
    },
  };
}

/** The compose_plan answer — the plan the composer answered. */
export interface ComposePlanResult {
  genre: string;
  prompt: string;
  plan: PatternProject;
}

/**
 * debonair.compose_plan — composes one pattern plan from a free-text
 * prompt against the freshest profile of the genre: the profile reads
 * through the gateway profile route, the composition runs the same pure
 * library call the generate page rides (no job, no side effects — the
 * plan answers in the call). the genre resolves from the prompt when the
 * caller names none.
 *
 * @param lane the built lane.
 * @param args the tool arguments (prompt, genre?, salt?).
 * @returns the composed plan, or the typed refusal.
 */
export async function mcpComposePlan(
  lane: McpAgentLane | null,
  args: Record<string, unknown>,
): Promise<McpToolResult<ComposePlanResult>> {
  const tool = "debonair.compose_plan";
  if (lane === null)
    return toolfail(
      tool,
      "not-configured",
      "the mcp lane answers nothing until the deploy configures the gateway origin",
    );
  const prompt = argstring(args, "prompt");
  if (prompt === null) return toolfail(tool, "bad-args", "the tool needs the free-text prompt");
  const salt = argoptstring(args, "salt");
  if (salt === undefined) return toolfail(tool, "bad-args", "the salt, when it rides, must be a string");
  const named = argoptstring(args, "genre");
  if (named === undefined) return toolfail(tool, "bad-args", "the genre, when it rides, must be a string");
  const genre = named ?? matchGenre(prompt)?.id ?? null;
  if (genre === null) {
    return toolfail(tool, "bad-args", "the prompt matches no genre of the fifteen — name the genre explicitly");
  }
  const profile: IngestClientResult<GatewayProfileRow> = await fetchProfile(genre, lane.origin, lane.deps);
  if (!profile.ok) return lanefail(tool, profile);
  return {
    ok: true,
    tool,
    result: { genre, prompt, plan: composeFromProfile(prompt, profile.data.profile, salt ?? "") },
  };
}

/** The compose_plan_ai answer — the ai plan beside the seat facts. */
export interface ComposePlanAiResult {
  plan: PatternProject;
  model: string;
  origin: string;
}

/**
 * debonair.compose_plan_ai — composes one pattern plan through the family
 * ai gateway: the free-text prompt and the enum-table instruction
 * (patternPromptHint) walk the chat completions lane of the configured
 * origin and the model answer parses through patternFromLlm onto the
 * same debonair.pattern/1 document the deterministic composer answers
 * (no side effects, no job — the plan answers in the call). a model that
 * answers no parsable pattern fails honestly with the bad-model refusal
 * — never a silent fallback to the deterministic lane.
 *
 * @param lane the built lane.
 * @param args the tool arguments (prompt, model?).
 * @returns the ai plan with the seat facts, or the typed refusal.
 */
export async function mcpComposePlanAi(
  lane: McpAgentLane | null,
  args: Record<string, unknown>,
): Promise<McpToolResult<ComposePlanAiResult>> {
  const tool = "debonair.compose_plan_ai";
  if (lane === null)
    return toolfail(
      tool,
      "not-configured",
      "the mcp lane answers nothing until the deploy configures the gateway origin",
    );
  const prompt = argstring(args, "prompt");
  if (prompt === null) return toolfail(tool, "bad-args", "the tool needs the free-text prompt");
  const model = argoptstring(args, "model");
  if (model === undefined) return toolfail(tool, "bad-args", "the model, when it rides, must be a string");
  const answer = await composeWithLlm({
    prompt,
    model: model ?? undefined,
    origin: lane.origin,
    deps: lane.deps,
  });
  if (!answer.ok) return lanefail(tool, answer);
  return { ok: true, tool, result: { plan: answer.data.plan, model: answer.data.model, origin: answer.data.origin } };
}

/** The render_track answer — the landed take. */
export interface RenderTrackResult {
  jobId: string;
  wavPointer: string;
  trackId: string | null;
  ownerId: string;
}

/**
 * debonair.render_track — queues one render job (a composed plan or a
 * prompt composed against the genre profile) and answers once the walk
 * lands: the wav lands in the blob store, the track row lands with the
 * owner pointer and the wav address (the track id resolves through the
 * owner shelf of the vitrine — the walk's own stamp, read back under the
 * visibility law).
 *
 * @param lane the built lane.
 * @param args the tool arguments (plan? or prompt?, genre?, salt?).
 * @returns the landed take, or the typed refusal.
 */
export async function mcpRenderTrack(
  lane: McpAgentLane | null,
  args: Record<string, unknown>,
): Promise<McpToolResult<RenderTrackResult>> {
  const tool = "debonair.render_track";
  if (lane === null)
    return toolfail(
      tool,
      "not-configured",
      "the mcp lane answers nothing until the deploy configures the gateway origin",
    );
  let plan: PatternProject;
  const planfield = args.plan;
  if (planfield !== undefined) {
    if (typeof planfield !== "object" || planfield === null || Array.isArray(planfield)) {
      return toolfail(tool, "bad-args", "the plan, when it rides, must be a debonair.pattern/1 object");
    }
    const checked = validatePatternProject(planfield);
    if (!checked.ok) {
      return toolfail(tool, "bad-args", `the plan failed the pattern contract (${checked.code}): ${checked.message}`);
    }
    plan = checked.doc;
  } else {
    const composed = await mcpComposePlan(lane, args);
    if (!composed.ok) return composed;
    plan = composed.result.plan;
  }
  const queued = await queueRender(plan, lane.agentId, lane.origin, lane.deps);
  if (!queued.ok) return lanefail(tool, queued);
  const walk = await waitforwalk(lane, () => pollRenderJob(queued.data.jobId, lane.origin, lane.deps), tool);
  if (!walk.ok) return walk;
  // the track id reads back through the owner shelf of the vitrine (the
  // walk's own stamp — the row carries the wav address it landed)
  const wavPointer = walk.result.wavPointer ?? "";
  let trackId: string | null = null;
  if (wavPointer.length > 0) {
    const shelf = await listVitrine(lane.origin, lane.agentId, lane.deps);
    if (shelf.ok) {
      const own = shelf.data.tracks.find((row: RenderTrackRow) => row.wavPointer === wavPointer);
      trackId = own?.id ?? null;
    }
  }
  return { ok: true, tool, result: { jobId: queued.data.jobId, wavPointer, trackId, ownerId: lane.agentId } };
}

/** The publish_track answer — the published row. */
export type PublishTrackResult = RenderTrackRow;

/**
 * debonair.publish_track — flips one rendered track onto the public
 * vitrine under the owner law: the track must answer to the agent
 * identity (a foreign track refuses, never someone else's shelf).
 *
 * @param lane the built lane.
 * @param args the tool arguments (trackId).
 * @returns the published track row, or the typed refusal.
 */
export async function mcpPublishTrack(
  lane: McpAgentLane | null,
  args: Record<string, unknown>,
): Promise<McpToolResult<PublishTrackResult>> {
  const tool = "debonair.publish_track";
  if (lane === null)
    return toolfail(
      tool,
      "not-configured",
      "the mcp lane answers nothing until the deploy configures the gateway origin",
    );
  const trackId = argstring(args, "trackId");
  if (trackId === null) return toolfail(tool, "bad-args", "the tool needs the trackId the render walk stamped");
  const answer = await publishTrack(trackId, lane.agentId, lane.origin, lane.deps);
  if (!answer.ok) return lanefail(tool, answer);
  return { ok: true, tool, result: answer.data };
}

/** The list_vitrine answer — the public surface. */
export interface ListVitrineResult {
  tracks: RenderTrackRow[];
  profiles: GatewayProfileRow[];
}

/**
 * debonair.list_vitrine — answers the public vitrine surface of the
 * generate lane: the published track rows beside the freshest genre
 * profiles.
 *
 * @param lane the built lane.
 * @param args the tool arguments (none).
 * @returns the vitrine surface, or the typed refusal.
 */
export async function mcpListVitrine(
  lane: McpAgentLane | null,
  _args: Record<string, unknown>,
): Promise<McpToolResult<ListVitrineResult>> {
  const tool = "debonair.list_vitrine";
  if (lane === null)
    return toolfail(
      tool,
      "not-configured",
      "the mcp lane answers nothing until the deploy configures the gateway origin",
    );
  const answer = await listVitrine(lane.origin, undefined, lane.deps);
  if (!answer.ok) return lanefail(tool, answer);
  return { ok: true, tool, result: answer.data };
}

/** @section dispatch — the tools/call seat */

/** The per-tool call seats the dispatch routes to (the name-keyed catalog
 * of the seven tools — the lockstep with MCP_TOOL_NAMES). */
const TOOLCALLS: Record<
  string,
  (lane: McpAgentLane | null, args: Record<string, unknown>) => Promise<McpToolResult<unknown>>
> = {
  "debonair.ingest_reference": mcpIngestReference,
  "debonair.mine_profile": mcpMineProfile,
  "debonair.compose_plan": mcpComposePlan,
  "debonair.compose_plan_ai": mcpComposePlanAi,
  "debonair.render_track": mcpRenderTrack,
  "debonair.publish_track": mcpPublishTrack,
  "debonair.list_vitrine": mcpListVitrine,
};

/**
 * Dispatches one tool call — the tools/call seat of the family contract:
 * an unconfigured lane answers the not-configured refusal (the opt-in
 * law), an unknown name answers unknown-tool, and the known tools
 * validate their arguments against their input schema before any byte
 * leaves the host. never a throw: every refusal answers the typed branch.
 *
 * @param lane the built lane (null when the deploy carries none).
 * @param name the namespaced tool name.
 * @param args the tool arguments (the parsed json object, if any).
 * @returns the typed tool result.
 */
export async function calltool(
  lane: McpAgentLane | null,
  name: string,
  args: Record<string, unknown> | undefined,
): Promise<McpToolResult<unknown>> {
  if (lane === null) {
    return toolfail(
      name,
      "not-configured",
      "the mcp lane answers nothing until the deploy configures the gateway origin",
    );
  }
  const call = TOOLCALLS[name];
  if (call === undefined) {
    return toolfail(
      name,
      "unknown-tool",
      `the tool ${JSON.stringify(name)} is not one of the lane (${MCP_TOOL_NAMES.join(", ")})`,
    );
  }
  try {
    return await call(lane, args ?? {});
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return toolfail(name, "lane-refused", `the tool faulted past its guards: ${message}`);
  }
}
