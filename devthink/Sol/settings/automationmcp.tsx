/**
 * automationmcp.tsx — the Settings side of the automation & MCP opt-in
 * contract. One registry (mcpregistry.ts at the app root) rides the browser
 * localStorage adapter: the MCP endpoints a connected LLM may reach and the
 * custom providers (any API, any LLM) the operator registers. The hardcoded
 * default is the empty registry and every row answers enabled: false —
 * nothing dials out until the operator adds an address and turns its opt-in
 * toggle on by hand. The safeurl boundary refuses localhost, loopback and
 * private or reserved hosts before a row ever reaches storage, and the
 * registry stores the name of a credential, never the secret itself.
 */

/** Style: DevThink Terminal Atelier — campaign v3 r2-c: the full-measure
 * section of the settings deck (index 05; no other section shares its
 * span): two ledgers as ruled row tables — one hairline per record, rows
 * hover on a 6% signal tint, no boxed cell grid — with the opt-in toggles
 * as real spring switches (cubic-bezier(.2,1.2,.4,1) 300ms), two add forms
 * on the shared input ring, honest empty states and the one sentence about
 * what opting in means. Every action carries the .press voice. */
import { type CSSProperties, type FormEvent, useMemo, useState } from "react";
import { type CustomProvider, createmcpregistry, localstorageadapter, type McpEndpoint } from "../../mcpregistry";

/** the one localStorage key the registry rides (mcpregistry.ts contract). */
const REGISTRY_KEY = "dt.mcp.registry.v1";

/** the plain answer the registry mutations return. */
type McpAnswer = { ok: boolean; reason?: string };

/** one row being edited inline: the id plus the fields the row carries. */
type EditingRow = { id: string; label: string; url?: string; baseUrl?: string; keyref?: string };

const addFormStyle: CSSProperties = { display: "grid", gap: 10, alignItems: "center" };
const editFieldStyle: CSSProperties = { width: "100%", minWidth: 0 };

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
    setReason(answer.reason ?? "the registry refused the change.");
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
    <section id="automation" className="r2c-sec" aria-label="Automation and MCP">
      <header className="r2c-sec__head">
        <span className="r2c-sec__index" aria-hidden="true">
          05
        </span>
        <div style={{ minWidth: 0 }}>
          <p className="r2c-sec__eyebrow">automation &amp; mcp · opt-in</p>
          <h2 className="r2c-sec__title">Automation registry.</h2>
        </div>
      </header>
      <p className="r2c-sec__copy">
        off by default; any LLM connected here controls the apps that opt in; requests go out only to non-local
        http/https hosts. the registry stores the name of a credential, never the secret itself.
      </p>
      {reason ? (
        <small className="r2c-gw__error" role="alert">
          {reason}
        </small>
      ) : null}

      <table className="r2c-table">
        <thead>
          <tr>
            <th>mcp endpoint</th>
            <th>url</th>
            <th>opt-in</th>
            <th>actions</th>
          </tr>
        </thead>
        <tbody>
          {endpoints.length ? (
            endpoints.map((row) =>
              editing?.id === row.id && editing.url !== undefined ? (
                <tr key={row.id}>
                  <td>
                    <input
                      className="r2c-input"
                      style={editFieldStyle}
                      value={editing.label}
                      onChange={(event) => setEditing({ ...editing, label: event.target.value })}
                      aria-label="endpoint label"
                    />
                  </td>
                  <td>
                    <input
                      className="r2c-input"
                      style={editFieldStyle}
                      value={editing.url}
                      onChange={(event) => setEditing({ ...editing, url: event.target.value })}
                      aria-label="endpoint url"
                    />
                  </td>
                  <td>{row.enabled ? "on" : "off"}</td>
                  <td>
                    <div className="r2c-cellbtns">
                      <button type="submit" form="automation-mcp-edit" className="r2c-btn press">
                        save
                      </button>
                      <button type="button" className="r2c-btn press" onClick={() => setEditing(null)}>
                        cancel
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
                    <label className="r2c-switchrow">
                      <input
                        type="checkbox"
                        className="r2c-switch"
                        checked={row.enabled}
                        onChange={() => toggleEndpoint(row)}
                      />
                      <span className="r2c-switch__track" aria-hidden="true">
                        <span className="r2c-switch__thumb" />
                      </span>
                      {row.enabled ? "on" : "off"}
                    </label>
                  </td>
                  <td>
                    <div className="r2c-cellbtns">
                      <button
                        type="button"
                        className="r2c-btn press"
                        onClick={() => setEditing({ id: row.id, label: row.label, url: row.url })}
                      >
                        edit
                      </button>
                      <button type="button" className="r2c-btn press" onClick={() => removeEndpoint(row.id)}>
                        remove
                      </button>
                    </div>
                  </td>
                </tr>
              ),
            )
          ) : (
            <tr>
              <td colSpan={4}>no mcp endpoint is registered yet, so the LLM surface stays closed.</td>
            </tr>
          )}
        </tbody>
      </table>

      <form id="automation-mcp-edit" onSubmit={saveEdit} />

      <form onSubmit={addEndpoint} style={{ ...addFormStyle, gridTemplateColumns: "1fr 2fr auto" }}>
        <input
          className="r2c-input"
          value={endpointDraft.label}
          onChange={(event) => setEndpointDraft({ ...endpointDraft, label: event.target.value })}
          placeholder="label"
          aria-label="new endpoint label"
        />
        <input
          className="r2c-input"
          value={endpointDraft.url}
          onChange={(event) => setEndpointDraft({ ...endpointDraft, url: event.target.value })}
          placeholder="https://mcp.example.com"
          aria-label="new endpoint url"
          spellCheck={false}
          autoComplete="off"
        />
        <button type="submit" className="r2c-btn r2c-btn--primary press">
          add endpoint
        </button>
      </form>

      <table className="r2c-table">
        <thead>
          <tr>
            <th>custom provider</th>
            <th>base url</th>
            <th>credential</th>
            <th>opt-in</th>
            <th>actions</th>
          </tr>
        </thead>
        <tbody>
          {providers.length ? (
            providers.map((row) =>
              editing?.id === row.id && editing.baseUrl !== undefined ? (
                <tr key={row.id}>
                  <td>
                    <input
                      className="r2c-input"
                      style={editFieldStyle}
                      value={editing.label}
                      onChange={(event) => setEditing({ ...editing, label: event.target.value })}
                      aria-label="provider label"
                    />
                  </td>
                  <td>
                    <input
                      className="r2c-input"
                      style={editFieldStyle}
                      value={editing.baseUrl}
                      onChange={(event) => setEditing({ ...editing, baseUrl: event.target.value })}
                      aria-label="provider base url"
                    />
                  </td>
                  <td>
                    <input
                      className="r2c-input"
                      style={editFieldStyle}
                      value={editing.keyref}
                      onChange={(event) => setEditing({ ...editing, keyref: event.target.value })}
                      aria-label="provider credential name"
                    />
                  </td>
                  <td>{row.enabled ? "on" : "off"}</td>
                  <td>
                    <div className="r2c-cellbtns">
                      <button type="submit" form="automation-mcp-edit" className="r2c-btn press">
                        save
                      </button>
                      <button type="button" className="r2c-btn press" onClick={() => setEditing(null)}>
                        cancel
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
                    <label className="r2c-switchrow">
                      <input
                        type="checkbox"
                        className="r2c-switch"
                        checked={row.enabled}
                        onChange={() => toggleProvider(row)}
                      />
                      <span className="r2c-switch__track" aria-hidden="true">
                        <span className="r2c-switch__thumb" />
                      </span>
                      {row.enabled ? "on" : "off"}
                    </label>
                  </td>
                  <td>
                    <div className="r2c-cellbtns">
                      <button
                        type="button"
                        className="r2c-btn press"
                        onClick={() =>
                          setEditing({ id: row.id, label: row.label, baseUrl: row.baseUrl, keyref: row.keyref })
                        }
                      >
                        edit
                      </button>
                      <button type="button" className="r2c-btn press" onClick={() => removeProvider(row.id)}>
                        remove
                      </button>
                    </div>
                  </td>
                </tr>
              ),
            )
          ) : (
            <tr>
              <td colSpan={5}>no custom provider is registered yet, so no personal api or llm rides the apps.</td>
            </tr>
          )}
        </tbody>
      </table>

      <form onSubmit={addProvider} style={{ ...addFormStyle, gridTemplateColumns: "1fr 2fr 1fr auto" }}>
        <input
          className="r2c-input"
          value={providerDraft.label}
          onChange={(event) => setProviderDraft({ ...providerDraft, label: event.target.value })}
          placeholder="label"
          aria-label="new provider label"
        />
        <input
          className="r2c-input"
          value={providerDraft.baseUrl}
          onChange={(event) => setProviderDraft({ ...providerDraft, baseUrl: event.target.value })}
          placeholder="https://api.example.com/v1"
          aria-label="new provider base url"
          spellCheck={false}
          autoComplete="off"
        />
        <input
          className="r2c-input"
          value={providerDraft.keyref}
          onChange={(event) => setProviderDraft({ ...providerDraft, keyref: event.target.value })}
          placeholder="credential name"
          aria-label="new provider credential name"
          spellCheck={false}
          autoComplete="off"
        />
        <button type="submit" className="r2c-btn r2c-btn--primary press">
          add provider
        </button>
      </form>
    </section>
  );
}
