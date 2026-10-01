// the argan shell of the theme.
// # Shell — shared frame of the theme: the magnetic topnav, the main outlet and the
// sticky footer wrap every page. Navigation labels are shell configuration; every
// content row the pages render comes from the data layer.
import type { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { toggleTheme } from "../../theme";

export type NavLink = { label: string; href: string };

/** primary navigation of the site (shell configuration, one entry per page) */
export const NAV: readonly NavLink[] = [
  { label: "Zones", href: "/zones" },
  { label: "DNSSEC", href: "/dnssec" },
  { label: "Gateway", href: "/gateway" },
  { label: "Settings", href: "/settings" },
];

type ShellProps = {
  /** brand mark rendered beside the app name (argan carries the orb) */
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
  const [location] = useLocation();
  const active = (href: string): boolean =>
    location === href || (href !== "/" && location.startsWith(`${href}/`));
  const year = new Date().getFullYear();

  return (
    <div className="app-frame">
      <header className="topnav">
        <Link className="brand" href="/" aria-label={`${name} home`}>
          {brand ?? <span className="brand-orb" aria-hidden="true" />}
          {name}
        </Link>
        <nav aria-label="Primary">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} aria-current={active(item.href) ? "page" : undefined}>
              {item.label}
            </Link>
          ))}
          {cta ? (
            <Link className="btn small cta" href={cta.href} style={{ color: "var(--sol-primary-ink)" }}>
              {cta.label}
            </Link>
          ) : null}
        </nav>
      </header>
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
