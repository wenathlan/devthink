# VersaWaze engine research — the real state, the target architecture, the honest limits

This document records the T4-F (PR17) audit of the Cadria engine (VersaWaze — the
video / 3D / shader / visual-AI studio of the family, the CapCut / After Effects
competitor) and the architecture the wave implemented on top of it. It is written
from the source, module by module, and separates three things the owner's law
demands never be mixed: what already existed and is real, what this wave added
and is real, and what the engine will never do (the honest limits).

## 1. What the audit found — the engine was already real, not rehearsal

The pre-PR17 engine carried a full, working pipeline. Nothing below is a mock:

- **visualizemesh.ts** — image to mesh, pure TypeScript over typed arrays: Rec. 709
  luminance heightmap, separable gaussian blur with edge clamping, grid
  triangulation with step decimation and a minimum-height hole threshold. Zero
  canvas, zero DOM, zero dependencies.
- **visualizenormals.ts / visualizematerial.ts / visualize.ts** — face and vertex
  normals (adjacent-face averaging with a documented fallback), vertex colors
  sampled at the grid, material summary, and the facade exporting STL ASCII and
  binary with the documented byte layout.
- **versawase3d.ts** — the interactive 3D viewport: a real three.js scene mount
  (BufferGeometry from the visualize buffers, y-mirror + winding reversal, orbit,
  reduced-motion on-demand rendering, typed refusal when no WebGL context). Pure
  conversion math is node-testable without a canvas.
- **shadercomp.ts** — the compositor fragment library: twelve named GLSL ES 3.00
  effect bodies from real film vocabulary (lap dissolve, raccord flash, halation,
  prism split, film grain, edge glitch...), compiled into byte-stable programs
  whose sha-256 feeds the PrecompiledShader manifest, plus the dissolve planner
  (straight cut, lap dissolve, fade through black) as pure opacity ramps.
- **versawaserender.ts** — the WebGL2 pass runtime: fullscreen-triangle draws,
  ping-pong framebuffers, a sha-keyed program cache with hit/miss stats, and a
  readPixels readback into the ImageData shape. Pure pieces are node-testable;
  every GL call sits behind one renderer class.
- **timelineedit.ts / timeticks.ts / timelineview.ts** — the edit algebra of a
  professional editor (overwrite, insert, lift, extract, split, edge trims with
  media handles, roll, slip, slide, rate stretch, sync-lock cascade) over exact
  integer ticks (a rate dividing every broadcast frame duration and audio sample
  clock), plus the pure view-model (tick↔pixel, snapping, ruler steps).
- **versawaseslices.ts / versawasescheduler.ts** — the render farm doctrine:
  frame-aligned ten-second slices with exact tick windows, frame-weighted
  progress, honest wall-clock estimates across workers, and the least-loaded
  slot planner with the pure status machine.
- **pixel.ts** and the synth chain — the raster engine (adjustments, tints,
  3x3 convolution, box blur, bilinear resize) and the audio→image synthesis
  chain riding the debonair descriptors through the family specifiers.

**What was genuinely missing for PR17:** the procedural mesh generator (geometry
born from mathematics, not from an image), a GLSL catalog with a syntax validator
(the library shipped bodies but nothing checked a source before it shipped), and
the whole-document composition payload (clips, tracks, effects, transitions) that
the family transports as structured JSON and the render lane consumes.

## 2. What this wave implemented — three modules, all pure, all tested

### 2.1 versawasegen.ts — the procedural mesh generator

Pure TypeScript functions answering the {positions, normals, uvs, indices} buffer
set, y-up, counter-clockwise from outside, zero dependencies:

- **generateSphere** — the UV sphere: (rings+1)×(segments+1) vertices, seam column
  duplicated for the uv wrap, analytic normals (the normalized position — exact),
  pole rows emitting only their non-degenerate triangles. 2·segments·(rings−1)
  triangles exactly.
- **generateTorus** — the tube over the ring: analytic surface normals
  (cos v·cos u, sin v, cos v·sin u), exact parametrization counts.
- **generateTerrain** — the noise heightfield: a deterministic integer-hash value
  noise with quintic (C2) fade, summed into fractal octaves (fbm), centered into
  ±amplitude, normals from the central differences of the field (exact for the
  sampled surface), every face wound +y. The seed is the only identity: same seed,
  same mountain, byte for byte.
- **generateExtrusion** — a planar profile swept along +z: side quads with smooth
  normals around the profile, flat caps with exact ±z normals (duplicated
  vertices — hard edges honestly split), and **ear-clipping triangulation**, so
  concave profiles (the L-shape test) triangulate correctly. Profiles are
  normalized to CCW; collinear rings, repeated points and self-intersecting
  rings are refused with typed errors.
- **the modifier stack the doctrine records** — twistMesh (rotation per unit of
  height, normals recomputed from the twisted faces because a twist shears the
  surface — rotating the old normals would be a lie), bellyMesh (sin-profile
  radial swell that returns to exact size at both band extremes), subdivideMesh
  (midpoint subdivision with an index-pair edge cache — no cracks, no duplicated
  midpoints — and a documented triangle cap that refuses the explosion).
- **validateMesh** — the honest audit: buffer alignment, index bounds, unit
  normals, finiteness, non-empty triangle set; typed issues with machine codes.
- **the noise floor is exported** — hashNoise2, valueNoise2, fbmNoise2 — because
  the terrain math is the engine's, not the page's.

Because the buffers are y-up, they mount into the existing 3D viewport without
the image-space mirror: `threeMeshArgs({ mesh: { vertices: mesh.positions,
indices: mesh.indices }, normals: mesh.normals })` answers the same vertex and
triangle counts the generator reports (verified over the sphere in this wave's
battery) — the generator and the viewport speak one buffer contract.

### 2.2 versawaseshaders.ts — the GLSL material catalog and the source gate

shadercomp owns the compositor effects; this module owns the 3D material lane:

- **vertex stages** — mvp-standard (position/normal/uv in, uModel,
  uViewProjection, uNormalMatrix, vNormal/vUv out) and mvp-flat (positions only).
- **fragment materials** — lambert (diffuse + documented ambient floor), toon
  (the diffuse quantized into bands), matcap (view-space normal mapped onto a
  sampler look), uvdebug, normaldebug, depthramp — all real ES 3.00 programs,
  paired with their vertex stage, compiled with sha-256 stamps per stage (the
  PrecompiledShader doctrine: a visitor machine never compiles a shader).
- **validateShaderSource** — the syntax gate: comment stripping with line numbers
  preserved, brace/paren/bracket balance with the offending line, the
  #version-first rule, the ES 3.00 invariants (gl_FragColor and
  attribute/varying refused), the main() entry point, declared-uniform
  extraction, required-uniform presence, and the rule that texture() needs a
  declared sampler. Typed issues, never throws.
- **the cross-checks** — validateCatalogShaders runs every catalog stage through
  the gate against its own declared uniforms; validateLibraryEffects folds every
  shadercomp effect program through the same gate with the pass uniforms
  required; the render pass vertex stage of versawaserender validates unchanged.

### 2.3 versawasecomposition.ts — the composition document

The structured payload a timeline project serializes to and the render lane
consumes:

- **the document** — tracks (video/audio/text), clips (timeline span, media
  window, playback rate, effect stack, optional transition on the leading cut),
  the frame the composition renders at, even dimensions (the transcode doctrine).
- **the gl-transitions name catalog** — the canonical public collection
  (CrossZoom, DoomScreenTransition, InvertedPageCurl, PolkaDotsCurtain,
  ZoomInCircles, ...) as the vocabulary of the cut; unknown names are refused.
- **the effect stack** — every clip effect is a shadercomp library id validated
  against the live SHADER_EFFECTS table with its honest amount range.
- **typed refusals, never throws** — overlap, duplicate ids, unknown track,
  unknown transition, transition longer than its clip, unknown effect, amount
  out of range, dishonest spans (empty, negative, zero speed).
- **the JSON lane is a real round trip** — serializeComposition answers a
  deterministic byte-stable payload (fixed key order — the format IS the order);
  parseComposition validates every rule again on the way in, so a payload that
  skips the rules is refused no matter who wrote it. compositionFingerprint
  answers the sha-256 the render lane dedupes by.
- **compositionSlicePlan** — the Saddle bridge: the composition duration cut
  into frame-aligned slices by the same sliced-render planner the farm rides,
  so preview and final share one grid.

## 3. The honest limits — the edge design, and why WebGL-on-the-client is not the render lane

The owner's law is explicit: the engine rasterizes by software on the server
over the standard transport, the GPU of the visitor is never used for the final
artifact, and the preview equals the final by parallel sliced rendering. The
edge design this wave documents and wires:

- **The render lane is Saddle/CPU, sliced.** A composition answers its slice
  plan (compositionSlicePlan → versawaseslices); slices ride the farm workers
  through the scheduler (versawasescheduler), rasterized in software at exact
  tick boundaries, assembled deterministically. Heavy jobs go to the edge, never
  to the visitor's machine.
- **Then why do WebGL modules exist?** versawase3d and versawaserender are
  *interactive preview surfaces*: the orbit viewport of the studio and the
  compositor pass preview. They mount honestly — a canvas without a context
  answers a typed refusal, never a fake frame — and they are never the final
  render. The doctrine's line is the artifact: nothing a visitor downloads was
  produced by the visitor's GPU.
- **Software rasterization is the target lane for generated frames.** The pixel
  engine (pixel.ts) already rasterizes in pure TypeScript; the mesh generator
  and the material catalog give the same lane its geometry and shading
  vocabulary. A CPU rasterizer over GeneratedMesh + the material lambert/toon
  math is the natural next rung (the validators and audits this wave shipped
  are its entrance gate).
- **AI visual is orchestration, not a GPU claim.** The corpus reference
  (ComfyUI) teaches the node-graph pipeline discipline — typed inputs, typed
  refusals, deterministic plans — which is exactly the composition/plan/slice
  shape above; it does not license client-side compute.

## 4. The corpus references and what each contributed

- **comfyui** — the modular node pipeline: every stage typed, total, and
  composable; the composition document and the render plans follow the same
  discipline (pure functions, typed outcomes, no hidden state).
- **blender** — the full-pipeline framing: modeling, animation, simulation,
  rendering, compositing as one scene graph; the Scene3d/SceneNode contract of
  versawase.ts plus the sampler (versawaseanimate) and the generator/modifiers
  this wave added are the Cadria-shaped answer to that architecture.
- **celestastudio** — the honest-backend lesson: the stage badge reports the
  real backend and never simulates one. Every mount in this engine follows it
  (typed refusal when the context is missing; typed refusals in every lane).

## 5. Where the code lives

- `versawasegen.ts` — the procedural mesh generator (sphere, torus, terrain,
  extrusion, twist/belly/subdivision, validateMesh, the noise floor).
- `versawaseshaders.ts` — the material catalog (2 vertex stages, 6 fragment
  materials), the source validator, the catalog and library cross-checks.
- `versawasecomposition.ts` — the composition document, the gl-transitions
  catalog, the JSON round trip, the fingerprint, the Saddle slice plan.
- `tests/versawasegen.test.ts`, `tests/versawaseshaders.test.ts`,
  `tests/versawasecomposition.test.ts` — the batteries pinning every promise
  above (counts from the parametrization, analytic normals, outward winding,
  seed determinism, ear-clipped concave caps, modifier validity, validator
  damage catching, round-trip byte stability, typed refusals, slice coverage).
- All three modules ride the package exports map and the files list, so the
  family imports them the library way (`@wenathlan/cadria/versawasegen`, ...)
  — the ownership law: Debonair imports Cadria for anything 3D/visual, never
  the other way, never a duplicate.
