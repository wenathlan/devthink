/** DevThink workspace contract: renderer-neutral destination names, glyphs and labels shared by the web pages and the Ink terminal — the visual vocabulary of the destinations rail, owned by the web design room (Regra 118) and imported by both renderers. */
/** The ordered destination rail: every workspace surface the web pages and the terminal share, with its glyph. */
export const workspaceDestinations = [
  { id: "chat", label: "chat", glyph: "◉" },
  { id: "history", label: "history", glyph: "◷" },
  { id: "projects", label: "projects", glyph: "▦" },
  { id: "providers", label: "providers", glyph: "◌" },
  { id: "usage", label: "usage", glyph: "◫" },
  { id: "routes", label: "routes", glyph: "⌘" },
  { id: "settings", label: "settings", glyph: "⚙" },
] as const;

export type WorkspaceDestination = (typeof workspaceDestinations)[number]["id"];

/** Narrows a string to a valid destination id. */
export function isWorkspaceDestination(value: string): value is WorkspaceDestination {
  return workspaceDestinations.some((destination) => destination.id === value);
}

/** Resolves the destination entry (glyph and label) of a destination id. */
export function workspaceDestination(value: WorkspaceDestination) {
  return workspaceDestinations.find((destination) => destination.id === value) || workspaceDestinations[0];
}
