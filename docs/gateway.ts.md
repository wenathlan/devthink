# gateway TypeScript conversion

This collection replaces JavaScript, PowerShell, Ruby and shell gateway notes with an embedded local gateway contract. It supports typed requests, allowed-origin validation and streaming responses; it does not implement browser automation or remote credential forwarding.

```ts
/** Represents the minimum typed request accepted by the local chat gateway. */
export type gatewayChatRequest = {
  provider: string;
  model: string;
  messages: readonly { role: "system" | "user" | "assistant"; content: string }[];
  workspaceId?: string;
  sessionId?: string;
  tabId?: string;
};

/** Limits browser access to explicitly configured origins. */
export function isAllowedOrigin(origin: string | undefined, allowedOrigins: readonly string[]): boolean {
  return Boolean(origin && allowedOrigins.includes(origin));
}
```

The implementation target is `server.ts`, which binds only to the local loopback interface and requires an active one-time pairing session for browser-origin requests.
