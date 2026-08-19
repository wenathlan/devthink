# Saddle Workflow Reference

The Saddle repository was inspected in read-only mode on 2026-08-19 through its public workflow directory. No Saddle file was modified.

Its Maven, NuGet and RubyGems publication workflows use root manifests (`pom.xml`, `saddle.csproj` and `saddle.gemspec`) and let GitHub Actions perform the build and publication. DevThink adopts that layout with root `pom.xml`, `devthink.csproj` and `devthink.gemspec`, while retaining its own hardened release-tag checkout policy.

Reference: <https://github.com/wenathlan/saddle/tree/main/.github/workflows>
