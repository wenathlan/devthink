/**
 * capabilities.tsx — the capability zone of the intro: the four generation
 * lanes of the deterministic engine (spectrum → color, structure →
 * composition, timbre → texture, rhythm → motion) laid out as the house
 * asymmetric ledger — ONE feature card (the spectrum lane, carried by the
 * engine's own glyph) beside the three remaining
 * lanes as hairline rows. No equal-card pyramid: the anti-amador rule holds.
 * No decorative visuals and no invented numbers — the real engine output
 * lives one section below in the demo strip. The copy states exactly what
 * the engine maps, nothing invented.
 */

import { FingerprintRegular, GridRegular, MusicNote2Regular, PulseRegular } from "@fluentui/react-icons";
import type { ComponentType } from "react";
import { type LabelKey, label } from "../../labels.ts";

/** the identity rose of the campaign, straight from the token foundation. */
const ROSE = "var(--rose-500, #f472b6)";
/** quiet secondary text: the page ink, softened (theme-proof). */
const MUTED = "color-mix(in srgb, currentColor 64%, transparent)";

/** one generation lane of the engine (the copy rides the label store). */
type Capability = {
  icon: ComponentType<{ fontSize?: number | string; "aria-hidden"?: true | "true" }>;
  lane: LabelKey;
  title: LabelKey;
  text: LabelKey;
};

/** the four generation lanes, in engine order (the keys answer the store). */
const CAPABILITIES: readonly Capability[] = [
  {
    icon: MusicNote2Regular,
    lane: "intro.capabilities.spectrumLane",
    title: "intro.capabilities.spectrumTitle",
    text: "intro.capabilities.spectrumText",
  },
  {
    icon: GridRegular,
    lane: "intro.capabilities.structureLane",
    title: "intro.capabilities.structureTitle",
    text: "intro.capabilities.structureText",
  },
  {
    icon: FingerprintRegular,
    lane: "intro.capabilities.timbreLane",
    title: "intro.capabilities.timbreTitle",
    text: "intro.capabilities.timbreText",
  },
  {
    icon: PulseRegular,
    lane: "intro.capabilities.rhythmLane",
    title: "intro.capabilities.rhythmTitle",
    text: "intro.capabilities.rhythmText",
  },
];

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
          {label("intro.capabilities.eyebrow")}
        </p>
        <h2 id="intro-cap-h" className="reveal" style={h2Style}>
          {label("intro.capabilities.title")}
        </h2>
      </header>

      <div className="anchorledger reveal" style={{ marginTop: 28 }}>
        {/* the feature lane: spectrum → color, the engine's own glyph carries it */}
        {feature && (
          <article className="anchor-feature" aria-label={label(feature.lane)}>
            <span className="icon-anim" aria-hidden="true" style={iconStyle}>
              <feature.icon fontSize={20} aria-hidden="true" />
            </span>
            <p className="mono-label" style={{ margin: "12px 0 0" }}>
              {label(feature.lane)}
            </p>
            <h3 style={h3Style}>{label(feature.title)}</h3>
            <p style={{ margin: 0, color: MUTED, fontSize: "0.95rem", lineHeight: 1.55 }}>{label(feature.text)}</p>
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
                    {label(capability.lane)}
                  </p>
                  <h3 style={{ margin: 0, fontSize: "1.05rem" }}>{label(capability.title)}</h3>
                  <p style={{ margin: "4px 0 0", color: MUTED, fontSize: "0.92rem", lineHeight: 1.5 }}>
                    {label(capability.text)}
                  </p>
                </div>
                <span className="icon-anim" aria-hidden="true" style={rowIconStyle}>
                  <Icon fontSize={19} aria-hidden="true" />
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
