/** Style: DevThink Terminal Atelier — browser-tab chrome is a core navigation gesture, not decorative header clutter. */
import { Plus, X } from "lucide-react";
import type { DevThinkTab } from "./types";

type WorkspaceTabsProps = {
  tabs: DevThinkTab[];
  activeTab: string;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  onNew: () => void;
};

export function WorkspaceTabs({ tabs, activeTab, onSelect, onClose, onNew }: WorkspaceTabsProps) {
  return (
    <div className="workspace-tabs" role="tablist" aria-label="Sessões abertas">
      <div className="workspace-tabs__scroller">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`workspace-tab ${tab.id === activeTab ? "workspace-tab--active" : ""}`}
            onClick={() => onSelect(tab.id)}
            role="tab"
            aria-selected={tab.id === activeTab}
          >
            <span className="workspace-tab__signal" />
            <span className="workspace-tab__label">{tab.label}</span>
            <span className="workspace-tab__provider">{tab.provider}</span>
            {tabs.length > 1 && (
              <span
                className="workspace-tab__close"
                role="button"
                tabIndex={0}
                aria-label={`Fechar ${tab.label}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onClose(tab.id);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    event.stopPropagation();
                    onClose(tab.id);
                  }
                }}
              >
                <X size={13} strokeWidth={1.7} />
              </span>
            )}
          </button>
        ))}
      </div>
      <button className="workspace-tabs__new" onClick={onNew} aria-label="Abrir nova sessão">
        <Plus size={16} strokeWidth={1.8} />
      </button>
    </div>
  );
}
