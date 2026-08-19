import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { ensurePaths, type DevThinkPaths } from "./config.ts";
import { createCompactId } from "./ids.ts";

export type DevThinkIdentity = { version: 1; userId: string; deviceId: string; createdAt: string };
export type PairingRecord = { id: string; userId: string; deviceId: string; codeHash?: string; createdAt: string; expiresAt: number; usedAt?: string; revokedAt?: string };
export type BrowserSession = { id: string; userId: string; deviceId: string; tokenHash: string; createdAt: string; expiresAt: number; revokedAt?: string };
type PairingStore = { version: 1; pairings: PairingRecord[]; sessions: BrowserSession[] };

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const codeLength = 8;
const pairingLifetimeMs = 5 * 60 * 1000;
const browserSessionLifetimeMs = 15 * 60 * 1000;

function digest(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function privateWrite(path: string, value: unknown): void {
  const temporary = `${path}.${process.pid}.${Date.now()}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  renameSync(temporary, path);
}

function createId(prefix: string): string {
  return createCompactId(prefix);
}

function code(): string {
  return Array.from({ length: codeLength }, () => alphabet[randomInt(alphabet.length)]).join("");
}

export function getIdentity(paths: DevThinkPaths): DevThinkIdentity {
  ensurePaths(paths);
  try {
    if (existsSync(paths.identity)) {
      const parsed: unknown = JSON.parse(readFileSync(paths.identity, "utf8"));
      if (parsed && typeof parsed === "object" && typeof (parsed as DevThinkIdentity).userId === "string" && typeof (parsed as DevThinkIdentity).deviceId === "string") return parsed as DevThinkIdentity;
    }
  } catch {}
  const identity: DevThinkIdentity = { version: 1, userId: createId("u"), deviceId: createId("d"), createdAt: new Date().toISOString() };
  privateWrite(paths.identity, identity);
  return identity;
}

function readStore(paths: DevThinkPaths): PairingStore {
  try {
    if (existsSync(paths.pairings)) {
      const parsed: unknown = JSON.parse(readFileSync(paths.pairings, "utf8"));
      if (parsed && typeof parsed === "object" && Array.isArray((parsed as PairingStore).pairings) && Array.isArray((parsed as PairingStore).sessions)) return parsed as PairingStore;
    }
  } catch {}
  return { version: 1, pairings: [], sessions: [] };
}

function writeStore(paths: DevThinkPaths, store: PairingStore): void {
  ensurePaths(paths);
  privateWrite(paths.pairings, store);
}

function active(store: PairingStore): PairingStore {
  const now = Date.now();
  return { version: 1, pairings: store.pairings.filter((record) => record.expiresAt > now || Boolean(record.usedAt) || Boolean(record.revokedAt)).slice(-100), sessions: store.sessions.filter((session) => session.expiresAt > now && !session.revokedAt).slice(-100) };
}

export function createPairing(paths: DevThinkPaths, lifetimeMs = pairingLifetimeMs): { identity: DevThinkIdentity; pairingId: string; code: string; expiresAt: number } {
  const identity = getIdentity(paths);
  const store = active(readStore(paths));
  const pairingId = createId("p");
  const oneTimeCode = code();
  const expiresAt = Date.now() + lifetimeMs;
  store.pairings.push({ id: pairingId, userId: identity.userId, deviceId: identity.deviceId, codeHash: digest(oneTimeCode), createdAt: new Date().toISOString(), expiresAt });
  writeStore(paths, store);
  return { identity, pairingId, code: oneTimeCode, expiresAt };
}

/** Builds a one-time workbench invitation without embedding any provider credential. */
export function createPairingLink(pagesUrl: string | undefined, gatewayUrl: string | undefined, pairingId: string, oneTimeCode: string): string | undefined {
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

export function consumePairing(paths: DevThinkPaths, pairingId: string, oneTimeCode: string, sessionLifetimeMs = browserSessionLifetimeMs): { token: string; identity: DevThinkIdentity; expiresAt: number } | undefined {
  const store = active(readStore(paths));
  const record = store.pairings.find((candidate) => candidate.id === pairingId && !candidate.usedAt && !candidate.revokedAt && candidate.expiresAt > Date.now());
  if (!record?.codeHash) return undefined;
  const supplied = Buffer.from(digest(oneTimeCode));
  const stored = Buffer.from(record.codeHash);
  if (supplied.length !== stored.length || !timingSafeEqual(supplied, stored)) return undefined;
  const token = createId("pt");
  const expiresAt = Date.now() + sessionLifetimeMs;
  record.usedAt = new Date().toISOString();
  delete record.codeHash;
  store.sessions.push({ id: createId("bs"), userId: record.userId, deviceId: record.deviceId, tokenHash: digest(token), createdAt: new Date().toISOString(), expiresAt });
  writeStore(paths, store);
  return { token, identity: getIdentity(paths), expiresAt };
}

export function verifyBrowserSession(paths: DevThinkPaths, token: string | undefined): BrowserSession | undefined {
  if (!token) return undefined;
  const store = active(readStore(paths));
  const tokenHash = digest(token);
  const session = store.sessions.find((candidate) => candidate.tokenHash === tokenHash && candidate.expiresAt > Date.now() && !candidate.revokedAt);
  writeStore(paths, store);
  return session;
}

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

export function pairingStatus(paths: DevThinkPaths): { identity: DevThinkIdentity; activePairs: number; activeSessions: number } {
  const store = active(readStore(paths));
  writeStore(paths, store);
  const identity = getIdentity(paths);
  return { identity, activePairs: store.pairings.filter((record) => record.userId === identity.userId && !record.usedAt && !record.revokedAt && record.expiresAt > Date.now()).length, activeSessions: store.sessions.filter((session) => session.userId === identity.userId && !session.revokedAt && session.expiresAt > Date.now()).length };
}
