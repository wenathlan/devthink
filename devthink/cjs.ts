/**
 * cjs — the require entry face of the devthink library modes.
 * @module cjs
 * @family wave/logicfold3
 * @law single responsibility: this seat is the runtime entry the build emits as build/index.cjs; the build time helper lives in cjswrap.ts so the build graph never resolves the index.js artifact at build time.
 */

/**
 * Cjs entry of the 1.1.81 family.
 * The shared core for require based consumers: the build emits this entry as build/index.cjs with every named export of the esm core behind one stable getter object, and the entry stamps its own mode so the library reports the bundle it runs from.
 */

export * from "./index.js";
import { stampbundle } from "./runtime.js";

stampbundle("cjs", "index.cjs");
