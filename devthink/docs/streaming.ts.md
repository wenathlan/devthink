# streaming TypeScript conversion

This collection converts stylesheet, markup and configuration references into a typed streaming event protocol.

```ts
/** Represents one normalized event from any supported provider stream. */
export type streamEvent =
  | { type: "text"; text: string }
  | { type: "reasoning"; text: string }
  | { type: "tool"; name: string; input: unknown }
  | { type: "done" };

/** Keeps output deterministic by dropping empty text deltas. */
export function visibleEvents(events: readonly streamEvent[]): streamEvent[] {
  return events.filter((event) => event.type !== "text" || event.text.length > 0);
}
```

The implementation target is `stream.ts`, which normalizes OpenAI-compatible, Anthropic and Google SSE responses.
