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
export declare const DEFAULTTHINKINGLEVEL: ThinkingLevelName;
/** the in-memory ladder the DB layer persists on first run. */
export declare const THINKINGLEVELS: ThinkingLevel[];
/**
 * lists the ladder in serve order (none first).
 *
 * @returns the thinking levels.
 */
export declare function listlevels(): ThinkingLevel[];
/**
 * resolves the budget of one named level.
 *
 * @param level the level name to resolve.
 * @returns the thinking budget in tokens.
 */
export declare function budgetof(level: ThinkingLevelName): number;
/**
 * checks whether a request value names a real rung of the ladder.
 *
 * @param candidate the raw value from the request.
 * @returns true when the value is a known level.
 */
export declare function islevel(candidate: string): candidate is ThinkingLevelName;
/**
 * formats a budget the way the theme renders it (grouped thousands).
 *
 * @param budget the budget in tokens.
 * @returns the formatted label.
 */
export declare function formatbudget(budget: number): string;
