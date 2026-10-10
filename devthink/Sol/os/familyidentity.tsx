/**
 * familyidentity.tsx — the identity kit of the family views inside the os
 * (design campaign task 3-c). One shared grammar so every family surface
 * reads as a SaaS product inside the os window instead of a generic
 * ledger:
 *
 * - `FAMILY_ACCENT`     the per-app identity accents of the design spec
 *                       (section 12): forge lime-brasa, foundry têmpera,
 *                       vault gelo-de-cofre, getry violeta, argan jade,
 *                       cadria rosa, debonair latão, stealthhead ember,
 *                       saddle ember-couro, devthink âmbar-Sol. The table
 *                       itself lives in familyaccent.ts (pure data — the
 *                       tests import it without the JSX layer); this
 *                       module re-exports it for the views.
 * - `accentVars`        the local css-var contract every view root mounts
 *                       (the veil atmosphere + the accent hook), unchanged
 *                       from the C1-01/C2-02 passes.
 * - `HeroGlyph`         the animated app glyph: the lucide stroke painted
 *                       by a per-app gradient that moves INSIDE the glyph
 *                       (the official animated-icon signature — gradient
 *                       by stroke url, never a glow behind the icon), one
 *                       distinct motion per app, reduced-motion guarded.
 * - `FamilyHero`        the compact hero of every family page: animated
 *                       glyph, app name (the page h1), one-line tagline
 *                       and 3–4 key numbers in tabular figures.
 * - `FamilyEmpty`       the elegant empty state: the glyph, one phrase,
 *                       one real action — never a dashed amateur box.
 * - `FamilyStyles`      the scoped stylesheet of the grammar (surface
 *                       ladder, hairline, thin neutral scrollbar, the
 *                       150ms micro hover on the cubic-bezier(0.22,1,0.36,1)
 *                       curve). Mounted once per document by React 19
 *                       `<style href>` dedup — the theme sheet (sol.css)
 *                       stays untouched by this task.
 *
 * The surface ladder mirrors the campaign spec: #242424 → #494949 over
 * the mica canvas, hairline 1px only between elements of the same step,
 * accent budget 90/10 (glyph + first number + eyebrow — never a pill,
 * never a flat link fill).
 */

import type { LucideIcon } from "lucide-react";
import { type CSSProperties, useEffect, useState } from "react";
import type { AppMeta } from "./apps.ts";
import { FAMILY_ACCENT, familyAccentOf, type GlyphMotion } from "./familyaccent.ts";

/* ------------------------------------------------------------------ */
/* ACCENTS — re-exported from familyaccent.ts (the pure data module;  */
/* the single source stays importable by tests without the JSX).      */
/* ------------------------------------------------------------------ */

export type { GlyphMotion };
export { FAMILY_ACCENT, familyAccentOf };

/* ------------------------------------------------------------------ */
/* MOTION — the reduced-motion guard of the family grammar.           */
/* ------------------------------------------------------------------ */

/**
 * true when the os setting or the system preference asks for reduced
 * motion (same two sources the os view switch respects).
 *
 * @returns true when animation must stay out of the way.
 */
export function useFamilyReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => familyMotionReduced());
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(familyMotionReduced());
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

function familyMotionReduced(): boolean {
  if (typeof window === "undefined") return true;
  if (document.documentElement.dataset.motion === "reduced") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* ------------------------------------------------------------------ */
/* ACCENT VARS — the per-view root contract (unchanged shape).        */
/* ------------------------------------------------------------------ */

/**
 * the family accent as local css vars: the atmosphere recipes ride the
 * app identity — the veil and every key-number tint resolve through
 * --app-accent inside this subtree.
 *
 * @param accent the identity hex of the app.
 * @returns the style object for the view root.
 */
export function accentVars(accent: string): CSSProperties {
  return {
    "--app-accent": accent,
    "--atmos-accent": accent,
    "--atmos-veil":
      `radial-gradient(1200px 700px at 72% -12%, color-mix(in srgb, ${accent} 8%, transparent), transparent 62%), ` +
      `radial-gradient(900px 620px at 8% 108%, color-mix(in srgb, ${accent} 6%, transparent), transparent 58%)`,
  } as CSSProperties;
}

/** the dominant-object surface: the named light source over the surface ladder. */
export const FAM_DOMINANT_SURFACE = {
  background: "var(--atmos-veil), var(--fam-s1)",
  overflow: "hidden",
} as const;

/* ------------------------------------------------------------------ */
/* HERO GLYPH — the animated icon (gradient moving INSIDE the stroke). */
/* ------------------------------------------------------------------ */

type GlyphTiming = { dur: string; from: string; to: string };

/** the one motion per app: a slow dial, a forge strike, a temper sweep… */
const GLYPH_MOTION: Record<GlyphMotion, { kind: "spin" | "sweep" | "pulse"; timing: GlyphTiming }> = {
  dial: { kind: "spin", timing: { dur: "9s", from: "0 0.5 0.5", to: "360 0.5 0.5" } }, // vault — the sealed door
  strike: { kind: "pulse", timing: { dur: "1.1s", from: "0.35;1;0.35", to: "" } }, // forge — hammer beats
  temper: { kind: "sweep", timing: { dur: "3.4s", from: "-0.6;1.4", to: "0.4;2.4" } }, // foundry — quench sweep
  route: { kind: "sweep", timing: { dur: "2.2s", from: "-0.6;1.4", to: "0.4;2.4" } }, // getry — lane routing
  dig: { kind: "pulse", timing: { dur: "2.6s", from: "0.4;1;0.4", to: "" } }, // argan — resolver ping
  reel: { kind: "spin", timing: { dur: "6s", from: "0 0.5 0.5", to: "360 0.5 0.5" } }, // cadria — the reel
  breathe: { kind: "pulse", timing: { dur: "2.4s", from: "0.4;1;0.4", to: "" } }, // debonair — the bus breathe
  scope: { kind: "sweep", timing: { dur: "1.5s", from: "-0.6;1.4", to: "0.4;2.4" } }, // stealthhead — reticle snap
  sun: { kind: "spin", timing: { dur: "12s", from: "0 0.5 0.5", to: "360 0.5 0.5" } }, // devthink — the solar wheel
};

/**
 * the animated glyph: the lucide stroke painted by a per-app gradient
 * that drifts inside the glyph shape (stroke: url(#…)), one motion per
 * app, static under reduced motion (the gradient stays, the SMIL timeline
 * is not mounted).
 */
export function HeroGlyph({
  icon: Icon,
  accent,
  motion,
  glyphId,
  size = 28,
}: {
  icon: LucideIcon;
  accent: string;
  motion: GlyphMotion;
  glyphId: string;
  size?: number;
}) {
  const reduced = useFamilyReducedMotion();
  const gid = `fam-grad-${glyphId}`;
  const spec = GLYPH_MOTION[motion];
  const light = `color-mix(in srgb, ${accent} 38%, #ffffff)`;

  return (
    <span className="fam-glyph" style={{ position: "relative", display: "inline-flex" }} aria-hidden="true">
      <svg width="0" height="0" style={{ position: "absolute" }} focusable="false" aria-hidden="true">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={accent} />
            <stop offset="1" stopColor={light} stopOpacity={spec.kind === "pulse" ? 0.35 : 1}>
              {!reduced && spec.kind === "pulse" ? (
                <animate
                  attributeName="stop-opacity"
                  values={spec.timing.from}
                  dur={spec.timing.dur}
                  repeatCount="indefinite"
                />
              ) : null}
            </stop>
            {!reduced && spec.kind === "spin" ? (
              <animateTransform
                attributeName="gradientTransform"
                type="rotate"
                from={spec.timing.from}
                to={spec.timing.to}
                dur={spec.timing.dur}
                repeatCount="indefinite"
              />
            ) : null}
            {!reduced && spec.kind === "sweep" ? (
              <>
                <animate attributeName="x1" values={spec.timing.from} dur={spec.timing.dur} repeatCount="indefinite" />
                <animate attributeName="x2" values={spec.timing.to} dur={spec.timing.dur} repeatCount="indefinite" />
              </>
            ) : null}
          </linearGradient>
        </defs>
      </svg>
      <Icon size={size} strokeWidth={1.7} style={{ stroke: `url(#${gid})` }} />
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* FAMILY HERO — the compact product header of every family page.     */
/* ------------------------------------------------------------------ */

export type FamilyStat = {
  /** the micro label under the number (mono caps). */
  label: string;
  /** the value — rendered with tabular figures. */
  value: string;
  /** true paints the value with the identity accent (the 90/10 budget). */
  accent?: boolean;
};

/**
 * the compact hero: animated glyph · app name (h1 of the page) · one-line
 * tagline · 3–4 key numbers in tabular figures over the surface ladder.
 * The hero carries the identity accent of the app; the content below
 * stays neutral (90/10).
 */
export function FamilyHero({
  app,
  tagline,
  stats,
  glyphMotion,
  status,
}: {
  app: AppMeta;
  tagline: string;
  stats: FamilyStat[];
  glyphMotion: GlyphMotion;
  /** the honest status line beside the name (default "surface mounted"). */
  status?: string;
}) {
  return (
    <header className="fam-hero" style={FAM_DOMINANT_SURFACE}>
      <div className="fam-hero__head">
        <span className="fam-hero__seal">
          <HeroGlyph icon={app.icon} accent={app.accent} motion={glyphMotion} glyphId={app.id} size={30} />
        </span>
        <div className="fam-hero__ident">
          <p className="fam-hero__eyebrow">
            {app.domain} · {app.tag}
          </p>
          <h1 className="fam-hero__name">{app.name}</h1>
          <p className="fam-hero__tagline">{tagline}</p>
        </div>
        <span className="badge success fam-hero__status" role="status">
          <span className="dot" aria-hidden="true" />
          {status ?? "surface mounted"}
        </span>
      </div>
      <dl className="fam-hero__stats">
        {stats.map((s, i) => (
          <div className="fam-stat" key={s.label}>
            <dd className="fam-stat__value" style={i === 0 || s.accent ? { color: "var(--app-accent)" } : undefined}>
              {s.value}
            </dd>
            <dt className="fam-stat__label">{s.label}</dt>
          </div>
        ))}
      </dl>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* FAMILY EMPTY — the elegant empty state.                            */
/* ------------------------------------------------------------------ */

/**
 * the empty state of the family grammar: the glyph at rest, one sentence,
 * one real action — the contract is explained, never a dashed box.
 */
export function FamilyEmpty({
  app,
  motion,
  title,
  line,
  actionLabel,
  onAction,
}: {
  app: AppMeta;
  motion: GlyphMotion;
  title: string;
  line: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="fam-empty">
      <span className="fam-empty__seal">
        <HeroGlyph icon={app.icon} accent={app.accent} motion={motion} glyphId={`${app.id}-empty`} size={26} />
      </span>
      <p className="fam-empty__title">{title}</p>
      <p className="fam-empty__line">{line}</p>
      {actionLabel && onAction ? (
        <button type="button" className="btn secondary fam-empty__action" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* FAMILY STYLES — the scoped stylesheet of the grammar.              */
/* ------------------------------------------------------------------ */

/**
 * the family view stylesheet, mounted once per document (React 19 dedupes
 * by the href key). sol.css stays untouched — this grammar is owned by
 * the os family views: the surface ladder, the hairline discipline, the
 * thin neutral scrollbar, the 150ms micro hover, the reduced-motion and
 * reduced-transparency guards.
 */
export function FamilyStyles() {
  return (
    <style href="family-identity" precedence="theme">
      {FAMILY_CSS}
    </style>
  );
}

const FAMILY_CSS = `
/* --- the family view grammar (task 3-c) — scoped to .fam-view roots --- */
.fam-view {
  --fam-ease: cubic-bezier(0.22, 1, 0.36, 1);
  --fam-s1: #242424; --fam-s2: #2b2b2b; --fam-s3: #323232; --fam-s5: #373737;
  --fam-s7: #434343; --fam-s8: #494949;
  --fam-hair: rgb(255 255 255 / 7%);
  --fam-hair-strong: rgb(255 255 255 / 10%);
  --fam-ink: #ffffff; --fam-muted: #c3c3c3; --fam-faint: #999999;
}
[data-theme="light"] .fam-view {
  --fam-s1: #fbfbfb; --fam-s2: #f4f4f4; --fam-s3: #f0f0f0; --fam-s5: #e9e9e9;
  --fam-s7: #d4d4d4; --fam-s8: #cbcbcb;
  --fam-hair: rgb(23 25 31 / 12%);
  --fam-hair-strong: rgb(23 25 31 / 16%);
  --fam-ink: #1a1a1a; --fam-muted: #3c3c3c; --fam-faint: #555555;
}
@media (prefers-reduced-transparency: reduce) {
  .fam-view { --fam-hair: rgb(255 255 255 / 14%); }
}
/* thin neutral scrollbar, scoped to the family views */
.fam-view * { scrollbar-width: thin; scrollbar-color: var(--fam-s8) transparent; }
.fam-view *::-webkit-scrollbar { width: 8px; height: 8px; }
.fam-view *::-webkit-scrollbar-thumb { background: var(--fam-s8); border-radius: 4px; }
.fam-view *::-webkit-scrollbar-track { background: transparent; }
/* numbers never dance */
.fam-view .table td, .fam-stat__value, .fam-num { font-variant-numeric: tabular-nums; }
/* the hero: the page-in-page panel (radius 12) under the app light */
.fam-hero { position: relative; border: 1px solid var(--fam-hair); border-radius: 12px; padding: clamp(18px, 2.6vw, 26px); }
.fam-hero__head { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.fam-hero__seal { display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; flex: none; border-radius: 10px; background: var(--fam-s3); border: 1px solid var(--fam-hair); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--app-accent) 26%, transparent); }
.fam-hero__ident { min-width: 0; flex: 1 1 260px; }
.fam-hero__eyebrow { margin: 0 0 2px; font: 600 10px/1.4 var(--dt-mono); letter-spacing: 0.14em; text-transform: uppercase; color: var(--fam-faint); }
.fam-hero__name { margin: 0; font: 600 24px/1.12 var(--dt-sans); letter-spacing: -0.01em; color: var(--fam-ink); }
.fam-hero__tagline { margin: 4px 0 0; font-size: 13px; line-height: 1.5; color: var(--fam-muted); }
.fam-hero__status { margin-left: auto; }
.fam-hero__stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(128px, 1fr)); gap: 12px; margin: 18px 0 0; padding-top: 14px; border-top: 1px solid var(--fam-hair); }
.fam-stat { display: flex; flex-direction: column-reverse; gap: 2px; }
.fam-stat__value { margin: 0; font: 600 21px/1.1 var(--dt-sans); letter-spacing: -0.01em; color: var(--fam-ink); }
.fam-stat__label { margin: 0; font: 600 9.5px/1.4 var(--dt-mono); letter-spacing: 0.12em; text-transform: uppercase; color: var(--fam-faint); }
/* surface cards: one step above the canvas, hairline only on the same step */
.fam-card { background: var(--fam-s1); border: 1px solid var(--fam-hair); border-radius: 10px; transition: transform 150ms var(--fam-ease), box-shadow 150ms var(--fam-ease), border-color 150ms var(--fam-ease), background-color 150ms var(--fam-ease); }
.fam-card--s2 { background: var(--fam-s2); }
.fam-card--hover:hover { transform: translateY(-4px); border-color: var(--fam-hair-strong); box-shadow: 0 1px 1px -0.5px rgb(0 0 0 / 18%), 0 16px 32px -16px rgb(0 0 0 / 45%), inset 0 1px 0 rgb(255 255 255 / 5%); }
.fam-card__head { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.fam-card__title { margin: 0; font: 600 16px/1.25 var(--dt-sans); letter-spacing: -0.01em; color: var(--fam-ink); }
.fam-card__count { font: 600 11px/1.4 var(--dt-mono); letter-spacing: 0.08em; color: var(--app-accent); }
/* the meter ladder (fleet health, budgets): track s5, fill the accent */
.fam-meter { height: 5px; border-radius: 3px; background: var(--fam-s5); overflow: hidden; }
.fam-meter > i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, color-mix(in srgb, var(--app-accent) 62%, transparent), var(--app-accent)); }
/* the live report feed of the forge (and honest replays) */
.fam-feed { margin: 0; padding: 0; list-style: none; font: 12px/1.7 var(--dt-mono); color: var(--fam-muted); }
.fam-feed li { display: flex; gap: 10px; padding: 7px 0; border-bottom: 1px solid var(--fam-hair); align-items: baseline; }
.fam-feed li:last-child { border-bottom: 0; }
.fam-feed__t { flex: none; color: var(--fam-faint); font-size: 10.5px; letter-spacing: 0.06em; }
.fam-feed__tag { flex: none; color: var(--app-accent); }
/* the elegant empty state */
.fam-empty { display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center; padding: clamp(28px, 5vw, 44px) 18px; }
.fam-empty__seal { display: inline-flex; align-items: center; justify-content: center; width: 52px; height: 52px; border-radius: 10px; background: var(--fam-s3); border: 1px solid var(--fam-hair); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--app-accent) 22%, transparent); }
.fam-empty__title { margin: 4px 0 0; font: 600 15px/1.4 var(--dt-sans); color: var(--fam-ink); }
.fam-empty__line { margin: 0; max-width: 46ch; font-size: 12.5px; line-height: 1.6; color: var(--fam-faint); }
.fam-empty__action { margin-top: 8px; min-height: 44px; }
/* micro labels of the ladder rows */
.fam-microrow { display: grid; gap: 6px; padding: 12px 0; border-bottom: 1px solid var(--fam-hair); transition: background-color 150ms var(--fam-ease); }
.fam-microrow:last-child { border-bottom: 0; }
.fam-microrow:hover { background: color-mix(in srgb, var(--fam-s3) 55%, transparent); }
/* reduced motion: the hover lift stands down, the wash stays */
@media (prefers-reduced-motion: reduce) {
  .fam-card, .fam-card--hover, .fam-card--hover:hover { transition: none; transform: none; }
}
`;
