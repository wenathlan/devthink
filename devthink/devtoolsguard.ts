/**
 * devtoolsguard — THE devtools wall of the os (root layer, dot-free, the
 * honest 2026 form the akash study validates). One module owns the two
 * detection prongs that still catch a competent visitor and the one trip
 * response the visitor deserves:
 *
 * 1. the debugger timing trap — a bracketed `debugger` statement whose
 *    wall-clock gap answers when an attached devtools pauses it. The trap
 *    rides a duty cycle (a burst of ticks, then a rest of the same
 *    length) so the wall costs almost nothing between bursts, and every
 *    tick checks the suspend seam first: suspended, the wall parks and
 *    never loops.
 * 2. the console-getter probe — a RegExp whose overridden toString only a
 *    rendering devtools console invokes. The module NEVER reads the
 *    override itself (the self-read form of the old shield tripped on
 *    every boot); the probe is only ever handed to console.log.
 *
 * The window-size heuristic is deliberately absent: browser zoom, edge
 * split screens and snapped windows all impersonate docked devtools — it
 * is the false-positive factory the study refuses. The trip response is
 * a fixed Sol-styled interstitial APPENDED to the body (house tokens,
 * label-catalog copy, the motion law respected) — never a DOM wipe,
 * never a freeze loop, never a history flood. The wall arms only in
 * production builds (the dev machine keeps its tools); the owner
 * suspends it through the personalization channel (the settings toggle
 * row), default on. Pure browser module: zero storage, zero network —
 * the strike report and the ban question live in guard.ts.
 *
 * @section buildgate the production gate (the dev machine keeps its tools)
 * @section state the shared wall state and the status reader
 * @section listeners the trip listeners (the app registers its reaction)
 * @section duty the duty-cycle engine both prongs ride (pausable)
 * @section trap the debugger timing trap (bracketed, pause budget)
 * @section probe the console-getter probe (no self reads)
 * @section response the trip response — the interstitial, never a wipe
 * @section trip the trip convergence (the prongs meet here, once)
 * @section surface install / suspend / listener surface (the toggle seam)
 * @depends-on oslabels.ts (the interstitial copy rows), Sol/sol.css §AA (the wall skin)
 * @consumed-by App.tsx (the arm site), Sol/widgets/SettingsPersonalstore.ts (the owner toggle)
 */

import { osText } from "./oslabels.ts";

/* ------------------------------- buildgate ------------------------------- */

/** The trap interval the study keeps: akash's 50 ms polling buys no extra
 * detection and costs battery; 1200 ms catches the same pauses a held
 * debugger statement produces. */
const TRAPINTERVALMS = 1200;

/** The pause budget over one trap interval: a synchronous tick without an
 * attached debugger costs microseconds, so the budget only absorbs clock
 * jitter — anything past it is a held pause. */
const PAUSEBUDGETMS = 60;

/** The duty cycle: BURSTTICKS consecutive active ticks, then a rest of
 * the same wall-clock length — the wall listens half the time and idles
 * the other half (the battery law of the study's verdict). */
const BURSTTICKS = 4;

/** The interstitial element id (the tests pin it, the stylesheet skins
 * it, the module never touches any other element). */
const WALLID = "dtdevtoolswall";

/**
 * Whether the wall is armed in this build — never on the dev machine.
 *
 * @returns true only on production builds.
 */
export function guardarmed(): boolean {
  try {
    return import.meta.env.PROD === true;
  } catch {
    return false;
  }
}

/* --------------------------------- state --------------------------------- */

/** The wall state the prongs share: armed (installed on this build),
 * suspended (the owner toggle seam — true parks every loop), tripped
 * (the wall answered once) and the interval the install settled on. */
type wallstate = { armed: boolean; suspended: boolean; tripped: boolean; intervalms: number };
const state: wallstate = { armed: false, suspended: false, tripped: false, intervalms: TRAPINTERVALMS };

/** The status snapshot the boot, the app and the settings row read. */
export type devtoolswallstatus = { armed: boolean; suspended: boolean; tripped: boolean };

/**
 * The status reader (the settings toggle and the tests read it; nothing
 * mutates through it).
 *
 * @returns the armed / suspended / tripped snapshot of the wall.
 */
export function devtoolsguardstatus(): devtoolswallstatus {
  return { armed: state.armed, suspended: state.suspended, tripped: state.tripped };
}

/**
 * The trip state the boot and the app read (the wall answer).
 *
 * @returns true once a prong has tripped.
 */
export function devtoolstripped(): boolean {
  return state.tripped;
}

/* ------------------------------- listeners ------------------------------- */

/** The listeners the wall answers with (the app registers its own
 * reaction — the strike report of guard.ts rides this seam). */
type triplistener = (signal: string) => void;
const listeners = new Set<triplistener>();

/**
 * Registers one reaction to a trip (the listener receives the dotted
 * signal id of the prong that tripped).
 *
 * @param listener the reaction.
 * @returns the unregister function.
 */
export function ondevtoolstrip(listener: triplistener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/* ---------------------------------- duty --------------------------------- */

/** The one timer handle of the wall: parked is null, running is a
 * scheduled tick — the wall never leaks a second loop. */
let looptimer: ReturnType<typeof setTimeout> | null = null;

/** Parks the duty cycle (the suspend seam and the trip call this — a
 * suspended wall never loops). */
function parkloop(): void {
  if (looptimer !== null) {
    clearTimeout(looptimer);
    looptimer = null;
  }
}

/** Runs the duty cycle: each active tick walks the trap, every second
 * active tick also feeds the console probe, and after the burst the
 * cycle rests the same wall-clock length before the next burst. */
function runloop(): void {
  parkloop();
  const tick = (active: number): void => {
    if (!state.armed || state.suspended || state.tripped) {
      looptimer = null;
      return;
    }
    walktrap();
    if (active % 2 === 0) feedprobe();
    const rest = active === BURSTTICKS - 1 ? state.intervalms * BURSTTICKS : 0;
    const next = (active + 1) % BURSTTICKS;
    looptimer = setTimeout(() => tick(next), state.intervalms + rest);
  };
  looptimer = setTimeout(() => tick(0), state.intervalms);
}

/* ---------------------------------- trap --------------------------------- */

/** The debugger timing trap: the brackets hug the statement, so the
 * measured gap is only the pause an attached devtools holds — the
 * setTimeout overshoot of the duty cycle sits outside the brackets and
 * never counts. */
function walktrap(): void {
  const before = Date.now();
  // eslint-disable-next-line no-debugger
  debugger;
  if (Date.now() - before > state.intervalms + PAUSEBUDGETMS) trip("debugger.trap");
}

/* --------------------------------- probe --------------------------------- */

/** The console-getter probe (created once per install): devtools renders
 * the logged RegExp through the overridden toString — nothing else ever
 * calls it. */
let consoleprobe: RegExp | null = null;

/** Builds the probe. The override only trips when a rendering console
 * formats the value; the module itself never reads the probe's strings —
 * never stringifies it, never templates it (the self-read form of the old
 * shield blanked production on every boot). */
function makeconsoleprobe(): RegExp {
  const probe = /devthink/;
  probe.toString = () => {
    trip("console.getter");
    return "";
  };
  return probe;
}

/** Hands the probe to the console: the log line itself never trips
 * anything, only a rendering devtools panel invoking the override does. */
function feedprobe(): void {
  if (!consoleprobe) return;
  try {
    console.log("%c", consoleprobe);
  } catch {
    /* the console refused: not a trip */
  }
}

/* -------------------------------- response ------------------------------- */

/**
 * The interstitial element id (the stable answer of the trip response —
 * the tests pin it and the stylesheet skins it).
 *
 * @returns the fixed overlay id.
 */
export function devtoolswallid(): string {
  return WALLID;
}

/**
 * The trip response: one fixed overlay appended to the body, carrying
 * the house tokens and the label-catalog copy. Append-only by law — the
 * live surface keeps every child it has (the router and the chat state
 * stay mounted; a wipe is the one thing this wall never does). Idempotent:
 * a second call finds the standing wall and answers its id.
 *
 * @returns the wall element id, or null where no document exists (the
 * node runtime — the response is a safe no-op there).
 */
export function showdevtoolsinterstitial(): string | null {
  if (typeof document === "undefined") return null;
  if (document.getElementById(WALLID)) return WALLID;
  const wall = document.createElement("div");
  wall.id = WALLID;
  wall.className = "dt-devtools-wall";
  wall.setAttribute("role", "alertdialog");
  wall.setAttribute("aria-modal", "true");
  wall.setAttribute("aria-label", osText("guard.wall.aria"));
  const mark = document.createElement("div");
  mark.className = "dt-devtools-wall__mark";
  const title = document.createElement("h2");
  title.className = "dt-devtools-wall__title";
  title.textContent = osText("guard.wall.title");
  const body = document.createElement("p");
  body.className = "dt-devtools-wall__body";
  body.textContent = osText("guard.wall.body");
  const note = document.createElement("p");
  note.className = "dt-devtools-wall__note";
  note.textContent = osText("guard.wall.note");
  wall.append(mark, title, body, note);
  // the motion law rides the document root attribute; the wall carries
  // its own copy so the guard holds wherever it lands
  if (document.documentElement.dataset.motion === "reduced") wall.dataset.motion = "reduced";
  document.body.appendChild(wall);
  return WALLID;
}

/* ---------------------------------- trip --------------------------------- */

/** Fires the wall once (the prongs converge here): the duty cycle parks
 * (the wall answered — no further polling, the study's rest-after-trip),
 * the interstitial stands, then the listeners answer. */
function trip(signal: string): void {
  if (state.tripped) return;
  state.tripped = true;
  parkloop();
  showdevtoolsinterstitial();
  for (const listener of listeners) {
    try {
      listener(signal);
    } catch {
      /* a listener failure never stops the wall */
    }
  }
}

/* -------------------------------- surface -------------------------------- */

/**
 * Installs the wall (the boot calls once before the first render). Only
 * production builds arm; an explicit suspend option parks the prongs at
 * once, and a suspension already standing (the personalization channel
 * applied on boot) is always respected — install never un-suspends.
 *
 * @param options the suspend seam for the first-party flows and the trap
 * interval override (tests ride both).
 * @returns the disarm function (flips the suspend seam and parks every
 * loop — the os's own settings can call it).
 */
export function installdevtoolsguard(options?: { suspend?: boolean; intervalms?: number }): () => void {
  if (!guardarmed()) return () => undefined;
  state.intervalms = options?.intervalms ?? TRAPINTERVALMS;
  if (!state.armed) {
    state.armed = true;
    consoleprobe = makeconsoleprobe();
  }
  if (options?.suspend) {
    state.suspended = true;
    parkloop();
  } else if (!state.suspended && !state.tripped) {
    runloop();
  }
  return () => {
    state.suspended = true;
    parkloop();
  };
}

/**
 * The suspend seam (the settings toggle rides it): true parks every prong
 * — no loop runs while suspended — and false lets the duty cycle run
 * again when the wall is armed and has not tripped. The seam answers on
 * every build so the toggle behaves the same in dev.
 *
 * @param suspended true suspends the wall, false re-arms it.
 */
export function suspenddevtoolsguard(suspended: boolean): void {
  state.suspended = suspended;
  if (suspended || state.tripped || !state.armed) {
    parkloop();
    return;
  }
  runloop();
}
