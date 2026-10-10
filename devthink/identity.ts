/**
 * identity.ts — the local identity and pairing ledger of the workbench (root layer).
 *
 * One responsibility: own the device identity file and the one-time pairing
 * flow that binds a browser session to it. the identity answers "who runs
 * here" (userId + deviceId, created once, stored 0600); pairings answer
 * "which browser may drive this device" — an 8-character code from a
 * 32-symbol unambiguous alphabet is issued, stored only as a sha-256
 * digest, consumed once with `timingSafeEqual`, and exchanged for a
 * short-lived browser session token that is likewise verified by digest.
 * every write is atomic (tmp file + rename) so a crash never tears the
 * ledger. security-relevant knobs: the pairing lifetime, the session
 * lifetime and the store trims (100 records per kind) are constants below.
 */

import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { type DevThinkPaths, ensurePaths } from "./config.js";
import { createCompactId } from "./ids.js";

export type DevThinkIdentity = { version: 1; userId: string; deviceId: string; createdAt: string };
export type PairingRecord = {
  id: string;
  userId: string;
  deviceId: string;
  codeHash?: string;
  createdAt: string;
  expiresAt: number;
  usedAt?: string;
  revokedAt?: string;
};
export type BrowserSession = {
  id: string;
  userId: string;
  deviceId: string;
  tokenHash: string;
  createdAt: string;
  expiresAt: number;
  revokedAt?: string;
};
type PairingStore = { version: 1; pairings: PairingRecord[]; sessions: BrowserSession[] };

/** Unambiguous pairing-code alphabet: no 0/O or 1/I/L confusions. */
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
/** Pairing code length in symbols (8 symbols of the 32-symbol alphabet). */
const codeLength = 8;
/** How long a fresh one-time pairing code stays redeemable. */
const pairingLifetimeMs = 5 * 60 * 1000;
/** How long a browser session minted from a pairing stays valid. */
const browserSessionLifetimeMs = 15 * 60 * 1000;

/**
 * Validates the canonical form of the public local-person identifier.
 *
 * @param value the raw user-supplied identifier.
 * @returns the trimmed lowercase identifier.
 * @throws when the value is not 10-15 lowercase letters/numbers starting with a letter.
 */
export function normalizePublicUserId(value: string): string {
  const userId = value.trim().toLowerCase();
  if (!/^[a-z][a-z0-9]{9,14}$/.test(userId))
    throw new Error("Public user ID must contain 10-15 lowercase letters or numbers and start with a letter.");
  return userId;
}

/** Sha-256 hex digest — the only form secrets (codes, tokens) take on disk. */
function digest(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/** Atomic 0600 json write: tmp file beside the target, then rename over it. */
function privateWrite(path: string, value: unknown): void {
  const temporary = `${path}.${process.pid}.${Date.now()}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  renameSync(temporary, path);
}

/** Compact id factory scoped to the identity domain. */
function createId(prefix: string): string {
  return createCompactId(prefix);
}

/** Draws one pairing code from the unambiguous alphabet with a CSPRNG. */
function code(): string {
  return Array.from({ length: codeLength }, () => alphabet[randomInt(alphabet.length)]).join("");
}

/**
 * Returns the local identity, creating and persisting it on first run.
 *
 * @param paths the resolved DevThink paths (identity file lives at `paths.identity`).
 * @returns the identity of this device (userId + deviceId), never re-generated while the file survives.
 */
export function getIdentity(paths: DevThinkPaths): DevThinkIdentity {
  ensurePaths(paths);
  try {
    if (existsSync(paths.identity)) {
      const parsed: unknown = JSON.parse(readFileSync(paths.identity, "utf8"));
      if (
        parsed &&
        typeof parsed === "object" &&
        typeof (parsed as DevThinkIdentity).userId === "string" &&
        typeof (parsed as DevThinkIdentity).deviceId === "string"
      )
        return parsed as DevThinkIdentity;
    }
  } catch {
    /* the guarded best-effort operation falls through: the outer flow owns the failure */
  }
  const identity: DevThinkIdentity = {
    version: 1,
    userId: createId("u"),
    deviceId: createId("d"),
    createdAt: new Date().toISOString(),
  };
  privateWrite(paths.identity, identity);
  return identity;
}

/** Updates the public local-person identifier and migrates active local pairing records. */
export function setIdentityUserId(paths: DevThinkPaths, requestedUserId: string): DevThinkIdentity {
  const current = getIdentity(paths);
  const userId = normalizePublicUserId(requestedUserId);
  if (current.userId === userId) return current;
  const next = { ...current, userId };
  privateWrite(paths.identity, next);
  const store = readStore(paths);
  for (const record of store.pairings) if (record.userId === current.userId) record.userId = userId;
  for (const session of store.sessions) if (session.userId === current.userId) session.userId = userId;
  writeStore(paths, store);
  return next;
}

/** Reads the pairing ledger, healing a corrupt or absent store to empty. */
function readStore(paths: DevThinkPaths): PairingStore {
  try {
    if (existsSync(paths.pairings)) {
      const parsed: unknown = JSON.parse(readFileSync(paths.pairings, "utf8"));
      if (
        parsed &&
        typeof parsed === "object" &&
        Array.isArray((parsed as PairingStore).pairings) &&
        Array.isArray((parsed as PairingStore).sessions)
      )
        return parsed as PairingStore;
    }
  } catch {
    /* the guarded best-effort operation falls through: the outer flow owns the failure */
  }
  return { version: 1, pairings: [], sessions: [] };
}

/** Persists the pairing ledger atomically (0600). */
function writeStore(paths: DevThinkPaths, store: PairingStore): void {
  ensurePaths(paths);
  privateWrite(paths.pairings, store);
}

/** Drops expired records and trims both ledgers to the last 100 entries. */
function active(store: PairingStore): PairingStore {
  const now = Date.now();
  return {
    version: 1,
    pairings: store.pairings
      .filter((record) => record.expiresAt > now || Boolean(record.usedAt) || Boolean(record.revokedAt))
      .slice(-100),
    sessions: store.sessions.filter((session) => session.expiresAt > now && !session.revokedAt).slice(-100),
  };
}

/**
 * Issues a fresh one-time pairing: an unredeemed record plus its plaintext code.
 *
 * @param paths the resolved DevThink paths.
 * @param lifetimeMs redeem window override (defaults to 5 minutes).
 * @returns the identity, the pairing id, the plaintext one-time code (shown once, stored only hashed) and the expiry epoch ms.
 */
export function createPairing(
  paths: DevThinkPaths,
  lifetimeMs = pairingLifetimeMs,
): { identity: DevThinkIdentity; pairingId: string; code: string; expiresAt: number } {
  const identity = getIdentity(paths);
  const store = active(readStore(paths));
  const pairingId = createId("p");
  const oneTimeCode = code();
  const expiresAt = Date.now() + lifetimeMs;
  store.pairings.push({
    id: pairingId,
    userId: identity.userId,
    deviceId: identity.deviceId,
    codeHash: digest(oneTimeCode),
    createdAt: new Date().toISOString(),
    expiresAt,
  });
  writeStore(paths, store);
  return { identity, pairingId, code: oneTimeCode, expiresAt };
}

/** Builds a one-time workbench invitation without embedding any provider credential. */
export function createPairingLink(
  pagesUrl: string | undefined,
  gatewayUrl: string | undefined,
  pairingId: string,
  oneTimeCode: string,
): string | undefined {
  if (!pagesUrl || !gatewayUrl) return undefined;
  try {
    const url = new URL(pagesUrl);
    url.searchParams.set("gateway", gatewayUrl);
    url.searchParams.set("pair", pairingId);
    url.searchParams.set("code", oneTimeCode);
    return url.toString();
  } catch {
    return undefined;
  }
}

/**
 * Consumes a one-time pairing and mints a browser session token.
 *
 * the supplied code is compared against the stored sha-256 digest with
 * `timingSafeEqual`, the record is burned (usedAt, codeHash deleted) and a
 * short-lived session token is appended to the ledger.
 *
 * @param paths the resolved DevThink paths.
 * @param pairingId the pairing to redeem.
 * @param oneTimeCode the plaintext code the visitor received.
 * @param sessionLifetimeMs session lifetime override (defaults to 15 minutes).
 * @returns the session token (plaintext, once), the identity and the expiry epoch ms — or undefined when the pairing is unknown, spent, revoked or expired.
 */
export function consumePairing(
  paths: DevThinkPaths,
  pairingId: string,
  oneTimeCode: string,
  sessionLifetimeMs = browserSessionLifetimeMs,
): { token: string; identity: DevThinkIdentity; expiresAt: number } | undefined {
  const store = active(readStore(paths));
  const record = store.pairings.find(
    (candidate) =>
      candidate.id === pairingId && !candidate.usedAt && !candidate.revokedAt && candidate.expiresAt > Date.now(),
  );
  if (!record?.codeHash) return undefined;
  const supplied = Buffer.from(digest(oneTimeCode));
  const stored = Buffer.from(record.codeHash);
  if (supplied.length !== stored.length || !timingSafeEqual(supplied, stored)) return undefined;
  const token = createId("pt");
  const expiresAt = Date.now() + sessionLifetimeMs;
  record.usedAt = new Date().toISOString();
  delete record.codeHash;
  store.sessions.push({
    id: createId("bs"),
    userId: record.userId,
    deviceId: record.deviceId,
    tokenHash: digest(token),
    createdAt: new Date().toISOString(),
    expiresAt,
  });
  writeStore(paths, store);
  return { token, identity: getIdentity(paths), expiresAt };
}

/**
 * Verifies a browser session token against the ledger by digest.
 *
 * @param paths the resolved DevThink paths.
 * @param token the bearer token presented by the browser (undefined tolerated).
 * @returns the live session record, or undefined when the token is unknown, expired or revoked.
 */
export function verifyBrowserSession(paths: DevThinkPaths, token: string | undefined): BrowserSession | undefined {
  if (!token) return undefined;
  const store = active(readStore(paths));
  const tokenHash = digest(token);
  const session = store.sessions.find(
    (candidate) => candidate.tokenHash === tokenHash && candidate.expiresAt > Date.now() && !candidate.revokedAt,
  );
  writeStore(paths, store);
  return session;
}

/**
 * Revokes every live browser session of the local identity.
 *
 * @param paths the resolved DevThink paths.
 * @returns how many sessions were revoked.
 */
export function revokeBrowserSessions(paths: DevThinkPaths): number {
  const store = readStore(paths);
  const identity = getIdentity(paths);
  let count = 0;
  for (const session of store.sessions) {
    if (session.userId === identity.userId && !session.revokedAt) {
      session.revokedAt = new Date().toISOString();
      count += 1;
    }
  }
  writeStore(paths, store);
  return count;
}

/**
 * Summarizes the pairing surface for the status views (and prunes while reading).
 *
 * @param paths the resolved DevThink paths.
 * @returns the identity plus the counts of live pairings and live sessions.
 */
export function pairingStatus(paths: DevThinkPaths): {
  identity: DevThinkIdentity;
  activePairs: number;
  activeSessions: number;
} {
  const store = active(readStore(paths));
  writeStore(paths, store);
  const identity = getIdentity(paths);
  return {
    identity,
    activePairs: store.pairings.filter(
      (record) =>
        record.userId === identity.userId && !record.usedAt && !record.revokedAt && record.expiresAt > Date.now(),
    ).length,
    activeSessions: store.sessions.filter(
      (session) => session.userId === identity.userId && !session.revokedAt && session.expiresAt > Date.now(),
    ).length,
  };
}
