# Api freeze

This document records the protocolv2 api freeze of the 1.1.91 release: the frozen message contracts, the capability manifests of every surface, the freeze artifact and the gate that keeps the pin honest. The freeze answers one question — what exactly does devthink promise to its consumers until 2.0.0 — and the answer is versioned, hashed and enforced, so no capability enters or leaves the library without a release bump.

## The freeze scope

The freeze pins seven surfaces: the background request router of the service worker, the injected pagebridge member surface, the sidepanel message surface, the popup message surface, the cli command surface, the library export surface and the mcp tool surface. Each surface publishes one capability manifest the build emits under `dist/caps/<surface>.json` from the frozen lists of the `apifreeze.ts` family that lists its message types, its action kinds and the permissions it consumes, pinned to the release version and to the frozen protocol major two. The freeze scope record — the release, the fixed freeze date and the seven surface names — lives in the `apifreeze.ts` family and rides the freeze artifact.

## The protocolv2 negotiation

The wire speaks protocol major two from this release on. A client that declares no protocol version answers the frozen default of two, a client that declares major one refuses below the supported floor the 2.0.0 sunset raised — the refusal carries the migrateplan command and `docs/migrationguide.md` as the conversion path — and a client that declares any major above two refuses with the supported range — two through two — inside the refusal, so a version mismatch always names what the server supports. A client that lists the majors it speaks negotiates up: the shared line is the highest major both sides speak inside the supported range, so a list that carries one and two filters down to the supported side and answers two. The negotiation family lives in `apifreeze.ts` (`negotiateprotocol`, `sharedprotocolversion`, `protocolmajorof`) with the gates in `policy.ts` (`protocolnegotiationgate`, `unknownfieldsgate`, `capmanifestdriftgate`), and the mcp server routes its capability negotiation through the same family, so the mcp handshake, the background surface and the library export answer the same frozen line.

## The frozen message catalog

`protocol.ts` declares the frozen message catalog: every message type the protocol speaks travels with its message family, its schema file, its envelope class and its carrier — the builder or validator that stamps or checks the versioned envelope. The response envelope covers exactly the three outcomes success, error and cancel, the error code table freezes the five codes with the retry semantics of every code, and the stdio and http framing rules join the written contract: one newline delimited json frame per block on stdio, one json frame per http post body on the localhost listener, both under the user configured frame size bound.

## The frozen schemas

Ten schema files the build emits under `dist/schemas/` (copied from the `tests/code` sources) freeze the wire shapes: session, proposal, plan, observation, envelope, capability, audit, memory, progress and tool. Every schema carries the protocolv2 id (`devthink/protocolv2/<name>.schema.json`), a frozen semantic version of its own, and a documented type with a plain language description for every field. The observation schema keeps its `schemaversion` field forward compatible — additions raise the number and land inside the reserved fields map, never as a removed or retyped named field — and the plan schema documents the review surface with the approve, reject, preview and execute messages and no hard cap anywhere.

## The freeze artifact and the gate

`tests/apifreeze.mjs` verifies the freeze on every release: it enumerates the frozen message catalog, verifies every carrier stamps or checks the versioned envelope, verifies the protocol version constants match `version.ts`, verifies the frozen tool catalog covers every action kind policy classifies, verifies every surface list mirrors the code it freezes, verifies every manifest permission maps to a consuming capability, and hashes every frozen schema and contract list into `tests/artifacts/apifreeze.json`. The freeze artifact is versioned with the repository — a fresh checkout carries the frozen hashes, so the stability check and the vitest coverage of the artifact never depend on a local sync run — while `tests/artifacts/librarymodes` and the other generated fixtures stay ignored. The gate exits nonzero when a frozen contract hash changes without a release bump, reports the surface size per message family, and joins the verify workflow and the local validate chain as a required check — `pnpm validate:apifreeze` runs the check mode and `pnpm apifreeze:sync` rewrites the artifact and the manifests after a release bump.

## The freeze rules

- the stability rules promise additive changes only inside protocolv2 — new optional fields, new message types, new tools and new permissions join without touching a frozen entry
- a breaking change — removing a field, narrowing a type, refusing a message the contract accepted or renaming a frozen entry — requires a new major protocol version by written rule
- the deprecation window closed at 2.0.0: the registry emptied at the sunset and `docs/deprecation.md` records the executed removals with the window history
- schema validation runs on every incoming message before dispatch: the strict refusal answers unknown fields on every protocol major the line accepts — the version one tolerance closed with the window at 2.0.0
- the tool catalog entries carry per tool versions from this release on, and the action kind identifiers are immutable constants in `types.ts`

The reference documentation of `docs/refdocs.md` lists every frozen schema with its scope; the schema anchors of the kind documentation (`docs/kinddocs.md`) point at the same files the freeze hashes, so the tables and the freeze never disagree.
