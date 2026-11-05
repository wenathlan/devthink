#!/usr/bin/env node
/**
 * @file cli.ts — the vault binary seat of the clibin wave (PR13 — CLI
 *   binário mesmo design): the same Windows 11 chat console as the web and
 *   desktop surfaces, rendered inside the terminal as a subapp — the only
 *   difference is responsiveness / DPI (the 28px top rule becomes one line
 *   and the accent falls back to the ANSI 256 palette).
 * @module vault/cli
 * @family wave/clibin
 * @law same design as web / desktop, difference only responsiveness / DPI
 * @seat 2026 · rung 2.0.157 · hierarchical JSDoc, tokens/flags, no hardcoded
 *   data — the version is read from package.json at runtime and the engine
 *   one-liner is quoted from the app docs.
 * @runtime node strips the types; the shebang hands the file to the runtime
 *   (the saddle law).
 * @deps zero — node builtins only (readline/promises, process, fs/promises).
 */

import { createInterface } from "node:readline/promises";
import { argv, exit, stdin, stdout } from "node:process";
import { readFile } from "node:fs/promises";

/* ════════════════════════════════════════════════════════════════════ */
/* Section 1: the chrome tokens — the windows 11 palette folded to the DPI of the terminal (the accent #a3d7e6 lands on ansi 117, the focus #4cc2ff on 75, the hover red rgb(232,17,35) on 203; the 28px top rule becomes one line). */
/* ════════════════════════════════════════════════════════════════════ */

/** the chat accent of the prompt and the titlebar name. */
const ACCENT = "\x1b[38;5;117m" as const; // #a3d7e6
/** the focus ink of the active top rule. */
const FOCUS = "\x1b[38;5;75m" as const; // #4cc2ff
/** the hover red of the unknown-command rows. */
const HOVER = "\x1b[38;5;203m" as const; // rgb(232, 17, 35)
/** the dim ink of the description rows (the minimal text law). */
const INK = "\x1b[2m" as const;
/** the reset token that closes every colored run. */
const RESET = "\x1b[0m" as const;
/** the single glyph of the rules and the rails. */
const BAR = "─" as const;

/** the app name of this binary seat — the titlebar text. */
const APP = "vault" as const;
/** the engine ownership one-liner, quoted from the app docs. */
const ENGINE =
  "deployable clone of storage only (the network DB) — keeps every site database and receives the data backups (README)" as const;

/** the titlebar bar: the app name on the left rail, the window controls on the right — the windows 11 chrome inside the terminal. */
function titlebar(): string {
  return `${ACCENT}┌ ${APP} ─ cli${RESET}  ${INK}${BAR.repeat(24)} ─ ❐ ✕${RESET}`;
}

/** the top rule: the 28px divider of the web surface folded to one terminal line. */
function toprule(): string {
  return `${FOCUS}${BAR.repeat(3)} ${APP} ${BAR.repeat(3)}${RESET}`;
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 2: the runtime reads — no hardcoded data; the version comes from package.json at runtime. */
/* ════════════════════════════════════════════════════════════════════ */

/** reads the version of this seat from the sibling package.json — never a literal. */
async function readversion(): Promise<string> {
  try {
    const manifest = JSON.parse(await readFile(new URL("./package.json", import.meta.url), "utf8")) as { version?: string };
    return manifest.version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 3: the chat console — the REPL with the ❯ prompt, the command dispatch and the same chat look as the web surface. */
/* ════════════════════════════════════════════════════════════════════ */

/** the command help of the console — minimal text law: title + description only. */
function help(): string[] {
  return [
    `${INK}commands${RESET}`,
    `  help      ${INK}this list${RESET}`,
    `  version   ${INK}the package version, read from package.json at runtime${RESET}`,
    `  engine    ${INK}the engine ownership one-liner of the app${RESET}`,
    `  exit      ${INK}close the console${RESET}`,
  ];
}

/** runs the chat console: the titlebar, the top rule, the ❯ prompt and the dispatch (help, version, engine, exit); an eof on stdin closes the console the same way exit does. */
export async function main(): Promise<void> {
  /* the version read happens before the interface exists, so a piped stdin never races the readline open (node buffers the pipe until the reader resumes it). */
  const version = await readversion();
  const rl = createInterface({ input: stdin, output: stdout });
  let eof = false;
  rl.on("close", () => { eof = true; });
  console.log(titlebar());
  console.log(toprule());
  console.log(`${ACCENT}${APP}${RESET} ${INK}v${version}${RESET}`);
  console.log(`${INK}the ${APP} console — same design as web / desktop, only the DPI differs. type help.${RESET}`);
  rl.setPrompt(`${ACCENT}❯${RESET} `);
  rl.prompt();
  for await (const raw of rl) {
    const line = raw.trim();
    const command = line.length > 0 ? line.split(/\s+/)[0]!.toLowerCase() : "";
    if (command === "exit") rl.close();
    else if (command === "help") for (const row of help()) console.log(row);
    else if (command === "version") console.log(`${ACCENT}${APP}${RESET} ${version}`);
    else if (command === "engine") console.log(`${INK}${ENGINE}${RESET}`);
    else if (command.length > 0) console.log(`${HOVER}✕${RESET} ${INK}unknown command: ${command} — type help${RESET}`);
    if (command === "exit") break;
    /* the prompt is cosmetic chrome: a piped stdin that already reached eof skips it, the buffered lines still answer. */
    if (!eof) rl.prompt();
  }
  console.log(`${INK}${APP} console closed.${RESET}`);
}

/* the autorun guard (the saddle law): only a direct `node cli.ts` (or a bun run) boots the console here — an import stays quiet. */
if (import.meta.url === `file://${argv[1]}`) main().catch((error) => { console.error(error); exit(1); });
