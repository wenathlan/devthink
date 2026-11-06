# Distribution lanes

The eleven distribution lanes of the PR14 law and the honest status each lane answers for devthink at the 2.0.163 family rung. A lane never ships metadata its real surface cannot back: a lane without a real carrier stays a documented stub until the surface lands, and no version ever bumps to fake a lane.

| Lane | Carrier | Status | Note |
| --- | --- | --- | --- |
| npmjs | package.json — @wenathlan/devthink | live | the single npmjs lane of the release ladder publishes the flat distribution tarball |
| GitHub Packages npm | package.json — @wenathlan/devthink | live | the githubnpm lane publishes the same envelope idempotently |
| Maven | pom.xml — io.github.wenathlan:devthink | live | the single maven lane deploys the aggregator with its module jars and classifier zips |
| NuGet | devthink.csproj | live | the single nuget lane packs the distribution package |
| Gradle | build.gradle.kts — com.wenathlan:devthink | live | the single gradle lane publishes the module |
| Ruby Gems | devthink.gemspec | live | the single rubygems lane pushes the gem |
| Docker Container | Dockerfile | live | the ghcr lane pushes ghcr.io/wenathlan/devthink (the multi stage image with the five-architecture index) and the container lane attaches the release archive |
| Go Get | go.mod | stub | no Go source surface ships yet — the lane lands when a real Go adapter exists, never as an empty module |
| Cargo Crates | Cargo.toml | stub | no Rust source surface ships yet — the lane lands with a real crate, never as an empty manifest |
| PyPi | pyproject.toml | stub | no Python package surface ships yet — the lane lands with a real wheel, never as an empty project table |
| Homebrew | Formula | stub | no tap repository ships yet — the formula lands pointing at the real release binaries with real checksums, never at a placeholder |

The engines block of package.json keeps Go, Rust and Python as declared toolchain floors — a catalog row is not a distribution lane. The dual npm law answers through the npmjs and GitHub Packages rows; the release binaries (the compiled workbench binaries across the bun target matrix, the tauri desktop bundles, the mobile artifacts, the container archive and the extension packages) attach to the release assets every rung.
