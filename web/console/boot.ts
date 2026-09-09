/**
 * console boot sequence — the lines the devthink cli really prints when it
 * comes up, replayed line by line by the console page the way the terminal
 * boots the workbench.
 *
 * one file one responsibility: the boot text alone lives here. every line is
 * lifted from the real cli surfaces — the entry banner of terminal-ui.tsx
 * (the ink terminal the `devthink` command renders), the help banner of
 * cli.ts cmdhelp, the mcp serve startup line of cmdserve and the pairing
 * state the workbench answers — so the design page stays faithful to the
 * binary it draws.
 */

import { packageversion } from "../../version.ts";

/** the console prompt of the ink terminal (terminal-ui.tsx): the marker pair the workbench shares. */
export const consoleprompt = "›_";

/** the version the whole console answers — the single root version.ts, never a local copy. */
export const consoleversion = packageversion;

/** the sleep that spaces the animated boot lines (the same 28–62ms cadence the ink frame paints). */
export const bootdelay = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 28 + Math.random() * 34));

/**
 * the boot sequence the console replays on start: the banner pair the help
 * command prints, the configuration the globalstate reads, the engine
 * surfaces the cli registers and the ready line that invites the first
 * command.
 */
export function bootlines(): string[] {
  return [
    `devthink ${packageversion} — the consent-first browser agent bridge on the terminal.`,
    "usage: devthink <command> [options]",
    "config   .devthink/config.json · verbosity normal · format human",
    "engine   plan review · consent gates · sealed log chain ready",
    "gateway  loopback provider gateway answers the paired workbench",
    "mcp      stdio + http listener armed on 127.0.0.1:7436 (devthink serve)",
    "palette  the shared command registry rides the cli and the surfaces",
    'ok: console running. type "help" for the command list.',
  ];
}
