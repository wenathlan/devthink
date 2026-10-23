/**
 * modules.tsx — the module rows of the docs app: the catalog table as
 * hairline rows, one row per core module with its name in mono and its
 * responsibility beside it. Loose component of the docs page.
 */
import type { CoreModule } from "../../catalog";
import { osText } from "../../oslabels.ts";

export function DocsModules({ modules }: { modules: CoreModule[] }) {
  return (
    <section className="dtw-card">
      <h2 className="dtw-cardtitle">{osText("docs.section.modules")}</h2>
      {modules.length === 0 ? (
        <p className="dtw-copy">{osText("docs.modules.empty")}</p>
      ) : (
        <ul className="dtw-rows">
          {modules.map((module) => (
            <li key={module.name} className="dtw-row">
              <code>{module.name}</code>
              <span>{module.role}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
