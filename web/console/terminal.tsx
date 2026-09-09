/**
 * console terminal — the interactive terminal pane of the cli design page.
 *
 * the absorption of the saddle console terminal grammar onto the devthink
 * materials: a dark log pane (role=log, polite aria-live) pinned to the
 * newest row, a command input with the real prompt marker, the arrow keys
 * browsing the command history, tab completion over the catalog and the
 * focus-on-click output pane. the terminal stays keyboard first: the input
 * autofocuses once the console runs, every touch target clears 44px and the
 * focus-visible ring stays strong for the tv d-pad.
 */
import { useEffect, useRef, useState } from "react";
import { completions } from "./commandcatalog";

/** one rendered output row; cls mirrors the boot, ok, err and cmdline row classes. */
export type TerminalRow = { id: number; text: string; cls: string };

/** the terminal lifecycle label shown in the bar. */
export type TerminalState = "halted" | "booting" | "running";

type TerminalProps = {
  rows: TerminalRow[];
  prompt: string;
  state: TerminalState;
  enabled: boolean;
  oncommand: (command: string) => void;
};

/** the virtual devthink terminal: the log pane, the command input and the status dots bar. */
export default function Terminal({ rows, prompt, state, enabled, oncommand }: TerminalProps) {
  const outref = useRef<HTMLPreElement>(null);
  const inputref = useRef<HTMLInputElement>(null);
  const historyref = useRef<string[]>([]);
  const historyindex = useRef(-1);
  const [value, setValue] = useState("");

  /** keep the output pinned to the newest row (the row count drives the scroll). */
  const rowcount = rows.length;
  useEffect(() => {
    const out = outref.current;
    if (out && rowcount > 0) out.scrollTop = out.scrollHeight;
  }, [rowcount]);

  /** focus the command input once the console runs. */
  useEffect(() => {
    if (enabled) inputref.current?.focus();
  }, [enabled]);

  const onsubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!enabled) return;
    const trimmed = value.trim();
    setValue("");
    if (trimmed.length === 0) return;
    historyref.current.push(trimmed);
    historyindex.current = historyref.current.length;
    oncommand(trimmed);
  };

  const onkeydown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (historyref.current.length === 0) return;
      historyindex.current = Math.max(0, historyindex.current - 1);
      setValue(historyref.current[historyindex.current] ?? "");
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      if (historyref.current.length === 0) return;
      historyindex.current = Math.min(historyref.current.length, historyindex.current + 1);
      setValue(historyref.current[historyindex.current] ?? "");
    } else if (event.key === "Tab") {
      event.preventDefault();
      const prefix = value.trim();
      if (prefix.length === 0) return;
      const matches = completions(prefix);
      if (matches.length === 1) setValue(matches[0] ?? "");
    }
  };

  /** the output pane answers the keyboard too: enter and space focus the input like the click does. */
  const onoutkeydown = (event: React.KeyboardEvent<HTMLPreElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      inputref.current?.focus();
    }
  };

  return (
    <section className="dt-term" aria-labelledby="dttermtitle">
      <div className="dt-term__bar">
        <span className="dt-term__dots" aria-hidden="true">
          <i className="dt-term__dot on" />
          <i className="dt-term__dot on" />
          <i className="dt-term__dot" />
        </span>
        <span id="dttermtitle">devthink — the terminal entry</span>
        <span className="dt-term__state" aria-live="polite">
          {state}
        </span>
      </div>
      <pre
        className="dt-term__out"
        role="log"
        aria-live="polite"
        aria-label="devthink console output"
        ref={outref}
        onClick={() => inputref.current?.focus()}
        onKeyDown={onoutkeydown}
      >
        {rows.map((row) => (
          <span key={row.id} className={row.cls === "" ? undefined : row.cls}>
            {row.text}
            {"\n"}
          </span>
        ))}
      </pre>
      <form className={enabled ? "dt-term__in" : "dt-term__in off"} onSubmit={onsubmit}>
        <label className="dt-term__prompt" htmlFor="dttermin">
          {prompt}
        </label>
        <input
          id="dttermin"
          ref={inputref}
          className="dt-term__input"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label="terminal command input; arrow keys browse history, tab completes"
          disabled={!enabled}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={onkeydown}
        />
      </form>
    </section>
  );
}
