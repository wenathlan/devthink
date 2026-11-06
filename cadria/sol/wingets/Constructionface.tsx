/**
 * Constructionface.tsx — the in-construction face of the cadria pages:
 * the honest surface every platform route renders while the detailed
 * engine wave builds (the owner's order was literal: the debonair and the
 * cadria are made later, with the time their engines, protocols and
 * processes deserve — until that wave the app answers one face, never a
 * premature studio pretending to ship). The face keeps the cadria identity
 * of the family: the drawn rose mark (the clapper glyph with the light
 * band travelling inside the strokes) seated on the glass panel under the
 * white-sun bloom light, the film strip hanging as a faint hologram behind
 * it (the moving-image identity of the platform, sprocket holes drawn as
 * material — never a live claim), the mono eyebrow of the route, the app
 * title, the pulsing construction chip, ONE short line and the two ways on
 * (the home, or the opening splash again — the intro keeps its real demo
 * chain, so the replay is a real promise). Nothing is deleted by it: the
 * engine logics (the versawase engine, the synth, the image and video
 * seats, the gateway over the site db) keep riding their own files
 * untouched at the folder root, so the faces wake up the day the detailed
 * wave lands them.
 *
 * The face is one component with one voice: the route owns the eyebrow,
 * every word rides the label store (a hardcoded string inside a widget is
 * a defect), the reveal stagger answers the shared observer of the route
 * tree, the accent is the app's own --accent (never a second hue) and the
 * reduced-motion hard stop of the stylesheet stills every pass.
 */
import { HomeRegular } from "@fluentui/react-icons";
import { Link } from "wouter";
import { label } from "../../labels.ts";
import { CadriaMark } from "../shell/Shell.tsx";

/**
 * the one face of the in-construction platform route — see the header
 * comment.
 *
 * @param eyebrow the mono eyebrow of the wearing route (the face itself
 * speaks the shared construction title, so every page answers one voice).
 * @returns the construction face element.
 */
export function Constructionface({ eyebrow }: { eyebrow: string }) {
  return (
    <section className="cdrconstr grain" aria-label={label("construction.aria")}>
      <span className="cdrconstr__light" aria-hidden="true" />
      <span className="cdrconstr__film" aria-hidden="true" />
      <div className="cdrconstr__panel">
        <span className="cdrconstr__mark reveal">
          <CadriaMark size={88} flow />
        </span>
        <p className="eyebrow reveal">{eyebrow}</p>
        <h1 className="cdrconstr__title reveal">{label("construction.title")}</h1>
        <p className="cdrconstr__chip reveal">
          <span className="cdrconstr__pulsedot" aria-hidden="true" />
          {label("construction.status")}
        </p>
        <p className="cdrconstr__lede reveal">{label("construction.subtitle")}</p>
        <div className="cdrconstr__actions reveal">
          <Link href="/" className="btn">
            <HomeRegular fontSize={15} aria-hidden="true" />
            {label("construction.action")}
          </Link>
          <Link href="/intro" className="cdrconstr__cue">
            {label("construction.replay")}
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Constructionface;
