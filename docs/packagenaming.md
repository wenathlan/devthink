# Package naming and registry coordinates

Devthink's product and repository name is **extension**. Registries nevertheless show names through their own address schemes, so an installation coordinate can include a scope, group, owner or registry hostname in addition to the artifact name. Those prefixes provide identity and collision avoidance; they do not rename the project.

| Registry | Published identifier | Reason |
| --- | --- | --- |
| GitHub Release | `Devthink X.Y.Z` with `devthinkX.Y.Z.zip` | Human-readable product release. It attaches the extension ZIP, npm tarball, source ZIP, isolated notes, NuGet package, Maven descriptor, GHCR reference/digest/JSON and SHA-256 manifest. |
| GitHub Packages npm / npmjs | `@wenathlan/extension` | `extension` is an npm artifact name already owned by an unrelated publisher, so Devthink must retain a unique scoped package identifier. [1] |
| GitHub Packages Maven | `io.github.wenathlan:extension` | Maven coordinates necessarily include `groupId:artifactId`; the artifact name is already `extension`. [2] |
| GitHub Packages NuGet | `extension` | The package ID and its small distribution assembly are now both exactly `extension`. [3] |
| GHCR | `ghcr.io/wenathlan/extension` | A container image must include its registry host and owner namespace; its image name is `extension`. [4] |

The release workflow uses `NODE_AUTH_TOKEN` from repository or permitted organization secrets for npmjs and falls back to `NPM_TOKEN`. Both values are treated as secret inputs, are never echoed and are verified with `npm whoami` before the idempotent public publish. There is no `PUBLISH_NPM` repository-variable gate: validated releases publish the exact public npm version automatically when it is absent.

The former NuGet identifier `Wenathlan.Devthink.Extension` was a legacy migration target, not an alternative current name. Its exact-name, exact-namespace one-time migration completed in v1.1.12 without substituting `extension`, modifying tags or targeting another registry. The deletion job was removed in v1.1.14, so future releases contain no package-deletion capability.


## Dist targets of the cli expansion (1.1.80)

The build emits the expanded cli bundle as `dist/cli.js` and the headless library entry as its own `dist/headless.js` target with its `dist/headless.d.ts` declarations; the package.json exports map carries the `./headless` entry point beside the root library entry, and the files list includes the `docs/examples` directory so the npm tarball ships the sample plans, workflows and recorded page state fixtures the terminal commands operate on. The cli and headless dist targets run under bundle size accounting that fails the build before an oversized bundle ships, and the naming check keeps every bundle free of underscored identifiers.


## Dist file names of every consumption mode (1.1.81)

The build emits the esm core as `dist/index.js`, the cjs core as `dist/index.cjs`, the umd bundle as `dist/devthink.umd.js`, the neutral browser bundle as `dist/index.neutral.js`, the runtime entries as `dist/node.cjs`, `dist/bun.js` and `dist/deno.js`, the cli as `dist/cli.js`, the headless entry as `dist/headless.js` and the per-module entries as `dist/policy.js`, `dist/protocol.js`, `dist/memory.js` and `dist/progress.js` — every target with its declaration file, its sourcemap, a minified variant beside the unminified one, the version stamp and the license banner, and one checksums line per target in `dist/checksums.txt`. The package.json exports map carries the import, require, types, default and browser conditions for the root entry and the per-module, cli and headless entries; the browser condition selects the neutral target and the sideEffects false field keeps tree shaking whole.

## The site zip artifact name (1.1.82)

The release workflow packages the static site as `devthink-site.zip` beside the extension artifacts: the zip carries the hashed assets of `dist/site` (the chatbridge bundle, its stylesheet, the index page and the site manifest that declares the servercontract version it speaks), and the release publishes it beside the other release assets with its checksum line. The package.json exports map stays free of site entries — the site ships as its own artifact, never as a library mode.

## The mcp bundle name (1.1.84)

The build emits the mcp server bundle as `dist/mcp.js` with its minified variant, its sourcemaps and its declaration file; the package.json exports map gains the `./mcp` entry point and the files list includes the mcp bundle. The cli `serve` command starts the server over stdio and a localhost http listener, the container smoke pings the http listener with a json rpc ping, the vitest suite covers the stdio transport in process, and the mcp client example of `tests/code/mcp-client.mjs` ships as `dist/fixtures/mcp-client.mjs` for a manual stdio walk (no ci step runs it).
## The native bundle names (1.1.85)

The native host bridge ships two dist targets beside the mcp bundle, both reshaped by the later consolidations the changelog records: `dist/bridge.js` (with `dist/bridge.min.js` and the declaration file) is the tree shakable bridge family bundle of the 1.1.90 correlation wave — the wire contract, the site relay client, the chat widget, the localhost wsbridge relay and the native host surface in one artifact a local process imports, folded from the standalone `dist/wsbridge.js` target the 1.1.90 merge retired — and `dist/companion.js` is the stamped companion script the host manifest points at: since the 1.1.98 consolidation the companion is the root `companion.ts` module with the host manifest template embedded (`nativehosttemplatejson`), the plain node recipe of the packaging build compiles that source with esbuild and stamps the package version over the source build marker, so the companion ships as source plus a build command and never as a binary blob. The host manifest template the companion module embeds stamps to `dist/nativehost.template.json` in the tarball and the release attaches it as `devthink-nativehost-<version>.template.json`.

## References

[1]: https://docs.npmjs.com/cli/v11/using-npm/scope/ "npm scoped packages"
[2]: https://maven.apache.org/repositories/artifacts.html "Maven artifact coordinates"
[3]: https://learn.microsoft.com/en-us/nuget/create-packages/package-authoring-best-practices "NuGet package authoring best practices"
[4]: https://docs.github.com/packages/working-with-a-github-packages-registry/working-with-the-container-registry "GitHub Container registry"

## The cross browser artifact names (1.1.86)

The 1.1.86 cross browser build ships the firefox xpi and the safari skeleton zip beside the chromium extension zip. The build emits the cross browser dist bundles with their minified variants, their sourcemaps and their declaration files: `dist/apimap.js`, `dist/browserpolyfills.js`, `dist/firefoxprep.js`, `dist/xpipack.js` and `dist/safariskeleton.js` — every target with the version stamp and the license banner, and one checksum line per target in `dist/checksums.txt`. The package.json files list includes the root `manifest.json` so the npm tarball ships the single root manifest with the per browser overlays embedded under the `browsers` key (`browsers.firefox` and `browsers.safari`) — the files list carries no `manifests` directory because no second hand maintained manifest file exists. The release workflow copies `extension/devthink-firefox-<version>.xpi` and `extension/devthink-safari-<version>.zip` into the release staging directory beside the chromium extension zip, and the github release attaches them as release assets.

## The publishing pipeline artifact names (1.1.87)

The 1.1.87 publishing pipeline names every artifact of every channel with the lowercase single word convention and the release version, with no underscore in any shipped name. The vs code package ships as `devthink-vscode-<version>.vsix` (the release asset the operator installs from the release page); the maven distribution ships one module jar per consumption mode as `extension-library-<version>.jar`, `extension-cli-<version>.jar`, `extension-headless-<version>.jar` and `extension-mcp-<version>.jar` under the `io.github.wenathlan:extension` aggregator beside the `extension` and `declarations` classifier zips; the nuget package keeps the `extension.<version>.nupkg` name with the content files under `contentFiles/any/any/`; the site channel stamps the static site as `devthink-site-<version>.zip`; the declarations channel stamps `devthink-declarations-<version>.zip`; the container channel tags the image with the version beside the `stable` alias (a `pre` suffix for prereleases) and publishes `extension-container.txt`, `extension-container.digest` and `extension-container.json`; and the provenance channel stamps the cyclonedx inventory as `devthink-sbom-<version>.json`, the attestations record as `devthink-attestations-<version>.json` and the artifact manifest as `devthink-artifactmanifest-<version>.json`. The build emits the publishing pipeline module bundles with their minified variants, sourcemaps and declaration files (`dist/vsixpack.js`, `dist/mavenpack.js`, `dist/nugetpack.js`, `dist/containerpack.js`, `dist/sbom.js`, `dist/artifactmanifest.js` and `dist/relayserve.js`) and one checksums line per target in `dist/checksums.txt`; the package.json files list includes the `site` source directory beside the root `manifest.json`, and the exports map gains the `./relayserve`, `./sbom` and `./artifactmanifest` entries for the self hosting and release tooling surfaces.
