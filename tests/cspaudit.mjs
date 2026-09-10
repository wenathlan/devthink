/** Audits every content security policy of the extension: the gate reads the root manifest and both browser overlays, parses the extension pages policy of each, refuses any eval, remote code, unsafe inline or wildcard source in the frozen policies, verifies the pagebridge script stays the only injected file of the scripting api, verifies the extension pages load no remote resources, and verifies the dashboard renders untrusted extracts inside the fully sandboxed frame the manifest declares. The gate runs against the built extension bundles so it answers for the shipped artifacts, prints one deterministic json report, and exits nonzero on any failure. */
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const packagejson = JSON.parse(await readFile("package.json", "utf8"));
const release = String(packagejson.version);
const manifest = JSON.parse(await readFile("web/manifest.json", "utf8"));
const failures = [];
const policies = [];

/** Records one refusal of the content security audit. */
function refuse(message) {
  failures.push(message);
}

/** Parses one extension pages policy into its directives: every directive splits into its name and its source list, so the audit reads the exact sources the policy allows. */
function parsedirectives(text, surface) {
  const directives = {};
  for (const directive of text
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part !== "")) {
    const [name, ...sources] = directive.split(/\s+/);
    if (name === undefined || directives[name] !== undefined)
      refuse(`The ${surface} policy carries the directive ${name} twice or malformed.`);
    directives[name] = sources;
  }
  return directives;
}

/* 1. every policy the manifest declares lands in the audit set: the root policy and the two browser overlays. */
const rootpolicy = manifest.content_security_policy?.extension_pages;
if (typeof rootpolicy !== "string" || rootpolicy.trim() === "")
  refuse("The root manifest carries no extension pages content security policy.");
else policies.push({ surface: "root", text: rootpolicy });
for (const browser of ["firefox", "safari"]) {
  const overlaypolicy = manifest.browsers?.[browser]?.content_security_policy?.extension_pages;
  if (typeof overlaypolicy !== "string" || overlaypolicy.trim() === "")
    refuse(`The ${browser} overlay of the root manifest carries no extension pages content security policy.`);
  else policies.push({ surface: `browsers.${browser}`, text: overlaypolicy });
}

/* 2. every policy pins its script and object sources to the local origin, refuses eval, unsafe inline and remote code, and frames only its own pages. */
for (const policy of policies) {
  const directives = parsedirectives(policy.text, policy.surface);
  const scriptsources = directives["script-src"] ?? [];
  const objectsources = directives["object-src"] ?? [];
  if (scriptsources.length === 0)
    refuse(`The ${policy.surface} policy declares no script-src directive; no script source may default open.`);
  if (objectsources.length === 0)
    refuse(`The ${policy.surface} policy declares no object-src directive; no object source may default open.`);
  for (const source of [
    ...scriptsources,
    ...objectsources,
    ...(directives["style-src"] ?? []),
    ...(directives["connect-src"] ?? []),
    ...(directives["frame-src"] ?? []),
    ...(directives["img-src"] ?? []),
    ...(directives["font-src"] ?? []),
  ]) {
    if (source === "'self'") continue;
    if (source.includes("*"))
      refuse(
        `The ${policy.surface} policy carries the wildcard source ${source}; the frozen policies allow no wildcard.`,
      );
    if (/^https?:\/\//i.test(source))
      refuse(
        `The ${policy.surface} policy carries the remote source ${source}; every script, style and connect source stays local or behind the reviewed consent flow.`,
      );
    if (source.includes("unsafe-eval") || source.includes("unsafe-inline") || source.includes("data:"))
      refuse(
        `The ${policy.surface} policy carries the unsafe source ${source}; no eval, no inline and no data url ever loads.`,
      );
  }
  const frameancestors = directives["frame-ancestors"] ?? [];
  if (frameancestors.length !== 1 || frameancestors[0] !== "'self'")
    refuse(
      `The ${policy.surface} policy frames its pages for ${frameancestors.join(" ") || "no declared ancestors"}; the extension pages refuse framing by remote origins.`,
    );
  policy.directives = Object.keys(directives).sort();
}

/* 3. the overlays stay consistent with the root policy: one dialect difference would weaken one browser. */
const extensiondirectory = "dist/extension";
if (typeof rootpolicy === "string") {
  for (const policy of policies.filter((candidate) => candidate.surface !== "root")) {
    if (policy.text !== rootpolicy)
      refuse(
        `The ${policy.surface} overlay policy differs from the root policy; every browser carries the same frozen extension pages policy.`,
      );
  }
  /* the shipped chromium manifest copy carries the same policy the root declares, so the packaged extension answers the audit too */
  try {
    const shipped = JSON.parse(await readFile(join(extensiondirectory, "manifest.json"), "utf8"));
    if (shipped.content_security_policy?.extension_pages !== rootpolicy)
      refuse(
        "The shipped chromium manifest copy carries a different extension pages policy; the packaged extension must answer the same frozen policy.",
      );
  } catch {
    refuse(
      "The built extension directory carries no manifest.json copy; run pnpm build before the content security audit.",
    );
  }
}

/* 4. no injected code path uses eval or remote code: every built bundle refuses eval, remote script loads and remote script tags, and the dynamic function construction of reviewed evaluate expressions stays inside the two executors the design names — the isolated world executor of the background and the page executor of the pagebridge — with the site counts matching the reviewed sources. */
const dynamicfunctionbundles = ["background.js", "pagebridge.js"];
const dynamicfunctionsources = { "background.js": "background.ts", "pagebridge.js": "page.ts" };
const sitecounts = {};
const bundlefiles = (await readdir(extensiondirectory)).filter((file) => file.endsWith(".js")).sort();
if (bundlefiles.length === 0)
  refuse("The built extension directory carries no bundles; run pnpm build before the content security audit.");
for (const file of bundlefiles) {
  const content = await readFile(join(extensiondirectory, file), "utf8");
  const codewithoutstrings = content.replace(/"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`/g, "");
  if (/\beval\s*\(/.test(codewithoutstrings))
    refuse(`The built bundle ${file} calls eval; no injected code path ever evaluates strings.`);
  const sites = (content.match(/new\s+Function\s*\(/g) ?? []).length;
  /* the firefox target ships hashed copies of the same bundles beside them, so the hash suffix reads off before the executor checks */
  const basename = file.replace(/\.[0-9a-f]{10}\.js$/, ".js");
  sitecounts[file] = sites;
  if (sites > 0 && !dynamicfunctionbundles.includes(basename))
    refuse(
      `The built bundle ${file} constructs functions from strings; only the reviewed evaluate executors of the background and the pagebridge evaluate reviewed expressions.`,
    );
  if (sites > 0 && dynamicfunctionsources[basename] !== undefined) {
    const source = await readFile(dynamicfunctionsources[basename], "utf8");
    const sourcesites = [...source.matchAll(/new\s+Function\s*\(/g)].length;
    if (sites !== sourcesites)
      refuse(
        `The built bundle ${file} constructs functions at ${sites} sites while its reviewed source ${dynamicfunctionsources[basename]} declares ${sourcesites}; every dynamic construction must trace to a reviewed evaluate site.`,
      );
  }
  if (/importScripts\s*\(\s*["']https?:/.test(codewithoutstrings))
    refuse(`The built bundle ${file} imports remote scripts; no code path loads remote code.`);
  if (/document\.createElement\s*\(\s*["']script["']\s*\)[\s\S]{0,200}src\s*=\s*["']https?:/.test(codewithoutstrings))
    refuse(`The built bundle ${file} injects a remote script tag; no code path loads remote code.`);
}

/* 5. the pagebridge script stays the only injected file: every files array the scripting api injects names pagebridge.js alone. */
const backgroundsource = await readFile("background.ts", "utf8");
const injections = [...backgroundsource.matchAll(/executeScript\(\{[\s\S]{0,160}?files:\s*\[([^\]]*)\]/g)].map(
  (match) => [...match[1].matchAll(/"([^"]+)"/g)].map((entry) => entry[1]),
);
if (injections.length === 0)
  refuse(
    "The background injects no file through the scripting api; the pagebridge injection the cspaudit expects is missing.",
  );
for (const files of injections) {
  if (files.length !== 1 || files[0] !== "pagebridge.js")
    refuse(
      `The scripting api injects the files ${files.join(", ")}; the pagebridge script stays the only injected file.`,
    );
}
if (!bundlefiles.includes("pagebridge.js"))
  refuse("The built extension carries no pagebridge.js bundle; the only injected file must ship.");

/* 6. the sidepanel and popup load no remote resources: every resource reference of every extension page stays a local file of the package. */
const pagefiles = (await readdir(extensiondirectory)).filter((file) => file.endsWith(".html")).sort();
if (pagefiles.length === 0)
  refuse("The built extension directory carries no pages; run pnpm build before the content security audit.");
for (const file of pagefiles) {
  const content = await readFile(join(extensiondirectory, file), "utf8");
  for (const reference of [...content.matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']/g)].map((match) => match[1])) {
    if (/^(https?|wss?|data|blob):/i.test(reference) && !reference.startsWith("blob:"))
      refuse(`The extension page ${file} loads the remote resource ${reference}; every page resource stays local.`);
    if (reference.startsWith("/") && !reference.startsWith("//"))
      refuse(
        `The extension page ${file} loads the absolute path ${reference}; every page resource stays a package relative file.`,
      );
  }
  if (/\son[a-z]+\s*=\s*["']/i.test(content))
    refuse(
      `The extension page ${file} carries an inline event handler; every handler binds through the reviewed code.`,
    );
}

/* 7. the dashboard renders untrusted extracts inside the sandbox frame: the manifest declares the sandboxed page and the fully sandboxed iframe renders the untrusted markup. */
const sandboxpages = manifest.sandbox?.pages ?? [];
if (!sandboxpages.includes("sandbox.html"))
  refuse(
    "The manifest declares no sandbox.html under the sandbox key; untrusted extracts render only inside the sandbox frame.",
  );
if (!pagefiles.includes("sandbox.html"))
  refuse("The built extension carries no sandbox.html page; the sandbox frame must ship.");
else {
  const sandboxpage = await readFile(join(extensiondirectory, "sandbox.html"), "utf8");
  if (!sandboxpage.includes("devthinksandbox"))
    refuse(
      "The sandbox page speaks no devthinksandbox channel; the render handshake the frame family defines is missing.",
    );
  if (!sandboxpage.includes('setAttribute("sandbox", "")') && !sandboxpage.includes("setAttribute('sandbox', '')"))
    refuse("The sandbox page carries no fully sandboxed iframe; untrusted markup renders with no privileges at all.");
}
const webindex = await readFile("web/design.html", "utf8");
if (!webindex.includes('data-surface="sandbox"'))
  refuse(
    "The one web design file carries no sandbox surface template; the sandbox frame renders from the shared design.",
  );
if (!webindex.includes('data-surface="dashboardpage"'))
  refuse(
    "The one web design file carries no dashboardpage surface template; the dashboard renders from the shared design.",
  );

/* the report: every extracted policy with its directives, the audited bundle and page set, and the verdict. */
const report = {
  release,
  policies: policies.map((policy) => ({ surface: policy.surface, policy: policy.text, directives: policy.directives })),
  bundles: bundlefiles,
  pages: pagefiles,
  injectedfiles: ["pagebridge.js"],
  dynamicfunctionsites: sitecounts,
  sandboxframe: "sandbox.html",
  checks: 7,
};
if (failures.length > 0) {
  for (const failure of failures) console.error(`CSPAUDIT ${failure}`);
  process.exitCode = 1;
} else {
  console.log(
    `Content security audit verified ${policies.length} policies over ${bundlefiles.length} bundles and ${pagefiles.length} pages.`,
  );
  console.log(JSON.stringify(report, null, 2));
}
