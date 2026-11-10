/**
 * LibrarySurface.tsx — the composite winget of the library remount (the
 * detailed engine wave): the shelf the retired page carried, rebuilt as
 * ONE mount so the page anchor stays the thin face the construction law
 * pins on it. The shelf owns the real engine lanes the old face rode:
 *
 * - the composed takes read the session take store (`loadTakeRecords` —
 *   the same store the studio desk and the generate loop write), the demo
 *   plan of the seed riding first (real engine output over a fixed seed,
 *   the same take the studio console opens);
 * - the ingested references read the playerbus reference store
 *   (`loadReferenceRecords` — the wavs the bench and the render walk
 *   landed this session), one grammar with the takes: the row shape
 *   decides the meta line, the play key presses either through the one
 *   shared bus;
 * - the sample bank reads the catalog seam (`listLibraryTracks` — the
 *   site db over HTTPS when configured, the seed rows offline): the
 *   honest empty state when the table answers empty, the honest offline
 *   state with the real retry, never a fabricated row;
 * - the filter runs over names, genres, keys and seeds; the open key
 *   hands a take to the studio through the session note; the drop keys
 *   retire rows from the stores that hold them.
 *
 * The arming beat rides the face prop: while the catalog read loads (the
 * first read of the route) the route answers the construction face it
 * wore. Every word rides the label store; every number is the engine's
 * own (the plan's bpm, key, seed, the clock the arranger answers).
 */

import { PauseRegular, PlayFilled } from "@fluentui/react-icons";
import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { planTake, type TakePlan } from "../../arrangement.ts";
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
} from "../../take.ts";
import { useToast } from "../toast/Toast.tsx";
import { CoverArt } from "./HomeCoverart.tsx";

/** the demo plan the studio also opens (real engine output, fixed seed). */
const DEMO_PROMPT = "midnight studio take, warm sub bass, dusty keys, brass light";
const DEMO_SEED = "debonair-demo";

/** bars per sparkbar (presentation only — no audio leaves a hash walk). */
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

/** the props of the library surface mount. */
type LibrarySurfaceProps = {
  /** the face the route answers while the catalog read arms (the loading
   * beat of the first read — the honest arming state, never a fake row). */
  face: ReactNode;
};

/** the lifecycle of the sample bank read. */
type BankState = "loading" | "ready" | "offline";

/**
 * LibrarySurface — the shelf over the real take, reference and catalog
 * lanes.
 *
 * @param props the arming face of the route.
 * @returns the shelf element, or the arming face while the seam answers.
 */
export function LibrarySurface({ face }: LibrarySurfaceProps) {
  const toast = useToast();
  const [, navigate] = useLocation();
  const [records, setRecords] = useState<readonly TakeRecord[]>([]);
  const [references, setReferences] = useState<readonly ReferenceRecord[]>([]);
  const [bank, setBank] = useState<BankState>("loading");
  const [samples, setSamples] = useState<readonly LibraryTrackRow[]>([]);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<PlayerSnapshot | null>(null);

  /** loads the sample bank off the catalog seam; any failure lands in the
   * honest offline state with the real retry. */
  const loadBank = useCallback((live: () => boolean): void => {
    setBank("loading");
    listLibraryTracks()
      .then((rows) => {
        if (!live()) return;
        setSamples(rows);
        setBank("ready");
      })
      .catch(() => {
        if (live()) setBank("offline");
      });
  }, []);

  // the shelf opens with what this session already holds: the takes the
  // composer landed (the demo plan of the seed riding first, present every
  // visit, never re-pinned after a drop — it lives in the page state, not
  // the store) and the references the bench stored this session
  useEffect(() => {
    let live = true;
    const store = sessionStorageOrMemory();
    const demo = planTake({ prompt: DEMO_PROMPT, seed: DEMO_SEED });
    setRecords([
      { plan: demo, savedAt: "1970-01-01T00:00:00.000Z" },
      ...loadTakeRecords(store).filter((record) => record.plan.id !== demo.id),
    ]);
    setReferences(loadReferenceRecords(store));
    loadBank(() => live);
    return () => {
      live = false;
    };
  }, [loadBank]);

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

  // the arming beat: the catalog seam holds the first read — the route
  // answers the face it wore until the sample bank answers (or its own
  // honest offline state lands), never a fabricated shelf
  if (bank === "loading") return <>{face}</>;

  return (
    <>
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
          the same button pressing the same shared bus */}
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

      {/* the sample bank — the site's own shelf content over the catalog
          seam (the db rows over HTTPS when configured, the seed rows
          offline); the honest empty and offline states, never a fake row */}
      <section className="lib-list reveal" aria-label={label("library.samples.aria")}>
        <p className="lib-shelfhead">{label("library.samples.head")}</p>
        {bank === "offline" && (
          <div className="glass card">
            <p className="flush p-sm">
              {label("library.samples.offlineTitle")} — {label("library.samples.offlineLine")}
            </p>
            <div className="btn-row">
              <button className="btn small" type="button" onClick={() => loadBank(() => true)}>
                {label("library.samples.retry")}
              </button>
            </div>
          </div>
        )}
        {bank === "ready" &&
          sampleRows.map((row) => (
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
        {bank === "ready" && sampleRows.length === 0 && <p className="lib-empty">{label("library.samples.empty")}</p>}
      </section>

      <section className="glass card reveal mt-18" style={{ maxWidth: 660 }}>
        <h2 className="card-h">{label("library.formats.title")}</h2>
        <p className="flush">
          {label("library.formats.lead")}
          <code>studio</code>
          {label("library.formats.tail")}
        </p>
      </section>
    </>
  );
}

export default LibrarySurface;
