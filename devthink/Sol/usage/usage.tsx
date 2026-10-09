/**
 * usage page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

/** Style: DevThink Terminal Atelier — local usage page reports only durable
 * counts from the paired CLI, never provider billing claims. C1 layout: the
 * message count is the dominant figure (one display-face numeral) and the
 * remaining measures read as a ruled strip with varied column widths — the
 * uniform metric-card grid is gone. The rail carries the boundary note. */
import { Activity, BarChart3, Database, PanelsTopLeft } from "lucide-react";
import { type CSSProperties, useEffect, useState } from "react";
import { toast } from "sonner";
import { ControlShell, controlStripStyle } from "@/shell/ControlShell";
import { browserStoreSummary } from "../../db";
import { gatewayJson, gatewayReady } from "../../gateway.js";

type Usage = {
  workspaces: number;
  sessions: number;
  tabs: number;
  messages: number;
  providers: number;
  paired: boolean;
};

/* the two-zone rhythm: dominant figure + support rail */
const zoneStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 24,
  alignItems: "flex-start",
  fontVariantNumeric: "tabular-nums",
};
const mainStyle: CSSProperties = { flex: "3 1 520px", minWidth: 0 };
const railStyle: CSSProperties = {
  flex: "1 1 264px",
  minWidth: 0,
  maxWidth: 340,
  display: "grid",
  gap: 16,
  alignContent: "start",
};
const ledgerLabelStyle: CSSProperties = {
  margin: 0,
  padding: "0 2px 10px",
  color: "var(--dt-faint)",
  font: "600 10px var(--dt-mono)",
  letterSpacing: ".08em",
};
const heroBlockStyle: CSSProperties = {
  display: "grid",
  gap: 10,
  justifyItems: "start",
  borderTop: "1px solid var(--dt-edge)",
  padding: "20px 2px 24px",
};
const heroLabelStyle: CSSProperties = {
  color: "var(--dt-muted)",
  font: "500 10px var(--dt-mono)",
  letterSpacing: ".08em",
};
const heroValueStyle: CSSProperties = {
  font: "600 clamp(48px, 7vw, 72px)/1 var(--font-display, var(--dt-sans))",
  letterSpacing: "-0.02em",
  color: "var(--dt-text)",
};
/* the strip: ruled columns with deliberate width differences, no boxes */
const stripStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.4fr 1fr 1fr",
  borderTop: "1px solid var(--dt-edge)",
};
const stripCellStyle: CSSProperties = {
  display: "grid",
  gap: 6,
  alignContent: "start",
  justifyItems: "start",
  padding: "14px 12px 14px 0",
};
const stripValueStyle: CSSProperties = {
  font: "600 22px/1 var(--font-display, var(--dt-sans))",
  color: "var(--dt-text)",
};
const stripLabelStyle: CSSProperties = {
  color: "var(--dt-faint)",
  font: "400 9px var(--dt-mono)",
  letterSpacing: ".08em",
};
const railNoteStyle: CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "flex-start",
  background: "transparent",
  border: 0,
  borderTop: "1px solid var(--dt-edge)",
  borderRadius: 0,
  padding: "12px 2px 0",
  color: "var(--dt-faint)",
  font: "400 11px/1.7 var(--dt-mono)",
};

export default function Usage() {
  const [usage, setUsage] = useState<Usage>();
  const paired = gatewayReady();
  useEffect(() => {
    const localUsage = () =>
      browserStoreSummary(paired).then((summary) =>
        setUsage({
          workspaces: summary.workspaces,
          sessions: summary.sessions,
          tabs: summary.tabs,
          messages: summary.messages,
          providers: 0,
          paired,
        }),
      );
    if (!paired) {
      void localUsage();
      return;
    }
    void gatewayJson<Usage>("/usage")
      .then(setUsage)
      .catch(() => {
        void localUsage();
        toast("Usage is unavailable from the local gateway; browser-local counts are shown.");
      });
  }, [paired]);
  const measures = usage
    ? [
        { label: "projects", value: usage.workspaces, icon: Database },
        { label: "sessions", value: usage.sessions, icon: PanelsTopLeft },
        { label: "tabs", value: usage.tabs, icon: Activity },
      ]
    : [];
  return (
    <ControlShell
      eyebrow="local activity ledger"
      title="Usage that remains on this device."
      summary="These are counts from the paired CLI when available, otherwise from this browser's IndexedDB cache. Provider billing and API keys are not read by this page."
    >
      <div className="control-toolbar" style={controlStripStyle}>
        <span>{paired ? "paired gateway" : "browser-local cache"}</span>
        <span>durable counts · no billing claims</span>
      </div>
      {usage ? (
        <div style={zoneStyle}>
          <div style={mainStyle}>
            <p style={ledgerLabelStyle}>activity ledger</p>
            <div style={heroBlockStyle}>
              <span style={heroLabelStyle}>messages stored on this device</span>
              <strong style={heroValueStyle}>{usage.messages}</strong>
            </div>
            <div style={stripStyle}>
              {measures.map(({ label, value, icon: Icon }, index) => (
                <div
                  key={label}
                  style={{
                    ...stripCellStyle,
                    ...(index ? { borderLeft: "1px solid var(--dt-edge)", paddingLeft: 14 } : {}),
                  }}
                >
                  <Icon size={14} />
                  <strong style={stripValueStyle}>{value}</strong>
                  <span style={stripLabelStyle}>{label}</span>
                </div>
              ))}
            </div>
          </div>
          <aside style={railStyle} aria-label="Ledger boundary">
            <div className="control-note" style={railNoteStyle}>
              <Database size={16} />
              <p style={{ margin: 0 }}>
                Provider billing and API keys are not read here; the counts come from the paired CLI when available,
                otherwise from this browser's IndexedDB cache.
              </p>
            </div>
          </aside>
        </div>
      ) : (
        <div className="control-empty">
          <BarChart3 size={22} />
          <h2>Preparing local usage</h2>
          <p>Open a browser-local workspace or pair the CLI to populate the non-sensitive activity ledger.</p>
        </div>
      )}
    </ControlShell>
  );
}
