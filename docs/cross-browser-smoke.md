# Cross browser smoke walkthrough

This walkthrough loads the three artifacts the 1.1.86 cross browser build ships (the chromium zip, the firefox xpi and the safari skeleton zip) into one offline smoke. The kind catalog, the policy gates, the observation schema and the audit trail format stay identical on every browser — this walkthrough proves that in five minutes from the local checkout.

## 1. Build every cross browser artifact offline

```bash
pnpm build
```

The build emits `extension/devthink<version>.zip` (chromium), `extension/devthink-firefox-<version>.xpi` (firefox) and `extension/devthink-safari-<version>.zip` (safari skeleton) beside the existing dist bundles. No network call runs during the build — the firefox overlay layers through `firefoxprep`, the xpi assembles through `xpipack` with stored entries the addons linter reads without a deflate step, and the safari skeleton wraps the chromium payload through `safariskeleton`.

## 2. Verify the apimap build check

```bash
node -e "import('./dist/apimap.js').then(module => { const report = module.apimapunmapped(module.apimapentries()); if (report.failed) throw new Error(report.reason); console.log(JSON.stringify({ rows: report.rows.length, missingchromium: report.missingchromium.length, missingfirefox: report.missingfirefox.length, missingsafari: report.missingsafari.length })); })"
```

The apimap catalog carries every webextension api the codebase touches with a chromium and a firefox mapping; a missing row fails the build before any cross browser artifact ships. The command prints `missingchromium: 0, missingfirefox: 0` because the build already asserted the same check.

## 3. Run the firefox prep step offline

```bash
node -e "import('./dist/firefoxprep.js').then(module => { const overlay = require('./manifest.json').browsers.firefox; const source = require('./manifest.json'); const adapted = module.firefoxprepadapt({ manifest: source, overlay, backgroundscripts: ['background.js'] }); if (adapted.manifest.host_permissions.length !== 0) throw new Error('The firefox overlay must keep host permissions empty.'); if (adapted.manifest.browser_specific_settings.gecko.id !== 'devthink@wenathlan') throw new Error('The firefox overlay must carry the generated extension id.'); console.log(JSON.stringify({ valid: true, browser: adapted.overlay.browser, changes: adapted.changes.length })); })"
```

The firefox overlay writes the `browser_specific_settings.gecko.id`, the strict min version, the action key mapping, the event page background scripts, the optional permission names that differ and the empty host permissions the deny by default posture keeps. The deny list (`debugger`, `cookies`, `webRequest`, `history`, `bookmarks`, `proxy`, `management`) stays in force across overlays.

## 4. Inspect the xpi layout and the addons linter markers

```bash
unzip -l extension/devthink-firefox-<version>.xpi
node -e "import('./dist/xpipack.js').then(module => { const manifest = require('./manifest.json'); const overlay = require('./manifest.json').browsers.firefox; const firefoxprep = require('./dist/firefoxprep.js'); const adapted = firefoxprep.firefoxprepadapt({ manifest, overlay, backgroundscripts: ['background.js'] }); const output = module.xpipackassemble({ manifest: adapted.manifest, bundleentries: [{ name: 'background.js', bytes: new Uint8Array([0]) }], version: require('./package.json').version }); const check = module.xpipacklintercheck({ markers: output.lintermarkers, budget: module.xpilinterbudget }); if (!check.ok) throw new Error(check.reason); console.log(JSON.stringify({ archive: output.archive.name, manifest: output.manifestname, entries: output.entries, errors: output.lintermarkers.errors })); })"
```

The manifest sits at the archive root the firefox addons linter requires, the hashed assets sit beside it, and the addons linter markers stay at `errors: 0` inside the budget the build asserts. Run the actual addons linter when it is installed (`addons-linter extension/devthink-firefox-<version>.xpi`); the local suite covers the markers check when the linter is absent.

## 5. Inspect the safari skeleton wrapper

```bash
unzip -l extension/devthink-safari-<version>.zip
node -e "import('./dist/safariskeleton.js').then(module => { const output = module.safariskeletonbuild({ version: require('./package.json').version, bundleid: 'com.wenathlan.devthink', extensionpayload: [{ name: 'manifest.json', bytes: new Uint8Array([0]) }], entitlements: ['com.apple.security.app-sandbox'] }); const plist = output.projectfiles.find(file => file.path.endsWith('Info.plist')); if (!plist || !plist.text.includes(require('./package.json').version)) throw new Error('The safari skeleton must stamp the release version into the Info.plist.'); console.log(JSON.stringify({ archive: output.archive.name, projectfiles: output.projectfiles.length, appshell: output.appshell, entitlements: output.entitlements })); })"
```

The safari skeleton embeds the chromium extension payload as the safari web extension payload, declares the app entitlements (`com.apple.security.app-sandbox` and `com.apple.security.network.client`), and includes the minimal `AppDelegate.swift` shell that opens the extension through `SFSafariApplication.showPreferencesForExtension(withIdentifier:)`. The release version stamps into `Info.plist` and the bundle id stamps into the entitlements file.

## 6. Verify the intersection default set

```bash
node -e "import('./dist/apimap.js').then(module => { const intersection = module.apifeatureflagintersection(); console.log(JSON.stringify({ intersection })); })"
node -e "import('./dist/browserpolyfills.js').then(module => { const intersection = module.browserpolyfillintersection(); console.log(JSON.stringify({ intersection })); })"
```

The cross browser feature flags default to the intersection across chromium, firefox and safari — a feature surface a single browser lacks stays off everywhere by default. The `nativeMessaging` row reports `safari: ""` because the native transport stays chromium first and reports `unsupported` elsewhere; the user can widen the feature set per browser through the options page, the consent gate stays the reviewed surface and the audit trail records every grant.

## 7. Load each artifact into the matching browser

- **Chromium**: load `extension/devthink<version>.zip` as an unpacked extension in dev mode, or load the unpacked `extension/dist/` directory directly. The chromium build is the source manifest.
- **Firefox**: load `extension/devthink-firefox-<version>.xpi` through `about:debugging` → This Firefox → Load Temporary Add-on. The firefox overlay carries the generated extension id `devthink@wenathlan` and the event page background scripts.
- **Safari**: open the `devthink-safari-<version>.zip` contents in xcode, sign with the developer certificate and notarize through the apple notarization service. The safari build renders the sidepanel surface as a popover equivalent.

The consent gate, the review cards, the approval flow and the kill switch work identically inside every browser. The bridge pairing works from any browser build to the same relay through the same negotiated contract version.

The full coverage is in docs/18.browsercoverage.md.
