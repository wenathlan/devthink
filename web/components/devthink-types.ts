/** Style: DevThink Terminal Atelier — shared operational types stay renderer-neutral. */
export type DevThinkProvider = {
  id: string;
  label: string;
  model: string;
  protocol: string;
  state: "connected" | "ready" | "offline";
  tint: string;
};

export type DevThinkMessage = {
  id: string;
  workspaceId?: string;
  sessionId?: string;
  tabId?: string;
  sectionId?: string;
  role: "user" | "assistant" | "system";
  title: string;
  body: string;
  time: string;
};

export type DevThinkTab = {
  id: string;
  sessionId?: string;
  workspaceId?: string;
  label: string;
  provider: string;
  sectionId?: string;
  createdAt?: string;
  updatedAt?: string;
  active?: boolean;
};
