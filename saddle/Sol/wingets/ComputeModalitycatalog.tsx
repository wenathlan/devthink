// Signal & Ledger: the compute face — the modality catalog the engine
// states about itself. The winget carries zero fixed records: the plan
// counts and every table row arrive from /api/v1/modalities on mount (the
// wingets consume the db through the api, never a shipped array), and
// when the engine does not answer the surface says so in one line
// instead of painting rows it does not have. Every word the winget itself
// speaks rides the label store (labels.ts — the copy law). The honest
// error line the store answers is:
// "the engine is unreachable — the catalog rides the saddle api"
// (compute.catalog.unreachable) — the engine is the only source of rows;
// the loading caption is "reading the plan from the engine…" and the
// legend under the table explains the three plan states.
import { TableSimpleRegular as Catalog } from "@fluentui/react-icons";
import { useEffect, useState } from "react";
import { fetchmodalities, type ModalityPlan, type ModalityRecord } from "../../api.ts";
import { label } from "../../labels.ts";

/** the plan-state tones ride the house chip system: live keeps the success
 * ink, host the neutral chip, planned the muted one — no new colors. */
const statetone: Record<ModalityRecord["state"], string> = {
  live: "dash-chip online",
  host: "dash-chip",
  planned: "dash-chip off",
};

/** the skeleton row widths while the plan loads (a descending ladder so
 * the shimmer reads as rows, not bars). */
const skeletonwidths = [94, 88, 82, 76, 70, 64];

/** the lane flags of one record as one mono cell (gpu / network). */
function laneflags(record: ModalityRecord): string {
  const flags = [record.gpu ? "gpu" : "", record.network ? "net" : ""].filter(Boolean);
  return flags.length > 0 ? flags.join(" · ") : "—";
}

/** one honest tile of the plan counts strip. */
function Count({ value, label: tilelabel, detail }: { value: number | "load"; label: string; detail: string }) {
  return (
    <div className="metric">
      <span className="metric-value">{value === "load" ? <span className="dash-skeleton" /> : value}</span>
      <span className="metric-label">{tilelabel}</span>
      <span className="metric-detail">{detail}</span>
    </div>
  );
}

/**
 * the modality catalog surface: the plan counts strip, then one row per
 * record the engine serves — loading renders skeleton rows, an unreachable
 * engine renders the honest single line, an empty plan renders the empty
 * caption.
 */
export default function ComputeModalitycatalog() {
  const [plan, setplan] = useState<ModalityPlan | null>(null);
  const [failed, setfailed] = useState(false);

  /** the catalog mount: read the plan once; null means the engine slept. */
  useEffect(() => {
    let cancelled = false;
    fetchmodalities()
      .then((result) => {
        if (cancelled) return;
        if (result === null) {
          setfailed(true);
          return;
        }
        setfailed(false);
        setplan(result);
      })
      .catch(() => {
        if (!cancelled) setfailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const records = plan === null ? [] : plan.records;
  const loading = plan === null && !failed;

  return (
    <section className="content-section" aria-label={label("compute.catalog.aria")}>
      <div className="content-section-heading">
        <p className="eyebrow">{label("compute.catalog.eyebrow")}</p>
        <span className="mono-label">
          <Catalog fontSize={12} aria-hidden="true" /> {label("compute.catalog.served")}
        </span>
      </div>
      {failed ? (
        <p className="dash-panelerror">{label("compute.catalog.unreachable")}</p>
      ) : (
        <>
          <div className="metric-strip">
            <Count
              value={loading ? "load" : (plan?.plancount ?? 0)}
              label={label("compute.catalog.count.modalities")}
              detail={label("compute.catalog.count.modalitiesDetail")}
            />
            <Count
              value={loading ? "load" : (plan?.live ?? 0)}
              label={label("compute.catalog.count.live")}
              detail={label("compute.catalog.count.liveDetail")}
            />
            <Count
              value={loading ? "load" : (plan?.host ?? 0)}
              label={label("compute.catalog.count.host")}
              detail={label("compute.catalog.count.hostDetail")}
            />
            <Count
              value={loading ? "load" : (plan?.planned ?? 0)}
              label={label("compute.catalog.count.planned")}
              detail={label("compute.catalog.count.plannedDetail")}
            />
          </div>
          <section
            className="dash-tablescroll"
            // biome-ignore lint/a11y/noNoninteractiveTabindex: deliberate wcag scrollable-region pattern: the tabIndex keeps the overflowing catalog keyboard-scrollable; the table itself only presents rows
            tabIndex={0}
            aria-label={label("compute.catalog.tableAria")}
          >
            <table>
              {loading && <caption className="dash-empty">{label("compute.catalog.loading")}</caption>}
              {!loading && records.length === 0 && (
                <caption className="dash-empty">{label("compute.catalog.empty")}</caption>
              )}
              <thead>
                <tr>
                  <th scope="col">{label("compute.catalog.col.id")}</th>
                  <th scope="col">{label("compute.catalog.col.label")}</th>
                  <th scope="col">{label("compute.catalog.col.family")}</th>
                  <th scope="col">{label("compute.catalog.col.state")}</th>
                  <th scope="col">{label("compute.catalog.col.boot")}</th>
                  <th scope="col">{label("compute.catalog.col.lanes")}</th>
                </tr>
              </thead>
              <tbody>
                {loading &&
                  skeletonwidths.map((width) => (
                    <tr key={`skeleton-${width}`}>
                      <td colSpan={6}>
                        <span className="dash-skeleton" style={{ width: `${width}%` }} />
                      </td>
                    </tr>
                  ))}
                {records.map((record) => (
                  <tr key={record.id}>
                    <td className="wrapcell">{record.id}</td>
                    <td>{record.label}</td>
                    <td>{record.family}</td>
                    <td>
                      <span className={statetone[record.state]}>{record.state}</span>
                    </td>
                    <td>
                      {record.boot} · {record.bootms} ms
                    </td>
                    <td>{laneflags(record)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <p className="dash-statusnote">{label("compute.catalog.legend")}</p>
        </>
      )}
    </section>
  );
}
