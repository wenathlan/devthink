/**
 * home page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

import { ArrowRightRegular } from "@fluentui/react-icons";
// # Home — the LANDING (campaign 5-b): the Suno-style prompt-first hero over
// the noir stage with the brass light — one giant mono field with the single
// create key and the engine's own genre matrix as chips — then the song grid
// (cover, title, genre line, duration, the play key on hover, the shimmer
// skeleton while the catalog answers, the 60ms stagger on entry), the 01–03
// create flow, the engine ledger with the spec proof and the footer
// meta-quad carrying the family row (the familyurl contract over the
// family.ts table — the same table the rail foot and the tests read).
// The hero lockup owns the mark on the landing; the typed draft hands over
// to the composer through the session draft (debonair.draft).
import { type CSSProperties, type FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { planTake, type TakePlan } from "../../arranger.ts";
import { listHeroBadges, listLibraryTracks, listStageCards } from "../../catalog.ts";
import { familyrow } from "../../family.ts";
import { familyurl } from "../../familyurl.ts";
import { GENRES } from "../../genrematrix.ts";
import type { FeatureCard, LibraryTrackRow, SignalBadge } from "../../katexis.ts";
import { MASTERING, PROMPT_MAX_LENGTH } from "../../katexis.ts";
import { busFeature, busPlay, busSubscribe } from "../../playerbus.ts";
import { PROMPT_DRAFT_KEY, type PromptDraft } from "../generate/generate.tsx";
import { DebonairMark, type NavLink, Shell } from "../shell/Shell.tsx";
import EntryGate from "./entrygate.tsx";
import { SongCard, SongCardSkeleton } from "./songcard.tsx";

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

/** the home surface the gate reveals (the landing hero, rails and ledgers). */
function HomeSurface() {
  const [, navigate] = useLocation();
  const [cards, setCards] = useState<readonly FeatureCard[]>([]);
  const [badges, setBadges] = useState<readonly SignalBadge[]>([]);
  const [tracks, setTracks] = useState<readonly LibraryTrackRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveId, setLiveId] = useState("");
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
    listLibraryTracks().then((rows) => {
      if (live) {
        setTracks(rows);
        setLoading(false);
      }
    });
    return () => {
      live = false;
    };
  }, []);

  // the player bus shares one transport with the shell bar: the landing
  // marks the take the bar is playing so the card key can wear the live ring
  useEffect(() => busSubscribe((view) => setLiveId(view.playing ? (view.takes[view.index]?.id ?? "") : "")), []);

  /** the engine take a row renders on demand: the row name IS the prompt and
   * the seed, so the same card always plays the same real take */
  const rowTakes = useMemo(() => {
    const map = new Map<string, TakePlan>();
    for (const track of tracks) {
      const genre = GENRES.find((entry) => entry.label.toLowerCase() === track.genre.toLowerCase());
      map.set(track.name, planTake({ prompt: `${track.genre} ${track.name}`, seed: track.name, genreId: genre?.id }));
    }
    return map;
  }, [tracks]);

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

  /** hands a card row to the shared transport: the take lands on the bus and
   * the bar (and this card) wear the live state */
  const playRow = (take: TakePlan): void => {
    busFeature(take);
    busPlay(0);
  };

  return (
    <Shell
      name="debonair"
      contained={false}
      cta={{ label: "Open studio", href: "/studio" }}
      footerLinks={FOOTER_LINKS}
      domain="devthink.pro"
    >
      {/* HERO — the landing stage: the noir floor, the warm brass light, the
          halftone dissolve and the film grain over the prompt-first field. The
          lockup carries the mark once (the title-bar mark rests while landing). */}
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
          One line in, the <code>katexis</code> engine drafts, edits and masters the whole arrangement —{" "}
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
            <ArrowRightRegular fontSize={16} aria-hidden="true" />
          </button>
        </form>
        <p className="pg-hint reveal">enter opens the composer with your draft · {PROMPT_MAX_LENGTH} characters max</p>
        <fieldset className="pg-chips reveal" aria-label="Genre mood">
          {GENRES.map((genre) => (
            <button
              key={genre.id}
              type="button"
              className="pg-chip"
              aria-pressed={genre.id === mood}
              onClick={() => setMood(genre.id)}
              title={`${genre.bpmin}–${genre.bpmax} bpm · ${genre.pattern} drums · ${genre.lufs} LUFS target`}
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

      {/* SONG GRID — the suno grammar: cover, title, the genre line, the
          duration and the play key on hover; the skeleton shimmer stands in
          while the catalog answers and the row enters on the 60ms stagger */}
      <section className="shell section" aria-labelledby="rail-h">
        <div className="section-head">
          <p className="eyebrow reveal">from the library</p>
          <h2 id="rail-h" className="h2-xl reveal">
            Fresh from the render queue
          </h2>
        </div>
        <div className="song-grid">
          {loading
            ? [0, 1, 2, 3, 4, 5].map((slot) => <SongCardSkeleton key={`sk-${slot}`} slot={slot} />)
            : tracks.map((track, index) => {
                const take = rowTakes.get(track.name);
                if (!take) return null;
                return (
                  <SongCard
                    key={track.name}
                    track={track}
                    take={take}
                    slot={index}
                    live={liveId === take.id}
                    onPlay={playRow}
                  />
                );
              })}
        </div>
        <p className="rail-foot reveal">
          The engine's real takes play right here — press a cover, the bar below carries it — or{" "}
          <Link className="rail-link" href="/studio">
            open the console
          </Link>{" "}
          and ride the desk.
        </p>
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

      {/* FOOTER META-QUAD — create / browse / engine / family */}
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
          <span className="quad-line">katexis · {MASTERING.sampleRateHz / 1000} kHz WAV</span>
          <span className="quad-line">
            {MASTERING.loudnessStandard} · {MASTERING.truePeakDbtp} dBTP
          </span>
        </div>
        <div className="quad-col quad-col--family">
          <p className="quad-head">family</p>
          <div className="quad-family">
            {familyrow().map((member) => (
              <a
                key={member.slug}
                className="quad-link quad-link--fam"
                href={familyurl(member.slug)}
                style={{ "--fam-accent": member.accent } as CSSProperties}
              >
                <span className="quad-famdot" aria-hidden="true" style={{ background: member.accent }} />
                {member.slug}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </Shell>
  );
}

/**
 * The home page anchor: the entry gate rides the surface — the flow law
 * (intro → onboarding → the platform) is consulted before the home shows.
 *
 * @returns the gated home element.
 */
export default function Home() {
  return (
    <EntryGate>
      <HomeSurface />
    </EntryGate>
  );
}
