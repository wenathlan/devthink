/**
 * @file models.test.ts
 * @description
 *  Tests for the models module of maene (`../models.js`). Confirms the
 *  logical->physical routing helpers (`routeModelViaOmniRoute`,
 *  `mapModelFor9Router`) plus catalog smoke checks: catalog presence,
 *  lookup determinism, unknown-id fallback.
 *
 *  Uses `node:test` + `node:assert/strict`. Imports only leaf modules; the
 *  models module pulls only `node:crypto` + `node:os`.
 */

import { it as test } from "vitest";
import assert from "node:assert/strict";

import {
  MODEL_CATALOG_2026_08_25,
  MODEL_MAP_2026_08_25,
  MODEL_ALIASES_2026_08_25,
  MODEL_CATALOG_GROUPED,
  DEFAULT_MODEL,
  SEARCH_MODEL,
  OMNIROUTE_FALLBACK_MODEL,
  FALLBACKS,
  MODELS_2026,
  ANTIGRAVITY_MODELS,
  GEMINICLI_MODELS,
  ALL_MODELS_WITH_PREFIX,
  isCLIOnly,
  getModel,
  hasModel,
  listModelIds,
  listBareModelIds,
  routeModelViaOmniRoute,
  mapModelFor9Router,
  normalizeModelId,
} from "../../models.js";

test("MODEL_CATALOG_2026_08_25 is a frozen non-empty array", () => {
  try {
    assert.ok(Array.isArray(MODEL_CATALOG_2026_08_25), "must be an array");
    assert.ok(MODEL_CATALOG_2026_08_25.length > 0, "must have entries");
    assert.equal(Object.isFrozen(MODEL_CATALOG_2026_08_25), true, "must be frozen");
  } catch (err) {
    assert.fail(`MODEL_CATALOG check failed: ${(err as Error).message}`);
  }
});

test("MODEL_MAP_2026_08_25 is a Map that resolves every catalog id", () => {
  try {
    assert.ok(MODEL_MAP_2026_08_25 instanceof Map, "MODEL_MAP must be a Map");
    for (const m of MODEL_CATALOG_2026_08_25) {
      const got = MODEL_MAP_2026_08_25.get(m.id.toLowerCase());
      assert.ok(got, `MODEL_MAP must contain id ${m.id}`);
    }
  } catch (err) {
    assert.fail(`MODEL_MAP check failed: ${(err as Error).message}`);
  }
});

test("getModel resolves known ids and returns undefined for unknown", () => {
  try {
    const a = getModel("gemini-3.7-flash");
    assert.ok(a, "gemini-3.7-flash must resolve");
    assert.equal(a?.id, "gemini-3.7-flash");

    const b = getModel("claude-opus-4-6-thinking");
    assert.ok(b, "claude-opus-4-6-thinking must resolve");
    assert.equal(b?.id, "claude-opus-4-6-thinking");

    // antigravity- prefixed variant of the same id must resolve too.
    const c = getModel("antigravity-gemini-3.7-flash");
    assert.ok(c, "antigravity- prefixed alias must resolve");

    // unknown id returns undefined.
    const z = getModel("not-a-real-model-id");
    assert.equal(z, undefined, "unknown id must return undefined");

    // empty/null must not throw.
    assert.equal(getModel(""), undefined);
    assert.equal(getModel(null as unknown as string), undefined);
  } catch (err) {
    assert.fail(`getModel check failed: ${(err as Error).message}`);
  }
});

test("hasModel mirrors getModel", () => {
  try {
    assert.equal(hasModel("gemini-3.7-flash"), true);
    assert.equal(hasModel("claude-opus-4-6-thinking"), true);
    assert.equal(hasModel("not-real"), false);
  } catch (err) {
    assert.fail(`hasModel check failed: ${(err as Error).message}`);
  }
});

test("routeModelViaOmniRoute returns the physical id + group + endpoint list for known ids", () => {
  try {
    const r = routeModelViaOmniRoute("gemini-3.7-flash");
    assert.ok(r, "must return a routing result");
    assert.equal(r.physicalId, "gemini-3.7-flash", "physicalId must match the input id for a known model");
    assert.ok(r.group === "antigravity" || r.group === "gemini-cli", "group must be a known ModelGroup");
    assert.ok(Array.isArray(r.endpoints), "endpoints must be an array");
    assert.ok(r.endpoints.length > 0, "endpoints must be non-empty");
    assert.equal(typeof r.prodOnly, "boolean", "prodOnly must be boolean");
    assert.equal(typeof r.fallbackAllowed, "boolean", "fallbackAllowed must be boolean");
  } catch (err) {
    assert.fail(`routeModelViaOmniRoute known-id check failed: ${(err as Error).message}`);
  }
});

test("routeModelViaOmniRoute round-trip: same id twice -> same result", () => {
  try {
    const a = routeModelViaOmniRoute("gemini-3.7-flash");
    const b = routeModelViaOmniRoute("gemini-3.7-flash");
    assert.deepEqual(a, b, "routing must be deterministic across calls");
  } catch (err) {
    assert.fail(`routeModelViaOmniRoute round-trip check failed: ${(err as Error).message}`);
  }
});

test("routeModelViaOmniRoute unknown id falls back to OMNIROUTE_FALLBACK_MODEL on gemini-cli pool", () => {
  try {
    const r = routeModelViaOmniRoute("does-not-exist-xyz");
    assert.equal(r.physicalId, OMNIROUTE_FALLBACK_MODEL, "unknown id must fall back to OMNIROUTE_FALLBACK_MODEL");
    assert.equal(r.group, "gemini-cli", "fallback group must be gemini-cli");
    assert.equal(r.prodOnly, true, "fallback must be prod-only (skip sandbox)");
    assert.equal(r.fallbackAllowed, false, "fallback must disallow project fallback (403 risk)");
  } catch (err) {
    assert.fail(`routeModelViaOmniRoute unknown-id check failed: ${(err as Error).message}`);
  }
});

test("mapModelFor9Router returns provider + model + group for known ids", () => {
  try {
    const m = mapModelFor9Router("gemini-3.7-flash");
    assert.ok(m, "must return a 9router mapping");
    assert.equal(typeof m.provider, "string", "provider must be string");
    assert.equal(typeof m.model, "string", "model must be string");
    assert.ok(m.group === "antigravity" || m.group === "gemini-cli", "group must be a known ModelGroup");
    // For a known id, .model should equal the canonical id.
    assert.equal(m.model, "gemini-3.7-flash");
  } catch (err) {
    assert.fail(`mapModelFor9Router known-id check failed: ${(err as Error).message}`);
  }
});

test("mapModelFor9Router unknown id falls back to normalized id + gemini-cli group", () => {
  try {
    const m = mapModelFor9Router("gpt-4-turbo");
    assert.equal(m.provider, "google", "unknown id must default provider to google");
    assert.equal(m.group, "gemini-cli", "unknown id must default group to gemini-cli");
    assert.equal(m.model, "gpt-4-turbo", "unknown id model must be the normalized id");
  } catch (err) {
    assert.fail(`mapModelFor9Router unknown-id check failed: ${(err as Error).message}`);
  }
});

test("normalizeModelId strips antigravity- prefix and lowercases", () => {
  try {
    assert.equal(normalizeModelId("Antigravity-Gemini-3.7-Flash"), "gemini-3.7-flash");
    assert.equal(normalizeModelId("gemini-3.7-flash"), "gemini-3.7-flash");
    assert.equal(normalizeModelId("  gemini-3.7-flash  "), "gemini-3.7-flash");
  } catch (err) {
    assert.fail(`normalizeModelId check failed: ${(err as Error).message}`);
  }
});

test("listModelIds and listBareModelIds return non-empty arrays of strings", () => {
  try {
    const all = listModelIds();
    assert.ok(Array.isArray(all));
    assert.ok(all.length > 0);

    const bare = listBareModelIds();
    assert.ok(Array.isArray(bare));
    assert.ok(bare.length > 0);

    // listBareModelIds must not contain antigravity- prefixed ids.
    assert.ok(!bare.some((id) => id.startsWith("antigravity-")), "bare ids must not have antigravity- prefix");
  } catch (err) {
    assert.fail(`list ids check failed: ${(err as Error).message}`);
  }
});

test("isCLIOnly flags gemini-3+ / preview / customtools models", () => {
  try {
    assert.equal(isCLIOnly("gemini-3.7-flash-preview"), true, "preview must be CLI-only");
    assert.equal(isCLIOnly("gemini-3.6-flash"), true, "3.6 must be CLI-only");
    assert.equal(isCLIOnly("gemini-3.1-pro-preview-customtools"), true, "customtools must be CLI-only");
    // antigravity-pool bare ids (not preview, not 3+) should be NOT CLI-only.
    assert.equal(isCLIOnly("gpt-oss-120b-medium"), false, "gpt-oss must NOT be CLI-only");
  } catch (err) {
    assert.fail(`isCLIOnly check failed: ${(err as Error).message}`);
  }
});

test("MODEL_ALIASES_2026_08_25 is a Map", () => {
  try {
    assert.ok(MODEL_ALIASES_2026_08_25 instanceof Map, "MODEL_ALIASES must be a Map");
    // antigravity- prefixed aliases are part of the alias map.
    assert.ok(MODEL_ALIASES_2026_08_25.size >= 0, "size must be a number (may be 0 if no aliases)");
  } catch (err) {
    assert.fail(`MODEL_ALIASES check failed: ${(err as Error).message}`);
  }
});

test("MODEL_CATALOG_GROUPED exposes per-group / per-level slices", () => {
  try {
    assert.equal(typeof MODEL_CATALOG_GROUPED, "object");
    assert.ok(Array.isArray(MODEL_CATALOG_GROUPED.antigravity), "antigravity slice must be array");
    assert.ok(Array.isArray(MODEL_CATALOG_GROUPED["gemini-cli"]), "gemini-cli slice must be array");
    assert.ok(Array.isArray(MODEL_CATALOG_GROUPED.preview), "preview slice must be array");
    assert.ok(Array.isArray(MODEL_CATALOG_GROUPED.stable), "stable slice must be array");
  } catch (err) {
    assert.fail(`MODEL_CATALOG_GROUPED check failed: ${(err as Error).message}`);
  }
});

test("DEFAULT_MODEL + SEARCH_MODEL + FALLBACKS are sensible constant strings", () => {
  try {
    assert.equal(typeof DEFAULT_MODEL, "string");
    assert.equal(typeof SEARCH_MODEL, "string");
    assert.ok(DEFAULT_MODEL.startsWith("antigravity-"), "DEFAULT_MODEL must be antigravity- prefixed");
    assert.ok(SEARCH_MODEL.startsWith("gemini-"), "SEARCH_MODEL must be a bare gemini id");

    assert.equal(typeof FALLBACKS, "object");
    assert.equal(FALLBACKS.project, "rising-fact-p41fc");
    assert.equal(FALLBACKS.version, "1.19.2");
    assert.ok(FALLBACKS.ua.startsWith("antigravity/"), "FALLBACKS.ua must start with antigravity/");
  } catch (err) {
    assert.fail(`DEFAULT_MODEL / SEARCH_MODEL / FALLBACKS check failed: ${(err as Error).message}`);
  }
});

test("MODELS_2026 + ANTIGRAVITY_MODELS + GEMINICLI_MODELS + ALL_MODELS_WITH_PREFIX arrays are non-empty", () => {
  try {
    assert.ok(Array.isArray(MODELS_2026) && MODELS_2026.length > 0);
    assert.ok(Array.isArray(ANTIGRAVITY_MODELS) && ANTIGRAVITY_MODELS.length > 0);
    assert.ok(Array.isArray(GEMINICLI_MODELS) && GEMINICLI_MODELS.length > 0);
    assert.ok(Array.isArray(ALL_MODELS_WITH_PREFIX) && ALL_MODELS_WITH_PREFIX.length > 0);

    // Every antigravity id must start with antigravity-.
    for (const id of ANTIGRAVITY_MODELS) {
      assert.ok(id.startsWith("antigravity-"), `id ${id} must be antigravity- prefixed`);
    }
  } catch (err) {
    assert.fail(`flat catalog arrays check failed: ${(err as Error).message}`);
  }
});
