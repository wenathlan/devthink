#!/usr/bin/env node

// cli.ts
import { createInterface } from "node:readline/promises";
import { argv, exit, stdin, stdout } from "node:process";
import { readFile } from "node:fs/promises";
var ACCENT = "\x1B[38;5;117m";
var FOCUS = "\x1B[38;5;75m";
var HOVER = "\x1B[38;5;203m";
var INK = "\x1B[2m";
var RESET = "\x1B[0m";
var BAR = "\u2500";
var APP = "cadria";
var ENGINE = "houses the versawase engine at the root \u2014 imports katexis from debonair and gateway, AI and workflow from devthink (README)";
function titlebar() {
  return `${ACCENT}\u250C ${APP} \u2500 cli${RESET}  ${INK}${BAR.repeat(FRAME.rail)} \u2500 \u2750 \u2715${RESET}`;
}
function toprule() {
  const rail = Math.max(3, Math.round(3 * FRAME.scale));
  return `${FOCUS}${BAR.repeat(rail)} ${APP} ${BAR.repeat(rail)}${RESET}`;
}
var SCALESTEPS = [1, 1.5, 2, 3];
function detectdpiframe() {
  const columns = Number.isFinite(stdout.columns) && Number(stdout.columns) > 0 ? Number(stdout.columns) : 80;
  const override = Number(process.env[`${APP.toUpperCase()}_DPI`] ?? "");
  const scale = Number.isFinite(override) && override > 0 && SCALESTEPS.includes(override) ? override : columns >= 200 ? 3 : columns >= 160 ? 2 : columns >= 120 ? 1.5 : 1;
  const rail = Math.max(4, Math.min(Math.round(24 * scale), columns - APP.length - 16));
  return { scale, columns, rail };
}
var FRAME = detectdpiframe();
async function readversion() {
  try {
    const manifest = JSON.parse(await readFile(new URL("./package.json", import.meta.url), "utf8"));
    return manifest.version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}
function help() {
  return [
    `${INK}commands${RESET}`,
    `  help      ${INK}this list${RESET}`,
    `  version   ${INK}the package version, read from package.json at runtime${RESET}`,
    `  dpi       ${INK}the resolved dpi seat of this terminal (scale, columns, rail)${RESET}`,
    `  engine    ${INK}the engine ownership one-liner of the app${RESET}`,
    `  exit      ${INK}close the console${RESET}`
  ];
}
async function main() {
  const version = await readversion();
  const rl = createInterface({ input: stdin, output: stdout });
  let eof = false;
  rl.on("close", () => {
    eof = true;
  });
  console.log(titlebar());
  console.log(toprule());
  console.log(`${ACCENT}${APP}${RESET} ${INK}v${version}${RESET}`);
  console.log(`${INK}the ${APP} console \u2014 same design as web / desktop, only the DPI differs. type help.${RESET}`);
  rl.setPrompt(`${ACCENT}\u276F${RESET} `);
  rl.prompt();
  for await (const raw of rl) {
    const line = raw.trim();
    const command = line.length > 0 ? line.split(/\s+/)[0].toLowerCase() : "";
    if (command === "exit") rl.close();
    else if (command === "help") for (const row of help()) console.log(row);
    else if (command === "version") console.log(`${ACCENT}${APP}${RESET} ${version}`);
    else if (command === "dpi") console.log(`${ACCENT}${APP}${RESET} ${INK}dpi seat ${FRAME.scale}x on ${FRAME.columns} columns \u2014 rail ${FRAME.rail} cells, ladder 1x / 1.5x / 2x / 3x${RESET}`);
    else if (command === "engine") console.log(`${INK}${ENGINE}${RESET}`);
    else if (command.length > 0) console.log(`${HOVER}\u2715${RESET} ${INK}unknown command: ${command} \u2014 type help${RESET}`);
    if (command === "exit") break;
    if (!eof) rl.prompt();
  }
  console.log(`${INK}${APP} console closed.${RESET}`);
}
if (import.meta.url === `file://${argv[1]}`) main().catch((error) => {
  console.error(error);
  exit(1);
});
export {
  main
};
