// jump links of the home page — the anchor chips of the staging surface
// (the wave D1 grammar: 8px corners, the 160ms hover, the scale(.97) press).
export function Tabs() {
  return (
    <nav className="fd-jump" aria-label="foundry surface sections">
      <a href="#surface">the herd floor</a>
      <a href="https://github.com/wenathlan/devthink" target="_blank" rel="noreferrer">
        the family
      </a>
    </nav>
  );
}
