/**
 * waves.tsx — the section rhythm divider of the explore hub. The hub
 * separates its zones the editorial way — a thin mono caption, a hairline
 * that stretches to the page edge and one quiet meta readout, nothing
 * decorative between the stage and the sections. The export name stays
 * HeroWaves (the anchor and the re-exports keep their surface); the
 * optional caption/meta props only label the divider. The divider is fully
 * self-contained (theme utilities only — no stylesheet rules to restyle).
 */

export type HeroWavesProps = {
  /** the mono caption of the zone the divider introduces */
  caption?: string;
  /** the quiet right-edge readout (counts, hints) */
  meta?: string;
};

export function HeroWaves({ caption = "the stage", meta }: HeroWavesProps = {}) {
  return (
    <div className="flex items-center gap-4 py-10 text-ink-3">
      <span className="font-mono text-[10px] tracking-[.08em]">{caption}</span>
      <span className="h-px flex-1 bg-hairline" aria-hidden="true" />
      {meta !== undefined && <span className="font-mono text-[10px]">{meta}</span>}
    </div>
  );
}
