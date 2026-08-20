import { readFileSync } from "node:fs";
import { arch, platform } from "node:process";

type BunRuntime = {
  build: (options: Record<string, unknown>) => Promise<{ success: boolean; logs: unknown[] }>;
};

function bunRuntime(): BunRuntime {
  const runtime = (globalThis as unknown as { Bun?: BunRuntime }).Bun;
  if (!runtime) throw new Error("Bun is required to compile DevThink binaries.");
  return runtime;
}

function flag(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function packageVersion(): string {
  const packageData = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8")) as { version?: string };
  return packageData.version || "0.0.0";
}

function localCompileTarget(): string {
  const os = platform === "darwin" ? "darwin" : platform === "win32" ? "windows" : "linux";
  const cpu = arch === "arm64" ? "arm64" : "x64";
  return `bun-${os}-${cpu}`;
}

export async function buildBinary(): Promise<void> {
  const runtime = bunRuntime();
  const target = flag("--target") || process.env.BUN_TARGET || localCompileTarget();
  const outfile = flag("--outfile") || process.env.DEVTHINK_OUTFILE || `release/devthink-${target}`;
  const result = await runtime.build({ entrypoints: ["./devthink.ts"], target, define: { "process.env.DEVTHINK_VERSION": JSON.stringify(packageVersion()) }, compile: { target, outfile }, minify: true, sourcemap: "none" });
  if (!result.success) throw new Error(`Bun compilation failed: ${JSON.stringify(result.logs)}`);
  console.log(`Built ${outfile}`);
}

const directEntry = process.argv[1]?.endsWith("build.ts") || process.argv[1]?.endsWith("build");
const bunEntry = (import.meta as ImportMeta & { main?: boolean }).main === true;
if (directEntry || bunEntry) buildBinary().catch((error: unknown) => { console.error(error instanceof Error ? error.message : "Build failed."); process.exitCode = 1; });
