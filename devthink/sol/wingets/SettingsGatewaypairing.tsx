/**
 * gatewaypairing.tsx — the Gateway & Pairing page of the Windows 11
 * settings shell: the chat gateway card of gatewaycard.tsx, the sync state
 * card (the paired variant reads the gateway snapshot, the browser-local
 * variant answers the local-only ledger with the pair hint) and the
 * credential boundary card the unpaired deck shows. Loose component of
 * the settings page, riding the dtw kit.
 */
import { ArrowSyncRegular, ShieldRegular } from "@fluentui/react-icons";
import type { BrowserStoreSummary } from "../../storage.ts";
import { copy } from "../../copy";
import { GatewayCard } from "./SettingsGatewaycard";
import { SettingsRow } from "./SettingsRow";
import type { SettingsSnapshot } from "./Settingstypes";

type GatewayPairingProps = {
  /** paired gateways answer the snapshot sync ledger */
  paired: boolean;
  /** the /settings snapshot of the paired gateway */
  snapshot?: SettingsSnapshot;
  /** the browser-local store summary of this machine */
  local?: BrowserStoreSummary;
};

/** fills the {slot} holes of one copy row — the template grammar the
 * settings face rides (an unknown slot stays loud, never silent). */
function fill(key: string, slots: Record<string, string>): string {
  return copy(key).replace(/\{(\w+)\}/g, (hole, name: string) => slots[name] ?? hole);
}

/** GatewayPairing — the gateway & pairing category body. */
export function GatewayPairing({ paired, snapshot, local }: GatewayPairingProps) {
  return (
    <>
      <GatewayCard />

      {paired && snapshot ? (
        <section className="dtw-card" aria-label={copy("settings.gateway.sync")}>
          <h2 className="dtw-cardtitle">
            <ArrowSyncRegular fontSize={15} aria-hidden="true" />
            {copy("settings.gateway.sync")}
          </h2>
          <SettingsRow label={copy("settings.gateway.row.state")} value={copy("settings.gateway.state.paired")} />
          <SettingsRow label={copy("settings.gateway.row.cli")} value={snapshot.database.persistence} />
          <SettingsRow
            label={copy("settings.gateway.row.browser")}
            value={fill("settings.gateway.row.browser.value", {
              database: local?.database || "devthink.db",
              messages: String(local?.messages || 0),
            })}
          />
          <SettingsRow
            label={copy("settings.gateway.row.adapter")}
            value={copy("settings.gateway.notConfigured")}
          />
          <SettingsRow
            label={copy("settings.gateway.row.provider")}
            value={fill("settings.gateway.row.provider.value", {
              provider: snapshot.provider.activeProvider || copy("settings.gateway.notConfigured"),
              model: snapshot.provider.activeModel || copy("settings.gateway.model.notConfigured"),
            })}
          />
        </section>
      ) : (
        <section className="dtw-card" aria-label={copy("settings.gateway.sync")}>
          <h2 className="dtw-cardtitle">
            <ArrowSyncRegular fontSize={15} aria-hidden="true" />
            {copy("settings.gateway.sync")}
          </h2>
          <SettingsRow label={copy("settings.gateway.row.state")} value={copy("settings.gateway.state.local")} />
          <p className="dtw-settings__carddesc">{copy("settings.gateway.sync.pairhint")}</p>
        </section>
      )}

      {!paired ? (
        <section className="dtw-card" aria-label={copy("settings.gateway.boundary")}>
          <h2 className="dtw-cardtitle">
            <ShieldRegular fontSize={15} aria-hidden="true" />
            {copy("settings.gateway.boundary")}
          </h2>
          <p className="dtw-settings__carddesc">{copy("settings.gateway.boundary.desc")}</p>
        </section>
      ) : null}
    </>
  );
}
