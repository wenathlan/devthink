/**
 * App — the global anchor (layer 1 of the anchor architecture) and the only
 * TSX outside the cobaia theme. cobaia is the family site: the front door
 * of the DevThink family — the pricing, the support page, the app directory
 * and the update blog for the ten deployable applications. The site is a
 * plain CONTENT surface: no onboarding, no entry gate — the home renders
 * directly and every page is public; the intro (/intro) is the one bare
 * presentation page the family grammar gives every app, mounted full-bleed
 * under the family fullscreen law. The root manages the theme as a single
 * file: it imports only the theme anchor (Sol/Sol.tsx — the file named
 * after the theme folder, beside Sol/sol.css), the theme stylesheet and the
 * root logics, wraps the anchor in the wouter router (the subpath the pages
 * deploy owns answers through the declared base, the same mount grammar
 * every sibling carries) and renders the theme into the root element —
 * the site never booted without this mount (the blank cobaia defect).
 * Every page and component lives behind the anchor chain (App → Sol → the
 * page anchors → the loose components); nothing is imported directly.
 */
import { createRoot } from "react-dom/client";
import { Router as WouterRouter } from "wouter";
import Sol from "./Sol/Sol";
import "./Sol/sol.css";
import { seedLabels } from "./labels";

// the copy law rides the boot: the seed refreshes the label store rows from
// the manifest (the browser cache mirrors the site db rows) before the theme
// renders — best effort, the manifest always answers the wingets.
if (typeof window !== "undefined") void seedLabels().catch(() => {});

function routerBase(): string {
  // the base rides the BUILD declaration only (the sibling grammar): the
  // pages subpath owns /devthink/cobaia/, and that declaration arrives
  // through the vite base — deriving it from the runtime path made every
  // deep link look like a deployment subfolder
  const declaredBase = import.meta.env.BASE_URL;
  if (declaredBase !== "/" && declaredBase !== "./") return declaredBase.replace(/\/$/, "");
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
