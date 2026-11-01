// tabs component of the home page — the anchor pills of the product face.
// the family anchor is an external door: it opens in its own tab and the
// sibling anchors back. the copy rides the ui store (uistore.ts, the
// labels store answering through the chain).
import { uicopy } from "../../uistore.ts";

export function Tabs() {
  return (
    <nav className="tabs" aria-label={uicopy("home.tabs.aria")}>
      <a href="#console">{uicopy("home.tabs.safe")}</a>
      <a href="https://github.com/wenathlan/devthink" target="_blank" rel="noreferrer">
        {uicopy("home.tabs.family")}
      </a>
    </nav>
  );
}
