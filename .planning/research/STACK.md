# Stack Research

**Domain:** Browser-based 3D exercise form visualization (static site)
**Researched:** 2026-02-23
**Confidence:** MEDIUM-HIGH (core stack HIGH, animation pipeline MEDIUM)

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Three.js | 0.183.x (`r183`) | WebGL 3D rendering engine | The dominant browser 3D library. Massive ecosystem, 100k+ GitHub stars, excellent GLTF/GLB support, built-in AnimationMixer for skeletal playback, OrbitControls addon, TypeScript types included. WebGPU renderer is maturing in this version but WebGL renderer is stable and production-ready. |
| Vite | 6.x (latest 6.x; v7 also released) | Build tool / dev server | The de facto standard for browser-side TypeScript projects in 2025. Instant HMR, native ESM, sub-50ms hot reload. Outputs optimized static bundles that deploy directly to Netlify/Vercel. Official Three.js community uses Vite-based templates. |
| TypeScript | 5.x | Language | Three.js ships official `@types/three` (bundled). TypeScript catches bone hierarchy mismatches and animation API misuse at compile time — critical when writing bone rotation quaternions by hand. |
| Tailwind CSS | 4.x | UI styling | v4 released January 2025; CSS-first config, 5x faster builds, no config file needed. Ideal for the dark-themed panel layout described in PROJECT.md. No runtime JS overhead — generates static CSS. |

### 3D / Animation Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Three.js GLTFLoader | bundled with `three` (addons) | Load `.glb` humanoid models at runtime | Always — `import 'three/addons/loaders/GLTFLoader.js'`. Standard for loading Mixamo/Quaternius humanoid rigs. |
| Three.js AnimationMixer | bundled with `three` | Skeletal animation playback, speed control, looping | Always — drives the play/pause/speed controls in PROJECT.md. Works with both pre-baked clips and programmatically-generated AnimationClips. |
| Three.js OrbitControls | bundled with `three` (addons) | Click-drag orbit, scroll zoom, camera presets | Always — `import 'three/addons/controls/OrbitControls.js'`. Handles all camera interaction requirements from PROJECT.md out of the box. |
| Three.js QuaternionKeyframeTrack | bundled with `three` | Build animation clips from code, no mocap needed | Core to the animation pipeline — lets you define bone rotations at keyframe times in pure JavaScript, creating AnimationClips without any external animation file. |
| @react-three/fiber | n/a — NOT recommended | — | Do not use R3F for this project. PROJECT.md specifies a single static HTML page with no routing. React adds ~40KB and component overhead for a viewer that doesn't benefit from React's reconciler. Vanilla Three.js + Vite is simpler and faster here. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `lil-gui` | 0.19.x | Debug UI for tuning bone keyframes | Development only — add to devDependencies. Attach sliders to bone rotations to dial in animation poses without reloading. Remove or tree-shake from production build. |
| `stats.js` | 0.17.x | FPS monitor overlay | Development only — confirm 60fps with WebGL renderer during animation development. |
| `@types/three` | bundled with `three` since r152 | TypeScript types | Included automatically; no separate install needed since Three.js r152 bundles its own types. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Vite | Dev server + production build | `vite dev` for HMR, `vite build` outputs static `dist/` folder ready for Netlify/Vercel drag-and-drop. |
| Blender (external, free) | Convert FBX assets to GLB; adjust rigs | Mixamo exports FBX; Blender batch-converts to GLB with animations baked. One-time pipeline step per model. |
| Mixamo (Adobe, free) | Source pre-made exercise animation clips | Free, royalty-free for commercial use. Covers squat, deadlift, bench-press adjacent animations. Download FBX → convert in Blender → ship as `.glb`. |
| Quaternius (CC0 assets) | Source free rigged humanoid mannequin | CC0 license (public domain). Universal Base Characters pack includes GLB/FBX humanoid rigs compatible with Mixamo retargeting. No attribution required. |

---

## The Animation Pipeline Decision

This is the hardest technical decision in the project. There are three viable approaches:

### Option A: Mixamo Animations + Blender Conversion (RECOMMENDED for v1)

**What:** Download free exercise animations from Mixamo, batch-convert FBX to GLB in Blender, ship GLB files with embedded AnimationClips. Three.js AnimationMixer plays them back.

**Rationale:** Mixamo has squat, deadlift, push-up, plank, and bench-press-adjacent animations. Free for commercial use. GLB with embedded animation is the standard Three.js workflow. This gets the project to a working viewer in days, not weeks.

**Confidence:** HIGH — this is the established pattern used by the Three.js community.

**Constraint:** Requires a Blender conversion step per new exercise. This is the "dev workflow for adding new movements" called out in PROJECT.md.

### Option B: Programmatic AnimationClip from Bone Keyframes

**What:** Use `QuaternionKeyframeTrack` to define bone rotations at specific timestamps in JavaScript code, then create an `AnimationClip` without any external file.

```typescript
import * as THREE from 'three';

// Example: knee flexion for squat
const times = [0, 0.5, 1.0, 1.5, 2.0];

const kneeRotation = new THREE.QuaternionKeyframeTrack(
  'mixamorigLeftLeg.quaternion',  // bone name path
  times,
  [
    // standing: no rotation
    0, 0, 0, 1,
    // descending: ~90 deg knee flex
    0.707, 0, 0, 0.707,
    // bottom position
    0.866, 0, 0, 0.5,
    // ascending
    0.707, 0, 0, 0.707,
    // standing again
    0, 0, 0, 1,
  ]
);

const clip = new THREE.AnimationClip('squat', 2.0, [kneeRotation, /* ...other bones */]);
```

**Rationale:** No external assets. Animation definitions live in version-controlled `.ts` files. Adding new exercises = adding new `.ts` files. Perfectly aligned with the "programmatic approach" requirement in PROJECT.md.

**Constraint:** Getting natural-looking quaternion values requires experimentation per bone per pose. Use `lil-gui` sliders in development to tune values visually. Time-intensive for 5 exercises but doable.

**Confidence:** MEDIUM — the API is stable and documented, but hand-authored quaternions for realistic exercise biomechanics requires effort.

### Option C: Hybrid (RECOMMENDED for scalability)

**What:** Use Mixamo animations for v1 (fast path to working product), build a data-driven keyframe format (`exercises/squat.ts` exports bone tracks) for new exercises that don't have Mixamo equivalents.

**Rationale:** Ship fast with Mixamo. When v2 needs sport-specific movements not in Mixamo's library, the programmatic system is already scaffolded. Best of both worlds.

**Confidence:** MEDIUM — assumes the Mixamo rig bone names stay consistent with the programmatic approach.

---

## Installation

```bash
# Core
npm install three

# Dev dependencies
npm install -D vite typescript tailwindcss @tailwindcss/vite lil-gui stats.js

# Three.js types are bundled with three — no @types/three needed separately
```

**Vite config for Three.js + Tailwind v4:**

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
  // GLB files in /public/ are served at root; reference as '/models/squat.glb'
  // Vite copies /public to /dist automatically
});
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Three.js (vanilla) | React Three Fiber (R3F) | Use R3F if the project grows to a multi-page React app with complex state management. For a single-page static viewer, vanilla Three.js is less overhead. |
| Three.js | Babylon.js | Use Babylon.js for game-engine-level features (physics, particle systems, built-in GUI editor). Babylon is more opinionated and has more built-in tools, but Three.js has a larger ecosystem and more tutorials for the animation retargeting workflow this project needs. |
| Vite | webpack / Parcel | Use webpack only if the team has existing webpack expertise and tooling. Vite is faster and simpler for new projects in 2025. |
| Tailwind CSS | CSS Modules / vanilla CSS | Use CSS Modules if the team dislikes utility-first CSS. For a dark-themed single-page layout, Tailwind's utility classes are faster to write and maintain. |
| Mixamo (free) | Rokoko / DeepMotion | Use Rokoko/DeepMotion if you need to generate novel exercise animations from video or AI. Both cost money. Mixamo is free and covers the starter exercises in PROJECT.md. |
| GLB (binary GLTF) | FBX | Never use FBX directly in Three.js. FBX support via FBXLoader is less robust than GLTFLoader. Always convert to GLB via Blender. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| React Three Fiber | Adds React dependency and JSX overhead for a single-page static viewer that has no component tree to manage. Increases bundle size ~40KB and adds reconciler complexity. | Vanilla Three.js with Vite |
| FBX directly in Three.js | Three.js FBXLoader is less maintained than GLTFLoader. FBX is a proprietary format with inconsistent animation export. Community consistently recommends converting to GLB. | GLTFLoader + GLB files |
| A-Frame | Built on top of Three.js but abstracts away the AnimationMixer API you need for custom playback control. No meaningful advantage here. | Vanilla Three.js |
| Three.js CDN (no bundler) | No tree-shaking, no TypeScript, slow loading, harder to manage versions. The ecosystem has moved fully to npm + bundler. | Vite + npm |
| Pre-built mocap libraries (commercial) | PROJECT.md explicitly requires avoiding commercial mocap licensing costs. | Mixamo (free) + programmatic keyframes |
| WebGPU renderer (yet) | Three.js WebGPU renderer is still maturing in r183. Performance regressions reported. The WebGL renderer is production-stable and sufficient for a humanoid viewer. | Default Three.js WebGL renderer |

---

## Stack Patterns by Variant

**If adding a new exercise that Mixamo covers:**
- Download FBX from Mixamo
- Import into Blender, export as GLB with animation baked
- Drop GLB into `/public/models/`
- Add exercise data object in `/src/exercises/`
- No code changes to the viewer

**If adding an exercise Mixamo does NOT cover:**
- Define bone keyframe tracks as TypeScript constants in `/src/exercises/[name].ts`
- Use `QuaternionKeyframeTrack` per moving bone
- Use `lil-gui` in dev mode to visually tune rotation values
- Create `AnimationClip` from tracks, pass to same `AnimationMixer` the viewer already uses

**If the humanoid model needs replacing:**
- Use Quaternius Universal Base Characters (CC0) or Ready Player Me sample male GLB as drop-in
- Bone names must match the track paths in programmatic animations (Mixamo rig naming convention is standard)

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `three@0.183.x` | Vite 6.x, TypeScript 5.x | Types bundled since r152. Import addons from `'three/addons/...'` (not legacy `'three/examples/...'`). |
| `tailwindcss@4.x` | Vite 6.x via `@tailwindcss/vite` plugin | v4 uses CSS-based config. No `tailwind.config.js` required. Install `@tailwindcss/vite` as Vite plugin. |
| Vite 6.x | Node.js 20.19+ | Node 18 EOL was April 2025. Use Node 20 or 22. |
| Mixamo GLB (after Blender conversion) | Three.js r150+ | Mixamo uses standard humanoid bone naming. Works with SkeletonUtils.retarget() if needed. |

---

## Sources

- [https://www.npmjs.com/package/three](https://www.npmjs.com/package/three) — Confirmed `0.183.1` as latest (published ~2 days before research date) — HIGH confidence
- [https://github.com/mrdoob/three.js/releases](https://github.com/mrdoob/three.js/releases) — Three.js release history — HIGH confidence
- [https://threejs.org/docs/#api/en/animation/AnimationClip](https://threejs.org/docs/#api/en/animation/AnimationClip) — Official API for programmatic AnimationClip creation — HIGH confidence
- [https://threejs.org/docs/#api/en/animation/AnimationMixer](https://threejs.org/docs/#api/en/animation/AnimationMixer) — Official AnimationMixer docs — HIGH confidence
- [https://threejs.org/docs/pages/OrbitControls.html](https://threejs.org/docs/pages/OrbitControls.html) — OrbitControls addon docs — HIGH confidence
- [https://vite.dev/blog/announcing-vite6](https://vite.dev/blog/announcing-vite6) — Vite 6 release; v7 also confirmed — HIGH confidence
- [https://tailwindcss.com/blog/tailwindcss-v4](https://tailwindcss.com/blog/tailwindcss-v4) — Tailwind v4 release, January 2025 — HIGH confidence
- [https://helpx.adobe.com/creative-cloud/faq/mixamo-faq.html](https://helpx.adobe.com/creative-cloud/faq/mixamo-faq.html) — Mixamo commercial license: royalty-free for commercial use — HIGH confidence
- [https://quaternius.com/packs/universalbasecharacters.html](https://quaternius.com/packs/universalbasecharacters.html) — Quaternius Universal Base Characters, CC0 license, GLB/FBX — MEDIUM confidence (via WebSearch, official site)
- [https://quaternius.itch.io/universal-animation-library](https://quaternius.itch.io/universal-animation-library) — Universal Animation Library, 120+ animations, CC0 — MEDIUM confidence
- [https://www.npmjs.com/package/@react-three/fiber](https://www.npmjs.com/package/@react-three/fiber) — R3F 9.5.0 latest; confirmed actively maintained but unnecessary here — HIGH confidence
- [https://discourse.threejs.org/t/deploy-three-js-3d-model-to-netlify-but-models-didnt-load-404/34101](https://discourse.threejs.org/t/deploy-three-js-3d-model-to-netlify-but-models-didnt-load-404/34101) — GLB path 404 on Netlify: use `/public/` directory in Vite so Vite copies assets correctly — MEDIUM confidence (community forum)
- [https://deepwiki.com/mrdoob/three.js/5.2-skeletal-animation-and-skinning](https://deepwiki.com/mrdoob/three.js/5.2-skeletal-animation-and-skinning) — Skeletal animation pipeline details — MEDIUM confidence

---

*Stack research for: FormCheck — 3D Exercise Form Guide (browser-based WebGL viewer)*
*Researched: 2026-02-23*
