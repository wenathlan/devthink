/** Style: DevThink Terminal Atelier — command interaction is compact, keyboard-first and visibly separate from the conversational canvas. */
import { Command, Search, X } from "lucide-react";

type CommandPaletteProps = { open: boolean; onClose: () => void; onAction: (action: string) => void };

const commands = [
  ["new session", "Create a clean provider-scoped session", "⌘ N"],
  ["switch provider", "Choose model and provider endpoint", "⌘ P"],
  ["inspect route", "Show gateway and stream health", "⌘ I"],
  ["open theme", "Preview shared terminal and web tokens", "⌘ T"],
];

export function CommandPalette({ open, onClose, onAction }: CommandPaletteProps) {
  if (!open) return null;
  return (
    <div className="command-palette-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="command-palette" role="dialog" aria-modal="true" aria-label="Command palette" onMouseDown={(event) => event.stopPropagation()}>
        <div className="command-palette__input"><Search size={18} /><input autoFocus placeholder="Search DevThink commands" /><button onClick={onClose} aria-label="Fechar command palette"><X size={16} /></button></div>
        <div className="command-palette__label"><Command size={13} /> workspace commands</div>
        <div className="command-palette__list">{commands.map(([title, detail, key]) => <button key={title} onClick={() => onAction(title)}><span><strong>{title}</strong><small>{detail}</small></span><kbd>{key}</kbd></button>)}</div>
      </section>
    </div>
  );
}
