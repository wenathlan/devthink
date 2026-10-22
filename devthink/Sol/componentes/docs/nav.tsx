/**
 * nav.tsx — the nav pane of the docs app: the Windows 11 settings rail, one
 * 44px row per section, the 3px accent pill marking the selection and the
 * quiet hover wash (the docs skins at the tail of sol.css carry the touch
 * law). Loose component of the docs page.
 */
import { osText } from "../../../oslabels.ts";

export type DocsSection = { id: string; label: string };

export function DocsNav({
  sections,
  active,
  onSelect }: {
  sections: readonly DocsSection[];
  active: string;
  onSelect: (id: DocsSection["id"]) => void;
}) {
  return (
    <nav className="dtw-nav" aria-label={osText("docs.nav.aria")}>
      {sections.map((item) => (
        <button
          key={item.id}
          type="button"
          className="dtw-navrow"
          data-active={item.id === active ? "true" : undefined}
          onClick={() => onSelect(item.id)}
          aria-current={item.id === active ? "page" : undefined}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
