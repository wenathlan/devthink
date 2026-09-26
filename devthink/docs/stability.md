# Stability

This document states the stability guarantee of every frozen surface and the compatibility promise the 1.1.91 api freeze makes from this release to 2.0.0. The stability rules live in `protocol.ts` as written constants the freeze gate hashes: inside protocolv2 every change stays additive, and a breaking change requires a new major protocol version by written rule.

## The compatibility promise from 1.1.91 to 2.0.0

- additive only: new optional fields, new message types, new tools and new permissions join the contract without touching a frozen entry, because the freeze artifact hashes every schema and refuses a changed hash on the same release version
- breaking by new major only: removing a field, narrowing a type, refusing a message the contract accepted or renaming a frozen entry demands a new major protocol version with its own release note
- the deprecation window: the window closed at 2.0.0 — a version one declaration refuses below the supported floor, the registry emptied at the sunset and `docs/deprecation.md` records the executed removals
- strict by major: schema validation runs on every incoming message before dispatch — the strict refusal answers unknown fields on every protocol major the line accepts, and the version one tolerance closed with the window at 2.0.0
- hashed and gated: every frozen schema, contract list and capability manifest hashes into the freeze artifact, and the apifreeze gate refuses a changed hash without a release bump

## The stability guarantee per surface

| Surface | Guarantee until 2.0.0 |
| --- | --- |
| background | Every message type the request router dispatches stays handled: the frozen list of `caps/background.json` mirrors the router case for case, and a new message type joins only through an additive release bump the gate verifies. |
| pagebridge | Every member of the injected `devthinkbridge` object stays callable with the same reviewed arguments: the frozen list mirrors the injected object member for member. |
| sidepanel | Every message type the sidepanel request helper sends stays handled by the background router with the same response shapes. |
| popup | Every message type the popup request helper sends stays handled by the background router with the same response shapes. |
| cli | Every command the terminal dispatches stays dispatched with the same flags, the same exit code classes and the same json output fields — the frozen list mirrors the dispatch and the command registry entry for entry. |
| library | Every symbol `index.ts` exports stays exported with the same name and semantics: the frozen list of `caps/library.json` mirrors the library surface symbol for symbol, so a consumer pins the surface through the `pinnedprotocolversion` import. |
| mcp | Every tool the frozen catalog lists stays served with its per tool version, its json schema inputs and its consent metadata; a tool version bump is a named drift entry, and the error code table and the framing rules stay the frozen five and the frozen two. |

## What the freeze never promises

The freeze pins contracts, not internals: module layout, bundling, private helpers and message ordering inside one surface may change freely, because the consumer surface — the message types, the fields, the tools and the permissions — is what the manifests, the schemas and the hashes pin. No timeline, no performance number and no unreleased feature rides the guarantee, and every promise above ended exactly where the written rule ends: at 2.0.0 the deprecation window closed, the sunset removals landed and the next major line began.
