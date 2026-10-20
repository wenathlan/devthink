/**
 * plans page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx)
 * consumes this file.
 *
 * Plans and payment — the visual gate of the os: the engines stay free and
 * unlimited, the block lives here, tied to the account and the plan the
 * person selects. Three tier cards (free, pro, enterprise), the enterprise
 * card opening the custom fields (the megabytes of disk and ram the person
 * defines), the badge preview stamping beside the identity, and the payment
 * step as the honest placeholder (no processor is wired yet — the choice
 * stamps now, the charge lands when the gateway wave connects it). Every
 * string the page renders rides the copy store (copy.ts) — the component
 * carries no text, the db and the build seed answer through the accessor.
 */
import { CheckmarkRegular, PaymentRegular, PersonRegular } from "@fluentui/react-icons";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { copy, loadcopy } from "../../copy.ts";
import {
  CAPABILITY_BADGES,
  loadplan,
  type PlanCustom,
  type PlanView,
  peekplan,
  saveplan,
  TIER_BADGES,
  type Tier,
} from "../../planstate.ts";

/** The tier rows the cards render (the keys, never the words — the copy
 * store answers the lines). */
const TIER_ROWS: readonly { tier: Tier; key: string; lines: readonly string[] }[] = [
  { tier: "free", key: "free", lines: ["plans.tier.free.line1", "plans.tier.free.line2", "plans.tier.free.line3"] },
  { tier: "pro", key: "pro", lines: ["plans.tier.pro.line1", "plans.tier.pro.line2", "plans.tier.pro.line3"] },
  {
    tier: "enterprise",
    key: "enterprise",
    lines: ["plans.tier.enterprise.line1", "plans.tier.enterprise.line2", "plans.tier.enterprise.line3"],
  },
];

/** Badge — the pill the identity wears (the tier and the capability rows). */
function Badge({ label, detail, tone }: { label: string; detail?: string; tone: "tier" | "cap" }) {
  return (
    <span className={`plans-badge is-${tone}`} title={detail}>
      {label}
    </span>
  );
}

/** The plans surface: the cards, the custom fields, the badge preview and
 * the payment step — every word from the copy store. */
export default function Plans() {
  const [view, setView] = useState<PlanView | null>(() => peekplan());
  const [picked, setPicked] = useState<Tier>(() => peekplan()?.tier ?? "free");
  const [custom, setCustom] = useState<PlanCustom>(() => ({
    storagemb: peekplan()?.storagemb,
    rammib: peekplan()?.rammib,
  }));
  const [stamping, setStamping] = useState(false);

  useEffect(() => {
    let live = true;
    void loadcopy().then(() =>
      loadplan().then((plan) => {
        if (live && plan) {
          setView(plan);
          setPicked(plan.tier);
        }
      }),
    );
    return () => {
      live = false;
    };
  }, []);

  const stamp = async (): Promise<void> => {
    setStamping(true);
    const stamped = await saveplan(picked, custom);
    setView(stamped);
    setStamping(false);
  };

  return (
    <main className="plans-page">
      <header className="plans-head">
        <h1>{copy("plans.title")}</h1>
        <p>{copy("plans.lede")}</p>
        {view ? (
          <p className="plans-current">
            {copy("plans.current")}: <strong>{view.tier}</strong>
            {view.storagemb ? ` · ${view.storagemb} mb` : ""}
            {view.rammib ? ` · ${view.rammib} mb` : ""}
          </p>
        ) : null}
      </header>

      <section className="plans-cards" aria-label={TIER_BADGES.enterprise.detail}>
        {TIER_ROWS.map((row) => (
          <article key={row.tier} className={`plans-card${picked === row.tier ? " is-picked" : ""}`}>
            <header className="plans-card-head">
              <PersonRegular fontSize={18} aria-hidden="true" />
              <h2>{copy(`plans.tier.${row.key}.headline`)}</h2>
              {view?.tier === row.tier ? (
                <Badge label={TIER_BADGES[row.tier].label} tone="tier" detail={TIER_BADGES[row.tier].detail} />
              ) : null}
            </header>
            <ul className="plans-lines">
              {row.lines.map((line) => (
                <li key={line}>
                  <CheckmarkRegular fontSize={14} aria-hidden="true" />
                  {copy(line)}
                </li>
              ))}
            </ul>
            {row.tier === "enterprise" && picked === "enterprise" ? (
              <fieldset className="plans-custom">
                <legend>{copy("plans.custom.legend")}</legend>
                <label>
                  {copy("plans.custom.disk")}
                  <input
                    type="number"
                    min={1024}
                    step={1024}
                    value={custom.storagemb ?? ""}
                    placeholder="65536"
                    onChange={(event) =>
                      setCustom((current) => ({ ...current, storagemb: Number(event.target.value) || undefined }))
                    }
                  />
                </label>
                <label>
                  {copy("plans.custom.ram")}
                  <input
                    type="number"
                    min={1024}
                    step={1024}
                    value={custom.rammib ?? ""}
                    placeholder="16384"
                    onChange={(event) =>
                      setCustom((current) => ({ ...current, rammib: Number(event.target.value) || undefined }))
                    }
                  />
                </label>
              </fieldset>
            ) : null}
            <button
              type="button"
              className="plans-pick"
              aria-pressed={picked === row.tier}
              onClick={() => setPicked(row.tier)}
            >
              {picked === row.tier ? copy("plans.card.selected") : copy("plans.card.select")}
            </button>
          </article>
        ))}
      </section>

      <section className="plans-badges" aria-label={copy("plans.badges.title")}>
        <h2>{copy("plans.badges.title")}</h2>
        <div className="plans-badge-row">
          <Badge label={TIER_BADGES[picked].label} tone="tier" detail={TIER_BADGES[picked].detail} />
          {CAPABILITY_BADGES.map((cap) => (
            <Badge key={cap} label={cap} tone="cap" />
          ))}
        </div>
      </section>

      <section className="plans-payment" aria-label={copy("plans.payment.title")}>
        <h2>{copy("plans.payment.title")}</h2>
        <p>{copy("plans.payment.lede")}</p>
        <div className="plans-actions">
          <button type="button" className="plans-confirm" onClick={() => void stamp()} disabled={stamping}>
            <PaymentRegular fontSize={16} aria-hidden="true" />
            {stamping ? copy("plans.payment.stamping") : `${copy("plans.payment.stamp")} ${picked}`}
          </button>
          <Link href="/panel" className="plans-back">
            {copy("plans.back")}
          </Link>
        </div>
      </section>
    </main>
  );
}
