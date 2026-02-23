# Architecture Research

**Domain:** Browser-based 3D human animation viewer (exercise form guide)
**Researched:** 2026-02-23
**Confidence:** MEDIUM-HIGH (Three.js animation system HIGH via official docs; exercise-specific patterns MEDIUM via multiple verified sources)

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Browser / Static Host                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐  ┌──────────────────────────────┐  ┌───────────┐  │
│  │  Exercise    │  │        3D Viewer Canvas        │  │   Form    │  │
│  │  Selector    │  │  (React Three Fiber / Canvas)  │  │   Guide   │  │
│  │  Panel       │  │                                │  │   Panel   │  │
│  │              │  │  ┌──────────┐  ┌────────────┐  │  │           │  │
│  │  - List of   │  │  │ Humanoid │  │  Controls  │  │  │ - Steps   │  │
│  │    exercises │  │  │  Figure  │  │  Overlay   │  │  │ - Cues    │  │
│  │  - Active    │  │  │ (Skinned │  │  (play/    │  │  │ - Common  │  │
│  │    state     │  │  │  Mesh)   │  │  pause/    │  │  │   errors  │  │
│  │              │  │  └──────────┘  │  speed/    │  │  │           │  │
│  └──────┬───────┘  │               │  camera)   │  │  └───────────┘  │
│         │          │               └────────────┘  │                 │
│         │          └──────────────────────────────┘                  │
│         │                          │                                  │
├─────────┼──────────────────────────┼──────────────────────────────────┤
│         │         App State Layer   │                                  │
│  ┌──────▼──────────────────────────▼──────┐                           │
│  │           Zustand Store                 │                           │
│  │  - selectedExercise (string/id)         │                           │
│  │  - isPlaying (bool)                     │                           │
│  │  - playbackSpeed (number)               │                           │
│  │  - activeCamera ('front'|'side'|'back') │                           │
│  └─────────────────────────────────────────┘                          │
│                          │                                            │
├──────────────────────────┼────────────────────────────────────────────┤
│                   Data Layer                                           │
│  ┌───────────────────────┴──────────────────────────────────────────┐ │
│  │                   Movement Registry                               │ │
│  │  (exercises/index.ts — static JS module, bundled at build time)   │ │
│  │                                                                   │ │
│  │  ExerciseDefinition {                                             │ │
│  │    id, name, description,                                         │ │
│  │    modelPath (GLB),                                               │ │
│  │    animationClipName,                                             │ │
│  │    formSteps[], commonErrors[],                                   │ │
│  │    cameraHints { front, side, back }                              │ │
│  │  }                                                                │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│  /public/models/  (GLB files — Draco compressed, shipped as assets)    │
│  squat.glb  bench-press.glb  pushup.glb  deadlift.glb  plank.glb      │
└────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Communicates With |
|-----------|----------------|-------------------|
| `ExerciseSelector` | List exercises, set selected exercise in store | Zustand store (write) |
| `ViewerCanvas` | Mount R3F Canvas, provide Suspense boundary, pass selectedExercise to scene | Zustand store (read), HumanoidScene |
| `HumanoidScene` | Own AnimationMixer lifecycle, load GLB, drive animation loop | Three.js AnimationMixer, R3F useFrame, ViewerControls |
| `ViewerControls` | Play/pause, speed slider, camera preset buttons | Zustand store (read/write) |
| `FormGuidePanel` | Render form steps and common errors from exercise definition | Zustand store (read selectedExercise), Movement Registry (read) |
| `Movement Registry` | Exports all ExerciseDefinition objects keyed by id | Consumed by ExerciseSelector, FormGuidePanel, HumanoidScene |
| `Zustand Store` | Single source of truth for viewer state | All UI components |
| `public/models/` | Pre-built GLB files containing SkinnedMesh + AnimationClips | useGLTF hook at load time |

## Recommended Project Structure

```
src/
├── components/
│   ├── ExerciseSelector/
│   │   └── ExerciseSelector.tsx       # Left panel, exercise list
│   ├── ViewerCanvas/
│   │   ├── ViewerCanvas.tsx           # R3F Canvas wrapper + Suspense
│   │   ├── HumanoidScene.tsx          # 3D scene, skeleton, animation
│   │   └── ViewerControls.tsx         # Play/pause/speed/camera UI overlay
│   └── FormGuidePanel/
│       └── FormGuidePanel.tsx         # Right panel, steps + errors
├── exercises/
│   ├── index.ts                       # Registry: exports all definitions
│   ├── squat.ts                       # ExerciseDefinition for squat
│   ├── bench-press.ts                 # ExerciseDefinition for bench press
│   ├── pushup.ts                      # ExerciseDefinition for pushup
│   ├── deadlift.ts                    # ExerciseDefinition for deadlift
│   └── plank.ts                       # ExerciseDefinition for plank
├── store/
│   └── viewerStore.ts                 # Zustand store (selectedExercise, playback)
├── types/
│   └── exercise.ts                    # ExerciseDefinition TypeScript interface
├── App.tsx                            # Top-level layout (3-column)
└── main.tsx                           # Vite entry point

public/
└── models/
    ├── squat.glb
    ├── bench-press.glb
    ├── pushup.glb
    ├── deadlift.glb
    └── plank.glb
```

### Structure Rationale

- **exercises/:** Each exercise is a self-contained TypeScript file exporting its definition. Adding a new exercise = create one file + add one import to index.ts. No other code changes.
- **components/ by UI region:** Matches the 3-panel layout. Viewer is isolated because it owns WebGL context lifecycle (init, cleanup, resize).
- **store/:** Zustand store is framework-agnostic and can be imported by any component without prop drilling.
- **public/models/:** GLB files are served as static assets by Vite/Netlify/Vercel without transformation. Using public/ (not src/) avoids bundler importing 3D binary data.
- **types/:** Shared interface ensures all exercise definitions are structurally consistent.

## Architectural Patterns

### Pattern 1: Data-Driven Exercise Registry

**What:** Each exercise is a plain TypeScript object conforming to `ExerciseDefinition`. The registry (`exercises/index.ts`) exports a flat array/map. Components query the registry — no hardcoded exercise logic in UI components.

**When to use:** Always. This is the pattern that makes new exercise addition a 1-file change.

**Trade-offs:** Requires discipline to keep exercise logic in definition files, not scattered in components. Pays off immediately as exercise count grows.

**Example:**
```typescript
// types/exercise.ts
export interface ExerciseDefinition {
  id: string;
  name: string;
  description: string;
  modelPath: string;            // e.g. '/models/squat.glb'
  animationClipName: string;   // matches clip name inside the GLB
  formSteps: string[];
  commonErrors: string[];
  cameraHints: {
    front: { azimuth: number; polar: number; distance: number };
    side: { azimuth: number; polar: number; distance: number };
    back: { azimuth: number; polar: number; distance: number };
  };
}

// exercises/squat.ts
export const squat: ExerciseDefinition = {
  id: 'squat',
  name: 'Squat',
  modelPath: '/models/squat.glb',
  animationClipName: 'SquatLoop',
  formSteps: [
    'Stand with feet shoulder-width apart',
    'Hinge at hips, push knees out over toes',
    '...'
  ],
  commonErrors: [
    'Knees caving inward',
    'Heels rising off floor',
  ],
  cameraHints: {
    front: { azimuth: 0, polar: Math.PI / 2.5, distance: 3 },
    side: { azimuth: Math.PI / 2, polar: Math.PI / 2.5, distance: 3 },
    back: { azimuth: Math.PI, polar: Math.PI / 2.5, distance: 3 },
  }
};

// exercises/index.ts
import { squat } from './squat';
import { benchPress } from './bench-press';
// ...
export const EXERCISES: ExerciseDefinition[] = [squat, benchPress, ...];
export const EXERCISES_BY_ID = Object.fromEntries(EXERCISES.map(e => [e.id, e]));
```

### Pattern 2: Animation Mixer Lifecycle in HumanoidScene

**What:** The `HumanoidScene` component owns the Three.js `AnimationMixer`. On mount, it loads the GLB, finds the named AnimationClip, creates an `AnimationAction`, and plays it. The `useFrame` hook advances the mixer each frame. On exercise change, the old mixer is disposed and a new one is created.

**When to use:** Always for this app. One mixer per exercise instance is the standard Three.js pattern.

**Trade-offs:** GLB load triggers a brief Suspense fallback on exercise switch. Mitigate with `useGLTF.preload()` calls at app boot for all 5 starter GLBs — they become cached and switches feel instant.

**Example:**
```typescript
// components/ViewerCanvas/HumanoidScene.tsx
import { useGLTF, useAnimations } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect } from 'react';

export function HumanoidScene({ exercise }: { exercise: ExerciseDefinition }) {
  const { scene, animations } = useGLTF(exercise.modelPath);
  const { actions, mixer } = useAnimations(animations, scene);
  const { isPlaying, playbackSpeed } = useViewerStore();

  useEffect(() => {
    const action = actions[exercise.animationClipName];
    if (!action) return;
    action.reset().play();
    return () => { action.stop(); };
  }, [exercise.animationClipName, actions]);

  useEffect(() => {
    if (mixer) mixer.timeScale = playbackSpeed;
  }, [playbackSpeed, mixer]);

  useEffect(() => {
    const action = actions[exercise.animationClipName];
    if (!action) return;
    isPlaying ? action.play() : action.paused = true;
  }, [isPlaying]);

  return <primitive object={scene} />;
}
```

### Pattern 3: Camera Preset System via Programmatic OrbitControls

**What:** Camera presets (front/side/back) are stored in `ExerciseDefinition.cameraHints`. The `ViewerCanvas` holds a ref to the OrbitControls instance. When a preset button is pressed, the store updates `activeCamera`, and a `useEffect` in `HumanoidScene` or `ViewerCanvas` reads the preset angles and smoothly transitions the camera.

**When to use:** Always for preset angles. Orbit controls remain active for user drag/zoom — presets snap to a defined start, then user can continue orbiting from there.

**Trade-offs:** camera-controls library (npm: `camera-controls`) supports smooth animated transitions; Three.js built-in `OrbitControls` requires manual lerp for smooth movement. Recommend `camera-controls` via Drei's `CameraControls` for cleaner API.

## Data Flow

### Startup Flow

```
App mounts
    |
    v
EXERCISES registry loaded (static import, zero network cost)
    |
    v
useGLTF.preload() called for all 5 GLBs (background fetch from /public/models/)
    |
    v
Default exercise selected (first in list)
    |
    v
ViewerCanvas renders → HumanoidScene loads GLB (already cached) → AnimationMixer starts
FormGuidePanel reads exercise definition → renders steps
ExerciseSelector renders list
```

### Exercise Selection Flow

```
User clicks exercise in ExerciseSelector
    |
    v
store.setSelectedExercise(id)  [Zustand write]
    |
    ├── ViewerCanvas re-renders with new exercise prop
    │       |
    │       v
    │   HumanoidScene unmounts old model, mounts new (GLB already preloaded → instant)
    │   AnimationMixer created for new exercise
    │   AnimationAction plays
    │
    └── FormGuidePanel re-renders with new exercise definition
        Steps and errors update
```

### Playback Control Flow

```
User clicks Play/Pause or adjusts speed
    |
    v
store.setIsPlaying(bool) / store.setPlaybackSpeed(n)  [Zustand write]
    |
    v
HumanoidScene useEffect fires  [Zustand read]
    |
    v
AnimationAction.paused toggled  OR  AnimationMixer.timeScale updated
    |
    v
useFrame advances mixer on next tick → scene re-renders
```

### Camera Preset Flow

```
User clicks "Side View" button in ViewerControls
    |
    v
store.setActiveCamera('side')  [Zustand write]
    |
    v
ViewerCanvas useEffect fires
    |
    v
CameraControls.setLookAt(exercise.cameraHints.side) with smooth transition
```

### Animation Data Flow (Definition to Rendering)

```
ExerciseDefinition (TypeScript object, build-time)
    |
    v
modelPath → useGLTF loads GLB from /public/models/
    |
    v
GLB file contains: SkinnedMesh + Skeleton (Bone hierarchy) + AnimationClips[]
    |
    v
useAnimations extracts AnimationClips, creates AnimationMixer
    |
    v
actions[animationClipName].play()
    |
    v
Every frame: useFrame → mixer.update(delta)
    |
    v
AnimationMixer applies KeyframeTracks to Bone rotations/positions
    |
    v
Bone transforms propagate through Skeleton hierarchy (updateMatrixWorld)
    |
    v
GPU vertex shader: skinIndex + skinWeight + boneMatrix → vertex deformation
    |
    v
WebGLRenderer outputs frame to canvas
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 5 exercises (launch) | All GLBs preloaded at startup. Single static host (Netlify/Vercel free tier). No optimization needed. |
| 20-50 exercises | Switch to lazy preloading: preload on hover over exercise name. Keep startup preload for top 5. |
| 100+ exercises | Add exercise category navigation. Consider splitting exercises into dynamically-imported JS chunks by category. GLB files stay in /public/ — no backend needed. |

### Scaling Priorities

1. **First bottleneck: GLB file size.** Each GLB for a humanoid with animation can be 1-5 MB before compression. Apply Draco compression (gltfjsx --transform) to reduce 70-90%. Target <500 KB per exercise.
2. **Second bottleneck: Initial page weight.** With 20+ exercises, don't preload all GLBs at startup. Switch to intersection observer or hover-triggered preloading.

## Anti-Patterns

### Anti-Pattern 1: Hardcoded Exercise Data in Components

**What people do:** Put `if exercise === 'squat'` logic or inline arrays of form steps directly in JSX components.
**Why it's wrong:** Adding a new exercise requires modifying component code. Creates tight coupling between UI logic and content data. Makes the "easy add new movement" goal impossible.
**Do this instead:** All exercise data lives in `exercises/[name].ts`. Components only read from the registry via the store's `selectedExercise` id. Adding an exercise = create one file + one import.

### Anti-Pattern 2: Storing AnimationMixer in React State

**What people do:** `const [mixer, setMixer] = useState(new THREE.AnimationMixer(...))`.
**Why it's wrong:** React state triggers re-renders. AnimationMixer must be updated every frame via `useFrame`, not on re-renders. Storing mutable Three.js objects in state causes stale closures and double-update bugs.
**Do this instead:** Use `useRef` for the mixer, or use Drei's `useAnimations` hook which manages the mixer lifecycle correctly.

### Anti-Pattern 3: One GLB Per Pose (vs One GLB Per Exercise)

**What people do:** Export separate GLB files for each keyframe pose, then manually interpolate in JavaScript.
**Why it's wrong:** Three.js's AnimationMixer and KeyframeTrack handle interpolation natively and efficiently on the GPU. Manual JS interpolation is slower, more complex, and bypasses hardware optimization.
**Do this instead:** Export one GLB per exercise containing the complete animation as an AnimationClip with all KeyframeTracks. Let Three.js handle interpolation.

### Anti-Pattern 4: Putting GLB Files in src/ (vs public/)

**What people do:** Import GLBs as ES module assets: `import model from './squat.glb'`.
**Why it's wrong:** Vite tries to process binary files as modules. Large binaries bloat the JS bundle. Hashed filenames break predictable URLs needed for preloading.
**Do this instead:** Put all GLBs in `/public/models/`. Reference them with absolute paths: `modelPath: '/models/squat.glb'`. Vite copies public/ to dist/ verbatim.

### Anti-Pattern 5: Blocking the Main Thread with Model Loading

**What people do:** Load a GLB synchronously or without Suspense, causing the page to freeze while the file downloads.
**Why it's wrong:** Large GLBs (even compressed) take time to parse. Blocking the main thread kills frame rate during the load.
**Do this instead:** Wrap `HumanoidScene` in `<Suspense fallback={<LoadingSpinner />}>`. Preload all starter GLBs on app init with `useGLTF.preload()` so they are cached before the user clicks.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Vercel / Netlify | Static deploy: `vite build` output to dist/, zero config | GLBs in /public/ are served as static assets with CDN caching |
| Mixamo (model source) | One-time workflow: download FBX, import to Blender, export GLB | Not a runtime dependency — GLBs are pre-built assets |
| Blender (animation authoring) | One-time workflow per exercise: rig, animate, export GLB | Developer tool, not runtime |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| ExerciseSelector <-> Store | Zustand actions (write only) | Selector knows nothing about 3D or form content |
| HumanoidScene <-> Store | Zustand selectors (read only) | Scene reads playback state, never writes exercise selection |
| FormGuidePanel <-> Registry | Direct import from exercises/index.ts | Panel reads definition by id from store, no 3D knowledge |
| ViewerCanvas <-> HumanoidScene | React component tree (parent/child) | Canvas provides R3F context; Scene owns animation lifecycle |
| HumanoidScene <-> GLB files | useGLTF hook (HTTP fetch, cached) | Decoupled by modelPath string in definition |

## Build Order Implications

Based on the component dependency graph, phases should be built bottom-up:

1. **Types + Registry first** — `ExerciseDefinition` interface and at least one exercise definition. Everything else depends on this shape.
2. **Zustand store second** — App state is needed before any UI component is wired. Can be tested in isolation.
3. **Static layout third** — App.tsx 3-column layout, ExerciseSelector, FormGuidePanel with mock data. Validates UX before 3D.
4. **Basic 3D viewer fourth** — ViewerCanvas + static humanoid model (no animation). Establishes WebGL pipeline, OrbitControls, resize handling.
5. **Animation pipeline fifth** — HumanoidScene with AnimationMixer, useAnimations, looping. This is the core technical challenge.
6. **Playback controls sixth** — Play/pause/speed controls wired to store. Camera presets.
7. **Exercise switching seventh** — Wire ExerciseSelector → store → HumanoidScene model swap. Preloading strategy.
8. **Polish and content eighth** — All 5 exercises fully authored, form content complete, loading states, responsive layout.

## Sources

- [Three.js Animation System (official manual)](https://threejs.org/manual/en/animation-system.html) — HIGH confidence. AnimationClip, AnimationMixer, KeyframeTrack architecture.
- [Three.js Skeletal Animation & Skinning (DeepWiki/mrdoob)](https://deepwiki.com/mrdoob/three.js/5.2-skeletal-animation-and-skinning) — HIGH confidence. Bone, Skeleton, SkinnedMesh data flow.
- [React Three Fiber Animation Techniques (DeepWiki/pmndrs)](https://deepwiki.com/pmndrs/react-three-fiber/4.3-animation-techniques) — HIGH confidence. useFrame, useAnimations patterns.
- [React Three Fiber Loading Models (official docs)](https://docs.pmnd.rs/react-three-fiber/tutorials/loading-models) — HIGH confidence. useGLTF, Suspense, preload patterns.
- [Building 3D Viewers in the Browser: Three.js Implementation Guide (AlterSquare)](https://altersquare.io/building-3d-viewers-in-the-browser-threejs-implementation-guide/) — MEDIUM confidence. Core architectural components.
- [Three.js AnimationMixer docs](https://threejs.org/docs/#api/en/animation/AnimationMixer) — HIGH confidence. Official API.
- [gltfjsx (pmndrs)](https://github.com/pmndrs/gltfjsx) — MEDIUM confidence. GLB compression and JSX generation workflow.
- [Vite Static Asset Handling](https://vite.dev/guide/assets) — HIGH confidence. /public/ directory patterns.
- [Three.js forum: animate 3D human from JSON data](https://discourse.threejs.org/t/to-animate-3d-human-model-with-this-kinda-json-data/52228) — MEDIUM confidence. Manual bone mapping approach.

---
*Architecture research for: Browser-based 3D exercise form guide (FormCheck)*
*Researched: 2026-02-23*
