// the saddle shell of the theme.
// Shell — the one chrome of the saddle Sol theme, converted from the OS
// grammar to the APPLICATION grammar (the family window recipe): the routed
// pages render inside one Windows 11 application window floating over the
// Mica backdrop — a title bar carrying the drawn saddle mark and the app
// name (the drag handle, double-click toggles maximize), the Fluent caption
// buttons at the right edge (minimize collapses the window into a restore
// chip, maximize fills the backdrop, close relaunches the app at /intro)
// and a left rail of SECTIONS (workspace / platform / library / account)
// that switches the pages as the window content. The file also exports
// every shared primitive the page folders import from "./shell/Shell" (or
// "@/shell/Shell"): PageShell, SaddleMark, SectionRail, ThemeProvider,
// useTheme, ErrorBoundary, Button, buttonVariants, the Card family, the
// Tooltip family and the Toaster. Nothing shared lives loose at the theme
// root; page-specific components live in the page folder that owns them.

import { Slot } from '@radix-ui/react-slot';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cva, type VariantProps } from 'class-variance-authority';
import {
	AlertTriangle,
	AppWindow,
	BookOpen,
	Boxes,
	Copy,
	Cpu,
	FlaskConical,
	Gauge,
	LayoutDashboard,
	LogIn,
	Minus,
	Moon,
	PlugZap,
	RotateCcw,
	Square,
	Sun,
	TerminalSquare,
	UserPlus,
	X,
} from 'lucide-react';
import { useTheme as useNextTheme } from 'next-themes';
import type * as React from 'react';
import {
	Component,
	type CSSProperties,
	createContext,
	type MouseEvent as ReactMouseEvent,
	type ReactNode,
	type PointerEvent as ReactPointerEvent,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react';
import { Toaster as Sonner, type ToasterProps } from 'sonner';
import { Link, useLocation } from 'wouter';
import type { MediaSlot } from '../../catalog';
import { cn } from '../../utils';

/* ============================ theme context ============================ */

type Theme = 'light' | 'dark';

interface ThemeContextType {
	theme: Theme;
	toggleTheme?: () => void;
	switchable: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
	children: React.ReactNode;
	defaultTheme?: Theme;
	switchable?: boolean;
}

export function ThemeProvider({
	children,
	defaultTheme = 'light',
	switchable = false,
}: ThemeProviderProps) {
	const [theme, setTheme] = useState<Theme>(() => {
		if (switchable) {
			const stored = localStorage.getItem('theme');
			return (stored as Theme) || defaultTheme;
		}
		return defaultTheme;
	});

	useEffect(() => {
		const root = document.documentElement;
		if (theme === 'dark') {
			root.classList.add('dark');
		} else {
			root.classList.remove('dark');
		}

		if (switchable) {
			localStorage.setItem('theme', theme);
		}
	}, [theme, switchable]);

	const toggleTheme = switchable
		? () => {
				setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
			}
		: undefined;

	return (
		<ThemeContext.Provider value={{ theme, toggleTheme, switchable }}>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error('useTheme must be used within ThemeProvider');
	}
	return context;
}

/* ============================= error boundary ========================== */

interface ErrorBoundaryProps {
	children: ReactNode;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error };
	}

	render() {
		if (this.state.hasError) {
			return (
				<div className="flex items-center justify-center min-h-screen p-8 bg-background">
					<div className="flex flex-col items-center w-full max-w-2xl p-8">
						<AlertTriangle size={48} className="text-destructive mb-6 flex-shrink-0" />

						<h2 className="text-xl mb-4">An unexpected error occurred.</h2>

						<div className="p-4 w-full rounded bg-muted overflow-auto mb-6">
							<pre className="text-sm text-muted-foreground whitespace-break-spaces">
								{this.state.error?.stack}
							</pre>
						</div>

						<button
							type="button"
							onClick={() => window.location.reload()}
							className={cn(
								'flex items-center gap-2 px-4 py-2 rounded-lg',
								'bg-primary text-primary-foreground',
								'hover:opacity-90 cursor-pointer',
							)}
						>
							<RotateCcw size={16} />
							Reload Page
						</button>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

/* =============================== brand mark ============================ */

/**
 * SaddleMark — the premium drawn icon of the theme, rebuilt in the house
 * icon spirit (the devthink Sol/shell/app.icons.tsx standard): a gradient
 * squircle face over the saddle tan-leather story, a soft top gloss, a mid
 * layer of story orbs over a pedestal band, two blurred inner contours, a
 * contact ellipse, a discrete film grain and the glyph in thick ivory
 * strokes over a translucent backing. The finishing (glow breathing,
 * perspective tilt, glyph lift, one sheen sweep on hover) is animated by
 * Sol/sol.css — plain transform/opacity/filter transitions, guarded for
 * reduced motion and coarse pointers. Sized by the caller class or by the
 * chrome CSS (.dt-nav__start .sol-mark, .dt-start__foot .sol-mark).
 */

/** the tan-leather story of saddle: face gradient top, glow and orb */
const MARK_STORY = '#d6b483';
/** the deep shade the face gradient settles into */
const MARK_DEEP = '#8f6b3c';
/** the warm subtone of the mid layer, contours and contact ellipse */
const MARK_SOFT = '#f2e3c8';
/** the warm ivory of the glyph strokes */
const MARK_IVORY = '#fbf5ea';
/** the translucent backing of the outlined glyph shapes */
const MARK_BACKING = 'rgba(255,255,255,.14)';
/** the asymmetric squircle of the face: tighter shoulders, heavier base */
const MARK_SQUIRCLE =
	'M22 0 L74 0 Q96 0 96 22 L96 66 Q96 96 66 96 L30 96 Q0 96 0 66 L0 22 Q0 0 22 0 Z';

type SaddleMarkProps = {
	className?: string;
	label?: string;
	/** rendered square size in px; omitted, the mark is sized by the class */
	size?: number;
	/** hides the mark from the accessibility tree (decorative placements) */
	hidden?: boolean;
};

/** The sandbox engine glyph: the crate drawn in light isometric. */
function MarkGlyph() {
	return (
		<>
			<path d="M31 42.5 L40 33 H65 L56 42.5 Z" fill={MARK_BACKING} />
			<path d="M56 42.5 L65 33 V56 L56 65.5 Z" fill="rgba(255,255,255,.09)" />
			<rect x="31" y="42.5" width="25" height="23" rx="2.5" fill={MARK_BACKING} />
		</>
	);
}

export function SaddleMark({ className, label = 'Saddle', size, hidden }: SaddleMarkProps) {
	const a11y =
		label && !hidden
			? ({ role: 'img', 'aria-label': label } as const)
			: ({ 'aria-hidden': true } as const);
	const sized = size ? ({ width: size, height: size } as CSSProperties) : undefined;
	return (
		<span className={cn('sol-mark', className)} style={sized} {...a11y}>
			<span className="sol-mark__glow" />
			<svg className="sol-mark__svg" viewBox="0 0 96 96" aria-hidden="true" focusable="false">
				<defs>
					<linearGradient id="sdlm-bg" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor={MARK_STORY} />
						<stop offset=".6" stopColor={MARK_STORY} />
						<stop offset="1" stopColor={MARK_DEEP} />
					</linearGradient>
					<linearGradient id="sdlm-gloss" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#ffffff" stopOpacity=".32" />
						<stop offset="1" stopColor="#ffffff" stopOpacity="0" />
					</linearGradient>
					<radialGradient id="sdlm-orb" cx=".5" cy=".5" r=".5">
						<stop offset="0" stopColor={MARK_SOFT} stopOpacity=".9" />
						<stop offset=".35" stopColor={MARK_SOFT} stopOpacity=".5" />
						<stop offset="1" stopColor={MARK_SOFT} stopOpacity="0" />
					</radialGradient>
					<linearGradient id="sdlm-edge-l" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor={MARK_SOFT} stopOpacity="0" />
						<stop offset=".45" stopColor={MARK_SOFT} stopOpacity=".3" />
						<stop offset="1" stopColor={MARK_SOFT} stopOpacity=".7" />
					</linearGradient>
					<linearGradient id="sdlm-edge-d" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor={MARK_SOFT} stopOpacity="0" />
						<stop offset=".5" stopColor={MARK_SOFT} stopOpacity=".22" />
						<stop offset="1" stopColor={MARK_SOFT} stopOpacity=".55" />
					</linearGradient>
					<linearGradient id="sdlm-sheen" x1="0" y1="0" x2="1" y2="1">
						<stop offset="0" stopColor="#ffffff" stopOpacity="0" />
						<stop offset=".45" stopColor="#ffffff" stopOpacity=".5" />
						<stop offset=".55" stopColor="#ffffff" stopOpacity=".5" />
						<stop offset="1" stopColor="#ffffff" stopOpacity="0" />
					</linearGradient>
					<filter id="sdlm-soft" x="-40%" y="-40%" width="180%" height="180%">
						<feGaussianBlur stdDeviation="3" />
					</filter>
					<filter id="sdlm-wide" x="-60%" y="-60%" width="220%" height="220%">
						<feGaussianBlur stdDeviation="8" />
					</filter>
					<filter id="sdlm-lift" x="-40%" y="-40%" width="180%" height="180%">
						<feDropShadow
							dx="0"
							dy="2"
							stdDeviation="2"
							floodColor={MARK_DEEP}
							floodOpacity=".38"
						/>
					</filter>
					<filter id="sdlm-grain" x="0%" y="0%" width="100%" height="100%">
						<feTurbulence
							type="fractalNoise"
							baseFrequency="0.9"
							numOctaves="2"
							stitchTiles="stitch"
							result="n"
						/>
						<feColorMatrix in="n" type="saturate" values="0" />
						<feComposite operator="in" in2="SourceGraphic" />
					</filter>
					<clipPath id="sdlm-clip">
						<path d={MARK_SQUIRCLE} />
					</clipPath>
				</defs>

				{/* the face: gradient squircle with a soft top gloss */}
				<path d={MARK_SQUIRCLE} fill="url(#sdlm-bg)" />
				<path d={MARK_SQUIRCLE} fill="url(#sdlm-gloss)" opacity=".5" />

				<g clipPath="url(#sdlm-clip)">
					{/* the mid layer: story orbs breathing over a pedestal band */}
					<g className="sol-mark__mid">
						<circle
							cx="48"
							cy="40"
							r="25"
							fill="url(#sdlm-orb)"
							filter="url(#sdlm-wide)"
							opacity=".85"
						/>
						<rect
							x="-12"
							y="56"
							width="120"
							height="44"
							fill={MARK_SOFT}
							opacity=".3"
							filter="url(#sdlm-soft)"
						/>
					</g>

					{/* two blurred inner contours of the squircle */}
					<path
						d={MARK_SQUIRCLE}
						fill="none"
						stroke="url(#sdlm-edge-d)"
						strokeWidth="6"
						filter="url(#sdlm-wide)"
						opacity=".55"
						transform="translate(1.4 1.9) scale(0.97)"
					/>
					<path
						d={MARK_SQUIRCLE}
						fill="none"
						stroke="url(#sdlm-edge-l)"
						strokeWidth="2.5"
						filter="url(#sdlm-soft)"
						opacity=".5"
					/>

					{/* the contact ellipse at the base */}
					<ellipse
						cx="48"
						cy="94"
						rx="30"
						ry="7"
						fill="url(#sdlm-orb)"
						filter="url(#sdlm-soft)"
						opacity=".55"
					/>

					{/* the sheen band sweeping once on hover */}
					<g className="sol-mark__sheen">
						<rect
							x="-11"
							y="-24"
							width="26"
							height="144"
							fill="url(#sdlm-sheen)"
							transform="skewX(-16)"
						/>
					</g>

					{/* the discrete film grain */}
					<path d={MARK_SQUIRCLE} fill="#ffffff" filter="url(#sdlm-grain)" opacity=".08" />
				</g>

				{/* the glyph: thick ivory strokes lifting toward the viewer */}
				<g filter="url(#sdlm-lift)">
					<g
						className="sol-mark__glyph"
						fill="none"
						stroke={MARK_IVORY}
						strokeWidth="5"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<MarkGlyph />
					</g>
				</g>
			</svg>
		</span>
	);
}

/* =============================== section rail ========================== */

// Signal & Ledger: vertical rail giving operational sequence and orientation to the sections.
type SectionRailProps = {
	number: string;
	label: string;
};

export function SectionRail({ number, label }: SectionRailProps) {
	return (
		<div className="section-rail" role="group" aria-label={`${number} ${label}`}>
			<span className="rail-number">{number}</span>
			<span className="rail-line" />
			<span className="rail-label">{label}</span>
		</div>
	);
}

/* ============================= window chrome =========================== */

// the APPLICATION chrome (the family window recipe): the pages of the
// theme render as the content of ONE application window — a 48px acrylic
// title bar (the drag surface, double-click maximizes), Fluent caption
// buttons 44px wide and a left rail of SECTIONS whose active entry rides
// the sand accent ladder. The retired OS chrome (the taskbar and the
// floating start menu) lives only in the append-only history of Sol/sol.css.
/** one legacy nav entry (the prop shape the page anchors type against) */
export type NavLink = { label: string; href: string };

/** one entry of the window rail: a page surface of the app with its glyph. */
export type StartApp = {
	href: string;
	label: string;
	detail: string;
	icon: typeof LayoutDashboard;
};

/** one rail SECTION: a mono-labelled group of page entries. */
export type RailSection = {
	id: string;
	label: string;
	apps: readonly StartApp[];
};

/** the rail of the window, SECTIONED: workspace, platform, library and
 * account — one entry per page route, the apex home first. exported for
 * the onboarding copy beside this folder. */
export const NAV_SECTIONS: readonly RailSection[] = [
	{
		id: 'workspace',
		label: 'workspace',
		apps: [
			{ href: '/', label: 'home', detail: 'the thesis and the machine', icon: LayoutDashboard },
			{
				href: '/dashboard',
				label: 'dashboard',
				detail: 'sessions, users and the admin panel',
				icon: Gauge,
			},
			{ href: '/console', label: 'console', detail: 'operations and events', icon: TerminalSquare },
			{
				href: '/playground',
				label: 'playground',
				detail: 'live sandbox sessions',
				icon: FlaskConical,
			},
		],
	},
	{
		id: 'platform',
		label: 'platform',
		apps: [
			{ href: '/compute', label: 'compute', detail: 'execution layers and tiers', icon: Cpu },
			{
				href: '/integrations',
				label: 'integrations',
				detail: 'surfaces and bridges',
				icon: PlugZap,
			},
			{
				href: '/agent-browser',
				label: 'agentbrowser',
				detail: "the agent's own browser",
				icon: AppWindow,
			},
		],
	},
	{
		id: 'library',
		label: 'library',
		apps: [
			{ href: '/docs', label: 'docs', detail: 'the working notes', icon: BookOpen },
			{
				href: '/architecture',
				label: 'architecture',
				detail: 'repo, CI, pages, buckets',
				icon: Boxes,
			},
		],
	},
	{
		id: 'account',
		label: 'account',
		apps: [
			{ href: '/login', label: 'login', detail: 'sign in to the node', icon: LogIn },
			{ href: '/register', label: 'register', detail: 'create the local account', icon: UserPlus },
		],
	},
];

/** the pages the window hosts, flattened (the onboarding facts read this). */
export const START_APPS: readonly StartApp[] = NAV_SECTIONS.flatMap((section) => section.apps);

/** the hand-over route of the close caption: closing the window restarts the
 * application at the intro (the relaunch metaphor). */
const RESTART_ROUTE = '/intro';

/** the role line of the title bar (the honest description of the app). */
const APP_ROLE = 'the sandbox engine of the family';

/** one pointer session over the title bar: where the press started and the
 * offset the window carried when it did. */
type DragTrack = {
	pointerId: number;
	originX: number;
	originY: number;
	baseX: number;
	baseY: number;
};

/** keeps the dragged title bar reachable: the offset never slides the bar
 * fully off screen, so the window can always be grabbed back. */
function clampDrag(x: number, y: number): { x: number; y: number } {
	const spanX = Math.max(window.innerWidth / 2 - 80, 0);
	const spanY = Math.max(window.innerHeight / 2 - 60, 0);
	return { x: Math.min(spanX, Math.max(-spanX, x)), y: Math.min(spanY, Math.max(-spanY, y)) };
}

/**
 * the theme flip of the rail foot: flips the document theme class, stores
 * nothing (the in-memory doctrine of the window chrome).
 *
 * @returns the toggle element.
 */
function ThemeToggle() {
	const [theme, setTheme] = useState<Theme>(() =>
		typeof document === 'undefined' || document.documentElement.classList.contains('dark')
			? 'dark'
			: 'light',
	);
	/** flips the dark class on the root and mirrors it into the label. */
	function toggle() {
		const next = theme === 'dark' ? 'light' : 'dark';
		document.documentElement.classList.toggle('dark', next === 'dark');
		setTheme(next);
	}
	return (
		<button type="button" className="winapp__theme" aria-label="toggle theme" onClick={toggle}>
			{theme === 'dark' ? (
				<Sun size={14} aria-hidden="true" />
			) : (
				<Moon size={14} aria-hidden="true" />
			)}
			{theme}
		</button>
	);
}

/** the window props: the routed page plus the legacy page props the anchors
 * still pass (name, nav, cta, footer links, container width) — the window
 * grammar names itself, so only the theme toggle switch is consumed. */
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
 * the application window: title bar (brand, drag, caption buttons), the
 * SECTIONED page rail and the routed stage, floating over the Mica
 * backdrop.
 *
 * @param children the routed page.
 * @returns the window element.
 */
export function Shell({ children, themeButton = true }: ShellProps) {
	const [location, navigate] = useLocation();
	const [maximized, setMaximized] = useState(false);
	const [minimized, setMinimized] = useState(false);
	const [drag, setDrag] = useState({ x: 0, y: 0 });
	const trackRef = useRef<DragTrack | null>(null);

	/** maximizes over the backdrop or restores the windowed frame (the drag offset resets). */
	function toggleMaximize() {
		setDrag({ x: 0, y: 0 });
		setMaximized((value) => !value);
	}

	/** arms a drag when the pointer presses the empty bar (never the caption buttons). */
	function onTitlePointerDown(event: ReactPointerEvent<HTMLElement>) {
		if (maximized) return;
		if ((event.target as HTMLElement).closest('button, a, input')) return;
		trackRef.current = {
			pointerId: event.pointerId,
			originX: event.clientX,
			originY: event.clientY,
			baseX: drag.x,
			baseY: drag.y,
		};
		event.currentTarget.setPointerCapture(event.pointerId);
	}

	/** rides the pointer while a drag session is armed. */
	function onTitlePointerMove(event: ReactPointerEvent<HTMLElement>) {
		const track = trackRef.current;
		if (!track || track.pointerId !== event.pointerId) return;
		setDrag(
			clampDrag(
				track.baseX + event.clientX - track.originX,
				track.baseY + event.clientY - track.originY,
			),
		);
	}

	/** releases the drag session. */
	function onTitlePointerUp(event: ReactPointerEvent<HTMLElement>) {
		const track = trackRef.current;
		if (!track || track.pointerId !== event.pointerId) return;
		trackRef.current = null;
		event.currentTarget.releasePointerCapture(event.pointerId);
	}

	/** the Windows affordance: a double click on the empty bar toggles maximize. */
	function onTitleDoubleClick(event: ReactMouseEvent<HTMLElement>) {
		if ((event.target as HTMLElement).closest('button, a, input')) return;
		toggleMaximize();
	}

	// the active rail entry: the bare path owns home, every other page owns its route
	const isActive = (href: string): boolean =>
		href === '/' ? location === '/' : location === href || location.startsWith(`${href}/`);

	return (
		<div className="appframe" data-maximized={maximized ? 'true' : undefined}>
			<section
				className="winapp"
				hidden={minimized}
				data-maximized={maximized ? 'true' : undefined}
				aria-label="saddle"
				style={{ '--winapp-x': `${drag.x}px`, '--winapp-y': `${drag.y}px` } as CSSProperties}
			>
				<header
					className="winapp__title"
					data-dragging={trackRef.current ? 'true' : undefined}
					onPointerDown={onTitlePointerDown}
					onPointerMove={onTitlePointerMove}
					onPointerUp={onTitlePointerUp}
					onPointerCancel={onTitlePointerUp}
					onDoubleClick={onTitleDoubleClick}
				>
					<div className="winapp__brand">
						<SaddleMark size={20} hidden />
						<span className="winapp__name">saddle</span>
						<span className="winapp__role">{APP_ROLE}</span>
					</div>
					<div className="winapp__caption">
						<button
							type="button"
							className="winapp__cap"
							aria-label="Minimize"
							onClick={() => setMinimized(true)}
						>
							<Minus size={14} aria-hidden="true" />
						</button>
						<button
							type="button"
							className="winapp__cap"
							aria-label={maximized ? 'Restore' : 'Maximize'}
							onClick={toggleMaximize}
						>
							{maximized ? (
								<Copy size={12} aria-hidden="true" />
							) : (
								<Square size={11} aria-hidden="true" />
							)}
						</button>
						<button
							type="button"
							className="winapp__cap winapp__cap--close"
							aria-label="Close"
							onClick={() => navigate(RESTART_ROUTE)}
						>
							<X size={14} aria-hidden="true" />
						</button>
					</div>
				</header>

				<div className="winapp__body">
					<nav className="winapp__rail" aria-label="Pages">
						{NAV_SECTIONS.map((section) => (
							<div key={section.id} className="winapp__section">
								<p className="winapp__sectionlabel" aria-hidden="true">
									{section.label}
								</p>
								{section.apps.map((app) => {
									const Icon = app.icon;
									return (
										<Link
											key={app.href}
											href={app.href}
											className="winapp__raillink"
											title={app.detail}
											aria-label={app.label}
											aria-current={isActive(app.href) ? 'page' : undefined}
										>
											<Icon size={16} strokeWidth={1.7} aria-hidden="true" />
											<span className="winapp__raillabel">{app.label}</span>
										</Link>
									);
								})}
							</div>
						))}
						{themeButton ? (
							<div className="winapp__railfoot">
								<ThemeToggle />
							</div>
						) : null}
					</nav>
					<div className="winapp__stage">
						<main className="shell">{children}</main>
					</div>
				</div>
			</section>

			{minimized && (
				<button
					type="button"
					className="winchip"
					aria-label="Restore saddle"
					onClick={() => setMinimized(false)}
				>
					<SaddleMark size={16} hidden />
					<span>saddle</span>
				</button>
			)}
		</div>
	);
}

export default Shell;

/* ================================ page shell =========================== */

// Signal & Ledger: common frame for inner pages, preserving context and
// editorial rhythm. Since the window conversion the frame carries no chrome
// of its own — the window rail is the only navigation, so the page shell
// renders the intro, the content and the statusbar footer inside the stage.
type PageShellProps = {
	section: string;
	label: string;
	title: string;
	intro: string;
	children: ReactNode;
	media?: MediaSlot;
};

export function PageShell({ section, label, title, intro, children, media }: PageShellProps) {
	return (
		<div className="site-frame">
			<main>
				<section className="page-intro container">
					<SectionRail number={section} label={label} />
					<div className="page-intro-copy">
						<p className="eyebrow">SADDLE / {label}</p>
						<h1 className="page-title">{title}</h1>
						<p className="page-intro-text">{intro}</p>
					</div>
					{media && (
						<figure
							className="page-intro-art media-area"
							style={{ aspectRatio: media.ratio }}
							aria-label="media area"
						>
							<figcaption>
								<span>{media.label}</span>
								<span>{media.caption}</span>
							</figcaption>
						</figure>
					)}
				</section>
				<div className="page-content container">{children}</div>
			</main>
			<footer className="site-footer container">
				<span>© 2026 Saddle / distributed by design</span>
				<span className="mono-label">storage == compute</span>
			</footer>
		</div>
	);
}

/* ================================== button ============================= */

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
	{
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground hover:bg-primary/90',
				destructive:
					'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
				outline:
					'border bg-transparent shadow-xs hover:bg-accent dark:bg-transparent dark:border-input dark:hover:bg-input/50',
				secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
				ghost: 'hover:bg-accent dark:hover:bg-accent/50',
				link: 'text-primary underline-offset-4 hover:underline',
			},
			size: {
				default: 'h-9 px-4 py-2 has-[>svg]:px-3',
				sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
				lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
				icon: 'size-9',
				'icon-sm': 'size-8',
				'icon-lg': 'size-10',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

function Button({
	className,
	variant,
	size,
	asChild = false,
	...props
}: React.ComponentProps<'button'> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot : 'button';

	return (
		<Comp
			data-slot="button"
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

/* =================================== card ============================== */

function Card({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="card"
			className={cn(
				'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm',
				className,
			)}
			{...props}
		/>
	);
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="card-header"
			className={cn(
				'@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
				className,
			)}
			{...props}
		/>
	);
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="card-title"
			className={cn('leading-none font-semibold', className)}
			{...props}
		/>
	);
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="card-description"
			className={cn('text-muted-foreground text-sm', className)}
			{...props}
		/>
	);
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="card-action"
			className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
			{...props}
		/>
	);
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
	return <div data-slot="card-content" className={cn('px-6', className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="card-footer"
			className={cn('flex items-center px-6 [.border-t]:pt-6', className)}
			{...props}
		/>
	);
}

/* ================================= tooltip ============================= */

function TooltipProvider({
	delayDuration = 0,
	...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
	return (
		<TooltipPrimitive.Provider
			data-slot="tooltip-provider"
			delayDuration={delayDuration}
			{...props}
		/>
	);
}

function Tooltip({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
	return (
		<TooltipProvider>
			<TooltipPrimitive.Root data-slot="tooltip" {...props} />
		</TooltipProvider>
	);
}

function TooltipTrigger({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
	return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
	className,
	sideOffset = 0,
	children,
	...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
	return (
		<TooltipPrimitive.Portal>
			<TooltipPrimitive.Content
				data-slot="tooltip-content"
				sideOffset={sideOffset}
				className={cn(
					'bg-foreground text-background animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance',
					className,
				)}
				{...props}
			>
				{children}
				<TooltipPrimitive.Arrow className="bg-foreground fill-foreground z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" />
			</TooltipPrimitive.Content>
		</TooltipPrimitive.Portal>
	);
}

/* ================================== sonner ============================= */

const Toaster = ({ ...props }: ToasterProps) => {
	const { theme = 'system' } = useNextTheme();

	return (
		<Sonner
			theme={theme as ToasterProps['theme']}
			className="toaster group"
			style={
				{
					'--normal-bg': 'var(--popover)',
					'--normal-text': 'var(--popover-foreground)',
					'--normal-border': 'var(--border)',
				} as React.CSSProperties
			}
			{...props}
		/>
	);
};

/* ================================ exports ============================== */

export {
	Button,
	buttonVariants,
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
	Toaster,
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
};
