// the debonair shell of the theme.
/**
 * Shell.tsx — the ONE chrome of the theme, shared by every page: the
 * Windows 11 taskbar pinned to the top edge — a 48px dark acrylic surface
 * (saturate(3) blur(20px)) over a dark bottom hairline — carrying the drawn
 * debonair mark on the LEFT EDGE, the pages as icon-only 38px pins (no text
 * labels: the name surfaces in the hover tooltip, the ::after ladder marks
 * the active page in signal amber), the call-to-action and the tray with
 * the app domain and the local time. There is no labeled start button: the
 * mark itself is the Start trigger and clicking it opens the floating
 * navigation menu, an elevated solid panel with the page grid and a search
 * that filters it. The signal brass lives in the drawn mark and the content
 * accents only.
 */
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { LayoutDashboard, Library, Search, Settings2, Sparkles, Wand2, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toggleTheme } from "../../theme";

export type NavLink = { label: string; href: string };

/** primary navigation of the site (shell configuration, one entry per page) */
export const NAV: readonly NavLink[] = [
  { label: "Studio", href: "/studio" },
  { label: "Generate", href: "/generate" },
  { label: "Library", href: "/library" },
  { label: "Settings", href: "/settings" },
];

/* ------------------------------ the drawn mark ---------------------------- */

/**
 * DebonairMark — the premium drawn icon of the chrome, rebuilt in the house
 * icon spirit (Sol/shell/app.icons.tsx): a gradient squircle face over the
 * debonair amber story, a soft top gloss, a mid layer of story orbs over a
 * pedestal band, two blurred inner contours, a contact ellipse, a discrete
 * film grain and the glyph in thick ivory strokes over a translucent
 * backing. The finishing (glow breathing, perspective tilt, glyph lift, one
 * sheen sweep on hover) is animated by Sol/sol.css — plain
 * transform/opacity/filter transitions, guarded for reduced motion.
 */

/** the amber story of debonair: face gradient top, glow and orb */
const MARK_STORY = "#bd7a1a";
/** the deep shade the face gradient settles into */
const MARK_DEEP = "#7c4c0a";
/** the warm subtone of the mid layer, contours and contact ellipse */
const MARK_SOFT = "#f2ddab";
/** the warm ivory of the glyph strokes */
const MARK_IVORY = "#fbf5ea";
/** the asymmetric squircle of the face: tighter shoulders, heavier base */
const MARK_SQUIRCLE = "M22 0 L74 0 Q96 0 96 22 L96 66 Q96 96 66 96 L30 96 Q0 96 0 66 L0 22 Q0 0 22 0 Z";

type MarkProps = {
  /** rendered square size in px; omitted, the mark fills its sized box */
  size?: number;
  /** hides the mark from the accessibility tree (decorative placements) */
  hidden?: boolean;
};

/** The audio DAW glyph: a five-band equalizer in full swing. */
function MarkGlyph() {
  return (
    <>
      <rect x="27.2" y="39" width="5.6" height="18" rx="2.8" fill={MARK_IVORY} stroke="none" opacity=".78" />
      <rect x="36.2" y="34" width="5.6" height="28" rx="2.8" fill={MARK_IVORY} stroke="none" opacity=".88" />
      <rect x="45.2" y="28" width="5.6" height="40" rx="2.8" fill={MARK_IVORY} stroke="none" />
      <rect x="54.2" y="34" width="5.6" height="28" rx="2.8" fill={MARK_IVORY} stroke="none" opacity=".88" />
      <rect x="63.2" y="39" width="5.6" height="18" rx="2.8" fill={MARK_IVORY} stroke="none" opacity=".78" />
    </>
  );
}

export function DebonairMark({ size, hidden }: MarkProps) {
  const vars = size ? { width: size, height: size } : undefined;
  return (
    <span className="sol-mark" style={vars} aria-hidden={hidden || undefined}>
      <span className="sol-mark__glow" />
      <svg className="sol-mark__svg" viewBox="0 0 96 96" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="dbnm-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={MARK_STORY} />
            <stop offset=".6" stopColor={MARK_STORY} />
            <stop offset="1" stopColor={MARK_DEEP} />
          </linearGradient>
          <linearGradient id="dbnm-gloss" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity=".32" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="dbnm-orb" cx=".5" cy=".5" r=".5">
            <stop offset="0" stopColor={MARK_SOFT} stopOpacity=".9" />
            <stop offset=".35" stopColor={MARK_SOFT} stopOpacity=".5" />
            <stop offset="1" stopColor={MARK_SOFT} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="dbnm-edge-l" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={MARK_SOFT} stopOpacity="0" />
            <stop offset=".45" stopColor={MARK_SOFT} stopOpacity=".3" />
            <stop offset="1" stopColor={MARK_SOFT} stopOpacity=".7" />
          </linearGradient>
          <linearGradient id="dbnm-edge-d" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={MARK_SOFT} stopOpacity="0" />
            <stop offset=".5" stopColor={MARK_SOFT} stopOpacity=".22" />
            <stop offset="1" stopColor={MARK_SOFT} stopOpacity=".55" />
          </linearGradient>
          <linearGradient id="dbnm-sheen" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
            <stop offset=".45" stopColor="#ffffff" stopOpacity=".5" />
            <stop offset=".55" stopColor="#ffffff" stopOpacity=".5" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <filter id="dbnm-soft" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <filter id="dbnm-wide" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <filter id="dbnm-lift" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor={MARK_DEEP} floodOpacity=".38" />
          </filter>
          <filter id="dbnm-grain" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" result="n" />
            <feColorMatrix in="n" type="saturate" values="0" />
            <feComposite operator="in" in2="SourceGraphic" />
          </filter>
          <clipPath id="dbnm-clip">
            <path d={MARK_SQUIRCLE} />
          </clipPath>
        </defs>

        {/* the face: gradient squircle with a soft top gloss */}
        <path d={MARK_SQUIRCLE} fill="url(#dbnm-bg)" />
        <path d={MARK_SQUIRCLE} fill="url(#dbnm-gloss)" opacity=".5" />

        <g clipPath="url(#dbnm-clip)">
          {/* the mid layer: story orbs breathing over a pedestal band */}
          <g className="sol-mark__mid">
            <circle cx="48" cy="40" r="25" fill="url(#dbnm-orb)" filter="url(#dbnm-wide)" opacity=".85" />
            <rect x="-12" y="56" width="120" height="44" fill={MARK_SOFT} opacity=".3" filter="url(#dbnm-soft)" />
          </g>

          {/* two blurred inner contours of the squircle */}
          <path
            d={MARK_SQUIRCLE}
            fill="none"
            stroke="url(#dbnm-edge-d)"
            strokeWidth="6"
            filter="url(#dbnm-wide)"
            opacity=".55"
            transform="translate(1.4 1.9) scale(0.97)"
          />
          <path
            d={MARK_SQUIRCLE}
            fill="none"
            stroke="url(#dbnm-edge-l)"
            strokeWidth="2.5"
            filter="url(#dbnm-soft)"
            opacity=".5"
          />

          {/* the contact ellipse at the base */}
          <ellipse cx="48" cy="94" rx="30" ry="7" fill="url(#dbnm-orb)" filter="url(#dbnm-soft)" opacity=".55" />

          {/* the sheen band sweeping once on hover */}
          <g className="sol-mark__sheen">
            <rect x="-11" y="-24" width="26" height="144" fill="url(#dbnm-sheen)" transform="skewX(-16)" />
          </g>

          {/* the discrete film grain */}
          <path d={MARK_SQUIRCLE} fill="#ffffff" filter="url(#dbnm-grain)" opacity=".08" />
        </g>

        {/* the glyph: thick ivory strokes lifting toward the viewer */}
        <g filter="url(#dbnm-lift)">
          <g className="sol-mark__glyph" fill="none" stroke={MARK_IVORY} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
            <MarkGlyph />
          </g>
        </g>
      </svg>
    </span>
  );
}

/* -------------------------------- the menu -------------------------------- */

/** one entry of the taskbar pins and the start menu: a page surface with
 * its tile glyph (the pin shows the icon only — the name rides the tooltip) */
type StartApp = {
  href: string;
  label: string;
  detail: string;
  icon: typeof LayoutDashboard;
};

/** the pages the theme launches, one pin/tile each (the whole theme, the
 * DAW home pinned first) */
const START_APPS: readonly StartApp[] = [
  { href: "/", label: "Home", detail: "the audio DAW of the OS", icon: LayoutDashboard },
  { href: "/studio", label: "Studio", detail: "timeline, mixer and transport", icon: Wand2 },
  { href: "/generate", label: "Generate", detail: "text-to-music render queue", icon: Sparkles },
  { href: "/library", label: "Library", detail: "renders, genres and statuses", icon: Library },
  { href: "/settings", label: "Settings", detail: "appearance and region", icon: Settings2 },
];

/** filters the start menu tiles by label or detail */
function searchStartApps(query: string): readonly StartApp[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return START_APPS;
  return START_APPS.filter(
    (app) => app.label.toLowerCase().includes(needle) || app.detail.toLowerCase().includes(needle),
  );
}

/** the glyph of a pinned page (resolved from the start menu map; the pin
 * shows the icon only — the name rides the hover tooltip) */
function pinIcon(href: string): typeof LayoutDashboard {
  return START_APPS.find((app) => app.href === href)?.icon ?? LayoutDashboard;
}

/** formats the local clock for the tray */
function formatClock(date: Date): string {
  return new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(date);
}

/** the tray clock, refreshed twice a minute */
function useTrayClock(): string {
  const [clock, setClock] = useState(() => formatClock(new Date()));
  useEffect(() => {
    const tick = window.setInterval(() => setClock(formatClock(new Date())), 30_000);
    return () => window.clearInterval(tick);
  }, []);
  return clock;
}

type ShellProps = {
  /** mark override rendered inside the start trigger (the default is the drawn debonair mark) */
  brand?: ReactNode;
  name: string;
  nav?: readonly NavLink[];
  cta?: NavLink;
  /** when true the main outlet carries the shell container width */
  contained?: boolean;
  footerLinks: readonly NavLink[];
  themeButton?: boolean;
  domain: string;
  children: ReactNode;
};

export function Shell({
  brand,
  name,
  nav = NAV,
  cta,
  contained = false,
  footerLinks,
  themeButton = true,
  domain,
  children,
}: ShellProps) {
  const [location, navigate] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement | null>(null);
  const clock = useTrayClock();

  // opening focuses the search; Escape always closes the menu
  useEffect(() => {
    if (!menuOpen) return;
    searchRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const active = (href: string): boolean =>
    location === href || (href !== "/" && location.startsWith(`${href}/`));
  const results = searchStartApps(query);
  const year = new Date().getFullYear();

  /** launches one start menu entry: closes the menu and navigates */
  function openApp(href: string) {
    setMenuOpen(false);
    setQuery("");
    navigate(href);
  }

  return (
    <div className="app-frame">
      <header className="dt-nav">
        {/* the mark is the Start trigger: no labeled start button, no brand text */}
        <button
          type="button"
          className="dt-nav__start"
          aria-label={`${name} start menu`}
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
          aria-controls={menuOpen ? "dt-start-menu" : undefined}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {brand ?? <DebonairMark size={26} hidden />}
        </button>
        {/* the pinned pages: icons only — the name shows in the hover tooltip,
            the ::after ladder carries the active state */}
        <nav className="dt-nav__pins" aria-label="Pinned pages">
          {nav.map((item) => {
            const Icon = pinIcon(item.href);
            const activePin = active(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="dt-nav__app"
                aria-label={item.label}
                aria-current={activePin ? "page" : undefined}
                data-open={activePin ? "true" : undefined}
                data-active={activePin ? "true" : undefined}
              >
                <Icon size={17} strokeWidth={1.7} aria-hidden="true" />
                <span className="dt-nav__tip" aria-hidden="true">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="dt-nav__tray">
          {cta ? (
            <Link className="dt-nav__cta" href={cta.href}>
              {cta.label}
            </Link>
          ) : null}
          <span>{domain}</span>
          <time>{clock}</time>
        </div>
      </header>

      {menuOpen && (
        <>
          <button
            type="button"
            className="dt-start__backdrop"
            aria-label="Close the start menu"
            onClick={() => setMenuOpen(false)}
          />
          <section
            className="dt-start"
            id="dt-start-menu"
            role="dialog"
            aria-modal="true"
            aria-label={`${name} navigation`}
          >
            <div className="dt-start__search">
              <Search size={15} aria-hidden="true" />
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search the pages"
                aria-label="Search the pages"
              />
              {query && (
                <button type="button" onClick={() => setQuery("")} aria-label="Clear the search">
                  <X size={14} aria-hidden="true" />
                </button>
              )}
            </div>
            <p className="dt-start__label">{query ? "results" : "pages"}</p>
            <div className="dt-start__grid">
              {results.map((app, index) => {
                const Icon = app.icon;
                return (
                  <button
                    key={app.href}
                    type="button"
                    className="dt-start__app"
                    title={app.detail}
                    style={{ animationDelay: `${Math.min(index * 70, 350)}ms` } as CSSProperties}
                    onClick={() => openApp(app.href)}
                  >
                    <span
                      className="dt-tile"
                      style={{ "--app-tint": "var(--sol-primary)" } as CSSProperties}
                      aria-hidden="true"
                    >
                      <Icon size={18} strokeWidth={1.7} />
                    </span>
                    <strong>{app.label}</strong>
                  </button>
                );
              })}
              {!results.length && <p className="dt-start__empty">No page matches “{query}”.</p>}
            </div>
            <footer className="dt-start__foot">
              <DebonairMark size={13} hidden />
              <span>debonair · katexis engine</span>
            </footer>
          </section>
        </>
      )}

      <main className={contained ? "app-main shell" : "app-main"}>{children}</main>
      <footer className="footer">
        <span>
          ©{" "}
          <span data-year={year}>{year}</span> wenathlan · {domain}
        </span>
        <span className="spacer" />
        {footerLinks.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
        {themeButton ? (
          <button
            className="btn small secondary"
            type="button"
            aria-label="Toggle light theme"
            onClick={() => toggleTheme()}
          >
            Theme
          </button>
        ) : null}
      </footer>
    </div>
  );
}
