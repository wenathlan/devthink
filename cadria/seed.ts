// # seed — the in-memory content tables of this site: the offline answer of the static
// build and the first-run rows of the self-hosted sqlite database. Plain memory only —
// nothing here touches the visitor machine; the same rows ship in the site database and
// reach the pages over HTTPS when a catalog endpoint is configured.

import type {
  CreativeAnchor,
  FeatureCard,
  GalleryProject,
  OptionChoice,
  PlayerFormat,
  SignalBadge,
} from "./versawase";

export const seedPlayerFormats: readonly PlayerFormat[] = [
  {
    format: "MP4",
    media: ".mp4 · .m4v — file, share target",
    engine: "native",
    tone: "success",
    status: "shipped",
    extensions: [".mp4", ".m4v"],
  },
  {
    format: "HLS",
    media: ".m3u8 — live + VOD streams",
    engine: "hls.js",
    tone: "info",
    status: "shipped",
    extensions: [".m3u8"],
  },
  {
    format: "DASH",
    media: ".mpd — adaptive manifests",
    engine: "dash.js",
    tone: "info",
    status: "shipped",
    extensions: [".mpd"],
  },
  {
    format: "FLV",
    media: ".flv — legacy broadcast pulls",
    engine: "flv.js",
    tone: "info",
    status: "shipped",
    extensions: [".flv"],
  },
  {
    format: "WEBM / OGG",
    media: ".webm · .ogg — royalty-free pipelines",
    engine: "video.js · VHS",
    tone: "info",
    status: "shipped",
    extensions: [".webm", ".ogg"],
  },
  {
    format: "MP3 / audio",
    media: ".mp3 · .wav · .oga — playlists",
    engine: "howler",
    tone: "warning",
    status: "shipped",
    extensions: [".mp3", ".wav", ".oga"],
  },
  {
    format: "Documents",
    media: ".pdf · .docx · .xlsx · .md — side viewer",
    engine: "pdfjs · mammoth · marked · xlsx",
    tone: "warning",
    status: "shipped",
    extensions: [".pdf", ".docx", ".xlsx", ".md"],
  },
];

export const seedAnchors: readonly CreativeAnchor[] = [
  {
    id: "3dstudio",
    title: "3D Studio",
    detail:
      "Versawase viewport with orbit controls, scene graph and material previews. Import GLB, OBJ and FBX, light the scene, render stills and turntables.",
  },
  {
    id: "audio",
    title: "Audio DAW",
    detail:
      "Multitrack timeline with fades and stems on howler playback. Score voice-over against the video timeline and bounce stems back into the edit.",
  },
  {
    id: "canvaseditor",
    title: "Canvas Editor",
    detail:
      "Layer-based raster and vector canvas: masks, blends, smart guides and non-destructive adjustments — the Photoshop seat of cadria.",
  },
  {
    id: "code_ide",
    title: "Code IDE",
    detail:
      "Edit scripts, shaders and expression graphs beside the frame. The IDE writes straight into the versawase runtime — no export loop.",
  },
  {
    id: "themes",
    title: "Themes",
    detail:
      "Black/white system with a toggle in the topbar (F-CAD-024). Tokens load per anchor, so every canvas re-skins at runtime — no reload.",
  },
  {
    id: "icons16",
    title: "Icons",
    detail:
      "16 coordinated icon sets orchestrated by useicons (F-CAD-025): one stroke weight, six sizes, colors inherited from the active theme.",
  },
];

export const seedProjects: readonly GalleryProject[] = [
  {
    title: "Sunrise interview cut",
    detail: "Two-camera interview, color-matched in the canvas editor and cut to 96 seconds.",
    discipline: "video",
    format: "mp4",
    tone: "default",
    art: 1,
  },
  {
    title: "Kelp forest loop",
    detail: "Adaptive-stream loop for a shopfront display — three bitrates from one timeline.",
    discipline: "video",
    format: "hls",
    tone: "default",
    art: 2,
  },
  {
    title: "Poster: Volt City",
    detail: "Print-ready 2K poster composited over a 3D render, exported with bleed.",
    discipline: "image",
    format: "png",
    tone: "info",
    art: 3,
  },
  {
    title: "Ceramic study 04",
    detail: "Product still relit in studio and baked to a 40 KB WebP sprite.",
    discipline: "image",
    format: "webp",
    tone: "info",
    art: 4,
  },
  {
    title: "Mech hangar walk",
    detail: "First-pass walk cycle previewed in the 3D studio anchor, DRACO-compressed.",
    discipline: "3d",
    format: "glb",
    tone: "success",
    art: 5,
  },
  {
    title: "Low-poly harbor",
    detail: "Scout scene for the mech hangar — 14k triangles, flat-shaded, one directional light.",
    discipline: "3d",
    format: "obj",
    tone: "success",
    art: 6,
  },
];

export const seedSeatCards: readonly FeatureCard[] = [
  {
    group: "home-seats",
    title: "Multi-format player",
    detail:
      "MP4, HLS, DASH, FLV and WEBM plus audio and documents — hls.js, dash.js, flv.js, video.js and howler ship inside the manifest.",
  },
  {
    group: "home-seats",
    title: "Layer editor",
    detail:
      "Blend, mask and keyframe video, image and 3D on one timeline. Canvas-first, non-destructive, always reversible.",
  },
  {
    group: "home-seats",
    title: "Creative anchors",
    detail:
      "3D studio, audio DAW, canvas editor, code IDE, themes and 16 icon sets dock as anchors around the same shell.",
  },
  {
    group: "home-seats",
    title: "Export",
    detail:
      "Render stills or whole timelines to MP4, WEBM, PNG sequences and GLB — batchable, scriptable, unwatermarked.",
  },
];

export const seedHeroBadges: readonly SignalBadge[] = [
  { group: "hero", label: "versawase engine", tone: "default", dot: true },
  { group: "hero", label: "HLS · DASH", tone: "success" },
  { group: "hero", label: "24 formats", tone: "info" },
];

export const seedFilterChoices: readonly OptionChoice[] = [
  { group: "gallery-filter", value: "all", label: "All", selected: true },
  { group: "gallery-filter", value: "video", label: "Video" },
  { group: "gallery-filter", value: "image", label: "Image" },
  { group: "gallery-filter", value: "3d", label: "3D" },
];

export const seedAutoplayChoices: readonly OptionChoice[] = [
  { group: "autoplay", value: "ask", label: "Ask every time", selected: true },
  { group: "autoplay", value: "always", label: "Always autoplay" },
  { group: "autoplay", value: "never", label: "Never autoplay" },
];
