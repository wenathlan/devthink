/**
 * console page — the canonical design of the devthink cli.
 *
 * the web folder is the design room of the whole project: this page draws
 * the command line the binary really ships — the boot banner, the prompt
 * marker, the command registry with every flag and the documented feedback
 * of every runtime command — so github pages, vercel, netlify, the tv and
 * the capacitor shell all render one identical cli design. the terminal
 * runs the static catalog (one source: commandcatalog.ts, lifted from the
 * views.ts registry the cli registers), never a live process: provider
 * credentials and the engine stay behind the paired local cli.
 */
import { useEffect, useRef, useState } from "react";
import { ControlShell } from "@/control.shell";
import { gatewayReady } from "../gateway.js";
import Terminal from "./terminal";
import type { TerminalRow, TerminalState } from "./terminal";
import { bootdelay, bootlines, consoleprompt, consoleversion } from "./boot";
import { catalogcommands, completions, exitclasses, globalflags, responseof } from "./commandcatalog";

/** the console page: the terminal pane beside the command reference panel of the registry. */
export default function Console() {
  const rowseq = useRef(0);
  const bootedref = useRef(false);
  const [rows, setRows] = useState<TerminalRow[]>([]);
  const [termstate, setTermstate] = useState<TerminalState>("halted");
  const paired = gatewayReady();
  const running = termstate === "running";

  /** appends one row with the console row classes (boot, ok, err, cmdline). */
  const printrow = (text: string, cls: string) => {
    rowseq.current += 1;
    setRows((prev) => [...prev, { id: rowseq.current, text, cls }]);
  };

  /** boots the console once on mount: each line appends with the ink cadence, then the console runs; the cleanup drops late paints after unmount. */
  useEffect(() => {
    if (bootedref.current) return;
    bootedref.current = true;
    let cancelled = false;
    const boot = async () => {
      setTermstate("booting");
      for (const line of bootlines()) {
        if (cancelled) return;
        rowseq.current += 1;
        const id = rowseq.current;
        setRows((prev) => [...prev, { id, text: line, cls: "boot" }]);
        await bootdelay();
      }
      if (!cancelled) setTermstate("running");
    };
    boot().catch(() => {
      if (!cancelled) setTermstate("running");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  /** runs one command: the echo, the catalog response of the command word and the exit line. */
  const runcommand = (raw: string) => {
    printrow(`${consoleprompt} ${raw}`, "cmdline");
    if (raw === "clear") {
      setRows([]);
      return;
    }
    const commandword = raw.trim().split(/\s+/)[0]?.toLowerCase() ?? "";
    if (completions(commandword).includes(commandword) && commandword !== "clear") {
      for (const line of responseof(commandword, consoleversion)) printrow(line, "ok");
      return;
    }
    for (const line of responseof(commandword, consoleversion)) printrow(line, "err");
  };

  /** runs one reference entry and keeps the terminal input focused for the next command. */
  const runreference = (id: string) => {
    if (!running) return;
    runcommand(id);
  };

  return (
    <ControlShell
      eyebrow="cli design reference"
      title="The CLI, drawn live."
      summary="The console page is the canonical design of the devthink command line for GitHub Pages, Vercel, Netlify, TV and Android: the real banner, the real prompt marker, the command registry the binary registers with every flag, and the documented feedback of every runtime command."
    >
      <div className="console-grid">
        <div className="console-main">
          <Terminal rows={rows} prompt={consoleprompt} state={termstate} enabled={running} oncommand={runcommand} />
          <p className="console-note">
            <span aria-live="polite">
              {paired ? "gateway: paired loopback detected" : "cli design reference · static catalog"}
            </span>
            <span>tab completes · ↑↓ history · enter runs</span>
          </p>
        </div>
        <aside className="console-reference" aria-labelledby="consolereferencetitle">
          <h2 className="console-reference__title" id="consolereferencetitle">
            command reference
          </h2>
          <p className="console-reference__hint">
            the registry the cli and the commandpalette share — enter runs one entry in the terminal.
          </p>
          <ul className="console-reference__list">
            {catalogcommands.map((command) => (
              <li key={command.id} className="console-reference__entry">
                <button
                  type="button"
                  className="console-reference__run"
                  onClick={() => runreference(command.id)}
                  disabled={!running}
                >
                  <strong>{command.id}</strong>
                  <span>{command.label}</span>
                </button>
                <div className="console-reference__detail">
                  <code>{command.usage}</code>
                  {command.flags.length > 0 && (
                    <ul className="console-reference__flags">
                      {command.flags.map((flag) => (
                        <li key={flag.flag}>
                          <code>{flag.value ? `${flag.flag} ${flag.value}` : flag.flag}</code>
                          <span>{flag.note}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <div className="console-reference__contract">
            <h3>global flags</h3>
            <ul>
              {globalflags.map((flag) => (
                <li key={flag.flag}>
                  <code>{flag.value ? `${flag.flag} ${flag.value}` : flag.flag}</code>
                  <span>{flag.note}</span>
                </li>
              ))}
            </ul>
            <h3>exit codes</h3>
            <ul>
              {exitclasses.map((entry) => (
                <li key={entry.exitclass}>
                  <code>{entry.exitclass}</code>
                  <span>{entry.code}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </ControlShell>
  );
}
