/**
 * App — the global anchor (layer 1 of the anchor architecture) and the only
 * TSX outside the cobaia theme. cobaia is the family site: the front door of
 * the DevThink family — the pricing, the support page, the app directory and
 * the update blog for the ten deployable applications. The site is a plain
 * CONTENT surface: no intro, no onboarding, no window chrome — the home
 * renders directly and every page is public. The root manages the theme as
 * a single file: it
 * imports only the theme anchor (Sol/Sol.tsx — the file named after the
 * theme folder, beside Sol/sol.css) and the theme stylesheet and renders
 * the theme. Every page and component lives behind the anchor chain
 * (App → Sol → the page anchors → the loose components); nothing is imported
 * directly.
 */
import Sol from "./Sol/Sol";
import "./Sol/sol.css";
import { seedLabels } from "./labels";
import installzoomlock from "./zoomlock";

// the zoom lock arms before the first render: the interface boots pinned at 100%
if (typeof window !== "undefined") installzoomlock();

// the copy law rides the boot: the seed refreshes the label store rows from
// the manifest (the browser cache mirrors the site db rows) before the theme
// renders — best effort, the manifest always answers the widgets.
if (typeof window !== "undefined") void seedLabels().catch(() => {});

export default function App() {
  return <Sol />;
}
