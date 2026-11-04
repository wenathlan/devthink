# argan engine

The network, DNS and edge engine of the devthink family: authoritative zones, record set snapshots, DNSSEC validation math, a 231-protocol gateway mesh, a 3217-row media type catalog and a self-hosted SQLite data layer, served to a Vite + React Sol surface.

## Overview

Argan is the DNS and gateway library of the wenathlan family (`@wenathlan/argan`, version 2.0.155). The engine lives as library-grade TypeScript modules at the app root; the web surface lives in `Sol/` and renders every row from the data layer (seed rows offline, the site API over HTTPS when configured). The published package exports `./mimetypes` for family consumers (the vault storage engine among them).

## Module inventory

- `argan.ts` — the domain core: types for zones (`ZoneSnapshot`), record sets (`RecordSetRow`), publication steps, feature cards, signal badges, DNS transports, config blocks, rollover steps and option choices; helpers `formatSerial` (YYYYMMDDNN serials), `nextSerial` (revision bump, rolls at 99), `findZone`, `transportsByPort`, `apexZoneFile` (verbatim zone file rebuild) and `findConfigBlock`.
- `dnssec.ts` — the DNSSEC validation math: RRSIG presentation parsing (RFC 4034 §3.1), the RFC 4034 Appendix B key tag checksum, signature validity window with clock skew, RRset/RRSIG TTL equality, the label-count wildcard rule and the DS→DNSKEY structural match. Answers 8 IANA algorithms (5, 7, 8, 10, 13, 14, 15, 16) and 3 DS digest types (SHA-1, SHA-256, SHA-384); every failed check names one of 11 typed failure codes. Cryptographic signature verification itself is deliberately out of scope.
- `mimetypes.ts` — the media type catalog: 3217 rows across 10 families (application 2245, text 260, audio 255, video 138, image 170, chemical 54, model 45, message 27, multipart 17, font 6). Extension collisions resolve in family order (`.ts` answers `video/mp2t`, `.tsx` answers `application/typescript`). The engine tail adds the corpus layer: `parseMimeCorpus` and `createMimeCatalog` (families, type/extension/entry counts, `mimeTypeFor`, `extensionsFor`, `contentTypeFor` with the `application/octet-stream` default).
- `protocols.ts` — the gateway protocol mesh: 231 protocol rows in 15 family groups (web 17, api 23, messaging 25, tunnel 25, legacy 29, file 16, stream 15, overlay 14, ops 14, dns 12, directory 11, mail 10, remote 9, data 7, collab 4). Each row names its port, governing spec and security posture — 84 encrypted, 60 opportunistic, 87 cleartext; `tlsCapableProtocols()` answers the 144 wires that run or upgrade to TLS-grade crypto.
- `zonediff.ts` — the planned change set engine: a master-file parser (RFC 1035 §5.1 — `$ORIGIN`/`$TTL` directives, `@` apex, owner inheritance, parenthesized continuations, quoted strings, RFC 2308 TTL units) and an external-dns style planner (`diffZones`, `diffZoneFiles`, `recordsFromRows`, `serialForPublication`) that groups records by owner and type, compares targets as a set, reports `create`/`delete`/`update` with reason `targets` or `ttl`, and suggests the next serial through `argan.nextSerial`.
- `catalog.ts` — the typed accessor the Sol pages call: 14 list functions (`listZones`, `listApexRecordSets`, `listTransports`, `listConfigBlocks`, `listProtocols`, `listMimetypes` and friends) that fetch from `VITE_CATALOG_URL` over HTTPS when configured or answer from the in-memory seed, behind a memoized promise cache that retries failed fetches.
- `db.ts` — the self-hosted SQLite runtime: opens better-sqlite3 through `openStorageLane` from `@wenathlan/vault/storagelane` (default file `./local.db`), re-exports the parameterized helpers `execute`, `queryAll`, `queryOne` — no SQL is ever assembled by string concatenation.
- `seed.ts` — the in-memory content tables: 5 zones, the apex `devthink.pro` record set snapshot (A, AAAA, CAA, MX, NS, SOA, TXT rows), 5 publication steps, 4 library cards, 2 DNSSEC key cards, 3 DoH-first cards, 3 hero badges, 4 algorithm badges, 8 transports, 2 config blocks, 4 rollover steps, 5 resolver choices and 2 locale choices.
- `labels.ts` — the copy law: an English manifest of 183 interface strings (`LABEL_MANIFEST`, revision 2) with the accessors `label`, `labelfill` and the browser-side `seedLabels`; the store factory comes from `@wenathlan/vault/labelstore`. Translated rows are protected from seed overwrites.
- `cleanurl.ts` — the clean URL bar: hash routes become paths, `index.html` and duplicate slashes disappear, and campaign trackers (utm, gclid, fbclid, msclkid, dclid, igshid, yclid, twclid, `_tt`, srsltid and friends) are stripped with `replaceState` — no reload, no history pollution.
- `theme.ts` — the light-fusion theme default: `dark`/`light` on the `data-theme` document attribute, session scope only, no cookies or storage.
- `motionpref.ts` — the in-session reduce-motion switch: rides session storage under `argan.motion.reduced` and the `data-motion="reduced"` document flag, additive on top of `prefers-reduced-motion`.
- `reveal.ts` — scroll reveal: an IntersectionObserver at 12% visibility adds the `in` class once per element.
- `onboardingstate.ts` — the first-run state: the only writer of the intro/onboarding seen flags; DB is the source of truth over `GET`/`POST /api/v1/onboarding` (base `VITE_ONBOARDING_URL`, host-validated — localhost, loopback, private and reserved ranges refused), with the localStorage key `argan.onboarding.seen` as a pure cache mirror and a stable per-browser visitor id.
- `sandboxmodality.ts` — the workload lane declaration: 4 mirrored lanes (`dnssec-validate`, `zonefile-parse-diff`, `catalog-registry-serve`, `label-store-seed`) with role, demand and boot budget; resolves the deploy's `ARGAN_SANDBOX_LANE` seat (local, join, or a pinned modality id).
- `family.ts` — the family table: the 8 sibling slugs (cadria, debonair, forge, foundry, getry, saddle, stealthhead, vault) with the spec §12 accent and dot-ink of each; consumed by the shell rail, the landing footer and the family test.
- `familyurl.ts` — the cross-app URL contract: `familyurl(slug)` answers the relative `"../" + slug + "/"` path so every family link survives any mount point.

## Data layer

- Storage: better-sqlite3 via the vault `storagelane` (`openStorageLane`, default file `./local.db`); the schema mirrors `schema.prisma`.
- Tables: 7 — `zones`, `record_sets`, `dnssec_keys` (algorithm default 15, ED25519), `gateway_routes`, `content_rows`, `onboarding_state` and `labels`.
- Bootstrap: `ensureSchema()` creates the tables idempotently; `seedIfEmpty()` inserts the 11 seed content kinds plus zones and record sets inside one transaction on first run.
- Accessors: `zoneRow`, `recordSetRows`, `getonboardingstate`, `setonboardingstage` (seen-monotonic upsert), `saveLabel`, `readLabel`, `readAllLabels`, `seedLabelRows` (ingests the labels manifest, protects translated rows; rides the boot best-effort).
- Serving: `catalog.ts` serves the same tables to the Sol pages over HTTPS when `VITE_CATALOG_URL` points at the site API; a page never hardcodes a row.

## Sol surface

- `Sol/Sol.tsx` — the theme anchor and route tree: `/intro`, `/onboarding`, `/`, `/zones`, `/dnssec`, `/gateway`, `/settings`, `/404` plus the catch-all.
- `Sol/home/` — the landing: a dig-style local resolver over the served apex snapshot (query types A, AAAA, MX, NS, TXT, SOA, CAA; wildcard honored; honest ok/nodata/nxdomain verdicts), hero badges, the zones and library ledgers, publication steps, the apex CTA and the family footer; the entry gate decides between intro, onboarding and the landing.
- `Sol/zones/` — the zones console: the zone ledger with the apex featured and the newest serial pulsing, the 5-step publication rail, the apex record set ledger and the verbatim zone file one summary away.
- `Sol/dnssec/` — the DNSSEC console: the KSK/ZSK key ledger, the algorithm badges, the sign-pipeline output as a terminal and the 4-step rollover ladder.
- `Sol/gateway/` — the gateway console: the transport table (8 transports — classic 53, DoT 853, DoH 443, DoH JSON, DoQ, DoH3, DNSCrypt, ODoH), the 3-step DoH-first rail and the staging Corefile terminal.
- `Sol/settings/` — the settings console: three numbered sections (appearance, clean URLs, network) with the theme switch, the reduce-motion switch, resolver and locale selects and a live clean-URL demo.
- `Sol/intro/`, `Sol/onboarding/` — the first-run flow: a 1.6s splash with the drawn mark and three Windows 11-style first-run frames; both mark their stage through `onboardingstate.ts`.
- `Sol/shell/` — the app frame: full-bleed standalone law, the page rail, the family foot with one accent dot per sibling, the theme flip and the `ArganMark` icon.
- `Sol/notfound/` — the single 404 (RCODE 3, NXDOMAIN).
- `Sol/toast/` — the toast surface: a role=status live region with success, error and info tones.
- `Sol/wingets/` — the shared widgets: `HomeEntrygate` (the first-run gate) and `ShellEmptystate` (glyph, one line of truth, one action, pending shimmer).

## Family integration

- `@wenathlan/vault/storagelane` — the SQLite lane `db.ts` opens (`openStorageLane`, `SqlParam`).
- `@wenathlan/vault/labelstore` — the label store factory `labels.ts` rides; the vite and vitest configs bridge the specifier to the monorepo source.
- `saddle/workloadlaw.ts` — the `FAMILYLANES` engine of record that `sandboxmodality.ts` mirrors (rows mirrored, not imported; the vitest battery pins the mirror against the engine source through the library bridge).
- `family.ts` + `familyurl.ts` — the 8 sibling deploy units in rail order, linked out through relative URLs.
- Runtime dependencies include `@wenathlan/cadria`, `@wenathlan/debonair`, `@wenathlan/devthink`, `@wenathlan/getry`, `@wenathlan/saddle` and `@wenathlan/vault` (all `~2.0.155` family envelopes).

## Testing

Seven vitest batteries at `tests/`: `design.test.ts`, `dnssec.test.ts`, `family.test.ts`, `mimetypes.test.ts` (pins the 3217 count), `protocols.test.ts` (pins 231 rows and the 144 TLS-capable wires), `sandboxmodality.test.ts` and `zonediff.test.ts`.
