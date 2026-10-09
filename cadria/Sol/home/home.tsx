/**
 * home page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// # Home — the LANDING (campaign v3 · r3-cadria): the public presentation of
// the platform. An editorial split hero — the display headline over the ONE
// rose light on the left, a mosaic of real gallery renders with the ONE
// raised piece on the right (the hero lockup owns the mark here, petal-sway
// 6s) — then the four seats and the engine proof as hairline ledger rows and
// the footer meta-quad. Every number rides the served catalog tables and the
// versawase engine defaults; nothing is invented.
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { listAnchors, listHeroBadges, listPlayerFormats, listProjects, listSeatCards } from "../../catalog.ts";
import type { CreativeAnchor, FeatureCard, GalleryProject, PlayerFormat, SignalBadge } from "../../versawase.ts";
import { playerDemo } from "../../versawase.ts";
import { CadriaMark, type NavLink, Shell } from "../shell/Shell";

const FOOTER_LINKS: readonly NavLink[] = [
  { label: "Player", href: "/player" },
  { label: "Studio", href: "/studio" },
  { label: "Gallery", href: "/gallery" },
  { label: "Settings", href: "/settings" },
];

/** the engine demo defaults the player window rides (versawase defaults, no overrides) */
const DEMO = playerDemo();

export default function Home() {
  const [cards, setCards] = useState<readonly FeatureCard[]>([]);
  const [badges, setBadges] = useState<readonly SignalBadge[]>([]);
  const [projects, setProjects] = useState<readonly GalleryProject[]>([]);
  const [anchors, setAnchors] = useState<readonly CreativeAnchor[]>([]);
  const [formats, setFormats] = useState<readonly PlayerFormat[]>([]);

  useEffect(() => {
    let live = true;
    listSeatCards().then((rows) => {
      if (live) setCards(rows);
    });
    listHeroBadges().then((rows) => {
      if (live) setBadges(rows);
    });
    listProjects().then((rows) => {
      if (live) setProjects(rows);
    });
    listAnchors().then((rows) => {
      if (live) setAnchors(rows);
    });
    listPlayerFormats().then((rows) => {
      if (live) setFormats(rows);
    });
    return () => {
      live = false;
    };
  }, []);

  /** the hero mosaic: the five first gallery renders, the second piece raised */
  const mosaic = projects.slice(0, 5);

  /** the engine proof: every value comes from the served tables and the versawase defaults */
  const spec = [
    { label: "engine", value: "versawase" },
    { label: "demo timeline", value: `${DEMO.durationSeconds} s` },
    { label: "format engines", value: `${formats.length} served` },
    { label: "creative anchors", value: `${anchors.length} docked` },
    { label: "gallery", value: `${projects.length} renders` },
  ];

  return (
    <Shell
      name="cadria"
      contained={false}
      cta={{ label: "Open studio", href: "/studio" }}
      footerLinks={FOOTER_LINKS}
      domain="cadria.devthink.pro"
    >
      {/* HERO — the editorial split: display headline left, real renders right */}
      <section className="hero-stage halftone grain" aria-labelledby="home-h">
        <div className="hero-light breathe" aria-hidden="true" />
        <div className="hero-copy">
          <div className="hero-lockup reveal">
            <span className="hero-mark" aria-hidden="true">
              <CadriaMark size={40} />
            </span>
            <span className="hero-name">cadria</span>
          </div>
          <h1 id="home-h" className="hero-h reveal">
            Frame by frame.
          </h1>
          <p className="hero-lede reveal">
            cadria is the video, image and 3D platform of the DevThink OS: a multi-format player, a layer editor and a
            rack of creative anchors on the <strong className="ink-strong">versawase</strong> engine — After Effects ×
            Photoshop × Blender, framed by one window.
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
        <nav className="hero-mosaic" aria-label="Latest renders from the gallery">
          {mosaic.map((project, index) => (
            <Link
              key={project.title}
              href="/gallery"
              className={`mosaic-item reveal${index === 1 ? " is-featured" : ""}`}
            >
              <span className={`ph ph-${project.art}`} aria-hidden="true" />
              <span className="mosaic-cap">
                <strong>{project.title}</strong>
                <code>{project.format}</code>
              </span>
            </Link>
          ))}
        </nav>
      </section>

      {/* WHAT SHIPS — the four seats as a hairline ledger + the engine proof */}
      <section className="shell section" aria-labelledby="seats-h">
        <div className="section-head">
          <p className="eyebrow reveal">what ships</p>
          <h2 id="seats-h" className="reveal h2-xl">
            One app, four seats
          </h2>
          <p className="reveal">
            cadria absorbs iukka (the universal player) and create (the editor) into a single creative platform.
          </p>
        </div>
        <div className="ledger reveal">
          {cards.map((card, index) => (
            <article key={card.title} className="ledger-row">
              <span className="ledger-no" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="ledger-main">
                <h3 className="ledger-title">{card.title}</h3>
                <p className="ledger-text">{card.detail}</p>
              </div>
            </article>
          ))}
        </div>
        <dl className="spec-ledger reveal">
          {spec.map((row) => (
            <div key={row.label} className="spec-row">
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* FOOTER META-QUAD — create / browse / engine / domain */}
      <footer className="meta-quad reveal">
        <div className="quad-col">
          <p className="quad-head">create</p>
          <Link className="quad-link" href="/player">
            Player
          </Link>
          <Link className="quad-link" href="/studio">
            Studio
          </Link>
        </div>
        <div className="quad-col">
          <p className="quad-head">browse</p>
          <Link className="quad-link" href="/gallery">
            Gallery
          </Link>
          <Link className="quad-link" href="/settings">
            Settings
          </Link>
        </div>
        <div className="quad-col">
          <p className="quad-head">engine</p>
          <span className="quad-line">versawase · hls · dash · flv</span>
          <span className="quad-line">howler audio · pdfjs docs</span>
        </div>
        <div className="quad-col">
          <p className="quad-head">domain</p>
          <span className="quad-line">cadria.devthink.pro</span>
          <span className="quad-line">the video and image home of the family</span>
        </div>
      </footer>
    </Shell>
  );
}
