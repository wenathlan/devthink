/**
 * zones page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// # Zones — sub-anchor of the zones page: the zone table, the pending-publication
// flow and the apex record set, every row served by the data layer.
import { useEffect, useState } from "react";
import type { PublicationStep, RecordSetRow, ZoneSnapshot } from "../../argan.ts";
import { apexZoneFile } from "../../argan.ts";
import { listApexRecordSets, listPublicationSteps, listZones } from "../../catalog.ts";
import { type NavLink, Shell } from "../shell/Shell";

const FOOTER_LINKS: readonly NavLink[] = [
  { label: "Home", href: "/" },
  { label: "DNSSEC", href: "/dnssec" },
  { label: "Gateway", href: "/gateway" },
  { label: "Settings", href: "/settings" },
];

export default function Zones() {
  const [zones, setZones] = useState<readonly ZoneSnapshot[]>([]);
  const [steps, setSteps] = useState<readonly PublicationStep[]>([]);
  const [recordSets, setRecordSets] = useState<readonly RecordSetRow[]>([]);

  useEffect(() => {
    let live = true;
    listZones().then((rows) => {
      if (live) setZones(rows);
    });
    listPublicationSteps().then((rows) => {
      if (live) setSteps(rows);
    });
    listApexRecordSets().then((rows) => {
      if (live) setRecordSets(rows);
    });
    return () => {
      live = false;
    };
  }, []);

  return (
    <Shell name="argan" contained footerLinks={FOOTER_LINKS} domain="argan.devthink.pro">
      <p className="eyebrow">argan · zones</p>
      <h1 className="page-title">Zones</h1>
      <p className="lede">
        Every name the OS serves lives in a zone argan is authoritative for: masters written by the pipeline,
        secondaries pulled by authenticated transfer, serials bumped on every republication.
      </p>

      {/* the asymmetric body: one dominant zone table + the publication rail */}
      <div className="ns-split">
        <section className="glass card" aria-labelledby="zt-h">
          <h2 id="zt-h" className="card-h">
            Zones under management
          </h2>
          <p className="p-sm">
            Snapshot of the staging cluster. Serials follow <code>YYYYMMDDNN</code> — date plus revision of the day.
          </p>
          <div className="scroll-x">
            <table className="table ztable">
              <thead>
                <tr>
                  <th scope="col">zone</th>
                  <th scope="col">type</th>
                  <th scope="col">serial</th>
                  <th scope="col">status</th>
                </tr>
              </thead>
              <tbody>
                {zones.map((zone) => (
                  <tr key={zone.origin}>
                    <td>{zone.origin}</td>
                    <td>{zone.kind}</td>
                    <td>{zone.serial}</td>
                    <td>
                      <span className="zstate">
                        <span className="zdot" data-state={zone.state} aria-hidden="true" />
                        {zone.state}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="ns-rail" aria-labelledby="pub-h">
          <p className="eyebrow">pending publication · the hung model</p>
          <h2 id="pub-h" className="ns-rail__title">
            A typed label becomes a live URL
          </h2>
          <p className="ns-rail__lede">
            In the panel, a label stays <em>pending</em> until the flow below completes. Subdomains hang from the bought
            apex with a wildcard record to the same edge — the visitor resolves it with stock DNS, the vhost is picked
            by <code>Host</code> header.
          </p>
          <ol className="ns-steps">
            {steps.map((step) => (
              <li key={step.ordinal} className="ns-step">
                <span className="ns-step__no" aria-hidden="true">
                  {step.ordinal}
                </span>
                <div className="ns-step__body">
                  <h3 className="ns-step__title">{step.title}</h3>
                  <p className="ns-step__text">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </aside>
      </div>

      <section className="section" aria-labelledby="rr-h">
        <div className="section-head">
          <p className="eyebrow">record set</p>
          <h2 id="rr-h" className="h2-xl">
            What the apex serves today
          </h2>
        </div>
        <pre className="code-block">
          <code>{apexZoneFile(recordSets)}</code>
        </pre>
      </section>
    </Shell>
  );
}
