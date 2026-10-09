/**
 * weaponstats.ts — the terminal ballistics math of the stealthhead armory
 * (root layer).
 *
 * damage over distance (the falloff), the shots a target asks for and the
 * time to kill those shots cost, plus the balance validation the armory runs
 * before a row enters the catalog. the tables arrive from config/catalog as
 * parameters — the falloff spec, the health model and the balance bounds are
 * never fixed here (the competitor practice: one damage curve per weapon,
 * quadratic in claude-of-duty, linear here by default with the curve
 * exponent exposed). pure and multi-mode: the same call runs in the browser
 * (armory previews) and in node (the unit tests), with zero DOM and zero
 * storage. the armory rows themselves stay in weapons.ts; this file only
 * measures them.
 */
import type { Weapon } from "./weapons.ts";

/** the machine readable failure codes of the weapon stats math. */
export type weaponstatserrorcode = "bad-weapon" | "bad-health" | "bad-falloff" | "bad-bounds";

/** the typed weapon stats failure, traceable to the weapon and the code. */
export class weaponstatserror extends Error {
  /** machine readable failure code. */
  readonly code: weaponstatserrorcode;
  /** the weapon the failure belongs to (when known). */
  readonly weaponid: string | null;

  constructor(code: weaponstatserrorcode, weaponid: string | null, message?: string) {
    super(message ?? `weapon stats ${code}${weaponid === null ? "" : ` for ${weaponid}`}`);
    this.name = "weaponstatserror";
    this.code = code;
    this.weaponid = weaponid;
  }
}

/** the damage falloff spec of one weapon (or of one catalog slice). */
export type FalloffSpec = {
  /** every shot up to this distance keeps the full damage. */
  startmeters: number;
  /** from this distance on the damage settles at the retained fraction. */
  endmeters: number;
  /** the damage fraction retained at endmeters (0-1). */
  retainfraction: number;
  /** the falloff curve exponent: 1 linear, 2 the quadratic of claude-of-duty. */
  curve: number;
};

/** the time to kill report of one weapon against one distance. */
export type TtkResult = {
  /** the shots the target asks for at this distance. */
  shots: number;
  /** the magazine cycles the burst costs (0 when the magazine holds). */
  reloads: number;
  /** the seconds from the first trigger pull to the kill (excludes the last shot travel). */
  seconds: number;
};

/** the inclusive bounds one balance field must respect. */
export type BalanceBounds = Partial<Record<"damage" | "firerate" | "rangemeters" | "magazine" | "recoil" | "reloadseconds", { min: number; max: number }>>;

/** one balance violation the validator found. */
export type BalanceViolation = {
  /** the weapon field out of bounds. */
  field: keyof BalanceBounds;
  /** the value the row carries. */
  value: number;
  /** the configured bounds the value broke. */
  min: number;
  max: number;
};

/** the options of the time to kill model. */
export type TtkOptions = {
  /** the damage multiplier of the assumed hit zone (1 body, more for headshots). */
  vitalmultiplier?: number;
};

/**
 * computes the damage one shot deals at a distance under a falloff spec.
 *
 * @param weapon the weapon firing the shot.
 * @param meters the distance to the target.
 * @param falloff the falloff spec of the catalog slice.
 * @returns the per-shot damage at that distance.
 */
export function damageatmeters(weapon: Weapon, meters: number, falloff: FalloffSpec): number {
  validateweapon(weapon);
  validatefalloff(falloff);
  if (!Number.isFinite(meters) || meters < 0) throw new weaponstatserror("bad-weapon", weapon.id, `weapon stats distance must be >= 0, got ${meters}`);
  if (meters <= falloff.startmeters) return weapon.damage;
  if (meters >= falloff.endmeters) return weapon.damage * falloff.retainfraction;
  const span = falloff.endmeters - falloff.startmeters;
  const t = (meters - falloff.startmeters) / span;
  const multiplier = 1 - (1 - falloff.retainfraction) * t ** falloff.curve;
  return weapon.damage * multiplier;
}

/**
 * computes the shots a target asks for at a distance (the damage falloff
 * included, the hit-zone multiplier applied before the division).
 *
 * @param weapon the weapon firing.
 * @param meters the distance to the target.
 * @param health the health pool of the target model.
 * @param falloff the falloff spec of the catalog slice.
 * @param options the hit-zone options (defaults to the body).
 * @returns the shots to kill, at least one.
 */
export function shotstokill(weapon: Weapon, meters: number, health: number, falloff: FalloffSpec, options: TtkOptions = {}): number {
  if (!Number.isFinite(health) || health <= 0) throw new weaponstatserror("bad-health", weapon.id, `weapon stats health must be > 0, got ${health}`);
  const vital = options.vitalmultiplier ?? 1;
  if (!Number.isFinite(vital) || vital <= 0) throw new weaponstatserror("bad-health", weapon.id, `weapon stats vital multiplier must be > 0, got ${vital}`);
  const per = damageatmeters(weapon, meters, falloff) * vital;
  if (per <= 0) throw new weaponstatserror("bad-weapon", weapon.id, `weapon stats damage at ${meters}m must be > 0`);
  return Math.max(1, Math.ceil(health / per));
}

/**
 * computes the time to kill at a distance: the gaps between the shots (the
 * last one is free) plus one reload every time the burst outgrows the
 * magazine.
 *
 * @param weapon the weapon firing.
 * @param meters the distance to the target.
 * @param health the health pool of the target model.
 * @param falloff the falloff spec of the catalog slice.
 * @param options the hit-zone options (defaults to the body).
 * @returns the shots, the reloads and the seconds to kill.
 */
export function timetokill(weapon: Weapon, meters: number, health: number, falloff: FalloffSpec, options: TtkOptions = {}): TtkResult {
  validateweapon(weapon);
  const shots = shotstokill(weapon, meters, health, falloff, options);
  const reloads = Math.max(0, Math.ceil(shots / weapon.magazine) - 1);
  const gapseconds = 60 / weapon.firerate;
  const seconds = (shots - 1) * gapseconds + reloads * weapon.reloadseconds;
  return { shots, reloads, seconds: Math.round(seconds * 1000) / 1000 };
}

/**
 * sweeps one weapon over a distance ladder — the per-distance table the
 * armory renders as the ttk curve.
 *
 * @param weapon the weapon to sweep.
 * @param distances the distances to report, in meters.
 * @param health the health pool of the target model.
 * @param falloff the falloff spec of the catalog slice.
 * @param options the hit-zone options (defaults to the body).
 * @returns one result per distance, in the order given.
 */
export function ttkbydistance(weapon: Weapon, distances: readonly number[], health: number, falloff: FalloffSpec, options: TtkOptions = {}): TtkResult[] {
  return distances.map((meters) => timetokill(weapon, meters, health, falloff, options));
}

/**
 * validates one armory row against the season bounds. the bounds arrive as a
 * parameter (the catalog config) — a field without bounds is never checked.
 *
 * @param weapon the row to validate.
 * @param bounds the configured bounds per field.
 * @returns the violations found (an empty list means the row is balanced).
 */
export function validatebalance(weapon: Weapon, bounds: BalanceBounds): BalanceViolation[] {
  const violations: BalanceViolation[] = [];
  for (const field of ["damage", "firerate", "rangemeters", "magazine", "recoil", "reloadseconds"] as const) {
    const bound = bounds[field];
    if (!bound) continue;
    const value = weapon[field];
    if (value < bound.min || value > bound.max) {
      violations.push({ field, value, min: bound.min, max: bound.max });
    }
  }
  return violations;
}

/** validates the weapon row shape once so every helper can trust it. */
function validateweapon(weapon: Weapon): void {
  if (!weapon || typeof weapon.id !== "string") throw new weaponstatserror("bad-weapon", null, "weapon stats needs a weapon row with an id");
  if (!Number.isFinite(weapon.damage) || weapon.damage <= 0) throw new weaponstatserror("bad-weapon", weapon.id, `weapon stats damage must be > 0, got ${weapon.damage}`);
  if (!Number.isFinite(weapon.firerate) || weapon.firerate <= 0) throw new weaponstatserror("bad-weapon", weapon.id, `weapon stats fire rate must be > 0, got ${weapon.firerate}`);
  if (!Number.isInteger(weapon.magazine) || weapon.magazine <= 0) throw new weaponstatserror("bad-weapon", weapon.id, `weapon stats magazine must be a positive integer, got ${weapon.magazine}`);
}

/** validates the falloff spec once so every helper can trust it. */
function validatefalloff(falloff: FalloffSpec): void {
  if (!Number.isFinite(falloff.startmeters) || falloff.startmeters < 0) throw new weaponstatserror("bad-falloff", null, `weapon stats falloff start must be >= 0, got ${falloff.startmeters}`);
  if (!Number.isFinite(falloff.endmeters) || falloff.endmeters <= falloff.startmeters) {
    throw new weaponstatserror("bad-falloff", null, `weapon stats falloff end must sit past the start, got ${falloff.endmeters}`);
  }
  if (!Number.isFinite(falloff.retainfraction) || falloff.retainfraction < 0 || falloff.retainfraction > 1) {
    throw new weaponstatserror("bad-falloff", null, `weapon stats retained fraction must be within [0, 1], got ${falloff.retainfraction}`);
  }
  if (!Number.isFinite(falloff.curve) || falloff.curve <= 0) throw new weaponstatserror("bad-falloff", null, `weapon stats curve must be > 0, got ${falloff.curve}`);
}
