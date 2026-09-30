/**
 * cadria.view.tsx — the video/image/3D player and studio
 * (cadria.devthink.pro) inside the os. Pages: player (mock frame + 24
 * formats), studio (canvas-first layer editor + F-CAD anchor rack),
 * gallery (grid with type filters). Copy absorbed from the static cadria
 * site.
 */
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Pause, Play } from "lucide-react";
import { appMeta, PERSONAS } from "./apps";
import type { OSHandle } from "./os.types";
import { useStoredState } from "./use.stored.state";
import { pushOSEvent } from "./os.events";
import { AppHeader } from "./app.header";
import { AuraChat } from "./aura.chat";
import { PageSection } from "./page.section";

/* ------------------------------- PLAYER -------------------------------- */

const PLAYER_FORMATS = ["MP4", "HLS", "DASH", "FLV", "WEBM", "MP3", "PDF", "DOCX", "XLSX", "+15"];

function fmtClock(total: number): string {
  const m = Math.floor(total / 60);
  const s = Math.floor(total % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function PlayerPage() {
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(14); // seconds
  const DURATION = 161; // 02:41

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setT((prev) => (prev + 1 > DURATION ? 0 : prev + 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [playing]);

  const pct = Math.round((t / DURATION) * 100);

  return (
    <>
      <PageSection
        eyebrow="cadria.devthink.pro · iukka player"
        title="Player"
        description={
          <>
            O player universal <strong className="strong">iukka</strong>: 24 extensões de mídia — vídeo (MP4, HLS, DASH,
            FLV, WEBM), áudio e documentos — via hls.js, dash.js, flv.js, video.js e howler dentro do manifesto.
          </>
        }
        reveal
      />

      <div className="grid cols-2" style={{ marginTop: 26, alignItems: "center" }}>
        <div className="player-frame reveal in" role="img" aria-label="Player frame com play, barra de progresso e timecode">
          <div className="pf-top" aria-hidden="true">
            <span className="pf-tc">
              {fmtClock(t)} / {fmtClock(DURATION)}
            </span>
            <span className="badge">{playing ? "hls · tocando" : "hls · pausado"}</span>
          </div>
          <button
            type="button"
            className="pf-play"
            aria-pressed={playing}
            aria-label={playing ? "Pausar preview" : "Tocar preview"}
            onClick={() => {
              setPlaying((v) => !v);
              toast[playing ? "info" : "success"](playing ? "Preview pausado" : "Preview tocando", {
                description: "Frame de demonstração — o iukka real vem com o engine versawase.",
              });
            }}
          >
            {playing ? (
              <Pause size={26} strokeWidth={1.6} aria-hidden="true" style={{ color: "var(--sol-text)", fill: "var(--sol-text)" }} />
            ) : (
              <Play size={26} strokeWidth={1.6} aria-hidden="true" style={{ color: "var(--sol-text)", fill: "var(--sol-text)", marginLeft: 5 }} />
            )}
          </button>
          <div className="pf-controls" aria-hidden="true">
            <span className="pf-bar">
              <span className="pf-fill" style={{ width: `${pct}%` }} />
              <span className="pf-knob" style={{ left: `${pct}%` }} />
            </span>
            <span className="pf-tc">hls.js</span>
          </div>
        </div>

        <div>
          <p className="eyebrow" style={{ marginBottom: 10 }}>one app, four seats</p>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.1rem)", margin: "0 0 14px" }}>
            cadria absorve o iukka (player) e o create (editor) em uma plataforma criativa só.
          </h2>
          <p style={{ color: "var(--sol-muted)", margin: "0 0 18px" }}>
            Drop um arquivo ou stream um link — o player aceita 24 extensões e o editor de camadas assume a partir daí.
            Sem watermark no export, sempre.
          </p>
          <div className="stat-line" aria-label="Formatos aceitos">
            {PLAYER_FORMATS.map((f) => (
              <span key={f} className="badge">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      <section className="grid cols-4" style={{ marginTop: 26 }} aria-label="O que o cadria entrega">
        {[
          {
            h: "Multi-format player",
            p: "MP4, HLS, DASH, FLV e WEBM mais áudio e documentos — os players embarcam no manifesto do iukka.",
          },
          {
            h: "Layer editor",
            p: "Blend, máscara e keyframe de vídeo, imagem e 3D em uma timeline. Canvas-first, não destrutivo, sempre reversível.",
          },
          {
            h: "Creative anchors",
            p: "3D studio, DAW de áudio, canvas editor, code IDE, temas e 16 sets de ícones acoplam como âncoras do mesmo shell.",
          },
          {
            h: "Export",
            p: "Stills ou timelines inteiras em MP4, WEBM, sequências PNG e GLB — em lote, scriptável, sem watermark.",
          },
        ].map((f) => (
          <div key={f.h} className="glass glass-hover card reveal in">
            <h3 style={{ fontSize: "1.02rem", marginTop: 0 }}>{f.h}</h3>
            <p style={{ margin: 0, fontSize: ".92rem", color: "var(--sol-muted)" }}>{f.p}</p>
          </div>
        ))}
      </section>

      <section className="glass card reveal in" style={{ marginTop: 20, display: "flex", flexWrap: "wrap", gap: 18, alignItems: "center", justifyContent: "space-between", padding: "clamp(22px, 3vw, 34px)" }}>
        <div style={{ maxWidth: 560 }}>
          <h2 style={{ fontSize: "clamp(1.2rem, 2.4vw, 1.7rem)", margin: "0 0 8px" }}>Load your first frame</h2>
          <p style={{ margin: 0, color: "var(--sol-muted)" }}>
            O play acima é visual — integração real com o engine versawase chega com o F-CAD do player.
          </p>
        </div>
        <span className="badge success">
          <span className="dot" aria-hidden="true" /> demo scope · player mock
        </span>
      </section>
    </>
  );
}

/* ------------------------------- STUDIO -------------------------------- */

type Layer = {
  id: string;
  name: string;
  kind: "video" | "image" | "3d" | "text";
  visible: boolean;
  opacity: number;
  blend: string;
};

const SEED_LAYERS: Layer[] = [
  { id: "l1", name: "hero-shot.mp4", kind: "video", visible: true, opacity: 100, blend: "normal" },
  { id: "l2", name: "grade-lut.png", kind: "image", visible: true, opacity: 62, blend: "overlay" },
  { id: "l3", name: "orb-mesh.glb", kind: "3d", visible: true, opacity: 88, blend: "screen" },
  { id: "l4", name: "wordmark", kind: "text", visible: false, opacity: 100, blend: "normal" },
];

const KIND_TONE: Record<Layer["kind"], "success" | "warning" | "info" | "default"> = {
  video: "info",
  image: "success",
  "3d": "warning",
  text: "default",
};

const ANCHORS = [
  { id: "3dstudio", ref: "F-CAD-016", desc: "viewport 3D com materiais e luz" },
  { id: "audio", ref: "F-CAD-017", desc: "rack de áudio acoplado à timeline" },
  { id: "canvaseditor", ref: "F-CAD-018", desc: "pintura e ajuste por pincelada" },
  { id: "code_ide", ref: "F-CAD-019", desc: "scripting de keyframes e expressões" },
  { id: "themes", ref: "F-CAD-020", desc: "temas do studio sobre o tema sol" },
  { id: "icons16", ref: "F-CAD-025", desc: "16 sets de ícones nativos" },
];

function StudioPage() {
  const [layers, setLayers] = useState<Layer[]>(SEED_LAYERS);
  const [selected, setSelected] = useState<string>(SEED_LAYERS[0].id);
  const [exporting, setExporting] = useState<null | "mp4" | "webm" | "png" | "glb">(null);

  const layer = layers.find((l) => l.id === selected) ?? layers[0];

  function patch(id: string, patchObj: Partial<Layer>) {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, ...patchObj } : l)));
  }

  function doExport(kind: NonNullable<typeof exporting>) {
    setExporting(kind);
    toast.info(`Export ${kind.toUpperCase()} na fila`, {
      description: "Pipeline simulado — render real acompanha o engine versawase.",
    });
    pushOSEvent({ title: "Export na fila — cadria", note: `timeline → ${kind.toUpperCase()} (studio)`, kind: "action" });
    window.setTimeout(() => {
      setExporting(null);
      toast.success(`Export ${kind.toUpperCase()} pronto`, { description: "Sem watermark — arquivo vai para a Gallery." });
    }, 1800);
  }

  return (
    <>
      <PageSection
        eyebrow="cadria.devthink.pro · create editor"
        title="Studio"
        description="O editor de camadas canvas-first: vídeo, imagem e 3D na mesma timeline, sempre não destrutivo — mais o rack de âncoras (3dstudio, audio, canvaseditor, code_ide, themes, icons16)."
        reveal
      />

      <div className="grid cols-2" style={{ marginTop: 26, alignItems: "start" }}>
        <section className="glass card reveal in" aria-labelledby="layers-h">
          <div className="row between" style={{ marginBottom: 12 }}>
            <h2 id="layers-h" style={{ fontSize: "1.05rem", margin: 0 }}>Camadas</h2>
            <span className="badge">{layers.filter((l) => l.visible).length}/{layers.length} visíveis</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: "16rem", overflowY: "auto" }} role="list" aria-label="Lista de camadas">
            {layers.map((l) => (
              <div
                key={l.id}
                role="listitem"
                className="row between"
                style={{
                  padding: "10px 12px",
                  borderRadius: "var(--r-sm)",
                  border: `1px solid ${l.id === selected ? "var(--sol-primary)" : "var(--sol-line)"}`,
                  background: l.id === selected ? "color-mix(in srgb, var(--sol-primary) 10%, transparent)" : "transparent",
                }}
              >
                <div className="row" style={{ gap: 10, flex: 1, minWidth: 0 }}>
                  <button
                    type="button"
                    className="icon-btn"
                    style={{ width: 30, height: 30 }}
                    aria-label={l.visible ? `Ocultar camada ${l.name}` : `Mostrar camada ${l.name}`}
                    aria-pressed={l.visible}
                    onClick={() => patch(l.id, { visible: !l.visible })}
                  >
                    {l.visible ? <Eye size={15} strokeWidth={1.8} /> : <EyeOff size={15} strokeWidth={1.8} />}
                  </button>
                  <button
                    type="button"
                    className="row"
                    style={{
                      flex: 1,
                      minWidth: 0,
                      gap: 10,
                      padding: 0,
                      background: "transparent",
                      border: 0,
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                    onClick={() => setSelected(l.id)}
                    aria-pressed={l.id === selected}
                  >
                    <span
                      className="strong"
                      style={{ fontSize: ".92rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                    >
                      {l.name}
                    </span>
                    <span className={`badge ${KIND_TONE[l.kind]}`}>{l.kind}</span>
                  </button>
                </div>
                <span className="tiny faint mono">{l.opacity}%</span>
              </div>
            ))}
          </div>

          {layer ? (
            <div style={{ borderTop: "1px solid var(--sol-line)", marginTop: 14, paddingTop: 14 }} aria-label={`Ajustes da camada ${layer.name}`}>
              <p className="eyebrow" style={{ marginBottom: 12 }}>{layer.name}</p>
              <div className="field">
                <label htmlFor="lay-op">Opacidade — {layer.opacity}%</label>
                <input
                  id="lay-op"
                  type="range"
                  min={0}
                  max={100}
                  value={layer.opacity}
                  aria-label={`Opacidade da camada ${layer.name}`}
                  onChange={(e) => patch(layer.id, { opacity: Number(e.target.value) })}
                />
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label htmlFor="lay-blend">Blend</label>
                <select id="lay-blend" className="input" value={layer.blend} onChange={(e) => patch(layer.id, { blend: e.target.value })}>
                  {["normal", "overlay", "screen", "multiply", "soft-light", "color-dodge"].map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                <p className="hint">Ajustes de camada são não destrutivos — o source nunca é alterado.</p>
              </div>
            </div>
          ) : null}
        </section>

        <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>
          <section className="glass card reveal in" aria-labelledby="anchors-h">
            <h2 id="anchors-h" style={{ fontSize: "1.05rem", marginBottom: 4 }}>Rack de âncoras</h2>
            <p className="small" style={{ marginTop: 0, marginBottom: 14 }}>
              As âncoras acoplam ferramentas ao redor do mesmo shell — F-CAD-016..025.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {ANCHORS.map((a) => (
                <div key={a.id} className="row between" style={{ padding: "9px 0", borderBottom: "1px solid var(--sol-line)" }}>
                  <div>
                    <p className="strong" style={{ margin: 0, fontSize: ".92rem" }}>{a.id}</p>
                    <p className="tiny faint" style={{ margin: 0 }}>{a.desc}</p>
                  </div>
                  <span className="badge mono">{a.ref}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="glass card reveal in" aria-labelledby="export-h">
            <h2 id="export-h" style={{ fontSize: "1.05rem", marginBottom: 4 }}>Export</h2>
            <p className="small" style={{ marginTop: 0, marginBottom: 14 }}>
              Renderize a timeline inteira ou um still — sem watermark, em lote ou por script.
            </p>
            <div className="row">
              {(["mp4", "webm", "png", "glb"] as const).map((k) => (
                <button key={k} type="button" className="btn secondary small" disabled={exporting !== null} onClick={() => doExport(k)}>
                  {exporting === k ? "renderizando…" : k.toUpperCase()}
                </button>
              ))}
            </div>
            {exporting ? (
              <div className="progress" style={{ marginTop: 14 }} aria-hidden="true">
                <i />
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </>
  );
}

/* ------------------------------- GALLERY ------------------------------- */

type GalleryItem = {
  id: string;
  title: string;
  kind: "video" | "3d" | "image" | "doc";
  meta: string;
  ph: string;
};

const GALLERY: GalleryItem[] = [
  { id: "g1", title: "Orbital — teaser", kind: "video", meta: "MP4 · 1080p · 02:41", ph: "ph-3" },
  { id: "g2", title: "Solar mesh study", kind: "3d", meta: "GLB · 84k tris", ph: "ph-4" },
  { id: "g3", title: "Ember grade LUT", kind: "image", meta: "PNG · 4k still", ph: "ph-1" },
  { id: "g4", title: "Versawase breakdown", kind: "doc", meta: "PDF · 12 páginas", ph: "ph-2" },
  { id: "g5", title: "Frame by frame — spot", kind: "video", meta: "WEBM · 720p · 00:58", ph: "ph-5" },
  { id: "g6", title: "Anchor icons sheet", kind: "image", meta: "SVG · 16 set", ph: "ph-6" },
];

const GALLERY_TONE: Record<GalleryItem["kind"], "success" | "warning" | "info" | "default"> = {
  video: "info",
  "3d": "warning",
  image: "success",
  doc: "default",
};

function GalleryPage() {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"all" | GalleryItem["kind"]>("all");
  const [favs, setFavs] = useStoredState<string[]>(
    "dt-cadria-favs-v1",
    [],
    (v): v is string[] => Array.isArray(v) && v.every((x) => typeof x === "string")
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GALLERY.filter(
      (g) => (kind === "all" || g.kind === kind) && (!q || g.title.toLowerCase().includes(q) || g.meta.toLowerCase().includes(q))
    );
  }, [query, kind]);

  function toggleFav(id: string) {
    const isFav = favs.includes(id);
    setFavs((prevList) => (isFav ? prevList.filter((f) => f !== id) : [...prevList, id]));
    pushOSEvent({
      title: isFav ? "Removido dos favoritos — cadria" : "Favorito salvo — cadria",
      note: GALLERY.find((g) => g.id === id)?.title ?? id,
      kind: "action",
    });
  }

  return (
    <>
      <PageSection
        eyebrow="cadria.devthink.pro · gallery"
        title="Gallery"
        description="Saídas do studio: timelines exportadas, stills, meshes e documentos. Favoritos ficam persistidos no dispositivo."
        reveal
      />

      <div className="row between" style={{ marginTop: 26, marginBottom: 16 }} role="toolbar" aria-label="Filtros da galeria">
        <div className="tabs" role="tablist" aria-label="Filtrar por tipo">
          {(["all", "video", "3d", "image", "doc"] as const).map((k) => (
            <button key={k} type="button" role="tab" aria-selected={kind === k} onClick={() => setKind(k)}>
              {k === "all" ? "tudo" : k}
            </button>
          ))}
        </div>
        <input
          className="input"
          type="search"
          style={{ minWidth: 220, width: "auto" }}
          placeholder="Buscar item…"
          aria-label="Buscar na galeria"
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="grid cols-3" style={{ alignItems: "stretch" }}>
        {rows.map((g) => (
          <article key={g.id} className="glass glass-hover card proj reveal in" aria-label={`${g.title} — ${g.meta}`}>
            <div className={`ph ${g.ph}`} aria-hidden="true" />
            <div style={{ padding: 16 }}>
              <div className="row between" style={{ marginBottom: 8 }}>
                <h3 style={{ margin: 0, fontSize: "1rem" }}>{g.title}</h3>
                <span className={`badge ${GALLERY_TONE[g.kind]}`}>{g.kind}</span>
              </div>
              <div className="row between">
                <span className="tiny faint mono">{g.meta}</span>
                <button
                  type="button"
                  className="icon-btn"
                  style={{ width: 30, height: 30 }}
                  aria-pressed={favs.includes(g.id)}
                  aria-label={favs.includes(g.id) ? `Remover ${g.title} dos favoritos` : `Salvar ${g.title} nos favoritos`}
                  onClick={() => toggleFav(g.id)}
                >
                  <span aria-hidden="true" style={{ fontSize: ".95rem", color: favs.includes(g.id) ? "var(--sol-primary)" : "inherit" }}>
                    {favs.includes(g.id) ? "★" : "☆"}
                  </span>
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {rows.length === 0 ? (
        <div className="glass card" style={{ marginTop: 16 }}>
          <p style={{ margin: 0, color: "var(--sol-muted)" }}>Nada em “{query}” com esse filtro — tente outro tipo.</p>
        </div>
      ) : null}

      <section className="glass card reveal in" style={{ marginTop: 20, maxWidth: 640 }}>
        <h2 style={{ fontSize: "1.05rem" }}>Demo scope</h2>
        <p style={{ margin: 0 }}>
          Itens de vitrine são estáticos; os favoritos são seus (persistidos via <code>useStoredState</code>). Exports
          reais chegam com o pipeline do engine <code>versawase</code> (F-CAD-016..025).
        </p>
      </section>
    </>
  );
}

/* -------------------------------- APP ---------------------------------- */

export function CadriaApp({ os }: { os: OSHandle }) {
  const meta = appMeta("cadria")!;
  const [chatOpen, setChatOpen] = useState(true);
  const page = meta.pages.some((p) => p.id === os.view.page) ? os.view.page : "player";

  return (
    <>
      <AppHeader
        app={meta}
        active={page}
        chatOpen={chatOpen}
        onNavigate={(p) => os.openApp("cadria", p)}
        onHome={os.goGateway}
        onToggleChat={() => setChatOpen((v) => !v)}
        theme={os.settings.theme}
        onToggleTheme={os.toggleTheme}
      />

      <main className="shell">
        <div className={`app-layout${chatOpen ? " with-chat" : ""}`} style={{ marginTop: 26 }}>
          <div>
            {page === "player" ? (
              <PlayerPage />
            ) : page === "studio" ? (
              <StudioPage />
            ) : (
              <GalleryPage />
            )}
          </div>
          {chatOpen ? (
            <div className="chat-panel">
              <AuraChat persona={PERSONAS.cadria} storageKey="dt-chat-cadria-v1" appLabel="cadria" />
            </div>
          ) : null}
        </div>
      </main>
    </>
  );
}
