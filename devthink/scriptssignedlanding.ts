// signedlanding.ts — the github signed landing vehicle of the family: every
// wave the owner lands through this script reaches main as a commit github
// itself created through the squash merge of a dated pull request, so the
// commit carries the official github web flow signature — the verified badge
// the 2.0.118 era answered and the direct git pushes of the later eras lost,
// because a pushed local commit can never carry it: the repository token owns
// no signing key registered on the account, the contents api answers unsigned
// commits, and only the commits github creates server side (the squash merge
// among them) receive the web flow key. the vehicle respects the staging the
// operator already carries (a non empty index lands exactly what it holds),
// stages the whole tree only when the index answers empty (the ignore file
// keeps the sandbox artifacts out), commits the net state of the index
// against origin main on a dated automation branch, pushes the
// branch beside its archive tag, opens the pull request, squashes it onto
// main with the owner token (the admin merge the maintenance ladder rides —
// enforce admins stays off, so the squash never waits for the review policy),
// deletes the branch the archive tag already preserves, advances local main to
// the landed head without rewriting a single file on disk and refuses to
// answer success until the github api itself
// confirms the landed commit verified true. file modes ride the branch
// verbatim (the graphql file addition lane would flatten the executable tree
// the house keeps), and the vehicle verifies the landed tree equals the
// staged tree before it answers. the optional wait flag holds the squash until
// every check run of the pull request answers complete and green, the way the
// maintenance rungs walk their pipeline before they land.
// usage: bun devthink/scriptssignedlanding.ts "<headline>" ["<body>"] [--name <label>] [--wait] [--dry]
import { spawnSync } from "node:child_process";

interface GitResult {
  ok: boolean;
  out: string;
  err: string;
}

interface Verification {
  verified: boolean;
  reason: string;
}

interface CommitView {
  sha: string;
  commit: {
    message: string;
    verification: Verification;
    committer: { name: string } | null;
  };
}

interface PullView {
  number: number;
  html_url: string;
  head: { sha: string };
  mergeable_state?: string;
}

interface CheckRunsView {
  total_count: number;
  check_runs: Array<{ status: string; conclusion: string | null; name: string }>;
}

interface MergeResponse {
  sha: string | null;
  merged: boolean;
  message: string;
}

const args = process.argv.slice(2);
const dry = args.includes("--dry");
const wait = args.includes("--wait");
const nameFlagAt = args.indexOf("--name");
const labelArg = nameFlagAt >= 0 ? args[nameFlagAt + 1] : undefined;
const positional = args.filter((a, i) => a && !a.startsWith("--") && (i !== nameFlagAt + 1 || nameFlagAt < 0));
const headline = positional[0];
const body = positional[1] ?? "";
if (!headline) {
  console.error(
    'usage: bun devthink/scriptssignedlanding.ts "<headline>" ["<body>"] [--name <label>] [--wait] [--dry]',
  );
  process.exit(1);
}

const git = (cmdArgs: string[]): GitResult => {
  const r = spawnSync("git", cmdArgs, { cwd: process.cwd(), encoding: "utf8", maxBuffer: 1024 * 1024 * 1024 });
  return { ok: r.status === 0, out: (r.stdout ?? "").trim(), err: (r.stderr ?? "").trim() };
};
const must = (cmdArgs: string[], context: string): string => {
  const r = git(cmdArgs);
  if (!r.ok) throw new Error(`${context} refused: git ${cmdArgs.join(" ")} answered ${r.err || r.out}`);
  return r.out;
};

const root = must(["rev-parse", "--show-toplevel"], "the root resolve");
const gitCwd = { cwd: root } as { cwd: string };
const gitAt = (cmdArgs: string[]): GitResult => {
  const r = spawnSync("git", cmdArgs, { ...gitCwd, encoding: "utf8", maxBuffer: 1024 * 1024 * 1024 });
  return { ok: r.status === 0, out: (r.stdout ?? "").trim(), err: (r.stderr ?? "").trim() };
};
const mustAt = (cmdArgs: string[], context: string): string => {
  const r = gitAt(cmdArgs);
  if (!r.ok) throw new Error(`${context} refused: git ${cmdArgs.join(" ")} answered ${r.err || r.out}`);
  return r.out;
};

const remote = mustAt(["config", "--get", "remote.origin.url"], "the remote read");
const tokenMatch = remote.match(/x-access-token:([^@]+)@github\.com/) ?? null;
const token = process.env.OWNER_PAT ?? (tokenMatch ? tokenMatch[1] : "");
const slugMatch = remote.match(/github\.com[:/]([^/]+\/[^/.]+)(?:\.git)?$/);
if (!slugMatch) throw new Error("the remote url carries no github owner repo slug");
const slug = slugMatch[1];
if (!token) throw new Error("no token answers: neither the OWNER_PAT environment nor the remote url carries one");

const api = async (method: string, path: string, payload?: unknown): Promise<Record<string, unknown>> => {
  const res = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      accept: "application/vnd.github+json",
      "content-type": "application/json",
      "user-agent": "devthink signed landing",
    },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
  const text = await res.text();
  const json: Record<string, unknown> = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  if (!res.ok) {
    const err = new Error(`github api ${method} ${path} answered ${res.status}: ${text.slice(0, 600)}`);
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }
  return json;
};

const labelRaw = (labelArg ?? "signedlanding").toLowerCase();
const label = labelRaw.replace(/[^a-z0-9.]/g, ".");
const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15);
const branch = `automation/${label}-${stamp}`;

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const walk = async (): Promise<void> => {
  // the fetch and sync first doctrine: the vehicle never lands over a stale
  // view of the remote head.
  mustAt(["fetch", "--prune", "origin"], "the fetch");
  const current = mustAt(["symbolic-ref", "--short", "HEAD"], "the branch read");
  if (current !== "main") throw new Error(`the vehicle lands from main only and the tree answers ${current}`);
  const remoteHead = mustAt(["rev-parse", "origin/main"], "the remote head read");
  const ahead = mustAt(["rev-list", "--count", `origin/main..HEAD`], "the ahead count");
  if (Number(ahead) > 0) {
    console.log(`local main is ahead by ${ahead} commits: their net tree effect folds into the signed landing`);
  }
  console.log(`the landing walks from ${remoteHead.slice(0, 8)} on ${slug}`);
  const preStaged = gitAt(["diff", "--cached", "--name-only"]).out;
  if (preStaged.length > 0) {
    console.log(
      `the index already carries ${preStaged.split("\n").length} staged paths: the landing respects the operator staging`,
    );
  } else {
    mustAt(["add", "-A"], "the stage");
  }

  const rawDiff = gitAt(["diff", "--cached", "--no-renames", "--name-status", "-z", "origin/main"]);
  if (!rawDiff.ok) throw new Error(`the changeset read refused: ${rawDiff.err}`);
  const pieces = rawDiff.out.split("\0").filter((p) => p.length > 0);
  const changed: Array<{ status: string; path: string }> = [];
  for (let i = 0; i < pieces.length; i += 2) {
    changed.push({ status: pieces[i], path: pieces[i + 1] ?? "" });
  }
  if (changed.length === 0 && Number(ahead) === 0) {
    console.log("nothing to land: the index answers no change against origin main");
    process.exit(0);
  }
  const added = changed.filter((c) => c.status !== "D").length;
  const removed = changed.filter((c) => c.status === "D").length;
  console.log(`the wave carries ${changed.length} paths (${added} added or modified, ${removed} removed)`);
  if (dry) {
    for (const c of changed) console.log(`  ${c.status}\t${c.path}`);
    console.log("dry walk: nothing landed");
    process.exit(0);
  }

  mustAt(["switch", "-c", branch], "the branch cut");
  const message = body ? `${headline}\n\n${body}` : headline;
  mustAt(["commit", "-m", message], "the wave commit");
  const branchSha = mustAt(["rev-parse", "HEAD"], "the branch head read");
  const branchTree = mustAt(["rev-parse", `${branch}^{tree}`], "the branch tree read");
  mustAt(["tag", `archive/${branch}`], "the archive tag");
  mustAt(["push", "origin", `refs/heads/${branch}`, `refs/tags/archive/${branch}`], "the branch push");
  console.log(`the branch ${branch} answers ${branchSha} beside its archive tag`);

  const prBody =
    (body ? `${body}\n\n` : "") +
    "The signed landing vehicle opens this pull request so the squash merge answers the official github signature: the landed commit is created server side, carries the web flow key and shows the verified badge. The archive tag preserves the branch after the squash deletes it.";
  const pr = (await api("POST", `/repos/${slug}/pulls`, {
    title: headline,
    head: branch,
    base: "main",
    body: prBody,
  })) as unknown as PullView;
  console.log(`the pull request ${pr.number} answers ${pr.html_url}`);

  if (wait) {
    let waited = 0;
    for (;;) {
      const checks = (await api("GET", `/repos/${slug}/commits/${branchSha}/check-runs`)) as unknown as CheckRunsView;
      const running = checks.check_runs.filter((c) => c.status !== "completed").length;
      const failed = checks.check_runs.filter(
        (c) =>
          c.status === "completed" &&
          c.conclusion !== null &&
          c.conclusion !== "success" &&
          c.conclusion !== "skipped" &&
          c.conclusion !== "neutral",
      );
      if (checks.total_count > 0 && running === 0) {
        if (failed.length > 0) {
          throw new Error(
            `the pull request pipeline answered red: ${failed.map((f) => `${f.name} (${f.conclusion})`).join(", ")}`,
          );
        }
        break;
      }
      if (waited >= 40 * 60 * 1000)
        throw new Error("the pull request pipeline never answered complete within the wait window");
      await sleep(30000);
      waited += 30000;
    }
    console.log("the pull request pipeline answered green");
  }

  const mergePayload = {
    merge_method: "squash",
    commit_title: headline,
    commit_message: body,
  };
  let landed = "";
  try {
    const merged = (await api(
      "PUT",
      `/repos/${slug}/pulls/${pr.number}/merge`,
      mergePayload,
    )) as unknown as MergeResponse;
    if (!merged.merged || !merged.sha) throw new Error(`the squash merge answered ${merged.message}`);
    landed = merged.sha;
  } catch (mergeError) {
    const status = (mergeError as Error & { status?: number }).status;
    if (status === 405) {
      // the base moved under the pull request or the policy refused the
      // merge: one rebase walk answers the diverged case, a second refusal
      // surfaces the policy message untouched.
      mustAt(["fetch", "origin", "main"], "the refetch");
      mustAt(["rebase", "origin/main"], "the rebase walk");
      mustAt(["push", "--force-with-lease", "origin", `refs/heads/${branch}`], "the rebase push");
      const retry = (await api(
        "PUT",
        `/repos/${slug}/pulls/${pr.number}/merge`,
        mergePayload,
      )) as unknown as MergeResponse;
      if (!retry.merged || !retry.sha) throw new Error(`the squash merge retry answered ${retry.message}`);
      landed = retry.sha;
    } else {
      throw mergeError;
    }
  }
  console.log(`the squash landed ${landed} on main`);

  await api("DELETE", `/repos/${slug}/git/refs/heads/${encodeURIComponent(branch)}`).catch((deleteError: unknown) => {
    console.log(`the branch delete answered soft: ${(deleteError as Error).message}`);
  });
  mustAt(["fetch", "--prune", "origin"], "the landed fetch");
  // the main ref moves while the tree still answers the branch (the trees
  // equal, so the switch that follows never rewrites a file on disk), and
  // the mixed reset never runs: a switch to a moved ref with the same tree
  // keeps the landed content and the unstaged leftovers untouched.
  mustAt(["branch", "-f", "main", "origin/main"], "the main advance");
  mustAt(["switch", "main"], "the main switch");
  mustAt(["branch", "-D", branch], "the local branch clear");
  const landedTree = mustAt(["rev-parse", `${landed}^{tree}`], "the landed tree read");
  if (landedTree !== branchTree) {
    throw new Error(`the landed tree ${landedTree} does not equal the staged tree ${branchTree}`);
  }

  const landedView = (await api("GET", `/repos/${slug}/commits/${landed}`)) as unknown as CommitView;
  const verification = landedView.commit.verification;
  if (!verification.verified) {
    throw new Error(`the landed commit ${landed} answers no verified signature: reason ${verification.reason}`);
  }
  console.log(
    `the landing ${landed} carries the github signature: verified ${verification.verified}, reason ${verification.reason}, committer ${landedView.commit.committer?.name ?? "unknown"}`,
  );
  console.log(`the wave is live: https://github.com/${slug}/commit/${landed}`);
};

try {
  await walk();
} catch (landError) {
  console.error(`the signed landing refused: ${(landError as Error).message}`);
  process.exit(1);
}
