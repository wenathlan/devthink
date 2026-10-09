/**
 * imagebanner.tsx — the engine banner of the native image studio, restaged
 * for R2-b as the hero OBJECT of the page: the catalog row of the owning app
 * sits on the engine shader stage (ONE .shader-fallback bloom, the
 * .halftone-edge dissolve, the grain film), carries the ONE ambient .breathe
 * and the transform-only equalizer motif (five bars, 1.2s alternate — the
 * studio pulse, guarded), and reads the engine name large with the owner
 * badge on the pill ladder. The banner stays empty until the database pairs
 * — never a placeholder engine row. The stills list keeps the honest copy
 * about where the engine lives.
 */

/** Style: DevThink Terminal Atelier → R2-b creative studio. The banner skin
 * (stage panel, badge pill, lede measure, mono note) lives with the
 * component; the atmosphere guard keeps the C1 and engine layers off the
 * pointer path. */
import { Image as ImageGlyph } from "lucide-react";
import type { NativeApp } from "../../catalog";

const BANNER_CSS = `
.atmos::before, .atmos::after, .grain::before, .grain::after,
.halftone::before, .halftone::after { pointer-events: none; }
.im-hero { position: relative; display: grid; gap: 10px; padding: clamp(22px, 3vw, 30px); border: 1px solid var(--dtv3-hairline); border-radius: var(--dtv3-r-3); background: rgb(255 255 255 / 2%); }
.im-hero__head { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.im-hero__head h2 { display: flex; align-items: center; gap: 10px; margin: 0; color: var(--dtv3-ink-1); font: 700 clamp(20px, 2.4vw, 26px)/1.2 var(--dt-sans); letter-spacing: -.02em; }
.im-hero__head h2 svg { color: var(--dtv3-sig); flex-shrink: 0; }
.im-badge { padding: 3px 10px; color: var(--dtv3-sig); background: color-mix(in srgb, var(--dtv3-sig) 10%, transparent); border: 1px solid color-mix(in srgb, var(--dtv3-sig) 30%, transparent); border-radius: 999px; font: 600 9px var(--dt-mono); letter-spacing: .08em; text-transform: lowercase; }
.im-hero__lede { margin: 0; max-width: 62ch; color: var(--dtv3-ink-2); font: 400 13px/1.7 var(--dt-sans); }
.im-hero__note { margin: 0; color: var(--dtv3-ink-3); font: 500 10px var(--dt-mono); letter-spacing: .06em; }
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

/** the equalizer motif: five transform-only bars (the .r2b-eq keyframes in
 * the theme layer), the studio pulse — decorative, aria-hidden. */
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

export function ImageBanner({ app }: { app: NativeApp | undefined }) {
  ensureBannerCss();
  if (!app)
    return (
      <section className="im-hero shader-stage halftone-edge breathe">
        <div className="shader-fallback" aria-hidden="true" />
        <div className="grain-overlay" aria-hidden="true" />
        <div className="im-hero__head">
          <EqPulse />
          <h2>
            <ImageGlyph size={18} aria-hidden="true" />
            the matiz engine
          </h2>
        </div>
        <p className="im-hero__lede">
          The catalog has not answered the matiz engine row yet, so the banner stays empty until the database pairs.
        </p>
      </section>
    );
  return (
    <section className="im-hero shader-stage halftone-edge breathe">
      <div className="shader-fallback" aria-hidden="true" />
      <div className="grain-overlay" aria-hidden="true" />
      <div className="im-hero__head">
        <EqPulse />
        <h2>
          <ImageGlyph size={18} aria-hidden="true" />
          the {app.engine} engine
        </h2>
        <span className="im-badge">{app.owner}</span>
      </div>
      <p className="im-hero__lede">{app.blurb}</p>
      <p className="im-hero__note">
        The {app.engine} engine rides the catalog over https, so this page never bundles the engine itself.
      </p>
    </section>
  );
}
