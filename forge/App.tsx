/**
 * App — the global anchor (layer 1 of the anchor architecture) and the only
 * TSX outside the forge theme. The forge is the running clone of the family:
 * it executes any binary through the saddle sandbox engine without holding
 * the network persistence. The root manages the themes as single files: it
 * imports only the theme anchor (Sol/Sol.tsx — the file named after the theme
 * folder, beside Sol/sol.css) and the theme stylesheet and renders the theme.
 * Every page and component lives behind the anchor chain (App → Sol → the
 * page anchors → the loose components); nothing is imported directly.
 */
import Sol from "./Sol/Sol";
import "./Sol/sol.css";
import installzoomlock from "./zoomlock";

// the zoom lock arms before the first render: the interface boots pinned at 100%
if (typeof window !== "undefined") installzoomlock();

export default function App() {
  return <Sol />;
}
