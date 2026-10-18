// the argan unit of the family.
// # theme — the light fusion is the default (the devthink standard) and the dark variant applies to the document only.
// The interface never touches the visitor machine: no cookies, no storage — the choice
// holds for the session and the next load starts from the sol dark default again.
export type Theme = "dark" | "light";

function root(): HTMLElement {
  return document.documentElement;
}

/** Reads the theme currently applied to the document. */
export function currentTheme(): Theme {
  return root().getAttribute("data-theme") === "dark" ? "dark" : "light";
}

/** Applies a theme to the document. */
export function applyTheme(theme: Theme): void {
  if (theme === "dark") root().setAttribute("data-theme", "dark");
  else root().removeAttribute("data-theme");
}

/** Ensures the document carries the light fusion default before the first render. */
export function initTheme(): Theme {
  applyTheme("light");
  return "light";
}

/** Flips the theme on the document and returns the new value (session scope only). */
export function toggleTheme(): Theme {
  const next: Theme = currentTheme() === "dark" ? "light" : "dark";
  applyTheme(next);
  return next;
}
