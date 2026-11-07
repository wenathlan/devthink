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
 *   - LOGICS: one LogicEntry per root *.ts file of the 11 apps (495 files
 *     at the time of this resync), each with its real export symbols
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

  /* ===== APP: argan — domain: network (DNS edge: zones, DNSSEC, DOH) ===== */

  { app: "argan", file: "argan.ts", domain: "network", symbols: ["BadgeTone", "ZoneKind", "ZoneState", "ZoneSnapshot", "RecordSetRow", "PublicationStep", "FeatureCard", "SignalBadge"] },
  { app: "argan", file: "capacitor.config.ts", domain: "network", symbols: [] },
  { app: "argan", file: "catalog.ts", domain: "network", symbols: ["listZones", "listApexRecordSets", "listPublicationSteps", "listLibraryCards", "listDnssecKeyCards", "listDohFirstCards", "listHeroBadges", "listDnssecAlgorithms"] },
  { app: "argan", file: "cli.ts", domain: "network", symbols: ["main"] },
  { app: "argan", file: "db.ts", domain: "network", symbols: ["db", "ensureSchema", "seedIfEmpty", "zoneRow", "recordSetRows", "OnboardingStateRow", "getonboardingstate", "setonboardingstage"] },
  { app: "argan", file: "dns.ts", domain: "network", symbols: ["DNSSECALGORITHMS", "DNSSECDIGESTTYPES", "RrSig", "DnsKey", "DsRecord", "DnssecVerdict", "ZoneRecord", "ZoneDiff", "parseZoneRecords", "diffZones", "PROTOCOLS", "findProtocol", "cleanUrl", "applyNow"] },
  { app: "argan", file: "drizzle.config.ts", domain: "network", symbols: [] },
  { app: "argan", file: "family.ts", domain: "network", symbols: ["FAMILY_SLUGS", "FamilyMember", "FAMILY_ACCENTS", "familyrow", "familyurl"] },
  { app: "argan", file: "labels.ts", domain: "network", symbols: ["LABEL_REVISION", "LABEL_MANIFEST", "LabelKey", "label", "labelfill", "seedLabels"] },
  { app: "argan", file: "mimetypes.ts", domain: "network", symbols: ["MimeFamily", "MimeTypeRow", "MIMETYPES", "MIMETYPE_COUNT", "findMimeType", "mimeTypeForExtension", "extensionsForType", "mimeFamilyOf"] },
  { app: "argan", file: "motionpref.ts", domain: "network", symbols: ["MOTION_PREF_KEY", "MotionStorage", "MotionRoot", "memoryMotionStorage", "sessionStorageOrMemoryMotion", "reduceMotionApplied", "reduceMotionStored", "setReduceMotion"] },
  { app: "argan", file: "onboardingstate.ts", domain: "network", symbols: ["OnboardingSnapshot", "readOnboardingState", "loadOnboardingState", "markIntroSeen", "markOnboardingSeen"] },
  { app: "argan", file: "reveal.ts", domain: "network", symbols: ["initReveal", "useReveal"] },
  { app: "argan", file: "sandboxmodality.ts", domain: "network", symbols: ["AppWorkloadLane", "APPSLUG", "WORKLOADLANES", "SANDBOXLANEENV", "LaneSeatResult", "lanesandbox", "lanesandboxfromenv", "laneof"] },
  { app: "argan", file: "seed.ts", domain: "network", symbols: ["seedZones", "seedRecordSets", "seedPublicationSteps", "seedLibraryCards", "seedDnssecKeyCards", "seedDohFirstCards", "seedHeroBadges", "seedDnssecAlgorithms"] },
  { app: "argan", file: "theme.ts", domain: "network", symbols: ["Theme", "currentTheme", "applyTheme", "initTheme", "toggleTheme"] },
  { app: "argan", file: "vite.config.ts", domain: "network", symbols: [] },
  { app: "argan", file: "vitest.config.ts", domain: "network", symbols: [] },

  /* ===== APP: cadria — domain: video3d (image/video 3D engine, VersaWaze) ===== */

  { app: "cadria", file: "blendmodes.ts", domain: "video3d", symbols: ["BlendModeName", "BLEND_MODES", "SeparableName", "ChannelFormula", "SEPARABLE_FORMULAS", "LUMA_WEIGHTS", "Rgb", "Rgb01"] },
  { app: "cadria", file: "capacitor.config.ts", domain: "video3d", symbols: [] },
  { app: "cadria", file: "catalog.ts", domain: "video3d", symbols: ["listPlayerFormats", "listAnchors", "listProjects", "listSeatCards", "listHeroBadges", "listOptionChoices"] },
  { app: "cadria", file: "cleanurl.ts", domain: "video3d", symbols: ["cleanUrl", "applyNow", "syncCanonical"] },
  { app: "cadria", file: "cli.ts", domain: "video3d", symbols: ["main"] },
  { app: "cadria", file: "colorconvert.ts", domain: "video3d", symbols: ["Rgb", "Hsl", "Hsv", "YcbcrCoeffs", "SRGB_DECODE", "clamp01", "clampchannel", "srgbtolinear"] },
  { app: "cadria", file: "compositorraster.ts", domain: "video3d", symbols: ["RgbTriple", "hexcolor", "rectCoverage", "ellipseCoverage", "polygonCoverage", "strokeCoverage", "rasterizeCommands", "SceneCamera"] },
  { app: "cadria", file: "db.ts", domain: "video3d", symbols: ["db", "ensureSchema", "seedIfEmpty", "projectRows", "BrowserLabel", "saveLabel", "readLabel", "readAllLabels"] },
  { app: "cadria", file: "designmotion.ts", domain: "video3d", symbols: ["DURATION_MICRO", "DURATION_WINDOW", "DURATION_SPRING", "DURATION_ENTER", "STAGGER", "EASE_MICRO", "EASE_WINDOW", "EASE_EXIT"] },
  { app: "cadria", file: "drizzle.config.ts", domain: "video3d", symbols: [] },
  { app: "cadria", file: "easecurves.ts", domain: "video3d", symbols: ["EaseCurve", "EaseKey", "MIN_INFLUENCE", "MAX_SPEED", "EASE_LINEAR", "EASE_INOUT", "EASE_IN", "EASE_OUT"] },
  { app: "cadria", file: "family.ts", domain: "video3d", symbols: ["FAMILY_SLUGS", "FamilyMember", "FAMILY_ACCENTS", "familyrow"] },
  { app: "cadria", file: "familyurl.ts", domain: "video3d", symbols: ["familyurl"] },
  { app: "cadria", file: "gateway.ts", domain: "video3d", symbols: ["GenerationRecord", "AnalysisRecord", "GenerationStore", "GatewayError", "MAX_BODY_BYTES", "DEFAULT_PORT", "DEFAULT_HOST", "memoryStore"] },
  { app: "cadria", file: "generation.ts", domain: "video3d", symbols: ["GenerationRecord", "AnalysisRecord", "GenerationStore", "ensureGenerationSchema", "generationStore"] },
  { app: "cadria", file: "gifencoder.ts", domain: "video3d", symbols: ["GifError", "GIF_MAX_COLORS", "GifColor", "quantizePalette", "encodeGifLzw", "GifFrame", "GifEncodeOptions", "encodeGif"] },
  { app: "cadria", file: "image.ts", domain: "video3d", symbols: ["ExportFormat", "ExportErrorCode", "ExportError", "PNG_SIZE_LADDER", "ANIMATION_FPS", "MANIFEST_FRAME_CAP", "PNG_COMPRESS_FACTOR"] },
  { app: "cadria", file: "introfixtures.ts", domain: "video3d", symbols: ["DemoFixtureId", "DemoFixture", "demoFixtures"] },
  { app: "cadria", file: "labels.ts", domain: "video3d", symbols: ["LABEL_REVISION", "labelManifest", "LabelKey", "label", "seedLabels"] },
  { app: "cadria", file: "masks.ts", domain: "video3d", symbols: ["OpacityGrid", "BooleanGrid", "MaskOp", "MaskBounds", "MaskLayer", "makeopacity", "makeboolean", "combinemasks"] },
  { app: "cadria", file: "mediaprobe.ts", domain: "video3d", symbols: ["MediaTrackKind", "MediaTrackMeta", "MediaProbe", "ProbeError", "asciiAt", "finishTracks", "probeMedia", "probeMp4"] },
  { app: "cadria", file: "mesh.ts", domain: "video3d", symbols: ["GeneratedMesh", "BoxOptions", "generateBox", "generatePlane", "generateCylinder", "generateCone", "generateCapsule", "generateIcosphere", "parametricsurface", "mergemeshes", "transformmesh", "meshbounds"] },
  { app: "cadria", file: "onboardingstate.ts", domain: "video3d", symbols: ["VisitorOnboarding", "OnboardingStage", "hostallowed", "mergeStage", "entrytarget", "readOnboardingState", "markOnboardingStage", "resetOnboardingMemory"] },
  { app: "cadria", file: "pixel.ts", domain: "video3d", symbols: ["PixelError", "PixelImage", "PixelAdjustments", "PixelTint", "PixelKernel", "PixelOptions", "pixelkernels", "adjustimage"] },
  { app: "cadria", file: "pngencoder.ts", domain: "video3d", symbols: ["PngError", "PNG_SIGNATURE", "PNG_BYTES_PER_PIXEL", "PngFilter", "pngCrc32", "pngChunk", "pngFilterRow", "pngUnfilterRow"] },
  { app: "cadria", file: "renderjob.ts", domain: "video3d", symbols: ["RenderJobFormat", "RenderJobRequest", "RenderJobIssue", "RenderJobOutcome", "RENDER_SLICE_SECONDS", "renderJobSlices", "executeRenderJob", "RenderJobVerify", "verifyRenderArtifact"] },
  { app: "cadria", file: "reveal.ts", domain: "video3d", symbols: ["initReveal", "useReveal"] },
  { app: "cadria", file: "sandboxmodality.ts", domain: "video3d", symbols: ["AppWorkloadLane", "APPSLUG", "WORKLOADLANES", "SANDBOXLANEENV", "LaneSeatResult", "lanesandbox", "lanesandboxfromenv", "laneof"] },
  { app: "cadria", file: "seed.ts", domain: "video3d", symbols: ["seedPlayerFormats", "seedAnchors", "seedProjects", "seedSeatCards", "seedHeroBadges", "seedFilterChoices", "seedAutoplayChoices"] },
  { app: "cadria", file: "shadercomp.ts", domain: "video3d", symbols: ["ShaderEffectId", "ShaderEffect", "EffectProgram", "DissolveStep", "DissolvePlan", "SHADER_EFFECTS", "compileEffectProgram", "shaderManifest"] },
  { app: "cadria", file: "shaders.ts", domain: "video3d", symbols: ["DirectionalLight", "PointLight", "ShaderLight", "ShadingMaterial", "DEFAULT_MATERIAL", "shadeLambert", "shadeBlinn", "shadePhong", "shadeToon", "fresnelSchlick", "shademesh", "SHADING_MODEL_GLSL"] },
  { app: "cadria", file: "studio.ts", domain: "video3d", symbols: ["StudioControls", "StudioGeneration", "SessionSave", "generateStudioProject", "downloadBlob", "pngSupported", "pngFromSvg", "probeGateway"] },
  { app: "cadria", file: "synth.ts", domain: "video3d", symbols: ["TextureSpec", "TEXTURE_RANGES", "GRAIN_COUPLING", "TEXTURE_PRESET_BLEND", "JITTER_FIELD_CAP", "TexturePresetName", "TexturePreset", "texturePresets"] },
  { app: "cadria", file: "theme.ts", domain: "video3d", symbols: ["Theme", "currentTheme", "applyTheme", "initTheme", "toggleTheme"] },
  { app: "cadria", file: "timeline.ts", domain: "video3d", symbols: ["EditItem", "EditTrack", "EditRange", "EditIssue", "EditOutcome", "EditLimits", "itemend", "sorttrack"] },
  { app: "cadria", file: "timeticks.ts", domain: "video3d", symbols: ["TICKS_PER_SECOND", "MAX_TICKS", "FrameRate", "DEFAULT_FRAME_RATE", "COMMON_FRAME_RATES", "framerate", "frameratefromf64", "framelabel"] },
  { app: "cadria", file: "transcode.ts", domain: "video3d", symbols: ["mediaversions", "mediapipelineerror", "nvencpreset", "nvencpresetladder", "nvencpresets", "getnvencpreset", "transcodemode", "transcodemodeentry"] },
  { app: "cadria", file: "versa.ts", domain: "video3d", symbols: ["Vec3", "Mat4", "VersaError", "vec3add", "vec3cross", "vec3normalize", "mat4identity", "mat4multiply", "mat4invert", "mat4perspective", "mat4lookat", "composepipeline", "projectpoint", "rigpose"] },
  { app: "cadria", file: "versawase.ts", domain: "video3d", symbols: ["BadgeTone", "PlayerFormat", "CreativeAnchor", "GalleryDiscipline", "GalleryProject", "FeatureCard", "SignalBadge", "OptionChoice"] },
  { app: "cadria", file: "version.ts", domain: "video3d", symbols: ["packageversion"] },
  { app: "cadria", file: "video.ts", domain: "video3d", symbols: ["DecodeIssueCode", "DecodeIssue", "DecodeOutcome", "DecodeState", "DecodeSnapshot", "DecodeSession", "DecodeOptions", "opendecode"] },
  { app: "cadria", file: "visualai.ts", domain: "video3d", symbols: ["VariationBudget", "VariationParameters", "MeshVariation", "VariationRequest", "applyvariation", "proposevariations", "MotionSample", "KeyframeSuggestionOptions", "KeyframeSuggestion", "suggestkeyframes", "motionconfidence"] },
  { app: "cadria", file: "visualize.ts", domain: "video3d", symbols: ["Vec3", "ImageInput", "MeshGeometry", "MeshOptions", "VisualizeError", "gridDimensions", "luminance", "blurHeights"] },
  { app: "cadria", file: "vite.config.ts", domain: "video3d", symbols: [] },
  { app: "cadria", file: "vitest.config.ts", domain: "video3d", symbols: [] },
  { app: "cadria", file: "webmencoder.ts", domain: "video3d", symbols: ["WebmError", "EBML_HEADER_ID", "SEGMENT_ID", "CADRIA_CODEC_ID", "DEFAULT_CLUSTER_FRAMES", "WebmFrameSource", "ebmlVintId", "ebmlVintSize"] },
  { app: "cadria", file: "winsnap.ts", domain: "video3d", symbols: ["WIN_SNAP_EDGE_PX", "WIN_MAXIMIZE_EDGE_PX", "WIN_SNAP_GUTTER_PX", "WinSnapZone", "WinSnapRect", "winsnapzone", "winsnaprect"] },

  /* ===== APP: cobaia — domain: monetization (ads, checkout, content) ===== */

  { app: "cobaia", file: "capacitor.config.ts", domain: "monetization", symbols: [] },
  { app: "cobaia", file: "cli.ts", domain: "monetization", symbols: ["main"] },
  { app: "cobaia", file: "content.ts", domain: "monetization", symbols: ["blogpost", "familymember", "checkoutplan", "supportlinks", "adsslot", "seedPosts", "seedRoster", "seedPlans"] },
  { app: "cobaia", file: "db.ts", domain: "monetization", symbols: ["tables", "db", "ensureSchema", "OnboardingStateRow", "OnboardingFlags", "getOnboardingState", "setOnboardingStage", "LabelRow"] },
  { app: "cobaia", file: "drizzle.config.ts", domain: "monetization", symbols: [] },
  { app: "cobaia", file: "familyurl.ts", domain: "monetization", symbols: ["familyurl"] },
  { app: "cobaia", file: "labels.ts", domain: "monetization", symbols: ["LABEL_REVISION", "LABEL_MANIFEST", "LabelKey", "label", "labelfill", "seedLabels"] },
  { app: "cobaia", file: "monetization.ts", domain: "monetization", symbols: ["adsslot", "ADS_LABEL", "ADS_EMPTY", "ADSSLOTS", "adsslotfor", "adsslotlive", "checkoutlinks", "supportlinks", "isconfigured", "planbyid", "posts", "roster"] },
  { app: "cobaia", file: "onboardingstate.ts", domain: "monetization", symbols: ["VisitorOnboarding", "OnboardingStage", "hostallowed", "mergeStage", "readOnboardingState", "markOnboardingStage", "resetOnboardingMemory"] },
  { app: "cobaia", file: "sandboxmodality.ts", domain: "monetization", symbols: ["AppWorkloadLane", "APPSLUG", "WORKLOADLANES", "SANDBOXLANEENV", "LaneSeatResult", "lanesandbox", "lanesandboxfromenv", "laneof"] },
  { app: "cobaia", file: "vite.config.ts", domain: "monetization", symbols: [] },
  { app: "cobaia", file: "vitest.config.ts", domain: "monetization", symbols: [] },

  /* ===== APP: debonair — domain: audio (music engine: analysis, synthesis, mix) ===== */

  { app: "debonair", file: "analyze.ts", domain: "audio", symbols: ["BPM_FLOOR", "BPM_CEIL", "SILENCE_RMS", "BAND_LADDER", "BAND_LABELS", "AudioReport", "StructureSection", "analyze"] },
  { app: "debonair", file: "arrangement.ts", domain: "audio", symbols: ["ArrangementError", "rebaseSchedule", "validateArrangement", "ArrangerRole", "ROLE_NAMES", "PlanSection", "SECTION_PLAN", "RACK_LANES"] },
  { app: "debonair", file: "audio.ts", domain: "audio", symbols: ["KeyMode", "NarrativeShape", "SpectralSummary", "RhythmStats", "HarmonicStats", "TimbreStats", "StructureStats", "DescriptorStats"] },
  { app: "debonair", file: "beatgrid.ts", domain: "audio", symbols: ["BeatErrorCode", "BeatResult", "BeatGrid", "TempoCurve", "TempoAnchor", "TempoMap", "onsetEnvelope", "detectTempo"] },
  { app: "debonair", file: "bigintids.ts", domain: "audio", symbols: ["mintid", "idtick"] },
  { app: "debonair", file: "blobstore.ts", domain: "audio", symbols: ["BLOB_SCHEMA_VERSION", "BLOB_DEFAULT_CAP_BYTES", "BLOB_GATEWAY_TIMEOUT_MS", "BlobPointer", "BlobManifestRow", "BlobErrorCode", "BlobResult", "BlobStore"] },
  { app: "debonair", file: "capacitor.config.ts", domain: "audio", symbols: [] },
  { app: "debonair", file: "catalog.ts", domain: "audio", symbols: ["listGenres", "listTimelineTracks", "listMixerStrips", "listReadouts", "listLibraryTracks", "listStageCards", "listHeroBadges", "listGenreProfileCards"] },
  { app: "debonair", file: "cleanurl.ts", domain: "audio", symbols: ["cleanUrl", "applyNow", "syncCanonical"] },
  { app: "debonair", file: "cli.ts", domain: "audio", symbols: ["main"] },
  { app: "debonair", file: "cloudsync.ts", domain: "audio", symbols: ["CloudSyncError", "CLOUDSYNC_TIMEOUT_MS", "CLOUDSYNC_ENDPOINT", "CloudTake", "CloudResult", "CloudDeps", "validateCloudPayload", "CloudSaveInput"] },
  { app: "debonair", file: "composer.ts", domain: "audio", symbols: ["COMPOSER_ERROR_CODES", "ComposerErrorCode", "ComposerError", "SIMILARITY_FLOOR", "DEFAULT_BARS", "ComposerPromptSpec", "parseComposerPrompt", "planVector"] },
  { app: "debonair", file: "coverpalette.ts", domain: "audio", symbols: ["coverPaletteFromStats", "coverPaletteFromPcm", "plateAccents"] },
  { app: "debonair", file: "dawview.ts", domain: "audio", symbols: ["formatClock", "clipStyle", "FADER_MIN_DB", "FADER_MAX_DB", "clampFader", "faderToUnit", "unitToFader", "FADER_STEP_DB"] },
  { app: "debonair", file: "db.ts", domain: "audio", symbols: ["db", "ensureSchema", "seedIfEmpty", "renderJobRows", "OnboardingStateRow", "OnboardingFlags", "LabelRow", "getOnboardingState"] },
  { app: "debonair", file: "demix.ts", domain: "audio", symbols: ["DemixErrorCode", "DemixError", "DEMIX_STEM_NAMES", "DemixStemName", "DEMIX_BASS_HZ", "DEMIX_VOCAL_HZ", "DemixStem", "DemixResult"] },
  { app: "debonair", file: "drizzle.config.ts", domain: "audio", symbols: [] },
  { app: "debonair", file: "ducking.ts", domain: "audio", symbols: ["DuckingErrorCode", "DuckingResult", "DuckingParams", "DuckingRegion", "FollowerState", "FLOORDB", "followerInitial", "validateDucking"] },
  { app: "debonair", file: "family.ts", domain: "audio", symbols: ["FAMILY_SLUGS", "FamilyMember", "FAMILY_ACCENTS", "familyrow"] },
  { app: "debonair", file: "familyurl.ts", domain: "audio", symbols: ["familyurl"] },
  { app: "debonair", file: "fingerprint.ts", domain: "audio", symbols: ["PEAKS_PER_FRAME", "MAX_LAG_FRAMES", "PEAK_FLOOR_RATIO", "BAND_EDGES", "Peak", "Landmark", "DbEntry", "MatchResult"] },
  { app: "debonair", file: "formant.ts", domain: "audio", symbols: ["Vowel", "VOWEL_FORMANTS", "FormantPole", "UPPER_FORMANT_HZ", "UPPER_FORMANT_BW", "UPPER_FORMANT_GAINS", "vowelBank", "glideBank"] },
  { app: "debonair", file: "gatewayapi.ts", domain: "audio", symbols: ["IngestJobState", "GatewayJobRow", "GatewayJobPatch", "GatewayJobSeat", "GatewayDocumentSeat", "GatewayProfileRow", "GatewayProfileSeat", "GatewayTrackSeat"] },
  { app: "debonair", file: "generateclient.ts", domain: "audio", symbols: ["GenerateClientCode", "GenerateClientError", "GenerateClientResult", "GenerateClientDeps", "GENERATE_CALL_TIMEOUT_MS", "GENERATE_RENDER_TIMEOUT_MS", "GenerateReference", "GenerateComposition"] },
  { app: "debonair", file: "genre.ts", domain: "audio", symbols: ["CORPUS_SCHEMA_VERSION", "CORPUS_ERROR_CODES", "CorpusErrorCode", "CorpusError", "CorpusStyleRow", "GenreCorpus", "CorpusResult", "CorpusTrainOptions"] },
  { app: "debonair", file: "genrematrix.ts", domain: "audio", symbols: ["GenreStyle", "GENRES", "genreById", "pickBpm", "matchGenre", "validateMatrix"] },
  { app: "debonair", file: "harmonyengine.ts", domain: "audio", symbols: ["ProgressionSpec", "ChordEvent", "CadenceName", "RelativeSwap", "PROGRESSION_SETS", "PROGRESSION_IDS", "hashSeed", "mulberry32"] },
  { app: "debonair", file: "hpss.ts", domain: "audio", symbols: ["HARMONIC_KERNEL", "PERCUSSIVE_KERNEL", "Stft", "stft", "medianFilter", "istft", "masksOf", "StemPair"] },
  { app: "debonair", file: "ialane.ts", domain: "audio", symbols: ["servicelaneid", "ReferencePostInput", "ReferenceRecord", "postReference"] },
  { app: "debonair", file: "ingest.ts", domain: "audio", symbols: ["INGEST_SCHEMA_VERSION", "NOTE_NAMES", "IngestSegment", "IngestStem", "IngestDocument", "onsetSecondsOf", "pcmhash", "segmentsof"] },
  { app: "debonair", file: "katexis.ts", domain: "audio", symbols: ["BadgeTone", "GenreConfig", "TimelineClip", "TimelineTrack", "MixerStripRow", "ReadoutRow", "RenderStage", "RENDER_STAGES"] },
  { app: "debonair", file: "kathesis.ts", domain: "audio", symbols: ["ENGINE_NAME", "ENGINE_HOUSES", "KathesisSeat", "KATHESIS_SEATS", "seatOf", "payloadGenerationOf", "WavetableShape", "buildWavetable", "WavetableOscillator", "biquadOf", "runBiquad"] },
  { app: "debonair", file: "labels.ts", domain: "audio", symbols: ["LABEL_REVISION", "LABEL_MANIFEST", "LabelKey", "label", "labelfill", "seedLabels"] },
  { app: "debonair", file: "limiter.ts", domain: "audio", symbols: ["TRUEPEAK_OVERSAMPLING", "LIMITER_LOOKAHEAD_S", "LIMITER_RELEASE_S", "LIMITER_MARGIN_DB", "LimiterOptions", "truePeakLinear", "limitTruePeak"] },
  { app: "debonair", file: "llmlane.ts", domain: "audio", symbols: ["LlmLaneCode", "LlmLaneError", "LLM_CALL_TIMEOUT_MS", "LLM_DEFAULT_MODEL", "llmlaneorigin", "ComposeWithLlmOptions", "LlmPlan", "LlmPlanResult"] },
  { app: "debonair", file: "loudness.ts", domain: "audio", symbols: ["LoudnessErrorCode", "LoudnessResult", "KCoeffs", "BiquadState", "LoudnessReport", "ABSOLUTEGATE", "RELATIVEGATE", "energyToLufs"] },
  { app: "debonair", file: "mcplane.ts", domain: "audio", symbols: ["MCP_DOMAIN", "MCP_TOOL_NAMES", "McpToolProperty", "McpToolDef", "toolcatalog", "McpLaneConfig", "McpAgentLane", "MCP_POLL_INTERVAL_MS"] },
  { app: "debonair", file: "midiwriter.ts", domain: "audio", symbols: ["MidiErrorCode", "MidiError", "MIDI_CONSTANTS", "VLQ_MAX", "MidiNote", "MidiTrack", "MidiProblem", "encodeVlq"] },
  { app: "debonair", file: "mixergraph.ts", domain: "audio", symbols: ["MixerGraphErrorCode", "MixerGraphError", "MixerSend", "MixerChannel", "MixerGraph", "ResolvedPath", "dbToLinear", "linearToDb"] },
  { app: "debonair", file: "motionpref.ts", domain: "audio", symbols: ["MOTION_PREF_KEY", "MotionStorage", "MotionRoot", "memoryMotionStorage", "sessionStorageOrMemoryMotion", "reduceMotionApplied", "reduceMotionStored", "setReduceMotion"] },
  { app: "debonair", file: "musictheory.ts", domain: "audio", symbols: ["Key", "Chord", "ChordQuality", "ScaleName", "NOTE_NAMES", "FLAT_NAMES", "SCALE_STEPS", "SCALE_NAMES"] },
  { app: "debonair", file: "onboardingstate.ts", domain: "audio", symbols: ["VisitorOnboarding", "OnboardingStage", "hostallowed", "mergeStage", "readOnboardingState", "loadOnboardingState", "markIntroSeen", "markOnboardingSeen"] },
  { app: "debonair", file: "pattern.ts", domain: "audio", symbols: ["PATTERN_SCHEMA_VERSION", "TIMELINE_SCHEMA_VERSION", "PATTERN_SCHEMA_IDS", "NOTE_NAMES", "PatternScaleName", "PATTERN_SCALES", "PATTERN_SCALE_NAMES", "PATTERN_SCALE_ALIASES"] },
  { app: "debonair", file: "patternenums.ts", domain: "audio", symbols: [] },
  { app: "debonair", file: "pianoroll.ts", domain: "audio", symbols: ["PIANOROLL_CONSTANTS", "PianoRollErrorCode", "PianoRollError", "EditableNote", "RollWindow", "scheduleToNotes", "notesToSchedule", "addNote"] },
  { app: "debonair", file: "playerbus.ts", domain: "audio", symbols: ["ReferenceSource", "ReferenceTake", "ReferenceOrigin", "BusTake", "ReconTake", "isReferenceTake", "isReconTake", "durationOfTake"] },
  { app: "debonair", file: "recon.ts", domain: "audio", symbols: ["RECON_SCHEMA_VERSION", "RECON_SAMPLE_RATE", "RECON_PARAM_COUNTS", "RECON_NAME_MAX", "RECON_NOTES_MAX", "RECON_SCALE_NAMES", "RECON_ROOT_NAMES", "RECON_INSTRUMENTS"] },
  { app: "debonair", file: "remixplan.ts", domain: "audio", symbols: ["RemixErrorCode", "RemixResult", "RemixAnalysis", "RemixParams", "RemixPiece", "RemixPlan", "SimilarityMatrix", "JOINTCONTEXT"] },
  { app: "debonair", file: "render.ts", domain: "audio", symbols: ["migraterenderjobsschema", "ensurerenderjobsschema", "putrenderjob", "getrenderjob", "updaterenderjob", "listrenderjobs", "migratetrackschema", "ensuretrackschema"] },
  { app: "debonair", file: "renderengine.ts", domain: "audio", symbols: ["RENDER_SAMPLE_RATE", "RENDER_BIT_DEPTH", "RENDER_WAV_KIND", "RENDER_PHASES", "RenderPhase", "RENDER_WORKER_MODALITY", "RenderBlobPointer", "RenderStorePut"] },
  { app: "debonair", file: "reveal.ts", domain: "audio", symbols: ["initReveal", "useReveal"] },
  { app: "debonair", file: "reverseingest.ts", domain: "audio", symbols: ["ReverseIngestErrorCode", "ReverseIngestError", "ReverseIngestOptions", "ReverseIngestOk", "ReverseIngestResult", "timelineEvents", "shapeTimelineLoudness", "reverseIngestPayload"] },
  { app: "debonair", file: "rhythmgrammar.ts", domain: "audio", symbols: ["LaneName", "PatternGrid", "SwingGrid", "FamilyName", "LANES", "FAMILY_NAMES", "STEPS", "gridFromSpec"] },
  { app: "debonair", file: "routetable.ts", domain: "audio", symbols: ["GatewayHandlerName", "RouteSpec", "routes", "matchpath", "RouteVerdict", "matchroute"] },
  { app: "debonair", file: "sandboxmodality.ts", domain: "audio", symbols: ["AppWorkloadLane", "APPSLUG", "WORKLOADLANES", "SANDBOXLANEENV", "LaneSeatResult", "lanesandbox", "lanesandboxfromenv", "laneof"] },
  { app: "debonair", file: "seed.ts", domain: "audio", symbols: ["seedGenres", "seedTimelineTracks", "seedMixerStrips", "seedReadouts", "seedLibraryTracks", "seedVitrineTracks", "seedStageCards", "seedHeroBadges"] },
  { app: "debonair", file: "spectrum.ts", domain: "audio", symbols: ["FFT_SIZE", "HOP_SIZE", "HANN_TABLE", "SpectrumFrame", "fftInPlace", "frameSpectrum", "KK_MAJOR", "KK_MINOR"] },
  { app: "debonair", file: "speechalign.ts", domain: "audio", symbols: ["SpeechAlignErrorCode", "SpeechAlignResult", "Segment", "FitEntry", "SpeechAlignParams", "AlignPlan", "defaultSpeechParams", "frameRms"] },
  { app: "debonair", file: "stages.ts", domain: "audio", symbols: ["StageId", "StudioStage", "STUDIO_STAGES", "findStage"] },
  { app: "debonair", file: "stems.ts", domain: "audio", symbols: ["StemsErrorCode", "StemsError", "STEMS_SCHEMA_VERSION", "StemRolePolicy", "STEM_ROLES", "stemFile", "StemPlan", "StemsManifestStem"] },
  { app: "debonair", file: "take.ts", domain: "audio", symbols: ["NoteEvent", "TakeSchedule", "scheduleTake", "sectionAt", "eventsInWindow", "positionAt", "validateSchedule", "TAKE_STORE_KEY"] },
  { app: "debonair", file: "theme.ts", domain: "audio", symbols: ["Theme", "currentTheme", "applyTheme", "initTheme", "toggleTheme"] },
  { app: "debonair", file: "timelinemodel.ts", domain: "audio", symbols: ["TimelineErrorCode", "TimelineModelError", "TimelineClip", "TimelineGrid", "MINIMUMDURATION", "snapToGrid", "snapClip", "clipsOverlap"] },
  { app: "debonair", file: "timestretch.ts", domain: "audio", symbols: ["StretchErrorCode", "StretchError", "STRETCH_RATIO_MIN", "STRETCH_RATIO_MAX", "stretchPcm"] },
  { app: "debonair", file: "tuning.ts", domain: "audio", symbols: ["CONCERT_PITCH", "A4_MIDI", "midiToHz"] },
  { app: "debonair", file: "vite.config.ts", domain: "audio", symbols: [] },
  { app: "debonair", file: "vitest.config.ts", domain: "audio", symbols: [] },
  { app: "debonair", file: "vocalsynth.ts", domain: "audio", symbols: ["VIBRATO_HZ", "VIBRATO_SEMITONES", "CONSONANT_SAMPLES", "TARGET_SYLLABLE_PEAK", "Syllable", "VoiceRenderOptions", "VoiceRender", "renderVoice"] },
  { app: "debonair", file: "wavwriter.ts", domain: "audio", symbols: ["WavErrorCode", "WavError", "WavBitDepth", "WavFormatId", "WavFormatRow", "WAV_FORMAT", "HEADER_LAYOUT", "SAMPLE_RATE_MIN"] },

  /* ===== APP: devthink — domain: os (the operating system and superplatform) ===== */

  { app: "devthink", file: "account.ts", domain: "os", symbols: ["ACCOUNT_CREDENTIAL_ID", "ACCOUNT_NAME_KEY", "AccountState", "accountstate", "createAccount", "verifyAccount", "replaceAccountPassword", "DevThinkIdentity"] },
  { app: "devthink", file: "admins.ts", domain: "os", symbols: ["AdminSource", "Admin", "Ban", "AllowedSite", "AuditEntry", "admins", "syncCodeowners", "grantAdmin"] },
  { app: "devthink", file: "agent.ts", domain: "os", symbols: ["reservedagentnames", "agentname", "agentscopeof", "readonlyscope", "agentbudgetof", "spendbudget", "budgetremaining", "pauseagent"] },
  { app: "devthink", file: "agentcert.ts", domain: "os", symbols: ["runagentcertsuite", "runleaderworkertopologyscenario", "agentcertreport", "agentcertrecord"] },
  { app: "devthink", file: "akash.ts", domain: "os", symbols: ["AKASH_SHEET", "AKASH_BACKOUT", "AKASH_EXIT", "AKASH_MICRO", "AKASH_SPRING", "AKASH_MARK_FLOOR", "prefersReducedMotion", "akashSpringTrack"] },
  { app: "devthink", file: "apifreeze.ts", domain: "os", symbols: ["protocolsupported", "apifreezerelease", "apifreezedate", "apifreezescope", "protocolmajorof", "negotiateprotocol", "sharedprotocolversion", "deprecatedfield"] },
  { app: "devthink", file: "appregistry.ts", domain: "os", symbols: ["DesktopAppTarget", "DesktopApp", "DESKTOP_APPS", "PINNED_APPS", "FAMILY_APP_IDS", "isFamilyApp", "searchDesktopApps"] },
  { app: "devthink", file: "auditreferenceworkflows.ts", domain: "os", symbols: [] },
  { app: "devthink", file: "auth.ts", domain: "os", symbols: ["tokenhashprefix", "defaulttokenlifetimems", "defaultpairinglifetimems", "defaultchallengelifetimems", "authrefusedmessage", "tokenhashof", "issuepairingcode", "redeempairingcode"] },
  { app: "devthink", file: "automation.ts", domain: "os", symbols: ["triggernames", "workflowtriggers", "triggermatch", "validateworkflowinputs", "triggerregistry", "commandguard", "parsecommand", "platformadapter"] },
  { app: "devthink", file: "babelcoreface.ts", domain: "os", symbols: ["BabelTransformOptions", "BabelTransformResult", "BabelTransformSync", "transformSync"] },
  { app: "devthink", file: "background.ts", domain: "os", symbols: ["executefilesstep", "processmcpframe"] },
  { app: "devthink", file: "bridge.ts", domain: "os", symbols: ["serveroperations", "servereventtypes", "pagecontentkeys", "contractcapabilities", "stableopid", "negotiatecapabilities", "composeenvelope", "parseenvelope"] },
  { app: "devthink", file: "browserextension.ts", domain: "os", symbols: ["extensionpermissions", "permissionpolicy", "requestpermission", "protocolversion", "extensioncommands", "createid", "createcommand", "createmessage"] },
  { app: "devthink", file: "build.ts", domain: "os", symbols: ["buildBinary", "StyleDict", "parseCssTokens", "resolveCssVars", "Rgb", "cssColorToRgb", "JsxAttr", "JsxChild"] },
  { app: "devthink", file: "bun.ts", domain: "os", symbols: ["bunadapter"] },
  { app: "devthink", file: "calculator.ts", domain: "os", symbols: ["CalculatorOperator", "CalculatorToken", "CalculatorError", "CalculatorKeyAction", "tokenizeCalculator", "evaluateExpression", "formatCalculator", "mapKeyboardKey"] },
  { app: "devthink", file: "capacitor.config.ts", domain: "os", symbols: [] },
  { app: "devthink", file: "capture.ts", domain: "os", symbols: ["captureformats", "capturetargets", "capturekinds", "captureoptionsof", "capturevisible", "capturestitched", "captureelement", "captureregion"] },
  { app: "devthink", file: "catalog.ts", domain: "os", symbols: ["FamilySite", "Recipe", "Rung", "CoreModule", "NativeApp", "RunnerBinary", "StudioAsset", "StudioTrack"] },
  { app: "devthink", file: "chatstate.ts", domain: "os", symbols: ["TurnRole", "ChatTurn", "ChatCheckpoint", "ChatBirth", "ChatSession", "isChatTurn", "isChatCheckpoint", "isChatBirth"] },
  { app: "devthink", file: "chipterminal.ts", domain: "os", symbols: ["ChipTerminalProps", "ChipTerminal"] },
  { app: "devthink", file: "chromiumsmoke.ts", domain: "os", symbols: [] },
  { app: "devthink", file: "cjs.ts", domain: "os", symbols: [] },
  { app: "devthink", file: "cjswrap.ts", domain: "os", symbols: ["cjswrap"] },
  { app: "devthink", file: "cleanurl.ts", domain: "os", symbols: ["CleanResult", "cleanUrlDetailed", "cleanUrl", "View", "navigate", "ensureCleanLocation", "parseHashRoute", "bindLocationJanitor"] },
  { app: "devthink", file: "cli.ts", domain: "os", symbols: ["runclifamily", "parsecliconfig", "cliexitclasses", "exitcodeof", "exitclassofrun", "manifestkeyallowlist", "reviewedwebresources", "capabilityapireport"] },
  { app: "devthink", file: "commands.ts", domain: "os", symbols: ["tabshape", "windowshape", "parsetabquery", "tabpatternmatches", "querymatches", "normalizedtaburl", "clonewarning", "clonetabs"] },
  { app: "devthink", file: "companion.ts", domain: "os", symbols: ["nativehosttemplatejson", "companionbuild", "companionprotocol", "companionsurfaces", "encodenativemessage"] },
  { app: "devthink", file: "config.ts", domain: "os", symbols: ["DevThinkConfig", "AuthKind", "AuthCredential", "DevThinkAuth", "DevThinkPaths", "resolvePaths", "ensurePaths", "readConfig"] },
  { app: "devthink", file: "consoleboot.ts", domain: "os", symbols: ["consoleprompt", "consoleversion", "bootdelay", "bootlines", "bootstageentry", "BOOTSTAGES", "BOOTWIRES", "bootgraph"] },
  { app: "devthink", file: "constants.ts", domain: "os", symbols: ["FETCH_TIMEOUT_MS", "JITTER_MIN_MS", "JITTER_MAX_MS", "DEBUG_LOG_MAX_BYTES", "DEBUG_LOG_RETENTION_DAYS", "DEBUG_BUFFER_TUI_LINES"] },
  { app: "devthink", file: "consumersmoke.ts", domain: "os", symbols: [] },
  { app: "devthink", file: "core.ts", domain: "os", symbols: ["fnv1a32", "fnv1a32Hex", "fnv1a64", "fnv1a64Bytes", "jitter", "getJitter", "getJitterMs", "pickRandom"] },
  { app: "devthink", file: "costcert.ts", domain: "os", symbols: ["runcostcertsuite", "costcertreport", "costcertrecord"] },
  { app: "devthink", file: "dashboard.ts", domain: "os", symbols: ["agentstatuscard", "queuelanerow", "messageflowrow", "conflictlogrow", "costperagentrow", "escalationrow", "timelinescrubmark", "topologyinventoryentry", "alttabkeydown", "altgestureend", "nextaltindex", "mruorder", "IconSpot", "IconBounds", "IconSpotMap", "ICONS_STORAGE_KEY", "SNAP_STEP_X", "SNAP_STEP_Y", "CELL_MEDIUM", "CELL_LARGE", "DensityPlatform", "DENSITY_PLATFORMS", "WebDpr", "AndroidBucket", "ANDROID_DPI", "CELL_W_PX", "CELL_H_PX", "TERMINAL_COLUMNS"] },
  { app: "devthink", file: "dashboardpage.ts", domain: "os", symbols: [] },
  { app: "devthink", file: "data.ts", domain: "os", symbols: ["builddataset", "checksum", "exportcontent", "exportartifact", "artifactrecordof", "chunkplan", "backpressure", "advancestream"] },
  { app: "devthink", file: "debug.ts", domain: "os", symbols: ["cdpkinds", "cdpdomains", "methoddomain", "cdpallowlistof", "allowlistcovers", "attachcdpsession", "detachcdpsession", "sendcdpcommand"] },
  { app: "devthink", file: "deno.ts", domain: "os", symbols: ["denoadapter", "denoconfigread"] },
  { app: "devthink", file: "devthink.ts", domain: "os", symbols: ["ParsedArgs", "main"] },
  { app: "devthink", file: "distseamtypes.ts", domain: "os", symbols: [] },
  { app: "devthink", file: "doccheck.ts", domain: "os", symbols: ["rundocchecksuite", "doccheckreport", "doccheckrecord"] },
  { app: "devthink", file: "dockmagnify.ts", domain: "os", symbols: ["DOCK_MAGNIFY_MAX", "DOCK_MAGNIFY_SPREAD", "magnifyscale"] },
  { app: "devthink", file: "docsaudit.ts", domain: "os", symbols: [] },
  { app: "devthink", file: "drizzle.config.ts", domain: "os", symbols: [] },
  { app: "devthink", file: "engines.ts", domain: "os", symbols: ["EngineKind", "EngineState", "EngineRunner", "EngineRecord", "ENGINEPLANCOUNT", "ENGINES", "EnginePlanReport", "enginesreport"] },
  { app: "devthink", file: "environments.ts", domain: "os", symbols: ["offfamilyof", "environmentsof", "defaultenvironment", "offloadkinds", "markuprenderstep", "environmentrequirementsof", "executorregistry", "routeenvironment"] },
  { app: "devthink", file: "evidence.ts", domain: "os", symbols: ["pixeldiff", "capturegrab", "forensickinds", "beforeafter", "consoletimeline", "nettimeline", "diffbase", "diffshot"] },
  { app: "devthink", file: "examplelocaljob.ts", domain: "os", symbols: [] },
  { app: "devthink", file: "export.ts", domain: "os", symbols: ["exportformats", "exportscopes", "exportdescriptorof", "csvfield", "csvof", "markdownfield", "markdownof", "jsonlinesof"] },
  { app: "devthink", file: "fakehost.ts", domain: "os", symbols: [] },
  { app: "devthink", file: "familyaccent.ts", domain: "os", symbols: ["FAMILY_ACCENT", "GlyphMotion", "familyAccentOf"] },
  { app: "devthink", file: "familylanes.ts", domain: "os", symbols: ["familylanes"] },
  { app: "devthink", file: "fileexplorer.ts", domain: "os", symbols: ["ExplorerLocation", "ShellFolderId", "SHELL_FOLDER_ORDER", "FOLDER_NAMES", "FOLDER_DETAILS", "ExplorerItemKind", "Crumb", "parsepath"] },
  { app: "devthink", file: "flow.ts", domain: "os", symbols: ["manifestdigest", "validatemanifest", "verifypublishersignature", "signmanifest", "libraryentryof", "grantdiffof", "sensitiveconsentfor", "libraryproposalof"] },
  { app: "devthink", file: "gates.ts", domain: "os", symbols: ["gatekindfor", "paypayload", "deletepayload", "credspayload", "opengate", "gatestateof", "resolvegate", "nobatchresolution"] },
  { app: "devthink", file: "gateway.ts", domain: "os", symbols: ["PREF_GATEWAYBASE", "GATEWAY_REQUIRED_COPY", "GATEWAY_SEND_NOTICE", "normalizeGatewayBase", "GatewayEndpointCheck", "validateGatewayEndpoint", "GatewayProbe", "probeGatewayBase"] },
  { app: "devthink", file: "graph.ts", domain: "os", symbols: ["nodekind", "nodestate", "NODE_KINDS", "NODE_STATES", "graphnode", "graphedge", "nodegraph", "graphproblem"] },
  { app: "devthink", file: "hardening.ts", domain: "os", symbols: ["masklogtext", "localscangate", "hatchbannerof", "newdomainpausecard", "runtracekeys", "syncrotationgate", "stdioclientsignaturegate", "transparencyexportmask"] },
  { app: "devthink", file: "headless.ts", domain: "os", symbols: ["headlessfixturestep", "headlessprogress", "openheadlesssession", "headlessgatewait", "closeheadlesssession", "remoteattachframes", "headlesspolicyvalidate", "headlessauditread"] },
  { app: "devthink", file: "hono.ts", domain: "os", symbols: ["cors", "Context", "Hono", "serve", "serveStatic"] },
  { app: "devthink", file: "http.ts", domain: "os", symbols: ["httpkinds", "transportresponse", "fetchtransport", "calltransport", "statusclassof", "templateurl", "fetchrequestof", "fetchoptionsof"] },
  { app: "devthink", file: "icons.ts", domain: "os", symbols: ["iconpayloads", "manifesticons", "actiondefaulticon"] },
  { app: "devthink", file: "imagedigests.ts", domain: "os", symbols: [] },
  { app: "devthink", file: "index.ts", domain: "os", symbols: [] },
  { app: "devthink", file: "inspectstoreartifacts.ts", domain: "os", symbols: [] },
  { app: "devthink", file: "introtarget.ts", domain: "os", symbols: ["IntroTarget", "INTRO_SEEN_KEY", "resolveintrotarget", "panelgateverdict"] },
  { app: "devthink", file: "jsongate.ts", domain: "os", symbols: [] },
  { app: "devthink", file: "kbdterminal.ts", domain: "os", symbols: ["KbdTerminalProps", "KbdTerminal"] },
  { app: "devthink", file: "labels.ts", domain: "os", symbols: ["LABEL_REVISION", "labelManifest", "LabelKey", "label", "ChatSuggestion", "seedChatSuggestions", "chatSuggestions", "ChatGreeting"] },
  { app: "devthink", file: "logics.ts", domain: "os", symbols: ["DEDUP_LAW", "LogicEntry", "DuplicateFamily", "DOMAIN_OF_APP", "DUPLICATE_FAMILIES", "DEDUP_RESOLUTIONS", "LOGICS", "byApp", "byDomain", "findOwner", "importSpec", "expand", "LOGIC_STATS"] },
  { app: "devthink", file: "maintain.ts", domain: "os", symbols: [] },

  { app: "devthink", file: "matrixverify.ts", domain: "os", symbols: ["runmatrixverifysuite", "matrixverifyreport", "matrixverifyrecord"] },
  { app: "devthink", file: "mcp.ts", domain: "os", symbols: ["servemethods", "servemetadata", "clientmetadataof", "recordclientmetadata", "serveinitialize", "transportendpoints", "startserve", "shutdowndrain"] },
  { app: "devthink", file: "mcpregistry.ts", domain: "os", symbols: ["McpEndpoint", "CustomProvider", "McpRegistryState", "McpStorageAdapter", "memorystorage", "localstorageadapter", "safeurl", "McpRegistry", "createmcpregistry"] },
  { app: "devthink", file: "media.ts", domain: "os", symbols: [] },
  { app: "devthink", file: "memory.ts", domain: "os", symbols: ["memoryadapter", "sessionmemory", "randomid", "sensitivememoryclasses", "provenanceof", "memoryitemof", "attachprovenance", "stepsummaryfor"] },
  { app: "devthink", file: "modalitytypes.ts", domain: "os", symbols: [] },
  { app: "devthink", file: "modes.ts", domain: "os", symbols: ["ModeDefinition", "MODES", "listModes", "resolveMode", "modePrompt"] },
  { app: "devthink", file: "nativesmoke.ts", domain: "os", symbols: [] },
  { app: "devthink", file: "net.ts", domain: "os", symbols: ["netwatchkinds", "resourcefact", "resourcefacts", "failureclass", "correlationid", "newexchange", "pairexchange", "filterexchanges"] },
  { app: "devthink", file: "neutral.ts", domain: "os", symbols: [] },
  { app: "devthink", file: "node.ts", domain: "os", symbols: ["nodeadapter"] },
  { app: "devthink", file: "offscreen.ts", domain: "os", symbols: [] },
  { app: "devthink", file: "onboardingstate.ts", domain: "os", symbols: ["VisitorOnboarding", "onboardingstage", "ONBOARDING_CACHE_KEY", "VISITOR_KEY", "ONBOARDING_BASE_ENV", "ispublichttpsbase", "onboardingapibase", "visitorid"] },
  { app: "devthink", file: "optionspage.ts", domain: "os", symbols: [] },
  { app: "devthink", file: "os.ts", domain: "os", symbols: ["AppId", "AppPage", "AppTarget", "AppMeta", "APPS", "appMeta", "appExternalUrl", "Persona"] },
  { app: "devthink", file: "pack.ts", domain: "os", symbols: ["artifactchannels", "artifactchannelof", "artifactmanifestof", "artifactmanifesttext", "artifactmanifestnameof", "artifactmanifestcheck", "rollbackpinnedset", "sbomspecversion"] },
  { app: "devthink", file: "packageextension.ts", domain: "os", symbols: [] },
  { app: "devthink", file: "page.ts", domain: "os", symbols: ["browserresult", "isbrowserkind", "readcapabilities", "runbrowseraction", "stepresult", "runpageaction", "typetimeschedule", "appendvalue"] },
  { app: "devthink", file: "pagebridge.ts", domain: "os", symbols: [] },
  { app: "devthink", file: "panelsync.ts", domain: "os", symbols: ["PanelSyncReport", "panelSync"] },
  { app: "devthink", file: "paneltypes.ts", domain: "os", symbols: ["DevThinkProvider", "DevThinkMessage", "DevThinkTab"] },
  { app: "devthink", file: "parseoptions.ts", domain: "os", symbols: ["parseoptions"] },
  { app: "devthink", file: "pentest.ts", domain: "os", symbols: ["runpentestchecklist", "pentestreport", "pentestrecord"] },
  { app: "devthink", file: "perf.ts", domain: "os", symbols: ["perfrecordof", "workerbackpressure", "queuedepthsampleof", "queuedepthview", "snapshotrequestkey", "dedupesnapshotrequests", "captureplanschedule", "abandonedparsetasks"] },
  { app: "devthink", file: "permdiff.ts", domain: "os", symbols: ["permdiffbaseline", "permissionset", "permissionsetof", "previousof", "diffpermissionsets"] },
  { app: "devthink", file: "personalstore.ts", domain: "os", symbols: ["WallpaperId", "WALLPAPERS", "WALLPAPER_KEY", "loadWallpaper", "applyWallpaper", "saveWallpaper", "AccentId", "ACCENTS"] },
  { app: "devthink", file: "plan.ts", domain: "os", symbols: ["planfilestepfields", "loopkinds", "retrykinds", "parseplanfile", "planoriginprofile", "plansteprisk", "lintplanfile", "formatdiagnostics"] },
  { app: "devthink", file: "planstore.ts", domain: "os", symbols: ["Tier", "TierBadge", "TIER_BADGES", "TIER_ROWS", "CAPABILITY_BADGES", "PlanCustom", "PlanView", "peekplan", "loadplan", "saveplan", "planbadge"] },
  { app: "devthink", file: "policy.ts", domain: "os", symbols: ["normalizeendpoint", "hostpattern", "issessionkind", "isworkflowkind", "istriggeraction", "iswatchkind", "isdebugkind", "iscdpkind"] },
  { app: "devthink", file: "poolaudit.ts", domain: "os", symbols: ["runpoolauditsuite", "groupcounts", "poolcoveragereport", "poolcoveragerecord"] },
  { app: "devthink", file: "popup.ts", domain: "os", symbols: ["v1sunsetbannercard", "migrationpromptcard", "renderv1sunsetbanner", "rendermigrationpromptbanner"] },
  { app: "devthink", file: "prismaconfig.ts", domain: "os", symbols: [] },
  { app: "devthink", file: "progress.ts", domain: "os", symbols: ["provenancestamp", "provenancestampof", "progressnow", "recordoutcomewithclock", "emptyprogress", "recordstep", "recordoutcome", "recordenvironment"] },
  { app: "devthink", file: "protocol.ts", domain: "os", symbols: ["parseproposal", "workflowproposal", "workflowstepoutcome", "parseworkflowproposal", "workflowoutcome", "requestbody", "consensusreport", "parsespawnrequest"] },
  { app: "devthink", file: "pythonscripts.ts", domain: "os", symbols: ["pythonreason", "pythonresult", "pythonanswer", "pythonoptions", "PYTHON_DEFAULTS", "pythonrunner", "jsonanswer", "pythonargv"] },
  { app: "devthink", file: "queue.ts", domain: "os", symbols: ["QueueCancelledError", "QueueTask", "QueueHandle", "RequestQueue", "createRequestQueue", "RetryConfig", "RETRY_DEFAULTS", "RetryableError"] },
  { app: "devthink", file: "recentapps.ts", domain: "os", symbols: ["RecentEntry", "loadrecentapps", "loadrecententries", "pushrecentapp"] },
  { app: "devthink", file: "recipes.ts", domain: "os", symbols: ["recipecheck", "recipeentry", "recipereport", "runrecipessuite", "gallerydriftof", "reciperecord"] },
  { app: "devthink", file: "records.ts", domain: "os", symbols: ["recordsummary", "renderrecord", "syncrecord", "summaryproblemsof", "syncmode"] },
  { app: "devthink", file: "release.ts", domain: "os", symbols: ["releasepublishpat"] },
  { app: "devthink", file: "reveal.ts", domain: "os", symbols: ["initReveal", "useReveal", "observeReveals"] },
  { app: "devthink", file: "run.ts", domain: "os", symbols: ["openrun", "beatrun", "closerun", "reattachrun", "recordurl", "recordenvironment", "recordturnaround", "markpending"] },
  { app: "devthink", file: "runner.ts", domain: "os", symbols: ["catalogbase", "hostIsAllowed", "queuebinarylaunch", "queuestudiorender"] },
  { app: "devthink", file: "runtime.ts", domain: "os", symbols: ["adaptermodeof", "clockadapterof", "loggeradapterof", "fetchadapterof", "defaultclock", "defaultlogger", "defaultfetch", "platformadapterof"] },
  { app: "devthink", file: "saascontent.ts", domain: "os", symbols: ["saasnavrow", "saaschrome", "saasheadertabs", "saasrailstops", "saasherocards", "saascreatorsintro", "saasswingcard", "saasswingcards"] },
  { app: "devthink", file: "saddlefaces.ts", domain: "os", symbols: [] },
  { app: "devthink", file: "sandboxlane.ts", domain: "os", symbols: ["SandboxError", "SandboxRow", "SandboxAnswer", "runsandboxline", "createsandboxsession", "listsandboxtree", "writesandboxfile", "hostmodalityreport"] },
  { app: "devthink", file: "schemaaudit.ts", domain: "os", symbols: [] },
  { app: "devthink", file: "scripts.ts", domain: "os", symbols: [] },
  { app: "devthink", file: "security.ts", domain: "os", symbols: ["denydefaultposture", "exactorigin", "wildcardentry", "allowlistcheck", "originprofileof", "profilekind", "profilegrade", "sensitiveclassesof"] },
  { app: "devthink", file: "serve.ts", domain: "os", symbols: ["jsonrpcmessage", "encodemessage", "decodemessage", "framesof", "batchof", "isnotification", "notificationframe", "errorwithretry"] },
  { app: "devthink", file: "server.ts", domain: "os", symbols: ["ServerOptions", "ServerHandle", "startServer"] },
  { app: "devthink", file: "session.ts", domain: "os", symbols: ["sessionkinds", "sessionfileversion", "snapshotsections", "searchfields", "taskstatechecksum", "taskstateof", "taskstatevalid", "sessiontabof"] },
  { app: "devthink", file: "shellterminal.ts", domain: "os", symbols: ["ControlShellTerminalProps", "ControlShellTerminal"] },
  { app: "devthink", file: "sidepanel.ts", domain: "os", symbols: [] },
  { app: "devthink", file: "soak.ts", domain: "os", symbols: ["runsoaksuite", "soakreport", "soakrecord"] },
  { app: "devthink", file: "storage.ts", domain: "os", symbols: ["StoredWorkspace", "StoredTab", "StoredMessage", "StoredSession", "StoredPreference", "mirrorSession", "readPreferences", "savePreference"] },
  { app: "devthink", file: "swarm.ts", domain: "os", symbols: ["electleader", "assignwork", "collectresults", "scaleworkers", "plannersplit", "reportstep", "requestreview", "ackreview"] },
  { app: "devthink", file: "sweep.ts", domain: "os", symbols: ["runsweepsuite", "sweepreport", "sweeprecord"] },
  { app: "devthink", file: "telemetryfree.ts", domain: "os", symbols: ["runtelemetryfreesuite", "telemetryfreereport", "telemetryfreerecord"] },
  { app: "devthink", file: "tools.ts", domain: "os", symbols: ["toolcatalogversion", "toolnamespaces", "domainkinds", "toolschemaof", "openapilayout", "buildtoolcatalog", "alltools", "toolname"] },
  { app: "devthink", file: "transparencypage.ts", domain: "os", symbols: [] },
  { app: "devthink", file: "types.ts", domain: "os", symbols: ["protocolversion", "protocolmajorversion", "pinnedprotocolversion", "actionkind", "actionkindids", "actionrisk", "planstate", "auditkind", "datainventory", "purgepolicy", "syncsettings", "syncrecord", "cookiejarrecord", "cleanupschedule", "localrule", "telemetrypolicy", "exportallbundle", "observationmode", "toolstep", "agentplan", "agentsession", "endpointconfig", "observation", "auditevent", "diagnosticreport", "capabilityreport", "stepoutcome", "runsettings", "proposalrequest", "planproposal", "policyevaluation", "planprogress", "targetmode", "targetref", "pointref", "pointpath", "speedprofile", "keyholdstate", "dialogpolicy", "framepath", "shadowpath", "retryrule", "mapentry", "clickablemap", "resolvedtarget", "dialogdecision", "retryoutcome", "resolutionsummary", "a11ynode", "readerarticle", "listpattern", "tableshape", "jsonstate", "mutationwatch", "quietrule", "mutationevent", "focusevent", "bannerreport", "diffentry", "snapshotdiff", "selectorcandidate", "derivedselector", "watchregistration", "observationrecord", "a11ycapture", "readercapture", "pagesignals", "templateprofile", "navtarget", "waitoverride", "waitprofile", "urlpattern", "redirecthop", "redirectchain", "trailentry", "ratelimit", "navstate", "waitprofilerecord", "navrecord", "navintentrecord", "ratelimitstate", "curatedlink", "curatedlist", "authrecord", "safetyverdict", "artifactrecord", "navcontrol", "recenttab", "navqueues", "prefetchplan", "preconnecttarget", "deeplinkpattern", "closedtabrecord", "navtrailentry", "ratelimitwindow", "linkbatch", "navpause", "dedupekey", "sourcestamprecord", "extractrow", "streamcursor", "extractbatch", "gridcolumn", "provlogentry", "samplepolicy", "dedupereport", "streamfilerecord", "extractpipeline", "longpollrequest", "graphqlsubscription", "multipartfield", "correlatedrequest", "correlationcontext", "ratelimitdirective", "cacheentry", "apicallrecord", "ocrregion", "ocrword", "ocrline", "ocrresult", "visionrequest", "visionlabeledregion", "visiondescription", "redactionmask", "screenshotpair", "groundingmatch", "groundingresult", "framereference", "visioncacheentry", "beforeafterpair", "consoletraceentry", "nettraceentry", "diffbaserecord", "diffresult", "thumbnailrecord", "timelapseconfig", "timelapseframe", "capturenamerule", "capturebundle", "tabquery", "tabgroupspec", "tabgrouprecord", "windowbounds", "windowstate", "layouttab", "tablayout", "tabmeta", "tabbadge", "tabreportentry", "tabreport", "sessionsnapshot", "closedtab", "tabwatchevent", "controltabstate", "fieldkind", "fieldmatch", "formentry", "formrecord", "valuegen", "formprofile", "wizardstate", "submitticket", "fielderror", "errorreport", "captchahandoff", "detectionrecord", "typeaheadpick", "formreport", "columnspec", "datasetrow", "sourceref", "dataset", "transformrule", "extractsession", "provenancerecord", "exportedartifact", "streamstate", "sheetendpoint", "taskrules", "downloadspec", "downloadstate", "downloadrecord", "mimefilter", "netlogrecord", "clipentry", "scanverdict", "quarantineentry", "capturename", "cleanuprule", "clipboardconsentrecord", "scanhookconfig", "capturecounter", "artifactinventoryentry", "cleanuprun", "captureformat", "captureexport", "capturepolicy", "captureoptions", "regionrect", "stitchplan", "sheetlayout", "capturenaming", "shotrecord", "shotpair", "pdfrecord", "pdfoptions", "recordingrecord", "recordingoptions", "framerecord", "imagedescriptor", "imagefilter", "canvasrecord", "streamrecord", "mediadatum", "assetrecord", "lapseplan", "convertdirective", "thumbdirective", "imagebatch", "recordingconsentrecord", "mediarecord", "fetchrequest", "fetchoptions", "streamwindow", "jsonpathrule", "parsedfield", "htmlquery", "payloadfield", "payloadschema", "endpointrecord", "graphqlrequest", "fetchconsent", "callrecord", "channelstate", "channelrecord", "socketoptions", "messageenvelope", "messagefilter", "exchangerecord", "responseentry", "headerfilter", "bodyfilter", "eventsubscription", "pollcursor", "apimapentry", "apireplayspec", "bodyrecord", "blockrule", "mockspec", "headerule", "cookierecord", "cookieoperation", "oauthflow", "tokenrecord", "apikeyentry", "proxyroute", "ratelimitread", "formpayload", "multipartpayload", "revocationrule", "loglevel", "timelinesource", "timelineentry", "consoleentry", "stackframe", "errorrecord", "rejectionrecord", "netfailureentry", "longtaskentry", "spamrule", "loglevelset", "rotationrule", "consoleline", "consolediff", "consoleconsentrecord", "rotationtargetrecord", "levelsummary", "cdpsession", "cdpcommand", "cdpeventrule", "breakpointspec", "pausestate", "stepmode", "watchexpression", "scriptoverride", "cdpallowlist", "debuggergrant", "teardownplan", "flowmetric", "flowspec", "heaprecord", "growsample", "cpuprofile", "shiftentry", "traceannotation", "tracerecord", "attachtarget", "sourcemapref", "memorytrend", "sourcemapconsent", "devicepreset", "networkpreset", "locationpreset", "agentpreset", "permissiongrant", "permissionstate", "blackboxrule", "emulationfamily", "emulationlayer", "emulationstate", "locationconsent", "permissionoverriderecord", "presetlibrary", "taskstate", "sessionevent", "sessiontab", "sessionrecord", "snapshotscope", "snapshotplan", "restoreplan", "autointerval", "sessionfolder", "sessionchange", "sessiondiff", "searchfield", "searchquery", "sessionmatch", "sessionfile", "workflowprovenance", "autosnapshotstate", "workflowrecord", "workflowstep", "workflowblock", "blockinvocation", "steptemplate", "variablekind", "variablevalue", "variablescope", "variablebinding", "expressionoperand", "expressionoperator", "expressiontype", "regexrule", "delaystep", "waitstep", "runstate", "workflowrun", "runlogentry", "conditionstep", "branchpath", "branchstep", "loopstep", "repeatuntilstep", "whilestep", "foreachstep", "parallelbranch", "joinstep", "parallelstep", "retrypolicy", "errorhandler", "timeoutpolicy", "trystep", "loopcounter", "branchoutcome", "retryattempt", "timeoutabort", "joinrecord", "paralleloutcome", "controlflowdecision", "triggerfamily", "triggerule", "webhookfield", "triggerstate", "rulestats", "triggerfire", "manualrun", "editornode", "editoredge", "editorlayout", "minimapstate", "editormodel", "palettecategory", "palettenode", "steplibraryentry", "workflowversion", "versiondiff", "runhistoryentry", "exportformat", "workflowfile", "nestedparam", "workflowimport", "siteoverride", "watchdogconfig", "watchdogrecord", "toolnamespace", "transportkind", "serverstate", "rpcerrorcode", "rpcerror", "jsonrpcframe", "toolschemaproperty", "toolschema", "consentmeta", "tooldef", "tooldomain", "toolcatalog", "toolresult", "capabilityset", "clientrecord", "methodentry", "mcpserverconfig", "mcpserverstate", "stdiobridge", "bridgelaunch", "nativecallclass", "nativesurfacekind", "nativehoststate", "nativeerror", "nativecallrecord", "nativekillswitch", "companionhandshake", "wsbridgesession", "nativeframe", "toolcallrecord", "tokenhash", "pairingstate", "approvalstate", "tlsmode", "authmethod", "tlsconfig", "httpstreamconfig", "clientidentity", "sessiontoken", "pairingcode", "allowlistentry", "approvalrequest", "approvalexec", "authchallenge", "authhandshakeevent", "approvaltimeout", "remoteconfig", "streamchannel", "eventkind", "protocoleventsubscription", "resourcewatch", "samplingrequest", "promptdef", "streamchunk", "progressnotice", "cancelframe", "callratelimit", "retryhint", "structurederror", "idempotencykey", "idempotencyrecord", "batchmember", "batchcall", "batchoutcome", "tooldryrun", "toolmock", "callcontext", "servetransport", "clientbinding", "servedresource", "servehealth", "agentstate", "agentrole", "agentidentity", "taskstatekind", "taskitem", "claimrecord", "queuecompletionpolicy", "taskqueue", "messagerouting", "agentmessage", "agentmailbox", "blackboardsection", "blackboardvaluekind", "blackboardentry", "blackboard", "agentbudget", "agentscope", "agentrecord", "budgetstate", "spawnrequest", "depthlimit", "killswitch", "spawnrecord", "agentusage", "agenteventkind", "agentevent", "swarmstate", "reviewverdict", "leaderworker", "workerassignment", "criticreview", "verifieroutcome", "verifiercheck", "plannerexecutor", "executorreport", "handoffstate", "handoffrequest", "handoffrecord", "lockkind", "resourcelock", "conflictwriter", "conflictscan", "mergerule", "mergeentry", "reportsection", "resultreport", "boardmilestone", "boardlane", "progressboard", "reviewrequeststate", "reviewrequest", "reviewrecord", "escalationrecord", "arbitrationstrategy", "arbitrationrule"] },
  { app: "devthink", file: "uistore.ts", domain: "os", symbols: ["uistoreseedrows", "uicopyrow", "loaduicopy", "uicopy", "useUicopy", "uistoreget", "uistorelist", "uistoreupsert"] },
  { app: "devthink", file: "umd.ts", domain: "os", symbols: [] },
  { app: "devthink", file: "umdwrap.ts", domain: "os", symbols: ["umdwrap"] },
  { app: "devthink", file: "useismobile.ts", domain: "os", symbols: ["WindowBodySurface", "useContainerWidth", "useIsMobile"] },
  { app: "devthink", file: "usestoredstate.ts", domain: "os", symbols: ["Validator", "useStoredState", "refocus", "isString", "isNumber", "arrayOf", "isObjectWith", "useStoredFlag"] },
  { app: "devthink", file: "version.ts", domain: "os", symbols: ["packageversion", "protocolmajor", "protocolfloormajor"] },
  { app: "devthink", file: "views.ts", domain: "os", symbols: ["surfacepalette", "palettecommandsof", "palettequery", "paletteuseafter", "taskinputof", "taskhistoryafter", "onboardingsteps", "onboardingstart"] },
  { app: "devthink", file: "vite.config.ts", domain: "os", symbols: [] },
  { app: "devthink", file: "vitest.config.ts", domain: "os", symbols: [] },
  { app: "devthink", file: "wcag.ts", domain: "os", symbols: ["runwcagsuite", "wcagreport", "wcagrecord"] },
  { app: "devthink", file: "window.ts", domain: "os", symbols: ["WindowEntry", "WINDOW_ANCHORS", "FAMILY_SLUGS", "familyentries", "windowcatalog", "WindowSpawn", "windowspawn", "windowapp"] },
  { app: "devthink", file: "workflow.ts", domain: "os", symbols: ["workflowkinds", "stepexecution", "workflowstepof", "blockinvocationof", "workflowblockof", "steptemplateof", "expressionoperators", "expressionof"] },
  { app: "devthink", file: "workspace.ts", domain: "os", symbols: ["workspaceDestinations", "WorkspaceDestination", "isWorkspaceDestination", "workspaceDestination"] },

  /* ===== APP: forge — domain: runner (job fleet runner and run streams) ===== */

  { app: "forge", file: "api.ts", domain: "runner", symbols: [] },
  { app: "forge", file: "capacitor.config.ts", domain: "runner", symbols: [] },
  { app: "forge", file: "cli.ts", domain: "runner", symbols: ["main"] },
  { app: "forge", file: "db.ts", domain: "runner", symbols: ["Runner", "RunEntry", "OnboardingStateRow", "LabelRow", "runners", "runnerRuns", "addRunner", "logRun"] },
  { app: "forge", file: "drizzle.config.ts", domain: "runner", symbols: [] },
  { app: "forge", file: "family.ts", domain: "runner", symbols: ["FAMILY_SLUGS", "FamilyMember", "FAMILY_ACCENTS", "familyAccentOf", "familyrow", "familyurl"] },
  { app: "forge", file: "fleet.ts", domain: "runner", symbols: ["RUNNER_MODES", "RunnerState", "RUNNER_STATES", "RunnerHealth", "HEALTH_LADDER", "Runner", "HealthRung", "RED_FAILURE_RATE"] },
  { app: "forge", file: "graphplan.ts", domain: "runner", symbols: ["planstate", "PLAN_STATES", "planstepkind", "planstep", "planwire", "runplan", "plannode", "planedge"] },
  { app: "forge", file: "hometypes.ts", domain: "runner", symbols: ["HomeProps"] },
  { app: "forge", file: "labels.ts", domain: "runner", symbols: ["LABEL_REVISION", "LABEL_MANIFEST", "LabelKey", "label", "labelfill", "seedLabels"] },
  { app: "forge", file: "onboardingstate.ts", domain: "runner", symbols: ["OnboardingSnapshot", "readOnboardingState", "loadOnboardingState", "markIntroSeen", "markOnboardingSeen"] },
  { app: "forge", file: "queue.ts", domain: "runner", symbols: ["QueuePriority", "QUEUE_PRIORITIES", "PRIORITY_RANK", "QueueItem", "queueOrder", "enqueue", "cancel", "dequeue"] },
  { app: "forge", file: "runner.ts", domain: "runner", symbols: [] },
  { app: "forge", file: "runstream.ts", domain: "runner", symbols: ["LogLevel", "LogLine", "RunOutcome", "runLogLines", "logOutcome", "linesWithin", "logDuration", "formatLogTime"] },
  { app: "forge", file: "sandboxmodality.ts", domain: "runner", symbols: ["AppWorkloadLane", "APPSLUG", "WORKLOADLANES", "SANDBOXLANEENV", "LaneSeatResult", "lanesandbox", "lanesandboxfromenv", "laneof"] },
  { app: "forge", file: "theme.ts", domain: "runner", symbols: ["Theme", "currentTheme", "applyTheme", "initTheme", "toggleTheme"] },
  { app: "forge", file: "utils.ts", domain: "runner", symbols: [] },
  { app: "forge", file: "vite.config.ts", domain: "runner", symbols: [] },
  { app: "forge", file: "vitest.config.ts", domain: "runner", symbols: [] },

  /* ===== APP: foundry — domain: pipeline (build pipeline, artifacts, readiness) ===== */

  { app: "foundry", file: "api.ts", domain: "pipeline", symbols: [] },
  { app: "foundry", file: "bundlescan.ts", domain: "pipeline", symbols: ["stripstrings", "platformnames", "wireformatnames", "gatewaywirefields", "maeneconfigfields", "underscorednames"] },
  { app: "foundry", file: "capacitor.config.ts", domain: "pipeline", symbols: [] },
  { app: "foundry", file: "cli.ts", domain: "pipeline", symbols: ["main"] },
  { app: "foundry", file: "db.ts", domain: "pipeline", symbols: ["tables", "db", "ensureSchema", "OnboardingStateRow", "OnboardingFlags", "getOnboardingState", "setOnboardingStage", "LabelRow"] },
  { app: "foundry", file: "dependencyupdates.ts", domain: "pipeline", symbols: [] },
  { app: "foundry", file: "drizzle.config.ts", domain: "pipeline", symbols: [] },
  { app: "foundry", file: "family.ts", domain: "pipeline", symbols: ["FAMILY_SLUGS", "FamilyMember", "FAMILY_ACCENTS", "familyAccentOf", "familyrow"] },
  { app: "foundry", file: "familyurl.ts", domain: "pipeline", symbols: ["familyurl"] },
  { app: "foundry", file: "hometypes.ts", domain: "pipeline", symbols: ["HomeProps"] },
  { app: "foundry", file: "labels.ts", domain: "pipeline", symbols: ["LABEL_REVISION", "LABEL_MANIFEST", "LabelKey", "label", "labelfill", "seedLabels"] },
  { app: "foundry", file: "npmgate.ts", domain: "pipeline", symbols: [] },
  { app: "foundry", file: "onboardingstate.ts", domain: "pipeline", symbols: ["OnboardingSnapshot", "readOnboardingState", "loadOnboardingState", "markIntroSeen", "markOnboardingSeen"] },
  { app: "foundry", file: "pipeline.ts", domain: "pipeline", symbols: ["utf8Bytes", "fnv1a", "Artifact", "sealArtifact", "manifest", "mulberry32", "planstate", "planstep", "runplan", "ImageFormat", "FORMATS", "convertPlan", "Sandbox", "drive", "seedHerd", "APPSLUG", "WORKLOADLANES", "lanesandbox"] },
  { app: "foundry", file: "readiness.ts", domain: "pipeline", symbols: ["readinessreport", "runreadinesssuite", "readinessrecord"] },
  { app: "foundry", file: "utils.ts", domain: "pipeline", symbols: [] },
  { app: "foundry", file: "vite.config.ts", domain: "pipeline", symbols: [] },
  { app: "foundry", file: "vitest.config.ts", domain: "pipeline", symbols: [] },

  /* ===== APP: getry — domain: aigateway (LLM gateway, providers, sessions) ===== */

  { app: "getry", file: "accounts.ts", domain: "aigateway", symbols: ["GEMINI_CLI_CLIENT_ID_RAW", "ANTIGRAVITY_CLI_OAUTH_CLIENT_ID", "ANTIGRAVITY_CLI_OAUTH_CLIENT_SECRET", "OAuthClientConfig", "OAuthClientKey", "AccountMetadataV3", "AccountStore", "RotationStrategy"] },
  { app: "getry", file: "antigravity.ts", domain: "aigateway", symbols: ["PluginOptions", "PLUGIN_ID", "VERSION", "notifyUser", "AntigravityPlugin", "getPlugin", "plugin", "detectOpencodeProviderId"] },
  { app: "getry", file: "auth.ts", domain: "aigateway", symbols: ["extracttoken", "extractchatid", "extractsessionid", "extractrequestid", "validatetoken", "masktoken", "resolvekeys", "buildauthheaders"] },
  { app: "getry", file: "capacitor.config.ts", domain: "aigateway", symbols: [] },
  { app: "getry", file: "cli.ts", domain: "aigateway", symbols: ["runclifamily"] },
  { app: "getry", file: "constants.ts", domain: "aigateway", symbols: ["ANTIGRAVITY_VERSION_FALLBACK", "ANTIGRAVITY_VERSION_MIN_SUPPORTED", "ANTIGRAVITY_BLOCKED_VERSIONS", "ANTIGRAVITY_VERSION_REMOTE_URLS", "VERSION_FETCH_TIMEOUT_MS", "ANTIGRAVITY_USER_AGENT_FALLBACK", "ANTIGRAVITY_USER_AGENT"] },
  { app: "getry", file: "db.ts", domain: "aigateway", symbols: ["ChatMessageRow", "ApiKeyRow", "TownKeyRow", "maskkey", "KEYSEED", "MESSAGESEED", "listkeys", "listmessages"] },
  { app: "getry", file: "debonairlane.ts", domain: "aigateway", symbols: ["DebonairMountVerdict", "DEBONAIR_APP", "DebonairGatewayRequest", "DebonairBlobPointer", "DebonairBlobStream", "DebonairGatewayAnswer", "DebonairDispatch", "debonairrequest"] },
  { app: "getry", file: "drizzle.config.ts", domain: "aigateway", symbols: [] },
  { app: "getry", file: "engine.ts", domain: "aigateway", symbols: ["createversion", "engineinternals"] },
  { app: "getry", file: "family.ts", domain: "aigateway", symbols: ["FAMILY_SLUGS", "FamilyMember", "FAMILY_ACCENTS", "familyrow"] },
  { app: "getry", file: "familyurl.ts", domain: "aigateway", symbols: ["familyurl"] },
  { app: "getry", file: "fingerprint.ts", domain: "aigateway", symbols: ["PlatformOS", "PlatformArch", "FingerprintType", "HeaderStyle", "OsName", "ArchName", "PlatformProfile", "PlatformPool"] },
  { app: "getry", file: "gateway.ts", domain: "aigateway", symbols: ["GATEWAYROUTES", "GatewayRoute", "GatewayBadge", "GatewayVersion", "GATEWAYVERSIONS", "PARSERSTEPS", "listversions", "findversion"] },
  { app: "getry", file: "gatewaycheck.ts", domain: "aigateway", symbols: ["gatewaysmokeseat", "gatewayprobeseat"] },
  { app: "getry", file: "honoshim.ts", domain: "aigateway", symbols: ["serve", "serveStatic"] },
  { app: "getry", file: "intelligence.ts", domain: "aigateway", symbols: ["provenancechunkinput", "provenanceinput", "provenancerecord", "provenance", "mergeprovenance", "estimatetokens", "fitscontext", "tokenbudget"] },
  { app: "getry", file: "json.ts", domain: "aigateway", symbols: ["extractjsonobject", "VerdictObject", "validateverdict", "decisionerrorcode", "decisionerror", "DecisionKind", "DecisionPolicy", "DecisionRequest"] },
  { app: "getry", file: "labels.ts", domain: "aigateway", symbols: ["LABEL_REVISION", "LABEL_MANIFEST", "LabelKey", "label", "labelfill", "seedLabels"] },
  { app: "getry", file: "llm.ts", domain: "aigateway", symbols: ["defaultrefusalmarkers", "shapedrequest", "modelusage", "buildrequest", "parsecompletion", "islocalorigin", "callmodel", "calllocal"] },
  { app: "getry", file: "models.ts", domain: "aigateway", symbols: ["GEMINI_36_MODELS", "GEMINI_36_MODEL_DEFINITIONS", "GEMINI_35_MODELS", "GEMINI_35_MODEL_DEFINITIONS", "GEMINI_31_MODELS", "GEMINI_31_MODEL_DEFINITIONS", "GEMINI_3_MODELS", "GEMINI_3_MODEL_DEFINITIONS"] },
  { app: "getry", file: "nodeshim.ts", domain: "aigateway", symbols: ["EOL", "arch", "platform", "release", "type", "hostname", "homedir", "tmpdir"] },
  { app: "getry", file: "oauth.ts", domain: "aigateway", symbols: ["CLIENT_ID", "CLIENT_SECRET", "ANTIGRAVITY_CLI_CLIENT_ID", "ANTIGRAVITY_CLI_CLIENT_SECRET", "ANTIGRAVITY_CLI_CLIENT_SECRET_ALTERNATIVE", "ANTIGRAVITY_CLI_OAUTH_SCOPES", "ANTIGRAVITY_CLI_OAUTH_SCOPES_STR"] },
  { app: "getry", file: "onboardingstate.ts", domain: "aigateway", symbols: ["VisitorOnboarding", "OnboardingStage", "hostallowed", "mergeStage", "readOnboardingState", "loadOnboardingState", "markIntroSeen", "markOnboardingSeen"] },
  { app: "getry", file: "prismaconfig.ts", domain: "aigateway", symbols: [] },
  { app: "getry", file: "prismashim.ts", domain: "aigateway", symbols: ["PrismaClient"] },
  { app: "getry", file: "project.ts", domain: "aigateway", symbols: ["GOOGLE_API_NODE_VERSION", "ENDPOINT_BASES", "EndpointName", "EndpointDef", "CODE_ASSIST_PATHS", "IdeType", "CodeAssistMetadata", "LoadCodeAssistResponse"] },
  { app: "getry", file: "providers.ts", domain: "aigateway", symbols: ["ProviderProtocol", "retryDelay", "redactProviderError", "ChatRole", "ChatMessage", "ChatRequest", "ModelInfo", "PROVIDERS"] },
  { app: "getry", file: "quota.ts", domain: "aigateway", symbols: ["QUOTA_ENDPOINTS", "QuotaSource", "GEMINI_CLI_USER_AGENT_ANTIGRAVITY", "CLIENT_METADATA_ANTIGRAVITY", "QUOTA_REFRESH_INTERVAL_MINUTES_DEFAULT", "QUOTA_REFRESH_INTERVAL_MS_DEFAULT", "QUOTA_SOFT_REMAINING"] },
  { app: "getry", file: "recovery.ts", domain: "aigateway", symbols: ["X_CLIENT_METADATA_RAW", "Role", "ThinkingBlock", "TextBlock", "ToolUseBlock", "ToolResultBlock", "ContentBlock", "ChatMessage"] },
  { app: "getry", file: "registernvidiakeys.ts", domain: "aigateway", symbols: [] },
  { app: "getry", file: "request.ts", domain: "aigateway", symbols: ["TOOL_NAME_MAX_LENGTH", "TOOL_NAME_MIN_LENGTH", "THINKING_LEVEL_TO_BUDGET_GEMINI", "THINKING_LEVEL_TO_BUDGET_CLAUDE", "THINKING_BUDGET_MAX", "THINKING_BUDGET_MIN", "OpenCodeTool", "TransformRequestInput"] },
  { app: "getry", file: "reveal.ts", domain: "aigateway", symbols: ["observeReveals"] },
  { app: "getry", file: "routerotation.ts", domain: "aigateway", symbols: ["ModelRoute", "CooldownEntry", "RotationLedger", "RotationOptions", "ROTATIONDEFAULTS", "newledger", "healthyroutes", "pickroute"] },
  { app: "getry", file: "sandboxmodality.ts", domain: "aigateway", symbols: ["AppWorkloadLane", "APPSLUG", "WORKLOADLANES", "SANDBOXLANEENV", "LaneSeatResult", "lanesandbox", "lanesandboxfromenv", "laneof"] },
  { app: "getry", file: "search.ts", domain: "aigateway", symbols: ["DEFAULT_ENDPOINT_ORDER", "SEARCH_TIMEOUT_MS", "WebGroundingChunk", "GroundingChunkWeb", "GroundingChunk", "GroundingSupportSegment", "GroundingSupport", "SearchEntryPoint"] },
  { app: "getry", file: "server.ts", domain: "aigateway", symbols: ["kams", "kasuppressms", "sseheaders", "ndjsonheaders", "writeevent", "writekeepalive", "writedone", "safeenqueue"] },
  { app: "getry", file: "sessions.ts", domain: "aigateway", symbols: ["SessionContextRow", "SESSIONSEED", "ROTATIONEVERY", "listsessions", "rotationindex", "freshestfirst", "contextshare"] },
  { app: "getry", file: "streaming.ts", domain: "aigateway", symbols: ["SSE_DONE_SENTINEL", "hashThinkingText", "sleepWithJitter", "ReplaySignatureCache", "globalThinkingSignatureCache", "ParsedSSEEvent", "SSEParserState", "createSSEParserState"] },
  { app: "getry", file: "theme.ts", domain: "aigateway", symbols: ["ThemeName", "currentTheme", "applyTheme", "toggleTheme"] },
  { app: "getry", file: "thinking.ts", domain: "aigateway", symbols: ["ThinkingLevelName", "ThinkingLevel", "DEFAULTTHINKINGLEVEL", "THINKINGLEVELS", "listlevels", "budgetof", "islevel", "formatbudget"] },
  { app: "getry", file: "typeface.ts", domain: "aigateway", symbols: [] },
  { app: "getry", file: "types.ts", domain: "aigateway", symbols: ["apikeyref", "protocolstyle", "modelmessage", "providerconfig", "modelroute", "localmodelconfig", "toolbrief", "intentkind"] },
  { app: "getry", file: "utils.ts", domain: "aigateway", symbols: ["corsheaders", "ctjson", "ctsse", "ctplain", "ctndjson", "ctoctet", "maxdurationconst", "defaultmaxtokens"] },
  { app: "getry", file: "validate.ts", domain: "aigateway", symbols: ["validateconfig"] },
  { app: "getry", file: "versionregistry.ts", domain: "aigateway", symbols: ["REMOTE_MANIFEST_URLS", "CHANGELOG_URLS", "FALLBACK_VERSION", "FALLBACK_FULL_VERSION", "FALLBACK_ALTERNATIVE_VERSION", "FALLBACK_ALTERNATIVE_FULL", "VERSION_CACHE_TTL_MS"] },
  { app: "getry", file: "vite.config.ts", domain: "aigateway", symbols: [] },
  { app: "getry", file: "vitest.config.ts", domain: "aigateway", symbols: [] },

  /* ===== APP: saddle — domain: virtualization (the sandbox engine) ===== */

  { app: "saddle", file: "alternatives.ts", domain: "virtualization", symbols: ["SandboxSpec", "SandboxHandle", "ExecResult", "SnapshotRef", "SandboxMetrics", "SandboxCapabilities", "SandboxEngine", "SandboxEngineError"] },
  { app: "saddle", file: "api.ts", domain: "virtualization", symbols: ["ApiErrorBody", "HealthStatus", "SandboxSpecPayload", "SandboxCreated", "ExecResult", "ApiSession", "apibase", "iscrossorigin"] },
  { app: "saddle", file: "auth.ts", domain: "virtualization", symbols: ["SessionContext", "SessionMaterial", "ForwardedSession", "SessionUser", "ValidationOk", "ValidationError", "ValidationOutcome", "RateBucket"] },
  { app: "saddle", file: "browser.ts", domain: "virtualization", symbols: ["fingerprintprofile", "fingerprintvalidate", "fingerprintfor", "browsersession", "browseractions", "actionresult", "actionfailure", "actionbatch"] },
  { app: "saddle", file: "capacitor.config.ts", domain: "virtualization", symbols: [] },
  { app: "saddle", file: "catalog.ts", domain: "virtualization", symbols: ["MediaSlot", "AgentSessionEvent", "AgentSession", "mediaSlots", "agentsessions"] },
  { app: "saddle", file: "cli.ts", domain: "virtualization", symbols: ["main"] },
  { app: "saddle", file: "communication.ts", domain: "virtualization", symbols: ["controlresources", "controloperations", "controlsurface", "authorize", "apiversion", "requestcontext", "successpayload", "errorpayload"] },
  { app: "saddle", file: "compute.ts", domain: "virtualization", symbols: ["wittype", "witparam", "witfunction", "witinterface", "witworld", "wittotypescript", "witworldhash", "wasicall"] },
  { app: "saddle", file: "containerarch.ts", domain: "virtualization", symbols: ["CONTAINERARCHIDS", "containerarchfamily", "containerarchrow", "CONTAINERBASEIMAGE", "CONTAINERARCHES", "getcontainerarch", "containerarcherror", "resolvecontainerarch"] },
  { app: "saddle", file: "dashboardlib.ts", domain: "virtualization", symbols: ["ApiResult", "LocalSandbox", "SessionUser", "localsandboxkey", "apiresult", "errormessage", "pick", "asarray"] },
  { app: "saddle", file: "db.ts", domain: "virtualization", symbols: ["UserRow", "SessionRow", "NodeRow", "SandboxRow", "SandboxFileRow", "SandboxFileDoc", "WorkspaceUsage", "EventRow"] },
  { app: "saddle", file: "distribution.ts", domain: "virtualization", symbols: ["binarytargets", "portablebinaryplan", "binarymanifest", "buildbinary", "archivelimits", "archiveinspection", "extractarchive", "magicbytes"] },
  { app: "saddle", file: "drizzle.config.ts", domain: "virtualization", symbols: ["drizzleconfig"] },
  { app: "saddle", file: "edgelandes.ts", domain: "virtualization", symbols: ["EdgeLaneArtifact", "EdgeLaneOutput", "EdgeLaneExecutor", "EdgeLaneError", "edgelaneerror", "probehostbinary", "probedocker", "probewasm"] },
  { app: "saddle", file: "edgeplane.ts", domain: "virtualization", symbols: ["EdgeRequest", "EdgeLaneReport", "EdgeRunResult", "EdgeStorageAdapter", "edgelanes", "edgelandesreport", "assertvisitorfree", "runonedge"] },
  { app: "saddle", file: "engineplans.ts", domain: "virtualization", symbols: ["EngineProfileId", "EnginePlanProfile", "ENGINEPLANS", "DEFAULTENGINEPROFILE", "EngineLimitsLaw", "ENGINELIMITS", "PlanEnvelope", "planenvelope", "planfits", "getengineplan", "selectengineplan", "engineplansreport"] },
  { app: "saddle", file: "execution.ts", domain: "virtualization", symbols: ["inprocess", "runnerhealth", "runnerhealthall", "heartbeat", "providerchain", "selectprovider", "artifacthandoff", "cancellationplan"] },
  { app: "saddle", file: "family.ts", domain: "virtualization", symbols: ["FAMILY_SLUGS", "FamilyMember", "FAMILY_ACCENTS", "familyrow"] },
  { app: "saddle", file: "familyurl.ts", domain: "virtualization", symbols: ["familyurl"] },
  { app: "saddle", file: "format.ts", domain: "virtualization", symbols: ["formatissues", "runformatcheck"] },
  { app: "saddle", file: "foundation.ts", domain: "virtualization", symbols: ["errorcodes", "saddleerror", "validationerror", "artifactnotfound", "runnerunavailable", "aserror", "errorcatalog", "operationerror"] },
  { app: "saddle", file: "index.ts", domain: "virtualization", symbols: ["engineversions", "engineversionkey", "enginelimits", "engineruntime", "enginestate", "enginespec", "engineendpoint"] },
  { app: "saddle", file: "integration.ts", domain: "virtualization", symbols: ["transport", "socketadapter", "githubadapter", "gitlabadapter", "forgeadapter", "forgejoadapter", "giteaadapter", "codebergadapter"] },
  { app: "saddle", file: "isolation.ts", domain: "virtualization", symbols: ["executionrequest", "executiondecision", "executionhandoff", "internalenvelope", "internalapi"] },
  { app: "saddle", file: "labels.ts", domain: "virtualization", symbols: ["LABEL_REVISION", "labelmanifest", "LabelKey", "label", "labelfill", "seedlabels"] },
  { app: "saddle", file: "localauth.ts", domain: "virtualization", symbols: ["LocalAccountRole", "LocalAccountRecord", "LocalSession", "AccountsBackupPayload", "adminusers", "localaccountnames", "exportaccounts", "importaccounts"] },
  { app: "saddle", file: "mesh.ts", domain: "virtualization", symbols: ["NodeRole", "MeshVerdict", "MeshEnvelope", "MeshMessage", "MainResponse", "HeartbeatSelf", "role", "meshsecret"] },
  { app: "saddle", file: "modalities.ts", domain: "virtualization", symbols: ["ModalityLane", "ModalityBootClass", "ResourceEnvelope", "CgroupSlice", "SpawnPlan", "ModalitySpec", "BOOTLADDER", "MODALITYPLANCOUNT", "visitorguard", "cgroupslice", "interpretyaml", "runinisolatedcontext"] },
  { app: "saddle", file: "modalityregistry.ts", domain: "virtualization", symbols: ["BootClass", "ModalityFamily", "ModalityState", "ModalityRecord", "BOOTLADDER", "MODALITYPLANCOUNT", "MODALITIES", "MODALITY_COUNT"] },
  { app: "saddle", file: "modes.ts", domain: "virtualization", symbols: ["modeprofile", "librarymode", "climode", "binarymode", "browsermode", "headlessmode", "computemode", "modeaxes"] },
  { app: "saddle", file: "onboardingstate.ts", domain: "virtualization", symbols: ["VisitorOnboarding", "OnboardingStage", "hostallowed", "mergeStage", "readOnboardingState", "loadOnboardingState", "markIntroSeen", "markOnboardingSeen"] },
  { app: "saddle", file: "orchestrator.ts", domain: "virtualization", symbols: ["orchestratordemo", "fluxkustomization", "fluxgitopsplan", "planfluxgitops"] },
  { app: "saddle", file: "osprofiles.ts", domain: "virtualization", symbols: ["OSProfileKind", "OSProfilePackage", "OSProfileRecord", "OSPROFILES", "OSPROFILECOUNT", "getosprofile", "osprofilesforarch", "osprofileswithgpu", "resolveosprofile"] },
  { app: "saddle", file: "paths.ts", domain: "virtualization", symbols: ["assetpath"] },
  { app: "saddle", file: "performance.ts", domain: "virtualization", symbols: ["LayerTarget", "LayerPatch", "PerformanceLayerId", "PerformanceLayer", "randomPort", "ompPresets", "pickOmpThreads", "llvmpipeThreads"] },
  { app: "saddle", file: "quantum.ts", domain: "virtualization", symbols: ["quantumversions", "quantumerror", "gate2x2", "hmatrix", "xmatrix", "ymatrix", "zmatrix", "smatrix"] },
  { app: "saddle", file: "render.ts", domain: "virtualization", symbols: ["renderdemo"] },
  { app: "saddle", file: "runall.ts", domain: "virtualization", symbols: [] },
  { app: "saddle", file: "runtimeprobe.ts", domain: "virtualization", symbols: [] },
  { app: "saddle", file: "sandbox.ts", domain: "virtualization", symbols: ["CpuSpec", "GpuSpec", "MigProfile", "SandboxSpec", "CpuTopology", "SandboxFile", "SandboxFs", "SandboxState"] },
  { app: "saddle", file: "scheduler.ts", domain: "virtualization", symbols: ["shardplan", "plantypecheckshards", "sharedmemorycache", "projectgraph", "miglayoutplan", "planmiglayout", "vcpuhotplug", "ramhotplug"] },
  { app: "saddle", file: "scripts.ts", domain: "virtualization", symbols: ["ScriptStep", "ScriptPlan", "ScriptRunOptions", "ScriptStepResult", "ScriptRunResult", "ScriptRunRecord", "assertservercontext", "interpretsh"] },
  { app: "saddle", file: "security.ts", domain: "virtualization", symbols: ["pqtmechanism", "rfc10024mechanisms", "rfc10024negotiator", "pqcauditentry", "pqcaudittrail", "noinfer", "policydefault", "policypreset"] },
  { app: "saddle", file: "seedcatalog.ts", domain: "virtualization", symbols: ["seedMediaSlots", "seedAgentSessions"] },
  { app: "saddle", file: "server.ts", domain: "virtualization", symbols: ["nodeserver"] },
  { app: "saddle", file: "tiers.ts", domain: "virtualization", symbols: ["tierserror", "vramtierid", "vramtier", "TIERS", "selecttier", "latencylevel", "LATENCYLADDER", "latencyfor"] },
  { app: "saddle", file: "utils.ts", domain: "virtualization", symbols: ["cn"] },
  { app: "saddle", file: "vaulthandoff.ts", domain: "virtualization", symbols: ["VaultArtifact", "VaultPut", "VaultManifest", "VaultReceipt", "VaultCounts", "FaunVerdict", "VaultSink", "VaultError"] },
  { app: "saddle", file: "virtual.ts", domain: "virtualization", symbols: ["memoryobject", "computeresult", "tobytes", "transformtocompute", "transformtostorage", "internalmemory", "externalmemory", "physicalmemory"] },
  { app: "saddle", file: "vite.config.ts", domain: "virtualization", symbols: [] },
  { app: "saddle", file: "vitest.config.ts", domain: "virtualization", symbols: [] },
  { app: "saddle", file: "vmcore.ts", domain: "virtualization", symbols: ["Rv64RunResult", "executerv64", "rv64run"] },
  { app: "saddle", file: "webserver.ts", domain: "virtualization", symbols: ["SandboxCreateBody", "SandboxSpecView", "SandboxRecord", "SandboxPublicView", "SandboxShelfRow"] },
  { app: "saddle", file: "workloadlaw.ts", domain: "virtualization", symbols: ["WorkloadDemand", "LaneToday", "WorkloadLane", "LaneVerdict", "LaneJoin", "FAMILYLANES", "CATALOGAPPS", "lanesof"] },

  /* ===== APP: stealthhead — domain: game (lobby, netcode, physics, world) ===== */

  { app: "stealthhead", file: "capacitor.config.ts", domain: "game", symbols: [] },
  { app: "stealthhead", file: "cli.ts", domain: "game", symbols: ["main"] },
  { app: "stealthhead", file: "db.ts", domain: "game", symbols: ["getlobby", "getlobbyplayers", "getranking", "getweapons", "getworldassets", "OnboardingStateRow", "getonboardingstate", "setonboardingstage"] },
  { app: "stealthhead", file: "drizzle.config.ts", domain: "game", symbols: [] },
  { app: "stealthhead", file: "family.ts", domain: "game", symbols: ["FAMILY_SLUGS", "FamilyMember", "FAMILY_ACCENTS", "familyrow"] },
  { app: "stealthhead", file: "familyurl.ts", domain: "game", symbols: ["familyurl"] },
  { app: "stealthhead", file: "hud.ts", domain: "game", symbols: ["Vitals", "VitalTier", "DamageReport", "MinimapBounds", "MinimapConfig", "MinimapPoint", "HitmarkerKind", "Hitmarker"] },
  { app: "stealthhead", file: "labels.ts", domain: "game", symbols: ["LABELREVISION", "LABELMANIFEST", "LabelKey", "label", "labelfill", "seedlabels"] },
  { app: "stealthhead", file: "match.ts", domain: "game", symbols: ["MatchRound", "MatchPlayer", "MatchLobby", "MATCHSEED", "MATCHPLAYERSEED", "listmatches", "listmatchplayers", "orderlobbies"] },
  { app: "stealthhead", file: "netcode.ts", domain: "game", symbols: ["EntityState", "Snapshot", "SnapshotDelta", "InputCmd", "Reconciliation", "JitterPacket", "JitterBuffer", "RewindBuffer"] },
  { app: "stealthhead", file: "onboardingstate.ts", domain: "game", symbols: ["VisitorOnboarding", "OnboardingStage", "hostallowed", "mergeStage", "readOnboardingState", "markOnboardingStage", "resetOnboardingMemory"] },
  { app: "stealthhead", file: "physics.ts", domain: "game", symbols: ["Vec3", "Aabb", "Sphere", "Body", "Projectile", "PhysWorld", "ProjectileStep", "Accumulator"] },
  { app: "stealthhead", file: "ranking.ts", domain: "game", symbols: ["RankingEntry", "RANKINGSEED", "listranking", "sortentries", "assignpositions", "filterbyseason", "winrate", "podium"] },
  { app: "stealthhead", file: "reveal.ts", domain: "game", symbols: ["observeReveals"] },
  { app: "stealthhead", file: "sandboxmodality.ts", domain: "game", symbols: ["AppWorkloadLane", "APPSLUG", "WORKLOADLANES", "SANDBOXLANEENV", "LaneSeatResult", "lanesandbox", "lanesandboxfromenv", "laneof"] },
  { app: "stealthhead", file: "spawner.ts", domain: "game", symbols: ["SpawnVec3", "SpawnTeam", "SpawnPoint", "DeathMark", "SpawnQuery", "SpawnPick", "SpawnerConfig", "WavePlan"] },
  { app: "stealthhead", file: "theme.ts", domain: "game", symbols: ["ThemeName", "currentTheme", "applyTheme", "toggleTheme"] },
  { app: "stealthhead", file: "vite.config.ts", domain: "game", symbols: [] },
  { app: "stealthhead", file: "vitest.config.ts", domain: "game", symbols: [] },
  { app: "stealthhead", file: "weapons.ts", domain: "game", symbols: ["WeaponKind", "Weapon", "WEAPONCATALOG", "listweapons", "dps", "kinds", "filterbykind", "handling"] },
  { app: "stealthhead", file: "world.ts", domain: "game", symbols: ["WorldAssetKind", "WorldAsset", "RenderIntent", "RENDERINTENT", "WORLDCATALOG", "ishashshape", "normalizepath", "glbpath"] },

  /* ===== APP: vault — domain: storage (objects, chunks, quotas, retention) ===== */

  { app: "vault", file: "account.ts", domain: "storage", symbols: ["PASSWORD_MIN_CHARS", "emailValid", "passwordValid", "hashPassword", "passwordMatches", "AccountLaneError", "AccountRow", "createAccount", "verifyCredentials", "issueSession", "verifySession", "vaultTokenConfigured", "createVaultServer", "listenVault"] },
  { app: "vault", file: "buckets.ts", domain: "storage", symbols: ["BucketRule", "BucketShelf", "seedRules", "ruleFor", "objectsOf", "bucketShelf", "shelfOf", "bucketsInUse"] },
  { app: "vault", file: "capacitor.config.ts", domain: "storage", symbols: [] },
  { app: "vault", file: "chunks.ts", domain: "storage", symbols: ["CHUNK_BYTES", "ChunkSlice", "split", "reassemble", "ChunkEncoding", "StoredChunk", "encodeChunk", "decodeChunk"] },
  { app: "vault", file: "cli.ts", domain: "storage", symbols: ["main"] },
  { app: "vault", file: "db.ts", domain: "storage", symbols: ["tables", "db", "ensureSchema", "OnboardingStateRow", "OnboardingFlags", "getOnboardingState", "setOnboardingStage", "LabelRow"] },
  { app: "vault", file: "decoy.ts", domain: "storage", symbols: ["decoyledger", "isprobe", "encrypteddecoy"] },
  { app: "vault", file: "drizzle.config.ts", domain: "storage", symbols: [] },
  { app: "vault", file: "drizzle.ts", domain: "storage", symbols: ["accounts", "projects", "storageObjects", "chunks", "chunkRefs", "quotas", "projectKeys", "storageTables"] },
  { app: "vault", file: "family.ts", domain: "storage", symbols: ["FAMILY_SLUGS", "FamilyMember", "FAMILY_ACCENTS", "familyAccentOf", "familyrow", "familyurl"] },
  { app: "vault", file: "hometypes.ts", domain: "storage", symbols: ["HomeProps"] },
  { app: "vault", file: "imagestore.ts", domain: "storage", symbols: ["SniffedMime", "ImageDensity", "ImageDimensions", "ImageRefusal", "ImageFacts", "IMAGE_MAX_BYTES", "sniffImageMime", "pngDimensions", "jpegDimensions", "validateImage", "standardizeImage", "putImage"] },
  { app: "vault", file: "index.ts", domain: "storage", symbols: [] },
  { app: "vault", file: "internalroot.ts", domain: "storage", symbols: ["DATABASE_FILE_EXTENSIONS", "DBFILE_REFUSAL_CODE", "databaseFileRefused", "InternalPathAnswer", "resolveInternalPath", "internalRootDir", "serveInternal"] },
  { app: "vault", file: "labels.ts", domain: "storage", symbols: ["LABEL_REVISION", "LABEL_MANIFEST", "LabelKey", "label", "labelfill", "seedLabels"] },
  { app: "vault", file: "labelstore.ts", domain: "storage", symbols: ["LabelStoreRow", "LabelRowStore", "LabelKeyOf", "LabelStore", "LabelStoreOptions", "createLabelStore"] },
  { app: "vault", file: "mimetypes.ts", domain: "storage", symbols: ["MimeTypeRow", "MIMETYPES", "MIME_FAMILIES", "MIME_TYPE_COUNT", "MIME_EXTENSION_COUNT", "MIME_ENTRY_COUNT", "mimeTypeFor", "extensionsFor"] },
  { app: "vault", file: "objectface.ts", domain: "storage", symbols: ["VaultChannel", "VaultObject", "VAULT_BUCKETS", "fnv1a", "fnv1aHex", "digestFor", "objectIdentity", "sealObject"] },
  { app: "vault", file: "objects.ts", domain: "storage", symbols: ["projectIdValid", "objectPathValid", "mimeValid", "ProjectRow", "createProject", "ProjectListRow", "ProjectPage", "listProjects"] },
  { app: "vault", file: "onboardingstate.ts", domain: "storage", symbols: ["VisitorOnboarding", "OnboardingStage", "onboardingbase", "hostallowed", "mergeStage", "readOnboardingState", "markOnboardingStage", "resetOnboardingMemory"] },
  { app: "vault", file: "pillars.ts", domain: "storage", symbols: ["PillarStatus", "PillarRow", "PILLARS", "PILLAR_COUNT", "PILLAR_KEYS", "PILLAR_GROUPS", "livePillars", "pillarOf", "pillarsByGroup", "PILLAR_ROUTE_PREFIX", "pillarRoute", "pillarRouteOf"] },
  { app: "vault", file: "protocols.ts", domain: "storage", symbols: ["ProtocolCorpusError", "ProtocolSecurity", "ProtocolRow", "parseProtocolCorpus", "PROTOCOLS", "PROTOCOL_COUNT", "PROTOCOL_ROUTE_PREFIX", "protocolRoute"] },
  { app: "vault", file: "querylane.ts", domain: "storage", symbols: ["databasesDir", "databaseFileOf", "laneOf", "closeQueryLanes", "databaseUsageOf", "QueryLaneVerdict", "queryVerdict", "QUERY_SQL_LIMIT"] },
  { app: "vault", file: "quota.ts", domain: "storage", symbols: ["quotaFloorFromMb", "QUOTA_FLOOR_BYTES", "QuotaVerdict", "quotaVerdict", "QuotaLimitParse", "quotaLimitFrom", "QuotaRow", "readQuota"] },
  { app: "vault", file: "retention.ts", domain: "storage", symbols: ["RetentionState", "RetentionVerdict", "verdictOf", "retentionVerdicts", "SweepPlan", "sweepPlan", "firstDueTick", "horizonTick"] },
  { app: "vault", file: "routes.ts", domain: "storage", symbols: ["routes"] },
  { app: "vault", file: "sandboxmodality.ts", domain: "storage", symbols: ["AppWorkloadLane", "APPSLUG", "WORKLOADLANES", "SANDBOXLANEENV", "LaneSeatResult", "lanesandbox", "lanesandboxfromenv", "laneof"] },
  { app: "vault", file: "sha.ts", domain: "storage", symbols: ["sha256Hex", "sha1Hex", "digestMatches", "isSha256Hex", "isSha1Hex"] },
  { app: "vault", file: "storage.ts", domain: "storage", symbols: ["SqlParam", "PRAGMA_BOOTSTRAP", "StorageDriverName", "StorageLaneOptions", "StorageLane", "openStorageLane"] },
  { app: "vault", file: "storageface.ts", domain: "storage", symbols: ["LfsPointer", "GitBlob", "StorageRecord", "lfsPointerText", "lfsPointerFrom", "digestValid", "storageRecordValid", "storageModeFor"] },
  { app: "vault", file: "uistore.ts", domain: "storage", symbols: ["uistoreseedrows", "uicopyrow", "loaduicopy", "uicopy", "uicopyfill", "useUicopy", "uistoreget", "uistorelist"] },
  { app: "vault", file: "utils.ts", domain: "storage", symbols: ["splitwords"] },
  { app: "vault", file: "vaultclient.ts", domain: "storage", symbols: ["vaultorigin", "vaulttokenconfigured", "vaultproject", "HealthAnswer", "UsageAnswer", "ObjectRow", "QuotaAnswer", "SweepAnswer"] },
  { app: "vault", file: "vite.config.ts", domain: "storage", symbols: [] },
  { app: "vault", file: "vitest.config.ts", domain: "storage", symbols: [] },
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
