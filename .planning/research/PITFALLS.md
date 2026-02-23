# Pitfalls Research

**Domain:** Browser-based 3D humanoid exercise visualization / procedural animation
**Researched:** 2026-02-23
**Confidence:** MEDIUM-HIGH (WebSearch verified against Three.js official forum, MDN, and official docs; some findings MEDIUM where only community sources available)

---

## Critical Pitfalls

### Pitfall 1: Skeleton Bone Name Mismatch Breaks Animation Retargeting

**What goes wrong:**
When a humanoid model's skeleton (sourced from e.g. Ready Player Me, Mixamo, custom Blender rig) has different bone names or bone counts than the animation data, animations either fail silently, produce T-pose lock, or cause limbs to invert and flip. This is not an edge case — it is the default state when mixing skeleton sources.

Confirmed instance: Ready Player Me avatars have 67 bones; Mixamo animations have 82. Three.js's `SkeletonUtils.retarget()` does not handle this mismatch cleanly and returns inverted feet and backward hands.

**Why it happens:**
Developers assume skeletons are interchangeable because they look similar. There is no industry-standard bone naming convention enforced at the file format level. GLTF encodes bone names as arbitrary strings. Three.js does not validate skeleton compatibility at load time.

**How to avoid:**
- Lock the skeleton rig to a single source of truth (one armature, one bone naming convention) before writing any animation code
- If using Mixamo animations on a custom model, run the model through Mixamo's auto-rigger first to normalize bone names
- Procedural animation via direct bone quaternion manipulation bypasses retargeting entirely — this is the safest path for a programmatic approach
- Test with a T-pose reset after every skeleton source change

**Warning signs:**
- Character lies flat on its back on load
- Arms are mirrored wrong (left/right swapped)
- Feet point upward during motion
- Console error: `bone not found` or animation plays but mesh doesn't move

**Phase to address:**
Animation pipeline phase (Phase 2 / early). Skeleton source must be frozen before any animation authoring begins. Changing skeletons mid-project means rewriting all animation data.

---

### Pitfall 2: Memory Leaks from Undisposed Three.js Resources

**What goes wrong:**
GPU memory accumulates as exercises are switched. Each switch that loads a new model or re-creates geometries/materials/textures without calling `.dispose()` leaks VRAM. On mobile, this leads to WebGL context loss (the browser kills the WebGL context when GPU memory pressure is too high). On desktop, the page eventually crashes or degrades severely.

A specific variant: GLTF models loaded with `GLTFLoader` that use `ImageBitmap` textures require explicit `.close()` calls on those bitmaps — `texture.dispose()` alone does not release them.

**Why it happens:**
Three.js does not garbage-collect GPU resources automatically. JavaScript GC handles JS objects, but GPU handles (geometry buffers, texture objects, shader programs) must be explicitly released. Developers used to other frameworks assume "remove from scene = cleaned up."

**How to avoid:**
- On every exercise switch: traverse the old model's scene graph and call `geometry.dispose()`, `material.dispose()`, `texture.dispose()` on every node
- For GLTF models with ImageBitmap textures: call `texture.source.data.close()` explicitly
- Keep `renderer.info.memory` visible in development (shows geometries + textures count) — it should stay flat when switching exercises, not grow
- Use `object.visible = false` as a cheaper alternative to full disposal if re-use is planned

**Warning signs:**
- `renderer.info.memory.geometries` and `renderer.info.memory.textures` count increases each time an exercise is loaded
- Frame rate degrades after switching exercises several times
- Safari/iOS throws "WebGL: context lost" after a few exercise switches
- Chrome DevTools Memory tab shows growing GPU memory

**Phase to address:**
Animation pipeline phase. Build the dispose lifecycle from day one — retrofitting it after the exercise switching system is built is painful and error-prone.

---

### Pitfall 3: WebGL Context Loss on iOS / Mobile Safari

**What goes wrong:**
Safari on iOS (iOS 16-18 affected) drops the WebGL context when the app is backgrounded and resumed, or when GPU memory pressure is high. When context is lost, the 3D canvas goes blank. Without a context restoration handler, the entire page appears broken.

iOS 18.4 introduced additional regressions where WebGL stopped working entirely on older iPads (9th gen and below). GPU memory usage in Safari has also increased significantly in recent versions (700MB-1.3GB vs expected 300-500MB).

**Why it happens:**
iOS limits GPU resources aggressively for battery and thermal management. Safari treats backgrounded tabs as eligible for GPU resource reclamation. Apple's Metal-backed WebGL implementation has periodic regressions with iOS point releases.

**How to avoid:**
- Handle the `webglcontextlost` and `webglcontextrestored` events on the canvas element
- On context lost: pause the render loop, show a user-friendly fallback message
- On context restored: reinitialize renderer, reload textures, resume loop
- Keep textures and model file sizes minimal to reduce GPU pressure (see Pitfall 5)
- Test on real iOS devices — iOS simulator does not replicate GPU context behavior
- Cap device pixel ratio at 2 (not screen native) to reduce GPU memory consumption

**Warning signs:**
- Canvas goes blank on iOS after switching tabs
- Reports of "it works on Android but not iPhone"
- WebGL context loss events fired in browser console

**Phase to address:**
Browser compatibility phase. Add context loss handlers before the first iOS test. Discovering this in a late phase means all exercise switching code must be retrofitted.

---

### Pitfall 4: Robotic / Uncanny Motion from Pure Linear Keyframe Interpolation

**What goes wrong:**
Procedurally authored animations using linear quaternion or Euler keyframes between poses produce stiff, robotic movement — even when the poses themselves are anatomically correct. The motion lacks the secondary movement, weight shifts, and acceleration curves that make human movement feel real. For an exercise form guide where the animation IS the product, this is a fatal quality problem.

Three.js's `AnimationMixer` uses linear interpolation by default between keyframe values. Perfectly linear interpolation at constant velocity looks mechanical.

**Why it happens:**
Developers focus on getting the poses right and assume interpolation handles the "in-between." Real human biomechanics involve variable velocity (slow at extremes, fast through midpoint for power movements), and secondary movement (shoulders rotate when arms move, torso shifts with leg drive).

**How to avoid:**
- Use `THREE.InterpolateSmooth` (cubic bezier) or custom easing curves in `KeyframeTrack` rather than the default linear interpolation
- Add overlapping action — body parts that should follow other parts with a slight delay (e.g., hips initiate squat, then torso, then shoulders)
- Add secondary animation: spine flex, shoulder shrug, head bob — even subtle movement on "static" bones during holds
- For key exercises (squat, deadlift): research the actual joint velocity profile — the down phase is controlled (slow), the up phase is explosive (fast)
- Consider using `@react-spring/three` or custom spring physics for joints that need natural deceleration

**Warning signs:**
- Animation looks like a slideshow between static poses
- Arms swing at perfectly constant velocity
- The character appears to "snap" into position rather than settle
- Showing the animation to non-technical testers: first reaction is "it looks like a robot"

**Phase to address:**
Animation quality phase. Plan easing into the keyframe data format from the start. Retrofitting easing into a keyframe system built around linear interpolation requires reformatting all animation data.

---

### Pitfall 5: Uncompressed GLB Assets Causing Slow First Load

**What goes wrong:**
An unoptimized humanoid GLB model with skeleton can easily exceed 5-20MB. With 5 exercises, total initial load could be 25-100MB before any compression — unacceptable for a public website. First Contentful Paint and Time to Interactive degrade significantly. On slow mobile connections, users leave before the first animation loads.

**Why it happens:**
GLB files from Mixamo, Blender exports, or asset stores include redundant geometry, uncompressed vertex data, full-resolution textures, and sometimes embedded high-poly meshes. Developers test on fast local connections and don't notice.

**How to avoid:**
- Apply Draco mesh compression via `gltf-transform` or `gltf-pipeline` as a mandatory build step
- Target < 500KB per exercise GLB (model + skeleton + animations combined)
- Share the base skeleton/mesh across all exercises — load it once, swap only animation clips (not entire models per exercise)
- Use KTX2 / Basis Universal texture compression for any texture maps
- Lazy-load exercise animations on demand (not at page load) — load only the first exercise eagerly
- Test with Chrome DevTools Network tab throttled to "Slow 3G" before shipping

**Warning signs:**
- GLB files > 1MB before compression
- Total page weight > 5MB
- Load time > 3 seconds on LTE
- Lighthouse performance score below 70

**Phase to address:**
Asset pipeline phase (Phase 1 or 2). The compression workflow must be established before creating all 5 starter animations — retrofitting compression later risks breaking model-animation relationships.

---

### Pitfall 6: OrbitControls Blocking Mobile Page Scroll

**What goes wrong:**
Three.js `OrbitControls` (and `drei`'s `<OrbitControls>`) sets `touch-action: none` on the canvas element, intercepting all touch events. On mobile, this prevents users from scrolling past the 3D viewer to reach the form instructions panel below. The entire page can become scroll-locked on mobile.

This is a documented, unresolved issue in the `drei` library (GitHub issue #1233) with no clean built-in opt-out.

**Why it happens:**
OrbitControls must capture touch events to distinguish between orbit gestures and page scroll. The current implementation does so too aggressively, consuming all touch input regardless of gesture direction.

**How to avoid:**
- Design the layout so the form instructions panel is beside the 3D viewer, not below it (side-by-side on desktop, vertically stacked with viewer at top on mobile with explicit fixed height)
- If vertical stacking is required on mobile: implement a two-finger gesture requirement for orbit, freeing single-finger swipes for page scroll
- Alternatively, provide discrete camera angle preset buttons (front/side/back) as the primary mobile interaction — disabling touch-orbit on mobile entirely
- Test layout on iPhone SE viewport (375px) before finalizing the mobile design

**Warning signs:**
- Users cannot scroll on mobile (the whole page becomes stuck)
- QA testing on physical iPhone shows no scroll past the canvas
- Touch events consumed by the canvas rather than propagating to the page

**Phase to address:**
UI layout phase. Mobile scroll behavior must be tested with real devices as soon as OrbitControls is integrated. Don't defer mobile testing to a polish phase.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| One GLB file per exercise (model + animation bundled) | Simple to load and implement | Can't share skeleton; each new exercise requires full model re-export; total asset size scales linearly | Never for > 3 exercises |
| Hard-coded bone rotation values per exercise | Fast to author first animation | Any rig change breaks all exercises; no abstraction for adding new exercises | Only for throwaway prototype |
| Linear keyframe interpolation everywhere | Quick to implement | Robotic motion quality; hard to add easing after the fact | Only if mannequin/robot aesthetic is intentional |
| Continuous `requestAnimationFrame` loop even when paused | Simple loop logic | Constant CPU/GPU drain; kills mobile battery | Never on mobile — always pause loop when animation is paused or tab is hidden |
| Skip `dispose()` on exercise switch | Less code | VRAM leak; context loss on iOS; degrading FPS over session | Never — always dispose |
| Avoid Draco compression ("add it later") | Faster dev iteration | Asset sizes 10x larger than necessary; slow first load | Acceptable only during local development; must be in CI/CD pipeline before first user test |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| GLTFLoader + AnimationMixer | Creating a new `AnimationMixer` per frame instead of once per model | Create one mixer per loaded model; update it with delta time each frame |
| GLTFLoader + SkinnedMesh | Cloning a GLTF scene and expecting skeleton to transfer correctly | Use `SkeletonUtils.clone()` from Three.js extras — not native `.clone()` — to properly clone skinned meshes |
| OrbitControls + custom camera presets | Animating `camera.position` directly while OrbitControls is active | OrbitControls overrides camera position every frame; must update `controls.target` and use `controls.update()` rather than directly moving camera |
| Three.js + React | Creating Three.js objects inside React render functions | All Three.js object creation must be in `useEffect` or `useMemo` — never in the render body; use `@react-three/fiber` refs |
| Draco compressed GLB | Forgetting to include `DRACOLoader` with correct decoder path | Draco-compressed files require a matching `DRACOLoader` with decoder files hosted alongside the app; missing decoder path causes silent failure |
| Page Visibility API | Not pausing render loop when tab is hidden | Listen for `visibilitychange` event; pause `renderer.setAnimationLoop(null)` when hidden, resume when visible |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| High pixel ratio rendering | Smooth on desktop, jerky/hot on mobile | Cap `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))` | Immediately on devices with DPR > 2 (most modern phones) |
| Creating `new THREE.Vector3()` inside animation loop | Garbage collector spikes causing frame drops | Allocate vectors outside loop; use `.set()` to reuse | At ~60fps, creates thousands of short-lived objects per second |
| Multiple real-time lights + shadows | FPS drops to 20-30 on mobile | Use a single directional light + ambient; bake shadows into textures if needed | Any mobile device with 2+ shadow-casting lights |
| Loading all 5 exercise GLBs at page load | Long initial load; 3+ second TTI | Lazy-load exercises on demand; eager-load only the first exercise | At 5 exercises with uncompressed assets (> 10MB total) |
| `matrixAutoUpdate = true` on static scene objects | Unnecessary matrix recalculation every frame | Set `mesh.matrixAutoUpdate = false` on non-moving elements (ground plane, background) | At 60fps with many static objects |
| No frustum culling on off-screen objects | Rendering invisible geometry | Never disable `mesh.frustumCulled = true`; ensure bounding boxes are accurate | When scene has more than 1 mesh and camera moves |

---

## Security Mistakes

This is a read-only static site with no user input or backend. Security surface is minimal, but:

| Mistake | Risk | Prevention |
|---------|------|------------|
| Sourcing form instruction content from external APIs at runtime | XSS if API returns unexpected HTML; privacy issues if API logs user queries | Fetch content at build time; bake into static JSON; never inject raw HTML from external sources |
| Embedding exercise content from third-party CDNs without SRI | Content injection if CDN is compromised | Use Subresource Integrity (`integrity` attribute) for any externally hosted scripts |
| Loading 3D models from user-supplied URLs | Not applicable to v1 (no user input) | Keep model loading from local static assets only in v1 |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No loading indicator for GLB download | User sees blank canvas and assumes site is broken | Show skeleton/wireframe placeholder or progress bar while GLB loads; use `LoadingManager` progress events |
| Speed control changes animation playback rate but breaks loop timing | Animation stutters at non-1x speed or loop point jumps | Adjust `AnimationAction.timeScale` — Three.js handles loop timing correctly when only `timeScale` is changed |
| Camera resets to default angle on exercise switch | Disorienting — user loses their viewing angle | Preserve camera position and target across exercise switches; only reset on explicit camera preset button press |
| Orbit on mouse down (no drag threshold) | Accidental orbit on click-to-play | Require minimum drag distance (e.g., 5px) before initiating orbit; use click event for play/pause separate from drag orbit |
| Form instructions panel scrolls independently but user doesn't know | Users miss step-by-step content below the fold | Sync form instruction step highlight to animation phase (step 1 highlighted when character is in phase 1 of movement) — or at minimum, show scroll indicator |
| Animation plays too fast at default speed to read the form | Users can't see what correct form looks like | Default speed should be 50-70% of realistic speed for exercise guide use case; "normal" speed should feel slow to users not familiar with the exercise |

---

## "Looks Done But Isn't" Checklist

- [ ] **Exercise switching:** Switching exercises actually disposes previous model's GPU resources — verify with `renderer.info.memory.textures` staying flat
- [ ] **Mobile scroll:** Form instructions panel is reachable by scrolling on a 375px-wide iPhone SE viewport without getting stuck on the canvas
- [ ] **iOS context loss:** Canvas recovers gracefully when Safari is backgrounded and foregrounded — test on a real iPhone, not simulator
- [ ] **Playback speed control:** Slow-mo (0.25x) and fast (2x) work correctly at loop boundaries without jump or stutter
- [ ] **Camera presets:** Front/Side/Back buttons correctly update both camera position AND `OrbitControls.target` — not just camera position
- [ ] **Animation quality:** Non-technical person shown the animation doesn't say "it looks robotic" as their first reaction
- [ ] **First load time:** Total page weight tested on Slow 3G — first exercise visible in < 5 seconds
- [ ] **Adding a 6th exercise:** Developer can add a new exercise by following documented workflow without touching renderer/viewer code

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Skeleton mismatch discovered after animations are authored | HIGH | Re-rig model to match animation skeleton (or vice versa); re-export all animations; re-test all exercises |
| Memory leak discovered after exercise switcher is built | MEDIUM | Audit scene traversal on switch; add dispose calls; add `renderer.info` monitoring in dev mode |
| Robotic animation quality discovered late | HIGH | Add easing curves to all keyframe tracks; add secondary bone motion; potentially rebuild animation data format |
| OrbitControls scroll blocking discovered post-launch | MEDIUM | Redesign mobile layout; replace touch-orbit with camera preset buttons on mobile |
| Asset sizes discovered to be too large post-launch | MEDIUM | Add Draco compression to build pipeline; re-export all GLBs; update loader to use DRACOLoader |
| WebGL context loss handler missing (iOS crashes) | LOW | Add `webglcontextlost` / `webglcontextrestored` event listeners; add user-visible recovery message |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Skeleton bone name mismatch | Phase 1: Asset pipeline setup — freeze rig before authoring | Load all 5 exercises; each animates correctly without T-pose or inversion |
| Memory leaks (undisposed GPU resources) | Phase 2: Exercise switcher implementation | `renderer.info.memory.textures` stays flat after switching all exercises in sequence |
| WebGL context loss on iOS | Phase 2: Viewer implementation | Context loss + restore tested on physical iPhone (not simulator) |
| Robotic/linear interpolation motion | Phase 2: Animation authoring | Non-technical person review of all 5 animations; no "robot" feedback |
| Uncompressed GLB slow load | Phase 1: Asset pipeline setup | Lighthouse performance score > 85; first exercise visible < 3s on LTE |
| OrbitControls mobile scroll blocking | Phase 3: UI layout / mobile pass | Full page scroll verified on iPhone SE physical device |
| Missing loading feedback | Phase 3: UI polish | Zero-to-animation flow tested on throttled Slow 3G; loading state always visible |
| Animation speed control loop bugs | Phase 2: Playback controls | Speed tested at 0.25x, 0.5x, 1x, 2x; loop boundary has no jump/stutter |

---

## Sources

- [Three.js Forum: SkinnedMesh optimization and CPU bottlenecks](https://discourse.threejs.org/t/optimization-of-large-amounts-100-1000-of-skinned-meshes-cpu-bottlenecks/58196) — MEDIUM confidence
- [Three.js Forum: GLTF loader skinned mesh cloning issue](https://github.com/mrdoob/three.js/issues/14439) — MEDIUM confidence
- [Three.js Forum: SkeletonUtils.retarget() inverted feet with Mixamo rig](https://discourse.threejs.org/t/skeletonutils-retarget-doesnt-work-with-mixamorig-skeleton-inverted-feet-backward-hands/54892) — MEDIUM confidence
- [Discover Three.js: Tips and Tricks](https://discoverthreejs.com/tips-and-tricks/) — HIGH confidence (official community reference)
- [Codrops: Building Efficient Three.js Scenes (2025)](https://tympanus.net/codrops/2025/02/11/building-efficient-three-js-scenes-optimize-performance-while-maintaining-quality/) — HIGH confidence (verified, 2025)
- [100 Three.js Tips That Actually Improve Performance (2026)](https://www.utsubo.com/blog/threejs-best-practices-100-tips) — MEDIUM confidence
- [Apple Developer Forums: WebGL context lost on iOS Safari backgrounding](https://developer.apple.com/forums/thread/737042) — HIGH confidence (official Apple developer forum)
- [MDN: WebGLRenderingContext.isContextLost()](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/isContextLost) — HIGH confidence
- [Three.js Forum: R3F memory leak when canvas scrolled out of view](https://discourse.threejs.org/t/r3f-threejs-memory-leak-when-canvas-is-scrolled-out-of-view/48440) — MEDIUM confidence
- [drei GitHub Issue #1233: OrbitControls blocks scroll on mobile](https://github.com/pmndrs/drei/issues/1233) — HIGH confidence (documented bug)
- [Wayline: Escaping the Uncanny Valley: Procedural Animation and Believability](https://www.wayline.io/blog/escaping-the-uncanny-valley-procedural-animation) — MEDIUM confidence
- [Three.js GitHub Issue #7670: requestAnimationFrame loop CPU hog](https://github.com/mrdoob/three.js/issues/7670) — HIGH confidence (official repo)
- [Khronos: Optimize 3D Assets with glTF-Compressor](https://www.khronos.org/blog/optimize-3d-assets-with-khronos-new-gltf-compressor-tool) — HIGH confidence (official standard body)
- [Three.js Forum: Ready Player Me + Mixamo bone mismatch](https://discourse.threejs.org/t/how-to-apply-mixamo-animation-correctly-to-a-readyplayerme-character/72233) — MEDIUM confidence

---
*Pitfalls research for: FormCheck — 3D Exercise Form Guide*
*Researched: 2026-02-23*
