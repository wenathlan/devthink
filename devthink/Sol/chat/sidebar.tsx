/**
 * sidebar.tsx — the chat rail, windows 11 style: brand, "New chat", the
 * conversation search field (titles and turn text, live), the pinned
 * group above the calendar-day history groups (today, yesterday, the
 * days ago, this week, last week, this month, last month, older) and
 * the theme page links routed through wouter (the real /, /panel,
 * /projects, /docs, /explore and /settings pages — never local copies).
 * The pin flag persists through the os stored-state pattern in its own
 * key — the session record carries no pinned field yet, so the seam
 * lands beside the sessions until chatstate adopts it. Collapses to an
 * 80px icon rail on desktop and becomes a drawer with a scrim on small
 * screens (the scrim is the caller's, via useIsMobile).
 */
import {
  BookOpenRegular as BookOpen,
  NavigationRegular as Compass,
  DismissRegular as Dismiss,
  FolderRegular as FolderKanban,
  HomeRegular as Home,
  type FluentIcon as LucideIcon,
  PanelLeftRegular as PanelLeft,
  PinRegular as Pin,
  AddRegular as Plus,
  SearchRegular as Search,
  SettingsRegular as Settings,
  TabDesktopRegular as Terminal,
  DeleteRegular as Trash2,
} from "@fluentui/react-icons";
import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { chatBuckets, chatNav } from "../../chatlabels.ts";
import { type ChatSession, cx } from "../../chatstate.ts";
import { arrayOf, isString, useStoredState } from "../../usestoredstate.ts";
import { SolBotIcon, type SolBotState } from "./solboticon.tsx";

/** The theme pages the rail links to — existing routes, not local
 * copies. The href and the label of every row ride the chat label
 * table now; the icons stay code — the registry below maps them by
 * nav id. */
export type RailLink = { href: string; label: string; icon: LucideIcon };

/* the rail icon registry keyed by the chat label table's nav ids —
 * icons are code, never interface data, so the glyph lookup stays
 * beside the rows it serves. */
const NAV_ICONS: Record<string, LucideIcon> = {
  home: Home,
  os: Terminal,
  projects: FolderKanban,
  docs: BookOpen,
  explore: Compass,
  settings: Settings,
};

export const CHAT_NAV: RailLink[] = chatNav().map((row) => ({
  href: row.href,
  label: row.label,
  icon: NAV_ICONS[row.id],
}));

const DAY_MS = 86_400_000;

/** the pin store key — the session record carries no pinned field yet, so
 * the flag persists beside the sessions through the same os pattern
 * (localStorage + validating type-guard, storage optional). */
const PINS_KEY = "dt-chat-pins-v1";
const isPinList = arrayOf(isString);

/** dayCount — the local calendar day as a pure index (utc-anchored on the
 * local y/m/d triple), so day math never drifts across dst shifts. */
function dayCount(at: number): number {
  const d = new Date(at);
  return Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY_MS);
}

/** monthCount — the local calendar month as a pure index (year * 12 + month). */
function monthCount(at: number): number {
  const d = new Date(at);
  return d.getFullYear() * 12 + d.getMonth();
}

/** firstWeekDay — the locale's week start in the js getDay convention
 * (0 sunday … 6 saturday). intl carries it on weekInfo when the runtime
 * knows it (probed through a narrowing cast — the lib typings vary);
 * monday is the honest fallback. */
function firstWeekDay(): number {
  try {
    const locale = new Intl.Locale(Intl.DateTimeFormat().resolvedOptions().locale) as Intl.Locale & {
      weekInfo?: { firstDay?: unknown };
    };
    const first = locale.weekInfo?.firstDay;
    if (typeof first === "number" && Number.isInteger(first) && first >= 1 && first <= 7) {
      return first % 7; // intl counts 1 monday … 7 sunday; getDay wants 0 sunday
    }
  } catch {
    /* the runtime without locale week info falls back to monday */
  }
  return 1;
}

/** weekStart — the day index of the week the timestamp lives in. */
function weekStart(at: number, firstDay: number): number {
  const d = new Date(at);
  const back = (d.getDay() - firstDay + 7) % 7;
  return dayCount(at) - back;
}

/** the calendar-day buckets of the session list, newest first — the
 * quiet headers the reference grammar pins, riding the chat label
 * table now. */
const GROUP_ORDER = chatBuckets();

type GroupLabel = string;

/** bucketOf — the calendar bucket a session falls into. day distances win
 * over the week and month bands (the days ago bands beat this week), so
 * the group order stays strictly newest-first. The positions are the
 * logic — the bucket answers the table row's label by index, so no
 * label text lives in this file. */
function bucketOf(at: number, now: number, firstDay: number): GroupLabel {
  const diff = dayCount(now) - dayCount(at);
  if (diff <= 0) return GROUP_ORDER[0];
  if (diff === 1) return GROUP_ORDER[1];
  if (diff === 2) return GROUP_ORDER[2];
  if (diff === 3) return GROUP_ORDER[3];
  const week = Math.round((weekStart(now, firstDay) - weekStart(at, firstDay)) / 7);
  if (week <= 0) return GROUP_ORDER[4];
  if (week === 1) return GROUP_ORDER[5];
  const month = monthCount(now) - monthCount(at);
  if (month <= 0) return GROUP_ORDER[6];
  if (month === 1) return GROUP_ORDER[7];
  return GROUP_ORDER[8];
}

/** groupSessions — the calendar-day buckets; empty buckets are dropped. */
export function groupSessions(sessions: ChatSession[]): Array<{ label: string; items: ChatSession[] }> {
  const buckets = new Map<GroupLabel, ChatSession[]>();
  for (const s of sessions) {
    const key = bucketOf(s.at, Date.now(), firstWeekDay());
    const bucket = buckets.get(key);
    if (bucket) bucket.push(s);
    else buckets.set(key, [s]);
  }
  return GROUP_ORDER.flatMap((label) => {
    const items = buckets.get(label);
    return items ? [{ label, items }] : [];
  });
}

export function Sidebar({
  collapsed,
  onToggleCollapsed,
  sessions,
  activeId,
  onOpen,
  onNew,
  onDelete,
  runningId,
  errorId,
  state,
}: {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  sessions: ChatSession[];
  activeId: string;
  onOpen: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  /** the session with a running round — its row carries the leading
   * spinner slot. absent prop skips the slot entirely. */
  runningId?: string;
  /** the session whose last round failed — its row carries the leading
   * error dot. absent prop skips the slot entirely. */
  errorId?: string;
  /** the mark motion state the body derives from the live phase — the
   * rail brand answers thinking, streaming and idle. */
  state?: SolBotState;
}) {
  const [location] = useLocation();
  const [query, setQuery] = useState("");
  const [pins, setPins] = useStoredState<string[]>(PINS_KEY, [], isPinList);

  const needle = query.trim().toLowerCase();

  /** the live filter — derived titles and turn text (the records carry
   * the turns, so the search reaches inside the conversations). */
  const visible = useMemo(() => {
    if (!needle) return sessions;
    return sessions.filter(
      (s) => s.title.toLowerCase().includes(needle) || s.messages.some((m) => m.content.toLowerCase().includes(needle)),
    );
  }, [needle, sessions]);

  /** the pin flag — lifted into the top group; ids without a session
   * (deleted conversations) never render. */
  const pinned = useMemo(() => {
    const known = new Set(sessions.map((s) => s.id));
    return new Set(pins.filter((id) => known.has(id)));
  }, [pins, sessions]);

  const pinnedRows = useMemo(() => visible.filter((s) => pinned.has(s.id)), [visible, pinned]);
  const groups = useMemo(() => groupSessions(visible.filter((s) => !pinned.has(s.id))), [visible, pinned]);

  const togglePin = (id: string) => {
    setPins((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  /** renderRow — one conversation row: the leading status slot (spinner
   * while running, error dot on failure — only when the caller carries
   * the state), the open button, the hover-revealed pin toggle and the
   * delete key. */
  const renderRow = (s: ChatSession) => {
    const isPinned = pinned.has(s.id);
    const status = s.id === runningId ? "running" : s.id === errorId ? "error" : null;
    return (
      <div key={s.id} className={cx("dtc-item", s.id === activeId && "is-active", isPinned && "is-pinned")}>
        {status ? (
          /* the slot speaks too: the glyph alone is invisible to assistive
           * tech, so a quiet status line carries the state the dot draws. */
          <span className="dtc-item__status" data-state={status} role="status">
            <i className={status === "running" ? "dtc-item__spin" : "dtc-item__dot"} aria-hidden="true" />
            <span className="sr-only">{status === "running" ? "round running" : "round failed"}</span>
          </span>
        ) : null}
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
          className={cx("dtc-item__pin", isPinned && "is-on")}
          onClick={() => togglePin(s.id)}
          aria-pressed={isPinned}
          aria-label={isPinned ? `Unpin conversation ${s.title}` : `Pin conversation ${s.title}`}
          title={isPinned ? "Unpin conversation" : "Pin conversation"}
        >
          <Pin fontSize={14} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="dtc-item__del"
          onClick={() => onDelete(s.id)}
          aria-label={`Delete conversation ${s.title}`}
          title="Delete conversation"
        >
          <Trash2 fontSize={14} aria-hidden="true" />
        </button>
      </div>
    );
  };

  return (
    <aside className="dtc-rail" data-collapsed={collapsed ? "true" : "false"}>
      <div className="dtc-rail__top">
        <Link href="/" className="dtc-rail__brand" title="DevThink home" aria-label="DevThink home">
          <SolBotIcon size={22} state={state} />
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
          <PanelLeft fontSize={17} aria-hidden="true" />
        </button>
      </div>

      {/* the label span folds under the collapsed rail (display none), so
       * the aria-label keeps the key named in both rail states. */}
      <button type="button" className="dtc-rail__new" onClick={onNew} aria-label="New chat">
        <Plus fontSize={17} aria-hidden="true" />
        <span className="dtc-rail__hide">New chat</span>
      </button>

      <div className="dtc-rail__search dtc-rail__hide">
        <div className="dtc-rail__field">
          <Search fontSize={14} aria-hidden="true" />
          <input
            type="search"
            className="dtc-rail__input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search"
            aria-label="Search conversations"
            spellCheck={false}
          />
          {query ? (
            <button
              type="button"
              className="dtc-rail__clear"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              title="Clear search"
            >
              <Dismiss fontSize={12} aria-hidden="true" />
            </button>
          ) : null}
        </div>
        {needle ? (
          <p className="dtc-rail__count" aria-live="polite">
            {visible.length} of {sessions.length}
          </p>
        ) : null}
      </div>

      <nav className="dtc-rail__scroll" aria-label="Conversation history">
        {pinnedRows.length > 0 ? (
          <section key="pinned">
            <p className="dtc-rail__label dtc-rail__label--pin">pinned</p>
            {pinnedRows.map(renderRow)}
          </section>
        ) : null}
        {groups.map((group) => (
          <section key={group.label}>
            <p className="dtc-rail__label">{group.label}</p>
            {group.items.map(renderRow)}
          </section>
        ))}
        {needle ? (
          visible.length === 0 ? (
            <p className="dtc-rail__empty">No matches</p>
          ) : null
        ) : sessions.length === 0 ? (
          <p className="dtc-rail__empty">No conversations yet</p>
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
              aria-label={item.label}
              title={item.label}
            >
              <Icon fontSize={17} aria-hidden="true" />
              <span className="dtc-rail__hide">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
