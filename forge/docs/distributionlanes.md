# Distribution lanes

The eleven distribution lanes of the PR14 law and the honest status each lane answers for forge at the 2.0.163 family rung. A lane never ships metadata its real surface cannot back: a lane without a real carrier stays a documented stub until the surface lands, and no version ever bumps to fake a lane.

| Lane | Carrier | Status | Note |
| --- | --- | --- | --- |
| npmjs | package.json — @wenathlan/forge | live | the family-npmjs lane publishes the envelope every release rung |
| GitHub Packages npm | package.json — @wenathlan/forge | live | the family-githubnpm lane publishes the same envelope idempotently |
| Maven | pom.xml — io.github.wenathlan:forge | live | the family-maven lane deploys the jar |
| NuGet | forge.csproj | live | the family-nuget lane packs the envelope |
| Gradle | build.gradle.kts — com.wenathlan:forge | live | the family-gradle lane publishes the module |
| Ruby Gems | forge.gemspec | live | the family-rubygems lane pushes the gem |
| Docker Container | Dockerfile | live | the family-ghcr lane pushes ghcr.io/wenathlan/forge (the vault and saddle siblings its Dockerfile COPYs ride the staged context) and the family-container lane attaches the release archive |
| Go Get | go.mod | stub | no Go source surface ships yet — the lane lands when a real Go adapter exists, never as an empty module |
| Cargo Crates | Cargo.toml | stub | no Rust source surface ships yet — the lane lands with a real crate, never as an empty manifest |
| PyPi | pyproject.toml | stub | no Python package surface ships yet — the lane lands with a real wheel, never as an empty project table |
| Homebrew | Formula | stub | no tap repository ships yet — the formula lands pointing at the real release binaries with real checksums, never at a placeholder |

The engines block of package.json keeps Go, Rust and Python as declared toolchain floors — a catalog row is not a distribution lane. The dual npm law answers through the npmjs and GitHub Packages rows; the release binaries (the desktop bundles, the mobile artifacts, the container archive) ride the family-desktop, family-mobile and family-container lanes every release rung.
