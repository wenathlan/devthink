/**
 * home page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// # Home — sub-anchor of the home page: hero with the wire globe, the library cards
// from the data layer and the apex CTA.
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Shell, type NavLink } from "../shell/Shell";
import { listHeroBadges, listLibraryCards } from "../../catalog.ts";
import type { FeatureCard, SignalBadge } from "../../argan.ts";

const FOOTER_LINKS: readonly NavLink[] = [
  { label: "Zones", href: "/zones" },
  { label: "DNSSEC", href: "/dnssec" },
  { label: "Gateway", href: "/gateway" },
  { label: "Settings", href: "/settings" },
];

/** decorative geometry of the wire globe (visual, not content data) */
const GLOBE_DOTS: readonly { top: string; left: string; size: number; duration: string; delay: string }[] = [
  { top: "16%", left: "58%", size: 10, duration: "6s", delay: "0s" },
  { top: "44%", left: "10%", size: 8, duration: "7s", delay: "-1.2s" },
  { top: "70%", left: "64%", size: 12, duration: "8s", delay: "-2.4s" },
  { top: "78%", left: "32%", size: 7, duration: "6.5s", delay: "-3.1s" },
  { top: "30%", left: "36%", size: 6, duration: "7.5s", delay: "-4s" },
];

export default function Home() {
  const [cards, setCards] = useState<readonly FeatureCard[]>([]);
  const [badges, setBadges] = useState<readonly SignalBadge[]>([]);

  useEffect(() => {
    let live = true;
    listLibraryCards().then((rows) => {
      if (live) setCards(rows);
    });
    listHeroBadges().then((rows) => {
      if (live) setBadges(rows);
    });
    return () => {
      live = false;
    };
  }, []);

  return (
    <Shell
      name="argan"
      contained={false}
      cta={{ label: "Get started", href: "/zones" }}
      footerLinks={FOOTER_LINKS}
      domain="argan.devthink.pro"
    >
      {/* HERO */}
      <section className="shell hero-section">
        <div className="hero-split">
          <div className="hero-copy">
            <p className="eyebrow reveal">argan.devthink.pro</p>
            <h1 className="wordmark reveal">Names that resolve.</h1>
            <p className="hero-lede reveal">
              argan is the DNS and gateway library of the DevThink OS: authoritative zones and record sets,
              a signing pipeline with real DNSSEC, handshake over GNS and PKARR, and the hung model —
              personal domains anchored on the <code>devthink.pro</code> apex, published to the world
              through ordinary DNS. No plugin, nothing installed on the visitor's side.
            </p>
            <div className="btn-row reveal">
              <Link className="btn" href="/zones">
                Browse the zones
              </Link>
              <Link className="btn secondary" href="/dnssec">
                How DNSSEC works
              </Link>
            </div>
            <div className="badge-row reveal">
              {badges.map((badge) => (
                <span key={badge.label} className={`badge${badge.tone === "default" ? "" : ` ${badge.tone}`}`}>
                  {badge.dot ? <span className="dot" /> : null}
                  {badge.label}
                </span>
              ))}
            </div>
          </div>
          <div className="globe-wrap reveal" aria-hidden="true">
            <div className="globe">
              {GLOBE_DOTS.map((dot) => (
                <span
                  key={`${dot.top}-${dot.left}`}
                  className="g-dot"
                  style={{
                    top: dot.top,
                    left: dot.left,
                    width: dot.size,
                    height: dot.size,
                    animationDuration: dot.duration,
                    animationDelay: dot.delay,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* LIBRARY */}
      <section className="shell section" aria-labelledby="lib-h">
        <div className="section-head">
          <p className="eyebrow reveal">the library</p>
          <h2 id="lib-h" className="reveal h2-xl">
            One library, four jobs
          </h2>
          <p className="reveal">
            Every site in the family consumes argan by configuration — no fixed address, port or credential in code, and the zone database is shared across the OS.
          </p>
        </div>
        <div className="grid cols-2">
          {cards.map((card) => (
            <Link key={card.title} className="glass glass-hover card card-link reveal" href={card.href ?? "/zones"}>
              <div className="card-row">
                <h3 className="card-title">{card.title}</h3>
                {card.badge ? (
                  <span className={`badge${card.badgeTone && card.badgeTone !== "default" ? ` ${card.badgeTone}` : ""}`}>
                    {card.badge}
                  </span>
                ) : null}
              </div>
              <p className="card-text">{card.detail}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="shell section">
        <div className="glass card cta-panel reveal">
          <div className="cta-copy">
            <h2 className="cta-title">Anchor a name on the apex</h2>
            <p className="flush">
              <code>npm install --global @devthink/argan &amp;&amp; argan publish --label mysite --zone devthink.pro</code>
            </p>
          </div>
          <Link className="btn" href="/dnssec">
            See the signing pipeline
          </Link>
        </div>
      </section>
    </Shell>
  );
}
