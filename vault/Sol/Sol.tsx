/**
 * Sol theme anchor — layer 2 of the anchor architecture.
 * The file carrying the theme folder's own name (Sol/Sol.tsx, beside
 * Sol/sol.css) is the path manager of the pages: it imports one anchor per
 * page folder (`folder/folder.tsx`, each beside the loose components its
 * folder keeps) and mounts the page surface of the theme. App.tsx consumes
 * only this file and the theme stylesheet; no page component is ever
 * imported outside this layer. When a theme folder changes its name (Moon,
 * Aqua), this file follows the new name and App.tsx keeps importing the
 * anchor by the folder path.
 *
 * The vault mounts the storage surface: the home anchor carries the
 * dashboard of the guarded databases, the backups and the unified store.
 */
import { Shell } from "./shell/Shell";
import HomeAnchor from "./home/home";

/** Mounts the theme surface through the page anchors, inside the shared chrome. */
export default function Sol() {
  return (
    <Shell>
      <HomeAnchor />
    </Shell>
  );
}
