/**
 * card.tsx — the browser-local credential section of the providers
 * app: the explicit opt-in that stores one credential in this browser's
 * IndexedDB, never displayed after saving, never sent to the cli, excluded
 * from every sync adapter. Loose component of the providers page.
 */
import {DeleteRegular, KeyRegular} from "@fluentui/react-icons";
import { osText } from "../../oslabels.ts";

type Provider = { id: string; protocol: string; env: string };

export function ProviderCard({
  providers,
  credentialProvider,
  onCredentialProvider,
  credentialDraft,
  onCredentialDraft,
  browserCredentials,
  onSave,
  onClear }: {
  providers: readonly Provider[];
  credentialProvider: string;
  onCredentialProvider: (id: string) => void;
  credentialDraft: string;
  onCredentialDraft: (value: string) => void;
  browserCredentials: readonly string[];
  onSave: () => void;
  onClear: () => void;
}) {
  return (
    <section className="dtw-card">
      <h2 className="dtw-cardtitle">
        <KeyRegular fontSize={15} aria-hidden="true" />
        {osText("providers.card.title")}
      </h2>
      <p className="dtw-copy">{osText("providers.card.copy")}</p>
      <label className="dtw-field">
        <span>{osText("providers.card.provider")}</span>
        <select
          className="dtw-select"
          value={credentialProvider}
          onChange={(event) => onCredentialProvider(event.target.value)}
        >
          {providers.map((provider) => (
            <option key={provider.id} value={provider.id}>
              {provider.id}
            </option>
          ))}
        </select>
      </label>
      <label className="dtw-field">
        <span>{osText("providers.card.credential")}</span>
        <input
          className="dtw-input"
          type="password"
          value={credentialDraft}
          onChange={(event) => onCredentialDraft(event.target.value)}
          autoComplete="off"
          placeholder={osText("providers.card.placeholder")}
        />
      </label>
      <div className="dtw-actions">
        <button type="button" className="dtw-btn dtw-btn--primary" onClick={onSave}>
          <KeyRegular fontSize={14} aria-hidden="true" />
          {osText("providers.card.save")}
        </button>
        {browserCredentials.includes(credentialProvider) ? (
          <button type="button" className="dtw-btn" onClick={onClear}>
            <DeleteRegular fontSize={14} aria-hidden="true" />
            {osText("providers.card.remove")}
          </button>
        ) : null}
      </div>
      <p className="dtw-copy">
        {osText("providers.card.flow.pre")}
        <code>{osText("providers.card.flow.code")}</code>
        {osText("providers.card.flow.post")}
      </p>
    </section>
  );
}
