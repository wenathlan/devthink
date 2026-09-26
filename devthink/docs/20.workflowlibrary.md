# Workflow library

The workflow library is the ecosystem layer of the 1.1.66 family. It shares workflow templates between profiles and machines without ever widening what the human approved: every manifest validates under schemastrict, every install lands as a pending import that still passes the import and plan review, and no ecosystem operation bypasses the consent gates.

## Manifests

One flowlibrary manifest is a plain object with exactly these fields:

| Field | Shape | Meaning |
| --- | --- | --- |
| `id` | non-empty string | The template identity the store deduplicates by manifest digest. |
| `title` | non-empty string | The human readable template name. |
| `description` | string | What the template does, in plain language. |
| `version` | non-empty string | The template version; the updater diffs versions before any replace. |
| `publisher` | non-empty string | The publisher identity of the manifest. |
| `registry` | optional string | The user configured registry origin the entry was browsed from; an absent origin marks a local export. Nothing is hardcoded. |
| `steps` | non-empty array | The steps with `id`, `kind`, `label` and the optional `target`, `value` and selector `namespace`. |
| `kinds` | non-empty array | The action kinds the steps use; a kind outside the installed capability set refuses the import in full. |
| `requiredgrants` | array | The origin grants the template needs; the grant diff shows them before any import completes. |
| `dataexpectations` | array | Per step data families with the exact fields the step needs as its minimization hint. |
| `sensitive` | boolean | True when the entry needs a fresh consent prompt before any install. |
| `publish` | optional object | The publisher signature: `publisher`, `signature`, `digest`, `provenance` and `publishedat`. |

Unknown fields refuse under schemastrict with the path and expected shape of every error, exactly like the inbound command grammar.

## Publishing and signatures

A publisher signs a manifest by sealing the sha-256 digest of its body together with the publisher name and the provenance chain. The verification recomputes the manifest digest, checks it against the digest the descriptor claims and recomputes the seal, so a signature over any other body refuses in full. An entry with no signature quarantines — it never installs on its own — until the user verifies its publisher, and an entry whose signature fails verification quarantines under any flag. The seal is self-certifying rather than an asymmetric publisher key; a future release may add key based verification.

## Grants

The grant diff of a manifest compares its `requiredgrants` against the grants the profile holds: the added grants map onto originprofiles at import time, so the import dialog shows exactly what the entry would newly hold before anything lands. An entry that requires a grant the profile does not hold refuses until the user grants it; the required grant kinds of every step ride the same origin and consent gates a native step rides.

## Install, update, fork and removal

- **Install** resolves the manifest into a native workflow record: the steps keep their reviewed kinds, the selector namespaces rewrite for the local profile (the install prefixes the local namespace onto every step target), and the record lands as a *pending* workflow import with the `libraryversion` field set — the import review approves its expanded step list before anything runs, exactly like a file import.
- **Update** diffs the incoming manifest against the installed entry by digest: the changed steps, the added grants and the version movement all surface before the replace, and a same digest update replaces nothing.
- **Fork** copies the entry into an independent local workflow that owns its own name from its creation on and reviews pending.
- **Removal** keeps every local fork untouched, because a fork is an independent local workflow the store owns apart from its template.

Every install, update and removal records a library event in the store and, when a session is live, an immutable log event of the `library` kind.

## Sync hooks

Syncbridge hooks move manifests between machines behind an explicit opt in with no default on:

- The **file provider** pulls manifests from a dropped syncbridge payload and pushes the local manifest list into an export file. A payload carries manifests and their digests only; a payload that carries a secretvault value shape or a log entry refuses in full under any flag.
- The **web provider** is an honest stub behind the opt in gate: its endpoint stays the user's configured registry value and no network call ships before the ecosystem part two backend exists.

The digest of every manifest detects conflicts: when the local and remote digests of the same manifest id differ, both versions surface as one conflict record instead of a silent overwrite, and the user resolves it once with `local`, `remote` or `merge`.

## Memory seam

The flowlibrary stores per profile workspace: entries deduplicate by manifest digest, every entry carries its publisher provenance, the manifest list exports for audit with digest, publisher, version, state and provenance and no step payload, and the memory adapter seam stays the documented marketplace backend boundary — a future remote registry replaces the adapter only.

## Surfaces

- The **dashboardpage** hosts the library browser with search and filters; every row names its publisher, version and required grants, the entry view shows the full step list before install, the grant diff opens the diff dialog and the manifest list exports for audit.
- The **sidepanel** lists the installed entries beside the native workflows with fork and remove actions.
- The **optionspage** manages the syncbridge providers, their opt in states and the conflict records with their resolve actions.
- The **onboarding** walkthrough gains an optional library stop that enriches without blocking.

## Gates

| Gate | Refusal |
| --- | --- |
| `librarymanifestgate` | Any schemastrict shape error of a manifest. |
| `librarycapabilitygate` | Kinds that exceed the installed capability set. |
| `librarygrantgate` | Required grants the profile does not hold. |
| `librarysensitivegate` | A sensitive manifest without its fresh consent. |
| `libraryquarantinegate` | An unsigned or unverified publisher. |
| `libraryimportgate` | Any path that would execute a template directly instead of landing it as a proposal. |
| `syncbridgeoptingate` | A hook without its explicit opt in. |
| `syncbridgescopegate` | A payload that carries secrets or logs. |
| `runreplaygate` | An unsealed run or a broken chain in the replay. |
| `outputcomparegate` | Two runs without a shared task input signature. |
| `outputcomparereadonlygate` | Any executing path inside a comparison. |
| `backgroundrungate` | An unreviewed workflow or a run that releases the keepalive signal early. |

The consent gates never move: no ecosystem operation bypasses the human review.


## Runtime targets (1.1.67)

The library ships as esm, cjs and umd bundles with complete type definitions through the node, bun and deno entry points. planlint checks plan files against the policy engine, flowrun executes exported plans headlessly, exporttools move artifacts to disk, and headlesslib drives a remote browser session; every runtime speaks the same protocol with the same consent gates.
