/**
 * library page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// # Library — the real shelf (campaign 5-b): every take this session composed
// lands here with the engine's own numbers — genre, bpm, key, duration, seed
// and the deterministic cover plate — plus the site's sample rows under their
// honest label. The playback proof rides the same grammar: the ingested
// references sit beside the generated takes, the row shape decides by kind,
// and the play key presses either through the one shared bus. A take row
// hands its plan to the studio (session note) or leaves the shelf; a
// reference row plays its blob or leaves the shelf. The filter runs over
// names, genres, keys and seeds.
import { PauseRegular, PlayFilled } from "@fluentui/react-icons";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { planTake, type TakePlan } from "../../arranger.ts";
import { listLibraryTracks } from "../../catalog.ts";
import { formatClock } from "../../dawview.ts";
import type { LibraryTrackRow } from "../../katexis.ts";
import { label, labelfill } from "../../labels.ts";
import {
  type BusTake,
  busFeature,
  busPause,
  busPlay,
  busSubscribe,
  loadReferenceRecords,
  type PlayerSnapshot,
  type ReferenceRecord,
  removeReferenceTake,
} from "../../playerbus.ts";
import {
  loadTakeRecords,
  removeTakePlan,
  sessionStorageOrMemory,
  TAKE_SELECT_KEY,
  type TakeRecord,
} from "../../takestore.ts";
import { type NavLink, Shell } from "../shell/Shell.tsx";
import { useToast } from "../toast/Toast.tsx";
import { CoverArt } from "../wingets";

/** the demo plan the studio also opens (real engine output, fixed seed) */
const DEMO_PROMPT = "midnight studio take, warm sub bass, dusty keys, brass light";
const DEMO_SEED = "debonair-demo";

/** bars per sparkbar (presentation only — no audio leaves a hash walk) */
const SPARK_BARS = 26;

/**
 * Builds the `d` of one deterministic sparkbar path — a small integer hash
 * walked over the track name draws the same wave on every render, as one
 * path (no list, no keys, no randomness).
 *
 * @param seedText the track name.
 * @param count how many bars (viewBox cell = 4 units wide, 40 tall).
 * @returns the path data of the whole waveform.
 */
function sparkPath(seedText: string, count: number): string {
  let hash = 7;
  for (let index = 0; index < seedText.length; index += 1) {
    hash = (hash * 31 + seedText.charCodeAt(index)) % 100003;
  }
  let path = "";
  for (let index = 0; index < count; index += 1) {
    hash = (hash * 137 + 71) % 100003;
    const height = ((24 + (hash % 76)) / 100) * 40;
    const left = index * 4;
    path += `M${left + 0.75} 40 V${(40 - height).toFixed(2)} H${left + 3.25} V40 Z`;
  }
  return path;
}

export default function Library() {
  // the footer links read the label store at render time (the manifest
  // answers english, the store answers the translated rows the seed protected)
  const FOOTER_LINKS: readonly NavLink[] = [
    { label: label("nav.studio"), href: "/studio" },
    { label: label("nav.generate"), href: "/generate" },
    { label: label("nav.settings"), href: "/settings" },
  ];

  const toast = useToast();
  const [, navigate] = useLocation();
  const [records, setRecords] = useState<readonly TakeRecord[]>([]);
  const [references, setReferences] = useState<readonly ReferenceRecord[]>([]);
  const [samples, setSamples] = useState<readonly LibraryTrackRow[]>([]);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<PlayerSnapshot | null>(null);

  // the shelf: the session takes plus the demo plan (present every visit,
  // never re-pinned after a drop — it lives in the page state, not the store)
  // and the ingested references the bench stored this session
  useEffect(() => {
    const store = sessionStorageOrMemory();
    const demo = planTake({ prompt: DEMO_PROMPT, seed: DEMO_SEED });
    setRecords([
      { plan: demo, savedAt: "1970-01-01T00:00:00.000Z" },
      ...loadTakeRecords(store).filter((record) => record.plan.id !== demo.id),
    ]);
    setReferences(loadReferenceRecords(store));
    let live = true;
    listLibraryTracks().then((rows) => {
      if (live) setSamples(rows);
    });
    return () => {
      live = false;
    };
  }, []);

  // the shared bus answers the live transport state: the play keys wear the
  // sounding take on every row kind — the same snapshot the shell bar renders
  useEffect(() => busSubscribe(setView), []);
  const soundingId = view?.playing ? (view.takes[view.index]?.id ?? "") : "";

  const needle = query.trim().toLowerCase();

  const takes = useMemo(
    () =>
      records.filter(({ plan }) =>
        needle ? `${plan.name} ${plan.genreLabel} ${plan.keyLabel} ${plan.seed}`.toLowerCase().includes(needle) : true,
      ),
    [records, needle],
  );

  const sampleRows = useMemo(
    () =>
      samples.filter((row) =>
        needle ? `${row.name} ${row.genre} ${row.status}`.toLowerCase().includes(needle) : true,
      ),
    [samples, needle],
  );

  const referenceRows = useMemo(
    () =>
      references.filter(({ take }) =>
        needle ? `${take.name} reference ${take.source.mime}`.toLowerCase().includes(needle) : true,
      ),
    [references, needle],
  );

  /** presses any shelf take through the shared bus — the row shape decides
   * by kind, the play key is the same button (the studio bar carries it) */
  const playTake = (take: BusTake): void => {
    if (soundingId === take.id) busPause();
    else {
      busFeature(take);
      busPlay(0);
    }
  };

  /** hands a take to the studio through the session note */
  const openInStudio = (plan: TakePlan): void => {
    try {
      sessionStorageOrMemory().setItem(TAKE_SELECT_KEY, plan.id);
    } catch {
      /* the studio simply opens on its default take */
    }
    navigate("/studio");
  };

  /** drops a take from the session shelf */
  const drop = (plan: TakePlan): void => {
    setRecords(removeTakePlan(plan.id, sessionStorageOrMemory()));
    toast.show(labelfill("library.toast.dropped", { name: plan.name }), "info");
  };

  /** drops a reference from the session shelf */
  const dropReference = (id: string): void => {
    const gone = references.find((record) => record.take.id === id);
    setReferences(removeReferenceTake(id, sessionStorageOrMemory()));
    if (gone) toast.show(labelfill("library.toast.dropped", { name: gone.take.name }), "info");
  };

  return (
    <Shell
      name="debonair"
      contained
      cta={{ label: label("library.cta"), href: "/generate" }}
      footerLinks={FOOTER_LINKS}
      domain="devthink.pro"
    >
      <p className="eyebrow reveal">{label("library.eyebrow")}</p>
      <h1 className="reveal page-title">{label("library.title")}</h1>
      <p className="reveal lede" style={{ maxWidth: 640 }}>
        {label("library.lede")}
      </p>

      <div className="field reveal" style={{ maxWidth: 380 }}>
        <label htmlFor="lib-search">{label("library.search.label")}</label>
        <input
          id="lib-search"
          className="input"
          type="search"
          placeholder={label("library.search.placeholder")}
          autoComplete="off"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {/* the composed takes — the real shelf */}
      <section className="lib-list reveal" aria-label={label("library.takes.aria")}>
        <p className="lib-shelfhead">{labelfill("library.takes.head", { count: String(takes.length) })}</p>
        {takes.map(({ plan }, index) => (
          <article key={plan.id} className="lib-row" data-status="ready">
            <span className="lib-index" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="lib-cover" aria-hidden="true">
              <CoverArt name={plan.name} />
            </span>
            <div className="lib-main">
              <h2 className="lib-name">{plan.name}</h2>
              <p className="lib-meta">
                {labelfill("library.row.meta", {
                  genre: plan.genreLabel,
                  bpm: String(plan.bpm),
                  key: plan.keyLabel,
                  clock: formatClock(plan.durationSeconds),
                  seed: plan.seed,
                })}
              </p>
            </div>
            <svg
              className="sparkbar"
              viewBox="0 0 104 40"
              preserveAspectRatio="none"
              aria-hidden="true"
              focusable="false"
            >
              <path d={sparkPath(plan.name, SPARK_BARS)} />
            </svg>
            <span className="lib-actions">
              <button
                className={`lib-play${soundingId === plan.id ? " is-live" : ""}`}
                type="button"
                aria-pressed={soundingId === plan.id}
                aria-label={labelfill(soundingId === plan.id ? "library.row.pauseAria" : "library.row.playAria", {
                  name: plan.name,
                })}
                title={labelfill(soundingId === plan.id ? "library.row.pauseAria" : "library.row.playAria", {
                  name: plan.name,
                })}
                onClick={() => playTake(plan)}
              >
                {soundingId === plan.id ? (
                  <PauseRegular fontSize={14} aria-hidden="true" />
                ) : (
                  <PlayFilled fontSize={14} aria-hidden="true" />
                )}
              </button>
              <button className="btn small secondary" type="button" onClick={() => openInStudio(plan)}>
                {label("library.row.open")}
              </button>
              <button className="btn small danger-ghost" type="button" onClick={() => drop(plan)}>
                {label("library.row.drop")}
              </button>
            </span>
          </article>
        ))}
        {takes.length === 0 && (
          <p className="lib-empty">
            {needle.trim() ? labelfill("library.empty.match", { needle: needle.trim() }) : label("library.empty.shelf")}
          </p>
        )}
      </section>

      {/* the ingested references and the rendered takes — the audio shelf,
          one grammar: the row shape decides the meta line, the play key is
          the same button pressing the same shared bus (the rendered wavs
          ride the blob lane the references ride, the origin field says
          which lane the row came from) */}
      <section className="lib-list reveal" aria-label={label("library.references.aria")}>
        <p className="lib-shelfhead">{labelfill("library.references.head", { count: String(referenceRows.length) })}</p>
        {referenceRows.map(({ take }) => (
          <article key={take.id} className="lib-row" data-status="ready">
            <span className="lib-index" aria-hidden="true">
              {take.origin === "render" ? "gen" : "ref"}
            </span>
            <span className="lib-cover" aria-hidden="true">
              <CoverArt name={take.name} />
            </span>
            <div className="lib-main">
              <h2 className="lib-name">{take.name}</h2>
              <p className="lib-meta">
                {labelfill(take.origin === "render" ? "library.row.renderMeta" : "library.row.referenceMeta", {
                  clock: formatClock(take.source.durationSeconds),
                  mime: take.source.mime.replace("audio/", ""),
                })}
              </p>
            </div>
            <svg
              className="sparkbar"
              viewBox="0 0 104 40"
              preserveAspectRatio="none"
              aria-hidden="true"
              focusable="false"
            >
              <path d={sparkPath(take.name, SPARK_BARS)} />
            </svg>
            <span className="lib-actions">
              <button
                className={`lib-play${soundingId === take.id ? " is-live" : ""}`}
                type="button"
                aria-pressed={soundingId === take.id}
                aria-label={labelfill(soundingId === take.id ? "library.row.pauseAria" : "library.row.playAria", {
                  name: take.name,
                })}
                title={labelfill(soundingId === take.id ? "library.row.pauseAria" : "library.row.playAria", {
                  name: take.name,
                })}
                onClick={() => playTake(take)}
              >
                {soundingId === take.id ? (
                  <PauseRegular fontSize={14} aria-hidden="true" />
                ) : (
                  <PlayFilled fontSize={14} aria-hidden="true" />
                )}
              </button>
              <button className="btn small danger-ghost" type="button" onClick={() => dropReference(take.id)}>
                {label("library.row.drop")}
              </button>
            </span>
          </article>
        ))}
        {referenceRows.length === 0 && <p className="lib-empty">{label("library.references.empty")}</p>}
      </section>

      {/* the site's sample rows — honest static content, not engine takes */}
      {sampleRows.length > 0 ? (
        <section className="lib-list reveal" aria-label={label("library.samples.aria")}>
          <p className="lib-shelfhead">{label("library.samples.head")}</p>
          {sampleRows.map((row) => (
            <article key={row.name} className="lib-row" data-status={row.status}>
              <span className="lib-index" aria-hidden="true">
                note
              </span>
              <span className="lib-cover" aria-hidden="true">
                <CoverArt name={row.name} />
              </span>
              <div className="lib-main">
                <h2 className="lib-name">{row.name}</h2>
                <p className="lib-meta">
                  {row.genre} · {row.duration}
                </p>
              </div>
              <svg
                className="sparkbar"
                viewBox="0 0 104 40"
                preserveAspectRatio="none"
                aria-hidden="true"
                focusable="false"
              >
                <path d={sparkPath(row.name, SPARK_BARS)} />
              </svg>
              <span className="badge lib-status">{row.status}</span>
            </article>
          ))}
        </section>
      ) : null}

      <section className="glass card reveal mt-18" style={{ maxWidth: 660 }}>
        <h2 className="card-h">{label("library.formats.title")}</h2>
        <p className="flush">
          {label("library.formats.lead")}
          <code>studio</code>
          {label("library.formats.tail")}
        </p>
      </section>
    </Shell>
  );
}
