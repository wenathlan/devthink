/**
 * sidebar.tsx — the chat rail, windows 11 style: brand, "New chat", the
 * conversation history grouped by recency (Today / Previous 7 days / Older)
 * and the theme page links routed through wouter (the real /, /os,
 * /projects, /docs, /explore and /settings pages — never local copies).
 * Collapses to an 80px icon rail on desktop and becomes a drawer with a
 * scrim on small screens (the scrim is the caller's, via useIsMobile).
 */
import { Plus, Trash2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  BookOpen,
  Compass,
  FolderKanban,
  Home,
  PanelLeft,
  Settings,
  Terminal,
  type LucideIcon,
} from "lucide-react";
import { cx, type ChatSession } from "./state";
import { SolBotIcon } from "./solbot.icon";

/** The theme pages the rail links to — existing routes, not local copies. */
export type RailLink = { href: string; label: string; icon: LucideIcon };

export const CHAT_NAV: RailLink[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/os", label: "OS", icon: Terminal },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/docs", label: "Docs", icon: BookOpen },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/settings", label: "Settings", icon: Settings },
];

const DAY_MS = 86_400_000;

function startOfDay(at: number): number {
  const d = new Date(at);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** groupSessions — recency buckets; empty buckets are dropped. */
export function groupSessions(sessions: ChatSession[]): Array<{ label: string; items: ChatSession[] }> {
  const today = startOfDay(Date.now());
  const groups: Array<{ label: string; items: ChatSession[] }> = [
    { label: "Today", items: [] },
    { label: "Previous 7 days", items: [] },
    { label: "Older", items: [] },
  ];
  for (const s of sessions) {
    const day = startOfDay(s.at);
    if (day >= today) groups[0].items.push(s);
    else if (day >= today - 6 * DAY_MS) groups[1].items.push(s);
    else groups[2].items.push(s);
  }
  return groups.filter((g) => g.items.length > 0);
}

export function Sidebar({
  collapsed,
  onToggleCollapsed,
  sessions,
  activeId,
  onOpen,
  onNew,
  onDelete,
}: {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  sessions: ChatSession[];
  activeId: string;
  onOpen: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}) {
  const [location] = useLocation();
  const groups = groupSessions(sessions);

  return (
    <aside className="dtc-rail" data-collapsed={collapsed ? "true" : "false"}>
      <div className="dtc-rail__top">
        <Link href="/" className="dtc-rail__brand" title="DevThink home" aria-label="DevThink home">
          <SolBotIcon size={22} />
          <span className="dtc-rail__word dtc-rail__hide">DevThink</span>
        </Link>
        <button
          type="button"
          className="dtc-rail__collapse"
          onClick={onToggleCollapsed}
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <PanelLeft size={17} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>

      <button type="button" className="dtc-rail__new" onClick={onNew}>
        <Plus size={17} strokeWidth={2} aria-hidden="true" />
        <span className="dtc-rail__hide">New chat</span>
      </button>

      <nav className="dtc-rail__scroll" aria-label="Conversation history">
        {groups.map((group) => (
          <section key={group.label}>
            <p className="dtc-rail__label">{group.label}</p>
            {group.items.map((s) => (
              <div key={s.id} className={cx("dtc-item", s.id === activeId && "is-active")}>
                <button
                  type="button"
                  className="dtc-item__open"
                  onClick={() => onOpen(s.id)}
                  title={s.title}
                  aria-current={s.id === activeId ? "true" : undefined}
                >
                  {s.title}
                </button>
                <button
                  type="button"
                  className="dtc-item__del"
                  onClick={() => onDelete(s.id)}
                  aria-label={`Delete conversation ${s.title}`}
                  title="Delete conversation"
                >
                  <Trash2 size={14} strokeWidth={1.8} aria-hidden="true" />
                </button>
              </div>
            ))}
          </section>
        ))}
        {sessions.length === 0 ? (
          <p className="dtc-rail__empty">No conversations yet — the first one starts in the composer.</p>
        ) : null}
      </nav>

      <nav className="dtc-rail__nav" aria-label="Theme pages">
        {CHAT_NAV.map((item) => {
          const Icon = item.icon;
          const current = location === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="dtc-nav"
              aria-current={current ? "page" : undefined}
              title={item.label}
            >
              <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
              <span className="dtc-rail__hide">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
