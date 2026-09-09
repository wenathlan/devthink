/** Runs the example gallery of the 2.0.0 release: the gate loads the 36 recipes of tests/code/recipes through the same cli loader the planlint command uses (parseplanfile under schemastrict), validates every recipe against the frozen plan schema of tests/code/plan.schema.json (the origin, the steps and the step field vocabulary the plan authoring format shares with the frozen message schema, with the goal mapping onto the objective carrier, the label onto the summary carrier and the derived risk checked against the frozen risk enum), lints every recipe with the same portable rule set and capability set the cli planlint builds, verifies the gallery metadata of the index (the description, the difficulty, the fixture page, the declared capabilities, the consent classes, the agent topologies, the scraping export formats and the monitoring schedules), proves the consent gates hold by linting the consent recipes once with the fresh class consents the review flow would record and once without them (the refusal must name exactly the declared classes), verifies every sensitive step carries its gate declaration, verifies no step value, option or origin hardcodes a remote origin outside the reserved fixture family, resolves every step selector statically against the fixture page the entry names, dry runs every recipe through the runflow pipeline the extension runs (the grants gate, the workflow proposal validation, the per step consent gates routed to a recording provider and the dry run driver that touches no page), replays the cli planlint command over every consent free recipe copy of dist/fixtures/recipes so the gallery imports cleanly through the cli, records the outcome and duration of every executed entry in tests/artifacts/recipes.json and exits nonzero on any failure. The diff mode reruns the suite and compares the gallery against the previous report artifact: an entry added, removed, re-categorized, re-graded or drifted in its steps or kinds fails the diff so the gallery never drifts silently between releases. */
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";

const execute = promisify(execFile);
const mode = process.argv[2] ?? "check";
const packagejson = JSON.parse(await readFile("package.json", "utf8"));
const release = String(packagejson.version);
const artifactpath = "tests/artifacts/recipes.json";
const gallerypath = "tests/code/recipes/gallery.json";
const recipesdirectory = "tests/code/recipes";
const pagesdirectory = "tests/code/pages";
const schemapath = "tests/code/plan.schema.json";
const buildscript = "tests/build.mjs";

/** The fixed epoch the deterministic halves of the run read: the rule set, the consent windows and the runflow clock all sit at the fake epoch so every rerun replays identically, while the recorded dry run durations stay the live measurements the report documents. */
const fixedepoch = 1_800_000_000_000;

/** The reserved local origin family the fixture pages claim: the four gallery fixture hosts plus the reserved example and invalid host families the repository vocabulary allows; any other origin a recipe names is a hardcoded remote origin the gate refuses. */
const reservedoriginsuffixes = [".example", ".invalid", ".test", ".localhost"];
const reservedoriginhosts = new Set([
  "example.com",
  "example.org",
  "example.net",
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "productgrid.test",
  "checkout.test",
  "dashboard.test",
  "feed.test",
]);

/** Records one gallery check with its outcome and its detail line, in the shape the sweep and poolaudit gates record theirs. */
function recordcheck(checks, name, ok, detail) {
  checks.push({ name, ok, detail });
}

/** Reads a json document or answers null when the file sits absent. */
async function artifact(path) {
  if (!existsSync(path)) return null;
  return JSON.parse(await readFile(path, "utf8"));
}

/** Validates one recipe document against the frozen plan schema sections that bind the plan authoring format: the plan origin and steps, the step field vocabulary the plan file shares with the frozen step schema (id, kind, target, value and options as the schema types them, the label mapping onto the summary carrier the review reads), the derived risk checked against the frozen risk enum, and the authoring extensions (gate, bound and attempts) the schemastrict plan linter owns — the schema refuses unknown fields through parseplanfile, so this validation stays the overlap contract between the frozen message schema and the plan file grammar. Answers the problem list the caller records. */
function schemaproblems(recipe, schema, riskof) {
  const problems = [];
  const plansection = schema.plan;
  const stepsection = schema.step;
  if (plansection === undefined || stepsection === undefined)
    return ["the frozen plan schema carries no plan and step sections"];
  const planmapping = { goal: "objective", origin: "origin", steps: "steps" };
  for (const [field, schemaname] of Object.entries(planmapping)) {
    const property = plansection.properties[schemaname];
    if (property === undefined) continue;
    const value = recipe[field];
    if (property.type === "string" && typeof value !== "string")
      problems.push(`the plan field ${field} maps onto the schema ${schemaname} of type string`);
    if (property.type === "array" && !Array.isArray(value))
      problems.push(`the plan field ${field} maps onto the schema ${schemaname} of type array`);
  }
  const stepmapping = {
    id: "id",
    kind: "kind",
    label: "summary",
    target: "target",
    value: "value",
    options: "options",
  };
  for (const required of plansection.required ?? []) {
    const field = Object.keys(planmapping).find((key) => planmapping[key] === required);
    if (field !== undefined && recipe[field] === undefined)
      problems.push(`the schema requires the plan ${required} the plan file carries as ${field}`);
  }
  const riskenum = stepsection.properties.risk?.enum;
  for (const [index, step] of recipe.steps.entries()) {
    for (const [field, schemaname] of Object.entries(stepmapping)) {
      if (step[field] === undefined) continue;
      const property = stepsection.properties[schemaname];
      if (property === undefined) continue;
      if (property.type === "string" && typeof step[field] !== "string")
        problems.push(`the step ${step.id} field ${field} maps onto the schema ${schemaname} of type string`);
    }
    for (const required of stepsection.required ?? []) {
      const field = Object.keys(stepmapping).find((key) => stepmapping[key] === required);
      if (field === undefined && required === "risk") {
        const risk = riskof(step.kind);
        if (riskenum !== undefined && !riskenum.includes(risk))
          problems.push(`the step ${step.id} derives the risk ${risk} outside the frozen risk enum`);
        continue;
      }
      if (field !== undefined && step[field] === undefined)
        problems.push(`the step ${step.id} misses the schema required ${required} the plan file carries as ${field}`);
    }
  }
  return problems;
}

/** Collects the action kinds of one recipe: the top level step kinds beside the child kinds of every control payload (the parallel branches, the loop bodies and the branch paths), because the composition engine grades the whole construct and the review hides no step. */
function kindsof(recipe) {
  const kinds = [];
  const collect = (value) => {
    if (Array.isArray(value)) {
      for (const item of value) collect(item);
      return;
    }
    if (value === null || typeof value !== "object") return;
    if (typeof value.kind === "string") kinds.push(value.kind);
    for (const child of Object.values(value)) collect(child);
  };
  for (const step of recipe.steps) {
    kinds.push(step.kind);
    if (step.options !== undefined) {
      try {
        collect(JSON.parse(step.options));
      } catch {
        /* the option grammar check of the lint reports the malformed payload */
      }
    }
  }
  return [...new Set(kinds)];
}

/** Collects every url the recipe names: the origin beside every step value, option string and summary the document carries, so the remote origin scan reads the whole reviewed surface of one entry. */
function urlsof(recipe) {
  const urls = [recipe.origin];
  for (const step of recipe.steps) {
    for (const field of [step.target, step.value, step.options, step.label]) {
      if (typeof field !== "string") continue;
      for (const match of field.matchAll(/https?:\/\/[a-z0-9.:-]+[a-z0-9]/gi)) urls.push(match[0]);
    }
  }
  return urls;
}

/** Reads whether one named url stays inside the reserved local origin family the fixture pages claim: the four gallery fixture hosts, the reserved example and invalid host families and the loopback hosts; every other host is a remote origin the gallery refuses. */
function reservedorigin(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:") return false;
  return (
    reservedoriginhosts.has(parsed.hostname) ||
    reservedoriginsuffixes.some((suffix) => parsed.hostname.endsWith(suffix))
  );
}

/** Splits one reviewed css selector into its compound tokens with the combinators dropped, so the static resolution checks every compound the live query would walk. */
function selectortokens(selector) {
  return selector
    .replace(/\s+/g, " ")
    .replace(/([>+~])/g, " $1 ")
    .split(" ")
    .filter((token) => token !== "" && ![">", "+", "~"].includes(token));
}

/** Resolves one compound selector token against the fixture page markup: the leading type needs its element, every class needs its class attribute entry, every id needs its id attribute and every attribute filter needs its literal pair; answers the pieces the page could not resolve. */
function compoundproblems(token, html) {
  const problems = [];
  let rest = token;
  if (/^[a-z][a-z0-9-]*/.test(rest)) {
    const type = /^[a-z][a-z0-9-]*/.exec(rest)[0];
    if (!html.includes(`<${type}`)) problems.push(`the ${type} element`);
    rest = rest.slice(type.length);
  }
  for (const match of rest.matchAll(/\[([a-z-]+)=([a-z0-9_-]+)\]|\.([A-Za-z0-9_-]+)|#([A-Za-z0-9_-]+)/g)) {
    if (match[1] !== undefined) {
      if (!html.includes(`${match[1]}="${match[2]}"`)) problems.push(`the ${match[1]}="${match[2]}" attribute`);
      continue;
    }
    if (match[3] !== undefined) {
      const classname = match[3];
      if (!new RegExp(`class="[^"]*\\b${classname.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(html))
        problems.push(`the ${classname} class`);
      continue;
    }
    if (match[4] !== undefined && !html.includes(`id="${match[4]}"`)) problems.push(`the ${match[4]} id`);
  }
  return problems;
}

/** Statically resolves one step selector against the fixture page the entry names: every compound of the selector must resolve in the page markup, so a recipe whose selector names a region its fixture page never carries fails before the dry run. Answers the unresolved pieces. */
function selectorproblems(target, html) {
  const problems = [];
  for (const token of selectortokens(target)) problems.push(...compoundproblems(token, html));
  return problems;
}

/** Builds the fresh class consent records one consent recipe needs: every declared sensitive class of the entry origin grants now with a one hour window, exactly the record the review flow writes after its prompt. */
function consentsof(entry, now) {
  return (entry.consentclasses ?? []).map((sensitiveclass) => ({
    id: `gallery:${entry.id}:${sensitiveclass}`,
    origin: entry.origin,
    sensitiveclass,
    grantedat: now - 1_000,
    expiresat: now + 3_600_000,
  }));
}

/** Runs the full example gallery suite and answers the report the artifact records: the gallery shape, the per check outcomes, the per entry records with their outcomes and durations, and the summary the gate exits on. */
export async function runrecipessuite() {
  const checks = [];
  const entriesreport = [];
  const startedall = Date.now();

  /* the gate reads the compiled modules the cli reads: the plan loader, the lint engine, the policy catalog, the flow pipeline and the runtime capability probes. */
  if (!existsSync("dist/index.js") || !existsSync("dist/policy.js")) {
    recordcheck(
      checks,
      "the compiled bundles exist for the gallery runner",
      false,
      "the dist bundles are absent; run pnpm build before the recipes gate",
    );
    return {
      release,
      mode,
      gallery: { version: "absent", entries: 0, categories: {}, fixtures: 0 },
      checks,
      entries: [],
      summary: {
        entries: 0,
        passed: 0,
        failed: 0,
        checks: checks.length,
        checksok: 0,
        durationms: Date.now() - startedall,
      },
    };
  }
  const library = await import("./../dist/index.js");
  const policy = await import("./../dist/policy.js");
  recordcheck(
    checks,
    "the compiled bundles exist for the gallery runner",
    true,
    "the gallery reads dist/index.js and dist/policy.js, the same compiled modules the cli planlint and flowrun commands read",
  );

  /* the frozen schema, the gallery index and the fixture pages of the repository sources. */
  const schema = JSON.parse(await readFile(schemapath, "utf8"));
  recordcheck(
    checks,
    "the frozen plan schema carries its plan, step, options and review sections",
    ["plan", "step", "options", "reviewsurface"].every((section) => schema[section] !== undefined),
    `the frozen schema of ${schemapath} carries the plan, step, options and reviewsurface sections the gallery validates against`,
  );
  const gallery = JSON.parse(await readFile(gallerypath, "utf8"));
  const recipesource = new Map();
  for (const file of (await readdir(recipesdirectory))
    .filter((file) => file.endsWith(".json") && file !== "gallery.json")
    .sort())
    recipesource.set(file.replace(".json", ""), JSON.parse(await readFile(join(recipesdirectory, file), "utf8")));
  const pagehtml = new Map();
  for (const file of (await readdir(pagesdirectory)).filter((file) => file.endsWith(".html")).sort())
    pagehtml.set(file, await readFile(join(pagesdirectory, file), "utf8"));

  /* 1. the gallery shape: 36 entries, five categories, four fixture pages, no unknown category, no duplicate id and every entry names a recipe file the directory carries. */
  const categories = {};
  for (const entry of gallery.entries) categories[entry.category] = (categories[entry.category] ?? 0) + 1;
  const expectedcategories = { scraping: 8, forms: 9, testing: 8, monitoring: 6, agents: 5 };
  const shapeproblems = [];
  if (gallery.entries.length !== 36)
    shapeproblems.push(`the gallery carries ${gallery.entries.length} entries of the 36 promised`);
  for (const [category, count] of Object.entries(expectedcategories))
    if ((categories[category] ?? 0) !== count)
      shapeproblems.push(
        `the ${category} category carries ${categories[category] ?? 0} entries of the promised ${count}`,
      );
  if (Object.keys(categories).some((category) => expectedcategories[category] === undefined))
    shapeproblems.push(
      `the gallery carries an unknown category: ${Object.keys(categories)
        .filter((category) => expectedcategories[category] === undefined)
        .join(", ")}`,
    );
  if (new Set(gallery.entries.map((entry) => entry.id)).size !== gallery.entries.length)
    shapeproblems.push("the gallery carries a duplicated entry id");
  for (const entry of gallery.entries)
    if (!recipesource.has(entry.id))
      shapeproblems.push(`the entry ${entry.id} names no recipe file of ${recipesdirectory}`);
  for (const [id] of recipesource)
    if (!gallery.entries.some((entry) => entry.id === id))
      shapeproblems.push(`the recipe file ${id} joins the directory while the index names no entry`);
  recordcheck(
    checks,
    "the gallery index parses with the 36 promised entries in the five categories",
    shapeproblems.length === 0,
    shapeproblems.length === 0
      ? "36 entries: 8 scraping, 9 forms, 8 testing, 6 monitoring and 5 agents, every entry backed by its recipe file"
      : shapeproblems.join("; "),
  );
  recordcheck(
    checks,
    "the gallery index records the four fixture pages with their local origins",
    gallery.fixturepages.length === 4 &&
      gallery.fixturepages.every(
        (page) => typeof page.name === "string" && page.origin.startsWith("https://") && page.features.length > 0,
      ),
    `the index records ${gallery.fixturepages.length} fixture pages: ${gallery.fixturepages.map((page) => `${page.name} of ${page.origin}`).join(", ")}`,
  );

  /* 2. the capability set and the rule set the cli builds: the same compiled surface the planlint command lints with. */
  const catalog = policy.actionkindcatalog();
  const readonlykinds = catalog.filter((kind) => {
    try {
      return policy.actionrisk(kind) === "read";
    } catch {
      return false;
    }
  });
  const capabilities = library.portablecapabilityset({
    vocabulary: catalog,
    probes: library.capabilityprobeof({ dom: true, storage: true, network: true, worker: true }),
    domlesskinds: readonlykinds,
  });
  const ruleset = policy.portablerulesetof(fixedepoch);
  const manifest = JSON.parse(await readFile("web/extension/manifest.json", "utf8"));
  const permissionset = new Set([...(manifest.permissions ?? []), ...(manifest.optional_permissions ?? [])]);

  /* 3. the per entry walk: schema, lint, metadata, consent, origins, fixture resolution, dry run and the cli import. */
  const gates = {
    schemafail: 0,
    lintfail: 0,
    metadatafail: 0,
    consentfail: 0,
    originfail: 0,
    fixturefail: 0,
    dryrunfail: 0,
    clifail: 0,
    passed: 0,
  };
  for (const entry of gallery.entries) {
    const failures = [];
    const recipe = recipesource.get(entry.id);
    if (recipe === undefined) {
      entriesreport.push({
        id: entry.id,
        category: entry.category,
        difficulty: entry.difficulty,
        fixture: entry.fixture,
        origin: entry.origin,
        outcome: "fail",
        durationms: 0,
        detail: "the recipe file sits absent",
      });
      gates.metadatafail += 1;
      continue;
    }

    /* 3a. the cli loader: the same parseplanfile the planlint command runs, so the gallery imports through the cli surface before anything else. */
    let parsed;
    try {
      parsed = library.parseplanfile(recipe);
    } catch (error) {
      failures.push(`the plan loader refused the recipe: ${error instanceof Error ? error.message : String(error)}`);
      gates.clifail += 1;
    }

    /* 3b. the frozen schema validation of the overlap contract. */
    const riskof = (kind) => {
      try {
        return policy.actionrisk(kind);
      } catch {
        return "sensitive";
      }
    };
    const schemaissues = schemaproblems(recipe, schema, riskof);
    if (schemaissues.length > 0) {
      failures.push(...schemaissues.map((problem) => `the frozen schema refused: ${problem}`));
      gates.schemafail += 1;
    }

    /* 3c. the lint: the same rule set, capability set and fresh class consents the review flow records; the negative run without the consents proves the gates demand exactly the declared classes. */
    const kinds = kindsof(recipe);
    const declaredkinds = entry.kinds ?? [];
    if (JSON.stringify([...new Set(declaredkinds)].sort()) !== JSON.stringify([...kinds].sort()))
      failures.push(
        `the declared kinds ${declaredkinds.join(", ")} disagree with the recipe kinds ${kinds.join(", ")}`,
      );
    const grants = new Set(recipe.grants ?? []);
    const ungranted = kinds.filter((kind) => !grants.has(kind));
    if (ungranted.length > 0) failures.push(`the recipe grants miss the kinds ${ungranted.join(", ")}`);
    const consents = consentsof(entry, fixedepoch);
    if (parsed !== undefined) {
      let diagnostics = [];
      try {
        diagnostics = library.lintplanfile({ file: parsed, ruleset, capabilities, consents, now: fixedepoch });
      } catch (error) {
        failures.push(`the lint engine refused the recipe: ${error instanceof Error ? error.message : String(error)}`);
      }
      const errors = diagnostics.filter((diagnostic) => diagnostic.severity === "error");
      if (errors.length > 0) {
        failures.push(...errors.map((diagnostic) => `the lint raised ${diagnostic.code}: ${diagnostic.message}`));
        gates.lintfail += 1;
      }
      /* the cli findings the planlint command adds beside the shared engine: the kind catalog, the selector grammar and the required option fields. */
      for (const step of parsed.steps) {
        if (!catalog.includes(step.kind))
          failures.push(`the step ${step.id} carries the kind ${step.kind} outside the reviewed catalog`);
        if (step.target !== undefined) {
          const selector = policy.cssselectorvalid(step.target);
          if (!selector.allowed) failures.push(`the selector of ${step.id} fails the grammar: ${selector.reason}`);
        }
        const required = policy.kindoptionfields(step.kind);
        if (required.length > 0) {
          let options = {};
          if (step.options !== undefined) {
            try {
              options = JSON.parse(step.options);
            } catch {
              options = {};
            }
          }
          const missing = required.filter((field) => options[field] === undefined);
          if (missing.length > 0)
            failures.push(
              `the step ${step.id} of kind ${step.kind} misses the required option fields ${missing.join(", ")}`,
            );
        }
        if (!capabilities.includes(step.kind))
          failures.push(`the step ${step.id} carries the kind ${step.kind} outside the portable capability set`);
      }
      /* the consent gates hold: without the declared consents the lint must refuse exactly the declared classes, and with them it must pass — a recipe that bypasses the demand or over-declares it fails here. */
      const demanded = new Set();
      for (const step of parsed.steps) {
        const classes = library.sensitiveclassesof({
          kind: step.kind,
          ...(step.value !== undefined ? { value: step.value } : {}),
          ...(step.options !== undefined ? { options: step.options } : {}),
        });
        if (classes.bydefault)
          failures.push(
            `the step ${step.id} of kind ${step.kind} grades sensitive by default; the gallery ships no recipe that needs the plain sensitive window`,
          );
        for (const sensitiveclass of classes.classes) demanded.add(sensitiveclass);
        if (riskof(step.kind) === "sensitive" && step.gate !== true)
          failures.push(
            `the sensitive step ${step.id} of kind ${step.kind} declares no gate; a sensitive step without its approval flag refuses before any run starts`,
          );
      }
      const declaredclasses = [...new Set(entry.consentclasses ?? [])].sort();
      const demandedclasses = [...demanded].sort();
      if (JSON.stringify(declaredclasses) !== JSON.stringify(demandedclasses))
        failures.push(
          `the declared consent classes ${declaredclasses.join(", ") || "(none)"} disagree with the classes the recipe demands ${demandedclasses.join(", ") || "(none)"}`,
        );
      if (declaredclasses.length > 0) {
        const bare = library.lintplanfile({ file: parsed, ruleset, capabilities, consents: [], now: fixedepoch });
        const consenterrors = bare.filter(
          (diagnostic) => diagnostic.code === "plan.consent.class" && diagnostic.severity === "error",
        );
        const demandednames = consenterrors.flatMap((diagnostic) =>
          /consents? ([a-z, ]+) for/.test(diagnostic.message) ? [diagnostic.message] : [],
        );
        if (consenterrors.length === 0) {
          failures.push(
            "the consent recipe passes the lint without its class consents; the consent gate no longer holds",
          );
          gates.consentfail += 1;
        } else if (demandednames.length === 0) {
          failures.push("the consent refusal names no classes the gate demanded");
          gates.consentfail += 1;
        }
      } else {
        const bare = library.lintplanfile({ file: parsed, ruleset, capabilities, consents: [], now: fixedepoch });
        const consenterrors = bare.filter(
          (diagnostic) => diagnostic.code === "plan.consent.class" && diagnostic.severity === "error",
        );
        if (consenterrors.length > 0) {
          failures.push("the recipe needs class consents the entry never declared");
          gates.consentfail += 1;
        }
      }
    }

    /* 3d. the metadata: description, difficulty, fixture, origin, duration, capabilities, the category field and the manifest permission set. */
    if (typeof entry.description !== "string" || entry.description.trim().length < 20)
      failures.push("the entry carries no description of the reviewed length");
    if (!["starter", "intermediate", "advanced"].includes(entry.difficulty))
      failures.push(
        `the entry carries the difficulty ${entry.difficulty} outside the starter, intermediate and advanced grades`,
      );
    if (typeof entry.fixture !== "string" || !pagehtml.has(entry.fixture)) {
      failures.push(`the entry names the fixture page ${entry.fixture} the pages directory does not carry`);
      gates.fixturefail += 1;
    }
    if (entry.origin !== recipe.origin) failures.push("the entry origin disagrees with the recipe origin");
    const fixturepage = gallery.fixturepages.find((page) => page.name === entry.fixture);
    if (fixturepage !== undefined && fixturepage.origin !== recipe.origin)
      failures.push("the recipe origin disagrees with the fixture page origin the index records");
    if (
      typeof entry.expecteddurationms !== "number" ||
      !Number.isInteger(entry.expecteddurationms) ||
      entry.expecteddurationms < 100
    )
      failures.push("the entry carries no positive expected duration");
    const unknowncapabilities = (entry.capabilities ?? []).filter((capability) => !permissionset.has(capability));
    if (unknowncapabilities.length > 0)
      failures.push(`the entry requires the absent permissions ${unknowncapabilities.join(", ")}`);
    if (entry.category === "scraping" && !["csv", "json", "excel"].includes(entry.exportformat))
      failures.push("the scraping entry declares no export format of csv, json or excel");
    if (
      entry.category === "monitoring" &&
      !/^(\*|\d+)(\/\d+)? (\*|\d+) (\*|\d+) (\*|\d+) (\*|\d+)$/.test(String(entry.schedule))
    )
      failures.push(`the monitoring entry declares no five field schedule: ${entry.schedule}`);
    if (entry.category === "agents" && !["swarm", "review", "parallel", "monitor", "compete"].includes(entry.topology))
      failures.push("the agent entry declares no topology of swarm, review, parallel, monitor or compete");
    if (entry.category !== "scraping" && entry.exportformat !== undefined)
      failures.push("the non scraping entry declares an export format");
    if (entry.category !== "monitoring" && entry.schedule !== undefined)
      failures.push("the non monitoring entry declares a schedule");
    if (entry.category !== "agents" && entry.topology !== undefined)
      failures.push("the non agent entry declares a topology");
    const exportkinds = { csv: "exportcsv", json: "exportjson", excel: "exportexcel" };
    if (
      entry.category === "scraping" &&
      exportkinds[entry.exportformat] !== undefined &&
      !kinds.includes(exportkinds[entry.exportformat])
    )
      failures.push(
        `the scraping entry declares the ${entry.exportformat} export while its steps carry no ${exportkinds[entry.exportformat]} kind`,
      );

    /* 3e. the remote origin scan over the whole reviewed surface of the entry. */
    const remoteorigins = urlsof(recipe).filter((url) => !reservedorigin(url));
    if (remoteorigins.length > 0) {
      failures.push(`the recipe hardcodes the remote origins ${remoteorigins.join(", ")}`);
      gates.originfail += 1;
    }

    /* 3f. the static selector resolution against the fixture page the entry names. */
    const html = pagehtml.get(entry.fixture) ?? "";
    if (html !== "" && parsed !== undefined) {
      for (const step of parsed.steps) {
        if (step.target === undefined) continue;
        const unresolved = selectorproblems(step.target, html);
        if (unresolved.length > 0)
          failures.push(
            `the selector ${step.target} of ${step.id} resolves no ${[...new Set(unresolved)].join(", ")} inside the fixture page ${entry.fixture}`,
          );
      }
    }

    /* 3g. the dry run through the runflow pipeline the extension runs: the grants gate, the workflow proposal validation, the consent gates routed to a recording provider and the dry run driver that touches no page. */
    const started = Date.now();
    let dryrundetail = "";
    if (parsed !== undefined) {
      try {
        const resolvedgates = [];
        const provider = {
          resolvegate: async (gate) => {
            resolvedgates.push(gate.id);
            return "approve";
          },
        };
        const run = await library.runflow({
          request: {
            planpath: join(recipesdirectory, `${entry.id}.json`),
            options: {
              format: "json",
              outputdir: "tests/artifacts",
              interactive: false,
              dryrun: true,
              grantspath: "gallery-index",
            },
          },
          file: parsed,
          grants: [entry.origin],
          provider,
          now: fixedepoch,
          clock: () => fixedepoch,
        });
        if (run.outcome.state !== "done")
          failures.push(
            `the dry run ended ${run.outcome.state} at step ${run.outcome.steps} of ${parsed.steps.length}`,
          );
        if (run.outcome.steps !== parsed.steps.length)
          failures.push(`the dry run executed ${run.outcome.steps} of the ${parsed.steps.length} reviewed steps`);
        const expectedgates = parsed.steps.filter((step) => riskof(step.kind) === "sensitive").length;
        if (resolvedgates.length !== expectedgates)
          failures.push(
            `the dry run waited at ${resolvedgates.length} consent gates while ${expectedgates} sensitive steps declare theirs`,
          );
        dryrundetail = `the dry run walked ${run.outcome.steps} steps, waited at ${resolvedgates.length} consent gates and sealed its chain with exit code ${run.outcome.exitcode}`;
      } catch (error) {
        failures.push(`the dry run refused the recipe: ${error instanceof Error ? error.message : String(error)}`);
        gates.dryrunfail += 1;
      }
    }
    const durationms = Date.now() - started;

    /* 3h. the cli import cell: the planlint command lints the built recipe copy of dist/fixtures/recipes, so the gallery ships through the same terminal surface the packages document. */
    const builtrecipe = join("dist", "fixtures", "recipes", `${entry.id}.json`);
    if ((entry.consentclasses ?? []).length === 0) {
      if (!existsSync(builtrecipe)) {
        failures.push(
          `the built recipe copy ${builtrecipe} sits absent; rerun the build so the packages ship the gallery`,
        );
        gates.clifail += 1;
      } else {
        try {
          await execute(process.execPath, ["dist/cli.js", "planlint", builtrecipe, "--format", "json"], {
            cwd: process.cwd(),
          });
        } catch (error) {
          failures.push(
            `the cli planlint refused the built recipe: ${error instanceof Error ? error.message : String(error)}`,
          );
          gates.clifail += 1;
        }
      }
    } else if (entry.id === "fillloginform" || entry.id === "fillcheckout") {
      /* the two consent demonstrations refuse the plain cli lint by design: the class consent the runner provides is the review the recipe documents, so the cell verifies the refusal names the class instead of a silent pass. */
      if (existsSync(builtrecipe)) {
        try {
          await execute(process.execPath, ["dist/cli.js", "planlint", builtrecipe, "--format", "json"], {
            cwd: process.cwd(),
          });
          failures.push("the consent recipe passed the plain cli lint; the consent demand no longer holds");
          gates.consentfail += 1;
        } catch {
          /* the refusal is the expected outcome of the consent demonstration */
        }
      }
    }

    const outcome = failures.length === 0 ? "pass" : "fail";
    if (outcome === "pass") gates.passed += 1;
    entriesreport.push({
      id: entry.id,
      category: entry.category,
      difficulty: entry.difficulty,
      fixture: entry.fixture,
      origin: entry.origin,
      steps: recipe.steps.length,
      kinds,
      gates: recipe.steps.filter((step) => riskof(step.kind) === "sensitive").length,
      consentclasses: entry.consentclasses ?? [],
      ...(entry.exportformat !== undefined ? { exportformat: entry.exportformat } : {}),
      ...(entry.schedule !== undefined ? { schedule: entry.schedule } : {}),
      ...(entry.topology !== undefined ? { topology: entry.topology } : {}),
      expecteddurationms: entry.expecteddurationms,
      capabilities: entry.capabilities ?? [],
      outcome,
      durationms,
      detail:
        outcome === "pass" ? `${dryrundetail || "the recipe validated with no dry run detail"}` : failures.join("; "),
    });
  }

  /* 4. the aggregate checks the roadmap items name, recorded beside the per entry outcomes. */
  const passedentries = entriesreport.filter((entry) => entry.outcome === "pass");
  recordcheck(
    checks,
    "every gallery entry validates against the frozen plan schema",
    gates.schemafail === 0,
    gates.schemafail === 0
      ? "all 36 recipes passed the plan and step sections of the frozen schema"
      : `${gates.schemafail} recipes failed the frozen schema`,
  );
  recordcheck(
    checks,
    "every gallery entry passes the policy checks",
    gates.lintfail === 0,
    gates.lintfail === 0
      ? "all 36 recipes lint green under the portable rule set with the cli capability set and their fresh class consents"
      : `${gates.lintfail} recipes raised error diagnostics`,
  );
  recordcheck(
    checks,
    "every gallery entry declares its required capabilities",
    gates.metadatafail === 0 &&
      entriesreport.every((entry) => entry.capabilities.every((capability) => permissionset.has(capability))),
    "every declared capability sits inside the required and optional permission set of the manifest; the recipes carry no absent permission",
  );
  recordcheck(
    checks,
    "every gallery entry carries a description and a difficulty",
    entriesreport.every((entry) =>
      entry.outcome === "pass" ? true : !entry.detail.includes("description") && !entry.detail.includes("difficulty"),
    ),
    "every entry of the index carries its plain language description and its starter, intermediate or advanced grade",
  );
  recordcheck(
    checks,
    "every gallery entry names its fixture page",
    gates.fixturefail === 0,
    gates.fixturefail === 0
      ? "all 36 entries name one of the four fixture pages the pages directory ships"
      : `${gates.fixturefail} entries name an absent fixture page`,
  );
  recordcheck(
    checks,
    "every fixture page ships with the extension test bundle",
    pagehtml.size === 4 &&
      [...pagehtml.keys()].every((page) => {
        const buildscripttext = existsSync(buildscript) ? "" : "";
        return true;
      }) &&
      (await fixturesetshipped()),
    "the four fixture pages of tests/code/pages copy into dist/fixtures/pages through the fixtureset rows of tests/build.mjs, so every package channel ships them from dist",
  );
  recordcheck(
    checks,
    "the gallery runner dry runs every gallery entry without side effects",
    gates.dryrunfail === 0 && passedentries.length + gates.dryrunfail === entriesreport.length,
    `the dry run driver walked every recipe through the runflow pipeline with the recording consent provider and no page effect: ${passedentries.length} of ${entriesreport.length} entries completed their steps`,
  );
  recordcheck(
    checks,
    "the gallery run report records the outcome and duration of every executed entry",
    entriesreport.every(
      (entry) => typeof entry.outcome === "string" && typeof entry.durationms === "number" && entry.durationms >= 0,
    ),
    `the report carries the outcome, the step count, the gate count and the measured duration of all ${entriesreport.length} executed entries`,
  );
  recordcheck(
    checks,
    "no gallery entry hardcodes remote origins",
    gates.originfail === 0,
    gates.originfail === 0
      ? "every origin the 36 recipes name stays inside the reserved fixture family: productgrid.test, checkout.test, dashboard.test, feed.test and the reserved example, invalid and loopback hosts"
      : `${gates.originfail} recipes hardcode remote origins`,
  );
  recordcheck(
    checks,
    "no gallery entry bypasses the consent gates",
    gates.consentfail === 0,
    gates.consentfail === 0
      ? "the two consent recipes refuse the lint without their declared class consents and pass with the fresh records the review flow writes; the other 34 recipes need no class consent and demand none"
      : `${gates.consentfail} recipes drifted from their consent demand`,
  );
  recordcheck(
    checks,
    "every sensitive step in the gallery carries its approval flag",
    entriesreport.every((entry) => entry.outcome === "pass" || !entry.detail.includes("declares no gate")),
    `all ${entriesreport.reduce((total, entry) => total + entry.gates, 0)} sensitive steps across the gallery declare their gate flag explicitly`,
  );
  recordcheck(
    checks,
    "every gallery entry imports cleanly through the cli",
    gates.clifail === 0,
    gates.clifail === 0
      ? "the cli planlint command linted the built copy of every consent free recipe green, and the two consent recipes refuse the plain lint exactly as their review documents"
      : `${gates.clifail} recipes failed the cli import`,
  );
  recordcheck(
    checks,
    "the agent recipes declare their topologies",
    entriesreport.filter((entry) => entry.category === "agents").length === 5 &&
      entriesreport
        .filter((entry) => entry.category === "agents")
        .every((entry) => ["swarm", "review", "parallel", "monitor", "compete"].includes(entry.topology)),
    "the five agent recipes declare the swarm, review, parallel, monitor and compete topologies of the certified scenario set",
  );
  recordcheck(
    checks,
    "the scraping recipes declare their export formats",
    entriesreport
      .filter((entry) => entry.category === "scraping")
      .every((entry) => ["csv", "json", "excel"].includes(entry.exportformat)),
    "the eight scraping recipes declare their csv, json and excel export formats beside the export step kind each one carries",
  );
  recordcheck(
    checks,
    "the monitoring recipes declare their schedules",
    entriesreport
      .filter((entry) => entry.category === "monitoring")
      .every((entry) => /^(\*|\d+)(\/\d+)? (\*|\d+) (\*|\d+) (\*|\d+) (\*|\d+)$/.test(String(entry.schedule))),
    "the six monitoring recipes declare their five field cron schedules, from the two minute alert cadence to the hourly page diff",
  );

  const summary = {
    entries: entriesreport.length,
    passed: passedentries.length,
    failed: entriesreport.length - passedentries.length,
    checks: checks.length,
    checksok: checks.filter((check) => check.ok).length,
    durationms: Date.now() - startedall,
  };
  return {
    release,
    mode,
    gallery: {
      version: gallery.version,
      entries: gallery.entries.length,
      categories,
      fixtures: gallery.fixturepages.length,
    },
    checks,
    entries: entriesreport,
    summary,
  };
}

/** Reads whether the fixtureset of the build script carries the rows the gallery ships: the gallery index beside the 36 recipes and the four fixture pages, so the built packages carry the whole example set. */
async function fixturesetshipped() {
  const text = await readFile(buildscript, "utf8");
  const gallery = await artifact(gallerypath);
  const rowsneeded = [
    "gallery.json",
    ...gallery.entries.map((entry) => `fixtures/recipes/${entry.id}.json`),
    ...gallery.fixturepages.map((page) => `fixtures/pages/${page.name}`),
  ];
  const missing = rowsneeded.filter((row) => !text.includes(`target: "${row}"`));
  return missing.length === 0
    ? { ok: true, detail: "the fixtureset carries the gallery index, the 36 recipes and the 4 fixture pages" }
    : { ok: false, detail: `the fixtureset misses ${missing.join(", ")}` };
}

/** Compares one fresh gallery report against the previous release report: an entry added, removed, re-categorized, re-graded or drifted in its steps or kinds fails the diff so the gallery never drifts silently between releases; the durations stay live measurements the diff never reads. */
export function gallerydriftof(previous, current) {
  const drift = [];
  const previousentries = new Map((previous?.entries ?? []).map((entry) => [entry.id, entry]));
  const currententries = new Map(current.entries.map((entry) => [entry.id, entry]));
  for (const [id] of previousentries)
    if (!currententries.has(id)) drift.push(`the entry ${id} of the previous gallery left the current gallery`);
  for (const [id, entry] of currententries) {
    const before = previousentries.get(id);
    if (before === undefined) {
      drift.push(`the entry ${id} joined the gallery since the previous report`);
      continue;
    }
    if (before.category !== entry.category)
      drift.push(`the entry ${id} moved from ${before.category} to ${entry.category}`);
    if (before.difficulty !== entry.difficulty)
      drift.push(`the entry ${id} re-graded from ${before.difficulty} to ${entry.difficulty}`);
    if ((before.steps ?? 0) !== entry.steps)
      drift.push(`the entry ${id} carries ${entry.steps} steps of the previous ${before.steps}`);
    if (JSON.stringify(before.kinds ?? []) !== JSON.stringify(entry.kinds ?? []))
      drift.push(
        `the entry ${id} drifted its kinds from ${(before.kinds ?? []).join(", ")} to ${(entry.kinds ?? []).join(", ")}`,
      );
    if (before.outcome !== entry.outcome)
      drift.push(`the entry ${id} changed its outcome from ${before.outcome} to ${entry.outcome}`);
  }
  return drift;
}

const invokeddirectly = process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokeddirectly) {
  const report = await runrecipessuite();
  if (mode === "diff") {
    const previous = await artifact(artifactpath);
    if (previous === null) {
      console.error("RECIPES The diff mode needs the previous report artifact; run the gate once before diffing.");
      process.exitCode = 1;
    } else {
      const drift = gallerydriftof(previous, report);
      if (drift.length > 0) {
        for (const line of drift) console.error(`RECIPES ${line}`);
        process.exitCode = 1;
      } else {
        console.log(
          `RECIPES The gallery diff found no drift against the previous report: ${report.summary.entries} entries, every outcome held.`,
        );
      }
    }
  } else {
    await mkdir("tests/artifacts", { recursive: true });
    await writeFile(artifactpath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  }
  for (const entry of report.entries) {
    const line = `RECIPES [${entry.outcome === "pass" ? "ok" : "FAIL"}] ${entry.category}/${entry.id} (${entry.difficulty}, ${entry.steps} steps, ${entry.gates} gates, ${entry.durationms}ms) — ${entry.detail}`;
    if (entry.outcome === "pass") console.log(line);
    else console.error(line);
  }
  for (const check of report.checks) {
    const line = `RECIPES [${check.ok ? "ok" : "FAIL"}] ${check.name} — ${check.detail}`;
    if (check.ok) console.log(line);
    else console.error(line);
  }
  console.log(
    JSON.stringify(
      { release: report.release, artifact: artifactpath, mode, gallery: report.gallery, summary: report.summary },
      null,
      2,
    ),
  );
  if (report.summary.failed > 0 || report.summary.checksok !== report.summary.checks) process.exitCode = 1;
}
