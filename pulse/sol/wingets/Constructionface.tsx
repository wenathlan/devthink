/**
 * Constructionface.tsx — the under-construction face of the pulse studio:
 * the ONE component the whole surface answers while the voice-first social
 * studio is in development. the owner's law is literal (the stealthhead
 * precedent): leave "studio in construction", clean everything, ONE
 * component — never a dry text notice — so the face answers as a drawn
 * SCENE: the studio's own mark (the graphite squircle carrying the fluent
 * pulse glyph — the namesake voice-first signal, the one icon of the
 * surface) seated on the glass panel, the drawn voice waveform hanging as
 * a faint hologram behind it (the speaking identity of the studio, its
 * bars breathing in a slow stagger), the white sun light over the deep
 * canvas, the studio title, a pulsing construction chip and ONE short
 * honest line. every other seat of the future pass — the routes, the shell
 * chrome, the entry flow, the channel boards (X, Instagram through the
 * official Graph API, Facebook, YouTube), the swarm mission rail, the cut
 * studio — is unplanned on the surface; the automation logics do not exist
 * yet (the honest scaffold), and the face never invents them: zero walls
 * of text, zero false metrics.
 *
 * the face is one component with one voice: the copy rides the label store
 * (a hardcoded string inside a widget is a defect), the reveal stagger
 * answers the shared observer, and the reduced-motion hard stop of the
 * stylesheet stills every pass.
 */
import { useEffect } from "react";
import { PulseRegular } from "@fluentui/react-icons";
import { label } from "../../labels";
import { observeReveals } from "../../reveal";
import { Voicewave } from "./Voicewave.tsx";

/**
 * the one face of the in-construction studio — see the header comment.
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
  // construction — the one-component face keeps the family seat)
  const framed = (() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  })();
  const seat = framed ? "shell--embedded" : "shell--standalone";

  return (
    <section className={`puconstr grain ${seat}`} aria-label={label("pulse.construction.aria")}>
      <span className="puconstr__light" aria-hidden="true" />
      <span className="puconstr__wave" aria-hidden="true">
        <Voicewave />
      </span>
      <div className="puconstr__panel glass card">
        <span className="puconstr__mark reveal">
          <span className="puconstr__glyph" aria-hidden="true">
            <PulseRegular fontSize={44} />
          </span>
          <span className="sr-only">{label("pulse.name")}</span>
        </span>
        <h1 className="puconstr__title reveal">{label("pulse.construction.title")}</h1>
        <p className="puconstr__chip reveal">
          <span className="puconstr__pulsedot" aria-hidden="true" />
          {label("pulse.construction.status")}
        </p>
        <p className="puconstr__lede reveal">{label("pulse.construction.note")}</p>
      </div>
    </section>
  );
}

export default Constructionface;
