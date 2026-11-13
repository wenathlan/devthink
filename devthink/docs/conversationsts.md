# conversations TypeScript conversion

This collection converts conversation exports and source-map references into a stable, portable TypeScript record model.

```ts
/** Identifies one message in a workspace, session, tab and section. */
export type conversationMessage = {
  workspaceId: string;
  sessionId: string;
  tabId: string;
  sectionId: "chat" | "inspector" | "settings" | "memory";
  messageId: string;
  role: "system" | "user" | "assistant";
  content: string;
  createdAt: string;
};

/** Produces a JSON-safe public export without provider credentials. */
export function exportConversation(messages: readonly conversationMessage[]): conversationMessage[] {
  return messages.map((message) => ({ ...message }));
}
```

The public record model deliberately excludes provider tokens, cookies and local identity secrets.
