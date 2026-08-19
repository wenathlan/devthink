# DevThink workflow matrix

The workflow set uses DevThink terminology and preserves all existing responsibilities while concentrating repeated verification in one reusable workflow.

| Workflow | Trigger | Responsibility | Preserved output |
|---|---|---|---|
| `verify.yml` | Reusable call or manual dispatch | Bun checks, CLI tests, web type check and portable static build | Validation result |
| `ci.yml` | Pull request, `main` push, manual dispatch | Calls shared verification for ordinary changes | CI status |
| `pages.yml` | `main` push and manual dispatch | Builds `/web`, creates SPA fallback and deploys GitHub Pages | GitHub Pages artifact and deployment |
| `release.yml` | Matching `v*` tag or manual existing tag | Checks the tagged source, compiles Bun binaries and publishes the GitHub release | Linux x64, macOS arm64 and Windows x64 binaries plus checksums |
| `compatibility.yml` | Pull request, `main` push, manual dispatch | Verifies Node, Bun and portable static-web contracts | Compatibility status |
| `security.yml` | Pull request, `main` push, release, schedule and manual dispatch | Dependency review, pnpm audit, optional cargo audit, OSV, secret, filesystem and SBOM scans | Security evidence and SARIF/SBOM artifacts |
| `codeql.yml` | Pull request, `main` push and schedule | CodeQL analysis for actions, TypeScript and optional Rust | Code scanning results |
| `workflowlint.yml` | Pull request | Lints workflow and composite-action syntax | Workflow lint status |
| `targets.yml` | Release or manual dispatch | Emits plans for every declared release target and format | Target plan artifacts |
| Optional target workflows | Release or manual dispatch | Extension, container, desktop, mobile, GHCR, Maven, NuGet and RubyGems packaging | Runs only when its source manifest is present |
| `cachecleanup.yml` | Schedule or manual dispatch | Retains the cache cleanup capability | Cache maintenance result |

Release source is checked out at the requested tag. The workflow rejects a tag whose version does not match `package.json`, preventing a release artifact from being built from an unrelated branch head.

Non-workflow configuration now lives in its native operational location: `.gitlab-ci.yml`, `compose.yml`, `.github/dependabot.yml` and `.github/actions/`. Duplicate CI, Pages, release-validation and dependency-review logic is merged into the category workflows above, leaving `.github/workflows/` with only executable DevThink automations.
