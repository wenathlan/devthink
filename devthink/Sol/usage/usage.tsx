/**
 * usage page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

/** Style: DevThink Terminal Atelier — campaign v3 r2-c: the editorial
 * ledger. ONE light, ONE accent (#ff5f00 at the 90/10 discipline). The body
 * is a two-column editorial spread: a sticky 220px mono index rail (the
 * numbered measures, anchored, plus the boundary note) beside the document
 * column — the message count as the ONE dominant display numeral, the
 * remaining measures as ruled rows (icon + mono label + display value), a
 * hairline per record, no card boxes. Rows hover on a 10% signal tint; the
 * entrance is the one orchestrated shell stagger with the rows rising
 * through the .enter kit. Only durable counts — no fake data. */
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

/* the entrance stagger of the ledger: the [style] custom prop of .enter */
const stagger = (i: number) => ({ "--i": i }) as CSSProperties;

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
        { id: "usage-projects", label: "projects", value: usage.workspaces, icon: Database },
        { id: "usage-sessions", label: "sessions", value: usage.sessions, icon: PanelsTopLeft },
        { id: "usage-tabs", label: "tabs", value: usage.tabs, icon: Activity },
      ]
    : [];
  return (
    <ControlShell
      eyebrow="local activity ledger"
      title="Usage that remains on this device."
      summary="Counts from the paired CLI when available, otherwise from this browser's IndexedDB cache. Provider billing and API keys are not read by this page."
    >
      <div className="control-toolbar" style={controlStripStyle}>
        <span>{paired ? "paired gateway" : "browser-local cache"}</span>
        <span>durable counts · no billing claims</span>
      </div>
      {usage ? (
        <div className="r2c-doc">
          <aside className="r2c-toc enter" style={stagger(0)} aria-label="Ledger index">
            <span className="r2c-toc__cap">ledger</span>
            <a className="r2c-toc__item" href="#usage-messages">
              <span className="r2c-toc__num" aria-hidden="true">
                01
              </span>
              messages
            </a>
            <a className="r2c-toc__item" href="#usage-projects">
              <span className="r2c-toc__num" aria-hidden="true">
                02
              </span>
              projects
            </a>
            <a className="r2c-toc__item" href="#usage-sessions">
              <span className="r2c-toc__num" aria-hidden="true">
                03
              </span>
              sessions
            </a>
            <a className="r2c-toc__item" href="#usage-tabs">
              <span className="r2c-toc__num" aria-hidden="true">
                04
              </span>
              tabs
            </a>
            <p className="r2c-toc__note">
              provider billing and api keys are not read here; the counts come from the paired cli when available,
              otherwise from this browser's indexeddb cache.
            </p>
          </aside>
          <div className="r2c-doc__body">
            <section id="usage-messages" className="r2c-usagehero enter" style={stagger(1)}>
              <span className="r2c-figlabel">messages stored on this device</span>
              <strong className="r2c-figure r2c-figure--xl">{usage.messages}</strong>
            </section>
            {measures.map(({ id, label, value, icon: Icon }, index) => (
              <div key={id} id={id} className="r2c-striprow enter" style={stagger(2 + index)}>
                <Icon size={15} aria-hidden="true" />
                <span className="r2c-striplabel">{label}</span>
                <strong className="r2c-stripvalue">{value}</strong>
              </div>
            ))}
          </div>
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
