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

export function NotFound() {
  return (
    <main className="shell">
      <header className="pagehead">
        <p className="pagehead__eyebrow">404</p>
        <h1 className="pagehead__title">This address runs nothing.</h1>
        <p className="pagehead__lede">
          The forge runtime has no surface here — the runner floor lives one entry away, on the home of the window.
        </p>
        <div className="pagehead__actions">
          <Link className="btn" href="/">
            back to the floor
          </Link>
        </div>
      </header>
    </main>
  );
}

export default NotFound;
