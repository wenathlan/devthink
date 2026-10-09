/**
 * weapons.ts — the armory domain logic of stealthhead (root layer).
 *
 * the weapon model plus the damage/kind helpers the armory page renders
 * through. the rows below are the in-memory seed of the site DB: the
 * self-hosted database (see db.ts) carries the same table and serves it
 * over HTTPS, and the static build falls back to this seed without ever
 * touching the visitor machine.
 */

/** the armory kinds the platform catalogs. */
export type WeaponKind = "rifle" | "smg" | "sniper" | "shotgun" | "sidearm" | "heavy";

/** one weapon of the armory. */
export type Weapon = {
  id: string;
  name: string;
  kind: WeaponKind;
  damage: number;
  firerate: number;
  rangemeters: number;
  magazine: number;
  recoil: number;
  reloadseconds: number;
};

/** the in-memory seed the DB layer persists on first run. */
export const WEAPONCATALOG: Weapon[] = [
  { id: "w-1", name: "emberline ar", kind: "rifle", damage: 28, firerate: 660, rangemeters: 48, magazine: 30, recoil: 34, reloadseconds: 2.1 },
  { id: "w-2", name: "solstice dmr", kind: "sniper", damage: 88, firerate: 90, rangemeters: 120, magazine: 8, recoil: 72, reloadseconds: 3.2 },
  { id: "w-3", name: "glassjack smg", kind: "smg", damage: 19, firerate: 900, rangemeters: 26, magazine: 34, recoil: 22, reloadseconds: 1.7 },
  { id: "w-4", name: "coldsnap break", kind: "shotgun", damage: 96, firerate: 70, rangemeters: 14, magazine: 6, recoil: 81, reloadseconds: 2.8 },
  { id: "w-5", name: "quietfurnace sidearm", kind: "sidearm", damage: 32, firerate: 320, rangemeters: 32, magazine: 12, recoil: 27, reloadseconds: 1.4 },
  { id: "w-6", name: "riftyard lmg", kind: "heavy", damage: 34, firerate: 540, rangemeters: 60, magazine: 80, recoil: 48, reloadseconds: 4.6 },
  { id: "w-7", name: "northglow marksman", kind: "sniper", damage: 74, firerate: 110, rangemeters: 96, magazine: 10, recoil: 63, reloadseconds: 2.9 },
  { id: "w-8", name: "duskwake compact", kind: "smg", damage: 17, firerate: 960, rangemeters: 22, magazine: 38, recoil: 19, reloadseconds: 1.6 },
  { id: "w-9", name: "harbor twelve", kind: "shotgun", damage: 84, firerate: 85, rangemeters: 16, magazine: 8, recoil: 76, reloadseconds: 2.5 },
  { id: "w-10", name: "atoll rifle", kind: "rifle", damage: 31, firerate: 600, rangemeters: 54, magazine: 25, recoil: 37, reloadseconds: 2.3 },
];

/** fetch budget for the HTTPS answer of the self-hosted DB. */
const fetchbudget = 2500;

/** the in-memory answer cache for the document lifetime (no storage). */
let weaponcache: Weapon[] | null = null;

/**
 * lists the armory rows: asks the self-hosted DB over HTTPS first and
 * falls back to the in-memory seed when the endpoint is absent (static
 * build). never touches the visitor machine.
 *
 * @returns the weapon rows.
 */
export async function listweapons(): Promise<Weapon[]> {
  if (weaponcache) return weaponcache;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), fetchbudget);
    const response = await fetch("/api/v1/weapons", { signal: controller.signal });
    clearTimeout(timer);
    if (!response.ok) throw new Error(`weapons answered ${response.status}`);
    const rows = (await response.json()) as Weapon[];
    weaponcache = rows;
    return rows;
  } catch {
    return WEAPONCATALOG;
  }
}

/**
 * computes the sustained damage per second of a weapon.
 *
 * @param weapon the weapon to measure.
 * @returns the damage per second, rounded to one decimal.
 */
export function dps(weapon: Weapon): number {
  if (weapon.firerate === 0) return 0;
  return Math.round(((weapon.damage * weapon.firerate) / 60) * 10) / 10;
}

/**
 * lists the distinct kinds present in a set of rows, armory order kept.
 *
 * @param weapons the rows to scan.
 * @returns the kinds without duplicates.
 */
export function kinds(weapons: Weapon[]): WeaponKind[] {
  const seen = new Set<WeaponKind>();
  const ordered: WeaponKind[] = [];
  for (const weapon of weapons) {
    if (!seen.has(weapon.kind)) {
      seen.add(weapon.kind);
      ordered.push(weapon.kind);
    }
  }
  return ordered;
}

/**
 * filters the armory by kind.
 *
 * @param weapons the rows to filter.
 * @param kind the kind to keep (all rows when omitted).
 * @returns the matching rows.
 */
export function filterbykind(weapons: Weapon[], kind?: WeaponKind): Weapon[] {
  return kind ? weapons.filter((weapon) => weapon.kind === kind) : [...weapons];
}

/**
 * scores the handling of a weapon (firerate against recoil) so the
 * armory can badge the stable performers.
 *
 * @param weapon the weapon to score.
 * @returns the handling index, 0-100.
 */
export function handling(weapon: Weapon): number {
  if (weapon.recoil === 0) return 100;
  return Math.max(0, Math.min(100, Math.round((weapon.firerate / weapon.recoil) * 2)));
}

/**
 * orders the armory by damage, hardest hitting first.
 *
 * @param weapons the rows to order.
 * @returns the ordered rows.
 */
export function bydamage(weapons: Weapon[]): Weapon[] {
  return [...weapons].sort((left, right) => right.damage - left.damage);
}
