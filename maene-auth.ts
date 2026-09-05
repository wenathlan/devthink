/**
 * @file auth.ts - the single authentication-management module of maene.
 * @description v2.1.14 physical consolidation: ONE file owns the ENTIRE
 *              authentication context (OAuth clients, PKCE, consent URL,
 *              callback server, token exchange, token refresh, userinfo,
 *              account file management, identity bundles). Absorbed verbatim:
 *              (a) Antigravity CLI (`agy`) identity bundle - former antigravity-cli.ts;
 *              (b) Gemini CLI OAuth client + shared endpoint/model constants - former oauth.ts;
 *              (c) full-featured OAuth primitives (PKCE, auth URL builder,
 *                  callback server, exchange, refresh, userinfo) - former oauth.ts;
 *              (d) minimal legacy flow + v3 account manager + project/quota
 *                  helpers - the original auth.ts content;
 *              (e) former oauth.ts orchestrators and helpers (authenticate,
 *                  startOAuthFlow, validation, model lists, header builders,
 *                  platform detection, legacy default export object).
 *
 *              History (v2.1.13 header of the former auth.ts): v5 definitive
 *              full flow with researches 9router omniroute gemini-cli maene;
 *              20 logics correlated, lowercase, node:* first, dual bypass
 *              definitive, accounts file v3 with addedAt createdAt lastUsed
 *              expiry; mapModelToGroup ported from auth(1).ts (v4); optional
 *              name in userInfo return from auth(2).ts (v3).
 *
 *              v2.1.14 collision policy - three DISTINCT Google OAuth client
 *              identities coexist (different clients, not duplicates):
 *                1. Antigravity CLI client: CLIENT_ID / CLIENT_SECRET (canonical,
 *                   env-overridable via ANTIGRAVITY_CLIENT_ID /
 *                   ANTIGRAVITY_CLIENT_SECRET; aliased by
 *                   ANTIGRAVITY_CLI_CLIENT_ID / ANTIGRAVITY_CLI_CLIENT_SECRET).
 *                2. Gemini CLI client: GEMINI_OAUTH_CLIENT_ID /
 *                   GEMINI_OAUTH_CLIENT_SECRET (+ GEMINI_OAUTH_CLIENT_SECRET_ALTERNATIVE
 *                   and the legacy alias CLIENT_SECRET_ALTERNATIVE) - the former
 *                   oauth.ts CLIENT_ID / CLIENT_SECRET / CLIENT_SECRET_ALTERNATIVE
 *                   values.
 *                3. Antigravity IDE blinded decoy: constants.ts (not this file).
 *              Other collisions resolved the same way (the original auth.ts
 *              meaning wins the bare name): SCOPES (Antigravity scope string) vs
 *              GEMINI_OAUTH_SCOPES (former oauth.ts scope array), ENDPOINTS
 *              (Antigravity base-URL array) vs CLOUDCODE_ENDPOINTS (former
 *              oauth.ts endpoint map), openBrowser (former auth.ts void spawner)
 *              vs openBrowserAsync (former oauth.ts cross-platform WSL-aware
 *              opener). USERINFO_URL was byte-identical in both former files and
 *              is declared once. The default export preserves the legacy oauth.js
 *              object shape with the Gemini CLI values for CJS/ESM interop
 *              consumers.
 *
 *              Self-contained: only node:* builtins + global fetch; no external
 *              dependencies, no project-file imports.
 */

// node:* imports of the three former files, deduplicated into one block. The
// namespace forms serve the former oauth.ts bodies; the named forms serve the
// former auth.ts bodies (both kept verbatim, so the two styles coexist).
import * as crypto from "node:crypto";
import * as http from "node:http";
import * as os from "node:os";
import * as readline from "node:readline";
import * as net from "node:net";
import * as url from "node:url";
import { spawn } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { createServer } from "node:http";
import { homedir, platform, arch } from "node:os";
import { join } from "node:path";
import { existsSync, mkdirSync, readFileSync, writeFileSync, chmodSync, renameSync, unlinkSync } from "node:fs";

// =============================================================================
// SECTION A - ANTIGRAVITY CLI IDENTITY BUNDLE (former antigravity-cli.ts, v2.1.8)
// =============================================================================
// Extracted from the distributed `agy` binary and live-validated end to end on
// 2026-08-26 (consent screen renders as "Google Antigravity"; loopback redirect
// accepted; code exchange + refresh + userinfo + loadCodeAssist +
// fetchAvailableModels + generateContent all verified live).
//
// Layout: library-first, root-first (no src/ folder, the former file lived
// beside its siblings). Platform-agnostic: every path resolves dynamically per
// OS, nothing is hardcoded to a single machine layout.
//
// Masquerade set of maene (all four Google client identities):
//   1. Gemini CLI           - GeminiCLI/x.y.z UA (see fingerprint.ts)
//   2. Antigravity CLI      - THIS section (agy binary identity)
//   3. Antigravity IDE      - antigravity/x.y.z UA (see constants.ts)
//   4. Gemini Code Assist   - ideType/pluginType metadata (Section B below)
// =============================================================================

// =============================================================================
// OAUTH CLIENT - OFFICIAL ANTIGRAVITY CLI (`agy`)
// =============================================================================

/**
 * Canonical OAuth client credentials of the Antigravity CLI (formerly the
 * top-level definitions of auth.ts). Env-overridable via
 * ANTIGRAVITY_CLIENT_ID / ANTIGRAVITY_CLIENT_SECRET; the fallback literal is
 * assembled from segments exactly like the `agy` binary embeds it. Google
 * renders the consent screen as "Google Antigravity" for this client.
 */
export const CLIENT_ID =
  process.env.ANTIGRAVITY_CLIENT_ID?.trim() ||
  process.env.GOOGLE_CLIENT_ID?.trim() ||
  ["1071006060591", "-tmhssin2h21lcre235vtol", "ojh4g403ep", ".apps.", "googleusercontent", ".com"].join("");
export const CLIENT_SECRET =
  process.env.ANTIGRAVITY_CLIENT_SECRET?.trim() || ["GOCSPX", "-K58FWR486LdL", "J1mLB8sXC4z6qDAf"].join("");

/**
 * OAuth Client ID of the Antigravity CLI, assembled at runtime from segments
 * (exactly the constant the `agy` binary embeds). Google renders the consent
 * screen as "Google Antigravity" for this client.
 * v2.1.14: byte-identical to the canonical CLIENT_ID above (same value,
 * different segment split) - deduplicated into the single env-overridable
 * definition; this historical name now aliases it.
 */
export const ANTIGRAVITY_CLI_CLIENT_ID: string = CLIENT_ID;

/**
 * Primary client secret paired with {@link ANTIGRAVITY_CLI_CLIENT_ID}
 * (runtime-assembled). This is the secret that answers the token endpoint —
 * live-verified 2026-08-26.
 * v2.1.14: byte-identical to the canonical CLIENT_SECRET above (same value,
 * different segment split) - deduplicated; this historical name now aliases it.
 */
export const ANTIGRAVITY_CLI_CLIENT_SECRET: string = CLIENT_SECRET;

/**
 * Alternative secret variant also embedded in the binary — kept under an
 * alias so no credential variant is lost; not used by default.
 */
export const ANTIGRAVITY_CLI_CLIENT_SECRET_ALTERNATIVE: string = ["GOCSPX", "-9YQWpF7RWDC0QTdj-YxKMwR0Zts", "X"].join(
  "",
);

/**
 * Scopes the Antigravity CLI requests (byte-for-byte the set the CLI puts in
 * the consent URL — includes the aicode / cclog / experimentsandconfigs
 * grants the Gemini CLI client does not ask for).
 */
export const ANTIGRAVITY_CLI_OAUTH_SCOPES: readonly string[] = [
  "https://www.googleapis.com/auth/cloud-platform",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/cclog",
  "https://www.googleapis.com/auth/experimentsandconfigs",
  "https://www.googleapis.com/auth/aicode",
  "openid",
] as const;

/** Space-joined scope string (consent URL / token endpoint form). */
export const ANTIGRAVITY_CLI_OAUTH_SCOPES_STR: string = ANTIGRAVITY_CLI_OAUTH_SCOPES.join(" ");

/**
 * Redirect URI the official CLI uses. NOTE: the CLI shows a code on this
 * remote page that the user must copy/paste back — maene does NOT use it.
 * maene uses a loopback redirect (accepted by Google for this client,
 * live-verified) which makes the whole flow automatic, no copy/paste.
 */
export const ANTIGRAVITY_CLI_REDIRECT_OFFICIAL: string = "https://antigravity.google/oauth-callback";

/**
 * Auth-success page the CLI flow can land on (kept for fidelity of the
 * identity; the loopback flow serves its own local success page).
 */
export const ANTIGRAVITY_CLI_AUTH_SUCCESS_URL: string = "https://antigravity.google/auth-success";

// =============================================================================
// VERSION POOLS - date-aware (consulted 2026-08-26)
// =============================================================================

/** Latest Antigravity CLI release seen on the official update manifest. */
export const ANTIGRAVITY_CLI_VERSION_LATEST: string = "1.1.21";

/**
 * Recent Antigravity CLI versions (public update manifest history + binary
 * telemetry). The pool exists so every account can present a plausible
 * real-world version instead of a single frozen one.
 */
// v2.1.15 Phase B: ANTIGRAVITY_CLI_VERSION_POOL moved to constants.js (raw value owner).

/** grpc-go version line compiled into the `agy` binary (1.1.21). */
export const ANTIGRAVITY_CLI_GRPC_VERSION: string = "1.85.0";

// =============================================================================
// FINGERPRINT - User-Agent / X-Goog-Api-Client / Client-Metadata
// =============================================================================

/** Normalizes node's platform into the CLI's lowercase os names. */
export function antigravityCliOsName(): string {
  const p = process.platform;
  if (p === "win32") return "windows";
  if (p === "darwin") return "macos";
  return "linux";
}

/** amd64/arm64 style arch (matches the CLI manifest names). */
export function antigravityCliArchName(): string {
  return process.arch === "arm64" ? "arm64" : "amd64";
}

/**
 * Builds the User-Agent the Antigravity CLI presents.
 * Shape: `antigravity-cli/<version> (<os>; <arch>)`.
 */
export function buildAntigravityCliUserAgent(version?: string): string {
  const v = version ?? ANTIGRAVITY_CLI_VERSION_LATEST;
  return `antigravity-cli/${v} (${antigravityCliOsName()}; ${antigravityCliArchName()})`;
}

/**
 * X-Goog-Api-Client value for the Antigravity CLI identity.
 * Shape: `antigravity-cli/<version> grpc-go/<grpc>`.
 */
export function buildAntigravityCliXGoogApiClient(version?: string): string {
  const v = version ?? ANTIGRAVITY_CLI_VERSION_LATEST;
  return `antigravity-cli/${v} grpc-go/${ANTIGRAVITY_CLI_GRPC_VERSION}`;
}

/**
 * Complete request headers for the Antigravity CLI identity.
 * The Antigravity CLI does not send the ideType/pluginType Client-Metadata
 * header the Gemini CLI family uses — its fingerprint is UA + api client.
 */
export function getAntigravityCliHeaders(version?: string): Record<string, string> {
  return {
    "User-Agent": buildAntigravityCliUserAgent(version),
    "X-Goog-Api-Client": buildAntigravityCliXGoogApiClient(version),
  };
}

// =============================================================================
// IDENTITY RESOLUTION - which OAuth client does an account use?
// =============================================================================

/** OAuth client identities maene can present. */
export type MaeneOAuthIdentity = "antigravity-cli" | "gemini-cli";

/**
 * Resolved OAuth client bundle for an identity.
 * Everything the consent URL builder, the token exchange and the refresh
 * call need — no hidden globals.
 */
export interface OAuthIdentityBundle {
  identity: MaeneOAuthIdentity;
  clientId: string;
  clientSecret: string;
  clientSecretAlternative: string;
  scopes: readonly string[];
  scopesStr: string;
  /** Antigravity CLI flow is PKCE (S256); Gemini CLI web flow is state-only. */
  usesPKCE: boolean;
  userAgent: string;
  /** Human label of the app Google shows on the consent screen. */
  appLabel: string;
}

/**
 * Resolves the OAuth client bundle for an identity.
 *
 * Default policy ("auto"): NEW logins use the Antigravity CLI client — the
 * Gemini CLI free tier for individuals was retired (UNSUPPORTED_CLIENT,
 * observed live 2026-08) and the Antigravity client is the one the current
 * free tier ("Antigravity") onboards. Stored accounts keep the identity they
 * authenticated with, whatever it was.
 */
export function resolveOAuthIdentity(
  identity?: MaeneOAuthIdentity | "auto" | (string & {}) | null,
): OAuthIdentityBundle {
  const wanted =
    identity === "gemini-cli"
      ? "gemini-cli"
      : identity === "antigravity-cli" || identity === undefined || identity === null || identity === "auto"
        ? "antigravity-cli"
        : "antigravity-cli"; // unknown values fall back to the default client

  if (wanted === "gemini-cli") {
    return {
      identity: "gemini-cli",
      clientId: GEMINI_OAUTH_CLIENT_ID,
      clientSecret: GEMINI_OAUTH_CLIENT_SECRET,
      clientSecretAlternative: GEMINI_OAUTH_CLIENT_SECRET_ALTERNATIVE,
      scopes: GEMINI_CLI_SCOPES,
      scopesStr: GEMINI_CLI_OAUTH_SCOPE_STR,
      usesPKCE: false,
      userAgent: `GeminiCLI/0.57.0/gemini-3-pro-preview (${antigravityCliOsName()}; ${antigravityCliArchName()}; GitHub) google-api-nodejs-client/9.15.1`,
      appLabel: "Gemini Code Assist and Gemini CLI",
    };
  }

  return {
    identity: "antigravity-cli",
    clientId: ANTIGRAVITY_CLI_CLIENT_ID,
    clientSecret: ANTIGRAVITY_CLI_CLIENT_SECRET,
    clientSecretAlternative: ANTIGRAVITY_CLI_CLIENT_SECRET_ALTERNATIVE,
    scopes: ANTIGRAVITY_CLI_OAUTH_SCOPES,
    scopesStr: ANTIGRAVITY_CLI_OAUTH_SCOPES_STR,
    usesPKCE: true,
    userAgent: buildAntigravityCliUserAgent(),
    appLabel: "Google Antigravity",
  };
}

/**
 * Maps a stored account `type` back to the OAuth identity it must refresh
 * with. Anything that is not explicitly the Gemini CLI client refreshes with
 * the Antigravity CLI client (the default since 2.1.8).
 */
export function identityFromAccountType(accountType?: string | null): MaeneOAuthIdentity {
  if (accountType === "gemini-cli") return "gemini-cli";
  return "antigravity-cli";
}

// =============================================================================
// SECTION B - GEMINI CLI OAUTH CLIENT + SHARED CONSTANTS (former oauth.ts)
// =============================================================================
// Complete OAuth 2.0 with PKCE implementation for bypass via Gemini CLI
// identification. Production-ready, only node:* builtins + global fetch.
//
// Former oauth.ts header notes (preserved):
// - Base: oauth.ts v2.0.0 (full PKCE flow, WSL/SSH detection, manual input fallback).
// - Ported uniques from oauth(2).ts (maene 2.0.0): extra scopes (openid,
//   cloudcode, cloudaicompanion), CLOUDCODE_ORIGIN, SUPPORTED_MODELS_2026 entries
//   (unprefixed claude models folded into MODELS_2026), StartOAuthFlowOptions /
//   startOAuthFlow (injectable), refreshAndPreserve, invalid_grant
//   re-authentication error, robust error wrapping with cause and non-JSON body
//   snippet rejection, callback scope capture, multi-path callback server
//   (/callback, /, /oauth/callback), ANTIGRAVITY_USER_AGENT.
// - Conflict resolution: client secret kept as GOCSPX-4uHgMPm...lXFsxl (matches
//   package.json oauthClientSecretRef); alternative secret exported as
//   CLIENT_SECRET_ALTERNATIVE so nothing is lost.
//
// v2.1.14 renames in this section (collision policy - the bare names keep the
// Antigravity meanings of the original auth.ts, see Section D):
//   CLIENT_ID                 -> GEMINI_OAUTH_CLIENT_ID
//   CLIENT_SECRET             -> GEMINI_OAUTH_CLIENT_SECRET
//   CLIENT_SECRET_ALTERNATIVE -> GEMINI_OAUTH_CLIENT_SECRET_ALTERNATIVE
//   SCOPES                    -> GEMINI_OAUTH_SCOPES
//   ENDPOINTS                 -> CLOUDCODE_ENDPOINTS
// =============================================================================

// =============================================================================
// CONSTANTS - REQUIRED DATA (DO NOT ALTER PRIMARY CLIENT CREDENTIALS)
// =============================================================================

/**
 * OAuth Client Credentials - Google Cloud SDK / Gemini CLI masquerade.
 * v2.1.16 single-owner fix: the raw client pair is imported from constants.js
 * (the raw-value owner); this module keeps only the historical names as
 * aliases plus the alternative-secret decoy (defined nowhere else).
 */
import {
  GEMINI_CLI_OAUTH_CLIENT_ID as GEMINI_CLIENT_ID_RAW,
  GEMINI_CLI_OAUTH_CLIENT_SECRET as GEMINI_CLIENT_SECRET_RAW,
} from "./constants.js";

export const GEMINI_OAUTH_CLIENT_ID: string = GEMINI_CLIENT_ID_RAW;

/**
 * Primary client secret, paired with {@link GEMINI_OAUTH_CLIENT_ID} above.
 * v2.1.16: alias of constants.GEMINI_CLI_OAUTH_CLIENT_SECRET.
 */
export const GEMINI_OAUTH_CLIENT_SECRET: string = GEMINI_CLIENT_SECRET_RAW;

/**
 * Alternative public client secret found in oauth(2).ts
 * (GEMINI_OAUTH_CLIENT_SECRET there). Preserved under an alias so no
 * credential variant is lost; not used by default.
 * v2.1.14 rename: CLIENT_SECRET_ALTERNATIVE -> GEMINI_OAUTH_CLIENT_SECRET_ALTERNATIVE.
 */
export const GEMINI_OAUTH_CLIENT_SECRET_ALTERNATIVE = ["GOCSPX", "-4uHgMPm", "-1o7Sk-geV6", "Cu5cWa_kRl"].join("");

/**
 * Compatibility alias for the bare name used by oauth(2).ts / former oauth.ts:
 * CLIENT_SECRET_ALTERNATIVE survives with its exact original value (the
 * alternative secret). Note: per the v2.1.14 canonical naming,
 * GEMINI_OAUTH_CLIENT_SECRET above points at the PRIMARY gemini secret.
 */
export const CLIENT_SECRET_ALTERNATIVE = GEMINI_OAUTH_CLIENT_SECRET_ALTERNATIVE;

/**
 * Required scopes for Cloud Code + Userinfo + Antigravity.
 * Merged: adds openid, cloudcode and cloudaicompanion (from
 * oauth(2).ts GOOGLE_OAUTH_SCOPES) on top of the base set.
 * v2.1.14 rename: SCOPES -> GEMINI_OAUTH_SCOPES (the bare SCOPES name keeps
 * the Antigravity scope string of the original auth.ts, Section D).
 */
export const GEMINI_OAUTH_SCOPES = [
  "openid",
  "https://www.googleapis.com/auth/cloud-platform",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/cloudcode",
  "https://www.googleapis.com/auth/cloudaicompanion",
] as const;

/**
 * Space-joined scope string alias (oauth(2).ts name preserved).
 */
export const GOOGLE_OAUTH_SCOPES = GEMINI_OAUTH_SCOPES.join(" ");

/**
 * OAuth 2.0 Google endpoints.
 * v2.1.16 single-owner fix: alias of constants.OAUTH_AUTH_URL.
 */
export const OAUTH_AUTHORIZE_URL = OAUTH_AUTH_URL;
// v2.1.15 Phase C: OAUTH_TOKEN_URL and USERINFO_URL moved to constants.js
// (raw value owner) — imported at the top of this file.

/** Endpoint aliases (oauth(2).ts names preserved). */
export const GOOGLE_AUTH_URL = OAUTH_AUTHORIZE_URL;
export const GOOGLE_TOKEN_URL = OAUTH_TOKEN_URL;
export const GOOGLE_USERINFO_URL = USERINFO_URL;

/**
 * Cloud Code Assist endpoints (Antigravity bypass).
 */
// v2.1.15 Phase B: CLOUDCODE_BASE moved to constants.js (raw value owner).
/** Alias (oauth(2).ts name preserved). */
export const CLOUDCODE_API_BASE = CLOUDCODE_BASE;
/**
 * Origin required by some Cloud Code request headers.
 * Ported from oauth(2).ts.
 */
export const CLOUDCODE_ORIGIN = "https://cloud.google.com";

// v2.1.14 rename: former oauth.ts ENDPOINTS object -> CLOUDCODE_ENDPOINTS
// (the bare ENDPOINTS name keeps the former auth.ts base-URL array, Section D).
// v2.1.15 Phase B: CLOUDCODE_ENDPOINTS moved to constants.js (raw value owner).

export const SIGN_IN_SUCCESS_URL = "https://developers.google.com/gemini-code-assist/auth_success_gemini";
export const SIGN_IN_FAILURE_URL = "https://developers.google.com/gemini-code-assist/auth_failure_gemini";
export const HTTP_REDIRECT = 301;
// v2.1.15 Phase C: GEMINI_CLI_OAUTH_SCOPE (the 3-scope Gemini CLI set) is
// byte-identical to constants.GEMINI_CLI_SCOPES — imported from the owner.

export function getAvailablePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    let port = 0;
    try {
      const portStr = process.env.OAUTH_CALLBACK_PORT;
      if (portStr) {
        port = parseInt(portStr, 10);
        if (isNaN(port) || port <= 0 || port > 65535)
          return reject(
            new Error(
              "Invalid value for OAUTH_CALLBACK_PORT (expected an integer between 1 and 65535); the raw value is intentionally not echoed to avoid leaking environment contents into logs",
            ),
          );
        return resolve(port);
      }
      const server = net.createServer();
      server.listen(0, () => {
        const address = server.address();
        if (address && typeof address === "object") port = (address as any).port;
      });
      server.on("listening", () => {
        server.close();
        (server as any).unref?.();
      });
      server.on("error", (e) => reject(e));
      server.on("close", () => resolve(port));
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Project fallback when no project is linked in Code Assist.
 */
// v2.1.15 Phase B: PROJECT_FALLBACK moved to constants.js (raw value owner).

/**
 * Available models 2026 - Antigravity + Gemini.
 * Merged: unprefixed claude-opus-4-6-thinking and claude-sonnet-4-6 from
 * oauth(2).ts SUPPORTED_MODELS_2026 are folded in here (all other entries
 * were already covered).
 */
// v2.1.15 Phase A: MODELS_2026 (this module's 13-id supported list = the
// legacy bypass list plus the two bare claude ids folded in from oauth(2).ts)
// and the SupportedModel2026 union moved to models.ts
// (SUPPORTED_MODELS_2026 / SupportedModel2026) — imported and re-exported
// under the historical names so both entry points stay valid.
import { SUPPORTED_MODELS_2026 } from "./models.js";
// v2.1.15 Phase B: generic retry predicate from core.js; identity UA builders
// from fingerprint.js; raw shared values from constants.js.
import { isRetryable, fetchWithTimeout } from "./core.js";
import { atomicWrite, cfgDir } from "./config.js";
import { apiClient, buildGeminiUserAgent, ua, X_GOOG_API_CLIENT_GEMINI_CLI } from "./fingerprint.js";
import {
  ANTIGRAVITY_CLI_VERSION_POOL,
  ANTIGRAVITY_USER_AGENT,
  CLIENT_METADATA_STRING,
  CLOUDCODE_BASE,
  CLOUDCODE_ENDPOINTS,
  GEMINI_CLI_SCOPES,
  GEMINI_CLI_SCOPES_JOINED as GEMINI_CLI_OAUTH_SCOPE_STR,
  OAUTH_AUTH_URL,
  OAUTH_TOKEN_URL,
  OAUTH_USERINFO_URL as USERINFO_URL,
  PROJECT_FALLBACK,
} from "./constants.js";
import type { SupportedModel2026 } from "./models.js";
export { SUPPORTED_MODELS_2026 };
export { SUPPORTED_MODELS_2026 as MODELS_2026 };
export type { SupportedModel2026 };

/**
 * Updated User-Agent from maene 2.0.0 (GPN:GeminiCLI style).
 * Ported from oauth(2).ts; exported for callers that need to present it,
 * while the default bypass headers below remain unchanged.
 */
// v2.1.15 Phase B: ANTIGRAVITY_USER_AGENT moved to constants.js (raw value owner).

/**
 * Gemini CLI identification headers for bypass.
 * User-Agent varies per platform; base values below.
 * v2.1.16 single-owner fix: every part is imported from its owner — the
 * default UA model id from models.js (model identification owner), the
 * client-metadata string from constants.js and the gl-node snapshot from
 * fingerprint.js (identity masquerade owner).
 */
import { UA_DEFAULT_MODEL } from "./models.js";
export const GEMINI_UA_BASE = {
  cliVersion: "0.57.0",
  defaultModel: UA_DEFAULT_MODEL,
  googleApiClient: "google-api-nodejs-client/9.15.1",
  xGoogApiClient: X_GOOG_API_CLIENT_GEMINI_CLI,
  clientMetadata: CLIENT_METADATA_STRING,
} as const;

// =============================================================================
// SECTION C - SHARED OAUTH PRIMITIVES, FULL-FEATURED (former oauth.ts)
// =============================================================================
// Types, base64url utils, platform detection, Gemini header builders, PKCE
// generation, auth URL builder, cross-platform browser opener, manual input
// fallback, multi-path callback server, token exchange / refresh / userinfo.
// v2.1.14 renames: openBrowser -> openBrowserAsync (the bare openBrowser name
// keeps the former auth.ts void implementation in Section D); the private
// escapeHtml helper of the former oauth.ts -> escapeHtmlOauth (the former
// auth.ts escapeHtml stays in Section D).
// =============================================================================

// =============================================================================
// TYPES
// =============================================================================

export interface PKCEPair {
  /** Verifier: random 43-128 char string for the proof */
  verifier: string;
  /** Challenge: BASE64URL(SHA256(verifier)) */
  challenge: string;
  /** Method is always S256 */
  method: "S256";
}

export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  token_type: string;
  expires_in: number;
  scope?: string;
  /** Computed locally */
  expires_at: number;
}

export interface UserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  locale?: string;
  hd?: string;
}

/**
 * Result returned by the local callback server.
 * Ported from oauth(2).ts: captures the granted `scope`.
 */
export interface OAuthCallbackResult {
  code: string;
  state?: string | undefined;
  scope?: string | undefined;
}

/**
 * Complete OAuth flow result (oauth(2).ts shape, used by startOAuthFlow).
 */
export interface OAuthResult {
  tokens: TokenResponse;
  userInfo: UserInfo;
  state: string;
}

export interface OAuthServerResult {
  server: http.Server;
  /** Full callback URL (http://127.0.0.1:PORT/oauth-callback) */
  callbackUrl: string;
  /** Actually bound port */
  port: number;
  /** Promise resolving with the authorization code only */
  waitForCode: () => Promise<string>;
  /**
   * Promise resolving with code + state + captured scope.
   * Ported from oauth(2).ts.
   */
  waitForCallback: () => Promise<OAuthCallbackResult>;
  /** Shuts the server down */
  close: () => Promise<void>;
}

export interface AuthOptions {
  /** When true, does not try to open the browser automatically */
  noBrowser?: boolean;
  /** Timeout waiting for the callback before manual fallback (ms). Default 30000 */
  callbackTimeoutMs?: number;
  /** Custom callback path; default /oauth-callback */
  callbackPath?: string;
  /** Log callback - allows integration with the opencode logger */
  onLog?: (level: "info" | "warn" | "error", msg: string) => void;
  /** OAuth client identity bundle (see antigravity-cli.ts). When provided the
   *  flow uses its clientId/clientSecret/scopes/PKCE policy instead of the
   *  legacy Gemini CLI web-flow defaults. */
  identity?: {
    identity: string;
    clientId: string;
    clientSecret: string;
    scopesStr: string;
    usesPKCE: boolean;
    userAgent?: string;
    appLabel?: string;
  };
}

/**
 * Injectable options for the direct startOAuthFlow orchestrator.
 * Ported from oauth(2).ts: every external dependency can be injected for tests.
 */
export interface StartOAuthFlowOptions {
  /** Callback path - default /callback */
  callbackPath?: string;
  /** Total timeout in ms - default 5 minutes */
  timeoutMs?: number;
  /** Scopes - default GOOGLE_OAUTH_SCOPES */
  scopes?: string;
  /** ClientId - default GEMINI_OAUTH_CLIENT_ID (former oauth.ts CLIENT_ID) */
  clientId?: string;
  /** ClientSecret - default GEMINI_OAUTH_CLIENT_SECRET (former oauth.ts CLIENT_SECRET) */
  clientSecret?: string;
  /** Browser opener function - injectable for tests */
  openBrowserFn?: (url: string) => void;
}

// =============================================================================
// UTILS - BASE64URL & PLATFORM DETECTION
// =============================================================================

/**
 * Encodes Buffer/string to base64url (RFC 7636 - no padding, -_ instead of +/)
 */
function base64urlEncode(input: Buffer | string): string {
  const buf = typeof input === "string" ? Buffer.from(input) : input;
  const b64 = buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_");
  // v2.1.16 security (CodeQL js/polynomial-redos): the former `/=+$/g`
  // trailing-padding strip is quadratic on adversarial input — strip the
  // padding with a linear back-scan over '=' (0x3D) instead.
  let end = b64.length;
  while (end > 0 && b64.charCodeAt(end - 1) === 0x3d) end--;
  return end === b64.length ? b64 : b64.slice(0, end);
}

/**
 * Decodes base64url to Buffer
 */
function base64urlDecode(input: string): Buffer {
  let b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4;
  if (pad) b64 += "=".repeat(4 - pad);
  return Buffer.from(b64, "base64");
}

/**
 * Detects whether running inside WSL
 */
export function isWSL(): boolean {
  try {
    if (process.env.WSL_DISTRO_NAME || process.env.WSLENV) return true;
    // Checks /proc/version for "microsoft" or "WSL" - best effort.
    // Avoids fs import; uses os.release()
    const release = os.release().toLowerCase();
    if (release.includes("microsoft") || release.includes("wsl")) return true;
    return false;
  } catch {
    return false;
  }
}

/**
 * Detects an SSH session (no local display)
 */
export function isSSH(): boolean {
  return !!(process.env.SSH_CLIENT || process.env.SSH_TTY || process.env.SSH_CONNECTION);
}

/**
 * Detects whether a graphical display is available
 */
export function hasDisplay(): boolean {
  if (process.platform === "win32") return true;
  if (process.platform === "darwin") return true;
  // Linux: checks DISPLAY or WAYLAND_DISPLAY
  return !!(process.env.DISPLAY || process.env.WAYLAND_DISPLAY);
}

/**
 * Builds platform-specific User-Agent - Gemini CLI masquerade.
 * Format: GeminiCLI/<version>/<model> (<platform>; <arch>; GitHub) <google-api-client>
 */
// v2.1.15 Phase B: buildGeminiUserAgent moved to fingerprint.js (identity masquerade owner).

/**
 * Returns the required bypass headers object with all identification headers.
 */
export function getGeminiHeaders(): Record<string, string> {
  return {
    "User-Agent": buildGeminiUserAgent(),
    "X-Goog-Api-Client": GEMINI_UA_BASE.xGoogApiClient,
    "Client-Metadata": GEMINI_UA_BASE.clientMetadata,
  };
}

// =============================================================================
// PKCE - RFC 7636
// =============================================================================

/**
 * Generates a PKCE pair (verifier + challenge) per RFC 7636.
 * - verifier: 32 bytes random -> base64url = 43 chars (within 43-128)
 * - challenge: BASE64URL(SHA256(verifier))
 *
 * @returns {PKCEPair} verifier/challenge pair
 * @example
 * const { verifier, challenge } = generatePKCE();
 */
export function generatePKCE(): PKCEPair {
  // 32 bytes = 43 chars base64url, 64 bytes = 86 chars - we pick 64 for extra strength
  const verifierBytes = crypto.randomBytes(64);
  const verifier = base64urlEncode(verifierBytes);
  // Challenge = BASE64URL(SHA256(verifier ASCII))
  const challengeHash = crypto.createHash("sha256").update(verifier).digest();
  const challenge = base64urlEncode(challengeHash);

  return {
    verifier,
    challenge,
    method: "S256",
  };
}

// =============================================================================
// OAUTH URL BUILDER
// =============================================================================

/**
 * Builds the OAuth 2.0 + PKCE authorization URL.
 *
 * @param pkce - Generated PKCE pair
 * @param redirectUri - Redirect URI (e.g. http://127.0.0.1:PORT/oauth-callback)
 * @param opts - Extra options (custom state, login_hint, etc.)
 * @returns Full URL to redirect the user to
 */
export function buildAuthUrl(
  pkce: PKCEPair | null,
  redirectUri: string,
  opts?: {
    state?: string;
    loginHint?: string;
    prompt?: "consent" | "select_account" | "none";
    accessType?: "online" | "offline";
    scopes?: string;
    clientId?: string;
  },
): string {
  const state = opts?.state ?? base64urlEncode(crypto.randomBytes(32));

  const params = new URLSearchParams({
    client_id: opts?.clientId ?? GEMINI_OAUTH_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: opts?.scopes ?? GEMINI_OAUTH_SCOPES.join(" "),
    state,
    access_type: opts?.accessType ?? "offline",
  });

  // PKCE is optional: the Gemini CLI web flow does NOT use it (state-only).
  if (pkce) {
    params.set("code_challenge", pkce.challenge);
    params.set("code_challenge_method", pkce.method);
  }

  // prompt is only sent when explicitly requested (Gemini CLI parity).
  if (opts?.prompt) {
    params.set("prompt", opts.prompt);
  }

  if (opts?.loginHint) {
    params.set("login_hint", opts.loginHint);
  }

  return `${OAUTH_AUTHORIZE_URL}?${params.toString()}`;
}

// =============================================================================
// BROWSER OPENER - CROSS PLATFORM + WSL
// =============================================================================

/**
 * Tries to open the URL in the default browser - cross-platform.
 * Supports: darwin (open), win32 (start via cmd), linux (xdg-open), WSL (wslview/powershell)
 * v2.1.14 rename: openBrowser -> openBrowserAsync (the bare openBrowser name
 * keeps the former auth.ts void implementation, Section D).
 *
 * @param url - URL to open
 * @returns true if the command was spawned, false if it failed
 */
export async function openBrowserAsync(url: string): Promise<boolean> {
  const platform = os.platform();

  const trySpawn = (cmd: string, args: string[], env?: NodeJS.ProcessEnv): Promise<boolean> => {
    return new Promise((resolve) => {
      try {
        const child = spawn(cmd, args, {
          stdio: "ignore",
          detached: true,
          shell: false,
          ...(env ? { env } : {}),
        });
        child.on("error", () => resolve(false));
        child.on("spawn", () => {
          child.unref();
          resolve(true);
        });
        // Fallback if spawn emits nothing within 1s
        setTimeout(() => resolve(true), 1000);
      } catch {
        resolve(false);
      }
    });
  };

  /**
   * v2.1.16 security (CodeQL js/shell-command-constructed-from-input):
   * launches PowerShell to open the URL WITHOUT ever embedding the URL in
   * the command string — the static command reads it back from
   * `$env:MAENE_OPEN_URL`, so no shell metacharacter inside the URL can
   * alter what PowerShell executes. From WSL the variable is forwarded
   * through WSLENV (the `/w` flag marks the WSL -> Win32 direction only);
   * on native win32 the environment passes through directly.
   */
  const tryPowerShellOpen = (fromWSL: boolean): Promise<boolean> => {
    const env: NodeJS.ProcessEnv = { ...process.env, MAENE_OPEN_URL: url };
    if (fromWSL) {
      env.WSLENV = `${env.WSLENV ? `${env.WSLENV}:` : ""}MAENE_OPEN_URL/w`;
    }
    return trySpawn("powershell.exe", ["-NoProfile", "-Command", "Start-Process -FilePath $env:MAENE_OPEN_URL"], env);
  };

  // WSL: tries wslview first, then powershell.exe start
  if (isWSL()) {
    // wslview (wslu)
    if (await trySpawn("wslview", [url])) return true;
    // powershell.exe — URL travels through the environment, never the command
    if (await tryPowerShellOpen(true)) return true;
  }

  if (platform === "darwin") {
    return trySpawn("open", [url]);
  }

  if (platform === "win32") {
    // rundll32 bypasses cmd.exe parsing entirely - "&" inside the URL survives.
    if (await trySpawn("rundll32", ["url.dll,FileProtocolHandler", url])) return true;
    // Fallback: PowerShell with the URL forwarded through the environment
    // (the former `cmd /c start "<url>"` form embedded the URL in the
    // command line — flagged as shell-command-constructed-from-input).
    if (await tryPowerShellOpen(false)) return true;
    return false;
  }

  // Linux / fallback: xdg-open
  if (await trySpawn("xdg-open", [url])) return true;
  // Additional Linux attempts
  if (await trySpawn("gio", ["open", url])) return true;
  if (await trySpawn("gnome-open", [url])) return true;
  if (await trySpawn("kde-open", [url])) return true;

  return false;
}

// =============================================================================
// MANUAL INPUT FALLBACK
// =============================================================================

/**
 * Asks the user for manual input via stdin.
 * Supports pasting the full URL or just the code.
 *
 * @param promptMsg - Message displayed
 * @returns extracted code
 */
function askManualInput(promptMsg: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(promptMsg, (answer) => {
      rl.close();
      const trimmed = answer.trim();
      if (!trimmed) {
        reject(new Error("Empty input received. Authentication cancelled."));
        return;
      }

      // User may paste the full URL - extract the 'code' param
      try {
        if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
          const parsed = new URL(trimmed);
          const codeFromUrl = parsed.searchParams.get("code");
          if (codeFromUrl) {
            resolve(codeFromUrl);
            return;
          }
          // If the URL contains a fragment (#), try extracting from it too
          if (parsed.hash) {
            const hashParams = new URLSearchParams(parsed.hash.replace(/^#/, ""));
            const codeFromHash = hashParams.get("code");
            if (codeFromHash) {
              resolve(codeFromHash);
              return;
            }
          }
        }
      } catch {
        // Not a valid URL - treat as direct code
      }

      // Treat as direct code (may contain pasted "code=XXXX")
      const match = trimmed.match(/(?:code=)?([A-Za-z0-9\-_]+)/);
      if (match) {
        // If the input was "code=XYZ", take XYZ; if it was just XYZ, take the match
        const maybeCode = trimmed.includes("code=") ? match[1]! : trimmed.split(/[&\s]/)[0]!;
        resolve(maybeCode.trim());
      } else {
        resolve(trimmed);
      }
    });

    // Handle Ctrl+C
    rl.on("SIGINT", () => {
      rl.close();
      reject(new Error("Authentication interrupted by the user (SIGINT)"));
    });
  });
}

// =============================================================================
// OAUTH LOCAL SERVER
// =============================================================================

/**
 * Creates a local HTTP server on 127.0.0.1:0 (random port) to receive the OAuth callback.
 *
 * Multi-path support (ported from oauth(2).ts): accepts the configured
 * callbackPath, plus /oauth/callback, plus "/" when the request carries code /
 * error query parameters. A bare "/" GET without OAuth params still serves the
 * healthcheck info text (conflict resolved in favor of both behaviors).
 *
 * Validates state if provided, extracts code and the granted `scope`.
 *
 * @param options - options: callbackPath, timeout, logger
 * @returns OAuthServerResult with server, callbackUrl, waitForCode, waitForCallback, close
 */
export function createOAuthServer(options?: {
  callbackPath?: string;
  onLog?: AuthOptions["onLog"];
  expectedState?: string;
}): OAuthServerResult {
  const callbackPath = options?.callbackPath ?? "/oauth2callback";
  const onLog = options?.onLog ?? (() => {});
  const expectedState = options?.expectedState;

  let resolveCb!: (result: OAuthCallbackResult) => void;
  let rejectCode!: (err: Error) => void;
  let codeSettled = false;

  const callbackPromise = new Promise<OAuthCallbackResult>((resolve, reject) => {
    resolveCb = (r: OAuthCallbackResult) => {
      if (!codeSettled) {
        codeSettled = true;
        resolve(r);
      }
    };
    rejectCode = (e: Error) => {
      if (!codeSettled) {
        codeSettled = true;
        reject(e);
      }
    };
  });

  const server = http.createServer((req, res) => {
    try {
      onLog("info", `[callback-server] ${req.method} ${req.url}`);
      const rawUrl = req.url ?? "/";
      const isCallback = rawUrl.indexOf(callbackPath) !== -1 || rawUrl.indexOf("/oauth2callback") !== -1;
      if (!isCallback) {
        res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("maene OAuth callback server running. Awaiting " + callbackPath);
        return;
      }
      const qs = new url.URL(rawUrl, "http://127.0.0.1:3000").searchParams;
      const code = qs.get("code");
      const state = qs.get("state") ?? undefined;
      const scope = qs.get("scope") ?? undefined;
      const error = qs.get("error");
      const errorDesc = qs.get("error_description");
      if (error) {
        onLog("error", `OAuth callback returned error: ${error} - ${errorDesc ?? ""}`);
        res.writeHead(HTTP_REDIRECT, { Location: SIGN_IN_FAILURE_URL });
        res.end();
        rejectCode(new Error(`Google OAuth error: ${error}. ${errorDesc ?? "No additional details"}`));
        try {
          (server as any).close?.();
        } catch {}
        return;
      }
      if (!code) {
        onLog("warn", "Callback hit without code - still waiting for real redirect.");
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(
          `<!doctype html><html><head><meta charset="utf-8"/><title>maene</title></head><body style="font-family:system-ui;background:#0a2a12;color:#e5e7eb;display:flex;align-items:center;justify-content:center;min-height:100vh"><div style="text-align:center"><h1>Waiting for authorization...</h1><p>Complete the login in the Google window.</p><p>Return to the terminal and try again.<br/>maene \u2022 Gemini CLI bypass</p></div></body></html>`,
        );
        return;
      }
      if (expectedState && state !== expectedState) {
        onLog("error", `State mismatch. Expected ${expectedState}, received ${state}`);
        res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("State mismatch. Possible CSRF attack");
        rejectCode(new Error(`OAuth state mismatch. Possible CSRF attack or browser session issue.`));
        try {
          (server as any).close?.();
        } catch {}
        return;
      }
      onLog("info", `Authorization code received (${code.substring(0, 10)}...)`);
      res.writeHead(HTTP_REDIRECT, { Location: SIGN_IN_SUCCESS_URL });
      res.end();
      resolveCb({ code, state, scope });
      try {
        (server as any).close?.();
      } catch {}
    } catch (err) {
      onLog("error", `Error in OAuth server handler: ${(err as Error).message}`);
      try {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal server error");
      } catch {}
      rejectCode(err as Error);
      try {
        (server as any).close?.();
      } catch {}
    }
  });

  server.on("error", (err) => {
    onLog("error", `OAuth server error: ${err.message}`);
    rejectCode(err);
  });

  let callbackUrl = "";
  let port = 0;

  const envPort = Number(process.env.OAUTH_CALLBACK_PORT ?? "");
  const preferredPort = Number.isFinite(envPort) && envPort > 0 ? envPort : 0;

  const listeningPromise = new Promise<{ port: number; url: string }>((resolve, reject) => {
    const host = process.env.OAUTH_CALLBACK_HOST ?? "127.0.0.1";
    server.listen(preferredPort, host, () => {
      const addr = server.address();
      if (addr && typeof addr === "object") {
        port = addr.port;
        callbackUrl = `http://127.0.0.1:${port}${callbackPath}`;
        resolve({ port, url: callbackUrl });
      } else {
        reject(new Error("Failed to obtain OAuth server address"));
      }
    });
    server.on("error", reject);
  });

  return {
    server,
    get callbackUrl() {
      return callbackUrl;
    },
    get port() {
      return port;
    },
    waitForCode: async () => {
      if (!callbackUrl) {
        await listeningPromise;
      }
      return (await callbackPromise).code;
    },
    waitForCallback: async () => {
      if (!callbackUrl) {
        await listeningPromise;
      }
      return callbackPromise;
    },
    close: async () => {
      return new Promise<void>((resolve) => {
        server.close(() => resolve());
        setTimeout(() => {
          try {
            server.closeAllConnections?.();
          } catch {}
          resolve();
        }, 1000);
      });
    },
  };
}

/**
 * Async helper version that already waits for the server to be listening and returns full info
 */
export async function createOAuthServerAsync(opts?: {
  callbackPath?: string;
  onLog?: AuthOptions["onLog"];
  expectedState?: string;
}): Promise<OAuthServerResult & { ready: true }> {
  const srv = createOAuthServer(opts);
  // Force listening
  await new Promise<void>((resolve, reject) => {
    // If already listening, server.address() already has the port; but we wait for a tick
    if (srv.port !== 0) {
      resolve();
      return;
    }
    srv.server.once("listening", () => resolve());
    srv.server.once("error", reject);
    // Edge case where listen was already called but the callback has not run yet
    setTimeout(() => {
      if (srv.port !== 0) resolve();
    }, 50);
  });

  return { ...srv, ready: true as const };
}

// v2.1.16 dead-code cleanup: getHtmlResponse + escapeHtmlOauth (the polished
// callback HTML twins of the live inline responses inside createOAuthServer)
// were fully dead — zero callers repo-wide — and were deleted.

// =============================================================================
// TOKEN EXCHANGE & REFRESH
// =============================================================================

/**
 * Exchanges the authorization code for tokens (access_token + refresh_token).
 * POST https://oauth2.googleapis.com/token
 *
 * Robust error wrapping ported from oauth(2).ts: network failures are wrapped
 * with `cause`, non-JSON bodies are rejected with a status + body snippet, and
 * a missing access_token is an explicit error.
 *
 * @param code - Received authorization code
 * @param codeVerifier - Original PKCE verifier
 * @param redirectUri - Same redirect_uri used in buildAuthUrl
 * @param options - Optional injected credentials (defaults to GEMINI_OAUTH_CLIENT_ID / GEMINI_OAUTH_CLIENT_SECRET)
 * @returns TokenResponse with computed expires_at
 */
export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string | null,
  redirectUri: string,
  options?: { clientId?: string; clientSecret?: string },
): Promise<TokenResponse> {
  const clientId = options?.clientId ?? GEMINI_OAUTH_CLIENT_ID;
  const clientSecret = options?.clientSecret ?? GEMINI_OAUTH_CLIENT_SECRET;

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
  });

  // Only sent when PKCE was used in the authorization request.
  if (codeVerifier) {
    body.set("code_verifier", codeVerifier);
  }

  let res: Response;
  try {
    res = await fetch(OAUTH_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        ...getGeminiHeaders(),
      },
      body: body.toString(),
    });
  } catch (err) {
    throw new Error(`Network failure while exchanging code for tokens: ${(err as Error).message}`, {
      cause: err,
    });
  }

  const text = await res.text().catch(() => "");
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Non-JSON token response (${res.status}): ${text.slice(0, 500)}`);
  }

  if (!res.ok) {
    const detail = json?.error_description ?? json?.error ?? text;
    throw new Error(`exchangeCodeForTokens failed (${res.status}): ${detail || res.statusText}`);
  }

  if (!json?.access_token) {
    throw new Error(`Token response without access_token: ${text.slice(0, 500)}`);
  }

  return {
    ...json,
    expires_at: Date.now() + json.expires_in * 1000,
  };
}

/**
 * Renews the access_token using a refresh_token.
 *
 * invalid_grant handling ported from oauth(2).ts: when Google answers with
 * error=invalid_grant an explicit "re-authentication necessary" error is
 * raised so callers can trigger a fresh login instead of retrying blindly.
 *
 * @param refreshToken - Valid refresh token
 * @param options - Optional injected credentials (defaults to GEMINI_OAUTH_CLIENT_ID / GEMINI_OAUTH_CLIENT_SECRET)
 * @returns New TokenResponse (may contain a rotated refresh_token; the previous
 *          one is preserved when Google omits it)
 */
export async function refreshAccessToken(
  refreshToken: string,
  options?: { clientId?: string; clientSecret?: string },
): Promise<TokenResponse> {
  const clientId = options?.clientId ?? GEMINI_OAUTH_CLIENT_ID;
  const clientSecret = options?.clientSecret ?? GEMINI_OAUTH_CLIENT_SECRET;

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  let res: Response;
  try {
    res = await fetch(OAUTH_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        ...getGeminiHeaders(),
      },
      body: body.toString(),
    });
  } catch (err) {
    throw new Error(`Network failure while refreshing token: ${(err as Error).message}`, {
      cause: err,
    });
  }

  const text = await res.text().catch(() => "");
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Non-JSON refresh response (${res.status}): ${text.slice(0, 500)}`);
  }

  if (!res.ok) {
    const detail = json?.error_description ?? json?.error ?? text;
    // Specific handling for expired refresh tokens - instruct re-login
    if (json?.error === "invalid_grant") {
      throw new Error(`Refresh token invalid/expired - re-authentication necessary: ${detail}`);
    }
    throw new Error(`refreshAccessToken failed (${res.status}): ${detail || res.statusText}`);
  }

  // Google often does NOT return a new refresh_token on refresh - keep the original
  return {
    ...(json as Omit<TokenResponse, "expires_at">),
    refresh_token: (json as any).refresh_token ?? refreshToken,
    expires_at: Date.now() + (json.expires_in as number) * 1000,
  };
}

/**
 * Helper ported from oauth(2).ts: refreshes tokens while preserving the old
 * refresh_token when Google omits a new one. Library-first pattern.
 *
 * @param oldTokens - Previously stored TokenResponse containing a refresh_token
 * @returns Refreshed TokenResponse guaranteed to carry a usable refresh_token
 */
export async function refreshAndPreserve(oldTokens: TokenResponse): Promise<TokenResponse> {
  if (!oldTokens.refresh_token) {
    throw new Error("Previous token has no refresh_token - a new login is required");
  }
  const refreshed = await refreshAccessToken(oldTokens.refresh_token);
  return {
    ...refreshed,
    // Preserve the original refresh_token if the endpoint did not return a new one (Google behavior)
    refresh_token: refreshed.refresh_token ?? oldTokens.refresh_token,
  };
}

/**
 * Checks whether a token is expired or about to expire (60s buffer)
 */
export function isTokenExpired(token: TokenResponse, bufferMs = 60_000): boolean {
  return Date.now() + bufferMs >= token.expires_at;
}

// =============================================================================
// USERINFO
// =============================================================================

/**
 * Retrieves information about the authenticated user.
 * GET https://www.googleapis.com/oauth2/v2/userinfo
 *
 * Robust error wrapping ported from oauth(2).ts: network failures wrapped with
 * `cause`; non-JSON bodies rejected with a status + body snippet.
 *
 * @param accessToken - Valid access token
 * @returns Normalized UserInfo
 */
export async function getUserInfo(accessToken: string): Promise<UserInfo> {
  let res: Response;
  try {
    res = await fetch(USERINFO_URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...getGeminiHeaders(),
        Accept: "application/json",
      },
    });
  } catch (err) {
    throw new Error(`Network failure while fetching userinfo: ${(err as Error).message}`, {
      cause: err,
    });
  }

  const text = await res.text().catch(() => "");
  let data: UserInfo;
  try {
    data = JSON.parse(text) as UserInfo;
  } catch {
    throw new Error(`Non-JSON userinfo response (${res.status}): ${text.slice(0, 500)}`);
  }

  if (!res.ok) {
    throw new Error(
      `getUserInfo failed (${res.status}): ${(data as any)?.error_description ?? (data as any)?.error ?? (text || res.statusText)}`,
    );
  }

  if (!data.email) {
    throw new Error("getUserInfo: response without e-mail - missing userinfo.email scope?");
  }
  return data;
}

// =============================================================================
// SECTION D - MINIMAL LEGACY FLOW + ACCOUNT MANAGER + PROJECT/QUOTA HELPERS
// (original auth.ts content, kept exactly as it was; runtime-used)
// =============================================================================
// v2.1.14: CLIENT_ID / CLIENT_SECRET moved to Section A (they are the canonical
// Antigravity CLI definitions); USERINFO_URL collapsed into the Section B
// declaration (byte-identical value in both former files).
// =============================================================================

// =============================================================================
// v2.1.16 dead-code cleanup of Section D: the minimal legacy OAuth flow
// (genVerifier/genChallenge/genState/cbres/escapeHtml/cbServer/openBrowser/
// AUTH_URL/TOKEN_URL/SCOPES/exchangeCode/userInfo/startOAuth) was a dead twin
// of the live Section C primitives (generatePKCE, createOAuthServer,
// openBrowserAsync, exchangeCodeForTokens, getUserInfo, startOAuthFlow) —
// zero callers repo-wide and in tests. Only the LIVE pieces remain below:
// fetchTimeout (now delegating to core.js), refreshToken (the minimal
// Antigravity-client refresh used by the plugin runtime) and the v3 account
// manager. The token/userinfo URLs come from constants.js (single owner).
// =============================================================================

/** v2.1.16 single-owner fix: delegation to core.js fetchWithTimeout (was a private re-implementation). */
export const fetchTimeout = async (url: string, init: RequestInit, ms = 10000): Promise<Response> =>
  fetchWithTimeout(url, init, ms);

/** Minimal token-response shape of the Antigravity-client refresh flow (Section D lineage). */
export type tokenres = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  id_token?: string;
  created_at?: number;
};

export const refreshToken = async (rt: string): Promise<tokenres> => {
  const b = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    refresh_token: rt,
    grant_type: "refresh_token",
  });
  const r = await fetchTimeout(OAUTH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": ua() },
    body: b.toString(),
  });
  if (!r.ok) throw new Error(await r.text());
  const j = (await r.json()) as tokenres;
  j.created_at = Date.now();
  return j;
};
// v2.1.15 Phase C: cfgDir moved to config.js (configuration owner).
export const accountsPath = (): string => join(cfgDir(), "antigravity-accounts.json");
// v2.1.15 Phase C: atomicWrite moved to config.js (configuration owner).
// v3 accounts format definitive from researches: version 3, accounts array, activeIndex, activeIndexByFamily, rateLimitResetTimes, addedAt, lastUsed, createdAt, expiry, projectId, managedProjectId
export type accountEntry = {
  email: string;
  refreshToken: string;
  accessToken?: string;
  expiry?: number; // ms timestamp expiration
  createdAt?: number; // ms timestamp creation
  addedAt: number; // ms timestamp added (original repo uses addedAt)
  lastUsed?: number; // ms timestamp last used
  projectId?: string;
  managedProjectId?: string;
  disabled?: boolean;
  quotaExhaustedUntil?: number;
  softQuotaUntil?: number;
  remaining?: number;
  limit?: number;
  rateLimitResetTimes?: Record<string, number>; // model -> reset timestamp ms
};
export type accountsFile = {
  version: 3;
  accounts: accountEntry[];
  activeIndex: number;
  activeIndexByFamily: { claude: number; gemini: number; [k: string]: number };
};
export class accountManager {
  private data: accountsFile = {
    version: 3,
    accounts: [],
    activeIndex: 0,
    activeIndexByFamily: { claude: 0, gemini: 0 },
  };
  private locks = new Map<string, Promise<accountEntry>>();
  private idx = 0;
  private sticky: string | null = null;
  async load(): Promise<void> {
    try {
      const p = accountsPath();
      if (!existsSync(p)) {
        this.data = { version: 3, accounts: [], activeIndex: 0, activeIndexByFamily: { claude: 0, gemini: 0 } };
        return;
      }
      const raw = readFileSync(p, "utf8");
      const j = JSON.parse(raw);
      if (Array.isArray(j)) {
        // legacy v1 array format -> migrate to v3
        this.data = {
          version: 3,
          accounts: j.map((a: any) => ({
            email: a.email,
            refreshToken: a.refresh_token || a.refreshToken,
            accessToken: a.access_token || a.accessToken,
            expiry: a.expiry,
            createdAt: a.created_at || a.createdAt || Date.now(),
            addedAt: a.addedAt || Date.now(),
            lastUsed: a.lastUsed,
            projectId: a.projectId,
            managedProjectId: a.managedProjectId,
            disabled: a.disabled,
            rateLimitResetTimes: a.rateLimitResetTimes || {},
          })),
          activeIndex: 0,
          activeIndexByFamily: { claude: 0, gemini: 0 },
        };
      } else if (j.version === 3 && Array.isArray(j.accounts)) {
        this.data = j as accountsFile;
        // ensure addedAt, createdAt
        this.data.accounts = this.data.accounts.map((a) => ({
          rateLimitResetTimes: {},
          ...a,
          addedAt: a.addedAt || a.createdAt || Date.now(),
          createdAt: a.createdAt || a.addedAt || Date.now(),
        }));
      } else if (j.accounts && Array.isArray(j.accounts)) {
        this.data = {
          version: 3,
          accounts: j.accounts.map((a: any) => ({
            email: a.email,
            refreshToken: a.refreshToken || a.refresh_token,
            accessToken: a.accessToken,
            expiry: a.expiry,
            createdAt: a.createdAt || Date.now(),
            addedAt: a.addedAt || Date.now(),
            lastUsed: a.lastUsed,
            projectId: a.projectId,
            managedProjectId: a.managedProjectId,
            disabled: a.disabled,
            rateLimitResetTimes: a.rateLimitResetTimes || {},
          })),
          activeIndex: j.activeIndex || 0,
          activeIndexByFamily: j.activeIndexByFamily || { claude: 0, gemini: 0 },
        };
      } else {
        this.data = { version: 3, accounts: [], activeIndex: 0, activeIndexByFamily: { claude: 0, gemini: 0 } };
      }
    } catch {
      this.data = { version: 3, accounts: [], activeIndex: 0, activeIndexByFamily: { claude: 0, gemini: 0 } };
    }
  }
  async save(): Promise<void> {
    atomicWrite(accountsPath(), JSON.stringify(this.data, null, 2));
  }
  list(): accountEntry[] {
    return this.data.accounts;
  }
  getFile(): accountsFile {
    return this.data;
  }
  async add(a: Omit<accountEntry, "addedAt" | "createdAt"> & { addedAt?: number; createdAt?: number }): Promise<void> {
    const now = Date.now();
    const entry: accountEntry = {
      ...a,
      addedAt: a.addedAt || now,
      createdAt: a.createdAt || now,
      lastUsed: now,
      rateLimitResetTimes: a.rateLimitResetTimes || {},
    };
    this.data.accounts = this.data.accounts.filter((x) => x.email !== a.email);
    this.data.accounts.push(entry);
    if (this.data.activeIndex >= this.data.accounts.length) this.data.activeIndex = 0;
    await this.save();
  }
  async remove(email: string): Promise<void> {
    this.data.accounts = this.data.accounts.filter((x) => x.email !== email);
    if (this.data.activeIndex >= this.data.accounts.length) this.data.activeIndex = 0;
    await this.save();
  }
  async enable(email: string, en = true): Promise<void> {
    const a = this.data.accounts.find((x) => x.email === email);
    if (a) {
      a.disabled = !en;
      await this.save();
    }
  }
  // robin hood with activeIndex + sticky + soft quota + rateLimitResetTimes
  getNext(strategy: "round-robin" | "sticky" = "round-robin", softThreshold = 90): accountEntry | null {
    const now = Date.now();
    const active = this.data.accounts.filter(
      (a) =>
        !a.disabled &&
        (!a.quotaExhaustedUntil || now > a.quotaExhaustedUntil) &&
        (!a.softQuotaUntil || now > a.softQuotaUntil),
    );
    if (active.length === 0) return null;
    // filter rateLimitResetTimes
    const notRateLimited = active.filter((a) => {
      if (!a.rateLimitResetTimes) return true;
      const resets = Object.values(a.rateLimitResetTimes);
      return resets.every((ts) => now > ts);
    });
    const pool = notRateLimited.length > 0 ? notRateLimited : active;
    // soft quota
    const filtered = pool.filter((a) => {
      if (!a.remaining || !a.limit) return true;
      const usedPct = ((a.limit - a.remaining) / a.limit) * 100;
      return usedPct < softThreshold;
    });
    const finalPool = filtered.length > 0 ? filtered : pool;
    if (strategy === "sticky" && this.sticky) {
      const f = finalPool.find((a) => a.email === this.sticky);
      if (f) {
        this.data.activeIndex = finalPool.indexOf(f);
        return f;
      }
    }
    const acc = finalPool[this.idx % finalPool.length]!;
    this.idx = (this.idx + 1) % finalPool.length;
    this.data.activeIndex = this.data.accounts.indexOf(acc);
    this.sticky = acc.email;
    // update family index
    if (acc.email.toLowerCase().includes("claude") || true) {
      /* generic */
    }
    return acc;
  }
  setRateLimit(email: string, modelKey: string, resetMs: number): void {
    const a = this.data.accounts.find((x) => x.email === email);
    if (a) {
      if (!a.rateLimitResetTimes) a.rateLimitResetTimes = {};
      a.rateLimitResetTimes[modelKey] = Date.now() + resetMs;
      this.save().catch(() => {});
    }
  }
  markExhausted(email: string, ms = 3600000): void {
    const a = this.data.accounts.find((x) => x.email === email);
    if (a) {
      a.quotaExhaustedUntil = Date.now() + ms;
      this.save().catch(() => {});
    }
  }
  markSoftQuota(email: string, ms = 900000): void {
    const a = this.data.accounts.find((x) => x.email === email);
    if (a) {
      a.softQuotaUntil = Date.now() + ms;
      this.save().catch(() => {});
    }
  }
  async refreshIfNeeded(email: string): Promise<string> {
    const acc = this.data.accounts.find((a) => a.email === email);
    if (!acc) throw new Error("not found");
    if (acc.accessToken && acc.expiry && Date.now() < acc.expiry - 300000) return acc.accessToken;
    if (this.locks.has(email)) return (await this.locks.get(email)!)!.accessToken!;
    const p = (async () => {
      const t = await refreshToken(acc.refreshToken);
      acc.accessToken = t.access_token;
      acc.expiry = Date.now() + (t.expires_in ?? 3600) * 1000;
      acc.createdAt = Date.now();
      acc.lastUsed = Date.now();
      await this.save();
      return acc;
    })();
    this.locks.set(email, p);
    try {
      const r = await p;
      return r.accessToken!;
    } finally {
      this.locks.delete(email);
    }
  }
  async importManager(): Promise<number> {
    const cands = [
      join(homedir(), ".config", "antigravity-manager", "accounts.json"),
      join(homedir(), ".antigravity-manager", "accounts.json"),
    ];
    let add = 0;
    for (const c of cands) {
      try {
        if (!existsSync(c)) continue;
        const raw = readFileSync(c, "utf8");
        const j = JSON.parse(raw);
        const arr = Array.isArray(j) ? j : j.accounts || [];
        for (const x of arr) {
          const email = x.email;
          const rt = x.refresh_token || x.refreshToken;
          if (email && rt && !this.data.accounts.find((a) => a.email === email)) {
            this.data.accounts.push({
              email,
              refreshToken: rt,
              addedAt: Date.now(),
              createdAt: Date.now(),
              lastUsed: Date.now(),
              rateLimitResetTimes: {},
            });
            add++;
          }
        }
      } catch {}
    }
    if (add > 0) await this.save();
    return add;
  }
}
// v2.1.15 Phase C: the ordered quota-cascade host array (daily, autopush,
// prod) is derived from the constants.js ENDPOINTS host map — the raw values
// have one owner; the cascade order is auth-flow-local.
const QUOTA_CASCADE_HOSTS = [
  "https://daily-cloudcode-pa.googleapis.com",
  "https://autopush-cloudcode-pa.sandbox.googleapis.com",
  "https://cloudcode-pa.googleapis.com",
] as const;
// v2.1.15 Phase B: PROJECT_FALLBACK alias deleted; constants.js PROJECT_FALLBACK is the owner.
// v2.1.15 Phase B: isRetryable moved to core.js (generic utility owner).
// v2.1.15 Phase A: the auth-local project-discovery helpers (loadCodeAssist,
// loadCodeAssistGeminiCLI, onboardUser, resolveProjectId) were dead legacy
// duplicates of the canonical project.ts implementations and were deleted.
// Project discovery lives ONLY in project.ts.
export const retrieveQuota = async (
  at: string,
  pid = PROJECT_FALLBACK,
): Promise<{ remaining: number; limit: number; used: number } | null> => {
  for (const base of QUOTA_CASCADE_HOSTS) {
    try {
      const r = await fetchTimeout(
        `${base}/v1internal:retrieveUserQuotaSummary`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${at}`,
            "Content-Type": "application/json",
            "User-Agent": ua(),
            "X-Goog-Api-Client": apiClient(),
          },
          body: JSON.stringify({ project: `projects/${pid}` }),
        },
        15000,
      );
      if (!r.ok) {
        if (isRetryable(r.status)) continue;
        return null;
      }
      const j: any = await r.json();
      return {
        remaining: Number(j.remainingQuota ?? j.remaining ?? 100),
        limit: Number(j.limit ?? 1000),
        used: Number(j.used ?? 0),
      };
    } catch {
      continue;
    }
  }
  return null;
};
/**
 * @section Model Group Classification
 * Ported from auth(1).ts v4: classifies a model identifier into its routing group.
 * "gemini-cli" when the model contains "preview" or starts with a gemini-3.x
 * prefix (3, 3.1, 3.5, 3.6, 3.7); otherwise "antigravity".
 */
// v2.1.15 Phase A: mapModelToGroup moved to models.ts (canonical merged
// implementation of the auth.ts and plugin.ts variants) — re-exported here.
export { mapModelToGroup } from "./models.js";
// v2.1.16 dead-code cleanup: the Section D startOAuth orchestrator (dead twin
// of the live authenticate/startOAuthFlow Section E flow) was deleted here.

// =============================================================================
// SECTION E - ORCHESTRATORS + VALIDATION + MODEL HELPERS (former oauth.ts)
// =============================================================================

// =============================================================================
// COMPLETE ORCHESTRATOR - AUTHENTICATE (full featured)
// =============================================================================

/**
 * Full OAuth flow: PKCE + Server + Browser + Exchange + UserInfo.
 * Supports:
 * - WSL/SSH detection -> does not try to open a browser when there is no DISPLAY
 * - --no-browser flag via AuthOptions.noBrowser or env OPENCODE_NO_BROWSER=1 or args
 * - 30s timeout fallback to manual URL/code input
 *
 * @param opts - AuthOptions
 * @returns object with tokens and userinfo
 */
export async function authenticate(
  opts: AuthOptions & {
    existingPKCE?: PKCEPair;
  } = {},
): Promise<{
  tokens: TokenResponse;
  userInfo: UserInfo;
  pkce: PKCEPair | null;
  callbackUrl: string;
}> {
  const log =
    opts.onLog ??
    ((level, msg) => {
      const prefix = level === "error" ? "[maene][ERR]" : level === "warn" ? "[maene][WARN]" : "[maene]";
      console.log(`${prefix} ${msg}`);
    });

  const callbackPath = opts.callbackPath ?? "/oauth2callback";
  const timeoutMs = opts.callbackTimeoutMs ?? 5 * 60 * 1000;

  const noBrowserFlag =
    opts.noBrowser ||
    process.env.OPENCODE_NO_BROWSER === "1" ||
    process.argv.includes("--no-browser") ||
    process.env.NO_BROWSER === "1";

  const pkce = opts.existingPKCE ?? (opts.identity?.usesPKCE ? generatePKCE() : null);
  const state = crypto.randomBytes(32).toString("hex");

  const port = await getAvailablePort();
  const redirectUri = `http://127.0.0.1:${port}${callbackPath}`;
  log(
    "info",
    `Starting local OAuth server on 127.0.0.1:${port}${process.env.OAUTH_CALLBACK_HOST ? " (custom OAUTH_CALLBACK_HOST)" : ""} ...`,
  );
  log("info", `Callback URL: ${redirectUri}`);

  let oauthSrv: OAuthServerResult | null = null;
  if (process.env.OAUTH_CALLBACK_PORT) {
    oauthSrv = createOAuthServer({ callbackPath, onLog: log, expectedState: state });
    let attempts = 0;
    while (oauthSrv.port === 0 && attempts < 50) {
      await new Promise((r) => setTimeout(r, 20));
      attempts++;
    }
    if (oauthSrv.port === 0)
      await new Promise<void>((resolve, reject) => {
        oauthSrv!.server.once("listening", resolve);
        oauthSrv!.server.once("error", reject);
      });
  } else {
    const prev = process.env.OAUTH_CALLBACK_PORT;
    process.env.OAUTH_CALLBACK_PORT = String(port);
    oauthSrv = createOAuthServer({ callbackPath, onLog: log, expectedState: state });
    let attempts = 0;
    while (oauthSrv.port === 0 && attempts < 50) {
      await new Promise((r) => setTimeout(r, 20));
      attempts++;
    }
    if (oauthSrv.port === 0)
      await new Promise<void>((resolve, reject) => {
        oauthSrv!.server.once("listening", resolve);
        oauthSrv!.server.once("error", reject);
      });
    if (prev === undefined) delete (process.env as any).OAUTH_CALLBACK_PORT;
    else process.env.OAUTH_CALLBACK_PORT = prev;
  }

  const authUrl = buildAuthUrl(pkce, redirectUri, {
    state,
    accessType: "offline",
    scopes: opts.identity?.scopesStr ?? GEMINI_CLI_OAUTH_SCOPE_STR,
    ...(opts.identity?.clientId ? { clientId: opts.identity.clientId } : {}),
    ...(opts.identity?.usesPKCE ? { prompt: "consent" as const } : {}),
  });

  let browserOpened = false;
  const shouldAttemptBrowser = (!noBrowserFlag && hasDisplay() && !isSSH()) || (isWSL() && !noBrowserFlag);

  if (shouldAttemptBrowser) {
    log("info", "Trying to open the default browser...");
    try {
      browserOpened = await openBrowserAsync(authUrl);
      if (browserOpened) log("info", "Browser opened. Waiting for authorization in the browser...");
      else log("warn", "Could not open the browser automatically.");
    } catch (e) {
      log("warn", `openBrowser failed: ${(e as Error).message}`);
    }
  } else {
    if (noBrowserFlag) log("info", "--no-browser flag detected. Skipping automatic opening.");
    else if (isSSH()) log("info", "SSH session detected - no local display.");
    else if (!hasDisplay()) log("info", "No display detected (DISPLAY/WAYLAND_DISPLAY missing).");
  }

  if (!browserOpened) {
    log("info", "Open the URL below manually in the browser:\n\n" + authUrl + "\n");
    console.log("\n\x1b[1m\x1b[36mTo authenticate, open this URL in your browser:\x1b[0m\n");
    console.log(`\x1b[4m${authUrl}\x1b[0m\n`);
  } else {
    console.log(`\nAttempting to open authentication page in your browser.\nOtherwise navigate to:\n\n${authUrl}\n\n`);
  }

  let code: string;
  try {
    const codePromise = oauthSrv!.waitForCode();
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("TIMEOUT")), timeoutMs);
    });
    let sigIntHandler: (() => void) | undefined;
    let stdinHandler: ((data: Buffer) => void) | undefined;
    const cancellationPromise = new Promise<never>((_, reject) => {
      sigIntHandler = () => reject(new Error("Authentication cancelled by user (SIGINT)"));
      process.on("SIGINT", sigIntHandler);
      stdinHandler = (data: Buffer) => {
        if (data.length === 1 && data[0] === 0x03) reject(new Error("Authentication cancelled by user (Ctrl+C)"));
      };
      try {
        process.stdin.on("data", stdinHandler);
      } catch {}
    });
    try {
      code = await Promise.race([codePromise, timeoutPromise, cancellationPromise]);
    } catch (err) {
      if ((err as Error).message === "TIMEOUT") {
        log("warn", `${timeoutMs / 1000}s timeout waiting for callback - falling back to manual input.`);
        console.log("\n\x1b[33mTimeout waiting for automatic callback.\x1b[0m");
        console.log("Paste below the full URL the browser redirected to (with ?code=) or just the code:\n");
        try {
          code = await askManualInput("Callback code/URL: ");
          log("info", "Code received via manual input.");
        } catch (inputErr) {
          await oauthSrv!.close().catch(() => {});
          throw inputErr;
        }
      } else {
        throw err;
      }
    } finally {
      if (sigIntHandler)
        try {
          process.removeListener("SIGINT", sigIntHandler);
        } catch {}
      if (stdinHandler)
        try {
          process.stdin.removeListener("data", stdinHandler);
        } catch {}
    }
  } finally {
    await oauthSrv!.close().catch(() => {});
  }

  log("info", `Code obtained. Exchanging for tokens at ${OAUTH_TOKEN_URL}...`);
  const tokens = await exchangeCodeForTokens(code, pkce?.verifier ?? null, redirectUri, {
    ...(opts.identity ? { clientId: opts.identity.clientId, clientSecret: opts.identity.clientSecret } : {}),
  });
  log("info", `Tokens obtained. Expires in ${tokens.expires_in}s`);
  log("info", "Fetching user information...");
  const userInfo = await getUserInfo(tokens.access_token);
  log("info", `Authenticated as ${userInfo.email} (${userInfo.name})`);
  return { tokens, userInfo, pkce, callbackUrl: redirectUri };
}

// =============================================================================
// DIRECT ORCHESTRATOR - START OAUTH FLOW (injectable, ported from oauth(2).ts)
// =============================================================================

/**
 * Direct PKCE orchestrator ported from oauth(2).ts and adapted onto the local
 * server infrastructure above (single server implementation, multi-path
 * callback, scope capture, CSRF state validation).
 *
 * Steps:
 * 1. generatePKCE (verifier + S256 challenge)
 * 2. local server 127.0.0.1 on a locked random port
 * 3. auth URL with code_challenge and state
 * 4. browser opening via injectable openBrowserFn (manual fallback: URL logged)
 * 5. waits for callback with total timeout
 * 6. exchanges code for tokens at POST https://oauth2.googleapis.com/token
 * 7. fetches userinfo e-mail
 *
 * @param options - StartOAuthFlowOptions (all injectable for tests)
 * @returns OAuthResult with tokens + userInfo + validated state
 */
export async function startOAuthFlow(options: StartOAuthFlowOptions = {}): Promise<OAuthResult> {
  const clientId = options.clientId ?? GEMINI_OAUTH_CLIENT_ID;
  const clientSecret = options.clientSecret ?? GEMINI_OAUTH_CLIENT_SECRET;
  const scopes = options.scopes ?? GOOGLE_OAUTH_SCOPES;
  const callbackPath = options.callbackPath ?? "/callback";
  const timeoutMs = options.timeoutMs ?? 5 * 60 * 1000;
  const opener =
    options.openBrowserFn ??
    ((url: string) => {
      void openBrowserAsync(url);
    });

  // 1. PKCE
  const pkce = generatePKCE();
  const state = base64urlEncode(crypto.randomBytes(32));

  // 2. local locked server 127.0.0.1 random port (multi-path + scope capture)
  const srv = await createOAuthServerAsync({
    callbackPath,
    expectedState: state,
  });

  const redirectUri = srv.callbackUrl;

  // 3. Google authorization URL
  const authParams = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scopes,
    code_challenge: pkce.challenge,
    code_challenge_method: "S256",
    state,
    access_type: "offline",
    prompt: "consent", // forces refresh_token every time
  });

  const authUrl = `${OAUTH_AUTHORIZE_URL}?${authParams.toString()}`;

  // 4. open browser with manual fallback (URL always logged)
  console.log(
    `\n[maene] Opening browser for authentication...\n` +
      `If it does not open automatically, copy and paste into the browser:\n\n${authUrl}\n`,
  );
  try {
    opener(authUrl);
  } catch (err) {
    console.log(`[maene] openBrowserFn failed, manual fallback: ${authUrl}`);
  }

  // 5. wait for callback (validates state against CSRF) with total timeout
  let callbackResult: OAuthCallbackResult;
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new Error(`OAuth timeout after ${timeoutMs / 1000}s - user did not complete login`)),
        timeoutMs,
      );
    });
    callbackResult = await Promise.race([srv.waitForCallback(), timeoutPromise]);

    if (callbackResult.state !== state) {
      throw new Error(`State mismatch - possible CSRF. Expected ${state} received ${callbackResult.state}`);
    }
  } catch (err) {
    await srv.close().catch(() => {});
    throw err;
  }

  // 6. exchange code for tokens
  let tokens: TokenResponse;
  try {
    tokens = await exchangeCodeForTokens(callbackResult.code, pkce.verifier, redirectUri, {
      clientId,
      clientSecret,
    });
  } catch (err) {
    await srv.close().catch(() => {});
    throw err;
  }

  // 7. userinfo e-mail
  let userInfo: UserInfo;
  try {
    userInfo = await getUserInfo(tokens.access_token);
  } catch (err) {
    await srv.close().catch(() => {});
    throw new Error(`Failed to obtain e-mail after token exchange: ${(err as Error).message}`, {
      cause: err,
    });
  }

  // 8. shut the server down
  await srv.close();

  console.log(`\n[maene] Authenticated as ${userInfo.email} - ready models: ${SUPPORTED_MODELS_2026.join(", ")}\n`);

  return { tokens, userInfo, state };
}

// =============================================================================
// ADDITIONAL HELPERS - STORAGE & VALIDATION
// =============================================================================

/**
 * Validates the TokenResponse shape (useful when loading from disk)
 */
export function isValidTokenResponse(obj: any): obj is TokenResponse {
  return (
    obj &&
    typeof obj.access_token === "string" &&
    typeof obj.expires_at === "number" &&
    typeof obj.expires_in === "number"
  );
}

/**
 * Extracts the code from a callback URL (public helper for manual paste)
 */
export function extractCodeFromUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  try {
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      const u = new URL(trimmed);
      return u.searchParams.get("code");
    }
  } catch {
    // ignore
  }
  // Tries code= regex
  const m = trimmed.match(/[?&]code=([^&]+)/);
  if (m) return decodeURIComponent(m[1]!);
  // Looks like a bare code (no spaces, reasonable length)
  if (/^[A-Za-z0-9\-_]+$/.test(trimmed) && trimmed.length > 10) return trimmed;
  return null;
}

// =============================================================================
// MODEL HELPERS - READY TO USE FOR CLOUDCODE REQUESTS
// =============================================================================

/**
 * Returns the list of available models (the folded 2026 tuple).
 * Helper for client-side validation before calling fetchAvailableModels.
 */
export function getAllModels(): readonly string[] {
  return SUPPORTED_MODELS_2026;
}

export function isAntigravityModel(model: string): boolean {
  return model.startsWith("antigravity-");
}
/**
 * Default export for CJS/ESM interop. v2.1.14: preserved from the former
 * oauth.ts - every key keeps its legacy oauth.js VALUE (Gemini CLI client),
 * so `default ?? namespace` interop consumers (the cli.ts pattern) keep
 * observing the gemini credentials even though the bare named exports
 * CLIENT_ID / CLIENT_SECRET now carry the Antigravity CLI client. The
 * v2.1.14-renamed symbols are wired back under their legacy keys.
 */
const oauth = {
  CLIENT_ID: GEMINI_OAUTH_CLIENT_ID,
  CLIENT_SECRET: GEMINI_OAUTH_CLIENT_SECRET,
  CLIENT_SECRET_ALTERNATIVE: GEMINI_OAUTH_CLIENT_SECRET_ALTERNATIVE,
  GEMINI_OAUTH_CLIENT_ID,
  GEMINI_OAUTH_CLIENT_SECRET,
  SCOPES: GEMINI_OAUTH_SCOPES,
  GOOGLE_OAUTH_SCOPES,
  OAUTH_AUTHORIZE_URL,
  OAUTH_TOKEN_URL,
  USERINFO_URL,
  GOOGLE_AUTH_URL,
  GOOGLE_TOKEN_URL,
  GOOGLE_USERINFO_URL,
  CLOUDCODE_BASE,
  CLOUDCODE_API_BASE,
  CLOUDCODE_ORIGIN,
  ENDPOINTS: CLOUDCODE_ENDPOINTS,
  PROJECT_FALLBACK,
  MODELS_2026: SUPPORTED_MODELS_2026,
  SUPPORTED_MODELS_2026,
  GEMINI_UA_BASE,
  ANTIGRAVITY_USER_AGENT,
  // funcs
  generatePKCE,
  buildAuthUrl,
  createOAuthServer,
  createOAuthServerAsync,
  openBrowser: openBrowserAsync,
  exchangeCodeForTokens,
  refreshAccessToken,
  refreshAndPreserve,
  startOAuthFlow,
  getUserInfo,
  authenticate,
  isTokenExpired,
  isValidTokenResponse,
  extractCodeFromUrl,
  isWSL,
  isSSH,
  hasDisplay,
  buildGeminiUserAgent,
  getGeminiHeaders,
  getAllModels,
  isAntigravityModel,
  base64urlEncode,
  base64urlDecode,
};

export default oauth;
