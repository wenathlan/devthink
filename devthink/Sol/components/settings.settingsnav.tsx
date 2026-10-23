/**
 * settingsnav.tsx — the left navigation rail of the Windows 11 settings
 * shell: the account card pinned at the rail top (the identity this
 * machine answers, one tap opens the Accounts page), the search field
 * under it and the rounded entry list below — one fluent glyph and one
 * label per category, the selected entry carrying the accent fill and the
 * left pill indicator. The rail routes by internal state (the anchor owns
 * the active category); the search filters the entries by label. Loose
 * component of the settings page, riding the dtw kit.
 */
import {
  BotRegular,
  ColorRegular,
  HardDriveRegular,
  InfoRegular,
  PersonCircleRegular,
  PlugConnectedRegular,
  SearchRegular } from "@fluentui/react-icons";
import { useState, type ComponentType } from "react";
import { copy } from "../../copy";
import type { SettingsCategoryId } from "./settings.settingstypes";

/** one rail entry: the category id, its fluent glyph and its copy key. */
const ENTRIES: readonly { id: SettingsCategoryId; icon: ComponentType<{ fontSize?: number }>; key: string }[] = [
  { id: "personalization", icon: ColorRegular, key: "settings.nav.personalization" },
  { id: "accounts", icon: PersonCircleRegular, key: "settings.nav.accounts" },
  { id: "gateway", icon: PlugConnectedRegular, key: "settings.nav.gateway" },
  { id: "drives", icon: HardDriveRegular, key: "settings.nav.drives" },
  { id: "automation", icon: BotRegular, key: "settings.nav.automation" },
  { id: "about", icon: InfoRegular, key: "settings.nav.about" },
];

type SettingsNavProps = {
  /** the category the content pane shows right now */
  active: SettingsCategoryId;
  /** selects one category (the anchor owns the routing state) */
  onSelect: (id: SettingsCategoryId) => void;
  /** paired gateways answer their own account line */
  paired: boolean;
  /** the identity this machine answers (the account card headline) */
  accountId?: string;
};

/** SettingsNav — the rail of the settings shell. */
export function SettingsNav({ active, onSelect, paired, accountId }: SettingsNavProps) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const entries = needle
    ? ENTRIES.filter((entry) => copy(entry.key).toLowerCase().includes(needle))
    : ENTRIES;

  return (
    <nav className="dtw-nav dtw-settings__rail" aria-label="Settings sections">
      {/* the account card pinned at the rail top — the windows 11 header of
          the settings rail; one tap opens the Accounts page */}
      <button
        type="button"
        className="dtw-settings__account"
        onClick={() => onSelect("accounts")}
        aria-current={active === "accounts" ? "true" : undefined}
      >
        <span className="dtw-settings__accountglyph" aria-hidden="true">
          <PersonCircleRegular fontSize={26} />
        </span>
        <span className="dtw-settings__accountmeta">
          <strong>{accountId || copy("settings.account.sub.local")}</strong>
          <small>{copy(paired ? "settings.account.sub.paired" : "settings.account.sub.local")}</small>
        </span>
      </button>

      {/* the search field of the rail — filters the categories by label */}
      <div className="dtw-settings__search">
        <SearchRegular fontSize={14} aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={copy("settings.search.placeholder")}
          aria-label={copy("settings.search.placeholder")}
        />
      </div>

      {/* the rounded entry list — one category at a time, the selected
          entry wears the accent fill and the left pill indicator */}
      <div className="dtw-settings__entries" role="list">
        {entries.map((entry) => {
          const Icon = entry.icon;
          const selected = entry.id === active;
          return (
            <button
              key={entry.id}
              type="button"
              className="dtw-navrow dtw-settings__entry"
              data-active={selected ? "true" : undefined}
              onClick={() => onSelect(entry.id)}
              aria-current={selected ? "page" : undefined}
            >
              <Icon fontSize={16} aria-hidden="true" />
              <span>{copy(entry.key)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
