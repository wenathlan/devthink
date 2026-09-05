/** The cli module of the 1.1.88 consolidation: the terminal entry and the cli tools interned in this one file, so the cli surface carries one module without duplicate variations. */
import type { cliconfiguration, headlessfixture, planfile, planlintdiagnostic, runlogentry, exportresult, manifestcheckfinding, planrisksummary, runworkflowoutcome, workflowdocument, workflowrecord, workflowrun } from "./types.js";
/**
 * Family entry of the grand merge: the single devthink binary routes the
 * extension command family here (`devthink ext <command>`); the argv is
 * spliced into the process position the original entry reading expects,
 * the family main runs untouched and the caller argv is restored.
 *
 * @param argv the family arguments (without the family prefix).
 */
export declare function runclifamily(argv: string[]): Promise<void>;
/**
 * Cli tools logic of the 1.1.80 family.
 * The pure half of the terminal surface lives in this one module while the impure half (the filesystem reads, the terminal prompts and the process exit) stays in the cli entry that wires it: the deep manifest checks grade the manifest key allowlist, the permission source lines, the content security policy hashes, the web accessible resources, the permission duplication, the minimum chrome version against the capability report and the icon dimensions; the planlint findings add the selector grammar, the required option fields and the origin allowlist to the shared lint engine beside the risk summary; the runworkflow composition loads a workflow document through the composeworkflow engine the extension runs; the exportdata selection routes session, audit and extraction records through the shared export menu serializers with the time window filter and the secret store refusal; the exit code mapping documents the failure classes; and the headless fixture resolution replays read only kinds against recorded page state fixtures under the fixture consent gate.
 * Every rule shares the modules the extension shares: the kind catalog and the selector grammar come from policy, the risk grades flow through the same resolvedrisk derivation, the workflow steps compose through the same engine, the serializers ride the exporttools descriptors and the fixtures carry the observation schema of the live snapshot pipeline — so the consent gates hold on the terminal exactly as they hold in the browser.
 */
/** Parses the global cli configuration under schemastrict: the default plan location, the fixtures directory, the verbosity, the default format and the consent allowlist; unknown fields and wrong shapes refuse with the field that names them, so a misconfigured terminal never silently widens a default. */
export declare function parsecliconfig(value: unknown): cliconfiguration;
/** The exit code classes the cli documents in the readme: every command maps its failure onto exactly one class. */
export declare const cliexitclasses: readonly string[];
/** Maps one exit class onto its documented exit code; an unknown class refuses as a schema error because the mapping itself is contract. */
export declare function exitcodeof(exitclass: string): number;
/** Reads the exit class of one workflow run state: a done run reports ok, a failed run reports the step failure, a cancelled run reports the cancellation and every other state reports the schema error of an unfinished document. */
export declare function exitclassofrun(run: workflowrun): string;
/** The reviewed manifest key allowlist of the deep manifest check: every key the published extension may declare; a key outside the list is a review miss, never a silent pass. The browsers and vsix keys of the 1.1.93 single manifest design carry the per browser overlays and the vs code packaging data the build reads — reviewed metadata keys the derived browser manifests strip before they ship. */
export declare const manifestkeyallowlist: readonly string[];
/** The reviewed web accessible resource set of the deep manifest check: the pages the extension declares to the store; a resource outside the set is web exposed without review. */
export declare const reviewedwebresources: readonly string[];
/** Reads the capability api report of one permission list: every api the permissions turn on with the minimum chrome version that ships it, so the minimum chrome version check derives its floor from the declared capabilities instead of a hardcoded number. */
export declare function capabilityapireport(permissions: string[]): Array<{
    api: string;
    minchrome: number;
}>;
/** Reads the png dimensions of one icon payload straight from the ihdr header: the width and height the declared icon size key must match. */
export declare function pngdimensions(bytes: Uint8Array): {
    width: number;
    height: number;
};
/** Reads the source file and line of one manifest declaration: the first text line that carries the value, in the file:line form editors consume. */
export declare function manifestsourceline(manifesttext: string, manifestfile: string, value: string): string | undefined;
/** Reads the sha256 script hashes of one content security policy list: the hash entries the deep check verifies against the bundled script bytes. */
export declare function csphashesof(policy: string): string[];
/** Runs the deep manifest checks of the 1.1.80 family: every manifest key verifies against the runtime policy allowlist, every permission reports its source file and line, the content security policy hashes verify against the bundled scripts through the digest seam, the web accessible resources verify against the reviewed resource set, duplicated permissions across the required and optional sets refuse, the minimum chrome version checks against the capability report and every declared icon verifies its file presence and dimensions. */
export declare function deepmanifestchecks(input: {
    manifest: unknown;
    manifesttext: string;
    manifestfile: string;
    filebytes: Record<string, Uint8Array>;
    capabilities: Array<{
        api: string;
        minchrome: number;
    }>;
    digestof: (bytes: Uint8Array) => string;
    bundlepresent?: boolean;
}): {
    findings: manifestcheckfinding[];
    exitcode: number;
};
/** Runs the 1.1.80 planlint findings the cli adds to the shared lint engine: the kind catalog check that refuses forbidden kinds, the selector grammar check shared with policy, the required option fields check the executor enforces and the origin allowlist check against the consent allowlist the user configured. */
export declare function planlintfindings(input: {
    file: planfile;
    capabilities?: string[];
    allowlist?: string[];
}): planlintdiagnostic[];
/** Reads the risk summary of one plan file: the step counts per risk class beside the total, so the review reads the plan risk shape at a glance. */
export declare function planrisksummaryof(file: planfile): planrisksummary;
/** Parses one workflow document under schemastrict: the version, the workflow payload with its name, version, origins and steps; unknown fields refuse with the path that names them. */
export declare function parseworkflowdocument(value: unknown): workflowdocument;
/** Composes one workflow document through the engine the extension runs: the kinds verify against the reviewed catalog and the risk grades flow through the same policy table, so the terminal replay and the browser run grade one workflow identically. */
export declare function composeworkflowdocument(document: workflowdocument, now: number): workflowrecord;
/** Builds the structured outcome summary of one runworkflow execution: the run state beside the per step durations, the checkpoint the run reached and the exit class the terminal maps onto its exit code. */
export declare function runworkflowsummaryof(input: {
    runid: string;
    run: workflowrun;
    log: runlogentry[];
}): runworkflowoutcome;
/** Renders the audit trail lines of one runworkflow execution: one json line per run log entry with the sealed header, the file the command writes beside the workflow after each run. */
export declare function workflowauditlines(input: {
    runid: string;
    workflow: string;
    log: runlogentry[];
    now: number;
}): string;
/** Filters records through the exportdata time window: a record enters the window when its timestamp field sits inside the from and to bounds the flags declared; an absent bound stays open and a record without a timestamp never drops on a window it cannot answer. */
export declare function exportdatawindow(records: Array<Record<string, unknown>>, from?: number, to?: number, timefield?: string): Array<Record<string, unknown>>;
/** Refuses secret store material before any serialization: a record that carries a secret shaped field without its mask marker, or a vault entry marker at all, refuses the export in full because the secret store never ships through an export. */
export declare function secretstorerefusal(records: Array<Record<string, unknown>>): {
    refused: boolean;
    fields: string[];
    reason?: string;
};
/** Exports session, audit or extraction data through the shared export menu serializers: the descriptor routes through exporttools, the mask verdicts honor in every format and a refused export writes nothing. */
export declare function exportdatacontent(input: {
    scope: "session" | "audit" | "extraction";
    format: string;
    records: Array<Record<string, unknown>>;
    shapes: string[];
    from?: number;
    to?: number;
    path?: string;
}): {
    result: exportresult;
    content: string;
};
/** Parses one recorded page state fixture under schemastrict: the identity, the HTTPS origin, the observation payload of the live snapshot schema, the fixture scoped grants and the recording time; unknown fields refuse with the path that names them. */
export declare function parseheadlessfixture(value: unknown): headlessfixture;
/** Resolves the fixture of one origin: the recorded page state whose origin matches exactly, so a plan replays against the state its review recorded. */
export declare function resolvefixture(fixtures: headlessfixture[], origin: string): headlessfixture;
/**
 * Conversion logic of the 2.0.0 migration bridge, promised by the roadmap 1.1.92 migration tools and carried by this release.
 * Every importer is a pure conversion: it reads one foreign plan source (a version one devthink plan, an automa workflow, a selenium ide side file, a ui vision macro or a tabular csv), maps every entry onto the reviewed plan file step grammar — the kind from the actionkindcatalog, the target as a reviewed css selector, the value and the reviewed json options — and refuses every entry it cannot map with the source entry named, because an importer never guesses a kind, a selector or a value. The converted plan carries no metadata (the frozen plan file grammar allows no provenance field), so the provenance, the field mapping notes and the import date ride the conversion report the terminal prints on stderr. The importers never execute anything and never touch a page: an imported plan enters exactly the same review flow, consent gates and origin grants a hand authored plan enters, and no imported plan inherits a consent grant from its source format.
 */
/** One conversion record of the migration bridge: the converted plan file beside the provenance notes the terminal report prints, because the frozen plan file grammar carries no metadata field — the source format, the source version, the import date and every field mapping note ride this record on stderr and never the plan json an importer produced. */
export interface conversionrecord {
    file: planfile;
    format: string;
    sourceversion: string;
    mapped: number;
    notes: string[];
}
/**
 * Converts one version one era devthink plan into the reviewed plan file grammar of the migration bridge.
 * The legacy grammar this importer reads (documented here because the version one era predates the frozen grammar): the root carries its version, goal, origin, the optional grants and denials and its steps; every step carries its id, its action, its label and the optional selector, value and milliseconds. The action names the reviewed kind directly — the version one vocabulary and the frozen vocabulary share their kind names, so a legacy action outside the reviewed catalog refuses with the step named instead of guessing. The selector becomes the reviewed target, the value becomes the reviewed value, the milliseconds field of a delay action lifts its hardcoded wait onto the reviewed delay option grammar, the sensitive kinds gain their explicit gate declaration, the step identifiers pass through unchanged, and the grants and denials of the devthink source pass through because they are devthink origin declarations rather than foreign consent grants.
 * A source that already parses as the current plan file grammar passes through unchanged, so converting an already converted plan is the identity and the migration is idempotent.
 */
export declare function importv1plan(input: {
    source: unknown;
    now: number;
}): conversionrecord;
/**
 * Converts one automa workflow into the reviewed plan file grammar of the migration bridge.
 * The automa grammar this importer reads: the root carries the workflow name, the optional version and its blocks object keyed by block id; every block carries its type and its optional data. The conversion table: newtab becomes tabcreate with its url as the value, click-element becomes click, forms becomes fillform with its field list as the reviewed options, link becomes click, go-back becomes back, close-tab becomes tabclose, wait becomes delay with its milliseconds lifted onto the reviewed delay option grammar, scroll becomes scroll and screenshot becomes shotview. The trigger block never becomes a plan step: it lands in the conversion report as the paused trigger the scheduler arms only after the plan review. Every other block type refuses with the block named. The plan origin derives from the first newtab url — one plan addresses exactly one origin, so a navigation away from that origin refuses with the block named — the steps follow the block order the workflow file carries, and the block ids become the step ids so the provenance stays traceable.
 * The importer converts only: it opens no tab, fills no form and never executes anything outside the normal consent gates.
 */
export declare function importautoma(input: {
    source: unknown;
    now: number;
}): conversionrecord;
/**
 * Converts one selenium ide side file into the reviewed plan file grammar of the migration bridge.
 * The selenium grammar this importer reads: the root carries its version, name, the base url every open target resolves against and its tests; every test carries its commands, and every command carries its id, command, target and value. One plan addresses exactly one test, so a side file with several tests refuses with the count named. The command table: open becomes navigate with the resolved absolute url as its value, click becomes click, type becomes type, sendKeys becomes appendtext (both deliver keystrokes to the addressed element — type replaces the content and sendKeys appends), select becomes select and pause becomes delay with its milliseconds lifted onto the reviewed delay option grammar. Every other command refuses with the command named. The target grammar accepts the css=, id= and name= locator prefixes; every other locator strategy refuses with the command named.
 * The importer converts only: it opens no page, types no text and never executes anything outside the normal consent gates.
 */
export declare function importselenium(input: {
    source: unknown;
    now: number;
}): conversionrecord;
/**
 * Converts one ui vision (kantu) macro into the reviewed plan file grammar of the migration bridge.
 * The ui vision grammar this importer reads: the root carries the macro Name and its Commands list, and every command carries its Command, Target and Value with the capitalized field names the macro format records. The command table: open becomes navigate with the absolute url as its value, click becomes click, type becomes type and verifyText becomes waittext; every other command refuses with the command named. The macro format carries no step identifiers, so the importer derives stable step ids from the command name and the position that stay stable across reimports of the same macro. The plan origin derives from the first open target — one plan addresses exactly one origin, so a later open away from that origin refuses — and the target grammar accepts the same css=, id= and name= locator prefixes the selenium importer resolves.
 * The importer converts only: it opens no page, clicks nothing and never executes anything outside the normal consent gates.
 */
export declare function importuivision(input: {
    source: unknown;
    now: number;
}): conversionrecord;
/** Parses one csv table into its rows of cells: quoted cells carry their embedded commas, quotes and newlines, a doubled quote inside a quoted cell escapes one quote, the carriage returns of crlf line endings never enter a cell, and a table that ends inside a quoted cell refuses instead of guessing the cell end. */
export declare function parsecsvrows(text: string): string[][];
/**
 * Converts one tabular csv plan into the reviewed plan file grammar of the migration bridge.
 * The tabular grammar this importer reads: the file opens with its preface comment lines — one `# goal:` line and one `# origin:` line — because a csv row set carries no metadata of its own; the header row then names the three columns step, target and value in any order, and every data row becomes one reviewed step: the step cell names the reviewed kind, the target cell names the css selector, the value cell carries the literal value, and the label derives from the kind and the target because a row set carries no labels. A row whose step cell names a kind outside the reviewed catalog refuses with the row named, the step ids derive from the kind and the row position so a reimport of the same table keeps its ids, and the csv parser honors quoted cells with embedded commas, quotes and newlines.
 * The importer converts only: it runs no step and never executes anything outside the normal consent gates.
 */
export declare function importtabular(input: {
    text: string;
    now: number;
}): conversionrecord;
/** Dispatches one migration conversion onto its importer by the format the caller declared: the pure core of the migrateplan command, so the terminal wiring and the tests drive the same conversion. The tabular format reads its text; every other format parses its json first and refuses a source that parses no json with the format named. */
export declare function migrateplanconversion(input: {
    format: string;
    text: string;
    now: number;
}): conversionrecord;
/** Reads the bundle size accounting of every dist target of the library modes: every target name with its byte size grades against its budget, so a bundle that outgrows the budget fails the build before it ships. */
export declare function bundlesizeaccounting(input: Array<{
    target: string;
    bytes: number;
}>): {
    ok: boolean;
    over: Array<{
        target: string;
        bytes: number;
        budget: number;
    }>;
    reason: string;
};
//# sourceMappingURL=cli.d.ts.map