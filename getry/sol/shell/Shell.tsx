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
 * the SAME surface tree under the shell--embedded seat: the rail, the
 * stage and the family foot answer in both seats so the design is
 * IDENTICAL at the direct url and inside the os window (the window-era
 * law), and the OS draws the window chrome around it. The design pass
 * (task 2-b) dresses the shell in the reference desktop language: the
 * wallpaper behind one huge rounded window, the rail as the dark acrylic
 * column, and the win11 tray strip over the stage — the brand seat, the
 * live page lane and the real clock (time only, never a fake reading).
 */

import {
  BrainRegular,
  ChatEmptyRegular,
  ChatMultipleRegular,
  ClockRegular,
  HomeRegular,
  LayerRegular,
  ProjectionScreenRegular,
  WeatherMoonRegular,
  WeatherSunnyRegular,
} from "@fluentui/react-icons";
import { type ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { familyrow } from "../../family.ts";
import { familyurl } from "../../familyurl.ts";
import { label, labelfill } from "../../labels";
import { currentTheme, type ThemeName, toggleTheme } from "../../theme.ts";
import { BrandMark } from "../../wingets";

/** one entry of the window rail: a page surface of the app with its glyph. */
export type StartApp = {
  href: string;
  label: string;
  detail: string;
  icon: typeof HomeRegular;
};

/** the pages the application hosts, one rail entry each (the devthink
 * chat first — the flagship conversation surface over the live routes —
 * then the gateway home, the session store, the reasoning ladder and the
 * gateway versions). exported for the onboarding copy beside this folder.
 * the labels ride the copy law (labels.ts). */
export const START_APPS: readonly StartApp[] = [
  {
    href: "/studio",
    label: label("shell.rail.studio"),
    detail: label("shell.rail.studioDetail"),
    icon: ProjectionScreenRegular,
  },
  {
    href: "/chat",
    label: label("shell.rail.chat"),
    detail: label("shell.rail.chatDetail"),
    icon: ChatEmptyRegular,
  },
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

/** pads one clock digit (the 24h face of the tray). */
function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

/**
 * the tray clock: the REAL local time (the win11 tray seat of the design
 * pass — a clock is real, no weather is invented), refreshed every 15s so
 * the minute never lags.
 *
 * @returns the hh:mm label.
 */
function useTrayClock(): string {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const tick = window.setInterval(() => setNow(new Date()), 15000);
    return () => window.clearInterval(tick);
  }, []);
  return `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
}

/**
 * the app surface: the wallpaper, the rounded window, the dark acrylic pin
 * rail and the routed stage with the tray strip above it, owning the whole
 * viewport.
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
  const clock = useTrayClock();

  // the active rail entry: the bare path owns home, every other page owns its route
  const isActive = (href: string): boolean =>
    href === "/" ? location === "/" : location === href || location.startsWith(`${href}/`);

  // the live page lane of the tray: the label of the route the stage hosts
  const pagelane = START_APPS.find((app) => isActive(app.href));

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
      <div className="winapp__body">
        {/* the dark acrylic pin rail of the reference — the mount pops the
            pins in (dtPopIntro, staggered), the ladder indicator marks hover
            and the active page, the acrylic tooltip names it and the rail
            foot carries the family row (one accent dot per sibling,
            resolved through the familyurl contract so every link survives
            any mount point) */}
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
        <div className="winapp__stagecol">
          {/* the win11 tray strip: the brand seat at the left, the live page
              lane and the real clock at the right — the cosmetic desktop
              furniture of the design pass, every value honest */}
          <div className="sol-tray" role="contentinfo" aria-label={label("shell.tray.aria")}>
            <span className="sol-tray__brand">
              <BrandMark size={20} />
              <span className="sol-tray__name">{label("ShellBrand")}</span>
              <span className="sol-tray__role">{label("shell.role")}</span>
            </span>
            <span className="sol-tray__lane">
              {pagelane ? labelfill("shell.tray.page", { page: pagelane.label }) : label("shell.rail.aria")}
            </span>
            <span className="sol-tray__clock" aria-label={label("shell.tray.clock")}>
              <ClockRegular fontSize={13} aria-hidden="true" />
              {clock}
            </span>
          </div>
          <div className="winapp__stage">
            <main className="shell">{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Shell;
