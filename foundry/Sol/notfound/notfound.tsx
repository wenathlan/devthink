/**
 * notfound page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself. The foundry copy answers
 * for the runner clone: the address neither stores nor executes here.
 */

// NotFound — the 404 page sub-anchor of the foundry
export function NotFound() {
  return (
    <main className="page">
      <h1>404</h1>
      <p>This address neither stores nor executes in the foundry.</p>
    </main>
  );
}

export default NotFound;
