/**
 * The dom walk of the Sol translation: the TreeWalker collects the text nodes
 * and the translatable attributes (placeholder, title, alt, aria-label,
 * data-description), the WeakMaps keep the original authored texts so a
 * re-render never doubles a translation, the MutationObserver picks the newly
 * mounted surfaces (dialogs, toasts, route swaps) and the language switch
 * rewalks the body with the reveal effect. The theme speaks portuguese
 * natively, so a pt target skips the network entirely. The correlated logics
 * group per ts file: translate.gtx.ts owns the cache and the transport and
 * translate.fx.ts owns the reveal effect.
 */
import { scrambleeffect } from "./translate.fx";
import { currentlang, storelang, storedlang, translatetextchunk } from "./translate.gtx";

const TARGETATTRS = ["placeholder", "title", "alt", "aria-label", "data-description"] as const;
const SKIP = new Set(["SCRIPT", "STYLE", "SVG", "CODE", "PRE"]);
const BATCHSIZE = 50;

const nodeoriginaltexts = new WeakMap<Text, string>();
const attroriginaltexts = new WeakMap<Element, Map<string, string>>();

let translating = false;
let target = currentlang();
let booted = false;

declare global {
  interface Window {
    currentLang: string;
    setLanguage: (lang: string) => Promise<void>;
  }
}

const skippable = (element: Element): boolean =>
  SKIP.has(element.tagName) ||
  element.closest("svg") !== null ||
  element.closest("code") !== null ||
  element.closest("pre") !== null ||
  element.closest(".notranslate") !== null;

type translationitem =
  | { kind: "text"; node: Text; original: string }
  | { kind: "attr"; node: Element; attr: string; original: string };

/** Collects the translatable items under one container; the first walk registers
 * the authored text and every later walk reuses the registration. */
const collect = (container: Node): { items: translationitem[]; texts: string[] } => {
  const items: translationitem[] = [];
  const texts: string[] = [];
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_ALL, {
    acceptNode: (node): number => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        return skippable(node as Element) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
      if (node.nodeType === Node.TEXT_NODE) {
        const parent = node.parentElement;
        if (parent === null || skippable(parent)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
      return NodeFilter.FILTER_SKIP;
    },
  });
  let current: Node | null = walker.nextNode();
  while (current !== null) {
    if (current.nodeType === Node.TEXT_NODE) {
      const textnode = current as Text;
      const value = textnode.nodeValue ?? "";
      if (!nodeoriginaltexts.has(textnode) && value.trim().length > 0 && !/^\d+(\.\d+)?$/.test(value.trim())) {
        nodeoriginaltexts.set(textnode, value);
      }
      const original = nodeoriginaltexts.get(textnode);
      if (original !== undefined) {
        items.push({ kind: "text", node: textnode, original });
        texts.push(original);
      }
    } else if (current.nodeType === Node.ELEMENT_NODE) {
      const element = current as Element;
      for (const attr of TARGETATTRS) {
        if (!element.hasAttribute(attr)) continue;
        let attrmap = attroriginaltexts.get(element);
        if (attrmap === undefined) {
          attrmap = new Map<string, string>();
          attroriginaltexts.set(element, attrmap);
        }
        if (!attrmap.has(attr)) {
          const value = element.getAttribute(attr) ?? "";
          if (value.trim().length > 0) attrmap.set(attr, value);
        }
        const original = attrmap.get(attr);
        if (original !== undefined) {
          items.push({ kind: "attr", node: element, attr, original });
          texts.push(original);
        }
      }
    }
    current = walker.nextNode();
  }
  return { items, texts };
};

/** Translates one container: the batches ride the gtx transport in order and every
 * settled string paints through the reveal effect; a language switch mid flight
 * abandons the stale batches. */
export const translatecontainer = async (container: Node, targetlang: string): Promise<void> => {
  const { items, texts } = collect(container);
  if (items.length === 0) return;
  for (let i = 0; i < texts.length; i += BATCHSIZE) {
    const batchitems = items.slice(i, i + BATCHSIZE);
    const batchtexts = texts.slice(i, i + BATCHSIZE);
    const settled = await translatetextchunk(batchtexts, targetlang);
    if (target !== targetlang) return;
    batchitems.forEach((item, idx) => {
      const translation = settled[idx];
      if (translation === undefined) return;
      if (item.kind === "text") {
        if (item.node.nodeValue !== translation) scrambleeffect(item.node, translation);
      } else if (item.node.getAttribute(item.attr) !== translation) {
        scrambleeffect(item.node, translation, true, item.attr);
      }
    });
  }
};

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        void translatecontainer(node, target);
      } else if (node.nodeType === Node.TEXT_NODE) {
        const parent = node.parentElement;
        if (parent !== null) void translatecontainer(parent, target);
      }
    }
  }
});

/** Switches the theme language: the choice persists and the whole body rewalks. */
export const setlanguage = async (lang: string): Promise<void> => {
  if (translating && lang === target) return;
  target = lang;
  window.currentLang = lang;
  storelang(lang);
  translating = true;
  try {
    await translatecontainer(document.body, lang);
  } finally {
    translating = false;
  }
};

/** Boots the translation: the observer arms once, a stored choice rides again and
 * the authored english surface stays untouched unless the visitor picks
 * another language in the settings page; the boot never infers a language
 * from the browser or the locale — a saved choice is the only trigger. */
export const initautotranslate = (): void => {
  if (booted) return;
  booted = true;
  window.setLanguage = setlanguage;
  observer.observe(document.body, { childList: true, subtree: true });
  /* the authored surface is english: the theme never auto-translates. the
     settings page is the only writer of the language choice; the boot
     replays that saved choice when it exists. */
  const saved = storedlang();
  if (!saved || saved === "en") return;
  target = saved;
  window.currentLang = saved;
  void setlanguage(saved);
};
