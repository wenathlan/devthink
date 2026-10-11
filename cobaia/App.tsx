/**
 * App — the global anchor (layer 1 of the anchor architecture) and the only
 * TSX outside the cobaia theme. cobaia is the family site: the front door of
 * the DevThink family — the pricing, the support page, the app directory and
 * the update blog for the ten deployable applications. The site rides the
 * entry-flow contract of the reform: the intro splash → the onboarding walk
 * → the content, with the seen state catalogued in the platform database
 * (onboardingstate.ts at the app root — the home entry gate reads it, the
 * flow pages write it). The root manages the theme as a single file: it
 * imports only the theme anchor (Sol/Sol.tsx — the file named after the
 * theme folder, beside Sol/sol.css) and the theme stylesheet and renders
 * the theme. Every page and component lives behind the anchor chain
 * (App → Sol → the page anchors → the loose components); nothing is imported
 * directly.
 */
import Sol from "./Sol/Sol";
import "./Sol/sol.css";

export default function App() {
  return <Sol />;
}
