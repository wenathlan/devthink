/**
 * musicstudio page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

/** Style: DevThink Terminal Atelier — the music studio page of the super platform.
 * It shares the grammar of the video studio: the katexis engine banner is pulled
 * from the catalog rows, the studio tracks render as a table with a queue button
 * per track, and the engine rides the catalog over https instead of being bundled.
 *
 * C1-04 anti-vibe-code pass: the page breaks the three-equal-panels stack —
 * the katexis engine banner is the dominant object (p-6 sheet, 18px engine
 * title, the owner badge on the 4px chip ladder), the tracks read as an
 * editorial list in the main column (hairline-ruled rows, quiet hover washes,
 * the lead track expanded, tabular numerals on the minute readouts) with a
 * head toolbar that carries the real catalog count, and the automation note is
 * demoted to a narrow support rail. The queue actions stay on the 28px
 * .apps-action ladder with tooltips and aria-labels; the .pagehead hero keeps
 * the contract and carries the .halftone edge, the list carries the .grain
 * film, the page carries the one .atmos light source (C1-01 paints all three).
 * Rows reveal in one staggered entrance and hold still. The engine behavior —
 * the catalog fetch and the gateway queue — is untouched. */
import { Database, Music2, Play, TerminalSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AutomationNote } from "@/shell/automationnote";
import { ShellChrome } from "@/shell/ShellChrome";
import { type NativeApp, nativeApps, type StudioTrack, studioTracks } from "../../catalog";
import { queuestudiorender } from "../../runner";

/** tabular numerals for the minute readouts of the track list. */
const TABULAR = { fontVariantNumeric: "tabular-nums" } as const;

/** The music-studio slice of the C1-04 pass: the dominant banner, the
 * asymmetric body (dominant list + support rail), the specimen rows and the
 * toolbar ladder live with the page; the atmosphere guard keeps the C1-01
 * layers off the pointer path, and the support rail folds under the list
 * when it would starve. */
const MUSIC_CSS = `
.atmos::before, .atmos::after, .grain::before, .grain::after,
.halftone::before, .halftone::after { pointer-events: none; }
.control-page.atmos { position: relative; }
.pagehead.halftone { position: relative; }
.ms-banner { position: relative; display: grid; gap: 10px; padding: 24px; border: 1px solid var(--dt-edge); border-radius: 10px; background: rgb(25 28 35 / 72%); }
.ms-banner__head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.ms-banner__head svg { color: var(--dt-orange); flex-shrink: 0; }
.ms-banner__head h2 { margin: 0; color: var(--dt-text); font: 600 18px/1.3 var(--dt-sans); letter-spacing: -.01em; }
.ms-badge { padding: 2px 8px; color: var(--dt-orange); background: rgb(255 95 0 / 8%); border: 1px solid rgb(255 95 0 / 24%); border-radius: 4px; font: 600 9px var(--dt-mono); letter-spacing: .08em; text-transform: uppercase; }
.ms-banner__lede { margin: 0; max-width: 68ch; color: var(--dt-muted); font: 400 13px/1.7 var(--dt-sans); }
.ms-banner__note { margin: 0; color: var(--dt-faint); font: 500 10px var(--dt-mono); letter-spacing: .06em; }
.ms-body { display: grid; grid-template-columns: minmax(0, 1fr) 264px; gap: 20px; align-items: start; margin-top: 20px; }
.ms-list { position: relative; padding: 18px 16px 10px; border: 1px solid var(--dt-edge); border-radius: 10px; background: rgb(25 28 35 / 72%); }
.ms-list__head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; padding: 0 8px 12px; }
.ms-list__head h2 { display: flex; align-items: center; gap: 8px; margin: 0; color: var(--dt-text); font: 600 15px var(--dt-sans); letter-spacing: -.01em; }
.ms-list__head h2 svg { color: var(--dt-blue); flex-shrink: 0; }
.ms-count { margin: 0; color: var(--dt-faint); font: 500 10px var(--dt-mono); letter-spacing: .08em; font-variant-numeric: tabular-nums; }
.ms-rows { display: grid; margin: 0; padding: 0; list-style: none; }
.ms-row { display: grid; grid-template-columns: minmax(0, 1fr) auto auto; gap: 4px 16px; align-items: center; padding: 11px 8px; border-top: 1px solid var(--dt-edge); border-radius: 6px; transition: background 160ms var(--dt-ease); animation: msRise 240ms cubic-bezier(.22, 1, .36, 1) backwards; }
.ms-row:first-child { border-top: 0; }
.ms-row:hover { background: rgb(255 255 255 / 3%); }
.ms-row__main { display: grid; gap: 1px; min-width: 0; }
.ms-row__main h3 { margin: 0; color: var(--dt-text); font: 600 14px/1.4 var(--dt-sans); letter-spacing: -.01em; }
.ms-row--lead .ms-row__main h3 { font-size: 16px; }
.ms-row__main code { color: var(--dt-faint); font: 500 10px var(--dt-mono); letter-spacing: .06em; }
.ms-row__minutes { color: var(--dt-muted); font: 500 11px var(--dt-mono); font-variant-numeric: tabular-nums; }
.ms-side { display: grid; gap: 12px; align-content: start; }
@keyframes msRise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@media (max-width: 960px) { .ms-body { grid-template-columns: minmax(0, 1fr); } }
@media (prefers-reduced-motion: reduce) { .ms-row { animation: none; transition: none; } }
`;

let musicCssReady = false;

/** Injects the music-studio stylesheet exactly once per document. */
function ensureMusicCss(): void {
  if (musicCssReady || typeof document === "undefined") return;
  musicCssReady = true;
  const tag = document.createElement("style");
  tag.setAttribute("data-dt-musicstudio", "");
  tag.textContent = MUSIC_CSS;
  document.head.appendChild(tag);
}

/** The engine banner of the katexis row: the dominant object of the page —
 * the same shape as the image studio, so both studio pages read as one
 * surface with a different engine behind them. The banner stays empty until
 * the database pairs — never a placeholder engine row. */
function EngineBanner({ app }: { app: NativeApp | undefined }) {
  if (!app)
    return (
      <section className="ms-banner">
        <div className="ms-banner__head">
          <Music2 size={16} aria-hidden="true" />
          <h2>the katexis engine</h2>
        </div>
        <p className="ms-banner__lede">
          The catalog has not answered the katexis engine row yet, so the banner stays empty until the database pairs.
        </p>
      </section>
    );
  return (
    <section className="ms-banner">
      <div className="ms-banner__head">
        <Music2 size={16} aria-hidden="true" />
        <h2>the {app.engine} engine</h2>
        <span className="ms-badge">{app.owner}</span>
      </div>
      <p className="ms-banner__lede">{app.blurb}</p>
      <p className="ms-banner__note">
        The {app.engine} engine rides the catalog over https, so this page never bundles the engine itself.
      </p>
    </section>
  );
}

/** Queues one track render and surfaces the answer with the sonner toast. The
 * queue client speaks in studio assets, so the track is carried as the music
 * asset it is: same id, same title, same engine, and the minutes as duration. */
function queueTrack(track: StudioTrack) {
  const asset = { id: track.id, title: track.title, studio: "music", engine: track.engine, duration: track.minutes };
  void queuestudiorender(asset, `render requested from the music studio for ${track.title}`).then((answer) => {
    if (answer.queued) toast.success(`${track.title} ${answer.reason}`);
    else toast.error(answer.reason);
  });
}

export default function MusicStudio() {
  ensureMusicCss();
  const [apps, setApps] = useState<NativeApp[]>([]);
  const [tracks, setTracks] = useState<StudioTrack[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void nativeApps().then(setApps);
    void studioTracks().then((rows) => {
      setTracks(rows);
      setLoaded(true);
    });
  }, []);

  const engine = apps.find((app) => app.engine === "katexis" && app.owner === "debonair");

  return (
    <main className="control-page atmos">
      <ShellChrome />
      <div className="page-container">
        <header className="pagehead halftone">
          <p className="pagehead__eyebrow">devthink · music</p>
          <h1 className="pagehead__title">Music</h1>
          <p className="pagehead__lede">
            The native music studio on the debonair katexis engine: the tracks come from the catalog and the renders
            queue over the gateway.
          </p>
        </header>

        <EngineBanner app={engine} />

        <div className="ms-body">
          <section className="ms-list grain" aria-labelledby="ms-tracks-title">
            <div className="ms-list__head">
              <h2 id="ms-tracks-title">
                <Database size={15} aria-hidden="true" />
                studio tracks
              </h2>
              {tracks.length ? <p className="ms-count">{tracks.length} tracks in the catalog</p> : null}
            </div>
            {tracks.length ? (
              <ul className="ms-rows">
                {tracks.map((track, index) => (
                  <li
                    key={track.id}
                    className={index === 0 ? "ms-row ms-row--lead" : "ms-row"}
                    style={{ animationDelay: `${index * 40}ms` }}
                  >
                    <div className="ms-row__main">
                      <h3>{track.title}</h3>
                      <code>{track.engine}</code>
                    </div>
                    <span className="ms-row__minutes" style={TABULAR}>
                      {track.minutes}
                    </span>
                    <button
                      type="button"
                      className="apps-action"
                      onClick={() => queueTrack(track)}
                      aria-label={`Queue ${track.title}`}
                      title={`Queue ${track.title} — queues the render over the gateway`}
                    >
                      <Play size={11} aria-hidden="true" />
                      queue
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="control-empty">
                <h2>{loaded ? "no studio tracks yet" : "loading the studio tracks…"}</h2>
                <p>
                  {loaded
                    ? "The catalog has not answered any studio tracks, so the queue stays closed and the table stays empty."
                    : "The catalog request is in flight — the tracks table mounts when it answers."}
                </p>
              </div>
            )}
          </section>

          <aside className="ms-side">
            <AutomationNote />
          </aside>
        </div>

        <footer className="control-page__footer">
          <TerminalSquare size={14} aria-hidden="true" />
          provider credentials stay in <code>~/.config/devthink/auth.json</code>
        </footer>
      </div>
    </main>
  );
}
