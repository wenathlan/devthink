/**
 * providers page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

/** Style: DevThink Terminal Atelier — provider catalog prioritizes active
 * local-gateway selection rather than collecting browser credentials. C1
 * layout: the provider index is the dominant object — the active provider
 * leads as the emphasized row and the rest read as ruled ledger rows (the
 * uniform card grid is gone) — while the support rail carries the explicit
 * browser-local credential opt-in and the CLI flow note. */
import { Check, KeyRound, RefreshCw, Terminal, Trash2 } from "lucide-react";
import { type CSSProperties, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ControlShell, controlStripStyle } from "@/shell/ControlShell";
import {
  browserCredentialProviders,
  readBrowserPreferences,
  removeBrowserCredential,
  saveBrowserCredential,
  saveBrowserPreference,
} from "../../db";
import { gatewayJson, gatewayReady } from "../../gateway.js";

type Provider = { id: string; protocol: string; env: string };

const fallback: Provider[] = [
  "openai",
  "zai",
  "anthropic",
  "google",
  "qwen",
  "openrouter",
  "deepseek",
  "groq",
  "mistral",
  "xai",
  "ollama",
  "mimo",
].map((id) => ({ id, protocol: "configured locally", env: "CLI" }));

/* the two-zone rhythm: dominant index + support rail */
const zoneStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 24,
  alignItems: "flex-start",
  fontVariantNumeric: "tabular-nums",
};
const mainStyle: CSSProperties = { flex: "3 1 520px", minWidth: 0 };
const railStyle: CSSProperties = {
  flex: "1 1 264px",
  minWidth: 0,
  maxWidth: 340,
  display: "grid",
  gap: 16,
  alignContent: "start",
};
const ledgerLabelStyle: CSSProperties = {
  margin: 0,
  padding: "0 2px 10px",
  color: "var(--dt-faint)",
  font: "600 10px var(--dt-mono)",
  letterSpacing: ".08em",
};
const ledgerStyle: CSSProperties = { borderTop: "1px solid var(--dt-edge)" };
/* the rows keep the provider-card class so the shared button grammar (hover,
 * focus ring) keeps applying; the card box itself is flattened to a rule */
const rowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  padding: "11px 2px",
  background: "transparent",
  border: 0,
  borderRadius: 0,
  borderBottom: "1px solid var(--dt-edge)",
  boxShadow: "none",
};
const rowActiveStyle: CSSProperties = { ...rowStyle, padding: "18px 2px" };
const rowTitleStyle: CSSProperties = { margin: 0, font: "600 13px var(--dt-mono)", color: "var(--dt-text)" };
const rowActiveTitleStyle: CSSProperties = { ...rowTitleStyle, color: "var(--sol-sun)" };
const rowMetaStyle: CSSProperties = {
  margin: 0,
  minHeight: 0,
  font: "400 10px var(--dt-mono)",
  color: "var(--dt-faint)",
};
const rowMainStyle: CSSProperties = { display: "grid", gap: 3, minWidth: 0 };
const railBlockStyle: CSSProperties = {
  borderTop: "1px solid var(--dt-edge)",
  padding: "14px 2px 0",
  display: "grid",
  gap: 10,
  alignContent: "start",
};
const railTitleStyle: CSSProperties = {
  color: "var(--dt-text)",
  font: "600 10px var(--dt-mono)",
  letterSpacing: ".08em",
};
const railCopyStyle: CSSProperties = { margin: 0, color: "var(--dt-muted)", font: "400 11px/1.7 var(--dt-sans)" };
const fieldLabelStyle: CSSProperties = {
  display: "grid",
  gap: 4,
  color: "var(--dt-muted)",
  font: "500 10px var(--dt-mono)",
};
const fieldStyle: CSSProperties = {
  minHeight: 30,
  padding: "0 8px",
  color: "var(--dt-text)",
  background: "rgb(0 0 0 / 24%)",
  border: "1px solid var(--dt-edge)",
  borderRadius: 6,
  font: "400 11px var(--dt-mono)",
};
const railActionsStyle: CSSProperties = {
  background: "transparent",
  border: 0,
  borderRadius: 0,
  padding: 0,
  justifyContent: "flex-start",
};
const railNoteStyle: CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "flex-start",
  background: "transparent",
  border: 0,
  borderTop: "1px solid var(--dt-edge)",
  borderRadius: 0,
  padding: "12px 2px 0",
  color: "var(--dt-faint)",
  font: "400 11px/1.7 var(--dt-mono)",
};

export default function Providers() {
  const [providers, setProviders] = useState<Provider[]>(fallback);
  const [active, setActive] = useState("");
  const [loading, setLoading] = useState(false);
  const [credentialProvider, setCredentialProvider] = useState("openai");
  const [credentialDraft, setCredentialDraft] = useState("");
  const [browserCredentials, setBrowserCredentials] = useState<string[]>([]);
  const paired = gatewayReady();
  const refresh = useCallback(async () => {
    if (!paired) return;
    setLoading(true);
    try {
      setProviders(await gatewayJson<Provider[]>("/providers"));
    } catch {
      toast("The paired gateway could not load providers.");
    } finally {
      setLoading(false);
    }
  }, [paired]);
  useEffect(() => {
    void refresh();
    void readBrowserPreferences()
      .then((preferences) => setActive(preferences.activeProvider || ""))
      .catch(() => undefined);
    void browserCredentialProviders()
      .then(setBrowserCredentials)
      .catch(() => undefined);
  }, [refresh]);
  const activate = async (provider: Provider) => {
    if (!paired) {
      await saveBrowserPreference("activeProvider", provider.id);
      setActive(provider.id);
      return toast(`${provider.id} is selected for this browser-local workspace.`);
    }
    try {
      await gatewayJson("/providers/active", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ provider: provider.id }),
      });
      await saveBrowserPreference("activeProvider", provider.id);
      setActive(provider.id);
      toast(`${provider.id} is now active in the local CLI.`);
    } catch {
      toast("Provider activation was rejected by the local gateway.");
    }
  };
  const saveCredential = async () => {
    const value = credentialDraft.trim();
    if (!value) return toast("Enter a provider credential before saving it locally.");
    if (
      !window.confirm(
        `Store this ${credentialProvider} credential only in this browser? It will never be synced to the CLI or a remote adapter.`,
      )
    )
      return;
    await saveBrowserCredential(credentialProvider, value);
    setCredentialDraft("");
    setBrowserCredentials(await browserCredentialProviders());
    toast(`${credentialProvider} credential saved only in this browser.`);
  };
  const clearCredential = async () => {
    await removeBrowserCredential(credentialProvider);
    setBrowserCredentials(await browserCredentialProviders());
    toast(`${credentialProvider} browser-local credential removed.`);
  };
  /* the active provider leads the index; the stable sort keeps the rest in
   * registry order — emphasis by position, not by decoration */
  const ordered = [...providers].sort((a, b) => Number(b.id === active) - Number(a.id === active));
  return (
    <ControlShell
      eyebrow="local provider registry"
      title="Providers follow the CLI."
      summary="Select a browser-local default or activate an installed provider through the paired gateway. Provider credentials stay CLI-owned unless the user explicitly chooses a browser-local credential."
    >
      <div className="control-toolbar" style={controlStripStyle}>
        <span>{paired ? "paired gateway" : "browser-local selection · credentials remain CLI-only"}</span>
        <button type="button" onClick={() => void refresh()} disabled={!paired || loading}>
          <RefreshCw size={14} />
          refresh
        </button>
      </div>
      <div style={zoneStyle}>
        <div style={mainStyle}>
          <p style={ledgerLabelStyle}>provider index · {providers.length}</p>
          <div style={ledgerStyle}>
            {ordered.map((provider) => {
              const isActive = active === provider.id;
              return (
                <article
                  className={`provider-card${isActive ? " provider-card--active" : ""}`}
                  style={isActive ? rowActiveStyle : rowStyle}
                  key={provider.id}
                >
                  <div style={rowMainStyle}>
                    <h2 style={isActive ? rowActiveTitleStyle : rowTitleStyle}>{provider.id}</h2>
                    <p style={rowMetaStyle}>
                      {provider.protocol} · configured by <code>{provider.env}</code>
                    </p>
                  </div>
                  <button type="button" onClick={() => void activate(provider)}>
                    {isActive ? (
                      <>
                        <Check size={14} />
                        active
                      </>
                    ) : (
                      <>use provider</>
                    )}
                  </button>
                </article>
              );
            })}
          </div>
        </div>
        <aside style={railStyle} aria-label="Credential options">
          <section style={railBlockStyle}>
            <strong style={railTitleStyle}>optional browser-local credential</strong>
            <p style={railCopyStyle}>
              This explicit opt-in stores a credential only in this browser's IndexedDB. It is not displayed after
              saving, never goes to the CLI gateway, and is excluded from every sync adapter.
            </p>
            <label style={fieldLabelStyle}>
              provider
              <select
                style={fieldStyle}
                value={credentialProvider}
                onChange={(event) => setCredentialProvider(event.target.value)}
              >
                {providers.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.id}
                  </option>
                ))}
              </select>
            </label>
            <label style={fieldLabelStyle}>
              credential
              <input
                style={fieldStyle}
                type="password"
                value={credentialDraft}
                onChange={(event) => setCredentialDraft(event.target.value)}
                autoComplete="off"
                placeholder="paste only if this device is trusted"
              />
            </label>
            <div className="control-toolbar" style={railActionsStyle}>
              <button type="button" onClick={() => void saveCredential()}>
                <KeyRound size={14} />
                save to this browser
              </button>
              {browserCredentials.includes(credentialProvider) && (
                <button type="button" onClick={() => void clearCredential()}>
                  <Trash2 size={14} />
                  remove local credential
                </button>
              )}
            </div>
          </section>
          <section className="control-note" style={railNoteStyle}>
            <Terminal size={16} />
            <p style={{ margin: 0 }}>
              For the recommended device flow, use <code>devthink auth login &lt;provider&gt; --token &lt;key&gt;</code>
              . A CLI credential never enters this web page.
            </p>
          </section>
        </aside>
      </div>
    </ControlShell>
  );
}
