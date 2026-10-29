import { build } from "esbuild";
import { readFile, writeFile } from "node:fs/promises";
import { nodestubplugin } from "./nodestub.ts";
import { umdwrap } from "./umdwrap.ts";
try {
  await build({ entryPoints: ["umd.ts"], outfile: "/tmp/umd-core.cjs", bundle: true, format: "cjs", platform: "browser", target: "chrome120", sourcemap: false, plugins: [nodestubplugin], logLevel: "silent" });
  const body = await readFile("/tmp/umd-core.cjs", "utf8");
  await writeFile("/tmp/devthink.umd.js", umdwrap(body, "devthink"));
  console.log("built umd");
  const source = await readFile("/tmp/devthink.umd.js", "utf8");
  const sandbox: {
    self?: unknown;
    devthink?: { surfacepalette: unknown; canexecute: unknown; bundlestamp: () => unknown; [key: string]: unknown };
  } = {};
  sandbox.self = sandbox;
  new Function("self", source)(sandbox);
  const g = sandbox.devthink ?? { surfacepalette: undefined, canexecute: undefined, bundlestamp: () => undefined };
  console.log("surfacepalette:", typeof g.surfacepalette);
  console.log("canexecute:", typeof g.canexecute);
  console.log("bundlestamp:", JSON.stringify(g.bundlestamp()));
  console.log("keycount:", Object.keys(g).length);
  console.log("node: refs:", /from\s*["']node:|require\(\s*["']node:/.test(source));
} catch (e) {
  console.error(String((e as Partial<Error>).message || e).split("\n").slice(0, 25).join("\n"));
  process.exit(1);
}
