/** DevThink workspace contract: renderer-neutral destination names, glyphs and labels shared by web and Ink. */
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

export function isWorkspaceDestination(value: string): value is WorkspaceDestination {
  return workspaceDestinations.some((destination) => destination.id === value);
}

export function workspaceDestination(value: WorkspaceDestination) {
  return workspaceDestinations.find((destination) => destination.id === value) || workspaceDestinations[0];
}
