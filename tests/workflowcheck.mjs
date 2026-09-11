/** Rejects missing release workflow controls without executing or publishing any artifact. */
import { readdir, readFile } from "node:fs/promises";
import { parseDocument } from "yaml";

const workflowdirectory = ".github/workflows";
const workflowfiles = (await readdir(workflowdirectory)).filter((file) => /\.ya?ml$/i.test(file)).sort();
if (workflowfiles.length === 0) throw new Error("No GitHub Actions workflows were found.");
for (const file of workflowfiles) {
  const content = await readFile(`${workflowdirectory}/${file}`, "utf8");
  const document = parseDocument(content, { prettyErrors: true, uniqueKeys: true, version: "1.2" });
  if (document.errors.length)
    throw new Error(`${file} has invalid YAML: ${document.errors.map((error) => error.message).join("; ")}`);
  const workflow = document.toJS();
  if (!workflow || typeof workflow !== "object" || !("on" in workflow) || !("jobs" in workflow))
    throw new Error(`${file} must declare both on and jobs.`);
}

/* The controls of the merged repository: the release workflow carries the
   rich draft → assemble → verify → publish chain of the DevThink Release
   (the 16-job extension lineage adapted to the standalone publish lanes),
   the verify workflow the 22-gate ladder of the release candidate, and the
   rubygems and maintenance workflows the workflow_run chains R1 and R3
   restored. The keys re-stamp the extension-era spelling to the DevThink
   layout: the tarball name, the maven artifact, the container file and the
   registry publish jobs answer under the merged identity. */
const checks = {
  "verify.yml": [
    "workflow_call:",
    "ref:",
    "pull_request:",
    "npm install --global",
    "bun run test:chromium",
    "browser-actions/setup-chrome@v2.2.0",
    "chrome-version: stable",
    "CHROME_BIN: ${{ steps.chrome-for-testing.outputs.chrome-path }}",
    "oven-sh/setup-bun@v2.2.0",
    "bun dist/cli.js manifest",
    "bun run check",
    "node tests/apifreeze.mjs",
    "node tests/pentest.mjs",
    "node tests/cspaudit.mjs",
    "node tests/permdiff.mjs",
    "node tests/agentcert.mjs",
    "node tests/costcert.mjs",
    "node tests/doccheck.mjs",
    "node tests/sweep.mjs",
    "node tests/poolaudit.mjs",
    "node tests/matrixverify.mjs",
    "node tests/telemetryfree.mjs",
    "node tests/recipes.mjs",
    "node tests/readiness.mjs",
    "mvn --batch-mode",
    "dotnet pack",
    "upload-artifact",
    "node dist/cli.js planlint dist/fixtures/plans",
    "node dist/cli.js runworkflow",
    "--dryrun --quiet",
    "runtime: [node, bun, deno]",
    "denoland/setup-deno@",
    "deno check dist/deno.js",
    "bun x vitest run",
    "Require smoke against the cjs bundle",
    "Import smoke against the esm bundle",
    "Global smoke against the umd bundle",
    "Tarball content check over every mode file",
    "dist/index.cjs",
    "dist/devthink.umd.js",
    "dist/checksums.txt",
    "node tests/nativesmoke.mjs",
    "native install --profile",
    "native uninstall --profile",
    "NativeMessagingHosts",
    "Assert the native messaging permission stays absent from the required set",
    "node tests/jsongate.mjs",
    "dist/nativehost.template.json",
    "dist/companion.js",
    "Run the firefox prep step offline",
    "Run the addons linter over the xpipack output when installed",
    "Install firefox and run a load smoke on the xpipack build when available",
    "dist/devthink-firefox-${VERSION}.xpi",
    "Run the vsix package build",
    "Run the nuget pack dry run",
    "Run the maven pack dry run",
    "Build the container image and run its smoke",
    "docker build -f Dockerfile",
    "Assert the artifact manifest matches the built set",
    "dist/devthink-vscode-${VERSION}.vsix",
    "contentFiles/any/any/cli.js",
    "target/devthink-${VERSION}.jar",
  ],
  "release.yml": [
    "package.json",
    "CHANGELOG.md",
    "refusing to ship an empty release body",
    "Tag $TAG does not point to the source being released.",
    "uses: ./.github/workflows/verify.yml",
    "node tests/build.mjs",
    "node tests/packageextension.mjs",
    "npm pack ./distpackage --pack-destination release",
    "package/fixtures/example-org-pagestate.json",
    "package/checksums.txt",
    "package/gallery.json",
    "package/bridge.js",
    "package/companion.js",
    "package/nativehost.template.json",
    "package/server.js",
    "package/crossbrowser.js",
    "package/pack.js",
    "package/http.js",
    "package/manifest.json",
    "package/index.d.ts",
    "nested past two directories",
    "wenathlan-devthink-${VERSION}.tgz",
    "dist/devthink-firefox-${VERSION}.xpi",
    "dist/devthink-safari-${VERSION}.zip",
    "dist/devthink-vscode-${VERSION}.vsix",
    "dist/devthink-site-${VERSION}.zip",
    "devthink-declarations-${VERSION}.zip",
    "cp dist/devthink.umd.js dist/devthink.umd.min.js release/",
    "devthink-nativehost-${VERSION}.template.json",
    "git archive --format=zip",
    "test -f dist/artifactmanifest.json",
    "release-complete",
    "./release/wenathlan-devthink-${RELEASE_VERSION}.tgz",
    "registry.npmjs.org",
    "secrets.NODE_AUTH_TOKEN || secrets.NPM_TOKEN",
    "npm whoami",
    "environment: release-approval",
    "the bounded retry policy retries inside three attempts",
    "actions/attest@",
    "devthink-sbom-${VERSION}.json",
    "devthink-attestations-${VERSION}.json",
    "devthink-artifactmanifest-${VERSION}.json",
    "sbomcoveragecheck",
    "artifactmanifestcheck",
    "vsixmarketplacemetadatacheck",
    "gh release create",
    'gh release create "${{ needs.assemble.outputs.tag }}" --repo "$GITHUB_REPOSITORY" --draft',
    "gh release upload",
    "gh release download",
    "sha256sum --check SHA256SUMS.txt",
    "find . -maxdepth 1 -type f ! -name SHA256SUMS.txt",
    "sort -z | xargs -0 sha256sum",
    'gh release edit "${{ needs.assemble.outputs.tag }}" --repo "$GITHUB_REPOSITORY" --draft=false',
  ],
  "security.yml": [
    "dependency-review-action",
    "codeql-action",
    "trufflehog",
    "sbom-action",
    "license-checker@25.0.1",
    "--onlyAllow=",
    "Verify repository license file",
    /* the absorbed governance lanes of the 2.0.16 grouping pass */
    "github/codeql-action/init@",
    "build-mode: none",
    "25 4 * * 3",
    "ossf/scorecard-action@v2.4.4",
    "publish_results: true",
    "::error file=SECURITY.md::",
    "major}.x",
    "reviewdog/action-actionlint@v1.73.4",
    "fail_level: error",
    /* the 2.0.18 gap closures: the layout contract */
    "one-workflow-file layout contract",
    /* the embedded build cache doctrine of the 2.0.16 pass */
  ],
  "ci.yml": [
    "runtime: [node, bun, deno]",
    "deno check dist/deno.js",
    "node-version: 24",
    "Typecheck on the active LTS line",
    "pnpm --dir web check",
    "uses: ./.github/workflows/verify.yml",
    "if: github.event_name == 'workflow_dispatch'",
    /* the 2.0.18 gap closure: the repository structure gate */
    "Repository flat structure contract",
    "nest past three directories",
    "duplicates another",
  ],
  "pages.yml": [
    "VITE_BASE_PATH",
    "404.html",
    ".nojekyll",
    "Boot smoke test (SPA entry and fallback page on a pinned port)",
    "python3 -m http.server",
    "python3 -m http.server \"${SMOKE_PORT}\"",
    "Lint the delivered html pages (python html.parser well-formedness)",
  ],
  "publish.yml": [
    /* the merged lane file of the 2.0.16 grouping pass */
    "workflow_run:",
    'workflows: ["DevThink Release"]',
    "devthink-publish-${{ github.event_name }}-${{ github.ref }}",
    /* the npmjs lane: the flat built tarball with the checksum signature and provenance */
    "npm pack ./distpackage --pack-destination release",
    "package/checksums.txt",
    "npm publish \"${tarball}\" --access public --provenance",
    "id-token: write",
    "the publish race resolved with the same built content",
    "npm dist-tag add",
    "retrying with backoff",
    /* the github npm lane */
    "npm.pkg.github.com",
    "npm publish \"${tarball}\" --registry=https://npm.pkg.github.com",
    "distpackage/package.json",
    /* the ghcr lane: the five-architecture index with the embedded cache and the latest realignment */
    "docker buildx imagetools inspect",
    "platforms: linux/arm64,linux/ppc64le,linux/s390x,linux/riscv64",
    "platforms: linux/amd64,linux/arm64,linux/ppc64le,linux/s390x,linux/riscv64",
    ". == [\"amd64\", \"arm64\", \"ppc64le\", \"riscv64\", \"s390x\"]",
    "echo \"${image}:latest\"",
    "drop the legacy referrers fallback tags",
    "all(startswith(\"sha256-\"))",
    /* the rubygems lane */
    "ruby/setup-ruby@",
    "gem build devthink.gemspec",
    "DEVTHINK_VERSION=",
    "gem push devthink-*.gem",
    "rubygems.pkg.github.com",
    "pre-deploy existence check",
    /* the desktop tauri lane: the portable checksum and the web tauri config */
    "shasum -a 256",
    "web/tauri.conf.json",
    "standalone: ${{ matrix.runner != 'macos-15-intel' }}",
    /* the closing sums umbrella: the needs chain over every lane */
    "Rebuild the release SHA256SUMS umbrella",
    "target-plans",
    "!cancelled()",
    /* the 2.0.18 gap closures: the approval environments, the digest pin lane */
    "environment: release-approval",
    "Pin the published container digest as release assets",
    "devthink-container.digest",
    "- digest",
  ],
  "maintenance.yml": [
    "workflow_run:",
    "workflows: [DevThink Security]",
    "schedule:",
    "allow_major_updates",
    "apply_cache_cleanup",
    "extension-mcp",
    "Retire the merged maven packages the single distribution replaced",
    "node-version-file: .nvmrc",
    "npm install --global",
    "bun install --frozen-lockfile",
    "oven-sh/setup-bun@v2.2.0",
    "bun run dependency:updates",
    "bun run workflow:updates",
    "GH_TOKEN: ${{ github.token }}",
    "bun run sync:metadata",
    "gh pr create",
    "actions: write",
    "NONDEFAULT_MAX_AGE_HOURS",
    "actions/caches",
    /* the 2.0.18 gap closures: the scoped retention and the second window */
    "WORKFLOW_RUN_SCOPED",
    "17 15 * * *",
  ],
};
for (const [file, terms] of Object.entries(checks)) {
  const content = await readFile(`.github/workflows/${file}`, "utf8");
  for (const term of terms)
    if (!content.includes(term)) throw new Error(`${file} is missing required control: ${term}`);
}
/* The 2.0.16 owner directive: the build cache never rides a registry
   package — the gha cache embeds inside the workflow runs (created, used,
   cleaned) and the devthink-buildcache package the 2.0.15 lanes pushed is
   gone from every workflow file. */
for (const file of workflowfiles) {
  const content = await readFile(`${workflowdirectory}/${file}`, "utf8");
  if (content.includes("devthink-buildcache"))
    throw new Error(`${file} must not reference the retired registry buildcache package; the build cache embeds inside the workflow run.`);
}

for (const forbidden of ["migratelegacynuget", "Wenathlan.Devthink.Extension", "gh api --method DELETE"]) {
  if ((await readFile(`${workflowdirectory}/release.yml`, "utf8")).includes(forbidden))
    throw new Error(`release.yml must not retain the consumed legacy-package deletion control: ${forbidden}`);
}
/* The publish-lane coordination of the merged repository: the registry
   channels live in their standalone release-triggered workflows, so the
   release workflow must not duplicate a lane another workflow owns — the
   release lane carries the assembly, the verification, the github release
   chain and the npmjs publication the npm gate demands, nothing else. */
const releasetext = await readFile(`${workflowdirectory}/release.yml`, "utf8");
for (const duplicated of [
  "mvn --batch-mode",
  "dotnet nuget push",
  "npm.pkg.github.com",
  "type=raw,value=stable",
  "docker buildx imagetools inspect",
  "gem build devthink.gemspec",
]) {
  if (releasetext.includes(duplicated))
    throw new Error(`release.yml must not duplicate the standalone publish lane control: ${duplicated}`);
}
for (const forbidden of [":latest", "wenathlan/extension", "wenathlan-gateway"]) {
  if (releasetext.includes(forbidden))
    throw new Error(`release.yml must answer under the DevThink identity; forbidden control: ${forbidden}`);
}
console.log(`Workflow YAML and controls verified for ${workflowfiles.length} files.`);
