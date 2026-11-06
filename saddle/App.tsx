/**
 * App — the global anchor (layer 1 of the anchor architecture) and the only
 * TSX outside the theme. The root manages the themes as single files: it
 * imports only the theme anchor (sol/Sol.tsx — the file named after the theme
 * folder, beside sol/sol.css) and the theme stylesheet, wraps the anchor in
 * the global concerns it owns (the error boundary, the theme and tooltip
 * providers, the toaster and the wouter router provider) and renders it. The
 * whole route tree lives behind the theme anchor; no page or component of the
 * theme is ever imported here.
 */
import { createRoot } from 'react-dom/client';
import { Router as WouterRouter } from 'wouter';
import Sol from './sol/Sol';
import { ErrorBoundary, ThemeProvider, Toaster, TooltipProvider } from './sol/shell/Shell.tsx';
import '@fontsource-variable/geist-mono';
import '@fontsource-variable/inter';
import './sol/sol.css';
import { seedlabels } from './labels';

// the copy law rides the boot: the seed refreshes the label store rows
// (translated rows protected) before the first paint answers
if (typeof window !== 'undefined') void seedlabels().catch(() => {});

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in sol/sol.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

/** The router base derives from the declared base path so the same build serves
 * every host. A relative base ("./") cannot name the folder it lands in, but the
 * dispatcher always boots cold links at the application root first — so the
 * folder prefix of the boot pathname is exactly the router base (absolute, so
 * wouter never has to match against a relative prefix). The absolute bases
 * carry through unchanged. */
/** the route segments the theme answers to — the mount prefix of a deploy
 * unit is whatever precedes the first one of these in the boot path. */
const KNOWN_ROUTES: readonly string[] = [
        '/intro',
        '/onboarding',
        '/architecture',
        '/agent-browser',
        '/compute',
        '/integrations',
        '/playground',
        '/console',
        '/login',
        '/register',
        '/dashboard',
        '/docs',
        '/404',
];

function routerBase(): string {
        const declaredBase = import.meta.env.BASE_URL;
        // the build-time base wins (the pages workflow mounts every app at /<slug>/)
        if (declaredBase !== '/' && declaredBase !== './') return declaredBase.replace(/\/$/, '');
        const path = window.location.pathname.replace(/index\.html$/, '');
        // a known route at the root means the app is mounted at '/' — no base
        if (KNOWN_ROUTES.some((route) => path === route || path.startsWith(`${route}/`))) return '';
        // a lone first segment that is no known route is a mount prefix (the
        // power clip and the family stage serve this app under its slug)
        const segments = path.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
        if (segments.length === 1) return `/${segments[0]}`;
        // otherwise the mount prefix is whatever precedes the first known segment
        // (the static hosting case: the deep link still lands on its page)
        for (const route of KNOWN_ROUTES) {
                const at = path.indexOf(route);
                if (at > 0) return path.slice(0, at).replace(/\/$/, '');
        }
        return '';
}

function App() {
        return (
                <ErrorBoundary>
                        {/* the trylle canvas boots dark (the reform wave foundation); the
                         * window theme flip rides in memory only, never storage */}
                        <ThemeProvider defaultTheme="dark">
                                <TooltipProvider>
                                        <Toaster />
                                        <WouterRouter base={routerBase()}>
                                                <Sol />
                                        </WouterRouter>
                                </TooltipProvider>
                        </ThemeProvider>
                </ErrorBoundary>
        );
}

/* The self-mount: the app owns its bootstrap — the retired main.tsx
 * wrapper is gone, so this module is the single entry the html loads
 * (the doctrine of the 2.1.0 universal interface: one tsx app, the
 * router and the mount live together). */
const rootmount = typeof document !== 'undefined' ? document.getElementById('root') : null;
if (rootmount) {
        createRoot(rootmount).render(<App />);
}

export default App;
