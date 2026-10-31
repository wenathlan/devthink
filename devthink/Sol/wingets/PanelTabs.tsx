/** Style: DevThink Terminal Atelier — browser-tab chrome is a core navigation gesture, not decorative header clutter. The active tab carries data-active="true" beside .workspace-tab--active so the R1-a CSS grades hover/active on one attribute grammar; data-provider exposes the session provider for accent hooks. No tab ever carries a brand mark — the titlebar lockup is the zone's single one (logo discipline). Every string rides the ui store (the uicopy accessor of uistore.ts — the db rows over the same-origin /api/v1/ui/copy lane, the build seed answering offline; the tab label and provider are the session's own data, never copy). */
import {AddRegular as Plus, DismissRegular as X} from "@fluentui/react-icons";
import type { DevThinkTab } from "../../paneltypes.ts";
import { uicopy, useUicopy } from "../../uistore.ts";

type WorkspaceTabsProps = {
  tabs: DevThinkTab[];
  activeTab: string;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  onNew: () => void;
};

export function WorkspaceTabs({ tabs, activeTab, onSelect, onClose, onNew }: WorkspaceTabsProps) {
  // the store ride: the live db rows land once per mount and the strip
  // re-renders on them (the seed answers the first paint with the same
  // words the db serves, so the swap never flashes)
  useUicopy();
  return (
    <div className="workspace-tabs" role="tablist" aria-label={uicopy("panel.nav.tabs.aria")}>
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
              title={`${tab.label} — ${tab.provider}`}
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
                  aria-label={uicopy("panel.nav.tabs.close").replace("{label}", tab.label)}
                  onClick={(event) => {
                    event.stopPropagation();
                    onClose(tab.id);
                  }}
                >
                  <X fontSize={13} />
                </button>
              )}
            </div>
          );
        })}
      </div>
      <button type="button" className="workspace-tabs__new" onClick={onNew} aria-label={uicopy("panel.nav.tabs.new")}>
        <Plus fontSize={16} />
      </button>
    </div>
  );
}
