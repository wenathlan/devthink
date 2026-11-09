/** Restamps the family container images with their live registry digests and blocks every literal tag the scanner gate refuses (the pins answer the ladder, never a hand-written hash). */
import { readFile, writeFile } from "node:fs/promises";

const mode = process.argv[2] ?? "check";
if (!new Set(["check", "sync"]).has(mode)) throw new Error("Use check or sync.");

/* the stamped family set: the literal FROM lines the container lanes carry
 * (the nine alpine build legs — argan, cadria, debonair, forge, foundry,
 * getry, cobaia, stealthhead and the vault engine — share the node alpine
 * image, the devthink envelope rides the distroless binary runtime and the
 * debian trixie runtime, and the eight site homes plus the vault face lane
 * serve through the unprivileged nginx runtime) — the ARG-driven images of
 * the four-arch surface stay outside the stamp because their digests answer
 * the build's own resolution the way the runtime policy gate reads them.
 * the grammar below answers every FROM shape the family files carry: the
 * --platform=$BUILDPLATFORM prefix of the cross-arch static law (the build
 * legs that resolve the native build platform), the optional stage suffix
 * and the bare final-stage lines the vault runtime carries — and the
 * global match restamps EVERY line of the same image in one file (the
 * vault solbuild, enginedeps and final legs drift together, never the
 * first line alone the way the single-shot replace left the engine tree
 * answering two digests for one tag). the script runs from the devthink
 * application root, so the family envelopes answer through the ../ paths
 * exactly the way the metadata sync walks them. */
const stamps = [
  {
    file: "../argan/Dockerfile",
    image: "node:26-alpine",
    host: "registry-1.docker.io",
    repository: "library/node",
    tag: "26-alpine",
  },
  {
    file: "../cadria/Dockerfile",
    image: "node:26-alpine",
    host: "registry-1.docker.io",
    repository: "library/node",
    tag: "26-alpine",
  },
  {
    file: "../debonair/Dockerfile",
    image: "node:26-alpine",
    host: "registry-1.docker.io",
    repository: "library/node",
    tag: "26-alpine",
  },
  {
    file: "../forge/Dockerfile",
    image: "node:26-alpine",
    host: "registry-1.docker.io",
    repository: "library/node",
    tag: "26-alpine",
  },
  {
    file: "../foundry/Dockerfile",
    image: "node:26-alpine",
    host: "registry-1.docker.io",
    repository: "library/node",
    tag: "26-alpine",
  },
  {
    file: "../getry/Dockerfile",
    image: "node:26-alpine",
    host: "registry-1.docker.io",
    repository: "library/node",
    tag: "26-alpine",
  },
  {
    file: "../cobaia/Dockerfile",
    image: "node:26-alpine",
    host: "registry-1.docker.io",
    repository: "library/node",
    tag: "26-alpine",
  },
  {
    file: "../stealthhead/Dockerfile",
    image: "node:26-alpine",
    host: "registry-1.docker.io",
    repository: "library/node",
    tag: "26-alpine",
  },
  {
    file: "../vault/Dockerfile",
    image: "node:26-alpine",
    host: "registry-1.docker.io",
    repository: "library/node",
    tag: "26-alpine",
  },
  {
    file: "Dockerfile",
    image: "gcr.io/distroless/cc-debian12:nonroot",
    host: "gcr.io",
    repository: "distroless/cc-debian12",
    tag: "nonroot",
  },
  {
    file: "Dockerfile",
    image: "debian:trixie-slim",
    host: "registry-1.docker.io",
    repository: "library/debian",
    tag: "trixie-slim",
  },
  {
    file: "../argan/Dockerfile",
    image: "nginxinc/nginx-unprivileged:1.29-alpine",
    host: "registry-1.docker.io",
    repository: "nginxinc/nginx-unprivileged",
    tag: "1.29-alpine",
  },
  {
    file: "../cadria/Dockerfile",
    image: "nginxinc/nginx-unprivileged:1.29-alpine",
    host: "registry-1.docker.io",
    repository: "nginxinc/nginx-unprivileged",
    tag: "1.29-alpine",
  },
  {
    file: "../debonair/Dockerfile",
    image: "nginxinc/nginx-unprivileged:1.29-alpine",
    host: "registry-1.docker.io",
    repository: "nginxinc/nginx-unprivileged",
    tag: "1.29-alpine",
  },
  {
    file: "../forge/Dockerfile",
    image: "nginxinc/nginx-unprivileged:1.29-alpine",
    host: "registry-1.docker.io",
    repository: "nginxinc/nginx-unprivileged",
    tag: "1.29-alpine",
  },
  {
    file: "../foundry/Dockerfile",
    image: "nginxinc/nginx-unprivileged:1.29-alpine",
    host: "registry-1.docker.io",
    repository: "nginxinc/nginx-unprivileged",
    tag: "1.29-alpine",
  },
  {
    file: "../getry/Dockerfile",
    image: "nginxinc/nginx-unprivileged:1.29-alpine",
    host: "registry-1.docker.io",
    repository: "nginxinc/nginx-unprivileged",
    tag: "1.29-alpine",
  },
  {
    file: "../cobaia/Dockerfile",
    image: "nginxinc/nginx-unprivileged:1.29-alpine",
    host: "registry-1.docker.io",
    repository: "nginxinc/nginx-unprivileged",
    tag: "1.29-alpine",
  },
  {
    file: "../stealthhead/Dockerfile",
    image: "nginxinc/nginx-unprivileged:1.29-alpine",
    host: "registry-1.docker.io",
    repository: "nginxinc/nginx-unprivileged",
    tag: "1.29-alpine",
  },
  {
    file: "../vault/Dockerfile",
    image: "nginxinc/nginx-unprivileged:1.29-alpine",
    host: "registry-1.docker.io",
    repository: "nginxinc/nginx-unprivileged",
    tag: "1.29-alpine",
  },
];

const accepts =
  "application/vnd.oci.image.index.v1+json,application/vnd.docker.distribution.manifest.list.v2+json,application/vnd.oci.image.manifest.v1+json,application/vnd.docker.distribution.manifest.v2+json";
const escapeimage = (image: string) => image.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/* the family FROM grammar: an optional --platform flag prefix (the
 * containerlanes law seats the build-only legs behind the platform the
 * cross-arch static law resolves, and the pattern honors any platform
 * value the lanes carry), the literal image
 * the stamp owns, an optional digest pin, an optional stage suffix (the
 * bare final-stage lines the vault runtime carries) and the line end —
 * matched globally so every line of the same image in one file answers
 * the walk together. */
const linepattern = (image: string) =>
  new RegExp(
    `^FROM (--platform=\\S+ )?${escapeimage(image)}(?:@sha256:[0-9a-f]{64})?( AS [a-zA-Z0-9][a-zA-Z0-9_-]*)?[ \\t]*\\r?$`,
    "gm",
  );

/** resolves the digest a registry answers for a tag today — the anonymous pull token every public registry honors, then the manifest header the distribution API pins. */
async function digestof(stamp: { file: string; image: string; host: string; repository: string; tag: string }) {
  const scope = `repository:${stamp.repository}:pull`;
  const tokenurl =
    stamp.host === "gcr.io"
      ? `https://gcr.io/v2/token?service=gcr.io&${new URLSearchParams({ scope })}`
      : `https://auth.docker.io/token?${new URLSearchParams({ service: "registry.docker.io", scope })}`;
  const tokenresponse = await fetch(tokenurl);
  if (!tokenresponse.ok)
    throw new Error(`the registry token endpoint returned ${tokenresponse.status} for ${stamp.repository}`);
  const token = (await tokenresponse.json()).token;
  const manifestresponse = await fetch(`https://${stamp.host}/v2/${stamp.repository}/manifests/${stamp.tag}`, {
    headers: { authorization: `Bearer ${token}`, accept: accepts },
  });
  if (!manifestresponse.ok)
    throw new Error(`the registry manifest endpoint returned ${manifestresponse.status} for ${stamp.image}`);
  const digest = manifestresponse.headers.get("docker-content-digest");
  if (!/^sha256:[0-9a-f]{64}$/.test(digest ?? ""))
    throw new Error(`the registry did not answer a digest for ${stamp.image}`);
  return digest;
}

const stamped = [];
let drift = false;
for (const stamp of stamps) {
  /* check mode stays offline: the form gate (the containerpack and runtime
   * policy tests) enforces the pinned shape, the sync mode resolves the
   * live digests and moves the stamps. */
  const digest = mode === "sync" ? await digestof(stamp) : null;
  const source = await readFile(stamp.file, "utf8");
  const lines = source.match(linepattern(stamp.image)) ?? [];
  if (lines.length === 0) throw new Error(`${stamp.file} carries no literal FROM ${stamp.image} line to stamp.`);
  if (digest === null) {
    const unpinned = lines.filter((line) => !line.includes("@sha256:"));
    if (unpinned.length > 0) {
      throw new Error(
        `Non-breaking image digest updates are available. Run bun run digests:sync in a review branch (${stamp.file} carries an unpinned ${stamp.image}).`,
      );
    }
    stamped.push({ file: stamp.file, image: stamp.image, pinned: true, lines: lines.length });
    continue;
  }
  /* the restamp preserves the platform prefix and the stage name of every
   * line it moves (the replacement reads its own captures, never a fixed
   * FROM shape), so the cross-arch build legs keep their BUILDPLATFORM
   * resolution and the bare final stages stay bare. */
  const next = source.replace(
    linepattern(stamp.image),
    (_whole: string, platform: string = "", stage: string = "") => `FROM ${platform}${stamp.image}@${digest}${stage}`,
  );
  if (next !== source) {
    drift = true;
    if (mode === "sync") await writeFile(stamp.file, next);
  }
  stamped.push({ file: stamp.file, image: stamp.image, digest, changed: next !== source, lines: lines.length });
}
console.log(JSON.stringify({ mode, stamped, drift }, null, 2));
