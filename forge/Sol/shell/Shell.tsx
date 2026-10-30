/**
 * Shell.tsx — the app surface of the forge, answering the FAMILY
 * STANDALONE LAW: an app accessed by its own url (wenathlan.github.io/
 * devthink/forge/) is the normal application, one hundred percent — it
 * renders FULL-BLEED, the routed stage owning the whole viewport with the
 * page rail as the app's own navigation (no window chrome of its own: no
 * title bar, no caption buttons, no resize handles, no inactive
 * grayscale, no entry scale). The WINDOW (the draggable frame with the
 * captions and the eight handles) exists ONLY when the app is embedded
 * inside the DevThink OS power clip — the framed contract below renders
 * the SAME surface tree under the shell--embedded seat: the rail, the
 * stage and the family foot answer in both seats so the design is
 * IDENTICAL at the direct url and inside the os window (the window-era
 * law), and the OS draws the window chrome around it. The rail keeps the
 * Windows 11 hands on the pages themselves
 * (the 48px pins, the press at scale .7, the state ladder, the acrylic
 * tooltips, the family foot with one identity dot per sibling resolved
 * by familyurl, the theme flip) and the stage scrolls itself under the
 * rail.
 */

import {
  HomeRegular,
  ListRegular,
  PulseRegular,
  WeatherMoonRegular,
  WeatherSunnyRegular,
  WindowConsoleRegular,
} from "@fluentui/react-icons";
import { type ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { FAMILY_SLUGS, familyAccentOf } from "../../family";
import { familyurl } from "../../familyurl";
import { labelfill, label } from "../../labels";
import { currentTheme, type Theme, toggleTheme } from "../../theme";

/** one entry of the window rail: a page surface of the app with its glyph. */
export type RailApp = {
  href: string;
  label: string;
  detail: string;
  icon: typeof HomeRegular;
};

/** the pages the application hosts, one rail pin each — the real
 * surface set of the forge: the landing first, then the three platform
 * pages of the runner floor. exported for the flow components beside this
 * folder. */
export const RAIL_APPS: readonly RailApp[] = [
  { href: "/", label: label("nav.home"), detail: label("nav.homeDetail"), icon: HomeRegular },
  { href: "/runs", label: label("nav.runs"), detail: label("nav.runsDetail"), icon: PulseRegular },
  { href: "/queue", label: label("nav.queue"), detail: label("nav.queueDetail"), icon: ListRegular },
  { href: "/logs", label: label("nav.logs"), detail: label("nav.logsDetail"), icon: WindowConsoleRegular },
];

/**
 * The theme flip of the rail foot: flips the in-memory theme, stores
 * nothing (a cold load starts from the dark canvas again).
 *
 * @returns the toggle element.
 */
function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(currentTheme());
  return (
    <button
      type="button"
      className="win-theme"
      data-tip={label("shell.theme.tip")}
      aria-label={label("shell.theme.tip")}
      onClick={() => setTheme(toggleTheme())}
    >
      {theme === "dark" ? (
        <WeatherSunnyRegular fontSize={16} aria-hidden="true" />
      ) : (
        <WeatherMoonRegular fontSize={16} aria-hidden="true" />
      )}
    </button>
  );
}

/** the shared shell: the app surface — the page rail with the family foot
 * and the content zone beside it — owning the whole viewport */
export function Shell({ children }: { children: ReactNode }) {
  // the embedded contract: inside the os power clip the app rides the host
  // window chrome — the seat class answers the mount, the surface tree
  // never changes between the two doors (the window-era law: one design)
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

  // the embedded seat: inside the os power clip the app rides the host
  // window chrome, but the SURFACE stays the same — the seat class answers
  // the mount so differential styles (if any) can find it, the tree never
  // changes between the two doors (the window-era law: one design)
  const seat = framed ? "shell--embedded" : "shell--standalone";

  // the surface pass: the direct url answers full-bleed — the window
  // chrome exists only inside the os power clip, so the app owns the whole
  // viewport; the page rail stays as the app's own navigation and the
  // routed stage fills the rest of the screen
  return (
    <div className={`shell ${seat}`}>
      <div className="win-body">
        <nav className="win-rail" aria-label={label("shell.rail.aria")}>
          {RAIL_APPS.map((app) => {
            const Icon = app.icon;
            return (
              <Link
                key={app.href}
                href={app.href}
                className="win-raillink"
                data-tip={app.label}
                aria-label={app.label}
                aria-current={isActive(app.href) ? "page" : undefined}
              >
                <Icon fontSize={18} aria-hidden="true" />
              </Link>
            );
          })}
          <div className="win-railfoot">
            <div className="win-family">
              {FAMILY_SLUGS.map((slug) => {
                const member = familyAccentOf(slug);
                return (
                  <a
                    key={slug}
                    className="win-family__link"
                    href={familyurl(slug)}
                    target="_blank"
                    rel="noreferrer"
                    data-tip={slug}
                    aria-label={labelfill("shell.family.openAria", { slug })}
                  >
                    <span
                      className="win-family__dot"
                      data-app={slug}
                      style={member ? { background: member.accent } : undefined}
                      aria-hidden="true"
                    />
                    <span className="win-sr">{slug}</span>
                  </a>
                );
              })}
            </div>
            <ThemeToggle />
          </div>
        </nav>
        <div className="win-content">{children}</div>
      </div>
    </div>
  );
}

export default Shell;
