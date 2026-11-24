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

import { routerBase } from "./routerbase.ts";
// the copy law rides the boot: the seed refreshes the label store rows from
// the manifest (the browser cache mirrors the site db rows) before the theme
// renders — best effort, the manifest always answers the widgets.
if (typeof window !== "undefined") void seedLabels().catch(() => {});

/* the zoom lock law (the faun pattern the owner pinned in the reference):
   the viewport meta rides every html entry and pins the touch door, but the
   desktop page zoom never reads the meta — the browser scales the whole
   document on the ctrl wheel (and the trackpad pinch reports itself as one),
   and the family site breaks. the front door answers at its own door: one
   capture listener eats the default of every ctrl wheel before the browser
   owns it. the site is a content surface — the pricing, the directory and
   the blog pages scroll, nothing listens for the ctrl wheel — so the guard
   never steals a gesture the app serves: a plain wheel stays a scroll, the
   propagation never stops for the widgets above. the window flag arms once
   per page: the hot reload re-executes this module and never stacks a
   second listener */
type ZoomLockHost = Window & { __cobaiazoomlock?: boolean };
const zoomlockhost = (typeof window === "undefined" ? undefined : (window as ZoomLockHost));
if (zoomlockhost && !zoomlockhost.__cobaiazoomlock) {
  zoomlockhost.__cobaiazoomlock = true;
  zoomlockhost.addEventListener(
    "wheel",
    (event) => {
      if (event.ctrlKey) event.preventDefault();
    },
    { passive: false, capture: true },
  );
}


function App() {
  return (
    <WouterRouter base={routerBase("cobaia")}>
      <Sol />
    </WouterRouter>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("cobaia root element is missing.");
createRoot(root).render(<App />);
