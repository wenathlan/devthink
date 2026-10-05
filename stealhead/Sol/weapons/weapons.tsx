/**
 * weapons page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

/**
 * Weapons.tsx — the armory page of the stealhead Sol theme: the weapon
 * grid with damage bars, kind filters and handling badges. rows come
 * from the root weapons logic (typed DB accessor over HTTPS with the
 * in-memory seed fallback); the component carries no data.
 */
import { useEffect, useMemo, useState } from "react";
import { Crosshair } from "lucide-react";
import { bydamage, dps, filterbykind, handling, kinds, listweapons, type Weapon, type WeaponKind } from "../../weapons.ts";
import { timetokill, type FalloffSpec } from "../../weapon.stats.ts";
import { observeReveals } from "../../reveal";

/** the widest damage of a set, used to scale the damage bars. */
function maxdamage(rows: Weapon[]): number {
  return rows.reduce((peak, row) => Math.max(peak, row.damage), 1);
}

/** the falloff spec the armory previews against — the season config owns
 * the real table; these are the documented defaults of the page. */
const ARMORYFALLOFF: FalloffSpec = { startmeters: 15, endmeters: 60, retainfraction: 0.6, curve: 1 };

/** the target model of the armory preview (health pool and probe distance). */
const ARMORYTARGET = { health: 100, meters: 10 };

/**
 * the weapons page.
 *
 * @returns the weapons element.
 */
export default function Weapons() {
  const [weapons, setWeapons] = useState<Weapon[] | null>(null);
  const [selected, setSelected] = useState<WeaponKind | "all">("all");

  useEffect(() => {
    observeReveals();
    let live = true;
    listweapons()
      .then((rows) => {
        if (live) setWeapons(rows);
      })
      .catch(() => {
        if (live) setWeapons([]);
      });
    return () => {
      live = false;
    };
  }, []);

  const armorykinds = useMemo(() => (weapons ? kinds(weapons) : []), [weapons]);
  const visible = useMemo(() => {
    if (!weapons) return null;
    return bydamage(filterbykind(weapons, selected === "all" ? undefined : selected));
  }, [weapons, selected]);

  return (
    <>
      <header className="pagehead">
        <p className="eyebrow">weapons</p>
        <h1>the armory</h1>
        <p>
          Every weapon of the platform with the damage and kind helpers of the root armory logic. The catalog lives in
          the site DB and answers over HTTPS — the interface is read-only by doctrine.
        </p>
      </header>
      <div className="toolbar" role="tablist" aria-label="weapon kinds">
        <div className="tabs">
          <button type="button" role="tab" aria-selected={selected === "all"} onClick={() => setSelected("all")}>
            all
          </button>
          {armorykinds.map((kind) => (
            <button key={kind} type="button" role="tab" aria-selected={selected === kind} onClick={() => setSelected(kind)}>
              {kind}
            </button>
          ))}
        </div>
      </div>
      {visible === null ? (
        <div className="loadingrows" aria-busy="true">
          <div className="skeleton" />
          <div className="skeleton" />
          <div className="skeleton" />
        </div>
      ) : (
        <div className="armory">
          {visible.map((weapon) => {
            const share = Math.round((weapon.damage / maxdamage(weapons ?? [])) * 100);
            const stable = handling(weapon) >= 60;
            const ttk = timetokill(weapon, ARMORYTARGET.meters, ARMORYTARGET.health, ARMORYFALLOFF).seconds;
            return (
              <article key={weapon.id} className="glass glass-hover card weaponcard reveal">
                <span className={`badge ${stable ? "success" : "warning"}`} style={{ position: "absolute", top: 18, right: 18 }}>
                  <Crosshair size={11} />
                  {stable ? "stable" : "wild"}
                </span>
                <p className="eyebrow" style={{ marginBottom: 6 }}>
                  {weapon.kind}
                </p>
                <h3>{weapon.name}</h3>
                <div className="weapondamage">
                  {weapon.damage}
                  <small> dmg / shot</small>
                </div>
                <div className="weaponmeta">
                  <span className="metarow">
                    <b>dps</b>
                    <span>{dps(weapon)}</span>
                  </span>
                  <span className="metarow">
                    <b>ttk {ARMORYTARGET.meters}m</b>
                    <span>{ttk}s</span>
                  </span>
                  <span className="metarow">
                    <b>fire rate</b>
                    <span>{weapon.firerate} rpm</span>
                  </span>
                  <span className="metarow">
                    <b>range</b>
                    <span>{weapon.rangemeters} m</span>
                  </span>
                  <span className="metarow">
                    <b>magazine</b>
                    <span>{weapon.magazine}</span>
                  </span>
                  <span className="metarow">
                    <b>recoil</b>
                    <span>{weapon.recoil}</span>
                  </span>
                  <span className="metarow">
                    <b>reload</b>
                    <span>{weapon.reloadseconds}s</span>
                  </span>
                </div>
                <div
                  className="damagebar"
                  role="img"
                  aria-label={`damage ${weapon.damage} of ${maxdamage(weapons ?? [])}`}
                >
                  <span style={{ width: `${share}%` }} />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
