"use strict";
const path = require("node:path");
module.exports = {
  mode: "production",
  target: "node",
  entry: "./webpacksrc.mjs",
  output: { path: path.resolve(__dirname, "webpackdist"), filename: "stealthhead.webpack.cjs", library: { type: "commonjs2" } },
  externals: [ function externallaw({ request }, callback) { if (request.startsWith(".") || request.startsWith("node:") || path.isAbsolute(request)) return callback(); return callback(null, "commonjs " + request); } ],
  devtool: false
};
