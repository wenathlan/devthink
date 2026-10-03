/**
 * app.tile.tsx — the shared app-icon tile of the Sol shell: a fluent
 * squircle that carries the identity color of one desktop app (the chrome
 * stays neutral graphite; the icons carry the color). The DevThink app
 * renders the official two-path mark, every other app its lucide glyph.
 */
import type { CSSProperties } from "react";
import { SolLogoMark } from "../home/logo";
import type { DesktopApp } from "./app.registry";

type AppTileProps = {
  app: DesktopApp;
  /** glyph size in px */
  size?: number;
};

export function AppTile({ app, size = 22 }: AppTileProps) {
  const Icon = app.icon;
  return (
    <span className="dt-tile" style={{ "--app-tint": app.tint } as CSSProperties} aria-hidden="true">
      {Icon ? <Icon size={size} strokeWidth={1.9} /> : <SolLogoMark size={size} />}
    </span>
  );
}
