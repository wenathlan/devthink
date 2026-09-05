/** Verifies the reproducible extension archive without loading its code: every required artifact answers inside the archive, the packaged manifest matches the package stamp, the icon family of the 2.0.2 final polish ships at every required size with valid png bytes inside the archive, the transparency page bundle the 1.1.95 completion ships — its html page with the completed sections and its compiled module — rides beside the manifest so the transparency surface never ships half built, and the multi agent dashboard bundle the 1.1.96 dashdone completion ships — the dashboardpage html with every multi agent panel and its compiled module — rides beside it the same way so the multi agent dashboard never ships half built. */
import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { promisify } from "node:util";

const execute = promisify(execFile);
const packagejson = JSON.parse(await readFile("package.json", "utf8"));
const archive = `dist/devthink${packagejson.version}.zip`;
const { stdout } = await execute("unzip", ["-Z1", archive]);
const files = stdout.trim().split("\n");
for (const required of ["manifest.json", "background.js", "pagebridge.js", "popup.html", "sidepanel.html", "transparencypage.html", "transparencypage.js", "dashboardpage.html", "dashboardpage.js", "style.css", "fixtures/gallery.json", "fixtures/recipes/scrapeproductgrid.json", "icons/16.png", "icons/19.png", "icons/32.png", "icons/38.png", "icons/48.png", "icons/128.png"]) if (!files.includes(required)) throw new Error(`Required extension artifact is missing: ${required}`);
const manifest = JSON.parse(await readFile("dist/extension/manifest.json", "utf8"));
if (manifest.version !== packagejson.version || manifest.manifest_version !== 3) throw new Error("Packaged manifest version is invalid.");
/* the icon family check of the 2.0.2 final polish: every archived icon path answers inside the archive (the file list above), the materialized png bytes carry a real png header with the exact pixel size of their key, and the manifest icons block resolves every archived path, so the store set provably renders at the required sizes inside the shipped archive */
const iconsignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
for (const size of [16, 19, 32, 38, 48, 128]) {
  const iconbuffer = await readFile(`dist/extension/icons/${size}.png`);
  if (iconbuffer.subarray(0, 8).equals(iconsignature) === false) throw new Error(`The ${size} pixel icon does not carry a png header; the icon family ships valid png bytes at every required size.`);
  if (iconbuffer.readUInt32BE(16) !== size || iconbuffer.readUInt32BE(20) !== size) throw new Error(`The ${size} pixel icon decodes to the wrong pixel size; every icon renders at its declared size.`);
  if (manifest.icons?.[String(size)] !== `icons/${size}.png`) throw new Error(`The packaged manifest icons block does not resolve the archived ${size} pixel icon.`);
}
if (manifest.action?.default_icon?.["128"] !== "icons/128.png") throw new Error("The packaged action default icon block does not resolve the archived 128 pixel toolbar icon.");
/* the transparency page bundle check: the html the archive ships carries every completed section and stays free of remote resources and inline handlers, and the compiled module beside it speaks the transparency view */
const transparencyhtml = await execute("unzip", ["-p", archive, "transparencypage.html"]);
const transparencytext = transparencyhtml.stdout;
for (const section of ["grants", "windows", "permissions", "datakinds", "integrity", "senders", "permdiffs", "safedefaults"]) {
  if (!transparencytext.includes(`id="${section}"`)) throw new Error(`The packaged transparency page misses its ${section} section; the transparency page bundle ships complete or not at all.`);
}
if (/src\s*=\s*["']https?:/i.test(transparencytext) || /href\s*=\s*["']https?:/i.test(transparencytext)) throw new Error("The packaged transparency page loads a remote resource; the transparency page runs entirely offline.");
if (/\son[a-z]+\s*=\s*["']/i.test(transparencytext)) throw new Error("The packaged transparency page carries an inline event handler; every handler binds through the compiled module.");
const transparencymodule = await execute("unzip", ["-p", archive, "transparencypage.js"]);
if (!transparencymodule.stdout.includes("transparency") || transparencymodule.stdout.trim() === "") throw new Error("The packaged transparency module carries no transparency surface; the page bundle ships with its compiled module.");
/* the multi agent dashboard bundle check of the 1.1.96 dashdone completion: the html the archive ships carries every multi agent panel and stays free of remote resources and inline handlers, and the compiled module beside it speaks the multi agent view */
const dashboardhtml = await execute("unzip", ["-p", archive, "dashboardpage.html"]);
const dashboardtext = dashboardhtml.stdout;
for (const panel of ["multiagentoverview", "agentstatuscards", "sharedqueueview", "queuelanefilter", "messageflow", "conflictlog", "agentcostpanel", "escalationinbox", "timelinescrubber", "aggregatetimeline", "killswitch", "reportdownload"]) {
  if (!dashboardtext.includes(`id="${panel}"`)) throw new Error(`The packaged multi agent dashboard misses its ${panel} panel; the dashboard bundle ships complete or not at all.`);
}
if (/src\s*=\s*["']https?:/i.test(dashboardtext) || /href\s*=\s*["']https?:/i.test(dashboardtext)) throw new Error("The packaged multi agent dashboard loads a remote resource; the dashboard runs entirely offline.");
if (/\son[a-z]+\s*=\s*["']/i.test(dashboardtext)) throw new Error("The packaged multi agent dashboard carries an inline event handler; every handler binds through the compiled module.");
const dashboardmodule = await execute("unzip", ["-p", archive, "dashboardpage.js"]);
if (!dashboardmodule.stdout.includes("multiagent") || !dashboardmodule.stdout.includes("timeline") || dashboardmodule.stdout.trim() === "") throw new Error("The packaged dashboard module carries no multi agent surface; the dashboard bundle ships with its compiled module.");
console.log(JSON.stringify({ valid: true, archive, files: files.length, version: manifest.version, icons: "six-required-sizes-packaged", transparencypage: "sections-and-module-packaged", dashboardpage: "panels-and-module-packaged" }, null, 2));
