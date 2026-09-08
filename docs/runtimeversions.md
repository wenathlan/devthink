# Runtime and Tooling Version Policy

This document records the externally verified version baseline selected for the next Devthink maintenance patch. It distinguishes the current stable release from compatibility policy: a declared engine range accepts future non-breaking updates within the selected major but does not claim compatibility with an untested future major.

| Component | Verified public current version | Project policy | Source |
| --- | --- | --- | --- |
| Node.js | 26.8.1, released 2026-08-26; latest active LTS remains 24.20.0. | Pin `.nvmrc` and the release container to 26.8.1; permit only 26.x in `engines`. | [Node release index][1] |
| npm | 12.0.2 | Declare and validate the 12.x compatibility line; install that exact npm version in CI before packaging. | [npm registry][2] |
| pnpm | 11.24.0 | Keep the exact Corepack package-manager pin. It already equals the current registry release. | [pnpm registry][3] |
| Bun | 1.4.0 | Declare the 1.x compatibility line and run a dedicated package-install smoke check in CI. It is not substituted for Node/pnpm release tooling. | [Bun registry][4] |

## Maintenance rules

The maintenance proposal obtains direct package versions from the npm registry, Node releases from the official Node index and mutable GitHub Action tags from each action's official GitHub release. It opens a pull request rather than merging. Any change of major line requires an explicit `allow_major_updates` choice; a declared new major is tested before the pull request is created.

The project uses Node and pnpm for canonical builds. Bun is a separately verified compatibility target, not a hidden replacement package manager. This preserves deterministic lockfile behavior and avoids claiming interoperability merely because an engine field is present. Node 26 images no longer include Corepack, so the release container derives the npm minimum and exact pnpm pin from `package.json`, installs both explicitly and verifies them before a frozen-lockfile installation.

## Local verification evidence

On 2026-08-27, the repository completed its full validation with Node 26.8.1, npm 12.0.2 and pnpm 11.24.0. Bun 1.4.0 was installed only in a temporary directory with its package-specific installation script explicitly approved, then successfully ran `bun dist/cli.js manifest` against the compiled Devthink CLI. The temporary directory was deleted after the smoke test. The committed workflow repeats this check through the official Bun setup action.

## References

[1]: https://nodejs.org/dist/index.json "Node.js release index"
[2]: https://registry.npmjs.org/npm/latest "npm latest package metadata"
[3]: https://registry.npmjs.org/pnpm/latest "pnpm latest package metadata"
[4]: https://registry.npmjs.org/bun/latest "Bun latest package metadata"

## Version catalog

The catalog records the current devthink release and the runtime baselines every artifact of that release was built and verified against. The release metadata synchronization regenerates the table on every release and the maintenance workflow re-runs the synchronization after each release, so the catalog never drifts from package.json.

| Entry | Version |
| --- | --- |
| devthink release | 2.0.1 |
| node baseline | 26.8.1 |
| npm baseline | 12.0.2 |
| package manager baseline | 1.4.2 |
| bun baseline | 1.4.2 |
