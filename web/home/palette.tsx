/** Design: DevThink v1.1.14 — command palette exposes the same local identity, workspace destinations and settings boundary as the Ink renderer. */
import { Command, Search, X } from "lucide-react";

type CommandPaletteProps = { open: boolean; onClose: () => void; onAction: (action: string) => void };

const commands = [
  ["new", "new session", "Create a clean provider-scoped session", "⌘ N"],
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
    <div className="command-palette-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="command-palette" role="dialog" aria-modal="true" aria-label="Command palette" onMouseDown={(event) => event.stopPropagation()}>
        <div className="command-palette__input"><Search size={18} /><input autoFocus placeholder="Search DevThink commands" /><button onClick={onClose} aria-label="Fechar command palette"><X size={16} /></button></div>
        <div className="command-palette__label"><Command size={13} /> workspace commands</div>
        <div className="command-palette__list">{commands.map(([id, title, detail, key]) => <button key={id} onClick={() => onAction(id)}><span><strong>{title}</strong><small>{detail}</small></span><kbd>{key}</kbd></button>)}</div>
      </section>
    </div>
  );
}
