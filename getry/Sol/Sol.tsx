/**
 * Sol theme anchor — layer 2 of the anchor architecture.
 * The file carrying the theme folder's own name (Sol/Sol.tsx, beside
 * Sol/sol.css) is the path manager of the pages: it imports one anchor per
 * page folder (`folder/folder.tsx`, each beside the loose components its
 * folder keeps) and mounts every route and subroute of the theme inside the
 * shared shell. App.tsx consumes only this file and the theme stylesheet; no
 * page component is ever imported outside this layer. When a theme folder
 * changes its name (Moon, Aqua), this file follows the new name and App.tsx
 * keeps importing the anchor by the folder path.
 */
import { Route, Switch } from "wouter";
import { Shell } from "./shell/Shell";
import HomeAnchor from "./home/home";
import NotFoundAnchor from "./notfound/notfound";
import SessionsAnchor from "./sessions/sessions";
import ThinkingAnchor from "./thinking/thinking";
import VersionsAnchor from "./versions/versions";

/** The route table of the theme: home plus the three gateway domains and the catch-all. */
export default function Sol() {
  return (
    <Shell>
      <Switch>
        <Route path="/" component={HomeAnchor} />
        <Route path="/versions" component={VersionsAnchor} />
        <Route path="/thinking" component={ThinkingAnchor} />
        <Route path="/sessions" component={SessionsAnchor} />
        <Route path="/404" component={NotFoundAnchor} />
        <Route component={NotFoundAnchor} />
      </Switch>
    </Shell>
  );
}
