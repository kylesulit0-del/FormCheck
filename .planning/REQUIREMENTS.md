# Requirements: FormCheck

**Defined:** 2026-02-23
**Core Value:** A user picks an exercise and immediately sees a clear, interactive 3D demonstration of proper form — from any angle, at any speed.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### 3D Viewer

- [ ] **VIEW-01**: User sees a 3D humanoid mannequin performing the selected exercise on continuous loop
- [ ] **VIEW-02**: User can click-drag to rotate the 3D model and scroll to zoom in/out
- [ ] **VIEW-03**: User can pause and resume the exercise animation
- [ ] **VIEW-04**: User can change playback speed (slow-mo, normal, fast)
- [ ] **VIEW-05**: User can switch between camera angle presets (front, side, back)
- [ ] **VIEW-06**: User can scrub through the animation timeline frame-by-frame via a slider

### Content

- [ ] **CONT-01**: User sees step-by-step form instructions for the selected exercise in a right-side panel
- [ ] **CONT-02**: User sees common mistakes / what-not-to-do warnings for the selected exercise
- [ ] **CONT-03**: User sees primary and secondary muscles highlighted on the 3D model during animation

### Navigation & Layout

- [ ] **NAV-01**: User sees a left-side panel listing all available exercises and can select one
- [ ] **NAV-02**: User sees a dark-themed single-page layout with selector (left), 3D viewer (center), and instructions (right) visible simultaneously
- [ ] **NAV-03**: Site is mobile-responsive (stacked layout on small screens)
- [ ] **NAV-04**: Site is free to use with no account required

### Exercises

- [ ] **EXER-01**: Squat exercise with animation, form instructions, and common mistakes
- [ ] **EXER-02**: Bench press exercise with animation, form instructions, and common mistakes
- [ ] **EXER-03**: Pushup exercise with animation, form instructions, and common mistakes
- [ ] **EXER-04**: Deadlift exercise with animation, form instructions, and common mistakes
- [ ] **EXER-05**: Plank exercise (isometric hold) with animation, form instructions, and common mistakes

### Technical Foundation

- [ ] **TECH-01**: Exercise data follows a config-driven pattern so new exercises can be added via a documented dev workflow
- [ ] **TECH-02**: 3D animations are generated programmatically or via a repeatable pipeline (not dependent on purchasing pre-made mocap files)
- [ ] **TECH-03**: Site deploys as a static site (Vercel/Netlify) with no backend
- [ ] **TECH-04**: GLB/3D assets are compressed (Draco) for fast loading

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Enhanced Navigation

- **NAV-05**: Shareable deep-link URLs per exercise (e.g., ?exercise=squat)
- **NAV-06**: Body map navigation — click a muscle group to find relevant exercises

### Enhanced Content

- **CONT-04**: Annotation overlays on the 3D model during key animation phases (e.g., "keep chest up" at bottom of squat)

### Exercise Library Expansion

- **EXER-06**: Expanded library (10-20 exercises including rows, lunges, overhead press, etc.)
- **EXER-07**: Complex sport-specific movements (boxing jab, basketball layup, etc.)

### Visual

- **VIEW-07**: Exercise filtering by muscle group and equipment type

## Out of Scope

| Feature | Reason |
|---------|--------|
| User accounts / authentication | Reference tool, not a training logger — static site has no backend |
| AI real-time form analysis via camera | Requires server-side ML processing, incompatible with static hosting |
| Video content alongside 3D | Commit fully to 3D — mixing modalities creates confusion |
| CMS / admin panel | Dev workflow sufficient for v1; CMS adds backend complexity |
| Workout tracking / logging | Not the product's purpose — link to Fitbod/MuscleWiki for that |
| Social features (comments, sharing beyond URLs) | Requires moderation, accounts, ongoing management |
| Anatomically detailed tissue layers | Targets medical users, not gym-goers — mannequin style is intentional |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| VIEW-01 | Phase 2 | Pending |
| VIEW-02 | Phase 2 | Pending |
| VIEW-03 | Phase 2 | Pending |
| VIEW-04 | Phase 3 | Pending |
| VIEW-05 | Phase 3 | Pending |
| VIEW-06 | Phase 3 | Pending |
| CONT-01 | Phase 4 | Pending |
| CONT-02 | Phase 4 | Pending |
| CONT-03 | Phase 4 | Pending |
| NAV-01 | Phase 2 | Pending |
| NAV-02 | Phase 2 | Pending |
| NAV-03 | Phase 5 | Pending |
| NAV-04 | Phase 2 | Pending |
| EXER-01 | Phase 4 | Pending |
| EXER-02 | Phase 4 | Pending |
| EXER-03 | Phase 4 | Pending |
| EXER-04 | Phase 4 | Pending |
| EXER-05 | Phase 4 | Pending |
| TECH-01 | Phase 1 | Pending |
| TECH-02 | Phase 1 | Pending |
| TECH-03 | Phase 1 | Pending |
| TECH-04 | Phase 1 | Pending |

**Coverage:**
- v1 requirements: 22 total
- Mapped to phases: 22
- Unmapped: 0

---
*Requirements defined: 2026-02-23*
*Last updated: 2026-02-23 after roadmap creation — all 22 requirements mapped*
