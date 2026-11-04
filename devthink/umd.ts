/**
 * umd — consolidated umd logics of the devthink family
 * @module umd
 * @family wave/logicfold3
 * One keyed file per family: the former variant arms (umdwrap)
 * retired into this seat with every export preserved under the same name.
 */

/* ===== block: umd ===== */
/**
 * Umd entry of the 1.1.67 family, restamped by the 1.1.81 library modes and sunset at 2.0.0.
 * The shared core for script tag consumers: the build emits this entry as the global devthink bundle of the browser platform target, tree shakable imports, the whole library behind one script tag with the consent gates intact. The 2.0.0 sunset removed the deprecated uppercase Devthink global the deprecation window carried: the envelope exposes exactly the lowercase devthink surface the frozen library contract declares.
 */

export * from "./index.js";
import { stampbundle } from "./runtime.js";

stampbundle("umd", "devthink.umd.js");

/* ===== block: umdwrap ===== */
/** Wraps one cjs bundle body into a umd envelope so script tag consumers receive the global and require consumers receive the module; the 2.0.0 sunset removed the deprecated uppercase global the 1.1.81 library modes shipped as a shim, so the envelope exposes exactly the devthink global the frozen library surface declares. */
export function umdwrap(body: string, globalname: string): string {
  return `(function (root, factory) {
  if (typeof define === "function" && define.amd) { define([], factory); }
  else if (typeof module === "object" && module.exports) { module.exports = factory(); }
  else {
    root.${globalname} = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  var module = { exports: {} };
  var exports = module.exports;
${body}
  return module.exports;
});
`;
}

