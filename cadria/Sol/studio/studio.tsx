/**
 * studio page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it (the parts module is one of
 * them), mounts the page and re-exports the public component surface. Only
 * the theme anchor (Sol/Sol.tsx) consumes this file. This anchor carries the
 * former main component of the folder, which now lives here as the page
 * mount itself.
 */

// # Studio — the anchor workspace (campaign v3 · r3-cadria): the six creative
// anchors from the data layer presented as an asymmetric ledger — the 3D
// studio featured and raised on the 1.6fr side with its pure-css visual under
// the identity-tint light, the remaining anchors as hairline rows on the 1fr
// side — plus the Visualize panel and the anchor-loading note.

export * from "./parts";

import { useEffect, useState } from "react";
import { listAnchors } from "../../catalog.ts";
import type { CreativeAnchor } from "../../versawase.ts";
import { type NavLink, Shell } from "../shell/Shell";
import { AnchorVisual } from "./parts";
import { VisualizePanel } from "./visualize-panel";

const FOOTER_LINKS: readonly NavLink[] = [
  { label: "Player", href: "/player" },
  { label: "Studio", href: "/studio" },
  { label: "Gallery", href: "/gallery" },
  { label: "Settings", href: "/settings" },
];

export default function Studio() {
  const [anchors, setAnchors] = useState<readonly CreativeAnchor[]>([]);

  useEffect(() => {
    let live = true;
    listAnchors().then((rows) => {
      if (live) setAnchors(rows);
    });
    return () => {
      live = false;
    };
  }, []);

  const featured = anchors[0];
  const rest = anchors.slice(1);

  return (
    <Shell
      name="cadria"
      contained
      cta={{ label: "View gallery", href: "/gallery" }}
      footerLinks={FOOTER_LINKS}
      domain="cadria.devthink.pro"
    >
      <p className="eyebrow reveal">cadria · studio</p>
      <h1 className="reveal page-title">Studio</h1>
      <p className="reveal lede">
        The create editor is an anchor architecture (F-CAD-016): <code>app.tsx</code> boots a core shell, and each
        discipline docks as an anchor — same tokens, same frame, own canvas. Six of them ship today; the store, chat and
        mockup anchors follow.
      </p>

      <div className="anchorledger mt-30">
        {featured ? (
          <article key={featured.id} className="anchor-feature reveal">
            <span className="mv-shell">
              <AnchorVisual id={featured.id} />
            </span>
            <h3 className="flush">{featured.title}</h3>
            <p className="flush">{featured.detail}</p>
            <div className="anchor-meta">
              <span className="badge">featured anchor</span>
              <code className="anchor-id">{featured.id}</code>
            </div>
          </article>
        ) : null}
        <div className="anchor-stack reveal">
          {rest.map((anchor, index) => (
            <article key={anchor.id} className="anchor-row">
              <span className="anchor-no" aria-hidden="true">
                {String(index + 2).padStart(2, "0")}
              </span>
              <div className="ledger-main">
                <h3>{anchor.title}</h3>
                <p>{anchor.detail}</p>
              </div>
              <code className="anchor-id">{anchor.id}</code>
            </article>
          ))}
        </div>
      </div>

      <section className="section section-offset-r">
        <VisualizePanel />
      </section>

      <section className="section section-offset-l">
        <div className="glass card reveal">
          <h2 className="flush" style={{ fontSize: "1.15rem", marginBottom: 6 }}>
            How anchors load
          </h2>
          <p className="flush">
            Anchor files sit between the shell and the components: <code>app.tsx → anchor → components</code>. Builds
            ship unhashed, original asset names, and the environment resolves <code>BASE_URL</code> per domain —
            F-CAD-017/018.
          </p>
        </div>
      </section>
    </Shell>
  );
}
