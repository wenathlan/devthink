/** Style: DevThink Terminal Atelier — browser gateway client that stores only an ephemeral pairing token, never a provider credential. */

export type GatewayContext = { url?: string; token?: string };

export function gatewayContext(): GatewayContext {
  const query = new URLSearchParams(window.location.search);
  const url = query.get("gateway") || window.sessionStorage.getItem("devthink.gateway") || undefined;
  const token = window.sessionStorage.getItem("devthink.pair.token") || undefined;
  return { url: url?.replace(/\/$/, ""), token };
}

export async function gatewayJson<T>(path: string, init?: RequestInit): Promise<T> {
  const context = gatewayContext();
  if (!context.url) throw new Error("A local DevThink gateway is not paired.");
  const headers = new Headers(init?.headers);
  if (context.token) headers.set("authorization", `Bearer ${context.token}`);
  const response = await fetch(`${context.url}${path}`, { ...init, headers });
  if (!response.ok) throw new Error(`Gateway returned ${response.status}.`);
  return response.json() as Promise<T>;
}

export function gatewayReady(): boolean {
  const context = gatewayContext();
  return Boolean(context.url && context.token);
}
