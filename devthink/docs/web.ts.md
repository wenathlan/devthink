# web TypeScript conversion

This collection replaces public web markup, JSON and workflow fragments with a TypeScript route and base-path contract for GitHub Pages.

```ts
/** Normalizes the repository Pages base path for static deployment. */
export function normalizeBasePath(value: string | undefined, repository: string): string {
  const candidate = value?.trim() || `/${repository}/`;
  return `/${candidate.replace(/^\/+|\/+$/g, "")}/`;
}

/** Builds the addressable route shared by the web workbench and local gateway. */
export function workspaceRoute(basePath: string, workspaceId: string, sessionId: string, tabId: string, sectionId: string): string {
  return `${normalizeBasePath(basePath, "devthink")}w/${workspaceId}/s/${sessionId}/t/${tabId}/${sectionId}`;
}
```

The workbench remains static on GitHub Pages and connects only to the user’s separately running local DevThink gateway through explicit pairing.
