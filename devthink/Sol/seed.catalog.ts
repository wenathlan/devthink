/** The reviewed seed rows of the interface catalog: the only place platform data is written before the DB serves it. */
import type { CoreModule, FamilySite, Recipe, Rung } from "./db";

export const seedFamilySites: FamilySite[] = [
  {
    host: "https://argan.devthink.pro",
    name: "argan — dns & gateway",
    blurb: "Zones, records, DNSSEC, handshake and the unified database every site shares.",
  },
  {
    host: "https://debonair.devthink.pro",
    name: "debonair — audio daw",
    blurb: "Generate, edit and master audio with the katexis engine. Isolated branding app of the OS.",
  },
  {
    host: "https://cadria.devthink.pro",
    name: "cadria — video & image studio",
    blurb: "Player for every format, editor and creative anchors on the versawase engine.",
  },
  {
    host: "https://stealthhead.devthink.pro",
    name: "stealthhead — fps platform",
    blurb: "Match, ranking, weapons and world logic. The engine rides from versawase.",
  },
];

export const seedRecipes: Recipe[] = [
  { name: "Streaming chat with plan proposal", family: "CLI", grade: "basic", duration: "5 min" },
  { name: "Pairing the workbench to the gateway", family: "Workbench", grade: "basic", duration: "3 min" },
  { name: "Consent-first capture with forensics", family: "Extension", grade: "medium", duration: "12 min" },
  { name: "MCP tool catalog with approval gates", family: "MCP", grade: "medium", duration: "10 min" },
  { name: "Multi-agent fleet with run state", family: "Swarm", grade: "advanced", duration: "20 min" },
];

export const seedRungs: Rung[] = [
  {
    version: "2.0.40",
    stamp: "the envelope family",
    note: "The envelope family stamps the rung together — workbench sessions, gateway streaming and extension gates ship in one envelope.",
    latest: true,
  },
  {
    version: "2.0.39",
    stamp: "the container tests",
    note: "Container tests know the forge rides outside: sandbox runners validate against the embedded saddle engine boundary.",
  },
  {
    version: "2.0.0",
    stamp: "the example gallery",
    note: "36 runnable recipes across five families inside the site surface, with difficulty grades and expected durations.",
  },
  {
    version: "1.1.82",
    stamp: "the site bridge",
    note: "Bridgemark badges: connected, paired and offline socket states with the engaged kill switch reading danger.",
  },
  {
    version: "1.1.78",
    stamp: "capture forensics",
    note: "Forensics marks color the diffs: regressions read red, warnings amber, clean diffs green.",
  },
  {
    version: "1.1.1",
    stamp: "the first stamp",
    note: "The extension family begins: consent-first agent bridge with three gates — session, plan and origin.",
  },
];

export const seedCoreModules: CoreModule[] = [
  { name: "devthink.ts", role: "CLI entrypoint, flags, commands, interactive loop" },
  { name: "config.ts", role: "platform paths, configuration, credential lookup, redaction" },
  { name: "providers.ts", role: "provider registry, model discovery, request routing" },
  { name: "session.ts", role: "sessions, messages, exports, local persistence" },
  { name: "memory.ts", role: "session, project and global memory layers" },
  { name: "modes.ts", role: "the 20 named operational modes and prompt metadata" },
  { name: "server.ts", role: "local loopback HTTP API" },
  { name: "mcp.ts", role: "model context protocol server surface" },
];
