// # versa — the math core of the versawaze engine, housed at the cadria root
// beside mesh.ts and shaders.ts: the column-major mat4/vec3 algebra, the
// projection matrices (perspective and orthographic), the lookAt view
// matrix, the model-view-projection pipeline that carries a world-space
// vertex to screen pixels, the bone rigs (forward kinematics over a
// skeleton pose) and the movements (keyframed 3d paths interpolated
// linearly, eased or along cubic bezier curves). Everything is pure
// TypeScript over number arrays — zero DOM, zero GL, zero canvas — so the
// same calls run in node (the tests), inside a Saddle render lane (the
// edge law: the engine renders server/edge-side, never on the visitor
// GPU/CPU) and in any host that can add floats. The scalar easing solver
// is NOT duplicated here: easecurves.ts owns it and the movement sampler
// delegates to curveprogress/bezierprogress, the same single-source
// discipline designmotion.ts already follows. Conventions: column-major
// mat4 (m[col * 4 + row], the GLSL layout), y-up world space (the
// versawasegen contract), counter-clockwise front faces, radians
// everywhere. Errors of the pure math answer null by return type
// (easecurves house rule); the rig algebra throws the typed VersaError
// (the meshgen doctrine) because a broken skeleton is a programming
// error, not a data refusal. Exports: 6 types + 4 interfaces, 30
// functions, 1 error class — the honest count for this theme.

import { type EaseCurve, bezierprogress, curveprogress } from "./motion.ts";

/** one xyz triple, tuple form (the visualize.ts contract reused by name). */
export type Vec3 = [number, number, number];

/** one column-major 4x4 matrix: m[col * 4 + row], the GLSL layout. */
export type Mat4 = Float32Array;

/** one column-major 3x3 matrix: m[col * 3 + row]. */
export type Mat3 = Float32Array;

/** the typed error of the rig algebra (invalid skeletons and poses). */
export class VersaError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "VersaError";
  }
}

// ---------------------------------------------------------------------------
// vec3 algebra
// ---------------------------------------------------------------------------

/** component-wise sum of two vectors. */
export function vec3add(a: Vec3, b: Vec3): Vec3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

/** component-wise difference a - b. */
export function vec3sub(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

/** the scalar product of two vectors. */
export function vec3dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

/** the cross product a x b (right-handed). */
export function vec3cross(a: Vec3, b: Vec3): Vec3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

/** the euclidean length. */
export function vec3length(a: Vec3): number {
  return Math.hypot(a[0], a[1], a[2]);
}

/** the unit vector of a (null when the length is zero — no fake answer). */
export function vec3normalize(a: Vec3): Vec3 | null {
  const length = vec3length(a);
  if (length < 1e-12) return null;
  return [a[0] / length, a[1] / length, a[2] / length];
}

/** the linear blend a + (b - a) * t (t clamped is the caller's choice). */
export function vec3lerp(a: Vec3, b: Vec3, t: number): Vec3 {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

// ---------------------------------------------------------------------------
// mat4 construction
// ---------------------------------------------------------------------------

/** the identity matrix. */
export function mat4identity(): Mat4 {
  const m = new Float32Array(16);
  m[0] = 1;
  m[5] = 1;
  m[10] = 1;
  m[15] = 1;
  return m;
}

/** the translation matrix T(x, y, z). */
export function mat4translation(x: number, y: number, z: number): Mat4 {
  const m = mat4identity();
  m[12] = x;
  m[13] = y;
  m[14] = z;
  return m;
}

/** the scale matrix S(x, y, z). */
export function mat4scale(x: number, y: number, z: number): Mat4 {
  const m = mat4identity();
  m[0] = x;
  m[5] = y;
  m[10] = z;
  return m;
}

/** the rotation matrix around +x by radians (right-handed). */
export function mat4rotationx(radians: number): Mat4 {
  const c = Math.cos(radians);
  const s = Math.sin(radians);
  const m = mat4identity();
  m[5] = c;
  m[6] = s;
  m[9] = -s;
  m[10] = c;
  return m;
}

/** the rotation matrix around +y by radians (right-handed). */
export function mat4rotationy(radians: number): Mat4 {
  const c = Math.cos(radians);
  const s = Math.sin(radians);
  const m = mat4identity();
  m[0] = c;
  m[2] = -s;
  m[8] = s;
  m[10] = c;
  return m;
}

/** the rotation matrix around +z by radians (right-handed). */
export function mat4rotationz(radians: number): Mat4 {
  const c = Math.cos(radians);
  const s = Math.sin(radians);
  const m = mat4identity();
  m[0] = c;
  m[1] = s;
  m[4] = -s;
  m[5] = c;
  return m;
}

/** the euler orders mat4fromeuler speaks — the first letter applies leftmost. */
export type EulerOrder = "XYZ" | "YXZ" | "ZXY" | "ZYX";

/**
 * The euler rotation matrix: for order "XYZ" the product is RX * RY * RZ
 * (column vectors, so RZ touches the vector first — the aerospace
 * convention). Default order "YXZ" is the yaw-pitch-roll of the versawase
 * viewport orbit. Angles are radians around x, y, z in that tuple order.
 */
export function mat4fromeuler(euler: Vec3, order: EulerOrder = "YXZ"): Mat4 {
  const axes: Record<EulerOrder, readonly Mat4[]> = {
    XYZ: [mat4rotationx(euler[0]), mat4rotationy(euler[1]), mat4rotationz(euler[2])],
    YXZ: [mat4rotationy(euler[1]), mat4rotationx(euler[0]), mat4rotationz(euler[2])],
    ZXY: [mat4rotationz(euler[2]), mat4rotationx(euler[0]), mat4rotationy(euler[1])],
    ZYX: [mat4rotationz(euler[2]), mat4rotationy(euler[1]), mat4rotationx(euler[0])],
  };
  const [first, second, third] = axes[order];
  return mat4multiply(mat4multiply(first, second), third);
}

// ---------------------------------------------------------------------------
// mat4 algebra
// ---------------------------------------------------------------------------

/** the matrix product a * b (column vectors: b applies first). */
export function mat4multiply(a: Mat4, b: Mat4): Mat4 {
  const out = new Float32Array(16);
  for (let col = 0; col < 4; col += 1) {
    for (let row = 0; row < 4; row += 1) {
      let sum = 0;
      for (let k = 0; k < 4; k += 1) sum += a[k * 4 + row] * b[col * 4 + k];
      out[col * 4 + row] = sum;
    }
  }
  return out;
}

/** the transpose. */
export function mat4transpose(m: Mat4): Mat4 {
  const out = new Float32Array(16);
  for (let col = 0; col < 4; col += 1) for (let row = 0; row < 4; row += 1) out[row * 4 + col] = m[col * 4 + row];
  return out;
}

/** the general 4x4 inverse (cofactor expansion); null when singular. */
export function mat4invert(m: Mat4): Mat4 | null {
  const a00 = m[0];
  const a01 = m[1];
  const a02 = m[2];
  const a03 = m[3];
  const a10 = m[4];
  const a11 = m[5];
  const a12 = m[6];
  const a13 = m[7];
  const a20 = m[8];
  const a21 = m[9];
  const a22 = m[10];
  const a23 = m[11];
  const a30 = m[12];
  const a31 = m[13];
  const a32 = m[14];
  const a33 = m[15];
  const b00 = a00 * a11 - a01 * a10;
  const b01 = a00 * a12 - a02 * a10;
  const b02 = a00 * a13 - a03 * a10;
  const b03 = a01 * a12 - a02 * a11;
  const b04 = a01 * a13 - a03 * a11;
  const b05 = a02 * a13 - a03 * a12;
  const b06 = a20 * a31 - a21 * a30;
  const b07 = a20 * a32 - a22 * a30;
  const b08 = a20 * a33 - a23 * a30;
  const b09 = a21 * a32 - a22 * a31;
  const b10 = a21 * a33 - a23 * a31;
  const b11 = a22 * a33 - a23 * a32;
  let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
  if (!Number.isFinite(det) || Math.abs(det) < 1e-12) return null;
  det = 1 / det;
  const out = new Float32Array(16);
  out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
  out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
  out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
  out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
  out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
  out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
  out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
  out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
  out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
  out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
  out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
  out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
  out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
  out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
  out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
  out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
  return out;
}

/** transforms one point (w-divide included); null when w collapses to 0. */
export function mat4transformpoint(m: Mat4, p: Vec3): Vec3 | null {
  const x = p[0];
  const y = p[1];
  const z = p[2];
  const w = m[3] * x + m[7] * y + m[11] * z + m[15];
  if (Math.abs(w) < 1e-12) return null;
  return [
    (m[0] * x + m[4] * y + m[8] * z + m[12]) / w,
    (m[1] * x + m[5] * y + m[9] * z + m[13]) / w,
    (m[2] * x + m[6] * y + m[10] * z + m[14]) / w,
  ];
}

/** transforms one direction (translation dropped, no w-divide). */
export function mat4transformdir(m: Mat4, v: Vec3): Vec3 {
  return [
    m[0] * v[0] + m[4] * v[1] + m[8] * v[2],
    m[1] * v[0] + m[5] * v[1] + m[9] * v[2],
    m[2] * v[0] + m[6] * v[1] + m[10] * v[2],
  ];
}

/** the normal matrix — inverse-transpose of the upper-left 3x3 (the
 * shader-law matrix that keeps normals orthogonal under non-uniform
 * scale); null when the 3x3 is singular. */
export function mat3normalfrommat4(m: Mat4): Mat3 | null {
  const a00 = m[0];
  const a01 = m[1];
  const a02 = m[2];
  const a10 = m[4];
  const a11 = m[5];
  const a12 = m[6];
  const a20 = m[8];
  const a21 = m[9];
  const a22 = m[10];
  const det = a00 * (a11 * a22 - a12 * a21) - a01 * (a10 * a22 - a12 * a20) + a02 * (a10 * a21 - a11 * a20);
  if (!Number.isFinite(det) || Math.abs(det) < 1e-12) return null;
  const inv = 1 / det;
  // the inverse of the 3x3 (adjugate / det)...
  const i00 = (a11 * a22 - a12 * a21) * inv;
  const i01 = (a02 * a21 - a01 * a22) * inv;
  const i02 = (a01 * a12 - a02 * a11) * inv;
  const i10 = (a12 * a20 - a10 * a22) * inv;
  const i11 = (a00 * a22 - a02 * a20) * inv;
  const i12 = (a02 * a10 - a00 * a12) * inv;
  const i20 = (a10 * a21 - a11 * a20) * inv;
  const i21 = (a01 * a20 - a00 * a21) * inv;
  const i22 = (a00 * a11 - a01 * a10) * inv;
  // ...transposed into the column-major 3x3 answer.
  const out = new Float32Array(9);
  out[0] = i00;
  out[1] = i10;
  out[2] = i20;
  out[3] = i01;
  out[4] = i11;
  out[5] = i21;
  out[6] = i02;
  out[7] = i12;
  out[8] = i22;
  return out;
}

// ---------------------------------------------------------------------------
// the projection matrices and the view matrix
// ---------------------------------------------------------------------------

/**
 * The perspective projection: vertical fov in radians, the width/height
 * aspect, the positive near and far planes. Depth maps to [-1, 1] (the GL
 * clip convention every versawase GLSL stage assumes). Column-major:
 * m[10] = (far + near) / (near - far), m[11] = -1, m[14] = 2*far*near /
 * (near - far).
 */
export function mat4perspective(fovYRadians: number, aspect: number, near: number, far: number): Mat4 {
  if (!(fovYRadians > 0) || fovYRadians >= Math.PI) throw new VersaError(`versa: fov must sit in (0, pi), got ${fovYRadians}`);
  if (!(aspect > 0)) throw new VersaError(`versa: aspect must be > 0, got ${aspect}`);
  if (!(near > 0) || !(far > near)) throw new VersaError(`versa: need 0 < near < far, got ${near} / ${far}`);
  const f = 1 / Math.tan(fovYRadians / 2);
  const m = new Float32Array(16);
  m[0] = f / aspect;
  m[5] = f;
  m[10] = (far + near) / (near - far);
  m[11] = -1;
  m[14] = (2 * far * near) / (near - far);
  return m;
}

/** The orthographic projection over the given box; depth maps to [-1, 1]. */
export function mat4orthographic(left: number, right: number, bottom: number, top: number, near: number, far: number): Mat4 {
  if (left === right || bottom === top || near === far)
    throw new VersaError("versa: the orthographic box must be non-degenerate on every axis");
  const m = new Float32Array(16);
  m[0] = 2 / (right - left);
  m[5] = 2 / (top - bottom);
  m[10] = -2 / (far - near);
  m[12] = -(right + left) / (right - left);
  m[13] = -(top + bottom) / (top - bottom);
  m[14] = -(far + near) / (far - near);
  m[15] = 1;
  return m;
}

/**
 * The view matrix of a camera at `eye` looking at `center` with `up` as
 * the world-up hint: the camera looks down its own -z (the GL contract).
 * A degenerate basis (eye on the center axis, or a parallel up) throws
 * VersaError — no silent fallback normal.
 */
export function mat4lookat(eye: Vec3, center: Vec3, up: Vec3): Mat4 {
  const zAxis = vec3normalize(vec3sub(eye, center));
  if (!zAxis) throw new VersaError("versa: the lookAt center coincides with the eye — no view direction exists");
  const xAxis = vec3normalize(vec3cross(up, zAxis));
  if (!xAxis) throw new VersaError("versa: the lookAt up is parallel to the view direction — no side axis exists");
  const yAxis = vec3cross(zAxis, xAxis);
  const m = new Float32Array(16);
  m[0] = xAxis[0];
  m[1] = yAxis[0];
  m[2] = zAxis[0];
  m[4] = xAxis[1];
  m[5] = yAxis[1];
  m[6] = zAxis[1];
  m[8] = xAxis[2];
  m[9] = yAxis[2];
  m[10] = zAxis[2];
  m[12] = -vec3dot(xAxis, eye);
  m[13] = -vec3dot(yAxis, eye);
  m[14] = -vec3dot(zAxis, eye);
  m[15] = 1;
  return m;
}

// ---------------------------------------------------------------------------
// the model-view-projection pipeline
// ---------------------------------------------------------------------------

/** one viewport rectangle in pixels (origin top-left, y grows down). */
export interface ViewportRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** the whole vertex pipeline: model, view, projection and viewport. */
export interface RenderPipeline {
  /** the world-from-model transform (identity when the mesh is already world-space). */
  model: Mat4;
  /** the world-to-camera transform (mat4lookat). */
  view: Mat4;
  /** the projection (mat4perspective / mat4orthographic). */
  projection: Mat4;
  /** the pixel rectangle the ndc maps onto. */
  viewport: ViewportRect;
}

/** one projected vertex: screen pixels, clip depth and the honest flags. */
export interface ProjectedVertex {
  /** screen x in pixels (viewport-relative, left edge at viewport.x). */
  x: number;
  /** screen y in pixels (y grows down — the canvas convention). */
  y: number;
  /** the ndc depth in [-1, 1] (near -1, far +1, the GL convention). */
  depth: number;
  /** the clip-space w — negative means the vertex sits behind the camera. */
  w: number;
  /** true when the vertex survives the frustum: in front and inside ndc. */
  visible: boolean;
}

/** assembles one pipeline (model defaults to the identity). */
export function composepipeline(parts: { model?: Mat4; view: Mat4; projection: Mat4; viewport: ViewportRect }): RenderPipeline {
  if (!(parts.viewport.width > 0) || !(parts.viewport.height > 0))
    throw new VersaError("versa: the viewport must carry positive width and height");
  return {
    model: parts.model ?? mat4identity(),
    view: parts.view,
    projection: parts.projection,
    viewport: { ...parts.viewport },
  };
}

/** the mvp product P * V * M of one pipeline (the single transform the
 * GLSL mvp-standard vertex stage uploads). */
export function pipelineMvp(pipeline: RenderPipeline): Mat4 {
  return mat4multiply(pipeline.projection, mat4multiply(pipeline.view, pipeline.model));
}

/** carries one world-model point through the pipeline to screen pixels. */
export function projectpoint(pipeline: RenderPipeline, point: Vec3): ProjectedVertex {
  const mvp = pipelineMvp(pipeline);
  const x = point[0];
  const y = point[1];
  const z = point[2];
  const clipX = mvp[0] * x + mvp[4] * y + mvp[8] * z + mvp[12];
  const clipY = mvp[1] * x + mvp[5] * y + mvp[9] * z + mvp[13];
  const clipZ = mvp[2] * x + mvp[6] * y + mvp[10] * z + mvp[14];
  const clipW = mvp[3] * x + mvp[7] * y + mvp[11] * z + mvp[15];
  if (Math.abs(clipW) < 1e-12)
    throw new VersaError("versa: the point projects onto the w = 0 plane — no screen answer exists");
  const ndcX = clipX / clipW;
  const ndcY = clipY / clipW;
  const ndcZ = clipZ / clipW;
  const screenX = pipeline.viewport.x + (ndcX * 0.5 + 0.5) * pipeline.viewport.width;
  const screenY = pipeline.viewport.y + (1 - (ndcY * 0.5 + 0.5)) * pipeline.viewport.height;
  return {
    x: screenX,
    y: screenY,
    depth: ndcZ,
    w: clipW,
    visible: clipW > 0 && ndcX >= -1 && ndcX <= 1 && ndcY >= -1 && ndcY <= 1 && ndcZ >= -1 && ndcZ <= 1,
  };
}

// ---------------------------------------------------------------------------
// rigs — the bone skeletons and forward kinematics
// ---------------------------------------------------------------------------

/** one bone of a rig: a joint offset, a bind rotation and a length. The
 * bone's own space points its +y along the limb (the tip sits at
 * (0, length, 0)), so rotating a bone swings every child with it. */
export interface RigBone {
  /** unique id inside the rig (the pose keys speak it). */
  id: string;
  /** the parent bone id, or null for a root. */
  parent: string | null;
  /** bind-pose local translation from the parent joint. */
  translation: Vec3;
  /** bind-pose local euler rotation in radians (YXZ order). */
  rotation: Vec3;
  /** the bone length — the tip offset along the local +y. */
  length: number;
}

/** a skeleton: bones plus the name the catalog row speaks. */
export interface Rig {
  name: string;
  bones: readonly RigBone[];
}

/** one pose: optional translation/rotation overrides per bone id. */
export type RigPose = Record<string, { translation?: Vec3; rotation?: Vec3 }>;

/** the forward-kinematics answer of one bone. */
export interface RigBonePose {
  boneId: string;
  /** the world-space joint origin. */
  origin: Vec3;
  /** the world-space tip (origin + world-rotated (0, length, 0)). */
  tip: Vec3;
  /** the world matrix of the bone (model-space of anything skinned to it). */
  world: Mat4;
}

/** validates a rig honestly: unique ids, known parents, no cycles, sane lengths. */
export function validaterig(rig: Rig): void {
  if (!Array.isArray(rig.bones) || rig.bones.length === 0)
    throw new VersaError(`versa: the rig "${rig.name}" carries no bone`);
  const seen = new Set<string>();
  for (const bone of rig.bones) {
    if (!bone.id || seen.has(bone.id)) throw new VersaError(`versa: bone id "${bone.id}" is empty or duplicated`);
    if (!(bone.length >= 0)) throw new VersaError(`versa: bone "${bone.id}" carries a negative length`);
    seen.add(bone.id);
  }
  for (const bone of rig.bones) {
    if (bone.parent !== null && !seen.has(bone.parent))
      throw new VersaError(`versa: bone "${bone.id}" names the unknown parent "${String(bone.parent)}"`);
  }
  // cycle check: walk every parent chain with a visited stamp per walk.
  for (const bone of rig.bones) {
    const walk = new Set<string>([bone.id]);
    let cursor: RigBone | undefined = bone;
    while (cursor && cursor.parent !== null) {
      if (walk.has(cursor.parent))
        throw new VersaError(`versa: the parent chain of bone "${bone.id}" cycles at "${cursor.parent}"`);
      walk.add(cursor.parent);
      cursor = rig.bones.find((entry) => entry.id === cursor?.parent);
    }
  }
}

/** the local bind matrix of one bone: T * R (its euler, YXZ). */
function bonelocal(bone: RigBone, pose: RigPose): Mat4 {
  const override = pose[bone.id];
  const translation = override?.translation ?? bone.translation;
  const rotation = override?.rotation ?? bone.rotation;
  const local = mat4multiply(mat4translation(translation[0], translation[1], translation[2]), mat4fromeuler(rotation));
  return local;
}

/**
 * Forward kinematics: folds every bone's local bind (or pose override)
 * through its parent chain into world matrices, then reads the joint
 * origin and the tip of each. The answer lists bones in rig order, and a
 * broken rig throws VersaError before any matrix is read.
 */
export function rigpose(rig: Rig, pose: RigPose = {}): RigBonePose[] {
  validaterig(rig);
  for (const id of Object.keys(pose)) {
    if (!rig.bones.some((bone) => bone.id === id))
      throw new VersaError(`versa: the pose names the unknown bone "${id}"`);
  }
  const worlds = new Map<string, Mat4>();
  const answer: RigBonePose[] = [];
  for (const bone of rig.bones) {
    const local = bonelocal(bone, pose);
    const world = bone.parent === null ? local : mat4multiply(worlds.get(bone.parent) as Mat4, local);
    worlds.set(bone.id, world);
    const origin = mat4transformpoint(world, [0, 0, 0]) as Vec3;
    const tip = mat4transformpoint(world, [0, bone.length, 0]) as Vec3;
    answer.push({ boneId: bone.id, origin, tip, world });
  }
  return answer;
}

// ---------------------------------------------------------------------------
// movements — keyframed 3d paths with linear, eased and bezier spans
// ---------------------------------------------------------------------------

/** how one key interpolates toward the next. */
export type MovementMode = "linear" | "ease" | "bezier" | "hold";

/** one movement keyframe: a time in seconds, a world position and the mode
 * of the span that leaves it (the last key's mode is ignored). */
export interface MovementKey {
  time: number;
  position: Vec3;
  /** the interpolation of the span toward the next key (default linear). */
  mode?: MovementMode;
  /** the ease curve of an "ease" span (default the in-out preset). */
  ease?: EaseCurve;
  /** the first bezier handle (absolute world position; default: the linear
   * third toward the next key). */
  control1?: Vec3;
  /** the second bezier handle (absolute world position; default: the linear
   * third back from the next key). */
  control2?: Vec3;
}

/** audits a movement track: at least one key, strictly increasing times,
 * finite numbers, valid modes and handles. */
export function validatemovement(keys: readonly MovementKey[]): boolean {
  if (!Array.isArray(keys) || keys.length === 0) return false;
  let previous = Number.NEGATIVE_INFINITY;
  for (const key of keys) {
    if (!Number.isFinite(key.time) || key.time <= previous) return false;
    const p = key.position;
    if (!Array.isArray(p) || p.length !== 3 || p.some((axis) => !Number.isFinite(axis))) return false;
    if (key.mode !== undefined && !["linear", "ease", "bezier", "hold"].includes(key.mode)) return false;
    for (const handle of [key.control1, key.control2]) {
      if (handle !== undefined && (!Array.isArray(handle) || handle.length !== 3 || handle.some((a) => !Number.isFinite(a))))
        return false;
    }
    previous = key.time;
  }
  return true;
}

/** the time span of a track (0 for a single key; null when invalid). */
export function movementduration(keys: readonly MovementKey[]): number | null {
  if (!validatemovement(keys)) return null;
  if (keys.length === 1) return 0;
  return keys[keys.length - 1].time - keys[0].time;
}

/** one cubic bezier span in space: p0 at t=0, p3 at t=1, the handles p1/p2
 * in between, the time fraction as the curve parameter (the spatial
 * bezier of the motion editors). */
export function bezier3(p0: Vec3, p1: Vec3, p2: Vec3, p3: Vec3, t: number): Vec3 {
  const s = 1 - t;
  const a = s * s * s;
  const b = 3 * s * s * t;
  const c = 3 * s * t * t;
  const d = t * t * t;
  return [
    a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0],
    a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1],
    a * p0[2] + b * p1[2] + c * p2[2] + d * p3[2],
  ];
}

/**
 * Samples one movement track at a time in seconds: before the first key
 * the first position holds, after the last the last holds, and between
 * two keys the leaving key's mode rules — linear blends by the time
 * fraction, ease delegates the fraction to the easecurves solver
 * (single-sourced, never duplicated), bezier walks the cubic span (the
 * time fraction is the parameter) and hold freezes the position until the
 * next key. Invalid tracks answer null — no fake path.
 */
export function samplemovement(keys: readonly MovementKey[], seconds: number): Vec3 | null {
  if (!validatemovement(keys)) return null;
  const first = keys[0];
  if (seconds <= first.time) return [...first.position];
  const last = keys[keys.length - 1];
  if (seconds >= last.time) return [...last.position];
  for (let at = 0; at < keys.length - 1; at += 1) {
    const from = keys[at];
    const to = keys[at + 1];
    if (seconds < from.time || seconds >= to.time) continue;
    const span = to.time - from.time;
    const t = span > 0 ? (seconds - from.time) / span : 1;
    const mode = from.mode ?? "linear";
    if (mode === "hold") return [...from.position];
    if (mode === "linear") return vec3lerp(from.position, to.position, t);
    if (mode === "ease") {
      const eased = curveprogress(from.ease ?? { outInfluence: 100 / 3, outSpeed: 0, inInfluence: 100 / 3, inSpeed: 0 }, t);
      if (eased === null) return null;
      return vec3lerp(from.position, to.position, eased);
    }
    const p0 = from.position;
    const p3 = to.position;
    const p1 = from.control1 ?? vec3lerp(p0, p3, 1 / 3);
    const p2 = from.control2 ?? vec3lerp(p3, p0, 1 / 3);
    return bezier3(p0, p1, p2, p3, t);
  }
  return [...last.position];
}

/**
 * The arc-length table of a track: `steps` samples of the path with the
 * honest segment lengths (straight chords — the table says chord length,
 * never a claimed exact arc). The visual AI seat and the editor snap
 * along this table; invalid tracks answer null.
 */
export function movementarclength(keys: readonly MovementKey[], steps = 64): number[] | null {
  if (!validatemovement(keys)) return null;
  const count = Math.max(2, Math.round(steps));
  const duration = movementduration(keys) ?? 0;
  const start = keys[0].time;
  const lengths: number[] = [0];
  let previous = keys[0].position;
  let total = 0;
  for (let step = 1; step < count; step += 1) {
    const t = start + (duration * step) / (count - 1);
    const point = samplemovement(keys, t);
    if (!point) return null;
    total += vec3length(vec3sub(point, previous));
    lengths.push(total);
    previous = point;
  }
  return lengths;
}

/**
 * The honest bezier progress re-export for the hosts that only need the
 * scalar solver (the movement seat delegates to it — re-exported so the
 * callers never import easecurves twice for one feature).
 */
export { bezierprogress };
