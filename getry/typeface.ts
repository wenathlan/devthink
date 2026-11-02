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
  readonly env: Record<string, string | undefined>;
}
