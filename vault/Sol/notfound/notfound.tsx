/**
 * notfound page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself. The vault copy answers for
 * the storage clone: the address points nowhere in the guarded store.
 */

import { ArchiveRegular, LockClosedRegular } from "@fluentui/react-icons";
// NotFound — the 404 answer of the vault: the address guards nothing in
// the store. The pagehead grammar carries the seat, the actions walk back
// to the real surfaces (the ledger and the shelf), and the copy stays
// honest about what a 404 is: an empty address, not a broken safe.
import { Link } from "wouter";
import { label } from "../../labels";

/** The 404 page of the vault. */
export function NotFound() {
  return (
    <main className="shell vn-page">
      <header className="pagehead">
        <p className="pagehead__eyebrow">{label("notfound.eyebrow")}</p>
        <h1 className="pagehead__title">{label("notfound.title")}</h1>
        <p className="pagehead__lede">{label("notfound.lede")}</p>
        <div className="pagehead__actions">
          <Link className="btn" href="/objects" aria-label={label("notfound.objectsAria")}>
            <ArchiveRegular fontSize={14} aria-hidden="true" />
            {label("notfound.objects")}
          </Link>
          <Link className="btn secondary" href="/buckets" aria-label={label("notfound.bucketsAria")}>
            <LockClosedRegular fontSize={14} aria-hidden="true" />
            {label("notfound.buckets")}
          </Link>
        </div>
      </header>
    </main>
  );
}

export default NotFound;
