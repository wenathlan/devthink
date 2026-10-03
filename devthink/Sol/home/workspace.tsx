/**
 * workspace.tsx — the shell: the tab-first workbench becomes the OS desktop.
 * The session surface (tabs, categories, canvas, command rail, footer) lives
 * inside a floating WindowFrame; the dock keeps chat, history and the family
 * apps one click away with an amber pin on the active item; the thin top bar
 * carries the clean omnibox ("/" — the clean-url doctrine: the shell
 * navigates by internal state, never by a visible route) and the tray with
 * the local time and the gateway state. Every session feature of the
 * previous workbench is preserved one-to-one.
 */
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Command, Lock, Play, Wifi } from "lucide-react";
import { workspaceDestinations, type WorkspaceDestination } from "../../workspace.ts";
import type { DevThinkMessage, DevThinkProvider, DevThinkTab } from "./types";
import { WorkspaceTabs } from "./tabs";
import { WindowFrame, WINDOW_MIN_HEIGHT, type WindowSnapshot } from "./window.frame";
import { SolLogoMark } from "./logo";

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

/** apps that open their own page outside the shell desktop */
type ShellApp = "gateway" | "os" | "docs" | "explore";

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
  onOpenApp?: (app: ShellApp) => void;
};

/** the float band base — windows stack upward from here, below the bar band */
const Z_BASE = 20;
/** the fixed chrome bands of the desktop, in px */
const SHELL_TOP = 44;
const SHELL_BOTTOM = 84;

function messageLabel(message: DevThinkMessage): string {
  return message.role === "assistant" ? "devthink" : message.role;
}

function destinationFrom(sectionId: string): WorkspaceDestination {
  return workspaceDestinations.some((destination) => destination.id === sectionId)
    ? (sectionId as WorkspaceDestination)
    : "chat";
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
  onOpenApp,
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

  const [windows, setWindows] = useState<WindowSnapshot[]>(() => [
    {
      id: "chat",
      title: "session",
      x: Math.round(window.innerWidth * 0.08),
      y: SHELL_TOP + 18,
      width: Math.round(window.innerWidth * 0.84),
      height: Math.round(window.innerHeight - SHELL_TOP - SHELL_BOTTOM - 24),
      state: destination === "chat" ? "maximized" : "normal",
      z: Z_BASE,
    },
  ]);
  const [clock, setClock] = useState(() => formatClock(new Date()));

  useEffect(() => {
    const tick = window.setInterval(() => setClock(formatClock(new Date())), 30_000);
    return () => window.clearInterval(tick);
  }, []);

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

  /** dock behavior: open, restore, focus or minimize — like a taskbar button */
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

  /** destination windows: history opens its own window; chat stays front */
  useEffect(() => {
    applyWindows((current) => {
      const wanted = destination === "history" ? "history" : "chat";
      const title = wanted === "history" ? "session history" : "session";
      const target = current.find((win) => win.id === wanted);
      if (!target) return [...current, defaultSnapshot(wanted, title, current.length)];
      if (target.state === "minimized") {
        const restored = target.restoredState && target.restoredState !== "minimized" ? target.restoredState : "normal";
        return [...current.filter((win) => win.id !== wanted), { ...target, state: restored, restoredState: undefined }];
      }
      if (current[current.length - 1]?.id === wanted) return current;
      return [...current.filter((win) => win.id !== wanted), target];
    });
  }, [applyWindows, destination]);

  const topId = useMemo(() => {
    for (let index = windows.length - 1; index >= 0; index -= 1) {
      const win = windows[index];
      if (win && win.state !== "minimized") return win.id;
    }
    return undefined;
  }, [windows]);

  const dockApps = useMemo(() => {
    const chatOpen = windows.some((win) => win.id === "chat" && win.state !== "minimized");
    const historyOpen = windows.some((win) => win.id === "history" && win.state !== "minimized");
    const apps: Array<{ id: string; label: string; glyph: string; active: boolean; run: () => void }> = [
      { id: "chat", label: "chat", glyph: "◉", active: chatOpen, run: () => toggleWindow("chat", "session") },
      { id: "history", label: "history", glyph: "◷", active: historyOpen, run: () => toggleWindow("history", "session history") },
      { id: "projects", label: "projects", glyph: "▦", active: false, run: () => onDestination("projects") },
      { id: "docs", label: "docs", glyph: "▤", active: false, run: () => onOpenApp?.("docs") },
      { id: "explore", label: "explore", glyph: "◎", active: false, run: () => onOpenApp?.("explore") },
      { id: "gateway", label: "gateway", glyph: "⌁", active: false, run: () => onOpenApp?.("gateway") },
      { id: "os", label: "os", glyph: "▣", active: false, run: () => onOpenApp?.("os") },
      { id: "settings", label: "settings", glyph: "⚙", active: destination === "settings", run: () => onDestination("settings") },
    ];
    return onOpenApp ? apps : apps.filter((app) => !["docs", "explore", "gateway", "os"].includes(app.id));
  }, [destination, onDestination, onOpenApp, toggleWindow, windows]);

  return (
    <main className={`shell-os shell-os--rail-${railMode}`}>
      <div className="shell-os__atmosphere" aria-hidden="true" />

      <header className="shell-bar">
        <button type="button" className="shell-bar__brand" onClick={() => onDestination("chat")} aria-label="Open the DevThink session">
          <SolLogoMark size={18} />
          <strong>DEVTHINK</strong>
          <small>local</small>
        </button>
        <div className="shell-omnibox">
          <Lock size={11} aria-hidden="true" />
          {/* clean-url doctrine: the shell navigates by internal state, so the bar is always "/" */}
          <span className="shell-omnibox__url">/</span>
        </div>
        <div className="shell-tray">
          <span className={paired ? "is-on" : ""}>
            <Wifi size={12} aria-hidden="true" />
            {paired ? userId || "paired" : "local only"}
          </span>
          <time>{clock}</time>
        </div>
      </header>

      <div className="shell-desktop">
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

        {windows.every((win) => win.id !== "chat") && (
          <div className="shell-desktop__empty">
            <p>The session window is closed.</p>
            <span>Open chat from the dock to keep working.</span>
          </div>
        )}
      </div>

      <nav className="shell-dock" aria-label="DevThink dock">
        {dockApps.map((app) => (
          <button key={app.id} type="button" aria-pressed={app.active} onClick={app.run}>
            <span aria-hidden="true">{app.glyph}</span>
            <small>{app.label}</small>
            <i className="shell-dock__pin" aria-hidden="true" />
          </button>
        ))}
        <span className="shell-dock__sep" aria-hidden="true" />
        <button type="button" onClick={onOpenPalette} aria-label="Open the command palette">
          <span aria-hidden="true">
            <Command size={15} />
          </span>
          <small>commands</small>
        </button>
      </nav>
    </main>
  );
}
