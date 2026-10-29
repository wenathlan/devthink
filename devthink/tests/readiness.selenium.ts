/**
 * readiness.selenium.ts — the committed conversion record of the
 * selenium side fixture: what the cli migrateplan command produces when it
 * reads dist/fixtures/importers/selenium-side.json with --format selenium,
 * the evidence the readiness review's migrateplan bridge gate walks. The
 * record proves the selenium importer maps every command onto the plan
 * grammar the planlint command lints green.
 *
 * Provenance: migrated from devthink/artifacts/readiness-migrate-selenium.json
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

/** The committed selenium conversion of the 2.0.151 release — the example
 * contact survey over six commands, every interaction behind its consent
 * gate. */
export const readinessmigrateselenium: migratedplanrecord = {
  "version": "2.0.151",
  "goal": "example contact survey",
  "origin": "https://example.org",
  "steps": [
    {
      "id": "open",
      "kind": "navigate",
      "label": "Run the navigate step on https://example.org/contact",
      "value": "https://example.org/contact",
      "gate": true
    },
    {
      "id": "email",
      "kind": "type",
      "label": "Run the type step on input[name=email] with survey@example.org",
      "target": "input[name=email]",
      "value": "survey@example.org",
      "gate": true
    },
    {
      "id": "keys",
      "kind": "appendtext",
      "label": "Run the appendtext step on input[name=email] with  hello",
      "target": "input[name=email]",
      "value": " hello",
      "gate": true
    },
    {
      "id": "pick",
      "kind": "select",
      "label": "Run the select step on #topic with general",
      "target": "#topic",
      "value": "general",
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
      "label": "Run the delay step on 2000 milliseconds",
      "options": "{\"delay\":2000}"
    }
  ]
};
