/**
 * debonairview.tsx — the audio DAW studio (debonair.devthink.pro)
 * inside the os. Pages: studio (transport + 4-track timeline + mixer),
 * generate (prompt + render queue with queued→rendering→ready
 * transitions), library (takes table with search). Content absorbed from
 * the static debonair site.
 *
 * C2-02 pass: one dominant object per page (violet light source, halftone
 * edge, film grain) over a support rail, editorial ledgers instead of
 * repeated identical cards, the debonair identity accent (apps.ts
 * metadata) on the transport readouts, seeds and active strips, and the
 * one staggered entrance per view switch (reveal.ts, reduced-motion
 * guarded).
 */

import { Play, Square } from "lucide-react";
import { type CSSProperties, useMemo, useState } from "react";
import { toast } from "sonner";
import { AppHeader } from "./appheader";
import { appMeta, PERSONAS } from "./apps";
import { AuraChat } from "./aurachat";
import { pushOSEvent } from "./osevents";
import type { OSHandle } from "./ostypes";
import { PageSection } from "./pagesection";
import { arrayOf, useStoredState } from "./usestoredstate";

export type Render = {
  id: string;
  name: string;
  genre: string;
  duration: string;
  seed: number;
  status: "ready" | "rendering" | "draft" | "queued";
  at: number;
};

const isRender = (v: unknown): v is Render => {
  if (typeof v !== "object" || v === null) return false;
  const r = v as Record<string, unknown>;
  return (
    typeof r.id === "string" &&
    typeof r.name === "string" &&
    typeof r.genre === "string" &&
    typeof r.duration === "string" &&
    typeof r.seed === "number" &&
    (r.status === "ready" || r.status === "rendering" || r.status === "draft" || r.status === "queued") &&
    typeof r.at === "number"
  );
};
const isRenderList = arrayOf(isRender);

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

const GENRES = [
  "Trap",
  "Pop",
  "EDM",
  "Hip-hop",
  "R&B",
  "House",
  "Techno",
  "Ambient",
  "Cinematic",
  "Jazz",
  "Rock",
  "Funk",
  "Reggaeton",
  "Drill",
  "Latin",
];

const SEED_RENDERS: Render[] = [
  { id: "s1", name: "Midnight Tide", genre: "House", duration: "3:42", seed: 104482, status: "ready", at: 0 },
  { id: "s2", name: "Paper Lanterns", genre: "Pop", duration: "3:05", seed: 230917, status: "ready", at: 0 },
  { id: "s3", name: "Static Bloom", genre: "Techno", duration: "4:18", seed: 551903, status: "rendering", at: 0 },
  { id: "s4", name: "Copper Sky", genre: "Cinematic", duration: "2:56", seed: 618870, status: "ready", at: 0 },
  { id: "s5", name: "Velvet Static", genre: "R&B", duration: "3:21", seed: 340119, status: "draft", at: 0 },
  { id: "s6", name: "Drill Sermon", genre: "Drill", duration: "2:47", seed: 972340, status: "ready", at: 0 },
];

const _EQ_BARS = [
  "1.08s",
  "0.86s",
  "1.24s",
  "0.72s",
  "1.02s",
  "0.94s",
  "1.32s",
  "0.80s",
  "1.10s",
  "0.90s",
  "1.18s",
  "0.76s",
  "1.26s",
  "0.98s",
  "1.06s",
  "0.84s",
  "1.22s",
  "0.74s",
  "1.12s",
  "0.92s",
];

const CHANNELS = [
  { name: "Drums", init: -4, meter: 68 },
  { name: "Bass", init: -6, meter: 54 },
  { name: "Keys", init: -9, meter: 40 },
  { name: "Lead", init: -7, meter: 47 },
  { name: "Master", init: -2, meter: 72, master: true },
];

export function DebonairApp({ os }: { os: OSHandle }) {
  const meta = appMeta("debonair");
  if (!meta) throw new Error("the debonair meta is missing from the catalog");
  const [chatOpen, setChatOpen] = useState(true);
  const page = meta.pages.some((p) => p.id === os.view.page) ? os.view.page : "studio";
  const [renders, setRenders] = useStoredState<Render[]>("dt-renders-v1", [], isRenderList);

  return (
    <>
      <AppHeader
        app={meta}
        active={page}
        chatOpen={chatOpen}
        onNavigate={(p) => os.openApp("debonair", p)}
        onHome={os.goGateway}
        onToggleChat={() => setChatOpen((v) => !v)}
        theme={os.settings.theme}
        onToggleTheme={os.toggleTheme}
      />

      <main className="shell">
        <div className={`app-layout${chatOpen ? " with-chat" : ""}`}>
          <div>
            {page === "studio" ? (
              <StudioPage accent={meta.accent} />
            ) : page === "generate" ? (
              <GeneratePage
                accent={meta.accent}
                onQueued={(render) => {
                  setRenders((prev) => [render, ...prev].slice(0, 40));
                }}
              />
            ) : (
              <LibraryPage accent={meta.accent} renders={renders} />
            )}
          </div>
          {chatOpen ? (
            <div className="chat-panel">
              <AuraChat persona={PERSONAS.debonair} storageKey="dt-chat-debonair-v1" appLabel="debonair" />
            </div>
          ) : null}
        </div>
      </main>
    </>
  );
}

/* ------------------------------- STUDIO ------------------------------ */

function StudioPage({ accent }: { accent: string }) {
  const [levels, setLevels] = useState<Record<string, number>>(
    Object.fromEntries(CHANNELS.map((c) => [c.name, c.init])),
  );
  const [playing, setPlaying] = useState(false);

  return (
    <div style={accentVars(accent)}>
      <PageSection
        eyebrow="studio · katexis engine"
        title="Studio"
        description="A visual slice of the DAW: four track groups on the timeline, a mixer with per-channel faders and the transport. Every pixel obeys the sol theme — the audio itself ships with the katexis engine, not with this mock."
        reveal
      />

      <section className="transport" style={{ marginTop: 26 }} aria-label="Transport bar">
        <div className="group">
          <button
            type="button"
            className="btn"
            aria-pressed={playing}
            onClick={() => {
              setPlaying((v) => !v);
              toast(playing ? "Transport stopped" : "Play (visual demo)", {
                description: playing ? "Nothing was playing — mock." : "The katexis engine is not wired to this mock.",
              });
            }}
          >
            {playing ? (
              <Square size={16} strokeWidth={1.8} aria-hidden="true" />
            ) : (
              <Play size={16} strokeWidth={1.8} aria-hidden="true" />
            )}
            {playing ? "Stop" : "Play"}
          </button>
          <button
            type="button"
            className="btn secondary"
            onClick={() => {
              setPlaying(false);
              toast.info("Transport stopped", { description: "Nothing was playing (demo)." });
            }}
          >
            <Square size={16} strokeWidth={1.8} aria-hidden="true" /> Stop
          </button>
        </div>
        <div className="readouts">
          <div className="readout">
            <span className="lbl">BPM</span>
            <span className="val" style={{ color: "var(--app-accent)" }}>
              140
            </span>
          </div>
          <div className="readout">
            <span className="lbl">Key</span>
            <span className="val" style={{ color: "var(--app-accent)" }}>
              C min
            </span>
          </div>
          <div className="readout">
            <span className="lbl">Position</span>
            <span className="val" style={{ color: "var(--app-accent)" }}>
              00:04.12
            </span>
          </div>
          <div className="readout">
            <span className="lbl">Bar</span>
            <span className="val" style={{ color: "var(--app-accent)" }}>
              5.2
            </span>
          </div>
          <div className="readout">
            <span className="lbl">Swing</span>
            <span className="val" style={{ color: "var(--app-accent)" }}>
              12%
            </span>
          </div>
        </div>
      </section>

      {/* the dominant object: the arrangement under the violet light */}
      <section className="daw atmos reveal grain" aria-label="Arrangement timeline" style={DOMINANT_SURFACE}>
        <div className="tl-scroll">
          <div className="tl-inner">
            <div className="tl-ruler" aria-hidden="true">
              <span />
              <div className="lane">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
                <span>6</span>
                <span>7</span>
                <span>8</span>
              </div>
            </div>
            <div className="tl-canvas">
              <TimelineRow
                label="Drums"
                sub="trap groove · swing 12%"
                clips={[
                  ["Intro", 0, 12, "c1"],
                  ["Verse groove", 12, 33, "c1"],
                  ["Fill", 45, 7, "c1"],
                  ["Drop", 52, 33, "c1"],
                  ["Outro", 85, 15, "c1"],
                ]}
              />
              <TimelineRow
                label="Bass"
                sub="808 sub · key C"
                clips={[
                  ["Sub 808", 8, 30, "c2"],
                  ["Walk", 38, 14, "c2"],
                  ["Reese", 52, 34, "c2"],
                ]}
              />
              <TimelineRow
                label="Keys"
                sub="dark pad · C min"
                clips={[
                  ["Pad C min", 0, 30, "c3"],
                  ["Stabs", 30, 22, "c3"],
                  ["Chorus chords", 52, 48, "c3"],
                ]}
              />
              <TimelineRow
                label="Lead"
                sub="motif · call/response"
                clips={[
                  ["Motif A", 18, 27, "c4"],
                  ["Call & response", 52, 32, "c4"],
                ]}
              />
              <div
                className="playhead"
                aria-hidden="true"
                style={{
                  background: "var(--app-accent)",
                  boxShadow: "0 0 10px color-mix(in srgb, var(--app-accent) 75%, transparent)",
                }}
              />
            </div>
          </div>
        </div>

        <div className="mixer">
          {CHANNELS.map((c) => {
            const val = levels[c.name] ?? c.init;
            const pct = ((val + 24) / 24) * 100;
            return (
              <div
                key={c.name}
                className={`strip${c.master ? " master" : ""}`}
                style={c.master ? { borderColor: "var(--app-accent)" } : undefined}
              >
                <h3>{c.name}</h3>
                <div className="meter" role="img" aria-label={`${c.name} level meter at ${Math.round(pct)} percent`}>
                  <i style={{ "--m": `${Math.round(pct)}%` } as React.CSSProperties} />
                </div>
                <input
                  type="range"
                  min={-24}
                  max={0}
                  step={0.5}
                  value={val}
                  aria-label={`${c.name} volume fader`}
                  onChange={(e) => setLevels((prev) => ({ ...prev, [c.name]: Number(e.target.value) }))}
                />
                <p className="db">{val.toFixed(1)} dB</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="glass card" style={{ marginTop: 18, maxWidth: 640 }}>
        <h2 style={{ fontSize: "1.05rem" }}>Demo scope</h2>
        <p style={{ margin: 0 }}>
          Timeline, mixer and transport render in the OS — no AudioContext is created. Generation, playback and export
          arrive with the <code>katexis</code> engine integration (F-DBN-006, F-DBN-014).
        </p>
      </section>
    </div>
  );
}

function TimelineRow({
  label,
  sub,
  clips,
}: {
  label: string;
  sub: string;
  clips: Array<[string, number, number, string]>;
}) {
  return (
    <div className="tl-row">
      <div className="tl-label">
        <b>{label}</b>
        <small>{sub}</small>
      </div>
      <div className="tl-lane">
        {clips.map(([name, left, width, cls]) => (
          <span key={name} className={`clip ${cls}`} style={{ left: `${left}%`, width: `${width}%` }}>
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------ GENERATE ----------------------------- */

function GeneratePage({ accent, onQueued }: { accent: string; onQueued: (r: Render) => void }) {
  const [prompt, setPrompt] = useState("");
  const [genre, setGenre] = useState("Techno");
  const [jobs, setJobs] = useState<Render[]>([]);

  function queue() {
    const text = prompt.trim();
    if (!text) {
      toast.error("Describe the track first", { description: "Even three words help the katexis engine." });
      return;
    }
    const seed = Math.floor(100000 + Math.random() * 900000);
    const name =
      text
        .split(/\s+/)
        .slice(0, 4)
        .join(" ")
        .replace(/[.,;:!?]+$/, "")
        .replace(/^./, (c) => c.toUpperCase()) || "Untitled";
    const dur = `${2 + Math.floor(Math.random() * 2)}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`;
    const job: Render = { id: `r-${Date.now()}`, name, genre, duration: dur, seed, status: "queued", at: Date.now() };

    setJobs((prev) => [job, ...prev]);
    onQueued(job);
    pushOSEvent({
      title: "Render queued — debonair",
      note: `${job.name} · ${job.genre} · seed ${job.seed}`,
      kind: "action",
    });
    toast.success(`Render queued — seed ${seed}`);

    window.setTimeout(() => {
      setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status: "rendering" } : j)));
      onQueued({ ...job, status: "rendering" });
    }, 1300);
    window.setTimeout(() => {
      setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status: "ready" } : j)));
      onQueued({ ...job, status: "ready" });
      toast.success(`${name} is ready`, { description: "48 kHz WAV sent to the Library." });
    }, 4600);
  }

  return (
    <div style={accentVars(accent)}>
      <PageSection
        eyebrow="generate · text-to-music"
        title="Generate"
        description={
          <>
            Text-to-music, the debonair way: parse the prompt, map the mood, choose key and BPM, plan the structure
            (F-DBN-023..025). This page runs the flow with a <strong className="strong">simulated render</strong> — the
            queue is persisted in your device, no audio leaves the browser.
          </>
        }
        reveal
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 18, alignItems: "start", marginTop: 26 }}>
        {/* the dominant object: the prompt desk under the violet light */}
        <section
          className="glass card atmos reveal grain"
          aria-labelledby="form-h"
          style={{ ...DOMINANT_SURFACE, flex: "3 1 380px", minWidth: 0 }}
        >
          <h2 id="form-h" style={{ fontSize: "1.05rem" }}>
            New render
          </h2>
          <div className="field">
            <label htmlFor="gen-prompt">Prompt</label>
            <textarea
              id="gen-prompt"
              className="input"
              rows={3}
              maxLength={280}
              placeholder="e.g. Late-night trap, C minor, 140 BPM, dark 808s and airy pads"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <p className="hint">One line is enough — genre, mood, key or a scene. 280 characters max.</p>
          </div>
          <div className="field">
            <label htmlFor="gen-genre">Genre</label>
            <select id="gen-genre" className="input" value={genre} onChange={(e) => setGenre(e.target.value)}>
              {GENRES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <p className="hint">
              15 genres from <code>GENRE_CONFIG</code> — each with its own BPM, scales and drum style.
            </p>
          </div>
          <button type="button" className="btn" onClick={queue}>
            Queue render
          </button>
        </section>

        {/* the support rail: the render queue as an editorial ledger */}
        <section
          className="reveal"
          aria-labelledby="queue-h"
          style={{ flex: "2 1 320px", minWidth: 0, animationDelay: "90ms" }}
        >
          <h2 id="queue-h" className="eyebrow" style={{ marginBottom: 14, color: "var(--app-accent)" }}>
            render queue
          </h2>
          {jobs.length === 0 ? (
            <div className="glass card">
              <p style={{ margin: 0, fontSize: ".9rem" }}>
                Nothing queued yet. Your renders will appear here with seed, duration and status — queued, rendering,
                ready.
              </p>
            </div>
          ) : (
            <div className="glass card" style={{ padding: "4px 18px" }}>
              {jobs.map((j, i) => (
                <article
                  key={j.id}
                  className={`job${j.status === "rendering" ? " is-rendering" : ""}`}
                  style={{
                    margin: 0,
                    padding: "13px 0",
                    borderBottom: i < jobs.length - 1 ? "1px solid var(--os-hairline-soft)" : undefined,
                  }}
                >
                  <div className="job-head">
                    <div>
                      <span className="job-name">{j.name}</span> <span className="badge">{j.genre}</span>
                    </div>
                    <StatusBadge status={j.status} />
                  </div>
                  {j.status !== "ready" ? (
                    <div className="progress" aria-hidden="true">
                      <i />
                    </div>
                  ) : null}
                  {j.status === "ready" ? (
                    <p className="job-meta">
                      <span className="mono" style={{ color: "var(--app-accent)" }}>
                        seed {j.seed}
                      </span>{" "}
                      · {j.duration} · 48 kHz WAV
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="glass card" style={{ marginTop: 18, maxWidth: 640 }}>
        <h2 style={{ fontSize: "1.05rem" }}>Demo scope</h2>
        <p style={{ margin: 0 }}>
          The queue is client-side: jobs persist on the device and the status transitions are timers. The real pipeline
          — plan inspection, quality checks, LUFS mastering and WAV export — ships with the <code>katexis</code> engine.
        </p>
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: Render["status"] }) {
  if (status === "ready") return <span className="badge success">ready</span>;
  if (status === "rendering")
    return (
      <span className="badge warning">
        <span className="dot" aria-hidden="true" /> rendering
      </span>
    );
  if (status === "queued") return <span className="badge info">queued</span>;
  return <span className="badge info">draft</span>;
}

/* ------------------------------ LIBRARY ------------------------------ */

function LibraryPage({ accent, renders }: { accent: string; renders: Render[] }) {
  const [query, setQuery] = useState("");

  const all = useMemo<Render[]>(() => [...renders, ...SEED_RENDERS], [renders]);
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (r) => r.name.toLowerCase().includes(q) || r.genre.toLowerCase().includes(q) || r.status.includes(q),
    );
  }, [all, query]);

  return (
    <div style={accentVars(accent)}>
      <PageSection
        eyebrow="library · your renders"
        title="Library"
        description="Every take lands here with its genre, duration and render status — renders queued in Generate enter at the top, persisted on the device."
        reveal
      />

      <div className="field" style={{ maxWidth: 380, marginTop: 26 }}>
        <label htmlFor="lib-search">Search</label>
        <input
          id="lib-search"
          className="input"
          type="search"
          placeholder="Filter by name, genre or status…"
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* the dominant object: the takes ledger under the violet light */}
      <section
        className="glass card atmos reveal grain"
        style={{ ...DOMINANT_SURFACE, marginTop: 16, padding: 10 }}
        aria-label="Takes ledger"
      >
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Track</th>
                <th scope="col">Genre</th>
                <th scope="col">Duration</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="strong">{r.name}</td>
                  <td>{r.genre}</td>
                  <td className="mono" style={{ color: "var(--app-accent)" }}>
                    {r.duration}
                  </td>
                  <td>
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 ? (
          <p style={{ margin: "8px 6px 6px", color: "var(--sol-muted)" }}>
            No tracks match “{query}” — try a genre or a status.
          </p>
        ) : null}
      </section>

      <section className="glass card" style={{ marginTop: 18, maxWidth: 640 }}>
        <h2 style={{ fontSize: "1.05rem" }}>Formats</h2>
        <p style={{ margin: 0 }}>
          Ready tracks keep their master at 48 kHz WAV with −1 dBTP true peak. MIDI and stems export per take once the{" "}
          <code>katexis</code> engine is wired to this app (F-DBN-013, F-DBN-040).
        </p>
      </section>
    </div>
  );
}
