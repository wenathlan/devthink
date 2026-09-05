# Pool coverage

This document records the pool coverage baseline of the crx feature mining evidence: the status of every feature pool item the roadmap grounds its releases in. The full 626 item ledger of `docs/12.crxfeaturemining.md` — with the per context group tables, the implemented items with their kinds or modules, the planned items with their target releases, the refused items with their written reasons and the source line links — lands with the doccheck work the 1.1.96 documentation completion release and the release candidates carry, per the operator restructure of the chain. This baseline records the protocol versioning items the 1.1.91 api freeze implemented, so the compliance story of the freeze starts from a written record.

## The protocol versioning items of 1.1.91

| Pool item | Status | Kind or module |
| --- | --- | --- |
| The protocol major version of the wire | implemented | `version.ts` `protocolmajor`, `types.ts` `protocolmajorversion` |
| The protocol version negotiation with new clients | implemented | `apifreeze.ts` `negotiateprotocol`, `sharedprotocolversion` |
| The version one compatibility window | implemented | `apifreeze.ts` `deprecationwindow`, `warnonce`, `deprecatedfields` |
| The strict schema validation switch by protocol major | implemented | `policy.ts` `unknownfieldsgate`, `mcp.ts` `unknownframefields` |
| The versioned response envelope with the error code table | implemented | `protocol.ts` `errorcodetable`, `responseenvelopeoutcomes` |
| The frozen message catalog with schema links | implemented | `protocol.ts` `frozenmessagecatalog`, `frozenmessagecarriers` |
| The capability manifests of every surface | implemented | `apifreeze.ts` `capmanifestof`, `capmanifestdiff`, `caps/*.json` |
| The freeze artifact with the contract hashes | implemented | `tests/artifacts/apifreeze.json`, `tests/apifreeze.mjs` |
| The immutable action kind identifiers | implemented | `types.ts` `actionkindids` |
| The per tool versions of the catalog | implemented | `tools.ts` `toolcatalogversion`, `apifreeze.ts` `mcpsurfacetools` |
| The library protocol pin for consumers | implemented | `types.ts` `pinnedprotocolversion` |
| The permission coverage map to consuming capabilities | implemented | `apifreeze.ts` `permissioncoverage` |

## The ledger plan

The pool audit that cross references all 626 items against the code, the roadmap and the docs — with the statuses of implemented, planned and refused, the per group coverage tables and the diff mode against the previous release baseline — rides the doccheck release of 1.1.96 and the release candidates, because the operator restructure folded the 1.1.88 documentation deliverables and the 1.1.89 quality gates into the documentation completion release. When the full ledger lands, this file becomes the compliance baseline of the release candidates and every row keeps its link back to its source line in `docs/12.crxfeaturemining.md`.

## The candidate pool audit of 1.1.99

The release candidate landed the pool audit as its own gate: tests/poolaudit.mjs parses the consolidated feature pool of `docs/12.crxfeaturemining.md`, matches every item's vocabulary against the shipped symbol corpus (the 335 action kinds, the 35 mcp tools, the 23 protocol messages, the audit kind strings and every declared export of the compiled declaration set — 4,072 symbols in total) and records the per item disposition in `tests/artifacts/poolcoverage.json` with the per group counts. The candidate recorded 626 items parsed: 623 implemented (the item's vocabulary matches the shipped surface), 3 planned (the screenshot diffing baseline, the inline confirmation chips family and the human confirmation for payments and destructive deletes — the confirmation and payment coverage already answers through the pagechip confirmation and the confirmpay and confirmdelete gates of the security family, the planned marker records the vocabulary distance) and 0 unknown. The implemented count holds the recorded floor of 590, so a regression below the floor fails the release; the per group totals live in the artifact beside the gate checks. The refused status carries no row yet: the pool document records candidates, not refusals, and a refusal needs its written reason recorded here before the status ever applies.
