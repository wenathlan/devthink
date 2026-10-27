/**
 * saasglyphs.tsx — the stroke glyph family of the SaaS face: the lucide
 * 24x24 shapes the approved landing wears, drawn inline as plain svg so no
 * icon dependency ever rides the web build. Every glyph keeps the lucide
 * frame (fill none, stroke currentColor, the round caps and joins) so the
 * tailwind fill-* and text-* utilities recolor them exactly like the
 * reference icons they replace. Presentation only — no state, no props
 * beyond the svg attribute passthrough.
 */
import type { SVGProps } from "react";

type GlyphProps = SVGProps<SVGSVGElement>;

/** The shared lucide frame: the 24x24 grid, the 2px stroke, currentColor.
 * Decorative by default (aria-hidden) — the meaningful callers label the
 * control itself, the svg never speaks. */
function Glyphframe({ children, ...props }: GlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={24}
      height={24}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

/** The sparkles mark: the four point star with the twin plus ticks. */
export function Sparkle(props: GlyphProps) {
  return (
    <Glyphframe {...props}>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
      <path d="M20 3v4" />
      <path d="M22 5h-4" />
      <path d="M4 17v2" />
      <path d="M5 18H3" />
    </Glyphframe>
  );
}

/** The activity pulse: the heartbeat line of the OS tile. */
export function Activity(props: GlyphProps) {
  return (
    <Glyphframe {...props}>
      <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
    </Glyphframe>
  );
}

/** The compass rose: the ring with the offset needle. */
export function Compass(props: GlyphProps) {
  return (
    <Glyphframe {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z" />
    </Glyphframe>
  );
}

/** The layers stack: the three plates of the explorer stop. */
export function Layers(props: GlyphProps) {
  return (
    <Glyphframe {...props}>
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
      <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
    </Glyphframe>
  );
}

/** The users pair: the two heads and shoulders of the creators tab. */
export function Users(props: GlyphProps) {
  return (
    <Glyphframe {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </Glyphframe>
  );
}

/** The film strip: the framed reel of the cadria tab. */
export function Film(props: GlyphProps) {
  return (
    <Glyphframe {...props}>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M7 3v18" />
      <path d="M3 7.5h4" />
      <path d="M3 12h18" />
      <path d="M3 16.5h4" />
      <path d="M17 3v18" />
      <path d="M17 7.5h4" />
      <path d="M17 16.5h4" />
    </Glyphframe>
  );
}

/** The eighth notes: the twin stems of the debonair tab. */
export function Music(props: GlyphProps) {
  return (
    <Glyphframe {...props}>
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </Glyphframe>
  );
}

/** The headphones band: the full arc of the debonair rail stop. */
export function Headphones(props: GlyphProps) {
  return (
    <Glyphframe {...props}>
      <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
    </Glyphframe>
  );
}

/** The message square: the chat bubble of the doo stops. */
export function Messagesquare(props: GlyphProps) {
  return (
    <Glyphframe {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </Glyphframe>
  );
}

/** The bell: the alerts chime of the header. */
export function Bell(props: GlyphProps) {
  return (
    <Glyphframe {...props}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </Glyphframe>
  );
}

/** The log in arrow: the sign in key of the header. */
export function Login(props: GlyphProps) {
  return (
    <Glyphframe {...props}>
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" x2="3" y1="12" y2="12" />
    </Glyphframe>
  );
}

/** The up right arrow: the launch mark of the tactile keys. */
export function Arrowupright(props: GlyphProps) {
  return (
    <Glyphframe {...props}>
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </Glyphframe>
  );
}

/** The right arrow: the open studio chevron. */
export function Arrowright(props: GlyphProps) {
  return (
    <Glyphframe {...props}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </Glyphframe>
  );
}

/** The left arrow: the rail scroll back chevron. */
export function Arrowleft(props: GlyphProps) {
  return (
    <Glyphframe {...props}>
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </Glyphframe>
  );
}

/** The star: the rating mark of the fan deck and the dock save. */
export function Star(props: GlyphProps) {
  return (
    <Glyphframe {...props}>
      <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
    </Glyphframe>
  );
}

/** The check: the following tick of the creator cards. */
export function Check(props: GlyphProps) {
  return (
    <Glyphframe {...props}>
      <path d="M20 6 9 17l-5-5" />
    </Glyphframe>
  );
}

/** The plus: the follow and my list marks. */
export function Plus(props: GlyphProps) {
  return (
    <Glyphframe {...props}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </Glyphframe>
  );
}

/** The play triangle: the playback mark of every media hero. */
export function Play(props: GlyphProps) {
  return (
    <Glyphframe {...props}>
      <polygon points="6 3 20 12 6 21 6 3" />
    </Glyphframe>
  );
}

/** The clock: the debonair weather row. */
export function Clock(props: GlyphProps) {
  return (
    <Glyphframe {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </Glyphframe>
  );
}

/** The globe: the web share of the creator and footer rows. */
export function Globe(props: GlyphProps) {
  return (
    <Glyphframe {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </Glyphframe>
  );
}

/** The share nodes: the three dot relay of the footer. */
export function Share(props: GlyphProps) {
  return (
    <Glyphframe {...props}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
      <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
    </Glyphframe>
  );
}

/** The maximize corners: the top dock key of the footer row. */
export function Maximize(props: GlyphProps) {
  return (
    <Glyphframe {...props}>
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" x2="14" y1="3" y2="10" />
      <line x1="3" x2="10" y1="21" y2="14" />
    </Glyphframe>
  );
}

/** The send paper plane: the doo composer key. */
export function Send(props: GlyphProps) {
  return (
    <Glyphframe {...props}>
      <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
      <path d="m21.854 2.147-10.94 10.939" />
    </Glyphframe>
  );
}

/** The waves: the three swells of the shader card corner. */
export function Wave(props: GlyphProps) {
  return (
    <Glyphframe {...props}>
      <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
      <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
      <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
    </Glyphframe>
  );
}

/** The heart: the like mark of the debonair rail. */
export function Heart(props: GlyphProps) {
  return (
    <Glyphframe {...props}>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </Glyphframe>
  );
}

/** The at sign: the mention ring of the creator rows. */
export function Atsign(props: GlyphProps) {
  return (
    <Glyphframe {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
    </Glyphframe>
  );
}

/** The tv: the cadria rail stop of the left rail. */
export function Tv(props: GlyphProps) {
  return (
    <Glyphframe {...props}>
      <rect width="20" height="15" x="2" y="7" rx="2" ry="2" />
      <polyline points="17 2 12 7 7 2" />
    </Glyphframe>
  );
}
