/** The one-shot migration of the family artifact lanes to the release doctrine (the 300+ assets wave). */
import { readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const repoRoot = resolve(process.cwd(), "..");

/** The markers the migrated mobile lane carries (the one-shot grammar: once
 *  every marker answers, the lane is migrated and this migration never
 *  compares the file again — the maintenance ladders own the mutable pins
 *  afterward, so this walk never fights them). */
const MOBILE_MARKERS = [
  "if: github.event_name != 'release' || matrix.app != 'devthink'",
  "attest the android assets",
  "attest the ios assets",
  "${{ matrix.app }}.sha256.android.",
  "${{ matrix.app }}.manifest.android.",
  "${{ matrix.app }}.sha256.iosipa.",
  "${{ matrix.app }}.manifest.iosipa.",
];

/** The marker the migrated desktop lane carries. */
const DESKTOP_MARKER = "types: [published]";

/** The surgical transforms of the mobile lane: the release doctrine rides
 *  both jobs — the attachment permissions the lane lacked (the workflow
 *  level answers contents: read, so every release upload the lane ever
 *  attempted died at the permission wall before a single family asset
 *  landed), the os exclusion on release events (the os rides its own
 *  publish lane and never duplicates itself here), the per-application
 *  namespacing of the checksum and manifest records (the bare names
 *  clobbered across the matrix and over the os lane's own records), and
 *  the attestation pass beside every attachment (the signed by GitHub
 *  provenance the os release assets already carry). */
function mobilelane(content) {
  let next = content;
  next = next.replace(
    `  android:
    name: android \${{ matrix.app }}
    runs-on: ubuntu-24.04
    timeout-minutes: 45
`,
    `  android:
    name: android \${{ matrix.app }}
    runs-on: ubuntu-24.04
    timeout-minutes: 45
    # the os rides its own publish lane on releases: the family lane walks
    # the member applications only (a manual dispatch keeps the full matrix
    # the lane always served, devthink included)
    if: github.event_name != 'release' || matrix.app != 'devthink'
    permissions:
      # the release attachment and the artifact attestation the lane owns
      contents: write
      attestations: write
      id-token: write
`,
  );
  next = next.replace(
    '> "build/mobile/android/sha256.android.${version}"',
    '> "build/mobile/android/${{ matrix.app }}.sha256.android.${version}"',
  );
  next = next.replace(
    '> "build/mobile/android/manifest.android.${version}.json"',
    '> "build/mobile/android/${{ matrix.app }}.manifest.android.${version}.json"',
  );
  next = next.replace(
    `      - name: attach android assets to the release
        if: github.event_name == 'release'
        env:
          GH_TOKEN: \${{ github.token }}
        run: gh release upload "\${{ github.event.release.tag_name }}" "\${{ matrix.app }}/build/mobile/android/*" --clobber
`,
    `      - name: attach android assets to the release
        # the doctrine the owner pinned: every member application ships its
        # mobile lanes on the release the os ships (the capacitor apk and
        # aab, the checksums and the manifest - the same rights), and the
        # lane attaches its own assets the moment it builds them (--clobber
        # keeps a re-run idempotent over its own names, which carry the
        # application prefix and never collide with another lane's grammar)
        if: github.event_name == 'release'
        env:
          GH_TOKEN: \${{ github.token }}
        run: gh release upload "\${{ github.event.release.tag_name }}" "\${{ matrix.app }}/build/mobile/android/*" --clobber
      - name: attest the android assets
        # the signed by GitHub provenance the release machinery carries
        # family wide: every artifact this lane ships answers the workflow
        # identity the same way the os release assets answer it
        if: github.event_name == 'release'
        uses: actions/attest@v4.2.2
        with:
          subject-path: \${{ matrix.app }}/build/mobile/android/*
          show-snippet: false
`,
  );
  next = next.replace(
    `    runs-on: macos-15
    timeout-minutes: 45
`,
    `    runs-on: macos-15
    timeout-minutes: 45
    permissions:
      # the release attachment and the artifact attestation the lane owns
      contents: write
      attestations: write
      id-token: write
`,
  );
  next = next.replace(
    '> "build/mobile/ipa/sha256.iosipa.${version}"',
    '> "build/mobile/ipa/${{ matrix.app }}.sha256.iosipa.${version}"',
  );
  next = next.replace(
    '> "build/mobile/ipa/manifest.iosipa.${version}.json"',
    '> "build/mobile/ipa/${{ matrix.app }}.manifest.iosipa.${version}.json"',
  );
  next = next.replace(
    `      - name: attach ios assets to the release
        if: github.event_name == 'release'
        env:
          GH_TOKEN: \${{ github.token }}
        run: gh release upload "\${{ github.event.release.tag_name }}" "\${{ matrix.app }}/build/mobile/ipa/*" --clobber
`,
    `      - name: attach ios assets to the release
        if: github.event_name == 'release'
        env:
          GH_TOKEN: \${{ github.token }}
        run: gh release upload "\${{ github.event.release.tag_name }}" "\${{ matrix.app }}/build/mobile/ipa/*" --clobber
      - name: attest the ios assets
        # the signed by GitHub provenance beside the ipa lane the same way
        # the android lane carries it
        if: github.event_name == 'release'
        uses: actions/attest@v4.2.2
        with:
          subject-path: \${{ matrix.app }}/build/mobile/ipa/*
          show-snippet: false
`,
  );
  return next;
}

/** Walks the family artifact lanes to the release doctrine. The desktop lane
 *  answers from the canonical body this module ships beside it (the matrix
 *  restructure — the application axis crossing the platform axis — is a
 *  structural rewrite, never a surgical walk); the mobile lane answers from
 *  the surgical transforms above. Both lanes migrate once: after the markers
 *  answer, this walk reports no drift ever again and the mutable pins answer
 *  to the maintenance ladders alone.
 *
 * @param mode "check" or "sync".
 * @returns the drift report of the walk. */
export async function familylanes(mode) {
  let drift = false;
  const desktopPath = join(repoRoot, ".github/workflows/family-desktop.yml");
  const desktopCanonical = await readFile(new URL("./family-desktop.canonical.yml", import.meta.url), "utf8");
  const desktopCurrent = await readFile(desktopPath, "utf8");
  const desktopMigrated = desktopCurrent.includes(DESKTOP_MARKER);
  if (!desktopMigrated) {
    drift = true;
    if (mode === "sync") await writeFile(desktopPath, desktopCanonical);
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
  return { drift, desktop: desktopMigrated ? "migrated" : "walks", mobile: mobileMigrated ? "migrated" : "walks" };
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
