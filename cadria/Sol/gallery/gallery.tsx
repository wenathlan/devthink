/**
 * gallery page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

import { Trash2 } from "lucide-react";
// # Gallery — the render wall (design doctrine pass): the generations read
// straight off the local gateway, filtered by style chips built from the
// imagestyles table (the same styles the studio generates with), every
// thumbnail the gateway's own renderSvg output fetched per item — the quiet
// placeholder glyph when a frame can't be fetched, never a fake image.
// deletes ride DELETE /api/projects/:id when the gateway is online. flat
// hairline cards on one grid, honest empty states everywhere.
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { imageStyles } from "../../imagestyles.ts";
import {
  deleteGatewayProject,
  fetchGatewayRender,
  type GatewayClientError,
  type GatewayProject,
  listGatewayProjects,
} from "../shell/gatewayclient.ts";
import { Shell } from "../shell/Shell.tsx";
import { useToast } from "../toast/Toast.tsx";

/** how many generations the wall asks for (the gateway clamps 1-200). */
const WALL_LIMIT = 60;

/** the style chips: every name in the imagestyles table, computed once. */
const STYLE_NAMES: readonly string[] = imageStyles().map((style) => style.name);

/** the lifecycle of the wall. */
type WallState = "loading" | "online" | "offline";

/** rescales the gateway's svg to its card and hides it from the a11y tree (the wrapper carries the label). */
function fitArtSvg(svg: string): string {
  return svg.replace("<svg ", '<svg aria-hidden="true" style="width:100%;height:auto;display:block" ');
}

/** the honest stand-in: a quiet rose frame glyph, drawn, never a fake render. */
function PlaceholderGlyph() {
  return (
    <svg viewBox="0 0 48 48" width="44" height="44" aria-hidden="true" fill="none" strokeWidth="1.5">
      <rect x="4" y="4" width="40" height="40" rx="4" stroke="var(--line-strong)" strokeDasharray="4 4" />
      <path
        d="M14 32 L23 19 L30 27 L34 23 L40 32"
        stroke="var(--rose-500)"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="33" cy="14" r="2.5" stroke="var(--rose-500)" />
    </svg>
  );
}

/** the flat hairline card styles (tokens only, radius 4-8, no shadow). */
const CARD_STYLE = {
  border: "1px solid var(--line)",
  borderRadius: "var(--radius-lg)",
  overflow: "hidden",
  background: "var(--surface-1)",
} as const;

const THUMB_STYLE = {
  aspectRatio: "1 / 1",
  display: "grid",
  placeItems: "center",
  padding: 10,
  background: "var(--surface-2)",
  borderBottom: "1px solid var(--line)",
} as const;

/** one thumbnail: the gateway's rendered frame, or the placeholder glyph until/if it lands. */
function RenderThumb({ id }: { id: string }) {
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    setSvg(null);
    fetchGatewayRender(id)
      .then((text) => {
        if (live) setSvg(text);
      })
      .catch(() => {
        if (live) setSvg(null); // the glyph stays — the honest absence
      });
    return () => {
      live = false;
    };
  }, [id]);

  return (
    <div
      style={THUMB_STYLE}
      role="img"
      aria-label={svg ? `rendered frame ${id}` : `frame ${id} not fetched — placeholder glyph`}
    >
      {svg ? (
        // biome-ignore lint/security/noDangerouslySetInnerHtml: the svg is the gateway's own renderSvg serializer output (engine IR, hex-guarded colors, no user input) — the documented injection point, as on the intro demo
        <div style={{ width: "100%", lineHeight: 0 }} dangerouslySetInnerHTML={{ __html: fitArtSvg(svg) }} />
      ) : (
        <PlaceholderGlyph />
      )}
    </div>
  );
}

export default function Gallery() {
  const toast = useToast();
  const [state, setState] = useState<WallState>("loading");
  const [projects, setProjects] = useState<readonly GatewayProject[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [deleting, setDeleting] = useState<string | null>(null);

  /** loads the wall off the gateway; failure lands in the honest offline state. */
  const load = useCallback((live: () => boolean): void => {
    setState("loading");
    listGatewayProjects(WALL_LIMIT)
      .then((rows) => {
        if (!live()) return;
        setProjects(rows);
        setState("online");
      })
      .catch(() => {
        if (live()) setState("offline");
      });
  }, []);

  useEffect(() => {
    let live = true;
    load(() => live);
    return () => {
      live = false;
    };
  }, [load]);

  const visible = useMemo(
    () => (filter === "all" ? projects : projects.filter((project) => project.style === filter)),
    [projects, filter],
  );

  /** deletes one generation through the gateway; the failure path is honest, nothing is faked. */
  const onDelete = useCallback(
    async (project: GatewayProject) => {
      setDeleting(project.id);
      try {
        await deleteGatewayProject(project.id);
        setProjects((current) => current.filter((row) => row.id !== project.id));
        toast.show("render deleted from the gateway", "success");
      } catch (error) {
        const status = (error as GatewayClientError).status ?? 0;
        toast.show(
          status === 0 ? "gateway offline — nothing deleted" : `the gateway refused the delete (${status})`,
          "error",
        );
      } finally {
        setDeleting(null);
      }
    },
    [toast],
  );

  return (
    <Shell>
      <section aria-labelledby="gallery-h">
        <p className="eyebrow reveal">cadria · gallery</p>
        <h1 id="gallery-h" className="page-title reveal" style={{ fontSize: "clamp(1.9rem, 4vw, 2.8rem)" }}>
          the render wall
        </h1>
        <p className="reveal lede" style={{ maxWidth: 600 }}>
          every frame the engine rendered through the gateway, as the gateway reports it — no stand-ins, no cached
          pretend art.
        </p>
      </section>

      {/* FILTER ROW — style chips from the imagestyles table, all first */}
      <section aria-labelledby="filter-h" style={{ marginTop: 26 }}>
        <h2 id="filter-h" className="mono-label" style={{ margin: "0 0 10px", fontWeight: 600 }}>
          filter by style
        </h2>
        <fieldset
          className="reveal"
          aria-label="filter the wall by generation style"
          style={{ border: 0, margin: 0, padding: 0, display: "flex", flexWrap: "wrap", gap: 8 }}
        >
          {["all", ...STYLE_NAMES].map((name) => (
            <button
              key={name}
              type="button"
              className="chip"
              aria-pressed={filter === name}
              onClick={() => setFilter(name)}
              style={
                filter === name ? { borderColor: "var(--rose-500)", color: "var(--rose-500)" } : { borderRadius: 4 }
              }
            >
              {name}
            </button>
          ))}
        </fieldset>
      </section>

      {/* THE WALL — flat hairline cards, the gateway's own renders, honest states */}
      <section aria-labelledby="wall-h" style={{ marginTop: 24 }}>
        <h2 id="wall-h" className="sr-only">
          the wall
        </h2>
        {state === "loading" && (
          <p className="mono-label" role="status" style={{ padding: "16px 4px" }}>
            reading the gateway…
          </p>
        )}
        {state === "offline" && (
          <div
            className="ledger-row"
            style={{ borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}
          >
            <span className="ledger-no" aria-hidden="true">
              --
            </span>
            <div className="ledger-main">
              <p className="ledger-text">
                gateway offline — the wall reads the local generation store, and it isn't answering.
              </p>
            </div>
            <button type="button" className="btn btn--quiet" style={{ minHeight: 36 }} onClick={() => load(() => true)}>
              retry
            </button>
          </div>
        )}
        {state === "online" && projects.length === 0 && (
          <p
            className="mono-label"
            style={{ padding: "16px 4px", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}
          >
            the queue is open — generate something in the <Link href="/studio">studio</Link> and it lands here.
          </p>
        )}
        {state === "online" && projects.length > 0 && visible.length === 0 && (
          <p
            className="mono-label"
            style={{ padding: "16px 4px", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}
          >
            no renders in the {filter} style yet — the chips only filter what the gateway really holds.
          </p>
        )}
        {visible.length > 0 && (
          <div
            className="reveal"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
              gap: 16,
              marginTop: 8,
            }}
          >
            {visible.map((project) => (
              <article key={project.id} style={CARD_STYLE} aria-label={`${project.style} render ${project.id}`}>
                <RenderThumb id={project.id} />
                <div style={{ padding: "12px 14px 14px" }}>
                  <h3 style={{ margin: 0, fontSize: "0.98rem" }}>{project.style}</h3>
                  <p className="mono-label" style={{ margin: "4px 0 0", overflowWrap: "anywhere" }}>
                    {project.id}
                  </p>
                  <p className="mono-label" style={{ margin: "8px 0 0" }}>
                    {project.bpm} bpm · {project.key} · {Math.max(1, Math.round(project.durationMs / 1000))} s
                  </p>
                  <div className="row" style={{ marginTop: 12, gap: 10 }}>
                    <Link
                      className="btn btn--quiet"
                      style={{ minHeight: 36, padding: "0 12px", fontSize: "0.85rem" }}
                      href={`/player?id=${encodeURIComponent(project.id)}`}
                    >
                      open
                    </Link>
                    <button
                      type="button"
                      className="btn btn--quiet"
                      style={{ minHeight: 36, padding: "0 12px", fontSize: "0.85rem", color: "var(--err)" }}
                      disabled={deleting === project.id}
                      onClick={() => void onDelete(project)}
                    >
                      {deleting === project.id ? <Trash2 size={14} aria-hidden="true" /> : "delete"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </Shell>
  );
}
