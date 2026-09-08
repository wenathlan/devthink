/**
 * @file constants.test.ts
 * @description
 *  Tests for the constants module of maene (`../constants.js`). Confirms the
 *  shape and presence of the headline catalog aggregates (`ALL_MODELS_2026`,
 *  `MODEL_BY_ID`, `MODEL_ROUTING`), and verifies a few well-known model ids
 *  from the package.json `antigravity.latest_models` manifest are present in
 *  the flat string catalog used by per-family arrays.
 *
 *  Uses `node:test` + `node:assert/strict` per the architecture skill
 *  ("node:* first"). bun resolves `.js` specifiers to the sibling `.ts`
 *  source automatically. Imports only leaf modules; does NOT import
 *  `plugin.ts` or `index.ts` (they pull the optional @opencode-ai/plugin
 *  peer SDK which may not be installed in the test environment).
 */

import { it as test } from "vitest";
import assert from "node:assert/strict";

import {
  ALL_MODELS_2026,
  MODEL_BY_ID,
  MODEL_ROUTING,
  MODEL_IDS_2026_08_25,
  ANTIGRAVITY_MODEL_IDS_2026,
} from "../../models.js";
import { PROJECT_FALLBACK, OAUTH_CALLBACK_HOST, OAUTH_CALLBACK_PATH, JITTER_MAX_MS } from "../../constants.js";

test("ALL_MODELS_2026 is a non-empty array of ModelDefinition entries", () => {
  try {
    assert.ok(Array.isArray(ALL_MODELS_2026), "ALL_MODELS_2026 must be an array");
    assert.ok(ALL_MODELS_2026.length > 0, "ALL_MODELS_2026 must be non-empty");
    // Note: the const is declared with a `readonly ModelDefinition[]` type
    // annotation, but it is NOT wrapped in `Object.freeze(...)` at runtime.
    // So it is not strictly frozen — it is only type-checked as readonly.
  } catch (err) {
    assert.fail(`constants shape check failed: ${(err as Error).message}`);
  }
});

test("ALL_MODELS_2026 entries have the expected ModelDefinition shape", () => {
  try {
    for (const m of ALL_MODELS_2026) {
      assert.equal(typeof m.id, "string", "model.id must be a string");
      assert.ok(m.id.length > 0, "model.id must be non-empty");
      assert.equal(typeof m.name, "string", "model.name must be a string");
      assert.equal(typeof m.context, "number", "model.context must be a number");
      assert.equal(typeof m.output, "number", "model.output must be a number");
    }
  } catch (err) {
    assert.fail(`ALL_MODELS_2026 entry shape check failed: ${(err as Error).message}`);
  }
});

test("MODEL_BY_ID is an object indexed by id and resolves known entries", () => {
  try {
    assert.equal(typeof MODEL_BY_ID, "object", "MODEL_BY_ID must be an object");
    assert.notEqual(MODEL_BY_ID, null, "MODEL_BY_ID must not be null");

    // Every ALL_MODELS_2026 id must resolve in MODEL_BY_ID.
    for (const m of ALL_MODELS_2026) {
      const found = (MODEL_BY_ID as Record<string, unknown>)[m.id];
      assert.ok(found, `MODEL_BY_ID must contain id=${m.id}`);
    }

    // Specific known id present in the canonical catalog (constants.ts:934).
    const opus = (MODEL_BY_ID as Record<string, any>)["antigravity-claude-opus-4-6-thinking"];
    assert.ok(opus, "antigravity-claude-opus-4-6-thinking must be in MODEL_BY_ID");
    assert.equal(opus.id, "antigravity-claude-opus-4-6-thinking");
  } catch (err) {
    assert.fail(`MODEL_BY_ID shape check failed: ${(err as Error).message}`);
  }
});

test("MODEL_ROUTING exists and exposes routing for the canonical antigravity- ids", () => {
  try {
    assert.equal(typeof MODEL_ROUTING, "object", "MODEL_ROUTING must be an object");
    assert.notEqual(MODEL_ROUTING, null, "MODEL_ROUTING must not be null");
    assert.ok(Object.keys(MODEL_ROUTING).length > 0, "MODEL_ROUTING must have entries");

    const known = (MODEL_ROUTING as Record<string, any>)["antigravity-gemini-3.1-pro"];
    assert.ok(known, "antigravity-gemini-3.1-pro must have a routing entry");
    assert.equal(typeof known.endpoint, "string", "routing.endpoint must be string");
    assert.equal(typeof known.stream, "boolean", "routing.stream must be boolean");
    assert.ok(known.api === "antigravity" || known.api === "gemini-cli", "routing.api must be a known provider");
  } catch (err) {
    assert.fail(`MODEL_ROUTING shape check failed: ${(err as Error).message}`);
  }
});

test("flat string catalog exposes the bare ids referenced by package.json antigravity.latest_models", () => {
  // package.json `antigravity.latest_models` includes bare ids like
  // `gemini-3.1-pro`, `claude-opus-4-6-thinking`, `gemini-3.7-flash`,
  // etc. Those bare ids are NOT in ALL_MODELS_2026 (which is antigravity-*
  // prefixed plus preview ids) — they live in the per-family MODELS_2026_08_25
  // flat string catalog, exposed via MODEL_IDS_2026_08_25.
  try {
    const flat = (MODEL_IDS_2026_08_25 ?? []) as readonly string[];
    assert.ok(Array.isArray(flat), "MODEL_IDS_2026_08_25 must be an array");
    assert.ok(flat.length > 0, "MODEL_IDS_2026_08_25 must be non-empty");

    // Validate that the flat catalog exposes bare ids (not antigravity- prefixed).
    assert.ok(flat.includes("gemini-3.1-pro"), "flat catalog must include gemini-3.1-pro");
    assert.ok(flat.includes("claude-opus-4-6-thinking"), "flat catalog must include claude-opus-4-6-thinking");
  } catch (err) {
    assert.fail(`flat catalog check failed: ${(err as Error).message}`);
  }
});

test("ANTIGRAVITY_MODEL_IDS_2026 is a non-empty array of string ids", () => {
  try {
    const ids = (ANTIGRAVITY_MODEL_IDS_2026 ?? []) as readonly string[];
    assert.ok(Array.isArray(ids), "ANTIGRAVITY_MODEL_IDS_2026 must be an array");
    assert.ok(ids.length > 0, "ANTIGRAVITY_MODEL_IDS_2026 must be non-empty");
    for (const id of ids) {
      assert.equal(typeof id, "string", "id must be string");
    }
  } catch (err) {
    assert.fail(`ANTIGRAVITY_MODEL_IDS_2026 check failed: ${(err as Error).message}`);
  }
});

test("misc constants: PROJECT_FALLBACK, OAUTH_CALLBACK_HOST/PATH, JITTER_MAX_MS", () => {
  try {
    assert.equal(PROJECT_FALLBACK, "rising-fact-p41fc", "PROJECT_FALLBACK must be the shared public project id");
    assert.equal(OAUTH_CALLBACK_HOST, "127.0.0.1", "OAUTH_CALLBACK_HOST must be loopback");
    assert.equal(OAUTH_CALLBACK_PATH, "/callback", "OAUTH_CALLBACK_PATH must be /callback");
    assert.equal(JITTER_MAX_MS, 80, "JITTER_MAX_MS must be 80ms (anti-rate-limit window)");
  } catch (err) {
    assert.fail(`misc constants check failed: ${(err as Error).message}`);
  }
});
