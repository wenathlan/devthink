/**
 * workspace.tsx — the shell: the OS desktop of the creation panel. The
 * visitor lands on the desktop composition (the dark graphite wallpaper —
 * the CSS --wall-fallback recipe with the WebGL aurora wall over it, one
 * large radial light and the official DevThink mark as the hero at the
 * middle — and the shared app catalog spread around it as desktop icons)
 * and the session surfaces (tabs, categories, canvas, command rail, footer)
 * open as floating WindowFrames on demand — the chat window by clicking its
 * icon, history by clicking History. Windows are Windows-grade: the 30px
 * acrylic titlebar carries the single DevThink lockup (windowframe.tsx), the
 * snap layouts flyout and the aero edge gesture live on the WindowFrame, and
 * a minimized window keeps its dock entry lit with the data-minimized
 * dimmer until a click glides it back out. While any window is open the
 * wallpaper hero recedes (logo discipline: one brand voice per zone). The
 * shared chrome (Sol/shell/ShellChrome.tsx) carries the thin top navbar with
 * the Start button and the clean omnibox ("/" — the clean-url doctrine: the
 * shell navigates by internal state, never by a visible route); the dock
 * keeps the session, history and the family apps one click away. Every
 * session feature of the previous workbench is preserved one-to-one.
 */

import {
  Braces,
  Bug,
  Clock,
  Command,
  Layers,
  NotebookText,
  Play,
  Recycle,
  Sparkles,
  SquareCheckBig,
} from "lucide-react";
import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { alttabkeydown } from "../../alttab.ts";
import { familyurl } from "../../deploybase.ts";
import { pushrecentapp } from "../../recentapps.ts";
import { isWorkspaceDestination, type WorkspaceDestination } from "../../workspace.ts";
import { type AltTabCard, AltTabSwitcher } from "../shell/alttabswitcher.tsx";
import { DESKTOP_APPS, type DesktopApp, seedOsView } from "../../appregistry.ts";
import { ShellChrome } from "../shell/ShellChrome.tsx";
import { DesktopSurface } from "./desktop.tsx";
import { ShaderWall } from "./shaderwall.tsx";
import { WorkspaceTabs } from "./tabs.tsx";
import type { DevThinkMessage, DevThinkProvider, DevThinkTab } from "../../paneltypes.ts";
import { WINDOW_MIN_HEIGHT, WindowFrame, type WindowSnapshot } from "./windowframe.tsx";

/** the work categories with their lucide glyphs (i1: icons are components,
 * never unicode text) */
const categories = [
  ["features", Sparkles],
  ["bugs", Bug],
  ["refactor", Recycle],
  ["snippets", Braces],
  ["tasks", SquareCheckBig],
  ["notes", NotebookText],
  ["all", Layers],
] as const;

type TerminalCategory = (typeof categories)[number][0];

type ShellWorkspaceProps = {
  sectionId: string;
  routeLabel: string;
  /** the derived name of the active session — the chat window's titlebar */
  sessionTitle: string;
  userId?: string | undefined;
  provider: DevThinkProvider;
  messages: DevThinkMessage[];
  tabs: DevThinkTab[];
  activeTabId: string;
  draft: string;
  paired: boolean;
  railMode: "always" | "auto" | "off";
  onDraftChange: (value: string) => void;
  onSend: (event: FormEvent) => void;
  onCategory: (category: TerminalCategory) => void;
  onDestination: (destination: WorkspaceDestination) => void;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onNewTab: () => void;
  onOpenPalette: () => void;
  /** navigates any internal route of the theme (docs, explore, /os, …) */
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

function messageLabel(message: DevThinkMessage): string {
  return message.role === "assistant" ? "devthink" : message.role;
}

function destinationFrom(sectionId: string): WorkspaceDestination {
  return isWorkspaceDestination(sectionId) ? sectionId : "chat";
}

/** default floating snapshot for a freshly opened window (the daedalOS
 * cascade offset — each new window lands 26px down-right of the last) */
function defaultSnapshot(id: string, title: string, openCount: number): WindowSnapshot {
  const cascade = (openCount % 4) * 26;
  return {
    id,
    title,
    x: Math.min(Math.max(28, Math.round(window.innerWidth * 0.2) + cascade), Math.max(28, window.innerWidth - 520)),
    y: SHELL_TOP + 26 + cascade,
    width: Math.min(760, Math.max(460, Math.round(window.innerWidth * 0.52))),
    height: Math.max(WINDOW_MIN_HEIGHT, Math.round(window.innerHeight - SHELL_TOP - SHELL_BOTTOM - 130)),
    state: "normal",
    z: Z_BASE,
  };
}

export function ShellWorkspace({
  sectionId,
  routeLabel,
  sessionTitle,
  userId,
  provider,
  messages,
  tabs,
  activeTabId,
  draft,
  paired,
  railMode,
  onDraftChange,
  onSend,
  onCategory,
  onDestination,
  onSelectTab,
  onCloseTab,
  onNewTab,
  onOpenPalette,
  onNavigate,
}: ShellWorkspaceProps) {
  const destination = destinationFrom(sectionId);
  const active = categories.some(([id]) => id === sectionId) ? (sectionId as TerminalCategory) : "all";
  const entries = messages.filter((message) => message.role !== "system");
  const contextTitle =
    destination === "history" ? "session history" : destination === "settings" ? "local settings" : active;
  const contextMeta =
    destination === "history"
      ? `${tabs.length} open ${tabs.length === 1 ? "tab" : "tabs"} — ${entries.length} local entries`
      : `${entries.length} ${entries.length === 1 ? "entry" : "entries"} — ${routeLabel}`;

  /** the desktop starts with the icon grid only — windows open on demand */
  const [windows, setWindows] = useState<WindowSnapshot[]>([]);
  /** the alt-tab gesture: the acrylic task switcher rides above the shell
   * while the chord is held (the first alt+tab mounts it on the window
   * behind the topmost one) */
  const [switching, setSwitching] = useState(false);

  /** single mutation entry: normalizes the z order from the array order */
  const applyWindows = useCallback((next: (current: WindowSnapshot[]) => WindowSnapshot[]) => {
    setWindows((current) => next(current).map((win, index) => ({ ...win, z: Z_BASE + index })));
  }, []);

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
        toggleWindow(app.target.id, app.target.id === "chat" ? sessionTitle : "session history");
        return;
      }
      if (app.target.kind === "destination") {
        if (isWorkspaceDestination(app.target.id)) onDestination(app.target.id);
        return;
      }
      if (app.target.kind === "route") {
        onNavigate(app.target.href);
        return;
      }
      if (app.target.kind === "external") {
        window.location.assign(familyurl(app.target.slug));
        return;
      }
      seedOsView(app.target.app);
      onNavigate("/os");
    },
    [onDestination, onNavigate, toggleWindow],
  );

  return (
    <main className={`shell-os shell-os--rail-${railMode}`}>
      <div className="shell-os__atmosphere" aria-hidden="true">
        {/* the WebGL aurora wall sits over the css --wall-fallback recipe;
            without WebGL (or under reduced motion) the static recipe shows */}
        <ShaderWall />
      </div>

      <ShellChrome paired={paired} userId={userId} onOpenApp={openApp} openApps={windows.map((win) => win.id)} />

      <div className="shell-desktop">
        <DesktopSurface apps={DESKTOP_APPS} onOpen={openApp} />

        {windows.map((win) => (
          <WindowFrame
            key={win.id}
            win={win}
            active={win.id === topId}
            tabs={
              win.id === "chat" ? (
                <WorkspaceTabs
                  tabs={tabs}
                  activeTab={activeTabId}
                  onSelect={onSelectTab}
                  onClose={onCloseTab}
                  onNew={onNewTab}
                />
              ) : undefined
            }
            onFocus={focusWindow}
            onUpdate={updateWindow}
            onClose={closeWindow}
          >
            {win.id === "chat" ? (
              <>
                <nav className="workspace-taskstrip" aria-label="Work categories">
                  {categories.map(([id, CategoryIcon]) => (
                    <button
                      key={id}
                      type="button"
                      role="tab"
                      aria-selected={active === id && destination === "chat"}
                      className={active === id && destination === "chat" ? "is-active" : ""}
                      onClick={() => onCategory(id)}
                    >
                      <CategoryIcon size={14} strokeWidth={1.75} aria-hidden="true" />
                      {id}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="workspace-taskstrip__command"
                    aria-label="Open the command palette"
                    onClick={onOpenPalette}
                  >
                    <Command size={14} aria-hidden="true" />
                    <span>commands</span>
                  </button>
                </nav>

                <div className="terminal-context">
                  <strong>{contextTitle}</strong>
                  <span>{contextMeta}</span>
                </div>

                <section className="terminal-canvas" aria-live="polite">
                  {destination === "history" && (
                    <div className="terminal-history">
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
                  )}
                  {destination !== "history" && entries.length ? (
                    <div className="terminal-entry-list">
                      {entries.map((message) => (
                        <article
                          className={`terminal-stream-entry terminal-stream-entry--${message.role}`}
                          key={message.id}
                        >
                          <div className="terminal-stream-entry__meta">
                            <span>{messageLabel(message)}</span>
                            <time>{message.time}</time>
                          </div>
                          <h1>{message.title}</h1>
                          <p>{message.body}</p>
                        </article>
                      ))}
                    </div>
                  ) : (
                    destination !== "history" && (
                      <div className="terminal-empty">
                        <p>Nothing is active yet.</p>
                        <span>Describe the next feature, bug or piece of work below.</span>
                      </div>
                    )
                  )}
                </section>

                <form className="terminal-command-rail" onSubmit={onSend}>
                  <button
                    className="terminal-command-rail__palette"
                    type="button"
                    onClick={onOpenPalette}
                    aria-label="Open the command palette"
                  >
                    <Command size={15} aria-hidden="true" />
                  </button>
                  <span className="terminal-command-rail__prompt">&gt;_</span>
                  <input
                    value={draft}
                    onChange={(event) => onDraftChange(event.target.value)}
                    aria-label="DevThink command"
                    placeholder={`Ask DevThink about ${destination === "chat" && active !== "all" ? `${active}…` : "the work…"}`}
                  />
                  <span className="terminal-command-rail__provider">{provider.label.toLowerCase()}</span>
                  <button className="terminal-command-rail__run" type="submit" disabled={!draft.trim()}>
                    <Play size={13} fill="currentColor" aria-hidden="true" />
                    run
                  </button>
                </form>
                <footer className="terminal-footer">
                  <span>provider credentials stay in the local cli</span>
                  <span>tabs — history — ctrl+K commands — enter run</span>
                </footer>
              </>
            ) : (
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
