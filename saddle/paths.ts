/** Resolves public asset paths for root hosting and repository subpath hosting. */
const rawbaseurl = import.meta.env.BASE_URL || "/";
// A relative base ("./") must survive as the relative prefix — folding it into
// a domain-absolute path ("/./") would resolve against the host root and miss
// the application subpath on static hosting.
const baseurl =
  rawbaseurl === "./" ? "./" : rawbaseurl === "/" ? "/" : `/${rawbaseurl.replace(/^\/+|\/+$/g, "")}/`;

/** Builds a public URL without depending on a trailing slash in Vite's base value. */
export function assetpath(relativepath: string) {
  return `${baseurl}${relativepath.replace(/^\/+/, "")}`;
}
