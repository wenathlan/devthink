/**
 * about.tsx — the About page of the Windows 11 settings shell: the
 * device-specifications card. The browser-local deck answers the local
 * database ledger (the store summary of this machine), the paired deck
 * answers the gateway database ledger from the /settings snapshot. Loose
 * component of the settings page, riding the dtw kit.
 */
import { InfoRegular, SettingsRegular } from "@fluentui/react-icons";
import type { BrowserStoreSummary } from "../../storage.ts";
import { copy } from "../../copy";
import { SettingsRow } from "./SettingsRow";
import type { SettingsSnapshot } from "./Settingstypes";

/** fills the {slot} holes of one copy row — the template grammar the
 * settings face rides (an unknown slot stays loud, never silent). */
function fill(key: string, slots: Record<string, string>): string {
  return copy(key).replace(/\{(\w+)\}/g, (hole, name: string) => slots[name] ?? hole);
}

type AboutSettingsProps = {
  /** paired gateways answer the gateway database ledger */
  paired: boolean;
  /** the /settings snapshot of the paired gateway */
  snapshot?: SettingsSnapshot;
  /** the browser-local store summary of this machine */
  local?: BrowserStoreSummary;
  /** the browser-local identity of this machine */
  localIdentity?: { userId: string; deviceId: string };
};

/** AboutSettings — the about category body. */
export function AboutSettings({ paired, snapshot, local, localIdentity }: AboutSettingsProps) {
  if (paired && snapshot)
    return (
      <section className="dtw-card" aria-label={copy("settings.about.database.paired")}>
        <h2 className="dtw-cardtitle">
          <SettingsRegular fontSize={15} aria-hidden="true" />
          {copy("settings.about.database.paired")}
        </h2>
        <SettingsRow label={copy("settings.about.row.owner")} value={snapshot.database.ownerUserId} />
        <SettingsRow label={copy("settings.about.row.device")} value={snapshot.identity.deviceId} />
        <SettingsRow label={copy("settings.about.row.persistence")} value={snapshot.database.persistence} />
        <SettingsRow label={copy("settings.about.row.workspaces")} value={String(snapshot.database.workspaces)} />
        <SettingsRow label={copy("settings.about.row.sessions")} value={String(snapshot.database.sessions)} />
        <SettingsRow
          label={copy("settings.about.row.browserstore")}
          value={local?.database || "devthink.db"}
        />
      </section>
    );

  return (
    <section className="dtw-card" aria-label={copy("settings.about.database")}>
      <h2 className="dtw-cardtitle">
        <InfoRegular fontSize={15} aria-hidden="true" />
        {copy("settings.about.database")}
      </h2>
      <SettingsRow label={copy("settings.about.row.database")} value={local?.database || "devthink.db"} />
      <SettingsRow
        label={copy("settings.about.row.owner")}
        value={localIdentity?.userId || copy("settings.about.row.initializing")}
      />
      <SettingsRow
        label={copy("settings.about.row.device")}
        value={localIdentity?.deviceId || copy("settings.about.row.initializing")}
      />
      <SettingsRow
        label={copy("settings.about.row.records")}
        value={fill("settings.about.row.records.value", {
          workspaces: String(local?.workspaces || 0),
          sessions: String(local?.sessions || 0),
          messages: String(local?.messages || 0),
        })}
      />
    </section>
  );
}
