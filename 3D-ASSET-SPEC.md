# 3D Asset Specification — FormCheck Exercise Models

This document defines the requirements for GLB model files used in FormCheck exercise animations.

## File Format

- **Format**: GLB (binary glTF 2.0)
- **Compression**: Optionally Draco-compressed (run through `npm run compress-glb` / `gltf-transform draco`)

## Naming & Placement

- **Naming convention**: `{exercise-id}.glb` — must match the `id` field in the exercise's `ExerciseDefinition`
- **Directory**: `public/models/exercises/`
- **Example**: The squat exercise (`id: 'squat'`) expects `public/models/exercises/squat.glb`

## Scene Requirements

- Single root node containing the entire model
- Model centered at world origin (0, 0, 0)
- Standing height approximately **1.75 m** (matching the procedural mannequin)
- Model faces **-Z** (standard glTF forward direction)
- Y-up coordinate system (glTF default)

## Skeleton

- Can use **any bone naming convention** — the GLB carries both the skinned mesh and its own skeleton, so no name-matching with the procedural mannequin is needed
- Must be a properly rigged skinned mesh with vertex weights

## Animation Requirements

- At least **one embedded AnimationClip** in the GLB file
- Animation should loop seamlessly (first frame ≈ last frame)
- Target duration: **2–4 seconds** per repetition
- The default clip (first in the file) is played unless `animationClipName` is specified in the exercise definition
- Include root motion (pelvis translation) where appropriate — unlike the procedural mannequin, GLB animations can translate the root bone freely

## Materials

- Use **MeshStandardMaterial** (glTF PBR metallic-roughness)
- Base color: neutral gray (`#808080` or similar)
- Roughness: **~0.85**
- Metalness: **0.0**
- This matches the current procedural mannequin's visual style

## Performance Budgets

| Metric | Target |
|--------|--------|
| Triangle count | < 10,000 per model |
| File size (after Draco) | < 500 KB per model |
| Total exercise assets (Phase 5) | < 5 MB |

## Compression Pipeline

The repo includes `gltf-transform` as a dev dependency. To Draco-compress a GLB:

```bash
npx gltf-transform draco input.glb output.glb
```

Or use the npm script:

```bash
npm run compress-glb input.glb output.glb
```

## Blender Export Settings

When exporting from Blender:

1. **File → Export → glTF 2.0 (.glb/.gltf)**
2. **Format**: glTF Binary (`.glb`)
3. **Include**:
   - ✅ Animations
   - ✅ Skinning (if using armature)
4. **Transform**:
   - ✅ +Y Up (default)
5. **Animation**:
   - ✅ Export all actions (or select the specific action)
   - ✅ Always Sample Animations
   - Sampling Rate: 1 (every frame)
6. **Mesh**:
   - ✅ Apply Modifiers
   - ✅ UVs, Normals
7. **Material**:
   - Keep default PBR settings

## Testing

1. Place the GLB file at `public/models/exercises/{exercise-id}.glb`
2. In the exercise definition file (e.g. `src/exercises/squat.ts`), uncomment or add:
   ```ts
   modelPath: '/models/exercises/{exercise-id}.glb',
   ```
3. Run `npm run dev`
4. The app should load and animate the GLB model instead of the procedural mannequin

## Mixamo Workflow

[Mixamo](https://www.mixamo.com/) can be used as a starting point:

1. Upload a character or use a Mixamo character
2. Browse/search for the exercise animation
3. Download as **FBX Binary** (with skin)
4. Import into Blender, adjust timing/position, re-export as GLB
5. Run through the Draco compression pipeline
