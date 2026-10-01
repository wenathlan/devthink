// # Studio — sub-anchor of the studio page: the six creative anchors from the data
// layer, each with its pure-css mini-visual, plus the anchor-loading note.
import { useEffect, useState } from "react";
import { Shell, type NavLink } from "../shell/Shell";
import { listAnchors } from "../../catalog.ts";
import type { CreativeAnchor } from "../../versawase.ts";
import { AnchorVisual } from "./parts";

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

  return (
    <Shell
      name="cadria"
      contained
      cta={{ label: "View gallery", href: "/gallery" }}
      footerLinks={FOOTER_LINKS}
      domain="cadria.devthink.pro"
    >
      <p className="eyebrow reveal">creative anchors</p>
      <h1 className="reveal page-title">Studio</h1>
      <p className="reveal lede">
        The create editor is an anchor architecture (F-CAD-016): <code>app.tsx</code> boots a core shell,
        and each discipline docks as an anchor — same tokens, same frame, own canvas. Six of them ship
        today; the store, chat and mockup anchors follow.
      </p>

      <div className="grid cols-3 mt-30">
        {anchors.map((anchor) => (
          <article key={anchor.id} className="glass glass-hover card reveal">
            <AnchorVisual id={anchor.id} />
            <h3 className="flush" style={{ fontSize: "1.05rem", marginBottom: 4 }}>
              {anchor.title}
            </h3>
            <p className="flush" style={{ fontSize: "0.92rem", marginBottom: 14 }}>
              {anchor.detail}
            </p>
            <div className="anchor-meta">
              <span className="badge">anchor</span>
              <code className="anchor-id">{anchor.id}</code>
            </div>
          </article>
        ))}
      </div>

      <section className="section section-narrow">
        <div className="glass card reveal">
          <h2 className="flush" style={{ fontSize: "1.15rem", marginBottom: 6 }}>
            How anchors load
          </h2>
          <p className="flush">
            Anchor files sit between the shell and the components: <code>app.tsx → anchor → components</code>. Builds ship unhashed, original asset names, and the environment resolves <code>BASE_URL</code> per domain — F-CAD-017/018.
          </p>
        </div>
      </section>
    </Shell>
  );
}
