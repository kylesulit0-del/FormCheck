---
phase: 03-playback-controls
plan: 01
subsystem: ui
tags: [three.js, zustand, typescript, tailwind, animation, camera, timeline]

# Dependency graph
requires:
  - phase: 02-3d-viewer-core
    provides: "AnimationController, OrbitControls, appStore, animationRef — all used by control bar"
provides:
  - "Single-row control bar below 3D canvas (not floating) with Play/Pause, Timeline scrubber, Speed buttons, Camera presets, Labels toggle"
  - "Smooth camera lerp animation with 4 presets (front/left/right/back) via tickCameraAnimation()"
  - "YouTube-style timeline with accent-filled gradient and --fill-pct CSS variable"
affects: [04-content-library, 05-polish]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "CSS custom property (--fill-pct) set per-RAF-frame to drive range input gradient fill"
    - "OrbitControls 'start' event cancels active camera lerp to prevent user vs animation fighting"
    - "Window-level pointerup/blur listeners clear isScrubbing to handle outside-element pointer release"
    - "tickCameraAnimation() in render loop with exponential lerp 0.18/frame snap-at-<0.005"

key-files:
  created: []
  modified:
    - index.html
    - src/core/cameraPresets.ts
    - src/main.ts
    - src/ui/PlaybackOverlay.ts
    - src/style.css

key-decisions:
  - "Control bar sits structurally below #panel-center in a flex-col wrapper — not floating over the canvas"
  - "Camera presets use single-character abbreviation pills (F/L/R/B) per CONTEXT.md Claude's discretion"
  - "Timeline gradient fill via --fill-pct CSS var updated in RAF loop (no Zustand animation time storage)"
  - "Lerp factor 0.18 per frame at 60fps yields ~300ms ease-out transitions; snap threshold 0.005"
  - "OrbitControls 'start' event listener cancels _targetPosition to prevent camera fighting user drag"

patterns-established:
  - "RAF-driven CSS variable updates for smooth visual sync without Zustand per-frame state"
  - "Window-level event listeners for pointer release guards (pointerup, blur)"

requirements-completed: [VIEW-04, VIEW-05, VIEW-06]

# Metrics
duration: 2min
completed: 2026-02-24
---

# Phase 3 Plan 1: Playback Controls Summary

**Single-row control bar below the 3D canvas with smooth camera lerp animation (F/L/R/B presets), YouTube-style timeline scrubber with accent fill gradient, and segmented speed buttons (0.5x/1x/2x)**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-24T13:42:10Z
- **Completed:** 2026-02-24T13:44:00Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Restructured HTML from floating overlay to flex-col layout with structured `#control-bar` element below 3D canvas
- Replaced 3-preset snap camera system with 4-preset (front/left/right/back) lerp animation via `tickCameraAnimation()`
- Rewrote PlaybackOverlay as single-row control bar: Play/Pause | Timeline (flex-1) | Speed | Camera | Labels
- Added YouTube-style timeline CSS with accent-colored fill using `--fill-pct` CSS custom property
- Added window-level scrubbing guards (pointerup + blur) to safely handle pointer-up-outside

## Task Commits

Each task was committed atomically:

1. **Task 1: Restructure HTML layout and add smooth camera preset system** - `64fb27d` (feat)
2. **Task 2: Rewrite PlaybackOverlay as single-row control bar with styled timeline** - `8a8a1a2` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified
- `index.html` - Flex-col wrapper around #panel-center + #control-bar div
- `src/core/cameraPresets.ts` - 4 presets with lerp animation, tickCameraAnimation(), OrbitControls cancel listener
- `src/main.ts` - Import + call tickCameraAnimation() in render loop; pass #control-bar to mountPlaybackOverlay
- `src/ui/PlaybackOverlay.ts` - Full rewrite targeting #control-bar, single-row layout, RAF fill sync, window guards
- `src/style.css` - Custom range input styling with gradient fill via --fill-pct CSS variable

## Decisions Made
- Control bar is structural HTML (not absolute-positioned) — canvas resizes automatically via existing ResizeObserver
- Camera preset buttons use F/L/R/B abbreviation pills with title tooltips (Claude's discretion per CONTEXT.md)
- Lerp factor 0.18 per frame chosen to yield ~300ms ease-out at 60fps; snap at <0.005 units distance
- No Zustand per-frame animation time — RAF reads from AnimationController directly (per STATE.md decision)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed stale "side" preset reference in PlaybackOverlay.ts**
- **Found during:** Task 1 (after renaming `side` to `right` in cameraPresets.ts)
- **Issue:** TypeScript immediately errored — PlaybackOverlay.ts still referenced `PresetName = "side"` which no longer existed after the type update
- **Fix:** Updated CAMERA_PRESETS array in PlaybackOverlay.ts to use `left` and `right` presets with correct names before proceeding to Task 2's full rewrite
- **Files modified:** src/ui/PlaybackOverlay.ts
- **Verification:** `npx tsc --noEmit` passed cleanly after fix
- **Committed in:** 64fb27d (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking type error from preset rename)
**Impact on plan:** Necessary for Task 1 compilation — no scope creep.

## Issues Encountered
None beyond the type error deviation above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All VIEW-04/05/06 requirements met: speed buttons, camera presets, timeline scrubber all functional
- Control bar layout matches CONTEXT.md spec exactly
- Ready for Phase 4 (content library) — exercise switching, panel collapse, orbit controls, form guide sync all preserved
- Existing features validated: `npm run build` clean, `npx tsc --noEmit` passes

---
*Phase: 03-playback-controls*
*Completed: 2026-02-24*

## Self-Check: PASSED

- index.html: FOUND
- src/core/cameraPresets.ts: FOUND
- src/main.ts: FOUND
- src/ui/PlaybackOverlay.ts: FOUND
- src/style.css: FOUND
- 03-01-SUMMARY.md: FOUND
- Commit 64fb27d: FOUND
- Commit 8a8a1a2: FOUND
