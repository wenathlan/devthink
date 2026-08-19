# DevThink workflow matrix

The workflow set uses DevThink terminology and preserves all existing responsibilities while concentrating repeated verification in one reusable workflow.

| Workflow | Trigger | Responsibility | Preserved output |
|---|---|---|---|
| `verify.yml` | Reusable call or manual dispatch | Bun checks, CLI tests, web type check and portable static build | Validation result |
| `ci.yml` | Pull request, `main` push, manual dispatch | Calls shared verification for ordinary changes | CI status |
| `pages.yml` | `main` push and manual dispatch | Builds `/web`, creates SPA fallback and deploys GitHub Pages | GitHub Pages artifact and deployment |
| `release.yml` | Matching `v*` tag or manual existing tag | Checks the tagged source, compiles Bun binaries and publishes the GitHub release | Linux x64, macOS arm64 and Windows x64 binaries plus checksums |
| `dependency-review.yml` | Pull request | Reviews dependency changes before merge | Dependency review status |

Release source is checked out at the requested tag. The workflow rejects a tag whose version does not match `package.json`, preventing a release artifact from being built from an unrelated branch head.
