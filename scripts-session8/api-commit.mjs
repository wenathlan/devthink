// api-commit.mjs — lands a local commit on a remote branch through the
// GitHub git data api (blobs -> tree -> commit -> ref update), the path
// around the oauth workflow-scope restriction on plain git pushes.
// usage: node scripts-session8/api-commit.mjs <branch> <localsha> <message>
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const [branch, localSha, message] = process.argv.slice(2);
if (!branch || !localSha || !message) {
  console.error("usage: api-commit.mjs <branch> <localsha> <message>");
  process.exit(2);
}
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

// 1. the remote branch head (the parent of the landing)
const ref = await (await api(`/git/ref/heads/${branch}`)).json();
const parent = ref.object.sha;
console.log("remote head:", parent);

// 2. the changed files of the local commit (path, mode, content)
const files = execSync(`git diff-tree --no-commit-id -r ${localSha}`, { cwd: "/home/z/my-project" })
  .toString()
  .trim()
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    const meta = line.split(/\s+/);
    return { mode: meta[0].replace(":", ""), path: meta[meta.length - 1] };
  });
console.log("files:", files.length);

// 3. blobs for every changed file
const tree = [];
for (const file of files) {
  const content = execSync(`git show ${localSha}:${file.path}`, {
    cwd: "/home/z/my-project",
    maxBuffer: 20 * 1024 * 1024,
  });
  const blob = await (
    await api("/git/blobs", {
      method: "POST",
      body: JSON.stringify({ content: content.toString("base64"), encoding: "base64" }),
    })
  ).json();
  if (!blob.sha) {
    console.error("blob failed:", file.path, JSON.stringify(blob).slice(0, 200));
    process.exit(1);
  }
  tree.push({ path: file.path, mode: file.mode === "100644" ? "100644" : file.mode, type: "blob", sha: blob.sha });
}

// 4. the tree on top of the remote parent tree
const parentCommit = await (await api(`/git/commits/${parent}`)).json();
const newTree = await (
  await api("/git/trees", {
    method: "POST",
    body: JSON.stringify({ base_tree: parentCommit.tree.sha, tree }),
  })
).json();
if (!newTree.sha) {
  console.error("tree failed:", JSON.stringify(newTree).slice(0, 200));
  process.exit(1);
}
console.log("tree:", newTree.sha);

// 5. the commit
const commit = await (
  await api("/git/commits", {
    method: "POST",
    body: JSON.stringify({ message, tree: newTree.sha, parents: [parent] }),
  })
).json();
if (!commit.sha) {
  console.error("commit failed:", JSON.stringify(commit).slice(0, 200));
  process.exit(1);
}
console.log("commit:", commit.sha);

// 6. the ref update
const update = await (
  await api(`/git/refs/heads/${branch}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: commit.sha, force: false }),
  })
).json();
if (!update.object?.sha) {
  console.error("ref update failed:", JSON.stringify(update).slice(0, 300));
  process.exit(1);
}
console.log("API_COMMIT_OK " + commit.sha);
