# Phase 2: 3D Viewer Core - Context

**Gathered:** 2026-02-24
**Status:** Ready for planning

<domain>
## Phase Boundary

A user visiting the site sees a humanoid mannequin performing an exercise on loop in a three-panel layout, can rotate and zoom the model, and can pause and resume the animation. Users can click any exercise in the left panel to switch to it.

</domain>

<decisions>
## Implementation Decisions

### Panel layout
- Viewer-dominant proportions: center viewer ~60% width, side panels ~20% each
- Side panels are collapsible to give the viewer full width
- No borders between panels — spacing and background shifts define regions
- Dark theme throughout — makes the 3D model pop

### Exercise selector (left panel)
- Simple text list of exercise names — minimal, clean
- Active exercise indicated by a colored left border / highlight bar
- Name only per exercise — no extra metadata
- "Exercises" header label above the list

### Form guide display (right panel)
- Numbered sequential steps: 1. Stand with feet... 2. Grip the bar...
- Active step highlights in sync with the animation phase as it plays
- Common mistakes section displayed below the steps as a separate section
- Right panel scrolls independently — 3D viewer stays fixed in center

### Viewer controls
- Play/pause controls in a control bar below the 3D canvas (video-player style)
- Default camera angle is front-facing when an exercise first loads
- Instant swap when switching exercises — no fade transition
- Camera keeps the user's current angle when switching exercises (no reset)

### Claude's Discretion
- Exact collapse/expand button design and placement for side panels
- Loading states and empty states
- Exact spacing, typography, and color palette within the dark theme
- Control bar additional elements (if any) beyond play/pause

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-3d-viewer-core*
*Context gathered: 2026-02-24*
