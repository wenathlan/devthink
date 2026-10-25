/**
 * Cjs entry of the 1.1.81 family.
 * The shared core for require based consumers: the build emits this entry as dist/index.cjs with every named export of the esm core behind one stable getter object, and the entry stamps its own mode so the library reports the bundle it runs from.
 */

export * from "./index.js";
import { stampbundle } from "./runtime.js";

stampbundle("cjs", "index.cjs");
