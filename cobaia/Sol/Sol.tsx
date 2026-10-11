/**
 * Sol theme anchor — layer 2 of the anchor architecture.
 * The file carrying the theme folder's own name (Sol/Sol.tsx, beside
 * Sol/sol.css) is the path manager of the pages: it imports one anchor per
 * page folder (`folder/folder.tsx`, each beside the loose components its
 * folder keeps) and mounts every route of the theme. App.tsx consumes only
 * this file and the theme stylesheet; no page component is ever imported
 * outside this layer.
 *
 * The cobaia is a CONTENT site, not an application window: no intro, no
 * onboarding, no window chrome. The site chrome (the header and the footer
 * in shell/) wraps every page, and the catch-all lands on the 404 anchor.
 */
import { Route, Switch } from "wouter";
import AppsAnchor from "./apps/apps";
import BlogAnchor from "./blog/blog";
import HomeAnchor from "./home/home";
import LegalAnchor from "./legal/legal";
import NotFoundAnchor from "./notfound/notfound";
import PricingAnchor from "./pricing/pricing";
import SupportAnchor from "./support/support";
import { Shell } from "./shell/shell";

/** Mounts the content site: the site chrome around the six content pages,
 * with the 404 anchor as the catch-all. */
export default function Sol() {
  return (
    <Shell>
      <Switch>
        <Route path="/" component={HomeAnchor} />
        <Route path="/apps" component={AppsAnchor} />
        <Route path="/pricing" component={PricingAnchor} />
        <Route path="/support" component={SupportAnchor} />
        <Route path="/blog" component={BlogAnchor} />
        <Route path="/legal" component={LegalAnchor} />
        <Route component={NotFoundAnchor} />
      </Switch>
    </Shell>
  );
}
