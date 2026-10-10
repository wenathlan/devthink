/**
 * gallery page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// # Gallery — the render wall (campaign v3 · r3-cadria): project cards from
// the data layer filtered by discipline with the pill tabs — ONE raised
// featured piece leading the wall, the art headers under the identity-tint
// light on hover and the metadata in tabular numerals.
import { useEffect, useState } from "react";
import { listOptionChoices, listProjects } from "../../catalog.ts";
import type { GalleryDiscipline, GalleryProject, OptionChoice } from "../../versawase.ts";
import { projectsByDiscipline, toneClass } from "../../versawase.ts";
import { type NavLink, Shell } from "../shell/Shell.ts";

const FOOTER_LINKS: readonly NavLink[] = [
  { label: "Player", href: "/player" },
  { label: "Studio", href: "/studio" },
  { label: "Gallery", href: "/gallery" },
  { label: "Settings", href: "/settings" },
];

export default function Gallery() {
  const [projects, setProjects] = useState<readonly GalleryProject[]>([]);
  const [filters, setFilters] = useState<readonly OptionChoice[]>([]);
  const [active, setActive] = useState<GalleryDiscipline | "all">("all");

  useEffect(() => {
    let live = true;
    listProjects().then((rows) => {
      if (live) setProjects(rows);
    });
    listOptionChoices("gallery-filter").then((rows) => {
      if (live) setFilters(rows);
    });
    return () => {
      live = false;
    };
  }, []);

  const visible = projectsByDiscipline(projects, active);

  return (
    <Shell
      name="cadria"
      contained
      cta={{ label: "Open studio", href: "/studio" }}
      footerLinks={FOOTER_LINKS}
      domain="cadria.devthink.pro"
    >
      <p className="eyebrow reveal">cadria · gallery</p>
      <h1 className="reveal page-title">Gallery</h1>
      <p className="reveal lede" style={{ maxWidth: 600 }}>
        Recent renders from the studio workspace. Filter by discipline — every project opens back into the anchor that
        made it.
      </p>

      <div className="reveal filter-bar">
        <div className="tabs" role="toolbar" aria-label="Filter projects by type">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              aria-pressed={active === filter.value}
              onClick={() => setActive(filter.value as GalleryDiscipline | "all")}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="wall">
        {visible.map((project, index) => (
          <article key={project.title} className={`glass glass-hover proj reveal${index === 0 ? " is-featured" : ""}`}>
            <div className={`ph ph-${project.art}`} aria-hidden="true" />
            <div className="pb">
              <h3>{project.title}</h3>
              <p>{project.detail}</p>
              <div className="meta">
                <span className={`badge${toneClass(project.tone)}`}>{project.discipline}</span>
                <code>{project.format}</code>
              </div>
            </div>
          </article>
        ))}
      </div>

      <p hidden={visible.length > 0} style={{ marginTop: 24, color: "var(--sol-faint)" }}>
        No projects of this type yet — the queue is open.
      </p>
    </Shell>
  );
}
