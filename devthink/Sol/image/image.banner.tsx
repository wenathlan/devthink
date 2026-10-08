/**
 * image.banner.tsx — the engine banner of the native image studio: the
 * catalog row of the owning app becomes one raised note with the engine,
 * the owner and the honest line about where the engine lives. The banner
 * stays empty until the database pairs — never a placeholder engine row.
 */

/** Style: DevThink Terminal Atelier — the same banner grammar the video and
 * music studios render, so the three studio pages read as one surface with a
 * different engine behind each. */
import { Image as ImageGlyph } from "lucide-react";
import type { NativeApp } from "../../catalog";

export function ImageBanner({ app }: { app: NativeApp | undefined }) {
  if (!app)
    return (
      <section className="control-note" style={{ display: "grid", gap: 10 }}>
        <h2 style={{ margin: 0, fontSize: 15, color: "var(--dt-text)" }}>the matiz engine</h2>
        <p style={{ margin: 0 }}>
          The catalog has not answered the matiz engine row yet, so the banner stays empty until the database pairs.
        </p>
      </section>
    );
  return (
    <section className="control-note" style={{ display: "grid", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <ImageGlyph size={15} style={{ color: "var(--dt-orange)" }} />
        <h2 style={{ margin: 0, fontSize: 15, color: "var(--dt-text)" }}>the {app.engine} engine</h2>
        <span className="control-badge">{app.owner}</span>
      </div>
      <p style={{ margin: 0 }}>{app.blurb}</p>
      <p style={{ margin: 0, color: "var(--dt-muted)" }}>
        The {app.engine} engine rides the catalog over https, so this page never bundles the engine itself.
      </p>
    </section>
  );
}
