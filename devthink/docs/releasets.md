# release TypeScript conversion

This collection converts release configuration and workflow fragments into a typed release plan.

```ts
/** Defines the supported self-contained binary release targets. */
export type binaryTarget = "bun-linux-x64" | "bun-darwin-arm64" | "bun-windows-x64";

/** Produces a deterministic release matrix for CI. */
export function releaseTargets(): readonly binaryTarget[] {
  return ["bun-linux-x64", "bun-darwin-arm64", "bun-windows-x64"];
}
```

Release workflows build source from a clean checkout and never include `auth.json`, local databases, pairing files or private history archives.
