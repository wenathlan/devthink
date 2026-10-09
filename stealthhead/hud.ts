/**
 * hud.ts — the hud state logic of stealthhead (root layer).
 *
 * vital bands for health and shields, minimap coordinate transforms,
 * hitmarker windows, the killfeed with dedup and ttl, and the
 * directional damage indicators. the design is absorbed from the
 * official catalog through the LOGICS-6 wave plan (the hud page renders
 * these numbers through Sol/stealthhead/match; the par of matchrules).
 * every function is a pure function over plain structs: the same state
 * always paints the same numbers, and nothing here touches a pixel.
 * non-goals: no dom, no rendering, no styling, no animation frames, no
 * networking i/o — the interface layer owns every paint.
 */

/** the vitals one operator carries into a round. */
export type Vitals = {
  health: number;
  maxhealth: number;
  shields: number;
  maxshields: number;
};

/** the vital band the hud paints (color and pulse come from the theme). */
export type VitalTier = "critical" | "low" | "wounded" | "healthy";

/** the outcome of one damage application (shields absorb first). */
export type DamageReport = { vitals: Vitals; absorbed: number; overflow: number };

/** the world extent one minimap covers (x/z plane, y is up). */
export type MinimapBounds = { minx: number; minz: number; maxx: number; maxz: number };

/** the transform world space goes through before it reaches the widget. */
export type MinimapConfig = {
  bounds: MinimapBounds;
  /** the square widget size in px. */
  sizepx: number;
  /** the padding ring in px kept outside the world extent. */
  padding: number;
  /** the receiver yaw in radians (the map rotates, the arrow stands). */
  yaw: number;
};

/** one mapped point in widget space, with its off-map flag. */
export type MinimapPoint = { x: number; y: number; clamped: boolean };

/** the hitmarker kinds (the theme owns the color, this owns the window). */
export type HitmarkerKind = "body" | "headshot" | "kill";

/** one hitmarker the hud shows for its window. */
export type Hitmarker = { id: string; at: number; kind: HitmarkerKind };

/** one killfeed row. */
export type KillfeedEntry = {
  /** the dedup key (killer-victim-weapon-tick). */
  id: string;
  killer: string;
  victim: string;
  weapon: string;
  at: number;
  headshot: boolean;
};

/** the sector a damage ping points at (relative to the receiver yaw). */
export type DamageSector = "front" | "right" | "behind" | "left";

/** one directional damage ping: relative angle, sector and strength. */
export type DamagePing = { angle: number; sector: DamageSector; strength: number };

/** the vital band thresholds over the combined pool fraction. */
export const VITALTHRESHOLDS = { critical: 0.25, low: 0.5, wounded: 0.75 } as const;

/** the show windows per hitmarker kind, in ms. */
export const HITWINDOWS = { body: 220, headshot: 320, kill: 520 } as const;

/** the killfeed retention: rows expire after this and cap at the max. */
export const KILLFEEDTTL = 8000;
export const KILLFEEDCAP = 6;

/** the directional ping fades to this floor before it disappears. */
export const DAMAGESTRENGTHFLOOR = 0.2;

/** the combined pool fraction (0..1) the bands read. */
export function poolfraction(vitals: Vitals): number {
  const pool = vitals.maxhealth + vitals.maxshields;
  return pool === 0 ? 0 : Math.min(1, Math.max(0, (vitals.health + vitals.shields) / pool));
}

/** the vital band of the current pool. */
export function vitaltier(vitals: Vitals): VitalTier {
  const fraction = poolfraction(vitals);
  if (fraction < VITALTHRESHOLDS.critical) return "critical";
  if (fraction < VITALTHRESHOLDS.low) return "low";
  if (fraction < VITALTHRESHOLDS.wounded) return "wounded";
  return "healthy";
}

/**
 * applies one damage amount: shields absorb first, the remainder spills
 * into health. pure — returns the new vitals plus what was absorbed and
 * what spilled past death (the caller decides the kill).
 *
 * @param vitals the incoming vitals.
 * @param amount the raw damage.
 * @returns the report with the new vitals.
 */
export function applydamage(vitals: Vitals, amount: number): DamageReport {
  const hit = Math.max(0, amount);
  const absorbed = Math.min(vitals.shields, hit);
  const spill = hit - absorbed;
  const overflow = Math.max(0, spill - vitals.health);
  return {
    vitals: { ...vitals, shields: vitals.shields - absorbed, health: Math.max(0, vitals.health - spill) },
    absorbed,
    overflow,
  };
}

/** the health bar fraction (0..1) the vitals widget paints. */
export function healthfraction(vitals: Vitals): number {
  return vitals.maxhealth === 0 ? 0 : Math.min(1, Math.max(0, vitals.health / vitals.maxhealth));
}

/** the shield bar fraction (0..1) the vitals widget paints. */
export function shieldfraction(vitals: Vitals): number {
  return vitals.maxshields === 0 ? 0 : Math.min(1, Math.max(0, vitals.shields / vitals.maxshields));
}

/** whether the operator still stands. */
export function isalive(vitals: Vitals): boolean {
  return vitals.health > 0;
}

/** the effective pool at a shield absorption ratio (the armor perk math). */
export function effectivepool(vitals: Vitals, absorption: number): number {
  return vitals.health + vitals.shields * Math.min(1, Math.max(0, absorption));
}

/** the world extent of a position cloud, padded for the widget ring. */
export function minimapbounds(positions: Array<{ x: number; z: number }>, pad: number): MinimapBounds {
  if (positions.length === 0) return { minx: -pad, minz: -pad, maxx: pad, maxz: pad };
  const xs = positions.map((position) => position.x);
  const zs = positions.map((position) => position.z);
  return {
    minx: Math.min(...xs) - pad,
    minz: Math.min(...zs) - pad,
    maxx: Math.max(...xs) + pad,
    maxz: Math.max(...zs) + pad,
  };
}

/** builds the widget transform from an extent, a receiver yaw and a rim. */
export function minimapconfig(bounds: MinimapBounds, sizepx: number, yaw: number, padding = 0): MinimapConfig {
  return { bounds, sizepx, padding, yaw };
}

/**
 * maps one world position into widget space: the world rotates by the
 * receiver yaw so facing is always up, z flips into screen y, and
 * outside positions clamp onto the rim with the clamped flag.
 *
 * @param config the widget transform.
 * @param position the world position (x/z plane).
 * @returns the widget point.
 */
export function tominimap(config: MinimapConfig, position: { x: number; z: number }): MinimapPoint {
  const center = { x: (config.bounds.minx + config.bounds.maxx) / 2, z: (config.bounds.minz + config.bounds.maxz) / 2 };
  const dx = position.x - center.x;
  const dz = position.z - center.z;
  const cos = Math.cos(config.yaw);
  const sin = Math.sin(config.yaw);
  const right = dx * cos - dz * sin;
  const forward = dx * sin + dz * cos;
  const half = Math.max(config.bounds.maxx - config.bounds.minx, config.bounds.maxz - config.bounds.minz) / 2 || 1;
  const scale = (config.sizepx / 2 - config.padding) / half;
  const screenx = config.sizepx / 2 - config.padding + right * scale;
  const screeny = config.sizepx / 2 - config.padding - forward * scale;
  const limit = config.sizepx - config.padding;
  return {
    x: Math.min(Math.max(screenx, config.padding), limit),
    y: Math.min(Math.max(screeny, config.padding), limit),
    clamped: screenx < config.padding || screenx > limit || screeny < config.padding || screeny > limit,
  };
}

/** the window one hitmarker kind shows for, in ms. */
export function hitmarkerwindow(kind: HitmarkerKind): number {
  return HITWINDOWS[kind];
}

/** the kind one landed hit shows (kill outranks headshot outranks body). */
export function hitmarkerfor(killed: boolean, headshot: boolean): HitmarkerKind {
  if (killed) return "kill";
  if (headshot) return "headshot";
  return "body";
}

/** appends a hitmarker (the hud keeps the list, this grows it). */
export function pushhitmarker(markers: Hitmarker[], marker: Hitmarker): Hitmarker[] {
  return [...markers, marker];
}

/** the hitmarkers still inside their window at the clock time. */
export function activehitmarkers(markers: Hitmarker[], now: number): Hitmarker[] {
  return markers.filter((marker) => now - marker.at < hitmarkerwindow(marker.kind));
}

/**
 * appends one killfeed row with dedup: a repeated id refreshes the row
 * (moved to the end with its new stamp) instead of doubling it, and the
 * feed never grows past the cap.
 *
 * @param feed the current feed.
 * @param entry the row to append.
 * @param cap the maximum rows (default the hud constant).
 * @returns the new feed.
 */
export function pushkillfeed(feed: KillfeedEntry[], entry: KillfeedEntry, cap: number = KILLFEEDCAP): KillfeedEntry[] {
  const kept = feed.filter((row) => row.id !== entry.id);
  kept.push(entry);
  return kept.slice(Math.max(0, kept.length - cap));
}

/** the rows still inside the ttl at the clock time (oldest first). */
export function prunekillfeed(feed: KillfeedEntry[], now: number, ttl: number = KILLFEEDTTL): KillfeedEntry[] {
  return feed.filter((row) => now - row.at < ttl);
}

/** the plain-text line the feed paints (no dom — the string only). */
export function killfeedline(entry: KillfeedEntry): string {
  const mark = entry.headshot ? " ⊕" : "";
  return `${entry.killer} [${entry.weapon}] ${entry.victim}${mark}`;
}

/** the relative angle of a threat on the x/z plane, 0 = front, clockwise. */
export function directionaldamage(
  source: { x: number; z: number },
  receiver: { x: number; z: number },
  yaw: number,
): DamagePing {
  const dx = source.x - receiver.x;
  const dz = source.z - receiver.z;
  const distance = Math.hypot(dx, dz);
  const relative = Math.atan2(dx, dz) - yaw;
  const angle = ((relative % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const strength = Math.max(DAMAGESTRENGTHFLOOR, 1 - distance / 40);
  return { angle, sector: sectorof(angle), strength };
}

/** the compass sector of a relative angle (quadrants, front-centered). */
export function sectorof(angle: number): DamageSector {
  const wrapped = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const quarter = Math.PI / 4;
  if (wrapped < quarter || wrapped >= Math.PI * 2 - quarter) return "front";
  if (wrapped < 3 * quarter) return "right";
  if (wrapped < 5 * quarter) return "behind";
  return "left";
}
