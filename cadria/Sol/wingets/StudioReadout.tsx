/**
 * readout.tsx — the analyze readout of the stage pane, self contained on the
 * silk law (the panel-silk surface carries the report): the reportDigest line
 * plus the five stat blocks of the wave-1 report (spectrum · rhythm ·
 * harmonic · timbre · structure) as compact mono rows, then the decode and
 * analysis timings. Pure presentation over one AnalysisReport — the pipeline
 * owns every number; nothing is invented and nothing renders when there is
 * no report.
 */

import { type AnalysisReport, reportDigest } from "@wenathlan/debonair/audiopipeline";
import { label } from "../../labels.ts";

/** pitch-class names, c first — the same table reportDigest spells. */
const PITCH_CLASSES = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"] as const;

/** one label/value row: mono label left, tabular value right, hairline under. */
function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="row" style={{ justifyContent: "space-between", gap: 10, padding: "3px 0", minHeight: 0 }}>
      <span className="mono-label" style={{ flex: "none" }}>
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.72rem",
          fontWeight: 600,
          color: "var(--ink)",
          fontVariantNumeric: "tabular-nums",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </span>
    </div>
  );
}

/** one stat block: mono head + its rows. */
function StatBlock({ head, rows }: { head: string; rows: readonly { label: string; value: string }[] }) {
  return (
    <div style={{ minWidth: 148, flex: "1 1 148px" }}>
      <p className="mono-label" style={{ margin: "0 0 4px", color: "var(--accent)" }}>
        {head}
      </p>
      {rows.map((row) => (
        <StatRow key={row.label} label={row.label} value={row.value} />
      ))}
    </div>
  );
}

/** fixed decimals with the non-finite guard the readout needs. */
const fix = (value: number, digits: number): string => (Number.isFinite(value) ? value.toFixed(digits) : "—");

/** The analyze readout: digest line, five stat blocks, timings row. */
export function Readout({ report }: { report: AnalysisReport }) {
  const { spectrum, rhythm, harmonic, timbre, structure } = report;
  const keyName = `${PITCH_CLASSES[Math.min(11, Math.max(0, Math.round(harmonic.key.tonic)))]} ${harmonic.key.mode}`;
  return (
    <section
      aria-label={label("studio.readout.paneAria")}
      className="panel-silk"
      style={{ marginTop: 18, minWidth: 0 }}
    >
      <p
        style={{
          margin: "0 0 12px",
          fontFamily: "var(--font-mono)",
          fontSize: "0.74rem",
          fontWeight: 600,
          color: "var(--rose-300, #f9a8d4)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {reportDigest(report)}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 22px", alignItems: "start" }}>
        <StatBlock
          head={label("studio.readout.spectrum")}
          rows={[
            { label: label("studio.readout.centroid"), value: `${Math.round(spectrum.centroidMean)} hz` },
            { label: label("studio.readout.rolloff"), value: `${Math.round(spectrum.rolloffMean)} hz` },
            { label: label("studio.readout.flatness"), value: fix(spectrum.flatnessMean, 2) },
            { label: label("studio.readout.brightness"), value: fix(spectrum.brightnessIndex, 2) },
          ]}
        />
        <StatBlock
          head={label("studio.readout.rhythm")}
          rows={[
            { label: label("studio.readout.bpm"), value: fix(rhythm.bpm, 1) },
            { label: label("studio.readout.pulseTrust"), value: fix(rhythm.confidence, 2) },
            { label: label("studio.readout.onsets"), value: fix(rhythm.onsetsPerSecond, 2) },
            { label: label("studio.readout.groove"), value: fix(rhythm.regularityIndex, 2) },
            {
              label: label("studio.readout.swing"),
              value: `${fix(rhythm.swing.ratio, 2)} ${rhythm.swing.swung ? label("studio.readout.swung") : label("studio.readout.straight")}`,
            },
          ]}
        />
        <StatBlock
          head={label("studio.readout.harmonic")}
          rows={[
            { label: label("studio.readout.key"), value: keyName },
            { label: label("studio.readout.strength"), value: fix(harmonic.key.strength, 2) },
            { label: label("studio.readout.changeRate"), value: fix(harmonic.harmonicChangeRate, 2) },
            { label: label("studio.readout.dissonance"), value: fix(harmonic.dissonanceIndex, 2) },
          ]}
        />
        <StatBlock
          head={label("studio.readout.timbre")}
          rows={[
            { label: label("studio.readout.noisiness"), value: fix(timbre.noisiness, 2) },
            { label: label("studio.readout.warmth"), value: fix(timbre.warmth, 2) },
            { label: label("studio.readout.range"), value: `${fix(timbre.dynamics.rangeDb, 1)} db` },
            { label: label("studio.readout.crest"), value: fix(timbre.dynamics.crestFactor, 1) },
          ]}
        />
        <StatBlock
          head={label("studio.readout.structure")}
          rows={[
            { label: label("studio.readout.length"), value: `${fix(structure.durationMs / 1000, 1)} s` },
            { label: label("studio.readout.sections"), value: String(structure.sectionCount) },
            { label: label("studio.readout.peak"), value: `${fix(structure.peakSectionMs / 1000, 1)} s` },
            { label: label("studio.readout.repetition"), value: fix(structure.repetitionIndex, 2) },
            { label: label("studio.readout.shape"), value: structure.narrativeShape },
          ]}
        />
      </div>
      <p className="mono-label" style={{ margin: "12px 0 0" }}>
        {label("studio.readout.timings")
          .replace("{decode}", String(Math.round(report.timings.decodeMs)))
          .replace("{analysis}", String(Math.round(report.timings.analysisMs)))}
      </p>
    </section>
  );
}

export default Readout;
