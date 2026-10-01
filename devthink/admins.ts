// # admins — the control plane of the devthink panel: the first user is the
// owner and stays locked, admins resolve from the CODEOWNERS file, the api
// answers only to the authorized family sites, and the devtools guard feeds
// the shared ban table every clone syncs. Everything rides prepared
// statements (bound parameters only — never a concatenated string) and the
// password never lands in the database, only its scrypt digest.
import Database from "better-sqlite3";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export type AdminSource = "owner" | "codeowner" | "ai";
export type Admin = { handle: string; role: string; source: AdminSource; addedAt: string };
export type Ban = { ip: string; reason: string; until: string; strikes: number };
export type AllowedSite = { host: string; secretDigest: string; addedAt: string };
export type AuditEntry = { at: string; actor: string; action: string; detail: string };

const database = new Database(process.env.DEVTHINK_ADMIN_DB ?? "admin.db");
database.pragma("journal_mode = WAL");
database.pragma("foreign_keys = ON");

const schemaAdmins = "CREATE TABLE IF NOT EXISTS admins (handle TEXT PRIMARY KEY, role TEXT NOT NULL DEFAULT 'admin', source TEXT NOT NULL, addedAt TEXT NOT NULL DEFAULT (datetime('now')))";
const schemaBans = "CREATE TABLE IF NOT EXISTS bans (ip TEXT PRIMARY KEY, reason TEXT NOT NULL, until TEXT NOT NULL, strikes INTEGER NOT NULL DEFAULT 1)";
const schemaSites = "CREATE TABLE IF NOT EXISTS allowed_sites (host TEXT PRIMARY KEY, secretDigest TEXT NOT NULL, addedAt TEXT NOT NULL DEFAULT (datetime('now')))";
const schemaAudit = "CREATE TABLE IF NOT EXISTS audit (at TEXT NOT NULL DEFAULT (datetime('now')), actor TEXT NOT NULL, action TEXT NOT NULL, detail TEXT NOT NULL DEFAULT '')";
const schemaSessions = "CREATE TABLE IF NOT EXISTS sessions (tokenDigest TEXT PRIMARY KEY, handle TEXT NOT NULL REFERENCES admins(handle), expiresAt TEXT NOT NULL)";
for (const statement of [schemaAdmins, schemaBans, schemaSites, schemaAudit, schemaSessions]) {
  database.prepare(statement).run();
}

const OWNER_HANDLE = process.env.DEVTHINK_OWNER_HANDLE ?? "wenathlan";
const BAN_BASE_MINUTES = 6;

const seedcount = database.prepare("SELECT COUNT(*) AS total FROM admins").get() as { total: number };
if (seedcount.total === 0) {
  // the bootstrap is locked: the first user is the owner and nothing demotes it
  database.prepare("INSERT INTO admins (handle, role, source) VALUES (?, 'owner', 'owner')").run(OWNER_HANDLE);
}

const listAdmins = database.prepare("SELECT handle, role, source, addedAt FROM admins ORDER BY addedAt");
const addAdmin = database.prepare("INSERT OR IGNORE INTO admins (handle, role, source) VALUES (?, ?, ?)");
const removeAdmin = database.prepare("DELETE FROM admins WHERE handle = ? AND source != 'owner'");
const insertAudit = database.prepare("INSERT INTO audit (actor, action, detail) VALUES (?, ?, ?)");
const listAudit = database.prepare("SELECT at, actor, action, detail FROM audit ORDER BY at DESC LIMIT ?");
const insertBan = database.prepare(
  "INSERT INTO bans (ip, reason, until, strikes) VALUES (?, ?, ?, 1) ON CONFLICT(ip) DO UPDATE SET reason = excluded.reason, until = excluded.until, strikes = strikes + 1",
);
const selectBan = database.prepare("SELECT ip, reason, until, strikes FROM bans WHERE ip = ?");
const listBans = database.prepare("SELECT ip, reason, until, strikes FROM bans ORDER BY until DESC LIMIT 200");
const deleteBan = database.prepare("DELETE FROM bans WHERE ip = ?");
const insertSite = database.prepare("INSERT OR REPLACE INTO allowed_sites (host, secretDigest) VALUES (?, ?)");
const deleteSite = database.prepare("DELETE FROM allowed_sites WHERE host = ?");
const listSites = database.prepare("SELECT host, secretDigest, addedAt FROM allowed_sites ORDER BY addedAt");
const selectSite = database.prepare("SELECT host, secretDigest FROM allowed_sites WHERE host = ?");
const insertSession = database.prepare("INSERT INTO sessions (tokenDigest, handle, expiresAt) VALUES (?, ?, ?)");
const selectSession = database.prepare("SELECT tokenDigest, handle, expiresAt FROM sessions WHERE tokenDigest = ?");
const deleteSessionsOf = database.prepare("DELETE FROM sessions WHERE handle = ?");

export function admins(): Admin[] {
  return listAdmins.all() as Admin[];
}

/** Resolves the CODEOWNERS handles into admin rows (source: codeowner). */
export function syncCodeowners(repoRoot: string): number {
  let text = "";
  try {
    text = readFileSync(join(repoRoot, "CODEOWNERS"), "utf8");
  } catch {
    return 0;
  }
  const handles = new Set(
    [...text.matchAll(/@([A-Za-z0-9-]+)/g)].map((match) => match[1].toLowerCase()).filter((handle) => handle !== OWNER_HANDLE.toLowerCase()),
  );
  for (const handle of handles) addAdmin.run(handle, "admin", "codeowner");
  insertAudit.run("system", "sync.codeowners", `${handles.size} handles`);
  return handles.size;
}

export function grantAdmin(actor: string, handle: string, source: AdminSource = "ai"): boolean {
  const answer = addAdmin.run(handle.toLowerCase(), "admin", source);
  insertAudit.run(actor, "admin.grant", handle);
  return answer.changes > 0;
}

export function revokeAdmin(actor: string, handle: string): boolean {
  const answer = removeAdmin.run(handle.toLowerCase());
  insertAudit.run(actor, "admin.revoke", handle);
  return answer.changes > 0;
}

/** The password gate: verifies the scrypt digest of the panel password. */
export function verifyPassword(password: string): boolean {
  const digest = process.env.DEVTHINK_ADMIN_PASSWORD_HASH;
  if (!digest || !password) return false;
  const [salt, expected] = digest.split(":");
  if (!salt || !expected) return false;
  const candidate = scryptSync(password, salt, 64);
  return timingSafeEqual(Buffer.from(candidate), Buffer.from(expected, "hex"));
}

/** Opens an admin session for a verified admin (random token, digest stored). */
export function openSession(handle: string): string {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  insertSession.run(sha256(token), handle.toLowerCase(), expires);
  insertAudit.run(handle, "session.open", "");
  return token;
}

export function sessionHandle(token: string): string | undefined {
  const row = selectSession.get(sha256(token)) as { handle: string; expiresAt: string } | undefined;
  if (!row || row.expiresAt < new Date().toISOString()) return undefined;
  return row.handle;
}

export function revokeSessions(actor: string, handle: string): void {
  deleteSessionsOf.run(handle.toLowerCase());
  insertAudit.run(actor, "session.revoke", handle);
}

/** Bans an address: six minutes on the first strike, doubling every repeat — every clone db syncs the row. */
export function banAddress(ip: string, reason: string): Ban {
  const previous = selectBan.get(ip) as { strikes: number } | undefined;
  const strikes = (previous?.strikes ?? 0) + 1;
  const minutes = BAN_BASE_MINUTES * 2 ** (strikes - 1);
  const until = new Date(Date.now() + minutes * 60 * 1000).toISOString();
  insertBan.run(ip, reason, until, 0);
  insertAudit.run("guard", "ban.strike", `${ip} ${reason} ${minutes}m`);
  return { ip, reason, until, strikes };
}

export function bannedAt(ip: string): Ban | undefined {
  const row = selectBan.get(ip) as Ban | undefined;
  if (row && row.until > new Date().toISOString()) return row;
  return undefined;
}

export function liftBan(actor: string, ip: string): void {
  deleteBan.run(ip);
  insertAudit.run(actor, "ban.lift", ip);
}

export function bans(): Ban[] {
  return listBans.all() as Ban[];
}

/** Authorizes one family site: the api answers only to these hosts carrying the shared secret. */
export function allowSite(actor: string, host: string, secret: string): void {
  insertSite.run(host.toLowerCase(), sha256(secret));
  insertAudit.run(actor, "site.allow", host);
}

export function denySite(actor: string, host: string): void {
  deleteSite.run(host.toLowerCase());
  insertAudit.run(actor, "site.deny", host);
}

export function siteAuthorized(host: string, secret: string): boolean {
  const row = selectSite.get(host.toLowerCase()) as { secretDigest: string } | undefined;
  return Boolean(row && timingSafeEqual(Buffer.from(row.secretDigest), Buffer.from(sha256(secret))));
}

export function allowedSites(): AllowedSite[] {
  return listSites.all() as AllowedSite[];
}

export function audit(lines = 100): AuditEntry[] {
  return listAudit.all(lines) as AuditEntry[];
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
