/**
 * desktop.tsx — the desktop of the Sol shell: the Windows-grade icon grid.
 * Every app of the shared catalog (Sol/shell/app.registry.ts) renders as an
 * icon tile — the official two-path mark for DevThink, a colored lucide
 * glyph for every other app, the identity color living in the tile — with
 * its label below. One click opens the app; the grid staggers in at 60ms
 * steps, keeps 44px+ targets and sits under the floating windows.
 */
import type { CSSProperties } from "react";
import type { DesktopApp } from "../shell/app.registry";
import { AppTile } from "../shell/app.tile";

type DesktopIconGridProps = {
  apps: DesktopApp[];
  onOpen: (app: DesktopApp) => void;
};

export function DesktopIconGrid({ apps, onOpen }: DesktopIconGridProps) {
  return (
    <div className="dt-desktop__icons" role="list" aria-label="Desktop apps">
      {apps.map((app, index) => (
        <button
          key={app.id}
          type="button"
          role="listitem"
          className="dt-appicon"
          style={{ animationDelay: `${Math.min(index * 60, 540)}ms` } as CSSProperties}
          onClick={() => onOpen(app)}
        >
          <AppTile app={app} size={26} />
          <span className="dt-appicon__label">{app.name}</span>
        </button>
      ))}
    </div>
  );
}
