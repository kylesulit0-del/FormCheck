# Phase 3: Playback Controls - Context

**Gathered:** 2026-02-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Users have full control over how they watch the animation — speed selection, frame-by-frame timeline scrubbing, and camera angle presets — enabling detailed form study. This phase adds controls to the existing control bar below the 3D viewer.

</domain>

<decisions>
## Implementation Decisions

### Speed control
- Segmented buttons showing [0.5x] [1x] [2x] — one tap to switch
- Three speed values: 0.5x (slow), 1x (normal), 2x (fast)
- Active speed button gets a filled/highlighted background; inactive buttons are subtle/outlined
- Default speed on page load is 1x (normal)

### Camera presets
- Four preset angles: Front, Left, Right, Back
- Camera smoothly animates to preset position (~300ms transition)
- Preset buttons placed in the control bar alongside other controls
- Buttons use icons (not text labels) representing each view angle

### Timeline scrubber
- Thin horizontal progress bar with a draggable thumb — like YouTube's seekbar
- When the user releases the scrubber, animation resumes playing from that position automatically
- Filled portion uses the accent color; unfilled portion is muted/gray
- No tooltip or time indicator while dragging — just the visual position on the bar

### Control bar layout
- Single row layout: Play/Pause | Timeline | Speed | Camera presets (left to right)
- Timeline bar stretches to fill all remaining space between controls (flex fill)
- Control bar has a subtle background — slightly different shade from the viewer area to define it

### Claude's Discretion
- Exact icon designs for camera preset buttons
- Scrubber thumb size and hover states
- Control bar padding and spacing
- Animation easing curve for camera transitions

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

*Phase: 03-playback-controls*
*Context gathered: 2026-02-24*
