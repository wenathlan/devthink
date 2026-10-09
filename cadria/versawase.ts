// # versawase — the image, video, animation and 3D engine of the family, housed at the cadria root.
// Library-grade module shipped inside the published packages (npm, maven with the Spring
// Boot rider): it owns the domain types and pure, generic helpers only — zero consumer
// data. The content tables of this site live in the db layer (seed.ts + db.ts) and reach
// the Sol pages through the catalog accessor over HTTPS; a page never hardcodes a row.
// The family renders through this engine: stealthhead (the fps platform) depends on the
// published @wenathlan/cadria library for every 3D, animation and render concern and
// carries only its storage and pre-compilation surface.

/** Badge tone used across the family cards and chips. */
export type BadgeTone = "default" | "success" | "error" | "warning" | "info";

/** One row of the player formats table. */
export interface PlayerFormat {
  format: string;
  media: string;
  engine: string;
  tone: BadgeTone;
  status: string;
  /** the handled extensions this format answers for */
  extensions: readonly string[];
}

/** One creative anchor docked around the studio shell. */
export interface CreativeAnchor {
  id: string;
  title: string;
  detail: string;
}

export type GalleryDiscipline = "video" | "image" | "3d";

/** One project card of the gallery. */
export interface GalleryProject {
  title: string;
  detail: string;
  discipline: GalleryDiscipline;
  format: string;
  tone: BadgeTone;
  /** index of the pure-css artwork header (1..6) */
  art: number;
}

/** A structured card rendered from the db layer (home seats). */
export interface FeatureCard {
  group: string;
  title: string;
  detail: string;
}

/** A small tone-coded chip (hero badges). */
export interface SignalBadge {
  group: string;
  label: string;
  tone: BadgeTone;
  dot?: boolean;
}

/** One option of the settings and filter selects. */
export interface OptionChoice {
  group: string;
  value: string;
  label: string;
  selected?: boolean;
}

/** Configuration of the player demo timeline (engine defaults, page overridable). */
export interface PlayerDemoConfig {
  durationSeconds: number;
  startSeconds: number;
  volumePercent: number;
}

/** Resolves the player demo configuration with engine defaults. */
export function playerDemo(config: Partial<PlayerDemoConfig> = {}): PlayerDemoConfig {
  return { durationSeconds: 161, startSeconds: 67, volumePercent: 80, ...config };
}

/** Resolves the css class suffix of a badge tone (empty for the default tone). */
export function toneClass(tone: BadgeTone): string {
  return tone === "default" ? "" : ` ${tone}`;
}

/** Formats a seconds count as a mm:ss timecode. */
export function formatTimecode(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = String(Math.floor(safe / 60)).padStart(2, "0");
  const seconds = String(safe % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

/** Finds the player format that answers for a file extension (".mp4" style). */
export function formatByExtension(
  formats: readonly PlayerFormat[],
  extension: string,
): PlayerFormat | undefined {
  const wanted = extension.toLowerCase();
  return formats.find((format) => format.extensions.some((item) => item.toLowerCase() === wanted));
}

/** Finds a creative anchor by its id. */
export function anchorById(anchors: readonly CreativeAnchor[], id: string): CreativeAnchor | undefined {
  return anchors.find((anchor) => anchor.id === id);
}

/** Filters the gallery projects by discipline ("all" keeps every row). */
export function projectsByDiscipline(
  projects: readonly GalleryProject[],
  discipline: GalleryDiscipline | "all",
): readonly GalleryProject[] {
  if (discipline === "all") return projects;
  return projects.filter((project) => project.discipline === discipline);
}

// ---------------------------------------------------------------------------
// 3D, animation and render surface — the Blender/After Effects/Remotion side of
// the engine. Library-grade: every consumer (cadria pages, stealthhead, external
// packages) brings its own data and configures the pipeline through these types.
// ---------------------------------------------------------------------------

/** A scene-graph node of a 3D world (mesh, light, camera or group). */
export interface SceneNode {
  id: string;
  kind: "mesh" | "light" | "camera" | "group";
  name: string;
  /** parent node id (empty for roots) */
  parent: string;
}

/** One animation channel over time: keys are seconds, values are normalized. */
export interface AnimationTrack {
  id: string;
  target: string;
  channel: "position" | "rotation" | "scale" | "opacity" | "morph";
  /** sorted key times in seconds */
  keys: readonly number[];
  /** parallel key values (same length as keys) */
  values: readonly number[];
  loop: boolean;
}

/** A renderable 3D scene with its animation set. */
export interface Scene3d {
  id: string;
  name: string;
  nodes: readonly SceneNode[];
  tracks: readonly AnimationTrack[];
  /** engine frame rate the tracks were authored against */
  fps: number;
}

/** A render job the pipeline schedules (image, video or 3D frame range). */
export interface RenderJob {
  id: string;
  kind: GalleryDiscipline;
  sceneId?: string;
  /** inclusive frame range for 3D jobs */
  frameFrom?: number;
  frameTo?: number;
  status: "queued" | "rendering" | "ready" | "failed";
  tone?: BadgeTone;
}

/** A precompiled shader program: shaders ship compiled so no visitor machine ever compiles. */
export interface PrecompiledShader {
  id: string;
  stage: "vertex" | "fragment" | "compute";
  /** compiled artifact reference inside the LFS/DB storage layer */
  artifact: string;
  sha256: string;
}

/** Linear interpolation of one animation track value at a given second. */
export function trackValueAt(track: AnimationTrack, seconds: number): number {
  const { keys, values } = track;
  if (keys.length === 0) return 0;
  if (seconds <= keys[0]) return values[0];
  const last = keys.length - 1;
  if (seconds >= keys[last]) return track.loop ? values[0] : values[last];
  for (let index = 0; index < last; index += 1) {
    if (seconds >= keys[index] && seconds <= keys[index + 1]) {
      const span = keys[index + 1] - keys[index] || 1;
      const ratio = (seconds - keys[index]) / span;
      return values[index] + (values[index + 1] - values[index]) * ratio;
    }
  }
  return values[last];
}

/** Total animation duration of a scene (the largest key across its tracks). */
export function sceneDuration(scene: Scene3d): number {
  return scene.tracks.reduce((max, track) => Math.max(max, track.keys.length ? track.keys[track.keys.length - 1] : 0), 0);
}

/** Frame count a 3D render job produces (fps-normalized, inclusive range). */
export function renderJobFrames(job: RenderJob, fps: number): number {
  if (job.kind !== "3d" || job.frameFrom === undefined || job.frameTo === undefined) return 1;
  const seconds = Math.max(0, job.frameTo - job.frameFrom);
  return Math.max(1, Math.ceil(seconds * (fps > 0 ? fps : 30)));
}

/** Verifies a precompiled shader manifest row: every stage keeps an artifact reference and a sha-256 hash. */
export function shaderManifestComplete(shaders: readonly PrecompiledShader[]): boolean {
  return (
    shaders.length > 0 &&
    shaders.every((shader) => shader.artifact.length > 0 && /^[0-9a-f]{64}$/.test(shader.sha256))
  );
}
