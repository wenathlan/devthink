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
 * engine behavior — the catalog fetch and the gateway queue — is untouched. */
import { Database, Play, TerminalSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AutomationNote } from "@/shell/automationnote";
import { ShellChrome } from "@/shell/ShellChrome";
import { type NativeApp, nativeApps, type StudioAsset, studioAssets } from "../../catalog";
import { queuestudiorender } from "../../runner";
import { ImageBanner } from "./imagebanner";

/** tabular numerals for the size readouts of the stills list. */
const TABULAR = { fontVariantNumeric: "tabular-nums" } as const;

/** The image-studio slice of the C1-04 pass: the asymmetric body (dominant
 * list + support rail), the specimen rows and the toolbar ladder live with
 * the page; the atmosphere guard keeps the C1-01 layers off the pointer
 * path, and the support rail folds under the list when it would starve. */
const IMAGE_CSS = `
.atmos::before, .atmos::after, .grain::before, .grain::after,
.halftone::before, .halftone::after { pointer-events: none; }
.control-page.atmos { position: relative; }
.pagehead.halftone { position: relative; }
.im-body { display: grid; grid-template-columns: minmax(0, 1fr) 264px; gap: 20px; align-items: start; margin-top: 20px; }
.im-list { position: relative; padding: 18px 16px 10px; border: 1px solid var(--dt-edge); border-radius: 10px; background: rgb(25 28 35 / 72%); }
.im-list__head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; padding: 0 8px 12px; }
.im-list__head h2 { display: flex; align-items: center; gap: 8px; margin: 0; color: var(--dt-text); font: 600 15px var(--dt-sans); letter-spacing: -.01em; }
.im-list__head h2 svg { color: var(--dt-blue); flex-shrink: 0; }
.im-count { margin: 0; color: var(--dt-faint); font: 500 10px var(--dt-mono); letter-spacing: .08em; font-variant-numeric: tabular-nums; }
.im-rows { display: grid; margin: 0; padding: 0; list-style: none; }
.im-row { display: grid; grid-template-columns: minmax(0, 1fr) auto auto; gap: 4px 16px; align-items: center; padding: 11px 8px; border-top: 1px solid var(--dt-edge); border-radius: 6px; transition: background 160ms var(--dt-ease); animation: imRise 240ms cubic-bezier(.22, 1, .36, 1) backwards; }
.im-row:first-child { border-top: 0; }
.im-row:hover { background: rgb(255 255 255 / 3%); }
.im-row__main { display: grid; gap: 1px; min-width: 0; }
.im-row__main h3 { margin: 0; color: var(--dt-text); font: 600 14px/1.4 var(--dt-sans); letter-spacing: -.01em; }
.im-row--lead .im-row__main h3 { font-size: 16px; }
.im-row__main code { color: var(--dt-faint); font: 500 10px var(--dt-mono); letter-spacing: .06em; }
.im-row__size { color: var(--dt-muted); font: 500 11px var(--dt-mono); font-variant-numeric: tabular-nums; }
.im-side { display: grid; gap: 12px; align-content: start; }
@keyframes imRise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@media (max-width: 960px) { .im-body { grid-template-columns: minmax(0, 1fr); } }
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

  return (
    <main className="control-page atmos">
      <ShellChrome />
      <div className="page-container">
        <header className="pagehead halftone">
          <p className="pagehead__eyebrow">devthink · image</p>
          <h1 className="pagehead__title">Image</h1>
          <p className="pagehead__lede">
            The native image studio on the cadria matiz pixel engine: the stills come from the catalog and the renders
            queue over the gateway.
          </p>
        </header>

        <ImageBanner app={engine} />

        <div className="im-body">
          <section className="im-list grain" aria-labelledby="im-assets-title">
            <div className="im-list__head">
              <h2 id="im-assets-title">
                <Database size={15} aria-hidden="true" />
                image assets
              </h2>
              {assets.length ? <p className="im-count">{assets.length} stills in the catalog</p> : null}
            </div>
            {assets.length ? (
              <ul className="im-rows">
                {assets.map((asset, index) => (
                  <li
                    key={asset.id}
                    className={index === 0 ? "im-row im-row--lead" : "im-row"}
                    style={{ animationDelay: `${index * 40}ms` }}
                  >
                    <div className="im-row__main">
                      <h3>{asset.title}</h3>
                      <code>{asset.engine}</code>
                    </div>
                    <span className="im-row__size" style={TABULAR}>
                      {asset.size ?? "—"}
                    </span>
                    <button
                      type="button"
                      className="apps-action"
                      onClick={() => queueRender(asset)}
                      aria-label={`Render ${asset.title}`}
                      title={`Render ${asset.title} — queues the still over the gateway`}
                    >
                      <Play size={11} aria-hidden="true" />
                      render
                    </button>
                  </li>
                ))}
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
