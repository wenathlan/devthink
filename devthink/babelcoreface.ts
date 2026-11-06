/**
 * babelcoreface.ts — the typed face of the @babel/core seat the saddle
 * engine bridges (the yaml and babel seats of modalities.ts, scripts.ts
 * and edgelandes.ts). The seat is OPTIONAL at runtime by the owner law: the
 * guarded dynamic import answers the honest HOST_RUNTIME_ABSENT refusal
 * when the package is absent from the install, and no install of the family
 * declares the package — the strict type-check walk of the os program
 * resolves the specifier through this face so the checked graph never
 * depends on a package no seat ships. The face declares the typed slice the
 * bridge casts onto; it carries no runtime transform on purpose (the
 * guarded caller reports the absent runtime instead of faking one). The
 * entry retires when an install carries the real package (the same law the
 * hono seat bridge documents in tsconfig.json).
 */

/** the options bag the transform call accepts (the bridge passes a plain
 * record: filename, plugins, presets, the config opt-outs). */
export type BabelTransformOptions = Record<string, unknown>;

/** the transformed program the call answers. */
export type BabelTransformResult = { code: string };

/** the synchronous transform signature of the seat. */
export type BabelTransformSync = (code: string, options?: BabelTransformOptions) => BabelTransformResult;

/** the typed slice of the seat: no transform ships with the family install,
 * so the face answers the absent surface and the guarded bridge reports it
 * (the seat never fakes a runtime). */
export const transformSync: BabelTransformSync | undefined = undefined;

/** the commonjs spelling the bridge accepts beside the named export. */
export default { transformSync };
