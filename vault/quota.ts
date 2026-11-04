// # quota — the user-defined quota of the vault (no fixed cap anywhere).
// The limit belongs to the person: every project carries one quota row whose
// limit is bigint bytes — null means unlimited — and the only default is the
// configurable floor the family answers at creation (VAULT_QUOTA_MB, default
// 900MB, ceiling 900GB — never a locked cap: the row grows to terabyte scale
// or drops to null at the owner's word). Enforcement rides the verdict the
// routes answer — ok or over — computed from the real usage the ledger
// reports. No browser, no plan literal, no 2GB ghost: the number on the row
// is the law.
//
// @section verdict — the pure enforcement verdicts
// @section floor — the VAULT_QUOTA_MB configuration surface
// @section row — the quota rows on the database

import { eq, sql } from "drizzle-orm";
import { quotas, type StorageExecutor } from "./drizzle.ts";

/** @section floor */

/** The default creation floor, in megabytes: the family precedent, 900MB. */
const FLOOR_DEFAULT_MB = 900;

/** The honest minimum of the floor: one megabyte — a value below it answers
 * the default instead (the floor never arms a zero or negative cap). */
const FLOOR_MIN_MB = 1;

/** The ceiling of the floor configuration, in binary megabytes: 900GB —
 * 900 * 1024 = 921600MB. The ceiling binds the configured default only; the
 * owner-set row still rides any scale or null (unlimited) at will. */
const FLOOR_CEILING_MB = 900 * 1024;

/**
 * Resolves the creation floor from a VAULT_QUOTA_MB string — the 2GB-lock
 * unlock, pure so the tests and the operators reason about one law:
 * decimal megabytes, clamped into [1, 921600] (1MB .. 900GB, binary); an
 * unset, empty or invalid value falls back to the 900MB family default.
 * The floor is a creation default, never a cap: setQuota redefines the row
 * at any scale, and null still means unlimited.
 *
 * @law the quota floor is configurable (VAULT_QUOTA_MB), never a locked cap
 * @config VAULT_QUOTA_MB — megabytes of the creation floor (default 900, min 1, ceiling 921600 = 900GB)
 * @param value the raw environment string (undefined when unset).
 * @returns the floor in bytes, bigint.
 */
export function quotaFloorFromMb(value: string | undefined): bigint {
  const parsed = value === undefined ? Number.NaN : Number(value.trim());
  /* only whole megabytes configure the floor — a decimal spell (1.5) is an
   * invalid configuration the same as a word, so the family default answers
   * instead of a rounded stray the owner never wrote. */
  const megabytes =
    Number.isFinite(parsed) && Number.isInteger(parsed) && parsed >= FLOOR_MIN_MB
      ? Math.min(parsed, FLOOR_CEILING_MB)
      : FLOOR_DEFAULT_MB;
  return BigInt(megabytes) * 1024n * 1024n;
}

/** @section verdict */

/** The creation floor answered at project creation — the VAULT_QUOTA_MB
 * surface resolved once at import (default 900MB, the family precedent,
 * ceiling 900GB; the 2GB lock is dead). The floor seeds the row only: the
 * owner redefines it at any scale or drops it to null (unlimited) at will. */
export const QUOTA_FLOOR_BYTES: bigint = quotaFloorFromMb(process.env.VAULT_QUOTA_MB);

/** The enforcement verdict the routes answer — the honest state of one write against the quota. */
export interface QuotaVerdict {
  /** ok when the write lands, over when it would push usage past the limit */
  state: "ok" | "over";
  /** the usage before the write, in bytes */
  usage: bigint;
  /** the limit in bytes — null when unlimited */
  limit: bigint | null;
  /** the incoming write size, in bytes */
  incoming: bigint;
  /** what remains under the limit — null when unlimited, negative when usage already sits past it */
  remaining: bigint | null;
}

/**
 * The pure verdict of one incoming write against the quota: unlimited never
 * refuses, a limit refuses only when usage plus the write would pass it, and
 * a zero-byte read stays ok even past the limit (reading nothing never
 * refuses — the remaining answer goes negative honestly instead).
 * Nothing is stored on a refusal — the caller owns that promise.
 *
 * @param usage the live usage of the project, in bytes.
 * @param limit the quota limit in bytes, null when unlimited.
 * @param incoming the size of the write being judged, in bytes.
 * @returns the verdict the routes answer.
 */
export function quotaVerdict(usage: bigint, limit: bigint | null, incoming: bigint): QuotaVerdict {
  if (limit === null) {
    return { state: "ok", usage, limit, incoming, remaining: null };
  }
  return {
    state: incoming === 0n || usage + incoming <= limit ? "ok" : "over",
    usage,
    limit,
    incoming,
    remaining: limit - usage,
  };
}

/** The parse answer of a user-defined limit string: the bytes, unlimited, or the honest refusal. */
export type QuotaLimitParse = { limitBytes: bigint | null } | { refusal: string };

/**
 * Parses a user-defined quota limit — decimal bytes (any scale, terabytes
 * included) or the unlimited words. No unit suffixes are guessed: the owner
 * writes bytes or writes unlimited.
 *
 * @param text the limit as written ("" or "unlimited"/"none"/"null" answer unlimited).
 * @returns the parsed limit or the refusal.
 */
export function quotaLimitFrom(text: string): QuotaLimitParse {
  const trimmed = text.trim().toLowerCase();
  if (trimmed === "" || trimmed === "unlimited" || trimmed === "null" || trimmed === "none") {
    return { limitBytes: null };
  }
  if (!/^\d+$/.test(trimmed)) {
    return { refusal: `the limit must be decimal bytes or "unlimited" — got "${text}"` };
  }
  return { limitBytes: BigInt(trimmed) };
}

/** @section row */

/** One quota row of the database: the project, the limit (null = unlimited) and the last edit datetime. */
export interface QuotaRow {
  /** the project the quota bounds */
  projectId: string;
  /** the limit in bytes — null when unlimited */
  limitBytes: bigint | null;
  /** the last edit datetime of the row */
  updatedAt: string;
}

/** the raw projection sqlite answers (limit_bytes rides the 64-bit cell). */
type QuotaRowSql = { projectId: string; limitBytes: number | bigint | null; updatedAt: string };

/** Widens one raw row into the honest quota row — the limit becomes a real bigint. */
function quotaRowOf(row: QuotaRowSql): QuotaRow {
  return {
    projectId: row.projectId,
    limitBytes: row.limitBytes === null ? null : BigInt(row.limitBytes),
    updatedAt: row.updatedAt,
  };
}

/** the explicit column projection every quota read answers (no select *). */
const QUOTA_COLUMNS = { projectId: quotas.projectId, limitBytes: quotas.limitBytes, updatedAt: quotas.updatedAt };

/**
 * Reads the quota row of one project.
 *
 * @param executor the executing connection or transaction.
 * @param projectId the project the quota bounds.
 * @returns the quota row, or undefined when the project never wrote one.
 */
export function readQuota(executor: StorageExecutor, projectId: string): QuotaRow | undefined {
  const row = executor.select(QUOTA_COLUMNS).from(quotas).where(eq(quotas.projectId, projectId)).get();
  return row === undefined ? undefined : quotaRowOf(row);
}

/**
 * Ensures the quota row exists — the idempotent floor write: a project
 * without a row answers the 900MB default, an existing row is never
 * touched. Called at project creation and defensively at the ledger gate.
 *
 * @param executor the executing connection or transaction.
 * @param projectId the project the quota bounds.
 * @returns the quota row after the ensure.
 */
export function ensureQuota(executor: StorageExecutor, projectId: string): QuotaRow {
  executor.insert(quotas).values({ projectId, limitBytes: QUOTA_FLOOR_BYTES }).onConflictDoNothing().run();
  const row = readQuota(executor, projectId);
  if (row === undefined) {
    throw new Error(`the quota row of "${projectId}" did not land`);
  }
  return row;
}

/**
 * Sets the user-defined quota of one project — the owner's word is the law:
 * decimal bytes at any scale, or null to remove the limit entirely.
 *
 * @param executor the executing connection or transaction.
 * @param projectId the project the quota bounds.
 * @param limitBytes the limit in bytes, null for unlimited.
 * @returns the quota row after the write.
 */
export function setQuota(executor: StorageExecutor, projectId: string, limitBytes: bigint | null): QuotaRow {
  executor
    .insert(quotas)
    .values({ projectId, limitBytes })
    .onConflictDoUpdate({
      target: quotas.projectId,
      set: { limitBytes, updatedAt: sql`datetime('now')` },
    })
    .run();
  const row = readQuota(executor, projectId);
  if (row === undefined) {
    throw new Error(`the quota row of "${projectId}" did not land`);
  }
  return row;
}
