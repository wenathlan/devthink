// # Zones — sub-anchor of the zones page: the zone table, the pending-publication
// flow and the apex record set, every row served by the data layer.
import { useEffect, useState } from "react";
import { Shell, type NavLink } from "../Shell";
import { listApexRecordSets, listPublicationSteps, listZones } from "../../catalog.ts";
import { apexZoneFile } from "../../argan.ts";
import type { PublicationStep, RecordSetRow, ZoneSnapshot } from "../../argan.ts";

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
      <p className="eyebrow">zones · devthink.pro apex</p>
      <h1 className="page-title">Zones</h1>
      <p className="lede">
        Every name the OS serves lives in a zone argan is authoritative for: masters written by the pipeline, secondaries pulled by authenticated transfer, serials bumped on every republication.
      </p>

      <section className="glass card mt-30" aria-labelledby="zt-h">
        <h2 id="zt-h" className="card-h">
          Zones under management
        </h2>
        <p className="p-sm">
          Snapshot of the staging cluster. Serials follow <code>YYYYMMDDNN</code> — date plus revision of the day.
        </p>
        <div className="scroll-x">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Zone</th>
                <th scope="col">Type</th>
                <th scope="col">Serial</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {zones.map((zone) => (
                <tr key={zone.origin}>
                  <td>{zone.origin}</td>
                  <td>{zone.kind}</td>
                  <td>{zone.serial}</td>
                  <td>
                    <span className={`badge${zone.state === "signed" ? " success" : ""}`}>{zone.state}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section" aria-labelledby="pub-h">
        <div className="section-head">
          <p className="eyebrow reveal">pending publication · the hung model</p>
          <h2 id="pub-h" className="reveal h2-xl">
            A typed label becomes a live URL
          </h2>
          <p className="reveal">
            In the panel, a label stays <em>pending</em> until the whole flow below completes. Subdomains hang from the bought apex with a wildcard record pointing to the same edge — the visitor resolves it with stock DNS, the vhost is picked by <code>Host</code> header.
          </p>
        </div>
        <div className="grid grid-steps">
          {steps.map((step) => (
            <div key={step.ordinal} className="glass card reveal">
              <span className="badge">{step.ordinal}</span>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-text">{step.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="rr-h">
        <div className="section-head">
          <p className="eyebrow reveal">record set</p>
          <h2 id="rr-h" className="reveal h2-xl">
            What the apex serves today
          </h2>
        </div>
        <pre className="code-block reveal">
          <code>{apexZoneFile(recordSets)}</code>
        </pre>
      </section>
    </Shell>
  );
}
