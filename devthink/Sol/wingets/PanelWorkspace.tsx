/**
 * workspace.tsx — the shell: the OS desktop of the creation panel. The
 * visitor lands on the desktop composition (the clear trident gradient —
 * the CSS --wall-fallback recipe — and the shared app catalog spread
 * around the DevThink mark as desktop icons) and every app opens as a
 * floating WindowFrame on demand. Windows are Windows-grade: the 30px
 * acrylic titlebar carries the single DevThink lockup (windowframe.tsx),
 * the snap layouts flyout and the aero edge gesture live on the
 * WindowFrame, and a minimized window keeps its dock entry lit with the
 * data-minimized dimmer until a click glides it back out. The z order
 * rides the focus counter of the win11React hz pattern (every open and
 * every focus stamps the next value, minimized windows drop to −1). While
 * any window is open the wallpaper hero recedes (logo discipline: one
 * brand voice per zone). The shared chrome (Sol/wingets/Shellchrome.tsx)
 * carries the thin taskbar with the Start button; the dock keeps the
 * session and the family apps one click away.
 *
 * The window bodies come from the root window catalog (window.ts) bound
 * right here — the workspace is the single react-aware edge of the window
 * logic: the chat window mounts the same conversation body as the /chat
 * page, and the family apps mount the power clip frame of their repository
 * subpath. Two handoffs seed windows on arrival: a /<slug> family route
 * opens its app window, and a deep /w/…/chat link parks its session id
 * (chatstate handoff) which opens the chat window.
 */

import { ClockRegular as Clock } from "@fluentui/react-icons";
import type { ComponentType } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { alttabkeydown } from "../../alttab.ts";
import { DESKTOP_APPS, type DesktopApp } from "../../appregistry.ts";
import {
  commitDesktopLock,
  DESKTOP_LOCK_EVENT,
  type DesktopLockState,
  isDesktopLockState,
  loadDesktopLock,
} from "../../desktopstate.ts";
import { pushrecentapp } from "../../recentapps.ts";
import { uicopy, useUicopy } from "../../uistore.ts";
import { WindowBodySurface } from "../../useismobile.ts";
import {
  SPAWN_TOP_OFFSET,
  spawnfit,
  type SpawnFit,
  type WindowEntry,
  windowapp,
  windowcatalog,
  windowspawn,
} from "../../window.ts";
import { isWorkspaceDestination, type WorkspaceDestination } from "../../workspace.ts";
import AudioAnchor from "../audio/audio.tsx";
import CalculatorAnchor from "../calculator/calculator.tsx";
import ConsoleAnchor from "../console/console.tsx";
import DocsAnchor from "../docs/docs.tsx";
import FilesAnchor from "../files/files.tsx";
import GamesAnchor from "../games/games.tsx";
import GatewayView from "../gateway/gateway.tsx";
import ImageAnchor from "../image/image.tsx";
import ProjectsAnchor from "../projects/projects.tsx";
import ProvidersAnchor from "../providers/providers.tsx";
import SettingsAnchor from "../settings/settings.tsx";
import UsageAnchor from "../usage/usage.tsx";
import VideoAnchor from "../video/video.tsx";
import ChatBody from "./ChatBody.tsx";
import { DesktopSurface } from "./PanelDesktop.tsx";
import { DesktopLock } from "./PanelDesktoplock.tsx";
import {
  frameScale,
  WINDOW_MIN_HEIGHT,
  WINDOW_MIN_WIDTH,
  WindowFrame,
  type WindowSnapshot,
} from "./PanelWindowframe.tsx";
import { type AltTabCard, AltTabSwitcher } from "./ShellAlttabswitcher.tsx";
import { ShellChrome } from "./Shellchrome.tsx";
import { FamilyFrame } from "./ShellFamilyframe.tsx";

/** One windowed app: the anchor component with the embedded contract and
 * the spawn geometry the frame opens at. */
export type WindowApp = {
  component: ComponentType<{ embedded?: boolean }>;
  spawn: { width: number; height: number };
};

/** the anchor components of the catalog, by app id — the binding edge of
 * the root window logic (the only react-aware map of the theme) */
const ANCHORS: Record<string, ComponentType<{ embedded?: boolean }>> = {
  chat: ChatBody,
  files: FilesAnchor,
  calculator: CalculatorAnchor,
  docs: DocsAnchor,
  image: ImageAnchor,
  games: GamesAnchor,
  console: ConsoleAnchor,
  usage: UsageAnchor,
  settings: SettingsAnchor,
  projects: ProjectsAnchor,
  audio: AudioAnchor,
  video: VideoAnchor,
  providers: ProvidersAnchor,
  gateway: GatewayView,
};

/** binds one catalog row to its component: the anchors bind by id, the
 * family rows bind to the power clip frame of their subpath */
function bindentry(id: string, entry: WindowEntry): WindowApp {
  if (entry.kind === "family") {
    const slug = entry.slug ?? id;
    return {
      component: () => <FamilyFrame slug={slug} />,
      spawn: windowspawn(id),
    };
  }
  const anchor = ANCHORS[id];
  if (!anchor) {
    return { component: () => null, spawn: windowspawn(id) };
  }
  return { component: anchor, spawn: windowspawn(id) };
}

/** The windowed apps of the desktop: the pure root catalog with the
 * components bound. The chat window stays bespoke inside the workspace (its
 * session body is the chat subapp). */
const WINDOW_APPS: Record<string, WindowApp> = Object.fromEntries(
  Object.entries(windowcatalog()).map(([id, entry]) => [id, bindentry(id, entry)]),
);

/** Reads one windowed app by id, or undefined when the app still navigates. */
export function windowApp(id: string): WindowApp | undefined {
  return WINDOW_APPS[id];
}

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
/** the z band a minimized window drops to — under the whole field (the
 * win11React law: minimize writes z = −1, restore re-stamps from the focus
 * counter); the pose is display:none, the value keeps the order honest for
 * anything that reads the snapshot */
const WINDOW_MIN_Z = -1;
/** the fixed chrome band of the desktop, in px: no top chrome — the desktop
 * starts at the viewport top (the win11 law: the taskbar is the bottom edge)
 * and the 48px taskbar rides the root window logic (DESKTOP_TASKBAR — the
 * same measure the .shell-desktop height derives from) */
const SHELL_TOP = 0;

/** resolves one registry app by id (the dock and the desktop share it) */
function appById(id: string): DesktopApp {
  return DESKTOP_APPS.find((app) => app.id === id) || DESKTOP_APPS[0];
}

/** the live spawn verdict of one windowed app against the screen the
 * visitor carries right now — the viewport divided by the interface zoom
 * (the geometry answers css pixels: the zoom renders each one wider, so
 * the clamp the visitor SEES is the clamp the screen applies — a 1280px
 * band opens 1600 rendered pixels on a 125% os and lands cut otherwise) */
function livefit(id: string): SpawnFit {
  const scale = frameScale(document.querySelector("main.shell-os"));
  /* the verdict of the root window logic: the floating bounds clamped
     to the real desktop band (the .shell-desktop measure — the viewport
     over the height minus the taskbar), or the full snap when the family
     band the app answers cannot fit the screen — the window opens
     already maximized so the app answers the viewport the direct url
     answers instead of a cut of it (the PR12 bug: apps opened cut inside
     the windows while the direct url answered them whole) */
  return spawnfit(id, {
    width: Math.round(window.innerWidth / scale),
    height: Math.round(window.innerHeight / scale),
  });
}

/** default floating snapshot for a freshly opened window (the daedalOS
 * cascade offset — each new window lands 26px down-right of the last; the
 * spawn geometry comes from the root window logic when the app declares
 * one) */
function defaultSnapshot(id: string, title: string, openCount: number): WindowSnapshot {
  const cascade = (openCount % 4) * 26;
  const fit = livefit(id);
  return {
    id,
    title,
    x: Math.min(Math.max(28, Math.round(fit.desktopWidth * 0.2) + cascade), Math.max(28, fit.desktopWidth - fit.width)),
    // the cascade gives way when the window fills the band — the bottom
    // edge never crosses the taskbar
    y: SHELL_TOP + Math.min(SPAWN_TOP_OFFSET + cascade, Math.max(SHELL_TOP, fit.desktopHeight - fit.height)),
    width: fit.width,
    height: fit.height,
    state: fit.maximized ? "maximized" : "normal",
    z: Z_BASE,
  };
}

/** The persisted window layout (the desktopstate pattern): the snapshots
 * ride localStorage and hydrate once, ids without a catalog app drop out.
 * The stored z values re-stamp in array order on hydrate — stored z pairs
 * may collide after a restore, the focus counter re-stamps from here on. */
const WINDOWS_STORAGE_KEY = "dt.windows.v1";

function loadWindows(): WindowSnapshot[] {
  try {
    const raw = window.localStorage.getItem(WINDOWS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WindowSnapshot[];
    return parsed
      .filter((win) => typeof win.id === "string" && win.id !== "" && windowApp(win.id) !== undefined)
      // the stored geometry re-fits the live screen before it renders: a
      // layout saved on another screen — or in the era before the family
      // band — never hydrates cut (the cut-window law answers at the
      // hydrate door too, never only at the spawn)
      .map((win, index) => ({ ...refitsnapshot(win), z: Z_BASE + index }));
  } catch {
    return [];
  }
}

/** clamps one floating bounds pair into the live desktop band — never
 * wider or taller than the band, never under the doctrine minimum, never
 * parked past the right or bottom edge. non-destructive in band: a pair
 * the band already carries comes back untouched, so the live re-fit never
 * moves a window the visitor placed (the shell clips at its box and the
 * taskbar covers the rest of it — an out-of-band window IS a cut window) */
function clampbounds(
  bounds: { x: number; y: number; width: number; height: number },
  fit: SpawnFit,
): { x: number; y: number; width: number; height: number } {
  const width = Math.min(
    Math.max(WINDOW_MIN_WIDTH, Math.round(bounds.width)),
    Math.max(WINDOW_MIN_WIDTH, fit.desktopWidth),
  );
  const height = Math.min(
    Math.max(WINDOW_MIN_HEIGHT, Math.round(bounds.height)),
    Math.max(WINDOW_MIN_HEIGHT, fit.desktopHeight),
  );
  return {
    width,
    height,
    x: Math.min(Math.max(0, Math.round(bounds.x)), Math.max(0, fit.desktopWidth - width)),
    y: Math.min(Math.max(0, Math.round(bounds.y)), Math.max(0, fit.desktopHeight - height)),
  };
}

/** true when two bounds pairs answer the same numbers — the no-op guard
 * of the live re-fit (an in-band window never re-renders on a resize) */
function samebounds(
  a: { x: number; y: number; width: number; height: number } | undefined,
  b: { x: number; y: number; width: number; height: number } | undefined,
): boolean {
  if (!a || !b) return a === b;
  return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
}

/** re-fits one stored snapshot against the live screen — the cut-window
 * law of PR12 answered at the hydrate door. the persisted layout rides
 * localStorage, so a snapshot stored on a bigger screen — or in the era
 * before the family band — would hydrate verbatim and render the app cut:
 * past the clipped shell box, under the taskbar, or under the 961px+
 * breakpoints of the standalone tree (a family window stored at 940px
 * answers the narrow design the direct url never shows). the refit clamps
 * the floating bounds into the live band, lifts a family window stored
 * under its design band back to the band (the stored size never
 * downgrades the design the window renders), and answers the full snap
 * when the band cannot fit the screen — the app inside always opens the
 * way the direct url answers, never a cut of it. */
function refitsnapshot(win: WindowSnapshot): WindowSnapshot {
  const fit = livefit(win.id);
  const bounds = { x: win.x, y: win.y, width: win.width, height: win.height };
  if (windowapp(win.id)?.kind === "family") {
    // the band the family window answers on this screen: a stored size
    // under it rides the pre-law era or a smaller screen — the band is
    // the law, the size heals up to it
    bounds.width = Math.max(bounds.width, fit.width);
    bounds.height = Math.max(bounds.height, fit.height);
  }
  const clamped = clampbounds(bounds, fit);
  const float = win.float ? clampbounds(win.float, fit) : undefined;
  const next: WindowSnapshot = { ...win, ...clamped, float };
  if (!fit.maximized) return next;
  // the family band cannot fit the live screen: every floating pose of
  // the window answers the full snap — the hydrate, the restore and the
  // un-minimize never land the app cut
  const floating =
    win.state === "normal" || (win.state === "minimized" && (win.restoredState ?? "normal") === "normal");
  if (!floating) return next;
  const keep = float ?? clamped;
  return win.state === "minimized"
    ? { ...next, float: keep, restoredState: "maximized" }
    : { ...next, float: keep, state: "maximized" };
}

/** clamps one live snapshot into the current desktop band — the resize
 * answer (a monitor swap, a smaller browser window, the devtools
 * opening): the pose the visitor chose stays (the family verdict belongs
 * to the open and the hydrate doors), the bounds never outlive the band
 * they ride in */
function clampsnapshot(win: WindowSnapshot): WindowSnapshot {
  const fit = livefit(win.id);
  const clamped = clampbounds(win, fit);
  const float = win.float ? clampbounds(win.float, fit) : undefined;
  if (samebounds(clamped, win) && samebounds(float, win.float)) return win;
  return { ...win, ...clamped, float };
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
  const destination: WorkspaceDestination = isWorkspaceDestination(sectionId) ? sectionId : "chat";
  /** the focus counter of the window z order — the win11React hz pattern:
   * every open and every focus increments the counter and stamps the one
   * window (minimized windows drop to WINDOW_MIN_Z); the array keeps its
   * MRU order for the switcher and the top scan */
  const hzRef = useRef(Z_BASE);
  /** the next stamp of the counter (the one write surface of the z order) */
  const nextz = useCallback(() => {
    hzRef.current += 1;
    return hzRef.current;
  }, []);
  /** the desktop boots with the persisted layout (empty on a fresh device) —
   * windows open on demand and the layout rides localStorage */
  const [windows, setWindows] = useState<WindowSnapshot[]>(() => {
    const loaded = loadWindows();
    hzRef.current = Z_BASE + loaded.length;
    return loaded;
  });
  /** the alt-tab gesture: the acrylic task switcher rides above the shell
   * while the chord is held (the first alt+tab mounts it on the window
   * behind the topmost one) */
  const [switching, setSwitching] = useState(false);
  /** the lock posture of the desktop (desktopstate.ts): the Windows lock
   * face rides ON the running desktop — restored from the session posture,
   * flipped by the Win+L / Ctrl+Alt+L chord and by the dt-desktop-lock
   * event (the overlay unlock and any future caller ride it too) */
  const [locked, setLocked] = useState(() => loadDesktopLock() === "locked");
  /** the live ui copy rows (the labels the workspace renders ride the db) */
  useUicopy();

  // the lock posture: the event re-faces the shell the moment a lock or an
  // unlock lands (the chord, the overlay unlock and any future caller)
  useEffect(() => {
    const onLock = (event: Event) => {
      const detail = (event as CustomEvent<DesktopLockState>).detail;
      if (isDesktopLockState(detail)) setLocked(detail === "locked");
    };
    window.addEventListener(DESKTOP_LOCK_EVENT, onLock);
    return () => window.removeEventListener(DESKTOP_LOCK_EVENT, onLock);
  }, []);

  // the Windows lock chord: Win+L (meta+L) or Ctrl+Alt+L lifts the lock
  // face over the running desktop
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "l") return;
      if (event.metaKey || (event.ctrlKey && event.altKey)) {
        event.preventDefault();
        commitDesktopLock("locked");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  /** single mutation entry: the mutations own the z stamping (the focus
   * counter pattern) — the mapper never renumbers behind their back */
  const applyWindows = useCallback((next: (current: WindowSnapshot[]) => WindowSnapshot[]) => {
    setWindows((current) => next(current));
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

  // the live band re-fit: the browser viewport changed (a monitor swap, a
  // smaller browser window, the devtools opening) — every open window
  // re-clamps into the live desktop band so nothing renders past the
  // clipped shell box or under the taskbar (the cut-window law holds at
  // every screen the visitor carries, never only at the spawn). the
  // resize never fires for the internal drags and resizes — those own
  // their bounds — this answers the screen itself changing, and the
  // no-op guard keeps an in-band layout untouched
  useEffect(() => {
    const onResize = () => {
      applyWindows((current) => {
        const next = current.map((win) => clampsnapshot(win));
        return next.some((win, index) => win !== current[index]) ? next : current;
      });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [applyWindows]);

  // the mount re-fit: the hydrate pass answered before this tree mounted
  // (no shell-os element lived yet, so the interface zoom read as 1) — one
  // pass after the mount re-asks the verdict with the live zoom, so a
  // zoomed panel never carries a window the zoom renders cut. one pass
  // only: the resize listener above owns every later change
  useEffect(() => {
    applyWindows((current) => {
      const next = current.map((win) => refitsnapshot(win));
      return next.some((win, index) => win !== current[index]) ? next : current;
    });
  }, [applyWindows]);

  const focusWindow = useCallback(
    (id: string) => {
      applyWindows((current) => {
        const target = current.find((win) => win.id === id);
        if (!target || current[current.length - 1]?.id === id) return current;
        // the focus stamps the counter — the hz pattern (already-top windows
        // keep their stamp: they hold the maximum)
        return [...current.filter((win) => win.id !== id), { ...target, z: nextz() }];
      });
    },
    [applyWindows, nextz],
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

  /** dock and desktop behavior: open, restore, focus or minimize — like a taskbar button.
   * The z stamps ride the focus counter: an opening or a restored window
   * takes the next stamp, a minimized one drops to WINDOW_MIN_Z. */
  const toggleWindow = useCallback(
    (id: string, title: string) => {
      applyWindows((current) => {
        const target = current.find((win) => win.id === id);
        if (!target) return [...current, { ...defaultSnapshot(id, title, current.length), z: nextz() }];
        if (target.state === "minimized") {
          const restored =
            target.restoredState && target.restoredState !== "minimized" ? target.restoredState : "normal";
          return [
            ...current.filter((win) => win.id !== id),
            { ...target, state: restored, restoredState: undefined, z: nextz() },
          ];
        }
        if (current[current.length - 1]?.id === id)
          return current.map((win) =>
            win.id === id ? { ...win, state: "minimized", restoredState: target.state, z: WINDOW_MIN_Z } : win,
          );
        return [...current.filter((win) => win.id !== id), { ...target, z: nextz() }];
      });
    },
    [applyWindows, nextz],
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

  /** destination windows: history opens its own floating window (the z
   * stamps ride the focus counter, like every open of the shell) */
  useEffect(() => {
    if (destination !== "history") return;
    applyWindows((current) => {
      const target = current.find((win) => win.id === "history");
      if (!target)
        return [...current, { ...defaultSnapshot("history", "session history", current.length), z: nextz() }];
      if (target.state === "minimized") {
        const restored = target.restoredState && target.restoredState !== "minimized" ? target.restoredState : "normal";
        return [
          ...current.filter((win) => win.id !== "history"),
          { ...target, state: restored, restoredState: undefined, z: nextz() },
        ];
      }
      if (current[current.length - 1]?.id === "history") return current;
      return [...current.filter((win) => win.id !== "history"), { ...target, z: nextz() }];
    });
  }, [applyWindows, destination, nextz]);

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
        // the windows law: the double click inside the panel opens the
        // family app as the power clip window exactly like every native
        // app of the catalog — the desktop never navigates away from the
        // os. the address bar keeps owning the fullscreen stage (DevThink
        // barra <app> answers the typed url) and the standalone handoff
        // keeps riding the arrive param the panel anchor reads
        toggleWindow(app.target.slug, app.name);
        return;
      }
    },
    [onDestination, onNavigate, toggleWindow],
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
                <p>{uicopy("workspace.history.localTabs")}</p>
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onSelectTab(tab.id)}
                    className={tab.id === activeTabId ? "is-active" : ""}
                  >
                    <Clock fontSize={13} aria-hidden="true" />
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

      {/* the Windows lock face riding ON the running desktop: the mica
          backdrop, the big time/date and the gesture unlock of the auth
          faces — the posture lives in desktopstate.ts, the unlock drops
          the overlay straight back into the session */}
      {locked && (
        <DesktopLock
          onUnlock={() => {
            commitDesktopLock("unlocked");
          }}
        />
      )}
    </main>
  );
}

/** WindowHost — the sandbox body of a registry window: the app anchor with
 * the embedded contract (no shell, no hero inside the frame). the host
 * element registers on the WindowBodySurface context so the in-window
 * bodies measure the window they ride in — the container the @container
 * mirrors of sol.css and the useIsMobile hook answer — instead of the
 * browser viewport (the cut-window bug of the window era). */
function WindowHost({ id }: { id: string }) {
  const app = windowApp(id);
  const hostRef = useRef<HTMLDivElement | null>(null);
  if (!app) return null;
  const Body = app.component;
  return (
    <WindowBodySurface.Provider value={hostRef}>
      <div className="shell-window__host" ref={hostRef}>
        <Body embedded />
      </div>
    </WindowBodySurface.Provider>
  );
}
