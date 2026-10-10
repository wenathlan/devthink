/**
 * home page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

import { ArrowRight, ArrowUpRight, Wand2 } from "lucide-react";
// # Home — the platform home (design doctrine pass): a quiet greeting header
// (mono-label eyebrow + lowercase display headline), the ONE generation entry
// (a prominent cta into the studio carrying an animated icon), the recent
// generations read straight off the local gateway (/api/projects?limit=8
// behind an 800 ms abort window — on failure a quiet "gateway offline" state,
// never fake data) and the quick links into the presentation pages. every
// block sits on hairline-separated ledger rows — no card grids anywhere.
import { type ReactElement, useCallback, useEffect, useState } from "react";
import { Link } from "wouter";
import { type GatewayProject, listGatewayProjects } from "../shell/gatewayclient.ts";
import { Shell } from "../shell/Shell.tsx";

/** the abort window the recent-generations fetch rides (ms). */
const RECENT_TIMEOUT_MS = 800;

/** the lowercase greeting the local hour answers (session only, no storage). */
function greeting(hour: number): string {
  if (hour < 5) return "good night";
  if (hour < 12) return "good morning";
  if (hour < 18) return "good afternoon";
  return "good evening";
}

/** the lifecycle of the recent-generations strip. */
type RecentState = "loading" | "online" | "offline";

/** the shared head of the ledger sections: a mono-label over a hairline ledger. */
function sectionHead(id: string, label: string): ReactElement {
  return (
    <h2 id={id} className="mono-label" style={{ margin: "0 0 12px", fontWeight: 600 }}>
      {label}
    </h2>
  );
}

export default function Home() {
  const [recent, setRecent] = useState<RecentState>("loading");
  const [projects, setProjects] = useState<readonly GatewayProject[]>([]);

  /** loads the strip off the gateway; any failure lands in the honest offline state. */
  const loadRecent = useCallback((live: () => boolean): void => {
    setRecent("loading");
    listGatewayProjects(8, RECENT_TIMEOUT_MS)
      .then((rows) => {
        if (!live()) return;
        setProjects(rows);
        setRecent("online");
      })
      .catch(() => {
        if (live()) setRecent("offline");
      });
  }, []);

  useEffect(() => {
    let live = true;
    loadRecent(() => live);
    return () => {
      live = false;
    };
  }, [loadRecent]);

  return (
    <Shell>
      {/* GREETING — the mono eyebrow carries the hour greeting, the display headline stays lowercase */}
      <section aria-labelledby="home-h" style={{ maxWidth: 720 }}>
        <p className="mono-label reveal" style={{ margin: "0 0 14px" }}>
          cadria · home — {greeting(new Date().getHours())}
        </p>
        <h1
          id="home-h"
          className="reveal"
          style={{
            margin: "0 0 16px",
            fontSize: "clamp(2.2rem, 5vw, 3.4rem)",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            lineHeight: 1.04,
          }}
        >
          make the picture the sound implies.
        </h1>
        <p className="reveal lede" style={{ margin: 0 }}>
          one window: the studio listens to audio, the engine renders the artwork it implies, the gallery keeps the
          frames. deterministic, client-side, nothing sent anywhere.
        </p>
      </section>

      {/* THE GENERATION ENTRY — the one prominent cta, the animated icon rides icon-anim */}
      <section aria-labelledby="entry-h" style={{ marginTop: 44 }}>
        {sectionHead("entry-h", "generate")}
        <Link
          href="/studio"
          className="btn btn--ghost reveal"
          style={{
            width: "100%",
            maxWidth: 560,
            minHeight: 64,
            justifyContent: "flex-start",
            gap: 14,
            padding: "0 20px",
          }}
        >
          <span className="icon-anim" aria-hidden="true">
            <Wand2 size={18} strokeWidth={1.7} />
          </span>
          <span style={{ textAlign: "left" }}>
            <strong style={{ display: "block" }}>open the studio</strong>
            <span className="mono-label">drop audio · analyze · render</span>
          </span>
          <ArrowRight size={16} aria-hidden="true" style={{ marginLeft: "auto" }} />
        </Link>
      </section>

      {/* RECENT GENERATIONS — the gateway's own list as hairline ledger rows, honest when offline */}
      <section aria-labelledby="recent-h" style={{ marginTop: 44 }}>
        <div className="row">
          {sectionHead("recent-h", "recent generations")}
          {recent === "online" && (
            <span className="mono-label" style={{ marginLeft: "auto" }}>
              {projects.length} from the gateway
            </span>
          )}
        </div>
        <div className="ledger reveal">
          {recent === "loading" && (
            <p className="mono-label" style={{ margin: 0, padding: "16px 4px", borderBottom: "1px solid var(--line)" }}>
              reading the gateway…
            </p>
          )}
          {recent === "offline" && (
            <div className="ledger-row">
              <span className="ledger-no" aria-hidden="true">
                --
              </span>
              <div className="ledger-main">
                <p className="ledger-text">
                  gateway offline — nothing shown that the engine did not render. start it, then retry.
                </p>
              </div>
              <button
                type="button"
                className="btn btn--quiet"
                style={{ minHeight: 36 }}
                onClick={() => loadRecent(() => true)}
              >
                retry
              </button>
            </div>
          )}
          {recent === "online" && projects.length === 0 && (
            <p className="mono-label" style={{ margin: 0, padding: "16px 4px", borderBottom: "1px solid var(--line)" }}>
              the gateway answers — no generations yet. the studio is one cta away.
            </p>
          )}
          {recent === "online" &&
            projects.map((project, index) => (
              <Link
                key={project.id}
                href={`/player?id=${encodeURIComponent(project.id)}`}
                className="ledger-row"
                style={{ textDecoration: "none" }}
              >
                <span className="ledger-no" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="ledger-main">
                  <h3 className="ledger-title" style={{ fontSize: "1rem" }}>
                    {project.style}
                  </h3>
                  <p className="ledger-text mono-label" style={{ margin: 0, overflowWrap: "anywhere" }}>
                    {project.id}
                  </p>
                </div>
                <span className="mono-label" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {project.bpm} bpm · {project.key}
                  <ArrowUpRight size={14} aria-hidden="true" />
                </span>
              </Link>
            ))}
        </div>
      </section>

      {/* QUICK LINKS — the presentation pages, the same hairline ledger */}
      <section aria-labelledby="links-h" style={{ marginTop: 44 }}>
        {sectionHead("links-h", "quick links")}
        <div className="ledger reveal">
          <Link href="/intro" className="ledger-row" style={{ textDecoration: "none" }}>
            <span className="ledger-no" aria-hidden="true">
              01
            </span>
            <div className="ledger-main">
              <h3 className="ledger-title" style={{ fontSize: "1rem" }}>
                the presentation
              </h3>
              <p className="ledger-text" style={{ margin: 0 }}>
                what cadria is — the studio that listens, with the real engine running live on the page.
              </p>
            </div>
            <ArrowUpRight size={14} aria-hidden="true" style={{ alignSelf: "center" }} />
          </Link>
          <Link href="/onboarding" className="ledger-row" style={{ textDecoration: "none" }}>
            <span className="ledger-no" aria-hidden="true">
              02
            </span>
            <div className="ledger-main">
              <h3 className="ledger-title" style={{ fontSize: "1rem" }}>
                first run
              </h3>
              <p className="ledger-text" style={{ margin: 0 }}>
                four frames — welcome, hear, see, enter — with your own audio or a built-in fixture.
              </p>
            </div>
            <ArrowUpRight size={14} aria-hidden="true" style={{ alignSelf: "center" }} />
          </Link>
        </div>
      </section>
    </Shell>
  );
}
