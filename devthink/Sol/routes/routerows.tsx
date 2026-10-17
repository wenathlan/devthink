/**
 * routerows.tsx — the route ledger of the routes app: hairline rows with
 * the method chip, the mono path and the description, the health beacon
 * riding the real gateway probe. Loose component of the routes page.
 */
import { PlugConnectedRegular } from "@fluentui/react-icons";

type RouteRow = readonly [string, string, string];

export function RouteRows({
  rows,
  healthy,
  paired,
}: {
  rows: readonly RouteRow[];
  healthy: boolean | undefined;
  paired: boolean;
}) {
  return (
    <section className="dtw-card">
      <h2 className="dtw-cardtitle">
        <PlugConnectedRegular fontSize={15} aria-hidden="true" />
        Gateway routes
        <span className="dtw-navrow__count">{rows.length}</span>
      </h2>
      <ul className="dtw-routes__rows">
        {rows.map(([method, path, description]) => {
          const mutation = method !== "GET";
          const beacon = path === "/health";
          return (
            <li key={path} className="dtw-routes__row">
              <code className="dtw-routes__method" data-mut={mutation ? "true" : "false"}>
                {method}
              </code>
              <div className="dtw-routes__body">
                <h3>{path}</h3>
                <p>{description}</p>
              </div>
              {beacon ? (
                <span className="dtw-routes__state" aria-live="polite">
                  <i className="dtw-routes__dot" data-on={healthy ? "true" : "false"} aria-hidden="true" />
                  {healthy === undefined
                    ? paired
                      ? "Probing"
                      : "Unpaired"
                    : healthy
                      ? "Reachable"
                      : paired
                        ? "Unreachable"
                        : "Unpaired"}
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
