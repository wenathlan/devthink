/**
 * home page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

import { ArrowRight } from "lucide-react";
// # Home — the LANDING (campaign v3 · r3-debonair): the prompt-first create
// hero over the warm brass stage light — a giant mono field with the gold
// create key embedded and the genre chips below — then the featured-render
// cover rail with the ONE raised card, the 01–03 create flow, the engine
// ledger with the spec proof and the footer meta-quad. The hero lockup owns
// the mark on the landing (the title-bar mark rests here); the typed draft
// hands over to the composer through the session draft (debonair.draft).
import { type FormEvent, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { listGenres, listHeroBadges, listLibraryTracks, listStageCards } from "../../catalog.ts";
import type { FeatureCard, GenreConfig, LibraryTrackRow, SignalBadge } from "../../katexis.ts";
import { MASTERING, PROMPT_MAX_LENGTH } from "../../katexis.ts";
import { PROMPT_DRAFT_KEY, type PromptDraft } from "../generate/generate";
import { DebonairMark, type NavLink, Shell } from "../shell/Shell";
import { CoverArt } from "./coverart";

const FOOTER_LINKS: readonly NavLink[] = [
  { label: "Studio", href: "/studio" },
  { label: "Generate", href: "/generate" },
  { label: "Library", href: "/library" },
  { label: "Settings", href: "/settings" },
];

/** the create flow of the landing: three mono-numbered steps — the honest flow */
const FLOW_STEPS: readonly { no: string; title: string; text: string }[] = [
  { no: "01", title: "Describe", text: "One line is enough — a genre, a mood, a key." },
  { no: "02", title: "Arrange", text: "The katexis engine drafts the full multitrack take." },
  { no: "03", title: "Master", text: "Genre-aware mix, true-peak limiter, WAV out." },
];

/** the spec proof of the hero ledger: the engine's own configuration — no invented numbers */
const SPEC_ROWS: readonly { label: string; value: string }[] = [
  { label: "engine", value: "katexis" },
  { label: "render", value: `${MASTERING.sampleRateHz / 1000} kHz WAV` },
  { label: "true peak", value: `${MASTERING.truePeakDbtp} dBTP` },
  { label: "loudness", value: MASTERING.loudnessStandard },
  {
    label: "platform targets",
    value: `${Object.entries(MASTERING.platformTargetsLufs)
      .map(([platform, lufs]) => `${platform} ${lufs}`)
      .join(" · ")} LUFS`,
  },
];

export default function Home() {
  const [, navigate] = useLocation();
  const [cards, setCards] = useState<readonly FeatureCard[]>([]);
  const [badges, setBadges] = useState<readonly SignalBadge[]>([]);
  const [genres, setGenres] = useState<readonly GenreConfig[]>([]);
  const [tracks, setTracks] = useState<readonly LibraryTrackRow[]>([]);
  const [mood, setMood] = useState("techno");
  const [draft, setDraft] = useState("");

  useEffect(() => {
    let live = true;
    listStageCards().then((rows) => {
      if (live) setCards(rows);
    });
    listHeroBadges().then((rows) => {
      if (live) setBadges(rows);
    });
    listGenres().then((rows) => {
      if (live) setGenres(rows);
    });
    listLibraryTracks().then((rows) => {
      if (live) setTracks(rows);
    });
    return () => {
      live = false;
    };
  }, []);

  /** hands the hero draft to the composer: the payload rides the session
   * storage (tab memory, nothing touches the machine) and the generate page
   * picks it up once. */
  const create = (event: FormEvent): void => {
    event.preventDefault();
    const text = draft.trim();
    if (text) {
      const hand: PromptDraft = { text, genre: mood };
      try {
        window.sessionStorage.setItem(PROMPT_DRAFT_KEY, JSON.stringify(hand));
      } catch {
        /* storage unavailable: the composer starts clean */
      }
    }
    navigate("/generate");
  };

  return (
    <Shell
      name="debonair"
      contained={false}
      cta={{ label: "Open studio", href: "/studio" }}
      footerLinks={FOOTER_LINKS}
      domain="devthink.pro"
    >
      {/* HERO — the landing stage: the warm brass light, the halftone dissolve
          and the film grain over the prompt-first create field. The lockup
          carries the mark once (the title-bar mark rests while landing). */}
      <section className="hero-stage halftone grain" aria-labelledby="home-h">
        <div className="hero-light breathe" aria-hidden="true" />
        <div className="hero-lockup reveal">
          <span className="hero-mark" aria-hidden="true">
            <DebonairMark size={40} />
          </span>
          <span className="hero-name">debonair</span>
        </div>
        <h1 id="home-h" className="hero-h reveal">
          Describe a track.
          <br />
          Hear it mastered.
        </h1>
        <p className="hero-lede reveal">
          One line in, and the <code>katexis</code> engine drafts the whole arrangement — harmony, melody, rhythm and
          mix — on a multitrack timeline you can edit and export.{" "}
          <strong className="ink-strong">suno × FL Studio</strong>, on your own domain.
        </p>
        <form className="prompt-giga reveal" onSubmit={create}>
          <input
            className="pg-input"
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            maxLength={PROMPT_MAX_LENGTH}
            placeholder="midnight house, warm sub bass, dusty keys — C minor, 124 BPM"
            aria-label="Describe the track"
          />
          <button className="pg-key" type="submit">
            Create
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </form>
        <p className="pg-hint reveal">enter opens the composer with your draft · 280 characters max</p>
        <fieldset className="pg-chips reveal" aria-label="Genre mood">
          {genres.map((genre) => (
            <button
              key={genre.id}
              type="button"
              className="pg-chip"
              aria-pressed={genre.id === mood}
              onClick={() => setMood(genre.id)}
            >
              {genre.label}
            </button>
          ))}
        </fieldset>
        <div className="badge-row reveal">
          {badges.map((badge) => (
            <span key={badge.label} className={`badge${badge.tone === "default" ? "" : ` ${badge.tone}`}`}>
              {badge.dot ? <span className="dot" /> : null}
              {badge.label}
            </span>
          ))}
        </div>
      </section>

      {/* FEATURED RAIL — cover-led, snap scrolling, ONE raised card */}
      <section className="shell section" aria-labelledby="rail-h">
        <div className="section-head">
          <p className="eyebrow reveal">from the library</p>
          <h2 id="rail-h" className="h2-xl reveal">
            Fresh from the render queue
          </h2>
        </div>
        <div className="cover-rail">
          {tracks.map((track, index) => (
            <article key={track.name} className={`cover-card reveal${index === 3 ? " is-featured" : ""}`}>
              <span className="cover-frame" aria-hidden="true">
                <CoverArt name={track.name} />
              </span>
              <h3 className="cover-name">{track.name}</h3>
              <p className="cover-meta">{`${track.genre} · ${track.duration}`}</p>
            </article>
          ))}
        </div>
      </section>

      {/* FLOW — the create steps 01–03 */}
      <section className="shell section" aria-labelledby="flow-h">
        <div className="section-head">
          <p className="eyebrow reveal">the flow</p>
          <h2 id="flow-h" className="h2-xl reveal">
            Prompt to master, one engine
          </h2>
        </div>
        <ol className="flow-steps reveal">
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
      </section>

      {/* ENGINE LEDGER + SPEC PROOF — hairline rows, never a quote carousel */}
      <section className="shell section" aria-labelledby="eng-h">
        <div className="section-head">
          <p className="eyebrow reveal">what it does</p>
          <h2 id="eng-h" className="h2-xl reveal">
            Four stages, one take
          </h2>
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
              {card.badge ? <span className="ledger-badge">{card.badge}</span> : null}
            </article>
          ))}
        </div>
        <dl className="spec-ledger reveal">
          {SPEC_ROWS.map((row) => (
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
          {FOOTER_LINKS.slice(0, 2).map((link) => (
            <Link key={link.href} className="quad-link" href={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
        <div className="quad-col">
          <p className="quad-head">browse</p>
          {FOOTER_LINKS.slice(2).map((link) => (
            <Link key={link.href} className="quad-link" href={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
        <div className="quad-col">
          <p className="quad-head">engine</p>
          <span className="quad-line">katexis · 48 kHz WAV</span>
          <span className="quad-line">BS.1770-4 · −1 dBTP</span>
        </div>
        <div className="quad-col">
          <p className="quad-head">domain</p>
          <span className="quad-line">devthink.pro</span>
          <span className="quad-line">the audio home of the family</span>
        </div>
      </footer>
    </Shell>
  );
}
