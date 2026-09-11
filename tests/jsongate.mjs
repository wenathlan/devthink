/** Strict JSON validation of every tracked document, the gateway family json gate ported to the merged tree. */
import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";

/* The gateway ci lane carries the strict json gate (the maene and e2ugh
   lanes carry the same battery): every tracked .json file must parse as
   strict JSON with exactly one tolerance — tsconfig.json files are valid
   JSONC, so the parser strips line and block comments and trailing commas
   while preserving string literals verbatim for those files alone, and
   any OTHER file that parses only after the strip answers a warning
   (the gate stays honest about the drift). A BOM never masks a broken
   document: the strip runs first and the parser sees the clean text.
   The root and web package manifests answer a structural check of their
   own: name and version must exist and the version must equal the root
   package version in lockstep (the envelope battery's own contract). */

const tracked = execFileSync("git", ["ls-files", "*.json"], { encoding: "utf8" })
  .split("\n")
  .filter((line) => line.trim().length > 0)
  .sort();

if (tracked.length === 0) throw new Error("No tracked JSON documents were found; the json gate refuses to run over an empty tree.");

const stripBom = (text) => text.replace(/^\uFEFF/, "");

/* JSONC tolerance: strips line and block comments plus trailing commas
   while preserving string literals verbatim. */
function stripJsonc(text) {
  const n = text.length;
  let out = "";
  let i = 0;
  while (i < n) {
    const c = text[i];
    if (c === '"') {
      out += c;
      i += 1;
      while (i < n) {
        out += text[i];
        if (text[i] === "\\") {
          out += text[i + 1] ?? "";
          i += 2;
          continue;
        }
        if (text[i] === '"') {
          i += 1;
          break;
        }
        i += 1;
      }
      continue;
    }
    if (c === "/" && text[i + 1] === "/") {
      while (i < n && text[i] !== "\n") i += 1;
      continue;
    }
    if (c === "/" && text[i + 1] === "*") {
      i += 2;
      while (i < n && !(text[i] === "*" && text[i + 1] === "/")) i += 1;
      i += 2;
      continue;
    }
    if (c === ",") {
      /* Drop the comma when the next significant token closes a container
         (trailing comma in JSONC). */
      let j = i + 1;
      while (j < n) {
        if (/\s/.test(text[j])) {
          j += 1;
          continue;
        }
        if (text[j] === "/" && text[j + 1] === "/") {
          while (j < n && text[j] !== "\n") j += 1;
          continue;
        }
        if (text[j] === "/" && text[j + 1] === "*") {
          j += 2;
          while (j < n && !(text[j] === "*" && text[j + 1] === "/")) j += 1;
          j += 2;
          continue;
        }
        break;
      }
      if (j < n && (text[j] === "}" || text[j] === "]")) {
        i += 1;
        continue;
      }
    }
    out += c;
    i += 1;
  }
  return out;
}

const isTsconfig = (file) => /(^|\/)tsconfig[^/]*\.json$/.test(file);

let failures = 0;
let warnings = 0;
const reports = [];

for (const file of tracked) {
  const raw = stripBom(await readFile(file, "utf8"));
  let data;
  try {
    data = JSON.parse(raw);
  } catch (strictError) {
    try {
      data = JSON.parse(stripJsonc(raw));
      if (isTsconfig(file)) {
        reports.push(`${file}: parsed as JSONC (comments and trailing commas are valid in tsconfig).`);
      } else {
        console.warn(`::warning file=${file}::Parsed only as JSONC; strict JSON is expected outside tsconfig.`);
        warnings += 1;
      }
    } catch {
      console.error(`::error file=${file}::Invalid JSON: ${strictError.message}`);
      failures += 1;
      continue;
    }
  }
  /* The structural object contract applies to the manifest family alone:
     the mining evidence fixtures under tests/code are arrays at the top
     level by design (recorded repository evidence, not configuration),
     so a generic object demand would fail the evidence trees the grand
     merge deliberately tracks. */
  const isManifest = file === "package.json" || file === "web/package.json" || file === "web/manifest.json" || file === "biome.json" || file === "deno.json" || isTsconfig(file);
  if (isManifest && (!data || typeof data !== "object" || Array.isArray(data))) {
    console.error(`::error file=${file}::The manifest must be an object at the top level.`);
    failures += 1;
    continue;
  }
  if (file === "package.json" || file === "web/package.json") {
    if (typeof data.name !== "string" || data.name.length === 0) {
      console.error(`::error file=${file}::The manifest must declare a non-empty name.`);
      failures += 1;
    }
    if (typeof data.version !== "string" || data.version.length === 0) {
      console.error(`::error file=${file}::The manifest must declare a non-empty version.`);
      failures += 1;
    }
  }
}

/* The envelope lockstep of the two manifests the family battery already
   guards (release.mjs carries the full carrier set): the json gate reads
   both package manifests and asserts the web workbench mirrors the root
   version, so a broken document never reaches the release carrier
   battery. */
const rootmanifest = JSON.parse(stripBom(await readFile("package.json", "utf8")));
const webmanifest = JSON.parse(stripBom(await readFile("web/package.json", "utf8")));
if (rootmanifest.version !== webmanifest.version) {
  console.error(`::error file=web/package.json::The web manifest version ${webmanifest.version} does not mirror the root version ${rootmanifest.version}.`);
  failures += 1;
}

for (const report of reports) console.log(report);
console.log(`The json gate validated ${tracked.length} tracked documents: ${failures} failure(s), ${warnings} warning(s).`);
if (failures > 0) throw new Error(`${failures} tracked JSON document(s) failed the strict parse battery.`);
