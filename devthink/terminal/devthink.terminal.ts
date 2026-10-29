/**
 * devthink.terminal.ts — the terminal entry of the one design (wave 2-c /
 * PR11): the face `npm run terminal` boots — no browser, no install, plain
 * node (≥ 23.6, type-stripped .ts) or bun on Linux, Windows 10/11 and
 * Android (termux). The document mounts the CONVERTED faces (the same Sol
 * widgets the web serves, emitted by build.terminal.ts) plus the dpi report
 * of density.ts — the law made visible: one design, the platforms differ
 * only in dpi.
 *
 * Flags: --plain (ASCII glyphs, no color — the NO_COLOR lane), and the
 * environment ladder (COLORTERM/TERM/WT_SESSION) picks truecolor / 256 / 16
 * automatically.
 */

import { DENSITY_PLATFORMS, ANDROID_DPI, densityTokens } from "../density.ts";
import { colorDepthFromEnv, render, type ColorDepth } from "./runtime.ts";
import { ControlShellTerminal } from "./shell.terminal.ts";
import { ChipTerminal } from "./chip.terminal.ts";
import { KbdTerminal } from "./kbd.terminal.ts";

/** the resolved render options of this run (env ladder + flags) */
function options(): { depth: ColorDepth; plain: boolean; columns: number } {
  const plain = process.argv.includes("--plain") || Boolean(process.env.NO_COLOR);
  const depthFlag = /^--depth=(truecolor|256|16|none)$/.exec(process.argv[2] ?? "");
  const depth: ColorDepth = depthFlag ? (depthFlag[1] as ColorDepth) : colorDepthFromEnv(process.env);
  const columns = Math.max(40, Math.min(120, Number.parseInt(process.env.COLUMNS ?? "", 10) || 80));
  return { depth, plain, columns };
}

/** the dpi report — the density law of the one design, one row per platform */
function dpiReport(): string[] {
  const rows: string[] = [];
  rows.push("the dpi law — one design, every platform");
  const hints: Partial<Record<(typeof DENSITY_PLATFORMS)[number], string>> = {
    web: "1x · 2x · 3x (the dpr ladder)",
    terminal: "the character cell (8×16px)",
    tv: "the 10-foot factor",
    android: "dp at 160dpi (mdpi → xxxhdpi)",
  };
  for (const platform of DENSITY_PLATFORMS) {
    const tokens = densityTokens(platform);
    rows.push(
      `  ${platform.padEnd(9)} factor ${`${tokens.factor}x`.padEnd(5)} unit ${tokens.unit.padEnd(5)} step ${String(tokens.step).padEnd(4)} columns ${String(tokens.columns).padEnd(3)} ${hints[platform] ?? ""}`.trimEnd(),
    );
  }
  rows.push(`  android buckets: ${Object.entries(ANDROID_DPI).map(([bucket, dpi]) => `${bucket} ${dpi}dpi`).join(" · ")}`);
  return rows;
}

/** renders the terminal document of the one design */
function document(): string {
  const opts = options();
  const blocks: string[] = [];

  // the converted control shell — the same face the web pages mount
  blocks.push(
    ControlShellTerminal(
      {
        eyebrow: "console · wave 2-c",
        title: "the one design answers every screen",
        summary:
          "the same tsx rides the browser and the terminal: the build converts the widgets, the tokens stay one, the platforms split only on dpi.",
        actions: "explore",
        children: [
          "the shell (Sol/wingets/ShellControlshell.tsx) converted by build.terminal.ts",
          "flex → rows and columns · colors → ansi · hairlines → ─ rules",
        ],
      },
      opts,
    ),
  );

  // the proof widgets — the chip and the keycap
  const chips = ["neutral", "ok", "warn", "err", "info"]
    .map((tone) => ChipTerminal({ children: tone, tone }, opts).trim())
    .join("  ");
  blocks.push(`${chips}  ${ChipTerminal({ children: "dismissable", tone: "info", onRemove: true }, opts).trim()}`);
  blocks.push(KbdTerminal({ keys: ["Ctrl", "K"] }, opts));

  // the dpi report
  blocks.push(dpiReport().join("\n"));

  return blocks.join("\n\n");
}

const entry = process.argv[1]?.endsWith("devthink.terminal.ts") || process.argv[1]?.endsWith("devthink.terminal");
if (entry) {
  process.stdout.write(`${document()}\n`);
}
