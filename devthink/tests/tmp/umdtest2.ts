import { readFile } from "node:fs/promises";
const source = await readFile("/tmp/devthink.umd.js", "utf8");
const sandbox: {
  self?: unknown;
  devthink?: { surfacepalette: unknown; bundlestamp: () => unknown; [key: string]: unknown };
} = {};
sandbox.self = sandbox;
try {
  new Function("self", source)(sandbox);
  const g = sandbox.devthink ?? { surfacepalette: undefined, bundlestamp: () => undefined };
  console.log("surfacepalette:", typeof g.surfacepalette);
  console.log("bundlestamp:", JSON.stringify(g.bundlestamp()));
  console.log("keycount:", Object.keys(g).length);
} catch (e) {
  console.error("STACK:", String((e as Partial<Error>).stack || e).split("\n").slice(0, 12).join("\n"));
}
