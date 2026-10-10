/**
 * capabilities.tsx — the capability row of the intro: four quiet cards that
 * name the four generation lanes of the deterministic engine (spectrum →
 * color, structure → composition, timbre → texture, rhythm → motion). Each
 * card rides the contract card + mono-label + icon-anim classes, a hairline
 * border and a rose-tinted icon chip; the copy states exactly what the
 * engine maps, nothing invented.
 */

import { Activity, AudioWaveform, Fingerprint, LayoutGrid } from "lucide-react";
import type { ComponentType } from "react";

/** the identity rose of the campaign, straight from the token foundation. */
const ROSE = "var(--rose-500, #f472b6)";
/** quiet secondary text: the page ink, softened (theme-proof). */
const MUTED = "color-mix(in srgb, currentColor 64%, transparent)";
/** the hairline the page draws beside the contract's own. */
const HAIR = "1px solid color-mix(in srgb, currentColor 18%, transparent)";

/** one capability card of the row. */
type Capability = {
  icon: ComponentType<{ size?: number; strokeWidth?: number; "aria-hidden"?: true }>;
  lane: string;
  title: string;
  text: string;
};

/** the four generation lanes, in engine order. */
const CAPABILITIES: readonly Capability[] = [
  {
    icon: AudioWaveform,
    lane: "spectrum → color",
    title: "palette from key",
    text: "tonal center and brightness set the anchor hue, the chroma depth and the accent fan of the palette.",
  },
  {
    icon: LayoutGrid,
    lane: "structure → composition",
    title: "layout from sections",
    text: "section count and narrative shape cast the hero, cadre, field and edge blocks of the frame.",
  },
  {
    icon: Fingerprint,
    lane: "timbre → texture",
    title: "surface from timbre",
    text: "noisiness, warmth and flux drive the grain, the stroke softness and the glaze of the surface.",
  },
  {
    icon: Activity,
    lane: "rhythm → motion",
    title: "move from bpm",
    text: "tempo, punch and regularity pace the pulse, drift, wipe and reveal of every loop.",
  },
];

/** The capability row: the four quiet cards of the deterministic engine. */
export function CapabilityRow() {
  const sectionStyle = {
    width: "100%",
    maxWidth: 1080,
    margin: "0 auto",
    padding: "26px 24px 84px",
    boxSizing: "border-box",
  } as const;
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 14,
    marginTop: 28,
  } as const;
  const cardStyle = { display: "flex", flexDirection: "column", gap: 10, borderRadius: 8, border: HAIR } as const;
  const iconStyle = {
    width: 38,
    height: 38,
    display: "grid",
    placeItems: "center",
    borderRadius: 6,
    color: ROSE,
    background: "color-mix(in srgb, var(--rose-500, #f472b6) 12%, transparent)",
  } as const;
  const h3Style = { margin: 0, fontSize: "1.02rem", fontWeight: 600, letterSpacing: "-0.01em" } as const;
  const bodyStyle = { margin: 0, color: MUTED, fontSize: "0.92rem", lineHeight: 1.55 } as const;

  return (
    <section aria-labelledby="intro-cap-h" style={sectionStyle}>
      <header style={{ maxWidth: "62ch" }}>
        <p className="mono-label reveal" style={{ margin: "0 0 10px" }}>
          what the engine reads
        </p>
        <h2
          id="intro-cap-h"
          className="reveal"
          style={{
            margin: 0,
            fontSize: "clamp(1.45rem, 2.6vw, 1.9rem)",
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
            fontWeight: 600,
          }}
        >
          four lanes, one image
        </h2>
      </header>
      <div style={gridStyle}>
        {CAPABILITIES.map((capability) => {
          const Icon = capability.icon;
          return (
            <article key={capability.lane} className="card reveal" style={cardStyle}>
              <span className="icon-anim" aria-hidden="true" style={iconStyle}>
                <Icon size={20} strokeWidth={1.7} aria-hidden={true} />
              </span>
              <p className="mono-label" style={{ margin: 0 }}>
                {capability.lane}
              </p>
              <h3 style={h3Style}>{capability.title}</h3>
              <p style={bodyStyle}>{capability.text}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default CapabilityRow;
