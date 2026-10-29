// # quota — the user-defined quota of the vault (no fixed cap anywhere).
// The limit belongs to the person: every project carries one quota row whose
// limit is bigint bytes — null means unlimited — and the only default is the
// generous 900MB floor the family precedent answers at creation (never a
// ceiling: the row grows to terabyte scale or drops to null at the owner's
// word). Enforcement rides the verdict the routes answer — ok or over —
// computed from the real usage the ledger reports. No browser, no plan
// literal, no 2GB ghost: the number on the row is the law.
//
// @section verdict — the pure enforcement verdicts
// @section row — the quota rows on the database

import { eq, sql } from "drizzle-orm";
import { quotas, type StorageExecutor } from "./drizzle.ts";

/** @section verdict */

/** The generous default floor answered at project creation: 900MB in bytes (the family precedent, in bigint). */
export const QUOTA_FLOOR_BYTES: bigint = 900n * 1024n * 1024n;

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
