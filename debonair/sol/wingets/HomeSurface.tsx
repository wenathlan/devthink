/**
 * HomeSurface.tsx — the composite winget of the home remount (the detailed
 * engine wave): the landing strip the retired prompt-first page carried,
 * rebuilt as ONE mount so the page anchor stays the thin face the
 * construction law pins on it. The strip owns the real engine lanes the old
 * landing rode:
 *
 * - the recent shelf reads the catalog seam (the site db over HTTPS when
 *   configured, the seed rows offline): the vitrine rows (the published
 *   takes the publish lane lands) beside the library sample rows, one song
 *   grid — the honest empty state while the shelf waits, the honest
 *   offline state with the real retry, never a fabricated row;
 * - every play key renders the engine take the row names on demand
 *   (`planTake` — the row's genre and name ARE the prompt and the seed, so
 *   the same card always plays the same real take) or presses the blob
 *   take a vitrine row carries, through the shared bus the shell bar
 *   renders;
 * - the genre chips read the engine matrix of genre.ts (the real
 *   bpm/pattern/lufs numbers in the tooltips) and pin the composer's genre
 *   through the session draft the generate surface reads once;
 * - the genre card row reads the same catalog seam's genre profile table
 *   (the fifteen genres the engine's own style dictionary seeds; the
 *   trained numbers the miner lane lands when references answer);
 * - the entry keys hand the visitor to the studio desk and the ingest
 *   bench.
 *
 * The arming beat rides the face prop: while the catalog reads load (the
 * first read of the route) the gate answers the construction face the
 * route wore — never a fake shelf row, never a skeleton pretending the db
 * answered. Every word rides the label store; the reveal stagger answers
 * the shared observer the route tree already carries.
 */

import { ArrowRightRegular } from "@fluentui/react-icons";
import { type CSSProperties, type FormEvent, type ReactNode, useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { planTake, type TakePlan } from "../../arrangement.ts";
import { listGenreProfileCards, listLibraryTracks, listVitrineTracks } from "../../catalog.ts";
import { formatClock } from "../../dawview.ts";
import { GENRES } from "../../genre.ts";
import type { GenreProfileCard, LibraryTrackRow, VitrineTrackRow } from "../../katexis.ts";
import { PROMPT_MAX_LENGTH } from "../../katexis.ts";
import { label, labelfill } from "../../labels.ts";
import { type BusTake, busFeature, busPlay, busSubscribe, type ReferenceTake } from "../../playerbus.ts";
import { DebonairMark, type NavLink, Shell } from "../shell/Shell.tsx";
import { PROMPT_DRAFT_KEY, type PromptDraft } from "./GenerateSurface.tsx";
import { GenreCard } from "./HomeGenrecard.tsx";
import { SongCard } from "./HomeSongcard.tsx";

/** the props of the home surface mount. */
type HomeSurfaceProps = {
  /** the face the route answers while the catalog reads arm (the loading
   * beat of the first read — the honest arming state, never a fake row). */
  face: ReactNode;
};

/** the lifecycle of the shelf reads. */
type ShelfState = "loading" | "ready" | "offline";

/** one deterministic bar of the hero waveform strip: the stable id the
 * list keys read plus the fixed amplitude (the same walk every render). */
type HeroBar = { id: string; amp: number };

/** the deterministic amplitudes of the hero waveform strip — a fixed
 * 48-bar walk, decorative only (the same value every render; the page
 * never claims it is live data, the strip stays aria-hidden). */
function heroWave(): readonly HeroBar[] {
  return Array.from({ length: 48 }, (_, index) => {
    const envelope = Math.sin((index / 47) * Math.PI) ** 1.5;
    const carrier = 0.45 + 0.35 * Math.sin(index * 0.55) + 0.2 * Math.sin(index * 0.13 + 1.2);
    const amp = Math.min(1, Math.max(0.08, envelope * carrier + 0.06));
    return { id: `hw-${index}`, amp };
  });
}

/** one row of the recent shelf: a vitrine row (the published lane) or a
 * library sample row (the site's own shelf content). */
type ShelfRow = {
  /** the row key (unique across both lanes). */
  key: string;
  /** the display name. */
  name: string;
  /** the genre line. */
  genre: string;
  /** the duration in seconds (the engine's own span). */
  seconds: number;
  /** the take the play key presses (the plan the row names, or the blob
   * take a vitrine row carries). */
  take: BusTake | null;
};

/**
 * HomeSurface — the landing strip over the real catalog and engine lanes.
 *
 * @param props the arming face of the route.
 * @returns the landing element, or the arming face while the seam answers.
 */
export function HomeSurface({ face }: HomeSurfaceProps) {
  const [, navigate] = useLocation();
  const [shelf, setShelf] = useState<ShelfState>("loading");
  const [rows, setRows] = useState<readonly ShelfRow[]>([]);
  const [profileCards, setProfileCards] = useState<readonly GenreProfileCard[]>([]);
  const [liveId, setLiveId] = useState("");
  const [mood, setMood] = useState("techno");
  const [draft, setDraft] = useState("");

  /** loads the shelf and the genre cards off the catalog seam; any failure
   * lands in the honest offline state with the real retry. */
  const load = useCallback((live: () => boolean): void => {
    setShelf("loading");
    Promise.all([listVitrineTracks(), listLibraryTracks(), listGenreProfileCards()])
      .then(([vitrine, tracks, cards]) => {
        if (!live()) return;
        setProfileCards(cards);
        setRows([...shelfRows(vitrine, tracks)]);
        setShelf("ready");
      })
      .catch(() => {
        if (live()) setShelf("offline");
      });
  }, []);

  useEffect(() => {
    let live = true;
    load(() => live);
    return () => {
      live = false;
    };
  }, [load]);

  // the player bus shares one transport with the shell bar: the landing
  // marks the take the bar is playing so the card key can wear the live ring
  useEffect(() => busSubscribe((view) => setLiveId(view.playing ? (view.takes[view.index]?.id ?? "") : "")), []);

  /** hands the hero draft to the composer: the payload rides the session
   * storage (tab memory, nothing touches the machine) and the generate
   * surface picks it up once. */
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

  /** pins the mood chip the draft carries to the composer (the chips are
   * the mood picker of the prompt-first field — the draft itself rides the
   * create key only). */
  const pinGenre = (id: string): void => {
    setMood(id);
  };

  /** hands a card row to the shared transport: the take lands on the bus and
   * the bar (and this card) wear the live state */
  const playRow = (take: BusTake): void => {
    busFeature(take);
    busPlay(0);
  };

  // the arming beat: the catalog seam holds the first read — the gate
  // answers the face the route wore until the engine's own rows (or its
  // own honest offline state) land, never a fabricated shelf row
  if (shelf === "loading") return <>{face}</>;

  // the footer links read the label store at render time (the manifest
  // answers english, the store answers the translated rows the seed protected)
  const FOOTER_LINKS: readonly NavLink[] = [
    { label: label("nav.studio"), href: "/studio" },
    { label: label("nav.generate"), href: "/generate" },
    { label: label("nav.library"), href: "/library" },
    { label: label("nav.settings"), href: "/settings" },
  ];

  return (
    <Shell
      name="debonair"
      contained={false}
      cta={{ label: label("home.cta"), href: "/studio" }}
      footerLinks={FOOTER_LINKS}
      domain="devthink.pro"
    >
      {/* HERO — the landing stage: the noir floor, the warm brass light, the
          halftone dissolve and the film grain over the prompt-first field,
          the genre matrix chips and the two entry keys of the wave */}
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
              onClick={() => pinGenre(genre.id)}
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
        <div className="btn-row reveal">
          <Link href="/studio" className="btn secondary small">
            {label("home.cta")}
          </Link>
          <Link href="/ingest" className="btn secondary small">
            {label("home.cta.ingest")}
          </Link>
        </div>
        {/* THE ENGINE FLOOR — the deterministic waveform the stage breathes
            on (decorative only: a fixed 48-bar amplitude walk, aria-hidden —
            the page never claims it is live data) */}
        <div className="hero-wave" aria-hidden="true">
          {heroWave().map((bar) => (
            <span key={bar.id} style={{ "--amp": bar.amp } as CSSProperties} />
          ))}
        </div>
      </section>

      {/* SONG GRID — the recent shelf the catalog seam answers: the vitrine
          rows (the published takes) beside the sample rows, one grammar;
          the honest empty and offline states, never a fabricated row */}
      <section className="shell section" aria-labelledby="rail-h">
        <div className="section-head">
          <p className="eyebrow reveal">{label("home.rail.eyebrow")}</p>
          <h2 id="rail-h" className="h2-xl reveal">
            {label("home.rail.title")}
          </h2>
        </div>
        {shelf === "offline" && (
          <div className="glass card">
            <p className="flush p-sm">
              {label("home.rail.offlineTitle")} — {label("home.rail.offlineLine")}
            </p>
            <div className="btn-row">
              <button className="btn small" type="button" onClick={() => load(() => true)}>
                {label("home.rail.retry")}
              </button>
            </div>
          </div>
        )}
        {shelf === "ready" && rows.length === 0 && (
          <div className="glass card">
            <p className="flush p-sm">
              {label("home.rail.emptyTitle")} — {label("home.rail.emptyLine")}
            </p>
            <div className="btn-row">
              <Link href="/generate" className="btn small">
                {label("home.rail.openGenerate")}
              </Link>
            </div>
          </div>
        )}
        {shelf === "ready" && rows.length > 0 && (
          <div className="song-grid">
            {rows.map((row, index) =>
              row.take ? (
                <SongCard
                  key={row.key}
                  track={{ name: row.name, genre: row.genre, duration: formatClock(row.seconds) }}
                  take={row.take}
                  slot={index}
                  live={liveId === row.take.id}
                  onPlay={playRow}
                />
              ) : null,
            )}
          </div>
        )}
        <p className="rail-foot reveal">
          {label("home.rail.footLead")}
          <Link className="rail-link" href="/studio">
            {label("home.rail.footLink")}
          </Link>
          {label("home.rail.footTail")}
        </p>
      </section>

      {/* THE VITRINE — the genre card row: the trained profile rows the
          catalog seam serves from the db (the offline seed answers the
          fifteen untrained genres the engine's own style dictionary
          derives); the untrained card wears the honest empty face */}
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
    </Shell>
  );
}

/**
 * Folds the catalog rows into the shelf rows the grid renders — the
 * vitrine lane first (the published takes a blob pointer carries), the
 * sample lane after (the engine take each row names, planned on demand).
 *
 * @param vitrine the vitrine rows the seam answered.
 * @param tracks the library sample rows the seam answered.
 * @returns the shelf rows, vitrine first.
 */
function shelfRows(vitrine: readonly VitrineTrackRow[], tracks: readonly LibraryTrackRow[]): ShelfRow[] {
  const rows: ShelfRow[] = [];
  for (const row of vitrine) {
    if (row.blobId.length === 0 || row.seconds <= 0) continue;
    const take: ReferenceTake = {
      kind: "reference",
      id: `${row.kind}-${row.id}`,
      name: row.name,
      origin: row.kind === "render" ? "render" : "bench",
      source: { blobId: row.blobId, mime: row.mime, name: row.name, durationSeconds: row.seconds },
    };
    rows.push({ key: `${row.kind}-${row.id}`, name: row.name, genre: row.genre, seconds: row.seconds, take });
  }
  for (const track of tracks) {
    const genre = GENRES.find((entry) => entry.label.toLowerCase() === track.genre.toLowerCase());
    const take: TakePlan = planTake({
      prompt: `${track.genre} ${track.name}`,
      seed: track.name,
      genreId: genre?.id,
    });
    rows.push({
      key: `sample-${track.name}`,
      name: track.name,
      genre: track.genre,
      seconds: take.durationSeconds,
      take,
    });
  }
  return rows;
}

export default HomeSurface;
