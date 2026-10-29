// Signal & Ledger: the compute face — the modality catalog the engine
// states about itself. The winget carries zero fixed records: the plan
// counts and every table row arrive from /api/v1/modalities on mount (the
// wingets consume the db through the api, never a shipped array), and
// when the engine does not answer the surface says so in one line
// instead of painting rows it does not have.
import { TableSimpleRegular as Catalog } from "@fluentui/react-icons";
import { useEffect, useState } from "react";
import { fetchmodalities, type ModalityPlan, type ModalityRecord } from "../../api.ts";

/** the plan-state tones ride the house chip system: live keeps the success
 * ink, host the neutral chip, planned the muted one — no new colors. */
const statetone: Record<ModalityRecord["state"], string> = {
  live: "dash-chip online",
  host: "dash-chip",
  planned: "dash-chip off",
};

/** the static legend: ui copy, not data — what each plan state means. */
const legend =
  "live runs on the edge engine today · host answers when the guest host provides the lane · planned seats wait in the roadmap";

/** the honest error line: the engine is the only source of rows. */
const unreachable = "the engine is unreachable — the catalog rides the saddle api";

/** the skeleton row widths while the plan loads (a descending ladder so
 * the shimmer reads as rows, not bars). */
const skeletonwidths = [94, 88, 82, 76, 70, 64];

/** the lane flags of one record as one mono cell (gpu / network). */
function laneflags(record: ModalityRecord): string {
  const flags = [record.gpu ? "gpu" : "", record.network ? "net" : ""].filter(Boolean);
  return flags.length > 0 ? flags.join(" · ") : "—";
}

/** one honest tile of the plan counts strip. */
function Count({ value, label, detail }: { value: number | "load"; label: string; detail: string }) {
  return (
    <div className="metric">
      <span className="metric-value">{value === "load" ? <span className="dash-skeleton" /> : value}</span>
      <span className="metric-label">{label}</span>
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
    <section className="content-section" aria-label="the modality catalog served by the saddle api">
      <div className="content-section-heading">
        <p className="eyebrow">MODALITY CATALOG / THE PLAN</p>
        <span className="mono-label">
          <Catalog fontSize={12} aria-hidden="true" /> served by the engine api
        </span>
      </div>
      {failed ? (
        <p className="dash-panelerror">{unreachable}</p>
      ) : (
        <>
          <div className="metric-strip">
            <Count value={loading ? "load" : (plan?.plancount ?? 0)} label="modalities" detail="the plan total" />
            <Count value={loading ? "load" : (plan?.live ?? 0)} label="live" detail="running on the edge engine" />
            <Count value={loading ? "load" : (plan?.host ?? 0)} label="host" detail="host-gated lanes" />
            <Count value={loading ? "load" : (plan?.planned ?? 0)} label="planned" detail="roadmap seats" />
          </div>
          <section
            className="dash-tablescroll"
            // biome-ignore lint/a11y/noNoninteractiveTabindex: deliberate wcag scrollable-region pattern: the tabIndex keeps the overflowing catalog keyboard-scrollable; the table itself only presents rows
            tabIndex={0}
            aria-label="the modality catalog table"
          >
            <table>
              {loading && <caption className="dash-empty">reading the plan from the engine…</caption>}
              {!loading && records.length === 0 && (
                <caption className="dash-empty">the engine carries no records yet</caption>
              )}
              <thead>
                <tr>
                  <th scope="col">id</th>
                  <th scope="col">label</th>
                  <th scope="col">family</th>
                  <th scope="col">state</th>
                  <th scope="col">boot</th>
                  <th scope="col">lanes</th>
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
          <p className="dash-statusnote">{legend}</p>
        </>
      )}
    </section>
  );
}
