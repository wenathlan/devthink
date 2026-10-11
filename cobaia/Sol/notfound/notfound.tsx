/**
 * notfound page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. The cobaia copy answers for the family site: the address is not
 * part of the family — the way out is the home and the directory.
 */

export function NotFound() {
  return (
    <div className="cb-page cb-missing">
      <p className="cb-eyebrow">404</p>
      <h1 className="cb-title">This address is not part of the family.</h1>
      <p className="cb-lede">
        the page you asked for does not exist here. the front door and the app directory are the honest way back in.
      </p>
      <div className="cb-btnrow">
        <a className="cb-btn" href="/">
          back to the front door
        </a>
        <a className="cb-btn cb-btn--ghost" href="/apps">
          browse the apps
        </a>
      </div>
    </div>
  );
}

export default NotFound;
