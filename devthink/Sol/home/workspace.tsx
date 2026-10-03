/**
 * workspace.tsx — the shell: the OS desktop. The visitor enters on the icon
 * grid (the shared app catalog renders as beautiful desktop icons) and the
 * session surfaces (tabs, categories, canvas, command rail, footer) open as
 * floating WindowFrames on demand — the chat window by clicking the
 * DevThink icon, history by clicking History. The shared chrome
 * (Sol/shell/ShellChrome.tsx) carries the thin top navbar with the Start
 * button and the clean omnibox ("/" — the clean-url doctrine: the shell
 * navigates by internal state, never by a visible route); the dock keeps
 * the session, history and the family apps one click away. Every session
 * feature of the previous workbench is preserved one-to-one.
 */
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Command, Play } from "lucide-react";
import { isWorkspaceDestination, type WorkspaceDestination } from "../../workspace.ts";
import type { DevThinkMessage, DevThinkProvider, DevThinkTab } from "./types";
import { WorkspaceTabs } from "./tabs";
import { WindowFrame, WINDOW_MIN_HEIGHT, type WindowSnapshot } from "./window.frame";
import { DesktopIconGrid } from "./desktop";
import { ShellChrome } from "../shell/ShellChrome";
import { AppTile } from "../shell/app.tile";
import { DESKTOP_APPS, seedOsView, type DesktopApp } from "../shell/app.registry";

const categories = [
  ["features", "ϟ"],
  ["bugs", "⊗"],
  ["refactor", "◌"],
  ["snippets", "◫"],
  ["tasks", "☑"],
  ["notes", "□"],
  ["all", "◉"],
] as const;

type TerminalCategory = (typeof categories)[number][0];

type ShellWorkspaceProps = {
  sectionId: string;
  routeLabel: string;
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
/** the fixed chrome bands of the desktop, in px (floating navbar + gap) */
const SHELL_TOP = 64;
const SHELL_BOTTOM = 84;

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

function formatClock(date: Date): string {
  return new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(date);
}

/** default floating snapshot for a freshly opened window */
function defaultSnapshot(id: string, title: string, openCount: number): WindowSnapshot {
  const cascade = (openCount % 4) * 28;
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
  const activeGlyph = categories.find(([id]) => id === active)?.[1] || "◉";
  const contextTitle =
    destination === "history" ? "session history" : destination === "settings" ? "local settings" : `${activeGlyph} ${active}`;
  const contextMeta =
    destination === "history"
      ? `${tabs.length} open ${tabs.length === 1 ? "tab" : "tabs"} · ${entries.length} local entries`
      : `${entries.length} ${entries.length === 1 ? "entry" : "entries"} · ${routeLabel}`;

  /** the desktop starts with the icon grid only — windows open on demand */
  const [windows, setWindows] = useState<WindowSnapshot[]>([]);

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
          const restored = target.restoredState && target.restoredState !== "minimized" ? target.restoredState : "normal";
          return [...current.filter((win) => win.id !== id), { ...target, state: restored, restoredState: undefined }];
        }
        if (current[current.length - 1]?.id === id)
          return current.map((win) => (win.id === id ? { ...win, state: "minimized", restoredState: target.state } : win));
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
        return [...current.filter((win) => win.id !== "history"), { ...target, state: restored, restoredState: undefined }];
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

  /** opens one app of the shared catalog from the desktop, the Start menu or the dock */
  const openApp = useCallback(
    (app: DesktopApp) => {
      if (app.target.kind === "window") {
        toggleWindow(app.target.id, app.target.id === "chat" ? "session" : "session history");
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
      seedOsView(app.target.app);
      onNavigate("/os");
    },
    [onDestination, onNavigate, toggleWindow],
  );

  const dockApps = useMemo(() => {
    const isOpen = (id: string) => windows.some((win) => win.id === id && win.state !== "minimized");
    return [
      { app: appById("devthink"), active: isOpen("chat"), run: () => toggleWindow("chat", "session") },
      { app: appById("history"), active: isOpen("history"), run: () => toggleWindow("history", "session history") },
      { app: appById("projects"), active: false, run: () => onDestination("projects") },
      { app: appById("docs"), active: false, run: () => onNavigate("/docs") },
      { app: appById("explore"), active: false, run: () => onNavigate("/explore") },
      { app: appById("gateway"), active: false, run: () => onNavigate("/gateway") },
      { app: appById("os"), active: false, run: () => onNavigate("/os") },
      { app: appById("settings"), active: destination === "settings", run: () => onDestination("settings") },
    ];
  }, [destination, onDestination, onNavigate, toggleWindow, windows]);

  return (
    <main className={`shell-os shell-os--rail-${railMode}`}>
      <div className="shell-os__atmosphere" aria-hidden="true" />

      <ShellChrome paired={paired} userId={userId} onOpenApp={openApp} />

      <div className="shell-desktop">
        <DesktopIconGrid apps={DESKTOP_APPS} onOpen={openApp} />

        {windows.map((win) => (
          <WindowFrame
            key={win.id}
            win={win}
            active={win.id === topId}
            tabs={win.id === "chat" ? (
              <WorkspaceTabs tabs={tabs} activeTab={activeTabId} onSelect={onSelectTab} onClose={onCloseTab} onNew={onNewTab} />
            ) : undefined}
            onFocus={focusWindow}
            onUpdate={updateWindow}
            onClose={closeWindow}
          >
            {win.id === "chat" ? (
              <>
                <nav className="workspace-taskstrip" aria-label="Work categories">
                  {categories.map(([id, glyph]) => (
                    <button
                      key={id}
                      type="button"
                      role="tab"
                      aria-selected={active === id && destination === "chat"}
                      className={active === id && destination === "chat" ? "is-active" : ""}
                      onClick={() => onCategory(id)}
                    >
                      <span>{glyph}</span>
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
                          <span>◷</span>
                          <strong>{tab.label}</strong>
                          <small>{tab.provider}</small>
                        </button>
                      ))}
                    </div>
                  )}
                  {destination !== "history" && entries.length ? (
                    <div className="terminal-entry-list">
                      {entries.map((message) => (
                        <article className={`terminal-stream-entry terminal-stream-entry--${message.role}`} key={message.id}>
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
                  <div className="terminal-wordmark" aria-hidden="true">
                    DEVTHINK
                  </div>
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
                  <span className="terminal-command-rail__prompt">›_</span>
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
                  <span>tabs · history · ⌘K commands · enter run</span>
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
                    <span>◷</span>
                    <strong>{tab.label}</strong>
                    <small>{tab.provider}</small>
                  </button>
                ))}
              </div>
            )}
          </WindowFrame>
        ))}
      </div>

      <nav className="shell-dock" aria-label="DevThink dock">
        {dockApps.map(({ app, active: open, run }) => (
          <button key={app.id} type="button" aria-pressed={open} onClick={run} aria-label={app.name}>
            <AppTile app={app} size={20} />
            <small>{app.name.toLowerCase()}</small>
            <i className="shell-dock__pin" aria-hidden="true" />
          </button>
        ))}
        <span className="shell-dock__sep" aria-hidden="true" />
        <button type="button" onClick={onOpenPalette} aria-label="Open the command palette">
          <span className="shell-dock__glyph" aria-hidden="true">
            <Command size={16} />
          </span>
          <small>commands</small>
        </button>
      </nav>
    </main>
  );
}
