/**
 * console page anchor — layer 3 of the anchor architecture. The file
 * carrying the folder's own name is the path manager of the page: it imports
 * the loose components beside it, mounts the page and re-exports the public
 * component surface. Only the theme anchor (Sol/Sol.tsx) and the window
 * registry (Sol/windowregistry.tsx) consume this file. TerminalUi.tsx stays
 * outside the anchor surface: it is the ink terminal of the CLI runtime and
 * the CLI imports it directly.
 *
 * Console — the cli design app in the Windows 11 grammar: a nav pane beside
 * the content deck with the three real sections (the terminal, the boot
 * stages, the command reference), the static catalog behind every entry and
 * the gateway lamp answering the paired loopback. The old staged pass (the
 * phosphor lamp, the scanline veil, the numbered kickers) is retired — this
 * body rides the dtw kit.
 */
import { useEffect, useRef, useState } from "react";
import { ShellChrome } from "@/shell/ShellChrome";
import { completions, responseof } from "../../commandcatalog.ts";
import { bootdelay, bootlines, consoleprompt, consoleversion } from "../../consoleboot.ts";
import { BOOT_STAGE_GAP, bootgraph, bootrunnerhandler } from "../../consolebootgraph.ts";
import { gatewayReady } from "../../gateway.js";
import { createrunner, type runstageview } from "../../graphrunner.js";
import { makeviewstate } from "../../graphviewstate.js";
import { ConsoleReference } from "./consolereference.tsx";
import { GraphView } from "./graphview.tsx";
import type { TerminalRow, TerminalState } from "./terminal.tsx";
import Terminal from "./terminal.tsx";

export * from "./terminal.tsx";

/** the three real sections of the console deck. */
type ConsoleSection = "terminal" | "boot" | "reference";

const SECTIONS: readonly { id: ConsoleSection; label: string }[] = [
  { id: "terminal", label: "Terminal" },
  { id: "boot", label: "Boot stages" },
  { id: "reference", label: "Command reference" },
];

/** the boot stages graph of the page: the catalog built once at module load,
 * the layered positions answered once by the pure view state — the runner
 * only feeds the states the drawing reads. */
const bootstagesgraph = bootgraph();
const bootstagespositions = makeviewstate(bootstagesgraph, { columnwidth: 240, rowheight: 76 }).positions;

/** The console app: the Windows body when embedded (the desktop window hosts
 * it without the shell), the full surface with the taskbar on the route. */
export default function Console({ embedded }: { embedded?: boolean }) {
  const rowseq = useRef(0);
  const bootedref = useRef(false);
  const [rows, setRows] = useState<TerminalRow[]>([]);
  const [termstate, setTermstate] = useState<TerminalState>("halted");
  const [runview, setRunview] = useState<runstageview | null>(null);
  const [graphselect, setGraphselect] = useState<string | null>(null);
  const [section, setSection] = useState<ConsoleSection>("terminal");
  const graphrunref = useRef(false);
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

  /** rides the boot stages graph once on mount: the runner walks the waves
   * (one wave per stage, the three surfaces arming together) and every view
   * snapshot lands on the drawing; the page never rides on the walk failing. */
  useEffect(() => {
    if (graphrunref.current) return;
    graphrunref.current = true;
    let cancelled = false;
    const ride = createrunner(bootstagesgraph, {
      handler: bootrunnerhandler,
      stagegap: BOOT_STAGE_GAP,
      onview: (view) => {
        if (!cancelled) setRunview(view);
      },
    });
    ride.run().catch(() => {
      /* the boot ride stays decorative: the terminal carries the session state */
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
    setSection("terminal");
  };

  return (
    <main className="dtw-app dtw-console" style={embedded ? { height: "100%", overflow: "auto" } : undefined}>
      {!embedded && <ShellChrome />}
      <div className="dtw-pane">
        <nav className="dtw-nav" aria-label="Console sections">
          {SECTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              className="dtw-navrow"
              data-active={item.id === section ? "true" : undefined}
              onClick={() => setSection(item.id)}
              aria-current={item.id === section ? "page" : undefined}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="dtw-content">
          <h1 className="dtw-title">Console</h1>

          {section === "terminal" ? (
            <>
              <Terminal rows={rows} prompt={consoleprompt} state={termstate} enabled={running} oncommand={runcommand} />
              <p className="dtw-console__note">
                <span aria-live="polite" className={paired ? "is-paired" : undefined}>
                  <i className="dtw-console__lamp" aria-hidden="true" />
                  {paired ? "Gateway paired" : "Static catalog"}
                </span>
                <span>tab completes, arrows browse, enter runs</span>
              </p>
            </>
          ) : null}

          {section === "boot" ? (
            <section className="dtw-card">
              <h2 className="dtw-cardtitle">
                Boot stages
                <span className="dtw-navrow__count">{Math.round(runview?.progress ?? 0)}%</span>
              </h2>
              <GraphView
                graph={bootstagesgraph}
                positions={bootstagespositions}
                nodestates={runview?.nodestates}
                stages={runview?.stages}
                stageindex={runview?.stageindex ?? 0}
                progress={runview?.progress ?? 0}
                selected={graphselect}
                onselect={setGraphselect}
                label="the boot stages of the cli riding the graph runner, one wave per stage"
              />
              <p className="dtw-copy">
                Banner, config and the engine arm stage by stage, the gateway, mcp and palette surfaces arm together,
                and ready closes the walk.
              </p>
            </section>
          ) : null}

          {section === "reference" ? <ConsoleReference running={running} onrun={runreference} /> : null}
        </div>
      </div>
    </main>
  );
}
