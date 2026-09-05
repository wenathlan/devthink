/** The pack module of the 1.1.90 consolidation: every correlated variation of the publishing pipeline contract and all its packagers interned in this one file, so the module family carries one surface without duplicate variations. */
import type { artifactmanifestdocument, containerbuildstage, containerexposedsurface, mavenattachedartifact, mavenpommetadata, nugetcontententry, nugetpackmetadata, sbominventoryinput, vsixmanifestfields, vsixpackinput, vsixpackoutput } from "./types.js";
/**
 * Artifactmanifest of the 1.1.87 publishing pipeline family.
 * Every release artifact manifest concern of the publishing pipeline lives in this one pure module: the manifest document the build and the release workflow emit (every artifact with its name, its byte size, its sha256 checksum and its publishing channels), the channel resolution that maps one artifact name onto the channels it ships through, the check that asserts a built set matches the manifest exactly, and the rollback pin that freezes the previous release artifact set through its immutable tag. The module stays pure: the manifest carries no timestamp so the same artifact set renders byte identical on every run, the artifact records reach the module through injected seams only, and the rollback pin references only immutable tags of this repository — no download url, no vendor endpoint and no mutable reference ever enters the manifest.
 * Example: `const manifest = artifactmanifestof({ version: "1.1.87", artifacts: [{ name: "devthink1.1.87.zip", size: 1024, checksum: "abcd" }] });`
 */
/** The publishing channels the release operates: the github release asset channel every artifact rides, the npm channel (npmjs and GitHub Packages), the nuget channel, the maven channel, the container channel, the vscode channel, the firefox channel, the safari channel, the chromium channel, the site channel, the declarations channel and the provenance channel — one artifact may ride several channels (the extension zip rides the chromium, nuget and maven channels at once). */
export declare function artifactchannels(): string[];
/** Resolves the publishing channels one artifact name belongs to: the version stamped artifact names map onto the channels the release workflow operates, and an unrecognized name still rides the github asset channel because every release artifact attaches to the release. */
export declare function artifactchannelof(name: string, version: string): string[];
/** Builds the artifact manifest of one release: every artifact with its name, its size, its checksum and its channels — the document carries no timestamp so the build and the release workflow render the same artifact set byte identically. */
export declare function artifactmanifestof(input: {
    version: string;
    artifacts: Array<{
        name: string;
        size: number;
        checksum: string;
    }>;
}): artifactmanifestdocument;
/** Renders the manifest as the json text the release attaches: one deterministic document with sorted artifacts and no trailing noise, so the checksum of the manifest asset itself stays reproducible. */
export declare function artifactmanifesttext(manifest: artifactmanifestdocument): string;
/** The artifact manifest asset name the release version stamps: the manifest ships as devthink-artifactmanifest-<version>.json beside the artifacts it lists. */
export declare function artifactmanifestnameof(version: string): string;
/** Verifies a built or downloaded set matches the manifest exactly: every manifest name must exist in the set with the same sha256 checksum, and every extra file the set carries outside the manifest (except the manifest and the checksums file themselves) fails the check — the release verification step and the verify workflow run this check over the assembled set. */
export declare function artifactmanifestcheck(input: {
    manifest: artifactmanifestdocument;
    files: Array<{
        name: string;
        checksum: string;
    }>;
    ignored?: string[];
}): {
    ok: boolean;
    missing: string[];
    unexpected: string[];
    mismatched: string[];
};
/** Freezes the rollback pin of the previous release: the pin records the immutable tag of the previous version and the artifact names with their checksums from the previous artifact manifest, so the rollback procedure restores the exact previous artifact set instead of a mutable latest — the pin never carries a download url, only the tag and the digests an operator resolves through the repository. */
export declare function rollbackpinnedset(input: {
    previousversion: string;
    manifest: artifactmanifestdocument;
}): {
    tag: string;
    version: string;
    artifacts: Array<{
        name: string;
        checksum: string;
        channels: string[];
    }>;
    procedure: string[];
};
/**
 * Sbom of the 1.1.87 publishing pipeline family.
 * Every software bill of materials concern of the publishing pipeline lives in this one pure module: the cyclonedx inventory the release emits for every artifact, the component record one artifact maps onto (its name, its sha256 hash and its channel properties) and the metadata block the inventory carries (the devthink component with its version and license). The module stays pure: the inventory is a deterministic json document with no timestamp so two runs of the same artifact set produce byte identical output, the artifact records reach the module through injected seams only, no dependency coordinates ever appear here because the devthink release artifacts carry no third party payload — the inventory documents what the release ships, not what registries host.
 * Example: `const bom = sbominventory({ version: "1.1.87", artifacts: [{ name: "devthink1.1.87.zip", size: 1024, checksum: "abcd" }] });`
 */
/** The cyclonedx spec version the inventory speaks: the 1.5 revision every cyclonedx reader accepts. */
export declare const sbomspecversion = "1.5";
/** The license the inventory records on every component: the devthink release ships under GPL-3.0-only with no third party code imported. */
export declare const sbomlicense = "GPL-3.0-only";
/** Builds the cyclonedx component record of one release artifact: a file component with its name, its sha256 hash and its channel properties — the properties carry the publishing channels the artifact belongs to so an inventory reader resolves where the artifact ships. */
export declare function sbomcomponentof(artifact: {
    name: string;
    size: number;
    checksum: string;
    channels?: string[];
}): {
    type: "file";
    name: string;
    hashes: Array<{
        alg: "SHA-256";
        content: string;
    }>;
    properties: Array<{
        name: string;
        value: string;
    }>;
    size?: number;
};
/** Builds the cyclonedx inventory of every release artifact: the bom format stamp, the spec version, the metadata block (the devthink component with its version and license) and one component per artifact with its hash and channels — the document carries no timestamp so the same artifact set renders byte identical on every run. */
export declare function sbominventory(input: sbominventoryinput): {
    bomformat: "CycloneDX";
    specversion: string;
    version: number;
    metadata: Record<string, unknown>;
    components: unknown[];
};
/** Renders the inventory as the json text the release attaches: one deterministic document with sorted stable keys and no trailing noise, so the checksum of the sbom asset itself stays reproducible. */
export declare function sbominventorytext(input: sbominventoryinput): string;
/** The sbom asset name the release version stamps: the inventory ships as devthink-sbom-<version>.json beside the artifacts it documents. */
export declare function sbomnameof(version: string): string;
/** Verifies the inventory covers every artifact of the release set: every name the caller lists must appear as a component with a matching sha256 hash, and an artifact the inventory misses fails the check before the sbom ships. */
export declare function sbomcoveragecheck(input: {
    inventory: {
        components: Array<{
            name?: string;
            hashes?: Array<{
                alg?: string;
                content?: string;
            }>;
        }>;
    };
    artifacts: Array<{
        name: string;
        checksum: string;
    }>;
}): {
    ok: boolean;
    missing: string[];
};
/**
 * Vsixpack of the 1.1.87 publishing pipeline family.
 * Every vs code packaging concern of the publishing pipeline lives in this one pure module: the vsix archive the build assembles from the extension manifest and the library esm bundle, the package manifest that declares the extension capabilities and commands, the webview panel that runs the chatbridge surface inside vs code, the consent gates the webview keeps visible before any relay frame crosses, the telemetry off and empty network default statements the manifest carries, and the marketplace metadata check that validates the package fields without naming any vendor endpoint. The module stays pure: the version and the esm bundle bytes reach it through injected seams only, the archive stays a plain zip (the extension manifest at the root, the webview and the esm bundle inside the extension folder), no vendor marketplace url and no download url ever appears here — the vsix ships as a release asset the operator installs from the release page with their own credentials.
 * Example: `const output = vsixpackassemble({ version: "1.1.87", esmbundlebytes: buffer });`
 */
/** The artifact name the release version stamps: the vsix carries the devthink-vscode-<version>.vsix shape the release workflow attaches beside the browser builds. */
export declare function vsixnameof(version: string): string;
/** The vs code extension manifest fields the package carries: the identity (devthink from the wenathlan publisher), the engine floor, the categories, the openbridge and settings commands, the relay url configuration with its empty default (the user configured url is the only url the webview ever connects to), and the telemetry off statement — the manifest declares no marketplace url, no repository download link and no network default of any kind. */
export declare function vsixpackmanifestfields(version: string): vsixmanifestfields;
/** Builds the vs code package manifest text: the extension manifest the marketplace metadata check validates — the capabilities, the commands, the configuration with the empty relay url default and the telemetry off statement ride one json document the archive carries at extension/package.json. */
export declare function vsixpackmanifest(fields: vsixmanifestfields): string;
/** Builds the extension host script text: the host registers the openbridge command that opens the webview panel with the chatbridge surface, reads the relay url from the user configuration only (an empty value keeps the panel offline), passes the url into the webview as its initial state and keeps the consent gates visible inside the panel — the host sends no telemetry frame, opens no network connection of its own and names no endpoint. */
export declare function vsixextensionhost(): string;
/** Builds the webview page text the chatbridge surface runs on: the page asks the operator for the relay url of their own relay and the pairing code, keeps the consent gates visible before any socket frame crosses, and reuses the library esm build the archive carries inside the extension folder — the page never names a relay, never assumes a url and stays fully offline until the operator types one. */
export declare function vsixwebviewpage(relaypath: string): string;
/** Builds the extension.vsixmanifest text the archive carries at its root: the identity (devthink from the wenathlan publisher with the release version), the engine floor, the properties (the telemetry off statement among them) and the files the archive carries — the manifest names no marketplace endpoint because the package installs from the release asset with the operator's own tooling. */
export declare function vsixvsixmanifest(fields: vsixmanifestfields, entries: string[]): string;
/** Builds the [Content_Types].xml text the vsix zip archive carries: one default type per file extension the archive ships. */
export declare function vsixcontenttypes(): string;
/** Assembles the vs code build into a vsix archive: the extension manifest and the content types sit at the archive root, the package manifest, the extension host, the webview page and the library esm build sit inside the extension folder, the artifact name carries the release version, and the entries list records every file the checksum step covers; the assemble stays pure and reads the esm bundle bytes the build emits. */
export declare function vsixpackassemble(input: vsixpackinput): vsixpackoutput;
/** Validates the marketplace metadata of the vsix package: the identity, the publisher, the version, the engine floor and the command list must be present, the telemetry statement must read off, the relay url default must stay empty and no vendor marketplace url may appear anywhere in the manifest text — the check answers the reason when a field fails so the build fails before the package ships. */
export declare function vsixmarketplacemetadatacheck(input: {
    fields: vsixmanifestfields;
    manifesttext: string;
}): {
    ok: boolean;
    reason?: string;
};
/** Builds the stored zip archive of the vsix package: one local file header per entry with its true offset recorded in the central directory, so every zip reader (the operator installer included) resolves the entries without a scan. */
export declare function vsixzipof(files: Array<{
    path: string;
    bytes: Buffer;
}>): Buffer;
/** Lists the entries the vsix archive carries: the manifest, the content types, the package manifest, the extension host, the webview page and the library esm build — the list the checksum step and the release notes read. */
export declare function vsixpackentriesof(output: vsixpackoutput): string[];
/**
 * Mavenpack of the 1.1.88 consolidation.
 * Every maven packaging concern of the publishing pipeline lives in this one pure module for the single distribution: the jar resources the one io.github.wenathlan.extension artifact embeds (the library core, the cli, the headless entry, the mcp server, the gateway and the http module all ship inside the one jar), the classifier artifacts the pom attaches beside it (the chromium extension zip and the declarations zip), the project metadata the pom records and the pom text itself. The module stays pure: the descriptors are plain data the build, the tests and the docs read, the checked-in pom mirrors them and the mavenpack tests assert the mirror never drifts, no vendor endpoint and no download url ever appears here — the maven channel publishes to the repository the pom declares.
 * Example: `const resources = mavenjarresources(); const attached = mavenattachedartifacts("1.1.88");`
 */
/** The jar resources the single distribution embeds: every consumption mode of the devthink surface rides the one artifact, so a consumer depends on exactly one coordinate and extracts the mode bundle it needs. The 2.0.3 flat layout mirrors the npm package: every resource lands at the jar root, one file per consumption mode, so the artifact opens organized the same way the registry packages do — no dist folder and no nesting inside the jar. */
export declare function mavenjarresources(): string[];
/** The classifier artifacts the pom attaches beside the single jar: the chromium extension zip (the extension classifier) and the declarations zip (the declarations classifier) — the classifier layout a maven consumer resolves the ide declarations and the browser build through. */
export declare function mavenattachedartifacts(version: string): mavenattachedartifact[];
/** The project metadata the pom records: the coordinates, the name, the description, the url, the scm links and the license — the metadata a registry consumer reads before depending on the artifact. */
export declare function mavenpackinfo(): mavenpommetadata;
/** The full maven layout of one release: the jar resources of the single distribution, the attached classifier artifacts and the pom metadata — the layout the build, the docs and the tests read so the checked-in pom never drifts from the descriptor. */
export declare function mavenpacklayout(version: string): {
    version: string;
    resources: string[];
    attached: mavenattachedartifact[];
    metadata: mavenpommetadata;
};
/** The pom text of the single distribution: the one jar packaging, the resource includes that embed every dist bundle inside the artifact and the classifier attachments the build helper pins beside it — the checked-in pom mirrors this text and the tests assert the mirror. */
export declare function mavenpackpomtext(version: string): string;
/**
 * Nugetpack of the 1.1.87 publishing pipeline family.
 * Every nuget packaging concern of the publishing pipeline lives in this one pure module: the content files the nupkg carries for the cli, headless and mcp entries, the umd and cjs bundles embedded as content assets, the declaration files embedded for ide integration, the framework targets matching the csproj profile, the project url, the license expression and the readme the manifest carries, and the fixtures directory embedded as sample content. The module stays pure: the layout is plain data the build, the tests and the docs read, the checked-in extension.csproj mirrors it and the nugetpack tests assert the mirror never drifts, no vendor endpoint and no download url ever appears here — the nuget channel publishes to the package source the workflow declares.
 * Example: `const layout = nugetpacklayout("1.1.87");`
 */
/** The content files the nupkg carries: the cli, headless and mcp entries of the terminal family, the umd and cjs bundles as content assets, and the chromium extension zip the content package has always carried — every entry lands under the contentFiles root a package consumer restores. */
export declare function nugetcontententries(version: string): nugetcontententry[];
/** The declaration entries the nupkg embeds for ide integration: the declaration files of the public modules land under the declarations folder of the content root so an editor resolves the devthink types from the package. */
export declare function nugetdeclarationentries(): nugetcontententry[];
/** The fixture entries the nupkg embeds as sample content: the recorded page state fixture and the example plans, workflows and mcp client the docs reference land under the fixtures folder of the content root. */
export declare function nugetfixtureentries(): nugetcontententry[];
/** The framework targets the nupkg declares: the target frameworks matching the csproj profile (the netstandard family) so the package restores on every dotnet consumer the profile supports. */
export declare function nugetframeworktargets(): string[];
/** The package metadata the nupkg manifest carries: the package id, the project url, the repository url, the license expression, the readme and the description — the registry listing reads exactly these fields. */
export declare function nugetpackinfo(): nugetpackmetadata;
/** The full nuget layout of one release: the content entries, the declaration entries, the fixture entries, the framework targets and the metadata — the layout the build, the docs and the tests read so the checked-in extension.csproj never drifts from the descriptor. */
export declare function nugetpacklayout(version: string): {
    version: string;
    content: nugetcontententry[];
    declarations: nugetcontententry[];
    fixtures: nugetcontententry[];
    metadata: nugetpackmetadata;
};
/**
 * Containerpack of the 1.1.87 publishing pipeline family.
 * Every container packaging concern of the publishing pipeline lives in this one pure module: the multi stage build (a builder stage that runs the full validation with the cli manifest and the headless smoke as build checks, a runtime stage that copies the lean output onto the plain base), the exposed surfaces the runtime image serves (the static site, the mcp server and the socket relay speaking the servercontract for self hosting), the image tags the release stamps (the version beside the stable channel alias) and the digest file the release publishes with the image hash. The module stays pure: the descriptors are plain data the build, the tests and the docs read, the checked-in containerfile mirrors them and the containerpack tests assert the mirror never drifts, no vendor endpoint and no download url ever appears here — the operator pulls the image from the registry they choose.
 * Example: `const stages = containerbuildstages(); const surfaces = containerexposedsurfaces();`
 */
/** The multi stage build of the container image: the builder stage runs the whole validation chain with the cli manifest check and the headless smoke as build checks before the runtime stage copies the lean output (the site, the cli and the relay bundles) onto the plain node base. */
export declare function containerbuildstages(): containerbuildstage[];
/** The build checks the builder stage runs before the runtime stage ships: the cli manifest asserts the built cli answers, and the headless smoke runs one fixture through the headless entry — an image whose build checks fail never ships. */
export declare function containerbuildchecks(): string[];
/** The exposed surfaces of the runtime image: the static site and the socket relay ride the http listener the user binds (the relay speaks the servercontract for self hosting), and the mcp server rides its own listener behind its own bind — every bind, port and path stays an environment choice the operator sets, the defaults keep the mcp listener loopback only and no surface names an endpoint. */
export declare function containerexposedsurfaces(): containerexposedsurface[];
/** The image tags the release stamps: the version tag beside the stable channel alias that tracks the latest stable release, and the pre suffix a prerelease version carries instead — the tags are docker convention coordinates, never vendor endpoints. */
export declare function containerimagetags(version: string): string[];
/** The digest file the release publishes with the image hash: the digest records the pushed image reference and its sha256 digest so an operator pins the exact image the release shipped. */
export declare function containerdigestfiles(version: string): Array<{
    name: string;
    content: string;
}>;
/** The runtime entry the image starts: the self hosting runner that serves the static site, the socket relay and the mcp server listener — one plain node script, no vendor runtime and no function file anywhere in the image. */
export declare function containerrunnerentry(): string;
//# sourceMappingURL=pack.d.ts.map