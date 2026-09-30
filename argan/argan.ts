// # argan — the DNS and gateway engine of the family: zones, records, dnssec and handshake.
// Library-grade module shipped inside the published packages (npm, maven with the Spring
// Boot rider): it owns the domain types and pure, generic helpers only — zero consumer
// data. The content tables of this site live in the db layer (seed.ts + db.ts) and reach
// the Sol pages through the catalog accessor over HTTPS; a page never hardcodes a row.

/** Badge tone used across the family cards and chips. */
export type BadgeTone = "default" | "success" | "error" | "warning" | "info";

export type ZoneKind = "master" | "slave";
export type ZoneState = "signed" | "unsigned";

/** One row of the "zones under management" table. */
export interface ZoneSnapshot {
  origin: string;
  kind: ZoneKind;
  serial: string;
  state: ZoneState;
}

/** One verbatim line of a zone file snapshot (record, directive or blank). */
export interface RecordSetRow {
  kind: "directive" | "record" | "blank";
  name?: string;
  type?: string;
  data?: string;
  note?: string;
  /** the zone-file line exactly as served, wrapped lines included */
  line: string;
}

/** One numbered card of a step flow (pending publication and friends). */
export interface PublicationStep {
  ordinal: string;
  title: string;
  detail: string;
}

/** A structured card rendered from the db layer (library seats, key roles, transport seats). */
export interface FeatureCard {
  group: string;
  title: string;
  badge?: string;
  badgeTone?: BadgeTone;
  detail: string;
  detail2?: string;
  href?: string;
}

/** A small tone-coded chip (hero badges, algorithm badges). */
export interface SignalBadge {
  group: string;
  label: string;
  tone: BadgeTone;
  dot?: boolean;
}

/** One DNS transport row of the gateway table. */
export interface DnsTransport {
  name: string;
  port: string;
  spec: string;
  state: string;
  tone: BadgeTone;
}

/** A verbatim configuration block rendered in a pre (corefile, sign pipeline output). */
export interface ConfigBlock {
  key: string;
  content: string;
}

/** One move of a key-rotation timeline. */
export interface RolloverStep {
  title: string;
  window: string;
  detail: string;
}

/** One option of the settings selects (resolver, language). */
export interface OptionChoice {
  group: string;
  value: string;
  label: string;
  selected?: boolean;
}

/** Resolves the css class suffix of a badge tone (empty for the default tone). */
export function toneClass(tone: BadgeTone): string {
  return tone === "default" ? "" : ` ${tone}`;
}

/** Builds a zone serial in the YYYYMMDDNN format (date plus revision of the day). */
export function formatSerial(date: Date, revision: number): string {
  const year = String(date.getUTCFullYear()).padStart(4, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const rev = revision > 0 ? revision % 100 : 0;
  return `${year}${month}${day}${String(rev).padStart(2, "0")}`;
}

/** Bumps a YYYYMMDDNN serial by one revision, rolling the revision on 99 and keeping the day. */
export function nextSerial(serial: string): string {
  if (!/^\d{10}$/.test(serial)) return serial;
  const day = serial.slice(0, 8);
  const revision = Number.parseInt(serial.slice(8, 10), 10);
  if (revision >= 99) return `${day}00`;
  return `${day}${String(revision + 1).padStart(2, "0")}`;
}

/** Finds a managed zone by its origin inside a table of zones. */
export function findZone(zones: readonly ZoneSnapshot[], origin: string): ZoneSnapshot | undefined {
  return zones.find((zone) => zone.origin === origin);
}

/** Lists every transport answering on a given port inside a table of transports. */
export function transportsByPort(transports: readonly DnsTransport[], port: string): DnsTransport[] {
  return transports.filter((transport) => transport.port === port);
}

/** Rebuilds the zone file text from record set rows, verbatim. */
export function apexZoneFile(rows: readonly RecordSetRow[]): string {
  return rows.map((row) => row.line).join("\n");
}

/** Finds a verbatim configuration block by key inside a table of blocks. */
export function findConfigBlock(blocks: readonly ConfigBlock[], key: string): ConfigBlock | undefined {
  return blocks.find((block) => block.key === key);
}
