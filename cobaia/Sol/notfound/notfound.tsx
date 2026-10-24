/**
 * notfound page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. The cobaia copy answers for the family site: the address is not
 * part of the family — the way out is the home and the directory.
 */

import { label } from "../../labels";

export function NotFound() {
  return (
    <div className="cb-page cb-missing">
      <p className="cb-eyebrow">{label("notfound.eyebrow")}</p>
      <h1 className="cb-title">{label("notfound.title")}</h1>
      <p className="cb-lede">{label("notfound.lede")}</p>
      <div className="cb-btnrow">
        <a className="cb-btn" href="/">
          {label("notfound.action.home")}
        </a>
        <a className="cb-btn cb-btn--ghost" href="/apps">
          {label("notfound.action.apps")}
        </a>
      </div>
    </div>
  );
}

export default NotFound;
