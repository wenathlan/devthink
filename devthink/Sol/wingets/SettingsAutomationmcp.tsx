/**
 * automationmcp.tsx — the settings side of the automation & mcp opt-in
 * contract. One registry (mcpregistry.ts at the app root) rides the browser
 * localStorage adapter: the mcp endpoints a connected llm may reach and the
 * custom providers (any api, any llm) the operator registers. The default
 * is the empty registry and every row answers enabled: false — nothing
 * dials out until the operator adds an address and turns its opt-in toggle
 * on by hand. The safeurl boundary refuses localhost, loopback and private
 * or reserved hosts before a row ever reaches storage, and the registry
 * stores the name of a credential, never the secret itself. Every string
 * the card renders rides the copy store (copy.ts). Loose component of the
 * settings page, riding the dtw kit.
 */
import { type FormEvent, useMemo, useState } from "react";
import { copy } from "../../copy";
import { type CustomProvider, createmcpregistry, localstorageadapter, type McpEndpoint } from "../../mcpregistry";

/** the one localStorage key the registry rides (mcpregistry.ts contract). */
const REGISTRY_KEY = "dt.mcp.registry.v1";

/** the plain answer the registry mutations return. */
type McpAnswer = { ok: boolean; reason?: string };

/** one row being edited inline: the id plus the fields the row carries. */
type EditingRow = { id: string; label: string; url?: string; baseUrl?: string; keyref?: string };

export function AutomationMcp() {
  const registry = useMemo(() => createmcpregistry(localstorageadapter(REGISTRY_KEY)), []);
  const [endpoints, setEndpoints] = useState<McpEndpoint[]>(() => registry.listendpoints());
  const [providers, setProviders] = useState<CustomProvider[]>(() => registry.listproviders());
  const [reason, setReason] = useState<string | null>(null);
  const [endpointDraft, setEndpointDraft] = useState({ label: "", url: "" });
  const [providerDraft, setProviderDraft] = useState({ label: "", baseUrl: "", keyref: "" });
  const [editing, setEditing] = useState<EditingRow | null>(null);

  function refresh() {
    setEndpoints(registry.listendpoints());
    setProviders(registry.listproviders());
  }

  function settle(answer: McpAnswer): boolean {
    if (answer.ok) {
      setReason(null);
      refresh();
      return true;
    }
    setReason(answer.reason ?? copy("settings.automation.refused"));
    return false;
  }

  function addEndpoint(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (settle(registry.addendpoint(endpointDraft))) setEndpointDraft({ label: "", url: "" });
  }

  function addProvider(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (settle(registry.addprovider(providerDraft))) setProviderDraft({ label: "", baseUrl: "", keyref: "" });
  }

  function toggleEndpoint(row: McpEndpoint) {
    void settle(registry.updateendpoint(row.id, { enabled: !row.enabled }));
  }

  function toggleProvider(row: CustomProvider) {
    void settle(registry.updateprovider(row.id, { enabled: !row.enabled }));
  }

  function removeEndpoint(id: string) {
    if (editing?.id === id) setEditing(null);
    void settle(registry.removeendpoint(id));
  }

  function removeProvider(id: string) {
    if (editing?.id === id) setEditing(null);
    void settle(registry.removeprovider(id));
  }

  function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const answer =
      editing.url !== undefined
        ? registry.updateendpoint(editing.id, { label: editing.label, url: editing.url })
        : registry.updateprovider(editing.id, {
            label: editing.label,
            baseUrl: editing.baseUrl,
            keyref: editing.keyref });
    if (settle(answer)) setEditing(null);
  }

  return (
    <section className="dtw-card" aria-label={copy("settings.automation.aria")}>
      <h2 className="dtw-cardtitle">{copy("settings.automation.title")}</h2>
      <p className="dtw-copy">{copy("settings.automation.lede")}</p>
      {reason ? (
        <small className="dtw-settings__error" role="alert">
          {reason}
        </small>
      ) : null}

      <h3 className="dtw-console__subhead">{copy("settings.automation.endpoints.title")}</h3>
      <table className="dtw-settings__table">
        <thead>
          <tr>
            <th>{copy("settings.automation.endpoints.col.endpoint")}</th>
            <th>{copy("settings.automation.endpoints.col.url")}</th>
            <th>{copy("settings.automation.col.optin")}</th>
            <th>{copy("settings.automation.col.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {endpoints.length ? (
            endpoints.map((row) =>
              editing?.id === row.id && editing.url !== undefined ? (
                <tr key={row.id}>
                  <td>
                    <input
                      className="dtw-settings__input"
                      value={editing.label}
                      onChange={(event) => setEditing({ ...editing, label: event.target.value })}
                      aria-label={copy("settings.automation.endpoints.edit.label.aria")}
                    />
                  </td>
                  <td>
                    <input
                      className="dtw-settings__input"
                      value={editing.url}
                      onChange={(event) => setEditing({ ...editing, url: event.target.value })}
                      aria-label={copy("settings.automation.endpoints.edit.url.aria")}
                    />
                  </td>
                  <td>{row.enabled ? copy("settings.automation.on") : copy("settings.automation.off")}</td>
                  <td>
                    <div className="dtw-settings__cellbtns">
                      <button type="submit" form="automation-mcp-edit" className="dtw-btn">
                        {copy("settings.automation.save")}
                      </button>
                      <button type="button" className="dtw-btn" onClick={() => setEditing(null)}>
                        {copy("settings.automation.cancel")}
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={row.id}>
                  <td>{row.label}</td>
                  <td>
                    <code>{row.url}</code>
                  </td>
                  <td>
                    <label className="dtw-settings__switchrow">
                      <input
                        type="checkbox"
                        className="dtw-settings__switch"
                        checked={row.enabled}
                        onChange={() => toggleEndpoint(row)}
                      />
                      <span className="dtw-settings__switchtrack" aria-hidden="true">
                        <span className="dtw-settings__switchthumb" />
                      </span>
                      {row.enabled ? copy("settings.automation.on") : copy("settings.automation.off")}
                    </label>
                  </td>
                  <td>
                    <div className="dtw-settings__cellbtns">
                      <button
                        type="button"
                        className="dtw-btn"
                        onClick={() => setEditing({ id: row.id, label: row.label, url: row.url })}
                      >
                        {copy("settings.automation.edit")}
                      </button>
                      <button type="button" className="dtw-btn" onClick={() => removeEndpoint(row.id)}>
                        {copy("settings.automation.remove")}
                      </button>
                    </div>
                  </td>
                </tr>
              ),
            )
          ) : (
            <tr>
              <td colSpan={4}>{copy("settings.automation.endpoints.empty")}</td>
            </tr>
          )}
        </tbody>
      </table>

      <form id="automation-mcp-edit" onSubmit={saveEdit} />

      <form className="dtw-settings__addform" onSubmit={addEndpoint}>
        <input
          className="dtw-settings__input"
          value={endpointDraft.label}
          onChange={(event) => setEndpointDraft({ ...endpointDraft, label: event.target.value })}
          placeholder={copy("settings.automation.endpoints.label.ph")}
          aria-label={copy("settings.automation.endpoints.label.aria")}
        />
        <input
          className="dtw-settings__input"
          value={endpointDraft.url}
          onChange={(event) => setEndpointDraft({ ...endpointDraft, url: event.target.value })}
          placeholder={copy("settings.automation.endpoints.url.ph")}
          aria-label={copy("settings.automation.endpoints.url.aria")}
          spellCheck={false}
          autoComplete="off"
        />
        <button type="submit" className="dtw-btn dtw-btn--primary">
          {copy("settings.automation.endpoints.add")}
        </button>
      </form>

      <h3 className="dtw-console__subhead">{copy("settings.automation.providers.title")}</h3>
      <table className="dtw-settings__table">
        <thead>
          <tr>
            <th>{copy("settings.automation.providers.col.provider")}</th>
            <th>{copy("settings.automation.providers.col.baseurl")}</th>
            <th>{copy("settings.automation.providers.col.credential")}</th>
            <th>{copy("settings.automation.col.optin")}</th>
            <th>{copy("settings.automation.col.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {providers.length ? (
            providers.map((row) =>
              editing?.id === row.id && editing.baseUrl !== undefined ? (
                <tr key={row.id}>
                  <td>
                    <input
                      className="dtw-settings__input"
                      value={editing.label}
                      onChange={(event) => setEditing({ ...editing, label: event.target.value })}
                      aria-label={copy("settings.automation.providers.edit.label.aria")}
                    />
                  </td>
                  <td>
                    <input
                      className="dtw-settings__input"
                      value={editing.baseUrl}
                      onChange={(event) => setEditing({ ...editing, baseUrl: event.target.value })}
                      aria-label={copy("settings.automation.providers.edit.url.aria")}
                    />
                  </td>
                  <td>
                    <input
                      className="dtw-settings__input"
                      value={editing.keyref}
                      onChange={(event) => setEditing({ ...editing, keyref: event.target.value })}
                      aria-label={copy("settings.automation.providers.edit.credential.aria")}
                    />
                  </td>
                  <td>{row.enabled ? copy("settings.automation.on") : copy("settings.automation.off")}</td>
                  <td>
                    <div className="dtw-settings__cellbtns">
                      <button type="submit" form="automation-mcp-edit" className="dtw-btn">
                        {copy("settings.automation.save")}
                      </button>
                      <button type="button" className="dtw-btn" onClick={() => setEditing(null)}>
                        {copy("settings.automation.cancel")}
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={row.id}>
                  <td>{row.label}</td>
                  <td>
                    <code>{row.baseUrl}</code>
                  </td>
                  <td>
                    <code>{row.keyref}</code>
                  </td>
                  <td>
                    <label className="dtw-settings__switchrow">
                      <input
                        type="checkbox"
                        className="dtw-settings__switch"
                        checked={row.enabled}
                        onChange={() => toggleProvider(row)}
                      />
                      <span className="dtw-settings__switchtrack" aria-hidden="true">
                        <span className="dtw-settings__switchthumb" />
                      </span>
                      {row.enabled ? copy("settings.automation.on") : copy("settings.automation.off")}
                    </label>
                  </td>
                  <td>
                    <div className="dtw-settings__cellbtns">
                      <button
                        type="button"
                        className="dtw-btn"
                        onClick={() =>
                          setEditing({ id: row.id, label: row.label, baseUrl: row.baseUrl, keyref: row.keyref })
                        }
                      >
                        {copy("settings.automation.edit")}
                      </button>
                      <button type="button" className="dtw-btn" onClick={() => removeProvider(row.id)}>
                        {copy("settings.automation.remove")}
                      </button>
                    </div>
                  </td>
                </tr>
              ),
            )
          ) : (
            <tr>
              <td colSpan={5}>{copy("settings.automation.providers.empty")}</td>
            </tr>
          )}
        </tbody>
      </table>

      <form className="dtw-settings__addform dtw-settings__addform--wide" onSubmit={addProvider}>
        <input
          className="dtw-settings__input"
          value={providerDraft.label}
          onChange={(event) => setProviderDraft({ ...providerDraft, label: event.target.value })}
          placeholder={copy("settings.automation.providers.label.ph")}
          aria-label={copy("settings.automation.providers.label.aria")}
        />
        <input
          className="dtw-settings__input"
          value={providerDraft.baseUrl}
          onChange={(event) => setProviderDraft({ ...providerDraft, baseUrl: event.target.value })}
          placeholder={copy("settings.automation.providers.url.ph")}
          aria-label={copy("settings.automation.providers.url.aria")}
          spellCheck={false}
          autoComplete="off"
        />
        <input
          className="dtw-settings__input"
          value={providerDraft.keyref}
          onChange={(event) => setProviderDraft({ ...providerDraft, keyref: event.target.value })}
          placeholder={copy("settings.automation.providers.credential.ph")}
          aria-label={copy("settings.automation.providers.credential.aria")}
          spellCheck={false}
          autoComplete="off"
        />
        <button type="submit" className="dtw-btn dtw-btn--primary">
          {copy("settings.automation.providers.add")}
        </button>
      </form>
    </section>
  );
}
