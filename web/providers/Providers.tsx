/** Style: DevThink Terminal Atelier — provider catalog prioritizes active local-gateway selection rather than collecting browser credentials. */
import { Check, KeyRound, RefreshCw, Terminal, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ControlShell } from "@/control.shell";
import { browserCredentialProviders, readBrowserPreferences, removeBrowserCredential, saveBrowserCredential, saveBrowserPreference } from "@/db";
import { gatewayJson, gatewayReady } from "@/gateway";

type Provider = { id: string; protocol: string; env: string };

const fallback: Provider[] = ["openai", "zai", "anthropic", "google", "qwen", "openrouter", "deepseek", "groq", "mistral", "xai", "ollama", "mimo"].map((id) => ({ id, protocol: "configured locally", env: "CLI" }));

export default function Providers() {
  const [providers, setProviders] = useState<Provider[]>(fallback);
  const [active, setActive] = useState("");
  const [loading, setLoading] = useState(false);
  const [credentialProvider, setCredentialProvider] = useState("openai");
  const [credentialDraft, setCredentialDraft] = useState("");
  const [browserCredentials, setBrowserCredentials] = useState<string[]>([]);
  const paired = gatewayReady();
  const refresh = async () => { if (!paired) return; setLoading(true); try { setProviders(await gatewayJson<Provider[]>("/providers")); } catch { toast("The paired gateway could not load providers."); } finally { setLoading(false); } };
  useEffect(() => { void refresh(); void readBrowserPreferences().then((preferences) => setActive(preferences.activeProvider || "")).catch(() => undefined); void browserCredentialProviders().then(setBrowserCredentials).catch(() => undefined); }, []);
  const activate = async (provider: Provider) => { if (!paired) { await saveBrowserPreference("activeProvider", provider.id); setActive(provider.id); return toast(`${provider.id} is selected for this browser-local workspace.`); } try { await gatewayJson("/providers/active", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ provider: provider.id }) }); await saveBrowserPreference("activeProvider", provider.id); setActive(provider.id); toast(`${provider.id} is now active in the local CLI.`); } catch { toast("Provider activation was rejected by the local gateway."); } };
  const saveCredential = async () => {
    const value = credentialDraft.trim();
    if (!value) return toast("Enter a provider credential before saving it locally.");
    if (!window.confirm(`Store this ${credentialProvider} credential only in this browser? It will never be synced to the CLI or a remote adapter.`)) return;
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
  return <ControlShell eyebrow="local provider registry" title="Providers follow the CLI." summary="Select a browser-local default or activate an installed provider through the paired gateway. Provider credentials stay CLI-owned unless the user explicitly chooses a browser-local credential.">
    <div className="control-toolbar"><span>{paired ? "paired gateway" : "browser-local selection · credentials remain CLI-only"}</span><button onClick={() => void refresh()} disabled={!paired || loading}><RefreshCw size={14} />refresh</button></div>
    <div className="control-grid control-grid--providers">{providers.map((provider) => <article className={`provider-card ${active === provider.id ? "provider-card--active" : ""}`} key={provider.id}><span className="provider-card__tag">{provider.protocol}</span><h2>{provider.id}</h2><p>Configured by <code>{provider.env}</code> in the DevThink CLI.</p><button onClick={() => void activate(provider)}>{active === provider.id ? <><Check size={14} />active</> : <>use provider</>}</button></article>)}</div>
    <aside className="control-note"><Terminal size={16} /><p>For the recommended device flow, use <code>devthink auth login &lt;provider&gt; --token &lt;key&gt;</code>. A CLI credential never enters this web page.</p></aside>
    <section className="control-note"><KeyRound size={16} /><div><strong>optional browser-local credential</strong><p>This explicit opt-in stores a credential only in this browser's IndexedDB. It is not displayed after saving, never goes to the CLI gateway, and is excluded from every sync adapter.</p><label>provider<select value={credentialProvider} onChange={(event) => setCredentialProvider(event.target.value)}>{providers.map((provider) => <option key={provider.id} value={provider.id}>{provider.id}</option>)}</select></label><label>credential<input type="password" value={credentialDraft} onChange={(event) => setCredentialDraft(event.target.value)} autoComplete="off" placeholder="paste only if this device is trusted" /></label><div className="control-toolbar"><button onClick={() => void saveCredential()}><KeyRound size={14} />save to this browser</button>{browserCredentials.includes(credentialProvider) && <button onClick={() => void clearCredential()}><Trash2 size={14} />remove local credential</button>}</div></div></section>
  </ControlShell>;
}
