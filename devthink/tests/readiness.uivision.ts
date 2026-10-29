/**
 * readiness.uivision.ts — the committed conversion record of the
 * ui vision macro fixture: what the cli migrateplan command produces when it
 * reads dist/fixtures/importers/uivision-macro.json with --format uivision,
 * the evidence the readiness review's migrateplan bridge gate walks. The
 * record proves the ui vision importer maps every command onto the plan
 * grammar the planlint command lints green.
 *
 * Provenance: migrated from devthink/artifacts/readiness-migrate-uivision.json
 * when the flat folder law dissolved the artifacts folder of the application
 * first layer; the readiness gate regenerates the conversion at run time and
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
 * conversion stamps, the goal, the origin and the converted steps. */
export interface migratedplanrecord {
  version: string;
  goal: string;
  origin: string;
  steps: migratedplanstep[];
}

/** The committed ui vision conversion of the 2.0.151 release — the example
 * releases read, four commands with the typed filter behind its consent
 * gate. */
export const readinessmigrateuivision: migratedplanrecord = {
  "version": "2.0.151",
  "goal": "example releases read",
  "origin": "https://example.org",
  "steps": [
    {
      "id": "open-1",
      "kind": "navigate",
      "label": "Run the navigate step on https://example.org/releases",
      "value": "https://example.org/releases",
      "gate": true
    },
    {
      "id": "click-2",
      "kind": "click",
      "label": "Run the click step on nav a.releases",
      "target": "nav a.releases",
      "gate": true
    },
    {
      "id": "type-3",
      "kind": "type",
      "label": "Run the type step on input[name=filter] with release notes",
      "target": "input[name=filter]",
      "value": "release notes",
      "gate": true
    },
    {
      "id": "verifytext-4",
      "kind": "waittext",
      "label": "Run the waittext step on main h1 with Releases",
      "target": "main h1",
      "value": "Releases"
    }
  ]
};
