/**
 * home page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

/**
 * Home.tsx — the home page of the stealhead Sol theme: the platform hero
 * (the FPS platform that imports versawase and debonair audio via the
 * published library), the import strip and the cards linking the four
 * game domains. no tabular data lives here: the page is navigation and
 * platform copy only.
 */
import { useEffect } from "react";
import { Boxes, Crosshair, Swords, Trophy, ArrowRight, PlugZap, Volume2 } from "lucide-react";
import { Link } from "wouter";
import { observeReveals } from "../../reveal";
import { toast } from "../toast/Toast";

/** the four game domains of the platform (navigation, not data). */
const domains: { href: string; label: string; about: string; icon: typeof Crosshair }[] = [
  { href: "/match", label: "match", about: "Lobbies, rounds and the live seat table of every running match.", icon: Crosshair },
  { href: "/ranking", label: "ranking", about: "The competitive ladder of the season, seeded and served by the site DB.", icon: Trophy },
  { href: "/weapons", label: "weapons", about: "The armory grid with damage, handling and kind helpers from the root logic.", icon: Swords },
  { href: "/world", label: "world", about: "Pre-compiled GLB world assets listed as hash-verified DB rows.", icon: Boxes },
];

/**
 * the home page.
 *
 * @returns the home element.
 */
export function Home() {
  useEffect(() => {
    observeReveals();
  }, []);

  return (
    <>
      <section className="hero">
        <p className="eyebrow reveal">the wenathlan family — FPS game platform</p>
        <h1 className="wordmark reveal">stealhead</h1>
        <p className="lede reveal">
          The first-person shooter platform of the family: it imports versawase from cadria and audio from debonair via
          the published library, carries no engine file of its own, and ships only the game logics — match, ranking,
          weapons and world.
        </p>
        <div className="actions reveal">
          <Link href="/match" className="btn">
            enter a match
            <ArrowRight size={16} />
          </Link>
          <button
            type="button"
            className="btn secondary"
            onClick={() => toast("the ladder answers from the site DB over HTTPS — nothing is stored on your machine", "info")}
          >
            how data reaches you
          </button>
        </div>
        <div className="importstrip reveal">
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
      </section>

      <section className="section" aria-label="game domains">
        <div className="section-head reveal">
          <h2>the four game domains</h2>
          <p>Every domain is one page fed by the root game logics: typed accessors ask the self-hosted database over HTTPS and fall back to the in-memory seed of the static build.</p>
        </div>
        <div className="domaincards">
          {domains.map((domain) => {
            const Icon = domain.icon;
            return (
              <Link key={domain.href} href={domain.href} className={`glass glass-hover card domaincard reveal`}>
                <span className="cardicon">
                  <Icon size={19} />
                </span>
                <h3>{domain.label}</h3>
                <p>{domain.about}</p>
                <span className="cardlink">
                  open {domain.label}
                  <ArrowRight size={13} />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="section" aria-label="shipping doctrine">
        <div className="glass card reveal">
          <h2>pre-compiled by doctrine</h2>
          <p>
            The platform prepares shaders and assets ahead on the family domains, so the visitor VGPU/VCPU never
            compiles anything. Heavy work runs on the self-hosted engines and sandboxes over HTTPS; the only thing your
            machine does is load this interface.
          </p>
          <p className="mono" style={{ fontSize: "0.8rem", marginBottom: 0 }}>
            match · ranking · weapons · world — one DB layer, zero client storage
          </p>
        </div>
      </section>
    </>
  );
}

export default Home;
