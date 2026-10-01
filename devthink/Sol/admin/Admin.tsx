/** Style: DevThink Terminal Atelier — the admin panel: only the owner and the
 * codeowner admins answer here, and every action lands in the audit trail. */
import { ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { ControlShell } from "@/control.shell";

type Admin = { handle: string; role: string; source: string; addedAt: string };
type Ban = { ip: string; reason: string; until: string; strikes: number };
type AllowedSite = { host: string; addedAt: string };

const PANEL_BASE = (import.meta.env?.VITE_CATALOG_URL as string | undefined)?.replace(/\/$/, "") ?? "";

export default function Admin() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [bans, setBans] = useState<Ban[]>([]);
  const [sites, setSites] = useState<AllowedSite[]>([]);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!PANEL_BASE) return;
    void (async () => {
      try {
        const answer = await fetch(`${PANEL_BASE}/admin/state`, { headers: { accept: "application/json" } });
        if (!answer.ok) return;
        const payload = (await answer.json()) as {
          authorized?: boolean;
          admins?: Admin[];
          bans?: Ban[];
          sites?: AllowedSite[];
        };
        setAuthorized(Boolean(payload.authorized));
        setAdmins(payload.admins ?? []);
        setBans(payload.bans ?? []);
        setSites(payload.sites ?? []);
      } catch {
        /* the panel renders empty until the paired api answers */
      }
    })();
  }, []);

  return (
    <ControlShell
      eyebrow="control plane"
      title="Admin"
      summary="The first user owns the panel; the codeowner admins follow; every strike and grant lands in the audit trail."
    >
      <section className="control-note" style={{ display: "grid", gap: 10 }}>
        <h2 style={{ margin: 0, fontSize: 15, color: "var(--dt-text)" }}>
          <ShieldCheck size={15} style={{ display: "inline", verticalAlign: "-2px", marginRight: 7 }} />
          panel state
        </h2>
        <p style={{ margin: 0 }}>
          {authorized
            ? "The panel api answers this session as an authorized admin."
            : "Waiting for the paired panel api — the surface renders read-only and empty until then."}
        </p>
      </section>

      <section className="control-note" style={{ display: "grid", gap: 10 }}>
        <h2 style={{ margin: 0, fontSize: 15, color: "var(--dt-text)" }}>admins</h2>
        <div style={{ overflowX: "auto" }}>
          <table className="control-table">
            <thead>
              <tr>
                <th>handle</th>
                <th>role</th>
                <th>source</th>
                <th>since</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.handle}>
                  <td>
                    <code>{admin.handle}</code>
                  </td>
                  <td>{admin.role}</td>
                  <td>{admin.source}</td>
                  <td>{admin.addedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="control-note" style={{ display: "grid", gap: 10 }}>
        <h2 style={{ margin: 0, fontSize: 15, color: "var(--dt-text)" }}>devtools strikes</h2>
        <div style={{ overflowX: "auto" }}>
          <table className="control-table">
            <thead>
              <tr>
                <th>address</th>
                <th>reason</th>
                <th>strikes</th>
                <th>until</th>
              </tr>
            </thead>
            <tbody>
              {bans.map((ban) => (
                <tr key={ban.ip}>
                  <td>
                    <code>{ban.ip}</code>
                  </td>
                  <td>{ban.reason}</td>
                  <td>{ban.strikes}</td>
                  <td>{ban.until}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="control-note" style={{ display: "grid", gap: 10 }}>
        <h2 style={{ margin: 0, fontSize: 15, color: "var(--dt-text)" }}>authorized sites</h2>
        <div className="control-badges">
          {sites.map((site) => (
            <span key={site.host} className="control-badge">
              {site.host}
            </span>
          ))}
        </div>
      </section>
    </ControlShell>
  );
}
