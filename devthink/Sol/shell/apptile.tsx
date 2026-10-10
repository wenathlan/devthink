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
 * The live contract (task C1-06, extended by campaign v3 · R1-b): while the
 * pointer is over the tile the component raises `data-live="true"` on the
 * tile and hands the same flag to the premium icon, whose signature motion
 * story plays from it — hover is the interaction, and touch pointers never
 * go live (a tap cannot leave an icon stuck mid-story). Away from the
 * pointer the drawn marks run their quiet ambient idle loop (R1-b), and the
 * hover story always takes precedence over it while the flag is up. The
 * stylesheet of the icon set widens the state to the
 * hover/keyboard focus of the wrapper, so the desktop cell and the taskbar
 * pin play the story from their whole hit area. Division of labor of the
 * tile grammar: this component renders no motion of its own (reduced motion
 * stays the stylesheet's call and the premium set guards its own stories)
 * and it stays decorative, because the interactive tile is its wrapper: the
 * taskbar pin carries the app name as its aria-label and reuses the
 * `.dt-nav__tip` below-the-icon tooltip (name only, Windows peek semantics),
 * the Start menu and the desktop cells show the visible name — so the name
 * is never announced twice. Standalone uses pass `label` to promote the tile
 * to a named `role="img"`. The `data-tile`/`data-app`/`data-live` attributes
 * and the `--dt-tile-size` variable are the hooks the composition builds the
 * one grammar from: the tile material rides the Tailwind composition of this
 * component (task 3-a), the premium variant reads data-tile=set, and the
 * parents win where they compose a [&_.dt-tile] override.
 */
import { type ComponentType, type CSSProperties, useEffect, useState } from "react";
import { appIconSets } from "../../catalog";
import { SolLogoMark } from "../panel/logo.tsx";
import { APP_ICONS, type AppIconProps } from "./appicons.tsx";
import type { DesktopApp } from "./appregistry.ts";

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

/**
 * True while the pointer can hover at all — touch pointers never go live,
 * so tapping a tile cannot leave its icon mid-story.
 *
 * @returns false on hoverless (coarse) pointers, true otherwise.
 */
function hoverCapable(): boolean {
  return typeof window === "undefined" || typeof window.matchMedia !== "function"
    ? true
    : !window.matchMedia("(hover: none)").matches;
}

export function AppTile({ app, size = 22, label }: AppTileProps) {
  const story = useAppStory(app);
  const Premium = premiumIcon(app.iconset);
  const [live, setLive] = useState(false);
  const style = { "--app-tint": story, "--dt-tile-size": `${size}px` } as CSSProperties;
  const a11y: { "aria-hidden"?: true } | { role: "img"; "aria-label": string } =
    label === undefined ? { "aria-hidden": true } : { role: "img", "aria-label": label };
  /* the live flag: raised while the pointer is over the tile, dropped the
     moment it leaves — the premium icon plays its story from exactly this */
  const liveHandlers = {
    onPointerEnter: () => {
      if (hoverCapable()) setLive(true);
    },
    onPointerLeave: () => setLive(false),
    onPointerCancel: () => setLive(false),
  };
  const liveFlag = live ? "true" : undefined;
  /* the tile material, composed on the token system (task 3-a): the fluent
     squircle tinted by the app identity color — a subtle per-app gradient
     (lighter tinted top over a deeper graphite base), an inset top highlight,
     a tinted dark hairline and layered diffuse shadows with one soft glow
     from the identity color. Size/rounding per context ride the component:
     the box reads --dt-tile-size (the 40px default) and the parents win where
     they compose a [&_.dt-tile] override. The premium variant (data-tile=set)
     surrenders the background and hairline — the drawn icon paints its own
     gradient face — while keeping the box and the glow. */
  const tileClass =
    "dt-tile grid size-[var(--dt-tile-size,40px)] flex-none place-items-center overflow-visible rounded-[11px] text-[var(--app-tint,#dfe5ee)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-tint,#dfe5ee)_22%,rgb(47_52_65/88%)),color-mix(in_srgb,var(--app-tint,#dfe5ee)_9%,rgb(27_30_38/94%)))] border border-[color:color-mix(in_srgb,var(--app-tint,#dfe5ee)_26%,rgb(255_255_255/5%))] shadow-[inset_0_1px_0_rgb(255_255_255/13%),inset_0_-1px_0_rgb(0_0_0/24%),0_1px_2px_rgb(0_0_0/34%),0_5px_14px_-4px_rgb(0_0_0/32%),0_3px_12px_-4px_color-mix(in_srgb,var(--app-tint,#dfe5ee)_28%,transparent)] transition-[box-shadow,transform] duration-150 ease-micro data-[tile=set]:bg-none data-[tile=set]:border-0 data-[tile=set]:shadow-[inset_0_1px_0_rgb(255_255_255/13%),inset_0_-1px_0_rgb(0_0_0/24%),0_1px_2px_rgb(0_0_0/34%),0_5px_14px_-4px_rgb(0_0_0/32%),0_3px_12px_-4px_color-mix(in_srgb,var(--app-tint,#dfe5ee)_28%,transparent)]";
  if (Premium) {
    return (
      <span
        className={tileClass}
        data-tile="set"
        data-app={app.id}
        data-live={liveFlag}
        style={style}
        {...liveHandlers}
        {...a11y}
      >
        <Premium live={live} />
      </span>
    );
  }
  const Icon = app.icon;
  return (
    <span
      className={tileClass}
      data-tile={Icon ? "glyph" : "mark"}
      data-app={app.id}
      data-live={liveFlag}
      style={style}
      {...liveHandlers}
      {...a11y}
    >
      {Icon ? <Icon size={size} strokeWidth={1.7} /> : <SolLogoMark size={size} />}
    </span>
  );
}
