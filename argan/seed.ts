// # seed — the in-memory content tables of this site: the offline answer of the static
// build and the first-run rows of the self-hosted sqlite database. Plain memory only —
// nothing here touches the visitor machine; the same rows ship in the site database and
// reach the pages over HTTPS when a catalog endpoint is configured.

import type {
  ConfigBlock,
  DnsTransport,
  FeatureCard,
  OptionChoice,
  PublicationStep,
  RecordSetRow,
  RolloverStep,
  SignalBadge,
  ZoneSnapshot,
} from "./argan";

export const seedZones: readonly ZoneSnapshot[] = [
  { origin: "devthink.pro", kind: "master", serial: "2026011203", state: "signed" },
  { origin: "wenathlan.net", kind: "master", serial: "2026011210", state: "signed" },
  { origin: "katexis.audio", kind: "slave", serial: "2026011117", state: "signed" },
  { origin: "versawase.studio", kind: "slave", serial: "2026011201", state: "unsigned" },
  { origin: "allan.internal", kind: "master", serial: "2026011022", state: "unsigned" },
];

export const seedRecordSets: readonly RecordSetRow[] = [
  { kind: "directive", line: "; devthink.pro — zone snapshot (fake data, serial 2026011203)" },
  { kind: "directive", line: "$ORIGIN devthink.pro." },
  { kind: "directive", line: "$TTL 3600" },
  { kind: "blank", line: "" },
  {
    kind: "record",
    name: "@",
    type: "SOA",
    data: "ns1.devthink.pro. hostmaster.devthink.pro. ( 2026011203 86400 7200 1209600 3600 )",
    line: "@                     IN SOA   ns1.devthink.pro. hostmaster.devthink.pro. (\n                                2026011203 86400 7200 1209600 3600 )",
  },
  { kind: "blank", line: "" },
  { kind: "record", name: "@", type: "NS", data: "ns1.devthink.pro.", line: "@                     IN NS    ns1.devthink.pro." },
  { kind: "record", name: "@", type: "NS", data: "ns2.devthink.pro.", line: "@                     IN NS    ns2.devthink.pro." },
  { kind: "blank", line: "" },
  { kind: "record", name: "@", type: "A", data: "66.223.49.89", line: "@                     IN A     66.223.49.89" },
  { kind: "record", name: "@", type: "AAAA", data: "2001:db8::89", line: "@                     IN AAAA  2001:db8::89" },
  {
    kind: "record",
    name: "*",
    type: "A",
    data: "66.223.49.89",
    note: "hung model: every label to the same edge",
    line: "*                     IN A     66.223.49.89        ; hung model: every label to the same edge",
  },
  { kind: "blank", line: "" },
  { kind: "record", name: "@", type: "MX", data: "10 mx1.devthink.pro.", line: "@                     IN MX    10 mx1.devthink.pro." },
  { kind: "record", name: "@", type: "TXT", data: '"v=spf1 include:_spf.devthink.pro -all"', line: '@                     IN TXT   "v=spf1 include:_spf.devthink.pro -all"' },
  {
    kind: "record",
    name: "default._domainkey",
    type: "TXT",
    data: '"v=DKIM1; k=ed25519; p=WnVkbGlnbmF0dXJl"',
    note: "public key, truncated",
    line: 'default._domainkey    IN TXT   "v=DKIM1; k=ed25519; p=WnVkbGlnbmF0dXJl"   ; public key, truncated',
  },
  {
    kind: "record",
    name: "_dmarc",
    type: "TXT",
    data: '"v=DMARC1; p=quarantine; rua=mailto:dmarc@devthink.pro"',
    line: '_dmarc                IN TXT   "v=DMARC1; p=quarantine; rua=mailto:dmarc@devthink.pro"',
  },
  { kind: "blank", line: "" },
  { kind: "record", name: "@", type: "CAA", data: '0 issue "letsencrypt.org"', line: '@                     IN CAA   0 issue "letsencrypt.org"' },
];

export const seedPublicationSteps: readonly PublicationStep[] = [
  {
    ordinal: "01",
    title: "Validate",
    detail: "Format, collision and policy checks run before anything is written. A label that fails never reaches the zone.",
  },
  {
    ordinal: "02",
    title: "Write zone",
    detail: "The label joins devthink.pro as an RRset with the zone standard: TTL 3600, NS and SOA on 86400.",
  },
  {
    ordinal: "03",
    title: "Persist",
    detail: "Zone, RRset, keys and audit log land in the single database, with the previous version kept for rollback.",
  },
  {
    ordinal: "04",
    title: "Republish",
    detail: "The pipeline signs, bumps the serial and pushes the change — production zones are never hand-edited.",
  },
  {
    ordinal: "05",
    title: "Serve",
    detail: "NOTIFY fires, secondaries transfer, and a healthcheck confirms the answer from the big public resolvers.",
  },
];

export const seedLibraryCards: readonly FeatureCard[] = [
  {
    group: "home-library",
    title: "Zones & records",
    badge: "authoritative",
    badgeTone: "default",
    detail:
      "Master and slave zones, record types behind factories, wildcards, serials in YYYYMMDDNN and transfer by NOTIFY + AXFR to the secondaries.",
    href: "/zones",
  },
  {
    group: "home-library",
    title: "DNSSEC pipeline",
    badge: "signed day one",
    badgeTone: "success",
    detail:
      "KSK and ZSK with ED25519, NSEC3 denial of existence, rollover by CDS/CDNSKEY — and a hard rule: production zones are never hand-edited.",
    href: "/dnssec",
  },
  {
    group: "home-library",
    title: "Handshake & transports",
    badge: "GNS · PKARR",
    badgeTone: "info",
    detail:
      "GNS petnames (RFC 9498), PKARR signed packets published to the DHT, and every DNS transport from classic 53 to DoT, DoH, DoQ and ODoH with automatic fallback.",
    href: "/gateway",
  },
  {
    group: "home-library",
    title: "The hung model",
    badge: "vhost at the apex",
    badgeTone: "default",
    detail:
      "A bought domain anchors everything: personal subdomains hang from it with a wildcard to the same edge, vhost by Host header, live URL in seconds.",
    href: "/zones",
  },
];

export const seedDnssecKeyCards: readonly FeatureCard[] = [
  {
    group: "dnssec-keys",
    title: "KSK",
    badge: "360-day rollover",
    badgeTone: "warning",
    detail:
      "The Key Signing Key signs only the DNSKEY RRset. Its DS hash is what the parent zone carries — the anchor of trust for everything below it.",
    detail2: "devthink.pro. IN DS 48213 15 2 9f3a…",
  },
  {
    group: "dnssec-keys",
    title: "ZSK",
    badge: "90-day rollover",
    badgeTone: "warning",
    detail:
      "The Zone Signing Key signs every RRset — A, MX, TXT, and the wildcard that carries the hung model. Short-use key, rotated quarterly, cheap to replace.",
    detail2: "Long guard versus short use follows NIST SP 800-81r3.",
  },
];

export const seedDohFirstCards: readonly FeatureCard[] = [
  {
    group: "doh-first",
    title: "Probe",
    detail: "A small UDP/53 probe runs on start and on interval. An answer means classic stays primary — it is still the fastest path.",
  },
  {
    group: "doh-first",
    title: "Switch",
    detail: "No answer: the client re-routes to DoH on 443 — wire format over GET ?dns= or POST, ID zeroed, application/dns-message back.",
  },
  {
    group: "doh-first",
    title: "Serve",
    detail: "Same TTL-cached answers on every transport. DoH JSON at /resolve stays reserved for the panel and debugging — never a critical path.",
  },
];

export const seedHeroBadges: readonly SignalBadge[] = [
  { group: "hero", label: "DNSSEC ED25519", tone: "default", dot: true },
  { group: "hero", label: "DoH RFC 8484", tone: "info" },
  { group: "hero", label: "PKARR", tone: "success" },
];

export const seedDnssecAlgorithms: readonly SignalBadge[] = [
  { group: "dnssec-alg", label: "ED25519 · alg 15", tone: "success" },
  { group: "dnssec-alg", label: "ECDSA P-256 · alg 13", tone: "info" },
  { group: "dnssec-alg", label: "RSA/SHA-256 · alg 8", tone: "default" },
  { group: "dnssec-alg", label: "NSEC3 · SHA-256 digest", tone: "warning" },
];

export const seedTransports: readonly DnsTransport[] = [
  { name: "Classic DNS (UDP + TCP)", port: "53", spec: "RFC 1035 · 7766", state: "fastest, cleartext", tone: "default" },
  { name: "DoT", port: "853", spec: "RFC 7858 · 8310", state: "live", tone: "success" },
  { name: "DoH", port: "443", spec: "RFC 8484", state: "preferred", tone: "success" },
  { name: "DoH JSON", port: "443", spec: "/resolve?name=&type=", state: "panel · debug", tone: "info" },
  { name: "DoQ", port: "853/UDP", spec: "RFC 9250", state: "planned", tone: "default" },
  { name: "DoH3", port: "443/UDP", spec: "RFC 9114", state: "planned", tone: "default" },
  { name: "DNSCrypt", port: "443", spec: "X25519 + XChaCha20", state: "opt-in", tone: "info" },
  { name: "ODoH", port: "443", spec: "RFC 9230", state: "planned", tone: "default" },
];

export const seedConfigBlocks: readonly ConfigBlock[] = [
  {
    key: "corefile",
    content: [
      "# argan gateway — Corefile (fake, staging shape)",
      "",
      "devthink.pro:53 {",
      "    file /etc/argan/zones/db.devthink.pro",
      "    dnssec",
      "    log",
      "    errors",
      "}",
      "",
      ".:53 {",
      "    forward . tls://9.9.9.9 tls://8.8.8.8 {",
      "        tls_servername dns.quad9.net",
      "        health_check 5s",
      "    }",
      "    cache 300",
      "    reload",
      "}",
      "",
      "https://.:443/dns-query {",
      "    file /etc/argan/zones/db.devthink.pro devthink.pro",
      "    dnssec",
      "    cache 300",
      "}",
    ].join("\n"),
  },
  {
    key: "sign-output",
    content: [
      "$ argan sign --zone devthink.pro --ksk ksk-2026q1 --zsk zsk-2026q1",
      "zone      devthink.pro          serial 2026011202 -> 2026011203",
      "dnskey    KSK 257 3 15 (ED25519) + ZSK 256 3 15 (ED25519)",
      "rrsets    412 signed, NSEC3 salt rotated",
      "transfer  NOTIFY -> ns2.devthink.pro, AXFR complete",
      "status    published",
    ].join("\n"),
  },
];

export const seedRolloverSteps: readonly RolloverStep[] = [
  {
    title: "Pre-publish",
    window: "T−30d",
    detail: "The successor key is generated and published next to the incumbent. Both validate; nothing changes for resolvers yet.",
  },
  {
    title: "Switch",
    window: "T0",
    detail: "Signatures move to the successor. Signatures made by the incumbent keep validating until their TTL expires.",
  },
  {
    title: "Retire",
    window: "T+TTL",
    detail: "The incumbent stops signing. On KSK rollover the parent DS is swapped automatically via CDS/CDNSKEY.",
  },
  {
    title: "Remove",
    window: "T+2 TTL",
    detail: "The incumbent leaves the DNSKEY RRset and the database; the audit log records the retirement.",
  },
];

export const seedResolverChoices: readonly OptionChoice[] = [
  { group: "resolver", value: "argan", label: "argan gateway (DoH · dns.devthink.pro)", selected: true },
  { group: "resolver", value: "quad9", label: "Quad9 (DoT · 9.9.9.9)" },
  { group: "resolver", value: "cloudflare", label: "Cloudflare (1.1.1.1)" },
  { group: "resolver", value: "google", label: "Google Public DNS (8.8.8.8)" },
  { group: "resolver", value: "system", label: "System resolver (fallback 8.8.8.8)" },
];

export const seedLocaleChoices: readonly OptionChoice[] = [
  { group: "locale", value: "en", label: "English", selected: true },
  { group: "locale", value: "pt", label: "Português (BR)" },
];
