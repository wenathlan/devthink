/** Design: DevThink v1.1.15 — command palette exposes the same local identity, workspace destinations and settings boundary as the Ink renderer. */
import { Command, Search, X } from "lucide-react";

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
  if (!open) return null;
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
          <input placeholder="Search DevThink commands" />
          <button type="button" onClick={onClose} aria-label="Close the command palette">
            <X size={16} />
          </button>
        </div>
        <div className="command-palette__label">
          <Command size={13} /> workspace commands
        </div>
        <div className="command-palette__list">
          {commands.map(([id, title, detail, key]) => (
            <button key={id} type="button" onClick={() => onAction(id)}>
              <span>
                <strong>{title}</strong>
                <small>{detail}</small>
              </span>
              <kbd>{key}</kbd>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
