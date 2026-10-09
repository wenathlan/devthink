/**
 * devthinkview.tsx — the platform view (devthink.pro) inside the os.
 * Pages: projects (grid + create modal + filters), history (the os event
 * feed timeline), docs (reader with a topic sidebar), explore (showcase
 * of the sibling surfaces + skills), settings (theme, motion, profile,
 * integrations, clean-url demo), chat (the dedicated Aura chat). Content
 * absorbed from the repository README and ARCHITECTURE.
 */

import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppHeader } from "./appheader";
import { APPS, appMeta, PERSONAS } from "./apps";
import { AuraChat } from "./aurachat";
import { Modal } from "./modal";
import { clearOSEvents, pushOSEvent, useOSEvents } from "./osevents";
import type { OSHandle } from "./ostypes";
import { PageSection } from "./pagesection";
import { StatusDot } from "./statusdot";
import { UrlCleanerDemo } from "./urlcleanerdemo";
import { arrayOf, useStoredState, type Validator } from "./usestoredstate";

/* ------------------------------- PROJECTS ------------------------------ */

export type ProjectStatus = "active" | "paused" | "done" | "draft";

export type Project = {
  id: string;
  name: string;
  desc: string;
  status: ProjectStatus;
  tag: string;
  at: number;
};

const isProject: Validator<Project> = (v): v is Project => {
  if (typeof v !== "object" || v === null) return false;
  const p = v as Record<string, unknown>;
  return (
    typeof p.id === "string" &&
    typeof p.name === "string" &&
    typeof p.desc === "string" &&
    (p.status === "active" || p.status === "paused" || p.status === "done" || p.status === "draft") &&
    typeof p.tag === "string" &&
    typeof p.at === "number"
  );
};
const isProjectList = arrayOf(isProject);

const STATUS_LABEL: Record<ProjectStatus, string> = {
  active: "active",
  paused: "paused",
  done: "done",
  draft: "draft",
};

const STATUS_TONE: Record<ProjectStatus, "success" | "warning" | "info" | "default"> = {
  active: "success",
  paused: "warning",
  done: "info",
  draft: "default",
};

const SEED_PROJECTS: Project[] = [
  {
    id: "s1",
    name: "Gateway v2.0.40",
    desc: "Provider normalization + SSE on loopback; devthink model → glm-5.3.",
    status: "active",
    tag: "gateway",
    at: 0,
  },
  {
    id: "s2",
    name: "CLI · 20 modes",
    desc: "Streaming chat, provider/model discovery, local sessions and memory.",
    status: "active",
    tag: "cli",
    at: 0,
  },
  {
    id: "s3",
    name: "Sandbox engine",
    desc: "Execution isolation with MCP approval gates and a consent-first extension.",
    status: "paused",
    tag: "engine",
    at: 0,
  },
  {
    id: "s4",
    name: "Static workbench",
    desc: "Static React with workspace/session/tab/section routes and one-time pairing.",
    status: "done",
    tag: "web",
    at: 0,
  },
  {
    id: "s5",
    name: "@wenathlan/devthink",
    desc: "Frozen protocolv2 contract — npm library exports.",
    status: "done",
    tag: "lib",
    at: 0,
  },
  {
    id: "s6",
    name: "Argan hung model",
    desc: "Wildcard on the devthink.pro apex — vhost by Host, pipeline-only.",
    status: "draft",
    tag: "dns",
    at: 0,
  },
];

const PH_CLASSES = ["ph-1", "ph-2", "ph-3", "ph-4", "ph-5", "ph-6"];

/* --------------------------------- DOCS -------------------------------- */

type DocBlock = { key: string; h?: string; p?: string[]; code?: string; list?: string[] };
type DocTopic = { id: string; title: string; kicker: string; blocks: DocBlock[] };

/**
 * the docs content: every block gets a stable id derived from its topic
 * and position at module load, so the reader never keys by array index.
 */
const DOC_TOPICS: DocTopic[] = [
  {
    id: "overview",
    title: "Overview",
    kicker: "platform · provider-neutral",
    blocks: [
      {
        p: [
          "DevThink is a provider-neutral AI workbench: a terminal CLI, an embedded local gateway and a static web workbench — all inside a single product boundary. The public code lives in the wenathlan/devthink repository.",
        ],
      },
      {
        h: "Security boundary",
        p: [
          "DevThink uses official provider APIs and explicitly user-supplied credentials. It does not capture browser cookies, does not solve CAPTCHAs, does not automate browser authentication and does not bypass anti-bot controls.",
        ],
      },
      {
        h: "Surfaces",
        list: [
          "CLI — streaming chat, discovery, 20 modes, local sessions and memory.",
          "Local gateway — HTTP/SSE on loopback: health, models, normalized chat.",
          "Provider layer — OpenAI-compatible, Anthropic Messages, Google Generate Content.",
          "Workbench — static React app with one-time pairing.",
          "MCP — tools with consent metadata and approval gates.",
        ],
      },
    ],
  },
  {
    id: "cli",
    title: "CLI",
    kicker: "terminal · 20 modes",
    blocks: [
      {
        p: [
          "The CLI is the front door: streaming chat, provider and model discovery, 20 named operational modes, locally persisted sessions and memory, and credential-free pairing for the workbench.",
        ],
        code: `devthink init\ndevthink chat --provider zai --model glm-5 --prompt "..."\ndevthink providers\ndevthink models --provider <id>\ndevthink modes\ndevthink auth login <provider> --token <credential>\ndevthink sessions list\ndevthink serve\ndevthink interactive`,
      },
      {
        h: "Local state",
        p: [
          "Atomic JSON records + a SQLite mirror under ~/.config/devthink/. Secret-free preferences in devthink.json; official credentials in auth.json (mode 0600). Keys never reach logs or exports.",
        ],
      },
      {
        h: "Provider selection",
        p: [
          "Explicit selection: --provider or the configured provider — no silent rotation between accounts. Fallback only through a user-written ordered list. A provider can be health-checked without sending a prompt.",
        ],
      },
    ],
  },
  {
    id: "gateway",
    title: "Gateway",
    kicker: "loopback · http + sse",
    blocks: [
      {
        p: [
          "The local gateway listens on the loopback interface only (127.0.0.1). Without a configured port it picks a random candidate inside the documented range. It exposes /health, /models and /chat — no filesystem is exposed by default.",
        ],
      },
      {
        h: "Inside the DevThink OS",
        p: [
          "The OS talks to the gateway through POST /v1/chat/completions (OpenAI contract) with the devthink model — that is what feeds the Aura in each app of this family. Responses may carry reasoning_content, displayed as Internal Cognition.",
        ],
        code: `POST /v1/chat/completions\n{ "model": "devthink", "messages": [...] }`,
      },
      {
        h: "Provider endpoints",
        p: [
          "There is no separate proxy module: a provider-specific endpoint goes into providers.<id>.baseUrl in the user's devthink.json. Supported families: OpenAI-compatible (Z.AI, Qwen, DeepSeek, Groq…), Anthropic Messages and Google Gemini — all with streaming.",
        ],
      },
    ],
  },
  {
    id: "sandbox",
    title: "Sandbox engine",
    kicker: "isolation · consent-first",
    blocks: [
      {
        p: [
          "The sandbox engine runs OS actions inside a controlled perimeter: every sensitive action passes approval gates before touching the host, and the result is auditable.",
        ],
      },
      {
        h: "Approval gates",
        list: [
          "MCP — tools with consent metadata and explicit approval gates.",
          "Extension — consent-first background: request router, workflow segments and capability gates frozen by the capmanifest.",
          "Pagebridge — the only injected content script: frames page content keys under an explicit consent flag and audit kind.",
        ],
      },
      {
        h: "Persistence",
        p: [
          "Workspaces, sessions, tabs and messages live in the local SQLite; memory resolves in the order session → project → global. External memory is never contacted automatically.",
        ],
      },
    ],
  },
  {
    id: "products",
    title: "Product family",
    kicker: "4 apps · one gateway",
    blocks: [
      {
        p: [
          "The devthink.pro platform is home to four sibling apps — all run on the same gateway and share this OS's sol theme.",
        ],
      },
      {
        h: "The apps",
        list: [
          "argan (argan.devthink.pro) — DNS and gateway library: zones, ED25519 DNSSEC, GNS/PKARR and the hung model on the apex.",
          "debonair (debonair.devthink.pro) — audio DAW on the katexis engine: prompt-to-arrangement and broadcast-ready mastering.",
          "cadria (cadria.devthink.pro) — player, editor and studio for video/image/3D on the versawase engine.",
          "stealthhead (stealthhead.devthink.pro) — FPS platform: 5v5 matchmaking, ladders and an arsenal balanced by Monte Carlo TTK.",
        ],
      },
      {
        h: "Explore",
        p: ["Use this app's Explore page to step straight into any of them."],
      },
    ],
  },
  {
    id: "install",
    title: "Install",
    kicker: "npm · bun · binaries",
    blocks: [
      {
        p: [
          "Install globally through npm or run it directly with Bun — self-contained builds for Linux, macOS and Windows.",
        ],
        code: `npm install --global @wenathlan/devthink\ndevthink init\ndevthink --help\n\n# or via bun\nbun install\nbun run devthink.ts init`,
      },
      {
        h: "First chat",
        code: `devthink auth login zai --token "$ZAI_API_KEY" --kind api-key\ndevthink config activeModel glm-5\ndevthink chat --prompt "Summarize this repository in three points."`,
      },
      {
        h: "Typed documentation",
        p: [
          "The docs/ directory carries category.ts.md collections — auth, providers, gateway, storage and web — as TypeScript contracts with JSDoc: bounded retry, error redaction, exact origin matching and base path normalization.",
        ],
      },
    ],
  },
].map((topic, topicIndex) => ({
  ...topic,
  blocks: topic.blocks.map((block, blockIndex) => ({ ...block, key: `${topicIndex}-${blockIndex}` })),
}));

/* -------------------------------- APP ---------------------------------- */

export function DevThinkApp({ os }: { os: OSHandle }) {
  const meta = appMeta("devthink");
  if (!meta) throw new Error("the devthink meta is missing from the catalog");
  const [chatOpen, setChatOpen] = useState(false);
  const page = meta.pages.some((p) => p.id === os.view.page) ? os.view.page : "projects";
  const [projects, setProjects] = useStoredState<Project[]>("dt-projects-v1", [], isProjectList);

  return (
    <>
      <AppHeader
        app={meta}
        active={page}
        chatOpen={chatOpen}
        onNavigate={(p) => os.openApp("devthink", p)}
        onHome={os.goGateway}
        onToggleChat={() => setChatOpen((v) => !v)}
        theme={os.settings.theme}
        onToggleTheme={os.toggleTheme}
      />

      <main className="shell">
        {page === "aura" ? (
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <PageSection
              eyebrow="chat · devthink.pro gateway"
              title="Chat"
              description="The gateway's intelligence, dedicated: ask about the platform, the engines or any app in the family."
              reveal
            />
            <div
              className="chat-panel"
              style={{ width: "100%", maxWidth: 860, margin: "22px auto 0", height: "min(68vh, 620px)" }}
            >
              <AuraChat persona={PERSONAS.devthink} storageKey="dt-chat-devthink-v1" appLabel="devthink" />
            </div>
          </div>
        ) : (
          <div className={`app-layout${chatOpen ? " with-chat" : ""}`} style={{ marginTop: 26 }}>
            <div>
              {page === "projects" ? (
                <ProjectsPage
                  projects={projects}
                  onCreate={(p) => setProjects((prev) => [p, ...prev])}
                  onDelete={(id) => setProjects((prev) => prev.filter((p) => p.id !== id))}
                />
              ) : page === "history" ? (
                <HistoryPage />
              ) : page === "docs" ? (
                <DocsPage />
              ) : page === "explore" ? (
                <ExplorePage os={os} />
              ) : (
                <SettingsPage os={os} />
              )}
            </div>
            {chatOpen ? (
              <div className="chat-panel">
                <AuraChat persona={PERSONAS.devthink} storageKey="dt-chat-devthink-v1" appLabel="devthink" />
              </div>
            ) : null}
          </div>
        )}
      </main>
    </>
  );
}

/* ------------------------------ PROJECTS ------------------------------- */

function ProjectsPage({
  projects,
  onCreate,
  onDelete,
}: {
  projects: Project[];
  onCreate: (p: Project) => void;
  onDelete: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | ProjectStatus>("all");
  const [open, setOpen] = useState(false);

  const all = useMemo<Project[]>(() => [...projects, ...SEED_PROJECTS], [projects]);
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter(
      (p) =>
        (status === "all" || p.status === status) &&
        (!q || p.name.toLowerCase().includes(q) || p.tag.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)),
    );
  }, [all, query, status]);

  return (
    <>
      <PageSection
        eyebrow="devthink.pro · platform"
        title="Projects"
        description="The provider-neutral workbench in one place: device-persisted local projects with status, tag and search. Creating here pushes an event into the OS History."
        reveal
      />

      <div
        className="row between"
        style={{ marginTop: 26, marginBottom: 16 }}
        role="toolbar"
        aria-label="Project filters"
      >
        <div className="tabs" role="tablist" aria-label="Filter by status">
          {(["all", "active", "paused", "done", "draft"] as const).map((s) => (
            <button key={s} type="button" role="tab" aria-selected={status === s} onClick={() => setStatus(s)}>
              {s === "all" ? "all" : STATUS_LABEL[s]}
            </button>
          ))}
        </div>
        <div className="row" style={{ gap: 10 }}>
          <input
            className="input"
            type="search"
            style={{ minWidth: 200, width: "auto" }}
            placeholder="Search project, tag…"
            aria-label="Search projects"
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="button" className="btn" onClick={() => setOpen(true)}>
            <Plus size={16} strokeWidth={1.8} aria-hidden="true" /> New project
          </button>
        </div>
      </div>

      <div className="grid cols-3" style={{ alignItems: "stretch" }}>
        {rows.map((p, i) => (
          <article key={p.id} className="glass glass-hover card proj reveal in">
            <div className={`ph ${PH_CLASSES[i % PH_CLASSES.length]}`} aria-hidden="true" />
            <div style={{ padding: 16 }}>
              <div className="row between" style={{ marginBottom: 8 }}>
                <h3 style={{ margin: 0, fontSize: "1.02rem" }}>{p.name}</h3>
                <StatusDot label={STATUS_LABEL[p.status]} tone={STATUS_TONE[p.status]} pulse={p.status === "active"} />
              </div>
              <p style={{ margin: "0 0 12px", fontSize: ".9rem", color: "var(--sol-muted)" }}>{p.desc}</p>
              <div className="row between">
                <span className="badge">{p.tag}</span>
                {projects.some((u) => u.id === p.id) ? (
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label={`Remove project ${p.name}`}
                    title="Remove project"
                    onClick={() => {
                      onDelete(p.id);
                      pushOSEvent({ title: "Project removed — devthink", note: p.name, kind: "action" });
                      toast("Project removed", { description: `${p.name} left this device.` });
                    }}
                  >
                    <Trash2 size={16} strokeWidth={1.8} />
                  </button>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
      {rows.length === 0 ? (
        <div className="glass card" style={{ marginTop: 16 }}>
          <p style={{ margin: 0, color: "var(--sol-muted)" }}>
            No project matching “{query}”{status !== "all" ? ` in ${STATUS_LABEL[status]}` : ""} — adjust the filters.
          </p>
        </div>
      ) : null}

      <NewProjectModal
        open={open}
        onOpenChange={setOpen}
        onCreate={(p) => {
          onCreate(p);
          pushOSEvent({ title: "Project created — devthink", note: `${p.name} · ${p.tag}`, kind: "action" });
          toast.success(`Project “${p.name}” created`, {
            description: `status ${STATUS_LABEL[p.status]} · tag ${p.tag}`,
          });
        }}
      />
    </>
  );
}

function NewProjectModal({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (p: Project) => void;
}) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [tag, setTag] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("draft");

  function submit() {
    const n = name.trim();
    if (!n) {
      toast.error("Name required", { description: "Give the project a short name — everything else is optional." });
      return;
    }
    onCreate({
      id: `p-${Date.now()}`,
      name: n,
      desc: desc.trim() || "No description yet — edit it whenever you like.",
      tag: tag.trim() || "general",
      status,
      at: Date.now(),
    });
    setName("");
    setDesc("");
    setTag("");
    setStatus("draft");
    onOpenChange(false);
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="New project"
      description="The project persists on this device — nothing leaves the browser."
    >
      <div style={{ marginTop: 14 }}>
        <div className="field">
          <label htmlFor="np-name">Name</label>
          <input
            id="np-name"
            className="input"
            value={name}
            maxLength={60}
            autoComplete="off"
            placeholder="e.g. Gateway normalizer"
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="np-desc">Description</label>
          <textarea
            id="np-desc"
            className="input"
            rows={3}
            maxLength={200}
            value={desc}
            placeholder="One line is enough."
            onChange={(e) => setDesc(e.target.value)}
          />
        </div>
        <div className="row" style={{ alignItems: "flex-start" }}>
          <div className="field" style={{ flex: "1 1 140px" }}>
            <label htmlFor="np-tag">Tag</label>
            <input
              id="np-tag"
              className="input"
              value={tag}
              maxLength={20}
              placeholder="gateway · cli · web"
              onChange={(e) => setTag(e.target.value)}
            />
          </div>
          <div className="field" style={{ flex: "1 1 160px" }}>
            <label htmlFor="np-status">Status</label>
            <select
              id="np-status"
              className="input"
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
            >
              {(["draft", "active", "paused", "done"] as const).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="dlg-actions">
          <button type="button" className="btn secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </button>
          <button type="button" className="btn" onClick={submit}>
            Create project
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ------------------------------- HISTORY ------------------------------- */

const SEED_EVENTS = [
  {
    id: "se1",
    title: "gateway v2.0.40",
    note: "devthink model → glm-5.3; SSE stabilized on loopback.",
    kind: "release" as const,
    at: 1755200000000,
  },
  {
    id: "se2",
    title: "protocolv2 frozen",
    note: "@wenathlan/devthink exports locked by api freeze.",
    kind: "release" as const,
    at: 1755000000000,
  },
  {
    id: "se3",
    title: "MCP approval gates",
    note: "Tool catalog published with consent metadata.",
    kind: "action" as const,
    at: 1754700000000,
  },
];

function fmtWhen(at: number): string {
  try {
    return new Date(at).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

const KIND_TONE: Record<string, "success" | "warning" | "info" | "default"> = {
  release: "success",
  action: "info",
  chat: "warning",
};

function HistoryPage() {
  const live = useOSEvents();
  const [kind, setKind] = useState<"all" | "release" | "action" | "chat">("all");
  const [query, setQuery] = useState("");

  const events = useMemo(() => {
    const merged = [...live, ...SEED_EVENTS].sort((a, b) => b.at - a.at);
    const q = query.trim().toLowerCase();
    return merged.filter(
      (e) =>
        (kind === "all" || e.kind === kind) &&
        (!q || e.title.toLowerCase().includes(q) || e.note.toLowerCase().includes(q)),
    );
  }, [live, kind, query]);

  return (
    <>
      <PageSection
        eyebrow="devthink.pro · OS feed"
        title="History"
        description="Timeline of everything that happens in the OS — renders, projects created, Aura chats and gateway releases. Sibling app actions arrive here in real time."
        reveal
      />

      <div
        className="row between"
        style={{ marginTop: 26, marginBottom: 18 }}
        role="toolbar"
        aria-label="Timeline filters"
      >
        <div className="tabs" role="tablist" aria-label="Filter by event type">
          {(["all", "release", "action", "chat"] as const).map((k) => (
            <button key={k} type="button" role="tab" aria-selected={kind === k} onClick={() => setKind(k)}>
              {k === "all" ? "all" : k}
            </button>
          ))}
        </div>
        <div className="row" style={{ gap: 10 }}>
          <input
            className="input"
            type="search"
            style={{ minWidth: 200, width: "auto" }}
            placeholder="Search an event…"
            aria-label="Search events"
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="button"
            className="btn secondary"
            onClick={() => {
              clearOSEvents();
              toast("Feed cleared", { description: "Local events deleted — release seeds remain." });
            }}
          >
            <Trash2 size={15} strokeWidth={1.8} aria-hidden="true" /> Clear feed
          </button>
        </div>
      </div>

      <section
        className="glass card reveal in"
        aria-label="OS event timeline"
        style={{ maxHeight: "36rem", overflowY: "auto" }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {events.map((e) => (
            <div key={e.id} className={`release${e.kind === "release" ? "" : " user"}`}>
              <div className="row between">
                <h3>{e.title}</h3>
                <StatusDot label={e.kind} tone={KIND_TONE[e.kind]} pulse={false} />
              </div>
              <time>{fmtWhen(e.at)}</time>
              <p>{e.note}</p>
            </div>
          ))}
          {events.length === 0 ? (
            <p style={{ margin: 0, color: "var(--sol-muted)" }}>
              Nothing here yet — create a project, render in debonair or talk to the Aura.
            </p>
          ) : null}
        </div>
      </section>
    </>
  );
}

/* -------------------------------- DOCS --------------------------------- */

function DocsPage() {
  const [active, setActive] = useState(DOC_TOPICS[0].id);
  const idx = Math.max(
    0,
    DOC_TOPICS.findIndex((t) => t.id === active),
  );
  const topic = DOC_TOPICS[idx] ?? DOC_TOPICS[0];

  return (
    <>
      <PageSection
        eyebrow="devthink.pro · docs"
        title="Docs"
        description="The DevThink essentials in six short topics — absorbed from the public repository's README and ARCHITECTURE."
        reveal
      />

      <div className="docs-layout" style={{ marginTop: 26 }}>
        <nav
          className="glass card"
          style={{ padding: 10, display: "flex", flexDirection: "column", gap: 4 }}
          aria-label="Documentation topics"
        >
          {DOC_TOPICS.map((t, i) => (
            <button
              key={t.id}
              type="button"
              className="doc-btn"
              aria-current={t.id === active ? "true" : undefined}
              onClick={() => setActive(t.id)}
            >
              <span style={{ opacity: 0.6, marginRight: 8 }} className="mono">
                {String(i + 1).padStart(2, "0")}
              </span>
              {t.title}
            </button>
          ))}
        </nav>

        <article
          className="glass card reveal in"
          aria-labelledby="doc-title"
          style={{ maxHeight: "40rem", overflowY: "auto" }}
        >
          <p className="eyebrow" style={{ marginBottom: 8 }}>
            {topic.kicker}
          </p>
          <h2 id="doc-title" style={{ fontSize: "1.6rem", margin: "0 0 18px" }}>
            {topic.title}
          </h2>
          {topic.blocks.map((b) => (
            <section key={b.key} style={{ marginBottom: 20 }}>
              {b.h ? <h3 style={{ fontSize: "1.02rem", margin: "0 0 8px" }}>{b.h}</h3> : null}
              {b.p?.map((par) => (
                <p key={par.slice(0, 48)} style={{ margin: "0 0 10px", color: "var(--sol-muted)", fontSize: ".95rem" }}>
                  {par}
                </p>
              ))}
              {b.list ? (
                <ul className="rules" style={{ margin: "0 0 10px" }}>
                  {b.list.map((li) => (
                    <li key={li}>{li}</li>
                  ))}
                </ul>
              ) : null}
              {b.code ? (
                <pre
                  className="mono"
                  style={{
                    margin: "0 0 10px",
                    padding: "14px 16px",
                    overflowX: "auto",
                    fontSize: ".82rem",
                    lineHeight: 1.6,
                  }}
                >
                  {b.code}
                </pre>
              ) : null}
            </section>
          ))}

          <div className="row between" style={{ borderTop: "1px solid var(--sol-line)", paddingTop: 14 }}>
            <button
              type="button"
              className="btn secondary small"
              disabled={idx === 0}
              onClick={() => setActive(DOC_TOPICS[Math.max(0, idx - 1)].id)}
            >
              <ChevronLeft size={15} strokeWidth={1.8} aria-hidden="true" /> Previous
            </button>
            <span className="tiny faint mono">
              {idx + 1} / {DOC_TOPICS.length}
            </span>
            <button
              type="button"
              className="btn secondary small"
              disabled={idx >= DOC_TOPICS.length - 1}
              onClick={() => setActive(DOC_TOPICS[Math.min(DOC_TOPICS.length - 1, idx + 1)].id)}
            >
              Next <ChevronRight size={15} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </div>
        </article>
      </div>
    </>
  );
}

/* ------------------------------- EXPLORE ------------------------------- */

const SKILLS = [
  "CLI · 20 modes",
  "SSE streaming",
  "loopback gateway",
  "provider-neutral",
  "MCP approval gates",
  "consent-first extension",
  "audited pagebridge",
  "protocolv2 frozen",
  "katexis · audio",
  "versawase · video/3d",
  "argan · DNSSEC",
  "one-time pairing",
];

function ExplorePage({ os }: { os: OSHandle }) {
  const siblings = APPS.filter((a) => a.id !== "devthink");
  return (
    <>
      <PageSection
        eyebrow="devthink.pro · explore"
        title="Explore"
        description="The four apps of the devthink.pro family — each with its own domain, engine and pages inside the same OS. Enter any of them without leaving the gateway."
        reveal
      />

      <div className="grid cols-2" style={{ marginTop: 26 }}>
        {siblings.map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.id}
              type="button"
              className="glass glass-hover card app-card reveal in"
              onClick={() => os.openApp(a.id, a.pages[0]?.id ?? "home")}
              aria-label={`Open ${a.name} — ${a.domain}`}
            >
              <div className="app-top">
                <span className="feat-ico" aria-hidden="true">
                  <Icon size={22} strokeWidth={1.8} />
                </span>
                <span className="badge">{a.tag}</span>
              </div>
              <h3 style={{ marginTop: 14 }}>{a.name}</h3>
              <span className="domain">{a.domain}</span>
              <p>{a.desc}</p>
              <span className="go">
                open {a.pages.map((p) => p.label.toLowerCase()).join(" · ")}{" "}
                <ChevronRight size={15} strokeWidth={1.8} aria-hidden="true" />
              </span>
            </button>
          );
        })}
      </div>

      <section className="glass card reveal in" style={{ marginTop: 20 }} aria-labelledby="skills-h">
        <h2 id="skills-h" style={{ fontSize: "1.05rem", marginBottom: 6 }}>
          Platform skills
        </h2>
        <p className="small" style={{ marginTop: 0, marginBottom: 14 }}>
          Cross-cutting capabilities — every app in the family inherits the same gateway, the same sol theme and the
          same Aura.
        </p>
        <ul className="chips" style={{ margin: 0 }} aria-label="Platform skills">
          {SKILLS.map((s) => (
            <li key={s} className="badge" style={{ padding: "7px 13px" }}>
              {s}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

/* ------------------------------ SETTINGS ------------------------------- */

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} aria-label={label} />
      <span className="track" aria-hidden="true" />
    </label>
  );
}

function SettingsPage({ os }: { os: OSHandle }) {
  const { settings, updateSettings, toggleTheme } = os;
  const [stream, setStream] = useStoredState<boolean>(
    "dt-integration-stream-v1",
    true,
    (v): v is boolean => typeof v === "boolean",
  );

  return (
    <>
      <PageSection
        eyebrow="devthink.pro · settings"
        title="Settings"
        description="Device-persisted OS preferences: theme, motion, Aura cognition, profile and integrations — plus the clean-url module demo."
        reveal
      />

      <div className="grid cols-2" style={{ marginTop: 26, alignItems: "start" }}>
        <section className="glass card reveal in" aria-labelledby="set-theme-h">
          <h2 id="set-theme-h" style={{ fontSize: "1.05rem", marginBottom: 4 }}>
            Appearance &amp; motion
          </h2>
          <div className="setting-row">
            <div>
              <p className="s-title">Solar theme</p>
              <p className="s-desc">#0B0806 · #F59E0B · #FFFBEB — 35px liquid glass.</p>
            </div>
            <Toggle checked={settings.theme === "dark"} onChange={toggleTheme} label="Toggle the solar/light theme" />
          </div>
          <div className="setting-row">
            <div>
              <p className="s-title">Reduce motion</p>
              <p className="s-desc">Calm transitions (120–250ms) and reveal without animation.</p>
            </div>
            <Toggle
              checked={settings.reduceMotion}
              onChange={(v) => updateSettings({ reduceMotion: v })}
              label="Toggle reduce motion"
            />
          </div>
          <div className="setting-row">
            <div>
              <p className="s-title">Aura internal cognition</p>
              <p className="s-desc">Show the collapsible reasoning_content inside responses.</p>
            </div>
            <Toggle
              checked={settings.showCognition}
              onChange={(v) => updateSettings({ showCognition: v })}
              label="Toggle internal cognition"
            />
          </div>
        </section>

        <section className="glass card reveal in" aria-labelledby="set-profile-h">
          <h2 id="set-profile-h" style={{ fontSize: "1.05rem", marginBottom: 14 }}>
            Profile
          </h2>
          <div className="field">
            <label htmlFor="set-profile-name">Operator name</label>
            <input
              id="set-profile-name"
              className="input"
              value={settings.profileName}
              maxLength={32}
              autoComplete="off"
              onChange={(e) => updateSettings({ profileName: e.target.value })}
            />
            <p className="hint">Local signature — used in toasts and the OS footer.</p>
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="set-locale">Language</label>
            <select
              id="set-locale"
              className="input"
              value={settings.locale}
              onChange={(e) => updateSettings({ locale: e.target.value === "en" ? "en" : "pt" })}
            >
              <option value="pt">Português (pt-BR)</option>
              <option value="en">English (en)</option>
            </select>
          </div>
        </section>

        <section className="glass card reveal in" aria-labelledby="set-int-h">
          <h2 id="set-int-h" style={{ fontSize: "1.05rem", marginBottom: 4 }}>
            Integrations
          </h2>
          <div className="setting-row">
            <div>
              <p className="s-title">Local gateway</p>
              <p className="s-desc">POST /v1/chat/completions · devthink model → glm-5.3.</p>
            </div>
            <StatusDot label="online" tone="success" />
          </div>
          <div className="setting-row">
            <div>
              <p className="s-title">SSE streaming</p>
              <p className="s-desc">Normalized OpenAI-compatible · Anthropic · Gemini deltas.</p>
            </div>
            <Toggle checked={stream} onChange={setStream} label="Toggle SSE streaming" />
          </div>
          <div className="setting-row">
            <div>
              <p className="s-title">MCP · approval gates</p>
              <p className="s-desc">Tools with consent metadata — nothing runs without approval.</p>
            </div>
            <StatusDot label="gated" tone="warning" />
          </div>
          <div className="setting-row">
            <div>
              <p className="s-title">Extension · pagebridge</p>
              <p className="s-desc">Consent-first: the bridge is injected only under an explicit flag + audit.</p>
            </div>
            <StatusDot label="opt-in" tone="info" />
          </div>
        </section>

        <div style={{ minWidth: 0 }}>
          <UrlCleanerDemo />
        </div>
      </div>
    </>
  );
}
