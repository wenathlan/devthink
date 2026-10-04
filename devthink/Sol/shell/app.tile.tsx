/**
 * app.tile.tsx — the shared app-icon tile of the Sol shell: a fluent
 * squircle that carries the identity color of one desktop app (the chrome
 * stays neutral graphite; the icons carry the color). The surface is built
 * in CSS (Sol/sol.css, .dt-tile): a subtle per-app gradient, an inset top
 * highlight and layered diffuse shadows with a soft tinted glow. The
 * DevThink app renders the official two-path mark, every other app its
 * lucide glyph at a crisp 1.7 stroke.
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
      {Icon ? <Icon size={size} strokeWidth={1.7} /> : <SolLogoMark size={size} />}
    </span>
  );
}
