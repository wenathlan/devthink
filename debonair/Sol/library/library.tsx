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
// honest label. A row hands its take to the studio (session note) or leaves
// the shelf. The filter runs over names, genres, keys and seeds.
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { planTake, type TakePlan } from "../../arranger.ts";
import { listLibraryTracks } from "../../catalog.ts";
import { formatClock } from "../../dawview.ts";
import type { LibraryTrackRow } from "../../katexis.ts";
import {
  loadTakeRecords,
  removeTakePlan,
  sessionStorageOrMemory,
  TAKE_SELECT_KEY,
  type TakeRecord,
} from "../../takestore.ts";
import { CoverArt } from "../widgets/home.coverart.tsx";
import { type NavLink, Shell } from "../shell/Shell.tsx";
import { useToast } from "../toast/Toast.tsx";

const FOOTER_LINKS: readonly NavLink[] = [
  { label: "Studio", href: "/studio" },
  { label: "Generate", href: "/generate" },
  { label: "Settings", href: "/settings" },
];

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
  const toast = useToast();
  const [, navigate] = useLocation();
  const [records, setRecords] = useState<readonly TakeRecord[]>([]);
  const [samples, setSamples] = useState<readonly LibraryTrackRow[]>([]);
  const [query, setQuery] = useState("");

  // the shelf: the session takes plus the demo plan (present every visit,
  // never re-pinned after a drop — it lives in the page state, not the store)
  useEffect(() => {
    const store = sessionStorageOrMemory();
    const demo = planTake({ prompt: DEMO_PROMPT, seed: DEMO_SEED });
    setRecords([
      { plan: demo, savedAt: "1970-01-01T00:00:00.000Z" },
      ...loadTakeRecords(store).filter((record) => record.plan.id !== demo.id),
    ]);
    let live = true;
    listLibraryTracks().then((rows) => {
      if (live) setSamples(rows);
    });
    return () => {
      live = false;
    };
  }, []);

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
    toast.show(`${plan.name} left the shelf`, "info");
  };

  return (
    <Shell
      name="debonair"
      contained
      cta={{ label: "Generate a track", href: "/generate" }}
      footerLinks={FOOTER_LINKS}
      domain="devthink.pro"
    >
      <p className="eyebrow reveal">debonair · library</p>
      <h1 className="reveal page-title">Library</h1>
      <p className="reveal lede" style={{ maxWidth: 640 }}>
        Every take this session composed, with the engine's own numbers — genre, bpm, key, duration and seed. Open one
        in the studio, or drop it from the shelf. Nothing uploads, nothing leaves the tab.
      </p>

      <div className="field reveal" style={{ maxWidth: 380 }}>
        <label htmlFor="lib-search">Search</label>
        <input
          id="lib-search"
          className="input"
          type="search"
          placeholder="Filter by name, genre, key or seed…"
          autoComplete="off"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {/* the composed takes — the real shelf */}
      <section className="lib-list reveal" aria-label="Composed takes">
        <p className="lib-shelfhead">composed this session — {takes.length}</p>
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
                {plan.genreLabel} · {plan.bpm} bpm · {plan.keyLabel} · {formatClock(plan.durationSeconds)} · seed{" "}
                {plan.seed}
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
              <button className="btn small secondary" type="button" onClick={() => openInStudio(plan)}>
                Studio
              </button>
              <button className="btn small danger-ghost" type="button" onClick={() => drop(plan)}>
                Drop
              </button>
            </span>
          </article>
        ))}
        {takes.length === 0 && (
          <p className="lib-empty">
            {needle.trim()
              ? `No takes match “${needle.trim()}”.`
              : "The shelf is empty — compose a take in the composer."}
          </p>
        )}
      </section>

      {/* the site's sample rows — honest static content, not engine takes */}
      {sampleRows.length > 0 ? (
        <section className="lib-list reveal" aria-label="Sample rows">
          <p className="lib-shelfhead">site samples — served content rows</p>
          {sampleRows.map((row) => (
            <article key={row.name} className="lib-row" data-status={row.status}>
              <span className="lib-index" aria-hidden="true">
                ♪
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
        <h2 className="card-h">Formats</h2>
        <p className="flush">
          Takes carry the engine mastering spec — {`48`} kHz WAV with −1 dBTP true peak and per-platform loudness
          targets (Spotify −14 / Apple −16 / Beatport −9 LUFS). Stems and MIDI bounce per take ride the export wave of
          the <code>katexis</code> roadmap; the arrangement itself is already open in the studio.
        </p>
      </section>
    </Shell>
  );
}
