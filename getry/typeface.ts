/** typeface — the declaration-pass ambient of the gateway owner.
 *
 * the emit of tsconfig.types.json walks the bridge graph into the
 * devthink and saddle sources (the declarations the owner's face
 * references) and some of those sources read import.meta.env — the
 * vite client face. the pass drops vite/client from its types (a
 * runner without the sibling install resolves the face through the
 * devthink typeRoots alone), so this ambient keeps the emit honest in
 * every context: the shape mirrors the vite/client surface the app
 * configs declare (string valued environment records), local or ci
 * alike. */
interface ImportMeta {
  /** the vite client face: the well-known keys are string valued (BASE_URL,
   * MODE, DEV, PROD carry the vite contract the app sources rely on) and
   * every project key stays string | undefined — the honest mirror of
   * vite/client the emit walks when the pass drops the library types. */
  readonly env: {
    readonly BASE_URL: string;
    readonly MODE: string;
    readonly DEV: boolean;
    readonly PROD: boolean;
    readonly SSR: boolean;
    readonly [key: string]: string | boolean | undefined;
  };
}
