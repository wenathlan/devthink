// # account.ts — the one keyword file of the account domain: the
// consolidation law of the root (one keyword file per domain) merged the
// two seats of the person surface into this seat — the person lane of the
// vault (the former accounts.ts body below: the validation gates, the
// scrypt digest law, the account create and verify lanes, the HMAC-signed
// session bearers, the vk_ project keys, the ownership matrix, the
// per-peer rate counter and the signup lane of the wave D rewire) and the
// vault http surface (the former api.ts: the token gate and the three
// doors of the faun lesson, the route catalog, the node:http server and
// its boot, the storage handlers, the dist lane of the container doctrine
// and the person's doors — the signup, the database and the query lanes)
// — every export preserved verbatim, zero logic changes, the route
// dispatch untouched (the signup, signin, register and query lanes answer
// the same shapes over the same port).
// The consolidation notes: the imports of the two seats ride merged at the
// top of this file, and the two import blocks the http seat carried from
// accounts.ts dissolved — their bindings answer the local declarations of
// the person lane above. The query lane import of the http seat closes the
// one cycle of the seat: querylane.ts reads this file's database lanes,
// this file reads its query verdict and run lanes, and every crossing is a
// function declaration, so both orders of the import answer the same
// bindings. No helper was duplicated between the seats and no same-name
// declaration met the merge, so every const, helper, type and section
// keeps the name it rode in its seat. The direct boot block of the http
// surface stays at the tail — node account.ts serves the storage truth
// the way node api.ts did before the merge.

import { createHash, createHmac, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import type { IncomingMessage, Server, ServerResponse } from "node:http";
import { createServer } from "node:http";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import { and, desc, eq, sql } from "drizzle-orm";
import { decoyledger, isprobe } from "./decoy.ts";
import { db, execute, queryAll, queryOne } from "./db.ts";
import { accounts, projectKeys, projects, storage, storageDriverKind } from "./drizzle.ts";
import { internalRootDir, serveInternal } from "./internalroot.ts";
import {
  createProject,
  DEFAULT_BUCKET,
  deleteObject,
  getObject,
  type LedgerObject,
  listObjects,
  listProjects,
  objectProjectOf,
  putObject,
  storageCensus,
  sweepOrphans,
  usageOf,
} from "./objects.ts";
import { PILLARS, PILLAR_COUNT, pillarRouteOf, type PillarRow } from "./pillars.ts";
import { PROTOCOL_ROUTE_COUNT, PROTOCOLS, protocolRouteOf, type ProtocolRow } from "./protocols.ts";
import { queryVerdict, runQuery } from "./querylane.ts";
import { type QuotaVerdict, QUOTA_FLOOR_BYTES, quotaLimitFrom, quotaVerdict, readQuota, setQuota } from "./quota.ts";
import { routes } from "./routes.ts";
import { sha256Hex } from "./sha.ts";
import { ensureuicopyingested, uistoreget, uistorelist } from "./uistore.ts";

/* ════════════════════════════════════════════════════════════════════ */
/* SECTION: accounts.ts — the person lane of the vault (the first seat). */
/* ════════════════════════════════════════════════════════════════════ */

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


/* ════════════════════════════════════════════════════════════════════ */
/* SECTION: api.ts — the vault http surface (the second seat).          */
/* ════════════════════════════════════════════════════════════════════ */

// # api — the vault http surface: the real storage routes over pure
// node:http (zero dependencies, the saddle webserver discipline). The server
// is the whole truth of the engine — every route rides the real ledger,
// the real sha-256 digests and the real quota verdicts; nothing is cached
// or held in the person's browser. Objects travel as raw bodies with the
// x-object-path / x-object-mime / x-project-id headers (multipart parsing
// is a later rung — the raw body answers every byte today). Failures answer
// the standardized { error: { code, message } } shape, bigint pointers
// travel as decimal strings, and every fallible path is guarded.
//
// The container doctrine adds the site face: when a static root answers
// (VAULT_STATIC_DIR, default ./dist), the same server serves the built
// site beside the storage routes — real files with real content types, the
// spa fallback the platform lanes ride, and the faun seal held again (a
// database file never answers from the static lane, not even a stray one
// inside the root).
//
// The wave D rewire (the supabase-law storage engine): beside the operator
// gate the vault answers the person's door — the signup lane (an account,
// a registered database, an api key shown exactly once, stored hashed),
// the helix-style /v2/query lane (bearer plus database-id headers over the
// per-database sqlite files of the better-sqlite3 core), the protocols
// pillar (every wire of the catalog answers its own static-safe route) and
// the internal root (the static site surface with the correct content type
// for every file type — and the faun law enforced: the raw .db never rides
// the static root, database data flows only through these api lanes).
//
// The faun lesson owns the door: the storage truth is the network database
// of the family, and no request reaches it without an honest bearer. The
// health probe stays open so the platform can watch the service; every
// data route — the deposits, the listings, the verified reads, the
// removals, the quotas, the usage and the sweep — refuses without one and
// stays sealed (503, fail closed) while no door is configured at all.
//
// The accounts wave widens the door honestly: the operator bearer
// (VAULT_TOKEN) stays the total admin — every standing caller keeps
// riding — while two more bearers answer beside it, each scoped: the vk_
// project key authorizes its own project only (the gate stamps its
// last-used), and the vs_ session token authorizes the projects of its
// account. A route that names a project (or serves an object of one)
// answers 403 VAULT_FORBIDDEN when the caller's scope does not hold it.
// The account doors themselves — the signup and the signin — stay public:
// no operator token, only the per-peer rate counter and the fail-closed
// session secret (VAULT_SESSION_SECRET, or the derivation of VAULT_TOKEN).
// The signin answer is the signed bearer alone — nothing ever saves in a
// browser, the client owns where the token lives.
//
// @section auth — the token gate and the three doors (the faun lesson)
// @section routes — the route catalog
// @section server — the node:http server and its boot
// @section handlers — the storage surface
// @section static — the dist lane (the container doctrine)
// @section doors — the signup, database and query lanes (the person's door)

/** @section auth */

/** the digest of the configured vault token — resolved once at boot, never the raw value in a closure. */
const vaultTokenDigest: Buffer | undefined = vaultTokenDigestOf();

/**
 * Resolves the sha-256 digest of the configured VAULT_TOKEN — the gate
 * compares digests, never the raw bearers, so a presented token never
 * rides a comparison that could leak its length or its bytes.
 *
 * @returns the digest, or undefined when the environment carries no token.
 */
function vaultTokenDigestOf(): Buffer | undefined {
  const token = process.env.VAULT_TOKEN;
  if (typeof token !== "string" || token.length === 0) {
    return undefined;
  }
  return createHash("sha256").update(token, "utf8").digest();
}

/**
 * Answers whether the operator pinned the vault token — the honest
 * readiness the health probe reports and the sealed refusal reads.
 *
 * @returns true when VAULT_TOKEN answered at boot.
 */
export function vaultTokenConfigured(): boolean {
  return vaultTokenDigest !== undefined;
}

/**
 * Reads the presented bearer of one request — the Authorization: Bearer
 * header first, then the x-vault-token header the platform gateway rides.
 *
 * @param req the incoming request.
 * @returns the raw presented token, or an empty string.
 */
function presentedToken(req: IncomingMessage): string {
  const authorization = headerOf(req, "authorization");
  if (authorization.toLowerCase().startsWith("bearer ")) {
    const bearer = authorization.slice("bearer ".length).trim();
    if (bearer.length > 0) {
      return bearer;
    }
  }
  return headerOf(req, "x-vault-token").trim();
}

/**
 * The token gate of every data route — the faun lesson as code: the
 * request passes only when the environment pinned a token and the
 * presented bearer digests to exactly it (timing safe). An unpinned
 * environment seals the whole storage surface (fail closed).
 *
 * @param req the incoming request.
 * @returns the verdict the route answers: "open", "refused" (a wrong or
 *   missing bearer) or "sealed" (no token configured).
 */
export function tokenVerdict(req: IncomingMessage): "open" | "refused" | "sealed" {
  if (vaultTokenDigest === undefined) {
    return "sealed";
  }
  const presented = presentedToken(req);
  if (presented.length === 0) {
    return "refused";
  }
  const digest = createHash("sha256").update(presented, "utf8").digest();
  return digest.length === vaultTokenDigest.length && timingSafeEqual(digest, vaultTokenDigest) ? "open" : "refused";
}

/** the token verdicts the request auth resolves from (the faun gate answer). */
type TokenVerdict = "open" | "refused" | "sealed";

/**
 * The request auth of the data gate — the three doors in order, each one
 * scoped: the operator bearer stays total (admin), the vk_ key authorizes
 * its own project only, the vs_ session authorizes the projects of its
 * account. The "none" answer refuses (401); the "sealed" answer keeps the
 * fail-closed law — no door configured at all seals the whole surface.
 */
type RequestAuth =
  | { kind: "admin" }
  | { kind: "key"; keyId: string; projectId: string }
  | { kind: "session"; accountId: string }
  | { kind: "none" }
  | { kind: "sealed" };

/**
 * Resolves the request auth — the token verdict rides in (the faun gate
 * answers exactly once per request), then the two scoped doors read the
 * presented bearer: a vk_ secret resolves through its sha-256 digest (the
 * gate stamps last-used on the ride), a vs_ bearer verifies its HMAC and
 * its clock. The sealed verdict only stands when neither the operator
 * token nor the session secret is configured at all.
 *
 * @param req the incoming request.
 * @param verdict the token verdict of the same request.
 * @returns the resolved auth the route dispatch enforces.
 */
function requestAuth(req: IncomingMessage, verdict: TokenVerdict): RequestAuth {
  if (verdict === "open") {
    return { kind: "admin" };
  }
  const presented = presentedToken(req);
  if (presented.startsWith(KEY_PREFIX)) {
    const key = resolveProjectKey(presented);
    if (key !== undefined) {
      return { kind: "key", keyId: key.keyId, projectId: key.projectId };
    }
  }
  if (presented.startsWith(SESSION_PREFIX)) {
    const session = verifySession(presented);
    if (session !== undefined) {
      return { kind: "session", accountId: session.accountId };
    }
  }
  return verdict === "sealed" && !sessionSecretConfigured() ? { kind: "sealed" } : { kind: "none" };
}

/**
 * Answers whether the request auth may touch one project — the
 * authorization matrix of the data lanes: the admin rides total, the key
 * its own scope, the session the scopes of its account.
 *
 * @param auth the resolved request auth.
 * @param projectId the project the route names.
 * @returns true when the caller's scope holds the project.
 */
function authorizeProject(auth: RequestAuth, projectId: string): boolean {
  if (auth.kind === "admin") {
    return true;
  }
  if (auth.kind === "key") {
    return auth.projectId === projectId;
  }
  if (auth.kind === "session") {
    return projectOwnedBy(auth.accountId, projectId);
  }
  return false;
}

/**
 * Answers whether the request auth may run the key lane of one project —
 * the mint, the list and the revoke answer the admin and the owning
 * session only (a project key never mints keys).
 *
 * @param auth the resolved request auth.
 * @param projectId the project the key lane names.
 * @returns true when the caller may manage the keys.
 */
function authorizeKeyLane(auth: RequestAuth, projectId: string): boolean {
  if (auth.kind === "admin") {
    return true;
  }
  return auth.kind === "session" && projectOwnedBy(auth.accountId, projectId);
}

/**
 * Answers the standardized forbidden refusal of a foreign project — the
 * honest why per lane (the key's scope, the session's ownership).
 *
 * @param res the response to answer.
 * @param auth the resolved request auth.
 * @param projectId the project the caller may not touch.
 */
function sendProjectForbidden(res: ServerResponse, auth: RequestAuth, projectId: string): void {
  const why =
    auth.kind === "key"
      ? `the project key authorizes its own project only — "${projectId}" is out of its scope`
      : auth.kind === "session"
        ? `the signed-in account does not own the project "${projectId}"`
        : `the caller may not touch the project "${projectId}"`;
  sendError(res, 403, "VAULT_FORBIDDEN", why);
}

/**
 * The peer address the public-door counter keys on — the socket answer,
 * "unknown" when the platform hides it (the counter never crashes a door).
 *
 * @param req the incoming request.
 * @returns the peer key of the rate counter.
 */
function peerOf(req: IncomingMessage): string {
  return req.socket.remoteAddress ?? "unknown";
}

/** @section routes */

/** the route catalog re-exported from the client-safe module: the catalog lives in routes.ts (no engine imports, no storage singletons — any face may ride it), and the family sites answer the same strings through the published deep specifier ("@wenathlan/vault/routes"), so the route strings are never duplicated inside an app. */
export { routes };

/** the whole route count the domain serves: the base catalog plus one
 * static-safe route per protocol row (the protocols pillar — above one
 * thousand on the wave D catalog) plus one per storage pillar row (the
 * pillars catalog — the eight storage pillars and the list lane). */
export const routeCount =
  Object.keys(routes).length + PROTOCOL_ROUTE_COUNT + PILLARS.length;

/** @section server */

/**
 * Creates the vault http server — pure node:http, no framework. The server
 * owns the storage truth, and — when a static root answers on the host —
 * the built site face beside it (the container doctrine: one process, one
 * port, the platform gateway may keep owning the site lane on the static
 * hosts by simply not mounting a static root). Every request is answered
 * with the standardized json or byte shapes.
 *
 * @returns the server, not yet listening.
 */
export function createVaultServer(): Server {
  return createServer((req, res) => {
    void handle(req, res);
  });
}

/**
 * Starts listening — the port and host resolve from the options (port 0
 * answers an ephemeral port for tests), never a hardcoded localhost.
 *
 * @param server the vault server.
 * @param options the port (default VAULT_PORT, then 3210) and host (default VAULT_HOST, then 0.0.0.0).
 * @returns the bound port.
 */
export function listenVault(server: Server, options?: { port?: number; host?: string }): Promise<number> {
  const port = options?.port ?? Number(process.env.VAULT_PORT ?? 3210);
  const host = options?.host ?? process.env.VAULT_HOST ?? "0.0.0.0";
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => {
      const address = server.address();
      resolve(typeof address === "object" && address !== null ? address.port : port);
    });
  });
}

/** the one request entry — every fallible path guarded, every failure standardized. */
async function handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    const rawurl = req.url ?? "/";
    const url = new URL(rawurl, `http://${req.headers.host ?? "vault.local"}`);
    applyCors(res);
    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }
    const method = req.method ?? "GET";
    /* the origin-form guard: a request target that starts with // is a
     * double-slash path (the origin-form the spec allows), never a
     * protocol-relative reference — the URL constructor would read it as
     * authority and the seal would face the wrong pathname, so the raw
     * target stays the pathname the lanes and the faun seal see. */
    const pathname = rawurl.startsWith("//") ? rawurl : url.pathname;
    /* the raw-database law, one door earlier than every lane: a request
     * that names the raw database file — plain, encoded or the faun
     * spelling — refuses before the health probe, the api surface and
     * the static faces are ever consulted. The bytes never leave. */
    if (rawDatabaseRequest(pathname) || rawDatabaseRequest(safeDecode(pathname))) {
      sendError(res, 403, "VAULT_DBFILE", "the raw database file never leaves the vault — the faun law holds on every face");
      return;
    }
    if (method === "GET" && pathname === routes.health) {
      sendJson(res, 200, {
        ok: true,
        service: "vault",
        storage: { driver: storageDriverKind() },
        auth: { required: true, configured: vaultTokenConfigured() },
      });
      return;
    }
    /* the ui copy lane — the winget copy of the vault rides the uicopy
     * table of the site store and answers same-origin beside the health
     * probe (an open read: the interface text carries no secret — the
     * storage truth past this line stays behind the token gate). One lane
     * lists the rows for the mount loader, one lane answers a single key,
     * and an unknown key refuses honestly instead of inventing a word. */
    if (method === "GET" && pathname === routes.uicopy) {
      await ensureuicopyingested();
      const rows = await uistorelist(String(url.searchParams.get("locale") || "en"));
      sendJson(res, 200, { rows });
      return;
    }
    if (method === "GET" && pathname.startsWith(`${routes.uicopy}/`)) {
      await ensureuicopyingested();
      const key = safeDecode(pathname.slice(routes.uicopy.length + 1));
      const row = await uistoreget(key, String(url.searchParams.get("locale") || "en"));
      if (!row) {
        sendError(res, 404, "VAULT_COPY", `no copy row answers ${key}`);
        return;
      }
      sendJson(res, 200, row);
      return;
    }
    /* the site face lane (the container doctrine): when a static root
     * answers, every non-api GET (and HEAD) resolves against it — real
     * files with real content types, the spa entry for the extensionless
     * routes, and the sealed database faces refuse outright. The internal
     * root owns the surface first when the deployable unit pins it
     * (VAULT_INTERNAL_ROOT — the wave D lane with its own faun law and the
     * registry mimes), and the token gate owns the storage truth, never
     * the static face. The api surface keeps precedence either way: a
     * static root never shadows /api/*. */
    if ((method === "GET" || method === "HEAD") && !pathname.startsWith("/api/")) {
      const internalPinned =
        typeof process.env.VAULT_INTERNAL_ROOT === "string" && process.env.VAULT_INTERNAL_ROOT.length > 0;
      if (internalPinned && serveInternal(res, method, safeDecode(pathname))) {
        return;
      }
      if (serveStatic(res, pathname, method === "HEAD")) {
        return;
      }
    }
    /* the internal root — the static site surface the deployable unit
     * answers when the platform gateway delegates the domain: the correct
     * content type for every file type from the mimetypes registry, the
     * faun law enforced (the raw .db never rides the static root — database
     * data flows only through the api lanes below) and the read-only law
     * (every write method answers its 405). The container-doctrine static
     * face above answered first when it holds the tree; this lane answers
     * the internal root the deployable unit carries, and the api surface
     * keeps precedence (an unknown /api/* path answers the route 404, never
     * a static face). */
    if (!pathname.startsWith("/api/") && pathname !== "/api" && serveInternal(res, method, safeDecode(pathname))) {
      return;
    }
    /* the account lane — the public doors of the person surface: the
     * signup and the signin demand no operator bearer (they are how a
     * stranger becomes a caller), but the per-peer counter owns the door
     * and the session secret must answer before anything signs — a sealed
     * environment seals these doors too (fail closed, never fail open). */
    if (pathname === routes.signup) {
      if (method !== "POST") {
        sendError(res, 405, "VAULT_METHOD", `${method} does not ride ${pathname}`);
        return;
      }
      await postSignup(req, res);
      return;
    }
    if (pathname === routes.signin) {
      if (method !== "POST") {
        sendError(res, 405, "VAULT_METHOD", `${method} does not ride ${pathname}`);
        return;
      }
      await postSignin(req, res);
      return;
    }
    /* the protocols pillar — every wire of the catalog answers its own
     * static-safe route: the list lane and the one-handler-per-row scheme
     * lane (read-only, no storage truth, no query execution — the registry
     * rows carry no secret, the same open law the copy lane rides). */
    if (method === "GET" && pathname === routes.protocols) {
      sendJson(res, 200, { protocols: PROTOCOLS.map(jsonOfProtocol), count: PROTOCOLS.length });
      return;
    }
    if (method === "GET" && pathname.startsWith(`${routes.protocols}/`)) {
      const row = protocolRouteOf(pathname);
      if (row === undefined) {
        sendError(res, 404, "VAULT_PROTOCOL", `no protocol route answers ${pathname}`);
        return;
      }
      sendJson(res, 200, jsonOfProtocol(row));
      return;
    }
    /* the storage pillars catalog — every pillar of the storage stack
     * (LibGit2, MySQL2, the prisma schema, drizzle, git lfs, blobs,
     * bigint, pointers) answers its own static-safe route beside the list
     * lane: read-only, no storage truth, no query execution — the catalog
     * rows carry no secret, the same open law the protocols pillar rides. */
    if (method === "GET" && pathname === routes.pillars) {
      sendJson(res, 200, { pillars: PILLARS.map(jsonOfPillar), count: PILLAR_COUNT });
      return;
    }
    if (method === "GET" && pathname.startsWith(`${routes.pillars}/`)) {
      const row = pillarRouteOf(pathname);
      if (row === undefined) {
        sendError(res, 404, "VAULT_PILLAR", `no pillar route answers ${pathname}`);
        return;
      }
      sendJson(res, 200, jsonOfPillar(row));
      return;
    }
    /* the person's door onto the network database — the register lane
     * (verified credentials, the database id and the api key shown exactly
     * once), the database reads, the key lanes and the quota lanes, each
     * answering its own bearer door (the api key digest gate). */
    if (pathname === routes.databases) {
      if (method !== "POST") {
        sendError(res, 405, "VAULT_METHOD", `${method} does not ride ${pathname}`);
        return;
      }
      await postDatabases(req, res);
      return;
    }
    if (pathname.startsWith(`${routes.databases}/`)) {
      const rest = safeDecode(pathname.slice(routes.databases.length + 1));
      const [databaseId, tail] = rest.split("/", 2);
      if (tail === "keys" || tail === "quota") {
        await databaseSubroute(req, res, method, databaseId, tail);
        return;
      }
      if (tail !== undefined) {
        sendError(res, 404, "VAULT_ROUTE", `no route answers ${pathname}`);
        return;
      }
      if (method === "GET") {
        getDatabaseRoute(req, res, databaseId);
        return;
      }
      sendError(res, 405, "VAULT_METHOD", `${method} does not ride ${pathname}`);
      return;
    }
    /* the helix-style query lane — bearer plus database-id headers over the
     * per-database sqlite files: the key-hash gate answers (the operator
     * token or an issued api key, both compared as digests), the query body
     * rides the better-sqlite3 core, the json answer carries the rows or the
     * change counters. */
    if (pathname === routes.query) {
      if (method !== "POST") {
        sendError(res, 405, "VAULT_METHOD", `${method} does not ride ${pathname}`);
        return;
      }
      await postQuery(req, res);
      return;
    }
    /* the faun lesson door: every data route past the health probe and the
     * public account doors demands an honest bearer — the operator token
     * (total), a project key (its scope) or a session (its account). The
     * sealed and the refused answers ride the same standardized error
     * shape the rest of the surface speaks. */
    const verdict = tokenVerdict(req);
    const auth = requestAuth(req, verdict);
    if (auth.kind === "sealed") {
      sendError(
        res,
        503,
        "VAULT_AUTH",
        "the vault token is not configured — set VAULT_TOKEN (or VAULT_SESSION_SECRET for the account door) before the storage truth answers",
      );
      return;
    }
    if (auth.kind === "none") {
      /* the decoy lane of the faun lesson's final seal: a browser-shaped
       * probe (the scanner signature — accept carrying text/html, the one
       * shape no api client of this surface sends) reads a plausible
       * ledger of fake projects instead of the honest refusal, so the
       * enumeration dies in the decoy and the real base stays sealed
       * behind the gate. every api-shaped request keeps the honest 401
       * contract the accounts, objects and storagelane suites assert. */
      if (isprobe(req.headers.accept) && method === "GET") {
        sendJson(res, 200, { projects: decoyledger() });
        return;
      }
      sendError(
        res,
        401,
        "VAULT_AUTH",
        "the storage truth demands an honest bearer (the operator token, a project key or a session token)",
      );
      return;
    }
    if (pathname === routes.projects) {
      if (method === "POST") {
        await postProject(req, res, auth);
        return;
      }
      if (method === "GET") {
        listProjectsRoute(res, url, auth);
        return;
      }
      sendError(res, 405, "VAULT_METHOD", `${method} does not ride ${pathname}`);
      return;
    }
    if (pathname.startsWith(`${routes.projects}/`)) {
      const segments = safeDecode(pathname.slice(routes.projects.length + 1))
        .split("/")
        .filter((segment) => segment !== "");
      if (segments.length === 2 && segments[1] === "keys") {
        const projectId = segments[0];
        if (method === "POST") {
          await postProjectKey(req, res, projectId, auth);
          return;
        }
        if (method === "GET") {
          listProjectKeysRoute(res, projectId, auth);
          return;
        }
        sendError(res, 405, "VAULT_METHOD", `${method} does not ride ${pathname}`);
        return;
      }
      if (segments.length === 3 && segments[1] === "keys") {
        if (method === "DELETE") {
          revokeProjectKeyRoute(res, segments[0], segments[2], auth);
          return;
        }
        sendError(res, 405, "VAULT_METHOD", `${method} does not ride ${pathname}`);
        return;
      }
    }
    if (pathname === routes.objects) {
      if (method === "POST") {
        await postObject(req, res, auth);
        return;
      }
      if (method === "GET") {
        listObjectsRoute(res, url, auth);
        return;
      }
      sendError(res, 405, "VAULT_METHOD", `${method} does not ride ${pathname}`);
      return;
    }
    if (pathname.startsWith(`${routes.objects}/`)) {
      const id = safeDecode(pathname.slice(routes.objects.length + 1));
      if (method === "GET") {
        getObjectRoute(res, id, auth);
        return;
      }
      if (method === "DELETE") {
        deleteObjectRoute(res, id, auth);
        return;
      }
      sendError(res, 405, "VAULT_METHOD", `${method} does not ride ${pathname}`);
      return;
    }
    if (pathname === routes.quota) {
      if (method === "GET") {
        getQuotaRoute(res, url, auth);
        return;
      }
      if (method === "POST") {
        await postQuota(req, res, url, auth);
        return;
      }
      sendError(res, 405, "VAULT_METHOD", `${method} does not ride ${pathname}`);
      return;
    }
    if (pathname === routes.usage) {
      if (method !== "GET") {
        sendError(res, 405, "VAULT_METHOD", `${method} does not ride ${pathname}`);
        return;
      }
      usageRoute(res, url, auth);
      return;
    }
    if (pathname === routes.sweep) {
      if (method !== "POST") {
        sendError(res, 405, "VAULT_METHOD", `${method} does not ride ${pathname}`);
        return;
      }
      sweepRoute(res, auth);
      return;
    }
    /* the api surface keeps precedence over the static lanes above: an
     * unknown /api/* path answers the route 404 (past the gate) instead of
     * any static face. */
    sendError(res, 404, "VAULT_ROUTE", `no route answers ${pathname}`);
  } catch (error) {
    sendError(res, 500, "VAULT_FAULT", error instanceof Error ? error.message : "the vault faulted");
  }
}

/** @section handlers */

/** answers one json body — 400 when the body is not honest json. */
async function readJson(req: IncomingMessage): Promise<Record<string, unknown>> {
  const body = await readBody(req);
  if (body.length === 0) {
    return {};
  }
  try {
    const parsed: unknown = JSON.parse(body.toString("utf8"));
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("the body must be a json object");
    }
    return parsed as Record<string, unknown>;
  } catch (error) {
    throw new BadBodyError(error instanceof Error ? error.message : "the body is not json");
  }
}

/** the typed refusal a malformed body answers. */
class BadBodyError extends Error {}

/** reads the whole raw body — the deposit bytes travel verbatim; the quota gate is the only ceiling. */
async function readBody(req: IncomingMessage): Promise<Buffer> {
  const parts: Buffer[] = [];
  for await (const part of req) {
    parts.push(typeof part === "string" ? Buffer.from(part, "utf8") : part);
  }
  return Buffer.concat(parts);
}

/** POST /api/v1/auth/signup — the public account door: the row lands with the scrypt digest only, never the plaintext. */
async function postSignup(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const rate = authRateVerdict(peerOf(req));
  if (!rate.allowed) {
    sendError(
      res,
      429,
      "VAULT_RATE",
      "too many attempts from this address — the account door rests until the window rolls",
      {
        "retry-after": String(rate.retryAfterSeconds),
      },
    );
    return;
  }
  if (!sessionSecretConfigured()) {
    sendError(
      res,
      503,
      "VAULT_AUTH",
      "the session secret is not configured — set VAULT_SESSION_SECRET (or VAULT_TOKEN) before the account door answers",
    );
    return;
  }
  try {
    const body = await readJson(req);
    const email = typeof body.email === "string" ? body.email : "";
    const password = typeof body.password === "string" ? body.password : "";
    const answer = createAccount(email, password);
    if (answer.account !== undefined) {
      sendJson(res, 201, { account: answer.account });
      return;
    }
    sendError(
      res,
      answer.refusal?.kind === "taken" ? 409 : 400,
      "VAULT_AUTH",
      answer.refusal?.why ?? "the account was refused",
    );
  } catch (error) {
    if (error instanceof BadBodyError) {
      sendError(res, 400, "VAULT_BODY", error.message);
      return;
    }
    throw error;
  }
}

/** POST /api/v1/auth/signin — the public password door: the signed session bearer answers once, nothing ever saves in a browser. */
async function postSignin(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const rate = authRateVerdict(peerOf(req));
  if (!rate.allowed) {
    sendError(
      res,
      429,
      "VAULT_RATE",
      "too many attempts from this address — the account door rests until the window rolls",
      {
        "retry-after": String(rate.retryAfterSeconds),
      },
    );
    return;
  }
  if (!sessionSecretConfigured()) {
    sendError(
      res,
      503,
      "VAULT_AUTH",
      "the session secret is not configured — set VAULT_SESSION_SECRET (or VAULT_TOKEN) before the account door answers",
    );
    return;
  }
  try {
    const body = await readJson(req);
    const email = typeof body.email === "string" ? body.email : "";
    const password = typeof body.password === "string" ? body.password : "";
    const answer = verifyCredentials(email, password);
    if (answer === undefined) {
      sendError(res, 401, "VAULT_AUTH", "the email and the password do not match an account");
      return;
    }
    const session = issueSession(answer.id);
    sendJson(res, 200, {
      account: { id: answer.id, email: answer.email },
      token: session.token,
      expiresAt: session.expiresAt,
      databases: databasesOfEmail(answer.email).map(jsonOfDatabase),
    });
  } catch (error) {
    if (error instanceof BadBodyError) {
      sendError(res, 400, "VAULT_BODY", error.message);
      return;
    }
    throw error;
  }
}

/** POST /api/v1/storage/projects — creates the owner scope with its 900MB quota floor (a session-minted scope lands owned). */
async function postProject(req: IncomingMessage, res: ServerResponse, auth: RequestAuth): Promise<void> {
  if (auth.kind === "key") {
    sendError(res, 403, "VAULT_FORBIDDEN", "a project key authorizes its own project only — it mints no scopes");
    return;
  }
  try {
    const body = await readJson(req);
    const id = typeof body.id === "string" ? body.id : "";
    const name = typeof body.name === "string" ? body.name : id;
    if (auth.kind === "session") {
      const owner = projectOwner(id);
      if (owner !== undefined && owner !== auth.accountId) {
        sendError(res, 403, "VAULT_FORBIDDEN", `the project "${id}" already answers to another owner`);
        return;
      }
    }
    const answer = createProject(id, name, auth.kind === "session" ? auth.accountId : undefined);
    if (answer.project !== undefined) {
      sendJson(res, 201, { project: jsonOfProject(answer.project) });
      return;
    }
    sendError(res, 400, "VAULT_INVALID", answer.refusal?.why ?? "the project was refused");
  } catch (error) {
    if (error instanceof BadBodyError) {
      sendError(res, 400, "VAULT_BODY", error.message);
      return;
    }
    throw error;
  }
}

/** the page bounds of the project list — a default of fifty, a ceiling of five hundred, a non-negative offset. */
const PROJECT_PAGE_DEFAULT = 50;
const PROJECT_PAGE_MAX = 500;

/** parses one page limit (the default answers a malformed or absent value). */
function pageLimitOf(raw: string | null): number {
  if (raw === null || raw === "") {
    return PROJECT_PAGE_DEFAULT;
  }
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return PROJECT_PAGE_DEFAULT;
  }
  return Math.min(parsed, PROJECT_PAGE_MAX);
}

/** parses one page offset (zero answers a malformed or negative value). */
function pageOffsetOf(raw: string | null): number {
  if (raw === null || raw === "") {
    return 0;
  }
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0;
}

/** GET /api/v1/storage/projects — the owner scopes, paginated: the admin walks every row, a session walks its own only. */
function listProjectsRoute(res: ServerResponse, url: URL, auth: RequestAuth): void {
  if (auth.kind === "key") {
    sendError(res, 403, "VAULT_FORBIDDEN", "a project key authorizes its own project only — it lists no scopes");
    return;
  }
  const limit = pageLimitOf(url.searchParams.get("limit"));
  const offset = pageOffsetOf(url.searchParams.get("offset"));
  const page = listProjects({ accountId: auth.kind === "session" ? auth.accountId : undefined, limit, offset });
  sendJson(res, 200, {
    projects: page.rows.map(jsonOfProjectSummary),
    total: page.total,
    limit,
    offset,
  });
}

/** POST /api/v1/storage/projects/:id/keys — mints one vk_ bearer: the secret answers exactly once, only its digest lands. */
async function postProjectKey(
  req: IncomingMessage,
  res: ServerResponse,
  projectId: string,
  auth: RequestAuth,
): Promise<void> {
  if (!authorizeKeyLane(auth, projectId)) {
    sendProjectForbidden(res, auth, projectId);
    return;
  }
  try {
    const body = await readJson(req);
    const label = typeof body.label === "string" ? body.label : "key";
    const answer = createProjectKey(projectId, label);
    if (answer.key !== undefined && answer.secret !== undefined) {
      sendJson(res, 201, { key: answer.key, secret: answer.secret });
      return;
    }
    if (answer.refusal?.kind === "absent") {
      sendError(res, 404, "VAULT_PROJECT", answer.refusal.why);
      return;
    }
    sendError(res, 400, "VAULT_INVALID", answer.refusal?.why ?? "the key was refused");
  } catch (error) {
    if (error instanceof BadBodyError) {
      sendError(res, 400, "VAULT_BODY", error.message);
      return;
    }
    throw error;
  }
}

/** GET /api/v1/storage/projects/:id/keys — the labels and the last-used stamps, never a secret. */
function listProjectKeysRoute(res: ServerResponse, projectId: string, auth: RequestAuth): void {
  if (!authorizeKeyLane(auth, projectId)) {
    sendProjectForbidden(res, auth, projectId);
    return;
  }
  sendJson(res, 200, { keys: listProjectKeys(projectId) });
}

/** DELETE /api/v1/storage/projects/:id/keys/:keyid — the revocation: a revoked secret answers 401 on its next ride. */
function revokeProjectKeyRoute(res: ServerResponse, projectId: string, keyId: string, auth: RequestAuth): void {
  if (!authorizeKeyLane(auth, projectId)) {
    sendProjectForbidden(res, auth, projectId);
    return;
  }
  if (revokeProjectKey(projectId, keyId)) {
    sendJson(res, 200, { revoked: true, id: keyId });
    return;
  }
  sendError(res, 404, "VAULT_ABSENT", `the key "${keyId}" is not on the project "${projectId}"`);
}

/** POST /api/v1/storage/objects — the deposit: raw body bytes, path, mime and bucket from the headers. */
async function postObject(req: IncomingMessage, res: ServerResponse, auth: RequestAuth): Promise<void> {
  const projectId = headerOf(req, "x-project-id");
  const objectPath = safeDecode(headerOf(req, "x-object-path"));
  const mime = headerOf(req, "x-object-mime") || "application/octet-stream";
  const bucket = headerOf(req, "x-object-bucket") || DEFAULT_BUCKET;
  if (projectId === "" || objectPath === "") {
    sendError(res, 400, "VAULT_INVALID", "the deposit needs the x-project-id and x-object-path headers");
    return;
  }
  if (!authorizeProject(auth, projectId)) {
    sendProjectForbidden(res, auth, projectId);
    return;
  }
  const bytes = await readBody(req);
  const answer = putObject({ projectId, path: objectPath, mime, bytes, bucket });
  if (!("refusal" in answer)) {
    sendJson(res, 201, { object: jsonOfObject(answer.object), reused: answer.reused });
    return;
  }
  if (answer.refusal.kind === "quota") {
    sendJson(res, 413, {
      error: { code: "VAULT_QUOTA", message: answer.refusal.why, quota: jsonOfVerdict(answer.refusal.verdict) },
    });
    return;
  }
  sendError(res, 400, "VAULT_INVALID", answer.refusal.why);
}

/** GET /api/v1/storage/objects — the live rows of one project (one retention
 * group when the bucket query pins it), newest first. */
function listObjectsRoute(res: ServerResponse, url: URL, auth: RequestAuth): void {
  const projectId = url.searchParams.get("project") ?? "";
  if (projectId === "") {
    sendError(res, 400, "VAULT_INVALID", "the list needs the project query parameter");
    return;
  }
  if (!authorizeProject(auth, projectId)) {
    sendProjectForbidden(res, auth, projectId);
    return;
  }
  const bucket = url.searchParams.get("bucket");
  sendJson(res, 200, { objects: listObjects(projectId, bucket === null ? undefined : bucket).map(jsonOfObject) });
}

/** GET /api/v1/storage/objects/:id — the verified bytes back, served as the stored mime (the project verdict runs first). */
function getObjectRoute(res: ServerResponse, id: string, auth: RequestAuth): void {
  if (id === "") {
    sendError(res, 400, "VAULT_INVALID", "the object id is empty");
    return;
  }
  const projectId = objectProjectOf(id);
  if (projectId !== undefined && !authorizeProject(auth, projectId)) {
    sendProjectForbidden(res, auth, projectId);
    return;
  }
  const answer = getObject(id);
  if (!("refusal" in answer)) {
    res.writeHead(200, {
      "content-type": answer.object.mime,
      "content-length": String(answer.bytes.length),
      "x-object-digest": answer.object.digest,
      "x-object-size": answer.object.size.toString(),
      "x-object-path": answer.object.path,
      "x-object-verified": String(answer.verified),
    });
    res.end(answer.bytes);
    return;
  }
  if (answer.refusal.kind === "corrupt") {
    sendError(res, 500, "VAULT_CORRUPT", answer.refusal.why);
    return;
  }
  sendError(res, 404, "VAULT_ABSENT", answer.refusal.why);
}

/** DELETE /api/v1/storage/objects/:id — the soft delete with the refcount detach (the project verdict runs first). */
function deleteObjectRoute(res: ServerResponse, id: string, auth: RequestAuth): void {
  if (id === "") {
    sendError(res, 400, "VAULT_INVALID", "the object id is empty");
    return;
  }
  const projectId = objectProjectOf(id);
  if (projectId !== undefined && !authorizeProject(auth, projectId)) {
    sendProjectForbidden(res, auth, projectId);
    return;
  }
  const answer = deleteObject(id);
  if (answer.removed) {
    sendJson(res, 200, { removed: true, id: answer.id });
    return;
  }
  sendJson(res, 404, { error: { code: "VAULT_ABSENT", message: `the object "${id}" is not in the ledger` } });
}

/** GET /api/v1/storage/quota — the usage, the user-defined limit and the verdict state. */
function getQuotaRoute(res: ServerResponse, url: URL, auth: RequestAuth): void {
  const projectId = url.searchParams.get("project") ?? "";
  if (projectId === "") {
    sendError(res, 400, "VAULT_INVALID", "the quota needs the project query parameter");
    return;
  }
  if (!authorizeProject(auth, projectId)) {
    sendProjectForbidden(res, auth, projectId);
    return;
  }
  const quota = readQuota(storage, projectId);
  if (quota === undefined) {
    sendError(res, 404, "VAULT_PROJECT", `the project "${projectId}" never wrote a quota — create it first`);
    return;
  }
  const usage = usageOf(projectId);
  const verdict = quotaVerdict(usage.bytes, quota.limitBytes, 0n);
  sendJson(res, 200, {
    project: projectId,
    usage: usage.bytes.toString(),
    objects: usage.objects,
    limit: quota.limitBytes === null ? null : quota.limitBytes.toString(),
    state: verdict.state,
    remaining: verdict.remaining === null ? null : verdict.remaining.toString(),
    updatedAt: quota.updatedAt,
  });
}

/** POST /api/v1/storage/quota?project= — sets the user-defined limit: decimal bytes or unlimited. */
async function postQuota(req: IncomingMessage, res: ServerResponse, url: URL, auth: RequestAuth): Promise<void> {
  const projectId = url.searchParams.get("project") ?? "";
  if (projectId === "") {
    sendError(res, 400, "VAULT_INVALID", "the quota needs the project query parameter");
    return;
  }
  if (!authorizeProject(auth, projectId)) {
    sendProjectForbidden(res, auth, projectId);
    return;
  }
  try {
    const body = await readJson(req);
    const raw = body.limitBytes === null || body.limitBytes === undefined ? "unlimited" : String(body.limitBytes);
    const parsed = quotaLimitFrom(raw);
    if ("refusal" in parsed) {
      sendError(res, 400, "VAULT_INVALID", parsed.refusal);
      return;
    }
    if (readQuota(storage, projectId) === undefined) {
      sendError(res, 404, "VAULT_PROJECT", `the project "${projectId}" never wrote a quota — create it first`);
      return;
    }
    const quota = setQuota(storage, projectId, parsed.limitBytes);
    sendJson(res, 200, {
      project: quota.projectId,
      limit: quota.limitBytes === null ? null : quota.limitBytes.toString(),
      updatedAt: quota.updatedAt,
    });
  } catch (error) {
    if (error instanceof BadBodyError) {
      sendError(res, 400, "VAULT_BODY", error.message);
      return;
    }
    throw error;
  }
}

/** GET /api/v1/storage/usage — the project usage and the catalog census behind it. */
function usageRoute(res: ServerResponse, url: URL, auth: RequestAuth): void {
  const projectId = url.searchParams.get("project") ?? "";
  if (projectId === "") {
    sendError(res, 400, "VAULT_INVALID", "the usage needs the project query parameter");
    return;
  }
  if (!authorizeProject(auth, projectId)) {
    sendProjectForbidden(res, auth, projectId);
    return;
  }
  const usage = usageOf(projectId);
  const census = storageCensus();
  sendJson(res, 200, {
    project: projectId,
    bytes: usage.bytes.toString(),
    objects: usage.objects,
    chunks: census.chunks,
    chunkBytes: census.chunkBytes.toString(),
    liveObjects: census.liveObjects,
    liveBytes: census.liveBytes.toString(),
  });
}

/** POST /api/v1/storage/sweep — collects the orphan chunks and the tombstones (the operator lane alone: the sweep walks the whole catalog). */
function sweepRoute(res: ServerResponse, auth: RequestAuth): void {
  if (auth.kind !== "admin") {
    sendError(res, 403, "VAULT_FORBIDDEN", "the sweep walks the whole catalog — the operator token owns it");
    return;
  }
  const answer = sweepOrphans();
  sendJson(res, 200, { chunks: answer.chunks, bytes: answer.bytes.toString(), tombstones: answer.tombstones });
}

/** @section doors — the signup, database and query lanes (the person's door) */

/** the bearer door of the database lanes: the operator token opens any
 * database (the master door), an issued api key opens its own database —
 * both compared as digests, never plaintext. */
function databaseDoor(
  req: IncomingMessage,
  databaseId: string,
): { open: true; operator: boolean } | { refusal: { status: number; code: string; why: string } } {
  if (tokenVerdict(req) === "open") {
    return { open: true, operator: true };
  }
  const bearer = presentedBearerOf(req);
  if (bearer.length > 0) {
    const lookup = apiKeyLookup(bearer);
    if ("refusal" in lookup) {
      return { refusal: { status: 401, code: "VAULT_KEY", why: lookup.refusal.why } };
    }
    if (lookup.database.id !== databaseId) {
      return {
        refusal: {
          status: 403,
          code: "VAULT_KEY_SCOPE",
          why: `the key answers the database ${lookup.database.id}, not ${databaseId}`,
        },
      };
    }
    return { open: true, operator: false };
  }
  return {
    refusal: {
      status: 401,
      code: "VAULT_KEY",
      why: "the database lane demands the bearer (operator token or api key)",
    },
  };
}

/** reads the presented bearer off one request (the api's token-gate seat). */
function presentedBearerOf(req: IncomingMessage): string {
  const value = req.headers.authorization;
  const authorization = Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
  if (authorization.toLowerCase().startsWith("bearer ")) {
    return authorization.slice("bearer ".length).trim();
  }
  const header = req.headers["x-vault-token"];
  return (Array.isArray(header) ? (header[0] ?? "") : (header ?? "")).trim();
}

/** POST /api/v1/databases — the register lane (the person's door: the api key shown exactly once). */
async function postDatabases(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    const body = await readJson(req);
    const email = typeof body.email === "string" ? body.email : "";
    const password = typeof body.password === "string" ? body.password : "";
    const name = typeof body.name === "string" ? body.name : "";
    const quotaBytes =
      body.quotaBytes === null || body.quotaBytes === undefined
        ? undefined
        : BigInt(String(body.quotaBytes));
    let answer = registerDatabase(email, password, name, quotaBytes);
    if (answer.refusal?.kind === "credentials") {
      /* the two doors answer one person: a caller the accounts door
       * verified (the operator surface) provisions the person row on
       * first use, so the register lane always finds the credential. */
      if (verifyCredentials(email, password) !== undefined) {
        ensurePersonAccount(email, password);
        answer = registerDatabase(email, password, name, quotaBytes);
      }
    }
    if (answer.answer !== undefined) {
      sendJson(res, 201, {
        database: jsonOfDatabase(answer.answer.database),
        key: answer.answer.key,
        keyId: answer.answer.keyId,
        shown: "once",
      });
      return;
    }
    const status = answer.refusal?.kind === "credentials" ? 401 : 400;
    sendError(res, status, "VAULT_REGISTER", answer.refusal?.why ?? "the registration was refused");
  } catch (error) {
    if (error instanceof BadBodyError) {
      sendError(res, 400, "VAULT_BODY", error.message);
      return;
    }
    if (error instanceof SyntaxError || (error instanceof Error && error.message.startsWith("Cannot convert"))) {
      sendError(res, 400, "VAULT_REGISTER", "the quota must ride decimal bytes or null");
      return;
    }
    throw error;
  }
}

/** GET /api/v1/databases/:id — the database row with its honest usage (the bearer door). */
async function getDatabaseRoute(req: IncomingMessage, res: ServerResponse, databaseId: string): Promise<void> {
  if (databaseId === "") {
    sendError(res, 400, "VAULT_INVALID", "the database id is empty");
    return;
  }
  const door = databaseDoor(req, databaseId);
  if ("refusal" in door) {
    sendError(res, door.refusal.status, door.refusal.code, door.refusal.why);
    return;
  }
  const database = databaseOf(databaseId);
  if (database === undefined) {
    sendError(res, 404, "VAULT_DATABASE", `the database ${databaseId} never registered`);
    return;
  }
  sendJson(res, 200, { database: jsonOfDatabase(database) });
}

/** the database subroutes — /keys (issue another key, shown once) and /quota
 * (the per-bucket quota lane: read the row, set the limit). The account
 * credentials open the door beside the bearer lanes (the owner's word). */
async function databaseSubroute(
  req: IncomingMessage,
  res: ServerResponse,
  method: string,
  databaseId: string,
  tail: "keys" | "quota",
): Promise<void> {
  if (databaseId === "") {
    sendError(res, 400, "VAULT_INVALID", "the database id is empty");
    return;
  }
  try {
    const body = method === "POST" ? await readJson(req) : {};
    const email = typeof body.email === "string" ? body.email : "";
    const password = typeof body.password === "string" ? body.password : "";
    const account = email !== "" && password !== "" ? accountVerified(email, password) : undefined;
    const ownerVerified =
      account !== undefined && account.id === databaseOf(databaseId)?.accountId ? true : undefined;
    const door = ownerVerified ? ({ open: true, operator: false } as const) : databaseDoor(req, databaseId);
    if ("refusal" in door) {
      sendError(res, door.refusal.status, door.refusal.code, door.refusal.why);
      return;
    }
    if (tail === "keys") {
      if (method !== "POST") {
        sendError(res, 405, "VAULT_METHOD", `${method} does not ride ${routes.databases}/${databaseId}/keys`);
        return;
      }
      const label = typeof body.label === "string" && body.label.length > 0 ? body.label : "a key";
      const issued = issueApiKey(databaseId, label);
      if (issued === undefined) {
        sendError(res, 404, "VAULT_DATABASE", `the database ${databaseId} never registered`);
        return;
      }
      sendJson(res, 201, { key: issued.key, keyId: issued.keyId, shown: "once" });
      return;
    }
    if (method === "GET") {
      const database = databaseOf(databaseId);
      if (database === undefined) {
        sendError(res, 404, "VAULT_DATABASE", `the database ${databaseId} never registered`);
        return;
      }
      sendJson(res, 200, { database: jsonOfDatabase(database) });
      return;
    }
    if (method === "POST") {
      const raw = body.limitBytes === null || body.limitBytes === undefined ? "unlimited" : String(body.limitBytes);
      const parsed = quotaLimitFrom(raw);
      if ("refusal" in parsed) {
        sendError(res, 400, "VAULT_INVALID", parsed.refusal);
        return;
      }
      const database = setDatabaseQuota(databaseId, parsed.limitBytes);
      if (database === undefined) {
        sendError(res, 404, "VAULT_DATABASE", `the database ${databaseId} never registered`);
        return;
      }
      sendJson(res, 200, { database: jsonOfDatabase(database) });
      return;
    }
    sendError(res, 405, "VAULT_METHOD", `${method} does not ride ${routes.databases}/${databaseId}/quota`);
  } catch (error) {
    if (error instanceof BadBodyError) {
      sendError(res, 400, "VAULT_BODY", error.message);
      return;
    }
    throw error;
  }
}

/** POST /v2/query — the helix-style lane: bearer plus database-id headers,
 * the query body over the per-database sqlite core, the json answer. */
async function postQuery(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    const body = await readJson(req);
    const sql = typeof body.query === "string" ? body.query : "";
    const params = Array.isArray(body.params) ? body.params : [];
    const bodyDatabaseId = typeof body.databaseId === "string" ? body.databaseId : "";
    const headerDatabaseId = headerOf(req, "x-database-id").trim() || bodyDatabaseId;
    const verdict = queryVerdict(req, headerDatabaseId);
    if (verdict.kind === "refused") {
      sendError(res, 401, "VAULT_QUERY_AUTH", verdict.why);
      return;
    }
    if (verdict.kind === "scope") {
      sendError(res, 403, "VAULT_QUERY_SCOPE", verdict.why);
      return;
    }
    if (verdict.kind === "absent") {
      sendError(res, 404, "VAULT_DATABASE", verdict.why);
      return;
    }
    const answer = runQuery({ databaseId: verdict.databaseId, sql, params });
    if ("refusal" in answer) {
      if (answer.refusal.kind === "quota") {
        sendJson(res, 413, {
          error: {
            code: "VAULT_QUOTA",
            message: answer.refusal.why,
            quota: answer.refusal.quotaBytes === null ? null : answer.refusal.quotaBytes.toString(),
            usage: answer.refusal.usageBytes.toString(),
          },
        });
        return;
      }
      if (answer.refusal.kind === "absent") {
        sendError(res, 404, "VAULT_DATABASE", answer.refusal.why);
        return;
      }
      sendError(res, 400, answer.refusal.kind === "sql" ? "VAULT_SQL" : "VAULT_QUERY_BODY", answer.refusal.why);
      return;
    }
    if (answer.kind === "read") {
      sendJson(res, 200, {
        databaseId: answer.databaseId,
        kind: "read",
        columns: answer.columns,
        rows: answer.rows,
        elapsedMs: answer.elapsedMs,
      });
      return;
    }
    sendJson(res, 200, {
      databaseId: answer.databaseId,
      kind: "write",
      changes: answer.changes,
      lastInsertRowid: answer.lastInsertRowid,
      elapsedMs: answer.elapsedMs,
    });
  } catch (error) {
    if (error instanceof BadBodyError) {
      sendError(res, 400, "VAULT_BODY", error.message);
      return;
    }
    throw error;
  }
}

/** the json projection of one protocol row (the static-safe route answer). */
function jsonOfProtocol(row: ProtocolRow): Record<string, unknown> {
  return {
    scheme: row.scheme,
    name: row.name,
    port: row.port,
    spec: row.spec,
    group: row.group,
    ...(row.security !== undefined ? { security: row.security } : {}),
    ...(row.state !== undefined ? { state: row.state } : {}),
  };
}

/** the json projection of one storage pillar row (the static-safe route
 * answer — plain strings only, no bigint, no engine singletons). */
function jsonOfPillar(row: PillarRow): Record<string, unknown> {
  return {
    key: row.key,
    name: row.name,
    group: row.group,
    law: row.law,
    owner: row.owner,
    spec: row.spec,
    status: row.status,
    route: `${routes.pillars}/${row.key}`,
  };
}

/** the json projection of one database row (bigint pointers as decimal strings). */
function jsonOfDatabase(database: {
  id: string;
  accountId: string;
  name: string;
  quotaBytes: bigint | null;
  createdAt: string;
}): Record<string, unknown> {
  return {
    id: database.id,
    accountId: database.accountId,
    name: database.name,
    quotaBytes: database.quotaBytes === null ? null : database.quotaBytes.toString(),
    createdAt: database.createdAt,
  };
}

/** @section static */

/* ------------------------------------------------------------------ */
/* the dist lane — the container doctrine                              */
/* ------------------------------------------------------------------ */

/** the extension → media type table of the site faces (the mime.types
 * doctrine of the app root carried here, so the engine owns its content
 * types with zero boot reads — the text faces declare their utf-8 the way
 * the built pages carry it). */
const STATIC_MIME: Readonly<Record<string, string>> = Object.freeze({
  css: "text/css; charset=utf-8",
  htm: "text/html; charset=utf-8",
  html: "text/html; charset=utf-8",
  ico: "image/x-icon",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  js: "text/javascript; charset=utf-8",
  json: "application/json; charset=utf-8",
  map: "application/json; charset=utf-8",
  mjs: "text/javascript; charset=utf-8",
  png: "image/png",
  svg: "image/svg+xml",
  txt: "text/plain; charset=utf-8",
  wasm: "application/wasm",
  webmanifest: "application/manifest+json",
  woff: "font/woff",
  woff2: "font/woff2",
  xml: "application/xml; charset=utf-8",
});

/** the database faces the static lane never serves (the faun seal — even a
 * stray store inside the static root answers the 403 refusal, never bytes:
 * the wal and the shm sidecars refuse with their file, and the sqlite
 * spellings ride the same seal as the store file). */
const SEALED_FACES = [".db", ".db-journal", ".db-shm", ".db-wal", ".sqlite", ".sqlite-wal", ".sqlite-shm", ".sqlite3", ".sqlite3-wal", ".sqlite3-shm"] as const;

/**
 * Answers whether one pathname names the raw database file — the faun law
 * at the request door, one guard for the whole api face. The patterns are
 * the mission law verbatim: /\.db$/i (every store spelling, plain or
 * sidecar, whatever the segment before it) and /sqlite|faun\.db/i (the
 * sqlite faces and the faun.db mistake that once published a whole site
 * database). The refusal is a 403 on every face — static lane, internal
 * root or api surface — and the bytes never leave the vault: database
 * data flows only through the internal api lanes.
 *
 * @law the raw database file never leaves the vault
 * @param pathname the raw or the decoded url pathname (the encoded
 *  spellings — %2E and friends — reach this guard decoded).
 * @returns true when the pathname names the raw database file.
 */
function rawDatabaseRequest(pathname: string): boolean {
  return /\.db$/i.test(pathname) || /sqlite|faun\.db/i.test(pathname);
}

/** The built faces the static lane serves — the extension allowlist of the
 * family build (the hashed bundles, the deploy faces, the fonts). Every
 * other extension refuses before the filesystem is ever consulted: the
 * engine sources (.ts), the manifests (.json), the runtime stores and any
 * stray file inside the static root never answer bytes — the faun seal of
 * the root-emit build. */
const STATIC_FACES = [
  ".html",
  ".js",
  ".mjs",
  ".css",
  ".svg",
  ".png",
  ".ico",
  ".webmanifest",
  ".xml",
  ".txt",
  ".woff",
  ".woff2",
  ".webp",
  ".map",
] as const;

/**
 * Answers whether one pathname names a servable static face — the allowlist
 * verdict of the root-emit seal: an extensionless path stays a spa route
 * (the entry rewrite answers it), a face extension answers its file, every
 * other extension refuses outright.
 *
 * @param pathname the raw url pathname.
 * @returns true when the pathname may resolve inside the static lane.
 */
function servableFace(pathname: string): boolean {
  const name = (pathname.split("/").pop() ?? "").toLowerCase();
  if (!name.includes(".")) return true;
  return STATIC_FACES.some((extension) => name.endsWith(extension));
}

/**
 * Resolves the static root of the site face — VAULT_STATIC_DIR (the
 * container pins it to the assembled site volume), defaulting to the
 * application root itself (the family build law: the hashed bundles land
 * flat beside the entry, so the root IS the built tree — the face
 * allowlist below keeps every non-face extension out of the lane).
 *
 * @returns the configured static root.
 */
function staticRoot(): string {
  return process.env.VAULT_STATIC_DIR ?? ".";
}

/**
 * Serves the static lane of one request: when the static root exists on
 * this host, every non-api path resolves inside it — a real file answers
 * with its content type and the shared security headers, the extensionless
 * routes fall back to the spa entry (the same rewrite the pages, netlify
 * and vercel lanes ride), and a missing asset answers an honest 404. The
 * database faces refuse before the filesystem is ever consulted. A host
 * without a static root (the library seats, the tests) keeps the plain
 * route answers.
 *
 * @param res the response to answer.
 * @param pathname the raw url pathname.
 * @param head true when the request is a HEAD.
 * @returns true when this lane answered (false falls through to the route surface).
 */
function serveStatic(res: ServerResponse, pathname: string, head: boolean): boolean {
  const root = path.resolve(staticRoot());
  if (!statSync(root, { throwIfNoEntry: false })?.isDirectory()) {
    return false;
  }
  if (sealedFace(pathname)) {
    sendError(res, 403, "VAULT_DBFILE", "a database file never answers from the static lane — the faun seal holds");
    return true;
  }
  if (!servableFace(pathname)) {
    sendError(res, 404, "VAULT_STATIC", "a non-face path never answers from the static lane — the root-emit seal holds");
    return true;
  }
  const candidate = staticCandidate(root, pathname);
  if (candidate !== undefined && sealedFace(candidate)) {
    sendError(res, 403, "VAULT_DBFILE", "a database file never answers from the static lane — the faun seal holds");
    return true;
  }
  if (candidate !== undefined && statSync(candidate, { throwIfNoEntry: false })?.isFile()) {
    sendStaticFile(res, candidate, head);
    return true;
  }
  if (isSpaRoute(pathname)) {
    const entry = path.join(root, "index.html");
    if (statSync(entry, { throwIfNoEntry: false })?.isFile()) {
      sendStaticFile(res, entry, head);
      return true;
    }
  }
  sendError(res, 404, "VAULT_STATIC", `no static face answers ${pathname}`);
  return true;
}

/**
 * Answers whether one pathname is a database face the lane refuses (case
 * insensitive — the sidecars ride the same seal as the store file).
 *
 * @param pathname the raw url pathname.
 * @returns true when the pathname names a database face.
 */
function sealedFace(pathname: string): boolean {
  const lower = pathname.toLowerCase();
  return SEALED_FACES.some((face) => lower.endsWith(face));
}

/**
 * Resolves one pathname inside the static root — the traversal attempts
 * (encoded or plain) never explore outside the root.
 *
 * @param root the resolved static root.
 * @param pathname the raw url pathname.
 * @returns the absolute candidate, or undefined when the path escapes the root.
 */
function staticCandidate(root: string, pathname: string): string | undefined {
  const decoded = safeDecode(pathname);
  if (decoded.includes("\0")) {
    return undefined;
  }
  const relative = path.posix.normalize(decoded).replace(/^\/+/, "");
  if (relative.split("/").includes("..")) {
    return undefined;
  }
  const resolved = path.resolve(root, relative);
  if (resolved === root) {
    // the bare root answers no file itself — the clean root rides back and
    // the request-derived path only ever passes the prefix guard below
    return root;
  }
  if (!resolved.startsWith(`${root}${path.sep}`)) {
    return undefined;
  }
  return resolved;
}

/**
 * Answers whether one pathname is an spa route — the entry rewrites it the
 * way the platform lanes do: the root, or any path whose last segment
 * carries no extension. A file-like miss (a broken hashed face, a missing
 * icon) stays an honest 404 instead of the entry.
 *
 * @param pathname the raw url pathname.
 * @returns true when the spa fallback owns the path.
 */
function isSpaRoute(pathname: string): boolean {
  const segment = pathname.split("/").filter(Boolean).pop() ?? "";
  return !segment.includes(".");
}

/**
 * Answers one static file — its content type off the extension table, its
 * byte length, and the security headers the _headers doctrine stamps on
 * the platform lanes (the engine carries the same trio when it serves the
 * face itself).
 *
 * @param res the response to answer.
 * @param file the resolved file inside the static root.
 * @param head true when the request is a HEAD (the headers ride, the bytes never).
 */
function sendStaticFile(res: ServerResponse, file: string, head: boolean): void {
  const bytes = readFileSync(file);
  const extension = file.slice(file.lastIndexOf(".") + 1);
  res.writeHead(200, {
    "content-type": STATIC_MIME[extension] ?? "application/octet-stream",
    "content-length": String(bytes.length),
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "referrer-policy": "strict-origin-when-cross-origin",
  });
  res.end(head ? undefined : bytes);
}

/* ------------------------------------------------------------------ */
/* the json and http plumbing                                          */
/* ------------------------------------------------------------------ */

/** the json projection of one ledger object — bigint pointers as decimal strings. */
function jsonOfObject(object: LedgerObject): Record<string, unknown> {
  return {
    id: object.id,
    projectId: object.projectId,
    path: object.path,
    mime: object.mime,
    size: object.size.toString(),
    digest: object.digest,
    channel: object.channel,
    bucket: object.bucket,
    tier: object.tier,
    createdAt: object.createdAt,
  };
}

/** the json projection of one project with its quota row. */
function jsonOfProject(project: {
  id: string;
  name: string;
  region: string;
  createdAt: string;
  quota: { projectId: string; limitBytes: bigint | null; updatedAt: string };
}): Record<string, unknown> {
  return {
    id: project.id,
    name: project.name,
    region: project.region,
    createdAt: project.createdAt,
    quota: {
      limitBytes: project.quota.limitBytes === null ? null : project.quota.limitBytes.toString(),
      updatedAt: project.quota.updatedAt,
    },
  };
}

/** the json projection of one project list row — the lean shape with the owner pointer. */
function jsonOfProjectSummary(row: {
  id: string;
  name: string;
  region: string;
  accountId: string | null;
  createdAt: string;
}): Record<string, unknown> {
  return { id: row.id, name: row.name, region: row.region, accountId: row.accountId, createdAt: row.createdAt };
}

/** the json projection of one quota verdict. */
function jsonOfVerdict(verdict: QuotaVerdict): Record<string, unknown> {
  return {
    state: verdict.state,
    usage: verdict.usage.toString(),
    limit: verdict.limit === null ? null : verdict.limit.toString(),
    incoming: verdict.incoming.toString(),
    remaining: verdict.remaining === null ? null : verdict.remaining.toString(),
  };
}

/** reads one header — first value when the platform answers an array. */
function headerOf(req: IncomingMessage, name: string): string {
  const value = req.headers[name];
  if (value === undefined) {
    return "";
  }
  return Array.isArray(value) ? (value[0] ?? "") : value;
}

/** decodes a url-encoded header value, falling back to the raw text on a malformed escape. */
function safeDecode(text: string): string {
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
}

/** the cors headers the platform gateway and the sol pages call through — the token headers ride the allow list so an honest caller may present the bearer. */
function applyCors(res: ServerResponse): void {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader(
    "access-control-allow-headers",
    "content-type, authorization, x-vault-token, x-project-id, x-database-id, x-object-path, x-object-mime, x-object-bucket",
  );
}

/** answers one json payload with the status (the declared length rides the
 * utf-8 byte count — the copy lanes carry em-dashes and middots, and a
 * utf-16 char count would truncate every multibyte payload). */
function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json",
    "content-length": String(Buffer.byteLength(payload, "utf8")),
  });
  res.end(payload);
}

/** answers one standardized failure — { error: { code, message } } (the
 * extra headers ride the writeHead, the rate lane's retry-after among them). */
function sendError(
  res: ServerResponse,
  status: number,
  code: string,
  message: string,
  headers: Record<string, string> = {},
): void {
  const payload = JSON.stringify({ error: { code, message } });
  res.writeHead(status, {
    "content-type": "application/json",
    "content-length": String(Buffer.byteLength(payload, "utf8")),
    ...headers,
  });
  res.end(payload);
}

/* the direct boot — `node api.ts` serves the storage truth (and the built
 * site face when a static root answers) on the resolved port. */
const invokedDirectly = process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedDirectly) {
  const server = createVaultServer();
  const port = await listenVault(server);
  const authState = vaultTokenConfigured()
    ? "token gate armed"
    : sessionSecretConfigured()
      ? "account door armed (no operator token — set VAULT_TOKEN for the admin lane)"
      : "SEALED — set VAULT_TOKEN to open the storage routes";
  const staticState = statSync(path.resolve(staticRoot()), { throwIfNoEntry: false })?.isDirectory()
    ? `serving the site face from ${path.resolve(staticRoot())}`
    : "no static root (set VAULT_STATIC_DIR to serve the built site beside the engine)";
  console.log(
    `vault api listening on port ${port} (storage driver: ${storageDriverKind()}, auth: ${authState}, site: ${staticState})`,
  );
  process.once("SIGINT", () => {
    server.close();
  });
}

