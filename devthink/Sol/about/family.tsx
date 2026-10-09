/**
 * family.tsx — the loose family component of the about folder. The family
 * sites render as a specimen wall, not a uniform card grid: a twelve-column
 * field where each tile takes a different span (one dominant specimen, the
 * rest varied), every tile carries the identity accent dot of its app and
 * the roster is answered by the same family.sites accessor the explore
 * surface reads, so it is never restated on the institutional page.
 */

import { SquareArrowOutUpRight } from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { type FamilySite, familySites } from "../../catalog";

/** the family identity accents of the design campaign identity table,
 * matched by host substring; an unknown host falls back to the platform
 * blue — presentation only, the roster itself stays the catalog's answer */
const ACCENTS: ReadonlyArray<readonly [string, string]> = [
  ["argan", "#1DCF64"],
  ["cadria", "#f472b6"],
  ["debonair", "#a78bfa"],
  ["stealth", "#f87171"],
  ["stealhead", "#f87171"],
  ["forge", "#fb923c"],
  ["foundry", "#d97706"],
  ["vault", "#eab308"],
  ["getry", "#60a5fa"],
  ["saddle", "#d6b483"],
];

function accentFor(host: string): string {
  const lower = host.toLowerCase();
  for (const [needle, accent] of ACCENTS) {
    if (lower.includes(needle)) return accent;
  }
  return "var(--dt-blue)";
}

const MONO = "var(--font-mono, var(--dt-mono))";
const hostStyle = { color: "var(--dt-faint)", font: `500 10px ${MONO}`, letterSpacing: ".08em" } as const;

export function AboutFamily() {
  const [sites, setSites] = useState<FamilySite[]>([]);

  useEffect(() => {
    void familySites().then(setSites);
  }, []);

  return (
    <section className="inst-section">
      <h2>The family</h2>
      <p className="inst-section__intro">
        One platform, several named sites. Each product lives on its own subdomain with its own interface, while the
        engines stay shared.
      </p>
      <div className="family-wall">
        {sites.map((site, index) => {
          const tileStyle = { "--tile-accent": accentFor(site.host) } as CSSProperties;
          return (
            <a
              key={site.host}
              className={index === 0 ? "family-wall__tile family-wall__tile--dominant" : "family-wall__tile"}
              href={site.host}
              style={tileStyle}
            >
              <span className="family-wall__dot" aria-hidden="true" />
              <span className="family-wall__host" style={hostStyle}>
                {site.host.replace("https://", "")}
              </span>
              <strong>{site.name}</strong>
              <p>{site.blurb}</p>
              <span className="family-card__cta">
                open site
                <SquareArrowOutUpRight size={12} />
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
