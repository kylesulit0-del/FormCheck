# Roadmap: FormCheck

## Overview

FormCheck ships as a static single-page site delivering interactive 3D exercise form guidance. The build order is dictated by hard technical dependencies: the asset pipeline and exercise registry must be frozen before any animation work begins, because every other component depends on them. From that foundation, the 3D viewer core comes next, then playback controls on top of a working viewer, then full exercise content authored against a proven pipeline, and finally mobile and polish before launch.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Project scaffold, asset pipeline, exercise registry, and static deployment setup (completed 2026-02-24)
- [ ] **Phase 2: 3D Viewer Core** - Humanoid model loads and loops in a three-panel layout with orbit controls
- [ ] **Phase 3: Playback Controls** - Speed, timeline scrub, camera presets, and exercise switching wired to store
- [ ] **Phase 4: Exercise Content** - All 5 starter exercises fully authored with animations, form steps, and common mistakes
- [ ] **Phase 5: Mobile and Polish** - Responsive layout, performance targets met, pre-launch verification

## Phase Details

### Phase 1: Foundation
**Goal**: The project scaffold, asset pipeline, and exercise registry are in place so all subsequent animation and UI work builds on a stable, frozen foundation
**Depends on**: Nothing (first phase)
**Requirements**: TECH-01, TECH-02, TECH-03, TECH-04
**Success Criteria** (what must be TRUE):
  1. Running `npm run dev` opens the app in a browser with no errors in the console
  2. At least one Draco-compressed GLB exists in `/public/models/` and is under 500KB
  3. The `ExerciseDefinition` TypeScript interface is defined and at least one exercise is registered in the exercise registry
  4. The dev can add a new exercise by creating one file in `exercises/` and following a documented workflow
  5. `npm run build` produces a `dist/` folder deployable to Vercel/Netlify with no build errors
**Plans:** 3/3 plans complete
Plans:
- [x] 01-01-PLAN.md — Scaffold Vite project, install dependencies, configure Tailwind v4, establish Draco asset pipeline with compressed barbell GLB
- [x] 01-02-PLAN.md — Build programmatic mannequin mesh hierarchy and Three.js scene rendering infrastructure
- [ ] 01-03-PLAN.md — Create animation system, exercise registry with squat exercise, wire to mannequin, and CONTRIBUTING.md

### Phase 2: 3D Viewer Core
**Goal**: A user visiting the site sees a humanoid mannequin performing an exercise on loop in a three-panel layout, can rotate and zoom the model, and can pause and resume the animation
**Depends on**: Phase 1
**Requirements**: VIEW-01, VIEW-02, VIEW-03, NAV-01, NAV-02, NAV-04
**Success Criteria** (what must be TRUE):
  1. The page loads showing all three panels simultaneously: exercise selector (left), 3D viewer (center), form guide (right) on a dark background
  2. The 3D viewer shows the humanoid model performing the selected exercise on continuous loop without user action
  3. User can click-drag on the viewer canvas to rotate the model and scroll to zoom in and out
  4. User can click Pause to stop the animation and Play to resume it from where it stopped
  5. User can click any exercise in the left panel to switch to it; the viewer loads and loops that exercise
**Plans:** 1 plan
Plans:
- [ ] 02-01-PLAN.md — Close UI gaps: exercise selector left-border indicator, collapsible side panels, and animation-synchronized active step highlighting

### Phase 3: Playback Controls
**Goal**: Users have full control over how they watch the animation — speed, frame position, and camera angle — enabling detailed form study
**Depends on**: Phase 2
**Requirements**: VIEW-04, VIEW-05, VIEW-06
**Success Criteria** (what must be TRUE):
  1. User can select slow, normal, or fast playback speed and the animation visibly changes pace with no stutter or jump at loop boundaries
  2. User can click Front, Side, or Back preset buttons and the camera moves to the corresponding position around the model
  3. User can drag a timeline slider to scrub through the animation frame by frame and release it to resume playback from that position
**Plans**: TBD

### Phase 4: Exercise Content
**Goal**: All five starter exercises are fully playable and documented — each with a smooth animation, accurate step-by-step form instructions, common mistakes, and muscle highlights — so the site delivers its complete core value
**Depends on**: Phase 3
**Requirements**: EXER-01, EXER-02, EXER-03, EXER-04, EXER-05, CONT-01, CONT-02, CONT-03
**Success Criteria** (what must be TRUE):
  1. Squat, bench press, pushup, deadlift, and plank are all selectable and each plays a smooth, non-robotic animation with no T-pose or inverted limbs
  2. Selecting any exercise shows numbered step-by-step form instructions in the right panel that are accurate and sourced
  3. Selecting any exercise shows a common mistakes section listing at least two form errors to avoid
  4. During any exercise animation, the primary and secondary muscles used are visibly highlighted on the 3D model
**Plans**: TBD

### Phase 5: Mobile and Polish
**Goal**: The site works correctly on small screens, loads fast on a real mobile connection, and is ready to ship publicly
**Depends on**: Phase 4
**Requirements**: NAV-03
**Success Criteria** (what must be TRUE):
  1. On a 375px-wide screen (iPhone SE), all panels are accessible — content stacks vertically and the 3D viewer remains usable
  2. The first exercise is visible and interactive in under 3 seconds on a simulated LTE connection
  3. Total page weight is under 5MB and Lighthouse performance score is above 85
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 3/3 | Complete   | 2026-02-24 |
| 2. 3D Viewer Core | 0/1 | In progress | - |
| 3. Playback Controls | 0/TBD | Not started | - |
| 4. Exercise Content | 0/TBD | Not started | - |
| 5. Mobile and Polish | 0/TBD | Not started | - |
