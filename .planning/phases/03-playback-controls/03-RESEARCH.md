# Phase 3: Playback Controls - Research

**Researched:** 2026-02-24
**Domain:** Vanilla TypeScript UI — control bar layout, timeline scrubbing, speed controls, camera animation
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Speed control**
- Segmented buttons showing [0.5x] [1x] [2x] — one tap to switch
- Three speed values: 0.5x (slow), 1x (normal), 2x (fast)
- Active speed button gets a filled/highlighted background; inactive buttons are subtle/outlined
- Default speed on page load is 1x (normal)

**Camera presets**
- Four preset angles: Front, Left, Right, Back
- Camera smoothly animates to preset position (~300ms transition)
- Preset buttons placed in the control bar alongside other controls
- Buttons use icons (not text labels) representing each view angle

**Timeline scrubber**
- Thin horizontal progress bar with a draggable thumb — like YouTube's seekbar
- When the user releases the scrubber, animation resumes playing from that position automatically
- Filled portion uses the accent color; unfilled portion is muted/gray
- No tooltip or time indicator while dragging — just the visual position on the bar

**Control bar layout**
- Single row layout: Play/Pause | Timeline | Speed | Camera presets (left to right)
- Timeline bar stretches to fill all remaining space between controls (flex fill)
- Control bar has a subtle background — slightly different shade from the viewer area to define it

### Claude's Discretion
- Exact icon designs for camera preset buttons
- Scrubber thumb size and hover states
- Control bar padding and spacing
- Animation easing curve for camera transitions

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| VIEW-04 | User can change playback speed (slow-mo, normal, fast) | Speed store state already exists (`playbackSpeed`); `AnimationController.setSpeed()` already exists; needs speed buttons wired in the new control bar layout |
| VIEW-05 | User can switch between camera angle presets (front, side, back) | `setCameraPreset()` in `cameraPresets.ts` exists but snaps immediately; needs smooth ~300ms interpolation added; also needs Left preset added (current code only has front/side/back with "side" meaning right-side); needs icon buttons not text |
| VIEW-06 | User can scrub through the animation timeline frame-by-frame via a slider | `AnimationController.setTime()` / `getTime()` / `getDuration()` all exist; `isScrubbing` store state exists; needs a custom-styled timeline that replaces the native `<input type="range">` with visual filled/unfilled track matching the accent color spec |
</phase_requirements>

---

## Summary

Phase 3 is almost entirely a **UI rebuild of the existing `PlaybackOverlay.ts`**. The backing infrastructure (AnimationController, Zustand store, cameraPresets module) was built during Phases 1–2 and already exposes exactly what Phase 3 needs. The core implementation work is: (1) redesigning the control bar as a single bottom row in `index.html`, (2) implementing camera smooth animation instead of the current snap, (3) replacing the native `<input type="range">` with a custom-styled slider, (4) adding icon-based camera preset buttons with a Left preset, and (5) styling the control bar with a distinct background.

The critical insight is that the current `PlaybackOverlay.ts` already implements all three features (speed buttons, camera presets, timeline scrubber) but in the wrong visual layout (two rows, floating overlay) and with missing spec details (camera snaps instead of animating, native slider not styled to spec, no Left preset, text labels instead of icons). Phase 3 is a targeted rework, not a greenfield build.

The one genuinely new technical problem is **smooth camera animation**. The current `setCameraPreset()` snaps the camera with `camera.position.set()` + `controls.update()`. Achieving a ~300ms smooth interpolation requires either a per-frame lerp driven by the existing render loop, or GSAP/Tween.js. Given the project's no-React constraint and preference for minimal dependencies, a lightweight lerp approach inside the render loop `onTick` is the right fit.

**Primary recommendation:** Rebuild `PlaybackOverlay.ts` into a control bar anchored to the bottom of `#panel-center` in HTML, with camera animation via lerp in the main render loop's `onTick`, and a custom CSS-styled range input for the timeline.

---

## Standard Stack

### Core (already installed — no new installs needed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| three | ^0.172.0 | Camera position lerp via `Vector3.lerp()` | Already in project; `THREE.Vector3.lerp()` is the correct tool for smooth camera position interpolation |
| zustand/vanilla | ^5.0.3 | Speed and scrubbing state (`playbackSpeed`, `isScrubbing`) | Already in project; store already has all required Phase 3 state fields |
| TypeScript + Vite | project stack | Module authoring | Already in project |
| Tailwind v4 | ^4.0.6 | Control bar styling | Already in project; `bg-surface`, `border-white/10`, `accent-accent` tokens already defined |

### No New Dependencies Required

All Phase 3 features can be implemented with what is already installed:
- Camera lerp: `THREE.Vector3.lerp()` in `onTick` callback — no animation library needed
- Custom slider: CSS-styled `<input type="range">` with `accent-color` and pseudo-element styling — no slider library needed
- Icons: Unicode symbols or inline SVG — no icon library needed

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Manual lerp in onTick | GSAP or Tween.js | GSAP adds ~30KB; lerp in onTick is already wired to the Three.js clock and has zero overhead. For a single camera animation, manual lerp is the right call. |
| CSS-styled `<input type="range">` | noUiSlider, rc-slider | External slider libraries add dependencies and are designed for React/DOM frameworks. The native input styled with CSS `accent-color` + pseudo-elements achieves the YouTube seekbar look with no added weight. |
| Unicode icons | Lucide SVG, Phosphor icons | Icon libraries add CDN or build weight. Unicode arrows (◀ ▶ ↑) or thin inline SVGs work well at small control bar sizes. |

---

## Architecture Patterns

### Recommended Project Structure (what changes in Phase 3)

```
src/
├── core/
│   └── cameraPresets.ts     # MODIFY: add smooth lerp animation, add Left preset
├── ui/
│   └── PlaybackOverlay.ts   # MODIFY: restructure to control bar layout, icon buttons
├── main.ts                   # MODIFY: connect lerp animation to onTick
└── index.html                # MODIFY: add control bar container outside/below panel-center
```

The store (`store.ts`) already has all required state. No new files are needed unless the camera animation state grows complex enough to warrant a separate module.

### Pattern 1: Single-Row Control Bar in HTML

**What:** The control bar is a `<div>` anchored below `#panel-center` in the page flex layout, not an absolutely-positioned overlay inside the viewer. This gives it a distinct background and proper layout without z-index fighting.

**When to use:** When a control row needs to span the full viewer width and have a background that separates it from the canvas.

**Example:**
```html
<!-- index.html — between #panel-center and the right aside -->
<!-- Wraps center column in a flex-col container -->
<div class="flex-1 flex flex-col min-w-0">
  <main id="panel-center" class="flex-1 relative min-w-0">
    <!-- canvas and toggle buttons -->
  </main>
  <div id="control-bar" class="flex items-center gap-3 px-4 py-2 bg-surface border-t border-white/5 shrink-0">
    <!-- Play/Pause | Timeline (flex-1) | Speed buttons | Camera presets -->
  </div>
</div>
```

The timeline gets `flex-1` so it fills remaining space. Speed buttons and camera presets are fixed-width groups.

### Pattern 2: Camera Smooth Lerp in onTick

**What:** Store a target camera position. Each frame in `onTick`, lerp the current camera position toward the target. When the distance is below a threshold, snap to exact position and stop lerping.

**When to use:** Any time you need smooth camera movement without adding a tween library.

**Example:**
```typescript
// In cameraPresets.ts

let _targetPosition: THREE.Vector3 | null = null
const LERP_SPEED = 1 - Math.pow(0.001, 1/60) // ~300ms exponential decay

export function setCameraPreset(name: PresetName): void {
  if (!_controls || !_camera) return
  const p = presets[name]
  _targetPosition = new THREE.Vector3(p.x, p.y, p.z)
  _controls.target.set(0, 0.9, 0)
}

/** Called each frame from main.ts onTick */
export function tickCameraAnimation(): void {
  if (!_targetPosition || !_camera || !_controls) return
  _camera.position.lerp(_targetPosition, LERP_SPEED)
  if (_camera.position.distanceTo(_targetPosition) < 0.001) {
    _camera.position.copy(_targetPosition)
    _targetPosition = null
  }
  _controls.update()
}
```

`main.ts` `onTick` already calls `controls.update()` — adding `tickCameraAnimation()` alongside it is minimal.

**Easing note:** Exponential lerp (`pos.lerp(target, factor)` each frame) produces a natural ease-out that front-loads movement and gently arrives at the target. For ~300ms at 60fps (~18 frames), a factor of ~0.18 per frame achieves this. Exact feel is Claude's discretion per CONTEXT.md.

### Pattern 3: Custom-Styled Range Input (YouTube Seekbar Look)

**What:** Use a native `<input type="range">` but override appearance with CSS to achieve the filled/unfilled track with accent color. Key: use `accent-color` CSS property plus a background gradient that updates via JavaScript to show the filled portion.

**When to use:** When you need a styled seekbar without a slider library.

**Example:**
```typescript
// In PlaybackOverlay.ts — RAF sync loop updates the fill gradient
function updateSliderFill(slider: HTMLInputElement): void {
  const pct = ((parseFloat(slider.value) - parseFloat(slider.min)) /
               (parseFloat(slider.max) - parseFloat(slider.min))) * 100
  slider.style.setProperty('--fill-pct', `${pct}%`)
}
```

```css
/* In style.css */
input[type="range"]#timeline {
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  background: linear-gradient(
    to right,
    var(--color-accent) 0%,
    var(--color-accent) var(--fill-pct, 0%),
    oklch(40% 0.01 264) var(--fill-pct, 0%),
    oklch(40% 0.01 264) 100%
  );
  border-radius: 2px;
}
input[type="range"]#timeline::-webkit-slider-thumb { ... }
input[type="range"]#timeline::-moz-range-thumb { ... }
```

The `--fill-pct` CSS custom property is updated each RAF frame to track animation progress. This is the standard approach for custom-styled range inputs.

### Pattern 4: Scrub-Then-Resume

**What:** When the user starts dragging the scrubber, set `isScrubbing: true` in the store — this pauses the `AnimationController.update()` call in `onTick` (main.ts already does this check: `if (animationController && !appStore.getState().isScrubbing)`). When the user releases (`pointerup`/`change` event), set `isScrubbing: false` and animation resumes from the scrubbed position automatically.

**Critical:** The existing `AnimationController.setTime()` calls `this.mixer.update(0)` after setting time, which forces the mixer to evaluate and render the pose at the new time. This makes scrubbing feel responsive.

**When to use:** This pattern is already partially wired in the existing `PlaybackOverlay.ts`. Phase 3 continues using it unchanged.

### Anti-Patterns to Avoid

- **Two-row overlay layout (current state):** The existing `PlaybackOverlay.ts` uses an absolutely-positioned wrapper at `bottom-4 left-1/2 -translate-x-1/2` with two rows. This positions controls over the canvas, requiring z-index management. The CONTEXT.md decision for a "control bar with subtle background" implies a structural element below the canvas, not a float over it. Replace with a proper flex-row container in the HTML.
- **Snapping camera instead of animating:** The current `setCameraPreset()` uses `camera.position.set()` directly — this is an instant jump. Per CONTEXT.md locked decision, camera must smoothly animate (~300ms). The snap is a regression risk if left unchanged.
- **Text labels on camera preset buttons:** Current code uses `'Front'`, `'Side'`, `'Back'` text strings. CONTEXT.md requires icons. Use directional Unicode arrows or inline SVGs.
- **Only three camera presets:** The current code defines `front`, `side`, `back` — but CONTEXT.md specifies four: Front, Left, Right, Back. "Left" is missing. The existing `side` preset (`x: 3`) is the Right view (camera is to the right of the model). A Left preset needs `x: -3`.
- **Storing animation time in Zustand:** The RAF pattern for syncing the slider directly reads from `AnimationController.getTime()` (established in Phase 2). Don't add an `animationTime` field to the store — per the STATE.md decision: "Form guide step sync reads AnimationController time via RAF (not Zustand) — avoids storing per-frame animation time in store."

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Camera lerp | Custom tween system, separate animation timeline | `THREE.Vector3.lerp()` in `onTick` | Three.js lerp is one line; a custom tween adds scheduling, cancellation, and timing complexity |
| Styled range input | Canvas-drawn slider, custom drag implementation | Native `<input type="range">` + CSS | Native input handles all edge cases: keyboard navigation, touch events, accessibility. Only need CSS for appearance. |
| Speed state management | Custom event bus | Existing Zustand store (`playbackSpeed`, `setPlaybackSpeed`) | Already wired to `AnimationController.setSpeed()` in `main.ts` subscribe — just add buttons that call the existing setter |

**Key insight:** Every backing service for Phase 3 already exists. The work is 90% UI — layout, styling, and wiring DOM events to already-working store actions and controller methods.

---

## Common Pitfalls

### Pitfall 1: Missing Left Camera Preset

**What goes wrong:** Developer sees three camera presets in `cameraPresets.ts` (`front`, `side`, `back`) and maps them to "Front, Side, Back." But CONTEXT.md specifies four: Front, Left, Right, Back.

**Why it happens:** The existing code named the third-position view "side" which is ambiguous. Looking at the values (`x: 3, y: 1, z: 0`), the camera is to the right of the model (positive X axis), so this is the Right view.

**How to avoid:**
- Rename `side` to `right` in `cameraPresets.ts`
- Add `left: { x: -3, y: 1, z: 0 }`
- Update `PresetName` type accordingly
- Update all call sites (only `PlaybackOverlay.ts` currently references preset names)

**Warning signs:** If you have only three camera buttons in the control bar, you've hit this pitfall.

### Pitfall 2: Control Bar Overlapping Canvas vs. Below Canvas

**What goes wrong:** Placing the control bar as `position: absolute` inside `#panel-center` means it floats over the 3D canvas. The canvas gets shorter when the browser window resizes but the control bar doesn't move. Touch/drag on the canvas near the bottom hits the control bar instead.

**Why it happens:** The current `PlaybackOverlay.ts` uses this exact approach (`absolute bottom-4 left-1/2`). It was acceptable for a provisional overlay, but CONTEXT.md's "control bar with a subtle background" implies a structural separator.

**How to avoid:** Wrap `#panel-center` and the control bar in a flex-col container in `index.html`. The canvas fills `flex-1`, the control bar is `shrink-0` below it. The `ResizeObserver` in `renderer.ts` automatically handles canvas resize — no changes needed there.

**Warning signs:** Control bar has a backdrop-blur or transparency over the canvas; canvas doesn't resize when controls appear/disappear.

### Pitfall 3: Camera Animation Continues After OrbitControls Drag

**What goes wrong:** User clicks a camera preset, camera starts lerping. User immediately grabs OrbitControls to drag the view. Camera "fights" the drag because `_targetPosition` is still set.

**Why it happens:** The lerp runs every tick regardless of user interaction.

**How to avoid:** Cancel the lerp target when OrbitControls detects user input. `OrbitControls` emits a `'start'` event on drag begin. Register a one-time listener:

```typescript
// In registerControls()
controls.addEventListener('start', () => {
  _targetPosition = null  // Cancel any active lerp
})
```

This ensures that manual camera manipulation always wins over preset animation.

**Warning signs:** Camera "snapping back" or "fighting" when user tries to orbit after pressing a preset.

### Pitfall 4: Slider Fill Not Updating on Exercise Switch

**What goes wrong:** Timeline slider keeps showing old clip's duration and progress when exercise switches.

**Why it happens:** The `slider.max` is set to clip duration. When exercise switches, the `animationController` reference changes (via `setAnimationController()`). The RAF loop correctly reads the new controller via `getAnimationController()` but `slider.max` needs updating when duration changes.

**How to avoid:** The existing code already handles this: `if (slider.max !== String(dur)) slider.max = String(dur)` in the RAF sync loop. Maintain this pattern in the rewrite.

**Warning signs:** Scrubbing only works to the middle of the new clip, or slider position is wrong after switching exercises.

### Pitfall 5: isScrubbing Never Cleared on Page Blur/Focus

**What goes wrong:** User starts dragging the scrubber, then the tab loses focus. The `pointerup`/`change` event fires on the window, not the slider. `isScrubbing` stays `true` permanently, freezing animation.

**Why it happens:** Browser doesn't always deliver `pointerup` to the element that started the drag if the pointer leaves the window.

**How to avoid:** Listen for `pointerup` on `window` (not just the slider) to clear `isScrubbing`:

```typescript
window.addEventListener('pointerup', () => {
  if (appStore.getState().isScrubbing) {
    appStore.getState().setScrubbing(false)
  }
})
```

Also handle `blur` on the window as a fallback:
```typescript
window.addEventListener('blur', () => appStore.getState().setScrubbing(false))
```

**Warning signs:** Animation freezes after scrubbing and doesn't resume; only page refresh fixes it.

---

## Code Examples

Verified patterns from the existing codebase:

### AnimationController API (already built — Phase 3 uses as-is)
```typescript
// Source: src/animation/AnimationController.ts

controller.setSpeed(0.5)        // 0.5x slow-mo
controller.setSpeed(1)          // 1x normal
controller.setSpeed(2)          // 2x fast

controller.getTime()            // current time in seconds (0 to duration)
controller.getDuration()        // clip duration in seconds
controller.setTime(t)           // seek to t seconds, updates pose immediately
controller.setPaused(true)      // pause
controller.setPaused(false)     // resume
```

### Zustand Store State (already built — Phase 3 uses as-is)
```typescript
// Source: src/core/store.ts

// State fields that Phase 3 uses:
playbackSpeed: number           // 0.5 | 1 | 2
isScrubbing: boolean            // true while timeline is being dragged
isPlaying: boolean              // true = playing, false = paused

// Actions:
setPlaybackSpeed(speed)
setScrubbing(v)
setPlaying(v)
```

### Main loop already skips AnimationController when scrubbing
```typescript
// Source: src/main.ts onTick callback

if (animationController && !appStore.getState().isScrubbing) {
  animationController.update()   // paused by isScrubbing check — no change needed
}
```

### main.ts already subscribes to speed changes
```typescript
// Source: src/main.ts

appStore.subscribe((state, prevState) => {
  if (state.playbackSpeed !== prevState.playbackSpeed) {
    animationController.setSpeed(state.playbackSpeed)
  }
})
```

### Camera lerp target pattern (new in Phase 3)
```typescript
// Source: derived from THREE.Vector3.lerp() API

// cameraPresets.ts additions:
let _targetPosition: THREE.Vector3 | null = null

export function setCameraPreset(name: PresetName): void {
  const p = presets[name]
  _targetPosition = new THREE.Vector3(p.x, p.y, p.z)
  if (_controls) _controls.target.set(0, 0.9, 0)
}

export function tickCameraAnimation(): void {
  if (!_targetPosition || !_camera || !_controls) return
  _camera.position.lerp(_targetPosition, 0.18)  // ~300ms at 60fps
  if (_camera.position.distanceTo(_targetPosition) < 0.005) {
    _camera.position.copy(_targetPosition)
    _targetPosition = null
  }
  _controls.update()
}
```

### CSS custom property trick for filled range input
```css
/* style.css — updated for styled timeline */
input[type="range"]#timeline {
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  border-radius: 2px;
  outline: none;
  cursor: pointer;
  background: linear-gradient(
    to right,
    var(--color-accent) 0%,
    var(--color-accent) var(--fill-pct, 0%),
    oklch(35% 0.01 264) var(--fill-pct, 0%),
    oklch(35% 0.01 264) 100%
  );
}
input[type="range"]#timeline::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
}
input[type="range"]#timeline::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: white;
  border: none;
  cursor: pointer;
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `camera.position.set()` snap preset | Lerp in render loop `onTick` | Phase 3 | Camera movement becomes smooth ~300ms ease-out instead of instant jump |
| Two-row floating overlay in canvas | Single-row control bar below canvas in HTML structure | Phase 3 | Control bar gets structural background; canvas area is unobstructed |
| Text labels on camera buttons | Icon-based buttons (Unicode or inline SVG) | Phase 3 | Cleaner at small sizes; matches CONTEXT.md spec |
| Native default-styled `<input type="range">` | CSS-styled range with fill gradient | Phase 3 | Matches accent color spec; filled/unfilled split visible |
| Three camera presets (front/side/back) | Four presets (front/left/right/back) | Phase 3 | Adds Left view; renames "side" to "right" |

**Deprecated/outdated:**
- `PlaybackOverlay.ts` two-row floating layout: replaced by control bar HTML structure
- `cameraPresets.ts` snap behavior: replaced by lerp-based animation

---

## Open Questions

1. **OrbitControls `controls.update()` call ownership during lerp**
   - What we know: `main.ts` `onTick` already calls `controls.update()` every frame. `tickCameraAnimation()` in `cameraPresets.ts` would also call `controls.update()` when lerping is active.
   - What's unclear: Calling `controls.update()` twice per frame may not cause a visual problem (it's idempotent for damping at small intervals) but could cause subtle damping accumulation.
   - Recommendation: Have `tickCameraAnimation()` NOT call `controls.update()` itself, and instead have `main.ts` call it unconditionally each tick — `controls.update()` is already called after. This keeps update ownership in one place.

2. **Icon approach for camera preset buttons**
   - What we know: CONTEXT.md says "icons representing each view angle" — this is Claude's discretion.
   - Options: (a) Unicode directional arrows: ▲ (front), ◄ (left), ► (right), ▼ (back) — simple but semantically weak; (b) Thin inline SVG eye/camera icons — more explicit; (c) Letters in styled pill buttons (F/L/R/B) — minimal but effective for a dev tool.
   - Recommendation: Single-character abbreviations (F, L, R, B) in small pill buttons. These are unambiguous, readable at 14px, require no external resources, and match the minimal aesthetic of the existing control buttons. Can be upgraded to SVG icons in a later polish pass.

3. **Control bar position relative to panel toggle buttons**
   - What we know: The toggle buttons for left/right panels are `absolute` inside `#panel-center`. The control bar will be below `#panel-center`.
   - What's unclear: Should the control bar span only the viewer width (current plan) or the full window width including the side panels?
   - Recommendation: Control bar spans only the center column (same width as the 3D viewer). The side panels have their own content. The HTML structure wraps `#panel-center` + control bar in a `flex-col` div.

---

## Implementation Plan Summary

Phase 3 requires changes to **4 files** and is a single-plan phase:

1. **`index.html`** — Wrap `#panel-center` and a new `#control-bar` in a `flex-col` container. The control bar contains: Play/Pause button, `<input type="range" id="timeline" class="flex-1">`, speed segmented buttons group, camera preset icon buttons group.

2. **`src/core/cameraPresets.ts`** — Add `left` preset (`x: -3`), rename `side` to `right`, add `_targetPosition` lerp state, add `tickCameraAnimation()` export, add `cancelCameraAnimation()` for OrbitControls `start` event.

3. **`src/ui/PlaybackOverlay.ts`** — Rewrite to target `#control-bar` element instead of creating a floating overlay; remove the two-row structure; update camera buttons to use icon labels with the four new preset names; update slider to set `--fill-pct` CSS variable each RAF frame; add `window` pointerup/blur guard for isScrubbing.

4. **`src/style.css`** — Add `input[type="range"]#timeline` styles for filled/unfilled track appearance.

5. **`src/main.ts`** — Add `tickCameraAnimation()` call inside `onTick`.

---

## Sources

### Primary (HIGH confidence)
- Codebase direct read — `src/animation/AnimationController.ts`, `src/core/store.ts`, `src/core/cameraPresets.ts`, `src/ui/PlaybackOverlay.ts`, `src/main.ts`, `index.html`, `src/style.css`, `package.json` — all APIs and current implementation state verified from source
- `.planning/phases/03-playback-controls/03-CONTEXT.md` — locked decisions and discretion areas
- `.planning/STATE.md` — established architecture decisions (no-React, Zustand vanilla, RAF for animation reads)

### Secondary (MEDIUM confidence)
- `THREE.Vector3.lerp()` — standard Three.js API; behavior from training data verified against known usage in codebase (`THREE.Vector3` already used extensively in `AnnotationOverlay.ts`)
- CSS `input[type="range"]` styling via `appearance: none` + gradient background — standard browser technique; cross-browser support for webkit/moz pseudo-elements is well-established

### Tertiary (LOW confidence)
- Exact lerp factor for ~300ms ease-out at 60fps (factor ≈ 0.18) — derived from `1 - (1-f)^n` math; actual feel depends on display refresh rate. Treat as starting point, validate in browser.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already in project; APIs read directly from source
- Architecture: HIGH — implementation patterns derived from existing working code in the same codebase
- Pitfalls: HIGH — Pitfalls 1–4 identified from direct code inspection; Pitfall 5 is a well-known browser event edge case (MEDIUM — verified from general web API knowledge)

**Research date:** 2026-02-24
**Valid until:** 2026-03-24 (stable stack; 30-day window)
