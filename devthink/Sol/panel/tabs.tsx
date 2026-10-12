/** Style: DevThink Terminal Atelier — browser-tab chrome is a core navigation gesture, not decorative header clutter. The active tab carries data-active="true" beside .workspace-tab--active so the R1-a CSS grades hover/active on one attribute grammar; data-provider exposes the session provider for accent hooks. No tab ever carries a brand mark — the titlebar lockup is the zone's single one (logo discipline). */
import { Plus, X } from "lucide-react";
import type { DevThinkTab } from "./types.ts";

type WorkspaceTabsProps = {
  tabs: DevThinkTab[];
  activeTab: string;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  onNew: () => void;
};

export function WorkspaceTabs({ tabs, activeTab, onSelect, onClose, onNew }: WorkspaceTabsProps) {
  return (
    <div className="workspace-tabs" role="tablist" aria-label="Open sessions">
      <div className="workspace-tabs__scroller">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <div
              key={tab.id}
              className={`workspace-tab ${isActive ? "workspace-tab--active" : ""}`}
              role="tab"
              aria-selected={isActive}
              data-active={isActive ? "true" : undefined}
              data-provider={tab.provider}
              title={`${tab.label} · ${tab.provider}`}
              tabIndex={0}
              onClick={() => onSelect(tab.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(tab.id);
                }
              }}
            >
              <span className="workspace-tab__signal" />
              <span className="workspace-tab__label">{tab.label}</span>
              <span className="workspace-tab__provider">{tab.provider}</span>
              {tabs.length > 1 && (
                <button
                  type="button"
                  className="workspace-tab__close"
                  aria-label={`Close ${tab.label}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onClose(tab.id);
                  }}
                >
                  <X size={13} strokeWidth={1.7} />
                </button>
              )}
            </div>
          );
        })}
      </div>
      <button type="button" className="workspace-tabs__new" onClick={onNew} aria-label="Open a new session">
        <Plus size={16} strokeWidth={1.8} />
      </button>
    </div>
  );
}
