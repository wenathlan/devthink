/**
 * waves.tsx — the section rhythm divider of the explore hub (campaign v3,
 * wave R1-d). The drifting wave SVG of the old landing retired: the hub
 * separates its zones the editorial way — a thin mono caption, a hairline
 * that stretches to the page edge and one quiet meta readout, nothing
 * decorative between the stage and the rails. The export name stays
 * HeroWaves (the anchor and the re-exports keep their surface); the
 * optional caption/meta props only label the divider.
 */

export type HeroWavesProps = {
  /** the mono caption of the zone the divider introduces */
  caption?: string;
  /** the quiet right-edge readout (counts, hints) */
  meta?: string;
};

export function HeroWaves({ caption = "the stage", meta }: HeroWavesProps = {}) {
  return (
    <div className="ldk-divider">
      <span className="ldk-divider__cap">{caption}</span>
      <span className="ldk-divider__rule" aria-hidden="true" />
      {meta !== undefined && <span className="ldk-divider__meta">{meta}</span>}
    </div>
  );
}
