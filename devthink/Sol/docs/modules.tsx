/**
 * modules.tsx — the module rows of the docs app: the catalog table as
 * hairline rows, one row per core module with its name in mono and its
 * responsibility beside it. Loose component of the docs page.
 */
import type { CoreModule } from "../../catalog";

export function DocsModules({ modules }: { modules: CoreModule[] }) {
  return (
    <section className="dtw-docs__card">
      <h2 className="dtw-docs__cardtitle">Modules</h2>
      {modules.length === 0 ? (
        <p className="dtw-docs__copy">The catalog has not answered yet</p>
      ) : (
        <ul className="dtw-docs__rows">
          {modules.map((module) => (
            <li key={module.name} className="dtw-docs__row">
              <code>{module.name}</code>
              <span>{module.role}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
