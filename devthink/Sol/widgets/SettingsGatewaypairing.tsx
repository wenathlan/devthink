/**
 * gatewaypairing.tsx — the Gateway & Pairing page of the Windows 11
 * settings shell: the chat gateway card of gatewaycard.tsx, the sync state
 * card (the paired variant reads the gateway snapshot, the browser-local
 * variant answers the local-only ledger with the pair hint) and the
 * credential boundary card the unpaired deck shows. Loose component of
 * the settings page, riding the dtw kit.
 */
import { ArrowSyncRegular, ShieldRegular } from "@fluentui/react-icons";
import type { BrowserStoreSummary } from "../../storagefamily.ts";
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
          <SettingsRow label="state" value="paired-gateway" />
          <SettingsRow label="cli" value={snapshot.database.persistence} />
          <SettingsRow
            label="browser"
            value={`${local?.database || "devthink.db"} with ${local?.messages || 0} cached messages`}
          />
          <SettingsRow label="remote adapter" value="not configured" />
          <SettingsRow
            label="provider"
            value={`${snapshot.provider.activeProvider || "not configured"} with ${
              snapshot.provider.activeModel || "model not configured"
            }`}
          />
        </section>
      ) : (
        <section className="dtw-card" aria-label={copy("settings.gateway.sync")}>
          <h2 className="dtw-cardtitle">
            <ArrowSyncRegular fontSize={15} aria-hidden="true" />
            {copy("settings.gateway.sync")}
          </h2>
          <SettingsRow label="state" value="local-only" />
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
