/** Rejects missing release workflow controls without executing or publishing any artifact. */
import { readdir, readFile } from "node:fs/promises";
import { parseDocument } from "yaml";

const workflowdirectory = ".github/workflows";
const workflowfiles = (await readdir(workflowdirectory)).filter(file => /\.ya?ml$/i.test(file)).sort();
if (workflowfiles.length === 0) throw new Error("No GitHub Actions workflows were found.");
for (const file of workflowfiles) {
  const content = await readFile(`${workflowdirectory}/${file}`, "utf8");
  const document = parseDocument(content, { prettyErrors: true, uniqueKeys: true, version: "1.2" });
  if (document.errors.length) throw new Error(`${file} has invalid YAML: ${document.errors.map(error => error.message).join("; ")}`);
  const workflow = document.toJS();
  if (!workflow || typeof workflow !== "object" || !("on" in workflow) || !("jobs" in workflow)) throw new Error(`${file} must declare both on and jobs.`);
}

const checks = {
  "verify.yml": ["workflow_call:", "ref:", "pull_request:", "npm install --global", "pnpm test:chromium", "browser-actions/setup-chrome@v2.2.0", "chrome-version: stable", "CHROME_BIN: ${{ steps.chrome-for-testing.outputs.chrome-path }}", "oven-sh/setup-bun@v2.2.0", "bun dist/cli.js manifest", "pnpm validate", "node tests/apifreeze.mjs", "node tests/pentest.mjs", "node tests/cspaudit.mjs", "node tests/permdiff.mjs", "node tests/agentcert.mjs", "node tests/costcert.mjs", "node tests/doccheck.mjs", "node tests/sweep.mjs", "node tests/poolaudit.mjs", "node tests/matrixverify.mjs", "node tests/telemetryfree.mjs", "node tests/recipes.mjs", "node tests/readiness.mjs", "mvn --batch-mode", "dotnet pack", "upload-artifact", "node dist/cli.js planlint dist/fixtures/plans", "node dist/cli.js runworkflow", "--dryrun --quiet", "runtime: [node, bun, deno]", "denoland/setup-deno@", "deno check dist/deno.js", "bun x vitest run", "Require smoke against the cjs bundle", "Import smoke against the esm bundle", "Global smoke against the umd bundle", "Tarball content check over every mode file", "dist/index.cjs", "dist/devthink.umd.js", "dist/checksums.txt", "node tests/nativesmoke.mjs", "native install --profile", "native uninstall --profile", "NativeMessagingHosts", "Assert the native messaging permission stays absent from the required set", "dist/nativehost.template.json", "dist/companion.js", "Run the firefox prep step offline", "Run the addons linter over the xpipack output when installed", "Install firefox and run a load smoke on the xpipack build when available", "dist/devthink-firefox-${VERSION}.xpi", "Run the vsix package build", "Run the nuget pack dry run", "Run the maven pack dry run", "Build the container image and run its smoke", "docker build -f containerfile", "Assert the artifact manifest matches the built set", "dist/devthink-vscode-${VERSION}.vsix", "contentFiles/any/any/cli.js", "target/extension-${VERSION}.jar"],
  "release.yml": ["branches: [main]", "package.json", "CHANGELOG.md", "git tag -a", "pnpm sync:metadata", "find . -maxdepth 1 -type f ! -name SHA256SUMS.txt", "sort -z | xargs -0 sha256sum", "gh release create", "npm.pkg.github.com", "./release/wenathlan-extension-", "registry.npmjs.org", "secrets.NODE_AUTH_TOKEN || secrets.NPM_TOKEN", "npm whoami", "mvn --batch-mode", "dotnet nuget push", "ghcr.io", "release-complete", "npm pack ./distpackage --pack-destination release", "package/fixtures/example-org-pagestate.json", "package/checksums.txt", "package/gallery.json", "nested past two directories", "cp dist/devthink.umd.js dist/devthink.umd.min.js release/", "devthink-declarations-${VERSION}.zip", "package/index.d.ts", "package/bridge.js", "package/companion.js", "package/nativehost.template.json", "devthink-nativehost-${VERSION}.template.json", "dist/devthink-firefox-${VERSION}.xpi", "dist/devthink-safari-${VERSION}.zip", "package/crossbrowser.js", "package/pack.js", "package/http.js", "dist/devthink-vscode-${VERSION}.vsix", "dist/devthink-site-${VERSION}.zip", "environment: release-approval", "the bounded retry policy retries inside three attempts", "type=raw,value=stable", "docker buildx imagetools inspect", "devthink-sbom-${VERSION}.json", "devthink-attestations-${VERSION}.json", "devthink-artifactmanifest-${VERSION}.json", "actions/attest@", "gh release create \"${{ needs.assemble.outputs.tag }}\" --repo \"$GITHUB_REPOSITORY\" --draft", "gh release download", "sha256sum --check SHA256SUMS.txt", "gh release edit \"${{ needs.assemble.outputs.tag }}\" --repo \"$GITHUB_REPOSITORY\" --draft=false", "sbomcoveragecheck", "artifactmanifestcheck", "vsixmarketplacemetadatacheck"],
  "security.yml": ["dependency-review-action", "codeql-action", "trufflehog", "sbom-action"],
  "workflowlint.yml": ["reviewdog/action-actionlint@v1.73.2", "fail_level: error", "paths:", ".github/workflows/**"],
  "publishrubygems.yml": ["workflow_run:", "workflows: [\"release\"]", "ruby/setup-ruby@", "gem build extension.gemspec", "EXTENSION_VERSION=", "gem push extension-*.gem", "rubygems.pkg.github.com", "packages: write", "pre-deploy existence check"],
  "maintenance.yml": ["workflow_run:", "workflows: [security]", "schedule:", "allow_major_updates", "apply_cache_cleanup", "node-version: node", "node-version-file: .nvmrc", "npm install --global", "pnpm install --no-frozen-lockfile", "oven-sh/setup-bun@v2.2.0", "pnpm dependency:updates", "pnpm workflow:updates", "GH_TOKEN: ${{ github.token }}", "pnpm sync:metadata", "gh pr create", "actions: write", "NONDEFAULT_MAX_AGE_HOURS", "actions/caches"],
};
for (const [file, terms] of Object.entries(checks)) {
  const content = await readFile(`.github/workflows/${file}`, "utf8");
  for (const term of terms) if (!content.includes(term)) throw new Error(`${file} is missing required control: ${term}`);
}
for (const forbidden of ["migratelegacynuget", "Wenathlan.Devthink.Extension", "gh api --method DELETE"]) {
  if ((await readFile(`${workflowdirectory}/release.yml`, "utf8")).includes(forbidden)) throw new Error(`release.yml must not retain the consumed legacy-package deletion control: ${forbidden}`);
}
console.log(`Workflow YAML and controls verified for ${workflowfiles.length} files.`);
