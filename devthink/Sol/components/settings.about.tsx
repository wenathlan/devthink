/**
 * about.tsx — the About page of the Windows 11 settings shell: the
 * device-specifications card. The browser-local deck answers the local
 * database ledger (the store summary of this machine), the paired deck
 * answers the gateway database ledger from the /settings snapshot. Loose
 * component of the settings page, riding the dtw kit.
 */
import { InfoRegular, SettingsRegular } from "@fluentui/react-icons";
import type { BrowserStoreSummary } from "../../db";
import { copy } from "../../copy";
import { SettingsRow } from "./settings.row";
import type { SettingsSnapshot } from "./settings.settingstypes";

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
        <SettingsRow label="owner" value={snapshot.database.ownerUserId} />
        <SettingsRow label="device" value={snapshot.identity.deviceId} />
        <SettingsRow label="persistence" value={snapshot.database.persistence} />
        <SettingsRow label="workspaces" value={String(snapshot.database.workspaces)} />
        <SettingsRow label="sessions" value={String(snapshot.database.sessions)} />
        <SettingsRow label="browser store" value={local?.database || "devthink.db"} />
      </section>
    );

  return (
    <section className="dtw-card" aria-label={copy("settings.about.database")}>
      <h2 className="dtw-cardtitle">
        <InfoRegular fontSize={15} aria-hidden="true" />
        {copy("settings.about.database")}
      </h2>
      <SettingsRow label="database" value={local?.database || "devthink.db"} />
      <SettingsRow label="owner" value={localIdentity?.userId || "initializing"} />
      <SettingsRow label="device" value={localIdentity?.deviceId || "initializing"} />
      <SettingsRow
        label="records"
        value={`${local?.workspaces || 0} workspaces, ${local?.sessions || 0} sessions, ${
          local?.messages || 0
        } messages`}
      />
    </section>
  );
}
