---
phase: 01-foundation
plan: 02
subsystem: ui
tags: [three.js, zustand, mannequin, webgl, animation-contract, vanilla-ts]

# Dependency graph
requires:
  - phase: 01-01
    provides: Vite + TypeScript scaffold, Three.js installed, Zustand installed
provides:
  - Programmatic segmented mannequin mesh hierarchy (pelvis -> spine -> chest -> limbs)
  - JointName enum (17 joints) — frozen animation contract for all future animation tracks
  - SegmentName enum (15 regions) — muscle highlighting contract for Phase 4
  - MannequinRig interface with root, joints Map, and segmentMaterials Map
  - Three.js WebGLRenderer + Scene + PerspectiveCamera with lighting
  - Zustand v5 vanilla createStore appStore (selectedExerciseId, isPlaying, playbackSpeed)
  - THREE.Clock-based render loop with start/stop controls
affects: [03-animation, 04-exercises, 05-polish]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "JointName enum as Object3D.name values — animation track paths must match these strings exactly"
    - "Each segment gets its own MeshStandardMaterial instance — never share materials between segments"
    - "Segment factory pattern: createTorsoSegments/createArms/createLegs return {group, materials}"
    - "Zustand v5 vanilla: createStore from zustand/vanilla — no React dependency"
    - "THREE.Clock.getDelta() for frame timing — not Date.now()"
    - "Joint hierarchy: pelvis root, spine->chest->neck/head/shoulders/elbows/wrists; pelvis->hips->knees->ankles"

key-files:
  created:
    - src/mannequin/mannequin.types.ts
    - src/mannequin/MannequinBuilder.ts
    - src/mannequin/segments/torso.ts
    - src/mannequin/segments/limbs.ts
    - src/mannequin/segments/head.ts
    - src/core/renderer.ts
    - src/core/loop.ts
    - src/core/store.ts
  modified:
    - src/main.ts

key-decisions:
  - "Mannequin centered with pelvis at y=0.97 so feet land near y=0 (total height ~1.75m)"
  - "Shoulder joints at chest level (not separate shoulder bone) — simpler hierarchy, sufficient for exercise animations"
  - "Segment factories return meshes + materials Map — builder merges all into single segmentMaterials Map"

patterns-established:
  - "Factory function pattern for segment meshes: returns group + materials Map for builder to merge"
  - "Object3D.name = JointName enum string on every joint — required for animation track path lookup"

requirements-completed: [TECH-01]

# Metrics
duration: 3min
completed: 2026-02-24
---

# Phase 1 Plan 02: Mannequin and Scene Infrastructure Summary

**Programmatic Three.js mannequin with 17-joint hierarchy, 15 independently-highlightable segment materials, WebGLRenderer scene, THREE.Clock render loop, and Zustand v5 vanilla store**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-24T01:58:12Z
- **Completed:** 2026-02-24T02:01:14Z
- **Tasks:** 2
- **Files modified:** 9 (8 created, 1 updated)

## Accomplishments
- Built full joint hierarchy using Object3D tree: pelvis -> spine -> chest -> neck/head/shoulders/elbows/wrists; pelvis -> hips -> knees -> ankles (17 named joints using JointName enum — the frozen animation contract)
- Created 5 segment factory files producing 15 independently-highlightable MeshStandardMaterial instances (torso, chest, glutes, lower_back, core_front, upper_arm_l/r, forearm_l/r, thigh_l/r, shin_l/r, neck, head)
- Wired Three.js WebGLRenderer (antialias, dark bg 0x1a1a1a) + PerspectiveCamera (FOV 50 at z=3) + ambient/directional/fill lighting — mannequin renders against dark background
- Zustand v5 vanilla store (createStore from zustand/vanilla) with selectedExerciseId/isPlaying/playbackSpeed defaults and setters
- THREE.Clock-based render loop (getDelta) with start/stop controls — build passes with no TypeScript errors (13 modules, 476 kB)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create mannequin types, segment factories, and MannequinBuilder** - `57fe20d` (feat)
2. **Task 2: Create Three.js scene infrastructure, render loop, Zustand store, and wire mannequin** - `801c2a0` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified
- `src/mannequin/mannequin.types.ts` - JointName enum (17 joints) and SegmentName enum (15 regions)
- `src/mannequin/MannequinBuilder.ts` - buildMannequin() returning MannequinRig {root, joints, segmentMaterials}
- `src/mannequin/segments/torso.ts` - Pelvis/glutes, lower_back, torso/abdomen, core_front, chest meshes
- `src/mannequin/segments/limbs.ts` - Upper arm, forearm (both sides), thigh, shin (both sides) with joint spheres and hands/feet
- `src/mannequin/segments/head.ts` - Neck cylinder + spherical head (slightly elongated)
- `src/core/renderer.ts` - WebGLRenderer + Scene + PerspectiveCamera + ambient/directional/fill lighting + resize handler
- `src/core/loop.ts` - createRenderLoop using THREE.Clock.getDelta() returning {start, stop}
- `src/core/store.ts` - Zustand v5 vanilla appStore with exercise/playing/speed state and actions
- `src/main.ts` - Entry: builds mannequin, adds to scene, starts render loop

## Decisions Made
- Pelvis positioned at y=0.97 so the foot geometry lands near y=0 — mannequin stands on the ground plane without manual adjustment
- Shoulder joints attached directly to chest Object3D (not a separate clavicle bone) — simpler hierarchy adequate for squat/deadlift/press animations in Phase 3
- Segment factory functions return `{meshes: Group, materials: Map}` — builder merges all four factory Maps into single `segmentMaterials` Map for clean Phase 4 access

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Mannequin renders in browser at `npm run dev` against dark background with proper lighting
- JointName enum is the frozen animation contract — Plan 03 (AnimationMixer) can reference these names safely
- segmentMaterials Map ready for Phase 4 muscle highlighting
- appStore.getState().isPlaying = true drives Plan 03's playback control
- No blockers

---
*Phase: 01-foundation*
*Completed: 2026-02-24*

## Self-Check: PASSED

All 10 files verified present. Both task commits (57fe20d, 801c2a0) confirmed in git log.
