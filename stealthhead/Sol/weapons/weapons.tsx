/**
 * weapons page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

import { TargetRegular as Crosshair } from "@fluentui/react-icons";
// Weapons.tsx — the ARMORY LEDGER (campaign v3 · r3-stealthhead): one specimen
// per row — index, display-face name, the damage/rate/recoil stat meters
// (tabular values over hairline bars) and the mono aux column (dps, ttk,
// range, magazine, reload). The top-damage row leads as the ONE featured
// specimen, raised; row hover tints the signal 10%. Rows come from the root
// weapons logic (typed DB accessor over HTTPS with the in-memory seed
// fallback); the component carries no data.
import { type CSSProperties, useEffect, useMemo, useState } from "react";
import { labelfill, label } from "../../labels";
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

/** one stat meter of the ledger: mono key row over a hairline bar. the key
 * and the aria sentence ride the label store. */
function StatMeter({ label: statlabel, value, share, aria }: { label: string; value: string; share: number; aria: string }) {
  return (
    <div className="shm">
      <p className="shm__key">
        <b>{statlabel}</b> {value}
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
        <p className="eyebrow">{label("weapons.eyebrow")}</p>
        <h1>{label("weapons.title")}</h1>
        <p>{label("weapons.lede")}</p>
      </header>
      <div className="toolbar" role="tablist" aria-label={label("weapons.kinds.aria")}>
        <div className="tabs">
          <button
            type="button"
            role="tab"
            aria-selected={selected === "all"}
            data-tip={label("weapons.kind.allTip")}
            onClick={() => setSelected("all")}
          >
            {label("weapons.kind.all")}
          </button>
          {armorykinds.map((kind) => (
            <button
              key={kind}
              type="button"
              role="tab"
              aria-selected={selected === kind}
              data-tip={labelfill("weapons.kind.filterTip", { kind })}
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
                      <Crosshair fontSize={10} aria-hidden="true" />
                      {stable ? label("weapons.row.stable") : label("weapons.row.wild")}
                    </span>
                  </p>
                  <h3 className="armoryname">{weapon.name}</h3>
                </div>
                <div className="armorymeters">
                  <StatMeter
                    label={label("weapons.meter.dmg")}
                    value={`${weapon.damage}`}
                    share={(weapon.damage / peaks.damage) * 100}
                    aria={labelfill("weapons.meter.damageAria", {
                      value: String(weapon.damage),
                      peak: String(peaks.damage),
                    })}
                  />
                  <StatMeter
                    label={label("weapons.meter.rate")}
                    value={labelfill("weapons.meter.rateValue", { value: String(weapon.firerate) })}
                    share={(weapon.firerate / peaks.rate) * 100}
                    aria={labelfill("weapons.meter.rateAria", {
                      value: String(weapon.firerate),
                      peak: String(peaks.rate),
                    })}
                  />
                  <StatMeter
                    label={label("weapons.meter.recoil")}
                    value={`${weapon.recoil}`}
                    share={(weapon.recoil / peaks.recoil) * 100}
                    aria={labelfill("weapons.meter.recoilAria", {
                      value: String(weapon.recoil),
                      peak: String(peaks.recoil),
                    })}
                  />
                </div>
                <p className="armorystats">
                  <span>
                    <b>{label("weapons.stats.dps")}</b> {dps(weapon)}
                  </span>
                  <span>
                    <b>{labelfill("weapons.stats.ttk", { meters: String(ARMORYTARGET.meters) })}</b>{" "}
                    {labelfill("weapons.stats.ttkValue", { value: String(ttk) })}
                  </span>
                  <span>
                    <b>{label("weapons.stats.range")}</b>{" "}
                    {labelfill("weapons.stats.rangeValue", { value: String(weapon.rangemeters) })}
                  </span>
                  <span>
                    <b>{label("weapons.stats.magazine")}</b> {weapon.magazine}
                  </span>
                  <span>
                    <b>{label("weapons.stats.reload")}</b>{" "}
                    {labelfill("weapons.stats.reloadValue", { value: String(weapon.reloadseconds) })}
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
