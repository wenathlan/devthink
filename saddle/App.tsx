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

import { routerBase } from "./routerbase.ts";
// the copy law rides the boot: the seed refreshes the label store rows
// (translated rows protected) before the first paint answers
if (typeof window !== 'undefined') void seedlabels().catch(() => {});

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
