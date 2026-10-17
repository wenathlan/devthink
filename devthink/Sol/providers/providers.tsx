/**
 * providers page anchor — layer 3 of the anchor architecture. The file
 * carrying the folder's own name is the path manager of the page: it imports
 * the loose components beside it, mounts the page and re-exports the public
 * component surface. Only the theme anchor (Sol/Sol.tsx) and the window
 * registry (Sol/windowregistry.tsx) consume this file.
 *
 * Providers — the provider registry in the Windows 11 grammar: a nav pane
 * beside the content deck, the provider index as hairline rows with the
 * active provider leading and the browser-local credential opt-in as its
 * own section. Credentials stay cli-owned unless the person explicitly
 * chooses a browser-local credential. The old editorial split is retired —
 * this body rides the dtw kit.
 */
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ShellChrome } from "@/shell/ShellChrome";
import {
  browserCredentialProviders,
  readBrowserPreferences,
  removeBrowserCredential,
  saveBrowserCredential,
  saveBrowserPreference,
} from "../../db";
import { gatewayJson, gatewayReady } from "../../gateway.js";
import { ProviderCard } from "./providercard.tsx";
import { ProvidersList } from "./providerslist.tsx";

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

/** The providers app: the Windows body when embedded (the desktop window
 * hosts it without the shell), the full surface with the taskbar on the
 * route. */
export default function Providers({ embedded }: { embedded?: boolean }) {
  const [providers, setProviders] = useState<Provider[]>(fallback);
  const [active, setActive] = useState("");
  const [loading, setLoading] = useState(false);
  const [credentialProvider, setCredentialProvider] = useState("openai");
  const [credentialDraft, setCredentialDraft] = useState("");
  const [browserCredentials, setBrowserCredentials] = useState<string[]>([]);
  const [section, setSection] = useState<"index" | "credentials">("index");
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
      toast(`${provider.id} is now active in the local cli.`);
    } catch {
      toast("Provider activation was rejected by the local gateway.");
    }
  };

  const saveCredential = async () => {
    const value = credentialDraft.trim();
    if (!value) return toast("Enter a provider credential before saving it locally.");
    if (
      !window.confirm(
        `Store this ${credentialProvider} credential only in this browser? It will never be synced to the cli or a remote adapter.`,
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
    <main className="dtw-app dtw-providers" style={embedded ? { height: "100%", overflow: "auto" } : undefined}>
      {!embedded && <ShellChrome />}
      <div className="dtw-pane">
        <nav className="dtw-nav" aria-label="Providers sections">
          <button
            type="button"
            className="dtw-navrow"
            data-active={section === "index" ? "true" : undefined}
            onClick={() => setSection("index")}
            aria-current={section === "index" ? "page" : undefined}
          >
            Providers
            <span className="dtw-navrow__count">{providers.length}</span>
          </button>
          <button
            type="button"
            className="dtw-navrow"
            data-active={section === "credentials" ? "true" : undefined}
            onClick={() => setSection("credentials")}
            aria-current={section === "credentials" ? "page" : undefined}
          >
            Credentials
          </button>
        </nav>
        <div className="dtw-content">
          <h1 className="dtw-title">Providers</h1>
          {section === "index" ? (
            <ProvidersList
              rows={ordered}
              active={active}
              paired={paired}
              loading={loading}
              onActivate={activate}
              onRefresh={refresh}
            />
          ) : (
            <ProviderCard
              providers={providers}
              credentialProvider={credentialProvider}
              onCredentialProvider={setCredentialProvider}
              credentialDraft={credentialDraft}
              onCredentialDraft={setCredentialDraft}
              browserCredentials={browserCredentials}
              onSave={saveCredential}
              onClear={clearCredential}
            />
          )}
        </div>
      </div>
    </main>
  );
}
