/**
 * providers page anchor — layer 3 of the anchor architecture. The file
 * carrying the folder's own name is the path manager of the page: it imports
 * the loose components beside it, mounts the page and re-exports the public
 * component surface. Only the theme anchor (Sol/Sol.tsx) and the window
 * registry (Sol/widgets/PanelWorkspace.tsx) consume this file.
 *
 * Providers — the provider registry in the Windows 11 grammar: a nav pane
 * beside the content deck, the provider index as hairline rows with the
 * active provider leading and the browser-local credential opt-in as its
 * own section. Credentials stay cli-owned unless the person explicitly
 * chooses a browser-local credential. The old editorial split is retired —
 * this body rides the dtw kit with the lime identity (#a3e635, the
 * registry tint) on the active-indicator pill, the active state dot and
 * the use/save content CTAs — the chrome washes stay neutral slate, and
 * the control wells answer the windows light accent on focus.
 */
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ShellChrome } from "@/widgets/Shellchrome";
import { osAppLabels } from "../../catalog";
import {
  browserCredentialProviders,
  readBrowserPreferences,
  removeBrowserCredential,
  saveBrowserCredential,
  saveBrowserPreference } from "../../storage.ts";
import { gatewayJson, gatewayReady } from "../../gateway.js";
import { osProviders, osText } from "../../oslabels.ts";
import { ProviderCard } from "../widgets";
import { ProvidersList } from "../widgets";

/** the window title rides the catalog label row, never a hardcoded literal
 * (the bare id keeps the heading honest if the row is missing). */
const PROVIDERS_LABEL = osAppLabels().providers;

type Provider = { id: string; protocol: string; env: string };

/** the offline answer of the provider index — the label table owns the
 * registry rows (the oslabels providers seed: the ids mirror the local
 * provider registry, the protocol and env words are interface copy). */
const fallback: Provider[] = osProviders();

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
      toast(osText("providers.toast.loadFailed"));
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
      return toast(osText("providers.toast.selected").replace("{id}", provider.id));
    }
    try {
      await gatewayJson("/providers/active", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ provider: provider.id }) });
      await saveBrowserPreference("activeProvider", provider.id);
      setActive(provider.id);
      toast(osText("providers.toast.activated").replace("{id}", provider.id));
    } catch {
      toast(osText("providers.toast.activationRejected"));
    }
  };

  const saveCredential = async () => {
    const value = credentialDraft.trim();
    if (!value) return toast(osText("providers.toast.enterCredential"));
    if (
      !window.confirm(osText("providers.confirm.store").replace("{id}", credentialProvider))
    )
      return;
    await saveBrowserCredential(credentialProvider, value);
    setCredentialDraft("");
    setBrowserCredentials(await browserCredentialProviders());
    toast(osText("providers.toast.saved").replace("{id}", credentialProvider));
  };

  const clearCredential = async () => {
    await removeBrowserCredential(credentialProvider);
    setBrowserCredentials(await browserCredentialProviders());
    toast(osText("providers.toast.removed").replace("{id}", credentialProvider));
  };

  /* the active provider leads the index; the stable sort keeps the rest in
   * registry order — emphasis by position, not by decoration */
  const ordered = [...providers].sort((a, b) => Number(b.id === active) - Number(a.id === active));

  return (
    <main className="dtw-app dtw-providers" style={embedded ? { height: "100%", overflow: "auto" } : undefined}>
      {!embedded && <ShellChrome />}
      <div className="dtw-pane">
        <nav className="dtw-nav" aria-label={osText("providers.nav.aria")}>
          <button
            type="button"
            className="dtw-navrow"
            data-active={section === "index" ? "true" : undefined}
            onClick={() => setSection("index")}
            aria-current={section === "index" ? "page" : undefined}
          >
            {osText("providers.navrow.index")}
            <span className="dtw-navrow__count">{providers.length}</span>
          </button>
          <button
            type="button"
            className="dtw-navrow"
            data-active={section === "credentials" ? "true" : undefined}
            onClick={() => setSection("credentials")}
            aria-current={section === "credentials" ? "page" : undefined}
          >
            {osText("providers.navrow.credentials")}
          </button>
        </nav>
        <div className="dtw-content">
          <h1 className="dtw-title">{PROVIDERS_LABEL?.name ?? "Providers"}</h1>
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
