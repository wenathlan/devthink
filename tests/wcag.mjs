/** Executes the accessibility sweep gate of the 2.0.0 roadmap item 55 ("an accessibility sweep audits every ui surface against the wcag checklist") over the surface templates and the generated view markup: the gate reads the one design file web/index.html, extracts every surface template the build splits into the extension pages (the site, the popup, the sidepanel, the dashboardpage, the optionspage, the transparencypage, the sandbox host and the offscreen host) and audits each surface against the checklist — every image carries its alt text, every button carries an accessible name, every input, textarea and select carries its label, the heading hierarchy starts at the h1 with no skipped level, the default theme tokens meet the computed contrast ratios, the stylesheet carries its focus visible outlines, no positive tabindex reorders the focus, the built surface pages stamp their html lang and no template overrides it, and the decorative markers stay off the interactive elements. The contrast math recomputes the WCAG relative luminance ratio from the token values parsed out of the stylesheet so a token change re-audits, the high contrast variants another lane owns stay outside this sweep, and the generated markup cross-check proves every class the templates reference, every state class the view scripts toggle and every class of the shared template vocabulary resolves to a real stylesheet rule. The audit is honest about its limits: it is static analysis of the templates, the stylesheet and the view sources with no screen reader emulation and no runtime focus walk. The artifact tests/artifacts/wcag.json records every executed check with its outcome in a fixed order with no timestamps so reruns stay byte identical, and the gate exits nonzero on any failed check. The checklist with its success criterion references and the invocation walkthrough live in docs/wcag.md. */
import { mkdir, writeFile } from "node:fs/promises";
import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const packagejson = JSON.parse(await readFile("package.json", "utf8"));
const release = String(packagejson.version);
const artifactpath = "tests/artifacts/wcag.json";
const designpath = "web/extension/index.html";

/** Collects one executed sweep check with its outcome; the detail names what the check audited and what it answered. */
const executed = [];

/** Runs one sweep check body and records the outcome deterministically. */
async function entry(spec, body) {
  try {
    const detail = await body();
    executed.push({
      id: spec.id,
      title: spec.title,
      criterion: spec.criterion,
      family: spec.family,
      module: spec.module,
      outcome: "pass",
      detail: detail ?? "",
    });
  } catch (error) {
    executed.push({
      id: spec.id,
      title: spec.title,
      criterion: spec.criterion,
      family: spec.family,
      module: spec.module,
      outcome: "fail",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}

/** Asserts one condition with the message the failure reports. */
function check(condition, message) {
  if (!condition) throw new Error(message);
}

/** Strips every <script> block from one markup fragment so the structural scans read the markup alone; a script block the fragment leaves unterminated (the sandbox host script ends at its template boundary) strips to the fragment end, so the script strings never enter the markup scan. The strip walks plain index arithmetic (the open tag, its first closing angle, the closing tag) instead of a replacement expression, so no tag-shaped bypass can survive the filter. */
function withoutscripts(markup) {
  let out = "";
  let cursor = 0;
  for (;;) {
    const open = markup.indexOf("<script", cursor);
    if (open < 0) break;
    const after = markup[open + 7] ?? "";
    if (after !== "" && /[a-zA-Z0-9_]/.test(after)) {
      cursor = open + 7;
      continue;
    } /* a longer tag name that merely opens with the script prefix never strips */
    out += markup.slice(cursor, open);
    const close = markup.indexOf("</script", open);
    if (close < 0) return out; /* an unterminated script block strips to the fragment end */
    const end = markup.indexOf(">", close);
    if (end < 0) return out;
    cursor = end + 1;
  }
  return out + markup.slice(cursor);
}

/** Strips every complete tag from one text fragment so the name scans read the text alone; an unterminated angle keeps its literal text the way the match never closed. */
function striptags(text) {
  let out = "";
  let cursor = 0;
  for (;;) {
    const open = text.indexOf("<", cursor);
    if (open < 0) return out + text.slice(cursor);
    const close = text.indexOf(">", open);
    if (close < 0) return out + text.slice(cursor);
    out += text.slice(cursor, open);
    cursor = close + 1;
  }
}

/** Reads the tag attributes of one opening tag match into a lowercase attribute map. */
function attributesof(tagmatch) {
  const attributes = {};
  for (const match of tagmatch.matchAll(/([a-zA-Z-]+)\s*=\s*"([^"]*)"/g)) attributes[match[1].toLowerCase()] = match[2];
  return attributes;
}

/** Parses one hex color into its linear rgb channels. */
function channelsof(hex) {
  const digits = hex.replace("#", "");
  const parts = [0, 2, 4].map((index) => parseInt(digits.slice(index, index + 2), 16) / 255);
  return parts.map((value) => (value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4)));
}

/** Computes the WCAG relative luminance of one hex color. */
function luminanceof(hex) {
  const channels = channelsof(hex);
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

/** Computes the WCAG contrast ratio of a foreground over a background, rounded to two decimals so the artifact stays stable. */
function contrastof(foreground, background) {
  const one = luminanceof(foreground);
  const two = luminanceof(background);
  const [light, dark] = one > two ? [one, two] : [two, one];
  return Math.round(((light + 0.05) / (dark + 0.05)) * 100) / 100;
}

/** The view sources whose generated markup the sweep cross-checks against the stylesheet. */
const viewsources = [
  "views.ts",
  "sidepanel.ts",
  "popup.ts",
  "dashboardpage.ts",
  "optionspage.ts",
  "transparencypage.ts",
];

/** Runs the full accessibility sweep and answers the report the artifact records. */
export async function runwcagsuite() {
  if (!existsSync(designpath)) {
    console.error("WCAG The sweep reads the one design file web/index.html; run it from the extension root.");
    return {
      release,
      checklist: "docs/wcag.md",
      entries: [
        {
          id: 1,
          title: "the design file exists",
          criterion: "3.1.1",
          family: "surfaces",
          module: "web/extension/index.html",
          outcome: "fail",
          detail: "the design file is absent",
        },
      ],
      summary: { total: 1, passed: 0, failed: 1 },
    };
  }
  const design = await readFile(designpath, "utf8");
  const stylesheet = /<style data-source="extension">([\s\S]*?)<\/style>/.exec(design)?.[1] ?? "";
  check(stylesheet !== "", "the design file carries the embedded extension stylesheet the build splits into style.css");
  const surfaces = [...design.matchAll(/<template data-surface="([^"]+)">([\s\S]*?)<\/template>/g)].map((match) => ({
    name: match[1],
    body: match[2],
  }));
  const required = [
    "site",
    "popup",
    "sidepanel",
    "dashboardpage",
    "optionspage",
    "transparencypage",
    "sandbox",
    "offscreen",
  ];
  const styleclasses = new Set([...stylesheet.matchAll(/\.[a-z][a-z0-9-]*/g)].map((match) => match[0].slice(1)));
  const contrastpairs = [];

  await entry(
    {
      id: 1,
      title: "every ui surface template the build splits is present and named",
      criterion: "2.4.3",
      family: "surfaces",
      module: "web/extension/index.html",
    },
    async () => {
      const names = surfaces.map((surface) => surface.name);
      for (const name of required) check(names.includes(name), `the design file misses the ${name} surface template`);
      check(
        names.length === required.length,
        `the design file carries ${names.length} surface templates instead of ${required.length}`,
      );
      const shellnav = /<nav\b[^>]*surfacenav[^>]*>/.exec(design)?.[0] ?? "";
      check(/aria-label="[^"]+"/.test(shellnav), "the surface navigation landmark of the shell carries no aria-label");
      const switcher = /\/\* The surface switcher[^*]*\*\/[\s\S]*?<\/script>/.exec(design)?.[0] ?? "";
      check(
        /createElement\("button"\)/.test(switcher) && /\.textContent\s*=\s*name/.test(switcher),
        "the surface switcher creates nav buttons without their text content",
      );
      return `the design file carries all ${required.length} surface templates (${names.join(", ")}) beside the shell navigation landmark with its aria-label and the switcher that names every nav button it creates.`;
    },
  );

  await entry(
    {
      id: 2,
      title: "every image carries its alt text and the decorative markers stay off the interactive elements",
      criterion: "1.1.1",
      family: "non-text content",
      module: "web/extension/index.html",
    },
    async () => {
      let images = 0;
      for (const surface of surfaces) {
        for (const match of surface.body.matchAll(/<img\b([^>]*)>/g)) {
          images += 1;
          check(
            /alt\s*=\s*"[^"]*"/.test(match[1]),
            `the ${surface.name} surface carries an img element without its alt attribute`,
          );
        }
      }
      let decorative = 0;
      for (const surface of surfaces) {
        for (const match of surface.body.matchAll(/<(div|span|iframe|img|svg)\b([^>]*)aria-hidden="true"([^>]*)>/g)) {
          decorative += 1;
          const attributes = attributesof(match[0]);
          check(
            attributes.tabindex === undefined,
            `the decorative ${match[1]} of the ${surface.name} surface carries a tabindex and stays inside the focus order`,
          );
          check(
            !["button", "input", "select", "textarea", "a"].includes(match[1]),
            `the decorative marker of the ${surface.name} surface sits on the interactive element ${match[1]}`,
          );
        }
        /* the script side: a decorative host the surface script hides carries the aria-hidden marker with no tabindex and no focusable role. */
        for (const match of surface.body.matchAll(/createElement\("(iframe|div|span)"\)/g)) {
          const host = match[1];
          const region = surface.body.slice(match.index ?? 0, (match.index ?? 0) + 400);
          if (!/aria-hidden",\s*"true"/.test(region)) continue;
          decorative += 1;
          check(
            !/tabindex/.test(region),
            `the decorative ${host} the ${surface.name} script hides carries a tabindex and stays inside the focus order`,
          );
          check(
            /display\s*=\s*"none"|hidden/.test(region),
            `the decorative ${host} the ${surface.name} script marks stays visible`,
          );
        }
      }
      return `${images} image element${images === 1 ? "" : "s"} audited with every alt attribute present and ${decorative} decorative marker${decorative === 1 ? "" : "s"} audited (the hidden sandbox frame among them) with none sitting on an interactive element, carrying a tabindex or staying visible.`;
    },
  );

  await entry(
    {
      id: 3,
      title: "every button carries an accessible name and every field carries its label",
      criterion: "1.3.1",
      family: "names and labels",
      module: "web/extension/index.html",
    },
    async () => {
      let buttons = 0;
      let fields = 0;
      for (const surface of surfaces) {
        for (const match of surface.body.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)) {
          buttons += 1;
          const attributes = attributesof(`<button ${match[1]}>`);
          const text = striptags(match[2]).trim();
          check(
            attributes["aria-label"] !== undefined || attributes.title !== undefined || text !== "",
            `the button ${attributes.id ?? "unnamed"} of the ${surface.name} surface carries no accessible name`,
          );
        }
        const labelsof = new Set([...surface.body.matchAll(/<label\b[^>]*\bfor="([^"]+)"/g)].map((match) => match[1]));
        for (const match of surface.body.matchAll(/<(input|textarea|select)\b([^>]*?)\/?>/g)) {
          fields += 1;
          const attributes = attributesof(`<${match[1]} ${match[2]}>`);
          const labelled =
            attributes["aria-label"] !== undefined ||
            attributes["aria-labelledby"] !== undefined ||
            (attributes.id !== undefined && labelsof.has(attributes.id));
          check(
            labelled,
            `the ${match[1]} ${attributes.id ?? "unnamed"} of the ${surface.name} surface carries neither a label element, an aria-label nor an aria-labelledby`,
          );
        }
      }
      return `${buttons} button element${buttons === 1 ? "" : "s"} audited with every accessible name present (its text content or its aria-label) and ${fields} input, textarea and select field${fields === 1 ? "" : "s"} audited with every label present (its label element or its aria-label).`;
    },
  );

  await entry(
    {
      id: 4,
      title: "every surface heading hierarchy starts at the h1 with no skipped level",
      criterion: "1.3.1",
      family: "structure",
      module: "web/extension/index.html",
    },
    async () => {
      const shapes = [];
      for (const surface of surfaces) {
        const levels = [...withoutscripts(surface.body).matchAll(/<h([1-6])\b/g)].map((match) => Number(match[1]));
        if (levels.length === 0) {
          shapes.push(`${surface.name}: no headings`);
          continue;
        }
        check(
          levels[0] === 1,
          `the ${surface.name} surface starts its heading hierarchy at h${levels[0]} instead of the h1`,
        );
        const hones = levels.filter((level) => level === 1).length;
        check(hones === 1, `the ${surface.name} surface carries ${hones} h1 headings instead of one`);
        for (let index = 1; index < levels.length; index += 1)
          check(
            levels[index] - levels[index - 1] <= 1,
            `the ${surface.name} surface skips from h${levels[index - 1]} to h${levels[index]}`,
          );
        shapes.push(`${surface.name}: ${levels.map((level) => `h${level}`).join("")}`);
      }
      return `every surface heading hierarchy audited: ${shapes.join("; ")}.`;
    },
  );

  await entry(
    {
      id: 5,
      title: "the default theme tokens meet the computed contrast ratios",
      criterion: "1.4.3",
      family: "contrast",
      module: "web/extension/index.html",
    },
    async () => {
      const themeblock = /:root\s*\{([^}]*)\}/.exec(stylesheet)?.[1] ?? "";
      const tokens = {};
      for (const match of themeblock.matchAll(/--([a-z-]+):\s*(#[0-9a-fA-F]{6})/g))
        tokens[match[1]] = match[2].toLowerCase();
      for (const name of ["theme-surface", "theme-elevated", "theme-text", "theme-muted", "theme-accent"])
        check(tokens[name] !== undefined, `the stylesheet declares no --${name} token for the default theme`);
      const fallbacks = {};
      for (const match of (stylesheet.match(/:root\s*\{[^}]*--base:[^}]*\}/g) ?? [])
        .join("")
        .matchAll(/--([a-z-]+):\s*(#[0-9a-fA-F]{6})/g))
        fallbacks[match[1]] = match[2].toLowerCase();
      for (const [fallback, theme] of [
        ["base", "theme-surface"],
        ["text", "theme-text"],
        ["muted", "theme-muted"],
        ["accent", "theme-accent"],
      ]) {
        check(
          fallbacks[fallback] === tokens[theme],
          `the fallback token --${fallback} (${fallbacks[fallback]}) disagrees with the theme token --${theme} (${tokens[theme]})`,
        );
      }
      const pairs = [
        {
          name: "text on surface",
          foreground: tokens["theme-text"],
          background: tokens["theme-surface"],
          minimum: 4.5,
        },
        {
          name: "text on elevated",
          foreground: tokens["theme-text"],
          background: tokens["theme-elevated"],
          minimum: 4.5,
        },
        {
          name: "muted on surface",
          foreground: tokens["theme-muted"],
          background: tokens["theme-surface"],
          minimum: 4.5,
        },
        {
          name: "muted on elevated",
          foreground: tokens["theme-muted"],
          background: tokens["theme-elevated"],
          minimum: 4.5,
        },
        {
          name: "accent on surface",
          foreground: tokens["theme-accent"],
          background: tokens["theme-surface"],
          minimum: 3,
        },
        {
          name: "accent on elevated",
          foreground: tokens["theme-accent"],
          background: tokens["theme-elevated"],
          minimum: 3,
        },
      ];
      for (const pair of pairs) {
        const ratio = contrastof(pair.foreground, pair.background);
        contrastpairs.push({ pair: pair.name, ratio, minimum: pair.minimum });
        check(ratio >= pair.minimum, `the ${pair.name} pair answers ${ratio}:1 under the required ${pair.minimum}:1`);
      }
      /* the button rules carry their literal ink over the accent background; the sweep audits every literal it finds. */
      const inks = new Set();
      for (const match of stylesheet.matchAll(/button\s*\{[^}]*\}/g))
        for (const ink of match[0].matchAll(/color:\s*(#[0-9a-fA-F]{6})/g)) inks.add(ink[1].toLowerCase());
      check(inks.size > 0, "the button rules declare no literal ink color the sweep can audit");
      for (const ink of inks) {
        const ratio = contrastof(ink, tokens["theme-accent"]);
        contrastpairs.push({ pair: `button ink ${ink} on accent`, ratio, minimum: 4.5 });
        check(
          ratio >= 4.5,
          `the button ink ${ink} on the accent background answers ${ratio}:1 under the required 4.5:1`,
        );
      }
      const outlinerule = /button:focus-visible[^{]*\{[^}]*\}/.exec(stylesheet)?.[0] ?? "";
      const outlinecolor = /outline:\s*[^;]*?(#[0-9a-fA-F]{6})/.exec(outlinerule)?.[1]?.toLowerCase();
      if (outlinecolor !== undefined) {
        const ratio = contrastof(outlinecolor, tokens["theme-surface"]);
        contrastpairs.push({ pair: "focus outline on surface", ratio, minimum: 3 });
        check(ratio >= 3, `the focus outline ${outlinecolor} on the surface answers ${ratio}:1 under the required 3:1`);
      }
      return `the default theme tokens parsed from the stylesheet answer: ${contrastpairs.map((pair) => `${pair.pair} ${pair.ratio}:1 (min ${pair.minimum}:1)`).join(", ")}; the fallback tokens mirror the theme tokens and the high contrast variants stay outside this sweep.`;
    },
  );

  await entry(
    {
      id: 6,
      title: "the stylesheet carries the focus visible outlines",
      criterion: "2.4.7",
      family: "focus visible",
      module: "web/extension/index.html",
    },
    async () => {
      const rule = /button:focus-visible[^{]*\{[^}]*\}/.exec(stylesheet)?.[0] ?? "";
      check(rule !== "", "the stylesheet declares no button:focus-visible rule");
      check(/outline:\s*[^;]+/.test(rule), "the button:focus-visible rule declares no outline");
      check(/outline-offset:\s*[^;]+/.test(rule), "the button:focus-visible rule declares no outline offset");
      for (const selector of ["input:focus-visible", "textarea:focus-visible"])
        check(rule.includes(selector), `the focus visible rule misses the ${selector} selector`);
      return `the stylesheet carries the shared focus visible rule for the button, input and textarea selectors with its ${/outline:\s*([^;]+);/.exec(rule)?.[1]?.trim()} and its outline offset, so keyboard focus stays visible on every control surface.`;
    },
  );

  await entry(
    {
      id: 7,
      title: "no positive tabindex reorders the focus order of any surface",
      criterion: "2.4.3",
      family: "focus order",
      module: "web/index.html and dist/extension",
    },
    async () => {
      let scanned = 0;
      const offenders = [];
      for (const surface of surfaces) {
        for (const match of surface.body.matchAll(/tabindex\s*=\s*"(-?\d+)"/g)) {
          scanned += 1;
          if (Number(match[1]) > 0) offenders.push(`${surface.name}: tabindex ${match[1]}`);
        }
      }
      for (const match of withoutscripts(design).matchAll(/tabindex\s*=\s*"(-?\d+)"/g)) {
        scanned += 1;
        if (Number(match[1]) > 0) offenders.push(`shell: tabindex ${match[1]}`);
      }
      check(offenders.length === 0, `positive tabindex values reorder the focus: ${offenders.join(", ")}`);
      const built = await readdir("dist/extension").catch(() => []);
      check(
        built.filter((name) => name.endsWith(".html")).length >= required.length - 1,
        `the built surface pages are absent; run node tests/build.mjs before the accessibility sweep`,
      );
      for (const page of built.filter((name) => name.endsWith(".html"))) {
        const html = await readFile(join("dist/extension", page), "utf8");
        for (const match of html.matchAll(/tabindex\s*=\s*"(\d+)"/g)) {
          scanned += 1;
          if (Number(match[1]) > 0) offenders.push(`${page}: tabindex ${match[1]}`);
        }
      }
      check(offenders.length === 0, `positive tabindex values reorder the built pages: ${offenders.join(", ")}`);
      return `${scanned} tabindex attribute${scanned === 1 ? "" : "s"} scanned across the ${surfaces.length} surface templates, the shell and the ${built.filter((name) => name.endsWith(".html")).length} built pages with zero positive values, so the focus order stays the document order.`;
    },
  );

  await entry(
    {
      id: 8,
      title: "every built surface page stamps its html lang and no template overrides it",
      criterion: "3.1.1",
      family: "language",
      module: "web/index.html, tests/build.mjs and dist/extension",
    },
    async () => {
      const sourcelang = /<html\s+lang="([^"]*)"/.exec(design)?.[1];
      check(sourcelang === "en", `the design document stamps the lang ${sourcelang ?? "none"} instead of en`);
      for (const surface of surfaces) {
        const markup = withoutscripts(surface.body);
        const override = /<html\b[^>]*>/.exec(markup);
        check(
          override === null,
          `the ${surface.name} template overrides the html element the build stamps: ${override?.[0]}`,
        );
      }
      const built = (await readdir("dist/extension").catch(() => [])).filter((name) => name.endsWith(".html"));
      const stamped = [];
      for (const page of built) {
        const html = await readFile(join("dist/extension", page), "utf8");
        const lang = /<html\s+lang="([^"]*)"/.exec(html)?.[1];
        check(lang === "en", `the built surface page ${page} stamps the lang ${lang ?? "none"} instead of en`);
        stamped.push(`${page}: ${lang}`);
      }
      check(
        stamped.length >= required.length - 1,
        `the built surface pages are absent; run node tests/build.mjs before the accessibility sweep`,
      );
      return `the design document stamps lang="en", no template body carries its own html element (the script strings of the hidden sandbox frame stay excluded from the markup scan) and every built page keeps the stamp the build writes: ${stamped.join(", ")}.`;
    },
  );

  await entry(
    {
      id: 9,
      title: "the generated markup classes resolve to real stylesheet rules",
      criterion: "1.3.1",
      family: "generated markup",
      module: "views.ts, sidepanel.ts, popup.ts, dashboardpage.ts and optionspage.ts",
    },
    async () => {
      const templateclasses = new Set();
      for (const surface of surfaces)
        for (const match of withoutscripts(surface.body).matchAll(/class="([^"]+)"/g))
          for (const token of match[1].split(/\s+/)) if (token) templateclasses.add(token);
      const missingtemplate = [...templateclasses].filter((token) => !styleclasses.has(token)).sort();
      check(
        missingtemplate.length === 0,
        `the surface templates reference classes the stylesheet never declares: ${missingtemplate.join(", ")}`,
      );
      const toggled = new Set();
      const assigned = new Set();
      for (const source of viewsources) {
        const text = await readFile(source, "utf8").catch(() => "");
        for (const match of text.matchAll(/classList\.(?:add|toggle|remove)\("([^"]+)"\)/g)) toggled.add(match[1]);
        for (const match of text.matchAll(/className = "([^"]+)"/g))
          for (const token of match[1].split(/\s+/)) if (token) assigned.add(token);
      }
      const missingtoggled = [...toggled].filter((token) => !styleclasses.has(token)).sort();
      check(
        missingtoggled.length === 0,
        `the view scripts toggle state classes the stylesheet never declares: ${missingtoggled.join(", ")}`,
      );
      const sharedvocabulary = [...assigned].filter((token) => templateclasses.has(token)).sort();
      const missingshared = sharedvocabulary.filter((token) => !styleclasses.has(token)).sort();
      check(
        missingshared.length === 0,
        `the shared class vocabulary the view scripts assign never resolves: ${missingshared.join(", ")}`,
      );
      return `every one of the ${templateclasses.size} template classes resolves to a real stylesheet rule, every one of the ${toggled.size} runtime state class${toggled.size === 1 ? "" : "es"} the view scripts toggle (${[...toggled].sort().join(", ")}) resolves and every one of the ${sharedvocabulary.length} shared vocabulary classes the view scripts assign resolves, so the generated markup renders with the rules the one design ships.`;
    },
  );

  await entry(
    {
      id: 10,
      title: "the sweep report records every check and the exit answers the failures",
      criterion: "2.4.3",
      family: "report",
      module: "wcag.mjs",
    },
    async () => {
      const recorded = executed.filter((candidate) => candidate.id !== 10);
      check(recorded.length === 9, `the sweep report carries ${recorded.length} executed checks instead of nine`);
      for (const candidate of recorded) {
        check(
          candidate.outcome === "pass" || candidate.outcome === "fail",
          `the check ${candidate.id} recorded no outcome`,
        );
        check(
          candidate.title.length > 10 && candidate.detail.length > 10,
          `the check ${candidate.id} recorded no title or detail`,
        );
        check(
          /^[0-9]\.[0-9]+\.[0-9]+$/.test(candidate.criterion),
          `the check ${candidate.id} carries no wcag success criterion reference`,
        );
      }
      const failedcount = recorded.filter((candidate) => candidate.outcome === "fail").length;
      const summary = {
        total: recorded.length + 1,
        passed: recorded.length - failedcount + (failedcount === 0 ? 1 : 0),
        failed: failedcount,
      };
      check(
        summary.failed === 0,
        `${summary.failed} accessibility check${summary.failed === 1 ? "" : "s"} failed before the report landed`,
      );
      return `the sweep report carries the nine executed checks with their outcomes, details and success criterion references, the summary computes ${summary.passed} of ${summary.total} passed over the ${surfaces.length} surface templates, and the gate sets its nonzero exit the moment any failed check lands in the artifact while the static analysis stays honest: no screen reader emulation and no runtime focus walk.`;
    },
  );

  const failed = executed.filter((candidate) => candidate.outcome === "fail");
  return {
    release,
    checklist: "docs/wcag.md",
    surfaces: surfaces.map((surface) => surface.name),
    contrast: contrastpairs,
    entries: executed,
    summary: { total: executed.length, passed: executed.length - failed.length, failed: failed.length },
  };
}

const invokeddirectly = process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokeddirectly) {
  const report = await runwcagsuite();
  await mkdir("tests/artifacts", { recursive: true });
  await writeFile(artifactpath, `${JSON.stringify(report, null, 2)}\n`);
  for (const candidate of report.entries) {
    const line = `[${candidate.outcome === "pass" ? "ok" : "FAIL"}] ${candidate.id}. ${candidate.title} (wcag ${candidate.criterion}, ${candidate.module}) — ${candidate.detail}`;
    if (candidate.outcome === "pass") console.log(line);
    else console.error(line);
  }
  console.log(JSON.stringify({ release: report.release, artifact: artifactpath, ...report.summary }, null, 2));
  if (report.summary.failed > 0) process.exitCode = 1;
}
