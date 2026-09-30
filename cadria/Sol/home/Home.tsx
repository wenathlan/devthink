// # Home — sub-anchor of the home page: hero split with the pure-css player frame,
// the four seat cards from the data layer and the first-frame CTA.
import { useEffect, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { Shell, type NavLink } from "../Shell";
import { listHeroBadges, listSeatCards } from "../../catalog.ts";
import type { FeatureCard, SignalBadge } from "../../versawase.ts";

const FOOTER_LINKS: readonly NavLink[] = [
  { label: "Player", href: "/player" },
  { label: "Studio", href: "/studio" },
  { label: "Gallery", href: "/gallery" },
  { label: "Settings", href: "/settings" },
];

/** decorative stroke icons of the seat cards, one per row in seed order (presentation) */
const SEAT_ICONS: readonly ReactNode[] = [
  // play disc
  <svg key="player" viewBox="0 0 24 24" role="img" aria-label="player"><title>player</title><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" /></svg>,
  // layers
  <svg key="editor" viewBox="0 0 24 24" role="img" aria-label="editor"><title>editor</title>
    <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
    <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
    <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
  </svg>,
  // anchor rig
  <svg key="anchors" viewBox="0 0 24 24" role="img" aria-label="anchors"><title>anchors</title><circle cx="12" cy="5" r="3" /><line x1="12" x2="12" y1="22" y2="8" /><path d="M5 12H2a10 10 0 0 0 20 0h-3" /></svg>,
  // export tray
  <svg key="export" viewBox="0 0 24 24" role="img" aria-label="export"><title>export</title><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>,
];

export default function Home() {
  const [cards, setCards] = useState<readonly FeatureCard[]>([]);
  const [badges, setBadges] = useState<readonly SignalBadge[]>([]);

  useEffect(() => {
    let live = true;
    listSeatCards().then((rows) => {
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
      name="cadria"
      contained={false}
      cta={{ label: "Open studio", href: "/studio" }}
      footerLinks={FOOTER_LINKS}
      domain="cadria.devthink.pro"
    >
      {/* HERO */}
      <section className="shell hero-section">
        <div className="pf-wrap">
          <div>
            <p className="eyebrow reveal">cadria.devthink.pro</p>
            <h1 className="wordmark reveal">Frame by frame.</h1>
            <p className="hero-lede reveal">
              cadria is the video, image and 3D studio of the DevThink OS: a multi-format player,
              a layer editor and a rack of creative anchors, all running on the{" "}
              <strong className="ink-strong">versawase</strong> engine.
              Like After Effects × Photoshop × Figma × Blender — framed by one shell.
            </p>
            <div className="btn-row reveal">
              <Link className="btn" href="/player">
                Open the player
              </Link>
              <Link className="btn secondary" href="/studio">
                Enter the studio
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
          <div className="reveal" role="img" aria-label="Player frame preview with play button, progress bar and timecode">
            <div className="player-frame">
              <div className="pf-top" aria-hidden="true">
                <span className="pf-tc">00:14 / 02:41</span>
                <span className="badge">hls · 1080p</span>
              </div>
              <span className="pf-play" aria-hidden="true">
                <svg viewBox="0 0 24 24" role="img" aria-label="play"><title>play</title><path d="M7 4.5v15l13-7.5z" /></svg>
              </span>
              <div className="pf-controls" aria-hidden="true">
                <span className="pf-bar">
                  <span className="pf-fill" />
                  <span className="pf-knob" />
                </span>
                <span className="pf-tc">hls.js</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="shell section" aria-labelledby="feat-h">
        <div className="section-head">
          <p className="eyebrow reveal">what ships</p>
          <h2 id="feat-h" className="reveal h2-xl">
            One app, four seats
          </h2>
          <p className="reveal">cadria absorbs iukka (the universal player) and create (the editor) into a single creative platform.</p>
        </div>
        <div className="grid cols-4">
          {cards.map((card, index) => (
            <div key={card.title} className="glass glass-hover card reveal">
              <span className="feat-ico" aria-hidden="true">
                {SEAT_ICONS[index % SEAT_ICONS.length]}
              </span>
              <h3 className="h3-sm">{card.title}</h3>
              <p className="flush p-sm">{card.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="shell section">
        <div className="glass card cta-panel reveal">
          <div className="cta-copy">
            <h2 className="cta-title">Load your first frame</h2>
            <p className="flush">Drop a file or stream a link — the player accepts 24 media extensions, and the editor takes it from there.</p>
          </div>
          <Link className="btn" href="/player">
            Open the player
          </Link>
        </div>
      </section>
    </Shell>
  );
}
