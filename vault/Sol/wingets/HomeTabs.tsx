// tabs component of the home page — the anchor pills of the staging surface.
// the family anchor is an external door: it opens in its own tab and the
// sibling anchors back. the copy rides the labels store (labels.ts).
import { label } from "../../labels";

export function Tabs() {
  return (
    <nav className="tabs" aria-label={label("home.tabs.aria")}>
      <a href="#surface">{label("home.tabs.safe")}</a>
      <a href="https://github.com/wenathlan/devthink" target="_blank" rel="noreferrer">
        {label("home.tabs.family")}
      </a>
    </nav>
  );
}
