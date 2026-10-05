/**
 * desktop.tsx — the desktop surface of the Sol shell: a premium dark
 * wallpaper with one large radial light behind the hero and the app icons
 * spread around it like a real desktop. The official two-path DevThink mark
 * sits at the middle of the screen as the hero of the composition; the
 * shared catalog (Sol/shell/app.registry.ts) spreads around it in organic
 * arcs and clusters — deterministic positions, never a uniform grid — each
 * icon a win11 dskApp-grade cell (74×84px, hover wash, selection wash with
 * the dotted focus border via tabIndex, scale(.7) press on the tile) with a
 * legible layered-shadow label. The field staggers in at 70ms steps and
 * sits under the floating windows.
 */
import type { CSSProperties } from "react";
import type { DesktopApp } from "../shell/app.registry";
import { AppTile } from "../shell/app.tile";
import { SolLogoMark } from "./logo";

/**
 * The spread composition: one hand-tuned spot per slot, laid out as arcs
 * around the hero — the right arc opens at eye level (the first app of the
 * catalog, Chat, lands there), a looser left arc mirrors it, a pair of
 * anchors sits above the mark and loose clusters fill the lower corners.
 * All spots are percentages of the desktop area, clear of the navbar band,
 * the hero zone and the dock strip. Pure data — the same apps always land
 * on the same spots, on every machine, on every load.
 */
const DESKTOP_SPOTS: ReadonlyArray<{ x: number; y: number }> = [
  { x: 72, y: 42 }, // right arc, eye level — the first catalog app
  { x: 86, y: 30 },
  { x: 78, y: 58 },
  { x: 91, y: 46 },
  { x: 67, y: 22 },
  { x: 64, y: 32 },
  { x: 85, y: 66 },
  { x: 63, y: 66 },
  { x: 92, y: 60 },
  { x: 28, y: 40 }, // left arc, mirroring the right one
  { x: 14, y: 30 },
  { x: 22, y: 58 },
  { x: 9, y: 48 },
  { x: 33, y: 22 },
  { x: 36, y: 32 },
  { x: 17, y: 70 },
  { x: 6, y: 22 },
  { x: 46, y: 14 }, // anchors above the hero
  { x: 57, y: 16 },
  { x: 50, y: 74 }, // the lower clusters
  { x: 37, y: 66 },
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * Resolves the spot of one app. If the catalog ever grows past the tuned
 * table, extra apps reuse the table in laps with a small deterministic
 * diagonal offset, so nothing ever lands exactly on top of another icon.
 *
 * @param index the catalog position of the app.
 * @returns the icon center as percentages of the desktop area.
 */
function spreadPosition(index: number): { x: number; y: number } {
  const spot = DESKTOP_SPOTS[index % DESKTOP_SPOTS.length];
  const lap = Math.floor(index / DESKTOP_SPOTS.length);
  return {
    x: clamp(spot.x + lap * 4, 8, 92),
    y: clamp(spot.y - lap * 5, 16, 74),
  };
}

type DesktopSurfaceProps = {
  apps: DesktopApp[];
  onOpen: (app: DesktopApp) => void;
};

/**
 * The desktop composition: the radial light, the hero mark at the middle
 * and the app icons spread around it. The hero is pointer-transparent —
 * the center stays click-through like a wallpaper.
 */
export function DesktopSurface({ apps, onOpen }: DesktopSurfaceProps) {
  return (
    <div className="dt-desktop">
      <div className="dt-desktop__light" aria-hidden="true" />
      <div className="dt-desktop__hero">
        <SolLogoMark size={150} title="DevThink" />
        <strong className="dt-desktop__wordmark">DevThink</strong>
        <span className="dt-desktop__tagline">local OS · chat first</span>
      </div>
      <div className="dt-desktop__field">
        {apps.map((app, index) => {
          const spot = spreadPosition(index);
          return (
            <button
              key={app.id}
              type="button"
              className="dt-appicon"
              tabIndex={0}
              style={
                {
                  left: `${spot.x}%`,
                  top: `${spot.y}%`,
                  animationDelay: `${Math.min(index * 70, 630)}ms`,
                } as CSSProperties
              }
              onClick={() => onOpen(app)}
            >
              <AppTile app={app} size={26} />
              <span className="dt-appicon__label">{app.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
