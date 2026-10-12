/**
 * thinking.ts — the 7-level thinking system of getry (root layer).
 *
 * the reasoning ladder the gateway accepts on every chat route: seven
 * named levels, each bound to the thinking budget the provider receives.
 * the rows below are the in-memory ladder of the theme: the self-hosted
 * gateway resolves the budgets on the live routes, and the static build
 * falls back to this module without ever touching the visitor machine.
 */

/** the name of one thinking level. */
export type ThinkingLevelName = "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | "max";

/** one rung of the reasoning ladder. */
export type ThinkingLevel = {
  level: ThinkingLevelName;
  budget: number;
  desc: string;
};

/** the default rung the gateway resolves when the request names none. */
export const DEFAULTTHINKINGLEVEL: ThinkingLevelName = "high";

/** the in-memory ladder the DB layer persists on first run. */
export const THINKINGLEVELS: ThinkingLevel[] = [
  { level: "none", budget: 0, desc: "no thinking" },
  { level: "minimal", budget: 1400, desc: "quick reasoning" },
  { level: "low", budget: 5500, desc: "light reasoning" },
  { level: "medium", budget: 17000, desc: "balanced" },
  { level: "high", budget: 68000, desc: "deep reasoning default" },
  { level: "xhigh", budget: 68000, desc: "extra deep" },
  { level: "max", budget: 68000, desc: "maximum" },
];

/**
 * lists the ladder in serve order (none first).
 *
 * @returns the thinking levels.
 */
export function listlevels(): ThinkingLevel[] {
  return THINKINGLEVELS;
}

/**
 * resolves the budget of one named level.
 *
 * @param level the level name to resolve.
 * @returns the thinking budget in tokens.
 */
export function budgetof(level: ThinkingLevelName): number {
  return THINKINGLEVELS.find((rung) => rung.level === level)?.budget ?? 0;
}

/**
 * checks whether a request value names a real rung of the ladder.
 *
 * @param candidate the raw value from the request.
 * @returns true when the value is a known level.
 */
export function islevel(candidate: string): candidate is ThinkingLevelName {
  return THINKINGLEVELS.some((rung) => rung.level === candidate);
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
