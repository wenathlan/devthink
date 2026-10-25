/**
 * accountlane.ts — the server-side account lane the family signs in
 * through (root layer).
 *
 * The owner's law: the account is REAL — it lives on the server, in the
 * shared sqlite store of the family infrastructure, never only in the
 * visitor browser. This module rides the same seam the storage lane
 * rides: the node native sqlite driver of storage.ts, the database file
 * in the devthink data home beside the storage store, outside every
 * served root. A family deploy that points the shared data home (or
 * DATABASE_URL) at the same store reads the same accounts and the same
 * live sessions on every device of the family — ONE login covers the
 * whole family.
 *
 * The secret never lands in plain text and never logs: the lane keeps
 * only a scrypt digest bound to a random 32-byte salt per account, the
 * verify compares with timingSafeEqual, and the session bearer is stored
 * only as its sha-256 digest — the plaintext token answers once at issue
 * time and lives in the visitor's session storage afterwards.
 *
 * The oauth half redeems the provider code the callback page carries:
 * the provider comes from the oauthrow catalog, the token and profile
 * requests ride the url gate (every hop resolves public addresses), the
 * profile subject upserts the account by provider identity, and the
 * family session issues exactly like the password entry — the same row,
 * the same store, the same one-login law.
 *
 * @section store — the account database file and the lazy schema
 * @section accounts — the owner normalization, the create and the verify
 * @section sessions — the family session issue, verify and revoke
 * @section exchange — the oauth code exchange over the url gate
 */

import { createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { resolvePaths } from "./config.js";
import { sharedatabasedriver } from "./storage.js";
import { gatedrequest } from "./urlgate.js";
import {
  OAUTH_CALLBACK_DEFAULT,
  OAUTH_ID_ENV,
  OAUTH_PROFILE_ENDPOINTS,
  OAUTH_PROVIDERS,
  OAUTH_TOKEN_ENDPOINTS,
  type OAuthProvider,
} from "./oauthrow.ts";

/**
 * @section store — the account database file and the lazy schema.
 * The file sits beside the storage store in the data home, never under a
 * served root; the schema lays down once per fresh file.
 */

type Statement = { run: (...values: unknown[]) => unknown; all: (...values: unknown[]) => unknown[] };
type Database = { prepare: (sql: string) => Statement };

/** The account database path sits beside the storage store in the data home. */
function accountdatabasepath(): string {
  return join(dirname(resolvePaths().database), "devthink-accounts.sqlite");
}

let cacheddatabase: Database | undefined;

/** The schema statements the account store lays down once per fresh file. */
const SCHEMASTATEMENTS = [
  "CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, owner TEXT NOT NULL UNIQUE, salt TEXT NOT NULL, digest TEXT NOT NULL, createdat TEXT NOT NULL)",
  "CREATE TABLE IF NOT EXISTS accountssessions (token TEXT PRIMARY KEY, accountid TEXT NOT NULL, createdat TEXT NOT NULL, expiresat INTEGER NOT NULL)",
  "CREATE INDEX IF NOT EXISTS accountssessionsaccount ON accountssessions(accountid)",
];

/** Opens the account database once per process and lays the schema down. */
function accountdatabase(): Database {
  if (cacheddatabase !== undefined) return cacheddatabase;
  const DatabaseConstructor = sharedatabasedriver() as unknown as new (path: string) => Database;
  const database = new DatabaseConstructor(accountdatabasepath());
  for (const statement of SCHEMASTATEMENTS) database.prepare(statement).run();
  cacheddatabase = database;
  return database;
}

/** Ensures the account database exists before the first route touches it. */
export async function prepareaccounts(): Promise<void> {
  await mkdir(dirname(accountdatabasepath()), { recursive: true });
  accountdatabase();
}

/** The reason an account request was refused. */
export class AccountError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AccountError";
  }
}

/**
 * @section accounts — the owner normalization, the create and the verify.
 * The owner is the normalized handle of the account; the secret is never
 * stored — only the scrypt digest of it, bound to a per-account salt.
 */

/** The owner shape: the compact handle the lane normalizes every input to. */
const ACCOUNTPATTERN = /^[a-z0-9][a-z0-9-]{2,63}$/i;

/** The session bearer shape: 64 hex characters, the randomBytes(32) mint. */
const SESSIONTOKENPATTERN = /^[a-f0-9]{64}$/i;

/** The control characters a secret may never carry. */
const SECRETCONTROLPATTERN = /[\u0000-\u001f\u007f]/;

/** FAMILYSESSIONMS — the family session lifetime: one login, thirty days. */
const FAMILYSESSIONMS = 30 * 24 * 60 * 60 * 1000;

/** SCRYPTKEYBYTES — the digest width of the scrypt verify. */
const SCRYPTKEYBYTES = 64;

/**
 * normalizeaccountowner — the one owner normalization: trimmed, lowered,
 * invalid runs collapsed to dashes, edge dashes stripped. The empty
 * answer refuses — the caller owns the honest error.
 */
export function normalizeaccountowner(value: string): string {
  const cleaned = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return ACCOUNTPATTERN.test(cleaned) ? cleaned : "";
}

/** Whether a secret carries the shape the lane accepts (never stored raw). */
function secretvalid(secret: string): boolean {
  return secret.length >= 4 && secret.length <= 1024 && !SECRETCONTROLPATTERN.test(secret);
}

/** The scrypt digest of a secret under its per-account salt. */
function digestsecret(secret: string, salt: string): string {
  return scryptSync(secret, Buffer.from(salt, "hex"), SCRYPTKEYBYTES).toString("hex");
}

/** The sha-256 hex digest — the only form a session bearer takes on disk. */
function sha256hex(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/** One account record as the read surface answers it. */
export type AccountRecord = { id: string; owner: string; createdAt: string };

/**
 * createaccount — create a real account row: the normalized owner, a
 * fresh 32-byte salt and the scrypt digest of the secret. A taken owner
 * refuses; the existing digest never rewrites.
 *
 * @param owner the raw owner handle the caller received.
 * @param secret the plaintext secret (digest only, never stored, never logged).
 * @returns the created record (id, normalized owner, creation stamp).
 */
export function createaccount(owner: string, secret: string): AccountRecord {
  const normalized = normalizeaccountowner(owner);
  if (!normalized) throw new AccountError("invalid owner");
  if (!secretvalid(secret)) throw new AccountError("invalid secret");
  const database = accountdatabase();
  const existing = database.prepare("SELECT id FROM accounts WHERE owner = ?").all(normalized);
  if (existing.length > 0) throw new AccountError("the owner is already taken");
  const salt = randomBytes(32).toString("hex");
  const digest = digestsecret(secret, salt);
  const record: AccountRecord = { id: randomUUID(), owner: normalized, createdAt: new Date().toISOString() };
  try {
    database
      .prepare("INSERT INTO accounts (id, owner, salt, digest, createdat) VALUES (?, ?, ?, ?, ?)")
      .run(record.id, record.owner, salt, digest, record.createdAt);
  } catch {
    throw new AccountError("the owner is already taken");
  }
  return record;
}

/**
 * accountfor — the account of one owner handle, or null when absent.
 *
 * @param owner the raw owner handle the caller received.
 * @returns the record, or null when the owner holds no account.
 */
export function accountfor(owner: string): AccountRecord | null {
  const normalized = normalizeaccountowner(owner);
  if (!normalized) return null;
  const rows = accountdatabase()
    .prepare("SELECT id, owner, createdat FROM accounts WHERE owner = ?")
    .all(normalized) as Array<{ id: string; owner: string; createdat: string }>;
  const row = rows[0];
  if (!row) return null;
  return { id: row.id, owner: row.owner, createdAt: row.createdat };
}

/**
 * verifyaccount — the password entry: the scrypt digest of the attempt
 * compares with the stored digest through timingSafeEqual. An absent
 * account, a malformed owner or a malformed secret refuse identically —
 * the answer carries no hint about which half failed.
 *
 * @param owner the raw owner handle the caller received.
 * @param secret the plaintext attempt (digest only, never stored, never logged).
 * @returns the account record on the match, null on any refusal.
 */
export function verifyaccount(owner: string, secret: string): AccountRecord | null {
  const normalized = normalizeaccountowner(owner);
  if (!normalized || !secretvalid(secret)) return null;
  const rows = accountdatabase()
    .prepare("SELECT id, owner, salt, digest, createdat FROM accounts WHERE owner = ?")
    .all(normalized) as Array<{ id: string; owner: string; salt: string; digest: string; createdat: string }>;
  const row = rows[0];
  if (!row) return null;
  const computed = Buffer.from(digestsecret(secret, row.salt), "hex");
  const stored = Buffer.from(row.digest, "hex");
  if (computed.length !== stored.length || !timingSafeEqual(computed, stored)) return null;
  return { id: row.id, owner: row.owner, createdAt: row.createdat };
}

/**
 * @section sessions — the family session issue, verify and revoke. The
 * bearer rides the wire in plaintext once and is stored only as its
 * sha-256 digest; the row keys the account and the expiry.
 */

/** One issued session as the caller receives it (the plaintext answers once). */
export type AccountSessionIssued = { token: string; expiresAt: number };

/** One live session as the verify surface answers it. */
export type AccountSessionView = { accountid: string; owner: string; createdAt: string; expiresAt: number };

/**
 * issueaccountsession — mint one family session for an account: a
 * randomBytes(32) bearer, stored only as its digest, living for the
 * family lifetime (thirty days by default).
 *
 * @param accountid the account the session belongs to.
 * @param ttlms the lifetime override (default the family thirty days).
 * @returns the plaintext token (answers once) and the expiry epoch ms.
 */
export function issueaccountsession(accountid: string, ttlms: number = FAMILYSESSIONMS): AccountSessionIssued {
  if (!accountid) throw new AccountError("invalid account");
  const token = randomBytes(32).toString("hex");
  const createdAt = new Date().toISOString();
  const expiresAt = Date.now() + ttlms;
  accountdatabase()
    .prepare("INSERT INTO accountssessions (token, accountid, createdat, expiresat) VALUES (?, ?, ?, ?)")
    .run(sha256hex(token), accountid, createdAt, expiresAt);
  return { token, expiresAt };
}

/**
 * verifyaccountsession — the bearer check: the digest lookup against the
 * store, the expiry honest. Garbage tokens refuse before any query runs.
 *
 * @param token the bearer the caller presented.
 * @returns the live session view, or null on any refusal.
 */
export function verifyaccountsession(token: string): AccountSessionView | null {
  if (!SESSIONTOKENPATTERN.test(token)) return null;
  const rows = accountdatabase()
    .prepare(
      "SELECT accountssessions.accountid AS accountid, accountssessions.createdat AS createdat, accountssessions.expiresat AS expiresat, accounts.owner AS owner FROM accountssessions INNER JOIN accounts ON accounts.id = accountssessions.accountid WHERE accountssessions.token = ?",
    )
    .all(sha256hex(token)) as Array<{ accountid: string; createdat: string; expiresat: number; owner: string }>;
  const row = rows[0];
  if (!row) return null;
  const expiresAt = Number(row.expiresat);
  if (expiresAt <= Date.now()) return null;
  return { accountid: row.accountid, owner: row.owner, createdAt: row.createdat, expiresAt };
}

/**
 * revokeaccountsession — remove one session row; the answer says whether
 * a live session was removed.
 *
 * @param token the bearer to revoke.
 * @returns true when the session existed and is gone.
 */
export function revokeaccountsession(token: string): boolean {
  if (!SESSIONTOKENPATTERN.test(token)) return false;
  const answer = accountdatabase()
    .prepare("DELETE FROM accountssessions WHERE token = ?")
    .run(sha256hex(token)) as { changes?: number };
  return Number(answer.changes ?? 0) > 0;
}

/** Whether a bearer carries the shape the lane mints (the route gate). */
export function accountsessiontokenvalid(token: string): boolean {
  return SESSIONTOKENPATTERN.test(token);
}

/**
 * @section exchange — the oauth code exchange over the url gate. The
 * provider rides the oauthrow catalog, the token and profile requests
 * ride the url gate (every hop resolves public addresses), the profile
 * subject upserts the account by provider identity, and the family
 * session issues exactly like the password entry.
 */

/** The code shape the providers mint: printable, bounded, no spaces. */
const CODEPATTERN = /^[\x21-\x7e]{1,1024}$/;

/** The RFC 7636 verifier alphabet and bounds the exchange redeems. */
const VERIFIERPATTERN = /^[A-Za-z0-9\-._~]{43,128}$/;

/** The redirect uri shape the exchange accepts (https, bounded, no junk). */
const REDIRECTPATTERN = /^https:\/\/[^\s"'<>\\]{1,500}$/;

/** One completed exchange: the identity, the owner and the family session. */
export type ExchangeAnswer = { provider: string; owner: string; subject: string; token: string; expiresAt: number };

/** The env credentials of one provider: the id from the build env names,
 * the secret from the server env — secrets never in code. */
function providercredentials(provider: OAuthProvider): { id: string; secret: string } {
  const upper = provider.toUpperCase();
  const id = process.env[OAUTH_ID_ENV[provider]] || process.env[["OAUTH_", upper, "_ID"].join("")] || "";
  const secret = process.env[["OAUTH_", upper, "_SECRET"].join("")] || "";
  return { id, secret };
}

/** The provider identity of a profile payload: the subject per provider. */
function provideridentity(provider: OAuthProvider, payload: Record<string, unknown>): string {
  const raw =
    provider === "google"
      ? payload.sub
      : provider === "github"
        ? payload.id ?? payload.login
        : payload.id ?? payload.username;
  return String(raw ?? "").trim().toLowerCase();
}

/** Parses a json object body; anything else answers the empty record. */
function parsejsonobject(body: string): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(body);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

/**
 * exchangeoauthcode — the gateway wave: redeem the provider code at the
 * token endpoint through the url gate, read the profile identity, upsert
 * the account by provider identity and issue the family session.
 *
 * @param provider the provider name (validated against the oauthrow catalog).
 * @param code the authorization code the callback carried.
 * @param verifier the parked pkce verifier of the round trip.
 * @param redirecturi the redirect uri the authorize request rode (the
 *   callback base answers when the caller sent none).
 * @returns the exchange answer with the family session.
 */
export async function exchangeoauthcode(
  provider: string,
  code: string,
  verifier: string,
  redirecturi: string,
): Promise<ExchangeAnswer> {
  if (!OAUTH_PROVIDERS.includes(provider as OAuthProvider)) throw new AccountError("unknown provider");
  const known = provider as OAuthProvider;
  if (!CODEPATTERN.test(code)) throw new AccountError("invalid code");
  if (!VERIFIERPATTERN.test(verifier)) throw new AccountError("invalid verifier");
  const redirect = REDIRECTPATTERN.test(redirecturi) ? redirecturi : OAUTH_CALLBACK_DEFAULT;
  const credentials = providercredentials(known);
  if (!credentials.id || !credentials.secret) throw new AccountError("the provider exchange is not configured");
  const tokenanswer = await gatedrequest(OAUTH_TOKEN_ENDPOINTS[known], {
    method: "POST",
    form: {
      grant_type: "authorization_code",
      code,
      client_id: credentials.id,
      client_secret: credentials.secret,
      redirect_uri: redirect,
    },
    headers: { accept: "application/json" },
  });
  if (tokenanswer.status !== 200) throw new AccountError("the provider refused the code");
  const tokenpayload = parsejsonobject(tokenanswer.body);
  const accesstoken = typeof tokenpayload.access_token === "string" ? tokenpayload.access_token : "";
  if (!accesstoken) throw new AccountError("the provider answered no access token");
  const profileanswer = await gatedrequest(OAUTH_PROFILE_ENDPOINTS[known], {
    headers: { accept: "application/json", authorization: ["Bearer ", accesstoken].join("") },
  });
  if (profileanswer.status !== 200) throw new AccountError("the provider refused the profile");
  const profile = parsejsonobject(profileanswer.body);
  const subject = provideridentity(known, profile);
  if (!subject) throw new AccountError("the provider profile carried no identity");
  const owner = normalizeaccountowner([known, "-", subject].join(""));
  if (!owner) throw new AccountError("the provider identity did not normalize to an owner");
  if (!accountfor(owner)) createaccount(owner, randomBytes(32).toString("hex"));
  const account = accountfor(owner);
  if (!account) throw new AccountError("the account could not be opened");
  const session = issueaccountsession(account.id);
  return { provider: known, owner, subject, token: session.token, expiresAt: session.expiresAt };
}
