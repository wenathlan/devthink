/** Design: DevThink v1.1.15 — command palette exposes the same local identity,
 * workspace destinations and settings boundary as the Ink renderer. The list
 * rides the command menu grammar of the campaign: 28px single-line items with
 * the 9% hover wash, the 200ms Windows menu curve
 * (cubic-bezier(.79,.14,.15,.86)) on every state change and full keyboard
 * navigation — the input filters live, ArrowUp/ArrowDown move the active
 * item, Enter runs it, Escape closes. */
import { Command, Search, X } from "lucide-react";
import { type KeyboardEvent as ReactKeyboardEvent, useEffect, useMemo, useRef, useState } from "react";

type CommandPaletteProps = { open: boolean; onClose: () => void; onAction: (action: string) => void };

/** the menu curve of the campaign grammar (start/context/jump menus) */
const MENU_EASE = "cubic-bezier(0.79, 0.14, 0.15, 0.86)";
/** the hover wash of the menu grammar */
const MENU_WASH = "rgb(255 255 255 / 9%)";

const commands = [
  ["new", "new session", "Create a clean provider-scoped session", "⌘ N"],
  ["console", "open console", "The canonical design of the devthink cli", "⌘ C"],
  ["gateway", "open gateway", "The embedded gateway console of the catalog", "⌘ G"],
  ["os", "open os", "The local os shell of the family", "⌘ O"],
  ["docs", "open docs", "The documentation library of the family", "⌘ D"],
  ["explore", "open explore", "The exploration gallery of the family", "⌘ X"],
  ["providers", "open providers", "Inspect local provider and model choices", "⌘ P"],
  ["projects", "open projects", "Inspect local workspace records", "⌘ J"],
  ["usage", "open usage", "Review compact local usage records", "⌘ U"],
  ["routes", "inspect routes", "Show gateway and stream health", "⌘ I"],
  ["history", "open history", "Review open local session tabs", "⌘ H"],
  ["settings", "open settings", "Pair or revoke a local browser connection", "⌘ ,"],
];

const itemStyle = {
  alignItems: "center",
  gap: 10,
  minHeight: 28,
  padding: "0 10px",
  transition: `background 200ms ${MENU_EASE}, color 200ms ${MENU_EASE}`,
} as const;

export function CommandPalette({ open, onClose, onAction }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return commands;
    return commands.filter(
      ([, title, detail]) => title.toLowerCase().includes(needle) || detail.toLowerCase().includes(needle),
    );
  }, [query]);

  // the palette opens clean: the filter resets, the active row is the first
  // one and the input takes focus like the Windows start search (no autofocus
  // attribute — the ref focuses once the dialog mounts)
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(0);
    inputRef.current?.focus();
  }, [open]);

  // the active row of the filtered list stays in view the way a real menu
  // scrolls its highlight
  const activeId = matches[active]?.[0];
  useEffect(() => {
    if (!activeId) return;
    document.getElementById(`command-palette-item-${activeId}`)?.scrollIntoView({ block: "nearest" });
  }, [activeId]);

  if (!open) return null;

  const runCommand = (index: number) => {
    const command = matches[index];
    if (!command) return;
    onAction(command[0]);
  };

  const onKeyDown = (event: ReactKeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((current) => (matches.length ? (current + 1) % matches.length : 0));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((current) => (matches.length ? (current - 1 + matches.length) % matches.length : 0));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      runCommand(active);
    }
  };

  return (
    <>
      <button
        type="button"
        className="command-palette-backdrop"
        aria-label="Close the command palette"
        onMouseDown={onClose}
      />
      <section className="command-palette" role="dialog" aria-modal="true" aria-label="Command palette">
        <div className="command-palette__input">
          <Search size={18} />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search DevThink commands"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-palette-list"
            aria-activedescendant={matches[active] ? `command-palette-item-${matches[active][0]}` : undefined}
            aria-label="Search DevThink commands"
            autoComplete="off"
            spellCheck={false}
          />
          <button type="button" onClick={onClose} aria-label="Close the command palette">
            <X size={16} />
          </button>
        </div>
        <div className="command-palette__label">
          <Command size={13} /> workspace commands
        </div>
        <div className="command-palette__list" id="command-palette-list" role="listbox">
          {matches.map(([id, title, detail, key], index) => (
            <button
              key={id}
              type="button"
              role="option"
              id={`command-palette-item-${id}`}
              aria-selected={index === active}
              data-active={index === active}
              style={{
                ...itemStyle,
                // only the active row carries inline paint: the hover wash of
                // the CSS grammar stays free to answer the real :hover state
                ...(index === active ? { background: MENU_WASH, color: "var(--dt-text)" } : {}),
              }}
              onMouseEnter={() => setActive(index)}
              onClick={() => runCommand(index)}
            >
              <span style={{ display: "flex", alignItems: "baseline", gap: 8, minWidth: 0 }}>
                <strong style={{ display: "inline", whiteSpace: "nowrap" }}>{title}</strong>
                <small
                  style={{ display: "inline", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                >
                  {detail}
                </small>
              </span>
              <kbd>{key}</kbd>
            </button>
          ))}
          {!matches.length && <p style={{ margin: 0, padding: "6px 10px 10px" }}>no command matches that search</p>}
        </div>
      </section>
    </>
  );
}
