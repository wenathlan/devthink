# Distribution lanes

The eleven distribution lanes of the PR14 law and the honest status each lane answers for saddle at the 2.0.163 family rung. A lane never ships metadata its real surface cannot back: a lane without a real carrier stays a documented stub until the surface lands, and no version ever bumps to fake a lane.

| Lane | Carrier | Status | Note |
| --- | --- | --- | --- |
| npmjs | package.json — @wenathlan/saddle | live | the family-npmjs lane publishes the engine envelope (the heaviest pass, always last) |
| GitHub Packages npm | package.json — @wenathlan/saddle | live | the family-githubnpm lane publishes the same envelope idempotently |
| Maven | pom.xml — com.wenathlan:saddle | live | the family-maven lane deploys the one real jar of the family (the Saddle.java adapter) |
| NuGet | saddle.csproj | live | the family-nuget lane packs the engine envelope |
| Gradle | build.gradle.kts — com.wenathlan:saddle | live | the family-gradle lane publishes the module beside the maven coordinates |
| Ruby Gems | saddle.gemspec | live | the family-rubygems lane pushes the gem carrying the SaddleCli.rb process adapter |
| Docker Container | Dockerfile | live | the saddle-container lane attaches the engine archive and the vhe lanes publish the max / balanced / lite profile indexes under the eleven-architecture standard of containerarch.ts |
| Go Get | go.mod | stub | no Go source surface ships yet — the lane lands when a real Go adapter exists, never as an empty module |
| Cargo Crates | Cargo.toml | stub | no Rust source surface ships yet — the lane lands with a real crate, never as an empty manifest (the tauri rust envelope stays runner-side toolchain output) |
| PyPi | pyproject.toml | stub | no Python package surface ships yet — the qemubridge.py helper is a bridge script, not a wheel surface; the lane lands with a real package, never as an empty project table |
| Homebrew | Formula | stub | no tap repository ships yet — the formula lands pointing at the real release binaries with real checksums, never at a placeholder |

The engines block of package.json keeps Go, Rust and Python as declared toolchain floors — a catalog row is not a distribution lane. The dual npm law answers through the npmjs and GitHub Packages rows; the release binaries (the desktop bundles, the mobile artifacts, the vhe container archives) ride the family-desktop, family-mobile and saddle-container lanes every release rung.
