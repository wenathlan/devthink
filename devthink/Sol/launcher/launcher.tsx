/**
 * launcher page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

/** Style: DevThink Terminal Atelier — the native app launcher of the super platform.
 * The launcher tiles, the family strip and the runner binaries table all render
 * from the catalog rows; nothing is hardcoded in the component and nothing is
 * written to the visitor machine. */
import { ArrowRight, PanelsTopLeft, SquareArrowOutUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import {
  familySites,
  nativeApps,
  runnerBinaries,
  type FamilySite,
  type NativeApp,
  type RunnerBinary,
} from "../../catalog";
import { ControlShell } from "@/shell/ControlShell";

/** One launcher tile: the engine and owner ride the host line, the blurb keeps
 * its min-height from the family card, and the whole card links to the route. */
function AppTile({ app }: { app: NativeApp }) {
  return (
    <Link href={app.route} className="family-card">
      <span className="family-card__host">
        {app.engine} · {app.owner}
      </span>
      <strong>{app.title}</strong>
      <p>{app.blurb}</p>
      <span className="family-card__cta">
        open app
        <ArrowRight size={12} />
      </span>
    </Link>
  );
}

/** One family strip card, ported from the explore page so both surfaces read alike. */
function FamilyCard({ site }: { site: FamilySite }) {
  return (
    <a className="family-card" href={site.host}>
      <span className="family-card__host">{site.host.replace("https://", "")}</span>
      <strong>{site.name}</strong>
      <p>{site.blurb}</p>
      <span className="family-card__cta">
        open site
        <SquareArrowOutUpRight size={12} />
      </span>
    </a>
  );
}

export default function Launcher() {
  const [apps, setApps] = useState<NativeApp[]>([]);
  const [sites, setSites] = useState<FamilySite[]>([]);
  const [binaries, setBinaries] = useState<RunnerBinary[]>([]);

  useEffect(() => {
    void nativeApps().then(setApps);
    void familySites().then(setSites);
    void runnerBinaries().then(setBinaries);
  }, []);

  return (
    <ControlShell
      eyebrow="super platform"
      title="Launcher"
      summary="The native app launcher: the platform applications, the family sites behind them and the competitor binaries the runner accepts."
    >
      <section className="control-note" style={{ display: "grid", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <PanelsTopLeft size={15} style={{ color: "var(--dt-orange)" }} />
          <h2 style={{ margin: 0, fontSize: 15, color: "var(--dt-text)" }}>the native apps</h2>
        </div>
        {apps.length ? (
          <div className="family-grid">
            {apps.map((app) => (
              <AppTile key={app.id} app={app} />
            ))}
          </div>
        ) : (
          <p style={{ margin: 0 }}>
            The catalog has not answered any native apps yet, so the launcher stays empty and read-only.
          </p>
        )}
      </section>

      <section className="control-note" style={{ display: "grid", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <SquareArrowOutUpRight size={15} style={{ color: "var(--dt-blue)" }} />
          <h2 style={{ margin: 0, fontSize: 15, color: "var(--dt-text)" }}>the family</h2>
        </div>
        {sites.length ? (
          <div className="family-grid">
            {sites.map((site) => (
              <FamilyCard key={site.host} site={site} />
            ))}
          </div>
        ) : (
          <p style={{ margin: 0 }}>
            The catalog has not answered any family sites yet, so the strip stays empty until the database pairs.
          </p>
        )}
      </section>

      <section className="control-note" style={{ display: "grid", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <PanelsTopLeft size={15} style={{ color: "var(--dt-blue)" }} />
          <h2 style={{ margin: 0, fontSize: 15, color: "var(--dt-text)" }}>runner binaries</h2>
        </div>
        {binaries.length ? (
          <div style={{ overflowX: "auto" }}>
            <table className="control-table">
              <thead>
                <tr>
                  <th>title</th>
                  <th>kind</th>
                  <th>formats</th>
                  <th>runner</th>
                </tr>
              </thead>
              <tbody>
                {binaries.map((binary) => (
                  <tr key={binary.id}>
                    <td>{binary.title}</td>
                    <td>
                      <span className="control-badge">{binary.kind}</span>
                    </td>
                    <td>
                      <code>{binary.formats}</code>
                    </td>
                    <td>{binary.runner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ margin: 0 }}>
            The catalog has not answered any runner binaries yet, so the compact table stays empty and honest.
          </p>
        )}
      </section>
    </ControlShell>
  );
}
