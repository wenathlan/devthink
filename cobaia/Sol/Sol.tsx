/**
 * Sol theme anchor — layer 2 of the anchor architecture.
 * The file carrying the theme folder's own name (Sol/Sol.tsx, beside
 * Sol/sol.css) is the path manager of the pages: it imports one anchor per
 * page folder (`folder/folder.tsx`, each beside the loose components its
 * folder keeps) and mounts every route of the theme. App.tsx consumes only
 * this file and the theme stylesheet; no page component is ever imported
 * outside this layer. When a theme folder changes its name (Moon, Aqua),
 * this file follows the new name and App.tsx keeps importing the anchor by
 * the folder path.
 *
 * The cobaia is a CONTENT site (the monetization surface of the family):
 * no intro, no onboarding, no window chrome — every route is a page of the
 * site. Every content route renders as the page body of the ONE shared
 * shell (the header and the footer); every page is freely reachable — the
 * home renders directly on the bare root, and the catch-all lands on the
 * 404 anchor.
 */
import type { ReactNode } from "react";
import { Route, Switch } from "wouter";
import AppsAnchor from "./apps/apps";
import BlogAnchor from "./blog/blog";
import HomeAnchor from "./home/home";
import LegalAnchor from "./legal/legal";
import NotFoundAnchor from "./notfound/notfound";
import PricingAnchor from "./pricing/pricing";
import { Shell } from "./shell/shell";
import SupportAnchor from "./support/support";

/** the content pages: the site chrome around one page anchor */
function Content({ children }: { children: ReactNode }) {
  return <Shell>{children}</Shell>;
}

/** the unrouted addresses: the 404 answer of the cobaia, inside the site
 * chrome (the theme catch-all) */
function Unrouted() {
  return (
    <Shell>
      <NotFoundAnchor />
    </Shell>
  );
}

/** Mounts the theme surface through the page anchors: the content pages of
 * the site — the home on the bare root, the five public sections, and the
 * catch-all last. No entry flow: the site is content end to end. */
export default function Sol() {
  return (
    <Switch>
      <Route path="/">
        <Content>
          <HomeAnchor />
        </Content>
      </Route>
      <Route path="/apps">
        <Content>
          <AppsAnchor />
        </Content>
      </Route>
      <Route path="/pricing">
        <Content>
          <PricingAnchor />
        </Content>
      </Route>
      <Route path="/support">
        <Content>
          <SupportAnchor />
        </Content>
      </Route>
      <Route path="/blog">
        <Content>
          <BlogAnchor />
        </Content>
      </Route>
      <Route path="/legal">
        <Content>
          <LegalAnchor />
        </Content>
      </Route>
      <Route component={Unrouted} />
    </Switch>
  );
}
