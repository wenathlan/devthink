/** The example fixture set of the headless and packaging lanes as one dense typescript module: the recorded page state, the two example plans and the two example workflows the build materializes into dist/fixtures so the packages, the container smoke and the nuget content set ship them. Each export holds the exact original file text of its tests/code source. */

/** The example.org page state fixture of the headless lane — the recorded observation (the url, the title, the text preview, the forms and the elements) the headless fixture loader parses under schemastrict and the library modes test resolves; the exact text of the former example-org-pagestate.json. */
export const exampleorgpagestate = `{
  "id": "example-org-pagestate",
  "origin": "https://example.org",
  "recordedat": 1800000000000,
  "grants": ["observe", "readtext", "readforms", "inspect", "countelements"],
  "observation": {
    "schemaversion": 1,
    "url": "https://example.org/releases",
    "title": "Example releases",
    "textpreview": "Release notes of the example project: the latest release ships the cli expansion.",
    "textlength": 512,
    "forms": [
      { "label": "email", "type": "email", "name": "email" },
      { "label": "message", "type": "textarea", "name": "message" }
    ],
    "interactive": [
      { "selector": "main a", "role": "link", "label": "latest release" },
      { "selector": "form button", "role": "button", "label": "send" }
    ],
    "capturedat": 1800000000000
  }
}
`;

/** The contact form inventory plan — the three step example plan (observe, readforms, inspect) over https://example.org the fixtureset ships as fixtures/plans/form-inventory-plan.json; the exact text of the former form-inventory-plan.json. */
export const forminventoryplan = `{
  "version": "1.1.79",
  "goal": "Inventory the contact form of the example project",
  "origin": "https://example.org",
  "grants": ["observe", "readforms", "inspect"],
  "steps": [
    { "id": "observe", "kind": "observe", "label": "Observe the contact page" },
    { "id": "forms", "kind": "readforms", "label": "Read the contact form controls" },
    { "id": "inspect", "kind": "inspect", "label": "Inspect the interactive elements", "target": "form" }
  ]
}
`;

/** The release notes plan — the headless example plan the container smoke runs (node dist/cli.js headless dist/fixtures/plans/release-notes-plan.json --fixtures dist/fixtures); the exact text of the former release-notes-plan.json. */
export const releasenotesplan = `{
  "version": "1.1.79",
  "goal": "Read the release notes of the example project",
  "origin": "https://example.org",
  "grants": ["observe", "readtext", "countelements"],
  "steps": [
    { "id": "observe", "kind": "observe", "label": "Observe the release page" },
    { "id": "read", "kind": "readtext", "label": "Read the release notes text", "target": "main" },
    { "id": "count", "kind": "countelements", "label": "Count the release sections", "target": "main section" }
  ]
}
`;

/** The changelog digest workflow — the example workflow document (observe, waitelement, readtext steps over the example changelog) the fixtureset ships as fixtures/workflows/changelog-digest-workflow.json; the exact text of the former changelog-digest-workflow.json. */
export const changelogdigestworkflow = `{
  "version": "1.1.79",
  "workflow": {
    "name": "changelog digest",
    "version": 1,
    "origins": ["https://example.org"],
    "steps": [
      { "id": "observe", "kind": "observe", "label": "Observe the changelog page" },
      { "id": "wait", "kind": "waitelement", "label": "Wait for the changelog list", "target": "main" },
      { "id": "read", "kind": "readtext", "label": "Read the changelog text", "target": "main" }
    ]
  }
}
`;

/** The form survey workflow — the example workflow document the fixtureset ships as fixtures/workflows/form-survey-workflow.json beside the changelog digest; the exact text of the former form-survey-workflow.json. */
export const formsurveyworkflow = `{
  "version": "1.1.79",
  "workflow": {
    "name": "form survey",
    "version": 1,
    "origins": ["https://example.org"],
    "steps": [
      { "id": "observe", "kind": "observe", "label": "Observe the survey page" },
      { "id": "wait", "kind": "waitelement", "label": "Wait for the survey form", "target": "form" },
      { "id": "read", "kind": "readtext", "label": "Read the survey instructions", "target": "main" }
    ]
  }
}
`;

/** The plain node cjs sample — the one script that requires the library in cjs mode (the stable getter object exposes the same named exports as the esm build) the fixtureset ships as fixtures/cjs.js beside the bun and deno shells; the exact text of the former code/cjs.js. */
export const cjssample = `/** One plain node script that requires the library in cjs mode: the stable getter object exposes the same named exports as the esm build. */
const devthink = require("@wenathlan/extension");

const stamp = devthink.bundlestamp();
console.log(\`devthink \${stamp.version} in \${stamp.mode} mode\`);
console.log(\`policy exports \${Object.keys(require("@wenathlan/extension/policy")).length} functions\`);
`;
