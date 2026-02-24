# Adding a New Exercise to FormCheck

This guide explains how to add a new exercise to the FormCheck exercise registry. Follow these steps to create a fully typed exercise with a 3D animation.

---

## Step 1: Create the exercise file

Create a new file at `src/exercises/{exercise-id}.ts` (e.g. `src/exercises/lunge.ts`).

## Step 2: Import the required types and utilities

```typescript
import * as THREE from 'three'
import { buildQuatTrack, buildClip } from '../animation/keyframe-utils'
import { JointName } from '../mannequin/mannequin.types'
import type { MannequinRig } from '../mannequin/MannequinBuilder'
import type { ExerciseDefinition } from './types'
```

## Step 3: Define the `buildAnimation` function

The function receives the live `MannequinRig` (with all joints named and accessible) and returns an `AnimationClip`.

```typescript
function buildLungeClip(_rig: MannequinRig): THREE.AnimationClip {
  // Each track targets one joint — use JointName enum values as the path prefix
  const lHipTrack = buildQuatTrack(`${JointName.l_hip}.quaternion`, [
    // { time: seconds, x: degrees, y: degrees, z: degrees }
    // Angles use ZYX Euler order (biomechanical convention)
    { time: 0.0, x: 0,  y: 0, z: 0 },  // standing (start / loop end — must match)
    { time: 1.0, x: 90, y: 0, z: 0 },  // bottom position
    { time: 2.0, x: 0,  y: 0, z: 0 },  // back to standing (seamless loop)
  ])

  // Add more joints as needed...

  const tracks = [lHipTrack /*, other tracks */]

  return buildClip('lunge', tracks, 2.0) // last arg: total duration in seconds
}
```

## Step 4: Export the exercise definition

```typescript
export const lunge: ExerciseDefinition = {
  id: 'lunge',           // must be unique — used as registry key
  name: 'Lunge',         // display name shown in UI

  primaryMuscles: ['quads', 'glutes'],
  secondaryMuscles: ['hamstrings', 'calves', 'core'],

  difficulty: 'beginner', // 'beginner' | 'intermediate' | 'advanced'

  formSteps: [
    // 3-5 concise coaching cues (< 80 chars each)
    'Stand tall with feet hip-width apart',
    'Step forward and lower until rear knee nearly touches the floor',
    'Front knee stays above ankle, not past your toes',
    'Drive through the front heel to return to standing',
  ],

  commonMistakes: [
    // Minimum 2 — format: "Mistake — correction"
    'Front knee caving inward — keep it tracking over your second toe',
    'Torso leaning too far forward — keep your chest up and core braced',
  ],

  hasGhostEquipment: false, // set true when Phase 3 adds ghost equipment support

  buildAnimation: buildLungeClip,
}
```

## Step 5: Register the exercise

Open `src/exercises/registry.ts` and add the new exercise:

```typescript
import { squat } from './squat'
import { lunge } from './lunge'   // 1. add import

export const exerciseRegistry = new Map<string, ExerciseDefinition>([
  [squat.id, squat],
  [lunge.id, lunge],              // 2. add to Map
])
```

## Step 6: Verify the animation

Run the dev server and check your exercise:

```bash
npm run dev
```

Open the browser at the URL shown. The mannequin should play your animation on loop.

**Things to check:**
- Animation plays smoothly without jumps
- The first and last keyframe poses are identical (seamless loop)
- No console errors about missing bone names or track mismatches
- Joint angles look biomechanically plausible

---

## Reference: Available JointName values

Use these as the `bonePath` prefix in `buildQuatTrack`. The full path is `${JointName.xxx}.quaternion`.

| JointName constant   | String value   | Controls                  |
|----------------------|----------------|---------------------------|
| `JointName.pelvis`   | `pelvis`       | Root — whole-body tilt    |
| `JointName.spine`    | `spine`        | Lumbar spine lean         |
| `JointName.chest`    | `chest`        | Thoracic spine / chest    |
| `JointName.neck`     | `neck`         | Neck                      |
| `JointName.head`     | `head`         | Head                      |
| `JointName.l_shoulder` | `l_shoulder` | Left shoulder abduct/flex |
| `JointName.l_elbow`  | `l_elbow`      | Left elbow flex           |
| `JointName.l_wrist`  | `l_wrist`      | Left wrist                |
| `JointName.r_shoulder` | `r_shoulder` | Right shoulder            |
| `JointName.r_elbow`  | `r_elbow`      | Right elbow flex          |
| `JointName.r_wrist`  | `r_wrist`      | Right wrist               |
| `JointName.l_hip`    | `l_hip`        | Left hip flex/abduct      |
| `JointName.l_knee`   | `l_knee`       | Left knee flex            |
| `JointName.l_ankle`  | `l_ankle`      | Left ankle dorsiflexion   |
| `JointName.r_hip`    | `r_hip`        | Right hip flex/abduct     |
| `JointName.r_knee`   | `r_knee`       | Right knee flex           |
| `JointName.r_ankle`  | `r_ankle`      | Right ankle dorsiflexion  |

## Keyframe angle conventions

- **Positive X** = forward flexion (hip/knee bending as in a squat)
- **Negative X** = extension or dorsiflexion (e.g. ankle moving shin forward)
- **Y** = abduction / adduction or axial rotation depending on joint
- **Z** = external/internal rotation (use for knee tracking, toe-out angles)
- **Euler order**: ZYX (biomechanical convention — matches how joints are measured clinically)
- **All angles are in degrees** — `buildQuatTrack` converts them to quaternions internally

## Loop seamlessness requirement

The final keyframe `{ time: duration, ... }` **must have the same angles as the first keyframe** `{ time: 0.0, ... }`. If they differ, the animation will pop/jump when it restarts.

---

*FormCheck v0.1 — Phase 1 Foundation*
