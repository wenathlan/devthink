/**
 * home page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// HomeRegular — the LANDING of the forge (campaign 6-b · lime-brasa): the home IS
// the landing AND the platform entry, and the platform is now real (the
// runner floor answers on /runs, /queue and /logs). One brasa light over
// the charcoal stage: the hero lockup owns the drawn mark (the title-bar
// mark rests — data-landing), the display headline and ONE phrase, then
// the prompt-giga run field — a giant mono input with the embedded run key
// and the REAL runtime targets (the runner modes of runner.ts) as chips.
// The run key hands over to the floor (/runs) — a real CTA into the real
// platform, never a fake execution. Below: the capability ledger in
// hairline rows with the ONE raised featured row (center-pop), the 01–03
// run flow beside the honest-state rail at 1.6fr/1fr, the family row of
// the spec §12 accents and the footer meta-quad flush to the window floor.
// No run stats are invented — the floor reports capabilities, not runs.
import { ArrowRightRegular, ArrowUpRightRegular } from "@fluentui/react-icons";
import { type FormEvent, useState } from "react";
import { useLocation } from "wouter";
import { familyrow } from "../../family";
import { familyurl } from "../../familyurl";
import type { HomeProps } from "../../hometypes.ts";
import { labelfill, label } from "../../labels";
import { modes } from "../../runner.ts";
import { BrandMark } from "../wingets";
import { Entry } from "../wingets";

export * from "../wingets";

/** the honest flow of a run, end to end — the floor's own doctrine */
const FLOW_STEPS = [
  {
    no: "01",
    title: label("home.flow.mount"),
    text: label("home.flow.mountBody"),
  },
  {
    no: "02",
    title: label("home.flow.run"),
    text: label("home.flow.runBody"),
  },
  {
    no: "03",
    title: label("home.flow.report"),
    text: label("home.flow.reportBody"),
  },
] as const;

/** the capability ledger: what the floor serves — no run stats are invented */
const CAPABILITIES = [
  {
    no: "01",
    target: label("home.cap.registerTarget"),
    text: label("home.cap.registerBody"),
    status: label("home.cap.statusReady"),
    meta: label("home.cap.registerMeta"),
  },
  {
    no: "02",
    target: label("home.cap.queueTarget"),
    text: label("home.cap.queueBody"),
    status: label("home.cap.statusReady"),
    meta: label("home.cap.queueMeta"),
  },
  {
    no: "03",
    target: label("home.cap.logsTarget"),
    text: label("home.cap.logsBody"),
    status: label("home.cap.statusReady"),
    meta: label("home.cap.logsMeta"),
  },
] as const;

/** the family row of the landing footer: the nine siblings, spec §12 dots */
function FamilyRow() {
  return (
    <nav className="fg-familyrow" aria-label={label("home.family.aria")}>
      <p className="fg-familyrow__head">{label("home.family.head")}</p>
      <div className="fg-familyrow__links">
        {familyrow().map((member) => (
          <a
            key={member.slug}
            className="fg-familyrow__link"
            href={familyurl(member.slug)}
            target="_blank"
            rel="noreferrer"
            data-tip={labelfill("home.family.openAria", { slug: member.slug })}
            aria-label={labelfill("home.family.openAria", { slug: member.slug })}
          >
            <span className="fg-familyrow__dot" style={{ background: member.accent }} aria-hidden="true" />
            {member.slug}
          </a>
        ))}
      </div>
    </nav>
  );
}

export function HomeRegular(_props: HomeProps) {
  const [, navigate] = useLocation();
  const [target, setTarget] = useState<string>(modes[0]);

  /** the run key: the ONE CTA of the landing — it walks the drafted target
   * down to the real floor (/runs), where the fleet and the queue answer.
   * Nothing pretends to execute on the landing itself. */
  const run = (event: FormEvent): void => {
    event.preventDefault();
    navigate("/runs");
  };

  return (
    <main className="shell fg-home">
      {/* HERO — the landing stage: the ONE brasa light, the halftone dissolve
          and the film grain over the prompt-first run field. The lockup owns
          the mark on the landing (the title-bar mark rests — data-landing). */}
      <section className="hero-stage halftone grain" aria-labelledby="home-h">
        <div className="forge-light breathe" aria-hidden="true" />
        <div className="hero-lockup reveal in">
          <span className="hero-mark">
            <BrandMark size={44} />
          </span>
          <span className="hero-name">{label("home.hero.name")}</span>
        </div>
        <h1 id="home-h" className="hero-h reveal in">
          {label("home.hero.title")}
        </h1>
        <p className="hero-lede reveal in">{label("home.hero.lede")}</p>
        <form className="prompt-giga reveal in" onSubmit={run}>
          <input
            className="pg-input"
            type="text"
            placeholder={label("home.hero.placeholder")}
            aria-label={label("home.hero.inputAria")}
          />
          <button className="pg-key" type="submit">
            {label("home.hero.cta")}
            <ArrowRightRegular fontSize={16} aria-hidden="true" />
          </button>
        </form>
        <p className="pg-hint reveal in">{label("home.hero.hint")}</p>
        <fieldset className="pg-chips reveal in" aria-label={label("home.hero.chipsAria")}>
          {modes.map((mode) => (
            <button
              key={mode}
              type="button"
              className="pg-chip"
              aria-pressed={mode === target}
              onClick={() => setTarget(mode)}
            >
              {mode}
            </button>
          ))}
        </fieldset>
        <Entry note={label("home.entry.noteFloor")} />
      </section>

      {/* THE RUN LEDGER — hairline capability rows, the ONE raised featured
          row (center-pop). No run data exists on the staging surface, so the
          ledger presents capabilities — never invented run stats. */}
      <section className="section" id="surface" aria-labelledby="floor-h">
        <div className="section-head">
          <p className="eyebrow reveal in">{label("home.floor.eyebrow")}</p>
          <h2 id="floor-h" className="h2-xl reveal in">
            {label("home.floor.title")}
          </h2>
        </div>
        <div className="ledger reveal in">
          <article className="ledger-row fg-featured" aria-label={label("home.floor.featuredAria")}>
            <span className="ledger-no" aria-hidden="true">
              00
            </span>
            <div className="ledger-main">
              <h3 className="ledger-title">{label("home.floor.featuredTitle")}</h3>
              <p className="ledger-text">{label("home.floor.featuredBody")}</p>
            </div>
            <div className="ledger-side">
              <span className="fg-live">
                <i aria-hidden="true" />
                {label("home.floor.live")}
              </span>
              <span className="ledger-badge">{label("home.floor.badge")}</span>
            </div>
          </article>
          {CAPABILITIES.map((cap) => (
            <article key={cap.no} className="ledger-row">
              <span className="ledger-no" aria-hidden="true">
                {cap.no}
              </span>
              <div className="ledger-main">
                <h3 className="ledger-title">{cap.target}</h3>
                <p className="ledger-text">{cap.text}</p>
              </div>
              <div className="ledger-side">
                <span className="fg-live">
                  <i aria-hidden="true" />
                  {cap.status}
                </span>
                <span className="ledger-badge">{cap.meta}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* THE RUN, END TO END — the 01–03 flow at 1.6fr beside the honest-state
          rail (air + hairlines, never a nested box) */}
      <section className="section" aria-labelledby="flow-h">
        <div className="section-head">
          <p className="eyebrow reveal in">{label("home.flow.eyebrow")}</p>
          <h2 id="flow-h" className="h2-xl reveal in">
            {label("home.flow.title")}
          </h2>
        </div>
        <div className="fg-split">
          <ol className="flow-steps reveal in">
            {FLOW_STEPS.map((step) => (
              <li key={step.no} className="flow-step">
                <span className="flow-no" aria-hidden="true">
                  {step.no}
                </span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <aside className="fg-side reveal in" aria-label={label("home.side.aria")}>
            <p className="fg-side__head">{label("home.side.head")}</p>
            <p className="fg-side__text">{label("home.side.body")}</p>
            <a className="fg-side__link" href="https://github.com/wenathlan/devthink" target="_blank" rel="noreferrer">
              {label("home.side.link")}
              <ArrowUpRightRegular fontSize={14} aria-hidden="true" />
            </a>
          </aside>
        </div>
      </section>

      {/* FAMILY ROW — the nine siblings, one §12 dot each (the same table the
          rail foot and the tests read — zero drift) */}
      <FamilyRow />

      {/* FOOTER META-QUAD — floor / engine / family / domain, flush to the
          window floor */}
      <footer className="meta-quad reveal in">
        <div className="quad-col">
          <p className="quad-head">{label("home.quad.floorHead")}</p>
          <a className="quad-link" href="/runs">
            {label("home.quad.fleetsLink")}
          </a>
          <a className="quad-link" href="/queue">
            {label("home.quad.queueLink")}
          </a>
          <a className="quad-link" href="/logs">
            {label("home.quad.logsLink")}
          </a>
        </div>
        <div className="quad-col">
          <p className="quad-head">{label("home.quad.engineHead")}</p>
          <span className="quad-line">{label("home.quad.engineLine")}</span>
          <span className="quad-line">{modes.join(" · ")}</span>
        </div>
        <div className="quad-col">
          <p className="quad-head">{label("home.quad.identityHead")}</p>
          <span className="quad-line">{label("home.quad.identityLine1")}</span>
          <span className="quad-line">{label("home.quad.identityLine2")}</span>
        </div>
        <div className="quad-col">
          <p className="quad-head">{label("home.quad.domainHead")}</p>
          <span className="quad-line">{label("home.quad.domainLine1")}</span>
          <span className="quad-line">{label("home.quad.domainLine2")}</span>
        </div>
      </footer>
    </main>
  );
}

export default HomeRegular;
