/**
 * Constructionface.tsx — the under-construction face of the stealthhead
 * platform: the ONE component the whole surface answers while the game is
 * in development. the owner's law was literal (PR19): leave "game in
 * construction", clean everything, ONE component — never a dry text
 * notice — so the face answers as a drawn SCENE: the game's own brand mark
 * (the coral squircle with the scope glyph, its flow band riding inside
 * the strokes) seated on the glass panel, the drawn scope reticle hanging
 * as a faint hologram behind it (the tactical identity of the platform,
 * slow-sweeping ±2°), the coral scope light over the deep canvas, the game
 * title, a pulsing construction chip and ONE short honest line. every
 * other seat of the old pass — the routes, the shell chrome, the entry
 * flow, the game page faces — is retired; the engine logics (match,
 * ranking, weapons, world, physics, netcode, spawner, hud) stay preserved
 * in the theme topic folders untouched under the hood, and the face never
 * imports them.
 *
 * the face is one component with one voice: the copy rides the label store
 * (a hardcoded string inside a widget is a defect), the reveal stagger
 * answers the shared observer, and the reduced-motion hard stop of the
 * stylesheet stills every pass.
 */
import { useEffect } from "react";
import { label } from "../../labels";
import { observeReveals } from "../../reveal";
import { Scope } from "./HomeScope.tsx";
import { BrandMark } from "./ShellBrandmark.tsx";

/**
 * the one face of the in-construction game — see the header comment.
 *
 * @returns the under-construction face element.
 */
export function Constructionface() {
  useEffect(() => {
    observeReveals();
  }, []);

  // the embedded contract (the family law every sibling answers): inside
  // the os power clip the face rides the host window chrome — the seat
  // class answers the mount, the surface tree never changes between the
  // two doors (the window-era law: one design, two doors, even under
  // construction — the PR19 one-component face keeps the family seat)
  const framed = (() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  })();
  const seat = framed ? "shell--embedded" : "shell--standalone";

  return (
    <section className={`shconstr grain ${seat}`} aria-label={label("construction.aria")}>
      <span className="shconstr__light" aria-hidden="true" />
      <span className="shconstr__reticle" aria-hidden="true">
        <Scope />
      </span>
      <div className="shconstr__panel glass card">
        <span className="shconstr__mark reveal">
          <BrandMark size={88} flow />
        </span>
        <h1 className="shconstr__title reveal">{label("construction.title")}</h1>
        <p className="shconstr__chip reveal">
          <span className="shconstr__pulsedot" aria-hidden="true" />
          {label("construction.status")}
        </p>
        <p className="shconstr__lede reveal">{label("construction.subtitle")}</p>
      </div>
    </section>
  );
}

export default Constructionface;
