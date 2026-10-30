// # generateclient — the typed client of the generation lane (root layer,
// waves PV4.003 + PV4.004 + PV4.005 + PV6.001): the browser-side and the
// automation seat that speaks the render and the tracks routes the
// gateway table serves — the plan queue that starts the server render,
// the job poll the generate page's meter reads, the publish that moves
// the rendered track row onto the vitrine, the vitrine list the
// streaming shelf reads, and the wav download the take rows answer —
// beside the generate lane's own seats the automation rides (the
// profile mine, the vitrine profile list, the profile read and the
// generate-spelled render/publish/vitrine calls the mcplane agent
// speaks). every call answers a typed result, never a throw: the machine
// codes are offline (the host law refused the origin, or the network
// never answered), timeout (the call kept silent past its window),
// refused (the gateway answered a status outside the 2xx lane beyond
// the 400 law), bad-response (the gateway answered 2xx but the body
// failed the shape guard) and bad-request (the gateway refused the
// caller's facts with a 400). the https law is the house one: the origin
// passes hostallowed before any call leaves the host (https only, public
// hosts only — the same law onboardingstate carries), every call rides
// an abort window, and the fetch seam is injected (the tests hand
// doubles, the browser hands the default). the render job poll walks the
// two spellings of the same lane (the render route first, the generate
// lane's path as the fallback — one walk, two vocabularies, exactly the
// merged route table). the wire types ride the gateway's own projections
// (RenderJobValue, VitrineTrackValue, VitrineValue, GatewayProfileRow —
// imported, never re-typed) and the profile document answers through
// the pattern miner's own validator (validateGenreProfile — a foreign
// profile never reaches the composer). beside the http seats the module
// owns the pure composition lane the generate page rides: the reference
// fold (the documents the session holds feed the miner's own profile
// builder — the same grouping law the miner lane rides, the genre
// matrix's matcher over the document name), the composer over the
// profile (the seeded plan, the fresh-take salt law), and the opt-in
// vocal lane (singPattern — the plan with voice differs from without,
// never blocking the wave).
// zero dependencies, zero consumer data.

import { mintid } from "./bigintids.ts";
import { type BlobResult, blobidvalid, gatewayblobstore } from "./blobstore.ts";
import { composeSimilar } from "./composer.ts";
import type { GatewayProfileRow, RenderJobValue, VitrineTrackValue, VitrineValue } from "./gatewayapi.ts";
import { matchGenre } from "./genrematrix.ts";
import { gatewaylane, INGEST_CALL_TIMEOUT_MS, type IngestClientDeps, type IngestClientResult } from "./ingestclient.ts";
import { hostallowed } from "./onboardingstate.ts";
import type { PatternProject } from "./patternenums.ts";
import { serializePattern, validatePatternProject } from "./patternenums.ts";
import type { GenreProfile, IngestDocumentWithId } from "./patternminer.ts";
import { mineGenre, PROFILE_GENRE_KEYS, ProfileError, validateGenreProfile } from "./patternminer.ts";
import type { RenderTrackRow } from "./renderworker.ts";
import { singPattern } from "./vocalsynth.ts";

/** @section codes — the typed failure branch */

/** The machine codes the client answers — one per lane, never a throw. */
export type GenerateClientCode = "offline" | "timeout" | "refused" | "bad-response" | "bad-request";

/** One typed client failure — the code, the readable message and the http
 * status the gateway answered (null when no answer arrived). */
export interface GenerateClientError {
  /** The machine code of the refusing lane. */
  code: GenerateClientCode;
  /** The readable message (the gateway's own message rides when it sent one). */
  message: string;
  /** The http status of the refusal (null on offline and timeout). */
  status: number | null;
}

/** The typed result every client call answers. */
export type GenerateClientResult<T> = { ok: true; data: T } | { ok: false; error: GenerateClientError };

/** The failure branch builder. */
function fail(
  code: GenerateClientCode,
  message: string,
  status: number | null = null,
): { ok: false; error: GenerateClientError } {
  return { ok: false, error: { code, message, status } };
}

/** @section seams — the injected dependencies */

/** The seams one call rides (the ingestclient discipline: the tests inject
 * doubles, the browser hands the defaults; the abort window is injectable
 * so the timeout lane tests in milliseconds). */
export interface GenerateClientDeps {
  /** The fetch implementation (defaults to globalThis.fetch). */
  fetchImpl?: typeof fetch;
  /** The abort window in ms (defaults to the call lane's own window). */
  timeoutMs?: number;
}

/** The abort window of the generate call lanes (the onboardingstate law —
 * a slow gateway must never hang a page). */
export const GENERATE_CALL_TIMEOUT_MS = 2500;

/** The abort window of the render queue post — the plan json is a small
 * body, but the gateway's contract gate runs before the answer and a
 * busy queue deserves the wider window the upload lane rides. */
export const GENERATE_RENDER_TIMEOUT_MS = 30_000;

/** The readable message of any thrown failure. */
function errmsg(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** @section lane — the one call every http seat rides */

/**
 * One gateway call under the house https law: the origin passes
 * hostallowed before any byte leaves the host (a refusal answers offline
 * and never fetches), the abort window guards the wait (a silent gateway
 * answers timeout), the non-2xx answers translate by status (400 the
 * bad-request lane, the rest refused, the gateway's own message riding
 * when it sent one), and a 2xx body that fails the shape guard answers
 * bad-response. never a throw.
 *
 * @param origin the gateway origin (https, a public host).
 * @param method the http method.
 * @param path the route path.
 * @param body the json body (undefined rides a bodyless call).
 * @param timeoutMs the abort window.
 * @param validate the shape guard (null answers bad-response).
 * @param deps the injected seams.
 * @returns the typed result.
 */
async function lane<T>(
  origin: string,
  method: string,
  path: string,
  body: unknown | undefined,
  timeoutMs: number,
  validate: (parsed: unknown) => T | null,
  deps: GenerateClientDeps = {},
): Promise<GenerateClientResult<T>> {
  if (!hostallowed(origin)) {
    return fail("offline", `the origin ${JSON.stringify(origin)} refuses the house https law`);
  }
  const fetchImpl = deps.fetchImpl ?? globalThis.fetch;
  if (typeof fetchImpl !== "function") {
    return fail("offline", "no fetch seam on this host");
  }
  const waitMs = deps.timeoutMs ?? timeoutMs;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), waitMs);
  // the abort gate: the signal rides the fetch call, and the race rides
  // the signal — a fetch seam that ignores the abort (the hanging doubles
  // and the hostile gateways) still answers the typed timeout inside the
  // window. the gate's rejection is pre-observed so a losing race never
  // surfaces as an unhandled refusal.
  const gate = new Promise<never>((_, reject) => {
    controller.signal.addEventListener(
      "abort",
      () => reject(new DOMException(`the call kept silent past ${waitMs} ms`, "AbortError")),
      { once: true },
    );
  });
  gate.catch(() => undefined);
  let response: Response;
  try {
    response = await Promise.race([
      fetchImpl(`${origin}${path}`, {
        method,
        headers: body === undefined ? undefined : { "content-type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      }),
      gate,
    ]);
  } catch (error) {
    const aborted = error instanceof DOMException && error.name === "AbortError";
    return aborted
      ? fail("timeout", `the gateway kept silent past ${waitMs} ms`)
      : fail("offline", `the gateway is unreachable: ${errmsg(error)}`);
  } finally {
    clearTimeout(timer);
  }
  if (!response.ok) {
    const wire = await response
      .json()
      .then((parsed) => (parsed as { error?: { message?: unknown } })?.error)
      .catch(() => null);
    const message =
      wire && typeof wire.message === "string" && wire.message.length > 0
        ? wire.message
        : `the gateway answered ${response.status}`;
    if (response.status === 400) return fail("bad-request", message, 400);
    return fail("refused", message, response.status);
  }
  let parsed: unknown;
  try {
    parsed = await response.json();
  } catch (error) {
    return fail("bad-response", `the gateway answered no json: ${errmsg(error)}`, response.status);
  }
  const guarded = validate(parsed);
  if (guarded === null) {
    return fail("bad-response", "the gateway answered a foreign shape", response.status);
  }
  return { ok: true, data: guarded };
}

/** @section guards — the wire shape validators */

/** The render walk states the wire carries. */
const RENDER_STATES: readonly string[] = ["queued", "rendering", "done", "failed"];

/** The row kinds the vitrine list carries. */
const VITRINE_KINDS: readonly string[] = ["render", "reference"];

/**
 * Guards one render job row — the walk the generate page polls: the
 * state off the enum, the fraction outside 0..1 or a missing pointer
 * answers null (the track pointer may be absent — the generate lane's
 * own spelling of the row carries no trackPointer, the guard accepts
 * the missing key and refuses only a foreign value).
 *
 * @param parsed the json the route answered.
 * @returns the job row, or null when the shape is foreign.
 */
function renderjobvalid(parsed: unknown): RenderJobValue | null {
  if (typeof parsed !== "object" || parsed === null) return null;
  const row = parsed as Record<string, unknown>;
  if (typeof row.id !== "string" || row.id.length === 0) return null;
  if (typeof row.ownerId !== "string" || row.ownerId.length === 0) return null;
  if (typeof row.state !== "string" || !RENDER_STATES.includes(row.state)) return null;
  if (typeof row.fraction !== "number" || !Number.isFinite(row.fraction) || row.fraction < 0 || row.fraction > 1)
    return null;
  if (row.phase !== null && typeof row.phase !== "string") return null;
  if (row.error !== null && typeof row.error !== "string") return null;
  if (row.wavPointer !== null && typeof row.wavPointer !== "string") return null;
  if (row.trackPointer !== null && row.trackPointer !== undefined && typeof row.trackPointer !== "string") return null;
  if (typeof row.createdAt !== "string") return null;
  if (row.finishedAt !== null && typeof row.finishedAt !== "string") return null;
  return parsed as RenderJobValue;
}

/**
 * Guards one vitrine row — the streaming shelf's own shape (the kind off
 * the enum, the seconds or the pointers missing answers null).
 *
 * @param parsed the json the list carried.
 * @returns the vitrine row, or null when the shape is foreign.
 */
function vitrinerowvalid(parsed: unknown): VitrineTrackValue | null {
  if (typeof parsed !== "object" || parsed === null) return null;
  const row = parsed as Record<string, unknown>;
  if (typeof row.kind !== "string" || !VITRINE_KINDS.includes(row.kind)) return null;
  if (typeof row.id !== "string" || row.id.length === 0) return null;
  if (typeof row.name !== "string" || row.name.length === 0) return null;
  if (typeof row.genre !== "string") return null;
  if (typeof row.seconds !== "number" || !Number.isFinite(row.seconds) || row.seconds < 0) return null;
  if (typeof row.status !== "string") return null;
  if (typeof row.wavPointer !== "string" || row.wavPointer.length === 0) return null;
  if (typeof row.ownerId !== "string" || row.ownerId.length === 0) return null;
  if (typeof row.publishedAt !== "string") return null;
  return parsed as VitrineTrackValue;
}

/**
 * Guards one profile row — the row id, the genre key of the fifteen, the
 * audit chain and the profile document itself (the miner's own validator
 * answers the document, so a foreign profile never reaches the composer).
 *
 * @param parsed the json the route answered.
 * @returns the profile row, or null when the shape is foreign.
 */
function profilevalid(parsed: unknown): GatewayProfileRow | null {
  if (typeof parsed !== "object" || parsed === null) return null;
  const row = parsed as Record<string, unknown>;
  if (typeof row.id !== "number" || !Number.isInteger(row.id) || row.id < 0) return null;
  if (typeof row.genre !== "string" || !PROFILE_GENRE_KEYS.includes(row.genre)) return null;
  if (!Array.isArray(row.referenceIds) || row.referenceIds.some((id) => typeof id !== "string")) return null;
  if (typeof row.createdAt !== "string" || row.createdAt.length === 0) return null;
  const profile = validateGenreProfile(row.profile);
  if (!profile.ok || profile.doc.genre !== row.genre) return null;
  return {
    id: row.id,
    genre: row.genre,
    referenceIds: row.referenceIds,
    profile: profile.doc,
    createdAt: row.createdAt,
  };
}

/**
 * Guards one track row — the pointer chain the walk stamps (the owner
 * pointer and the wav address beside the display facts — the generate
 * lane's own row shape).
 *
 * @param parsed the json the route answered.
 * @returns the track row, or null when the shape is foreign.
 */
function trackvalid(parsed: unknown): RenderTrackRow | null {
  if (typeof parsed !== "object" || parsed === null) return null;
  const row = parsed as Record<string, unknown>;
  if (typeof row.id !== "string" || row.id.length === 0) return null;
  if (typeof row.ownerId !== "string" || row.ownerId.length === 0) return null;
  if (typeof row.name !== "string" || row.name.length === 0) return null;
  if (typeof row.genre !== "string") return null;
  if (typeof row.seconds !== "number" || !Number.isFinite(row.seconds)) return null;
  if (typeof row.status !== "string" || row.status.length === 0) return null;
  if (typeof row.wavPointer !== "string" || row.wavPointer.length === 0) return null;
  if (typeof row.createdAt !== "string") return null;
  return parsed as RenderTrackRow;
}

/**
 * Guards the vitrine surface of the generate lane — the published track
 * rows beside the freshest profile rows (a foreign row never blocks the
 * list, the valid rows ride and the guard skips the rest — the shelf
 * law).
 *
 * @param parsed the json the route answered.
 * @returns the vitrine value, or null when the shape is foreign.
 */
function vitrinevalid(parsed: unknown): VitrineValue | null {
  if (typeof parsed !== "object" || parsed === null) return null;
  const value = parsed as Record<string, unknown>;
  if (!Array.isArray(value.tracks) || !Array.isArray(value.profiles)) return null;
  const tracks: RenderTrackRow[] = [];
  for (const entry of value.tracks) {
    const guarded = trackvalid(entry);
    if (guarded !== null) tracks.push(guarded);
  }
  const profiles: GatewayProfileRow[] = [];
  for (const entry of value.profiles) {
    const guarded = profilevalid(entry);
    if (guarded !== null) profiles.push(guarded);
  }
  return { tracks, profiles };
}

/** The job id guard the queue seats share (both spellings answer the
 * same mint shape). */
function jobidvalid(parsed: unknown): { jobId: string } | null {
  if (typeof parsed !== "object" || parsed === null) return null;
  const jobId = (parsed as Record<string, unknown>).jobId;
  return typeof jobId === "string" && jobId.length > 0 ? { jobId } : null;
}

/** @section compose — the pure lane the page rides */

/** One reference the fold reads — the documents the session holds (the
 * ingest records the bench or the gateway shelf answered), each with the
 * id the profile's audit chain rides. */
export interface GenerateReference {
  /** The row id (the gateway's or the mirror's). */
  id: string;
  /** The document name (the genre grouping law's honest carrier). */
  name: string;
  /** The parametrized document (schema debonair.ingest/1). */
  document: unknown;
}

/** The composition the generate flow answers: the plan (the render
 * candidate), the audit chain and the voice verdict. */
export interface GenerateComposition {
  /** The composed plan — sung when the voice key rode (validatePatternProject ok). */
  plan: PatternProject;
  /** The genre key of the profile the fold answered. */
  profileGenre: string;
  /** The count of the references that fed the profile. */
  referenceCount: number;
  /** The cosine of the plan against the profile centroid. */
  similarity: number;
  /** True while the similarity clears the composer's floor. */
  nearCentroid: boolean;
  /** The prompt pins that moved the answer away from the profile's own. */
  forced: readonly string[];
  /** True when the voice key rode and the sung notes landed in the plan. */
  sung: boolean;
}

/** The fold's typed refusals: no document of the genre answers the fold
 * (the honest error — never a zero profile), or the composer refused the
 * prompt (the machine code rides the message). */
export type GenerateComposeCode = "no-references" | "compose-failed";

/** The typed composition answer — the composition, or the refusal. */
export type GenerateComposeResult =
  | { ok: true; composition: GenerateComposition }
  | { ok: false; code: GenerateComposeCode; message: string };

/**
 * Folds the references of one genre into the miner's own profile — the
 * grouping law the miner lane rides: the documents carry no genre
 * column, the name is the honest carrier and matchGenre (the same seat
 * the composer's prompt rides) decides which corpus feeds the profile.
 *
 * @param references the references the session holds.
 * @param genre the genre key of the fifteen.
 * @returns the profile, or null when no reference answers the genre.
 */
function profileOfGenre(references: readonly GenerateReference[], genre: string): GenreProfile | null {
  const ofGenre = references.filter((reference) => matchGenre(reference.name)?.id === genre);
  if (ofGenre.length === 0) return null;
  const documents: IngestDocumentWithId[] = ofGenre.map((reference) => ({
    ...(reference.document as IngestDocumentWithId),
    id: reference.id,
  }));
  try {
    return mineGenre(documents, genre);
  } catch (error) {
    // the miner's own honest refusals (the empty set folded above) never
    // reach the caller as a throw — the fold answers no profile
    if (error instanceof ProfileError) return null;
    throw error;
  }
}

/**
 * Composes the take — the pure lane the generate page rides: the
 * references of the genre fold into the profile (the miner's own
 * builder), the composer answers the seeded plan (the salt law — ""
 * answers the canonical take, a fresh salt a fresh take) with the audit
 * chain, and the opt-in voice key sings the plan (singPattern — the
 * pattern-level first rung: the plan with voice differs from without).
 * never a throw: a genre with no references answers no-references (the
 * honest error — the composer never rides a zero profile), a composer
 * refusal answers compose-failed with the machine code riding the
 * message.
 *
 * @param input the composition facts.
 * @returns the composition, or the typed refusal.
 */
export function composeTake(input: {
  /** The free-text prompt (the composer's law). */
  prompt: string;
  /** The fresh-take salt ("" answers the canonical take). */
  salt: string;
  /** The pinned genre key (the chip), or undefined to let the prompt decide. */
  genreId?: string;
  /** The opt-in voice key — never blocking. */
  voice: boolean;
  /** The references the session holds (the fold's corpus). */
  references: readonly GenerateReference[];
}): GenerateComposeResult {
  const genre = input.genreId ?? matchGenre(input.prompt)?.id;
  if (genre === undefined) {
    return {
      ok: false,
      code: "no-references",
      message: "the prompt names no genre the matrix owns — pin a chip or name a genre",
    };
  }
  const profile = profileOfGenre(input.references, genre);
  if (profile === null) {
    return {
      ok: false,
      code: "no-references",
      message: `no reference of the genre "${genre}" answers the fold — ingest one on the bench`,
    };
  }
  const ofGenre = input.references.filter((reference) => matchGenre(reference.name)?.id === genre);
  try {
    const report = composeSimilar(
      input.prompt,
      profile,
      ofGenre.map((reference) => ({ ...(reference.document as IngestDocumentWithId), id: reference.id })),
      input.salt,
    );
    const plan = input.voice
      ? singPattern(report.plan, `${input.prompt.trim().toLowerCase()}:${input.salt}`)
      : report.plan;
    return {
      ok: true,
      composition: {
        plan,
        profileGenre: profile.genre,
        referenceCount: ofGenre.length,
        similarity: report.similarity,
        nearCentroid: report.nearCentroid,
        forced: report.forced,
        sung: input.voice && plan !== report.plan,
      },
    };
  } catch (error) {
    return {
      ok: false,
      code: "compose-failed",
      message: error instanceof Error ? error.message : "the composer refused this prompt",
    };
  }
}

/** @section automation — the generate lane seats (the automation vocabulary) */

/**
 * POST /api/v1/profiles/mine — queues one miner job: the genre key of the
 * fifteen and the owner pointer register the queued row on the shared
 * ingest_jobs ledger; the walk lands through pollJob (the ingest client's
 * own seat — the ledgers share the nine columns).
 *
 * @param genre the genre key to profile.
 * @param ownerId the owner pointer the row stamps.
 * @param origin the gateway origin (https, a public host).
 * @param deps the injected seams.
 * @returns the job id, or the typed err of the refusing lane.
 */
export function mineProfile(
  genre: string,
  ownerId: string,
  origin: string,
  deps: IngestClientDeps = {},
): Promise<IngestClientResult<{ jobId: string }>> {
  return gatewaylane(
    origin,
    "POST",
    "/api/v1/profiles/mine",
    { genre, ownerId },
    INGEST_CALL_TIMEOUT_MS,
    jobidvalid,
    deps,
  );
}

/**
 * GET /api/v1/profiles — the vitrine rows: the freshest profile row per
 * genre (a retrain lands a fresh row, the vitrine shows the freshest).
 *
 * @param origin the gateway origin.
 * @param deps the injected seams.
 * @returns the freshest profile rows, or the typed err of the refusing lane.
 */
export function fetchProfiles(
  origin: string,
  deps: IngestClientDeps = {},
): Promise<IngestClientResult<GatewayProfileRow[]>> {
  return gatewaylane(
    origin,
    "GET",
    "/api/v1/profiles",
    undefined,
    INGEST_CALL_TIMEOUT_MS,
    (parsed) => {
      if (typeof parsed !== "object" || parsed === null) return null;
      const records = (parsed as Record<string, unknown>).records;
      if (!Array.isArray(records)) return null;
      const rows: GatewayProfileRow[] = [];
      for (const record of records) {
        const guarded = profilevalid(record);
        if (guarded !== null) rows.push(guarded);
      }
      return rows;
    },
    deps,
  );
}

/**
 * GET /api/v1/profiles/:genre — the freshest profile row of one genre
 * (the document the composer reads — a genre with no row yet answers
 * not-found through the refused lane).
 *
 * @param genre the genre key of the fifteen.
 * @param origin the gateway origin.
 * @param deps the injected seams.
 * @returns the profile row, or the typed err of the refusing lane.
 */
export function fetchProfile(
  genre: string,
  origin: string,
  deps: IngestClientDeps = {},
): Promise<IngestClientResult<GatewayProfileRow>> {
  return gatewaylane(
    origin,
    "GET",
    `/api/v1/profiles/${encodeURIComponent(genre)}`,
    undefined,
    INGEST_CALL_TIMEOUT_MS,
    profilevalid,
    deps,
  );
}

/**
 * GET /api/v1/vitrine — the generate lane's public surface under the
 * visibility law: the published track rows beside the freshest genre
 * profiles; the owner's own rows ride beside them when the ownerId query
 * carries their pointer (the owner reads the track ids the render walk
 * stamped).
 *
 * @param origin the gateway origin.
 * @param ownerId the owner pointer the own rows ride for (optional).
 * @param deps the injected seams.
 * @returns the vitrine surface, or the typed err of the refusing lane.
 */
export function listVitrine(
  origin: string,
  ownerId?: string,
  deps: IngestClientDeps = {},
): Promise<IngestClientResult<VitrineValue>> {
  const query = ownerId === undefined ? "" : `?ownerId=${encodeURIComponent(ownerId)}`;
  return gatewaylane(origin, "GET", `/api/v1/vitrine${query}`, undefined, INGEST_CALL_TIMEOUT_MS, vitrinevalid, deps);
}

/** @section calls — the http seats of the lane */

/**
 * POST /api/v1/generate/render — the automation seat (the mcplane agent,
 * the getry lane): the pattern plan (a debonair.pattern/1 project) rides
 * the json lane as an object, the gateway validates the contract,
 * serializes the canonical form and registers the queued render_jobs row.
 * The run itself starts through the gateway worker loop — the walk lands
 * through pollRenderJob.
 *
 * POST /api/v1/render — the browser seat (the generate page): the
 * composed plan rides the body as the canonical pattern json
 * (serializePattern — the same bytes the ledger stores; a plan that
 * refuses its serialization answers the typed bad-request, never a
 * throw), the gateway's contract gate parses it and the mint answers the
 * job id. The run itself starts through the gateway worker loop
 * (startRenderLaneJob) — the walk lands through pollRenderJob.
 *
 * @param plan the composed pattern project (the automation spelling).
 * @param ownerId the owner pointer the row stamps (the automation spelling).
 * @param origin the gateway origin (the automation spelling).
 * @param deps the injected seams (either spelling).
 * @returns the job id, or the typed err of the refusing lane.
 */
export function queueRender(
  plan: PatternProject,
  ownerId: string,
  origin: string,
  deps?: IngestClientDeps,
): Promise<IngestClientResult<{ jobId: string }>>;
export function queueRender(
  input: { plan: PatternProject; ownerId: string; origin: string },
  deps?: GenerateClientDeps,
): Promise<GenerateClientResult<{ jobId: string }>>;
export function queueRender(
  planOrInput: PatternProject | { plan: PatternProject; ownerId: string; origin: string },
  ownerIdOrDeps?: string | GenerateClientDeps,
  origin?: string,
  deps?: IngestClientDeps,
): Promise<IngestClientResult<{ jobId: string }> | GenerateClientResult<{ jobId: string }>> {
  if (typeof ownerIdOrDeps === "string" && typeof planOrInput === "object" && origin !== undefined) {
    // the automation seat — the generate spelling
    const plan = planOrInput;
    const checked = validatePatternProject(plan);
    if (!checked.ok) {
      return Promise.resolve({
        ok: false,
        error: {
          code: "bad-request",
          message: `the plan failed the pattern contract (${checked.code}): ${checked.message}`,
          status: null,
        },
      });
    }
    return gatewaylane(
      origin,
      "POST",
      "/api/v1/generate/render",
      { ownerId: ownerIdOrDeps, plan },
      INGEST_CALL_TIMEOUT_MS,
      jobidvalid,
      deps,
    );
  }
  // the browser seat — the render spelling
  const input = planOrInput as { plan: PatternProject; ownerId: string; origin: string };
  let serialize: string;
  try {
    serialize = serializePattern(input.plan);
  } catch (error) {
    return Promise.resolve(fail("bad-request", `the plan refused its canonical serialization: ${errmsg(error)}`));
  }
  return lane(
    input.origin,
    "POST",
    "/api/v1/render",
    { plan: serialize, ownerId: input.ownerId },
    GENERATE_RENDER_TIMEOUT_MS,
    jobidvalid,
    (ownerIdOrDeps as GenerateClientDeps | undefined) ?? {},
  );
}

/**
 * GET /api/v1/render/jobs/:id (and the generate lane's own spelling
 * GET /api/v1/generate/jobs/:id) — the render job row the generate page
 * and the automation seats poll: the walk state, the last completed
 * phase, the ascending fraction, the honest failure, the landed wav and
 * track pointers, the instants. The poll walks the two spellings of the
 * one lane — the render route first, and when that path answers nothing
 * (the 404 of a deploy that speaks only the generate vocabulary) the
 * generate spelling rides; a walk that answers on either path is the
 * same walk (the merged route table serves both).
 *
 * @param jobId the queued job the post answered.
 * @param origin the gateway origin.
 * @param deps the injected seams.
 * @returns the job row, or the typed err of the refusing lane.
 */
export async function pollRenderJob(
  jobId: string,
  origin: string,
  deps: GenerateClientDeps & IngestClientDeps = {},
): Promise<GenerateClientResult<RenderJobValue>> {
  const first = await lane(
    origin,
    "GET",
    `/api/v1/render/jobs/${encodeURIComponent(jobId)}`,
    undefined,
    GENERATE_CALL_TIMEOUT_MS,
    renderjobvalid,
    deps,
  );
  if (first.ok) return first;
  if (first.error.code === "refused" && first.error.status === 404) {
    const second = await gatewaylane(
      origin,
      "GET",
      `/api/v1/generate/jobs/${encodeURIComponent(jobId)}`,
      undefined,
      INGEST_CALL_TIMEOUT_MS,
      renderjobvalid,
      deps,
    );
    if (second.ok) return second;
    if (second.error.code === "refused" && second.error.status === 404) {
      // both spellings answer nothing — the honest refusal is the
      // canonical route's own
      return first;
    }
    return second;
  }
  return first;
}

/**
 * POST /api/v1/tracks/:id/publish — the automation seat: flips one track
 * row onto the vitrine under the owner law (the owner pointer must match
 * the row's own — a foreign pointer answers the refused lane, never
 * someone else's shelf).
 *
 * POST /api/v1/tracks — the browser seat (the generate page): the
 * publish lane, the owner's move that puts the rendered track row onto
 * the vitrine (the caller's owner pointer must match the row's owner —
 * the private stays private).
 *
 * @param trackId the track row id (the automation spelling).
 * @param ownerId the owner pointer the row carries (the automation spelling).
 * @param origin the gateway origin (the automation spelling).
 * @param deps the injected seams (either spelling).
 * @returns the published row, or the typed err of the refusing lane.
 */
export function publishTrack(
  trackId: string,
  ownerId: string,
  origin: string,
  deps?: IngestClientDeps,
): Promise<IngestClientResult<RenderTrackRow>>;
export function publishTrack(
  input: { trackId: string; ownerId: string; origin: string },
  deps?: GenerateClientDeps,
): Promise<GenerateClientResult<VitrineTrackValue>>;
export function publishTrack(
  trackIdOrInput: string | { trackId: string; ownerId: string; origin: string },
  ownerIdOrDeps?: string | GenerateClientDeps,
  origin?: string,
  deps?: IngestClientDeps,
): Promise<IngestClientResult<RenderTrackRow> | GenerateClientResult<VitrineTrackValue>> {
  if (typeof trackIdOrInput === "string" && typeof ownerIdOrDeps === "string" && origin !== undefined) {
    // the automation seat — the generate spelling
    return gatewaylane(
      origin,
      "POST",
      `/api/v1/tracks/${encodeURIComponent(trackIdOrInput)}/publish`,
      { ownerId: ownerIdOrDeps },
      INGEST_CALL_TIMEOUT_MS,
      trackvalid,
      deps,
    );
  }
  // the browser seat — the render spelling
  const input = trackIdOrInput as { trackId: string; ownerId: string; origin: string };
  return lane(
    input.origin,
    "POST",
    "/api/v1/tracks",
    { trackId: input.trackId, ownerId: input.ownerId },
    GENERATE_CALL_TIMEOUT_MS,
    vitrinerowvalid,
    (ownerIdOrDeps as GenerateClientDeps | undefined) ?? {},
  );
}

/**
 * GET /api/v1/tracks — the vitrine list, the streaming shelf: the
 * published generated takes beside the ingested references, one grammar.
 * A foreign row never blocks the shelf (the valid rows ride, the guard
 * skips the rest).
 *
 * @param origin the gateway origin.
 * @param deps the injected seams.
 * @returns the vitrine rows, or the typed err of the refusing lane.
 */
export async function fetchVitrine(
  origin: string,
  deps: GenerateClientDeps = {},
): Promise<GenerateClientResult<VitrineTrackValue[]>> {
  return lane(
    origin,
    "GET",
    "/api/v1/tracks",
    undefined,
    GENERATE_CALL_TIMEOUT_MS,
    (parsed) => {
      if (typeof parsed !== "object" || parsed === null) return null;
      const records = (parsed as Record<string, unknown>).records;
      if (!Array.isArray(records)) return null;
      const rows: VitrineTrackValue[] = [];
      for (const record of records) {
        const guarded = vitrinerowvalid(record);
        if (guarded !== null) rows.push(guarded);
      }
      return rows;
    },
    deps,
  );
}

/** The wav bytes the download lane answers — the store's own pointer
 * riding along (the digest and the byte count the row meta shows). */
export interface GenerateWavBytes {
  /** The wav bytes. */
  bytes: Uint8Array;
  /** The bare mime the store declared ("audio/wav"). */
  mime: string;
  /** The byte count. */
  byteCount: number;
  /** The store-computed sha256 hex digest. */
  sha256: string;
}

/**
 * Fetches the wav bytes of one rendered take — the download lane: the
 * blob store's own gateway backend rides GET /api/v1/blob/:id under the
 * house https law (the same lane the playback resolution reads), the
 * store answering the bytes with the pointer's mime and digest. never a
 * throw; a hostile store maps to the offline code.
 *
 * @param input the wav pointer and the gateway origin.
 * @returns the bytes, or the typed err of the refusing lane.
 */
export async function fetchTakeWav(input: {
  blobId: string;
  origin: string;
}): Promise<GenerateClientResult<GenerateWavBytes>> {
  if (!blobidvalid(input.blobId)) {
    return fail("bad-request", `the wav pointer "${input.blobId}" is not a minted decimal`);
  }
  if (!hostallowed(input.origin)) {
    return fail("offline", `the origin ${JSON.stringify(input.origin)} refuses the house https law`);
  }
  let got: BlobResult;
  try {
    got = await gatewayblobstore(input.origin).get(input.blobId);
  } catch (error) {
    return fail("offline", `the blob lane is unreachable: ${errmsg(error)}`);
  }
  if (!got.ok) return fail("refused", `${got.code}: ${got.message}`, got.status);
  if (got.data === null) return fail("refused", `the blob ${input.blobId} answered no bytes`);
  return {
    ok: true,
    data: { bytes: got.data, mime: got.pointer.kind, byteCount: got.pointer.bytes, sha256: got.pointer.sha256 },
  };
}

/** @section identity — the owner seat and the origin */

/** The localStorage key of the owner identity (the onboardingstate seat
 * law: the db rows are keyed by the stamp, the cache survives reloads —
 * the same key every client of the gateway lane rides, one browser one
 * stamp). */
const OWNER_KEY = "debonair.owner.id";

/** The session memory of the owner stamp (never re-mints within a session). */
let ownermemo: string | null = null;

/**
 * The owner identity seat — the stamp every render queue and every
 * publish carries: one minted decimal id per browser, generated once,
 * cached in localStorage (the onboardingstate visitor-seat law) and
 * mirrored in module memory for the session. a sealed storage keeps the
 * session stamp in memory only; a host without a window (the lanes the
 * tests drive) answers the process stamp.
 *
 * @returns the owner id in the minted decimal form.
 */
export function ownerid(): string {
  if (ownermemo !== null) return ownermemo;
  if (typeof window !== "undefined") {
    try {
      const stored = window.localStorage.getItem(OWNER_KEY);
      if (stored !== null && blobidvalid(stored)) {
        ownermemo = stored;
        return stored;
      }
    } catch {
      // storage sealed: the session mints below
    }
    const fresh = mintid();
    try {
      window.localStorage.setItem(OWNER_KEY, fresh);
    } catch {
      // the cache is best effort: the session memory holds the stamp
    }
    ownermemo = fresh;
    return fresh;
  }
  ownermemo ??= mintid();
  return ownermemo;
}

/** The configured gateway origin (the ingest store env law, read lazily
 * so the lane follows the deploy configuration at call time — never a
 * hardcoded domain). */
export function generateorigin(): string {
  const raw =
    typeof import.meta !== "undefined"
      ? ((import.meta.env?.VITE_DEBONAIR_URL as string | undefined) ?? undefined)
      : undefined;
  return (raw ?? "").trim().replace(/\/+$/, "");
}
