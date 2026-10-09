/**
 * commandmenu.tsx — the global command bar (Cmd+K / Ctrl+K / gateway
 * button). Searches the surfaces by their real names (Platform, Argan,
 * Cadria, Debonair, StealHead), the platform sections (Chat, Docs,
 * Explore…) and the os actions. Radix Dialog + the engine styles (.cmd-*).
 *
 * The R1-c palette contract: the blur(24px) scrim (.cmd-scrim), a 640px
 * panel at the 14px radius, 44px result rows with the mono kbd chips in
 * the footer, the arrow-key highlight as color-mix(--sig 14%) (one accent
 * per row) and the 220ms scale(.97) enter/exit through the mount state
 * (the ShellChrome recipe). Keyboard: up, down, home, end, Enter, Esc.
 *
 * Routing: family apps route by their `target` kind in apps.ts — "os"
 * seeds the os view (openApp), "web" opens the external site
 * (appExternalUrl). Every current surface is "os".
 */

import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Compass,
  Eraser,
  FolderKanban,
  type LucideIcon,
  MessageCircle,
  Moon,
  Search,
  Settings2,
  Sun,
} from "lucide-react";
import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ensureCleanLocation } from "../../cleanurl";
import { APPS, appExternalUrl } from "./apps";
import type { OSHandle } from "./ostypes";

/** the exit unmount delay: the 220ms exit transition plus one buffer frame. */
const EXIT_MS = 230;

/** the menu item grammar: the 44px palette rows at 12px (R1-c contract). */
const ITEM_STYLE: CSSProperties = {
  minHeight: 44,
  padding: "0 12px",
  gap: 10,
  fontSize: 12,
};

/** the group header: 10px mono uppercase tracked (the micro-label scale). */
const GROUP_STYLE: CSSProperties = {
  font: "600 10px/1.4 var(--dt-mono)",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--dt-faint)",
};

/** the footer hint row: the same micro-label scale over a hairline edge. */
const FOOT_STYLE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 16,
  padding: "8px 14px",
  borderTop: "1px solid var(--dt-edge)",
  color: "var(--dt-faint)",
  font: "500 10px/1 var(--dt-mono)",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};

/** the kbd chips of the footer hint row: mono, hairline, one scale. */
const KBD_STYLE: CSSProperties = {
  font: "600 10px/1 var(--dt-mono)",
  color: "var(--dt-muted)",
  border: "1px solid var(--dt-edge)",
  borderRadius: 4,
  padding: "2px 5px",
  background: "rgb(255 255 255 / 4%)",
};

/** the glyph of each platform section (the identity of the target surface) */
const SECTION_ICONS: Record<string, LucideIcon> = {
  projects: FolderKanban,
  history: Clock,
  docs: BookOpen,
  explore: Compass,
  settings: Settings2,
  aura: MessageCircle,
};

type CmdItem = {
  id: string;
  label: string;
  group: string;
  hint?: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  run: () => void;
};

export function CommandMenu({
  open,
  onOpenChange,
  os,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  os: OSHandle;
}) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement | null>(null);
  /* the Windows mount state: mounted keeps the acrylic panel rendered
     through the exit, visible flips one frame after the mount so the enter
     transition plays (the ShellChrome start-menu recipe) */
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);
  const exitTimer = useRef<number | null>(null);

  useEffect(() => {
    if (open) {
      if (exitTimer.current !== null) {
        window.clearTimeout(exitTimer.current);
        exitTimer.current = null;
      }
      setMounted(true);
      return;
    }
    setVisible(false);
    exitTimer.current = window.setTimeout(() => setMounted(false), EXIT_MS);
  }, [open]);

  /* mounting flips the visible state one frame later (the enter transition) */
  useEffect(() => {
    if (!mounted || !open) return undefined;
    const frame = window.requestAnimationFrame(() => setVisible(true));
    return () => window.cancelAnimationFrame(frame);
  }, [mounted, open]);

  /* the exit timer never outlives the command bar */
  useEffect(
    () => () => {
      if (exitTimer.current !== null) window.clearTimeout(exitTimer.current);
    },
    [],
  );

  const items = useMemo<CmdItem[]>(() => {
    const appItems: CmdItem[] = APPS.map((a) => ({
      id: `app-${a.id}`,
      label: a.name,
      group: "Surfaces",
      hint: a.domain,
      icon: a.icon,
      /* the routing semantics live in apps.ts: os seeds the view, web opens the site */
      run: () => {
        if (a.target === "web") window.open(appExternalUrl(a), "_blank", "noopener,noreferrer");
        else os.openApp(a.id);
      },
    }));
    const devthink = APPS.find((a) => a.id === "devthink");
    const sectionItems: CmdItem[] = (devthink?.pages ?? []).map((p) => {
      const SectionIcon = SECTION_ICONS[p.id] ?? Compass;
      return {
        id: `devthink-${p.id}`,
        label: p.label,
        group: "Platform sections",
        hint: "devthink.pro",
        icon: SectionIcon,
        run: () => os.openApp("devthink", p.id),
      };
    });
    const actionItems: CmdItem[] = [
      {
        id: "act-theme",
        label: os.settings.theme === "dark" ? "Switch to the light theme" : "Switch to the solar theme",
        group: "Actions",
        hint: "theme",
        icon: os.settings.theme === "dark" ? Sun : Moon,
        run: () => os.toggleTheme(),
      },
      {
        id: "act-clean",
        label: "Clean the URL bar now",
        group: "Actions",
        hint: "clean-url",
        icon: Eraser,
        run: () => {
          const changed = ensureCleanLocation();
          toast[changed ? "success" : "info"](changed ? "Bar cleaned" : "Bar was already clean", {
            description: window.location.pathname,
          });
        },
      },
      {
        id: "act-gateway",
        label: "Back to the gateway",
        group: "Actions",
        hint: "home",
        icon: ArrowLeft,
        run: () => os.goGateway(),
      },
    ];
    return [...appItems, ...sectionItems, ...actionItems];
  }, [os]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.label.toLowerCase().includes(q) ||
        (i.hint ?? "").toLowerCase().includes(q) ||
        i.group.toLowerCase().includes(q),
    );
  }, [items, query]);

  /* a shrinking result set keeps the active index inside the ladder */
  useEffect(() => {
    setActive((i) => Math.min(i, Math.max(0, filtered.length - 1)));
  }, [filtered.length]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const groups = useMemo(() => {
    const map = new Map<string, CmdItem[]>();
    filtered.forEach((i) => {
      const arr = map.get(i.group) ?? [];
      arr.push(i);
      map.set(i.group, arr);
    });
    return Array.from(map.entries());
  }, [filtered]);

  let flatIndex = -1;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {mounted ? (
        <Dialog.Portal forceMount>
          <Dialog.Overlay className="os-overlay cmd-scrim" forceMount data-open={visible ? "true" : "false"} />
          <Dialog.Content
            className="cmd-panel"
            forceMount
            data-open={visible ? "true" : "false"}
            aria-describedby={undefined}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((i) => Math.min(filtered.length - 1, i + 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((i) => Math.max(0, i - 1));
              } else if (e.key === "Home") {
                e.preventDefault();
                setActive(0);
              } else if (e.key === "End") {
                e.preventDefault();
                setActive(Math.max(0, filtered.length - 1));
              } else if (e.key === "Enter") {
                e.preventDefault();
                const item = filtered[active];
                if (item) {
                  onOpenChange(false);
                  item.run();
                }
              }
            }}
          >
            <Dialog.Title
              style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}
            >
              Command bar
            </Dialog.Title>
            <div className="cmd-input-row">
              <Search size={18} strokeWidth={1.8} aria-hidden="true" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                placeholder="Search apps, sections and actions…"
                aria-label="Search the command bar"
                spellCheck={false}
              />
              <Dialog.Description
                style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}
              >
                Use the arrow keys to navigate and Enter to open.
              </Dialog.Description>
            </div>

            <div
              className="cmd-list"
              ref={listRef}
              role="listbox"
              aria-label="Results"
              tabIndex={-1}
              aria-activedescendant={filtered[active] ? `cmd-opt-${active}` : undefined}
            >
              {groups.length === 0 ? (
                <p className="cmd-empty">Nothing found for &ldquo;{query}&rdquo; — try an app or an action.</p>
              ) : (
                groups.map(([group, groupItems]) => (
                  <fieldset key={group} style={{ border: 0, margin: 0, padding: 0, minInlineSize: "auto" }}>
                    <legend className="cmd-group" style={GROUP_STYLE}>
                      {group}
                    </legend>
                    {groupItems.map((item) => {
                      flatIndex += 1;
                      const idx = flatIndex;
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          role="option"
                          id={`cmd-opt-${idx}`}
                          aria-selected={idx === active}
                          data-index={idx}
                          data-active={idx === active ? "true" : "false"}
                          className={`cmd-item${idx === active ? " active" : ""}`}
                          style={ITEM_STYLE}
                          onMouseEnter={() => setActive(idx)}
                          onClick={() => {
                            onOpenChange(false);
                            item.run();
                          }}
                        >
                          <Icon size={16} strokeWidth={1.8} />
                          <span>{item.label}</span>
                          {item.hint ? <span className="hint">{item.hint}</span> : null}
                        </button>
                      );
                    })}
                  </fieldset>
                ))
              )}
            </div>

            {/* the footer hint row: the keyboard contract, one micro-label row */}
            <footer className="cmd-foot" style={FOOT_STYLE} aria-hidden="true">
              <span>
                <kbd style={KBD_STYLE}>↑</kbd>
                <kbd style={KBD_STYLE}>↓</kbd> navigate
              </span>
              <span>
                <kbd style={KBD_STYLE}>↵</kbd> open
              </span>
              <span>
                <kbd style={KBD_STYLE}>esc</kbd> close
              </span>
            </footer>
          </Dialog.Content>
        </Dialog.Portal>
      ) : null}
    </Dialog.Root>
  );
}
