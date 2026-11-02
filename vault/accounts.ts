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
import { accounts, projectKeys, projects, storage } from "./drizzle.ts";
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
