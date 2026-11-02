// # signup — the signup lane of the vault storage engine (the wave D
// rewire): the person's door onto the network database. The full flow the
// supabase-law product answers: the user signs up (an account on the site
// store, the password stored only as a salted sha-256 digest — the sha.ts
// lane, never plaintext at rest), registers an app/database, and gets their
// own Database ID plus an API key displayed exactly once — the plaintext key
// rides exactly the one creation answer and never lands anywhere else: not
// in the database (only its sha-256 digest is stored), not in any log, never
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

import { randomBytes, randomUUID } from "node:crypto";
import { db, execute, queryAll, queryOne } from "./db.ts";
import { QUOTA_FLOOR_BYTES } from "./quota.ts";
import { sha256Hex } from "./sha.ts";

/** @section shapes */

/** one account row: the person's identity on the site store (the password
 * never rides the row — only its salted digest). */
export interface AccountRow {
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
const EMAIL_PATTERN = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{1,24}$/;

/** the shortest password the lane accepts (the honest floor, no complexity theatre). */
export const PASSWORD_FLOOR = 8;

/**
 * Validates an email for the signup lane.
 *
 * @param email the candidate email.
 * @returns true when the email answers the shape.
 */
export function emailValid(email: string): boolean {
  return EMAIL_PATTERN.test(email);
}

/**
 * The salted digest of one password — the sha-256 lane over the account id
 * (the salt) and the password: the site store never holds a plaintext
 * secret at rest, and equal passwords on different accounts answer
 * different digests.
 *
 * @param accountId the salt of the digest (the account's own id).
 * @param password the plaintext password (never stored).
 * @returns the hex digest the account row carries.
 */
export function passwordDigest(accountId: string, password: string): string {
  return sha256Hex(`${accountId}:${password}`);
}

/** the typed refusal the signup lane answers. */
export type SignupRefusal =
  | { kind: "invalid"; why: string }
  | { kind: "taken"; why: string }
  | { kind: "absent"; why: string }
  | { kind: "wrong"; why: string };

/** the signup answer: the account row, or the refusal. */
export type SignupAnswer = { account: AccountRow } | { refusal: SignupRefusal };

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
  if (!emailValid(trimmed)) {
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
    [id, trimmed, passwordDigest(id, password)],
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
export type SigninAnswer = { account: AccountRow; databases: DatabaseRow[] } | { refusal: SignupRefusal };

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
  if (passwordDigest(row.id, password) !== row.passwordDigest) {
    return { refusal: { kind: "wrong", why: "the password does not answer the account" } };
  }
  return {
    account: { id: row.id, email: row.email, createdAt: row.createdAt },
    databases: databasesOfAccount(row.id),
  };
}

/** the account row of one id (the internal lane the routes ride). */
export function accountOf(accountId: string): AccountRow | undefined {
  return queryOne<{ id: string; email: string; createdAt: string }>(
    "SELECT id, email, createdAt FROM accounts WHERE id = ?",
    [accountId],
  );
}

/** the account row of one email (the credential lane the register route rides). */
export function accountOfEmail(email: string): AccountRow | undefined {
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
export function ensurePersonAccount(email: string, password: string): AccountRow {
  const existing = accountOfEmail(email);
  if (existing !== undefined) {
    return existing;
  }
  const landed = signupAccount(email, password);
  if (landed.account !== undefined) {
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
export function accountVerified(email: string, password: string): AccountRow | undefined {
  const row = queryOne<{ id: string; passwordDigest: string }>(
    "SELECT id, passwordDigest FROM accounts WHERE email = ?",
    [email.trim().toLowerCase()],
  );
  if (row === undefined || passwordDigest(row.id, password) !== row.passwordDigest) {
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
