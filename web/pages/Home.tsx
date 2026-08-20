/** Style: DevThink Unified Terminal Workspace — React renders the same sparse category shell as the interactive CLI. */
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useLocation, useRoute } from "wouter";
import { CommandPalette } from "@/components/CommandPalette";
import { PairingPanel } from "@/components/PairingPanel";
import { EntryScreen } from "@/components/EntryScreen";
import { TerminalWorkspace } from "@/components/TerminalWorkspace";
import type { DevThinkMessage, DevThinkProvider, DevThinkTab } from "@/components/devthink-types";
import { createLocalIdentity, readLocalIdentity, type LocalIdentity } from "@/identity";
import type { WorkspaceDestination } from "../../workspace.ts";

const providers: DevThinkProvider[] = [
  { id: "anthropic", label: "Anthropic", model: "Claude Sonnet", protocol: "messages · SSE", state: "connected", tint: "#e46f36" },
  { id: "google", label: "Google", model: "Gemini Pro", protocol: "generateContent", state: "ready", tint: "#64c8bb" },
  { id: "zai", label: "Z.AI", model: "GLM 5", protocol: "openai-compatible", state: "ready", tint: "#f2bb62" },
  { id: "qwen", label: "Qwen", model: "Qwen Coder", protocol: "phase SSE", state: "offline", tint: "#bb9cf4" },
  { id: "mimo", label: "Xiaomi MiMo", model: "MiMo V2.5 Pro", protocol: "openai-compatible", state: "ready", tint: "#f28861" },
];

const initialMessages: DevThinkMessage[] = [];

type RouteState = { workspaceId: string; sessionId: string; tabId: string; sectionId: string };
type GatewaySession = { id: string; workspaceId: string; title: string; activeTabId: string; tabs: Array<{ id: string; workspaceId: string; sessionId: string; label: string; provider?: string; sectionId: string; createdAt: string; updatedAt: string }>; messages: Array<{ id: string; workspaceId: string; sessionId: string; tabId: string; sectionId: string; role: "user" | "assistant" | "system"; content: string; createdAt: string }> };
type PairingResponse = { token: string; userId: string; expiresAt: number };

function stableId(): string {
  const alphabet = "0123456789abcdefghjkmnpqrstvwxyz";
  const bytes = new Uint8Array(10);
  globalThis.crypto?.getRandomValues?.(bytes);
  const token = Array.from(bytes, (value) => alphabet[value & 31]).join("") || Math.random().toString(36).slice(2, 12);
  return `l_${token}`;
}

function gatewayFromSearch(search: string): string | undefined {
  const configured = new URLSearchParams(search).get("gateway") || import.meta.env.VITE_DEVTHINK_GATEWAY_URL;
  return configured ? configured.replace(/\/$/, "") : undefined;
}

function routePath(route: RouteState, search: string): string {
  return `/w/${encodeURIComponent(route.workspaceId)}/s/${encodeURIComponent(route.sessionId)}/t/${encodeURIComponent(route.tabId)}/${encodeURIComponent(route.sectionId)}${search}`;
}

function formatTime(value: string): string {
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return "local";
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  return seconds < 60 ? "now" : `${Math.floor(seconds / 60)}m`;
}

function toUiSession(session: GatewaySession): { tabs: DevThinkTab[]; messages: DevThinkMessage[] } {
  return {
    tabs: session.tabs.map((tab) => ({ id: tab.id, sessionId: tab.sessionId, workspaceId: tab.workspaceId, label: tab.label, provider: tab.provider || "zai", sectionId: tab.sectionId, createdAt: tab.createdAt, updatedAt: tab.updatedAt })),
    messages: session.messages.map((message) => ({ id: message.id, workspaceId: message.workspaceId, sessionId: message.sessionId, tabId: message.tabId, sectionId: message.sectionId, role: message.role, title: message.role === "assistant" ? "Gateway response" : message.role === "user" ? "Request" : "Session context", body: message.content, time: formatTime(message.createdAt) })),
  };
}

function sseEvents(chunk: string): Array<{ type: string; data: Record<string, unknown> }> {
  return chunk.split("\n\n").flatMap((frame) => {
    const type = frame.match(/^event:\s*(.+)$/m)?.[1];
    const value = frame.match(/^data:\s*(.+)$/m)?.[1];
    if (!type || !value) return [];
    try { return [{ type, data: JSON.parse(value) as Record<string, unknown> }]; } catch { return []; }
  });
}

export default function Home() {
  const [location, setLocation] = useLocation();
  const [, params] = useRoute("/w/:workspaceId/s/:sessionId/t/:tabId/:sectionId");
  const configuredGateway = gatewayFromSearch(window.location.search);
  const invitation = useMemo(() => new URLSearchParams(window.location.search), []);
  const [gatewayInput, setGatewayInput] = useState(() => configuredGateway || window.sessionStorage.getItem("devthink.gateway") || "");
  const gatewayUrl = gatewayInput.trim().replace(/\/$/, "") || undefined;
  const query = window.location.search;
  const fallbackRoute: RouteState = useMemo(() => ({ workspaceId: stableId(), sessionId: stableId(), tabId: stableId(), sectionId: "chat" }), []);
  const route: RouteState = params ? { workspaceId: params.workspaceId, sessionId: params.sessionId, tabId: params.tabId, sectionId: params.sectionId } : fallbackRoute;
  const [tabs, setTabs] = useState<DevThinkTab[]>(() => [{ id: route.tabId, workspaceId: route.workspaceId, sessionId: route.sessionId, label: "local session", provider: "anthropic", sectionId: route.sectionId }]);
  const [selectedProvider, setSelectedProvider] = useState("anthropic");
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [browserToken, setBrowserToken] = useState(() => window.sessionStorage.getItem("devthink.pair.token") || "");
  const [pairingId, setPairingId] = useState(() => invitation.get("pair") || "");
  const [pairingCode, setPairingCode] = useState(() => invitation.get("code")?.toUpperCase() || "");
  const [pairingUserId, setPairingUserId] = useState<string | undefined>(() => window.sessionStorage.getItem("devthink.pair.user") || undefined);
  const [pairingExpiresAt, setPairingExpiresAt] = useState<number | undefined>(() => Number(window.sessionStorage.getItem("devthink.pair.expires")) || undefined);
  const [localIdentity, setLocalIdentity] = useState<LocalIdentity | undefined>(() => readLocalIdentity());
  const provider = useMemo(() => providers.find((item) => item.id === selectedProvider) ?? providers[0], [selectedProvider]);
  const browserHeaders = useMemo(() => {
    const headers: Record<string, string> = {};
    if (browserToken) headers.authorization = `Bearer ${browserToken}`;
    return headers;
  }, [browserToken]);

  function navigate(next: Partial<RouteState>) {
    const nextRoute = { ...route, ...next };
    setLocation(routePath(nextRoute, query));
  }

  function openDestination(destination: WorkspaceDestination) {
    const directRoutes: Partial<Record<WorkspaceDestination, string>> = { providers: "/providers", projects: "/projects", routes: "/routes", usage: "/usage" };
    if (directRoutes[destination]) return setLocation(directRoutes[destination] as string);
    navigate({ sectionId: destination === "chat" ? "all" : destination });
  }

  function rememberPairing(result: PairingResponse) {
    window.sessionStorage.setItem("devthink.gateway", gatewayInput);
    window.sessionStorage.setItem("devthink.pair.token", result.token);
    window.sessionStorage.setItem("devthink.pair.user", result.userId);
    window.sessionStorage.setItem("devthink.pair.expires", String(result.expiresAt));
    setBrowserToken(result.token);
    setPairingUserId(result.userId);
    setPairingExpiresAt(result.expiresAt);
    setPairingCode("");
    toast("Local DevThink workspace paired. The browser session is temporary.");
  }

  async function pairLocalGateway(event: FormEvent) {
    event.preventDefault();
    await consumeLocalInvitation();
  }

  async function consumeLocalInvitation() {
    if (!gatewayUrl || !pairingId || pairingCode.length !== 8) return toast("Open a CLI invitation link or use manual setup to provide the local connection details.");
    try {
      const response = await fetch(`${gatewayUrl}/pairings/consume`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ pairingId, code: pairingCode }) });
      if (!response.ok) throw new Error("Pairing was rejected.");
      rememberPairing(await response.json() as PairingResponse);
    } catch {
      toast("The local pairing could not be completed. Confirm the CLI gateway is running, the page origin is allowed, and the code has not expired.");
    }
  }

  async function revokeLocalGateway() {
    try {
      if (gatewayUrl && browserToken) await fetch(`${gatewayUrl}/pairings/revoke`, { method: "POST", headers: { ...browserHeaders } });
    } finally {
      for (const key of ["devthink.pair.token", "devthink.pair.user", "devthink.pair.expires"]) window.sessionStorage.removeItem(key);
      setBrowserToken("");
      setPairingUserId(undefined);
      setPairingExpiresAt(undefined);
      toast("Local browser pairing revoked.");
    }
  }

  useEffect(() => {
    if (!localIdentity || browserToken || !gatewayUrl || !pairingId || pairingCode.length !== 8) return;
    void consumeLocalInvitation();
  }, [browserToken, gatewayUrl, localIdentity, pairingCode, pairingId]);

  useEffect(() => {
    if (params) return;
    if (!gatewayUrl) {
      setLocation(routePath(fallbackRoute, query));
      return;
    }
    if (!browserToken) return;
    void fetch(`${gatewayUrl}/sessions`, { method: "POST", headers: { "content-type": "application/json", ...browserHeaders }, body: JSON.stringify({ mode: "chat", provider: selectedProvider, model: provider.model, sectionId: "chat" }) })
      .then(async (response) => response.ok ? response.json() as Promise<GatewaySession> : Promise.reject(new Error("Gateway session creation failed.")))
      .then((session) => setLocation(routePath({ workspaceId: session.workspaceId, sessionId: session.id, tabId: session.activeTabId, sectionId: "chat" }, query)))
      .catch(() => {
        setLocation(routePath(fallbackRoute, query));
        toast("Local route opened. Add a gateway URL to persist it through DevThink CLI.");
      });
  }, [browserHeaders, browserToken, fallbackRoute, gatewayUrl, params, provider.model, query, selectedProvider, setLocation]);

  useEffect(() => {
    const active = tabs.find((tab) => tab.id === route.tabId);
    if (active?.provider) setSelectedProvider(active.provider);
  }, [route.sectionId, route.tabId, tabs]);

  useEffect(() => {
    if (!gatewayUrl || !params) return;
    if (!browserToken) return;
    void fetch(`${gatewayUrl}/sessions/${encodeURIComponent(route.sessionId)}`, { headers: browserHeaders })
      .then(async (response) => response.ok ? response.json() as Promise<GatewaySession> : Promise.reject(new Error("Session unavailable.")))
      .then((session) => {
        if (session.workspaceId !== route.workspaceId) throw new Error("Route workspace does not match session.");
        const hydrated = toUiSession(session);
        setTabs(hydrated.tabs);
        setMessages(hydrated.messages.length ? hydrated.messages : initialMessages);
        if (!hydrated.tabs.some((tab) => tab.id === route.tabId)) navigate({ tabId: session.activeTabId, sectionId: "chat" });
      })
      .catch(() => toast("Gateway session is unavailable; the route remains local until the CLI is running."));
  }, [browserHeaders, browserToken, gatewayUrl, location, params, route.sessionId, route.tabId, route.workspaceId]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
      if (event.key === "Escape") setPaletteOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function newTab() {
    const localId = stableId();
    const apply = (tab: DevThinkTab) => {
      setTabs((current) => [...current, tab]);
      navigate({ tabId: tab.id, sectionId: tab.sectionId || "chat" });
      toast("A clean local session has been opened.");
    };
    if (!gatewayUrl) return apply({ id: localId, workspaceId: route.workspaceId, sessionId: route.sessionId, label: "new route", provider: selectedProvider, sectionId: "chat" });
    if (!browserToken) return toast("Pair the local CLI before creating a persisted tab.");
    void fetch(`${gatewayUrl}/sessions/${encodeURIComponent(route.sessionId)}/tabs`, { method: "POST", headers: { "content-type": "application/json", ...browserHeaders }, body: JSON.stringify({ label: "new route", provider: selectedProvider, sectionId: "chat" }) })
      .then(async (response) => response.ok ? response.json() as Promise<GatewaySession> : Promise.reject(new Error("Tab creation failed.")))
      .then((session) => {
        const tab = session.tabs.find((item) => item.id === session.activeTabId);
        if (!tab) throw new Error("Created tab unavailable.");
        apply({ id: tab.id, workspaceId: tab.workspaceId, sessionId: tab.sessionId, label: tab.label, provider: tab.provider || selectedProvider, sectionId: tab.sectionId });
      })
      .catch(() => apply({ id: localId, workspaceId: route.workspaceId, sessionId: route.sessionId, label: "new route", provider: selectedProvider, sectionId: "chat" }));
  }

  function closeTab(id: string) {
    setTabs((current) => {
      const next = current.filter((tab) => tab.id !== id);
      if (id === route.tabId && next[0]) navigate({ tabId: next[0].id, sectionId: next[0].sectionId || "chat" });
      return next.length ? next : current;
    });
  }

  function selectTab(id: string) {
    const tab = tabs.find((item) => item.id === id);
    if (!tab) return;
    navigate({ tabId: tab.id, sectionId: tab.sectionId || "chat" });
  }

  async function sendMessage(event: FormEvent) {
    event.preventDefault();
    const prompt = draft.trim();
    if (!prompt) return;
    const userId = stableId();
    const assistantId = stableId();
    setMessages((current) => [
      ...current,
      { id: userId, workspaceId: route.workspaceId, sessionId: route.sessionId, tabId: route.tabId, sectionId: route.sectionId, role: "user", title: "Request staged", body: prompt, time: "now" },
      { id: assistantId, workspaceId: route.workspaceId, sessionId: route.sessionId, tabId: route.tabId, sectionId: route.sectionId, role: "assistant", title: "Gateway response", body: gatewayUrl ? "Connecting to the local DevThink gateway…" : "Add a user-configured gateway URL to dispatch this request through the local DevThink CLI.", time: "pending" },
    ]);
    setDraft("");
    if (!gatewayUrl || !browserToken) return toast("Request is staged locally. Pair the DevThink gateway to persist and stream it.");
    try {
      const response = await fetch(`${gatewayUrl}/chat`, { method: "POST", headers: { "content-type": "application/json", ...browserHeaders }, body: JSON.stringify({ workspaceId: route.workspaceId, sessionId: route.sessionId, tabId: route.tabId, sectionId: route.sectionId, provider: selectedProvider, model: provider.model, messages: [{ role: "user", content: prompt }] }) });
      if (!response.ok || !response.body) throw new Error("Gateway request failed.");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let pending = "";
      while (true) {
        const next = await reader.read();
        if (next.done) break;
        pending += decoder.decode(next.value, { stream: true });
        const boundary = pending.lastIndexOf("\n\n");
        if (boundary < 0) continue;
        const frames = sseEvents(pending.slice(0, boundary));
        pending = pending.slice(boundary + 2);
        for (const frame of frames) {
          if (frame.type === "identity") navigate({ workspaceId: String(frame.data.workspaceId), sessionId: String(frame.data.sessionId), tabId: String(frame.data.tabId), sectionId: String(frame.data.sectionId) });
          if (frame.type === "text") setMessages((current) => current.map((message) => message.id === assistantId ? { ...message, body: `${message.body === "Connecting to the local DevThink gateway…" ? "" : message.body}${String(frame.data.text || "")}`, time: "live" } : message));
          if (frame.type === "persisted") setMessages((current) => current.map((message) => message.id === assistantId ? { ...message, id: String(frame.data.messageId || assistantId), time: "saved" } : message));
        }
      }
      toast("Response persisted by the local DevThink gateway.");
    } catch {
      setMessages((current) => current.map((message) => message.id === assistantId ? { ...message, body: "The local gateway could not complete this request. Verify the gateway URL, provider configuration, and the explicit provider credential.", time: "error" } : message));
      toast("Gateway request was not completed.");
    }
  }

  function handlePaletteAction(action: string) {
    setPaletteOpen(false);
    if (action === "new") return newTab();
    if (action === "history" || action === "settings") return openDestination(action);
    if (action === "providers" || action === "projects" || action === "routes" || action === "usage") return openDestination(action);
    toast("Command is not available in this local workspace.");
  }

  if (!localIdentity) return <EntryScreen invitationDetected={Boolean(gatewayUrl && pairingId && pairingCode)} onCreate={(label, mode) => {
    const intention = label.trim();
    if (intention) {
      setMessages([
        { id: stableId(), workspaceId: route.workspaceId, sessionId: route.sessionId, tabId: route.tabId, sectionId: "all", role: "user", title: "first intention", body: intention, time: "now" },
        { id: stableId(), workspaceId: route.workspaceId, sessionId: route.sessionId, tabId: route.tabId, sectionId: "all", role: "assistant", title: "local workspace ready", body: "The first command opened a local DevThink session. Add a provider through the local CLI when the work needs a model.", time: "local" },
      ]);
    }
    setLocalIdentity(createLocalIdentity(intention, mode));
  }} />;

  return (
    <div className="devthink-app devthink-app--terminal">
      <TerminalWorkspace sectionId={route.sectionId} routeLabel={`w/${route.workspaceId.slice(0, 8)} · s/${route.sessionId.slice(0, 8)}`} provider={provider} messages={messages.filter((message) => !message.tabId || message.tabId === route.tabId)} tabs={tabs} activeTabId={route.tabId} draft={draft} paired={Boolean(browserToken && (!pairingExpiresAt || pairingExpiresAt > Date.now()))} onDraftChange={setDraft} onSend={sendMessage} onCategory={(sectionId) => navigate({ sectionId})} onDestination={openDestination} onSelectTab={selectTab} onCloseTab={closeTab} onNewTab={newTab} onOpenPalette={() => setPaletteOpen(true)} />
      {route.sectionId === "settings" && <PairingPanel gatewayUrl={gatewayInput} pairingId={pairingId} code={pairingCode} userId={pairingUserId} expiresAt={pairingExpiresAt} paired={Boolean(browserToken && (!pairingExpiresAt || pairingExpiresAt > Date.now()))} onGatewayChange={setGatewayInput} onPairingIdChange={setPairingId} onCodeChange={setPairingCode} onSubmit={pairLocalGateway} onRevoke={revokeLocalGateway} />}
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onAction={handlePaletteAction} />
    </div>
  );
}
