/**
 * launcher page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

/** Style: DevThink launcher — the app launcher of the OS. Every app cell is
 * the desktop tile grammar (74×84 win11 cell, hover wash, press scale(.7)
 * on the tile, the name in the layered-shadow label, the detail as the
 * tooltip) rendered from the shared catalog Sol/shell/appregistry.ts — the
 * same rows the desktop grid and the Start menu read, nothing hardcoded
 * here. The search filters the catalog live with the thin focus ring, the
 * cells are real focusable anchors (keyboard navigable), and the family apps
 * resolve EXACTLY per the registry target kinds: internal kinds navigate
 * with the router, the external kind redirects through familyurl() of
 * ../../deploybase.ts like every other family hand-off of the OS. The
 * runner binaries stay the honest catalog table below the grid. */
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ControlShell } from "@/shell/ControlShell";
import { type RunnerBinary, runnerBinaries } from "../../catalog";
import { familyurl } from "../../deploybase.ts";
import { DESKTOP_APPS, type DesktopApp, seedOsView } from "../shell/appregistry.ts";
import { AppTile } from "../shell/apptile.tsx";

/** the internal route of one registry app — every kind the registry
 * declares maps to a real page of this interface; the external kind never
 * reaches here (the family cell renders an anchor to familyurl) */
function appRoute(app: DesktopApp): string {
  if (app.target.kind === "route") return app.target.href;
  if (app.target.kind === "destination") return `/${app.target.id}`;
  if (app.target.kind === "window") return app.target.id === "chat" ? "/chat" : "/history";
  return "/os";
}

/** the launcher cell: the same 74×84 tile grammar the desktop grid uses,
 * static in the page flow (the desktop composition owns the absolute form) */
function AppCell({ app }: { app: DesktopApp }) {
  const cell = (
    <>
      <AppTile app={app} size={26} />
      <span className="dt-appicon__label">{app.name}</span>
    </>
  );
  const cellProps = {
    className: "dt-appicon",
    tabIndex: 0,
    title: app.detail,
    "aria-label": `${app.name} — ${app.detail}`,
    style: { position: "static", transform: "none" } as const,
  };
  if (app.target.kind === "external") {
    return (
      <a {...cellProps} href={familyurl(app.target.slug)}>
        {cell}
      </a>
    );
  }
  return (
    <Link
      {...cellProps}
      href={appRoute(app)}
      onClick={() => {
        if (app.target.kind === "os") seedOsView(app.target.app);
      }}
    >
      {cell}
    </Link>
  );
}

/** the live search field: the win11 search recipe — 4px shell, dark
 * hairline, the thin inward focus ring (never a glow) */
function LauncherSearch({ query, onQuery }: { query: string; onQuery: (next: string) => void }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center", width: "min(340px, 100%)" }}>
      <Search
        size={13}
        aria-hidden="true"
        style={{ position: "absolute", left: 12, color: "var(--dt-faint)", pointerEvents: "none" }}
      />
      <input
        value={query}
        onChange={(event) => onQuery(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="search the apps"
        aria-label="Search the launcher apps"
        autoComplete="off"
        spellCheck={false}
        style={{
          width: "100%",
          minHeight: "36px",
          padding: "0 12px 0 32px",
          color: "var(--dt-text)",
          background: focused ? "rgb(255 255 255 / 6%)" : "rgb(255 255 255 / 4%)",
          border: `1px solid ${focused ? "var(--dt-edge-strong)" : "var(--dt-edge)"}`,
          borderRadius: "4px",
          outline: "none",
          boxShadow: focused ? "inset 0 0 0 1px var(--dt-blue)" : "none",
          font: "12px var(--dt-mono)",
          transition:
            "border-color 150ms var(--dt-ease), background 150ms var(--dt-ease), box-shadow 150ms var(--dt-ease)",
        }}
      />
    </div>
  );
}

export default function Launcher() {
  const [query, setQuery] = useState("");
  const [binaries, setBinaries] = useState<RunnerBinary[]>([]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return DESKTOP_APPS;
    return DESKTOP_APPS.filter(
      (app) => app.name.toLowerCase().includes(needle) || app.detail.toLowerCase().includes(needle),
    );
  }, [query]);
  const native = useMemo(() => filtered.filter((app) => app.target.kind !== "external"), [filtered]);
  const family = useMemo(() => filtered.filter((app) => app.target.kind === "external"), [filtered]);

  useEffect(() => {
    void runnerBinaries().then(setBinaries);
  }, []);

  return (
    <ControlShell
      eyebrow="the local os"
      title="Launcher"
      summary="The app launcher of the OS: every native surface and every family app of the shared catalog, searchable, with the runner binaries the platform accepts."
    >
      <section className="control-note" style={{ display: "grid", gap: 14, padding: 16, borderRadius: 8 }}>
        <LauncherSearch query={query} onQuery={setQuery} />

        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <h2 style={{ margin: 0, fontSize: 15, color: "var(--dt-text)" }}>the native apps</h2>
          <span style={{ color: "var(--dt-faint)", font: "9px var(--dt-mono)", textTransform: "uppercase" }}>
            {native.length} of the catalog
          </span>
        </div>
        {native.length ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, 84px)",
              gap: 6,
              justifyItems: "start",
            }}
          >
            {native.map((app) => (
              <AppCell key={app.id} app={app} />
            ))}
          </div>
        ) : (
          <p style={{ margin: 0 }}>No native app matches that search. The catalog rows stay honest and read-only.</p>
        )}

        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <h2 style={{ margin: 0, fontSize: 15, color: "var(--dt-text)" }}>the family</h2>
          <span style={{ color: "var(--dt-faint)", font: "9px var(--dt-mono)", textTransform: "uppercase" }}>
            opens on its own host
          </span>
        </div>
        {family.length ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, 84px)",
              gap: 6,
              justifyItems: "start",
            }}
          >
            {family.map((app) => (
              <AppCell key={app.id} app={app} />
            ))}
          </div>
        ) : (
          <p style={{ margin: 0 }}>
            No family app matches that search. The registry redirects stay exactly as declared.
          </p>
        )}
      </section>

      <section className="control-note" style={{ display: "grid", gap: 10, padding: 16, borderRadius: 8 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
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
