/** Verifies the protocolv2 api freeze of the 1.1.91 release: every frozen message type, schema, capmanifest and contract hash stays pinned to the release version, so a changed contract refuses the gate until a release bump resynchronizes the freeze artifact. */
import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";

const packagejson = JSON.parse(await readFile("package.json", "utf8"));
const release = String(packagejson.version);
const artifactpath = "tests/apifreeze.json";
const capsdirectory = "dist/caps";
const schemadirectory = "dist/schemas";
const schemalabel = "schemas";
const mode = process.argv[2] ?? "check";

const failures = [];
const sizes = {};

/** Records one refusal of the freeze gate. */
function refuse(message) {
  failures.push(message);
}

/** Reads one repository file as text. */
async function text(path) {
  return readFile(path, "utf8");
}

/** Hashes one string or buffer with sha256. */
function hashof(value) {
  return createHash("sha256").update(value).digest("hex");
}

/** Collects the string entries of one frozen constant array of a root module. */
async function frozenlist(module, constant) {
  const source = await text(module);
  const pattern = new RegExp(
    `export const ${constant}: (?:readonly [a-zA-Z\\[\\]<> ,]+|ReadonlyArray<[^>]+>) = (?:Object\\.freeze\\()?\\[\\n([\\s\\S]*?)\\n\\](?:\\))?;`,
  );
  const match = pattern.exec(source);
  if (match === null) throw new Error(`The frozen constant ${constant} of ${module} was not found.`);
  return [...match[1].matchAll(/"([a-z0-9./*$]+)"/g)].map((entry) => entry[1]);
}

/** Collects the frozen tool pairs of the mcp surface constant. */
async function frozentools() {
  const source = await text("apifreeze.ts");
  const match =
    /export const mcpsurfacetools: ReadonlyArray<\{ name: string; version: number \}> = \[\n([\s\S]*?)\n\];/.exec(
      source,
    );
  if (match === null) throw new Error("The frozen constant mcpsurfacetools of apifreeze.ts was not found.");
  /* formatter-proof: the entry pairs read across line breaks and spacing drift. */
  return [...match[1].matchAll(/\{\s*name:\s*"([a-z0-9.]+)",\s*version:\s*(\d+)\s*\}/g)].map((entry) => ({
    name: entry[1],
    version: Number(entry[2]),
  }));
}

/* 1. every message type declared in protocol.ts enumerates from the frozen message catalog. */
const protocolsource = await text("protocol.ts");
const catalogmatch = /export const frozenmessagecatalog: ReadonlyArray<frozenmessage> = \[\n([\s\S]*?)\n\];/.exec(
  protocolsource,
);
if (catalogmatch === null) refuse("protocol.ts declares no frozenmessagecatalog for the api freeze to enumerate.");
const catalogentries =
  catalogmatch === null
    ? []
    : [
        ...catalogmatch[1].matchAll(
          /* formatter-proof: the catalog entries read across line breaks and spacing drift. */
          /\{\s*type:\s*"([a-z]+)",\s*family:\s*"([a-z]+)",\s*schema:\s*"([^"]+)",\s*envelope:\s*"([a-z]+)",\s*carrier:\s*"([a-z]+)"\s*,?\s*\}/g,
        ),
      ].map((entry) => ({ type: entry[1], family: entry[2], schema: entry[3], envelope: entry[4], carrier: entry[5] }));
if (catalogentries.length === 0) refuse("The frozen message catalog of protocol.ts carries no message type.");
const catalogtypes = catalogentries.map((entry) => entry.type);
if (new Set(catalogtypes).size !== catalogtypes.length)
  refuse("The frozen message catalog carries a duplicated message type.");
for (const entry of catalogentries) {
  if (!/^[a-z]+$/.test(entry.type))
    refuse(`The frozen message type ${entry.type} stays outside the lowercase grammar.`);
  const schematext = await text(`dist/${entry.schema}`).catch(() => undefined);
  if (schematext === undefined)
    refuse(
      `The frozen message type ${entry.type} names the schema ${entry.schema} whose emitted artifact does not exist.`,
    );
}

/* 2. every message type carries the versioned envelope its catalog entry declares. */
const mcpsource = await text("mcp.ts");
const bridgesource = await text("bridge.ts");
const backgroundsource = await text("background.ts");
const progresssource = await text("progress.ts");
const carriermodule = {
  requestbody: protocolsource,
  parseproposal: protocolsource,
  parseworkflowproposal: protocolsource,
  workflowoutcome: protocolsource,
  observationresponse: protocolsource,
  outcomeresponse: protocolsource,
  auditexportreport: protocolsource,
  memoryitemframe: protocolsource,
  handlerequest: backgroundsource,
  recordstep: progresssource,
  handleframe: mcpsource,
  listtools: mcpsource,
  dispatchtool: mcpsource,
  composeenvelope: bridgesource,
};
for (const entry of catalogentries) {
  const carrier = carriermodule[entry.carrier];
  if (carrier === undefined) {
    refuse(`The frozen message type ${entry.type} names the carrier ${entry.carrier} no root module carries.`);
    continue;
  }
  if (
    !new RegExp(`export (?:async )?function ${entry.carrier}\\b`).test(carrier) &&
    !new RegExp(`(?:async )?function ${entry.carrier}\\b`).test(carrier)
  )
    refuse(`The frozen message type ${entry.type} names the carrier ${entry.carrier} that its module does not export.`);
  if (
    entry.envelope === "protocolversion" &&
    !new RegExp(`export (?:async )?function ${entry.carrier}[\\s\\S]*?protocolversion`).test(carrier)
  )
    refuse(
      `The frozen message type ${entry.type} carries the versioned envelope but its carrier ${entry.carrier} stamps no protocol version.`,
    );
  if (entry.envelope === "jsonrpcframe" && !mcpsource.includes('jsonrpc: "2.0"'))
    refuse("The jsonrpc envelope of the frozen wire carries no 2.0 tag.");
  if (entry.envelope === "serverenvelope" && !bridgesource.includes("export function parseenvelope"))
    refuse("The servercontract envelope of the frozen wire validates at no boundary.");
  if (entry.envelope === "runtime" && !backgroundsource.includes("switch (input.kind)"))
    refuse("The runtime envelope of the frozen messages routes through no background dispatch.");
}

/* 3. the protocol version constant matches version.ts. */
const versionsource = await text("version.ts");
const typesource = await text("types.ts");
const packageversion = /export const packageversion = "([^"]+)"/.exec(versionsource)?.[1];
const protocolmajor = /export const protocolmajor = (\d+)/.exec(versionsource)?.[1];
if (packageversion !== release)
  refuse("The protocolversion constant of types.ts must match the package version of version.ts.");
if (!typesource.includes("export const protocolversion = packageversion;"))
  refuse("types.ts must derive protocolversion from version.ts so the constants never drift.");
if (!typesource.includes(`export const protocolmajorversion = protocolmajor;`))
  refuse("types.ts must derive protocolmajorversion from the protocolmajor of version.ts.");
if (protocolmajor !== "2")
  refuse("The protocol major of protocolv2 must stay two across protocol.ts, types.ts and version.ts.");
const negvsrc = /export const protocolmajor: number/.test(versionsource)
  ? false
  : /export const protocolmajor = 2 as const;/.test(versionsource);
if (!negvsrc) refuse("version.ts must pin protocolmajor as the frozen constant two.");
const catalogmajorusage = protocolsource.includes("protocolversion") || true;
if (!typesource.includes("export const pinnedprotocolversion"))
  refuse("The library surface must export the pinnedprotocolversion import the consumers pin the wire with.");

/* 4. the frozen tool catalog covers every action kind policy classifies. */
const policysource = await text("policy.ts");
const sensitive = new Set(
  [
    ...(/const sensitiveactions = new Set<actionkind>\(\[([^\]]*)\]\)/.exec(policysource)?.[1] ?? "").matchAll(
      /"([a-z0-9]+)"/g,
    ),
  ].map((entry) => entry[1]),
);
const interactive = new Set(
  [
    ...(/const interactionactions = new Set<actionkind>\(\[([^\]]*)\]\)/.exec(policysource)?.[1] ?? "").matchAll(
      /"([a-z0-9]+)"/g,
    ),
  ].map((entry) => entry[1]),
);
const reading = new Set(
  [
    ...(/const readactions = new Set<actionkind>\(\[([^\]]*)\]\)/.exec(policysource)?.[1] ?? "").matchAll(
      /"([a-z0-9]+)"/g,
    ),
  ].map((entry) => entry[1]),
);
const policyunion = new Set([...sensitive, ...interactive, ...reading]);
const toolssource = await text("tools.ts");
const domainkinds = [
  ...(
    /export const domainkinds: Record<toolnamespace, actionkind\[\]> = \{([\s\S]*?)\n\};/.exec(toolssource)?.[1] ?? ""
  ).matchAll(/"([a-z0-9]+)"/g),
].map((entry) => entry[1]);
/* formatter-proof: the tool factory calls read their name and kind across line breaks. */
const toolkinds = [...toolssource.matchAll(/(?:readtool|gatedtool)\(\s*"[a-z.]+",\s*"([a-z0-9]+)"/g)].map(
  (entry) => entry[1],
);
for (const kind of [...new Set([...domainkinds, ...toolkinds])]) {
  if (!policyunion.has(kind)) refuse(`The frozen tool catalog wraps the kind ${kind} that policy classifies nowhere.`);
}
const actionkindunion = [
  ...typesource
    .slice(
      typesource.indexOf("export type actionkind ="),
      typesource.indexOf("\n\n", typesource.indexOf("export type actionkind =")),
    )
    .matchAll(/"([a-z0-9]+)"/g),
].map((entry) => entry[1]);
if (new Set(actionkindunion).size !== actionkindunion.length)
  refuse("The action kind union of types.ts carries a duplicated identifier.");
if (actionkindunion.length !== policyunion.size || actionkindunion.some((kind) => !policyunion.has(kind)))
  refuse("The action kind union of types.ts and the classified kinds of policy.ts disagree.");
const actionkindids = await frozenlist("types.ts", "actionkindids");
if (
  actionkindids.length !== actionkindunion.length ||
  actionkindids.some((kind, index) => kind !== actionkindunion[index])
)
  refuse("The immutable action kind identifiers of types.ts must mirror the action kind union entry for entry.");
if (!typesource.includes("export const actionkindids: readonly actionkind[] = Object.freeze(["))
  refuse("The action kind identifiers of types.ts must stay immutable constants.");

/* 5. the observation schema keeps its version field forward compatible. */
const observationschema = JSON.parse(await text("dist/schemas/observation.schema.json"));
if (observationschema.properties?.schemaversion?.type !== "number")
  refuse("The observation schema must document the schemaversion field as the forward compatible version.");
if (observationschema.properties?.reserved?.type !== "object")
  refuse("The observation schema must keep the reserved fields map for future additions.");
if (observationschema.forwardcompatible === undefined)
  refuse("The observation schema must record the forward compatibility rule of its version field.");
if (!typesource.includes("schemaversion: number;"))
  refuse("The observation interface of types.ts must keep the schemaversion field.");
if (!typesource.includes("reserved?: Record<string, unknown>;"))
  refuse("The observation interface of types.ts must keep the reserved fields map.");

/* 6. the response envelope covers success, error and cancel outcomes. */
const envelopeschema = JSON.parse(await text("dist/schemas/envelope.schema.json"));
if (JSON.stringify(envelopeschema.outcomes?.values) !== JSON.stringify(["success", "error", "cancel"]))
  refuse("The frozen envelope schema must cover the success, error and cancel outcomes.");
if (
  !protocolsource.includes(
    'export const responseenvelopeoutcomes: readonly string[] = Object.freeze(["success", "error", "cancel"]);',
  )
)
  refuse("The response envelope outcomes of protocol.ts must stay the frozen three.");
if (!mcpsource.includes("cancelled: true"))
  refuse("The mcp cancel path must answer the cancel outcome of the frozen envelope.");
if (!mcpsource.includes("result: input.result") && !mcpsource.includes("result?: unknown"))
  refuse("The mcp response path must answer the success outcome of the frozen envelope.");

/* 7. every message field carries a documented type in the schemas. */
const schemafiles = (await readdir(schemadirectory)).filter((file) => file.endsWith(".json")).sort();
if (schemafiles.length !== 10)
  refuse(`The frozen schema directory must carry the ten schemas, found ${schemafiles.length}.`);
for (const file of schemafiles) {
  const schema = JSON.parse(await text(`${schemadirectory}/${file}`));
  if (!String(schema.$id ?? "").includes("protocolv2")) refuse(`${file} must carry the protocolv2 id of the freeze.`);
  if (!/^\d+\.\d+\.\d+$/.test(String(schema.version ?? ""))) refuse(`${file} must carry its frozen semantic version.`);
  const sections = [
    schema.properties,
    ...Object.values(schema)
      .filter(
        (value) =>
          value &&
          typeof value === "object" &&
          !Array.isArray(value) &&
          value.properties !== undefined &&
          typeof value.properties === "object",
      )
      .map((value) => value.properties),
  ];
  for (const section of sections) {
    for (const [field, property] of Object.entries(section ?? {})) {
      if (property === null || typeof property !== "object") continue;
      if (
        property.type === undefined ||
        property.description === undefined ||
        typeof property.description !== "string" ||
        property.description.trim() === ""
      )
        refuse(`${file} documents the field ${field} without its type or description.`);
    }
  }
}
const catalogschemas = new Set(catalogentries.map((entry) => entry.schema));
for (const file of schemafiles) {
  if (!catalogschemas.has(`${schemalabel}/${file}`))
    refuse(`${file} joins the schema directory while the frozen message catalog names no message of it.`);
}

/* 8. the cli surface matches the library exports of index.ts. */
const indexsource = await text("index.ts");
const clisource = await text("cli.ts");
const viewsource = await text("views.ts");
const clidispatch = [...clisource.matchAll(/\(command === "([a-z]+)"/g)].map((entry) => entry[1]);
const registryids = [
  ...(/const terminal = \[([\s\S]*?)\];/.exec(viewsource)?.[1] ?? "").matchAll(/id: "([a-z]+)"/g),
].map((entry) => entry[1]);
for (const command of clidispatch) {
  if (!registryids.includes(command))
    refuse(`The cli dispatches the command ${command} the command registry does not declare.`);
}
for (const id of registryids) {
  if (!clidispatch.includes(id)) refuse(`The command registry declares the command ${id} the cli never dispatches.`);
}
const cliimports = [...clisource.matchAll(/from "\.\/([a-z0-9]+)\.js"/g)].map((entry) => entry[1]);
const packagesource = await text("package.json");
const subpathexports = new Set([...packagesource.matchAll(/"\.\/([a-z0-9]+)":/g)].map((entry) => entry[1]));
for (const module of new Set(cliimports)) {
  if (
    !indexsource.includes(`export * from "./${module}.js";`) &&
    !indexsource.includes(`from "./${module}.js"`) &&
    !subpathexports.has(module)
  )
    refuse(`The cli imports the module ${module} the library surface of index.ts does not export.`);
}

/* 9. the mcp tool surface matches the frozen tool catalog. */
/* formatter-proof: the tool factory calls read their name across line breaks. */
const mcptools = [...toolssource.matchAll(/(?:readtool|gatedtool)\(\s*"([a-z0-9.]+)"/g)].map((entry) => entry[1]);
const frozentoolpairs = await frozentools();
const frozentoolnames = frozentoolpairs.map((tool) => tool.name);
if (
  mcptools.length !== frozentoolnames.length ||
  [...mcptools].sort().some((tool, index) => tool !== [...frozentoolnames].sort()[index])
)
  refuse("The mcp tool surface and the frozen tool catalog of apifreeze.ts disagree.");
const catalogtoolversions = [...toolssource.matchAll(/(?:readtool|gatedtool)\(\s*"[a-z0-9.]+",\s*"[a-z0-9]+"/g)].length;
if (catalogtoolversions !== mcptools.length)
  refuse("Every tool catalog entry must carry its per tool version from this release on.");
if (frozentoolpairs.some((tool) => !Number.isInteger(tool.version) || tool.version < 1))
  refuse("Every frozen tool of the mcp surface must carry its per tool version.");
/* formatter-proof: the tool listing spread reads across line breaks. */
if (!/name:\s*tool\.name,\s*version:\s*tool\.version/.test(mcpsource))
  refuse("The mcp tool listing must read the frozen tool catalog with the per tool versions.");
if (!toolssource.includes("version: toolcatalogversion")) refuse("The tool catalog entries carry no per tool version.");

/* 10. and 11. the sidepanel and popup message surfaces match the background handlers. */
const backgroundcases = new Set(
  [
    ...backgroundsource
      .slice(
        backgroundsource.indexOf("async function handlerequest"),
        backgroundsource.indexOf("async function runworkflowsegment"),
      )
      .matchAll(/^ {4}case "([a-z0-9]+)":/gm),
  ].map((entry) => entry[1]),
);
const backgroundfrozen = await frozenlist("apifreeze.ts", "backgroundsurfacemessages");
if (backgroundcases.size !== backgroundfrozen.length || backgroundfrozen.some((kind) => !backgroundcases.has(kind)))
  refuse(
    "The frozen background surface messages of apifreeze.ts disagree with the request router of the service worker.",
  );
for (const surface of ["sidepanel", "popup"]) {
  const source = await text(`web/${surface}.ts`);
  const kinds = new Set([...source.matchAll(/request\(\{[^}]*?kind: "([a-z0-9]+)"/gs)].map((entry) => entry[1]));
  const frozen = await frozenlist("apifreeze.ts", `${surface}surfacemessages`);
  for (const kind of kinds) {
    if (!backgroundcases.has(kind))
      refuse(`The ${surface} surface sends the message ${kind} the background router handles nowhere.`);
  }
  if (frozen.length !== kinds.size || frozen.some((kind) => !kinds.has(kind)))
    refuse(`The frozen ${surface} surface messages of apifreeze.ts disagree with the ${surface} request helper.`);
  sizes[surface] = kinds.size;
}
sizes.background = backgroundcases.size;

/* 12. the pagebridge message surface matches the injected bridge. */
const pagebridgesource = await text("pagebridge.ts");
const bridgemembers = [
  ...(/\ devthinkbridge: \{([^}]*)\}/.exec(pagebridgesource)?.[1] ?? "").matchAll(/[a-z][a-z0-9]*/g),
].map((entry) => entry[0]);
const pagebridgefrozen = await frozenlist("apifreeze.ts", "pagebridgesurfacemessages");
if (
  new Set(bridgemembers).size !== pagebridgefrozen.length ||
  pagebridgefrozen.some((member) => !bridgemembers.includes(member))
)
  refuse("The frozen pagebridge surface messages of apifreeze.ts disagree with the injected devthinkbridge object.");
sizes.pagebridge = bridgemembers.length;

/* 13. the library surface exposes no undeclared symbol. */
function exportsmodules(source, seen) {
  const names = new Set();
  for (const match of source.matchAll(
    /^export (?:declare )?(?:async )?(?:const|function|class|enum) ([a-z][a-z0-9]*)/gm,
  ))
    names.add(match[1]);
  for (const match of source.matchAll(/^export (?:abstract )?(?:interface|type) ([a-z][a-z0-9]*)/gm))
    names.add(match[1]);
  for (const match of source.matchAll(/^export \{([^}]+)\}(?: from "[^"]+")?/gm)) {
    for (const part of match[1].split(",")) {
      const name = part.trim().split(" ").pop();
      if (name !== undefined && name !== "") names.add(name);
    }
  }
  for (const match of source.matchAll(/^export \* from "\.\/([a-z0-9]+)\.js"/gm)) {
    const module = `${match[1]}.ts`;
    if (seen.has(module)) continue;
    seen.add(module);
    const submodule = exportsmodules(seenfiles.get(module) ?? "", seen);
    for (const name of submodule) names.add(name);
  }
  return names;
}
const rootfiles = (await readdir(".")).filter((file) => /^[a-z0-9]+\.ts$/.test(file));
const seenfiles = new Map();
for (const file of rootfiles) seenfiles.set(file, await text(file));
const seen = new Set();
const libraryexports = [...exportsmodules(indexsource, seen)].sort();
const libraryfrozen = await frozenlist("apifreeze.ts", "librarysurfaceexports");
if (libraryexports.length !== libraryfrozen.length || libraryfrozen.some((name) => !libraryexports.includes(name)))
  refuse(
    "The library surface of index.ts exposes symbols the frozen library manifest of apifreeze.ts declares nowhere.",
  );
sizes.library = libraryexports.length;

/* 14. every manifest permission maps to a consuming capability. */
const manifest = JSON.parse(await text("web/manifest.json"));
const apifreezesource = await text("apifreeze.ts");
/* the coverage keys read from the frozen map: a quoted or bare key answers itself while a computed key resolves from its constant, because the all hosts pattern composes from parts so the source carries no url literal — formatter-proof: the coverage map opens across line breaks and every coverage entry opens with Object.freeze so the internal surface fields never match. */
const coveragesection =
  /export const permissioncoverage: [^=]*=\s*Object\.freeze\(\{([\s\S]*?)\n[ \t]*\}\);/.exec(
    apifreezesource,
  )?.[1] ?? "";
const coveragekeys = [...coveragesection.matchAll(/(?:"([^"]+)"|\[([A-Za-z0-9]+)\]|([A-Za-z0-9]+)):\s*Object\.freeze\(/g)].map(
  (entry) => {
    const quoted = entry[1] ?? entry[3];
    if (quoted !== undefined) return quoted;
    const constant = new RegExp(`const ${entry[2]} = \`([^\`]+)\`;`).exec(apifreezesource)?.[1] ?? "";
    return constant.replace(/\$\{"\*"\}/g, "*");
  },
);
for (const permission of [
  ...manifest.permissions,
  ...manifest.optional_permissions,
  ...manifest.optional_host_permissions,
]) {
  if (!coveragekeys.includes(permission))
    refuse(`The manifest permission ${permission} maps to no consuming capability of the frozen coverage.`);
}
for (const key of coveragekeys) {
  if (
    !manifest.permissions.includes(key) &&
    !manifest.optional_permissions.includes(key) &&
    !manifest.optional_host_permissions.includes(key)
  )
    refuse(`The frozen coverage maps the permission ${key} the extension manifest never requests.`);
}

/* 15. through 17. the freeze artifact hashes every frozen schema and contract, refuses an unversioned hash change and reports the surface sizes. */
const clifrozen = await frozenlist("apifreeze.ts", "clisurfacecommands");
for (const command of clifrozen) {
  if (!clidispatch.includes(command))
    refuse(`The frozen cli surface commands declare the command ${command} the cli never dispatches.`);
}
sizes.cli = clifrozen.length;
const mcpkindsfrozen = await frozenlist("apifreeze.ts", "mcpsurfacekinds");
for (const kind of mcpkindsfrozen) {
  if (!policyunion.has(kind)) refuse(`The frozen mcp surface kind ${kind} sits outside the policy classification.`);
}
sizes.mcp = frozentoolnames.length;
const auditkindschema = JSON.parse(await text("dist/schemas/audit.schema.json"));
const typesauditkinds = [
  ...new Set(
    [...(/export type auditkind =\s*([\s\S]*?);/.exec(typesource)?.[1] ?? "").matchAll(/"([a-z0-9]+)"/g)].map(
      (entry) => entry[1],
    ),
  ),
].sort();
const schemaauditkinds = auditkindschema.properties?.kind?.enum ?? [];
if (
  typesauditkinds.length !== schemaauditkinds.length ||
  typesauditkinds.some((kind) => !schemaauditkinds.includes(kind))
)
  refuse("The frozen audit event names of the audit schema disagree with the auditkind union of types.ts.");
const memoryschema = JSON.parse(await text("dist/schemas/memory.schema.json"));
for (const field of memoryschema.provenancefields?.fields ?? []) {
  if (!protocolsource.includes(`provenance.${field}`))
    refuse(`The frozen memory provenance field ${field} validates at no protocol boundary.`);
}
const progressschema = JSON.parse(await text("dist/schemas/progress.schema.json"));
for (const eventname of progressschema.eventnames?.values ?? []) {
  if (!progresssource.includes(`export function ${eventname}(`))
    refuse(`The frozen progress event name ${eventname} matches no progress record family.`);
}
const gatesource = await text("gates.ts");
for (const gatekind of ["confirmpay", "confirmdelete", "confirmcreds"]) {
  if (
    !gatesource.includes(`case "${gatekind}"`) &&
    !gatesource.includes(`gatekind === "${gatekind}"`) &&
    !gatesource.includes(`"${gatekind}"`)
  )
    refuse(`The consent gate message ${gatekind} joins no frozen contract of the gates family.`);
  if (!typesource.includes(`"${gatekind}"`))
    refuse(`The consent gate message ${gatekind} declares no frozen kind of types.ts.`);
}

/* the freeze scope record: the release, the date and the surfaces the pin covers. */
const freezerelease = /export const apifreezerelease = "([^"]+)";/.exec(apifreezesource)?.[1];
const freezedate = /export const apifreezedate = "([^"]+)";/.exec(apifreezesource)?.[1];
const freezescope = [
  ...(/export const apifreezescope: readonly string\[\] = (\[[^\]]*\]);/.exec(apifreezesource)?.[1] ?? "").matchAll(
    /"([a-z]+)"/g,
  ),
].map((entry) => entry[1]);
if (freezedate === undefined || !/^\d{4}-\d{2}-\d{2}$/.test(freezedate))
  refuse("The api freeze must record its fixed freeze date.");
if (freezescope.length !== 7) refuse("The api freeze scope must cover the seven frozen surfaces.");

/* the deprecation registry of the executed 2.0.0 sunset: the window record stays while the registry itself carries no entry until a future release opens a new window through a changelog entry that names its deprecations. */
const deprecations = [
  ...apifreezesource.matchAll(
    /\{ surface: "([a-z]+)", field: "([A-Za-z0-9]+)", notice: "[^"]+", sunsetrelease: "([0-9.]+)" \}/g,
  ),
].map((entry) => ({ surface: entry[1], field: entry[2], sunsetrelease: entry[3] }));
if (deprecations.length > 0)
  refuse(
    `The deprecation registry must stay empty after the 2.0.0 sunset removed every deprecated field the window carried; the field ${deprecations[0]?.field} of the ${deprecations[0]?.surface} surface returned without a release that opens a new window.`,
  );
if (!/export const deprecatedfields: readonly deprecatedfield\[\] = \[\];/.test(apifreezesource))
  refuse(
    "The deprecation registry of the api freeze must stay the empty readonly array the 2.0.0 sunset wrote, so the freeze artifact hashes the empty contract.",
  );

/* the hashes: every schema file, every frozen contract list and the capmanifest files. */
const hashes = {};
for (const file of schemafiles) hashes[`${schemalabel}/${file}`] = hashof(await text(`${schemadirectory}/${file}`));
hashes["contract/actionkinds"] = hashof(JSON.stringify(actionkindunion));
hashes["contract/backgroundsurfacemessages"] = hashof(JSON.stringify(backgroundfrozen));
hashes["contract/sidepanelsurfacemessages"] = hashof(
  JSON.stringify(await frozenlist("apifreeze.ts", "sidepanelsurfacemessages")),
);
hashes["contract/popupsurfacemessages"] = hashof(
  JSON.stringify(await frozenlist("apifreeze.ts", "popupsurfacemessages")),
);
hashes["contract/pagebridgesurfacemessages"] = hashof(JSON.stringify(pagebridgefrozen));
hashes["contract/clisurfacecommands"] = hashof(JSON.stringify(clifrozen));
hashes["contract/mcpsurfacetools"] = hashof(JSON.stringify(frozentoolpairs));
hashes["contract/librarysurfaceexports"] = hashof(JSON.stringify(libraryfrozen));
hashes["contract/auditkinds"] = hashof(JSON.stringify(typesauditkinds));
hashes["contract/frozenmessagecatalog"] = hashof(JSON.stringify(catalogentries));
hashes["contract/errorcodetable"] = hashof(
  JSON.stringify(
    [...protocolsource.matchAll(/\{ code: "([a-z]+)", retry: "([a-z]+)", semantics:/g)].map((entry) => [
      entry[1],
      entry[2],
    ]),
  ),
);
hashes["contract/permissioncoverage"] = hashof(JSON.stringify(coveragekeys));
hashes["contract/deprecatedfields"] = hashof(JSON.stringify(deprecations));

/* the capmanifest files of the seven surfaces stay pinned to the release version and to the frozen lists. */
const capsurfaces = ["background", "pagebridge", "sidepanel", "popup", "cli", "library", "mcp"];
const manifestsof = {};
for (const surface of capsurfaces) {
  const frozenmessages =
    surface === "background"
      ? backgroundfrozen
      : surface === "pagebridge"
        ? pagebridgefrozen
        : surface === "sidepanel"
          ? await frozenlist("apifreeze.ts", "sidepanelsurfacemessages")
          : surface === "popup"
            ? await frozenlist("apifreeze.ts", "popupsurfacemessages")
            : surface === "cli"
              ? clifrozen
              : surface === "library"
                ? libraryfrozen
                : frozentoolnames;
  manifestsof[surface] = { surface, release, protocolmajor: 2, messages: frozenmessages };
  const capspath = `${capsdirectory}/${surface}.json`;
  const current = await text(capspath)
    .then((value) => JSON.parse(value))
    .catch(() => undefined);
  if (current === undefined) {
    if (mode === "sync") await writecaps(capspath, manifestsof[surface], surface, await text("apifreeze.ts"));
    else refuse(`The capmanifest file of the ${surface} surface is missing; run pnpm apifreeze:sync.`);
    continue;
  }
  if (current.surface !== surface)
    refuse(`The capmanifest of the ${surface} surface names the surface ${current.surface}.`);
  if (current.release !== release) {
    if (mode === "sync") await writecaps(capspath, manifestsof[surface], surface, await text("apifreeze.ts"));
    else
      refuse(
        `The capmanifest of the ${surface} surface pins the release ${current.release} while the package carries ${release}; run pnpm apifreeze:sync.`,
      );
    continue;
  }
  if (JSON.stringify(current.messages) !== JSON.stringify(frozenmessages)) {
    if (mode === "sync") await writecaps(capspath, manifestsof[surface], surface, await text("apifreeze.ts"));
    else
      refuse(
        `The capmanifest of the ${surface} surface drifted from the frozen surface list; run pnpm apifreeze:sync after a release bump.`,
      );
  }
}

/** Writes one capmanifest file from the frozen lists of the apifreeze family. */
async function writecaps(path, base, surface, source) {
  const kinds =
    surface === "popup"
      ? []
      : surface === "mcp"
        ? [
            ...(
              /export const mcpsurfacekinds: readonly string\[\] = \[\n([\s\S]*?)\n\];/.exec(source)?.[1] ?? ""
            ).matchAll(/"([a-z0-9]+)"/g),
          ].map((entry) => entry[1])
        : actionkindunion;
  const permissions =
    surface === "background"
      ? coveragekeys
      : surface === "sidepanel"
        ? ["sidePanel"]
        : surface === "popup"
          ? ["activeTab"]
          : surface === "mcp"
            ? ["storage"]
            : [];
  const manifest = { ...base, kinds, permissions };
  if (surface === "mcp")
    manifest.toolversions = Object.fromEntries(frozentoolpairs.map((tool) => [tool.name, tool.version]));
  await mkdir(capsdirectory, { recursive: true });
  await writeFile(path, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

const artifact = { release, frozezat: freezedate, scope: freezescope, sizes, hashes };
const artifacttext = `${JSON.stringify(artifact, null, 2)}\n`;
const stored = await readFile(artifactpath, "utf8").catch(() => undefined);
if (stored === undefined) {
  if (mode === "sync") await writeFile(artifactpath, artifacttext, "utf8");
  else refuse("The freeze artifact tests/apifreeze.json is missing; run pnpm apifreeze:sync.");
} else {
  const parsed = JSON.parse(stored);
  const drift = [];
  for (const [name, value] of Object.entries(hashes)) {
    if (parsed.hashes?.[name] !== value) drift.push(name);
  }
  if (drift.length > 0 && parsed.release === release) {
    refuse(
      `The frozen contract hash of ${drift.join(", ")} changed without a release bump; restore the contract or bump the version and run pnpm apifreeze:sync.`,
    );
  }
  if (parsed.release !== release || drift.length > 0 || JSON.stringify(parsed.sizes) !== JSON.stringify(sizes)) {
    if (mode === "sync") await writeFile(artifactpath, artifacttext, "utf8");
    else if (failures.length === 0)
      refuse(
        `The freeze artifact records the release ${parsed.release} while the package carries ${release}; run pnpm apifreeze:sync.`,
      );
  }
}
if (mode === "sync") await writeFile(artifactpath, artifacttext, "utf8");

if (failures.length > 0) {
  for (const failure of failures) console.error(`APIFREEZE ${failure}`);
  process.exitCode = 1;
} else {
  console.log(
    `Api freeze verified for ${catalogentries.length} frozen message types, ${schemafiles.length} schemas and ${capsurfaces.length} capmanifests.`,
  );
  console.log(
    `Surface sizes: ${Object.entries(sizes)
      .map(([surface, size]) => `${surface}=${size}`)
      .join(", ")}.`,
  );
  console.log(
    JSON.stringify({ release, frozezat: freezedate, scope: freezescope, surfaces: sizes, checks: 17, mode }, null, 2),
  );
}
