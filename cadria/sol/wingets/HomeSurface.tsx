/**
 * HomeSurface.tsx — the composite winget of the home remount (the detailed
 * engine wave): the recent-generations strip the retired page carried,
 * rebuilt as ONE mount so the page anchor stays the thin face the
 * construction law pins on it. The strip owns the real engine lane the old
 * face rode: the recent generations read straight off the local gateway
 * (`listGatewayProjects(8)` behind the 800 ms abort window the gateway
 * client carries) — the quiet offline state with the real retry, the honest
 * empty state, never a fabricated row.
 *
 * The arming beat rides the face prop: while the gateway strip loads (the
 * first read of the route) the slot answers the construction face the route
 * wore — never a fake ledger row, never a spinner pretending the wall
 * answered. Every word rides the label store; the reveal stagger answers
 * the shared observer the mutation watch of the reveal runtime already
 * catches.
 */

import { ArrowUpRightRegular, SparkleRegular, WifiOffRegular } from "@fluentui/react-icons";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { Link } from "wouter";
import { type GatewayProject, listGatewayProjects } from "../../gateway.ts";
import { label } from "../../labels.ts";
import { EmptyState } from "./ShellEmptystate.tsx";

/** the abort window the recent-generations fetch rides (ms). */
const RECENT_TIMEOUT_MS = 800;

/** the props of the home surface mount. */
type HomeSurfaceProps = {
  /** the face the route answers while the gateway strip arms (the loading
   * beat of the first read — the honest arming state, never a fake row). */
  face: ReactNode;
};

/** the lifecycle of the recent-generations strip. */
type RecentState = "loading" | "online" | "offline";

/**
 * HomeSurface — the recent-generations strip over the real gateway lane.
 *
 * @param props the arming face of the route.
 * @returns the strip element, or the arming face while the gateway answers.
 */
export function HomeSurface({ face }: HomeSurfaceProps) {
  const [recent, setRecent] = useState<RecentState>("loading");
  const [projects, setProjects] = useState<readonly GatewayProject[]>([]);

  /** loads the strip off the gateway; any failure lands in the honest offline state. */
  const loadRecent = useCallback((live: () => boolean): void => {
    setRecent("loading");
    listGatewayProjects(8, RECENT_TIMEOUT_MS)
      .then((rows) => {
        if (!live()) return;
        setProjects(rows);
        setRecent("online");
      })
      .catch(() => {
        if (live()) setRecent("offline");
      });
  }, []);

  useEffect(() => {
    let live = true;
    loadRecent(() => live);
    return () => {
      live = false;
    };
  }, [loadRecent]);

  // the arming beat: the gateway holds the first read — the slot answers
  // the face the route wore until the engine's own rows (or its own honest
  // offline state) land, never a fabricated ledger row
  if (recent === "loading") return <>{face}</>;

  return (
    <section aria-labelledby="recent-h" style={{ marginTop: 44 }}>
      <div className="row">
        <h2 id="recent-h" className="mono-label reveal" style={{ margin: "0 0 12px", fontWeight: 600 }}>
          {label("home.recent.head")}
        </h2>
        {recent === "online" && (
          <span className="mono-label" style={{ marginLeft: "auto" }}>
            {label("home.recent.count").replace("{n}", String(projects.length))}
          </span>
        )}
      </div>
      <div className="ledger reveal">
        {recent === "offline" && (
          <EmptyState
            icon={WifiOffRegular}
            title={label("home.recent.offlineTitle")}
            line={label("home.recent.offlineLine")}
            action={
              <button type="button" className="btn" style={{ minHeight: 40 }} onClick={() => loadRecent(() => true)}>
                {label("home.recent.retry")}
              </button>
            }
          />
        )}
        {recent === "online" && projects.length === 0 && (
          <EmptyState
            icon={SparkleRegular}
            title={label("home.recent.emptyTitle")}
            line={label("home.recent.emptyLine")}
            action={
              <Link href="/studio" className="btn" style={{ minHeight: 40 }}>
                {label("home.recent.openStudio")}
              </Link>
            }
          />
        )}
        {recent === "online" &&
          projects.map((project, index) => (
            <Link
              key={project.id}
              href={`/player?id=${encodeURIComponent(project.id)}`}
              className="ledger-row"
              style={{ textDecoration: "none" }}
            >
              <span className="ledger-no" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="ledger-main">
                <h3 className="ledger-title" style={{ fontSize: "1rem" }}>
                  {project.style}
                </h3>
                <p className="ledger-text mono-label" style={{ margin: 0, overflowWrap: "anywhere" }}>
                  {project.id}
                </p>
              </div>
              <span className="mono-label" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {project.bpm} bpm · {project.key}
                <ArrowUpRightRegular fontSize={14} aria-hidden="true" />
              </span>
            </Link>
          ))}
      </div>
    </section>
  );
}

export default HomeSurface;
