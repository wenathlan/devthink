/**
 * appicons.tsx — the premium drawn icon set of the Sol shell. One drawn
 * SVG component per desktop app (appregistry.ts), exported through the
 * APP_ICONS map the app tile reads by the registry `iconset` key.
 *
 * The grammar every icon follows is the studio-light squircle: the shared
 * 48x48 plate (the squircle feel at a ~12% corner radius) painted with a
 * three-stop identity gradient derived from each app's registry tint — a
 * lit cap at the top (the one light source of the mark), the pure tint
 * through the body, and the deep base settling underneath — so the plate
 * reads as one lit surface instead of a flat fill. The depth stays inner
 * and disciplined: the rim light along the top shoulders, a soft grounded
 * shade along the bottom edge, no gloss, no grain, no tilt, no tinted
 * glow. On hover the tile raises the live flag and the stylesheet answers
 * with one quiet specular sweep across the face while the glyph lifts
 * half a unit and breathes three percent.
 *
 * One plate helper renders the shared material keyed on unique ids per
 * app icon (dti-<key>): the identity gradient itself (userSpaceOnUse, so
 * any shape — the glyph cutouts included — samples the exact plate color
 * at its own position), the rim-light and bottom-shade strokes clipped
 * inside the plate, the sheen sweep band and the clip. The glyphs are
 * compact paths — bold filled silhouettes for the app identities, round
 * capped strokes for the line work, translucent white second planes for
 * layered depth — every mark living inside the ~11..37 optical band
 * around the plate center and carrying at most one plate-toned cutout
 * idea (the chat dots, the gear bore, the vault keyhole) so the set
 * stays legible from the 16px taskbar pin through the 32px start cell to
 * the desktop tile.
 *
 * The components stay pure presentational: props in, svg out — no hooks,
 * no injected stylesheet, no external assets, no raster. The size prop
 * pins the square box in px and, omitted, the icon fills its tile box
 * (the app tile contract of apptile.tsx). The identity of every app
 * rides its own tint from the registry: argan the jade cloud, cadria the
 * magenta waveform, debonair the bronze piano, forge the umber anvil,
 * foundry the slate strata, getry the sage route, saddle the taupe
 * crate, stealthhead the coral visor, vault the deep-gold shield — the
 * family shares one plate material and one glyph discipline while every
 * member keeps its own silhouette, and the os surfaces ride their own
 * calm hues over the same plate.
 */
import type { ComponentType, CSSProperties, ReactElement } from "react";

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

/** mixes a hex color toward white (t > 0) or toward black (t < 0) in sRGB —
 *  the tiny gain the identity gradient spends on its lit cap and its
 *  grounded base without a third hand-picked constant per app */
function shade(hex: string, t: number): string {
  const channel = Number.parseInt(hex.slice(1), 16);
  const r = (channel >> 16) & 0xff;
  const g = (channel >> 8) & 0xff;
  const b = channel & 0xff;
  const mix = (c: number) => Math.round(t >= 0 ? c + (255 - c) * t : c * (1 + t));
  const part = (c: number) => mix(c).toString(16).padStart(2, "0");
  return `#${part(r)}${part(g)}${part(b)}`;
}

/** the recipe of one fluent icon: the identity gradient of the app tint
 *  and the bold glyph centered on it */
type AppIconPlate = {
  /** the lighter top tone of the plate gradient */
  top: string;
  /** the deeper base tone the plate settles into */
  bottom: string;
  /** draws the glyph; the `tone` argument carries the plate gradient url
   *  the cutout details (chat dots, bores, keyholes) fill with */
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
 * with its gradient defs (unique ids per app icon) — the three-stop
 * identity gradient (the lit cap, the pure tint, the deep base), the rim
 * light and the grounded shade clipped inside the plate, and the sheen
 * sweep band the stylesheet drives on the live flag. The gradients ride
 * userSpaceOnUse, so any shape — glyph cutouts included — samples the
 * exact plate color at its own position.
 */
function Plate({ uid, top, bottom }: { uid: string; top: string; bottom: string }) {
  return (
    <>
      <defs>
        {/* the identity gradient: the lit cap into the pure tint into the
            deep base — one baked surface the cutouts share exactly */}
        <linearGradient id={`${uid}-tone`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="48">
          <stop offset="0" stopColor={shade(top, 0.2)} />
          <stop offset=".45" stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
        <linearGradient id={`${uid}-edge`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="26">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".5" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${uid}-shad`} gradientUnits="userSpaceOnUse" x1="0" y1="24" x2="0" y2="48">
          <stop offset="0" stopColor="#000000" stopOpacity="0" />
          <stop offset="1" stopColor="#000000" stopOpacity=".3" />
        </linearGradient>
        {/* the specular band the live sweep drives across the face */}
        <linearGradient id={`${uid}-sweep`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="9" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset=".5" stopColor="#ffffff" stopOpacity=".55" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${uid}-clip`}>
          <path d={PLATE_FACE} />
        </clipPath>
      </defs>
      {/* the face: the three-stop identity gradient of the app tint */}
      <path d={PLATE_FACE} fill={`url(#${uid}-tone)`} />
      {/* the inner finish: the rim light along the top shoulders and the
          soft grounded shade along the bottom edge, both clipped inside */}
      <g clipPath={`url(#${uid}-clip)`}>
        <path d={PLATE_FACE} fill="none" stroke={`url(#${uid}-edge)`} strokeWidth="2.4" />
        <path d={PLATE_FACE} fill="none" stroke={`url(#${uid}-shad)`} strokeWidth="2.6" />
      </g>
    </>
  );
}

/** The shared face every icon renders through: the plate helper under the
 *  bold glyph group and the clipped sheen band over it, the box pinned by
 *  the size prop or filling the tile. One component identity for the whole
 *  icon wall; the per-icon identity arrives by the plate spec the bound
 *  wrapper froze in its closure. */
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
      {/* the live sheen: one clipped specular band the stylesheet sweeps
          across the face while the tile is live */}
      <g clipPath={`url(#${uid}-clip)`}>
        <rect className="dtIconSheen" x="-12" y="-2" width="9" height="52" fill={`url(#${uid}-sweep)`} />
      </g>
    </svg>
  );
}

/* ------------------------------- the icons --------------------------------- */

/** Chat — the assistant of the OS: an azure plate carrying the speech
 *  bubble drawn as one silhouette, its tail sweeping down-left and its
 *  three dots cut back to the plate tone. */
const ChatIcon_PLATE: AppIconPlate = {
  top: "#e08862",
  bottom: "#b3532f",
  glyph: (tone) => (
    <>
      <path
        d="M19 13.2 H29 Q35.6 13.2 35.6 19.8 Q35.6 26.4 29 26.4 H19 Q12.4 26.4 12.4 19.8 Q12.4 13.2 19 13.2 Z"
        fill={GLYPH_INK}
        stroke="none"
      />
      <path
        d="M18.2 24.8 L14.9 32.9 Q13.7 35.2 16.2 34.1 L24.2 30.6 Q25.9 29.8 25.1 28.4 Q24.4 27.2 22.6 26.2 Z"
        fill={GLYPH_INK}
        stroke="none"
      />
      <circle cx="18.8" cy="19.8" r="1.9" fill={tone} stroke="none" />
      <circle cx="24" cy="19.8" r="1.9" fill={tone} stroke="none" />
      <circle cx="29.2" cy="19.8" r="1.9" fill={tone} stroke="none" />
    </>
  ),
};

/** The bound icon component of "chat": a module-level arrow over the shared
 *  fluent face, the plate frozen in the closure at load. */
export const ChatIcon: ComponentType<AppIconProps> = (props: AppIconProps) => (
  <FluentIconFace {...props} uid="dti-chat" plate={ChatIcon_PLATE} />
);

/** My Files — the file explorer of the OS: a gold plate carrying the folder
 *  in two planes, the translucent back panel with its tab behind the solid
 *  front plane. */
const FilesIcon_PLATE: AppIconPlate = {
  top: "#f2c53d",
  bottom: "#c99713",
  glyph: () => (
    <>
      <path
        d="M14 14.9 H21 L24.4 18.8 H33.8 Q36.1 18.8 36.1 21.1 V23.3 H11.9 V17.2 Q11.9 14.9 14 14.9 Z"
        fill={GLYPH_INK}
        stroke="none"
        opacity=".5"
      />
      <path
        d="M11.9 22.7 H36.1 V31.9 Q36.1 34.3 33.7 34.3 H14.3 Q11.9 34.3 11.9 31.9 Z"
        fill={GLYPH_INK}
        stroke="none"
      />
    </>
  ),
};

/** The bound icon component of "files": a module-level arrow over the shared
 *  fluent face, the plate frozen in the closure at load. */
export const FilesIcon: ComponentType<AppIconProps> = (props: AppIconProps) => (
  <FluentIconFace {...props} uid="dti-files" plate={FilesIcon_PLATE} />
);

/** History — the session archive: a sand plate carrying the clock drawn as
 *  a filled coin, its hands and its rewind notch cut back to the plate
 *  tone — the notch at ten o'clock marks the counterclockwise rewind. */
const HistoryIcon_PLATE: AppIconPlate = {
  top: "#bfa87f",
  bottom: "#8f7a55",
  glyph: (tone) => (
    <>
      <circle cx="24" cy="24.6" r="10.8" fill={GLYPH_INK} stroke="none" />
      <path d="M24 19.2 V24.6 L28.3 27.1" stroke={tone} strokeWidth={STROKE_SOFT + 0.4} />
      <path d="M14.9 19.3 L19.2 15.4 L17.6 21.8 Z" fill={tone} stroke="none" />
    </>
  ),
};

/** The bound icon component of "history": a module-level arrow over the shared
 *  fluent face, the plate frozen in the closure at load. */
export const HistoryIcon: ComponentType<AppIconProps> = (props: AppIconProps) => (
  <FluentIconFace {...props} uid="dti-history" plate={HistoryIcon_PLATE} />
);

/** Projects — the workspace records: a teal plate carrying the board filled
 *  solid, its three uneven columns of pinned work cut back to the plate
 *  tone and hanging from the top rail. */
const ProjectsIcon_PLATE: AppIconPlate = {
  top: "#43dcc8",
  bottom: "#17a99a",
  glyph: (tone) => (
    <>
      <path
        d="M17.6 14.4 H30.4 Q35 14.4 35 19 V30.4 Q35 35 30.4 35 H17.6 Q13 35 13 30.4 V19 Q13 14.4 17.6 14.4 Z"
        fill={GLYPH_INK}
        stroke="none"
      />
      <rect x="16.7" y="17.2" width="4.1" height="9.2" rx="2.05" fill={tone} stroke="none" />
      <rect x="21.95" y="17.2" width="4.1" height="13.4" rx="2.05" fill={tone} stroke="none" />
      <rect x="27.2" y="17.2" width="4.1" height="6.4" rx="2.05" fill={tone} stroke="none" />
    </>
  ),
};

/** The bound icon component of "projects": a module-level arrow over the shared
 *  fluent face, the plate frozen in the closure at load. */
export const ProjectsIcon: ComponentType<AppIconProps> = (props: AppIconProps) => (
  <FluentIconFace {...props} uid="dti-projects" plate={ProjectsIcon_PLATE} />
);

/** Console — the canonical CLI design: a green terminal plate carrying the
 *  prompt chevron and its waiting underscore in one bold weight. */
const ConsoleIcon_PLATE: AppIconPlate = {
  top: "#4ed687",
  bottom: "#2ba361",
  glyph: () => (
    <>
      <path d="M15.2 16.9 L23.6 24 L15.2 31.1" strokeWidth={3.8} />
      <path d="M27.2 30.9 H34.6" strokeWidth={3.8} />
    </>
  ),
};

/** The bound icon component of "console": a module-level arrow over the shared
 *  fluent face, the plate frozen in the closure at load. */
export const ConsoleIcon: ComponentType<AppIconProps> = (props: AppIconProps) => (
  <FluentIconFace {...props} uid="dti-console" plate={ConsoleIcon_PLATE} />
);

/** Gateway — the local gateway console: a brass plate carrying the network —
 *  one diamond hub wired by four soft curves to its four corner nodes. */
const GatewayIcon_PLATE: AppIconPlate = {
  top: "#c9a74c",
  bottom: "#9a772a",
  glyph: () => (
    <>
      <g strokeWidth={STROKE_SOFT}>
        <path d="M24 24 C20.9 20.9 18.4 18.4 15.5 15.5" />
        <path d="M24 24 C27.1 20.9 29.6 18.4 32.5 15.5" />
        <path d="M24 24 C20.9 27.1 18.4 29.6 15.5 32.5" />
        <path d="M24 24 C27.1 27.1 29.6 29.6 32.5 32.5" />
      </g>
      <rect x="21" y="21" width="6" height="6" rx="1.9" fill={GLYPH_INK} stroke="none" transform="rotate(45 24 24)" />
      <circle cx="15" cy="15" r="3.1" fill={GLYPH_INK} stroke="none" />
      <circle cx="33" cy="15" r="3.1" fill={GLYPH_INK} stroke="none" />
      <circle cx="15" cy="33" r="3.1" fill={GLYPH_INK} stroke="none" />
      <circle cx="33" cy="33" r="3.1" fill={GLYPH_INK} stroke="none" />
    </>
  ),
};

/** The bound icon component of "gateway": a module-level arrow over the shared
 *  fluent face, the plate frozen in the closure at load. */
export const GatewayIcon: ComponentType<AppIconProps> = (props: AppIconProps) => (
  <FluentIconFace {...props} uid="dti-gateway" plate={GatewayIcon_PLATE} />
);

/** Providers — the provider and model choices: a lime plate carrying the
 *  plug with its two prongs, its rounded body and its cord ending in the
 *  pin. */
const ProvidersIcon_PLATE: AppIconPlate = {
  top: "#adec44",
  bottom: "#83bc17",
  glyph: () => (
    <>
      <path d="M20.9 12.6 V17.3" />
      <path d="M27.1 12.6 V17.3" />
      <path
        d="M21 16.9 H27 Q31.4 16.9 31.4 21.3 V24.1 Q31.4 28.5 27 28.5 H21 Q16.6 28.5 16.6 24.1 V21.3 Q16.6 16.9 21 16.9 Z"
        fill={GLYPH_INK}
        stroke="none"
      />
      <path d="M24 28.5 V31.6 Q24 35 27.4 35 H32.6" strokeWidth={STROKE_SOFT} />
      <circle cx="34" cy="35" r="1.7" fill={GLYPH_INK} stroke="none" />
    </>
  ),
};

/** The bound icon component of "providers": a module-level arrow over the shared
 *  fluent face, the plate frozen in the closure at load. */
export const ProvidersIcon: ComponentType<AppIconProps> = (props: AppIconProps) => (
  <FluentIconFace {...props} uid="dti-providers" plate={ProvidersIcon_PLATE} />
);

/** Usage — the local usage records: a sage plate carrying the meter — a
 *  quiet baseline rail under three ascending bars of stepped depth. */
const UsageIcon_PLATE: AppIconPlate = {
  top: "#96b89e",
  bottom: "#66896e",
  glyph: () => (
    <>
      <path d="M12.8 33.6 H35.2" strokeWidth={STROKE_SOFT} />
      <rect x="15.7" y="24.2" width="4.6" height="9.4" rx="2.3" fill={GLYPH_INK} stroke="none" opacity=".6" />
      <rect x="21.7" y="19.7" width="4.6" height="13.9" rx="2.3" fill={GLYPH_INK} stroke="none" opacity=".8" />
      <rect x="27.7" y="15.2" width="4.6" height="18.4" rx="2.3" fill={GLYPH_INK} stroke="none" />
    </>
  ),
};

/** The bound icon component of "usage": a module-level arrow over the shared
 *  fluent face, the plate frozen in the closure at load. */
export const UsageIcon: ComponentType<AppIconProps> = (props: AppIconProps) => (
  <FluentIconFace {...props} uid="dti-usage" plate={UsageIcon_PLATE} />
);

/** Routes — the stream health: a rose-taupe plate carrying two feeds curving
 *  into one stem and its bold arrowhead. */
const RoutesIcon_PLATE: AppIconPlate = {
  top: "#c9a894",
  bottom: "#93715d",
  glyph: () => (
    <>
      <path d="M14.3 15.9 Q22.6 15.9 26.2 24" strokeWidth={3.3} />
      <path d="M14.3 32.1 Q22.6 32.1 26.2 24" strokeWidth={3.3} />
      <path d="M26.2 24 H30" strokeWidth={3.3} />
      <circle cx="14.3" cy="15.9" r="2.9" fill={GLYPH_INK} stroke="none" />
      <circle cx="14.3" cy="32.1" r="2.9" fill={GLYPH_INK} stroke="none" />
      <path d="M29.6 19.7 L35.8 24 L29.6 28.3 Z" fill={GLYPH_INK} stroke="none" />
    </>
  ),
};

/** The bound icon component of "routes": a module-level arrow over the shared
 *  fluent face, the plate frozen in the closure at load. */
export const RoutesIcon: ComponentType<AppIconProps> = (props: AppIconProps) => (
  <FluentIconFace {...props} uid="dti-routes" plate={RoutesIcon_PLATE} />
);

/** Docs — the documentation library: a pale slate plate carrying the sheet
 *  with its folded corner and its plate-toned lines, the second leaf riding
 *  translucent behind it. */
const DocsIcon_PLATE: AppIconPlate = {
  top: "#c3cfdc",
  bottom: "#93a5b8",
  glyph: (tone) => (
    <>
      <path
        d="M18.3 15.6 H25 L30.8 21.4 V32.4 Q30.8 34.5 28.7 34.5 H18.3 Q16.2 34.5 16.2 32.4 V17.7 Q16.2 15.6 18.3 15.6 Z"
        fill={GLYPH_INK}
        stroke="none"
        opacity=".42"
        transform="translate(2.7 -2.5)"
      />
      <path
        d="M18.3 15.6 H25 L30.8 21.4 V32.4 Q30.8 34.5 28.7 34.5 H18.3 Q16.2 34.5 16.2 32.4 V17.7 Q16.2 15.6 18.3 15.6 Z"
        fill={GLYPH_INK}
        stroke="none"
      />
      <path d="M25 15.6 L30.8 21.4 H25 Z" fill={tone} stroke="none" />
      <path d="M19.6 25.4 H27.6 M19.6 29.6 H24.4" stroke={tone} strokeWidth={STROKE_SOFT - 0.2} />
    </>
  ),
};

/** The bound icon component of "docs": a module-level arrow over the shared
 *  fluent face, the plate frozen in the closure at load. */
export const DocsIcon: ComponentType<AppIconProps> = (props: AppIconProps) => (
  <FluentIconFace {...props} uid="dti-docs" plate={DocsIcon_PLATE} />
);

/** Explore — the exploration gallery: a terracotta plate carrying the
 *  compass drawn as a filled coin, its needle cut back to the plate tone —
 *  solid north, translucent south. */
const ExploreIcon_PLATE: AppIconPlate = {
  top: "#d69a88",
  bottom: "#a15c4b",
  glyph: (tone) => (
    <>
      <circle cx="24" cy="24" r="11.2" fill={GLYPH_INK} stroke="none" />
      <path d="M24 14.6 L27.1 24 H20.9 Z" fill={tone} stroke="none" />
      <path d="M24 33.4 L27.1 24 H20.9 Z" fill={tone} stroke="none" opacity=".5" />
      <circle cx="24" cy="24" r="1.7" fill={GLYPH_INK} stroke="none" />
    </>
  ),
};

/** The bound icon component of "explore": a module-level arrow over the shared
 *  fluent face, the plate frozen in the closure at load. */
export const ExploreIcon: ComponentType<AppIconProps> = (props: AppIconProps) => (
  <FluentIconFace {...props} uid="dti-explore" plate={ExploreIcon_PLATE} />
);

/** OS — the family operating surface: a steel plate carrying the window
 *  drawn as one filled rounded square, its four panes cut back to the
 *  plate tone by the cross seam. */
const OsIcon_PLATE: AppIconPlate = {
  top: "#8fabcf",
  bottom: "#4f6d99",
  glyph: (tone) => (
    <>
      <rect x="12.6" y="12.6" width="22.8" height="22.8" rx="4.6" fill={GLYPH_INK} stroke="none" />
      <rect x="22.9" y="12.6" width="2.2" height="22.8" fill={tone} stroke="none" />
      <rect x="12.6" y="22.9" width="22.8" height="2.2" fill={tone} stroke="none" />
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
  top: "#a1aebf",
  bottom: "#6f7f90",
  glyph: (tone) => (
    <>
      <g fill={GLYPH_INK} stroke="none">
        <rect x="21.8" y="10.6" width="4.4" height="26.8" rx="2.2" />
        <rect x="21.8" y="10.6" width="4.4" height="26.8" rx="2.2" transform="rotate(45 24 24)" />
        <rect x="21.8" y="10.6" width="4.4" height="26.8" rx="2.2" transform="rotate(90 24 24)" />
        <rect x="21.8" y="10.6" width="4.4" height="26.8" rx="2.2" transform="rotate(135 24 24)" />
        <circle cx="24" cy="24" r="10.3" />
      </g>
      <circle cx="24" cy="24" r="4.5" fill={tone} stroke="none" />
    </>
  ),
};

/** The bound icon component of "settings": a module-level arrow over the shared
 *  fluent face, the plate frozen in the closure at load. */
export const SettingsIcon: ComponentType<AppIconProps> = (props: AppIconProps) => (
  <FluentIconFace {...props} uid="dti-settings" plate={SettingsIcon_PLATE} />
);

/** Calculator — the native arithmetic app: a pale steel plate carrying the
 *  keypad filled solid, its display, its four keys and its equals column
 *  cut back to the plate tone. */
const CalculatorIcon_PLATE: AppIconPlate = {
  top: "#aab6c2",
  bottom: "#7c8894",
  glyph: (tone) => (
    <>
      <rect x="14.1" y="12.5" width="19.8" height="23.6" rx="3.7" fill={GLYPH_INK} stroke="none" />
      <rect x="17.3" y="15.9" width="13.4" height="4.8" rx="1.7" fill={tone} stroke="none" />
      <circle cx="19.9" cy="25.7" r="1.9" fill={tone} stroke="none" />
      <circle cx="24" cy="25.7" r="1.9" fill={tone} stroke="none" />
      <circle cx="19.9" cy="30.2" r="1.9" fill={tone} stroke="none" />
      <circle cx="24" cy="30.2" r="1.9" fill={tone} stroke="none" />
      <rect x="27.3" y="23.8" width="3.4" height="11.3" rx="1.7" fill={tone} stroke="none" />
    </>
  ),
};

/** The bound icon component of "calculator": a module-level arrow over the shared
 *  fluent face, the plate frozen in the closure at load. */
export const CalculatorIcon: ComponentType<AppIconProps> = (props: AppIconProps) => (
  <FluentIconFace {...props} uid="dti-calculator" plate={CalculatorIcon_PLATE} />
);

/** Image — the native image studio: a violet plate carrying the photo —
 *  the filled frame, its interior cut back to the plate tone and its
 *  landscape redrawn in white inside the cut. */
const ImageIcon_PLATE: AppIconPlate = {
  top: "#c795f7",
  bottom: "#9a5fe0",
  glyph: (tone) => (
    <>
      <rect x="12.9" y="14.3" width="22.2" height="19.4" rx="3.7" fill={GLYPH_INK} stroke="none" />
      <rect x="16" y="17.4" width="16" height="13.2" rx="1.9" fill={tone} stroke="none" />
      <path d="M17.6 30.6 L22.5 24 L25.7 28.1 L28 25.2 L30.6 30.6 Z" fill={GLYPH_INK} stroke="none" />
      <circle cx="28.1" cy="21.3" r="2" fill={GLYPH_INK} stroke="none" />
    </>
  ),
};

/** The bound icon component of "image": a module-level arrow over the shared
 *  fluent face, the plate frozen in the closure at load. */
export const ImageIcon: ComponentType<AppIconProps> = (props: AppIconProps) => (
  <FluentIconFace {...props} uid="dti-image" plate={ImageIcon_PLATE} />
);

/** Video — the native video editor: a rose plate carrying the clapperboard
 *  — the hinged top bar with its slats cut back to the plate tone, the
 *  seam of air under it and the small play wedge cut in the body. */
const VideoIcon_PLATE: AppIconPlate = {
  top: "#f686bf",
  bottom: "#d94f92",
  glyph: (tone) => (
    <>
      <rect x="12.7" y="14.2" width="22.6" height="5.4" rx="2.3" fill={GLYPH_INK} stroke="none" />
      <rect x="12.7" y="20.9" width="22.6" height="13.6" rx="2.8" fill={GLYPH_INK} stroke="none" />
      <path d="M19.2 14.2 L17.1 19.6 M25.6 14.2 L23.5 19.6 M32 14.2 L29.9 19.6" stroke={tone} strokeWidth={2.2} />
      <path d="M21.6 24.3 L28.3 27.7 L21.6 31.1 Z" fill={tone} stroke="none" />
    </>
  ),
};

/** The bound icon component of "video": a module-level arrow over the shared
 *  fluent face, the plate frozen in the closure at load. */
export const VideoIcon: ComponentType<AppIconProps> = (props: AppIconProps) => (
  <FluentIconFace {...props} uid="dti-video" plate={VideoIcon_PLATE} />
);

/** Audio — the native audio studio: an amber plate carrying the beamed
 *  eighth-note pair, its two heads, its two stems and the thick beam. */
const AudioIcon_PLATE: AppIconPlate = {
  top: "#e3a542",
  bottom: "#b0741a",
  glyph: () => (
    <>
      <ellipse cx="18.4" cy="31.9" rx="4.2" ry="3.4" fill={GLYPH_INK} stroke="none" />
      <ellipse cx="29.6" cy="29.9" rx="4.2" ry="3.4" fill={GLYPH_INK} stroke="none" />
      <path d="M22.6 31.5 V15.2" strokeWidth={2.9} />
      <path d="M33.8 29.5 V14.2" strokeWidth={2.9} />
      <path d="M22.6 15.2 L33.8 14.2" strokeWidth={4.4} />
    </>
  ),
};

/** The bound icon component of "audio": a module-level arrow over the shared
 *  fluent face, the plate frozen in the closure at load. */
export const AudioIcon: ComponentType<AppIconProps> = (props: AppIconProps) => (
  <FluentIconFace {...props} uid="dti-audio" plate={AudioIcon_PLATE} />
);

/** Games — the native games shelf: a vermilion plate carrying the gamepad
 *  filled solid, its cross and its two studs cut back to the plate tone. */
const GamesIcon_PLATE: AppIconPlate = {
  top: "#ec6a54",
  bottom: "#c03824",
  glyph: (tone) => (
    <>
      <path
        d="M17.3 17.4 H30.7 Q33.6 17.4 34.6 20.2 Q35.6 23 35.4 26.8 Q35.3 29.5 33.2 30.5 Q31.1 31.4 29.2 29.8 Q27.9 28.7 27.1 27.4 Q26.6 26.6 25.7 26.6 H22.3 Q21.4 26.6 20.9 27.4 Q20.1 28.7 18.8 29.8 Q16.9 31.4 14.8 30.5 Q12.7 29.5 12.6 26.8 Q12.4 23 13.4 20.2 Q14.4 17.4 17.3 17.4 Z"
        fill={GLYPH_INK}
        stroke="none"
      />
      <path d="M20.1 20.7 V24.9 M18 22.8 H22.2" stroke={tone} strokeWidth={2.6} />
      <circle cx="28.7" cy="21.9" r="1.6" fill={tone} stroke="none" />
      <circle cx="31.4" cy="25.1" r="1.6" fill={tone} stroke="none" />
    </>
  ),
};

/** The bound icon component of "games": a module-level arrow over the shared
 *  fluent face, the plate frozen in the closure at load. */
export const GamesIcon: ComponentType<AppIconProps> = (props: AppIconProps) => (
  <FluentIconFace {...props} uid="dti-games" plate={GamesIcon_PLATE} />
);

/** Argan — the cloud edge platform: a jade plate carrying the bold cloud,
 *  the back puff riding translucent above its left shoulder. */
const ArganIcon_PLATE: AppIconPlate = {
  top: "#17b878",
  bottom: "#068a55",
  glyph: () => (
    <>
      <circle cx="16.1" cy="22.9" r="4.4" fill={GLYPH_INK} stroke="none" opacity=".5" />
      <g fill={GLYPH_INK} stroke="none">
        <circle cx="17.6" cy="26.5" r="5.4" />
        <circle cx="25.4" cy="22.3" r="7.1" />
        <circle cx="31.9" cy="26.3" r="4.9" />
        <rect x="12.4" y="25.4" width="23.4" height="6.6" rx="3.3" />
      </g>
    </>
  ),
};

/** The bound icon component of "argan": a module-level arrow over the shared
 *  fluent face, the plate frozen in the closure at load. */
export const ArganIcon: ComponentType<AppIconProps> = (props: AppIconProps) => (
  <FluentIconFace {...props} uid="dti-argan" plate={ArganIcon_PLATE} />
);

/** Cadria — the audio studio: a magenta plate carrying the live waveform —
 *  five rounded bars of uneven breath, the tall bar off-center. */
const CadriaIcon_PLATE: AppIconPlate = {
  top: "#ef5fa4",
  bottom: "#cd2f7e",
  glyph: () => (
    <g fill={GLYPH_INK} stroke="none">
      <rect x="10.1" y="18.8" width="4.2" height="10.4" rx="2.1" />
      <rect x="16.1" y="15.9" width="4.2" height="16.2" rx="2.1" />
      <rect x="22.1" y="12.6" width="4.2" height="22.8" rx="2.1" />
      <rect x="28.1" y="17.2" width="4.2" height="13.6" rx="2.1" />
      <rect x="34.1" y="14.6" width="4.2" height="18.8" rx="2.1" />
    </g>
  ),
};

/** The bound icon component of "cadria": a module-level arrow over the shared
 *  fluent face, the plate frozen in the closure at load. */
export const CadriaIcon: ComponentType<AppIconProps> = (props: AppIconProps) => (
  <FluentIconFace {...props} uid="dti-cadria" plate={CadriaIcon_PLATE} />
);

/** Debonair — the music production studio: a bronze plate carrying the
 *  piano — five white keys seamed to the plate tone, two black keys
 *  riding the upper half. */
const DebonairIcon_PLATE: AppIconPlate = {
  top: "#d3a54e",
  bottom: "#a87a29",
  glyph: (tone) => (
    <>
      <rect x="12.3" y="16" width="23.4" height="16.8" rx="3.1" fill={GLYPH_INK} stroke="none" />
      <g stroke={tone} strokeWidth={1.9}>
        <path d="M16.98 16 V32.8" />
        <path d="M21.66 16 V32.8" />
        <path d="M26.34 16 V32.8" />
        <path d="M31.02 16 V32.8" />
      </g>
      <g fill={tone} stroke="none">
        <rect x="17.82" y="16" width="3" height="7.6" rx="1.2" />
        <rect x="22.5" y="16" width="3" height="7.6" rx="1.2" />
      </g>
    </>
  ),
};

/** The bound icon component of "debonair": a module-level arrow over the shared
 *  fluent face, the plate frozen in the closure at load. */
export const DebonairIcon: ComponentType<AppIconProps> = (props: AppIconProps) => (
  <FluentIconFace {...props} uid="dti-debonair" plate={DebonairIcon_PLATE} />
);

/** Stealthhead — the stealth ops surface: a coral plate carrying the visor
 *  — the faceted helmet mask with its angled cheeks and its viewing slit
 *  cut back to the plate tone. */
const StealthheadIcon_PLATE: AppIconPlate = {
  top: "#f67a62",
  bottom: "#d84b33",
  glyph: (tone) => (
    <>
      <path
        d="M13.6 15.8 H34.4 L36.3 21.3 Q36.7 22.5 36.1 23.6 L33.2 29.3 Q32.6 30.4 31.3 30.4 H27.3 L24 27.4 L20.7 30.4 H16.7 Q15.4 30.4 14.8 29.3 L11.9 23.6 Q11.3 22.5 11.7 21.3 Z"
        fill={GLYPH_INK}
        stroke="none"
      />
      <path
        d="M16.2 20.3 H31.8 Q32.7 20.3 32.7 21.2 V23.5 Q32.7 24.4 31.8 24.4 H16.2 Q15.3 24.4 15.3 23.5 V21.2 Q15.3 20.3 16.2 20.3 Z"
        fill={tone}
        stroke="none"
      />
    </>
  ),
};

/** The bound icon component of "stealthhead": a module-level arrow over the shared
 *  fluent face, the plate frozen in the closure at load. */
export const StealthheadIcon: ComponentType<AppIconProps> = (props: AppIconProps) => (
  <FluentIconFace {...props} uid="dti-stealthhead" plate={StealthheadIcon_PLATE} />
);

/** Forge — the ci forges: an umber plate carrying the anvil drawn as one
 *  silhouette — the top face with its horn curling left, the waist and
 *  the flared base. */
const ForgeIcon_PLATE: AppIconPlate = {
  top: "#c08a48",
  bottom: "#96602a",
  glyph: () => (
    <g fill={GLYPH_INK} stroke="none">
      <path d="M35.3 16.3 H15.4 Q13.3 16.3 11.9 17.9 L11.4 18.6 Q10.7 19.6 11.8 20.1 Q13 20.6 14.8 20.8 Q17.3 21 19 21.6 H35.3 Q36.5 21.6 36.5 20.4 V17.5 Q36.5 16.3 35.3 16.3 Z" />
      <path d="M22.7 21.6 H29.3 L28.1 27.5 H23.9 Z" />
      <path d="M15.2 32.8 H32.8 L30.6 28 H17.4 Z" />
    </g>
  ),
};

/** The bound icon component of "forge": a module-level arrow over the shared
 *  fluent face, the plate frozen in the closure at load. */
export const ForgeIcon: ComponentType<AppIconProps> = (props: AppIconProps) => (
  <FluentIconFace {...props} uid="dti-forge" plate={ForgeIcon_PLATE} />
);

/** Foundry — the artifact foundry: a steel plate carrying the strata — the
 *  solid top sheet over two filled chevron bands. */
const FoundryIcon_PLATE: AppIconPlate = {
  top: "#a6b0bb",
  bottom: "#79838e",
  glyph: () => (
    <g fill={GLYPH_INK} stroke="none">
      <path d="M24 12.2 L36.4 19.2 L24 26.2 L11.6 19.2 Z" />
      <path d="M11.6 23.1 L24 30.1 L36.4 23.1 L36.4 26.1 L24 33.1 L11.6 26.1 Z" />
      <path d="M11.6 28 L24 35 L36.4 28 L36.4 31 L24 38 L11.6 31 Z" />
    </g>
  ),
};

/** The bound icon component of "foundry": a module-level arrow over the shared
 *  fluent face, the plate frozen in the closure at load. */
export const FoundryIcon: ComponentType<AppIconProps> = (props: AppIconProps) => (
  <FluentIconFace {...props} uid="dti-foundry" plate={FoundryIcon_PLATE} />
);

/** Vault — the storage vault: a deep-gold plate carrying the shield, its
 *  inner rim traced back to the plate tone and its keyhole cut through. */
const VaultIcon_PLATE: AppIconPlate = {
  top: "#d9b45a",
  bottom: "#ab8630",
  glyph: (tone) => (
    <>
      <path d="M24 12.2 L35 16.4 V25.1 Q35 33.4 24 38 Q13 33.4 13 25.1 V16.4 Z" fill={GLYPH_INK} stroke="none" />
      <path
        d="M24 15.2 L32.3 18.3 V25 Q32.3 31.4 24 35.1 Q15.7 31.4 15.7 25 V18.3 Z"
        fill="none"
        stroke={tone}
        strokeWidth={1.7}
      />
      <circle cx="24" cy="23.3" r="3.1" fill={tone} stroke="none" />
      <path d="M22.7 25.1 L21.6 30.9 H26.4 L25.3 25.1 Z" fill={tone} stroke="none" />
    </>
  ),
};

/** The bound icon component of "vault": a module-level arrow over the shared
 *  fluent face, the plate frozen in the closure at load. */
export const VaultIcon: ComponentType<AppIconProps> = (props: AppIconProps) => (
  <FluentIconFace {...props} uid="dti-vault" plate={VaultIcon_PLATE} />
);

/** Getry — the family gateway: a sage plate carrying the route — the
 *  waypoint dot, the S-curve rising and the bold arrowhead it ends in. */
const GetryIcon_PLATE: AppIconPlate = {
  top: "#7fbb9c",
  bottom: "#54906f",
  glyph: () => (
    <>
      <circle cx="15.3" cy="33.3" r="3.1" fill={GLYPH_INK} stroke="none" />
      <path d="M15.3 33.3 Q15.3 23.7 24.4 23.7 Q33.5 23.7 33.5 14.8" />
      <path d="M33.5 10.6 L36.9 16.2 L30.1 16.2 Z" fill={GLYPH_INK} stroke="none" />
    </>
  ),
};

/** The bound icon component of "getry": a module-level arrow over the shared
 *  fluent face, the plate frozen in the closure at load. */
export const GetryIcon: ComponentType<AppIconProps> = (props: AppIconProps) => (
  <FluentIconFace {...props} uid="dti-getry" plate={GetryIcon_PLATE} />
);

/** Saddle — the sandbox engine: a taupe plate carrying the crate filled
 *  solid in light isometric, its top-face seams cut back to the plate
 *  tone. */
const SaddleIcon_PLATE: AppIconPlate = {
  top: "#dcc091",
  bottom: "#b3905d",
  glyph: (tone) => (
    <>
      <path d="M24 13.8 L35.5 20.1 V31 L24 37.3 L12.5 31 V20.1 Z" fill={GLYPH_INK} stroke="none" />
      <path d="M12.5 20.1 L24 26.4 L35.5 20.1" stroke={tone} strokeWidth={2.4} />
      <path d="M24 26.4 V37.3" stroke={tone} strokeWidth={2.4} />
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
