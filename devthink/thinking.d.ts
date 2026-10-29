/**
 * thinking.d.ts — the ambient declaration of the getry engine's thinking
 * ladder for the declaration build. The os consumes the 7-level ladder as
 * a library (the pr16 ownership law: getry owns the reasoning rungs), and
 * the runtime bundle inlines the owner's source through the esbuild alias
 * (tests/build.ts) — the declaration build resolves the specifier
 * here so the tsc program never leaves the application root and the
 * emitted declarations keep referencing the owner library specifier.
 * Retires the day the published getry envelope carries the ./thinking
 * export, exactly the way the saddle sandbox bridge documents the same
 * ladder for its own owner.
 */
declare module "@wenathlan/getry/thinking" {
  /** the seven level names of the reasoning ladder. */
  export type ThinkingLevelName = "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | "max";

  /** one rung of the reasoning ladder. */
  export type ThinkingLevel = {
    level: ThinkingLevelName;
    budget: number;
    desc: string;
  };

  /** the default rung the gateway resolves when the request names none. */
  export const DEFAULTTHINKINGLEVEL: ThinkingLevelName;

  /** the in-memory ladder the DB layer persists on first run. */
  export const THINKINGLEVELS: ThinkingLevel[];

  /** lists the ladder in serve order (none first). */
  export function listlevels(): ThinkingLevel[];

  /** resolves the budget of one named level in tokens. */
  export function budgetof(level: ThinkingLevelName): number;

  /** checks whether a request value names a real rung of the ladder. */
  export function islevel(candidate: string): candidate is ThinkingLevelName;

  /** formats a budget the way the theme renders it (grouped thousands). */
  export function formatbudget(budget: number): string;
}
