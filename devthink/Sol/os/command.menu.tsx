/**
 * command.menu.tsx — the global command bar (Cmd+K / Ctrl+K / gateway
 * button). Searches the surfaces by their real names (Platform, Argan,
 * Cadria, Debonair, StealHead), the platform sections (Chat, Docs,
 * Explore…) and the os actions. Radix Dialog + the engine styles (.cmd-*).
 * Keyboard: up, down, Enter, Esc.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Compass,
  Eraser,
  FolderKanban,
  MessageCircle,
  Moon,
  Search,
  Settings2,
  Sun,
  type LucideIcon,
} from "lucide-react";
import { APPS } from "./apps";
import { ensureCleanLocation } from "../../clean.url";
import type { OSHandle } from "./os.types";

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
    exitTimer.current = window.setTimeout(() => setMounted(false), 220);
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
    []
  );

  const items = useMemo<CmdItem[]>(() => {
    const appItems: CmdItem[] = APPS.map((a) => ({
      id: `app-${a.id}`,
      label: a.name,
      group: "Surfaces",
      hint: a.domain,
      icon: a.icon,
      run: () => os.openApp(a.id),
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
      (i) => i.label.toLowerCase().includes(q) || (i.hint ?? "").toLowerCase().includes(q) || i.group.toLowerCase().includes(q)
    );
  }, [items, query]);

  useEffect(() => {
    setActive(0);
  }, []);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

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
          <Dialog.Overlay
            className="os-overlay"
            forceMount
            data-open={visible ? "true" : "false"}
          />
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
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search apps, sections and actions…"
                aria-label="Search the command bar"
                spellCheck={false}
              />
              <kbd>ESC</kbd>
              <Dialog.Description
                style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}
              >
                Use the arrow keys to navigate and Enter to open.
              </Dialog.Description>
            </div>

            <div className="cmd-list" ref={listRef} role="listbox" aria-label="Results">
              {groups.length === 0 ? (
                <p className="cmd-empty">Nothing found for &ldquo;{query}&rdquo; — try an app or an action.</p>
              ) : (
                groups.map(([group, groupItems]) => (
                  <fieldset key={group} style={{ border: 0, margin: 0, padding: 0, minInlineSize: "auto" }}>
                    <legend className="cmd-group">{group}</legend>
                    {groupItems.map((item) => {
                      flatIndex += 1;
                      const idx = flatIndex;
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          role="option"
                          aria-selected={idx === active}
                          data-index={idx}
                          className={`cmd-item${idx === active ? " active" : ""}`}
                          onMouseEnter={() => setActive(idx)}
                          onClick={() => {
                            onOpenChange(false);
                            item.run();
                          }}
                        >
                          <Icon size={17} strokeWidth={1.8} />
                          <span>{item.label}</span>
                          {item.hint ? <span className="hint">{item.hint}</span> : null}
                        </button>
                      );
                    })}
                  </fieldset>
                ))
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      ) : null}
    </Dialog.Root>
  );
}
