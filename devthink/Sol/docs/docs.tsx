/**
 * docs page anchor — layer 3 of the anchor architecture. The file carrying
 * the folder's own name is the path manager of the page: it imports the
 * loose components beside it, mounts the page and re-exports the public
 * component surface. Only the theme anchor (Sol/Sol.tsx) and the window
 * registry (Sol/panel/workspace.tsx) consume this file.
 *
 * Docs — the documentation app in the Windows 11 grammar: a nav pane beside
 * the content deck, hairline cards, the copyable command block and the
 * module rows the catalog serves. The old editorial pass (the shader stage,
 * the film grain, the folio heads) is retired — this body is the template
 * every subapp follows into the window contract. The docs skin keeps the
 * neutral scheme of the kit (the windows light accent rides only the
 * active-indicator pill) while the touch and focus law reaches the nav rows
 * and the copy action — see the docs skins at the tail of sol.css.
 */
import { useEffect, useState } from "react";
import { coreModuleTable, osAppLabels, type CoreModule } from "../../catalog";
import { ShellChrome } from "@/shell/ShellChrome";
import { DocsNav, type DocsSection } from "./nav.tsx";
import { DocsCard, DocsCode } from "./card.tsx";
import { DocsModules } from "./modules.tsx";

const endpoints = ["GET /health", "GET /models", "POST /chat"];

/** the window title rides the catalog label row, never a hardcoded literal
 * (the bare id keeps the heading honest if the row is missing). */
const DOCS_LABEL = osAppLabels().docs;

const sections: readonly DocsSection[] = [
  { id: "quickstart", label: "Quickstart" },
  { id: "boundary", label: "Boundary" },
  { id: "http", label: "HTTP" },
  { id: "modules", label: "Modules" },
];

/** The docs app: the Windows body when embedded (the desktop window hosts
 * it without the shell), the full surface with the taskbar on the route. */
export default function Docs({ embedded }: { embedded?: boolean }) {
  const [modules, setModules] = useState<CoreModule[]>([]);
  const [section, setSection] = useState<DocsSection["id"]>("quickstart");

  useEffect(() => {
    void coreModuleTable().then(setModules);
  }, []);

  return (
    <main
      className="dtw-app dtw-docs"
      style={embedded ? { height: "100%", overflow: "auto" } : undefined}
    >
      {!embedded && <ShellChrome />}
      <div className="dtw-body">
        <DocsNav sections={sections} active={section} onSelect={setSection} />
        <div className="dtw-content">
          <h1 className="dtw-title">{DOCS_LABEL?.name ?? "Docs"}</h1>

          {section === "quickstart" ? (
            <DocsCard title="Quickstart">
              <p className="dtw-copy">Install the CLI, init the workspace, open the help</p>
              <DocsCode lines={["npm install --global @wenathlan/devthink", "devthink init", "devthink --help"]} />
              <p className="dtw-copy">
                Preferences ride <code>devthink.json</code>. Credentials ride <code>auth.json</code>.
              </p>
            </DocsCard>
          ) : null}

          {section === "boundary" ? (
            <DocsCard title="Boundary">
              <p className="dtw-copy">Provider neutral CLI. Local sessions, streaming, plugins, loopback API.</p>
              <p className="dtw-copy">User provided keys only. No cookie capture, no captcha bypass.</p>
            </DocsCard>
          ) : null}

          {section === "http" ? (
            <DocsCard title="HTTP">
              <p className="dtw-copy">The server binds the loopback. The port is drawn when none is set.</p>
              <ul className="dtw-rows">
                {endpoints.map((endpoint) => (
                  <li key={endpoint} className="dtw-row">
                    {endpoint}
                  </li>
                ))}
              </ul>
            </DocsCard>
          ) : null}

          {section === "modules" ? <DocsModules modules={modules} /> : null}
        </div>
      </div>
    </main>
  );
}
