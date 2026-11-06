/**
 * App — the global anchor (layer 1 of the anchor architecture) and the only
 * TSX outside the cobaia theme. cobaia is the family site: the front door
 * of the DevThink family — the pricing, the support page, the app directory
 * and the update blog for the ten deployable applications. The site is a
 * plain CONTENT surface: no onboarding, no entry gate — the home renders
 * directly and every page is public; the intro (/intro) is the one bare
 * presentation page the family grammar gives every app, mounted full-bleed
 * under the family fullscreen law. The root manages the theme as a single
 * file: it imports only the theme anchor (sol/Sol.tsx — the file named
 * after the theme folder, beside sol/sol.css), the theme stylesheet and the
 * root logics, wraps the anchor in the wouter router (the subpath the pages
 * deploy owns answers through the declared base, the same mount grammar
 * every sibling carries) and renders the theme into the root element —
 * the site never booted without this mount (the blank cobaia defect).
 * Every page and component lives behind the anchor chain (App → Sol → the
 * page anchors → the loose components); nothing is imported directly.
 */
import { createRoot } from "react-dom/client";
import { Router as WouterRouter } from "wouter";
import Sol from "./sol/Sol";
import "@fontsource-variable/geist-mono";
import "@fontsource-variable/inter";
import "./sol/sol.css";
import { seedLabels } from "./labels";

// the copy law rides the boot: the seed refreshes the label store rows from
// the manifest (the browser cache mirrors the site db rows) before the theme
// renders — best effort, the manifest always answers the wingets.
if (typeof window !== "undefined") void seedLabels().catch(() => {});

/** the route segments the theme answers to — the mount prefix of a deploy
 * unit is whatever precedes the first one of these in the boot path. */
const KNOWN_ROUTES: readonly string[] = [
  "/intro",
  "/apps",
  "/pricing",
  "/support",
  "/blog",
  "/legal",
];

function routerBase(): string {
  const declaredBase = import.meta.env.BASE_URL;
  // the build-time base wins (the pages workflow mounts every app at /<slug>/)
  if (declaredBase !== "/" && declaredBase !== "./") return declaredBase.replace(/\/$/, "");
  const path = window.location.pathname.replace(/index\.html$/, "");
  // a known route at the root means the app is mounted at "/" — no base
  if (KNOWN_ROUTES.some((route) => path === route || path.startsWith(`${route}/`))) return "";
  // a lone first segment that is no known route is a mount prefix (the
  // power clip and the family stage serve this app under its slug)
  const segments = path.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
  if (segments.length === 1) return `/${segments[0]}`;
  // otherwise the mount prefix is whatever precedes the first known segment
  // (the static hosting case: the deep link still lands on its page)
  for (const route of KNOWN_ROUTES) {
    const at = path.indexOf(route);
    if (at > 0) return path.slice(0, at).replace(/\/$/, "");
  }
  return "";
}

function App() {
  return (
    <WouterRouter base={routerBase()}>
      <Sol />
    </WouterRouter>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("cobaia root element is missing.");
createRoot(root).render(<App />);
