/** Wraps one cjs bundle body behind the stable getter object of the 1.1.81 library modes: every named export of the esm core moves behind one getter that reads the internal exports object, so the require surface stays stable against assignment and the same names answer in the esm and the cjs mode. */
export function cjswrap(body) {
  return `${body}
/* The stable getter object of the cjs mode: every named export sits behind one getter that reads the internal exports, so the require surface never rebinds and the mode reports its own stamp. */
(function (internal) {
  var stable = {};
  var names = Object.getOwnPropertyNames(internal);
  for (var position = 0; position < names.length; position += 1) {
    (function (name) {
      var descriptor = Object.getOwnPropertyDescriptor(internal, name);
      Object.defineProperty(stable, name, { enumerable: descriptor.enumerable, get: function () { return internal[name]; } });
    })(names[position]);
  }
  module.exports = stable;
})(module.exports);
`;
}
