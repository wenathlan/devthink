/** Style: DevThink Terminal Atelier — a compact navigation rail prioritizes provider state and workspace context. */
import { BookOpenText, FolderTree, Gauge, Network, Plus, Settings2, Sparkles } from "lucide-react";
import { DevThinkLogo } from "@/home/logo";
import type { DevThinkProvider } from "@/home/types";

type ProviderRailProps = {
  providers: DevThinkProvider[];
  selectedProvider: string;
  onProviderSelect: (id: string) => void;
  activeSection: string;
  onNavigate: (path: string) => void;
};

const sections = [
  { label: "Sessions", icon: BookOpenText },
  { label: "Projects", icon: FolderTree },
  { label: "Routes", icon: Network },
  { label: "Usage", icon: Gauge },
];

export function ProviderRail({ providers, selectedProvider, onProviderSelect, activeSection, onNavigate }: ProviderRailProps) {
  return (
    <aside className="provider-rail" aria-label="Navegação DevThink">
      <div className="provider-rail__brand"><DevThinkLogo compact /></div>
      <nav className="provider-rail__nav" aria-label="Áreas de trabalho">
        {sections.map(({ label, icon: Icon }) => {
          const href = label === "Sessions" ? "/" : `/${label.toLowerCase()}`;
          return <button key={label} className={activeSection === label.toLowerCase() || (label === "Sessions" && activeSection === "chat") ? "rail-nav-button rail-nav-button--active" : "rail-nav-button"} onClick={() => onNavigate(href)}>
            <Icon size={17} strokeWidth={1.7} />
            <span>{label}</span>
          </button>;
        })}
      </nav>
      <div className="provider-rail__separator" />
      <div className="provider-rail__heading">
        <span>Providers</span>
        <button onClick={() => onNavigate("/providers")} aria-label="Abrir provedores"><Plus size={14} /></button>
      </div>
      <div className="provider-rail__providers">
        {providers.map((provider) => (
          <button
            key={provider.id}
            className={`provider-item ${provider.id === selectedProvider ? "provider-item--selected" : ""}`}
            onClick={() => onProviderSelect(provider.id)}
          >
            <span className="provider-item__dot" style={{ backgroundColor: provider.tint }} />
            <span className="provider-item__content">
              <strong>{provider.label}</strong>
              <small>{provider.model}</small>
            </span>
            <span className={`provider-item__state provider-item__state--${provider.state}`} aria-label={provider.state} />
          </button>
        ))}
      </div>
      <div className="provider-rail__footer">
        <button className="rail-nav-button" onClick={() => onNavigate("/routes")}>
          <Settings2 size={17} strokeWidth={1.7} /><span>Settings</span>
        </button>
        <div className="devthink-local-state"><Sparkles size={14} /><span>local workspace</span></div>
      </div>
    </aside>
  );
}
