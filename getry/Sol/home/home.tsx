/**
 * home page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

import { ArrowEnterRegular, ArrowRightRegular } from "@fluentui/react-icons";
/**
 * HomeRegular.tsx — the LANDING page of the getry Sol theme (campaign v3 · r3):
 * the Suno-grade gateway hero — one violet light, the prompt-giga endpoint
 * field (send a completion), the replica matrix ledger (the five provider
 * gateways as the copies the meta model spins), the 01–03 deploy steps and
 * the meta-quad footer. no tabular fabrication: every row reads the root
 * gateway registry (gateway.ts) and the thinking ladder (thinking.ts).
 */
import { type FormEvent, useEffect, useState } from "react";
import { Link } from "wouter";
import { familyrow } from "../../family";
import { familyurl } from "../../familyurl";
import {
  findversion,
  GATEWAYROUTES,
  type GatewayVersion,
  listversions,
  liveversions,
  totalroutes,
} from "../../gateway";
import { label, labelfill } from "../../labels";
import { observeReveals } from "../../reveal";
import { ROTATIONEVERY } from "../../sessions";
import { budgetof, DEFAULTTHINKINGLEVEL, formatbudget, THINKINGLEVELS } from "../../thinking";
import { BrandMark } from "../widgets";
import { toast } from "../toast/Toast.tsx";
import { HomeEntrygate as EntryGate } from "../widgets";

/** the parsed endpoint: the replica the prefix names and the route kind that follows. */
function parseendpoint(value: string): { version: GatewayVersion | null; route: string | null; tail: string } {
  const cleaned = value.trim().toLowerCase().replace(/\/+$/, "");
  const match = /^\/(v\d)(?:\/(.*))?$/.exec(cleaned);
  if (!match) return { version: null, route: null, tail: cleaned };
  const tail = match[2] ?? "";
  return {
    version: findversion(match[1]),
    route: (GATEWAYROUTES as readonly string[]).includes(tail) ? tail : null,
    tail,
  };
}

/** the status line under the field: what the typed endpoint resolves to. */
function statusline(value: string): string {
  const { version, route, tail } = parseendpoint(value);
  if (!version) return labelfill("home.status.unrouted", { count: String(listversions().length) });
  if (route)
    return labelfill("home.status.routed", {
      v: version.v,
      provider: version.provider,
      route,
      badge: version.badge,
    });
  if (tail) return labelfill("home.status.unknownRoute", { v: version.v, provider: version.provider });
  return labelfill("home.status.nameRoute", { v: version.v, provider: version.provider, badge: version.badge });
}

/** the deploy steps of the landing (the real gateway doctrine, 01–03). the
 * step ordinals ride the presentation; the copy rides the labels store. */
const STEPS: { step: string; title: string; phrase: string }[] = [
  { step: "01", title: label("home.steps.deploy.title"), phrase: label("home.steps.deploy.phrase") },
  { step: "02", title: label("home.steps.route.title"), phrase: label("home.steps.route.phrase") },
  { step: "03", title: label("home.steps.mask.title"), phrase: label("home.steps.mask.phrase") },
];

/**
 * The home page: the entry gate rides the surface — the flow law (intro →
 * onboarding → the platform) is consulted before the home shows.
 *
 * @returns the gated home element.
 */
export function HomeRegular() {
  return (
    <EntryGate>
      <HomeSurface />
    </EntryGate>
  );
}

/**
 * The home surface the gate reveals: the Suno-grade gateway hero — one
 * violet light, the prompt-giga endpoint field (send a completion), the
 * replica matrix ledger (the five provider gateways as the copies the meta
 * model spins), the 01–03 deploy steps and the meta-quad footer. no tabular
 * fabrication: every row reads the root gateway registry (gateway.ts) and
 * the thinking ladder (thinking.ts).
 *
 * @returns the home element.
 */
function HomeSurface() {
  const [endpoint, setEndpoint] = useState("/v1/chat/completions");

  useEffect(() => {
    observeReveals();
  }, []);

  const parsed = parseendpoint(endpoint);
  const versions = listversions();

  /** the send key: the honest hand-off toast, never a fake fetch. */
  function sendcompletion(event: FormEvent) {
    event.preventDefault();
    const target = endpoint.trim().toLowerCase() || "/v1/chat/completions";
    toast(labelfill("home.hero.sendToast", { endpoint: target }), "info");
  }

  /** a replica chip: rewrites the version segment, keeps the named route. */
  function pickversion(v: string) {
    setEndpoint(`/${v}/${parsed.tail && parsed.route ? parsed.tail : "chat/completions"}`);
  }

  /** a route chip: rewrites the route kind on the resolved replica (v1 default). */
  function pickroute(route: string) {
    setEndpoint(`/${parsed.version?.v ?? "v1"}/${route}`);
  }

  return (
    <>
      <section className="hero grain halftone r3-hero">
        <p className="eyebrow reveal">{label("home.eyebrow")}</p>
        <div className="r3-hero__grid">
          <div className="r3-hero__main">
            <h1 className="r3-headline reveal">{label("home.title")}</h1>
            <p className="r3-phrase reveal">
              {labelfill("home.lede", { count: String(totalroutes()) })}
            </p>

            <form className="r3-prompt reveal" onSubmit={sendcompletion}>
              <div className="r3-prompt__field">
                <span className="r3-prompt__label" aria-hidden="true">
                  {label("home.hero.label")}
                </span>
                <input
                  className="r3-prompt__input"
                  value={endpoint}
                  onChange={(event) => setEndpoint(event.target.value)}
                  spellCheck={false}
                  autoComplete="off"
                  aria-label={label("home.hero.inputAria")}
                />
                <button type="submit" className="r3-prompt__key">
                  {label("home.hero.send")}
                  <ArrowEnterRegular fontSize={13} aria-hidden="true" />
                </button>
              </div>
              <p className="r3-prompt__status" aria-live="polite">
                {statusline(endpoint)}
              </p>
              <div className="r3-prompt__chips">
                <fieldset className="r3-chipset">
                  <legend className="r3-chipset__legend">{label("home.chips.replica")}</legend>
                  {versions.map((version) => (
                    <button
                      key={version.v}
                      type="button"
                      className="r3-chip"
                      aria-pressed={parsed.version?.v === version.v ? "true" : "false"}
                      onClick={() => pickversion(version.v)}
                    >
                      /{version.v} {version.provider}
                    </button>
                  ))}
                </fieldset>
                <fieldset className="r3-chipset">
                  <legend className="r3-chipset__legend">{label("home.chips.route")}</legend>
                  {GATEWAYROUTES.map((route) => (
                    <button
                      key={route}
                      type="button"
                      className="r3-chip r3-chip--route"
                      aria-pressed={parsed.tail === route ? "true" : "false"}
                      onClick={() => pickroute(route)}
                    >
                      {route}
                    </button>
                  ))}
                </fieldset>
              </div>
            </form>

            <div className="importstrip reveal">
              <span className="badge">{labelfill("home.badge.live", { count: String(liveversions().length) })}</span>
              <span className="badge info">{labelfill("home.badge.routes", { count: String(totalroutes()) })}</span>
              <span className="badge success">{label("home.badge.passthrough")}</span>
            </div>
          </div>
          <div className="r3-hero__side" aria-hidden="true">
            <span className="r3-heromark">
              <BrandMark size={128} flow />
            </span>
          </div>
        </div>
      </section>

      <section className="section" aria-label={label("home.matrix.aria")}>
        <div className="section-head reveal">
          <h2>{label("home.matrix.title")}</h2>
          <p>{label("home.matrix.lede")}</p>
        </div>
        <table className="r3-matrix reveal">
          <thead>
            <tr>
              <th scope="col">{label("home.table.replica")}</th>
              <th scope="col">{label("home.table.serves")}</th>
              <th scope="col">{label("home.table.lane")}</th>
              <th scope="col">{label("home.table.routes")}</th>
              <th scope="col">{label("home.table.status")}</th>
            </tr>
          </thead>
          <tbody>
            {versions.map((version) => {
              const featured = version.v === "v3";
              return (
                <tr
                  key={version.v}
                  data-paused={version.badge !== "live" ? "true" : undefined}
                  data-featured={featured ? "true" : undefined}
                >
                  <td className="r3-matrix__id">
                    <strong>{version.v}</strong>
                    <small>{version.provider}</small>
                  </td>
                  <td className="r3-matrix__serves">
                    <span className="r3-tag">devthink</span>
                    {featured ? <span className="r3-matrix__featnote">{label("home.matrix.featnote")}</span> : null}
                  </td>
                  <td className="r3-matrix__lane">/{version.v}/chat/completions</td>
                  <td className="r3-matrix__count">{version.routes.length}</td>
                  <td className="r3-matrix__state">
                    <i
                      className="r3-livedot"
                      data-live={version.badge === "live" ? "true" : undefined}
                      aria-hidden="true"
                    />
                    {version.badge}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="r3-matrix__note reveal">{label("home.matrix.note")}</p>
      </section>

      <section className="section" aria-label={label("home.steps.aria")}>
        <div className="r3-steps">
          {STEPS.map((item) => (
            <article key={item.step} className="r3-step reveal">
              <span className="r3-step__index" aria-hidden="true">
                {item.step}
              </span>
              <h3 className="r3-step__title">{item.title}</h3>
              <p className="r3-step__phrase">{item.phrase}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="r3-quad">
        <div className="r3-quad__col">
          <p className="r3-quad__head">{label("home.quad.gateway")}</p>
          <p className="r3-quad__meta">
            {labelfill("home.quad.gatewayMeta", {
              replicas: String(versions.length),
              routes: String(totalroutes()),
              live: String(liveversions().length),
            })}
          </p>
        </div>
        <div className="r3-quad__col">
          <p className="r3-quad__head">{label("home.quad.thinking")}</p>
          <p className="r3-quad__meta">
            {labelfill("home.quad.thinkingMeta", {
              rungs: String(THINKINGLEVELS.length),
              default: DEFAULTTHINKINGLEVEL,
              budget: formatbudget(budgetof(DEFAULTTHINKINGLEVEL)),
            })}
          </p>
        </div>
        <div className="r3-quad__col">
          <p className="r3-quad__head">{label("home.quad.store")}</p>
          <p className="r3-quad__meta">{labelfill("home.quad.storeMeta", { every: String(ROTATIONEVERY) })}</p>
        </div>
        <nav className="r3-quad__col" aria-label={label("home.quad.domainsAria")}>
          <p className="r3-quad__head">{label("home.quad.pages")}</p>
          <p className="r3-quad__meta r3-quad__links">
            <Link href="/versions">
              {label("nav.versions")}
              <ArrowRightRegular fontSize={12} aria-hidden="true" />
            </Link>
            <Link href="/thinking">
              {label("nav.thinking")}
              <ArrowRightRegular fontSize={12} aria-hidden="true" />
            </Link>
            <Link href="/sessions">
              {label("nav.sessions")}
              <ArrowRightRegular fontSize={12} aria-hidden="true" />
            </Link>
          </p>
        </nav>
        <nav className="r3-quad__family" aria-label={label("home.family.aria")}>
          <span className="r3-quad__familyhead">{label("home.family.head")}</span>
          {familyrow().map((member) => (
            <a
              key={member.slug}
              className="r3-quad__famlink"
              href={familyurl(member.slug)}
              target="_blank"
              rel="noreferrer"
              data-tip={labelfill("home.family.tip", { slug: member.slug })}
              aria-label={member.slug}
            >
              <span className="r3-quad__famdot" aria-hidden="true" style={{ backgroundColor: member.accent }} />
              {member.slug}
            </a>
          ))}
        </nav>
      </footer>
    </>
  );
}

export default HomeRegular;
