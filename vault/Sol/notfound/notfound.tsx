/**
 * notfound page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself. The vault copy answers for
 * the storage clone: the address points nowhere in the guarded store.
 */

// NotFound — the 404 answer of the vault: the address guards nothing in
// the store. The pagehead grammar carries the seat, the actions walk back
// to the real surfaces (the ledger and the shelf), and the copy stays
// honest about what a 404 is: an empty address, not a broken safe.
import { Link } from "wouter";
import { Archive, FolderLock } from "lucide-react";

/** The 404 page of the vault. */
export function NotFound() {
  return (
    <main className="shell vn-page">
      <header className="pagehead">
        <p className="pagehead__eyebrow">404 · the address guards nothing</p>
        <h1 className="pagehead__title">Nothing is sealed at this address</h1>
        <p className="pagehead__lede">
          The store answers: no object, bucket or ledger row lives on this path. The safe itself is unharmed — walk
          back to a real surface of the vault.
        </p>
        <div className="pagehead__actions">
          <Link className="btn" href="/objects" aria-label="open the sealed inventory">
            <Archive size={14} aria-hidden="true" />
            the sealed inventory
          </Link>
          <Link className="btn secondary" href="/buckets" aria-label="open the retention shelf">
            <FolderLock size={14} aria-hidden="true" />
            the retention shelf
          </Link>
        </div>
      </header>
    </main>
  );
}

export default NotFound;
