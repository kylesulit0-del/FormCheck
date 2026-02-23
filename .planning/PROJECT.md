# FormCheck — 3D Exercise Form Guide

## What This Is

A public-facing website where anyone can browse exercises and watch a 3D humanoid figure perform each movement on loop. Users can rotate, zoom, pause, and control playback while reading step-by-step form instructions alongside the animation. The site starts with ~5 foundational exercises and is designed so new movements can be added through a straightforward dev workflow.

## Core Value

A user picks an exercise and immediately sees a clear, interactive 3D demonstration of proper form — from any angle, at any speed.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Single-page dark-themed layout with movement selector (left), 3D viewer (center), form guide (right)
- [ ] 3D humanoid mannequin figure performing selected movement on loop
- [ ] Orbit controls (click-drag to rotate, scroll to zoom)
- [ ] Play/pause animation control
- [ ] Playback speed control (slow-mo, normal, fast)
- [ ] Camera angle presets (front, side, back)
- [ ] Movement selector panel listing available exercises
- [ ] Step-by-step form instructions for each movement
- [ ] "What not to do" / common mistakes section for each movement
- [ ] ~5 starter movements: squat, bench press, pushup, deadlift, plank
- [ ] Programmatic or innovative approach to generating 3D movement animations (not dependent on pre-made mocap files)
- [ ] Clear dev workflow for adding new movements without major code changes
- [ ] Static deployment (Vercel/Netlify — no backend)

### Out of Scope

- User accounts / authentication — not needed for v1
- CMS / admin panel for managing movements — dev workflow is sufficient
- Complex sport-specific movements (boxing jab, basketball layup) — v2 after the animation pipeline is proven
- Mobile-native app — web-first, responsive later
- Video content — 3D models only
- Social features (sharing, comments) — not the focus

## Context

- The hardest technical challenge is generating believable 3D animations for arbitrary exercises. Pre-made mocap/animation files don't exist for many movements. Research is needed to find a creative approach — possibilities include procedural animation from joint keyframe data, AI motion synthesis, or a hybrid approach.
- Form instruction content will be sourced from fitness databases, APIs, or curated reference sources — not manually written.
- The 3D viewer will likely use Three.js or a similar WebGL library for browser-based 3D rendering.
- The site is a single page — no routing needed. All interaction happens on one screen.

## Constraints

- **Deployment**: Static hosting only (no server-side processing at runtime)
- **Animation**: Must work without purchasing/licensing commercial mocap libraries
- **Browser**: Must run smoothly in modern browsers with WebGL support
- **Content**: Form instructions must be accurate and sourced, not fabricated

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Static deployment (no backend) | Simplicity, cost, speed — content is read-only | — Pending |
| ~5 movements for v1 | Prove the concept and animation pipeline before scaling | — Pending |
| Dev workflow for extensibility (not CMS) | Lower complexity, sufficient for early growth | — Pending |
| Programmatic animation generation | Pre-made files don't exist for most movements | — Pending |

---
*Last updated: 2026-02-23 after initialization*
