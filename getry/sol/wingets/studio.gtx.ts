import localforage from 'localforage';
import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type LanguageCode = 'en' | 'pt' | 'es' | 'fr' | 'de' | 'ja';
export type CountryFlagCode = 'US' | 'BR' | 'ES' | 'FR' | 'DE' | 'JP';

export interface LanguageOption {
  code: LanguageCode;
  flag: CountryFlagCode;
  label: string;
  region: string;
}

export const DEFAULT_UI_LANGUAGE: LanguageCode = 'en';

export const SUPPORTED_LANGUAGES: readonly LanguageOption[] = [
  { code: 'en', flag: 'US', label: 'English', region: 'US' },
  { code: 'pt', flag: 'BR', label: 'Português', region: 'BR' },
  { code: 'es', flag: 'ES', label: 'Español', region: 'ES' },
  { code: 'fr', flag: 'FR', label: 'Français', region: 'FR' },
  { code: 'de', flag: 'DE', label: 'Deutsch', region: 'DE' },
  { code: 'ja', flag: 'JP', label: '日本語', region: 'JP' },
] as const;

export const GTX_BATCH_DELIMITER = '\n\n[:::==:::]\n\n';
export const GTX_MAX_URL_LEN = 2600;
export const FORAGE_DB_NAME = 'devthink_gtx_forage_db';
export const FORAGE_STORE_NAME = 'translation_cache';
export const FORAGE_LANG_KEY = 'gtx:active_lang';
export const FORAGE_DICT_PREFIX = 'gtx:dict:';

const LEGACY_LOCALSTORAGE_CACHE_KEY = 'translation-cache-v4';
const STORAGE_LANG_KEY = 'devthink_chat_language_v1';
const BROADCAST_CHANNEL_NAME = 'devthink_gtx_forage_sync';
const TARGET_ATTRS = ['placeholder', 'title', 'alt', 'aria-label', 'data-description'] as const;

export interface ForageCacheStore {
  getItem<T>(key: string): Promise<T | null>;
  setItem<T>(key: string, value: T): Promise<T>;
  removeItem(key: string): Promise<void>;
  keys(): Promise<string[]>;
}

export function createMemoryForageStore(
  initial: Record<string, unknown> = {}
): ForageCacheStore {
  const backing = new Map<string, unknown>(Object.entries(initial));
  return {
    async getItem<T>(key: string): Promise<T | null> {
      if (!backing.has(key)) return null;
      return structuredClone(backing.get(key)) as T;
    },
    async setItem<T>(key: string, value: T): Promise<T> {
      const cloned = structuredClone(value);
      backing.set(key, cloned);
      return cloned;
    },
    async removeItem(key: string): Promise<void> {
      backing.delete(key);
    },
    async keys(): Promise<string[]> {
      return Array.from(backing.keys());
    },
  };
}

function createDefaultForageStore(): ForageCacheStore {
  if (typeof window !== 'undefined' && typeof indexedDB !== 'undefined') {
    const instance = localforage.createInstance({
      name: FORAGE_DB_NAME,
      storeName: FORAGE_STORE_NAME,
      description: 'Persistent Google GTX translation cache across tabs and sessions',
      driver: [localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE],
    });
    return {
      getItem: <T>(key: string) => instance.getItem<T>(key),
      setItem: <T>(key: string, value: T) => instance.setItem<T>(key, value),
      removeItem: (key: string) => instance.removeItem(key),
      keys: () => instance.keys(),
    };
  }
  return createMemoryForageStore();
}

export function isSupportedLanguage(raw: unknown): raw is LanguageCode {
  return SUPPORTED_LANGUAGES.some((item) => item.code === raw);
}

export function buildGtxTranslateUrl(
  text: string,
  targetLang: string,
  sourceLang = 'auto'
): string {
  const params = new URLSearchParams({
    client: 'gtx',
    sl: sourceLang || 'auto',
    tl: targetLang,
    dt: 't',
    q: text,
  });
  return `https://translate.googleapis.com/translate_a/single?${params.toString()}`;
}

export function parseGtxResponse(payload: unknown): string {
  if (!Array.isArray(payload) || !Array.isArray(payload[0])) {
    return '';
  }
  let out = '';
  for (const segment of payload[0]) {
    if (Array.isArray(segment) && typeof segment[0] === 'string') {
      out += segment[0];
    }
  }
  return out;
}

export function splitGtxBatch(translatedCombined: string): string[] {
  return translatedCombined.split(/\s*\[:::==:::\]\s*/);
}

export function preserveWhitespace(originalText: string, translatedCore: string): string {
  const leadingMatch = originalText.match(/^\s+/);
  const trailingMatch = originalText.match(/\s+$/);
  const leading = leadingMatch ? leadingMatch[0] : '';
  const trailing =
    trailingMatch && originalText.trim() !== '' ? trailingMatch[0] : '';
  return leading + translatedCore.trim() + trailing;
}

export function isDefaultEmptyConversationTitle(title: string | undefined): boolean {
  const clean = (title || '').trim();
  return !clean || clean === 'New chat' || clean === 'Nova conversa';
}

export function formatConversationTitle(title: string | undefined): string {
  return isDefaultEmptyConversationTitle(title) ? 'New chat' : title || 'New chat';
}

// ============================================================================
// Forage DB Persistent Translation Cache & Cross-Tab Sync Engine
// ============================================================================

let forageStore: ForageCacheStore = createDefaultForageStore();
const languageDicts = new Map<string, Map<string, string>>();
const hydratedLanguages = new Set<string>();
const hydratingPromises = new Map<string, Promise<void>>();
const inFlightTranslations = new Map<string, Promise<string>>();
const dirtyLanguages = new Set<string>();
let persistTimer: number | null = null;
let legacyMigrationDone = false;
let legacyMigrationPromise: Promise<void> | null = null;

type FetcherFn = (texts: string[], targetLang: string) => Promise<string[] | null>;
type SyncChannelMessage =
  | { type: 'cache-delta'; targetLang: string; entries: Array<[string, string]> }
  | { type: 'lang-change'; lang: LanguageCode }
  | { type: 'cache-clear' };

let fetcherOverride: FetcherFn | null = null;
let syncChannel: BroadcastChannel | null = null;
const externalSyncListeners = new Set<(msg: SyncChannelMessage) => void>();

function getLangDict(targetLang: string): Map<string, string> {
  let dict = languageDicts.get(targetLang);
  if (!dict) {
    dict = new Map<string, string>();
    languageDicts.set(targetLang, dict);
  }
  return dict;
}

export function getCachedTranslation(
  targetLang: string,
  originalText: string
): string | undefined {
  return languageDicts.get(targetLang)?.get(originalText);
}

export function setCachedTranslation(
  targetLang: string,
  originalText: string,
  translatedText: string
): void {
  if (!translatedText || translatedText.includes('<!DOCTYPE')) return;
  const dict = getLangDict(targetLang);
  if (dict.get(originalText) !== translatedText) {
    dict.set(originalText, translatedText);
    dirtyLanguages.add(targetLang);
  }
}

export function applyExternalCacheDelta(
  targetLang: string,
  entries: ReadonlyArray<readonly [string, string]>
): number {
  const dict = getLangDict(targetLang);
  let added = 0;
  for (const [orig, trans] of entries) {
    if (orig && trans && !trans.includes('<!DOCTYPE') && dict.get(orig) !== trans) {
      dict.set(orig, trans);
      added++;
    }
  }
  return added;
}

function getSyncChannel(): BroadcastChannel | null {
  if (syncChannel) return syncChannel;
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') return null;
  try {
    syncChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    syncChannel.onmessage = (event: MessageEvent<SyncChannelMessage>) => {
      const msg = event.data;
      if (!msg || typeof msg !== 'object') return;
      if (msg.type === 'cache-delta') {
        const added = applyExternalCacheDelta(msg.targetLang, msg.entries);
        if (
          added > 0 &&
          currentTranslationTarget === msg.targetLang &&
          typeof document !== 'undefined'
        ) {
          void translateContainer(document.body, msg.targetLang);
        }
      } else if (msg.type === 'cache-clear') {
        languageDicts.clear();
        hydratedLanguages.clear();
        dirtyLanguages.clear();
      } else if (msg.type === 'lang-change' && isSupportedLanguage(msg.lang)) {
        externalSyncListeners.forEach((cb) => cb(msg));
      }
    };
  } catch {
    syncChannel = null;
  }
  return syncChannel;
}

function broadcastMessage(msg: SyncChannelMessage): void {
  try {
    getSyncChannel()?.postMessage(msg);
  } catch {
    // ignore channel errors
  }
}

async function migrateLegacyLocalStorageCache(): Promise<void> {
  if (legacyMigrationDone) return;
  if (legacyMigrationPromise) return legacyMigrationPromise;

  legacyMigrationPromise = (async () => {
    try {
      if (typeof localStorage === 'undefined') {
        legacyMigrationDone = true;
        return;
      }
      const raw = localStorage.getItem(LEGACY_LOCALSTORAGE_CACHE_KEY);
      if (!raw) {
        legacyMigrationDone = true;
        return;
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const touchedLangs = new Set<string>();
        for (const pair of parsed) {
          if (!Array.isArray(pair) || typeof pair[0] !== 'string' || typeof pair[1] !== 'string') {
            continue;
          }
          const sepIdx = pair[0].indexOf(':');
          if (sepIdx <= 0) continue;
          const langCode = pair[0].slice(0, sepIdx);
          const original = pair[0].slice(sepIdx + 1);
          const translated = pair[1];
          if (isSupportedLanguage(langCode) && langCode !== DEFAULT_UI_LANGUAGE && original && translated) {
            const existing = await forageStore.getItem<Record<string, string>>(
              `${FORAGE_DICT_PREFIX}${langCode}`
            );
            const dict = getLangDict(langCode);
            if (existing && typeof existing === 'object') {
              for (const [k, v] of Object.entries(existing)) {
                if (!dict.has(k)) dict.set(k, v);
              }
            }
            if (!dict.has(original)) {
              dict.set(original, translated);
              touchedLangs.add(langCode);
            }
          }
        }
        for (const l of touchedLangs) {
          const obj = Object.fromEntries(getLangDict(l).entries());
          await forageStore.setItem(`${FORAGE_DICT_PREFIX}${l}`, obj);
        }
      }
      localStorage.removeItem(LEGACY_LOCALSTORAGE_CACHE_KEY);
    } catch {
      // ignore corrupted legacy localStorage cache
    } finally {
      legacyMigrationDone = true;
      legacyMigrationPromise = null;
    }
  })();

  return legacyMigrationPromise;
}

export async function ensureForageCacheHydrated(targetLang: string): Promise<void> {
  if (!targetLang || targetLang === DEFAULT_UI_LANGUAGE) return;
  if (hydratedLanguages.has(targetLang)) return;

  const pending = hydratingPromises.get(targetLang);
  if (pending) return pending;

  const job = (async () => {
    try {
      await migrateLegacyLocalStorageCache();
      const stored = await forageStore.getItem<Record<string, string>>(
        `${FORAGE_DICT_PREFIX}${targetLang}`
      );
      if (stored && typeof stored === 'object') {
        const dict = getLangDict(targetLang);
        for (const [k, v] of Object.entries(stored)) {
          if (typeof v === 'string' && v && !v.includes('<!DOCTYPE') && !dict.has(k)) {
            dict.set(k, v);
          }
        }
      }
      hydratedLanguages.add(targetLang);
    } catch {
      // ignore Forage read failure; memory map still works
    } finally {
      hydratingPromises.delete(targetLang);
    }
  })();

  hydratingPromises.set(targetLang, job);
  return job;
}

let activeFlushPromise: Promise<void> | null = null;

export async function flushForagePersistence(): Promise<void> {
  if (persistTimer !== null && typeof window !== 'undefined') {
    window.clearTimeout(persistTimer);
    persistTimer = null;
  }
  if (activeFlushPromise) {
    await activeFlushPromise;
    if (dirtyLanguages.size === 0) return;
  }

  activeFlushPromise = (async () => {
    while (dirtyLanguages.size > 0) {
      const langsToFlush = Array.from(dirtyLanguages);
      dirtyLanguages.clear();

      await Promise.all(
        langsToFlush.map(async (langCode) => {
          try {
            await ensureForageCacheHydrated(langCode);
            const dict = getLangDict(langCode);
            if (dict.size === 0) return;
            const serialized = Object.fromEntries(dict.entries());
            await forageStore.setItem(`${FORAGE_DICT_PREFIX}${langCode}`, serialized);
          } catch {
            dirtyLanguages.add(langCode);
          }
        })
      );
    }
  })();

  try {
    await activeFlushPromise;
  } finally {
    activeFlushPromise = null;
  }
}

function scheduleForagePersistence(): void {
  if (typeof window === 'undefined') {
    void flushForagePersistence();
    return;
  }
  if (persistTimer !== null) {
    window.clearTimeout(persistTimer);
  }
  persistTimer = window.setTimeout(() => {
    persistTimer = null;
    void flushForagePersistence();
  }, 90);
}

export async function getForageCacheStats(targetLang?: string): Promise<{
  backend: 'indexeddb-forage' | 'memory-forage';
  languages: string[];
  totalEntries: number;
  languageEntries: number;
}> {
  if (targetLang && targetLang !== DEFAULT_UI_LANGUAGE) {
    await ensureForageCacheHydrated(targetLang);
  }
  let allKeys: string[] = [];
  try {
    allKeys = await forageStore.keys();
  } catch {
    allKeys = [];
  }
  const dictKeys = allKeys.filter((k) => k.startsWith(FORAGE_DICT_PREFIX));
  const languages = Array.from(
    new Set([
      ...dictKeys.map((k) => k.slice(FORAGE_DICT_PREFIX.length)),
      ...Array.from(languageDicts.keys()),
    ])
  ).filter((l) => getLangDict(l).size > 0);

  let totalEntries = 0;
  for (const l of languages) {
    await ensureForageCacheHydrated(l);
    totalEntries += getLangDict(l).size;
  }

  return {
    backend:
      typeof window !== 'undefined' && typeof indexedDB !== 'undefined'
        ? 'indexeddb-forage'
        : 'memory-forage',
    languages,
    totalEntries,
    languageEntries: targetLang ? getLangDict(targetLang).size : totalEntries,
  };
}

export async function clearForageTranslationCache(targetLang?: LanguageCode): Promise<void> {
  if (targetLang) {
    languageDicts.delete(targetLang);
    hydratedLanguages.delete(targetLang);
    dirtyLanguages.delete(targetLang);
    await forageStore.removeItem(`${FORAGE_DICT_PREFIX}${targetLang}`);
  } else {
    languageDicts.clear();
    hydratedLanguages.clear();
    dirtyLanguages.clear();
    const allKeys = await forageStore.keys();
    await Promise.all(
      allKeys
        .filter((k) => k.startsWith(FORAGE_DICT_PREFIX))
        .map((k) => forageStore.removeItem(k))
    );
    broadcastMessage({ type: 'cache-clear' });
  }
}

export function configureGtxForageForTesting(options: {
  store?: ForageCacheStore;
  fetcher?: FetcherFn | null;
  resetMemory?: boolean;
}): void {
  if (options.store) {
    forageStore = options.store;
  }
  if (options.fetcher !== undefined) {
    fetcherOverride = options.fetcher;
  }
  if (options.resetMemory) {
    languageDicts.clear();
    hydratedLanguages.clear();
    hydratingPromises.clear();
    inFlightTranslations.clear();
    dirtyLanguages.clear();
    legacyMigrationDone = true;
    legacyMigrationPromise = null;
    if (persistTimer !== null && typeof window !== 'undefined') {
      window.clearTimeout(persistTimer);
      persistTimer = null;
    }
  }
}

function loadSavedLanguageSync(): LanguageCode {
  try {
    if (typeof localStorage !== 'undefined') {
      const saved =
        localStorage.getItem('app-lang') || localStorage.getItem(STORAGE_LANG_KEY);
      if (isSupportedLanguage(saved)) return saved;
    }
  } catch {
    // ignore
  }
  return DEFAULT_UI_LANGUAGE;
}

function persistLanguagePreference(lang: LanguageCode): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('app-lang', lang);
      localStorage.setItem(STORAGE_LANG_KEY, lang);
    }
  } catch {
    // ignore
  }
  void forageStore.setItem(FORAGE_LANG_KEY, lang).catch(() => undefined);
}

let currentTranslationTarget: LanguageCode = loadSavedLanguageSync();

if (typeof window !== 'undefined') {
  (window as unknown as { currentLang?: string }).currentLang = currentTranslationTarget;
  window.addEventListener('pagehide', () => {
    void flushForagePersistence();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      void flushForagePersistence();
    }
  });
}

let activeTranslateState = false;

interface TextNodeMeta {
  original: string;
  applied: string;
}

const nodeOriginalMeta = new WeakMap<Text, TextNodeMeta>();
const attrOriginalMeta = new WeakMap<Element, Record<string, TextNodeMeta>>();

export function getActiveGtxLanguage(): LanguageCode {
  return currentTranslationTarget;
}

async function fetchSingleChunkDirect(
  texts: string[],
  targetLang: string
): Promise<string[] | null> {
  if (texts.length === 0) return [];
  if (fetcherOverride) {
    return fetcherOverride(texts, targetLang);
  }
  const combined = texts.join(GTX_BATCH_DELIMITER);
  const url = buildGtxTranslateUrl(combined, targetLang, 'auto');

  try {
    const response = await fetch(url);
    if (response.ok) {
      const res = await response.json();
      const translatedCombined = parseGtxResponse(res);
      if (translatedCombined) {
        if (texts.length === 1) {
          return [preserveWhitespace(texts[0], translatedCombined)];
        }
        const parts = splitGtxBatch(translatedCombined);
        if (parts.length === texts.length) {
          return texts.map((orig, idx) =>
            preserveWhitespace(orig, parts[idx] ? parts[idx].trim() : orig.trim())
          );
        }
        if (texts.length > 1) {
          const mid = Math.ceil(texts.length / 2);
          const [left, right] = await Promise.all([
            fetchSingleChunkDirect(texts.slice(0, mid), targetLang),
            fetchSingleChunkDirect(texts.slice(mid), targetLang),
          ]);
          if (left && right) return [...left, ...right];
        }
      }
    }
  } catch {
    // Fallback below
  }

  return null;
}

export async function translateTextChunk(
  textArray: string[],
  targetLang: string
): Promise<string[]> {
  if (!textArray || textArray.length === 0) return [];
  if (targetLang === DEFAULT_UI_LANGUAGE) {
    return [...textArray];
  }

  await ensureForageCacheHydrated(targetLang);

  const results = new Array<string>(textArray.length);
  const missingUniqueIndices = new Map<string, number[]>();
  const waitPromises: Array<{ text: string; promise: Promise<string>; indices: number[] }> = [];
  const dict = getLangDict(targetLang);

  textArray.forEach((text, i) => {
    const cached = dict.get(text);
    if (cached) {
      results[i] = cached;
      return;
    }
    const existingFlight = inFlightTranslations.get(`${targetLang}:${text}`);
    if (existingFlight) {
      const existingWait = waitPromises.find((w) => w.text === text);
      if (existingWait) {
        existingWait.indices.push(i);
      } else {
        waitPromises.push({ text, promise: existingFlight, indices: [i] });
      }
      return;
    }
    const list = missingUniqueIndices.get(text);
    if (list) {
      list.push(i);
    } else {
      missingUniqueIndices.set(text, [i]);
    }
  });

  if (missingUniqueIndices.size > 0) {
    const uniqueTexts = Array.from(missingUniqueIndices.keys());
    const deferredResolvers = new Map<
      string,
      { resolve: (val: string) => void }
    >();

    for (const origText of uniqueTexts) {
      let resolveFn!: (val: string) => void;
      const p = new Promise<string>((resolve) => {
        resolveFn = resolve;
      });
      inFlightTranslations.set(`${targetLang}:${origText}`, p);
      deferredResolvers.set(origText, { resolve: resolveFn });
    }

    const chunks: string[][] = [];
    let currentChunk: string[] = [];
    let currentLen = 0;

    for (const text of uniqueTexts) {
      const extLen = encodeURIComponent(text + GTX_BATCH_DELIMITER).length;
      if (currentLen + extLen > GTX_MAX_URL_LEN && currentChunk.length > 0) {
        chunks.push(currentChunk);
        currentChunk = [];
        currentLen = 0;
      }
      currentChunk.push(text);
      currentLen += extLen;
    }
    if (currentChunk.length > 0) chunks.push(currentChunk);

    const newlyCachedEntries: Array<[string, string]> = [];

    try {
      for (let cIdx = 0; cIdx < chunks.length; cIdx++) {
        const chunk = chunks[cIdx];
        const translated = await fetchSingleChunkDirect(chunk, targetLang);
        if (translated && translated.length === chunk.length) {
          chunk.forEach((origText, idx) => {
            const finalText = translated[idx] || origText;
            if (finalText && !finalText.includes('<!DOCTYPE')) {
              setCachedTranslation(targetLang, origText, finalText);
              newlyCachedEntries.push([origText, finalText]);
            }
            const indices = missingUniqueIndices.get(origText) || [];
            indices.forEach((targetIdx) => {
              results[targetIdx] = finalText;
            });
            deferredResolvers.get(origText)?.resolve(finalText);
            inFlightTranslations.delete(`${targetLang}:${origText}`);
          });
        } else {
          chunk.forEach((origText) => {
            const indices = missingUniqueIndices.get(origText) || [];
            indices.forEach((targetIdx) => {
              results[targetIdx] = origText;
            });
            deferredResolvers.get(origText)?.resolve(origText);
            inFlightTranslations.delete(`${targetLang}:${origText}`);
          });
        }

        if (cIdx < chunks.length - 1) {
          await new Promise((r) => setTimeout(r, 70));
        }
      }
    } finally {
      for (const origText of uniqueTexts) {
        if (inFlightTranslations.has(`${targetLang}:${origText}`)) {
          inFlightTranslations.delete(`${targetLang}:${origText}`);
          deferredResolvers.get(origText)?.resolve(origText);
        }
      }
    }

    if (newlyCachedEntries.length > 0) {
      broadcastMessage({
        type: 'cache-delta',
        targetLang,
        entries: newlyCachedEntries,
      });
      scheduleForagePersistence();
    }
  }

  if (waitPromises.length > 0) {
    await Promise.all(
      waitPromises.map(async ({ promise, indices }) => {
        const val = await promise;
        indices.forEach((idx) => {
          results[idx] = val;
        });
      })
    );
  }

  return results;
}

function shouldSkipElement(el: Element | null): boolean {
  if (!el) return true;
  if (['SCRIPT', 'STYLE', 'SVG', 'CODE', 'PRE'].includes(el.tagName)) return true;
  if (
    el.closest('svg') ||
    el.closest('code') ||
    el.closest('pre') ||
    el.closest('.notranslate')
  ) {
    return true;
  }
  return false;
}

function shouldSkipTextContent(txt: string): boolean {
  const trimmed = txt.trim();
  if (!trimmed) return true;
  if (/^\d+(\.\d+)?(%|px|ms|tok|k|M)?$/.test(trimmed)) return true;
  if (/^\/v\d+$/.test(trimmed)) return true;
  return false;
}

type TranslationItem =
  | { type: 'text'; node: Text; original: string; meta: TextNodeMeta }
  | { type: 'attr'; node: Element; attr: string; original: string; meta: TextNodeMeta };

function applyItemTranslation(item: TranslationItem, textValue: string) {
  if (item.type === 'text') {
    item.meta.applied = textValue;
    if (item.node.nodeValue !== textValue) {
      item.node.nodeValue = textValue;
    }
  } else {
    item.meta.applied = textValue;
    if (item.node.getAttribute(item.attr) !== textValue) {
      item.node.setAttribute(item.attr, textValue);
    }
  }
}

function collectContainerItems(container: Node): {
  items: TranslationItem[];
  originals: string[];
} {
  const items: TranslationItem[] = [];
  const originals: string[] = [];

  const root =
    container.nodeType === Node.TEXT_NODE
      ? container.parentElement || container
      : container;

  if (root instanceof Element && shouldSkipElement(root)) {
    return { items, originals };
  }

  const processElementAttrs = (el: Element) => {
    for (const attr of TARGET_ATTRS) {
      if (!el.hasAttribute(attr)) continue;
      const val = el.getAttribute(attr) || '';
      if (!val.trim()) continue;
      let attrMap = attrOriginalMeta.get(el);
      if (!attrMap) {
        attrMap = {};
        attrOriginalMeta.set(el, attrMap);
      }
      let meta = attrMap[attr];
      if (!meta) {
        meta = { original: val, applied: val };
        attrMap[attr] = meta;
      } else if (val !== meta.applied && val !== meta.original) {
        meta.original = val;
        meta.applied = val;
      }
      items.push({ type: 'attr', node: el, attr, original: meta.original, meta });
      originals.push(meta.original);
    }
  };

  const processTextNode = (textNode: Text) => {
    const txt = textNode.nodeValue || '';
    if (shouldSkipTextContent(txt)) return;
    let meta = nodeOriginalMeta.get(textNode);
    if (!meta) {
      meta = { original: txt, applied: txt };
      nodeOriginalMeta.set(textNode, meta);
    } else if (txt !== meta.applied && txt !== meta.original) {
      // React updated the text content dynamically inside an existing Text node
      meta.original = txt;
      meta.applied = txt;
    }
    items.push({ type: 'text', node: textNode, original: meta.original, meta });
    originals.push(meta.original);
  };

  if (container.nodeType === Node.TEXT_NODE) {
    const textNode = container as Text;
    if (!shouldSkipElement(textNode.parentElement)) {
      processTextNode(textNode);
    }
    return { items, originals };
  }

  if (root instanceof Element) {
    processElementAttrs(root);
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ALL, {
    acceptNode: (node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        return shouldSkipElement(node as Element)
          ? NodeFilter.FILTER_REJECT
          : NodeFilter.FILTER_ACCEPT;
      }
      if (node.nodeType === Node.TEXT_NODE) {
        return shouldSkipElement(node.parentElement)
          ? NodeFilter.FILTER_REJECT
          : NodeFilter.FILTER_ACCEPT;
      }
      return NodeFilter.FILTER_SKIP;
    },
  });

  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (node.nodeType === Node.TEXT_NODE) {
      processTextNode(node as Text);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      processElementAttrs(node as Element);
    }
  }

  return { items, originals };
}

export async function translateContainer(
  container: Node | null,
  targetLang: LanguageCode
): Promise<void> {
  if (!container || typeof document === 'undefined') return;

  const { items, originals } = collectContainerItems(container);
  if (items.length === 0) return;

  if (targetLang === DEFAULT_UI_LANGUAGE) {
    items.forEach((item) => applyItemTranslation(item, item.original));
    return;
  }

  // Synchronous zero-flicker fast path if Forage DB cache is already hydrated
  if (hydratedLanguages.has(targetLang)) {
    const dict = getLangDict(targetLang);
    let missingAny = false;
    items.forEach((item) => {
      const hit = dict.get(item.original);
      if (hit) {
        applyItemTranslation(item, hit);
      } else {
        missingAny = true;
      }
    });
    if (!missingAny) return;
  }

  await ensureForageCacheHydrated(targetLang);
  if (currentTranslationTarget !== targetLang) return;

  // Apply hydrated Forage hits immediately before awaiting any remaining GTX HTTP calls
  const dictAfterHydration = getLangDict(targetLang);
  const uncachedOriginals: string[] = [];
  const uncachedItems: TranslationItem[] = [];
  items.forEach((item) => {
    const hit = dictAfterHydration.get(item.original);
    if (hit) {
      applyItemTranslation(item, hit);
    } else {
      uncachedItems.push(item);
      uncachedOriginals.push(item.original);
    }
  });

  if (uncachedItems.length === 0) return;

  const translated = await translateTextChunk(uncachedOriginals, targetLang);
  if (currentTranslationTarget !== targetLang) return;
  uncachedItems.forEach((item, idx) => {
    const trans = translated[idx];
    if (trans) {
      applyItemTranslation(item, trans);
    }
  });
}

let observerInitialized = false;
let pendingMicrotaskQueued = false;
const pendingAddedNodes = new Set<Node>();

function flushPendingObservedMutations(): void {
  pendingMicrotaskQueued = false;
  const targetLang = currentTranslationTarget;
  if (targetLang === DEFAULT_UI_LANGUAGE) {
    pendingAddedNodes.clear();
    return;
  }
  const nodes = Array.from(pendingAddedNodes);
  pendingAddedNodes.clear();
  for (const n of nodes) {
    if (n.isConnected) {
      void translateContainer(n, targetLang);
    }
  }
}

export function ensureGtxObserverStarted(): void {
  if (
    observerInitialized ||
    typeof document === 'undefined' ||
    typeof MutationObserver === 'undefined'
  ) {
    return;
  }
  observerInitialized = true;
  getSyncChannel();

  const observer = new MutationObserver((mutations) => {
    if (currentTranslationTarget === DEFAULT_UI_LANGUAGE) return;
    let addedAny = false;

    for (const mutation of mutations) {
      if (mutation.type === 'characterData') {
        const textNode = mutation.target as Text;
        const val = textNode.nodeValue || '';
        const meta = nodeOriginalMeta.get(textNode);
        if (meta && val === meta.applied) {
          continue;
        }
        if (val.trim().length > 0 && !shouldSkipElement(textNode.parentElement)) {
          pendingAddedNodes.add(textNode);
          addedAny = true;
        }
        continue;
      }

      mutation.addedNodes.forEach((n) => {
        if (n.nodeType === Node.ELEMENT_NODE) {
          if (!shouldSkipElement(n as Element)) {
            pendingAddedNodes.add(n);
            addedAny = true;
          }
        } else if (
          n.nodeType === Node.TEXT_NODE &&
          n.nodeValue &&
          n.nodeValue.trim().length > 0
        ) {
          if (!shouldSkipElement(n.parentElement)) {
            pendingAddedNodes.add(n);
            addedAny = true;
          }
        }
      });
    }

    if (!addedAny || pendingMicrotaskQueued) return;
    pendingMicrotaskQueued = true;
    queueMicrotask(flushPendingObservedMutations);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
}

export const CORE_UI_STRINGS: readonly string[] = [
  'New chat',
  'Close tab New chat',
  'New chat (double-click to rename)',
  'Pin "New chat"',
  'Unpin "New chat"',
  'Rename "New chat"',
  'Delete "New chat"',
  'What are we building today?',
  'What will we build today?',
  'Select model',
  'Search model or route...',
  'No model found for this filter.',
  'All',
  'Vision',
  'Temperature',
  'Effort',
  'Prompt Templates',
  'Analyze UI',
  'Code & Architecture',
  'Create Visual',
  'Compare Trade-offs',
  'Modalities and Actions',
  'Full',
  'Assisted',
  'Read-only',
  'Create with image',
  'Clear message',
  'Workspaces',
  'New workspace...',
  'Create',
  'Sessions',
  'Models',
  'Parameters',
  'Settings',
  'Language',
  'Appearance',
  'Gateway',
  'Personalization',
  'Memory',
  'Statistics',
  'Create image',
  'Explore ideas',
  'Quick summary',
  'Structure code',
  'Start with create image',
  'Start with explore ideas',
  'Start with quick summary',
  'Start with structure code',
  'Multimodal vision',
  'Adaptive reasoning',
  'Modality: Full',
  'Modality: Assisted',
  'Modality: Read-only',
];

export async function applyGtxLanguage(
  lang: LanguageCode,
  options: { broadcast?: boolean } = {}
): Promise<void> {
  if (activeTranslateState && lang === currentTranslationTarget) return;

  currentTranslationTarget = lang;
  if (typeof window !== 'undefined') {
    (window as unknown as { currentLang?: string }).currentLang = lang;
  }
  persistLanguagePreference(lang);
  if (options.broadcast !== false) {
    broadcastMessage({ type: 'lang-change', lang });
  }

  ensureGtxObserverStarted();
  activeTranslateState = true;
  try {
    if (typeof document !== 'undefined') {
      await translateContainer(document.body, lang);
    }
    if (lang !== DEFAULT_UI_LANGUAGE) {
      await translateTextChunk([...CORE_UI_STRINGS], lang);
    }
    await flushForagePersistence();
  } finally {
    activeTranslateState = false;
  }
}

export interface GtxLanguageContextValue {
  lang: LanguageCode;
  isTranslating: boolean;
  setLanguage: (nextLang: LanguageCode) => Promise<void>;
  formatConversationTitle: (title: string | undefined) => string;
}

const GtxLanguageContext = createContext<GtxLanguageContextValue>({
  lang: DEFAULT_UI_LANGUAGE,
  isTranslating: false,
  setLanguage: async () => undefined,
  formatConversationTitle,
});

export function GtxLanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LanguageCode>(loadSavedLanguageSync);
  const [isTranslating, setIsTranslating] = useState(false);
  const activeReqRef = useRef<number>(0);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang === 'pt' ? 'pt-BR' : lang;
    }
    persistLanguagePreference(lang);
  }, [lang]);

  const setLanguage = useCallback(
    async (nextLang: LanguageCode, broadcast = true) => {
      setLangState(nextLang);
      const reqId = ++activeReqRef.current;
      if (nextLang === DEFAULT_UI_LANGUAGE) {
        setIsTranslating(false);
        await applyGtxLanguage(nextLang, { broadcast });
        return;
      }
      setIsTranslating(true);
      try {
        await applyGtxLanguage(nextLang, { broadcast });
      } finally {
        if (activeReqRef.current === reqId) {
          setIsTranslating(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    ensureGtxObserverStarted();
    let cancelled = false;

    const listener = (msg: SyncChannelMessage) => {
      if (!cancelled && msg.type === 'lang-change' && msg.lang !== currentTranslationTarget) {
        void setLanguage(msg.lang, false);
      }
    };
    externalSyncListeners.add(listener);

    (async () => {
      try {
        const storedLang = await forageStore.getItem<string>(FORAGE_LANG_KEY);
        const target = isSupportedLanguage(storedLang)
          ? storedLang
          : loadSavedLanguageSync();
        if (cancelled) return;
        if (target !== DEFAULT_UI_LANGUAGE) {
          await setLanguage(target, false);
        } else if (lang !== DEFAULT_UI_LANGUAGE) {
          await setLanguage(lang, false);
        }
      } catch {
        if (!cancelled && lang !== DEFAULT_UI_LANGUAGE) {
          await setLanguage(lang, false);
        }
      }
    })();

    return () => {
      cancelled = true;
      externalSyncListeners.delete(listener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSetLanguage = useCallback(
    (nextLang: LanguageCode) => setLanguage(nextLang, true),
    [setLanguage]
  );

  const value = useMemo<GtxLanguageContextValue>(
    () => ({
      lang,
      isTranslating,
      setLanguage: handleSetLanguage,
      formatConversationTitle,
    }),
    [lang, isTranslating, handleSetLanguage]
  );

  return createElement(GtxLanguageContext.Provider, { value }, children);
}

export function useGtxLanguage(): GtxLanguageContextValue {
  return useContext(GtxLanguageContext);
}

function assertGtx(condition: unknown, message: string): void {
  if (!condition) throw new Error(`gtxTranslate self-test failed: ${message}`);
}

export async function runGtxTranslateSelfTests(): Promise<number> {
  assertGtx(DEFAULT_UI_LANGUAGE === 'en', 'DEFAULT_UI_LANGUAGE');
  assertGtx(SUPPORTED_LANGUAGES.length === 6, 'SUPPORTED_LANGUAGES count');
  assertGtx(isSupportedLanguage('pt') && !isSupportedLanguage('xx'), 'isSupportedLanguage');
  assertGtx(
    parseGtxResponse([[['Modalidades', 'Modalities', null, null, 3]], null, 'en']) === 'Modalidades',
    'parseGtxResponse'
  );
  assertGtx(
    JSON.stringify(splitGtxBatch('Total\n\n[:::==:::]\n\nAssistido')) === JSON.stringify(['Total', 'Assistido']),
    'splitGtxBatch'
  );
  assertGtx(preserveWhitespace('  Models  ', 'Modelos') === '  Modelos  ', 'preserveWhitespace');
  assertGtx(formatConversationTitle('Nova conversa') === 'New chat', 'formatConversationTitle');

  const backingForage = createMemoryForageStore();
  let fetchCount = 0;
  configureGtxForageForTesting({
    store: backingForage,
    resetMemory: true,
    fetcher: async (texts, targetLang) => {
      fetchCount++;
      return texts.map((t) => `[${targetLang}] ${t}`);
    },
  });

  const firstRun = await translateTextChunk(['New chat', 'Settings', 'New chat'], 'pt');
  assertGtx(
    JSON.stringify(firstRun) === JSON.stringify(['[pt] New chat', '[pt] Settings', '[pt] New chat']),
    'translateTextChunk dedupe'
  );
  assertGtx(fetchCount === 1, 'single fetch');
  await flushForagePersistence();

  const added = applyExternalCacheDelta('fr', [
    ['New chat', 'Nouvelle discussion'],
    ['Broken', '<!DOCTYPE html>error'],
  ]);
  assertGtx(added === 1 && getCachedTranslation('fr', 'New chat') === 'Nouvelle discussion', 'external delta');

  await clearForageTranslationCache();
  const stats = await getForageCacheStats();
  assertGtx(stats.totalEntries === 0, 'clearForageTranslationCache');
  configureGtxForageForTesting({ fetcher: null, resetMemory: true });
  return 3;
}

if (
  typeof process !== 'undefined' &&
  Array.isArray(process.argv) &&
  process.argv[1]?.endsWith('gtxTranslate.ts')
) {
  runGtxTranslateSelfTests()
    .then((passed) => {
      console.log(`gtxTranslate.ts embedded self-tests: ${passed} suites passed`);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

