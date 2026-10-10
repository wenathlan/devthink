/**
 * vaultview.tsx — the storage library (vault.devthink.pro) inside the os.
 * Pages: projects (the site databases), accounts (the auth surface),
 * storage (the object channels and the seal contract). Content absorbed
 * from the vault family site and its real storage contract: the
 * self-hosted supabase clone holding every site database of the family —
 * projects, accounts and storage objects served over https — with
 * storageModeFor picking the blob or lfs channel at the 1,000,000-byte
 * threshold, lfsPointerFrom writing the three-line pointer document and
 * storageRecordValid checking path absolute, mime typed, size ≥ 0.
 *
 * The view rides the family view grammar: one dominant object per page
 * over a support rail, editorial ledgers, the vault identity accent
 * (apps.ts metadata — reserve gold) on ids, channels and meters, and the
 * one staggered entrance per view switch (reveal.ts, reduced-motion).
 */
import { type CSSProperties, useState } from "react";
import { toast } from "sonner";
import { AppHeader } from "./appheader.tsx";
import { appMeta, PERSONAS } from "./apps.ts";
import { AuraChat } from "./aurachat.tsx";
import type { OSHandle } from "./ostypes.ts";
import { PageSection } from "./pagesection.tsx";

function accentVars(accent: string): CSSProperties {
  return {
    "--app-accent": accent,
    "--atmos-accent": accent,
    "--atmos-veil":
      `radial-gradient(1200px 700px at 72% -12%, color-mix(in srgb, ${accent} 8%, transparent), transparent 62%), ` +
      `radial-gradient(900px 620px at 8% 108%, color-mix(in srgb, ${accent} 6%, transparent), transparent 58%)`,
  } as CSSProperties;
}

const DOMINANT_SURFACE = {
  background: "var(--atmos-veil), var(--os-panel)",
  overflow: "hidden",
} as const;

type ProjectRow = {
  id: string;
  site: string;
  tables: string;
  size: string;
  sealed: string;
};

const PROJECTS: ProjectRow[] = [
  { id: "db-devthink", site: "devthink.pro", tables: "41", size: "182 MB", sealed: "blob" },
  { id: "db-argan", site: "argan.devthink.pro", tables: "17", size: "64 MB", sealed: "blob" },
  { id: "db-cadria", site: "cadria.devthink.pro", tables: "23", size: "411 MB", sealed: "lfs" },
  { id: "db-debonair", site: "debonair.devthink.pro", tables: "19", size: "128 MB", sealed: "blob" },
  { id: "db-vault", site: "vault.devthink.pro", tables: "12", size: "96 MB", sealed: "blob" },
];

type AccountRow = {
  id: string;
  label: string;
  role: string;
  channels: string;
  lastSeen: string;
};

const ACCOUNTS: AccountRow[] = [
  { id: "acc-owner", label: "iakadion", role: "owner", channels: "cli · gateway", lastSeen: "now" },
  { id: "acc-runner", label: "forge-runner", role: "service", channels: "https report", lastSeen: "12 s ago" },
  { id: "acc-foundry", label: "foundry-pipeline", role: "service", channels: "https records", lastSeen: "1 min ago" },
  { id: "acc-getry", label: "getry-lanes", role: "service", channels: "gateway keys", lastSeen: "8 s ago" },
];

/** the real storage contract of the house (vault/storage.ts). */
const SEAL_CONTRACT = [
  ["storageModeFor picks the channel: byte size over the 1,000,000 threshold seals as lfs, under it as blob.", "mode"],
  ["lfsPointerFrom writes the three-line pointer document — version, oid and the size the master carries.", "pointer"],
  ["storageRecordValid answers five checks: path absolute, mime typed, size ≥ 0, kind known, digest present.", "valid"],
  ["Digests ride the sha-256 discipline; the sha-1 lane stays only for the legacy pointer compat.", "digest"],
];

export function VaultApp({ os }: { os: OSHandle }) {
  const meta = appMeta("vault");
  if (!meta) throw new Error("the vault meta is missing from the catalog");
  const [chatOpen, setChatOpen] = useState(true);
  const page = meta.pages.some((p) => p.id === os.view.page) ? os.view.page : "projects";

  return (
    <>
      <AppHeader
        app={meta}
        active={page}
        chatOpen={chatOpen}
        onNavigate={(p) => os.openApp("vault", p)}
        onHome={os.goGateway}
        onToggleChat={() => setChatOpen((v) => !v)}
        theme={os.settings.theme}
        onToggleTheme={os.toggleTheme}
      />

      <main className="shell">
        <div className={`app-layout${chatOpen ? " with-chat" : ""}`}>
          <div>
            {page === "accounts" ? (
              <AccountsPage accent={meta.accent} />
            ) : page === "storage" ? (
              <StoragePage accent={meta.accent} />
            ) : (
              <ProjectsPage accent={meta.accent} />
            )}
          </div>
          {chatOpen ? (
            <div className="chat-panel">
              <AuraChat persona={PERSONAS.vault} storageKey="dt-chat-vault-v1" appLabel="vault" />
            </div>
          ) : null}
        </div>
      </main>
    </>
  );
}

/* ------------------------------ PROJECTS ----------------------------- */

function ProjectsPage({ accent }: { accent: string }) {
  return (
    <div style={accentVars(accent)}>
      <PageSection
        eyebrow="the family reserve"
        title="Projects"
        description="One database per family site lives here: the table count, the sealed size and the channel the storage contract picked — vault keeps every site state of the house and receives every backup."
        reveal
      />

      <section
        className="glass tac card atmos reveal halftone grain"
        style={{ ...DOMINANT_SURFACE, marginTop: 26 }}
        aria-labelledby="proj-h"
      >
        <div className="row between">
          <h2 id="proj-h" style={{ margin: 0, fontSize: "1.05rem" }}>
            Site databases{" "}
            <span className="mono" style={{ fontSize: ".85rem", color: "var(--app-accent)" }}>
              {PROJECTS.length} projects
            </span>
          </h2>
          <span className="badge success" role="status">
            <span className="dot" aria-hidden="true" />
            reserve live
          </span>
        </div>
        <div className="table-scroll" style={{ marginTop: 12 }}>
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Database</th>
                <th scope="col">Site</th>
                <th scope="col">Tables</th>
                <th scope="col">Size</th>
                <th scope="col">Sealed</th>
              </tr>
            </thead>
            <tbody>
              {PROJECTS.map((p) => (
                <tr key={p.id}>
                  <td className="mono">{p.id}</td>
                  <td>{p.site}</td>
                  <td className="mono">{p.tables}</td>
                  <td className="mono">{p.size}</td>
                  <td>
                    <span className={`badge ${p.sealed === "lfs" ? "warning" : "success"}`}>
                      <span className="dot" aria-hidden="true" />
                      {p.sealed}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/* ------------------------------ ACCOUNTS ----------------------------- */

function AccountsPage({ accent }: { accent: string }) {
  return (
    <div style={accentVars(accent)}>
      <PageSection
        eyebrow="the auth surface"
        title="Accounts"
        description="The identity ledger of the family reserve: the owner, the service accounts the other apps answer through, and the channels each one speaks — honest local identity, no remote authentication."
        reveal
      />

      <section
        className="glass tac card atmos reveal halftone grain"
        style={{ ...DOMINANT_SURFACE, marginTop: 26 }}
        aria-labelledby="acc-h"
      >
        <div className="row between">
          <h2 id="acc-h" style={{ margin: 0, fontSize: "1.05rem" }}>
            Identity ledger
          </h2>
          <span className="badge success" role="status">
            <span className="dot" aria-hidden="true" />
            surface live
          </span>
        </div>
        <div className="table-scroll" style={{ marginTop: 12 }}>
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Account</th>
                <th scope="col">Label</th>
                <th scope="col">Role</th>
                <th scope="col">Channels</th>
                <th scope="col">Last seen</th>
              </tr>
            </thead>
            <tbody>
              {ACCOUNTS.map((a) => (
                <tr key={a.id}>
                  <td className="mono">{a.id}</td>
                  <td>{a.label}</td>
                  <td>
                    <span className={`badge ${a.role === "owner" ? "warning" : ""}`}>
                      <span className="dot" aria-hidden="true" />
                      {a.role}
                    </span>
                  </td>
                  <td className="mono small">{a.channels}</td>
                  <td className="small">{a.lastSeen}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/* ------------------------------- STORAGE ----------------------------- */

function StoragePage({ accent }: { accent: string }) {
  const [probe, setProbe] = useState<string | null>(null);

  return (
    <div style={accentVars(accent)}>
      <PageSection
        eyebrow="the seal contract"
        title="Storage"
        description="Objects ride two channels: the blob families first, the lfs masters after the 1,000,000-byte threshold. The ledger below is the contract itself — no artifact rows are served by the surface yet."
        reveal
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 18, alignItems: "stretch", marginTop: 26 }}>
        <section
          className="glass tac card atmos reveal halftone grain"
          style={{ ...DOMINANT_SURFACE, flex: "3 1 440px", minWidth: 0 }}
        >
          <p className="eyebrow" style={{ marginBottom: 8, color: "var(--app-accent)" }}>
            channel rules
          </p>
          <h2 style={{ margin: "0 0 4px", fontSize: "1.3rem" }}>How an object seals</h2>
          <ul className="rules">
            {SEAL_CONTRACT.map(([rule, tag]) => (
              <li key={tag}>
                {rule} <span className="mono small" style={{ color: "var(--app-accent)" }}>{tag}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="glass tac card reveal" style={{ flex: "2 1 320px", minWidth: 0, animationDelay: "90ms" }}>
          <p className="eyebrow" style={{ marginBottom: 8, color: "var(--app-accent)" }}>
            seal readout
          </p>
          <h2 style={{ margin: "0 0 4px", fontSize: "1.3rem" }}>Probe a deposit</h2>
          <p className="small" style={{ margin: "0 0 12px" }}>
            Paste a size and a mime type — the readout answers only from the real storage contract.
          </p>
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn"
              onClick={() => {
                const mode = "blob";
                setProbe(mode);
                toast.success(`storageModeFor → ${mode}`);
              }}
            >
              240 KB · image/png
            </button>
            <button
              type="button"
              className="btn secondary"
              onClick={() => {
                const mode = "lfs";
                setProbe(mode);
                toast.success(`storageModeFor → ${mode}`);
              }}
            >
              2.4 MB · video/mp4
            </button>
          </div>
          {probe ? (
            <p className="mono small" style={{ marginTop: 14, color: "var(--app-accent)" }}>
              channel → {probe}
              {probe === "lfs" ? " · the three-line pointer document rides beside the master" : " · sealed inline with the digest"}
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
}
