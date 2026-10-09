/**
 * weapons page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

import { Crosshair } from "lucide-react";
// Weapons.tsx — the ARMORY LEDGER (campaign v3 · r3-stealhead): one specimen
// per row — index, display-face name, the damage/rate/recoil stat meters
// (tabular values over hairline bars) and the mono aux column (dps, ttk,
// range, magazine, reload). The top-damage row leads as the ONE featured
// specimen, raised; row hover tints the signal 10%. Rows come from the root
// weapons logic (typed DB accessor over HTTPS with the in-memory seed
// fallback); the component carries no data.
import { type CSSProperties, useEffect, useMemo, useState } from "react";
import { observeReveals } from "../../reveal";
import {
  bydamage,
  dps,
  filterbykind,
  handling,
  kinds,
  listweapons,
  type Weapon,
  type WeaponKind,
} from "../../weapons.ts";
import { type FalloffSpec, timetokill } from "../../weaponstats.ts";

/** the widest damage of a set, used to scale the damage bars. */
function maxdamage(rows: Weapon[]): number {
  return rows.reduce((peak, row) => Math.max(peak, row.damage), 1);
}

/** the widest value of one stat field of a set, used to scale its meter. */
function peakof(rows: Weapon[], field: "firerate" | "recoil"): number {
  return rows.reduce((peak, row) => Math.max(peak, row[field]), 1);
}

/** one stat meter of the ledger: mono key row over a hairline bar. */
function StatMeter({ label, value, share, aria }: { label: string; value: string; share: number; aria: string }) {
  return (
    <div className="shm">
      <p className="shm__key">
        <b>{label}</b> {value}
      </p>
      <div className="shm__track" role="img" aria-label={aria}>
        <span style={{ width: `${Math.max(3, Math.min(100, share))}%` }} />
      </div>
    </div>
  );
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
  const peaks = useMemo(
    () => ({
      damage: maxdamage(weapons ?? []),
      rate: peakof(weapons ?? [], "firerate"),
      recoil: peakof(weapons ?? [], "recoil"),
    }),
    [weapons],
  );
  const visible = useMemo(() => {
    if (!weapons) return null;
    return bydamage(filterbykind(weapons, selected === "all" ? undefined : selected));
  }, [weapons, selected]);

  return (
    <>
      <header className="pagehead halftone grain">
        <p className="eyebrow">stealhead · weapons</p>
        <h1>the armory</h1>
        <p>
          Every weapon of the platform with the damage and kind helpers of the root armory logic. The catalog lives in
          the site DB and answers over HTTPS — the interface is read-only by doctrine.
        </p>
      </header>
      <div className="toolbar" role="tablist" aria-label="weapon kinds">
        <div className="tabs">
          <button
            type="button"
            role="tab"
            aria-selected={selected === "all"}
            title="every kind of the armory"
            onClick={() => setSelected("all")}
          >
            all
          </button>
          {armorykinds.map((kind) => (
            <button
              key={kind}
              type="button"
              role="tab"
              aria-selected={selected === kind}
              title={`filter the armory by ${kind}`}
              onClick={() => setSelected(kind)}
            >
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
        <div className="armorylist">
          {visible.map((weapon, index) => {
            const stable = handling(weapon) >= 60;
            const ttk = timetokill(weapon, ARMORYTARGET.meters, ARMORYTARGET.health, ARMORYFALLOFF).seconds;
            return (
              <article
                key={weapon.id}
                className={`armoryrow reveal${index === 0 ? " armoryrow--hero" : ""}`}
                style={{ "--sh-rank": index } as CSSProperties}
              >
                <span className="armoryindex">{String(index + 1).padStart(2, "0")}</span>
                <div className="armorymain">
                  <p className="armorykind">
                    <span className="badge">{weapon.kind}</span>
                    <span className={`badge ${stable ? "success" : "warning"}`}>
                      <Crosshair size={10} aria-hidden="true" />
                      {stable ? "stable" : "wild"}
                    </span>
                  </p>
                  <h3 className="armoryname">{weapon.name}</h3>
                </div>
                <div className="armorymeters">
                  <StatMeter
                    label="dmg"
                    value={`${weapon.damage}`}
                    share={(weapon.damage / peaks.damage) * 100}
                    aria={`damage ${weapon.damage} of ${peaks.damage}`}
                  />
                  <StatMeter
                    label="rate"
                    value={`${weapon.firerate} rpm`}
                    share={(weapon.firerate / peaks.rate) * 100}
                    aria={`fire rate ${weapon.firerate} of ${peaks.rate} rpm`}
                  />
                  <StatMeter
                    label="recoil"
                    value={`${weapon.recoil}`}
                    share={(weapon.recoil / peaks.recoil) * 100}
                    aria={`recoil ${weapon.recoil} of ${peaks.recoil}`}
                  />
                </div>
                <p className="armorystats">
                  <span>
                    <b>dps</b> {dps(weapon)}
                  </span>
                  <span>
                    <b>ttk {ARMORYTARGET.meters}m</b> {ttk}s
                  </span>
                  <span>
                    <b>range</b> {weapon.rangemeters} m
                  </span>
                  <span>
                    <b>magazine</b> {weapon.magazine}
                  </span>
                  <span>
                    <b>reload</b> {weapon.reloadseconds}s
                  </span>
                </p>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
