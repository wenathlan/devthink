#!/usr/bin/env node
// pinrefs.cjs — the security closure wave of the pinned supply chain: every
// github actions reference in the workflow battery resolves to its immutable
// commit sha (the moving tag rides as a trailing comment so the humans keep
// the readable version) and every literal docker FROM line in the family
// dockerfiles carries its registry digest. the variable FROM lines (the ARG
// driven ones) and the local composite actions stay untouched — only literal
// unpinned references move.
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..", "..");
const token = process.env.GH_TOKEN || "";

const api = "https://api.github.com";

async function ghJson(url) {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "devthink-pinrefs",
    },
  });
  return { status: res.status, body: await res.json().catch(() => ({})) };
}

const shaCache = new Map();

// resolves a repo ref (tag or branch) to the immutable commit sha; annotated
// tags dereference through the tag object to the commit they point at.
async function resolveRef(repo, ref) {
  const key = `${repo}@${ref}`;
  if (shaCache.has(key)) return shaCache.get(key);
  let sha = null;
  for (const kind of ["tags", "heads"]) {
    const { status, body } = await ghJson(`${api}/repos/${repo}/git/ref/${kind}/${encodeURIComponent(ref)}`);
    if (status !== 200 || !body.object) continue;
    let target = body.object.sha;
    if (body.object.type === "tag") {
      const deref = await ghJson(`${api}/repos/${repo}/git/tags/${target}`);
      if (deref.status === 200 && deref.body.object) target = deref.body.object.sha;
    }
    sha = target;
    break;
  }
  shaCache.set(key, sha);
  return sha;
}

const digestCache = new Map();

// resolves a docker hub image tag to its manifest list digest
async function resolveDigest(image) {
  if (digestCache.has(image)) return digestCache.get(image);
  const slash = image.lastIndexOf("/");
  const colon = image.lastIndexOf(":");
  const hasTag = colon > slash;
  const repo = hasTag ? image.slice(0, colon) : image;
  const tag = hasTag ? image.slice(colon + 1) : "latest";
  const full = repo.includes("/") ? repo : `library/${repo}`;
  let digest = null;
  try {
    const auth = await fetch(
      `https://auth.docker.io/token?service=registry.docker.io&scope=repository:${full}:pull`
    ).then((r) => r.json());
    const res = await fetch(`https://registry-1.docker.io/v2/${full}/manifests/${tag}`, {
      headers: {
        Authorization: `Bearer ${auth.token || ""}`,
        Accept: [
          "application/vnd.docker.distribution.manifest.list.v2+json",
          "application/vnd.oci.image.index.v1+json",
          "application/vnd.docker.distribution.manifest.v2+json",
          "application/vnd.oci.image.manifest.v1+json",
        ].join(", "),
      },
    });
    digest = res.headers.get("docker-content-digest");
  } catch {
    digest = null;
  }
  digestCache.set(image, digest);
  return digest;
}

async function pinWorkflows() {
  const dir = path.join(root, ".github", "workflows");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".yml") || f.endsWith(".yaml"));
  let pinned = 0;
  let skipped = 0;
  const failures = [];
  for (const file of files) {
    const full = path.join(dir, file);
    const lines = fs.readFileSync(full, "utf8").split("\n");
    let changed = false;
    for (let i = 0; i < lines.length; i += 1) {
      const m = lines[i].match(
        /^(\s*(?:-\s+)?uses:\s*)([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)@([A-Za-z0-9_.-]+)([^\r\n]*)(\r?)$/
      );
      if (!m) continue;
      const [, prefix, repo, ref, rawRest, cr] = m;
      if (/^[0-9a-f]{40}$/.test(ref)) {
        skipped += 1;
        continue;
      }
      const sha = await resolveRef(repo, ref);
      if (!sha || !/^[0-9a-f]{40}$/.test(sha)) {
        failures.push(`${file}: ${repo}@${ref}`);
        continue;
      }
      let body = rawRest.trim();
      if (!body.includes("#")) body = `${body} # ${ref}`.trim();
      lines[i] = `${prefix}${repo}@${sha} ${body}${cr}`;
      pinned += 1;
      changed = true;
    }
    if (changed) fs.writeFileSync(full, lines.join("\n"), "utf8");
  }
  console.log(`workflows: ${pinned} references pinned, ${skipped} already pinned`);
  return failures;
}

async function pinDockerfiles() {
  const apps = fs
    .readdirSync(root, { withFileTypes: true })
    .filter((e) => e.isDirectory() && fs.existsSync(path.join(root, e.name, "Dockerfile")))
    .map((e) => e.name);
  let pinned = 0;
  let skipped = 0;
  const failures = [];
  for (const app of apps) {
    const full = path.join(root, app, "Dockerfile");
    const lines = fs.readFileSync(full, "utf8").split("\n");
    // build stage aliases (FROM ... AS <name>) answer later FROM lines by
    // name alone — they are references into this file, never registry images
    const stages = new Set();
    for (const line of lines) {
      const as = line.match(/^FROM[^\r\n]*?\s+AS\s+([A-Za-z0-9_.-]+)/i);
      if (as) stages.add(as[1].toLowerCase());
    }
    let changed = false;
    for (let i = 0; i < lines.length; i += 1) {
      const m = lines[i].match(/^(FROM(?:\s+--platform=\$\{?BUILDPLATFORM\}?)?\s+)(\S+)([^\r\n]*)(\r?)$/);
      if (!m) continue;
      const [, prefix, image, rawRest, cr] = m;
      if (image.includes("@sha256:") || image.includes("$") || stages.has(image.toLowerCase())) {
        skipped += 1;
        continue;
      }
      const digest = await resolveDigest(image);
      if (!digest) {
        failures.push(`${app}/Dockerfile: ${image}`);
        continue;
      }
      let body = rawRest.trim();
      lines[i] = `${prefix}${image}@${digest}${body ? ` ${body}` : ""}${cr}`;
      pinned += 1;
      changed = true;
    }
    if (changed) fs.writeFileSync(full, lines.join("\n"), "utf8");
  }
  console.log(`dockerfiles: ${pinned} FROM lines digested, ${skipped} already pinned or variable`);
  return failures;
}

(async () => {
  if (!token) {
    console.error("GH_TOKEN is required (the credential fill of the local git helper)");
    process.exit(1);
  }
  const workflowFailures = await pinWorkflows();
  const dockerFailures = await pinDockerfiles();
  const failures = [...workflowFailures, ...dockerFailures];
  if (failures.length) {
    console.error("unresolved references (left untouched):");
    for (const f of failures) console.error(`  ${f}`);
    process.exit(2);
  }
  console.log("pin wave complete");
})();
