/** Design: DevThink v1.1.15 — command palette exposes the same local identity,
 * workspace destinations and settings boundary as the Ink renderer. The list
 * rides the command menu grammar of the campaign: 28px single-line items with
 * the 9% hover wash, the 200ms Windows menu curve
 * (cubic-bezier(.79,.14,.15,.86)) on every state change and full keyboard
 * navigation — the input filters live, ArrowUp/ArrowDown move the active
 * item, Enter runs it, Escape closes. The paint is Tailwind composition on
 * the design tokens (task 3-a): the acrylic mica panel, the hairline
 * dividers, the sun-tinted selection tick of the active row. */
import { Command, Search, X } from "lucide-react";
import { type KeyboardEvent as ReactKeyboardEvent, useEffect, useMemo, useRef, useState } from "react";

type CommandPaletteProps = { open: boolean; onClose: () => void; onAction: (action: string) => void };

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
        className="command-palette-backdrop fixed inset-0 z-20 block w-full cursor-default appearance-none border-0 bg-[rgb(9_11_15/72%)] p-0 backdrop-blur-[8px]"
        aria-label="Close the command palette"
        onMouseDown={onClose}
      />
      <section
        className="command-palette acrylic-panel fixed top-[12vh] left-1/2 z-[21] w-[min(620px,calc(100vw-32px))] translate-x-[-50%] animate-palette-in overflow-hidden rounded-lg text-ink"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        <div className="command-palette__input flex items-center gap-2.5 border-b border-(--color-hairline) px-3 py-[13px] text-ink-2 transition-shadow duration-150 focus-within:shadow-[inset_0_-1px_0_rgb(231_233_238/45%)] light:focus-within:shadow-[inset_0_-1px_0_rgb(0_0_0/35%)]">
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
            className="min-h-10 min-w-0 flex-1 border-0 bg-transparent font-mono text-xs text-ink outline-none placeholder:text-ink-3"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close the command palette"
            className="grid h-[34px] w-[34px] cursor-pointer place-items-center rounded-md border-0 bg-transparent text-ink-2 transition-colors duration-150 hover:bg-white/6 hover:text-ink active:scale-[0.94]"
          >
            <X size={16} />
          </button>
        </div>
        <div className="command-palette__label flex items-center gap-1.5 px-[13px] py-2.5 font-mono text-[8px] tracking-[.08em] text-ink-3 uppercase">
          <Command size={13} /> workspace commands
        </div>
        <div className="command-palette__list grid px-[7px] pb-[7px]" id="command-palette-list" role="listbox">
          {matches.map(([id, title, detail, key], index) => (
            <button
              key={id}
              type="button"
              role="option"
              id={`command-palette-item-${id}`}
              aria-selected={index === active}
              data-active={index === active}
              className="flex min-h-7 cursor-pointer items-center justify-between gap-4 rounded-md border-0 bg-transparent px-2.5 py-2.5 text-left text-ink-2 transition-colors duration-200 ease-fluent hover:bg-white/9 hover:text-ink data-[active=true]:bg-white/9 data-[active=true]:text-ink data-[active=true]:shadow-[inset_2px_0_0_var(--color-sun)]"
              onMouseEnter={() => setActive(index)}
              onClick={() => runCommand(index)}
            >
              <span className="flex min-w-0 items-baseline gap-2">
                <strong className="inline whitespace-nowrap text-[11px] font-semibold text-ink">{title}</strong>
                <small className="inline overflow-hidden text-[10px] font-normal text-ellipsis whitespace-nowrap text-ink-3">
                  {detail}
                </small>
              </span>
              <kbd className="rounded-xs border border-(--color-hairline) bg-white/4 px-[5px] py-[2px] font-mono text-[8px] tabular-nums text-ink-3">{key}</kbd>
            </button>
          ))}
          {!matches.length && <p className="m-0 px-2.5 pt-1.5 pb-2.5 font-mono text-[10px] text-ink-3">no command matches that search</p>}
        </div>
      </section>
    </>
  );
}
