// tabs component of the home page — the anchor pills of the staging surface.
import { label } from "../../labels";

export function Tabs() {
  return (
    <nav className="tabs" aria-label={label("home.tabs.aria")}>
      <a href="#surface">{label("home.tabs.floor")}</a>
      <a href="https://github.com/wenathlan/devthink">{label("home.tabs.family")}</a>
    </nav>
  );
}
