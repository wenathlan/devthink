/**
 * providers page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

/** Style: DevThink Terminal Atelier — campaign v3 r2-c: the operational
 * ledger. The provider index is the dominant object of a 1.6fr/1fr editorial
 * split: the active provider leads as the ONE raised featured row (signal
 * edge, live pulse dot, Bricolage 600 name) and the rest read as ruled
 * ledger rows with mono meta and the owning surface as a kbd chip. Rows
 * hover on a 10% signal tint; every action rides the .press voice. The
 * support rail keeps the explicit browser-local credential opt-in and the
 * CLI flow note — hairline-joined, no nested boxes. One accent (#ff5f00),
 * one light (the shared .atmos veil), the one orchestrated shell entrance. */
import { Check, KeyRound, RefreshCw, Terminal, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
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
      summary="Select a browser-local default or activate an installed provider through the paired gateway. Credentials stay CLI-owned unless the user explicitly chooses a browser-local credential."
    >
      <div className="control-toolbar" style={controlStripStyle}>
        <span>{paired ? "paired gateway" : "browser-local selection · credentials remain CLI-only"}</span>
        <button type="button" className="r2c-btn press" onClick={() => void refresh()} disabled={!paired || loading}>
          <RefreshCw size={14} />
          refresh
        </button>
      </div>
      <div className="r2c-split">
        <div className="r2c-main">
          <p className="r2c-colhead">provider index · {providers.length}</p>
          <div className="r2c-ledger">
            {ordered.map((provider) => {
              const isActive = active === provider.id;
              return (
                <article key={provider.id} className={`r2c-row${isActive ? " is-featured" : ""}`}>
                  <div className="r2c-row__main">
                    <h2 className="r2c-row__name">{provider.id}</h2>
                    <p className="r2c-row__meta">
                      {provider.protocol} · configured by <kbd className="r2c-kbd">{provider.env}</kbd>
                    </p>
                  </div>
                  <button type="button" className="r2c-btn press" onClick={() => void activate(provider)}>
                    {isActive ? (
                      <>
                        <Check size={14} />
                        active
                      </>
                    ) : (
                      <>use provider</>
                    )}
                  </button>
                  <span className="r2c-state">
                    <span
                      className={`r2c-dot${isActive ? " live-dot" : ""}`}
                      data-on={isActive ? "true" : "false"}
                      aria-hidden="true"
                    />
                    {isActive ? "active" : "standby"}
                  </span>
                </article>
              );
            })}
          </div>
        </div>
        <aside className="r2c-rail" aria-label="Credential options">
          <section className="r2c-railfig" style={{ display: "grid", gap: 12, alignContent: "start" }}>
            <strong className="r2c-figlabel">optional browser-local credential</strong>
            <p className="r2c-sec__copy">
              This explicit opt-in stores a credential only in this browser's IndexedDB. It is not displayed after
              saving, never goes to the CLI gateway, and is excluded from every sync adapter.
            </p>
            <label className="r2c-fieldlabel">
              provider
              <select
                className="r2c-select"
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
            <label className="r2c-fieldlabel">
              credential
              <input
                className="r2c-input"
                type="password"
                value={credentialDraft}
                onChange={(event) => setCredentialDraft(event.target.value)}
                autoComplete="off"
                placeholder="paste only if this device is trusted"
              />
            </label>
            <div className="r2c-gw__actions">
              <button type="button" className="r2c-btn press" onClick={() => void saveCredential()}>
                <KeyRound size={14} />
                save to this browser
              </button>
              {browserCredentials.includes(credentialProvider) && (
                <button type="button" className="r2c-btn press" onClick={() => void clearCredential()}>
                  <Trash2 size={14} />
                  remove local credential
                </button>
              )}
            </div>
          </section>
          <section className="r2c-note r2c-note--icon">
            <Terminal size={16} aria-hidden="true" />
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
