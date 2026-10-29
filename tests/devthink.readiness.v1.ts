/**
 * devthink.readiness.v1.ts — the committed conversion record of the version
 * one plan fixture: what the cli migrateplan command produces when it reads
 * dist/fixtures/importers/v1-plan.json with --format v1, the evidence the
 * readiness review's migrateplan bridge gate walks. The record proves the
 * version one window closed clean — the converted plan lints green through
 * the same frozen grammar every authored plan answers.
 *
 * Provenance: migrated from devthink/artifacts/readiness-migrate-v1.json when
 * the flat folder law dissolved the artifacts folder of the application first
 * layer; the readiness gate regenerates the conversion at run time and
 * verifies it against this record, so the migration bridge never drifts
 * silently between releases.
 */

/** One converted step of a migrated plan: the id, the kind, the review label,
 * the optional target, value and options payloads and the consent gate flag
 * the plan grammar carries. */
export interface migratedplanstep {
  id: string;
  kind: string;
  label: string;
  target?: string;
  value?: string;
  options?: string;
  gate?: boolean;
}

/** The converted plan record of one importer fixture: the release version the
 * conversion stamps, the goal, the origin, the converted steps and the
 * grants the fixture carried over. */
export interface migratedplanrecord {
  version: string;
  goal: string;
  origin: string;
  steps: migratedplanstep[];
  grants?: string[];
}

/** The committed version one conversion of the 2.0.151 release — the
 * contact survey of the example project, six steps with the typed answer
 * behind its consent gate. */
export const readinessmigratev1: migratedplanrecord = {
  "version": "2.0.151",
  "goal": "Survey the contact form of the example project",
  "origin": "https://example.org",
  "steps": [
    {
      "id": "observe",
      "kind": "observe",
      "label": "Observe the contact page"
    },
    {
      "id": "read",
      "kind": "readforms",
      "label": "Read the contact form controls"
    },
    {
      "id": "inspect",
      "kind": "inspect",
      "label": "Inspect the form fields",
      "target": "form input"
    },
    {
      "id": "answer",
      "kind": "type",
      "label": "Type the survey answer",
      "target": "input[name=answer]",
      "value": "yes",
      "gate": true
    },
    {
      "id": "pause",
      "kind": "delay",
      "label": "Wait for the quiet form",
      "options": "{\"delay\":3000}"
    }
  ],
  "grants": [
    "observe",
    "readforms",
    "inspect",
    "type",
    "delay"
  ]
};
