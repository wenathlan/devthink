/** The importer sample set of the migrateplan bridge as one dense typescript module: the five source format happy fixtures (version one, automa, selenium, ui vision, tabular) beside their five refusal twins, each export holding the exact original file text of the tests/code/importers source set. The migrateplan suite converts every happy fixture into a plan the planlint lints green and proves every refusal twin names its refused entry; the build materializes the same texts into dist/fixtures/importers so the packages and the readiness migration bridge ship them. */

/** the version one happy fixture — the five step contact survey (observe, readforms, inspect, type, delay) over https://example.org with the milliseconds field the delay step lifts onto the reviewed options grammar — the exact text of the former v1-plan.json. */
export const v1plan = `{
  "version": "1",
  "goal": "Survey the contact form of the example project",
  "origin": "https://example.org",
  "grants": ["observe", "readforms", "inspect", "type", "delay"],
  "steps": [
    { "id": "observe", "action": "observe", "label": "Observe the contact page" },
    { "id": "read", "action": "readforms", "label": "Read the contact form controls" },
    { "id": "inspect", "action": "inspect", "label": "Inspect the form fields", "selector": "form input" },
    { "id": "answer", "action": "type", "label": "Type the survey answer", "selector": "input[name=answer]", "value": "yes" },
    { "id": "pause", "action": "delay", "label": "Wait for the quiet form", "milliseconds": 3000 }
  ]
}
`;

/** the version one refusal twin — the screenshotpage action the reviewed catalog refuses, so the importer names the entry and drops nothing silently — the exact text of the former v1-unknown.json. */
export const v1unknown = `{
  "version": "1",
  "goal": "Capture the contact page of the example project",
  "origin": "https://example.org",
  "steps": [
    { "id": "observe", "action": "observe", "label": "Observe the contact page" },
    { "id": "snap", "action": "screenshotpage", "label": "Screenshot the page" }
  ]
}
`;

/** the automa happy fixture — the newtab block over the contact page, the survey form fill, the send click and the delay, with the trigger block landing in the report as the paused trigger — the exact text of the former automa-workflow.json. */
export const automaworkflow = `{
  "name": "contact survey sweep",
  "version": "1.0.0",
  "blocks": {
    "trigger": { "id": "trigger", "type": "trigger", "data": { "type": "manual" } },
    "tab": { "id": "tab", "type": "newtab", "data": { "url": "https://example.org/contact", "active": true } },
    "survey": {
      "id": "survey",
      "type": "forms",
      "data": { "fields": [
        { "name": "email", "value": "survey@example.org", "selector": "input[name=email]" },
        { "name": "message", "value": "hello from the sweep", "selector": "textarea" }
      ] }
    },
    "send": { "id": "send", "type": "click-element", "data": { "selector": "button.primary" } },
    "hold": { "id": "hold", "type": "wait", "data": { "ms": 1500 } }
  }
}
`;

/** the automa refusal twin — the ping notification block the conversion table refuses with the block named — the exact text of the former automa-unknown.json. */
export const automaunknown = `{
  "name": "contact survey sweep with a notification",
  "blocks": {
    "tab": { "id": "tab", "type": "newtab", "data": { "url": "https://example.org/contact" } },
    "ping": { "id": "ping", "type": "notification", "data": { "message": "the sweep finished" } }
  }
}
`;

/** the selenium side happy fixture — the open, the email type, the appendtext, the topic select, the send click and the pause of the contact survey, with the css, id and name locators resolved onto the reviewed grammar — the exact text of the former selenium-side.json. */
export const seleniumside = `{
  "id": "side-example",
  "version": "2.0",
  "name": "example contact survey",
  "url": "https://example.org",
  "tests": [
    {
      "id": "survey",
      "name": "survey",
      "commands": [
        { "id": "open", "command": "open", "target": "/contact", "value": "" },
        { "id": "email", "command": "type", "target": "css=input[name=email]", "value": "survey@example.org" },
        { "id": "keys", "command": "sendKeys", "target": "css=input[name=email]", "value": " hello" },
        { "id": "pick", "command": "select", "target": "id=topic", "value": "general" },
        { "id": "send", "command": "click", "target": "css=button.primary", "value": "" },
        { "id": "hold", "command": "pause", "target": "2000", "value": "" }
      ]
    }
  ]
}
`;

/** the selenium refusal twin — the mouseOver command the conversion table refuses with the command named — the exact text of the former selenium-unknown.json. */
export const seleniumunknown = `{
  "id": "side-unknown",
  "version": "2.0",
  "name": "example unknown command",
  "url": "https://example.org",
  "tests": [
    {
      "id": "mystery",
      "name": "mystery",
      "commands": [
        { "id": "open", "command": "open", "target": "/", "value": "" },
        { "id": "roll", "command": "mouseOver", "target": "css=button.primary", "value": "" }
      ]
    }
  ]
}
`;

/** the ui vision happy fixture — the open, click, type and verifytext commands of the releases page with their derived stable step ids — the exact text of the former uivision-macro.json. */
export const uivisionmacro = `{
  "Name": "example releases read",
  "CreationDate": "2024-05-01",
  "Commands": [
    { "Command": "open", "Target": "https://example.org/releases", "Value": "" },
    { "Command": "click", "Target": "css=nav a.releases", "Value": "" },
    { "Command": "type", "Target": "css=input[name=filter]", "Value": "release notes" },
    { "Command": "verifyText", "Target": "css=main h1", "Value": "Releases" }
  ]
}
`;

/** the ui vision refusal twin — the xclick-2 command the conversion table refuses with the command named — the exact text of the former uivision-unknown.json. */
export const uivisionunknown = `{
  "Name": "example desktop macro",
  "Commands": [
    { "Command": "open", "Target": "https://example.org/releases", "Value": "" },
    { "Command": "XClick", "Target": "desktop.png", "Value": "" }
  ]
}
`;

/** the tabular happy fixture — the goal and origin preface markers with the four rows (observe, readtext, countelements, type) of the releases survey, quoted csv cells included — the exact text of the former tabular-plan.csv. */
export const tabularplan = `# goal: Survey the releases page of the example project
# origin: https://example.org
step,target,value
observe,,
readtext,main,
countelements,main section,
type,input[name=filter],"release notes, digest"
`;

/** the tabular refusal twin — the dragdrop row outside the reviewed catalog, refused with the row number named — the exact text of the former tabular-unknown.csv. */
export const tabularunknown = `# goal: Survey the releases page of the example project
# origin: https://example.org
step,target,value
observe,,
dragdrop,li.release,li.target
`;

/** Every importer sample keyed by its original file name, so the fixtures answer by name wherever a lane walks the set. */
export const importersamples = {
  "v1-plan.json": v1plan,
  "v1-unknown.json": v1unknown,
  "automa-workflow.json": automaworkflow,
  "automa-unknown.json": automaunknown,
  "selenium-side.json": seleniumside,
  "selenium-unknown.json": seleniumunknown,
  "uivision-macro.json": uivisionmacro,
  "uivision-unknown.json": uivisionunknown,
  "tabular-plan.csv": tabularplan,
  "tabular-unknown.csv": tabularunknown,
} as const;
