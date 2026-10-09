/**
 * home page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

import { ArrowRight, Boxes, Crosshair, PlugZap, Swords, Trophy, Volume2 } from "lucide-react";
// Home.tsx — the LANDING (campaign v3 · r3-stealthhead): the cinematic stage of
// the FPS platform — ONE red rim light over the tactical dark, the drawn
// scope reticle sweeping ±2° as the hero object, the tactical-caps display
// headline and the machined CTA keys; below, the featured match as the ONE
// raised tile (rows served by the site DB), the four domains as hairline
// ledger rows and the footer meta-quad flush to the window floor. The scope
// owns the mark on the landing (the title-bar mark rests, data-landing).
import { type CSSProperties, useEffect, useState } from "react";
import { Link } from "wouter";
import { currentround, listmatches, type MatchLobby, orderlobbies, roundcounts } from "../../match.ts";
import { progressof } from "../../matchrules.ts";
import { observeReveals } from "../../reveal";
import { toast } from "../toast/Toast";
import { Scope } from "./scope";

/** the four game domains of the platform (navigation, not data). */
const domains: { href: string; label: string; about: string; meta: string; icon: typeof Crosshair }[] = [
  {
    href: "/match",
    label: "match",
    about: "Lobbies, rounds and the live seat table of every running match.",
    meta: "lobbies · rounds · seats",
    icon: Crosshair,
  },
  {
    href: "/ranking",
    label: "ranking",
    about: "The competitive ladder of the season, seeded and served by the site DB.",
    meta: "ladder · elo deltas",
    icon: Trophy,
  },
  {
    href: "/weapons",
    label: "weapons",
    about: "The armory ledger with damage, handling and kind helpers from the root logic.",
    meta: "damage · ttk · falloff",
    icon: Swords,
  },
  {
    href: "/world",
    label: "world",
    about: "Pre-compiled GLB world assets listed as hash-verified DB rows.",
    meta: "glb rows · sha-256",
    icon: Boxes,
  },
];

/**
 * the home page: the landing stage, the featured match tile, the domain
 * ledger and the footer meta-quad.
 *
 * @returns the home element.
 */
export function Home() {
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
            <p className="eyebrow reveal">stealthhead · fps platform</p>
            <h1 className="shstage__h reveal" id="shstage-h">
              Sights on. Stage set.
            </h1>
            <p className="shstage__lede reveal">
              The first-person shooter platform of the family — it imports versawase from cadria and audio from
              debonair, carries no engine file of its own, and serves match, ranking, weapons and world from one DB
              layer.
            </p>
            <div className="shstage__actions reveal">
              <Link href="/match" className="btn press">
                enter a match
                <ArrowRight size={16} />
              </Link>
              <button
                type="button"
                className="btn secondary press"
                onClick={() =>
                  toast("the ladder answers from the site DB over HTTPS — nothing is stored on your machine", "info")
                }
              >
                how data reaches you
              </button>
            </div>
            <div className="shstage__chips reveal">
              <span className="badge">
                <PlugZap size={11} />
                versawase — imported from cadria
              </span>
              <span className="badge">
                <Volume2 size={11} />
                audio — imported from debonair
              </span>
              <span className="badge info">no engine file of its own</span>
              <span className="badge success">ships pre-compiled</span>
            </div>
          </div>
          <div className="shstage__scope reveal">
            <Scope />
          </div>
        </div>
      </section>

      {/* THE FEATURED MATCH — the ONE raised tile of the landing, carrying the
          board the site DB is serving right now. */}
      <section className="shsection" aria-label="featured match">
        {boardwait ? <p className="shstage__wait mono">reading the board from the site db…</p> : null}
        {featured && counts ? (
          <Link href="/match" className="shfeat reveal" title={`open the board of ${featured.title}`}>
            <div className="shfeat__head">
              <span className="shfeat__eyebrow">featured match</span>
              <span className={`badge ${liveBoard ? "error" : featured.state === "open" ? "success" : ""}`}>
                {liveBoard ? <span className="dot livedot" aria-hidden="true" /> : null}
                {featured.state}
              </span>
            </div>
            <h2 className="shfeat__title">{featured.title}</h2>
            <p className="shfeat__meta mono">
              {featured.region} · capacity {featured.capacity} · rounds {counts.scored} scored / {counts.live} live /{" "}
              {counts.pending} pending
            </p>
            <div className="shfeat__map">
              <span className="shfeat__mapname">{current ? current.map : "settled"}</span>
              <span className="shfeat__mapmode mono">
                {current ? `${current.mode} · r${current.index}` : "every round of this lobby is scored."}
              </span>
            </div>
            <div className="shmeter" role="img" aria-label={`round progress ${progress} of 100`}>
              <span style={{ width: `${progress}%` }} />
            </div>
            <span className="shfeat__cta">
              open the board
              <ArrowRight size={14} />
            </span>
          </Link>
        ) : null}
      </section>

      {/* THE DOMAIN LEDGER — the four consoles of the platform as hairline
          rows (zero box design). */}
      <section className="shsection" aria-label="game domains">
        <div className="shsection__head reveal">
          <p className="eyebrow">the four domains</p>
          <h2 className="shsection__h">One platform. Four consoles.</h2>
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
                  <Icon size={17} strokeWidth={1.7} />
                </span>
                <span className="shledger__body">
                  <span className="shledger__name">{domain.label}</span>
                  <span className="shledger__about">{domain.about}</span>
                </span>
                <span className="shledger__meta mono">{domain.meta}</span>
                <span className="shledger__arrow" aria-hidden="true">
                  <ArrowRight size={15} />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* THE META-QUAD — platform / domains / engine / doctrine, flush to the
          window floor. */}
      <footer className="shquad" role="contentinfo" aria-label="platform index">
        <div className="shquad__col">
          <p className="shquad__head">platform</p>
          <p className="shquad__line">stealthhead — the fps game platform of the wenathlan family</p>
        </div>
        <div className="shquad__col">
          <p className="shquad__head">domains</p>
          {domains.map((domain) => (
            <Link key={domain.href} href={domain.href} className="shquad__link">
              {domain.label}
            </Link>
          ))}
        </div>
        <div className="shquad__col">
          <p className="shquad__head">engine</p>
          <p className="shquad__line">versawase — imported from cadria</p>
          <p className="shquad__line">audio — imported from debonair</p>
        </div>
        <div className="shquad__col">
          <p className="shquad__head">doctrine</p>
          <p className="shquad__line">pre-compiled on the family domains</p>
          <p className="shquad__line">one db layer · zero client storage</p>
        </div>
      </footer>
    </>
  );
}

export default Home;
