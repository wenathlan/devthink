// # accounts — the person lane of the vault: real accounts, signed
// sessions and the per-project api keys (server-side truth). The supabase
// promise of the package.json finally answers: signup keeps the password
// only as a salted scrypt digest (`salthex:digesthex`, the family single-
// column law), signin verifies timing-safe and answers an HMAC-signed
// session bearer (nothing ever saves in a browser — the wire answer is the
// token alone, the client owns where it lives), and every project may mint
// vk_ keys whose raw secret answers exactly once at creation — the table
// keeps only the sha-256 digest, the list lane answers labels and the
// last-used stamp, never the key.
//
// The ownership law: a project carries the account pointer that minted it
// (null when the operator token created the scope), a session authorizes
// its own projects only, a key authorizes its project only, and the
// operator token stays total — the authorization matrix the api gate
// enforces. The public doors (signup, signin) demand no bearer, but the
// per-peer counter owns them: a burst answers 429 until the window rolls.
//
// @section validation — the email and password gates
// @section passwords — the scrypt digest law
// @section accounts — the create, the lookup and the verify
// @section sessions — the HMAC-signed bearer
// @section keys — the vk_ project bearers
// @section ownership — which projects an account may touch
// @section rate — the per-peer counter of the public doors

import { createHmac, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { and, desc, eq, sql } from "drizzle-orm";
import { db, execute, queryAll, queryOne } from "./db.ts";
import { accounts, projectKeys, projects, storage } from "./drizzle.ts";
import { QUOTA_FLOOR_BYTES } from "./quota.ts";
import { sha256Hex } from "./sha.ts";

/** @section validation */

/** the email shape the lane accepts: one @, dotted domain labels, no whitespace, bounded by the rfc ceiling of 254. */
const EMAIL_PATTERN = /^[^\s@]{1,64}@[^\s@.]+(\.[^\s@.]+)+$/;

/** the password floor the signup lane enforces (the ceiling keeps the scrypt input bounded). */
export const PASSWORD_MIN_CHARS = 8;
/** the password ceiling — a longer candidate is refused before scrypt ever runs. */
const PASSWORD_MAX_CHARS = 1024;
/** the label bounds of one project key (what the list lane answers). */
const KEY_LABEL_MAX_CHARS = 200;

/**
 * Answers whether one email carries the honest shape — one @, a dotted
 * domain, no whitespace, inside the rfc ceiling. The shape gate runs
 * before any store read, so a malformed candidate never costs a query.
 *
 * @param email the candidate email.
 * @returns true when the shape answers.
 */
export function emailValid(email: string): boolean {
  return email.length <= 254 && EMAIL_PATTERN.test(email);
}

/**
 * Normalizes one email — trimmed and lowered, the one form the lane stores
 * and looks up (the local part case never divides two accounts here).
 *
 * @param email the raw email the caller received.
 * @returns the normalized email, or the empty string when nothing answers.
 */
export function emailOf(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Answers whether one password carries the honest shape — at least the
 * floor of eight characters, inside the ceiling, no control characters.
 *
 * @param password the candidate password.
 * @returns true when the shape answers.
 */
export function passwordValid(password: string): boolean {
  return password.length >= PASSWORD_MIN_CHARS && password.length <= PASSWORD_MAX_CHARS && !carriesControl(password);
}

/**
 * Answers whether one label carries the honest shape — non-empty, bounded,
 * no control characters.
 *
 * @param label the candidate label.
 * @returns true when the shape answers.
 */
function labelValid(label: string): boolean {
  return label.length > 0 && label.length <= KEY_LABEL_MAX_CHARS && !carriesControl(label);
}

/** the control-code walk (a regex class of escapes trips the lint lane — the loop answers the same verdict). */
function carriesControl(text: string): boolean {
  for (const character of text) {
    const point = character.codePointAt(0) ?? 0;
    if (point < 0x20 || point === 0x7f) {
      return true;
    }
  }
  return false;
}

/** @section passwords */

/** the scrypt profile of the vault — the family pin (N=16384, r=8, p=1) with the headroom the profile demands. */
const SCRYPT_OPTIONS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 } as const;
/** the derived key width of the scrypt digest (64 bytes, 128 hex chars). */
const SCRYPT_KEY_BYTES = 64;
/** the fresh salt width per password (32 bytes, 64 hex chars). */
const PASSWORD_SALT_BYTES = 32;

/**
 * Hashes one password — a fresh random salt, the scrypt digest under it,
 * and the single-column family form `salthex:digesthex` the row keeps. The
 * plaintext never lands anywhere.
 *
 * @param password the plaintext password (the digest only).
 * @returns the stored form of the digest.
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(PASSWORD_SALT_BYTES);
  return `${salt.toString("hex")}:${scryptSync(password, salt, SCRYPT_KEY_BYTES, SCRYPT_OPTIONS).toString("hex")}`;
}

/**
 * Verifies one password against its stored digest — the salt parses, the
 * attempt re-derives and the comparison rides timingSafeEqual; any
 * malformed stored form or failing derivation refuses identically (the
 * answer never says which half failed).
 *
 * @param password the plaintext attempt (the digest only, never stored, never logged).
 * @param stored the stored `salthex:digesthex` form.
 * @returns true when the password answers for the digest.
 */
export function passwordMatches(password: string, stored: string): boolean {
  const separator = stored.indexOf(":");
  if (separator <= 0) {
    return false;
  }
  try {
    const computed = scryptSync(
      password,
      Buffer.from(stored.slice(0, separator), "hex"),
      SCRYPT_KEY_BYTES,
      SCRYPT_OPTIONS,
    );
    const expected = Buffer.from(stored.slice(separator + 1), "hex");
    return computed.length === expected.length && timingSafeEqual(computed, expected);
  } catch {
    return false;
  }
}

/** @section accounts */

/**
 * The error the account lane throws when a signing door runs without its
 * secret — a loud, typed refusal, never a silent fallback.
 */
export class AccountLaneError extends Error {}

/** One account as the read surface answers it — the digest never rides. */
export interface AccountRow {
  /** the account identity (acct-* pointer) */
  id: string;
  /** the normalized email */
  email: string;
  /** the creation datetime of the row */
  createdAt: string;
}

/** the refusal the account create answers (the route maps the machine codes). */
export type AccountRefusal = { kind: "invalid" | "taken"; why: string };

/** the explicit column projection every account read answers (no select *). */
const ACCOUNT_COLUMNS = { id: accounts.id, email: accounts.email, createdAt: accounts.createdAt };

/**
 * Creates one account — the normalized email, a fresh salt and the scrypt
 * digest of the password. A taken email refuses; the standing digest never
 * rewrites. The plaintext never lands, never logs.
 *
 * @param email the raw email the caller received.
 * @param password the plaintext password (the digest only).
 * @returns the created account row, or the honest refusal.
 */
export function createAccount(email: string, password: string): { account?: AccountRow; refusal?: AccountRefusal } {
  const normalized = emailOf(email);
  if (!emailValid(normalized)) {
    return {
      refusal: { kind: "invalid", why: "the email must be one honest address — one @, a dotted domain, no spaces" },
    };
  }
  if (!passwordValid(password)) {
    return { refusal: { kind: "invalid", why: `the password must be at least ${PASSWORD_MIN_CHARS} characters` } };
  }
  const id = `acct-${randomUUID()}`;
  try {
    storage
      .insert(accounts)
      .values({ id, email: normalized, passwordHash: hashPassword(password) })
      .run();
  } catch {
    return { refusal: { kind: "taken", why: `the email "${normalized}" already holds an account` } };
  }
  const row = storage.select(ACCOUNT_COLUMNS).from(accounts).where(eq(accounts.id, id)).get();
  if (row === undefined) {
    throw new Error(`the account row "${id}" did not land`);
  }
  return { account: row };
}

/**
 * Verifies one signin attempt — the account lookup by normalized email,
 * then the timing-safe scrypt compare. An absent account burns the same
 * scrypt round against a fixed dummy digest (the timing-equalizer law), so
 * the refusal cost never says whether the email answers.
 *
 * @param email the raw email the caller received.
 * @param password the plaintext attempt (the digest only).
 * @returns the account row on the match, undefined on any refusal.
 */
export function verifyCredentials(email: string, password: string): AccountRow | undefined {
  const normalized = emailOf(email);
  const row =
    normalized === ""
      ? undefined
      : storage
          .select({ ...ACCOUNT_COLUMNS, passwordHash: accounts.passwordHash })
          .from(accounts)
          .where(eq(accounts.email, normalized))
          .get();
  if (row === undefined) {
    passwordMatches(password, DUMMY_PASSWORD_HASH);
    return undefined;
  }
  return passwordMatches(password, row.passwordHash)
    ? { id: row.id, email: row.email, createdAt: row.createdAt }
    : undefined;
}

/** the fixed dummy salt the timing equalizer burns against (a plain 64-hex constant — no meaning, only timing). */
const DUMMY_SALT_HEX = "0f1e2d3c4b5a69788796a5b4c3d2e1f00f1e2d3c4b5a69788796a5b4c3d2e1f0";
/** the fixed dummy digest the timing equalizer burns against (deterministic per process). */
const DUMMY_PASSWORD_HASH = `${DUMMY_SALT_HEX}:${scryptSync(
  "vault-timing-equalizer",
  Buffer.from(DUMMY_SALT_HEX, "hex"),
  SCRYPT_KEY_BYTES,
  SCRYPT_OPTIONS,
).toString("hex")}`;

/** @section sessions */

/** the session bearer prefix the gate recognizes. */
export const SESSION_PREFIX = "vs_";
/** the session lifetime the lane mints by default — one week (VAULT_SESSION_TTL overrides, in seconds). */
const SESSION_DEFAULT_TTL_SECONDS = 7 * 24 * 60 * 60;
/** the signed bearer shape: vs_<account>.<expiry-epoch-ms>.<hmac-sha-256>. */
const SESSION_PATTERN = /^vs_[a-z0-9-]{1,80}\.\d{10,16}\.[a-f0-9]{64}$/;

/**
 * The session secret — the operator's own pin (VAULT_SESSION_SECRET) or,
 * absent that, a derivation of the vault token: one honest key either way,
 * never a hardcoded one. The secret resolves per call, so the operator may
 * rotate it without a reboot.
 *
 * @returns the hmac key, or undefined when neither door is configured.
 */
function sessionSecret(): Buffer | undefined {
  const material = process.env.VAULT_SESSION_SECRET || process.env.VAULT_TOKEN;
  if (typeof material !== "string" || material.length === 0) {
    return undefined;
  }
  return createHmac("sha256", material).update("vault-session-key-v1").digest();
}

/**
 * Answers whether the session lane is armed — the honest readiness the
 * sealed refusal reads (an environment without any secret seals the
 * account doors, fail closed).
 *
 * @returns true when the signing secret answers.
 */
export function sessionSecretConfigured(): boolean {
  return sessionSecret() !== undefined;
}

/**
 * The session lifetime in seconds — VAULT_SESSION_TTL when it answers an
 * honest integer, the one-week default otherwise.
 *
 * @returns the configured ttl.
 */
export function sessionTtlSeconds(): number {
  const raw = process.env.VAULT_SESSION_TTL;
  const parsed = typeof raw === "string" ? Number(raw) : Number.NaN;
  return Number.isInteger(parsed) && parsed >= 1 ? parsed : SESSION_DEFAULT_TTL_SECONDS;
}

/** One issued session as the caller receives it (the plaintext token answers once). */
export interface SessionIssued {
  /** the signed bearer — vs_<account>.<expiry>.<hmac> */
  token: string;
  /** the account the session belongs to */
  accountId: string;
  /** the expiry epoch milliseconds */
  expiresAt: number;
}

/** One live session as the verify surface answers it. */
export interface SessionView {
  /** the account the session belongs to */
  accountId: string;
  /** the expiry epoch milliseconds */
  expiresAt: number;
}

/**
 * Mints one session for an account — the payload is the account pointer
 * and the expiry epoch, the signature the HMAC-SHA256 of both under the
 * session secret. Stateless by design: no session rows, the signature and
 * the clock carry the truth, and a rotated secret retires every standing
 * bearer at once.
 *
 * @param accountId the account the session belongs to.
 * @param ttlSeconds the lifetime override (default the configured ttl; a
 *   non-positive value mints an already-expired bearer — the tests ride it).
 * @returns the signed bearer and its expiry.
 * @throws AccountLaneError when no secret is configured (the routes check first, fail closed).
 */
export function issueSession(accountId: string, ttlSeconds = sessionTtlSeconds()): SessionIssued {
  const secret = sessionSecret();
  if (secret === undefined) {
    throw new AccountLaneError("the session secret is not configured — set VAULT_SESSION_SECRET or VAULT_TOKEN");
  }
  const expiresAt = Date.now() + ttlSeconds * 1000;
  const payload = `${accountId}.${expiresAt}`;
  const signature = createHmac("sha256", secret).update(`vault-session:${payload}`).digest("hex");
  return { token: `${SESSION_PREFIX}${payload}.${signature}`, accountId, expiresAt };
}

/**
 * Verifies one session bearer — the shape gate first (garbage refuses
 * before any key or store read), then the recomputed HMAC compared
 * timing-safe, then the clock: an expired signature refuses like a wrong
 * one, with no hint about which half failed.
 *
 * @param token the bearer the caller presented.
 * @returns the live session view, or undefined on any refusal.
 */
export function verifySession(token: string): SessionView | undefined {
  if (!SESSION_PATTERN.test(token)) {
    return undefined;
  }
  const secret = sessionSecret();
  if (secret === undefined) {
    return undefined;
  }
  const body = token.slice(SESSION_PREFIX.length);
  const signatureAt = body.lastIndexOf(".");
  const payload = body.slice(0, signatureAt);
  const expected = createHmac("sha256", secret).update(`vault-session:${payload}`).digest();
  const presented = Buffer.from(body.slice(signatureAt + 1), "hex");
  if (presented.length !== expected.length || !timingSafeEqual(presented, expected)) {
    return undefined;
  }
  const accountAt = payload.lastIndexOf(".");
  const expiresAt = Number(payload.slice(accountAt + 1));
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Date.now()) {
    return undefined;
  }
  return { accountId: payload.slice(0, accountAt), expiresAt };
}

/** @section keys */

/** the project key prefix the gate recognizes. */
export const KEY_PREFIX = "vk_";
/** the raw entropy of one key secret (32 bytes, 64 hex chars). */
const KEY_RANDOM_BYTES = 32;
/** the minted bearer shape: vk_<64 hex chars>. */
const KEY_PATTERN = /^vk_[a-f0-9]{64}$/;

/** One project key as the list surface answers it — the digest never rides. */
export interface ProjectKeyRow {
  /** the key identity (pk-* pointer) */
  id: string;
  /** the project the key authorizes */
  projectId: string;
  /** the human label */
  label: string;
  /** the creation datetime of the row */
  createdAt: string;
  /** the last use datetime — null until the key first rides the gate */
  lastUsedAt: string | null;
}

/** the refusal the key mint answers (the route maps the machine codes). */
export type KeyRefusal = { kind: "invalid" | "absent"; why: string };

/** the explicit column projection every key read answers (no select *). */
const KEY_COLUMNS = {
  id: projectKeys.id,
  projectId: projectKeys.projectId,
  label: projectKeys.label,
  createdAt: projectKeys.createdAt,
  lastUsedAt: projectKeys.lastUsedAt,
};

/**
 * Mints one project key — a fresh vk_ secret, only its sha-256 digest in
 * the row. The raw secret answers exactly once, in this call's answer; the
 * list lane never carries it again.
 *
 * @param projectId the project the key authorizes.
 * @param label the human label (trimmed; the honest bounds enforced).
 * @returns the key row with the one-time secret, or the honest refusal.
 */
export function createProjectKey(
  projectId: string,
  label: string,
): { key?: ProjectKeyRow; secret?: string; refusal?: KeyRefusal } {
  const cleanLabel = label.trim();
  if (!labelValid(cleanLabel)) {
    return {
      refusal: { kind: "invalid", why: `the key label must be 1-${KEY_LABEL_MAX_CHARS} characters, no control codes` },
    };
  }
  const project = storage.select({ id: projects.id }).from(projects).where(eq(projects.id, projectId)).get();
  if (project === undefined) {
    return { refusal: { kind: "absent", why: `the project "${projectId}" does not exist — create it first` } };
  }
  const secret = `${KEY_PREFIX}${randomBytes(KEY_RANDOM_BYTES).toString("hex")}`;
  const id = `pk-${randomUUID()}`;
  storage
    .insert(projectKeys)
    .values({ id, projectId, keyHash: sha256Hex(secret), label: cleanLabel })
    .run();
  const row = storage.select(KEY_COLUMNS).from(projectKeys).where(eq(projectKeys.id, id)).get();
  if (row === undefined) {
    throw new Error(`the project key row "${id}" did not land`);
  }
  return { key: row, secret };
}

/**
 * Lists the keys of one project — newest first, the labels and the
 * last-used stamps only, never a digest and never a secret.
 *
 * @param projectId the owning project.
 * @returns the key rows.
 */
export function listProjectKeys(projectId: string): ProjectKeyRow[] {
  return storage
    .select(KEY_COLUMNS)
    .from(projectKeys)
    .where(eq(projectKeys.projectId, projectId))
    .orderBy(desc(projectKeys.createdAt), desc(projectKeys.id))
    .all();
}

/**
 * Revokes one key of one project — the delete is scoped to both pointers,
 * so a key id from another project never answers.
 *
 * @param projectId the owning project.
 * @param keyId the key identity to revoke.
 * @returns true when a key row left.
 */
export function revokeProjectKey(projectId: string, keyId: string): boolean {
  return (
    storage
      .delete(projectKeys)
      .where(and(eq(projectKeys.id, keyId), eq(projectKeys.projectId, projectId)))
      .run().changes > 0
  );
}

/**
 * Resolves one vk_ bearer — the shape gate, the sha-256 digest lookup and
 * the last-used stamp in one pass: a key that just rode the gate answers
 * with its project, a revoked or unknown secret refuses like any garbage
 * bearer. The stamp rides the resolution itself, so every authorized ride
 * is also the honest "last seen" answer.
 *
 * @param presented the raw bearer the caller presented.
 * @returns the key identity and its project, or undefined on any refusal.
 */
export function resolveProjectKey(presented: string): { keyId: string; projectId: string } | undefined {
  if (!KEY_PATTERN.test(presented)) {
    return undefined;
  }
  const row = storage
    .select({ id: projectKeys.id, projectId: projectKeys.projectId })
    .from(projectKeys)
    .where(eq(projectKeys.keyHash, sha256Hex(presented)))
    .get();
  if (row === undefined) {
    return undefined;
  }
  storage.update(projectKeys).set({ lastUsedAt: sql`datetime('now')` }).where(eq(projectKeys.id, row.id)).run();
  return { keyId: row.id, projectId: row.projectId };
}

/** @section ownership */

/**
 * The owner of one project — undefined when the scope is absent, null when
 * the operator token minted it (no account owns it), the account pointer
 * otherwise. The authorization matrix reads this one answer.
 *
 * @param projectId the project to read.
 * @returns the owner pointer, null, or undefined when the scope is absent.
 */
export function projectOwner(projectId: string): string | null | undefined {
  const row = storage.select({ accountId: projects.accountId }).from(projects).where(eq(projects.id, projectId)).get();
  return row === undefined ? undefined : (row.accountId ?? null);
}

/**
 * Answers whether one account owns one project — the session lane's whole
 * authorization verdict.
 *
 * @param accountId the account the session belongs to.
 * @param projectId the project in question.
 * @returns true when the account minted the scope.
 */
export function projectOwnedBy(accountId: string, projectId: string): boolean {
  return projectOwner(projectId) === accountId;
}

/** @section rate */

/** the public-door window: one minute per peer. */
const AUTH_RATE_WINDOW_MS = 60_000;
/** the default ceiling per window per peer (VAULT_AUTH_RATE_MAX overrides). */
const AUTH_RATE_DEFAULT_MAX = 30;
/** the lazy-sweep threshold — an expired bucket leaves once the map grows past it. */
const AUTH_RATE_SWEEP_AT = 4096;

/** One counter bucket of the public doors (the in-memory law — the counter dies with the process). */
interface AuthRateBucket {
  /** the calls already answered inside the window */
  count: number;
  /** the epoch milliseconds the window rolls at */
  resetAt: number;
}

/** the per-peer buckets of the public doors. */
const authRateBuckets = new Map<string, AuthRateBucket>();

/** the verdict the counter answers. */
export interface AuthRateVerdict {
  /** true while the peer sits under the ceiling */
  allowed: boolean;
  /** the seconds until the window rolls (0 while allowed) */
  retryAfterSeconds: number;
}

/**
 * Counts one public-door call — the peer's bucket refreshes its window on
 * the first hit and climbs afterwards; past the ceiling every further call
 * answers refused until the window rolls. The sweep drops the expired
 * buckets of other peers once the map grows, so the counter never climbs
 * without bound (the saddle ratelimit law, the vault dialect).
 *
 * @param peer the peer address the counter keys on.
 * @returns the verdict plus the retry window.
 */
export function authRateVerdict(peer: string): AuthRateVerdict {
  const now = Date.now();
  if (authRateBuckets.size > AUTH_RATE_SWEEP_AT) {
    for (const [key, bucket] of authRateBuckets) {
      if (bucket.resetAt <= now) {
        authRateBuckets.delete(key);
      }
    }
  }
  const bucket = authRateBuckets.get(peer);
  if (bucket === undefined || bucket.resetAt <= now) {
    authRateBuckets.set(peer, { count: 1, resetAt: now + AUTH_RATE_WINDOW_MS });
    return { allowed: true, retryAfterSeconds: 0 };
  }
  bucket.count += 1;
  return {
    allowed: bucket.count <= authRateMax(),
    retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
  };
}

/** the configured ceiling — VAULT_AUTH_RATE_MAX when it answers an honest integer, the default otherwise. */
function authRateMax(): number {
  const raw = process.env.VAULT_AUTH_RATE_MAX;
  const parsed = typeof raw === "string" ? Number(raw) : Number.NaN;
  return Number.isInteger(parsed) && parsed >= 1 ? parsed : AUTH_RATE_DEFAULT_MAX;
}

/**
 * Clears the counter — the test-harness hook (the closeStorage precedent):
 * a battery that pins the ceiling rides a fresh map without waiting for
 * the window to roll.
 */
export function resetAuthRateLimiter(): void {
  authRateBuckets.clear();
}

/* ===== block: signup ===== */
// # signup — the signup lane of the vault storage engine (the wave D
// rewire): the person's door onto the network database. The full flow the
// supabase-law product answers: the user signs up (an account on the site
// store, the password stored only as the salted scrypt digest — the
// accounts.ts family law, never plaintext at rest), registers an app/database, and gets their
// own Database ID plus an API key displayed exactly once — the plaintext key
// rides exactly the one creation answer and never lands anywhere else: not
// in the database (only its scrypt digest is stored), not in any log, never
// persisted in the browser (the face holds it in memory for the one display
// and drops it with the session — no localStorage, no cookies, no session
// storage; the security law of the vault).
//
// Every database is a bucket: its own sqlite file under the databases
// directory (the per-database routing the /v2/query lane rides), its own
// quota row (the per-bucket quota, configurable, the generous 900MB floor
// the family precedent answers at creation — never a fixed cap, never a
// ghost lock), and its own keys (issuable again, revocable, each hashed).
//
// All rows live on the site store of db.ts (the existing db lane — the
// family storage law: the vault keeps its app tables on its own store),
// every statement prepared and bound, never concatenated.
//
// @section shapes — the account, database and key rows
// @section accounts — the signup and signin doors
// @section databases — the registration and the per-bucket quota
// @section keys — the issuance (shown once), the lookup and the revoke

/** @section shapes */

/** one account row: the person's identity on the site store (the password
 * never rides the row — only its salted digest). */
export interface SignupAccountRow {
  id: string;
  email: string;
  createdAt: string;
}

/** one database row: the registered app/database — the bucket the query
 * lane routes onto its own sqlite file. */
export interface DatabaseRow {
  id: string;
  accountId: string;
  name: string;
  /** the per-bucket quota in bytes — null means unlimited, the generous
   * 900MB floor answers at creation (never a fixed cap) */
  quotaBytes: bigint | null;
  createdAt: string;
}

/** one api key row: the hashed key of one database (the plaintext never
 * lands here — the digest alone, the sha-256 lane). */
export interface ApiKeyRow {
  id: string;
  databaseId: string;
  label: string;
  keyDigest: string;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
}

/** the raw sqlite projection of a database row (quotaBytes rides the 64-bit cell). */
type DatabaseRowSql = {
  id: string;
  accountId: string;
  name: string;
  quotaBytes: number | bigint | null;
  createdAt: string;
};

/** the raw sqlite projection of an api key row. */
type ApiKeyRowSql = {
  id: string;
  databaseId: string;
  label: string;
  keyDigest: string;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
};

/** widens one raw database row into the honest row (the quota becomes a real bigint). */
function databaseRowOf(row: DatabaseRowSql): DatabaseRow {
  return {
    id: row.id,
    accountId: row.accountId,
    name: row.name,
    quotaBytes: row.quotaBytes === null ? null : BigInt(row.quotaBytes),
    createdAt: row.createdAt,
  };
}

/** widens one raw api key row into the honest row. */
function apiKeyRowOf(row: ApiKeyRowSql): ApiKeyRow {
  return { ...row };
}

/** @section accounts */

/** the email shape the signup lane accepts (a local part, one @, a domain). */
const SIGNUP_EMAIL_PATTERN = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{1,24}$/;

/** the shortest password the lane accepts (the honest floor, no complexity theatre). */
export const PASSWORD_FLOOR = 8;

/**
 * Validates an email for the signup lane.
 *
 * @param email the candidate email.
 * @returns true when the email answers the shape.
 */
export function signupEmailValid(email: string): boolean {
  return SIGNUP_EMAIL_PATTERN.test(email);
}

// The password digest law lives in accounts.ts (hashPassword /
// passwordMatches — the salted scrypt family lane, the timing-safe verify):
// this signup lane answers it without carrying a duplicate (the
// no-duplication law between the files of the house).

/** the typed refusal the signup lane answers. */
export type SignupRefusal =
  | { kind: "invalid"; why: string }
  | { kind: "taken"; why: string }
  | { kind: "absent"; why: string }
  | { kind: "wrong"; why: string };

/** the signup answer: the account row, or the refusal. */
export type SignupAnswer = { account: SignupAccountRow } | { refusal: SignupRefusal };

/**
 * Signs one person up — the account lands on the site store with only the
 * salted digest of the password; the plaintext never touches the store.
 * Idempotence refuses honestly: a taken email answers the taken refusal.
 *
 * @param email the person's email.
 * @param password the plaintext password (digested, never stored).
 * @returns the account row, or the refusal.
 */
export function signupAccount(email: string, password: string): SignupAnswer {
  const trimmed = email.trim().toLowerCase();
  if (!signupEmailValid(trimmed)) {
    return { refusal: { kind: "invalid", why: "the email does not answer the mail shape" } };
  }
  if (password.length < PASSWORD_FLOOR) {
    return { refusal: { kind: "invalid", why: `the password needs at least ${PASSWORD_FLOOR} characters` } };
  }
  if (queryOne("SELECT id FROM accounts WHERE email = ?", [trimmed]) !== undefined) {
    return { refusal: { kind: "taken", why: `the email ${trimmed} already answers an account — sign in` } };
  }
  const id = `acc-${randomBytes(8).toString("hex")}`;
  execute(
    "INSERT INTO accounts (id, email, passwordDigest, createdAt) VALUES (?, ?, ?, datetime('now'))",
    [id, trimmed, hashPassword(password)],
  );
  const row = queryOne<{ id: string; email: string; createdAt: string }>(
    "SELECT id, email, createdAt FROM accounts WHERE id = ?",
    [id],
  );
  if (row === undefined) {
    return { refusal: { kind: "absent", why: "the account write did not land" } };
  }
  return { account: row };
}

/** the signin answer: the account row with its databases, or the refusal. */
export type SigninAnswer = { account: SignupAccountRow; databases: DatabaseRow[] } | { refusal: SignupRefusal };

/**
 * Signs one person in — the digest of the presented password against the
 * stored digest (the same salted sha-256 lane), the account row and its
 * databases answering on success.
 *
 * @param email the person's email.
 * @param password the presented password.
 * @returns the account with its databases, or the refusal.
 */
export function signinAccount(email: string, password: string): SigninAnswer {
  const trimmed = email.trim().toLowerCase();
  const row = queryOne<{ id: string; email: string; passwordDigest: string; createdAt: string }>(
    "SELECT id, email, passwordDigest, createdAt FROM accounts WHERE email = ?",
    [trimmed],
  );
  if (row === undefined) {
    return { refusal: { kind: "absent", why: `no account answers ${trimmed}` } };
  }
  if (!passwordMatches(password, row.passwordDigest)) {
    return { refusal: { kind: "wrong", why: "the password does not answer the account" } };
  }
  return {
    account: { id: row.id, email: row.email, createdAt: row.createdAt },
    databases: databasesOfAccount(row.id),
  };
}

/** the account row of one id (the internal lane the routes ride). */
export function accountOf(accountId: string): SignupAccountRow | undefined {
  return queryOne<{ id: string; email: string; createdAt: string }>(
    "SELECT id, email, createdAt FROM accounts WHERE id = ?",
    [accountId],
  );
}

/** the account row of one email (the credential lane the register route rides). */
export function accountOfEmail(email: string): SignupAccountRow | undefined {
  return queryOne<{ id: string; email: string; createdAt: string }>(
    "SELECT id, email, createdAt FROM accounts WHERE email = ?",
    [email.trim().toLowerCase()],
  );
}

/** every person database of one email — the signin answer lane (an email
 * without a person row answers the empty list, never a refusal: the two
 * doors answer one person, the operator surface and the person's door). */
export function databasesOfEmail(email: string): DatabaseRow[] {
  const account = accountOfEmail(email);
  return account === undefined ? [] : databasesOfAccount(account.id);
}

/** Provisions the person row for a caller the accounts door verified — the
 * two doors answer one person: the accounts door (the operator surface)
 * creates its own row, and the person row lands here on first use so the
 * register lane always finds the credential it verified. Idempotent: an
 * existing person row answers as-is.
 *
 * @param email the caller's email (verified by the accounts door).
 * @param password the verified password (its digest lands, never the word).
 * @returns the person account row.
 */
export function ensurePersonAccount(email: string, password: string): SignupAccountRow {
  const existing = accountOfEmail(email);
  if (existing !== undefined) {
    return existing;
  }
  const landed = signupAccount(email, password);
  if ("account" in landed) {
    return landed.account;
  }
  throw new Error(landed.refusal?.why ?? "the person row did not land");
}

/**
 * Verifies the account credentials — the door the register and key routes
 * ride beside the bearer lanes (the digest comparison, never the plaintext).
 *
 * @param email the person's email.
 * @param password the presented password.
 * @returns the account row, or undefined when the door refuses.
 */
export function accountVerified(email: string, password: string): SignupAccountRow | undefined {
  const row = queryOne<{ id: string; passwordDigest: string }>(
    "SELECT id, passwordDigest FROM accounts WHERE email = ?",
    [email.trim().toLowerCase()],
  );
  if (row === undefined || !passwordMatches(password, row.passwordDigest)) {
    return undefined;
  }
  return accountOf(row.id);
}

/** @section databases */

/** the database id shape: db- plus 12 hex chars (filesystem-safe, the
 * per-database file routing rides it — never a traversal window). */
export const DATABASE_ID_PATTERN = /^db-[0-9a-f]{12}$/;

/** the database name floor: 1-64 honest characters. */
const DATABASE_NAME_PATTERN = /^.{1,64}$/;

/**
 * Validates a database id (the routing shape the query lane rides).
 *
 * @param id the candidate database id.
 * @returns true when the id answers the shape.
 */
export function databaseIdValid(id: string): boolean {
  return DATABASE_ID_PATTERN.test(id);
}

/** the register answer: the database row plus the plaintext key shown
 * exactly once — the only answer the plaintext ever rides. */
export interface RegisterAnswer {
  database: DatabaseRow;
  /** the plaintext api key — shown exactly once, never stored, never
   * re-answered by any later read */
  key: string;
  /** the key row id (for later revocation — the digest alone is on it) */
  keyId: string;
}

/** the register refusal: an invalid shape, an absent account or wrong credentials. */
export type RegisterRefusal = SignupRefusal | { kind: "credentials"; why: string };

/**
 * Registers one app/database for a verified account — the bucket lands on
 * the site store with the generous quota floor (900MB, the family
 * precedent — configurable later, never a fixed cap), and the first api
 * key is issued in the same breath: the plaintext rides exactly this
 * answer (shown once), the store keeps only the digest.
 *
 * @param email the person's email (the credential door).
 * @param password the presented password.
 * @param name the database name the person pins.
 * @param quotaBytes the optional per-bucket quota override (null = unlimited).
 * @returns the database with its shown-once key, or the refusal.
 */
export function registerDatabase(
  email: string,
  password: string,
  name: string,
  quotaBytes: bigint | null = QUOTA_FLOOR_BYTES,
): { answer?: RegisterAnswer; refusal?: RegisterRefusal } {
  const account = accountVerified(email, password);
  if (account === undefined) {
    return { refusal: { kind: "credentials", why: "the account credentials do not answer" } };
  }
  if (!DATABASE_NAME_PATTERN.test(name)) {
    return { refusal: { kind: "invalid", why: "the database name needs 1-64 characters" } };
  }
  const id = `db-${randomBytes(6).toString("hex")}`;
  execute(
    `INSERT INTO databases (id, accountId, name, quotaBytes, createdAt) VALUES (?, ?, ?, ?, datetime('now'))`,
    [id, account.id, name, quotaBytes],
  );
  const row = queryOne<DatabaseRowSql>(
    "SELECT id, accountId, name, quotaBytes, createdAt FROM databases WHERE id = ?",
    [id],
  );
  if (row === undefined) {
    return { refusal: { kind: "absent", why: "the database write did not land" } };
  }
  const issued = insertApiKey(id, "the first key");
  if (issued === undefined) {
    return { refusal: { kind: "absent", why: "the first key did not land" } };
  }
  return { answer: { database: databaseRowOf(row), key: issued.key, keyId: issued.row.id } };
}

/** the database row of one id. */
export function databaseOf(id: string): DatabaseRow | undefined {
  const row = queryOne<DatabaseRowSql>("SELECT id, accountId, name, quotaBytes, createdAt FROM databases WHERE id = ?", [
    id,
  ]);
  return row === undefined ? undefined : databaseRowOf(row);
}

/** every database of one account, registration order. */
export function databasesOfAccount(accountId: string): DatabaseRow[] {
  return queryAll<DatabaseRowSql>(
    "SELECT id, accountId, name, quotaBytes, createdAt FROM databases WHERE accountId = ? ORDER BY createdAt ASC, id ASC",
    [accountId],
  ).map(databaseRowOf);
}

/**
 * Sets the per-bucket quota of one database — the owner's word is the law:
 * decimal bytes at any scale or null to remove the limit entirely (the
 * 2GB-lock removal the wave answers: no fixed cap lives anywhere).
 *
 * @param id the database id.
 * @param quotaBytes the limit in bytes, null for unlimited.
 * @returns the database row after the write, or undefined when the id answers nothing.
 */
export function setDatabaseQuota(id: string, quotaBytes: bigint | null): DatabaseRow | undefined {
  execute("UPDATE databases SET quotaBytes = ? WHERE id = ?", [quotaBytes, id]);
  return databaseOf(id);
}

/** @section keys */

/** the prefix every issued api key carries (the honest shape the operator reads). */
export const API_KEY_PREFIX = "vault_";

/** the issuance answer: the plaintext key (shown once) and its stored row. */
interface IssuedKey {
  key: string;
  row: ApiKeyRow;
}

/** mints one api key: 48 hex chars of crypto randomness behind the prefix. */
function mintApiKey(): string {
  return `${API_KEY_PREFIX}${randomBytes(24).toString("hex")}`;
}

/**
 * Inserts one key row for a database — the digest alone lands on the store,
 * the plaintext returns exactly once to the caller that shows it exactly
 * once. Prepared and bound; the plaintext never rides a statement.
 */
function insertApiKey(databaseId: string, label: string): IssuedKey | undefined {
  const key = mintApiKey();
  const id = randomUUID();
  execute(
    `INSERT INTO apikeys (id, databaseId, label, keyDigest, createdAt) VALUES (?, ?, ?, ?, datetime('now'))`,
    [id, databaseId, label, sha256Hex(key)],
  );
  const row = queryOne<ApiKeyRowSql>(
    "SELECT id, databaseId, label, keyDigest, createdAt, lastUsedAt, revokedAt FROM apikeys WHERE id = ?",
    [id],
  );
  if (row === undefined) return undefined;
  return { key, row: apiKeyRowOf(row) };
}

/** the issue answer: the plaintext key shown exactly once plus its row id. */
export interface IssueKeyAnswer {
  key: string;
  keyId: string;
}

/**
 * Issues one more api key for a database — the shown-once law again: the
 * plaintext rides exactly this answer, the store keeps only the digest.
 *
 * @param databaseId the database the key opens.
 * @param label the label the operator pins on the key row.
 * @returns the key with its row id, or undefined when the database answers nothing.
 */
export function issueApiKey(databaseId: string, label = "a key"): IssueKeyAnswer | undefined {
  if (databaseOf(databaseId) === undefined) return undefined;
  const issued = insertApiKey(databaseId, label);
  if (issued === undefined) return undefined;
  return { key: issued.key, keyId: issued.row.id };
}

/** the lookup answer of a presented key: the live key row of its database. */
export type ApiKeyLookup = { key: ApiKeyRow; database: DatabaseRow } | { refusal: SignupRefusal };

/**
 * Looks one presented api key up — the auth lane the /v2/query gate rides:
 * the digest of the presented key against the stored digests (sha-256, the
 * security law), the revoked keys refused, the last-use stamp honest.
 * The plaintext never lands anywhere.
 *
 * @param presentedKey the plaintext key the caller presented.
 * @returns the live key row with its database, or the refusal.
 */
export function apiKeyLookup(presentedKey: string): ApiKeyLookup {
  const digest = sha256Hex(presentedKey);
  const row = queryOne<ApiKeyRowSql>(
    "SELECT id, databaseId, label, keyDigest, createdAt, lastUsedAt, revokedAt FROM apikeys WHERE keyDigest = ?",
    [digest],
  );
  if (row === undefined) {
    return { refusal: { kind: "absent", why: "the key answers no vault" } };
  }
  if (row.revokedAt !== null) {
    return { refusal: { kind: "wrong", why: "the key was revoked — issue another" } };
  }
  const database = databaseOf(row.databaseId);
  if (database === undefined) {
    return { refusal: { kind: "absent", why: "the key answers no database" } };
  }
  execute("UPDATE apikeys SET lastUsedAt = datetime('now') WHERE id = ?", [row.id]);
  const stamped = queryOne<ApiKeyRowSql>(
    "SELECT id, databaseId, label, keyDigest, createdAt, lastUsedAt, revokedAt FROM apikeys WHERE id = ?",
    [row.id],
  );
  return { key: apiKeyRowOf(stamped ?? row), database };
}

/**
 * Revokes one api key — the operator's word: the key row keeps its digest
 * (the audit trail) but answers no vault from the revoke on.
 *
 * @param keyId the key row id.
 * @returns true when a live key was revoked.
 */
export function revokeApiKey(keyId: string): boolean {
  const before = queryOne<{ id: string }>("SELECT id FROM apikeys WHERE id = ? AND revokedAt IS NULL", [keyId]);
  if (before === undefined) return false;
  execute("UPDATE apikeys SET revokedAt = datetime('now') WHERE id = ?", [keyId]);
  return true;
}

/** every key row of one database (the digests alone — the audit lane). */
export function apiKeysOf(databaseId: string): ApiKeyRow[] {
  return queryAll<ApiKeyRowSql>(
    "SELECT id, databaseId, label, keyDigest, createdAt, lastUsedAt, revokedAt FROM apikeys WHERE databaseId = ? ORDER BY createdAt ASC",
    [databaseId],
  ).map(apiKeyRowOf);
}

/** the site store seat the signup lane rides (the tests and the routes share the lane). */
export const siteStore = db;
