// # parts — decorative mini-visuals of the studio anchors, one pure-css vignette per
// anchor id. Presentation only: the anchor rows themselves come from the data layer.
import type { CSSProperties } from "react";

/** the waveform bar heights of the audio anchor visual (decorative rhythm) */
const DAW_HEIGHTS: readonly number[] = [30, 62, 44, 82, 55, 92, 38, 70, 50, 86, 34, 64, 95, 47, 72, 40];

/** the sun swatches of the themes anchor visual (decorative palette) */
const THEME_SWATCHES: readonly string[] = ["#0b0806", "#fffbf2", "#f59e0b", "#f97316"];

/** the stable cell ids of the 16-icon grid visual (decorative) */
const ICON_CELLS: readonly string[] = Array.from({ length: 16 }, (_, index) => `icon-${index + 1}`);

export function AnchorVisual({ id }: { id: string }) {
  if (id === "3dstudio") {
    return <div className="mv mv-3d" aria-hidden="true" />;
  }
  if (id === "audio") {
    return (
      <div className="mv mv-daw" aria-hidden="true">
        {DAW_HEIGHTS.map((height) => (
          <i key={height} style={{ "--h": height } as CSSProperties} />
        ))}
      </div>
    );
  }
  if (id === "canvaseditor") {
    return (
      <div className="mv mv-canvas" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
    );
  }
  if (id === "code_ide") {
    return (
      <div className="mv mv-code" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>
    );
  }
  if (id === "themes") {
    return (
      <div className="mv mv-themes" aria-hidden="true">
        {THEME_SWATCHES.map((color) => (
          <i key={color} style={{ background: color }} />
        ))}
      </div>
    );
  }
  if (id === "icons16") {
    return (
      <div className="mv mv-icons" aria-hidden="true">
        {ICON_CELLS.map((cell) => (
          <i key={cell} />
        ))}
      </div>
    );
  }
  return <div className="mv" aria-hidden="true" />;
}
