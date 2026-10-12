/**
 * theme.ts — the theme flip of the forge window (root layer).
 * Sol dark is the default and the light variant applies to the document
 * only: the choice holds for the session — no cookies, no storage — and
 * the next cold load starts from the dark Mica again. The rail foot toggle
 * is the only writer; the stylesheet reads the data-theme attribute.
 */

/** the two finishes of the application window. */
export type Theme = "dark" | "light";

function root(): HTMLElement {
  return document.documentElement;
}

/** Reads the theme currently applied to the document. */
export function currentTheme(): Theme {
  return root().getAttribute("data-theme") === "light" ? "light" : "dark";
}

/** Applies a theme to the document. */
export function applyTheme(theme: Theme): void {
  if (theme === "light") root().setAttribute("data-theme", "light");
  else root().removeAttribute("data-theme");
}

/** Ensures the document carries the dark Mica default before the first render. */
export function initTheme(): Theme {
  applyTheme("dark");
  return "dark";
}

/** Flips the theme on the document and returns the new value (session scope only). */
export function toggleTheme(): Theme {
  const next: Theme = currentTheme() === "light" ? "dark" : "light";
  applyTheme(next);
  return next;
}
