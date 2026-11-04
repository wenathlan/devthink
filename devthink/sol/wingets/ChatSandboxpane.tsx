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
 * state dies with the component — nothing persists in chatstate. The
 * w5-a tool bridge: while the lane is open and the engine runs, the pane
 * hands its command executor to the chat body through onBridgeChange so
 * the thread's sandbox tool calls dispatch through the same engine lane
 * — the executor answers null whenever the lane closes or the engine
 * halts, so the bridge never fabricates a result. The client-first lane:
 * every boot and every command tries the real server lane first through
 * sandboxclient.ts (the sandbox routes of server.ts) — a server answer
 * renders its rows exactly like the local ones with the exit code
 * honored, and a null answer falls back to the browser-pure simulator
 * with the honest offline row printed once per pane session: the lane
 * answers locally, the deployed copy carries the server lane.
 */

import {
  PanelRightContractRegular as PanelRightClose,
  PlayRegular as PlayGlyph,
  StopRegular as StopGlyph,
} from "@fluentui/react-icons";
import type { SandboxSpec, SandboxState } from "@wenathlan/saddle/sandbox";
import { bootSequence, commands, cpudata, createSandboxState, dispatch, gpudata } from "@wenathlan/saddle/sandbox";
import { type FormEvent, type KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import { chatLimit, chatText } from "../../chatlabels.ts";
import { boot as sandboxboot, modalities as sandboxmodalities, run as sandboxrun } from "../../gateway.ts";
import { compactToken } from "../../queue.ts";

/** one rendered log row; cls mirrors the boot, ok, err and cmdline row
 * classes the console terminal carries. */
export type SandboxRow = { id: number; text: string; cls: string };

/** the lamp status of the pane: halted before boot, booting while the dmesg
 * streams, running once the engine dispatcher answers. */
export type SandboxStatus = "halted" | "booting" | "running";

/** one vfs change the engine wrote while a bridge command ran: the before
 * and after buffers of a workspace file (after null reads as the file
 * leaving the workspace). */
export type SandboxFileChange = { path: string; before: string; after: string | null };

/** the bridge answer of one dispatched command: the engine result fields
 * plus the vfs change list the diff view renders. */
export type SandboxRunResult = {
  output: string;
  exitCode: number;
  clear: boolean;
  changes: SandboxFileChange[];
};

/** the executor the pane hands the thread bridge: one command in, the
 * honest lane answer out — the local engine answers in place, the server
 * lane answers through the sandbox client (a promise), and null while the
 * lane closes or the pane unmounts, so the bridge never invents a
 * result. */
export type SandboxRunner = (command: string) => SandboxRunResult | null | Promise<SandboxRunResult | null>;

/** the honest offline row — the one declaration a fallen lane makes: the
 * pane answers locally from here on and the deployed copy carries the
 * server lane. It prints once per pane session, never per command. */
const OFFLINE_ROW = "offline — running locally. connect to enable the full suite.";

/** newsessionid — the ephemeral per-pane session id of the server lane:
 * the route gate form (letters, digits and dashes, four to sixty four
 * chars) built from the webcrypto well the house ids ride; the id lives in
 * this pane mount only — no storage anywhere. */
const newsessionid = (): string => {
  const draw = [Date.now().toString(36), compactToken().slice(0, 10)].join("");
  return ["sb", draw].join("-");
};

/** the default spec mirrors the saddle console page: the first cpu and the
 * first gpu of the engine catalogs, the table's default vcpus and ram, mig
 * off — the pane reads every hardware identity from the engine catalogs. */
const DEFAULT_SPEC: SandboxSpec = {
  model: cpudata[0].model,
  vcpus: chatLimit("sandboxDefaultVcpus"),
  ramgb: chatLimit("sandboxDefaultRamGb"),
  gpu: gpudata[0].id,
  mig: "off",
};

/** snapshotFiles — the honest vfs snapshot for the diff view: one content
 * pair per workspace file of the live engine state (an empty map while
 * the engine is halted — nothing pretends to exist). */
const snapshotFiles = (engine: SandboxState | null): Map<string, string> => {
  const snap = new Map<string, string>();
  if (engine === null) return snap;
  for (const [path, file] of engine.files) snap.set(path, file.content);
  return snap;
};

/** vfsChanges — the before/after comparison of one dispatch: every born
 * or changed file carries both buffers, every deleted file answers its
 * old content with after null (the diff view reads exactly these rows). */
const vfsChanges = (before: Map<string, string>, after: Map<string, string>): SandboxFileChange[] => {
  const changes: SandboxFileChange[] = [];
  for (const [path, content] of after) {
    if (!before.has(path) || before.get(path) !== content) {
      changes.push({ path, before: before.get(path) ?? "", after: content });
    }
  }
  for (const [path, content] of before) {
    if (!after.has(path)) changes.push({ path, before: content, after: null });
  }
  return changes;
};

/**
 * SandboxPane — the sandbox lane of the chat body.
 *
 * @param open whether the pane is visible (drives the slide-cum-fade).
 * @param onClose collapses the pane (the caller unmounts after the exit).
 * @param swap body-swap mode (the narrow viewport or the embedded window):
 * the pane fills the conversation stage instead of docking as a lane.
 * @param onRunningChange reports the engine lamp to the composer chip.
 * @param onBridgeChange the w5-a thread bridge handoff: the pane registers
 * its command executor while the lane is open and the engine runs, and
 * null whenever either falls — the caller holds the last registration.
 */
export function SandboxPane({
  open,
  onClose,
  swap,
  onRunningChange,
  onBridgeChange,
}: {
  open: boolean;
  onClose: () => void;
  swap?: boolean;
  onRunningChange?: (running: boolean) => void;
  onBridgeChange?: (runner: SandboxRunner | null) => void;
}) {
  const paneid = useId();
  const rowseq = useRef(0);
  const paneref = useRef<HTMLElement | null>(null);
  const engineref = useRef<SandboxState | null>(null);
  /** the lane state of this pane session: idle before the first boot,
   * server while the sandbox client answers, local once the honest
   * offline row declared the fallback. */
  const laneref = useRef<"idle" | "server" | "local">("idle");
  /** the ephemeral server session id — generated once per pane mount,
   * dies with the component (the server jail outlives it, the pane does
   * not persist it anywhere). */
  const sessionref = useRef(newsessionid());
  /** the offline declaration — the row prints once per pane session,
   * never per command. */
  const offlineref = useRef(false);
  const cancelref = useRef(false);
  const outref = useRef<HTMLPreElement>(null);
  const inputref = useRef<HTMLInputElement>(null);
  const historyref = useRef<string[]>([]);
  const historyindex = useRef(-1);
  const [rows, setRows] = useState<SandboxRow[]>([]);
  const [status, setStatus] = useState<SandboxStatus>("halted");
  const [booted, setBooted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [prompt, setPrompt] = useState(chatText("sb.prompt"));
  /** the prompt mirror: the bridge executor is captured once at
   * registration, so it reads the live prompt through the ref — never a
   * stale state closure. */
  const promptref = useRef(chatText("sb.prompt"));
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

  /** declarelane — the honest lane fall: the pane answers locally from
   * this call on. A local engine boots when none stands yet (the server
   * lane never created one) and the offline row prints once per pane
   * session, never per command — the fallback is declared, never silent. */
  const declarelane = () => {
    laneref.current = "local";
    if (engineref.current === null) engineref.current = createSandboxState(DEFAULT_SPEC);
    if (!offlineref.current) {
      offlineref.current = true;
      printrow(OFFLINE_ROW, "boot");
    }
  };

  /** boots the sandbox: the intro row, then the lane decision — the real
   * server session first (the sandbox client, the routes of server.ts)
   * and its rows verbatim when it answers, else the offline declaration
   * and the simulator path: the default spec commit, the animated dmesg,
   * then the engine dispatcher answers — the flow the saddle console
   * runs. */
  const bootsandbox = async () => {
    if (busy) return;
    setBusy(true);
    setStatus("booting");
    setBooted(true);
    setRows([]);
    printrow(`sandbox booting — ${DEFAULT_SPEC.vcpus} vCPUs · ${DEFAULT_SPEC.ramgb} GB · ${DEFAULT_SPEC.gpu}`, "boot");
    const sessionrows = await sandboxboot(sessionref.current);
    if (cancelref.current) return;
    if (sessionrows !== null) {
      laneref.current = "server";
      for (const row of sessionrows) printrow(row, "boot");
      printrow(chatText("sb.running"), "ok");
      setStatus("running");
      setBusy(false);
      if (panehasfocus()) window.requestAnimationFrame(() => inputref.current?.focus());
      return;
    }
    declarelane();
    const state = createSandboxState(DEFAULT_SPEC);
    engineref.current = state;
    const banner = chatText("sb.prompt");
    setPrompt(banner);
    promptref.current = banner;
    const lines = bootSequence(DEFAULT_SPEC.model, state.vcpus, DEFAULT_SPEC.ramgb, DEFAULT_SPEC.gpu);
    for (const bootline of lines) {
      if (cancelref.current) return;
      printrow(bootline, "boot");
    }
    if (cancelref.current) return;
    printrow(chatText("sb.running"), "ok");
    setStatus("running");
    setBusy(false);
    if (panehasfocus()) window.requestAnimationFrame(() => inputref.current?.focus());
  };

  /** stops the sandbox: the lane state drops with this pane session (the
   * next boot asks the server lane first again). */
  const stopsandbox = () => {
    if (!running) return;
    engineref.current = null;
    laneref.current = "idle";
    setStatus("halted");
    printrow(chatText("sb.stopped"), "boot");
  };

  /** execlocal — the local half of the executor: the vfs snapshots wrap
   * the engine dispatch — the diff view answers the buffers the engine
   * really wrote — the exit code picks the ok or err row class, and the
   * clear flag wipes the log (the cmdline row printed before this runs). */
  const execlocal = (raw: string): SandboxRunResult => {
    const engine = engineref.current;
    const before = snapshotFiles(engine);
    const result = engine !== null ? dispatch(raw, engine) : { output: "the sandbox is not running", exitCode: 1 };
    const changes = vfsChanges(before, snapshotFiles(engine));
    if (result.clear === true) {
      setRows([]);
      return { output: result.output, exitCode: result.exitCode, clear: true, changes };
    }
    if (result.output.length > 0) printrow(result.output, result.exitCode === 0 ? "ok" : "err");
    return { output: result.output, exitCode: result.exitCode, clear: false, changes };
  };

  /** execlane — the one honest executor behind both surfaces of the
   * pane: the command well and the w5-a thread bridge. The cmdline row
   * prints first (the live prompt rides the ref so a captured executor
   * never goes stale), then the lane decides: a live server lane answers
   * through the sandbox client — the real rows rendered exactly like the
   * local ones, the exit code honored, the run tool riding the dedicated
   * modalities route — and a null answer falls to the local engine
   * through declarelane, the offline row already printed once per pane
   * session. The lane fell with the pane gone answers null (the bridge
   * never fabricates a result). */
  const execlane = async (raw: string): Promise<SandboxRunResult | null> => {
    printrow(`${promptref.current} ${raw}`, "cmdline");
    if (laneref.current === "server") {
      const tool = (raw.trim().split(/\s+/)[0] ?? "").toLowerCase();
      if (tool === "run") {
        const rows = await sandboxmodalities();
        if (rows !== null && !cancelref.current) {
          const output = rows.join("\n");
          if (output.length > 0) printrow(output, "ok");
          return { output, exitCode: 0, clear: false, changes: [] };
        }
      } else {
        const answer = await sandboxrun(sessionref.current, raw);
        if (answer !== null && !cancelref.current) {
          if (answer.tool === "clear") {
            setRows([]);
            return { output: "", exitCode: answer.exitcode, clear: true, changes: [] };
          }
          const output = answer.rows.map((row) => row.line).join("\n");
          if (output.length > 0) printrow(output, answer.exitcode === 0 ? "ok" : "err");
          return { output, exitCode: answer.exitcode, clear: false, changes: [] };
        }
      }
      declarelane();
    }
    return execlocal(raw);
  };

  // the w5-a thread bridge: while the lane is open and the engine runs,
  // the pane hands its executor to the body — the lane stays the only
  // dispatcher, and every command rides the same client-first path the
  // command well runs (the server lane answers through the sandbox
  // client, the local engine answers in place). A closed lane or an
  // unmounted pane answers null so a round's fenced blocks render as
  // plain markdown instead of work rows.
  // biome-ignore lint/correctness/useExhaustiveDependencies: the registered executor reads the lane, engine and prompt refs and writes through the stable setRows — its render closure never goes stale, so the registration keys on the lane state and the lamp alone
  useEffect(() => {
    if (onBridgeChange === undefined) return undefined;
    if (!open || !running) {
      onBridgeChange(null);
      return undefined;
    }
    onBridgeChange((command: string) => {
      if (cancelref.current) return null;
      return execlane(command);
    });
    return () => onBridgeChange(null);
  }, [onBridgeChange, open, running]);

  const onsubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!running) return;
    const trimmed = value.trim();
    setValue("");
    if (trimmed.length === 0) return;
    historyref.current.push(trimmed);
    historyindex.current = historyref.current.length;
    void execlane(trimmed);
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
        <span className="dtc-sb__engine">sandbox</span>
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
        {!booted ? <span className="boot">{chatText("sb.halted")}</span> : null}
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
