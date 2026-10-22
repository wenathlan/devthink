// # oauthrow — the provider row contract of the owner entry flow (root
// layer). The person creates an account with email and password, or signs
// in with google, github and gitlab, because the bots are ready on the
// owner accounts — and the callback page detects the origin by state, a
// single page for all providers. This module owns the PURE half of that
// law: the provider metadata (the authorize endpoints, the scope sets),
// the honest readiness table (a provider is ready only when its env
// client id answered — secrets never in code), the state mint and the
// state marker the single callback parses back, the authorize url builder
// and the pkce pair mint. The browser half (the button row and the
// redirect) rides the auth page; the receiving half rides the callback
// page. The pkce mint follows the RFC 7636 shape the root oauth.ts
// established for the cli family (verifier -> BASE64URL(SHA-256)) — this
// module is the browser surface, so the primitives are the web crypto
// twins, never the node builtins the cli file carries.

/** The provider family of the row: the three owner accounts the bots ride. */
export type OAuthProvider = "google" | "github" | "gitlab";

/** The providers in row order — the buttons render in this order. */
export const OAUTH_PROVIDERS: readonly OAuthProvider[] = ["google", "github", "gitlab"];

/** The authorize endpoints of the family, one per provider. */
export const OAUTH_AUTHORIZE_ENDPOINTS: Readonly<Record<OAuthProvider, string>> = Object.freeze({
  google: "https://accounts.google.com/o/oauth2/v2/auth",
  github: "https://github.com/login/oauth/authorize",
  gitlab: "https://gitlab.com/oauth/authorize",
});

/** The scope sets of the family — the identity floor, nothing more. */
export const OAUTH_SCOPES: Readonly<Record<OAuthProvider, string>> = Object.freeze({
  google: "openid email profile",
  github: "read:user user:email",
  gitlab: "read_user",
});

/** The env names the client ids ride (the ids land with the gateway
 * configuration — the code never carries them). */
export const OAUTH_ID_ENV: Readonly<Record<OAuthProvider, string>> = Object.freeze({
  google: "VITE_OAUTH_GOOGLE_ID",
  github: "VITE_OAUTH_GITHUB_ID",
  gitlab: "VITE_OAUTH_GITLAB_ID",
});

/** The env name the callback base rides. */
export const OAUTH_CALLBACK_ENV = "VITE_OAUTH_CALLBACK";

/** The callback base of the owner accounts when the env stays silent. */
export const OAUTH_CALLBACK_DEFAULT = "https://auth.devthink.pro/callback";

/** The state marker every minted state carries: devthink:<provider>:<random>. */
export const OAUTH_STATE_MARKER = "devthink";

/** Which providers accept the pkce s256 challenge (github accepts it for apps). */
const OAUTH_PKCE: Readonly<Record<OAuthProvider, boolean>> = Object.freeze({
  google: true,
  github: true,
  gitlab: true,
});

/** One provider of the honest readiness table. */
export interface ProviderRowEntry {
  /** which provider this row is. */
  provider: OAuthProvider;
  /** the configured client id, "" when the env did not answer — never an invented id. */
  clientId: string;
  /** the honest verdict: an id is configured, or it is not. */
  ready: boolean;
}

/** The honest readiness table of the row. */
export interface ProviderRowView {
  /** the three providers in row order. */
  providers: readonly ProviderRowEntry[];
  /** the callback base every redirect_uri of the row rides. */
  callbackBase: string;
}

/**
 * Reads one env value: the explicit record first (the tests pass a
 * literal), then import.meta.env when the build carries it, "" otherwise.
 * The value is trimmed — a blank id is no id.
 *
 * @param key the env name to read.
 * @param env the env override record, when the caller owns one.
 * @returns the trimmed value, or "" when nothing answered.
 */
function readenvvalue(key: string, env?: Readonly<Record<string, string | undefined>>): string {
  let raw: string | undefined;
  if (env) {
    raw = env[key];
  } else if (typeof import.meta.env !== "undefined") {
    raw = import.meta.env[key] as string | undefined;
  }
  return typeof raw === "string" ? raw.trim() : "";
}

/**
 * The honest readiness table of the provider row: a provider is ready only
 * when its env client id answered a non-empty value, and the callback base
 * is the env value or the owner default. A missing env stays missing — the
 * row renders the unconfigured note, never a fake redirect.
 *
 * @param env the env override record (the tests), defaults to the build env.
 * @returns the table the auth row renders from.
 */
export function providerRow(env?: Readonly<Record<string, string | undefined>>): ProviderRowView {
  const callbackBase = readenvvalue(OAUTH_CALLBACK_ENV, env) || OAUTH_CALLBACK_DEFAULT;
  const providers = OAUTH_PROVIDERS.map((provider) => {
    const clientId = readenvvalue(OAUTH_ID_ENV[provider], env);
    return { provider, clientId, ready: clientId.length > 0 };
  });
  return { providers, callbackBase };
}

/**
 * Mints the state of one round trip: the marker devthink:<provider>:<random>
 * (crypto.randomUUID), the single callback parses the provider back out of
 * it — one page for all providers.
 *
 * @param provider the provider the row starts the trip for.
 * @returns the fresh state value the authorize url carries.
 */
export function newOAuthState(provider: OAuthProvider): string {
  return `${OAUTH_STATE_MARKER}:${provider}:${globalThis.crypto.randomUUID()}`;
}

/**
 * Parses the state marker the callback receives — the callback side of the
 * row contract.
 *
 * @param state the raw state param of the callback url.
 * @returns the provider the round trip started from, or null when the state
 * is absent, malformed or names no provider of the row — the callback then
 * answers the unknown-origin face.
 */
export function detectProviderFromState(state: string | null | undefined): OAuthProvider | null {
  if (typeof state !== "string") return null;
  const marker = `${OAUTH_STATE_MARKER}:`;
  if (!state.startsWith(marker)) return null;
  const rest = state.slice(marker.length);
  const separator = rest.indexOf(":");
  if (separator <= 0) return null;
  const provider = rest.slice(0, separator);
  const random = rest.slice(separator + 1);
  if (!random) return null;
  if (provider !== "google" && provider !== "github" && provider !== "gitlab") return null;
  return provider;
}

/**
 * Builds the authorize url of one provider round trip — the pure builder,
 * the same URLSearchParams shape the root oauth.ts buildAuthUrl established
 * for the cli family: client_id from the honest env read, redirect_uri the
 * callback base, response_type code, the scope set of the provider, the
 * state marker, and the pkce s256 challenge when the provider accepts one.
 *
 * @param provider which provider the round trip rides.
 * @param state the minted state (newOAuthState) the callback parses back.
 * @param codeChallenge the s256 challenge (mintPkcePair), or null to ride
 * state-only.
 * @param env the env override record (the tests), defaults to the build env.
 * @returns the authorize url — only a ready provider owns a meaningful one,
 * the row checks the table before it redirects.
 */
export function buildAuthorizeUrl(
  provider: OAuthProvider,
  state: string,
  codeChallenge: string | null,
  env?: Readonly<Record<string, string | undefined>>,
): string {
  const row = providerRow(env);
  const entry = row.providers.find((candidate) => candidate.provider === provider);
  const params = new URLSearchParams({
    client_id: entry?.clientId ?? "",
    redirect_uri: row.callbackBase,
    response_type: "code",
    scope: OAUTH_SCOPES[provider],
    state,
  });
  if (codeChallenge && OAUTH_PKCE[provider]) {
    params.set("code_challenge", codeChallenge);
    params.set("code_challenge_method", "S256");
  }
  return `${OAUTH_AUTHORIZE_ENDPOINTS[provider]}?${params.toString()}`;
}

/** One pkce pair, the RFC 7636 shape: the verifier and its s256 challenge. */
export interface PkcePair {
  /** the verifier the round trip parks and the exchange redeems. */
  verifier: string;
  /** BASE64URL(SHA-256(verifier)) — the challenge the authorize url carries. */
  challenge: string;
}

/**
 * Mints one pkce pair for the browser row — the web crypto twin of the
 * generatePKCE the root oauth.ts mints for the cli family: 64 random bytes
 * -> base64url verifier, challenge the sha-256 digest of it.
 *
 * @returns the verifier/challenge pair the authorize url and the parking
 * slot share.
 */
export async function mintPkcePair(): Promise<PkcePair> {
  const bytes = new Uint8Array(64);
  globalThis.crypto.getRandomValues(bytes);
  const verifier = base64url(bytes);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  const challenge = base64url(new Uint8Array(digest));
  return { verifier, challenge };
}

/**
 * The sessionStorage key the auth row parks the verifier of one provider
 * under — the exchange (the gateway wave) redeems it later.
 *
 * @param provider the provider the round trip rides.
 * @returns the parking slot name (dt.oauth.verifier.<provider>).
 */
export function oauthVerifierKey(provider: OAuthProvider): string {
  return `dt.oauth.verifier.${provider}`;
}

/** Encodes bytes as base64url without padding — the RFC 7636 alphabet. */
function base64url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
