/**
 * devthink.readiness.tabular.ts — the committed conversion record of the
 * tabular csv fixture: what the cli migrateplan command produces when it
 * reads dist/fixtures/importers/tabular-plan.csv with --format tabular, the
 * evidence the readiness review's migrateplan bridge gate walks. The record
 * proves the tabular importer maps every row onto the plan grammar the
 * planlint command lints green.
 *
 * Provenance: migrated from devthink/artifacts/readiness-migrate-tabular.json
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

/** The committed tabular conversion of the 2.0.151 release — the releases
 * page survey of the example project, four rows with the typed filter behind
 * its consent gate. */
export const readinessmigratetabular: migratedplanrecord = {
  "version": "2.0.151",
  "goal": "Survey the releases page of the example project",
  "origin": "https://example.org",
  "steps": [
    {
      "id": "observe-1",
      "kind": "observe",
      "label": "Run the observe step"
    },
    {
      "id": "readtext-2",
      "kind": "readtext",
      "label": "Run the readtext step on main",
      "target": "main"
    },
    {
      "id": "countelements-3",
      "kind": "countelements",
      "label": "Run the countelements step on main section",
      "target": "main section"
    },
    {
      "id": "type-4",
      "kind": "type",
      "label": "Run the type step on input[name=filter]",
      "target": "input[name=filter]",
      "value": "release notes, digest",
      "gate": true
    }
  ]
};
