# argan

## Objective

Argan is the DNS and gateway library of the family: authoritative zones with DNSSEC signing and a gateway that serves the same zones over classic DNS and every encrypted DNS transport. It is the system network library of the platform — every site shares the unified database, and argan answers the network engine role of the family.

## Features

- Managed zone ledger — zone rows carry origin, master or slave kind, serial and signed state; the seed serves five zones under one apex domain.
- Record set snapshots — verbatim apex record lines (A, AAAA, CAA, MX, NS, SOA, TXT) that rebuild the plain zone file text on demand.
- Zone file parser — reads origin and TTL directives, apex shorthand, owner inheritance on indented lines, parenthesized continuations, quoted strings, both TTL/class orders and week-based TTL units, rejecting broken lines with the offending position.
- Zone diff planner — diffs two zone versions into create, delete and update changes grouped by owner and type; round-robin order and unconfigured TTLs never produce a false change.
- Serial management — publication serials built from UTC date plus daily revision, bumped on real changes and held when the diff is empty.
- DNSSEC validation chain — signature parsing, key tag checksums, validity windows with clock skew, RRset TTL rules, wildcard label rules and DS-to-DNSKEY structural matching over the IANA registries.
- Key ledger — KSK and ZSK cards with 360-day and 90-day rollover ladders (pre-publish, switch, retire, remove) and the CDS/CDNSKEY swap step.
- Typed failure verdicts — every failed DNSSEC check answers one of eleven coded failure values, traceable from the resolver answer back to the row.
- Dig resolver — dig-style queries answered against the served apex snapshot with the wildcard honored, replying ok, nodata or nxdomain.
- Publication flow — the five-step rail (validate, write zone, persist, republish, serve) that a zone edit walks end to end.
- Multi-transport gateway — eight DNS transports served from one answer cache.
- Protocol registry — 231 curated protocol rows in fifteen family groups, each with scheme, port, governing spec and security posture, plus the IANA service-name corpus.
- Media type catalog — 3217 media types across ten families with extension resolution and content-type defaults.
- Clean URLs — hash routes rewritten to paths, duplicate slashes and campaign trackers (utm and eleven more families) stripped with the canonical link kept in sync.

## Network

- Eight transports — classic UDP and TCP on port 53, DNS over TLS, DNS over HTTPS (raw and JSON), DNS over QUIC, DNS over HTTP/3, DNSCrypt and Oblivious DoH.
- TLS census — 144 wires counted as encrypted or upgradable (84 encrypted, 60 opportunistic), each with a security tone badge.
- DoH-first strategy — probe on plain 53, switch to DoH on 443, then serve the same TTL-cached answers on every transport.
- Algorithm registry — eight IANA DNSSEC signing algorithms and three DS digest types served as badges.
- Staging Corefile — the gateway page renders the staging resolver configuration and the zone signing pipeline output as configuration blocks.

## Interactions

- Route tree — intro, onboarding, home, zones, dnssec, gateway, settings and the single NXDOMAIN-styled 404 page.
- Entry gate — first-run state decides whether the splash and the three onboarding frames play before the landing.
- Zones console — apex featured with the newest serial pulsing, the publication rail, the record set ledger and the verbatim zone file.
- DNSSEC console — KSK/ZSK ledger, algorithm badges with tone dots, signing pipeline terminal and rollover ladder.
- Gateway console — transport ledger with ports and state dots, DoH-first rail and configuration terminal.
- Settings console — theme switch, reduce-motion switch, resolver select, locale select and a live tracker-stripping URL demo with toast feedback.
- Shell frame — full-bleed standalone or identical embedded in the OS seat, with page rail, family foot of sibling accent dots and theme flip.
- Feedback surfaces — toast live region, scroll reveal, pending shimmer and glyph-in-wash empty states with one real action.

## Data

- SQLite store of seven tables opened through the shared storage lane, prepared statements only.
- First-run seed inside one transaction; catalog accessor serves the same tables over HTTPS with an offline seed fallback.
- Label store — 183-entry manifest with translated-row protection; onboarding flags persisted server-side with a local cache mirror.
- Workload lanes — four lanes declared (DNSSEC validation, zone-file parse and diff, catalog registry serve, label store seed) with role, demand and boot budget.

## Engine role

Network engine of the family: the DNS, zone and protocol surface every sibling reaches for; the OS imports it for the system network law.

Padrão: seguir o padrão moderno.
