/**
 * home page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file.
 *
 * The landing of the cobaia content site: what the devthink family is, said
 * directly — ten deployable applications on one engine, shipped as static
 * sites, tracked nowhere. Left-aligned hero (no centered hero + pill), the
 * three how-it-works steps on hairline seams (01 engine · 02 static · 03
 * honest), a four-card preview of the directory leading to /apps, the
 * support strip, and the one reserved ad slot at the end of the content.
 * No entry gate and no first-run flow: cobaia is a content site — the home
 * renders directly, every page is public.
 * Styled entirely by Sol/sol.css.
 */
import type { CSSProperties } from "react";
import { familyurl } from "../../familyurl";
import { type LabelKey, labelfill, label } from "../../labels";
import { ROSTER } from "../widgets/apps.roster.ts";
import { AdSlot } from "../widgets/shell.adsslot.tsx";
import { BrandMark } from "../widgets/shell.brand.tsx";

/** the featured deploy units of the landing preview (the full directory
 * lives on /apps): the OS, the engine, the store and one studio — read
 * from the one roster table so the preview can never drift from /apps. */
const FEATUREDSLUGS: readonly string[] = ["devthink", "saddle", "vault", "cadria"];
const FEATURED = ROSTER.filter((member) => FEATUREDSLUGS.includes(member.slug));

/** the three steps of the landing: what the family is made of — the text
 * rides the label accessor (the store keeps the sentence). */
const STEPS: readonly { n: LabelKey; title: LabelKey; text: LabelKey }[] = [
  { n: "home.steps.engine.n", title: "home.steps.engine.title", text: "home.steps.engine.text" },
  { n: "home.steps.static.n", title: "home.steps.static.title", text: "home.steps.static.text" },
  { n: "home.steps.honest.n", title: "home.steps.honest.title", text: "home.steps.honest.text" },
];

export function Home() {
  return (
    <div className="cb-page">
      {/* the hero: the family said plainly */}
      <section className="cb-hero" aria-label={label("home.aria.hero")}>
        <div className="cb-in" style={{ "--cb-d": 0 } as CSSProperties}>
          <BrandMark size={52} />
        </div>
        <p className="cb-eyebrow cb-in" style={{ "--cb-d": 1 } as CSSProperties}>
          {label("home.eyebrow")}
        </p>
        <h1 className="cb-title cb-in" style={{ "--cb-d": 2 } as CSSProperties}>
          {label("home.title")}
        </h1>
        <p className="cb-lede cb-in" style={{ "--cb-d": 3 } as CSSProperties}>
          {label("home.lede")}
        </p>
        <div className="cb-btnrow cb-in" style={{ "--cb-d": 4 } as CSSProperties}>
          <a className="cb-btn" href="/pricing">
            {label("home.action.pricing")}
          </a>
          <a className="cb-btn cb-btn--ghost" href="/apps">
            {label("home.action.apps")}
          </a>
        </div>
      </section>

      {/* the three steps, on hairline seams */}
      <section className="cb-section" aria-label={label("home.section.stepsAria")}>
        <div className="cb-secthead cb-in" style={{ "--cb-d": 0 } as CSSProperties}>
          <h2 className="cb-secttitle">{label("home.section.stepsTitle")}</h2>
          <p className="cb-sectlede">{label("home.section.stepsLede")}</p>
        </div>
        <div className="cb-grid cb-grid--3">
          {STEPS.map((step, index) => (
            <div key={step.n} className="cb-card cb-in" style={{ "--cb-d": index + 1 } as CSSProperties}>
              <p className="cb-cardmeta">{label(step.n)}</p>
              <h3 className="cb-cardtitle">{label(step.title)}</h3>
              <p className="cb-cardtext">{label(step.text)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* the directory preview: four of the ten, the rest on /apps */}
      <section className="cb-section" aria-label={label("home.section.previewAria")}>
        <div className="cb-secthead cb-in" style={{ "--cb-d": 0 } as CSSProperties}>
          <h2 className="cb-secttitle">{label("home.section.previewTitle")}</h2>
          <p className="cb-sectlede">
            {label("home.section.previewLede")}{" "}
            <a className="cb-link" href="/apps">
              {label("home.section.previewLink")}
            </a>
            {label("home.section.previewTail")}
          </p>
        </div>
        <div className="cb-appgrid">
          {FEATURED.map((app, index) => (
            <a
              key={app.slug}
              className="cb-appcard cb-in"
              href={familyurl(app.slug)}
              target="_blank"
              rel="noreferrer"
              style={{ "--cb-dot": app.accent, "--cb-d": index + 1 } as CSSProperties}
            >
              <span className="cb-apphead">
                <span className="cb-appdot" aria-hidden="true" />
                <span className="cb-appname">{app.slug}</span>
              </span>
              <span className="cb-approle">{app.role}</span>
              <span className="cb-appopen">{labelfill("home.appcard.open", { slug: app.slug })}</span>
            </a>
          ))}
        </div>
      </section>

      {/* the support strip: the honest ask */}
      <section className="cb-section" aria-label={label("home.section.supportAria")}>
        <div className="cb-secthead cb-in" style={{ "--cb-d": 0 } as CSSProperties}>
          <h2 className="cb-secttitle">{label("home.section.supportTitle")}</h2>
          <p className="cb-sectlede">{label("home.section.supportLede")}</p>
        </div>
        <div className="cb-btnrow cb-in" style={{ "--cb-d": 1 } as CSSProperties}>
          <a className="cb-btn cb-btn--ghost" href="/support">
            {label("home.action.support")}
          </a>
        </div>
      </section>

      {/* the one reserved ad slot of the page, at the end of the content */}
      <AdSlot page="home" />
    </div>
  );
}

export default Home;
