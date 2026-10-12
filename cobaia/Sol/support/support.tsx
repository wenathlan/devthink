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
          <p className="cb-note">link not configured yet</p>
        </>
      )}
    </article>
  );
}

export function Support() {
  return (
    <div className="cb-page">
      <section className="cb-hero" aria-label="cobaia support">
        <p className="cb-eyebrow cb-in" style={{ "--cb-d": 0 } as CSSProperties}>
          support
        </p>
        <h1 className="cb-title cb-in" style={{ "--cb-d": 1 } as CSSProperties}>
          Keep the family independent.
        </h1>
        <p className="cb-lede cb-in" style={{ "--cb-d": 2 } as CSSProperties}>
          the family runs on about us$15 a month of domains and free hosting. support covers that floor, keeps every
          tool free to use and keeps the applications free of ads. both channels below charge zero platform fees, so the
          support goes where it says.
        </p>
      </section>

      <section className="cb-section" aria-label="the support channels">
        <div className="cb-grid cb-grid--2">
          <Channel
            index={1}
            name="GitHub Sponsors"
            promise="sponsor the maintainer through github. zero platform fee, payouts land automatically, and the sponsorship shows up next to the public work it funds."
            href={SUPPORTLINKS.sponsors}
            cta="sponsor on github"
          />
          <Channel
            index={2}
            name="Ko-fi"
            promise="one-off donations and monthly memberships through ko-fi. zero fee on donations, no account required on your side beyond the payment."
            href={SUPPORTLINKS.kofi}
            cta="buy a coffee"
          />
        </div>
      </section>

      <section className="cb-section" aria-label="other ways to help">
        <div className="cb-secthead">
          <h2 className="cb-secttitle">Other ways to help</h2>
          <p className="cb-sectlede">
            use the tools and tell the truth about them — report what breaks in the public issue tracker, write about
            what the family does well or badly, and link the directory when a tool earns it. none of it costs anything
            and all of it compounds.
          </p>
        </div>
        <p className="cb-note is-live">
          the honest line: no ad clicking, no traffic exchange, no bots. automated traffic against an ad surface is
          invalid traffic — it would end the ad account and the domain reputation. the family does not do it.
        </p>
      </section>
    </div>
  );
}

export default Support;
