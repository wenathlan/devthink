/**
 * familyurl.ts — the familyurl owner of the family: ONE derivation law for
 * the url of a family deploy unit beside this one, the single canonical
 * implementation the member apps import per the dedup law (the app
 * familyurl.ts files are thin doors onto this seat — the same grammar the
 * routerbase.ts doors ride; the keyword-folded apps re-export the arm from
 * their family.ts under the fold law instead, so every export of the
 * family still answers from its one keyword file).
 *
 * the family deploys as sibling folders on one host: every member app
 * lives at /<slug>/, and every cross-application link must survive any
 * mount point (project pages, self-hosted domains, bare local preview
 * servers) without trusting a build constant or reading the live
 * location. the law therefore builds a RELATIVE url — one level up from
 * the current deploy unit, then into the sibling folder — so the rail
 * foot of the window resolves the family from wherever the app is
 * mounted. the os itself answers at the family root of the host (the
 * pages site root — the real deploy of the os), never one segment deep,
 * so the devthink slug resolves to the root while every other slug
 * resolves to the sibling folder beside the caller.
 *
 * two contracts share the name and stay honest to their surfaces: this
 * seat owns the MEMBER-APP side (the verbatim relative recipe the
 * sibling rails ride — "../<slug>/", "../" for the os — from a nested
 * member mount one level up IS the family root), while the os envelope
 * keeps its own base-aware resolver inside gateway.ts (the deploy-base
 * familyurl that answers "/<root>/<slug>/" for the power clip iframe,
 * the jump menu and the panel windows — the absolute form the pages lane
 * demands; that section serves only the os side of the contract and
 * never consults this seat).
 *
 * client-safe by construction: zero imports — no react, no dom reads, no
 * storage, no network — so the same call runs in the browser (the rail
 * links of the sol shells and the landing footers) and in node (the unit
 * tests of every member app), with the body staying the plain
 * concatenation form the family battery pins verbatim.
 */

/** resolves the url of a family deploy unit that shares this host.
 *
 * @param slug the deploy unit segment (the app folder name); decorative
 *   slashes are stripped, interior segments ride verbatim.
 * @returns the relative path of the family application, slash-terminated.
 */
export function familyurl(slug: string): string {
  const clean = slug.replace(/^\/+/, "").replace(/\/+$/, "");
  // the os answers at the family root itself: the devthink slug resolves to
  // the root (the real deploy of the os), every other slug to the sibling
  // folder one level up from this deploy unit
  if (clean === "devthink") return "../";
  // biome-ignore lint/style/useTemplate: the family contract body stays verbatim — every seat of the family answers this exact line
  return "../" + clean + "/";
}
