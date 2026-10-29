/**
 * home page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

import {
  ArrowRightRegular,
  ArrowUpRightRegular,
  SparkleRegular,
  WandRegular,
  WifiOffRegular,
} from "@fluentui/react-icons";
// # Home — the platform home (design doctrine pass): the entry gate rides
// the surface (entrygate.tsx beside this anchor — the flow law intro →
// onboarding → the platform is consulted before anything shows), then a
// quiet greeting header (mono-label eyebrow + lowercase display headline),
// (mono-label eyebrow + lowercase display headline), the ONE generation entry
// (a prominent cta into the studio carrying an animated icon), the recent
// generations read straight off the local gateway (/api/projects?limit=8
// behind an 800 ms abort window — on failure a quiet "gateway offline" state,
// never fake data) and the quick links into the presentation pages. every
// block sits on hairline-separated ledger rows — no card grids anywhere.
// the anchor renders BARE: the one Shell chrome lives in Sol/Sol.tsx.
import { type ReactElement, useCallback, useEffect, useState } from "react";
import { Link } from "wouter";
import { type GatewayProject, listGatewayProjects } from "../../gatewayclient.ts";
import { label } from "../../labels.ts";
import { HomeEntrygate as EntryGate } from "../wingets";
import { EmptyState } from "../wingets";

/** the abort window the recent-generations fetch rides (ms). */
const RECENT_TIMEOUT_MS = 800;

/** the lowercase greeting the local hour answers (session only, no storage). */
function greeting(hour: number): string {
  if (hour < 5) return label("home.greeting.night");
  if (hour < 12) return label("home.greeting.morning");
  if (hour < 18) return label("home.greeting.afternoon");
  return label("home.greeting.evening");
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

/** the home surface the gate reveals (the greeting, the entry, the ledgers). */
function HomeSurface() {
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
    <>
      {/* GREETING — the mono eyebrow carries the hour greeting, the display headline stays lowercase */}
      <section aria-labelledby="home-h" style={{ maxWidth: 720 }}>
        <p className="mono-label reveal" style={{ margin: "0 0 14px" }}>
          {label("home.hero.eyebrow").replace("{greeting}", greeting(new Date().getHours()))}
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
          {label("home.hero.title")}
        </h1>
        <p className="reveal lede" style={{ margin: 0 }}>
          {label("home.hero.lede")}
        </p>
      </section>

      {/* THE GENERATION ENTRY — the one prominent cta, the animated icon rides icon-anim */}
      <section aria-labelledby="entry-h" style={{ marginTop: 44 }}>
        {sectionHead("entry-h", label("home.entry.head"))}
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
            <WandRegular fontSize={18} />
          </span>
          <span style={{ textAlign: "left" }}>
            <strong style={{ display: "block" }}>{label("home.entry.title")}</strong>
            <span className="mono-label">{label("home.entry.sub")}</span>
          </span>
          <ArrowRightRegular fontSize={16} aria-hidden="true" style={{ marginLeft: "auto" }} />
        </Link>
      </section>

      {/* RECENT GENERATIONS — the gateway's own list as hairline ledger rows, honest when offline */}
      <section aria-labelledby="recent-h" style={{ marginTop: 44 }}>
        <div className="row">
          {sectionHead("recent-h", label("home.recent.head"))}
          {recent === "online" && (
            <span className="mono-label" style={{ marginLeft: "auto" }}>
              {label("home.recent.count").replace("{n}", String(projects.length))}
            </span>
          )}
        </div>
        <div className="ledger reveal">
          {recent === "loading" &&
            [0, 1, 2].map((slot) => (
              <div key={`sk-${slot}`} className="ledger-row ledger-row--skeleton" aria-hidden="true">
                <span className="skel skel--no" />
                <div className="ledger-main">
                  <span className="skel skel--title" />
                  <span className="skel skel--text" />
                </div>
                <span className="skel skel--meta" />
              </div>
            ))}
          {recent === "offline" && (
            <EmptyState
              icon={WifiOffRegular}
              title={label("home.recent.offlineTitle")}
              line={label("home.recent.offlineLine")}
              action={
                <button type="button" className="btn" style={{ minHeight: 40 }} onClick={() => loadRecent(() => true)}>
                  {label("home.recent.retry")}
                </button>
              }
            />
          )}
          {recent === "online" && projects.length === 0 && (
            <EmptyState
              icon={SparkleRegular}
              title={label("home.recent.emptyTitle")}
              line={label("home.recent.emptyLine")}
              action={
                <Link href="/studio" className="btn" style={{ minHeight: 40 }}>
                  {label("home.recent.openStudio")}
                </Link>
              }
            />
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
                  <ArrowUpRightRegular fontSize={14} aria-hidden="true" />
                </span>
              </Link>
            ))}
        </div>
      </section>

      {/* QUICK LINKS — the presentation pages, the same hairline ledger */}
      <section aria-labelledby="links-h" style={{ marginTop: 44 }}>
        {sectionHead("links-h", label("home.links.head"))}
        <div className="ledger reveal">
          <Link href="/intro" className="ledger-row" style={{ textDecoration: "none" }}>
            <span className="ledger-no" aria-hidden="true">
              01
            </span>
            <div className="ledger-main">
              <h3 className="ledger-title" style={{ fontSize: "1rem" }}>
                {label("home.links.presentationTitle")}
              </h3>
              <p className="ledger-text" style={{ margin: 0 }}>
                {label("home.links.presentationLine")}
              </p>
            </div>
            <ArrowUpRightRegular fontSize={14} aria-hidden="true" style={{ alignSelf: "center" }} />
          </Link>
          <Link href="/onboarding" className="ledger-row" style={{ textDecoration: "none" }}>
            <span className="ledger-no" aria-hidden="true">
              02
            </span>
            <div className="ledger-main">
              <h3 className="ledger-title" style={{ fontSize: "1rem" }}>
                {label("home.links.firstRunTitle")}
              </h3>
              <p className="ledger-text" style={{ margin: 0 }}>
                {label("home.links.firstRunLine")}
              </p>
            </div>
            <ArrowUpRightRegular fontSize={14} aria-hidden="true" style={{ alignSelf: "center" }} />
          </Link>
        </div>
      </section>
    </>
  );
}

/**
 * The home page anchor: the entry gate rides the surface — the flow law
 * (intro → onboarding → the platform) is consulted before the home shows.
 *
 * @returns the gated home element.
 */
export default function Home() {
  return (
    <EntryGate>
      <HomeSurface />
    </EntryGate>
  );
}
