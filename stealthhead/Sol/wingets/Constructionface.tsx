/**
 * Constructionface.tsx — the in-construction face of the stealthhead pages:
 * the honest surface every game page renders while the game is in
 * development (home, match, ranking, weapons, world — the ledger faces of
 * the old pass are retired). the owner's law was literal: leave "game in
 * construction", clean everything, ONE component — never a dry text
 * notice — so the face answers as a drawn SCENE: the game's own brand mark
 * (the coral squircle with the scope glyph, its flow band riding inside
 * the strokes) seated on the glass panel, the drawn scope reticle hanging
 * as a faint hologram behind it (the tactical identity of the platform,
 * slow-sweeping ±2° like the landing it retired), the coral scope light
 * over the deep canvas, the mono eyebrow of the route, the game title, a
 * pulsing construction chip, ONE short line and the two ways on (home, or
 * the opening splash again). the root game logics (match, physics,
 * netcode, ranking, world) keep riding their own files untouched under
 * the hood: only the page faces changed, nothing was deleted.
 *
 * the face is one component with one voice: the route owns the eyebrow, the
 * copy rides the label store (a hardcoded string inside a widget is a
 * defect), the reveal stagger answers the shared observer, and the
 * reduced-motion hard stop of the stylesheet stills every pass.
 */
import { HomeRegular } from "@fluentui/react-icons";
import { useEffect } from "react";
import { Link } from "wouter";
import { label } from "../../labels";
import { observeReveals } from "../../reveal";
import { BrandMark } from "./ShellBrandmark.tsx";
import { Scope } from "./HomeScope.tsx";

/**
 * the one face of the in-development game page — see the header comment.
 *
 * @param eyebrow the mono eyebrow of the wearing route (the face itself
 * speaks the shared construction title, so every page answers one voice).
 * @returns the construction face element.
 */
export function Constructionface({ eyebrow }: { eyebrow: string }) {
  useEffect(() => {
    observeReveals();
  }, []);

  return (
    <section className="shconstr grain" aria-label={label("construction.aria")}>
      <span className="shconstr__light" aria-hidden="true" />
      <span className="shconstr__reticle" aria-hidden="true">
        <Scope />
      </span>
      <div className="shconstr__panel glass card">
        <span className="shconstr__mark reveal">
          <BrandMark size={88} flow />
        </span>
        <p className="eyebrow reveal">{eyebrow}</p>
        <h1 className="shconstr__title reveal">{label("construction.title")}</h1>
        <p className="shconstr__chip reveal">
          <span className="shconstr__pulsedot" aria-hidden="true" />
          {label("construction.status")}
        </p>
        <p className="shconstr__lede reveal">{label("construction.subtitle")}</p>
        <div className="shconstr__actions reveal">
          <Link href="/" className="btn press">
            <HomeRegular fontSize={15} aria-hidden="true" />
            {label("construction.action")}
          </Link>
          <Link href="/intro" className="shconstr__cue press">
            {label("construction.replay")}
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Constructionface;
