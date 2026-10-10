/**
 * image page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

/** Style: DevThink Terminal Atelier — the image studio page of the super
 * platform. It shares the grammar of the video and music studios: the matiz
 * engine banner is pulled from the catalog rows, the image assets render as
 * a table with a queue button per still, and the engine itself is never
 * bundled — it rides the catalog over https from the cadria app.
 *
 * C1-04 anti-vibe-code pass: the page breaks the three-equal-panels stack —
 * the engine banner is the dominant object (p-6, own component), the stills
 * read as an editorial list in the main column (hairline-ruled rows, quiet
 * hover washes, the lead still expanded, tabular numerals on sizes) with a
 * head toolbar that carries the real catalog count, and the automation note
 * is demoted to a narrow support rail. The render actions stay on the 28px
 * .apps-action ladder with tooltips and aria-labels; the .pagehead hero
 * keeps the contract and carries the .halftone edge, the list carries the
 * .grain film, the page carries the one .atmos light source (C1-01 paints
 * all three). Rows reveal in one staggered entrance and hold still. The
 * engine behavior — the catalog fetch and the gateway queue — is untouched.
 *
 * R2-b creative studio: the matiz banner becomes the hero object — the
 * engine .shader-stage with ONE .shader-fallback bloom, the .halftone-edge
 * dissolve, the grain film, the one ambient .breathe and the transform-only
 * equalizer motif (1.2s, the studio pulse). The head joins the staged
 * editorial grammar (mono eyebrow → Bricolage display line → one phrase,
 * one .enter entrance). The body reads canvas-dominant 1.6fr/1fr: the
 * stills ledger dominant (hairline rows, display-700 size numerals and the
 * machined megapixel meters on the mono-axis ruler), the transport notes on
 * the sticky rail. Rows rise 240ms at 60ms steps, reduced-motion guarded.
 * The engine behavior — the catalog fetch and the gateway queue — is
 * untouched. */
import { Database, Play, TerminalSquare } from "lucide-react";
import { type CSSProperties, useEffect, useState } from "react";
import { toast } from "sonner";
import { AutomationNote } from "@/shell/automationnote";
import { ShellChrome } from "@/shell/ShellChrome";
import { type NativeApp, nativeApps, type StudioAsset, studioAssets } from "../../catalog";
import { queuestudiorender } from "../../runner";
import { ImageBanner } from "./imagebanner.tsx";

/** the entrance stagger of the page: one orchestrated rise through the
 * engine .enter kit, the delay reading the --i custom prop (70ms steps). */
const step = (i: number) => ({ "--i": i }) as CSSProperties;

/** megapixelsOf — the still's real pixel area from its catalog size
 * ("4032×3024" → 12.2mp), the honest ratio behind the machined meter;
 * unparseable sizes answer null and the row skips the meter. */
function megapixelsOf(size: string | undefined): number | null {
  if (!size) return null;
  const [w, h] = size.split("×").map((value) => Number.parseFloat(value));
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return null;
  return (w * h) / 1_000_000;
}

/** The image-studio slice of the R2-b pass: the asymmetric body, the
 * specimen rows and the machined meters live with the page; the atmosphere
 * guard keeps the C1 and engine layers off the pointer path, and the
 * support rail folds under the ledger when it would starve. */
const IMAGE_CSS = `
.atmos::before, .atmos::after, .grain::before, .grain::after,
.halftone::before, .halftone::after { pointer-events: none; }
.control-page.atmos { position: relative; }
.im-body { display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(250px, 1fr); gap: 32px; align-items: start; margin-top: 30px; }
.im-list { display: grid; min-width: 0; }
.im-list__head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; padding: 0 12px 12px 2px; border-bottom: 1px solid var(--dt-edge-strong); }
.im-list__head h2 { display: flex; align-items: center; gap: 8px; margin: 0; color: var(--dtv3-ink-1); font: 600 11px var(--dt-mono); letter-spacing: .08em; text-transform: lowercase; }
.im-list__head h2 svg { color: var(--dtv3-sig); flex-shrink: 0; }
.im-count { margin: 0; color: var(--dtv3-ink-3); font: 500 10px var(--dt-mono); letter-spacing: .08em; font-variant-numeric: tabular-nums; }
.im-rows { display: grid; margin: 0; padding: 0; list-style: none; }
.im-row { display: grid; grid-template-columns: minmax(0, 1fr) minmax(150px, 220px) auto; gap: 6px 18px; align-items: center; padding: 15px 12px; border-bottom: 1px solid var(--dtv3-hairline); border-radius: 10px; transition: background 160ms var(--dtv3-ease); animation: imRise 240ms var(--dtv3-ease) backwards; animation-delay: calc(var(--i, 0) * 60ms); }
.im-row:hover { background: rgb(255 255 255 / 3%); }
.im-row--lead { background: rgb(255 255 255 / 3%); box-shadow: 0 14px 36px rgb(0 0 0 / 26%), inset 0 1px 0 rgb(255 255 255 / 5%); }
.im-row--lead:hover { background: rgb(255 255 255 / 4%); }
.im-row__main { display: grid; gap: 2px; min-width: 0; }
.im-row__main h3 { margin: 0; color: var(--dtv3-ink-1); font: 600 15px/1.35 var(--dt-sans); letter-spacing: -.01em; }
.im-row--lead .im-row__main h3 { font-size: 17px; }
.im-row__main code { color: var(--dtv3-ink-3); font: 500 10px var(--dt-mono); letter-spacing: .06em; }
.im-metercell { display: grid; gap: 7px; }
.im-row__size { color: var(--dtv3-ink-1); font: 700 12px/1.2 var(--dt-sans); font-variant-numeric: tabular-nums; letter-spacing: -.01em; text-align: right; }
.im-side { position: sticky; top: 88px; display: grid; gap: 16px; align-content: start; min-width: 0; }
.im-side .control-note { display: grid; gap: 8px; padding: 16px; background: rgb(255 255 255 / 3%); border: 1px solid var(--dtv3-hairline); border-radius: var(--dtv3-r-2); color: var(--dtv3-ink-2); font: 400 12px/1.7 var(--dt-sans); }
.im-side .control-note h2 { display: flex; align-items: center; gap: 8px; margin: 0; color: var(--dtv3-ink-1); font: 600 13px var(--dt-sans); letter-spacing: -.01em; }
.im-side .control-note p { margin: 0; }
@keyframes imRise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
@media (max-width: 960px) { .im-body { grid-template-columns: minmax(0, 1fr); } .im-side { position: static; } }
@media (prefers-reduced-motion: reduce) { .im-row { animation: none; transition: none; } }
`;

let imageCssReady = false;

/** Injects the image stylesheet exactly once per document. */
function ensureImageCss(): void {
  if (imageCssReady || typeof document === "undefined") return;
  imageCssReady = true;
  const tag = document.createElement("style");
  tag.setAttribute("data-dt-image", "");
  tag.textContent = IMAGE_CSS;
  document.head.appendChild(tag);
}

/** Queues one still and surfaces the answer with the sonner toast the
 * workbench already uses: the reason text is the honest answer of the queue
 * client, so the page keeps working when the gateway is absent. */
function queueRender(asset: StudioAsset) {
  void queuestudiorender(asset, `render requested from the image studio for ${asset.title}`).then((answer) => {
    if (answer.queued) toast.success(`${asset.title} ${answer.reason}`);
    else toast.error(answer.reason);
  });
}

export default function ImageStudio() {
  ensureImageCss();
  const [apps, setApps] = useState<NativeApp[]>([]);
  const [assets, setAssets] = useState<StudioAsset[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void nativeApps().then(setApps);
    void studioAssets().then((rows) => {
      setAssets(rows.filter((asset) => asset.studio === "image"));
      setLoaded(true);
    });
  }, []);

  const engine = apps.find((app) => app.engine === "matiz" && app.owner === "cadria");

  /** the machined meter scale: the largest real pixel area in the catalog. */
  const maxmp = Math.max(...assets.map((asset) => megapixelsOf(asset.size) ?? 0), 0.1);

  return (
    <main className="control-page atmos">
      <ShellChrome />
      <div className="page-container">
        <header className="pagehead r2b-head shader-stage halftone-edge enter" style={step(0)}>
          <div className="shader-fallback" aria-hidden="true" />
          <div className="grain-overlay" aria-hidden="true" />
          <p className="pagehead__eyebrow r2a-eyebrow">devthink · image</p>
          <h1 className="pagehead__title r2a-display">The image studio</h1>
          <p className="pagehead__lede r2a-lede">
            Stills from the catalog — renders queue over the gateway to the matiz engine.
          </p>
        </header>

        <ImageBanner app={engine} />

        <div className="im-body">
          <section className="im-list" aria-labelledby="im-assets-title">
            <div className="im-list__head">
              <h2 id="im-assets-title">
                <Database size={15} aria-hidden="true" />
                image assets
              </h2>
              {assets.length ? <p className="im-count">{assets.length} stills in the catalog</p> : null}
            </div>
            {assets.length ? (
              <ul className="im-rows">
                {assets.map((asset, index) => {
                  const mp = megapixelsOf(asset.size);
                  const meterPct = mp === null ? null : (mp / maxmp) * 100;
                  return (
                    <li key={asset.id} className={index === 0 ? "im-row im-row--lead" : "im-row"} style={step(index)}>
                      <div className="im-row__main">
                        <h3>{asset.title}</h3>
                        <code>{asset.engine}</code>
                      </div>
                      <span className="im-metercell">
                        {meterPct !== null ? (
                          <span
                            className="r2b-meter"
                            aria-hidden="true"
                            style={{ "--r2b-meter-pos": `${meterPct}%` } as CSSProperties}
                          >
                            <i />
                          </span>
                        ) : null}
                        <span className="im-row__size">{asset.size ?? "—"}</span>
                      </span>
                      <button
                        type="button"
                        className="apps-action press"
                        onClick={() => queueRender(asset)}
                        aria-label={`Render ${asset.title}`}
                        title={`Render ${asset.title} — queues the still over the gateway`}
                      >
                        <Play size={11} aria-hidden="true" />
                        render
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="control-empty">
                <h2>{loaded ? "no image assets yet" : "loading the image assets…"}</h2>
                <p>
                  {loaded
                    ? "The catalog has not answered any image assets, so the render queue stays closed and the table stays empty."
                    : "The catalog request is in flight — the assets table mounts when it answers."}
                </p>
              </div>
            )}
          </section>

          <aside className="im-side">
            <section className="control-note">
              <h2>render transport</h2>
              <p>
                The render action queues the still over the gateway to the {engine ? engine.engine : "matiz"} engine;
                the catalog answers the list and the queue answers with a receipt.
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
