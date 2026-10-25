/** Restamps the family container images with their live registry digests and blocks every literal tag the scanner gate refuses (the pins answer the ladder, never a hand-written hash). */
import { readFile, writeFile } from "node:fs/promises";

const mode = process.argv[2] ?? "check";
if (!new Set(["check", "sync"]).has(mode)) throw new Error("Use check or sync.");

/* the stamped family set: the literal FROM lines the container lanes carry
 * (the argan, cadria and debonair build legs share the node alpine image,
 * the devthink envelope rides the distroless binary runtime and the debian
 * trixie runtime) — the ARG-driven images of the four-arch surface stay
 * outside the stamp because their digests answer the build's own
 * resolution the way the runtime policy gate reads them. the script runs
 * from the devthink application root, so the family envelopes answer
 * through the ../ paths exactly the way the metadata sync walks them. */
const stamps = [
  { file: "../argan/Dockerfile", image: "node:26-alpine", host: "registry-1.docker.io", repository: "library/node", tag: "26-alpine" },
  { file: "../cadria/Dockerfile", image: "node:26-alpine", host: "registry-1.docker.io", repository: "library/node", tag: "26-alpine" },
  { file: "../debonair/Dockerfile", image: "node:26-alpine", host: "registry-1.docker.io", repository: "library/node", tag: "26-alpine" },
  { file: "Dockerfile", image: "gcr.io/distroless/cc-debian12:nonroot", host: "gcr.io", repository: "distroless/cc-debian12", tag: "nonroot" },
  { file: "Dockerfile", image: "debian:trixie-slim", host: "registry-1.docker.io", repository: "library/debian", tag: "trixie-slim" },
];

const accepts = "application/vnd.oci.image.index.v1+json,application/vnd.docker.distribution.manifest.list.v2+json,application/vnd.oci.image.manifest.v1+json,application/vnd.docker.distribution.manifest.v2+json";
const escapeimage = (image) => image.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const linepattern = (image) => new RegExp(`^FROM ${escapeimage(image)}(?:@sha256:[0-9a-f]{64})? AS `, "m");

/** resolves the digest a registry answers for a tag today — the anonymous pull token every public registry honors, then the manifest header the distribution API pins. */
async function digestof(stamp) {
  const scope = `repository:${stamp.repository}:pull`;
  const tokenurl = stamp.host === "gcr.io"
    ? `https://gcr.io/v2/token?service=gcr.io&${new URLSearchParams({ scope })}`
    : `https://auth.docker.io/token?${new URLSearchParams({ service: "registry.docker.io", scope })}`;
  const tokenresponse = await fetch(tokenurl);
  if (!tokenresponse.ok) throw new Error(`the registry token endpoint returned ${tokenresponse.status} for ${stamp.repository}`);
  const token = (await tokenresponse.json()).token;
  const manifestresponse = await fetch(`https://${stamp.host}/v2/${stamp.repository}/manifests/${stamp.tag}`, { headers: { authorization: `Bearer ${token}`, accept: accepts } });
  if (!manifestresponse.ok) throw new Error(`the registry manifest endpoint returned ${manifestresponse.status} for ${stamp.image}`);
  const digest = manifestresponse.headers.get("docker-content-digest");
  if (!/^sha256:[0-9a-f]{64}$/.test(digest ?? "")) throw new Error(`the registry did not answer a digest for ${stamp.image}`);
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
  if (!linepattern(stamp.image).test(source)) throw new Error(`${stamp.file} carries no literal FROM ${stamp.image} line to stamp.`);
  if (digest === null) {
    if (!new RegExp(`^FROM ${escapeimage(stamp.image)}@sha256:[0-9a-f]{64} AS `, "m").test(source)) {
      throw new Error(`Non-breaking image digest updates are available. Run bun run digests:sync in a review branch (${stamp.file} carries an unpinned ${stamp.image}).`);
    }
    stamped.push({ file: stamp.file, image: stamp.image, pinned: true });
    continue;
  }
  const next = source.replace(linepattern(stamp.image), `FROM ${stamp.image}@${digest} AS `);
  if (next !== source) {
    drift = true;
    if (mode === "sync") await writeFile(stamp.file, next);
  }
  stamped.push({ file: stamp.file, image: stamp.image, digest, changed: next !== source });
}
console.log(JSON.stringify({ mode, stamped, drift }, null, 2));
