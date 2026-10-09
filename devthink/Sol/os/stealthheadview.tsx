/**
 * stealthheadview.tsx — the FPS platform (stealthhead.devthink.pro)
 * inside the os. Pages: match (5v5 lobby + Lockout rules), ranking
 * (global ladder + divisions), arsenal (6 weapons with stat bars + class
 * filter). Content absorbed from the static stealthhead site.
 *
 * C2-02 pass: one dominant object per page (red light source, halftone
 * edge, film grain) over a support rail, editorial ledgers instead of
 * repeated identical cards, the stealthhead identity accent (apps.ts
 * metadata) on lobby ids, MMR and the stat bars, and the one staggered
 * entrance per view switch (reveal.ts, reduced-motion guarded).
 */
import { type CSSProperties, useState } from "react";
import { toast } from "sonner";
import { AppHeader } from "./appheader";
import { appMeta, PERSONAS } from "./apps";
import { AuraChat } from "./aurachat";
import type { OSHandle } from "./ostypes";
import { PageSection } from "./pagesection";

type PlayerRow = { name: string; kd: string; ping: string; status: "ready" | "queued" };

/**
 * the family accent as local css vars: the C1-01 atmosphere recipes ride
 * the app identity — the veil, the halftone ink and every key-number tint
 * resolve through --app-accent / --atmos-accent inside this subtree.
 */
function accentVars(accent: string): CSSProperties {
  return {
    "--app-accent": accent,
    "--atmos-accent": accent,
    "--atmos-veil":
      `radial-gradient(1200px 700px at 72% -12%, color-mix(in srgb, ${accent} 8%, transparent), transparent 62%), ` +
      `radial-gradient(900px 620px at 8% 108%, color-mix(in srgb, ${accent} 6%, transparent), transparent 58%)`,
  } as CSSProperties;
}

/** the dominant-object surface: the named light source over the os panel (.os-root .glass wins over .atmos, so the veil lands inline). */
const DOMINANT_SURFACE = {
  background: "var(--atmos-veil), var(--os-panel)",
  overflow: "hidden",
} as const;

const SQUAD_A: PlayerRow[] = [
  { name: "v1per", kd: "2.41", ping: "12 ms", status: "ready" },
  { name: "SolarFlare", kd: "1.98", ping: "15 ms", status: "ready" },
  { name: "drift0r", kd: "1.64", ping: "21 ms", status: "ready" },
  { name: "NoScopeNina", kd: "2.05", ping: "18 ms", status: "ready" },
  { name: "ghost-9", kd: "1.37", ping: "26 ms", status: "queued" },
];
const SQUAD_B: PlayerRow[] = [
  { name: "TankGirl", kd: "1.82", ping: "14 ms", status: "ready" },
  { name: "headshotHank", kd: "2.17", ping: "19 ms", status: "ready" },
  { name: "quietstorm", kd: "1.51", ping: "33 ms", status: "ready" },
  { name: "xX_Recon_Xx", kd: "1.12", ping: "41 ms", status: "queued" },
  { name: "ping_lord", kd: "0.98", ping: "58 ms", status: "queued" },
];

const LOCKOUT_RULES = [
  ["First to six rounds wins; each round is capped at 90 s.", "90 s"],
  ["One life per round — 3 s spawn shield, no mid-round respawns.", "3 s"],
  ["A squad wipe ends the round instantly; ranked has no killcam delay.", "wipe"],
  ["Loadout and arsenal swaps only between rounds, never mid-round.", "swap"],
  ["Overtime is sudden death on the center grid: first elimination takes the match.", "OT"],
  ["Friendly fire is off in Bronze and Silver, on in Gold and Solar.", "FF"],
];

const LADDER: Array<{ pos: number; name: string; tier: string; tierCls: string; mmr: string; wr: string }> = [
  { pos: 1, name: "Kovać", tier: "Solar", tierCls: "badge", mmr: "2,847", wr: "64%" },
  { pos: 2, name: "NoScopeNina", tier: "Solar", tierCls: "badge", mmr: "2,791", wr: "61%" },
  { pos: 3, name: "ghost-9", tier: "Solar", tierCls: "badge", mmr: "2,703", wr: "59%" },
  { pos: 4, name: "SolarFlare", tier: "Gold", tierCls: "badge warning", mmr: "2,512", wr: "58%" },
  { pos: 5, name: "v1per", tier: "Gold", tierCls: "badge warning", mmr: "2,398", wr: "55%" },
  { pos: 6, name: "drift0r", tier: "Gold", tierCls: "badge warning", mmr: "2,204", wr: "52%" },
  { pos: 7, name: "TankGirl", tier: "Silver", tierCls: "badge silver", mmr: "1,845", wr: "49%" },
  { pos: 8, name: "ping_lord", tier: "Bronze", tierCls: "badge bronze", mmr: "1,102", wr: "41%" },
];

const DIVISIONS = [
  {
    name: "Bronze",
    share: "42%",
    range: "0 – 1,199 MMR",
    color: "#e09a6a",
    desc: "Placement start. Friendly fire off, wider hit registration, no ladder decay.",
  },
  {
    name: "Silver",
    share: "31%",
    range: "1,200 – 1,899 MMR",
    color: "#c9c2b4",
    desc: "Standard rules. Squad voice unlocked and match history goes public.",
  },
  {
    name: "Gold",
    share: "19%",
    range: "1,900 – 2,599 MMR",
    color: "var(--sol-warning)",
    desc: "Competitive rules: friendly fire on, stricter ping floor, overtime stakes.",
  },
  {
    name: "Solar",
    share: "8%",
    range: "2,600+ MMR",
    color: "var(--sol-primary)",
    desc: "The sun division. Top 500 ladders, pro server pool, season-end invitationals.",
  },
];

type Weapon = {
  name: string;
  cls: "assault" | "smr" | "lmg" | "sniper";
  desc: string;
  dmg: number;
  range: number;
  rate: number;
};

const WEAPONS: Weapon[] = [
  {
    name: "KH-47 Comet",
    cls: "assault",
    desc: "Full-auto workhorse: heavy first shot, controllable vertical kick, honest recoil.",
    dmg: 68,
    range: 62,
    rate: 55,
  },
  {
    name: "KH-19 Talon",
    cls: "assault",
    desc: "The Comet's lighter sister — built for strafe duels, tight corners and fast peeks.",
    dmg: 58,
    range: 55,
    rate: 66,
  },
  {
    name: "MPX-SD Wasp",
    cls: "smr",
    desc: "Suppressed and hyper-mobile. Melts inside 15 m, fades fast beyond it.",
    dmg: 44,
    range: 38,
    rate: 88,
  },
  {
    name: "S12 Hornet",
    cls: "smr",
    desc: "Machine-pistol burst class — the firerate ceiling of the whole arsenal.",
    dmg: 40,
    range: 30,
    rate: 94,
  },
  {
    name: "M250 Anvil",
    cls: "lmg",
    desc: "Belt-fed area denial. Slow to spin up — impossible to push once it sings.",
    dmg: 72,
    range: 78,
    rate: 40,
  },
  {
    name: "LR-98 Zenith",
    cls: "sniper",
    desc: "One shot, one grid square. The bolt cycle punishes greed; chest shots are rewarded.",
    dmg: 95,
    range: 98,
    rate: 12,
  },
];

export function StealthheadApp({ os }: { os: OSHandle }) {
  const meta = appMeta("stealthhead");
  if (!meta) throw new Error("the stealthhead meta is missing from the catalog");
  const [chatOpen, setChatOpen] = useState(true);
  const page = meta.pages.some((p) => p.id === os.view.page) ? os.view.page : "match";

  return (
    <>
      <AppHeader
        app={meta}
        active={page}
        chatOpen={chatOpen}
        onNavigate={(p) => os.openApp("stealthhead", p)}
        onHome={os.goGateway}
        onToggleChat={() => setChatOpen((v) => !v)}
        theme={os.settings.theme}
        onToggleTheme={os.toggleTheme}
      />

      <main className="shell">
        <div className={`app-layout${chatOpen ? " with-chat" : ""}`}>
          <div>
            {page === "match" ? (
              <MatchPage accent={meta.accent} />
            ) : page === "ranking" ? (
              <RankingPage accent={meta.accent} />
            ) : (
              <ArsenalPage accent={meta.accent} />
            )}
          </div>
          {chatOpen ? (
            <div className="chat-panel">
              <AuraChat persona={PERSONAS.stealthhead} storageKey="dt-chat-stealthhead-v1" appLabel="stealthhead" />
            </div>
          ) : null}
        </div>
      </main>
    </>
  );
}

/* -------------------------------- MATCH ------------------------------ */

function MatchPage({ accent }: { accent: string }) {
  const [queued, setQueued] = useState(false);

  return (
    <div style={accentVars(accent)}>
      <PageSection
        eyebrow="matchmaking"
        title="Match"
        description="One queue, one lobby, ten players. The matchmaker fills both squads by MMR band and enforces the 12 ms ping floor — then hands the lobby to versawase for spawn and world setup."
        reveal
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 18, alignItems: "stretch", marginTop: 26 }}>
        {/* the dominant object: the ranked lobby under the red light */}
        <section
          className="glass tac card atmos reveal halftone grain"
          style={{ ...DOMINANT_SURFACE, flex: "3 1 440px", minWidth: 0 }}
          aria-labelledby="lobby-h"
        >
          <div className="row between">
            <h2 id="lobby-h" style={{ margin: 0, fontSize: "1.05rem" }}>
              Ranked lobby{" "}
              <span className="mono" style={{ fontSize: ".85rem", color: "var(--app-accent)" }}>
                #SH-4471
              </span>
            </h2>
            <span className={`badge ${queued ? "warning" : "success"}`} role="status">
              <span className="dot" aria-hidden="true" />
              {queued ? "Searching" : "Lobby ready"}
            </span>
          </div>
          <p className="small" style={{ margin: "8px 0 14px" }}>
            Mode <strong className="strong">Lockout 5v5</strong> · map{" "}
            <strong className="strong">Sector Solar-5</strong> · ping floor{" "}
            <strong className="strong mono" style={{ color: "var(--app-accent)" }}>
              12 ms
            </strong>
          </p>
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Player</th>
                  <th scope="col">K/D</th>
                  <th scope="col">Ping</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="squad-row">
                  <td colSpan={4}>Squad Alpha</td>
                </tr>
                {SQUAD_A.map((p) => (
                  <PlayerTr key={p.name} p={p} />
                ))}
                <tr className="squad-row">
                  <td colSpan={4}>Squad Bravo</td>
                </tr>
                {SQUAD_B.map((p) => (
                  <PlayerTr key={p.name} p={p} />
                ))}
              </tbody>
            </table>
          </div>
          <div className="row" style={{ marginTop: 18 }}>
            <button
              type="button"
              className="btn"
              onClick={() => {
                const next = !queued;
                setQueued(next);
                if (next) toast("Searching for a 5v5 lobby…");
                else toast.success("Queue left — lobby ready");
              }}
            >
              {queued ? "Leave queue" : "Find match"}
            </button>
            <button
              type="button"
              className="btn secondary"
              onClick={() => document.getElementById("sh-arsenal-hint")?.scrollIntoView({ behavior: "smooth" })}
            >
              Pick a loadout first
            </button>
          </div>
        </section>

        {/* the support rail: the mode rules */}
        <section
          className="glass tac card reveal"
          id="sh-arsenal-hint"
          aria-labelledby="rules-h"
          style={{ flex: "2 1 300px", minWidth: 0, animationDelay: "90ms" }}
        >
          <p className="eyebrow" style={{ marginBottom: 8, color: "var(--app-accent)" }}>
            mode rules
          </p>
          <h2 id="rules-h" style={{ margin: "0 0 4px", fontSize: "1.3rem" }}>
            Lockout 5v5
          </h2>
          <ul className="rules">
            {LOCKOUT_RULES.map(([rule]) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function PlayerTr({ p }: { p: PlayerRow }) {
  return (
    <tr>
      <td className="strong">{p.name}</td>
      <td className="mono">{p.kd}</td>
      <td>
        <span className="mono">{p.ping}</span>
      </td>
      <td>
        {p.status === "ready" ? (
          <span className="badge success">ready</span>
        ) : (
          <span className="badge info">queued</span>
        )}
      </td>
    </tr>
  );
}

/* ------------------------------- RANKING ----------------------------- */

function RankingPage({ accent }: { accent: string }) {
  return (
    <div style={accentVars(accent)}>
      <PageSection
        eyebrow="ranking · solar season 4"
        title="Ranking"
        description="MMR ladders from Bronze to Solar. The ladder resets each season; placement takes ten matches. Only the top 500 live in Solar."
        reveal
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 18, alignItems: "stretch", marginTop: 26 }}>
        {/* the dominant object: the live ladder under the red light */}
        <section
          className="glass tac card atmos reveal grain"
          style={{ ...DOMINANT_SURFACE, flex: "3 1 440px", minWidth: 0 }}
          aria-labelledby="lb-h"
        >
          <div className="row between" style={{ marginBottom: 6 }}>
            <h2 id="lb-h" style={{ margin: 0, fontSize: "1.05rem" }}>
              Global ladder
            </h2>
            <span className="badge">
              <span className="dot" aria-hidden="true" /> live
            </span>
          </div>
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Player</th>
                  <th scope="col">Tier</th>
                  <th scope="col">MMR</th>
                  <th scope="col">Winrate</th>
                </tr>
              </thead>
              <tbody>
                {LADDER.map((r) => (
                  <tr key={r.name}>
                    <td className="mono">{r.pos}</td>
                    <td className="strong">{r.name}</td>
                    <td>
                      <span className={r.tierCls}>{r.tier}</span>
                    </td>
                    <td className="mono" style={{ color: "var(--app-accent)" }}>
                      {r.mmr}
                    </td>
                    <td>
                      <span className="mono">{r.wr}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* the support rail: the division spectrum, a data ledger — not four identical cards */}
        <section
          className="glass tac card reveal"
          aria-labelledby="div-h"
          style={{ flex: "2 1 320px", minWidth: 0, animationDelay: "90ms" }}
        >
          <p className="eyebrow" style={{ marginBottom: 8, color: "var(--app-accent)" }}>
            divisions
          </p>
          <h2 id="div-h" style={{ margin: "0 0 6px", fontSize: "1.3rem" }}>
            The climb to Solar
          </h2>
          {DIVISIONS.map((d, i) => (
            <div
              key={d.name}
              style={{
                padding: "13px 0",
                borderBottom: i < DIVISIONS.length - 1 ? "1px solid var(--os-hairline-soft)" : undefined,
              }}
            >
              <div className="row between" style={{ marginBottom: 4 }}>
                <div className="row" style={{ gap: 8 }}>
                  <span
                    aria-hidden="true"
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 3,
                      flex: "none",
                      background: d.color,
                      border: "1px solid var(--os-hairline-soft)",
                    }}
                  />
                  <h3 style={{ margin: 0, fontSize: "1.02rem" }}>{d.name}</h3>
                </div>
                <span className="mono faint tiny">{d.share}</span>
              </div>
              <div
                aria-hidden="true"
                style={{ height: 4, borderRadius: 3, background: "var(--os-fill)", marginBottom: 8 }}
              >
                <span
                  style={{
                    display: "block",
                    height: "100%",
                    width: d.share,
                    borderRadius: "inherit",
                    background: d.color,
                  }}
                />
              </div>
              <p className="mono tiny" style={{ margin: "0 0 6px", color: d.color }}>
                {d.range}
              </p>
              <p style={{ margin: 0, fontSize: ".9rem", color: "var(--sol-muted)" }}>{d.desc}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

/* ------------------------------- ARSENAL ----------------------------- */

function ArsenalPage({ accent }: { accent: string }) {
  const [filter, setFilter] = useState<"all" | Weapon["cls"]>("all");
  const guns = WEAPONS.filter((w) => filter === "all" || w.cls === filter);
  const featured = guns[0];

  return (
    <div style={accentVars(accent)}>
      <PageSection
        eyebrow="loadouts"
        title="Arsenal"
        description="Six weapons at launch, every stat in the open. The balancer runs Monte Carlo TTK simulations (1,000 rounds per weapon) and keeps time-to-kill inside a ±15% band across classes. Bars are normalized 0–100."
        reveal
      />

      <fieldset
        className="tabs"
        aria-label="Filter weapons by class"
        style={{ margin: "22px 0 26px", minInlineSize: "auto" }}
      >
        {(
          [
            ["all", "All"],
            ["assault", "Assault"],
            ["smr", "SMR"],
            ["lmg", "LMG"],
            ["sniper", "Sniper"],
          ] as Array<[typeof filter, string]>
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            aria-pressed={filter === id}
            onClick={() => {
              setFilter(id);
              toast.success(id === "all" ? "Showing the full arsenal" : `Filtered: ${id}`);
            }}
          >
            {label}
          </button>
        ))}
      </fieldset>

      {/* the dominant spec sheet: the lead weapon under the red light */}
      {featured ? (
        <article
          key={featured.name}
          className="glass glass-hover tac card weapon atmos reveal grain"
          style={{ ...DOMINANT_SURFACE, marginTop: 4 }}
        >
          <div className="row between">
            <h3 style={{ margin: 0, fontSize: "1.15rem" }}>{featured.name}</h3>
            <span
              className={`badge${
                featured.cls === "smr"
                  ? " info"
                  : featured.cls === "lmg"
                    ? " warning"
                    : featured.cls === "sniper"
                      ? " success"
                      : ""
              }`}
            >
              {featured.cls}
            </span>
          </div>
          <p style={{ margin: "8px 0 4px", fontSize: ".92rem" }}>{featured.desc}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14 }}>
            <Stat label="Damage" value={featured.dmg} kind="" />
            <Stat label="Range" value={featured.range} kind="range" />
            <Stat label="Firerate" value={featured.rate} kind="firerate" />
          </div>
        </article>
      ) : null}

      {/* the armory ledger: the rest of the class, one column — not repeated cards */}
      {guns.length > 1 ? (
        <div className="glass card reveal" style={{ marginTop: 18, padding: "6px 22px" }}>
          {guns.slice(1).map((w, i) => (
            <div
              key={w.name}
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 20,
                padding: "14px 0",
                alignItems: "center",
                borderBottom: i < guns.slice(1).length - 1 ? "1px solid var(--os-hairline-soft)" : undefined,
              }}
            >
              <div style={{ flex: "1 1 240px", minWidth: 0 }}>
                <div className="row between">
                  <h3 style={{ margin: 0, fontSize: "1.02rem" }}>{w.name}</h3>
                  <span
                    className={`badge${
                      w.cls === "smr" ? " info" : w.cls === "lmg" ? " warning" : w.cls === "sniper" ? " success" : ""
                    }`}
                  >
                    {w.cls}
                  </span>
                </div>
                <p style={{ margin: "6px 0 0", fontSize: ".88rem", color: "var(--sol-muted)" }}>{w.desc}</p>
              </div>
              <div style={{ flex: "1 1 220px", minWidth: 220 }}>
                <Stat label="Damage" value={w.dmg} kind="" />
                <Stat label="Range" value={w.range} kind="range" />
                <Stat label="Firerate" value={w.rate} kind="firerate" />
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Stat({ label, value, kind }: { label: string; value: number; kind: "" | "range" | "firerate" }) {
  return (
    <div className={`stat ${kind}`}>
      <div className="stat-top">
        <span>{label}</span>
        <span className="mono">{value}</span>
      </div>
      <div className="track">
        <span
          className="fill"
          style={{
            width: `${value}%`,
            background:
              "linear-gradient(90deg, color-mix(in srgb, var(--app-accent) 70%, transparent), var(--app-accent))",
          }}
        />
      </div>
    </div>
  );
}
