/**
 * apptile.tsx — the shared app-icon tile of the Sol shell: ONE tile grammar
 * for the taskbar pins (38×38), the Start menu grid and the desktop cells
 * (74×84) alike — a fluent squircle that carries the identity color of one
 * desktop app (the chrome stays neutral graphite; the icons carry the color).
 * Apps with an entry in the premium drawn set (Sol/shell/appicons.tsx),
 * reached by the registry `iconset` key, render their animated icon filling
 * the whole tile — the tile keeps its box and its tinted ambient glow while
 * the icon brings its own painted depth. Every other app falls back to its
 * lucide glyph at a crisp 1.7 stroke or the official DevThink logo mark, and
 * an `iconset` key without an asset in the set resolves to the same graceful
 * fallback — never a blank tile. The tile tint starts from the registry color
 * and is refined by the story color the icon catalog row declares (the
 * reviewed seeds answer offline).
 *
 * Division of labor of the tile grammar: this component is the face — it
 * renders no motion of its own (reduced motion stays the stylesheet's call
 * and the premium set guards its own loops) and it stays decorative, because
 * the interactive tile is its wrapper: the taskbar pin carries the app name
 * as its aria-label and reuses the `.dt-nav__tip` below-the-icon tooltip
 * (name only, Windows peek semantics), the Start menu and the desktop cells
 * show the visible name — so the name is never announced twice. Standalone
 * uses pass `label` to promote the tile to a named `role="img"`. The
 * `data-tile`/`data-app` attributes and the `--dt-tile-size` variable are
 * the hooks the stylesheet builds the one grammar from: the 9% hover wash,
 * the scale(.7) press, the 2px var(--dt-blue) focus-visible ring.
 */
import { type ComponentType, type CSSProperties, useEffect, useState } from "react";
import { appIconSets } from "../../catalog";
import { SolLogoMark } from "../panel/logo";
import { APP_ICONS, type AppIconProps } from "./appicons";
import type { DesktopApp } from "./appregistry";

type AppTileProps = {
  app: DesktopApp;
  /** glyph size in px (fallback path only; the premium icon fills the tile) */
  size?: number;
  /** promotes the decorative tile to a named role="img" (standalone use) */
  label?: string;
};

/**
 * Reads the story color of the app from its icon catalog row, keeping
 * the registry tint until the catalog answers (or when it stays offline).
 *
 * @param app the desktop app the tile renders.
 */
function useAppStory(app: DesktopApp): string {
  const [story, setStory] = useState(app.tint);
  useEffect(() => {
    let live = true;
    setStory(app.tint);
    appIconSets()
      .then((rows) => {
        if (!live) return;
        const row = rows.find((candidate) => candidate.app === app.id);
        if (row) setStory(row.story);
      })
      .catch(() => {
        /* the catalog answers through its reviewed seeds */
      });
    return () => {
      live = false;
    };
  }, [app.id, app.tint]);
  return story;
}

/**
 * Resolves the premium icon of one app.
 *
 * @param iconset the registry `iconset` key of the app.
 * @returns the drawn icon of the set, or undefined when the key carries no
 * asset — the tile then falls back to the lucide glyph, never a blank tile.
 */
function premiumIcon(iconset: string | undefined): ComponentType<AppIconProps> | undefined {
  return iconset === undefined ? undefined : APP_ICONS[iconset];
}

export function AppTile({ app, size = 22, label }: AppTileProps) {
  const story = useAppStory(app);
  const Premium = premiumIcon(app.iconset);
  const style = { "--app-tint": story, "--dt-tile-size": `${size}px` } as CSSProperties;
  const a11y: { "aria-hidden"?: true } | { role: "img"; "aria-label": string } =
    label === undefined ? { "aria-hidden": true } : { role: "img", "aria-label": label };
  if (Premium) {
    return (
      <span className="dt-tile dt-tile--set" data-tile="set" data-app={app.id} style={style} {...a11y}>
        <Premium />
      </span>
    );
  }
  const Icon = app.icon;
  return (
    <span className="dt-tile" data-tile={Icon ? "glyph" : "mark"} data-app={app.id} style={style} {...a11y}>
      {Icon ? <Icon size={size} strokeWidth={1.7} /> : <SolLogoMark size={size} />}
    </span>
  );
}
