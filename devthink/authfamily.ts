/**
 * authfamily.ts — the ONE keyed file of the auth/identity family (root layer).
 *
 * The owner's law: every family of correlated logic lives in one keyed file
 * with a name that says the family. This file carries the whole
 * authentication and identity family of the platform — the local browser
 * account, the device identity and pairing ledger, the outbound url gate,
 * the provider oauth row contract, the server account lane and the browser
 * client of that lane — merged from six root modules (accountgate.ts,
 * identity.ts, urlgate.ts, oauthrow.ts, accountlane.ts, accountclient.ts)
 * with every export preserved under the same name and signature and the
 * duplicated helpers deduped to one survivor each:
 *
 *   - normalizeaccountowner + ACCOUNTPATTERN — ONE survivor (§5); the
 *     accountclient face rides the same one (the former client twin).
 *   - SESSIONTOKENPATTERN — ONE survivor (§5); the browser bearer reads and
 *     the restore section reuses it (the former BEARERPATTERN).
 *   - sha256hex — ONE survivor (§2); the pairing ledger digests and the
 *     account lane session digests share it (the former identity `digest`
 *     and accountlane `sha256hex` copies).
 *   - accountgate's web-crypto `digest` stays the distinct browser
 *     primitive of §1 (a different runtime primitive, documented in place).
 *
 * The one deliberate rename: the browser client's exchange call is exported
 * as `exchangeoauthcodeclient` — the server lane's `exchangeoauthcode`
 * (§5) owns the family name, and one module cannot carry two different
 * implementations under one export.
 *
 * @section 1  accountgate — the local browser account of the os
 * @section 2  identity — the device identity and the pairing ledger
 * @section 3  urlgate — the one door for the server url requests
 * @section 4  oauthrow — the provider row contract of the owner entry flow
 * @section 5  accountlane — the server-side account lane
 * @section 6  accountclient — the browser client of the account lane
 */

import { createHash, randomBytes, randomInt, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { lookup } from "node:dns/promises";
import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { type DevThinkPaths, ensurePaths, resolvePaths } from "./config.js";
import { createCompactId } from "./ids.js";
import { sharedatabasedriver } from "./storage.js";
import { browserIdentity, readBrowserCredential, readBrowserPreferences, saveBrowserCredential, saveBrowserPreference } from "./db.ts";
import { PREF_GATEWAYBASE, normalizeGatewayBase } from "./gatewaybase.ts";
import { gatewayContext } from "./gateway.ts";

/* ============================================================================
 * @section 1 — accountgate: the local browser account of the os.
 * ========================================================================== */

/**
 * accountgate — the account contract of the os (root logic layer): the
 * local credential the visitor creates on the sign-in face, stored in the
 * browser database (the os HD) through the credential vault of db.ts. The
 * password never rides the network and never lands in plain text: the gate
 * keeps only a salted SHA-256 digest (the salt is the device id of the
 * local identity, so the digest is bound to this machine's HD). The state
 * machine is the Windows one: a machine without an account asks for the
 * name and the password creation; a machine with one asks for the password
 * alone and answers the wrong-try verdict.
 */

/** the reserved credential slot of the account inside the vault */
export const ACCOUNT_CREDENTIAL_ID = "devthink.account";

/** the display-name preference key inside the local database */
export const ACCOUNT_NAME_KEY = "displayName";

/** whether this machine's HD already holds an account */
export type AccountState = "absent" | "ready";

async function digest(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const hash = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/** the stored verifier of this machine, or null when the account is absent */
async function storedVerifier(): Promise<string | null> {
  return readBrowserCredential(ACCOUNT_CREDENTIAL_ID).catch(() => null);
}

/** reads the account state of this machine's HD */
export async function accountstate(): Promise<AccountState> {
  return (await storedVerifier()) ? "ready" : "absent";
}

/** creates the local account: the display name lands on the preferences
 * and the salted password digest lands on the credential vault */
export async function createAccount(name: string, password: string): Promise<void> {
  const identity = await browserIdentity();
  const verifier = `${identity.deviceId}:${await digest(`${identity.deviceId}:${password}`)}`;
  await saveBrowserCredential(ACCOUNT_CREDENTIAL_ID, verifier);
  if (name.trim()) await saveBrowserPreference(ACCOUNT_NAME_KEY, name.trim());
}

/** verifies a password attempt against this machine's verifier */
export async function verifyAccount(password: string): Promise<boolean> {
  const verifier = await storedVerifier();
  if (!verifier) return false;
  const separator = verifier.indexOf(":");
  if (separator < 0) return false;
  const salt = verifier.slice(0, separator);
  return verifier.slice(separator + 1) === (await digest(`${salt}:${password}`));
}

/** replaces the account password (the visitor authenticated to reach here) */
export async function replaceAccountPassword(password: string): Promise<void> {
  const identity = await browserIdentity();
  const verifier = `${identity.deviceId}:${await digest(`${identity.deviceId}:${password}`)}`;
  await saveBrowserCredential(ACCOUNT_CREDENTIAL_ID, verifier);
}

/* ============================================================================
 * @section 2 — identity: the device identity and the pairing ledger.
 * ========================================================================== */

/**
 * identity — the local identity and pairing ledger of the workbench (root
 * layer).
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

/**
 * Sha-256 hex digest — the only form secrets (codes, tokens) take on disk.
 * The one survivor of the family: the pairing ledger (this section) and the
 * account lane session digests (§5) share it.
 */
function sha256hex(value: string): string {
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
    codeHash: sha256hex(oneTimeCode),
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
  const supplied = Buffer.from(sha256hex(oneTimeCode));
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
    tokenHash: sha256hex(token),
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
  const tokenHash = sha256hex(token);
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

/* ============================================================================
 * @section 3 — urlgate: the one door for the server url requests.
 * ========================================================================== */

/**
 * urlgate — the one door for the server url requests (root layer).
 *
 * Every outbound http request the server side makes rides this gate and
 * only this gate. The law the gate enforces: http and https only; EVERY
 * hostname resolves through node:dns/promises lookup with all:true, and
 * every resolved address must answer PUBLIC — loopback, private, link-
 * local, unique-local, v4-mapped, v4-compatible, this-network, cgnat,
 * benchmark, documentation, nat64, discard-only, multicast, broadcast and
 * reserved addresses refuse BY ADDRESS. The classification reads the
 * resolved octets and groups the lookup answered, never the hostname
 * text — a name is never trusted, no textual allowlist or denylist runs,
 * and no hostname literal exists in this module at all. A host that does
 * not resolve refuses; embedded credentials refuse. gatedrequest carries
 * the request with bounded, re-validated redirects (every hop resolves
 * and classifies again, a cross-origin hop starts clean), a byte cap on
 * the answer and a wall clock cap on the whole trip. GateError is the
 * refusal shape the callers map to honest answers.
 *
 * @subsection addresses — the resolved-address classification (public or refuse)
 * @subsection door — the url gate and the bounded request surface
 */

/**
 * @subsection addresses — the resolved-address classification (public or
 * refuse). Every check below reads the ADDRESS the resolver answered:
 * octets for ipv4, expanded groups for ipv6.
 */

/** MAXANSWERBYTES — the answer byte cap the gate enforces on every read. */
export const MAXANSWERBYTES = 2_000_000;

/** GATETIMEOUTMS — the wall clock cap of one gated trip. */
export const GATETIMEOUTMS = 15_000;

/** MAXREDIRECTS — the redirect hops one gated trip may walk. */
export const MAXREDIRECTS = 5;

/** GateError — the gate's own refusal: the message stays honest and short. */
export class GateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GateError";
  }
}

/** IPV4PATTERN — the dotted quad shape the octet classification reads. */
const IPV4PATTERN = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

/** IPV4TAILPATTERN — an embedded dotted quad of a v4-mapped or compatible v6. */
const IPV4TAILPATTERN = /^(.*:)(\d{1,3}(?:\.\d{1,3}){3})$/;

/** GROUPPATTERN — one hexadecimal ipv6 group. */
const GROUPPATTERN = /^[0-9a-f]{1,4}$/;

/** ipv4public — the verdict for four resolved octets: false is a refusal. */
function ipv4public(octets: number[]): boolean {
  const first = octets[0];
  const second = octets[1];
  const third = octets[2];
  if (first === 0) return false; // this-network
  if (first === 10) return false; // private
  if (first === 127) return false; // loopback
  if (first === 169 && second === 254) return false; // link-local
  if (first === 172 && second >= 16 && second <= 31) return false; // private
  if (first === 192 && second === 168) return false; // private
  if (first === 100 && second >= 64 && second <= 127) return false; // cgnat shared space
  if (first === 192 && second === 0 && (third === 0 || third === 2)) return false; // protocol assignments, documentation
  if (first === 198 && (second === 18 || second === 19)) return false; // benchmark
  if (first === 198 && second === 51 && third === 100) return false; // documentation
  if (first === 203 && second === 0 && third === 113) return false; // documentation
  if (first >= 224) return false; // multicast, reserved, broadcast
  return true;
}

/** ipv6public — the verdict for eight resolved groups: false is a refusal. */
function ipv6public(groups: number[]): boolean {
  const g0 = groups[0];
  const g1 = groups[1];
  const g2 = groups[2];
  const g3 = groups[3];
  const g4 = groups[4];
  const g5 = groups[5];
  const g6 = groups[6];
  if (g0 === 0 && g1 === 0 && g2 === 0 && g3 === 0 && g4 === 0 && g5 === 0 && g6 === 0) return false; // unspecified, loopback, v4-compatible
  if (g0 === 0 && g1 === 0 && g2 === 0 && g3 === 0 && g4 === 0 && g5 === 0xffff) return false; // v4-mapped
  if ((g0 & 0xfe00) === 0xfc00) return false; // unique-local fc00::/7
  if ((g0 & 0xffc0) === 0xfe80) return false; // link-local fe80::/10
  if ((g0 & 0xff00) === 0xff00) return false; // multicast ff00::/8
  if (g0 === 0x2001 && g1 === 0x0db8) return false; // documentation 2001:db8::/32
  if (g0 === 0x2001 && g1 === 0x0000) return false; // reserved 2001:0000::/32
  if (g0 === 0x0064 && g1 === 0xff9b) return false; // nat64 64:ff9b::/96
  if (g0 === 0x0100 && g1 === 0 && g2 === 0 && g3 === 0) return false; // discard-only 100::/64
  return true;
}

/** ipv6groups — expand one ipv6 address into its eight numeric groups. */
function ipv6groups(address: string): number[] | null {
  let text = address.toLowerCase();
  if (text.includes(".")) {
    const tail = text.match(IPV4TAILPATTERN);
    if (!tail) return null;
    const octets = tail[2].split(".").map(Number);
    if (
      octets.length !== 4 ||
      octets.some((value) => !Number.isInteger(value) || value < 0 || value > 255)
    ) {
      return null;
    }
    const high = ((octets[0] << 8) | octets[1]).toString(16);
    const low = ((octets[2] << 8) | octets[3]).toString(16);
    text = [tail[1], high, low].join("");
  }
  const halves = text.split("::");
  if (halves.length > 2) return null;
  let groups: string[];
  if (halves.length === 2) {
    const left = halves[0] ? halves[0].split(":") : [];
    const right = halves[1] ? halves[1].split(":") : [];
    const fill = 8 - left.length - right.length;
    if (fill < 0) return null;
    const filler: string[] = [];
    for (let index = 0; index < fill; index += 1) filler.push("0");
    groups = [...left, ...filler, ...right];
  } else {
    groups = text.split(":");
  }
  if (groups.length !== 8) return null;
  const numbers: number[] = [];
  for (const group of groups) {
    if (!GROUPPATTERN.test(group)) return null;
    numbers.push(parseInt(group, 16));
  }
  return numbers;
}

/**
 * ispublicaddress — the one verdict the gate asks of every resolved
 * address: the family picks the classifier, anything else refuses.
 *
 * @param address the resolved address the lookup answered.
 * @param family the address family (4 or 6).
 * @returns true only when the address is public unicast space.
 */
export function ispublicaddress(address: string, family: number): boolean {
  if (family === 4) {
    const match = address.match(IPV4PATTERN);
    if (!match) return false;
    const octets = [match[1], match[2], match[3], match[4]].map(Number);
    if (octets.some((value) => !Number.isInteger(value) || value < 0 || value > 255)) return false;
    return ipv4public(octets);
  }
  if (family === 6) {
    const groups = ipv6groups(address);
    if (!groups) return false;
    return ipv6public(groups);
  }
  return false;
}

/**
 * resolvepublichost — resolve one hostname through dns lookup all:true and
 * refuse unless EVERY resolved address is public. A non-resolving host
 * refuses; a host answering one non-public address refuses — the verdict
 * rides the resolved addresses alone, never the hostname text.
 */
async function resolvepublichost(hostname: string): Promise<void> {
  let answers: Array<{ address: string; family: number }>;
  try {
    answers = await lookup(hostname, { all: true, verbatim: true });
  } catch {
    throw new GateError("the host did not resolve");
  }
  if (!Array.isArray(answers) || answers.length === 0) throw new GateError("the host did not resolve");
  for (const answer of answers) {
    if (!ispublicaddress(answer.address, answer.family)) {
      throw new GateError("the host resolved to a non-public address");
    }
  }
}

/**
 * @subsection door — the url gate and the bounded request surface.
 */

/**
 * gateurl — the shape guard of one url: absolute http or https, no
 * embedded credentials, a host present. Anything else is a GateError.
 *
 * @param value the url to gate.
 * @returns the parsed url, safe to resolve and fetch.
 */
export function gateurl(value: string | URL): URL {
  let url: URL;
  try {
    url = value instanceof URL ? new URL(value.toString()) : new URL(value);
  } catch {
    throw new GateError("the url did not parse");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new GateError("only http and https ride the gate");
  }
  if (url.username || url.password) throw new GateError("the url carries embedded credentials");
  if (!url.hostname) throw new GateError("the url carries no host");
  return url;
}

/** gatedrequestoptions — the knobs one gated trip accepts. */
export type gatedrequestoptions = {
  /** the http method (default GET). */
  method?: string;
  /** form fields encoded as the urlencoded body of a POST/PUT/PATCH. */
  form?: Record<string, string>;
  /** extra request headers. */
  headers?: Record<string, string>;
  /** the answer byte cap (default MAXANSWERBYTES). */
  maxbytes?: number;
  /** the whole-trip wall clock cap in ms (default GATETIMEOUTMS). */
  timeoutms?: number;
};

/** gatedanswer — the capped answer one gated trip returns. */
export type gatedanswer = { status: number; headers: Headers; body: string };

/** REDIRECTSTATUSES — the statuses the gate walks, re-validating every hop. */
const REDIRECTSTATUSES = [301, 302, 303, 307, 308];

/** BODYMETHODS — the methods that carry the form body. */
const BODYMETHODS = ["POST", "PUT", "PATCH"];

/** boundedanswer — read the response body under the byte cap. */
async function boundedanswer(response: Response, maxbytes: number): Promise<string> {
  const declared = Number(response.headers.get("content-length") || "0");
  if (Number.isFinite(declared) && declared > maxbytes) throw new GateError("the answer rode past the byte cap");
  const reader = response.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxbytes) {
      try {
        await reader.cancel();
      } catch {
        /* the read is over either way */
      }
      throw new GateError("the answer rode past the byte cap");
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk))).toString("utf8");
}

/**
 * gatedrequest — the one door: resolve the host public, fetch with
 * redirects held manual, re-validate every hop (a cross-origin hop starts
 * clean), bound the answer bytes and the trip wall clock. The refusal is
 * always a GateError, never a silent pass.
 *
 * @param target the url to request.
 * @param options the method, form, headers and caps of the trip.
 * @returns the status, headers and capped body text of the final answer.
 */
export async function gatedrequest(target: string | URL, options: gatedrequestoptions = {}): Promise<gatedanswer> {
  let current = gateurl(target);
  let method = (options.method || "GET").toUpperCase();
  let form = options.form;
  let callerheaders = options.headers;
  const maxbytes = options.maxbytes ?? MAXANSWERBYTES;
  const timeoutms = options.timeoutms ?? GATETIMEOUTMS;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutms);
  try {
    for (let hop = 0; ; hop += 1) {
      if (hop > MAXREDIRECTS) throw new GateError("the redirect chain ran past the bound");
      await resolvepublichost(current.hostname);
      const headers = new Headers(callerheaders || {});
      let body: string | undefined;
      if (form && BODYMETHODS.includes(method)) {
        body = new URLSearchParams(form).toString();
        headers.set("content-type", "application/x-www-form-urlencoded");
      }
      let response: Response;
      try {
        response = await fetch(current.toString(), {
          method,
          headers,
          body,
          redirect: "manual",
          signal: ctrl.signal,
        });
      } catch {
        if (ctrl.signal.aborted) throw new GateError("the gated trip ran past the time cap");
        throw new GateError("the gated request did not answer");
      }
      if (REDIRECTSTATUSES.includes(response.status)) {
        const location = response.headers.get("location");
        if (!location) throw new GateError("the redirect carried no location");
        const next = gateurl(new URL(location, current).toString());
        if (next.origin !== current.origin) {
          // a cross origin hop starts clean: no caller headers ride along
          callerheaders = undefined;
        }
        if (response.status === 303 || ((response.status === 301 || response.status === 302) && method !== "GET")) {
          method = "GET";
          form = undefined;
        }
        current = next;
        continue;
      }
      const bodytext = await boundedanswer(response, maxbytes);
      return { status: response.status, headers: response.headers, body: bodytext };
    }
  } finally {
    clearTimeout(timer);
  }
}

/* ============================================================================
 * @section 4 — oauthrow: the provider row contract of the owner entry flow.
 * ========================================================================== */

// # oauthrow — the provider row contract of the owner entry flow (root
// layer). The person creates an account with email and password, or signs
// in with google, github and gitlab, because the bots are ready on the
// owner accounts — and the callback page detects the origin by state, a
// single page for all providers. This section owns the PURE half of that
// law: the provider metadata (the authorize endpoints, the scope sets),
// the honest readiness table (a provider is ready only when its env
// client id answered — secrets never in code), the state mint and the
// state marker the single callback parses back, the authorize url builder
// and the pkce pair mint. The browser half (the button row and the
// redirect) rides the auth page; the receiving half rides the callback
// page. The pkce mint follows the RFC 7636 shape the root oauth.ts
// established for the cli family (verifier -> BASE64URL(SHA-256)) — this
// section is the browser surface, so the primitives are the web crypto
// twins, never the node builtins the cli file carries.

/** The provider family of the row: the three owner accounts the bots ride. */
export type OAuthProvider = "google" | "github" | "gitlab";

/** The providers in row order — the buttons render in this order. */
export const OAUTH_PROVIDERS: readonly OAuthProvider[] = ["google", "github", "gitlab"];

/** The authorize endpoints of the family, one per provider. */
export const OAUTH_AUTHORIZE_ENDPOINTS: Readonly<Record<OAuthProvider, string>> = Object.freeze({
  google: "https://accounts.google.com/o/oauth2/v2/auth",
  github: "https://github.com/login/oauth/authorize",
  gitlab: "https://gitlab.com/oauth/authorize",
});

/** The scope sets of the family — the identity floor, nothing more. */
export const OAUTH_SCOPES: Readonly<Record<OAuthProvider, string>> = Object.freeze({
  google: "openid email profile",
  github: "read:user user:email",
  gitlab: "read_user",
});

/** The token endpoints the gateway exchange redeems the code against —
 * the server half of the row contract, ridden through the url gate. */
export const OAUTH_TOKEN_ENDPOINTS: Readonly<Record<OAuthProvider, string>> = Object.freeze({
  google: "https://oauth2.googleapis.com/token",
  github: "https://github.com/login/oauth/access_token",
  gitlab: "https://gitlab.com/oauth/token",
});

/** The profile endpoints the gateway exchange reads the identity from —
 * one request per provider, the identity floor scope only. */
export const OAUTH_PROFILE_ENDPOINTS: Readonly<Record<OAuthProvider, string>> = Object.freeze({
  google: "https://openidconnect.googleapis.com/v1/userinfo",
  github: "https://api.github.com/user",
  gitlab: "https://gitlab.com/api/v4/user",
});

/** The env names the client ids ride (the ids land with the gateway
 * configuration — the code never carries them). */
export const OAUTH_ID_ENV: Readonly<Record<OAuthProvider, string>> = Object.freeze({
  google: "VITE_OAUTH_GOOGLE_ID",
  github: "VITE_OAUTH_GITHUB_ID",
  gitlab: "VITE_OAUTH_GITLAB_ID",
});

/** The env name the callback base rides. */
export const OAUTH_CALLBACK_ENV = "VITE_OAUTH_CALLBACK";

/** The callback base of the owner accounts when the env stays silent. */
export const OAUTH_CALLBACK_DEFAULT = "https://auth.devthink.pro/callback";

/** The state marker every minted state carries: devthink:<provider>:<random>. */
export const OAUTH_STATE_MARKER = "devthink";

/** Which providers accept the pkce s256 challenge (github accepts it for apps). */
const OAUTH_PKCE: Readonly<Record<OAuthProvider, boolean>> = Object.freeze({
  google: true,
  github: true,
  gitlab: true,
});

/** One provider of the honest readiness table. */
export interface ProviderRowEntry {
  /** which provider this row is. */
  provider: OAuthProvider;
  /** the configured client id, "" when the env did not answer — never an invented id. */
  clientId: string;
  /** the honest verdict: an id is configured, or it is not. */
  ready: boolean;
}

/** The honest readiness table of the row. */
export interface ProviderRowView {
  /** the three providers in row order. */
  providers: readonly ProviderRowEntry[];
  /** the callback base every redirect_uri of the row rides. */
  callbackBase: string;
}

/**
 * Reads one env value: the explicit record first (the tests pass a
 * literal), then import.meta.env when the build carries it, "" otherwise.
 * The value is trimmed — a blank id is no id.
 *
 * @param key the env name to read.
 * @param env the env override record, when the caller owns one.
 * @returns the trimmed value, or "" when nothing answered.
 */
function readenvvalue(key: string, env?: Readonly<Record<string, string | undefined>>): string {
  let raw: string | undefined;
  if (env) {
    raw = env[key];
  } else if (typeof import.meta.env !== "undefined") {
    raw = import.meta.env[key] as string | undefined;
  }
  return typeof raw === "string" ? raw.trim() : "";
}

/**
 * The honest readiness table of the provider row: a provider is ready only
 * when its env client id answered a non-empty value, and the callback base
 * is the env value or the owner default. A missing env stays missing — the
 * row renders the unconfigured note, never a fake redirect.
 *
 * @param env the env override record (the tests), defaults to the build env.
 * @returns the table the auth row renders from.
 */
export function providerRow(env?: Readonly<Record<string, string | undefined>>): ProviderRowView {
  const callbackBase = readenvvalue(OAUTH_CALLBACK_ENV, env) || OAUTH_CALLBACK_DEFAULT;
  const providers = OAUTH_PROVIDERS.map((provider) => {
    const clientId = readenvvalue(OAUTH_ID_ENV[provider], env);
    return { provider, clientId, ready: clientId.length > 0 };
  });
  return { providers, callbackBase };
}

/**
 * Mints the state of one round trip: the marker devthink:<provider>:<random>
 * (crypto.randomUUID), the single callback parses the provider back out of
 * it — one page for all providers.
 *
 * @param provider the provider the row starts the trip for.
 * @returns the fresh state value the authorize url carries.
 */
export function newOAuthState(provider: OAuthProvider): string {
  return [OAUTH_STATE_MARKER, provider, globalThis.crypto.randomUUID()].join(":");
}

/**
 * Parses the state marker the callback receives — the callback side of the
 * row contract.
 *
 * @param state the raw state param of the callback url.
 * @returns the provider the round trip started from, or null when the state
 * is absent, malformed or names no provider of the row — the callback then
 * answers the unknown-origin face.
 */
export function detectProviderFromState(state: string | null | undefined): OAuthProvider | null {
  if (typeof state !== "string") return null;
  const marker = [OAUTH_STATE_MARKER, ":"].join("");
  if (!state.startsWith(marker)) return null;
  const rest = state.slice(marker.length);
  const separator = rest.indexOf(":");
  if (separator <= 0) return null;
  const provider = rest.slice(0, separator);
  const random = rest.slice(separator + 1);
  if (!random) return null;
  if (provider !== "google" && provider !== "github" && provider !== "gitlab") return null;
  return provider;
}

/**
 * Builds the authorize url of one provider round trip — the pure builder,
 * the same URLSearchParams shape the root oauth.ts buildAuthUrl established
 * for the cli family: client_id from the honest env read, redirect_uri the
 * callback base, response_type code, the scope set of the provider, the
 * state marker, and the pkce s256 challenge when the provider accepts one.
 *
 * @param provider which provider the round trip rides.
 * @param state the minted state (newOAuthState) the callback parses back.
 * @param codeChallenge the s256 challenge (mintPkcePair), or null to ride
 * state-only.
 * @param env the env override record (the tests), defaults to the build env.
 * @returns the authorize url — only a ready provider owns a meaningful one,
 * the row checks the table before it redirects.
 */
export function buildAuthorizeUrl(
  provider: OAuthProvider,
  state: string,
  codeChallenge: string | null,
  env?: Readonly<Record<string, string | undefined>>,
): string {
  const row = providerRow(env);
  const entry = row.providers.find((candidate) => candidate.provider === provider);
  const params = new URLSearchParams({
    client_id: entry?.clientId ?? "",
    redirect_uri: row.callbackBase,
    response_type: "code",
    scope: OAUTH_SCOPES[provider],
    state,
  });
  if (codeChallenge && OAUTH_PKCE[provider]) {
    params.set("code_challenge", codeChallenge);
    params.set("code_challenge_method", "S256");
  }
  return [OAUTH_AUTHORIZE_ENDPOINTS[provider], "?", params.toString()].join("");
}

/** One pkce pair, the RFC 7636 shape: the verifier and its s256 challenge. */
export interface PkcePair {
  /** the verifier the round trip parks and the exchange redeems. */
  verifier: string;
  /** BASE64URL(SHA-256(verifier)) — the challenge the authorize url carries. */
  challenge: string;
}

/**
 * Mints one pkce pair for the browser row — the web crypto twin of the
 * generatePKCE the root oauth.ts mints for the cli family: 64 random bytes
 * -> base64url verifier, challenge the sha-256 digest of it.
 *
 * @returns the verifier/challenge pair the authorize url and the parking
 * slot share.
 */
export async function mintPkcePair(): Promise<PkcePair> {
  const bytes = new Uint8Array(64);
  globalThis.crypto.getRandomValues(bytes);
  const verifier = base64url(bytes);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  const challenge = base64url(new Uint8Array(digest));
  return { verifier, challenge };
}

/**
 * The sessionStorage key the auth row parks the verifier of one provider
 * under — the exchange (the gateway wave) redeems it later.
 *
 * @param provider the provider the round trip rides.
 * @returns the parking slot name (dt.oauth.verifier.<provider>).
 */
export function oauthVerifierKey(provider: OAuthProvider): string {
  return `dt.oauth.verifier.${provider}`;
}

/** Encodes bytes as base64url without padding — the RFC 7636 alphabet. */
function base64url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/* ============================================================================
 * @section 5 — accountlane: the server-side account lane.
 * ========================================================================== */

/**
 * accountlane — the server-side account lane the family signs in
 * through (root layer).
 *
 * The owner's law: the account is REAL — it lives on the server, in the
 * shared sqlite store of the family infrastructure, never only in the
 * visitor browser. This section rides the same seam the storage lane
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
 * @subsection store — the account database file and the lazy schema
 * @subsection accounts — the owner normalization, the create and the verify
 * @subsection sessions — the family session issue, verify and revoke
 * @subsection exchange — the oauth code exchange over the url gate
 */

/**
 * @subsection store — the account database file and the lazy schema.
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
 * @subsection accounts — the owner normalization, the create and the verify.
 * The owner is the normalized handle of the account; the secret is never
 * stored — only the scrypt digest of it, bound to a per-account salt.
 */

/** The owner shape: the compact handle the lane normalizes every input to.
 * The ONE survivor of the family — the accountclient face (§6) rides the
 * same pattern through the same normalizeaccountowner below. */
const ACCOUNTPATTERN = /^[a-z0-9][a-z0-9-]{2,63}$/i;

/** The session bearer shape: 64 hex characters, the randomBytes(32) mint.
 * The ONE survivor of the family — the browser cache (§6) reads the same
 * shape through this pattern (the former client BEARERPATTERN). */
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
 * answer refuses — the caller owns the honest error. The accountclient
 * face (§6) rides this same survivor (the former client twin deduped).
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
 * @subsection sessions — the family session issue, verify and revoke. The
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
 * @subsection exchange — the oauth code exchange over the url gate. The
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

/* ============================================================================
 * @section 6 — accountclient: the browser client of the account lane.
 * ========================================================================== */

/**
 * accountclient — the browser client of the server-side account lane.
 *
 * The entry faces stop pretending when a devthink server answers: this
 * section is the one seam between the entry surfaces and the real account
 * routes of server.ts — the account creation, the sign in, the oauth
 * exchange the callback page completes, the session summary and the
 * revoke. Every call resolves the server base through the same gateway
 * machinery the sandbox client rides: the paired gateway context first
 * (the guarded ?gateway= base with its ephemeral bearer), then the chat's
 * registered gateway preference. The verdict union keeps the three honest
 * outcomes apart — the lane answered and signed in, the lane answered and
 * refused, the lane never answered (offline) — so the faces declare the
 * fallback instead of pretending. The section keeps no state of its own
 * beyond the family session the pages save: the bearer rides sessionStorage (the disposable cache of the server session, never the canonical store)
 * under devthink.account.token, the owner under devthink.account.owner.
 * No secret is ever stored — the family session token is a server-minted
 * bearer, the account secret never leaves the password field but as the
 * request body the lane digests.
 *
 * The owner normalization (normalizeaccountowner) and the bearer shape
 * (SESSIONTOKENPATTERN) ride the ONE survivors of §5 — the former client
 * twins are deduped. The browser exchange call is exported as
 * `exchangeoauthcodeclient`: the server lane's `exchangeoauthcode` (§5)
 * owns the family name, and one module carries one implementation per
 * export.
 */

/**
 * @subsection shapes — the wire contracts of the account routes and the
 * verdict union every surface reads.
 */

/** One family session as the lane issues it (the token answers once). */
export type ServerSession = { owner: string; token: string; expiresAt: number; createdAt?: string };

/** The honest verdict of one account call: ok, refused, or the lane absent. */
export type AccountVerdict =
  | { verdict: "ok"; session: ServerSession }
  | { verdict: "refused"; error: string }
  | { verdict: "offline" };

/** One live session as the summary route answers it. */
export type AccountSessionState = { owner: string; createdAt: string; expiresAt: number };

/** The sessionStorage slot of the family session bearer. */
export const ACCOUNT_TOKEN_KEY = "devthink.account.token";

/** The sessionStorage slot of the account owner handle. */
export const ACCOUNT_OWNER_KEY = "devthink.account.owner";

/** TIMEOUTMS — the call bound: a lane that has not answered within ten
 * seconds answers offline (the caller falls back, the face never hangs). */
const TIMEOUTMS = 10_000;

/**
 * @subsection lane — the base resolution and the one bounded fetch every
 * surface rides.
 */

/** accountlane — resolve one lane call site: the paired gateway context
 * first, else the chat's registered gateway preference. Neither present
 * answers an empty base and the call falls back without touching the wire. */
async function accountlane(): Promise<{ base: string; token?: string }> {
  const context = gatewayContext();
  if (context.url) return { base: context.url, token: context.token };
  let registered = "";
  try {
    const prefs = await readBrowserPreferences();
    registered = normalizeGatewayBase(prefs[PREF_GATEWAYBASE] ?? "");
  } catch {
    registered = "";
  }
  return { base: registered };
}

/** accountfetch — one bounded json call against the resolved lane base:
 * the bearer rides when the pairing context carries one, the abort
 * controller bounds the wait at TIMEOUTMS, and every failure mode — no
 * base, network error, timeout, unreadable body — answers null so the
 * caller declares the offline verdict honestly. */
async function accountfetch(path: string, init?: RequestInit): Promise<{ status: number; payload: unknown } | null> {
  const lane = await accountlane();
  if (!lane.base) return null;
  const headers = new Headers(init?.headers);
  if (lane.token) headers.set("authorization", ["Bearer ", lane.token].join(""));
  if (init?.body && !headers.has("content-type")) headers.set("content-type", "application/json");
  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), TIMEOUTMS);
  try {
    const response = await fetch([lane.base, path].join(""), { ...init, headers, signal: ctrl.signal, credentials: "include" });
    const payload: unknown = await response.json().catch(() => null);
    return { status: response.status, payload };
  } catch {
    return null;
  } finally {
    window.clearTimeout(timer);
  }
}

/** errorof — the honest refusal message of a lane error body. */
function errorof(payload: unknown): string {
  if (payload && typeof payload === "object") {
    const message = (payload as { error?: unknown }).error;
    if (typeof message === "string" && message) return message;
  }
  return "the lane refused the request";
}

/** sessionof — the honest shape check of a session answer body. */
function sessionof(payload: unknown): ServerSession | null {
  if (!payload || typeof payload !== "object") return null;
  const body = payload as { owner?: unknown; token?: unknown; expiresAt?: unknown; createdAt?: unknown };
  if (typeof body.owner !== "string" || !body.owner) return null;
  if (typeof body.token !== "string" || !body.token) return null;
  if (typeof body.expiresAt !== "number") return null;
  const session: ServerSession = { owner: body.owner, token: body.token, expiresAt: body.expiresAt };
  if (typeof body.createdAt === "string") session.createdAt = body.createdAt;
  return session;
}

/**
 * @subsection surface — the five calls the entry surfaces ride, one per
 * account route. Every call answers the verdict union; the offline branch
 * is the lane-absent branch, never a disguised refusal.
 */

/** createserveraccount — POST /api/v1/accounts: the real account creation
 * with the family session issued in the same answer. */
export async function createserveraccount(owner: string, secret: string): Promise<AccountVerdict> {
  const answer = await accountfetch("/api/v1/accounts", {
    method: "POST",
    body: JSON.stringify({ owner, secret }),
  });
  if (!answer) return { verdict: "offline" };
  const session = answer.status === 201 ? sessionof(answer.payload) : null;
  if (session) return { verdict: "ok", session };
  return { verdict: "refused", error: errorof(answer.payload) };
}

/** signinserveraccount — POST /api/v1/accounts/session: the password
 * entry against the lane. */
export async function signinserveraccount(owner: string, secret: string): Promise<AccountVerdict> {
  const answer = await accountfetch("/api/v1/accounts/session", {
    method: "POST",
    body: JSON.stringify({ owner, secret }),
  });
  if (!answer) return { verdict: "offline" };
  const session = answer.status === 200 ? sessionof(answer.payload) : null;
  if (session) return { verdict: "ok", session };
  return { verdict: "refused", error: errorof(answer.payload) };
}

/** exchangeoauthcodeclient — POST /api/v1/auth/exchange: the callback page
 * redeems the provider code through the gateway wave. The client twin of
 * the lane's exchangeoauthcode (§5); the lane owns the family name, so the
 * browser call rides the client-suffixed export. */
export async function exchangeoauthcodeclient(
  provider: string,
  code: string,
  verifier: string,
  redirectUri: string,
): Promise<AccountVerdict> {
  const answer = await accountfetch("/api/v1/auth/exchange", {
    method: "POST",
    body: JSON.stringify({ provider, code, verifier, redirectUri }),
  });
  if (!answer) return { verdict: "offline" };
  const session = answer.status === 201 ? sessionof(answer.payload) : null;
  if (session) return { verdict: "ok", session };
  return { verdict: "refused", error: errorof(answer.payload) };
}

/** accountsessionstate — GET /api/v1/accounts/session with the stored
 * bearer: the live family session of this browser, or null. */
export async function accountsessionstate(): Promise<AccountSessionState | null> {
  const bearer = accountbearer();
  if (!bearer) return null;
  const answer = await accountfetch("/api/v1/accounts/session", {
    headers: { authorization: ["Bearer ", bearer].join("") },
  });
  if (!answer || answer.status !== 200 || !answer.payload || typeof answer.payload !== "object") return null;
  const body = answer.payload as { owner?: unknown; createdAt?: unknown; expiresAt?: unknown };
  if (typeof body.owner !== "string" || typeof body.createdAt !== "string" || typeof body.expiresAt !== "number") {
    return null;
  }
  return { owner: body.owner, createdAt: body.createdAt, expiresAt: body.expiresAt };
}

/** revokeaccountsessionbearer — DELETE /api/v1/accounts/session with the
 * stored bearer: the sign out of the family for this browser. */
export async function revokeaccountsessionbearer(): Promise<boolean> {
  const bearer = accountbearer();
  if (!bearer) return false;
  const answer = await accountfetch("/api/v1/accounts/session", {
    method: "DELETE",
    headers: { authorization: ["Bearer ", bearer].join("") },
  });
  return answer !== null && answer.status === 200;
}

/**
 * @subsection storage — the family session slots the pages read and clear.
 */

/** saveaccountsession — park the family session the lane issued. */
export function saveaccountsession(token: string, owner: string): void {
  try {
    window.sessionStorage.setItem(ACCOUNT_TOKEN_KEY, token);
    window.sessionStorage.setItem(ACCOUNT_OWNER_KEY, owner);
  } catch {
    /* storage unavailable: the session lives for this page load only */
  }
}

/** clearaccountsession — drop the parked family session (after a revoke). */
export function clearaccountsession(): void {
  try {
    window.sessionStorage.removeItem(ACCOUNT_TOKEN_KEY);
    window.sessionStorage.removeItem(ACCOUNT_OWNER_KEY);
  } catch {
    /* storage unavailable */
  }
}

/** accountbearer — the stored bearer, or the empty answer when absent.
 * Reads the ONE bearer shape of the family (§5 SESSIONTOKENPATTERN). */
export function accountbearer(): string {
  try {
    const token = window.sessionStorage.getItem(ACCOUNT_TOKEN_KEY) || "";
    return SESSIONTOKENPATTERN.test(token) ? token : "";
  } catch {
    return "";
  }
}

/** storedaccountowner — the owner handle of the last family session. */
export function storedaccountowner(): string {
  try {
    return window.sessionStorage.getItem(ACCOUNT_OWNER_KEY) || "";
  } catch {
    return "";
  }
}

/**
 * @subsection restore — the persistent sign in of the family.
 *
 * The server mints an HttpOnly family cookie at every session door; the
 * restore call rides that cookie (credentials included, no local bearer
 * required) and the lane answers a rotated session. The canonical state
 * stays server side forever — the visitor side only ever parks the
 * disposable cache copy this section already owns.
 */

/** The one shared restore of this page load: every surface awaits the same
 * promise, the lane is asked once, the cache parks once. */
let restorepromise: Promise<AccountSessionState | null> | null = null;

/** restoreonce — the persistent sign in restore: with no local bearer the
 * call still carries the family cookie, and a live lane answer rotates the
 * session and parks the fresh cache copy. Answers the live session state
 * (from the rotation or the stored bearer verification) or null. */
export function restoreonce(): Promise<AccountSessionState | null> {
  if (restorepromise) return restorepromise;
  restorepromise = (async () => {
    const stored = accountbearer();
    if (stored) {
      const state = await accountsessionstate();
      if (state) return state;
      // the parked bearer is expired or revoked server side — drop the cache
      clearaccountsession();
    }
    const answer = await accountfetch("/api/v1/accounts/session");
    if (!answer || answer.status !== 200 || !answer.payload || typeof answer.payload !== "object") return null;
    const body = answer.payload as {
      owner?: unknown;
      createdAt?: unknown;
      expiresAt?: unknown;
      token?: unknown;
      rotated?: unknown;
    };
    if (typeof body.owner !== "string" || typeof body.createdAt !== "string" || typeof body.expiresAt !== "number") {
      return null;
    }
    if (body.rotated === true && typeof body.token === "string" && SESSIONTOKENPATTERN.test(body.token)) {
      saveaccountsession(body.token, body.owner);
    }
    return { owner: body.owner, createdAt: body.createdAt, expiresAt: body.expiresAt };
  })();
  return restorepromise;
}
