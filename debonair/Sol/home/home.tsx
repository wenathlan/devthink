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
// skeleton while the catalog answers, the 60ms stagger on entry), the genre
// vitrine (the trained profile cards the catalog seam serves from the db —
// the bpm range, the key pool top, the band balance bar, the trained-on
// count; the offline seed answers the fifteen untrained genres), the 01–03
// create flow, the engine ledger with the spec proof and the footer
// meta-quad carrying the family row (the familyurl contract over the
// family.ts table — the same table the rail foot and the tests read).
// The hero lockup owns the mark on the landing; the typed draft hands over
// to the composer through the session draft (debonair.draft).
import { type CSSProperties, type FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { planTake, type TakePlan } from "../../arranger.ts";
import { listGenreProfileCards, listHeroBadges, listLibraryTracks, listStageCards } from "../../catalog.ts";
import { familyrow } from "../../family.ts";
import { familyurl } from "../../familyurl.ts";
import { GENRES } from "../../genrematrix.ts";
import type { FeatureCard, GenreProfileCard, LibraryTrackRow, SignalBadge } from "../../katexis.ts";
import { MASTERING, PROMPT_MAX_LENGTH } from "../../katexis.ts";
import { label, labelfill } from "../../labels.ts";
import { busFeature, busPlay, busSubscribe } from "../../playerbus.ts";
import { PROMPT_DRAFT_KEY, type PromptDraft } from "../generate/generate.tsx";
import { DebonairMark, type NavLink, Shell } from "../shell/Shell.tsx";
import { HomeEntrygate as EntryGate, GenreCard, SongCard, SongCardSkeleton } from "../wingets";

/** one deterministic bar of the hero waveform strip: the stable id the list
 * keys read plus the fixed amplitude (the same walk every render) */
type HeroBar = { id: string; amp: number };

/** the deterministic amplitudes of the hero waveform strip (the engine floor
 * — a fixed 48-bar walk, decorative only, the same value every render; the
 * baked id keys the row, never the array index) */
const HERO_WAVE: readonly HeroBar[] = Array.from({ length: 48 }, (_, index) => {
  const envelope = Math.sin((index / 47) * Math.PI) ** 1.5;
  const carrier = 0.45 + 0.35 * Math.sin(index * 0.55) + 0.2 * Math.sin(index * 0.13 + 1.2);
  const amp = Math.min(1, Math.max(0.08, envelope * carrier + 0.06));
  return { id: `hw-${index}`, amp };
});

/** the home surface the gate reveals (the landing hero, rails and ledgers). */
function HomeSurface() {
  // the footer links, the create flow and the spec proof read the label
  // store at render time (the manifest answers english, the store answers
  // the translated rows the seed protected)
  const FOOTER_LINKS: readonly NavLink[] = [
    { label: label("nav.studio"), href: "/studio" },
    { label: label("nav.generate"), href: "/generate" },
    { label: label("nav.library"), href: "/library" },
    { label: label("nav.settings"), href: "/settings" },
  ];

  /** the create flow of the landing: three mono-numbered steps — the honest flow */
  const FLOW_STEPS: readonly { no: string; title: string; text: string }[] = [
    { no: "01", title: label("home.flow.describe"), text: label("home.flow.describeBody") },
    { no: "02", title: label("home.flow.arrange"), text: label("home.flow.arrangeBody") },
    { no: "03", title: label("home.flow.master"), text: label("home.flow.masterBody") },
  ];

  /** the spec proof of the hero ledger: the engine's own configuration — no invented numbers */
  const SPEC_ROWS: readonly { label: string; value: string }[] = [
    { label: label("home.spec.engine"), value: "studio" },
    {
      label: label("home.spec.render"),
      value: labelfill("home.spec.renderValue", { khz: String(MASTERING.sampleRateHz / 1000) }),
    },
    {
      label: label("home.spec.peak"),
      value: labelfill("home.spec.peakValue", { dbtp: String(MASTERING.truePeakDbtp) }),
    },
    { label: label("home.spec.loudness"), value: MASTERING.loudnessStandard },
    {
      label: label("home.spec.targets"),
      value: labelfill("home.spec.targetsValue", {
        list: Object.entries(MASTERING.platformTargetsLufs)
          .map(([platform, lufs]) => `${platform} ${lufs}`)
          .join(" · "),
      }),
    },
  ];

  const [, navigate] = useLocation();
  const [cards, setCards] = useState<readonly FeatureCard[]>([]);
  const [badges, setBadges] = useState<readonly SignalBadge[]>([]);
  const [tracks, setTracks] = useState<readonly LibraryTrackRow[]>([]);
  const [profileCards, setProfileCards] = useState<readonly GenreProfileCard[]>([]);
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
    listGenreProfileCards().then((rows) => {
      if (live) setProfileCards(rows);
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
      cta={{ label: label("home.cta"), href: "/studio" }}
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
          <span className="hero-name">{label("home.brand")}</span>
        </div>
        <h1 id="home-h" className="hero-h reveal">
          {label("home.hero.title1")}
          <br />
          {label("home.hero.title2")}
        </h1>
        <p className="hero-lede reveal">
          {label("home.hero.ledeLead")}
          <code>studio</code>
          {label("home.hero.ledeTail")}
          <strong className="ink-strong">{label("home.hero.ledeStrong")}</strong>
          {label("home.hero.ledeTail2")}
        </p>
        <form className="prompt-giga reveal" onSubmit={create}>
          <input
            className="pg-input"
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            maxLength={PROMPT_MAX_LENGTH}
            placeholder={label("home.hero.placeholder")}
            aria-label={label("home.hero.inputAria")}
          />
          <button className="pg-key" type="submit">
            {label("home.hero.create")}
            <ArrowRightRegular fontSize={16} aria-hidden="true" />
          </button>
        </form>
        <p className="pg-hint reveal">{labelfill("home.hero.hint", { max: String(PROMPT_MAX_LENGTH) })}</p>
        <fieldset className="pg-chips reveal" aria-label={label("home.hero.chipsAria")}>
          {GENRES.map((genre) => (
            <button
              key={genre.id}
              type="button"
              className="pg-chip"
              aria-pressed={genre.id === mood}
              onClick={() => setMood(genre.id)}
              title={labelfill("home.hero.chipTitle", {
                min: String(genre.bpmin),
                max: String(genre.bpmax),
                pattern: genre.pattern,
                lufs: String(genre.lufs),
              })}
            >
              {genre.label}
            </button>
          ))}
        </fieldset>
        <div className="badge-row reveal">
          {badges.map((badge) => (
            <span key={badge.label} className={`badge${badge.tone === "default" ? "" : ` ${badge.tone}`}`}>
              {badge.label}
            </span>
          ))}
        </div>
        {/* THE ENGINE FLOOR — the deterministic waveform the stage breathes on
            (decorative only: a fixed 48-bar amplitude walk, aria-hidden — the
            page never claims it is live data) */}
        <div className="hero-wave" aria-hidden="true">
          {HERO_WAVE.map((bar) => (
            <span key={bar.id} style={{ "--amp": bar.amp } as CSSProperties} />
          ))}
        </div>
      </section>

      {/* SONG GRID — the suno grammar: cover, title, the genre line, the
          duration and the play key on hover; the skeleton shimmer stands in
          while the catalog answers and the row enters on the 60ms stagger */}
      <section className="shell section" aria-labelledby="rail-h">
        <div className="section-head">
          <p className="eyebrow reveal">{label("home.rail.eyebrow")}</p>
          <h2 id="rail-h" className="h2-xl reveal">
            {label("home.rail.title")}
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
          {label("home.rail.footLead")}
          <Link className="rail-link" href="/studio">
            {label("home.rail.footLink")}
          </Link>
          {label("home.rail.footTail")}
        </p>
      </section>

      {/* THE VITRINE — the genre profile cards: the trained profile rows
          the gateway mine job lands in the db (the catalog seam serves
          them; the offline seed answers the fifteen untrained genres —
          presentation only, the numbers never hardcode). The card carries
          the bpm range, the key pool top, the band balance bar and the
          trained-on count */}
      <section className="shell section" aria-labelledby="vitrine-h">
        <div className="section-head">
          <p className="eyebrow reveal">{label("home.vitrine.eyebrow")}</p>
          <h2 id="vitrine-h" className="h2-xl reveal">
            {label("home.vitrine.title")}
          </h2>
        </div>
        <div className="genre-grid">
          {profileCards.map((card, index) => (
            <GenreCard key={card.genre} card={card} slot={index} />
          ))}
        </div>
        <p className="rail-foot reveal">{label("home.vitrine.foot")}</p>
      </section>

      {/* FLOW — the create steps 01–03 */}
      <section className="shell section" aria-labelledby="flow-h">
        <div className="section-head">
          <p className="eyebrow reveal">{label("home.flow.eyebrow")}</p>
          <h2 id="flow-h" className="h2-xl reveal">
            {label("home.flow.title")}
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
          <p className="eyebrow reveal">{label("home.engine.eyebrow")}</p>
          <h2 id="eng-h" className="h2-xl reveal">
            {label("home.engine.title")}
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
          <p className="quad-head">{label("home.quad.create")}</p>
          {FOOTER_LINKS.slice(0, 2).map((link) => (
            <Link key={link.href} className="quad-link" href={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
        <div className="quad-col">
          <p className="quad-head">{label("home.quad.browse")}</p>
          {FOOTER_LINKS.slice(2).map((link) => (
            <Link key={link.href} className="quad-link" href={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
        <div className="quad-col">
          <p className="quad-head">{label("home.quad.engine")}</p>
          <span className="quad-line">
            {labelfill("home.quad.engineLine1", { khz: String(MASTERING.sampleRateHz / 1000) })}
          </span>
          <span className="quad-line">
            {labelfill("home.quad.engineLine2", {
              standard: MASTERING.loudnessStandard,
              dbtp: String(MASTERING.truePeakDbtp),
            })}
          </span>
        </div>
        <div className="quad-col quad-col--family">
          <p className="quad-head">{label("home.quad.family")}</p>
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
