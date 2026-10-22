// vehicle-merge.mjs — the landing vehicle for an EXISTING pull request:
// waits for the required battery on the pr head, then squash merges so
// the landing commit carries the GitHub web-flow signature (Verified).
// usage: node scripts-session8/vehicle-merge.mjs <prnumber> <meta.json>
import { readFileSync } from "node:fs";

const [prNumber, metaPath] = process.argv.slice(2);
if (!prNumber || !metaPath) {
  console.error("usage: vehicle-merge.mjs <prnumber> <meta.json>");
  process.exit(2);
}
const meta = JSON.parse(readFileSync(metaPath, "utf8"));
const token = readFileSync("/tmp/ghtoken", "utf8").trim();
const repo = "wenathlan/devthink";
const api = (path, init) =>
  fetch(`https://api.github.com/repos/${repo}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

const REQUIRED = [
  "The DevThink gate ladder",
  "The DevThink library modes on node",
  "The DevThink library modes on bun",
  "The DevThink library modes on deno",
  "analyze (javascript-typescript)",
  "analyze (actions)",
  "Static workbench compatibility",
  "CLI contract on node",
  "CLI contract on bun",
];

const pr = await (await api(`/pulls/${prNumber}`)).json();
console.log("pr #" + pr.number + " head: " + pr.head.sha + " (" + pr.head.ref + ")");
const headSha = pr.head.sha;

let verdict = "timeout";
const deadline = Date.now() + 25 * 60 * 1000;
while (Date.now() < deadline) {
  await new Promise((r) => setTimeout(r, 20000));
  const runsRes = await api(`/commits/${headSha}/check-runs?per_page=100`);
  const runs = (await runsRes.json()).check_runs || [];
  const byName = new Map(runs.map((run) => [run.name, run]));
  const pending = REQUIRED.filter((name) => {
    const run = byName.get(name);
    return !run || run.status !== "completed";
  });
  const failed = REQUIRED.filter((name) => {
    const run = byName.get(name);
    return run && run.status === "completed" && run.conclusion !== "success" && run.conclusion !== "skipped";
  });
  const done = REQUIRED.length - pending.length - failed.length;
  console.log(`battery: ${done}/${REQUIRED.length} done, ${pending.length} pending, ${failed.length} failed`);
  if (failed.length > 0) {
    verdict = "failed";
    console.error("FAILED CONTEXTS:", failed.join(", "));
    break;
  }
  if (pending.length === 0) {
    verdict = "green";
    break;
  }
}
if (verdict !== "green") {
  console.error("the battery never went green:", verdict);
  process.exit(1);
}

const mergeRes = await api(`/pulls/${prNumber}/merge`, {
  method: "PUT",
  body: JSON.stringify({
    merge_method: "squash",
    commit_title: meta.commitTitle,
    commit_message: meta.commitMessage,
  }),
});
const merge = await mergeRes.json();
if (!mergeRes.ok) {
  console.error("merge failed:", mergeRes.status, JSON.stringify(merge).slice(0, 400));
  process.exit(1);
}
console.log("landed:", merge.sha, "(squash vehicle, github signed)");
await api(`/git/refs/heads/${pr.head.ref}`, { method: "DELETE" }).then(async (r) => {
  console.log("branch cleanup:", r.status === 204 ? "deleted" : "kept (" + r.status + ")");
});
console.log("VEHICLE_OK " + merge.sha);
