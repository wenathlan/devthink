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

/** Style: DevThink Terminal Atelier — the full-measure card of the settings
 * rhythm (it takes the whole band; no other card shares its span): two ledgers
 * as ruled row tables — row hairlines instead of a boxed cell grid — with the
 * opt-in toggles inline, two add forms, honest empty states and the one
 * sentence about what opting in means. Tabular numerals and the lowercase
 * mono eyebrow; every field reuses the shared dtc-gw input ring grammar. */
import { PlugZap } from "lucide-react";
import { type CSSProperties, type FormEvent, useMemo, useState } from "react";
import { type CustomProvider, createmcpregistry, localstorageadapter, type McpEndpoint } from "../../mcpregistry";

/** the one localStorage key the registry rides (mcpregistry.ts contract). */
const REGISTRY_KEY = "dt.mcp.registry.v1";

/** the plain answer the registry mutations return. */
type McpAnswer = { ok: boolean; reason?: string };

/** one row being edited inline: the id plus the fields the row carries. */
type EditingRow = { id: string; label: string; url?: string; baseUrl?: string; keyref?: string };

const cardStyle: CSSProperties = {
  minWidth: 0,
  borderRadius: 8,
  borderColor: "var(--dt-edge)",
  padding: 24,
  fontVariantNumeric: "tabular-nums",
};
const eyebrowStyle: CSSProperties = {
  color: "var(--dt-muted)",
  fontSize: 10,
  letterSpacing: ".08em",
  textTransform: "none",
};
const fieldClass = "dtc-gw__input";
const fieldStyle: CSSProperties = {
  minHeight: 30,
  padding: "0 8px",
  color: "var(--dt-text)",
  background: "rgb(0 0 0 / 24%)",
  border: "1px solid var(--dt-edge)",
  borderRadius: 6,
  font: "400 11px var(--dt-mono)",
};
/* the ledgers read as ruled rows: no cell grid, one hairline per record */
const ledgerStyle: CSSProperties = { width: "100%", borderCollapse: "collapse", font: "11px/1.6 var(--dt-mono)" };
const headCellStyle: CSSProperties = {
  padding: "8px 10px",
  border: 0,
  borderBottom: "1px solid var(--dt-edge-strong)",
  color: "var(--dt-muted)",
  font: "600 9px var(--dt-mono)",
  letterSpacing: ".08em",
  textAlign: "left",
};
const cellStyle: CSSProperties = {
  padding: "9px 10px",
  border: 0,
  borderBottom: "1px solid var(--dt-edge)",
  color: "var(--dt-muted)",
  font: "400 11px var(--dt-mono)",
  textAlign: "left",
};
const checkboxStyle: CSSProperties = { accentColor: "var(--sol-sun)" };
const addFormStyle: CSSProperties = { display: "grid", gap: 8, alignItems: "center" };

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
    <section style={cardStyle} aria-label="Automation and MCP">
      <PlugZap size={18} />
      <span style={eyebrowStyle}>automation &amp; mcp · opt-in</span>
      <p>
        off by default; any LLM connected here controls the apps that opt in; requests go out only to non-local
        http/https hosts. the registry stores the name of a credential, never the secret itself.
      </p>
      {reason ? <small role="alert">{reason}</small> : null}

      <table className="control-table" style={ledgerStyle}>
        <thead>
          <tr>
            <th style={headCellStyle}>mcp endpoint</th>
            <th style={headCellStyle}>url</th>
            <th style={headCellStyle}>opt-in</th>
            <th style={headCellStyle}>actions</th>
          </tr>
        </thead>
        <tbody>
          {endpoints.length ? (
            endpoints.map((row) =>
              editing?.id === row.id && editing.url !== undefined ? (
                <tr key={row.id}>
                  <td style={cellStyle}>
                    <input
                      className={fieldClass}
                      style={fieldStyle}
                      value={editing.label}
                      onChange={(event) => setEditing({ ...editing, label: event.target.value })}
                      aria-label="endpoint label"
                    />
                  </td>
                  <td style={cellStyle}>
                    <input
                      className={fieldClass}
                      style={fieldStyle}
                      value={editing.url}
                      onChange={(event) => setEditing({ ...editing, url: event.target.value })}
                      aria-label="endpoint url"
                    />
                  </td>
                  <td style={cellStyle}>{row.enabled ? "on" : "off"}</td>
                  <td style={cellStyle}>
                    <button type="submit" form="automation-mcp-edit">
                      save
                    </button>
                    <button type="button" onClick={() => setEditing(null)}>
                      cancel
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={row.id}>
                  <td style={cellStyle}>{row.label}</td>
                  <td style={cellStyle}>
                    <code>{row.url}</code>
                  </td>
                  <td style={cellStyle}>
                    <label>
                      <input
                        type="checkbox"
                        style={checkboxStyle}
                        checked={row.enabled}
                        onChange={() => toggleEndpoint(row)}
                      />
                      {row.enabled ? "on" : "off"}
                    </label>
                  </td>
                  <td style={cellStyle}>
                    <button type="button" onClick={() => setEditing({ id: row.id, label: row.label, url: row.url })}>
                      edit
                    </button>
                    <button type="button" onClick={() => removeEndpoint(row.id)}>
                      remove
                    </button>
                  </td>
                </tr>
              ),
            )
          ) : (
            <tr>
              <td colSpan={4} style={cellStyle}>
                no mcp endpoint is registered yet, so the LLM surface stays closed.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <form id="automation-mcp-edit" onSubmit={saveEdit} />

      <form onSubmit={addEndpoint} style={{ ...addFormStyle, gridTemplateColumns: "1fr 2fr auto" }}>
        <input
          className={fieldClass}
          style={fieldStyle}
          value={endpointDraft.label}
          onChange={(event) => setEndpointDraft({ ...endpointDraft, label: event.target.value })}
          placeholder="label"
          aria-label="new endpoint label"
        />
        <input
          className={fieldClass}
          style={fieldStyle}
          value={endpointDraft.url}
          onChange={(event) => setEndpointDraft({ ...endpointDraft, url: event.target.value })}
          placeholder="https://mcp.example.com"
          aria-label="new endpoint url"
          spellCheck={false}
          autoComplete="off"
        />
        <button type="submit">add endpoint</button>
      </form>

      <table className="control-table" style={ledgerStyle}>
        <thead>
          <tr>
            <th style={headCellStyle}>custom provider</th>
            <th style={headCellStyle}>base url</th>
            <th style={headCellStyle}>credential</th>
            <th style={headCellStyle}>opt-in</th>
            <th style={headCellStyle}>actions</th>
          </tr>
        </thead>
        <tbody>
          {providers.length ? (
            providers.map((row) =>
              editing?.id === row.id && editing.baseUrl !== undefined ? (
                <tr key={row.id}>
                  <td style={cellStyle}>
                    <input
                      className={fieldClass}
                      style={fieldStyle}
                      value={editing.label}
                      onChange={(event) => setEditing({ ...editing, label: event.target.value })}
                      aria-label="provider label"
                    />
                  </td>
                  <td style={cellStyle}>
                    <input
                      className={fieldClass}
                      style={fieldStyle}
                      value={editing.baseUrl}
                      onChange={(event) => setEditing({ ...editing, baseUrl: event.target.value })}
                      aria-label="provider base url"
                    />
                  </td>
                  <td style={cellStyle}>
                    <input
                      className={fieldClass}
                      style={fieldStyle}
                      value={editing.keyref}
                      onChange={(event) => setEditing({ ...editing, keyref: event.target.value })}
                      aria-label="provider credential name"
                    />
                  </td>
                  <td style={cellStyle}>{row.enabled ? "on" : "off"}</td>
                  <td style={cellStyle}>
                    <button type="submit" form="automation-mcp-edit">
                      save
                    </button>
                    <button type="button" onClick={() => setEditing(null)}>
                      cancel
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={row.id}>
                  <td style={cellStyle}>{row.label}</td>
                  <td style={cellStyle}>
                    <code>{row.baseUrl}</code>
                  </td>
                  <td style={cellStyle}>
                    <code>{row.keyref}</code>
                  </td>
                  <td style={cellStyle}>
                    <label>
                      <input
                        type="checkbox"
                        style={checkboxStyle}
                        checked={row.enabled}
                        onChange={() => toggleProvider(row)}
                      />
                      {row.enabled ? "on" : "off"}
                    </label>
                  </td>
                  <td style={cellStyle}>
                    <button
                      type="button"
                      onClick={() =>
                        setEditing({ id: row.id, label: row.label, baseUrl: row.baseUrl, keyref: row.keyref })
                      }
                    >
                      edit
                    </button>
                    <button type="button" onClick={() => removeProvider(row.id)}>
                      remove
                    </button>
                  </td>
                </tr>
              ),
            )
          ) : (
            <tr>
              <td colSpan={5} style={cellStyle}>
                no custom provider is registered yet, so no personal api or llm rides the apps.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <form onSubmit={addProvider} style={{ ...addFormStyle, gridTemplateColumns: "1fr 2fr 1fr auto" }}>
        <input
          className={fieldClass}
          style={fieldStyle}
          value={providerDraft.label}
          onChange={(event) => setProviderDraft({ ...providerDraft, label: event.target.value })}
          placeholder="label"
          aria-label="new provider label"
        />
        <input
          className={fieldClass}
          style={fieldStyle}
          value={providerDraft.baseUrl}
          onChange={(event) => setProviderDraft({ ...providerDraft, baseUrl: event.target.value })}
          placeholder="https://api.example.com/v1"
          aria-label="new provider base url"
          spellCheck={false}
          autoComplete="off"
        />
        <input
          className={fieldClass}
          style={fieldStyle}
          value={providerDraft.keyref}
          onChange={(event) => setProviderDraft({ ...providerDraft, keyref: event.target.value })}
          placeholder="credential name"
          aria-label="new provider credential name"
          spellCheck={false}
          autoComplete="off"
        />
        <button type="submit">add provider</button>
      </form>
    </section>
  );
}
