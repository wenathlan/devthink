// the cadria unit of the family.
// # theme — the sol dark stage is the default (the studio identity: the
// visual ateliers — the galleries, the render walls — hang the work on the
// dark floor, and the rosa-magenta signal glows on it; the landing's own
// rose atmosphere was drawn for the deep canvas). The interface never
// touches the visitor machine: no cookies, no storage — the choice holds
// for the session and the next load starts from the sol dark default again.
// The light fusion stays one toggle away on the same token ladder.
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

/** Ensures the document carries the sol dark default before the first render. */
export function initTheme(): Theme {
  applyTheme("dark");
  return "dark";
}

/** Flips the theme on the document and returns the new value (session scope only). */
export function toggleTheme(): Theme {
  const next: Theme = currentTheme() === "dark" ? "light" : "dark";
  applyTheme(next);
  return next;
}
