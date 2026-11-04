# argan features

Real feature list of the argan engine and its Sol surface, extracted from the code — every entry names a module.

## DNS

- Zone table — `argan.ts` types the managed zones (origin, master/slave kind, YYYYMMDDNN serial, signed state); the seed carries 5 zones with `devthink.pro` as the apex.
- Serial management — `formatSerial` builds the YYYYMMDDNN serial (UTC date plus daily revision) and `nextSerial` bumps it, rolling the revision at 99.
- Record set snapshots — `RecordSetRow` carries the verbatim zone-file line of every apex record (A, AAAA, CAA, MX, NS, SOA, TXT in the seed); `apexZoneFile` rebuilds the zone file text from the rows.
- Zone file parser — `zonediff.ts` `parseZoneRecords` handles `$ORIGIN`, `$TTL`, the `@` apex, owner inheritance on indented lines, parenthesized continuations, quoted strings, both `[ttl] [class]` orders and RFC 2308 TTL units (s/m/h/d/w), throwing `ZoneDiffError` with the offending line number.
- Zone planner — `diffZones`/`diffZoneFiles`/`recordsFromRows` diff two zone versions into create/delete/update changes grouped by owner and type; round-robin order never produces a change and an unconfigured TTL never triggers an update.
- Publication serial — `serialForPublication` keeps the serial when the diff is empty and bumps it through `nextSerial` otherwise.
- Dig resolver — `Sol/home/home.tsx` parses dig-style queries (`dig <name> [TYPE]`, verb optional) and resolves them against the served apex snapshot with the wildcard honored, answering ok, nodata or nxdomain.
- Record type chips — the home resolver offers A, AAAA, MX, NS, TXT, SOA and CAA, intersected with the served rows.
- Publication flow — the 5-step rail (Validate, Write zone, Persist, Republish, Serve) served from `seed.ts` through `catalog.ts` to the zones page.

## DNSSEC

- RRSIG parsing — `parseRrSig` reads the RFC 4034 §3.1 presentation fields, including zone-file UTC timestamps (YYYYMMDDHHmmSS), and rejects broken rows with `DnssecValidationError`.
- Key tag checksum — `keyTag` computes the RFC 4034 Appendix B checksum over the DNSKEY rdata (`dnsKeyRdata`).
- Validity window — `validateSignatureWindow` checks inception/expiration with a configurable clock skew on both edges.
- TTL rules — `validateSignatureTtl` enforces the RRset/RRSIG TTL equality and the original-TTL ceiling.
- Wildcard label rule — `validateSignatureLabels` checks the label count against the owner name with the wildcard drop rule.
- DS match — `validateDsMatch` and `validateChainLink` check the DS→DNSKEY structural match over the IANA registries (key tag, algorithm, digest type, zone-key flag, protocol).
- Typed verdicts — every failed check answers one of 11 `DnssecFailureCode` values, traceable from the resolver answer back to the row.
- Algorithm registry — `DNSSECALGORITHMS` answers 8 IANA algorithms (RSASHA1 through ED448); `DNSSECDIGESTTYPES` answers 3 DS digest types.
- Key cards — the dnssec page serves the KSK (360-day rollover, DS in the parent) and ZSK (90-day rollover, NIST SP 800-81r3) ledger from the data layer.
- Rollover ladder — the 4-step key rotation timeline (Pre-publish T−30d, Switch T0, Retire T+TTL, Remove T+2TTL) with CDS/CDNSKEY DS swap.

## Edge and gateway

- Transport table — `seed.ts` carries the 8 DNS transports the gateway speaks: classic UDP+TCP 53, DoT 853, DoH 443, DoH JSON, DoQ 853/UDP, DoH3 443/UDP, DNSCrypt 443 and ODoH 443; `transportsByPort` filters by port.
- Protocol mesh — `protocols.ts` registers 231 protocol rows in 15 family groups (web through legacy), each with scheme, port, governing spec and security posture; `findProtocol`, `protocolsByGroup`, `protocolSchemes` and `protocolGroups` serve the lookups.
- TLS-capable count — `tlsCapableProtocols` answers the 144 wires that run encrypted or upgrade to it (84 encrypted, 60 opportunistic).
- Security tones — `protocolTone` derives the badge tone of one protocol row from its posture and state.
- Media type catalog — `MIMETYPES` carries 3217 media types across 10 families; `mimeTypeForExtension` resolves extensions in family order (`.ts` → `video/mp2t`), plus `findMimeType`, `extensionsForType`, `mimeFamilyOf` and `mimetypesByFamily`.
- Corpus engine — `parseMimeCorpus` parses any registry corpus (the vault's `mime.types` lane among them) and `createMimeCatalog` builds the served catalog: families, type/extension/entry counts, `mimeTypeFor`, `extensionsFor`, `extensionOf` and `contentTypeFor` with the `application/octet-stream` default.
- DoH-first strategy — the 3-step gateway rail (Probe on UDP/53, Switch to DoH on 443, Serve the same TTL-cached answers on every transport) served to the gateway page.
- Staging Corefile — the gateway page renders the staging CoreDNS Corefile and the `argan sign` pipeline output as config blocks from `seed.ts`.
- Clean URLs — `cleanurl.ts` rewrites hash routes to paths, drops `index.html` and duplicate slashes, strips campaign trackers (utm, gclid, fbclid, msclkid, dclid, igshid, yclid, twclid, `_tt`, srsltid) with `replaceState` and keeps the canonical link in sync.

## Storage

- SQLite runtime — `db.ts` opens better-sqlite3 through the vault `storagelane` (default file `./local.db`); every statement is prepared and parameterized.
- Schema — 7 tables: `zones`, `record_sets`, `dnssec_keys`, `gateway_routes`, `content_rows`, `onboarding_state` and `labels`, mirroring `schema.prisma`.
- First-run seed — `seedIfEmpty` inserts the 11 content kinds plus zones and record sets inside one transaction when the content rows are empty.
- Typed accessors — `zoneRow`, `recordSetRows`, `getonboardingstate`, `setonboardingstage`, `saveLabel`, `readLabel` and `readAllLabels` serve parameterized reads and upserts.
- Catalog accessor — `catalog.ts` serves the same tables to the pages over HTTPS (`VITE_CATALOG_URL`) with a memoized promise cache and the offline seed fallback; a failed fetch retries on the next call.
- Label store — `labels.ts` seeds the 183-entry English manifest (revision 2) through the vault `labelstore`, protecting translated rows from overwrite; the db-side twin `seedLabelRows` rides the boot.
- Onboarding state — `onboardingstate.ts` keeps the first-run flags in the DB over `GET`/`POST /api/v1/onboarding` (host-validated against localhost, loopback, private and reserved ranges), with the localStorage key `argan.onboarding.seen` as a cache mirror and a seen-monotonic merge.
- Workload lanes — `sandboxmodality.ts` declares the 4 lanes the app owns (`dnssec-validate`, `zonefile-parse-diff`, `catalog-registry-serve`, `label-store-seed`) with role, demand and boot budget, and resolves the `ARGAN_SANDBOX_LANE` seat (local, join, pinned modality).

## UI

- Route tree — `Sol/Sol.tsx` mounts `/intro`, `/onboarding`, `/`, `/zones`, `/dnssec`, `/gateway`, `/settings` and the `/404` catch-all behind the wouter router.
- Entry gate — `HomeEntrygate` reads the first-run state and routes unseen visitors to the intro or the onboarding; only a finished flow sees the landing.
- Intro splash — the 1.6s opening splash with the drawn mark, skippable by click or key, straight hand-over under reduced motion.
- Onboarding frames — three first-run frames (what the app is, what it hosts, the enter hand-over); finish and skip both mark the stage seen.
- Zones console — the zone ledger with the apex featured and the newest serial pulsing, the publication rail, the record set ledger and the verbatim zone file.
- DNSSEC console — the KSK/ZSK ledger, the algorithm badges with tone dots, the sign-pipeline terminal and the rollover ladder.
- Gateway console — the transport ledger (ports in kbd, states as dots), the DoH-first rail and the Corefile terminal.
- Settings console — three numbered sections (appearance, clean URLs, network): theme switch, reduce-motion switch, resolver select (5 choices), locale select (2 choices) and a live tracker-stripping URL demo with toast feedback.
- Shell frame — `Shell.tsx` renders full-bleed at the app's own URL (the standalone law) or identical under the DevThink OS embedded seat, with the page rail, the family foot of 8 sibling accent dots and the theme flip.
- Theme — `theme.ts` applies the light-fusion default and the dark variant through the `data-theme` attribute, session scope only.
- Reduce motion — `motionpref.ts` rides the `argan.motion.reduced` session key and the `data-motion="reduced"` document flag, additive on top of `prefers-reduced-motion`.
- Scroll reveal — `reveal.ts` adds the `in` class at 12% visibility through one shared IntersectionObserver.
- Toast — `Toast.tsx` answers action feedback in success, error and info tones through a role=status live region (2600 ms fade, 3000 ms remove).
- Empty states — `ShellEmptystate` renders the glyph-in-wash, one line of truth and one real action, with the pending shimmer while tables are in flight.
- Family rail — `family.ts` links the 8 siblings in rail order with their spec §12 accents through mount-proof relative URLs (the familyurl lane of the fold).
- 404 — `notfound.tsx` renders the single NXDOMAIN (RCODE 3) page.
- Error boundary — `App.tsx` wraps the router in a theme error boundary with a reload action and seeds the label store before the first paint.
