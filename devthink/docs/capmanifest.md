# Capability manifests

This document explains the capability manifest format of the 1.1.91 api freeze and the versioning rules the manifests follow. One capability manifest describes one frozen surface: the message types it speaks, the action kinds it names, the permissions it consumes and — for the mcp surface — the per tool versions of its catalog.

## The format

Every manifest is one json file the build emits under `dist/caps/<surface>.json` with the fields the `capmanifest` interface of `apifreeze.ts` declares:

| Field | Type | Meaning |
| --- | --- | --- |
| `surface` | string | The frozen surface name: background, pagebridge, sidepanel, popup, cli, library or mcp. |
| `release` | string | The release version the manifest pins — the package version of the build that froze the surface. |
| `protocolmajor` | number | The frozen protocol major of the manifest: two from the 1.1.91 release on. |
| `messages` | string[] | The frozen message types of the surface: router cases for background, request helper kinds for the panels, bridge members for pagebridge, commands for cli, exported symbols for library and tool names for mcp. |
| `kinds` | string[] | The action kinds the surface names: the immutable action kind identifiers of `types.ts`, or the wrapped kinds for the mcp surface, or none for the popup surface that sends no kinds. |
| `permissions` | string[] | The manifest permissions the surface consumes. |
| `permissioncoverage` | object | The map of every permission to its consuming capability: the surface that holds it, the message types that need it and the action kinds that exercise it (the background manifest carries the full coverage, every other surface carries the slice it consumes). |
| `toolversions` | object | The per tool versions of the mcp surface; every other surface carries none. |

## The versioning rules

- every manifest pins the release version of its build, so a version bump rewrites the `release` field of every manifest through `pnpm apifreeze:sync`
- every manifest pins the frozen protocol major two, and the major changes only through a new major protocol release
- the message lists, the kind lists and the permission lists are generated from the frozen constants of `apifreeze.ts`, so a manifest never drifts from the code it freezes — the apifreeze gate and the `devthink manifest` command verify the pin on every release
- the mcp manifest carries the per tool versions from this release on, and a tool version bump is a named drift entry the comparison reports

## Serving and comparison

The background serves the capability manifest of its surface on request: the `capmanifest` message answers the manifest of the background surface beside the negotiated protocol version — a client that lists its protocol majors answers the highest shared major of the negotiation. The cli prints the manifest of every surface through the `devthink describe` command, with the plain format printing one summary line per surface and `--format json` answering the full manifests beside the freeze scope record and the negotiation line.

`capmanifestdiff` compares two capability manifests and flags the capability drift between releases: every added or removed message type, kind and permission answers as one named drift entry, every changed tool version names its from and to values, and the `capmanifestdriftgate` refuses a release review that carries drift — so a surface change without its manifest update never ships.

## The permission coverage map

The background manifest carries the coverage of every permission the extension requests — the required set, the optional set and the optional host patterns — with the surface that holds each permission, the message types that need it and the action kinds that exercise it. The map answers what each granted permission serves, so the manifest permission list, the extension manifest and the capability manifests never disagree: the apifreeze gate verifies every manifest permission maps to a consuming capability and every coverage key names a permission the extension actually requests.
