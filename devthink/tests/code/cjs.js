/** One plain node script that requires the library in cjs mode: the stable getter object exposes the same named exports as the esm build. */
const devthink = require("@wenathlan/extension");

const stamp = devthink.bundlestamp();
console.log(`devthink ${stamp.version} in ${stamp.mode} mode`);
console.log(`policy exports ${Object.keys(require("@wenathlan/extension/policy")).length} functions`);
