/**
 * apptile.tsx — the shared app-icon tile of the Sol shell: a fluent
 * squircle that carries the identity color of one desktop app (the chrome
 * stays neutral graphite; the icons carry the color). Apps with an entry in
 * the premium drawn set (Sol/shell/appicons.tsx), reached by the registry
 * `iconset` key, render their animated icon filling the whole tile — the
 * tile keeps its box and its tinted ambient glow while the icon brings its
 * own painted depth. Every other app falls back to its lucide glyph at a
 * crisp 1.7 stroke or the official DevThink logo mark. The tile tint starts
 * from the registry color and is refined by the story color the icon
 * catalog row declares (the reviewed seeds answer offline).
 */
import { type CSSProperties, useEffect, useState } from "react";
import { appIconSets } from "../../catalog";
import { SolLogoMark } from "../panel/logo";
import { APP_ICONS } from "./appicons";
import type { DesktopApp } from "./appregistry";

type AppTileProps = {
  app: DesktopApp;
  /** glyph size in px (fallback path only; the premium icon fills the tile) */
  size?: number;
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

export function AppTile({ app, size = 22 }: AppTileProps) {
  const story = useAppStory(app);
  const Premium = app.iconset === undefined ? undefined : APP_ICONS[app.iconset];
  if (Premium) {
    return (
      <span className="dt-tile dt-tile--set" style={{ "--app-tint": story } as CSSProperties} aria-hidden="true">
        <Premium />
      </span>
    );
  }
  const Icon = app.icon;
  return (
    <span className="dt-tile" style={{ "--app-tint": app.tint } as CSSProperties} aria-hidden="true">
      {Icon ? <Icon size={size} strokeWidth={1.7} /> : <SolLogoMark size={size} />}
    </span>
  );
}
