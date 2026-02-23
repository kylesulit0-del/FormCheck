# Phase 1: Foundation - Research

**Researched:** 2026-02-24
**Domain:** Vanilla Three.js + Vite 7 + TypeScript + Tailwind v4 + Zustand (no React) — scaffold, programmatic mannequin model, asset compression pipeline, exercise registry
**Confidence:** HIGH (stack locked, all major claims verified with official docs or multiple sources)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Mannequin Model
- Smooth mannequin style — featureless face, smooth body, store-mannequin aesthetic
- Light gray matte material against dark background
- Neutral/androgynous build — no gendered features, generic human proportions
- Model must be generated programmatically by Claude Code — not sourced from a pre-made asset library
- Must support muscle highlighting in Phase 4 (segmented mesh or per-material approach needed)

#### Animation Approach
- Fully programmatic — define joint angles/positions in code, no Mixamo or external animation tools
- Biomechanically accurate motion — correct joint angles, realistic speed curves, sports science quality
- Loop style: single rep + reset — one full rep, model returns to neutral position, brief pause, repeats
- Ghost equipment for exercises that need it (bench press barbell, deadlift barbell) — faint outline visible but not distracting
- Smooth interpolation required — no robotic/linear keyframe motion

#### Exercise Data Shape
- Flat list for v1 selector — no categories, just 5 exercises listed
- Primary + secondary muscles tracked per exercise (e.g., squat = quads, glutes + hamstrings, core)
- Difficulty/experience level field included in schema but not displayed in v1 — ready for future use
- Form instructions: 3-5 concise steps per exercise — short, punchy coaching cues
- Common mistakes: at least 2 per exercise

#### Dev Workflow
- Process optimized for Claude Code as the primary author of new exercises
- Both automated tests (data shape validation, animation playback) and visual checking for quality
- In-repo written guide (CONTRIBUTING.md or similar) with step-by-step instructions for adding an exercise
- File/config structure: Claude's discretion — whatever's cleanest for the codebase

#### Stack (from STATE.md — locked pre-phase)
- No React — vanilla Three.js + Vite + TypeScript + Tailwind v4 + Zustand (no React dependency)
- Draco compression via gltf-transform must be part of the asset pipeline from day one
- Skeleton source must be frozen before any animation authoring
- Hybrid animation: QuaternionKeyframeTrack programmatic animation (Mixamo deferred/not for Phase 1)

### Claude's Discretion
- Exercise file organization (one file per exercise, config + assets, etc.)
- Exact TypeScript interface fields beyond the discussed ones
- Animation keyframe data format (JSON arrays, inline objects, etc.)
- Ghost equipment rendering approach
- Specific testing framework and test patterns
- Build tooling choices (Vite version, etc.)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TECH-01 | Exercise data follows a config-driven pattern so new exercises can be added via a documented dev workflow | TypeScript `ExerciseDefinition` interface + registry pattern; CONTRIBUTING.md workflow documented |
| TECH-02 | 3D animations are generated programmatically or via a repeatable pipeline (not dependent on purchasing pre-made mocap files) | Three.js `QuaternionKeyframeTrack` + `AnimationMixer` pattern; Euler-to-quaternion conversion approach documented |
| TECH-03 | Site deploys as a static site (Vercel/Netlify) with no backend | Vite 7 `npm run build` produces `dist/` folder; static site confirmed; no server-side requirements |
| TECH-04 | GLB/3D assets are compressed (Draco) with fast loading | `@gltf-transform/cli` v4.3.0 Draco pipeline + Three.js `DRACOLoader` with local decoder files |
</phase_requirements>

---

## Summary

Phase 1 establishes the complete technical substrate for FormCheck: a vanilla Three.js 0.183 project scaffolded with Vite 7 and TypeScript, styled with Tailwind v4, and state-managed with Zustand's vanilla `createStore`. The most novel challenge is building a **programmatic mannequin** using Three.js geometry primitives — no external 3D model files for the figure itself. This mannequin must be structured with **separate mesh segments per body region** from day one, since Phase 4 muscle highlighting requires per-material color control. An existing library `mannequin.js` provides a directly applicable reference implementation (MIT licensed, Three.js-native).

The **asset compression pipeline** is straightforward: `@gltf-transform/cli` v4.3.0 with a single CLI command converts any GLB to Draco-compressed output. The Three.js `DRACOLoader` requires its decoder WASM/JS files to be copied from `node_modules/three/examples/jsm/libs/draco/` into `public/draco/` — this is a known Vite gotcha. The **exercise registry** is a TypeScript module exporting a typed map of exercise definitions — config-driven so adding an exercise means creating one file and registering it.

**Primary recommendation:** Scaffold with `npm create vite@latest -- --template vanilla-ts`, build the mannequin as a hierarchy of `THREE.Mesh` segments with a shared bone structure (or joint `Object3D` hierarchy), wire `QuaternionKeyframeTrack` for programmatic animation, and use `@gltf-transform/cli draco` for any equipment GLBs (ghost barbell etc.). Everything else is standard configuration.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| three | 0.183.1 | 3D rendering, animation system, loaders | Locked decision; most current stable release (Feb 2025) |
| vite | ^7.x (7.3.1 latest) | Dev server + bundler | Current major; Node 20+ required; "baseline-widely-available" build target |
| typescript | ~5.x | Type safety | Vite `vanilla-ts` template includes it |
| tailwindcss | ^4.x | Utility CSS | Locked; v4 uses `@tailwindcss/vite` plugin — no PostCSS config needed |
| @tailwindcss/vite | ^4.x | Tailwind Vite integration | First-party plugin; zero-config; single CSS import line |
| zustand | ^5.x | State management | Locked; `createStore` from `zustand/vanilla` — no React dependency |
| @types/three | matches three version | Three.js TypeScript types | Needed for full IDE support |

### Supporting (Asset Pipeline)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @gltf-transform/cli | 4.3.0 | GLB Draco compression | Run as dev script on any equipment GLB asset; one-time per asset |
| @gltf-transform/core | 4.x | Programmatic pipeline API | If CLI is insufficient for custom scripts |
| @gltf-transform/functions | 4.x | `draco()` transform function | Used with `@gltf-transform/core` for Node.js scripts |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Vanilla Three.js | @react-three/fiber | R3F requires React — locked out by stack decision |
| Vite 7 | Vite 6 | Both work; v7 has Node 20+ requirement; recommend v7 for future-proofing |
| Zustand vanilla | Nanostores / custom EventEmitter | Zustand/vanilla is lighter API; already decided |
| @gltf-transform/cli | gltf-pipeline (Cesium) | gltf-transform is more actively maintained and composable |
| mannequin.js as reference | Hand-rolling joint math | mannequin.js is Three.js-native; study its joint hierarchy — don't copy wholesale, but use as architecture guide |

### Installation

```bash
# Project scaffold (run once)
npm create vite@latest formcheck -- --template vanilla-ts
cd formcheck

# Core runtime
npm install three zustand
npm install --save-dev @types/three

# Tailwind v4
npm install tailwindcss @tailwindcss/vite

# Asset pipeline (dev-only)
npm install --save-dev @gltf-transform/cli @gltf-transform/core @gltf-transform/functions
```

---

## Architecture Patterns

### Recommended Project Structure

```
formcheck/
├── public/
│   ├── draco/               # Draco decoder WASM/JS files (copied from node_modules)
│   └── models/              # Draco-compressed GLB files (ghost equipment etc.)
├── src/
│   ├── core/
│   │   ├── renderer.ts      # Three.js WebGLRenderer, scene, camera setup
│   │   ├── loop.ts          # Animation loop (requestAnimationFrame + clock)
│   │   └── store.ts         # Zustand vanilla store (selected exercise, playback state)
│   ├── mannequin/
│   │   ├── MannequinBuilder.ts   # Builds the mannequin mesh hierarchy programmatically
│   │   ├── mannequin.types.ts    # JointName enum, SegmentName enum
│   │   └── segments/             # Per-body-region mesh factories (torso, upper arm, etc.)
│   ├── exercises/
│   │   ├── types.ts         # ExerciseDefinition interface
│   │   ├── registry.ts      # Exercise registry (map of id → ExerciseDefinition)
│   │   ├── squat.ts         # Squat definition + animation keyframes
│   │   ├── benchpress.ts
│   │   ├── pushup.ts
│   │   ├── deadlift.ts
│   │   └── plank.ts
│   ├── animation/
│   │   ├── AnimationController.ts   # Wraps AnimationMixer; handles play/pause/speed
│   │   └── keyframe-utils.ts        # eulerToQuat helper, buildAnimationClip factory
│   └── main.ts              # Entry point
├── scripts/
│   └── compress-glb.sh      # Shell script: gltf-transform draco input.glb output.glb
├── CONTRIBUTING.md           # Step-by-step guide for adding an exercise
├── vite.config.ts
├── tsconfig.json
└── index.html
```

### Pattern 1: Zustand Vanilla Store (No React)

**What:** Uses `createStore` from `zustand/vanilla` instead of the React hook form. Returns `getState`, `setState`, `subscribe` — no hooks needed.
**When to use:** Throughout — this is the only state management pattern for this stack.

```typescript
// src/core/store.ts
// Source: https://zustand.docs.pmnd.rs/apis/create-store
import { createStore } from 'zustand/vanilla';

interface AppState {
  selectedExerciseId: string;
  isPlaying: boolean;
  playbackSpeed: number;
  setExercise: (id: string) => void;
  setPlaying: (playing: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
}

export const appStore = createStore<AppState>()((set) => ({
  selectedExerciseId: 'squat',
  isPlaying: true,
  playbackSpeed: 1.0,
  setExercise: (id) => set({ selectedExerciseId: id }),
  setPlaying: (playing) => set({ isPlaying: playing }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
}));

// Subscribe to state changes (replaces React useEffect)
appStore.subscribe((state, prev) => {
  if (state.selectedExerciseId !== prev.selectedExerciseId) {
    // load new exercise animation
  }
});
```

### Pattern 2: Exercise Registry (Config-Driven)

**What:** A TypeScript interface defines the full shape of an exercise. Each exercise is its own file. A central registry maps IDs to definitions.
**When to use:** Every exercise follows this pattern. Adding one exercise = one file + one registry entry.

```typescript
// src/exercises/types.ts
export type MuscleId =
  | 'quads' | 'hamstrings' | 'glutes' | 'calves'
  | 'chest' | 'front-delts' | 'triceps'
  | 'lats' | 'traps' | 'rear-delts' | 'biceps'
  | 'core' | 'lower-back' | 'hip-flexors';

export interface ExerciseDefinition {
  id: string;
  name: string;
  primaryMuscles: MuscleId[];
  secondaryMuscles: MuscleId[];
  difficulty: 'beginner' | 'intermediate' | 'advanced'; // v1: in schema, not displayed
  formSteps: string[];       // 3-5 steps, short punchy cues
  commonMistakes: string[];  // min 2
  hasGhostEquipment: boolean;
  buildAnimation: (mannequin: MannequinRig) => THREE.AnimationClip;
}

// src/exercises/registry.ts
import { squat } from './squat';
import { benchPress } from './benchpress';
import { pushup } from './pushup';
import { deadlift } from './deadlift';
import { plank } from './plank';

export const exerciseRegistry = new Map<string, ExerciseDefinition>([
  ['squat', squat],
  ['bench-press', benchPress],
  ['pushup', pushup],
  ['deadlift', deadlift],
  ['plank', plank],
]);
```

### Pattern 3: Programmatic Mannequin — Segmented Mesh Hierarchy

**What:** Build the mannequin from primitive Three.js geometries (`CylinderGeometry`, `SphereGeometry`, `CapsuleGeometry`). Each body region is a separate `THREE.Mesh` with its own material instance. Joints are `THREE.Object3D` pivot nodes in a parent-child hierarchy.
**When to use:** This is the only approach for Phase 1 given the no-external-model constraint AND the Phase 4 muscle highlighting requirement.

**Critical design constraint:** Each segment that will be highlighted in Phase 4 MUST be a separate mesh with its own `MeshStandardMaterial` instance. Do not share materials between segments that need independent highlighting.

```typescript
// Conceptual joint hierarchy (modeled after mannequin.js approach)
// Source: https://boytchev.github.io/mannequin.js/docs/userguide.html
//
// root (Object3D)
// └── pelvis (Object3D) — pivot at hip center
//     ├── spine (Object3D)
//     │   ├── torsoMesh (Mesh — MeshStandardMaterial instance A)
//     │   ├── chest (Object3D)
//     │   │   └── chestMesh (Mesh — MeshStandardMaterial instance B)
//     │   ├── neck (Object3D)
//     │   │   └── headMesh (Mesh)
//     │   ├── l_shoulder (Object3D) — pivot at shoulder
//     │   │   ├── upperArmMesh_L (Mesh — instance C, highlights for chest exercises)
//     │   │   └── l_elbow (Object3D) — pivot at elbow
//     │   │       └── forearmMesh_L (Mesh — instance D)
//     │   └── r_shoulder / r_elbow (mirror)
//     ├── l_hip (Object3D) — pivot at hip
//     │   ├── thighMesh_L (Mesh — instance E, highlights for quads/glutes)
//     │   └── l_knee (Object3D) — pivot at knee
//     │       ├── shinMesh_L (Mesh — instance F, highlights for hamstrings)
//     │       └── l_ankle (Object3D)
//     │           └── footMesh_L (Mesh)
//     └── r_hip / r_knee (mirror)

// Material factory — called once per segment
function createSegmentMaterial(color = 0xd0d0d0): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.85,
    metalness: 0.0,
  });
}
```

### Pattern 4: Programmatic Animation with QuaternionKeyframeTrack

**What:** Define joint rotations as Euler angles (human-readable degrees), convert to quaternions, build a `THREE.AnimationClip`. Feed it to `THREE.AnimationMixer`.
**When to use:** Every exercise animation.

**Key rule:** Always animate `.quaternion`, never `.rotation`. The Three.js animation system and `QuaternionKeyframeTrack` expect quaternion target properties — animating `.rotation` with quaternion data causes silent failures.

```typescript
// src/animation/keyframe-utils.ts
import * as THREE from 'three';

/** Convert degrees to radians helper */
const deg = (d: number) => (d * Math.PI) / 180;

/**
 * Build a QuaternionKeyframeTrack from human-readable Euler keyframes.
 * @param bonePath  e.g. "l_knee.quaternion" — must end in ".quaternion"
 * @param keyframes Array of { time: number, x: number, y: number, z: number }
 *                  angles in degrees, ZYX order (biomechanical convention)
 */
export function buildQuatTrack(
  bonePath: string,
  keyframes: Array<{ time: number; x: number; y: number; z: number }>
): THREE.QuaternionKeyframeTrack {
  const times: number[] = [];
  const values: number[] = [];

  for (const kf of keyframes) {
    const q = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(deg(kf.x), deg(kf.y), deg(kf.z), 'ZYX')
    );
    times.push(kf.time);
    values.push(q.x, q.y, q.z, q.w);
  }

  return new THREE.QuaternionKeyframeTrack(bonePath, times, values);
}

/**
 * Build an AnimationClip from an array of tracks.
 * duration = -1 means auto-compute from last keyframe time.
 */
export function buildClip(
  name: string,
  tracks: THREE.KeyframeTrack[],
  duration = -1
): THREE.AnimationClip {
  return new THREE.AnimationClip(name, duration, tracks);
}
```

```typescript
// src/animation/AnimationController.ts
import * as THREE from 'three';

export class AnimationController {
  private mixer: THREE.AnimationMixer;
  private clock: THREE.Clock;
  private currentAction: THREE.AnimationAction | null = null;

  constructor(rootObject: THREE.Object3D) {
    this.mixer = new THREE.AnimationMixer(rootObject);
    this.clock = new THREE.Clock();
  }

  play(clip: THREE.AnimationClip): void {
    this.currentAction?.stop();
    this.currentAction = this.mixer.clipAction(clip);
    this.currentAction.setLoop(THREE.LoopRepeat, Infinity);
    this.currentAction.play();
  }

  // Call this in the render loop every frame
  update(): void {
    const delta = this.clock.getDelta();
    this.mixer.update(delta);
  }

  setSpeed(speed: number): void {
    if (this.currentAction) this.currentAction.timeScale = speed;
  }

  setPaused(paused: boolean): void {
    if (this.currentAction) this.currentAction.paused = paused;
  }
}
```

### Pattern 5: Draco Asset Pipeline

**What:** Equipment GLBs (ghost barbell, etc.) compressed with `@gltf-transform/cli`. Loaded at runtime with Three.js `DRACOLoader`. Draco decoder WASM files live in `public/draco/`.
**When to use:** Any GLB placed in `public/models/`.

```bash
# scripts/compress-glb.sh
#!/usr/bin/env bash
# Usage: bash scripts/compress-glb.sh input.glb
INPUT="$1"
OUTPUT="${INPUT%.glb}-compressed.glb"
npx gltf-transform draco "$INPUT" "$OUTPUT" --method edgebreaker
echo "Compressed: $OUTPUT"
```

```typescript
// GLTFLoader + DRACOLoader setup (in renderer.ts or a loader util)
// Source: https://threejs.org/docs/#api/en/loaders/GLTFLoader
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const dracoLoader = new DRACOLoader();
// CRITICAL: decoder files must be copied to public/draco/ from:
// node_modules/three/examples/jsm/libs/draco/
dracoLoader.setDecoderPath('/draco/');

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

// Async loading
const gltf = await gltfLoader.loadAsync('/models/barbell-compressed.glb');
scene.add(gltf.scene);
```

### Pattern 6: Vite + Tailwind v4 Configuration

```typescript
// vite.config.ts
// Source: https://tailwindcss.com/blog/tailwindcss-v4
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
  // No special three.js config needed — three imports resolve automatically
});
```

```css
/* src/style.css — entire Tailwind setup */
@import "tailwindcss";

/* Custom theme tokens (CSS-first config in v4) */
@theme {
  --color-bg: oklch(0.12 0 0);         /* dark background */
  --color-surface: oklch(0.18 0 0);    /* panel background */
  --color-mannequin: oklch(0.82 0 0);  /* light gray mannequin */
}
```

### Anti-Patterns to Avoid

- **Sharing one material across all mannequin segments:** Breaks Phase 4 muscle highlighting. Each segment MUST have its own `MeshStandardMaterial` instance.
- **Using `.rotation` (EulerAngles) as the animation target property:** Three.js animation system requires `.quaternion` path in KeyframeTracks. Use `QuaternionKeyframeTrack` targeting `"boneName.quaternion"`.
- **Importing Draco decoder from CDN (gstatic):** Works but adds network dependency and privacy risk. Copy decoder to `public/draco/` for self-hosted reliability.
- **Placing GLB files in `src/` instead of `public/`:** Vite will try to process/hash them. GLBs belong in `public/models/` and are loaded via URL string `/models/xxx.glb`.
- **Designing a monolithic mannequin mesh (single geometry):** Cannot independently highlight muscle groups in Phase 4. Segmented from the start.
- **Keying animation bone names that don't match the mannequin's Object3D hierarchy names:** AnimationMixer silently fails to animate if the property path doesn't resolve. Bone/joint `Object3D.name` must exactly match the track path prefix.
- **Retrofitting Draco compression after Phase 4:** STATE.md explicitly flags that retrofitting breaks model-animation name relationships. Pipeline must be in place now.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| GLB Draco compression | Custom compression script | `@gltf-transform/cli draco` | Handles extension registration, deferred execution, metadata preservation |
| Quaternion slerp interpolation | Custom slerp math | Three.js `QuaternionKeyframeTrack` + AnimationMixer | AnimationMixer handles slerp automatically between quaternion keyframes |
| Animation loop timing | Manual `Date.now()` delta | `THREE.Clock.getDelta()` | Handles tab visibility changes, frame skips correctly |
| State subscription | Custom EventEmitter | `zustand/vanilla` `subscribe()` | Handles shallow equality, unsubscribe cleanup, TS types |
| CSS variable theming | Custom CSS vars system | Tailwind v4 `@theme` block | Generates design tokens as CSS vars automatically |
| Joint rotation conversion | Custom Euler↔Quat math | `new THREE.Quaternion().setFromEuler(new THREE.Euler(...))` | Three.js handles gimbal lock, rotation order correctly |

**Key insight:** The Three.js animation system (`AnimationMixer` + `AnimationClip` + `KeyframeTrack`) handles all the hard parts of animation: interpolation, looping, speed scaling, blending. Never replicate this with manual `lerp` calls in the render loop.

---

## Common Pitfalls

### Pitfall 1: Draco Decoder Not Found at Runtime
**What goes wrong:** Three.js `DRACOLoader` tries to fetch `draco_wasm_wrapper.js` and `draco_decoder.wasm` at the configured path. If those files aren't there, loading silently fails or throws a worker error.
**Why it happens:** The decoder files are in `node_modules/three/examples/jsm/libs/draco/` but must be manually copied to `public/draco/` — Vite does not auto-copy them.
**How to avoid:** Add a postinstall or prepare script: `"prepare": "cp -r node_modules/three/examples/jsm/libs/draco public/draco"` (or a cross-platform equivalent with `shx`).
**Warning signs:** Console error containing `draco_wasm_wrapper.js` 404 or `WebAssembly` worker failures.

### Pitfall 2: AnimationMixer Target Path Mismatch
**What goes wrong:** Animation runs (no error) but nothing moves. `mixer.update(delta)` is called but joints stay at rest pose.
**Why it happens:** `QuaternionKeyframeTrack` path like `"l_knee.quaternion"` must exactly match an `Object3D` in the mixer's root hierarchy with `name === "l_knee"`. Typo or wrong name = silent no-op.
**How to avoid:** Export a `JOINT_NAMES` enum from `mannequin.types.ts` and use it in both the mannequin builder (`object3d.name = JOINT_NAMES.L_KNEE`) and the track path constructor.
**Warning signs:** Animations play (mixer ticks, action is active) but the model doesn't move.

### Pitfall 3: Vite 7 Browser Target vs. Three.js WebGPU
**What goes wrong:** Vite 7 sets default build target to `baseline-widely-available` (Chrome 107, Safari 16). This is fine for WebGL. If WebGPU is later introduced, the target must be raised.
**Why it happens:** Vite 7 changed the default target from `modules` to `baseline-widely-available`. WebGPU requires Chrome 113+.
**How to avoid:** Stick to WebGL1/WebGL2 renderer for v1 (no `THREE.WebGPURenderer`). If WebGPU is ever needed, update `build.target` in `vite.config.ts`.
**Warning signs:** Only relevant if WebGPU is introduced in a later phase.

### Pitfall 4: Zustand v5 API Differences from v4
**What goes wrong:** Code copied from v4 tutorials uses `create` from `'zustand/vanilla'`. In v5, the function is `createStore`.
**Why it happens:** Zustand v5 renamed `create` → `createStore` in the vanilla subpath.
**How to avoid:** Use `import { createStore } from 'zustand/vanilla'` — NOT `create`.
**Warning signs:** TypeScript type error `Module '"zustand/vanilla"' has no exported member 'create'`.

### Pitfall 5: Shared MeshStandardMaterial Blocks Phase 4
**What goes wrong:** Phase 4 muscle highlighting is blocked — cannot independently color individual muscle groups.
**Why it happens:** If the entire mannequin uses one shared material, setting `material.color` or `material.emissive` affects all segments simultaneously.
**How to avoid:** Create a separate `new THREE.MeshStandardMaterial(...)` instance for every highlightable segment. Store references in a `Map<MuscleId, THREE.MeshStandardMaterial[]>` on the mannequin rig object.
**Warning signs:** Only becomes apparent in Phase 4, but unrecoverable without refactoring the whole mannequin.

### Pitfall 6: GLB in `src/` Directory
**What goes wrong:** Vite tries to bundle the GLB as a module, produces mangled output, or errors on build.
**Why it happens:** Vite processes everything in `src/`. Binary assets must be in `public/` for passthrough serving.
**How to avoid:** All GLB files go in `public/models/`. Load them with URL strings: `loader.loadAsync('/models/barbell.glb')`.
**Warning signs:** Build warning about large asset or import error for `.glb` file.

### Pitfall 7: Tailwind v4 CSS-First Config (No tailwind.config.js)
**What goes wrong:** Developer creates `tailwind.config.js` following v3 tutorials — it's ignored in v4.
**Why it happens:** v4 is entirely CSS-first: `@theme {}` block in CSS replaces `tailwind.config.js`.
**How to avoid:** Delete any `tailwind.config.js`. All theme customization goes in the CSS file's `@theme {}` block.
**Warning signs:** Custom colors/fonts don't apply despite having a `tailwind.config.js`.

---

## Code Examples

Verified patterns from official sources:

### Vite Project Scaffold (vanilla-ts template)

```bash
# Source: https://vite.dev/guide/
npm create vite@latest formcheck -- --template vanilla-ts
cd formcheck
```

Generated structure:
```
formcheck/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts   # (may be vite.config.js — rename to .ts)
└── src/
    ├── main.ts
    ├── style.css
    └── typescript.svg
```

### Three.js Render Loop (standard pattern)

```typescript
// src/core/loop.ts
// Source: https://threejs.org/docs/#api/en/animation/AnimationMixer
import * as THREE from 'three';

export function createRenderLoop(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  onTick: (delta: number) => void
): { start: () => void; stop: () => void } {
  const clock = new THREE.Clock();
  let rafId: number;

  function tick(): void {
    rafId = requestAnimationFrame(tick);
    const delta = clock.getDelta();
    onTick(delta);
    renderer.render(scene, camera);
  }

  return {
    start: () => { clock.start(); rafId = requestAnimationFrame(tick); },
    stop: () => cancelAnimationFrame(rafId),
  };
}
```

### Euler-to-Quaternion for Biomechanical Joint Angles

```typescript
// Source: https://threejs.org/docs/#api/en/math/Quaternion
// Pattern verified from three.js forum discussions on QuaternionKeyframeTrack
import * as THREE from 'three';

// Human-readable degree angles → quaternion for keyframe track
// ALWAYS use ZYX order for biomechanical joints (matches anatomical axes)
function eulerDegToQuat(x: number, y: number, z: number): THREE.Quaternion {
  return new THREE.Quaternion().setFromEuler(
    new THREE.Euler(
      (x * Math.PI) / 180,
      (y * Math.PI) / 180,
      (z * Math.PI) / 180,
      'ZYX'
    )
  );
}

// Example: squat knee flexion track
// Knee flexes to ~130° at bottom of squat (biomechanical reference)
const q0 = eulerDegToQuat(0, 0, 0);        // standing — neutral
const q1 = eulerDegToQuat(-130, 0, 0);     // bottom of squat — deep knee flexion
const q2 = eulerDegToQuat(0, 0, 0);        // return to neutral

const kneeTrack = new THREE.QuaternionKeyframeTrack(
  'l_knee.quaternion',                      // MUST match Object3D name exactly
  [0, 1.5, 3.0],                            // times in seconds
  [
    q0.x, q0.y, q0.z, q0.w,
    q1.x, q1.y, q1.z, q1.w,
    q2.x, q2.y, q2.z, q2.w,
  ]
);
```

### DRACOLoader Setup with Local Decoder

```typescript
// Source: https://threejs.org/docs/#api/en/loaders/DRACOLoader
// Source: https://discourse.threejs.org/t/cant-access-draco-loader-files-when-working-with-vite/34099
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

export function createGLTFLoader(): GLTFLoader {
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('/draco/'); // files in public/draco/
  // Optional: force JS decoder (avoid WASM if needed)
  // dracoLoader.setDecoderConfig({ type: 'js' });

  const loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);
  return loader;
}
```

### Copy Draco Decoder Files (package.json script)

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "compress-glb": "gltf-transform draco",
    "prepare": "node -e \"const fs=require('fs'); const src='node_modules/three/examples/jsm/libs/draco'; const dst='public/draco'; if(!fs.existsSync(dst)) fs.cpSync(src,dst,{recursive:true});\""
  }
}
```

### Mannequin Segment Builder (skeletal structure pattern)

```typescript
// src/mannequin/MannequinBuilder.ts — illustrative excerpt
import * as THREE from 'three';

export interface MannequinRig {
  root: THREE.Object3D;
  joints: Map<string, THREE.Object3D>;
  segmentMaterials: Map<string, THREE.MeshStandardMaterial>;
}

function makeCapsule(
  radiusTop: number,
  radiusBottom: number,
  height: number,
  mat: THREE.MeshStandardMaterial
): THREE.Mesh {
  // CapsuleGeometry: radiusTop, radiusBottom, height, radialSegments, heightSegments
  // Using CylinderGeometry for now — replace with CapsuleGeometry when smoother look needed
  return new THREE.Mesh(
    new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 24),
    mat
  );
}

export function buildMannequin(): MannequinRig {
  const joints = new Map<string, THREE.Object3D>();
  const segmentMaterials = new Map<string, THREE.MeshStandardMaterial>();

  const root = new THREE.Object3D();
  root.name = 'mannequin_root';

  // Helper: create named joint pivot
  function joint(name: string): THREE.Object3D {
    const obj = new THREE.Object3D();
    obj.name = name;                     // CRITICAL: must match animation track paths
    joints.set(name, obj);
    return obj;
  }

  // Helper: create material per segment (separate instance = independently highlightable)
  function mat(id: string): THREE.MeshStandardMaterial {
    const m = new THREE.MeshStandardMaterial({ color: 0xd0d0d0, roughness: 0.85 });
    segmentMaterials.set(id, m);
    return m;
  }

  // Build hierarchy (abbreviated — full implementation per body region)
  const pelvis = joint('pelvis');
  root.add(pelvis);

  const spine = joint('spine');
  spine.position.y = 0.12;
  pelvis.add(spine);

  const torsoMesh = makeCapsule(0.14, 0.12, 0.35, mat('torso'));
  torsoMesh.position.y = 0.17;
  spine.add(torsoMesh);

  // ... (continue for all limbs)

  return { root, joints, segmentMaterials };
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwind.config.js` | `@theme {}` in CSS file | Tailwind v4 (Jan 2025) | No config file needed; all tokens become CSS vars |
| PostCSS for Tailwind | `@tailwindcss/vite` plugin | Tailwind v4 | Simpler setup; no postcss.config.js |
| `three/examples/jsm/...` import | `three/addons/...` import | Three.js r152 (2023) | New canonical addon path |
| Zustand `create` from `zustand/vanilla` | `createStore` from `zustand/vanilla` | Zustand v5 | Renamed API; tutorials using `create` are v4 |
| Vite `modules` build target | `baseline-widely-available` | Vite 7 (2025) | Raises min browser support; Chrome 107+ |
| Node 18 for Vite | Node 20.19+ | Vite 7 | EOL Node 18 dropped |

**Deprecated/outdated:**
- `mannequin.js` library wholesale adoption: Study as reference only. It uses global variables and non-module patterns not compatible with Vite/TypeScript without adaptation.
- EulerKeyframeTrack for bone rotation: Does not work reliably in Three.js animation system. Always use `QuaternionKeyframeTrack`.
- `@types/three` separate install for older TS: As of three 0.177+, types ship with the package. Check whether `@types/three` is still needed.

---

## Open Questions

1. **Mannequin GLB vs. Pure Three.js Geometry**
   - What we know: Decision is "programmatic by Claude Code" — pure geometry approach confirmed.
   - What's unclear: Whether `CapsuleGeometry` (Three.js r151+) provides smooth enough joints or whether `SphereGeometry` at joint intersections is needed.
   - Recommendation: Start with `CylinderGeometry` + `SphereGeometry` at joints. Evaluate visually. `CapsuleGeometry` is available as upgrade path.

2. **Skeleton Source Decision (from STATE.md blocker)**
   - What we know: STATE.md flags this as a blocker — "Quaternius Universal Base Characters (CC0) vs Mixamo auto-rigged model".
   - What's unclear: Phase 1 is building a programmatic mannequin (no external skeleton), so this blocker may be Phase 2/4 concern for EXER-01 through EXER-05 content. Phase 1 animations are on the programmatic mannequin, not an imported GLB skeleton.
   - Recommendation: For Phase 1, resolve skeleton by building the joint `Object3D` hierarchy directly in code. Document that the joint name convention established here MUST be treated as frozen before Phase 4.

3. **Ghost Equipment GLB Source**
   - What we know: Barbell GLB needed for bench press and deadlift; will be Draco-compressed.
   - What's unclear: Who creates the initial barbell GLB. Must be programmatically generated (CONTEXT.md: "no pre-made asset library").
   - Recommendation: Build ghost barbell from Three.js `CylinderGeometry` primitives (same approach as mannequin), export to GLB via `THREE.GLTFExporter`, then compress with Draco pipeline. This fulfills TECH-04 (GLB in `public/models/` under 500KB) and the "no external asset" constraint simultaneously.

4. **@types/three vs. Bundled Types**
   - What we know: Three.js 0.183+ may ship its own types in the package.
   - What's unclear: Whether `@types/three` is still required or conflicts.
   - Recommendation: Install `@types/three` in devDependencies as it's the safe default. If TS shows duplicate type errors, remove it.

---

## Sources

### Primary (HIGH confidence)

- Three.js official docs — `https://threejs.org/docs/` — AnimationMixer, QuaternionKeyframeTrack, DRACOLoader, GLTFLoader, SkinnedMesh, MeshStandardMaterial
- Tailwind CSS v4 release blog — `https://tailwindcss.com/blog/tailwindcss-v4` — installation, CSS-first config, `@theme` block
- Vite 7 official announcement — `https://vite.dev/blog/announcing-vite7` — breaking changes, Node.js requirements, browser targets
- Zustand docs — `https://zustand.docs.pmnd.rs/apis/create-store` — vanilla createStore API
- glTF-Transform CLI docs — `https://gltf-transform.dev/cli` — v4.3.0 draco command, optimize command
- mannequin.js user guide — `https://boytchev.github.io/mannequin.js/docs/userguide.html` — joint hierarchy reference architecture

### Secondary (MEDIUM confidence)

- Three.js forum thread on DRACOLoader + Vite — `https://discourse.threejs.org/t/cant-access-draco-loader-files-when-working-with-vite/34099` — confirmed: decoder files must be in public/
- WebSearch result: three 0.183.1 npm current version — confirmed by multiple search results quoting npmjs.com
- WebSearch result: Vite 7.3.1 current version — confirmed by vite.dev/releases

### Tertiary (LOW confidence)

- WebSearch result: `@types/three` may be bundled in three 0.177+ — not verified with official changelog; treat as "check on install"
- Suggestion to use `THREE.CapsuleGeometry` for mannequin joints — available since r151 but smoothness for mannequin use case is untested

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions verified via npm/official releases
- Architecture: HIGH — patterns from official Three.js docs and Zustand docs
- Mannequin approach: MEDIUM — Three.js primitives are well-documented; joint hierarchy pattern derived from mannequin.js reference; exact geometry shapes are implementation detail
- Draco pipeline: HIGH — official gltf-transform docs; known Vite gotcha verified in community forum
- Pitfalls: HIGH — most from official docs and verified forum threads; one (shared material) is logical inference from Phase 4 requirement

**Research date:** 2026-02-24
**Valid until:** 2026-03-24 (30 days — stack is stable; Tailwind v4 / Three.js release cadence is monthly)
