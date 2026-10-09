/**
 * imagebanner.tsx — the engine banner of the native image studio: the
 * catalog row of the owning app becomes the dominant object of the page —
 * one raised sheet at the p-6 padding with the engine name set large, the
 * owner badge on the 4px chip ladder and the honest line about where the
 * engine lives. The banner stays empty until the database pairs — never a
 * placeholder engine row.
 */

/** Style: DevThink Terminal Atelier — the same banner grammar the video and
 * music studios render, so the three studio pages read as one surface with a
 * different engine behind each. C1-04: the banner is the page's dominant
 * object (p-6 padding, 18px engine title, hairline panel skin), the owner
 * badge carries the one solar accent, and the layout styles ride with the
 * component — the wave stylesheet owns the shared classes. */
import { Image as ImageGlyph } from "lucide-react";
import type { NativeApp } from "../../catalog";

/** The image-studio slice of the C1-04 pass: the dominant banner layout lives
 * with the component; the atmosphere guard keeps the C1-01 layers off the
 * pointer path. */
const BANNER_CSS = `
.atmos::before, .atmos::after, .grain::before, .grain::after,
.halftone::before, .halftone::after { pointer-events: none; }
.pagehead.halftone { position: relative; }
.im-banner { position: relative; display: grid; gap: 10px; padding: 24px; border: 1px solid var(--dt-edge); border-radius: 10px; background: rgb(25 28 35 / 72%); }
.im-banner__head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.im-banner__head svg { color: var(--dt-orange); flex-shrink: 0; }
.im-banner__head h2 { margin: 0; color: var(--dt-text); font: 600 18px/1.3 var(--dt-sans); letter-spacing: -.01em; }
.im-badge { padding: 2px 8px; color: var(--dt-orange); background: rgb(255 95 0 / 8%); border: 1px solid rgb(255 95 0 / 24%); border-radius: 4px; font: 600 9px var(--dt-mono); letter-spacing: .08em; text-transform: uppercase; }
.im-banner__lede { margin: 0; max-width: 68ch; color: var(--dt-muted); font: 400 13px/1.7 var(--dt-sans); }
.im-banner__note { margin: 0; color: var(--dt-faint); font: 500 10px var(--dt-mono); letter-spacing: .06em; }
`;

let bannerCssReady = false;

/** Injects the banner stylesheet exactly once per document. */
function ensureBannerCss(): void {
  if (bannerCssReady || typeof document === "undefined") return;
  bannerCssReady = true;
  const tag = document.createElement("style");
  tag.setAttribute("data-dt-imagebanner", "");
  tag.textContent = BANNER_CSS;
  document.head.appendChild(tag);
}

export function ImageBanner({ app }: { app: NativeApp | undefined }) {
  ensureBannerCss();
  if (!app)
    return (
      <section className="im-banner">
        <div className="im-banner__head">
          <ImageGlyph size={16} aria-hidden="true" />
          <h2>the matiz engine</h2>
        </div>
        <p className="im-banner__lede">
          The catalog has not answered the matiz engine row yet, so the banner stays empty until the database pairs.
        </p>
      </section>
    );
  return (
    <section className="im-banner">
      <div className="im-banner__head">
        <ImageGlyph size={16} aria-hidden="true" />
        <h2>the {app.engine} engine</h2>
        <span className="im-badge">{app.owner}</span>
      </div>
      <p className="im-banner__lede">{app.blurb}</p>
      <p className="im-banner__note">
        The {app.engine} engine rides the catalog over https, so this page never bundles the engine itself.
      </p>
    </section>
  );
}
