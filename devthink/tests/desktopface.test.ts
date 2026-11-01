/**
 * desktopface.test.ts — the Windows desktop FACE battery (win11-fidelity
 * wave B). The charged defect this battery pins closed: the desktop surface
 * did not read as the Windows 11 clone at all — the wall was a campaign
 * gradient with a grid wash instead of the doctrine mica, the boot played a
 * fake percentage meter, the desktop had no lock face, the tray tiles were
 * session-only guesses and the icons ignored the left-aligned column law.
 * The battery walks the face layer by layer, mostly as source pins (the
 * read-only stylesheet and winget sources) plus the pure lock-state helpers:
 * · the wallpaper — the doctrine mica recipe paints the desktop through
 *   --win-mica (light and dark rows), the --win-noise grain rides the
 *   layer-2 0.035 recipe, the trident gradient and the 44px grid wash leave
 *   the zone, the reduced-transparency guard calms the grain, and no new
 *   fixed hex enters the wallpaper channel;
 * · the boot — the near-black --win-boot canvas (#010001, the doctrine boot
 *   spec), the white mark, the Fluent progress ring with the exact
 *   spin-infinite dasharray loop, the REAL gate (the leave waits for the
 *   panel's ready verdict — no fake 0→100 counter), the label rows riding
 *   the os label table and the slowfadein handover to the desktop;
 * · the lock — the desktopstate lock posture (pure roundtrip, the
 *   dt-desktop-lock event, the session persistence), the Win+L /
 *   Ctrl+Alt+L chord on the workspace, the overlay riding the EXISTING
 *   auth faces (LockFace + PowerMenu) over the mica wall on the modal band;
 * · the personalize — the desktop context menu Personalize submenu (the
 *   real theme ladder flip through the personalstore mirror) and the
 *   currentThemeLadder reader the radio states answer;
 * · the tray — the REAL theme and dock-mode tiles (flipThemeLadder, the
 *   navbar mode event + the account store), the session bag no longer
 *   carrying a fake theme bit.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  commitDesktopLock,
  DESKTOP_LOCK_EVENT,
  DESKTOP_LOCK_STORAGE_KEY,
  isDesktopLockState,
  loadDesktopLock,
  saveDesktopLock,
} from "../desktopstate.ts";
import { osText } from "../oslabels.ts";
import { currentThemeLadder } from "../personalstore.ts";

const solcss = readFileSync(join(import.meta.dirname, "..", "Sol", "sol.css"), "utf8");
const desktop = readFileSync(join(import.meta.dirname, "..", "Sol", "wingets", "PanelDesktop.tsx"), "utf8");
const desktoplock = readFileSync(join(import.meta.dirname, "..", "Sol", "wingets", "PanelDesktoplock.tsx"), "utf8");
const boot = readFileSync(join(import.meta.dirname, "..", "Sol", "wingets", "PanelBoot.tsx"), "utf8");
const workspace = readFileSync(join(import.meta.dirname, "..", "Sol", "wingets", "PanelWorkspace.tsx"), "utf8");
const tray = readFileSync(join(import.meta.dirname, "..", "Sol", "wingets", "ShellTrayflyouts.tsx"), "utf8");
const panel = readFileSync(join(import.meta.dirname, "..", "Sol", "panel", "panel.tsx"), "utf8");
const personalstore = readFileSync(join(import.meta.dirname, "..", "personalstore.ts"), "utf8");
const desktopstate = readFileSync(join(import.meta.dirname, "..", "desktopstate.ts"), "utf8");
const oslabels = readFileSync(join(import.meta.dirname, "..", "oslabels.ts"), "utf8");

/** extracts the appended desktopface block of the stylesheet — the pins
 * below read THIS block, so a later campaign append cannot silently move
 * the face (the append-only cascade discipline of sol.css) */
function faceBlock(): string {
  const at = solcss.indexOf("design/desktopface");
  expect(at, "the desktopface block lives in sol.css").toBeGreaterThan(-1);
  return solcss.slice(at);
}

/** installs a minimal window stub with a sessionStorage map, an event
 * target and the CustomEvent dispatch the lock helpers answer (the node
 * battery has no browser) */
function installWindow(): { events: string[]; store: Map<string, string> } {
  const store = new Map<string, string>();
  const events: string[] = [];
  (globalThis as Record<string, unknown>).window = {
    sessionStorage: {
      getItem: (key: string) => (store.has(key) ? (store.get(key) as string) : null),
      setItem: (key: string, value: string) => void store.set(key, value),
      removeItem: (key: string) => void store.delete(key),
    },
    addEventListener: (_kind: string, listener: (event: Event) => void) => {
      listeners.push(listener);
    },
    dispatchEvent: (event: Event) => {
      events.push((event as CustomEvent).type);
      for (const listener of listeners) listener(event);
      return true;
    },
  };
  const listeners: Array<(event: Event) => void> = [];
  return { events, store };
}

afterEach(() => {
  delete (globalThis as Record<string, unknown>).window;
});

describe("the wallpaper face (the doctrine mica IS the desktop wall)", () => {
  it("the atmosphere paints the --win-mica token — never the trident gradient", () => {
    const face = faceBlock();
    expect(face).toContain(".shell-os__atmosphere {\n  background: var(--win-mica);\n}");
    // the campaign paint left the desktop zone (the earlier rule may stay
    // in the file; the appended block wins the cascade)
    const at = face.indexOf(".shell-os__atmosphere {\n  background: var(--win-mica);\n}");
    expect(face.slice(0, at)).not.toContain("var(--wall-fallback)");
  });

  it("the mica token carries the doctrine recipe on both faces of the ladder", () => {
    expect(solcss).toContain("--mica: #202020 radial-gradient(#1a1f35 25%, #202020 100%) no-repeat fixed;");
    expect(solcss).toContain("--mica: #f3f3f3 radial-gradient(#eff4f9 75%, #f3f3f3 100%) no-repeat fixed;");
    expect(solcss).toContain("--win-mica: var(--mica);");
  });

  it("the noise grain rides the acrylic layer-2 recipe at 0.035 and the grid wash dies", () => {
    const face = faceBlock();
    expect(face).toContain("background-image: var(--win-noise);");
    expect(face).toContain("background-repeat: repeat;");
    expect(face).toContain("opacity: 0.035;");
    expect(face).toContain(".shell-os__atmosphere::after {\n  content: none;\n}");
  });

  it("the reduced-transparency guard calms the grain", () => {
    const face = faceBlock();
    expect(face).toContain("@media (prefers-reduced-transparency: reduce)");
    expect(face).toContain("opacity: 0.02;");
  });

  it("no new fixed hex enters the wallpaper channel — the block answers tokens only", () => {
    // the section body may NAME the doctrine recipe values in comments (the
    // documentation of the pair), but no paint leaves the tokens: every hex
    // in the section must be one of the four doctrine values
    const face = faceBlock();
    const start = face.indexOf("1. the wallpaper channel");
    const wallpaper = face.slice(start, face.indexOf("2. the boot face"));
    const doctrine = new Set(["#202020", "#1a1f35", "#eff4f9", "#f3f3f3"]);
    for (const match of wallpaper.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
      expect(doctrine.has(match[0].toLowerCase()), `the wallpaper channel stays token-clean: ${match[0]}`).toBe(true);
    }
  });
});

describe("the boot face (the near-black canvas, the white mark, the real ring)", () => {
  it("the --win-boot token carries the doctrine #010001 and the canvas wears it", () => {
    const face = faceBlock();
    expect(face).toContain("--win-boot: #010001;");
    expect(face).toContain("background-color: var(--win-boot);");
    expect(face).toContain("background-image: none;");
  });

  it("the Fluent progress ring: stroke 2px round caps and the exact spin-infinite loop", () => {
    const face = faceBlock();
    expect(face).toContain(".boot-progress-ring circle {\n  stroke: currentColor;");
    expect(face).toContain("stroke-width: 2px;\n  stroke-linecap: round;");
    expect(face).toContain("animation: 2s linear 0s infinite normal none running spin-infinite;");
    expect(face).toContain("stroke-dasharray: 0.01px, 43.97px;");
    expect(face).toContain("stroke-dasharray: 21.99px, 21.99px;");
    expect(face).toContain("transform: rotate(1080deg);");
    // the transition:all ban holds — the ring names no transition
    expect(face).not.toContain("transition: all");
  });

  it("the boot screen renders mark + words + ring and never a fake percentage", () => {
    expect(boot).toContain("boot-progress-ring");
    expect(boot).toContain("<SolLogoMark size={92} />");
    expect(boot).not.toContain("boot-screen__bar");
    expect(boot).not.toContain("boot-screen__readout");
    expect(boot).not.toContain("%");
  });

  it("the boot words ride the os label table — the labels law holds on the boot face", () => {
    expect(boot).toContain('osText("boot.aria")');
    expect(boot).toContain('osText("boot.wordmark")');
    expect(boot).toContain('osText("boot.state")');
    expect(osText("boot.aria")).toBe("DevThink is starting");
    expect(osText("boot.wordmark")).toBe("DevThink");
    expect(osText("boot.state")).toBe("opening the local os");
  });

  it("the leave is REAL: the boot holds until the panel verdict (ready) past the floor", () => {
    expect(boot).toContain("export function BootScreen({ ready = true, onDone }");
    expect(boot).toContain("if (!ready) return undefined;");
    expect(boot).toContain("Math.max(0, FILL_MS - elapsed)");
    // the panel flips the verdict only after its own boot work settles
    expect(panel).toContain("ready={bootReady}");
    expect(panel).toContain(".finally(() => setBootReady(true));");
    // the once-per-session law and the reduced-motion skip survive
    expect(boot).toContain('window.sessionStorage.setItem(BOOT_KEY, "1")');
    expect(boot).toContain("if (prefersReducedMotion()) {");
  });

  it("the handover rides the doctrine slowfadein — 0% hold, 25% hold, 100%", () => {
    const face = faceBlock();
    expect(face).toContain("@keyframes slowfadein {\n  0% {\n    opacity: 0;\n  }\n\n  25% {\n    opacity: 0;\n  }");
    expect(face).toContain(".devthink-app--booted .shell-os {\n  animation: slowfadein 1s ease-in-out;\n}");
    expect(panel).toContain(
      'className={`devthink-app devthink-app--terminal${bootedFrom ? " devthink-app--booted" : ""}`}',
    );
    // the reveal rides only the boot that actually played
    expect(panel).toContain("setBootedFrom(true);");
    // and reduced motion skips it
    const at = face.indexOf(".devthink-app--booted .shell-os {\n  animation: slowfadein 1s ease-in-out;\n}");
    expect(face.slice(at)).toContain("@media (prefers-reduced-motion: reduce)");
  });
});

describe("the context menu face (the doctrine panel curve on the win11 menus)", () => {
  it("the dsk-menu entrance rides the 250ms cubic-bezier(0.62,0,0.32,1) panel curve", () => {
    const face = faceBlock();
    expect(face).toContain("animation-duration: 250ms;");
    expect(face).toContain("animation-timing-function: cubic-bezier(0.62, 0, 0.32, 1);");
    // the reduced-motion drop answers the face too
    const at = face.indexOf(".dsk-menu {\n  animation-duration: 250ms;");
    expect(face.slice(at)).toContain("@media (prefers-reduced-motion: reduce)");
  });

  it("the menu closes on the outside press and the Escape — the existing contract pins", () => {
    expect(desktop).toContain('onClose={() => setMenu(null)}');
    expect(readFileSync(join(import.meta.dirname, "..", "Sol", "wingets", "PanelDesktopmenu.tsx"), "utf8")).toContain(
      "window.addEventListener(\"pointerdown\", onPointerDown, true);",
    );
  });
});

describe("the desktop lock (the lock face riding ON the running desktop)", () => {
  it("the posture roundtrips through the session store and validates junk", () => {
    const { store } = installWindow();
    expect(loadDesktopLock()).toBe("unlocked");
    saveDesktopLock("locked");
    expect(store.get(DESKTOP_LOCK_STORAGE_KEY)).toBe("locked");
    expect(loadDesktopLock()).toBe("locked");
    saveDesktopLock("unlocked");
    expect(loadDesktopLock()).toBe("unlocked");
    expect(isDesktopLockState("locked")).toBe(true);
    expect(isDesktopLockState("open")).toBe(false);
  });

  it("the commit persists AND tells the shell through the dt-desktop-lock event", () => {
    const { events } = installWindow();
    commitDesktopLock("locked");
    expect(events).toContain(DESKTOP_LOCK_EVENT);
    commitDesktopLock("unlocked");
    expect(events).toEqual([DESKTOP_LOCK_EVENT, DESKTOP_LOCK_EVENT]);
    expect(DESKTOP_LOCK_EVENT).toBe("dt-desktop-lock");
  });

  it("the storage failures never break the posture — the honest unlocked default", () => {
    (globalThis as Record<string, unknown>).window = {
      sessionStorage: {
        getItem: () => {
          throw new Error("denied");
        },
        setItem: () => {
          throw new Error("denied");
        },
        removeItem: () => {
          throw new Error("denied");
        },
      },
    };
    expect(loadDesktopLock()).toBe("unlocked");
    expect(() => saveDesktopLock("locked")).not.toThrow();
    expect(() => commitDesktopLock("locked")).not.toThrow();
  });

  it("the workspace carries the posture: the chord locks, the event re-faces, the overlay drops on unlock", () => {
    expect(workspace).toContain('const [locked, setLocked] = useState(() => loadDesktopLock() === "locked");');
    expect(workspace).toContain("window.addEventListener(DESKTOP_LOCK_EVENT, onLock);");
    // the Windows lock chord: Win+L or Ctrl+Alt+L
    expect(workspace).toContain('if (event.key.toLowerCase() !== "l") return;');
    expect(workspace).toContain("if (event.metaKey || (event.ctrlKey && event.altKey)) {");
    expect(workspace).toContain('commitDesktopLock("locked");');
    // the unlock commits the unlocked posture straight back
    expect(workspace).toContain('onUnlock={() => {\n            commitDesktopLock("unlocked");\n          }}');
  });

  it("the overlay rides the EXISTING auth faces over the mica wall on the modal band", () => {
    expect(desktoplock).toContain("<LockFace onUnlock={onUnlock} />");
    expect(desktoplock).toContain("<PowerMenu />");
    expect(desktoplock).toContain('aria-label={osText("desktop.lock.aria")}');
    const face = faceBlock();
    expect(face).toContain(".dt-desklock {\n  position: fixed;\n  z-index: var(--z-modal);");
    expect(face).toContain("background: var(--win-mica);");
  });
});

describe("the personalize face (the real theme ladder in the desktop menu)", () => {
  it("the menu carries the Personalize submenu with the light/dark ladder and the real flip", () => {
    expect(desktop).toContain('label: osText("desktop.menu.personalize"),');
    expect(desktop).toContain('id: "theme-light",');
    expect(desktop).toContain('id: "theme-dark",');
    expect(desktop).toContain('onSelect: () => saveThemeMirror("light")');
    expect(desktop).toContain('onSelect: () => saveThemeMirror("dark")');
    // the radio states answer the REAL ladder, never a local guess
    expect(desktop).toContain('shortcut: currentThemeLadder() === "light" ? "radio" : undefined');
    expect(desktop).toContain('shortcut: currentThemeLadder() === "dark" ? "radio" : undefined');
  });

  it("currentThemeLadder reads the panel root, then the document root, then the mirror", () => {
    expect(personalstore).toContain("export function currentThemeLadder(): ThemeChoice {");
    expect(personalstore).toContain('document.querySelector<HTMLElement>(".devthink-app")?.dataset.theme');
    expect(personalstore).toContain('return loadThemeMirror() ?? "dark";');
    // the node answer (no document) is the dark default
    expect(currentThemeLadder()).toBe("dark");
  });

  it("the personalize labels ride the os label table", () => {
    expect(osText("desktop.menu.personalize")).toBe("Personalize");
    expect(osText("desktop.menu.personalize.light")).toBe("light theme");
    expect(osText("desktop.menu.personalize.dark")).toBe("dark theme");
    // no new id goes unseeded — the table carries every row the desktop quotes
    const ids = [...desktop.matchAll(/osText\("([^"]+)"\)/g)].map((match) => match[1]);
    for (const id of ids) {
      expect(oslabels).toContain(`id: "${id}"`);
    }
  });
});

describe("the tray face (the real system switches in the quick settings)", () => {
  it("the theme tile flips the real ladder and reads it at open", () => {
    expect(tray).toContain("function ThemeTile()");
    expect(tray).toContain('useState(() => currentThemeLadder() === "dark")');
    expect(tray).toContain('onClick={() => setDark(flipThemeLadder() === "dark")}');
  });

  it("the dock tile flips the real navbar mode — the account store saves and the event re-docks the bar", () => {
    expect(tray).toContain("function DockModeTile()");
    expect(tray).toContain('document.querySelector(".dt-nav")?.getAttribute("data-navmode") === "docked"');
    expect(tray).toContain("window.addEventListener(NAVBAR_MODE_EVENT, onMode);");
    expect(tray).toContain("saveNavbarMode(next);");
    expect(tray).toContain("window.dispatchEvent(new CustomEvent<NavbarMode>(NAVBAR_MODE_EVENT, { detail: next }));");
  });

  it("the session bag no longer carries a fake theme bit — the real states live in their owners", () => {
    expect(tray).not.toContain("theme: boolean;");
    expect(tray).not.toContain("theme: true");
    // the session tiles keep their keys and the two real tiles render beside them
    expect(tray).toContain("<ThemeTile />");
    expect(tray).toContain("<DockModeTile />");
  });

  it("the flyout grammar survives the reface — the tray curve and the exit recipe", () => {
    expect(tray).toContain("duration-[250ms] ease-[cubic-bezier(0.62,0,0.32,1)]");
    expect(tray).toContain("data-[hide=true]:translate-y-[110%]");
    expect(tray).toContain("data-[hide=true]:duration-150");
  });
});

describe("the desktopstate face (the pure layer answers the new laws)", () => {
  it("the grid constants live beside the snap lattice", () => {
    expect(desktopstate).toContain("export const GRID_GAP_PX = 8;");
    expect(desktopstate).toContain("export function gridSpots(");
    expect(desktopstate).toContain("export function gridLayoutSpots<");
    // the scatter table is gone from the pure layer too
    expect(desktopstate).not.toContain("DESKTOP_SPOTS");
    expect(desktopstate).not.toContain("flowSpots");
  });

  it("the lock section rides the same file as the icon math (the one pure desktop layer)", () => {
    expect(desktopstate).toContain('export const DESKTOP_LOCK_STORAGE_KEY = "dt.desktop.lock";');
    expect(desktopstate).toContain("export function isDesktopLockState(");
    expect(desktopstate).toContain("export function loadDesktopLock(");
    expect(desktopstate).toContain("export function commitDesktopLock(");
  });
});
