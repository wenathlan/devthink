# archive TypeScript conversion

This collection replaces archival helper scripts with a portable TypeScript release manifest. Historical Git objects and private archives are intentionally excluded from public distributions.

```ts
/** Describes a portable release without embedding repository history. */
export type releaseManifest = {
  version: string;
  generatedAt: string;
  files: readonly string[];
};

/** Creates an immutable, credential-free manifest for a release artifact. */
export function createReleaseManifest(version: string, files: readonly string[]): releaseManifest {
  return { version, generatedAt: new Date().toISOString(), files: [...files].sort() };
}
```

Converted source families: module scripts and archive metadata. Private `.git` archives, object databases and historical credential-bearing payloads are not public documentation.
