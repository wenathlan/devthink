# storage TypeScript conversion

This collection replaces PowerShell storage notes with the local SQLite and JSON persistence contract implemented by `storage.ts` and `session.ts`.

```ts
/** Represents a credential-free snapshot suitable for local export. */
export type localSnapshot = {
  userId: string;
  deviceId: string;
  workspaces: readonly unknown[];
  sessions: readonly unknown[];
};

/** Confirms that an optional remote endpoint is a secure HTTPS URL. */
export function isSecureRemoteEndpoint(value: string | undefined): boolean {
  try { return Boolean(value && new URL(value).protocol === "https:"); } catch { return false; }
}
```

Stored provider credentials stay in `~/.config/devthink/auth.json` and are never part of session snapshots.
