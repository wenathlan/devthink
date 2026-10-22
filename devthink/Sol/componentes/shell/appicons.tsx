/**
 * appicons.tsx — the Windows 11 fluent icon set of the Sol shell. One drawn
 * SVG component per desktop app (appregistry.ts), exported through the
 * APP_ICONS map the app tile reads by the registry `iconset` key.
 *
 * The grammar every icon follows is the Windows 11 start-menu tile: a
 * rounded-square plate (the squircle feel at a ~12% corner radius) painted
 * with one soft two-tone gradient of the app identity — a calm saturated
 * top tone settling into a deeper base, never neon — and one bold simple
 * white glyph centered on it. The depth stays subtle and inner only: a
 * faint top sheen and a very light top-edge highlight that fades down the
 * shoulders, no heavy shadows, no gloss, no grain, no tilt. The whole set
 * shares one 48x48 viewBox geometry so the marks stay crisp from the 16px
 * taskbar pin through the 26px alt-tab row and the 32px start cell up to
 * the desktop tile, and every glyph lives inside the ~11..37 optical band
 * around the plate center.
 *
 * One plate helper renders the shared material: the squircle path, the
 * userSpaceOnUse gradient pair (the plate tone plus the edge light) and
 * the clipped top rim, all keyed on unique ids per app icon (dti-<key>),
 * so no two icons ever share a def. The glyphs are compact paths — filled
 * shapes for the bold silhouettes, round-capped strokes for the line
 * work — and the plate tone itself doubles as the cutout ink (the piano's
 * black keys, the gear's bore, the vault's keyhole), so a cutout always
 * shows the exact plate color behind it.
 *
 * The components stay pure presentational: props in, svg out — no hooks,
 * no injected stylesheet, no external assets, no raster. The size prop
 * pins the square box in px and, omitted, the icon fills its tile box (the
 * app tile contract of apptile.tsx); the live flag the tile raises while
 * the pointer hovers answers with one subtle fluent gesture — the glyph
 * lifts half a unit and breathes up three percent through a plain CSS
 * transform, and dropping the flag settles it right back. The identity of
 * every app rides its own accent family: argan the jade cloud, cadria the
 * magenta waveform, debonair the bronze piano, forge the umber anvil,
 * foundry the slate layers, getry the sage route, saddle the taupe crate,
 * stealthhead the coral visor, vault the deep-gold shield — and the os
 * surfaces ride their own calm hues over the same plate.
 */
import { type ComponentType, type CSSProperties, type ReactElement } from "react";

export type AppIconProps = {
  /** rendered square size in px; omitted, the icon fills its tile box */
  size?: number;
  /** the live flag the app tile raises while the pointer hovers it; the
   *  glyph answers with its one subtle lift and settles back on drop */
  live?: boolean;
};

/** the bold white ink of every glyph */
const GLYPH_INK = "#ffffff";

/** the base stroke weight of the glyph line work — crisp down to 16px */
const STROKE = 3.4;

/** the soft stroke weight of secondary glyph details */
const STROKE_SOFT = 2.7;

/** the rounded-square plate of the set: the squircle feel at a ~12% corner
 *  radius over the shared 48x48 viewBox */
const PLATE_FACE = "M6 0 H42 Q48 0 48 6 V42 Q48 48 42 48 H6 Q0 48 0 42 V6 Q0 0 6 0 Z";

/** the recipe of one fluent icon: the two-tone plate of the app identity
 *  and the bold white glyph centered on it */
type AppIconPlate = {
  /** the lighter top tone of the plate gradient */
  top: string;
  /** the deeper base tone the plate settles into */
  bottom: string;
  /** draws the glyph; the `tone` argument carries the plate gradient url
   *  the cutout details (black keys, bores, keyholes) fill with */
  glyph: (tone: string) => ReactElement;
};

/** the resting pose of the glyph group: centered on the plate and ready to
 *  settle back the moment the live flag drops */
const GLYPH_REST: CSSProperties = {
  transformBox: "view-box",
  transformOrigin: "24px 24px",
  transition: "transform .22s cubic-bezier(.2,.8,.3,1)",
};

/** the live pose — the one fluent gesture of the set: the glyph lifts half
 *  a unit and breathes up three percent while the pointer is on the tile */
const GLYPH_LIVE: CSSProperties = {
  ...GLYPH_REST,
  transform: "translateY(-.5px) scale(1.03)",
};

/**
 * The plate helper of the set: one function rendering the rounded plate
 * with its gradient defs (unique ids per app icon) — the two-tone face,
 * the faint inner top sheen and the very light top-edge highlight. The
 * gradients ride userSpaceOnUse, so any shape — glyph cutouts included —
 * samples the exact plate tone at its own position.
 */
function Plate({ uid, top, bottom }: { uid: string; top: string; bottom: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${uid}-tone`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="48">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
        <linearGradient id={`${uid}-edge`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="26">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".42" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${uid}-clip`}>
          <path d={PLATE_FACE} />
        </clipPath>
      </defs>
      {/* the face: the soft two-tone gradient of the app identity */}
      <path d={PLATE_FACE} fill={`url(#${uid}-tone)`} />
      {/* the subtle inner depth: a faint top sheen plus the very light
          top-edge highlight, the rim clipped inside the plate */}
      <path d={PLATE_FACE} fill={`url(#${uid}-edge)`} opacity=".3" />
      <g clipPath={`url(#${uid}-clip)`}>
        <path d={PLATE_FACE} fill="none" stroke={`url(#${uid}-edge)`} strokeWidth="2.4" />
      </g>
    </>
  );
}

/** The shared face every icon renders through: the plate helper under the
 *  bold glyph group, the box pinned by the size prop or filling the tile.
 *  One component identity for the whole icon wall; the per-icon identity
 *  arrives by the plate spec the bound wrapper froze in its closure. */
interface FluentIconFaceProps extends AppIconProps {
  /** the namespaced gradient id prefix of this icon (dti-<key>) */
  uid: string;
  /** the plate recipe of this icon */
  plate: AppIconPlate;
}

function FluentIconFace({ size, live, uid, plate }: FluentIconFaceProps) {
  const box: CSSProperties = {
    display: "block",
    width: size === undefined ? "100%" : size,
    height: size === undefined ? "100%" : size,
  };
  return (
    <svg
      className="dtIcon"
      viewBox="0 0 48 48"
      style={box}
      data-live={live ? "true" : undefined}
      aria-hidden="true"
      focusable="false"
    >
      <Plate uid={uid} top={plate.top} bottom={plate.bottom} />
      <g
        className="dtIconGlyph"
        fill="none"
        stroke={GLYPH_INK}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={live ? GLYPH_LIVE : GLYPH_REST}
      >
        {plate.glyph(`url(#${uid}-tone)`)}
      </g>
    </svg>
  );
}

/* ------------------------------- the icons --------------------------------- */

/** Chat — the assistant of the OS: an azure plate carrying a bold speech
 *  bubble, its three dots cut in the plate tone. */
const ChatIcon_PLATE: AppIconPlate = {
  top: "#56a9f0",
  bottom: "#2b6fc9",
  glyph: (tone) => (
    <>
      <rect x="12.5" y="13" width="23" height="16" rx="5.5" fill={GLYPH_INK} stroke="none" />
      <path d="M16.9 27.9 L14.1 34.4 Q13.1 36.5 15.5 35.6 L22.7 32.2 Z" fill={GLYPH_INK} stroke="none" />
      <circle cx="18.6" cy="21" r="1.75" fill={tone} stroke="none" />
      <circle cx="24" cy="21" r="1.75" fill={tone} stroke="none" />
      <circle cx="29.4" cy="21" r="1.75" fill={tone} stroke="none" />
    </>
  ),
};

/** The bound icon component of "chat": a module-level arrow over the shared
 *  fluent face, the plate frozen in the closure at load. */
export const ChatIcon: ComponentType<AppIconProps> = (props: AppIconProps) => (
  <FluentIconFace {...props} uid="dti-chat" plate={ChatIcon_PLATE} />
);

/** My Files — the file explorer of the OS: a gold plate carrying the folder,
 *  its back panel riding translucent above the solid front plane. */
const FilesIcon_PLATE: AppIconPlate = {
  top: "#f6c455",
  bottom: "#cf9430",
  glyph: () => (
    <>
      <path
        d="M14.3 15.6 h7.4 l3.5 4 h8.5 q2.3 0 2.3 2.3 v2.6 H12 v-6.3 q0 -2.3 2.3 -2.3 Z"
        fill={GLYPH_INK}
        stroke="none"
        opacity=".6"
      />
      <path d="M12 22.8 h24 v7.4 q0 2.3 -2.3 2.3 h-19.4 q-2.3 0 -2.3 -2.3 Z" fill={GLYPH_INK} stroke="none" />
    </>
  ),
};

/** The bound icon component of "files": a module-level arrow over the shared
 *  fluent face, the plate frozen in the closure at load. */
export const FilesIcon: ComponentType<AppIconProps> = (props: AppIconProps) => (
  <FluentIconFace {...props} uid="dti-files" plate={FilesIcon_PLATE} />
);

/** History — the session archive: a sand plate carrying the clock with its
 *  rewind arrow sweeping counterclockwise outside the dial. */
const HistoryIcon_PLATE: AppIconPlate = {
  top: "#dcbf8f",
  bottom: "#a98550",
  glyph: () => (
    <>
      <circle cx="24" cy="25" r="10" />
      <path d="M24 19.5 V25 L28.2 27.6" />
      <path d="M15.5 14.1 A13.8 13.8 0 0 0 10.7 21.4" strokeWidth={STROKE_SOFT} />
      <path d="M8.8 16.5 L10.7 21.4 L14.8 18.2" strokeWidth={STROKE_SOFT} />
    </>
  ),
};

/** The bound icon component of "history": a module-level arrow over the shared
 *  fluent face, the plate frozen in the closure at load. */
export const HistoryIcon: ComponentType<AppIconProps> = (props: AppIconProps) => (
  <FluentIconFace {...props} uid="dti-history" plate={HistoryIcon_PLATE} />
);

/** Projects — the workspace records: a clay plate carrying the board with its
 *  three uneven columns of pinned work. */
const ProjectsIcon_PLATE: AppIconPlate = {
  top: "#e39a68",
  bottom: "#b0663d",
  glyph: () => (
    <>
      <rect x="13.5" y="15.5" width="21" height="18.5" rx="3.2" />
      <rect x="16.6" y="22.8" width="3.8" height="8.2" rx="1.9" fill={GLYPH_INK} stroke="none" />
      <rect x="22.1" y="18.6" width="3.8" height="12.4" rx="1.9" fill={GLYPH_INK} stroke="none" />
      <rect x="27.6" y="25.4" width="3.8" height="5.6" rx="1.9" fill={GLYPH_INK} stroke="none" />
    </>
  ),
};

/** The bound icon component of "projects": a module-level arrow over the shared
 *  fluent face, the plate frozen in the closure at load. */
export const ProjectsIcon: ComponentType<AppIconProps> = (props: AppIconProps) => (
  <FluentIconFace {...props} uid="dti-projects" plate={ProjectsIcon_PLATE} />
);

/** Console — the canonical CLI design: a graphite plate carrying the prompt
 *  chevron and its waiting underscore. */
const ConsoleIcon_PLATE: AppIconPlate = {
  top: "#5d6672",
  bottom: "#363d48",
  glyph: () => (
    <>
      <path d="M14.5 17.5 L22.1 24 L14.5 30.5" />
      <path d="M26.5 30.5 H34" />
    </>
  ),
};

/** The bound icon component of "console": a module-level arrow over the shared
 *  fluent face, the plate frozen in the closure at load. */
export const ConsoleIcon: ComponentType<AppIconProps> = (props: AppIconProps) => (
  <FluentIconFace {...props} uid="dti-console" plate={ConsoleIcon_PLATE} />
);

/** Gateway — the local gateway console: a brass plate carrying the network —
 *  one hub node wired to its four satellites. */
const GatewayIcon_PLATE: AppIconPlate = {
  top: "#d8a75c",
  bottom: "#a3722c",
  glyph: () => (
    <>
      <g strokeWidth={STROKE_SOFT}>
        <path d="M24 24 L14 14.5" />
        <path d="M24 24 L34 14.5" />
        <path d="M24 24 L14 33.5" />
        <path d="M24 24 L34 33.5" />
      </g>
      <circle cx="24" cy="24" r="3.6" fill={GLYPH_INK} stroke="none" />
      <circle cx="14" cy="14.5" r="3.1" fill={GLYPH_INK} stroke="none" />
      <circle cx="34" cy="14.5" r="3.1" fill={GLYPH_INK} stroke="none" />
      <circle cx="14" cy="33.5" r="3.1" fill={GLYPH_INK} stroke="none" />
      <circle cx="34" cy="33.5" r="3.1" fill={GLYPH_INK} stroke="none" />
    </>
  ),
};

/** The bound icon component of "gateway": a module-level arrow over the shared
 *  fluent face, the plate frozen in the closure at load. */
export const GatewayIcon: ComponentType<AppIconProps> = (props: AppIconProps) => (
  <FluentIconFace {...props} uid="dti-gateway" plate={GatewayIcon_PLATE} />
);

/** Providers — the provider and model choices: a sienna plate carrying the
 *  plug with its prongs and its coiled cord. */
const ProvidersIcon_PLATE: AppIconPlate = {
  top: "#cf8a5f",
  bottom: "#9a5c38",
  glyph: () => (
    <>
      <path d="M20.8 13.5 V18" />
      <path d="M27.2 13.5 V18" />
      <rect x="17" y="18" width="14" height="12" rx="4.5" fill={GLYPH_INK} stroke="none" />
      <path d="M24 30 V32.8 Q24 35.6 27.2 35.6 H31" strokeWidth={STROKE_SOFT} />
    </>
  ),
};

/** The bound icon component of "providers": a module-level arrow over the shared
 *  fluent face, the plate frozen in the closure at load. */
export const ProvidersIcon: ComponentType<AppIconProps> = (props: AppIconProps) => (
  <FluentIconFace {...props} uid="dti-providers" plate={ProvidersIcon_PLATE} />
);

/** Usage — the local usage records: a tan plate carrying the ascending bars
 *  of the meter. */
const UsageIcon_PLATE: AppIconPlate = {
  top: "#c2aa7f",
  bottom: "#8f7550",
  glyph: () => (
    <>
      <rect x="15.4" y="24.5" width="5" height="9" rx="2.5" fill={GLYPH_INK} stroke="none" opacity=".75" />
      <rect x="21.5" y="20" width="5" height="13.5" rx="2.5" fill={GLYPH_INK} stroke="none" opacity=".88" />
      <rect x="27.6" y="15.5" width="5" height="18" rx="2.5" fill={GLYPH_INK} stroke="none" />
    </>
  ),
};

/** The bound icon component of "usage": a module-level arrow over the shared
 *  fluent face, the plate frozen in the closure at load. */
export const UsageIcon: ComponentType<AppIconProps> = (props: AppIconProps) => (
  <FluentIconFace {...props} uid="dti-usage" plate={UsageIcon_PLATE} />
);

/** Routes — the stream health: a dusty-rose plate carrying two feeds curving
 *  into one arrow. */
const RoutesIcon_PLATE: AppIconPlate = {
  top: "#c9a894",
  bottom: "#93715d",
  glyph: () => (
    <>
      <path d="M14.5 15.5 Q14.5 24 24 24 H30" />
      <path d="M14.5 32.5 Q14.5 24 24 24 H30" />
      <circle cx="14.5" cy="15.5" r="2.9" fill={GLYPH_INK} stroke="none" />
      <circle cx="14.5" cy="32.5" r="2.9" fill={GLYPH_INK} stroke="none" />
      <path d="M27.6 20.6 L32 24 L27.6 27.4" />
    </>
  ),
};

/** The bound icon component of "routes": a module-level arrow over the shared
 *  fluent face, the plate frozen in the closure at load. */
export const RoutesIcon: ComponentType<AppIconProps> = (props: AppIconProps) => (
  <FluentIconFace {...props} uid="dti-routes" plate={RoutesIcon_PLATE} />
);

/** Docs — the documentation library: a parchment plate carrying the document
 *  with its folded corner and its plate-toned lines of text. */
const DocsIcon_PLATE: AppIconPlate = {
  top: "#ddd1b8",
  bottom: "#a89a7c",
  glyph: (tone) => (
    <>
      <path
        d="M17.3 12.5 h9.2 l5.5 5.5 v15.6 q0 2 -2 2 h-12.7 q-2 0 -2 -2 v-19.1 q0 -2 2 -2 Z"
        fill={GLYPH_INK}
        stroke="none"
      />
      <path d="M26.5 12.5 v6.4 h5.5 Z" fill={GLYPH_INK} stroke="none" opacity=".5" />
      <path d="M19.6 26.5 h9 M19.6 31 h5.5" stroke={tone} strokeWidth={STROKE_SOFT} />
    </>
  ),
};

/** The bound icon component of "docs": a module-level arrow over the shared
 *  fluent face, the plate frozen in the closure at load. */
export const DocsIcon: ComponentType<AppIconProps> = (props: AppIconProps) => (
  <FluentIconFace {...props} uid="dti-docs" plate={DocsIcon_PLATE} />
);

/** Explore — the exploration gallery: a terracotta plate carrying the compass,
 *  its needle split solid north and translucent south. */
const ExploreIcon_PLATE: AppIconPlate = {
  top: "#d69a88",
  bottom: "#a15c4b",
  glyph: (tone) => (
    <>
      <circle cx="24" cy="24" r="11" />
      <path d="M24 15.2 L27.5 24 H20.5 Z" fill={GLYPH_INK} stroke="none" />
      <path d="M24 32.8 L27.5 24 H20.5 Z" fill={GLYPH_INK} stroke="none" opacity=".55" />
      <circle cx="24" cy="24" r="2" fill={tone} stroke="none" />
    </>
  ),
};

/** The bound icon component of "explore": a module-level arrow over the shared
 *  fluent face, the plate frozen in the closure at load. */
export const ExploreIcon: ComponentType<AppIconProps> = (props: AppIconProps) => (
  <FluentIconFace {...props} uid="dti-explore" plate={ExploreIcon_PLATE} />
);

/** OS — the family operating surface: a steel plate carrying the four-pane
 *  window of the system. */
const OsIcon_PLATE: AppIconPlate = {
  top: "#8fabcf",
  bottom: "#4f6d99",
  glyph: () => (
    <>
      <rect x="14.6" y="14.6" width="7.6" height="7.6" rx="2.2" fill={GLYPH_INK} stroke="none" />
      <rect x="25.8" y="14.6" width="7.6" height="7.6" rx="2.2" fill={GLYPH_INK} stroke="none" />
      <rect x="14.6" y="25.8" width="7.6" height="7.6" rx="2.2" fill={GLYPH_INK} stroke="none" />
      <rect x="25.8" y="25.8" width="7.6" height="7.6" rx="2.2" fill={GLYPH_INK} stroke="none" />
    </>
  ),
};

/** The bound icon component of "os": a module-level arrow over the shared
 *  fluent face, the plate frozen in the closure at load. */
export const OsIcon: ComponentType<AppIconProps> = (props: AppIconProps) => (
  <FluentIconFace {...props} uid="dti-os" plate={OsIcon_PLATE} />
);

/** Settings — the local preferences: a stone plate carrying the eight-tooth
 *  gear, its bore cut back to the plate tone. */
const SettingsIcon_PLATE: AppIconPlate = {
  top: "#b9b3a8",
  bottom: "#7d776c",
  glyph: (tone) => (
    <>
      <g fill={GLYPH_INK} stroke="none">
        <rect x="21.9" y="10.8" width="4.2" height="26.4" rx="2.1" />
        <rect x="10.8" y="21.9" width="26.4" height="4.2" rx="2.1" />
        <rect x="21.9" y="10.8" width="4.2" height="26.4" rx="2.1" transform="rotate(45 24 24)" />
        <rect x="21.9" y="10.8" width="4.2" height="26.4" rx="2.1" transform="rotate(135 24 24)" />
        <circle cx="24" cy="24" r="9.6" />
      </g>
      <circle cx="24" cy="24" r="4.4" fill={tone} stroke="none" />
    </>
  ),
};

/** The bound icon component of "settings": a module-level arrow over the shared
 *  fluent face, the plate frozen in the closure at load. */
export const SettingsIcon: ComponentType<AppIconProps> = (props: AppIconProps) => (
  <FluentIconFace {...props} uid="dti-settings" plate={SettingsIcon_PLATE} />
);

/** Calculator — the native arithmetic app: a pale steel plate carrying the
 *  keypad grid with its display and its equals column. */
const CalculatorIcon_PLATE: AppIconPlate = {
  top: "#a4b4c6",
  bottom: "#67798c",
  glyph: () => (
    <>
      <rect x="14.5" y="12.5" width="19" height="23" rx="3.2" />
      <rect x="18" y="16.5" width="12" height="4" rx="1.4" fill={GLYPH_INK} stroke="none" />
      <circle cx="19.4" cy="25.6" r="1.8" fill={GLYPH_INK} stroke="none" />
      <circle cx="23.5" cy="25.6" r="1.8" fill={GLYPH_INK} stroke="none" />
      <circle cx="19.4" cy="30" r="1.8" fill={GLYPH_INK} stroke="none" />
      <circle cx="23.5" cy="30" r="1.8" fill={GLYPH_INK} stroke="none" />
      <rect x="27.4" y="24.2" width="3.4" height="9.4" rx="1.7" fill={GLYPH_INK} stroke="none" />
    </>
  ),
};

/** The bound icon component of "calculator": a module-level arrow over the shared
 *  fluent face, the plate frozen in the closure at load. */
export const CalculatorIcon: ComponentType<AppIconProps> = (props: AppIconProps) => (
  <FluentIconFace {...props} uid="dti-calculator" plate={CalculatorIcon_PLATE} />
);

/** Image — the native image studio: a violet plate carrying the picture frame
 *  with its mountain and its sun. */
const ImageIcon_PLATE: AppIconPlate = {
  top: "#b79ae6",
  bottom: "#7f5cc0",
  glyph: () => (
    <>
      <rect x="13" y="14.5" width="22" height="19" rx="3.4" />
      <path d="M17.4 29.8 L22.6 23 L26.8 28.4 L29.4 25.1 L31.4 29.8 Z" fill={GLYPH_INK} stroke="none" />
      <circle cx="28.4" cy="20.4" r="2.5" fill={GLYPH_INK} stroke="none" />
    </>
  ),
};

/** The bound icon component of "image": a module-level arrow over the shared
 *  fluent face, the plate frozen in the closure at load. */
export const ImageIcon: ComponentType<AppIconProps> = (props: AppIconProps) => (
  <FluentIconFace {...props} uid="dti-image" plate={ImageIcon_PLATE} />
);

/** Video — the native video editor: a rose plate carrying the rounded play
 *  triangle. */
const VideoIcon_PLATE: AppIconPlate = {
  top: "#eb8bb3",
  bottom: "#c74f83",
  glyph: () => (
    <path d="M19.5 16.8 L32 24 L19.5 31.2 Z" fill={GLYPH_INK} stroke={GLYPH_INK} strokeLinejoin="round" />
  ),
};

/** The bound icon component of "video": a module-level arrow over the shared
 *  fluent face, the plate frozen in the closure at load. */
export const VideoIcon: ComponentType<AppIconProps> = (props: AppIconProps) => (
  <FluentIconFace {...props} uid="dti-video" plate={VideoIcon_PLATE} />
);

/** Audio — the native audio studio: an amber plate carrying the eighth note,
 *  its head and stem and its curling flag. */
const AudioIcon_PLATE: AppIconPlate = {
  top: "#e8943f",
  bottom: "#ad6217",
  glyph: () => (
    <>
      <ellipse cx="20.5" cy="30.5" rx="4.4" ry="3.6" fill={GLYPH_INK} stroke="none" />
      <path d="M24.9 30.2 V15.8" />
      <path d="M24.9 16 Q31.8 18 31.8 24.5" />
    </>
  ),
};

/** The bound icon component of "audio": a module-level arrow over the shared
 *  fluent face, the plate frozen in the closure at load. */
export const AudioIcon: ComponentType<AppIconProps> = (props: AppIconProps) => (
  <FluentIconFace {...props} uid="dti-audio" plate={AudioIcon_PLATE} />
);

/** Games — the native games shelf: a deep vermilion plate carrying the gamepad
 *  with its cross and studs. */
const GamesIcon_PLATE: AppIconPlate = {
  top: "#d75a45",
  bottom: "#9e2e1d",
  glyph: () => (
    <>
      <path d="M17.5 18.75 H30.5 C33 18.75 34.25 20.5 34.65 22.75 C34.8 25.5 34.9 28.75 33.4 30.1 C31.5 31.45 29.3 30.35 28.2 28.3 L27 26.25 H21 L19.8 28.3 C18.7 30.35 16.5 31.45 14.6 30.1 C13.1 28.75 13.2 25.5 13.35 22.75 C13.75 20.5 15 18.75 17.5 18.75 Z" />
      <path d="M20.3 21.7 V26.8 M17.75 24.25 H22.85" strokeWidth={STROKE_SOFT} />
      <circle cx="27.5" cy="22.6" r="1.7" fill={GLYPH_INK} stroke="none" />
      <circle cx="30.6" cy="25.8" r="1.7" fill={GLYPH_INK} stroke="none" />
    </>
  ),
};

/** The bound icon component of "games": a module-level arrow over the shared
 *  fluent face, the plate frozen in the closure at load. */
export const GamesIcon: ComponentType<AppIconProps> = (props: AppIconProps) => (
  <FluentIconFace {...props} uid="dti-games" plate={GamesIcon_PLATE} />
);

/** Argan — the cloud edge platform: a jade plate carrying the bold cloud,
 *  its puffs drawn as one silhouette. */
const ArganIcon_PLATE: AppIconPlate = {
  top: "#3cbd97",
  bottom: "#0f8a68",
  glyph: () => (
    <g fill={GLYPH_INK} stroke="none">
      <circle cx="17.4" cy="25.4" r="5.6" />
      <circle cx="25.6" cy="22.4" r="7.2" />
      <circle cx="31.6" cy="26.4" r="5" />
      <rect x="12" y="24.6" width="22.6" height="7.2" rx="3.6" />
    </g>
  ),
};

/** The bound icon component of "argan": a module-level arrow over the shared
 *  fluent face, the plate frozen in the closure at load. */
export const ArganIcon: ComponentType<AppIconProps> = (props: AppIconProps) => (
  <FluentIconFace {...props} uid="dti-argan" plate={ArganIcon_PLATE} />
);

/** Cadria — the audio studio: a magenta plate carrying the centered waveform
 *  of five rounded bars. */
const CadriaIcon_PLATE: AppIconPlate = {
  top: "#e070ab",
  bottom: "#a83a78",
  glyph: () => (
    <g fill={GLYPH_INK} stroke="none">
      <rect x="10.2" y="19" width="4.4" height="10" rx="2.2" />
      <rect x="16.1" y="16" width="4.4" height="16" rx="2.2" />
      <rect x="22" y="13" width="4.4" height="22" rx="2.2" />
      <rect x="27.9" y="16" width="4.4" height="16" rx="2.2" />
      <rect x="33.8" y="19" width="4.4" height="10" rx="2.2" />
    </g>
  ),
};

/** The bound icon component of "cadria": a module-level arrow over the shared
 *  fluent face, the plate frozen in the closure at load. */
export const CadriaIcon: ComponentType<AppIconProps> = (props: AppIconProps) => (
  <FluentIconFace {...props} uid="dti-cadria" plate={CadriaIcon_PLATE} />
);

/** Debonair — the music production studio: a bronze plate carrying the piano,
 *  its black keys and key seams cut back to the plate tone. */
const DebonairIcon_PLATE: AppIconPlate = {
  top: "#d29a3e",
  bottom: "#9b6512",
  glyph: (tone) => (
    <>
      <rect x="12.8" y="16.8" width="22.4" height="15" rx="3" fill={GLYPH_INK} stroke="none" />
      <g stroke={tone} strokeWidth="2.1">
        <path d="M18.4 31.3 V17.3" />
        <path d="M24 31.3 V17.3" />
        <path d="M29.6 31.3 V17.3" />
      </g>
      <g fill={tone} stroke="none">
        <rect x="16.85" y="17" width="3.1" height="6.6" rx="1.5" />
        <rect x="22.45" y="17" width="3.1" height="6.6" rx="1.5" />
        <rect x="28.05" y="17" width="3.1" height="6.6" rx="1.5" />
      </g>
    </>
  ),
};

/** The bound icon component of "debonair": a module-level arrow over the shared
 *  fluent face, the plate frozen in the closure at load. */
export const DebonairIcon: ComponentType<AppIconProps> = (props: AppIconProps) => (
  <FluentIconFace {...props} uid="dti-debonair" plate={DebonairIcon_PLATE} />
);

/** Stealthhead — the stealth ops surface: a coral plate carrying the visor,
 *  its viewing slit cut back to the plate tone. */
const StealthheadIcon_PLATE: AppIconPlate = {
  top: "#ef8b70",
  bottom: "#bb5540",
  glyph: (tone) => (
    <>
      <path
        d="M14.5 17 H33.5 Q36 17 36 19.5 V27.5 Q36 30 33.5 30 H26.6 L24 27.6 L21.4 30 H14.5 Q12 30 12 27.5 V19.5 Q12 17 14.5 17 Z"
        fill={GLYPH_INK}
        stroke="none"
      />
      <rect x="15.5" y="21" width="17" height="5.2" rx="2.6" fill={tone} stroke="none" />
    </>
  ),
};

/** The bound icon component of "stealthhead": a module-level arrow over the shared
 *  fluent face, the plate frozen in the closure at load. */
export const StealthheadIcon: ComponentType<AppIconProps> = (props: AppIconProps) => (
  <FluentIconFace {...props} uid="dti-stealthhead" plate={StealthheadIcon_PLATE} />
);

/** Forge — the ci forges: an umber plate carrying the anvil, its face and
 *  waist and flared base drawn as one silhouette. */
const ForgeIcon_PLATE: AppIconPlate = {
  top: "#b57d3f",
  bottom: "#7d521f",
  glyph: () => (
    <g fill={GLYPH_INK} stroke="none">
      <rect x="11.5" y="16.5" width="25" height="5.5" rx="2.2" />
      <rect x="20.2" y="21.5" width="7.6" height="6.5" rx="1.8" />
      <path d="M15 32.5 H33 L30.8 28 H17.2 Z" />
    </g>
  ),
};

/** The bound icon component of "forge": a module-level arrow over the shared
 *  fluent face, the plate frozen in the closure at load. */
export const ForgeIcon: ComponentType<AppIconProps> = (props: AppIconProps) => (
  <FluentIconFace {...props} uid="dti-forge" plate={ForgeIcon_PLATE} />
);

/** Foundry — the artifact foundry: a slate plate carrying the layers, the
 *  solid top sheet over its two chevron shelves. */
const FoundryIcon_PLATE: AppIconPlate = {
  top: "#a4abb6",
  bottom: "#6b7381",
  glyph: () => (
    <>
      <path d="M24 13 L36.4 20 L24 27 L11.6 20 Z" fill={GLYPH_INK} stroke="none" />
      <path d="M12.8 24.5 L24 30.8 L35.2 24.5" strokeWidth={STROKE_SOFT} />
      <path d="M12.8 29.7 L24 36 L35.2 29.7" strokeWidth={STROKE_SOFT} />
    </>
  ),
};

/** The bound icon component of "foundry": a module-level arrow over the shared
 *  fluent face, the plate frozen in the closure at load. */
export const FoundryIcon: ComponentType<AppIconProps> = (props: AppIconProps) => (
  <FluentIconFace {...props} uid="dti-foundry" plate={FoundryIcon_PLATE} />
);

/** Vault — the storage vault: a deep-gold plate carrying the shield, its
 *  keyhole cut back to the plate tone. */
const VaultIcon_PLATE: AppIconPlate = {
  top: "#d9b45a",
  bottom: "#9c7a26",
  glyph: (tone) => (
    <>
      <path
        d="M24 12.5 L35 16.6 V25.2 Q35 33.4 24 37.9 Q13 33.4 13 25.2 V16.6 Z"
        fill={GLYPH_INK}
        stroke="none"
      />
      <circle cx="24" cy="22.3" r="3.5" fill={tone} stroke="none" />
      <path d="M22.6 24.3 L21.2 31 H26.8 L25.4 24.3 Z" fill={tone} stroke="none" />
    </>
  ),
};

/** The bound icon component of "vault": a module-level arrow over the shared
 *  fluent face, the plate frozen in the closure at load. */
export const VaultIcon: ComponentType<AppIconProps> = (props: AppIconProps) => (
  <FluentIconFace {...props} uid="dti-vault" plate={VaultIcon_PLATE} />
);

/** Getry — the family gateway: a sage plate carrying the route, its waypoint
 *  dot and its S-curve rising into the arrowhead. */
const GetryIcon_PLATE: AppIconPlate = {
  top: "#7fb99a",
  bottom: "#4c7f63",
  glyph: () => (
    <>
      <circle cx="15.5" cy="33.2" r="3.1" fill={GLYPH_INK} stroke="none" />
      <path d="M15.5 33.2 q0 -9 9 -9 q9 0 9 -9" />
      <path d="M30.5 18.5 L33.5 15.2 L36.5 18.5" />
    </>
  ),
};

/** The bound icon component of "getry": a module-level arrow over the shared
 *  fluent face, the plate frozen in the closure at load. */
export const GetryIcon: ComponentType<AppIconProps> = (props: AppIconProps) => (
  <FluentIconFace {...props} uid="dti-getry" plate={GetryIcon_PLATE} />
);

/** Saddle — the sandbox engine: a taupe plate carrying the crate drawn in
 *  light isometric, its top face seamed. */
const SaddleIcon_PLATE: AppIconPlate = {
  top: "#c3ae86",
  bottom: "#8a7448",
  glyph: () => (
    <>
      <path d="M24 14.5 L34.8 20.4 V30.9 L24 36.8 L13.2 30.9 V20.4 Z" />
      <path d="M13.2 20.4 L24 26.3 L34.8 20.4 M24 26.3 V36.8" strokeWidth={STROKE_SOFT} />
    </>
  ),
};

/** The bound icon component of "saddle": a module-level arrow over the shared
 *  fluent face, the plate frozen in the closure at load. */
export const SaddleIcon: ComponentType<AppIconProps> = (props: AppIconProps) => (
  <FluentIconFace {...props} uid="dti-saddle" plate={SaddleIcon_PLATE} />
);

/**
 * The fluent icon set of the shell, keyed by the registry `iconset` field:
 * the desktop grid, the taskbar and the Start menu all reach their icons here.
 */
export const APP_ICONS: Record<string, ComponentType<AppIconProps>> = {
  chat: ChatIcon,
  files: FilesIcon,
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
  calculator: CalculatorIcon,
  image: ImageIcon,
  video: VideoIcon,
  audio: AudioIcon,
  games: GamesIcon,
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
