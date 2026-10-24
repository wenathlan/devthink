/**
 * notfound page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. The forge copy answers for the running clone: the address
 * executes nothing in the forge runtime.
 */

// NotFound — the 404 answer of the forge, riding the pagehead grammar
// inside the application window (the theme catch-all).
import { Link } from "wouter";
import { label } from "../../labels";

export function NotFound() {
  return (
    <main className="shell">
      <header className="pagehead">
        <p className="pagehead__eyebrow">{label("notfound.eyebrow")}</p>
        <h1 className="pagehead__title">{label("notfound.title")}</h1>
        <p className="pagehead__lede">{label("notfound.lede")}</p>
        <div className="pagehead__actions">
          <Link className="btn" href="/">
            {label("notfound.back")}
          </Link>
        </div>
      </header>
    </main>
  );
}

export default NotFound;
