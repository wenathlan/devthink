/**
 * intro.footer.tsx — the footer strip of the intro: the doors. The site row
 * (the public sections of the content site, the labels riding the shell's
 * own foot keys so the doors can never drift from the chrome), the family
 * row (every deploy unit beside the cobaia, resolved through the relative
 * familyurl contract so the doors survive any mount point, each carrying
 * the one accent the spec table gives it) and the legal line (the shared
 * colophon). Plain anchors, no decorative dots, zero storage, zero network —
 * it works on a static deploy.
 */

import type { CSSProperties } from "react";
import { familyurl } from "../../familyurl";
import { type LabelKey, label } from "../../labels";
import { ROSTER } from "./AppsRoster.ts";

/** the site doors of the footer row, in reading order (the labels ride the
 * shell foot keys — the same words the chrome's footer carries). */
const SITEDOORS: readonly { href: string; key: LabelKey }[] = [
  { href: "/apps", key: "shell.foot.apps" },
  { href: "/pricing", key: "shell.foot.pricing" },
  { href: "/blog", key: "shell.foot.blog" },
  { href: "/support", key: "shell.foot.support" },
  { href: "/legal", key: "shell.foot.legal" },
];

/**
 * The footer strip: the site doors, the family row and the legal line.
 *
 * @returns the footer element.
 */
export function IntroFooter() {
  return (
    <footer className="cb-introfoot">
      <div className="cb-introwrap">
        <nav className="cb-introfoot__row" aria-label={label("intro.footer.siteAria")}>
          <span className="cb-eyebrow">{label("shell.foot.siteHead")}</span>
          {SITEDOORS.map((door) => (
            <a key={door.href} className="cb-introfoot__door" href={door.href}>
              {label(door.key)}
            </a>
          ))}
        </nav>
        <nav className="cb-introfoot__row" aria-label={label("intro.footer.familyAria")}>
          <span className="cb-eyebrow">{label("intro.footer.family")}</span>
          {ROSTER.map((member) => (
            <a
              key={member.slug}
              className="cb-introfoot__fam"
              href={familyurl(member.slug)}
              target="_blank"
              rel="noreferrer"
              style={{ "--cb-dot": member.accent } as CSSProperties}
              data-tip={label("intro.footer.memberTip").replaceAll("{slug}", member.slug)}
            >
              <span className="cb-introfoot__dot" aria-hidden="true" />
              {member.slug}
            </a>
          ))}
        </nav>
        <p className="cb-introfoot__legal">{label("shell.colophon")}</p>
      </div>
    </footer>
  );
}

export default IntroFooter;
