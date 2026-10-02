/**
 * command.menu.tsx — the global command bar (Cmd+K / Ctrl+K / gateway
 * button). Searches apps, devthink sections and os actions. Radix Dialog
 * + the engine styles (.cmd-*). Keyboard: up, down, Enter, Esc.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import {
  ArrowLeft,
  Compass,
  Eraser,
  Globe,
  Moon,
  Search,
  Sun,
} from "lucide-react";
import { APPS } from "./apps";
import { ensureCleanLocation } from "./clean.url";
import type { OSHandle } from "./os.types";

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

  const items = useMemo<CmdItem[]>(() => {
    const appItems: CmdItem[] = APPS.map((a) => ({
      id: `app-${a.id}`,
      label: a.name,
      group: "Apps",
      hint: a.domain,
      icon: a.icon,
      run: () => os.openApp(a.id),
    }));
    const devthink = APPS.find((a) => a.id === "devthink");
    const sectionItems: CmdItem[] = (devthink?.pages ?? []).map((p) => ({
      id: `devthink-${p.id}`,
      label: `devthink · ${p.label}`,
      group: "Platform sections",
      hint: p.id,
      icon: p.id === "aura" ? Compass : Globe,
      run: () => os.openApp("devthink", p.id),
    }));
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
      <Dialog.Portal>
        <Dialog.Overlay className="os-overlay" />
        <Dialog.Content
          className="glass cmd-panel"
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
    </Dialog.Root>
  );
}
