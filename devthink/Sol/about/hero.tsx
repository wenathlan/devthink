/**
 * hero.tsx — the loose hero component of the about folder. The opening
 * statement of the institutional surface: one mono eyebrow in the Sol amber
 * signal, one Space Grotesk display line and one lead paragraph. The skeleton
 * (eyebrow, display, lead) belongs to the page; the narrative rows below it
 * come from the catalog.
 */
export function AboutHero() {
  return (
    <header className="inst-hero">
      <p className="inst-hero__eyebrow">the devthink platform</p>
      <h1>An operating system for development work.</h1>
      <p className="inst-hero__lead">
        DevThink runs as one system: the CLI, the local gateway and the browser surface share a catalog, a configuration
        and a local store. This page describes what the platform is, the family it ships and the principles it follows.
      </p>
    </header>
  );
}
