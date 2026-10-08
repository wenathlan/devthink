/**
 * sandboxquota.ts — the per-account resource quota ledger of saddle.
 *
 * every account holds counters of the resources its live sandboxes
 * allocate (sandbox count, vcpus, ramgb, vgpus, diskgb) against a
 * limits table. the limits are a plain parameter — the operator's plan
 * table comes from config or the database and never lives in code; an
 * absent limit means unlimited, mirroring the SADDLE_MAX_SANDBOXES
 * convention of webserver.ts (0 or unset means unlimited).
 *
 * the ledger keeps reservations and releases in balance with a simple
 * reconciliation: the host projects the authoritative usage (for
 * example from the sqlite sandboxes rows) and reconcile() overwrites
 * the in-memory counters with it, so drift from admin deletes, restarts
 * or crashes self-heals on the next create.
 *
 * the module is pure: zero imports, zero dom, zero node builtins, a
 * Map per account, typed traceable errors (quotaexceedederror carries
 * the resource, the request, the limit and the remaining headroom).
 *
 * competitor sources shaping the contract: daytonaio/daytona (tenant
 * resource quota admission with per-sandbox cpu/memory/gpu quota
 * fields and the gpu allocator acquire/release pair around create) and
 * opensandbox-group/opensandbox (namespace ResourceQuota admission —
 * the sandbox is not admitted when the quota is exhausted — and the
 * pool acquisition that fails fast when capacity stays unavailable).
 *
 * wire point: webserver.ts createsandbox reconciles the owning
 * account from store.listsandboxesbyuser rows and reserves the new
 * sandbox; destroysandbox releases it. limits come from
 * accountlimitsfromenv(process.env) and stay unlimited when unset.
 */

/* ------------------------------------------------------------------ */
/* types: usage, limits, errors                                        */
/* ------------------------------------------------------------------ */

/** the resource counters one account allocates through live sandboxes. */
export type accountusage = {
  sandboxes: number;
  vcpus: number;
  ramgb: number;
  vgpus: number;
  diskgb: number;
};

/** the per-account limits; an absent or non-positive field is unlimited. */
export type accountlimits = {
  readonly sandboxes?: number;
  readonly vcpus?: number;
  readonly ramgb?: number;
  readonly vgpus?: number;
  readonly diskgb?: number;
};

/** one resource wish (a partial usage delta). */
export type resourcewish = Partial<accountusage>;

/** the resource names tracked by the ledger. */
const RESOURCES: readonly (keyof accountusage)[] = [
  'sandboxes',
  'vcpus',
  'ramgb',
  'vgpus',
  'diskgb',
];

/** failure codes carried by quotaerror. */
export type quotaerrorcode = 'invalid-wish' | 'quota-exceeded';

/** the typed quota failure, traceable to the account and the resource. */
export class quotaerror extends Error {
  /** machine readable failure code. */
  readonly code: quotaerrorcode;
  /** the account the failure belongs to. */
  readonly accountid: string;
  /** the resource that failed (or 'wish' for malformed deltas). */
  readonly resource: string;
  /** the requested amount (null when the wish itself was malformed). */
  readonly requested: number | null;
  /** the active limit (null when unlimited). */
  readonly limit: number | null;
  /** the headroom the account had before the request. */
  readonly available: number | null;

  constructor(
    code: quotaerrorcode,
    accountid: string,
    resource: string,
    requested: number | null,
    limit: number | null,
    available: number | null,
    message?: string,
  ) {
    super(
      message ??
        `account ${accountid} ${code} on ${resource}: requested ${requested ?? '?'} of ${limit ?? 'unlimited'} (${available ?? '?'} available)`,
    );
    this.name = 'quotaerror';
    this.code = code;
    this.accountid = accountid;
    this.resource = resource;
    this.requested = requested;
    this.limit = limit;
    this.available = available;
  }
}

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

/** validates one resource wish: every present field is a positive number. */
function sanitize(wish: resourcewish): Partial<accountusage> {
  const clean: Partial<accountusage> = {};
  for (const resource of RESOURCES) {
    const value = wish[resource];
    if (value === undefined) {
      continue;
    }
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
      throw new quotaerror(
        'invalid-wish',
        '',
        resource,
        typeof value === 'number' ? value : null,
        null,
        null,
        `resource ${resource} must be a positive finite number (received ${String(value)})`,
      );
    }
    clean[resource] = value;
  }
  return clean;
}

/** headroom of one resource under its limit (null limit means Infinity). */
function headroom(limit: number | undefined, used: number): number | null {
  return typeof limit === 'number' && limit > 0 ? Math.max(0, limit - used) : null;
}

/* ------------------------------------------------------------------ */
/* the ledger                                                          */
/* ------------------------------------------------------------------ */

/** a read-only snapshot answered by usage(). */
export type accountquotasnapshot = {
  readonly accountid: string;
  readonly used: Readonly<accountusage>;
  readonly remaining: Readonly<Record<keyof accountusage, number | null>>;
};

/**
 * creates the per-account ledger with one limits table for every
 * account (per-plan tables ride on the caller passing the plan row of
 * the account).
 *
 * @param limits the limits table (absent fields are unlimited).
 * @returns the ledger facade (admits, reserve, release, usage,
 *   reconcile, reset).
 */
export function createaccountledger(limits: accountlimits): {
  admits: (accountid: string, wish: resourcewish) => boolean;
  reserve: (accountid: string, wish: resourcewish) => accountquotasnapshot;
  release: (accountid: string, wish: resourcewish) => accountquotasnapshot;
  usage: (accountid: string) => accountquotasnapshot;
  reconcile: (accountid: string, observed: accountusage) => { before: accountquotasnapshot; after: accountquotasnapshot };
  reset: (accountid?: string) => void;
} {
  const books = new Map<string, accountusage>();

  /** zeroes the counters of an unseen account. */
  function blank(accountid: string): accountusage {
    const existing = books.get(accountid);
    if (existing !== undefined) {
      return existing;
    }
    const fresh: accountusage = { sandboxes: 0, vcpus: 0, ramgb: 0, vgpus: 0, diskgb: 0 };
    books.set(accountid, fresh);
    return fresh;
  }

  function snapshotOf(accountid: string, used: accountusage): accountquotasnapshot {
    const remaining = {} as Record<keyof accountusage, number | null>;
    for (const resource of RESOURCES) {
      remaining[resource] = headroom(limits[resource], used[resource]);
    }
    return { accountid, used: { ...used }, remaining };
  }

  /** the shared admit-or-throw walk used by admits and reserve. */
  function check(accountid: string, wish: resourcewish): Partial<accountusage> {
    const clean = sanitize(wish);
    const used = blank(accountid);
    for (const resource of RESOURCES) {
      const request = clean[resource];
      if (request === undefined) {
        continue;
      }
      const room = headroom(limits[resource], used[resource]);
      if (room !== null && request > room) {
        throw new quotaerror(
          'quota-exceeded',
          accountid,
          resource,
          request,
          limits[resource] ?? null,
          room,
        );
      }
    }
    return clean;
  }

  return {
    admits(accountid, wish) {
      try {
        check(accountid, wish);
        return true;
      } catch (error) {
        if (error instanceof quotaerror) {
          return false;
        }
        throw error;
      }
    },

    reserve(accountid, wish) {
      const clean = check(accountid, wish);
      const used = blank(accountid);
      for (const resource of RESOURCES) {
        const request = clean[resource];
        if (request !== undefined) {
          used[resource] += request;
        }
      }
      return snapshotOf(accountid, used);
    },

    release(accountid, wish) {
      const clean = sanitize(wish);
      const used = blank(accountid);
      for (const resource of RESOURCES) {
        const request = clean[resource];
        if (request !== undefined) {
          used[resource] = Math.max(0, used[resource] - request);
        }
      }
      return snapshotOf(accountid, used);
    },

    usage(accountid) {
      return snapshotOf(accountid, blank(accountid));
    },

    reconcile(accountid, observed) {
      const used = blank(accountid);
      const before = snapshotOf(accountid, used);
      for (const resource of RESOURCES) {
        const value = observed[resource];
        used[resource] = typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : 0;
      }
      const after = snapshotOf(accountid, used);
      return { before, after };
    },

    reset(accountid) {
      if (accountid === undefined) {
        books.clear();
        return;
      }
      books.delete(accountid);
    },
  };
}

/* ------------------------------------------------------------------ */
/* projection: rows to usage                                           */
/* ------------------------------------------------------------------ */

/** the structural row shape the projection reads (SandboxRow of db.ts
 * satisfies it; kept structural so the module stays import-free). */
export type sandboxrowlike = {
  readonly vcpus: number | null;
  readonly ramgb: number | null;
  readonly state: string | null;
};

/**
 * projects sandbox rows onto one account usage: every row that is not
 * destroyed counts as a live allocation (the same semantics the
 * SADDLE_MAX_SANDBOXES cap check of webserver.ts uses).
 *
 * @param rows the authoritative rows of one account.
 * @returns the usage counters the rows allocate.
 */
export function usagefromrows(rows: readonly sandboxrowlike[]): accountusage {
  const usage: accountusage = { sandboxes: 0, vcpus: 0, ramgb: 0, vgpus: 0, diskgb: 0 };
  for (const row of rows) {
    if (row.state === 'destroyed') {
      continue;
    }
    usage.sandboxes += 1;
    usage.vcpus += typeof row.vcpus === 'number' ? row.vcpus : 0;
    usage.ramgb += typeof row.ramgb === 'number' ? row.ramgb : 0;
  }
  return usage;
}

/* ------------------------------------------------------------------ */
/* adapter: limits from the environment                                */
/* ------------------------------------------------------------------ */

/**
 * reads the per-account limits from the environment: SADDLE_MAX_SANDBOXES
 * (the existing count cap of webserver.ts), SADDLE_ACCOUNT_MAX_VCPUS,
 * SADDLE_ACCOUNT_MAX_RAM_GB, SADDLE_ACCOUNT_MAX_VGPUS and
 * SADDLE_ACCOUNT_MAX_DISK_GB. unset, zero and negative values mean
 * unlimited, so the default deployment enforces nothing.
 *
 * @param env the environment record (process.env shaped).
 * @returns the limits table.
 */
export function accountlimitsfromenv(env: Record<string, string | undefined>): accountlimits {
  const positive = (name: string): number | undefined => {
    const parsed = Number(env[name]);
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : undefined;
  };
  return {
    sandboxes: positive('SADDLE_MAX_SANDBOXES'),
    vcpus: positive('SADDLE_ACCOUNT_MAX_VCPUS'),
    ramgb: positive('SADDLE_ACCOUNT_MAX_RAM_GB'),
    vgpus: positive('SADDLE_ACCOUNT_MAX_VGPUS'),
    diskgb: positive('SADDLE_ACCOUNT_MAX_DISK_GB'),
  };
}
