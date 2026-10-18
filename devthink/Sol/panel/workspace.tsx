/**
 * workspace.tsx — the shell: the OS desktop of the creation panel. The
 * visitor lands on the desktop composition (the clear trident gradient —
 * the CSS --wall-fallback recipe — and the shared app catalog spread
 * around the DevThink mark as desktop icons) and every app opens as a
 * floating WindowFrame on demand. Windows are Windows-grade: the 30px
 * acrylic titlebar carries the single DevThink lockup (windowframe.tsx),
 * the snap layouts flyout and the aero edge gesture live on the
 * WindowFrame, and a minimized window keeps its dock entry lit with the
 * data-minimized dimmer until a click glides it back out. While any window
 * is open the wallpaper hero recedes (logo discipline: one brand voice per
 * zone). The shared chrome (Sol/shell/ShellChrome.tsx) carries the thin
 * taskbar with the Start button; the dock keeps the session and the family
 * apps one click away.
 *
 * The window bodies come from the window registry (Sol/windowregistry.tsx
 * over the root window.ts catalog): the chat window mounts the same
 * conversation body as the /chat page, and the family apps mount the power
 * clip frame of their repository subpath. Two handoffs seed windows on
 * arrival: a /<slug> family route opens its app window, and a deep
 * /w/…/chat link parks its session id (chatstate handoff) which opens the
 * chat window.
 */

import { Clock } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { alttabkeydown } from "../../alttab.ts";
import { DESKTOP_APPS, type DesktopApp } from "../../appregistry.ts";
import { pushrecentapp } from "../../recentapps.ts";
import { isWorkspaceDestination, type WorkspaceDestination } from "../../workspace.ts";
import { type AltTabCard, AltTabSwitcher } from "../shell/alttabswitcher.tsx";
import { ShellChrome } from "../shell/ShellChrome.tsx";
import { windowApp } from "../windowregistry.tsx";
import { DesktopSurface } from "./desktop.tsx";
import { WINDOW_MIN_HEIGHT, WindowFrame, type WindowSnapshot } from "./windowframe.tsx";

type ShellWorkspaceProps = {
  /** the family slug of a /<slug> arrival route — the window opens on mount */
  familySlug?: string;
  /** the session id of a deep /w/…/chat arrival — the chat window opens */
  chatHandoff?: string;
  /** the route section: "history" opens the session history window */
  sectionId: string;
  userId?: string | undefined;
  tabs: {
    id: string;
    label: string;
    provider?: string;
  }[];
  activeTabId: string;
  paired: boolean;
  railMode: "always" | "auto" | "off";
  onDestination: (destination: WorkspaceDestination) => void;
  onSelectTab: (id: string) => void;
  /** navigates any internal route of the theme (the family routes, docs…) */
  onNavigate: (href: string) => void;
};

/** the float band base — windows stack upward from here, below the bar band */
const Z_BASE = 20;
/** the fixed chrome bands of the desktop, in px: no top chrome — the desktop
 * starts at the viewport top (the win11 law: the taskbar is the bottom edge)
 * and the 48px taskbar rides Sol/sol.css --shell-bottom */
const SHELL_TOP = 0;
const SHELL_BOTTOM = 48;

/** resolves one registry app by id (the dock and the desktop share it) */
function appById(id: string): DesktopApp {
  return DESKTOP_APPS.find((app) => app.id === id) || DESKTOP_APPS[0];
}

/** default floating snapshot for a freshly opened window (the daedalOS
 * cascade offset — each new window lands 26px down-right of the last; the
 * spawn geometry comes from the window registry when the app declares one) */
function defaultSnapshot(id: string, title: string, openCount: number): WindowSnapshot {
  const cascade = (openCount % 4) * 26;
  const spawn = windowApp(id)?.spawn;
  const width = Math.min(spawn?.width ?? 760, Math.max(460, Math.round(window.innerWidth * 0.52)));
  const height = Math.max(
    WINDOW_MIN_HEIGHT,
    Math.min(
      spawn?.height ?? Number.POSITIVE_INFINITY,
      Math.round(window.innerHeight - SHELL_TOP - SHELL_BOTTOM - 130),
    ),
  );
  return {
    id,
    title,
    x: Math.min(Math.max(28, Math.round(window.innerWidth * 0.2) + cascade), Math.max(28, window.innerWidth - width)),
    y: SHELL_TOP + 26 + cascade,
    width,
    height,
    state: "normal",
    z: Z_BASE,
  };
}

/** The persisted window layout (the desktopstate pattern): the snapshots
 * ride localStorage and hydrate once, ids without a catalog app drop out. */
const WINDOWS_STORAGE_KEY = "dt.windows.v1";

function loadWindows(): WindowSnapshot[] {
  try {
    const raw = window.localStorage.getItem(WINDOWS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WindowSnapshot[];
    return parsed.filter((win) => typeof win.id === "string" && win.id !== "" && windowApp(win.id) !== undefined);
  } catch {
    return [];
  }
}

export function ShellWorkspace({
  familySlug,
  chatHandoff,
  sectionId,
  userId,
  tabs,
  activeTabId,
  paired,
  railMode,
  onDestination,
  onSelectTab,
  onNavigate,
}: ShellWorkspaceProps) {
  const [location] = useLocation();
  const destination: WorkspaceDestination = isWorkspaceDestination(sectionId) ? sectionId : "chat";
  /** the desktop boots with the persisted layout (empty on a fresh device) —
   * windows open on demand and the layout rides localStorage */
  const [windows, setWindows] = useState<WindowSnapshot[]>(() => loadWindows());
  /** the alt-tab gesture: the acrylic task switcher rides above the shell
   * while the chord is held (the first alt+tab mounts it on the window
   * behind the topmost one) */
  const [switching, setSwitching] = useState(false);

  /** single mutation entry: normalizes the z order from the array order */
  const applyWindows = useCallback((next: (current: WindowSnapshot[]) => WindowSnapshot[]) => {
    setWindows((current) => next(current).map((win, index) => ({ ...win, z: Z_BASE + index })));
  }, []);

  // the layout persists: every window change rides localStorage so the
  // desktop boots the way the visitor left it
  useEffect(() => {
    try {
      window.localStorage.setItem(WINDOWS_STORAGE_KEY, JSON.stringify(windows));
    } catch {
      // storage unavailable: the layout lives for this mount only
    }
  }, [windows]);

  const focusWindow = useCallback(
    (id: string) => {
      applyWindows((current) => {
        const target = current.find((win) => win.id === id);
        if (!target || current[current.length - 1]?.id === id) return current;
        return [...current.filter((win) => win.id !== id), target];
      });
    },
    [applyWindows],
  );

  const updateWindow = useCallback(
    (id: string, patch: Partial<Omit<WindowSnapshot, "id">>) => {
      applyWindows((current) => current.map((win) => (win.id === id ? { ...win, ...patch } : win)));
    },
    [applyWindows],
  );

  const closeWindow = useCallback(
    (id: string) => {
      applyWindows((current) => current.filter((win) => win.id !== id));
    },
    [applyWindows],
  );

  /** dock and desktop behavior: open, restore, focus or minimize — like a taskbar button */
  const toggleWindow = useCallback(
    (id: string, title: string) => {
      applyWindows((current) => {
        const target = current.find((win) => win.id === id);
        if (!target) return [...current, defaultSnapshot(id, title, current.length)];
        if (target.state === "minimized") {
          const restored =
            target.restoredState && target.restoredState !== "minimized" ? target.restoredState : "normal";
          return [...current.filter((win) => win.id !== id), { ...target, state: restored, restoredState: undefined }];
        }
        if (current[current.length - 1]?.id === id)
          return current.map((win) =>
            win.id === id ? { ...win, state: "minimized", restoredState: target.state } : win,
          );
        return [...current.filter((win) => win.id !== id), target];
      });
    },
    [applyWindows],
  );

  /** the arrival handoffs: a /<slug> family route opens its app window, a
   * deep /w/…/chat link opens the chat window (the chat body inside consumes
   * the parked session slot and hydrates the conversation). The props key
   * the pass — both ride the arrival route, so the effect answers each
   * arrival exactly once. */
  useEffect(() => {
    if (familySlug && windowApp(familySlug)) toggleWindow(familySlug, appById(familySlug).name);
    else if (chatHandoff) toggleWindow("chat", appById("chat").name);
  }, [chatHandoff, familySlug, toggleWindow]);

  /** destination windows: history opens its own floating window */
  useEffect(() => {
    if (destination !== "history") return;
    applyWindows((current) => {
      const target = current.find((win) => win.id === "history");
      if (!target) return [...current, defaultSnapshot("history", "session history", current.length)];
      if (target.state === "minimized") {
        const restored = target.restoredState && target.restoredState !== "minimized" ? target.restoredState : "normal";
        return [
          ...current.filter((win) => win.id !== "history"),
          { ...target, state: restored, restoredState: undefined },
        ];
      }
      if (current[current.length - 1]?.id === "history") return current;
      return [...current.filter((win) => win.id !== "history"), target];
    });
  }, [applyWindows, destination]);

  const topId = useMemo(() => {
    for (let index = windows.length - 1; index >= 0; index -= 1) {
      const win = windows[index];
      if (win && win.state !== "minimized") return win.id;
    }
    return undefined;
  }, [windows]);

  /** the alt-tab opener: the first alt+tab of the gesture mounts the task
   * switcher (a single open window is focused straight away, like Windows) */
  useEffect(() => {
    if (switching) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (!alttabkeydown(event) || !event.altKey || event.key !== "Tab") return;
      event.preventDefault();
      if (windows.length === 0) return;
      if (windows.length === 1) {
        focusWindow(windows[0].id);
        return;
      }
      setSwitching(true);
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [focusWindow, switching, windows]);

  /** the switcher commit: a minimized window restores (the taskbar
   * semantics), a live one just takes the focus */
  const commitSwitch = useCallback(
    (id: string) => {
      setSwitching(false);
      const target = windows.find((win) => win.id === id);
      if (target?.state === "minimized") toggleWindow(id, target.title);
      else focusWindow(id);
    },
    [focusWindow, toggleWindow, windows],
  );

  /** the switcher cards: every open window with its catalog face */
  const switcherCards = useMemo<AltTabCard[]>(
    () =>
      windows.map((win) => ({
        id: win.id,
        title: win.title,
        minimized: win.state === "minimized",
        app: appById(win.id),
      })),
    [windows],
  );

  /** opens one app of the shared catalog from the desktop, the Start menu or the dock */
  const openApp = useCallback(
    (app: DesktopApp) => {
      // the open promotes the app to the Start menu recommended rail
      pushrecentapp(app.id);
      if (app.target.kind === "window") {
        toggleWindow(app.target.id, appById(app.target.id).name);
        return;
      }
      if (app.target.kind === "destination") {
        // destination apps of the registry open in place as windows
        if (windowApp(app.target.id)) {
          toggleWindow(app.target.id, app.name);
          return;
        }
        if (isWorkspaceDestination(app.target.id)) onDestination(app.target.id);
        return;
      }
      if (app.target.kind === "route") {
        // the windows law: the registry app opens as a floating window —
        // the route stays for deep links and the taskbar fallback
        if (windowApp(app.id)) {
          toggleWindow(app.id, app.name);
          return;
        }
        onNavigate(app.target.href);
        return;
      }
      if (app.target.kind === "external") {
        // the windows law with its own address: the family app redirects to
        // its repository subpath (DevThink barra <app>) and the arrival
        // route opens the power clip window inside the os — already on the
        // route, the click toggles the window in place instead
        if (location === `/${app.target.slug}`) {
          toggleWindow(app.target.slug, app.name);
          return;
        }
        onNavigate(`/${app.target.slug}`);
        return;
      }
    },
    [location, onDestination, onNavigate, toggleWindow],
  );

  return (
    <main className={`shell-os shell-os--rail-${railMode}`}>
      <div className="shell-os__atmosphere" aria-hidden="true">
        {/* the static wall recipe owns the surface: no canvas, no webgl, no
            flicker — the clear trident gradient paints the desktop */}
      </div>

      <ShellChrome paired={paired} userId={userId} onOpenApp={openApp} openApps={windows.map((win) => win.id)} />

      <div className="shell-desktop">
        <DesktopSurface apps={DESKTOP_APPS} onOpen={openApp} />

        {windows.map((win) => (
          <WindowFrame
            key={win.id}
            win={win}
            active={win.id === topId}
            onFocus={focusWindow}
            onUpdate={updateWindow}
            onClose={closeWindow}
          >
            {win.id === "history" ? (
              <div className="terminal-history shell-history-window">
                <p>Open session tabs remain local to this workspace.</p>
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onSelectTab(tab.id)}
                    className={tab.id === activeTabId ? "is-active" : ""}
                  >
                    <Clock size={13} strokeWidth={1.75} aria-hidden="true" />
                    <strong>{tab.label}</strong>
                    <small>{tab.provider}</small>
                  </button>
                ))}
              </div>
            ) : (
              <WindowHost id={win.id} />
            )}
          </WindowFrame>
        ))}
      </div>

      {/* the acrylic alt-tab task switcher while the chord is held */}
      {switching && (
        <AltTabSwitcher cards={switcherCards} onCommit={commitSwitch} onClose={() => setSwitching(false)} />
      )}
    </main>
  );
}

/** WindowHost — the sandbox body of a registry window: the app anchor with
 * the embedded contract (no shell, no hero inside the frame). */
function WindowHost({ id }: { id: string }) {
  const app = windowApp(id);
  if (!app) return null;
  const Body = app.component;
  return (
    <div className="shell-window__host">
      <Body embedded />
    </div>
  );
}
