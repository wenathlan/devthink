/** Updates only mutable, reviewed GitHub Action release tags; SHA-pinned actions remain immutable. */
import { readdir, readFile, writeFile } from "node:fs/promises";

const mode = process.argv[2] ?? "check";
if (!new Set(["check", "sync"]).has(mode)) throw new Error("Use check or sync.");
const allowmajors = process.argv.includes("--allow-majors");
const allowed = new Set([
  "actions/checkout", "actions/setup-node", "actions/setup-java", "actions/setup-dotnet", "actions/upload-artifact", "actions/download-artifact", "actions/dependency-review-action", "actions/attest",
  "pnpm/action-setup", "oven-sh/setup-bun", "denoland/setup-deno", "docker/setup-qemu-action", "docker/setup-buildx-action", "docker/login-action", "docker/metadata-action", "docker/build-push-action",
  "github/codeql-action/init", "github/codeql-action/analyze", "trufflesecurity/trufflehog", "anchore/sbom-action",
]);
const latest = new Map();
async function versionfor(action) {
  if (!latest.has(action)) {
    const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
    const headers = { Accept: "application/vnd.github+json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(`https://api.github.com/repos/${action}/releases/latest`, { headers });
    if (!response.ok) throw new Error(`GitHub releases for ${action} returned ${response.status}`);
    const tag = (await response.json()).tag_name;
    if (!/^v\d+(?:\.\d+){0,2}$/.test(tag ?? "")) throw new Error(`${action} has an unsupported latest tag: ${tag}`);
    latest.set(action, tag);
  }
  return latest.get(action);
}
let drift = false;
const skippedmajors = [];
for (const file of (await readdir(".github/workflows")).filter(entry => /\.ya?ml$/i.test(entry)).sort()) {
  const path = `.github/workflows/${file}`;
  const current = await readFile(path, "utf8");
  const matches = [...current.matchAll(/uses:\s*([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)@(v\d+(?:\.\d+){0,2})/g)];
  let next = current;
  for (const match of matches) {
    const [, action, pinned] = match;
    if (!allowed.has(action)) continue;
    const version = await versionfor(action);
    const currentmajor = Number(pinned.slice(1).split(".")[0]);
    const latestmajor = Number(version.slice(1).split(".")[0]);
    if (latestmajor > currentmajor && !allowmajors) {
      skippedmajors.push({ action, current: pinned, latest: version });
      continue;
    }
    if (version !== pinned) next = next.replace(`uses: ${action}@${pinned}`, `uses: ${action}@${version}`);
  }
  if (next !== current) {
    drift = true;
    if (mode === "sync") await writeFile(path, next);
  }
}
if (drift && mode === "check") throw new Error("A mutable GitHub Action release tag is outdated. Run pnpm workflow:updates in a review branch.");
console.log(JSON.stringify({ mode, allowmajors, checked: allowed.size, skippedmajors, drift, immutablePinsPreserved: true }, null, 2));
