/**
 * Shell.tsx — the app surface of the vault, answering the FAMILY
 * STANDALONE LAW: an app accessed by its own url (wenathlan.github.io/
 * devthink/vault/) is the normal application, one hundred percent — it
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
 * (the pins, the press ladder, the family foot with one spec §12 accent
 * dot per sibling resolved by familyurl, the theme flip), and the stage
 * scrolls itself under the rail.
 */

import {
  ArchiveRegular,
  HomeRegular,
  HourglassRegular,
  LockClosedRegular,
  WeatherMoonRegular,
  WeatherSunnyRegular,
} from "@fluentui/react-icons";
import { type ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { FAMILY_SLUGS, familyAccentOf } from "../../family.ts";
import { familyurl } from "../../familyurl.ts";
import { label, labelfill } from "../../labels";
import { useUicopy } from "../../uistore.ts";
import { Toaster } from "../wingets";

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

/** the siblings of the family (the DevThink OS first, then the apps) —
 * every link opens in its own tab and every sibling links back. The dots
 * ride the spec §12 accents from family.ts — the one table the landing
 * footer and the tests read too (zero drift). */
const FAMILY = FAMILY_SLUGS;

/** one entry of the window rail: a page surface of the app with its glyph. */
export type RailApp = {
  href: string;
  label: string;
  detail: string;
  icon: typeof HomeRegular;
};

/** the pages the application hosts, one rail entry each — the real
 * surface set of the vault: the landing first, then the three platform
 * pages of the safe. exported for the flow components beside this folder.
 * the labels ride the copy law (labels.ts). */
export const RAIL_APPS: readonly RailApp[] = [
  { href: "/", label: label("shell.rail.home"), detail: label("shell.rail.homeDetail"), icon: HomeRegular },
  {
    href: "/objects",
    label: label("shell.rail.objects"),
    detail: label("shell.rail.objectsDetail"),
    icon: ArchiveRegular,
  },
  {
    href: "/buckets",
    label: label("shell.rail.buckets"),
    detail: label("shell.rail.bucketsDetail"),
    icon: LockClosedRegular,
  },
  {
    href: "/retention",
    label: label("shell.rail.retention"),
    detail: label("shell.rail.retentionDetail"),
    icon: HourglassRegular,
  },
];

/**
 * The theme flip of the rail foot: flips the in-memory theme, stores
 * nothing.
 *
 * @returns the toggle element.
 */
function ThemeToggle() {
  const [current, setCurrent] = useState<ThemeName>(currentTheme());
  return (
    <button
      type="button"
      className="win-theme"
      aria-label={label("shell.theme.aria")}
      onClick={() => setCurrent(toggleTheme())}
    >
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
  // the store mount: the live ui rows land once and every page of the
  // window re-renders onto them (the seed answers the first paint)
  useUicopy();

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
          <p className="win-rail__head" aria-hidden="true">
            {label("shell.rail.head")}
          </p>
          {RAIL_APPS.map((app) => {
            const Icon = app.icon;
            return (
              <Link
                key={app.href}
                href={app.href}
                className="win-rail__link"
                data-tip={app.detail}
                aria-label={app.label}
                aria-current={isActive(app.href) ? "page" : undefined}
              >
                <Icon fontSize={16} aria-hidden="true" />
                <span className="win-rail__label">{app.label}</span>
              </Link>
            );
          })}
          <div className="win-rail__foot">
            <p className="win-fam__head" aria-hidden="true">
              {label("shell.family.head")}
            </p>
            <div className="win-fam">
              {FAMILY.map((slug) => {
                const member = familyAccentOf(slug);
                return (
                  <a
                    key={slug}
                    className="win-fam__link"
                    href={familyurl(slug)}
                    target="_blank"
                    rel="noreferrer"
                    data-tip={labelfill("shell.family.tip", { slug })}
                    aria-label={slug}
                  >
                    <span
                      className="win-fam__dot"
                      data-app={slug}
                      style={member ? { background: member.accent } : undefined}
                      aria-hidden="true"
                    />
                    <span className="win-fam__name">{slug}</span>
                  </a>
                );
              })}
            </div>
            <ThemeToggle />
          </div>
        </nav>
        <div className="win-content">{children}</div>
      </div>
      <Toaster />
    </div>
  );
}

export default Shell;
