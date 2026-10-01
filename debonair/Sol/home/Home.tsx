// # Home — sub-anchor of the home page: hero with the animated equalizer, the four
// stage cards from the data layer and the generate CTA.
import { useEffect, useState, type CSSProperties } from "react";
import { Link } from "wouter";
import { Shell, type NavLink } from "../shell/Shell";
import { listHeroBadges, listStageCards } from "../../catalog.ts";
import type { FeatureCard, SignalBadge } from "../../katexis.ts";

const FOOTER_LINKS: readonly NavLink[] = [
  { label: "Studio", href: "/studio" },
  { label: "Generate", href: "/generate" },
  { label: "Library", href: "/library" },
  { label: "Settings", href: "/settings" },
];

/** decorative rhythm of the equalizer bars: duration and phase per bar (presentation) */
const EQ_BARS: readonly { duration: string; delay: string }[] = [
  { duration: "1.08s", delay: "-.10s" }, { duration: "0.86s", delay: "-.32s" }, { duration: "1.24s", delay: "-.05s" },
  { duration: "0.72s", delay: "-.18s" }, { duration: "1.02s", delay: "-.40s" }, { duration: "0.94s", delay: "-.12s" },
  { duration: "1.32s", delay: "-.28s" }, { duration: "0.80s", delay: "-.02s" }, { duration: "1.10s", delay: "-.36s" },
  { duration: "0.90s", delay: "-.22s" }, { duration: "1.18s", delay: "-.08s" }, { duration: "0.76s", delay: "-.30s" },
  { duration: "1.26s", delay: "-.16s" }, { duration: "0.98s", delay: "-.44s" }, { duration: "1.06s", delay: "-.06s" },
  { duration: "0.84s", delay: "-.26s" }, { duration: "1.22s", delay: "-.14s" }, { duration: "0.74s", delay: "-.38s" },
  { duration: "1.12s", delay: "-.20s" }, { duration: "0.92s", delay: "-.02s" }, { duration: "1.28s", delay: "-.34s" },
  { duration: "0.78s", delay: "-.10s" }, { duration: "1.04s", delay: "-.24s" }, { duration: "0.88s", delay: "-.42s" },
  { duration: "1.16s", delay: "-.12s" }, { duration: "0.96s", delay: "-.30s" },
];

export default function Home() {
  const [cards, setCards] = useState<readonly FeatureCard[]>([]);
  const [badges, setBadges] = useState<readonly SignalBadge[]>([]);

  useEffect(() => {
    let live = true;
    listStageCards().then((rows) => {
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
      name="debonair"
      contained={false}
      cta={{ label: "Open studio", href: "/studio" }}
      footerLinks={FOOTER_LINKS}
      domain="devthink.pro"
    >
      {/* HERO */}
      <section className="shell hero-section">
        <p className="eyebrow reveal">debonair.devthink.pro</p>
        <h1 className="wordmark reveal">
          Sound,
          <br />
          generated.
        </h1>
        <p className="hero-lede reveal">
          debonair is the audio DAW of the DevThink OS. Describe the track you hear in your head and the{" "}
          <code>katexis</code> engine drafts the full arrangement — harmony, melody, rhythm and mix — on a
          multitrack timeline you can edit, master and export. Like <strong className="ink-strong">suno × FL Studio</strong>, on your own domain.
        </p>
        <div className="btn-row reveal">
          <Link className="btn" href="/studio">
            Open the studio
          </Link>
          <Link className="btn secondary" href="/library">
            Browse the library
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
        <div className="eq reveal" aria-hidden="true">
          {EQ_BARS.map((bar) => (
            <span
              key={`${bar.duration}-${bar.delay}`}
              style={{ "--eq-d": bar.duration, animationDelay: bar.delay } as CSSProperties}
            />
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="shell section" aria-labelledby="feat-h">
        <div className="section-head">
          <p className="eyebrow reveal">what it does</p>
          <h2 id="feat-h" className="reveal h2-xl">
            From prompt to master, one engine
          </h2>
          <p className="reveal">
            Every stage runs on <code>katexis</code> — the same theory, rhythm and quality pipeline that powers the OS.
          </p>
        </div>
        <div className="grid cols-2">
          {cards.map((card) => (
            <div key={card.title} className="glass glass-hover card reveal">
              <div className="card-row">
                <h3 className="card-title">{card.title}</h3>
                {card.badge ? <span className="badge">{card.badge}</span> : null}
              </div>
              <p className="card-text">{card.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="shell section">
        <div className="glass card cta-panel reveal">
          <div className="cta-copy">
            <h2 className="cta-title">Hear it before you believe it</h2>
            <p className="flush">Queue a render from a one-line prompt, or poke the four-track timeline in the studio. No signup, no upload — the demo runs in your browser.</p>
          </div>
          <Link className="btn" href="/generate">
            Generate a track
          </Link>
        </div>
      </section>
    </Shell>
  );
}
