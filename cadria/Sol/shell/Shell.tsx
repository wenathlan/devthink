/**
 * Shell.tsx — the app surface of the cadria, answering the FAMILY
 * STANDALONE LAW: an app accessed by its own url (wenathlan.github.io/
 * devthink/cadria/) is the normal application, one hundred percent — it
 * renders FULL-BLEED, the routed stage owning the whole viewport with the
 * icon rail as the app's own navigation (no window chrome of its own: no
 * title bar, no caption buttons, no resize handles, no inactive
 * grayscale, no entry scale). The WINDOW (the draggable frame with the
 * captions and the eight handles) exists ONLY when the app is embedded
 * inside the DevThink OS power clip — the framed contract below renders
 * the routed stage bare (shell--embedded) and the OS draws the window
 * around it. The rail keeps the Windows 11 hands on the pages themselves
 * (the 48px pins: 38×38 r4 washes, the press rides scale .7, the mount
 * pops the pins in, the ladder indicator marks hover/active and the
 * acrylic tooltip names the page; the rail foot repeats the family row so
 * the app itself links the siblings through familyurl, with the theme
 * flip at the end). The presentation intro (/intro) stays outside the
 * app surface — it hands the surface over through the onboarding, and
 * every seat after it mounts inside this ONE surface. The only css the
 * shell owns is the glue block below (skip link, stage gutter, the page
 * transition — 250ms window ease, fade + 4px rise). Session scope only:
 * the theme flip writes a data-theme attribute on <html> and nothing
 * else — zero storage, zero persistence.
 *
 * Mount law: the shell mounts ONCE — Sol/Sol.tsx wraps the routed Switch and
 * the page anchors render bare inside .sol-page (the shell keeps accepting
 * the window-era props so any legacy call site keeps compiling; nothing is
 * consumed beyond themeButton).
 */

import {
  CutRegular,
  HomeRegular,
  ImageRegular,
  PlayCircleRegular,
  SettingsRegular,
  WandRegular,
  WeatherMoonRegular,
  WeatherSunnyRegular,
} from "@fluentui/react-icons";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { familyrow } from "../../family.ts";
import { familyurl } from "../../familyurl.ts";
import { type LabelKey, label } from "../../labels.ts";
import { currentTheme, type Theme, toggleTheme } from "../../theme.ts";

export { CadriaMark } from "../wingets";

/** one entry of the shell navigation (the legacy page prop shape, kept for
 * the anchors that type against the shell beside this folder) */
export type NavLink = { label: string; href: string };

/** one entry of the icon rail: a page surface of the app with its glyph. */
export type StartApp = {
  href: string;
  label: LabelKey;
  detail: LabelKey;
  icon?: typeof HomeRegular;
};

/** the pages the platform hosts, one rail entry each (the apex home first).
 * exported for the onboarding copy beside this folder. */
export const START_APPS: readonly StartApp[] = [
  { href: "/", label: "shell.rail.home", detail: "shell.rail.homeDetail", icon: HomeRegular },
  {
    href: "/player",
    label: "shell.rail.player",
    detail: "shell.rail.playerDetail",
    icon: PlayCircleRegular,
  },
  {
    href: "/studio",
    label: "shell.rail.studio",
    detail: "shell.rail.studioDetail",
    icon: WandRegular,
  },
  {
    href: "/edit",
    label: "shell.rail.editor",
    detail: "shell.rail.editorDetail",
    icon: CutRegular,
  },
  {
    href: "/gallery",
    label: "shell.rail.gallery",
    detail: "shell.rail.galleryDetail",
    icon: ImageRegular,
  },
  {
    href: "/settings",
    label: "shell.rail.settings",
    detail: "shell.rail.settingsDetail",
    icon: SettingsRegular,
  },
];

/** SSR-safe read of the session theme: the document may not exist while
 * rendering on the server, so the sol dark default answers for it. */
function sessionTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return currentTheme();
}

/**
 * the theme flip of the rail foot: flips the in-memory theme on <html>,
 * stores nothing (session scope, per the family storage law).
 *
 * @returns the toggle element.
 */
function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(sessionTheme);
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      className="icon-anim"
      data-tip={next === "light" ? label("shell.theme.tipLight") : label("shell.theme.tipDark")}
      aria-label={next === "light" ? label("shell.theme.ariaLight") : label("shell.theme.ariaDark")}
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

/** the glue css of the app surface: the skip link, the stage gutter and the
 * page transition (fade + 4px rise on the window ease; the reduced-motion
 * guard of sol.css covers it). everything else rides the sol.css primitives. */
const SHELL_CSS = `
.sol-skip { position: fixed; top: -56px; left: 12px; z-index: var(--z-toast); padding: 10px 14px; border: 1px solid var(--line-strong); border-radius: var(--radius-md); background: var(--surface-1); color: var(--ink); font-size: 13px; font-weight: 600; transition: top var(--dur-1) var(--ease-out); }
.sol-skip:focus-visible { top: 12px; }
.sol-stage { scrollbar-gutter: stable; }
/* the stage gutter: the ONE padding of the platform — every page anchor renders
   bare inside it, so the gutters can never drift between seats (the negative
   bleeds of the home hero quote the same clamp pair by contract) */
.sol-page { padding: clamp(20px, 4vw, 56px) clamp(16px, 4vw, 40px) clamp(24px, 5vw, 56px); animation: solPageIn var(--dur-2) var(--ease-window) backwards; outline: none; }
@keyframes solPageIn { from { opacity: 0; transform: translateY(4px); } }
`;

/** the shell props: the routed page plus the legacy window-era props the
 * page anchors still pass — accepted for compilation, only themeButton is
 * consumed (the app grammar names itself). */
type ShellProps = {
  children: ReactNode;
  name?: string;
  nav?: readonly NavLink[];
  cta?: NavLink;
  contained?: boolean;
  footerLinks?: readonly NavLink[];
  themeButton?: boolean;
  domain?: string;
};

/**
 * the app surface: the icon rail and the routed stage beside it, owning
 * the whole viewport.
 *
 * @param children the routed page.
 * @returns the app surface element.
 */
export function Shell({ children, themeButton = true }: ShellProps) {
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
  const stageRef = useRef<HTMLDivElement | null>(null);

  // every navigation lands at the top of the stage (the scroll lives on the
  // stage column, so the rail never moves)
  // biome-ignore lint/correctness/useExhaustiveDependencies: the location change is the reset trigger
  useEffect(() => {
    stageRef.current?.scrollTo({ top: 0 });
  }, [location]);

  // the bare path (no search) drives the active rail entry:
  // the bare path owns home, every other page owns its route
  const path = location.split("?")[0] ?? "/";
  const isActive = (href: string): boolean =>
    href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`);

  // the embedded pass renders before the stage: one window, one frame
  if (framed) return <main className="shell shell--embedded">{children}</main>;

  // the standalone pass: the direct url answers full-bleed — the window
  // chrome exists only inside the os power clip, so the app owns the whole
  // viewport; the icon rail stays as the app's own navigation and the
  // routed stage fills the rest of the screen
  return (
    <div className="shell shell--standalone">
      <style>{SHELL_CSS}</style>
      <a className="sol-skip" href="#sol-main">
        {label("shell.skip")}
      </a>

      <div className="winapp__body">
        {/* the fixed icon rail beside the routed stage — the mount pops the
            pins in (popintro, staggered) and the rail foot carries the
            family row: one accent dot per sibling, resolved through the
            familyurl contract so every link survives any mount point, with
            the theme flip at the end */}
        <nav
          className="railnav railnav--enter"
          aria-label={label("shell.rail.primary")}
          style={{ borderRight: "1px solid var(--line)" }}
        >
          {START_APPS.map((app) => {
            const Icon = app.icon ?? HomeRegular;
            return (
              <Link
                key={app.href}
                href={app.href}
                className="railnav__item"
                data-tip={label(app.label)}
                aria-label={label(app.label)}
                aria-current={isActive(app.href) ? "page" : undefined}
              >
                <Icon fontSize={20} aria-hidden="true" />
              </Link>
            );
          })}
          <fieldset className="railnav__foot" aria-label={label("shell.rail.family")}>
            {familyrow().map((member) => (
              <a
                key={member.slug}
                href={familyurl(member.slug)}
                target="_blank"
                rel="noreferrer"
                className="railnav__fam"
                data-tip={label("shell.rail.familyTip").replace("{slug}", member.slug)}
              >
                <span aria-hidden="true" className="railnav__famdot" style={{ background: member.accent }} />
                <span className="sr-only">{label("shell.rail.familyOpen").replace("{slug}", member.slug)}</span>
              </a>
            ))}
            {themeButton ? <ThemeToggle /> : null}
          </fieldset>
        </nav>
        <div ref={stageRef} className="sol-stage winapp__stage">
          <main id="sol-main" key={location} tabIndex={-1} className="sol-page">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export default Shell;
