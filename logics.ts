/**
 * logics.ts — the master logic catalog of the whole DevThink platform.
 *
 * THE LAW (PR3 root aggregation + PR19 app ownership):
 * - PR3: the repo root carries exactly ONE aggregation file, and this is it.
 *   It reaggregates and reindexes every correlata logic that lives in the
 *   root TS files of the 11 apps of the family.
 * - PR19: every logic domain has one owning app. argan owns the network and
 *   DNS gateway, cadria the VersaWaze 3D video studio, cobaia the
 *   monetization/MRR/ads surface, debonair the Kathesis audio DAW, devthink
 *   the OS envelope and suite, forge the binary runner sandbox, foundry the
 *   pipeline and network DB, getry the AI gateway (5 providers, 35 routes),
 *   saddle the VM master (90 modalities), stealthhead the FPS game (in
 *   construction), vault the storage bucket (the Supabase competitor).
 * - The dedup law: no logic is duplicated between apps. If app B needs app
 *   A's logic, B imports it from A — see DEDUP_LAW for the canonical edges.
 * - This catalog references, it never reimplements: every entry maps a real
 *   root file of an app to its real export symbol names, inventoried from
 *   the tree. Cross-app import edges are recorded per file as live proof of
 *   the law.
 *
 * Layout: one raw record block per app (hierarchical sections), expanded
 * into the typed LOGICS catalog, served by byApp, byDomain, findOwner and
 * importSpec. Run `bun logics.ts` for the catalog summary.
 *
 * Shape: 11 apps, 489 root logic files, 12063 correlata logics reaggregated
 * into this single file — every entry's symbols are the real export names of
 * the real root files, inventoried from the tree, never invented.
 */

/** the 11 apps of the family, alphabetical. */
export type App =
  | "argan"
  | "cadria"
  | "cobaia"
  | "debonair"
  | "devthink"
  | "forge"
  | "foundry"
  | "getry"
  | "saddle"
  | "stealthhead"
  | "vault";

/** the app roster, the spine of the catalog. */
export const APPS: readonly App[] = [
  "argan",
  "cadria",
  "cobaia",
  "debonair",
  "devthink",
  "forge",
  "foundry",
  "getry",
  "saddle",
  "stealthhead",
  "vault",
];

/** home domain of every app — the PR19 ownership map. */
export const APP_DOMAIN: Record<App, string> = {
  argan: "network",
  cadria: "video",
  cobaia: "monetization",
  debonair: "audio",
  devthink: "envelope",
  forge: "runner",
  foundry: "pipeline",
  getry: "gateway",
  saddle: "virtualization",
  stealthhead: "game",
  vault: "storage",
};

/** one cross-app import edge of a root logic file. */
export interface CrossImport {
  from: string;
  symbols: string[];
}

/** one catalog entry: one root TS file of one app, with its real symbols. */
export interface LogicEntry {
  app: App;
  file: string;
  domain: string;
  symbols: string[];
  imports?: CrossImport[];
  owner: string;
}

/** raw catalog form: root file name to space-joined export names. */
type RawFileLogics = Record<string, string>;

/** raw cross-import form: root file name to its cross-app import edges. */
type CrossImports = Record<string, CrossImport[]>;

/**
 * functional domain of a root logic file. First keyword rule that matches
 * the file stem wins; otherwise the app home domain owns the file.
 */
const DOMAIN_RULES: ReadonlyArray<readonly [string, RegExp]> = [
  ["auth", /(auth|oauth|session|login|register|passage|signup)/],
  ["data", /(db|drizzle|schema|sql|store|storage|object|bucket|chunk|record|seed|init)/],
  ["copy", /(label|keyword|notice|content|post|roster|manifest|sitemap)/],
  ["theme", /(theme|palette|color|typeface|font|icon|favicon|cover|accent|motionpref)/],
  ["qa", /(test|spec|probe|verify|audit|matrix|fingerprint|readiness|soak|sweep|pentest|wcag|smoke|cert|recovery|gate|baseline)/],
  ["server", /(server|gateway|api|route|proxy|dns|http|protocol|webserver|stream)/],
  ["runtime", /(cli|runner|queue|scheduler|orchestrator|fleet|engine|runstream|runall|job)/],
  ["security", /(security|crypto|sha|chacha|secret|sandbox|isolation|permission|policy|decoy|quota)/],
  ["ui", /(view|shell|home|intro|onboarding|winget|dashboard|console|face|gallery|edit|player|daw|reveal|screen|page|uistore)/],
];

/** domain lookup, the catalog's functional index. */
export function domainOf(app: App, file: string): string {
  const stem = file.replace(/\.ts$/, "");
  for (const rule of DOMAIN_RULES) {
    if (rule[1].test(stem)) return rule[0];
  }
  return APP_DOMAIN[app];
}

/**
 * DEDUP_LAW — the non-duplication rule of the family, with the canonical
 * live cross-import edges verified in the tree.
 */
export const DEDUP_LAW = {
  rule:
    "One logic has exactly one owner. No app duplicates another app's logic: " +
    "if app B needs app A's logic, B imports it from A's root file through the " +
    "published family specifier (@wenathlan/<app>/<module>) or the relative " +
    "root path (../<app>/<file>.ts). logics.ts reaggregates and reindexes the " +
    "correlata logics of the 11 apps without owning any of them — the catalog " +
    "references, it never reimplements.",
  owners: APP_DOMAIN,
  canonical: [
    "debonair/coverpalette.ts imports FALLBACK_PALETTE, Palette and synthPalette from @wenathlan/cadria/synth — Debonair imports the Cadria 3D engine for its cover graphics, it never re-writes a palette",
    "devthink/media.ts imports the transcode engine from @wenathlan/cadria/transcode — DevThink imports the Cadria VersaWaze video engine for envelope media, it never re-writes a pipeline",
    "saddle/labels.ts imports createLabelStore from ../vault/labelstore.ts — the Vault + Saddle edge alliance: one label store owner, the VM master consumes it",
    "forge/runner.ts re-exports runnermodes (as modes) and RunnerMode from @wenathlan/saddle/modes, foundry/runner.ts does the same, and foundry/sandbox.ts imports the sandbox lifecycle from @wenathlan/saddle/sandbox — Forge and Foundry run through the Saddle VM master sandbox, never their own",
    "cadria/synth.ts, cadria/gateway.ts, cadria/image.ts and cadria/studio.ts import the audio analysis core from @wenathlan/debonair/audio — Cadria rides the Debonair DSP engine",
    "getry/llm.ts imports policy, http, memory, security and queue primitives from @wenathlan/devthink — the AI gateway rides the envelope core",
    "foundry/readiness.ts imports the verification records from ../devthink — the pipeline rides the envelope QA logics",
    "vault/mimetypes.ts imports the MIME corpus from @wenathlan/argan/mimetypes — storage rides the network leaf catalog",
    "cadria/transcode.ts imports chachaopen and chachaseal from @wenathlan/saddle/security — the studio rides the VM master crypto",
    "argan, cadria, cobaia, debonair, forge, foundry and stealthhead open their lane through @wenathlan/vault/storage — one storage owner for the whole family",
  ],
  importSpec: "importSpec(app) returns the @devthink/<app> root specifier; with a file, @devthink/<app>/<stem>. The tree's published twin is @wenathlan/<app>/<stem> and the relative twin from any app root is ../<app>/<file>.ts",
} as const;

  /**
   * argan — the network and DNS gateway leaf.
   * 21 root logic files, 157 exported logics, owner argan.
   */
  const arganRaw: RawFileLogics = {
    "argan.ts": "BadgeTone ZoneKind ZoneState ZoneSnapshot RecordSetRow PublicationStep FeatureCard SignalBadge DnsTransport ConfigBlock RolloverStep OptionChoice toneClass formatSerial nextSerial findZone transportsByPort apexZoneFile findConfigBlock",
    "capacitor.config.ts": "config",
    "catalog.ts": "listZones listApexRecordSets listPublicationSteps listLibraryCards listDnssecKeyCards listDohFirstCards listHeroBadges listDnssecAlgorithms listTransports listConfigBlocks listRolloverSteps listOptionChoices listProtocols listMimetypes",
    "cleanurl.ts": "cleanUrl applyNow syncCanonical",
    "cli.ts": "main",
    "db.ts": "SqlParam db ensureSchema seedIfEmpty zoneRow recordSetRows OnboardingStateRow getonboardingstate setonboardingstage LabelRow saveLabel readLabel readAllLabels seedLabelRows",
    "dnssec.ts": "DNSSECALGORITHMS DNSSECDIGESTTYPES RrSig DnsKey DsRecord DnssecVerdict DnssecFailureCode DnssecValidationError parseRrSig dnsKeyRdata keyTag validateSignatureWindow validateSignatureTtl validateSignatureLabels validateDsMatch validateChainLink",
    "drizzle.config.ts": "defineConfig",
    "family.ts": "FAMILY_SLUGS FamilyMember FAMILY_ACCENTS familyrow familyurl",
    "labels.ts": "LABEL_REVISION LABEL_MANIFEST LabelKey label labelfill seedLabels",
    "mimetypes.ts": "MimeFamily MimeTypeRow MIMETYPES MIMETYPE_COUNT findMimeType mimeTypeForExtension extensionsForType mimeFamilyOf mimetypesByFamily MimeCorpusError MimeCorpusRow parseMimeCorpus MimeCatalog createMimeCatalog",
    "motionpref.ts": "MOTION_PREF_KEY MotionStorage MotionRoot memoryMotionStorage sessionStorageOrMemoryMotion reduceMotionApplied reduceMotionStored setReduceMotion",
    "onboardingstate.ts": "OnboardingSnapshot readOnboardingState loadOnboardingState markIntroSeen markOnboardingSeen",
    "protocols.ts": "ProtocolGroup ProtocolSecurity ProtocolSpec PROTOCOLS PROTOCOL_COUNT findProtocol protocolsByGroup protocolSchemes tlsCapableProtocols protocolTone protocolGroups",
    "reveal.ts": "initReveal useReveal",
    "sandboxmodality.ts": "AppWorkloadLane APPSLUG WORKLOADLANES SANDBOXLANEENV LaneSeatResult lanesandbox lanesandboxfromenv laneof",
    "seed.ts": "seedZones seedRecordSets seedPublicationSteps seedLibraryCards seedDnssecKeyCards seedDohFirstCards seedHeroBadges seedDnssecAlgorithms seedTransports seedConfigBlocks seedRolloverSteps seedResolverChoices seedLocaleChoices",
    "theme.ts": "Theme currentTheme applyTheme initTheme toggleTheme",
    "vite.config.ts": "defineConfig",
    "vitest.config.ts": "defineConfig",
    "zonediff.ts": "ZoneRecord RecordChange ZoneDiff ZoneDiffError parseZoneRecords diffZones diffZoneFiles recordsFromRows serialForPublication",
  };

  /** live cross-app import edges of argan root files — the dedup law at work. */
  const arganCross: CrossImports = {
    "db.ts": [
      { from: "@wenathlan/vault/storage", symbols: ["openStorageLane"] },
    ],
    "labels.ts": [
      { from: "@wenathlan/vault/labelstore", symbols: ["createLabelStore"] },
    ],
  };

  /**
   * cadria — the VersaWaze 3D video studio leaf.
   * 42 root logic files, 775 exported logics, owner cadria.
   */
  const cadriaRaw: RawFileLogics = {
    "blendmodes.ts": "BlendModeName BLEND_MODES SeparableName ChannelFormula SEPARABLE_FORMULAS LUMA_WEIGHTS Rgb Rgb01 isseparable lumaof satof clipcolor setluma setsaturation blendchannel01 blendchannel blendrgb01 blendrgb alphacomposite blendpixel blendimage blendlayerstack",
    "capacitor.config.ts": "config",
    "catalog.ts": "listPlayerFormats listAnchors listProjects listSeatCards listHeroBadges listOptionChoices",
    "cleanurl.ts": "cleanUrl applyNow syncCanonical",
    "cli.ts": "main",
    "colorconvert.ts": "Rgb Hsl Hsv YcbcrCoeffs SRGB_DECODE clamp01 clampchannel srgbtolinear lineartosrgb rgbtohsl hsltorgb rgbtohsv hsvtorgb SRGB_TO_LMS LMS_TO_OKLAB OKLAB_TO_LMS LMS_TO_SRGB oklabfromrgb rgbfromoklab YCBCR_601 YCBCR_709 ycbcrfromrgb rgbfromycbcr clamprgb Oklch oklchfromrgb rgbfromoklch mixrgb relativeluma601 relativeluma709 hexfromrgb rgbfromhex",
    "compositorraster.ts": "RgbTriple hexcolor rectCoverage ellipseCoverage polygonCoverage strokeCoverage rasterizeCommands SceneCamera rasterizeScene3d",
    "db.ts": "SqlParam db ensureSchema seedIfEmpty projectRows BrowserLabel saveLabel readLabel readAllLabels seedLabelRows OnboardingStateRow OnboardingFlags getOnboardingState setOnboardingStage",
    "designmotion.ts": "DURATION_MICRO DURATION_WINDOW DURATION_SPRING DURATION_ENTER STAGGER EASE_MICRO EASE_WINDOW EASE_EXIT EASE_SPRING EASE_LEAVE SPRING_STIFFNESS SPRING_DAMPING SPRING_MASS SCALE_FLOOR SCALE_MENU SCALE_TOOLTIP PRESS_SCALE CLOSE_RED easeCss evaluateEase WINDOW_MOTION MICRO_MOTION SPRING_MOTION",
    "drizzle.config.ts": "defineConfig",
    "easecurves.ts": "EaseCurve EaseKey MIN_INFLUENCE MAX_SPEED EASE_LINEAR EASE_INOUT EASE_IN EASE_OUT EASE_PRESETS sanitizecurve curvehandles curvefromhandles bezierprogress curveprogress islinearcurve timeatprogress evaluatesegment evaluatekeys samplecurve applycurve measurecurve",
    "family.ts": "FAMILY_SLUGS FamilyMember FAMILY_ACCENTS familyrow",
    "familyurl.ts": "familyurl",
    "gateway.ts": "GenerationRecord AnalysisRecord GenerationStore GatewayError MAX_BODY_BYTES DEFAULT_PORT DEFAULT_HOST memoryStore createGateway defaultGateway app serveGateway GatewayProject GatewayClientError gatewayUrl setGatewayUrl gatewayRequest gatewayHealth listGatewayProjects fetchGatewayRender deleteGatewayProject",
    "generation.ts": "GenerationRecord AnalysisRecord GenerationStore ensureGenerationSchema generationStore",
    "gifencoder.ts": "GifError GIF_MAX_COLORS GifColor quantizePalette encodeGifLzw GifFrame GifEncodeOptions encodeGif gifFrameIndices gifTableSize",
    "image.ts": "ExportFormat ExportErrorCode ExportError PNG_SIZE_LADDER ANIMATION_FPS MANIFEST_FRAME_CAP PNG_COMPRESS_FACTOR WEBM_BITS_PER_PIXEL GIF_BITS_PER_PIXEL GIF_OVERHEAD_BYTES ExportPlan ExportArtifact ExportBundle ManifestFrame AnimationManifest FramePerturbation ExportProject fnv1aHex toExportProject renderProjectSvg buildSvgArtifact exportPlan perturbFrame thumbnailSignature buildAnimationManifest exportBundle ProjectErrorCode CanvasOrientation ProjectAudio ProjectCanvas ImageProject BuildImageProjectInput PROJECT_VERSION CANVAS_MIN VARIANT_HUE_STEP ProjectError buildImageProject serializeProject parseProject projectVariants rngFromSeed rngInt rngPick RectCommand EllipseCommand GradientWashCommand PathCommand StrokePathCommand GrainFieldCommand DrawCommand RenderFrame RenderInput COMMAND_BUDGET Z_BACKGROUND Z_WASH Z_BLOCK Z_STROKE Z_GRAIN Z_SPECULAR RENDER_DEFAULT_SIZE WIPE_BAND WIPE_SHIFT SHIFT_STEP renderCommands renderKeyframePerturbation renderThumbnailSignature renderSvg StyleSymmetry BiasRange PaletteBias CompositionBias TextureBias MotionBias StyleSpec StyleBase StyleBiased StyleError STYLE_RANGES STYLE_MATCH_WEIGHTS TEXTURE_DELTA_CAP HERO_PULL imageStyles styleByName styleForDescriptor styleFingerprint applyStyleBias",
    "introfixtures.ts": "DemoFixtureId DemoFixture demoFixtures",
    "labels.ts": "LABEL_REVISION labelManifest LabelKey label seedLabels",
    "masks.ts": "OpacityGrid BooleanGrid MaskOp MaskBounds MaskLayer makeopacity makeboolean combinemasks invertmask scalemask feathermask thresholdmask booleantoalpha alphatoboolean maskbounds cropmask rectmask ellipsemask gradientmask growmask shrinkmask maskcoverage maskstack",
    "mediaprobe.ts": "MediaTrackKind MediaTrackMeta MediaProbe ProbeError asciiAt finishTracks probeMedia probeMp4 probeWebm",
    "onboardingstate.ts": "VisitorOnboarding OnboardingStage hostallowed mergeStage entrytarget readOnboardingState markOnboardingStage resetOnboardingMemory",
    "pixel.ts": "PixelError PixelImage PixelAdjustments PixelTint PixelKernel PixelOptions pixelkernels adjustimage tintimage convolveimage boxblurimage resizeimage runpixel",
    "pngencoder.ts": "PngError PNG_SIGNATURE PNG_BYTES_PER_PIXEL PngFilter pngCrc32 pngChunk pngFilterRow pngUnfilterRow PngFilterSelection pngFilteredStream encodePng PngChunkRead decodePng",
    "reveal.ts": "initReveal useReveal",
    "sandboxmodality.ts": "AppWorkloadLane APPSLUG WORKLOADLANES SANDBOXLANEENV LaneSeatResult lanesandbox lanesandboxfromenv laneof",
    "seed.ts": "seedPlayerFormats seedAnchors seedProjects seedSeatCards seedHeroBadges seedFilterChoices seedAutoplayChoices",
    "shadercomp.ts": "ShaderEffectId ShaderEffect EffectProgram DissolveStep DissolvePlan SHADER_EFFECTS compileEffectProgram shaderManifest shaderIdsKnown DissolveOutcome dissolvePlan libraryManifestComplete",
    "studio.ts": "StudioControls StudioGeneration SessionSave generateStudioProject downloadBlob pngSupported pngFromSvg probeGateway saveToGateway reseededSeed StudioSource analyzeSource fixtureSource fileSource",
    "synth.ts": "TextureSpec TEXTURE_RANGES GRAIN_COUPLING TEXTURE_PRESET_BLEND JITTER_FIELD_CAP TexturePresetName TexturePreset texturePresets jitterField sanitizeTexture synthTexture textureDistance synthTextureFromPreset OklchTriple Palette AA_MIN_CONTRAST TONIC_HUE_OFFSET ACCENT_HUE_FAN wrapHue hueDistance oklchToSrgbHex srgbHexToOklch tonicHue relativeLuminance contrastRatio FALLBACK_PALETTE synthPalette paletteVariants MotionEasing EaseName MotionKeyframeKind MotionDrift MotionKeyframe MotionSpec MotionEvent MOTION_MIN_BPM MOTION_MAX_BPM MICRO_MS WINDOW_MS MICRO_EASE EASE_CONTROL SPRING_DECAY SPRING_FREQUENCY PULSE_SCALE_FLOOR PULSE_SCALE_CEIL KEYFRAME_CAP TIMELINE_EVENT_CAP evaluateEase synthMotion motionTimeline motionReduced Rect BlockRole Block CompositionGrid BalanceReport GRID_MIN GRID_MAX HISTOGRAM_BINS compositionGrid compositionBlocks rhythmScatter compositionBalance",
    "theme.ts": "Theme currentTheme applyTheme initTheme toggleTheme",
    "timeline.ts": "EditItem EditTrack EditRange EditIssue EditOutcome EditLimits itemend sorttrack itemat syncconflict shiftfrom overwrite insert lift extract split trim roll slip slide ratestretch ZOOM_LEVELS DEFAULT_ZOOM_INDEX ticktopx pxtotick RulerTick rulerticks clipgeometry mediawindow sequenceend editpoints snapedit advanceplayhead visiblewindow refusalnote BinSlate stockbin SLATE_FACES slateface",
    "timeticks.ts": "TICKS_PER_SECOND MAX_TICKS FrameRate DEFAULT_FRAME_RATE COMMON_FRAME_RATES framerate frameratefromf64 framelabel frameduration frameat tickofframe snaptick TimecodeParams timecodeparams TimecodeFields framestofields formattimecode parsetimecode ticksfromseconds tickstoseconds ticksfromunits tickstounitsfloor ticksfromrational tickstorationalround scaleticks addticks subticks clampticks TimeRange makerange rangeend rangeoverlaps rangeintersect",
    "transcode.ts": "mediaversions mediapipelineerror nvencpreset nvencpresetladder nvencpresets getnvencpreset transcodemode transcodemodeentry transcodemodecatalog transcodemodecount mediaprobe outputprofile mediajob stageid stageentry stagecatalog stageorderv5 validatestagecatalog nvencencodernames buildffmpegcommand encodervendor encodertune optimalencoder createoptimal recommendpreset recommendmaxinstances passagechannelsettings defaultpassagechannel passageframe passagesecurechannel stagerecord jobresult mediapipeline probefromname mediafeatureindex Bitrate TranscodeRung SourceMedia TranscodeVariant TranscodePlan TranscodePlanOptions TranscodeError parseBitrate evenDimension validateRung validateSource estimateVariantBytes buildTranscodePlan",
    "versawase.ts": "ImageInput BadgeTone PlayerFormat CreativeAnchor GalleryDiscipline GalleryProject FeatureCard SignalBadge OptionChoice PlayerDemoConfig playerDemo toneClass formatTimecode formatByExtension anchorById projectsByDiscipline SceneNode AnimationTrack Scene3d RenderJob PrecompiledShader trackValueAt sceneDuration renderJobFrames shaderManifestComplete MeshData ThreeMeshArgs threeMeshArgs fitCameraDistance ViewportOptions Viewport ViewportOutcome mountThreeScene NodeSnapshot Axis3 tracksByTarget wrapSeconds sampleNode sampleSceneAt worldTransform TrackKind ClipEffect ClipTransition CompositionClip CompositionTrack VideoComposition CompositionIssue CompositionOutcome GL_TRANSITIONS isKnownTransition clipEndSeconds compositionDurationSeconds addTrack addClip compositionJson serializeComposition compositionFingerprint parseComposition compositionSlicePlan Vec2 GeneratedMesh MeshValidation MeshGenError hashNoise2 valueNoise2 FbmOptions fbmNoise2 averageNormals validateMesh SphereOptions generateSphere TorusOptions generateTorus TerrainOptions generateTerrain ExtrusionOptions generateExtrusion twistMesh bellyMesh subdivideMesh PASS_VERTEX_SOURCE FullscreenTriangle fullscreenTriangle CachedPass ProgramCache createProgramCache passCacheKey PassSpec PassReadSlot PassWriteSlot PlannedPass planPasses flipRows RenderCanvas RenderRefusal RenderOutcome RendererOutcome createRenderer VersaRender ScheduleEntry slotLoads planSchedule startJob completeJob failJob queueCensus ShaderStageEntry ShaderIssue ShaderValidation ValidateShaderOptions validateShaderSource VERTEX_STAGES FRAGMENT_MATERIALS MaterialProgram materialIds compileMaterialProgram validateCatalogShaders validateLibraryEffects RenderSlice SlicePlanOptions planSlices sliceAt sliceProgress estimateWallClock",
    "version.ts": "packageversion",
    "video.ts": "DecodeIssueCode DecodeIssue DecodeOutcome DecodeState DecodeSnapshot DecodeSession DecodeOptions opendecode disposedecode durationticks quantizeticks seekticks stepdecode playdecode pausedecode stopdecode setratedecode setspeeddecode setmuteddecode setvolumedecode attachdecode detachdecode polldecode timecodelabel ratelabel VideoEncodeFormat VideoEncodeIssue VideoEncodeOutcome VideoArtifact VideoEncodeOptions VIDEO_MIME VIDEO_EXTENSION videoSha256 encodeVideoFrames",
    "visualize.ts": "Vec3 ImageInput MeshGeometry MeshOptions VisualizeError gridDimensions luminance blurHeights buildHeightmap triangulateGrid vertexColors MaterialSummary materialSummary colorGrid faceNormal vertexNormals boundingBox normalizedScale ObjOptions toObj toStlAscii toStlBinary VisualizeOptions VisualizeStats VisualizeResult visualize",
    "vite.config.ts": "defineConfig",
    "vitest.config.ts": "defineConfig",
    "webmencoder.ts": "WebmError EBML_HEADER_ID SEGMENT_ID CADRIA_CODEC_ID DEFAULT_CLUSTER_FRAMES WebmFrameSource ebmlVintId ebmlVintSize ebmlUint ebmlFloat64 ebmlElement WebmEncodeOptions encodeWebmFrames WebmDecodedFrame WebmDecodeReport decodeWebmFrames",
    "winsnap.ts": "WIN_SNAP_EDGE_PX WIN_MAXIMIZE_EDGE_PX WIN_SNAP_GUTTER_PX WinSnapZone WinSnapRect winsnapzone winsnaprect",
  };

  /** live cross-app import edges of cadria root files — the dedup law at work. */
  const cadriaCross: CrossImports = {
    "db.ts": [
      { from: "@wenathlan/vault/storage", symbols: ["openStorageLane"] },
    ],
    "gateway.ts": [
      { from: "@wenathlan/debonair/audio", symbols: ["AnalysisReport", "analyzePcm", "analyzeWavBytes", "AudioDecodeError", "AudioDescriptor", "PipelineError"] },
    ],
    "image.ts": [
      { from: "@wenathlan/debonair/audio", symbols: ["AudioDescriptor", "DIM_ORDER"] },
    ],
    "labels.ts": [
      { from: "@wenathlan/vault/labelstore", symbols: ["createLabelStore"] },
    ],
    "sandboxmodality.ts": [
      { from: "@wenathlan/saddle/workloadlaw", symbols: ["lanesof"] },
      { from: "@wenathlan/saddle/workloadlaw", symbols: ["WorkloadLane", "default"] },
    ],
    "studio.ts": [
      { from: "@wenathlan/debonair/audio", symbols: ["AnalysisReport", "analyzePcm", "analyzeWavBytes", "fromAudioBufferLike", "wavinfo"] },
      { from: "@wenathlan/debonair/audio", symbols: ["AudioDescriptor"] },
    ],
    "synth.ts": [
      { from: "@wenathlan/debonair/audio", symbols: ["AudioDescriptor", "clamp01", "DESCRIPTOR_DIMS", "DIM_ORDER", "NARRATIVE_CONTOUR", "NarrativeShape"] },
    ],
    "transcode.ts": [
      { from: "@wenathlan/saddle/security", symbols: ["chachaopen", "chachaseal"] },
    ],
  };

  /**
   * cobaia — the monetization, MRR and ads leaf.
   * 13 root logic files, 69 exported logics, owner cobaia.
   */
  const cobaiaRaw: RawFileLogics = {
    "adsconfig.ts": "adsslot ADS_LABEL ADS_EMPTY ADSSLOTS adsslotfor adsslotlive",
    "capacitor.config.ts": "config",
    "checkoutlinks.ts": "checkoutplan supportlinkstable checkoutlinks supportlinks isconfigured planbyid",
    "cli.ts": "main",
    "content.ts": "blogpost familymember checkoutplan supportlinks adsslot seedPosts seedRoster seedPlans seedSupportLinks seedAdsSlots seedAdsLabel seedAdsEmpty CONTENTKINDS contentkind contentrow loadcontent contenttable contentvalue useContent",
    "db.ts": "SqlParam tables db ensureSchema OnboardingStateRow OnboardingFlags getOnboardingState setOnboardingStage LabelRow saveLabel readLabel readAllLabels seedLabelRows",
    "familyurl.ts": "familyurl",
    "labels.ts": "LABEL_REVISION LABEL_MANIFEST LabelKey label labelfill seedLabels",
    "posts.ts": "blogpost posts postindex postwords",
    "roster.ts": "familymember roster",
    "sandboxmodality.ts": "AppWorkloadLane APPSLUG WORKLOADLANES SANDBOXLANEENV LaneSeatResult lanesandbox lanesandboxfromenv laneof",
    "vite.config.ts": "defineConfig",
    "vitest.config.ts": "defineConfig",
  };

  /** live cross-app import edges of cobaia root files — the dedup law at work. */
  const cobaiaCross: CrossImports = {
    "db.ts": [
      { from: "@wenathlan/vault/storage", symbols: ["openStorageLane"] },
    ],
    "labels.ts": [
      { from: "@wenathlan/vault/labelstore", symbols: ["createLabelStore"] },
    ],
  };

  /**
   * debonair — the Kathesis audio DAW leaf.
   * 68 root logic files, 1328 exported logics, owner debonair.
   */
  const debonairRaw: RawFileLogics = {
    "analyze.ts": "BPM_FLOOR BPM_CEIL SILENCE_RMS BAND_LADDER BAND_LABELS AudioReport StructureSection analyze",
    "arrangement.ts": "ArrangementError rebaseSchedule validateArrangement ArrangerRole ROLE_NAMES PlanSection SECTION_PLAN RACK_LANES TakePlan PlanOptions planTake TOTAL_BARS beatSecondsOf stepSecondsOf resolveGenre takeId validatePlan",
    "audio.ts": "KeyMode NarrativeShape SpectralSummary RhythmStats HarmonicStats TimbreStats StructureStats DescriptorStats AudioDescriptor AudioDecodeError WavInfo WavLayout readWavLayout readWavSamples wavinfo AudioFrames DecodeOptions AudioBufferLike decodeWav downmix resample normalizePeak fromAudioBufferLike FftError WindowName FFT_MIN_SIZE FFT_MAX_SIZE fft fftMagnitudes hann hamming blackman windowFunction StftOptions stftFrameCount stft RhythmError finite CanonicalTempo canonicalTempo beatGrid envelopeSampleAt downbeatIndex DownbeatGrid downbeatGrid SwingRead SWING_THRESHOLD swingRatio BpmOptions BpmCandidate BpmEstimate estimateBpm TempoPoint bpmOverTime OnsetEnvelope OnsetEnvelopeOptions onsetEnvelope OnsetPeakOptions onsetPeaks RhythmRead RhythmStatsOptions rhythmStats SpectrumError BAND_EDGES_HZ BAND_NAMES hertzToMel melToHertz melbands spectralCentroid spectralRolloff spectralFlatness spectralFlux bandEnergies summarizeSpectrum spectrogramImage FeatureFrames SectionRole Section RawStructureStats NoveltyOptions BoundaryOptions EnergyOptions StructureOptions TENSION_NOVELTY_WEIGHT TENSION_ENERGY_WEIGHT frameEnergies noveltyCurve structureBoundaries labelSections energyCurve tensionCurve analyzeStructure DB_FLOOR DEFAULT_SIZE DEFAULT_HOP EnvelopeOptions DynamicStats OnsetShape framecount todb rmsEnvelope dynamicStats onsetShapes zcr zcrrate MEL_BANDS DEFAULT_COEFFICIENTS MelOptions MfccOptions TimbreOptions TimbreRead hztomel meltohz melFilterbank dctii mfcc spectralSlope rolloffSharpness noisinessIndex warmthIndex brightness timbreStats ChordQuality ChordSegment ChordDetectorOptions CHORD_INTERVALS CHORD_DEFAULT_FRAME_MS ChordTemplate chordTemplates detectChords KeyCandidate KeyEstimate HarmonicRead HarmonicStatsOptions pitchClassNames keyProfiles spectrumFrames chromaVector chromagram estimateKey keyName harmonicStats DESCRIPTOR_DIMS DIM_ORDER NARRATIVE_CONTOUR clamp01 normalize01 zcurve audioSeed audioSeedFromStats fuseDescriptor descriptorSummary PipelineError PipelineOptions ReportSource AnalysisReport analyzePcm analyzeWavBytes reportDigest TransportError ROLE_TRIM DEFAULT_MIX_LAW VOICE_RECIPES RENDER_TAIL_S NOISE_SECONDS VoiceSink seededNoiseChannel VoiceBank TakeEngine OfflineRenderOptions renderTakeOffline",
    "beatgrid.ts": "BeatErrorCode BeatResult BeatGrid TempoCurve TempoAnchor TempoMap onsetEnvelope detectTempo trackBeats gridFromBeats identityGrid beatCount isDownbeat beatTime nearestBeat quantizeToGrid swingOffset subdivideBeat tempoMapFromAnchors gridToTempoMap tempoAtTime beatsElapsed timeAtBeat",
    "bigintids.ts": "mintid idtick",
    "blobstore.ts": "BLOB_SCHEMA_VERSION BLOB_DEFAULT_CAP_BYTES BLOB_GATEWAY_TIMEOUT_MS BlobPointer BlobManifestRow BlobErrorCode BlobResult BlobStore sha256hex blobidvalid blobkindvalid blobshavalid blobrowvalid lfsPointerText lfsPointerFrom MemoryBlobOptions MemoryBlobStore memoryblobstore sessionblobstore FileBlobOptions FileBlobStore fileblobstore GatewayBlobOptions GatewayBlobStore gatewayblobstore VaultObjectRow VaultReadFacts VaultSeamAnswer VaultStorageSeam VaultSeamOptions vaultclientseam VaultBlobOptions VaultBlobStore vaultblobstore BlobBackendName BlobSeatOptions BlobSeatResult BLOB_BACKEND_NAMES resolveblobstore BLOB_BACKEND_ENV BLOB_ROOT_ENV BLOB_ORIGIN_ENV VAULT_ORIGIN_ENV VAULT_TOKEN_ENV VAULT_PROJECT_ENV blobseatfromenv",
    "capacitor.config.ts": "config",
    "catalog.ts": "listGenres listTimelineTracks listMixerStrips listReadouts listLibraryTracks listStageCards listHeroBadges listGenreProfileCards listVitrineTracks vitrineRowOf listOptionChoices",
    "cleanurl.ts": "cleanUrl applyNow syncCanonical",
    "cli.ts": "main",
    "cloudsync.ts": "CloudSyncError CLOUDSYNC_TIMEOUT_MS CLOUDSYNC_ENDPOINT CloudTake CloudResult CloudDeps validateCloudPayload CloudSaveInput saveCloudTake listCloudTakes removeCloudTake probeGateway",
    "composer.ts": "COMPOSER_ERROR_CODES ComposerErrorCode ComposerError SIMILARITY_FLOOR DEFAULT_BARS ComposerPromptSpec parseComposerPrompt planVector compositionSimilarity composeFromProfile CompositionReport composeSimilar",
    "coverpalette.ts": "coverPaletteFromStats coverPaletteFromPcm plateAccents",
    "dawview.ts": "formatClock clipStyle FADER_MIN_DB FADER_MAX_DB clampFader faderToUnit unitToFader FADER_STEP_DB levelToPercent playheadPercent formatGain",
    "db.ts": "SqlParam db ensureSchema seedIfEmpty renderJobRows OnboardingStateRow OnboardingFlags LabelRow getOnboardingState setOnboardingStage saveLabel readLabel readAllLabels seedLabelRows",
    "demix.ts": "DemixErrorCode DemixError DEMIX_STEM_NAMES DemixStemName DEMIX_BASS_HZ DEMIX_VOCAL_HZ DemixStem DemixResult demix DemixWav demixToWavs",
    "drizzle.config.ts": "defineConfig",
    "ducking.ts": "DuckingErrorCode DuckingResult DuckingParams DuckingRegion FollowerState FLOORDB followerInitial validateDucking sensitivityToThreshold rmsEnvelopeDb activityRegions mergeRegions regionAt totalDuckTime staticGainDb smoothingCoefficient followerStep followerGainDb followerGainLinear duckKeyframes levelAtTime autoDuckRegions",
    "family.ts": "FAMILY_SLUGS FamilyMember FAMILY_ACCENTS familyrow",
    "familyurl.ts": "familyurl",
    "fingerprint.ts": "PEAKS_PER_FRAME MAX_LAG_FRAMES PEAK_FLOOR_RATIO BAND_EDGES Peak Landmark DbEntry MatchResult peaksOfFrame landmarksOf fingerprintOf FingerprintDB",
    "formant.ts": "Vowel VOWEL_FORMANTS FormantPole UPPER_FORMANT_HZ UPPER_FORMANT_BW UPPER_FORMANT_GAINS vowelBank glideBank GlottalSourceKind FORMANT_VIBRATO_HZ FORMANT_VIBRATO_SEMITONES DEFAULT_SPEECH_HZ FORMANT_CONSONANT_S FORMANT_TARGET_PEAK FORMANT_ENVELOPE glottalSaw rosenbergPulse FormantResonator formantResonator applyBandpass FORMANT_CONTROL_HOP FormantEvent FormantRenderOptions FormantRender renderFormantPhrase",
    "gatewayapi.ts": "matchpath matchroute routes GatewayHandlerName RouteSpec RouteVerdict IngestJobState GatewayJobRow GatewayJobPatch GatewayJobSeat GatewayDocumentSeat GatewayProfileRow GatewayProfileSeat GatewayTrackSeat GatewayEnv GatewayErrorCode GatewayOk GatewayErr GatewayAnswer GatewayRequest BlobStreamValue IngestJobValue GatewayJobPayload IngestRunValue MinerJobPhase MINER_PHASES MinerJobPayload MinerRunValue RenderJobValue RenderRunValue ReconRunValue VitrineTrackValue VitrineValue GatewayHandler dispatch startJob startMinerJob startRenderLaneJob startRenderJob startReconLaneJob",
    "generateclient.ts": "GenerateClientCode GenerateClientError GenerateClientResult GenerateClientDeps GENERATE_CALL_TIMEOUT_MS GENERATE_RENDER_TIMEOUT_MS GenerateReference GenerateComposition GenerateComposeCode GenerateComposeResult composeTake mineProfile fetchProfiles fetchProfile listVitrine queueRender pollRenderJob publishTrack fetchVitrine GenerateWavBytes fetchTakeWav ownerid generateorigin",
    "genre.ts": "GENRES genreById matchGenre pickBpm validateMatrix GenreStyle CORPUS_SCHEMA_VERSION CORPUS_ERROR_CODES CorpusErrorCode CorpusError CorpusStyleRow GenreCorpus CorpusResult CorpusTrainOptions CORPUS_DEFAULT_REFERENCES CORPUS_DEFAULT_BARS CORPUS_INSTANT seedProfileOf trainGenreCorpus validateGenreCorpus serializeCorpus parseCorpus corpusSeatOf defaultGenreCorpus",
    "genrematrix.ts": "GenreStyle GENRES genreById pickBpm matchGenre validateMatrix",
    "harmonyengine.ts": "ProgressionSpec ChordEvent CadenceName RelativeSwap PROGRESSION_SETS PROGRESSION_IDS hashSeed mulberry32 tensionOf pickProgression generateProgression detectCadence reharmonizeDiatonic reharmonizeRelative",
    "hpss.ts": "HARMONIC_KERNEL PERCUSSIVE_KERNEL Stft stft medianFilter istft masksOf StemPair separate",
    "ialane.ts": "servicelaneid ReferencePostInput ReferenceRecord postReference",
    "ingest.ts": "INGEST_SCHEMA_VERSION NOTE_NAMES IngestSegment IngestStem IngestDocument onsetSecondsOf pcmhash segmentsof IngestOptions IngestDecomposition decompose ingestPcm ingestMixPcm IngestClientCode IngestClientError IngestClientResult IngestClientDeps INGEST_CALL_TIMEOUT_MS INGEST_UPLOAD_TIMEOUT_MS gatewaylane UploadIngestInput uploadIngest pollJob fetchShelf fetchDocument deleteDocument ownerid ingestorigin loaddbface IngestKind IngestVisibility IngestDbErrorCode IngestDbError IngestRow IngestStorage migrateingestschema ensureingestschema puttingest getingestrow listingestrows getingestdoc listingestdocs droppingestrow docvalid GenreProfileRow migrategenreschema ensuregenreschema saveGenreProfile listGenreProfiles IngestJobState IngestJobRow IngestJobPatch migratejobsschema ensurejobsschema putjob getjob updatejob listjobs SOUND_PAYLOAD_SCHEMA_VERSION ENERGY_CHUNK_MS RECONSTRUCT_DEFAULT_DEPTH PAYLOAD_LANE_MODALITY SoundFormatKind SoundContainerFacts probesound EnergyChunk energychunks PayloadAnalysisDepth SoundPayloadSource SoundPayloadTrack SoundPayloadBeats SoundPayload IngestPayloadOptions IngestPayloadErrorCode IngestPayloadResult ingestPayload ReconstructOptions ReconstructionFidelity SoundReconstruction ReconstructErrorCode ReconstructResult reconstructWav IngestRecord saveingest listingests getingest droppingest ingestcount INGEST_STEMS_SCHEMA_VERSION PIPELINE_PHASES INGEST_WORKER_MODALITY IngestJobKind IngestJobVisibility WavDecodeErrorCode WavDecoded WavDecodeResult IngestJobPhase IngestJobProgress IngestProgressCallback IngestStemsManifestStem IngestStemsManifest IngestStampRow IngestDbAnswer IngestDbHandle IngestJobInput IngestJobPointers IngestJobErrorCode IngestJobResult parseWav downmixmono runIngestJob RECON_MFCC_COEFFICIENTS RECON_ENVELOPE_WINDOWS RECON_SPECTRAL_PEAKS RECON_PEAK_FLOOR RECON_YIN_WINDOW_MS RECON_YIN_HOP_MS RECON_YIN_THRESHOLD RECON_YIN_MIN_HZ RECON_YIN_MAX_HZ RECON_BPM_WINDOW_MS RECON_BASS_MIDI_MAX RECON_GUITAR_MIDI_MAX reconEnvelope32 reconSpectralPeaks reconYinNotes reconScaleFit reconBpmPerSecond ReconOptions reconFamilyOf reconFromIngest reconOf trackStreamOf reconScaleModeOf reconRootModeOf reconBpmSeriesOf",
    "katexis.ts": "BadgeTone GenreConfig TimelineClip TimelineTrack MixerStripRow ReadoutRow RenderStage RENDER_STAGES RenderJobRow LibraryStatus LibraryTrackRow FeatureCard SignalBadge GenreProfileCard OptionChoice VitrineTrackRow toneClass statusTone MASTERING PROMPT_MAX_LENGTH formatDb deriveSeed trackNameFromPrompt estimateDuration genreByLabel filterTracks",
    "labels.ts": "LABEL_REVISION LABEL_MANIFEST LabelKey label labelfill seedLabels",
    "limiter.ts": "TRUEPEAK_OVERSAMPLING LIMITER_LOOKAHEAD_S LIMITER_RELEASE_S LIMITER_MARGIN_DB LimiterOptions truePeakLinear limitTruePeak",
    "llmlane.ts": "LlmLaneCode LlmLaneError LLM_CALL_TIMEOUT_MS LLM_DEFAULT_MODEL llmlaneorigin ComposeWithLlmOptions LlmPlan LlmPlanResult composeWithLlm",
    "loudness.ts": "LoudnessErrorCode LoudnessResult KCoeffs BiquadState LoudnessReport ABSOLUTEGATE RELATIVEGATE energyToLufs lufsToEnergy kShelfCoefficients kHighpassCoefficients biquadFilter channelWeights kWeightChannel weightedMeanSquare gatingBlocks integratedLoudness loudnessSeries percentile loudnessRange samplePeakDb truePeakDb gainToTarget applyGain analyzeLoudness",
    "mcplane.ts": "MCP_DOMAIN MCP_TOOL_NAMES McpToolProperty McpToolDef toolcatalog McpLaneConfig McpAgentLane MCP_POLL_INTERVAL_MS MCP_POLL_DEADLINE_MS mcplane McpToolErrorCode McpToolError McpToolResult IngestReferenceResult mcpIngestReference MineProfileResult mcpMineProfile ComposePlanResult mcpComposePlan ComposePlanAiResult mcpComposePlanAi RenderTrackResult mcpRenderTrack PublishTrackResult mcpPublishTrack ListVitrineResult mcpListVitrine calltool",
    "midiwriter.ts": "MidiErrorCode MidiError MIDI_CONSTANTS VLQ_MAX MidiNote MidiTrack MidiProblem encodeVlq decodeVlq secondsToTicks ticksToSeconds writeMidi buildTracksFromSchedule validateMidi",
    "mixergraph.ts": "MixerGraphErrorCode MixerGraphError MixerSend MixerChannel MixerGraph ResolvedPath dbToLinear linearToDb graphFromStrips patchChannel assertGraph assertAcyclic effectiveGainDb effectiveGains resolvePaths",
    "motionpref.ts": "MOTION_PREF_KEY MotionStorage MotionRoot memoryMotionStorage sessionStorageOrMemoryMotion reduceMotionApplied reduceMotionStored setReduceMotion toggleReduceMotion",
    "musictheory.ts": "Key Chord ChordQuality ScaleName NOTE_NAMES FLAT_NAMES SCALE_STEPS SCALE_NAMES INTERVAL_NAMES CHORD_SHAPES CHORD_SUFFIX transposePc noteName noteToPc intervalName intervalBetween makeChord chordIntervals chordPcs chordNotes chordSymbol qualityFromIntervals parseChord scalePcs degreeToPc diatonicTriad parseRoman romanOf commonTones voiceLeadDistance nearestInversion",
    "onboardingstate.ts": "VisitorOnboarding OnboardingStage hostallowed mergeStage readOnboardingState loadOnboardingState markIntroSeen markOnboardingSeen resetOnboardingMemory",
    "pattern.ts": "PATTERN_SCHEMA_VERSION TIMELINE_SCHEMA_VERSION PATTERN_SCHEMA_IDS NOTE_NAMES PatternScaleName PATTERN_SCALES PATTERN_SCALE_NAMES PATTERN_SCALE_ALIASES PatternVoice PATTERN_VOICES PatternDrumLaneKey DRUM_LANE_KEYS LANE_STEPS PATTERN_GENRE_KEYS PatternEventKind EVENT_KINDS PatternTransientLabel TRANSIENT_LABELS BAND_LABELS PatternTimelineSource TIMELINE_SOURCES EMBEDDING_DIM CHROMA_DIM PATTERN_LIMITS PATTERN_PROJECT_ERROR_CODES PATTERN_TIMELINE_ERROR_CODES PatternErrorCode PATTERN_ERROR_CODES PatternError PatternNoteEvent PatternDrumLanes PatternProject PatternFrameEvent PatternTimelineFrame PatternTimeline PatternDocument PatternOk PatternErr PatternResult patternNoteName patternNoteToPc patternScaleIntervals validatePatternProject validatePatternTimeline serializePattern parsePattern patternPromptHint patternFromLlm PROFILE_SCHEMA_VERSION PROFILE_GENRE_KEYS KEY_MODES KEY_POOL_NAMES SEGMENT_DIM CHROMA_BINS ONSET_CURVE_BINS BPM_BUCKETS PROFILE_LIMITS PROFILE_ERROR_CODES ProfileErrorCode ProfileError KeyPoolEntry ProfileBpm ProfileLoudness ProfileBands GenreProfile IngestDocumentWithId SimilarityHit ProfileOk ProfileErr ProfileResult segmentVector documentVector GENRE_SEAT_WEIGHTS TrainedStyleVector TrainedCorpusSeat GENRE_CORPUS_WEIGHTS GenreVerdict classifyDocument validateGenreProfile serializeProfile mineGenre similarityRank",
    "patternenums.ts": "",
    "pianoroll.ts": "PIANOROLL_CONSTANTS PianoRollErrorCode PianoRollError EditableNote RollWindow scheduleToNotes notesToSchedule addNote removeNote moveNote resizeNote quantizeNote validateNotes",
    "playerbus.ts": "ReferenceSource ReferenceTake ReferenceOrigin BusTake ReconTake isReferenceTake isReconTake durationOfTake DecodedReference ReferencePlayCode ReconPlayCode BusNoticeCode FetchBytesAnswer DecodeBytesAnswer ResolveReferenceAnswer ReferenceSeams referenceMimePlayable busSetReferenceSeams busReferenceSeams resolveReferenceAudio ReconQueueAnswer ReconPollAnswer ReconGatewaySeams busSetReconSeams busReconSeams resolveReconAudio REFERENCE_STORE_KEY ReferenceRecord loadReferenceRecords saveReferenceTake removeReferenceTake PlayerSnapshot busPlay busPause busToggle busSelect busFeature busSeek busHush busTakeById busSubscribe",
    "recon.ts": "RECON_SCHEMA_VERSION RECON_SAMPLE_RATE RECON_PARAM_COUNTS RECON_NAME_MAX RECON_NOTES_MAX RECON_SCALE_NAMES RECON_ROOT_NAMES RECON_INSTRUMENTS RECON_FAMILIES RECON_TONAL_FAMILIES RECON_TIME_SIGNATURES RECON_ENCODINGS RECON_MIME_TYPES RECON_LAYERS RECON_TONAL_LAYER_ID RECON_TEXT_KEYS reconIdOf reconNameOf RECON_HEADER_KEYS RECON_FRAME_KEYS RECON_CORRELATION_KEYS RECON_LAYER_KEYS RECON_NORMALIZED_FRAME_KEYS ReconLayerFrame ReconFrame ReconHeader ReconCorrelations ReconDocument RECON_ERROR_CODES ReconErrorCode ReconError ReconOk ReconErr ReconResult fnv1aNumbers validateRecon reconHasDuplicateKeys serializeRecon parseRecon reconScaleId reconScaleName reconRootId reconRootName reconInstrumentId reconInstrumentName reconFamilyId reconFamilyName reconLayerId reconLayerName RECON_RENDER_SAMPLE_RATE RECON_RENDER_BIT_DEPTH RECON_WAV_KIND RECON_PHASES ReconPhase reconSeedOf ReconChecksums ReconPcmRender ReconWavRender renderReconPcm renderRecon ReconWorkerErrorCode ReconPlanResult ReconJobProgress ReconProgressCallback renderReconPlan ReconEnv ReconRunErrorCode ReconJobRun startReconJob",
    "remixplan.ts": "RemixErrorCode RemixResult RemixAnalysis RemixParams RemixPiece RemixPlan SimilarityMatrix JOINTCONTEXT MINPIECEBEATS XFADESECONDS cosineSimilarity zScoreSeries chromaMatch timbreMatch beatSimilarity selfSimilarity similarityAt jumpScore segmentCount variationWindow bestTargetBeat planRemix identityPlan planLength planJoints planCuts pieceAtOutputBeat equalPowerGain validatePlan",
    "render.ts": "migraterenderjobsschema ensurerenderjobsschema putrenderjob getrenderjob updaterenderjob listrenderjobs migratetrackschema ensuretrackschema putrendertrack getrendertrack RenderTrackFilter listrendertracks publishrendertrack renderjobseat rendertrackseat",
    "renderengine.ts": "RENDER_SAMPLE_RATE RENDER_BIT_DEPTH RENDER_WAV_KIND RENDER_PHASES RenderPhase RENDER_WORKER_MODALITY RenderBlobPointer RenderStorePut RenderBlobStore RenderErrorCode RenderPlanResult RenderJobProgress RenderProgressCallback PatternSchedule schedulePattern renderPatternMix VOICE_BUS_FADER_DB formantEventsOf renderVoiceMix RenderPlanOptions renderPlan RenderJobState RenderJobRow RenderJobPatch RenderJobSeat RenderTrackRow RenderTrackVisibility RenderDbAnswer RenderTrackSeat RenderEnv RenderRunErrorCode RenderJobRun startRenderJob",
    "reveal.ts": "initReveal useReveal",
    "reverseingest.ts": "ReverseIngestErrorCode ReverseIngestError ReverseIngestOptions ReverseIngestOk ReverseIngestResult timelineEvents shapeTimelineLoudness reverseIngestPayload",
    "rhythmgrammar.ts": "LaneName PatternGrid SwingGrid FamilyName LANES FAMILY_NAMES STEPS gridFromSpec emptyGrid cloneGrid FAMILIES validateGrid laneDensity swingOffsets applySwing accentMap applyAccents maybeFill foldPattern",
    "routetable.ts": "GatewayHandlerName RouteSpec routes matchpath RouteVerdict matchroute",
    "sandboxmodality.ts": "WorkerModality WORKER_MODALITIES WORKER_MODALITY_ENV WorkerModalityResult workermodality workermodalityfromenv AppWorkloadLane APPSLUG WORKLOADLANES SANDBOXLANEENV LaneSeatResult lanesandbox lanesandboxfromenv laneof",
    "seed.ts": "seedGenres seedTimelineTracks seedMixerStrips seedReadouts seedLibraryTracks seedVitrineTracks seedStageCards seedHeroBadges seedGenreProfileCards seedLocaleChoices",
    "spectrum.ts": "FFT_SIZE HOP_SIZE HANN_TABLE SpectrumFrame fftInPlace frameSpectrum KK_MAJOR KK_MINOR chromaOf keyOf",
    "speechalign.ts": "SpeechAlignErrorCode SpeechAlignResult Segment FitEntry SpeechAlignParams AlignPlan defaultSpeechParams frameRms rmsToDb noiseFloorDb speechThresholdDb voicedFlags flagsToSegments mergeSegments trimSegments segmentAt totalSpeechSeconds stretchRatio clampStretch beatGridTimes fitPlan planOffsets maxStretchRatio alignSpeech",
    "stages.ts": "StageId StudioStage STUDIO_STAGES findStage",
    "stems.ts": "StemsErrorCode StemsError STEMS_SCHEMA_VERSION StemRolePolicy STEM_ROLES stemFile StemPlan StemsManifestStem StemsManifest StemsProblem planStems stemsManifest validateStems",
    "take.ts": "NoteEvent TakeSchedule scheduleTake sectionAt eventsInWindow positionAt validateSchedule TAKE_STORE_KEY TAKE_SELECT_KEY StorageLike TakeRecord memoryStorage sessionStorageOrMemory loadTakeRecords saveTakePlan removeTakePlan findTakeRecord ExportKind RECON_SEED_SCHEMA_VERSION ExportFile EXPORT_LABELS reconSeedFile exportTake downloadFile",
    "theme.ts": "Theme currentTheme applyTheme initTheme toggleTheme",
    "timelinemodel.ts": "TimelineErrorCode TimelineModelError TimelineClip TimelineGrid MINIMUMDURATION snapToGrid snapClip clipsOverlap validatePlacement splitClip trimClip moveClip activeAt totalDuration",
    "timestretch.ts": "StretchErrorCode StretchError STRETCH_RATIO_MIN STRETCH_RATIO_MAX stretchPcm",
    "tuning.ts": "CONCERT_PITCH A4_MIDI midiToHz",
    "vite.config.ts": "defineConfig",
    "vitest.config.ts": "defineConfig",
    "vocalsynth.ts": "VOWEL_FORMANTS Vowel VIBRATO_HZ VIBRATO_SEMITONES CONSONANT_SAMPLES TARGET_SYLLABLE_PEAK Syllable VoiceRenderOptions VoiceRender renderVoice syllablesOfLine SING_VELOCITY SING_LIFT_SEMITONES singPattern sungLineOf",
    "wavwriter.ts": "WavErrorCode WavError WavBitDepth WavFormatId WavFormatRow WAV_FORMAT HEADER_LAYOUT SAMPLE_RATE_MIN SAMPLE_RATE_MAX CHANNELS_MIN CHANNELS_MAX EXPORT_SIZE_LIMIT_BYTES MAX_DURATION_SECONDS WavOptions WavInfo WavProblem encodeWav writeWav16 writeWav24 writeWav32f wavInfo validateEncoding",
  };

  /** live cross-app import edges of debonair root files — the dedup law at work. */
  const debonairCross: CrossImports = {
    "coverpalette.ts": [
      { from: "@wenathlan/cadria/synth", symbols: ["FALLBACK_PALETTE", "Palette", "synthPalette"] },
    ],
    "db.ts": [
      { from: "@wenathlan/vault/storage", symbols: ["openStorageLane"] },
    ],
    "labels.ts": [
      { from: "@wenathlan/vault/labelstore", symbols: ["createLabelStore"] },
    ],
    "sandboxmodality.ts": [
      { from: "@wenathlan/saddle/workloadlaw", symbols: ["lanesof"] },
      { from: "@wenathlan/saddle/workloadlaw", symbols: ["WorkloadLane", "default"] },
    ],
  };

  /**
   * devthink — the OS envelope and suite trunk.
   * 150 root logic files, 5802 exported logics, owner devthink.
   */
  const devthinkRaw: RawFileLogics = {
    "account.ts": "ACCOUNT_CREDENTIAL_ID ACCOUNT_NAME_KEY AccountState accountstate createAccount verifyAccount replaceAccountPassword DevThinkIdentity PairingRecord BrowserSession normalizePublicUserId getIdentity setIdentityUserId createPairing createPairingLink consumePairing verifyBrowserSession revokeBrowserSessions pairingStatus MAXANSWERBYTES GATETIMEOUTMS MAXREDIRECTS GateError ispublicaddress gateurl gatedrequestoptions gatedanswer gatedrequest OAuthProvider OAUTH_PROVIDERS OAUTH_AUTHORIZE_ENDPOINTS OAUTH_SCOPES OAUTH_TOKEN_ENDPOINTS OAUTH_PROFILE_ENDPOINTS OAUTH_ID_ENV OAUTH_CALLBACK_ENV OAUTH_CALLBACK_DEFAULT OAUTH_STATE_MARKER ProviderRowEntry ProviderRowView providerRow newOAuthState detectProviderFromState buildAuthorizeUrl PkcePair mintPkcePair oauthVerifierKey prepareaccounts AccountError normalizeaccountowner AccountRecord createaccount accountfor verifyaccount AccountSessionIssued AccountSessionView issueaccountsession verifyaccountsession revokeaccountsession accountsessiontokenvalid ExchangeAnswer exchangeoauthcode ServerSession AccountVerdict AccountSessionState ACCOUNT_TOKEN_KEY ACCOUNT_OWNER_KEY createserveraccount signinserveraccount exchangeoauthcodeclient accountsessionstate revokeaccountsessionbearer saveaccountsession clearaccountsession accountbearer storedaccountowner parklocalunlock islocalunlocked restoreonce",
    "admins.ts": "AdminSource Admin Ban AllowedSite AuditEntry admins syncCodeowners grantAdmin revokeAdmin verifyPassword openSession sessionHandle revokeSessions banAddress bannedAt liftBan bans allowSite denySite siteAuthorized allowedSites audit",
    "agent.ts": "reservedagentnames agentname agentscopeof readonlyscope agentbudgetof spendbudget budgetremaining pauseagent unpauseagent engagekillswitch fleetoverview broadcastrecipient mailboxof roleaddress resolverecipients sendmessage receivemessages unreadcount escalationblock reviewrecordof recordverdict runreplay reconstructreplay outputcompare consensusrecordof protocoleventkinds readonlyeventkinds subscriberegister unsubscriberegister notifyevent watchresource unwatchresource notifyresource requestsampling answersampling listprompts renderprompt callprompt streamchunkof chunkcontent assemblechunks notifyprogress cancelframeof canceltool spawnsubagent childscopeof depthoflineage depthlimitof aggregatereport interleave lessonrecordof lessonmatches lessonreuse lessondecay arbitrationcaseof releasecase prioritylaneof loadreportof scalesuggestion costentryof sharedcostsplit roledefaults registeragent assignrole opentabagent spawn pauseone resumeone stopone killall disarmkillswitch agentbudgetcheck scopegate agentheartbeat recordagentusage agentruncontext agenteventof swarmoverview swarmstateof lockkey preparehandoff transferhandoff resumehandoff acquirelock releaselock expirelocks scanconflicts mergeresults swarmreport compareoutputs interleavetimeline sharelesson swarmcosts replayagentrun",
    "agentcert.ts": "runagentcertsuite runleaderworkertopologyscenario agentcertreport agentcertrecord",
    "akash.ts": "AKASH_SHEET AKASH_BACKOUT AKASH_EXIT AKASH_MICRO AKASH_SPRING AKASH_MARK_FLOOR prefersReducedMotion akashSpringTrack akashBeat",
    "alttab.ts": "alttabkeydown altgestureend nextaltindex mruorder",
    "apifreeze.ts": "protocolsupported apifreezerelease apifreezedate apifreezescope protocolmajorof negotiateprotocol sharedprotocolversion deprecatedfield deprecatedfields deprecationwindow deprecationnoticeof warnonce permissioncoverage backgroundsurfacemessages pagebridgesurfacemessages sidepanelsurfacemessages popupsurfacemessages clisurfacecommands mcpsurfacetools mcpsurfacekinds librarysurfaceexports capmanifestsurface capmanifest capmanifestof capmanifestdiff capsurfacesize $ frozenmessagecatalog parseenvelope packageversion protocolmajor protocolversion protocolmajorversion pinnedprotocolversion domainkinds actionkind actionkindids responseenvelopeoutcomes auditkind apifreezebaseline",
    "appregistry.ts": "DesktopAppTarget DesktopApp DESKTOP_APPS PINNED_APPS FAMILY_APP_IDS isFamilyApp searchDesktopApps",
    "auditreferenceworkflows.ts": "",
    "auth.ts": "tokenhashprefix defaulttokenlifetimems defaultpairinglifetimems defaultchallengelifetimems authrefusedmessage tokenhashof issuepairingcode redeempairingcode issuetoken verifytoken revokeclient expiretokens checkallowlist grantallowlistentry issuechallenge verifyauth scopecheck tlsstateof oauthflowof authorizeurl capturecode parsetokens tokenrequest revocationruleof formpayloadof urlencodeform multipartpayloadof multipartchunks bridgepairingscopes mintbridgepairing pairingcountdown exchangebridgepairing rotatebridgetoken verifybridgetoken tokenscopedkey revokeallsessions livetokensof",
    "automation.ts": "triggernames workflowtriggers triggermatch validateworkflowinputs triggerregistry commandguard parsecommand platformadapter forgeprofiles workflowmanifest workflowinputs githubworkflow forgejoworkflow giteaworkflow woodpeckerworkflow gitlabworkflow workflowregistry saddlebot n8nnode n8ntriggers n8nactions n8nmatch n8nexecute surfaces surfaceformats surfacemanifest desktopmanifest mobilemanifest applicationmanifest surfacebundle surfaceadapter desktopadapter mobileadapter controlresources controloperations controladapter controlsurfaceinput controlrequest controlsurface operationmetrics operationsmetrics retentionpolicy planhandler backupplaninput backupplan threatmodel miniappplan dnsplan applicationbridge",
    "background.ts": "executefilesstep processmcpframe",
    "bridge.ts": "servercontractversion serveroperations servereventtypes pagecontentkeys contractcapabilities stableopid negotiatecapabilities composeenvelope parseenvelope envelopeacceptance sessioncreatebody sessionjoinbody eventpostbody eventstreambody chateventpayload planproposaleventpayload planrevieweventpayload progresseventpayload heartbeatevent bridgepayload minimalplandigest frameof parsewireframe sitemanifestof relaysocket socketopen tokenrotation relaysleep relayclientstate relayorigin newrelayclient verifyframeauth frameauth bridgeframerate sendframe receiveframe enqueuebridge replaybridgequeue postevent heartbeattick idleexpired disconnectrelay bridgestatusview connectrelay chatrowsof reviewcardsof carddecision decisionpayload reviewgateoutcome chateventof planproposaleventof widgetview pairingpanel sitemanifest bridgestatuslabel wsbridgelocalhosts wsbridgestreamname wsbridgebindcheck wsbridgesessionstart wsbridgeconnection wsbridgeextensionconnect wsbridgeframeauth wsbridgeidlesweep wsbridgeenvelopeof wsbridgeframeof wsbridgeadvertiseframe wsbridgereport wsbridgeframecounted nativebridgeprotocolmajor nativehostinstallerversion nativehostidplaceholder nativemessagingdirname nativesurfacedef nativesurfacecatalog nativehostcapabilities nativehostmanifesttemplate hostmanifestdestination installnativehost uninstallnativehost nativedefaultstate nativechoices nativetransportenabled nativecorrelationid nativeframeof companionhandshakeframe parsecompanionhandshake nativemajorversion nativeprotocolcompatible negotiatenativecapabilities attachnativehost crashnativehost reattachnativehost detachnativehost nativeheartbeatframe nativeportliveness nativeframecheck nativesecretkeys nativesecretexclusion redactnativeframe nativeerrorof nativefailureof nativedegradationof nativeratecheck nativecallrecordof recordnativecall nativecallevent nativesurfacegrant nativeclassgrant nativesurfaceresult nativediagnostics",
    "browserextension.ts": "extensionpermissions permissionpolicy requestpermission protocolversion extensioncommands createid createcommand createmessage createresponse createerror assertmessage createsnapshot isfreshsnapshot snapshotdiff startworker createworkerrouter buildextension",
    "build.ts": "iconpayloads buildBinary publicprojectcatalog featureflowmatrix StyleDict parseCssTokens resolveCssVars Rgb cssColorToRgb JsxAttr JsxChild JsxElement parseJsxRoot parseStyleObject collectStyleContracts ConvertContext TERMINAL_WIDGETS convertElement convertWidget emitTerminalModule $ convertAll",
    "bun.ts": "bunadapter",
    "calculator.ts": "CalculatorOperator CalculatorToken CalculatorError CalculatorKeyAction tokenizeCalculator evaluateExpression formatCalculator mapKeyboardKey applyKey memoryAdd memorySubtract memoryClear memoryRecallExpression",
    "capacitor.config.ts": "config",
    "capture.ts": "captureformats capturetargets capturekinds captureoptionsof capturevisible capturestitched captureelement captureregion pairstates capturestates buildstitchplan seamweights blendrows fixedheadermatch scaledrect croprect crossesviewport regionsteps sheetcell buildsheet buildname annotationplan annotationplanof mediakinds pdfoptionsof pdfpagesize pdftextlayout pdfsegments buildpdf recordingoptionsof newrecording finishrecording frameinterval imagefilterof imagematches dedupeimages imagenames lapseplanof lapseframes convertdirectiveof thumbdirectiveof thumbgeometry mediaentries assetentries streamsummaries ocrread visionkinds visionsend pdfrasterize videostateread framegrab maskfill ocrtext mergelines mergeparagraphs imageocr regionocr pdfocr frameocr visionshot cropshot redactshot proposeredactionmasks groundshot pairshot pairquery visioncost imagehashof visioncacheput visioncacheserve regionof regionvalid regionsfor fieldshaperegions mergeregions capturesurfaceof templateof redactedshot redactionsummary",
    "catalog.ts": "FamilySite Recipe Rung CoreModule NativeApp RunnerBinary StudioAsset StudioTrack LanguageRow AboutBlock Principle MediaSlot LegalSection AppIcon AppIconSet OsAppLabel OsAppWindow osAppLabels osAppWindows familySites recipeGallery releaseLadder coreModuleTable nativeApps runnerBinaries languageLadder studioAssets studioTracks aboutBlocks principleTable mediaSlots termsSections policySections appIcons appIconSets seedFamilySites seedRecipes seedRungs seedCoreModules seedPlatformApps seedOsAppLabels seedOsAppWindows seedRunnerBinaries seedStudioAssets seedStudioTracks seedLanguages seedAboutBlocks seedPrinciples seedMediaSlots seedTermsSections seedPolicySections seedAppIcons seedAppIconSets",
    "chatstate.ts": "ChatStoppedError isChatStop GatewayModel gatewayModels normalizeGatewayBase PREF_GATEWAYBASE TurnRole ChatTurn ChatCheckpoint ChatBirth ChatSession isChatTurn isChatCheckpoint isChatBirth isChatSession isChatSessionList SESSIONS_KEY ACTIVE_KEY SESSION_CAP TURN_CAP HISTORY_CAP GATEWAY_MODEL MODEL_KEY useChatModel ChatThinking CHAT_THINKING_LEVELS isChatThinking THINKING_KEY useChatThinking deriveTitle userTurn newSession upsertSession CHAT_HANDOFF_KEY writeChatHandoff readChatHandoff clearChatHandoff capTurns ToolId ChatTool CHAT_TOOLS buildSystemPrompt PromptGuard ACCOUNT_GUARD_NOTE guardlinefromverdict runTurn runTurnStream cloneSessionForEdit checkpointCount addTag removeTag lineageKey siblingBranches branchLabel useChatSessions fmtTime cx",
    "checksecrets.ts": "scanSecrets",
    "chipterminal.ts": "ChipTerminalProps ChipTerminal",
    "chromiumsmoke.ts": "",
    "cjs.ts": "",
    "cjswrap.ts": "cjswrap",
    "cleanurl.ts": "CleanResult cleanUrlDetailed cleanUrl View navigate ensureCleanLocation parseHashRoute bindLocationJanitor",
    "cli.ts": "runclifamily parsecliconfig cliexitclasses exitcodeof exitclassofrun manifestkeyallowlist reviewedwebresources capabilityapireport pngdimensions manifestsourceline csphashesof deepmanifestchecks planlintfindings planrisksummaryof parseworkflowdocument composeworkflowdocument runworkflowsummaryof workflowauditlines exportdatawindow secretstorerefusal exportdatacontent parseheadlessfixture resolvefixture conversionrecord importv1plan importautoma importselenium importuivision parsecsvrows importtabular migrateplanconversion bundlesizeaccounting",
    "commands.ts": "tabshape windowshape parsetabquery tabpatternmatches querymatches normalizedtaburl clonewarning clonetabs searchtabmatches audiotabs discardcandidates restorediscarded buildlayout layoutrestoreplan regroupaftermoves renamegroup tasktabsinwindow closeselection zoomstep switchtarget switcherlist watchtabdispatch badgefromprogress tasktabgauge windowprofilegrants assigntasktabs trackedtasktabs transitionallowed advancedownload concurrentwindow conflictfree downloadfilename verifybytes mimeallowed redactheaders netlogentry netlogforstep clipentryof cliphash quarantinedpath newquarantine scanresult scanverdictof released capturefilename advancecounter capturenames referencedartifacts sweepplan capturesteps navintent prefetchpage preconnectorigin deeplinkapp reopentab restoretrail pausenavconsent resumenavconsent navratelimit openclipboardurl checksafeurl batchopenlinks catalogflag catalogcommand versionbanner freezeline globalflags exitclasses catalogcommands helplines registrylines responseof completions",
    "companion.ts": "nativehosttemplatejson companionbuild companionprotocol companionsurfaces encodenativemessage",
    "config.ts": "RotationStrategy MODELS_2026 Model2026 loadconfig reloadconfig getversion listversions validateconfig DevThinkConfig AuthKind AuthCredential DevThinkAuth DevThinkPaths resolvePaths ensurePaths readConfig saveConfig readAuth saveAuth setAuthCredential clearAuthCredential migrateLegacyCredentials getConfigValue setConfigValue resolveCredential redactValue redactAuth redactConfig parseConfigValue OAUTH_SCOPE_STRING GOOGLE_API_CLIENT_VERSION GEMINI_CLI_VERSION GEMINI_CLI_DEFAULT_MODEL PlatformTuple getPlatformTuple buildXGoogApiClient getBypassHeaders ROTATION_STRATEGIES ToastScope QuotaFallback DebugLevel DebugObjectConfig DebugConfig GoogleSearchConfig EndpointOverrides QuotaSettings BypassMetadata AntigravityConfig DEFAULT_ENDPOINTS DEFAULT_QUOTA DEFAULT_BYPASS DEFAULT_DEBUG_OBJECT DEFAULT_GOOGLE_SEARCH getDefaultConfig CONFIG_DEFAULTS DEFAULT_CONFIG ANTIGRAVITY_CONFIG_JSON_SCHEMA resolveConfigDir resolveConfigPath getConfigPath ValidationError ConfigValidationError validate validateConfig parseAndValidateConfig validateConfigRaw defaults clearConfigCache loadConfig agsaveConfig updateConfig loadConfigAsync saveConfigAsync updateConfigAsync loadConfigSync saveConfigSync getSafeDebugInfo Config SCHEMA isValidEmail isValidSemver isValidProjectId validateAccount validateModelId cfgDir VERSION_FALLBACK fetchVersionChain validateEmail validateSemver validateProjectId validateModelIdCharset loadConfigRaw saveConfigRaw atomicWrite runparitygate",
    "consoleboot.ts": "consoleprompt consoleversion bootdelay bootlines bootstageentry BOOTSTAGES BOOTWIRES bootgraph BOOT_STAGE_GAP bootrunnerhandler",
    "constants.ts": "FETCH_TIMEOUT_MS JITTER_MIN_MS JITTER_MAX_MS DEBUG_LOG_MAX_BYTES DEBUG_LOG_RETENTION_DAYS DEBUG_BUFFER_TUI_LINES",
    "consumersmoke.ts": "",
    "core.ts": "DEBUG_BUFFER_TUI_LINES DEBUG_LOG_MAX_BYTES DEBUG_LOG_RETENTION_DAYS fnv1a32 fnv1a32Hex fnv1a64 fnv1a64Bytes jitter getJitter getJitterMs pickRandom isRetryable isRetryableStatus fetchWithTimeout thinkingCache DEBUG_LOG_DIR_SUBPATH DEBUG_LOG_FILE_NAME LogLevelName LogLevel EnvParseResult parseAntigravityDebugEnv redactSecretsPatterns redactSecretsText redactObject redactObjectDeep LogEntry CircularBuffer DebugLoggerOptions DebugLogger ScopedLogger logger debug info warn error createScopedLogger createDebugLogger isDebugEnabled isTuiEnabled isQuietMode shouldShowToast getTuiBuffer getRecentLogs getTuiBufferAsString clearTuiBuffer getLogDir getLogFilePathExport setLogLevel setQuietMode setTuiEnabled refreshFromEnv logsDir redactSecrets debugLogger",
    "costcert.ts": "runcostcertsuite costcertreport costcertrecord",
    "crossbrowser.ts": "browserpolyfillflags browserpolyfillintersection browserpolyfillnamespace browserpolyfillpromisify browserpolyfillof browserpolyfillstructerrorof firefoxdenylist firefoxpermissionmap firefoxprepoverlay firefoxprepadapt firefoxprepsplitbundle firefoxprepdenylistcheck firefoxactionmap xpilinterbudget xpinameof xpimanifestname xpipackassemble xpimanifestheader xpicentraldirectory xpiendrecord xpipacklintercheck xpipackentriesof safariskeletonprojectfiles safariskeletonbuild safariskeletonpopoverof safarizipfile safaricentraldirectory safariendrecord apimapkinds apimapentries apifeatureflagintersection apimapentryof apimapresolve apimapunmapped apimapbrowserof apimapbrowsercacheprobe apimapstructerrorof",
    "crxharvest.ts": "",
    "cspaudit.ts": "",
    "dashboardpage.ts": "",
    "dashdone.ts": "agentstatuscard queuelanerow messageflowrow conflictlogrow costperagentrow escalationrow timelinescrubmark topologyinventoryentry multiagentview dashboardviewerof multiagentoverviewof agentstatuscardof queuelaneviewof messageflowof conflictlogof costperagentof escalationinboxof agentcontrolsof timelinescrubof aggregatereportdownloadof dashboardemptyguidanceof topologyinventoryof multiagentviewof",
    "data.ts": "builddataset checksum exportcontent exportartifact artifactrecordof chunkplan backpressure advancestream streamfrom newstream advancecursor newextractsession remainingpages provenancefor retainedexports interpolate loopstep loopvariables gridpreview sortrows sheetpayload mergetaskrules streamdisk resumeextract transformvalues deduperows samplerows sourcestamp pipelinegridpreview provlog provlogquery pipelinestate extractbatchof streamparseoptions streamparsewindows streamparsechunkof validatesetreamparsechunk streamparseobservations streamparsememorybound openchunkextractcursor chunkextractwindow resumechunkextract mergechunkwindows chunkextractprogress streamparsetaskof chunkextracttaskof tocsv parsecsv mapcolumns tojson toexcel normalizeheader columnspecof",
    "debug.ts": "cdpkinds cdpdomains methoddomain cdpallowlistof allowlistcovers attachcdpsession detachcdpsession sendcdpcommand serializecdpcommand cdpeventruleof watchcdpevents breakpointinputof capturepause stepmodeof watchexpressionof recordwatchvalue overrideinputof overridematches teardownplanof teardowndecision teardowncdpsession profilerkinds flowmetricnames tracecategories attachtargetof flowspecof perfentry stepwindows measure heapintervalallowed heapsnap growsampleof growthtrend cpusample cpusnap shiftentryof tracestart traceevent tracetofile annotationof annotatetrace replaytrace mapurlof capturesourcemaps rewritesourcelocation expireprofilerecords",
    "deno.ts": "denoadapter denoconfigread",
    "density.ts": "DensityPlatform DENSITY_PLATFORMS WebDpr AndroidBucket ANDROID_DPI CELL_W_PX CELL_H_PX TERMINAL_COLUMNS TERMINAL_ROWS TV_TEN_FOOT_FACTOR DensityTokens DensityHint densityTokens dpToPx pxToCellX pxToCellY designPxToPlatformPx",
    "desktopstate.ts": "IconSpot IconBounds IconSpotMap ICONS_STORAGE_KEY SNAP_STEP_X SNAP_STEP_Y CELL_MEDIUM CELL_LARGE BAND_TOP_PX BAND_BOTTOM_PX EDGE_PX IconSize cellSize clampNumber snapSpot clampSpot fitSpot boundsForArea normalizeSpotMap loadIconSpots saveIconSpots clearIconSpots mergedSpots SortableApp sortAppsByName sortAppsByKind gridSpots GRID_GAP_PX gridLayoutSpots NavbarMode NavbarEdge NAVBAR_MODE_PREF NAVBAR_EDGE_PREF NAVBAR_MODE_EVENT NAVBAR_EDGE_EVENT isNavbarMode isNavbarEdge loadNavbarMode loadNavbarEdge saveNavbarMode saveNavbarEdge NAVBAR_FLOAT_LIFT_PX NAVBAR_DOCK_PULL_PX NAVBAR_RELEASE_PX NavbarStance NavbarDragVerdict navbarDragVerdict DesktopLockState DESKTOP_LOCK_STORAGE_KEY DESKTOP_LOCK_EVENT isDesktopLockState loadDesktopLock saveDesktopLock commitDesktopLock",
    "devthink.ts": "ParsedArgs main",
    "devtoolsguard.ts": "guardarmed devtoolswallstatus devtoolsguardstatus devtoolstripped ondevtoolstrip devtoolswallid showdevtoolsinterstitial installdevtoolsguard suspenddevtoolsguard reportguardstrike guardStatus",
    "distseamtypes.ts": "",
    "doccheck.ts": "rundocchecksuite auditkind doccheckreport doccheckrecord",
    "dockmagnify.ts": "DOCK_MAGNIFY_MAX DOCK_MAGNIFY_SPREAD magnifyscale",
    "docsaudit.ts": "",
    "engines.ts": "EngineKind EngineState EngineRunner EngineRecord ENGINEPLANCOUNT ENGINES EnginePlanReport enginesreport getengine EngineDispatch dispatchengine dispatchtable OFFICIALAPPS engineownerrow ENGINEOWNERS ownersbyengine engineof consumerpairs",
    "environments.ts": "offfamilyof environmentsof defaultenvironment offloadkinds markuprenderstep environmentrequirementsof executorregistry routeenvironment workerrequestof transferablekeys workerresponseof acceptworkerresponse poolplan openoffscreen closeoffscreen isolatedinjection runsummarytask summaryrequestof emulationkinds browserpermissions permissionstates familyofkind devicepresetof networkpresetof locationpresetof agentpresetof permissiongrantof blackboxruleof revertplanof newlayer emulationstateof applylayer revertlayer revertalllayers activelayers layernames stackedcount locationrangevalid agentgrammarvalid permissiongrade blackboxmatches hideblackboxedframes blackboxedurls expirelayers exportpresetlibrary importpresetlibrary locationconsentcovers stripscripts nonceof sandboxrenderof rendermessage acceptrenderresult renderprovenance",
    "evidence.ts": "pixeldiff capturegrab forensickinds beforeafter consoletimeline nettimeline diffbase diffshot thumbshot timelapse assemblelapse namecaptures exportcaptures taskinputsignatureof comparemetricdefaults joinruns stepcomparisonof firstdivergenceof outputcomparesessionof comparesessionmetrics outputcompareview",
    "examplelocaljob.ts": "",
    "export.ts": "of exportformats exportscopes exportdescriptorof csvfield csvof markdownfield markdownof jsonlinesof secretfieldshapes unmaskedfieldsof exportrecords chainrows exportchain noterow exportnotes exportextractions keyderive payloadencrypt syncsend scannerhook minimizationkinds localfirst localfieldsof fixedtelemetrypolicy optinsync encryptsync syncpass purgeonrequest exportall streambundle newjar jarscope sealjar cleanupafterrun enforcequarantine inventoryentry importexportpayloadof importexportvalidate applyimport detectfilekind dropimportof",
    "fakehost.ts": "",
    "familyaccent.ts": "FAMILY_ACCENT GlyphMotion familyAccentOf",
    "familylanes.ts": "familylanes",
    "fileexplorer.ts": "ExplorerLocation ShellFolderId SHELL_FOLDER_ORDER FOLDER_NAMES FOLDER_DETAILS ExplorerItemKind Crumb parsepath locationpath breadcrumbs parentlocation hasparent itemmatches formatbytes capacityline capacityshare ExplorerPlatform EXPLORER_PLATFORMS ExplorerViewMode ExplorerSort sortitems",
    "flow.ts": "manifestdigest validatemanifest verifypublishersignature signmanifest libraryentryof grantdiffof sensitiveconsentfor libraryproposalof installlibrary updatelibrary removelibrary forklibrary librarysearch librarybrowserow librarystepsview dataexpectationssummary libraryeventof exportlibrarymanifests flowdriver parseflowrunrequest parsegrantsfile flowproposalvalue flowstepsensitive flowgateof dryflowdriver flowrunexitcodeof renderflowevents flowtimelinerowsof renderflowtimeline runflow flowrunreport syncdigestof syncbridgehookof syncbridgeoptinflip syncbridgeproviders syncbridgeexportpayload syncbridgevalidate syncbridgescan resolveconflict conflictsfor webproviderstub fileproviderof",
    "gates.ts": "gatekindfor paypayload deletepayload credspayload opengate gatestateof resolvegate nobatchresolution gateprompttext gateforstep defaultapprovalwindowms requireapproval resolveapproval expireapprovals listapprovals redactparams approvalprompt",
    "gateway.ts": "PREF_GATEWAYBASE GATEWAY_REQUIRED_COPY GATEWAY_SEND_NOTICE normalizeGatewayBase GatewayEndpointCheck validateGatewayEndpoint GatewayProbe probeGatewayBase GatewayStatus gatewayStatusLabel useGatewayRegistration GatewayRegistration routeFromPathname afterAuthTarget handoverPath normalizeGateway safegatewayurl PairingReadiness pairingReadiness GatewayContext gatewayContext gatewayUrl gatewayJson gatewayReady upstreamdef authconfig modeldef metamodelconfig thinkingconfig rotationconfig retryconfig timeoutconfig contextconfig bodybuildconfig routesconfig headersconfig transportconfig gatewayconfig gatewaydefinition resolvelane lanefetch SandboxServerRow SandboxServerAnswer boot run files modalities StorageLaneUsage storageusage StorageLaneRecord StorageObjectVerdict StorageWriteVerdict storageobject putstorageobject isAllowedOrigin isSecureRemoteEndpoint normalizeBasePath derivebase deploybase familyurl routerbase historypath",
    "graph.ts": "nodekind nodestate NODE_KINDS NODE_STATES graphnode graphedge nodegraph graphproblem graphreport makenode makeedge makegraph addnode addedge removenode removeedge nodebyid nodeindexof edgesfrom edgesto edgesof nodecount edgecount hasoutputport hasinputport freeoutputport connectnodes downstream upstream descendants ancestors rootnodes leafnodes degreeof nodelevels stagewaves topologicalorder stagecount graphdepth findcycle hascycle subgraph descendantsubgraph ancestorsubgraph validategraph withnodestate withnodestates resetnodestates statecounts issettled graphcomplete clonegraph serializegraph isnodegraph parsegraph tryparsegraph graphfingerprint runstatus runeventtype runevent runstageview runneroptions graphrunner viewprogress initialview stageofnode createrunner resetview viewposition graphviewstate layoutoptions viewbounds layoutgraphview makeviewstate withselection togglenodeselection collapsenode expandnode togglenodecollapse collapsedslice hiddenids ishidden visiblegraph collapsecount visiblepositions",
    "hardening.ts": "masklogtext localscangate hatchbannerof newdomainpausecard runtracekeys syncrotationgate stdioclientsignaturegate transparencyexportmask",
    "headless.ts": "bundlestamp headlessfixturestep headlessprogress openheadlesssession headlessgatewait closeheadlesssession remoteattachframes headlesspolicyvalidate headlessauditread headlessmemory headlessplan headlessrun headlesssessionview headlesssubscribe headlesstelemetryposture openlibraryrun",
    "hono.ts": "cors Context Hono serve serveStatic",
    "http.ts": "httpkinds transportresponse fetchtransport calltransport statusclassof templateurl fetchrequestof fetchoptionsof streamwindowof jsonpathrulesof htmlqueriesof graphqlrequestof sendfetch readstream readpath htmlmatch parseddocument domparse htmlqueryresult parsehtmlbody payloadvalid payloadwithdefaults callrest graphqlopenvelope unwrapgraphql callgraphql httpendpoint tlsdecision postauth parsepost httpanswer sseframe streampathof routepath documentedbind defaultheartbeatms defaultidlewindowms defaulthttpstream openstreamchannel heartbeat channellive closeidlechannels starttls enforcemaxclients listremotestatus httpframepipeline relayidseam relayhashseam newrelayserverstate relayconnectionopen relayconnectionclose relaylivetokens relayframeof relayserverframe relayidleconnections relaypendingpairings stdiotransportrecord splitlines stdiotransport createlinepump streamopen pollfetch subevents longpollrequestof longpoll graphqlmessage graphqlsubscriptionof parsegraphqlmessage graphqlsubscribeframe graphqlsub formpost multipartfieldheader multipartpost correlateids joincorrelation correlationexport ratelimitdirectiveof ratelimitwaitof ratelimitrespect bodyhashof cachekeyof cacheexpiryof readmethod cacheresponse cacheserv cachecleanup apicallrecordof",
    "icons.ts": "iconpayloads manifesticons actiondefaulticon",
    "imagedigests.ts": "",
    "index.ts": "argkind attachtimeline blockingduration consolecapture consolediff errorcapture filterentries levelrank loglevels longtaskcapture netfailureentryof redactconsoletext rejectioncapture rotatelogs serializearg spamdetect stackframes timelinecounts timelinekinds timelinesources watcherdetached timeline actionrisk agentbudgetvalid agentscopevalid apikeyconsentgranted authconsentgranted blackboardconsentgrade blockgate breakpointbudgetallowed breakpointceilingof canexecute confirmcredsgate confirmdeletegate confirmpaygate connectallowgate consoleconsentcovers controltarget cookiegate debuggate debuggerconsentcovers debugwaitbudgetallowed diffreviewgrade dryrunprojection editorsavegate emugate emulationretentionwindow emulationstackallowed environmentgrantgate environmentrequirements exportcontentreview gatebatchgate generatedvalueallowed hostpattern iscdpkind isdebugkind isformkind isnetwatchkind iscontrolkind isprofilekind issocketkind iswatchkind issessionkind isworkflowkind istriggeraction keepalivegate keepaliveintervalvalid killswitchgate agentscopegate budgetgate escalateholdgate reviewrequestgate pauseagentgate agentnamevalid fleetoperationgrade replayexportgate voteweightvalid messageegressgrade normalizeendpoint observationmodeof offscreencapabilitygate origincheckgate pauseretentionwindow passwordconsentgranted permissionnamevalid permissionstatevalid phishguardgate phishthresholdgate planallowlist profilegrantgranted profileretentionwindow proxygate queuelanesvalid ratelimitbudgetallowed ratelimitboundsvalid ratelimitgate resolvedrisk resolutionverdict restoreoriginsgranted restorereviewgranted reviewedkinds readonlyactionkinds rotationruleof runreviewgranted safedefaultsgate sandboxorigingate schemaguardgate serverbindgate serverenablementgate sessionfolderunique sessionnameunique sessionrestoregate snapshotretentionwindow socketgate sourcemapconsentcovers spamruleof spawngrade stackgate stepenvironmentvalid submitreviewgranted targetgate toolconsentrequired tooldispatchgate toolnamespacegate toolriskgrade toolversionfloor untrustedrendergate validatetoolcatalog vaultsecretgate workstealgrade workerpoolsizevalid isemulationkind locationconsentgate automationallowlistgate consentdurationvalid consentwindowgate logreadgate originprofilegate revokerungate sensitiveclassgate sensitivepipelingate sitenotesreadgate sitenoteswritegate scratchpadscopegate memoryreadscopegate semanticrecallscopegate summarywindowvalid sessionretentionvalid consentmemoryadvisorygate cancelrungate retrydispatchgate timelinegate costbudgetvalid egressconsentgate guardverdictgate localsensitivegrade planlint plandraftreviewgate provideregressgrade providervalid replanreviewgate timelineretentionwindow traceceilingof triggergate triggerorigins validatebreakpointcondition validatefieldmatch validateformrecord validatestep validatesiteoverride validateregexrule validatetargetref validatevaluegen watchdogconfigvalid watchgate workflowgate paletteactiongate taskinputproposalgate planreviewgate stepapprovegate diffpreviewgate onboardingconsentgate logbufferboundvalid logstreamegressgate quickactiongate omniboxtaskgate shortcutkeygate notificationcontentgate pickeroverlaygate shotpanelgate siteprofilegate importexportgate librarymanifestgate librarycapabilitygate librarygrantgate librarysensitivegate libraryquarantinegate libraryimportgate syncbridgeoptingate syncbridgescopegate runreplaygate outputcomparegate outputcomparereadonlygate backgroundrungate portablerulefamilies portablerulesetof portablerulesetgate portablecapabilitygate flowrungrantgate exportchaingate exportmaskgate headlessconsentgate headlesstelemetrygate platformmatrixgate adaptermappinggate capabilitydowngradegate lazyloadgate debouncewindowvalid batchqueryplangate incrsnapshotgate selcachegate streamparsegate chunkextractgate workerbackpressuregate virtlistwindowvalid perfprovenancegate lazybudgetvalid batchwindowvalid domainlimitsvalid politedelayvalid adaptivepollvalid runbudgetvalid budgetthresholdsvalid timeoutboundvalid timeoutrecordeventgate suspendwindowvalid sessionreusegate resumefingerprintgate logprunegate stepprefetchgate slowmofactorvalid replaycheck checkpointgate rollbackgate zombiegate rollbackorigingate heartbeatwindowvalid offlinegate queuedtaskexpirygate queuedepthvalid actionkindcatalog prefetchgate preconnectgate deeplinkgate reopentabgate pausenavconsentgate navratelimitgate clipboardgate safetygate batchsizelimitgate navigationobservationgrade trailexportgate trailorigingate streamgate transformgate dedupeconfiggate samplegate provgate resumegate pipelinetargetgate gridexportconfirmgate streamchunkgate provlogappendonlygate rowstampgate streamnamespacegate transportgate subscribegate postgate uploadgate cachegate ratelimitrespectgate correlationmappinggate pollchoices subscriptionboundgate apicallgrade transportcancelgate pollwaitbudgetgate visiongate ocrgate redactgate groundgate pairgate visionchoices visioncostgrade visionconsentgate visionsensitivegrade regionboundsgate framebudgetgate visioncacheexpirygate serverurlgate bridgeconsentgate bridgemembergate bridgecontentgate bridgepairingwindowvalid bridgeidlewindowvalid bridgeheartbeatvalid bridgeratecapvalid bridgekillswitchgate bridgeframeorigingate bridgechoices gatewaybaseurlgate gatewayprefixgate gatewayconsentgate gatewaykeyconsentgate gatewayretrycapvalid gatewaycachewindowvalid nativeinstallconsentgate nativetransportconsentgate nativesensitiveapprovalgate nativekillswitchgate nativeescapehatchgate nativeheadlessgate nativeidlewindowvalid nativeheartbeatintervalvalid nativeratecapvalid loopstep retryhintof",
    "inspectstoreartifacts.ts": "",
    "introtarget.ts": "IntroTarget INTRO_SEEN_KEY resolveintrotarget panelgateverdict",
    "jsongate.ts": "",
    "kbdterminal.ts": "KbdTerminalProps KbdTerminal",
    "labels.ts": "LABEL_REVISION labelManifest LabelKey label ChatSuggestion seedChatSuggestions chatSuggestions ChatGreeting seedChatGreetings chatGreetingForHour ChatStringRow ChatStringId chatText ChatLimitRow ChatLimitId chatLimit ChatNavRow seedChatNav chatNav seedChatBuckets chatBuckets ChatThinkingRow seedChatThinking chatThinkingLevels seedChatPersona chatPersona seedChatSandboxContract chatSandboxContract",
    "maintain.ts": "",
    "matrixverify.ts": "runmatrixverifysuite matrixverifyreport matrixverifyrecord",
    "mcp.ts": "servemethods servemetadata clientmetadataof recordclientmetadata serveinitialize transportendpoints startserve shutdowndrain healthof bindclientsession releasebinding isolatedsessions exposedtools planprogressevent samplingframe chunkframes progressframe chunkof progressof servecallevent auditline stepdetails calloutcome dispatchcall resumegatedcall runcallsbatch servesession routeserveframe publishresourcechange createservesession healthresourceof localhostbind defaultmcpport rpcerrornumbers rpcerrorof rpcerrorcodeof defaultmcpconfig parseframe parsewire serializeframe wireformat validateframe respond servermethods servercapabilities initialize ping listtools unknownframefields clientprotocolmajor negotiate connectclient pairclient disconnectclient enqueuerequest nextrequest negotiatetoolfloor dispatchtool handleframe bindlocalhost launchbridge relayframe restartbridge framedlog toolcallevent McpEndpoint CustomProvider McpRegistryState McpStorageAdapter memorystorage localstorageadapter safeurl McpAnswer McpEndpointInput McpProviderInput McpRegistry createmcpregistry",
    "media.ts": "default buildffmpegcommand createoptimal defaultpassagechannel getnvencpreset mediafeatureindex mediapipeline mediapipelineerror mediaversions nvencencodernames nvencpresetladder nvencpresets passagesecurechannel probefromname recommendmaxinstances recommendpreset stagecatalog stageorderv5 transcodemodecatalog transcodemodecount validatestagecatalog encodertune encodervendor jobresult mediajob mediaprobe optimalencoder outputprofile passagechannelsettings passageframe stagerecord stageentry stageid transcodemode transcodemodeentry nvencpreset",
    "memory.ts": "memoryadapter sessionmemory randomid sensitivememoryclasses provenanceof memoryitemof attachprovenance stepsummaryfor matchingrule expiryof expireditems purgeoutcome purgeitems quotareportof rankedcandidates cleanupbatch bytesreclaimed auditexportof exportchunks derivekey encryptedenvelope encryptvalue decryptvalue migrateitem issensitiveclass exportready openselcache cacheselentry advanceselcachegeneration selcachelookup invalidateselcacheonnavigation invalidateselcacheonmutations revalidateselentry selcachestats selcacheentries selcacheinvalidations stalegenerationfailure v1sunsetstate migrationpromptstate migrationcommandtext markv1sunset dismissv1sunset v1sunsetvisible migrationpromptof dismissmigrationprompt migrationpromptvisible",
    "modalitytypes.ts": "BootClass ModalityFamily ModalityState ModalityRecord BOOTLADDER MODALITYPLANCOUNT MODALITY_COUNT MODALITIES ModalityPlanReport planreport BaseProfile JoinRequest resolvejoin getmodality",
    "modes.ts": "ModeDefinition MODES listModes resolveMode modePrompt",
    "nativesmoke.ts": "",
    "net.ts": "netwatchkinds resourcefact resourcefacts failureclass correlationid newexchange pairexchange filterexchanges headerfilterof capturedheaders bodyfilterof bodymatches privatemime capturebody payloadshapeof apientries rankapis apireplayspecof replayurl extractvalues socketkinds socketconnect channelorigin channeloptionsof newchannel reconnectwaits openchannel closechannel busstate publishmessage receivemessage matchmessage collectmessages sequenceintegrity messagefilterof sseevent parsessetext sserequestheaders subscriptionoptionsof pollcursorof cursorfrom pollurl polldecision controlkinds patternorigin matchurlpattern blockruleof newblockrule mockspecof newmockspec mockfor headeruleof newheaderule applyheaderules revertrule cookierecordof cookiedomaingranted redactedcookies proxyrouteof ratelimitreadof retryafterof ratelimitwait",
    "neutral.ts": "argkind attachtimeline blockingduration consolecapture consolediff errorcapture filterentries levelrank loglevels longtaskcapture netfailureentryof redactconsoletext rejectioncapture rotatelogs serializearg spamdetect stackframes timelinecounts timelinekinds timelinesources watcherdetached timeline actionrisk agentbudgetvalid agentscopevalid apikeyconsentgranted authconsentgranted blackboardconsentgrade blockgate breakpointbudgetallowed breakpointceilingof canexecute confirmcredsgate confirmdeletegate confirmpaygate connectallowgate consoleconsentcovers controltarget cookiegate debuggate debuggerconsentcovers debugwaitbudgetallowed diffreviewgrade dryrunprojection editorsavegate emugate emulationretentionwindow emulationstackallowed environmentgrantgate environmentrequirements exportcontentreview gatebatchgate generatedvalueallowed hostpattern iscdpkind isdebugkind isformkind isnetwatchkind iscontrolkind isprofilekind issocketkind iswatchkind issessionkind isworkflowkind istriggeraction keepalivegate keepaliveintervalvalid killswitchgate agentscopegate budgetgate escalateholdgate reviewrequestgate pauseagentgate agentnamevalid fleetoperationgrade replayexportgate voteweightvalid messageegressgrade normalizeendpoint observationmodeof offscreencapabilitygate origincheckgate pauseretentionwindow passwordconsentgranted permissionnamevalid permissionstatevalid phishguardgate phishthresholdgate planallowlist profilegrantgranted profileretentionwindow proxygate queuelanesvalid ratelimitbudgetallowed ratelimitboundsvalid ratelimitgate resolvedrisk resolutionverdict restoreoriginsgranted restorereviewgranted reviewedkinds readonlyactionkinds rotationruleof runreviewgranted safedefaultsgate sandboxorigingate schemaguardgate serverbindgate serverenablementgate sessionfolderunique sessionnameunique sessionrestoregate snapshotretentionwindow socketgate sourcemapconsentcovers spamruleof spawngrade stackgate stepenvironmentvalid submitreviewgranted targetgate toolconsentrequired tooldispatchgate toolnamespacegate toolriskgrade toolversionfloor untrustedrendergate validatetoolcatalog vaultsecretgate workstealgrade workerpoolsizevalid isemulationkind locationconsentgate automationallowlistgate consentdurationvalid consentwindowgate logreadgate originprofilegate revokerungate sensitiveclassgate sensitivepipelingate sitenotesreadgate sitenoteswritegate scratchpadscopegate memoryreadscopegate semanticrecallscopegate summarywindowvalid sessionretentionvalid consentmemoryadvisorygate cancelrungate retrydispatchgate timelinegate costbudgetvalid egressconsentgate guardverdictgate localsensitivegrade planlint plandraftreviewgate provideregressgrade providervalid replanreviewgate timelineretentionwindow traceceilingof triggergate triggerorigins validatebreakpointcondition validatefieldmatch validateformrecord validatestep validatesiteoverride validateregexrule validatetargetref validatevaluegen watchdogconfigvalid watchgate workflowgate paletteactiongate taskinputproposalgate planreviewgate stepapprovegate diffpreviewgate onboardingconsentgate logbufferboundvalid logstreamegressgate quickactiongate omniboxtaskgate shortcutkeygate notificationcontentgate pickeroverlaygate shotpanelgate siteprofilegate importexportgate librarymanifestgate librarycapabilitygate librarygrantgate librarysensitivegate libraryquarantinegate libraryimportgate syncbridgeoptingate syncbridgescopegate runreplaygate outputcomparegate outputcomparereadonlygate backgroundrungate portablerulefamilies portablerulesetof portablerulesetgate portablecapabilitygate flowrungrantgate exportchaingate exportmaskgate headlessconsentgate headlesstelemetrygate platformmatrixgate adaptermappinggate capabilitydowngradegate lazyloadgate debouncewindowvalid batchqueryplangate incrsnapshotgate selcachegate streamparsegate chunkextractgate workerbackpressuregate virtlistwindowvalid perfprovenancegate lazybudgetvalid batchwindowvalid domainlimitsvalid politedelayvalid adaptivepollvalid runbudgetvalid budgetthresholdsvalid timeoutboundvalid timeoutrecordeventgate suspendwindowvalid sessionreusegate resumefingerprintgate logprunegate stepprefetchgate slowmofactorvalid replaycheck checkpointgate rollbackgate zombiegate rollbackorigingate heartbeatwindowvalid offlinegate queuedtaskexpirygate queuedepthvalid actionkindcatalog prefetchgate preconnectgate deeplinkgate reopentabgate pausenavconsentgate navratelimitgate clipboardgate safetygate batchsizelimitgate navigationobservationgrade trailexportgate trailorigingate streamgate transformgate dedupeconfiggate samplegate provgate resumegate pipelinetargetgate gridexportconfirmgate streamchunkgate provlogappendonlygate rowstampgate streamnamespacegate transportgate subscribegate postgate uploadgate cachegate ratelimitrespectgate correlationmappinggate pollchoices subscriptionboundgate apicallgrade transportcancelgate pollwaitbudgetgate visiongate ocrgate redactgate groundgate pairgate visionchoices visioncostgrade visionconsentgate visionsensitivegrade regionboundsgate framebudgetgate visioncacheexpirygate serverurlgate bridgeconsentgate bridgemembergate bridgecontentgate bridgepairingwindowvalid bridgeidlewindowvalid bridgeheartbeatvalid bridgeratecapvalid bridgekillswitchgate bridgeframeorigingate bridgechoices gatewaybaseurlgate gatewayprefixgate gatewayconsentgate gatewaykeyconsentgate gatewayretrycapvalid gatewaycachewindowvalid loopstep retryhintof",
    "node.ts": "nodeadapter",
    "offscreen.ts": "",
    "onboardingstate.ts": "onboardingstateview onboardingstage ONBOARDING_CACHE_KEY VISITOR_KEY ONBOARDING_BASE_ENV ispublichttpsbase onboardingapibase visitorid peekonboardingstate readonboardingstate writeonboardingstage",
    "optionspage.ts": "",
    "os.ts": "AppId AppPage AppTarget AppMeta APPS appMeta appExternalUrl Persona PERSONAS OSEvent OS_EVENT_CHANGE isOSEvent readOSEvents pushOSEvent clearOSEvents useOSEvents ChatStoppedError isChatStop GatewayRole GatewayMessage GatewayReply GatewayModel gatewayModels gatewayChat ThinkingLevel StreamHandlers gatewayChatStream OsStringRow OsStringId osText OsPaletteCommand osPaletteCommands seedOsCalendarWeekdays osCalendarWeekdays OsCalcMemoryKey OsCalcMemoryRow osCalcMemoryKeys OsCalcKey osCalcKeys OsProviderRow osProviders OsOnboardingStep osOnboardingSteps osGatewayRoutes OsGatewayAuthMethod osGatewayAuthMethods osGatewayThinking seedOsGatewayUsage osGatewayUsageBlock seedOsGatewayStructure osGatewayStructureBlock osDocsQuickstartCommands osDocsEndpoints osStringRows observeReveals useReveal OSView OSSettings DEFAULT_SETTINGS OSHandle isOSView isOSSettings",
    "pack.ts": "artifactchannels artifactchannelof artifactmanifestof artifactmanifesttext artifactmanifestnameof artifactmanifestcheck rollbackpinnedset sbomspecversion sbomlicense sbomcomponentof sbominventory sbominventorytext sbomnameof sbomcoveragecheck vsixnameof vsixpackmanifestfields vsixpackmanifest vsixextensionhost vsixwebviewpage vsixvsixmanifest vsixcontenttypes vsixpackassemble vsixmarketplacemetadatacheck vsixzipof vsixpackentriesof mavenjarresources mavenattachedartifacts mavenpackinfo mavenpacklayout mavenpackpomtext nugetcontententries nugetdeclarationentries nugetfixtureentries nugetframeworktargets nugetpackinfo nugetpacklayout containerbuildstages containerbuildchecks containerexposedsurfaces containerimagetags containerdigestfiles containerrunnerentry",
    "packageextension.ts": "",
    "page.ts": "columnspecof mapcolumns normalizeheader parsecsv tocsv toexcel tojson browserresult isbrowserkind readcapabilities runbrowseraction stepresult runpageaction typetimeschedule appendvalue valueevents multichoices radiochoice slidervalue datevalue colorvalue expandstate presshold releasehold heldkeys runpagecontrol cellshape rowshape childtable gridresult classifycolumn expandspans readgrid nextcontrol rowsfresh rowhash dedupebykeys applyexpression transformrows mergedatasets samplerows runpagedata pagepagination queueconsoleentry flushconsole cdpstepoptions runcdpstep debugwatchoptions rundebugwatch siblingsample detectlistpatterns normalizetable paginationestimate scrollrangeshape infinitescrollranges virtualizedcontainers imageshape lazysurvey overlaygeometry scrolllockstate bannercandidate consentkeywords bannermatches classifytemplate sectionfingerprint scrollreport collectsiblings collecttables collectbannercandidates runpagedetection observeddialog parsedialogpolicy dialoganswer harvestdialoglog installdialoghandler activeblackboxpatterns runemulationstep revertemulationlayer fieldshape fieldsurvey honeypotevidence errorcontext matchfield classifyfield generatevalue valueshash parseformrecord pairentries filloutcome filloperations cardmask detecthoneypots detectlogin detecttemplate associateerrors attachplan captchamarkers captchadetected fillcontrol runpageform innerstep retryoutcomeplan runretries runinteractstep linkshape signalsample containerplan parsenavtarget resolvecontainer parsewaitprofile profilefororigin loadphase evaluatesignals parseurlpattern urlmatches queryrewriteoutcome rewritequeryurl fragmenturl matchlinktext matchlinkfragment deeplinkurl spauroutechanged pickrecenttab runpagenav navwatchevent buildredirectchain finalurl redirectcount classifynavchange httpstate detecthttpstate interstitialpolicy parseratelimit domainof ratewindow rateallows recordratehit checksafe curatelinks batchopenset prefetchcandidates preconnectorigins authfor pagenode buildpagetree builda11ytree visibleentries visibletext buildreader pageoutline captureselection opengraphfields detecttextlanguage taglanguage documentlanguage shadowpaths framelist runpageobservation pointerhop plannedevent pathhops pointersequence clickplan dispatchclick ensurevisible runpointerstep profilestepoptions runprofilestep runpageread candidatefields livecandidate framedescription frameentry scopetree clean elementlabel implicitrole elementselector owntext summarize collectclickable collectcandidates matchtext matcharia matchname matchindex buildclickablemap describeframes walkframepath describescopes piercescopes queryshadowchain queryscoped targetsummary stepresolution resolvestep capturepagestate restorepagestate watchoptions parsewatchoptions batchmutations quietfor quietresolution nodesummary nodehash diffsummaries scanjson rankselectors runpagewatch wizardadvance dependentloaded typeaheadpick parsedateparts calendarplan cardgroups codeready backoffrule parsebackoff backoffwaits runpagewizard xnode buildxtree parsexpath evaluatexpath routesenvironment previewtarget capturesnapshot readdialogs digestof pagefinalurl pagedigest idempotencyverdict resetidempotency checkpointafterstep performstep measurepage elementrect queryelements preparecapture scrollcapture restorecapture scrollcontainercapture waitsettle pdfsegment pdfbreaks videoframe videostate canvasdata streamelements mediaelements pageassets pageimages parsehtmlmarkup resourcerecords writecookies readcookies clearcookies maskstepvalues maskobservationstate maskobservationsnapshot",
    "pagebridge.ts": "",
    "panelsync.ts": "PanelSyncReport panelSync",
    "paneltypes.ts": "DevThinkProvider DevThinkMessage DevThinkTab",
    "pentest.ts": "runpentestchecklist pentestreport pentestrecord",
    "perf.ts": "perfrecordof workerbackpressure queuedepthsampleof queuedepthview snapshotrequestkey dedupesnapshotrequests captureplanschedule abandonedparsetasks perfsummary stepdurationchart perfbundle pruneperfrecords snapshotregion regionfingerprint snapshotdeltaof isemptydelta skipsrecomputation deltarequestkey snapshotbaserecord deltachangesof debounceprofilesof coalescedombursts mutationbatchof batchqueryplanof runbatchquery batchquerytaskof batchquerysavings durationsampleof durationsampletoperf selectorprofileof selectorstatsupdate steptracespanof spanchildren steptracefile startupsampleof coldstartverdict slomosessionof slomostepdelay slomopause slomoresume suspendplan tabsuspendstateof tabsuspendrestoreplan artifactcompressof artifactreadplan logpruneplan batteryawarestateof networkbackoff batchbackpressuresignal domainlanesfor advancelane politedelayfor adaptivepollnext coalescequeries coalescefanout cadenceunderpressure lazymodcatalog lazymodof resolvelazymod prewarmmodules startupbudgetof startupcostof",
    "permdiff.ts": "permdiffbaseline permissionset permissionsetof previousof diffpermissionsets",
    "personalstore.ts": "WallpaperId WALLPAPERS WALLPAPER_KEY loadWallpaper applyWallpaper saveWallpaper AccentId ACCENTS ACCENT_KEY loadAccent applyAccent saveAccent ThemeChoice THEME_MIRROR_KEY loadThemeMirror applyTheme saveThemeMirror syncThemeFromPreference currentThemeLadder flipThemeLadder FlagChoice ALTTAB_MOTION_KEY TASKBAR_TIPS_KEY applyAltTabMotion applyTaskbarTips loadAltTabMotion saveAltTabMotion loadTaskbarTips saveTaskbarTips DEVTOOLS_WALL_KEY applyDevtoolsWall loadDevtoolsWall saveDevtoolsWall initPersonalization",
    "plan.ts": "planfilestepfields loopkinds retrykinds parseplanfile planoriginprofile plansteprisk lintplanfile formatdiagnostics planlintexitcode rulesetcachekey planlintsummary plansensitiveclasses plancardsof plancardgroups stepresolutionof resolutionlogeventof resolutionhistoryafter maskverdictsof diffpreviewof stepstimelinenodes activetimelineanchor logstreamgenesis logstreameventof appendlogstreamevent filterlogstream livebufferof verifylogstream auditexcerptof loglevelof Tier TierBadge TIER_BADGES CAPABILITY_BADGES PlanCustom PlanView peekplan loadplan saveplan planbadge",
    "policy.ts": "normalizeendpoint hostpattern issessionkind isworkflowkind istriggeraction iswatchkind isdebugkind iscdpkind isprofilekind isemulationkind observationmodeof actionrisk needstarget parseoptions requiredcapability istabscommandkind islayoutkind isformkind isdatasetkind isexportkind isfileskind iscapturekind capturegate validatecaptureoptions validateregionrect validatecapturenaming captureexportgranted stitchbudgetallowed beforeafterwrapallowed captureretentionwindow exportgranted validatefieldmatch validateformrecord validatevaluegen validatetransformrule validatedownloadspec validatemimefilter validatecleanuprule clipboardconsentgranted quarantinereleasegranted downloadgranted maskclipboard submitreviewgranted passwordconsentgranted generatedvalueallowed profilegrantgranted layoutmutationgranted windowclosegate tasktabceiling waitduration resolutionverdict validatetargetref origingranted originverified navigationgranted validateurlpattern validatetabquery ismediakind ishttpkind issocketkind isnetwatchkind iscontrolkind resolvedrisk socketgate watchgate observedorigingranted origincheck credentialheadername fetchconsentrefgranted fetchconsentcovers mutationcallof fetchbudgetallowed outboundtarget validateendpointrecord isrecordingkind blockgate cookiegate proxygate authconsentgranted apikeyconsentgranted ratelimitbudgetallowed timelinegate consoleconsentcovers stackgate debugwaitbudgetallowed timelineretentionwindow diffreviewgrade spamruleof rotationruleof debuggate debuggerconsentcovers targetgate sourcemapconsentcovers profileretentionwindow traceceilingof validatebreakpointcondition breakpointbudgetallowed pauseretentionwindow breakpointceilingof emugate emulationstackallowed locationconsentgate emulationretentionwindow permissionnamevalid restorereviewgranted sessionrestoregate restoreoriginsgranted sessionnameunique sessionfolderunique snapshotretentionwindow validateregexrule workflowgate triggergate triggerorigins dryrunprojection permissionstatevalid planallowlist controltarget sockettarget mediagate recordingconsentgranted recordingwindow lapsebudgetallowed validatestep canexecute canpreview reviewedkinds readonlyactionkinds editorsavegate runreviewgranted validatesiteoverride exportcontentreview watchdogconfigvalid validatetoolcatalog toolriskgrade toolconsentrequired serverbindgate toolversionfloor serverenablementgate toolnamespacegate tooldispatchgate consentmetagrade allowlistentryvalid tokenlifetimevalid remotetransporttls pairingreadinessgate remoteenablementgate tokenscopevalid approvaltimeoutvalid revocationgate subscriptiongrade samplinggrade callratelimitvalid callauditcomplete batchgrade dryrunpurity mockusagevalid mcpmodegate degradationgate resourceexposuregate promptexposuregate providervalid provideregressgrade egressconsentgate localsensitivegrade plandraftreviewgate replanreviewgate costbudgetvalid guardverdictgate planlint queuelanesvalid workstealgrade agentbudgetvalid agentscopevalid spawngrade killswitchgate messageegressgrade blackboardconsentgrade leaderelectionvalid criticreviewgrade verifiermethodgrade handoffgrantgate lockscopevalid conflictresolutiongrade escalationgate consensusquorumvalid workerscalevalid mergeegressgrade stepenvironmentvalid environmentgrantgate offscreencapabilitygate keepalivegate keepaliveintervalvalid workerpoolsizevalid sandboxorigingate environmentrequirements automationallowlistgate originprofilegate consentwindowgate revokerungate sensitiveclassgate consentdurationvalid logreadgate sensitivepipelingate schemaguardgate protocolnegotiationgate unknownfieldsgate capmanifestdriftgate origincheckgate connectallowgate ratelimitboundsvalid ratelimitgate confirmpaygate confirmdeletegate confirmcredsgate gatebatchgate phishthresholdgate phishguardgate safedefaultsgate vaultsecretgate untrustedrendergate sitenotesreadgate sitenoteswritegate scratchpadscopegate memoryreadscopegate semanticrecallscopegate summarywindowvalid sessionretentionvalid consentmemoryadvisorygate cancelrungate retrydispatchgate paletteactiongate taskinputproposalgate planreviewgate stepapprovegate diffpreviewgate onboardingconsentgate logbufferboundvalid logstreamegressgate quickactiongate omniboxtaskgate shortcutkeygate notificationcontentgate pickeroverlaygate shotpanelgate siteprofilegate importexportgate librarymanifestgate librarycapabilitygate librarygrantgate librarysensitivegate libraryquarantinegate libraryimportgate syncbridgeoptingate syncbridgescopegate runreplaygate outputcomparegate outputcomparereadonlygate backgroundrungate portablerulefamilies portablerulesetof portablerulesetgate portablecapabilitygate flowrungrantgate exportchaingate exportmaskgate headlessconsentgate headlesstelemetrygate platformmatrixgate adaptermappinggate capabilitydowngradegate actionkindcatalog lazyloadgate debouncewindowvalid batchqueryplangate incrsnapshotgate selcachegate streamparsegate chunkextractgate workerbackpressuregate virtlistwindowvalid perfprovenancegate lazybudgetvalid batchwindowvalid domainlimitsvalid politedelayvalid adaptivepollvalid runbudgetvalid budgetthresholdsvalid timeoutboundvalid timeoutrecordeventgate suspendwindowvalid sessionreusegate resumefingerprintgate logprunegate stepprefetchgate slowmofactorvalid replaycheck checkpointgate rollbackgate zombiegate rollbackorigingate heartbeatwindowvalid offlinegate queuedtaskexpirygate queuedepthvalid sessionlockgate tabisolategate urlhistorygate timelinereadonlygate expirygate encryptmemorygate quotacleanupgate auditexportgate lockwindowvalid encryptionsecretgate urlhistoryscopegate exportprovenancegate agentscopegate budgetgate escalateholdgate reviewrequestgate pauseagentgate agentnamevalid fleetoperationgrade replayexportgate voteweightvalid spawngate depthgate aggregatemergegrade aggregateconflictescalationgate arbitrationverdictgate lanechangegate scaleconsentgate lessonsecretgate lessonsanitizestep costsharegate subsetscopegate interleavereadonlygate prefetchgate preconnectgate deeplinkgate reopentabgate pausenavconsentgate navratelimitgate clipboardgate safetygate batchsizelimitgate navigationobservationgrade trailexportgate trailorigingate streamgate transformgate dedupeconfiggate samplegate provgate resumegate pipelinetargetgate gridexportconfirmgate streamchunkgate provlogappendonlygate rowstampgate streamnamespacegate transportgate subscribegate postgate uploadgate cachegate ratelimitrespectgate correlationmappinggate pollchoices subscriptionboundgate apicallgrade transportcancelgate pollwaitbudgetgate visiongate ocrgate redactgate groundgate pairgate visionchoices visioncostgrade visionconsentgate visionsensitivegrade regionboundsgate framebudgetgate visioncacheexpirygate forensicscopegate forensicsreadonlygate diffbasegate timelapsegate captureexportgate consolemaskgate nettraceorigingate captureretentiongrade thumbnailsizereadonlygrade diffthresholdgrade timelapseintervalgrade forensicchoices localgate syncgate encryptsyncgate purgegate exportallgate jargate cleanupgate quarantineopengate scannerhookgate notelemetryinvariant minimizationstripgrade minimizationchoices cssselectorvalid kindoptionfields fixtureconsentgate serverurlgate bridgeconsentgate bridgemembergate bridgecontentgate bridgepairingwindowvalid bridgeidlewindowvalid bridgeheartbeatvalid bridgeratecapvalid bridgekillswitchgate bridgeframeorigingate bridgechoices gatewaybaseurlgate gatewayprefixgate gatewayconsentgate gatewaykeyconsentgate gatewayretrycapvalid gatewaycachewindowvalid nativeinstallconsentgate nativetransportconsentgate nativesensitiveapprovalgate nativekillswitchgate nativeescapehatchgate nativeheadlessgate nativeidlewindowvalid nativeheartbeatintervalvalid nativeratecapvalid",
    "poolaudit.ts": "runpoolauditsuite groupcounts poolcoveragereport poolcoveragerecord",
    "popup.ts": "v1sunsetbannercard migrationpromptcard renderv1sunsetbanner rendermigrationpromptbanner",
    "prismaconfig.ts": "defineConfig",
    "progress.ts": "provenancestamp provenancestampof progressnow recordoutcomewithclock emptyprogress recordstep recordoutcome recordenvironment environmentof recordturnaround turnaroundof recordgatewait gatewaitof recordperf perfof recorddeltas deltasof iscomplete resetforplan watchclosed recordwatchcompletion naventry recordnaventry naventries assigntasktab releasetasktab tasktabs wizardcompletion extractionshare extractionentry recordextraction extractionentries recordwizardstep downloadshare downloadentry recorddownload downloadentries recordcapture recordpair captureentries pairentries recordmedia mediaentries callentry recordcall callentries fetchretryentry recordfetchretry fetchretryentries channelentry recordchannel channelentries exchangeevidence recordexchange exchangeentries evententry recordevent evententries pollentry recordpoll pollentries controlevidence recordcontrol controlentries uploadentry recordupload uploadentries timelineevidence recordtimeline timelineevidences cdpevidence recordcdp cdpevidences profileevidence recordprofile profileevidences emulationevidence recordemulation emulationevidences sessionevidence recordsession sessionevidences workflowevidence recordworkflow workflowevidences workflowshare loopshare triggerevidence recordtrigger triggerevidences toolevidence recordtoolcall toolcallevidences deniedstepevidence recorddenied deniedevidences revokedrunevidence recordrevocation revocationevidences progressreplayentry replayprogress",
    "protocol.ts": "parseproposal workflowproposal workflowstepoutcome parseworkflowproposal workflowoutcome requestbody consensusreport parsespawnrequest spawnreply aggregationreport lessonreport redactionreport capturebundlereport syncpayloadreport exportallreport quarantineverdictreport syncconsentreport outboundpayloadcheck costledgerreport predictionreport outcomeresponse mapresponse heldkeysreport observationresponse eventresponse diffresponse signalsreport selectorresponse navstateresponse trailreport safetyresponse tabreportresponse layoutreport formreportresponse errorreportresponse wizardreport datasetresponse extractionreport provenancereport transformgrammar downloadreport netlogreport quarantinereport capturereport mediareport callsreport exchangesreport authreport controlreport timelinereport consolediffreport cdpreport profilereport emulationreport sessionreport workflowreport triggerentry triggerlist triggerfired manualrunpreview toolcallframe toolresultframe workflowfileversion editorstate runhistoryquery runhistoryreport httpstreamreport pairingframes tokenreport approvalframes tlsreport allowlistreport heartbeatreport subscriptionframes eventnotification resourcedeltareport samplingframes promptreport promptcallframe streamchunkframe progressnoticeframe cancelframes structurederrorreport idempotencyreplayframe batchreport ratelimitreport calllogreport inflightreport dryrunreport mockreport idempotencyreport modelproposal modeloutcome swarmstatereport agenteventframe boardstatesnapshot handoffframe reviewframe environmentgrammar environmentreport consentmodel securityreport logchainreport transparencyreport surfacesnapshot interfaceviews ecosystemviews perfreport schedulereport rollbacksummarycheck runtimelinereport memoryitemframe auditexportreport urlvisitscheck bridgepayloadreport gatewaycallreport frozenmessage frozenmessagecatalog responseenvelopeoutcomes errorcodetable framingrules stabilityrules frozenmessagecarriers",
    "pythonscripts.ts": "pythonreason pythonresult pythonanswer pythonoptions PYTHON_DEFAULTS pythonrunner jsonanswer pythonargv normalizeresult spawnpythonrunner runpython parsejsonstdout runpythonjson exitedclean",
    "queue.ts": "QueueCancelledError QueueTask QueueHandle RequestQueue createRequestQueue RetryConfig RETRY_DEFAULTS RetryableError isAbortError isRetryableStatus parseRetryAfterMs delayForAttempt sleepMs RetryOptions retryWithBackoff TokenWeights DEFAULT_TOKEN_WEIGHTS TOKENS_PER_MESSAGE estimateTokens BudgetMessage estimateMessageTokens estimateHistoryTokens truncateToTokenBudget formatCompactTokenCount contextWindowUsagePercent CompactRole CompactMessage isCompactRole isCompactMessage isCompactMessageList SUMMARY_MARKER FALLBACK_NOTE DEFAULT_KEEP_RECENT DEFAULT_COMPACTION_RATIO isCompactionSummary summaryMessage triggerTokens CompactPlan PlanOptions planCompact CompactOptions CompactResult compactConversation SSE_DONE SseFrame SseIssue SseDataError SseParser createSseParser parseSseChunk isDoneFrame jsonDataOf SseEvent sseEvents compactToken createCompactId isCompactId",
    "recentapps.ts": "RecentEntry loadrecentapps loadrecententries pushrecentapp",
    "recipes.ts": "recipecheck recipeentry recipereport runrecipessuite gallerydriftof reciperecord",
    "records.ts": "recordsummary renderrecord $ syncrecord summaryproblemsof syncmode",
    "release.ts": "releasepublishpat",
    "run.ts": "openrun beatrun closerun reattachrun recordurl recordenvironment recordturnaround markpending recoveryplan zombiesweep acquirerunlock releaserunlock expirerunlocks serializesteps sealrunstate openseal prunerunstates exportrunstate roadmapheartbeatwindow runstatemachine transitionislegal advancerun initialrun stepkey queuesize enqueueoffline dequeueoffline replayqueue makecheckpoint resumecheckpoint checkpointisvalid runheartbeat heartbeatisstale heartbeatwindowof zombiecheck reaprun sideeffects rollbackrun cancelrunrecord cancelrollback runfail runcomplete runfromplan runsummaryof roadmaplockwindow visitof appendvisit stepeventof auditeventof visiteventof runtimelineof buckettimeline tabnamespace tabkey tabisolate acquiresessionlock lockblocks lockheldby releasesessionlock lockwindowof stalelocks sessionwithlock visitsummary finalurlof navigationsteps runwithvisits timelinekinds loglevels timelinesources levelrank redactconsoletext argkind serializearg consolecapture stackframes errorcapture rejectioncapture longtaskcapture timeline attachtimeline filterentries spamdetect rotatelogs timelinecounts blockingduration netfailureentryof watcherdetached consolediff runbudgetof budgetalertstate runpausesforalerts timeoutcanceldecision timeoutcanceleventof timeoutcancelpolicies resumepointof skipcompletedsteps revalidatefingerprint navdedupeverdict foldplannedvisits runcachedigest runcachehit runcachesweep stepprefetchhints replaystepof runreplaysessionof replaymove replayjump replayplay replayviewaction replayrestoredview replaycursorof readparallelgroupof joinlanes openlanes carrywarmselector warmselectorcarryvalid sessionreusegrantof sessioncontainerof backgroundqueueentryof enqueuebackgroundrun nextbackgroundrun beginbackgroundrun finishbackgroundrun resumebackgroundqueue backgroundrunattention backgroundrunsview backgroundtrayrows cancelbackgroundentry",
    "runner.ts": "catalogbase hostIsAllowed queuebinarylaunch queuestudiorender",
    "runtime.ts": "adaptermodeof clockadapterof loggeradapterof fetchadapterof defaultclock defaultlogger defaultfetch platformadapterof nodeplatformadapter browserplatformadapter denoplatformadapter setsharedadapter sharedadapter stampbundle bundlestamp detectadapterruntime adaptersurfaceof adapterruntime capabilityprobeof runtimecapabilitiestable runtimeadapterdeclarationof adapterdeclarationsof workermapof dommapof downgradesof filesystemprimitives filesystemstorageadapter chromestorageprimitives chromestorageadapter denokvprimitives denokvadapter memorystorageadapter timershellof fetchshellof runtimeadapterof portablecapabilityset platformtargets platformmatrixof matrixtargetof matrixverify targetoutput minifiedoutput protocolmajor protocolfloormajor protocolmajorversion pinnedprotocolversion Rgb ColorDepth ICON_GLYPHS ICON_GLYPHS_PLAIN glyph rgbToAnsi256 rgbToAnsi16 ansiFg ANSI_RESET colorDepthFromEnv IrText IrBox IrChrome IrMap IrChildren IrNode TONE_COLORS IrProps RenderOptions renderIr visibleLength wrapCells render",
    "saascontent.ts": "saasnavrow saaschrome saasheadertabs saasrailstops saasherocards saascreatorsintro saasswingcard saasswingcards saascreatorrow saascreators saasworkspace saasfanapp saasfandeck saasflow saascadria saascadriaitem saascadriarail saascadriaheroart saascadrialiveart saasexplorer saasreelrow saasreels saasdebonair saastrackrow saasdebonairrail saasdebonairheroart saasadvisor saasfooterlink saasfooter",
    "saddlefaces.ts": "saddleevent saddleeventbus saddleprovider saddlescheduler saddlememory saddlestorage saddleengineoptions saddlerunresult engine eventbus inprocess scheduler localmemory localstorage",
    "sandboxlane.ts": "SandboxError SandboxRow SandboxAnswer runsandboxline createsandboxsession listsandboxtree writesandboxfile hostmodalityreport AppWorkloadLane APPSLUG WORKLOADLANES SANDBOXLANEENV LaneSeatResult lanesandbox lanesandboxfromenv laneof",
    "schemaaudit.ts": "",
    "scripts.ts": "",
    "security.ts": "denydefaultposture exactorigin wildcardentry allowlistcheck originprofileof profilekind profilegrade sensitiveclassesof classconsentcovers missingclassconsents openconsentwindow consentwindowstate windowgatesstep expireconsentwindows renewconsentwindow revokerun haltedstepsof scopegrantof deniedevidenceof consentprompttext denydefaultnotice profilesummary safedefaultprofile safedefaultreadkind safedefaultnotice schemashape schemacheck envelopecheck origincheckof portaccept connectallowentryof emptyconnectallow bucketboundsvalid bucketof bucketconsume deferredeventof deferredready defaultmaskshapes maskmarker fieldshapekind shapesof maskingfield maskvalue maskfield maskrecord masktypedvalues maskformstate maskobservation maskstoredvalues maskexport entryhashof logentryof openrunlog lasthashof appendlogentry sealrunlog verifylogchain readverifiedlog chainreportof exportlogchain credentialstep originlabels lookalikedistance phishthresholdvalid phishverdictof verdictfresh phishnotetext vaultdigestprefix vaultdigestof vaultentryof inmemoryvault vaultstore vaultvaluefor vaultdelete vaultcovers secretleakscan secretshapecarrying vaultview vaultprompttext permissiondiff permdiffchanged permdiffsummary transparencygrants revokeaction windowhistory connectallowlist",
    "serve.ts": "jsonrpcmessage encodemessage decodemessage framesof batchof isnotification notificationframe errorwithretry structuredof errorresponse resultresponse toolresultof resourceuris servedresources resourceof readresource subscriberesource publishchange resourcechangeframe resourceslist walkthroughprompts templateprompt listmcpprompts rendermcpprompt promptsof",
    "server.ts": "kams kasuppressms sseheaders ndjsonheaders writeevent writekeepalive writedone safeenqueue safeclose maskmodel discardheartbeat parsesseframes extractdata isdone makechunk makefinalchunk makestreamresponse trackwrite trackedstream streamoptions createserver main extracttoken extractchatid extractsessionid extractrequestid validatetoken masktoken resolvekeys buildauthheaders buildauthqueryparams appendqueryparams getkey getkeycount runclifamily getversion listversions loadconfig reloadconfig validateconfig db getsession getsessionmessages savemsg createversion engineinternals authmethod authconfig bodybuildconfig contextconfig dbconfig gatewayconfig gatewaydefinition headersconfig intelligencerank keysource metamodelconfig modeldef resolvedkey retryconfig rotationconfig rotationmode routesconfig sessionstate thinkingconfig thinkinglevel timeoutconfig transportconfig transporttype upstreamdef versionhandlers autofrequencypenalty automaxtokens auton autopresencepenalty autoseed autotemp autothinking autotopp clamp corsheaders defaultmaxtokens detectcontenttype esttokens genid getip handlecors jsonheaders levenshtein makethinker safejsonparse safestringify thinkingbudget truncatemessages ModelCatalogEntry OpenCodeJsonLocation ServerOptions ServerHandle startServer",
    "session.ts": "sessionkinds sessionfileversion snapshotsections searchfields taskstatechecksum taskstateof taskstatevalid sessiontabof autointervalof snapshotplanof restoreplanof searchqueryof sessionfolderof newsessionrecord diffsessionrecords newsessiondiff searchsessionrecords exportsessionfile importsessionfile expiresessions filteredsessions crashinterrupted sealnotebody opennotebody sitenoteof notebodyof editnote expirnotes scratchentryof scratchpadof prunescratchpad distillrunsummary summaryhistoryentry notehistoryentry recallentryof addrecallentry rankrecall expirerecallindex editedcorrectionof rejectedcorrectionof matchingcorrections expirecorrections consentmemoryof consentadvisory consentadvisoryverdict rollbacksplit rollbackof cancelrunactionof errorsurfaceof classifyfailure retryhintof sessiongridrows historyqueryof addhistoryentry highlightterms historysearch emptystatemessage tabsessionkey tabsessionrefof sessionbundleof recallseam",
    "shellterminal.ts": "ControlShellTerminalProps ControlShellTerminal",
    "sidepanel.ts": "",
    "soak.ts": "runsoaksuite soakreport soakrecord",
    "storage.ts": "databasedriver StoredWorkspace StoredTab StoredMessage StoredSession StoredPreference mirrorSession readPreferences savePreference DEFAULTQUOTAMB StorageError ownervalid keyvalid StorageObject StorageUsage putobject getobject deleteobject usagefor listobjects preparestorage db savemsg getsession getsessionmessages onboardingflags onboardingstagename getonboardingstate setonboardingstage copyrow listcopyrows upsertcopyrows planrow getplan setplan QUOTACEILMB TIERQUOTAMB quotaanswer planquota planquotamb ensureplanstore BrowserIdentity BrowserRoute BrowserWorkspace BrowserSession BrowserTab BrowserMessage BrowserPreference BrowserCredential BrowserSessionSnapshot BrowserStoreSummary browserIdentity activateOwnerDrive cacheBrowserIdentity readBrowserPreferences BrowserLabel saveLabel readLabel readAllLabels readBrowserCredential saveBrowserPreference saveBrowserCredential removeBrowserCredential browserCredentialProviders ensureBrowserSession loadBrowserSession saveBrowserTab removeBrowserTab removeBrowserMessage saveBrowserMessages cacheGatewaySession browserStoreSummary browserWorkspaces HardDrive DRIVES_KEY drives newdrive opendrive renamerive SessionSection SessionTab SessionMessage Workspace Session createWorkspace loadWorkspace createSession loadSession createTab updateTab appendMessage listSessions renderSessionMarkdown exportSession MemoryLayer MemoryEntry MemoryQuery createMemoryStore MemoryStore memorySummary SyncSnapshot RemoteSyncStatus exportLocalSnapshot remoteSyncStatus",
    "swarm.ts": "electleader assignwork collectresults scaleworkers plannersplit reportstep requestreview ackreview applyreview sweepreviews checkclaim boardstate escalate resolveescalation arbitrate openconsensus castvote consensusstate laneownership emptyqueue enqueue claim steal complete canceltask claimheartbeat requeue lanereport queuecomplete taskcounts blackboardsections emptyboard postentry entryfresh readentries retireentries retireentry inheritconsent boardsummary",
    "sweep.ts": "runsweepsuite sweepreport sweeprecord",
    "telemetryfree.ts": "runtelemetryfreesuite telemetryfreereport telemetryfreerecord",
    "tools.ts": "toolcatalogversion toolnamespaces domainkinds toolschemaof openapilayout buildtoolcatalog alltools toolname resolvetool namespaceof toolsbynamespace defaultidempotencywindowms applyratelimit structurederrorof callretryhintof maptoolerror checkidempotency recordidempotency expireidempotency runbatch dryruntool applymock begincall endcall batchrisk",
    "transparencypage.ts": "",
    "types.ts": "protocolversion protocolmajorversion pinnedprotocolversion actionkind actionkindids actionrisk planstate auditkind datainventory purgepolicy syncsettings syncrecord cookiejarrecord cleanupschedule localrule telemetrypolicy exportallbundle observationmode toolstep agentplan agentsession endpointconfig observation auditevent diagnosticreport capabilityreport stepoutcome runsettings proposalrequest planproposal policyevaluation planprogress targetmode targetref pointref pointpath speedprofile keyholdstate dialogpolicy framepath shadowpath retryrule mapentry clickablemap resolvedtarget dialogdecision retryoutcome resolutionsummary a11ynode readerarticle listpattern tableshape jsonstate mutationwatch quietrule mutationevent focusevent bannerreport diffentry snapshotdiff selectorcandidate derivedselector watchregistration observationrecord a11ycapture readercapture pagesignals templateprofile navtarget waitoverride waitprofile urlpattern redirecthop redirectchain trailentry ratelimit navstate waitprofilerecord navrecord navintentrecord ratelimitstate curatedlink curatedlist authrecord safetyverdict artifactrecord navcontrol recenttab navqueues prefetchplan preconnecttarget deeplinkpattern closedtabrecord navtrailentry ratelimitwindow linkbatch navpause dedupekey sourcestamprecord extractrow streamcursor extractbatch gridcolumn provlogentry samplepolicy dedupereport streamfilerecord extractpipeline longpollrequest graphqlsubscription multipartfield correlatedrequest correlationcontext ratelimitdirective cacheentry apicallrecord ocrregion ocrword ocrline ocrresult visionrequest visionlabeledregion visiondescription redactionmask screenshotpair groundingmatch groundingresult framereference visioncacheentry beforeafterpair consoletraceentry nettraceentry diffbaserecord diffresult thumbnailrecord timelapseconfig timelapseframe capturenamerule capturebundle tabquery tabgroupspec tabgrouprecord windowbounds windowstate layouttab tablayout tabmeta tabbadge tabreportentry tabreport sessionsnapshot closedtab tabwatchevent controltabstate fieldkind fieldmatch formentry formrecord valuegen formprofile wizardstate submitticket fielderror errorreport captchahandoff detectionrecord typeaheadpick formreport columnspec datasetrow sourceref dataset transformrule extractsession provenancerecord exportedartifact streamstate sheetendpoint taskrules downloadspec downloadstate downloadrecord mimefilter netlogrecord clipentry scanverdict quarantineentry capturename cleanuprule clipboardconsentrecord scanhookconfig capturecounter artifactinventoryentry cleanuprun captureformat captureexport capturepolicy captureoptions regionrect stitchplan sheetlayout capturenaming shotrecord shotpair pdfrecord pdfoptions recordingrecord recordingoptions framerecord imagedescriptor imagefilter canvasrecord streamrecord mediadatum assetrecord lapseplan convertdirective thumbdirective imagebatch recordingconsentrecord mediarecord fetchrequest fetchoptions streamwindow jsonpathrule parsedfield htmlquery payloadfield payloadschema endpointrecord graphqlrequest fetchconsent callrecord channelstate channelrecord socketoptions messageenvelope messagefilter exchangerecord responseentry headerfilter bodyfilter eventsubscription pollcursor apimapentry apireplayspec bodyrecord blockrule mockspec headerule cookierecord cookieoperation oauthflow tokenrecord apikeyentry proxyroute ratelimitread formpayload multipartpayload revocationrule loglevel timelinesource timelineentry consoleentry stackframe errorrecord rejectionrecord netfailureentry longtaskentry spamrule loglevelset rotationrule consoleline consolediff consoleconsentrecord rotationtargetrecord levelsummary cdpsession cdpcommand cdpeventrule breakpointspec pausestate stepmode watchexpression scriptoverride cdpallowlist debuggergrant teardownplan flowmetric flowspec heaprecord growsample cpuprofile shiftentry traceannotation tracerecord attachtarget sourcemapref memorytrend sourcemapconsent devicepreset networkpreset locationpreset agentpreset permissiongrant permissionstate blackboxrule emulationfamily emulationlayer emulationstate locationconsent permissionoverriderecord presetlibrary taskstate sessionevent sessiontab sessionrecord snapshotscope snapshotplan restoreplan autointerval sessionfolder sessionchange sessiondiff searchfield searchquery sessionmatch sessionfile workflowprovenance autosnapshotstate workflowrecord workflowstep workflowblock blockinvocation steptemplate variablekind variablevalue variablescope variablebinding expressionoperand expressionoperator expressiontype regexrule delaystep waitstep runstate workflowrun runlogentry conditionstep branchpath branchstep loopstep repeatuntilstep whilestep foreachstep parallelbranch joinstep parallelstep retrypolicy errorhandler timeoutpolicy trystep loopcounter branchoutcome retryattempt timeoutabort joinrecord paralleloutcome controlflowdecision triggerfamily triggerule webhookfield triggerstate rulestats triggerfire manualrun editornode editoredge editorlayout minimapstate editormodel palettecategory palettenode steplibraryentry workflowversion versiondiff runhistoryentry exportformat workflowfile nestedparam workflowimport siteoverride watchdogconfig watchdogrecord toolnamespace transportkind serverstate rpcerrorcode rpcerror jsonrpcframe toolschemaproperty toolschema consentmeta tooldef tooldomain toolcatalog toolresult capabilityset clientrecord methodentry mcpserverconfig mcpserverstate stdiobridge bridgelaunch nativecallclass nativesurfacekind nativehoststate nativeerror nativecallrecord nativekillswitch companionhandshake wsbridgesession nativeframe toolcallrecord tokenhash pairingstate approvalstate tlsmode authmethod tlsconfig httpstreamconfig clientidentity sessiontoken pairingcode allowlistentry approvalrequest approvalexec authchallenge authhandshakeevent approvaltimeout remoteconfig streamchannel eventkind protocoleventsubscription resourcewatch samplingrequest promptdef streamchunk progressnotice cancelframe callratelimit retryhint structurederror idempotencykey idempotencyrecord batchmember batchcall batchoutcome tooldryrun toolmock callcontext servetransport clientbinding servedresource servehealth agentstate agentrole agentidentity taskstatekind taskitem claimrecord queuecompletionpolicy taskqueue messagerouting agentmessage agentmailbox blackboardsection blackboardvaluekind blackboardentry blackboard agentbudget agentscope agentrecord budgetstate spawnrequest depthlimit killswitch spawnrecord agentusage agenteventkind agentevent swarmstate reviewverdict leaderworker workerassignment criticreview verifieroutcome verifiercheck plannerexecutor executorreport handoffstate handoffrequest handoffrecord lockkind resourcelock conflictwriter conflictscan mergerule mergeentry reportsection resultreport boardmilestone boardlane progressboard reviewrequeststate reviewrequest reviewrecord escalationrecord arbitrationstrategy arbitrationrule consensusvote consensusround consensusrecord replayrecord comparisonrecord subagentspec aggregatecell aggregaterecord interleaveevent lessonrecord arbitrationcase arbitrationverdict tasklane loadreport costentry swarmaction swarmcost outputcomparison environmentkind environmentrequirement workerrequest workerresponse sandboxrender sandboxrenderresult keepalivestate keepaliveevent urlhistoryentry environmentprovenance runstaterecord workerevent offscreenregistryentry runlock sealedrunstate sensitiveclass logeventkind loghash immutablelogentry sealedlog storedrunlog originprofile automationallowlistentry consentwindow consentscope revokerunevent classconsent maskrule deniedevidence revocationevidence securityview secretprovenance secretvaultentry vaultseam redactregion capturesurface schemaerror origincheckverdict connectallowentry ratelimitbucket deferredevent gatekind confirmgate gateresolution gatewaitevidence phishverdict permdiffrecord safedefaultapplication transparencygrant sitenote scratchpadentry runsummary recallquery recallindexentry recallmatch correctionentry consentmemoryentry sessiongridrow historysearchquery historysource historyindexentry historysearchhit errorcause errorsurface rollbackdescriptor cancelrunaction emptystatesurface tabsessionref uisurface paletteaction paletteentry palettematch taskinputsubmission proposalstatus stepstimelinenode logstreamevent logstreamfilter plancard plancardgroup stepapproveresolution diffchange diffpreviewpayload onboardingstep onboardingstate surfaceaction surfaceroute broadcastchannelkind broadcastframe surfacelayout paletteuserecord datagridcolumn datagridrow datagridview exportmenudescriptor quickaction shortcutbinding omniboxtasksubmission statusbadgestate notificationpayload recenttrayentry pickercandidate pickersession targethalo guidedtip shotpanelview compareviewerpair siteprofile darklighttokens localebundle importexportpayload dropimportsession featuretourstop a11ylabel pagechipconfirmation stetoast flowlibrarymanifest flowlibrarystep dataexpectation publishdescriptor flowlibraryentry libraryevent syncbridgehook syncbridgeconflict attentioncause attentionentry backgroundqueueentry runreplaystep runreplaysession outputcomparesession planlintseverity planlintdiagnostic planfilestep planfile portablerule portableruleset flowrunrequest flowrunoptions flowrungate flowrunevent flowrunoutcome exportdescriptor exportresult consentprovider headlesssession headlessevent platformtarget platformmatrix capabilityprobe runtimeadapterdeclaration featuredowngrade librarymode clockadapter loggeradapter fetchadapter adaptercontract bundlemode lazymoddescriptor lazyloadrecord startupbudget debounceprofile debouncedbatch batchqueryplan snapshotchange incrsnapshotdelta selcacheentry selcacheinvalidation selcachestate virtlistwindow streamparsetoken streamparsechunk chunkextractcursor chunkextractwindowresult perfrecord queuedepthsample backpressuresignal domainlane politedelayprofile adaptivepollwindow coalescedrequest runbudgetrecord budgetalert timeoutcancelpolicy timeoutcancelevent tabsuspendstate runcacheentry stepprefetchhint durationsample selectorstats steptracespan startupsample batteryawarestate networkretryrule readparallelgroup warmselectorrecord cadencecontrol slowmosession resumepoint navdedupeentry sessionreusegrant artifactcompressrecord logprunerule runrecord checkpointrecord rollbackitem queuedtask heartbeatrecord runtransition urlvisit runtimelineevent memoryprovenance expiryrule quotareport tabstate lockrecord auditexportrecord memoryitem cliconfiguration planrisksummary headlessfixture headlessfixtureoutcome libraryrunhandle manifestcheckfinding workflowdocument runworkflowoutcome servercontractversion serveroperation servereventtype servercontractcapabilities serverenvelope sessionmember bridgepairingrecord relaytokenrecord bridgesessionrecord bridgeeventrecord bridgequeuerecord bridgereviewcard bridgereviewdecision bridgekillswitch webextensionbrowser webextensionapikind webextensionapientry apibrowserprobeinput apimapbrowserprobe apimapresolution apimapreport apimapstructerror browsermanifestsource browsermanifestoverlay browsermanifestadapted xpipackinput xpipackoutput safariskeletoninput safariskeletonoutput crossbrowserfeatureflagset vsixmanifestfields vsixpackinput vsixpackoutput mavenattachedartifact mavenpommetadata nugetcontententry nugetpackmetadata containerbuildstage containerexposedsurface artifactmanifestentry artifactmanifestdocument sbominventoryinput relayserverconnection relayserversession relayserverstate",
    "uistore.ts": "uistoreseedrows uicopyrow loaduicopy uicopy useUicopy uistoreget uistorelist uistoreupsert uistoreingest CopyRow loadcopy copy copyseed label seedLabels",
    "umd.ts": "",
    "umdwrap.ts": "umdwrap",
    "useismobile.ts": "WindowBodySurface useContainerWidth useIsMobile",
    "usestoredstate.ts": "Validator useStoredState refocus isString isNumber arrayOf isObjectWith useStoredFlag",
    "version.ts": "packageversion protocolmajor protocolfloormajor",
    "views.ts": "surfacepalette palettecommandsof palettequery paletteuseafter taskinputof taskhistoryafter onboardingsteps onboardingstart onboardingcomplete broadcastframeof broadcastchannelof busrouteaction clicommands reviewdialogorder focusorderof statusbadgeof badgetextof badgecolorof pluralize countlabel notifydoneof notifyattentionof notificationrespectsdnd recenttrayentryof recenttrayafter recenttrayactions stetoastof stetoaststackafter stetoasthistory stabilityscoreof pickercandidateof pickersessionstart rankcandidates lockcandidate haloof halocolorof guidedtips guidedtipdismiss guidedtiprecall pagechipof pagechipresolve featuretourstops featuretourordered featuretourstopat a11ylabelof a11ylabelsfor a11ylabellocalized a11ylabelslocalizedfor shotpanelof shotpanelzoom shotpanelpan comparepairof overlayslider comparepairsforsteps infercolumntype datagridcolumnsof datagridof sortdatagridrows filterdatagridrows selectrowrange exportrowsof exportmenudescriptors maskedvalueof exportdatagrid openvirtlist scrollvirtlist measurevirtlistrows virtlistrows virtlistheight virtlistsavings heightmapkey heightmaprecord siteprofileof siteprofileactive siteprofilefor darklighttokensof resolveappearance applytheme highcontrasttokens contrasttokensof applycontrasttheme panelwidthbounds clamppanelwidth panelwidthsof panelwidthslayout resizepanel localebundles localestring supportedlanguages localeformat quickactioncatalog quickactionsfor shortcutdefaults parseshortcut shortcuttext shortcutbindingafter shortcutcommandof shortcutdispatchable parseomniboxtask omniboxtasktotaskinput attentionseverityof attentiondeeplinkof attentionentryof collectattention dedupeattention rankattention attentioncountof dismissattention pruneattention attentionnotifications",
    "vite.config.ts": "EOL arch platform release type hostname homedir tmpdir cpus totalmem freemem uptime loadavg networkInterfaces userInfo constants sep delimiter isAbsolute normalize join resolve dirname basename extname relative posix win32 existsSync mkdirSync writeFileSync appendFileSync renameSync chmodSync unlinkSync statSync readFileSync readdirSync mkdir writeFile rename readFile stat readdir randomUUID randomBytes randomInt createHash createHmac scryptSync timingSafeEqual pathToFileURL fileURLToPath inspect format promisify env argv pid versions cwd nextTick isatty lookup createInterface default defineConfig",
    "vitest.config.ts": "defineConfig",
    "wcag.ts": "runwcagsuite wcagreport wcagrecord",
    "window.ts": "WindowEntry WINDOW_ANCHORS FAMILY_SLUGS familyentries windowcatalog WindowSpawn windowspawn windowapp SpawnViewport SpawnFit DESKTOP_TASKBAR SPAWN_TOP_OFFSET spawnfit",
    "workflow.ts": "workflowkinds stepexecution workflowstepof blockinvocationof workflowblockof steptemplateof expressionoperators expressionof regexruleof expandblocks composeworkflow validateworkflow pushscope popscope resolvevariable setvariable bindvariables expressioneval regexextract waitelementplan delayjitter seededrandom newworkflowrun pauserun cancelrun runstep runworkflow dryrunworkflow watchdogverdict watchdogpass controlflowkinds defaultloopbound controlexecute iscontrolflowkind cancellederror conditionof branchof loopof repeatuntilof whileof foreachof parallelof tryof validatecontrolpayload controlsteps controlsummary evaluatecondition choosebranch runloop runrepeatuntil runwhile runforeach joinbranches runparallel backoffdelay applyretry applytimeout applyruntimeout runcatch runtry runcontrolstep controlexecutor triggerkinds triggerfamilies triggereventcatalog defaulttriggercooldown istriggerkind triggerfamilyof triggerpayloadof webhooksecretok timezonevalid armrule updaterule matchurl visitmatch cronparse cronnext schedulecron scheduleinterval listdue applycooldown triggerdecision evaluatetrigger queuefire drainqueue runurllist verifywebhook eventrulematches observeevents pauseall resumeall manualpreview confirmmanualrun triggersummary ruleorigins ruleoriginsgranted palettecategories palettenodes buildsteplibrary loadworkflow saveworkflow snapnode reordersteps groupselect expandtemplate addnode editstep renderminimap minimapfocus zoomcanvas searchsteps markbreakpoint runtobreakpoint diffversions exportworkflow shareworkflow importworkflow bindparam applyoverride addedge removeedge removenode undoedit redoedit",
    "workspace.ts": "workspaceDestinations WorkspaceDestination isWorkspaceDestination workspaceDestination",
  };

  /** live cross-app import edges of devthink root files — the dedup law at work. */
  const devthinkCross: CrossImports = {
    "background.ts": [
      { from: "@wenathlan/getry/types", symbols: ["baseurlconfig", "commandparse", "costbudget", "gatewaychatstate", "gatewaychattoken", "gatewayerror", "gatewaykind", "gatewaymodelinfo", "localmodelconfig", "modelcacherecord", "modeloutput", "modelroute", "plandraft", "prompttemplate", "providerconfig", "protocolstyle", "reflectnote", "replanrecord", "usagerecord", "default"] },
      { from: "@wenathlan/getry/llm", symbols: ["budgetcheck", "calllocal", "callmodel", "classifyintent", "draftplan", "islocalorigin", "parsecommand", "reflectionsummary", "reflectstep", "replannonfail", "usagetotals", "rendertoolbriefs"] },
      { from: "@wenathlan/getry/llm", symbols: ["capabilityadvertisement", "composegatewayprompt", "costestimates", "defaultbaseurl", "fetchmodellist", "gatewaybudgetcheck", "gatewaybudgetwarning", "gatewaycancel", "gatewaychatstateof", "gatewayerrorfrom", "gatewayislocal", "gatewaystream", "gatewaytemplates", "gatewayusagerecord", "maskkey", "maskrequest", "resolvegatewayroute", "resolveproviderkey", "revokeproviderkey", "storeproviderkey", "streamrender", "validategatewayconfig"] },
      { from: "@wenathlan/getry/llm", symbols: ["bumprevision", "fallbackroute", "markprovider", "resolveroute", "routevalid"] },
      { from: "@wenathlan/getry/llm", symbols: ["latesttemplate", "removetemplate", "savetemplate", "searchtemplates"] },
    ],
    "build.ts": [
      { from: "../foundry/bundlescan.ts", symbols: ["stripstrings", "underscorednames"] },
    ],
    "config.ts": [
      { from: "@wenathlan/getry/models", symbols: ["MODELS_2026_LEGACY"] },
      { from: "@wenathlan/getry/accounts", symbols: ["RotationStrategy", "default"] },
      { from: "@wenathlan/getry/fingerprint", symbols: ["buildGeminiUserAgent", "X_GOOG_API_CLIENT_GEMINI_CLI"] },
      { from: "@wenathlan/getry/constants", symbols: ["CLIENT_METADATA", "CLIENT_METADATA_STRING", "CLOUDCODE_BASE_URL", "CLOUDCODE_ENDPOINTS", "GEMINI_CLI_OAUTH_CLIENT_ID", "GEMINI_CLI_OAUTH_CLIENT_SECRET", "GEMINI_CLI_SCOPES", "GEMINI_CLI_USER_AGENT", "PROJECT_FALLBACK"] },
      { from: "@wenathlan/getry/models", symbols: ["Model2026", "default"] },
    ],
    "costcert.ts": [
      { from: "@wenathlan/getry/types", symbols: ["providerconfig", "default"] },
    ],
    "devthink.ts": [
      { from: "@wenathlan/getry/providers", symbols: ["listModels", "listProviders", "streamChat"] },
      { from: "@wenathlan/getry/streaming", symbols: ["ChatEvent", "default"] },
    ],
    "examplelocaljob.ts": [
      { from: "@wenathlan/saddle", symbols: ["engine", "eventbus", "inprocess", "scheduler"] },
      { from: "@wenathlan/saddle/memory", symbols: ["localmemory", "localstorage"] },
    ],
    "mcp.ts": [
      { from: "@wenathlan/getry/types", symbols: ["prompttemplate", "default"] },
    ],
    "media.ts": [
      { from: "@wenathlan/cadria/transcode", symbols: ["default"] },
    ],
    "memory.ts": [
      { from: "@wenathlan/getry/types", symbols: ["baseurlconfig", "commandparse", "costbudget", "gatewaychatstate", "localmodelconfig", "modelcacherecord", "modeloutput", "modelroute", "plandraft", "prompttemplate", "providerconfig", "reflectnote", "replanrecord", "usagerecord", "default"] },
    ],
    "os.ts": [
      { from: "@wenathlan/getry/thinking", symbols: ["ThinkingLevelName", "default"] },
    ],
    "policy.ts": [
      { from: "@wenathlan/getry/types", symbols: ["costbudget", "draftstep", "gatewaykind", "modeloutput", "plandraft", "providerconfig", "replanrecord", "default"] },
    ],
    "protocol.ts": [
      { from: "@wenathlan/getry/types", symbols: ["modeloutput", "plandraft", "default"] },
    ],
    "sandboxlane.ts": [
      { from: "@wenathlan/saddle/workloadlaw", symbols: ["lanesof", "WorkloadLane"] },
      { from: "@wenathlan/saddle/modalityregistry", symbols: ["MODALITIES", "planreport"] },
    ],
    "serve.ts": [
      { from: "@wenathlan/getry/llm", symbols: ["rendertemplate"] },
      { from: "@wenathlan/getry/types", symbols: ["prompttemplate", "default"] },
    ],
    "server.ts": [
      { from: "@wenathlan/getry/providers", symbols: ["ChatMessage", "listModels", "listProviders", "streamChat"] },
      { from: "@wenathlan/getry/server", symbols: ["createserver", "loadconfig"] },
      { from: "@wenathlan/getry/cli", symbols: ["runclifamily"] },
    ],
    "storage.ts": [
      { from: "@wenathlan/getry/providers", symbols: ["ChatMessage", "default"] },
    ],
    "uistore.ts": [
      { from: "@wenathlan/vault/labelstore", symbols: ["createLabelStore", "LabelRowStore"] },
    ],
  };

  /**
   * forge — the binary runner sandbox leaf.
   * 19 root logic files, 120 exported logics, owner forge.
   */
  const forgeRaw: RawFileLogics = {
    "api.ts": "routes",
    "capacitor.config.ts": "config",
    "cli.ts": "main",
    "db.ts": "Runner RunEntry OnboardingStateRow LabelRow runners runnerRuns addRunner logRun getonboardingstate setonboardingstage saveLabel readLabel readAllLabels seedLabelRows",
    "drizzle.config.ts": "defineConfig",
    "family.ts": "FAMILY_SLUGS FamilyMember FAMILY_ACCENTS familyAccentOf familyrow familyurl",
    "fleet.ts": "RUNNER_MODES RunnerState RUNNER_STATES RunnerHealth HEALTH_LADDER Runner HealthRung RED_FAILURE_RATE AMBER_LOAD AMBER_FAILURE_RATE mulberry32 failureRate healthRungOf seedFleet FleetSummary fleetSummary fleetTick pickRunner",
    "graphplan.ts": "planstate PLAN_STATES planstepkind planstep planwire runplan plannode planedge plangraph planposition RUNPLAN plancopy planstepof planfeeders plannext planstages plandepth planvalid plangraphof planpositions planbounds planstateissettled plantally planprogress planfailindex planrehearsal",
    "hometypes.ts": "HomeProps",
    "labels.ts": "LABEL_REVISION LABEL_MANIFEST LabelKey label labelfill seedLabels",
    "onboardingstate.ts": "OnboardingSnapshot readOnboardingState loadOnboardingState markIntroSeen markOnboardingSeen",
    "queue.ts": "QueuePriority QUEUE_PRIORITIES PRIORITY_RANK QueueItem queueOrder enqueue cancel dequeue queueDepth depthByPriority positionOf queueFromSeed nextUp",
    "runner.ts": "runnermodes RunnerMode",
    "runstream.ts": "LogLevel LogLine RunOutcome runLogLines logOutcome linesWithin logDuration formatLogTime logText logCensus",
    "sandboxmodality.ts": "AppWorkloadLane APPSLUG WORKLOADLANES SANDBOXLANEENV LaneSeatResult lanesandbox lanesandboxfromenv laneof",
    "theme.ts": "Theme currentTheme applyTheme initTheme toggleTheme",
    "utils.ts": "",
    "vite.config.ts": "defineConfig",
    "vitest.config.ts": "defineConfig",
  };

  /** live cross-app import edges of forge root files — the dedup law at work. */
  const forgeCross: CrossImports = {
    "api.ts": [
      { from: "@wenathlan/vault/routes", symbols: ["routes"] },
    ],
    "runner.ts": [
      { from: "@wenathlan/saddle/modes", symbols: ["runnermodes", "RunnerMode"] },
    ],
    "db.ts": [
      { from: "@wenathlan/vault/storage", symbols: ["openStorageLane"] },
    ],
    "labels.ts": [
      { from: "@wenathlan/vault/labelstore", symbols: ["createLabelStore"] },
    ],
    "utils.ts": [
      { from: "@wenathlan/vault/utils", symbols: ["*"] },
    ],
  };

  /**
   * foundry — the pipeline and network DB leaf.
   * 23 root logic files, 116 exported logics, owner foundry.
   */
  const foundryRaw: RawFileLogics = {
    "api.ts": "routes",
    "artifact.ts": "utf8Bytes fnv1a fnv1aHex Artifact artifactIdentity sealArtifact artifactLine manifest seedArtifacts verifyArtifact",
    "bundlescan.ts": "stripstrings platformnames wireformatnames gatewaywirefields maeneconfigfields underscorednames",
    "capacitor.config.ts": "config",
    "cli.ts": "main",
    "db.ts": "SqlParam tables db ensureSchema OnboardingStateRow OnboardingFlags getOnboardingState setOnboardingStage LabelRow saveLabel readLabel readAllLabels seedLabelRows",
    "dependencyupdates.ts": "",
    "drizzle.config.ts": "defineConfig",
    "family.ts": "FAMILY_SLUGS FamilyMember FAMILY_ACCENTS familyAccentOf familyrow",
    "familyurl.ts": "familyurl",
    "graphplan.ts": "planstate PLAN_STATES planstepkind planstep planwire runplan plannode planedge plangraph planposition PIPELINE plancopy planstepof planfeeders plannext planstages plandepth planvalid plangraphof planpositions planbounds planstateissettled plantally planprogress planfailindex planrehearsal planopensteps",
    "hometypes.ts": "HomeProps",
    "imagestore.ts": "ImageFormat FormatSpec FORMATS formatOf formatFromExt ConvertPlan convertPlan estimateSize pourOrder HerdImage seedImages formatBytes",
    "labels.ts": "LABEL_REVISION LABEL_MANIFEST LabelKey label labelfill seedLabels",
    "npmgate.ts": "",
    "onboardingstate.ts": "OnboardingSnapshot readOnboardingState loadOnboardingState markIntroSeen markOnboardingSeen",
    "readiness.ts": "readinessreport runreadinesssuite readinessrecord",
    "runner.ts": "runnermodes",
    "sandbox.ts": "canTransition refusalFor SandboxState SANDBOX_STATES Sandbox SandboxAction drive step mulberry32 seedHerd HerdCensus herdCensus",
    "sandboxmodality.ts": "AppWorkloadLane APPSLUG WORKLOADLANES SANDBOXLANEENV LaneSeatResult lanesandbox lanesandboxfromenv laneof",
    "utils.ts": "",
    "vite.config.ts": "defineConfig",
    "vitest.config.ts": "defineConfig",
  };

  /** live cross-app import edges of foundry root files — the dedup law at work. */
  const foundryCross: CrossImports = {
    "api.ts": [
      { from: "@wenathlan/vault/routes", symbols: ["routes"] },
    ],
    "runner.ts": [
      { from: "@wenathlan/saddle/modes", symbols: ["runnermodes", "RunnerMode"] },
    ],
    "db.ts": [
      { from: "@wenathlan/vault/storage", symbols: ["openStorageLane"] },
    ],
    "labels.ts": [
      { from: "@wenathlan/vault/labelstore", symbols: ["createLabelStore"] },
    ],
    "readiness.ts": [
      { from: "../devthink/tests/freezebaseline.ts", symbols: ["apifreezebaseline"] },
      { from: "../devthink/tests/permbaseline.ts", symbols: ["permdiffbaseline"] },
      { from: "../devthink/tests/schemafixtures.ts", symbols: ["frozenschemas"] },
      { from: "../devthink/records.ts", symbols: ["syncmode", "syncrecord"] },
      { from: "../devthink/agentcert.ts", symbols: ["agentcertrecord"] },
      { from: "../devthink/costcert.ts", symbols: ["costcertrecord"] },
      { from: "../devthink/doccheck.ts", symbols: ["doccheckrecord"] },
      { from: "../devthink/matrixverify.ts", symbols: ["matrixverifyrecord"] },
      { from: "../devthink/pentest.ts", symbols: ["pentestrecord"] },
      { from: "../devthink/poolaudit.ts", symbols: ["poolcoveragerecord"] },
      { from: "../devthink/recipes.ts", symbols: ["reciperecord"] },
      { from: "../devthink/soak.ts", symbols: ["soakrecord"] },
      { from: "../devthink/sweep.ts", symbols: ["sweeprecord"] },
      { from: "../devthink/telemetryfree.ts", symbols: ["telemetryfreerecord"] },
      { from: "../devthink/wcag.ts", symbols: ["wcagrecord"] },
      { from: "../devthink/tests/readinessautoma.ts", symbols: ["readinessmigrateautoma"] },
      { from: "../devthink/tests/readinessselenium.ts", symbols: ["readinessmigrateselenium"] },
      { from: "../devthink/tests/readinesstabular.ts", symbols: ["readinessmigratetabular"] },
      { from: "../devthink/tests/readinessuivision.ts", symbols: ["readinessmigrateuivision"] },
      { from: "../devthink/tests/readinessv1.ts", symbols: ["readinessmigratev1"] },
    ],
    "sandbox.ts": [
      { from: "@wenathlan/saddle/sandbox", symbols: ["canTransition", "refusalFor", "SANDBOX_LIFECYCLE_ACTION_TARGETS", "SANDBOX_LIFECYCLE_STATES", "SandboxLifecycleAction", "SandboxLifecycleState"] },
    ],
    "utils.ts": [
      { from: "@wenathlan/vault/utils", symbols: ["*"] },
    ],
  };

  /**
   * getry — the AI gateway leaf, 5 providers and 35 routes.
   * 46 root logic files, 1628 exported logics, owner getry.
   */
  const getryRaw: RawFileLogics = {
    "accounts.ts": "GEMINI_CLI_OAUTH_CLIENT_ID GEMINI_CLI_OAUTH_CLIENT_SECRET OAUTH_TOKEN_URL PROJECT_FALLBACK GEMINI_CLI_USER_AGENT GEMINI_CLI_USER_AGENT_FULL X_GOOG_API_CLIENT MODELS_2026 Model2026 email refresh_token resolveConfigDir GEMINI_CLI_CLIENT_ID_RAW ANTIGRAVITY_CLI_OAUTH_CLIENT_ID ANTIGRAVITY_CLI_OAUTH_CLIENT_SECRET OAuthClientConfig OAuthClientKey AccountMetadataV3 AccountStore RotationStrategy AddAccountInput ImportResult TokenRefreshResponse QuotaInfo Account AccountsFileV3 RefreshResult QuotaExhaustedOptions resolveAccountsFilePath resolveAccountsPath resolveAntagravityManagerCandidates ensureAccountsFile loadAccountsSnapshot isQuotaError AccountManagerOptions AccountManager getDefaultAccountManager resetDefaultAccountManager getValidAccessToken getActiveAccount ACCOUNTS_FILE_PATH ACCOUNTS_INFO",
    "antigravity.ts": "Account ANTIGRAVITY_VERSION_FALLBACK CONTENT_TIMEOUT_MS FALLBACK_PROJECT_ID FORBIDDEN_HEADERS GEMINI_CLI_SCOPES PLUGIN_VERSION FETCH_TIMEOUT_MS fnv1a32 fnv1a32Hex getJitter buildAntagravityHeaders getDynamicUserAgent ALL_MODELS_2026 ANTIGRAVITY_VERSION_MIN CODE_ASSIST_ENDPOINTS ENDPOINT_ORDER ENDPOINT_ORDER_GEMINI_CLI GEMINI_CLI_ONLY_MODELS MODELS_2026_BASE MODELS_2026_ANTIGRAVITY_ALIAS THINKING_BUDGET_MAP THINKING_LEVELS buildImageGenConfig getEndpointsForModel isGeminiCLIOnlyModel isImageGenModel mapModelToGroup MODELS_2026_PROVIDER ModelId2026 ThinkingLevel resolveProjectId ResolveProjectIdOptions ResolveResult PluginOptions PLUGIN_ID VERSION notifyUser AntigravityPlugin getPlugin plugin detectOpencodeProviderId buildOpencodeAuthHook injectAntigravityProvider opencodeServer providerServer googleAuth antigravityAuth opencodePluginModule",
    "auth.ts": "extracttoken extractchatid extractsessionid extractrequestid validatetoken masktoken resolvekeys buildauthheaders buildauthqueryparams appendqueryparams getkey getkeycount",
    "capacitor.config.ts": "config",
    "cli.ts": "config runclifamily defineConfig",
    "constants.ts": "ANTIGRAVITY_VERSION_FALLBACK ANTIGRAVITY_VERSION_MIN_SUPPORTED ANTIGRAVITY_BLOCKED_VERSIONS ANTIGRAVITY_VERSION_REMOTE_URLS VERSION_FETCH_TIMEOUT_MS ANTIGRAVITY_USER_AGENT_FALLBACK ANTIGRAVITY_USER_AGENT GEMINI_CLI_USER_AGENT_FALLBACK ANTIGRAVITY_USER_AGENT_MAENE GEMINI_CLI_USER_AGENT GEMINI_CLI_USER_AGENT_MINIMAL GEMINI_CLI_USER_AGENT_PLAIN ANTIGRAVITY_CLIENT_ID ANTIGRAVITY_CLIENT_SECRET ANTIGRAVITY_CLIENT_ID_IS_BLINDED ANTIGRAVITY_CLIENT_SECRET_IS_BLINDED ANTIGRAVITY_CLIENT_ID_FALLBACK_SECONDARY HEADER_X_GOOG_API_CLIENT HEADER_CLIENT_METADATA HEADER_USER_AGENT HEADER_X_GOOG_USER_PROJECT HEADER_X_GOOG_QUOTA_USER HEADER_X_CLIENT_DEVICE_ID HEADERS_TO_STRIP FORBIDDEN_HEADERS FORBIDDEN_HEADERS_STRICT ANTIGRAVITY_CLIENT_METADATA_TEMPLATE CLIENT_METADATA CLIENT_METADATA_STRING CLIENT_METADATA_RAW ANTIGRAVITY_ENDPOINTS ANTIGRAVITY_ENDPOINT_FALLBACKS ENDPOINTS CLOUDCODE_BASE_URL CLOUDCODE_BASE CLOUDCODE_PA_BASE CLOUDCODE_DAILY_BASE CODE_ASSIST_BASE_URL CODE_ASSIST_PATH_MAP CodeAssistEndpointPath buildCodeAssistUrl CLOUDCODE_ENDPOINTS GEMINI_CLI_ENDPOINT CLOUDAI_COMPANION_ENDPOINT CLOUDAI_COMPANION CLOUDAICOMPANION_ENDPOINT QUOTA_ENDPOINT QUOTA_ENDPOINT_V1 MODELS_ENDPOINT MODELS_ENDPOINT_FULL ONBOARD_USER_ENDPOINT LOAD_CODE_ASSIST_ENDPOINT STREAM_GENERATE_ENDPOINT GENERATE_CONTENT_ENDPOINT RESOLVE_PROJECT_ENDPOINT FETCH_AVAILABLE_MODELS_METHOD stripTrailingSlashes buildCloudCodeUrl PROJECT_FALLBACK PROJECT_ID_FALLBACK PROJECT_NAME_FALLBACK PROJECT_NUMBER_FALLBACK FALLBACK_PROJECT_ID GEMINI_CLI_PROJECT_RESOLUTION PROJECT_RESOLUTION_STRATEGY QuotaGroup OAUTH_AUTH_URL OAUTH_TOKEN_URL OAUTH_USERINFO_URL OAUTH_USERINFO_URL_V3 OAUTH_REVOKE_URL OAUTH_SCOPES OAUTH_SCOPES_STRING PKCE_VERIFIER_LENGTH PKCE_CODE_CHALLENGE_METHOD OAUTH_CALLBACK_HOST OAUTH_CALLBACK_PATH OAUTH_STATE_LENGTH OAUTH_PORT_RANGE DEFAULT_TIMEOUT_MS CONTENT_TIMEOUT_MS PROJECT_RESOLVE_TIMEOUT_MS QUOTA_TIMEOUT_MS TOKEN_REFRESH_TIMEOUT_MS ONBOARD_TIMEOUT_MS BACKOFF_BASE_MS BACKOFF_MAX_MS BACKOFF_FACTOR MAX_RETRIES RETRYABLE_STATUS_CODES RETRYABLE_ERROR_CODES QUOTA_CACHE_TTL_MS QUOTA_CACHE_TTL_MIN_MS QUOTA_CACHE_TTL_MAX_MS QUOTA_SOFT_THRESHOLD QUOTA_HARD_THRESHOLD ACCOUNTS_FILE_NAME ACCOUNTS_CONFIG_DIR ACCOUNTS_FILE_MODE LRU_THINKING_CACHE_SIZE MODALITIES_INPUT GOOGLE_SEARCH_TOOL_NAME URL_CONTEXT_TOOL_NAME CONTEXT_WINDOW_ANTIGRAVITY OUTPUT_LIMIT_ANTIGRAVITY FNV_OFFSET_BASIS FNV_PRIME CONSTANTS GEMINI_CLI_OAUTH_CLIENT_ID GEMINI_CLI_OAUTH_CLIENT_SECRET GEMINI_CLI_SCOPES GEMINI_CLI_SCOPES_JOINED ANTIGRAVITY_CLI_OAUTH_CLIENT_ID ANTIGRAVITY_CLI_OAUTH_CLIENT_SECRET OAUTH_ENDPOINTS ANTIGRAVITY_ENDPOINT_SET ANTIGRAVITY_VERSION_ENDPOINTS AntigravityVersion PROJECT_ID_FALLBACKS GEMINI_CLI_VERSION_POOL CURRENT_GEMINI_CLI_VERSION GAPI_CLIENT_VERSION_POOL CURRENT_GAPI_CLIENT_VERSION GL_NODE_VERSION_POOL CURRENT_GL_NODE_VERSION ANTIGRAVITY_CLI_VERSION_POOL SupportedPlatform SupportedArch PLATFORM_POOL ARCH_POOL OS_VERSION_POOL FINGERPRINT_IDE_TYPES FINGERPRINT_PLATFORMS FINGERPRINT_PLUGIN_TYPES FINGERPRINT_USER_AGENT_SOURCES SYSTEM_PROMPTS resolveOpenCodeBaseDir FILE_PATHS VERSION_FALLBACK_CHAIN RETRY_POLICY TIMEOUTS PLUGIN_VERSION FINGERPRINT_POOLS getAntiBanDelayMs",
    "db.ts": "ChatMessageRow ApiKeyRow TownKeyRow maskkey KEYSEED MESSAGESEED listkeys listmessages rotationsummary OnboardingFlags getonboardingstate setonboardingstage LabelRow saveLabel readLabel readAllLabels seedLabelRows",
    "debonairlane.ts": "matchpath matchroute routes GatewayHandlerName RouteSpec RouteVerdict DebonairMountVerdict DEBONAIR_APP DebonairGatewayRequest DebonairBlobPointer DebonairBlobStream DebonairGatewayAnswer DebonairDispatch debonairrequest debonairresponse debonairserve DEBONAIR_URL_ENV debonaircandidate debonairorigin debonairforward",
    "engine.ts": "createversion engineinternals",
    "family.ts": "FAMILY_SLUGS FamilyMember FAMILY_ACCENTS familyrow",
    "familyurl.ts": "familyurl",
    "fingerprint.ts": "ANTIGRAVITY_VERSION_FALLBACK OAUTH_CLIENT_ID OAUTH_CLIENT_SECRET PROJECT_FALLBACK CLOUDCODE_BASE_URL AntigravityVersion SupportedArch SupportedPlatform MODELS_2026 ModelId2026 PLATFORM_POOL ANTIGRAVITY_CLI_VERSION_POOL GEMINI_CLI_VERSION_POOL GL_NODE_VERSION_POOL fnv1a32 fnv1a32Hex fnv1a64 getJitterMs pickRandom PlatformOS PlatformArch FingerprintType HeaderStyle OsName ArchName PlatformProfile PlatformPool PoolMap PLATFORM_POOLS PLATFORM_PROFILE_POOL PLATFORM_POOL_EXTENDED PLUGIN_VERSION_FALLBACK ANTIGRAVITY_VERSION_POOL GOOGLE_API_CLIENT_VERSION_POOL GAX_VERSION_POOL generateSessionUuid secureRandom pickRandomWeighted jitterSleep normalizePlatform normalizeArch getDynamicUserAgent getDynamicUserAgentAsync fetchRemoteAntigravityVersion getXGoogApiClient X_GOOG_API_CLIENT X_GOOG_API_CLIENT_GEMINI_CLI buildClientMetadata buildGeminiUserAgent ua apiClient getRandomPlatformString GeminiCliHeaderOptions getGeminiCLIHeaders getGeminiCLIHeadersWithOptions AntigravityHeaderOptions getAntigravityHeaders getAntigravityHeadersWithOptions AntigravityHeadersOptions buildAntagravityHeaders FingerprintOptions FullHeadersResult FingerprintGenerator defaultFingerprintGenerator getFingerprintHeaders generateHeaders generateFetchHeaders generateFullFingerprint createFingerprintForDirectory buildLoadCodeAssistRequest FingerprintConstants",
    "gateway.ts": "GATEWAYROUTES GatewayRoute GatewayBadge GatewayVersion GATEWAYVERSIONS PARSERSTEPS listversions findversion totalroutes liveversions gatewayConfig gatewayViewConfig",
    "gatewayprobe.ts": "",
    "gatewaysmoke.ts": "",
    "intelligence.ts": "provenancechunkinput provenanceinput provenancerecord provenance mergeprovenance estimatetokens fitscontext tokenbudget settokenratios chunkmarkdown ragmanifest vectorrecord llmstxt llmsfull metricstore",
    "json.ts": "extractjsonobject VerdictObject validateverdict decisionerrorcode decisionerror DecisionKind DecisionPolicy DecisionRequest DecisionVerdict validatedecision gateverdict DecisionRecipe Completer DecisionTrail defaultinstruction createjsonmodel policyerrorcode policyerror ConfidenceBand BandThresholds confidenceband PolicyEntry buildpolicytable defaultpolicytable policyfor DecisionMode MeasurementRecord MeasurementSummary HonestMeasurement createmeasurement RolloutVerdict RolloutPolicy reviewrollout RouterRoute RouterStats ReferenceRouter createreferencerouter schemaerrorcode schemaerror ENUM_CAP SchemaField JsonObjectSchema CompiledSchema compilejsonschema SchemaPolicy SchemaVerdict createschemamodel schemafromdecision",
    "labels.ts": "LABEL_REVISION LABEL_MANIFEST LabelKey label labelfill seedLabels",
    "llm.ts": "defaultrefusalmarkers shapedrequest modelusage buildrequest parsecompletion islocalorigin callmodel calllocal streamdelta parsestream streammodel commandguard classifyintent parsecommand draftplan replannonfail reflectstep reflectionsummary stripguardrails parseoutput guardoutput toolbriefof rendertoolbriefs addusage usagetotals budgetcheck routevalid routesfor resolveroute markprovider fallbackroute bumprevision templatevariables rendertemplate savetemplate latesttemplate searchtemplates removetemplate ollamalocaldefault gatewaykinds defaultbaseurl gatewayurl gatewayrequestinput gatewayadapter openaicompatadapter anthropicgatewayadapter geminigatewayadapter ollamalocaladapter gatewayadapters adapterof gatewaycancelstate gatewaycancel gatewayerrorof gatewayerrorfrom gatewayretryafterof maskkey maskrequest storeproviderkey resolveproviderkey revokeproviderkey keyexportcheck gatewayoptions gatewayresult gatewaycall gatewaystream fetchmodellist capabilityadvertisement resolvegatewayroute gatewayusagerecord gatewaybudgetwarning costestimates gatewayplanguard guardretryprompt gatewayguard gatewaytemplates composegatewayprompt streamrender gatewaychatstateof gatewayislocal gatewaybudgetcheck validategatewayconfig gatewaykeyref",
    "models.ts": "GEMINI_36_MODELS GEMINI_36_MODEL_DEFINITIONS GEMINI_35_MODELS GEMINI_35_MODEL_DEFINITIONS GEMINI_31_MODELS GEMINI_31_MODEL_DEFINITIONS GEMINI_3_MODELS GEMINI_3_MODEL_DEFINITIONS GEMINI_25_MODELS GEMINI_25_MODEL_DEFINITIONS CLAUDE_46_MODELS CLAUDE_46_MODEL_DEFINITIONS CLAUDE_45_MODELS CLAUDE_45_MODEL_DEFINITIONS GPT_OSS_MODELS GPT_OSS_MODEL_DEFINITIONS PREVIEW_MODELS_2026_08 PREVIEW_MODEL_DEFINITIONS MODELS_2026_08_25_DEDUP MODEL_DEFINITIONS_2026 ANTIGRAVITY_MODELS_2026_08 MODEL_IDS_2026_08_25 QUOTA_MODEL_ROSTER isGemini36Model isGemini35Model isGemini31Model isClaude46Model isClaude45Model isGptOssModel isPreviewModel MODEL_ALIASES_2026 DEFAULT_MODEL_FALLBACK DEFAULT_MODEL_2026_08 ApiProvider ModelVendor V1_CATALOG_MODELS DEFAULT_MODEL_ID DEFAULT_FALLBACK_MODEL_IDS UA_DEFAULT_MODEL CATALOG_DATE_ISO CATALOG_DATE_BR CATALOG_VERSION WIKIPEDIA_GEMINI_3_1_PRO_DATE WIKIPEDIA_GEMINI_3_6_FLASH_DATE REFERENCES OPENCODE_TXT_TIMELINE CODE_ASSIST_ENDPOINTS ENDPOINT_ORDER ENDPOINT_ORDER_ANTIGRAVITY ENDPOINT_ORDER_GEMINI_CLI ANTIGRAVITY_VERSION_MIN THINKING_LEVELS ThinkingLevel THINKING_BUDGET_MAP CONTEXT_WINDOW_GEMINI CONTEXT_WINDOW_CLAUDE CONTEXT_WINDOW_GPT_OSS OUTPUT_LIMIT_GEMINI OUTPUT_LIMIT_CLAUDE OUTPUT_LIMIT_GPT_OSS THINKING_BUDGET_MAX_CLAUDE THINKING_BUDGET_MAX_GEMINI ModelGroup Provider OriginalProvider Modality ModelDefinition AntigravityModelDefinition LegacyModelDefinition thinkingVariant modelDef shouldSkipSandbox ThinkingVariant ModelDef normalizeModelId parseThinkingLevelFromId getThinkingBudgetForLevel isGeminiCliOnlyId MODEL_CATALOG_2026_08_25 MODEL_MAP_2026_08_25 MODEL_ALIASES_2026_08_25 getModel hasModel isPreview isThinkingModel isImageModel isAntagravityGroup isGeminiCliGroup getModelsByGroup getModelsByThinkingLevel getPreviewModels getStableModels getAntagravityModels getGeminiCliModels getThinkingBudget getContextWindow getOutputLimit getEndpointForModel shouldSkipSandboxForModel listModelIds listBareModelIds searchModels routeModelViaOmniRoute mapModelFor9Router MODEL_CATALOG_GROUPED DEFAULT_MODEL SEARCH_MODEL SEARCH_MODEL_PREVIEW SEARCH_MODEL_FALLBACKS OMNIROUTE_FALLBACK_MODEL FALLBACKS MODELS_2026_08_25 ANTIGRAVITY_MODELS GEMINICLI_MODELS ALL_MODELS_WITH_PREFIX isCLIOnly MODELS_2026 GEMINI_BARE_MODEL_IDS MODELS_2026_BASE MODELS_2026_ANTIGRAVITY_ALIAS MODELS_2026_PROVIDER MODELS_2026_ANTIGRAVITY MODELS_2026_ALL MODELS_2026_LEGACY SUPPORTED_MODELS_2026 FETCH_AVAILABLE_MODELS_2026 ALL_MODELS_2026 MODEL_BY_ID RoutingConfig MODEL_ROUTING ModelCatalogEntry MODELS_2026_CATALOG ANTIGRAVITY_MODEL_IDS_2026 GEMINI_CLI_ONLY_MODELS QUOTA_GROUP_MODEL_DEFINITIONS QUOTA_GROUP_MODEL_IDS_2026 QUOTA_GROUP_GEMINI_CLI_ONLY_MODELS ANTIGRAVITY_MODELS_2026 GEMINI_CLI_ONLY_MODELS_2026 PREVIEW_MODELS_2026 Model2026 ModelId2026 SupportedModel2026 FetchAvailableModel2026 MODEL_CATALOG MODEL_MAP isGeminiCLIOnlyModel isImageGenModel buildImageGenConfig mapModelToGroup getEndpointsForModel ModelsModule Models2026Module buildGoogleProviderModelConfigs buildOpenCodeModelDefinitions detectTargetProvider",
    "nodeshim.ts": "EOL arch platform release type hostname homedir tmpdir cpus totalmem freemem uptime loadavg networkInterfaces userInfo constants sep delimiter isAbsolute normalize join resolve dirname basename extname relative posix win32 existsSync mkdirSync copyFileSync cpSync rmSync mkdtempSync writeFileSync appendFileSync renameSync chmodSync unlinkSync statSync readFileSync createReadStream truncateSync readdirSync mkdir writeFile rename copyFile cp rm mkdtemp appendFile access readFile stat readdir versions lookup randomUUID randomBytes randomInt createHash createHmac scryptSync timingSafeEqual pathToFileURL fileURLToPath inspect format promisify default",
    "oauth.ts": "SUPPORTED_MODELS_2026 SupportedModel2026 mapModelToGroup CLIENT_ID CLIENT_SECRET ANTIGRAVITY_CLI_CLIENT_ID ANTIGRAVITY_CLI_CLIENT_SECRET ANTIGRAVITY_CLI_CLIENT_SECRET_ALTERNATIVE ANTIGRAVITY_CLI_OAUTH_SCOPES ANTIGRAVITY_CLI_OAUTH_SCOPES_STR ANTIGRAVITY_CLI_REDIRECT_OFFICIAL ANTIGRAVITY_CLI_AUTH_SUCCESS_URL ANTIGRAVITY_CLI_VERSION_LATEST ANTIGRAVITY_CLI_GRPC_VERSION antigravityCliOsName antigravityCliArchName buildAntigravityCliUserAgent buildAntigravityCliXGoogApiClient getAntigravityCliHeaders MaeneOAuthIdentity OAuthIdentityBundle resolveOAuthIdentity identityFromAccountType GEMINI_OAUTH_CLIENT_ID GEMINI_OAUTH_CLIENT_SECRET GEMINI_OAUTH_CLIENT_SECRET_ALTERNATIVE CLIENT_SECRET_ALTERNATIVE GEMINI_OAUTH_SCOPES GOOGLE_OAUTH_SCOPES OAUTH_AUTHORIZE_URL GOOGLE_AUTH_URL GOOGLE_TOKEN_URL GOOGLE_USERINFO_URL CLOUDCODE_API_BASE CLOUDCODE_ORIGIN SIGN_IN_SUCCESS_URL SIGN_IN_FAILURE_URL HTTP_REDIRECT getAvailablePort GEMINI_UA_BASE PKCEPair TokenResponse UserInfo OAuthCallbackResult OAuthResult OAuthServerResult AuthOptions StartOAuthFlowOptions isWSL isSSH hasDisplay getGeminiHeaders generatePKCE buildAuthUrl openBrowserAsync createOAuthServer createOAuthServerAsync exchangeCodeForTokens refreshAccessToken refreshAndPreserve isTokenExpired getUserInfo fetchTimeout tokenres refreshToken accountsPath accountEntry accountsFile accountManager retrieveQuota authenticate startOAuthFlow isValidTokenResponse extractCodeFromUrl getAllModels isAntigravityModel oauth",
    "onboardingstate.ts": "VisitorOnboarding OnboardingStage hostallowed mergeStage readOnboardingState loadOnboardingState markIntroSeen markOnboardingSeen resetOnboardingMemory",
    "prismaconfig.ts": "defineConfig",
    "prismashim.ts": "PrismaClient default",
    "project.ts": "Account ENDPOINT_ORDER FALLBACK_PROJECT_ID ANTIGRAVITY_VERSION_FALLBACK ANTIGRAVITY_USER_AGENT_FALLBACK CODE_ASSIST_ENDPOINTS FETCH_TIMEOUT_MS MODELS_2026_BASE MODELS_2026_ANTIGRAVITY MODELS_2026_ALL MODELS_2026_LEGACY Model2026 GOOGLE_API_NODE_VERSION ENDPOINT_BASES EndpointName EndpointDef CODE_ASSIST_PATHS IdeType CodeAssistMetadata LoadCodeAssistResponse OnboardUserResponse AvailableModel FetchAvailableModelsResponse FetchModelsResponse ResolvedProject getCachedProjectId setCachedProjectId clearProjectIdCache getCacheStats ProjectDiscoveryError isLikelyExpiredToken getPlatformInfo LoadCodeAssistOptions loadCodeAssist OnboardUserOptions onboardUser FetchModelsOptions fetchAvailableModels AccountMetadataSaver ResolveProjectIdOptions ResolveResult resolveProjectId resolveAndSaveProjectId ResolveProjectIdBypassOptions ResolveProjectIdBypassResult resolveProjectIdAsGeminiCliBypass fetchAvailableModelsDirect projectIdCacheForTesting projectModule",
    "providers.ts": "ModelCatalogEntry OpenCodeJsonLocation ANSI atomicWriteFileAtomic atomicWriteFileSecure buildOpenCodeModelDefinitions C CLI_VERSION cmdAccounts cmdConfig cmdDoctor cmdLogin cmdManage cmdModels cmdQuota cmdStatus cmdVersion configureModelsFlow confirm disableAccountFlow enableAccountFlow fetchQuotaForAccount fmtDuration getDefaultAccountManager interactiveMenu locateOpenCodeJson logoutFlow printHeader printHelp providerconsolemain redactEmail resolveAccountsPath resolveAntigravityJsonPath resolveBaseDir resolveConfigPath resolveOpenCodeJsonCandidates default getPlugin plugin ALL_MODELS_2026 MODEL_BY_ID MODEL_ROUTING providerServer googleAuth antigravityAuth ProviderProtocol retryDelay redactProviderError ChatRole ChatMessage ChatRequest ModelInfo PROVIDERS listProviders resolveProvider streamChat listModels runproviderfamily providercli System VERSION PLUGIN_ID GEMINI_CLI_BYPASS ANTIGRAVITY_CLI_BYPASS ants",
    "quota.ts": "PROJECT_FALLBACK QUOTA_SOFT_THRESHOLD QUOTA_CACHE_TTL_MIN_MS QUOTA_CACHE_TTL_MS QUOTA_TIMEOUT_MS JITTER_MIN_MS JITTER_MAX_MS ANTIGRAVITY_VERSION_FALLBACK ANTIGRAVITY_USER_AGENT_FALLBACK ANTIGRAVITY_CLIENT_ID_IS_BLINDED ANTIGRAVITY_CLIENT_SECRET_IS_BLINDED ANTIGRAVITY_ENDPOINT_FALLBACKS GEMINI_CLI_ENDPOINT QUOTA_ENDPOINT PROJECT_ID_FALLBACK PROJECT_NAME_FALLBACK getXGoogApiClient ANTIGRAVITY_VERSION_MIN isRetryableStatus X_GOOG_API_CLIENT CLIENT_METADATA_STRING GEMINI_CLI_OAUTH_CLIENT_ID GEMINI_CLI_OAUTH_CLIENT_SECRET QuotaGroup QUOTA_ENDPOINTS QuotaSource GEMINI_CLI_USER_AGENT_ANTIGRAVITY CLIENT_METADATA_ANTIGRAVITY QUOTA_REFRESH_INTERVAL_MINUTES_DEFAULT QUOTA_REFRESH_INTERVAL_MS_DEFAULT QUOTA_SOFT_REMAINING QUOTA_CACHE_TTL_MS_DEFAULT QUOTA_CACHE_FILE QUOTA_REQUEST_TIMEOUT_MS QuotaGroupId ResilientQuotaGroupDef QUOTA_GROUP_DEFS QuotaWindow QuotaBucketRaw QuotaGroupRaw QuotaSummaryRaw QuotaBucketParsed QuotaGroupParsed QuotaSummaryParsed QuotaCacheEntry CheckQuotaResult computeAdaptiveTtlMs getQuotaRefreshIntervalMs resolveQuotaGroup getQuotaGroup listQuotaGroups buildQuotaHeaders parseQuotaBucket parseQuotaGroup parseQuotaResponse RetrieveQuotaOptions QuotaFetchError retrieveUserQuotaSummary retrieveDualQuota QuotaCacheManager getQuotaCacheManager checkQuota isQuotaExhausted shouldSkipAccount getQuotaGroups QuotaManagerOptions QuotaManager getDefaultQuotaManager canProceedWithRequest QuotaConfig DEFAULT_QUOTA_CONFIG resolveQuotaConfig QUOTA_METHOD hashToken quotaModule",
    "recovery.ts": "GEMINI_CLI_CLIENT_ID GEMINI_CLI_CLIENT_SECRET PROJECT_FALLBACK MODELS_2026 ModelId2026 X_CLIENT_METADATA_RAW Role ThinkingBlock TextBlock ToolUseBlock ToolResultBlock ContentBlock ChatMessage ChatMessages RecoveryErrorCode DetectedError DetectionReport RecoveryStrategy RecoveryAction RecoveryPlan ExecutorFn AutoRecoveryOptions LRUCache ThinkingSignatureEntry hashThinkingContent isBase64ishSig isValidThinkingSignature ThinkingSignatureCache getGlobalSignatureCache resetGlobalSignatureCache PreservedThinking ThinkingPreservationStore getGlobalPreservationStore resetGlobalPreservationStore DETECTOR_PATTERNS detectInvalidSignatureBlocks detectToolUseWithoutThinking detectSessionBoundary detectToolFailures detectInvalidSignatureFromError detectAllErrors BuildPlanOptions buildRecoveryPlan cloneMessages stripInvalidSignatures ensureThinkingBeforeToolUse injectPreservedThinking buildContinueMessage buildUndoGuidanceMessage rebuildMessagesCompacted transformMessagesForRetry preserveThinkingFromMessages preserveThinkingFromResponse exponentialBackoff sleepMs AutoRecoveryExhaustedError withAutoRecovery RecoveryFacadeOptions createRecoveryFacade buildUserPromptIdShort buildSessionIdFromCwd RecoveryConstants Recovery RecoveryErrorType errorType RecoveryContext SimpleRecoveryStrategy detectErrorType detectError isRecoverable getRecoveryStrategy preserveThinkingSignature getPreservedSignature buildRecoveryMessage transformMessagesForRecovery withAutoRecoverySimple recoverToolResultMissing recoverThinkingOrder recoverThinkingDisabled sessionRecovery contextErrorRecovery setToastSink toast detectFetchErrorType fetchSessionRecovery preserveValidatedSignature",
    "registernvidiakeys.ts": "",
    "request.ts": "GEMINI_CLI_OAUTH_CLIENT_ID GEMINI_CLI_OAUTH_CLIENT_SECRET ThinkingLevel ENDPOINT_ORDER_ANTIGRAVITY ENDPOINT_ORDER_GEMINI_CLI FETCH_AVAILABLE_MODELS_2026 GEMINI_CLI_ONLY_MODELS getEndpointsForModel isGeminiCLIOnlyModel SEARCH_MODEL SEARCH_MODEL_PREVIEW THINKING_BUDGET_MAP THINKING_BUDGET_MAX_CLAUDE THINKING_BUDGET_MAX_GEMINI THINKING_LEVELS CODE_ASSIST_ENDPOINTS TOOL_NAME_MAX_LENGTH TOOL_NAME_MIN_LENGTH THINKING_LEVEL_TO_BUDGET_GEMINI THINKING_LEVEL_TO_BUDGET_CLAUDE THINKING_BUDGET_MAX THINKING_BUDGET_MIN OpenCodeTool TransformRequestInput GeminiPart OpenCodeMessage GeminiContent GeminiSystem GeminiTool TransformedRequest ALLOWED_SCHEMA_KEYS MAX_TOOLS_PER_REQUEST ALLOWED_TOOL_TOP_KEYS DIRECT_ENDPOINT DAILY_ENDPOINT AUTOPUSH_ENDPOINT ENDPOINT_CASCADE RequestTransformationError RequestHelpersError fnv1aHex fnv1aHex16 fnv1aHash parseModelId isLikelyAntigravityOnlyModel ExtractVariantsResult extractVariants extractVariantsFromAny ModelVariantInfo extractModelVariant parseModelVariant buildDynamicUserAgent buildApiClient stripXGoogUserProjectHeader cleanJsonSchemaStrict CleanedTool cleanRawToolSchema cleanToolsArray mapThinkingBlock sortThoughtFirst filterAndMapThinkingParts isThinkingBlock filterThinkingBlocksFromParts filterThinkingBlocksFromMessages filterThinkingBlocksAuto ThoughtLikePart filterThinkingBlocks GOOGLE_SEARCH_FUNCTION_DECLARATION URL_CONTEXT_FUNCTION_DECLARATION injectGoogleSearchTool parseFunctionArgs extractLastUserPrompt OpenCodeContentPart OpenCodeToolCall GeminiFunctionCall GeminiFunctionResponse NormalizedMessagesResult normalizeMessages normalizeRole normalizeContentToParts GeminiMessage IncomingMessage normalizeIncomingMessages EnhancedAgyError enhanceAgySdkErrorResponse CODE_ASSIST_METHOD_PATHS fnv1a64BigInt BuildPromptIdOptions buildSessionIdFromDir buildUserPromptId buildSessionId normalizeThinkingLevel parseThinkingLevel mapThinkingLevelToBudget thinkingLevelToBudget getThinkingBudgetForVariant OpenCodeContentBlock OpenCodeRequest GeminiSystemInstruction GeminiFunctionDeclaration GeminiGenerationConfig CloudCodeAssistInnerRequest TransformOptions TransformToolsResult AntigravityFetchPayload buildGenerationConfigFromRequest BuildGenerationConfigOptions buildGenerationConfig buildBypassHeaders cleanToolSchema CleanToolSchemaOptions cleanToolSchemaTolerant cleanToolSchemas isValidToolName ValidateToolNamesResult validateToolNames validateToolName InvalidToolName SanitizedToolName ValidateToolNamesDetailedResult validateToolNamesDetailed transformTools RequestTransformer RequestPipeline stripForbiddenHeaders STREAM_METHOD GENERATE_METHOD LOAD_METHOD ONBOARD_METHOD TOOL_NAME_REGEX generateDeterministicId generateSessionId generateUserPromptId transformRequest buildCloudCodeBody BuildOptions BuildResult buildAntigravityRequest buildGeminiCLIRequest fetchWithCascade BYPASS_CONSTANTS API_PATHS API_PATHS_DAILY RequestHelpers",
    "reveal.ts": "observeReveals",
    "routerotation.ts": "ModelRoute CooldownEntry RotationLedger RotationOptions ROTATIONDEFAULTS newledger healthyroutes pickroute notefailure notesuccess remainingcooldown",
    "sandboxmodality.ts": "AppWorkloadLane APPSLUG WORKLOADLANES SANDBOXLANEENV LaneSeatResult lanesandbox lanesandboxfromenv laneof",
    "search.ts": "ANTIGRAVITY_USER_AGENT_FALLBACK ANTIGRAVITY_VERSION_FALLBACK CODE_ASSIST_ENDPOINTS DEFAULT_TIMEOUT_MS GENERATE_CONTENT_ENDPOINT JITTER_MAX_MS JITTER_MIN_MS SEARCH_MODEL SEARCH_MODEL_FALLBACKS SEARCH_MODEL_PREVIEW STREAM_GENERATE_ENDPOINT THINKING_BUDGET_MAP THINKING_BUDGET_MAX_CLAUDE THINKING_BUDGET_MAX_GEMINI THINKING_LEVELS buildImageGenConfig getDynamicUserAgent getJitter isImageGenModel ThinkingLevel parseGrounding DEFAULT_ENDPOINT_ORDER SEARCH_TIMEOUT_MS WebGroundingChunk GroundingChunkWeb GroundingChunk GroundingSupportSegment GroundingSupport SearchEntryPoint GroundingMetadata ExecuteSearchInput ExecuteSearchAuth ExecuteSearchOptions SearchResult SearchError ProxyResolution isNoProxyMatch resolveProxyUrl fetchWithProxyTimeout resolveThinkingBudget normalizeModelName executeSearch searchWithFallback extractGroundingUris extractGroundingTitles shouldEnableSearch buildSearchTools extractCitations saveGeneratedImage groundingToMarkdown Search",
    "server.ts": "createserver main kams kasuppressms sseheaders ndjsonheaders writeevent writekeepalive writedone safeenqueue safeclose maskmodel discardheartbeat parsesseframes extractdata isdone makechunk makefinalchunk trackedstream streamoptions makestreamresponse trackwrite loadconfig reloadconfig getversion listversions validateconfig",
    "sessions.ts": "SessionContextRow SESSIONSEED ROTATIONEVERY listsessions rotationindex freshestfirst contextshare",
    "streaming.ts": "BACKOFF_BASE_MS BACKOFF_FACTOR BACKOFF_MAX_MS GEMINI_CLI_OAUTH_CLIENT_ID GEMINI_CLI_OAUTH_CLIENT_SECRET JITTER_MAX_MS JITTER_MIN_MS LRU_THINKING_CACHE_SIZE MAX_RETRIES PROJECT_FALLBACK fnv1a32 getJitter thinkingCache MODELS_2026 ModelId2026 SSE_DONE_SENTINEL hashThinkingText sleepWithJitter ReplaySignatureCache globalThinkingSignatureCache ParsedSSEEvent SSEParserState createSSEParserState parseSSEChunk parseSSEBinaryChunk NormalizedToolCall NormalizedChunk safeJsonParse unwrapCandidates extractParts normalizePart mapFinishReason normalizePayloads extractDelta StreamingSessionTracker OpenAIChunkOptions transformToOpenAI createOpenAIStreamingTransformer AnthropicChunkOptions transformToAnthropic createAnthropicStreamingTransformer RetryOptions isRetryableNetworkStatus fetchWithExponentialRetry injectSyntheticFinish withAutoRecoveryStreaming readSSEStream streamToOpenAI streamToAnthropic RawPart RawContent RawCandidate CloudCodeRawChunk NormalizedPartKind NormalizedPart NormalizedPayload StreamingState OpenAIChatChunk AnthropicSSEEvent ParseSSEChunkResult ReplaySignatureEntry ThinkingSignatureLRUCache globalThinkingSignatureLRUCache sseEvent stripCacheControlMarkers handleThinkingBlock parseSSEPayloads normalizeRawPayloads createInitialStreamingState transformToOpenAIChunks createSyntheticFinishChunks serializeOpenAIChunksToSSE transformToAnthropicEvents createAnthropicSyntheticFinish IncrementalSSEParser OutputFormat StreamingTransformerOptions CloudCodeStreamingTransformer ResilientFetchOptions computeExponentialDelay resilientFetch createResilientTransformedStream BypassHeadersOptions buildGeminiCliBypassHeaders buildHostSessionId hasThinkingContent extractThinkingSignatures getStreamingSummary transformToGemini Streaming ChatEvent StreamOptions normalizeFrame parseEventStream collectEvents StreamErrorCode FallbackVerdict StreamError StreamFallbackError FallbackStep FallbackRoute FallbackOptions FALLBACKDEFAULTS classifystatus verdictfor errorfromresponse orderchain runwithfallback applyerrortokey streamingModule",
    "theme.ts": "ThemeName currentTheme applyTheme toggleTheme",
    "thinking.ts": "ThinkingLevelName ThinkingLevel DEFAULTTHINKINGLEVEL THINKINGLEVELS listlevels budgetof islevel formatbudget",
    "typeface.ts": "",
    "types.ts": "apikeyref protocolstyle modelmessage providerconfig modelroute localmodelconfig toolbrief intentkind commandentity commandparse draftstep plandraft replanrecord reflectnote costbudget usagerecord prompttemplate parseguard modeloutput tokenstream gatewaykind baseurlconfig gatewaymodelinfo modelcacherecord gatewayerror gatewaychattoken gatewaychatstate costestimate thinkinglevel gwauthmethod keysource keyrotationmode authconfig intelligencerank modeldef upstreamdef rotationmode rotationconfig retryconfig timeoutconfig contextconfig thinkingconfig bodybuildconfig routesconfig metamodelconfig transporttype transportconfig dbconfig headersconfig gatewayconfig gatewaydefinition resolvedkey sessionstate versionhandlers",
    "utils.ts": "corsheaders ctjson ctsse ctplain ctndjson ctoctet maxdurationconst defaultmaxtokens randombase36 securerandom genid getip handlecors jsonheaders detectcontenttype clamp automaxtokens autotemp autotopp autofrequencypenalty autopresencepenalty auton autoseed autothinking thinkingbudgets thinkingbudget makethinker safestringify safejsonparse levenshtein esttokens truncatemessages",
    "versionregistry.ts": "isValidSemver ANTIGRAVITY_VERSION_FALLBACK ANTIGRAVITY_VERSION_MIN_SUPPORTED ANTIGRAVITY_BLOCKED_VERSIONS ANTIGRAVITY_VERSION_REMOTE_URLS VERSION_FETCH_TIMEOUT_MS REMOTE_MANIFEST_URLS CHANGELOG_URLS FALLBACK_VERSION FALLBACK_FULL_VERSION FALLBACK_ALTERNATIVE_VERSION FALLBACK_ALTERNATIVE_FULL VERSION_CACHE_TTL_MS VERSION_CACHE_FILE VERSION_MEMORY_TTL_MS VERSION_FILE_TTL_MS ANTIGRAVITY_AUTH_CONSTANTS VersionSource AntigravityVersionInfo CacheEntry VersionCacheFile FetchOptions GetVersionOptions versionMemoryCache cleanSemver compareSemver shouldUpdate isBlockedVersion isSupportedVersion parseVersionFromPayload parseAntigravityVersion readCacheFileSync readCacheFile writeCacheFile fetchLatestVersion fetchAntigravityVersion getVersionInfo getVersionInfoSync invalidateVersionCache invalidateMemoryCache getVersion getVersionSync clearVersionCache clearVersionCacheSync getVersionedUserAgent isNewerVersion getAntigravityUserAgent getDynamicUserAgentVersioned Version versionModule",
    "vite.config.ts": "defineConfig",
    "vitest.config.ts": "defineConfig",
  };

  /** live cross-app import edges of getry root files — the dedup law at work. */
  const getryCross: CrossImports = {
    "accounts.ts": [
      { from: "@wenathlan/devthink/config", symbols: ["resolveConfigDir"] },
      { from: "@wenathlan/devthink/config", symbols: ["resolveConfigDir"] },
    ],
    "antigravity.ts": [
      { from: "@wenathlan/devthink/core", symbols: ["fnv1a32", "fnv1a32Hex", "getJitter"] },
    ],
    "cli.ts": [
      { from: "@wenathlan/devthink", symbols: ["createversion", "loadconfig"] },
    ],
    "debonairlane.ts": [
      { from: "@wenathlan/debonair/routetable", symbols: ["RouteVerdict", "default"] },
    ],
    "engine.ts": [
      { from: "@wenathlan/devthink/storage", symbols: ["getsessionmessages", "savemsg"] },
    ],
    "fingerprint.ts": [
      { from: "@wenathlan/devthink/core", symbols: ["fnv1a32", "fnv1a32Hex", "fnv1a64", "getJitterMs", "pickRandom"] },
    ],
    "labels.ts": [
      { from: "@wenathlan/vault/labelstore", symbols: ["createLabelStore"] },
    ],
    "llm.ts": [
      { from: "@wenathlan/devthink/types", symbols: ["policyevaluation", "secretvaultentry", "tooldef", "default"] },
      { from: "@wenathlan/devthink/policy", symbols: ["planlint", "egressconsentgate", "gatewaybaseurlgate", "gatewaycachewindowvalid", "gatewayconsentgate", "gatewaykeyconsentgate", "gatewayprefixgate", "gatewayretrycapvalid"] },
      { from: "@wenathlan/devthink/http", symbols: ["sendfetch", "fetchtransport", "transportresponse"] },
      { from: "@wenathlan/devthink/memory", symbols: ["randomid"] },
      { from: "@wenathlan/devthink/security", symbols: ["secretleakscan", "vaultdelete", "vaultstore", "vaultvaluefor"] },
      { from: "@wenathlan/devthink/queue", symbols: ["parseRetryAfterMs"] },
    ],
    "models.ts": [
      { from: "@wenathlan/devthink/core", symbols: ["fnv1a32"] },
    ],
    "oauth.ts": [
      { from: "@wenathlan/devthink/core", symbols: ["isRetryable", "fetchWithTimeout"] },
      { from: "@wenathlan/devthink/config", symbols: ["atomicWrite", "cfgDir"] },
    ],
    "project.ts": [
      { from: "@wenathlan/devthink/constants", symbols: ["FETCH_TIMEOUT_MS"] },
      { from: "@wenathlan/devthink/core", symbols: ["fetchWithTimeout", "fnv1a32", "isRetryable"] },
    ],
    "providers.ts": [
      { from: "@wenathlan/devthink/config", symbols: ["DevThinkConfig", "DevThinkPaths", "VERSION_FALLBACK", "atomicWrite", "cfgDir", "fetchVersionChain", "loadConfigRaw", "resolveCredential", "saveConfigRaw", "validateEmail", "validateModelId", "validateModelIdCharset", "validateProjectId", "validateSemver"] },
      { from: "@wenathlan/devthink/constants", symbols: ["FETCH_TIMEOUT_MS"] },
      { from: "@wenathlan/devthink/core", symbols: ["debugLogger", "logsDir", "redactSecrets"] },
      { from: "@wenathlan/devthink/os", symbols: ["osStringRows"] },
      { from: "@wenathlan/devthink/config", symbols: ["*"] },
      { from: "@wenathlan/devthink/constants", symbols: ["*"] },
      { from: "@wenathlan/devthink/core", symbols: ["*"] },
    ],
    "quota.ts": [
      { from: "@wenathlan/devthink/constants", symbols: ["JITTER_MIN_MS", "JITTER_MAX_MS"] },
      { from: "@wenathlan/devthink/core", symbols: ["fnv1a32", "isRetryableStatus"] },
    ],
    "recovery.ts": [
      { from: "@wenathlan/devthink/constants", symbols: ["JITTER_MAX_MS", "JITTER_MIN_MS"] },
      { from: "@wenathlan/devthink/core", symbols: ["fnv1a32"] },
    ],
    "registernvidiakeys.ts": [
      { from: "@wenathlan/devthink/storage", symbols: ["db"] },
    ],
    "request.ts": [
      { from: "@wenathlan/devthink/core", symbols: ["fnv1a32", "fnv1a32Hex", "getJitter", "isRetryableStatus"] },
    ],
    "sandboxmodality.ts": [
      { from: "@wenathlan/saddle/workloadlaw", symbols: ["lanesof"] },
      { from: "@wenathlan/saddle/workloadlaw", symbols: ["WorkloadLane", "default"] },
    ],
    "search.ts": [
      { from: "@wenathlan/devthink/constants", symbols: ["FETCH_TIMEOUT_MS", "JITTER_MAX_MS", "JITTER_MIN_MS"] },
      { from: "@wenathlan/devthink/core", symbols: ["fnv1a32", "getJitter", "isRetryableStatus"] },
    ],
    "streaming.ts": [
      { from: "@wenathlan/devthink/constants", symbols: ["JITTER_MAX_MS", "JITTER_MIN_MS"] },
      { from: "@wenathlan/devthink/core", symbols: ["fnv1a32", "getJitter", "thinkingCache"] },
      { from: "@wenathlan/devthink/queue", symbols: ["RetryConfig", "delayForAttempt", "parseRetryAfterMs", "sleepMs"] },
    ],
    "versionregistry.ts": [
      { from: "@wenathlan/devthink/constants", symbols: ["FETCH_TIMEOUT_MS"] },
      { from: "@wenathlan/devthink/core", symbols: ["fetchWithTimeout"] },
      { from: "@wenathlan/devthink/config", symbols: ["isValidSemver"] },
    ],
  };

  /**
   * saddle — the VM master leaf, 90 modalities.
   * 54 root logic files, 1476 exported logics, owner saddle.
   */
  const saddleRaw: RawFileLogics = {
    "alternatives.ts": "SandboxSpec SandboxHandle ExecResult SnapshotRef SandboxMetrics SandboxCapabilities SandboxEngine SandboxEngineError randomPort WasmtimeEngine GvisorEngine KataEngine CloudHypervisorEngine WebContainersEngine DaytonaEngine ModalEngine FlyMachinesEngine E2bFamilyVariant e2bFamilyFacts E2bFamilyEngine AppleContainersEngine EngineDescriptor EngineRegistry createDefaultEngineRegistry ComparisonRow comparisonMatrix renderComparisonTable SelectionCriteria selectEngine",
    "api.ts": "ApiErrorBody HealthStatus SandboxSpecPayload SandboxCreated ExecResult ApiSession apibase iscrossorigin apifetch fetchhealth apierrormessage apistatustext ModalityRecord ModalityPlan EdgeLane fetchmodalities fetchedgelanes",
    "auth.ts": "burndummy SessionContext SessionMaterial ForwardedSession SessionUser ValidationOk ValidationError ValidationOutcome RateBucket RateVerdict RateWindow AuthedRequest hashpassword verifypassword sessiontoken tokenhash createsession cachesession getsessionuser destroysession cookiename cookiefor cookieclear extracttoken requireauth requireadmin validateusername validatepassword ratelimit ratelimits adminusernames bootstraprole seedadmins",
    "browser.ts": "fingerprintprofile fingerprintvalidate fingerprintfor browsersession browseractions actionresult actionfailure actionbatch browsercontext pagesnapshot snapshotref assertfreshsnapshot pagesnapshotdiff projectcontext actionrecorder browseragent virtualbrowserrequest virtualbrowserdecision virtualbrowserhandoff virtualbrowserreceipt createplaywrightsession",
    "capacitor.config.ts": "config",
    "catalog.ts": "MediaSlot AgentSessionEvent AgentSession mediaSlots agentsessions",
    "cli.ts": "main",
    "communication.ts": "controlresources controloperations controlsurface authorize apiversion requestcontext successpayload errorpayload assertpublicurl assertresolvedpublicurl assertredirectchain ispublicurl ratebucket ratelimiter jsonresponse errorresponse sseresponse jsonencode jsondecode ndjsonencode ndjsondecode sseencode ssedecode blockstream controlservice webhooksig webhookverify deliveryqueue webhookreceiver",
    "compute.ts": "wittype witparam witfunction witinterface witworld wittotypescript $ witworldhash wasicall wasiasyncruntime fuelmeter withfuel epochinterruption nngraph wasinnbackend wascapability componentacl componentinstance componentregistry poolticket wasmmempool adapterplan forcefallbackadapterplan gpubinding computepipelinedescriptor computepipelinebuilder matmulplan planmatmul2d wgslshadercache temporalscheduler float16tensor f32tof16 f16tof32 iserrorvalue asserterrorvalue sqlitesyncstore loaderhook modulehookchain createprefixhook traceevent perfettotracesink keyloader privatekeystore dataloaderplan plandataloader tfcudacheck checktfcuda onnxsessionoptions buildonnxwebgpusession llmplan planllminference stablediffusionplan planstablediffusion vramallocation vrambudgetplanner canaryverdict wasmcanaryvalidator wasigfxgrant wasigfxplan planwasigfx chatcommand dashboardspec chatopsdashboard bpfprogram ebpfgputelemetry dirtyprediction aimigrationpredictor partykitchannel partykitchannelbuilder l3afapp l3afdconfig l3afappmanager raplzone greenhyperplacement greenhyperpowergovernor statevectorentry statevectorroundtrip statevectorsync bittorrentv2blockbytes p2partifact p2pcontentaddress tailnetendpoint tailscaleendpointplanner tailscalemeshmilestones max9buildvariant roadmapbacklogitem roadmapbacklog backlogCount computefeatureorigin computefeaturemeta computefeatureindex computefeaturecount computerversions nputilepartition nputileplan plannputiles rayvllmnode rayvllmplan planrayvllmcluster crdmanifestplan buildvmcrdmanifest federatedcell federatedquotaplan planfederatedquota webtransportplan planwebtransportendpoint opfsbucket opfsstorageplan planopfsstorage webcodecsstage webcodecspipelineplan planwebcodecspipeline streaminglayer planstreamingexecution planmodelstreaming",
    "containerarch.ts": "CONTAINERARCHIDS containerarchfamily containerarchrow CONTAINERBASEIMAGE CONTAINERARCHES getcontainerarch containerarcherror resolvecontainerarch containerarchreport containerarchcoverage containerarchlines",
    "dashboardlib.ts": "ApiResult LocalSandbox SessionUser localsandboxkey apiresult errormessage pick asarray fmtdate fmtuptime chipclass noderole readlocalsandboxes writelocalsandboxes fallbackcpus fallbackgpus",
    "db.ts": "UserRow SessionRow NodeRow SandboxRow SandboxFileRow SandboxFileDoc WorkspaceUsage EventRow AuditRow OnboardingStateRow OnboardingFlags LabelRow DbError UserFields UserProjection SessionFields NodeAnnouncement SandboxRecordFields EventFields AuditFields WriteReceipt dbpath sandboxquota createuser finduserbyname finduserbyid listusers updatelastlogin createsession findsession deletesession cleansessions registernode heartbeatnode listnodes createsandboxrecord updatesandboxstate listsandboxes listsandboxesbyuser findsandboxbyid updatesandboxusage writefile readfile listfiles deletefile deletesandboxfiles sandboxusage addevent listevents addaudit listaudit getonboardingstate setonboardingstage savelabel readlabel readalllabels seedlabelrows counts healthcheck executeschema store",
    "distribution.ts": "binarytargets portablebinaryplan binarymanifest buildbinary archivelimits archiveinspection extractarchive magicbytes wasmplan transformationkey transformationcache cachedecision cacheeligibility executeisolated artifactformats artifactname releaseartifactmatrix distributionmanifest targetplan binaryplan containerplan publishplan registrymanifest deliverymanifest verifydelivery pwaplan cdncapabilities writeTargetPlan createassets retentionplan createsbom createprovenance verifyassets releaseevidence evaluateevidence releasereadiness evidencefromverification",
    "drizzle.config.ts": "drizzleconfig config",
    "edgelandes.ts": "EdgeLaneArtifact EdgeLaneOutput EdgeLaneExecutor EdgeLaneError edgelaneerror probehostbinary probedocker probewasm probenodevm probemodule probevirtualmodule probes3config probelibsqlconfig probemysqlconfig edgelaneexecutors BaseLaneSpec baselanespecs baselaneids NetLaneSpec netlanespecs edgelaneexecutorsnet netlaneids HostLaneSpec hostlanespecs edgelaneexecutorshost hostlaneids InprocLaneSpec answer inproclanespecs edgelaneexecutorsinproc inproclaneids VirtualLaneSpec virtuallanespecs edgelaneexecutorsvirtual virtuallaneids HeavyweightLaneSpec heavyweightlanespecs edgelaneexecutorsheavy heavyweightlaneids edgelanespecsall edgelaneexecutorsall EXPR",
    "edgeplane.ts": "EdgeRequest EdgeLaneReport EdgeRunResult EdgeStorageAdapter edgelanes edgelandesreport assertvisitorfree runonedge",
    "execution.ts": "inprocess runnerhealth runnerhealthall heartbeat providerchain selectprovider artifacthandoff cancellationplan renderdispatch scheduler runtimename runtimefeatures engine deadline retrypolicy circuitbreaker jobqueue idempotency saga runstatuses runrecord transitionrun resumablerun workflowdispatch waitforrun replay workerbridge persistentqueue filesessions sessionstore corecapabilities runtimecontract unsupportedruntime",
    "family.ts": "FAMILY_SLUGS FamilyMember FAMILY_ACCENTS familyrow",
    "familyurl.ts": "familyurl",
    "format.ts": "formatissues runformatcheck",
    "foundation.ts": "errorcodes saddleerror validationerror artifactnotfound runnerunavailable aserror errorcatalog operationerror classifyerror eventtypes eventbus systemclock idfactory sha256 hmacsha256 constanttimeequal artifactmanifest jobstatuses createjob runnerstatuses runnercontext workingset syncresult validatesession",
    "index.ts": "bellstate deutsch dnacapacity dnavaultdecode dnavaultencode ghzstate grover2 grover3 opticalplan qteleport quantuminspiredrandom quantumregistry quantumsim runbb84 rune91 cgroupsv2slice creatiersengine FREEPOOL githubstorage LATENCYLADDER npmchunkregistry plannpmchunks publishplan rambufferbackend reassembleplan sqlitekv sqlitel3backend swapfilerecipe sysctldropin TIERS tierserror tmpfsrecipe zramrecipe engineversions engineversionkey enginelimits engineruntime enginestate enginespec engineendpoint engineoptions randomPort resolveHost buildEndpoint rulekind specrule specvalidationresult specschema validateSpec metricssample metricsaggregate InternalMemory MetricsStore enginetopics enginetopicname enginebus engineeventbus engineerror safeoutcome safecall enginesnapshot healthreport VirtualEngine engineRegistry createVirtualEngine probeengine lastprobe disposeengine samplinghandle startsampling plangpumode plan defaultplan plantopology qemuargv qemucommand dockerrun plantoml planlint",
    "integration.ts": "transport socketadapter githubadapter gitlabadapter forgeadapter forgejoadapter giteaadapter codebergadapter huggingfaceadapter appstatuses appregistry mcptransport mcpserver browsertools",
    "isolation.ts": "executionrequest executiondecision executionhandoff internalenvelope internalapi",
    "labels.ts": "LABEL_REVISION labelmanifest LabelKey label labelfill seedlabels",
    "localauth.ts": "LocalAccountRole LocalAccountRecord LocalSession AccountsBackupPayload adminusers localaccountnames exportaccounts importaccounts probe register login session logout available roleof",
    "mesh.ts": "NodeRole MeshVerdict MeshEnvelope MeshMessage MainResponse HeartbeatSelf role meshsecret mainurl bodyhash sign verifymesh encrypt decrypt meshmessage openmeshmessage postmain startheartbeat forwardauth",
    "modalityregistry.ts": "BootClass ModalityFamily ModalityState ModalityRecord BOOTLADDER MODALITYPLANCOUNT MODALITIES MODALITY_COUNT ModalityPlanReport planreport BaseProfile JoinRequest resolvejoin getmodality",
    "modes.ts": "publishplan registrymanifest modeprofile librarymode climode binarymode browsermode headlessmode computemode modeaxes operationmodes validatemode modecatalog resolvemode modecapabilities capabilityreport withmode targetprofiles targetmanifest targetcatalog runnermodes RunnerMode",
    "onboardingstate.ts": "VisitorOnboarding OnboardingStage hostallowed mergeStage readOnboardingState loadOnboardingState markIntroSeen markOnboardingSeen resetOnboardingMemory",
    "orchestrator.ts": "affinityrule affinityselector autoscalepolicy awaitable balloonstate brand checkpointid configfilename cpuset deepreadonly dockerbridgemapping draintask gpuassignment gpupassthroughrequest healthcheck healthprobe leaderstate lifecyclestate metricsview migrationjob migrationtype mttgjob numanodeid numatopologyview orchestratoroptions otelpoint passageroute permission plugincontext plugincontract portmapping quotastate rbacprincipal rbacrole replayrecord reservation result roleid runqueue runresult sandboxeventname sandboxruntime sandboxspec snapshotid sriovpf userid VcpuId vcputask vcputopology vmcheckpoint vmdefinition vmid vmrecord vmsnapshot vramballoon allocport cantransition clhruntime composeyaml createvmid cricheckpointer dockerruntime fcrequest firecrackerruntime getorchestrator gvisorruntime kataruntime kvmavailable lifecyclefromphase orchestrator orchestratorerror performetrics priorityqueue qemuruntime resolvehost runtimecatalog runtimeregistry sandboxbuilder sandboxevents sandboxfactory sandboxhandle sandboxmetrics sandboxproxy stackcatalog transitions vmimage warmpool orchestratordemo fluxkustomization fluxgitopsplan planfluxgitops",
    "paths.ts": "assetpath",
    "performance.ts": "LayerTarget LayerPatch PerformanceLayerId PerformanceLayer randomPort ompPresets pickOmpThreads llvmpipeThreads CpuLayer LlvmpipePerfProfile GpuLayer planOvercommit planKsm planHugePages1g planShaderTmpfs MemoryLayer FirecrackerWarmPool TcgOptions buildQemuTcgArgs TcgLayer buildxCacheConfig llvmNativeCflags planMultiStage BuildLayer poolingConfig planTapPreSetup NetworkLayer PerformanceStack createDefaultStack BenchmarkResult percentiles BenchmarkHarness RegressionVerdict RegressionReport RegressionDetector ProfilePhase ProfileMode profileScenario",
    "quantum.ts": "quantumversions quantumerror gate2x2 hmatrix xmatrix ymatrix zmatrix smatrix sdgmatrix tmatrix tdgmatrix rxmatrix rymatrix rzmatrix quantumsim cnot cz toffoli swap ccz circuitproof bellstate ghzstate grover2 grover3 deutschverdict deutsch qteleport bb84basis alice bob eve bb84channel bb84result runbb84 e91result rune91 quantuminspiredrandom anuqrng quantuminspiredbytes dnavaultspec dnavaultencoderesult dnavaultencode dnavaultdecode dnacapacityspec dnacapacity planodefault opticalvaultspec opticalplan holographicnote storagecompare qramcell qramreadresult qrambucketbrigade qramdemo shorcircuitplan shorplan quantumregistry quantumregistrytype quantumcheckrow quantumselfcheck",
    "render.ts": "cpucaps gpuspoof lpperfstage probereport rendertarget runresult smiprocess xvfboptions advisethreads cpucapsdomain defaultgeometry defaultgpuregistry gpuprofilebuilder gpuregistry gpuspoofdata lavapipe llvmpipe mesaenvbuilder mesastack pciid randomdisplay renderenv rendererfactory rendererproxy renderprobe run rusticl smiadapterbuilder xvfbargs xvfbdisplay renderdemo",
    "runall.ts": "",
    "runtimeprobe.ts": "",
    "sandbox.ts": "CpuSpec GpuSpec MigProfile SandboxSpec CpuTopology SandboxFile SandboxFs SandboxState DispatchResult DispatchContext cpudata getcpu getcpubyid solvetopology cpuinfo lscpu gpudata getgpu migprofiles getmig pagealign meminfo freeh nvidiaSmiTable nvidiaSmiList clinfoSummary vulkanSummary glxinfoSummary mesaenv bootSequence createSandboxState commands dispatch quantumdemo tiersdemo streamingdemo SandboxLifecycleState SANDBOX_LIFECYCLE_STATES canTransition refusalFor SandboxLifecycleAction SANDBOX_LIFECYCLE_ACTION_TARGETS specenvlimits sandboxbaseid sandboxosid sandboxarchid sandboxformid sandboxnetworkid sandboxosfamily SANDBOXBASES SANDBOXOSES SANDBOXARCHES SANDBOXFORMS SANDBOXNETWORKS sandboxbaselimit sandboxspeclimits sandboxspecinput resolvedsandboxspec sandboxspecerrorcode sandboxspecerror resolvesandboxspec osfamily sandboxenginespec enginespecfor sandboxphase SANDBOXTERMINALPHASES sandboxphasebudgets sandboxqueueentry sandboxqueueevent sandboxqueueerrorcode sandboxqueueerror cansandboxstep issandboxterminal sandboxqueueoptions sandboxqueuestatus createsandboxqueue accountusage accountlimits resourcewish quotaerrorcode quotaerror accountquotasnapshot createaccountledger sandboxrowlike usagefromrows accountlimitsfromenv",
    "scheduler.ts": "shardplan plantypecheckshards sharedmemorycache projectgraph miglayoutplan planmiglayout vcpuhotplug ramhotplug gpuunit compositionlayout plancomposition numanode planumalayout numactlargs devicemodel devicemodelregistry createdefaultdeviceregistry tinypredictor schedtask aipsched psilstm tenanttier tenantqosprofile admissionrequest tenantadmission anomalyrecord otlplogrecord anomalydetector spechotreload otlpmetricpoint otelmetricsbridge healthreport healthcheckregistry shutdowntask gracefulshutdown pluginevent pluginhandler pluginhooksystem schedulerfeatureorigin schedulerfeaturemeta schedulerfeatureindex schedulerfeaturecount schedulerversions autoscalearm autoscalerdecision rlautoscaler crdtentry crdtmergeresult vmconfigcrdt",
    "scriptlanes.ts": "ScriptStep ScriptPlan ScriptRunOptions ScriptStepResult ScriptRunResult ScriptRunRecord assertservercontext interpretsh interpretyml interpretyaml compilewithbabel runscript runscriptbackground scriptRunStatus SCRIPTLANES_NODE_BASE dockerdescriptor",
    "scriptsbuildengine.ts": "",
    "scriptssecuritygate.ts": "",
    "scriptsvalidateflatnative.ts": "",
    "security.ts": "cgroupplan ebpfattach keypair landlockabientry landlockrule landlockruleset landlockscope policyeventname sandboxprofile seccompgroup seccompprofile securitycheck cgroupbuilder cgroupv2layout chachaopen chachaseal criurelabel defaultpolicies defaultseccompprofile detectlandlockabi ebpfattachplan ebpflsmfacts kernelversion landlockabitable landlockfsaccess landlocknetaccess landlockplan landlockrulebuilder landlockscopes lsmlist policyevents policyproxy policyregistry pqcatalog pqkeyfactory pqsecurecontext profilebuilder randomtoken seccompactions seccompbuilder securityselfcheck syscallnumbers tokenequals pqtmechanism rfc10024mechanisms rfc10024negotiator pqcauditentry pqcaudittrail noinfer policydefault policypreset",
    "seedcatalog.ts": "seedMediaSlots seedAgentSessions",
    "server.ts": "nodeserver",
    "tiers.ts": "tierserror vramtierid vramtier TIERS selecttier latencylevel LATENCYLADDER latencyfor autoscalestrategy autoscaleresult autoscalebysize freepoolentry FREEPOOLSOURCE FREEPOOL freepooltotalgb kvstats sqlitekv storagebackend rambufferbackend sqlitel3backend crc32 zipentry zipbuild zipread NPMCHUNKBYTES NPMCHUNKNOTE npmchunkplan npmchunklayout npmchunkoptions plannpmchunks reassemblyplan reassembleplan publishplan npmchunkregistry plannedcall uploadresult githuboptions githubblob githubstorage MAXVDRADDRESS VDRADDRESSEB VDRBLOCKCONTENTTYPE vdrcompression formatvdraddress parsevdraddress validatevdraddress memoryblock vdrheadervalues vrdblockheaders pagetable localpagetable upstashplan upstashplanner ringflush ringstats ringoptions vrdringbuffer vdrengineoptions vdrstats universalvdrengine kernelrecipe RECIPESOURCE zramrecipe tmpfsrecipe swapfilerecipe MMAPCONSTANTS bridgeplanstep storagerambridgeplan storagerambridgeplanner sysctldropin slicelimits cgroupslice cgroupsv2slice magicid MAGICBYTES magicresult sniffmagic vfsinode vfsdentry virtualfilesystem computebuffer storagebuffer safeloadresult enginecounters memoryengine tiersengineconfig tiersstack creatiersengine catalogkind catalogplan catalogoptions quotaplanner tiersreport",
    "utils.ts": "cn",
    "vaulthandoff.ts": "VaultArtifact VaultPut VaultManifest VaultReceipt VaultCounts FaunVerdict VaultSink VaultError vaultsink faunblock faunblockroutes assertvisitorstorefree",
    "virtual.ts": "sha256 memoryobject computeresult tobytes transformtocompute transformtostorage internalmemory externalmemory physicalmemory vectorizedmemory librarymemory targetfactory targeturi memoryengine workingbudget workingadmission bridgeplan materializationrecord materializationledger localmemory storageadapter memorystorage tieredcache collectbytes contentstorage storagecapabilities objectmanifest comparemanifests syncobject syncbackends chunkedstorage localstorage storagepool s3compatible githubcontents filehosting schemadefinition schemasql prismaschema persistenceadapter memorypersistence sqlpersistence mysql2persistence drizzlepersistence prismapersistence migrationlist migrationplan latestmigration memoryerror memorytierid memorytier MEMORY_TIERS selecttier tierbandwidthgbs memorylimits memoryrequest memoryrequestresult migprofileid migprofile MIGPROFILES getmigprofile validatememoryrequest numatopology buildnumatopology NUMATOPOLOGIES hugepageconfig planhugepages ksmcontroller ballooningcontroller overcommitcontroller swapdevice planswapdevices shadercachecontroller dockermemoryoptions dockermemoryflags dockerMemoryFlags transferview memorycontroller ddr5controller hbm3econtroller gddr7controller creatememorycontroller regionpurpose memoryregion regionbuilder guardregion regionledger proberegion readprobe totalallocatedgb pressureevent pressurelistener memorystats memoryplan planmemory buildKernelArgs virtualmemorymanager createVirtualMemory placementtier placementspec cxxldevice zramprofile hugepageprofile vcpupinningmap hostmemoryplan tierpolicy zramalgorithm memorymodularizer meminfoptions pagealign generateVirtualMeminfo meminfoForMiB memorySwap shmSize meminfo128gtotalkb generatememinfo128g hardwareerror vendorid vendorprofile ZEN5FLAGS ARROWLAKEFLAGS vendorprofiles virtualcpuspec BEST_VIRTUAL_PROCESSORS cpuRegistry normalizemodel registerVirtualCpu getVirtualCpu findVirtualCpus listVirtualCpus removeVirtualCpu stableModelId topologysolution solvetopology cpuinfoptions generateVirtualCpuinfo generateVirtualLscpu provisionedcpu virtualcpubuilder createVirtualProcessor cpucountlimits validateCpuCount marchFlag boards cpuscoreweights cpuscore compareVirtualProcessors listBestVirtualProcessors serializeprovisionedcpu modellease virtualcpudemo gpuerror pciIds smidriveranchor nvmlMockEnv virtualgpuspec GPU_BANK fullpciid bindVfio unbindVfio romDump lookingGlassB7 nvidiaVgpuProfiles vendorResetFamilies intelSriovDkms vgpuprofile VGPUPROFILES getvgpuprofile miglayout MIGLAYOUTBLACKWELL validatedensity composemigcatalog gpustaticspec GPUSTATICSPECS NVENCDUALENGINE nvencsession nvencsessiontable nvencCanFit nvencdescribe gpuregistry listgpus getgpu registergpudata virtualgpubuilder createvirtualgpu qemuopts buildqemucmd qemuversioncheck passagemode passagecfg setupbridge setupsriov setupmacvtap setupipvlan setupoverlay setupzerotrust setuplatencyopt ebpfprogram tenant tenantqosmap ensureroot tenantcgroupbuilder createtenant cpumaxqos eevdfinfo boreinfo schedextinfo psidamoninfo criumigrationinfo MTTG_MAX mttglane mttggrid creategrid steal spawnthreads multiplex memorybackendplan buildmemorybackendargs kvmcapnames criuplan plancriudump plancriurestore validatecriuimages snapshotplan planfilesnapshot uffrestoreplanner diffsnapshotengine migrationphase livemigration idmappedmountplan planidmappedmount cxltype3device cxltype3plan plancxltype3 znszonegroup znszoneplan planznszones p4tablespec p4programplan buildp4skeleton tsnwindow tsnscheduleplan buildtsnschedule",
    "vite.config.ts": "defineConfig",
    "vitest.config.ts": "defineConfig",
    "webserver.ts": "server sandboxes createsandbox handleapi SandboxCreateBody SandboxSpecView SandboxRecord SandboxPublicView SandboxShelfRow",
    "workloadlaw.ts": "WorkloadDemand LaneToday WorkloadLane LaneVerdict LaneJoin FAMILYLANES CATALOGAPPS lanesof getlane lanejoin familyjoin AppWorkloadReport FamilyWorkloadReport workloadreport",
  };

  /** live cross-app import edges of saddle root files — the dedup law at work. */
  const saddleCross: CrossImports = {
    "labels.ts": [
      { from: "../vault/labelstore.ts", symbols: ["createLabelStore"] },
    ],
  };

  /**
   * stealthhead — the FPS game leaf, in construction.
   * 21 root logic files, 258 exported logics, owner stealthhead.
   */
  const stealthheadRaw: RawFileLogics = {
    "capacitor.config.ts": "config",
    "cli.ts": "main",
    "db.ts": "sqlite getlobby getlobbyplayers getranking getweapons getworldassets OnboardingStateRow getonboardingstate setonboardingstage LabelRow savelabel readlabel readalllabels seedlabelrows",
    "drizzle.config.ts": "defineConfig",
    "family.ts": "FAMILY_SLUGS FamilyMember FAMILY_ACCENTS familyrow",
    "familyurl.ts": "familyurl",
    "hud.ts": "Vitals VitalTier DamageReport MinimapBounds MinimapConfig MinimapPoint HitmarkerKind Hitmarker KillfeedEntry DamageSector DamagePing VITALTHRESHOLDS HITWINDOWS KILLFEEDTTL KILLFEEDCAP DAMAGESTRENGTHFLOOR poolfraction vitaltier applydamage healthfraction shieldfraction isalive effectivepool minimapbounds minimapconfig tominimap hitmarkerwindow hitmarkerfor pushhitmarker activehitmarkers pushkillfeed prunekillfeed killfeedline directionaldamage sectorof",
    "labels.ts": "LABELREVISION LABELMANIFEST LabelKey label labelfill seedlabels",
    "match.ts": "MatchRound MatchPlayer MatchLobby MATCHSEED MATCHPLAYERSEED listmatches listmatchplayers orderlobbies roundcounts currentround seatleaderboard LobbyState RoundState matchruleserrorcode matchruleserror LOBBYTRANSITIONS ROUNDTRANSITIONS MatchEvent AdvanceOptions MatchAction canlobbytransition canroundtransition transitionlobby openround scoreround seatplayers addscore advancelobby nextactions progressof",
    "netcode.ts": "EntityState Snapshot SnapshotDelta InputCmd Reconciliation JitterPacket JitterBuffer RewindBuffer CMDSPEED DEFAULTINTERPDELAY RECONCILETHRESHOLD REWINDCAP wrapangle yawlerp makedelta applydelta latestsnapshot bracketpair lerpentity interpolateat simulatecmd replaycmds positionerror needsreconcile reconcile pushrewind rewindattick entityattick jitterof makejitterbuffer pushpacket duepackets",
    "onboardingstate.ts": "VisitorOnboarding OnboardingStage hostallowed mergeStage readOnboardingState markOnboardingStage resetOnboardingMemory",
    "physics.ts": "Vec3 Aabb Sphere Body Projectile PhysWorld ProjectileStep Accumulator DEFAULTGRAVITY vec3 add scale dot length normalize distance aabb aabbcenter closestpoint sphereboxhit spherespherehit boxboxhit sweepbox stepbody applydrag stepprojectile fixedsteps createworld",
    "ranking.ts": "RankingEntry RANKINGSEED listranking sortentries assignpositions filterbyseason winrate podium laddererrorcode laddererror KBand LadderOptions LadderOutcome LadderSide DuelResult expectedscore kfactor ratingdelta applydelta rankduel projectedrating",
    "reveal.ts": "observeReveals",
    "sandboxmodality.ts": "AppWorkloadLane APPSLUG WORKLOADLANES SANDBOXLANEENV LaneSeatResult lanesandbox lanesandboxfromenv laneof",
    "spawner.ts": "SpawnVec3 SpawnTeam SpawnPoint DeathMark SpawnQuery SpawnPick SpawnerConfig WavePlan WaveConfig DEFAULTSPAWNCONFIG SPAWNSEED makerng distance spawnpointsformap spawnpointsforteam filterbymindistance nearestdistance campscore scorepoints shortlist pickspawn selectspawn withdeath respawnwait protectionuntil isprotected buildwave duewaves",
    "theme.ts": "ThemeName currentTheme applyTheme toggleTheme",
    "vite.config.ts": "defineConfig",
    "vitest.config.ts": "defineConfig",
    "weapons.ts": "WeaponKind Weapon WEAPONCATALOG listweapons dps kinds filterbykind handling bydamage ballisticserrorcode ballisticserror FalloffSpec TtkResult BalanceBounds BalanceViolation TtkOptions damageatmeters shotstokill timetokill ttkbydistance validatebalance",
    "world.ts": "WorldAssetKind WorldAsset RenderIntent RENDERINTENT WORLDCATALOG ishashshape normalizepath glbpath catalogasset verifyasset filterbykind humansize listworldassets",
  };

  /** live cross-app import edges of stealthhead root files — the dedup law at work. */
  const stealthheadCross: CrossImports = {
    "db.ts": [
      { from: "@wenathlan/vault/storage", symbols: ["openStorageLane"] },
    ],
    "labels.ts": [
      { from: "@wenathlan/vault/labelstore", symbols: ["createLabelStore"] },
    ],
  };

  /**
   * vault — the storage bucket leaf, the Supabase competitor.
   * 32 root logic files, 334 exported logics, owner vault.
   */
  const vaultRaw: RawFileLogics = {
    "accounts.ts": "PASSWORD_MIN_CHARS emailValid emailOf passwordValid hashPassword passwordMatches AccountLaneError AccountRow AccountRefusal createAccount verifyCredentials SESSION_PREFIX sessionSecretConfigured sessionTtlSeconds SessionIssued SessionView issueSession verifySession KEY_PREFIX ProjectKeyRow KeyRefusal createProjectKey listProjectKeys revokeProjectKey resolveProjectKey projectOwner projectOwnedBy AuthRateVerdict authRateVerdict resetAuthRateLimiter SignupAccountRow DatabaseRow ApiKeyRow PASSWORD_FLOOR signupEmailValid SignupRefusal SignupAnswer signupAccount SigninAnswer signinAccount accountOf accountOfEmail databasesOfEmail ensurePersonAccount accountVerified DATABASE_ID_PATTERN databaseIdValid RegisterAnswer RegisterRefusal registerDatabase databaseOf databasesOfAccount setDatabaseQuota API_KEY_PREFIX IssueKeyAnswer issueApiKey ApiKeyLookup apiKeyLookup revokeApiKey apiKeysOf siteStore",
    "api.ts": "routes vaultTokenConfigured tokenVerdict routeCount createVaultServer listenVault",
    "buckets.ts": "BucketRule BucketShelf seedRules ruleFor objectsOf bucketShelf shelfOf bucketsInUse retentionLabel shelfBytes",
    "capacitor.config.ts": "config",
    "chunks.ts": "CHUNK_BYTES ChunkSlice split reassemble ChunkEncoding StoredChunk encodeChunk decodeChunk chunkIntact manifestEntryOf ChunkManifestEntry VaultChannel StorageTier tierFor ObjectManifest",
    "cli.ts": "main",
    "db.ts": "SqlParam tables db ensureSchema OnboardingStateRow OnboardingFlags getOnboardingState setOnboardingStage LabelRow saveLabel readLabel readAllLabels seedLabelRows",
    "decoy.ts": "decoyledger isprobe encrypteddecoy",
    "drizzle.config.ts": "defineConfig",
    "drizzle.ts": "accounts projects storageObjects chunks chunkRefs quotas projectKeys storageTables StorageDatabase StorageExecutor ensureStorageSchema StorageDriverError openStorage storage closeStorage storageDriverKind",
    "family.ts": "FAMILY_SLUGS FamilyMember FAMILY_ACCENTS familyAccentOf familyrow familyurl",
    "hometypes.ts": "HomeProps",
    "index.ts": "openStorageLane PRAGMA_BOOTSTRAP StorageLane StorageLaneOptions CHUNK_BYTES VaultChannel",
    "internalroot.ts": "DATABASE_FILE_EXTENSIONS DBFILE_REFUSAL_CODE databaseFileRefused InternalPathAnswer resolveInternalPath internalRootDir serveInternal",
    "labels.ts": "LABEL_REVISION LABEL_MANIFEST LabelKey label labelfill seedLabels",
    "labelstore.ts": "LabelStoreRow LabelRowStore LabelKeyOf LabelStore LabelStoreOptions createLabelStore",
    "mimetypes.ts": "MimeCorpusError parseMimeCorpus MimeTypeRow MIMETYPES MIME_FAMILIES MIME_TYPE_COUNT MIME_EXTENSION_COUNT MIME_ENTRY_COUNT mimeTypeFor extensionsFor mimeTypeRow extensionOf contentTypeFor",
    "objects.ts": "CHUNK_BYTES VaultChannel VaultObject VAULT_BUCKETS fnv1a fnv1aHex digestFor objectIdentity sealObject pointerTextOf VaultCensus vaultCensus mulberry32 seedVault formatBytes digestShort channelPreview verifyObject projectIdValid objectPathValid mimeValid ProjectRow createProject ProjectListRow ProjectPage listProjects objectProjectOf PutInput LedgerObject LedgerRefusal PutAnswer putObject GetAnswer getObject DeleteAnswer deleteObject SweepAnswer sweepOrphans UsageAnswer usageOf CensusAnswer storageCensus listObjects",
    "onboardingstate.ts": "VisitorOnboarding OnboardingStage onboardingbase hostallowed mergeStage readOnboardingState markOnboardingStage resetOnboardingMemory",
    "protocols.ts": "ProtocolCorpusError ProtocolSecurity ProtocolRow parseProtocolCorpus PROTOCOLS PROTOCOL_COUNT PROTOCOL_ROUTE_PREFIX protocolRoute PROTOCOL_ROUTE_COUNT PROTOCOL_GROUPS findProtocol protocolsByGroup tlsCapableProtocols protocolRouteOf",
    "querylane.ts": "databasesDir databaseFileOf laneOf closeQueryLanes databaseUsageOf QueryLaneVerdict queryVerdict QUERY_SQL_LIMIT QUERY_PARAM_LIMIT QueryRefusal QueryAnswer QueryInput runQuery",
    "quota.ts": "quotaFloorFromMb QUOTA_FLOOR_BYTES QuotaVerdict quotaVerdict QuotaLimitParse quotaLimitFrom QuotaRow readQuota ensureQuota setQuota",
    "retention.ts": "RetentionState RetentionVerdict verdictOf retentionVerdicts SweepPlan sweepPlan firstDueTick horizonTick ROLL_STEP tickLabel",
    "routes.ts": "routes",
    "sandboxmodality.ts": "AppWorkloadLane APPSLUG WORKLOADLANES SANDBOXLANEENV LaneSeatResult lanesandbox lanesandboxfromenv laneof",
    "sha.ts": "sha256Hex sha1Hex digestMatches isSha256Hex isSha1Hex",
    "storage.ts": "LfsPointer GitBlob StorageRecord lfsPointerText lfsPointerFrom digestValid storageRecordValid storageModeFor SqlParam PRAGMA_BOOTSTRAP StorageDriverName StorageLaneOptions StorageLane openStorageLane",
    "uistore.ts": "uistoreseedrows uicopyrow loaduicopy uicopy uicopyfill useUicopy uistoreget uistorelist uistoreupsert uistoreingest ensureuicopyingested",
    "utils.ts": "splitwords",
    "vaultclient.ts": "vaultorigin vaulttokenconfigured vaultproject HealthAnswer UsageAnswer ObjectRow QuotaAnswer SweepAnswer AccountAnswer RegisterDatabaseAnswer SignInAnswer ProjectRow ListProjectsAnswer KeyRow CreateKeyAnswer LaneRefusal LaneAway FetchSeam VaultClientOptions vaultclient useVaultUsage useVaultQuota",
    "vite.config.ts": "defineConfig",
    "vitest.config.ts": "defineConfig",
  };

  /** live cross-app import edges of vault root files — the dedup law at work. */
  const vaultCross: CrossImports = {
    "mimetypes.ts": [
      { from: "@wenathlan/argan/mimetypes", symbols: ["createMimeCatalog", "MimeCorpusError", "parseMimeCorpus", "MimeCorpusRow"] },
    ],
  };

  /** expand the raw records of one app into full catalog entries. */
  function expand(app: App, raw: RawFileLogics, cross?: CrossImports): LogicEntry[] {
    return Object.keys(raw).map((file) => ({
      app,
      file,
      domain: domainOf(app, file),
      symbols: raw[file] ? raw[file].split(/\s+/) : [],
      imports: cross?.[file],
      owner: app,
    }));
  }

  /**
   * LOGICS — the master catalog. One entry per root TS file of the 11 apps,
   * every export symbol reindexed, every cross-app import edge recorded.
   */
  export const LOGICS: LogicEntry[] = [
    ...expand("argan", arganRaw, arganCross),
    ...expand("cadria", cadriaRaw, cadriaCross),
    ...expand("cobaia", cobaiaRaw, cobaiaCross),
    ...expand("debonair", debonairRaw, debonairCross),
    ...expand("devthink", devthinkRaw, devthinkCross),
    ...expand("forge", forgeRaw, forgeCross),
    ...expand("foundry", foundryRaw, foundryCross),
    ...expand("getry", getryRaw, getryCross),
    ...expand("saddle", saddleRaw, saddleCross),
    ...expand("stealthhead", stealthheadRaw, stealthheadCross),
    ...expand("vault", vaultRaw, vaultCross),
  ];

  /** the catalog entries of one app. */
  export function byApp(app: App): LogicEntry[] {
    return LOGICS.filter((entry) => entry.app === app);
  }

  /** the catalog entries of one functional domain. */
  export function byDomain(domain: string): LogicEntry[] {
    return LOGICS.filter((entry) => entry.domain === domain);
  }

  /**
   * every catalog entry that exports the named logic — entry.owner is the
   * owner per the dedup law. More than one entry means a dedup candidate.
   */
  export function findOwner(logicName: string): LogicEntry[] {
    return LOGICS.filter((entry) => entry.symbols.includes(logicName));
  }

  /**
   * DUPLICATE_FAMILIES — the dedup candidates the catalog itself spots:
   * symbol families still re-declared in several app roots, with the owner
   * suggestion per the PR19 domain ownership map. Every suggestion already
   * has live import proof somewhere in the tree.
   */
  export const DUPLICATE_FAMILIES: ReadonlyArray<{
    family: string;
    symbols: string[];
    apps: App[];
    owner: App;
    note: string;
  }> = [
    {
      family: "label store",
      symbols: ["label", "LabelKey", "labelfill", "LabelRow", "saveLabel", "readLabel", "readAllLabels", "seedLabels", "seedLabelRows", "LABEL_REVISION", "LABEL_MANIFEST"],
      apps: ["argan", "cadria", "cobaia", "debonair", "devthink", "forge", "foundry", "getry", "saddle", "stealthhead", "vault"],
      owner: "vault",
      note: "vault/labelstore.ts is the owner; saddle/labels.ts already imports createLabelStore from ../vault/labelstore.ts — the other roots should import it too",
    },
    {
      family: "sandbox lane seating",
      symbols: ["AppWorkloadLane", "APPSLUG", "WORKLOADLANES", "SANDBOXLANEENV", "LaneSeatResult", "lanesandbox", "lanesandboxfromenv", "laneof"],
      apps: ["argan", "cadria", "cobaia", "debonair", "devthink", "forge", "foundry", "getry", "stealthhead", "vault"],
      owner: "saddle",
      note: "saddle/workloadlaw and saddle/modalityregistry are the owners; cadria, debonair and getry already import saddle/workloadlaw live",
    },
    {
      family: "family roster",
      symbols: ["FAMILY_SLUGS", "FamilyMember", "FAMILY_ACCENTS", "familyrow", "familyurl"],
      apps: ["argan", "cadria", "debonair", "devthink", "forge", "foundry", "getry", "saddle", "stealthhead", "vault"],
      owner: "devthink",
      note: "the OS envelope owns the family roster; every root re-declares the same 11-member list",
    },
    {
      family: "theme",
      symbols: ["Theme", "currentTheme", "applyTheme", "initTheme", "toggleTheme"],
      apps: ["argan", "cadria", "debonair", "devthink", "forge", "getry", "stealthhead"],
      owner: "devthink",
      note: "the OS envelope owns the platform chrome theme; seven roots carry the same five-symbol twin",
    },
    {
      family: "onboarding state",
      symbols: ["OnboardingStateRow", "OnboardingFlags", "getOnboardingState", "setOnboardingStage", "readOnboardingState", "loadOnboardingState", "markIntroSeen", "markOnboardingSeen", "mergeStage", "hostallowed"],
      apps: ["argan", "cadria", "cobaia", "debonair", "devthink", "forge", "foundry", "getry", "saddle", "stealthhead", "vault"],
      owner: "devthink",
      note: "the OS envelope owns onboarding; the roots carry drifted twins (getonboardingstate vs getOnboardingState)",
    },
    {
      family: "cleanurl",
      symbols: ["cleanUrl", "applyNow", "syncCanonical"],
      apps: ["argan", "cadria", "debonair", "devthink"],
      owner: "argan",
      note: "the network leaf owns URL canonicalization; four roots carry the same three-symbol twin",
    },
    {
      family: "reveal",
      symbols: ["initReveal", "useReveal"],
      apps: ["argan", "cadria", "debonair", "getry", "stealthhead"],
      owner: "devthink",
      note: "the OS envelope owns the shared reveal motion; five roots carry the same two-symbol twin",
    },
    {
      family: "tooling config",
      symbols: ["config", "defineConfig", "main"],
      apps: ["argan", "cadria", "cobaia", "debonair", "devthink", "forge", "foundry", "getry", "saddle", "stealthhead", "vault"],
      owner: "foundry",
      note: "the build pipeline owns tooling twins (capacitor.config config, vite/vitest defineConfig, cli main); devthink/build.ts already imports foundry/bundlescan live",
    },
  ];

  /**
   * the cross-app import specifier of an app's logic — the dedup law's handle.
   * importSpec("cadria") returns the @devthink/<app> root specifier; with a
   * file, importSpec("cadria", "synth.ts") returns @devthink/cadria/synth.
   * The tree's published twin is @wenathlan/<app>/<stem> and the relative
   * twin from any app root is ../<app>/<file>.ts — see DEDUP_LAW.
   */
  export function importSpec(app: App, file?: string): string {
    const stem = file ? file.replace(/\.ts$/, "") : "";
    return stem ? `@devthink/${app}/${stem}` : `@devthink/${app}`;
  }

  /** catalog totals, the shape of the reaggregation. */
  export const LOGIC_STATS = {
    apps: APPS.length,
    files: LOGICS.length,
    logics: LOGICS.reduce((total, entry) => total + entry.symbols.length, 0),
    domains: new Set(LOGICS.map((entry) => entry.domain)).size,
    crossEdges: LOGICS.reduce(
      (total, entry) => total + (entry.imports ? entry.imports.length : 0),
      0,
    ),
  } as const;

  /** `bun logics.ts` — the catalog summary of the whole platform. */
  if (import.meta.main) {
    console.log(
      `logics.ts — ${LOGIC_STATS.apps} apps, ${LOGIC_STATS.files} files, ${LOGIC_STATS.logics} logics, ${LOGIC_STATS.domains} domains, ${LOGIC_STATS.crossEdges} cross-app edges`,
    );
    for (const app of APPS) {
      const entries = byApp(app);
      const logics = entries.reduce((total, entry) => total + entry.symbols.length, 0);
      console.log(`  ${app}: ${entries.length} files, ${logics} logics, owner ${app}`);
    }
  }

