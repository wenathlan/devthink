"use client";

/* ==========================================================================
   DevThinkApp — app da plataforma devthink.pro no OS.
   Páginas: projects (grid + modal de criação + filtros), history (timeline
   do feed do OS), docs (leitor com sidebar de tópicos), explore (vitrine
   dos 4 apps irmãos + skills), settings (tema, motion, perfil, integrações,
   demo clean-url), aura (chat dedicado). Conteúdo do README/ARCHITECTURE.
   ========================================================================== */

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { APPS, appMeta, PERSONAS } from "../engine/apps";
import type { OSHandle } from "../engine/os-types";
import { useStoredState, arrayOf, type Validator } from "../engine/use-stored-state";
import { clearOSEvents, pushOSEvent, useOSEvents } from "../engine/os-events";
import { AppHeader } from "../shared/app-header";
import { AuraChat } from "../shared/aura-chat";
import { Modal } from "../shared/modal";
import { PageSection } from "../shared/page-section";
import { StatusDot } from "../shared/status-dot";
import { UrlCleanerDemo } from "../shared/url-cleaner-demo";

/* ------------------------------- PROJETOS ------------------------------ */

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
  active: "ativo",
  paused: "pausado",
  done: "concluído",
  draft: "rascunho",
};

const STATUS_TONE: Record<ProjectStatus, "success" | "warning" | "info" | "default"> = {
  active: "success",
  paused: "warning",
  done: "info",
  draft: "default",
};

const SEED_PROJECTS: Project[] = [
  { id: "s1", name: "Gateway v2.0.40", desc: "Normalização de providers + SSE no loopback; modelo devthink → glm-5.3.", status: "active", tag: "gateway", at: 0 },
  { id: "s2", name: "CLI · 20 modos", desc: "Streaming chat, discovery de providers/modelos, sessões e memória locais.", status: "active", tag: "cli", at: 0 },
  { id: "s3", name: "Sandbox engine", desc: "Isolamento de execução com gates de aprovação MCP e extensão consent-first.", status: "paused", tag: "engine", at: 0 },
  { id: "s4", name: "Workbench estático", desc: "React estático com rotas workspace/session/tab/section e pairing one-time.", status: "done", tag: "web", at: 0 },
  { id: "s5", name: "@wenathlan/devthink", desc: "Contrato protocolv2 congelado — exports da biblioteca npm.", status: "done", tag: "lib", at: 0 },
  { id: "s6", name: "Argan hung model", desc: "Wildcard no apex devthink.pro — vhost por Host, pipeline-only.", status: "draft", tag: "dns", at: 0 },
];

const PH_CLASSES = ["ph-1", "ph-2", "ph-3", "ph-4", "ph-5", "ph-6"];

/* --------------------------------- DOCS -------------------------------- */

type DocBlock = { h?: string; p?: string[]; code?: string; list?: string[] };
type DocTopic = { id: string; title: string; kicker: string; blocks: DocBlock[] };

const DOC_TOPICS: DocTopic[] = [
  {
    id: "overview",
    title: "Visão geral",
    kicker: "plataforma · provider-neutral",
    blocks: [
      {
        p: [
          "DevThink é um workbench de IA provider-neutral: um CLI de terminal, um gateway local embutido e um workbench web estático — tudo em um limite de produto só. O código público vive no repositório wenathlan/devthink.",
        ],
      },
      {
        h: "Fronteira de segurança",
        p: [
          "O DevThink usa APIs oficiais de providers e credenciais fornecidas explicitamente pelo usuário. Não captura cookies de navegador, não resolve CAPTCHA, não automatiza autenticação de browser e não contorna controles anti-bot.",
        ],
      },
      {
        h: "Superfícies",
        list: [
          "CLI — streaming chat, discovery, 20 modos, sessões e memória locais.",
          "Gateway local — HTTP/SSE em loopback: health, models, chat normalizado.",
          "Provider layer — OpenAI-compatible, Anthropic Messages, Google Generate Content.",
          "Workbench — app React estático com pairing one-time.",
          "MCP — ferramentas com metadata de consentimento e approval gates.",
        ],
      },
    ],
  },
  {
    id: "cli",
    title: "CLI",
    kicker: "terminal · 20 modos",
    blocks: [
      {
        p: [
          "O CLI é a porta de entrada: chat com streaming, descoberta de providers e modelos, 20 modos operacionais nomeados, sessões e memória persistidas localmente e pairing sem credencial para o workbench.",
        ],
        code: `devthink init\ndevthink chat --provider zai --model glm-5 --prompt "..."\ndevthink providers\ndevthink models --provider <id>\ndevthink modes\ndevthink auth login <provider> --token <credential>\ndevthink sessions list\ndevthink serve\ndevthink interactive`,
      },
      {
        h: "Estado local",
        p: [
          "Registros atômicos em JSON + espelho SQLite sob ~/.config/devthink/. Preferências sem segredo em devthink.json; credenciais oficiais em auth.json (modo 0600). Chaves nunca vão para logs ou exports.",
        ],
      },
      {
        h: "Seleção de provider",
        p: [
          "Seleção explícita: --provider ou o provider configurado — sem rotação silenciosa entre contas. Fallback só por lista ordenada escrita pelo usuário. Um provider pode ser health-checked sem enviar prompt.",
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
          "O gateway local escuta apenas na interface loopback (127.0.0.1). Sem porta configurada, escolhe um candidato aleatório na faixa documentada. Expõe /health, /models e /chat — nenhum filesystem exposto por padrão.",
        ],
      },
      {
        h: "No DevThink OS",
        p: [
          "O OS conversa com o gateway via POST /v1/chat/completions (contrato OpenAI) com o modelo devthink — é o que alimenta a Aura em cada app desta família. Respostas podem trazer reasoning_content, exibido como Internal Cognition.",
        ],
        code: `POST /v1/chat/completions\n{ "model": "devthink", "messages": [...] }`,
      },
      {
        h: "Endpoints de provider",
        p: [
          "Não existe módulo proxy separado: um endpoint específico de provider entra em providers.<id>.baseUrl no devthink.json do usuário. Famílias suportadas: OpenAI-compatible (Z.AI, Qwen, DeepSeek, Groq…), Anthropic Messages e Google Gemini — todas com streaming.",
        ],
      },
    ],
  },
  {
    id: "sandbox",
    title: "Sandbox engine",
    kicker: "isolamento · consent-first",
    blocks: [
      {
        p: [
          "O sandbox engine executa ações do OS em um perímetro controlado: cada ação sensível passa por approval gates antes de tocar o host, e o resultado é auditável.",
        ],
      },
      {
        h: "Gates de aprovação",
        list: [
          "MCP — ferramentas com metadata de consentimento e approval gates explícitos.",
          "Extensão — background consent-first: request router, workflow segments e capability gates congelados pelo capmanifest.",
          "Pagebridge — único content script injetado: emoldura chaves de conteúdo da página sob flag de consentimento explícito e audit kind.",
        ],
      },
      {
        h: "Persistência",
        p: [
          "Workspaces, sessões, tabs e mensagens ficam no SQLite local; memória é resolvida na ordem sessão → projeto → global. Memória externa nunca é contactada automaticamente.",
        ],
      },
    ],
  },
  {
    id: "products",
    title: "Família de produtos",
    kicker: "4 apps · um gateway",
    blocks: [
      {
        p: [
          "A plataforma devthink.pro é a casa de quatro apps irmãos — todos rodam no mesmo gateway e compartilham o tema sol deste OS.",
        ],
      },
      {
        h: "Os apps",
        list: [
          "argan (argan.devthink.pro) — biblioteca de DNS e gateway: zonas, DNSSEC ED25519, GNS/PKARR e o modelo hung no apex.",
          "debonair (debonair.devthink.pro) — DAW de áudio no engine katexis: prompt-to-arrangement e mastering broadcast-ready.",
          "cadria (cadria.devthink.pro) — player, editor e studio de vídeo/imagem/3D no engine versawase.",
          "stealthhead (stealthhead.devthink.pro) — plataforma FPS: matchmaking 5v5, ladders e arsenal balanceado por Monte Carlo TTK.",
        ],
      },
      {
        h: "Explore",
        p: ["Use a página Explore deste app para entrar direto em qualquer um deles."],
      },
    ],
  },
  {
    id: "install",
    title: "Instalação",
    kicker: "npm · bun · binários",
    blocks: [
      {
        p: ["Instale globalmente pelo npm ou rode direto com Bun — builds self-contained para Linux, macOS e Windows."],
        code: `npm install --global @wenathlan/devthink\ndevthink init\ndevthink --help\n\n# ou via bun\nbun install\nbun run devthink.ts init`,
      },
      {
        h: "Primeiro chat",
        code: `devthink auth login zai --token "$ZAI_API_KEY" --kind api-key\ndevthink config activeModel glm-5\ndevthink chat --prompt "Summarize this repository in three points."`,
      },
      {
        h: "Documentação tipada",
        p: [
          "O diretório docs/ traz coleções category.ts.md — auth, providers, gateway, storage e web — como contratos TypeScript com JSDoc: retry com limite, redação de erros, match exato de origins e normalização de base path.",
        ],
      },
    ],
  },
];

/* -------------------------------- APP ---------------------------------- */

export function DevThinkApp({ os }: { os: OSHandle }) {
  const meta = appMeta("devthink")!;
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
              eyebrow="aura · gateway devthink.pro"
              title="Chat Aura"
              description="A inteligência do gateway, dedicada: pergunte sobre a plataforma, os engines ou qualquer app da família."
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
                <ProjectsPage projects={projects} onCreate={(p) => setProjects((prev) => [p, ...prev])} onDelete={(id) => setProjects((prev) => prev.filter((p) => p.id !== id))} />
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
        (!q || p.name.toLowerCase().includes(q) || p.tag.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q))
    );
  }, [all, query, status]);

  return (
    <>
      <PageSection
        eyebrow="devthink.pro · plataforma"
        title="Projects"
        description="O workbench provider-neutral em um só lugar: projetos locais persistidos no dispositivo, com status, tag e busca. Criar aqui empurra um evento para a History do OS."
        reveal
      />

      <div className="row between" style={{ marginTop: 26, marginBottom: 16 }} role="toolbar" aria-label="Filtros de projetos">
        <div className="tabs" role="tablist" aria-label="Filtrar por status">
          {(["all", "active", "paused", "done", "draft"] as const).map((s) => (
            <button
              key={s}
              type="button"
              role="tab"
              aria-selected={status === s}
              onClick={() => setStatus(s)}
            >
              {s === "all" ? "todos" : STATUS_LABEL[s]}
            </button>
          ))}
        </div>
        <div className="row" style={{ gap: 10 }}>
          <input
            className="input"
            type="search"
            style={{ minWidth: 200, width: "auto" }}
            placeholder="Buscar projeto, tag…"
            aria-label="Buscar projetos"
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
                    aria-label={`Remover projeto ${p.name}`}
                    title="Remover projeto"
                    onClick={() => {
                      onDelete(p.id);
                      pushOSEvent({ title: "Projeto removido — devthink", note: p.name, kind: "action" });
                      toast("Projeto removido", { description: `${p.name} saiu deste dispositivo.` });
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
            Nenhum projeto com “{query}”{status !== "all" ? ` em ${STATUS_LABEL[status]}` : ""} — ajuste os filtros.
          </p>
        </div>
      ) : null}

      <NewProjectModal
        open={open}
        onOpenChange={setOpen}
        onCreate={(p) => {
          onCreate(p);
          pushOSEvent({ title: "Projeto criado — devthink", note: `${p.name} · ${p.tag}`, kind: "action" });
          toast.success(`Projeto “${p.name}” criado`, { description: `status ${STATUS_LABEL[p.status]} · tag ${p.tag}` });
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
      toast.error("Nome obrigatório", { description: "Dê um nome curto ao projeto — o resto é opcional." });
      return;
    }
    onCreate({
      id: `p-${Date.now()}`,
      name: n,
      desc: desc.trim() || "Sem descrição ainda — edite quando quiser.",
      tag: tag.trim() || "geral",
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
      description="O projeto fica persistido neste dispositivo — nada sai do browser."
    >
      <div style={{ marginTop: 14 }}>
        <div className="field">
          <label htmlFor="np-name">Nome</label>
          <input id="np-name" className="input" value={name} maxLength={60} autoComplete="off" placeholder="ex.: Gateway normalizer" onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="np-desc">Descrição</label>
          <textarea id="np-desc" className="input" rows={3} maxLength={200} value={desc} placeholder="Uma linha basta." onChange={(e) => setDesc(e.target.value)} />
        </div>
        <div className="row" style={{ alignItems: "flex-start" }}>
          <div className="field" style={{ flex: "1 1 140px" }}>
            <label htmlFor="np-tag">Tag</label>
            <input id="np-tag" className="input" value={tag} maxLength={20} placeholder="gateway · cli · web" onChange={(e) => setTag(e.target.value)} />
          </div>
          <div className="field" style={{ flex: "1 1 160px" }}>
            <label htmlFor="np-status">Status</label>
            <select id="np-status" className="input" value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)}>
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
            Cancelar
          </button>
          <button type="button" className="btn" onClick={submit}>
            Criar projeto
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ------------------------------- HISTORY ------------------------------- */

const SEED_EVENTS = [
  { id: "se1", title: "gateway v2.0.40", note: "Modelo devthink → glm-5.3; SSE estabilizado no loopback.", kind: "release" as const, at: 1755200000000 },
  { id: "se2", title: "protocolv2 congelado", note: "Exports da @wenathlan/devthink travados por api freeze.", kind: "release" as const, at: 1755000000000 },
  { id: "se3", title: "MCP approval gates", note: "Catálogo de ferramentas com consent metadata publicado.", kind: "action" as const, at: 1754700000000 },
];

function fmtWhen(at: number): string {
  try {
    return new Date(at).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
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
      (e) => (kind === "all" || e.kind === kind) && (!q || e.title.toLowerCase().includes(q) || e.note.toLowerCase().includes(q))
    );
  }, [live, kind, query]);

  return (
    <>
      <PageSection
        eyebrow="devthink.pro · feed do OS"
        title="History"
        description="Timeline de tudo que acontece no OS — renders, projetos criados, chats com a Aura e releases do gateway. Ações dos apps irmãos chegam aqui em tempo real."
        reveal
      />

      <div className="row between" style={{ marginTop: 26, marginBottom: 18 }} role="toolbar" aria-label="Filtros da timeline">
        <div className="tabs" role="tablist" aria-label="Filtrar por tipo de evento">
          {(["all", "release", "action", "chat"] as const).map((k) => (
            <button key={k} type="button" role="tab" aria-selected={kind === k} onClick={() => setKind(k)}>
              {k === "all" ? "tudo" : k}
            </button>
          ))}
        </div>
        <div className="row" style={{ gap: 10 }}>
          <input
            className="input"
            type="search"
            style={{ minWidth: 200, width: "auto" }}
            placeholder="Buscar evento…"
            aria-label="Buscar eventos"
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="button"
            className="btn secondary"
            onClick={() => {
              clearOSEvents();
              toast("Feed limpo", { description: "Eventos locais apagados — seeds do release permanecem." });
            }}
          >
            <Trash2 size={15} strokeWidth={1.8} aria-hidden="true" /> Limpar feed
          </button>
        </div>
      </div>

      <section className="glass card reveal in" aria-label="Timeline de eventos do OS" style={{ maxHeight: "36rem", overflowY: "auto" }}>
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
              Nada por aqui ainda — crie um projeto, renderize no debonair ou fale com a Aura.
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
  const idx = Math.max(0, DOC_TOPICS.findIndex((t) => t.id === active));
  const topic = DOC_TOPICS[idx] ?? DOC_TOPICS[0];

  return (
    <>
      <PageSection
        eyebrow="devthink.pro · docs"
        title="Docs"
        description="O essencial do DevThink em seis tópicos curtos — absorvido do README e da ARCHITECTURE do repositório público."
        reveal
      />

      <div className="docs-layout" style={{ marginTop: 26 }}>
        <nav className="glass card" style={{ padding: 10, display: "flex", flexDirection: "column", gap: 4 }} aria-label="Tópicos da documentação">
          {DOC_TOPICS.map((t, i) => (
            <button key={t.id} type="button" className="doc-btn" aria-current={t.id === active ? "true" : undefined} onClick={() => setActive(t.id)}>
              <span style={{ opacity: 0.6, marginRight: 8 }} className="mono">
                {String(i + 1).padStart(2, "0")}
              </span>
              {t.title}
            </button>
          ))}
        </nav>

        <article className="glass card reveal in" aria-labelledby="doc-title" style={{ maxHeight: "40rem", overflowY: "auto" }}>
          <p className="eyebrow" style={{ marginBottom: 8 }}>{topic.kicker}</p>
          <h2 id="doc-title" style={{ fontSize: "1.6rem", margin: "0 0 18px" }}>{topic.title}</h2>
          {topic.blocks.map((b, i) => (
            <section key={`${topic.id}-${i}`} style={{ marginBottom: 20 }}>
              {b.h ? <h3 style={{ fontSize: "1.02rem", margin: "0 0 8px" }}>{b.h}</h3> : null}
              {b.p?.map((par, j) => (
                <p key={j} style={{ margin: "0 0 10px", color: "var(--sol-muted)", fontSize: ".95rem" }}>
                  {par}
                </p>
              ))}
              {b.list ? (
                <ul className="rules" style={{ margin: "0 0 10px" }}>
                  {b.list.map((li, j) => (
                    <li key={j}>{li}</li>
                  ))}
                </ul>
              ) : null}
              {b.code ? (
                <pre
                  className="mono"
                  style={{
                    margin: "0 0 10px",
                    padding: "14px 16px",
                    background: "var(--sol-panel)",
                    border: "1px solid var(--sol-line)",
                    borderRadius: "var(--r-md)",
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
            <button type="button" className="btn secondary small" disabled={idx === 0} onClick={() => setActive(DOC_TOPICS[Math.max(0, idx - 1)].id)}>
              <ChevronLeft size={15} strokeWidth={1.8} aria-hidden="true" /> Anterior
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
              Próximo <ChevronRight size={15} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </div>
        </article>
      </div>
    </>
  );
}

/* ------------------------------- EXPLORE ------------------------------- */

const SKILLS = [
  "CLI · 20 modos",
  "streaming SSE",
  "gateway loopback",
  "provider-neutral",
  "MCP approval gates",
  "extensão consent-first",
  "pagebridge auditado",
  "protocolv2 frozen",
  "katexis · áudio",
  "versawase · vídeo/3d",
  "argan · DNSSEC",
  "pairing one-time",
];

function ExplorePage({ os }: { os: OSHandle }) {
  const siblings = APPS.filter((a) => a.id !== "devthink");
  return (
    <>
      <PageSection
        eyebrow="devthink.pro · explore"
        title="Explore"
        description="Os quatro apps da família devthink.pro — cada um com seu domínio, seu engine e suas páginas dentro do mesmo OS. Entre em qualquer um sem sair do gateway."
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
              aria-label={`Entrar no app ${a.name} (${a.domain})`}
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
                abrir {a.pages.map((p) => p.label.toLowerCase()).join(" · ")} <ChevronRight size={15} strokeWidth={1.8} aria-hidden="true" />
              </span>
            </button>
          );
        })}
      </div>

      <section className="glass card reveal in" style={{ marginTop: 20 }} aria-labelledby="skills-h">
        <h2 id="skills-h" style={{ fontSize: "1.05rem", marginBottom: 6 }}>Skills da plataforma</h2>
        <p className="small" style={{ marginTop: 0, marginBottom: 14 }}>
          Capacidades transversais — todo app da família herda o mesmo gateway, o mesmo tema sol e a mesma Aura.
        </p>
        <div className="chips" role="list" aria-label="Skills da plataforma">
          {SKILLS.map((s) => (
            <span key={s} className="badge" role="listitem" style={{ padding: "7px 13px" }}>
              {s}
            </span>
          ))}
        </div>
      </section>
    </>
  );
}

/* ------------------------------ SETTINGS ------------------------------- */

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
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
    (v): v is boolean => typeof v === "boolean"
  );

  return (
    <>
      <PageSection
        eyebrow="devthink.pro · settings"
        title="Settings"
        description="Preferências do OS persistidas no dispositivo: tema, movimento, cognição da Aura, perfil e integrações — mais o demo do módulo clean-url."
        reveal
      />

      <div className="grid cols-2" style={{ marginTop: 26, alignItems: "start" }}>
        <section className="glass card reveal in" aria-labelledby="set-theme-h">
          <h2 id="set-theme-h" style={{ fontSize: "1.05rem", marginBottom: 4 }}>Aparência &amp; movimento</h2>
          <div className="setting-row">
            <div>
              <p className="s-title">Tema solar</p>
              <p className="s-desc">#0B0806 · #F59E0B · #FFFBEB — liquid glass 35px.</p>
            </div>
            <Toggle checked={settings.theme === "dark"} onChange={toggleTheme} label="Alternar tema solar/claro" />
          </div>
          <div className="setting-row">
            <div>
              <p className="s-title">Reduce motion</p>
              <p className="s-desc">Calma nas transições (120–250ms) e reveal sem animação.</p>
            </div>
            <Toggle checked={settings.reduceMotion} onChange={(v) => updateSettings({ reduceMotion: v })} label="Alternar reduce motion" />
          </div>
          <div className="setting-row">
            <div>
              <p className="s-title">Cognição interna da Aura</p>
              <p className="s-desc">Mostrar o reasoning_content recolhível nas respostas.</p>
            </div>
            <Toggle checked={settings.showCognition} onChange={(v) => updateSettings({ showCognition: v })} label="Alternar cognição interna" />
          </div>
        </section>

        <section className="glass card reveal in" aria-labelledby="set-profile-h">
          <h2 id="set-profile-h" style={{ fontSize: "1.05rem", marginBottom: 14 }}>Perfil</h2>
          <div className="field">
            <label htmlFor="set-profile-name">Nome do operador</label>
            <input
              id="set-profile-name"
              className="input"
              value={settings.profileName}
              maxLength={32}
              autoComplete="off"
              onChange={(e) => updateSettings({ profileName: e.target.value })}
            />
            <p className="hint">Assinatura local — usada nos toasts e no rodapé do OS.</p>
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="set-locale">Idioma</label>
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
          <h2 id="set-int-h" style={{ fontSize: "1.05rem", marginBottom: 4 }}>Integrações</h2>
          <div className="setting-row">
            <div>
              <p className="s-title">Gateway local</p>
              <p className="s-desc">POST /v1/chat/completions · modelo devthink → glm-5.3.</p>
            </div>
            <StatusDot label="online" tone="success" />
          </div>
          <div className="setting-row">
            <div>
              <p className="s-title">Streaming SSE</p>
              <p className="s-desc">Delta normalizado OpenAI-compatible · Anthropic · Gemini.</p>
            </div>
            <Toggle checked={stream} onChange={setStream} label="Alternar streaming SSE" />
          </div>
          <div className="setting-row">
            <div>
              <p className="s-title">MCP · approval gates</p>
              <p className="s-desc">Ferramentas com consent metadata — nada roda sem aprovação.</p>
            </div>
            <StatusDot label="gated" tone="warning" />
          </div>
          <div className="setting-row">
            <div>
              <p className="s-title">Extensão · pagebridge</p>
              <p className="s-desc">Consent-first: bridge injetado só sob flag explícita + audit.</p>
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