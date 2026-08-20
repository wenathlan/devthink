/** Style: DevThink Terminal Atelier — focused management shell sharing the browser-workbench materials without copying its chat canvas. */
import { ArrowLeft, BarChart3, FolderKanban, Network, PlugZap, Settings2, TerminalSquare } from "lucide-react";
import { Link, useLocation } from "wouter";

const navigation = [
  { href: "/providers", label: "providers", icon: PlugZap },
  { href: "/projects", label: "projects", icon: FolderKanban },
  { href: "/routes", label: "routes", icon: Network },
  { href: "/usage", label: "usage", icon: BarChart3 },
  { href: "/settings", label: "settings", icon: Settings2 },
];

type ControlShellProps = { eyebrow: string; title: string; summary: string; children: React.ReactNode };

export function ControlShell({ eyebrow, title, summary, children }: ControlShellProps) {
  const [location] = useLocation();
  return <main className="control-page"><header className="control-page__header"><Link href="/" className="control-brand"><span aria-hidden="true">✦</span><strong>DEVTHINK</strong><small>local control</small></Link><nav aria-label="DevThink areas">{navigation.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={location === href ? "control-nav__link control-nav__link--active" : "control-nav__link"}><Icon size={15} /><span>{label}</span></Link>)}</nav><Link className="control-page__return" href="/"><ArrowLeft size={14} />workspace</Link></header><section className="control-page__hero"><p>{eyebrow}</p><h1>{title}</h1><span>{summary}</span></section><section className="control-page__body">{children}</section><footer className="control-page__footer"><TerminalSquare size={14} />provider credentials stay in <code>~/.config/devthink/auth.json</code></footer></main>;
}
