/**
 * zones page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// # Zones — the working console (campaign v3 · r3-argan): the zone ledger as a
// ruled table (the apex featured, the newest serial pulsing on propagate), the
// publication flow on the rail, and the apex record set as a ruled ledger with
// the verbatim zone file one summary away — every row served by the data layer.
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

/** the apex zone (the anchor of the hung model) — the featured ledger row */
const APEX = "devthink.pro";

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

  // propagate pulse: the row carrying the newest serial is the last republication
  const newestSerial = zones.reduce((max, zone) => (zone.serial > max ? zone.serial : max), "");
  const records = recordSets.filter((row) => row.kind === "record");
  const directives = recordSets
    .filter((row) => row.kind === "directive" && row.line.startsWith("$"))
    .map((row) => row.line)
    .join("  ·  ");

  return (
    <Shell name="argan" contained footerLinks={FOOTER_LINKS} domain="argan.devthink.pro">
      <header className="r3a-head">
        <p className="r3a-head__eyebrow">argan · zones</p>
        <h1 className="r3a-head__title">Every name lives in a zone.</h1>
        <p className="r3a-head__lede">
          Masters written by the pipeline, secondaries pulled by authenticated transfer, serials bumped on every
          republication.
        </p>
      </header>

      {/* the asymmetric console: one dominant zone ledger + the publication rail */}
      <div className="r3a-split">
        <section className="r3a-pane" aria-labelledby="zt-h">
          <div className="r3a-h">
            <span className="r3a-h__no" aria-hidden="true">
              01
            </span>
            <h2 id="zt-h" className="r3a-h__title">
              Zones under management
            </h2>
            <p className="r3a-h__aside">{zones.length} zones</p>
            <p className="r3a-h__note">
              Snapshot of the staging cluster — serials follow <code>YYYYMMDDNN</code>, date plus revision of the day.
              The row with the newest serial pulses while propagation lands.
            </p>
          </div>
          <div className="scroll-x">
            <table className="table r3a-table">
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
                  <tr key={zone.origin} className={zone.origin === APEX ? "is-featured" : undefined}>
                    <td className="is-key">{zone.origin}</td>
                    <td>
                      <code className="r3a-kbd">{zone.kind}</code>
                    </td>
                    <td className="is-mono">{zone.serial}</td>
                    <td>
                      <span className="zstate">
                        <span
                          className="zdot"
                          data-state={zone.state}
                          data-fresh={zone.serial === newestSerial ? "true" : undefined}
                          aria-hidden="true"
                        />
                        {zone.state}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="r3a-rail" aria-labelledby="pub-h">
          <div className="r3a-railblock">
            <p className="r3a-railblock__name">pending publication · the hung model</p>
            <p className="r3a-railblock__text">
              A label stays <em>pending</em> until the flow completes. Subdomains hang from the bought apex with a
              wildcard record to the same edge — stock DNS resolves it, the vhost is picked by <code>Host</code> header.
            </p>
          </div>
          <div className="r3a-railblock">
            <p className="r3a-railblock__name">the flow · five moves</p>
            <ol className="r3a-ledger r3a-ledger--flow">
              {steps.map((step) => (
                <li key={step.ordinal} className="r3a-row r3a-row--flow">
                  <span className="r3a-idx" aria-hidden="true">
                    {step.ordinal}
                  </span>
                  <span className="r3a-flow__title">{step.title}</span>
                  <span className="r3a-flow__text">{step.detail}</span>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>

      {/* the apex record set as a ruled ledger; the verbatim file one summary away */}
      <section className="r3a-sec r3a-sec--ruled" aria-labelledby="rr-h">
        <div className="r3a-h">
          <span className="r3a-h__no" aria-hidden="true">
            02
          </span>
          <h2 id="rr-h" className="r3a-h__title">
            What the apex serves today
          </h2>
          <p className="r3a-h__aside">{records.length} records</p>
          {directives ? <p className="r3a-h__note">{directives}</p> : null}
        </div>
        <div className="r3a-ledger">
          {records.map((row) => (
            <div key={`${row.name}-${row.type}-${row.data}`} className="r3a-row r3a-row--rec">
              <span className="r3a-rec__name">
                {row.name === "@" ? APEX : row.name === "*" ? `*.${APEX}` : `${row.name}.${APEX}`}
              </span>
              <code className="r3a-kbd r3a-rec__type">{row.type}</code>
              <span className="r3a-rec__data">{row.data}</span>
              {row.note ? <span className="r3a-rec__note">{row.note}</span> : null}
            </div>
          ))}
        </div>
        <details className="r3a-file">
          <summary>zone file — verbatim</summary>
          <pre className="r3a-term">
            <code>{apexZoneFile(recordSets)}</code>
          </pre>
        </details>
      </section>
    </Shell>
  );
}
