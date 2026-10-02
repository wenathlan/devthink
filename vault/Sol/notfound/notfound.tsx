/**
 * notfound page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself. The vault copy answers for
 * the storage clone: the address points nowhere in the guarded store.
 */

// NotFound — the 404 page sub-anchor of the vault
export function NotFound() {
  return (
    <main className="page">
      <h1>404</h1>
      <p>This address guards nothing in the vault store.</p>
    </main>
  );
}

export default NotFound;
