/**
 * saddlefaces.ts — the typed library face of the saddle engine modes for
 * the typecheck program (the same pattern the devthink build rides): the
 * saddle engine sources keep the loose typing baseline their own tsconfig
 * documents (strict: false, noCheck: true — the upstream authoring), so a
 * strict consumer that follows the @wenathlan/saddle/modes specifier into
 * the engine source would type-check the loose authored forms under its own
 * strict baseline. this face declares the exact contract the app consumes
 * (the runner mode tuple and its union) and the tsconfig paths resolve the
 * specifier onto it for the typecheck alone — the runtime keeps resolving
 * the real engine source through the vite and vitest bridges (the source
 * resolves for the runtime while the typecheck program answers these
 * declarations instead, the way the devthink saddlefaces lane always
 * answered). Retires the day the published saddle envelope carries the
 * declaration build beside the sources.
 */

declare module "@wenathlan/saddle/modes" {
  /** the five runtime targets the runner seams launch (the operation
   * ladder the modes domain owns; the tuple stays frozen). */
  export const runnermodes: readonly ["full-virtual", "runner", "node-packages", "docker", "ghcr"];

  /** one runtime target of the ladder. */
  export type RunnerMode = (typeof runnermodes)[number];
}
