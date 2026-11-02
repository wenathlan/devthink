/** Compares the permission set of the manifest against the versioned baseline of the previous release so the permission set never grows silently: the gate extracts every required, optional and optional host permission of the current root manifest, diffs them against the checked-in permission baseline of the permbaseline module — the container builds and the fresh checkouts carry no git history, so the versioned baseline stays the source the gate trusts — cross-checks the baseline against the git tag of the release it records whenever a repository is present, reports every added, removed and reordered permission, requires a written justification row in the permdiff justification table of docs/extensionpermissions.md for every addition, blocks the release when an unjustified permission appears or the set drifts inside the release the baseline stamps, and rewrites the baseline module in sync mode after the justification review. */
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import { permdiffbaseline as recordedbaseline } from "./tests/permbaseline.ts";

const execute = promisify(execFile);
const mode = process.argv[2] ?? "check";
const packagejson = JSON.parse(await readFile("package.json", "utf8"));
const release = String(packagejson.version);
const baselinepath = "tests/permbaseline.ts";
const justificationdoc = "docs/extensionpermissions.md";
const tableheading = "## permdiff justification table";
const failures: string[] = [];

/** Renders the permbaseline module text of one recorded report: the header, the interface and the dense record the gate imports stay one reviewable unit the sync rewrites whole, so the checked-in baseline and the regenerated baseline never drift in shape. */
function baselinemodule(report: {
  release: string;
  previous: string;
  source: string;
  added: string[];
  removed: string[];
  reordered: string[];
  justified: Array<{ entry: string; row: string }>;
  unjustified: string[];
  clean: boolean;
  permissionhash: string;
  permissionset: { required: string[]; optional: string[]; optionalhost: string[] };
}) {
  return `/** The versioned permission baseline of the permdiff gate as one dense typescript module: the recorded permission set of the release it stamps, the diff it answered against, its justification rows and the permission set hash the audit trail records. The container builds and the fresh checkouts carry no git history, so this checked-in baseline stays the source the gate trusts; the sync mode of tests/permdiff.ts rewrites this module after the justification review, and the readiness review reads it for the permission diff verdict. */

/** The permission baseline the gate records: the release it stamps, the previous release it diffed against, the source that resolved the comparison, the added, removed and reordered entries with their justification rows, the clean verdict and the permission set hash. */
export interface permdiffbaseline {
  release: string;
  previous: string;
  source: string;
  added: string[];
  removed: string[];
  reordered: string[];
  justified: Array<{ entry: string; row: string }>;
  unjustified: string[];
  clean: boolean;
  permissionhash: string;
  permissionset: { required: string[]; optional: string[]; optionalhost: string[] };
}

/** The recorded baseline of the ${report.release} release — ${report.clean ? `clean over ${report.previous}, zero added, zero removed, zero reordered` : `${report.added.length} added, ${report.removed.length} removed, ${report.reordered.length} reordered over ${report.previous}`}. */
export const permdiffbaseline: permdiffbaseline = ${JSON.stringify(report, null, 2)};
`;
}

/** Records one refusal of the permission diff gate. */
function refuse(message: string) {
  failures.push(message);
}

/** The resolved permission set of one manifest: the three tagged arrays with the joined entry list. */
export interface permissionset {
  required: string[];
  optional: string[];
  optionalhost: string[];
  entries: string[];
}

/** Reads the permission set of one manifest in its declared order: the required permissions, the optional permissions and the optional host permissions, each tagged with its set so a move between sets reads as one addition and one removal. */
export function permissionsetof(manifest: {
  permissions?: string[];
  optional_permissions?: string[];
  optional_host_permissions?: string[];
}): permissionset {
  const required = (manifest.permissions ?? []).map((permission) => `required:${permission}`);
  const optional = (manifest.optional_permissions ?? []).map((permission) => `optional:${permission}`);
  const optionalhost = (manifest.optional_host_permissions ?? []).map((permission) => `optionalhost:${permission}`);
  return { required, optional, optionalhost, entries: [...required, ...optional, ...optionalhost] };
}

/** Resolves the previous release version of one semver string. */
export function previousof(version: string): string {
  const [major, minor, patch] = version.split(".").map((part) => Number.parseInt(part, 10));
  if (patch > 0) return `${major}.${minor}.${patch - 1}`;
  if (minor > 0) return `${major}.${minor - 1}.0`;
  return `${major - 1}.0.0`;
}

/** Reports every added, removed and reordered permission between two resolved permission sets: an addition or a removal reads per set entry, and a reorder reads when the same set keeps its entries in a different order. */
export function diffpermissionsets(current: permissionset, previous: permissionset): {
  added: string[];
  removed: string[];
  reordered: string[];
} {
  const added = current.entries.filter((entry) => !previous.entries.includes(entry));
  const removed = previous.entries.filter((entry) => !current.entries.includes(entry));
  const reordered: string[] = [];
  for (const set of ["required", "optional", "optionalhost"] as const) {
    if (
      JSON.stringify(current[set]) !== JSON.stringify(previous[set]) &&
      current[set].every((entry) => previous[set].includes(entry)) &&
      previous[set].every((entry) => current[set].includes(entry))
    )
      reordered.push(set);
  }
  return { added, removed, reordered };
}

/** Resolves the manifest of one release: the git tag answers first, the release commit answers when the tag sits absent from the local clone, and the tag fetch from origin answers in the shallow continuous integration checkouts where neither the tag nor the history reached the clone; a tree without a repository — the container build — resolves nothing and the versioned baseline answers alone. */
async function releasemanifestof(version: string) {
  for (const resolver of [
    async () => ({
      source: `git tag v${version}`,
      text: (await execute("git", ["show", `v${version}:manifest.json`])).stdout,
    }),
    async () => {
      const log = (
        await execute("git", ["log", "--all", "--oneline", `--grep=release v${version}`, "-1"])
      ).stdout.trim();
      if (log === "") throw new Error(`no release commit of v${version}`);
      const commit = log.split(" ")[0] ?? "";
      return {
        source: `git commit ${commit}`,
        text: (await execute("git", ["show", `${commit}:manifest.json`])).stdout,
      };
    },
    async () => {
      /* the shallow checkout of the continuous integration lanes carries neither the tag nor the history; the fetch brings the tag ref of the release from origin so the cross-check never depends on the clone depth */
      await execute("git", ["fetch", "--no-tags", "origin", `refs/tags/v${version}:refs/tags/v${version}`]);
      return {
        source: `git tag v${version} fetched from origin`,
        text: (await execute("git", ["show", `v${version}:manifest.json`])).stdout,
      };
    },
  ]) {
    try {
      const resolved = await resolver();
      return { ...resolved, manifest: JSON.parse(resolved.text) };
    } catch {
      /* the next resolver answers */
    }
  }
  return undefined;
}

const currentmanifest = JSON.parse(await readFile("manifest.json", "utf8"));
const current = permissionsetof(currentmanifest);

/** Rebuilds the permission set of one recorded baseline: the three tagged arrays of the artifact fold back through the same manifest shape the set reader walks, so the recorded set and the live set speak one grammar. */
function baselinesetof(baseline: {
  permissionset?: { required?: string[]; optional?: string[]; optionalhost?: string[] };
}) {
  return permissionsetof({
    permissions: (baseline.permissionset?.required ?? []).map((entry) => entry.slice("required:".length)),
    optional_permissions: (baseline.permissionset?.optional ?? []).map((entry) => entry.slice("optional:".length)),
    optional_host_permissions: (baseline.permissionset?.optionalhost ?? []).map((entry) =>
      entry.slice("optionalhost:".length),
    ),
  });
}

/* the versioned permission baseline: the recorded permission set of the release it stamps, carried by the permbaseline module the gate imports. The container builds carry no git history, so the checked-in baseline stays the source the gate diffs against, and the git tag of the recorded release cross-checks the baseline whenever a repository is present. */
const baseline = recordedbaseline;
const baselineset = baselinesetof(baseline);

/* the added, removed and reordered permissions against the baseline. */
const { added, removed, reordered } = diffpermissionsets(current, baselineset);

/* the justification table of docs/extensionpermissions.md: every added permission needs its written justification row before the release ships. */
const justificationtext = await readFile(justificationdoc, "utf8").catch(() => undefined);
if (justificationtext === undefined)
  refuse(`The permdiff justification table lives in ${justificationdoc}; the document is missing.`);
const tablesection =
  justificationtext !== undefined && justificationtext.includes(tableheading)
    ? justificationtext.slice(justificationtext.indexOf(tableheading))
    : "";
if (added.length > 0 && tablesection === "")
  refuse(
    `The permdiff justification table heading is missing from ${justificationdoc}; every permission addition needs its written justification row.`,
  );
const justified: Array<{ entry: string; row: string }> = [];
const unjustified: string[] = [];
for (const entry of added) {
  const permission = entry.slice(entry.indexOf(":") + 1);
  const row = tablesection.split("\n").find((line) => line.startsWith("|") && line.includes(`\`${permission}\``));
  if (row === undefined) unjustified.push(entry);
  else justified.push({ entry, row: row.trim() });
}
if (unjustified.length > 0)
  refuse(
    `The permission addition${unjustified.length === 1 ? "" : "s"} ${unjustified.join(", ")} carry no justification row in the permdiff justification table; an unjustified permission blocks the release.`,
  );

/* the same-release drift rule: the baseline of the release the package carries means the recorded set and the live manifest must agree entry for entry, because a permission change inside a released version is exactly the silent growth the gate exists to refuse. */
if (
  baseline !== undefined &&
  baseline.release === release &&
  (added.length > 0 || removed.length > 0 || reordered.length > 0)
)
  refuse(
    `The permission set drifted inside the release ${release} the baseline stamps; restore the set or bump the version and run pnpm permdiff:sync after the justification review.`,
  );

/* the baseline cross-check: the git tag of the release the baseline records must mirror the recorded set whenever a repository resolves the tag, so a hand-edited baseline never passes as the released truth. */
if (baseline !== undefined && failures.length === 0) {
  const tagged = await releasemanifestof(baseline.release);
  if (
    tagged !== undefined &&
    JSON.stringify(permissionsetof(tagged.manifest).entries) !== JSON.stringify(baselineset.entries)
  )
    refuse(
      `The permission baseline of ${baseline.release} disagrees with the git tag v${baseline.release}; the checked-in baseline must mirror the released permission set.`,
    );
}

/* the permission set hash of the release: the audit trail records the same digest the background stamps at install. */
const permissionhash = createHash("sha256")
  .update([...new Set(current.entries)].sort().join("\n"))
  .digest("hex");

if (failures.length > 0) {
  for (const failure of failures) console.error(`PERMDIFF ${failure}`);
  process.exitCode = 1;
} else if (mode === "sync") {
  /* the sync rewrites the permbaseline module of the current release after the justification review: the recorded set, the diff it answered against, the source that resolved the comparison and the permission set hash the audit trail records. */
  const comparedrelease = baseline.release;
  const tagged = await releasemanifestof(comparedrelease);
  const report = {
    release,
    previous: comparedrelease,
    source: tagged?.source ?? "the versioned baseline of the previous release",
    added,
    removed,
    reordered,
    justified,
    unjustified,
    clean: added.length === 0 && removed.length === 0 && reordered.length === 0,
    permissionhash,
    permissionset: { required: current.required, optional: current.optional, optionalhost: current.optionalhost },
  };
  await writeFile(baselinepath, baselinemodule(report), "utf8");
  console.log(
    `Permission baseline of ${release} recorded against ${report.previous} (${report.source}): ${added.length} added, ${removed.length} removed, ${reordered.length === 0 ? "none" : reordered.join(", ")} reordered.`,
  );
  console.log(
    `Permission set hash: ${permissionhash} over ${new Set(current.entries).size} permission entries; the baseline landed in ${baselinepath}.`,
  );
} else if (baseline.release !== release) {
  console.error(
    `PERMDIFF The permission baseline records the release ${baseline.release} while the package carries ${release}; review the justification rows and run pnpm permdiff:sync after the release bump.`,
  );
  process.exitCode = 1;
} else {
  console.log(
    `Permission diff verified ${release} against the baseline of ${baseline.release}: ${added.length} added, ${removed.length} removed, ${reordered.length === 0 ? "none" : reordered.join(", ")} reordered.`,
  );
  console.log(
    `Permission set hash: ${permissionhash} over ${new Set(current.entries).size} permission entries; the baseline of ${baselinepath} carries the recorded set of the release.`,
  );
}
