/**
 * sandboxenvprofile.ts — the configuration adapter of the sandbox spec
 * plane.
 *
 * the declarative spec (sandboxprofile.ts) never holds capacities: the
 * limits table is a parameter. this module is the adapter that turns
 * configuration into that parameter: it reads the SADDLE_SPEC_LIMITS
 * json environment variable ({ "bases": { ... } }), merges it over a
 * documented development bootstrap table (so a partial override stays
 * safe) and returns the effective limits table. production deployments
 * can equally hand the database sourced table straight to
 * resolvesandboxspec and skip this adapter entirely.
 *
 * the module is browser-pure: zero dom, zero node builtins; it imports
 * only the vocabulary and types of sandboxprofile.ts. the bootstrap table
 * is a documented convenience, never a product rule — every field it
 * carries is overridable.
 */

import type {
  sandboxbaselimit,
  sandboxbaseid,
  sandboxspeclimits,
} from './sandboxprofile.ts';
import { SANDBOXBASES } from './sandboxprofile.ts';

/** documented development bootstrap table; production overrides it with
 * the SADDLE_SPEC_LIMITS json (or the database table). fields: maxvcpus/
 * maxramgb/maxvgpus/maxdiskgb/maxtimeoutseconds/defaultvcpus/
 * defaultramgb. */
const bootstraplimits: sandboxspeclimits = {
  bases: {
    lite: {
      maxvcpus: 4, maxramgb: 8, maxvgpus: 0, maxdiskgb: 32,
      maxtimeoutseconds: 900, defaultvcpus: 2, defaultramgb: 4,
    },
    balanced: {
      maxvcpus: 16, maxramgb: 32, maxvgpus: 1, maxdiskgb: 128,
      maxtimeoutseconds: 3600, defaultvcpus: 8, defaultramgb: 16,
    },
    max: {
      maxvcpus: 64, maxramgb: 256, maxvgpus: 2, maxdiskgb: 512,
      maxtimeoutseconds: 14400, defaultvcpus: 32, defaultramgb: 64,
    },
  },
  defaulttimeoutseconds: 900,
};

/**
 * reads the limits table from the SADDLE_SPEC_LIMITS environment json;
 * the bootstrap table fills every base the json does not define, so a
 * partial override stays safe. broken json falls back to the bootstrap
 * table (the spec plane never becomes unavailable over config drift).
 *
 * @param env the environment record (process.env shaped).
 * @returns the effective limits table.
 */
export function specenvlimits(env: Record<string, string | undefined>): sandboxspeclimits {
  const raw = env.SADDLE_SPEC_LIMITS;
  if (raw === undefined || raw.trim() === '') {
    return bootstraplimits;
  }
  try {
    const parsed = JSON.parse(raw) as { bases?: Record<string, Partial<sandboxbaselimit>> };
    const bases = { ...bootstraplimits.bases };
    if (typeof parsed?.bases === 'object' && parsed.bases !== null) {
      for (const key of SANDBOXBASES) {
        const override = parsed.bases[key as sandboxbaseid];
        if (typeof override === 'object' && override !== null) {
          bases[key as sandboxbaseid] = { ...bootstraplimits.bases[key as sandboxbaseid], ...override };
        }
      }
    }
    return { ...bootstraplimits, bases };
  } catch {
    return bootstraplimits;
  }
}
