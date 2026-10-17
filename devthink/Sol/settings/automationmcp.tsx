/**
 * automationmcp.tsx — the settings side of the automation & mcp opt-in
 * contract. One registry (mcpregistry.ts at the app root) rides the browser
 * localStorage adapter: the mcp endpoints a connected llm may reach and the
 * custom providers (any api, any llm) the operator registers. The default
 * is the empty registry and every row answers enabled: false — nothing
 * dials out until the operator adds an address and turns its opt-in toggle
 * on by hand. The safeurl boundary refuses localhost, loopback and private
 * or reserved hosts before a row ever reaches storage, and the registry
 * stores the name of a credential, never the secret itself. Loose
 * component of the settings page, riding the dtw kit.
 */
import { type FormEvent, useMemo, useState } from "react";
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
    setReason(answer.reason ?? "The registry refused the change.");
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
            keyref: editing.keyref,
          });
    if (settle(answer)) setEditing(null);
  }

  return (
    <section className="dtw-card" aria-label="Automation and MCP">
      <h2 className="dtw-cardtitle">Automation registry</h2>
      <p className="dtw-copy">
        Off by default. Any llm connected here controls the apps that opt in, and requests go out only to non-local
        http/https hosts. The registry stores the name of a credential, never the secret itself.
      </p>
      {reason ? (
        <small className="dtw-settings__error" role="alert">
          {reason}
        </small>
      ) : null}

      <h3 className="dtw-console__subhead">Mcp endpoints</h3>
      <table className="dtw-settings__table">
        <thead>
          <tr>
            <th>Endpoint</th>
            <th>Url</th>
            <th>Opt-in</th>
            <th>Actions</th>
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
                      aria-label="endpoint label"
                    />
                  </td>
                  <td>
                    <input
                      className="dtw-settings__input"
                      value={editing.url}
                      onChange={(event) => setEditing({ ...editing, url: event.target.value })}
                      aria-label="endpoint url"
                    />
                  </td>
                  <td>{row.enabled ? "On" : "Off"}</td>
                  <td>
                    <div className="dtw-settings__cellbtns">
                      <button type="submit" form="automation-mcp-edit" className="dtw-btn">
                        Save
                      </button>
                      <button type="button" className="dtw-btn" onClick={() => setEditing(null)}>
                        Cancel
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
                      {row.enabled ? "On" : "Off"}
                    </label>
                  </td>
                  <td>
                    <div className="dtw-settings__cellbtns">
                      <button
                        type="button"
                        className="dtw-btn"
                        onClick={() => setEditing({ id: row.id, label: row.label, url: row.url })}
                      >
                        Edit
                      </button>
                      <button type="button" className="dtw-btn" onClick={() => removeEndpoint(row.id)}>
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ),
            )
          ) : (
            <tr>
              <td colSpan={4}>No mcp endpoint is registered yet, so the llm surface stays closed.</td>
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
          placeholder="label"
          aria-label="new endpoint label"
        />
        <input
          className="dtw-settings__input"
          value={endpointDraft.url}
          onChange={(event) => setEndpointDraft({ ...endpointDraft, url: event.target.value })}
          placeholder="https://mcp.example.com"
          aria-label="new endpoint url"
          spellCheck={false}
          autoComplete="off"
        />
        <button type="submit" className="dtw-btn dtw-btn--primary">
          Add endpoint
        </button>
      </form>

      <h3 className="dtw-console__subhead">Custom providers</h3>
      <table className="dtw-settings__table">
        <thead>
          <tr>
            <th>Provider</th>
            <th>Base url</th>
            <th>Credential</th>
            <th>Opt-in</th>
            <th>Actions</th>
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
                      aria-label="provider label"
                    />
                  </td>
                  <td>
                    <input
                      className="dtw-settings__input"
                      value={editing.baseUrl}
                      onChange={(event) => setEditing({ ...editing, baseUrl: event.target.value })}
                      aria-label="provider base url"
                    />
                  </td>
                  <td>
                    <input
                      className="dtw-settings__input"
                      value={editing.keyref}
                      onChange={(event) => setEditing({ ...editing, keyref: event.target.value })}
                      aria-label="provider credential name"
                    />
                  </td>
                  <td>{row.enabled ? "On" : "Off"}</td>
                  <td>
                    <div className="dtw-settings__cellbtns">
                      <button type="submit" form="automation-mcp-edit" className="dtw-btn">
                        Save
                      </button>
                      <button type="button" className="dtw-btn" onClick={() => setEditing(null)}>
                        Cancel
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
                      {row.enabled ? "On" : "Off"}
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
                        Edit
                      </button>
                      <button type="button" className="dtw-btn" onClick={() => removeProvider(row.id)}>
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ),
            )
          ) : (
            <tr>
              <td colSpan={5}>No custom provider is registered yet, so no personal api or llm rides the apps.</td>
            </tr>
          )}
        </tbody>
      </table>

      <form className="dtw-settings__addform dtw-settings__addform--wide" onSubmit={addProvider}>
        <input
          className="dtw-settings__input"
          value={providerDraft.label}
          onChange={(event) => setProviderDraft({ ...providerDraft, label: event.target.value })}
          placeholder="label"
          aria-label="new provider label"
        />
        <input
          className="dtw-settings__input"
          value={providerDraft.baseUrl}
          onChange={(event) => setProviderDraft({ ...providerDraft, baseUrl: event.target.value })}
          placeholder="https://api.example.com/v1"
          aria-label="new provider base url"
          spellCheck={false}
          autoComplete="off"
        />
        <input
          className="dtw-settings__input"
          value={providerDraft.keyref}
          onChange={(event) => setProviderDraft({ ...providerDraft, keyref: event.target.value })}
          placeholder="credential name"
          aria-label="new provider credential name"
          spellCheck={false}
          autoComplete="off"
        />
        <button type="submit" className="dtw-btn dtw-btn--primary">
          Add provider
        </button>
      </form>
    </section>
  );
}
