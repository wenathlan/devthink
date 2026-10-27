// the getry shell of the theme.
/**
 * Shell.tsx — the app surface of the getry, answering the FAMILY
 * STANDALONE LAW: an app accessed by its own url (wenathlan.github.io/
 * devthink/getry/) is the normal application, one hundred percent — it
 * renders FULL-BLEED, the routed stage owning the whole viewport with the
 * page rail as the app's own navigation (no window chrome of its own: no
 * title bar, no caption buttons, no resize handles, no inactive
 * grayscale, no entry scale). The WINDOW (the draggable frame with the
 * captions and the eight handles) exists ONLY when the app is embedded
 * inside the DevThink OS power clip — the framed contract below renders
 * the routed stage bare (shell--embedded) and the OS draws the window
 * around it. The rail keeps the Windows 11 hands on the pages themselves
 * (the 48px pin rail: the press at scale .7, the popintro entrance, the
 * ladder indicator, the acrylic tooltip, the family dots, the theme flip)
 * and the stage scrolls itself under the rail; the getry violet stays the
 * identity accent of the mark and the content.
 */

import {
  BrainRegular,
  ChatMultipleRegular,
  HomeRegular,
  LayerRegular,
  WeatherMoonRegular,
  WeatherSunnyRegular,
} from "@fluentui/react-icons";
import { type ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { familyrow } from "../../family.ts";
import { familyurl } from "../../familyurl.ts";
import { label, labelfill } from "../../labels";
import { currentTheme, type ThemeName, toggleTheme } from "../../theme.ts";

/** one entry of the window rail: a page surface of the app with its glyph. */
export type StartApp = {
  href: string;
  label: string;
  detail: string;
  icon: typeof HomeRegular;
};

/** the pages the application hosts, one rail entry each (the gateway
 * home first, then the session store, the reasoning ladder and the gateway
 * versions — the rail order of the polish pass). exported for the onboarding
 * copy beside this folder. the labels ride the copy law (labels.ts). */
export const START_APPS: readonly StartApp[] = [
  { href: "/", label: label("shell.rail.home"), detail: label("shell.rail.homeDetail"), icon: HomeRegular },
  {
    href: "/sessions",
    label: label("shell.rail.sessions"),
    detail: label("shell.rail.sessionsDetail"),
    icon: ChatMultipleRegular,
  },
  {
    href: "/thinking",
    label: label("shell.rail.thinking"),
    detail: label("shell.rail.thinkingDetail"),
    icon: BrainRegular,
  },
  {
    href: "/versions",
    label: label("shell.rail.versions"),
    detail: label("shell.rail.versionsDetail"),
    icon: LayerRegular,
  },
];

/**
 * the theme flip of the rail foot: flips the in-memory theme, stores nothing.
 *
 * @returns the toggle element.
 */
function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeName>(currentTheme());
  return (
    <button
      type="button"
      className="winapp__theme"
      aria-label={label("shell.theme.aria")}
      onClick={() => setTheme(toggleTheme())}
    >
      {theme === "dark" ? (
        <WeatherSunnyRegular fontSize={15} aria-hidden="true" />
      ) : (
        <WeatherMoonRegular fontSize={15} aria-hidden="true" />
      )}
    </button>
  );
}

/**
 * the app surface: the Windows pin rail and the routed stage beside it,
 * owning the whole viewport.
 *
 * @param children the routed page.
 * @returns the app surface element.
 */
export function Shell({ children }: { children: ReactNode }) {
  // the embedded contract: inside the os power clip the app rides the host
  // window chrome — the routed stage renders bare, full-bleed in the frame
  const framed = (() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  })();

  const [location] = useLocation();

  // the active rail entry: the bare path owns home, every other page owns its route
  const isActive = (href: string): boolean =>
    href === "/" ? location === "/" : location === href || location.startsWith(`${href}/`);

  // the embedded pass renders before the stage: one window, one frame
  if (framed) return <main className="shell shell--embedded">{children}</main>;

  // the standalone pass: the direct url answers full-bleed — the window
  // chrome exists only inside the os power clip, so the app owns the whole
  // viewport; the page rail stays as the app's own navigation and the
  // routed stage fills the rest of the screen
  return (
    <div className="shell shell--standalone">
      <div className="winapp__body">
        {/* the Windows pin rail — the mount pops the pins in (dtPopIntro,
            staggered), the ladder indicator marks hover and the active page,
            the acrylic tooltip names it and the rail foot carries the family
            row (one accent dot per sibling, resolved through the familyurl
            contract so every link survives any mount point) */}
        <nav className="railnav railnav--enter" aria-label={label("shell.rail.aria")}>
          {START_APPS.map((app) => {
            const Icon = app.icon;
            return (
              <Link
                key={app.href}
                href={app.href}
                className="railnav__item"
                data-tip={app.detail}
                aria-label={app.label}
                aria-current={isActive(app.href) ? "page" : undefined}
              >
                <Icon fontSize={20} aria-hidden="true" />
              </Link>
            );
          })}
          <fieldset className="railnav__foot" aria-label={label("shell.family.aria")}>
            {familyrow().map((member) => (
              <a
                key={member.slug}
                className="railnav__fam"
                href={familyurl(member.slug)}
                target="_blank"
                rel="noreferrer"
                data-tip={labelfill("shell.family.tip", { slug: member.slug })}
              >
                <span aria-hidden="true" className="railnav__famdot" style={{ background: member.accent }} />
                <span className="sr-only">{labelfill("shell.family.tab", { slug: member.slug })}</span>
              </a>
            ))}
            <ThemeToggle />
          </fieldset>
        </nav>
        <div className="winapp__stage">
          <main className="shell">{children}</main>
        </div>
      </div>
    </div>
  );
}

export default Shell;
