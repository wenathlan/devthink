// tabs component of the home page — the anchor pills of the staging surface.
// the family anchor is an external door: it opens in its own tab and the
// sibling anchors back.
export function Tabs() {
  return (
    <nav className="tabs" aria-label="vault surface sections">
      <a href="#surface">the safe</a>
      <a href="https://github.com/wenathlan/devthink" target="_blank" rel="noreferrer">
        the family
      </a>
    </nav>
  );
}
