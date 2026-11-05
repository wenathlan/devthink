/**
 * thinking.ts — the registerable thinking ladder of getry (root layer).
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
