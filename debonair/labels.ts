/**
 * labels.ts — the copy law of debonair: every interface string lives in the
 * label store, the wingets and page anchors read through this typed accessor,
 * and a hardcoded string inside a widget is a defect. the manifest below is
 * the english source of truth extracted from the real strings of the Sol
 * wingets and the page anchors; the seed ingests it into the labels store
 * (the site db through db.ts on the server, the browser rows cache in the
 * visitor machine) and the seed never overwrites a translated row.
 *
 * the browser never imports db.ts (better-sqlite3 cannot ride the static
 * bundle): the type comes across erased, the browser seed mirrors the rows
 * into the local cache the way onboardingstate.ts mirrors the seen flags.
 */

import type { LabelRow } from "./db.ts";

/** the label revision of the manifest: bump on every copy wave so the seed
 * refreshes the store rows of the changed strings. */
export const LABEL_REVISION = 1;

/** the english manifest: the page.widget.key path answers the surface text.
 * every entry is the verbatim string the wingets and page anchors rendered
 * before the copy wave — zero invented copy. data stays data: bpm values,
 * timecodes, instrument and genre names, channel ids and module identifiers
 * keep flowing from the engine tables; the prose around them rides here. */
export const LABEL_MANIFEST = {
  // the shared nav labels of the footer links (every page anchor)
  "nav.studio": "Studio",
  "nav.generate": "Generate",
  "nav.library": "Library",
  "nav.settings": "Settings",
  // the app boundary (App.tsx, the boot anchor)
  "app.boundary.body": "debonair could not render this page frame.",
  "app.boundary.reload": "reload the page",
  // the home page anchor (the landing) and the song card widget
  "home.cta": "Open studio",
  "home.brand": "debonair",
  "home.hero.title1": "Describe a track.",
  "home.hero.title2": "Hear it mastered.",
  "home.hero.ledeLead": "One line in, the ",
  "home.hero.ledeTail": " engine drafts, edits and masters the whole arrangement — ",
  "home.hero.ledeStrong": "suno × FL Studio",
  "home.hero.ledeTail2": ", on your own domain.",
  "home.hero.placeholder": "midnight house, warm sub bass, dusty keys — C minor, 124 BPM",
  "home.hero.inputAria": "Describe the track",
  "home.hero.create": "Create",
  "home.hero.hint": "enter opens the composer with your draft · {max} characters max",
  "home.hero.chipsAria": "Genre mood",
  "home.hero.chipTitle": "{min}–{max} bpm · {pattern} drums · {lufs} LUFS target",
  "home.rail.eyebrow": "from the library",
  "home.rail.title": "Fresh from the render queue",
  "home.rail.footLead": "The engine's real takes play right here — press a cover, the bar below carries it — or ",
  "home.rail.footLink": "open the console",
  "home.rail.footTail": " and ride the desk.",
  "home.flow.eyebrow": "the flow",
  "home.flow.title": "Prompt to master, one engine",
  "home.flow.describe": "Describe",
  "home.flow.describeBody": "One line is enough — a genre, a mood, a key.",
  "home.flow.arrange": "Arrange",
  "home.flow.arrangeBody": "The katexis engine drafts the full multitrack take.",
  "home.flow.master": "Master",
  "home.flow.masterBody": "Genre-aware mix, true-peak limiter, WAV out.",
  "home.engine.eyebrow": "what it does",
  "home.engine.title": "Four stages, one take",
  "home.spec.engine": "engine",
  "home.spec.render": "render",
  "home.spec.peak": "true peak",
  "home.spec.loudness": "loudness",
  "home.spec.targets": "platform targets",
  "home.spec.renderValue": "{khz} kHz WAV",
  "home.spec.peakValue": "{dbtp} dBTP",
  "home.spec.targetsValue": "{list} LUFS",
  "home.quad.create": "create",
  "home.quad.browse": "browse",
  "home.quad.engine": "engine",
  "home.quad.family": "family",
  "home.quad.engineLine1": "katexis · {khz} kHz WAV",
  "home.quad.engineLine2": "{standard} · {dbtp} dBTP",
  "home.songcard.playAria": "Play {name}",
  "home.songcard.playTitle": "Play {name} — {genre} · {duration}",
  // the shell player bar widget (the suno bar of the application window)
  "shell.playerbar.aria": "Player bar",
  "shell.playerbar.openTitle": "{name} — open in the studio",
  "shell.playerbar.seekAria": "Seek {name}",
  "shell.playerbar.pause": "Pause",
  "shell.playerbar.play": "Play",
  "shell.playerbar.pauseTitle": "Pause the take",
  "shell.playerbar.playTitle": "Play the take",
  "shell.playerbar.next": "Next take",
  // the studio page anchor and its wingets
  "studio.cta": "Generate a track",
  "studio.eyebrow": "debonair · studio",
  "studio.title": "Studio",
  "studio.ledeLead": "The console, live: the ",
  "studio.ledeTail":
    " engine schedules the take on the WebAudio clock — transport, playlist, channel rack and mixer all read and drive the same plan. Play it.",
  "studio.stage.eyebrow": "stage · {stage}",
  "studio.stage.aria": "Stage {stage}",
  "studio.prompt.seedLead": "seed ",
  "studio.prompt.takeLead": " · take ",
  "studio.prompt.hintLead": "New material? ",
  "studio.prompt.hintLink": "Compose a fresh prompt",
  "studio.prompt.hintTail": " and come back — same prompt and seed always rebuild this exact take.",
  "studio.lyrics.hintLead": "The lead sheet of the take — ",
  "studio.lyrics.hintTail": ", one chord a bar over {bars} bars.",
  "studio.style.genre": "genre",
  "studio.style.tempo": "tempo",
  "studio.style.key": "key",
  "studio.style.drums": "drums",
  "studio.style.loudness": "loudness law",
  "studio.style.render": "render",
  "studio.style.tempoValue": "{bpm} bpm · swing {swing}%",
  "studio.style.loudnessValue": "{lufs} LUFS · {dbtp} dBTP",
  "studio.style.renderValue": "{khz} kHz WAV",
  "studio.planProblems": "Plan problems: {list}",
  "studio.transport.aria": "Transport bar",
  "studio.transport.playAria": "Play",
  "studio.transport.play": "Play",
  "studio.transport.pause": "Pause",
  "studio.transport.stopAria": "Stop",
  "studio.transport.stop": "Stop",
  "studio.transport.loopAria": "Loop the take",
  "studio.transport.loop": "Loop",
  "studio.transport.position": "Position",
  "studio.transport.bar": "Bar",
  "studio.transport.bpm": "BPM",
  "studio.transport.key": "Key",
  "studio.transport.target": "Target",
  "studio.transport.targetValue": "{lufs} LUFS",
  "studio.scope.aria": "Master scope",
  "studio.rack.aria": "Channel rack",
  "studio.rack.title": "channel rack",
  "studio.rack.meta": "{pattern} · swing {swing}% · {bpm} bpm · beat {beat} s",
  "studio.rack.stepVel": "vel {vel}%",
  "studio.export.aria": "Export desk",
  "studio.export.title": "export",
  "studio.export.body": "The bounce rides the same graph the desk plays — the plan's faders, the glue and this take's seeded noise.",
  "studio.export.keyAria": "Export {label}",
  "studio.export.rendering": "rendering…",
  "studio.export.resetAria": "Reset the desk to the seeded take",
  "studio.export.reset": "reset desk",
  "studio.export.rollNote": "the roll owns the schedule this desk session — reset the desk to hear the seeded take again.",
  "studio.ledger.aria": "Take ledger",
  "studio.ledger.title": "Take ledger",
  "studio.ledger.bodyLead":
    " — {genre} · {key} · {bpm} bpm · {bars} bars · {clock} · {events} scheduled events ({drums} drums, {bass} bass, {keys} keys, {lead} lead) · seed ",
  "studio.ledger.bodyTail": " · target {lufs} LUFS / {dbtp} dBTP true peak. Chords: {chords}{more}. {verdict}",
  "studio.ledger.more": " …",
  "studio.ledger.valid": "Plan validated.",
  "studio.ledger.loopLead":
    "Same prompt and seed always rebuild this exact take. Edit the desk live — the faders, mutes and solos ride ",
  "studio.ledger.loopTail": " onto the audio buses while it plays. Loop is ",
  "studio.ledger.loopOn": "on — the take wraps at the top",
  "studio.ledger.loopOff": "off — the transport stops at the end",
  "studio.ledger.masterTail": ". Master fader {gain} dB.",
  "studio.ledger.newLead": "New material? ",
  "studio.ledger.composeLink": "Compose a take",
  "studio.ledger.browseMid": " or browse the shelf in the ",
  "studio.ledger.libraryLink": "library",
  "studio.ledger.newTail": ".",
  "studio.takes.count": "{count} take{s} on the shelf — the desk, the bar and the library all read the same render.",
  "studio.takes.field": "Take",
  "studio.mixer.aria": "Mixer",
  "studio.mixer.muteAria": "{id} mute",
  "studio.mixer.soloAria": "{id} solo",
  "studio.mixer.muteKey": "M",
  "studio.mixer.soloKey": "S",
  "studio.mixer.bus": "bus",
  "studio.notice.transportTake": "the transport refused this take",
  "studio.notice.transportStart": "the transport refused to start",
  "studio.notice.shelfRefused": "the shelf refused this arrangement — the desk keeps it for the session",
  "studio.notice.deskReset": "the desk reset — the seeded take answers again",
  "studio.notice.exported": "exported {files}",
  "studio.notice.exportRefused": "the export refused this take",
  // the fader, vu meter and spectrum wingets of the mixer desk
  "studio.fader.aria": "{name} fader",
  "studio.fader.valueText": "{value} decibels",
  "studio.vu.aria": "{name} level",
  "studio.spectrum.live": "Live spectrum of the master bus",
  "studio.spectrum.idle": "Spectrum idle — the transport is stopped",
  // the stage stepper widget (the stage bar of the studio content)
  "studio.stagebar.aria": "Studio stages",
  // the piano roll widget of the studio
  "studio.roll.aria": "Piano roll",
  "studio.roll.title": "piano roll",
  "studio.roll.meta": "bar {bar} of {bars} · click adds, click a note selects · arrows walk the step",
  "studio.roll.tabsAria": "Roll role",
  "studio.roll.refusedNote": "the roll refused this note",
  "studio.roll.refusedMove": "the roll refused this move",
  "studio.roll.refusedVelocity": "the roll refused this velocity",
  "studio.roll.refusedLength": "the roll refused this length",
  "studio.roll.selectTranspose": "select a note to transpose",
  "studio.roll.windowLeft": "the note leaves the C2..C6 window",
  "studio.roll.selectVelocity": "select a note to cycle the velocity",
  "studio.roll.prevBarAria": "Previous bar",
  "studio.roll.barKey": "Bar",
  "studio.roll.barAria": "Roll bar",
  "studio.roll.nextBarAria": "Next bar",
  "studio.roll.eraseAria": "Erase mode",
  "studio.roll.erase": "Erase",
  "studio.roll.stepBackAria": "Step back",
  "studio.roll.stepForwardAria": "Step forward",
  "studio.roll.rowUpAria": "Row up",
  "studio.roll.rowKey": "Row",
  "studio.roll.rowDownAria": "Row down",
  "studio.roll.shortenAria": "Shorten the note",
  "studio.roll.lenKey": "Len",
  "studio.roll.lengthenAria": "Lengthen the note",
  "studio.roll.velKey": "vel {vel}%",
  "studio.roll.velAria": "Cycle the velocity",
  "studio.roll.quantKey": "Quant",
  "studio.roll.quantAria": "Quantize the note to the grid",
  "studio.roll.deleteAria": "Delete the note",
  "studio.roll.cellNote": "{row} note at step {step}, vel {vel}%, {steps} step{s}",
  "studio.roll.cellEmpty": "{row} empty at step {step}",
  "studio.roll.foot": "{count} note{s} this bar · {total} in the take · {verdict}",
  "studio.roll.footValid": "roll validated",
  "studio.roll.footProblems": "roll problems: {count}",
  // the timeline (arrangement editor) widget of the studio
  "studio.timeline.aria": "Arrangement editor",
  "studio.timeline.title": "arrangement editor",
  "studio.timeline.meta": "{clock} · snap {snap} s · drag moves, edges trim, arrows walk · delete deletes, d duplicates",
  "studio.timeline.splitAria": "Split the selected clip at the playhead",
  "studio.timeline.split": "Split",
  "studio.timeline.dupAria": "Duplicate the selected clip",
  "studio.timeline.dup": "Duplicate",
  "studio.timeline.deleteAria": "Delete the selected clip",
  "studio.timeline.delete": "Delete",
  "studio.timeline.seekAria": "Seek the take",
  "studio.timeline.clipAria": "clip {label} on {role}, {start} long {length}",
  "studio.timeline.refusedEdit": "the arrangement refused this edit",
  "studio.timeline.refusedMove": "the arrangement refused this move",
  "studio.timeline.selectSplit": "select a clip to split",
  "studio.timeline.playheadOutside": "the playhead sits outside the clip — park it inside to split",
  "studio.timeline.selectDup": "select a clip to duplicate",
  "studio.timeline.noRoom": "no free slot after the clip — the duplicate needs room",
  "studio.timeline.selectDelete": "select a clip to delete",
  // the generate page anchor (the composer)
  "generate.cta": "Open studio",
  "generate.eyebrow": "debonair · generate",
  "generate.title": "Generate",
  "generate.ledeLead": "Text-to-music on the ",
  "generate.ledeTail":
    " engine: the prompt maps to a genre of the matrix, the seed locks the take, and the arrangement — key, chords, drum grid, clips, desk — is composed right here in your browser. Same prompt and seed always return the same take.",
  "generate.compose.title": "Compose a take",
  "generate.prompt.label": "Prompt",
  "generate.prompt.placeholder": "e.g. Late-night trap, C minor, 140 BPM, dark 808s and airy pads",
  "generate.prompt.hint": "One line is enough — genre, mood, key or a scene. {max} characters max. Working readout: ",
  "generate.prompt.readout": "{label} · {min}–{max} bpm · {pattern} drums · {scales} · {lufs} LUFS target",
  "generate.seed.label": "Seed",
  "generate.seed.placeholder": "debonair",
  "generate.seed.hint": "The deterministic lock — change it for a different take of the same prompt.",
  "generate.genre.legend": "Genre — the engine matrix, all {count}",
  "generate.genre.auto": "match from prompt",
  "generate.genre.chipTitle": "{min}–{max} bpm · {pattern} · {lufs} LUFS",
  "generate.compose.submit": "Compose with katexis",
  "generate.shelf.title": "session shelf — {count} take{s}",
  "generate.shelf.empty":
    "Nothing composed yet. Describe a track above — the arrangement plan (key, chords, drum grid, clips, desk) appears here with its seed and lands in the studio and the library.",
  "generate.shelf.ready": "ready",
  "generate.row.meta": "{key} · {bpm} bpm · {bars} bars ({total}) · {clock} · {events} events · seed {seed}",
  "generate.row.open": "Open in studio",
  "generate.explain.title": "What the engine just did",
  "generate.explain.lead": "The prompt scored every genre of ",
  "generate.explain.mid1": ", the seed fed the engine's mulberry rng, and ",
  "generate.explain.mid2": " wrote the chord timeline over the picked key. ",
  "generate.explain.mid3": " laid the drum grid with accents, swing and fills, ",
  "generate.explain.mid4": " placed the section clips and ",
  "generate.explain.mid5":
    " opened the desk. The studio schedules the same plan on the WebAudio clock — nothing was simulated, and nothing leaves this tab: the shelf rides the session storage only.",
  "generate.toast.needPrompt": "Describe the track first — even three words help",
  "generate.toast.composed": "{name} composed — {genre} · {bpm} bpm · {key}",
  // the ingest page anchor (the decomposition bench)
  "ingest.hero.title": "Ingest a real track.",
  "ingest.hero.ledeLead": "One file in: the ",
  "ingest.hero.ledeTail":
    " engine separates the stems, decomposes every second into vector parameters and stores the document — the pre-training data the composer mines.",
  "ingest.drop.aria": "Drop an audio file or browse",
  "ingest.drop.title": "drop audio here",
  "ingest.drop.sub": "mp3, wav, ogg, flac — the file never leaves the bench",
  "ingest.meter.aria": "Bench phases",
  "ingest.phase.waiting": "waiting",
  "ingest.phase.waitingDetail": "drop an audio file to decompose",
  "ingest.phase.decode": "decode",
  "ingest.phase.decodeDetail": "file → mono pcm",
  "ingest.phase.separate": "separate",
  "ingest.phase.separateDetail": "hpss → harmonic + percussive stems",
  "ingest.phase.analyze": "analyze",
  "ingest.phase.analyzeDetail": "rhythm, key, bands, loudness",
  "ingest.phase.segment": "segment",
  "ingest.phase.segmentDetail": "one vector frame per second",
  "ingest.phase.ready": "ready",
  "ingest.phase.readyDetail": "the document is complete",
  "ingest.phase.error": "failed",
  "ingest.phase.errorDetail": "the file did not survive the bench",
  "ingest.doc.eyebrow": "the document",
  "ingest.doc.meta": "· {clock} · {khz} kHz · schema {schema}",
  "ingest.card.rms": "rms",
  "ingest.card.peak": "peak",
  "ingest.card.onsets": "onsets",
  "ingest.card.frames": "frames",
  "ingest.card.hash": "pcm hash",
  "ingest.action.store": "store in the library db",
  "ingest.action.storing": "storing",
  "ingest.action.copy": "copy json",
  "ingest.action.download": "download json",
  "ingest.saved.db": "in the db",
  "ingest.saved.offline": "offline mirror",
  "ingest.json.truncated": "… {size} kB total — copy or download for the whole document",
  "ingest.shelf.eyebrow": "the reference shelf",
  "ingest.shelf.title": "Ingested documents",
  "ingest.shelf.empty": "The shelf is empty — ingest the first real track above.",
  "ingest.row.meta": "{clock} · {frames} frames · {roles} · {date}",
  "ingest.row.badgeDb": "db",
  "ingest.row.badgeMirror": "mirror",
  "ingest.row.dropAria": "Drop {name}",
  "ingest.toast.decomposed": "{seconds}s decomposed into {frames} vector frames",
  "ingest.toast.clipboard": "the clipboard refused the document",
  "ingest.toast.storeRefused": "the store refused the document",
  "ingest.toast.storedDb": "stored in the library db",
  "ingest.toast.storedOffline": "stored in the offline mirror",
  "ingest.toast.dropped": "record dropped",
  // the intro page anchor (the akash-floor splash)
  "intro.aria": "debonair is opening",
  "intro.name": "debonair",
  "intro.role": "the audio home of the family",
  "intro.skip": "click or press any key to skip",
  // the library page anchor (the shelf)
  "library.cta": "Generate a track",
  "library.eyebrow": "debonair · library",
  "library.title": "Library",
  "library.lede":
    "Every take this session composed, with the engine's own numbers — genre, bpm, key, duration and seed. Open one in the studio, or drop it from the shelf. Nothing uploads, nothing leaves the tab.",
  "library.search.label": "Search",
  "library.search.placeholder": "Filter by name, genre, key or seed…",
  "library.takes.aria": "Composed takes",
  "library.takes.head": "composed this session — {count}",
  "library.row.open": "Studio",
  "library.row.drop": "Drop",
  "library.row.meta": "{genre} · {bpm} bpm · {key} · {clock} · seed {seed}",
  "library.empty.match": "No takes match “{needle}”.",
  "library.empty.shelf": "The shelf is empty — compose a take in the composer.",
  "library.toast.dropped": "{name} left the shelf",
  "library.samples.aria": "Sample rows",
  "library.samples.head": "site samples — served content rows",
  "library.formats.title": "Formats",
  "library.formats.lead":
    "Takes carry the engine mastering spec — 48 kHz WAV with −1 dBTP true peak and per-platform loudness targets (Spotify −14 / Apple −16 / Beatport −9 LUFS). Stems and MIDI bounce per take ride the export wave of the ",
  "library.formats.tail": " roadmap; the arrangement itself is already open in the studio.",
  // the notfound page anchor (the 404 dead air)
  "notfound.eyebrow": "debonair · 404",
  "notfound.title": "Dead air",
  "notfound.lede": "This page never made it to tape. The fader was up, the mic was hot — and the URL bar stayed clean, by the way.",
  "notfound.backHome": "Back home",
  "notfound.openStudio": "Open the studio",
  // the settings page anchor (the preferences)
  "settings.eyebrow": "debonair · settings",
  "settings.title": "Settings",
  "settings.ledeLead": "Site preferences only. Product credentials and session audio never live here — they belong to ",
  "settings.ledeTail": " on your machine.",
  "settings.appearance.title": "Appearance",
  "settings.appearance.light": "Light theme",
  "settings.appearance.lightHint": "Solar dark is the default — the mixer reads better at night.",
  "settings.appearance.lightAria": "Toggle light theme",
  "settings.appearance.motion": "Reduce motion",
  "settings.appearance.motionHint":
    "Freezes the meters, the rack sweep and the entry choreography for this session — on top of the OS setting, never against it.",
  "settings.appearance.motionAria": "Toggle reduce motion",
  "settings.urls.title": "Clean URLs",
  "settings.urls.lead": "This site runs the ",
  "settings.urls.mid1": " module: hash routes, ",
  "settings.urls.mid2": ", duplicate slashes and campaign trackers (",
  "settings.urls.sep": ", ",
  "settings.urls.mid3": "…) are stripped from the address bar automatically — without reloading or polluting history.",
  "settings.urls.dirty": "Poll this URL with trackers",
  "settings.urls.clean": "Watch it clean itself",
  "settings.urls.empty": "—",
  "settings.region.title": "Region",
  "settings.region.language": "Language",
  "settings.save": "Save preferences",
  "settings.toast.motionOn": "Motion reduced for this session",
  "settings.toast.motionOff": "Motion restored for this session",
  "settings.toast.cleaned": "URL cleaned — no hash, no trackers",
  "settings.toast.saved": "Preferences saved locally",
  // the onboarding page anchor (the first-run frames)
  "onboarding.aria": "debonair first run",
  "onboarding.title": "welcome to debonair",
  "onboarding.skip": "skip ahead",
  "onboarding.step.eyebrow": "{no} — {step}",
  "onboarding.steps.app": "the app",
  "onboarding.steps.surfaces": "the surfaces",
  "onboarding.steps.enter": "enter",
  "onboarding.what.title": "one window, the audio home",
  "onboarding.what.body":
    "debonair is the audio home of the wenathlan family — not an operating system: one application window holding the text-to-music queue, the studio timeline and the library of the craft, all riding the katexis engine.",
  "onboarding.hosts.title": "what the window hosts",
  "onboarding.enter.title": "ready to enter",
  "onboarding.enter.body":
    "the window opens on the home page and every surface rides the same rail. the theme starts dark and stays in memory only — nothing is written to this machine.",
  "onboarding.back": "back",
  "onboarding.enterCta": "enter debonair",
  "onboarding.continue": "continue",
} as const;

export type LabelKey = keyof typeof LABEL_MANIFEST & string;

/** the translation overrides the runtime loads from the store at boot: the
 * key answers the translated text when the person changed the language. */
const overrides = new Map<string, string>();

/** the browser cache of the labels table: the rows mirror the site db (the
 * db is the source of truth; the cache carries the translated rows offline —
 * the onboardingstate.ts precedent for the visitor machine). */
const CACHE_KEY = "debonair.labels.rows";

function readCache(): LabelRow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? (parsed.filter((row): row is LabelRow => !!row && typeof row === "object") as LabelRow[])
      : [];
  } catch {
    return [];
  }
}

function writeCache(rows: readonly LabelRow[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(rows));
  } catch {
    // the cache is best effort: the manifest always answers
  }
}

/** the typed accessor of the copy: the only door a widget or page anchor uses. */
export function label(key: LabelKey): string {
  return overrides.get(key) ?? LABEL_MANIFEST[key];
}

/** the placeholder door: fills the {token} slots of one format key with the
 * runtime values (the store keeps the sentence, the widget passes the data). */
export function labelfill(key: LabelKey, values: Record<string, string>): string {
  return label(key).replace(/\{(\w+)\}/g, (match, token: string) => values[token] ?? match);
}

/** the seed ingests the manifest into the labels store, idempotent, and the
 * translated rows stay protected from the overwrite. in the browser the rows
 * ride the local cache of the site db; on the server db.ts seeds the same
 * manifest into the labels table through seedLabelRows. */
export async function seedLabels(): Promise<{ seeded: number; protected: number }> {
  const stored = readCache();
  const rows = new Map<string, LabelRow>(stored.map((row) => [row.id, row]));
  let seeded = 0;
  let saved = 0;
  for (const [id, text] of Object.entries(LABEL_MANIFEST)) {
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
