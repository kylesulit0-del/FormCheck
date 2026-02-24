---
phase: 01-foundation
plan: 03
subsystem: animation
tags: [three.js, animation, keyframes, quaternion, exercise-registry, vanilla-ts]

# Dependency graph
requires:
  - phase: 01-02
    provides: JointName enum, MannequinRig interface, buildMannequin(), appStore, render loop
provides:
  - buildQuatTrack (Euler degrees -> QuaternionKeyframeTrack, ZYX order)
  - buildClip (AnimationClip factory)
  - AnimationController (AnimationMixer wrapper with play/pause/speed)
  - ExerciseDefinition interface (typed exercise contract)
  - MuscleId union type (14 muscle groups)
  - exerciseRegistry Map + getExercise() helper
  - squat exercise definition (biomechanically accurate keyframes, 3s loop)
  - Zustand store subscriptions driving animation play/pause/speed
  - CONTRIBUTING.md (step-by-step exercise authoring workflow)
affects: [02-exercises, 03-ui, 04-highlighting, 05-polish]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "buildQuatTrack: convert degree Euler (ZYX) keyframes to QuaternionKeyframeTrack — all animation data authored in degrees"
    - "AnimationController owns its own THREE.Clock — separate from render loop clock, avoids double-tick issues"
    - "exerciseRegistry Map keyed by exercise id — O(1) lookup, single source of truth"
    - "ExerciseDefinition.buildAnimation(rig) pattern — exercises are self-contained animation factories"
    - "Zustand store.subscribe for reactive playback controls — no polling, event-driven"
    - "Seamless loop requirement: first and last keyframe must share identical angles"

key-files:
  created:
    - src/animation/keyframe-utils.ts
    - src/animation/AnimationController.ts
    - src/exercises/types.ts
    - src/exercises/registry.ts
    - src/exercises/squat.ts
    - CONTRIBUTING.md
  modified:
    - src/main.ts

key-decisions:
  - "AnimationController uses its own THREE.Clock (not shared with render loop) — avoids accumulated delta drift when update() and loop tick() share a clock"
  - "buildAnimation(rig) receives MannequinRig parameter for future exercises that may query joint world positions — extensible without breaking the interface"
  - "Pelvis rotation drives squat depth illusion — rotating pelvis+spine forward (not translating Y) keeps feet planted and creates realistic descending appearance in a programmatic rig without IK"

patterns-established:
  - "Exercise = one file in src/exercises/, one registry entry — minimal onboarding friction"
  - "All keyframe angles in degrees (ZYX Euler) — more readable than radians for biomechanical data"
  - "Track path = JointName enum string + .quaternion — enforced by TypeScript template literals"

requirements-completed: [TECH-01, TECH-02]

# Metrics
duration: 3min
completed: 2026-02-24
---

# Phase 1 Plan 03: Animation System and Exercise Registry Summary

**Three.js QuaternionKeyframeTrack animation pipeline from typed exercise definition through AnimationMixer to looping squat on mannequin, with Zustand-reactive play/pause/speed controls**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-24T02:03:39Z
- **Completed:** 2026-02-24T02:06:51Z
- **Tasks:** 2
- **Files modified:** 7 (6 created, 1 updated)

## Accomplishments

- Built `buildQuatTrack` converting degree Euler angles (ZYX biomechanical convention) to `THREE.QuaternionKeyframeTrack` — all exercise animation data authored in human-readable degrees
- Built `AnimationController` wrapping `THREE.AnimationMixer` with its own `THREE.Clock` for drift-free delta timing; exposes `play()`, `update()`, `setSpeed()`, `setPaused()`
- Defined `ExerciseDefinition` interface with all required fields: `id`, `name`, `primaryMuscles`, `secondaryMuscles`, `difficulty`, `formSteps`, `commonMistakes`, `hasGhostEquipment`, `buildAnimation`
- `MuscleId` union type covers 14 muscle groups (quads through hip-flexors)
- Squat exercise: 3-second rep, 7 keyframes per joint, biomechanically accurate angles (hip 92deg, knee 125deg, ankle 15deg dorsiflexion, pelvis+spine 22+12deg forward lean), seamless loop (frame 0 = frame 3.0)
- `exerciseRegistry` Map with `getExercise()` that throws descriptively on missing IDs
- Wired `main.ts`: loads squat from registry, builds clip via `buildAnimation(rig)`, starts `AnimationController.play()`, Zustand `subscribe()` drives pause/speed reactively
- `CONTRIBUTING.md`: 147-line guide with code template, 17-row JointName reference table, angle conventions, loop seamlessness requirement

## Task Commits

Each task was committed atomically:

1. **Task 1: Create animation utilities, AnimationController, exercise types, and squat definition** - `e16db23` (feat)
2. **Task 2: Wire animation into main.ts and create CONTRIBUTING.md** - `fe1129c` (feat)

## Files Created/Modified

- `src/animation/keyframe-utils.ts` - `deg()`, `buildQuatTrack()`, `buildClip()` utilities
- `src/animation/AnimationController.ts` - AnimationMixer wrapper with play/pause/speed
- `src/exercises/types.ts` - `MuscleId` type and `ExerciseDefinition` interface
- `src/exercises/registry.ts` - `exerciseRegistry` Map and `getExercise()` helper
- `src/exercises/squat.ts` - Squat exercise definition with 8-track biomechanical animation
- `CONTRIBUTING.md` - Step-by-step exercise authoring guide with code template
- `src/main.ts` - Added animation wiring: registry lookup, AnimationController, Zustand subscription

## Decisions Made

- `AnimationController` owns its own `THREE.Clock` (not shared with render loop) — avoids accumulated delta drift when `update()` and `loop tick()` share a clock instance
- `buildAnimation(rig: MannequinRig)` receives the full rig as parameter — future exercises may query joint world positions for IK or equipment placement without breaking the interface
- Pelvis + spine rotation drives the squat depth illusion (not Y-translation) — rotating forward keeps feet planted and creates realistic descent appearance in a programmatic rig without inverse kinematics

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - animation plays automatically on `npm run dev`.

## Next Phase Readiness

- Animation pipeline is proven end-to-end: typed definition -> keyframe utilities -> AnimationMixer -> looping on mannequin
- `exerciseRegistry` ready for Phase 2 exercises (deadlift, bench press, etc.)
- `ExerciseDefinition.buildAnimation(rig)` is the extension point — one file per exercise
- Zustand store controls (isPlaying, playbackSpeed) drive animation — UI Phase 3 can wire sliders/buttons to these
- `segmentMaterials` Map from Plan 02 still untouched — ready for Phase 4 muscle highlighting
- No blockers

---
*Phase: 01-foundation*
*Completed: 2026-02-24*

## Self-Check: PASSED

Verified:
- `src/animation/keyframe-utils.ts` exists
- `src/animation/AnimationController.ts` exists
- `src/exercises/types.ts` exists
- `src/exercises/registry.ts` exists
- `src/exercises/squat.ts` exists
- `CONTRIBUTING.md` exists (147 lines, >30 line minimum met)
- `src/main.ts` updated with animation wiring
- Commit `e16db23` in git log (Task 1)
- Commit `fe1129c` in git log (Task 2)
- `npm run build` succeeds (19 modules, no TypeScript errors)
