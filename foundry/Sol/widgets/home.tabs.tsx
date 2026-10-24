// jump links of the home page — the anchor chips of the staging surface
// (the wave D1 grammar: 8px corners, the 160ms hover, the scale(.97) press).
import { label } from "../../labels";

export function Tabs() {
  return (
    <nav className="fd-jump" aria-label={label("home.tabs.aria")}>
      <a href="#surface">{label("home.tabs.floor")}</a>
      <a href="https://github.com/wenathlan/devthink" target="_blank" rel="noreferrer">
        {label("home.tabs.family")}
      </a>
    </nav>
  );
}
