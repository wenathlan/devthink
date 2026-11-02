# Saddle Workflow Reference

The Saddle repository was inspected in read-only mode on 2026-08-19 through its public workflow directory. No Saddle file was modified.

Its Maven, NuGet and RubyGems publication workflows use root manifests (`pom.xml`, `saddle.csproj` and `saddle.gemspec`) and let GitHub Actions perform the build and publication. DevThink adopts that layout with root `pom.xml`, `devthink.csproj` and `devthink.gemspec`, while retaining its own hardened release-tag checkout policy.

Reference: <https://github.com/wenathlan/saddle/tree/main/.github/workflows>

## Complete Workflow Comparison

The Saddle workflow directory was re-inventoried in read-only mode on 2026-08-19. Its relevant capability groups are already represented by DevThink: CI, security, CodeQL, compatibility, release binaries, extension, container, mobile, desktop, Pages, target plans, package publications and workflow linting.

The compatible cache-retention policy was adapted with a stricter DevThink boundary. Saddle retains a bounded family of main-branch caches and ages non-main caches. DevThink now keeps only one current main cache for CodeQL, pnpm and Trivy, while immediately qualifying every non-main cache for removal.

The following Saddle files were assessed but not copied because they are not compatible with the current DevThink source surface or duplicate existing behaviour: `compose.yml` is a container runtime profile rather than a GitHub Actions workflow; `dependabot.yml` conflicts with the explicit DevThink policy of zero open Dependabot pull requests; and `action.yml`, `action2.yml`, `.github.ci.yml`, `github.ci.yml` and `uka-tests.yml` are Saddle-specific or duplicate controls.

Sources: <https://raw.githubusercontent.com/wenathlan/saddle/main/.github/workflows/cachecleanup.yml>, <https://raw.githubusercontent.com/wenathlan/saddle/main/.github/workflows/targets.yml>, <https://raw.githubusercontent.com/wenathlan/saddle/main/.github/workflows/desktop.yml>, <https://raw.githubusercontent.com/wenathlan/saddle/main/.github/workflows/security.yml>, <https://raw.githubusercontent.com/wenathlan/saddle/main/.github/workflows/workflowlint.yml>, and <https://raw.githubusercontent.com/wenathlan/saddle/main/.github/workflows/compatibility.yml>.
