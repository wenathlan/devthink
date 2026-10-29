/**
 * constructionface.tsx — the in-construction face of the os: the honest
 * surface every not-yet-built shelf renders (the games runner shelf, the
 * studio asset lists) instead of an empty list pretending to be a product.
 * The face keeps the fluent beauty of the family — the accent band of the
 * owning app on the top edge, the breathing wrench glyph over its tinted
 * tile, the mono eyebrow of the surface, the display title, one honest line
 * and the way back to explore. Nothing is deleted by it: the pages render
 * the face only while the catalog answers no rows, so the shelf wakes up
 * the day the catalog serves real binaries and assets. Loose component of
 * every studio page — the shared widget barrel exports it.
 */
import {ArrowLeftRegular, WrenchSettingsRegular} from "@fluentui/react-icons";
import type {CSSProperties} from "react";
import {useLocation} from "wouter";
import {osText} from "../../oslabels.ts";

/**
 * the one face of the not-yet-built shelf — see the header comment.
 *
 * @param accent the css color of the owning app family — it rides the band,
 * the glyph tile and the action through one custom property, never a second
 * hardcoded hue.
 * @param title the surface name rendered as the mono eyebrow (the heading
 * itself is the shared construction label, so every shelf speaks one voice).
 * @param subtitle the honest line override — defaults to the label seed.
 * @returns the construction face element.
 */
export function Constructionface({
  accent,
  title,
  subtitle,
}: {
  accent: string;
  title: string;
  subtitle?: string;
}) {
  const [, navigate] = useLocation();

  return (
    <section
      className="dt-construction"
      style={{ "--dt-construction-accent": accent } as CSSProperties}
      aria-label={osText("construction.aria")}
    >
      <span className="dt-construction__glyph" aria-hidden="true">
        <WrenchSettingsRegular fontSize={30} />
      </span>
      <p className="dt-construction__eyebrow">{title}</p>
      <h2 className="dt-construction__title">{osText("construction.title")}</h2>
      <p className="dt-construction__copy">{subtitle ?? osText("construction.subtitle")}</p>
      <button
        type="button"
        className="dt-construction__action"
        onClick={() => navigate("/explore")}
      >
        <ArrowLeftRegular fontSize={14} aria-hidden="true" />
        {osText("construction.action")}
      </button>
    </section>
  );
}
