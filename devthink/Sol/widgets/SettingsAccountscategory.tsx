/**
 * accountscategory.tsx — the Accounts page of the Windows 11 settings
 * shell: the paired gateway answers its public identity card (the user id
 * and device ledger plus the public id edit the anchor saves through the
 * gateway) and the browser access card (the revoke action), while the
 * browser-local deck answers the LocalAccount card of identity.tsx. Loose
 * component of the settings page, riding the dtw kit.
 */
import { PersonRegular, PlugDisconnectedRegular } from "@fluentui/react-icons";
import { copy } from "../../copy";
import { LocalAccount } from "./SettingsIdentity";
import { SettingsRow } from "./SettingsRow";
import type { SettingsSnapshot } from "./SettingsSettingstypes";

type AccountsCategoryProps = {
  /** paired gateways answer the public identity card */
  paired: boolean;
  /** the /settings snapshot of the paired gateway */
  snapshot?: SettingsSnapshot;
  /** the public id draft the identity edit row rides */
  publicId: string;
  /** edits the public id draft */
  onPublicIdChange: (value: string) => void;
  /** saves the public id through the gateway */
  onSaveIdentity: () => void;
  /** revokes every paired browser session of this machine */
  onRevoke: () => void;
};

/** AccountsCategory — the accounts category body. */
export function AccountsCategory({
  paired,
  snapshot,
  publicId,
  onPublicIdChange,
  onSaveIdentity,
  onRevoke,
}: AccountsCategoryProps) {
  if (!paired) return <LocalAccount />;

  if (!snapshot)
    return (
      <section className="dtw-card" aria-label={copy("settings.accounts.identity")}>
        <h2 className="dtw-cardtitle">{copy("settings.accounts.identity")}</h2>
        <p className="dtw-settings__carddesc">{copy("settings.gateway.sync.pairhint")}</p>
      </section>
    );

  return (
    <>
      <section className="dtw-card" aria-label={copy("settings.accounts.identity")}>
        <h2 className="dtw-cardtitle">
          <PersonRegular fontSize={15} aria-hidden="true" />
          {copy("settings.accounts.identity")}
        </h2>
        <SettingsRow label="user id" value={snapshot.identity.userId} />
        <SettingsRow label="device" value={snapshot.identity.deviceId} />
        <div className="dtw-settings__field">
          <span className="dtw-settings__fieldlabel">
            <strong>{copy("settings.accounts.identity.id")}</strong>
          </span>
          <input
            className="dtw-settings__input"
            value={publicId}
            onChange={(event) => onPublicIdChange(event.target.value.toLowerCase())}
            minLength={10}
            maxLength={15}
            pattern="[a-z][a-z0-9]{9,14}"
            autoComplete="username"
            aria-label={copy("settings.accounts.identity.id")}
          />
        </div>
        <div className="dtw-settings__actions">
          <button type="button" className="dtw-btn dtw-btn--primary" onClick={onSaveIdentity}>
            {copy("settings.accounts.identity.save")}
          </button>
        </div>
      </section>

      <section className="dtw-card" aria-label={copy("settings.accounts.access")}>
        <h2 className="dtw-cardtitle">
          <PlugDisconnectedRegular fontSize={15} aria-hidden="true" />
          {copy("settings.accounts.access")}
        </h2>
        <p className="dtw-settings__carddesc">{copy("settings.accounts.access.desc")}</p>
        <div className="dtw-settings__actions">
          <button type="button" className="dtw-btn dtw-btn--danger" onClick={onRevoke}>
            {copy("settings.accounts.access.revoke")}
          </button>
        </div>
      </section>
    </>
  );
}
