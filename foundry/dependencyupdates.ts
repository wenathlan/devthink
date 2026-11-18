/** Proposes stable direct dependency updates and blocks every breaking SemVer boundary unless explicitly allowed. The foundry gate wave moves the seat to the foundry root — the pipeline family owns the dependency ladder — while the walk keeps the cwd of the tree it audits: the devthink ladder runs it from the devthink root and the manifest it reads stays that root's own. */
import { readFile, writeFile } from "node:fs/promises";

const mode = process.argv[2] ?? "check";
if (!new Set(["check", "sync"]).has(mode)) throw new Error("Use check or sync.");
const allowmajors = process.argv.includes("--allow-majors");
const packagejson = JSON.parse(await readFile("package.json", "utf8")) as Record<string, Record<string, string>>;
const parseversion = (value: string) => {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(value.replace(/^[~^]/, ""));
  if (!match) throw new Error(`Unsupported dependency version: ${value}`);
  return match.slice(1).map(Number);
};
const breaking = (current: string, latest: string) => {
  const [major, minor] = parseversion(current);
  const [latestmajor, latestminor] = parseversion(latest);
  return major !== latestmajor || (major === 0 && minor !== latestminor);
};
/** declaredahead — the manifest rides a NEWER release than the registry
 * latest tag points at (the saddle lane publishes its rung stamps off the
 * latest tag). The ladder never proposes a step backwards: an ahead
 * manifest is satisfied, not drifted. */
const declaredahead = (current: string, latest: string) => {
  const [major, minor, patch] = parseversion(current);
  const [latestmajor, latestminor, latestpatch] = parseversion(latest);
  return (
    major > latestmajor ||
    (major === latestmajor && (minor > latestminor || (minor === latestminor && patch > latestpatch)))
  );
};
const skippedmajors = [];
const deadseats = [];
const next = structuredClone(packagejson);

/* the walkable seats collected in the manifest's own order — the skip
 * rules answer before any registry ride so the ladder only fetches the
 * seats the update pass can ever propose (the union blob's manifest walks
 * thousands of rows; the order the entries collect in preserves the
 * deterministic report the batteries read). */
const walkable: Array<{ section: string; name: string; declared: string }> = [];
for (const section of ["dependencies", "devDependencies", "optionalDependencies", "overrides"]) {
  for (const [name, declared] of Object.entries(packagejson[section] ?? {})) {
    /* the overrides seat answers the identical-map law the parity gate
       reads: the @wenathlan family specs ride the same rung the
       dependency groups carry. nested override objects (the xcode uuid
       nest keeps its override-only seat) never answer the registry
       ladder — only string specs walk. */
    if (typeof declared !== "string") continue;
    /* the local sibling packages the ownership law links (file:, link: and
     * workspace: specs the family monorepo carries — @wenathlan/vault,
     * @wenathlan/getry) never answer the registry ladder: their version is
     * the monorepo itself, so the update pass skips them instead of
     * parsing a path as a semver. */
    if (/^(file|link|workspace):/.test(declared)) continue;
    /* the npm alias seats (the websocket-server override answers
     * npm:ws@^8.18.0 — a name the registry never published beside the
     * real package the spec points at) never answer the registry
     * ladder: the alias pins the redirect target's floor the same way
     * the file, link and workspace specs pin the local siblings, and
     * the real seat walks the ladder under its own name where the
     * dependency groups carry it. */
    if (/^npm:/.test(declared)) continue;
    /* the @wenathlan family scope never answers the registry ladder at
     * all — registry specs beside the local links: the sibling floors
     * ride the rung convention the wave stamps carry (the published
     * floor one rung back), and the registry's latest dist-tag answers
     * the emergency train's highest semver, not the rung line — the
     * realign heal that walks beside every dispatch flips latest onto
     * the train the moment a 2.1.x envelope outranks the 2.0.x rungs,
     * and a family-wide proposal reading that tag drags every manifest
     * onto floors the rung never cut (the parity lockstep reddens with
     * half the family on the train and half on the line — the exact
     * drift the 2.0.174 proposal met). the rung machinery owns the
     * @wenathlan specs; the ladder walks the public registry alone. */
    if (name.startsWith("@wenathlan/")) continue;
    /* the frozen seats — the documented holds where the registry latest
     * carries a defect the family tree cannot ride (the ladder proposes
     * nothing for them until an unfreeze edit lands): the rolldown 1.3.x
     * line panics the vite build pass (rolldown_error
     * build_diagnostic.rs:328, "Formatting argument out of range") —
     * the ~1.2.x floor the eleven manifests declare stays seated until
     * a fixed release answers the panic; the freeze row retires the
     * moment that release lands (remove the name, re-run the sync). */
    if (name === "rolldown") continue;
    walkable.push({ section, name, declared });
  }
}

/* the registry phase — the concurrent ladder: one fetch per unique name
 * (a name the sections repeat rides a single ride), the pool walking
 * twenty seats abreast so the gate ladder answers in minutes the walk
 * the sequential era took a quarter hour to finish. the results land in
 * a cache the decision pass reads in the manifest's own order, so the
 * report stays byte-identical to the sequential walk's. */
const names = [...new Set(walkable.map((seat) => seat.name))];
const registrycache = new Map<string, { latest?: string; latestTime?: string; dead?: string }>();
const pool = names.slice();
const runners = Array.from({ length: Math.min(20, pool.length) }, async () => {
  for (let name = pool.shift(); name !== undefined; name = pool.shift()) {
    const response = await fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}`);
    /* the dead-seat law (the owner's no-removal doctrine): a package the
     * registry unpublished (the websocket-server seat the nine-repo union
     * carried was unpublished in 2014 — 404 with an Unpublished body) keeps
     * its manifest seat with a notice instead of reddening the ladder,
     * because the union law never removes a prior dependency; a transient
     * registry error (5xx and friends) still fails hard — only the
     * definitive unpublish answers the dead seat. */
    if (response.status === 404) {
      registrycache.set(name, { dead: "unpublished" });
      continue;
    }
    if (!response.ok) throw new Error(`npm registry returned ${response.status} for ${name}`);
    const registry = await response.json();
    let latest: string | undefined = registry?.["dist-tags"]?.latest;
    /* a prerelease riding the latest dist-tag (prisma ships release candidates there) never
       proposes: walk the published versions back to the newest stable release instead, so the
       ladder only ever stamps a published stable. */
    if (!/^\d+\.\d+\.\d+$/.test(latest ?? "")) {
      const stable = Object.keys(registry?.versions ?? {})
        .filter((version) => /^\d+\.\d+\.\d+$/.test(version))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      latest = stable.at(-1);
    }
    if (!/^\d+\.\d+\.\d+$/.test(latest ?? "")) {
      registrycache.set(name, { dead: "no stable version" });
      continue;
    }
    /* THE MINIMUM AGE LAW (the 2.0.186 cure): the resolved latest carries its
     * publish time beside it — the decision pass below only proposes a seat
     * the registry has carried a full seven-day week (the npm minimum the
     * house doctrine seats; the 3d bun/pnpm/uv rows ride their own lanes),
     * so a version published inside the quarantine window never reddens the
     * gate the way the daily-tagged packages (@cloudflare/workers-types and
     * the date-stamped family) reddened every check the moment the registry
     * moved. the treadmill closes: the gate demands exactly the seats a
     * review branch can actually land. */
    registrycache.set(name, { latest, latestTime: latest ? registry?.time?.[latest] : undefined });
  }
});
await Promise.all(runners);

/* the decision pass — the manifest's own order walks the cached answers,
 * every rule the sequential ladder carried answering the same seat it
 * always answered. */
for (const { section, name, declared } of walkable) {
  const answer = registrycache.get(name);
  if (answer?.dead !== undefined) {
    deadseats.push({ name, reason: answer.dead });
    continue;
  }
  const latest = answer?.latest as string;
  /* THE MINIMUM AGE LAW (the 2.0.186 cure): the quarantine window — an
   * update published inside seven days stays unseen by the ladder (the
   * doctrine the minimum-ages law always carried: 7d npm, 3d bun/pnpm/uv),
   * so the gate check stops demanding registry seats no review branch can
   * land before the registry moves again. */
  const latestTime = answer?.latestTime as string | undefined;
  if (latestTime && Date.now() - Date.parse(latestTime) < 7 * 24 * 60 * 60 * 1000) continue;
  if (breaking(declared, latest) && !allowmajors) {
    skippedmajors.push({ name, current: declared, latest });
    continue;
  }
  if (declaredahead(declared, latest)) {
    /* the manifest is ahead of the registry latest tag: nothing to propose
     * — a downgrade is never an update. */
    continue;
  }
  next[section][name] = `${declared.startsWith("~") ? "~" : "^"}${latest}`;
}
const current = `${JSON.stringify(packagejson, null, 2)}\n`;
const rendered = `${JSON.stringify(next, null, 2)}\n`;
const drift = current !== rendered;
if (drift && mode === "sync") await writeFile("package.json", rendered);
if (drift && mode === "check")
  throw new Error("Non-breaking dependency updates are available. Run pnpm dependency:updates in a review branch.");
console.log(JSON.stringify({ mode, allowmajors, skippedmajors, deadseats, drift }, null, 2));
