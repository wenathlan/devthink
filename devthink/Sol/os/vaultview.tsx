/**
 * vaultview.tsx — the storage library (vault.devthink.pro) inside the os.
 * Pages: projects (the site buckets), accounts (the auth surface),
 * storage (the seal contract and the probe). Content absorbed from the
 * vault family site and its real storage contract: the self-hosted
 * supabase clone holding every site database of the family — projects,
 * accounts and storage objects served over https — with storageModeFor
 * picking the blob or lfs channel at the 1,000,000-byte threshold,
 * lfsPointerFrom writing the three-line pointer document and
 * storageRecordValid checking path absolute, mime typed, size ≥ 0.
 *
 * Task 3-c identity pass: the view opens with the family hero (animated
 * vault glyph — the dial turns inside the stroke, the app name, one
 * tagline, four key numbers in tabular figures) and the ledgers ride the
 * surface ladder (#242424 → #494949 over the mica, hairline only on the
 * same step). The storage page reads the REAL seal contract: the probe
 * computes storageModeFor against the 1,000,000-byte threshold and draws
 * the three-line pointer shape, and the empty artifact ledger is an
 * honest family empty state — the reserve is sealed, no rows served yet.
 */
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppHeader } from "./appheader.tsx";
import { appMeta, PERSONAS } from "./apps.ts";
import { AuraChat } from "./aurachat.tsx";
import {
  accentVars,
  FamilyEmpty,
  FamilyHero,
  type FamilyStat,
  FamilyStyles,
  familyAccentOf,
} from "./familyidentity.tsx";
import type { OSHandle } from "./ostypes.ts";
import { PageSection } from "./pagesection.tsx";

/** the real threshold of the storage contract (vault/storage.ts). */
const LFS_THRESHOLD = 1_000_000;

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

/** the retention rules the buckets ledger keeps (contract statements, not stats). */
const RESERVE_RULES = [
  "One bucket per family site — the database is the bucket, the site is the tenant.",
  "Every backup lands in the reserve before a zone republishes — rollback stays one restore away.",
  "The channel is picked per object by the threshold rule, never per mood.",
  "The seal is audited by digest: sha-256 on the masters, pointers beside the lfs channel.",
];

/** the honest totals of the reserve, computed from the ledger itself. */
function reserveTotals() {
  let tables = 0;
  let mb = 0;
  let blobMb = 0;
  let lfsMb = 0;
  for (const p of PROJECTS) {
    tables += Number(p.tables);
    mb += Number.parseFloat(p.size);
    if (p.sealed === "lfs") lfsMb += Number.parseFloat(p.size);
    else blobMb += Number.parseFloat(p.size);
  }
  const pct = (n: number) => `${Math.round((n / mb) * 100)}%`;
  return { tables, mb, blobMb, lfsMb, blobPct: pct(blobMb), lfsPct: pct(lfsMb) };
}

export function VaultApp({ os }: { os: OSHandle }) {
  const meta = appMeta("vault");
  if (!meta) throw new Error("the vault meta is missing from the catalog");
  const [chatOpen, setChatOpen] = useState(true);
  const page = meta.pages.some((p) => p.id === os.view.page) ? os.view.page : "projects";
  const accent = familyAccentOf(meta.id, meta.accent);
  const totals = reserveTotals();

  const stats: FamilyStat[] = [
    { label: "site buckets", value: String(PROJECTS.length) },
    { label: "sealed in the reserve", value: `${totals.mb} MB`, accent: true },
    { label: "tables served", value: String(totals.tables) },
    { label: "channels — blob · lfs", value: "2" },
  ];

  return (
    <div className="fam-view" style={accentVars(accent)}>
      <FamilyStyles />
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
            <FamilyHero
              app={meta}
              tagline="The sealed reserve of the family — every site database, every account and every object behind one door."
              stats={stats}
              glyphMotion="dial"
              status="reserve sealed"
            />
            {page === "accounts" ? (
              <AccountsPage />
            ) : page === "storage" ? (
              <StoragePage />
            ) : (
              <ProjectsPage totals={totals} />
            )}
          </div>
          {chatOpen ? (
            <div className="chat-panel">
              <AuraChat persona={PERSONAS.vault} storageKey="dt-chat-vault-v1" appLabel="vault" />
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}

/* ------------------------------ PROJECTS ----------------------------- */

function ProjectsPage({ totals }: { totals: ReturnType<typeof reserveTotals> }) {
  return (
    <>
      <PageSection
        eyebrow="the family reserve"
        title="Projects"
        heading="h2"
        description="One bucket per family site lives here: the table count, the sealed size and the channel the storage contract picked — vault keeps every site state of the house and receives every backup."
        reveal
      />

      <section
        className="fam-card reveal"
        style={{
          ...{ background: "var(--atmos-veil), var(--fam-s1)", overflow: "hidden" },
          marginTop: 26,
          padding: 22,
        }}
        aria-labelledby="proj-h"
      >
        <div className="fam-card__head">
          <h2 id="proj-h" className="fam-card__title">
            Site buckets <span className="fam-card__count">{PROJECTS.length} buckets</span>
          </h2>
          <span className="badge success" role="status">
            <span className="dot" aria-hidden="true" />
            reserve sealed
          </span>
        </div>
        <div className="table-scroll" style={{ marginTop: 12 }}>
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Bucket</th>
                <th scope="col">Site</th>
                <th scope="col">Tables</th>
                <th scope="col">Sealed size</th>
                <th scope="col">Channel</th>
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

        {/* the seal readout: the channel split, computed from the ledger */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 18,
            marginTop: 20,
          }}
        >
          <div className="fam-microrow" style={{ border: 0, padding: 0 }}>
            <div className="row between" style={{ marginBottom: 6 }}>
              <span className="fam-stat__label">blob channel</span>
              <span className="fam-num mono" style={{ fontSize: ".8rem" }}>
                {totals.blobMb} MB · {totals.blobPct}
              </span>
            </div>
            <div className="fam-meter" role="img" aria-label={`blob channel ${totals.blobPct} of the reserve`}>
              <i style={{ width: totals.blobPct }} />
            </div>
          </div>
          <div className="fam-microrow" style={{ border: 0, padding: 0 }}>
            <div className="row between" style={{ marginBottom: 6 }}>
              <span className="fam-stat__label">lfs channel — sealed masters</span>
              <span className="fam-num mono" style={{ fontSize: ".8rem", color: "var(--app-accent)" }}>
                {totals.lfsMb} MB · {totals.lfsPct}
              </span>
            </div>
            <div className="fam-meter" role="img" aria-label={`lfs channel ${totals.lfsPct} of the reserve`}>
              <i style={{ width: totals.lfsPct }} />
            </div>
          </div>
        </div>
      </section>

      {/* the retention rail: what the reserve keeps */}
      <section className="fam-card reveal" style={{ marginTop: 18, padding: "16px 22px 8px" }} aria-labelledby="keep-h">
        <h2 id="keep-h" className="fam-card__title" style={{ marginBottom: 4 }}>
          Retention rules <span className="fam-card__count">how the reserve keeps</span>
        </h2>
        {RESERVE_RULES.map((rule, i) => (
          <div
            key={rule}
            className="fam-microrow"
            style={{ gridTemplateColumns: "auto minmax(0, 1fr)", alignItems: "start" }}
          >
            <span
              className="mono"
              style={{ color: "var(--app-accent)", fontSize: ".82rem", fontWeight: 600, paddingTop: 2 }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <p style={{ margin: 0, color: "var(--sol-muted)" }}>{rule}</p>
          </div>
        ))}
      </section>
    </>
  );
}

/* ------------------------------ ACCOUNTS ----------------------------- */

function AccountsPage() {
  return (
    <>
      <PageSection
        eyebrow="the auth surface"
        title="Accounts"
        heading="h2"
        description="The identity ledger of the family reserve: the owner, the service accounts the other apps answer through, and the channels each one speaks — honest local identity, no remote authentication."
        reveal
      />

      <section
        className="fam-card reveal"
        style={{
          ...{ background: "var(--atmos-veil), var(--fam-s1)", overflow: "hidden" },
          marginTop: 26,
          padding: 22,
        }}
        aria-labelledby="acc-h"
      >
        <div className="fam-card__head">
          <h2 id="acc-h" className="fam-card__title">
            Identity ledger
          </h2>
          <span className="badge success" role="status">
            <span className="dot" aria-hidden="true" />
            surface mounted
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

      <section
        className="fam-card reveal"
        style={{ marginTop: 18, maxWidth: 640, padding: 22 }}
        aria-labelledby="accr-h"
      >
        <h2 id="accr-h" className="fam-card__title" style={{ marginBottom: 8 }}>
          Who answers through the reserve
        </h2>
        <p style={{ margin: 0, color: "var(--sol-muted)" }}>
          The service accounts are the family talking to itself: forge reports outcomes, foundry writes records, getry
          rotates keys. The owner identity stays local — the reserve never phones home.
        </p>
      </section>
    </>
  );
}

/* ------------------------------- STORAGE ----------------------------- */

type ProbeState = { bytes: number; mime: string; mode: "blob" | "lfs" };

/**
 * the REAL seal rule (vault/storage.ts): one threshold, two channels.
 * The probe answers only from this rule — no network, no invented rows.
 */
function storageModeFor(bytes: number): "blob" | "lfs" {
  return bytes > LFS_THRESHOLD ? "lfs" : "blob";
}

function StoragePage() {
  const [sizeInput, setSizeInput] = useState("240");
  const [unit, setUnit] = useState<"KB" | "MB">("KB");
  const [mime, setMime] = useState("image/png");
  const [probe, setProbe] = useState<ProbeState | null>(null);

  const bytes = useMemo(() => {
    const n = Number.parseFloat(sizeInput);
    if (!Number.isFinite(n) || n < 0) return -1;
    return Math.round(unit === "MB" ? n * 1_000_000 : n * 1_000);
  }, [sizeInput, unit]);

  function runProbe() {
    if (bytes < 0) {
      toast.error("Size must be a non-negative number", { description: "storageRecordValid checks size ≥ 0." });
      return;
    }
    if (!mime.trim() || !mime.includes("/")) {
      toast.error("A record is mime typed", {
        description: "storageRecordValid answers five checks — mime typed is one.",
      });
      return;
    }
    const mode = storageModeFor(bytes);
    setProbe({ bytes, mime: mime.trim(), mode });
    toast.success(`storageModeFor → ${mode}`);
  }

  return (
    <>
      <PageSection
        eyebrow="the seal contract"
        title="Storage"
        heading="h2"
        description="Objects ride two channels: the blob families first, the lfs masters after the 1,000,000-byte threshold. The probe below answers from the real contract — no artifact rows are served by the surface yet."
        reveal
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 18, alignItems: "stretch", marginTop: 26 }}>
        <section
          className="fam-card reveal"
          style={{
            ...{ background: "var(--atmos-veil), var(--fam-s1)", overflow: "hidden" },
            flex: "3 1 440px",
            minWidth: 0,
            padding: 22,
          }}
        >
          <p className="eyebrow" style={{ marginBottom: 8, color: "var(--app-accent)" }}>
            channel rules
          </p>
          <h2 className="fam-card__title" style={{ marginBottom: 4, fontSize: "1.2rem" }}>
            How an object seals
          </h2>
          <ul className="rules">
            {SEAL_CONTRACT.map(([rule, tag]) => (
              <li key={tag}>
                {rule} <span className="mono small fam-num">{tag}</span>
              </li>
            ))}
          </ul>
        </section>

        <section
          className="fam-card fam-card--s2 reveal"
          style={{ flex: "2 1 340px", minWidth: 0, padding: 22, animationDelay: "90ms" }}
        >
          <p className="eyebrow" style={{ marginBottom: 8, color: "var(--app-accent)" }}>
            seal readout
          </p>
          <h2 className="fam-card__title" style={{ marginBottom: 4, fontSize: "1.2rem" }}>
            Probe a deposit
          </h2>
          <p className="small" style={{ margin: "0 0 12px" }}>
            Give a size and a mime type — the readout runs storageModeFor against the 1,000,000-byte threshold and
            answers the channel, nothing else.
          </p>
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <input
              className="input"
              style={{ flex: "2 1 130px", minWidth: 110 }}
              type="number"
              min={0}
              step="any"
              inputMode="decimal"
              value={sizeInput}
              onChange={(e) => setSizeInput(e.target.value)}
              aria-label="Deposit size"
            />
            <select
              className="input"
              style={{ flex: "1 1 84px", minWidth: 84 }}
              value={unit}
              onChange={(e) => setUnit(e.target.value === "MB" ? "MB" : "KB")}
              aria-label="Size unit"
            >
              <option value="KB">KB</option>
              <option value="MB">MB</option>
            </select>
            <input
              className="input"
              style={{ flex: "2 1 150px", minWidth: 130 }}
              type="text"
              value={mime}
              onChange={(e) => setMime(e.target.value)}
              aria-label="Deposit mime type"
              placeholder="image/png"
              spellCheck={false}
            />
          </div>
          <div className="row" style={{ marginTop: 12 }}>
            <button type="button" className="btn" onClick={runProbe}>
              Run the seal readout
            </button>
            <button
              type="button"
              className="btn secondary"
              onClick={() => {
                setSizeInput("2.4");
                setUnit("MB");
                setMime("video/mp4");
              }}
            >
              Sample: 2.4 MB · video/mp4
            </button>
          </div>

          {probe ? (
            <div style={{ marginTop: 16, borderTop: "1px solid var(--fam-hair)", paddingTop: 14 }}>
              <p className="mono small fam-num" style={{ margin: 0, color: "var(--app-accent)" }}>
                {probe.bytes.toLocaleString("en-US")} bytes · {probe.mime} → {probe.mode}
                {probe.mode === "lfs"
                  ? ` — over the ${LFS_THRESHOLD.toLocaleString("en-US")}-byte threshold`
                  : ` — at or under the ${LFS_THRESHOLD.toLocaleString("en-US")}-byte threshold`}
              </p>
              {probe.mode === "lfs" ? (
                <pre style={{ marginTop: 10, marginBottom: 0 }}>
                  <code>{`version https://git-lfs.github.com/spec/v1
oid sha256:<digest of the master>
size ${probe.bytes}`}</code>
                </pre>
              ) : (
                <p className="small" style={{ margin: "8px 0 0" }}>
                  Sealed inline with the digest — the three-line pointer document stays unmounted.
                </p>
              )}
            </div>
          ) : null}
        </section>
      </div>

      {/* the honest empty ledger: no artifact rows are served yet */}
      <section className="fam-card reveal" style={{ marginTop: 18 }} aria-label="Artifact ledger">
        <FamilyEmpty
          app={appMeta("vault") as NonNullable<ReturnType<typeof appMeta>>}
          motion="dial"
          title="The artifact ledger is sealed and empty"
          line="No artifact rows are served by the surface yet — objects mount when the vault clone starts taking deposits. The contract above is already the real one."
          actionLabel="Probe a deposit instead"
          onAction={() => toast("The seal readout above answers from the real storage contract")}
        />
      </section>
    </>
  );
}
