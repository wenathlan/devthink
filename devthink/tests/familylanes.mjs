/** The one-shot migration of the family artifact lanes to the release doctrine (the 300+ assets wave). */
import { readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const repoRoot = resolve(process.cwd(), "..");

/* the canonical body of the desktop lane (the matrix restructure the one-shot
 * migration writes): the body lives embedded as a joined line array — a
 * canonical file beside this module would duplicate the tracked workflow
 * content the flat structure contract refuses, and a template literal would
 * fight every workflow expression the body carries, so the lines ride as
 * json-escaped strings and land byte-identical. */
const DESKTOP_CANONICAL = [
  "name: Family Desktop",
  "",
  "# The universal desktop artifact lane of the family: every member",
  "# application of the family builds the tauri desktop shell from the same",
  "# workflow \u2014 the matrix crosses the application axis with the seven",
  "# platform entries the saddle recipe validated. A manual run answers one",
  "# chosen application across every desktop target; a published release",
  "# answers the whole member family at once (the nine sibling applications \u2014",
  "# argan through vault \u2014 because the devthink application rides its own",
  "# publish lane on releases and the family lane never duplicates the os",
  "# assets the publish lane already ships), which is the doctrine the owner",
  "# pinned: every application holds the same desktop rights the os holds,",
  "# and only the iso stays os exclusive. The identity (productName,",
  "# identifier, version) is read from the tauri.conf.json and the",
  "# package.json each application tracks, never hardcoded; the vite build",
  "# answers straight at the application root; the runner stages the",
  "# delivered surface under build/web and the scaffold aims its",
  "# frontendDist at that staging; and the rust envelope stays runner-side",
  "# toolchain output (materialized under build/native/desktop, never",
  "# committed). Every job attaches its own assets to the release and",
  "# attests them (the signed by GitHub provenance the release machinery",
  "# carries family wide).",
  "",
  "on:",
  "  release:",
  "    types: [published]",
  "  workflow_dispatch:",
  "    inputs:",
  "      app:",
  "        description: the application the desktop shells build for",
  "        type: choice",
  "        options:",
  "          - devthink",
  "          - argan",
  "          - cadria",
  "          - debonair",
  "          - forge",
  "          - foundry",
  "          - getry",
  "          - saddle",
  "          - stealthhead",
  "          - vault",
  "        default: devthink",
  "",
  "permissions:",
  "  contents: read",
  "",
  "concurrency:",
  "  group: family-desktop-${{ github.event_name }}",
  "  cancel-in-progress: false",
  "",
  "jobs:",
  "  desktop:",
  "    name: desktop ${{ matrix.app }} ${{ matrix.platform }}",
  "    runs-on: ${{ matrix.os }}",
  "    timeout-minutes: 60",
  "    permissions:",
  "      # the release attachment and the artifact attestation the lane owns",
  "      contents: write",
  "      attestations: write",
  "      id-token: write",
  "    strategy:",
  "      fail-fast: false",
  "      matrix:",
  "        # the application axis: a published release walks the nine member",
  "        # applications (the os rides the publish lane and never duplicates",
  "        # itself here), a manual dispatch walks the one chosen application",
  '        app: ${{ github.event_name == \'release\' && fromJSON(\'["argan","cadria","debonair","forge","foundry","getry","saddle","stealthhead","vault"]\') || fromJSON(format(\'["{0}"]\', inputs.app)) }}',
  "        platform: [linux-x64, linux-arm64, windows-x86, windows-x64, windows-arm64, macos-x64, macos-arm64]",
  "        include:",
  '          - { platform: linux-x64, os: ubuntu-24.04, target: x86_64-unknown-linux-gnu, bundles: "deb,rpm,appimage", architecture: x64 }',
  '          - { platform: linux-arm64, os: ubuntu-24.04-arm, target: aarch64-unknown-linux-gnu, bundles: "deb,rpm,appimage", architecture: arm64 }',
  "          - { platform: windows-x86, os: windows-2025, target: i686-pc-windows-msvc, bundles: nsis, architecture: x86 }",
  '          - { platform: windows-x64, os: windows-2025, target: x86_64-pc-windows-msvc, bundles: "nsis,msi", architecture: x64 }',
  "          - { platform: windows-arm64, os: windows-2025, target: aarch64-pc-windows-msvc, bundles: nsis, architecture: arm64 }",
  '          - { platform: macos-x64, os: macos-15-intel, target: x86_64-apple-darwin, bundles: "app,dmg", architecture: x64 }',
  '          - { platform: macos-arm64, os: macos-14, target: aarch64-apple-darwin, bundles: "app,dmg", architecture: arm64 }',
  "    env:",
  "      APP: ${{ matrix.app }}",
  "    steps:",
  "      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1",
  "      - name: resolve the application version",
  "        id: appversion",
  "        shell: bash",
  "        run: |",
  "          set -euo pipefail",
  '          version="$(node -p "require(\'./${{ matrix.app }}/package.json\').version")"',
  '          echo "version=$version" >> "$GITHUB_OUTPUT"',
  "      - name: Set up Node",
  "        uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0",
  "        with:",
  "          node-version: 26.12.0",
  "      - name: Set up Bun",
  "        if: ${{ matrix.app == 'devthink' }}",
  "        uses: oven-sh/setup-bun@0c5077e51419868618aeaa5fe8019c62421857d6 # v2.2.0",
  "        with:",
  "          bun-version: 1.4.2",
  "      - name: Set up pnpm",
  "        if: ${{ matrix.app != 'devthink' && matrix.app != 'saddle' }}",
  "        uses: pnpm/action-setup@ea17c68df8912ef543352723c149a84f56e3d413 # v6.1.0",
  "        with:",
  "          version: 12.8.1",
  "      - name: install linux webkit dependencies",
  "        if: runner.os == 'Linux'",
  "        shell: bash",
  "        run: |",
  "          set -euo pipefail",
  "          sudo apt-get update",
  "          sudo apt-get install -y build-essential curl file libayatana-appindicator3-dev libssl-dev libwebkit2gtk-4.1-dev libxdo-dev librsvg2-dev patchelf rpm",
  "      - name: install the dependencies",
  "        shell: bash",
  "        run: |",
  "          set -euo pipefail",
  '          case "${{ matrix.app }}" in',
  '            devthink) cd "$APP" && bun install --frozen-lockfile ;;',
  '            saddle) npm --prefix "$APP" ci ;;',
  '            *) pnpm --dir "$APP" install --frozen-lockfile ;;',
  "          esac",
  "      - name: build and stage the web surface",
  "        # the build answers straight at the application root: the staging",
  "        # copies the entry and the hashed bundles into build/web, the folder",
  "        # the tauri scaffold aims its frontendDist at (the runner-side",
  "        # toolchain area, never committed).",
  "        shell: bash",
  "        run: |",
  "          set -euo pipefail",
  '          cd "$APP"',
  '          case "${{ matrix.app }}" in',
  "            devthink) npm run build:web ;;",
  "            saddle) npm run web:build:pages ;;",
  "            *) pnpm run build ;;",
  "          esac",
  "          test -f index.html",
  "          mkdir -p build/web",
  "          cp index.html build/web/",
  "          for kind in js css webmanifest xml txt svg png ico woff woff2; do",
  "            cp *.${kind} build/web/ 2>/dev/null || true",
  "          done",
  "          test -f build/web/index.html",
  "      - name: install the rust toolchain",
  "        uses: dtolnay/rust-toolchain@b725eda525362e7cf34af9a7243cac1e3f01a7ec # stable",
  "        with:",
  "          targets: ${{ matrix.target }}",
  "      - name: scaffold the desktop rust shell",
  "        # the runner-side scaffold (the native wrapper doctrine): the cargo",
  "        # manifest, the entry sources and the copied tauri config with",
  "        # runner-relative paths live under build/native/desktop, three",
  "        # levels below the application root.",
  "        shell: bash",
  "        run: |",
  "          set -euo pipefail",
  '          cd "$APP"',
  "          mkdir -p build/native/desktop",
  "          cd build/native/desktop",
  "          cat > Cargo.toml <<'CARGO_EOF'",
  "          [package]",
  '          name = "family-desktop-shell"',
  '          version = "0.0.0"',
  '          authors = ["wenathlan"]',
  '          edition = "2021"',
  '          license = "GPL-3.0-only"',
  '          build = "build.rs"',
  "",
  "          [lib]",
  '          name = "family_desktop_shell"',
  '          path = "lib.rs"',
  '          crate-type = ["staticlib", "cdylib", "rlib"]',
  "",
  "          [[bin]]",
  '          name = "family-desktop-shell"',
  '          path = "main.rs"',
  "",
  "          [build-dependencies]",
  '          tauri-build = { version = "2", features = [] }',
  "",
  "          [dependencies]",
  '          tauri = { version = "2", features = [] }',
  "          CARGO_EOF",
  "          cat > main.rs <<'MAIN_EOF'",
  "          fn main() {",
  "              family_desktop_shell::run()",
  "          }",
  "          MAIN_EOF",
  "          cat > lib.rs <<'LIB_EOF'",
  "          #[cfg_attr(mobile, tauri::mobile_entry_point)]",
  "          pub fn run() {",
  "              tauri::Builder::default()",
  "                  .run(tauri::generate_context!())",
  '                  .expect("failed to run the family desktop shell")',
  "          }",
  "          LIB_EOF",
  "          cat > build.rs <<'BUILD_EOF'",
  "          fn main() {",
  "              tauri_build::build()",
  "          }",
  "          BUILD_EOF",
  "          # the single quotes guard the JS template literals of the node",
  "          # program from shell expansion; the dollar braces belong to JS.",
  "          # shellcheck disable=SC2016",
  "          node -e '",
  '            const fs = require("node:fs");',
  '            const config = JSON.parse(fs.readFileSync("../../../tauri.conf.json", "utf8"));',
  '            config.build.frontendDist = "../../../build/web";',
  '            config.build.beforeDevCommand = "echo the runner builds the web surface through the staging lane";',
  '            fs.writeFileSync("tauri.conf.json", `${JSON.stringify(config, null, 2)}\\n`);',
  '            console.log("copied the tracked tauri.conf.json into the scaffold with runner-relative paths");',
  "          '",
  "      - name: stamp the scaffold version",
  "        shell: bash",
  "        env:",
  "          APP_VERSION: ${{ steps.appversion.outputs.version }}",
  "        run: |",
  "          set -euo pipefail",
  '          cd "$APP"',
  "          # shellcheck disable=SC2016",
  '          node -e \'const fs=require("node:fs"); const version=process.env.APP_VERSION; const config=JSON.parse(fs.readFileSync("build/native/desktop/tauri.conf.json","utf8")); config.version=version; fs.writeFileSync("build/native/desktop/tauri.conf.json", `${JSON.stringify(config, null, 2)}\\n`); const cargo=fs.readFileSync("build/native/desktop/Cargo.toml","utf8").replace(/^version = ".*"$/m, `version = "${version}"`); fs.writeFileSync("build/native/desktop/Cargo.toml", cargo);\'',
  "      - name: generate platform icons",
  "        shell: bash",
  '        run: cd "$APP" && npx --yes @tauri-apps/cli@2.11.4 icon icon.svg --output build/native/desktop/icons',
  "      - name: configure desktop signing status",
  "        # the caller-owned certificate when the platform secrets exist, the",
  "        # unsigned path (skipped sign and notarize steps) otherwise - the",
  "        # manifest records which.",
  "        shell: bash",
  "        env:",
  "          WINDOWS_CERTIFICATE_BASE64: ${{ secrets.WINDOWS_CERTIFICATE_BASE64 }}",
  "          WINDOWS_CERTIFICATE_PASSWORD: ${{ secrets.WINDOWS_CERTIFICATE_PASSWORD }}",
  "          APPLE_CERTIFICATE: ${{ secrets.APPLE_CERTIFICATE }}",
  "          APPLE_CERTIFICATE_PASSWORD: ${{ secrets.APPLE_CERTIFICATE_PASSWORD }}",
  "          APPLE_SIGNING_IDENTITY: ${{ secrets.APPLE_SIGNING_IDENTITY }}",
  "        run: |",
  "          set -euo pipefail",
  '          if [ "$RUNNER_OS" = "Windows" ] && [ -n "${WINDOWS_CERTIFICATE_BASE64:-}" ] && [ -n "${WINDOWS_CERTIFICATE_PASSWORD:-}" ]; then',
  '            echo "FAMILY_SIGNING=caller-owned" >> "$GITHUB_ENV"',
  '          elif [ "$RUNNER_OS" = "macOS" ] && [ -n "${APPLE_CERTIFICATE:-}" ] && [ -n "${APPLE_CERTIFICATE_PASSWORD:-}" ] && [ -n "${APPLE_SIGNING_IDENTITY:-}" ]; then',
  '            echo "FAMILY_SIGNING=caller-owned" >> "$GITHUB_ENV"',
  "          else",
  '            echo "FAMILY_SIGNING=unsigned" >> "$GITHUB_ENV"',
  "          fi",
  "      - name: configure macos signing keychain",
  "        if: runner.os == 'macOS' && env.FAMILY_SIGNING == 'caller-owned'",
  "        shell: bash",
  "        env:",
  "          APPLE_CERTIFICATE: ${{ secrets.APPLE_CERTIFICATE }}",
  "          APPLE_CERTIFICATE_PASSWORD: ${{ secrets.APPLE_CERTIFICATE_PASSWORD }}",
  "          APPLE_SIGNING_IDENTITY: ${{ secrets.APPLE_SIGNING_IDENTITY }}",
  "          KEYCHAIN_PASSWORD: ${{ secrets.KEYCHAIN_PASSWORD }}",
  "        run: |",
  "          set -euo pipefail",
  '          keychain="$RUNNER_TEMP/family-desktop.keychain-db"',
  '          security create-keychain -p "$KEYCHAIN_PASSWORD" "$keychain"',
  '          security set-keychain-settings -lut 21600 "$keychain"',
  '          security unlock-keychain -p "$KEYCHAIN_PASSWORD" "$keychain"',
  '          printf \'%s\' "$APPLE_CERTIFICATE" | base64 --decode > "$RUNNER_TEMP/family-desktop.p12"',
  '          security import "$RUNNER_TEMP/family-desktop.p12" -P "$APPLE_CERTIFICATE_PASSWORD" -A -t cert -f pkcs12 -k "$keychain"',
  '          security set-key-partition-list -S apple-tool:,apple: -s -k "$KEYCHAIN_PASSWORD" "$keychain"',
  '          security list-keychains -d user -s "$keychain"',
  '          security default-keychain -s "$keychain"',
  '          echo "APPLE_SIGNING_IDENTITY_EXPORTED=$APPLE_SIGNING_IDENTITY" >> "$GITHUB_ENV"',
  "      - name: build desktop bundles",
  "        shell: bash",
  "        run: |",
  "          set -euo pipefail",
  '          cd "$APP/build/native/desktop"',
  '          if [ "${FAMILY_SIGNING}" = "caller-owned" ]; then',
  '            npx --yes @tauri-apps/cli@2.11.4 build --ci --target "${{ matrix.target }}" --bundles "${{ matrix.bundles }}"',
  "          else",
  '            npx --yes @tauri-apps/cli@2.11.4 build --ci --no-sign --target "${{ matrix.target }}" --bundles "${{ matrix.bundles }}"',
  "          fi",
  "      - name: sign windows installers",
  "        if: runner.os == 'Windows' && env.FAMILY_SIGNING == 'caller-owned'",
  "        shell: pwsh",
  "        env:",
  "          WINDOWS_CERTIFICATE_BASE64: ${{ secrets.WINDOWS_CERTIFICATE_BASE64 }}",
  "          WINDOWS_CERTIFICATE_PASSWORD: ${{ secrets.WINDOWS_CERTIFICATE_PASSWORD }}",
  "          WINDOWS_TIMESTAMP_URL: ${{ vars.WINDOWS_TIMESTAMP_URL }}",
  "        run: |",
  '          $ErrorActionPreference = "Stop"',
  '          [IO.File]::WriteAllBytes("$env:RUNNER_TEMP\\family-code-signing.pfx", [Convert]::FromBase64String($env:WINDOWS_CERTIFICATE_BASE64))',
  '          Get-ChildItem "$env:APP\\build\\native\\desktop\\target\\${{ matrix.target }}\\release\\bundle" -Recurse -Include *.exe,*.msi | ForEach-Object {',
  '            signtool sign /fd SHA256 /td SHA256 /tr $env:WINDOWS_TIMESTAMP_URL /f "$env:RUNNER_TEMP\\family-code-signing.pfx" /p $env:WINDOWS_CERTIFICATE_PASSWORD $_.FullName',
  "            signtool verify /pa /all $_.FullName",
  "          }",
  "      - name: notarize macos installers",
  "        if: runner.os == 'macOS' && env.FAMILY_SIGNING == 'caller-owned'",
  "        shell: bash",
  "        env:",
  "          APPLE_ID: ${{ secrets.APPLE_ID }}",
  "          APPLE_APP_PASSWORD: ${{ secrets.APPLE_APP_PASSWORD }}",
  "          APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}",
  "        run: |",
  "          set -euo pipefail",
  '          for dmg in "$APP"/build/native/desktop/target/${{ matrix.target }}/release/bundle/dmg/*.dmg; do',
  '            xcrun notarytool submit "$dmg" --apple-id "$APPLE_ID" --password "$APPLE_APP_PASSWORD" --team-id "$APPLE_TEAM_ID" --wait',
  '            xcrun stapler staple "$dmg"',
  "          done",
  "      - name: collect desktop artifacts",
  "        shell: bash",
  "        env:",
  "          APP_VERSION: ${{ steps.appversion.outputs.version }}",
  "        run: |",
  "          set -euo pipefail",
  '          cd "$APP"',
  '          version="${APP_VERSION}"',
  "          mkdir -p build/release-assets/desktop",
  "          collected=0",
  "          while IFS= read -r -d '' bundle; do",
  '            [ -f "$bundle" ] || continue',
  '            case "$bundle" in',
  "              *.deb|*.rpm|*.AppImage|*.exe|*.msi|*.dmg)",
  '                ext="${bundle##*.}"',
  '                [ "$ext" = "AppImage" ] && ext="appimage"',
  '                asset="${{ matrix.app }}.desktop.${version}.${{ matrix.platform }}.${ext}"',
  '                cp "$bundle" "build/release-assets/desktop/${asset}"',
  "                collected=$((collected + 1))",
  "                ;;",
  "              *.app)",
  '                asset="${{ matrix.app }}.desktop.${version}.${{ matrix.platform }}.app.zip"',
  '                ditto -c -k --sequesterRsrc --keepParent "$bundle" "build/release-assets/desktop/${asset}"',
  "                collected=$((collected + 1))",
  "                ;;",
  "            esac",
  '          done < <(find "build/native/desktop/target/${{ matrix.target }}/release/bundle" -print0 2>/dev/null)',
  '          test "$collected" -gt 0',
  "          if command -v sha256sum >/dev/null 2>&1; then",
  "            sha256sum build/release-assets/desktop/* | sed 's#build/release-assets/desktop/##' > \"build/release-assets/desktop/${{ matrix.app }}.sha256.desktop.${{ matrix.platform }}.${version}\"",
  "          else",
  "            shasum -a 256 build/release-assets/desktop/* | sed 's#build/release-assets/desktop/##' > \"build/release-assets/desktop/${{ matrix.app }}.sha256.desktop.${{ matrix.platform }}.${version}\"",
  "          fi",
  '          printf \'{\\n  "version": "%s",\\n  "application": "%s",\\n  "platform": "desktop-tauri",\\n  "target": "%s",\\n  "bundles": "%s",\\n  "signing": "%s",\\n  "notarization": "%s"\\n}\\n\' "$version" "${{ matrix.app }}" "${{ matrix.target }}" "${{ matrix.bundles }}" "${FAMILY_SIGNING:-unsigned}" "${FAMILY_NOTARIZATION:-none}" > "build/release-assets/desktop/${{ matrix.app }}.manifest.desktop.${{ matrix.platform }}.${version}.json"',
  "      - uses: actions/upload-artifact@cf430e030ddbb5b0abf93d22962f4752f3646cd9 # v7.0.2",
  "        with:",
  "          name: ${{ matrix.app }}.desktop.${{ matrix.platform }}.${{ steps.appversion.outputs.version }}",
  "          path: ${{ matrix.app }}/build/release-assets/desktop",
  "          if-no-files-found: error",
  "      - name: attach desktop assets to the release",
  "        # the doctrine the owner pinned: every member application ships its",
  "        # desktop lanes on the release the os ships (the capacitor, the",
  "        # installers, the checksums - the same rights, only the iso stays",
  "        # os exclusive), and the lane attaches its own assets the moment it",
  "        # builds them (--clobber keeps a re-run idempotent over its own",
  "        # names, which carry the application prefix and never collide with",
  "        # another lane's grammar)",
  "        if: github.event_name == 'release'",
  "        env:",
  "          GH_TOKEN: ${{ github.token }}",
  '        run: gh release upload "${{ github.event.release.tag_name }}" "${{ matrix.app }}/build/release-assets/desktop/*" --clobber',
  "      - name: attest the desktop assets",
  "        # the signed by GitHub provenance the release machinery carries",
  "        # family wide: every artifact this lane ships answers the workflow",
  "        # identity the same way the os release assets answer it",
  "        if: github.event_name == 'release'",
  "        uses: actions/attest@1e69f48acb82d1966a394da916b4c1698aa569d6 # v4.2.2",
  "        with:",
  "          subject-path: ${{ matrix.app }}/build/release-assets/desktop/*",
  "          show-snippet: false",
  "",
].join("\n");

/* The markers the migrated mobile lane carries (the one-shot grammar: once
 * every marker answers, the lane is migrated and this migration never
 * compares the file again — the maintenance ladders own the mutable pins
 * afterward, so this walk never fights them). */
const MOBILE_MARKERS = [
  'include: \${{ github.event_name == \'release\' && fromJson(\'[{"app":"argan"',
  "attest the android assets",
  "attest the ios assets",
  "${{ matrix.app }}.sha256.android.",
  "${{ matrix.app }}.manifest.android.",
  "${{ matrix.app }}.sha256.iosipa.",
  "${{ matrix.app }}.manifest.iosipa.",
];

/** The marker the migrated desktop lane carries. */
const DESKTOP_MARKER = "types: [published]";
/** The marker the migrated ladder lane carries. */
const LADDER_MARKER = "the auto-tag lane of the main push cuts the tag";

/** The surgical transforms of the mobile lane: the release doctrine rides
 *  both jobs — the attachment permissions the lane lacked (the workflow
 *  level answers contents: read, so every release upload the lane ever
 *  attempted died at the permission wall before a single family asset
 *  landed), the matrix-level os exclusion on release events (the os rides
 *  its own publish lane and never duplicates itself here — the exclusion
 *  walks the matrix expression itself because a job-level if never answers
 *  the matrix context, the exact schema refusal the first automation branch
 *  met), the per-application namespacing of the checksum and manifest
 *  records (the bare names clobbered across the matrix and over the os
 *  lane's own records), and the attestation pass beside every attachment
 *  (the signed by GitHub provenance the os release assets already carry). */
function mobilelane(content) {
  let next = content;
  next = next.replace(
    "    strategy:\n      fail-fast: false\n      matrix:\n        include:\n          - { app: devthink, pm: bun }\n          - { app: argan, pm: pnpm }\n          - { app: cadria, pm: pnpm }\n          - { app: debonair, pm: pnpm }\n          - { app: forge, pm: pnpm }\n          - { app: foundry, pm: pnpm }\n          - { app: getry, pm: pnpm }\n          - { app: saddle, pm: npm }\n          - { app: stealthhead, pm: pnpm }\n          - { app: vault, pm: pnpm }\n",
    '    strategy:\n      fail-fast: false\n      matrix:\n        # the application axis answers the event: a published release walks\n        # the nine member applications (the os rides its own publish lane\n        # and never duplicates itself here), every other firing walks the\n        # full matrix the lane always served, devthink included\n        include: ${{ github.event_name == \'release\' && fromJson(\'[{"app":"argan","pm":"pnpm"},{"app":"cadria","pm":"pnpm"},{"app":"debonair","pm":"pnpm"},{"app":"forge","pm":"pnpm"},{"app":"foundry","pm":"pnpm"},{"app":"getry","pm":"pnpm"},{"app":"saddle","pm":"npm"},{"app":"stealthhead","pm":"pnpm"},{"app":"vault","pm":"pnpm"}]\') || fromJson(\'[{"app":"devthink","pm":"bun"},{"app":"argan","pm":"pnpm"},{"app":"cadria","pm":"pnpm"},{"app":"debonair","pm":"pnpm"},{"app":"forge","pm":"pnpm"},{"app":"foundry","pm":"pnpm"},{"app":"getry","pm":"pnpm"},{"app":"saddle","pm":"npm"},{"app":"stealthhead","pm":"pnpm"},{"app":"vault","pm":"pnpm"}]\') }}\n',
  );
  next = next.replace(
    "  android:\n    name: android ${{ matrix.app }}\n    runs-on: ubuntu-24.04\n    timeout-minutes: 45\n",
    "  android:\n    name: android ${{ matrix.app }}\n    runs-on: ubuntu-24.04\n    timeout-minutes: 45\n    permissions:\n      # the release attachment and the artifact attestation the lane owns\n      contents: write\n      attestations: write\n      id-token: write\n",
  );
  next = next.replace(
    '          sha256sum "build/mobile/android/${apk}" "build/mobile/android/${aab}" | sed \'s#build/mobile/android/##\' > "build/mobile/android/sha256.android.${version}"\n',
    '          sha256sum "build/mobile/android/${apk}" "build/mobile/android/${aab}" | sed \'s#build/mobile/android/##\' > "build/mobile/android/${{ matrix.app }}.sha256.android.${version}"\n',
  );
  next = next.replace(
    '"$apk" "$aab" > "build/mobile/android/manifest.android.${version}.json"\n',
    '"$apk" "$aab" > "build/mobile/android/${{ matrix.app }}.manifest.android.${version}.json"\n',
  );
  next = next.replace(
    '      - name: attach android assets to the release\n        if: github.event_name == \'release\'\n        env:\n          GH_TOKEN: ${{ github.token }}\n        run: gh release upload "${{ github.event.release.tag_name }}" "${{ matrix.app }}/build/mobile/android/*" --clobber\n',
    "      - name: attach android assets to the release\n        # the doctrine the owner pinned: every member application ships its\n        # mobile lanes on the release the os ships (the capacitor apk and\n        # aab, the checksums and the manifest - the same rights), and the\n        # lane attaches its own assets the moment it builds them (--clobber\n        # keeps a re-run idempotent over its own names, which carry the\n        # application prefix and never collide with another lane's grammar)\n        if: github.event_name == 'release'\n        env:\n          GH_TOKEN: ${{ github.token }}\n        run: gh release upload \"${{ github.event.release.tag_name }}\" \"${{ matrix.app }}/build/mobile/android/*\" --clobber\n      - name: attest the android assets\n        # the signed by GitHub provenance the release machinery carries\n        # family wide: every artifact this lane ships answers the workflow\n        # identity the same way the os release assets answer it\n        if: github.event_name == 'release'\n        uses: actions/attest@1e69f48acb82d1966a394da916b4c1698aa569d6 # v4.2.2\n        with:\n          subject-path: ${{ matrix.app }}/build/mobile/android/*\n          show-snippet: false\n",
  );
  next = next.replace(
    "    runs-on: macos-15\n    timeout-minutes: 45\n",
    "    runs-on: macos-15\n    timeout-minutes: 45\n    permissions:\n      # the release attachment and the artifact attestation the lane owns\n      contents: write\n      attestations: write\n      id-token: write\n",
  );
  next = next.replace(
    '          shasum -a 256 "build/mobile/ipa/${{ matrix.app }}.ios.${version}.ipa" "build/mobile/ipa/${{ matrix.app }}.ios.${version}.app.zip" | sed \'s#build/mobile/ipa/##\' > "build/mobile/ipa/sha256.iosipa.${version}"\n',
    '          shasum -a 256 "build/mobile/ipa/${{ matrix.app }}.ios.${version}.ipa" "build/mobile/ipa/${{ matrix.app }}.ios.${version}.app.zip" | sed \'s#build/mobile/ipa/##\' > "build/mobile/ipa/${{ matrix.app }}.sha256.iosipa.${version}"\n',
  );
  next = next.replace(
    '"${{ matrix.app }}" "$version" > "build/mobile/ipa/manifest.iosipa.${version}.json"\n',
    '"${{ matrix.app }}" "$version" > "build/mobile/ipa/${{ matrix.app }}.manifest.iosipa.${version}.json"\n',
  );
  next = next.replace(
    '      - name: attach ios assets to the release\n        if: github.event_name == \'release\'\n        env:\n          GH_TOKEN: ${{ github.token }}\n        run: gh release upload "${{ github.event.release.tag_name }}" "${{ matrix.app }}/build/mobile/ipa/*" --clobber\n',
    "      - name: attach ios assets to the release\n        if: github.event_name == 'release'\n        env:\n          GH_TOKEN: ${{ github.token }}\n        run: gh release upload \"${{ github.event.release.tag_name }}\" \"${{ matrix.app }}/build/mobile/ipa/*\" --clobber\n      - name: attest the ios assets\n        # the signed by GitHub provenance beside the ipa lane the same way\n        # the android lane carries it\n        if: github.event_name == 'release'\n        uses: actions/attest@1e69f48acb82d1966a394da916b4c1698aa569d6 # v4.2.2\n        with:\n          subject-path: ${{ matrix.app }}/build/mobile/ipa/*\n          show-snippet: false\n",
  );
  return next;
}

/** The surgical transform of the maintenance ladder: the landing stops
 *  racing the auto-tag cut. The tag push the landing once carried landed
 *  before the main-push release run resolved its bump detection, so the
 *  auto-tag answered no bump and every asset lane below the tag-push run
 *  inherited the skip through the needs graph - the release shipped its
 *  notes with no assets, the exact empty-release wall the 128 rung met.
 *  The pat path now leaves the tag to the auto-tag lane (the pat merge
 *  fires the main-push run and the whole chain answers from that one
 *  run); the app-token fallback keeps the explicit tag and dispatch (a
 *  GITHUB_TOKEN merge never fires workflows). */
function ladderlane(content) {
  let next = content;
  next = next.replace(
    '          # the squash merge landed on main: create the version tag and\n          # dispatch the release workflow on it (pushes performed with the\n          # GITHUB_TOKEN never fire workflows, so the dispatch is explicit).\n          # the fetch and the version tag push ride the same single pat\n          # header the branch push carried.\n          gitpat fetch origin main --quiet\n          MAINSHA="$(git rev-parse origin/main)"\n          git tag -a "v${NEXT}" -m "DevThink ${NEXT}" "$MAINSHA"\n          gitpat push origin "refs/tags/v${NEXT}"\n          gh workflow run release.yml --ref "v${NEXT}" -f tag="v${NEXT}"\n          echo "The rung v${NEXT} landed on ${MAINSHA:0:8} and the release workflow was dispatched on the tag."\n',
    '          # the squash merge landed on main. the pat path lets the auto-tag\n          # lane of the main push cut the version tag itself: a pat merge\n          # fires the main-push release run, the auto-tag job stamps the\n          # fresh version over the latest tag, and the whole release chain\n          # (the assemble set, the iso, the wasm, the family tarballs, the\n          # attestation, the github release) answers from that one run -\n          # the explicit tag push this lane once carried raced the auto-tag\n          # cut (the tag landed before the main-push run resolved, the\n          # auto-tag answered no bump and the tag-push run inherited the\n          # skip through its needs graph, so the release shipped empty).\n          # the app-token fallback keeps the explicit form: a GITHUB_TOKEN\n          # merge never fires workflows, so the tag and the dispatch carry\n          # the release the only way the app token can.\n          gitpat fetch origin main --quiet\n          MAINSHA="$(git rev-parse origin/main)"\n          if [ -z "$OWNER_PAT" ]; then\n            git tag -a "v${NEXT}" -m "DevThink ${NEXT}" "$MAINSHA"\n            gitpat push origin "refs/tags/v${NEXT}"\n            gh workflow run release.yml --ref "v${NEXT}" -f tag="v${NEXT}"\n            echo "The rung v${NEXT} landed on ${MAINSHA:0:8} and the release workflow was dispatched on the tag."\n          else\n            echo "The rung v${NEXT} landed on ${MAINSHA:0:8}; the auto-tag lane of the main push cuts the tag and the release chain answers whole."\n          fi\n',
  );
  return next;
}

/** Walks the family artifact lanes to the release doctrine. The desktop lane
 *  answers from the embedded canonical body (the matrix restructure — the
 *  application axis crossing the platform axis — is a structural rewrite,
 *  never a surgical walk); the mobile lane answers from the surgical
 *  transforms above. Both lanes migrate once: after the markers answer, this
 *  walk reports no drift ever again and the mutable pins answer to the
 *  maintenance ladders alone.
 *
 * @param mode "check" or "sync".
 * @returns the drift report of the walk. */
export async function familylanes(mode) {
  let drift = false;
  const desktopPath = join(repoRoot, ".github/workflows/family-desktop.yml");
  const desktopCurrent = await readFile(desktopPath, "utf8");
  const desktopMigrated = desktopCurrent.includes(DESKTOP_MARKER);
  if (!desktopMigrated) {
    drift = true;
    if (mode === "sync") await writeFile(desktopPath, DESKTOP_CANONICAL);
  }
  const ladderPath = join(repoRoot, ".github/workflows/maintenance.yml");
  const ladderCurrent = await readFile(ladderPath, "utf8");
  const ladderMigrated = ladderCurrent.includes(LADDER_MARKER);
  if (!ladderMigrated) {
    const ladderNext = ladderlane(ladderCurrent);
    if (!ladderNext.includes(LADDER_MARKER))
      throw new Error(
        "The maintenance ladder transform found no anchor: the landing block drifted from the migration grammar the walk pins. Update the transform before the lane lands.",
      );
    drift = true;
    if (mode === "sync") await writeFile(ladderPath, ladderNext);
  }
  const mobilePath = join(repoRoot, ".github/workflows/family-mobile.yml");
  const mobileCurrent = await readFile(mobilePath, "utf8");
  const mobileMigrated = MOBILE_MARKERS.every((marker) => mobileCurrent.includes(marker));
  if (!mobileMigrated) {
    const mobileNext = mobilelane(mobileCurrent);
    if (!MOBILE_MARKERS.every((marker) => mobileNext.includes(marker)))
      throw new Error(
        "The mobile lane transform found no anchor: the file drifted from the migration grammar the walk pins. Update the transform before the lane lands.",
      );
    drift = true;
    if (mode === "sync") await writeFile(mobilePath, mobileNext);
  }
  return {
    drift,
    desktop: desktopMigrated ? "migrated" : "walks",
    mobile: mobileMigrated ? "migrated" : "walks",
    ladder: ladderMigrated ? "migrated" : "walks",
  };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isMain) {
  const mode = process.argv[2] ?? "check";
  if (!new Set(["check", "sync"]).has(mode)) throw new Error("Use check or sync.");
  const report = await familylanes(mode);
  if (report.drift && mode === "check")
    throw new Error(
      "The family artifact lanes have not migrated to the release doctrine. Run node tests/familylanes.mjs sync.",
    );
  console.log(JSON.stringify({ mode, ...report }, null, 2));
}
