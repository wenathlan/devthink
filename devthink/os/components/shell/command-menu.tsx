"use client";

/* ==========================================================================
   CommandMenu — barra de comando global (⌘K / Ctrl+K / botão do gateway).
   Busca apps, seções do devthink e ações do OS. Radix Dialog + estilos
   do engine (.cmd-*). Teclado: ↑ ↓ Enter Esc.
   ========================================================================== */

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
import { APPS } from "../engine/apps";
import { ensureCleanLocation } from "../engine/clean-url";
import type { OSHandle } from "../engine/os-types";

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
      group: "Seções da plataforma",
      hint: p.id,
      icon: p.id === "aura" ? Compass : Globe,
      run: () => os.openApp("devthink", p.id),
    }));
    const actionItems: CmdItem[] = [
      {
        id: "act-theme",
        label: os.settings.theme === "dark" ? "Mudar para tema claro" : "Mudar para tema solar",
        group: "Ações",
        hint: "tema",
        icon: os.settings.theme === "dark" ? Sun : Moon,
        run: () => os.toggleTheme(),
      },
      {
        id: "act-clean",
        label: "Limpar a barra de URL agora",
        group: "Ações",
        hint: "clean-url",
        icon: Eraser,
        run: () => {
          const changed = ensureCleanLocation();
          toast[changed ? "success" : "info"](changed ? "Barra limpa" : "Barra já estava limpa", {
            description: window.location.pathname,
          });
        },
      },
      {
        id: "act-gateway",
        label: "Voltar ao gateway",
        group: "Ações",
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
  }, [query, open]);

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
            Barra de comando
          </Dialog.Title>
          <div className="cmd-input-row">
            <Search size={18} strokeWidth={1.8} aria-hidden="true" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar apps, seções e ações…"
              aria-label="Buscar na barra de comando"
              spellCheck={false}
            />
            <kbd>ESC</kbd>
            <Dialog.Description
              style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}
            >
              Use as setas para navegar e Enter para abrir.
            </Dialog.Description>
          </div>

          <div className="cmd-list" ref={listRef} role="listbox" aria-label="Resultados">
            {groups.length === 0 ? (
              <p className="cmd-empty">Nada encontrado para “{query}” — tente um app ou uma ação.</p>
            ) : (
              groups.map(([group, groupItems]) => (
                <div key={group} role="group" aria-label={group}>
                  <p className="cmd-group">{group}</p>
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
                </div>
              ))
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

