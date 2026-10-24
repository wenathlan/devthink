/**
 * legal page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. The legal page of the cobaia content site: the privacy policy
 * and the terms, written seriously and directly. The page discloses the
 * advertising plan (labeled, reserved slots, third-party cookies only once
 * the network is approved and live) and the analytics rule (none by default,
 * opt-in and disclosed here first if that ever changes). No ad slot lives on
 * this page: it is the compliance and health-check surface of the site.
 * every paragraph rides the label accessor — the store keeps the sentence,
 * the anchor keeps the rendering.
 */
import type { CSSProperties } from "react";
import { label } from "../../labels";

/** one legal paragraph: the strong lead and its body, both from the store. */
function Clause({ head, text }: { head: string; text: string }) {
  return (
    <p>
      <strong>{head}</strong> {text}
    </p>
  );
}

export function Legal() {
  return (
    <div className="cb-page">
      <section className="cb-hero" aria-label={label("legal.aria.hero")}>
        <p className="cb-eyebrow cb-in" style={{ "--cb-d": 0 } as CSSProperties}>
          {label("legal.eyebrow")}
        </p>
        <h1 className="cb-title cb-in" style={{ "--cb-d": 1 } as CSSProperties}>
          {label("legal.title")}
        </h1>
        <p className="cb-lede cb-in" style={{ "--cb-d": 2 } as CSSProperties}>
          {label("legal.lede")}
        </p>
      </section>

      <article className="cb-article cb-in" style={{ "--cb-d": 1 } as CSSProperties} aria-label={label("legal.privacy.aria")}>
        <h2 className="cb-secttitle">{label("legal.privacy.title")}</h2>
        <div className="cb-articlebody">
          <Clause head={label("legal.privacy.collect.head")} text={label("legal.privacy.collect.text")} />
          <Clause head={label("legal.privacy.logs.head")} text={label("legal.privacy.logs.text")} />
          <Clause head={label("legal.privacy.ads.head")} text={label("legal.privacy.ads.text")} />
          <Clause head={label("legal.privacy.analytics.head")} text={label("legal.privacy.analytics.text")} />
          <Clause head={label("legal.privacy.payments.head")} text={label("legal.privacy.payments.text")} />
          <Clause head={label("legal.privacy.contact.head")} text={label("legal.privacy.contact.text")} />
        </div>
      </article>

      <article className="cb-article cb-in" style={{ "--cb-d": 2 } as CSSProperties} aria-label={label("legal.terms.aria")}>
        <h2 className="cb-secttitle">{label("legal.terms.title")}</h2>
        <div className="cb-articlebody">
          <Clause head={label("legal.terms.service.head")} text={label("legal.terms.service.text")} />
          <Clause head={label("legal.terms.use.head")} text={label("legal.terms.use.text")} />
          <Clause head={label("legal.terms.data.head")} text={label("legal.terms.data.text")} />
          <Clause head={label("legal.terms.ip.head")} text={label("legal.terms.ip.text")} />
          <Clause head={label("legal.terms.changes.head")} text={label("legal.terms.changes.text")} />
        </div>
      </article>
    </div>
  );
}

export default Legal;
