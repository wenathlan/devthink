/**
 * App — the global anchor (layer 1 of the anchor architecture) and the only
 * TSX outside the theme. The root manages the themes as single files: it
 * imports only the theme anchor (Sol/Sol.tsx — the file named after the theme
 * folder, beside Sol/sol.css) and the theme stylesheet, wraps the anchor in
 * the global concerns it owns (the error boundary, the theme and tooltip
 * providers, the toaster and the wouter router provider) and renders it. The
 * whole route tree lives behind the theme anchor; no page or component of the
 * theme is ever imported here.
 */
import { createRoot } from "react-dom/client";
import { ErrorBoundary, ThemeProvider, Toaster, TooltipProvider } from "./Sol/shell/Shell";
import { Router as WouterRouter } from "wouter";
import Sol from "./Sol/Sol";
import "./Sol/sol.css";

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in Sol/sol.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

/** The router base derives from the declared base path so the same build serves
 * every host. A relative base ("./") cannot name the folder it lands in, but the
 * dispatcher always boots cold links at the application root first — so the
 * folder prefix of the boot pathname is exactly the router base (absolute, so
 * wouter never has to match against a relative prefix). The absolute bases
 * carry through unchanged. */
function routerBase(): string {
  const declaredBase = import.meta.env.BASE_URL;
  if (declaredBase !== "/" && declaredBase !== "./") return declaredBase.replace(/\/$/, "");
  const bootPath = window.location.pathname.replace(/index\.html$/, "").replace(/\/$/, "");
  return bootPath === "" ? "" : bootPath;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
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
if (typeof document !== "undefined" && document.getElementById("root")) {
  createRoot(document.getElementById("root")!).render(<App />);
}

export default App;
