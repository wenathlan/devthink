/**
 * Shell.tsx — the app surface of the foundry, answering the FAMILY
 * STANDALONE LAW: an app accessed by its own url (wenathlan.github.io/
 * devthink/foundry/) is the normal application, one hundred percent — it
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
 * (the pins with their labels, the accent ladder on the active entry, the
 * family foot with one spec §12 accent dot per sibling resolved by
 * familyurl, the theme flip) and the stage scrolls itself under the rail.
 */

import {
  BoxMultipleRegular,
  CheckmarkCircleRegular,
  HomeRegular,
  LayerRegular,
  WeatherMoonRegular,
  WeatherSunnyRegular,
} from "@fluentui/react-icons";
import { type CSSProperties, type ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { familyAccentOf, familyrow } from "../../family.ts";
import { familyurl } from "../../familyurl.ts";
import { labelfill, label } from "../../labels.ts";

/** the theme in memory: flips the data-theme attribute, stores nothing */
type ThemeName = "dark" | "light";

/** the theme in memory for the current document lifetime (the light fusion default) */
let theme: ThemeName = "light";

/**
 * Reads the theme currently applied in this document.
 *
 * @returns the active theme name.
 */
function currentTheme(): ThemeName {
  return theme;
}

/**
 * Applies a theme by flipping the document attribute; the css token
 * variant does the rest.
 *
 * @param next the theme to apply.
 */
function applyTheme(next: ThemeName): void {
  theme = next;
  document.documentElement.dataset.theme = next;
}

/**
 * Flips between the two variants and applies the result.
 *
 * @returns the theme now active.
 */
function toggleTheme(): ThemeName {
  const next: ThemeName = theme === "dark" ? "light" : "dark";
  applyTheme(next);
  return next;
}

/** one rail entry: a page surface of the app with its glyph. */
export type RailApp = {
  href: string;
  label: string;
  detail: string;
  icon: typeof HomeRegular;
};

/** the pages the application hosts, one rail entry each — the real
 * surface set of the foundry: the landing first, then the three platform
 * pages of the machine room. exported for the onboarding copy beside this
 * folder. */
export const START_APPS: readonly RailApp[] = [
  { href: "/", label: label("nav.home"), detail: label("nav.homeDetail"), icon: HomeRegular },
  {
    href: "/sandboxes",
    label: label("nav.sandboxes"),
    detail: label("nav.sandboxesDetail"),
    icon: BoxMultipleRegular,
  },
  { href: "/images", label: label("nav.images"), detail: label("nav.imagesDetail"), icon: LayerRegular },
  {
    href: "/artifacts",
    label: label("nav.artifacts"),
    detail: label("nav.artifactsDetail"),
    icon: CheckmarkCircleRegular,
  },
];

/** the rail family row: the nine siblings beside the foundry, resolved
 * through family.ts — the one §12 table the chrome, the landing and the
 * tests all read. */
const FAMILY = familyrow();

/**
 * The theme flip at the foot of the rail: flips the in-memory theme, stores
 * nothing on the visitor machine.
 *
 * @returns the toggle element.
 */
function ThemeToggle() {
  const [current, setCurrent] = useState<ThemeName>(currentTheme());
  return (
    <button type="button" className="win-theme" aria-label={label("shell.theme.tip")} onClick={() => setCurrent(toggleTheme())}>
      {current === "dark" ? (
        <WeatherSunnyRegular fontSize={14} aria-hidden="true" />
      ) : (
        <WeatherMoonRegular fontSize={14} aria-hidden="true" />
      )}
      {current}
    </button>
  );
}

/**
 * The shared shell: the app surface — the page rail with the family foot
 * and the content zone beside it — owning the whole viewport.
 *
 * @param children the routed page.
 * @returns the app surface element.
 */
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

  // the active rail entry: the bare path owns home, every other page owns
  // its route
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
          <p className="win-railhead" aria-hidden="true">
            {label("shell.rail.head")}
          </p>
          {START_APPS.map((app) => {
            const Icon = app.icon;
            return (
              <Link
                key={app.href}
                href={app.href}
                className="win-raillink"
                data-tip={app.detail}
                aria-label={app.label}
                aria-current={isActive(app.href) ? "page" : undefined}
              >
                <Icon fontSize={16} aria-hidden="true" />
                <span className="win-raillabel">{app.label}</span>
              </Link>
            );
          })}
          <div className="win-railfoot">
            <p className="win-railhead" aria-hidden="true">
              {label("shell.family.head")}
            </p>
            {FAMILY.map((app) => {
              const member = familyAccentOf(app.slug);
              return (
                <a
                  key={app.slug}
                  className="win-famlink"
                  href={familyurl(app.slug)}
                  target="_blank"
                  rel="noreferrer"
                  data-tip={labelfill("shell.family.tip", { slug: app.slug })}
                  aria-label={labelfill("shell.family.openAria", { slug: app.slug })}
                  style={{ "--fd-dot": member?.accent } as CSSProperties}
                >
                  <span className="win-famdot" aria-hidden="true" />
                  <span className="win-famname">{app.slug}</span>
                </a>
              );
            })}
            <ThemeToggle />
          </div>
        </nav>
        <div className="win-content">{children}</div>
      </div>
    </div>
  );
}

export default Shell;
