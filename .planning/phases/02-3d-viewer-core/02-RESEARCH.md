# Phase 2: 3D Viewer Core - Research

**Researched:** 2026-02-24
**Domain:** Three.js UI layout, OrbitControls, exercise switching, panel collapse, active-step synchronization
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Panel layout:**
- Viewer-dominant proportions: center viewer ~60% width, side panels ~20% each
- Side panels are collapsible to give the viewer full width
- No borders between panels — spacing and background shifts define regions
- Dark theme throughout — makes the 3D model pop

**Exercise selector (left panel):**
- Simple text list of exercise names — minimal, clean
- Active exercise indicated by a colored left border / highlight bar
- Name only per exercise — no extra metadata
- "Exercises" header label above the list

**Form guide display (right panel):**
- Numbered sequential steps: 1. Stand with feet... 2. Grip the bar...
- Active step highlights in sync with the animation phase as it plays
- Common mistakes section displayed below the steps as a separate section
- Right panel scrolls independently — 3D viewer stays fixed in center

**Viewer controls:**
- Play/pause controls in a control bar below the 3D canvas (video-player style)
- Default camera angle is front-facing when an exercise first loads
- Instant swap when switching exercises — no fade transition
- Camera keeps the user's current angle when switching exercises (no reset)

### Claude's Discretion
- Exact collapse/expand button design and placement for side panels
- Loading states and empty states
- Exact spacing, typography, and color palette within the dark theme
- Control bar additional elements (if any) beyond play/pause

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| VIEW-01 | User sees a 3D humanoid mannequin performing the selected exercise on continuous loop | ALREADY IMPLEMENTED — AnimationController with LoopRepeat Infinity, mannequin built and animated in main.ts |
| VIEW-02 | User can click-drag to rotate the 3D model and scroll to zoom in/out | ALREADY IMPLEMENTED — OrbitControls wired in main.ts with dampingFactor, minDistance, maxDistance, maxPolarAngle |
| VIEW-03 | User can pause and resume the exercise animation | ALREADY IMPLEMENTED — PlaybackOverlay.ts has play/pause button; appStore.isPlaying drives AnimationController.setPaused() |
| NAV-01 | User sees a left-side panel listing all available exercises and can select one | PARTIALLY IMPLEMENTED — ExerciseSelector renders exercise buttons; MISSING the colored left-border active indicator and "Exercises" header label; current active style uses bg highlight, not border |
| NAV-02 | User sees a dark-themed single-page layout with selector (left), 3D viewer (center), and instructions (right) visible simultaneously | LARGELY IMPLEMENTED — three-panel flex layout in index.html; dark bg-bg theme; MISSING collapsible panel functionality |
| NAV-04 | Site is free to use with no account required | SATISFIED — static Vite site, no auth, no backend |
</phase_requirements>

---

## Summary

Phase 2 is in an unusual state: the majority of its features were implemented during Phase 1 execution (outside the planning system) via a series of commits that built the full three-panel UI, OrbitControls, exercise switching, play/pause, exercise selector, and form guide. The codebase is fully functional and the build passes cleanly. Phase 2 does NOT start from scratch — it starts from a complete working foundation.

Three features required by the CONTEXT.md decisions are missing from the current implementation: (1) collapsible side panels, (2) a colored left-border active indicator in the exercise selector (currently uses a background highlight), and (3) active form step highlighting synchronized with animation progress. VIEW-01, VIEW-02, VIEW-03, and NAV-04 are fully satisfied. NAV-01 and NAV-02 are partially satisfied — the structure exists but the specific UX decisions from CONTEXT.md are not yet implemented.

The planning task for Phase 2 is therefore a gap-filling exercise: verify and document existing feature coverage, then implement the three remaining features. The architecture is already established and stable — no new libraries are needed beyond what is installed.

**Primary recommendation:** Plan Phase 2 as three targeted work units: (1) verify existing implementation against all success criteria, (2) add collapsible panels and left-border active indicator, (3) add animation-synchronized active step highlighting in the form guide.

---

## Existing Implementation Inventory

This section documents what already exists so the planner does not re-implement it.

### Fully Implemented (No Work Needed)

| Feature | Location | How It Works |
|---------|---------|--------------|
| Three-panel flex layout | `index.html` | `body class="flex"` — `#panel-left` (w-64), `#panel-center` (flex-1), `#panel-right` (w-72) |
| Dark theme | `src/style.css` | `--color-bg: #1a1a1a`, `--color-surface: oklch(18% 0.015 264)`, `--color-accent: oklch(65% 0.18 264)` as Tailwind v4 @theme tokens |
| 3D humanoid mannequin on loop | `src/main.ts`, `src/animation/AnimationController.ts` | `buildMannequin()` creates rig; `AnimationController.play(clip)` with `LoopRepeat Infinity`; all 5 exercises registered |
| OrbitControls (rotate + zoom) | `src/main.ts` | `OrbitControls` from `three/addons`; dampingFactor=0.1; minDistance=1.5; maxDistance=8; maxPolarAngle=0.85π |
| Play/pause button | `src/ui/PlaybackOverlay.ts` | Circular button below viewer; toggles `appStore.isPlaying`; AnimationController.setPaused() reacts via subscription |
| Exercise selector list | `src/ui/ExerciseSelector.ts` | Iterates `exerciseRegistry`; click calls `appStore.setExercise(id)`; active uses `bg-accent/20 text-accent` |
| Form guide (right panel) | `src/ui/FormGuide.ts` | Shows exercise name, numbered form steps, common mistakes, muscle tags; re-renders on store subscription |
| Exercise switching | `src/main.ts` | Store subscription detects `selectedExerciseId` change; calls `loadExercise(id)` which disposes old controller and loads new |
| Camera keeps angle on switch | `src/main.ts` | `OrbitControls` is NOT reset when exercise switches; only the animated object changes |
| Responsive renderer | `src/core/renderer.ts` | `ResizeObserver` on `#panel-center` calls `renderer.setSize()` + `camera.updateProjectionMatrix()` |
| Instant swap (no fade) | `src/main.ts` `loadExercise()` | Synchronous scene cleanup + rebuild; no transition code |

### Partially Implemented (Needs Adjustment)

| Feature | Current State | What's Missing |
|---------|-------------|---------------|
| Active exercise indicator | Background highlight: `bg-accent/20 text-accent font-medium` | CONTEXT.md specifies a **colored left border / highlight bar** — needs `border-l-2 border-accent` or similar instead of / in addition to bg highlight |
| Exercise selector header | No "Exercises" label above the list | CONTEXT.md specifies an `"Exercises"` header label above the list |
| Camera default on exercise load | Camera does NOT reset to front on load | CONTEXT.md specifies **"Default camera angle is front-facing when an exercise first loads"** — needs `setCameraPreset('front')` call inside `loadExercise()` |

### Not Implemented (New Work Required)

| Feature | Description | Complexity |
|---------|-------------|-----------|
| Collapsible side panels | Button to collapse left/right panels; viewer expands to full width | MEDIUM — CSS transition + state management |
| Active step highlighting | Form guide highlights the step number that matches current animation progress | MEDIUM — requires mapping animation time to step index |

---

## Standard Stack

### Core (Already Installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| three | ^0.172.0 | 3D rendering, animation, scene management | Project foundation — do not change |
| zustand | ^5.0.3 | Vanilla store for UI state (no React) | Project foundation — do not change |
| tailwindcss | ^4.0.6 | Utility CSS with @theme tokens | Project foundation — do not change |
| vite | ^6.1.0 | Dev server, build tool | Project foundation — do not change |
| typescript | ^5.7.3 | Type safety | Project foundation — do not change |

### Supporting (Already Installed)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| three/addons/controls/OrbitControls | (bundled with three) | Mouse rotate + scroll zoom on the canvas | Already wired in main.ts |

**No new libraries are needed for Phase 2.** All required functionality is achievable with what is installed.

**Installation:**
```bash
# Nothing new to install — all dependencies exist
```

---

## Architecture Patterns

### Existing Project Structure
```
src/
├── animation/          # AnimationController, keyframe-utils
├── core/               # renderer, loop, store, cameraPresets, animationRef, rigRef
├── exercises/          # registry, types, squat/benchPress/pushup/deadlift/plank
├── loaders/            # modelLoader (GLB support)
├── mannequin/          # MannequinBuilder, highlighter, muscleMap, segments/
├── ui/                 # ExerciseSelector, FormGuide, PlaybackOverlay, AnnotationOverlay
├── main.ts             # App entry point — wires everything
└── style.css           # Tailwind v4 @theme + canvas overrides
```

### Pattern 1: Store-Driven Reactive UI

**What:** UI components subscribe to `appStore` and re-render on state changes. No direct cross-component communication.

**When to use:** Any UI state (selected exercise, playing, speed, panel visibility).

**Example:**
```typescript
// Source: src/ui/ExerciseSelector.ts (existing pattern)
export function mountExerciseSelector(container: HTMLElement): void {
  function render() {
    const { selectedExerciseId } = appStore.getState()
    // ... rebuild DOM from state
  }
  render()
  appStore.subscribe(render) // Re-renders on any state change
}
```

**For collapsible panels:** Add `leftPanelCollapsed: boolean` and `rightPanelCollapsed: boolean` to `AppState`. Panel toggle buttons call `setLeftPanelCollapsed(true)`. A subscriber on `#panel-left` and `#panel-right` applies/removes a CSS class.

### Pattern 2: Subscription-Based Side Effects

**What:** `main.ts` uses `appStore.subscribe()` with change detection to drive Three.js side effects (exercise switching, playback control).

**When to use:** When a state change requires Three.js work (not just DOM work).

**Example:**
```typescript
// Source: src/main.ts (existing pattern)
appStore.subscribe((state, prevState) => {
  if (state.selectedExerciseId !== prevState.selectedExerciseId) {
    loadExercise(state.selectedExerciseId)
  }
})
```

### Pattern 3: RAF Loop for Animation-Synchronized UI

**What:** Components that need to track animation progress use `requestAnimationFrame` loops (not store subscriptions) because animation time changes every frame.

**When to use:** Timeline scrub slider sync, active step highlighting.

**Example (existing, from PlaybackOverlay.ts):**
```typescript
// Source: src/ui/PlaybackOverlay.ts (existing pattern)
function syncSlider() {
  const ctrl = getAnimationController()
  if (ctrl && !appStore.getState().isScrubbing) {
    const dur = ctrl.getDuration()
    if (dur > 0) {
      slider.value = String(ctrl.getTime())
    }
  }
  rafId = requestAnimationFrame(syncSlider)
}
rafId = requestAnimationFrame(syncSlider)
```

**For active step highlighting:** Same pattern — RAF loop reads `ctrl.getTime()`, computes step index from normalized time, and updates the form guide DOM.

### Pattern 4: Panel Collapse via CSS Class Toggle

**What:** Collapsed panels use a CSS class (`hidden` or a custom transition class) toggled by store state. The center panel grows via `flex-1` naturally.

**Implementation approach:**
```typescript
// In main.ts or a new ui/PanelControls.ts
appStore.subscribe((state) => {
  const left = document.getElementById('panel-left')!
  left.classList.toggle('hidden', state.leftPanelCollapsed)
})
```

```html
<!-- index.html: add transition for smooth collapse (Claude's Discretion) -->
<aside id="panel-left" class="w-64 bg-bg flex flex-col shrink-0 transition-all">
```

### Anti-Patterns to Avoid

- **Resetting OrbitControls on exercise switch:** The user's camera angle must be preserved. `loadExercise()` must NOT call `setCameraPreset()` or reset `controls.target`. Only the `init()` function sets the initial camera. Exception: CONTEXT.md says "default camera angle is front-facing when an exercise first loads" — this means at initial page load, not on every exercise switch.
- **Rebuilding the entire DOM on store subscription when only part changed:** `ExerciseSelector.render()` rebuilds all buttons on every store change. For Phase 2 this is acceptable (5 exercises), but avoid this pattern for larger lists.
- **Using CSS `display:none` on the center panel canvas:** The canvas must always be in the DOM and rendering. Only side panels are collapsed.
- **Storing animation time in the Zustand store:** Animation time changes every frame (60fps). Putting it in the store causes 60 state updates per second and is a performance anti-pattern. Use RAF loops and `getAnimationController()` directly.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Mouse rotate + zoom | Custom pointer event handlers | `OrbitControls` (already wired) | Handles touch, multi-button, zoom limits, damping, polar angle limits |
| Animation time → step mapping | Complex time bucketing logic | Simple `Math.floor(normalizedTime * stepCount)` | Linear distribution is sufficient for Phase 2; step timing metadata can be added in Phase 4 if needed |
| Panel width animation | Custom JS animation with `requestAnimationFrame` | Tailwind `transition-all` + `hidden`/`w-0` CSS class | CSS transitions are GPU-composited and simpler to implement |
| Store reactivity | Manual event listeners or global variables | `appStore.subscribe()` (already used throughout) | Consistent with existing patterns; automatic batching |

**Key insight:** This phase adds UI refinements on top of a working foundation. Every temptation to "rebuild it cleanly" should be resisted — the existing code works, the architecture is sound, and the build is clean.

---

## Common Pitfalls

### Pitfall 1: Camera Reset on Exercise Switch

**What goes wrong:** Adding `setCameraPreset('front')` inside `loadExercise()` resets the user's viewing angle every time they click a different exercise.

**Why it happens:** CONTEXT.md says "Default camera angle is front-facing when an exercise **first loads**" — which means page load, not every exercise switch. A second decision says "Camera keeps the user's current angle when switching exercises (no reset)." These are not contradictory — initial load = front, subsequent switches = keep angle.

**How to avoid:** Call `setCameraPreset('front')` only in `init()`, not in `loadExercise()`. The `init()` call already sets `camera.position.set(0, 1.0, 3.0)` which is effectively the front view.

**Warning signs:** If the camera snaps back to front on every exercise click, `setCameraPreset` was called in `loadExercise`.

### Pitfall 2: Active Step Index Out of Sync With Animation Loop

**What goes wrong:** Active step highlighting flashes or gets stuck at the last step because normalized time calculation doesn't account for loop restart.

**Why it happens:** `AnimationController.getTime()` returns the raw time in seconds (0 to duration). After one full loop it wraps back to 0. Dividing by duration gives 0.0–1.0. Step index = `Math.floor(normalized * stepCount)` will be in range `[0, stepCount-1]` as long as normalized never reaches exactly 1.0 (it goes 0.0 → ~0.99, then resets to ~0.0).

**How to avoid:**
```typescript
const normalized = ctrl.getTime() / ctrl.getDuration()  // 0.0 to <1.0
const stepIndex = Math.min(
  Math.floor(normalized * stepCount),
  stepCount - 1
)
```
Clamping with `Math.min(..., stepCount - 1)` handles the edge case where `normalized` briefly equals 1.0.

**Warning signs:** Step highlighting jumps to step 0 or stepCount unexpectedly.

### Pitfall 3: Panel Collapse Breaks Renderer Resize

**What goes wrong:** Collapsing a side panel changes `#panel-center`'s width, but the renderer doesn't resize because `ResizeObserver` has a brief delay.

**Why it happens:** The `ResizeObserver` on `#panel-center` in `renderer.ts` will fire when the center panel width changes — this is correct and sufficient. However, if the collapse uses `CSS transition`, the ResizeObserver fires on every intermediate frame during the animation, causing many `renderer.setSize()` calls.

**How to avoid:** This is acceptable behavior — `renderer.setSize()` is cheap. The ResizeObserver approach already handles this correctly. No special handling needed.

**Warning signs:** If collapse is instant (no transition), the ResizeObserver fires once. If animated, it fires many times — both are fine.

### Pitfall 4: Form Guide innerHTML Replacement Breaks Active Step Highlighting

**What goes wrong:** If `mountFormGuide` continues to call `container.innerHTML = ...` (full re-render) on store subscription, and the active step highlighting is done by mutating specific `<li>` elements in a RAF loop, the RAF loop's element references become stale after the next exercise switch.

**Why it happens:** `innerHTML =` destroys all child DOM nodes and creates new ones. Any stored references to `<li>` elements from before the re-render point to detached, garbage-collectible nodes.

**How to avoid:** Two approaches:
1. Rebuild the step element references inside the RAF loop after each exercise switch (check `selectedExerciseId` changed, then re-query the DOM).
2. Separate "exercise metadata" (name, steps, mistakes) from "active step" highlighting — the metadata section re-renders on exercise switch, the highlighting only touches class names on existing elements.

Approach 2 is cleaner. The form guide should render the full step list on exercise switch (using `innerHTML`), then the RAF loop should only query `container.querySelectorAll('li')` and apply a class — without storing element references across exercise switches.

### Pitfall 5: Zustand v5 API Confusion

**What goes wrong:** Importing from `zustand` instead of `zustand/vanilla` for the vanilla (non-React) store.

**Why it happens:** Zustand v5 split React and vanilla APIs. `createStore` must come from `zustand/vanilla`.

**How to avoid:** Follow the existing pattern in `src/core/store.ts` — always `import { createStore } from 'zustand/vanilla'`. If adding new state, add it to the existing `AppState` interface and `appStore`, do not create a second store.

---

## Code Examples

Verified patterns from the existing codebase:

### Adding State to AppState (for panel collapse)
```typescript
// Source: src/core/store.ts (extend existing pattern)
export interface AppState {
  // ... existing fields ...
  leftPanelCollapsed: boolean
  rightPanelCollapsed: boolean
  setLeftPanelCollapsed: (v: boolean) => void
  setRightPanelCollapsed: (v: boolean) => void
}

export const appStore = createStore<AppState>((set) => ({
  // ... existing state ...
  leftPanelCollapsed: false,
  rightPanelCollapsed: false,
  setLeftPanelCollapsed: (v) => set({ leftPanelCollapsed: v }),
  setRightPanelCollapsed: (v) => set({ rightPanelCollapsed: v }),
}))
```

### Collapsible Panel DOM Pattern
```typescript
// Source: pattern derived from existing ExerciseSelector.ts + store.ts
// Mount in main.ts or a new src/ui/PanelControls.ts
export function mountPanelControls(): void {
  const panelLeft = document.getElementById('panel-left')!
  const panelRight = document.getElementById('panel-right')!

  appStore.subscribe((state) => {
    panelLeft.classList.toggle('hidden', state.leftPanelCollapsed)
    panelRight.classList.toggle('hidden', state.rightPanelCollapsed)
  })
}
```

### Left-Border Active Indicator (Exercise Selector)
```typescript
// Source: src/ui/ExerciseSelector.ts — replace current active class
btn.className =
  'w-full text-left px-3 py-2 text-sm transition-colors ' +
  (id === selectedExerciseId
    ? 'border-l-2 border-accent text-accent font-medium pl-2.5'  // left border
    : 'border-l-2 border-transparent text-white/70 hover:text-white hover:bg-white/5')
```

### Animation-Synchronized Active Step
```typescript
// Source: pattern derived from PlaybackOverlay.ts RAF loop
// Add inside mountFormGuide or a separate RAF that queries live DOM
function syncActiveStep() {
  const ctrl = getAnimationController()
  const { selectedExerciseId } = appStore.getState()
  const exercise = getExercise(selectedExerciseId)
  const steps = container.querySelectorAll<HTMLLIElement>('ol li')

  if (ctrl && steps.length > 0) {
    const dur = ctrl.getDuration()
    const normalized = dur > 0 ? ctrl.getTime() / dur : 0
    const activeIndex = Math.min(
      Math.floor(normalized * steps.length),
      steps.length - 1
    )
    steps.forEach((li, i) => {
      li.classList.toggle('text-white', i === activeIndex)
      li.classList.toggle('text-white/80', i !== activeIndex)
    })
  }

  requestAnimationFrame(syncActiveStep)
}
requestAnimationFrame(syncActiveStep)
```

### "Exercises" Header in Left Panel
```html
<!-- Source: index.html — add header inside #panel-left -->
<aside id="panel-left" class="w-64 bg-bg flex flex-col shrink-0">
  <header class="px-4 py-3">
    <h1 class="text-lg font-semibold tracking-tight">FormCheck</h1>
  </header>
  <div class="px-4 pt-3 pb-1">
    <span class="text-xs font-medium text-white/40 uppercase tracking-wider">Exercises</span>
  </div>
  <nav id="exercise-list" class="flex-1 overflow-y-auto p-2"></nav>
</aside>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Phase 2 starts from scratch | Phase 2 starts from complete working implementation | Commits: 9b7e0eb, 54f21f0, b90aa01, f5df23c, b5df4f1 | Phase 2 plan is gap-analysis + 3 targeted additions, not full build |
| Tailwind v3 `theme()` config | Tailwind v4 `@theme {}` CSS block | Tailwind v4 (installed) | Custom tokens defined in style.css, not tailwind.config.js |
| React-based Zustand | Vanilla Zustand (zustand/vanilla) | Explicit decision pre-Phase 1 | No React dependency; `createStore` not `create`; no hooks |
| `copyFileSync` for Draco decoder | `cpSync(recursive:true)` | Decision [01-01] | Required for gltf/ subdirectory on Windows |

**Deprecated/outdated:**
- None relevant to Phase 2 work.

---

## Gap Analysis: CONTEXT.md Decisions vs. Current Implementation

This is the core of Phase 2 planning. Maps each CONTEXT.md decision to implementation status.

| Decision | Status | Gap |
|----------|--------|-----|
| Viewer-dominant proportions (60/20/20) | DONE — flex-1 center, w-64 left, w-72 right | None |
| Side panels collapsible | NOT DONE | Add state + toggle button + class toggle |
| No borders between panels | DONE — unified bg-bg, no border classes | None |
| Dark theme throughout | DONE — bg-bg = #1a1a1a | None |
| Exercise list: text only, name only | DONE — `btn.textContent = exercise.name` | None |
| Active: colored left border | NOT DONE — currently uses bg-accent/20 background highlight | Change active class in ExerciseSelector.ts |
| "Exercises" header label | NOT DONE — only app title "FormCheck" exists | Add label in index.html or ExerciseSelector |
| Numbered sequential form steps | DONE — `<ol class="list-decimal...">` | None |
| Active step highlights in sync with animation | NOT DONE | New RAF loop in FormGuide |
| Common mistakes below steps, separate section | DONE — two `<section>` elements | None |
| Right panel scrolls independently | DONE — `overflow-y-auto` on #form-guide | None |
| Play/pause below canvas (video-player style) | DONE — absolute bottom-4 overlay | None |
| Default camera front-facing on first load | DONE — camera.position.set(0, 1.0, 3.0) in renderer.ts | None |
| Instant swap, no fade | DONE — synchronous loadExercise | None |
| Camera keeps angle when switching exercises | DONE — controls not reset in loadExercise | None |

**Summary: 3 gaps to close:**
1. Collapsible side panels (left and right)
2. Left-border active exercise indicator + "Exercises" header
3. Animation-synchronized active step highlighting in form guide

---

## Open Questions

1. **Active step distribution across animation time**
   - What we know: The form guide has 3–5 steps per exercise. The animation runs on a fixed duration (e.g., squat is 3.0 seconds). The CONTEXT.md decision says steps highlight "in sync with the animation phase as it plays."
   - What's unclear: Does each step get equal time share (linear distribution), or should specific animation phases be mapped to specific steps?
   - Recommendation: Use linear distribution for Phase 2 (equal time share). This is the simplest correct approach and can be refined in Phase 4 when animation phases are more richly defined. No step-timing metadata needs to be added to `ExerciseDefinition` for Phase 2.

2. **Collapse button placement and design**
   - What we know: CONTEXT.md leaves this to Claude's Discretion.
   - What's unclear: Should it be a chevron `‹` `›` at the panel edge, an arrow button in the control bar, or a toggle in the header?
   - Recommendation: Small chevron/arrow button at the inner edge of each side panel (e.g., top-right of left panel, top-left of right panel). This is the most discoverable and least obtrusive pattern. Alternatively, a thin "grip bar" at the panel boundary is conventional.

3. **Camera reset behavior clarification**
   - What we know: "Default camera angle is front-facing when an exercise first loads" and "Camera keeps the user's current angle when switching exercises."
   - What's unclear: "First loads" could mean (a) first time any exercise loads (page load), or (b) each time an individual exercise is loaded for the first time in a session.
   - Recommendation: Interpret as page load only. The camera position is already set to front in `renderer.ts` (`camera.position.set(0, 1.0, 3.0)`). Do not reset camera in `loadExercise()`. This matches the "keep angle on switch" decision.

---

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection — all files in `D:/Forms/src/` read and analyzed
- `git log --oneline` and `git show --stat` for all commits since Phase 1 start — verified what was built and when
- `npm run build` — verified clean TypeScript + Vite build with zero errors
- `D:/Forms/.planning/phases/01-foundation/01-VERIFICATION.md` — Phase 1 completion evidence

### Secondary (MEDIUM confidence)
- Tailwind v4 `@theme` pattern verified in `src/style.css` — `border-l-2` and `border-{color}` utilities confirmed as Tailwind v4 standard utilities

### Tertiary (LOW confidence)
- None — all findings verified against actual codebase

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries verified from package.json and actual import usage
- Architecture: HIGH — derived from direct inspection of existing working code
- Pitfalls: HIGH — derived from code structure analysis and known Three.js + Zustand patterns
- Gap analysis: HIGH — derived from direct comparison of CONTEXT.md decisions vs. source code

**Research date:** 2026-02-24
**Valid until:** 2026-03-24 (stable stack — no fast-moving dependencies)

**Critical finding:** Phase 2 is ~80% implemented. The three gaps (collapsible panels, left-border active indicator, active step sync) are all UI-layer additions. No new libraries needed. No Three.js changes needed. The existing architecture handles all three patterns cleanly.
