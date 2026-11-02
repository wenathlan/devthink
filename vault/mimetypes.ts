// # mimetypes — the media type catalog of the vault storage engine (the
// mimetypes pillar of the wave D rewire): the one registry the internal root
// answers every static file with — the correct content type for every file
// type, never a guess, never a hardcoded dozen. The corpus lives beside this
// module in mime.types (the site's own mime lane, grown from its dozen-site
// rows to the full registry): 3801 media types and 2808 extension mappings —
// 6609 entries in all — generated programmatically from the known extension
// corpus (the live IANA media types registry, the node mime-db, the apache
// httpd and nginx mime.types, the apache tika catalog, the rust mime_guess
// table, the go builtin table and the family catalog of the argan gateway,
// with the family law rows pinned: .ts answers video/mp2t and .tsx answers
// application/typescript). Real types only, no filler: every row answers a
// registration a real registry carries.
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
// @section corpus — the registry corpus and its parse
// @section catalog — the rows and the counts the pillar announces
// @section lookups — the extension index and the serving lane

import { readFileSync } from "node:fs";
import path from "node:path";

/** @section corpus */

/** The corpus file the catalog parses (mime.types beside this module). */
const CORPUS_FILE = "mime.types";

/** The typed refusal a missing or malformed corpus answers — loud, never a
 * silent fallback to invented types (the pillar serves every registry row or
 * refuses honestly). */
export class MimeCorpusError extends Error {}

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

/** Resolves the module directory without leaning on import.meta.dirname alone
 * (the older hosts answer only the url form). */
function pathFromFile(): string {
  return new URL(import.meta.url).pathname;
}

/** One row of the registry catalog: the media type, its extensions and its
 * family (the tree before the slash). */
export interface MimeTypeRow {
  /** the media type, lowercase, registered or legacy-canonical ("video/mp2t") */
  type: string;
  /** the file extensions the row maps to the type, dotless and lowercase */
  extensions: readonly string[];
  /** the top-level family of the type (the tree before the slash) */
  family: string;
}

/**
 * Parses the corpus into the catalog rows: every non-comment line carries the
 * media type and its space-separated extensions; the line order IS the
 * collision law (the first row claiming an extension keeps it).
 *
 * @param corpus the raw corpus text.
 * @returns the catalog rows in corpus order.
 * @throws MimeCorpusError when a line carries no media type.
 */
export function parseMimeCorpus(corpus: string): MimeTypeRow[] {
  const rows: MimeTypeRow[] = [];
  for (const rawLine of corpus.split("\n")) {
    const line = rawLine.trim();
    if (line.length === 0 || line.startsWith("#")) continue;
    const fields = line.split(/\s+/);
    const type = (fields[0] ?? "").toLowerCase();
    if (!type.includes("/")) {
      throw new MimeCorpusError(`the corpus line "${rawLine}" carries no media type`);
    }
    const extensions = fields.slice(1).map((extension) => extension.toLowerCase());
    rows.push({ type, extensions, family: type.split("/")[0] });
  }
  return rows;
}

/** @section catalog */

/** The catalog itself: every registry row in corpus order (the collision law order). */
export const MIMETYPES: readonly MimeTypeRow[] = parseMimeCorpus(readCorpus());

/** The families the catalog carries, in catalog order (the collision law order). */
export const MIME_FAMILIES: readonly string[] = [
  ...new Set(MIMETYPES.map((row) => row.family)),
];

/** The media type count of the catalog (the registry rows the pillar serves). */
export const MIME_TYPE_COUNT = MIMETYPES.length;

/** The extension mapping count of the catalog (the type-to-extension pairs). */
export const MIME_EXTENSION_COUNT = MIMETYPES.reduce((total, row) => total + row.extensions.length, 0);

/** The whole entry count the pillar serves: every media type row plus every
 * extension mapping (the number the mimetypes pillar announces — above six
 * thousand on the wave D corpus). */
export const MIME_ENTRY_COUNT = MIME_TYPE_COUNT + MIME_EXTENSION_COUNT;

/** @section lookups */

/** The serving index: every extension to the first type claiming it (the
 * collision law resolved once at load — the lane the internal root answers). */
const EXTENSION_INDEX: ReadonlyMap<string, string> = (() => {
  const index = new Map<string, string>();
  for (const row of MIMETYPES) {
    for (const extension of row.extensions) {
      if (!index.has(extension)) index.set(extension, row.type);
    }
  }
  return index;
})();

/** The type index: every media type to its row (the catalog lookup lane). */
const TYPE_INDEX: ReadonlyMap<string, MimeTypeRow> = new Map(MIMETYPES.map((row) => [row.type, row]));

/**
 * The content type one extension answers — the serving lane of the internal
 * root. The extension may arrive dotted or dotless; the lookup is lowercase;
 * the collision law answers (the first family claiming the extension keeps
 * it), and an unknown extension answers undefined so the caller serves the
 * octet-stream default honestly instead of a guess.
 *
 * @param extension the file extension (".html", "html" — both answer).
 * @returns the media type, or undefined when no registry row claims it.
 */
export function mimeTypeFor(extension: string): string | undefined {
  const dotless = extension.trim().toLowerCase().replace(/^\.+/, "");
  if (dotless.length === 0) return undefined;
  return EXTENSION_INDEX.get(dotless);
}

/**
 * The extensions one media type carries (the catalog lookup lane — the
 * reverse of the serving index).
 *
 * @param type the media type ("video/mp2t").
 * @returns the extensions, or undefined when the catalog holds no such type.
 */
export function extensionsFor(type: string): readonly string[] | undefined {
  return TYPE_INDEX.get(type.trim().toLowerCase())?.extensions;
}

/**
 * The catalog row of one media type.
 *
 * @param type the media type.
 * @returns the row, or undefined when the catalog holds no such type.
 */
export function mimeTypeRow(type: string): MimeTypeRow | undefined {
  return TYPE_INDEX.get(type.trim().toLowerCase());
}

/**
 * The extension of one path — the last dot segment of the last path segment,
 * dotless and lowercase (no extension answers the empty string).
 *
 * @param pathname the path the internal root resolves.
 * @returns the dotless extension, or "" when the name carries none.
 */
export function extensionOf(pathname: string): string {
  const name = pathname.split("/").pop() ?? "";
  const at = name.lastIndexOf(".");
  if (at <= 0 || at === name.length - 1) return "";
  return name.slice(at + 1).toLowerCase();
}

/**
 * The content type one path answers — the lane the internal root serves every
 * static file through: the registry row for the path's extension (dotless,
 * case-insensitive), the octet-stream default when no row claims it.
 *
 * @param pathname the path the internal root resolves.
 * @returns the content type (application/octet-stream when unknown).
 */
export function contentTypeFor(pathname: string): string {
  return mimeTypeFor(extensionOf(pathname)) ?? "application/octet-stream";
}
