# research TypeScript conversion

This collection converts research notes into a minimal, source-aware TypeScript model.

```ts
/** Captures a factual source used by a provider or protocol decision. */
export type researchRecord = { title: string; url: string; retrievedAt: string; summary: string };

/** Preserves source order while removing duplicate URLs. */
export function uniqueResearch(records: readonly researchRecord[]): researchRecord[] {
  const urls = new Set<string>();
  return records.filter((record) => !urls.has(record.url) && Boolean(urls.add(record.url)));
}
```
