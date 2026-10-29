/**
 * readiness.automa.ts — the committed conversion record of the
 * automa workflow fixture: what the cli migrateplan command produces when it
 * reads dist/fixtures/importers/automa-workflow.json with --format automa,
 * the evidence the readiness review's migrateplan bridge gate walks. The
 * record proves the automa importer maps every block onto the plan grammar
 * the planlint command lints green.
 *
 * Provenance: migrated from devthink/artifacts/readiness-migrate-automa.json
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

/** The committed automa conversion of the 2.0.151 release — the contact
 * survey sweep over the example origin, four steps with the fill and the
 * click behind their consent gates. */
export const readinessmigrateautoma: migratedplanrecord = {
  "version": "2.0.151",
  "goal": "contact survey sweep",
  "origin": "https://example.org",
  "steps": [
    {
      "id": "tab",
      "kind": "tabcreate",
      "label": "Run the tabcreate step on https://example.org/contact",
      "value": "https://example.org/contact",
      "gate": true
    },
    {
      "id": "survey",
      "kind": "fillform",
      "label": "Run the fillform step on 2 form fields",
      "options": "{\"fields\":[{\"name\":\"email\",\"value\":\"survey@example.org\",\"selector\":\"input[name=email]\"},{\"name\":\"message\",\"value\":\"hello from the sweep\",\"selector\":\"textarea\"}]}",
      "gate": true
    },
    {
      "id": "send",
      "kind": "click",
      "label": "Run the click step on button.primary",
      "target": "button.primary",
      "gate": true
    },
    {
      "id": "hold",
      "kind": "delay",
      "label": "Run the delay step on 1500 milliseconds",
      "options": "{\"delay\":1500}"
    }
  ]
};
