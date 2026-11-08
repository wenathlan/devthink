/**
 * ============================================================================
 * logics.ts — THE SINGLE ROOT CATALOG OF THE WENATHLAN FAMILY
 * ============================================================================
 *
 * Wave E (rootsync) — restoration and resynchronization of the root logic
 * catalog against the CURRENT tree (worktree of wenathlan/devthink @
 * 47f358c5). A previous wave created this file (PR #443: 489 file entries,
 * 12063 export symbols, 20 domains, 127 cross-app import edges); a later
 * commit deleted it bare. The owner's order still mandates the single root
 * file, so it is regenerated here from a fresh inventory of the current
 * tree: every root *.ts logic file of every app, with its real exported
 * symbols, its domain, and the dedup/import law that binds the family.
 *
 * OWNER LAW (verbatim):
 *   "Realize na raiz a fase exata de reagrupamento e ressincronização de
 *   lógicas... crie um arquivo único na raiz para reagrupar e reajustar de
 *   zero a 3.000 ou até 4.000 lógicas correlatas. É estritamente proibido
 *   ter lógicas duplicadas entre os aplicativos: se uma lógica já estiver
 *   presente em um aplicativo, o outro deverá importá-la via dependência."
 *
 * ENGLISH RESTATEMENT:
 *   This file realizes, at the repository root, the exact regrouping and
 *   resynchronization phase of the family logics. One single root file
 *   regroups and readjusts from zero up to 3,000–4,000 correlated logics.
 *   It is STRICTLY FORBIDDEN to have duplicated logics between the apps:
 *   if a logic already exists in one app, the other app MUST import it via
 *   dependency (see DEDUP_LAW and importSpec()).
 *
 * HOW TO READ THIS CATALOG:
 *   - LOGICS: one LogicEntry per root *.ts file of the 11 apps (480 files
 *     at this resync, the tsroot wave and the security consolidation having
 *     re seated the roots), each with its real export symbols
 *     (primary exports per file; expand() flattens symbol-level logics).
 *   - DUPLICATE_FAMILIES: logic families currently duplicated across apps,
 *     verified against the current tree, with the mandated owner.
 *   - DEDUP_LAW: canonical cross-app import edges proven in the tree.
 *   - Helpers: byApp(), byDomain(), findOwner(), importSpec(), expand(),
 *     plus LOGIC_STATS for the resync report.
 *
 * RESYNC DELTAS vs the deleted catalog (current tree is ground truth):
 *   - saddle/speccatalog.ts is gone (replaced by seedcatalog.ts).
 *   - stealthhead/matchrules.ts is gone (match.ts carries the lobby logic).
 *   - vault/signup.ts is gone (accounts.ts carries the signup logic).
 *   - getry/sessions.ts and getry/streaming.ts are STILL PRESENT and are
 *     catalogued again below.
 */

/* ========================================================================== */
/* THE LAW                                                                    */
/* ========================================================================== */

/**
 * DEDUP_LAW — the owner's rule made executable.
 *
 * Canonical examples already proven by real imports in the current tree:
 *   - Debonair imports the Cadria 3D engine surface via `@wenathlan/cadria/synth`
 *     (cadria/synth.ts owns texture synthesis; debonair must not re-implement).
 *   - DevThink imports the Cadria VersaWaze pipeline via
 *     `@wenathlan/cadria/transcode` (real edge: devthink -> @wenathlan/cadria/transcode).
 *   - Vault + Saddle edge alliance: saddle/vaulthandoff.ts speaks the vault
 *     storage contract (VaultArtifact, VaultPut, VaultManifest, VaultReceipt),
 *     so sandboxed compute hands artifacts to vault without a second logic.
 *   - Forge and Foundry run through the `@wenathlan/saddle/modes` sandbox
 *     lanes (real edges: forge -> @wenathlan/saddle/modes,
 *     foundry -> @wenathlan/saddle/modes, foundry -> @wenathlan/saddle/sandbox).
 *   - The label store lives once in vault/labelstore.ts; stealthhead, getry,
 *     foundry and saddle already import it instead of duplicating it.
 */
export const DEDUP_LAW = {
  rule: "If a logic already exists in one app, the other app MUST import it via dependency. Duplicated logics between apps are strictly forbidden.",
  canonical: [
    "Debonair imports the Cadria 3D engine via @wenathlan/cadria/synth",
    "DevThink imports the Cadria VersaWaze pipeline via @wenathlan/cadria/transcode",
    "Vault + Saddle edge alliance via saddle/vaulthandoff.ts (vault storage contract)",
    "Forge and Foundry run through the @wenathlan/saddle/modes sandbox lanes",
    "Label store lives once in vault/labelstore.ts and is imported by the family",
  ],
} as const;

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

/** One root logic file of one app, with its real exported symbols. */
export interface LogicEntry {
  app: string;
  file: string;
  domain: string;
  symbols: string[];
}

/** A family of logics duplicated across apps, with the mandated owner. */
export interface DuplicateFamily {
  family: string;
  owner: string;
  members: string[];
  status: "holds" | "drifted";
  note: string;
}

/** A single symbol-level logic, flattened from LOGICS by expand(). */
export interface ExpandedLogic {
  app: string;
  file: string;
  domain: string;
  symbol: string;
}

/* ========================================================================== */
/* DOMAIN MAP (11 apps, one domain each)                                      */
/* ========================================================================== */

/** App -> domain assignment for the family. */
export const DOMAIN_OF_APP: Record<string, string> = {
  argan: "network",
  cadria: "video3d",
  cobaia: "monetization",
  debonair: "audio",
  devthink: "os",
  forge: "runner",
  foundry: "pipeline",
  getry: "aigateway",
  saddle: "virtualization",
  stealthhead: "game",
  vault: "storage",
};

/* ========================================================================== */
/* DUPLICATE FAMILIES (verified against the CURRENT tree)                     */
/* ========================================================================== */

/**
 * DUPLICATE_FAMILIES — verified in the current tree during this resync.
 *
 *  1. label stores -> vault          HOLDS: labels.ts in devthink, debonair,
 *     saddle, getry, argan, cadria, forge, foundry, stealthhead AND vault,
 *     while vault/labelstore.ts is the canonical store — and stealthhead,
 *     getry, foundry already import @wenathlan/vault/labelstore.
 *  2. sandbox lanes -> saddle        HOLDS: the lane-seating engine
 *     (lanesandbox, lanesandboxfromenv, laneof + the AppWorkloadLane /
 *     LaneSeatResult types) lives once in saddle/workloadlaw.ts via the
 *     laneseating factory; the nine sandboxmodality.ts seats and the
 *     devthink/sandboxlane.ts seat build their instances on it, keeping
 *     only their app-specific lane tables and slug/env names.
 *  3. family roster -> devthink      HOLDS: family.ts (FAMILY_SLUGS,
 *     FamilyMember, FAMILY_ACCENTS, familyrow) duplicated in 9 apps;
 *     devthink owns familylanes.ts + familyaccent.ts + appregistry.ts.
 *  4. onboarding state -> devthink   HOLDS: onboardingstate.ts duplicated in
 *     10 apps (devthink, debonair, saddle, getry, argan, cadria, forge,
 *     foundry, stealthhead, vault).
 *  5. theme -> devthink              HOLDS: theme.ts in the six apps are
 *     doors re-exporting devthink/personalstore.ts (Theme, currentTheme,
 *     applyTheme, initTheme, toggleTheme) — the owner seat the adoptions
 *     landed.
 *  6. tooling config -> foundry      HOLDS: graphplan.ts is the forge door
 *     onto the plan engine inside foundry/pipeline.ts; hometypes.ts doors
 *     in forge and vault onto foundry/hometypes.ts; foundry owns
 *     dependencyupdates, npmgate, bundlescan, imagestore.
 *  7. cleanurl -> argan              HOLDS: cleanurl.ts (cleanUrl, applyNow,
 *     syncCanonical) duplicated in argan, cadria, debonair (devthink keeps a
 *     richer route-aware variant pending consolidation).
 *  8. reveal -> devthink             HOLDS: devthink/reveal.ts is the owner
 *     (initReveal, useReveal, observeReveals — client-safe, react + wouter
 *     only); the five app reveal.ts files are doors.
 *  9. db/SqlParam -> vault           HOLDS: db.ts duplicated in all 10 non-
 *     vault apps; vault/storage.ts owns SqlParam + openStorageLane and
 *     argan, cadria, cobaia, debonair, foundry, stealthhead already import
 *     @wenathlan/vault/storage.
 * 10. mimetypes -> argan             HOLDS (new, discovered this resync):
 *     argan/mimetypes.ts vs vault/mimetypes.ts — and vault already imports
 *     @wenathlan/argan/mimetypes, so argan is the de facto owner.
 * 11. motionpref -> debonair         HOLDS: debonair/motionpref.ts owns the
 *     seam via the createMotionPref(key) factory; argan/motionpref.ts is a
 *     door building the argan instance with its per-app session key.
 */
export const DUPLICATE_FAMILIES: DuplicateFamily[] = [
  {
    family: "label stores",
    owner: "vault",
    members: ["devthink", "debonair", "saddle", "getry", "argan", "cadria", "forge", "foundry", "stealthhead", "vault"],
    status: "holds",
    note: "Canonical store is vault/labelstore.ts (createLabelStore); stealthhead, getry, foundry and saddle already import it.",
  },
  {
    family: "sandbox lanes",
    owner: "saddle",
    members: ["debonair", "saddle", "getry", "argan", "cadria", "forge", "foundry", "stealthhead", "vault", "devthink"],
    status: "holds",
    note: "the lane-seating engine lives once in saddle/workloadlaw.ts (the laneseating factory); the nine app sandboxmodality.ts seats plus devthink/sandboxlane.ts build their instances on it, keeping only their app-specific lane tables, slug and env name.",
  },
  {
    family: "family roster",
    owner: "devthink",
    members: ["debonair", "saddle", "getry", "argan", "cadria", "forge", "foundry", "stealthhead", "vault"],
    status: "holds",
    note: "family.ts (FAMILY_SLUGS, FamilyMember, FAMILY_ACCENTS, familyrow) duplicated in 9 apps; devthink owns familylanes.ts, familyaccent.ts, appregistry.ts.",
  },
  {
    family: "onboarding state",
    owner: "devthink",
    members: ["devthink", "debonair", "saddle", "getry", "argan", "cadria", "forge", "foundry", "stealthhead", "vault"],
    status: "holds",
    note: "onboardingstate.ts duplicated in 10 apps (VisitorOnboarding, readOnboardingState, markOnboardingSeen).",
  },
  {
    family: "theme",
    owner: "devthink",
    members: ["argan", "cadria", "debonair", "forge", "getry", "stealthhead"],
    status: "holds",
    note: "theme.ts in the six apps are doors re-exporting from devthink/personalstore.ts (Theme, currentTheme, applyTheme, initTheme, toggleTheme) — the owner seat the adoptions landed.",
  },
  {
    family: "tooling config",
    owner: "foundry",
    members: ["forge", "foundry"],
    status: "holds",
    note: "graphplan.ts is the forge door onto the plan engine inside foundry/pipeline.ts (single implementation, the forge file keeps only the RUNPLAN fixture and the RunnerMode-typed planstep extension); hometypes.ts doors in forge and vault onto foundry/hometypes.ts; foundry owns dependencyupdates, npmgate, bundlescan, imagestore.",
  },
  {
    family: "cleanurl",
    owner: "argan",
    members: ["argan", "cadria", "debonair", "devthink"],
    status: "holds",
    note: "cleanurl.ts (cleanUrl, applyNow, syncCanonical) triplicated in argan/cadria/debonair; devthink keeps a richer route-aware variant pending consolidation.",
  },
  {
    family: "reveal",
    owner: "devthink",
    members: ["argan", "cadria", "debonair", "getry", "stealthhead"],
    status: "holds",
    note: "devthink/reveal.ts is the owner (initReveal, useReveal, observeReveals — client-safe, react + wouter only); the five app reveal.ts files are doors.",
  },
  {
    family: "db / SqlParam",
    owner: "vault",
    members: ["argan", "cadria", "cobaia", "debonair", "forge", "foundry", "getry", "saddle", "stealthhead"],
    status: "holds",
    note: "db.ts duplicated in every non-vault app; vault/storage.ts owns SqlParam + openStorageLane and is already imported by argan, cadria, cobaia, debonair, foundry, stealthhead.",
  },
  {
    family: "mimetypes",
    owner: "argan",
    members: ["argan", "vault"],
    status: "holds",
    note: "Discovered this resync: vault already imports @wenathlan/argan/mimetypes while still shipping vault/mimetypes.ts.",
  },
  {
    family: "motionpref",
    owner: "debonair",
    members: ["debonair", "argan"],
    status: "holds",
    note: "debonair/motionpref.ts owns the seam via the createMotionPref(key) factory; argan/motionpref.ts is a door building the argan instance with its per-app session key.",
  },
];

/**
 * RESOLUTIONS — the wave/dupfamily ledger (2026-11-05): the dedup law
 * executed against the families above, honest per family.
 */
export const DEDUP_RESOLUTIONS: ReadonlyArray<{
  family: string;
  verdict: "consolidated" | "verified" | "blocked" | "deferred" | "structural";
  evidence: string;
}> = [
  { family: "label store", verdict: "verified", evidence: "the createLabelStore engine lives once in vault/labelstore.ts; nine roots import it (argan via @wenathlan/vault/labelstore, the rest via ../vault/labelstore.ts); devthink sits outside the family — no engine, no import; the per-app db.ts saveLabel glue stays per-app (own sqlite binding, deferred with onboarding)" },
  { family: "sandbox lane seating", verdict: "consolidated", evidence: "the parameterized owner landed in saddle/workloadlaw.ts — the laneseating factory holds the resolver body once (the repo carries exactly one copy) and the ten seats (the nine app sandboxmodality.ts files plus devthink/sandboxlane.ts and the foundry pipeline section) build their instances on it, keeping only their app-specific lane tables, slug and env name; every sandboxmodality battery stayed green unchanged through the conversion" },
  { family: "family roster", verdict: "blocked", evidence: "real drift: forge rail order [devthink, cadria, stealthhead, debonair, argan, saddle, foundry, vault, getry] vs argan rail [cadria..vault]; accent tables 8 vs 10 members; familyurl regex /{1,64} vs /+ between vault and argan — a merged owner would reorder every app rail render" },
  { family: "theme", verdict: "consolidated", evidence: "devthink/personalstore.ts is the canonical theme seat; the six twins (argan cadria debonair forge getry stealthhead theme.ts) are now doors re-exporting Theme currentTheme applyTheme initTheme toggleTheme" },
  { family: "onboarding state", verdict: "deferred", evidence: "db-bound glue mirrors the label db twins — each app writes its own sqlite; the parameterized store wave owns it" },
  { family: "cleanurl", verdict: "consolidated", evidence: "argan/cleanurl.ts owns cleanUrl applyNow syncCanonical; cadria and debonair are shims; devthink/cleanurl.ts imports the three core symbols and keeps its five os-only exports" },
  { family: "reveal", verdict: "consolidated", evidence: "devthink/reveal.ts is the new client-safe owner (react + wouter only, zero node builtins); argan cadria debonair reveal.ts are doors; the getry and stealthhead observeReveals twins joined the doors when devthink/reveal.ts gained the page-mount observe pass" },
  { family: "tooling config", verdict: "structural", evidence: "capacitor.config config, vite/vitest defineConfig and cli main are per-app entry-point idioms — every app must keep its own; devthink/build.ts already imports foundry/bundlescan live; the graphplan and hometypes twins joined foundry — forge/graphplan.ts is the door onto the pipeline engine, the hometypes doors ride foundry/hometypes.ts" },
];

/* ========================================================================== */
/* THE CATALOG — every root *.ts logic file of every app                      */
/* ========================================================================== */

/**
 * LOGICS — the regrouped, resynchronized catalog.
 *
 * One entry per root *.ts file per app. Symbols are the file's real exported
 * names (primary exports, capped per file — expand() flattens them into
 * symbol-level logics for the full 3,000–4,000 correlated-logic target).
 */
export const LOGICS: LogicEntry[] = [
  { app: "argan", file: "argan.ts", domain: "network", symbols: ["BadgeTone", "ZoneKind", "ZoneState", "ZoneSnapshot", "RecordSetRow", "PublicationStep", "FeatureCard", "SignalBadge", "ConfigBlock", "DnsTransport", "OptionChoice", "RolloverStep", "apexZoneFile", "findConfigBlock"] },
  { app: "argan", file: "capacitor.config.ts", domain: "network", symbols: ["default"] },
  { app: "argan", file: "catalog.ts", domain: "network", symbols: ["listZones", "listApexRecordSets", "listPublicationSteps", "listLibraryCards", "listDnssecKeyCards", "listDohFirstCards", "listHeroBadges", "listDnssecAlgorithms", "listConfigBlocks", "listMimetypes", "listOptionChoices", "listProtocols", "listRecordTypes", "listRolloverSteps"] },
  { app: "argan", file: "cli.ts", domain: "network", symbols: ["main"] },
  { app: "argan", file: "db.ts", domain: "network", symbols: ["db", "ensureSchema", "seedIfEmpty", "zoneRow", "recordSetRows", "OnboardingStateRow", "getonboardingstate", "setonboardingstage", "LabelRow", "readAllLabels", "readLabel", "saveLabel", "seedLabelRows"] },
  { app: "argan", file: "dns.ts", domain: "network", symbols: ["DNSSECALGORITHMS", "DNSSECDIGESTTYPES", "RrSig", "DnsKey", "DsRecord", "DnssecVerdict", "ZoneRecord", "ZoneDiff", "parseZoneRecords", "diffZones", "PROTOCOLS", "findProtocol", "cleanUrl", "applyNow"] },
  { app: "argan", file: "drizzle.config.ts", domain: "network", symbols: ["default"] },
  { app: "argan", file: "family.ts", domain: "network", symbols: ["FAMILY_SLUGS", "FamilyMember", "FAMILY_ACCENTS", "familyrow", "familyurl"] },
  { app: "argan", file: "labels.ts", domain: "network", symbols: ["LABEL_REVISION", "LABEL_MANIFEST", "LabelKey", "label", "labelfill", "seedLabels"] },
  { app: "argan", file: "mimetypes.ts", domain: "network", symbols: ["MimeFamily", "MimeTypeRow", "MIMETYPES", "MIMETYPE_COUNT", "findMimeType", "mimeTypeForExtension", "extensionsForType", "mimeFamilyOf", "MimeCatalog", "MimeCorpusError", "MimeCorpusRow", "createMimeCatalog", "mimetypesByFamily", "parseMimeCorpus"] },
  { app: "argan", file: "motionpref.ts", domain: "network", symbols: ["MOTION_PREF_KEY", "memoryMotionStorage", "sessionStorageOrMemoryMotion", "reduceMotionApplied", "reduceMotionStored", "setReduceMotion"] },
  { app: "argan", file: "onboardingstate.ts", domain: "network", symbols: ["OnboardingSnapshot", "readOnboardingState", "loadOnboardingState", "markIntroSeen", "markOnboardingSeen"] },
  { app: "argan", file: "reveal.ts", domain: "network", symbols: ["initReveal", "useReveal"] },
  { app: "argan", file: "routerbase.ts", domain: "network", symbols: ["routerBase"] },
  { app: "argan", file: "sandboxmodality.ts", domain: "network", symbols: ["APPSLUG", "WORKLOADLANES", "SANDBOXLANEENV", "lanesandbox", "lanesandboxfromenv", "laneof"] },
  { app: "argan", file: "seed.ts", domain: "network", symbols: ["seedZones", "seedRecordSets", "seedPublicationSteps", "seedLibraryCards", "seedDnssecKeyCards", "seedDohFirstCards", "seedHeroBadges", "seedDnssecAlgorithms", "seedConfigBlocks", "seedLocaleChoices", "seedRecordTypes", "seedResolverChoices", "seedRolloverSteps", "seedTransports"] },
  { app: "argan", file: "theme.ts", domain: "network", symbols: ["currentTheme", "applyTheme", "initTheme", "toggleTheme"] },
  { app: "argan", file: "vite.config.ts", domain: "network", symbols: ["default"] },
  { app: "argan", file: "vitest.config.ts", domain: "network", symbols: ["default"] },
  { app: "argan", file: "wingets.ts", domain: "network", symbols: ["HomeEntrygate", "ShellEmptystate"] },
  { app: "cadria", file: "blendmodes.ts", domain: "video", symbols: ["BlendModeName", "BLEND_MODES", "SeparableName", "ChannelFormula", "SEPARABLE_FORMULAS", "LUMA_WEIGHTS", "Rgb", "Rgb01", "alphacomposite", "blendchannel", "blendchannel01", "blendimage", "blendlayerstack", "blendpixel"] },
  { app: "cadria", file: "capacitor.config.ts", domain: "video", symbols: ["default"] },
  { app: "cadria", file: "catalog.ts", domain: "video", symbols: ["listPlayerFormats", "listAnchors", "listProjects", "listSeatCards", "listHeroBadges", "listOptionChoices"] },
  { app: "cadria", file: "cleanurl.ts", domain: "video", symbols: ["cleanUrl", "applyNow", "syncCanonical"] },
  { app: "cadria", file: "cli.ts", domain: "video", symbols: ["main"] },
  { app: "cadria", file: "colorconvert.ts", domain: "video", symbols: ["Rgb", "Hsl", "Hsv", "YcbcrCoeffs", "SRGB_DECODE", "clamp01", "clampchannel", "srgbtolinear", "LMS_TO_OKLAB", "LMS_TO_SRGB", "OKLAB_TO_LMS", "Oklch", "SRGB_TO_LMS", "YCBCR_601"] },
  { app: "cadria", file: "compositorraster.ts", domain: "video", symbols: ["RgbTriple", "hexcolor", "rectCoverage", "ellipseCoverage", "polygonCoverage", "strokeCoverage", "rasterizeCommands", "SceneCamera", "rasterizeScene3d"] },
  { app: "cadria", file: "db.ts", domain: "video", symbols: ["db", "ensureSchema", "seedIfEmpty", "projectRows", "BrowserLabel", "saveLabel", "readLabel", "readAllLabels", "OnboardingFlags", "OnboardingStateRow", "getOnboardingState", "seedLabelRows", "setOnboardingStage"] },
  { app: "cadria", file: "designmotion.ts", domain: "video", symbols: ["DURATION_MICRO", "DURATION_WINDOW", "DURATION_SPRING", "DURATION_ENTER", "STAGGER", "EASE_MICRO", "EASE_WINDOW", "EASE_EXIT", "CLOSE_RED", "EASE_LEAVE", "EASE_SPRING", "MICRO_MOTION", "PRESS_SCALE", "SCALE_FLOOR"] },
  { app: "cadria", file: "drizzle.config.ts", domain: "video", symbols: ["default"] },
  { app: "cadria", file: "easecurves.ts", domain: "video", symbols: ["EaseCurve", "EaseKey", "MIN_INFLUENCE", "MAX_SPEED", "EASE_LINEAR", "EASE_INOUT", "EASE_IN", "EASE_OUT", "EASE_PRESETS", "applycurve", "bezierprogress", "curvefromhandles", "curvehandles", "curveprogress"] },
  { app: "cadria", file: "family.ts", domain: "video", symbols: ["FAMILY_SLUGS", "FamilyMember", "FAMILY_ACCENTS", "familyrow"] },
  { app: "cadria", file: "familyurl.ts", domain: "video", symbols: ["familyurl"] },
  { app: "cadria", file: "gateway.ts", domain: "video", symbols: ["GenerationRecord", "AnalysisRecord", "GenerationStore", "GatewayError", "MAX_BODY_BYTES", "DEFAULT_PORT", "DEFAULT_HOST", "memoryStore", "GatewayClientError", "GatewayProject", "app", "createGateway", "defaultGateway", "deleteGatewayProject"] },
  { app: "cadria", file: "generation.ts", domain: "video", symbols: ["GenerationRecord", "AnalysisRecord", "GenerationStore", "ensureGenerationSchema", "generationStore"] },
  { app: "cadria", file: "gifencoder.ts", domain: "video", symbols: ["GifError", "GIF_MAX_COLORS", "GifColor", "quantizePalette", "encodeGifLzw", "GifFrame", "GifEncodeOptions", "encodeGif", "gifFrameIndices", "gifTableSize"] },
  { app: "cadria", file: "image.ts", domain: "video", symbols: ["ExportFormat", "ExportErrorCode", "ExportError", "PNG_SIZE_LADDER", "ANIMATION_FPS", "MANIFEST_FRAME_CAP", "PNG_COMPRESS_FACTOR", "AnimationManifest", "BiasRange", "BuildImageProjectInput", "CANVAS_MIN", "COMMAND_BUDGET", "CanvasOrientation", "CompositionBias"] },
  { app: "cadria", file: "introfixtures.ts", domain: "video", symbols: ["DemoFixtureId", "DemoFixture", "demoFixtures"] },
  { app: "cadria", file: "labels.ts", domain: "video", symbols: ["LABEL_REVISION", "labelManifest", "LabelKey", "label", "seedLabels"] },
  { app: "cadria", file: "masks.ts", domain: "video", symbols: ["OpacityGrid", "BooleanGrid", "MaskOp", "MaskBounds", "MaskLayer", "makeopacity", "makeboolean", "combinemasks", "alphatoboolean", "booleantoalpha", "cropmask", "ellipsemask", "feathermask", "gradientmask"] },
  { app: "cadria", file: "mediaprobe.ts", domain: "video", symbols: ["MediaTrackKind", "MediaTrackMeta", "MediaProbe", "ProbeError", "asciiAt", "finishTracks", "probeMedia", "probeMp4", "probeWebm"] },
  { app: "cadria", file: "mesh.ts", domain: "video", symbols: ["BoxOptions", "generateBox", "generatePlane", "generateCylinder", "generateCone", "generateCapsule", "generateIcosphere", "parametricsurface", "mergemeshes", "transformmesh", "meshbounds", "CapsuleOptions", "ConeOptions", "CylinderOptions"] },
  { app: "cadria", file: "onboardingstate.ts", domain: "video", symbols: ["hostallowed", "mergeStage", "entrytarget", "readOnboardingState", "markOnboardingStage", "resetOnboardingMemory", "onboardingbase"] },
  { app: "cadria", file: "pixel.ts", domain: "video", symbols: ["PixelError", "PixelImage", "PixelAdjustments", "PixelTint", "PixelKernel", "PixelOptions", "pixelkernels", "adjustimage", "boxblurimage", "convolveimage", "resizeimage", "runpixel", "tintimage"] },
  { app: "cadria", file: "pngencoder.ts", domain: "video", symbols: ["PngError", "PNG_SIGNATURE", "PNG_BYTES_PER_PIXEL", "PngFilter", "pngCrc32", "pngChunk", "pngFilterRow", "pngUnfilterRow", "PngChunkRead", "PngFilterSelection", "decodePng", "encodePng", "pngFilteredStream"] },
  { app: "cadria", file: "renderjob.ts", domain: "video", symbols: ["RenderJobFormat", "RenderJobRequest", "RenderJobIssue", "RenderJobOutcome", "RENDER_SLICE_SECONDS", "renderJobSlices", "executeRenderJob", "RenderJobVerify", "verifyRenderArtifact"] },
  { app: "cadria", file: "reveal.ts", domain: "video", symbols: ["initReveal", "useReveal"] },
  { app: "cadria", file: "routerbase.ts", domain: "video", symbols: ["routerBase"] },
  { app: "cadria", file: "sandboxmodality.ts", domain: "video", symbols: ["APPSLUG", "WORKLOADLANES", "SANDBOXLANEENV", "lanesandbox", "lanesandboxfromenv", "laneof"] },
  { app: "cadria", file: "seed.ts", domain: "video", symbols: ["seedPlayerFormats", "seedAnchors", "seedProjects", "seedSeatCards", "seedHeroBadges", "seedFilterChoices", "seedAutoplayChoices"] },
  { app: "cadria", file: "shadercomp.ts", domain: "video", symbols: ["ShaderEffectId", "ShaderEffect", "EffectProgram", "DissolveStep", "DissolvePlan", "SHADER_EFFECTS", "compileEffectProgram", "shaderManifest", "DissolveOutcome", "dissolvePlan", "libraryManifestComplete", "shaderIdsKnown"] },
  { app: "cadria", file: "shaders.ts", domain: "video", symbols: ["DirectionalLight", "PointLight", "ShaderLight", "ShadingMaterial", "DEFAULT_MATERIAL", "shadeLambert", "shadeBlinn", "shadePhong", "shadeToon", "fresnelSchlick", "shademesh", "SHADING_MODEL_GLSL", "FRAGMENT_MATERIALS", "Rgb"] },
  { app: "cadria", file: "studio.ts", domain: "video", symbols: ["StudioControls", "StudioGeneration", "SessionSave", "generateStudioProject", "downloadBlob", "pngSupported", "pngFromSvg", "probeGateway", "StudioSource", "analyzeSource", "fileSource", "fixtureSource", "reseededSeed", "saveToGateway"] },
  { app: "cadria", file: "synth.ts", domain: "video", symbols: ["TextureSpec", "TEXTURE_RANGES", "GRAIN_COUPLING", "TEXTURE_PRESET_BLEND", "JITTER_FIELD_CAP", "TexturePresetName", "TexturePreset", "texturePresets", "AA_MIN_CONTRAST", "ACCENT_HUE_FAN", "BalanceReport", "Block", "BlockRole", "CompositionGrid"] },
  { app: "cadria", file: "theme.ts", domain: "video", symbols: ["currentTheme", "applyTheme", "initTheme", "toggleTheme"] },
  { app: "cadria", file: "timeline.ts", domain: "video", symbols: ["EditItem", "EditTrack", "EditRange", "EditIssue", "EditOutcome", "EditLimits", "itemend", "sorttrack", "BinSlate", "DEFAULT_ZOOM_INDEX", "RulerTick", "SLATE_FACES", "ZOOM_LEVELS", "advanceplayhead"] },
  { app: "cadria", file: "timeticks.ts", domain: "video", symbols: ["TICKS_PER_SECOND", "MAX_TICKS", "FrameRate", "DEFAULT_FRAME_RATE", "COMMON_FRAME_RATES", "framerate", "frameratefromf64", "framelabel", "TimeRange", "TimecodeFields", "TimecodeParams", "addticks", "clampticks", "formattimecode"] },
  { app: "cadria", file: "transcode.ts", domain: "video", symbols: ["mediaversions", "mediapipelineerror", "nvencpreset", "nvencpresetladder", "nvencpresets", "getnvencpreset", "transcodemode", "transcodemodeentry", "Bitrate", "SourceMedia", "TranscodeError", "TranscodePlan", "TranscodePlanOptions", "TranscodeRung"] },
  { app: "cadria", file: "versa.ts", domain: "video", symbols: ["Vec3", "Mat4", "VersaError", "vec3add", "vec3cross", "vec3normalize", "mat4identity", "mat4multiply", "mat4invert", "mat4perspective", "mat4lookat", "composepipeline", "projectpoint", "rigpose"] },
  { app: "cadria", file: "versawase.ts", domain: "video", symbols: ["BadgeTone", "PlayerFormat", "CreativeAnchor", "GalleryDiscipline", "GalleryProject", "FeatureCard", "SignalBadge", "OptionChoice", "AnimationTrack", "Axis3", "CachedPass", "ClipEffect", "ClipTransition", "CompositionClip"] },
  { app: "cadria", file: "version.ts", domain: "video", symbols: ["packageversion"] },
  { app: "cadria", file: "video.ts", domain: "video", symbols: ["DecodeIssueCode", "DecodeIssue", "DecodeOutcome", "DecodeState", "DecodeSnapshot", "DecodeSession", "DecodeOptions", "opendecode", "VIDEO_EXTENSION", "VIDEO_MIME", "VideoArtifact", "VideoEncodeFormat", "VideoEncodeIssue", "VideoEncodeOptions"] },
  { app: "cadria", file: "visualai.ts", domain: "video", symbols: ["VariationBudget", "VariationParameters", "MeshVariation", "VariationRequest", "applyvariation", "proposevariations", "MotionSample", "KeyframeSuggestionOptions", "KeyframeSuggestion", "suggestkeyframes", "motionconfidence", "DEFAULT_SUGGESTION_OPTIONS", "DEFAULT_VARIATION_BUDGET"] },
  { app: "cadria", file: "visualize.ts", domain: "video", symbols: ["Vec3", "ImageInput", "MeshGeometry", "MeshOptions", "VisualizeError", "gridDimensions", "luminance", "blurHeights", "MaterialSummary", "ObjOptions", "VisualizeOptions", "VisualizeResult", "VisualizeStats", "boundingBox"] },
  { app: "cadria", file: "vite.config.ts", domain: "video", symbols: ["default"] },
  { app: "cadria", file: "vitest.config.ts", domain: "video", symbols: ["default"] },
  { app: "cadria", file: "webmencoder.ts", domain: "video", symbols: ["WebmError", "EBML_HEADER_ID", "SEGMENT_ID", "CADRIA_CODEC_ID", "DEFAULT_CLUSTER_FRAMES", "WebmFrameSource", "ebmlVintId", "ebmlVintSize", "WebmDecodeReport", "WebmDecodedFrame", "WebmEncodeOptions", "decodeWebmFrames", "ebmlElement", "ebmlFloat64"] },
  { app: "cadria", file: "wingets.ts", domain: "video", symbols: ["Constructionface", "EntryGate", "HomeEntrygate", "IntroCapabilities", "IntroDemo", "IntroFooter", "IntroSplash", "ShellBrandmark", "ShellCadriamark"] },
  { app: "cadria", file: "winsnap.ts", domain: "video", symbols: ["WIN_SNAP_EDGE_PX", "WIN_MAXIMIZE_EDGE_PX", "WIN_SNAP_GUTTER_PX", "WinSnapZone", "WinSnapRect", "winsnapzone", "winsnaprect"] },
  { app: "cobaia", file: "capacitor.config.ts", domain: "monetization", symbols: ["default"] },
  { app: "cobaia", file: "cli.ts", domain: "monetization", symbols: ["main"] },
  { app: "cobaia", file: "content.ts", domain: "monetization", symbols: ["blogpost", "familymember", "checkoutplan", "supportlinks", "adsslot", "seedPosts", "seedRoster", "seedPlans", "CONTENTKINDS", "contentkind", "contentrow", "contenttable", "contentvalue", "loadcontent"] },
  { app: "cobaia", file: "db.ts", domain: "monetization", symbols: ["tables", "db", "ensureSchema", "OnboardingStateRow", "OnboardingFlags", "getOnboardingState", "setOnboardingStage", "LabelRow", "readAllLabels", "readContentRows", "readLabel", "saveLabel", "seedContentTable", "seedLabelRows"] },
  { app: "cobaia", file: "drizzle.config.ts", domain: "monetization", symbols: ["default"] },
  { app: "cobaia", file: "familyurl.ts", domain: "monetization", symbols: ["familyurl"] },
  { app: "cobaia", file: "labels.ts", domain: "monetization", symbols: ["LABEL_REVISION", "LABEL_MANIFEST", "LabelKey", "label", "labelfill", "seedLabels"] },
  { app: "cobaia", file: "monetization.ts", domain: "monetization", symbols: ["adsslot", "ADS_LABEL", "ADS_EMPTY", "ADSSLOTS", "adsslotfor", "adsslotlive", "checkoutlinks", "supportlinks", "isconfigured", "planbyid", "posts", "roster", "postindex", "postwords"] },
  { app: "cobaia", file: "onboardingstate.ts", domain: "monetization", symbols: ["VisitorOnboarding", "OnboardingStage", "hostallowed", "mergeStage", "readOnboardingState", "markOnboardingStage", "resetOnboardingMemory"] },
  { app: "cobaia", file: "routerbase.ts", domain: "monetization", symbols: ["routerBase"] },
  { app: "cobaia", file: "sandboxmodality.ts", domain: "monetization", symbols: ["APPSLUG", "WORKLOADLANES", "SANDBOXLANEENV", "lanesandbox", "lanesandboxfromenv", "laneof"] },
  { app: "cobaia", file: "vite.config.ts", domain: "monetization", symbols: ["default"] },
  { app: "cobaia", file: "vitest.config.ts", domain: "monetization", symbols: ["default"] },
  { app: "cobaia", file: "wingets.ts", domain: "monetization", symbols: ["EntryGate", "IntroFooter", "IntroPlans", "IntroSplash", "ShellAdsslot", "ShellBrand", "roster", "type familymember"] },
  { app: "debonair", file: "analyze.ts", domain: "audio", symbols: ["BPM_FLOOR", "BPM_CEIL", "SILENCE_RMS", "BAND_LADDER", "BAND_LABELS", "AudioReport", "StructureSection", "analyze"] },
  { app: "debonair", file: "arrangement.ts", domain: "audio", symbols: ["ArrangementError", "rebaseSchedule", "validateArrangement", "ArrangerRole", "ROLE_NAMES", "PlanSection", "SECTION_PLAN", "RACK_LANES", "PlanOptions", "TOTAL_BARS", "TakePlan", "beatSecondsOf", "planTake", "resolveGenre"] },
  { app: "debonair", file: "audio.ts", domain: "audio", symbols: ["KeyMode", "NarrativeShape", "SpectralSummary", "RhythmStats", "HarmonicStats", "TimbreStats", "StructureStats", "DescriptorStats", "AnalysisReport", "AudioBufferLike", "AudioDecodeError", "AudioDescriptor", "AudioFrames", "BAND_EDGES_HZ"] },
  { app: "debonair", file: "beatgrid.ts", domain: "audio", symbols: ["BeatErrorCode", "BeatResult", "BeatGrid", "TempoCurve", "TempoAnchor", "TempoMap", "onsetEnvelope", "detectTempo", "beatCount", "beatTime", "beatsElapsed", "gridFromBeats", "gridToTempoMap", "identityGrid"] },
  { app: "debonair", file: "bigintids.ts", domain: "audio", symbols: ["mintid", "idtick"] },
  { app: "debonair", file: "blobstore.ts", domain: "audio", symbols: ["BLOB_SCHEMA_VERSION", "BLOB_DEFAULT_CAP_BYTES", "BLOB_GATEWAY_TIMEOUT_MS", "BlobPointer", "BlobManifestRow", "BlobErrorCode", "BlobResult", "BlobStore", "BLOB_BACKEND_ENV", "BLOB_BACKEND_NAMES", "BLOB_ORIGIN_ENV", "BLOB_ROOT_ENV", "BlobBackendName", "BlobSeatOptions"] },
  { app: "debonair", file: "capacitor.config.ts", domain: "audio", symbols: ["default"] },
  { app: "debonair", file: "catalog.ts", domain: "audio", symbols: ["listGenres", "listTimelineTracks", "listMixerStrips", "listReadouts", "listLibraryTracks", "listStageCards", "listHeroBadges", "listGenreProfileCards", "listOptionChoices", "listVitrineTracks", "vitrineRowOf"] },
  { app: "debonair", file: "cleanurl.ts", domain: "audio", symbols: ["cleanUrl", "applyNow", "syncCanonical"] },
  { app: "debonair", file: "cli.ts", domain: "audio", symbols: ["main"] },
  { app: "debonair", file: "cloudsync.ts", domain: "audio", symbols: ["CloudSyncError", "CLOUDSYNC_TIMEOUT_MS", "CLOUDSYNC_ENDPOINT", "CloudTake", "CloudResult", "CloudDeps", "validateCloudPayload", "CloudSaveInput", "listCloudTakes", "probeGateway", "removeCloudTake", "saveCloudTake"] },
  { app: "debonair", file: "composer.ts", domain: "audio", symbols: ["COMPOSER_ERROR_CODES", "ComposerErrorCode", "ComposerError", "SIMILARITY_FLOOR", "DEFAULT_BARS", "ComposerPromptSpec", "parseComposerPrompt", "planVector", "CompositionReport", "composeFromProfile", "composeSimilar", "compositionSimilarity"] },
  { app: "debonair", file: "coverpalette.ts", domain: "audio", symbols: ["coverPaletteFromStats", "coverPaletteFromPcm", "plateAccents"] },
  { app: "debonair", file: "dawview.ts", domain: "audio", symbols: ["formatClock", "clipStyle", "FADER_MIN_DB", "FADER_MAX_DB", "clampFader", "faderToUnit", "unitToFader", "FADER_STEP_DB", "formatGain", "levelToPercent", "playheadPercent"] },
  { app: "debonair", file: "db.ts", domain: "audio", symbols: ["db", "ensureSchema", "seedIfEmpty", "renderJobRows", "OnboardingStateRow", "OnboardingFlags", "LabelRow", "getOnboardingState", "readAllLabels", "readLabel", "saveLabel", "seedLabelRows", "setOnboardingStage"] },
  { app: "debonair", file: "demix.ts", domain: "audio", symbols: ["DemixErrorCode", "DemixError", "DEMIX_STEM_NAMES", "DemixStemName", "DEMIX_BASS_HZ", "DEMIX_VOCAL_HZ", "DemixStem", "DemixResult", "DemixWav", "demix", "demixToWavs"] },
  { app: "debonair", file: "drizzle.config.ts", domain: "audio", symbols: ["default"] },
  { app: "debonair", file: "ducking.ts", domain: "audio", symbols: ["DuckingErrorCode", "DuckingResult", "DuckingParams", "DuckingRegion", "FollowerState", "FLOORDB", "followerInitial", "validateDucking", "activityRegions", "autoDuckRegions", "duckKeyframes", "followerGainDb", "followerGainLinear", "followerStep"] },
  { app: "debonair", file: "family.ts", domain: "audio", symbols: ["FAMILY_SLUGS", "FamilyMember", "FAMILY_ACCENTS", "familyrow"] },
  { app: "debonair", file: "familyurl.ts", domain: "audio", symbols: ["familyurl"] },
  { app: "debonair", file: "fingerprint.ts", domain: "audio", symbols: ["PEAKS_PER_FRAME", "MAX_LAG_FRAMES", "PEAK_FLOOR_RATIO", "BAND_EDGES", "Peak", "Landmark", "DbEntry", "MatchResult", "FingerprintDB", "fingerprintOf", "landmarksOf", "peaksOfFrame"] },
  { app: "debonair", file: "formant.ts", domain: "audio", symbols: ["Vowel", "VOWEL_FORMANTS", "FormantPole", "UPPER_FORMANT_HZ", "UPPER_FORMANT_BW", "UPPER_FORMANT_GAINS", "vowelBank", "glideBank", "DEFAULT_SPEECH_HZ", "FORMANT_CONSONANT_S", "FORMANT_CONTROL_HOP", "FORMANT_ENVELOPE", "FORMANT_TARGET_PEAK", "FORMANT_VIBRATO_HZ"] },
  { app: "debonair", file: "gatewayapi.ts", domain: "audio", symbols: ["IngestJobState", "GatewayJobRow", "GatewayJobPatch", "GatewayJobSeat", "GatewayDocumentSeat", "GatewayProfileRow", "GatewayProfileSeat", "GatewayTrackSeat", "BlobStreamValue", "GatewayAnswer", "GatewayEnv", "GatewayErr", "GatewayErrorCode", "GatewayHandler"] },
  { app: "debonair", file: "generateclient.ts", domain: "audio", symbols: ["GenerateClientCode", "GenerateClientError", "GenerateClientResult", "GenerateClientDeps", "GENERATE_CALL_TIMEOUT_MS", "GENERATE_RENDER_TIMEOUT_MS", "GenerateReference", "GenerateComposition", "GenerateComposeCode", "GenerateComposeResult", "GenerateWavBytes", "composeTake", "fetchProfile", "fetchProfiles"] },
  { app: "debonair", file: "genre.ts", domain: "audio", symbols: ["CORPUS_SCHEMA_VERSION", "CORPUS_ERROR_CODES", "CorpusErrorCode", "CorpusError", "CorpusStyleRow", "GenreCorpus", "CorpusResult", "CorpusTrainOptions", "CORPUS_DEFAULT_BARS", "CORPUS_DEFAULT_REFERENCES", "CORPUS_INSTANT", "GENRES", "corpusSeatOf", "defaultGenreCorpus"] },
  { app: "debonair", file: "genrematrix.ts", domain: "audio", symbols: ["GenreStyle", "GENRES", "genreById", "pickBpm", "matchGenre", "validateMatrix"] },
  { app: "debonair", file: "harmonyengine.ts", domain: "audio", symbols: ["ProgressionSpec", "ChordEvent", "CadenceName", "RelativeSwap", "PROGRESSION_SETS", "PROGRESSION_IDS", "hashSeed", "mulberry32", "detectCadence", "generateProgression", "pickProgression", "reharmonizeDiatonic", "reharmonizeRelative", "tensionOf"] },
  { app: "debonair", file: "hpss.ts", domain: "audio", symbols: ["HARMONIC_KERNEL", "PERCUSSIVE_KERNEL", "Stft", "stft", "medianFilter", "istft", "masksOf", "StemPair", "separate"] },
  { app: "debonair", file: "ialane.ts", domain: "audio", symbols: ["servicelaneid", "ReferencePostInput", "ReferenceRecord", "postReference"] },
  { app: "debonair", file: "ingest.ts", domain: "audio", symbols: ["INGEST_SCHEMA_VERSION", "NOTE_NAMES", "IngestSegment", "IngestStem", "IngestDocument", "onsetSecondsOf", "pcmhash", "segmentsof", "ENERGY_CHUNK_MS", "EnergyChunk", "GenreProfileRow", "INGEST_CALL_TIMEOUT_MS", "INGEST_STEMS_SCHEMA_VERSION", "INGEST_UPLOAD_TIMEOUT_MS"] },
  { app: "debonair", file: "katexis.ts", domain: "audio", symbols: ["BadgeTone", "GenreConfig", "TimelineClip", "TimelineTrack", "MixerStripRow", "ReadoutRow", "RenderStage", "RENDER_STAGES", "FeatureCard", "GenreProfileCard", "LibraryStatus", "LibraryTrackRow", "MASTERING", "OptionChoice"] },
  { app: "debonair", file: "kathesis.ts", domain: "audio", symbols: ["ENGINE_NAME", "ENGINE_HOUSES", "KathesisSeat", "KATHESIS_SEATS", "seatOf", "payloadGenerationOf", "WavetableShape", "buildWavetable", "WavetableOscillator", "biquadOf", "runBiquad", "ADSR_MELODIC", "ADSR_PERCUSSIVE", "ADSR_SEGMENT_TCS"] },
  { app: "debonair", file: "labels.ts", domain: "audio", symbols: ["LABEL_REVISION", "LABEL_MANIFEST", "LabelKey", "label", "labelfill", "seedLabels"] },
  { app: "debonair", file: "limiter.ts", domain: "audio", symbols: ["TRUEPEAK_OVERSAMPLING", "LIMITER_LOOKAHEAD_S", "LIMITER_RELEASE_S", "LIMITER_MARGIN_DB", "LimiterOptions", "truePeakLinear", "limitTruePeak"] },
  { app: "debonair", file: "llmlane.ts", domain: "audio", symbols: ["LlmLaneCode", "LlmLaneError", "LLM_CALL_TIMEOUT_MS", "LLM_DEFAULT_MODEL", "llmlaneorigin", "ComposeWithLlmOptions", "LlmPlan", "LlmPlanResult", "composeWithLlm"] },
  { app: "debonair", file: "loudness.ts", domain: "audio", symbols: ["LoudnessErrorCode", "LoudnessResult", "KCoeffs", "BiquadState", "LoudnessReport", "ABSOLUTEGATE", "RELATIVEGATE", "energyToLufs", "analyzeLoudness", "applyGain", "biquadFilter", "channelWeights", "gainToTarget", "gatingBlocks"] },
  { app: "debonair", file: "mcplane.ts", domain: "audio", symbols: ["MCP_DOMAIN", "MCP_TOOL_NAMES", "McpToolProperty", "McpToolDef", "toolcatalog", "McpLaneConfig", "McpAgentLane", "MCP_POLL_INTERVAL_MS", "ComposePlanAiResult", "ComposePlanResult", "IngestReferenceResult", "ListVitrineResult", "MCP_POLL_DEADLINE_MS", "McpToolError"] },
  { app: "debonair", file: "midiwriter.ts", domain: "audio", symbols: ["MidiErrorCode", "MidiError", "MIDI_CONSTANTS", "VLQ_MAX", "MidiNote", "MidiTrack", "MidiProblem", "encodeVlq", "buildTracksFromSchedule", "decodeVlq", "secondsToTicks", "ticksToSeconds", "validateMidi", "writeMidi"] },
  { app: "debonair", file: "mixergraph.ts", domain: "audio", symbols: ["MixerGraphErrorCode", "MixerGraphError", "MixerSend", "MixerChannel", "MixerGraph", "ResolvedPath", "dbToLinear", "linearToDb", "assertAcyclic", "assertGraph", "effectiveGainDb", "effectiveGains", "graphFromStrips", "patchChannel"] },
  { app: "debonair", file: "motionpref.ts", domain: "audio", symbols: ["MOTION_PREF_KEY", "MotionStorage", "MotionRoot", "memoryMotionStorage", "sessionStorageOrMemoryMotion", "reduceMotionApplied", "reduceMotionStored", "setReduceMotion", "createMotionPref", "toggleReduceMotion"] },
  { app: "debonair", file: "musictheory.ts", domain: "audio", symbols: ["Key", "Chord", "ChordQuality", "ScaleName", "NOTE_NAMES", "FLAT_NAMES", "SCALE_STEPS", "SCALE_NAMES", "CHORD_SHAPES", "CHORD_SUFFIX", "INTERVAL_NAMES", "chordIntervals", "chordNotes", "chordPcs"] },
  { app: "debonair", file: "onboardingstate.ts", domain: "audio", symbols: ["VisitorOnboarding", "OnboardingStage", "hostallowed", "mergeStage", "readOnboardingState", "loadOnboardingState", "markIntroSeen", "markOnboardingSeen", "resetOnboardingMemory"] },
  { app: "debonair", file: "pattern.ts", domain: "audio", symbols: ["PATTERN_SCHEMA_VERSION", "TIMELINE_SCHEMA_VERSION", "PATTERN_SCHEMA_IDS", "NOTE_NAMES", "PatternScaleName", "PATTERN_SCALES", "PATTERN_SCALE_NAMES", "PATTERN_SCALE_ALIASES", "BAND_LABELS", "BPM_BUCKETS", "BPM_BUCKET_EDGES", "CHROMA_BINS", "CHROMA_DIM", "DRUM_LANE_KEYS"] },
  { app: "debonair", file: "pianoroll.ts", domain: "audio", symbols: ["PIANOROLL_CONSTANTS", "PianoRollErrorCode", "PianoRollError", "EditableNote", "RollWindow", "scheduleToNotes", "notesToSchedule", "addNote", "moveNote", "quantizeNote", "removeNote", "resizeNote", "validateNotes"] },
  { app: "debonair", file: "playerbus.ts", domain: "audio", symbols: ["ReferenceSource", "ReferenceTake", "ReferenceOrigin", "BusTake", "ReconTake", "isReferenceTake", "isReconTake", "durationOfTake", "BusNoticeCode", "DecodeBytesAnswer", "DecodedReference", "FetchBytesAnswer", "PlayerSnapshot", "REFERENCE_STORE_KEY"] },
  { app: "debonair", file: "recon.ts", domain: "audio", symbols: ["RECON_SCHEMA_VERSION", "RECON_SAMPLE_RATE", "RECON_PARAM_COUNTS", "RECON_NAME_MAX", "RECON_NOTES_MAX", "RECON_SCALE_NAMES", "RECON_ROOT_NAMES", "RECON_INSTRUMENTS", "RECON_CORRELATION_KEYS", "RECON_ENCODINGS", "RECON_ERROR_CODES", "RECON_FAMILIES", "RECON_FRAME_KEYS", "RECON_HEADER_KEYS"] },
  { app: "debonair", file: "remixplan.ts", domain: "audio", symbols: ["RemixErrorCode", "RemixResult", "RemixAnalysis", "RemixParams", "RemixPiece", "RemixPlan", "SimilarityMatrix", "JOINTCONTEXT", "MINPIECEBEATS", "XFADESECONDS", "beatSimilarity", "bestTargetBeat", "chromaMatch", "cosineSimilarity"] },
  { app: "debonair", file: "render.ts", domain: "audio", symbols: ["migraterenderjobsschema", "ensurerenderjobsschema", "putrenderjob", "getrenderjob", "updaterenderjob", "listrenderjobs", "migratetrackschema", "ensuretrackschema", "RenderTrackFilter", "getrendertrack", "listrendertracks", "publishrendertrack", "putrendertrack", "renderjobseat"] },
  { app: "debonair", file: "renderengine.ts", domain: "audio", symbols: ["RENDER_SAMPLE_RATE", "RENDER_BIT_DEPTH", "RENDER_WAV_KIND", "RENDER_PHASES", "RenderPhase", "RENDER_WORKER_MODALITY", "RenderBlobPointer", "RenderStorePut", "PatternSchedule", "RenderBlobStore", "RenderDbAnswer", "RenderEnv", "RenderErrorCode", "RenderJobPatch"] },
  { app: "debonair", file: "reveal.ts", domain: "audio", symbols: ["initReveal", "useReveal"] },
  { app: "debonair", file: "reverseingest.ts", domain: "audio", symbols: ["ReverseIngestErrorCode", "ReverseIngestError", "ReverseIngestOptions", "ReverseIngestOk", "ReverseIngestResult", "timelineEvents", "shapeTimelineLoudness", "reverseIngestPayload", "ReverseIngestVerification"] },
  { app: "debonair", file: "rhythmgrammar.ts", domain: "audio", symbols: ["LaneName", "PatternGrid", "SwingGrid", "FamilyName", "LANES", "FAMILY_NAMES", "STEPS", "gridFromSpec", "FAMILIES", "accentMap", "applyAccents", "applySwing", "cloneGrid", "emptyGrid"] },
  { app: "debonair", file: "routerbase.ts", domain: "audio", symbols: ["routerBase"] },
  { app: "debonair", file: "routetable.ts", domain: "audio", symbols: ["GatewayHandlerName", "RouteSpec", "routes", "matchpath", "RouteVerdict", "matchroute"] },
  { app: "debonair", file: "sandboxmodality.ts", domain: "audio", symbols: ["APPSLUG", "WORKLOADLANES", "SANDBOXLANEENV", "lanesandbox", "lanesandboxfromenv", "laneof", "WORKER_MODALITIES", "WORKER_MODALITY_ENV", "WorkerModality", "WorkerModalityResult", "workermodality", "workermodalityfromenv"] },
  { app: "debonair", file: "seed.ts", domain: "audio", symbols: ["seedGenres", "seedTimelineTracks", "seedMixerStrips", "seedReadouts", "seedLibraryTracks", "seedVitrineTracks", "seedStageCards", "seedHeroBadges", "seedGenreProfileCards", "seedLocaleChoices"] },
  { app: "debonair", file: "spectrum.ts", domain: "audio", symbols: ["FFT_SIZE", "HOP_SIZE", "HANN_TABLE", "SpectrumFrame", "fftInPlace", "frameSpectrum", "KK_MAJOR", "KK_MINOR", "chromaOf", "keyOf"] },
  { app: "debonair", file: "speechalign.ts", domain: "audio", symbols: ["SpeechAlignErrorCode", "SpeechAlignResult", "Segment", "FitEntry", "SpeechAlignParams", "AlignPlan", "defaultSpeechParams", "frameRms", "alignSpeech", "beatGridTimes", "clampStretch", "fitPlan", "flagsToSegments", "maxStretchRatio"] },
  { app: "debonair", file: "stages.ts", domain: "audio", symbols: ["StageId", "StudioStage", "STUDIO_STAGES", "findStage"] },
  { app: "debonair", file: "stems.ts", domain: "audio", symbols: ["StemsErrorCode", "StemsError", "STEMS_SCHEMA_VERSION", "StemRolePolicy", "STEM_ROLES", "stemFile", "StemPlan", "StemsManifestStem", "StemsManifest", "StemsProblem", "planStems", "stemsManifest", "validateStems"] },
  { app: "debonair", file: "take.ts", domain: "audio", symbols: ["NoteEvent", "TakeSchedule", "scheduleTake", "sectionAt", "eventsInWindow", "positionAt", "validateSchedule", "TAKE_STORE_KEY", "EXPORT_LABELS", "ExportFile", "ExportKind", "RECON_SEED_SCHEMA_VERSION", "StorageLike", "TAKE_SELECT_KEY"] },
  { app: "debonair", file: "theme.ts", domain: "audio", symbols: ["currentTheme", "applyTheme", "initTheme", "toggleTheme"] },
  { app: "debonair", file: "timelinemodel.ts", domain: "audio", symbols: ["TimelineErrorCode", "TimelineModelError", "TimelineClip", "TimelineGrid", "MINIMUMDURATION", "snapToGrid", "snapClip", "clipsOverlap", "activeAt", "moveClip", "splitClip", "totalDuration", "trimClip", "validatePlacement"] },
  { app: "debonair", file: "timestretch.ts", domain: "audio", symbols: ["StretchErrorCode", "StretchError", "STRETCH_RATIO_MIN", "STRETCH_RATIO_MAX", "stretchPcm"] },
  { app: "debonair", file: "tuning.ts", domain: "audio", symbols: ["CONCERT_PITCH", "A4_MIDI", "midiToHz"] },
  { app: "debonair", file: "vite.config.ts", domain: "audio", symbols: ["default"] },
  { app: "debonair", file: "vitest.config.ts", domain: "audio", symbols: ["default"] },
  { app: "debonair", file: "vocalsynth.ts", domain: "audio", symbols: ["VIBRATO_HZ", "VIBRATO_SEMITONES", "CONSONANT_SAMPLES", "TARGET_SYLLABLE_PEAK", "Syllable", "VoiceRenderOptions", "VoiceRender", "renderVoice", "SING_LIFT_SEMITONES", "SING_VELOCITY", "VOWEL_FORMANTS", "singPattern", "sungLineOf", "syllablesOfLine"] },
  { app: "debonair", file: "wavwriter.ts", domain: "audio", symbols: ["WavErrorCode", "WavError", "WavBitDepth", "WavFormatId", "WavFormatRow", "WAV_FORMAT", "HEADER_LAYOUT", "SAMPLE_RATE_MIN", "CHANNELS_MAX", "CHANNELS_MIN", "EXPORT_SIZE_LIMIT_BYTES", "MAX_DURATION_SECONDS", "SAMPLE_RATE_MAX", "WAV_CHANNELS_FIELD_MAX"] },
  { app: "debonair", file: "wingets.ts", domain: "audio", symbols: ["Constructionface", "HomeEntrygate", "ShellPlayerbar"] },
  { app: "devthink", file: "account.ts", domain: "os", symbols: ["ACCOUNT_CREDENTIAL_ID", "ACCOUNT_NAME_KEY", "AccountState", "accountstate", "createAccount", "verifyAccount", "replaceAccountPassword", "DevThinkIdentity", "ACCOUNT_OWNER_KEY", "ACCOUNT_TOKEN_KEY", "AccountError", "AccountRecord", "AccountSessionIssued", "AccountSessionState"] },
  { app: "devthink", file: "admins.ts", domain: "os", symbols: ["AdminSource", "Admin", "Ban", "AllowedSite", "AuditEntry", "admins", "syncCodeowners", "grantAdmin", "allowSite", "allowedSites", "audit", "banAddress", "bannedAt", "bans"] },
  { app: "devthink", file: "agent.ts", domain: "os", symbols: ["reservedagentnames", "agentname", "agentscopeof", "readonlyscope", "agentbudgetof", "spendbudget", "budgetremaining", "pauseagent", "acquirelock", "agentbudgetcheck", "agenteventof", "agentheartbeat", "agentruncontext", "aggregatereport"] },
  { app: "devthink", file: "agentcert.ts", domain: "os", symbols: ["runagentcertsuite", "runleaderworkertopologyscenario", "agentcertreport", "agentcertrecord"] },
  { app: "devthink", file: "akash.ts", domain: "os", symbols: ["AKASH_SHEET", "AKASH_BACKOUT", "AKASH_EXIT", "AKASH_MICRO", "AKASH_SPRING", "AKASH_MARK_FLOOR", "prefersReducedMotion", "akashSpringTrack", "akashBeat"] },
  { app: "devthink", file: "apifreeze.ts", domain: "os", symbols: ["protocolsupported", "apifreezerelease", "apifreezedate", "apifreezescope", "protocolmajorof", "negotiateprotocol", "sharedprotocolversion", "deprecatedfield", "apifreezebaseline", "backgroundsurfacemessages", "capmanifest", "capmanifestdiff", "capmanifestof", "capmanifestsurface"] },
  { app: "devthink", file: "appregistry.ts", domain: "os", symbols: ["DesktopAppTarget", "DesktopApp", "DESKTOP_APPS", "PINNED_APPS", "FAMILY_APP_IDS", "isFamilyApp", "searchDesktopApps"] },
  { app: "devthink", file: "auth.ts", domain: "os", symbols: ["tokenhashprefix", "defaulttokenlifetimems", "defaultpairinglifetimems", "defaultchallengelifetimems", "authrefusedmessage", "tokenhashof", "issuepairingcode", "redeempairingcode", "authorizeurl", "bridgepairingscopes", "capturecode", "checkallowlist", "exchangebridgepairing", "expiretokens"] },
  { app: "devthink", file: "automation.ts", domain: "os", symbols: ["triggernames", "workflowtriggers", "triggermatch", "validateworkflowinputs", "triggerregistry", "commandguard", "parsecommand", "platformadapter", "applicationbridge", "applicationmanifest", "backupplan", "backupplaninput", "controladapter", "controloperations"] },
  { app: "devthink", file: "babelcoreface.ts", domain: "os", symbols: ["BabelTransformOptions", "BabelTransformResult", "BabelTransformSync", "transformSync", "default"] },
  { app: "devthink", file: "background.ts", domain: "os", symbols: ["executefilesstep", "processmcpframe"] },
  { app: "devthink", file: "bridge.ts", domain: "os", symbols: ["serveroperations", "servereventtypes", "pagecontentkeys", "contractcapabilities", "stableopid", "negotiatecapabilities", "composeenvelope", "parseenvelope", "attachnativehost", "bridgeframerate", "bridgepayload", "bridgestatuslabel", "bridgestatusview", "carddecision"] },
  { app: "devthink", file: "browserextension.ts", domain: "os", symbols: ["extensionpermissions", "permissionpolicy", "requestpermission", "protocolversion", "extensioncommands", "createid", "createcommand", "createmessage", "assertmessage", "buildextension", "createerror", "createresponse", "createsnapshot", "createworkerrouter"] },
  { app: "devthink", file: "build.ts", domain: "os", symbols: ["buildBinary", "StyleDict", "parseCssTokens", "resolveCssVars", "Rgb", "cssColorToRgb", "JsxAttr", "JsxChild", "$", "ConvertContext", "JsxElement", "TERMINAL_WIDGETS", "collectStyleContracts", "convertAll"] },
  { app: "devthink", file: "bun.ts", domain: "os", symbols: ["bunadapter"] },
  { app: "devthink", file: "calculator.ts", domain: "os", symbols: ["CalculatorOperator", "CalculatorToken", "CalculatorError", "CalculatorKeyAction", "tokenizeCalculator", "evaluateExpression", "formatCalculator", "mapKeyboardKey", "applyKey", "memoryAdd", "memoryClear", "memoryRecallExpression", "memorySubtract"] },
  { app: "devthink", file: "capacitor.config.ts", domain: "os", symbols: ["default"] },
  { app: "devthink", file: "capture.ts", domain: "os", symbols: ["captureformats", "capturetargets", "capturekinds", "captureoptionsof", "capturevisible", "capturestitched", "captureelement", "captureregion", "annotationplan", "annotationplanof", "assetentries", "blendrows", "buildname", "buildpdf"] },
  { app: "devthink", file: "catalog.ts", domain: "os", symbols: ["FamilySite", "Recipe", "Rung", "CoreModule", "NativeApp", "RunnerBinary", "StudioAsset", "StudioTrack", "AboutBlock", "AppIcon", "AppIconSet", "LanguageRow", "LegalSection", "MediaSlot"] },
  { app: "devthink", file: "chatstate.ts", domain: "os", symbols: ["TurnRole", "ChatTurn", "ChatCheckpoint", "ChatBirth", "ChatSession", "isChatTurn", "isChatCheckpoint", "isChatBirth", "ACCOUNT_GUARD_NOTE", "ACTIVE_KEY", "CHAT_HANDOFF_KEY", "CHAT_THINKING_LEVELS", "CHAT_TOOLS", "ChatStoppedError"] },
  { app: "devthink", file: "chipterminal.ts", domain: "os", symbols: ["ChipTerminalProps", "ChipTerminal"] },
  { app: "devthink", file: "cjswrap.ts", domain: "os", symbols: ["cjswrap"] },
  { app: "devthink", file: "cleanurl.ts", domain: "os", symbols: ["CleanResult", "cleanUrlDetailed", "cleanUrl", "View", "navigate", "ensureCleanLocation", "parseHashRoute", "bindLocationJanitor", "applyNow", "syncCanonical"] },
  { app: "devthink", file: "cli.ts", domain: "os", symbols: ["runclifamily", "parsecliconfig", "cliexitclasses", "exitcodeof", "exitclassofrun", "manifestkeyallowlist", "reviewedwebresources", "capabilityapireport", "bundlesizeaccounting", "composeworkflowdocument", "conversionrecord", "csphashesof", "deepmanifestchecks", "exportdatacontent"] },
  { app: "devthink", file: "commands.ts", domain: "os", symbols: ["tabshape", "windowshape", "parsetabquery", "tabpatternmatches", "querymatches", "normalizedtaburl", "clonewarning", "clonetabs", "advancecounter", "advancedownload", "assigntasktabs", "audiotabs", "badgefromprogress", "batchopenlinks"] },
  { app: "devthink", file: "companion.ts", domain: "os", symbols: ["nativehosttemplatejson", "companionbuild", "companionprotocol", "companionsurfaces", "encodenativemessage"] },
  { app: "devthink", file: "config.ts", domain: "os", symbols: ["DevThinkConfig", "AuthKind", "AuthCredential", "DevThinkAuth", "DevThinkPaths", "resolvePaths", "ensurePaths", "readConfig", "ANTIGRAVITY_CONFIG_JSON_SCHEMA", "AntigravityConfig", "BypassMetadata", "CONFIG_DEFAULTS", "Config", "ConfigValidationError"] },
  { app: "devthink", file: "consoleboot.ts", domain: "os", symbols: ["consoleprompt", "consoleversion", "bootdelay", "bootlines", "bootstageentry", "BOOTSTAGES", "BOOTWIRES", "bootgraph", "BOOT_STAGE_GAP", "bootrunnerhandler"] },
  { app: "devthink", file: "constants.ts", domain: "os", symbols: ["FETCH_TIMEOUT_MS", "JITTER_MIN_MS", "JITTER_MAX_MS", "DEBUG_LOG_MAX_BYTES", "DEBUG_LOG_RETENTION_DAYS", "DEBUG_BUFFER_TUI_LINES"] },
  { app: "devthink", file: "core.ts", domain: "os", symbols: ["fnv1a32", "fnv1a32Hex", "fnv1a64", "fnv1a64Bytes", "jitter", "getJitter", "getJitterMs", "pickRandom", "CircularBuffer", "DEBUG_BUFFER_TUI_LINES", "DEBUG_LOG_DIR_SUBPATH", "DEBUG_LOG_FILE_NAME", "DEBUG_LOG_MAX_BYTES", "DEBUG_LOG_RETENTION_DAYS"] },
  { app: "devthink", file: "costcert.ts", domain: "os", symbols: ["runcostcertsuite", "costcertreport", "costcertrecord"] },
  { app: "devthink", file: "dashboard.ts", domain: "os", symbols: ["agentstatuscard", "queuelanerow", "messageflowrow", "conflictlogrow", "costperagentrow", "escalationrow", "timelinescrubmark", "topologyinventoryentry", "alttabkeydown", "altgestureend", "nextaltindex", "mruorder", "IconSpot", "IconBounds"] },
  { app: "devthink", file: "data.ts", domain: "os", symbols: ["builddataset", "checksum", "exportcontent", "exportartifact", "artifactrecordof", "chunkplan", "backpressure", "advancestream", "advancecursor", "chunkextractprogress", "chunkextracttaskof", "chunkextractwindow", "columnspecof", "deduperows"] },
  { app: "devthink", file: "debug.ts", domain: "os", symbols: ["cdpkinds", "cdpdomains", "methoddomain", "cdpallowlistof", "allowlistcovers", "attachcdpsession", "detachcdpsession", "sendcdpcommand", "annotatetrace", "annotationof", "attachtargetof", "breakpointinputof", "capturepause", "capturesourcemaps"] },
  { app: "devthink", file: "deno.ts", domain: "os", symbols: ["denoadapter", "denoconfigread"] },
  { app: "devthink", file: "devthink.ts", domain: "os", symbols: ["ParsedArgs", "main"] },
  { app: "devthink", file: "doccheck.ts", domain: "os", symbols: ["rundocchecksuite", "doccheckreport", "doccheckrecord"] },
  { app: "devthink", file: "dockmagnify.ts", domain: "os", symbols: ["DOCK_MAGNIFY_MAX", "DOCK_MAGNIFY_SPREAD", "magnifyscale"] },
  { app: "devthink", file: "drizzle.config.ts", domain: "os", symbols: ["default"] },
  { app: "devthink", file: "engines.ts", domain: "os", symbols: ["EngineKind", "EngineState", "EngineRunner", "EngineRecord", "ENGINEPLANCOUNT", "ENGINES", "EnginePlanReport", "enginesreport", "ENGINEOWNERS", "EngineDispatch", "OFFICIALAPPS", "consumerpairs", "dispatchengine", "dispatchtable"] },
  { app: "devthink", file: "environments.ts", domain: "os", symbols: ["offfamilyof", "environmentsof", "defaultenvironment", "offloadkinds", "markuprenderstep", "environmentrequirementsof", "executorregistry", "routeenvironment", "acceptrenderresult", "acceptworkerresponse", "activelayers", "agentgrammarvalid", "agentpresetof", "applylayer"] },
  { app: "devthink", file: "evidence.ts", domain: "os", symbols: ["pixeldiff", "capturegrab", "forensickinds", "beforeafter", "consoletimeline", "nettimeline", "diffbase", "diffshot", "assemblelapse", "comparemetricdefaults", "comparesessionmetrics", "exportcaptures", "firstdivergenceof", "joinruns"] },
  { app: "devthink", file: "export.ts", domain: "os", symbols: ["exportformats", "exportscopes", "exportdescriptorof", "csvfield", "csvof", "markdownfield", "markdownof", "jsonlinesof", "applyimport", "chainrows", "cleanupafterrun", "detectfilekind", "dropimportof", "encryptsync"] },
  { app: "devthink", file: "familyaccent.ts", domain: "os", symbols: ["FAMILY_ACCENT", "GlyphMotion", "familyAccentOf"] },
  { app: "devthink", file: "familylanes.ts", domain: "os", symbols: ["familylanes"] },
  { app: "devthink", file: "fileexplorer.ts", domain: "os", symbols: ["ExplorerLocation", "ShellFolderId", "SHELL_FOLDER_ORDER", "FOLDER_NAMES", "FOLDER_DETAILS", "ExplorerItemKind", "Crumb", "parsepath", "EXPLORER_PLATFORMS", "ExplorerPlatform", "ExplorerSort", "ExplorerViewMode", "breadcrumbs", "capacityline"] },
  { app: "devthink", file: "flow.ts", domain: "os", symbols: ["manifestdigest", "validatemanifest", "verifypublishersignature", "signmanifest", "libraryentryof", "grantdiffof", "sensitiveconsentfor", "libraryproposalof", "conflictsfor", "dataexpectationssummary", "dryflowdriver", "exportlibrarymanifests", "fileproviderof", "flowdriver"] },
  { app: "devthink", file: "gates.ts", domain: "os", symbols: ["gatekindfor", "paypayload", "deletepayload", "credspayload", "opengate", "gatestateof", "resolvegate", "nobatchresolution", "approvalprompt", "defaultapprovalwindowms", "expireapprovals", "gateforstep", "gateprompttext", "listapprovals"] },
  { app: "devthink", file: "gateway.ts", domain: "os", symbols: ["PREF_GATEWAYBASE", "GATEWAY_REQUIRED_COPY", "GATEWAY_SEND_NOTICE", "normalizeGatewayBase", "GatewayEndpointCheck", "validateGatewayEndpoint", "GatewayProbe", "probeGatewayBase", "GatewayContext", "GatewayRegistration", "GatewayStatus", "PairingReadiness", "SandboxServerAnswer", "SandboxServerRow"] },
  { app: "devthink", file: "graph.ts", domain: "os", symbols: ["nodekind", "nodestate", "NODE_KINDS", "NODE_STATES", "graphnode", "graphedge", "nodegraph", "graphproblem", "addedge", "addnode", "ancestors", "ancestorsubgraph", "clonegraph", "collapsecount"] },
  { app: "devthink", file: "hardening.ts", domain: "os", symbols: ["masklogtext", "localscangate", "hatchbannerof", "newdomainpausecard", "runtracekeys", "syncrotationgate", "stdioclientsignaturegate", "transparencyexportmask"] },
  { app: "devthink", file: "headless.ts", domain: "os", symbols: ["headlessfixturestep", "headlessprogress", "openheadlesssession", "headlessgatewait", "closeheadlesssession", "remoteattachframes", "headlesspolicyvalidate", "headlessauditread", "bundlestamp", "headlessmemory", "headlessplan", "headlessrun", "headlesssessionview", "headlesssubscribe"] },
  { app: "devthink", file: "hono.ts", domain: "os", symbols: ["cors", "Context", "Hono", "serve", "serveStatic"] },
  { app: "devthink", file: "http.ts", domain: "os", symbols: ["httpkinds", "transportresponse", "fetchtransport", "calltransport", "statusclassof", "templateurl", "fetchrequestof", "fetchoptionsof", "apicallrecordof", "bodyhashof", "cachecleanup", "cacheexpiryof", "cachekeyof", "cacheresponse"] },
  { app: "devthink", file: "icons.ts", domain: "os", symbols: ["iconpayloads", "manifesticons", "actiondefaulticon"] },
  { app: "devthink", file: "index.ts", domain: "os", symbols: ["actionkindcatalog", "adaptermappinggate", "adaptivepollvalid", "agentbudgetvalid", "agentnamevalid", "agentscopegate", "agentscopevalid", "apicallgrade", "apikeyconsentgranted", "argkind", "attachtimeline", "authconsentgranted", "automationallowlistgate", "backgroundrungate"] },
  { app: "devthink", file: "introtarget.ts", domain: "os", symbols: ["IntroTarget", "INTRO_SEEN_KEY", "resolveintrotarget", "panelgateverdict"] },
  { app: "devthink", file: "kbdterminal.ts", domain: "os", symbols: ["KbdTerminalProps", "KbdTerminal"] },
  { app: "devthink", file: "labels.ts", domain: "os", symbols: ["LABEL_REVISION", "labelManifest", "LabelKey", "label", "ChatSuggestion", "seedChatSuggestions", "chatSuggestions", "ChatGreeting", "ChatLimitId", "ChatLimitRow", "ChatNavRow", "ChatStringId", "ChatStringRow", "ChatThinkingRow"] },
  { app: "devthink", file: "logics.ts", domain: "os", symbols: ["DEDUP_LAW", "LogicEntry", "DuplicateFamily", "DOMAIN_OF_APP", "DUPLICATE_FAMILIES", "DEDUP_RESOLUTIONS", "LOGICS", "byApp", "byDomain", "findOwner", "importSpec", "expand", "LOGIC_STATS", "ExpandedLogic"] },
  { app: "devthink", file: "matrixverify.ts", domain: "os", symbols: ["runmatrixverifysuite", "matrixverifyreport", "matrixverifyrecord"] },
  { app: "devthink", file: "mcp.ts", domain: "os", symbols: ["servemethods", "servemetadata", "clientmetadataof", "recordclientmetadata", "serveinitialize", "transportendpoints", "startserve", "shutdowndrain", "auditline", "bindclientsession", "bindlocalhost", "calloutcome", "chunkframes", "chunkof"] },
  { app: "devthink", file: "mcpregistry.ts", domain: "os", symbols: ["McpEndpoint", "CustomProvider", "McpRegistryState", "McpStorageAdapter", "memorystorage", "localstorageadapter", "safeurl", "McpRegistry", "createmcpregistry", "McpAnswer", "McpEndpointInput", "McpProviderInput"] },
  { app: "devthink", file: "media.ts", domain: "os", symbols: ["buildffmpegcommand", "createoptimal", "default", "defaultpassagechannel", "getnvencpreset", "mediafeatureindex", "mediapipeline", "mediapipelineerror", "mediaversions", "nvencencodernames", "nvencpresetladder", "nvencpresets", "passagesecurechannel", "probefromname"] },
  { app: "devthink", file: "memory.ts", domain: "os", symbols: ["memoryadapter", "sessionmemory", "randomid", "sensitivememoryclasses", "provenanceof", "memoryitemof", "attachprovenance", "stepsummaryfor", "advanceselcachegeneration", "auditexportof", "bytesreclaimed", "cacheselentry", "cleanupbatch", "decryptvalue"] },
  { app: "devthink", file: "modes.ts", domain: "os", symbols: ["ModeDefinition", "MODES", "listModes", "resolveMode", "modePrompt"] },
  { app: "devthink", file: "net.ts", domain: "os", symbols: ["netwatchkinds", "resourcefact", "resourcefacts", "failureclass", "correlationid", "newexchange", "pairexchange", "filterexchanges", "apientries", "apireplayspecof", "applyheaderules", "blockruleof", "bodyfilterof", "bodymatches"] },
  { app: "devthink", file: "neutral.ts", domain: "os", symbols: ["actionkindcatalog", "adaptermappinggate", "adaptivepollvalid", "agentbudgetvalid", "agentnamevalid", "agentscopegate", "agentscopevalid", "apicallgrade", "apikeyconsentgranted", "argkind", "attachtimeline", "authconsentgranted", "automationallowlistgate", "backgroundrungate"] },
  { app: "devthink", file: "node.ts", domain: "os", symbols: ["nodeadapter"] },
  { app: "devthink", file: "onboardingstate.ts", domain: "os", symbols: ["VisitorOnboarding", "onboardingstage", "ONBOARDING_CACHE_KEY", "VISITOR_KEY", "ONBOARDING_BASE_ENV", "ispublichttpsbase", "onboardingapibase", "visitorid", "peekonboardingstate", "readonboardingstate", "writeonboardingstage"] },
  { app: "devthink", file: "os.ts", domain: "os", symbols: ["AppId", "AppPage", "AppTarget", "AppMeta", "APPS", "appMeta", "appExternalUrl", "Persona", "ChatStoppedError", "DEFAULT_SETTINGS", "GatewayMessage", "GatewayModel", "GatewayReply", "GatewayRole"] },
  { app: "devthink", file: "pack.ts", domain: "os", symbols: ["artifactchannels", "artifactchannelof", "artifactmanifestof", "artifactmanifesttext", "artifactmanifestnameof", "artifactmanifestcheck", "rollbackpinnedset", "sbomspecversion", "containerbuildchecks", "containerbuildstages", "containerdigestfiles", "containerexposedsurfaces", "containerimagetags", "containerrunnerentry"] },
  { app: "devthink", file: "page.ts", domain: "os", symbols: ["browserresult", "isbrowserkind", "readcapabilities", "runbrowseraction", "stepresult", "runpageaction", "typetimeschedule", "appendvalue", "activeblackboxpatterns", "applyexpression", "associateerrors", "attachplan", "authfor", "backoffrule"] },
  { app: "devthink", file: "panelsync.ts", domain: "os", symbols: ["PanelSyncReport", "panelSync"] },
  { app: "devthink", file: "paneltypes.ts", domain: "os", symbols: ["DevThinkProvider", "DevThinkMessage", "DevThinkTab"] },
  { app: "devthink", file: "parseoptions.ts", domain: "os", symbols: ["parseoptions"] },
  { app: "devthink", file: "pentest.ts", domain: "os", symbols: ["runpentestchecklist", "pentestreport", "pentestrecord"] },
  { app: "devthink", file: "perf.ts", domain: "os", symbols: ["perfrecordof", "workerbackpressure", "queuedepthsampleof", "queuedepthview", "snapshotrequestkey", "dedupesnapshotrequests", "captureplanschedule", "abandonedparsetasks", "adaptivepollnext", "advancelane", "artifactcompressof", "artifactreadplan", "batchbackpressuresignal", "batchqueryplanof"] },
  { app: "devthink", file: "permdiff.ts", domain: "os", symbols: ["permdiffbaseline", "permissionset", "permissionsetof", "previousof", "diffpermissionsets"] },
  { app: "devthink", file: "personalstore.ts", domain: "os", symbols: ["WallpaperId", "WALLPAPERS", "WALLPAPER_KEY", "loadWallpaper", "applyWallpaper", "saveWallpaper", "AccentId", "ACCENTS", "ACCENT_KEY", "ALTTAB_MOTION_KEY", "DEVTOOLS_WALL_KEY", "FlagChoice", "TASKBAR_TIPS_KEY", "THEME_MIRROR_KEY"] },
  { app: "devthink", file: "plan.ts", domain: "os", symbols: ["planfilestepfields", "loopkinds", "retrykinds", "parseplanfile", "planoriginprofile", "plansteprisk", "lintplanfile", "formatdiagnostics", "activetimelineanchor", "appendlogstreamevent", "auditexcerptof", "diffpreviewof", "filterlogstream", "livebufferof"] },
  { app: "devthink", file: "planstore.ts", domain: "os", symbols: ["Tier", "TierBadge", "TIER_BADGES", "TIER_ROWS", "CAPABILITY_BADGES", "PlanCustom", "PlanView", "peekplan", "loadplan", "saveplan", "planbadge"] },
  { app: "devthink", file: "policy.ts", domain: "os", symbols: ["normalizeendpoint", "hostpattern", "issessionkind", "isworkflowkind", "istriggeraction", "iswatchkind", "isdebugkind", "iscdpkind", "actionkindcatalog", "actionrisk", "adaptermappinggate", "adaptivepollvalid", "agentbudgetvalid", "agentnamevalid"] },
  { app: "devthink", file: "poolaudit.ts", domain: "os", symbols: ["runpoolauditsuite", "groupcounts", "poolcoveragereport", "poolcoveragerecord"] },
  { app: "devthink", file: "popup.ts", domain: "os", symbols: ["v1sunsetbannercard", "migrationpromptcard", "renderv1sunsetbanner", "rendermigrationpromptbanner"] },
  { app: "devthink", file: "prismaconfig.ts", domain: "os", symbols: ["default"] },
  { app: "devthink", file: "progress.ts", domain: "os", symbols: ["provenancestamp", "provenancestampof", "progressnow", "recordoutcomewithclock", "emptyprogress", "recordstep", "recordoutcome", "recordenvironment", "assigntasktab", "callentries", "callentry", "captureentries", "cdpevidence", "cdpevidences"] },
  { app: "devthink", file: "protocol.ts", domain: "os", symbols: ["parseproposal", "workflowproposal", "workflowstepoutcome", "parseworkflowproposal", "workflowoutcome", "requestbody", "consensusreport", "parsespawnrequest", "agenteventframe", "aggregationreport", "allowlistreport", "approvalframes", "auditexportreport", "authreport"] },
  { app: "devthink", file: "pythonscripts.ts", domain: "os", symbols: ["pythonreason", "pythonresult", "pythonanswer", "pythonoptions", "PYTHON_DEFAULTS", "pythonrunner", "jsonanswer", "pythonargv", "exitedclean", "normalizeresult", "parsejsonstdout", "runpython", "runpythonjson", "spawnpythonrunner"] },
  { app: "devthink", file: "queue.ts", domain: "os", symbols: ["QueueCancelledError", "QueueTask", "QueueHandle", "RequestQueue", "createRequestQueue", "RetryConfig", "RETRY_DEFAULTS", "RetryableError", "BudgetMessage", "CompactMessage", "CompactOptions", "CompactPlan", "CompactResult", "CompactRole"] },
  { app: "devthink", file: "recentapps.ts", domain: "os", symbols: ["RecentEntry", "loadrecentapps", "loadrecententries", "pushrecentapp"] },
  { app: "devthink", file: "recipes.ts", domain: "os", symbols: ["recipecheck", "recipeentry", "recipereport", "runrecipessuite", "gallerydriftof", "reciperecord"] },
  { app: "devthink", file: "records.ts", domain: "os", symbols: ["recordsummary", "renderrecord", "syncrecord", "summaryproblemsof", "syncmode"] },
  { app: "devthink", file: "release.ts", domain: "os", symbols: ["releasepublishpat"] },
  { app: "devthink", file: "reveal.ts", domain: "os", symbols: ["initReveal", "useReveal", "observeReveals"] },
  { app: "devthink", file: "routerbase.ts", domain: "os", symbols: ["routerBase"] },
  { app: "devthink", file: "run.ts", domain: "os", symbols: ["openrun", "beatrun", "closerun", "reattachrun", "recordurl", "recordenvironment", "recordturnaround", "markpending", "acquirerunlock", "acquiresessionlock", "advancerun", "appendvisit", "argkind", "attachtimeline"] },
  { app: "devthink", file: "runner.ts", domain: "os", symbols: ["catalogbase", "hostIsAllowed", "queuebinarylaunch", "queuestudiorender"] },
  { app: "devthink", file: "runtime.ts", domain: "os", symbols: ["adaptermodeof", "clockadapterof", "loggeradapterof", "fetchadapterof", "defaultclock", "defaultlogger", "defaultfetch", "platformadapterof", "ANSI_RESET", "ColorDepth", "ICON_GLYPHS", "ICON_GLYPHS_PLAIN", "IrBox", "IrChildren"] },
  { app: "devthink", file: "saascontent.ts", domain: "os", symbols: ["saasnavrow", "saaschrome", "saasheadertabs", "saasrailstops", "saasherocards", "saascreatorsintro", "saasswingcard", "saasswingcards", "saasadvisor", "saascadria", "saascadriaheroart", "saascadriaitem", "saascadrialiveart", "saascadriarail"] },
  { app: "devthink", file: "sandboxlane.ts", domain: "os", symbols: ["SandboxError", "SandboxRow", "SandboxAnswer", "runsandboxline", "createsandboxsession", "listsandboxtree", "writesandboxfile", "hostmodalityreport", "APPSLUG", "SANDBOXLANEENV", "WORKLOADLANES", "laneof", "lanesandbox", "lanesandboxfromenv"] },
  { app: "devthink", file: "scripts.ts", domain: "os", symbols: ["default"] },
  { app: "devthink", file: "security.ts", domain: "os", symbols: ["denydefaultposture", "exactorigin", "wildcardentry", "allowlistcheck", "originprofileof", "profilekind", "profilegrade", "sensitiveclassesof", "apifeatureflagintersection", "apimapbrowsercacheprobe", "apimapbrowserof", "apimapentries", "apimapentryof", "apimapkinds"] },
  { app: "devthink", file: "serve.ts", domain: "os", symbols: ["jsonrpcmessage", "encodemessage", "decodemessage", "framesof", "batchof", "isnotification", "notificationframe", "errorwithretry", "errorresponse", "listmcpprompts", "promptsof", "publishchange", "readresource", "rendermcpprompt"] },
  { app: "devthink", file: "server.ts", domain: "os", symbols: ["ServerOptions", "ServerHandle", "startServer", "appendqueryparams", "autofrequencypenalty", "automaxtokens", "auton", "autopresencepenalty", "autoseed", "autotemp", "autothinking", "autotopp", "buildauthheaders", "buildauthqueryparams"] },
  { app: "devthink", file: "session.ts", domain: "os", symbols: ["sessionkinds", "sessionfileversion", "snapshotsections", "searchfields", "taskstatechecksum", "taskstateof", "taskstatevalid", "sessiontabof", "addhistoryentry", "addrecallentry", "autointervalof", "cancelrunactionof", "classifyfailure", "consentadvisory"] },
  { app: "devthink", file: "settingstypes.ts", domain: "os", symbols: ["PreferenceKey", "SettingsCategoryId", "SettingsSnapshot"] },
  { app: "devthink", file: "shellterminal.ts", domain: "os", symbols: ["ControlShellTerminalProps", "ControlShellTerminal"] },
  { app: "devthink", file: "soak.ts", domain: "os", symbols: ["runsoaksuite", "soakreport", "soakrecord"] },
  { app: "devthink", file: "storage.ts", domain: "os", symbols: ["StoredWorkspace", "StoredTab", "StoredMessage", "StoredSession", "StoredPreference", "mirrorSession", "readPreferences", "savePreference", "BrowserCredential", "BrowserIdentity", "BrowserLabel", "BrowserMessage", "BrowserPreference", "BrowserRoute"] },
  { app: "devthink", file: "swarm.ts", domain: "os", symbols: ["electleader", "assignwork", "collectresults", "scaleworkers", "plannersplit", "reportstep", "requestreview", "ackreview", "applyreview", "arbitrate", "blackboardsections", "boardstate", "boardsummary", "canceltask"] },
  { app: "devthink", file: "sweep.ts", domain: "os", symbols: ["runsweepsuite", "sweepreport", "sweeprecord"] },
  { app: "devthink", file: "telemetryfree.ts", domain: "os", symbols: ["runtelemetryfreesuite", "telemetryfreereport", "telemetryfreerecord"] },
  { app: "devthink", file: "tools.ts", domain: "os", symbols: ["toolcatalogversion", "toolnamespaces", "domainkinds", "toolschemaof", "openapilayout", "buildtoolcatalog", "alltools", "toolname", "applymock", "applyratelimit", "batchrisk", "begincall", "callretryhintof", "checkidempotency"] },
  { app: "devthink", file: "types.ts", domain: "os", symbols: ["protocolversion", "protocolmajorversion", "pinnedprotocolversion", "actionkind", "actionkindids", "actionrisk", "planstate", "auditkind", "datainventory", "purgepolicy", "syncsettings", "syncrecord", "cookiejarrecord", "cleanupschedule"] },
  { app: "devthink", file: "uistore.ts", domain: "os", symbols: ["uistoreseedrows", "uicopyrow", "loaduicopy", "uicopy", "useUicopy", "uistoreget", "uistorelist", "uistoreupsert", "CopyRow", "copy", "copyseed", "label", "loadcopy", "seedLabels"] },
  { app: "devthink", file: "umdwrap.ts", domain: "os", symbols: ["umdwrap"] },
  { app: "devthink", file: "useismobile.ts", domain: "os", symbols: ["WindowBodySurface", "useContainerWidth", "useIsMobile"] },
  { app: "devthink", file: "usestoredstate.ts", domain: "os", symbols: ["Validator", "useStoredState", "refocus", "isString", "isNumber", "arrayOf", "isObjectWith", "useStoredFlag"] },
  { app: "devthink", file: "version.ts", domain: "os", symbols: ["packageversion", "protocolmajor", "protocolfloormajor"] },
  { app: "devthink", file: "views.ts", domain: "os", symbols: ["surfacepalette", "palettecommandsof", "palettequery", "paletteuseafter", "taskinputof", "taskhistoryafter", "onboardingsteps", "onboardingstart", "a11ylabellocalized", "a11ylabelof", "a11ylabelsfor", "a11ylabelslocalizedfor", "applycontrasttheme", "applytheme"] },
  { app: "devthink", file: "vite.config.ts", domain: "os", symbols: ["default"] },
  { app: "devthink", file: "vitest.config.ts", domain: "os", symbols: ["default"] },
  { app: "devthink", file: "wcag.ts", domain: "os", symbols: ["runwcagsuite", "wcagreport", "wcagrecord"] },
  { app: "devthink", file: "window.ts", domain: "os", symbols: ["WindowEntry", "WINDOW_ANCHORS", "FAMILY_SLUGS", "familyentries", "windowcatalog", "WindowSpawn", "windowspawn", "windowapp", "DESKTOP_TASKBAR", "SPAWN_TOP_OFFSET", "SpawnFit", "SpawnViewport", "spawnfit"] },
  { app: "devthink", file: "wingets.ts", domain: "os", symbols: ["Boot", "ChatBody", "ConsoleGraphview", "Saas", "ShellAvatar", "ShellBanner", "ShellChip", "ShellConn", "ShellDot", "ShellKbd", "ShellSegmented"] },
  { app: "devthink", file: "workflow.ts", domain: "os", symbols: ["workflowkinds", "stepexecution", "workflowstepof", "blockinvocationof", "workflowblockof", "steptemplateof", "expressionoperators", "expressionof", "addedge", "addnode", "applycooldown", "applyoverride", "applyretry"] },
  { app: "devthink", file: "workspace.ts", domain: "os", symbols: ["workspaceDestinations", "WorkspaceDestination", "isWorkspaceDestination", "workspaceDestination"] },
  { app: "forge", file: "api.ts", domain: "execution", symbols: ["routes"] },
  { app: "forge", file: "capacitor.config.ts", domain: "execution", symbols: ["default"] },
  { app: "forge", file: "cli.ts", domain: "execution", symbols: ["main"] },
  { app: "forge", file: "db.ts", domain: "execution", symbols: ["Runner", "RunEntry", "OnboardingStateRow", "LabelRow", "runners", "runnerRuns", "addRunner", "logRun", "getonboardingstate", "readAllLabels", "readLabel", "saveLabel", "seedLabelRows"] },
  { app: "forge", file: "drizzle.config.ts", domain: "execution", symbols: ["default"] },
  { app: "forge", file: "family.ts", domain: "execution", symbols: ["FAMILY_SLUGS", "FamilyMember", "FAMILY_ACCENTS", "familyAccentOf", "familyrow", "familyurl"] },
  { app: "forge", file: "fleet.ts", domain: "execution", symbols: ["RUNNER_MODES", "RunnerState", "RUNNER_STATES", "RunnerHealth", "HEALTH_LADDER", "Runner", "HealthRung", "RED_FAILURE_RATE", "AMBER_FAILURE_RATE", "AMBER_LOAD", "FleetSummary", "failureRate", "fleetSummary"] },
  { app: "forge", file: "graphplan.ts", domain: "execution", symbols: ["PLAN_STATES", "planstep", "runplan", "RUNPLAN", "planbounds", "plancopy", "plandepth", "planfailindex", "planfeeders", "plangraphof", "plannext", "planpositions", "planprogress"] },
  { app: "forge", file: "labels.ts", domain: "execution", symbols: ["LABEL_REVISION", "LABEL_MANIFEST", "LabelKey", "label", "labelfill", "seedLabels"] },
  { app: "forge", file: "onboardingstate.ts", domain: "execution", symbols: ["OnboardingSnapshot", "readOnboardingState", "loadOnboardingState", "markIntroSeen", "markOnboardingSeen"] },
  { app: "forge", file: "queue.ts", domain: "execution", symbols: ["QueuePriority", "QUEUE_PRIORITIES", "PRIORITY_RANK", "QueueItem", "queueOrder", "enqueue", "cancel", "dequeue", "depthByPriority", "nextUp", "positionOf", "queueDepth"] },
  { app: "forge", file: "routerbase.ts", domain: "execution", symbols: ["routerBase"] },
  { app: "forge", file: "runner.ts", domain: "execution", symbols: ["modes"] },
  { app: "forge", file: "runstream.ts", domain: "execution", symbols: ["LogLevel", "LogLine", "RunOutcome", "runLogLines", "logOutcome", "linesWithin", "logDuration", "formatLogTime", "LOG_SEED", "PRESET_SEEDS", "logCensus"] },
  { app: "forge", file: "sandboxmodality.ts", domain: "execution", symbols: ["APPSLUG", "WORKLOADLANES", "SANDBOXLANEENV", "lanesandbox", "lanesandboxfromenv", "laneof"] },
  { app: "forge", file: "theme.ts", domain: "execution", symbols: ["currentTheme", "applyTheme", "initTheme", "toggleTheme"] },
  { app: "forge", file: "vite.config.ts", domain: "execution", symbols: ["default"] },
  { app: "forge", file: "vitest.config.ts", domain: "execution", symbols: ["default"] },
  { app: "forge", file: "wingets.ts", domain: "execution", symbols: ["GraphPanel", "HomeEntrygate", "ShellBrandmark", "ShellEmptystate"] },
  { app: "foundry", file: "api.ts", domain: "pipeline", symbols: ["routes"] },
  { app: "foundry", file: "bundlescan.ts", domain: "pipeline", symbols: ["stripstrings", "platformnames", "wireformatnames", "gatewaywirefields", "maeneconfigfields", "underscorednames"] },
  { app: "foundry", file: "capacitor.config.ts", domain: "pipeline", symbols: ["default"] },
  { app: "foundry", file: "cli.ts", domain: "pipeline", symbols: ["main"] },
  { app: "foundry", file: "db.ts", domain: "pipeline", symbols: ["tables", "db", "ensureSchema", "OnboardingStateRow", "OnboardingFlags", "getOnboardingState", "setOnboardingStage", "LabelRow", "readAllLabels", "readLabel", "saveLabel"] },
  { app: "foundry", file: "drizzle.config.ts", domain: "pipeline", symbols: ["default"] },
  { app: "foundry", file: "family.ts", domain: "pipeline", symbols: ["FAMILY_SLUGS", "FamilyMember", "FAMILY_ACCENTS", "familyAccentOf", "familyrow"] },
  { app: "foundry", file: "familyurl.ts", domain: "pipeline", symbols: ["familyurl"] },
  { app: "foundry", file: "hometypes.ts", domain: "pipeline", symbols: ["HomeProps"] },
  { app: "foundry", file: "labels.ts", domain: "pipeline", symbols: ["LABEL_REVISION", "LABEL_MANIFEST", "LabelKey", "label", "labelfill", "seedLabels"] },
  { app: "foundry", file: "onboardingstate.ts", domain: "pipeline", symbols: ["OnboardingSnapshot", "readOnboardingState", "loadOnboardingState", "markIntroSeen", "markOnboardingSeen"] },
  { app: "foundry", file: "pipeline.ts", domain: "pipeline", symbols: ["utf8Bytes", "fnv1a", "Artifact", "sealArtifact", "manifest", "mulberry32", "planstate", "planstep", "runplan", "ImageFormat", "FORMATS", "convertPlan", "Sandbox"] },
  { app: "foundry", file: "readiness.ts", domain: "pipeline", symbols: ["readinessreport", "runreadinesssuite", "readinessrecord"] },
  { app: "foundry", file: "routerbase.ts", domain: "pipeline", symbols: ["routerBase"] },
  { app: "foundry", file: "vite.config.ts", domain: "pipeline", symbols: ["default"] },
  { app: "foundry", file: "vitest.config.ts", domain: "pipeline", symbols: ["default"] },
  { app: "foundry", file: "wingets.ts", domain: "pipeline", symbols: ["GraphPanel", "HomeEntrygate", "ShellBrandmark", "ShellEmptystate"] },
  { app: "getry", file: "accounts.ts", domain: "ai", symbols: ["GEMINI_CLI_CLIENT_ID_RAW", "ANTIGRAVITY_CLI_OAUTH_CLIENT_ID", "ANTIGRAVITY_CLI_OAUTH_CLIENT_SECRET", "OAuthClientConfig", "OAuthClientKey", "AccountMetadataV3", "AccountStore", "RotationStrategy", "ACCOUNTS_FILE_PATH", "ACCOUNTS_INFO", "Account", "AccountManager", "AccountManagerOptions"] },
  { app: "getry", file: "antigravity.ts", domain: "ai", symbols: ["PluginOptions", "PLUGIN_ID", "VERSION", "notifyUser", "AntigravityPlugin", "getPlugin", "plugin", "detectOpencodeProviderId", "ALL_MODELS_2026", "ANTIGRAVITY_VERSION_FALLBACK", "ANTIGRAVITY_VERSION_MIN", "CODE_ASSIST_ENDPOINTS", "CONTENT_TIMEOUT_MS"] },
  { app: "getry", file: "auth.ts", domain: "ai", symbols: ["extracttoken", "extractchatid", "extractsessionid", "extractrequestid", "validatetoken", "masktoken", "resolvekeys", "buildauthheaders", "appendqueryparams", "buildauthqueryparams", "getkey"] },
  { app: "getry", file: "binddraw.ts", domain: "ai", symbols: ["drawgatewayhost", "drawgatewayport", "gatewaybind", "gatewayhostband", "gatewayportband", "resolvegatewaybind"] },
  { app: "getry", file: "capacitor.config.ts", domain: "ai", symbols: ["default"] },
  { app: "getry", file: "cli.ts", domain: "ai", symbols: ["runclifamily", "default"] },
  { app: "getry", file: "constants.ts", domain: "ai", symbols: ["ANTIGRAVITY_VERSION_FALLBACK", "ANTIGRAVITY_VERSION_MIN_SUPPORTED", "ANTIGRAVITY_BLOCKED_VERSIONS", "ANTIGRAVITY_VERSION_REMOTE_URLS", "VERSION_FETCH_TIMEOUT_MS", "ANTIGRAVITY_USER_AGENT_FALLBACK", "ANTIGRAVITY_USER_AGENT", "ACCOUNTS_CONFIG_DIR", "ACCOUNTS_FILE_MODE", "ACCOUNTS_FILE_NAME", "ANTIGRAVITY_CLIENT_ID", "ANTIGRAVITY_CLIENT_ID_FALLBACK_SECONDARY", "ANTIGRAVITY_CLIENT_ID_IS_BLINDED"] },
  { app: "getry", file: "db.ts", domain: "ai", symbols: ["ChatMessageRow", "ApiKeyRow", "TownKeyRow", "maskkey", "KEYSEED", "MESSAGESEED", "listkeys", "listmessages", "LabelRow", "OnboardingFlags", "getonboardingstate", "keyrotationpick", "listversionrows"] },
  { app: "getry", file: "debonairlane.ts", domain: "ai", symbols: ["DebonairMountVerdict", "DEBONAIR_APP", "DebonairGatewayRequest", "DebonairBlobPointer", "DebonairBlobStream", "DebonairGatewayAnswer", "DebonairDispatch", "debonairrequest", "DEBONAIR_URL_ENV", "debonaircandidate", "debonairforward", "debonairorigin", "debonairresponse"] },
  { app: "getry", file: "drizzle.config.ts", domain: "ai", symbols: ["default"] },
  { app: "getry", file: "engine.ts", domain: "ai", symbols: ["createversion", "engineinternals"] },
  { app: "getry", file: "family.ts", domain: "ai", symbols: ["FAMILY_SLUGS", "FamilyMember", "FAMILY_ACCENTS", "familyrow"] },
  { app: "getry", file: "familyurl.ts", domain: "ai", symbols: ["familyurl"] },
  { app: "getry", file: "fingerprint.ts", domain: "ai", symbols: ["PlatformOS", "PlatformArch", "FingerprintType", "HeaderStyle", "OsName", "ArchName", "PlatformProfile", "PlatformPool", "ANTIGRAVITY_CLI_VERSION_POOL", "ANTIGRAVITY_VERSION_FALLBACK", "ANTIGRAVITY_VERSION_POOL", "AntigravityHeaderOptions", "AntigravityHeadersOptions"] },
  { app: "getry", file: "gateway.ts", domain: "ai", symbols: ["GATEWAYROUTES", "GatewayRoute", "GatewayBadge", "GatewayVersion", "GATEWAYVERSIONS", "PARSERSTEPS", "listversions", "findversion", "gatewayConfig", "gatewayViewConfig", "liveversions", "thinkingchain"] },
  { app: "getry", file: "gatewaycheck.ts", domain: "ai", symbols: ["gatewaysmokeseat", "gatewayprobeseat"] },
  { app: "getry", file: "honoshim.ts", domain: "ai", symbols: ["serve", "serveStatic", "default"] },
  { app: "getry", file: "intelligence.ts", domain: "ai", symbols: ["provenancechunkinput", "provenanceinput", "provenancerecord", "provenance", "mergeprovenance", "estimatetokens", "fitscontext", "tokenbudget", "chunkmarkdown", "llmsfull", "llmstxt", "metricstore", "ragmanifest"] },
  { app: "getry", file: "json.ts", domain: "ai", symbols: ["extractjsonobject", "VerdictObject", "validateverdict", "decisionerrorcode", "decisionerror", "DecisionKind", "DecisionPolicy", "DecisionRequest", "BandThresholds", "CompiledSchema", "Completer", "ConfidenceBand", "DecisionMode"] },
  { app: "getry", file: "labels.ts", domain: "ai", symbols: ["LABEL_REVISION", "LABEL_MANIFEST", "LabelKey", "label", "labelfill", "seedLabels"] },
  { app: "getry", file: "llm.ts", domain: "ai", symbols: ["defaultrefusalmarkers", "shapedrequest", "modelusage", "buildrequest", "parsecompletion", "islocalorigin", "callmodel", "calllocal", "adapterof", "addusage", "anthropicgatewayadapter", "budgetcheck", "bumprevision"] },
  { app: "getry", file: "models.ts", domain: "ai", symbols: ["GEMINI_36_MODELS", "GEMINI_36_MODEL_DEFINITIONS", "GEMINI_35_MODELS", "GEMINI_35_MODEL_DEFINITIONS", "GEMINI_31_MODELS", "GEMINI_31_MODEL_DEFINITIONS", "GEMINI_3_MODELS", "GEMINI_3_MODEL_DEFINITIONS", "ALL_MODELS_2026", "ALL_MODELS_WITH_PREFIX", "ANTIGRAVITY_MODELS", "ANTIGRAVITY_MODELS_2026", "ANTIGRAVITY_MODELS_2026_08"] },
  { app: "getry", file: "nodeshim.ts", domain: "ai", symbols: ["EOL", "arch", "platform", "release", "type", "hostname", "homedir", "tmpdir", "access", "appendFile", "appendFileSync", "basename", "chmodSync"] },
  { app: "getry", file: "oauth.ts", domain: "ai", symbols: ["CLIENT_ID", "CLIENT_SECRET", "ANTIGRAVITY_CLI_CLIENT_ID", "ANTIGRAVITY_CLI_CLIENT_SECRET", "ANTIGRAVITY_CLI_CLIENT_SECRET_ALTERNATIVE", "ANTIGRAVITY_CLI_OAUTH_SCOPES", "ANTIGRAVITY_CLI_OAUTH_SCOPES_STR", "ANTIGRAVITY_CLI_AUTH_SUCCESS_URL", "ANTIGRAVITY_CLI_GRPC_VERSION", "ANTIGRAVITY_CLI_REDIRECT_OFFICIAL", "ANTIGRAVITY_CLI_VERSION_LATEST", "AuthOptions", "CLIENT_SECRET_ALTERNATIVE"] },
  { app: "getry", file: "onboardingstate.ts", domain: "ai", symbols: ["VisitorOnboarding", "OnboardingStage", "hostallowed", "mergeStage", "readOnboardingState", "loadOnboardingState", "markIntroSeen", "markOnboardingSeen"] },
  { app: "getry", file: "prismaconfig.ts", domain: "ai", symbols: ["default"] },
  { app: "getry", file: "prismashim.ts", domain: "ai", symbols: ["PrismaClient", "default"] },
  { app: "getry", file: "project.ts", domain: "ai", symbols: ["GOOGLE_API_NODE_VERSION", "ENDPOINT_BASES", "EndpointName", "EndpointDef", "CODE_ASSIST_PATHS", "IdeType", "CodeAssistMetadata", "LoadCodeAssistResponse", "ANTIGRAVITY_USER_AGENT_FALLBACK", "ANTIGRAVITY_VERSION_FALLBACK", "AccountMetadataSaver", "AvailableModel", "CODE_ASSIST_ENDPOINTS"] },
  { app: "getry", file: "providers.ts", domain: "ai", symbols: ["ProviderProtocol", "retryDelay", "redactProviderError", "ChatRole", "ChatMessage", "ChatRequest", "ModelInfo", "PROVIDERS", "ALL_MODELS_2026", "ANSI", "ANTIGRAVITY_CLI_BYPASS", "C", "CLI_VERSION"] },
  { app: "getry", file: "quota.ts", domain: "ai", symbols: ["QUOTA_ENDPOINTS", "QuotaSource", "GEMINI_CLI_USER_AGENT_ANTIGRAVITY", "CLIENT_METADATA_ANTIGRAVITY", "QUOTA_REFRESH_INTERVAL_MINUTES_DEFAULT", "QUOTA_REFRESH_INTERVAL_MS_DEFAULT", "QUOTA_SOFT_REMAINING", "ANTIGRAVITY_CLIENT_ID_IS_BLINDED", "ANTIGRAVITY_CLIENT_SECRET_IS_BLINDED", "ANTIGRAVITY_ENDPOINT_FALLBACKS", "ANTIGRAVITY_USER_AGENT_FALLBACK", "ANTIGRAVITY_VERSION_FALLBACK", "ANTIGRAVITY_VERSION_MIN"] },
  { app: "getry", file: "recovery.ts", domain: "ai", symbols: ["X_CLIENT_METADATA_RAW", "Role", "ThinkingBlock", "TextBlock", "ToolUseBlock", "ToolResultBlock", "ContentBlock", "ChatMessage", "AutoRecoveryExhaustedError", "AutoRecoveryOptions", "BuildPlanOptions", "ChatMessages", "DETECTOR_PATTERNS"] },
  { app: "getry", file: "request.ts", domain: "ai", symbols: ["TOOL_NAME_MAX_LENGTH", "TOOL_NAME_MIN_LENGTH", "THINKING_LEVEL_TO_BUDGET_GEMINI", "THINKING_LEVEL_TO_BUDGET_CLAUDE", "THINKING_BUDGET_MAX", "THINKING_BUDGET_MIN", "OpenCodeTool", "TransformRequestInput", "ALLOWED_SCHEMA_KEYS", "ALLOWED_TOOL_TOP_KEYS", "API_PATHS", "API_PATHS_DAILY", "AUTOPUSH_ENDPOINT"] },
  { app: "getry", file: "reveal.ts", domain: "ai", symbols: ["observeReveals"] },
  { app: "getry", file: "routerbase.ts", domain: "ai", symbols: ["routerBase"] },
  { app: "getry", file: "routerotation.ts", domain: "ai", symbols: ["ModelRoute", "CooldownEntry", "RotationLedger", "RotationOptions", "ROTATIONDEFAULTS", "newledger", "healthyroutes", "pickroute", "notefailure", "notesuccess", "pickroundrobin", "remainingcooldown", "rotatepool"] },
  { app: "getry", file: "sandboxmodality.ts", domain: "ai", symbols: ["APPSLUG", "WORKLOADLANES", "SANDBOXLANEENV", "lanesandbox", "lanesandboxfromenv", "laneof"] },
  { app: "getry", file: "search.ts", domain: "ai", symbols: ["DEFAULT_ENDPOINT_ORDER", "SEARCH_TIMEOUT_MS", "WebGroundingChunk", "GroundingChunkWeb", "GroundingChunk", "GroundingSupportSegment", "GroundingSupport", "SearchEntryPoint", "ANTIGRAVITY_USER_AGENT_FALLBACK", "ANTIGRAVITY_VERSION_FALLBACK", "CODE_ASSIST_ENDPOINTS", "DEFAULT_TIMEOUT_MS", "ExecuteSearchAuth"] },
  { app: "getry", file: "server.ts", domain: "ai", symbols: ["kams", "kasuppressms", "sseheaders", "ndjsonheaders", "writeevent", "writekeepalive", "writedone", "safeenqueue", "createserver", "discardheartbeat", "extractdata", "getversion", "isdone"] },
  { app: "getry", file: "sessions.ts", domain: "ai", symbols: ["SessionContextRow", "SESSIONSEED", "ROTATIONEVERY", "listsessions", "rotationindex", "freshestfirst"] },
  { app: "getry", file: "streaming.ts", domain: "ai", symbols: ["SSE_DONE_SENTINEL", "hashThinkingText", "sleepWithJitter", "ReplaySignatureCache", "globalThinkingSignatureCache", "ParsedSSEEvent", "SSEParserState", "createSSEParserState", "AnthropicChunkOptions", "AnthropicSSEEvent", "BACKOFF_BASE_MS", "BACKOFF_FACTOR", "BACKOFF_MAX_MS"] },
  { app: "getry", file: "theme.ts", domain: "ai", symbols: ["currentTheme", "applyTheme", "toggleTheme"] },
  { app: "getry", file: "thinking.ts", domain: "ai", symbols: ["ThinkingLevelName", "ThinkingLevel", "DEFAULTTHINKINGLEVEL", "THINKINGLEVELS", "listlevels", "budgetof", "islevel", "formatbudget", "TWOCALLSTHRESHOLD", "clampbudget", "defaultthinkinglevel", "fallbackchain", "lanesof"] },
  { app: "getry", file: "types.ts", domain: "ai", symbols: ["apikeyref", "protocolstyle", "modelmessage", "providerconfig", "modelroute", "localmodelconfig", "toolbrief", "intentkind", "authconfig", "baseurlconfig", "bodybuildconfig", "commandentity", "commandparse"] },
  { app: "getry", file: "utils.ts", domain: "ai", symbols: ["corsheaders", "ctjson", "ctsse", "ctplain", "ctndjson", "ctoctet", "maxdurationconst", "defaultmaxtokens", "autofrequencypenalty", "automaxtokens", "auton", "autopresencepenalty", "autoseed"] },
  { app: "getry", file: "validate.ts", domain: "ai", symbols: ["validateconfig"] },
  { app: "getry", file: "versionregistry.ts", domain: "ai", symbols: ["REMOTE_MANIFEST_URLS", "CHANGELOG_URLS", "FALLBACK_VERSION", "FALLBACK_FULL_VERSION", "FALLBACK_ALTERNATIVE_VERSION", "FALLBACK_ALTERNATIVE_FULL", "VERSION_CACHE_TTL_MS", "ANTIGRAVITY_AUTH_CONSTANTS", "ANTIGRAVITY_BLOCKED_VERSIONS", "ANTIGRAVITY_VERSION_FALLBACK", "ANTIGRAVITY_VERSION_MIN_SUPPORTED", "ANTIGRAVITY_VERSION_REMOTE_URLS", "AntigravityVersionInfo"] },
  { app: "getry", file: "vite.config.ts", domain: "ai", symbols: ["default"] },
  { app: "getry", file: "vitest.config.ts", domain: "ai", symbols: ["default"] },
  { app: "getry", file: "wingets.ts", domain: "ai", symbols: ["HomeEntrygate", "ShellBrandmark", "ShellEmptystate"] },
  { app: "saddle", file: "alternatives.ts", domain: "vm", symbols: ["SandboxSpec", "SandboxHandle", "ExecResult", "SnapshotRef", "SandboxMetrics", "SandboxCapabilities", "SandboxEngine", "SandboxEngineError", "AppleContainersEngine", "CloudHypervisorEngine", "ComparisonRow", "DaytonaEngine", "E2bFamilyEngine"] },
  { app: "saddle", file: "api.ts", domain: "vm", symbols: ["ApiErrorBody", "HealthStatus", "SandboxSpecPayload", "SandboxCreated", "ExecResult", "ApiSession", "apibase", "iscrossorigin", "EdgeLane", "ModalityPlan", "ModalityRecord", "apierrormessage", "apifetch"] },
  { app: "saddle", file: "auth.ts", domain: "vm", symbols: ["SessionContext", "SessionMaterial", "ForwardedSession", "SessionUser", "ValidationOk", "ValidationError", "ValidationOutcome", "RateBucket", "AuthedRequest", "RateVerdict", "RateWindow", "adminusernames", "bootstraprole"] },
  { app: "saddle", file: "browser.ts", domain: "vm", symbols: ["fingerprintprofile", "fingerprintvalidate", "fingerprintfor", "browsersession", "browseractions", "actionresult", "actionfailure", "actionbatch", "actionrecorder", "assertfreshsnapshot", "browseragent", "browsercontext", "createplaywrightsession"] },
  { app: "saddle", file: "capacitor.config.ts", domain: "vm", symbols: ["default"] },
  { app: "saddle", file: "catalog.ts", domain: "vm", symbols: ["MediaSlot", "AgentSessionEvent", "AgentSession", "mediaSlots", "agentsessions"] },
  { app: "saddle", file: "cli.ts", domain: "vm", symbols: ["main"] },
  { app: "saddle", file: "communication.ts", domain: "vm", symbols: ["controlresources", "controloperations", "controlsurface", "authorize", "apiversion", "requestcontext", "successpayload", "errorpayload", "assertpublicurl", "assertredirectchain", "assertresolvedpublicurl", "blockstream", "controlservice"] },
  { app: "saddle", file: "compute.ts", domain: "vm", symbols: ["wittype", "witparam", "witfunction", "witinterface", "witworld", "wittotypescript", "witworldhash", "wasicall", "adapterplan", "aimigrationpredictor", "asserterrorvalue", "backlogCount", "bittorrentv2blockbytes"] },
  { app: "saddle", file: "containerarch.ts", domain: "vm", symbols: ["CONTAINERARCHIDS", "containerarchfamily", "containerarchrow", "CONTAINERBASEIMAGE", "CONTAINERARCHES", "getcontainerarch", "containerarcherror", "resolvecontainerarch", "CONTAINERBUILDARCHES", "CONTAINERBUILDARCHIDS", "OSDISTRIBUTIONCOUNT", "OSDISTRIBUTIONIDS", "OSDISTRIBUTIONPLANLAW"] },
  { app: "saddle", file: "dashboardlib.ts", domain: "vm", symbols: ["ApiResult", "LocalSandbox", "SessionUser", "localsandboxkey", "apiresult", "errormessage", "pick", "asarray", "chipclass", "fallbackcpus", "fallbackgpus", "fmtdate", "fmtuptime"] },
  { app: "saddle", file: "db.ts", domain: "vm", symbols: ["UserRow", "SessionRow", "NodeRow", "SandboxRow", "SandboxFileRow", "SandboxFileDoc", "WorkspaceUsage", "EventRow", "AuditFields", "AuditRow", "DbError", "EventFields", "LabelRow"] },
  { app: "saddle", file: "distribution.ts", domain: "vm", symbols: ["binarytargets", "portablebinaryplan", "binarymanifest", "buildbinary", "archivelimits", "archiveinspection", "extractarchive", "magicbytes", "artifactformats", "artifactname", "binaryplan", "cachedecision", "cacheeligibility"] },
  { app: "saddle", file: "drizzle.config.ts", domain: "vm", symbols: ["drizzleconfig", "default"] },
  { app: "saddle", file: "edgelandes.ts", domain: "vm", symbols: ["EdgeLaneArtifact", "EdgeLaneOutput", "EdgeLaneExecutor", "EdgeLaneError", "edgelaneerror", "probehostbinary", "probedocker", "probewasm", "BaseLaneSpec", "HeavyweightLaneSpec", "HostLaneSpec", "InprocLaneSpec", "NetLaneSpec"] },
  { app: "saddle", file: "edgeplane.ts", domain: "vm", symbols: ["EdgeRequest", "EdgeLaneReport", "EdgeRunResult", "EdgeStorageAdapter", "edgelanes", "edgelandesreport", "assertvisitorfree"] },
  { app: "saddle", file: "engineplans.ts", domain: "vm", symbols: ["EngineProfileId", "EnginePlanProfile", "ENGINEPLANS", "DEFAULTENGINEPROFILE", "EngineLimitsLaw", "ENGINELIMITS", "PlanEnvelope", "planenvelope", "planfits", "getengineplan", "selectengineplan", "engineplansreport"] },
  { app: "saddle", file: "execution.ts", domain: "vm", symbols: ["inprocess", "runnerhealth", "runnerhealthall", "heartbeat", "providerchain", "selectprovider", "artifacthandoff", "cancellationplan", "circuitbreaker", "corecapabilities", "deadline", "engine", "filesessions"] },
  { app: "saddle", file: "family.ts", domain: "vm", symbols: ["FAMILY_SLUGS", "FamilyMember", "FAMILY_ACCENTS", "familyrow"] },
  { app: "saddle", file: "familyurl.ts", domain: "vm", symbols: ["familyurl"] },
  { app: "saddle", file: "format.ts", domain: "vm", symbols: ["formatissues", "runformatcheck"] },
  { app: "saddle", file: "foundation.ts", domain: "vm", symbols: ["errorcodes", "saddleerror", "validationerror", "artifactnotfound", "runnerunavailable", "aserror", "errorcatalog", "operationerror", "artifactmanifest", "classifyerror", "constanttimeequal", "createjob", "eventbus"] },
  { app: "saddle", file: "index.ts", domain: "vm", symbols: ["engineversions", "engineversionkey", "enginelimits", "engineruntime", "enginestate", "enginespec", "engineendpoint", "FREEPOOL", "InternalMemory", "LATENCYLADDER", "MetricsStore", "TIERS", "VirtualEngine"] },
  { app: "saddle", file: "integration.ts", domain: "vm", symbols: ["transport", "socketadapter", "githubadapter", "gitlabadapter", "forgeadapter", "forgejoadapter", "giteaadapter", "codebergadapter", "appregistry", "appstatuses", "browsertools", "huggingfaceadapter", "mcpserver"] },
  { app: "saddle", file: "isolation.ts", domain: "vm", symbols: ["executionrequest", "executiondecision", "executionhandoff", "internalenvelope", "internalapi"] },
  { app: "saddle", file: "labels.ts", domain: "vm", symbols: ["LABEL_REVISION", "labelmanifest", "LabelKey", "label", "labelfill", "seedlabels"] },
  { app: "saddle", file: "localauth.ts", domain: "vm", symbols: ["LocalAccountRole", "LocalAccountRecord", "LocalSession", "AccountsBackupPayload", "adminusers", "localaccountnames", "exportaccounts", "importaccounts", "available", "login", "logout", "probe", "register"] },
  { app: "saddle", file: "mesh.ts", domain: "vm", symbols: ["NodeRole", "MeshVerdict", "MeshEnvelope", "MeshMessage", "MainResponse", "HeartbeatSelf", "role", "meshsecret", "bodyhash", "decrypt", "encrypt", "forwardauth", "mainurl"] },
  { app: "saddle", file: "modalities.ts", domain: "vm", symbols: ["ModalityLane", "ModalityBootClass", "ResourceEnvelope", "CgroupSlice", "SpawnPlan", "ModalitySpec", "BOOTLADDER", "MODALITYPLANCOUNT", "visitorguard", "cgroupslice", "interpretyaml", "runinisolatedcontext", "MODALITYCOUNT"] },
  { app: "saddle", file: "modalityregistry.ts", domain: "vm", symbols: ["BootClass", "ModalityFamily", "ModalityState", "ModalityRecord", "BOOTLADDER", "MODALITYPLANCOUNT", "MODALITIES", "MODALITY_COUNT", "BaseProfile", "JoinRequest", "MODALITYCOUNT", "ModalityPlanReport", "getmodality"] },
  { app: "saddle", file: "modes.ts", domain: "vm", symbols: ["modeprofile", "librarymode", "climode", "binarymode", "browsermode", "headlessmode", "computemode", "modeaxes", "RunnerMode", "capabilityreport", "modecapabilities", "modecatalog", "operationmodes"] },
  { app: "saddle", file: "onboardingstate.ts", domain: "vm", symbols: ["VisitorOnboarding", "OnboardingStage", "hostallowed", "mergeStage", "readOnboardingState", "loadOnboardingState", "markIntroSeen", "markOnboardingSeen"] },
  { app: "saddle", file: "orchestrator.ts", domain: "vm", symbols: ["orchestratordemo", "fluxkustomization", "fluxgitopsplan", "planfluxgitops", "allocport", "cantransition", "clhruntime", "composeyaml", "createvmid", "cricheckpointer", "dockerruntime", "fcrequest", "firecrackerruntime"] },
  { app: "saddle", file: "osprofiles.ts", domain: "vm", symbols: ["OSProfileKind", "OSProfilePackage", "OSProfileRecord", "OSPROFILES", "OSPROFILECOUNT", "getosprofile", "osprofilesforarch", "osprofileswithgpu"] },
  { app: "saddle", file: "paths.ts", domain: "vm", symbols: ["assetpath"] },
  { app: "saddle", file: "performance.ts", domain: "vm", symbols: ["LayerTarget", "LayerPatch", "PerformanceLayerId", "PerformanceLayer", "randomPort", "ompPresets", "pickOmpThreads", "llvmpipeThreads", "BenchmarkHarness", "BenchmarkResult", "BuildLayer", "CpuLayer", "FirecrackerWarmPool"] },
  { app: "saddle", file: "quantum.ts", domain: "vm", symbols: ["quantumversions", "quantumerror", "gate2x2", "hmatrix", "xmatrix", "ymatrix", "zmatrix", "smatrix", "alice", "anuqrng", "bb84basis", "bb84channel", "bb84result"] },
  { app: "saddle", file: "render.ts", domain: "vm", symbols: ["renderdemo", "advisethreads", "cpucapsdomain", "defaultgeometry", "defaultgpuregistry", "gpuprofilebuilder", "gpuregistry", "gpuspoofdata", "lavapipe", "llvmpipe", "mesaenvbuilder", "mesastack", "pciid"] },
  { app: "saddle", file: "routerbase.ts", domain: "vm", symbols: ["routerBase"] },
  { app: "saddle", file: "sandbox.ts", domain: "vm", symbols: ["CpuSpec", "GpuSpec", "MigProfile", "SandboxSpec", "CpuTopology", "SandboxFile", "SandboxFs", "SandboxState", "DispatchContext", "DispatchResult", "SANDBOXARCHES", "SANDBOXBASES", "SANDBOXFORMS"] },
  { app: "saddle", file: "scheduler.ts", domain: "vm", symbols: ["shardplan", "plantypecheckshards", "sharedmemorycache", "projectgraph", "miglayoutplan", "planmiglayout", "vcpuhotplug", "ramhotplug", "admissionrequest", "aipsched", "anomalydetector", "anomalyrecord", "autoscalearm"] },
  { app: "saddle", file: "scripts.ts", domain: "vm", symbols: ["ScriptStep", "ScriptPlan", "ScriptRunOptions", "ScriptStepResult", "ScriptRunResult", "ScriptRunRecord", "assertservercontext", "interpretsh", "SCRIPTLANES_NODE_BASE", "compilewithbabel", "dockerdescriptor", "interpretyaml", "interpretyml"] },
  { app: "saddle", file: "security.ts", domain: "vm", symbols: ["pqtmechanism", "rfc10024mechanisms", "rfc10024negotiator", "pqcauditentry", "pqcaudittrail", "noinfer", "policydefault", "policypreset", "cgroupbuilder", "cgroupv2layout", "chachaopen", "chachaseal", "criurelabel"] },
  { app: "saddle", file: "seedcatalog.ts", domain: "vm", symbols: ["seedMediaSlots", "seedAgentSessions"] },
  { app: "saddle", file: "server.ts", domain: "vm", symbols: ["nodeserver"] },
  { app: "saddle", file: "tiers.ts", domain: "vm", symbols: ["tierserror", "vramtierid", "vramtier", "TIERS", "selecttier", "latencylevel", "LATENCYLADDER", "latencyfor", "FREEPOOL", "FREEPOOLSOURCE", "MAGICBYTES", "MAXVDRADDRESS", "MMAPCONSTANTS"] },
  { app: "saddle", file: "utils.ts", domain: "vm", symbols: ["cn"] },
  { app: "saddle", file: "vaulthandoff.ts", domain: "vm", symbols: ["VaultArtifact", "VaultPut", "VaultManifest", "VaultReceipt", "VaultCounts", "FaunVerdict", "VaultSink", "VaultError", "assertvisitorstorefree", "faunblock", "faunblockroutes"] },
  { app: "saddle", file: "virtual.ts", domain: "vm", symbols: ["memoryobject", "computeresult", "tobytes", "transformtocompute", "transformtostorage", "internalmemory", "externalmemory", "physicalmemory", "ARROWLAKEFLAGS", "BEST_VIRTUAL_PROCESSORS", "GPUSTATICSPECS", "GPU_BANK", "MEMORY_TIERS"] },
  { app: "saddle", file: "vite.config.ts", domain: "vm", symbols: ["default"] },
  { app: "saddle", file: "vitest.config.ts", domain: "vm", symbols: ["default"] },
  { app: "saddle", file: "vmcore.ts", domain: "vm", symbols: ["Rv64RunResult", "executerv64", "rv64run"] },
  { app: "saddle", file: "webserver.ts", domain: "vm", symbols: ["SandboxCreateBody", "SandboxSpecView", "SandboxRecord", "SandboxPublicView", "SandboxShelfRow", "createsandbox", "handleapi", "sandboxes"] },
  { app: "saddle", file: "wingets.ts", domain: "vm", symbols: ["AccountPanel", "AdminPanel", "ApiBadge", "AuditLog", "ComputeBootladder", "ComputeModalitycatalog", "ConsoleEdgelaw", "CreateSandboxForm", "DashboardEventstimeline", "EventsTimeline", "GlobalSandboxesTable", "HomeEntrygate", "LoginForm"] },
  { app: "saddle", file: "workloadlaw.ts", domain: "vm", symbols: ["WorkloadDemand", "LaneToday", "WorkloadLane", "LaneVerdict", "LaneJoin", "FAMILYLANES", "CATALOGAPPS", "lanesof", "AppWorkloadLane", "AppWorkloadReport", "FamilyWorkloadReport", "LaneSeatResult", "LaneSeating"] },
  { app: "stealthhead", file: "capacitor.config.ts", domain: "game", symbols: ["default"] },
  { app: "stealthhead", file: "cli.ts", domain: "game", symbols: ["main"] },
  { app: "stealthhead", file: "db.ts", domain: "game", symbols: ["getlobby", "getlobbyplayers", "getranking", "getweapons", "getworldassets", "LabelRow", "readalllabels", "readlabel", "savelabel", "seedlabelrows"] },
  { app: "stealthhead", file: "drizzle.config.ts", domain: "game", symbols: ["default"] },
  { app: "stealthhead", file: "family.ts", domain: "game", symbols: ["FAMILY_SLUGS", "FamilyMember", "FAMILY_ACCENTS", "familyrow"] },
  { app: "stealthhead", file: "familyurl.ts", domain: "game", symbols: ["familyurl"] },
  { app: "stealthhead", file: "hud.ts", domain: "game", symbols: ["Vitals", "VitalTier", "DamageReport", "MinimapBounds", "MinimapConfig", "MinimapPoint", "HitmarkerKind", "Hitmarker", "DAMAGESTRENGTHFLOOR", "DamagePing", "DamageSector", "HITWINDOWS", "KILLFEEDCAP"] },
  { app: "stealthhead", file: "labels.ts", domain: "game", symbols: ["LABELREVISION", "LABELMANIFEST", "LabelKey", "label", "labelfill", "seedlabels"] },
  { app: "stealthhead", file: "match.ts", domain: "game", symbols: ["MatchRound", "MatchPlayer", "MatchLobby", "MATCHSEED", "MATCHPLAYERSEED", "listmatches", "listmatchplayers", "orderlobbies", "AdvanceOptions", "LOBBYTRANSITIONS", "LobbyState", "MatchAction", "MatchEvent"] },
  { app: "stealthhead", file: "netcode.ts", domain: "game", symbols: ["EntityState", "Snapshot", "SnapshotDelta", "InputCmd", "Reconciliation", "JitterPacket", "JitterBuffer", "RewindBuffer", "CMDSPEED", "DEFAULTINTERPDELAY", "RECONCILETHRESHOLD", "REWINDCAP", "applydelta"] },
  { app: "stealthhead", file: "physics.ts", domain: "game", symbols: ["Vec3", "Aabb", "Sphere", "Body", "Projectile", "PhysWorld", "ProjectileStep", "Accumulator", "DEFAULTGRAVITY", "aabb", "aabbcenter", "add", "applydrag"] },
  { app: "stealthhead", file: "ranking.ts", domain: "game", symbols: ["RankingEntry", "RANKINGSEED", "listranking", "sortentries", "assignpositions", "filterbyseason", "winrate", "podium", "DuelResult", "KBand", "LadderOptions", "LadderOutcome", "LadderSide"] },
  { app: "stealthhead", file: "reveal.ts", domain: "game", symbols: ["observeReveals"] },
  { app: "stealthhead", file: "sandboxmodality.ts", domain: "game", symbols: ["APPSLUG", "WORKLOADLANES", "SANDBOXLANEENV", "lanesandbox", "lanesandboxfromenv", "laneof"] },
  { app: "stealthhead", file: "spawner.ts", domain: "game", symbols: ["SpawnVec3", "SpawnTeam", "SpawnPoint", "DeathMark", "SpawnQuery", "SpawnPick", "SpawnerConfig", "WavePlan", "DEFAULTSPAWNCONFIG", "SPAWNSEED", "WaveConfig", "buildwave", "campscore"] },
  { app: "stealthhead", file: "theme.ts", domain: "game", symbols: ["currentTheme", "applyTheme", "toggleTheme"] },
  { app: "stealthhead", file: "vite.config.ts", domain: "game", symbols: ["default"] },
  { app: "stealthhead", file: "vitest.config.ts", domain: "game", symbols: ["default"] },
  { app: "stealthhead", file: "weapons.ts", domain: "game", symbols: ["WeaponKind", "Weapon", "WEAPONCATALOG", "listweapons", "dps", "kinds", "filterbykind", "handling", "BalanceBounds", "BalanceViolation", "FalloffSpec", "TtkOptions", "TtkResult"] },
  { app: "stealthhead", file: "wingets.ts", domain: "game", symbols: ["Constructionface", "HomeScope", "ShellBrandmark"] },
  { app: "stealthhead", file: "world.ts", domain: "game", symbols: ["WorldAssetKind", "WorldAsset", "RenderIntent", "RENDERINTENT", "WORLDCATALOG", "ishashshape", "normalizepath", "glbpath", "catalogasset", "filterbykind", "humansize", "listworldassets"] },
  { app: "vault", file: "account.ts", domain: "storage", symbols: ["PASSWORD_MIN_CHARS", "emailValid", "passwordValid", "hashPassword", "passwordMatches", "AccountLaneError", "AccountRow", "createAccount", "verifyCredentials", "issueSession", "verifySession", "vaultTokenConfigured", "createVaultServer"] },
  { app: "vault", file: "buckets.ts", domain: "storage", symbols: ["BucketRule", "BucketShelf", "seedRules", "ruleFor", "objectsOf", "bucketShelf", "shelfOf", "bucketsInUse", "retentionLabel"] },
  { app: "vault", file: "capacitor.config.ts", domain: "storage", symbols: ["default"] },
  { app: "vault", file: "chunks.ts", domain: "storage", symbols: ["CHUNK_BYTES", "ChunkSlice", "split", "reassemble", "ChunkEncoding", "StoredChunk", "encodeChunk", "decodeChunk", "ChunkManifestEntry", "ObjectManifest", "StorageTier", "VaultChannel", "chunkIntact"] },
  { app: "vault", file: "cli.ts", domain: "storage", symbols: ["main"] },
  { app: "vault", file: "db.ts", domain: "storage", symbols: ["tables", "db", "ensureSchema", "OnboardingStateRow", "OnboardingFlags", "getOnboardingState", "setOnboardingStage", "LabelRow", "VisitorStateRow", "getVisitorState", "putVisitorState", "readAllLabels", "readLabel"] },
  { app: "vault", file: "decoy.ts", domain: "storage", symbols: ["decoyledger", "isprobe", "encrypteddecoy"] },
  { app: "vault", file: "drizzle.config.ts", domain: "storage", symbols: ["default"] },
  { app: "vault", file: "drizzle.ts", domain: "storage", symbols: ["accounts", "projects", "storageObjects", "chunks", "chunkRefs", "quotas", "projectKeys", "storageTables", "StorageDatabase", "StorageDriverError", "StorageExecutor", "closeStorage", "ensureStorageSchema"] },
  { app: "vault", file: "family.ts", domain: "storage", symbols: ["FAMILY_SLUGS", "FamilyMember", "FAMILY_ACCENTS", "familyAccentOf", "familyrow", "familyurl"] },
  { app: "vault", file: "imagestore.ts", domain: "storage", symbols: ["SniffedMime", "ImageDensity", "ImageDimensions", "ImageRefusal", "ImageFacts", "IMAGE_MAX_BYTES", "sniffImageMime", "pngDimensions", "jpegDimensions", "validateImage", "standardizeImage", "putImage", "DPI_CEILING"] },
  { app: "vault", file: "index.ts", domain: "storage", symbols: ["CHUNK_BYTES", "PRAGMA_BOOTSTRAP", "openStorageLane", "type StorageLane", "type StorageLaneOptions", "type VaultChannel"] },
  { app: "vault", file: "internalroot.ts", domain: "storage", symbols: ["DATABASE_FILE_EXTENSIONS", "DBFILE_REFUSAL_CODE", "databaseFileRefused", "InternalPathAnswer", "resolveInternalPath", "internalRootDir"] },
  { app: "vault", file: "labels.ts", domain: "storage", symbols: ["LABEL_REVISION", "LABEL_MANIFEST", "LabelKey", "label", "labelfill", "seedLabels"] },
  { app: "vault", file: "labelstore.ts", domain: "storage", symbols: ["LabelStoreRow", "LabelRowStore", "LabelKeyOf", "LabelStore", "LabelStoreOptions", "createLabelStore"] },
  { app: "vault", file: "mimetypes.ts", domain: "storage", symbols: ["MimeTypeRow", "MIMETYPES", "MIME_FAMILIES", "MIME_TYPE_COUNT", "MIME_EXTENSION_COUNT", "MIME_ENTRY_COUNT", "mimeTypeFor", "extensionsFor", "MimeCorpusError", "contentTypeFor", "extensionOf", "mimeTypeRow"] },
  { app: "vault", file: "objectface.ts", domain: "storage", symbols: ["VaultChannel", "VaultObject", "VAULT_BUCKETS", "fnv1a", "fnv1aHex", "digestFor", "objectIdentity", "sealObject", "VaultCensus", "channelPreview", "digestShort", "formatBytes", "mulberry32"] },
  { app: "vault", file: "objects.ts", domain: "storage", symbols: ["projectIdValid", "objectPathValid", "mimeValid", "ProjectRow", "createProject", "ProjectListRow", "ProjectPage", "listProjects", "CHUNK_BYTES", "CensusAnswer", "DEFAULT_BUCKET", "DeleteAnswer", "GetAnswer"] },
  { app: "vault", file: "onboardingstate.ts", domain: "storage", symbols: ["VisitorOnboarding", "OnboardingStage", "onboardingbase", "hostallowed", "mergeStage", "readOnboardingState", "markOnboardingStage"] },
  { app: "vault", file: "onboardingstore.ts", domain: "storage", symbols: ["OnboardingFlags", "OnboardingLane", "OnboardingStage", "OnboardingStateRow", "OnboardingStore", "OnboardingStoreOptions", "SqlParam"] },
  { app: "vault", file: "pillars.ts", domain: "storage", symbols: ["PillarStatus", "PillarRow", "PILLARS", "PILLAR_COUNT", "PILLAR_KEYS", "PILLAR_GROUPS", "livePillars", "pillarOf", "pillarsByGroup", "PILLAR_ROUTE_PREFIX", "pillarRoute", "pillarRouteOf"] },
  { app: "vault", file: "protocols.ts", domain: "storage", symbols: ["ProtocolCorpusError", "ProtocolSecurity", "ProtocolRow", "parseProtocolCorpus", "PROTOCOLS", "PROTOCOL_COUNT", "PROTOCOL_ROUTE_PREFIX", "protocolRoute", "PROTOCOL_GROUPS", "PROTOCOL_ROUTE_COUNT", "findProtocol", "protocolRouteOf", "protocolsByGroup"] },
  { app: "vault", file: "querylane.ts", domain: "storage", symbols: ["databasesDir", "databaseFileOf", "laneOf", "closeQueryLanes", "databaseUsageOf", "QueryLaneVerdict", "queryVerdict", "QUERY_SQL_LIMIT", "QUERY_PARAM_LIMIT", "QueryAnswer", "QueryInput", "QueryRefusal"] },
  { app: "vault", file: "quota.ts", domain: "storage", symbols: ["quotaFloorFromMb", "QUOTA_FLOOR_BYTES", "QuotaVerdict", "quotaVerdict", "QuotaLimitParse", "quotaLimitFrom", "QuotaRow", "readQuota", "ensureQuota"] },
  { app: "vault", file: "retention.ts", domain: "storage", symbols: ["RetentionState", "RetentionVerdict", "verdictOf", "retentionVerdicts", "SweepPlan", "sweepPlan", "firstDueTick", "horizonTick", "ROLL_STEP"] },
  { app: "vault", file: "routerbase.ts", domain: "storage", symbols: ["routerBase"] },
  { app: "vault", file: "routes.ts", domain: "storage", symbols: ["routes"] },
  { app: "vault", file: "sandboxmodality.ts", domain: "storage", symbols: ["APPSLUG", "WORKLOADLANES", "SANDBOXLANEENV", "lanesandbox", "lanesandboxfromenv", "laneof"] },
  { app: "vault", file: "sha.ts", domain: "storage", symbols: ["sha256Hex", "sha1Hex", "digestMatches", "isSha256Hex", "isSha1Hex"] },
  { app: "vault", file: "statestore.ts", domain: "storage", symbols: ["SqlParam", "StateLane", "StateRow", "StateStore", "createStateStore"] },
  { app: "vault", file: "storage.ts", domain: "storage", symbols: ["SqlParam", "PRAGMA_BOOTSTRAP", "StorageDriverName", "StorageLaneOptions", "StorageLane", "openStorageLane"] },
  { app: "vault", file: "storageface.ts", domain: "storage", symbols: ["LfsPointer", "GitBlob", "StorageRecord", "lfsPointerText", "lfsPointerFrom", "digestValid", "storageRecordValid", "storageModeFor"] },
  { app: "vault", file: "uistore.ts", domain: "storage", symbols: ["uistoreseedrows", "uicopyrow", "loaduicopy", "uicopy", "uicopyfill", "useUicopy", "uistoreget", "uistorelist", "ensureuicopyingested", "uistoreingest"] },
  { app: "vault", file: "utils.ts", domain: "storage", symbols: ["splitwords"] },
  { app: "vault", file: "vaultclient.ts", domain: "storage", symbols: ["vaultorigin", "vaulttokenconfigured", "vaultproject", "HealthAnswer", "UsageAnswer", "ObjectRow", "QuotaAnswer", "SweepAnswer", "AccountAnswer", "CreateKeyAnswer", "DepositAnswer", "FetchSeam", "KeyRow"] },
  { app: "vault", file: "vite.config.ts", domain: "storage", symbols: ["default"] },
  { app: "vault", file: "vitest.config.ts", domain: "storage", symbols: ["default"] },
  { app: "vault", file: "wingets.ts", domain: "storage", symbols: ["HomeDbconsole", "HomeEntrygate", "HomeHalo", "HomeMyfiles", "HomeObjectbrowse", "HomePlanstable", "HomeReveal", "HomeSignupgate", "HomeSkeleton", "HomeToaster", "ShellBrandmark"] },
];

/* ========================================================================== */
/* HELPERS                                                                    */
/* ========================================================================== */

/** All catalog entries of one app. */
export function byApp(app: string): LogicEntry[] {
  return LOGICS.filter((entry) => entry.app === app);
}

/** All catalog entries of one domain. */
export function byDomain(domain: string): LogicEntry[] {
  return LOGICS.filter((entry) => entry.domain === domain);
}

/**
 * Find the entry that owns (exports) a symbol. First match wins; the
 * DUPLICATE_FAMILIES table above decides the true owner when a symbol is
 * duplicated across apps.
 */
export function findOwner(symbol: string): LogicEntry | undefined {
  return LOGICS.find((entry) => entry.symbols.includes(symbol));
}

/**
 * Import specifier for an app's root logics, per the dedup law: the other
 * app MUST import the existing logic instead of duplicating it. The real
 * workspace scope is @wenathlan/<app> (the root package is
 * @wenathlan/devthink, and every real cross-app import in the current tree
 * uses this scope, e.g. @wenathlan/cadria/synth, @wenathlan/saddle/modes).
 */
export function importSpec(app: string): string {
  return `@wenathlan/${app}`;
}

/**
 * Flatten the catalog into symbol-level logics — the "3,000 up to 4,000
 * correlated logics" regrouping demanded by the owner. Each flattened logic
 * knows its owning app, file and domain, so a duplicate resolution can be
 * turned into a real import via importSpec(entry.app).
 */
export function expand(): ExpandedLogic[] {
  const flat: ExpandedLogic[] = [];
  for (const entry of LOGICS) {
    for (const symbol of entry.symbols) {
      flat.push({ app: entry.app, file: entry.file, domain: entry.domain, symbol });
    }
  }
  return flat;
}

/** Resync statistics for the wave report. */
export const LOGIC_STATS = {
  apps: new Set(LOGICS.map((entry) => entry.app)).size,
  files: LOGICS.length,
  symbols: LOGICS.reduce((total, entry) => total + entry.symbols.length, 0),
  domains: new Set(LOGICS.map((entry) => entry.domain)).size,
  duplicateFamilies: DUPLICATE_FAMILIES.length,
} as const;
