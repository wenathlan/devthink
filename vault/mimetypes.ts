// # mimetypes — the media type catalog of the vault storage engine (the
// mimetypes pillar of the wave D rewire): the one registry the internal root
// answers every static file with — the correct content type for every file
// type, never a guess, never a hardcoded dozen. The corpus lives beside this
// module in mime.types (the site's own mime lane, grown from its dozen-site
// rows to the full registry): 4133 media types and 2527 unique extension
// mappings — the apache tika catalog, the freedesktop shared-mime-info types
// and legacy aliases, and the h5bp augmented nginx lane joined the iana live
// snapshot — every type and every extension mapping the family's own mime lane
// carries rides this corpus, the golden-table battery of test/mimetypes.test.ts
// pins the coverage — with the family law rows pinned: .ts answers video/mp2t
// and .tsx answers application/typescript). Real types only, no filler: every
// row answers a registration a real registry carries.
//
// Wave 3, the engine ownership law: the catalog engine — the corpus parse,
// the collision-law indexes, the counts and every lookup lane this module
// once re-implemented — answers from the argan owner through the published
// library specifier ("@wenathlan/argan/mimetypes"): the argan gateway owns
// the family media-type surface and this module is never its second
// implementation. The vault keeps what is vault's alone: the corpus read off
// the filesystem (the node-only doctrine below) and the serving names the
// internal root and the package surface pin. The data equivalence is
// byte-exact — the same corpus file, the same rows in the same order, the
// same counts, the same lookups.
//
// The collision law rides the line order of the corpus: the family groups run
// application, video, audio, image, font, model, chemical, message, multipart,
// text, then the legacy trees alphabetical — the first row claiming an
// extension keeps it, exactly the way the serving index answers a lookup.
//
// The node-only doctrine rides the import the storagelane law pins: the corpus
// reads from the filesystem through node:fs, so the browser graph never
// reaches this module (the browser surfaces keep their own copy lanes).
//
// @section corpus — the registry corpus and its read
// @section catalog — the rows and the counts the pillar announces
// @section lookups — the serving lane

import { readFileSync } from "node:fs";
import path from "node:path";
import {
  createMimeCatalog,
  MimeCorpusError,
  parseMimeCorpus,
  type MimeCorpusRow,
} from "@wenathlan/argan/mimetypes";

/** @section corpus */

/** The corpus file the catalog parses (mime.types beside this module). */
const CORPUS_FILE = "mime.types";

/** Resolves the module directory without leaning on import.meta.dirname alone
 * (the older hosts answer only the url form). */
function pathFromFile(): string {
  return new URL(import.meta.url).pathname;
}

/**
 * Reads the registry corpus: the mime.types file beside this module (the
 * published package ships them together — the source form is the package).
 *
 * @returns the raw corpus text.
 * @throws MimeCorpusError when the corpus file never landed beside the module.
 */
function readCorpus(): string {
  const here = import.meta.dirname ?? path.dirname(pathFromFile());
  try {
    return readFileSync(path.resolve(here, CORPUS_FILE), "utf8");
  } catch (error) {
    throw new MimeCorpusError(
      `the mime corpus never landed beside the module (${CORPUS_FILE}): ${
        error instanceof Error ? error.message : "the read refused"
      }`,
    );
  }
}

/**
 * One row of the registry catalog: the media type, its extensions and its
 * family (the tree before the slash) — the row shape the argan engine owns
 * (wave 3), carried under the name the vault surface always answered.
 */
export type MimeTypeRow = MimeCorpusRow;

/** @section catalog */

/** The catalog itself: every registry row in corpus order (the collision law order). */
export const MIMETYPES: readonly MimeTypeRow[] = parseMimeCorpus(readCorpus());

/** The engine the argan owner carries (wave 3), bound to the vault corpus:
 * the collision-law indexes, the counts and every lookup lane answer from
 * the one createMimeCatalog call — the parse and the serving lanes are never
 * re-implemented here. */
const CATALOG = createMimeCatalog(MIMETYPES);

/** The families the catalog carries, in catalog order (the collision law order). */
export const MIME_FAMILIES: readonly string[] = CATALOG.families;

/** The media type count of the catalog (the registry rows the pillar serves). */
export const MIME_TYPE_COUNT = CATALOG.typeCount;

/** The extension mapping count of the catalog (the type-to-extension pairs). */
export const MIME_EXTENSION_COUNT = CATALOG.extensionCount;

/** The whole entry count the pillar serves: every media type row plus every
 * extension mapping (the number the mimetypes pillar announces — above six
 * thousand on the wave D corpus). */
export const MIME_ENTRY_COUNT = CATALOG.entryCount;

/** @section lookups */

/**
 * The content type one extension answers — the serving lane of the internal
 * root. The extension may arrive dotted or dotless; the lookup is lowercase;
 * the collision law answers (the first family claiming the extension keeps
 * it), and an unknown extension answers undefined so the caller serves the
 * octet-stream default honestly instead of a guess.
 *
 * (the lane answers from the argan engine — wave 3 — bound to the vault
 * corpus; the signature and the law are the ones this module always carried.)
 */
export const mimeTypeFor = CATALOG.mimeTypeFor;

/**
 * The extensions one media type carries (the catalog lookup lane — the
 * reverse of the serving index).
 *
 * (the lane answers from the argan engine — wave 3 — bound to the vault corpus.)
 */
export const extensionsFor = CATALOG.extensionsFor;

/**
 * The catalog row of one media type.
 *
 * (the lane answers from the argan engine — wave 3 — bound to the vault corpus.)
 */
export const mimeTypeRow = CATALOG.mimeTypeRow;

/**
 * The extension of one path — the last dot segment of the last path segment,
 * dotless and lowercase (no extension answers the empty string).
 *
 * (the lane answers from the argan engine — wave 3 — bound to the vault corpus.)
 */
export const extensionOf = CATALOG.extensionOf;

/**
 * The content type one path answers — the lane the internal root serves every
 * static file through: the registry row for the path's extension (dotless,
 * case-insensitive), the octet-stream default when no row claims it.
 *
 * (the lane answers from the argan engine — wave 3 — bound to the vault corpus.)
 */
export const contentTypeFor = CATALOG.contentTypeFor;

/** the corpus engine the argan owner carries (wave 3), re-exported under the
 * names the vault surface always answered: the typed refusal and the parse. */
export { MimeCorpusError, parseMimeCorpus };
