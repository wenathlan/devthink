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

import {
  ArrowRightRegular as ArrowRight,
  BoxMultipleRegular as Boxes,
  TargetRegular as Crosshair,
  PlugConnectedRegular as PlugZap,
  FlashRegular as Swords,
  TrophyRegular as Trophy,
  Speaker2Regular as Volume2,
} from "@fluentui/react-icons";
// Home.tsx — the LANDING (campaign v3 · r3-stealthhead): the cinematic stage of
// the FPS platform — ONE red rim light over the tactical dark, the drawn
// scope reticle sweeping ±2° as the hero object, the tactical-caps display
// headline and the machined CTA keys; below, the featured match as the ONE
// raised tile (rows served by the site DB), the four domains as hairline
// ledger rows and the footer meta-quad flush to the window floor. The scope
// owns the mark on the landing (the title-bar mark rests, data-landing).
import { type CSSProperties, useEffect, useState } from "react";
import { Link } from "wouter";
import { familyrow } from "../../family";
import { familyurl } from "../../familyurl";
import { type LabelKey, labelfill, label } from "../../labels";
import { currentround, listmatches, type MatchLobby, orderlobbies, roundcounts } from "../../match.ts";
import { progressof } from "../../matchrules.ts";
import { observeReveals } from "../../reveal";
import { BrandMark } from "../wingets";
import { toast } from "../toast/Toast.tsx";
import { EntryGate } from "../wingets";
import { Scope } from "../wingets";

/** the four game domains of the platform (navigation, not data) — the text
 * rides the label accessor, the href rides the route table. */
const domains: { href: string; labelKey: LabelKey; aboutKey: LabelKey; metaKey: LabelKey; icon: typeof Crosshair }[] = [
  {
    href: "/match",
    labelKey: "home.domain.match",
    aboutKey: "home.domain.matchAbout",
    metaKey: "home.domain.matchMeta",
    icon: Crosshair,
  },
  {
    href: "/ranking",
    labelKey: "home.domain.ranking",
    aboutKey: "home.domain.rankingAbout",
    metaKey: "home.domain.rankingMeta",
    icon: Trophy,
  },
  {
    href: "/weapons",
    labelKey: "home.domain.weapons",
    aboutKey: "home.domain.weaponsAbout",
    metaKey: "home.domain.weaponsMeta",
    icon: Swords,
  },
  {
    href: "/world",
    labelKey: "home.domain.world",
    aboutKey: "home.domain.worldAbout",
    metaKey: "home.domain.worldMeta",
    icon: Boxes,
  },
];

/**
 * the landing content of the home: the cinematic stage, the featured match
 * tile, the domain ledger and the footer meta-quad — rendered by the anchor
 * only behind a finished first-run flow.
 *
 * @returns the landing element.
 */
function HomeLanding() {
  const [featured, setFeatured] = useState<MatchLobby | null>(null);
  const [boardwait, setBoardwait] = useState(true);

  useEffect(() => {
    observeReveals();
    let live = true;
    listmatches()
      .then((rows) => {
        if (live) setFeatured(orderlobbies(rows)[0] ?? null);
      })
      .catch(() => {
        if (live) setFeatured(null);
      })
      .finally(() => {
        if (live) setBoardwait(false);
      });
    return () => {
      live = false;
    };
  }, []);

  const counts = featured ? roundcounts(featured) : null;
  const current = featured ? currentround(featured) : null;
  const progress = featured ? progressof(featured) : 0;
  const liveBoard = featured?.state === "live";

  return (
    <>
      {/* THE STAGE — the cinematic landing hero: one red rim light, the scope
          reticle and the tactical-caps display headline. */}
      <section className="shstage halftone grain" aria-labelledby="shstage-h">
        <div className="shstage__light" aria-hidden="true" />
        <div className="shstage__grid">
          <div className="shstage__copy">
            {/* the mark lockup: the ONE mark of the landing zone (the title-bar
                mark rests under data-landing) — the drawn scope mark with the
                light band riding INSIDE the glyph strokes (the spec §9 family
                signature; the chrome and intro marks stay still) */}
            <div className="shstage__lockup reveal">
              <span className="shstage__mark">
                <BrandMark size={38} flow />
              </span>
              <p className="eyebrow">{label("home.eyebrow")}</p>
            </div>
            <h1 className="shstage__h reveal" id="shstage-h">
              {label("home.title")}
            </h1>
            <p className="shstage__lede reveal">{label("home.lede")}</p>
            <div className="shstage__actions reveal">
              <Link href="/match" className="btn press">
                {label("home.cta.match")}
                <ArrowRight fontSize={16} />
              </Link>
              {/* the ONE CTA law: the hero closes with the single machined key;
                  the honest data note rides beside it as a quiet mono cue —
                  a cue answers, it never competes with the CTA */}
              <button
                type="button"
                className="shstage__cue press"
                onClick={() => toast(label("home.data.toast"), "info")}
              >
                {label("home.cta.dataCue")}
              </button>
            </div>
            <div className="shstage__chips reveal">
              <span className="badge">
                <PlugZap fontSize={11} />
                {label("home.badge.versawase")}
              </span>
              <span className="badge">
                <Volume2 fontSize={11} />
                {label("home.badge.audio")}
              </span>
              <span className="badge info">{label("home.badge.noEngine")}</span>
              <span className="badge success">{label("home.badge.precompiled")}</span>
            </div>
          </div>
          <div className="shstage__scope reveal">
            <Scope />
          </div>
        </div>
      </section>

      {/* THE FEATURED MATCH — the ONE raised tile of the landing, carrying the
          board the site DB is serving right now. */}
      <section className="shsection" aria-label={label("home.featured.aria")}>
        {boardwait ? <p className="shstage__wait mono">{label("home.featured.wait")}</p> : null}
        {featured && counts ? (
          <Link
            href="/match"
            className="shfeat reveal"
            data-tip={labelfill("home.featured.tip", { title: featured.title })}
          >
            <div className="shfeat__head">
              <span className="shfeat__eyebrow">{label("home.featured.eyebrow")}</span>
              <span className={`badge ${liveBoard ? "error" : featured.state === "open" ? "success" : ""}`}>
                {liveBoard ? <span className="dot livedot" aria-hidden="true" /> : null}
                {featured.state}
              </span>
            </div>
            <h2 className="shfeat__title">{featured.title}</h2>
            <p className="shfeat__meta mono">
              {labelfill("home.featured.meta", {
                region: featured.region,
                capacity: String(featured.capacity),
                scored: String(counts.scored),
                live: String(counts.live),
                pending: String(counts.pending),
              })}
            </p>
            <div className="shfeat__map">
              <span className="shfeat__mapname">{current ? current.map : label("home.featured.settled")}</span>
              <span className="shfeat__mapmode mono">
                {current
                  ? labelfill("home.featured.mode", { mode: current.mode, index: String(current.index) })
                  : label("home.featured.settledNote")}
              </span>
            </div>
            <div className="shmeter" role="img" aria-label={labelfill("home.featured.progressAria", { progress: String(progress) })}>
              <span style={{ width: `${progress}%` }} />
            </div>
            <span className="shfeat__cta">
              {label("home.featured.cta")}
              <ArrowRight fontSize={14} />
            </span>
          </Link>
        ) : null}
      </section>

      {/* THE DOMAIN LEDGER — the four consoles of the platform as hairline
          rows (zero box design). */}
      <section className="shsection" aria-label={label("home.domains.aria")}>
        <div className="shsection__head reveal">
          <p className="eyebrow">{label("home.domains.eyebrow")}</p>
          <h2 className="shsection__h">{label("home.domains.title")}</h2>
        </div>
        <div className="shledger">
          {domains.map((domain, index) => {
            const Icon = domain.icon;
            return (
              <Link
                key={domain.href}
                href={domain.href}
                className="shledger__row reveal"
                style={{ "--sh-d": index } as CSSProperties}
              >
                <span className="shledger__no">{String(index + 1).padStart(2, "0")}</span>
                <span className="shledger__icon" aria-hidden="true">
                  <Icon fontSize={17} strokeWidth={1.7} />
                </span>
                <span className="shledger__body">
                  <span className="shledger__name">{label(domain.labelKey)}</span>
                  <span className="shledger__about">{label(domain.aboutKey)}</span>
                </span>
                <span className="shledger__meta mono">{label(domain.metaKey)}</span>
                <span className="shledger__arrow" aria-hidden="true">
                  <ArrowRight fontSize={15} />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* THE META-QUAD — platform / domains / engine / doctrine, flush to the
          window floor. */}
      <footer className="shquad" role="contentinfo" aria-label={label("home.quad.aria")}>
        <div className="shquad__col">
          <p className="shquad__head">{label("home.quad.platform")}</p>
          <p className="shquad__line">{label("home.quad.platformLine")}</p>
        </div>
        <div className="shquad__col">
          <p className="shquad__head">{label("home.quad.domains")}</p>
          {domains.map((domain) => (
            <Link key={domain.href} href={domain.href} className="shquad__link">
              {label(domain.labelKey)}
            </Link>
          ))}
        </div>
        <div className="shquad__col">
          <p className="shquad__head">{label("home.quad.engine")}</p>
          <p className="shquad__line">{label("home.badge.versawase")}</p>
          <p className="shquad__line">{label("home.badge.audio")}</p>
        </div>
        <div className="shquad__col">
          <p className="shquad__head">{label("home.quad.doctrine")}</p>
          <p className="shquad__line">{label("home.quad.doctrineLine1")}</p>
          <p className="shquad__line">{label("home.quad.doctrineLine2")}</p>
        </div>
        {/* the family row of the landing footer: the same family.ts table the
            rail foot renders (spec §12 accents, familyurl links) — the two
            surfaces share one source, so the row can never drift */}
        <nav className="shquad__family" aria-label={label("home.family.aria")}>
          <span className="shquad__familyhead">{label("home.family.head")}</span>
          {familyrow().map((member) => (
            <a
              key={member.slug}
              className="shquad__famlink"
              href={familyurl(member.slug)}
              target="_blank"
              rel="noreferrer"
              data-tip={labelfill("home.family.tip", { slug: member.slug })}
              aria-label={labelfill("home.family.ariaOpen", { slug: member.slug })}
            >
              <span
                className="shquad__famdot"
                aria-hidden="true"
                style={{ "--fam-dot": member.accent } as CSSProperties}
              />
              <span className="shquad__famlabel">{member.slug}</span>
            </a>
          ))}
        </nav>
      </footer>
    </>
  );
}

/**
 * the home anchor: the entry gate decides first (intro unseen hands to
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
