/**
 * App — the global anchor (layer 1 of the anchor architecture) and the only
 * TSX outside the theme. The root manages the themes as single files: it
 * imports only the theme anchor (sol/sol.tsx — the file named after the theme
 * folder, beside sol/sol.css) and the theme stylesheet, wraps the anchor in
 * the global concerns it owns (the error boundary, the theme and tooltip
 * providers, the toaster and the wouter router provider) and renders it. The
 * whole route tree lives behind the theme anchor; no page or component of the
 * theme is ever imported here.
 */
import { createRoot } from 'react-dom/client';
import { Router as WouterRouter } from 'wouter';
import Sol from './sol/sol';
import { ErrorBoundary, ThemeProvider, Toaster, TooltipProvider } from './sol/shell/Shell.tsx';
import '@fontsource-variable/geist-mono';
import '@fontsource-variable/inter';
import './sol/sol.css';
import { seedlabels } from './labels';

import { routerBase } from "./routerbase.ts";
// the copy law rides the boot: the seed refreshes the label store rows
// (translated rows protected) before the first paint answers
if (typeof window !== 'undefined') void seedlabels().catch(() => {});

/* the zoom lock law (the faun pattern the owner pinned in the reference):
   the viewport meta rides every html entry and pins the touch door, but the
   desktop page zoom never reads the meta — the browser scales the whole
   document on the ctrl wheel (and the trackpad pinch reports itself as one),
   and the console breaks. the compute console answers at its own door: one
   capture listener eats the default of every ctrl wheel before the browser
   owns it. no surface of the console rides the browser zoom — the sandbox
   tables, the mesh nodes and the audit log scroll, nothing listens for the
   ctrl wheel — so the guard never steals a gesture the app serves: a plain
   wheel stays a scroll, the propagation never stops for the widgets above.
   the window flag arms once per page: the hot reload re-executes this module
   and never stacks a second listener */
type ZoomLockHost = Window & { __saddlezoomlock?: boolean };
const zoomlockhost = (typeof window === "undefined" ? undefined : (window as ZoomLockHost));
if (zoomlockhost && !zoomlockhost.__saddlezoomlock) {
  zoomlockhost.__saddlezoomlock = true;
  zoomlockhost.addEventListener(
    "wheel",
    (event) => {
      if (event.ctrlKey) event.preventDefault();
    },
    { passive: false, capture: true },
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in sol/sol.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook


function App() {
        return (
                <ErrorBoundary>
                        {/* the trylle canvas boots dark (the reform wave foundation); the
                         * window theme flip rides in memory only, never storage */}
                        <ThemeProvider defaultTheme="dark">
                                <TooltipProvider>
                                        <Toaster />
                                        <WouterRouter base={routerBase("saddle")}>
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
