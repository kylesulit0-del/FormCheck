---
phase: 02-3d-viewer-core
plan: 01
subsystem: ui
tags: [exercise-selector, panel-collapse, form-guide, animation-sync, zustand]
dependency_graph:
  requires: []
  provides: [collapsible-panels, left-border-active-indicator, exercises-header, animation-step-sync]
  affects: [src/ui/ExerciseSelector.ts, src/ui/FormGuide.ts, src/core/store.ts, src/main.ts, index.html, src/style.css]
tech_stack:
  added: []
  patterns: [RAF-animation-sync, zustand-panel-state, css-transition-collapse]
key_files:
  created: []
  modified:
    - src/ui/ExerciseSelector.ts
    - src/ui/FormGuide.ts
    - src/core/store.ts
    - src/main.ts
    - index.html
    - src/style.css
decisions:
  - Active exercise indicator uses border-l-2 border-accent left border (not background highlight) — CONTEXT.md locked decision
  - Panel collapse uses CSS width/opacity/padding transitions (200ms) with Zustand store state
  - Toggle buttons placed inside #panel-center as absolute-positioned elements — remain visible when panels collapsed
  - Form guide step sync reads AnimationController time via RAF (not Zustand) — avoids storing per-frame animation time in store
  - DOM re-queried every RAF frame instead of caching — prevents stale references after exercise switch (innerHTML replacement)
  - Math.min clamp on activeIndex prevents flicker at loop boundary when normalized time briefly hits 1.0
metrics:
  duration: 2 min
  completed_date: 2026-02-24
  tasks_completed: 3
  files_modified: 6
---

# Phase 2 Plan 01: UI Gap Closure Summary

**One-liner:** Left-border active exercise indicator, collapsible side panels, and animation-synchronized form guide step highlighting close the three remaining Phase 2 UI gaps.

## What Was Built

All three Phase 2 CONTEXT.md locked decisions that were not yet implemented:

1. **"Exercises" header + left-border active indicator** — Added a section label above the exercise list and replaced the `bg-accent/20` background highlight with a `border-l-2 border-accent` left border. Inactive items use `border-transparent` to maintain consistent text alignment.

2. **Collapsible side panels** — Both left and right panels can be collapsed via toggle buttons in the viewer corners. State is managed in Zustand (`leftPanelCollapsed`, `rightPanelCollapsed`). CSS `transition: width 200ms ease` animates the collapse. The center Three.js renderer's existing `ResizeObserver` automatically handles canvas resize when panels collapse.

3. **Animation-synchronized form guide steps** — A `requestAnimationFrame` loop in `FormGuide.ts` reads the current animation time from `AnimationController` via `getAnimationController()` each frame, computes the active step index via linear distribution, and toggles `text-white font-medium` / `text-white/80` classes accordingly. Clamping prevents flicker at loop boundaries.

## Commits

| Task | Description | Commit |
|------|-------------|--------|
| 1 | Exercise selector left-border indicator and Exercises header | 035e24b |
| 2 | Collapsible side panels with store state and toggle buttons | 1e14323 |
| 3 | Animation-synchronized active step highlighting in form guide | dedb8ed |

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED

All modified files exist. All 3 task commits verified in git log (035e24b, 1e14323, dedb8ed).
