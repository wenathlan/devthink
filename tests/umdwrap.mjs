/** Wraps one cjs bundle body into a umd envelope so script tag consumers receive the global and require consumers receive the module; the 2.0.0 sunset removed the deprecated uppercase global the 1.1.81 library modes shipped as a shim, so the envelope exposes exactly the devthink global the frozen library surface declares. */
export function umdwrap(body, globalname) {
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
