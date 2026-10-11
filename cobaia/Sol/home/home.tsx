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
 * The whole landing rides the entry gate (entrygate.tsx, beside this
 * anchor): the first-run state decides — intro unseen → /intro, onboarding
 * unseen → /onboarding, only a finished flow renders the home.
 * Styled entirely by Sol/sol.css.
 */
import type { CSSProperties } from "react";
import { familyurl } from "../../familyurl";
import { AdSlot } from "../shell/adsslot";
import { BrandMark } from "../shell/brand";
import { EntryGate } from "./entrygate";

/** the featured deploy units of the landing preview (the full directory
 * lives on /apps): the OS, the engine, the store and one studio. */
const FEATURED: readonly { slug: string; accent: string; role: string }[] = [
  {
    slug: "devthink",
    accent: "#f59e0b",
    role: "the OS: the one interface where the whole family opens as windows.",
  },
  {
    slug: "saddle",
    accent: "#e86f2d",
    role: "the virtualized sandbox engine: runs any sandbox, the modules stay library-grade.",
  },
  {
    slug: "vault",
    accent: "#a3d7e6",
    role: "the storage clone: keeps every site database and receives the data backups.",
  },
  {
    slug: "cadria",
    accent: "#f472b6",
    role: "the video and image studio: player, editor and gallery on the versawase engine.",
  },
];

/** the three steps of the landing: what the family is made of. */
const STEPS = [
  {
    n: "01",
    title: "one engine",
    text: "the sandbox runner and the storage layer live as library-grade modules. every application assembles the parts it needs and ships as one folder of the same monorepo.",
  },
  {
    n: "02",
    title: "static first",
    text: "every public surface builds down to one stylesheet and a handful of bundles on free static hosting. nothing is stored on the visitor machine — no cookies, no accounts, no tracking.",
  },
  {
    n: "03",
    title: "honest money",
    text: "the family runs on about us$15 a month of domains. the pricing and the support page exist to cover that floor first — and the apps themselves stay free of ads.",
  },
] as const;

export function Home() {
  return (
    <EntryGate>
      <div className="cb-page">
        {/* the hero: the family said plainly */}
        <section className="cb-hero" aria-label="cobaia — the devthink family site">
          <div className="cb-in" style={{ "--cb-d": 0 } as CSSProperties}>
            <BrandMark size={52} />
          </div>
          <p className="cb-eyebrow cb-in" style={{ "--cb-d": 1 } as CSSProperties}>
            the devthink family site
          </p>
          <h1 className="cb-title cb-in" style={{ "--cb-d": 2 } as CSSProperties}>
            One family. Ten tools. Zero tracking.
          </h1>
          <p className="cb-lede cb-in" style={{ "--cb-d": 3 } as CSSProperties}>
            devthink builds and ships a family of deployable web applications — sandbox engines, studios, gateways and a
            game platform — as static sites on shared free hosting. this site is the front door: the directory, the
            pricing, the support page and the update blog.
          </p>
          <div className="cb-btnrow cb-in" style={{ "--cb-d": 4 } as CSSProperties}>
            <a className="cb-btn" href="/pricing">
              see the pricing
            </a>
            <a className="cb-btn cb-btn--ghost" href="/apps">
              browse the ten apps
            </a>
          </div>
        </section>

        {/* the three steps, on hairline seams */}
        <section className="cb-section" aria-label="what the family is made of">
          <div className="cb-secthead cb-in" style={{ "--cb-d": 0 } as CSSProperties}>
            <h2 className="cb-secttitle">What the family is made of</h2>
            <p className="cb-sectlede">the same three choices behind every member of the family.</p>
          </div>
          <div className="cb-grid cb-grid--3">
            {STEPS.map((step, index) => (
              <div key={step.n} className="cb-card cb-in" style={{ "--cb-d": index + 1 } as CSSProperties}>
                <p className="cb-cardmeta">{step.n}</p>
                <h3 className="cb-cardtitle">{step.title}</h3>
                <p className="cb-cardtext">{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* the directory preview: four of the ten, the rest on /apps */}
        <section className="cb-section" aria-label="a preview of the app directory">
          <div className="cb-secthead cb-in" style={{ "--cb-d": 0 } as CSSProperties}>
            <h2 className="cb-secttitle">A few of the ten</h2>
            <p className="cb-sectlede">
              every member is a folder beside this site on the same origin. the full directory lives on{" "}
              <a className="cb-link" href="/apps">
                /apps
              </a>
              .
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
                <span className="cb-appopen">open {app.slug}</span>
              </a>
            ))}
          </div>
        </section>

        {/* the support strip: the honest ask */}
        <section className="cb-section" aria-label="supporting the family">
          <div className="cb-secthead cb-in" style={{ "--cb-d": 0 } as CSSProperties}>
            <h2 className="cb-secttitle">Keep the family independent</h2>
            <p className="cb-sectlede">
              github sponsors and ko-fi keep the domains paid and the tools free — both charge zero platform fees, so
              the support goes straight to the hosting floor.
            </p>
          </div>
          <div className="cb-btnrow cb-in" style={{ "--cb-d": 1 } as CSSProperties}>
            <a className="cb-btn cb-btn--ghost" href="/support">
              ways to support
            </a>
          </div>
        </section>

        {/* the one reserved ad slot of the page, at the end of the content */}
        <AdSlot page="home" />
      </div>
    </EntryGate>
  );
}

export default Home;
