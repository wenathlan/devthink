/**
 * The crossbrowser module of the 1.1.90 consolidation: every correlated variation of the firefox, safari and polyfill browser coverage logic interned in this one file, so the module family carries one surface without duplicate variations.
 * The correlation is the browser coverage family: browserpolyfills probes the webextension namespace differences and promisifies the callback apis behind one polyfill surface with its flags, intersection and namespace mapping; firefoxprep adapts the chromium manifest to the firefox denylist, permission map, action map and split bundle rules; xpipack assembles the firefox xpi archive with its linter budget, central directory and end record; and safariskeleton emits the safari web extension project files with its popover, zip central directory and end record.
 * No permission, denylist entry or archive layout is ever guessed: every mapping stays explicit per browser, and no packaging path ever bypasses the human review.
 */
import type { webextensionbrowser } from "./types.js";
/**
 * Browserpolyfills of the 1.1.86 browser coverage family.
 * Every cross browser normalization of the webextension api the codebase touches lives in this one pure module: the namespace resolver that prefers the browser namespace when present and falls back to the chrome namespace, the callback to promise normalizer that wraps the callback style the older engines speak into the promise shape the reviewed vocabulary reads, the sidepanel polyfill that opens a popup window when the sidepanel api is missing and preserves the review gate layout inside it, the scripting polyfill that falls back to tabs execute script on older engines, the storage polyfill that keeps session tokens under the same keys on every browser, the tabs and windows polyfills that normalize query, create, update and bounds handling, the notifications and contextmenu polyfills that normalize options and item creation, the clipboard, downloads and runtime messaging polyfills that normalize envelopes and shapes, and the runtime geturl polyfill that normalizes the reviewed resource path across browsers. The module stays pure: the browser runtime reaches it through injected seams only, the feature flags default to the intersection set across browsers, the unsupported calls surface as structured errors with the retry hint none instead of a silent fallback, and no vendor endpoint and no download url ever appears here — one reviewed vocabulary speaks every webextension dialect through the polyfill layer.
 * Example: `const polyfills = browserpolyfillof({ runtime: globalThis.chrome ?? globalThis.browser }); const url = polyfills.runtime.geturl("sidepanel.html"); await polyfills.storage.local.set({ key: "value" });`
 */
/** The feature flag set the polyfill layer ships: the flags the sidepanel, scripting, storage, tabs, windows, notifications, downloads, contextmenu, clipboard and runtime messaging namespaces carry; the default set is the intersection across chromium, firefox and safari so a feature surface a single browser lacks stays off everywhere by default. */
export declare const browserpolyfillflags: string[];
/** The intersection default set the polyfill layer stamps: every flag the chromium, firefox and safari apimap rows carry; a single browser surface that lacks an api stays off everywhere by default. */
export declare function browserpolyfillintersection(): string[];
/** Resolves the browser namespace: the polyfill prefers the browser namespace when present (firefox and safari) and falls back to the chrome namespace (chromium); an absent runtime surfaces an undefined so the caller degrades to the structured error. */
export declare function browserpolyfillnamespace(input: {
    runtime?: unknown;
}): {
    namespace: Record<string, unknown> | undefined;
    browser: webextensionbrowser;
};
/** Wraps one callback style webextension call into a promise: the polyfill reads the last argument when it is a function, resolves on the ok callback and rejects on the runtime error the engine reports. */
export declare function browserpolyfillpromisify<T>(input: {
    call: (...args: unknown[]) => void;
    args: unknown[];
}): Promise<T>;
/** Builds the polyfill layer for one runtime: the namespace the resolver picks, the per surface normalizers (sidepanel, scripting, storage, tabs, windows, notifications, downloads, contextmenu, clipboard, runtime) and the feature flags the layer carries; every surface degrades to the structured error on an unsupported browser instead of a silent fallback. */
export declare function browserpolyfillof(input: {
    runtime?: unknown;
}): {
    browser: webextensionbrowser;
    sidepanel: {
        open: (options?: {
            path?: string;
        }) => Promise<{
            ok: boolean;
            fallback: boolean;
            reason?: string;
        }>;
        setoptions: (options: {
            path?: string;
        }) => {
            ok: boolean;
            reason?: string;
        };
    };
    scripting: {
        executescript: (input: {
            tabid: number;
            files?: string[];
            func?: () => void;
        }) => Promise<{
            ok: boolean;
            fallback: boolean;
            reason?: string;
        }>;
    };
    storage: {
        local: {
            get: <T = unknown>(key?: string | string[] | Record<string, unknown> | null) => Promise<Record<string, T>>;
            set: (entries: Record<string, unknown>) => Promise<void>;
        };
        session: {
            get: <T = unknown>(key?: string | string[] | Record<string, unknown> | null) => Promise<Record<string, T>>;
            set: (entries: Record<string, unknown>) => Promise<void>;
        };
    };
    tabs: {
        query: (query: Record<string, unknown>) => Promise<Array<{
            id: number;
            url?: string;
            title?: string;
            active?: boolean;
        }>>;
        create: (properties: Record<string, unknown>) => Promise<{
            id: number;
            url?: string;
        }>;
        update: (tabid: number, properties: Record<string, unknown>) => Promise<{
            id: number;
            url?: string;
        }>;
    };
    windows: {
        create: (properties: Record<string, unknown>) => Promise<{
            id: number;
        }>;
        update: (windowid: number, properties: Record<string, unknown>) => Promise<{
            id: number;
        }>;
    };
    notifications: {
        create: (notificationid: string, options: Record<string, unknown>) => Promise<string>;
    };
    downloads: {
        download: (options: Record<string, unknown>) => Promise<number>;
    };
    contextmenu: {
        create: (properties: Record<string, unknown>) => Promise<string | number>;
    };
    clipboard: {
        read: () => Promise<string>;
        write: (text: string) => Promise<void>;
    };
    runtime: {
        geturl: (path: string) => string;
        sendmessage: (message: unknown) => Promise<unknown>;
        connect: (...args: unknown[]) => unknown;
    };
};
/** The structured error of one unsupported polyfill call: the family, the message, the retry hint and the time, so the caller maps the failure to its next action instead of a bare throw. */
export declare function browserpolyfillstructerrorof(input: {
    family: string;
    message: string;
    browser: webextensionbrowser;
    now: number;
}): {
    family: string;
    message: string;
    retry: "none";
    browser: webextensionbrowser;
    at: number;
};
import type { browsermanifestsource, browsermanifestoverlay, browsermanifestadapted } from "./types.js";
/**
 * Firefoxprep of the 1.1.86 browser coverage family.
 * Every firefox manifest adaptation concern of the cross browser build lives in this one pure module: the manifest overlay the build layers on top of the source manifest (one source manifest with per browser overlays never a separate hand maintained manifest), the browser specific settings the overlay writes with the generated extension id the firefox mv3 build needs, the action key mapping to the firefox equivalents, the service worker to event page move the firefox mv3 background semantics require, the optional permission name rewriting where firefox differs, the empty host permissions the deny by default posture keeps on every browser, the background bundle split for the event page semantics, the deny list that stays in force across overlays and the web accessible resources firefox pattern syntax the overlay carries. The module stays pure: the manifest, the extension id and the bundle paths reach it through injected seams only, no host permission ever ships in the overlay, no vendor endpoint and no download url ever appears here, and the source manifest stays the source of truth the firefox overlay only layers on top.
 * Example: `const overlay = firefoxprepoverlay({ extensionid: "devthink@wenathlan", backgroundscript: "background.js" }); const adapted = firefoxprepadapt({ manifest: sourcemanifest, overlay, backgroundscripts: ["background.js"] });`
 */
/** The firefox permission deny list the overlay keeps in force: the source manifest forbids the debugger, cookies, webRequest, history, bookmarks, proxy and management permissions, and the overlay refuses them across the firefox manifest too — the deny list never widens on firefox. */
export declare const firefoxdenylist: string[];
/** The firefox optional permission name map: the source manifest declares the chromium names, and the overlay rewrites the names that differ between chromium and firefox; the names that stay identical pass through untouched. */
export declare function firefoxpermissionmap(): Record<string, string>;
/** Builds the firefox overlay: the browser specific settings with the generated extension id, the strict min version, the action key mapping, the event page background scripts, the optional permission names that differ, the empty host permissions the deny by default posture keeps, and the web accessible resources pattern syntax firefox speaks. */
export declare function firefoxprepoverlay(input: {
    extensionid?: string;
    strictminversion?: string;
    backgroundscript?: string;
    sidepanel?: boolean;
}): browsermanifestoverlay;
/** Adapts the source manifest for firefox: the overlay layers on top, the background service worker moves to the event page scripts, the action key maps to the firefox equivalents, the optional permission names rewrite where they differ, the host permissions stay empty on every browser, the deny list stays in force across overlays, and the web accessible resources map to the firefox pattern syntax. */
export declare function firefoxprepadapt(input: {
    manifest: browsermanifestsource;
    overlay: browsermanifestoverlay;
    backgroundscripts: string[];
}): browsermanifestadapted;
/** Splits the background bundle for the event page semantics: firefox loads the background as an event page script, so the bundle the chromium build ships as background.js stays the entry, the split keeps the service worker bundle as the firefox background script, and the polyfill layer wraps the namespace differences at runtime. */
export declare function firefoxprepsplitbundle(input: {
    backgroundscript: string;
}): {
    scripts: string[];
    serviceworkerdropped: boolean;
};
/** Verifies the deny list stays in force across the overlay: a forbidden permission the overlay widens into the required set fails the build before the firefox manifest ships. */
export declare function firefoxprepdenylistcheck(input: {
    manifest: browsermanifestsource;
}): {
    ok: boolean;
    refused: string[];
};
/** Maps the action key to the firefox equivalent: the firefox mv3 action key accepts the default_popup, default_title and default_icon shapes the chromium action key already carries; the overlay rewrites the default_popup path the firefox manifest expects. */
export declare function firefoxactionmap(): Record<string, string>;
import type { xpipackinput, xpipackoutput } from "./types.js";
/**
 * Xpipack of the 1.1.86 browser coverage family.
 * Every firefox build packaging concern of the cross browser packaging lives in this one pure module: the zip archive the build assembles from the firefox adapted manifest and the hashed dist bundles, the manifest placement at the archive root the firefox addons linter requires, the artifact name the release version stamps, the hashed asset names the immutable cache contract demands, the addons linter markers the build asserts (errors zero, warnings tolerated), and the entries list the build records for the checksum step. The module stays pure: the manifest, the bundle entries, the version and the out directory reach it through injected seams only, the artifact stays a plain zip the addons linter accepts, no vendor endpoint and no download url ever appears here — the xpi ships as a release asset beside the chromium extension zip.
 * Example: `const output = xpipackassemble({ manifest: firefoxmanifest, bundleentries: [{ name: "background.js", bytes: buffer }], version: "1.1.86" });`
 */
/** The minimum firefox addons linter markers the build asserts: errors zero, warnings tolerated inside the budget the user chose; the build never ships an xpi the linter refuses. */
export declare const xpilinterbudget: {
    errors: number;
    warnings: number;
};
/** The artifact name the release version stamps: the xpi carries the devthink-<version>.xpi shape the firefox addons store expects and the release workflow attaches beside the chromium zip. */
export declare function xpinameof(version: string): string;
/** The manifest placement the firefox addons linter requires: the manifest.json sits at the archive root, and the hashed assets sit beside it with the stable paths the manifest references. */
export declare function xpimanifestname(): string;
/** Assembles the firefox build into a zip ready for signing: the manifest sits at the archive root, the hashed assets sit beside it, the artifact name carries the release version, and the addons linter markers the build asserts stay inside the budget; the assemble stays pure and reads the bundle entries the build emits. Every offset, size and count the zip structure carries mirrors the entry the archive wrote, so the standard unzip tooling and the addons linter read the archive without a repair pass. */
export declare function xpipackassemble(input: xpipackinput): xpipackoutput;
/** Builds one local file header of the zip archive: the signature, the version, the flags, the compression method (stored), the file name and the bytes the entry carries; the xpipack stores every entry uncompressed because the firefox addons linter reads the manifest and the bundles without a deflate step. */
export declare function xpimanifestheader(name: string, bytes: Buffer): Buffer;
/** Builds the central directory of the zip archive: one entry per archive file with its name, its stored size and the true offset its local file header sits at — the offsets and sizes the unzip tooling and the addons linter read, so a record that drifts from the written bytes fails the reader instead of confusing it. */
export declare function xpicentraldirectory(records: Array<{
    name: string;
    size: number;
    offset: number;
}>): {
    bytes: Buffer;
    offsets: number[];
};
/** Builds the end of central directory record the zip archive carries: the entry count, the central directory size and the true offset the central directory sits at — the offset the standard unzip tooling seeks before it lists one entry. */
export declare function xpiendrecord(entrycount: number, centralsize: number, centralstart: number): Buffer;
/** Asserts the addons linter markers the build asserts: the errors stay zero and the warnings stay under the budget the user chose; an xpi the linter refuses fails the build before it ships. */
export declare function xpipacklintercheck(input: {
    markers: {
        errors: number;
        warnings: number;
    };
    budget: {
        errors: number;
        warnings: number;
    };
}): {
    ok: boolean;
    reason?: string;
};
/** Lists the entries the xpipack archive carries: the manifest, the background bundle, the page bundles and the hashed assets the build records for the checksum step. */
export declare function xpipackentriesof(output: xpipackoutput): string[];
import type { safariskeletoninput, safariskeletonoutput } from "./types.js";
/**
 * Safariskeleton of the 1.1.86 browser coverage family.
 * Every safari app extension wrapper concern of the cross browser packaging lives in this one pure module: the xcode project wrapper the build generates around the chromium extension payload, the embedding of the chromium build as the safari web extension payload, the app entitlements the wrapper declares for the extension distribution, the minimal app shell that opens the extension, and the sidepanel surface the safari build renders as a popover equivalent. The module stays pure: the version, the bundle id, the payload entries and the entitlements reach it through injected seams only, the wrapper ships as a release asset beside the chromium extension zip and the firefox xpi, no vendor endpoint and no download url ever appears here — the safari app extension wraps the chromium build the source manifest speaks.
 * Example: `const output = safariskeletonbuild({ version: "1.1.86", bundleid: "com.wenathlan.devthink", extensionpayload: [{ name: "manifest.json", bytes: buffer }], entitlements: ["com.apple.security.app-sandbox"] });`
 */
/** The minimal xcode project wrapper the build generates around the chromium extension payload: the project file, the app target, the app extension target, the resources copy phase and the embedded app extension. */
export declare function safariskeletonprojectfiles(): Array<{
    path: string;
    text: string;
}>;
/** Builds the safari app extension wrapper around the chromium extension payload: the project files, the entitlements, the minimal app shell and the archive bytes the release workflow attaches beside the chromium zip and the firefox xpi. */
export declare function safariskeletonbuild(input: safariskeletoninput): safariskeletonoutput;
/** The popover equivalent the safari build renders for the sidepanel surface: the safari app extension opens a popover with the same review gate layout the sidepanel polyfill carries on the chromium build. */
export declare function safariskeletonpopoverof(): {
    path: string;
    bounds: {
        width: number;
        height: number;
    };
};
/** Builds one local file header of the safari skeleton zip archive (stored, no compression) for the wrapper files and the embedded chromium payload. */
export declare function safarizipfile(name: string, bytes: Buffer): Buffer;
/** Builds the central directory of the safari skeleton zip archive: one entry per archive file with its name, its stored size and the true offset its local file header sits at, so the standard unzip tooling lists the wrapper without a repair pass. */
export declare function safaricentraldirectory(records: Array<{
    name: string;
    size: number;
    offset: number;
}>): {
    bytes: Buffer;
};
/** Builds the end of central directory record the safari skeleton zip archive carries: the entry count, the central directory size and the true offset the central directory sits at, so the standard unzip tooling seeks the directory before it lists one entry. */
export declare function safariendrecord(entrycount: number, centralsize: number, centralstart: number): Buffer;
//# sourceMappingURL=crossbrowser.d.ts.map