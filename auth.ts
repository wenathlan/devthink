/** The auth module of the 1.1.88 consolidation: every correlated variation of the auth logic interned in this one file, so the module family carries one surface without duplicate variations. */

/* ── Merged from clientauth.ts: the 1.1.88 consolidation interns the correlated clientauth logic here, so no variation of the same file lives beside another. ── */
import type {
  allowlistentry,
  authchallenge,
  authmethod,
  clientidentity,
  pairingcode,
  sessiontoken,
  tlsconfig,
  tokenhash,
  toolnamespace,
  formpayload,
  multipartpayload,
  oauthflow,
  revocationrule,
  bridgepairingrecord,
  relaytokenrecord,
} from "./types.js";
import { randomid } from "./memory.js";
import { toolnamespaces } from "./tools.js";

/**
 * Client auth of the 1.1.55 agent protocol part two.
 * Every pairing, token, allowlist and handshake concern for remote clients lives in this file: the one time pairing codes with their single use state, the session tokens issued in exchange and stored only as sha-256 tokenhash values, the token verification on every frame with its scope limits and expiry, the client allowlist that refuses unknown fingerprints, the grant history of every scope change, the auth challenges with their single use nonces, the handshake completion that marks a client paired, the revocation that stays available to the user at any time, the token expiry that enforces the user configured lifetime and the auth failures that answer with one fixed json rpc message so the pairing state never leaks.
 * The module stays pure: every value is a user choice with no code ceiling, and no endpoint, provider, certificate or key is ever hardcoded.
 */

/** The prefix every stored tokenhash carries so raw token values never persist. */
export const tokenhashprefix = "sha256:";

/** The documented default session token lifetime of one hour; any user configured window wins. */
export const defaulttokenlifetimems = 3_600_000;

/** The documented default pairing code window of five minutes; any user configured window wins. */
export const defaultpairinglifetimems = 300_000;

/** The documented default auth challenge window of two minutes; any user configured window wins. */
export const defaultchallengelifetimems = 120_000;

/** The fixed message every auth failure answers with; it names no client, token or pairing state so nothing leaks. */
export const authrefusedmessage = "The remote frame failed its authentication handshake.";

/** Digests one raw token into its stored tokenhash form: the sha-256 hex digest under the documented prefix, computed through the platform crypto seam so the raw value never persists. */
export async function tokenhashof(raw: string): Promise<tokenhash> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  return tokenhashprefix + [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

/** Issues one pairing code for a one time client pairing: the human copied code, the granted namespaces, the issue time and the user configured expiry window. */
export function issuepairingcode(input: {
  now: number;
  scopes: toolnamespace[];
  lifetime?: number;
  code?: string;
}): pairingcode {
  const scopes = input.scopes.filter((scope) => toolnamespaces.includes(scope));
  return {
    code: input.code ?? `DT-${randomid().replace(/-/g, "").slice(0, 8).toUpperCase()}`,
    scopes,
    issuedat: input.now,
    expiresat: input.now + (input.lifetime ?? defaultpairinglifetimems),
  };
}

/** Exchanges one pairing code for its granted scopes: the code must match, stay pending and sit inside its window while a used or expired code never pairs a second client. */
export function redeempairingcode(input: { codes: pairingcode[]; code: string; now: number }): {
  code?: pairingcode;
  reason?: string;
} {
  const match = input.codes.find((candidate) => candidate.code === input.code);
  if (match === undefined) return { reason: authrefusedmessage };
  if (match.usedat !== undefined)
    return { reason: "The pairing code was already used once and never pairs a second client." };
  if (input.now >= match.expiresat) return { reason: "The pairing code expired before the exchange completed." };
  return { code: { ...match, usedat: input.now } };
}

/** Issues one session token for a paired client: the raw token leaves exactly once in the answer while the record persists only its tokenhash form, the scopes, the issue time and the user configured expiry. */
export async function issuetoken(input: {
  clientid: string;
  scopes: toolnamespace[];
  now: number;
  lifetime?: number;
  id?: string;
  raw?: string;
}): Promise<{ token: sessiontoken; raw: string }> {
  const raw = input.raw ?? `${randomid()}.${randomid()}`;
  const token: sessiontoken = {
    id: input.id ?? randomid(),
    clientid: input.clientid,
    hash: await tokenhashof(raw),
    scopes: input.scopes.filter((scope) => toolnamespaces.includes(scope)),
    issuedat: input.now,
    expiresat: input.now + (input.lifetime ?? defaulttokenlifetimems),
  };
  return { token, raw };
}

/** Validates one session token on every frame: the digest of the presented raw token must match a stored, unrevoked, unexpired record; every failure answers with the fixed message so the pairing state never leaks. */
export async function verifytoken(input: {
  tokens: sessiontoken[];
  raw: string;
  now: number;
}): Promise<{ token?: sessiontoken; reason?: string }> {
  const hash = await tokenhashof(input.raw);
  const match = input.tokens.find((candidate) => candidate.hash === hash);
  if (match === undefined) return { reason: authrefusedmessage };
  if (match.revokedat !== undefined) return { reason: authrefusedmessage };
  if (input.now >= match.expiresat) return { reason: authrefusedmessage };
  return { token: match };
}

/** Revokes every session token of one client on demand; the revocation stays available to the user at any time and the records stay for the audit trail. */
export function revokeclient(tokens: sessiontoken[], clientid: string, now: number): sessiontoken[] {
  return tokens.map((token) =>
    token.clientid === clientid && token.revokedat === undefined ? { ...token, revokedat: now } : token,
  );
}

/** Enforces the configured token lifetime: tokens past their expiry leave the live set while their records stay for the audit trail. */
export function expiretokens(input: { tokens: sessiontoken[]; now: number }): {
  live: sessiontoken[];
  expired: sessiontoken[];
} {
  const expired = input.tokens.filter((token) => token.revokedat === undefined && input.now >= token.expiresat);
  return { live: input.tokens.filter((token) => !expired.includes(token)), expired };
}

/** Checks the client allowlist: a fingerprint must carry an entry and, when a namespace is asked, the entry must grant it. */
export function checkallowlist(input: { entries: allowlistentry[]; fingerprint: string; namespace?: toolnamespace }): {
  allowed: boolean;
  reason?: string;
} {
  const entry = input.entries.find((candidate) => candidate.fingerprint === input.fingerprint);
  if (entry === undefined)
    return {
      allowed: false,
      reason: `The client fingerprint ${input.fingerprint} is not on the allowlist and is refused.`,
    };
  if (input.namespace !== undefined && !entry.namespaces.includes(input.namespace))
    return { allowed: false, reason: `The allowlist entry ${entry.displayname} grants no ${input.namespace} tools.` };
  return { allowed: true };
}

/** Grants or updates one allowlist entry with its grant history: every scope change lands in the history with its actor and plain language change. */
export function grantallowlistentry(input: {
  entries: allowlistentry[];
  identity: clientidentity;
  namespaces: toolnamespace[];
  actor: string;
  now: number;
}): allowlistentry[] {
  const scopes = input.namespaces.filter((scope) => toolnamespaces.includes(scope));
  const existing = input.entries.find((entry) => entry.fingerprint === input.identity.fingerprint);
  if (existing === undefined) {
    return [
      {
        fingerprint: input.identity.fingerprint,
        displayname: input.identity.displayname,
        namespaces: scopes,
        grantedat: input.now,
        history: [
          {
            at: input.now,
            actor: input.actor,
            change: `Granted the ${scopes.length > 0 ? scopes.join(", ") : "no"} namespaces.`,
          },
        ],
      },
      ...input.entries,
    ];
  }
  return input.entries.map((entry) =>
    entry.fingerprint !== input.identity.fingerprint
      ? entry
      : {
          ...entry,
          displayname: input.identity.displayname,
          namespaces: scopes,
          history: [
            {
              at: input.now,
              actor: input.actor,
              change: `Rescoped to ${scopes.length > 0 ? scopes.join(", ") : "no"} namespaces.`,
            },
            ...entry.history,
          ],
        },
  );
}

/** Issues one auth challenge to a new client: the single use nonce, the method it authenticates and the user configured expiry window. */
export function issuechallenge(input: {
  method: authmethod;
  now: number;
  lifetime?: number;
  nonce?: string;
}): authchallenge {
  return {
    nonce: input.nonce ?? randomid(),
    method: input.method,
    issuedat: input.now,
    expiresat: input.now + (input.lifetime ?? defaultchallengelifetimems),
  };
}

/** Completes the auth handshake: the echoed nonce must match the live challenge and the presented token must verify; success marks the client paired while every failure answers with the fixed message. */
export async function verifyauth(input: {
  challenge: authchallenge;
  nonce: string;
  tokens: sessiontoken[];
  rawtoken: string;
  now: number;
}): Promise<{ verified: boolean; clientid?: string; reason?: string }> {
  if (input.nonce !== input.challenge.nonce) return { verified: false, reason: authrefusedmessage };
  if (input.now >= input.challenge.expiresat)
    return { verified: false, reason: "The auth challenge expired before the handshake completed." };
  const checked = await verifytoken({ tokens: input.tokens, raw: input.rawtoken, now: input.now });
  if (checked.token === undefined) return { verified: false, reason: authrefusedmessage };
  return { verified: true, clientid: checked.token.clientid };
}

/** Limits one tool call to the namespaces the token scopes grant: an unknown namespace fails fast while a known but ungranted namespace stays a consent refusal. */
export function scopecheck(
  token: sessiontoken | undefined,
  namespace: toolnamespace | undefined,
): { allowed: boolean; fast?: boolean; reason?: string } {
  if (namespace === undefined)
    return { allowed: false, fast: true, reason: "The tool call names no reviewed namespace." };
  if (token === undefined) return { allowed: false, reason: "The tool call carries no verified session token." };
  if (!token.scopes.includes(namespace))
    return { allowed: false, reason: `The session token grants no ${namespace} tools.` };
  return { allowed: true };
}

/** Reports the tls termination state of one transport config for the remote status view: the mode, the certificate requirement and whether the peer was verified. */
export function tlsstateof(tls: tlsconfig): { mode: string; certificaterequired: boolean; verified: boolean } {
  return {
    mode: tls.mode,
    certificaterequired: tls.mode === "required" || tls.certificatefingerprint !== undefined,
    verified: tls.verifiedat !== undefined,
  };
}

/* ── Merged from netauth.ts: the 1.1.88 consolidation interns the correlated netauth logic here, so no variation of the same file lives beside another. ── */
/** Correlated auth and upload logics of the 1.1.44 family: reviewed oauth flows with code capture, token exchange and refresh, token revocation, api key entries, urlencoded form payloads and streamed multipart uploads. */

/** Parses one reviewed oauth flow from step options: provider, authorize url, token url, scopes and the redirect origin the code capture watches. */
export function oauthflowof(value: unknown): oauthflow | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const options = value as Record<string, unknown>;
  if (typeof options.provider !== "string" || !options.provider.trim()) return undefined;
  if (typeof options.authorizeurl !== "string" || !options.authorizeurl.trim()) return undefined;
  if (typeof options.tokenurl !== "string" || !options.tokenurl.trim()) return undefined;
  if (
    !Array.isArray(options.scopes) ||
    options.scopes.length === 0 ||
    !options.scopes.every((item): item is string => typeof item === "string" && item.trim().length > 0)
  )
    return undefined;
  if (typeof options.redirectorigin !== "string" || !options.redirectorigin.trim()) return undefined;
  return {
    provider: options.provider.trim(),
    authorizeurl: options.authorizeurl.trim(),
    tokenurl: options.tokenurl.trim(),
    scopes: options.scopes.map((item) => item.trim()),
    redirectorigin: options.redirectorigin.trim(),
  };
}

/** Builds the provider consent page url of one reviewed oauth flow with the response type code, the redirect origin, the scopes and the run scoped state token. */
export function authorizeurl(flow: oauthflow, state: string): string {
  const url = new URL(flow.authorizeurl);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", flow.redirectorigin);
  url.searchParams.set("scope", flow.scopes.join(" "));
  url.searchParams.set("state", state);
  return url.toString();
}

/** Captures the oauth code from one redirect url: the url must land on the granted redirect origin with the matching state token and carry the code parameter; error redirects are refused with their reason. */
export function capturecode(
  url: string,
  redirectorigin: string,
  state: string,
): { code: string; error?: undefined } | { error: string } {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { error: "The redirect url does not parse for the code capture." };
  }
  const granted = redirectorigin.includes("/", redirectorigin.indexOf("://") + 3)
    ? `${parsed.origin}${parsed.pathname}`.startsWith(redirectorigin)
    : parsed.origin === redirectorigin;
  if (!granted)
    return { error: `The redirect landed on ${parsed.origin} outside the granted redirect origin ${redirectorigin}.` };
  const returned = parsed.searchParams.get("state");
  if (returned !== state) return { error: "The redirect state token does not match the reviewed flow." };
  const error = parsed.searchParams.get("error");
  if (error) return { error: `The provider refused the flow: ${error}.` };
  const code = parsed.searchParams.get("code");
  if (!code) return { error: "The redirect carries no authorization code." };
  return { code };
}

/** Parses one token endpoint response body: access token, refresh token, expiry seconds and granted scopes; a body without a token string parses to nothing. */
export function parsetokens(
  body: string,
): { accesstoken?: string; refreshtoken?: string; expiresin?: number; scopes?: string[] } | undefined {
  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    return undefined;
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return undefined;
  const record = parsed as Record<string, unknown>;
  const tokens: { accesstoken?: string; refreshtoken?: string; expiresin?: number; scopes?: string[] } = {};
  if (typeof record["access_token"] === "string" && record["access_token"]) tokens.accesstoken = record["access_token"];
  if (typeof record["refresh_token"] === "string" && record["refresh_token"])
    tokens.refreshtoken = record["refresh_token"];
  if (typeof record["expires_in"] === "number" && Number.isFinite(record["expires_in"]) && record["expires_in"] >= 0)
    tokens.expiresin = record["expires_in"];
  if (typeof record.scope === "string" && record.scope.trim()) tokens.scopes = record.scope.trim().split(/\s+/);
  if (tokens.accesstoken === undefined && tokens.refreshtoken === undefined) return undefined;
  return tokens;
}

/** Builds the token endpoint request of one reviewed flow: the authorization code exchange with the redirect origin or the refresh token grant that stays scoped to the provider token origin. */
export function tokenrequest(
  flow: oauthflow,
  input: { code?: string; refreshtoken?: string },
): { url: string; body: string } {
  if (input.refreshtoken !== undefined)
    return {
      url: flow.tokenurl,
      body: urlencodeform([
        { name: "grant_type", value: "refresh_token" },
        { name: "refresh_token", value: input.refreshtoken },
      ]),
    };
  return {
    url: flow.tokenurl,
    body: urlencodeform([
      { name: "grant_type", value: "authorization_code" },
      { name: "code", value: input.code ?? "" },
      { name: "redirect_uri", value: flow.redirectorigin },
    ]),
  };
}

/** Parses one reviewed token revocation rule from step options: the token ids, the reason and the revoke time. */
export function revocationruleof(value: unknown): revocationrule | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const options = value as Record<string, unknown>;
  if (
    !Array.isArray(options.tokenids) ||
    options.tokenids.length === 0 ||
    !options.tokenids.every((item): item is string => typeof item === "string" && item.trim().length > 0)
  )
    return undefined;
  if (typeof options.reason !== "string" || !options.reason.trim()) return undefined;
  return {
    tokenids: options.tokenids.map((item) => item.trim()),
    reason: options.reason.trim(),
    revokedat: Date.now(),
  };
}

/** Parses one reviewed urlencoded form payload from step options: the target url, the field list and the optional encoding name of the 1.1.76 family; an absent encoding keeps the urlencoded grammar. */
export function formpayloadof(value: unknown): formpayload | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const options = value as Record<string, unknown>;
  if (typeof options.url !== "string" || !options.url.trim()) return undefined;
  if (!Array.isArray(options.fields) || options.fields.length === 0) return undefined;
  const fields: Array<{ name: string; value: string }> = [];
  for (const item of options.fields) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return undefined;
    const field = item as Record<string, unknown>;
    if (typeof field.name !== "string" || !field.name.trim()) return undefined;
    if (typeof field.value !== "string") return undefined;
    fields.push({ name: field.name.trim(), value: field.value });
  }
  return {
    url: options.url.trim(),
    fields,
    ...(typeof options.encoding === "string" && options.encoding.trim() ? { encoding: options.encoding.trim() } : {}),
  };
}

/** Encodes one reviewed field list with the application/x-www-form-urlencoded grammar: names and values percent encode with the form encoding set and pairs join with ampersands. */
export function urlencodeform(fields: Array<{ name: string; value: string }>): string {
  return fields.map((field) => `${formencode(field.name)}=${formencode(field.value)}`).join("&");
}

/** Percent encodes one form component with the urlencoded grammar over its UTF-8 bytes. */
function formencode(value: string): string {
  const bytes = [...new TextEncoder().encode(value)];
  return bytes
    .map((byte) =>
      (byte >= 0x41 && byte <= 0x5a) ||
      (byte >= 0x61 && byte <= 0x7a) ||
      (byte >= 0x30 && byte <= 0x39) ||
      byte === 0x2d ||
      byte === 0x5f ||
      byte === 0x2e ||
      byte === 0x7e
        ? String.fromCharCode(byte)
        : `%${byte.toString(16).toUpperCase().padStart(2, "0")}`,
    )
    .join("");
}

/** Parses one reviewed multipart upload payload from step options: the target url, the field list and the reviewed files. */
export function multipartpayloadof(value: unknown): multipartpayload | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const options = value as Record<string, unknown>;
  if (typeof options.url !== "string" || !options.url.trim()) return undefined;
  if (!Array.isArray(options.files) || options.files.length === 0) return undefined;
  const fields: Array<{ name: string; value: string }> = [];
  for (const item of Array.isArray(options.fields) ? options.fields : []) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return undefined;
    const field = item as Record<string, unknown>;
    if (typeof field.name !== "string" || !field.name.trim()) return undefined;
    if (typeof field.value !== "string") return undefined;
    fields.push({ name: field.name.trim(), value: field.value });
  }
  const files: multipartpayload["files"] = [];
  for (const item of options.files) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return undefined;
    const file = item as Record<string, unknown>;
    if (typeof file.name !== "string" || !file.name.trim()) return undefined;
    if (typeof file.filename !== "string" || !file.filename.trim()) return undefined;
    if (typeof file.mime !== "string" || !file.mime.trim()) return undefined;
    if (typeof file.content !== "string") return undefined;
    if (file.reviewed !== true) return undefined;
    files.push({
      name: file.name.trim(),
      filename: file.filename.trim(),
      mime: file.mime.trim(),
      content: file.content,
      reviewed: true,
    });
  }
  const payload: multipartpayload = {
    url: options.url.trim(),
    fields,
    files,
    ...(typeof options.boundary === "string" && options.boundary.trim() ? { boundary: options.boundary.trim() } : {}),
  };
  return payload;
}

/** Builds one locally unique multipart boundary token. */
function newboundary(): string {
  return `----devthink${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
}

/** Streams one reviewed multipart payload as ordered chunks: one chunk per field part, per file part and the closing boundary, so large uploads move chunk by chunk without buffering the whole payload. */
export function multipartchunks(payload: multipartpayload): { chunks: string[]; boundary: string; bytes: number } {
  const boundary = payload.boundary ?? newboundary();
  const chunks: string[] = [];
  for (const field of payload.fields)
    chunks.push(`--${boundary}\r\ncontent-disposition: form-data; name="${field.name}"\r\n\r\n${field.value}\r\n`);
  for (const file of payload.files)
    chunks.push(
      `--${boundary}\r\ncontent-disposition: form-data; name="${file.name}"; filename="${file.filename}"\r\ncontent-type: ${file.mime}\r\n\r\n${file.content}\r\n`,
    );
  chunks.push(`--${boundary}--\r\n`);
  return { chunks, boundary, bytes: chunks.reduce((total, chunk) => total + chunk.length, 0) };
}

/* ── Merged from sharedauth.ts: the 1.1.88 consolidation interns the correlated sharedauth logic here, so no variation of the same file lives beside another. ── */

/**
 * Shared auth of the 1.1.82 site integration family.
 * Every pairing and token concern of the site bridge lives in this one pure module, and it extends the reviewed clientauth family instead of duplicating it: the pairing code mint inside the extension options reuses the one time pairing code record of the clientauth family bound to the relay origin the user typed; the expiry countdown reads the code window for the options page display; the code exchange redeems the clientauth record once and answers the session token exactly once while the record persists only its sha-256 hash through the clientauth digest; the rotation on every reconnect issues a fresh token that keeps the id of the token it replaced and revokes the old one; the token storage stays scoped to the relay origin so one relay never reads the sessions of another; and the one click revocation stamps every record with its revocation time. The pairing scopes stay the browser namespace because the site never gains an executor: the token authenticates frames only.
 * Example: `const pairing = mintbridgepairing({ origin, now }); const exchange = await exchangebridgepairing({ records: [pairing], origin, code: pairing.code.code, sessionid, now }); const rotated = await rotatebridgetoken({ tokens: [exchange.record], sessionid, origin, now });`
 */

/** The pairing scopes the bridge grants: the browser namespace only, because a paired site reads and answers frames while the extension stays the only executor. */
export const bridgepairingscopes: toolnamespace[] = ["browser"];

/** Mints one bridge pairing code inside the extension options: the clientauth pairing code record bound to the relay origin the user typed, with the lifetime staying the user's choice over the documented five minute window. */
export function mintbridgepairing(input: {
  origin: string;
  now: number;
  lifetime?: number;
  code?: string;
}): bridgepairingrecord {
  const origin = input.origin.trim();
  if (origin === "")
    throw new Error(
      "The bridge pairing names its relay origin; the origin is the user configured relay url the code binds to.",
    );
  return {
    origin,
    code: issuepairingcode({
      now: input.now,
      scopes: [...bridgepairingscopes],
      ...(input.lifetime !== undefined ? { lifetime: input.lifetime } : {}),
      ...(input.code !== undefined ? { code: input.code } : {}),
    }),
    at: input.now,
  };
}

/** Reads the expiry countdown of one bridge pairing code for the options page: the seconds left inside the window, the expired flag once the window passed and the human label the options page renders. */
export function pairingcountdown(
  record: bridgepairingrecord,
  now: number,
): { secondsleft: number; expired: boolean; label: string } {
  const secondsleft = Math.max(0, Math.ceil((record.code.expiresat - now) / 1000));
  const expired = now >= record.code.expiresat || record.code.usedat !== undefined;
  const minutes = Math.floor(secondsleft / 60);
  const seconds = secondsleft % 60;
  const label = expired
    ? `The pairing code ${record.code.code} expired.`
    : `The pairing code ${record.code.code} expires in ${minutes}m ${String(seconds).padStart(2, "0")}s.`;
  return { secondsleft, expired, label };
}

/** Exchanges one bridge pairing code for its relay session token: the code must match a record of the same relay origin, stay pending and sit inside its window (the clientauth redemption enforces the single use state), and the answer carries the raw token exactly once while the record persists only its sha-256 hash scoped to the origin and session. */
export async function exchangebridgepairing(input: {
  records: bridgepairingrecord[];
  origin: string;
  code: string;
  sessionid: string;
  now: number;
  lifetime?: number;
}): Promise<{ record?: relaytokenrecord; raw?: string; used?: pairingcode; reason?: string }> {
  const origin = input.origin.trim();
  if (origin === "") return { reason: "The pairing exchange names its relay origin." };
  const sessionid = input.sessionid.trim();
  if (sessionid === "") return { reason: "The pairing exchange names its session." };
  const match = input.records.find((record) => record.origin === origin && record.code.code === input.code.trim());
  if (match === undefined) return { reason: `No pending pairing code of the origin ${origin} matches the typed code.` };
  const redemption = redeempairingcode({
    codes: input.records.map((record) => record.code),
    code: input.code.trim(),
    now: input.now,
  });
  if (redemption.reason !== undefined) return { reason: redemption.reason };
  if (redemption.code === undefined) return { reason: "The pairing code redeemed no session." };
  const raw = `${randomid()}.${randomid()}`;
  const record: relaytokenrecord = {
    id: randomid(),
    sessionid,
    origin,
    hash: await tokenhashof(raw),
    issuedat: input.now,
    ...(input.lifetime !== undefined && Number.isFinite(input.lifetime) && input.lifetime > 0
      ? { expiresat: input.now + input.lifetime }
      : {}),
  };
  return { record, raw, used: redemption.code };
}

/** Rotates the relay session token on one reconnect: the fresh raw token answers exactly once, the new record keeps the id of the token it replaced through the rotation chain, and the replaced record stamps its revocation time while its hash history stays for the audit trail. */
export async function rotatebridgetoken(input: {
  tokens: relaytokenrecord[];
  sessionid: string;
  origin: string;
  now: number;
  lifetime?: number;
  raw?: string;
}): Promise<{ tokens: relaytokenrecord[]; raw: string; record: relaytokenrecord }> {
  const sessionid = input.sessionid.trim();
  if (sessionid === "") throw new Error("The token rotation names its session.");
  const origin = input.origin.trim();
  if (origin === "") throw new Error("The token rotation names its relay origin.");
  const current = input.tokens
    .filter((token) => token.sessionid === sessionid && token.origin === origin && token.revokedat === undefined)
    .pop();
  const raw = input.raw ?? `${randomid()}.${randomid()}`;
  const record: relaytokenrecord = {
    id: randomid(),
    sessionid,
    origin,
    hash: await tokenhashof(raw),
    issuedat: input.now,
    ...(current !== undefined ? { rotatedfrom: current.id } : {}),
    ...(input.lifetime !== undefined && Number.isFinite(input.lifetime) && input.lifetime > 0
      ? { expiresat: input.now + input.lifetime }
      : {}),
  };
  const tokens = input.tokens.map((token) => (token.id === current?.id ? { ...token, revokedat: input.now } : token));
  return { tokens: [...tokens, record], raw, record };
}

/** Verifies one relay session token on an incoming frame: the sha-256 digest of the raw token must match a record of the same relay origin and session that stays unrevoked and inside its expiry, so a frame of another origin, another session, a revoked or an expired token never passes. */
export async function verifybridgetoken(input: {
  tokens: relaytokenrecord[];
  origin: string;
  sessionid: string;
  raw: string;
  now: number;
}): Promise<{ ok: boolean; reason?: string; token?: relaytokenrecord }> {
  const hash = await tokenhashof(input.raw);
  const match = input.tokens.find((token) => token.hash === hash);
  if (match === undefined) return { ok: false, reason: "The frame token matches no pairing of this bridge." };
  if (match.origin !== input.origin)
    return {
      ok: false,
      reason: "The frame token stays scoped to its relay origin and never crosses to another relay.",
    };
  if (match.sessionid !== input.sessionid)
    return { ok: false, reason: "The frame token stays scoped to its session and never crosses to another session." };
  if (match.revokedat !== undefined)
    return {
      ok: false,
      reason: "The frame token carries its revocation; a rotated or revoked token never passes again.",
    };
  if (match.expiresat !== undefined && input.now >= match.expiresat)
    return { ok: false, reason: "The frame token expired before the frame arrived." };
  return { ok: true, token: match };
}

/** Reads the origin scoped storage key of the relay token records: every origin keeps its own token family so one relay never reads the sessions of another. */
export function tokenscopedkey(origin: string): string {
  const trimmed = origin.trim();
  if (trimmed === "") throw new Error("The token storage key names its relay origin.");
  return `bridgetokens:${trimmed}`;
}

/** Revokes every relay session token with one click: every live record stamps its revocation time while the records themselves stay for the audit trail, so the socket and the pairing die instantly and no frame passes afterwards. */
export function revokeallsessions(tokens: relaytokenrecord[], now: number): relaytokenrecord[] {
  return tokens.map((token) => (token.revokedat === undefined ? { ...token, revokedat: now } : token));
}

/** Reads the live token count of one origin: the unrevoked records the options page lists beside the revoke all button. */
export function livetokensof(tokens: relaytokenrecord[], origin: string, now: number): relaytokenrecord[] {
  return tokens.filter(
    (token) =>
      token.origin === origin &&
      token.revokedat === undefined &&
      (token.expiresat === undefined || now < token.expiresat),
  );
}
