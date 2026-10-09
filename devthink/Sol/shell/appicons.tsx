/**
 * appicons.tsx — the premium drawn icon set of the Sol shell. One hand-drawn
 * SVG component per desktop app (Sol/shell/appregistry.ts), exported through
 * the APP_ICONS map the app tile reads by the registry `iconset` key.
 *
 * Every icon is built in depth layers over its own guide color (the "story"):
 * a gradient squircle with a soft top gloss, a mid layer of blurred story
 * orbs over a pedestal band, and the glyph itself in thick ivory strokes with
 * a translucent filled backing and a blurred drop shadow. The finishing
 * follows the house reference (the 3D stage icon): two blurred inner
 * contours, a blurred contact ellipse at the base, a discrete film grain, a
 * two-layer drop shadow in the story color, a sheen band that sweeps once on
 * hover, a contact glow that rises and breathes, and a gentle perspective
 * tilt — all plain CSS transitions/animations on transform/opacity/filter,
 * with @property registered custom properties (--dt-fan/--dt-glow) easing at
 * the house cubic-bezier and -webkit- prefixes on every 3D/filter path.
 * No decorative dots and no microcopy: the interaction exists, the icon
 * speaks for itself.
 *
 * The animated icon system (task C1-06, extended by campaign v3 · R1-b):
 * every drawn mark carries ONE signature motion, declared by the `motion`
 * field of its spec onto the stable `data-motion` hook of the icon root and
 * the svg root, on two layers. The idle layer is the AMBIENT loop (R1-b):
 * one slow function-true loop per app — chat bubble pulse 4s, history hand
 * sweep 12s, kanban bob, caret blink, gateway node ripple, plug pulse, usage
 * meter breathe, stream dash flow, docs page sway, compass seek, os pane
 * shimmer, gear turn 16s, argan signal ripple, cadria petal sway, debonair
 * equalizer 1.2s, stealthhead scope sweep ±2°, forge ember flicker, foundry
 * conveyor tick, vault dial rotation 16s, getry plate slide, saddle bob —
 * running 1.2–16s alternate+infinite with staggered negative delays on
 * transform/opacity/filter (plus the sanctioned stroke-dashoffset flow),
 * wrapped in `@media not (prefers-reduced-motion: reduce)`. The live layer
 * is the hover story: a one-shot that plays once per hover/live flag and
 * always takes precedence over the ambient loop (the animation shorthand
 * replaces it while live, the ambient resumes on leave). Each story ends in
 * the pose it started from, so the live flag can drop mid-story with no
 * visible snap. The stylesheet is injected once by this file (self-owned,
 * never sol.css) and doubles as the hook contract for the wave-C2 css agent:
 *   - `.dtIcon[data-motion="<token>"]` — the icon root; the svg root mirrors it
 *   - `.dtIcon[data-live="true"]` and `.dt-tile[data-live="true"]` — the live
 *     state the app tile drives from pointer hover (apptile.tsx); the sheet
 *     also accepts the direct :hover and the hover/keyboard focus of the
 *     shell wrappers (.dt-appicon, .dt-nav__app, .dt-start__app,
 *     .shell-dock button)
 *   - `--dt-stagger` — the optional entrance index (ms) a field sets per
 *     tile; the desktop field already staggers its cells and stays THE
 *     orchestrated entrance, other fields can adopt the variable as-is
 *   - `--dt-fan`/`--dt-glow` — the registered @property pair behind the
 *     tilt, the glyph lift and the contact glow
 *   - `dtIcon-m-*` classes + the `--dt-i` index — the per-part choreography
 *     hooks (bars, plates, nodes, pages, runs) with `both` fill so staggered
 *     parts hold their wind-up while their delay runs
 * Tokens: chat bounce · history sweep · projects kanban · console blink ·
 * gateway ripple · providers pulse · usage meter · routes draw · docs lift ·
 * explore compass · os lattice · settings turn · argan sway · cadria spin ·
 * debonair wave · stealthhead breathe · forge tap · foundry glow · vault dial ·
 * getry slide · saddle shine — each token drives both its ambient idle loop
 * and its hover story. prefers-reduced-motion (and the os `data-motion`
 * setting) turn every motion off into instant states; coarse pointers keep
 * the one-shot stories on tap but drop the sustained hover transforms.
 *
 * The optical scale every glyph answers to (the audit ladder): one stroke
 * hierarchy — STROKE_BRIGHT 5.5 for the primary outline, STROKE 5 for the
 * base, STROKE_SOFT 4.5 for secondary details, STROKE_HAIR 4 for fine inner
 * contours; tiny windows at radius 2, panes and crate at 2.5, one bar radius
 * (3), container radii 5–6.5 and the board at 8; and one inner-padding band,
 * glyphs living within ~26–70 of the 96-unit face. The identity of every
 * glyph stays untouched; only outliers are normalized onto the ladder.
 */
import { type ComponentType, type CSSProperties, type ReactElement, useEffect } from "react";

/** the warm ivory of every glyph stroke */
const IVORY = "#fbf5ea";

/** the backing translucency of outlined glyph shapes */
const BACKING = "rgba(255,255,255,.14)";

/** the stroke ladder: bright primary outlines */
const STROKE_BRIGHT = 5.5;

/** the stroke ladder: the base weight of the glyph group */
const STROKE = 5;

/** the stroke ladder: soft secondary details */
const STROKE_SOFT = 4.5;

/** the stroke ladder: hair-weight inner contours */
const STROKE_HAIR = 4;

export type AppIconProps = {
  /** rendered square size in px; omitted, the icon fills its tile box */
  size?: number;
  /** the live flag the app tile raises on hover; omitted, the icon answers
   *  to its own :hover (standalone renders) */
  live?: boolean;
};

interface HoudiniProp {
  name: string;
  syntax: string;
  inherits: boolean;
  initialValue: string;
}

/** the animatable custom properties of the set, mirrored in the stylesheet */
const HOUDINI_PROPS: readonly HoudiniProp[] = [
  { name: "--dt-fan", syntax: "<number>", inherits: true, initialValue: "0" },
  { name: "--dt-glow", syntax: "<number>", inherits: false, initialValue: "0.34" },
];

/* ---------------------------- CSS (injected once) -------------------------- */
const ICON_CSS = `
@property --dt-fan { syntax: "<number>"; inherits: true; initial-value: 0; }
@property --dt-glow { syntax: "<number>"; inherits: false; initial-value: 0.34; }
.dtIcon {
  --dt-fan: 0;
  --dt-glow: 0.34;
  position: relative; display: block; width: 100%; height: 100%;
  transform-style: preserve-3d; -webkit-transform-style: preserve-3d;
  isolation: isolate;
  animation: dti-enter .5s cubic-bezier(.23,1,.32,1) backwards;
  -webkit-animation: dti-enter .5s cubic-bezier(.23,1,.32,1) backwards;
  animation-delay: var(--dt-stagger, 0ms);
  -webkit-animation-delay: var(--dt-stagger, 0ms);
}
@keyframes dti-enter {
  from { opacity: 0; transform: translateY(6px) scale(.965); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
html.dt-icon-fx .dtIcon { transition: --dt-fan .55s cubic-bezier(.22,.9,.3,1.15), --dt-glow .6s ease; }

/* the live state of an icon: the direct hover, the data-live flag the app
   tile drives (apptile.tsx), or the hover/keyboard focus of the shell wrapper
   around the tile (desktop + launcher cells, taskbar pin, start entry, dock) */
.dtIcon:is(:hover, [data-live="true"]),
.dt-appicon:is(:hover, :focus-within) .dtIcon,
.dt-nav__app:is(:hover, :focus-within) .dtIcon,
.dt-start__app:is(:hover, :focus-within) .dtIcon,
.shell-dock button:is(:hover, :focus-within) .dtIcon { --dt-fan: 1; }
.dtIcon:is(:hover, [data-live="true"]) .dtIconGlow,
.dt-appicon:is(:hover, :focus-within) .dtIcon .dtIconGlow,
.dt-nav__app:is(:hover, :focus-within) .dtIcon .dtIconGlow,
.dt-start__app:is(:hover, :focus-within) .dtIcon .dtIconGlow,
.shell-dock button:is(:hover, :focus-within) .dtIcon .dtIconGlow { --dt-glow: .62; }

.dtIconGlow {
  position: absolute; left: 10%; right: 10%; bottom: -6%; height: 44%; z-index: 0;
  border-radius: 50%; pointer-events: none;
  background: radial-gradient(52% 60% at 50% 62%, var(--story-glow, rgba(255,140,66,.45)), transparent 76%);
  filter: blur(9px); -webkit-filter: blur(9px);
  opacity: var(--dt-glow);
  transition: opacity .55s cubic-bezier(.22,.9,.3,1.15);
  -webkit-transition: opacity .55s cubic-bezier(.22,.9,.3,1.15);
}
.dtIconSvg {
  position: relative; z-index: 1; display: block; width: 100%; height: 100%;
  overflow: visible; shape-rendering: geometricPrecision;
  transform-style: preserve-3d; -webkit-transform-style: preserve-3d;
  transform: perspective(340px) rotateX(0deg) rotateY(0deg);
  -webkit-transform: perspective(340px) rotateX(0deg) rotateY(0deg);
  will-change: transform;
  filter: drop-shadow(0 4px 7px var(--story-shadow, rgba(0,0,0,.26))) drop-shadow(0 1.5px 3px var(--story-shadow-soft, rgba(0,0,0,.14)));
  -webkit-filter: drop-shadow(0 4px 7px var(--story-shadow, rgba(0,0,0,.26))) drop-shadow(0 1.5px 3px var(--story-shadow-soft, rgba(0,0,0,.14)));
  transition: transform .55s cubic-bezier(.22,.9,.3,1.15);
  -webkit-transition: -webkit-transform .55s cubic-bezier(.22,.9,.3,1.15), transform .55s cubic-bezier(.22,.9,.3,1.15);
}
.dtIcon:is(:hover, [data-live="true"]) .dtIconSvg,
.dt-appicon:is(:hover, :focus-within) .dtIcon .dtIconSvg,
.dt-nav__app:is(:hover, :focus-within) .dtIcon .dtIconSvg,
.dt-start__app:is(:hover, :focus-within) .dtIcon .dtIconSvg,
.shell-dock button:is(:hover, :focus-within) .dtIcon .dtIconSvg {
  transform: perspective(340px) rotateX(4.5deg) rotateY(-5.5deg) scale(1.02);
  -webkit-transform: perspective(340px) rotateX(4.5deg) rotateY(-5.5deg) scale(1.02);
}
.dtIconGlyph {
  transform-box: view-box; -webkit-transform-box: view-box;
  will-change: transform;
  transition: transform .55s cubic-bezier(.22,.9,.3,1.15);
  -webkit-transition: -webkit-transform .55s cubic-bezier(.22,.9,.3,1.15), transform .55s cubic-bezier(.22,.9,.3,1.15);
}
.dtIcon:is(:hover, [data-live="true"]) .dtIconGlyph,
.dt-appicon:is(:hover, :focus-within) .dtIcon .dtIconGlyph,
.dt-nav__app:is(:hover, :focus-within) .dtIcon .dtIconGlyph,
.dt-start__app:is(:hover, :focus-within) .dtIcon .dtIconGlyph,
.shell-dock button:is(:hover, :focus-within) .dtIcon .dtIconGlyph {
  transform: translateY(calc(var(--dt-fan) * -2.2px)) scale(calc(1 + var(--dt-fan) * .035));
  -webkit-transform: translateY(calc(var(--dt-fan) * -2.2px)) scale(calc(1 + var(--dt-fan) * .035));
}
html.dt-icon-fx .dtIconGlyph { transition: none; -webkit-transition: none; }
.dtIconSheenBand {
  transform-box: view-box; -webkit-transform-box: view-box;
  transform: translateX(-100px); -webkit-transform: translateX(-100px);
  opacity: 0; will-change: transform, opacity; pointer-events: none;
}
.dtIcon:is(:hover, [data-live="true"]) .dtIconSheenBand,
.dt-appicon:is(:hover, :focus-within) .dtIcon .dtIconSheenBand,
.dt-nav__app:is(:hover, :focus-within) .dtIcon .dtIconSheenBand,
.dt-start__app:is(:hover, :focus-within) .dtIcon .dtIconSheenBand,
.shell-dock button:is(:hover, :focus-within) .dtIcon .dtIconSheenBand {
  animation: dtIconSheen .9s cubic-bezier(.3,.5,.25,1) forwards;
  -webkit-animation: dtIconSheen .9s cubic-bezier(.3,.5,.25,1) forwards;
}
@keyframes dtIconSheen {
  0% { opacity: 0; transform: translateX(-100px); }
  16% { opacity: .42; }
  60% { opacity: .3; }
  100% { opacity: 0; transform: translateX(118px); }
}
.dtIconMid { transform-box: view-box; -webkit-transform-box: view-box; }

/* ---- the signature stories: ONE motion per drawn icon, keyed on
        [data-motion]. Each story is a one-shot that starts and ends in the
        base pose (the live flag can drop mid-story with no visible snap) and
        touches transform/opacity/filter only — idle stays static, no ambient
        loops. The root declares its players as custom properties; the live
        activation below turns exactly those players on. ---- */
.dtIconStory { transform-box: view-box; -webkit-transform-box: view-box; will-change: transform, filter; }
.dtIcon-m-hand { transform-box: view-box; -webkit-transform-box: view-box; transform-origin: 49px 51px; }
.dtIcon-m-card, .dtIcon-m-node, .dtIcon-m-cursor, .dtIcon-m-plug, .dtIcon-m-bar,
.dtIcon-m-dot, .dtIcon-m-pane {
  transform-box: fill-box; -webkit-transform-box: fill-box; transform-origin: 50% 50%;
}
.dtIcon[data-motion="meter"] .dtIcon-m-bar,
.dtIcon[data-motion="wave"] .dtIcon-m-bar { transform-origin: 50% 100%; }
.dtIcon-m-page-l { transform-box: fill-box; -webkit-transform-box: fill-box; transform-origin: 100% 50%; }
.dtIcon-m-page-r { transform-box: fill-box; -webkit-transform-box: fill-box; transform-origin: 0% 50%; }
.dtIcon-m-needle, .dtIcon-m-dial { transform-box: view-box; -webkit-transform-box: view-box; transform-origin: 48px 48px; }
.dtIcon-m-slate { transform-box: view-box; -webkit-transform-box: view-box; transform-origin: 30.5px 46px; }
.dtIcon-m-tap { transform-box: view-box; -webkit-transform-box: view-box; transform-origin: 44px 62px; }
.dtIcon-m-run, .dtIcon-m-plate { transform-box: view-box; -webkit-transform-box: view-box; }
.dtIcon-m-shine {
  transform-box: view-box; -webkit-transform-box: view-box;
  opacity: 0; will-change: transform, opacity; pointer-events: none;
}
.dtIcon[data-motion="shine"] .dtIconSheenBand { display: none; }

/* ---- the ambient signature loops (campaign v3 · R1-b): ONE slow idle
        motion per mark, driven by the app's function, 1.2–16s,
        alternate+infinite with staggered negative delays (--dt-i),
        transform/opacity/filter only (plus the sanctioned stroke-dashoffset
        flow). Declared BEFORE the live activation below, so a hover or the
        tile's data-live flag swaps the loop for the one-shot story and the
        loop resumes untouched on leave. The whole layer sits inside the
        reduced-motion guard; the os data-motion="reduced" root attribute
        kills it independently. ---- */
@media not (prefers-reduced-motion: reduce) {
  .dtIcon[data-motion="bounce"] .dtIconStory { animation: dtAmb-pulse 4s ease-in-out infinite alternate; }
  .dtIcon[data-motion="sweep"] .dtIcon-m-hand { animation: dtAmb-hand 12s linear infinite; }
  .dtIcon[data-motion="kanban"] .dtIcon-m-card { animation: dtAmb-bob 3.2s ease-in-out infinite alternate; animation-delay: calc(var(--dt-i, 0) * -420ms); }
  .dtIcon[data-motion="blink"] .dtIcon-m-cursor { animation: dtAmb-caret 2.4s ease-in-out infinite; }
  .dtIcon[data-motion="ripple"] .dtIcon-m-node { animation: dtAmb-node 3.6s ease-in-out infinite; animation-delay: calc(var(--dt-i, 0) * -700ms); }
  .dtIcon[data-motion="pulse"] .dtIcon-m-plug { animation: dtAmb-plug 4s ease-in-out infinite alternate; }
  .dtIcon[data-motion="meter"] .dtIcon-m-bar { animation: dtAmb-meter 2.8s ease-in-out infinite alternate; animation-delay: calc(var(--dt-i, 0) * -380ms); }
  .dtIcon[data-motion="draw"] .dtIcon-m-run { stroke-dasharray: 7 9; animation: dtAmb-flow 2.6s linear infinite; }
  .dtIcon[data-motion="draw"] .dtIcon-m-dot { animation: dtAmb-dot 2.6s ease-in-out infinite alternate; }
  .dtIcon[data-motion="lift"] .dtIcon-m-page-l { animation: dtAmb-page-l 5.2s ease-in-out infinite alternate; }
  .dtIcon[data-motion="lift"] .dtIcon-m-page-r { animation: dtAmb-page-r 5.2s ease-in-out infinite alternate; }
  .dtIcon[data-motion="compass"] .dtIcon-m-needle { animation: dtAmb-needle 7s ease-in-out infinite alternate; }
  .dtIcon[data-motion="lattice"] .dtIcon-m-pane { animation: dtAmb-pane 4.8s ease-in-out infinite alternate; animation-delay: calc(var(--dt-i, 0) * -460ms); }
  .dtIcon[data-motion="turn"] .dtIconStory { animation: dtAmb-turn 16s linear infinite; }
  .dtIcon[data-motion="sway"] .dtIconStory { animation: dtAmb-signal 4.8s ease-in-out infinite alternate; }
  .dtIcon[data-motion="spin"] .dtIcon-m-slate { animation: dtAmb-sway 6s ease-in-out infinite alternate; }
  .dtIcon[data-motion="wave"] .dtIcon-m-bar { animation: dtAmb-eq 1.2s ease-in-out infinite alternate; animation-delay: calc(var(--dt-i, 0) * -180ms); }
  .dtIcon[data-motion="breathe"] .dtIconStory { animation: dtAmb-scope 5s ease-in-out infinite alternate; }
  .dtIcon[data-motion="tap"] .dtIconStory { animation: dtAmb-flicker 3.2s ease-in-out infinite; }
  .dtIcon[data-motion="glow"] .dtIcon-m-tick { animation: dtAmb-tick 2.4s ease-in-out infinite alternate; animation-delay: calc(var(--dt-i, 0) * -400ms); }
  .dtIcon[data-motion="dial"] .dtIcon-m-dial { animation: dtAmb-dial 16s linear infinite; }
  .dtIcon[data-motion="slide"] .dtIcon-m-plate { animation: dtAmb-plate 5.2s ease-in-out infinite alternate; animation-delay: calc(var(--dt-i, 0) * -600ms); }
  .dtIcon[data-motion="shine"] .dtIconStory { animation: dtAmb-saddle 3.4s ease-in-out infinite alternate; }
}
[data-motion="reduced"] .dtIcon .dtIconStory,
[data-motion="reduced"] .dtIcon [class^="dtIcon-m-"] { animation: none !important; }

/* the ambient loop keyframes: ping-pong pairs ride the alternate direction,
   the cyclic ones (hand, gear, dial, flow, caret, flicker) end where they start */
@keyframes dtAmb-pulse { from { transform: scale(1); } to { transform: scale(1.05); } }
@keyframes dtAmb-hand { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes dtAmb-bob { from { transform: translateY(0); } to { transform: translateY(-1.5px); } }
@keyframes dtAmb-caret { 0%, 55% { opacity: 1; } 70%, 86% { opacity: .15; } 100% { opacity: 1; } }
@keyframes dtAmb-node { 0% { transform: scale(1); opacity: 1; } 45% { transform: scale(1.32); opacity: .5; } 100% { transform: scale(1); opacity: 1; } }
@keyframes dtAmb-plug { from { transform: scale(1); } to { transform: scale(1.06); } }
@keyframes dtAmb-meter { from { transform: scaleY(.72); } to { transform: scaleY(1.08); } }
@keyframes dtAmb-flow { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -32; } }
@keyframes dtAmb-dot { from { transform: scale(1); } to { transform: scale(1.25); } }
@keyframes dtAmb-page-l { from { transform: rotate(0deg); } to { transform: rotate(-2.6deg); } }
@keyframes dtAmb-page-r { from { transform: rotate(0deg); } to { transform: rotate(2.6deg); } }
@keyframes dtAmb-needle { from { transform: rotate(-6deg); } to { transform: rotate(6deg); } }
@keyframes dtAmb-pane { from { opacity: .95; transform: scale(1); } to { opacity: .5; transform: scale(1.06); } }
@keyframes dtAmb-turn { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes dtAmb-signal { from { transform: scale(1); } to { transform: scale(1.045); } }
@keyframes dtAmb-sway { from { transform: rotate(-2.5deg); } to { transform: rotate(3.5deg); } }
@keyframes dtAmb-eq { from { transform: scaleY(1); } to { transform: scaleY(.42); } }
@keyframes dtAmb-scope { from { transform: rotate(-2deg); } to { transform: rotate(2deg); } }
@keyframes dtAmb-flicker { 0% { filter: brightness(1); } 28% { filter: brightness(1.18); } 46% { filter: brightness(1.03); } 64% { filter: brightness(1.24); } 82% { filter: brightness(1.06); } 100% { filter: brightness(1); } }
@keyframes dtAmb-tick { from { transform: translateX(0); } to { transform: translateX(2.5px); } }
@keyframes dtAmb-dial { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes dtAmb-plate { from { transform: translateX(-1.5px); } to { transform: translateX(1.5px); } }
@keyframes dtAmb-saddle { from { transform: translateY(0) rotate(0deg); } to { transform: translateY(-1.8px) rotate(1deg); } }

/* the players each story declares (the root sets only its own) */
.dtIcon[data-motion="bounce"] { --dt-story: dti-bounce .6s cubic-bezier(.3,1.35,.45,1); }
.dtIcon[data-motion="sweep"] { --dt-hand: dti-sweep .75s cubic-bezier(.3,.8,.3,1); }
.dtIcon[data-motion="kanban"] { --dt-card: dti-card .6s cubic-bezier(.3,1.3,.4,1); }
.dtIcon[data-motion="blink"] { --dt-cursor: dti-blink .8s linear; }
.dtIcon[data-motion="ripple"] { --dt-node: dti-node .7s cubic-bezier(.3,.9,.35,1); }
.dtIcon[data-motion="pulse"] { --dt-plug: dti-plug .55s cubic-bezier(.3,1.3,.4,1); }
.dtIcon[data-motion="meter"] { --dt-bar: dti-meter .55s cubic-bezier(.3,1.2,.4,1); }
.dtIcon[data-motion="wave"] { --dt-bar: dti-wave .72s ease-in-out; }
.dtIcon[data-motion="draw"] { --dt-run: dti-draw .5s cubic-bezier(.25,.7,.3,1); --dt-dot: dti-dot .45s cubic-bezier(.3,1.4,.45,1); }
.dtIcon[data-motion="lift"] { --dt-page-l: dti-page-l .65s cubic-bezier(.3,.9,.3,1); --dt-page-r: dti-page-r .65s cubic-bezier(.3,.9,.3,1); }
.dtIcon[data-motion="compass"] { --dt-needle: dti-needle .85s ease-in-out; }
.dtIcon[data-motion="lattice"] { --dt-pane: dti-pane .5s cubic-bezier(.3,1.3,.4,1); }
.dtIcon[data-motion="turn"] { --dt-story: dti-turn .55s cubic-bezier(.32,.72,.24,1); }
.dtIcon[data-motion="sway"] { --dt-story: dti-sway 1s ease-in-out; }
.dtIcon[data-motion="spin"] { --dt-slate: dti-slate .62s cubic-bezier(.3,.9,.3,1); }
.dtIcon[data-motion="breathe"] { --dt-story: dti-breathe .9s ease-in-out; }
.dtIcon[data-motion="tap"] { --dt-tap: dti-tap .5s cubic-bezier(.3,.9,.35,1); }
.dtIcon[data-motion="glow"] { --dt-story: dti-furnace .9s ease-in-out; }
.dtIcon[data-motion="dial"] { --dt-dial: dti-dial .7s cubic-bezier(.32,.72,.24,1); }
.dtIcon[data-motion="slide"] { --dt-plate: dti-plate .6s cubic-bezier(.3,1.2,.4,1); }
.dtIcon[data-motion="shine"] { --dt-shine: dti-shine .85s cubic-bezier(.3,.6,.3,1); }

/* the activation of the players while the icon is live */
.dtIcon:is(:hover, [data-live="true"]) .dtIconStory,
.dt-appicon:is(:hover, :focus-within) .dtIcon .dtIconStory,
.dt-nav__app:is(:hover, :focus-within) .dtIcon .dtIconStory,
.dt-start__app:is(:hover, :focus-within) .dtIcon .dtIconStory,
.shell-dock button:is(:hover, :focus-within) .dtIcon .dtIconStory { animation: var(--dt-story, none) both; }
.dtIcon:is(:hover, [data-live="true"]) .dtIcon-m-hand,
.dt-appicon:is(:hover, :focus-within) .dtIcon .dtIcon-m-hand,
.dt-nav__app:is(:hover, :focus-within) .dtIcon .dtIcon-m-hand,
.dt-start__app:is(:hover, :focus-within) .dtIcon .dtIcon-m-hand,
.shell-dock button:is(:hover, :focus-within) .dtIcon .dtIcon-m-hand { animation: var(--dt-hand, none) both; }
.dtIcon:is(:hover, [data-live="true"]) .dtIcon-m-card,
.dt-appicon:is(:hover, :focus-within) .dtIcon .dtIcon-m-card,
.dt-nav__app:is(:hover, :focus-within) .dtIcon .dtIcon-m-card,
.dt-start__app:is(:hover, :focus-within) .dtIcon .dtIcon-m-card,
.shell-dock button:is(:hover, :focus-within) .dtIcon .dtIcon-m-card { animation: var(--dt-card, none) both; }
.dtIcon:is(:hover, [data-live="true"]) .dtIcon-m-cursor,
.dt-appicon:is(:hover, :focus-within) .dtIcon .dtIcon-m-cursor,
.dt-nav__app:is(:hover, :focus-within) .dtIcon .dtIcon-m-cursor,
.dt-start__app:is(:hover, :focus-within) .dtIcon .dtIcon-m-cursor,
.shell-dock button:is(:hover, :focus-within) .dtIcon .dtIcon-m-cursor { animation: var(--dt-cursor, none) both; }
.dtIcon:is(:hover, [data-live="true"]) .dtIcon-m-node,
.dt-appicon:is(:hover, :focus-within) .dtIcon .dtIcon-m-node,
.dt-nav__app:is(:hover, :focus-within) .dtIcon .dtIcon-m-node,
.dt-start__app:is(:hover, :focus-within) .dtIcon .dtIcon-m-node,
.shell-dock button:is(:hover, :focus-within) .dtIcon .dtIcon-m-node {
  animation: var(--dt-node, none) both; animation-delay: calc(var(--dt-i, 0) * 110ms);
}
.dtIcon:is(:hover, [data-live="true"]) .dtIcon-m-plug,
.dt-appicon:is(:hover, :focus-within) .dtIcon .dtIcon-m-plug,
.dt-nav__app:is(:hover, :focus-within) .dtIcon .dtIcon-m-plug,
.dt-start__app:is(:hover, :focus-within) .dtIcon .dtIcon-m-plug,
.shell-dock button:is(:hover, :focus-within) .dtIcon .dtIcon-m-plug { animation: var(--dt-plug, none) both; }
.dtIcon:is(:hover, [data-live="true"]) .dtIcon-m-bar,
.dt-appicon:is(:hover, :focus-within) .dtIcon .dtIcon-m-bar,
.dt-nav__app:is(:hover, :focus-within) .dtIcon .dtIcon-m-bar,
.dt-start__app:is(:hover, :focus-within) .dtIcon .dtIcon-m-bar,
.shell-dock button:is(:hover, :focus-within) .dtIcon .dtIcon-m-bar {
  animation: var(--dt-bar, none) both; animation-delay: calc(var(--dt-i, 0) * 75ms);
}
.dtIcon:is(:hover, [data-live="true"]) .dtIcon-m-run,
.dt-appicon:is(:hover, :focus-within) .dtIcon .dtIcon-m-run,
.dt-nav__app:is(:hover, :focus-within) .dtIcon .dtIcon-m-run,
.dt-start__app:is(:hover, :focus-within) .dtIcon .dtIcon-m-run,
.shell-dock button:is(:hover, :focus-within) .dtIcon .dtIcon-m-run {
  animation: var(--dt-run, none) both; animation-delay: calc(var(--dt-i, 0) * 110ms);
}
.dtIcon:is(:hover, [data-live="true"]) .dtIcon-m-dot,
.dt-appicon:is(:hover, :focus-within) .dtIcon .dtIcon-m-dot,
.dt-nav__app:is(:hover, :focus-within) .dtIcon .dtIcon-m-dot,
.dt-start__app:is(:hover, :focus-within) .dtIcon .dtIcon-m-dot,
.shell-dock button:is(:hover, :focus-within) .dtIcon .dtIcon-m-dot {
  animation: var(--dt-dot, none) both; animation-delay: calc(var(--dt-i, 0) * 110ms);
}
.dtIcon:is(:hover, [data-live="true"]) .dtIcon-m-page-l,
.dt-appicon:is(:hover, :focus-within) .dtIcon .dtIcon-m-page-l,
.dt-nav__app:is(:hover, :focus-within) .dtIcon .dtIcon-m-page-l,
.dt-start__app:is(:hover, :focus-within) .dtIcon .dtIcon-m-page-l,
.shell-dock button:is(:hover, :focus-within) .dtIcon .dtIcon-m-page-l { animation: var(--dt-page-l, none) both; }
.dtIcon:is(:hover, [data-live="true"]) .dtIcon-m-page-r,
.dt-appicon:is(:hover, :focus-within) .dtIcon .dtIcon-m-page-r,
.dt-nav__app:is(:hover, :focus-within) .dtIcon .dtIcon-m-page-r,
.dt-start__app:is(:hover, :focus-within) .dtIcon .dtIcon-m-page-r,
.shell-dock button:is(:hover, :focus-within) .dtIcon .dtIcon-m-page-r { animation: var(--dt-page-r, none) both; }
.dtIcon:is(:hover, [data-live="true"]) .dtIcon-m-needle,
.dt-appicon:is(:hover, :focus-within) .dtIcon .dtIcon-m-needle,
.dt-nav__app:is(:hover, :focus-within) .dtIcon .dtIcon-m-needle,
.dt-start__app:is(:hover, :focus-within) .dtIcon .dtIcon-m-needle,
.shell-dock button:is(:hover, :focus-within) .dtIcon .dtIcon-m-needle { animation: var(--dt-needle, none) both; }
.dtIcon:is(:hover, [data-live="true"]) .dtIcon-m-pane,
.dt-appicon:is(:hover, :focus-within) .dtIcon .dtIcon-m-pane,
.dt-nav__app:is(:hover, :focus-within) .dtIcon .dtIcon-m-pane,
.dt-start__app:is(:hover, :focus-within) .dtIcon .dtIcon-m-pane,
.shell-dock button:is(:hover, :focus-within) .dtIcon .dtIcon-m-pane {
  animation: var(--dt-pane, none) both; animation-delay: calc(var(--dt-i, 0) * 70ms);
}
.dtIcon:is(:hover, [data-live="true"]) .dtIcon-m-slate,
.dt-appicon:is(:hover, :focus-within) .dtIcon .dtIcon-m-slate,
.dt-nav__app:is(:hover, :focus-within) .dtIcon .dtIcon-m-slate,
.dt-start__app:is(:hover, :focus-within) .dtIcon .dtIcon-m-slate,
.shell-dock button:is(:hover, :focus-within) .dtIcon .dtIcon-m-slate { animation: var(--dt-slate, none) both; }
.dtIcon:is(:hover, [data-live="true"]) .dtIcon-m-tap,
.dt-appicon:is(:hover, :focus-within) .dtIcon .dtIcon-m-tap,
.dt-nav__app:is(:hover, :focus-within) .dtIcon .dtIcon-m-tap,
.dt-start__app:is(:hover, :focus-within) .dtIcon .dtIcon-m-tap,
.shell-dock button:is(:hover, :focus-within) .dtIcon .dtIcon-m-tap { animation: var(--dt-tap, none) both; }
.dtIcon:is(:hover, [data-live="true"]) .dtIcon-m-dial,
.dt-appicon:is(:hover, :focus-within) .dtIcon .dtIcon-m-dial,
.dt-nav__app:is(:hover, :focus-within) .dtIcon .dtIcon-m-dial,
.dt-start__app:is(:hover, :focus-within) .dtIcon .dtIcon-m-dial,
.shell-dock button:is(:hover, :focus-within) .dtIcon .dtIcon-m-dial { animation: var(--dt-dial, none) both; }
.dtIcon:is(:hover, [data-live="true"]) .dtIcon-m-plate,
.dt-appicon:is(:hover, :focus-within) .dtIcon .dtIcon-m-plate,
.dt-nav__app:is(:hover, :focus-within) .dtIcon .dtIcon-m-plate,
.dt-start__app:is(:hover, :focus-within) .dtIcon .dtIcon-m-plate,
.shell-dock button:is(:hover, :focus-within) .dtIcon .dtIcon-m-plate {
  animation: var(--dt-plate, none) both; animation-delay: calc(var(--dt-i, 0) * 90ms);
}
.dtIcon:is(:hover, [data-live="true"]) .dtIcon-m-shine,
.dt-appicon:is(:hover, :focus-within) .dtIcon .dtIcon-m-shine,
.dt-nav__app:is(:hover, :focus-within) .dtIcon .dtIcon-m-shine,
.dt-start__app:is(:hover, :focus-within) .dtIcon .dtIcon-m-shine,
.shell-dock button:is(:hover, :focus-within) .dtIcon .dtIcon-m-shine { animation: var(--dt-shine, none) both; }
/* the furnace story also pushes the contact glow past its usual rise */
.dtIcon[data-motion="glow"]:is(:hover, [data-live="true"]) .dtIconGlow,
.dt-appicon:is(:hover, :focus-within) .dtIcon[data-motion="glow"] .dtIconGlow,
.dt-nav__app:is(:hover, :focus-within) .dtIcon[data-motion="glow"] .dtIconGlow,
.dt-start__app:is(:hover, :focus-within) .dtIcon[data-motion="glow"] .dtIconGlow,
.shell-dock button:is(:hover, :focus-within) .dtIcon[data-motion="glow"] .dtIconGlow { --dt-glow: .85; }

/* the story keyframes */
@keyframes dti-bounce { 0% { transform: translateY(0); } 30% { transform: translateY(-5.5px); } 55% { transform: translateY(0); } 72% { transform: translateY(-2.2px); } 100% { transform: translateY(0); } }
@keyframes dti-sweep { 0% { transform: rotate(0deg); } 42% { transform: rotate(-42deg); } 100% { transform: rotate(0deg); } }
@keyframes dti-card { 0% { transform: translateY(0); } 40% { transform: translateY(-4px); } 100% { transform: translateY(0); } }
@keyframes dti-blink { 0%, 20% { opacity: 1; } 25%, 45% { opacity: .12; } 50%, 70% { opacity: 1; } 75%, 95% { opacity: .12; } 100% { opacity: 1; } }
@keyframes dti-node { 0% { transform: scale(1); opacity: 1; } 45% { transform: scale(1.6); opacity: .45; } 100% { transform: scale(1); opacity: 1; } }
@keyframes dti-plug { 0% { transform: scale(1); } 40% { transform: scale(1.09); } 100% { transform: scale(1); } }
@keyframes dti-meter { 0% { transform: scaleY(.35); } 62% { transform: scaleY(1.08); } 100% { transform: scaleY(1); } }
@keyframes dti-wave { 0% { transform: scaleY(1); } 35% { transform: scaleY(.45); } 70% { transform: scaleY(1.18); } 100% { transform: scaleY(1); } }
@keyframes dti-draw { 0% { transform: scale(.08); opacity: 0; } 35% { opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
@keyframes dti-dot { 0% { transform: scale(0); opacity: 0; } 55% { transform: scale(1.35); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
@keyframes dti-page-l { 0% { transform: rotate(0deg); } 45% { transform: rotate(-6deg) translateY(-1.6px); } 100% { transform: rotate(0deg); } }
@keyframes dti-page-r { 0% { transform: rotate(0deg); } 45% { transform: rotate(6deg) translateY(-1.6px); } 100% { transform: rotate(0deg); } }
@keyframes dti-needle { 0% { transform: rotate(0deg); } 35% { transform: rotate(-9deg); } 70% { transform: rotate(5deg); } 100% { transform: rotate(0deg); } }
@keyframes dti-pane { 0% { transform: scale(1); } 40% { transform: scale(1.14); } 100% { transform: scale(1); } }
@keyframes dti-turn { 0% { transform: rotate(0deg); } 100% { transform: rotate(90deg); } }
@keyframes dti-sway { 0% { transform: rotate(0deg); } 30% { transform: rotate(-4deg); } 65% { transform: rotate(3deg); } 100% { transform: rotate(0deg); } }
@keyframes dti-slate { 0% { transform: rotate(0deg); } 35% { transform: rotate(-14deg); } 75% { transform: rotate(2.5deg); } 100% { transform: rotate(0deg); } }
@keyframes dti-breathe { 0% { transform: scale(1); } 45% { transform: scale(1.075); } 100% { transform: scale(1); } }
@keyframes dti-tap { 0% { transform: rotate(0deg); } 30% { transform: rotate(7deg); } 55% { transform: rotate(-2deg); } 100% { transform: rotate(0deg); } }
@keyframes dti-furnace { 0% { filter: brightness(1); } 45% { filter: brightness(1.22) saturate(1.12); } 100% { filter: brightness(1); } }
@keyframes dti-dial { 0% { transform: rotate(0deg); } 100% { transform: rotate(120deg); } }
@keyframes dti-plate { 0% { transform: translateX(0); } 40% { transform: translateX(3px); } 100% { transform: translateX(0); } }
@keyframes dti-shine { 0% { transform: translateX(-30px); opacity: 0; } 20% { opacity: .5; } 65% { opacity: .38; } 100% { transform: translateX(52px); opacity: 0; } }

@media (hover: none), (pointer: coarse) {
  .dtIcon:is(:hover, [data-live="true"]) .dtIconSvg,
  .dt-appicon:is(:hover, :focus-within) .dtIcon .dtIconSvg,
  .dt-nav__app:is(:hover, :focus-within) .dtIcon .dtIconSvg,
  .dt-start__app:is(:hover, :focus-within) .dtIcon .dtIconSvg,
  .shell-dock button:is(:hover, :focus-within) .dtIcon .dtIconSvg,
  .dtIcon:is(:hover, [data-live="true"]) .dtIconGlyph,
  .dt-appicon:is(:hover, :focus-within) .dtIcon .dtIconGlyph,
  .dt-nav__app:is(:hover, :focus-within) .dtIcon .dtIconGlyph,
  .dt-start__app:is(:hover, :focus-within) .dtIcon .dtIconGlyph,
  .shell-dock button:is(:hover, :focus-within) .dtIcon .dtIconGlyph {
    transform: none; -webkit-transform: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .dtIcon, .dtIconSvg, .dtIconGlyph, .dtIconStory, .dtIconSheenBand, .dtIconGlow, .dtIconMid,
  .dtIcon [class^="dtIcon-m-"] {
    animation: none !important; -webkit-animation: none !important;
    transition: none !important; -webkit-transition: none !important;
  }
  .dtIcon:is(:hover, [data-live="true"]) .dtIconSvg,
  .dt-appicon:is(:hover, :focus-within) .dtIcon .dtIconSvg,
  .dt-nav__app:is(:hover, :focus-within) .dtIcon .dtIconSvg,
  .dt-start__app:is(:hover, :focus-within) .dtIcon .dtIconSvg,
  .shell-dock button:is(:hover, :focus-within) .dtIcon .dtIconSvg,
  .dtIcon:is(:hover, [data-live="true"]) .dtIconGlyph,
  .dt-appicon:is(:hover, :focus-within) .dtIcon .dtIconGlyph,
  .dt-nav__app:is(:hover, :focus-within) .dtIcon .dtIconGlyph,
  .dt-start__app:is(:hover, :focus-within) .dtIcon .dtIconGlyph,
  .shell-dock button:is(:hover, :focus-within) .dtIcon .dtIconGlyph {
    transform: none; -webkit-transform: none;
  }
}
`;

let iconCssReady = false;

/** Injects the shared stylesheet of the set exactly once per document. */
function ensureIconCss(): void {
  if (iconCssReady || typeof document === "undefined") return;
  iconCssReady = true;
  const tag = document.createElement("style");
  tag.setAttribute("data-dt-icons", "");
  tag.textContent = ICON_CSS;
  document.head.appendChild(tag);
}

let iconMotionChecked = false;

/**
 * Registers the animatable custom properties and gates the custom-property
 * loops behind the dt-icon-fx class (browsers without the @property API
 * never run them, so nothing flips discretely).
 */
function useIconMotion(): void {
  useEffect(() => {
    if (iconMotionChecked) return;
    iconMotionChecked = true;
    const css = typeof CSS === "undefined" ? null : (CSS as unknown as { registerProperty?: (p: HoudiniProp) => void });
    if (css && typeof css.registerProperty === "function") {
      for (const prop of HOUDINI_PROPS) {
        try {
          css.registerProperty(prop);
        } catch {
          /* already registered by the stylesheet */
        }
      }
      document.documentElement.classList.add("dt-icon-fx");
    }
  }, []);
}

/* ------------------------------- the factory ------------------------------- */
type AppIconSpec = {
  /** the guide color of the app (the story the icon catalog row declares) */
  story: string;
  /** the deep shade the gradient settles into */
  deep: string;
  /** the warm subtone of the mid layer, contours and contact ellipse */
  soft: string;
  /** the signature motion token — the data-motion hook the stories key on */
  motion: string;
  /** the drawn glyph: thick ivory strokes with a translucent filled backing */
  glyph: ReactElement;
};

/** The asymmetric squircle of the tile face: tighter shoulders, heavier base. */
const SQUIRCLE = "M22 0 L74 0 Q96 0 96 22 L96 66 Q96 96 66 96 L30 96 Q0 96 0 66 L0 22 Q0 0 22 0 Z";

/** the per-part stagger index of a story: the motion delays read `--dt-i` */
const si = (index: number): CSSProperties => ({ "--dt-i": index }) as CSSProperties;

/**
 * Builds one premium icon component over a story palette and glyph.
 *
 * @param key the registry id the iconset field points at (namespaces every id)
 * @param spec the story colors and the drawn glyph of the app
 */
function defineAppIcon(key: string, spec: AppIconSpec): ComponentType<AppIconProps> {
  const uid = `dti-${key}`;
  function AppIcon({ size, live }: AppIconProps) {
    ensureIconCss();
    useIconMotion();
    const vars = {
      "--story-glow": `${spec.story}73`,
      "--story-shadow": `${spec.deep}42`,
      "--story-shadow-soft": `${spec.deep}24`,
    } as CSSProperties;
    if (size !== undefined) {
      vars.width = size;
      vars.height = size;
    }
    return (
      <span
        className="dtIcon"
        data-motion={spec.motion}
        data-live={live ? "true" : undefined}
        style={vars}
        aria-hidden="true"
      >
        <span className="dtIconGlow" />
        <svg className="dtIconSvg" viewBox="0 0 96 96" data-motion={spec.motion} aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={spec.story} />
              <stop offset=".6" stopColor={spec.story} />
              <stop offset="1" stopColor={spec.deep} />
            </linearGradient>
            <linearGradient id={`${uid}-gloss`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffffff" stopOpacity=".32" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            <radialGradient id={`${uid}-orb`} cx=".5" cy=".5" r=".5">
              <stop offset="0" stopColor={spec.soft} stopOpacity=".9" />
              <stop offset=".35" stopColor={spec.soft} stopOpacity=".5" />
              <stop offset="1" stopColor={spec.soft} stopOpacity="0" />
            </radialGradient>
            <linearGradient id={`${uid}-edge-l`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={spec.soft} stopOpacity="0" />
              <stop offset=".45" stopColor={spec.soft} stopOpacity=".3" />
              <stop offset="1" stopColor={spec.soft} stopOpacity=".7" />
            </linearGradient>
            <linearGradient id={`${uid}-edge-d`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={spec.soft} stopOpacity="0" />
              <stop offset=".5" stopColor={spec.soft} stopOpacity=".22" />
              <stop offset="1" stopColor={spec.soft} stopOpacity=".55" />
            </linearGradient>
            <linearGradient id={`${uid}-sheen`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
              <stop offset=".45" stopColor="#ffffff" stopOpacity=".5" />
              <stop offset=".55" stopColor="#ffffff" stopOpacity=".5" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            <filter id={`${uid}-soft`} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="3" />
            </filter>
            <filter id={`${uid}-wide`} x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="8" />
            </filter>
            <filter id={`${uid}-lift`} x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor={spec.deep} floodOpacity=".38" />
            </filter>
            <filter id={`${uid}-grain`} x="0%" y="0%" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" result="n" />
              <feColorMatrix in="n" type="saturate" values="0" />
              <feComposite operator="in" in2="SourceGraphic" />
            </filter>
            <clipPath id={`${uid}-clip`}>
              <path d={SQUIRCLE} />
            </clipPath>
          </defs>

          {/* the face: gradient squircle with a soft top gloss */}
          <path d={SQUIRCLE} fill={`url(#${uid}-bg)`} />
          <path d={SQUIRCLE} fill={`url(#${uid}-gloss)`} opacity=".5" />

          <g clipPath={`url(#${uid}-clip)`}>
            {/* the mid layer: story orbs breathing over a pedestal band */}
            <g className="dtIconMid">
              <circle cx="48" cy="40" r="25" fill={`url(#${uid}-orb)`} filter={`url(#${uid}-wide)`} opacity=".85" />
              <rect x="-12" y="56" width="120" height="44" fill={spec.soft} opacity=".3" filter={`url(#${uid}-soft)`} />
            </g>

            {/* two blurred inner contours of the squircle */}
            <path
              d={SQUIRCLE}
              fill="none"
              stroke={`url(#${uid}-edge-d)`}
              strokeWidth="6"
              filter={`url(#${uid}-wide)`}
              opacity=".55"
              transform="translate(1.4 1.9) scale(0.97)"
            />
            <path
              d={SQUIRCLE}
              fill="none"
              stroke={`url(#${uid}-edge-l)`}
              strokeWidth="2.5"
              filter={`url(#${uid}-soft)`}
              opacity=".5"
            />

            {/* the contact ellipse at the base */}
            <ellipse
              cx="48"
              cy="94"
              rx="30"
              ry="7"
              fill={`url(#${uid}-orb)`}
              filter={`url(#${uid}-soft)`}
              opacity=".55"
            />

            {/* the sheen band sweeping once on hover */}
            <g className="dtIconSheenBand">
              <rect x="-11" y="-24" width="26" height="144" fill={`url(#${uid}-sheen)`} transform="skewX(-16)" />
            </g>

            {/* the discrete film grain */}
            <path d={SQUIRCLE} fill="#ffffff" filter={`url(#${uid}-grain)`} opacity=".08" />
          </g>

          {/* the glyph: thick ivory strokes lifting toward the viewer */}
          <g filter={`url(#${uid}-lift)`}>
            <g
              className="dtIconGlyph"
              fill="none"
              stroke={IVORY}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <g className="dtIconStory">{spec.glyph}</g>
            </g>
          </g>
        </svg>
      </span>
    );
  }
  AppIcon.displayName = `${key}AppIcon`;
  return AppIcon;
}

/* ------------------------------- the icons --------------------------------- */

/** Chat — the assistant of the OS: a speech bubble carrying the brand star. */
export const ChatIcon = defineAppIcon("chat", {
  motion: "bounce",
  story: "#ff8c42",
  deep: "#b6520e",
  soft: "#ffdcbd",
  glyph: (
    <>
      <path
        d="M31 29 H65 Q70 29 70 34 V55 Q70 60 65 60 H46.5 L37 68.5 Q33.5 71.2 33.5 66.6 V60 H31 Q26 60 26 55 V34 Q26 29 31 29 Z"
        fill={BACKING}
      />
      <path
        d="M48 35.5 L51.2 43.3 L59 46.5 L51.2 49.7 L48 57.5 L44.8 49.7 L37 46.5 L44.8 43.3 Z"
        fill={IVORY}
        stroke="none"
      />
    </>
  ),
});

/** History — the session archive: a clock with a curved rewind arrow. */
export const HistoryIcon = defineAppIcon("history", {
  motion: "sweep",
  story: "#d9b98c",
  deep: "#9a7444",
  soft: "#f4e6cb",
  glyph: (
    <>
      <circle cx="49" cy="51" r="16.5" />
      <g className="dtIcon-m-hand">
        <path d="M49 42.5 V51 L56 55" />
      </g>
      <path d="M28.5 35 Q28.5 24.5 39 24.5" strokeWidth={STROKE_SOFT} />
      <path d="M39 24.5 L33.6 21.2 M39 24.5 L34 28.2" strokeWidth={STROKE_SOFT} />
    </>
  ),
});

/** Projects — the workspace records: a board with two uneven columns. */
export const ProjectsIcon = defineAppIcon("projects", {
  motion: "kanban",
  story: "#cd8a5e",
  deep: "#925a34",
  soft: "#f2ddc6",
  glyph: (
    <>
      <rect x="27" y="29" width="42" height="40" rx="8" fill={BACKING} />
      <rect
        className="dtIcon-m-card"
        style={si(0)}
        x="34"
        y="37"
        width="9.5"
        height="24"
        rx="3"
        fill={IVORY}
        stroke="none"
      />
      <g className="dtIcon-m-card" style={si(1)}>
        <rect x="52.5" y="37" width="9.5" height="13" rx="3" />
        <path d="M52.5 56 H62" strokeWidth={STROKE_SOFT} />
      </g>
    </>
  ),
});

/** Console — the canonical CLI design: a prompt chevron and its cursor. */
export const ConsoleIcon = defineAppIcon("console", {
  motion: "blink",
  story: "#8d8479",
  deep: "#57514a",
  soft: "#ded5c8",
  glyph: (
    <>
      <path d="M31 35 L43.5 47.5 L31 60" strokeWidth={STROKE_BRIGHT} />
      <path d="M50 36.5 H63" />
      <rect className="dtIcon-m-cursor" x="49" y="53.5" width="15.5" height="9.5" rx="3" fill={IVORY} stroke="none" />
    </>
  ),
});

/** Gateway — the local gateway console: routes meeting at a waypoint. */
export const GatewayIcon = defineAppIcon("gateway", {
  motion: "ripple",
  story: "#c9974f",
  deep: "#8a682c",
  soft: "#f0dcae",
  glyph: (
    <>
      <path d="M48 39.5 L56.5 48 L48 56.5 L39.5 48 Z" fill={BACKING} strokeWidth={STROKE_SOFT} />
      <circle className="dtIcon-m-node" style={si(0)} cx="29.5" cy="32.5" r="5" strokeWidth={STROKE_SOFT} />
      <circle className="dtIcon-m-node" style={si(1)} cx="66.5" cy="63.5" r="5" strokeWidth={STROKE_SOFT} />
      <path d="M33.5 36 Q41.5 42.5 42.5 44.8" strokeWidth={STROKE_SOFT} />
      <path d="M53.5 51.2 Q58.5 55 60.6 57.6" strokeWidth={STROKE_SOFT} />
    </>
  ),
});

/** Providers — the provider and model choices: a plug with its cord. */
export const ProvidersIcon = defineAppIcon("providers", {
  motion: "pulse",
  story: "#bd7d55",
  deep: "#7f5133",
  soft: "#f0d3ba",
  glyph: (
    <>
      <path d="M43.5 30.5 V38.5 M52.5 30.5 V38.5" />
      <rect className="dtIcon-m-plug" x="39" y="38.5" width="18" height="19" rx="6.5" fill={BACKING} />
      <path d="M48 57.5 C48 66.5 55 66 60.5 66 H66.5" strokeWidth={STROKE_SOFT} />
    </>
  ),
});

/** Usage — the local usage records: ascending bars over a baseline. */
export const UsageIcon = defineAppIcon("usage", {
  motion: "meter",
  story: "#b39a78",
  deep: "#75603f",
  soft: "#ecdcbe",
  glyph: (
    <>
      <path d="M29.5 65 H66.5" strokeWidth={STROKE_SOFT} />
      <rect
        className="dtIcon-m-bar"
        style={si(0)}
        x="33"
        y="47"
        width="8"
        height="13"
        rx="3"
        fill={IVORY}
        stroke="none"
        opacity=".78"
      />
      <rect
        className="dtIcon-m-bar"
        style={si(1)}
        x="44"
        y="39"
        width="8"
        height="21"
        rx="3"
        fill={IVORY}
        stroke="none"
        opacity=".89"
      />
      <rect
        className="dtIcon-m-bar"
        style={si(2)}
        x="55"
        y="30"
        width="8"
        height="30"
        rx="3"
        fill={IVORY}
        stroke="none"
      />
    </>
  ),
});

/** Routes — the stream health: two feeds merging into one stream. */
export const RoutesIcon = defineAppIcon("routes", {
  motion: "draw",
  story: "#b39a87",
  deep: "#775f4e",
  soft: "#eeddd0",
  glyph: (
    <>
      <path
        className="dtIcon-m-run"
        style={{ ...si(0), transformOrigin: "28.5px 34.5px" }}
        d="M28.5 34.5 C40 34.5 39 48 48.5 48"
      />
      <path
        className="dtIcon-m-run"
        style={{ ...si(1), transformOrigin: "28.5px 61.5px" }}
        d="M28.5 61.5 C40 61.5 39 48 48.5 48"
      />
      <path className="dtIcon-m-run" style={{ ...si(2), transformOrigin: "48.5px 48px" }} d="M48.5 48 H67" />
      <circle className="dtIcon-m-dot" style={si(3)} cx="48.5" cy="48" r="4.2" fill={IVORY} stroke="none" />
    </>
  ),
});

/** Docs — the documentation library: an open book with a raised spine. */
export const DocsIcon = defineAppIcon("docs", {
  motion: "lift",
  story: "#d8cbb2",
  deep: "#93856a",
  soft: "#f6efe0",
  glyph: (
    <>
      <path
        className="dtIcon-m-page-l"
        d="M48 35.5 C43 30.8 35 29.8 28.5 31.8 L28.5 59 C35 57 43 58 48 62.5 Z"
        fill={BACKING}
      />
      <path
        className="dtIcon-m-page-r"
        d="M48 35.5 C53 30.8 61 29.8 67.5 31.8 L67.5 59 C61 57 53 58 48 62.5 Z"
        fill={BACKING}
      />
      <path d="M48 35.5 V62.5" strokeWidth={STROKE_SOFT} />
    </>
  ),
});

/** Explore — the exploration gallery: the wind rose inside its ring. */
export const ExploreIcon = defineAppIcon("explore", {
  motion: "compass",
  story: "#c98d80",
  deep: "#8a5449",
  soft: "#f4d8cf",
  glyph: (
    <>
      <circle cx="48" cy="48" r="19" strokeWidth={STROKE_SOFT} />
      <g className="dtIcon-m-needle">
        <path d="M33 48 L48 44.2 L63 48 L48 51.8 Z" fill={IVORY} stroke="none" opacity=".55" />
        <path d="M48 31.5 L51.8 48 L48 64.5 L44.2 48 Z" fill={IVORY} stroke="none" />
      </g>
      <circle cx="48" cy="48" r="2.6" fill="#8a5449" stroke="none" />
    </>
  ),
});

/** OS — the family operating surface: the hex frame over a four-pane grid. */
export const OsIcon = defineAppIcon("os", {
  motion: "lattice",
  story: "#aab4c2",
  deep: "#647082",
  soft: "#e2e8f0",
  glyph: (
    <>
      <path d="M48 27 L66.5 37.5 V58.5 L48 69 L29.5 58.5 V37.5 Z" fill={BACKING} />
      <rect
        className="dtIcon-m-pane"
        style={si(0)}
        x="37.5"
        y="37"
        width="9"
        height="9"
        rx="2.5"
        fill={IVORY}
        stroke="none"
        opacity=".92"
      />
      <rect
        className="dtIcon-m-pane"
        style={si(1)}
        x="49.5"
        y="37"
        width="9"
        height="9"
        rx="2.5"
        fill={IVORY}
        stroke="none"
        opacity=".92"
      />
      <rect
        className="dtIcon-m-pane"
        style={si(2)}
        x="37.5"
        y="49"
        width="9"
        height="9"
        rx="2.5"
        fill={IVORY}
        stroke="none"
        opacity=".92"
      />
      <rect
        className="dtIcon-m-pane"
        style={si(3)}
        x="49.5"
        y="49"
        width="9"
        height="9"
        rx="2.5"
        fill={IVORY}
        stroke="none"
        opacity=".92"
      />
    </>
  ),
});

/** Settings — the local preferences: a gear with eight rounded teeth. */
export const SettingsIcon = defineAppIcon("settings", {
  motion: "turn",
  story: "#b6ada1",
  deep: "#6f6759",
  soft: "#ece5da",
  glyph: (
    <>
      <circle cx="48" cy="48" r="13.5" strokeWidth={STROKE_BRIGHT} />
      <path d="M64.5 48 H69.5 M59.7 59.7 L63.2 63.2 M48 64.5 V69.5 M36.3 59.7 L32.8 63.2 M31.5 48 H26.5 M36.3 36.3 L32.8 32.8 M48 31.5 V26.5 M59.7 36.3 L63.2 32.8" />
      <circle cx="48" cy="48" r="4.6" strokeWidth={STROKE_HAIR} />
    </>
  ),
});

/** Argan — the DNS and gateway library: the double-contour shield. */
export const ArganIcon = defineAppIcon("argan", {
  motion: "sway",
  story: "#14b98c",
  deep: "#0b7d5e",
  soft: "#bcefdc",
  glyph: (
    <>
      <path d="M48 27.5 L66 34 V49 C66 59.8 58.7 66.2 48 70.2 C37.3 66.2 30 59.8 30 49 V34 Z" fill={BACKING} />
      <path
        d="M48 35 L59.5 39.2 V48.6 C59.5 55.8 54.6 60.4 48 63.4 C41.4 60.4 36.5 55.8 36.5 48.6 V39.2 Z"
        strokeWidth={STROKE_HAIR}
        opacity=".85"
      />
    </>
  ),
});

/** Cadria — the video, image and 3D studio: a clapperboard mid-slate. */
export const CadriaIcon = defineAppIcon("cadria", {
  motion: "spin",
  story: "#e04f9f",
  deep: "#972a66",
  soft: "#f7c4e2",
  glyph: (
    <>
      <rect x="28" y="46" width="40" height="21" rx="5" fill={BACKING} />
      <g className="dtIcon-m-slate">
        <path d="M30.5 46 L33.8 31.5 L67.5 37.5 L65 46 Z" fill={BACKING} />
        <path d="M41.5 33.2 L44.5 45.3 M53 35.3 L55.5 45.5" strokeWidth={STROKE_SOFT} />
      </g>
    </>
  ),
});

/** Debonair — the OS audio DAW: a five-band equalizer in full swing. */
export const DebonairIcon = defineAppIcon("debonair", {
  motion: "wave",
  story: "#bd7a1a",
  deep: "#7c4c0a",
  soft: "#f2ddab",
  glyph: (
    <>
      <rect
        className="dtIcon-m-bar"
        style={si(0)}
        x="27.2"
        y="39"
        width="5.6"
        height="18"
        rx="3"
        fill={IVORY}
        stroke="none"
        opacity=".78"
      />
      <rect
        className="dtIcon-m-bar"
        style={si(1)}
        x="36.2"
        y="34"
        width="5.6"
        height="28"
        rx="3"
        fill={IVORY}
        stroke="none"
        opacity=".88"
      />
      <rect
        className="dtIcon-m-bar"
        style={si(2)}
        x="45.2"
        y="28"
        width="5.6"
        height="40"
        rx="3"
        fill={IVORY}
        stroke="none"
      />
      <rect
        className="dtIcon-m-bar"
        style={si(3)}
        x="54.2"
        y="34"
        width="5.6"
        height="28"
        rx="3"
        fill={IVORY}
        stroke="none"
        opacity=".88"
      />
      <rect
        className="dtIcon-m-bar"
        style={si(4)}
        x="63.2"
        y="39"
        width="5.6"
        height="18"
        rx="3"
        fill={IVORY}
        stroke="none"
        opacity=".78"
      />
    </>
  ),
});

/** StealHead — the OS FPS platform: a scope with cardinal ticks. */
export const StealthheadIcon = defineAppIcon("stealthhead", {
  motion: "breathe",
  story: "#f4694f",
  deep: "#a63322",
  soft: "#ffd3c4",
  glyph: (
    <>
      <circle cx="48" cy="48" r="17.5" />
      <path d="M48 26 V31.5 M48 64.5 V70 M26 48 H31.5 M64.5 48 H70" />
      <circle cx="48" cy="48" r="4.4" fill={IVORY} stroke="none" />
    </>
  ),
});

/** Forge — the family forge: a mallet head over its handle. */
export const ForgeIcon = defineAppIcon("forge", {
  motion: "tap",
  story: "#a2cb3a",
  deep: "#647e1d",
  soft: "#e0f2b6",
  glyph: (
    <>
      <g className="dtIcon-m-tap">
        <g transform="rotate(-24 50 37)">
          <rect x="35" y="29.5" width="30" height="15" rx="5.5" fill={BACKING} />
        </g>
      </g>
      <path d="M53 44 L43.5 64" strokeWidth={STROKE_BRIGHT} />
    </>
  ),
});

/** Foundry — the family foundry: the sawtooth plant with its stack. */
export const FoundryIcon = defineAppIcon("foundry", {
  motion: "glow",
  story: "#4d8edd",
  deep: "#2a5c9c",
  soft: "#c6def7",
  glyph: (
    <>
      <path d="M28.5 66 V45 L39.5 53 V45 L50.5 53 V41 H56.5 V32 H63 V66 Z" fill={BACKING} />
      <rect
        className="dtIcon-m-tick"
        style={si(0)}
        x="33.5"
        y="56.5"
        width="6.5"
        height="7.5"
        rx="2"
        fill={IVORY}
        stroke="none"
        opacity=".85"
      />
      <rect
        className="dtIcon-m-tick"
        style={si(1)}
        x="44"
        y="56.5"
        width="6.5"
        height="7.5"
        rx="2"
        fill={IVORY}
        stroke="none"
        opacity=".85"
      />
    </>
  ),
});

/** Vault — the family vault: the three-spoke door inside its rings. */
export const VaultIcon = defineAppIcon("vault", {
  motion: "dial",
  story: "#a3d7e6",
  deep: "#5b93a6",
  soft: "#e0f3f9",
  glyph: (
    <>
      <circle cx="48" cy="48" r="20" strokeWidth={STROKE_BRIGHT} />
      <circle cx="48" cy="48" r="11" strokeWidth={STROKE_SOFT} />
      <g className="dtIcon-m-dial">
        <path d="M48 48 V37 M48 48 L57.5 53.5 M48 48 L38.5 53.5" strokeWidth={STROKE_SOFT} />
      </g>
    </>
  ),
});

/** Getry — the family registry: the cataloged stack of plates. */
export const GetryIcon = defineAppIcon("getry", {
  motion: "slide",
  story: "#9a7ce0",
  deep: "#6146ab",
  soft: "#ded1f8",
  glyph: (
    <>
      <path className="dtIcon-m-plate" style={si(0)} d="M48 28.5 L63.5 37.5 L48 46.5 L32.5 37.5 Z" fill={BACKING} />
      <path className="dtIcon-m-plate" style={si(1)} d="M32.5 46.5 L48 55.5 L63.5 46.5" />
      <path className="dtIcon-m-plate" style={si(2)} d="M32.5 55 L48 64 L63.5 55" />
    </>
  ),
});

/** Saddle — the sandbox engine: the crate drawn in light isometric. */
export const SaddleIcon = defineAppIcon("saddle", {
  motion: "shine",
  story: "#d6b483",
  deep: "#8f6b3c",
  soft: "#f2e3c8",
  glyph: (
    <>
      <clipPath id="dti-saddle-shine">
        <path d={SQUIRCLE} />
      </clipPath>
      <path d="M31 42.5 L40 33 H65 L56 42.5 Z" fill={BACKING} />
      <path d="M56 42.5 L65 33 V56 L56 65.5 Z" fill="rgba(255,255,255,.09)" />
      <rect x="31" y="42.5" width="25" height="23" rx="2.5" fill={BACKING} />
      <g clipPath="url(#dti-saddle-shine)">
        <g className="dtIcon-m-shine">
          <rect x="18" y="14" width="13" height="70" fill="rgba(255,255,255,.55)" transform="skewX(-16)" />
        </g>
      </g>
    </>
  ),
});

/**
 * The premium icon set of the shell, keyed by the registry `iconset` field:
 * the desktop grid, the dock and the Start menu all reach their icons here.
 */
export const APP_ICONS: Record<string, ComponentType<AppIconProps>> = {
  chat: ChatIcon,
  history: HistoryIcon,
  projects: ProjectsIcon,
  console: ConsoleIcon,
  gateway: GatewayIcon,
  providers: ProvidersIcon,
  usage: UsageIcon,
  routes: RoutesIcon,
  docs: DocsIcon,
  explore: ExploreIcon,
  os: OsIcon,
  settings: SettingsIcon,
  argan: ArganIcon,
  cadria: CadriaIcon,
  debonair: DebonairIcon,
  stealthhead: StealthheadIcon,
  forge: ForgeIcon,
  foundry: FoundryIcon,
  vault: VaultIcon,
  getry: GetryIcon,
  saddle: SaddleIcon,
};
