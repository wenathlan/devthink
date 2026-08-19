# DevThink browser extension

This Manifest V3 source turns the static `web/` workbench into a browser new-tab surface. It uses the same local-first pairing flow as GitHub Pages and requires explicit pairing before it can access the user-owned local gateway.

The release workflow builds the workbench with relative asset paths, merges `manifest.json`, and attaches a signed ZIP-compatible extension artifact to the tagged GitHub release. No provider credential, browser cookie, or browser-session material is included in the extension.
