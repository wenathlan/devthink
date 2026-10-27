/**
 * panel page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file; no module outside the folder imports the folder members
 * directly. This anchor carries the former main component of the folder
 * (the desktop workspace of the OS), which now lives here as the page mount
 * itself. The desktop answers at /panel and at every family route
 * (/<slug> — DevThink barra <app>, the window opens on arrival) and at
 * every deep /w/… workspace route: a deep link ending in /chat parks its
 * session id in the chatstate handoff slot and the chat window consumes it;
 * the intro hands the surface straight over to this desktop.
 */

/** Style: DevThink Shell OS — React renders the boot once per session and
 * hands over straight to the desktop; the desktop opens the apps. The local
 * identity resolves silently through browserIdentity() (no lock screen in
 * the chain) and the pairing panel stays reachable from settings. When the
 * intro page already played the session-opening animation, the boot screen
 * is skipped (shouldBoot reads the catalogued intro flag of onboardingstate.ts). */
import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocation, useRoute } from "wouter";
import { PairingPanel } from "@/settings/settings";
import { islocalunlocked, restoreonce } from "../../authfamily.ts";
import { writeChatHandoff } from "../../chatstate.ts";
import { copy } from "../../copy.ts";
import { historypath, safegatewayurl } from "../../gatewayfamily.ts";
import { panelgateverdict, resolveintrotarget } from "../../introtarget.ts";
import type { DevThinkTab } from "../../paneltypes.ts";
import {
  browserIdentity,
  cacheBrowserIdentity,
  cacheGatewaySession,
  ensureBrowserSession,
  readBrowserPreferences,
} from "../../storagefamily.ts";
import type { WorkspaceDestination } from "../../workspace.ts";
import { BootScreen, CommandPalette, ShellWorkspace, SolLogoMark, shouldBoot } from "../widgets";

export * from "../widgets";
export * from "../widgets";
export * from "../widgets";
export * from "../widgets";
export * from "../widgets";
export * from "../widgets";
export * from "../widgets";

/** The old persisted shell stage ("identity" / "entry" / "shell") is no
 * longer a gate: every value lands on the desktop. The key is retired from
 * the chain — no screen ever blocks the entry. */

type RouteState = {
  workspaceId: string;
  sessionId: string;
  tabId: string;
  sectionId: string;
};
type GatewaySession = {
  id: string;
  workspaceId: string;
  title: string;
  activeTabId: string;
  tabs: Array<{
    id: string;
    workspaceId: string;
    sessionId: string;
    label: string;
    provider?: string;
    sectionId: string;
    createdAt: string;
    updatedAt: string;
  }>;
  messages: Array<{
    id: string;
    workspaceId: string;
    sessionId: string;
    tabId: string;
    sectionId: string;
    role: "user" | "assistant" | "system";
    content: string;
    createdAt: string;
  }>;
};
type PairingResponse = { token: string; userId: string; expiresAt: number };
type PairedIdentity = { userId: string; deviceId: string; createdAt: string };
type IdentityResponse = { identity: PairedIdentity };
type WorkbenchPreferences = {
  theme: "dark" | "light";
  railMode: "always" | "auto" | "off";
  interfaceZoom: string;
};

const defaultPreferences: WorkbenchPreferences = {
  theme: "light",
  railMode: "auto",
  interfaceZoom: "100",
};

function stableId(): string {
  const alphabet = "0123456789abcdefghjkmnpqrstvwxyz";
  const bytes = new Uint8Array(10);
  globalThis.crypto?.getRandomValues?.(bytes);
  const token = Array.from(bytes, (value) => alphabet[value & 31]).join("") || Math.random().toString(36).slice(2, 12);
  return `l_${token}`;
}

/** The stable local route of this browser session (sessionStorage
 * "dt.local.route"): every cold /panel entry lands on the SAME local
 * workspace/session/tab instead of minting a fresh id trio per mount —
 * the session survives visits, the label stays honest and the history
 * stops piling up throwaway "Local session" records. A malformed stored
 * value falls back to a fresh mint; storage failures never break the boot. */
const LOCAL_ROUTE_KEY = "dt.local.route";

function readLocalRoute(): RouteState {
  try {
    const raw = window.sessionStorage.getItem(LOCAL_ROUTE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<RouteState>;
      if (
        typeof parsed.workspaceId === "string" &&
        parsed.workspaceId &&
        typeof parsed.sessionId === "string" &&
        parsed.sessionId &&
        typeof parsed.tabId === "string" &&
        parsed.tabId
      )
        return {
          workspaceId: parsed.workspaceId,
          sessionId: parsed.sessionId,
          tabId: parsed.tabId,
          sectionId: "chat",
        };
    }
  } catch {
    // storage unavailable or malformed: mint a fresh local route below
  }
  const fresh: RouteState = {
    workspaceId: stableId(),
    sessionId: stableId(),
    tabId: stableId(),
    sectionId: "chat",
  };
  try {
    window.sessionStorage.setItem(LOCAL_ROUTE_KEY, JSON.stringify(fresh));
  } catch {
    // storage unavailable: the route lives for this mount only
  }
  return fresh;
}

function gatewayFromSearch(search: string): string | undefined {
  const configured = new URLSearchParams(search).get("gateway") || import.meta.env.VITE_DEVTHINK_GATEWAY_URL;
  return configured ? configured.replace(/\/$/, "") : undefined;
}

/** one session tab of the HD (gateway or local record) to the shell shape */
function toShellTab(tab: {
  id: string;
  sessionId: string;
  workspaceId: string;
  label: string;
  provider?: string;
  sectionId: string;
  createdAt?: string;
}): DevThinkTab {
  return {
    id: tab.id,
    sessionId: tab.sessionId,
    workspaceId: tab.workspaceId,
    label: tab.label,
    provider: tab.provider || "local",
    sectionId: tab.sectionId,
    createdAt: tab.createdAt,
  };
}

export default function Panel({ familySlug: familyRoute }: { familySlug?: string }) {
  const [_location, setLocation] = useLocation();
  const [, params] = useRoute("/w/:workspaceId/s/:sessionId/t/:tabId/:sectionId");
  const configuredGateway = gatewayFromSearch(window.location.search);
  const invitation = useMemo(() => new URLSearchParams(window.location.search), []);
  /** the family arrival, from either handoff: the OS's own /<slug> route
   * (the address the bar keeps) or the ?arrive= slug the standalone app
   * index stamped before the OS took over (the typed-URL law: devthink barra
   * <app> lands INSIDE the os, the same window the double click opens) */
  const familySlug = familyRoute ?? invitation.get("arrive") ?? undefined;
  const [gatewayInput, setGatewayInput] = useState(
    () => configuredGateway || window.sessionStorage.getItem("devthink.gateway") || "",
  );
  const gatewayUrl = safegatewayurl(gatewayInput);
  /** "deep" is the entry shape: a /w/… link arrives once, hands its ids to
   * the route state and the bar seals on the clean desktop path. The route
   * is React STATE after that — the ids ride the session storage, never the
   * router (the wouter location of the desktop stays /panel, so no history
   * write can bounce the tree between two Route elements again). */
  const deep = Boolean(params);
  const fallbackRoute: RouteState = useMemo(() => readLocalRoute(), []);
  // biome-ignore lint/correctness/useExhaustiveDependencies: the initializer runs once per mount — the deep ids are read from the first params identity
  const [route, setRouteState] = useState<RouteState>(() =>
    params
      ? {
          workspaceId: params.workspaceId,
          sessionId: params.sessionId,
          tabId: params.tabId,
          sectionId: params.sectionId,
        }
      : fallbackRoute,
  );
  const [tabs, setTabs] = useState<DevThinkTab[]>([]);
  const [draftPaletteOpen, setPaletteOpen] = useState(false);
  const [browserToken, setBrowserToken] = useState(() => window.sessionStorage.getItem("devthink.pair.token") || "");
  const [pairingId, setPairingId] = useState(() => invitation.get("pair") || "");
  const [pairingCode, setPairingCode] = useState(() => invitation.get("code")?.toUpperCase() || "");
  const [pairingUserId, setPairingUserId] = useState<string | undefined>(
    () => window.sessionStorage.getItem("devthink.pair.user") || undefined,
  );
  const [pairingExpiresAt, setPairingExpiresAt] = useState<number | undefined>(
    () => Number(window.sessionStorage.getItem("devthink.pair.expires")) || undefined,
  );
  const [pairedIdentity, setPairedIdentity] = useState<PairedIdentity>();
  const [booting, setBooting] = useState(() => shouldBoot());
  /** the auth gate of the entry chain: "pending" while the family session
   * question rides, "open" when a door answered, "locked" when the chain
   * walks back to the auth face (the panel is the LAST page — the owner's
   * law). The owned targets (desktop, installer, android, extension) open
   * straight: the boot IS their intro, no gate ever blocks the system face. */
  const [gate, setGate] = useState<"pending" | "open" | "locked">(() =>
    resolveintrotarget(import.meta.env.VITE_DT_TARGET as string | undefined) === "web" ? "pending" : "open",
  );
  const [preferences, setPreferences] = useState<WorkbenchPreferences>(defaultPreferences);
  const browserHeaders = useMemo(() => {
    const headers: Record<string, string> = {};
    if (browserToken) headers.authorization = `Bearer ${browserToken}`;
    return headers;
  }, [browserToken]);
  const paired = Boolean(browserToken && (!pairingExpiresAt || pairingExpiresAt > Date.now()));

  /** stable per route change (the hydration effect keys on this identity —
   * a fresh closure every render re-ran it forever) */
  const navigate = useCallback((next: Partial<RouteState>) => {
    // the windows law of the address: the ids ride the session storage and
    // the route state — never the router. The bar seals on the clean
    // desktop path only when it still carries the deep workspace path.
    setRouteState((current) => {
      const nextRoute = { ...current, ...next };
      try {
        window.sessionStorage.setItem(LOCAL_ROUTE_KEY, JSON.stringify(nextRoute));
      } catch {
        // storage unavailable: the route lives for this mount only
      }
      return nextRoute;
    });
    if (window.location.pathname !== historypath("/panel"))
      window.history.replaceState(null, "", historypath("/panel"));
  }, []);

  // the deep boot seal: a /w/… link enters, persists its ids, seals the bar
  // on the clean desktop path and — when the link targets the chat — parks
  // the session id for the chat window handoff
  useEffect(() => {
    if (!deep) return;
    try {
      window.sessionStorage.setItem(LOCAL_ROUTE_KEY, JSON.stringify(route));
    } catch {
      // storage unavailable: the route lives for this mount only
    }
    if (route.sectionId === "chat") writeChatHandoff(route.sessionId);
    window.history.replaceState(null, "", historypath("/panel"));
  }, [deep, route]);

  function openDestination(destination: WorkspaceDestination) {
    const directRoutes: Partial<Record<WorkspaceDestination, string>> = {
      providers: "/providers",
      projects: "/projects",
      usage: "/usage",
      settings: "/settings",
    };
    if (directRoutes[destination]) return setLocation(directRoutes[destination] as string);
    navigate({ sectionId: destination === "chat" ? "all" : destination });
  }

  const rememberPairing = useCallback(
    (result: PairingResponse) => {
      // the storage echoes the guarded base, so every other surface (the
      // settings gateway card, the next boot) inherits the same safety
      window.sessionStorage.setItem("devthink.gateway", gatewayUrl ?? "");
      window.sessionStorage.setItem("devthink.pair.token", result.token);
      window.sessionStorage.setItem("devthink.pair.user", result.userId);
      window.sessionStorage.setItem("devthink.pair.expires", String(result.expiresAt));
      setBrowserToken(result.token);
      setPairingUserId(result.userId);
      setPairingExpiresAt(result.expiresAt);
      setPairingCode("");
      toast("Local DevThink workspace paired.");
    },
    [gatewayUrl],
  );

  async function pairLocalGateway(event: FormEvent) {
    event.preventDefault();
    await consumeLocalInvitation();
  }

  const consumeLocalInvitation = useCallback(async () => {
    if (!gatewayUrl || !pairingId || pairingCode.length !== 8)
      return toast("Open a CLI invitation link or use manual setup to provide the local connection details.");
    try {
      const response = await fetch(`${gatewayUrl}/pairings/consume`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ pairingId, code: pairingCode }),
      });
      if (!response.ok) throw new Error("Pairing was rejected.");
      rememberPairing((await response.json()) as PairingResponse);
    } catch {
      toast(
        "The local pairing could not be completed. Confirm the CLI gateway is running, the page origin is allowed, and the code has not expired.",
      );
    }
  }, [gatewayUrl, pairingId, pairingCode, rememberPairing]);

  async function revokeLocalGateway() {
    try {
      if (gatewayUrl && browserToken)
        await fetch(`${gatewayUrl}/pairings/revoke`, {
          method: "POST",
          headers: { "content-type": "application/json", ...browserHeaders },
        });
    } finally {
      for (const key of ["devthink.pair.token", "devthink.pair.user", "devthink.pair.expires"])
        window.sessionStorage.removeItem(key);
      setBrowserToken("");
      setPairingUserId(undefined);
      setPairingExpiresAt(undefined);
      setPairedIdentity(undefined);
      toast("Local browser pairing revoked.");
    }
  }

  async function updatePreference(key: keyof WorkbenchPreferences, value: string) {
    const next = { ...preferences, [key]: value } as WorkbenchPreferences;
    if (!gatewayUrl || !browserToken) return toast("Pair the local CLI before saving shared workbench preferences.");
    try {
      const response = await fetch(`${gatewayUrl}/preferences`, {
        method: "PATCH",
        headers: { "content-type": "application/json", ...browserHeaders },
        body: JSON.stringify({ key, value }),
      });
      if (!response.ok) throw new Error("Preference was rejected.");
      setPreferences(next);
      toast(`${key} updated in the local DevThink workspace.`);
    } catch {
      toast("The local gateway could not save that preference.");
    }
  }

  async function updatePublicUserId(userId: string) {
    if (!gatewayUrl || !browserToken) return toast("Pair the local CLI before changing the shared public ID.");
    try {
      const response = await fetch(`${gatewayUrl}/identity`, {
        method: "PUT",
        headers: { "content-type": "application/json", ...browserHeaders },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) throw new Error("Public ID was rejected.");
      const result = (await response.json()) as IdentityResponse;
      setPairedIdentity(result.identity);
      setPairingUserId(result.identity.userId);
      window.sessionStorage.setItem("devthink.pair.user", result.identity.userId);
      toast("Shared public ID updated in the local DevThink identity.");
    } catch {
      toast("Use 10-15 lowercase letters or numbers, starting with a letter.");
    }
  }

  useEffect(() => {
    if (browserToken || !gatewayUrl || !pairingId || pairingCode.length !== 8) return;
    void consumeLocalInvitation();
  }, [browserToken, gatewayUrl, pairingCode, pairingId, consumeLocalInvitation]);

  /** the auth gate: the family session question rides once per mount. A
   * live restore (the rotated cookie or the parked bearer) opens the
   * desktop; the declared offline unlock of this browser session opens it
   * too; every other answer walks the chain back to the auth face with
   * the arrival address riding ?next= so the sign-in returns exactly
   * here. The owned targets never ask — they opened at the state init. */
  useEffect(() => {
    if (gate !== "pending") return;
    let alive = true;
    void restoreonce()
      .then((session) => {
        if (!alive) return;
        const verdict = panelgateverdict(
          resolveintrotarget(import.meta.env.VITE_DT_TARGET as string | undefined),
          session,
          islocalunlocked(),
        );
        if (verdict === "open") {
          setGate("open");
          return;
        }
        setGate("locked");
        const arrival = window.location.pathname + window.location.search;
        setLocation(["/auth?next=", encodeURIComponent(arrival)].join(""));
      })
      .catch(() => {
        if (!alive) return;
        // the session question itself failed: the honest answer is locked —
        // the desktop never opens on a question that could not be asked
        setGate("locked");
        setLocation("/auth");
      });
    return () => {
      alive = false;
    };
  }, [gate, setLocation]);

  useEffect(() => {
    void Promise.all([browserIdentity(), readBrowserPreferences()])
      .then(([identity, stored]) => {
        setPairingUserId((current) => current || identity.userId);
        setPreferences((current) => ({ ...current, ...stored }));
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!gatewayUrl || !browserToken) return;
    void fetch(`${gatewayUrl}/identity`, { headers: browserHeaders })
      .then(async (response) =>
        response.ok
          ? (response.json() as Promise<IdentityResponse>)
          : Promise.reject(new Error("Identity unavailable.")),
      )
      .then((result) => {
        setPairedIdentity(result.identity);
        setPairingUserId(result.identity.userId);
        window.sessionStorage.setItem("devthink.pair.user", result.identity.userId);
        return cacheBrowserIdentity(result.identity);
      })
      .catch(() => undefined);
  }, [browserHeaders, browserToken, gatewayUrl]);

  useEffect(() => {
    if (!gatewayUrl || !browserToken) return;
    void fetch(`${gatewayUrl}/preferences`, { headers: browserHeaders })
      .then(async (response) =>
        response.ok
          ? (response.json() as Promise<{
              preferences?: Partial<WorkbenchPreferences>;
            }>)
          : Promise.reject(new Error("Preferences unavailable.")),
      )
      .then((result) => setPreferences((current) => ({ ...current, ...result.preferences })))
      .catch(() => undefined);
  }, [browserHeaders, browserToken, gatewayUrl]);

  useEffect(() => {
    if (deep) return;
    // a parked deep link owns the URL: the dispatcher hands it back and the
    // replay walks to it — the local session bootstrap must not stomp it
    try {
      if (window.sessionStorage.getItem("dt.deep.route")) return;
    } catch {
      // storage unavailable: behave as if no deep link was parked
    }
    // the bootstrap never moves the router: the desktop lives at /panel and
    // the ids ride the route state (a history write here would bounce the
    // tree between two Route elements — the ping-pong the shell once shipped)
    if (familySlug) {
      // a family arrival route keeps its own address (DevThink barra <app>):
      // the local session still boots into the HD, but the bar never leaves
      // the app's subpath
      void ensureBrowserSession(fallbackRoute)
        .then((snapshot) => setTabs(snapshot.tabs.map(toShellTab)))
        .catch(() => undefined);
      return;
    }
    if (!gatewayUrl || !browserToken) {
      void ensureBrowserSession(fallbackRoute)
        .then((snapshot) => setTabs(snapshot.tabs.map(toShellTab)))
        .catch(() => undefined);
      return;
    }
    void fetch(`${gatewayUrl}/sessions`, {
      method: "POST",
      headers: { "content-type": "application/json", ...browserHeaders },
      body: JSON.stringify({ mode: "chat", sectionId: "chat" }),
    })
      .then(async (response) =>
        response.ok
          ? (response.json() as Promise<GatewaySession>)
          : Promise.reject(new Error("Gateway session creation failed.")),
      )
      .then((session) => {
        navigate({
          workspaceId: session.workspaceId,
          sessionId: session.id,
          tabId: session.activeTabId,
          sectionId: "chat",
        });
        setTabs(session.tabs.map(toShellTab));
      })
      .catch(() => {
        toast("Local route opened. Add a gateway URL to persist it through DevThink CLI.");
      });
  }, [browserHeaders, browserToken, deep, fallbackRoute, familySlug, gatewayUrl, navigate]);

  // the deep hydration: the link session lands in the HD and the shell tabs
  // ride the snapshot — the conversation itself belongs to the chat window,
  // which consumes the handoff slot on its own mount. The memoized route
  // object keys the effect: a new identity only when the route really moved.
  useEffect(() => {
    if (!deep) return;
    void ensureBrowserSession(route)
      .then((snapshot) => setTabs(snapshot.tabs.map(toShellTab)))
      .catch(() => undefined);
    if (!gatewayUrl || !browserToken) return;
    void fetch(`${gatewayUrl}/sessions/${encodeURIComponent(route.sessionId)}`, { headers: browserHeaders })
      .then(async (response) =>
        response.ok ? (response.json() as Promise<GatewaySession>) : Promise.reject(new Error("Session unavailable.")),
      )
      .then((session) => {
        if (session.workspaceId !== route.workspaceId) throw new Error("Route workspace does not match session.");
        setTabs(session.tabs.map(toShellTab));
        void cacheGatewaySession(session);
      })
      .catch(() => undefined);
  }, [browserHeaders, browserToken, deep, gatewayUrl, route]);

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

  function selectTab(id: string) {
    navigate({ tabId: id });
  }

  function handlePaletteAction(action: string) {
    setPaletteOpen(false);
    if (action === "console" || action === "gateway" || action === "docs" || action === "explore")
      return setLocation(`/${action}`);
    if (action === "history" || action === "settings") return openDestination(action);
    if (action === "providers" || action === "projects" || action === "usage") return openDestination(action);
    toast("Command is not available in this local workspace.");
  }

  /** the gate face: while the family session question rides (and the brief
   * moment the locked redirect walks), the desktop NEVER flashes — the
   * honest wait face carries the mark, the label and the reading bar over
   * the night canvas. */
  if (gate !== "open")
    return (
      <div className="dtw-gate" role="status" aria-live="polite">
        <span className="dtw-gate__mark" aria-hidden="true">
          <SolLogoMark size={34} />
        </span>
        <span className="dtw-gate__label">{copy("panel.gate.label")}</span>
        <span className="dtw-gate__bar" aria-hidden="true" />
      </div>
    );

  if (booting)
    return (
      <BootScreen
        onDone={() => {
          setBooting(false);
        }}
      />
    );

  // the desktop opens directly: no identity lock, no tour — the local
  // identity resolved silently through browserIdentity() on mount
  return (
    <div
      className="devthink-app devthink-app--terminal"
      data-theme={preferences.theme}
      style={{ zoom: Number(preferences.interfaceZoom) / 100 }}
    >
      <ShellWorkspace
        familySlug={familySlug}
        chatHandoff={deep && route.sectionId === "chat" ? route.sessionId : undefined}
        sectionId={route.sectionId}
        userId={pairedIdentity?.userId}
        tabs={tabs}
        activeTabId={route.tabId}
        paired={paired}
        railMode={preferences.railMode}
        onDestination={openDestination}
        onSelectTab={selectTab}
        onNavigate={setLocation}
      />
      {route.sectionId === "settings" && (
        <PairingPanel
          gatewayUrl={gatewayInput}
          pairingId={pairingId}
          code={pairingCode}
          userId={pairedIdentity?.userId || pairingUserId}
          deviceId={pairedIdentity?.deviceId}
          expiresAt={pairingExpiresAt}
          paired={paired}
          preferences={preferences}
          onPreferenceChange={updatePreference}
          onIdentityChange={updatePublicUserId}
          onGatewayChange={setGatewayInput}
          onPairingIdChange={setPairingId}
          onCodeChange={setPairingCode}
          onSubmit={pairLocalGateway}
          onRevoke={revokeLocalGateway}
        />
      )}
      <CommandPalette open={draftPaletteOpen} onClose={() => setPaletteOpen(false)} onAction={handlePaletteAction} />
    </div>
  );
}
