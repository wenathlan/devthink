/** Style: DevThink Terminal Atelier — the family grid ported from the static site; the roster renders from the DB layer. */
import { Compass, SquareArrowOutUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { ControlShell } from "@/control.shell";
import { familySites, recipeGallery, type FamilySite, type Recipe } from "@/catalog";

const gradetone: Record<Recipe["grade"], string> = {
  basic: "var(--dt-blue)",
  medium: "#e0a34a",
  advanced: "#ff7d66",
};

export default function Explore() {
  const [sites, setSites] = useState<FamilySite[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    void familySites().then(setSites);
    void recipeGallery().then(setRecipes);
  }, []);

  return (
    <ControlShell
      eyebrow="the family grid"
      title="Explore"
      summary="Explore the DevThink family: subdomain sites, engines and runnable examples."
    >
      <p style={{ margin: 0, maxWidth: 620, color: "#9c948b", lineHeight: 1.7 }}>
        Five sites, one platform. Each product lives on its own subdomain with its own interface — the engines stay
        shared.
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

      <section className="control-note" style={{ display: "grid", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <Compass size={15} style={{ color: "var(--dt-orange)" }} />
          <h2 style={{ margin: 0, fontSize: 15, color: "var(--dt-text)" }}>examples gallery</h2>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="control-table">
            <thead>
              <tr>
                <th>recipe</th>
                <th>family</th>
                <th>grade</th>
                <th>duration</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map((recipe) => (
                <tr key={recipe.name}>
                  <td>{recipe.name}</td>
                  <td>{recipe.family}</td>
                  <td>
                    <span className="control-badge" style={{ color: gradetone[recipe.grade] }}>
                      {recipe.grade}
                    </span>
                  </td>
                  <td>{recipe.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </ControlShell>
  );
}
