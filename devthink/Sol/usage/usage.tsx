/**
 * usage page anchor — layer 3 of the anchor architecture. The file carrying
 * the folder's own name is the path manager of the page: it imports the
 * loose components beside it, mounts the page and re-exports the public
 * component surface. Only the theme anchor (Sol/Sol.tsx) and the window
 * registry (Sol/panel/workspace.tsx) consume this file.
 *
 * Usage — the activity ledger in the Windows 11 grammar: a nav pane beside
 * the content deck, the message count as the one dominant figure and the
 * remaining measures as hairline rows. The counts come from the paired cli
 * when available, otherwise from this browser's indexeddb cache. Provider
 * billing and api keys are not read here. Only durable counts, no fake
 * data. The old editorial pass is retired — this body rides the dtw kit
 * with the sage identity (#8fb597, the registry tint) on the
 * active-indicator pill, the measure marks and the figure tile — the
 * chrome washes stay neutral slate.
 */
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShellChrome } from "@/widgets/Shellchrome";
import { osAppLabels } from "../../catalog";
import { browserStoreSummary } from "../../storage.ts";
import { gatewayJson, gatewayReady } from "../../gateway.js";
import { osText } from "../../oslabels.ts";
import { type Usage as UsageData, UsageMeasures } from "../widgets";

/** the window title rides the catalog label row, never a hardcoded literal
 * (the bare id keeps the heading honest if the row is missing). */
const USAGE_LABEL = osAppLabels().usage;

/** The usage app: the Windows body when embedded (the desktop window hosts
 * it without the shell), the full surface with the taskbar on the route. */
export default function Usage({ embedded }: { embedded?: boolean }) {
  const [usage, setUsage] = useState<UsageData>();
  const paired = gatewayReady();

  useEffect(() => {
    const localUsage = () =>
      browserStoreSummary(paired).then((summary) =>
        setUsage({
          workspaces: summary.workspaces,
          sessions: summary.sessions,
          tabs: summary.tabs,
          messages: summary.messages,
          providers: 0,
          paired }),
      );
    if (!paired) {
      void localUsage();
      return;
    }
    void gatewayJson<UsageData>("/usage")
      .then(setUsage)
      .catch(() => {
        void localUsage();
        toast(osText("usage.toast.unavailable"));
      });
  }, [paired]);

  return (
    <main className="dtw-app dtw-usage" style={embedded ? { height: "100%", overflow: "auto" } : undefined}>
      {!embedded && <ShellChrome />}
      <div className="dtw-pane">
        <nav className="dtw-nav" aria-label={osText("usage.nav.aria")}>
          <span className="dtw-navrow" data-active="true">
            {osText("usage.navrow")}
          </span>
        </nav>
        <div className="dtw-content">
          <h1 className="dtw-title">{USAGE_LABEL?.name ?? "Usage"}</h1>
          {usage ? (
            <UsageMeasures usage={usage} paired={paired} />
          ) : (
            <section className="dtw-card">
              <h2 className="dtw-cardtitle">{osText("usage.empty.title")}</h2>
              <p className="dtw-copy">{osText("usage.empty.copy")}</p>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
