/**
 * console page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file; no module outside the folder imports the folder members
 * directly. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself. TerminalUi.tsx stays
 * outside the anchor surface: it is the ink terminal of the CLI runtime and
 * the CLI imports it directly.
 */

/**
 * console page — the canonical design of the devthink cli.
 *
 * the web folder is the design room of the whole project: this page draws
 * the command line the binary really ships — the boot banner, the prompt
 * marker, the command registry with every flag and the documented feedback
 * of every runtime command — so github pages, vercel, netlify, the tv and
 * the capacitor shell all render one identical cli design. campaign v3
 * r2-a: the terminal is the hero object of an asymmetric bench (1.6fr/1fr)
 * under ONE named light (the phosphor lamp over the pane); the output rides
 * 13px mono with hairline-separated rows, a ≤4% scanline veil and the
 * 2.4s block-caret blink; the command reference closes as a hairline ledger
 * rail; the paired gateway answers with the engine live-dot ping. the
 * terminal runs the static catalog (one source: commandcatalog.ts, lifted
 * from the views.ts registry the cli registers), never a live process:
 * provider credentials and the engine stay behind the paired local cli.
 */
import { TerminalSquare } from "lucide-react";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { ShellChrome } from "@/shell/ShellChrome";
import { gatewayReady } from "../../gateway.js";
import { bootdelay, bootlines, consoleprompt, consoleversion } from "./boot";
import { catalogcommands, completions, exitclasses, globalflags, responseof } from "./commandcatalog";
import type { TerminalRow, TerminalState } from "./terminal";
import Terminal from "./terminal";

export * from "./terminal";

/* --------------------------------------------------------------------------
 * the console page-app stylesheet — the r2-a terminal pass of this folder:
 * terminal craft. ONE light (the phosphor lamp riding the engine
 * .shader-fallback), the pane as the machined dark glass with the ≤4%
 * scanline veil, 13px mono output with hairline-separated rows and the
 * 2.4s signal block-caret; the reference closes as a hairline ledger with
 * the signal hover. Scoped to the classes only this page mounts; it lands
 * once at import time. The catalog, boot and command flow are untouched.
 * ------------------------------------------------------------------------ */
const CONSOLE_CSS = `
.halftone::after, .grain::before { pointer-events: none; }
.r2a-console-light { background: radial-gradient(54% 50% at 82% 0%, color-mix(in srgb, var(--dtv3-signal) 14%, transparent) 0%, transparent 66%); }
.console-grid { grid-template-columns: minmax(0, 1.6fr) minmax(280px, 1fr); gap: clamp(28px, 4vw, 56px); align-items: start; }
.console-main { gap: 16px; }
.dt-term { position: relative; border-radius: 14px; background: rgb(11 12 16 / 94%); border: 1px solid var(--dtv3-hairline); box-shadow: 0 30px 80px rgb(0 0 0 / 42%), inset 0 1px 0 rgb(255 255 255 / 5%); }
[data-theme="light"] .dt-term { background: #14161c; border-color: rgb(23 25 31 / 20%); }
.dt-term::after { content: ""; position: absolute; inset: 0; z-index: 1; pointer-events: none; background: repeating-linear-gradient(0deg, rgb(255 255 255 / 3%) 0 1px, transparent 1px 3px); }
.dt-term__bar { background: rgb(255 255 255 / 2%); border-bottom-color: rgb(255 255 255 / 6%); color: var(--dtv3-ink-3); font-size: 10px; }
.dt-term__state { color: var(--dtv3-sig); }
.dt-term__out { color: #b9b3ab; font: 13px/1.75 var(--dt-mono); }
.dt-term__out > span { display: block; padding: 2px 0; border-bottom: 1px solid rgb(255 255 255 / 4%); }
.dt-term__out .boot { color: var(--dtv3-ink-3); }
.dt-term__out .cmdline { color: var(--dtv3-ink-1); }
.dt-term__out .ok { color: #c9c0b8; }
.dt-term__out .err { color: #ff7d66; }
.dt-term__prompt { color: var(--dtv3-ink-1); font-size: 14px; }
.dt-term__input { font: 13px var(--dt-mono); caret-color: var(--dtv3-sig); }
@media not (prefers-reduced-motion: reduce) {
  .dt-term__prompt::after { content: ""; display: inline-block; width: 9px; height: 16px; margin-left: 3px; vertical-align: -2px; background: var(--dtv3-sig); animation: r2aCaret 2.4s steps(1) infinite; }
}
@keyframes r2aCaret { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
.console-reference { display: grid; gap: 12px; padding: 2px 0 0 clamp(20px, 2.6vw, 32px); background: transparent; border: 0; border-left: 1px solid var(--dtv3-hairline); border-radius: 0; }
.console-reference__title { color: var(--dtv3-ink-1); font: 600 12px var(--dt-mono); letter-spacing: .08em; text-transform: lowercase; }
.console-reference__hint { color: var(--dtv3-ink-3); font: 400 10px/1.7 var(--dt-mono); }
.console-reference__list { gap: 0; }
.console-reference__entry { border-top: 1px solid var(--dtv3-hairline); }
.console-reference__run { grid-template-columns: 92px minmax(0, 1fr); min-height: 44px; padding: 9px 6px; color: var(--dtv3-ink-2); background: transparent; border: 0; border-radius: 0; font: 500 11px/1.5 var(--dt-mono); transition: background 160ms var(--dtv3-ease), color 160ms var(--dtv3-ease), transform 120ms var(--dtv3-ease); }
.console-reference__run:hover:not(:disabled) { color: var(--dtv3-ink-1); background: rgb(255 255 255 / 3%); }
.console-reference__run strong { color: var(--dtv3-ink-1); font: 600 11px var(--dt-mono); }
.console-reference__run:hover:not(:disabled) strong { color: var(--dtv3-sig); }
.console-reference__run:active:not(:disabled) { transform: scale(.98); }
.console-reference__run:disabled { opacity: .4; cursor: not-allowed; }
button.console-reference__run:focus-visible { outline: 2px solid color-mix(in srgb, var(--dtv3-sig) 45%, transparent); outline-offset: -2px; }
.console-reference__detail { margin-top: 0; padding: 0 6px 12px 108px; background: transparent; border: 0; border-radius: 0; color: var(--dtv3-ink-3); font: 400 10px/1.7 var(--dt-mono); }
.console-reference__detail > code { color: color-mix(in srgb, var(--dtv3-sig) 42%, var(--dtv3-ink-1)); }
.console-reference__flags code { color: var(--dtv3-ink-2); }
.console-reference__contract { padding-top: 12px; border-top-color: var(--dtv3-hairline); }
.console-reference__contract h3 { color: var(--dtv3-ink-3); font-size: 9px; }
.console-reference__contract code { color: var(--dtv3-ink-2); }
.console-note { justify-content: space-between; gap: 12px; padding: 12px 2px 0; color: var(--dtv3-ink-3); background: transparent; border: 0; border-top: 1px solid var(--dtv3-hairline); border-radius: 0; font: 500 10px/1.6 var(--dt-mono); }
.console-note span:first-child { display: inline-flex; align-items: center; gap: 8px; color: var(--dtv3-ink-2); }
.console-note span:first-child.is-paired { color: var(--dtv3-sig); }
.console-note__lamp { display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: currentColor; }
@media (max-width: 900px) {
  .console-grid { grid-template-columns: 1fr; }
  .console-reference { padding-left: 0; padding-top: 20px; border-left: 0; border-top: 1px solid var(--dtv3-hairline); }
  .console-reference__detail { padding-left: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .console-reference__run { transition: none; }
  .dt-term__prompt::after { animation: none; }
}
[data-motion="reduced"] .console-reference__run { transition: none; }
[data-motion="reduced"] .dt-term__prompt::after { animation: none; }
`;

let consoleCssReady = false;

/** Injects the console stylesheet exactly once per document, at import time. */
function ensureConsoleCss(): void {
  if (consoleCssReady || typeof document === "undefined") return;
  consoleCssReady = true;
  const tag = document.createElement("style");
  tag.setAttribute("data-dt-console-pass", "");
  tag.textContent = CONSOLE_CSS;
  document.head.appendChild(tag);
}
ensureConsoleCss();

const DISPLAY = "var(--font-display, var(--dt-sans))";

/** the entrance stagger of the page: one orchestrated rise through the
 * engine .enter kit, the delay reading the --i custom prop (70ms steps). */
const step = (i: number) => ({ "--i": i }) as CSSProperties;

/** the .pagehead contract floor: the mono eyebrow, the Bricolage display
 * line (2–4 words) and the one-phrase lede — inline so the page top stands
 * before the shared r2-a grammar lands on the classes */
const containerStyle = {
  width: "100%",
  maxWidth: 1180,
  marginInline: "auto",
  padding: "24px clamp(24px, 4vw, 32px) 96px",
  display: "grid",
  alignContent: "start",
  gap: 40,
} as const;
const pageheadStyle = { display: "grid", gap: 14, padding: "56px 0 0" } as const;
const titleStyle = {
  margin: 0,
  font: `700 clamp(34px, 4.6vw, 60px)/1.04 ${DISPLAY}`,
  letterSpacing: "-.03em",
} as const;
const ledeStyle = { margin: 0, maxWidth: "52ch", color: "var(--dt-muted)", fontSize: 14, lineHeight: 1.75 } as const;

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
    <main className="control-page">
      <ShellChrome />
      <div className="page-container grain" style={containerStyle}>
        <header className="pagehead enter" style={{ ...pageheadStyle, ...step(0) }}>
          <p className="pagehead__eyebrow r2a-eyebrow">devthink · console</p>
          <h1 className="pagehead__title r2a-display" style={titleStyle}>
            the cli, drawn live
          </h1>
          <p className="pagehead__lede r2a-lede" style={ledeStyle}>
            The real boot banner, the prompt marker and the command registry — the canonical design of the devthink
            command line.
          </p>
        </header>

        <div className="console-grid">
          <div className="console-main shader-stage enter" style={step(1)}>
            {/* the ONE named light of the page: the phosphor lamp over the
                pane; the grain veil keeps the film on the glass */}
            <div className="shader-fallback r2a-console-light breathe" aria-hidden="true" />
            <div className="grain-overlay" aria-hidden="true" />
            <p className="r2a-kicker">
              01 · the terminal
              <b>{running ? "session live" : "booting"}</b>
            </p>
            <Terminal rows={rows} prompt={consoleprompt} state={termstate} enabled={running} oncommand={runcommand} />
            <p className="console-note">
              <span aria-live="polite" className={paired ? "is-paired" : undefined}>
                <i className="console-note__lamp live-dot" aria-hidden="true" />
                {paired ? "gateway: paired loopback detected" : "cli design reference · static catalog"}
              </span>
              <span>tab completes · ↑↓ history · enter runs</span>
            </p>
          </div>
          <aside className="console-reference enter" style={step(2)} aria-labelledby="consolereferencetitle">
            <p className="r2a-kicker">
              02 · command reference
              <b>{`${catalogcommands.length} commands`}</b>
            </p>
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
      </div>

      <footer className="control-page__footer">
        <TerminalSquare size={14} aria-hidden="true" />
        provider credentials stay in <code>~/.config/devthink/auth.json</code>
      </footer>
    </main>
  );
}
