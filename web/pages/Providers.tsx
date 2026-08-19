/** Style: DevThink Terminal Atelier — provider catalog prioritizes active local-gateway selection rather than collecting browser credentials. */
import { Check, RefreshCw, Terminal } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ControlShell } from "@/components/ControlShell";
import { gatewayJson, gatewayReady } from "@/gateway";

type Provider = { id: string; protocol: string; env: string };

const fallback: Provider[] = ["openai", "zai", "anthropic", "google", "qwen", "openrouter", "deepseek", "groq", "mistral", "xai", "ollama", "mimo"].map((id) => ({ id, protocol: "configured locally", env: "CLI" }));

export default function Providers() {
  const [providers, setProviders] = useState<Provider[]>(fallback);
  const [active, setActive] = useState("");
  const [loading, setLoading] = useState(false);
  const paired = gatewayReady();
  const refresh = async () => { if (!paired) return; setLoading(true); try { setProviders(await gatewayJson<Provider[]>("/providers")); } catch { toast("The paired gateway could not load providers."); } finally { setLoading(false); } };
  useEffect(() => { void refresh(); }, []);
  const activate = async (provider: Provider) => { if (!paired) return toast("Pair the local CLI to activate a provider from the web."); try { await gatewayJson("/providers/active", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ provider: provider.id }) }); setActive(provider.id); toast(`${provider.id} is now active in the local CLI.`); } catch { toast("Provider activation was rejected by the local gateway."); } };
  return <ControlShell eyebrow="local provider registry" title="Providers follow the CLI." summary="Select an installed provider through the paired gateway. Credentials are configured only with the CLI."><div className="control-toolbar"><span>{paired ? "paired gateway" : "catalog only · pair CLI to activate"}</span><button onClick={() => void refresh()} disabled={!paired || loading}><RefreshCw size={14} />refresh</button></div><div className="control-grid control-grid--providers">{providers.map((provider) => <article className={`provider-card ${active === provider.id ? "provider-card--active" : ""}`} key={provider.id}><span className="provider-card__tag">{provider.protocol}</span><h2>{provider.id}</h2><p>Configured by <code>{provider.env}</code> in the DevThink CLI.</p><button onClick={() => void activate(provider)}>{active === provider.id ? <><Check size={14} />active</> : <>use provider</>}</button></article>)}</div><aside className="control-note"><Terminal size={16} /><p>To add a credential, use <code>devthink auth login &lt;provider&gt; --token &lt;key&gt;</code>. This page never receives or stores that key.</p></aside></ControlShell>;
}
