/**
 * library page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// # Library — sub-anchor of the library page: the renders of the data layer
// with a live text filter, plus the formats note. The campaign v3 read: the
// table retired for editorial list rows — index, the deterministic cover plate
// (the same CoverArt the landing rail draws), display-face name, mono
// metadata, a deterministic waveform sparkbar per take and the status chip.
import { useEffect, useState } from "react";
import { listLibraryTracks } from "../../catalog.ts";
import type { LibraryTrackRow } from "../../katexis.ts";
import { filterTracks, statusTone, toneClass } from "../../katexis.ts";
import { CoverArt } from "../home/coverart.tsx";
import { type NavLink, Shell } from "../shell/Shell.tsx";

const FOOTER_LINKS: readonly NavLink[] = [
  { label: "Studio", href: "/studio" },
  { label: "Generate", href: "/generate" },
  { label: "Settings", href: "/settings" },
];

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
  const [tracks, setTracks] = useState<readonly LibraryTrackRow[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let live = true;
    listLibraryTracks().then((rows) => {
      if (live) setTracks(rows);
    });
    return () => {
      live = false;
    };
  }, []);

  const visible = filterTracks(tracks, query);

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
      <p className="reveal lede" style={{ maxWidth: 620 }}>
        Every take lands here with its genre, duration and render status. The list is plain HTML — filter as you type,
        nothing phones home.
      </p>

      <div className="field reveal" style={{ maxWidth: 380 }}>
        <label htmlFor="lib-search">Search</label>
        <input
          id="lib-search"
          className="input"
          type="search"
          placeholder="Filter by name, genre or status…"
          autoComplete="off"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {/* editorial list rows: index, name, wave, status — no card grid */}
      <section className="lib-list reveal" aria-label="Tracks">
        {visible.map((track, index) => (
          <article key={track.name} className="lib-row" data-status={track.status}>
            <span className="lib-index" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="lib-cover" aria-hidden="true">
              <CoverArt name={track.name} />
            </span>
            <div className="lib-main">
              <h2 className="lib-name">{track.name}</h2>
              <p className="lib-meta">
                {track.genre} · {track.duration}
              </p>
            </div>
            <svg
              className="sparkbar"
              viewBox="0 0 104 40"
              preserveAspectRatio="none"
              aria-hidden="true"
              focusable="false"
            >
              <path d={sparkPath(track.name, SPARK_BARS)} />
            </svg>
            <span className={`badge lib-status${toneClass(statusTone(track.status))}`}>
              {track.status === "rendering" ? (
                <>
                  <span className="dot" />
                  {track.status}
                </>
              ) : (
                track.status
              )}
            </span>
          </article>
        ))}
        {visible.length === 0 && (
          <p className="lib-empty">
            {query.trim()
              ? `No tracks match “${query.trim()}” — try a genre or a status.`
              : "The shelf is empty — queue a render first."}
          </p>
        )}
      </section>

      <section className="glass card reveal mt-18" style={{ maxWidth: 640 }}>
        <h2 className="card-h">Formats</h2>
        <p className="flush">
          Ready tracks keep their master at 48 kHz WAV with −1 dBTP true peak. MIDI and stems export per take once the{" "}
          <code>katexis</code> engine is wired to this site (F-DBN-013, F-DBN-040).
        </p>
      </section>
    </Shell>
  );
}
