/**
 * home page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself. Since the reform the mount
 * consults the entry gate (entrygate.tsx beside this anchor) before rendering
 * the landing: the first-run flow (intro, onboarding) decides, the landing
 * renders only behind a finished flow.
 */

// # Home — the public presentation (campaign v3 · r3-argan): ONE jade light
// with the halftone dissolve, the dig prompt-giga as the hero object (an
// honest resolver over the served apex snapshot — real rows, no invention),
// the zones and library ledgers as ruled hairline rows, the publication
// steps 01–03, the apex CTA and the meta-quad footer.
import { type FormEvent, useEffect, useState } from "react";
import { Link } from "wouter";
import type {
  DnsTransport,
  FeatureCard,
  PublicationStep,
  RecordSetRow,
  SignalBadge,
  ZoneSnapshot,
} from "../../argan.ts";
import {
  listApexRecordSets,
  listHeroBadges,
  listLibraryCards,
  listPublicationSteps,
  listTransports,
  listZones,
} from "../../catalog.ts";
import { familyrow } from "../../family";
import { familyurl } from "../../familyurl";
import { label, labelfill } from "../../labels";
import { ArganMark, type NavLink, Shell } from "../shell/Shell";
import { EntryGate } from "../wingets";

const FOOTER_LINKS: readonly NavLink[] = [
  { label: label("nav.zones"), href: "/zones" },
  { label: label("nav.dnssec"), href: "/dnssec" },
  { label: label("nav.gateway"), href: "/gateway" },
  { label: label("nav.settings"), href: "/settings" },
];

/** the apex the landing resolves against (the zone argan is authoritative for) */
const APEX = "devthink.pro";

/** the record types the resolve chips offer (intersected with the served rows) */
const CHIP_TYPES: readonly string[] = ["A", "AAAA", "MX", "NS", "TXT", "SOA", "CAA"];

/** the verdict of an honest local resolve: answered, empty answer or no name */
type DigStatus = "ok" | "nodata" | "nxdomain";

type DigAnswer = {
  label: string;
  type: string;
  status: DigStatus;
  rows: readonly RecordSetRow[];
};

/** normalizes a query name to the label inside the apex zone ("@" for the apex) */
function labelOf(raw: string): string {
  const name = raw.trim().toLowerCase().replace(/\.$/, "");
  if (name === APEX) return "@";
  if (name.endsWith(`.${APEX}`)) return name.slice(0, name.length - APEX.length - 1) || "@";
  return name;
}

/** parses a dig-style query: "dig <name> [TYPE]" — the verb is optional */
function parseDig(raw: string, fallbackType: string): { label: string; type: string } {
  const parts = raw.trim().split(/\s+/).filter(Boolean);
  const words = parts[0]?.toLowerCase() === "dig" ? parts.slice(1) : parts;
  const known = new Set<string>(CHIP_TYPES);
  let name = "";
  let type = fallbackType;
  for (const word of words) {
    const upper = word.toUpperCase();
    if (known.has(upper)) type = upper;
    else if (!name) name = word;
  }
  return { label: labelOf(name || APEX), type };
}

/** resolves a label + type against the served apex snapshot (wildcard honored) */
function resolveDig(
  records: readonly RecordSetRow[],
  label: string,
  type: string,
): { status: DigStatus; rows: readonly RecordSetRow[] } {
  const explicit = records.some((row) => row.kind === "record" && row.name === label);
  const hits = records.filter((row) => {
    if (row.kind !== "record" || row.type !== type) return false;
    if (row.name === label) return true;
    return row.name === "*" && !explicit && label !== "@";
  });
  if (hits.length > 0) return { status: "ok", rows: hits };
  return { status: explicit ? "nodata" : "nxdomain", rows: [] };
}

/** renders a label the way dig prints it (the wildcard stays a wildcard) */
function digName(label: string, name: string): string {
  if (name === "@") return `${APEX}.`;
  if (name === "*") return `*.${APEX}.`;
  if (label === "@") return `${APEX}.`;
  return `${label}.${APEX}.`;
}

/**
 * The landing content of the home: hero, ledgers, flow, CTA and footer —
 * rendered by the anchor only behind a finished first-run flow.
 *
 * @returns the landing element.
 */
function HomeLanding() {
  const [cards, setCards] = useState<readonly FeatureCard[]>([]);
  const [badges, setBadges] = useState<readonly SignalBadge[]>([]);
  const [zones, setZones] = useState<readonly ZoneSnapshot[]>([]);
  const [transports, setTransports] = useState<readonly DnsTransport[]>([]);
  const [steps, setSteps] = useState<readonly PublicationStep[]>([]);
  const [recordSets, setRecordSets] = useState<readonly RecordSetRow[]>([]);
  const [qtype, setQtype] = useState("A");
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState<DigAnswer | null>(null);

  useEffect(() => {
    let live = true;
    listLibraryCards().then((rows) => {
      if (live) setCards(rows);
    });
    listHeroBadges().then((rows) => {
      if (live) setBadges(rows);
    });
    listZones().then((rows) => {
      if (live) setZones(rows);
    });
    listTransports().then((rows) => {
      if (live) setTransports(rows);
    });
    listPublicationSteps().then((rows) => {
      if (live) setSteps(rows);
    });
    listApexRecordSets().then((rows) => {
      if (live) setRecordSets(rows);
    });
    return () => {
      live = false;
    };
  }, []);

  const chipTypes = CHIP_TYPES.filter((type) => recordSets.some((row) => row.kind === "record" && row.type === type));
  const apexZone = zones.find((zone) => zone.origin === APEX);
  const ttlLine = recordSets.find((row) => row.kind === "directive" && row.line.startsWith("$TTL"))?.line ?? "";
  const apexRecords = recordSets.filter((row) => row.kind === "record");

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (recordSets.length === 0) return;
    const parsed = parseDig(query, qtype);
    const verdict = resolveDig(recordSets, parsed.label, parsed.type);
    setAnswer({ label: parsed.label, type: parsed.type, status: verdict.status, rows: verdict.rows });
  };

  return (
    <Shell
      name="argan"
      contained={false}
      cta={{ label: label("home.cta"), href: "/zones" }}
      footerLinks={FOOTER_LINKS}
      domain="argan.devthink.pro"
    >
      {/* HERO — the one jade light, the halftone edge and the dig object */}
      <section className="r3a-bleed r3a-hero halftone grain">
        <span className="r3a-hero__light" aria-hidden="true" />
        <div className="r3a-hero__in">
          <div className="r3a-lockup">
            <span className="r3a-ripple" aria-hidden="true">
              <span className="r3a-ripple__ring" />
              <span className="r3a-ripple__ring" />
              <span className="r3a-ripple__ring" />
              <ArganMark size={38} hidden flow />
            </span>
            <span className="r3a-lockup__name">{label("home.brand")}</span>
            <span className="r3a-lockup__role">{label("home.hero.role")}</span>
          </div>
          <h1 className="r3a-hero__title">{label("home.hero.title")}</h1>
          <p className="r3a-hero__lede">
            {label("home.hero.ledeLead")}
            <code>{APEX}</code>
            {label("home.hero.ledeTail")}
          </p>

          {/* the hero object: a dig query resolved against the served snapshot */}
          <form className="r3a-dig" onSubmit={onSubmit}>
            <div className="r3a-dig__bar">
              <span className="r3a-dig__mark" aria-hidden="true">
                {label("home.dig.mark")}
              </span>
              <input
                className="r3a-dig__input"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={labelfill("home.hero.placeholder", { apex: APEX })}
                aria-label={label("home.hero.inputAria")}
                spellCheck={false}
                autoComplete="off"
              />
              <button className="r3a-dig__key" type="submit">
                {label("home.hero.resolve")}
              </button>
            </div>
            <fieldset className="r3a-dig__chips">
              <legend className="r3a-sr">{label("home.dig.legend")}</legend>
              {chipTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  className="r3a-chip"
                  aria-pressed={type === qtype}
                  onClick={() => setQtype(type)}
                >
                  {type}
                </button>
              ))}
            </fieldset>
            <div className="r3a-dig__out" role="status">
              {!answer ? (
                <p className="is-head flush">{label("home.dig.idle")}</p>
              ) : (
                <>
                  <p className="is-head flush">
                    {labelfill("home.dig.query", { name: digName(answer.label, "@"), type: answer.type })}
                  </p>
                  {answer.status === "ok"
                    ? answer.rows.map((row) => (
                        <p key={`${row.name}-${row.type}-${row.data}`} className="flush">
                          <span className="is-name">{digName(answer.label, row.name ?? "@")}</span>{" "}
                          {labelfill("home.dig.answerTail", { type: row.type ?? "", data: row.data ?? "" })}
                        </p>
                      ))
                    : null}
                  {answer.status === "nodata" ? (
                    <p className="is-nx flush">{labelfill("home.dig.nodata", { type: answer.type })}</p>
                  ) : null}
                  {answer.status === "nxdomain" ? (
                    <p className="is-nx flush">{label("home.dig.nxdomain")}</p>
                  ) : null}
                  <p className="is-head flush">
                    {labelfill("home.dig.status", {
                      status: answer.status === "nxdomain" ? "NXDOMAIN" : "NOERROR",
                      apex: APEX,
                      serial: apexZone?.serial ?? "—",
                      ttl: ttlLine ? ` · ${ttlLine.toLowerCase()}` : "",
                    })}
                  </p>
                </>
              )}
            </div>
          </form>

          <div className="r3a-strip">
            {badges.map((badge) => (
              <span key={badge.label} className={`badge${badge.tone === "default" ? "" : ` ${badge.tone}`}`}>
                {badge.dot ? <span className="dot" /> : null}
                {badge.label}
              </span>
            ))}
          </div>
          <p className="r3a-hero__meta">
            {labelfill("home.hero.meta", {
              zones: String(zones.length),
              transports: String(transports.length),
              records: String(apexRecords.length),
            })}
          </p>
        </div>
      </section>

      {/* ZONES — the hairline ledger with the one raised featured row */}
      <section className="shell r3a-sec r3a-sec--ruled" aria-labelledby="zones-h">
        <div className="r3a-h">
          <span className="r3a-h__no" aria-hidden="true">
            01
          </span>
          <h2 id="zones-h" className="r3a-h__title">
            {label("home.zones.title")}
          </h2>
          <p className="r3a-h__aside">{labelfill("home.zones.aside", { count: String(zones.length) })}</p>
          <p className="r3a-h__note">
            {label("home.zones.noteLead")}
            <code>YYYYMMDDNN</code>
            {label("home.zones.noteTail")}
          </p>
        </div>
        <div className="r3a-ledger">
          {zones.map((zone, index) => (
            <div key={zone.origin} className={`r3a-row r3a-row--zone${zone.origin === APEX ? " is-featured" : ""}`}>
              <span className="r3a-idx" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="r3a-zone__origin">{zone.origin}</span>
              <span className="r3a-kbd">{zone.kind}</span>
              <span className="r3a-zone__serial">{zone.serial}</span>
              <span className="zstate">
                <span className="zdot" data-state={zone.state} aria-hidden="true" />
                {zone.state}
              </span>
            </div>
          ))}
        </div>
        <p className="r3a-sec__more">
          <Link href="/zones">{label("home.zones.link")}</Link>
        </p>
      </section>

      {/* LIBRARY — the four jobs as ruled rows, each one a real route */}
      <section className="shell r3a-sec r3a-sec--ruled" aria-labelledby="lib-h">
        <div className="r3a-h">
          <span className="r3a-h__no" aria-hidden="true">
            02
          </span>
          <h2 id="lib-h" className="r3a-h__title">
            {label("home.library.title")}
          </h2>
          <p className="r3a-h__note">{label("home.library.note")}</p>
        </div>
        <div className="r3a-ledger">
          {cards.map((card, index) => (
            <Link
              key={card.title}
              className={`r3a-row r3a-row--lib${index === 0 ? " is-featured" : ""}`}
              href={card.href ?? "/zones"}
            >
              <span className="r3a-idx" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="r3a-lib__title">{card.title}</span>
              {card.badge ? <span className="r3a-kbd r3a-kbd--sig">{card.badge}</span> : null}
              <span className="r3a-lib__phrase">{card.detail}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* FLOW — the publication steps 01–03 */}
      <section className="shell r3a-sec r3a-sec--ruled" aria-labelledby="flow-h">
        <div className="r3a-h">
          <span className="r3a-h__no" aria-hidden="true">
            03
          </span>
          <h2 id="flow-h" className="r3a-h__title">
            {label("home.flow.title")}
          </h2>
          <p className="r3a-h__note">{label("home.flow.note")}</p>
        </div>
        <ol className="r3a-steps">
          {steps.slice(0, 3).map((step) => (
            <li key={step.ordinal} className="r3a-step">
              <p className="r3a-step__no" aria-hidden="true">
                {step.ordinal}
              </p>
              <h3 className="r3a-step__title">{step.title}</h3>
              <p className="r3a-step__text">{step.detail}</p>
            </li>
          ))}
        </ol>
        <p className="r3a-sec__more">
          {steps.length > 3
            ? labelfill("home.flow.more", {
                count: String(steps.length - 3),
                list: steps
                  .slice(3)
                  .map((step) => step.title.toLowerCase())
                  .join(" · "),
              })
            : null}{" "}
          <Link href="/zones">{label("home.flow.link")}</Link>
        </p>
      </section>

      {/* CTA — the apex anchor line */}
      <section className="shell r3a-cta" aria-label={label("home.cta.aria")}>
        <div>
          <h2 className="r3a-cta__title">{label("home.cta.title")}</h2>
          <code className="r3a-cta__code">{labelfill("home.cta.command", { apex: APEX })}</code>
        </div>
        <Link className="btn" href="/dnssec">
          {label("home.cta.pipeline")}
        </Link>
      </section>

      {/* FOOTER — the meta-quad, flush to the window floor */}
      <footer className="r3a-bleed r3a-foot">
        <div className="r3a-foot__col">
          <p className="r3a-foot__head">{label("home.foot.console")}</p>
          <ul>
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label.toLowerCase()}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="r3a-foot__col">
          <p className="r3a-foot__head">{label("home.foot.apex")}</p>
          <ul>
            <li>
              <span className="r3a-foot__line">{APEX}</span>
            </li>
            <li>
              <span className="r3a-foot__line">{labelfill("home.foot.nameservers", { apex: APEX })}</span>
            </li>
            <li>
              <span className="r3a-foot__line">{label("home.foot.wildcard")}</span>
            </li>
          </ul>
        </div>
        <div className="r3a-foot__col">
          <p className="r3a-foot__head">{label("home.foot.publication")}</p>
          <ul>
            {steps.map((step) => (
              <li key={step.ordinal}>
                <span className="r3a-foot__line">
                  {step.ordinal} {step.title.toLowerCase()}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="r3a-foot__col">
          <p className="r3a-foot__head">{label("home.foot.stack")}</p>
          <ul>
            {badges.map((badge) => (
              <li key={badge.label}>
                <span className="r3a-foot__line">{badge.label.toLowerCase()}</span>
              </li>
            ))}
          </ul>
        </div>
        <nav className="r3a-foot__family" aria-label={label("home.foot.family")}>
          <span className="r3a-foot__familyhead">{label("home.foot.family")}</span>
          {familyrow().map((member) => (
            <a
              key={member.slug}
              className="r3a-foot__famlink"
              href={familyurl(member.slug)}
              target="_blank"
              rel="noreferrer"
              data-tip={labelfill("home.foot.familyTip", { slug: member.slug })}
              aria-label={member.slug}
            >
              <span className="r3a-foot__famdot" aria-hidden="true" style={{ backgroundColor: member.accent }} />
              {member.slug}
            </a>
          ))}
        </nav>
        <div className="r3a-foot__base">
          <span>{label("home.foot.base")}</span>
          <span>{label("home.foot.domain")}</span>
        </div>
      </footer>
    </Shell>
  );
}

/**
 * The home anchor: the entry gate decides first (intro unseen hands to
 * /intro, onboarding unseen hands to /onboarding, null renders while the
 * state resolves) and the landing mounts only behind a finished flow.
 *
 * @returns the gated home element.
 */
export default function Home() {
  return (
    <EntryGate>
      <HomeLanding />
    </EntryGate>
  );
}
