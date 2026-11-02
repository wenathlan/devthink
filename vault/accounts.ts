// # accounts — the identity lane of the vault: the person door the
// supabase law promises. A person signs up (email + password), signs in,
// and registers an application — the application already carries its own
// id ([a-z0-9]{12}, issued by the vault, never named by the caller) and
// its own api key. The password rides scrypt over node:crypto (no new
// dependency, a random salt per hash, timing-safe verify); the session
// rides a random 256-bit token answered once in an httpOnly
// SameSite=Strict cookie — only its sha-256 hash lands in the sessions
// row, and nothing of the session ever touches the browser's localStorage
// (the owner's word: never saved in the browser). The api key rides the
// same law: "vk_" + 32 nanoid chars answered exactly once at issuance,
// the row keeps the sha-256 and the readable prefix, and a revoked key
// refuses without erasing its history.
//
// The tables live in drizzle.ts (accounts, sessions, apikeys — the boot
// DDL lays them down idempotently beside the storage truth); this module
// owns the behavior only. Time on these rows is bigint epoch milliseconds
// (the 64-bit cell, widened to real bigint), the family pointer law.
//
// @section passwords — scrypt hashes (node:crypto, no new dependency)
// @section ids — the nanoid-like generators ([a-z0-9]{12})
// @section accounts — signup and login
// @section sessions — the httpOnly cookie lane (sha-256 token hashes)
// @section projects — the owned scopes and their api keys

import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { and, desc, eq, lte } from "drizzle-orm";
import { accounts, apiKeys, projects, sessions, storage } from "./drizzle.ts";
import { createProject, type ProjectRow } from "./objectsledger.ts";
import { QUOTA_FLOOR_BYTES, readQuota } from "./quota.ts";
import { sha256Hex } from "./sha.ts";

/** @section passwords */

/** the scrypt cost (N) every vault password hash rides. */
const SCRYPT_N = 16384;
/** the scrypt block size (r). */
const SCRYPT_R = 8;
/** the scrypt parallelization (p). */
const SCRYPT_P = 1;
/** the derived key length in bytes. */
const SCRYPT_KEYLEN = 64;
/** the random salt length in bytes. */
const SCRYPT_SALTLEN = 16;
/** the stored-hash scheme marker. */
const SCRYPT_SCHEME = "scrypt";

/**
 * Hashes one password with scrypt — a fresh random salt per hash, the
 * parameters pinned, and the stored shape "scrypt$salt$hash" (hex) so the
 * verify lane can never mistake a foreign shape for its own.
 *
 * @param password the raw password text.
 * @returns the stored hash shape.
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(SCRYPT_SALTLEN);
  const derived = scryptSync(password, salt, SCRYPT_KEYLEN, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P });
  return `${SCRYPT_SCHEME}$${salt.toString("hex")}$${derived.toString("hex")}`;
}

/** a fixed dummy hash the missing-account lane verifies against (the timing law: a wrong email burns the same scrypt second a wrong password does). */
const DUMMY_HASH = `${SCRYPT_SCHEME}$${"00".repeat(SCRYPT_SALTLEN)}$${"00".repeat(SCRYPT_KEYLEN)}`;

/**
 * Verifies one password against a stored scrypt shape — timing safe, and a
 * malformed or foreign stored shape refuses honestly instead of throwing.
 *
 * @param password the raw password text.
 * @param stored the stored hash shape.
 * @returns true only when the password derives the stored hash.
 */
export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== SCRYPT_SCHEME) {
    return false;
  }
  const salt = Buffer.from(parts[1], "hex");
  const expected = Buffer.from(parts[2], "hex");
  if (salt.length === 0 || expected.length === 0 || expected.length > 1024) {
    return false;
  }
  const derived = scryptSync(password, salt, expected.length, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P });
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

/** the honest email shape: one @, a dotted domain, no whitespace, bounded length (linear, never a nested quantifier). */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates one email address — the shape the signup and login doors read.
 *
 * @param email the candidate address.
 * @returns true when the address answers the shape.
 */
export function emailValid(email: string): boolean {
  return email.length >= 5 && email.length <= 254 && EMAIL_PATTERN.test(email);
}

/**
 * Validates one password — 8 to 200 characters (the length is the only
 * law; the content belongs to the person).
 *
 * @param password the candidate password.
 * @returns true when the password answers the shape.
 */
export function passwordValid(password: string): boolean {
  return password.length >= 8 && password.length <= 200;
}

/** @section ids */

/** the alphabet of the nanoid-like generators (lowercase base36). */
const NANO_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
/** the rejection window — every accepted byte maps uniform (36 * 7 = 252 ≤ 256, no modulo bias). */
const NANO_WINDOW = Math.floor(256 / NANO_ALPHABET.length) * NANO_ALPHABET.length;

/**
 * One nanoid-like string of [a-z0-9] — rejection-sampled off node:crypto,
 * no dependency, no modulo bias.
 *
 * @param length the answer length.
 * @returns the id.
 */
function nanoIdOf(length: number): string {
  let id = "";
  while (id.length < length) {
    const bytes = randomBytes(length * 2);
    for (const byte of bytes) {
      if (byte >= NANO_WINDOW) {
        continue;
      }
      id += NANO_ALPHABET[byte % NANO_ALPHABET.length];
      if (id.length === length) {
        break;
      }
    }
  }
  return id;
}

/**
 * The project identity shape the owned lane issues: [a-z0-9]{12} — the
 * person never names the scope, the vault does.
 *
 * @returns one fresh project id.
 */
export function projectNanoId(): string {
  return nanoIdOf(12);
}

/** the account identity shape: "acc-" + [a-z0-9]{12}. */
function accountNanoId(): string {
  return `acc-${nanoIdOf(12)}`;
}

/** @section accounts */

/** One account row of the identity lane — the person identity. */
export interface AccountRow {
  /** the account identity */
  id: string;
  /** the normalized login email */
  email: string;
  /** the role — "owner" while the single-person law holds */
  role: string;
  /** the creation instant — a 64-bit bigint pointer in epoch milliseconds */
  createdAt: bigint;
}

/** the raw projection sqlite answers (created_at rides the 64-bit cell). */
type AccountRowSql = { id: string; email: string; role: string; createdAt: number | bigint };

/** Widens one raw row into the account row — the ms pointer becomes a real bigint. */
function accountRowOf(row: AccountRowSql): AccountRow {
  return { id: row.id, email: row.email, role: row.role, createdAt: BigInt(row.createdAt) };
}

/** the explicit column projection every account read answers (no select *, never the password hash). */
const ACCOUNT_COLUMNS = { id: accounts.id, email: accounts.email, role: accounts.role, createdAt: accounts.createdAt };

/** The refusal the identity lane answers: the code the routes translate and the why. */
export type IdentityRefusal = { code: "VAULT_INVALID" | "VAULT_EMAIL_TAKEN" | "VAULT_AUTH"; why: string };

/** One issued session — the raw token answers once, the row keeps only its sha-256. */
export interface SessionIssued {
  /** the raw token — set in the httpOnly cookie, never stored */
  token: string;
  /** the expiry instant — a 64-bit bigint pointer in epoch milliseconds */
  expiresAt: bigint;
}

/** The auth answer: the account with its fresh session, or the refusal. */
export type AuthAnswer = { account: AccountRow; session: SessionIssued } | { refusal: IdentityRefusal };

/**
 * Signs one person up — the supabase law: the email is unique (the honest
 * duplicate refusal), the password rides scrypt, and the answer carries
 * the first session so the signup already lands signed in.
 *
 * @param email the login email (normalized lowercase at the door).
 * @param password the raw password.
 * @returns the account with its first session, or the refusal.
 */
export function signupAccount(email: string, password: string): AuthAnswer {
  const normalized = email.trim().toLowerCase();
  if (!emailValid(normalized)) {
    return { refusal: { code: "VAULT_INVALID", why: "the email must be one honest address (name@domain.tld)" } };
  }
  if (!passwordValid(password)) {
    return { refusal: { code: "VAULT_INVALID", why: "the password must carry 8 to 200 characters" } };
  }
  const id = accountNanoId();
  try {
    storage
      .insert(accounts)
      .values({
        id,
        email: normalized,
        passwordHash: hashPassword(password),
        role: "owner",
        createdAt: BigInt(Date.now()),
      })
      .run();
  } catch (error) {
    /* the unique door: two signups of one email race, the constraint answers — the honest refusal, never a crash */
    if (String(error).includes("UNIQUE")) {
      return { refusal: { code: "VAULT_EMAIL_TAKEN", why: `the email "${normalized}" already holds an account` } };
    }
    throw error;
  }
  const row = storage.select(ACCOUNT_COLUMNS).from(accounts).where(eq(accounts.id, id)).get();
  if (row === undefined) {
    throw new Error(`the account row "${id}" did not land`);
  }
  return { account: accountRowOf(row), session: openSession(id) };
}

/**
 * Signs one person in — the email and the password must both answer, and a
 * missing account burns the same scrypt lane a wrong password does (the
 * refusal never leaks which half was wrong).
 *
 * @param email the login email.
 * @param password the raw password.
 * @returns the account with a fresh session, or the refusal.
 */
export function loginAccount(email: string, password: string): AuthAnswer {
  const normalized = email.trim().toLowerCase();
  const row = storage
    .select({ ...ACCOUNT_COLUMNS, passwordHash: accounts.passwordHash })
    .from(accounts)
    .where(eq(accounts.email, normalized))
    .get();
  if (row === undefined) {
    verifyPassword(password, DUMMY_HASH);
    return { refusal: { code: "VAULT_AUTH", why: "the email or the password did not answer" } };
  }
  if (!verifyPassword(password, row.passwordHash)) {
    return { refusal: { code: "VAULT_AUTH", why: "the email or the password did not answer" } };
  }
  return { account: accountRowOf(row), session: openSession(row.id) };
}

/** @section sessions */

/** how long one session lives (ms) — seven days, the patient default. */
export const SESSION_TTL_MS = 7n * 24n * 60n * 60n * 1000n;

/**
 * Opens one session for an account — the raw 256-bit token answers once
 * (the cookie lane), only its sha-256 hash lands in the row, and the
 * expired sessions sweep on the way in (the table never grows stale).
 *
 * @param accountId the signed-in account.
 * @returns the issued session.
 */
export function openSession(accountId: string): SessionIssued {
  const now = BigInt(Date.now());
  const token = randomBytes(32).toString("base64url");
  storage.delete(sessions).where(lte(sessions.expiresAt, now)).run();
  storage
    .insert(sessions)
    .values({ tokenHash: sha256Hex(token), accountId, expiresAt: now + SESSION_TTL_MS, createdAt: now })
    .run();
  return { token, expiresAt: now + SESSION_TTL_MS };
}

/**
 * Reads the account one session token answers for — the sha-256 lookup,
 * the expiry re-checked at read time (an expired session refuses even
 * though the row still lives until the next sweep).
 *
 * @param token the raw cookie token.
 * @returns the account, or undefined when no live session answers.
 */
export function sessionAccountOf(token: string): AccountRow | undefined {
  const row = storage
    .select({ ...ACCOUNT_COLUMNS, expiresAt: sessions.expiresAt })
    .from(sessions)
    .innerJoin(accounts, eq(sessions.accountId, accounts.id))
    .where(eq(sessions.tokenHash, sha256Hex(token)))
    .get();
  if (row === undefined || BigInt(row.expiresAt) <= BigInt(Date.now())) {
    return undefined;
  }
  return accountRowOf(row);
}

/**
 * Ends one session — the logout lane: the row leaves, the cookie clears.
 *
 * @param token the raw cookie token.
 */
export function endSession(token: string): void {
  storage.delete(sessions).where(eq(sessions.tokenHash, sha256Hex(token))).run();
}

/** @section projects */

/** the readable prefix length of an api key (the "vk_xxxxxxxx" the console shows afterwards). */
const API_KEY_PREFIX_LENGTH = 11;

/** One issued api key — the raw key answers exactly once, at issuance. */
export interface ApiKeyIssued {
  /** the key row identity */
  id: string;
  /** the project the key unlocks */
  projectId: string;
  /** the readable prefix ("vk_xxxxxxxx") */
  prefix: string;
  /** the raw key — answered once here, only the sha-256 lands in the row */
  key: string;
}

/**
 * Issues one api key for a project — "vk_" + 32 nanoid chars; the row
 * keeps the sha-256, the readable prefix and the issuance instant.
 *
 * @param projectId the project the key unlocks.
 * @returns the issued key.
 */
export function issueProjectApiKey(projectId: string): ApiKeyIssued {
  const key = `vk_${nanoIdOf(32)}`;
  const id = `key-${nanoIdOf(12)}`;
  const prefix = key.slice(0, API_KEY_PREFIX_LENGTH);
  storage
    .insert(apiKeys)
    .values({ id, projectId, keyHash: sha256Hex(key), prefix, createdAt: BigInt(Date.now()) })
    .onConflictDoNothing()
    .run();
  const row = storage.select({ id: apiKeys.id }).from(apiKeys).where(eq(apiKeys.keyHash, sha256Hex(key))).get();
  if (row === undefined) {
    throw new Error(`the api key row of "${projectId}" did not land`);
  }
  return { id: row.id, projectId, prefix, key };
}

/**
 * Reads the project one presented api key unlocks — the sha-256 lookup,
 * the revoked key refuses, and the last-use instant stamps on the way in.
 *
 * @param key the raw presented key.
 * @returns the project the key unlocks, or undefined when no live key answers.
 */
export function projectApiKeyOf(key: string): { projectId: string; keyId: string } | undefined {
  const row = storage
    .select({ id: apiKeys.id, projectId: apiKeys.projectId, revokedAt: apiKeys.revokedAt })
    .from(apiKeys)
    .where(eq(apiKeys.keyHash, sha256Hex(key)))
    .get();
  if (row === undefined || row.revokedAt !== null) {
    return undefined;
  }
  storage.update(apiKeys).set({ lastUsedAt: BigInt(Date.now()) }).where(eq(apiKeys.id, row.id)).run();
  return { projectId: row.projectId, keyId: row.id };
}

/** The owned-project answer: the project with its first api key, or the refusal. */
export type OwnedProjectAnswer = { project: ProjectRow; apiKey: ApiKeyIssued } | { refusal: { why: string } };

/**
 * Registers one application for the signed-in person — the supabase law:
 * the project id is issued by the vault ([a-z0-9]{12}, collision-checked),
 * the scope lands with its 900MB quota floor through the real ledger
 * creation, and the first api key answers exactly once in this call.
 *
 * @param accountId the signed-in account.
 * @param name the human name (optional — the id answers when empty).
 * @returns the project with its first api key, or the refusal.
 */
export function createOwnedProject(accountId: string, name?: string): OwnedProjectAnswer {
  const owner = storage.select({ id: accounts.id }).from(accounts).where(eq(accounts.id, accountId)).get();
  if (owner === undefined) {
    return { refusal: { why: "the account does not exist — the session lane refused an honest answer" } };
  }
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const id = projectNanoId();
    const taken = storage.select({ id: projects.id }).from(projects).where(eq(projects.id, id)).get();
    if (taken !== undefined) {
      continue;
    }
    const answer = createProject(id, name === undefined || name.trim() === "" ? id : name.trim(), accountId);
    if (answer.project === undefined) {
      return { refusal: { why: answer.refusal?.why ?? "the project was refused" } };
    }
    return { project: answer.project, apiKey: issueProjectApiKey(id) };
  }
  return { refusal: { why: "the id lane collided too many times — try again" } };
}

/**
 * Lists the projects one account owns — newest first, bounded to two
 * hundred rows, each with its quota row (the floor answers for a legacy
 * row that never wrote one).
 *
 * @param accountId the owning account.
 * @returns the owned projects.
 */
export function ownedProjects(accountId: string): ProjectRow[] {
  return storage
    .select({
      id: projects.id,
      name: projects.name,
      region: projects.region,
      ownerAccountId: projects.ownerAccountId,
      createdAt: projects.createdAt,
    })
    .from(projects)
    .where(eq(projects.ownerAccountId, accountId))
    .orderBy(desc(projects.createdAt), desc(projects.id))
    .limit(200)
    .all()
    .map((row) => ({
      id: row.id,
      name: row.name,
      region: row.region,
      ownerAccountId: row.ownerAccountId,
      createdAt: row.createdAt,
      quota:
        readQuota(storage, row.id) ?? { projectId: row.id, limitBytes: QUOTA_FLOOR_BYTES, updatedAt: row.createdAt },
    }));
}

/**
 * Answers whether one account owns one project — the scope gate the
 * storage routes read (a session only reaches its own scopes).
 *
 * @param accountId the account.
 * @param projectId the project.
 * @returns true when the account owns the project.
 */
export function accountOwnsProject(accountId: string, projectId: string): boolean {
  const row = storage
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.ownerAccountId, accountId)))
    .get();
  return row !== undefined;
}
