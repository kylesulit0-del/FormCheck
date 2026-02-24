# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-23)

**Core value:** A user picks an exercise and immediately sees a clear, interactive 3D demonstration of proper form — from any angle, at any speed.
**Current focus:** Phase 2 — 3D Viewer Core

## Current Position

Phase: 2 of 5 (3D Viewer Core)
Plan: 1 of 1 in current phase (PHASE COMPLETE)
Status: Phase 2 complete — ready for Phase 3
Last activity: 2026-02-24 — Completed 02-01-PLAN.md (UI gaps: left-border indicator, collapsible panels, animated step highlighting)

Progress: [████░░░░░░] 27% (4 of 15 estimated plans)

## Performance Metrics

**Velocity:**
- Total plans completed: 4
- Average duration: 3 min
- Total execution time: 0.20 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 - Foundation | 3/3 | 9 min | 3 min |
| 2 - 3D Viewer Core | 1/1 | 2 min | 2 min |

**Recent Trend:**
- Last 5 plans: 2-3 min
- Trend: consistent

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Pre-Phase 1]: Skeleton source must be frozen before any animation authoring — mixing sources causes silent bone name mismatches
- [Pre-Phase 1]: Draco compression via gltf-transform must be part of the asset pipeline from day one — retrofitting breaks model-animation name relationships
- [Pre-Phase 1]: Hybrid animation approach: Mixamo GLBs for v1 exercises, QuaternionKeyframeTrack programmatic fallback for exercises without Mixamo equivalents
- [Pre-Phase 1]: No React — vanilla Three.js + Vite + TypeScript + Tailwind v4 + Zustand (no React dependency)
- [01-01]: Use @gltf-transform/core for programmatic GLB generation (not Three.js GLTFExporter) — Node.js compatible, no DOM dependency
- [01-01]: fs.cpSync(recursive:true) for Draco decoder copy — handles gltf/ subdirectory that fs.copyFileSync fails on Windows
- [01-01]: Barbell geometry along X-axis: center bar 1.8m, plates +-0.82m, collars +-0.60m from origin
- [01-02]: Mannequin pelvis at y=0.97 so feet land near y=0 — total height ~1.75m
- [01-02]: Shoulder joints at chest level (no clavicle bone) — simpler hierarchy adequate for exercise animations
- [01-02]: JointName enum values are the animation contract — Object3D.name must match exactly, never rename after Phase 1
- [01-03]: AnimationController uses its own THREE.Clock (not shared with render loop) — avoids accumulated delta drift
- [01-03]: buildAnimation(rig) receives full MannequinRig — extensible for future IK or equipment placement without interface break
- [01-03]: Pelvis+spine rotation drives squat depth (not Y-translation) — keeps feet planted without IK
- [02-01]: Active exercise indicator uses border-l-2 border-accent left border (not background highlight) — CONTEXT.md locked decision
- [02-01]: Panel collapse uses CSS width/opacity/padding transitions (200ms) with Zustand store state; toggle buttons float in viewer corners
- [02-01]: Form guide step sync reads AnimationController time via RAF (not Zustand) — avoids storing per-frame animation time in store
- [02-01]: DOM re-queried every RAF frame instead of caching — prevents stale references after exercise switch (innerHTML replacement)

### Pending Todos

None.

### Blockers/Concerns

- Mixamo commercial license: Confirm current Adobe terms cover FormCheck's public website use case before Phase 4 content authoring
- [RESOLVED 01-03]: Programmatic animation quality ceiling — first exercise (squat) authored end-to-end; pipeline validated, effort is low (~30 min/exercise for new keyframe sets)

## Session Continuity

Last session: 2026-02-24
Stopped at: Completed 02-01-PLAN.md — UI gap closure (left-border indicator, collapsible panels, animation step sync). Phase 2 complete.
Resume file: None
