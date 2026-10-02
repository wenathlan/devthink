/**
 * notfound page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// # NotFound — the 404 of the saddle theme: a route the static edge never mapped.
import { Link } from "wouter";
import { SiteHeader } from "@/shell/Shell";

export default function NotFound() {
  return (
    <div className="site-frame notfound-page">
      <SiteHeader />
      <main>
        <section className="container notfound-frame">
          <p className="eyebrow">404 · route not mapped</p>
          <h1>This route never connected.</h1>
          <p>
            The static edge reached a path no saddle surface claims. The session
            stayed clean — head back to the home page or open the agent browser.
          </p>
          <div className="notfound-actions">
            <Link href="/" className="button button-primary">
              Back home
            </Link>
            <Link href="/agent-browser" className="button">
              Open the agent browser
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
