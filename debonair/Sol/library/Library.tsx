// # Library — sub-anchor of the library page: the renders table from the data layer
// with a live text filter, plus the formats note.
import { useEffect, useState } from "react";
import { Shell, type NavLink } from "../Shell";
import { listLibraryTracks } from "../../catalog.ts";
import { filterTracks, statusTone, toneClass } from "../../katexis.ts";
import type { LibraryTrackRow } from "../../katexis.ts";

const FOOTER_LINKS: readonly NavLink[] = [
  { label: "Studio", href: "/studio" },
  { label: "Generate", href: "/generate" },
  { label: "Settings", href: "/settings" },
];

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
      <p className="eyebrow reveal">library · your renders</p>
      <h1 className="reveal page-title">Library</h1>
      <p className="reveal lede" style={{ maxWidth: 620 }}>
        Every take lands here with its genre, duration and render status. The table is plain HTML — filter as you type, nothing phones home.
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

      <section className="glass card reveal" style={{ marginTop: 16, padding: 10 }}>
        <div className="scroll-x">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Track</th>
                <th scope="col">Genre</th>
                <th scope="col">Duration</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((track) => (
                <tr key={track.name}>
                  <td>{track.name}</td>
                  <td>{track.genre}</td>
                  <td>{track.duration}</td>
                  <td>
                    <span className={`badge${toneClass(statusTone(track.status))}`}>
                      {track.status === "rendering" ? (
                        <>
                          <span className="dot" />
                          {track.status}
                        </>
                      ) : (
                        track.status
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p hidden={visible.length !== 0} style={{ margin: "8px 6px 6px", color: "var(--sol-muted)" }}>
          {query.trim() ? `No tracks match “${query.trim()}” — try a genre or a status.` : ""}
        </p>
      </section>

      <section className="glass card reveal mt-18" style={{ maxWidth: 640 }}>
        <h2 className="card-h">Formats</h2>
        <p className="flush">
          Ready tracks keep their master at 48 kHz WAV with −1 dBTP true peak. MIDI and stems export per take once the <code>katexis</code> engine is wired to this site (F-DBN-013, F-DBN-040).
        </p>
      </section>
    </Shell>
  );
}
