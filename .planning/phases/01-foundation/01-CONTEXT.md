# Phase 1: Foundation - Context

**Gathered:** 2026-02-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Project scaffold, asset pipeline, exercise registry, and static deployment setup. This phase delivers the technical substrate — data shape, mannequin model, animation system, and build tooling — so all subsequent phases build on a frozen foundation.

</domain>

<decisions>
## Implementation Decisions

### Mannequin Model
- Smooth mannequin style — featureless face, smooth body, store-mannequin aesthetic
- Light gray matte material against dark background
- Neutral/androgynous build — no gendered features, generic human proportions
- Model must be generated programmatically by Claude Code — not sourced from a pre-made asset library
- Must support muscle highlighting in Phase 4 (segmented mesh or per-material approach needed)

### Animation Approach
- Fully programmatic — define joint angles/positions in code, no Mixamo or external animation tools
- Biomechanically accurate motion — correct joint angles, realistic speed curves, sports science quality
- Loop style: single rep + reset — one full rep, model returns to neutral position, brief pause, repeats
- Ghost equipment for exercises that need it (bench press barbell, deadlift barbell) — faint outline visible but not distracting
- Smooth interpolation required — no robotic/linear keyframe motion

### Exercise Data Shape
- Flat list for v1 selector — no categories, just 5 exercises listed
- Primary + secondary muscles tracked per exercise (e.g., squat = quads, glutes + hamstrings, core)
- Difficulty/experience level field included in schema but not displayed in v1 — ready for future use
- Form instructions: 3-5 concise steps per exercise — short, punchy coaching cues
- Common mistakes: at least 2 per exercise

### Dev Workflow
- Process optimized for Claude Code as the primary author of new exercises
- Both automated tests (data shape validation, animation playback) and visual checking for quality
- In-repo written guide (CONTRIBUTING.md or similar) with step-by-step instructions for adding an exercise
- File/config structure: Claude's discretion — whatever's cleanest for the codebase

### Claude's Discretion
- Exercise file organization (one file per exercise, config + assets, etc.)
- Exact TypeScript interface fields beyond the discussed ones
- Animation keyframe data format (JSON arrays, inline objects, etc.)
- Ghost equipment rendering approach
- Specific testing framework and test patterns
- Build tooling choices (Vite version, etc.)

</decisions>

<specifics>
## Specific Ideas

- Mannequin should look like a department store mannequin — smooth, clean, featureless but clearly human-shaped
- Ghost equipment should be barely visible — think wireframe or 10-20% opacity outline
- Animation should feel like watching a sports science reference video, not a game character
- The guide for adding exercises should be clear enough that asking Claude Code "add a lunge exercise" produces a working result

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-02-23*
