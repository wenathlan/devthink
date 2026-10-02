/**
 * App — the global anchor (layer 1 of the anchor architecture) and the only
 * TSX outside the foundry theme. The foundry is the runner clone of the
 * family: it stores and executes together — the vault storage layer beside
 * the forge runtime layer in one deployable unit. The root manages the
 * themes as single files: it imports only the theme anchor (Sol/Sol.tsx —
 * the file named after the theme folder, beside Sol/sol.css) and the theme
 * stylesheet and renders the theme. Every page and component lives behind
 * the anchor chain (App → Sol → the page anchors → the loose components);
 * nothing is imported directly.
 */
import Sol from "./Sol/Sol";
import "./Sol/sol.css";

export default function App() {
  return <Sol />;
}
