/**
 * apps page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it (the roster data), mounts the
 * page and re-exports the public component surface. Only the theme anchor
 * (Sol/Sol.tsx) consumes this file.
 *
 * The app directory of the cobaia content site: the ten deploy units of the
 * family, each card carrying the honest one-line role and the deep link
 * through the familyurl contract (../slug/ — the family redirects both
 * ways). The accents come from the spec §12 table mirrored in the roster;
 * the roles are the ones each app declares in its own devthink.toml. The
 * in-feed ad slot closes the feed at the end of the content.
 */
import type { CSSProperties } from "react";
import { familyurl } from "../../familyurl";
import { AdSlot } from "../componentes/shell/adsslot.tsx";
import { ROSTER } from "../componentes/apps/roster.ts";

export function Apps() {
  return (
    <div className="cb-page">
      <section className="cb-hero" aria-label="the devthink app directory">
        <p className="cb-eyebrow cb-in" style={{ "--cb-d": 0 } as CSSProperties}>
          the directory
        </p>
        <h1 className="cb-title cb-in" style={{ "--cb-d": 1 } as CSSProperties}>
          Ten deploy units. One origin.
        </h1>
        <p className="cb-lede cb-in" style={{ "--cb-d": 2 } as CSSProperties}>
          every member of the family is a folder beside this site on the same origin, linked through the familyurl
          contract — and every member links back. the roles below are the honest ones each app declares for itself; the
          accents are the family's spec table.
        </p>
      </section>

      <section className="cb-section" aria-label="the family roster">
        <div className="cb-appgrid">
          {ROSTER.map((member, index) => (
            <a
              key={member.slug}
              className="cb-appcard cb-in"
              href={familyurl(member.slug)}
              target="_blank"
              rel="noreferrer"
              style={{ "--cb-dot": member.accent, "--cb-d": Math.min(index + 1, 6) } as CSSProperties}
            >
              <span className="cb-apphead">
                <span className="cb-appdot" aria-hidden="true" />
                <span className="cb-appname">{member.slug}</span>
              </span>
              <span className="cb-approle">{member.role}</span>
              <span className="cb-appopen">open {member.slug}</span>
            </a>
          ))}
        </div>
      </section>

      {/* the one reserved ad slot of the page: after the feed it belongs to */}
      <AdSlot page="apps" />
    </div>
  );
}

export default Apps;
