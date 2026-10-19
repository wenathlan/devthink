/**
 * sandboxpane.tsx — the sandbox lane of the chat subapp: the saddle
 * virtual-hardware engine mounted beside the conversation through the
 * published library specifier — the engine logic (the state machine, the
 * boot dmesg, the dispatcher and the cpu/gpu catalogs) lives in
 * @wenathlan/saddle/sandbox and is never duplicated here. The pane mirrors
 * two house grammars: the session panel mount grammar (the caller mounts it
 * hidden, a rAF flips data-open so the Windows slide-cum-fade enter plays,
 * the exit stays mounted for the 200ms transition and a reopen reuses it)
 * and the console terminal grammar (a dark #1e1e1e log pane with the
 * boot/ok/err/cmdline row classes, the green prompt marker and the 44px
 * command well). Boot commits the default spec — the first cpu and the
 * first gpu of the engine catalogs, 8 vcpus, 32 gb ram, mig off, the
 * saddle console default — streams the dmesg lines one by one at the
 * saddle cadence and hands every typed line to the engine dispatcher,
 * which answers help, lscpu, cat, echo and the rest honestly. The sandbox
 * is ephemeral session state: closing the pane unmounts it and the engine
 * state dies with the component — nothing persists in chatstate.
 */

import {
  PanelRightContractRegular as PanelRightClose,
  PlayRegular as PlayGlyph,
  StopRegular as StopGlyph,
} from "@fluentui/react-icons";
import type { SandboxSpec, SandboxState } from "@wenathlan/saddle/sandbox";
import { bootSequence, commands, cpudata, createSandboxState, dispatch, gpudata } from "@wenathlan/saddle/sandbox";
import { type FormEvent, type KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import { osAppLabels } from "../../catalog.ts";

/** one rendered log row; cls mirrors the boot, ok, err and cmdline row
 * classes the console terminal carries. */
export type SandboxRow = { id: number; text: string; cls: string };

/** the lamp status of the pane: halted before boot, booting while the dmesg
 * streams, running once the engine dispatcher answers. */
export type SandboxStatus = "halted" | "booting" | "running";

/** the engine family identity of the pane (the catalog label row, never a
 * hardcoded literal — the bare id keeps the mark honest when the row is
 * missing). */
const SADDLE_LABEL = osAppLabels().saddle;

/** the default spec mirrors the saddle console page: the first cpu and the
 * first gpu of the engine catalogs, 8 vcpus, 32 gb ram, mig off — the pane
 * reads every hardware identity from the engine catalogs. */
const DEFAULT_SPEC: SandboxSpec = {
  model: cpudata[0].model,
  vcpus: 8,
  ramgb: 32,
  gpu: gpudata[0].id,
  mig: "off",
};

/** the sleep that animates the boot dmesg line by line (the saddle cadence
 * the console page streams at — the one adapter this pane owns). */
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * SandboxPane — the sandbox lane of the chat body.
 *
 * @param open whether the pane is visible (drives the slide-cum-fade).
 * @param onClose collapses the pane (the caller unmounts after the exit).
 * @param swap body-swap mode (the narrow viewport or the embedded window):
 * the pane fills the conversation stage instead of docking as a lane.
 * @param onRunningChange reports the engine lamp to the composer chip.
 */
export function SandboxPane({
  open,
  onClose,
  swap,
  onRunningChange,
}: {
  open: boolean;
  onClose: () => void;
  swap?: boolean;
  onRunningChange?: (running: boolean) => void;
}) {
  const paneid = useId();
  const rowseq = useRef(0);
  const paneref = useRef<HTMLElement | null>(null);
  const engineref = useRef<SandboxState | null>(null);
  const cancelref = useRef(false);
  const outref = useRef<HTMLPreElement>(null);
  const inputref = useRef<HTMLInputElement>(null);
  const historyref = useRef<string[]>([]);
  const historyindex = useRef(-1);
  const [rows, setRows] = useState<SandboxRow[]>([]);
  const [status, setStatus] = useState<SandboxStatus>("halted");
  const [booted, setBooted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [prompt, setPrompt] = useState("root@saddle:~#");
  const [value, setValue] = useState("");
  const running = status === "running";

  // the boot loop stops painting the moment the pane leaves the tree
  useEffect(() => {
    cancelref.current = false;
    return () => {
      cancelref.current = true;
    };
  }, []);

  // the lamp reaches the composer chip while the pane is mounted
  useEffect(() => {
    onRunningChange?.(running);
  }, [onRunningChange, running]);

  /** keeps the log pinned to the newest row (the row count drives the scroll). */
  const rowcount = rows.length;
  useEffect(() => {
    const out = outref.current;
    if (out !== null && rowcount > 0) out.scrollTop = out.scrollHeight;
  }, [rowcount]);

  /** appends one row with the console row classes (boot, ok, err, cmdline).
   * The id is captured into a const BEFORE the updater: the updater must
   * stay pure (React may invoke it twice in dev), so it can never read the
   * live ref — the saddle console prints through the same capture. */
  const printrow = (text: string, cls: string) => {
    rowseq.current += 1;
    const id = rowseq.current;
    setRows((prev) => [...prev, { id, text, cls }]);
  };

  /** true while the focus sits inside the pane (the post-boot focus handoff
   * never steals a focus that left the lane). */
  const panehasfocus = () => {
    const pane = paneref.current;
    return pane !== null && document.activeElement !== null && pane.contains(document.activeElement);
  };

  /** boots the sandbox: the default spec commit, the animated dmesg, then
   * the engine dispatcher answers — the flow the saddle console runs. */
  const bootsandbox = async () => {
    if (busy) return;
    setBusy(true);
    setStatus("booting");
    setBooted(true);
    setRows([]);
    const state = createSandboxState(DEFAULT_SPEC);
    engineref.current = state;
    setPrompt(`root@${state.hostname}:~#`);
    printrow(`saddle sandbox booting (${state.model}, ${state.vcpus} vcpus, ${state.ramgb} gb, ${state.gpu})`, "boot");
    const lines = bootSequence(DEFAULT_SPEC.model, state.vcpus, DEFAULT_SPEC.ramgb, DEFAULT_SPEC.gpu);
    for (const bootline of lines) {
      if (cancelref.current) return;
      printrow(bootline, "boot");
      await sleep(28 + Math.random() * 34);
    }
    if (cancelref.current) return;
    printrow('ok: sandbox running. type "help" for the command list.', "ok");
    setStatus("running");
    setBusy(false);
    if (panehasfocus()) window.requestAnimationFrame(() => inputref.current?.focus());
  };

  /** stops the sandbox: the engine state drops with this pane session. */
  const stopsandbox = () => {
    if (!running) return;
    engineref.current = null;
    setStatus("halted");
    printrow("sandbox stopped; snapshot-less teardown complete.", "boot");
  };

  /** runs one command through the engine dispatcher — the clear flag wipes
   * the log and the exit code picks the ok or err row class. */
  const runcommand = (raw: string) => {
    printrow(`${prompt} ${raw}`, "cmdline");
    const engine = engineref.current;
    const result = engine !== null ? dispatch(raw, engine) : { output: "the sandbox is not running", exitCode: 1 };
    if (result.clear === true) {
      setRows([]);
      return;
    }
    if (result.output.length > 0) printrow(result.output, result.exitCode === 0 ? "ok" : "err");
  };

  const onsubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!running) return;
    const trimmed = value.trim();
    setValue("");
    if (trimmed.length === 0) return;
    historyref.current.push(trimmed);
    historyindex.current = historyref.current.length;
    runcommand(trimmed);
  };

  /** the arrow keys browse the command history, tab completes over the
   * engine command list (the console input grammar). */
  const onkeydown = (event: KeyboardEvent<HTMLInputElement>) => {
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
      const matches = commands.filter((command) => command.startsWith(prefix));
      if (matches.length === 1 && matches[0] !== undefined) setValue(matches[0]);
    }
  };

  /** the output pane answers the keyboard too: enter and space focus the
   * command input the way the click does (the console log grammar). */
  const onoutkeydown = (event: KeyboardEvent<HTMLPreElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (running) inputref.current?.focus();
    }
  };

  const inputid = `${paneid}in`;

  return (
    <aside
      ref={paneref}
      className="dtc-sb"
      data-open={open ? "true" : "false"}
      data-swap={swap ? "true" : "false"}
      aria-hidden={!open}
      aria-label="Sandbox"
    >
      <div className="dtc-sb__head">
        <h2>Sandbox</h2>
        <span className="dtc-sb__engine">{SADDLE_LABEL?.name?.toLowerCase() ?? "saddle"}</span>
        <p className="dtc-sb__lamp" data-state={status} role="status">
          <i className="dtc-sb__dot" aria-hidden="true" />
          {status}
        </p>
        <button
          type="button"
          className="dtc-tb-btn"
          onClick={onClose}
          aria-label="Close sandbox pane"
          title="Close pane"
          tabIndex={open ? 0 : -1}
        >
          <PanelRightClose fontSize={18} aria-hidden="true" />
        </button>
      </div>

      <p className="dtc-sb__spec">
        {DEFAULT_SPEC.model} · {DEFAULT_SPEC.vcpus} vcpus · {DEFAULT_SPEC.ramgb} gb · {gpudata[0].name}
      </p>

      <pre
        className="dtc-sb__out"
        role="log"
        aria-live="polite"
        aria-label="Sandbox boot and command output"
        ref={outref}
        tabIndex={open ? 0 : -1}
        onClick={() => {
          if (running) inputref.current?.focus();
        }}
        onKeyDown={onoutkeydown}
      >
        {rows.map((row) => (
          <span key={row.id} className={row.cls === "" ? undefined : row.cls}>
            {row.text}
          </span>
        ))}
        {!booted ? <span className="boot">sandbox halted — boot to start the microvm.</span> : null}
      </pre>

      <form className={running ? "dtc-sb__in" : "dtc-sb__in off"} onSubmit={onsubmit}>
        <label className="dtc-sb__prompt" htmlFor={inputid}>
          {prompt}
        </label>
        <input
          id={inputid}
          ref={inputref}
          className="dtc-sb__input"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label="Run a sandbox command"
          disabled={!running}
          value={value}
          tabIndex={open ? 0 : -1}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={onkeydown}
        />
      </form>

      <div className="dtc-sb__actions">
        <button
          type="button"
          className="dtc-sb__btn dtc-sb__btn--boot"
          onClick={() => {
            void bootsandbox();
          }}
          disabled={busy || running}
          tabIndex={open ? 0 : -1}
        >
          <PlayGlyph fontSize={15} aria-hidden="true" />
          Boot
        </button>
        <button
          type="button"
          className="dtc-sb__btn"
          onClick={stopsandbox}
          disabled={!running}
          tabIndex={open ? 0 : -1}
        >
          <StopGlyph fontSize={15} aria-hidden="true" />
          Stop
        </button>
      </div>
    </aside>
  );
}
