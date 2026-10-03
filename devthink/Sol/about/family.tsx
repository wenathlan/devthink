/**
 * family.tsx — the loose family component of the about folder. The family
 * sites grid reads the same family.sites accessor the explore surface reads,
 * so the roster is answered by the paired database (or the reviewed seeds)
 * and is never restated on the institutional page.
 */
import { SquareArrowOutUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { familySites, type FamilySite } from "../../catalog";

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
      <div className="family-grid">
        {sites.map((site) => (
          <a key={site.host} className="family-card" href={site.host}>
            <span className="family-card__host">{site.host.replace("https://", "")}</span>
            <strong>{site.name}</strong>
            <p>{site.blurb}</p>
            <span className="family-card__cta">
              open site
              <SquareArrowOutUpRight size={12} />
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
