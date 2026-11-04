# DISTRIBUTIONS — the six-seat distribution ladder of the wenathlan family

<!--
  DISTRIBUTIONS.md — the distribution catalog of the monorepo.

  @file      .github/DISTRIBUTIONS.md
  @wave      W10-DISTPACK (PR14 — the distpack ladder)
  @version   2.0.157
  @summary   Every application of the family answers six independent
             distribution seats — NuGet, Maven, Docker/Container, npm
             (npmjs), Registry (GitHub Packages) and RubyGems — and every
             seat carries the synchronized envelope version resolved from
             the package.json of its app at build time.
  @law       No lane hardcodes the version: every publish job resolves the
             release tag against the app's package.json and overrides the
             seat's default stamp at pack time (-p:PackageVersion for
             NuGet, -Drevision for Maven, the <APP>_VERSION environment
             for RubyGems, the manifest itself for npm).
  @counts    59 registry packages after the distpack ladder (the 66
             theoretical seats minus the deltas documented below).
  @see       .github/workflows/publish.yml (the lanes),
             devthink/release.ts (the lockstep surface).
-->

## The six seats per application

| App | NuGet (nuget.pkg.github.com) | Maven (maven.pkg.github.com) | Container (ghcr.io / release archive) | npm (npmjs.org) | Registry npm (npm.pkg.github.com) | RubyGems (rubygems.pkg.github.com) |
|-----|----|----|----|----|----|----|
| devthink | `nuget` lane | `maven` lane | `ghcr` lane | `npmjs` lane | `githubnpm` lane | `rubygems` lane |
| argan | `family-nuget` | `family-maven` | `family-ghcr` + `family-container` | `family-npmjs` | `family-githubnpm` | `family-rubygems` |
| cadria | `family-nuget` | `family-maven` | `family-ghcr` + `family-container` | `family-npmjs` | `family-githubnpm` | `family-rubygems` |
| cobaia | `family-nuget` (new seat) | `family-maven` (new seat) | `family-container` | `family-npmjs` | `family-githubnpm` | `family-rubygems` (new seat) |
| debonair | `family-nuget` | `family-maven` | `family-ghcr` + `family-container` | `family-npmjs` | `family-githubnpm` | `family-rubygems` |
| forge | `family-nuget` (new seat) | `family-maven` (new seat) | `family-container` | `family-npmjs` | `family-githubnpm` | `family-rubygems` (new seat) |
| foundry | `family-nuget` (new seat) | `family-maven` (new seat) | `family-container` | `family-npmjs` | `family-githubnpm` | `family-rubygems` (new seat) |
| getry | `family-nuget` (new seat) | `family-maven` (new seat) | `family-container` | `family-npmjs` | `family-githubnpm` | `family-rubygems` (new seat) |
| saddle | `family-nuget` (new lane; PackageId `Saddle`) | seat files (`pom.xml`, `Saddle.java`) — lane pending | `saddle-container` + the saddle vhe lanes | `family-npmjs` | `family-githubnpm` (new lane) | `family-rubygems` (new lane) |
| stealthhead | `family-nuget` | `family-maven` | `family-container` | `family-npmjs` | `family-githubnpm` | `family-rubygems` |
| vault | `family-nuget` (new seat) | `family-maven` (new seat) | `family-container` | `family-npmjs` | `family-githubnpm` | `family-rubygems` (new seat) |

Every app also carries the Dockerfile seat (11/11 verified) and the four
envelope files when the seat applies: `<app>.csproj`, `<app>.gemspec`,
`<app>.java` + `pom.xml`, all stamped 2.0.157 and all riding the
`devthink/release.ts` lockstep surface so every future rung stamps them at
once.

## The package ledger (the ≈60 count)

| Registry | Packages | Count |
|----------|----------|-------|
| npmjs.org | devthink, argan, cadria, cobaia, debonair, forge, foundry, getry, saddle, stealthhead, vault | 11 |
| npm.pkg.github.com | devthink, argan, cadria, cobaia, debonair, forge, foundry, getry, saddle, stealthhead, vault | 11 |
| nuget.pkg.github.com | devthink, argan, cadria, cobaia, debonair, forge, foundry, getry, Saddle, stealthhead, vault | 11 |
| maven.pkg.github.com | devthink, argan, cadria, cobaia, debonair, forge, foundry, getry, stealthhead, vault | 10 |
| rubygems.pkg.github.com | devthink, argan, cadria, cobaia, debonair, forge, foundry, getry, saddle, stealthhead, vault | 11 |
| ghcr.io images | devthink, argan, cadria, debonair, saddle | 5 |
| **Total registry packages** | | **59** |

Beside the registry packages the release wave attaches the container
release archives (`family-container`: argan, cadria, cobaia, debonair,
forge, foundry, getry, stealthhead, vault — 9 archive seats) and the
saddle virtual-hardware-engine lanes (`saddle-vhe-*`), which lifts the
artifact family past the sixty-package mark the distribution carries.

### The deltas against the theoretical 66 (11 × 6)

- **−1 saddle maven lane**: the saddle envelope carries `pom.xml` and
  `Saddle.java` (the seat exists as files) but rides no `family-maven`
  leg — its pom answers the `io.wenathlan` groupId while the lane's
  existence pre-check walks `io/github/wenathlan`, and maven redeploy of
  a published version is not idempotent. The lane stays pending until
  the saddle pom aligns its groupId.
- **−6 ghcr image seats**: cobaia, forge, foundry, getry, stealthhead and
  vault answer their container seat through the `family-container`
  release archive (one Dockerfile each, one archive per release) instead
  of an individual ghcr image — the single shared family image doctrine.

66 − 1 − 6 = **59 registry packages** + 9 release archives.

## Version resolution (no hardcoded versions)

- Every publish lane resolves the version from the release tag validated
  against the matrix app's `package.json` (`steps.release.outputs.version`)
  and overrides the seat at pack time: NuGet `-p:PackageVersion`, Maven
  `-Drevision`, RubyGems `env <APP>_VERSION=<version>`, npm publishes the
  manifest the folder carries.
- The checked-in seat defaults (`<Version>` in the csproj, `<revision>` in
  the pom, the `ENV.fetch` default in the gemspec) carry 2.0.157 and ride
  the `release.ts` lockstep edits so they never drift from the manifest.
- The one deliberate literal: `registryheal.yml` pins the honest rung
  (2.0.154) of the emergency dist-tag heal — a historical target, never a
  build version.
- No hardcoded sha256 digests ride any workflow run body (verified).

## Catalog candidates (GitHub Marketplace study)

Five candidate distribution types beyond the current six, studied from
the GitHub Actions catalog for a future ladder rung:

1. **Rust crates.io — `rust-lang/crates-io-action`**: publishes a crate to
   crates.io from the workflow with a scoped API token; one job per
   envelope beside the maven lane.
2. **Python PyPI — `pypa/gh-action-pypi-publish`**: uploads sdists/wheels
   to PyPI with OIDC trusted publishing (no long-lived token), the
   official Python packaging lane.
3. **Helm chart — `helm/chart-releaser-action`**: packages and pushes Helm
   charts to a GitHub Pages chart repository (or ghcr.io as OCI artifacts)
   on every tag — the natural seat for the container family.
4. **Homebrew tap — `mislav/bump-homebrew-formula-action`**: bumps the
   formula version and SHA in a homebrew tap repository when a release
   publishes — the desktop lane's package-manager seat.
5. **Go multi-binary — `goreleaser/goreleaser-action`**: cross-compiles,
   archives, checksums and publishes Go binaries (plus sbom and provenance)
   to a release — the engine-binary seat the saddle block could carry.
