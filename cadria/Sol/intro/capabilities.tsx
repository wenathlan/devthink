/**
 * capabilities.tsx — the capability zone of the intro: the four generation
 * lanes of the deterministic engine (spectrum → color, structure →
 * composition, timbre → texture, rhythm → motion) laid out as the house
 * asymmetric ledger — ONE feature card (the spectrum lane, with the pure-css
 * mini visual of the engine's own bar grammar) beside the three remaining
 * lanes as hairline rows. No equal-card pyramid: the anti-amador rule holds.
 * The copy states exactly what the engine maps, nothing invented.
 */

import { Activity, AudioWaveform, Fingerprint, LayoutGrid } from "lucide-react";
import type { ComponentType, CSSProperties } from "react";

/** the identity rose of the campaign, straight from the token foundation. */
const ROSE = "var(--rose-500, #f472b6)";
/** quiet secondary text: the page ink, softened (theme-proof). */
const MUTED = "color-mix(in srgb, currentColor 64%, transparent)";

/** one generation lane of the engine. */
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

/** the deterministic bar pattern of the mini visual (the engine's own rhythm
 * grammar shape — tall on the beat, low between), percentages for --h. */
const BARS: readonly number[] = [64, 30, 18, 88, 44, 22, 70, 34, 16, 96, 40, 24, 58, 28, 14, 78];

/** The capability zone: the feature lane beside the ledger of the other three. */
export function CapabilityRow() {
  const sectionStyle = {
    width: "100%",
    maxWidth: 1080,
    margin: "0 auto",
    padding: "26px 24px 84px",
    boxSizing: "border-box",
  } as const;
  const [feature, ...rest] = CAPABILITIES;
  const h2Style = {
    margin: 0,
    fontSize: "clamp(1.45rem, 2.6vw, 1.9rem)",
    letterSpacing: "-0.02em",
    lineHeight: 1.15,
    fontWeight: 600,
  } as const;
  const h3Style = { margin: 0, fontSize: "1.2rem" } as const;
  const iconStyle = {
    width: 38,
    height: 38,
    display: "grid",
    placeItems: "center",
    borderRadius: 6,
    color: ROSE,
    background: "color-mix(in srgb, var(--rose-500, #f472b6) 12%, transparent)",
  } as const;
  const rowIconStyle = { color: ROSE, flex: "none", alignSelf: "center" } as const;

  return (
    <section aria-labelledby="intro-cap-h" style={sectionStyle}>
      <header style={{ maxWidth: "62ch" }}>
        <p className="mono-label reveal" style={{ margin: "0 0 10px" }}>
          what the engine reads
        </p>
        <h2 id="intro-cap-h" className="reveal" style={h2Style}>
          four lanes, one image
        </h2>
      </header>

      <div className="anchorledger reveal" style={{ marginTop: 28 }}>
        {/* the feature lane: spectrum → color, with the engine's bar grammar */}
        {feature && (
          <article className="anchor-feature" aria-label={feature.lane}>
            <div className="mv-shell">
              <div className="mv mv-daw" aria-hidden="true">
                {BARS.map((height) => (
                  <i key={`bar-${height}`} style={{ "--h": height } as CSSProperties} />
                ))}
              </div>
            </div>
            <span className="icon-anim" aria-hidden="true" style={iconStyle}>
              <feature.icon size={20} strokeWidth={1.7} aria-hidden={true} />
            </span>
            <p className="mono-label" style={{ margin: "12px 0 0" }}>
              {feature.lane}
            </p>
            <h3 style={h3Style}>{feature.title}</h3>
            <p style={{ margin: 0, color: MUTED, fontSize: "0.95rem", lineHeight: 1.55 }}>{feature.text}</p>
          </article>
        )}

        {/* the remaining lanes: hairline ledger rows, mono numbering, no cards */}
        <div className="anchor-stack">
          {rest.map((capability, index) => {
            const Icon = capability.icon;
            return (
              <div key={capability.lane} className="anchor-row">
                <span className="anchor-no" aria-hidden="true">
                  {String(index + 2).padStart(2, "0")}
                </span>
                <div style={{ minWidth: 0 }}>
                  <p className="mono-label" style={{ margin: "0 0 4px" }}>
                    {capability.lane}
                  </p>
                  <h3 style={{ margin: 0, fontSize: "1.05rem" }}>{capability.title}</h3>
                  <p style={{ margin: "4px 0 0", color: MUTED, fontSize: "0.92rem", lineHeight: 1.5 }}>
                    {capability.text}
                  </p>
                </div>
                <span className="icon-anim" aria-hidden="true" style={rowIconStyle}>
                  <Icon size={19} strokeWidth={1.7} aria-hidden={true} />
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default CapabilityRow;
