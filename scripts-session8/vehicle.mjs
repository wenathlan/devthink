// vehicle.mjs — the landing vehicle of the house: every wave rides a
// branch -> pull request -> wait for the required battery -> squash merge
// through the GitHub api so the landing commit carries the GitHub
// web-flow signature (the Verified badge), never a bare sandbox push.
// usage: node scripts-session8/vehicle.mjs <branch> <meta.json>
// meta.json: { "title": "...", "body": "...", "commitTitle": "...",
//              "commitMessage": "..." }
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const [branch, metaPath] = process.argv.slice(2);
if (!branch || !metaPath) {
  console.error("usage: vehicle.mjs <branch> <meta.json>");
  process.exit(2);
}
const meta = JSON.parse(readFileSync(metaPath, "utf8"));
const token = execSync("git remote get-url origin", { cwd: "/home/z/my-project" })
  .toString()
  .trim()
  .replace(/^https:\/\/x-access-token:([^@]+)@.*$/, "$1");
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

// the required battery the branch protection demands before a merge
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

const push = execSync(`git push origin ${branch}`, {
  cwd: "/home/z/my-project",
  stdio: "pipe",
}).toString();
console.log("pushed:", push.trim().split("\n").pop());

const prRes = await api("/pulls", {
  method: "POST",
  body: JSON.stringify({ title: meta.title, body: meta.body, head: branch, base: "main" }),
});
const pr = await prRes.json();
if (!prRes.ok) {
  console.error("PR create failed:", prRes.status, JSON.stringify(pr).slice(0, 400));
  process.exit(1);
}
console.log("pr #" + pr.number + ": " + pr.html_url);
const headSha = pr.head.sha;

// poll the check runs of the pr head until every required context answers
let verdict = "timeout";
const deadline = Date.now() + 20 * 60 * 1000;
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

const mergeRes = await api(`/pulls/${pr.number}/merge`, {
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

await api(`/git/refs/heads/${branch}`, { method: "DELETE" }).then(async (r) => {
  console.log("branch cleanup:", r.status === 204 ? "deleted" : "kept (" + r.status + ")");
});
console.log("VEHICLE_OK " + merge.sha);
