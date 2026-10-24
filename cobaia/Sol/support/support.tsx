/**
 * support page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file.
 *
 * The support page of the cobaia content site: the two configured channels
 * (github sponsors and ko-fi, both zero platform fee) and the honest text of
 * why the family takes support at all. The channel links read from the pure
 * config at the app root (checkoutlinks.ts) — an unconfigured channel renders
 * its honest empty state, never a fake link. No ad slot lives on this page:
 * nothing that asks for support ever sits beside an advertisement.
 */
import type { CSSProperties } from "react";
import { SUPPORTLINKS, isconfigured } from "../../checkoutlinks";
import { label } from "../../labels";

/** one support channel: the card, the promise and its config link. */
function Channel({
  name,
  promise,
  href,
  cta,
  index,
}: {
  name: string;
  promise: string;
  href: string;
  cta: string;
  index: number;
}) {
  const live = isconfigured(href);
  return (
    <article className="cb-card cb-in" style={{ "--cb-d": index } as CSSProperties} aria-label={name}>
      <h3 className="cb-cardtitle">{name}</h3>
      <p className="cb-channeltext">{promise}</p>
      {live ? (
        <a className="cb-btn" href={href} target="_blank" rel="noreferrer">
          {cta}
        </a>
      ) : (
        <>
          <button className="cb-btn" type="button" disabled>
            {cta}
          </button>
          <p className="cb-note">{label("support.action.notConfigured")}</p>
        </>
      )}
    </article>
  );
}

export function Support() {
  return (
    <div className="cb-page">
      <section className="cb-hero" aria-label={label("support.aria.hero")}>
        <p className="cb-eyebrow cb-in" style={{ "--cb-d": 0 } as CSSProperties}>
          {label("support.eyebrow")}
        </p>
        <h1 className="cb-title cb-in" style={{ "--cb-d": 1 } as CSSProperties}>
          {label("support.title")}
        </h1>
        <p className="cb-lede cb-in" style={{ "--cb-d": 2 } as CSSProperties}>
          {label("support.lede")}
        </p>
      </section>

      <section className="cb-section" aria-label={label("support.section.channelsAria")}>
        <div className="cb-grid cb-grid--2">
          <Channel
            index={1}
            name={label("support.channel.sponsors.name")}
            promise={label("support.channel.sponsors.promise")}
            href={SUPPORTLINKS.sponsors}
            cta={label("support.channel.sponsors.cta")}
          />
          <Channel
            index={2}
            name={label("support.channel.kofi.name")}
            promise={label("support.channel.kofi.promise")}
            href={SUPPORTLINKS.kofi}
            cta={label("support.channel.kofi.cta")}
          />
        </div>
      </section>

      <section className="cb-section" aria-label={label("support.section.otherAria")}>
        <div className="cb-secthead">
          <h2 className="cb-secttitle">{label("support.section.otherTitle")}</h2>
          <p className="cb-sectlede">{label("support.section.otherLede")}</p>
        </div>
        <p className="cb-note is-live">{label("support.section.otherNote")}</p>
      </section>
    </div>
  );
}

export default Support;
