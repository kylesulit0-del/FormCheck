# Project Research Summary

**Project:** FormCheck — 3D Exercise Form Guide
**Domain:** Browser-based 3D humanoid animation viewer (static site, exercise visualization)
**Researched:** 2026-02-23
**Confidence:** MEDIUM-HIGH

## Executive Summary

FormCheck is a static single-page site that renders an interactive 3D humanoid figure performing exercise movements, accompanied by form instructions and coaching cues. The expert approach for this class of product is vanilla Three.js (r183) + Vite 6, with GLB assets sourced from Mixamo (free, royalty-free) and converted via Blender. The hardest decision — and the core technical bet — is whether to use pre-baked Mixamo GLB animations for v1, programmatic `QuaternionKeyframeTrack` animations authored in TypeScript, or a hybrid of both. Research recommends starting with Mixamo GLBs (fastest path to a working viewer) and scaffolding a programmatic keyframe system alongside, so exercises without Mixamo equivalents can be added without licensing any new assets.

The recommended stack uses no React: vanilla Three.js with TypeScript, Tailwind CSS v4, and a Zustand store for viewer state. The data-driven exercise registry pattern — one TypeScript file per exercise exporting an `ExerciseDefinition` object — is the architectural foundation that makes adding new exercises a one-file change. This pattern must be established in Phase 1 before any UI or animation work begins, because all other components consume it. The three-panel layout (exercise selector, 3D viewer, form guide) is already differentiated versus competitors, who either use HD video (MuscleWiki, Fitbod) or expensive proprietary 3D systems (Muscle and Motion, iMuscle 2) behind paywalls.

The primary risks are technical, not product: skeleton bone name mismatches between model sources silently break all animation work if discovered late; uncompressed GLBs can reach 25-100MB total for 5 exercises if a Draco compression step is not baked into the asset pipeline from day one; and WebGL context loss on iOS Safari (a documented Apple regression) will crash the viewer on iPhones without an explicit context restoration handler. All three risks are cheap to prevent and expensive to fix retroactively. They must be addressed in the first two phases, not deferred to polish.

---

## Key Findings

### Recommended Stack

Vanilla Three.js 0.183.x is the correct choice — it ships `AnimationMixer`, `OrbitControls`, `GLTFLoader`, and `QuaternionKeyframeTrack` as bundled addons, covering all animation playback, camera control, and model loading requirements without any additional packages. React Three Fiber is explicitly not recommended: it adds ~40KB and reconciler overhead for a single-page viewer with no component tree to manage. The official Three.js community uses Vite-based templates — Vite 6 with `@tailwindcss/vite` is the build stack.

Animation assets should come from Mixamo (free, commercial-use-approved FBX animations) converted to GLB via Blender. For exercises not covered by Mixamo, `QuaternionKeyframeTrack` in TypeScript with `lil-gui` for development-time tuning is the fallback. The hybrid approach (Mixamo for v1, programmatic for expansion) is the production recommendation.

**Core technologies:**
- **Three.js 0.183.x**: WebGL rendering, AnimationMixer, OrbitControls, GLTFLoader — the entire 3D pipeline in one package
- **Vite 6.x**: Dev server with HMR + static build output; outputs `dist/` ready for Netlify/Vercel with zero config
- **TypeScript 5.x**: Bone hierarchy mismatches caught at compile time; Three.js types bundled since r152, no separate install
- **Tailwind CSS 4.x**: CSS-first config (no config file), 5x faster builds, zero JS runtime overhead for dark-themed static layout
- **Zustand**: Minimal state store for viewer state (selected exercise, playback, camera); no React dependency required
- **Mixamo + Blender (external)**: One-time per-exercise asset pipeline: FBX download → Blender GLB export → `/public/models/`
- **lil-gui (devDependency only)**: Debug sliders for tuning bone quaternion values during programmatic animation authoring

### Expected Features

Research confirmed that every competitor in this space (MuscleWiki, Muscle and Motion, iMuscle 2, Fitbod) either uses video (no 3D advantage) or locks 3D behind a subscription. FormCheck's combination of free access + interactive 3D is genuinely differentiated. The free/no-account constraint is a competitive advantage and must not be undermined by adding auth or backend dependencies.

**Must have at launch (table stakes):**
- Looping 3D animation of each exercise — without this, there is no product
- Orbit controls (rotate + zoom) — users assume all 3D content is interactive
- Exercise selector panel — navigation between the 5 starter exercises
- Play / pause control — expected immediately upon seeing any animation
- Playback speed control (slow / normal / fast) — slow motion is how users study form; expected
- Camera angle presets (front / side / back) — how coaches and athletes analyze movement
- Step-by-step form instructions per exercise — every competitor provides written cues alongside visual
- Common mistakes section per exercise — distinguishes the product from a "pretty animation" toy
- Dark-themed single-page layout with all panels simultaneously visible

**Should have after validation (v1.x):**
- Primary / secondary muscle highlighting on the 3D model — Muscle and Motion and iMuscle 2 offer this; transforms the viewer into a learning tool
- Shareable deep-link URLs per exercise — no competitor does this; genuine market gap; enables organic sharing
- Frame-by-frame scrubbing / timeline slider — underserved; Three.js AnimationMixer supports it natively

**Defer to v2+:**
- Annotation overlays during animation (on-model cues) — high complexity, uncertain value at launch
- Body map navigation (clickable muscle diagram) — relevant when library exceeds ~30 exercises
- Exercise filtering by muscle group or equipment — not needed for a 5-10 exercise library
- Complex sport-specific movements — explicitly out of scope until animation pipeline is proven

**Anti-features to avoid entirely:**
- User accounts / saved progress — adds backend, auth, GDPR/CCPA burden; incompatible with static hosting
- AI real-time camera form analysis — requires server-side vision or heavy client ML; out of scope
- Video content alongside 3D — creates a two-track maintenance problem; commit fully to 3D

### Architecture Approach

The architecture is a pure client-side static site with three UI regions (exercise selector panel, 3D viewer canvas, form guide panel) communicating through a Zustand store. The central pattern is the **data-driven Exercise Registry**: every exercise is a TypeScript object (`ExerciseDefinition`) exporting `id`, `name`, `modelPath`, `animationClipName`, `formSteps[]`, `commonErrors[]`, and `cameraHints`. Components read from the registry by ID — no hardcoded exercise logic anywhere in UI code. Adding a new exercise is a one-file change in `exercises/`.

Build order is dictated by the dependency graph: types and registry first, store second, static layout third, basic 3D viewer fourth, animation pipeline fifth, playback controls sixth, exercise switching seventh, content and polish eighth.

**Major components:**
1. **ExerciseSelector** — renders exercise list from registry; writes selected ID to Zustand store
2. **ViewerCanvas / HumanoidScene** — owns AnimationMixer lifecycle; reads playback state from store; loads GLB via `useGLTF` with Suspense boundary; drives `useFrame` render loop
3. **ViewerControls** — play/pause, speed slider, camera preset buttons; reads/writes store only
4. **FormGuidePanel** — reads selected exercise from store, pulls `formSteps` and `commonErrors` from registry; no 3D knowledge
5. **Exercise Registry** (`exercises/index.ts`) — the shared data source; imported by all panels; zero side effects
6. **Zustand Store** — single source of truth for `selectedExercise`, `isPlaying`, `playbackSpeed`, `activeCamera`

GLB files live in `/public/models/` (not `/src/`) so Vite copies them to `dist/` verbatim without bundler processing. All 5 starter GLBs should be preloaded with `useGLTF.preload()` at app init so exercise switches feel instant.

### Critical Pitfalls

1. **Skeleton bone name mismatch** — If the humanoid model's bone names don't match the animation data (e.g., Ready Player Me has 67 bones, Mixamo animations expect 82), all animations fail silently or produce T-pose lock and inverted limbs. Prevention: lock to a single skeleton source before writing any animation code. Never mix skeleton sources without normalizing through Mixamo's auto-rigger. This is a Phase 1 decision — changing skeletons mid-project means rewriting all animation data.

2. **Memory leaks from undisposed GPU resources** — Every exercise switch that loads a new model without calling `geometry.dispose()`, `material.dispose()`, and `texture.dispose()` leaks VRAM. On iOS Safari, accumulated leaks trigger WebGL context loss (blank canvas). Monitor `renderer.info.memory.geometries` and `.textures` in development — they must stay flat across exercise switches. Build the dispose lifecycle from day one in the exercise switching implementation.

3. **Uncompressed GLB assets** — An unoptimized humanoid GLB can be 5-20MB. Five exercises = 25-100MB total without compression, unacceptable for a public website. Apply Draco compression via `gltf-transform` as a mandatory build step. Target under 500KB per exercise GLB. This must be part of the asset pipeline in Phase 1, not added later — retrofitting compression after models are integrated can break model-animation name relationships.

4. **Robotic linear keyframe interpolation** — Three.js `AnimationMixer` uses linear interpolation by default. Procedurally authored animations between static poses look mechanical and defeat the purpose of a form guide that users must find credible. Use `THREE.InterpolateSmooth` (cubic bezier) in all `KeyframeTrack` instances. Plan easing into the keyframe data format from the start — retrofitting it after animations are authored requires reformatting all data.

5. **OrbitControls blocking mobile scroll** — `OrbitControls` sets `touch-action: none` on the canvas, intercepting all touch events and preventing page scroll on mobile (documented drei issue #1233 with no clean built-in fix). Design the layout so form instructions are beside, not below, the 3D viewer on mobile, or provide discrete camera preset buttons as the primary mobile interaction and disable touch-orbit on small screens. Test on a physical iPhone SE (375px) — not a simulator — before finalizing mobile layout.

---

## Implications for Roadmap

Based on combined research, the dependency graph and pitfall timing map to a clear phase structure. Architecture research explicitly documents a build order; this roadmap follows it while incorporating pitfall prevention timing.

### Phase 1: Asset Pipeline and Project Foundation

**Rationale:** The single most expensive mistake in this project is locking in the wrong skeleton source and discovering mismatches after animations are authored. Architecture research specifies types and registry must come first. Pitfalls research mandates Draco compression and skeleton freeze before any animation authoring. All subsequent work depends on these decisions.

**Delivers:** Confirmed GLB asset pipeline (Mixamo FBX → Blender → Draco-compressed GLB), frozen skeleton rig, Vite + TypeScript + Tailwind project scaffold, `ExerciseDefinition` TypeScript interface, exercise registry with at least one complete exercise definition, `/public/models/` directory with at least one Draco-compressed GLB.

**Addresses features:** Exercise registry (required by all features), dark-themed layout scaffold.

**Avoids pitfalls:** Skeleton bone name mismatch (frozen before authoring), uncompressed GLBs (Draco compression as mandatory pipeline step from day one).

**Research flags:** Asset pipeline work (Blender GLB export with Draco, `gltf-transform` compression workflow) is somewhat niche; may benefit from a research-phase step focused on Blender → Three.js GLB round-trip.

### Phase 2: 3D Viewer Core and Animation Pipeline

**Rationale:** This is the highest-risk technical phase and the core product promise. Architecture specifies basic 3D viewer before animation, then animation before controls. Pitfalls research flags memory leak disposal and iOS context loss as things that must be built in at this phase, not retroactively.

**Delivers:** Three-panel layout (selector, canvas, form guide) with mock data; `HumanoidScene` loading a GLB with Suspense boundary; `AnimationMixer` looping the exercise animation; `OrbitControls` for rotate/zoom; `webglcontextlost`/`webglcontextrestored` event handlers; dispose lifecycle on exercise switch; `InterpolateSmooth` easing in all KeyframeTracks; `renderer.info.memory` monitoring in dev mode.

**Addresses features:** 3D animation on loop, orbit controls, play/pause.

**Avoids pitfalls:** Memory leaks from undisposed resources (built in from day one), WebGL context loss on iOS (context handlers added before first iOS test), robotic animation quality (smooth interpolation baked into keyframe format).

**Uses:** Three.js AnimationMixer, GLTFLoader, OrbitControls, QuaternionKeyframeTrack with `THREE.InterpolateSmooth`, Zustand store.

**Research flags:** Standard Three.js patterns — well-documented. AnimationMixer lifecycle and dispose patterns are in official docs. Skip research-phase unless programmatic quaternion animation proves harder than expected.

### Phase 3: Playback Controls and Exercise Switching

**Rationale:** Controls can only be wired after the animation pipeline exists. Exercise switching (with preloading) requires both the viewer and the registry to be complete. Architecture specifies this exact order.

**Delivers:** Play/pause toggle, playback speed control (0.25x / 0.5x / 1x / 2x via `AnimationMixer.timeScale`), camera angle preset buttons (front/side/back) with smooth camera transitions via `camera-controls` or manual lerp, exercise selector wired to store, exercise switching with `useGLTF.preload()` preloading all 5 starter GLBs, shareable URL state via hash or query param (low-effort, high-value per features research).

**Addresses features:** Playback speed control, camera presets, exercise selection, shareable deep links.

**Avoids pitfalls:** Camera preset implementation must update `OrbitControls.target`, not just `camera.position` (documented integration gotcha); speed control at loop boundaries must not produce jump/stutter at 0.25x and 2x.

**Research flags:** `camera-controls` integration (via Drei's `CameraControls`) for smooth animated camera transitions is slightly niche. May need brief research into smooth orbit transitions if vanilla OrbitControls lerp proves awkward.

### Phase 4: Content Authoring (All 5 Exercises)

**Rationale:** Complete exercise content can only be authored after the animation pipeline and switching system are proven. Attempting to author all 5 exercises before the pipeline is stable means rework when the pipeline changes. Architecture's build order explicitly puts content authoring last.

**Delivers:** All 5 starter exercises fully authored: squat, bench press, pushup, deadlift, plank. Each exercise has: Draco-compressed GLB with smooth animation, complete `ExerciseDefinition` (form steps, common errors, camera hints), confirmed correct skeleton (no T-pose, no inversion). Documented dev workflow for adding a 6th exercise.

**Addresses features:** Step-by-step form instructions, common mistakes content, complete exercise library for launch.

**Avoids pitfalls:** Animation quality non-technical review ("looks robotic" check) for all 5 exercises before shipping.

**Research flags:** Exercise biomechanics content (accurate form steps and common mistakes) is a domain knowledge problem, not a technical one. If a fitness expert is not on the team, this phase may need content review. Flag for validation.

### Phase 5: Mobile, Polish, and Pre-Launch

**Rationale:** Pitfalls research explicitly warns that OrbitControls scroll blocking on mobile must be tested with real devices before launch, and that mobile layout decisions affect the desktop layout design. Polish comes last but mobile verification comes earlier than most teams expect.

**Delivers:** Mobile-responsive layout tested on iPhone SE (375px physical device, not simulator); OrbitControls scroll behavior resolved (side-by-side panels on mobile, or discrete preset buttons replacing touch-orbit on small screens); loading indicators for GLB download (no blank canvas); default playback speed set to 50-70% of realistic speed for first-time viewers; Lighthouse performance score above 85; total page weight under 5MB; first exercise visible under 3 seconds on LTE.

**Addresses features:** Mobile-responsive layout, loading feedback, performance targets.

**Avoids pitfalls:** OrbitControls mobile scroll blocking (resolved in this phase), missing loading feedback, slow first load (verified with Slow 3G test).

**Research flags:** Standard responsive layout patterns. No research-phase needed. Mobile WebGL testing is manual — requires physical iOS and Android devices.

### Phase Ordering Rationale

- **Skeleton freeze must precede animation authoring** (PITFALLS.md Pitfall 1) — this forces the asset pipeline to Phase 1.
- **Draco compression must be in the pipeline before authoring animations** (PITFALLS.md Pitfall 5) — same consequence, Phase 1.
- **Exercise Registry and types are the shared foundation** (ARCHITECTURE.md build order) — nothing else can be correctly implemented without knowing the `ExerciseDefinition` shape.
- **Animation quality (easing, smoothing) must be designed into the keyframe format early** (PITFALLS.md Pitfall 4) — retrofitting easing after animations are authored requires rebuilding all animation data.
- **Dispose lifecycle and iOS context handlers belong in Phase 2, not polish** (PITFALLS.md Pitfall 2 and 3) — both require changes to the exercise switcher architecture; impossible to retrofit cleanly.
- **Content authoring last** — all 5 exercises should be authored against a stable, tested pipeline to avoid rework.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** Blender → Three.js GLB round-trip with Draco compression and animation baking is niche enough to warrant a research-phase step focused on the exact `gltf-transform` CLI commands and Blender export settings.
- **Phase 4:** Exercise biomechanics content accuracy is a domain knowledge gap if no fitness expert is involved. The "common mistakes" and "form steps" content should be reviewed by a subject matter expert before launch.

Phases with well-documented patterns (skip research-phase):
- **Phase 2:** Three.js AnimationMixer, GLTFLoader, OrbitControls — comprehensive official documentation. Dispose patterns are documented. Standard.
- **Phase 3:** Zustand store wiring, URL hash state, preloading — all standard patterns with abundant community documentation.
- **Phase 5:** Responsive layout, Lighthouse optimization, mobile testing — standard web development; no novel patterns.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Core libraries (Three.js, Vite, Tailwind v4) verified against official release pages and npm. Version numbers confirmed. Animation pipeline decision is MEDIUM: hybrid Mixamo + programmatic approach is the recommendation but bone compatibility across sources requires real-world validation. |
| Features | MEDIUM | Competitor features verified via direct product review. User expectation claims are inferred from UX research patterns, not FormCheck-specific user studies. The "table stakes" list is solid; differentiator value estimates are educated inference. |
| Architecture | MEDIUM-HIGH | Three.js animation system patterns are HIGH confidence (official docs and official manual). Exercise-specific patterns (ExerciseDefinition schema, registry approach) are MEDIUM — these are well-reasoned but not verified against an existing production FormCheck-type product. |
| Pitfalls | MEDIUM-HIGH | Skeleton mismatch, memory leaks, WebGL context loss, and OrbitControls scroll blocking are all verified against official sources (Apple Developer Forums, Three.js GitHub issues, MDN). Robotic motion quality and asset size warnings are MEDIUM (community sources and inferred from known Three.js defaults). |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- **Skeleton source decision:** Research identifies the risk but does not prescribe exactly which humanoid rig to use as the single source of truth. This decision must be made in Phase 1 and documented. Quaternius Universal Base Characters (CC0) or a Mixamo auto-rigged model are the two candidates. The choice affects all subsequent animation authoring.
- **Muscle highlighting implementation approach:** FEATURES.md flags this as a v1.x feature but notes it requires either a segmented mesh (per-muscle geometry) or a material/texture approach. The architectural choice was not resolved in research. Must be decided before the Phase 2 architecture is locked, even if implementation is deferred.
- **Programmatic animation quality ceiling:** Research acknowledges that hand-authored quaternion values require experimentation and that achieving natural-looking biomechanics is time-intensive. The actual effort per exercise is unknown until the first exercise is authored end-to-end. Validate this in Phase 1 before committing to the programmatic path for all 5 exercises.
- **Mixamo commercial license confirmation:** Mixamo is listed as "free for commercial use" per Adobe's FAQ, but FormCheck's exact commercial use case (public website, potentially monetized) should be confirmed against current Adobe terms before shipping.

---

## Sources

### Primary (HIGH confidence)
- Three.js official docs (threejs.org) — AnimationClip, AnimationMixer, OrbitControls, GLTFLoader APIs
- Three.js official manual (threejs.org/manual) — animation system architecture
- Vite 6 official release (vite.dev) — confirmed version, features
- Tailwind CSS v4 official release (tailwindcss.com) — confirmed version, CSS-first config
- Apple Developer Forums — WebGL context loss on iOS Safari (official developer forum thread)
- MDN — `WebGLRenderingContext.isContextLost()` API
- drei GitHub Issue #1233 — OrbitControls mobile scroll blocking (documented open issue)
- Three.js GitHub Issue #7670 — requestAnimationFrame CPU drain
- Khronos — glTF compression tooling (official standard body)
- Mixamo FAQ (helpx.adobe.com) — commercial use license confirmed

### Secondary (MEDIUM confidence)
- MuscleWiki (musclewiki.com) — direct competitor feature review
- Muscle and Motion (muscleandmotion.com) — direct competitor feature review
- iMuscle 2 by 3D4Medical (3d4medical.com) — direct competitor feature review
- Fitbod (fitbod.me) — direct competitor feature review
- Quaternius (quaternius.com) — CC0 humanoid model assets
- Discover Three.js (discoverthreejs.com/tips-and-tricks) — community best practices reference
- Codrops Three.js performance guide (2025) — optimization patterns
- Three.js forum — SkeletonUtils retarget Mixamo bone mismatch thread
- DeepWiki Three.js skeletal animation — AnimationMixer and SkinnedMesh data flow
- React Three Fiber docs (docs.pmnd.rs) — useGLTF, Suspense, preload patterns

### Tertiary (LOW confidence — needs validation)
- Programmatic quaternion biomechanics estimates — inferred from Three.js API capabilities; actual effort per exercise not validated
- Muscle highlighting implementation approach — flagged as unresolved; needs architecture decision before v1.x planning

---

*Research completed: 2026-02-23*
*Ready for roadmap: yes*
