/**
 * GalleryWall.tsx — the composite winget of the gallery remount (the
 * detailed engine wave): the whole render wall the retired page carried,
 * rebuilt as ONE mount so the page anchor stays the thin face the
 * construction law pins on it. The wall owns the real engine lanes the old
 * face rode:
 *
 * - the generations read straight off the local gateway
 *   (`listGatewayProjects(60)`), filtered by style chips built from the
 *   imagestyles table (the same styles the studio generates with);
 * - every thumbnail is the gateway's own renderSvg output fetched per item
 *   (`fetchGatewayRender`) — the quiet placeholder glyph when a frame can't
 *   be fetched, never a fake image;
 * - deletes ride `deleteGatewayProject` when the gateway is online, the
 *   toast answers the honest refusal codes.
 *
 * The arming beat rides the face prop: while the wall loads (the first read
 * of the route) the route answers the construction face it wore. Every word
 * rides the label store; the reveal stagger answers the shared observer the
 * mutation watch of the reveal runtime already catches.
 */

import { DeleteRegular, ImageOffRegular, WifiOffRegular } from "@fluentui/react-icons";
import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  deleteGatewayProject,
  fetchGatewayRender,
  type GatewayClientError,
  type GatewayProject,
  listGatewayProjects,
} from "../../gateway.ts";
import { imageStyles } from "../../image.ts";
import { label } from "../../labels.ts";
import { useToast } from "../toast/Toast.tsx";
import { EmptyState } from "./ShellEmptystate.tsx";

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
      className="gal-thumb"
      role="img"
      aria-label={
        svg ? label("gallery.thumbAria").replace("{id}", id) : label("gallery.thumbPlaceholder").replace("{id}", id)
      }
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

/** the props of the wall mount. */
type GalleryWallProps = {
  /** the face the route answers while the wall arms (the loading beat of
   * the first read — the honest arming state, never a fake card). */
  face: ReactNode;
};

/**
 * GalleryWall — the render wall over the real gateway lane.
 *
 * @param props the arming face of the route.
 * @returns the wall element, or the arming face while the gateway answers.
 */
export function GalleryWall({ face }: GalleryWallProps) {
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
        toast.show(label("gallery.deletedToast"), "success");
      } catch (error) {
        const status = (error as GatewayClientError).status ?? 0;
        toast.show(
          status === 0 ? label("gallery.offlineToast") : label("gallery.refusedToast").replace("{status}", String(status)),
          "error",
        );
      } finally {
        setDeleting(null);
      }
    },
    [toast],
  );

  // the arming beat: the gateway holds the first read — the route answers
  // the face it wore until the engine's own rows (or its own honest offline
  // state) land, never a fabricated card
  if (state === "loading") return <>{face}</>;

  return (
    <>
      {/* FILTER ROW — style chips from the imagestyles table, all first */}
      <section aria-labelledby="filter-h" style={{ marginTop: 26 }}>
        <h2 id="filter-h" className="mono-label" style={{ margin: "0 0 10px", fontWeight: 600 }}>
          {label("gallery.filterHead")}
        </h2>
        <fieldset
          className="reveal"
          aria-label={label("gallery.filterAria")}
          style={{ border: 0, margin: 0, padding: 0, display: "flex", flexWrap: "wrap", gap: 8 }}
        >
          {["all", ...STYLE_NAMES].map((name) => (
            <button
              key={name}
              type="button"
              className="chip"
              aria-pressed={filter === name}
              onClick={() => setFilter(name)}
              style={filter === name ? { borderColor: "var(--rose-500)", color: "var(--rose-500)" } : { borderRadius: 4 }}
            >
              {name === "all" ? label("gallery.filterAll") : name}
            </button>
          ))}
        </fieldset>
      </section>

      {/* THE WALL — flat hairline cards, the gateway's own renders, honest states */}
      <section aria-labelledby="wall-h" style={{ marginTop: 24 }}>
        <h2 id="wall-h" className="sr-only">
          {label("gallery.wallSr")}
        </h2>
        {state === "offline" && (
          <EmptyState
            icon={WifiOffRegular}
            title={label("gallery.offlineTitle")}
            line={label("gallery.offlineLine")}
            action={
              <button type="button" className="btn btn--ghost" style={{ minHeight: 40 }} onClick={() => load(() => true)}>
                {label("gallery.retry")}
              </button>
            }
          />
        )}
        {state === "online" && projects.length === 0 && (
          <EmptyState
            icon={ImageOffRegular}
            title={label("gallery.emptyTitle")}
            line={label("gallery.emptyLine")}
            action={
              <Link href="/studio" className="btn" style={{ minHeight: 40 }}>
                {label("gallery.openStudio")}
              </Link>
            }
          />
        )}
        {state === "online" && projects.length > 0 && visible.length === 0 && (
          <EmptyState
            icon={ImageOffRegular}
            title={label("gallery.filteredTitle").replace("{style}", filter)}
            line={label("gallery.filteredLine")}
            action={
              <button type="button" className="btn btn--ghost" style={{ minHeight: 40 }} onClick={() => setFilter("all")}>
                {label("gallery.showAll")}
              </button>
            }
          />
        )}
        {visible.length > 0 && (
          <div className="gal-grid reveal" style={{ marginTop: 8 }}>
            {visible.map((project) => (
              <article
                key={project.id}
                className="gal-card"
                aria-label={label("gallery.cardAria").replace("{style}", project.style).replace("{id}", project.id)}
              >
                <RenderThumb id={project.id} />
                <div className="gal-card__body">
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
                      {label("gallery.open")}
                    </Link>
                    <button
                      type="button"
                      className="btn btn--quiet"
                      style={{ minHeight: 36, padding: "0 12px", fontSize: "0.85rem", color: "var(--err)" }}
                      disabled={deleting === project.id}
                      onClick={() => void onDelete(project)}
                    >
                      {deleting === project.id ? <DeleteRegular fontSize={14} aria-hidden="true" /> : label("gallery.delete")}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default GalleryWall;
