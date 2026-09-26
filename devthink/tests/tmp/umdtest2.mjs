import { readFile } from "node:fs/promises";
const source = await readFile("/tmp/devthink.umd.js", "utf8");
const sandbox = {};
sandbox.self = sandbox;
try {
  new Function("self", source)(sandbox);
  const g = sandbox.devthink;
  console.log("surfacepalette:", typeof g.surfacepalette);
  console.log("bundlestamp:", JSON.stringify(g.bundlestamp()));
  console.log("keycount:", Object.keys(g).length);
} catch (e) {
  console.error("STACK:", e.stack.split("\n").slice(0, 12).join("\n"));
}
