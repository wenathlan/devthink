/**
 * theme.ts — the dark/light switch of the Sol theme.
 *
 * the toggle flips the `data-theme` attribute on the document element so
 * the two token variants of the design engine answer (the css carries the
 * light override). the choice lives in memory only: the interface never
 * writes to the visitor machine, so no storage of any kind is touched and
 * every load starts from the dark default the theme ships with — the
 * gateway surface mounts dark first on every route, home included.
 */

/** the two variants the design engine declares. */
export type ThemeName = "dark" | "light";

/** the theme in memory for the current document lifetime. */
let currenttheme: ThemeName = "dark";

/**
 * reads the theme currently applied in this document.
 *
 * @returns the active theme name.
 */
export function currentTheme(): ThemeName {
  return currenttheme;
}

/**
 * applies a theme by flipping the document attribute; the css token
 * variant does the rest.
 *
 * @param theme the theme to apply.
 */
export function applyTheme(theme: ThemeName): void {
  currenttheme = theme;
  document.documentElement.dataset.theme = theme;
}

/**
 * flips between the two variants and applies the result.
 *
 * @returns the theme now active.
 */
export function toggleTheme(): ThemeName {
  const next: ThemeName = currenttheme === "dark" ? "light" : "dark";
  applyTheme(next);
  return next;
}
