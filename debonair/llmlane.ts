// # llmlane — the ai seat of the generation lane (root layer, wave the
// llm wire): the family ai gateway (getry) answers the chat completion
// the pattern generation rides — the instruction paragraph
// patternPromptHint builds from the enum tables (every token from the
// vocabulary, zero hardcoded words) and the model answer patternFromLlm
// parses onto the debonair.pattern/1 document (the same validator the
// file lane rides, the honest clamps and the machine codes). the origin
// rides VITE_GETRY_URL (the same origin law the family lanes carry —
// getry/debonairlane.ts mirrors it for the debonair side) and every
// candidate passes the house https law (hostallowed of
// onboardingstate.ts — https only, public hosts only) before a byte
// leaves the host. the fetch seam is injected (the tests hand doubles,
// the browser hands the default) and every call answers a typed result,
// never a throw: the five wire codes the family clients share (offline —
// the host law refused the origin or the network never answered;
// timeout — the silent window; refused — a status outside the 2xx lane
// beyond the 400 law; bad-response — the body failed the shape guard;
// bad-request — the gateway refused the facts with a 400) beside the
// lane's own honest refusal: bad-model — the model answered no parsable
// pattern, the refusal the caller surfaces, never a silent fallback to
// the deterministic composer (the caller may fall back itself — the
// drift stays the caller's fact, not the lane's theater).
// zero dependencies, zero consumer data.

import { gatewaylane, type IngestClientDeps } from "./ingestclient.ts";
import { hostallowed } from "./onboardingstate.ts";
import { patternFromLlm, patternPromptHint, type PatternProject } from "./patternenums.ts";

/** @section codes — the typed failure branch */

/** The machine codes the ai lane answers — the five wire codes the family
 * clients share beside the lane's own honest model refusal. */
export type LlmLaneCode = "offline" | "timeout" | "refused" | "bad-response" | "bad-request" | "bad-model";

/** One typed ai lane failure — the code, the readable message and the http
 * status the gateway answered (null when no answer arrived). */
export interface LlmLaneError {
  /** The machine code of the refusing lane. */
  code: LlmLaneCode;
  /** The readable refusal the surfaces paint. */
  message: string;
  /** The http status the gateway answered (null when no answer arrived). */
  status: number | null;
}

/** @section origin — the family gateway seat */

/** The route the family gateway serves the chat completions on (the
 * openai-compatible lane every family app speaks — the same route
 * getry's own curl law documents). */
const CHAT_ROUTE = "/v1/chat/completions";

/** The default call window of the ai lane — the composition window is
 * wider than the ingest lanes (the model thinks; the ingest meters read
 * fast polls). */
export const LLM_CALL_TIMEOUT_MS = 60_000;

/** The default family model the lane asks for (the meta model name the
 * gateway resolves to the active provider of the deploy — the caller may
 * name any model the gateway's model route lists). */
export const LLM_DEFAULT_MODEL = "devthink";

/** Reads the family gateway origin of the deploy: the VITE_GETRY_URL law
 * (the same law VITE_DEBONAIR_URL rides on the getry side — the
 * build-time origin of the family seat). an absent or refused origin
 * answers null and the lane answers not-configured (the opt-in law). */
export function llmlaneorigin(): string | null {
  const raw = (import.meta as { env?: Record<string, string | undefined> }).env?.VITE_GETRY_URL ?? "";
  const origin = raw.trim();
  if (origin === "" || !hostallowed(origin)) return null;
  return origin;
}

/** @section the wire — the chat completion seat */

/** The options the ai composition rides.
 *
 * @param prompt the free-text prompt of the request (the user's words).
 * @param pinned the document at hand (optional, any subset of its
 * scalars — the instruction paragraph pins them so the model edits in
 * place).
 * @param model the model name to ask for (defaults to the family meta
 * model).
 * @param origin the gateway origin (defaults to the deploy's seat).
 * @param timeoutMs the call window (defaults to the lane's own).
 * @param deps the injected seams (the fetch double of the tests, the
 * window override).
 */
export interface ComposeWithLlmOptions {
  prompt: string;
  pinned?: Partial<PatternProject>;
  model?: string;
  origin?: string;
  timeoutMs?: number;
  deps?: IngestClientDeps;
}

/** The ai composition answer — the parsed pattern document beside the
 * facts of the seat that answered (the model name and the origin, the
 * surfaces paint them beside the plan). */
export interface LlmPlan {
  plan: PatternProject;
  model: string;
  origin: string;
}

/** The typed result of the ai composition — the plan or the honest
 * refusal. */
export type LlmPlanResult = { ok: true; data: LlmPlan } | { ok: false; error: LlmLaneError };

/** The shape the openai-compatible lane answers: the choices array with
 * the message content the pattern parser reads (the guard is the lane's
 * own — a foreign shape answers bad-response, never a throw). */
interface ChatCompletionShape {
  choices: ReadonlyArray<{ message?: { content?: unknown } }>;
}

/** Guards the chat completion body onto the wire shape (null answers the
 * bad-response refusal). */
const guardchat = (parsed: unknown): ChatCompletionShape | null => {
  if (typeof parsed !== "object" || parsed === null) return null;
  const choices = (parsed as { choices?: unknown }).choices;
  if (!Array.isArray(choices) || choices.length === 0) return null;
  for (const choice of choices) {
    if (typeof choice !== "object" || choice === null) return null;
    const content = (choice as { message?: { content?: unknown } }).message?.content;
    if (typeof content !== "string") return null;
  }
  return parsed as ChatCompletionShape;
};

/** Composes one pattern plan through the family ai gateway: the
 * instruction paragraph (patternPromptHint — every token from the enum
 * tables, the pinned scalars riding in place) and the free-text prompt
 * walk the chat completions route, the model answer parses through
 * patternFromLlm (the same validator the file lane rides — the honest
 * clamps, the machine codes) and the parsed plan answers with the facts
 * of the seat. a model that answers no parsable pattern answers
 * bad-model — the honest refusal, never a silent fallback (the caller
 * owns the fallback, the lane owns the truth).
 *
 * @param options the composition options.
 * @returns the parsed plan with the seat facts, or the typed refusal.
 */
export async function composeWithLlm(options: ComposeWithLlmOptions): Promise<LlmPlanResult> {
  const prompt = options.prompt.trim();
  if (prompt === "") {
    return { ok: false, error: { code: "bad-request", message: "the prompt is empty", status: null } };
  }
  const origin = options.origin?.trim() || llmlaneorigin();
  if (origin === null || origin === "") {
    return {
      ok: false,
      error: {
        code: "offline",
        message: "the family gateway origin is not configured (the VITE_GETRY_URL law)",
        status: null,
      },
    };
  }
  const model = options.model?.trim() || LLM_DEFAULT_MODEL;
  const instruction = patternPromptHint(options.pinned);
  const wire = await gatewaylane<ChatCompletionShape>(
    origin,
    "POST",
    CHAT_ROUTE,
    {
      model,
      stream: false,
      messages: [
        { role: "system", content: instruction },
        { role: "user", content: prompt },
      ],
    },
    options.timeoutMs ?? LLM_CALL_TIMEOUT_MS,
    guardchat,
    options.deps,
  );
  if (!wire.ok) return { ok: false, error: wire.error as LlmLaneError };
  const content = wire.data.choices[0]?.message?.content ?? "";
  const parsed = patternFromLlm(content);
  if (!parsed.ok) {
    return {
      ok: false,
      error: {
        code: "bad-model",
        message: `the model answer failed the pattern law (${parsed.code}): ${parsed.message}`,
        status: null,
      },
    };
  }
  return { ok: true, data: { plan: parsed.doc, model, origin } };
}
