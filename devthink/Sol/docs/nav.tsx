/**
 * nav.tsx — the nav pane of the docs app: the Windows 11 settings rail, one
 * 36px row per section, the 3px accent pill marking the selection and the
 * quiet hover wash. Loose component of the docs page.
 */
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
    <nav className="dtw-nav" aria-label="Docs sections">
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
