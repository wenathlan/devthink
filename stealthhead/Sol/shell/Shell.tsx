/**
 * Shell.tsx — the app surface of the stealthhead, answering the FAMILY
 * STANDALONE LAW: an app accessed by its own url (wenathlan.github.io/
 * devthink/stealthhead/) is the normal application, one hundred percent —
 * it renders FULL-BLEED, the routed stage owning the whole viewport with
 * the page rail as the app's own navigation (no window chrome of its own:
 * no title bar, no caption buttons, no resize handles, no inactive
 * grayscale, no entry scale). The WINDOW (the draggable frame with the
 * captions and the eight handles) exists ONLY when the app is embedded
 * inside the DevThink OS power clip — the framed contract below renders
 * the routed stage bare (shell--embedded) and the OS draws the window
 * around it. The rail keeps the Windows 11 hands on the pages themselves
 * (the pins with the press at scale .7, the popintro entrance and the
 * state ladder, the family foot with one accent-dotted link per sibling
 * built by the familyurl helper — the family redirects both ways, the
 * theme flip) and the stage scrolls itself under the rail.
 */

import {
  TargetRegular as Crosshair,
  GlobeRegular as Globe,
  TableRegular as LayoutDashboard,
  WeatherMoonRegular as Moon,
  WeatherSunnyRegular as Sun,
  FlashRegular as Swords,
  TrophyRegular as Trophy,
} from "@fluentui/react-icons";
import { type CSSProperties, type ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { familyrow } from "../../family.ts";
import { familyurl } from "../../familyurl.ts";
import { type LabelKey, labelfill, label } from "../../labels";
import { currentTheme, type ThemeName, toggleTheme } from "../../theme.ts";

/** one entry of the window rail: a page surface of the app with its glyph.
 * the text rides the label accessor — the keys answer the store. */
export type StartApp = {
  href: string;
  labelKey: LabelKey;
  detailKey: LabelKey;
  icon: typeof LayoutDashboard;
};

/** the pages the application hosts, one rail entry each in the grammar
 * order (home, match, weapons, world, ranking). exported for the
 * onboarding copy beside this folder. */
export const START_APPS: readonly StartApp[] = [
  { href: "/", labelKey: "shell.rail.home", detailKey: "shell.rail.homeDetail", icon: LayoutDashboard },
  { href: "/match", labelKey: "shell.rail.match", detailKey: "shell.rail.matchDetail", icon: Swords },
  { href: "/weapons", labelKey: "shell.rail.weapons", detailKey: "shell.rail.weaponsDetail", icon: Crosshair },
  { href: "/world", labelKey: "shell.rail.world", detailKey: "shell.rail.worldDetail", icon: Globe },
  { href: "/ranking", labelKey: "shell.rail.ranking", detailKey: "shell.rail.rankingDetail", icon: Trophy },
];

/**
 * the theme flip of the rail foot: flips the in-memory theme, stores nothing.
 *
 * @returns the toggle element.
 */
function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeName>(currentTheme());
  return (
    <button type="button" className="winapp__theme" aria-label={label("shell.theme.aria")} onClick={() => setTheme(toggleTheme())}>
      {theme === "dark" ? <Sun fontSize={14} aria-hidden="true" /> : <Moon fontSize={14} aria-hidden="true" />}
      {theme}
    </button>
  );
}

/**
 * the app surface: the page rail and the routed stage beside it, owning
 * the whole viewport.
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
        <nav className="winapp__rail" aria-label={label("shell.rail.aria")}>
          <p className="winapp__railhead" aria-hidden="true">
            {label("shell.rail.head")}
          </p>
          {START_APPS.map((app) => {
            const Icon = app.icon;
            return (
              <Link
                key={app.href}
                href={app.href}
                className="winapp__raillink"
                data-tip={label(app.detailKey)}
                aria-label={label(app.labelKey)}
                aria-current={isActive(app.href) ? "page" : undefined}
              >
                <Icon fontSize={16} strokeWidth={1.7} aria-hidden="true" />
                <span className="winapp__raillabel">{label(app.labelKey)}</span>
              </Link>
            );
          })}
          <div className="winapp__railfoot">
            <p className="winapp__familyhead" aria-hidden="true">
              {label("shell.family.head")}
            </p>
            <div className="winapp__family">
              {familyrow().map((member) => (
                <a
                  key={member.slug}
                  className="winapp__famlink"
                  href={familyurl(member.slug)}
                  target="_blank"
                  rel="noreferrer"
                  data-tip={labelfill("shell.family.tip", { slug: member.slug })}
                  aria-label={labelfill("shell.family.aria", { slug: member.slug })}
                  style={{ "--fam-dot": member.accent } as CSSProperties}
                >
                  <span className="winapp__famdot" aria-hidden="true" />
                  <span className="winapp__famlabel">{member.slug}</span>
                </a>
              ))}
            </div>
            <ThemeToggle />
          </div>
        </nav>
        <div className="winapp__stage">
          <main className="shell">{children}</main>
        </div>
      </div>
    </div>
  );
}

export default Shell;
