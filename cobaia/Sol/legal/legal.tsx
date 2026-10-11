/**
 * legal page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file.
 *
 * The legal page of the cobaia content site: the privacy policy and the
 * terms, written seriously and directly. The page discloses the advertising
 * plan (labeled, reserved slots, third-party cookies only once the network
 * is approved and live) and the analytics rule (none by default, opt-in and
 * disclosed here first if that ever changes). No ad slot lives on this page:
 * it is the compliance and health-check surface of the site.
 */
import type { CSSProperties } from "react";

export function Legal() {
  return (
    <div className="cb-page">
      <section className="cb-hero" aria-label="cobaia legal">
        <p className="cb-eyebrow cb-in" style={{ "--cb-d": 0 } as CSSProperties}>
          legal
        </p>
        <h1 className="cb-title cb-in" style={{ "--cb-d": 1 } as CSSProperties}>
          Privacy and terms.
        </h1>
        <p className="cb-lede cb-in" style={{ "--cb-d": 2 } as CSSProperties}>
          the short version: the family sites are static files, they collect nothing by default, they track nobody, and
          the details below are the long version of the same promise. last updated 2026-10-10.
        </p>
      </section>

      <article className="cb-article cb-in" style={{ "--cb-d": 1 } as CSSProperties} aria-label="privacy policy">
        <h2 className="cb-secttitle">Privacy policy</h2>
        <div className="cb-articlebody">
          <p>
            <strong>What we collect: nothing, by default.</strong> The family sites are static files served from a CDN.
            They set no cookies, run no analytics, embed no fingerprinting and write nothing to your browser — no local
            storage, no indexed databases, no session records. The only thing a visitor machine does is load the
            interface.
          </p>
          <p>
            <strong>Server logs.</strong> The hosting providers (netlify, vercel, cloudflare and equivalents) keep
            standard access logs on their own infrastructure for security and abuse prevention. The family does not add
            identifiers to them and does not export them for profiling.
          </p>
          <p>
            <strong>Advertising.</strong> The family site runs reserved, visibly labeled ad containers on its content
            pages. No ad script ships in the code: the advertising partner's loader is only added after the partner
            approves the site, and it arrives through the deploy environment. Once live, third-party vendors including
            Google may serve ads and use cookies to personalize them, as governed by the partner's own policies. You can
            opt out of personalized advertising through your ad settings (for Google, adssettings.google.com). Ads never
            appear inside the applications themselves.
          </p>
          <p>
            <strong>Analytics.</strong> There is no analytics on the family sites today. If that ever changes, it will
            be opt-in, minimal and disclosed on this page before it goes live.
          </p>
          <p>
            <strong>Payments.</strong> When paid plans go live, checkout runs on the payment provider's own pages
            (stripe, paddle or equivalents). The family sites never see or store card data.
          </p>
          <p>
            <strong>Contact.</strong> Privacy questions and data requests go through the public issue tracker of the
            family repository — the same channel the software itself uses.
          </p>
        </div>
      </article>

      <article className="cb-article cb-in" style={{ "--cb-d": 2 } as CSSProperties} aria-label="terms of use">
        <h2 className="cb-secttitle">Terms of use</h2>
        <div className="cb-articlebody">
          <p>
            <strong>The service.</strong> The family applications and this site are provided as is, without warranty of
            any kind. They are tools built in public: features change, break and get fixed in the open. Nothing here is
            offered as professional advice or with any availability guarantee.
          </p>
          <p>
            <strong>Acceptable use.</strong> Use the tools like a person. Do not run automated traffic against the sites
            or, above all, against any advertising surface: clicking your own ads, exchanging traffic or driving bots at
            ad containers is invalid traffic — it defrauds the advertisers, it ends the ad account and it burns the
            domain reputation. The family does not do it and asks nobody else to.
          </p>
          <p>
            <strong>Your data.</strong> Since the sites collect nothing, there is nothing to export or delete. What you
            do inside the hosted tools stays governed by the tool's own page.
          </p>
          <p>
            <strong>Intellectual property.</strong> The family code is free software under its repository license; the
            name devthink and the family marks belong to their author. The site name "cobaia" is provisional and may
            change.
          </p>
          <p>
            <strong>Changes.</strong> These terms change when the facts change, and the changes land on this page with a
            new date. Using the sites after a change means you accept it.
          </p>
        </div>
      </article>
    </div>
  );
}

export default Legal;
