/**
 * cadriaview.tsx — the video/image/3D player and studio
 * (cadria.devthink.pro) inside the os. Pages: player (mock frame + 24
 * formats), studio (canvas-first layer editor + F-CAD anchor rack),
 * gallery (grid with type filters). Copy absorbed from the static cadria
 * site.
 *
 * C2-02 pass: one dominant object per page (rose light source, halftone
 * edge, film grain) over a support rail, editorial ledgers instead of
 * repeated identical cards, the cadria identity accent (apps.ts metadata)
 * on key numbers and active states, one staggered entrance per view
 * switch (reveal.ts, reduced-motion guarded).
 *
 * Task 3-c identity pass: the hero carries the rosa accent with the
 * clapperboard reel spinning inside its own stroke; the gallery filter
 * miss became a real family empty state with a working clear action.
 */

import { Eye, EyeOff, Pause, Play, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import { pushOSEvent } from "./osevents.ts";
import type { OSHandle } from "./ostypes.ts";
import { PageSection } from "./pagesection.tsx";
import { useStoredState } from "./usestoredstate.ts";

/* ------------------------------- PLAYER -------------------------------- */

/** the dominant-object surface: the rose light over the family surface ladder. */
const DOMINANT_SURFACE = {
  background: "var(--atmos-veil), var(--fam-s1)",
  overflow: "hidden",
} as const;

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
        heading="h2"
        description={
          <>
            The universal <strong className="strong">iukka</strong> player: 24 media extensions — video (MP4, HLS, DASH,
            FLV, WEBM), audio and documents — via hls.js, dash.js, flv.js, video.js and howler inside the manifest.
          </>
        }
        reveal
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 26, alignItems: "center", marginTop: 26 }}>
        {/* the dominant object: the iukka frame under the rose light */}
        <div
          className="player-frame atmos reveal grain"
          role="img"
          aria-label="Player frame with play button, progress bar and timecode"
          style={{ ...DOMINANT_SURFACE, flex: "3 1 420px", minWidth: 0 }}
        >
          <div className="pf-top" aria-hidden="true">
            <span className="pf-tc">
              {fmtClock(t)} / {fmtClock(DURATION)}
            </span>
            <span className="badge">{playing ? "hls · playing" : "hls · paused"}</span>
          </div>
          <button
            type="button"
            className="pf-play"
            aria-pressed={playing}
            aria-label={playing ? "Pause preview" : "Play preview"}
            onClick={() => {
              setPlaying((v) => !v);
              toast[playing ? "info" : "success"](playing ? "Preview paused" : "Preview playing", {
                description: "Demonstration frame — the real iukka ships with the versawase engine.",
              });
            }}
          >
            {playing ? (
              <Pause
                size={26}
                strokeWidth={1.6}
                aria-hidden="true"
                style={{ color: "var(--sol-text)", fill: "var(--sol-text)" }}
              />
            ) : (
              <Play
                size={26}
                strokeWidth={1.6}
                aria-hidden="true"
                style={{ color: "var(--sol-text)", fill: "var(--sol-text)", marginLeft: 5 }}
              />
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

        {/* the support rail: the one-paragraph pitch + the format specimen line */}
        <div style={{ flex: "2 1 300px", minWidth: 0 }}>
          <p className="eyebrow" style={{ color: "var(--app-accent)", marginBottom: 10 }}>
            one app, four seats
          </p>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.1rem)", margin: "0 0 14px" }}>
            cadria absorbs iukka (player) and create (editor) into a single creative platform.
          </h2>
          <p style={{ color: "var(--sol-muted)", margin: "0 0 18px" }}>
            Drop a file or stream a link — the player accepts 24 extensions and the layer editor takes it from there. No
            watermark on export, ever.
          </p>
          <div className="stat-line">
            {PLAYER_FORMATS.map((f) => (
              <span key={f} className="badge">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* the platform ledger: four capabilities, one column — not four identical cards */}
      <section
        className="fam-card reveal"
        style={{ marginTop: 26, padding: "8px 22px" }}
        aria-label="Platform capabilities"
      >
        {[
          {
            h: "Multi-format player",
            p: "MP4, HLS, DASH, FLV and WEBM plus audio and documents — the players embed into the iukka manifest.",
          },
          {
            h: "Layer editor",
            p: "Blend, mask and keyframe video, image and 3D on one timeline. Canvas-first, non-destructive, always reversible.",
          },
          {
            h: "Creative anchors",
            p: "3D studio, audio DAW, canvas editor, code IDE, themes and 16 icon sets couple as anchors of the same shell.",
          },
          {
            h: "Export",
            p: "Stills or entire timelines in MP4, WEBM, PNG sequences and GLB — batch, scriptable, watermark-free.",
          },
        ].map((f) => (
          <div
            key={f.h}
            className="fam-microrow"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(140px, .6fr) minmax(0, 1.7fr)",
              gap: 16,
              padding: "14px 0",
              alignItems: "start",
            }}
          >
            <h3 style={{ fontSize: "1.02rem", margin: 0 }}>{f.h}</h3>
            <p style={{ margin: 0, fontSize: ".92rem", color: "var(--sol-muted)" }}>{f.p}</p>
          </div>
        ))}
      </section>

      <section
        className="fam-card fam-card--s2"
        style={{
          marginTop: 20,
          display: "flex",
          flexWrap: "wrap",
          gap: 18,
          alignItems: "center",
          justifyContent: "space-between",
          padding: "clamp(22px, 3vw, 34px)",
        }}
      >
        <div style={{ maxWidth: 560 }}>
          <h2 style={{ fontSize: "clamp(1.2rem, 2.4vw, 1.7rem)", margin: "0 0 8px" }}>Load your first frame</h2>
          <p style={{ margin: 0, color: "var(--sol-muted)" }}>
            The play button above is visual — real versawase engine integration arrives with the player F-CAD.
          </p>
        </div>
        <span className="badge success">demo scope · player mock</span>
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
  { id: "3dstudio", ref: "F-CAD-016", desc: "3D viewport with materials and light" },
  { id: "audio", ref: "F-CAD-017", desc: "audio rack coupled to the timeline" },
  { id: "canvaseditor", ref: "F-CAD-018", desc: "painting and per-brush adjustment" },
  { id: "code_ide", ref: "F-CAD-019", desc: "keyframe and expression scripting" },
  { id: "themes", ref: "F-CAD-020", desc: "studio themes layered on the sol theme" },
  { id: "icons16", ref: "F-CAD-025", desc: "16 native icon sets" },
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
    toast.info(`Export ${kind.toUpperCase()} queued`, {
      description: "Simulated pipeline — the real render ships with the versawase engine.",
    });
    pushOSEvent({ title: "Export queued — cadria", note: `timeline → ${kind.toUpperCase()} (studio)`, kind: "action" });
    window.setTimeout(() => {
      setExporting(null);
      toast.success(`Export ${kind.toUpperCase()} ready`, {
        description: "No watermark — the file lands in the Gallery.",
      });
    }, 1800);
  }

  return (
    <>
      <PageSection
        eyebrow="cadria.devthink.pro · create editor"
        title="Studio"
        heading="h2"
        description="The canvas-first layer editor: video, image and 3D on the same timeline, always non-destructive — plus the anchor rack (3dstudio, audio, canvaseditor, code_ide, themes, icons16)."
        reveal
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 18, alignItems: "start", marginTop: 26 }}>
        {/* the dominant object: the layer editor under the rose light */}
        <section
          className="fam-card reveal grain"
          aria-labelledby="layers-h"
          style={{ ...DOMINANT_SURFACE, flex: "3 1 380px", minWidth: 0, padding: 22 }}
        >
          <div className="row between" style={{ marginBottom: 12 }}>
            <h2 id="layers-h" style={{ fontSize: "1.05rem", margin: 0 }}>
              Layers
            </h2>
            <span className="badge">
              {layers.filter((l) => l.visible).length}/{layers.length} visible
            </span>
          </div>

          <ul
            className="layer-list"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              maxHeight: "16rem",
              overflowY: "auto",
              margin: 0,
              padding: 0,
              listStyle: "none",
            }}
            aria-label="Layer list"
          >
            {layers.map((l) => (
              <li
                key={l.id}
                className="row between"
                style={{
                  padding: "10px 12px",
                  borderRadius: "4px",
                  border: `1px solid ${
                    l.id === selected
                      ? "color-mix(in srgb, var(--app-accent) 38%, transparent)"
                      : "var(--os-hairline-soft)"
                  }`,
                  background: l.id === selected ? "var(--os-active)" : "transparent",
                  boxShadow: l.id === selected ? "inset 3px 0 0 var(--app-accent)" : undefined,
                }}
              >
                <div className="row" style={{ gap: 10, flex: 1, minWidth: 0 }}>
                  <button
                    type="button"
                    className="icon-btn"
                    style={{ width: 44, height: 44 }}
                    aria-label={l.visible ? `Hide layer ${l.name}` : `Show layer ${l.name}`}
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
              </li>
            ))}
          </ul>

          {layer ? (
            <fieldset
              style={{
                border: 0,
                borderTop: "1px solid var(--os-hairline-soft)",
                marginTop: 14,
                padding: "14px 0 0",
                minInlineSize: "auto",
              }}
              aria-label={`Adjustments for layer ${layer.name}`}
            >
              <p className="eyebrow" style={{ marginBottom: 12 }}>
                {layer.name}
              </p>
              <div className="field">
                <label htmlFor="lay-op">Opacity — {layer.opacity}%</label>
                <input
                  id="lay-op"
                  type="range"
                  min={0}
                  max={100}
                  value={layer.opacity}
                  aria-label={`Opacity of layer ${layer.name}`}
                  onChange={(e) => patch(layer.id, { opacity: Number(e.target.value) })}
                />
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label htmlFor="lay-blend">Blend</label>
                <select
                  id="lay-blend"
                  className="input"
                  value={layer.blend}
                  onChange={(e) => patch(layer.id, { blend: e.target.value })}
                >
                  {["normal", "overlay", "screen", "multiply", "soft-light", "color-dodge"].map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                <p className="hint">Layer adjustments are non-destructive — the source is never altered.</p>
              </div>
            </fieldset>
          ) : null}
        </section>

        <div
          className="reveal"
          style={{
            flex: "2 1 300px",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: 20,
            animationDelay: "90ms",
          }}
        >
          <section className="fam-card fam-card--s2" style={{ padding: 22 }} aria-labelledby="anchors-h">
            <h2 id="anchors-h" style={{ fontSize: "1.05rem", marginBottom: 4 }}>
              Anchor rack
            </h2>
            <p className="small" style={{ marginTop: 0, marginBottom: 14 }}>
              Anchors couple tools around the same shell — F-CAD-016..025.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {ANCHORS.map((a) => (
                <div
                  key={a.id}
                  className="row between"
                  style={{ padding: "9px 0", borderBottom: "1px solid var(--os-hairline-soft)" }}
                >
                  <div>
                    <p className="strong" style={{ margin: 0, fontSize: ".92rem" }}>
                      {a.id}
                    </p>
                    <p className="tiny faint" style={{ margin: 0 }}>
                      {a.desc}
                    </p>
                  </div>
                  <span
                    className="badge mono"
                    style={{
                      color: "var(--app-accent)",
                      borderColor: "color-mix(in srgb, var(--app-accent) 45%, transparent)",
                    }}
                  >
                    {a.ref}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="fam-card fam-card--s2" style={{ padding: 22 }} aria-labelledby="export-h">
            <h2 id="export-h" style={{ fontSize: "1.05rem", marginBottom: 4 }}>
              Export
            </h2>
            <p className="small" style={{ marginTop: 0, marginBottom: 14 }}>
              Render the whole timeline or a single still — watermark-free, in batch or by script.
            </p>
            <div className="row">
              {(["mp4", "webm", "png", "glb"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  className="btn secondary small"
                  disabled={exporting !== null}
                  onClick={() => doExport(k)}
                >
                  {exporting === k ? "rendering…" : k.toUpperCase()}
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
  { id: "g4", title: "Versawase breakdown", kind: "doc", meta: "PDF · 12 pages", ph: "ph-2" },
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
    (v): v is string[] => Array.isArray(v) && v.every((x) => typeof x === "string"),
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GALLERY.filter(
      (g) =>
        (kind === "all" || g.kind === kind) &&
        (!q || g.title.toLowerCase().includes(q) || g.meta.toLowerCase().includes(q)),
    );
  }, [query, kind]);

  function toggleFav(id: string) {
    const isFav = favs.includes(id);
    setFavs((prevList) => (isFav ? prevList.filter((f) => f !== id) : [...prevList, id]));
    pushOSEvent({
      title: isFav ? "Removed from favorites — cadria" : "Favorite saved — cadria",
      note: GALLERY.find((g) => g.id === id)?.title ?? id,
      kind: "action",
    });
  }

  return (
    <>
      <PageSection
        eyebrow="cadria.devthink.pro · gallery"
        title="Gallery"
        heading="h2"
        description="Studio outputs: exported timelines, stills, meshes and documents. Favorites persist on your device."
        reveal
      />

      <div
        className="row between"
        style={{ marginTop: 26, marginBottom: 16 }}
        role="toolbar"
        aria-label="Gallery filters"
      >
        <div className="tabs" role="tablist" aria-label="Filter by type">
          {(["all", "video", "3d", "image", "doc"] as const).map((k) => (
            <button key={k} type="button" role="tab" aria-selected={kind === k} onClick={() => setKind(k)}>
              {k === "all" ? "all" : k}
            </button>
          ))}
        </div>
        <input
          className="input"
          type="search"
          style={{ minWidth: 220, width: "auto" }}
          placeholder="Search an item…"
          aria-label="Search the gallery"
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* the dominant frame + the compact rail: the showcase breaks the uniform grid */}
      {rows.length > 0 ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 18, alignItems: "stretch" }}>
          <article
            key={rows[0].id}
            className="fam-card fam-card--hover reveal grain proj"
            style={{ ...DOMINANT_SURFACE, flex: "2 1 420px", minWidth: 0 }}
            aria-label={`${rows[0].title} — ${rows[0].meta}`}
          >
            <div className={`ph ${rows[0].ph}`} style={{ height: 220 }} aria-hidden="true" />
            <div style={{ padding: 16 }}>
              <div className="row between" style={{ marginBottom: 8 }}>
                <h3 style={{ margin: 0, fontSize: "1.05rem" }}>{rows[0].title}</h3>
                <span className={`badge ${GALLERY_TONE[rows[0].kind]}`}>{rows[0].kind}</span>
              </div>
              <div className="row between">
                <span className="tiny faint mono" style={{ color: "var(--app-accent)" }}>
                  {rows[0].meta}
                </span>
                <button
                  type="button"
                  className="icon-btn"
                  style={{ width: 44, height: 44 }}
                  aria-pressed={favs.includes(rows[0].id)}
                  aria-label={
                    favs.includes(rows[0].id)
                      ? `Remove ${rows[0].title} from favorites`
                      : `Save ${rows[0].title} to favorites`
                  }
                  onClick={() => toggleFav(rows[0].id)}
                >
                  <Star
                    size={15}
                    strokeWidth={1.8}
                    aria-hidden="true"
                    style={{
                      color: favs.includes(rows[0].id) ? "var(--app-accent)" : "inherit",
                      fill: favs.includes(rows[0].id) ? "var(--app-accent)" : "none",
                    }}
                  />
                </button>
              </div>
            </div>
          </article>

          <div
            className="fam-card fam-card--s2 reveal"
            style={{
              flex: "3 1 340px",
              minWidth: 0,
              padding: "6px 16px",
              animationDelay: "90ms",
              alignSelf: "stretch",
            }}
          >
            {rows.slice(1).map((g) => (
              <article
                key={g.id}
                className="fam-microrow"
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto minmax(0, 1fr) auto auto",
                  gap: 12,
                  alignItems: "center",
                  padding: "11px 0",
                }}
                aria-label={`${g.title} — ${g.meta}`}
              >
                <span
                  className={`ph ${g.ph}`}
                  style={{ width: 64, height: 42, borderRadius: 4, border: "1px solid var(--os-hairline-soft)" }}
                  aria-hidden="true"
                />
                <div style={{ minWidth: 0 }}>
                  <p className="strong" style={{ margin: 0, fontSize: ".95rem" }}>
                    {g.title}
                  </p>
                  <span className="tiny faint mono">{g.meta}</span>
                </div>
                <span className={`badge ${GALLERY_TONE[g.kind]}`}>{g.kind}</span>
                <button
                  type="button"
                  className="icon-btn"
                  style={{ width: 44, height: 44 }}
                  aria-pressed={favs.includes(g.id)}
                  aria-label={favs.includes(g.id) ? `Remove ${g.title} from favorites` : `Save ${g.title} to favorites`}
                  onClick={() => toggleFav(g.id)}
                >
                  <Star
                    size={15}
                    strokeWidth={1.8}
                    aria-hidden="true"
                    style={{
                      color: favs.includes(g.id) ? "var(--app-accent)" : "inherit",
                      fill: favs.includes(g.id) ? "var(--app-accent)" : "none",
                    }}
                  />
                </button>
              </article>
            ))}
          </div>
        </div>
      ) : null}
      {rows.length === 0 ? (
        <div className="fam-card" style={{ marginTop: 16 }}>
          <FamilyEmpty
            app={appMeta("cadria") as NonNullable<ReturnType<typeof appMeta>>}
            motion="reel"
            title={`Nothing matching “${query}” under this filter`}
            line="The gallery answers from the studio outputs — loosen the type filter or clear the search to see the six seeded items again."
            actionLabel="Clear the filters"
            onAction={() => {
              setQuery("");
              setKind("all");
            }}
          />
        </div>
      ) : null}

      <section className="fam-card fam-card--s2" style={{ marginTop: 20, maxWidth: 640, padding: 22 }}>
        <h2 style={{ fontSize: "1.05rem", marginTop: 0 }}>Demo scope</h2>
        <p style={{ margin: 0 }}>
          Showcase items are static; the favorites are yours (persisted via <code>useStoredState</code>). Real exports
          arrive with the <code>versawase</code> engine pipeline (F-CAD-016..025).
        </p>
      </section>
    </>
  );
}

/* -------------------------------- APP ---------------------------------- */

export function CadriaApp({ os }: { os: OSHandle }) {
  const meta = appMeta("cadria");
  if (!meta) throw new Error("the cadria meta is missing from the catalog");
  const [chatOpen, setChatOpen] = useState(true);
  const page = meta.pages.some((p) => p.id === os.view.page) ? os.view.page : "player";

  return (
    <div className="fam-view" style={accentVars(familyAccentOf(meta.id, meta.accent))}>
      <FamilyStyles />
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
            <FamilyHero
              app={meta}
              tagline="Player, editor and studio on the versawase engine — video, image and 3D in one creative shell."
              stats={
                [
                  { label: "media extensions", value: "24", accent: true },
                  { label: "creative anchors — F-CAD", value: "6" },
                  { label: "export lanes, watermark-free", value: "4" },
                  { label: "engine", value: "versawase" },
                ] as FamilyStat[]
              }
              glyphMotion="reel"
              status="studio mounted"
            />
            {page === "player" ? <PlayerPage /> : page === "studio" ? <StudioPage /> : <GalleryPage />}
          </div>
          {chatOpen ? (
            <div className="chat-panel">
              <AuraChat persona={PERSONAS.cadria} storageKey="dt-chat-cadria-v1" appLabel="cadria" />
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
