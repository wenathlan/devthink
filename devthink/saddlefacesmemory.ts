/**
 * saddlefacesmemory.ts — the memory face of the saddle library for the
 * typecheck build (the same paths law the bare face carries).
 */
  /** the in-process local memory manager (prepare, sync, cleanup). */
  export declare function localmemory(options?: Record<string, unknown>): {
    prepare(job: unknown): Promise<{ location: string }>;
    sync(set: unknown, bytes: Uint8Array): Promise<unknown>;
    cleanup(set: unknown): Promise<void>;
  };

  /** the filesystem storage under the given root directory. */
  export declare function localstorage(root: string): {
    put(entry: { key: string; data: Uint8Array; contenttype: string; metadata: Record<string, string> }): Promise<{ key: string; sha256: string }>;
  };
