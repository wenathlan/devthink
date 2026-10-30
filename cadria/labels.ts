/**
 * labels.ts — the copy law of cadria: every interface string lives in the
 * label store, the wingets read through this typed accessor, and a
 * hardcoded string inside a widget is a defect. the manifest below is the
 * english source of truth extracted from the real strings of the Sol wingets
 * and the page anchors; the seed ingests it into the labels store (the site
 * db through db.ts on the server, the browser rows cache in the visitor
 * machine) and the seed never overwrites a translated row.
 *
 * the browser never imports db.ts (better-sqlite3 cannot ride the static
 * bundle): the type comes across erased, the browser seed mirrors the rows
 * into the local cache the way onboardingstate.ts mirrors the seen flags.
 */

import type { BrowserLabel } from "./db.ts";

/** the label revision of the manifest: bump on every copy wave so the seed
 * refreshes the store rows of the changed strings. */
export const LABEL_REVISION = 3;

/** the english manifest: the page.widget.key path answers the surface text. */
export const labelManifest = {
  // the root entry (the error boundary of App.tsx)
  "app.boot.failed": "cadria could not render this page frame.",
  "app.boot.reload": "reload the page",
  // the shell chrome (the one application window)
  "shell.skip": "skip to content",
  "shell.name": "cadria",
  "shell.role": "video and image of the family",
  "shell.windowAria": "cadria",
  "shell.brandmark.wordmark": "cadria",
  "shell.theme.tipLight": "light theme",
  "shell.theme.tipDark": "dark theme",
  "shell.theme.ariaLight": "switch to the light theme",
  "shell.theme.ariaDark": "switch to the dark theme",
  "shell.caption.minimize": "minimize",
  "shell.caption.minimizeAria": "Minimize",
  "shell.caption.restore": "restore",
  "shell.caption.restoreAria": "Restore",
  "shell.caption.maximize": "maximize",
  "shell.caption.maximizeAria": "Maximize",
  "shell.caption.close": "close",
  "shell.caption.closeAria": "Close",
  "shell.restore.chip": "cadria",
  "shell.restore.aria": "Restore cadria",
  "shell.rail.primary": "primary",
  "shell.rail.family": "the wenathlan family",
  "shell.rail.familyTip": "{slug} — a family surface",
  "shell.rail.familyOpen": "open {slug} in its own tab",
  "shell.rail.home": "home",
  "shell.rail.homeDetail": "the video and image home of the family",
  "shell.rail.player": "player",
  "shell.rail.playerDetail": "the artwork viewer — local video and rendered frames",
  "shell.rail.studio": "studio",
  "shell.rail.studioDetail": "the creative workspace of the studio",
  "shell.rail.editor": "editor",
  "shell.rail.editorDetail": "the timeline: clips, trims and the playhead on exact ticks",
  "shell.rail.gallery": "gallery",
  "shell.rail.galleryDetail": "renders by discipline, video and image",
  "shell.rail.settings": "settings",
  "shell.rail.settingsDetail": "appearance and player defaults",
  // the titlebar route titles
  "shell.title.home": "home",
  "shell.title.studio": "studio",
  "shell.title.editor": "editor",
  "shell.title.gallery": "gallery",
  "shell.title.player": "player",
  "shell.title.settings": "settings",
  "shell.title.onboarding": "first run",
  "shell.title.notfound": "not found",
  // the intro splash (the akash floor)
  "intro.splash.name": "cadria",
  "intro.splash.role": "video and image of the family",
  // the intro landing bar and hero (intro.tsx)
  "intro.nav.word": "cadria",
  "intro.nav.studio": "studio",
  "intro.nav.editor": "editor",
  "intro.nav.gallery": "gallery",
  "intro.nav.player": "player",
  "intro.nav.cta": "open the studio",
  "intro.hero.eyebrow": "cadria · the studio that listens",
  "intro.hero.titleLine1": "hear a sound.",
  "intro.hero.titleLine2": "see its picture.",
  "intro.hero.lede":
    "drop any audio — the engine reads its spectrum, rhythm, tonality, timbre and structure, then deterministically generates the artwork the sound implies: palettes from key, composition from sections, texture from timbre, motion from bpm. one hundred percent client-side — the same audio always renders the same image.",
  "intro.hero.cta": "open the studio",
  "intro.hero.cue": "hear to see — the engine, live",
  "intro.hero.note": "no uploads · no accounts · deterministic by construction — the demo below runs the real chain",
  // the intro capabilities (the four generation lanes)
  "intro.capabilities.eyebrow": "what the studio reads",
  "intro.capabilities.title": "four paths, one image",
  "intro.capabilities.spectrumLane": "spectrum → color",
  "intro.capabilities.spectrumTitle": "palette from key",
  "intro.capabilities.spectrumText":
    "tonal center and brightness set the anchor hue, the chroma depth and the accent fan of the palette.",
  "intro.capabilities.structureLane": "structure → composition",
  "intro.capabilities.structureTitle": "layout from sections",
  "intro.capabilities.structureText":
    "section count and narrative shape cast the hero, cadre, field and edge blocks of the frame.",
  "intro.capabilities.timbreLane": "timbre → texture",
  "intro.capabilities.timbreTitle": "surface from timbre",
  "intro.capabilities.timbreText":
    "noisiness, warmth and flux drive the grain, the stroke softness and the glaze of the surface.",
  "intro.capabilities.rhythmLane": "rhythm → motion",
  "intro.capabilities.rhythmTitle": "move from bpm",
  "intro.capabilities.rhythmText": "tempo, punch and regularity pace the pulse, drift, wipe and reveal of every loop.",
  // the intro demo strip (the real engine, live)
  "intro.demo.eyebrow": "live preview",
  "intro.demo.title": "pick a fixture. hear to see.",
  "intro.demo.lede":
    "three synthetic fixtures are synthesized in code — no upload, no network. the real chain reads the slice, the readout reports what it heard, and the render layer draws the frame the audio describes.",
  "intro.demo.fixturesAria": "built-in synthetic fixtures",
  "intro.demo.analysis": "analysis",
  "intro.demo.statusIdle": "idle — pick a fixture; the chain answers in under a second.",
  "intro.demo.statusReading": "reading spectrum · rhythm · tonality · timbre · structure…",
  "intro.demo.statusError": "this clip could not be processed.",
  "intro.demo.statusReady": "preview ready — run it again: same audio, same image.",
  "intro.demo.signature": "sig {signature} · {size}×{size} px · deterministic",
  "intro.demo.artAria": "deterministic artwork rendered from the {fixture} fixture",
  "intro.demo.artEmptyAria": "the rendered frame lands here",
  "intro.demo.artEmpty": "the frame lands here",
  // the intro footer (the family row and the legal line)
  "intro.footer.familyAria": "the wenathlan family",
  "intro.footer.family": "the family",
  "intro.footer.memberTip": "{slug} — the {slug} surface of the family",
  "intro.footer.legal":
    "cadria — the video and image home of the wenathlan family · every render is computed locally; nothing is stored, uploaded or tracked · © wenathlan, gpl-3.0-only",
  // the home surface (the greeting, the entry, the ledgers)
  "home.greeting.night": "good night",
  "home.greeting.morning": "good morning",
  "home.greeting.afternoon": "good afternoon",
  "home.greeting.evening": "good evening",
  "home.hero.eyebrow": "cadria · home — {greeting}",
  "home.hero.title": "make the picture the sound implies.",
  "home.hero.lede":
    "one window: the studio listens to audio, the engine renders the artwork it implies, the gallery keeps the frames. deterministic, client-side, nothing sent anywhere.",
  "home.entry.head": "generate",
  "home.entry.title": "open the studio",
  "home.entry.sub": "drop audio · analyze · render",
  "home.recent.head": "recent generations",
  "home.recent.count": "{n} in the gallery",
  "home.recent.offlineTitle": "the gallery isn't answering",
  "home.recent.offlineLine":
    "the recents read the local generation store — nothing shown that the engine did not render. start it, then retry.",
  "home.recent.retry": "retry the gallery",
  "home.recent.emptyTitle": "no generations yet",
  "home.recent.emptyLine":
    "the gallery answers and the queue is open — the first render the studio finishes lands here, with its bpm and key.",
  "home.recent.openStudio": "open the studio",
  "home.links.head": "quick links",
  "home.links.presentationTitle": "the presentation",
  "home.links.presentationLine":
    "what cadria is — the studio that listens, with the real engine running live on the page.",
  "home.links.firstRunTitle": "first run",
  "home.links.firstRunLine": "four frames — welcome, hear, see, enter — with your own audio or a built-in fixture.",
  // the onboarding (the four first-run frames)
  "onboarding.cardAria": "cadria first run",
  "onboarding.title": "first run",
  "onboarding.skip": "skip ahead",
  "onboarding.step.welcome": "welcome",
  "onboarding.step.hear": "hear",
  "onboarding.step.see": "see",
  "onboarding.step.enter": "enter",
  "onboarding.stepEyebrow": "{n} — {step}",
  "onboarding.progress": "step {n} / {total} · {step}",
  "onboarding.back": "back",
  "onboarding.continue": "continue",
  "onboarding.enterCta": "enter cadria",
  "onboarding.welcome.lead": "one window, video and image",
  "onboarding.welcome.lede":
    "cadria is the video and image home of the wenathlan family — the studio listens to audio and renders the artwork it implies, the player shows the frames, the gallery keeps them. not an operating system: one honest application window.",
  "onboarding.hear.lead": "give it something to hear",
  "onboarding.hear.lede":
    "pick an audio file or record a slice — the genuine wave-1 chain reads it right here: spectrum, rhythm, tonality, timbre, structure. nothing is uploaded, nothing is stored.",
  "onboarding.hear.pick": "pick audio",
  "onboarding.hear.record": "record a slice",
  "onboarding.hear.stop": "stop recording",
  "onboarding.hear.listening": "listening…",
  "onboarding.hear.noSlice": "no slice yet — pick or record.",
  "onboarding.hear.read": "read {name} — the chain heard it.",
  "onboarding.hear.recording": "recording — play or speak, then stop.",
  "onboarding.hear.recordingName": "the recording",
  "onboarding.hear.noMic": "this browser offers no microphone access — pick a file instead.",
  "onboarding.hear.micRefused": "the microphone is off limits — pick a file instead.",
  "onboarding.hear.refused": "the chain refused this slice — try a longer clip.",
  "onboarding.see.lead": "the picture of what it heard",
  "onboarding.see.lede":
    "the genuine wave-2 render layer draws the frame the descriptor describes — palette from key, composition from sections, texture from timbre, motion from bpm. same audio, same image, always.",
  "onboarding.see.sourceAria": "what the frame renders from",
  "onboarding.see.yours": "your audio",
  "onboarding.see.frameAria": "rendered artwork from {source}",
  "onboarding.see.frameEmptyAria": "the rendered frame lands here",
  "onboarding.see.frameEmpty": "the frame lands here",
  "onboarding.see.reading": "reading · rendering…",
  "onboarding.see.idle": "pick what the frame renders from.",
  "onboarding.see.signature": "{digest} · sig {signature}",
  "onboarding.see.nothingHeard": "nothing heard yet — give the hear frame a slice first.",
  "onboarding.see.noFixture": "no such fixture: {id}",
  "onboarding.see.refused": "this clip could not be processed.",
  "onboarding.enter.lead": "ready to enter",
  "onboarding.enter.lede":
    "the home is the desk: generate in the studio, play the renders in the player, keep them in the gallery. everything runs client-side and session-only — nothing is written to this machine.",
  // the player (the artwork viewer)
  "player.eyebrow": "cadria · player",
  "player.title": "the artwork viewer",
  "player.loadVideo": "load video",
  "player.back": "back to gallery",
  "player.readingSr": "reading the source…",
  "player.retry": "retry",
  "player.offlineError": "the gallery is offline — the stored frame can't be fetched.",
  "player.refusedError": "the gallery refused this render.",
  "player.demoRefused": "this clip could not be processed.",
  "player.decoderRefused": "the decoder refused “{name}” — {detail}",
  "player.noFrame": "no frame",
  "player.frameAriaNone": "no frame loaded",
  "player.frameAriaGateway": "stored render {id} from the gallery",
  "player.frameAriaVideo": "local video {name}",
  "player.frameAriaDemo": "deterministic artwork rendered in-session from the {fixture} fixture",
  "player.frameTag.gateway": "gallery frame",
  "player.frameTag.video": "local video · tick-quantized",
  "player.frameTag.demo": "in-session demo · deterministic",
  "player.transportAria": "viewer transport",
  "player.prevFrame": "previous frame",
  "player.prevArt": "previous artwork",
  "player.nextFrame": "next frame",
  "player.nextArt": "next artwork",
  "player.pauseLoop": "pause the motion loop",
  "player.playLoop": "play the motion loop",
  "player.pauseVideo": "pause the video",
  "player.playVideo": "play the video",
  "player.readingMedia": "reading media…",
  "player.beat": "{ms} ms / beat",
  "player.gatewayCount": "{n} in the gallery list",
  "player.staticNote": "static — the gallery serves the frame, not the project file",
  "player.rail.analysis": "analysis",
  "player.rail.digest": "digest",
  "player.rail.state": "state",
  "player.rail.statePlaying": "playing",
  "player.rail.statePaused": "paused",
  "player.rail.stateStatic": "static frame",
  "player.rail.stateLoading": "loading",
  "player.rail.engine": "playback",
  "player.rail.source": "source",
  "player.rail.rate": "rate",
  "player.rail.frames": "frames",
  "player.rail.duration": "duration",
  "player.rail.position": "position",
  "player.rail.bpm": "bpm",
  "player.rail.key": "key",
  "player.rail.shape": "shape",
  "player.rail.seed": "seed",
  "player.rail.loop": "loop",
  "player.rail.style": "style",
  "player.engine.videodecode": "local video",
  "player.engine.demo": "in-session demo",
  "player.engine.gateway": "gallery render",
  "player.engine.rateFps": "{rate} fps",
  "player.engine.loopLine": "{n} keyframes · {ms} ms / beat",
  "player.engine.durationMs": "{n} ms",
  "player.engine.durationS": "{n} s",
  "player.engine.shapeUnserved": "— not served",
  // the studio anchor (the generation studio page)
  "studio.eyebrow": "cadria · studio",
  "studio.title": "generation studio",
  "studio.lede":
    "audio in, artwork out — the real chain, live: analyze the source, let the fused descriptor pick a style, generate the deterministic frame and breathe it on the beat. exports ship the svg master; saves ride the gallery when it answers, the session memory when it doesn't.",
  "studio.stage": "stage",
  "studio.stageAria": "generation stage",
  "studio.stageCaption": "deterministic artwork rendered from {source} · style {style} · seed {seed}",
  "studio.stageCaptionEmpty": "the rendered frame lands here",
  "studio.stageSourceFallback": "the source",
  "studio.analyzeIdle": "idle — drop an audio file or pick a built-in fixture; the chain answers in under a second.",
  "studio.analyzeReading": "reading {name} · spectrum · rhythm · tonality · timbre · structure…",
  "studio.analyzeReadingGeneric": "reading the source…",
  "studio.analyzeRefused": "the analysis refused this source.",
  "studio.analyzed": "analyzed — the descriptor is fused; tune the controls and generate.",
  "studio.errorTooShort": "the slice is shorter than one second — generation needs at least 1 s of audio.",
  "studio.errorEmpty": "the source carries no readable samples.",
  "studio.errorRate": "the source's sample rate is not usable — try re-exporting the file.",
  "studio.fixtureError": "the fixture could not be built.",
  "studio.sourceError": "the source could not be read.",
  "studio.genStatus": "folding style · palette · blocks · texture · motion…",
  "studio.genReady": "rendered · sig {signature} · {id} · deterministic",
  "studio.projectRefused": "the project layer refused the fold ({code}): {message}",
  "studio.generateRefused": "the generation refused this descriptor.",
  // the studio source rail (the left pane)
  "studio.source.paneAria": "audio source",
  "studio.source.head": "source",
  "studio.source.drop": "drop audio here — or press to browse",
  "studio.source.formats": "wav decodes natively · mp3/ogg/flac/m4a supported",
  "studio.source.fixturesAria": "built-in synthetic fixtures",
  "studio.source.metaName": "name",
  "studio.source.metaPath": "path",
  "studio.source.metaRate": "rate",
  "studio.source.metaChannels": "channels",
  "studio.source.metaLength": "length",
  "studio.source.metaBytes": "bytes",
  // the studio stage art (the artwork well)
  "studio.stage.empty": "the frame lands here — analyze a source, then generate",
  // the studio readout (the analyze report)
  "studio.readout.paneAria": "analysis readout",
  "studio.readout.spectrum": "spectrum",
  "studio.readout.rhythm": "rhythm",
  "studio.readout.harmonic": "harmonic",
  "studio.readout.timbre": "timbre",
  "studio.readout.structure": "structure",
  "studio.readout.centroid": "centroid",
  "studio.readout.rolloff": "rolloff",
  "studio.readout.flatness": "flatness",
  "studio.readout.brightness": "brightness",
  "studio.readout.bpm": "bpm",
  "studio.readout.pulseTrust": "pulse trust",
  "studio.readout.onsets": "onsets/s",
  "studio.readout.groove": "groove",
  "studio.readout.swing": "swing",
  "studio.readout.key": "key",
  "studio.readout.strength": "strength",
  "studio.readout.changeRate": "change rate",
  "studio.readout.dissonance": "dissonance",
  "studio.readout.noisiness": "noisiness",
  "studio.readout.warmth": "warmth",
  "studio.readout.range": "range",
  "studio.readout.crest": "crest",
  "studio.readout.length": "length",
  "studio.readout.sections": "sections",
  "studio.readout.peak": "peak",
  "studio.readout.repetition": "repetition",
  "studio.readout.shape": "shape",
  "studio.readout.swung": "swung",
  "studio.readout.straight": "straight",
  "studio.readout.timings": "decode {decode} ms · analysis {analysis} ms · schema v{version} · deterministic",
  // the studio controls (the right pane)
  "studio.controls.paneAria": "generation controls",
  "studio.controls.head": "controls",
  "studio.controls.style": "style",
  "studio.controls.canvasSize": "canvas size",
  "studio.controls.fingerprint": "fingerprint {value} · symmetry {bias}",
  "studio.controls.seed": "seed",
  "studio.controls.reseedAria": "reseed — fold a fresh nonce into the seed",
  "studio.controls.reseedTip": "reseed",
  "studio.controls.generate": "generate frame",
  "studio.controls.ready": "the descriptor is ready — generate renders the deterministic frame.",
  "studio.controls.armFirst": "analyze a source to arm the controls.",
  // the studio export row (the export + gallery handoff)
  "studio.export.paneAria": "export and gallery handoff",
  "studio.export.head": "export",
  "studio.export.svg": "svg",
  "studio.export.png": "png",
  "studio.export.copyDigest": "copy digest",
  "studio.export.saveGallery": "save to gallery",
  "studio.export.localBadge": "local session",
  "studio.export.unknownError": "unknown error",
  "studio.export.downloadedSvg": "downloaded {name}",
  "studio.export.svgFailed": "svg download failed: {message}",
  "studio.export.pngTipReady": "png {w}×{h}",
  "studio.export.pngTipUnsupported": "png export is available in modern browsers",
  "studio.export.pngFallback": "the svg master always ships; png exports when the browser supports it.",
  "studio.export.downloadedPng": "downloaded {name} ({w}×{h})",
  "studio.export.pngFailed": "png export failed: {message}",
  "studio.export.digestCopied": "digest copied to the clipboard",
  "studio.export.clipboardRefused": "the clipboard refused the write — select the digest line instead.",
  "studio.export.savedGateway": "saved to the gallery as {id}",
  "studio.export.savedLocal": "gallery unreachable — the project is kept as a local session record.",
  "studio.export.saveFailed": "the gallery save failed ({message}) — kept as a local session record.",
  "studio.export.unlock": "generate a frame to unlock the export row.",
  "studio.export.defaultNote": "the svg master always ships; png exports when the browser supports it.",
  "studio.export.sessionSaves": "session saves ({n})",
  "studio.export.sessionLine": "{id} · {style} · bpm {bpm}",
  "studio.export.modeGateway": "gallery",
  "studio.export.modeLocal": "local",
  "studio.export.dualMode": "dual mode: sessions stay in memory — nothing is written to storage.",
  // the studio visualize panel (image to mesh)
  "studio.visualize.paneAria": "visualize: image to mesh",
  "studio.visualize.head": "visualize",
  "studio.visualize.lede":
    "image to 3d mesh, decoded and triangulated client-side — heightmap from luminance, step decimation and blur on the controls. downloads run through the root",
  "studio.visualize.ledeCode": "visualize",
  "studio.visualize.ledeTail": "library.",
  "studio.visualize.image": "image",
  "studio.visualize.depth": "depth",
  "studio.visualize.step": "step",
  "studio.visualize.blur": "blur",
  "studio.visualize.vertices": "{n} vertices",
  "studio.visualize.triangles": "{n} triangles",
  "studio.visualize.grid": "{cols}×{rows} grid",
  "studio.visualize.statusIdle": "pick an image; the mesh builds client-side — nothing leaves the page.",
  "studio.visualize.statusWorking": "decoding the image and triangulating the mesh…",
  "studio.visualize.statusReady": "mesh ready — the downloads carry the same triangulation.",
  "studio.visualize.failed": "visualize failed — unexpected error",
  "studio.visualize.decodeFailed": "could not decode this image — try a png or jpg",
  "studio.visualize.objTip": "wavefront obj — the triangulated mesh with vertex colors",
  "studio.visualize.stlTip": "binary stl — the same mesh for the slicers",
  "studio.visualize.obj": "download .obj",
  "studio.visualize.stl": "download .stl",
  // the gallery (the render wall)
  "gallery.eyebrow": "cadria · gallery",
  "gallery.title": "the render wall",
  "gallery.lede":
    "every frame the engine rendered, as the gallery reports it — no stand-ins, no cached pretend art.",
  "gallery.filterHead": "filter by style",
  "gallery.filterAria": "filter the wall by generation style",
  "gallery.filterAll": "all",
  "gallery.wallSr": "the wall",
  "gallery.readingSr": "reading the gallery…",
  "gallery.offlineTitle": "the gallery isn't answering",
  "gallery.offlineLine":
    "the wall reads the local generation store — until it answers, the wall stays honest and shows nothing it doesn't hold.",
  "gallery.retry": "retry the gallery",
  "gallery.emptyTitle": "the wall is bare",
  "gallery.emptyLine":
    "the gallery answers and holds nothing yet — the first render lands here the moment the studio finishes one.",
  "gallery.openStudio": "open the studio",
  "gallery.filteredTitle": "no renders in the {style} style",
  "gallery.filteredLine":
    "the chips only filter what the gallery really holds — switch style or clear the filter to see the full wall.",
  "gallery.showAll": "show every style",
  "gallery.thumbAria": "rendered frame {id}",
  "gallery.thumbPlaceholder": "frame {id} not fetched — placeholder glyph",
  "gallery.cardAria": "{style} render {id}",
  "gallery.open": "open",
  "gallery.delete": "delete",
  "gallery.deletedToast": "render deleted from the gallery",
  "gallery.offlineToast": "gallery offline — nothing deleted",
  "gallery.refusedToast": "the gallery refused the delete ({status})",
  // the settings (the platform preferences)
  "settings.eyebrow": "cadria · settings",
  "settings.title": "settings",
  "settings.lede":
    "site preferences only, all session scope — the interface never writes to the visitor machine. project assets and render keys belong to the studio.",
  "settings.appearance.head": "appearance",
  "settings.appearance.light": "light theme",
  "settings.appearance.lightHint":
    "sol dark is the default — the frame reads better in the darkroom. holds for the session.",
  "settings.appearance.lightAria": "toggle the light theme",
  "settings.appearance.motion": "reduce motion",
  "settings.appearance.motionHint":
    "the os setting is respected automatically; this override holds the js-driven beats too (the player loop, the onboarding demo) — session scope.",
  "settings.appearance.motionAria": "override the motion preference to reduced",
  "settings.gateway.head": "gallery",
  "settings.gateway.line":
    "the local render service the studio posts to and the gallery, home and player read from. the address lives in memory for this session only — reload resets it to the default.",
  "settings.gateway.urlLabel": "gallery address",
  "settings.gateway.save": "save for this session",
  "settings.gateway.check": "check health",
  "settings.gateway.savedToast": "gallery set to {url} — session only",
  "settings.gateway.status": "status: {health}",
  "settings.about.head": "about",
  "settings.about.version": "version",
  "settings.about.engine": "engine",
  "settings.about.engineValue": "deterministic analysis → render",
  "settings.about.storage": "storage",
  "settings.about.storageValue": "none — session only",
  "settings.about.license": "license",
  "settings.about.domain": "domain",
  "settings.onlineToast": "the gallery answers",
  "settings.offlineToast": "the gallery is not answering",
  // the editor (the timeline)
  "edit.eyebrow": "cadria · editor",
  "edit.title": "the timeline",
  "edit.lede":
    "clips, trims and the playhead on exact ticks — every edit folds through the studio's edit algebra, every number is frame-exact SMPTE. the material is the stock slate the surface ships; nothing is uploaded, nothing is stored.",
  "edit.workbenchAria": "the edit timeline",
  "edit.toolbarAria": "edit transport and tools",
  "edit.play": "play",
  "edit.playTip": "play (space)",
  "edit.pause": "pause",
  "edit.pauseTip": "pause (space)",
  "edit.toStart": "to start",
  "edit.toStartTip": "to the sequence start (home)",
  "edit.prevPoint": "previous edit point",
  "edit.prevPointTip": "previous edit point (shift+←)",
  "edit.nextPoint": "next edit point",
  "edit.nextPointTip": "next edit point (shift+→)",
  "edit.split": "split at the playhead",
  "edit.splitTip": "split at the playhead (s)",
  "edit.lift": "lift the selection",
  "edit.liftTip": "lift the selection — the gap stays (delete)",
  "edit.extract": "extract the selection",
  "edit.extractTip": "extract the selection — the gap closes (ripple)",
  "edit.duplicate": "duplicate the selection",
  "edit.duplicateTip": "duplicate the selection after itself",
  "edit.insert": "place mode: insert pushes the rest right",
  "edit.insertMark": "ins",
  "edit.overwrite": "place mode: overwrite covers the span",
  "edit.overwriteMark": "ovr",
  "edit.v1Target": "target track v1 — the picture track",
  "edit.v1Mark": "v1",
  "edit.a1Target": "target track a1 — the sound track",
  "edit.a1TargetTip": "target track a1 — the sound track (the same algebra, the same refusals)",
  "edit.a1Mark": "a1",
  "edit.snapAria": "snap the playhead to edit points",
  "edit.snapTip": "snap the playhead to the edit points",
  "edit.zoomOut": "zoom out",
  "edit.zoomIn": "zoom in",
  "edit.rate": "rate",
  "edit.rateFps": "{rate} fps",
  "edit.scrubAria": "the playhead — drag to scrub",
  "edit.laneV1": "v1",
  "edit.laneA1": "a1",
  "edit.lockLane": "lock track {lane}",
  "edit.unlockLane": "unlock track {lane}",
  "edit.lockTip": "lock the track — every edit refuses",
  "edit.unlockTip": "unlock the track",
  "edit.laneLocked": "track locked — every edit refuses until you unlock it.",
  "edit.laneUnlocked": "track unlocked.",
  "edit.v1Empty": "no picture yet — place a stock slate from the bin",
  "edit.a1Empty": "no sound yet — the sound track rides the same algebra",
  "edit.clipLabel": "slate · in {in}",
  "edit.readout.sequence": "sequence",
  "edit.readout.clips": "clips",
  "edit.readout.editPoints": "edit points",
  "edit.readout.clip": "clip",
  "edit.readout.in": "in",
  "edit.readout.out": "out",
  "edit.readout.src": "src",
  "edit.readout.noSelection": "no selection",
  "edit.noteEmpty": "the sequence is empty — click a stock slate to lay the first cut.",
  "edit.selectFirst": "select a clip first — the range ops ride the selection.",
  "edit.selectFirstDuplicate": "select a clip first — duplicate rides the selection.",
  "edit.lifted": "lifted — the gap stays.",
  "edit.extracted": "extracted — the gap closed (ripple).",
  "edit.splitNote": "split · right piece {id} · {timecode}",
  "edit.duplicated": "duplicated · {timecode}",
  "edit.slid": "slid {delta} s",
  "edit.trim": "trim {edge} {delta} s",
  "edit.placed": "{slate} → {lane} ({mode}) · src in {src} · at {at}",
  "edit.binAria": "the stock slate bin",
  "edit.binHead": "stock slate · 20 s master",
  "edit.slateTip": "{detail} — {mode} on track {lane} at the playhead",
  "edit.slateAria": "place {slate} — {detail} — {mode} on track {lane} at the playhead",
  "edit.keys":
    "keys — space play/pause · s split at the playhead · delete lift the selection · ←/→ step a frame · shift+←/→ walk the edit points · home start · end sequence end · drag the ruler to scrub · drag a clip body to slide · drag a clip edge to trim (limited by the master's handles) — the bin places on the targeted track (v1/a1)",
  // the not-found handover
  "notfound.eyebrow": "404 · empty frame",
  "notfound.title": "nothing lives here.",
  "notfound.line":
    "the url reached a frame the engine never rendered. the queue stays honest — this page carries no stand-in.",
  "notfound.home": "back home",
} as const;

export type LabelKey = keyof typeof labelManifest & string;

/** the translation overrides the runtime loads from the store at boot: the
 * key answers the translated text when the person changed the language. */
const overrides = new Map<string, string>();

/** the browser cache of the labels table: the rows mirror the site db (the
 * db is the source of truth; the cache carries the translated rows offline —
 * the onboardingstate.ts precedent for the visitor machine). */
const CACHE_KEY = "cadria.labels.rows";

function readCache(): BrowserLabel[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? (parsed.filter((row): row is BrowserLabel => !!row && typeof row === "object") as BrowserLabel[])
      : [];
  } catch {
    return [];
  }
}

function writeCache(rows: readonly BrowserLabel[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(rows));
  } catch {
    // the cache is best effort: the manifest always answers
  }
}

/** the typed accessor of the copy: the only door a widget uses. */
export function label(key: LabelKey): string {
  return overrides.get(key) ?? labelManifest[key];
}

/** the seed ingests the manifest into the labels store, idempotent, and the
 * translated rows stay protected from the overwrite. in the browser the rows
 * ride the local cache of the site db; on the server db.ts seeds the same
 * manifest into the labels table through seedLabelRows. */
export async function seedLabels(): Promise<{ seeded: number; protected: number }> {
  const stored = readCache();
  const rows = new Map<string, BrowserLabel>(stored.map((row) => [row.id, row]));
  let seeded = 0;
  let saved = 0;
  for (const [id, text] of Object.entries(labelManifest)) {
    const row = rows.get(id);
    overrides.set(id, row && row.translated ? row.text : text);
    if (!row || (!row.translated && row.text !== text)) {
      rows.set(id, {
        id,
        text,
        revision: LABEL_REVISION,
        updatedAt: new Date().toISOString(),
        ...(row?.translated ? { translated: true } : {}),
      });
      seeded += 1;
    }
    saved += 1;
  }
  writeCache([...rows.values()]);
  return { seeded, protected: saved - seeded };
}
