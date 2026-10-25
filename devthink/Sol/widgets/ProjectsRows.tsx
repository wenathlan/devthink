/**
 * rows.tsx — the workspace rows of the projects app: hairline rows
 * with the real compact id, the session count and the update time, the most
 * recent one leading. Loose component of the projects page.
 */
import { AppsRegular, ArrowSyncRegular } from "@fluentui/react-icons";
import { osText } from "../../oslabels.ts";

type Workspace = { id: string; title: string; updatedAt: string; sessionCount: number };

export function ProjectRows({
  rows,
  loaded,
  paired,
  onRefresh,
}: {
  rows: readonly Workspace[];
  loaded: boolean;
  paired: boolean;
  onRefresh: () => void;
}) {
  return (
    <>
      <p className="dtw-note">
        <span>{paired ? osText("projects.note.paired") : osText("projects.note.local")}</span>
        <span>{osText("projects.note.ids")}</span>
      </p>
      <section className="dtw-card">
        <h2 className="dtw-cardtitle">
          <AppsRegular fontSize={15} aria-hidden="true" />
          {osText("projects.card.title")}
          <span className="dtw-navrow__count">{rows.length}</span>
          <button type="button" className="dtw-action" onClick={onRefresh} aria-label={osText("projects.refresh.aria")}>
            <ArrowSyncRegular fontSize={13} aria-hidden="true" />
            {osText("projects.refresh")}
          </button>
        </h2>
        {rows.length === 0 ? (
          <p className="dtw-copy">{loaded ? osText("projects.empty") : osText("projects.loading")}</p>
        ) : (
          <ul className="dtw-projects__rows">
            {rows.map((workspace, index) => (
              <li key={workspace.id} className="dtw-projects__row" data-latest={index === 0 ? "true" : undefined}>
                <div className="dtw-projects__body">
                  <h3>{workspace.title}</h3>
                  <p>
                    <code>{workspace.id}</code>
                    {osText("projects.session").replace("{count}", String(workspace.sessionCount))}
                    {workspace.sessionCount === 1 ? "" : "s"}
                  </p>
                </div>
                <time className="dtw-projects__time">{new Date(workspace.updatedAt).toLocaleString()}</time>
                {index === 0 ? <span className="dtw-projects__latest">{osText("projects.latest")}</span> : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
