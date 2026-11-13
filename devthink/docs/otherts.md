# other TypeScript conversion

This collection records the public TypeScript conventions used by DevThink.

```ts
/** Produces a deterministic identifier suitable for local record references. */
export function normalizeIdentifier(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
```

Modules use ES syntax, lowercase file names, explicit exported types and JSDoc at public boundaries.
