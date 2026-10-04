/**
 * The GTX translation core of the Sol theme: the google translate gtx
 * endpoint (translate_a/single, client gtx) answers the batched text
 * chunks, the localStorage cache keeps every settled pair across reloads
 * and the delimiter chunking packs many strings into one request while
 * respecting the url length budget. The correlated logics group per ts
 * file: this file owns the cache and the transport, translate.fx.ts owns
 * the reveal effect and translate.dom.ts owns the dom walk and the
 * language switching.
 */

const CACHEKEY = "translation-cache-v4";
const DELIMITER = "\n\n[:::==:::]\n\n";
const MAXURLLEN = 1500;
const BATCHPAUSE = 600;

let translationcache = new Map<string, string>();
try {
  const saved = localStorage.getItem(CACHEKEY);
  if (saved) translationcache = new Map(JSON.parse(saved) as [string, string][]);
} catch {
  /* a broken or absent cache starts empty */
}

const savecache = (): void => {
  try {
    localStorage.setItem(CACHEKEY, JSON.stringify(Array.from(translationcache.entries())));
  } catch {
    /* a full or unavailable storage keeps the cache memory only */
  }
};

/** Reads the language the visitor stored; an absent storage answers null. */
export const storedlang = (): string | null => {
  try {
    return localStorage.getItem("app-lang");
  } catch {
    return null;
  }
};

/** Reads the effective language of the session; the authored surface is english. */
export const currentlang = (): string => storedlang() ?? "en";

/** Persists the chosen language; an unavailable storage keeps the choice session only. */
export const storelang = (lang: string): void => {
  try {
    localStorage.setItem("app-lang", lang);
  } catch {
    /* the choice stays session only */
  }
};

/** Translates one batch of strings through the gtx endpoint; the settled pairs land in
 * the cache and the answer array keeps the input order with the original string as the
 * fallback of every failure. */
export const translatetextchunk = async (textarray: string[], targetlang: string): Promise<string[]> => {
  if (textarray.length === 0) return [];
  const results = new Array<string>(textarray.length);
  const missing: { text: string; index: number }[] = [];
  textarray.forEach((text, i) => {
    const cachekey = `${targetlang}:${text}`;
    const cached = translationcache.get(cachekey);
    if (cached !== undefined) results[i] = cached;
    else missing.push({ text, index: i });
  });
  if (missing.length === 0) return results;

  const chunks: { text: string; index: number }[][] = [];
  let currentchunk: { text: string; index: number }[] = [];
  let currentlen = 0;
  for (const item of missing) {
    const extlen = encodeURIComponent(item.text + DELIMITER).length;
    if (currentlen + extlen > MAXURLLEN && currentchunk.length > 0) {
      chunks.push(currentchunk);
      currentchunk = [];
      currentlen = 0;
    }
    currentchunk.push(item);
    currentlen += extlen;
  }
  if (currentchunk.length > 0) chunks.push(currentchunk);

  for (const chunk of chunks) {
    const combined = chunk.map((item) => item.text).join(DELIMITER);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetlang}&dt=t&q=${encodeURIComponent(combined)}`;
    try {
      const response = await fetch(url);
      const payload = (await response.json()) as unknown;
      if (Array.isArray(payload) && Array.isArray(payload[0])) {
        const translatedcombined = (payload[0] as unknown[])
          .map((item) => (Array.isArray(item) && typeof item[0] === "string" ? item[0] : ""))
          .join("");
        const parts = translatedcombined.split(/\s*\[:::==:::\]\s*/);
        chunk.forEach((item, idx) => {
          const translatedtext = parts[idx] !== undefined ? parts[idx].trim() : item.text.trim();
          const leading = /^\s+/.exec(item.text)?.[0] ?? "";
          const trailing = /\s+$/.exec(item.text)?.[0] ?? "";
          const settled = item.text.trim() === "" ? item.text : leading + translatedtext + trailing;
          results[item.index] = settled;
          if (settled !== "" && !settled.includes("<!DOCTYPE")) {
            translationcache.set(`${targetlang}:${item.text}`, settled);
          }
        });
        savecache();
      } else {
        chunk.forEach((item) => {
          results[item.index] = item.text;
        });
      }
    } catch {
      chunk.forEach((item) => {
        results[item.index] = item.text;
      });
    }
    await new Promise((resolve) => setTimeout(resolve, BATCHPAUSE));
  }
  return results;
};
