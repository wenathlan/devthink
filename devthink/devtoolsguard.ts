// # devtoolsguard — the aggressive devtools wall of the os (root layer,
// the outros.akash law made stronger): the visitor's console never opens a
// window into the platform data. Three prongs, one module:
// 1. the debugger trap — the interval rides the debugger statement, any
//    attached devtools pauses the loop and the wall answers (blank the
//    surface, sever the session calls) while the trap holds;
// 2. the size threshold — the console object answer of a styled %c string
//    changes measure the moment devtools renders it (the detector the
//    devtools-detector reference rides, reimplemented tight);
// 3. the shortcut wall — the f12, ctrl+shift+i/j/c and the context menu
//    refused on the platform surface.
// The guard arms ONLY in production builds (import.meta.env.DEV stays
// honest — the developer machine keeps its tools) and every prong is
// installed lazily, never blocking the first paint. Pure browser module:
// zero storage, zero network.

/** Whether the guard is armed in this build (never on the dev machine). */
export function guardarmed(): boolean {
  try {
    return import.meta.env.PROD === true;
  } catch {
    return false;
  }
}

/** The wall state the prongs share (the surface clears while the trap holds). */
const state = { tripped: false, suspended: false };

/** The listeners the wall answers with (the app registers its own reaction). */
type triplistener = () => void;
const listeners = new Set<triplistener>();

/**
 * Registers one reaction to a trip (blank the surface, sever the calls).
 *
 * @param listener the reaction.
 * @returns the unregister function.
 */
export function ondevtoolstrip(listener: triplistener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Fires the wall once (the prongs converge here). */
function trip(): void {
  if (state.tripped) return;
  state.tripped = true;
  for (const listener of listeners) {
    try {
      listener();
    } catch {
      /* a listener failure never stops the wall */
    }
  }
}

/** The debugger trap: one interval walking the statement, the attached
 * debugger freezes the tick (the prong the akash reference rides). */
function armdebuggertrap(intervalms: number): void {
  const tick = (): void => {
    if (state.suspended) return;
    // the wall clock answers the pause: a tick that takes far longer than
    // its interval means a debugger held it — the trap trips
    const before = Date.now();
    // eslint-disable-next-line no-debugger
    debugger;
    if (Date.now() - before > intervalms + 60) trip();
  };
  setInterval(tick, intervalms);
}

/** The size threshold: devtools renders the styled object and the console
 * answer grows — the detector reimplemented tight. */
function armsizethreshold(): void {
  const probe = /./;
  const answer = new Map<string, unknown>();
  probe.toString = function (this: RegExp): string {
    answer.set("answer", "probe");
    trip();
    return "";
  };
  setInterval(() => {
    if (state.suspended) return;
    answer.clear();
    try {
      // the devtools session renders the regex and the getter fires
      console.log("%c", probe);
    } catch {
      /* the console refused: not a trip */
    }
    answer.clear();
  }, 1500);
}

/** The shortcut wall: f12, the ctrl+shift trio and the context menu. */
function armshortcuts(): void {
  const blockedkeys = new Set(["F12", "I", "J", "C", "U"]);
  window.addEventListener(
    "keydown",
    (event) => {
      if (state.suspended) return;
      if (blockedkeys.has(event.key) && (event.key === "F12" || (event.ctrlKey && event.shiftKey))) {
        event.preventDefault();
        event.stopPropagation();
        trip();
      }
    },
    { capture: true },
  );
  window.addEventListener(
    "contextmenu",
    (event) => {
      if (state.suspended) return;
      event.preventDefault();
    },
    { capture: true },
  );
}

/**
 * Arms the wall (the boot calls once; the prongs install lazily and only
 * in production builds — the dev machine keeps its tools).
 *
 * @param options the suspend seam for the first-party flows and the trap
 * interval override (tests ride both).
 * @returns the disarm function (the os's own settings can suspend it).
 */
export function armdevtoolsguard(options?: { suspend?: boolean; intervalms?: number }): () => void {
  if (!guardarmed()) return () => undefined;
  if (options?.suspend) state.suspended = true;
  const intervalms = options?.intervalms ?? 1200;
  armdebuggertrap(intervalms);
  armsizethreshold();
  armshortcuts();
  return () => {
    state.suspended = true;
  };
}

/** The trip state the boot and the app read (the wall answer). */
export function devtoolstripped(): boolean {
  return state.tripped;
}
