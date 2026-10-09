/**
 * home page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
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
import { ArganMark, type NavLink, Shell } from "../shell/Shell";

const FOOTER_LINKS: readonly NavLink[] = [
  { label: "Zones", href: "/zones" },
  { label: "DNSSEC", href: "/dnssec" },
  { label: "Gateway", href: "/gateway" },
  { label: "Settings", href: "/settings" },
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

export default function Home() {
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
      cta={{ label: "Get started", href: "/zones" }}
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
              <ArganMark size={38} hidden />
            </span>
            <span className="r3a-lockup__name">argan</span>
            <span className="r3a-lockup__role">dns &amp; gateway of the family</span>
          </div>
          <h1 className="r3a-hero__title">Names that resolve.</h1>
          <p className="r3a-hero__lede">
            Authoritative zones and a real DNSSEC pipeline on the <code>{APEX}</code> apex — published to the world
            through ordinary DNS. No plugin, nothing on the visitor's side.
          </p>

          {/* the hero object: a dig query resolved against the served snapshot */}
          <form className="r3a-dig" onSubmit={onSubmit}>
            <div className="r3a-dig__bar">
              <span className="r3a-dig__mark" aria-hidden="true">
                $
              </span>
              <input
                className="r3a-dig__input"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={`dig ${APEX} MX`}
                aria-label="Resolve a name against the apex snapshot"
                spellCheck={false}
                autoComplete="off"
              />
              <button className="r3a-dig__key" type="submit">
                resolve
              </button>
            </div>
            <fieldset className="r3a-dig__chips">
              <legend className="r3a-sr">record type</legend>
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
                <p className="is-head flush">;; try the apex — every answer below resolves from the live snapshot</p>
              ) : (
                <>
                  <p className="is-head flush">
                    ;; QUERY {digName(answer.label, "@")} IN {answer.type}
                  </p>
                  {answer.status === "ok"
                    ? answer.rows.map((row) => (
                        <p key={`${row.name}-${row.type}-${row.data}`} className="flush">
                          <span className="is-name">{digName(answer.label, row.name ?? "@")}</span> IN {row.type}{" "}
                          {row.data}
                        </p>
                      ))
                    : null}
                  {answer.status === "nodata" ? (
                    <p className="is-nx flush">;; the name exists — no {answer.type} records ride it</p>
                  ) : null}
                  {answer.status === "nxdomain" ? (
                    <p className="is-nx flush">;; the name is not in the served apex snapshot</p>
                  ) : null}
                  <p className="is-head flush">
                    ;; status: {answer.status === "nxdomain" ? "NXDOMAIN" : "NOERROR"} · zone {APEX} · serial{" "}
                    {apexZone?.serial ?? "—"}
                    {ttlLine ? ` · ${ttlLine.toLowerCase()}` : ""}
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
            {zones.length} zones · {transports.length} transports · {apexRecords.length} apex records · serials
            YYYYMMDDNN
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
            Zones under management
          </h2>
          <p className="r3a-h__aside">{zones.length} zones · staging snapshot</p>
          <p className="r3a-h__note">
            Masters written by the pipeline, secondaries pulled by authenticated transfer — serials follow{" "}
            <code>YYYYMMDDNN</code>.
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
          <Link href="/zones">open the zones console →</Link>
        </p>
      </section>

      {/* LIBRARY — the four jobs as ruled rows, each one a real route */}
      <section className="shell r3a-sec r3a-sec--ruled" aria-labelledby="lib-h">
        <div className="r3a-h">
          <span className="r3a-h__no" aria-hidden="true">
            02
          </span>
          <h2 id="lib-h" className="r3a-h__title">
            One library, four jobs
          </h2>
          <p className="r3a-h__note">
            Every site in the family consumes argan by configuration — no fixed address, port or credential in code.
          </p>
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
            A label becomes a live URL
          </h2>
          <p className="r3a-h__note">The pending-publication flow — a typed label never skips a stage.</p>
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
            ? `+${steps.length - 3} more in the console — ${steps
                .slice(3)
                .map((step) => step.title.toLowerCase())
                .join(" · ")} ·`
            : null}{" "}
          <Link href="/zones">the zones console →</Link>
        </p>
      </section>

      {/* CTA — the apex anchor line */}
      <section className="shell r3a-cta" aria-label="anchor a name on the apex">
        <div>
          <h2 className="r3a-cta__title">Anchor a name on the apex</h2>
          <code className="r3a-cta__code">
            npm install --global @devthink/argan &amp;&amp; argan publish --label mysite --zone {APEX}
          </code>
        </div>
        <Link className="btn" href="/dnssec">
          See the signing pipeline
        </Link>
      </section>

      {/* FOOTER — the meta-quad, flush to the window floor */}
      <footer className="r3a-bleed r3a-foot">
        <div className="r3a-foot__col">
          <p className="r3a-foot__head">console</p>
          <ul>
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label.toLowerCase()}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="r3a-foot__col">
          <p className="r3a-foot__head">the apex</p>
          <ul>
            <li>
              <span className="r3a-foot__line">{APEX}</span>
            </li>
            <li>
              <span className="r3a-foot__line">ns1 · ns2.{APEX}</span>
            </li>
            <li>
              <span className="r3a-foot__line">* → the same edge (hung model)</span>
            </li>
          </ul>
        </div>
        <div className="r3a-foot__col">
          <p className="r3a-foot__head">publication</p>
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
          <p className="r3a-foot__head">the stack</p>
          <ul>
            {badges.map((badge) => (
              <li key={badge.label}>
                <span className="r3a-foot__line">{badge.label.toLowerCase()}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="r3a-foot__base">
          <span>argan — dns and gateway of the devthink os family</span>
          <span>argan.devthink.pro</span>
        </div>
      </footer>
    </Shell>
  );
}
