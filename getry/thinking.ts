/**
 * thinking.ts — the thinking seat of getry (root layer): the registerable
 * reasoning ladder plus the routing the rungs drive.
 *
 * the reasoning ladder the gateway accepts on every chat route: named
 * levels, each bound to the thinking budget the provider receives. the
 * ladder is registered, never fixed: the seven rungs below are the family
 * seed only — a registration (the GETRY_THINKING_LEVELS surface at boot,
 * or registerthinkinglevels from the host) replaces the whole ladder with
 * whatever the person registered: any count, any names, any budgets. no
 * ceiling lives in this engine — a plan that wants fewer rungs blocks in
 * the devthink system layer, never here.
 *
 * beside the ladder the seat owns the routing the level selects: the model
 * tier the rung targets (tier routing), the token budget clamped to the
 * model output ceiling, the two-calls pattern verdict, the ordered
 * fallback chain over the provider catalog, and the session/stream lanes a
 * thinking request rides. every routing function below is pure,
 * dependency-free math over structural rows — the gateway modules (engine,
 * gateway) and the family consumers (devthink and siblings) wire the real
 * catalog rows in, never a second copy of the math.
 *
 * the logicfold3 fold retired the thinkingtypes.ts mirror this seat once
 * carried (the declaration surface that repeated every export below as an
 * `export declare` tombstone — zero import sites repo-wide) — every
 * declaration it mirrored answers from this implementation alone.
 */

/** the name of one thinking level — the seven seed rungs stay literate for
 * completion, and any registered name rides beside them: the vocabulary is
 * what the person registers, never a closed union. */
export type ThinkingLevelName = (string & {}) | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | "max";

/** one rung of the reasoning ladder. */
export type ThinkingLevel = {
  level: ThinkingLevelName;
  budget: number;
  desc: string;
};

/** the family seed ladder — the seven rungs the self-hosted build answers
 * until a registration replaces them. the seed is a default, never a
 * ceiling: registerthinkinglevels accepts any count of rungs. */
export const THINKINGLEVELS: ThinkingLevel[] = [
  { level: "none", budget: 0, desc: "no thinking" },
  { level: "minimal", budget: 1400, desc: "quick reasoning" },
  { level: "low", budget: 5500, desc: "light reasoning" },
  { level: "medium", budget: 17000, desc: "balanced" },
  { level: "high", budget: 68000, desc: "deep reasoning default" },
  { level: "xhigh", budget: 68000, desc: "extra deep" },
  { level: "max", budget: 68000, desc: "maximum" },
];

/** the seed rung the gateway resolves when the request names none — the
 * registered default (GETRY_THINKING_DEFAULT or registerthinkinglevels)
 * overrides it at runtime through defaultthinkinglevel(). */
export const DEFAULTTHINKINGLEVEL: ThinkingLevelName = "high";

/** the registration surface: GETRY_THINKING_LEVELS — a JSON array of rung
 * objects ({"level","budget","desc"}) the person registers at boot; any
 * count rides. invalid json answers the family seed untouched. */
const LEVELS_ENV = "GETRY_THINKING_LEVELS";

/** the registration surface for the default rung: GETRY_THINKING_DEFAULT —
 * a level name that must name a rung of the registered ladder. */
const DEFAULT_ENV = "GETRY_THINKING_DEFAULT";

/** parses one registration payload into a ladder — the honest rungs only:
 * named, finite-budgeted, deduped (last wins). no count cap applies. */
function parseRegisteredLevels(raw: string): ThinkingLevel[] | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!Array.isArray(parsed) || parsed.length === 0) return null;
  const rungs = new Map<string, ThinkingLevel>();
  for (const entry of parsed) {
    if (typeof entry !== "object" || entry === null) continue;
    const { level, budget, desc } = entry as Record<string, unknown>;
    if (typeof level !== "string" || level.trim() === "") continue;
    const name = level.toLowerCase().trim();
    const tokens = typeof budget === "number" && Number.isFinite(budget) && budget >= 0 ? Math.floor(budget) : 0;
    rungs.set(name, {
      level: name,
      budget: tokens,
      desc: typeof desc === "string" && desc !== "" ? desc : `registered level ${name}`,
    });
  }
  return rungs.size === 0 ? null : [...rungs.values()];
}

/** the live ladder: the registered rungs, or the family seed when no
 * registration ever landed. resolved once at import from the environment
 * so the load-time budget maps capture the registered ladder too. */
let ladder: ThinkingLevel[] = parseRegisteredLevels(process.env[LEVELS_ENV] ?? "") ?? THINKINGLEVELS;

/** the live default rung: a registered default that names a real rung, or
 * the family seed default. */
let ladderDefault: ThinkingLevelName | null = (() => {
  const raw = process.env[DEFAULT_ENV];
  if (typeof raw !== "string" || raw.trim() === "") return null;
  const name = raw.toLowerCase().trim();
  return ladder.some((rung) => rung.level === name) ? name : null;
})();

/**
 * registers the thinking ladder — the owner's word is the law: any count of
 * rungs, any names, any budgets (no ceiling in this engine). the
 * registration replaces the whole ladder; pass the seed back to restore the
 * family default. invalid entries are skipped, duplicates keep the last
 * write, and an empty registration answers the seed untouched.
 *
 * @law levels depend on what the person registers — never a fixed 7
 * @param levels the rungs to register.
 * @param options the default rung of the registration (must name a rung).
 * @returns the live ladder after the registration.
 */
export function registerthinkinglevels(
  levels: readonly ThinkingLevel[],
  options?: { default?: ThinkingLevelName },
): ThinkingLevel[] {
  const rungs = parseRegisteredLevels(JSON.stringify(levels));
  if (rungs === null) return ladder;
  ladder = rungs;
  const wanted = options?.default;
  if (typeof wanted === "string" && wanted.trim() !== "" && islevel(wanted)) {
    ladderDefault = wanted.toLowerCase().trim();
  } else if (wanted === undefined) {
    ladderDefault = ladder.some((rung) => rung.level === DEFAULTTHINKINGLEVEL) ? DEFAULTTHINKINGLEVEL : null;
  }
  return ladder;
}

/**
 * lists the live ladder in serve order (the registration order, none first
 * when the seed rides).
 *
 * @returns the thinking levels the engine accepts right now.
 */
export function listlevels(): ThinkingLevel[] {
  return ladder;
}

/** the live default rung — the registered default or the family seed. */
export function defaultthinkinglevel(): ThinkingLevelName {
  return ladderDefault ?? DEFAULTTHINKINGLEVEL;
}

/**
 * resolves the budget of one named level against the live ladder.
 *
 * @param level the level name to resolve.
 * @returns the thinking budget in tokens — 0 when the rung never registered.
 */
export function budgetof(level: ThinkingLevelName): number {
  return ladder.find((rung) => rung.level === (typeof level === "string" ? level.toLowerCase().trim() : level))
    ?.budget ?? 0;
}

/**
 * checks whether a request value names a real rung of the live ladder.
 *
 * @param candidate the raw value from the request.
 * @returns true when the value is a registered level.
 */
export function islevel(candidate: string): candidate is ThinkingLevelName {
  const name = candidate.toLowerCase().trim();
  return ladder.some((rung) => rung.level === name);
}

/**
 * formats a budget the way the theme renders it (grouped thousands).
 *
 * @param budget the budget in tokens.
 * @returns the formatted label.
 */
export function formatbudget(budget: number): string {
  return budget.toLocaleString("en-US");
}

/* ===== block: tier routing ===== */

/** the model tier vocabulary the provider catalog rows carry (the
 * intelligencerank tier of the gateway types): 1 the flagship tier, 2 the
 * strong tier, 3 the mid tier, 4 the economy tier. */
export type thinkingmodeltier = 1 | 2 | 3 | 4;

/**
 * resolves the model tier one thinking level targets — the rung POSITION
 * on the live ladder selects the tier, never the name: the fraction of the
 * ladder the rung sits at walks the tiers bottom-up (at or below a quarter
 * the economy tier 4, at or below a half the mid tier 3, at or below three
 * quarters the strong tier 2, above it the flagship tier 1), so the family
 * seed routes none/minimal to 4, low/medium to 3, high to 2 and xhigh/max
 * to the flagship 1 — and a registered ladder of any length routes the same
 * way. a single-rung registration answers the ceiling the rung carries (a
 * zero-budget rung targets the economy tier, every other single rung the
 * flagship). a level that names no rung of the live ladder routes the
 * default rung's tier, the same honest fallback budgetof answers.
 *
 * @law the level selects the model tier — the tier ladder never hardcodes
 *      the seven seed names
 * @param level the level name to route.
 * @returns the model tier the level targets.
 */
export function targettier(level: ThinkingLevelName): thinkingmodeltier {
  const rungs = ladder;
  const named = typeof level === "string" ? level.toLowerCase().trim() : level;
  let index = rungs.findIndex((rung) => rung.level === named);
  if (index < 0) index = rungs.findIndex((rung) => rung.level === defaultthinkinglevel());
  if (index < 0) return 2;
  if (rungs.length <= 1) return rungs[index].budget === 0 ? 4 : 1;
  const fraction = index / (rungs.length - 1);
  if (fraction <= 0.25) return 4;
  if (fraction <= 0.5) return 3;
  if (fraction <= 0.75) return 2;
  return 1;
}

/* ===== block: token budgets ===== */

/** the two-calls threshold the family seed pins (98304 tokens — the glm
 * max output window the v1 lane rides); a config threshold always wins. */
export const TWOCALLSTHRESHOLD = 98304;

/**
 * clamps the budget of one level to a model's output ceiling — the gateway
 * never promises the provider more thinking tokens than the model can
 * answer with (the clamp discipline the bodybuild config names).
 *
 * @param level the level whose budget rides.
 * @param ceiling the model max output tokens (no clamp when absent).
 * @returns the budget in tokens, clamped down to the ceiling.
 */
export function clampbudget(level: ThinkingLevelName, ceiling?: number): number {
  const budget = budgetof(level);
  if (ceiling === undefined || !Number.isFinite(ceiling) || ceiling <= 0) return budget;
  return Math.min(budget, Math.floor(ceiling));
}

/**
 * decides whether a request rides the two-calls pattern (call 1 thinking
 * enabled, call 2 a fresh response when the guarantee rides): the pattern
 * fires when the thinking budget plus the response ceiling crosses the
 * threshold, or whenever the level thinks at all — the exact math the
 * engine's zai sdk lane always carried, lifted here so every consumer
 * answers the same verdict.
 *
 * @param level the thinking level of the request.
 * @param responsemax the response ceiling in tokens (max_tokens or the
 *        metamodel output window).
 * @param threshold the two-calls trigger threshold (the family default
 *        98304 when absent).
 * @param budget the effective thinking budget when a config map overrides
 *        the ladder (the live ladder answers when absent).
 * @returns true when the request rides the two-calls pattern.
 */
export function twocallspattern(input: {
  level: ThinkingLevelName;
  responsemax: number;
  threshold?: number;
  budget?: number;
}): boolean {
  const budget = input.budget ?? budgetof(input.level);
  const threshold = input.threshold ?? TWOCALLSTHRESHOLD;
  return budget + input.responsemax > threshold || input.level !== "none";
}

/* ===== block: fallback chains ===== */

/** one model row of the provider catalog the seat routes over — the
 * structural slice of the modeldef kind the gateway types own (id,
 * reasoning flag, output ceiling, leaderboard rank): the seat never
 * imports the gateway graph, so the rows ride as plain shapes. */
export type thinkingmodelrow = {
  id: string;
  reasoning?: boolean;
  maxoutput?: number;
  rank?: { score?: number; tier?: thinkingmodeltier };
};

/**
 * checks whether one catalog model can serve a thinking level: a model
 * that carries no reasoning flag counts as capable (the family convention
 * — an unknown capability answers true the way the engine's
 * supports_thinking projection does), a model that declares reasoning
 * false never carries a thinking budget.
 *
 * @param model the catalog row to check.
 * @param level the level the request rides.
 * @returns true when the model may serve the level.
 */
export function modelcapable(model: thinkingmodelrow, level: ThinkingLevelName): boolean {
  if (model.reasoning === false) return level === "none";
  return true;
}

/**
 * builds the ordered fallback chain of one provider's catalog for a level:
 * the capable models ordered by tier distance from the level's target
 * tier (exact tier first, adjacent tiers outward), then by whether the
 * output ceiling holds the full budget unclamped, then by leaderboard
 * score, then by id — a stable, honest order the caller walks top to
 * bottom on failure. unranked models ride after every ranked tier.
 *
 * @param models the provider catalog rows.
 * @param level the level the request rides.
 * @returns the ordered capable rows.
 */
export function fallbackchain(models: readonly thinkingmodelrow[], level: ThinkingLevelName): thinkingmodelrow[] {
  const target = targettier(level);
  const budget = budgetof(level);
  const capable = models.filter((model) => modelcapable(model, level));
  const distance = (model: thinkingmodelrow): number => {
    const tier = model.rank?.tier;
    if (tier === undefined) return Number.MAX_SAFE_INTEGER;
    return Math.abs(tier - target);
  };
  const fullfit = (model: thinkingmodelrow): boolean =>
    model.maxoutput === undefined || model.maxoutput >= budget;
  return capable.sort((left, right) => {
    const bydistance = distance(left) - distance(right);
    if (bydistance !== 0) return bydistance;
    const byfit = Number(fullfit(right)) - Number(fullfit(left));
    if (byfit !== 0) return byfit;
    const byscore = (right.rank?.score ?? -Infinity) - (left.rank?.score ?? -Infinity);
    if (byscore !== 0) return byscore;
    return left.id.localeCompare(right.id);
  });
}

/* ===== block: session and stream lanes ===== */

/** the lane a thinking request rides: "session" pins the per-session
 * rotation context (the rotation cursor and the thinking budget bind to
 * the (sessionid, provider) row the sessions store owns), "stream" rides
 * the sse emission contract (reasoning deltas before content, the parser
 * pattern the streaming routes follow). a request may ride both lanes at
 * once — a session-scoped stream. */
export type thinkinglane = "session" | "stream";

/**
 * resolves the lanes one thinking request rides, in bind order: the
 * session lane first (the rotation context binds before any byte leaves
 * the gateway), the stream lane second (the emission order of the
 * answer). a request that names neither lane rides no named lane — a
 * plain one-shot completion.
 *
 * @param input the request shape: stream true asks the sse contract,
 *        sessionid binds the session rotation context.
 * @returns the lanes in bind order (empty when the request is a plain
 *          one-shot completion).
 */
export function lanesof(input: { stream?: boolean; sessionid?: string | null }): thinkinglane[] {
  const lanes: thinkinglane[] = [];
  if (typeof input.sessionid === "string" && input.sessionid.trim() !== "") lanes.push("session");
  if (input.stream === true) lanes.push("stream");
  return lanes;
}

/* ===== block: provider catalog ===== */

/** one provider row of the catalog the seat routes over — the structural
 * slice of the gateway version rows (provider name, lifecycle badge, the
 * model catalog). */
export type thinkingproviderrow = {
  provider: string;
  badge?: "live" | "paused";
  models: readonly thinkingmodelrow[];
};

/**
 * lists the providers whose catalog serves a level (at least one capable
 * model), live providers first — a paused provider still serves the list
 * as a fallback seat the way the paused v2 lane falls back to v1, it just
 * never leads the chain.
 *
 * @param catalog the provider rows.
 * @param level the level the request rides.
 * @returns the serving providers, live first, input order stable within
 *          each badge group.
 */
export function providersserving(catalog: readonly thinkingproviderrow[], level: ThinkingLevelName): thinkingproviderrow[] {
  return catalog
    .filter((provider) => provider.models.some((model) => modelcapable(model, level)))
    .sort((left, right) => Number(left.badge !== "live") - Number(right.badge !== "live"));
}

/** one provider/model candidate of the cross-provider chain. */
export type thinkingcandidate = { provider: string; model: thinkingmodelrow };

/**
 * builds the cross-provider fallback chain for a level: every serving
 * provider in live-first order, each contributing its own ordered
 * fallbackchain — the single honest walk order a consumer retries through
 * on failure (the tier-exact candidate of the live providers first, the
 * paused providers' candidates last).
 *
 * @param catalog the provider rows.
 * @param level the level the request rides.
 * @returns the ordered provider/model candidates.
 */
export function providerchain(
  catalog: readonly thinkingproviderrow[],
  level: ThinkingLevelName,
): thinkingcandidate[] {
  const chain: thinkingcandidate[] = [];
  for (const provider of providersserving(catalog, level)) {
    for (const model of fallbackchain(provider.models, level)) {
      chain.push({ provider: provider.provider, model });
    }
  }
  return chain;
}
