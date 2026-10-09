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
 * the catalog fetch and the gateway queue — is untouched.
 *
 * R2-b creative studio: the katexis banner becomes the hero object — the
 * engine .shader-stage with ONE .shader-fallback bloom, the .halftone-edge
 * dissolve, the grain film, the one ambient .breathe and the transform-only
 * equalizer motif (1.2s, the studio pulse). The head joins the staged
 * editorial grammar (mono eyebrow → Bricolage display line → one phrase,
 * one .enter entrance). The body reads canvas-dominant 1.6fr/1fr: the track
 * ledger dominant (hairline rows, display-700 minute numerals and the
 * machined duration meters on the mono-axis ruler), the transport notes on
 * the sticky rail. Rows rise 240ms at 60ms steps, reduced-motion guarded.
 * The engine behavior — the catalog fetch and the gateway queue — is
 * untouched. */
import { Database, Music2, Play, TerminalSquare } from "lucide-react";
import { type CSSProperties, useEffect, useState } from "react";
import { toast } from "sonner";
import { AutomationNote } from "@/shell/automationnote";
import { ShellChrome } from "@/shell/ShellChrome";
import { type NativeApp, nativeApps, type StudioTrack, studioTracks } from "../../catalog";
import { queuestudiorender } from "../../runner";

/** the entrance stagger of the page: one orchestrated rise through the
 * engine .enter kit, the delay reading the --i custom prop (70ms steps). */
const step = (i: number) => ({ "--i": i }) as CSSProperties;

/** secondsOf — the track's real length from its catalog minutes readout,
 * the honest ratio behind the machined meter; unparseable minutes answer
 * null and the row skips the meter. */
function secondsOf(minutes: string): number | null {
  const value = Number.parseFloat(minutes);
  return Number.isFinite(value) && value > 0 ? value * 60 : null;
}

/** The music-studio slice of the R2-b pass: the hero object, the asymmetric
 * body, the specimen rows and the machined meters live with the page; the
 * atmosphere guard keeps the C1 and engine layers off the pointer path, and
 * the support rail folds under the ledger when it would starve. */
const MUSIC_CSS = `
.atmos::before, .atmos::after, .grain::before, .grain::after,
.halftone::before, .halftone::after { pointer-events: none; }
.control-page.atmos { position: relative; }
.ms-hero { position: relative; display: grid; gap: 10px; padding: clamp(22px, 3vw, 30px); border: 1px solid var(--dtv3-hairline); border-radius: var(--dtv3-r-3); background: rgb(255 255 255 / 2%); }
.ms-hero__head { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.ms-hero__head h2 { display: flex; align-items: center; gap: 10px; margin: 0; color: var(--dtv3-ink-1); font: 700 clamp(20px, 2.4vw, 26px)/1.2 var(--dt-sans); letter-spacing: -.02em; }
.ms-hero__head h2 svg { color: var(--dtv3-sig); flex-shrink: 0; }
.ms-badge { padding: 3px 10px; color: var(--dtv3-sig); background: color-mix(in srgb, var(--dtv3-sig) 10%, transparent); border: 1px solid color-mix(in srgb, var(--dtv3-sig) 30%, transparent); border-radius: 999px; font: 600 9px var(--dt-mono); letter-spacing: .08em; text-transform: lowercase; }
.ms-hero__lede { margin: 0; max-width: 62ch; color: var(--dtv3-ink-2); font: 400 13px/1.7 var(--dt-sans); }
.ms-hero__note { margin: 0; color: var(--dtv3-ink-3); font: 500 10px var(--dt-mono); letter-spacing: .06em; }
.ms-body { display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(250px, 1fr); gap: 32px; align-items: start; margin-top: 30px; }
.ms-list { display: grid; min-width: 0; }
.ms-list__head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; padding: 0 12px 12px 2px; border-bottom: 1px solid var(--dt-edge-strong); }
.ms-list__head h2 { display: flex; align-items: center; gap: 8px; margin: 0; color: var(--dtv3-ink-1); font: 600 11px var(--dt-mono); letter-spacing: .08em; text-transform: lowercase; }
.ms-list__head h2 svg { color: var(--dtv3-sig); flex-shrink: 0; }
.ms-count { margin: 0; color: var(--dtv3-ink-3); font: 500 10px var(--dt-mono); letter-spacing: .08em; font-variant-numeric: tabular-nums; }
.ms-rows { display: grid; margin: 0; padding: 0; list-style: none; }
.ms-row { display: grid; grid-template-columns: minmax(0, 1fr) minmax(150px, 220px) auto; gap: 6px 18px; align-items: center; padding: 15px 12px; border-bottom: 1px solid var(--dtv3-hairline); border-radius: 10px; transition: background 160ms var(--dtv3-ease); animation: msRise 240ms var(--dtv3-ease) backwards; animation-delay: calc(var(--i, 0) * 60ms); }
.ms-row:hover { background: rgb(255 255 255 / 3%); }
.ms-row--lead { background: rgb(255 255 255 / 3%); box-shadow: 0 14px 36px rgb(0 0 0 / 26%), inset 0 1px 0 rgb(255 255 255 / 5%); }
.ms-row--lead:hover { background: rgb(255 255 255 / 4%); }
.ms-row__main { display: grid; gap: 2px; min-width: 0; }
.ms-row__main h3 { margin: 0; color: var(--dtv3-ink-1); font: 600 15px/1.35 var(--dt-sans); letter-spacing: -.01em; }
.ms-row--lead .ms-row__main h3 { font-size: 17px; }
.ms-row__main code { color: var(--dtv3-ink-3); font: 500 10px var(--dt-mono); letter-spacing: .06em; }
.ms-metercell { display: grid; gap: 7px; }
.ms-row__minutes { color: var(--dtv3-ink-1); font: 700 12px/1.2 var(--dt-sans); font-variant-numeric: tabular-nums; letter-spacing: -.01em; text-align: right; }
.ms-side { position: sticky; top: 88px; display: grid; gap: 16px; align-content: start; min-width: 0; }
.ms-side .control-note { display: grid; gap: 8px; padding: 16px; background: rgb(255 255 255 / 3%); border: 1px solid var(--dtv3-hairline); border-radius: var(--dtv3-r-2); color: var(--dtv3-ink-2); font: 400 12px/1.7 var(--dt-sans); }
.ms-side .control-note h2 { display: flex; align-items: center; gap: 8px; margin: 0; color: var(--dtv3-ink-1); font: 600 13px var(--dt-sans); letter-spacing: -.01em; }
.ms-side .control-note p { margin: 0; }
@keyframes msRise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
@media (max-width: 960px) { .ms-body { grid-template-columns: minmax(0, 1fr); } .ms-side { position: static; } }
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

/** the equalizer motif of the studio: five transform-only bars (the
 * .r2b-eq keyframes in the theme layer), the pulse of the katexis engine —
 * decorative, aria-hidden. */
function EqPulse() {
  return (
    <span className="r2b-eq" aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}

/** The engine banner of the katexis row: the hero object of the page — the
 * engine shader stage with the one bloom, the halftone dissolve, the grain,
 * the ONE ambient .breathe and the eq pulse. The banner stays empty until
 * the database pairs — never a placeholder engine row. */
function EngineBanner({ app }: { app: NativeApp | undefined }) {
  if (!app)
    return (
      <section className="ms-hero shader-stage halftone-edge breathe">
        <div className="shader-fallback" aria-hidden="true" />
        <div className="grain-overlay" aria-hidden="true" />
        <div className="ms-hero__head">
          <EqPulse />
          <h2>
            <Music2 size={18} aria-hidden="true" />
            the katexis engine
          </h2>
        </div>
        <p className="ms-hero__lede">
          The catalog has not answered the katexis engine row yet, so the banner stays empty until the database pairs.
        </p>
      </section>
    );
  return (
    <section className="ms-hero shader-stage halftone-edge breathe">
      <div className="shader-fallback" aria-hidden="true" />
      <div className="grain-overlay" aria-hidden="true" />
      <div className="ms-hero__head">
        <EqPulse />
        <h2>
          <Music2 size={18} aria-hidden="true" />
          the {app.engine} engine
        </h2>
        <span className="ms-badge">{app.owner}</span>
      </div>
      <p className="ms-hero__lede">{app.blurb}</p>
      <p className="ms-hero__note">
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

  /** the machined meter scale: the longest real length in the catalog. */
  const maxsec = Math.max(...tracks.map((track) => secondsOf(track.minutes) ?? 0), 1);

  return (
    <main className="control-page atmos">
      <ShellChrome />
      <div className="page-container">
        <header className="pagehead r2b-head shader-stage halftone-edge enter" style={step(0)}>
          <div className="shader-fallback" aria-hidden="true" />
          <div className="grain-overlay" aria-hidden="true" />
          <p className="pagehead__eyebrow r2a-eyebrow">devthink · music</p>
          <h1 className="pagehead__title r2a-display">The music studio</h1>
          <p className="pagehead__lede r2a-lede">
            Tracks from the catalog — renders queue over the gateway to the katexis engine.
          </p>
        </header>

        <EngineBanner app={engine} />

        <div className="ms-body">
          <section className="ms-list" aria-labelledby="ms-tracks-title">
            <div className="ms-list__head">
              <h2 id="ms-tracks-title">
                <Database size={15} aria-hidden="true" />
                studio tracks
              </h2>
              {tracks.length ? <p className="ms-count">{tracks.length} tracks in the catalog</p> : null}
            </div>
            {tracks.length ? (
              <ul className="ms-rows">
                {tracks.map((track, index) => {
                  const sec = secondsOf(track.minutes);
                  const meterPct = sec === null ? null : (sec / maxsec) * 100;
                  return (
                    <li key={track.id} className={index === 0 ? "ms-row ms-row--lead" : "ms-row"} style={step(index)}>
                      <div className="ms-row__main">
                        <h3>{track.title}</h3>
                        <code>{track.engine}</code>
                      </div>
                      <span className="ms-metercell">
                        {meterPct !== null ? (
                          <span
                            className="r2b-meter"
                            aria-hidden="true"
                            style={{ "--r2b-meter-pos": `${meterPct}%` } as CSSProperties}
                          >
                            <i />
                          </span>
                        ) : null}
                        <span className="ms-row__minutes">{track.minutes} min</span>
                      </span>
                      <button
                        type="button"
                        className="apps-action press"
                        onClick={() => queueTrack(track)}
                        aria-label={`Queue ${track.title}`}
                        title={`Queue ${track.title} — queues the render over the gateway`}
                      >
                        <Play size={11} aria-hidden="true" />
                        queue
                      </button>
                    </li>
                  );
                })}
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
            <section className="control-note">
              <h2>render transport</h2>
              <p>
                The queue action rides the gateway to the {engine ? engine.engine : "katexis"} engine; the catalog
                answers the track list and the queue answers with a receipt.
              </p>
            </section>
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
